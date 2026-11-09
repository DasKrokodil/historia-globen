// "Samtidigt i världen": lista över synliga händelser per världsdel, kategorifilter
// (i lagermenyn, #120, och som chips ovanför listan, #311) och faktarutan.
import { buildAreaCurve } from './areacurve.js';
import { CATEGORIES, CAT, REVIEW, REGIONS, region, styleFor, t, formatEventTime, formatYear, formatDate, reviewLabel, REVIEW_SUBJECT_HELP, REVIEW_HELP, symbolImg, isVisibleReview, needDetails, misconceptionsFor } from '../model.js';
import { ui, LANG } from '../i18n.js';
import { MIN_YEAR } from '../timeline.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Gränssnittets texter hämtas med ui() ur data/ui/<språk>.json (#670). Ett antal [en, flera] väljs med plural().
const plural = (key, n, vars = {}) => String(ui(key)[n === 1 ? 0 : 1]).replace(/\{(\w+)\}/g, (m, k) => (k === 'count' ? n : vars[k] ?? m));
const loadingHtml = () => `<p class="detail-loading" role="status">${esc(ui('detail.loading'))}</p>`;
/** Världsdelens namn på valt språk; REGIONS i model.js är id:n (svenska). */
export const regionName = r => ui(`region.${r}`);
/** Anteckningen är av typen disagreement (källorna skiljer sig, #613). Typen avgör, inte rubrikens ordval. */
export const sourcesDisagree = e => e.note?.kind === 'disagreement';
/** Källraden. pending = källregistret eller händelsens källor laddas fortfarande (#337): då står ingen rad alls. */
const srcLine = (srcs, pending) => pending ? '' : `<div class="src">${esc(ui('detail.source'))} ${srcs.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(', ') || esc(ui('detail.sourceMissing'))}</div>`;
/**
 * Vanliga missuppfattningar som hör till händelsen (#838, beslut 2026-11-07): vad många tror, vad källorna säger,
 * var missuppfattningen kom ifrån (hopfälld) och källorna. Texterna ligger i data/missuppfattningar.json.
 * Tom text när händelsen saknar missuppfattningar eller när källregistret ännu inte har laddats (pending).
 */
export function mythsHtml(list, srcById, pending = false) {
  if (pending) return '';
  return (list ?? []).map(m => {
    const rv = REVIEW[m.review] ?? REVIEW.draft;
    const srcs = (m.sources ?? []).map(id => srcById?.[id]).filter(Boolean);
    return `<aside class="detail-note detail-myth" data-myth="${esc(m.id)}">
      <h4>${esc(ui('detail.myth.title'))}</h4>
      <p class="myth-claim"><b>${esc(ui('detail.myth.claim'))}</b> ${esc(t(m.claim))}</p>
      <p class="myth-truth"><b>${esc(ui('detail.myth.truth'))}</b> ${esc(t(m.truth))}</p>
      <details class="myth-origin"><summary>${esc(ui('detail.myth.origin'))}</summary><p>${esc(t(m.origin))}</p></details>
      <div class="src">${esc(ui('detail.source'))} ${srcs.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(', ') || esc(ui('detail.sourceMissing'))}</div>
      <p class="myth-review"><span class="review-badge ${rv.cls}">${esc(reviewLabel(m.review, 'Missuppfattningen'))}</span></p>
    </aside>`;
  }).join('');
}
const EVIDENCE_FIELDS = ['summary', 'date', 'location', 'image', 'uncertainty'];
// Det viktigaste att ta med sig (#500, Rikards beslut 2026-11-03): krigets story.takeaways, grupperade efter
// vad källorna säger. Rubrikerna är vanlig svenska, så att osäkerheten förklaras i ord och inte med en symbol.
const TAKEAWAY_GROUPS = ['belagt', 'omtvistat', 'okant'];
/** Punkterna under sina rubriker, var och en med sin egen källa. Tom text när kriget saknar punkter. */
function takeawaysHtml(items, srcById, pending) {
  if (!items?.length) return '';
  const groups = TAKEAWAY_GROUPS.map(status => {
    const title = ui(`story.takeaway.${status}`);
    const own = items.filter(x => x.status === status);
    if (!own.length) return '';
    return `<h5 class="takeaway-head takeaway-${status}">${esc(title)}</h5><ul class="takeaways">${own.map(x => `<li>${esc(t(x.text))}${
      pending ? '' : `<span class="takeaway-src">${(x.sources ?? []).map(id => srcById[id]).filter(Boolean)
        .map(src => `<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.title)}</a>`).join(', ')}</span>`}</li>`).join('')}</ul>`;
  }).join('');
  const head = esc(ui('story.takeaways'));
  return groups && `<section class="takeaway-box" aria-label="${head}"><h4>${head}</h4>${groups}</section>`;
}
const EVIDENCE_ROLES = ['date', 'text', 'map', 'image', 'uncertainty'];

/**
 * Källor per påstående (#383). Saknas evidence lämnas den vanliga källraden helt
 * oförändrad. Samma källa har samma siffra vid flera påståenden, men kan visas
 * under flera roller i den fullständiga listan.
 */
export function evidenceView(e, srcs) {
  const refs = e.evidence && typeof e.evidence === 'object' ? e.evidence : {};
  const fieldRefs = field => Array.isArray(refs[field]) ? refs[field] : [];
  const byId = new Map(srcs.map(s => [s.id, s]));
  const numbers = new Map();
  const grouped = new Map(EVIDENCE_ROLES.map(role => [role, []]));
  let next = 1;
  for (const field of EVIDENCE_FIELDS) for (const ref of fieldRefs(field)) {
    const source = byId.get(ref.source);
    if (!source || !grouped.has(ref.role)) continue;
    if (!numbers.has(ref.source)) numbers.set(ref.source, next++);
    const rows = grouped.get(ref.role);
    if (!rows.some(row => row.id === ref.source)) rows.push({ ...source, n: numbers.get(ref.source) });
  }
  if (!numbers.size) return { marker: () => '', sources: '' };
  const marker = field => fieldRefs(field).map(ref => numbers.has(ref.source)
    ? `<sup class="evidence-ref"><a href="#evidence-${numbers.get(ref.source)}" aria-label="${esc(ui('detail.evidence.ref', { n: numbers.get(ref.source) }))}">[${numbers.get(ref.source)}]</a></sup>` : '').join('');
  const assigned = new Set(numbers.keys());
  const printed = new Set();
  const sections = EVIDENCE_ROLES.map(role => {
    const rows = grouped.get(role);
    return rows.length ? `<section class="evidence-group"><h5>${esc(ui(`detail.evidence.${role}`))}</h5><ol>${rows.map(source => {
      const target = !printed.has(source.id); printed.add(source.id);
      return sourceLink(source, target);
    }).join('')}</ol></section>` : '';
  }).join('');
  const unassigned = srcs.filter(s => !assigned.has(s.id));
  const other = unassigned.length ? `<section class="evidence-group"><h5>${esc(ui('detail.evidence.other'))}</h5><ol>${unassigned.map(sourceLink).join('')}</ol></section>` : '';
  return { marker, sources: `<section class="src evidence-sources"><h4>${esc(ui('detail.evidence.all'))}</h4>${sections}${other}</section>` };
}

