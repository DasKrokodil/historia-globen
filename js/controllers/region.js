// Regionvyn (#1641, steg 1a av #1627): knappen "Visa i regionvy" i kortet för en liten plats (upp till cirka 5 grader på marken,
// i dag Skåne och Danmark; js/region-frame.js) ger en skarp, inzoomad karta över platsen och den närmaste omgivningen, med en
// sluten kantlinje i skärmpixlar och omgivningen nedtonad. Större platser ramas in i Platt vy som förut (controllers/places.js).
//
// Vyn hör till platsen man följer: den lämnas med knappen "Lämna regionvyn", med Escape (när inget ligger ovanpå: menyer,
// dialoger, kortet), när man slutar följa platsen, när en tur eller adress ställer kartan och när Platt vy stängs. Återställ
// ramar in platsen igen. Knappen och Escape ställer tillbaka vyn man kom från, med kameran (#1864): globen om man kom från den
// (också när regionvyn öppnades i Platt vy), annars Platt karta som den stod. Statusraden säger vilken plats som visas och att bara
// platsens gräns och händelser visas (ritningen och skälen: js/ui/flatmap.js, docs/beslut/2026-11-14-regionvy-steg-1a-1641.md).
// Ramen räknas ur platsens gräns (placeBounds), inte ur ett fält i datan, och lägger platsen i den del av kartan som kortet, arket, fokusraden och vyns egen ruta inte täcker.
//
// Markörerna (#1642, steg 1b): platsens händelser får numrerade markörer, där numret är raden i listan "Händelser på platsen" i
// kortet (raderna får samma nummer medan vyn är öppen). Händelser som gäller hela platsen (`scope: "place"`, #1674) står i brickan "Hela Skåne", markörer på
// samma ställe i en hög som fälls ut, och ortnamnen (data/ortnamn/<plats>.json) laddas när vyn öppnas (js/ui/region-marks.js).
// Kartan visar bara det som har börjat vid årets tid, listan hela historien med samma nummer (#1786). Lista och karta hör ihop: en rad i fokus eller under musen markerar markören, en markerad markör ger raden en ram, och Escape
// fäller först ihop en utfälld hög.
//
// Globflyget (#1644, steg 2): en stor plats (Aotearoa och Grönland; fler än 15 och högst 60 grader på marken, js/region-frame.js)
// får regionvyn på globen i stället: globen flyger in med ett smalt synfält och lägger platsen mitt i den fria ytan (Globe.setRegion),
// med samma ruta, markörer, bricka, högar, ortnamn, lista och vägar ut som i Platt vy (js/ui/globe-region.js). Sverige väntar på
// DasKrokodils bedömning och ramas in i Platt vy som förut (beslut 2026-11-15).
import { placeBounds } from '../place-geo.js';
import { regionEligible, regionSize, freeArea, globeRegionEligible, globeFrame, MIN_FREE, hasRoom, regionButtonKey } from '../region-frame.js';
import { GlobeRegion } from '../ui/globe-region.js';
import { regionItems, startedBy } from '../region-markers.js';
import { visibleEvents, flatAction } from '../focus/place.js';
import { OVERLAY_IDS } from '../surfaces.js';
import { t, loadOrtnamn, pluralUi, loadedPlaces, formatEventTime } from '../model.js';
import { ui } from '../i18n.js';
import { say } from '../ui/status.js';

/** Arket i mobil fälls ihop med en övergång: ramen räknas om när den är klar, om man inte har flyttat kartan under tiden. */
const REFIT_MS = 450;
/** Luft mellan platsens ram och det som täcker kartan (skärmpixlar). */
const GAP = 8;
/** Liggande telefon (#1952): en låg yta i liggande läge. Där fälls platskortet ihop när regionvyn öppnas (foldCard) och css/style.css lämnar kartan fri. */
const LOW_LANDSCAPE = '(max-height: 480px) and (orientation: landscape)';
/** Den minsta fria ytan för regionvyn bor i region-frame.js (knappen i platskortet läser samma regel, #1692). */
export { MIN_FREE };
/**
 * Zoomknapparna är inte uppe när platskortet ritas, så deras mått räknas inte ur sidan utan ur dessa mått (uppmätta i Playwright
 * 2026-11-16): 44 × 194 px i mobil och 65 × 178 px på dator; de ligger 12 px under kartans överkant och 16 px från sidans kant (på
 * dator 12 px till vänster om kortet medan det är öppet, css/style.css .flat-zoom). Regionvyns ruta mäts i stället på en osynlig
 * kopia (chipRect), eftersom raderna i den bryts olika efter språk och bredd. Bara knappens text hänger på måtten: beslutet när
 * vyn öppnas mäter de riktiga elementen.
 */
const ZOOM = { narrow: { w: 44, h: 194 }, wide: { w: 65, h: 178 } };
const GUT = 16, ZOOM_TOP = 12, ZOOM_GAP = 12;
/**
 * Zoomknapparna i en låg liggande yta (#1952), 4 px från kanten: bred layout i två kolumner på 44 px med Affisch över båda
 * (2 × 44 + 4 px, 3 × 44 + 2 × 4 px), smal layout en kolumn (Affisch cirka 66 px bred, 4 × 44 + 3 × 4 px).
 */
