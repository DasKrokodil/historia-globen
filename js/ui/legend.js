// Teckenförklaring och klickruta för religionslagret (#166). Båda är vanliga
// HTML-element över globen (inte en del av kartbilden), och all text kommer ur
// religions.json via t(). I fokusläget förklarar samma ruta också krigsområdena (#236)
// och säger vilka lager som är dämpade, med en knapp för att visa dem som vanligt (#235).
// I upptäcktsvyn (#101) står där vad "upptäckt" och dimman betyder, och krediten för kartbilderna.
import { t, CAT, formatYear, symbolImg } from '../model.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cleanName = n => String(n).replace(/^\((.*)\)$/, '$1'); // "(Kingdom of France)" → "Kingdom of France"

const OBSTACLES = '.funfact, .ff-tab, .detail-card, .panel, .focus-bar, .pause-note';
const GAP = 10; // luft mellan förklaringen och det som ligger under
const HINT_KEY = 'hg-rel-tip'; // tipsraden har visats (#308)

export class ReligionLegend {
  constructor({ legend, pop }) {
    Object.assign(this, { legend, pop });
    this.onFacts = () => {};
    this.onKeep = () => {};
    this.onAbout = () => {}; // knappen "Läs om religionerna" (#308)
    this.hint = false;       // tipsraden visas (#308)
    // Öppen som standard i dator, hopfälld till en knapp i mobil (#193). Valet ligger kvar när året ändras.
    // Byter man fönsterbredd över gränsen gäller standardläget för den nya bredden.
    const wide = matchMedia('(min-width: 761px)');
    this.open = wide.matches;
    wide.addEventListener('change', () => { this.open = wide.matches; this.render(); this.fit(); });
    legend.addEventListener('click', e => {
      if (e.target.closest('[data-hint-close]')) { this.closeHint(); return; }
      if (e.target.closest('[data-about]')) { this.onAbout(); return; }
      const keep = e.target.closest('[data-keep]');
      if (keep) { this.onKeep(keep.dataset.keep === '1'); return; }
      const li = e.target.closest('li[data-religion]');
      if (li) { this.onPin(li.dataset.religion); return; }
      if (!e.target.closest('.rl-toggle')) return;
      this.open = !this.open; this.render(); this.fit();
    });
    this.fit = this.fit.bind(this);
    this.fitSoon = () => { cancelAnimationFrame(this._raf); this._raf = requestAnimationFrame(this.fit); };
    addEventListener('resize', this.fitSoon);
    // Samtidigt-kortet, faktarutan, panelen och fokusraden byter höjd och plats: förklaringen får det som blir över
    const ro = new ResizeObserver(this.fitSoon);
    for (const el of document.querySelectorAll(OBSTACLES + ', .masthead')) ro.observe(el);
    new MutationObserver(this.fitSoon).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    document.addEventListener('animationend', this.fitSoon, true);
    this.highlight = null; // religionen som lyses upp på kartan (#271)
    this.pinned = null;    // religionen som är vald med tryck eller Enter, så att markeringen ligger kvar
    this.onPin = () => {};
    legend.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.hint && e.target.closest('.rl-hint')) { e.stopPropagation(); this.closeHint(); return; }
      const li = e.target.closest('li[data-religion]');
      if (li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); this.onPin(li.dataset.religion); }
    });
    this.names = new Map(); // rikets namn i Cliopatria → svenskt namn, där det finns (data/empires/index.json)
    pop.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) this.hidePop();
      const f = e.target.closest('[data-facts]');
      if (f) { this.hidePop(); this.onFacts(f.dataset.facts); }
    });
  }

  /**
   * Tipsraden (#308): visas första gången religionslagret slås på (sparas i localStorage som hg-rel-tip, så
   * att den inte kommer igen) och försvinner när man stänger den eller slår av lagret.
   */
  setHint(on) {
    if (!on) { if (this.hint) { this.hint = false; this.render(); this.fit(); } return; }
    let seen = false;
    try { seen = localStorage.getItem(HINT_KEY) === '1'; } catch { /* utan lagring */ }
    if (seen) return;
    try { localStorage.setItem(HINT_KEY, '1'); } catch { /* utan lagring */ }
    this.hint = true;
    if (this.items) { this.render(); this.fit(); }
  }
  closeHint() {
    const had = this.legend.contains(document.activeElement);
    this.hint = false; this.render(); this.fit();
    if (had) this.legend.querySelector('.rl-toggle')?.focus({ preventScroll: true });
  }

  /**
   * items från ReligionsLayer.legendItems(). focus (valfritt, fokusläget): war = ett följt krigs områden syns,
   * fadable = namnen på lager som dämpas (eller skulle dämpas) och keep = om de visas som vanligt (#235).
   * discovery (upptäcktsvyn, #101) = { perspective, credit, sources: [{ title, url }] } eller null.
   * Finns inget att förklara döljs rutan.
   */
  update(items, focus = {}) {
    this.items = items;
    this.focus = focus;
    this.render(); this.fit();
  }

  render() {
    const items = this.items ?? [], { areas = false, war = false, fadable = [], keep = false, discovery = null } = this.focus ?? {};
    if (!items.length && !areas && !war && !fadable.length && !discovery) { this.legend.hidden = true; this.legend.textContent = ''; this._html = ''; return; }
    const unsure = items.some(i => i.unsure), inherited = items.some(i => i.inherited);
    const title = (items.length ? 1 : 0) + (areas ? 1 : 0) + (war ? 1 : 0) + (discovery ? 1 : 0) > 1 ? 'Teckenförklaring'
      : items.length ? 'Religioner' : areas ? 'Riken' : war ? 'Krigsområden' : discovery ? 'Upptäcktsvy' : 'Lager i fokus';
    const religionsHtml = !items.length ? '' : `<ul>${items.map(({ religion: r, sure, unsure: u, inherited: i }) =>
      `<li data-religion="${esc(r.id)}" tabindex="0" role="button" aria-pressed="${this.pinned === r.id}" class="${this.highlight === r.id ? 'on' : ''}" title="Peka eller tryck för att lyfta fram ${esc(t(r.name).toLowerCase())} på kartan"><span class="swatch" style="background:${esc(r.color)}"></span>${symbolImg(r)}<span class="rl-name">${esc(t(r.name))}${
        sure ? '' : u ? ' <em>(osäkert)</em>' : i ? ' <em>(ärvt)</em>' : ''}</span></li>`).join('')}</ul>${
      unsure ? '<p class="rl-note"><span class="swatch rl-unsure"></span>Ljus med streckad kant: osäker uppgift</p>' : ''}${
      inherited ? '<p class="rl-note"><span class="swatch rl-inherited"></span>Ljusast med prickad kant: ärvt, rikets faktaruta saknar religion</p>' : ''}`;
    // Krigsskådeplatsen: skraffering i krigets färg med hel kantlinje, som på kartan (wars.js)
    const warHtml = !war ? '' : `<div class="rl-war"><p class="rl-note rl-row"><span class="swatch rl-hatch" style="--war:${esc(CAT.krig.color)}"></span>Krigsskådeplats: område runt kriget och slagen hittills</p>
      <p class="rl-note">Namnet säger vilken världsdel området ligger i.</p></div>`;
    const areasHtml = !areas ? '' : `<div class="rl-areas">${this.empireLegend?.softEdge ? `<p class="rl-note"><span class="swatch rl-soft"></span>${esc(this.empireLegend.softEdge)}</p>` : ''}
      ${this.empireLegend?.influence ? `<p class="rl-note"><span class="swatch rl-influence"></span>${esc(this.empireLegend.influence)}</p>` : ''}</div>`;
    // Vad symbolerna betyder (#271)
    const symbolsHtml = !items.length ? '' : `<p class="rl-note rl-sym-note">Symbolen visar religionen. En mässingsmedalj med symbolen står där religionen uppstod: den dyker upp det året och står kvar så länge lagret är på. Peka på en religion här för att lyfta fram den.</p>`;
    // Faktarutan på begäran (#308), när någon religion som syns har en
    const aboutHtml = !items.some(i => i.religion.facts) ? '' : '<button type="button" class="info-btn rl-about" data-about>Läs om religionerna</button>';
    // Tipsraden första gången lagret slås på (#308). Den står utanför den hopfällbara listan, så att den syns även i mobil.
    const hintHtml = !this.hint || !items.length ? '' : `<p class="rl-hint" role="note"><span>Klicka på ett färgat område för att se religion och rike.</span><button type="button" class="rl-hint-close" data-hint-close aria-label="Stäng tipset">×</button></p>`;
    // Upptäcktsvyn (#101): perspektivraden står utanför den hopfällbara delen, så att den syns även i mobil.
    // Krediten för kartbilderna, med länkar till filsidorna, ligger i den hopfällbara delen.
    const discHtml = !discovery ? '' : `<p class="rl-disc" role="note">${esc(discovery.perspective)}</p>`;
    const creditHtml = !discovery ? '' : `<p class="rl-note rl-credit">${esc(discovery.credit)}${discovery.sources?.length ? ` Filsidor: ${
      discovery.sources.map((s, i) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${i + 1}<span class="sr-only"> ${esc(s.title)} (öppnas i en ny flik)</span></a>`).join(', ')}.` : ''}</p>`;
    const names = fadable.join(' och ').toLowerCase().replace(/^./, c => c.toUpperCase());
    const fadeHtml = !fadable.length ? '' : `<p class="rl-note rl-fade">${keep
      ? `${esc(names)} visas som vanligt. <button type="button" class="link-btn" data-keep="0">Dämpa</button>`
      : `${esc(names)} är dämpade medan du följer det här. <button type="button" class="link-btn" data-keep="1">Visa som vanligt</button>`}</p>`;
    this.legend.setAttribute('aria-label', `Teckenförklaring: ${title.toLowerCase()}`);
    // Hopfälld i smal skärm (#309): religionerna som syns just nu som färgprickar på en rad under rubriken,
    // så att man ser vad som finns utan att förklaringen täcker globen. CSS visar raden bara i smal skärm.
    const DOTS = 9, shown = items.slice(0, items.length > DOTS + 1 ? DOTS : DOTS + 1);
    const dotsHtml = this.open || (!items.length && !war && !areas) ? '' : `<span class="rl-dots" aria-hidden="true">${
      shown.map(({ religion: r, sure }) => `<span class="rl-dot${sure ? '' : ' rl-dot-pale'}" style="background:${esc(r.color)}" title="${esc(t(r.name))}"></span>`).join('')}${
      items.length > shown.length ? `<span class="rl-more">+${items.length - shown.length}</span>` : ''}${
      war ? `<span class="rl-dot rl-hatch" style="--war:${esc(CAT.krig.color)}" title="Krigsskådeplats"></span>` : ''}</span>`;
    const html = `<button type="button" class="rl-toggle" aria-expanded="${this.open}" aria-controls="rl-body"><span class="rl-title">${title}</span><span class="rl-chev" aria-hidden="true"></span>${dotsHtml}</button>${hintHtml}${discHtml}
      <div id="rl-body" class="rl-body" ${this.open ? '' : 'hidden'}>${aboutHtml}${religionsHtml}${symbolsHtml}${areasHtml}${warHtml}${creditHtml}${fadeHtml}</div>`;
    // Samma innehåll ritas inte om, så att musen och tangentbordets fokus ligger kvar på raden (#271)
    if (html !== this._html) {
      const focused = this.legend.contains(document.activeElement) && document.activeElement.dataset.religion;
      const scroll = this.legend.querySelector('.rl-body')?.scrollTop ?? 0;
      this.legend.innerHTML = this._html = html;
      const body = this.legend.querySelector('.rl-body'); if (body) body.scrollTop = scroll;
      if (focused) this.legend.querySelector(`[data-religion="${focused}"]`)?.focus({ preventScroll: true });
    }
    this.legend.hidden = false;
  }

  /** Lägger förklaringen under rubriken uppe till vänster och begränsar listans höjd så att den slutar
   *  ovanför det som ligger under: Samtidigt-kortet (eller fliken), faktarutan, panelen och fokusraden (#193).
   *  Får listan för lite plats fälls den ihop till knappen; listan scrollas om den är för hög. */
  fit() {
    const lg = this.legend;
    if (lg.hidden) return;
    const mast = document.querySelector('.masthead');
    const top = Math.round((mast ? mast.getBoundingClientRect().bottom : 56) + 8);
    lg.style.top = `${top}px`;
    const body = lg.querySelector('.rl-body'); if (!body) return;
    body.hidden = !this.open; body.style.maxHeight = '';
    if (!this.open) return;
    const me = lg.getBoundingClientRect();
    let limit = innerHeight - 150;
    for (const el of document.querySelectorAll(OBSTACLES)) {
      if (el.hidden || getComputedStyle(el).display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (r.width && r.left < me.right && r.right > me.left && r.bottom > top) limit = Math.min(limit, r.top);
    }
    const head = lg.querySelector('.rl-toggle').offsetHeight + (lg.querySelector('.rl-hint')?.offsetHeight ?? 0) + (lg.querySelector('.rl-disc')?.offsetHeight ?? 0);
    const room = limit - GAP - top - head - 14; // 14 = rutans utfyllnad
    if (room < 56) body.hidden = true; // för lite plats: bara knappen syns
    else body.style.maxHeight = `${Math.floor(room)}px`;
  }

  /**
   * Visar en ruta vid klickpunkten (x, y i fönstret) med religionen och riket på platsen (#194).
   * hit.here = rikena på just den platsen (ReligionsLayer.polityAt), det mest träffande först; saknas den
   * (rikenas gränser kunde inte laddas, eller klicket hamnade mellan dem) visas rikena i området.
   */
  showPop(hit, x, y) {
    const { religion: r, snapshot, polities, here, loading } = hit;
    const name = p => { const n = cleanName(p.name); return this.names.get(n) ?? n; };
    let head = esc(t(r.name)) + (snapshot.inherited ? ' (ärvt)' : ''), where;
    if (loading) {
      where = '<p class="rp-note">Söker riket på platsen…</p>';
    } else if (here?.length) {
      const names = [...new Set(here.map(name))]; // "(Kingdom of France)" och "Kingdom of France" visas en gång
      head += ` · ${esc(names[0])}`;
      where = names.length > 1 ? `<p>Även här: ${names.slice(1, 3).map(esc).join(', ')}</p>` : '';
    } else {
      const names = polities.map(name);
      where = `<p>${names.length <= 3
        ? `Rike: ${names.map(esc).join(', ')}`
        : `Ett av ${names.length} riken i det här området med ${esc(t(r.name).toLowerCase())}`}</p>`;
    }
    this.pop.innerHTML = `<button type="button" class="detail-close" data-close aria-label="Stäng">×</button>
      <div class="rp-head"><span class="swatch" style="background:${esc(r.color)}"></span>${symbolImg(r)}<strong>${head}</strong></div>
      ${where}
      ${snapshot.inherited ? this.inheritedNote(hit, name) : snapshot.sure === false ? '<p class="rp-note">Osäker uppgift: rikets faktaruta på Wikipedia pekar inte ut en officiell eller tydligt största religion, så området visas med den som nämns först. Därför är det ljusare med streckad kant.</p>' : ''}
      ${r.facts ? `<button type="button" class="info-btn rp-more" data-facts="${esc(r.id)}">Läs mer om ${esc(t(r.name).toLowerCase())}</button>` : ''}
      ${here?.[0]?.wikipedia && /^https:\/\/[a-z]+\.wikipedia\.org\//.test(here[0].wikipedia) ? `<a class="rp-wiki" href="${esc(here[0].wikipedia)}" target="_blank" rel="noopener noreferrer">Läs om ${esc(name(here[0]))} på Wikipedia<span class="sr-only"> (öppnas i en ny flik)</span><span aria-hidden="true"> ↗</span></a>` : ''}`;
    this.pop.hidden = false;
    const host = this.pop.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0, width: innerWidth, height: innerHeight };
    const w = this.pop.offsetWidth, h = this.pop.offsetHeight;
    const left = Math.min(Math.max(8, x - host.left - w / 2), host.width - w - 8);
    const top = Math.min(Math.max(8, y - host.top + 14), host.height - h - 8);
    this.pop.style.left = `${left}px`; this.pop.style.top = `${top}px`;
  }

  /**
   * Förklaringen för ett ärvt område (#269): varför riket på platsen inte har någon religion i lagret, och
   * att området visas med religionen det hade tidigare, med året och rikena där den senast stod i faktarutan.
   */
  inheritedNote(hit, name) {
    const { religion: r, snapshot: s, polities, here } = hit;
    const p = here?.[0] ?? (polities.length === 1 ? polities[0] : null);
    const who = p ? `faktarutan för ${esc(name(p))}` : 'rikenas faktarutor här';
    const Who = who[0].toUpperCase() + who.slice(1);
    const later = p && [p.since, p.christianSince].find(y => y > s.start);
    const why = !p || p.rule === 'saknas' ? `${Who} saknar religion.`
      : later ? `Religionen i ${who} gäller först från ${esc(formatYear(later))}.`
      : /%/.test(p.text ?? '') ? `${Who} anger bara andelar ur en senare folkräkning, som inte används för den här tiden.`
      : `${Who} anger ingen religion som finns i lagret.`;
    const from = [...new Set(s.inherited.from.map(n => name({ name: n })))];
    const fromText = from.length <= 3 ? from.map(esc).join(', ') : `${from.slice(0, 2).map(esc).join(', ')} med flera`;
    return `<p class="rp-note">Ärvt område. ${why} Området visas med ${esc(t(r.name).toLowerCase())}, som det hade på kartan fram till ${
      esc(formatYear(s.inherited.until))} (${fromText}).</p>`;
  }

  hidePop() { this.pop.hidden = true; }

  /**
   * Liten ruta med religionens symbol och namn där muspekaren är (#271), innan man klickar. tip = elementet
   * #religion-tip. hit = ReligionsLayer.hitTest(), eller null för att dölja rutan.
   */
  showTip(tip, hit, x, y) {
    if (!hit) { tip.hidden = true; return; }
    const { religion: r, snapshot: s } = hit;
    const html = `<span class="swatch" style="background:${esc(r.color)}"></span>${symbolImg(r)}<span>${esc(t(r.name))}${
      s.inherited ? ' <em>(ärvt)</em>' : s.sure === false ? ' <em>(osäkert)</em>' : ''}</span>`;
    if (tip._html !== html) tip.innerHTML = tip._html = html;
    tip.hidden = false;
    const host = tip.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0, width: innerWidth, height: innerHeight };
    const w = tip.offsetWidth;
    tip.style.left = `${Math.min(Math.max(8, x - host.left + 14), host.width - w - 8)}px`;
    tip.style.top = `${Math.max(8, y - host.top + 16)}px`;
  }
}
