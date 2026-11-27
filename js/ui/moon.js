// Månvyn (#1527, beslut docs/beslut/2026-11-14-rymden-forsta-steget.md): en platt, schematisk karta över månen i en dialog, med
// platsen för en händelse markerad. Etapp 1: inget månklot, ingen ny renderingsväg och inget eget läge. Dialogen är en yta i
// stängregistret (js/surfaces.js, gruppen dialog), som main.js anmäler: en öppnad dialog stänger de andra dialogerna och pausar
// uppspelningen, och Escape stänger den centralt. Escape och knappen Tillbaka till jorden gör samma sak (close).
//
// Data: posten i data/rymd.json (eventId, body, coord = [längd, bredd] i selenografiska grader, östlig längd positiv) och kartan i
// maps.moon (ekvirektangulär, längd −180 till 180, bredd 90 till −90). Bilden laddas först när dialogen öppnas (lazy). Går den inte
// att ladda visas en lugn text, och platsen står ändå i listan.
//
// Tillgänglighet: fokus går till rubriken vid öppning och tillbaka till knappen Visa på månen vid stängning. Kartan är en bild med
// role="img" och ett textalternativ, och platserna står i en lista med riktiga knappar. Raden aria-live i dialogen säger vad som visas
// (statusraden för hela sidan ligger utanför den modala dialogen). Tab stannar i dialogen. Toningen stängs av vid prefers-reduced-motion
// och Lugn rörelse (css/style.css).
//
// Medan månvyn är öppen döljs faktarutan och Samtidigt-kortet (klassen moon-open på #app), så att ett kort visas i taget; de kommer
// tillbaka oförändrade när man går tillbaka till jorden.
import { t, formatYear, reviewLabel } from '../model.js';
import { ui, LANG, langAttr, textLang } from '../i18n.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NUM_LOCALE = LANG === 'en' ? 'en-GB' : LANG;

/** Var på en ekvirektangulär karta en punkt [längd, bredd] ligger, i procent av kartans bredd och höjd (bounds = [väst, syd, öst, nord]). */
export function mapPosition([lon, lat], bounds = [-180, -90, 180, 90]) {
  const [w, s, e, n] = bounds;
  return { x: ((lon - w) / (e - w)) * 100, y: ((n - lat) / (n - s)) * 100 };
}

