// Samtidigt-kortet: fun facts och annat som hände samtidigt (till exempel när ett krig
// bryter ut). Kortet visas när året ligger inom postens intervall, med bågar på globen
// mellan de platser som hör ihop. Det kan fällas ihop till en flik (#120).
import { CAT, REVIEW, t, formatYear, formatEventTime, styleFor, isVisibleReview } from '../model.js';
import { figure } from './panel.js';

const KIND = { funfact: 'Fun fact', war: 'När ett krig bröt ut', empire: 'Rikets berättelse' };

/**
 * Rikets berättelse (#171): rikets nyckelår (facts.milestones i empires/index.json) som kort
 * i Samtidigt-kortet när man följer riket i Fokus. Kortet visas från nyckelåret till året före
 * nästa nyckelår, högst 25 år. Länkade händelser (events) visas som knappar, inte som text.
 */
export function empireStory(group, byId) {
  const ms = [...(group?.facts?.milestones ?? [])].sort((a, b) => a.year - b.year);
  return ms.map((m, i) => ({
    id: `empire-${group.id}-${m.year}`, kind: 'empire', year: m.year, empire: t(group.name),
    show: [m.year, Math.min((ms[i + 1]?.year ?? Infinity) - 1, m.year + 25)],
    events: (m.events ?? []).filter(id => byId[id]),
    label: t(m.label) || formatYear(m.year), title: t(m.title), body: t(m.text), mapNote: t(m.mapNote),
    sources: m.sources ?? [], review: group.facts.review,
  }));
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export class FunFacts {
  constructor(els, { funfacts, byId, srcById, styles }) {
    Object.assign(this, els);
    this.all = funfacts; this.byId = byId; this.srcById = srcById; this.styles = styles;
    this.openId = null; // händelsen vars bild visas överst i kortet (#169)
    this.active = []; this.index = 0; this.shownKey = '';
    this.story = []; // rikets berättelse i fokus (#171), sätts av main.js
    this.pre = this.root.querySelector('.ff-pre');
    this.enabled = true; // fun facts är ett eget lager som kan slås av
    this.onArcs = () => {};
    this.onSelect = () => {}; // öppnar hela faktarutan (Mer om händelsen)
    this.onPick = () => {};   // väljer händelsen på globen utan att öppna faktarutan (null = avmarkera)
    this.onSources = () => {};
    this.onNew = () => {};
    this.minimized = false;
    try { this.minimized = localStorage.getItem('hg-ff-min') === '1'; } catch { /* utan lagring */ }
    this.next.addEventListener('click', () => { this.index = (this.index + 1) % this.active.length; this._show(); });
    this.min.addEventListener('click', () => this.setMinimized(true));
    this.tab.addEventListener('click', () => this.setMinimized(false));
    // I smal skärm klipps texten efter tre rader; ett tryck på den visar hela (#168)
    this.text.addEventListener('click', () => this.root.classList.toggle('ff-open'));
    // I smal skärm täcker bilden globen: ett tryck eller drag på globen utanför kortet stänger bilden (#168)
    document.addEventListener('pointerdown', ev => {
      if (this.openId && ev.target.closest?.('.globe-canvas') && matchMedia('(max-width: 760px)').matches) this.toggleEvent(null);
    }, true);
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && this.openId) this.toggleEvent(null); });
    this.srcBtn.addEventListener('click', () => { const f = this.active[this.index]; if (f) this.onSources(f.sources); });
  }

  update(year, filters) {
    // Rikets berättelse hör till fokusläget och visas även när Samtidigt-lagret är av, först i kortet
    const story = this.story.filter(f => year >= f.show[0] && year <= f.show[1] && isVisibleReview(f.review));
    const active = [...story, ...(!this.enabled ? [] : this.all.filter(f =>
      year >= f.show[0] && year <= f.show[1] &&
      isVisibleReview(f.review) &&
      f.events.every(id => this.byId[id] && filters.has(this.byId[id].category)))
      // Kort som jämför flera händelser (samtidighet) först, sedan det som började senast, så att det nya syns
      .sort((a, b) => (b.events.length > 1) - (a.events.length > 1) || b.show[0] - a.show[0]))];
    const key = active.map(f => f.id).join('|');
    if (key === this.shownKey) return;
    // Rikets berättelse pausar uppspelningen själv (main.js), med egen orsak och eget val i Lager
    const fresh = active.some(f => f.kind !== 'empire' && !this.active.includes(f));
    this.shownKey = key; this.active = active; this.index = 0;
    this._show();
    if (fresh) this.onNew();
  }

  /** Fäll ihop kortet till en flik, eller öppna det igen. Valet sparas. */
  setMinimized(on) {
    this.minimized = on;
    try { localStorage.setItem('hg-ff-min', on ? '1' : '0'); } catch { /* utan lagring */ }
    this._show();
    (on ? this.tab : this.min).focus?.();
  }

  /** Visa händelsens bild och fakta överst i kortet, eller stäng den (id = null eller samma id igen). */
  toggleEvent(id) {
    const next = id && id !== this.openId ? id : null;
    this.closeEvent();
    this.openId = next;
    if (next) this._renderEvent(this.byId[next]);
    this._markChips();
    this.onPick(next);
  }

  /** Stäng bildytan utan att berätta det för globen. */
  closeEvent() {
    this.openId = null;
    this.detailEl.hidden = true; this.detailEl.innerHTML = '';
    this._markChips();
  }

  _markChips() {
    for (const b of this.events.querySelectorAll('.ff-chip')) b.setAttribute('aria-pressed', String(b.dataset.id === this.openId));
  }

  _renderEvent(e) {
    // Samma ram efter tidsålder och samma märkta bild som i faktarutan (#129)
    const st = styleFor(e, this.styles);
    this.detailEl.className = `ff-detail detail frame-${st.frame}`;
    this.detailEl.dataset.style = st.variant?.id ?? st.style.id;
    this.detailEl.innerHTML = `
      <button type="button" class="detail-close" data-close aria-label="Stäng bilden">×</button>
      ${figure(e, this.srcById)}
      <div class="ff-detail-body">
        <h3>${esc(t(e.title))}</h3>
        <div class="meta">${esc(formatEventTime(e))} · ${esc(t(e.place))}</div>
        <p>${esc(t(e.summary))}</p>
        <button type="button" class="link-btn" data-more>Mer om händelsen</button>
      </div>`;
    this.detailEl.hidden = false;
    this.detailEl.querySelector('[data-close]').addEventListener('click', () => this.toggleEvent(null));
    this.detailEl.querySelector('[data-more]').addEventListener('click', () => this.onSelect(e.id));
    this.root.scrollTop = 0;
  }

  highlightIds() {
    const f = this.active[this.index];
    return new Set(f && !this.minimized ? f.events : []);
  }

  _show() {
    const f = this.active[this.index];
    const hadOpen = this.openId;
    this.closeEvent(); // nästa fun fact, ihopfällning eller ny lista stänger bildytan
    if (hadOpen) queueMicrotask(() => { if (!this.openId) this.onPick(null); }); // efter pågående ritning
    this.tab.hidden = !f || !this.minimized;
    this.tabCount.textContent = String(this.active.length);
    if (!f || this.minimized) { this.root.hidden = true; this.onArcs([]); return; }
    const story = f.kind === 'empire';
    this.root.classList.toggle('ff-story', story);
    this.root.classList.remove('ff-open');
    if (this.pre) this.pre.hidden = story;
    this.kind.textContent = story ? `${KIND.empire} · ${f.empire}` : KIND[f.kind ?? 'funfact'];
    const evs = f.events.map(id => this.byId[id]);
    if (story) {
      this.text.innerHTML = `<span class="ff-story-head"><span class="ff-year">${esc(f.label)}</span> ${esc(f.title)}</span>`
        + `<span class="ff-story-text">${esc(f.body)}</span>`
        + (f.mapNote ? `<span class="ff-story-map"><b>Om kartan:</b> ${esc(f.mapNote)}</span>` : '');
    } else this.text.textContent = t(f.text);
    this.events.innerHTML = evs.map(e => `<button type="button" class="ff-chip" data-id="${esc(e.id)}" aria-pressed="false">${e.image ? `<img class="ff-thumb" src="${esc(e.image.file)}" alt="" loading="lazy">` : `<span class="dot" style="background:${CAT[e.category]?.color}"></span>`}${f.kind === 'war' ? `<span class="ff-year">${esc(formatYear(e.start))}</span>` : ''}${esc(t(e.title))}</button>`).join('');
    for (const b of this.events.querySelectorAll('.ff-chip')) b.addEventListener('click', () => this.toggleEvent(b.dataset.id));
    const rv = REVIEW[f.review] ?? REVIEW.draft;
    this.review.className = `review-badge ${rv.cls}`;
    this.review.textContent = rv.sv;
    this.pager.textContent = this.active.length > 1 ? `${this.index + 1} av ${this.active.length}` : '';
    this.next.hidden = this.active.length < 2;
    this.root.hidden = false;
    // Bågar från första händelsen till de övriga
    const [a, ...rest] = evs;
    this.onArcs(story ? [] : rest.map(b => [[a._lat, a._lon], [b._lat, b._lon]]));
  }
}