function sourceLink(source, target = false) {
  target = target && source.n != null ? ` id="evidence-${source.n}"` : '';
  return `<li${target}><a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.title)}</a></li>`;
}

/** Börjar händelsen före tidslinjens första år (#942)? Reglaget kan då inte stå på dess första år. */
export const beforeTimelineStart = e => Number.isFinite(e?.start) && e.start < MIN_YEAR;

/** Källornas kontrollnivå och den historiska osäkerheten är olika saker (#364). */
export const uncertaintyRow = (e, copy = {}, evidence = '') => {
  const reasons = [];
  const edtf = e.edtf ?? '';
  if (edtf.includes('~')) reasons.push(t(copy.approximate));
  if (edtf.includes('?')) reasons.push(t(copy.uncertain));
  if (e.precision != null && e.precision < 9) reasons.push(t(copy.precision));
  if (e.locationPrecision) reasons.push(t(copy.place));
  if (sourcesDisagree(e)) reasons.push(t(copy.sourcesDisagree));
  return reasons.length ? `<p class="uncertainty-row" id="detail-uncertainty" tabindex="-1"><b>${esc(t(copy.label))}:</b> ${esc([...new Set(reasons)].join(' · '))}${evidence}</p>` : '';
};
/** Är händelsens datum osäkert (ungefärligt, osäkert, grov precision eller oense källor), med samma regler som uncertaintyRow? */
export const uncertainDate = e => {
  const edtf = e.edtf ?? '';
  return edtf.includes('~') || edtf.includes('?') || (e.precision != null && e.precision < 9) || sourcesDisagree(e);
};
/**
 * Kort markering i datumraden (#606) efter det som är osäkert: datumet (ungefärligt, osäkert, grov precision eller
 * oense källor, samma regler som uncertaintyRow) eller platsen. Den leder till raden Historisk osäkerhet.
 */
const uncertaintyMark = (e, what, copy = {}) => {
  const date = uncertainDate(e);
  if (!(what === 'date' ? date : !!e.locationPrecision)) return '';
  return ` <button type="button" class="unc-mark" data-unc-mark aria-controls="detail-uncertainty" title="${esc(t(copy.markTitle))}">${esc(t(copy.mark))}</button>`;
};

/**
 * Bild överst i faktarutan (#129): en riktig historisk bild med källa och licens, eller
 * en illustration i tidens bildtradition som alltid märks med en synlig bildtext.
 * Bilden finns bara i kortet, så den laddas först när kortet öppnas.
 */
export function figure(e, srcById, evidence = '') {
  const img = e.image;
  if (!img) return '';
  // Historiska bilder länkar licensen till filsidan i källregistret
  const src = img.source && srcById[img.source];
  const license = src ? `<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(img.license ?? src.license)}</a>` : esc(img.license ?? '');
  const credit = [img.credit && esc(img.credit), license].filter(Boolean).join(' · ');
  return `<figure class="detail-fig${img.placeholder ? ' is-placeholder' : ''}">
    ${img.placeholder ? `<span class="fig-badge">${esc(ui('image.placeholder'))}</span>` : ''}
    <img src="${esc(img.file)}" alt="${esc(t(img.caption))}" loading="lazy" width="800" height="600">
    <figcaption><span class="fig-caption">${esc(t(img.caption))}</span>${evidence}
      <span class="fig-credit">${credit}</span></figcaption>
  </figure>`;
}

/**
 * En bild som inte gick att hämta (404 eller nätfel) ersätts av en kort rad, så att faktarutan inte står med en
 * tom bildyta som ser trasig ut (#884). Bildtexten och kreditraden står kvar. Anropas från error-händelsen, som inte bubblar.
 */
export function markBrokenImage(img) {
  const fig = img?.closest?.('.detail-fig');
  if (!fig || fig.classList.contains('is-missing')) return false;
  fig.classList.add('is-missing');
  img.hidden = true;
  const note = document.createElement('p');
  note.className = 'fig-missing';
  note.setAttribute('role', 'status');
  note.textContent = ui('image.missing');
  img.after(note);
  return true;
}

/** Diskret knapp "Rapportera faktafel" nedtill i faktarutan, bredvid granskningsstatusen. */
const reportBtn = ({ type, id, label }) => `<button type="button" class="link-btn report-btn" data-report-type="${esc(type)}" data-report-id="${esc(id)}" data-report-label="${esc(label)}" aria-haspopup="dialog" aria-controls="feedback">${esc(ui('detail.report'))}</button>`;

/**
 * Granskningsstatusen nedtill i faktarutan, med en liten (i)-knapp (#310) som fäller ut vad statusarna betyder
 * och en knapp till Om källorna. Förklaringen ligger sist i raden och tar en egen rad.
 * Under märket står en kort rad som skiljer kontrollen av källorna från hur säker historien är (#786), så att
 * "två källor stämmer" inte läses som "säker historia" bredvid raden Historisk osäkerhet.
 */
const reviewRow = (status, subj) => {
  const rv = REVIEW[status] ?? REVIEW.draft;
  return `<span class="review-badge ${rv.cls}" title="${esc(REVIEW_SUBJECT_HELP[subj])}">${esc(reviewLabel(status, subj))}</span>
    <button type="button" class="review-info" data-review-info aria-expanded="false" aria-controls="review-help" aria-label="${esc(ui('review.info'))}" title="${esc(ui('review.info'))}">i</button>
    <p class="review-explain">${esc(ui('review.explain'))}</p>
    <div id="review-help" class="review-help" hidden>
      <ul>${REVIEW_HELP.map(h => `<li><b>${esc(REVIEW[h.status].label)}:</b> ${esc(h.text)}</li>`).join('')}</ul>
      <button type="button" class="link-btn" data-review-sources>${esc(ui('sources.title'))}</button>
    </div>`;
};

