// Fokusmenyn (#113): välj vad du vill följa i fokusläget – ett krig, ett rike
// eller en religion. Menyn fylls från datan och öppnas under knappgruppen.
// Den visar det som överlappar tidsepoken man står i, närmast först, och
// resten bakom "Visa alla" (#121).
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export class FocusMenu {
  constructor({ button, menu }) {
    Object.assign(this, { button, menu });
    this.onPick = () => {};
    this.onOpen = () => {};
    this.groups = [];
    this.time = null;
    this.showAll = false;
    button.addEventListener('click', () => (menu.hidden ? this.open() : this.close()));
    document.addEventListener('pointerdown', e => {
      if (!menu.hidden && !menu.contains(e.target) && !button.contains(e.target)) this.close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { this.close(); button.focus(); } });
  }

  /** groups: [{ title, loading, items: [{ key, label, sub, color, from, to }] }] */
  setGroups(groups) {
    this.groups = groups;
    this.render();
  }

  /** Året man står på och tidsepoken runt det: { year, from, to, name }. Visa alla nollställs. */
  setTime(time) {
    this.time = time;
    this.showAll = false;
    this.render();
  }

  render() {
    const tm = this.time;
    const dist = it => !tm ? 0 : tm.year < it.from ? it.from - tm.year : tm.year > it.to ? tm.year - it.to : 0;
    const near = it => !tm || (it.to >= tm.from && it.from <= tm.to);
    let hidden = 0;
    const groups = this.groups.map(g => {
      const sorted = [...g.items].sort((a, b) => dist(a) - dist(b) || a.label.localeCompare(b.label, 'sv'));
      const items = this.showAll ? sorted : sorted.filter(near);
      hidden += sorted.length - items.length;
      return { ...g, items };
    }).filter(g => g.items.length || g.loading);
    const intro = tm && !this.showAll ? `<div class="layer-note pad">Det som hör till ${esc(tm.name.toLowerCase())}, närmast först.</div>` : '';
    this.menu.innerHTML = `<div class="layer-heading first">Följ i fokusläge</div>${intro}` + (groups.map(g => `
      <div class="layer-heading">${esc(g.title)}</div>
      ${g.items.length ? g.items.map(it => `<button type="button" class="layer-row focus-item" data-key="${esc(it.key)}">
        <span class="swatch" style="background:${esc(it.color)}"></span><span>${esc(it.label)}</span>
        ${it.sub ? `<span class="layer-note">${esc(it.sub)}</span>` : ''}</button>`).join('') : '<div class="layer-note pad">Laddas …</div>'}`).join('')
      || '<div class="layer-note pad">Inget att följa i den här tiden ännu.</div>')
      + (hidden ? `<button type="button" class="layer-row focus-more" data-all>Visa alla (${hidden} till)</button>` : '')
      + (this.showAll && tm ? `<button type="button" class="layer-row focus-more" data-near>Visa bara ${esc(tm.name.toLowerCase())}</button>` : '');
    for (const b of this.menu.querySelectorAll('[data-key]')) {
      b.addEventListener('click', () => { this.close(); this.onPick(b.dataset.key); });
    }
    this.menu.querySelector('[data-all]')?.addEventListener('click', () => { this.showAll = true; this.render(); });
    this.menu.querySelector('[data-near]')?.addEventListener('click', () => { this.showAll = false; this.render(); });
  }

  open() {
    const r = (this.button.closest('.top-actions') ?? this.button).getBoundingClientRect();
    this.menu.style.top = `${r.bottom + 8}px`;
    this.menu.style.maxHeight = `calc(100dvh - ${r.bottom + 24}px)`;
    this.menu.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
    this.onOpen();
  }
  close() {
    this.menu.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
  }
}
