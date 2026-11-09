// Mobilmenyn (#530, grupperna sedan #651): i smal skärm står bara Samtidigt och knappen Meny i sidhuvudet.
// Grupperna Vy (Glob, Platt karta, Upptäcktsresor), Utforska (Sök och följ, Turer, Lager) och
// Mer (Kom igång, Källor, Hjälp, Dela, Språk) samlas i en nedfällbar panel bakom Meny. I datorn syns knappen inte och
// grupperna står i sidhuvudet (CSS: .more-menu är display: contents), med Mer som en liten egen meny.
// Knapparna själva sköts av sina egna moduler; den här filen öppnar och stänger menyn, flyttar Samtidigt ut ur
// gruppen i smal skärm och skickar fokus till Meny när en knapp som ligger i den stängda menyn ska få fokus.
const narrow = matchMedia('(max-width: 760px)');

export class ViewMenu {
  /** toggle: knappen Meny. menu: panelen. keep: knappen som står kvar i sidhuvudet i smal skärm (Samtidigt). */
  constructor({ toggle, menu, keep, label }) {
    Object.assign(this, { toggle, menu, keep, root: toggle.closest('.top-actions') ?? toggle.parentElement });
    if (label) toggle.querySelector('#more-label').textContent = label;
    // Platsen i gruppen Utforska som Samtidigt flyttas tillbaka till i datorbredd
    this.home = keep ? { parent: keep.parentElement, next: keep.nextElementSibling } : null;
    toggle.addEventListener('click', () => this.set(!this.isOpen));
    // Ett val i menyn stänger den (knappens egen åtgärd körs först)
    menu.addEventListener('click', e => { if (narrow.matches && e.target.closest('button')) this.set(false); });
    document.addEventListener('pointerdown', e => {
      if (this.isOpen && !this.root.contains(e.target)) this.set(false);
    });
    // Tab ut ur menyn stänger den
    this.root.addEventListener('focusout', e => {
      if (this.isOpen && e.relatedTarget && !this.root.contains(e.relatedTarget)) this.set(false);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) { this.set(false); toggle.focus({ preventScroll: true }); }
    });
    // När en panel (Lager, Fokus, Hjälp …) stängs går fokus tillbaka till sin knapp. Ligger knappen i den stängda
    // menyn syns den inte, och då får Meny fokus i stället (#530).
    for (const b of menu.querySelectorAll('button')) {
      if (b === keep) continue;
      const own = b.focus.bind(b);
      b.focus = opts => (this.hidesButtons ? toggle.focus(opts) : own(opts));
    }
    narrow.addEventListener('change', () => { this.set(false); this.place(); });
    this.place();
  }

  get isOpen() { return this.root.classList.contains('more-open'); }
  /** Smal skärm och stängd meny: knapparna i menyn syns inte. */
  get hidesButtons() { return narrow.matches && !this.isOpen; }

  /** Samtidigt står bredvid Meny i smal skärm och i gruppen Utforska i datorn. */
  place() {
    if (!this.keep) return;
    const had = document.activeElement === this.keep;
    if (narrow.matches) { if (this.keep.nextElementSibling !== this.toggle) this.toggle.before(this.keep); }
    else if (this.keep.parentElement !== this.home.parent) this.home.parent.insertBefore(this.keep, this.home.next);
    if (had) this.keep.focus({ preventScroll: true });
  }

  set(open) {
    this.root.classList.toggle('more-open', open);
    this.toggle.setAttribute('aria-expanded', String(open));
    if (open) this.menu.querySelector('button:not([hidden])')?.focus({ preventScroll: true });
  }
}

/**
 * Mer (#651): Källor, Hjälp, Dela och Språk. I datorn står de i en liten meny bakom knappen Mer, i mobilen som en
 * rad längst ner i Meny (där syns knappen Mer inte och raden är alltid öppen, CSS). Ett val stänger menyn, liksom
 * Escape, ett klick utanför och Tab ut ur den. När en panel som öppnades härifrån (Hjälp, Källor) stängs och
 * knappen ligger i den stängda menyn får Mer fokus i stället.
 */
export class ExtraMenu {
  constructor({ toggle, menu }) {
    Object.assign(this, { toggle, menu, wrap: toggle.parentElement });
    toggle.addEventListener('click', () => this.set(!this.isOpen));
    menu.addEventListener('click', e => { if (!narrow.matches && e.target.closest('button')) this.set(false); });
    document.addEventListener('pointerdown', e => { if (this.isOpen && !this.wrap.contains(e.target)) this.set(false); });
    this.wrap.addEventListener('focusout', e => {
      if (this.isOpen && e.relatedTarget && !this.wrap.contains(e.relatedTarget)) this.set(false);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) { this.set(false); toggle.focus({ preventScroll: true }); }
    });
    for (const b of menu.querySelectorAll('button')) {
      const own = b.focus.bind(b); // ViewMenus omdirigering i mobilen ligger under (main.js skapar ViewMenu först)
      b.focus = opts => (!narrow.matches && !this.isOpen ? toggle.focus(opts) : own(opts));
    }
    narrow.addEventListener('change', () => this.set(false));
  }

  get isOpen() { return this.wrap.classList.contains('extra-open'); }

  set(open) {
    this.wrap.classList.toggle('extra-open', open);
    this.toggle.setAttribute('aria-expanded', String(open));
    if (open) this.menu.querySelector('button')?.focus({ preventScroll: true });
  }
}
