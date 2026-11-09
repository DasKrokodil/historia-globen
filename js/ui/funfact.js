// Samtidigt-kortet: fun facts och annat som hände samtidigt (till exempel när ett krig
// bryter ut). Kortet visas när året ligger inom postens intervall, med bågar på globen
// mellan de platser som hör ihop. Det kan fällas ihop till en flik (#120).
// I smal skärm (högst 760 px) är kortet en panel underifrån med tre lägen (#239): stängd (handtag och
// rubrikraden), halv och hel. Man drar i handtaget eller trycker på det, och kortet stängs när man drar i globen.
import { CAT, REVIEW, REGIONS, region, t, formatYear, formatEventTime, styleFor, isVisibleReview, reviewLabel, REVIEW_SUBJECT_HELP, needDetails } from '../model.js';
import { ui } from '../i18n.js';

// Kortets slag (funfact, war, empire, vanished); rubriken står i ff.kind.<slag> i data/ui/ (#670)
const kindLabel = kind => ui(`ff.kind.${kind}`);

/**
 * Rikets berättelse (#171): rikets nyckelår (facts.milestones i empires/index.json) som kort
 * i Samtidigt-kortet när man följer riket i Fokus. Kortet visas från nyckelåret till året före
 * nästa nyckelår, högst 25 år. Länkade händelser (events) visas som knappar, inte som text.
 */
export function empireStory(group, byId) {
  const ms = [...(group?.facts?.milestones ?? [])].sort((a, b) => a.year - b.year);
  return ms.map((m, i) => ({
    id: `empire-${group.id}-${m.year}`, kind: 'empire', year: m.year, empire: t(group.name), vanished: !!group.vanished, // försvunnet land (#72)
    show: [m.year, Math.min((ms[i + 1]?.year ?? Infinity) - 1, m.year + 25)],
    events: (m.events ?? []).filter(id => byId[id]),
    label: t(m.label) || formatYear(m.year), title: t(m.title), body: t(m.text), mapNote: t(m.mapNote),
    sources: m.sources ?? [], review: group.facts.review,
  }));
}
// Grafisk symbol när ett krigskort saknar bilder (#237): händelsens egen ikon, annars kategorins.
const CAT_ICON = { krig: 'swords', civilisationer: 'crown', religion: 'dome', vetenskap: 'scroll', upptackter: 'ship', kultur: 'columns', rymden: 'rocket', ekonomi: 'ship', klimat: 'mountain-city' };
// Panelens lägen i smal skärm (#239), från minst till störst
const SHEET = ['closed', 'half', 'full'];
const narrow = matchMedia('(max-width: 760px)');
const HINT_KEY = 'hg-ff-drag-hint'; // "Dra upp för mer" har visats (#310)
const HINT_MS = 6000;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * Väljer en redan synlig fun fact med en uttrycklig, jämn turordning mellan
 * världsdelarna. En fact får vara kandidat för varje världsdel där någon av
 * dess länkade händelser ligger. Vid lika många tidigare val bryter seedet
 * lika, och nästa fact inom världsdelen väljs också deterministiskt. De fem
 * senast visade facts hoppas över när det finns en annan kandidat i tur.
 */
export function pickBalancedFunFact(funfacts, byId, counts, seed, recent = []) {
  const candidates = new Map(REGIONS.map(name => [name, []]));
  for (const fact of funfacts) {
    if (fact.kind || !isVisibleReview(fact.review)) continue;
    const regions = new Set(fact.events.map(id => byId[id]).filter(Boolean).map(event => {
      const [lon, lat] = event.location?.coordinates ?? [event._lon, event._lat];
      return Number.isFinite(lat) && Number.isFinite(lon) ? region(lat, lon) : null;
    }).filter(Boolean));
    for (const name of regions) candidates.get(name)?.push(fact);
  }
  const available = REGIONS.filter(name => candidates.get(name)?.length);
  if (!available.length) return null;
  const least = Math.min(...available.map(name => counts.get(name) ?? 0));
  const tied = available.filter(name => (counts.get(name) ?? 0) === least);
  const selectedRegion = tied[seed % tied.length];
  const options = candidates.get(selectedRegion);
  // Regionbalansen väljs före rotationen. Därmed blir inte den datatätaste
  // världsdelen vanligare bara för att en annan nyss har visats.
  const fresh = options.filter(fact => !recent.includes(fact.id));
  const rotation = fresh.length ? fresh : options;
  const fact = rotation[Math.floor(seed / tied.length) % rotation.length];
  counts.set(selectedRegion, (counts.get(selectedRegion) ?? 0) + 1);
  return { fact, region: selectedRegion };
}

