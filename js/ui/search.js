// Sök i globens innehåll (#570): knappen Sök i Utforska öppnar en ruta med ett sökfält och en träfflista.
// Indexet och matchningen står i js/search-index.js. Ett klick på en träff gör det man annars gör för hand:
// en händelse öppnar sin faktaruta på sitt år, ett krig, ett rike eller en resa börjar följas i Fokus.
// Träfflistan är vanliga knappar: Tab, pil ned och upp, Enter och Escape fungerar.

import { buildIndex, search } from '../search-index.js';
import { t, CAT, formatEventTime, isVisibleReview, ui } from '../model.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LIMIT = 30;

export class Search {
  /**
   * els: { button, pop, input, list, status }. data: app.data. loadRoutes: () => Promise<routes>.
   * onPick(item): det som händer när en träff väljs (main.js).
   */
  constructor({ button, pop, input, list, status }, data, { loadRoutes }) {
    Object.assign(this, { button, pop, input, list, status, data, loadRoutes });
    this.onPick = () => {};
    this.onOpen = () => {};
    this.index = null;
    button.addEventListener('click', () => (pop.hidden ? this.open() : this.close()));
    input.addEventListener('input', () => this.run());
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); list.querySelector('button')?.focus(); }
      if (e.key === 'Enter') { e.preventDefault(); list.querySelector('button')?.click(); }
    });
    list.addEventListener('keydown', e => {
      const items = [...list.querySelectorAll('button')], i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' && i >= 0) { e.preventDefault(); items[Math.min(i + 1, items.length - 1)].focus(); }
      if (e.key === 'ArrowUp' && i >= 0) { e.preventDefault(); (i ? items[i - 1] : input).focus(); }
    });
    list.addEventListener('click', e => {
      const b = e.target.closest('button[data-i]');
      if (!b) return;
      const item = this.hits?.[Number(b.dataset.i)];
      if (item) { this.close(false); this.onPick(item); }
    });
    pop.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); this.close(); } });
    document.addEventListener('pointerdown', e => {
      if (!pop.hidden && !pop.contains(e.target) && !button.contains(e.target)) this.close(false);
    });
  }

  /** Indexet byggs första gången rutan öppnas; resorna laddas då (de laddas annars efter starten). */
  async ensureIndex() {
    if (this.index) return this.index;
    const routes = await this.loadRoutes().catch(() => []);
    this.index = buildIndex({ events: this.data.events, empireGroups: this.data.empireGroups, routes }, { t, visible: isVisibleReview });
    return this.index;
  }

  async open() {
    const r = (this.button.closest('.top-actions') ?? this.button).getBoundingClientRect();
    this.pop.style.top = `${r.bottom + 8}px`;
    this.pop.style.maxHeight = `calc(100dvh - ${r.bottom + 24}px)`;
    this.pop.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
    this.onOpen();
    this.input.focus({ preventScroll: true });
    this.input.select();
    await this.ensureIndex();
    this.run();
  }

  close(returnFocus = true) {
    if (this.pop.hidden) return;
    const had = this.pop.contains(document.activeElement);
    this.pop.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
    if (had && returnFocus) this.button.focus({ preventScroll: true });
  }

  run() {
    if (!this.index) return;
    const q = this.input.value.trim();
    if (!q) {
      this.hits = [];
      this.list.replaceChildren();
      this.status.textContent = ui('search.hint');
      return;
    }
    this.hits = search(this.index, q, LIMIT + 1);
    const more = this.hits.length > LIMIT;
    if (more) this.hits.length = LIMIT;
    this.status.textContent = !this.hits.length ? ui('search.none', { q })
      : more ? ui('search.many', { n: LIMIT }) : ui(this.hits.length === 1 ? 'search.one' : 'search.count', { n: this.hits.length });
    this.list.innerHTML = this.hits.map((item, i) => {
      const e = item.ref;
      const kind = ui(`search.type.${item.type}`);
      // Rikets spann är kartdatans (Cliopatria, #138), inte rikets historiska årtal; ett försvunnet land har källornas (#72)
      const span = (a, b) => formatEventTime({ start: a, end: b, edtf: '' });
      const time = item.type !== 'empire' ? formatEventTime(e)
        : e.vanished ? span(e.vanished.founded, e.vanished.dissolved) : ui('search.mapData', { span: span(item.start, item.end) });
      const color = item.type === 'event' || item.type === 'war' ? CAT[e.category]?.color : item.type === 'empire' ? e.color : CAT.upptackter.color;
      const meta = [kind, time, item.place].filter(Boolean).join(' · ');
      return `<li><button type="button" class="search-hit" data-i="${i}">
        <span class="dot" style="background:${esc(color ?? 'var(--brass)')}"></span>
        <span class="search-hit-text"><b>${esc(item.title)}</b><span class="search-hit-meta">${esc(meta)}</span></span>
      </button></li>`;
    }).join('');
  }
}
