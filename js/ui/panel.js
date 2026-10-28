// "Samtidigt i världen": filter, lista över synliga händelser och detaljvy.
import { CATEGORIES, CAT, REVIEW, t, formatEventTime, formatYear } from '../model.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export class Panel {
  constructor({ root, list, filters, detail, sub, count, toggle }, { events, srcById }) {
    Object.assign(this, { root, list, filtersEl: filters, detail, sub, count, toggle, srcById });
    this.onSelect = () => {};
    this.onFilter = () => {};
    this.onSources = () => {};
    this.selectedId = null;

    // Visa bara kategorier som har händelser, i den fasta ordningen.
    const used = new Set(events.map(e => e.category));
    this.filters = new Set(used);
    for (const c of CATEGORIES.filter(c => used.has(c.id))) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'filter'; b.setAttribute('aria-pressed', 'true');
      b.innerHTML = `<span class="dot" style="background:${c.color}"></span>${esc(t(c.name))}`;
      b.addEventListener('click', () => {
        const on = this.filters.has(c.id);
        on ? this.filters.delete(c.id) : this.filters.add(c.id);
        b.setAttribute('aria-pressed', String(!on));
        this.onFilter(this.filters);
      });
      filters.append(b);
    }

    toggle.addEventListener('click', () => {
      const open = !root.classList.contains('open');
      root.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  render(visible, year, window, eventsOn = true) {
    if (!eventsOn) {
      this.count.textContent = '0';
      this.sub.textContent = 'Händelselagret är avstängt.';
      this.list.innerHTML = `<li class="empty-note">Slå på Händelser under Lager för att se vad som hände.</li>`;
      return;
    }
    const inside = visible.filter(v => v.inside).length;
    this.count.textContent = String(visible.length);
    const w = Math.round(window), near = visible.length - inside;
    const parts = [];
    parts.push(inside ? `${inside} ${inside === 1 ? 'händelse pågår' : 'händelser pågår'} år ${formatYear(year)}` : `Inget pågår exakt år ${formatYear(year)}`);
    if (near) parts.push(`${near} till inom ±${w} år`);
    this.sub.textContent = visible.length ? parts.join(', ') + '.' : `Inget i datan inom ±${w} år från ${formatYear(year)}.`;
    if (!visible.length) {
      this.list.innerHTML = `<li class="empty-note">Dra i tidslinjen eller tryck på uppspelning för att hitta nästa händelse. Prickarna under tidslinjen visar var det finns data.</li>`;
      return;
    }
    this.list.innerHTML = visible.map(({ e, inside }) => `
      <li class="event-item${inside ? '' : ' is-near'}${e.id === this.selectedId ? ' is-selected' : ''}" data-id="${esc(e.id)}" tabindex="0">
        <span class="dot" style="background:${CAT[e.category]?.color}"></span>
        <span class="ttl">${esc(t(e.title))}</span>
        <span class="meta">${esc(formatEventTime(e))} · ${esc(t(e.place))}</span>
      </li>`).join('');
    for (const li of this.list.querySelectorAll('.event-item')) {
      const go = () => this.onSelect(li.dataset.id);
      li.addEventListener('click', go);
      li.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } });
    }
  }

  showDetail(e) {
    this.selectedId = e?.id ?? null;
    if (!e) { this.detail.hidden = true; return; }
    const rv = REVIEW[e.review] ?? REVIEW.draft;
    const srcs = (e.sources ?? []).map(id => this.srcById[id]).filter(Boolean);
    this.detail.innerHTML = `
      <h3>${esc(t(e.title))}</h3>
      <div class="meta">${esc(formatEventTime(e))} · ${esc(t(e.place))} · ${esc(t(CAT[e.category]?.name))}</div>
      <p>${esc(t(e.summary))}</p>
      <div class="src">Källa: ${srcs.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(', ') || 'saknas'}</div>
      <div class="detail-actions">
        <span class="review-badge ${rv.cls}">${esc(rv.sv)}</span>
        <button type="button" class="link-btn" data-close>Stäng</button>
      </div>`;
    this.detail.hidden = false;
    this.detail.querySelector('[data-close]').addEventListener('click', () => this.onSelect(null));
    this.root.classList.add('open');
  }
}