export class FunFacts {
  constructor(els, { funfacts, byId, srcById, styles, surprise }) {
    Object.assign(this, els);
    this.all = funfacts; this.byId = byId; this.srcById = srcById; this.styles = styles;
    this.active = []; this.index = 0; this.shownKey = '';
    this.story = []; // rikets berättelse i fokus (#171), sätts av main.js
    this.pre = this.root.querySelector('.ff-pre');
    this.enabled = true; // fun facts är ett eget lager som kan slås av
    this.onArcs = () => {};
    this.onSelect = () => {}; // öppnar hela faktarutan ("Läs mer")
    this.onSources = () => {};
    this.onNew = () => {};
    this._announcedKey = '';
    this.announcementsEnabled = true;
    this.surprise = surprise;
    this.surpriseCounts = new Map();
    this.surpriseStep = 0;
    this.surpriseRecent = [];
    this.requestedId = null;
    this.onSurprise = () => {};
    this.minimized = false;
    try { this.minimized = localStorage.getItem('hg-ff-min') === '1'; } catch { /* utan lagring */ }
    // Panelen i smal skärm (#239): ihopfällt kort (minimized) visas som stängd panel i stället för en flik.
    // autoClosed: stängd av att man drar i globen. Det sparas inte, och nästa nya kort öppnar panelen igen.
    this.sheet = 'half'; this.autoClosed = false;
    // På bred skärm delar faktarutan och kortet samma läsyta (#998). Detta är
    // tillfälligt och ska därför inte skriva över besökarens sparade val ovan.
    this.detailOpen = false;
    // "Dra upp för mer" vid handtaget första gången panelen visas (#310). Utan lagring visas den varje gång.
    this.hint = this.root.querySelector('#ff-drag-hint');
    this.hintDone = false; this.hintTimer = 0;
    try { this.hintDone = localStorage.getItem(HINT_KEY) === '1'; } catch { /* utan lagring */ }
    this._initSheet();
    narrow.addEventListener('change', () => this._show());
    this.next.addEventListener('click', () => { this.index = (this.index + 1) % this.active.length; this._show(); });
    this.min.addEventListener('click', () => this.setMinimized(true));
    this.tab.addEventListener('click', () => this.setMinimized(false));
    // I smal skärm klipps texten efter tre rader; ett tryck på den visar hela (#168)
    this.text.addEventListener('click', () => this.root.classList.toggle('ff-open'));
    // Kortets källor räknas fram i main.js (händelsernas källor laddas först när de behövs, #337)
    this.srcBtn.addEventListener('click', () => { const f = this.active[this.index]; if (f) this.onSources(f); });
    this.surprise?.addEventListener('click', () => {
      const picked = this.nextSurprise;
      if (!picked) return;
      this.surpriseCounts.set(picked.region, (this.surpriseCounts.get(picked.region) ?? 0) + 1);
      this.surpriseStep++;
      this.surpriseRecent.push(picked.fact.id);
      if (this.surpriseRecent.length > 5) this.surpriseRecent.shift();
      this.requestedId = picked.fact.id;
      this._prepareSurprise(true);
      this.onSurprise(picked.fact, picked.region);
    });
    this._prepareSurprise();
  }

  /** Begränsa Visste du?-målet när tidslinjen följer ett fokus, så att visat år alltid kan nås (#997). */
  setSurpriseRange(getRange) {
    this.surpriseRange = getRange;
    this._prepareSurprise(true);
  }

