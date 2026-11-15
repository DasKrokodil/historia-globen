// Vyväljaren (#651): Glob, Platt karta och Upptäcktsresor sida vid sida i gruppen Vy, bara en åt gången.
// - Glob: Platt vy stängd och upptäcktsvyn av.
// - Platt karta: Platt vy (#292) öppen och upptäcktsvyn av. Ett nytt klick går tillbaka till Glob.
// - Upptäcktsresor: lagret discovery (#101) och resorna på globen, som den gamla förinställningen Perspektiv. Ett nytt klick
//   går tillbaka till Glob, som för Platt karta (2026-11-14).
// Knapparna följer också när Platt vy eller lagret slås på och av någon annanstans (Lager, adressen, en tur).
export class ViewMode {
  /** buttons: { globe, flat, discovery }. flatMap: Platt vy. layers: Lager-menyn (set och onChange). */
  constructor(buttons, { flatMap, layers }) {
    Object.assign(this, { buttons, flatMap, layers });
    buttons.globe.addEventListener('click', () => this.set('globe'));
    buttons.flat.addEventListener('click', () => this.set(this.mode === 'flat' ? 'globe' : 'flat'));
    buttons.discovery.addEventListener('click', () => this.set(this.mode === 'discovery' ? 'globe' : 'discovery'));
    this.sync();
  }

  get mode() {
    if (!this.flatMap.hidden) return 'flat';
    return this.layers.on.discovery ? 'discovery' : 'globe';
  }

  layer(name, on) {
    if (!!this.layers.on[name] === on) return;
    this.layers.set(name, on);
    this.layers.onChange(name, on);
  }

  set(mode) {
    if (mode === 'discovery') { this.layer('discovery', true); this.layer('routes', true); }
    else this.layer('discovery', false);
    this.flatMap.setOpen(mode === 'flat');
    this.sync();
  }

  /** Markerar den vy som syns nu. */
  sync() {
    const mode = this.mode;
    for (const [id, b] of Object.entries(this.buttons)) b.setAttribute('aria-pressed', String(id === mode));
  }
}
