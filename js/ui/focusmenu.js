// Fokusmenyn (#113): välj vad du vill följa i fokusläget – ett krig, ett rike
// eller en religion. Menyn fylls från datan och öppnas under knappgruppen.
// Den visar det som pågår nära året man står på, närmast först, och
// resten bakom "Visa alla" (#121). Ett sökfält och flikar (Alla, Krig, Riken,
// Religioner) gör listan hanterbar (#240); fliken sparas i localStorage.
const TABS = ['Alla', 'Krig', 'Riken', 'Religioner'];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export class FocusMenu {
  constructor({ button, menu }) {
    Object.assign(this, { button, menu });
    this.onPick = () => {};
    this.onOpen = () => {};
    this.groups = [];
    this.time = null;
    this.showAll = false;
    this.query = '';
    this.tab = 'Alla';
    try { const v = localStorage.getItem('hg-focus-tab'); if (TABS.includes(v)) this.tab = v; } catch { /* utan lagring */ }
    // Sökfält och flikar byggs en gång, så att fältet behåller markören medan listan ritas om
    menu.innerHTML = `<div class="layer-heading first">Följ i fokusläge</div>
      <input type="search" class="focus-search" placeholder="Sök krig, rike eller religion" aria-label="Sök i Fokus" autocomplete="off">
      <div class="focus-tabs" role="group" aria-label="Visa">${TABS.map(n => `<button type="button" class="chip-btn" data-tab="${n}" aria-pressed="${n === this.tab}">${n}</button>`).join('')}</div>
      <div class="focus-body"></div>`;
    this.body = menu.querySelector('.focus-body');
    const input = menu.querySelector('.focus-search');
    input.addEventListener('input', () => { this.query = input.value; this.render(); });
    for (const b of menu.querySelectorAll('[data-tab]')) b.addEventListener('click', () => {
      this.tab = b.dataset.tab;
      try { localStorage.setItem('hg-focus-tab', this.tab); } catch { /* utan lagring */ }
      for (const x of menu.querySelectorAll('[data-tab]')) x.setAttribute('aria-pressed', String(x === b));
      this.render();
    });
    button.addEventListener('click', () => (menu.hidden ? this.open() : this.close()));
    document.addEventListener('pointerdown', e => {
      if (!menu.hidden && !menu.contains(e.target) && !button.contains(e.target)) this.close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { this.close(); button.focus(); } });
  }

  /** groups: [{ title, note, loading, items: [{ key, label, sub, color, from, to }] }] */
  setGroups(groups) {
    this.groups = groups;
    this.render();
  }

  /** Året man står på och fönstret runt det: { year, from, to, label }. Visa alla nollställs. */
  setTime(time) {
    this.time = time;
    this.showAll = false;
    this.render();
  }

  render() {
    const tm = this.time;
    const dist = it => !tm ? 0 : tm.year < it.from ? it.from - tm.year : tm.year > it.to ? tm.year - it.to : 0;
    const near = it => !tm || (it.to >= tm.from && it.from <= tm.to);
    // Vid sökning letar vi bland alla poster, inte bara de nära året
    const q = this.query.trim().toLocaleLowerCase('sv');
    let hidden = 0;
    const groups = this.groups.filter(g => this.tab === 'Alla' || g.title === this.tab).map(g => {
      const sorted = [...g.items].sort((a, b) => dist(a) - dist(b) || a.label.localeCompare(b.label, 'sv'));
      const items = q ? sorted.filter(it => it.label.toLocaleLowerCase('sv').includes(q))
        : this.showAll ? sorted : sorted.filter(near);
      hidden += sorted.length - items.length;
      return { ...g, items };
    }).filter(g => g.items.length || g.loading);
    const intro = tm && !this.showAll && !q ? `<div class="layer-note pad">Det som pågår ${esc(tm.label)}, närmast först.</div>` : '';
    const empty = q ? `Inget namn innehåller "${esc(this.query.trim())}".` : 'Inget att följa i den här tiden ännu.';
    this.body.innerHTML = intro + (groups.map(g => `
      <div class="layer-heading">${esc(g.title)}</div>
      ${g.note ? `<div class="layer-note pad focus-note">${esc(g.note)}</div>` : ''}
      ${g.items.length ? g.items.map(it => `<button type="button" class="layer-row focus-item" data-key="${esc(it.key)}">
        <span class="swatch" style="background:${esc(it.color)}"></span><span>${esc(it.label)}</span>
        ${it.sub ? `<span class="layer-note">${esc(it.sub)}</span>` : ''}</button>`).join('') : '<div class="layer-note pad">Laddas …</div>'}`).join('')
      || `<div class="layer-note pad">${empty}</div>`)
      + (hidden && !q ? `<button type="button" class="layer-row focus-more" data-all>Visa alla (${hidden} till)</button>` : '')
      + (this.showAll && tm && !q ? `<button type="button" class="layer-row focus-more" data-near>Visa bara det som pågår ${esc(tm.label)}</button>` : '');
    for (const b of this.body.querySelectorAll('[data-key]')) {
      b.addEventListener('click', () => { this.close(); this.onPick(b.dataset.key); });
    }
    this.body.querySelector('[data-all]')?.addEventListener('click', () => { this.showAll = true; this.render(); });
    this.body.querySelector('[data-near]')?.addEventListener('click', () => { this.showAll = false; this.render(); });
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