  /** Förhandsvalet förbrukar varken regionbalans, steg eller listan över senast visade kort (#997). */
  _prepareSurprise(force = false) {
    const range = this.surpriseRange?.() ?? null;
    const rangeKey = range ? `${range.from}:${range.to}` : '';
    if (!force && rangeKey === this.surpriseRangeKey) return;
    this.surpriseRangeKey = rangeKey;
    const choices = range ? this.all.filter(fact => fact.show[0] >= range.from && fact.show[0] <= range.to) : this.all;
    this.nextSurprise = pickBalancedFunFact(choices, this.byId, new Map(this.surpriseCounts), this.surpriseStep, this.surpriseRecent);
    if (!this.surprise) return;
    const fact = this.nextSurprise?.fact;
    this.surprise.disabled = !fact;
    this.surprise.textContent = fact ? ui('ff.surpriseTarget', { year: formatYear(fact.show[0]) }) : ui('ff.surprise');
    if (fact) this.surprise.dataset.year = String(fact.show[0]);
    else delete this.surprise.dataset.year;
  }

  /** themeIds: händelserna i temat man följer (#398), eller null. Då visas bara kort vars händelser alla ingår i temat. */
  update(year, filters, themeIds = null) {
    this._prepareSurprise();
    // Rikets berättelse hör till fokusläget och visas även när Samtidigt-lagret är av, först i kortet
    const story = this.story.filter(f => year >= f.show[0] && year <= f.show[1] && isVisibleReview(f.review));
    const active = [...story, ...(!this.enabled ? [] : this.all.filter(f =>
      year >= f.show[0] && year <= f.show[1] &&
      isVisibleReview(f.review) &&
      f.events.every(id => this.byId[id] && (themeIds ? themeIds.has(id) : filters.has(this.byId[id].category))))
      // Kort som jämför flera händelser (samtidighet) först, sedan det som började senast, så att det nya syns
      .sort((a, b) => (b.events.length > 1) - (a.events.length > 1) || b.show[0] - a.show[0]))];
    const key = active.map(f => f.id).join('|');
    const requestedIndex = this.requestedId ? active.findIndex(f => f.id === this.requestedId) : -1;
    if (key === this.shownKey && requestedIndex < 0) return;
    // Rikets berättelse pausar uppspelningen själv (main.js), med egen orsak och eget val i Lager
    const fresh = active.some(f => f.kind !== 'empire' && !this.active.includes(f));
    this.shownKey = key; this.active = active; this.index = requestedIndex >= 0 ? requestedIndex : 0;
    this.requestedId = null;
    if (fresh && this.autoClosed) { this.autoClosed = false; this.sheet = 'half'; }
    this._show();
    if (fresh) this.onNew();
  }

  /** Fäll ihop kortet till en flik, eller öppna det igen. Valet sparas. */
  setMinimized(on) {
    this.minimized = on; this.autoClosed = false;
    try { localStorage.setItem('hg-ff-min', on ? '1' : '0'); } catch { /* utan lagring */ }
    this._show();
    if (!narrow.matches) (on ? this.tab : this.min).focus?.();
  }

  /** Faktarutan ersätter kortet i bred skärm, men aldrig mobilens ark. */
  setDetailOpen(open) {
    this.detailOpen = open;
    this._show();
  }

  /** Panelens läge i smal skärm: stängd, halv eller hel (#239). */
  get sheetState() { return this.minimized || this.autoClosed ? 'closed' : this.sheet; }

  /** Byt panelens läge. Att stänga med handtaget är samma val som att fälla ihop kortet (sparas, ingen paus). */
  setSheet(state) {
    if (state === 'closed') return this.setMinimized(true);
    this.sheet = state;
    if (this.minimized) this.setMinimized(false);
    else { this.autoClosed = false; this._show(); }
  }

  /** Stäng panelen när man drar i globen (bara smal skärm). Valet sparas inte. */
  autoClose() {
    if (!narrow.matches || this.sheetState === 'closed' || this.root.hidden) return;
    this.autoClosed = true;
    this._show();
  }

