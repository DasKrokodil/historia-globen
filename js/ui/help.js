// Kort hjälp: tre steg ("Dra globen", "Byt år", "Följ en berättelse").
// Hjälpen öppnas med knappen Hjälp, försvinner vid första interaktionen eller med Stäng.
// Texterna för de gamla hjälpstegen står i index.html; datumprototypen i data/vyer.json.
import { formatYear, isVisibleReview, parseYear, t } from '../model.js';
import { selectEventsForDate, selectEventsForYear } from '../date-events.js';

export class Help {
  constructor({ root, button, close, birthday }, { events = [], birthday: copy = {} } = {}, { onYear = () => {} } = {}) {
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
    if (birthday && copy.title) this._birthday(birthday, copy, events, onYear);
  }

  _birthday(nodes, copy, events, onYear) {
    const { title, text, label, input, submit, form, error, result, summary, list } = nodes;
    title.textContent = t(copy.title); text.textContent = t(copy.copy); label.textContent = t(copy.label);
    input.placeholder = t(copy.placeholder); submit.textContent = t(copy.submit);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const value = input.value.trim();
      const date = /^\d{4}-\d\d-\d\d$/.test(value) ? value : null;
      const year = date ? Number(date.slice(0, 4)) : parseYear(value);
      if (year == null) { error.textContent = t(copy.invalid); error.hidden = false; result.hidden = true; return; }
      error.hidden = true; onYear(year);
      const visible = events.filter(event => isVisibleReview(event.review));
      const found = date ? selectEventsForDate(date, visible) : selectEventsForYear(year, visible);
      const shown = found.slice(0, 5);
      const template = date ? t(copy.dateResult) : t(copy.yearResult);
      summary.textContent = template.replace('{date}', date ?? formatYear(year)).replace('{year}', formatYear(year)).replace('{count}', String(found.length));
      list.replaceChildren(...shown.map(event => { const item = document.createElement('li'); item.textContent = t(event.title); return item; }));
      if (!shown.length) { const item = document.createElement('li'); item.textContent = t(copy.empty); list.append(item); }
      if (found.length > shown.length) { const item = document.createElement('li'); item.textContent = t(copy.more).replace('{count}', String(shown.length)); list.append(item); }
      result.hidden = false;
    });
  }

  /** Öppna hjälpen. Från knappen flyttas fokus till Stäng, så att tangentbordsanvändare hittar den. */
  open(fromButton) {
    // Under knapparna uppe till höger, som kan ligga i flera rader (som menyerna Lager och Fokus)
    const r = (this.button.closest('.top-actions') ?? this.button).getBoundingClientRect();
    this.root.style.top = `${Math.round(r.bottom + 10)}px`;
    this.root.style.maxHeight = `calc(100dvh - ${Math.round(r.bottom + 18)}px)`;
    this.root.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
    if (fromButton) this.closeBtn.focus({ preventScroll: true });
  }

  /** Stäng hjälpen. Fokus tillbaka till knappen om det låg i hjälpen. */
  close(refocus = this.root.contains(document.activeElement)) {
    if (this.root.hidden) return;
    this.root.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
    if (refocus) this.button.focus({ preventScroll: true });
  }
}
