// Nivåväxlaren (#1959): en rad knappar för nivåer i en och samma ordning, till exempel tidsreglagen "Före 3000 f.Kr." och
// "3000 f.Kr.–i dag". Samma form ska användas av lägesväxlaren i #1517 ("Människans historia › …"): den ger en nivå ovanför
// genom att lägga ett led före raden, och lägger nivåerna in via `levels`. Komponenten känner varken tid, språk eller reglage:
// den får namnen färdiga och säger bara vilken nivå som väljs.
//
// Formen: nivåerna står i ordning från vänster till höger, den första vid radens kant och den sista vid andra kanten. Nivån man
// är på är nedtryckt (aria-pressed="true"). De andra är dörrar: namnet med en pil åt det håll nivån ligger ("3000 f.Kr.–i dag →"
// vid högerkanten medan man är på det första reglaget, "← Före 3000 f.Kr." vid vänsterkanten på det andra). Namnet är alltid
// detsamma, med eller utan pil; pilen är bara för ögat (aria-hidden), så att en skärmläsare läser namnet.

export class LevelSwitch {
  /**
   * @param {HTMLElement} group elementet som blir gruppen (role="group" och aria-label sätts i index.html)
   * @param {{ levels: {id: string, name: string}[], onSelect: (id: string) => void }} opts
   */
  constructor(group, { levels, onSelect }) {
    this.group = group;
    this.levels = levels;
    this.onSelect = onSelect;
    this.current = levels[0]?.id ?? null;
    this.buttons = levels.map(level => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'level-btn';
      b.dataset.level = level.id;
      const name = document.createElement('span');
      name.className = 'level-name';
      name.textContent = level.name;
      b.append(name);
      b.addEventListener('click', () => { if (b.getAttribute('aria-pressed') !== 'true' && !b.disabled) this.onSelect(level.id); });
      return b;
    });
    group.replaceChildren(...this.buttons);
    this._sync();
  }

  /** Nivån som är vald nu. En okänd nivå ändrar ingenting. */
  setCurrent(id) {
    if (id === this.current || !this.levels.some(l => l.id === id)) return;
    this.current = id;
    this._sync();
  }

  /** Låst (tidslåset): knapparna går inte att nå. Raden döljs dessutom av CSS i lägen som låser tiden. */
  setDisabled(on) {
    for (const b of this.buttons) b.disabled = on;
    this.group.classList.toggle('level-locked', on);
  }

  _sync() {
    const at = this.levels.findIndex(l => l.id === this.current);
    this.buttons.forEach((b, i) => {
      const here = i === at;
      b.setAttribute('aria-pressed', String(here));
      b.classList.toggle('is-door', !here);
      b.classList.toggle('door-next', !here && i > at);
      b.classList.toggle('door-prev', !here && i < at);
      b.querySelector('.level-arrow')?.remove();
      if (here) return;
      const arrow = document.createElement('span');
      arrow.className = 'level-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = i > at ? '→' : '←';
      if (i > at) b.append(arrow); else b.prepend(arrow);
    });
  }
}