const ZOOM_LOW = { narrow: { w: 66, h: 188 }, wide: { w: 92, h: 140 } }, ZOOM_TOP_LOW = 4;

export function createRegion(app) {
  const { $, state, data, flatMap, globe, store, surfaces } = app;
  // Regionvyn på globen (#1644): samma markörer ovanpå klotet
  const globeView = new GlobeRegion({ globe, root: $('globe-region'), canvas: $('globe-region-canvas'), labels: $('globe-region-labels'),
    onSelect: id => app.select(id, false), selectedId: () => state.selectedId });
  /** Var regionvyn är öppen: 'flat' (Platt vy, steg 1) eller 'globe' (globflyget, steg 2), annars null. */
  let where = null;
  /** Markörerna där vyn är öppen (Platt vy som standard, så att lyssnarna nedan alltid har något att fråga). */
  const M = () => (where === 'globe' ? globeView.regionMarks : flatMap.regionMarks);
  const marks = {
    get active() { return M().active; }, get content() { return M().content; }, get mark() { return M().mark; },
    get open() { return M().open; }, get box() { return M().box; },
    setContent: (...a) => M().setContent(...a), setMark: (...a) => M().setMark(...a), setHover: (...a) => M().setHover(...a),
    setNames: (...a) => M().setNames(...a), numberOf: (...a) => M().numberOf(...a), closeFan: (...a) => M().closeFan(...a),
  };
  /** Rutan med vilken plats som visas och vägen ut: i Platt vy och på globen var sin, med samma texter. */
  const chips = {
    flat: { chip: $('flat-region'), title: $('flat-region-name'), note: $('flat-region-note'), context: $('flat-region-context'), back: $('flat-region-back'), legend: $('flat-region-legend-text'), next: $('flat-region-next') },
    globe: { chip: $('globe-region-chip'), title: $('globe-region-name'), note: $('globe-region-note'), context: $('globe-region-context'), back: $('globe-region-back'), legend: $('globe-region-legend-text'), next: $('globe-region-next') },
  };
  const chip = chips.flat.chip;
  /** Är vyn öppen för platsen just nu? */
  const isOpen = () => (where === 'globe' ? globeView.region != null : !!flatMap.region);
  const openId = () => (where === 'globe' ? globeView.region : flatMap.region);
  // Samma rad överst i Lager medan regionvyn är öppen: valen där gäller inte kartan just då
  const layerNote = document.createElement('p');
  layerNote.className = 'layer-region-note';
  layerNote.hidden = true;
  $('layer-menu').prepend(layerNote);
  let place = null, refit = 0;
  /** Platskortet fälldes ihop när vyn öppnades (foldCard); kommer vyn inte till användning (fallBack) öppnas det igen. */
  let folded = false;

  // ---- vyn man kommer från (#1864) ---------------------------------------------------------------------------------
  // Lämna regionvyn ställer tillbaka vyn man kom från: Glob, Platt karta eller Upptäcktsresor, med kameran. Det gäller också när
  // regionvyn öppnades i en annan vy än den man kom från (Skåne från globen öppnas i Platt vy, och Lämna flyger tillbaka till globen).
  // Vyn och kameran läses innan vyn byts (rememberOrigin, anropad av places.showInFlat) och glöms när regionvyn är slut.
  let origin = null;
  /** Vyn och kameran just nu: globens (som ligger kvar medan Platt vy är öppen) och, i Platt vy, kartans. */
  const capture = () => { const mode = flatMap.hidden ? 'globe' : 'flat'; return { mode, globe: globe.view, flat: mode === 'flat' ? flatMap.camera() : null }; };
  /** Knappen i kortet trycktes: kom ihåg vyn man står i, om regionvyn inte redan är öppen (då gäller den första). */
  function rememberOrigin() { if (!isOpen()) origin = capture(); }
  /** Globen tittar där den gjorde före regionvyn: en flygning till samma punkt och samma zoom, om den har flyttats. */
  function restoreGlobe(v) {
    const cur = globe.view, dLon = ((cur.lon - v.lon + 540) % 360) - 180;
    if (Math.abs(cur.lat - v.lat) > 0.05 || Math.abs(dLon) > 0.05) globe.flyTo(v.lat, v.lon, 900, { force: true });
    if (Math.abs(globe.zoom - v.zoom) > 0.001) globe.setZoom(v.zoom);
  }

  /** Rutan för ett element i kartans pixlar, med luft runt, eller null när det inte syns. */
  function rect(el, box) {
    if (!el || el.hidden || !el.getClientRects().length) return null;
    if (getComputedStyle(el).visibility === 'hidden') return null; // dold med visibility (knapparna överst under regionvyn, #1952): tar ingen plats
    return padded(el.getBoundingClientRect(), box);
  }
  /** Rutan r ({ left, top, right, bottom }, sidans pixlar) i kartans pixlar med luft runt, eller null när den är tom. */
  function padded(r, box) {
    if (!r || !(r.right - r.left) || !(r.bottom - r.top)) return null;
    return { x0: r.left - box.left - GAP, y0: r.top - box.top - GAP, x1: r.right - box.left + GAP, y1: r.bottom - box.top + GAP };
  }
  /**
   * Den fria delen av kartan: utan kortet (dator) eller arket (mobil), fokusraden, pausraden och regionvyns ruta. Kortet och arket
   * går först, eftersom de är störst; varje remsa väljs så att platsen får så stor skala som möjligt (region-frame.js).
   */
  function free() {
    if (where === 'globe') return globeFree();
    const box = flatMap.canvas.getBoundingClientRect();
    const shape = place?.boundary?.geometry ? regionSize(placeBounds(place)) : null;
    // På dator ligger zoomknapparna till vänster om kortet medan det är öppet (#1660), alltså inne i den fria ytan: platsen ramas
    // då in vid sidan av dem. Annars ligger de vid högerkanten, där de alltid legat. I mobil ligger de uppe till höger inne i kartan,
    // och ramen ovanför arket hamnade under dem (#1863): där räknas de alltid bort, så att ingen markör eller bricka ligger under dem.
    const narrow = !matchMedia('(min-width: 761px)').matches;
    const zoom = narrow || !$('detail').hidden || matchMedia(LOW_LANDSCAPE).matches ? document.querySelector('#flat-view .flat-zoom') : null;
    return freeArea({ w: box.width, h: box.height }, [$('detail'), $('focus-bar'), $('pause-note'), chip, zoom].map(el => rect(el, box)), shape);
  }
  const roomy = () => hasRoom(flatMap.regionFree());

  // ---- texten på knappen i platskortet (#1692) ---------------------------------------------------------------------
  // Knappen lovar bara regionvyn när den ryms: annars ramas platsen in i Platt vy, och knappen säger det ("Visa på Platt karta").
  // Ytan är inte känd förrän Platt vy är öppen, så den räknas i förväg på samma sätt som free(): kartans ruta (flatMap.layoutSpan)
  // minus kortet, fokusraden och pausraden, och i mobil arket i litet läge (det fälls ihop när knappen trycks) och zoomknapparna.
  /** Fönstrets storlek, så att ett besked om att ytan var för liten bara gäller i den storleken. */
  const sizeKey = () => `${innerWidth}x${innerHeight}`;
  /** Platsen och storleken där öppnandet av regionvyn föll tillbaka till Platt vy fast ytan såg ut att räcka (se fallBack). */
  let tooSmall = null;
  /** Arkets ruta i litet läge: det är det läget det har när regionvyn mäter ytan efter att knappen har tryckts (main.js). */
  function closedSheetRect(card) {
    const was = card.dataset.sheet;
    if (!was || was === 'closed' || card.classList.contains('sheet-dragging')) return card.getBoundingClientRect();
    // Ett ark i litet läge har mindre att rulla: rullningen läggs tillbaka, annars hamnar kortet överst när knappen ritas om
    const scroll = card.scrollTop;
    card.dataset.sheet = 'closed';
    const r = card.getBoundingClientRect(); // ingen övergång på arkets mått, så rutan är den slutliga direkt
    card.dataset.sheet = was;
    card.scrollTop = scroll;
    return r;
  }
  /**
   * Regionvyns ruta för platsen p som den skulle stå i kartans ruta box ({ left, top }): en osynlig kopia av rutan med samma texter
   * (showChip) mäts och tas bort direkt. Läget uppe till vänster kommer ur samma CSS som den riktiga rutan har.
   */
  function chipRect(p, box, root) {
    const probe = chips.flat.chip.cloneNode(true);
    probe.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    probe.removeAttribute('id');
    probe.hidden = false;
    probe.setAttribute('aria-hidden', 'true');
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    const text = (sel, value) => { const el = probe.querySelector(sel); if (el) el.textContent = value; };
    text('.flat-region-name', ui('regionView.title', { place: t(p.name) }));
    text('.flat-region-note', `${ui('regionView.note')} ${ui('regionView.tap')}`);
    text('.flat-region-context', ui('place.mapContext'));
    text('.flat-region-legend > span:last-child', ui('regionView.legend'));
    text('.flat-region-back', ui('regionView.leave'));
    $('app').appendChild(probe);
    try {
      const r = probe.getBoundingClientRect(), cs = getComputedStyle(probe);
      // Rutan ligger i kartans ruta (left och top räknas från den), kopian i sidan: räkna om till samma ställe
      const left = root.left + (parseFloat(cs.left) || 0), top = box.top + (parseFloat(cs.top) || 0);
      return { left, top, right: left + r.width, bottom: top + r.height };
    } finally { probe.remove(); }
  }
  /**
   * Den fria ytan regionvyn skulle få för platsen p om knappen trycktes nu, eller null när kartans yta inte går att mäta. I en låg
   * liggande yta (#1952) fälls kortet ihop och fokusraden och rutan får sin kompakta form när vyn öppnas: ytan räknas då i den formen
   * (klassen region-view sätts bara medan måtten läses, i samma anrop, så att inget hinner ritas om), utan kortet och zoomknapparna.
   */
  function freeBeforeEnter(p) {
    const lowLandscape = matchMedia(LOW_LANDSCAPE).matches, appEl = $('app');
    const toggle = lowLandscape && !appEl.classList.contains('region-view');
    if (toggle) appEl.classList.add('region-view');
    try {
      const root = appEl.getBoundingClientRect(), span = flatMap.layoutSpan();
      if (!root.width || !span.height) return null;
      const box = { left: root.left, top: span.top, width: root.width, height: span.height };
      const shape = p?.boundary?.geometry ? regionSize(placeBounds(p)) : null;
      const narrow = !matchMedia('(min-width: 761px)').matches, card = $('detail'), kind = narrow ? 'narrow' : 'wide';
      const cardOpen = !card.hidden && card.getClientRects().length > 0 && !lowLandscape;
      const cardRect = cardOpen ? (narrow ? closedSheetRect(card) : card.getBoundingClientRect()) : null;
      const z = lowLandscape ? ZOOM_LOW[kind] : ZOOM[kind]; // knapparna i två kolumner i en låg liggande yta (css/style.css, #1952)
      const zoomRight = !narrow && cardRect ? cardRect.left - ZOOM_GAP : root.right - GUT, zoomTop = box.top + (lowLandscape ? ZOOM_TOP_LOW : ZOOM_TOP);
      const covers = [
        padded(cardRect, box), rect($('focus-bar'), box), rect($('pause-note'), box), padded(chipRect(p, box, root), box),
        narrow || cardRect || lowLandscape ? padded({ left: zoomRight - z.w, top: zoomTop, right: zoomRight, bottom: zoomTop + z.h }, box) : null,
      ];
      return freeArea({ w: box.width, h: box.height }, covers, shape);
    } finally { if (toggle) appEl.classList.remove('region-view'); }
  }
  /** Texten på knappen i kortet för platsen p: regionvyn när den ryms, annars Platt karta (region-frame.js, regionButtonKey). */
  function buttonKey(p) {
    if (!p?.boundary?.geometry) return 'place.flatMap';
    const b = placeBounds(p);
    // Föll öppnandet nyss tillbaka i den här storleken är svaret nej, hur det än såg ut i förväg
    if (tooSmall?.id === p.id && tooSmall.size === sizeKey() && regionEligible(b)) return 'place.flatMap';
    return regionButtonKey(b, regionEligible(b) && !globeRegionEligible(b) ? freeBeforeEnter(p) ?? undefined : undefined);
  }
  /** Knappen i platskortet som är öppet nu får rätt text (fönstret ändrade storlek, arket eller fokusraden ändrade höjd, eller kortet för `shown` har just ritats). */
  function refreshButton(shown = null) {
    const p = shown ?? (state.focus?.type === 'place' ? state.focus.place : null);
    const btn = p && !$('detail').hidden ? $('detail').querySelector('[data-selection-action]') : null;
    if (!btn) return;
    const a = flatAction(p, null, buttonKey(p));
    if (btn.textContent !== a.text) btn.textContent = a.text;
    if (btn.getAttribute('aria-label') !== a.label) btn.setAttribute('aria-label', a.label);
  }
  /**
   * Den fria delen av globen (#1644): klotets canvas täcker hela sidan, så här dras också knapparna och årtalet överst och tidslinjen
   * nertill bort, utöver kortet eller arket, fokusraden, pausraden och rutan. Samma regel som i Platt vy (freeArea).
   */
  const globeCovering = () => [$('detail'), document.querySelector('.timebar'), $('focus-bar'), $('pause-note'), chips.globe.chip,
    document.querySelector('.masthead'), document.querySelector('.top-actions'), $('focus-moved')];
  function globeFree() {
    const box = globe.canvas.getBoundingClientRect();
    const shape = place?.boundary?.geometry ? regionSize(placeBounds(place)) : null;
    return freeArea({ w: box.width, h: box.height }, globeCovering().map(el => rect(el, box)), shape);
  }
  globeView.regionFree = () => globeFree();
  globeView.regionCovers = () => {
    const box = globe.canvas.getBoundingClientRect();
    return globeCovering().map(el => rect(el, box)).filter(Boolean).map(r => ({ x0: r.x0 + GAP, y0: r.y0 + GAP, x1: r.x1 - GAP, y1: r.y1 - GAP }));
  };
  // Det som ligger ovanpå kartan (också zoomknapparna): ortnamnen och brickan läggs inte där (#1642). rect() lägger till luften GAP
  // för ramen; här dras den av igen, så att rutorna är elementens egna
  flatMap.regionCovers = () => {
    const box = flatMap.canvas.getBoundingClientRect();
    return [$('detail'), $('focus-bar'), $('pause-note'), chip, document.querySelector('#flat-view .flat-zoom')].map(el => rect(el, box)).filter(Boolean)
      .map(r => ({ x0: r.x0 + GAP, y0: r.y0 + GAP, x1: r.x1 - GAP, y1: r.y1 - GAP }));
  };

  // ---- markörerna och listan (#1642) -------------------------------------------------------------------------------
  /** Platsens händelser i listans ordning: samma som kortet visar (Fokus på platsen), annars ur platsens gräns. */
  const placeEventsOf = p => (state.focus?.type === 'place' && state.focus.place?.id === p.id ? state.focus.themeEvents : visibleEvents(p, data.events)) ?? [];
  /**
   * Året som kartan visar (#1786): bara händelser som har börjat vid det får markörer. Listan i kortet visar hela historien, med
   * samma nummer. I ett tidsintervall är det slutåret, som för riken (areaYear).
   */
  const regionYear = () => state.areaYear ?? state.year;
  /** Platsens händelser som kartan visar: de som har börjat vid året. */
  const startedOf = (p, events = placeEventsOf(p)) => events.filter(e => startedBy(e, regionYear()));
  const rows = () => [...$('detail').querySelectorAll('[data-theme-event]')];
  /** Raderna i listan får markörernas nummer (och märket för hela platsen eller ungefärlig plats) medan vyn är öppen. */
  function decorate() {
    if (!place || !marks.active) return;
    // Raderna och markörerna ska vara samma händelser i samma ordning; gäller kortet en annan lista (ett nytt urval för platsen)
    // räknas markörerna om ur platsens händelser, så att numren aldrig pekar på fel rad
    const ids = rows().map(b => b.dataset.themeEvent);
    if (ids.length && ids.join() !== marks.content.all.join()) sync();
    for (const b of rows()) {
      const n = marks.numberOf(b.dataset.themeEvent);
      if (n == null || b.querySelector('.region-num')) continue;
      const it = marks.content.byId.get(b.dataset.themeEvent);
      const num = document.createElement('span');
      num.className = `region-num${it.whole ? ' is-whole' : it.approx ? ' is-approx' : ''}`;
      num.textContent = String(n);
      b.prepend(num);
    }
    $('detail').classList.add('region-numbered');
    markRows(marks.mark ? [marks.mark] : []);
  }
  /** Markörerna räknas om ur platsens händelser (listans ordning), med samma markering om händelsen finns kvar. */
  function sync() {
    const mark = marks.mark;
    marks.setContent({ place, events: placeEventsOf(place), places: loadedPlaces(), year: regionYear() });
    showNext();
    if (mark && marks.numberOf(mark) != null) marks.setMark(mark, { open: false });
    for (const el of $('detail').querySelectorAll('.region-num')) el.remove();
  }
  function undecorate() {
    for (const el of $('detail').querySelectorAll('.region-num')) el.remove();
    for (const el of $('detail').querySelectorAll('.is-region-marked')) el.classList.remove('is-region-marked');
    $('detail').classList.remove('region-numbered');
  }
  /** Ramen runt de markerade raderna; från kartan fälls listan ut och raden rullas fram. */
  function markRows(ids, from = 'list') {
    const set = new Set(ids);
    let first = null;
    for (const b of rows()) {
      const on = set.has(b.dataset.themeEvent);
      b.classList.toggle('is-region-marked', on);
      if (on && !first) first = b;
    }
    if (first && from !== 'list') {
      const list = first.closest('details');
      if (list && !list.open) list.open = true;
      first.scrollIntoView({ block: 'nearest' });
    }
  }
  flatMap.regionMarks.onMark = globeView.regionMarks.onMark = (ids, from) => markRows(ids, from);
  // Kortet ritas om (Fakta, en ny rad): raderna får numren igen
  new MutationObserver(() => { if (place) decorate(); }).observe($('detail'), { childList: true });
  // En rad i fokus markerar markören och fäller ut högen den ligger i; muspekaren över en rad markerar utan att fälla ut
  $('detail').addEventListener('focusin', e => {
    const b = e.target.closest?.('[data-theme-event]');
    if (b && place && marks.active) marks.setMark(b.dataset.themeEvent, { open: true, from: 'list' });
  });
  $('detail').addEventListener('pointerover', e => {
    if (!place || !marks.active || e.pointerType !== 'mouse') return; // ett tryck med finger öppnar raden, det är ingen hovring
    marks.setHover(e.target.closest?.('[data-theme-event]')?.dataset.themeEvent ?? null);
  });
  $('detail').addEventListener('pointerleave', () => { if (place && marks.active) marks.setHover(null); });

  /**
   * Raden i rutan när inget har börjat än: vad som är nästa händelse (#1786), som Fokus gör när ett år är tomt. Står kvar i mobil,
   * där rutans övriga text är dold, eftersom en tom karta annars inte förklaras.
   */
  function showNext() {
    const next = marks.active && !marks.content.items.length ? marks.content.next : null;
    for (const c of Object.values(chips)) {
      c.next.hidden = !next;
      c.next.textContent = next ? ui('regionView.next', { next: `${formatEventTime(next)} · ${t(next.title)}` }) : '';
    }
  }

  /** Året ändras (reglaget, uppspelning, ett intervall): markörerna räknas om bara när något har börjat eller inte längre gäller. */
  function followYear() {
    if (!place || !marks.active) return;
    const now = startedOf(place).map(e => e.id).join();
    if (now !== marks.content.items.map(it => it.e.id).join()) { sync(); decorate(); }
  }

  /** Statusraden: "Skåne, 21 händelser, 7 gäller hela Skåne". */
  function countText(p, items) {
    const whole = items.filter(it => it.whole).length, name = t(p.name);
    return [pluralUi('regionView.count', items.length), ...(whole ? [pluralUi('regionView.whole', whole, { place: name })] : [])].join(', ');
  }

  /** Får platsen regionvyn? I Platt vy när den är liten nog, på globen när den är stor (region-frame.js). Sverige ingen av dem. */
  const eligible = p => !!p?.boundary?.geometry && (regionEligible(placeBounds(p)) || globeRegionEligible(placeBounds(p)));
  const onGlobe = p => !!p?.boundary?.geometry && globeRegionEligible(placeBounds(p));

  /** Platt vy som förut: platsen inramad, utan regionvyn (med kortets yta bortdragen i dator). */
  function frameFlat(p) {
    const card = $('detail');
    const covered = !app.narrow.matches && !card.hidden ? Math.max(0, flatMap.canvas.getBoundingClientRect().right - card.getBoundingClientRect().left) : 0;
    flatMap.frame(placeBounds(p), 0.78, covered);
  }

  /** För liten yta för regionvyn: lämna den tyst och visa platsen i Platt vy som förut, med samma besked som där. */
  function fallBack(p) {
    tooSmall = { id: p.id, size: sizeKey() }; // och knappen i kortet säger det (#1692)
    const reopen = folded; // leaveRegion avslutar vyn (ended) och glömmer det
    flatMap.leaveRegion();
    if (reopen) app.showFocusFacts?.(); // kortet som fälldes ihop för vyn kommer tillbaka (#1952)
    frameFlat(p);
    say(ui('place.flatShown', { place: t(p.name) }), 'plats', { priority: 2, immediate: true });
    refreshButton();
  }

  /**
   * Globens ruta står under årtalets ruta (överst till vänster), där religionernas förklaring annars står. Höjden räknas ur rutans
   * underkant, eftersom raden "Följer …" kan bli två rader på andra språk (UX-granskningen 2026-11-15); i smal skärm under
   * knapparna överst också. På en låg yta (högst 480 px, liggande telefon) ryms inte alltid rutan där: årtalets ruta och fokusraden
   * tar höjden, och rutan hamnade bakom tidsreglaget så att "Lämna regionvyn" inte gick att trycka på (#1900). Då står den ovanför
   * årtalets ruta om den ryms där, annars så högt upp som den kan utan att nå ned till raderna nertill.
   */
  function placeGlobeChip() {
    const chip = chips.globe.chip, app0 = $('app').getBoundingClientRect();
    const masthead = document.querySelector('.masthead');
    const bottoms = [masthead, ...(app.narrow.matches ? [document.querySelector('.top-actions')] : [])]
      .map(el => el?.getBoundingClientRect()).filter(r => r?.height).map(r => r.bottom - app0.top);
    if (!bottoms.length) return;
    let top = Math.round(Math.max(...bottoms) + 8);
    if (matchMedia('(max-height: 480px)').matches) {
      const h = chip.getBoundingClientRect().height;
      const lower = [document.querySelector('.timebar'), $('focus-bar'), $('pause-note')]
        .map(el => el?.getBoundingClientRect()).filter(r => r?.height).map(r => r.top - app0.top);
      const limit = (lower.length ? Math.min(...lower) : app0.height) - 4;
      if (top + h > limit) {
        const m = masthead?.getBoundingClientRect();
        top = m?.height && m.top - app0.top - 8 >= h + 8 ? 8 : Math.max(8, Math.round(limit - h));
      }
    }
    chip.style.top = `${top}px`;
  }

  /** Rutans texter och de delar som är lika i Platt vy och på globen. */
  function showChip(p, w) {
    const c = chips[w], name = t(p.name);
    c.title.textContent = ui('regionView.title', { place: name });
    c.note.textContent = layerNote.textContent = `${ui('regionView.note')} ${ui('regionView.tap')}`; // och hur man får fakta (#1791)
    c.back.textContent = ui('regionView.leave');
    // Förklaringen till den streckade ringen runt markörer med ungefärlig plats (#1642), också i mobil
    c.context.textContent = ui('place.mapContext'); // kort och synlig också där den långa raden är dold (#1956)
    c.legend.textContent = ui('regionView.legend');
    $('app').classList.add('region-view'); // före rutans läge: i en låg liggande yta mäts rutan i regionvyns kompakta form (#1952)
    c.chip.hidden = false; // först: rutan tar plats, och ramen räknas utan den
    if (w === 'globe') placeGlobeChip();
    layerNote.hidden = false;
  }

  /**
   * Liggande telefon (#1952): platskortet stängs när regionvyn öppnas, så att kartan blir fri. Det ligger annars ovanpå platsen
   * (cirka 120 px av 360), och Om platsen i fokusraden öppnar det igen. Fokus går till Lämna regionvyn, som kortets knapp lämnade
   * efter sig (annars hamnar det på sidan). Ger sant när kortet fälldes ihop.
   */
  function foldCard(w) {
    const card = $('detail');
    if (!matchMedia(LOW_LANDSCAPE).matches || card.hidden || !card.classList.contains('detail-selection')) return false;
    app.select(null);
    chips[w].back.focus({ preventScroll: true });
    folded = true;
    return true;
  }

  /** Markörerna i listans ordning, ortnamnen när filen har laddats och beskedet på statusraden. */
  function fill(p) {
    const events = placeEventsOf(p);
    marks.setContent({ place: p, events, places: loadedPlaces(), year: regionYear() });
    showNext();
    decorate();
    loadOrtnamn(p.id).then(doc => { if (doc && openId() === p.id && place === p) marks.setNames(doc); });
    return events;
  }

  /**
   * Regionvyn på globen (#1644): globen flyger in till platsen med ett smalt synfält, utan Platt vy. Markörerna, högarna och brickan
   * från steg 1b ligger ovanpå klotet, och världslagren ritas inte (render.js, som i Platt vys regionvy).
   */
  function enterGlobe(p) {
    const from = origin ?? capture(); // vyn man kom från överlever att en annan regionvy stängs här
    if (flatMap.region) flatMap.leaveRegion();
    if (where === 'globe' && globeView.region) closeGlobe();
    origin = from;
    place = p;
    where = 'globe';
    app.viewMode.setSurface('globe');
    showChip(p, 'globe');
    foldCard('globe');
    $('app').classList.add('globe-region-view');
    const b = placeBounds(p), geom = p.boundary.geometry;
    globeView.open(p.id, b, geom);
    globe.markerGroup.visible = globe.arcGroup.visible = false; // händelsernas medaljer och bågarna: markörerna ersätter dem
    globe.setRegion(() => globeFrame(geom, b, globeFree()));
    const events = fill(p);
    app.refresh(); // lagerbilden utan världslagren, och platsens linje med omgivningen nedtonad
    clearTimeout(refit);
    // I mobil fälls arket ihop strax efter: ramen räknas om när det har skett, om man inte har flyttat klotet
    refit = setTimeout(() => { if (where === 'globe' && globeView.region === p.id && !globe.regionMoved) globe.resetRegion(); }, REFIT_MS);
    say(ui('regionView.shownGlobe', { place: t(p.name), events: countText(p, regionItems(events, p, loadedPlaces(), regionYear())) }), 'plats', { priority: 2, immediate: true });
  }

  /** Globens regionvy stängs: kameran flyger tillbaka till den vanliga globen. */
  function closeGlobe() {
    if (where !== 'globe' || !globeView.region) return;
    globeView.close();
    globe.setRegion(null);
    globe.markerGroup.visible = globe.arcGroup.visible = true;
    $('app').classList.remove('globe-region-view');
    ended();
    app.refresh();
  }

  /** Byt till regionvyn för platsen: i Platt vy för en liten plats, på globen för en stor (#1644). */
  function enter(p) {
    if (onGlobe(p)) { enterGlobe(p); return; }
    const from = origin ?? capture();
    if (where === 'globe') closeGlobe();
    origin = from;
    place = p;
    where = 'flat';
    const name = t(p.name);
    showChip(p, 'flat');
    foldCard('flat');
    flatMap.enterRegion(p.id, placeBounds(p), free);
    // I mobil fälls arket ihop strax efter; där avgörs storleken när det har skett
    if (!app.narrow.matches && !roomy()) { fallBack(p); return; }
    // Markörerna i listans ordning, och ortnamnen när filen har laddats (först nu, bara för den här platsen)
    const events = fill(p);
    // Den finare kusten (1:10m, samma som globens utsnitt) laddas en gång; kartan ritas om med den när den kommer
    globe.detail.loadFineLand?.()?.then(land => { if (land) flatMap.regionLayersChanged(); });
    clearTimeout(refit);
    refit = setTimeout(() => {
      if (flatMap.region !== p.id) return;
      if (!flatMap.regionMoved) flatMap.fitRegion();
      if (!roomy()) fallBack(p);
    }, REFIT_MS);
    say(ui('regionView.shown', { place: name, events: countText(p, regionItems(events, p, loadedPlaces(), regionYear())) }), 'plats', { priority: 2, immediate: true }); // som faktarutans rubrik: svaret på knappen
  }

  /**
   * Lämna regionvyn med knappen eller Escape: vyn och kameran man kom från ställs tillbaka (#1864), och fokus går till den vyns karta
   * eller glob. Statusraden säger vart man kom tillbaka.
   */
  function leave() {
    const o = origin;
    if (!place || !isOpen()) return;
    const p = place;
    if (where === 'globe') closeGlobe(); else flatMap.leaveRegion();
    const mode = o?.mode ?? 'flat'; // utan minne (ingen sådan väg i dag): Platt karta med platsen inramad, som förut
    app.viewMode.setSurface(mode);
    if (mode === 'flat') {
      if (o?.flat) flatMap.setView(o.flat.lat, o.flat.lon, o.flat.zoom); else frameFlat(p);
      flatMap.canvas.focus({ preventScroll: true });
    } else {
      if (o?.globe) restoreGlobe(o.globe);
      globe.canvas.focus({ preventScroll: true });
    }
    say(ui(mode === 'flat' ? 'regionView.left' : mode === 'discovery' ? 'regionView.leftDiscovery' : 'regionView.leftGlobe'), 'plats', { priority: 2, immediate: true });
  }

  // Kartan säger till när vyn slutar, vad som än avslutade den (knappen, en tur, Platt vy som stängs)
  flatMap.onRegion = (id) => {
    if (id || where !== 'flat') return;
    ended();
  };
  /** Vyn är slut, i Platt vy eller på globen: rutan, raderna och klassen tas bort och minnet av vyn man kom från glöms. Beskedet på statusraden ger leave(). */
  function ended() {
    place = null;
    where = null;
    origin = null;
    folded = false;
    undecorate();
    clearTimeout(refit);
    chips.flat.chip.hidden = chips.globe.chip.hidden = true;
    layerNote.hidden = true;
    $('app').classList.remove('region-view');
  }
  // Återställ i regionvyn ramar in platsen igen och säger det
  flatMap.onRegionReset = () => { if (place) say(ui('regionView.reset', { place: t(place.name) }), 'plats', { priority: 2, immediate: true }); };
  chips.flat.back.addEventListener('click', leave);
  chips.globe.back.addEventListener('click', leave);
  // Platt vy eller Upptäcktsresor öppnas medan globen visar regionvyn: vyn hör till globen och lämnas tyst
  const onToggle = flatMap.onToggle;
  flatMap.onToggle = open => { if (open && where === 'globe') closeGlobe(); onToggle?.(open); };
  // Upptäcktsresor slås på i Vy eller Lager: vyn stängs efter bildrutan, inte mitt i globens återanrop (Lager-menyns onChange sätts
  // först efter att den här modulen har skapats, därför frågar bildrutan)
  globe.onFrame(() => { if (where === 'globe' && globeView.region && app.layers?.on?.discovery) setTimeout(() => { if (app.layers?.on?.discovery) closeGlobe(); }); });

  // Arket, kortet och fokusraden ändrar höjd (ett läge i arket, en rad till i fokusraden): ramen räknas om när det har stannat,
  // men bara om man inte har panorerat eller zoomat själv
  if (typeof ResizeObserver !== 'undefined') {
    let timer = 0;
    const ro = new ResizeObserver(() => {
      if (!isOpen()) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (where === 'globe') { placeGlobeChip(); if (globeView.region && !globe.regionMoved) globe.resetRegion(300); return; }
        if (flatMap.region && !flatMap.regionMoved) flatMap.fitRegion();
      }, 200);
    });
    for (const id of ['detail', 'focus-bar']) if ($(id)) ro.observe($(id));
    if (document.querySelector('.masthead')) ro.observe(document.querySelector('.masthead')); // årtalets ruta växer (#1644)
  }
  // Texten på knappen i platskortet följer fönstret (#1692): storleken ändras, telefonen vänds, arket eller fokusraden ändrar höjd, och
  // knapparna uppe eller tidsreglaget ändrar höjd (språk, tidsintervall). En gång per bildruta, och bara när kortet har en knapp.
  if (typeof ResizeObserver !== 'undefined') {
    let frame = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => refreshButton()); });
    for (const el of [$('app'), $('detail'), $('focus-bar'), document.querySelector('.top-actions'), document.querySelector('.timebar')]) if (el) ro.observe(el);
  }
  app.narrow.addEventListener?.('change', () => refreshButton());

  // Vyn hör till platsen man följer: slutar man följa den (eller följer något annat) lämnas den
  store.subscribe(({ type }) => {
    if ((type === 'year' || type === 'range') && isOpen()) { followYear(); return; }
    if (type !== 'focus' || !isOpen()) return;
    if (state.focus?.type !== 'place' || state.focus.place?.id !== openId()) {
      if (where === 'globe') closeGlobe(); else flatMap.leaveRegion();
      return;
    }
    // Samma plats med ett nytt fokus (en adress eller Sök och följ startar den igen): markörerna följer dess lista
    if (place && marks.active && placeEventsOf(place).map(e => e.id).join() !== marks.content.all.join()) { sync(); decorate(); }
  });

  // Escape lämnar regionvyn, men först det som ligger ovanpå (OVERLAY_IDS och stängregistrets grupper). Lyssnaren ligger på
  // window i fångstfasen, så den går före dokumentets lyssnare som annars skulle avsluta Fokus och stänga Platt vy i samma tryck
  addEventListener('keydown', e => {
    if (e.key !== 'Escape' || e.defaultPrevented || !isOpen() || (where === 'flat' && flatMap.hidden)) return;
    // Fokus i en utfälld hög eller bricka (#1642): Escape fäller ihop den och lägger fokus på högen, före allt annat
    if (marks.open && marks.box?.contains(document.activeElement)) {
      e.preventDefault(); e.stopImmediatePropagation();
      marks.closeFan();
      return;
    }
    const open = OVERLAY_IDS.some(id => { const el = $(id); return el && !el.hidden; })
      || ['dialog', 'popover', 'uppdrag', 'besked', 'meny'].some(g => surfaces.anyOpen(g))
      || $('app').classList.contains('panel-open') || $('tour-card')?.contains(document.activeElement);
    if (open) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    // En utfälld hög eller bricka fälls ihop först (#1642), sedan lämnas vyn
    if (marks.closeFan()) return;
    leave();
  }, true);

  /** Ett tryck på klotet bredvid knapparna i globens regionvy: solfjädern fälls ihop och markeringen tas bort (main.js). */
  const background = () => globeView.regionMarks.background();

  return { eligible, onGlobe, enter, leave, rememberOrigin, background, buttonKey, refreshButton, get place() { return place; }, get globeOpen() { return where === 'globe' && globeView.region != null; } };
}
