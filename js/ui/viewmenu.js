// Menyn Visa i smal skärm (#361): knapparna Platt vy, Källor och Hjälp samlas bakom knappen Visa, så att
// årtalet och huvudknapparna ryms i en kompakt rad överst. I datorn syns knappen inte och knapparna står
// som förut i gruppen Visa (CSS: .more-menu är display: contents). Knapparna själva sköts av sina egna moduler;
// den här filen öppnar och stänger bara menyn.
const narrow = matchMedia('(max-width: 760px)');

export class ViewMenu {
  constructor({ toggle, menu }) {
    Object.assign(this, { toggle, menu, group: toggle.closest('.action-group') });
    toggle.addEventListener('click', () => this.set(!this.isOpen));
    // Ett val i menyn stänger den (knappens egen åtgärd körs först)
    menu.addEventListener('click', e => { if (narrow.matches && e.target.closest('button')) this.set(false); });
    document.addEventListener('pointerdown', e => {
      if (this.isOpen && !this.group.contains(e.target)) this.set(false);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) { this.set(false); toggle.focus({ preventScroll: true }); }
    });
    narrow.addEventListener('change', () => this.set(false));
  }

  get isOpen() { return this.group.classList.contains('more-open'); }

  set(open) {
    this.group.classList.toggle('more-open', open);
    this.toggle.setAttribute('aria-expanded', String(open));
    if (open) this.menu.querySelector('button')?.focus({ preventScroll: true });
  }
}