/**
 * Riken i kriget (#76): rikena i krigets empires, som knappar med rikets färg. Ett klick öppnar rikets faktaruta.
 * Slag och händelser i kriget visar sitt krigs riken (de ärver kopplingen via partOf).
 */
const empireList = groups => groups?.length ? `<div class="war-list empire-list"><h4>${esc(ui('detail.empiresInWar'))}</h4><ul>${groups.map(g =>
  `<li><button type="button" class="link-btn" data-empire="${esc(g.id)}"><span class="swatch" style="background:${esc(g.color)}"></span>${esc(t(g.name))}</button></li>`).join('')}</ul></div>` : '';

/**
 * Ett försvunnet lands årtal, föregångare och efterträdare (#72, vanished i empires/index.json). Ett land som finns
 * som rike blir en knapp (data-empire) som börjar följa det riket. Källornas oenighet står öppet under listan.
 */
function lineageHtml(v) {
  const names = list => list.map(x => {
    const g = x.group && v.groups.find(y => y.id === x.group);
    return g ? `<button type="button" class="link-btn" data-empire="${esc(g.id)}" data-follow>${esc(t(x.name))}</button>` : esc(t(x.name));
  }).join(', ');
  const rv = REVIEW[v.review] ?? REVIEW.draft;
  return `<dl class="religion-facts lineage">
      <dt>${esc(ui('facts.lineage.span'))}</dt><dd>${esc(formatEventTime({ start: v.founded, end: v.dissolved, edtf: '' }))}</dd>
      ${v.predecessors?.length ? `<dt>${esc(ui('facts.lineage.predecessors'))}</dt><dd>${names(v.predecessors)}</dd>` : ''}
      ${v.successors?.length ? `<dt>${esc(ui('facts.lineage.successors'))}</dt><dd>${names(v.successors)}</dd>` : ''}
    </dl>
    ${v.note ? `<p class="lineage-note">${esc(t(v.note))}</p>` : ''}
    <p class="lineage-note"><span class="review-badge ${rv.cls}">${esc(reviewLabel(v.review, 'Årtal och efterträdare'))}</span></p>`;
}

/**
 * Märkningen av taggar i faktarutan (#555), till exempel "Framsteg". En liten ruta som fälls ut med förklaringen,
 * med Tab och Enter; texterna står i data/vyer.json (tags). Taggar utan texter visas inte.
 */
function tagMarks(e, tags) {
  const marks = (Array.isArray(e.tags) ? e.tags : []).filter(tag => tags?.[tag]?.label).map(tag => {
    const c = tags[tag];
    return `<details class="tag-mark" data-tag="${esc(tag)}"><summary aria-label="${esc(c.markLabel || c.label)}">${esc(c.label)}</summary><p>${esc(c.about ?? '')}</p></details>`;
  });
  return marks.length ? `<div class="tag-marks">${marks.join('')}</div>` : '';
}

/** Varför listan är tom (#886): 'filters' när alla kategorier är avstängda, annars 'year' (inget kring året). */
export function emptyCause({ visibleCount, filters }) {
  if (visibleCount > 0) return null;
  return filters.size === 0 ? 'filters' : 'year';
}

export class Panel {
  constructor({ root, list, filters, chips, detail, sub, count, toggle, close }, { events, srcById, styles }, { empireLegend = {}, uncertainty = {}, panel = {}, tags = {} } = {}) {
    Object.assign(this, { root, list, filtersEl: filters, detail, sub, count, toggle, srcById, styles, empireLegend, uncertainty });
    // Taggar (#555): texterna ur data/vyer.json, taggen som vyn visar och hur många synliga händelser som har varje tagg
    this.tags = tags ?? {};
    this.tag = null;
    this.tagCounts = new Map();
    for (const e of events) for (const tag of (isVisibleReview(e.review) && Array.isArray(e.tags) ? e.tags : [])) this.tagCounts.set(tag, (this.tagCounts.get(tag) ?? 0) + 1);
    // Bilden i faktarutan som inte laddas (#884): error bubblar inte, så lyssnaren fångar på vägen ned
    detail.addEventListener('error', ev => { if (ev.target?.tagName === 'IMG') markBrokenImage(ev.target); }, true);
    this.onSelect = () => {};
    this.onFilter = () => {};
    this.onSources = () => {};
    this.onFocus = () => {};
    this.onEmpire = () => {}; // (rikets id) => rikets faktaruta (#76)
    this.onOpen = () => {};
    this.onEnableEvents = () => {};
    this.onYear = () => {};
    this.onReport = null; // (objekt, knapp) => öppnar formuläret "Rapportera faktafel" (js/ui/feedback.js)
    this.onShowPlace = null; // (händelse) => platsraden i mobil (#312): fäller ihop rutan och visar markören på globen
    this.selectedId = null;
    this.shown = null; // det faktarutan visar just nu; en rad som laddas klart ritar bara om samma ruta (#337)
    this.expandedRegions = new Set();
    this.longOpen = false;
    this.copy = panel;

    // Visa bara kategorier som har händelser, i den fasta ordningen. Samma chips finns på två ställen:
    // under Lager (#120) och ovanför listan i panelen (#311). Båda styr samma filter, så de följs åt.
    const used = new Set(events.map(e => e.category));
    this.allCategories = used;
    this.filters = new Set(used);
    const boxes = [filters, chips].filter(Boolean);
    for (const c of CATEGORIES.filter(c => used.has(c.id))) {
      for (const box of boxes) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'filter'; b.dataset.cat = c.id; b.setAttribute('aria-pressed', 'true');
        b.innerHTML = `<span class="dot" style="background:${c.color}"></span>${esc(t(c.name))}`;
        b.addEventListener('click', () => {
          const on = this.filters.has(c.id);
          on ? this.filters.delete(c.id) : this.filters.add(c.id);
          for (const x of boxes) x.querySelector(`[data-cat="${c.id}"]`)?.setAttribute('aria-pressed', String(!on));
          this.onFilter(this.filters);
        });
        box.append(b);
      }
    }

