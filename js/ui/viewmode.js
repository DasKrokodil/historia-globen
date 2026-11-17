// Vy och stil (#1577): Glob och Platt karta är två ytor, medan Upptäcktsresor är en fristående stil.
// Upptäcktsstilen är lagret discovery (#101) med resorna och fungerar därför både på globen och i Platt karta.
// Knapparna följer också när Platt vy eller lagret slås på och av någon annanstans (Lager, adressen, en tur).
export class ViewMode {
  /** buttons: { globe, flat, discovery }. flatMap: Platt vy. layers: Lager-menyn (set och onChange). */
  constructor(buttons, { flatMap, layers }) {
    Object.assign(this, { buttons, flatMap, layers });
    buttons.globe.addEventListener('click', () => this.setSurface('globe'));
    buttons.flat.addEventListener('click', () => this.setSurface(this.flatMap.hidden ? 'flat' : 'globe'));
    buttons.discovery.addEventListener('click', () => this.setDiscovery(!this.layers.on.discovery));
    this.sync();
  }

  layer(name, on) {
    if (!!this.layers.on[name] === on) return;
    this.layers.set(name, on);
    this.layers.onChange(name, on);
  }

  /** Väljer ytan utan att ändra den valda kartstilen. */
  setSurface(surface) {
    this.flatMap.setOpen(surface === 'flat');
    this.sync();
  }

  /** Slår på eller av upptäcktsstilen utan att byta mellan glob och platt karta. */
  setDiscovery(on) {
    if (on) this.layer('routes', true);
    this.layer('discovery', on);
    this.sync();
  }

  /** Markerar den valda ytan och stilen oberoende av varandra. */
  sync() {
    this.buttons.globe.setAttribute('aria-pressed', String(this.flatMap.hidden));
    this.buttons.flat.setAttribute('aria-pressed', String(!this.flatMap.hidden));
    this.buttons.discovery.setAttribute('aria-pressed', String(!!this.layers.on.discovery));
  }
}
