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
    button.addEventListener('click', () => (menu.hidden ? this.open() : this.close()));
    document.addEventListener('pointerdown', e => {
      if (!menu.hidden && !menu.contains(e.target) && !button.contains(e.target)) this.close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { this.close(); button.focus(); } });
  }

  /**
   * Undermeny med en rad per religion, byggd från datan. Raden visar religionens
   * färg, så att undermenyn också fungerar som förklaring. onToggle(id, på).
   */
  sublist(container, items, onToggle) {
    for (const it of items) {
      const label = document.createElement('label');
      label.className = 'layer-row layer-subrow';
      const input = document.createElement('input');
      input.type = 'checkbox'; input.checked = true;
      input.addEventListener('change', () => onToggle(it.id, input.checked));
      const sw = document.createElement('span');
      sw.className = 'swatch'; sw.style.background = it.color;
      label.append(input, sw, document.createTextNode(it.name));
      container.append(label);
    }
  }

  open() {
    // Menyn läggs under knappen, som kan hamna på olika rader i smal skärm
    const r = this.button.getBoundingClientRect();
    this.menu.style.top = `${r.bottom + 8}px`;
    this.menu.style.maxHeight = `calc(100dvh - ${r.bottom + 24}px)`; // lång meny rullar i stället
    this.menu.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
  }
  close() {
    this.menu.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
  }
}
