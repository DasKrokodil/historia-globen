// Fokusmenyn (#113): välj vad du vill följa i fokusläget – ett krig, ett rike
// eller en religion. Menyn fylls från datan och öppnas under knappgruppen.
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export class FocusMenu {
  constructor({ button, menu }) {
    Object.assign(this, { button, menu });
    this.onPick = () => {};
    this.onOpen = () => {};
    this.groups = [];
    button.addEventListener('click', () => (menu.hidden ? this.open() : this.close()));
    document.addEventListener('pointerdown', e => {
      if (!menu.hidden && !menu.contains(e.target) && !button.contains(e.target)) this.close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { this.close(); button.focus(); } });
  }

  /** groups: [{ title, items: [{ key, label, sub, color }] }] */
  setGroups(groups) {
    this.groups = groups;
    this.menu.innerHTML = `<div class="layer-heading first">Följ i fokusläge</div>` + groups.map(g => `
      <div class="layer-heading">${esc(g.title)}</div>
      ${g.items.length ? g.items.map(it => `<button type="button" class="layer-row focus-item" data-key="${esc(it.key)}">
        <span class="swatch" style="background:${esc(it.color)}"></span><span>${esc(it.label)}</span>
        ${it.sub ? `<span class="layer-note">${esc(it.sub)}</span>` : ''}</button>`).join('') : '<div class="layer-note pad">Laddas …</div>'}`).join('');
    for (const b of this.menu.querySelectorAll('[data-key]')) {
      b.addEventListener('click', () => { this.close(); this.onPick(b.dataset.key); });
    }
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
