// Kort hjälp för nya besökare (#245): tre steg ("Dra globen", "Byt år", "Följ en berättelse").
// Hjälpen visas första gången (sparas som hg-help-seen i localStorage, med try/catch), försvinner vid
// första interaktionen eller med Stäng, och öppnas igen med knappen Hjälp. Texterna står i index.html.

const KEY = 'hg-help-seen';

export class Help {
  constructor({ root, button, close }) {
    Object.assign(this, { root, button, closeBtn: close });
    button.addEventListener('click', () => (root.hidden ? this.open(true) : this.close()));
    close.addEventListener('click', () => this.close());
    // Första interaktionen någon annanstans på sidan stänger hjälpen: ett tryck, ett klick, hjulet eller
    // en tangent (utom Tab, så att man kan gå till Stäng med tangentbordet).
    const away = e => {
      if (root.hidden || root.contains(e.target) || button.contains(e.target)) return;
      if (e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Shift')) return;
      this.close();
    };
    for (const type of ['pointerdown', 'wheel', 'keydown']) document.addEventListener(type, away, { capture: true, passive: true });
    root.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(true); });
  }

  /** Visa hjälpen om besökaren inte har sett den. Utan lagring visas den vid varje besök. */
  showFirstTime() {
    let seen = false;
    try { seen = localStorage.getItem(KEY) === '1'; } catch { /* utan lagring */ }
    if (!seen) this.open(false);
  }

  /** Öppna hjälpen. Från knappen flyttas fokus till Stäng, så att tangentbordsanvändare hittar den. */
  open(fromButton) {
    // Under knapparna uppe till höger, som kan ligga i flera rader (som menyerna Lager och Fokus)
    const r = (this.button.closest('.top-actions') ?? this.button).getBoundingClientRect();
    this.root.style.top = `${Math.round(r.bottom + 10)}px`;
    this.root.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
    if (fromButton) this.closeBtn.focus({ preventScroll: true });
  }

  /** Stäng hjälpen och kom ihåg att den har setts. Fokus tillbaka till knappen om det låg i hjälpen. */
  close(refocus = this.root.contains(document.activeElement)) {
    if (this.root.hidden) return;
    this.root.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
    try { localStorage.setItem(KEY, '1'); } catch { /* utan lagring */ }
    if (refocus) this.button.focus({ preventScroll: true });
  }
}