    toggle.addEventListener('click', () => {
      this.setOpen(!root.classList.contains('open'));
      if (root.classList.contains('open')) close?.focus({ preventScroll: true }); // fokus in i panelen (#246)
    });
    close?.addEventListener('click', () => this.setOpen(false));
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') { this.setOpen(false); if (!detail.hidden) this.onSelect(null); } });
  }

  /** Kategorierna som syns, utifrån (en delad länk, #501). Båda raderna med chips följer med. */
  setFilters(ids) {
    this.filters = new Set(ids);
    for (const b of this.root.ownerDocument.querySelectorAll('.filter[data-cat]')) b.setAttribute('aria-pressed', String(this.filters.has(b.dataset.cat)));
    this.onFilter(this.filters);
  }

  /** Öppna eller stäng listan "Samtidigt i världen". */
  setOpen(open) {
    if (open) {
      // Under knappgruppen uppe till höger, som i smal skärm kan ligga på flera rader
      const r = (this.toggle.closest('.top-actions') ?? this.toggle).getBoundingClientRect();
      this.root.style.top = `${r.bottom + 8}px`;
      // Vid stor textzoom blir den effektiva höjden liten. Låt då listan använda nästan hela höjden och
      // rulla ovanpå tidslinjen, i stället för att dess innehåll försvinner bakom det reserverade utrymmet.
      if (innerWidth <= 760 && innerHeight < 500) {
        this.root.style.maxHeight = `calc(100dvh - ${r.bottom + 16}px)`;
      } else {
        // I dator går lådan ner till tidslinjen, i mobil täcker den högst 60 procent.
        this.root.style.maxHeight = innerWidth > 760 ? `calc(100dvh - ${r.bottom + 150}px)` : `min(60vh, calc(100dvh - ${r.bottom + 150}px))`;
      }
    }
    if (!open && this.root.contains(document.activeElement)) this.toggle.focus({ preventScroll: true }); // tillbaka till knappen (#246)
    this.root.classList.toggle('open', open);
    this.root.parentElement.classList.toggle('panel-open', open);
    this.toggle.setAttribute('aria-expanded', String(open));
    if (open) this.onOpen();
  }

  /**
   * labels (valfritt): { at, bare, within } i stället för "år 1879", "1879" och "±10 år", till exempel i fokusläget för korta krig (#204).
   * labels.range (#755): listan gäller ett tidsintervall. Händelser som bara delvis ligger inom det märks "delvis inom
   * intervallet", och osäkra datum (samma regler som uncertaintyRow) märks "osäkert datum", så att mängden inte ser
   * mer exakt ut än den är (förstudien till #569).
   */
  render(visible, year, window, eventsOn = true, labels = null) {
    if (!eventsOn) {
      this.count.textContent = '0';
      this.toggle.setAttribute('aria-label', t(this.copy.eventsOff));
      this.sub.textContent = t(this.copy.eventsOff);
      const help = document.createElement('p');
      help.className = 'empty-note';
      help.textContent = t(this.copy.eventsOffHelp);
      const enable = document.createElement('button');
      enable.type = 'button';
      enable.className = 'link-btn panel-enable-events';
      enable.textContent = t(this.copy.enableEvents);
      enable.setAttribute('aria-label', t(this.copy.enableEventsLabel));
      enable.addEventListener('click', () => {
        this.onEnableEvents();
        this.toggle.focus({ preventScroll: true });
      });
      this.list.replaceChildren(help, enable);
      return;
    }
    const inside = visible.filter(v => v.inside).length;
    // I intervallet finns inget "nära" (#974): märket räknar samma händelser som intervallraden, och de som bara pågår sedan länge
    // ligger kvar i listan men räknas inte som "nära" med ±0 år.
    const range = !!labels?.range;
    const near = range ? 0 : visible.length - inside;
    const copy = key => t(this.copy[key]) || key;
    const summary = copy('summary');
    const summaryText = summary.replace('{count}', visible.length).replace('{inside}', inside).replace('{near}', near);
    this.count.textContent = String(range ? inside : visible.length);
    this.toggle.setAttribute('aria-label', summaryText);
    // at = "år 1879" eller "den 3 maj 1940" (fokusläget för korta krig, #204); bare = samma tid utan "år"/"den"
    const at = labels?.at ?? ui('panel.atYear', { year: formatYear(year) }), bare = labels?.bare ?? formatYear(year);
    const within = labels?.within ?? plural('time.withinYears', Math.round(window), { n: Math.round(window) });
    const parts = [];
    parts.push(inside ? plural('panel.inside', inside, { at }) : ui('panel.noneAt', { at }));
    if (near) parts.push(ui('panel.near', { count: near, within }));
    const partialCount = range ? visible.filter(v => v.partial).length : 0;
    if (partialCount) parts.push(plural('range.partialCount', partialCount, { count: partialCount }));
    // I intervallet finns inget "nära": raden säger hur många som pågår under intervallet och hur många som sticker ut
    if (range) this.toggle.setAttribute('aria-label', `${parts.join(', ')}.`);
    const filtersOff = emptyCause({ visibleCount: visible.length, filters: this.filters }) === 'filters';
    this.sub.textContent = visible.length ? (range ? `${parts.join(', ')}.` : `${summaryText}. ${parts.join(', ')}.`)
      : range && !filtersOff ? ui('range.empty', { range: bare })
      : ui(filtersOff && !(this.tag && this.tags[this.tag]) ? 'panel.filtersOff' : 'panel.empty', { within, at: bare });
    const tagCopy = this.tag && this.tags[this.tag];
    if (!visible.length && tagCopy) {
      // Vyn med tagg (#555): säg om ingen händelse har taggen ännu, eller om det bara är tomt kring året
      const note = document.createElement('p');
      note.className = 'empty-note tag-empty';
      note.textContent = this.tagCounts.get(this.tag) ? (tagCopy.none ?? '').replace('{within}', within).replace('{at}', bare) : tagCopy.empty;
      this.sub.textContent = note.textContent;
      this.list.replaceChildren(note);
      return;
    }
    if (filtersOff) {
      // Alla kategorier av (#886): det är filtret som döljer händelserna, så dragning i tidslinjen hjälper inte
      const help = document.createElement('p');
      help.className = 'empty-note';
      help.textContent = ui('panel.filtersOffHelp');
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'link-btn panel-show-all-categories';
      reset.textContent = ui('panel.showAllCategories');
      reset.addEventListener('click', () => {
        this.setFilters(this.allCategories);
        // Knappen försvinner när listan ritas om: fokus till första kategorin, som ligger kvar
        (this.root.querySelector('.filter[data-cat]') ?? this.toggle).focus({ preventScroll: true });
      });
      this.list.replaceChildren(help, reset);
      return;
    }
    if (!visible.length) {
      this.list.innerHTML = `<p class="empty-note">${esc(ui('panel.emptyHelp'))}</p>`;
      return;
    }
    // Grupperat per världsdel, i fast ordning, så att man ser vad som händer på olika håll
    const groups = new Map(REGIONS.map(r => [r, []]));
    const old = [];
    for (const v of visible) (v.longRunning ? old : groups.get(v.e._region ??= region(v.e._lat, v.e._lon))).push(v);
    const rank = (a, b) => (b.e.top - a.e.top) || (b.e.major - a.e.major) || (b.inside - a.inside) || (Math.abs(a.e.start - year) - Math.abs(b.e.start - year)) || t(a.e.title).localeCompare(t(b.e.title), LANG);
    // I intervallet (#755): "delvis inom intervallet" och "osäkert datum" efter tiden och platsen
    const notes = (e, partial) => range ? [partial && ui('range.partial'), uncertainDate(e) && ui('range.uncertain')].filter(Boolean) : [];
    const row = ({ e, inside, partial }, name = '') => `
          <li class="event-item${inside ? '' : ' is-near'}${partial ? ' is-partial' : ''}${e.id === this.selectedId ? ' is-selected' : ''}">
            <button type="button" class="event-btn" data-id="${esc(e.id)}" aria-label="${esc([`${formatEventTime(e)}, ${t(e.title)}${name ? `, ${regionName(name)}` : ''}`, ...notes(e, partial), reviewLabel(e.review, 'Händelsen')].join(', '))}"${e.id === this.selectedId ? ' aria-current="true"' : ''}>
              <span class="dot" style="background:${CAT[e.category]?.color}"></span><span class="ttl">${esc(t(e.title))}</span><span class="meta">${esc([formatEventTime(e), t(e.place), ...notes(e, partial)].join(' · '))}</span>
            </button>
          </li>`;
    this.list.innerHTML = [...groups].filter(([, vs]) => vs.length).map(([name, vs]) => {
      vs.sort(rank); const open = this.expandedRegions.has(name), shown = open ? vs : vs.slice(0, 5), rest = vs.length - shown.length;
      return `
      <section class="region-group">
        <h3 class="region-head">${esc(regionName(name))} <span class="region-count">${vs.length}</span></h3>
        <ol>${shown.map(v => row(v, name)).join('')}</ol>${vs.length > 5 ? `<button type="button" class="link-btn panel-more" data-region="${esc(name)}" aria-expanded="${open}" aria-label="${esc(open ? ui('panel.showLessIn', { label: copy('showLess'), region: regionName(name) }) : copy('showMore').replace('{count}', rest).replace('{region}', regionName(name)))}">${esc(open ? copy('showLess') : copy('showMore').replace('{count}', rest).replace('{region}', regionName(name)))}</button>` : ''}
      </section>`;
    }).join('') + (old.length ? `<section class="region-group long-running"><button type="button" class="link-btn panel-more" data-long aria-expanded="${this.longOpen}">${esc(copy('longRunning').replace('{count}', old.length))}</button>${this.longOpen ? `<ol>${old.sort(rank).map(v => row(v)).join('')}</ol>` : ''}</section>` : '');
    // Riktiga knappar: Enter och mellanslag fungerar av sig själva
    for (const b of this.list.querySelectorAll('.event-btn')) b.addEventListener('click', () => this.onSelect(b.dataset.id));
    for (const b of this.list.querySelectorAll('[data-region]')) b.addEventListener('click', () => { this.expandedRegions.has(b.dataset.region) ? this.expandedRegions.delete(b.dataset.region) : this.expandedRegions.add(b.dataset.region); this.render(visible, year, window, eventsOn, labels); });
    this.list.querySelector('[data-long]')?.addEventListener('click', () => { this.longOpen = !this.longOpen; this.render(visible, year, window, eventsOn, labels); });
  }

  /**
   * Rutan ritas direkt med det som finns, och en gång till när det som saknades har laddats (#337): händelsernas
   * långa fält och källregistret laddas först när de behövs. Ritas något annat i rutan under tiden händer ingenting.
   */
  _whenLoaded(pending, redraw) {
    const token = this.shown = {};
    pending?.then(() => { if (this.shown === token && !this.detail.hidden) redraw(); }).catch(err => console.error(err));
    return !!pending;
  }

  /** En tom ruta med händelsens namn medan det som ska stå i den laddas. */
  _loading(e) {
    this.selectedId = e.id;
    this.detail.className = `detail detail-card frame-${styleFor(e, this.styles).frame}`;
    this.detail.innerHTML = `<button type="button" class="detail-close" data-close aria-label="${esc(ui('common.close'))}">×</button>
      <h3>${esc(t(e.title))}</h3><div class="meta">${esc(formatEventTime(e))} · ${esc(t(e.place))}</div>${loadingHtml()}`;
    this.detail.hidden = false;
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
  }

  /**
   * Krigets berättelse i fokusläget (#122): före start orsak och parter, i slutet
   * hur kriget slutade och hur många som dog. Uppgifterna finns i krigets story.
   * Ett pågående krig (#223) visar i stället läget i dag, kontrollerat story.asOf.
   */
  showStory(war, mode) {
    const pending = this._whenLoaded(needDetails([war]), () => this.showStory(war, mode));
    if (!war.story) return this._loading(war); // berättelsen kommer med händelsens långa fält
    const s = war.story;
    this.selectedId = war.id;
    // Samma ram efter tidsålder som faktarutan (#129)
    this.detail.className = `detail detail-card frame-${styleFor(war, this.styles).frame}`;
    const srcs = (s.sources ?? []).map(id => this.srcById[id]).filter(Boolean);
    const body = mode === 'intro' ? `
      <h4>${esc(ui('story.why'))}</h4><p>${esc(t(s.intro))}</p>
      <h4>${esc(ui('story.parties'))}</h4>
      <div class="parties">${s.parties.map(p => `<div><strong>${esc(t(p.name))}</strong><p>${esc(t(p.members))}</p></div>`).join('')}</div>
      ${empireList(war._empires)}
      <p class="story-hint">${esc(ui('story.hint'))}</p>${(() => { const tour = this.tourFor?.(war.id); return tour ? `<button type="button" class="story-tour" data-tour="${esc(tour.id)}">${esc(tour.label)}</button>` : ''; })()}` : war.ongoing ? `
      <h4>${esc(ui('story.today'))}</h4><p>${esc(t(s.outcome))}</p>
      <h4>${esc(ui('story.deadSoFar'))}</h4><p>${esc(t(s.casualties))}</p>
      ${takeawaysHtml(s.takeaways, this.srcById, pending)}` : `
      <h4>${esc(ui('story.outcome'))}</h4><p>${esc(t(s.outcome))}</p>
      <h4>${esc(ui('story.dead'))}</h4><p>${esc(t(s.casualties))}</p>
      ${takeawaysHtml(s.takeaways, this.srcById, pending)}
      ${empireList(war._empires)}`;
    const label = mode === 'intro' ? ui('story.labelIntro') : war.ongoing ? ui('story.labelToday', { date: formatDate(s.asOf) }) : ui('story.labelEnd');
    this.detail.innerHTML = `
      <button type="button" class="detail-close" data-close aria-label="${esc(ui('common.close'))}">×</button>
      <div class="story-label">${esc(label)}</div>
      <h3>${esc(t(war.title))}</h3>
      <div class="meta">${esc(formatEventTime(war))} · ${esc(t(war.place))}</div>
      <div class="story">${body}</div>
      ${srcLine(srcs, pending)}
      <div class="detail-actions">
        ${reviewRow(war.review, 'Kriget')}
        ${this.onReport ? reportBtn({ type: 'war', id: war.id, label: t(war.title) }) : ''}
      </div>`;
    this.detail.scrollTop = 0;
    this.detail.hidden = false;
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
    this.bindReport(war.start);
    this.bindLinks();
    this.bindReviewInfo(); // statusraden med (i) som i händelsens faktaruta (#608)
    this.detail.querySelector('[data-tour]')?.addEventListener('click', ev => this.onTour?.(ev.currentTarget.dataset.tour, ev.currentTarget));
  }

  /**
   * Introduktionskortet för ett tema i Fokus (#398): vad temat samlar, och dess händelser i tidsordning som knappar
   * som öppnar faktarutan. En händelse före tidslinjens början (#942) märks, eftersom reglaget inte når dit.
   */
  showTheme(theme, events) {
    this.selectedId = null;
    this.detail.className = `detail detail-card frame-${styleFor(events[0], this.styles).frame}`;
    const srcs = (theme.sources ?? []).map(id => this.srcById[id]).filter(Boolean);
    const items = events.map(e => `<li><button type="button" class="theme-event" data-theme-event="${esc(e.id)}"><span class="theme-event-year">${esc(formatEventTime(e))}</span> ${esc(t(e.title))}${e.start < MIN_YEAR ? ` <span class="theme-event-note">${esc(ui('theme.beforeScale'))}</span>` : ''}</button></li>`).join('');
    this.detail.innerHTML = `
      <button type="button" class="detail-close" data-close aria-label="${esc(ui('common.close'))}">×</button>
      <div class="story-label">${esc(ui('theme.label'))}</div>
      <h3>${esc(t(theme.name))}</h3>
      <div class="story"><p>${esc(t(theme.intro))}</p>
      <h4>${esc(ui('theme.events', { count: events.length }))}</h4>
      <ul class="theme-events">${items}</ul></div>
      ${srcs.length ? srcLine(srcs, false) : ''}`;
    this.detail.scrollTop = 0;
    this.detail.hidden = false;
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
    for (const b of this.detail.querySelectorAll('[data-theme-event]')) b.addEventListener('click', () => this.onThemeEvent?.(b.dataset.themeEvent));
  }

  /** Knappen "Rapportera faktafel" skickar bara objektets typ och id till formuläret. */
  bindReport(year) {
    this.detail.querySelector('[data-report-type]')?.addEventListener('click', ev => {
      const b = ev.currentTarget;
      this.onReport?.({ type: b.dataset.reportType, id: b.dataset.reportId, label: b.dataset.reportLabel, year }, b);
    });
  }

  /** Länkarna mellan krig och riken (#76): ett rike öppnar rikets faktaruta (med data-follow, #72: börjar följa riket), ett krig följs i fokusläget. */
  bindLinks() {
    for (const b of this.detail.querySelectorAll('[data-empire]')) b.addEventListener('click', () => this.onEmpire(b.dataset.empire, 'follow' in b.dataset));
    for (const b of this.detail.querySelectorAll('[data-follow-war]')) b.addEventListener('click', () => this.onFocus(b.dataset.followWar));
  }

  /**
   * Faktaruta om en religion (#90): vad det är, när och var den uppstod, grundare,
   * helig skrift och antal troende, med nyckelår som hoppar i tiden. Allt står i
   * religionens facts i religions.json. origin är händelsen där religionen uppstod,
   * som också är punkten på globen.
   */
  showReligion(r, origin, report = null) {
    this.showFacts({ kind: 'religion', name: t(r.name), color: r.color, symbol: symbolImg(r, 'rel-sym rel-sym-h'), facts: r.facts, origin,
      milestonesTitle: t(r.facts.milestonesTitle) || ui('facts.stateReligion'), report });
  }

  /**
   * Faktaruta med samma format för religioner (#90) och riken (#170): sammanfattning,
   * rader med rubrik och text, nyckelår som hoppar i tiden, källor och granskningsstatus.
   * origin = händelsen där religionen uppstod (länkas i rutan). place = { start, _lat, _lon }
   * som bestämmer rutans ram efter tidsålder, om det inte finns någon origin.
   * mapNote = förklaring om var kartans gränser kommer ifrån (riken: Cliopatria).
   * lineage = ett försvunnet lands vanished (#72) och groups (alla riken): när det bildades och upplöstes,
   * föregångare och vad det blev. Efterträdare som finns som riken är knappar som börjar följa det riket.
   */
  showFacts(opts) {
    const { kind, name, color, symbol = '', facts: f, origin = null, place = origin, milestonesTitle = ui('facts.milestones'), mapNote = '', curveId = '', wars = [], lineage = null, empireMap = false, empireId = null } = opts;
    const fall = empireId ? this.empireTourFor?.(empireId) : null; // rikets fall som tur (#499)
    // Rikets krig (#76): krig som anger riket i empires, i tidsordning; bara de som syns enligt granskningsstatusen
    const shownWars = wars.filter(w => isVisibleReview(w.review));
    // Ritas rutan om när källorna har kommit, ritas ytkurvan (#77) in igen om den hann komma före
    const pending = this._whenLoaded(needDetails([]), () => {
      const c = this.curveArgs;
      this.showFacts(opts);
      if (c && c[0] === curveId) this.setCurve(...c);
    });
    this.curveArgs = null;
    // kind: 'empire', 'vanished' (försvunnet land) eller 'religion'; namnet som visas står i facts.kind.<kind>
    const subj = kind === 'empire' ? 'Riket' : kind === 'vanished' ? 'Landet' : 'Religionen';
    const srcs = [...new Set([...(f.sources ?? []), ...(f.milestones ?? []).flatMap(m => m.sources ?? []), ...(lineage?.sources ?? [])])]
      .map(id => this.srcById[id]).filter(Boolean);
    // Riken har ofta mer fördjupning än ryms i det mobila arket. Sammanfattningen
    // står därför alltid först, medan utveckling och kartans underlag öppnas vid behov (#359).
    const isEmpire = kind === 'empire' || kind === 'vanished';
    const overview = `${lineage ? lineageHtml(lineage) : ''}
      <dl class="religion-facts">${(f.items ?? []).map(it => `<dt>${esc(t(it.label))}</dt><dd>${esc(t(it.text))}</dd>`).join('')}</dl>`;
    // Ett land med bara gräns och en not (kartan före fakta, #644) har inget att visa under Kortfattat
    const hasOverview = !!(lineage || f.items?.length);
    const development = `${curveId ? `<figure class="area-curve" data-curve="${esc(curveId)}" hidden></figure>` : ''}
      ${f.milestones?.length ? `<div class="war-list"><h4>${esc(milestonesTitle)}</h4><ol>${f.milestones.map(m =>
        `<li><button type="button" class="link-btn" data-year="${Number(m.year)}">${esc(t(m.label) || formatYear(m.year))}</button> ${m.title ? `<b>${esc(t(m.title))}.</b> ` : ''}${esc(t(m.text))}${m.mapNote ? ` <span class="ms-map">${esc(ui('facts.aboutMapInline'))} ${esc(t(m.mapNote))}</span>` : ''}</li>`).join('')}</ol></div>` : ''}
      ${shownWars.length ? `<div class="war-list empire-wars"><h4>${esc(ui('facts.wars'))}</h4><ol>${shownWars.map(w =>
        `<li><span class="meta">${esc(formatEventTime(w))}</span> <button type="button" class="link-btn" data-follow-war="${esc(w.id)}" title="${esc(ui('facts.followWar'))}">▶ ${esc(t(w.title))}</button></li>`).join('')}</ol></div>` : ''}`;
    const empireMapKey = empireMap ? [this.empireLegend.softEdge, this.empireLegend.influence].filter(Boolean).map(text => `<p class="map-key">${esc(text)}</p>`).join('') : '';
    const report = opts.report ?? null;
    const sourcesAndMap = `${mapNote ? `<aside class="detail-note"><h4>${esc(ui('facts.aboutMap'))}</h4><p>${esc(mapNote)}</p>${empireMapKey}</aside>` : ''}
      ${srcLine(srcs, pending)}
      <div class="detail-actions">${reviewRow(f.review, subj)}${this.onReport && report ? reportBtn(report) : ''}</div>`;
    const body = isEmpire ? `
      ${hasOverview ? `<details class="facts-section" open><summary>${esc(ui('facts.overview'))}</summary>${overview}</details>` : ''}
      ${development ? `<details class="facts-section"><summary>${esc(ui('facts.development'))}</summary>${development}</details>` : ''}
      <details class="facts-section"${hasOverview ? '' : ' open'}><summary>${esc(ui('facts.sourcesMap'))}</summary>${sourcesAndMap}</details>` : `
      ${overview}
      ${origin ? `<p class="war-link">${symbol ? ui('facts.originSymbol', { symbol: symbol.replace('rel-sym-h', 'rel-sym-in') }) : esc(ui('facts.origin'))} <button type="button" class="link-btn" data-goto="${esc(origin.id)}">${esc(t(origin.title))}</button> <span class="meta">${esc(formatEventTime(origin))} · ${esc(t(origin.place))}</span></p>` : ''}
      ${development}
      ${sourcesAndMap}`;
    this.selectedId = origin?.id ?? null;
    this.curve = null;
    this.detail.className = `detail detail-card${place ? ` frame-${styleFor(place, this.styles).frame}` : ''}`;
    delete this.detail.dataset.style;
    this.detail.innerHTML = `
      <button type="button" class="detail-close" data-close aria-label="${esc(ui('common.close'))}">×</button>
      <div class="story-label"><span class="swatch" style="background:${esc(color)}"></span>${esc(ui(`facts.kind.${kind}`))}</div>
      <h3>${symbol}${esc(name)}</h3>
      ${t(f.summary) ? `<p>${esc(t(f.summary))}</p>` : ''}
      ${fall ? `<button type="button" class="story-tour" data-tour="${esc(fall.id)}">${esc(fall.label)}</button>` : ''}
      ${body}`;
    this.detail.hidden = false;
    this.detail.scrollTop = 0; // efter hidden, annars behåller kortet förra läget
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
    for (const b of this.detail.querySelectorAll('[data-goto]')) b.addEventListener('click', () => this.onSelect(b.dataset.goto));
    for (const b of this.detail.querySelectorAll('[data-year]')) b.addEventListener('click', () => this.onYear(Number(b.dataset.year)));
    this.bindLinks();
    this.bindReviewInfo();
    if (report) this.bindReport(report.year);
    this.detail.querySelector('[data-tour]')?.addEventListener('click', ev => this.onTour?.(ev.currentTarget.dataset.tour, ev.currentTarget));
  }

  /**
   * Rikets yta över tid (#77), när rikets fil har laddats. Fylls i rutan om den fortfarande visar samma rike.
   * Markören följer året via setCurveYear().
   */
  setCurve(id, polities, { from, to, color }, year) {
    this.curveArgs = [id, polities, { from, to, color }, year];
    const fig = this.detail.querySelector(`.area-curve[data-curve="${CSS.escape(id)}"]`);
    const curve = fig && buildAreaCurve(polities, { from, to, color });
    if (!curve) return;
    fig.innerHTML = curve.html; fig.hidden = false;
    this.curve = { fig, curve };
    this.setCurveYear(year);
  }
  setCurveYear(year) {
    if (this.curve?.fig.isConnected) this.curve.curve.setYear(this.curve.fig, year);
  }

  /**
   * (i)-knappen vid granskningsstatusen (#310): fäller ut och in förklaringen. Escape stänger först förklaringen
   * och lämnar fokus på knappen; faktarutan stängs först vid nästa Escape.
   */
  bindReviewInfo() {
    const btn = this.detail.querySelector('[data-review-info]'), box = this.detail.querySelector('#review-help');
    if (!btn || !box) return;
    const set = open => { box.hidden = !open; btn.setAttribute('aria-expanded', String(open)); };
    btn.addEventListener('click', () => set(box.hidden));
    box.querySelector('[data-review-sources]').addEventListener('click', () => { set(false); this.onSources(); });
    this.detail.querySelector('.detail-actions').addEventListener('keydown', ev => {
      if (ev.key !== 'Escape' || box.hidden) return;
      ev.preventDefault(); ev.stopPropagation();
      set(false); btn.focus({ preventScroll: true });
    });
  }

  /** Faktarutan är ett eget kort (#112). show = false markerar händelsen utan att visa kortet. */
  showDetail(e, show = true) {
    this.selectedId = e?.id ?? null;
    if (!e || !show) { this.shown = null; delete this.detail.dataset.eventId; this.detail.hidden = true; return; }
    const pending = this._whenLoaded(needDetails([e], { misconceptions: true }), () => this.showDetail(e, show)), loading = pending && !e._full;
    // Wikidata länkas till händelsens egen post
    const srcs = (e.sources ?? []).map(id => id === 'wikidata' && e.wikidata
      ? { id, title: `Wikidata ${e.wikidata}`, url: `https://www.wikidata.org/wiki/${e.wikidata}` }
      : this.srcById[id] && { ...this.srcById[id], id }).filter(Boolean);
    const evidence = evidenceView(e, srcs);
    // Kortets ram följer händelsens tidsålder, med eller utan bild (#129)
    const st = styleFor(e, this.styles);
    // En omritning för samma händelse (när detaljfilen har laddats) behåller öppna märkningar
    const keepOpen = this.detail.dataset.eventId === e.id
      ? [...this.detail.querySelectorAll('details.tag-mark[open]')].map(d => d.dataset.tag) : [];
    this.detail.dataset.eventId = e.id;
    this.detail.className = `detail detail-card frame-${st.frame}`;
    this.detail.dataset.style = st.variant?.id ?? st.style.id;
    // Rubrik och datumrad först, sedan bilden (#605), så att man ser vad händelsen heter utan att rulla.
    // Platsen står en gång, i datumraden; mobilens knapp "Visa på globen" har platsen i sitt namn (#607).
    // Datumraden får en kort markering när händelsen har raden Historisk osäkerhet (#606).
    const unc = uncertaintyRow(e, this.uncertainty, evidence.marker('uncertainty'));
    this.detail.innerHTML = `
      <button type="button" class="detail-close" data-close aria-label="${esc(ui('common.close'))}">×</button>
      <h3>${esc(t(e.title))}</h3>
      <div class="meta">${esc(formatEventTime(e))}${evidence.marker('date')}${unc ? uncertaintyMark(e, 'date', this.uncertainty) : ''} · ${esc(t(e.place))}${evidence.marker('location')}${unc ? uncertaintyMark(e, 'place', this.uncertainty) : ''} · ${esc(t(CAT[e.category]?.name))}</div>
      ${beforeTimelineStart(e) ? `<p class="scale-note">${esc(ui('detail.beforeScale', { year: formatYear(MIN_YEAR) }))}</p>` : ''}
      ${tagMarks(e, this.tags)}
      ${this.onShowPlace ? `<button type="button" class="place-row" data-show-place aria-label="${esc(ui('detail.showPlaceLabel', { place: t(e.place) }))}"><span class="place-pin" aria-hidden="true"></span><span class="place-go">${esc(ui('detail.showPlace'))}</span></button>` : ''}
      ${figure(e, this.srcById, evidence.marker('image'))}
      ${loading ? loadingHtml() : `<p>${esc(t(e.summary))}${evidence.marker('summary')}</p>`}
      ${e.note ? `<aside class="detail-note"><h4>${esc(t(e.note.title))}</h4><p>${esc(t(e.note.text))}</p></aside>` : ''}
      ${loading ? '' : mythsHtml(misconceptionsFor(e.id), this.srcById, pending)}
      ${unc}
      ${e._war ? `<p class="war-link">${esc(ui('detail.partOf'))} <button type="button" class="link-btn" data-goto="${esc(e._war.id)}">${esc(t(e._war.title))}</button></p>` : ''}
      ${e.kind === 'war' ? `<button type="button" class="chip-btn focus-btn" data-focus="${esc(e.id)}">▶ ${esc(ui('detail.followWar'))}</button>` : ''}
      ${e._battles?.length ? `<div class="war-list"><h4>${esc(ui('detail.battles'))}</h4><ol>${e._battles.map(b =>
        `<li><button type="button" class="link-btn" data-goto="${esc(b.id)}">${esc(t(b.title))}</button> <span class="meta">${esc(formatEventTime(b))}</span></li>`).join('')}</ol></div>` : ''}
      ${empireList(e._empires ?? e._war?._empires)}
      ${evidence.sources || srcLine(srcs, pending)}
      ${(() => { const h = this.huntFor?.(e); return h ? `<button type="button" class="chip-btn hunt-add" data-hunt${h.disabled ? ' disabled' : ''}>${esc(h.label)}</button>` : ''; })()}
      <div class="detail-actions">
        ${reviewRow(e.review, 'Händelsen')}
        ${this.onReport ? reportBtn({ type: 'event', id: e.id, label: t(e.title) }) : ''}
      </div>`;
    for (const tag of keepOpen) this.detail.querySelector(`details.tag-mark[data-tag="${CSS.escape(tag)}"]`)?.setAttribute('open', '');
    this.detail.scrollTop = 0;
    this.detail.hidden = false;
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
    for (const b of this.detail.querySelectorAll('[data-goto]')) b.addEventListener('click', () => this.onSelect(b.dataset.goto));
    this.detail.querySelector('[data-focus]')?.addEventListener('click', ev => this.onFocus(ev.currentTarget.dataset.focus));
    this.detail.querySelector('[data-show-place]')?.addEventListener('click', () => this.onShowPlace(e));
    // Samtidighetsjakten (#741): lägg händelsen i jakten; knappen visar resultatet
    this.detail.querySelector('[data-hunt]')?.addEventListener('click', ev => {
      this.onHunt?.(e);
      const h = this.huntFor?.(e);
      if (h) { ev.currentTarget.textContent = h.label; ev.currentTarget.disabled = h.disabled; }
    });
    // Markeringen i datumraden visar förklaringen och flyttar fokus dit (#606)
    this.detail.querySelector('[data-unc-mark]')?.addEventListener('click', () => {
      const row = this.detail.querySelector('#detail-uncertainty');
      row?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      row?.focus({ preventScroll: true });
    });
    this.bindReport(e.start);
    this.bindLinks();
    this.bindReviewInfo();
  }
}
