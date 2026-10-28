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

  open() {
    // Menyn läggs under knappen, som kan hamna på olika rader i smal skärm
    const r = this.button.getBoundingClientRect();
    this.menu.style.top = `${r.bottom + 8}px`;
    this.menu.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
  }
  close() {
    this.menu.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
  }
}
