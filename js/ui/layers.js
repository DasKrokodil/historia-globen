// Lagerväljaren: en meny där man slår av och på lager (händelser, fun facts,
// riken, religioner, dagens gränser). Vilka lager som finns och startläget står i index.html.
export class LayerMenu {
  constructor({ button, menu }) {
    Object.assign(this, { button, menu });
    this.onChange = () => {};
    this.on = {};
    for (const input of menu.querySelectorAll('input[data-layer]')) {
      this.on[input.dataset.layer] = input.checked;
      input.addEventListener('change', () => {
        this.on[input.dataset.layer] = input.checked;
        this.onChange(input.dataset.layer, input.checked);
      });
    }
    // Vad uppspelningen ska pausa vid (#114). Valen sparas till nästa besök.
    this.pause = {};
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('hg-pause') || '{}'); } catch { /* utan lagring */ }
    for (const input of menu.querySelectorAll('input[data-pause]')) {
      if (input.dataset.pause in saved) input.checked = saved[input.dataset.pause];
      this.pause[input.dataset.pause] = input.checked;
      input.addEventListener('change', () => {
        this.pause[input.dataset.pause] = input.checked;
        try { localStorage.setItem('hg-pause', JSON.stringify(this.pause)); } catch { /* utan lagring */ }
      });
    }
    // Lugn rörelse (#246): följer webbläsarens prefers-reduced-motion tills man själv väljer. Valet sparas.
    this.onCalm = () => {};
    const calmInput = menu.querySelector('input[data-calm]');
    this.calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    try { const s = localStorage.getItem('hg-calm'); if (s !== null) this.calm = s === '1'; } catch { /* utan lagring */ }
    const applyCalm = () => { document.documentElement.classList.toggle('calm', this.calm); this.onCalm(this.calm); };
    if (calmInput) {
      calmInput.checked = this.calm;
      calmInput.addEventListener('change', () => {
        this.calm = calmInput.checked;
        try { localStorage.setItem('hg-calm', this.calm ? '1' : '0'); } catch { /* utan lagring */ }
        applyCalm();
      });
    }
    document.documentElement.classList.toggle('calm', this.calm);
    this.onOpen = () => {};
    button.addEventListener('click', () => (menu.hidden ? this.open() : this.close()));
    document.addEventListener('pointerdown', e => {
      if (!menu.hidden && !menu.contains(e.target) && !button.contains(e.target)) this.close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { this.close(); button.focus(); } });
  }

  /** Sätter ett lager av eller på utifrån, till exempel "keep" från teckenförklaringen (#235). */
  set(name, on) {
    const input = this.menu.querySelector(`input[data-layer="${name}"]`);
    if (input) input.checked = on;
    this.on[name] = on;
  }

  /**
   * Undermeny med en rad per religion, byggd från datan. Raden visar religionens
   * färg, så att undermenyn också fungerar som förklaring. onToggle(id, på).
   * Rader med info (religioner med faktaruta, #90) får en knapp som anropar onInfo(id).
   */
  sublist(container, items, onToggle, onInfo = () => {}) {
    for (const it of items) {
      const label = document.createElement('label');
      label.className = 'layer-row layer-subrow';
      const input = document.createElement('input');
      input.type = 'checkbox'; input.checked = true;
      input.addEventListener('change', () => onToggle(it.id, input.checked));
      const sw = document.createElement('span');
      sw.className = 'swatch'; sw.style.background = it.color;
      label.append(input, sw, document.createTextNode(it.name));
      if (it.info) {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'info-btn';
        btn.textContent = 'Fakta';
        btn.setAttribute('aria-label', `Fakta om ${it.name}`);
        btn.addEventListener('click', ev => { ev.preventDefault(); this.close(); onInfo(it.id); });
        label.append(btn);
      }
      container.append(label);
    }
  }

  open() {
    // Menyn läggs under knappen, som kan hamna på olika rader i smal skärm
    const r = (this.button.closest('.top-actions') ?? this.button).getBoundingClientRect();
    this.menu.style.top = `${r.bottom + 8}px`;
    this.menu.style.maxHeight = `calc(100dvh - ${r.bottom + 24}px)`; // lång meny rullar i stället
    this.menu.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
    this.onOpen();
    this.menu.querySelector('input,button')?.focus({ preventScroll: true }); // fokus in i menyn (#246)
  }
  close() {
    const had = this.menu.contains(document.activeElement);
    this.menu.hidden = true;
    if (had) this.button.focus(); // tillbaka till knappen (#246)
    this.button.setAttribute('aria-expanded', 'false');
  }
}
