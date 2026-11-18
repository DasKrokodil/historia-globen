// "Samtidigt i världen": lista över synliga händelser per världsdel, kategorifilter
// (i lagermenyn, #120, och som chips ovanför listan, #311) och faktarutan.
import { buildAreaCurve } from './areacurve.js';
import { CATEGORIES, CAT, REVIEW, REGIONS, region, styleFor, t, formatEventTime, formatOffset, edtfHasDays, formatYear, formatDate, reviewLabel, REVIEW_SUBJECT_HELP, REVIEW_HELP, symbolImg, flagUrl, isVisibleReview, eventTags, needDetails, misconceptionsFor, roundWindow, groupDigits, tagViewNote } from '../model.js';
import { ui, LANG, langAttr } from '../i18n.js';
import { say } from './status.js';
import { MIN_YEAR } from '../timeline.js';
import { MAX_YEAR } from '../state.js';
import { eventCitation } from './citation.js';
import { splitParagraphs } from '../paragraphs.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Gränssnittets texter hämtas med ui() ur data/ui/<språk>.json (#670). Ett antal [en, flera] väljs med plural().
const plural = (key, n, vars = {}) => String(ui(key)[n === 1 ? 0 : 1]).replace(/\{(\w+)\}/g, (m, k) => (k === 'count' ? n : vars[k] ?? m));
/** Långa faktatexter i korta stycken (#1571): samma ord, bara radbrytning mellan meningar. tail (källhänvisningen) hamnar sist i sista stycket. */
const paras = (text, tail = '', attrs = '') => splitParagraphs(text).map((x, i, all) => `<p${attrs}>${esc(x)}${i === all.length - 1 ? tail : ''}</p>`).join('');
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
export function takeawaysHtml(items, srcById, pending) {
  if (!items?.length) return '';
  const groups = TAKEAWAY_GROUPS.map(status => {
    const title = ui(`story.takeaway.${status}`);
    const own = items.filter(x => x.status === status);
    if (!own.length) return '';
    return `<h5 class="takeaway-head takeaway-${status}">${esc(title)}</h5><ul class="takeaways">${own.map(x => `<li>${esc(t(x.text))}${
      pending ? '' : `<span class="takeaway-src">${esc(ui('detail.source'))} ${(x.sources ?? []).map(id => srcById[id]).filter(Boolean)
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

/** Förhistoria före 10 000 f.Kr.: texten räknar i år sedan medan årtalen står i f.Kr., så faktarutan förklarar skillnaden (#1384). */
const inDeepTime = e => Number.isFinite(e?.start) && e.start < -9999;

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
  // Kredit och licens för våra egna illustrationer ligger i Källor och osäkerhet (#1571); bildens märkning "Illustration …, inte
  // en historisk bild" står alltid kvar under bilden. Kredit för historiska bilder (andras verk) står kvar vid bilden.
  const credit = img.kind === 'illustration' ? '' : imageCredit(e, srcById);
  return `<figure class="detail-fig${img.placeholder ? ' is-placeholder' : ''}">
    ${img.placeholder ? `<span class="fig-badge">${esc(ui('image.placeholder'))}</span>` : ''}
    <img src="${esc(img.file)}" alt="${esc(t(img.caption))}" loading="lazy" width="800" height="600">
    <figcaption><span class="fig-caption">${esc(t(img.caption))}</span>${evidence}
      ${credit ? `<span class="fig-credit">${credit}</span>` : ''}</figcaption>
  </figure>`;
}

/** Bildens kredit och licens som HTML; historiska bilder länkar licensen till filsidan i källregistret. */
export function imageCredit(e, srcById) {
  const img = e.image;
  if (!img) return '';
  const src = img.source && srcById[img.source];
  const license = src ? `<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(img.license ?? src.license)}</a>` : esc(img.license ?? '');
  return [img.credit && esc(img.credit), license].filter(Boolean).join(' · ');
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
  return `<span class="review-badge ${rv.cls}" title="${esc(REVIEW_SUBJECT_HELP[subj] ?? ui(`review.subjectHelp.${subj}`))}">${esc(reviewLabel(status, subj))}</span>
    <button type="button" class="review-info" data-review-info aria-expanded="false" aria-controls="review-help" aria-label="${esc(ui('review.info'))}" title="${esc(ui('review.info'))}">i</button>
    <p class="review-explain">${esc(ui('review.explain'))}</p>
    <div id="review-help" class="review-help" hidden>
      <ul>${REVIEW_HELP.map(h => `<li><b>${esc(REVIEW[h.status].label)}:</b> ${esc(h.text)}</li>`).join('')}</ul>
      <button type="button" class="link-btn" data-review-sources>${esc(ui('sources.title'))}</button>
    </div>`;
};

/**
 * "Hur vet vi det här?" (#937): en hopfälld rad under källistan med de fyra frågorna och svaret för just den här
 * uppgiften. Bara befintliga fält visas: källorna, granskningsnivån och anteckningen när den är av typen disagreement.
 * Samma uppbyggnad för händelse, rike och religion. tour = { id, label } länkar till turen om hur vi vet.
 */
export const howWeKnowRow = (srcs, status, disagree, tour = null) => {
  if (!srcs?.length && !status) return '';
  const rv = REVIEW[status] ?? REVIEW.draft;
  const level = status === 'draft' || !REVIEW[status] ? ui('how.level.draft') : `${rv.label}: ${ui(`review.help.${status}`)}`;
  const more = srcs.length > 1 ? ui('how.more.many', { n: srcs.length }) : ui('how.more.one');
  const agree = disagree ? ui('how.agree.differ') : status === 'two-sources' ? ui('how.agree.yes') : ui('how.agree.none');
  const links = srcs.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(', ') || esc(ui('detail.sourceMissing'));
  return `<details class="how-know${disagree ? ' is-differ' : ''}"><summary>${esc(ui('how.title'))}</summary>
    <dl>
      <dt>${esc(ui('how.q.who'))}</dt><dd>${links}</dd>
      <dt>${esc(ui('how.q.how'))}</dt><dd>${esc(level)}</dd>
      <dt>${esc(ui('how.q.more'))}</dt><dd>${esc(more)}</dd>
      <dt>${esc(ui('how.q.agree'))}</dt><dd>${esc(agree)}</dd>
    </dl>
    ${tour ? `<button type="button" class="link-btn how-tour" data-tour="${esc(tour.id)}">${esc(ui('how.tour', { title: tour.label }))}</button>` : ''}
  </details>`;
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

/**
 * Varför listan är tom: 'filters' när alla kategorier är avstängda (#886), 'some' när några men inte alla är avstängda
 * (#1304; kräver total, antalet kategorier som finns) och annars 'year' (inget kring året).
 */
export function emptyCause({ visibleCount, filters, total = null }) {
  if (visibleCount > 0) return null;
  if (filters.size === 0) return 'filters';
  return total != null && filters.size < total ? 'some' : 'year';
}

/** Antalet i raden "Översikt: ett urval, cirka N händelser" (#1139): avrundat till tiotal, men exakt under tio. */
export const overviewCount = n => (n >= 10 ? Math.round(n / 10) * 10 : n);

/** Tre tidsgrupper (#1312). Urvalet och inside kommer från händelselagret; datumläget skiljer en daterad dag från ett datumspann. */
export function panelTimeGroup(v, { range = false, fine = false } = {}) {
  if (!range && !v.inside && !v.longRunning) return 'near';
  if (fine) {
    // edtfSpan slutar efter sista dagen: en dag har också positiv längd. Jämför de inkluderande datumen i stället.
    const dates = (v.e.edtf ?? '').replace(/[~?%]/g, '').split('/');
    return edtfHasDays(v.e.edtf) && dates[0] === dates.at(-1) ? 'happened' : 'inside';
  }
  return v.e.start === v.e.end ? 'happened' : 'inside';
}

export class Panel {
  constructor({ root, list, filters, chips, detail, sub, count, toggle, close }, { events, srcById, styles }, { empireLegend = {}, uncertainty = {}, panel = {}, tags = {} } = {}) {
    Object.assign(this, { root, list, filtersEl: filters, detail, sub, count, toggle, srcById, styles, empireLegend, uncertainty });
    // Taggar (#555): texterna ur data/vyer.json, taggen som vyn visar och hur många synliga händelser som har varje tagg
    this.tags = tags ?? {};
    this.tag = null;
    // Urvalsmarkeringen överst (#1139): när vyn Översikt är på är listan ett urval, och raden säger det med en knapp till alla
    this.tagNote = root.querySelector?.('#panel-tag-note') ?? null;
    this.tagNoteText = root.querySelector?.('#panel-tag-text') ?? null;
    this.tagNoteAll = root.querySelector?.('#panel-tag-all') ?? null;
    this.onShowAllEvents = () => {}; // byter till vyn med alla händelser (samma åtgärd som Standard i Lager); main.js kopplar den
    this.tagNoteAll?.addEventListener('click', () => {
      this.onShowAllEvents();
      // Raden försvinner när urvalet slutar: fokus till filterknappen, som ligger kvar
      (this.filterToggle ?? this.root.querySelector('.filter[data-cat]') ?? this.toggle).focus({ preventScroll: true });
    });
    this.tagCounts = new Map();
    for (const e of events) for (const tag of (isVisibleReview(e.review) ? eventTags(e) : [])) this.tagCounts.set(tag, (this.tagCounts.get(tag) ?? 0) + 1);
    // Bilden i faktarutan som inte laddas (#884): error bubblar inte, så lyssnaren fångar på vägen ned
    detail.addEventListener('error', ev => { if (ev.target?.tagName === 'IMG') markBrokenImage(ev.target); }, true);
    this.onSelect = () => {};
    this.onFilter = () => {};
    this.onSources = () => {};
    this.onFocus = () => {};
    this.onEmpire = () => {}; // (rikets id) => rikets faktaruta (#76)
    this.onPlaceEmpire = null; // ({ empire, from, to }) => följ riket från landskortet (#1448); kopplas i main.js
    this.onOpen = () => {};
    this.onDetailChange = () => {};
    this.onEnableEvents = () => {};
    this.onYear = () => {};
    this.onReport = null; // (objekt, knapp) => öppnar formuläret "Rapportera faktafel" (js/ui/feedback.js)
    this.onShowPlace = null; // (händelse) => platsraden i mobil (#312): fäller ihop rutan och visar markören på globen
    this.onEndTheme = () => {};
    this.onPlaceFlat = null; // (plats) => Visa i Platt karta (#1161): knappen i platsens kort visas bara när återanropet finns
    this.selectedId = null;
    this.shown = null; // det faktarutan visar just nu; en rad som laddas klart ritar bara om samma ruta (#337)
    this.expandedRegions = new Set();
    this.copy = panel;
    // Filtret är ihopfällt som standard och listan har en flik per världsdel (beslut i #1782)
    this.chips = chips ?? null;
    this.filterToggle = root.querySelector?.('#panel-filter-toggle') ?? null;
    this.tabs = root.querySelector?.('#panel-tabs') ?? null;
    this.region = null; // världsdelen som flikarna visar; behålls mellan omritningar tills den blir tom
    this.filterToggle?.addEventListener('click', () => this.setFiltersOpen(!!this.chips?.hidden));

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
          this.syncFilterToggle();
          this.onFilter(this.filters);
        });
        box.append(b);
      }
    }

    this.syncFilterToggle();
    toggle.addEventListener('click', () => {
      if (this.waiting) { say(this.waitingText(), 'samtidigt', { priority: 1, immediate: true }); return; } // inaktiv under en tur (#1865)
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
    this.syncFilterToggle();
    this.onFilter(this.filters);
  }

  /** Knappen över kategorierna säger hur många som är på ("Kategorier: alla 14", "Kategorier: 11 av 14") och fäller ut chipsen. */
  syncFilterToggle() {
    if (!this.filterToggle) return;
    const total = this.allCategories.size, on = this.filters.size;
    const text = on === total ? ui('panel.filterAll', { total }) : ui('panel.filterSome', { on, total });
    this.filterToggle.innerHTML = `<span>${esc(text)}</span><span class="arrow" aria-hidden="true">▾</span>`;
  }

  setFiltersOpen(open) {
    if (!this.chips || !this.filterToggle) return;
    this.chips.hidden = !open;
    this.filterToggle.setAttribute('aria-expanded', String(open));
  }

  /** Förklaringen på knappen medan den väntar (#1865): hovertexten och knappens tillgängliga namn, som börjar med det synliga ordet. */
  waitingText() { return ui('panel.waitsTour'); }

  /**
   * Under en tur väntar Samtidigt (#1865): knappen är nedtonad och inaktiv med aria-disabled (den kan fortfarande få fokus, så att
   * förklaringen når tangentbord och skärmläsare). Hovertexten och det tillgängliga namnet säger varför, och ett tryck eller Enter
   * läser upp förklaringen i stället för att öppna listan. En öppen lista stängs: turen har valt vad kartan visar, och listan
   * skulle ligga över turkortet. Anropas av main.js när klassen touring ändras. Namnet är annars antalet träffar (accessibleName).
   */
  setWaiting(on) {
    on = !!on;
    if (this.waiting === on) return;
    this.waiting = on;
    const { toggle } = this;
    toggle.classList?.toggle('is-waiting', on);
    if (on) {
      toggle.setAttribute('aria-disabled', 'true');
      toggle.setAttribute('title', this.waitingText());
      toggle.setAttribute('aria-label', this.waitingText());
      if (this.root.classList?.contains('open')) this.setOpen(false);
    } else {
      toggle.removeAttribute('aria-disabled');
      toggle.removeAttribute('title');
      if (this.realLabel) toggle.setAttribute('aria-label', this.realLabel); // omritningen under turen lämnade väntetexten
    }
  }

  /** Öppna eller stäng listan "Samtidigt i världen". */
  setOpen(open) {
    if (open && this.waiting) return;
    if (open) {
      // Under knappgruppen uppe till höger, som i smal skärm kan ligga på flera rader
      const r = (this.toggle.closest('.top-actions') ?? this.toggle).getBoundingClientRect();
      this.root.style.top = `${r.bottom + 8}px`;
      // Vid stor textzoom blir den effektiva höjden liten. Låt då listan använda nästan hela höjden och
      // rulla ovanpå tidslinjen, i stället för att dess innehåll försvinner bakom det reserverade utrymmet.
      // Samma sak i en bred men låg yta (liggande telefon, 800 × 360): med 150 px reserverade för tidsreglaget blev listan 93 px hög och
      // rymde bara rubriken (#1932). Den ligger då över tidsreglaget, som i smal skärm.
      if (innerHeight < 500) {
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
   * Raden överst när vyn Översikt (#1139) eller Framsteg (#1379) är på: vyn är ett urval, antalet räknas ur datan och en knapp
   * går till alla händelser. Framsteg säger att vyn bara visar det källan själv beskriver som framsteg, och hur få de är.
   */
  updateTagNote(eventsOn = true) {
    if (!this.tagNote) return;
    const count = this.tag ? this.tagCounts.get(this.tag) ?? 0 : 0;
    const text = this.tag === 'oversikt' ? ui('panel.overviewNote', { count: overviewCount(count) }) : tagViewNote(this.tag, count);
    const on = eventsOn && count > 0 && !!text;
    this.tagNote.hidden = !on;
    if (!on) return;
    this.tagNoteText.textContent = text;
    this.tagNoteAll.textContent = ui('panel.overviewAll');
    this.tagNoteAll.setAttribute('aria-label', ui('panel.overviewAllLabel'));
  }

  /**
   * Knappens tillgängliga namn börjar med den synliga texten ("Samtidigt, 10 träffar: …"), så att röststyrning som säger
   * knappens ord hittar den (WCAG 2.5.3, Label in Name, #1387). Det synliga ordet är första textnoden i knappen.
   */
  accessibleName(text) {
    const visible = [...this.toggle.childNodes].find(n => n.nodeType === 3 && n.textContent.trim())?.textContent.trim();
    this.realLabel = visible ? `${visible}, ${text}` : text; // återställs när turen är slut (setWaiting)
    return this.waiting ? this.waitingText() : this.realLabel;
  }

  /**
   * labels (valfritt): { at, bare, within } i stället för "år 1879", "1879" och "±10 år", till exempel i fokusläget för korta krig (#204).
   * labels.range (#755): listan gäller ett tidsintervall. Händelser som bara delvis ligger inom det märks "delvis inom
   * intervallet", och osäkra datum (samma regler som uncertaintyRow) märks "osäkert datum", så att mängden inte ser
   * mer exakt ut än den är (förstudien till #569).
   */
  render(visible, year, window, eventsOn = true, labels = null) {
    this.updateTagNote(eventsOn);
    this.syncFilterToggle(); // texten följer språket
    if (this.tabs) this.tabs.hidden = true; // visas igen när listan har världsdelar att välja mellan
    if (!eventsOn) {
      this.count.textContent = '0';
      this.toggle.setAttribute('aria-label', this.accessibleName(t(this.copy.eventsOff)));
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
    // Märket räknar bara det som pågår (#1320, beslut 2026-11-13): det som bara ligger nära i tid står i raden och listan
    this.count.textContent = String(inside);
    this.toggle.setAttribute('aria-label', this.accessibleName(summaryText));
    // at = "år 1879" eller "den 3 maj 1940" (fokusläget för korta krig, #204); bare = samma tid utan "år"/"den"
    const at = labels?.at ?? ui('panel.atYear', { year: formatYear(year) }), bare = labels?.bare ?? formatYear(year);
    const within = labels?.within ?? plural('time.withinYears', roundWindow(window), { n: groupDigits(roundWindow(window)) }); // samma avrundade tal som raden under årtalet (#1191)
    const parts = [];
    parts.push(inside ? plural('panel.inside', inside, { at }) : ui('panel.noneAt', { at }));
    if (near) parts.push(ui('panel.near', { count: near, within }));
    const stop = text => text.endsWith('.') ? text : `${text}.`; // "f.Kr." slutar redan med punkt (#991)
    // En tid som slutar med punkt ("95 000 f.Kr.") före meningens punkt ger annars "f.Kr.." (#1862); tre punkter rörs inte
    const oneStop = text => String(text).replace(/(?<!\.)\.\.(?!\.)/g, '.');
    const partialCount = range ? visible.filter(v => v.partial).length : 0;
    if (partialCount) parts.push(plural('range.partialCount', partialCount, { count: partialCount }));
    // I intervallet finns inget "nära": raden säger hur många som pågår under intervallet och hur många som sticker ut
    if (range) this.toggle.setAttribute('aria-label', this.accessibleName(stop(parts.join(', '))));
    const cause = labels?.themeEmpty ? null : emptyCause({ visibleCount: visible.length, filters: this.filters, total: this.allCategories?.size });
    const filtersOff = cause === 'filters', filtersSome = cause === 'some';
    // Raden säger en gång vad som pågår och vad som är nära (beslut i #1782: inte "träffar" och inte samma sak två gånger)
    // Är listan tom av ett kategorifilter säger raden det, också i en vy med urval: det är filtret och inte urvalet som döljer (#1862)
    this.sub.textContent = oneStop(visible.length ? stop(parts.join(', '))
      : range && !filtersOff ? ui('range.empty', { range: bare })
      : ui(filtersOff ? 'panel.filtersOff' : filtersSome ? 'panel.filtersSome' : 'panel.empty', { within, at: bare }));
    if (filtersOff || filtersSome) {
      // Alla kategorier av (#886): det är filtret som döljer händelserna, så dragning i tidslinjen hjälper inte.
      // Några av (#1304): filtret kan dölja dem, så raden säger det och knappen visar alla kategorier igen
      const help = document.createElement('p');
      help.className = 'empty-note';
      help.textContent = ui(filtersOff ? 'panel.filtersOffHelp' : 'panel.filtersSomeHelp');
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'link-btn panel-show-all-categories';
      reset.textContent = ui('panel.showAllCategories');
      reset.addEventListener('click', () => {
        this.setFilters(this.allCategories);
        // Knappen försvinner när listan ritas om: fokus till filterknappen, som ligger kvar
        (this.filterToggle ?? this.root.querySelector('.filter[data-cat]') ?? this.toggle).focus({ preventScroll: true });
      });
      this.list.replaceChildren(help, reset);
      return;
    }
    const tagCopy = this.tag && this.tags[this.tag];
    if (!visible.length && tagCopy) {
      // Vyn med tagg (#555): säg om ingen händelse har taggen ännu, eller om det bara är tomt kring året. Meningen står en
      // gång, i listan; raden under rubriken är tom i stället för att upprepa den (#1862)
      const note = document.createElement('p');
      note.className = 'empty-note tag-empty';
      note.textContent = oneStop(this.tagCounts.get(this.tag) ? (tagCopy.none ?? '').replace('{within}', within).replace('{at}', bare) : tagCopy.empty);
      this.sub.textContent = '';
      this.list.replaceChildren(note);
      return;
    }
    if (!visible.length && labels?.themeEmpty) {
      this.sub.textContent = ''; // meningen står en gång, i listan (#1862)
      this.list.innerHTML = `<p class="empty-note">${esc(labels.themeEmpty)}</p>`;
      return;
    }
    if (!visible.length) {
      this.list.innerHTML = `<p class="empty-note">${esc(ui('panel.emptyHelp'))}</p>`;
      return;
    }
    // Grupperat per världsdel, i fast ordning, så att man ser vad som händer på olika håll. Listan har en flik per världsdel (beslut i
    // #1782, alternativ C): den valda världsdelens händelser syns, med Hände, Pågick då och Strax före eller efter. De andra världsdelarna ligger
    // kvar i sidan men är dolda (hidden), så att de inte läses upp och så att listan går att söka igenom som förut.
    const groups = new Map(REGIONS.map(r => [r, []]));
    for (const v of visible) groups.get(v.e._region ??= region(v.e._lat, v.e._lon)).push(v);
    const rank = (a, b) => (b.e.top - a.e.top) || (b.e.major - a.e.major) || (b.inside - a.inside) || (Math.abs(a.e.start - year) - Math.abs(b.e.start - year)) || t(a.e.title).localeCompare(t(b.e.title), LANG);
    // I intervallet (#755): "delvis inom intervallet" och "osäkert datum" efter tiden och platsen
    const notes = (e, partial) => range ? [partial && ui('range.partial'), uncertainDate(e) && ui('range.uncertain')].filter(Boolean) : [];
    // Det som bara ligger nära året säger hur långt före eller efter det ligger (#995): "om 21 år", "34 år före"
    // Hela år räknas ur årtalen som listan visar (fokusläget för korta krig räknar dagar ur dist), så att siffran går att räkna efter
    const offset = ({ e, inside, longRunning, when, dist }) => {
      if (range || inside || longRunning || (when !== 'past' && when !== 'future')) return [];
      const fine = !!labels?.fine, whole = Math.floor(year);
      return [formatOffset(when, fine ? dist : when === 'past' ? whole - e.end : e.start - whole, fine)];
    };
    const row = (v, name = '') => { const { e, inside, partial } = v; return `
          <li class="event-item${inside ? '' : ' is-near'}${partial ? ' is-partial' : ''}${e.id === this.selectedId ? ' is-selected' : ''}">
            <button type="button" class="event-btn" data-id="${esc(e.id)}" aria-label="${esc([...offset(v), `${formatEventTime(e)}, ${t(e.title)}${name ? `, ${regionName(name)}` : ''}`, ...notes(e, partial), reviewLabel(e.review, 'Händelsen')].join(', '))}"${e.id === this.selectedId ? ' aria-current="true"' : ''}>
              <span class="dot" style="background:${CAT[e.category]?.color}"></span><span class="ttl"${langAttr(e.title)}>${esc(t(e.title))}</span><span class="meta">${esc([...offset(v), formatEventTime(e), t(e.place), ...notes(e, partial)].join(' · '))}</span>
            </button>
          </li>`; };
    const present = [...groups].filter(([, vs]) => vs.length);
    const isInside = v => range || v.inside;
    // Världsdelen behålls när året ändras, tills den blir tom; då väljs den med flest som pågår. Väljs en händelse i en annan världsdel
    // (på globen) följer fliken med, en gång per val.
    if (!present.some(([name]) => name === this.region)) {
      this.region = present.length ? present.reduce((best, cur) => cur[1].filter(isInside).length > best[1].filter(isInside).length ? cur : best)[0] : null;
    }
    const picked = this.selectedId && present.find(([, vs]) => vs.some(v => v.e.id === this.selectedId));
    if (picked && this.pickedId !== this.selectedId) this.region = picked[0];
    this.pickedId = this.selectedId;
    const focusedTab = this.tabs?.contains(document.activeElement) ? document.activeElement.dataset.tab : null;
    const CAP = 6; // fler än så ligger bakom "Visa N till"
    const section = (name, kind, vs) => {
      const items = vs.filter(v => panelTimeGroup(v, { range, fine: !!labels?.fine }) === kind);
      if (!items.length) return '';
      const open = this.expandedRegions.has(`${name}|${kind}`), shown = open ? items : items.slice(0, CAP), rest = items.length - shown.length;
      const more = items.length > CAP ? `<button type="button" class="link-btn panel-more" data-region="${esc(name)}" data-kind="${kind}" aria-expanded="${open}" aria-label="${esc(open ? ui('panel.showLessIn', { label: copy('showLess'), region: regionName(name) }) : copy('showMore').replace('{count}', rest).replace('{region}', regionName(name)))}">${esc(open ? copy('showLess') : copy('showMore').replace('{count}', rest).replace('{region}', regionName(name)))}</button>` : '';
      return `<h3 class="panel-sec panel-sec-${kind}">${esc(ui(kind === 'happened' ? 'panel.groupHappened' : kind === 'inside' ? 'panel.groupInside' : 'panel.groupNear', { at }))} <span class="region-count">${items.length}</span></h3>
        <ol>${shown.map(v => row(v, name)).join('')}</ol>${more}`;
    };
    const panes = present.map(([name, vs]) => {
      vs.sort(rank);
      const i = REGIONS.indexOf(name), on = name === this.region;
      return { on, html: `
      <section class="region-group" role="tabpanel" id="panel-sec-${i}" aria-labelledby="panel-tab-${i}" data-panel-region="${esc(name)}"${on ? '' : ' hidden'}>
        ${section(name, 'happened', vs)}${section(name, 'inside', vs)}${section(name, 'near', vs)}
      </section>` };
    }).sort((a, b) => b.on - a.on); // den valda världsdelen först i sidan
    this.list.innerHTML = panes.map(x => x.html).join('');
    if (this.tabs && present.length) {
      this.tabs.innerHTML = present.map(([name, vs]) => {
        const i = REGIONS.indexOf(name), on = name === this.region;
        return `<button type="button" role="tab" class="panel-tab" id="panel-tab-${i}" data-tab="${esc(name)}" aria-selected="${on}" aria-controls="panel-sec-${i}" tabindex="${on ? 0 : -1}" aria-label="${esc(plural('panel.tabLabel', vs.length, { region: regionName(name), count: vs.length }))}"><span>${esc(regionName(name))}</span> <span class="region-count">${vs.length}</span></button>`;
      }).join('');
      this.tabs.hidden = false;
      const names = present.map(([name]) => name);
      const choose = name => {
        this.region = name;
        this.render(visible, year, window, eventsOn, labels);
        this.list.scrollTop = 0;
        const tab = this.tabs.querySelector(`[data-tab="${name}"]`);
        tab?.focus({ preventScroll: true });
        tab?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
      };
      for (const b of this.tabs.querySelectorAll('[data-tab]')) {
        b.addEventListener('click', () => choose(b.dataset.tab));
        b.addEventListener('keydown', ev => {
          let at = names.indexOf(b.dataset.tab);
          if (ev.key === 'ArrowRight') at = (at + 1) % names.length;
          else if (ev.key === 'ArrowLeft') at = (at - 1 + names.length) % names.length;
          else if (ev.key === 'Home') at = 0;
          else if (ev.key === 'End') at = names.length - 1;
          else return;
          ev.preventDefault();
          choose(names[at]);
        });
      }
      if (focusedTab) this.tabs.querySelector(`[data-tab="${focusedTab}"]`)?.focus({ preventScroll: true });
    }
    // Riktiga knappar: Enter och mellanslag fungerar av sig själva
    for (const b of this.list.querySelectorAll('.event-btn')) b.addEventListener('click', () => this.onSelect(b.dataset.id));
    for (const b of this.list.querySelectorAll('[data-region]')) b.addEventListener('click', () => { const key = `${b.dataset.region}|${b.dataset.kind}`; this.expandedRegions.has(key) ? this.expandedRegions.delete(key) : this.expandedRegions.add(key); this.render(visible, year, window, eventsOn, labels); });
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

  /**
   * Samma signal används av alla slags faktarutor: händelse, rike, religion och berättelse. Det öppna kortets namn för skärmläsare är Om händelsen (detail.label) om inget annat sägs: platsens
   * kort heter Om platsen (#1464). Varje öppning sätter namnet, så att ett kort inte ärver det förra kortets.
   */
  setDetailOpen(open, label = ui('detail.label')) {
    if (open) {
      // Namnet ägs härifrån: attributet för språkbytet (index.html) tas bort, så att applyStatic() aldrig sätter tillbaka Om händelsen på ett öppet kort
      this.detail.removeAttribute?.('data-i18n-aria-label');
      this.detail.setAttribute('aria-label', label);
    }
    this.detail.hidden = !open;
    this.onDetailChange(open);
  }

  /** En tom ruta med händelsens namn medan det som ska stå i den laddas. */
  _loading(e) {
    this.selectedId = e.id;
    this.detail.className = `detail detail-card frame-${styleFor(e, this.styles).frame}`;
    this.detail.innerHTML = `<button type="button" class="detail-close" data-close aria-label="${esc(ui('common.close'))}">×</button>
      <h3${langAttr(e.title)}>${esc(t(e.title))}</h3><div class="meta">${esc(formatEventTime(e))} · ${esc(t(e.place))}</div>${loadingHtml()}`;
    this.setDetailOpen(true);
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
      ${paras(t(s.intro))}
      <h4>${esc(ui('story.parties'))}</h4>
      <div class="parties">${s.parties.map(p => `<div><strong>${esc(t(p.name))}</strong><p>${esc(t(p.members))}</p></div>`).join('')}</div>
      ${empireList(war._empires)}
      <p class="story-hint">${esc(ui('story.hint'))}</p>${(() => { const tour = this.tourFor?.(war.id); return tour ? `<button type="button" class="story-tour" data-tour="${esc(tour.id)}">${esc(tour.label)}</button>` : ''; })()}` : war.ongoing ? `
      <h4>${esc(ui('story.today'))}</h4>${paras(t(s.outcome))}
      <h4>${esc(ui('story.deadSoFar'))}</h4><p>${esc(t(s.casualties))}</p>
      ${takeawaysHtml(s.takeaways, this.srcById, pending)}` : `
      <h4>${esc(ui('story.outcome'))}</h4>${paras(t(s.outcome))}
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
    this.setDetailOpen(true);
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
    this.bindReport(war.start);
    this.bindLinks();
    this.bindReviewInfo(); // statusraden med (i) som i händelsens faktaruta (#608)
    this.detail.querySelector('[data-tour]')?.addEventListener('click', ev => this.onTour?.(ev.currentTarget.dataset.tour, ev.currentTarget));
  }

  /**
   * Kortet för ett urval i Fokus (#1327): ett tema (#398) eller en plats (#579). Fokustypens post i js/focus/ ger
   * innehållet, och kortet är samma för alla urval:
   *   label    etiketten överst ("Tema", "Plats")
   *   name     namnet, text per språk
   *   lead     valfri rad under namnet (platsens typ)
   *   mapNote  valfri synlig rad om kartans nutida gräns, kust och ortnamn (#1956)
   *   emblems  valfria flaggor och vapen (#1160): egna SVG:er i img/flags/ med bildtext, kredit och licens;
   *            filsidorna läggs till bland källorna
   *   intro    inledningen, text per språk
   *   action   valfri knapp direkt efter inledningen, { text, label, run } (platsens Visa i Platt karta, #1161); label är knappens aria-label och ska börja med text
   *   notes    de fasta raderna under inledningen (att filtren inte gäller, att linjen är dagens gräns)
   *   exit     texten på knappen som lämnar urvalet; utan text finns ingen knapp (platsens kort i en turs steg, #1163, där inget Fokus pågår)
   *   summary  rubriken för listan ("14 händelser")
   *   events   händelserna i tidsordning, som knappar som öppnar faktarutan. En händelse före tidslinjens
   *            början (#942) märks, eftersom reglaget inte når dit
   *   sources  källornas id
   *   banner   valfri rad direkt under namnet, synlig utan att rulla (att ett tidsintervall avslutades när platsen började följas, #1163)
   *   focus    false: kortet tar inte tangentbordsfokus (platsens kort i en turs steg, #1163: fokus ska ligga kvar på Nästa)
   *   ariaLabel kortets namn för skärmläsare; utan namn gäller Om händelsen (platsens kort heter Om platsen, #1464)
   */
  /**
   * Kortet för ett urval (tema eller plats). empires (#1448, bara platser med periods): { title, note, follow, rows }, där en rad är
   * { years, name, label, run } (run saknas i en tur: raden är då bara text) eller { gap } (en lucka, en läsbar rad).
   */
  showSelection({ label, name, lead = '', mapNote = '', emblems = [], intro, action = null, notes = [], exit, empires = null, summary, events, sources = [], focus = true, banner = '', ariaLabel, aboutLabel = null }) {
    this.selectedId = null;
    // Ingen tidsålderns ram (#1713, punkt 4): plats- och temakortet är en ruta för läsning, i samma neutrala mörka kort som rikes-, religions-
    // och krigskorten. Ramen efter första händelsens epok gav olika kort för Skåne (grotta, 3,46:1) och Grönland (papyrus) och ockra text under AA.
    this.detail.className = `detail detail-card detail-selection${aboutLabel ? ' detail-place' : ''}`;
    // detail-selection: main.js läser upp etiketten (Plats, Tema), också när inget Fokus pågår (#1163). detail-place: platskortet, som är
    // en egen yta i stängregistret (kort, #1865)
    const shown = (emblems ?? []).filter(em => flagUrl(em));
    const srcs = [...new Set([...(sources ?? []), ...shown.map(em => em.source)])].map(id => this.srcById[id]).filter(Boolean);
    // Platsens kort (aboutLabel, #1790): bilder vars licens kräver namnuppgift (CC BY, CC BY-SA) behåller en kort kreditrad vid bilden; övriga
    // krediter (public domain) ligger i den hopfällda raden Om kartan och källor
    const placeCard = !!aboutLabel, needsCredit = em => /CC BY/i.test(em.license ?? '');
    const emblemHtml = shown.length ? `<div class="place-emblems">${shown.map(em => `<figure class="place-emblem place-emblem-${esc(em.kind)}"><img src="${esc(flagUrl(em))}" alt="${esc(t(em.caption))}"><figcaption>${esc(t(em.caption))}${placeCard && !needsCredit(em) ? '' : `<span class="meta">${esc(em.credit)} · ${esc(em.license)}</span>`}</figcaption></figure>`).join('')}</div>` : '';
    const open = matchMedia('(max-width: 760px)').matches ? '' : ' open';
    // Rikena i landskortet (#1448): riktiga knappar med hela namnet för skärmläsare ("Följ riket Sverige 1612–1721"), luckorna som rader
    // Namnet för skärmläsare har samma ordning som den synliga texten (WCAG 2.5.3): "1815–1904 Sverige-Norge, Följ riket".
    // Rikets egen rad Om kartan (mapNote, Kalmarunionen) står som en liten rad under knappen, inte i den, och beskriver knappen.
    const empireNote = (r, i) => r.mapNote ? `<p class="place-empire-note" id="place-empire-note-${i}"${langAttr(r.mapNote)}>${esc(t(r.mapNote))}</p>` : '';
    const empireItem = (r, i) => r.gap ? `<li class="place-empire-gap">${esc(r.gap)}</li>`
      : `<li>${r.run ? `<button type="button" class="theme-event" data-place-empire="${i}" aria-label="${esc(r.label)}"${r.mapNote ? ` aria-describedby="place-empire-note-${i}"` : ''}>` : '<span class="theme-event">'}<span class="theme-event-year">${esc(r.years)}</span> <span${langAttr(r.name)}>${esc(t(r.name))}</span>${r.run ? ` <span class="theme-event-note" aria-hidden="true">${esc(empires.follow)}</span></button>` : '</span>'}${empireNote(r, i)}</li>`;
    // Förklaringen står under listan, så att raderna syns först i smal skärm (#1448)
    const empireHtml = empires?.rows?.length ? `<details class="theme-event-list place-empire-list"${open}>
        <summary>${esc(empires.title)}</summary>
        <ul class="theme-events place-empires">${empires.rows.map(empireItem).join('')}</ul>
        <p class="theme-filter-note place-empires-note">${esc(empires.note)}</p>
      </details>` : '';
    // Raderna är knappar med data-theme-event i händelsernas ordning. Regionvyn (js/controllers/region.js, #1642) läser dem: den sätter
    // markörernas nummer först på raderna och en ram på den markerade raden, och följer kortet med en MutationObserver. Ändras
    // markupen här ändras regionvyn också (provet i tests/regionvy-markorer.test.mjs fallerar då)
    const items = events.map(e => `<li><button type="button" class="theme-event" data-theme-event="${esc(e.id)}"><span class="theme-event-year">${esc(formatEventTime(e))}</span> <span${langAttr(e.title)}>${esc(t(e.title))}</span>${e.start < MIN_YEAR ? ` <span class="theme-event-note">${esc(ui('theme.beforeScale'))}</span>` : ''}</button></li>`).join('');
    const actionHtml = action ? `<button type="button" class="chip-btn theme-exit place-flat" data-selection-action aria-label="${esc(action.label ?? action.text)}">${esc(action.text)}</button>` : '';
    const notesHtml = notes.map(note => `<p class="theme-filter-note">${esc(note)}</p>`).join('\n      ');
    // Platsens kort: Sluta följa platsen är en textlänk sist (Avsluta lät som att kortet stängs), temats kort har sin knapp som förut
    const exitHtml = exit ? (placeCard ? `<button type="button" class="link-btn place-exit" data-end-theme>${esc(exit)}</button>` : `<button type="button" class="chip-btn theme-exit" data-end-theme>${esc(exit)}</button>`) : '';
    const eventsHtml = `<details class="theme-event-list"${placeCard ? ' open' : open}>
        <summary>${esc(summary)}</summary>
        <ul class="theme-events">${items}</ul>
      </details>`;
    // Om kartan och källor (#1790): flaggans källa, kartanteckningarna och källorna, hopfällt längst ned i platsens kort
    const credits = shown.filter(em => !needsCredit(em)).map(em => `<p class="place-credit">${esc(t(em.caption))}: ${esc(em.credit)} · ${esc(em.license)}</p>`).join('');
    const aboutHtml = placeCard ? `<details class="theme-event-list place-about">
        <summary>${esc(aboutLabel)}</summary>
        ${credits}${notesHtml}${srcs.length ? srcLine(srcs, false) : ''}
      </details>` : '';
    const body = placeCard ? [actionHtml, eventsHtml, empireHtml, aboutHtml, exitHtml] : [actionHtml, notesHtml, exitHtml, empireHtml, eventsHtml];
    this.detail.innerHTML = `
      <button type="button" class="detail-close" data-close aria-label="${esc(ui('common.close'))}">×</button>
      <div class="story-label">${esc(label)}</div>
      <h3>${esc(t(name))}</h3>
      ${banner ? `<p class="theme-filter-note place-banner">${esc(banner)}</p>` : ''}
      <div class="story">${lead ? `<p class="place-type">${esc(lead)}</p>` : ''}
      ${mapNote ? `<p class="place-map-note">${esc(mapNote)}</p>` : ''}
      ${emblemHtml}
      <p>${esc(t(intro))}</p>
      ${body.filter(Boolean).join('\n      ')}</div>
      ${!placeCard && srcs.length ? srcLine(srcs, false) : ''}`;
    this.detail.scrollTop = 0;
    this.setDetailOpen(true, ariaLabel);
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
    this.detail.querySelector('[data-end-theme]')?.addEventListener('click', () => this.onEndTheme());
    this.detail.querySelector('[data-selection-action]')?.addEventListener('click', () => action.run());
    for (const b of this.detail.querySelectorAll('[data-theme-event]')) b.addEventListener('click', () => this.onThemeEvent?.(b.dataset.themeEvent));
    for (const b of this.detail.querySelectorAll('[data-place-empire]')) b.addEventListener('click', () => empires.rows[+b.dataset.placeEmpire].run());
    if (focus) this.detail.querySelector('[data-close]').focus({ preventScroll: true });
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
  showReligion(r, origin, report = null, year = null) {
    this.showFacts({ kind: 'religion', name: t(r.name), color: r.color, symbol: symbolImg(r, 'rel-sym rel-sym-h'), facts: r.facts, origin,
      milestonesTitle: t(r.facts.milestonesTitle) || ui('facts.stateReligion'), report, year });
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
    const { kind, kindWord = null, name, color, symbol = '', symbolKind = null, facts: f, origin = null, place = origin, milestonesTitle = ui('facts.milestones'), mapNote = '', curveId = '', wars = [], lineage = null, empireMap = false, empireId = null, year = null } = opts;
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
    // kind: 'empire', 'vanished' (försvunnet land), 'area' (område som inte är en stat, #1300) eller 'religion';
    // namnet som visas står i facts.kind.<kind>, för ett område följt av typordet (kindWord)
    const subj = kind === 'empire' ? 'Riket' : kind === 'vanished' ? 'Landet' : kind === 'area' ? 'Området' : 'Religionen';
    const srcs = [...new Set([...(f.sources ?? []), ...(f.milestones ?? []).flatMap(m => m.sources ?? []), ...(lineage?.sources ?? [])])]
      .map(id => this.srcById[id]).filter(Boolean);
    // Riken har ofta mer fördjupning än ryms i det mobila arket. Sammanfattningen
    // står därför alltid först, medan utveckling och kartans underlag öppnas vid behov (#359).
    const isEmpire = kind === 'empire' || kind === 'vanished' || kind === 'area';
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
      ${pending ? '' : howWeKnowRow(srcs, f.review, f.note?.kind === 'disagreement', this.howTour?.())}
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
    // Ritas rutan om (källorna kom, #1448) medan tangentbordsfokus låg i den, hamnar fokus på krysset igen i stället för på body
    const hadFocus = typeof document !== 'undefined' && this.detail.contains(document.activeElement);
    this.detail.innerHTML = `
      <button type="button" class="detail-close" data-close aria-label="${esc(ui('common.close'))}">×</button>
      <div class="story-label"><span class="swatch" style="background:${esc(color)}"></span>${esc([ui(`facts.kind.${kind}`), kindWord].filter(Boolean).join(' · '))}</div>
      <h3>${symbol}${esc(name)}</h3>
      ${Number.isFinite(year) ? `<p class="facts-year">${esc(ui('facts.yearAt', { year: formatYear(year) }))}</p>` : ''}
      ${symbol && symbolKind && symbolKind !== 'symbol' ? `<p class="symbol-kind" data-symbol-kind="${esc(symbolKind)}">${esc(ui(`facts.symbolKind.${symbolKind}`))}</p>` : ''}
      ${paras(t(f.summary))}
      ${fall ? `<button type="button" class="story-tour" data-tour="${esc(fall.id)}">${esc(fall.label)}</button>` : ''}
      ${body}`;
    this.setDetailOpen(true);
    this.detail.scrollTop = 0; // efter hidden, annars behåller kortet förra läget
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
    for (const b of this.detail.querySelectorAll('[data-goto]')) b.addEventListener('click', () => this.onSelect(b.dataset.goto));
    for (const b of this.detail.querySelectorAll('[data-year]')) b.addEventListener('click', () => this.onYear(Number(b.dataset.year)));
    this.bindLinks();
    this.bindReviewInfo();
    if (report) this.bindReport(report.year);
    this.detail.querySelector('[data-tour]')?.addEventListener('click', ev => this.onTour?.(ev.currentTarget.dataset.tour, ev.currentTarget));
    if (hadFocus) this.detail.querySelector('[data-close]').focus({ preventScroll: true });
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
    if (!e || !show) { this.shown = null; delete this.detail.dataset.eventId; this.setDetailOpen(false); return; }
    const pending = this._whenLoaded(needDetails([e], { misconceptions: true }), () => this.showDetail(e, show)), loading = pending && !e._full;
    // Wikidata länkas till händelsens egen post
    const srcs = (e.sources ?? []).map(id => id === 'wikidata' && e.wikidata
      ? { id, title: `Wikidata ${e.wikidata}`, url: `https://www.wikidata.org/wiki/${e.wikidata}` }
      : this.srcById[id] && { ...this.srcById[id], id }).filter(Boolean);
    const evidence = evidenceView(e, srcs);
    // Kortets ram följer händelsens tidsålder, med eller utan bild (#129)
    const st = styleFor(e, this.styles);
    // En omritning för samma händelse (när detaljfilen har laddats) behåller öppna märkningar
    const same = this.detail.dataset.eventId === e.id;
    const keepOpen = same ? [...this.detail.querySelectorAll('details.tag-mark[open]')].map(d => d.dataset.tag) : [];
    // Noten och Om uppgifterna (#1571) står kvar öppna när samma händelse ritas om
    const noteOpen = same && !!this.detail.querySelector('details.detail-note[open]');
    const aboutOpen = same && !!this.detail.querySelector('details.detail-about[open]');
    this.detail.dataset.eventId = e.id;
    this.detail.className = `detail detail-card frame-${st.frame}`;
    this.detail.dataset.style = st.variant?.id ?? st.style.id;
    // Rubrik och datumrad först, sedan bilden (#605), så att man ser vad händelsen heter utan att rulla.
    // Platsen står en gång, i datumraden; mobilens knapp "Visa på globen" har platsen i sitt namn (#607).
    // Datumraden får en kort markering när händelsen har raden Historisk osäkerhet (#606).
    const unc = uncertaintyRow(e, this.uncertainty, evidence.marker('uncertainty'));
    // Datumraden i två rader (#1792): rad 1 är datumet med en enda markering för det osäkra (och hur länge sedan, för djup tid), rad 2 platsen
    // (kort, klippt till två rader i CSS) och kategorin. Hela platstexten, skalnoten och Historisk osäkerhet ligger i raden Källor och osäkerhet.
    const ago = inDeepTime(e) ? ui('time.yearsAgo', { n: groupDigits(Math.round((MAX_YEAR - e.start) / 1000) * 1000) }) : '';
    const placeText = t(e.place), placeLong = placeText.length > 70;
    const mark = unc ? (uncertaintyMark(e, 'date', this.uncertainty) || uncertaintyMark(e, 'place', this.uncertainty)) : '';
    this.detail.innerHTML = `
      <button type="button" class="detail-close" data-close aria-label="${esc(ui('common.close'))}">×</button>
      <h3${langAttr(e.title)}>${esc(t(e.title))}</h3>
      <div class="meta meta-when">${esc(formatEventTime(e))}${evidence.marker('date')}${mark}${ago ? ` · <span class="meta-ago">${esc(ago)}</span>` : ''}</div>
      <div class="meta meta-where"><span class="meta-place">${esc(placeText)}</span>${evidence.marker('location')} · ${esc(t(CAT[e.category]?.name))}</div>
      ${tagMarks(e, this.tags)}
      ${this.onShowPlace ? `<button type="button" class="place-row" data-show-place aria-label="${esc(ui('detail.showPlaceLabel', { place: t(e.place) }))}"><span class="place-pin" aria-hidden="true"></span><span class="place-go">${esc(ui('detail.showPlace'))}</span></button>` : ''}
      ${figure(e, this.srcById, evidence.marker('image'))}
      ${loading ? loadingHtml() : paras(t(e.summary), evidence.marker('summary'), langAttr(e.summary))}
      ${e.note ? `<details class="detail-note"${noteOpen ? ' open' : ''}><summary>${esc(t(e.note.title))}</summary><p>${esc(t(e.note.text))}</p></details>` : ''}
      ${loading ? '' : mythsHtml(misconceptionsFor(e.id), this.srcById, pending)}
      ${e._war ? `<p class="war-link">${esc(ui('detail.partOf'))} <button type="button" class="link-btn" data-goto="${esc(e._war.id)}">${esc(t(e._war.title))}</button></p>` : ''}
      ${e.kind === 'war' ? `<button type="button" class="chip-btn focus-btn" data-focus="${esc(e.id)}">▶ ${esc(ui('detail.followWar'))}</button>` : ''}
      ${e._battles?.length ? `<div class="war-list"><h4>${esc(ui('detail.battles'))}</h4><ol>${e._battles.map(b =>
        `<li><button type="button" class="link-btn" data-goto="${esc(b.id)}">${esc(t(b.title))}</button> <span class="meta">${esc(formatEventTime(b))}</span></li>`).join('')}</ol></div>` : ''}
      ${empireList(e._empires ?? e._war?._empires)}
      ${(() => { const h = this.huntFor?.(e); return h ? `<button type="button" class="chip-btn hunt-add" data-hunt${h.disabled ? ' disabled' : ''}>${esc(h.label)}</button>` : ''; })()}
      <details class="detail-about"${aboutOpen ? ' open' : ''}><summary>${esc(String(ui('detail.aboutData')[srcs.length === 1 ? 0 : 1]).replace('{n}', srcs.length))} · ${esc(reviewLabel(e.review, 'Händelsen'))}</summary>
        ${unc}
        ${placeLong ? `<p class="detail-place-full"><b>${esc(ui('place.label'))}:</b> ${esc(placeText)}</p>` : ''}
        ${e.image?.kind === 'illustration' ? `<p class="detail-image-credit"><b>${esc(ui('detail.imageCredit'))}</b> ${imageCredit(e, this.srcById)}</p>` : ''}
        ${beforeTimelineStart(e) ? `<p class="scale-note">${esc(ui('detail.beforeScale', { year: formatYear(MIN_YEAR) }))}</p>` : ''}
        ${inDeepTime(e) ? `<p class="scale-note">${esc(ui('detail.yearsAgo'))}</p>` : ''}
        ${evidence.sources || srcLine(srcs, pending)}
        ${pending ? '' : howWeKnowRow(srcs, e.review, sourcesDisagree(e), this.howTour?.())}
        <div class="detail-actions">
          ${reviewRow(e.review, 'Händelsen')}
          ${loading ? '' : `<button type="button" class="link-btn" data-citation>${esc(ui('citation.copy'))}</button><span data-citation-status role="status" aria-live="polite"></span>`}
          ${this.onReport ? reportBtn({ type: 'event', id: e.id, label: t(e.title) }) : ''}
        </div>
      </details>`;
    // En källhänvisning [n] i texten pekar på en rad i Om uppgifterna: öppna avsnittet först, så att länken har något att hoppa till
    for (const a of this.detail.querySelectorAll('.evidence-ref a')) a.addEventListener('click', () => { this.detail.querySelector('details.detail-about')?.setAttribute('open', ''); });
    for (const tag of keepOpen) this.detail.querySelector(`details.tag-mark[data-tag="${CSS.escape(tag)}"]`)?.setAttribute('open', '');
    this.detail.scrollTop = 0;
    this.setDetailOpen(true);
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
      this.detail.querySelector('details.detail-about')?.setAttribute('open', ''); // raden ligger i Källor och osäkerhet (#1792)
      const row = this.detail.querySelector('#detail-uncertainty');
      row?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      row?.focus({ preventScroll: true });
    });
    this.detail.querySelector('[data-tour]')?.addEventListener('click', ev => this.onTour?.(ev.currentTarget.dataset.tour, ev.currentTarget));
    this.detail.querySelector('[data-citation]')?.addEventListener('click', async () => {
      const status = this.detail.querySelector('[data-citation-status]');
      const citation = eventCitation(e, srcs);
      try {
        await navigator.clipboard.writeText(citation);
        if (status) status.textContent = ui('citation.copied');
      } catch {
        if (status) status.textContent = ui('citation.manual');
        window.prompt(ui('citation.prompt'), citation);
      }
    });
    this.bindReport(e.start);
    this.bindLinks();
    this.bindReviewInfo();
  }
}