  /**
   * Handtaget (#239): ett tryck stegar stängd → halv → hel → stängd, piltangenterna upp och ner byter läge, och
   * man kan dra. Medan man drar följer kortets höjd fingret, och när man släpper väljs det läge vars höjd ligger
   * närmast. Rubrikraden öppnar också en stängd panel, så att tryckytan blir större.
   */
  _initSheet() {
    const h = this.handle;
    if (!h) return;
    const step = d => this.setSheet(SHEET[Math.max(0, Math.min(2, SHEET.indexOf(this.sheetState) + d))]);
    let drag = null;
    h.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); this._hideHint(); step(e.key === 'ArrowUp' ? 1 : -1); }
    });
    h.addEventListener('pointerdown', e => {
      if (!narrow.matches) return;
      h.setPointerCapture(e.pointerId);
      drag = { id: e.pointerId, y: e.clientY, moved: false, heights: this._measureSheet() };
      drag.h0 = drag.heights[this.sheetState];
    });
    h.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dy) < 8) return;
      drag.moved = true;
      this._hideHint();
      const { closed, full } = drag.heights;
      this.root.classList.add('ff-dragging');
      this.root.style.height = `${Math.max(closed, Math.min(full, drag.h0 - dy))}px`;
    });
    const end = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (!d.moved) return; // ett tryck hanteras av click
      const now = this.root.getBoundingClientRect().height;
      this.root.classList.remove('ff-dragging');
      this.root.style.height = '';
      const near = SHEET.reduce((a, b) => Math.abs(d.heights[b] - now) < Math.abs(d.heights[a] - now) ? b : a);
      this._dragged = true; // klicket som följer på ett drag ska inte också stega
      this.setSheet(near);
    };
    h.addEventListener('pointerup', end);
    h.addEventListener('pointercancel', end);
    h.addEventListener('click', () => {
      if (this._dragged) { this._dragged = false; return; }
      this._hideHint();
      this.setSheet(SHEET[(SHEET.indexOf(this.sheetState) + 1) % 3]);
    });
    this.root.querySelector('.ff-eyebrow')?.addEventListener('click', e => {
      if (narrow.matches && this.sheetState === 'closed' && !e.target.closest('button')) this.setSheet('half');
    });
  }

  /** Kortets höjd i de tre lägena, mätt utan att något ritas (klassen byts och återställs i samma steg). */
  _measureSheet() {
    const cls = this.root.classList, cur = `ff-s-${this.sheetState}`, out = {};
    cls.remove(cur);
    for (const s of SHEET) { cls.add(`ff-s-${s}`); out[s] = this.root.getBoundingClientRect().height; cls.remove(`ff-s-${s}`); }
    cls.add(cur);
    return out;
  }

  /** Visa "Dra upp för mer" en gång, när panelen syns i smal skärm och kan dras upp. Försvinner av sig själv. */
  _maybeHint() {
    if (!this.hint || this.hintDone) return;
    if (!this.hint.hidden) { if (this.sheetState === 'full' || !narrow.matches) this._hideHint(); return; }
    if (!narrow.matches || this.root.hidden || this.sheetState === 'full') return;
    this.hint.hidden = false;
    try { localStorage.setItem(HINT_KEY, '1'); } catch { /* utan lagring */ }
    this.hintTimer = setTimeout(() => this._hideHint(), HINT_MS);
  }

  _hideHint() {
    if (!this.hint || this.hintDone) return;
    this.hintDone = true;
    this.hint.hidden = true;
    clearTimeout(this.hintTimer);
  }

  /** Handtagets läge för skärmläsare och tangentbord. */
  _syncSheet() {
    const st = this.sheetState;
    for (const s of SHEET) this.root.classList.toggle(`ff-s-${s}`, narrow.matches && s === st);
    if (!this.handle) return;
    this.handle.setAttribute('aria-expanded', String(st !== 'closed'));
    this.handle.setAttribute('aria-label', ui('ff.handle', { state: ui(`ff.sheet.${st}`), action: ui(st === 'full' ? 'ff.handle.close' : 'ff.handle.open') }));
  }

  /**
   * Bilderna överst i kortet (#190): händelsernas bilder visas alltid, högst tre sida vid sida, utan text
   * under dem utom händelsens namn (när det är flera) och "Läs mer", som öppnar hela faktarutan med
   * bildtext, kredit och licens. Illustrationer får etiketten "Illustration" i hörnet (bildregel 2:
   * den fulla märkningen står i faktarutan). Bildlösa händelser får i stället en avsiktlig
   * reservruta med kategori, ikon, år och titel i samma rad och höjd som bildkorten (#542).
   */
  _renderPics(evs, kind) {
    const withImg = evs.filter(e => e.image), rest = evs.filter(e => !e.image);
    const shown = [...withImg, ...rest].slice(0, 3);
    this.pics.hidden = !shown.length;
    this.root.classList.toggle('ff-has-pics', !!shown.length);
    this.root.classList.remove('ff-sym');
    if (!withImg.length && kind === 'war' && evs.length) return this._renderSymbol(evs[0]);
    if (!shown.length) { this.pics.innerHTML = ''; return; }
    this.pics.style.setProperty('--n', shown.length);
    this.pics.innerHTML = shown.map(e => {
      const st = styleFor(e, this.styles), img = e.image, reserve = !img;
      const icon = e.icon || CAT_ICON[e.category] || 'star';
      const category = t(CAT[e.category]?.name) || e.category;
      const year = formatYear(e.start);
      const label = !img ? '' : img.placeholder ? ui('image.placeholder') : img.kind === 'illustration' ? ui('ff.illustration') : '';
      return `<button type="button" class="ff-pic frame-${st.frame}${reserve ? ' ff-reserve' : ''}" data-id="${esc(e.id)}" aria-label="${esc(`${reserve ? `${category}, ${year}, ${t(e.title)}` : ui('ff.pictureCard')}: ${ui('ff.readMoreAbout', { title: t(e.title) })}`)}"${reserve ? ` style="--ff-reserve-color:${esc(CAT[e.category]?.color || 'var(--brass)')}"` : ''}>
        ${img ? `<img src="${esc(img.file)}" alt="" width="800" height="600">` : `<span class="ff-reserve-top" aria-hidden="true"><img class="ff-reserve-icon" src="img/icons/${esc(icon)}.svg" alt="" width="40" height="40"><span class="ff-reserve-year">${esc(year)}</span></span><span class="ff-reserve-category" aria-hidden="true">${esc(category)}</span>`}
        ${label ? `<span class="ff-badge">${esc(label)}</span>` : ''}
        <span class="ff-cap">${shown.length > 1 || reserve ? `<span class="ff-name">${esc(t(e.title))}</span>` : ''}<span class="ff-more">${esc(ui('ff.readMore'))}</span></span>
      </button>`;
    }).join('');
    for (const b of this.pics.querySelectorAll('.ff-pic')) b.addEventListener('click', () => this.onSelect(b.dataset.id));
  }

  /**
   * Krigskort utan bild (#237): en egenritad grafisk symbol (ikon i stor storlek på tidsålderns ram), märkt
   * "Grafisk symbol" och aldrig "Illustration", eftersom det varken är en bild eller en historisk bild.
   * Knapparna med händelserna under finns kvar, och symbolen öppnar faktarutan för krigets händelse.
   */
  _renderSymbol(e) {
    const st = styleFor(e, this.styles), icon = e.icon || CAT_ICON[e.category] || 'star';
    const category = t(CAT[e.category]?.name) || e.category;
    const year = formatYear(e.start);
    this.pics.hidden = false;
    this.root.classList.add('ff-sym');
    this.pics.style.setProperty('--n', 1);
    this.pics.innerHTML = `<button type="button" class="ff-pic ff-symbol ff-reserve frame-${st.frame}" data-id="${esc(e.id)}" aria-label="${esc(`${category}, ${year}, ${t(e.title)}: ${ui('ff.readMoreAbout', { title: t(e.title) })}`)}" style="--ff-reserve-color:${esc(CAT[e.category]?.color || 'var(--brass)')}">
      <span class="ff-reserve-top" aria-hidden="true"><img class="ff-reserve-icon" src="img/icons/${esc(icon)}.svg" alt="" width="40" height="40"><span class="ff-reserve-year">${esc(year)}</span></span>
      <span class="ff-reserve-category" aria-hidden="true">${esc(category)}</span>
      <span class="ff-badge">${esc(ui('ff.symbol'))}</span>
      <span class="ff-cap"><span class="ff-name">${esc(t(e.title))}</span><span class="ff-more">${esc(ui('ff.readMore'))}</span></span>
    </button>`;
    this.pics.querySelector('.ff-pic').addEventListener('click', ev => this.onSelect(ev.currentTarget.dataset.id));
  }

  highlightIds() {
    const f = this.active[this.index];
    return new Set(f && !this.minimized && !this.autoClosed ? f.events : []);
  }

  /** Texten som skärmläsaren får när ett nytt Samtidigt-kort visas. */
  announcement() {
    return `${this.kind.textContent.trim()}. ${this.text.textContent.trim()}`;
  }

  /** Intervallets egen live-rad får tala utan ett konkurrerande Samtidigt-kort (#977). */
  setAnnouncements(enabled) {
    if (this.announcementsEnabled === enabled) return;
    this.announcementsEnabled = enabled;
    this._announceRequest = (this._announceRequest ?? 0) + 1; // avbryt även en redan köad bildruta
    this._announcedKey = '';
    if (!enabled && this.status) this.status.textContent = '';
  }

  _announce(f) {
    if (!this.status || !this.announcementsEnabled) return;
    const text = this.announcement();
    const key = `${f.id}:${this.index}:${text}`;
    if (key === this._announcedKey) return;
    this._announcedKey = key;
    const request = (this._announceRequest ?? 0) + 1;
    this._announceRequest = request;
    this.status.textContent = '';
    requestAnimationFrame(() => {
      if (this._announceRequest === request) this.status.textContent = text;
    });
  }

  _show() {
    const f = this.active[this.index];
    // I smal skärm är det ihopfällda kortet en stängd panel, inte en flik (#239)
    const asSheet = narrow.matches;
    this.tab.hidden = !f || !this.minimized || asSheet;
    this.tabCount.textContent = String(this.active.length);
    this._syncSheet();
    if (!f || (this.minimized && !asSheet) || (this.detailOpen && !asSheet)) { this.root.hidden = true; this.root.dataset.funfactId = ''; this._announcedKey = ''; this.onArcs([]); return; }
    this.root.dataset.funfactId = f.id;
    const story = f.kind === 'empire';
    this.root.classList.toggle('ff-story', story);
    this.root.classList.remove('ff-open');
    if (this.pre) this.pre.hidden = story;
    this.kind.textContent = story ? `${kindLabel(f.vanished ? 'vanished' : 'empire')} · ${f.empire}` : kindLabel(f.kind ?? 'funfact');
    const evs = f.events.map(id => this.byId[id]);
    // Bilderna står i händelsernas långa fält, som laddas per period (#337): kortet ritas om när de har kommit
    needDetails(evs, { sources: false })?.then(() => { if (this.active[this.index] === f) this._show(); }).catch(err => console.error(err));
    this._renderPics(evs, f.kind);
    if (story) {
      this.text.innerHTML = `<span class="ff-story-head"><span class="ff-year">${esc(f.label)}</span> ${esc(f.title)}</span>`
        + `<span class="ff-story-text">${esc(f.body)}</span>`
        + (f.mapNote ? `<span class="ff-story-map"><b>${esc(ui('facts.aboutMapInline'))}</b> ${esc(f.mapNote)}</span>` : '');
    } else this.text.textContent = t(f.text);
    this.events.innerHTML = evs.map(e => `<button type="button" class="ff-chip" data-id="${esc(e.id)}">${e.image ? `<img class="ff-thumb" src="${esc(e.image.file)}" alt="" loading="lazy">` : `<span class="dot" style="background:${CAT[e.category]?.color}"></span>`}${f.kind === 'war' ? `<span class="ff-year">${esc(formatYear(e.start))}</span>` : ''}${esc(t(e.title))}</button>`).join('');
    for (const b of this.events.querySelectorAll('.ff-chip')) b.addEventListener('click', () => this.onSelect(b.dataset.id));
    const rv = REVIEW[f.review] ?? REVIEW.draft;
    this.review.className = `review-badge ${rv.cls}`;
    const subject = story ? (f.vanished ? 'Landet' : 'Riket') : f.kind === 'war' ? 'Kriget' : 'Fun facten';
    this.review.textContent = reviewLabel(f.review, subject);
    this.review.title = REVIEW_SUBJECT_HELP[subject];
    this.pager.textContent = this.active.length > 1 ? ui('ff.pager', { n: this.index + 1, total: this.active.length }) : '';
    this.next.hidden = this.active.length < 2;
    this.root.hidden = false;
    this._announce(f);
    this._maybeHint();
    // Bågar från första händelsen till de övriga (inte när panelen är stängd)
    const [a, ...rest] = evs;
    this.onArcs(story || (asSheet && this.sheetState === 'closed') ? [] : rest.map(b => [[a._lat, a._lon], [b._lat, b._lon]]));
  }
}