/** Koordinaten som text, till exempel "0,67° N, 23,47° Ö", med språkets decimaltecken och väderstreck. */
export function formatCoord([lon, lat], digits = 2) {
  const f = new Intl.NumberFormat(NUM_LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return ui('space.coord', {
    lat: f.format(Math.abs(lat)), ns: ui(lat < 0 ? 'space.south' : 'space.north'),
    lon: f.format(Math.abs(lon)), ew: ui(lon < 0 ? 'space.west' : 'space.east'),
  });
}

export class MoonView {
  /**
   * els: root (dialogen), title (rubriken, tar fokus), body (innehållet), back (Tillbaka till jorden), live (raden aria-live i dialogen),
   * app (#app, får klassen moon-open). srcById: källregistret (fylls i när källorna har laddats).
   */
  constructor({ root, title, body, back, live, app }, { srcById }) {
    Object.assign(this, { root, title, body, back, live, app, srcById });
    this.opener = null;
    this.onClose = null;
    back.addEventListener('click', () => this.close(true));
    // Tab stannar i dialogen (aria-modal): från sista till första och tvärtom
    root.addEventListener('keydown', ev => {
      if (ev.key !== 'Tab') return;
      const items = [...root.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')].filter(el => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1], at = document.activeElement;
      if (ev.shiftKey && (at === first || at === this.title)) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && at === last) { ev.preventDefault(); first.focus(); }
    });
  }

  get isOpen() { return !this.root.hidden; }

  /**
   * Öppna månvyn för händelsen e med posten item och kartan map (maps[item.body] i data/rymd.json). year är jordens år som visas
   * (tidslinjen styr oförändrat, beslutet punkt 4). opener är knappen som fokus går tillbaka till (eller en funktion som hittar den).
   */
  open({ event: e, item, map, year, opener }) {
    this.opener = opener;
    const pos = mapPosition(item.coord, map.bounds);
    const coord = formatCoord(item.coord);
    const type = ui(`space.type.${item.placeType}`);
    // Mitt i en mening med liten bokstav ("Markerad plats: Statio Tranquillitatis, landningsplats"); tyskans substantiv behåller versalen
    const typeInline = LANG === 'de' ? type : type.charAt(0).toLocaleLowerCase(LANG) + type.slice(1);
    const name = t(item.name);
    const srcs = (item.sources ?? []).map(id => this.srcById[id] && { ...this.srcById[id], id }).filter(Boolean);
    const credit = ui('space.mapCredit', { credit: map.credit, license: map.license });
    this.title.textContent = t(e.title);
    const titleLang = textLang(e.title); // rubriken på ett reservspråk får lang (#1308)
    if (titleLang && titleLang !== LANG) this.title.setAttribute('lang', titleLang); else this.title.removeAttribute('lang');
    this.body.innerHTML = `
      <p class="moon-year">${esc(ui('space.year', { year: formatYear(Math.round(year)) }))}</p>
      <figure class="moon-map">
        <div class="moon-frame" role="img" aria-label="${esc(ui('space.mapAlt', { places: `${name}, ${typeInline}, ${coord}` }))}">
          <img class="moon-img" alt="" width="${map.width}" height="${map.height}" decoding="async" hidden>
          <span class="moon-marker" data-moon-marker="${esc(item.id)}" style="left:${pos.x.toFixed(3)}%;top:${pos.y.toFixed(3)}%" aria-hidden="true"></span>
        </div>
        <p class="moon-loading" data-moon-loading>${esc(ui('space.loading'))}</p>
        <p class="moon-missing" data-moon-missing hidden>${esc(ui('space.missing'))}</p>
        <figcaption><span${langAttr(map.caption)}>${esc(t(map.caption))}</span> <span class="moon-credit">${esc(credit)}</span></figcaption>
      </figure>
      <h3 class="moon-places-title">${esc(ui('space.places'))}</h3>
      <ul class="moon-places">
        <li><button type="button" class="moon-place" data-moon-place="${esc(item.id)}">
          <span class="moon-place-name"${langAttr(item.name)}>${esc(name)}</span>
          <span class="moon-place-meta">${esc(type)} · ${esc(coord)}</span>
        </button></li>
      </ul>
      <p class="moon-summary"${langAttr(item.summary)}>${esc(t(item.summary))}</p>
      <p class="moon-note">${esc(ui('space.noTime'))}</p>
      <div class="src">${esc(ui('detail.source'))} ${srcs.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(', ') || esc(ui('detail.sourceMissing'))}</div>
      <p class="moon-review">${esc(reviewLabel(item.review, 'Platsen på månen'))}</p>`;
    // Kartan laddas först nu (lazy). Fel eller offline: en lugn text, och listan och Tillbaka till jorden fungerar ändå
    const img = this.body.querySelector('.moon-img'), loading = this.body.querySelector('[data-moon-loading]');
    const frame = this.body.querySelector('.moon-frame');
    img.addEventListener('load', () => { if (!img.naturalWidth) return img.dispatchEvent(new Event('error')); img.hidden = false; loading.hidden = true; frame.classList.add('moon-loaded'); }, { once: true });
    img.addEventListener('error', () => {
      loading.hidden = true;
      frame.hidden = true;
      this.body.querySelector('[data-moon-missing]').hidden = false;
      this.say(ui('space.missing'));
    }, { once: true });
    img.src = map.file;
    // Platsens knapp i listan: markerar platsen på kartan (en kort puls) och säger var den ligger
    for (const b of this.body.querySelectorAll('[data-moon-place]')) {
      b.addEventListener('click', () => {
        const marker = this.body.querySelector(`[data-moon-marker="${CSS.escape(b.dataset.moonPlace)}"]`);
        marker?.classList.remove('moon-pulse');
        void marker?.offsetWidth; // starta om pulsen
        marker?.classList.add('moon-pulse');
        this.say(ui('space.placeSaid', { name, type: typeInline, coord }));
      });
    }
    this.app?.classList.add('moon-open');
    this.root.hidden = false; // stängregistret märker öppnandet (surfaces.watch) och stänger andra dialoger
    this.body.scrollTop = 0;
    this.title.focus({ preventScroll: true });
    this.say(ui('space.announce', { name, type: typeInline }));
  }

  /** Säg något i dialogens egen rad aria-live (töms först, så att samma text kan läsas igen). */
  say(text) {
    this.live.textContent = '';
    requestAnimationFrame(() => { this.live.textContent = text; });
  }

  /**
   * Stäng månvyn: samma för Escape och Tillbaka till jorden. Faktarutan och Samtidigt-kortet visas igen. refocus: fokus går tillbaka
   * till knappen Visa på månen (stängregistret anropar close(false) när en annan dialog öppnas, och då flyttas inte fokus).
   */
  close(refocus = true) {
    if (this.root.hidden) return;
    this.root.hidden = true;
    this.app?.classList.remove('moon-open');
    this.live.textContent = '';
    const img = this.body.querySelector('.moon-img');
    if (img && !img.complete) img.removeAttribute('src'); // avbryt en hämtning som pågår
    const opener = typeof this.opener === 'function' ? this.opener() : this.opener;
    if (refocus && opener?.isConnected) opener.focus({ preventScroll: true });
    this.onClose?.();
  }
}
