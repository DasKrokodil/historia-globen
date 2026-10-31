// Faktarutan som ark nedifrån i smal skärm (#361), med samma tre lägen och samma handtag som Samtidigt-kortet
// (#239, js/ui/funfact.js): litet (handtaget och rubriken), halvt (täcker högst halva globen) och helt (rullar inuti).
// Ett tryck på handtaget stegar litet → halvt → helt → litet, pil upp och ner byter läge, och man kan dra: höjden
// följer fingret och det närmaste läget väljs när man släpper. Läget står i data-sheet på rutan.
//
// Rutans innehåll skrivs om av panel.js (innerHTML) varje gång en ny händelse, ett rike, en religion eller krigets
// berättelse visas. Handtaget är ett och samma element som läggs tillbaka överst när innehållet byts
// (MutationObserver), och ett nytt innehåll öppnar arket halvt, så att globen och markören syns ovanför.
// I datorn (bredare än 760 px) syns handtaget inte och rutan är oförändrad.
const STATES = ['closed', 'half', 'full'];
const LABEL = { closed: 'litet', half: 'halvt', full: 'helt' };
const narrow = matchMedia('(max-width: 760px)');

export class Sheet {
  /** root: rutan (#detail). name: rutans namn för skärmläsare. */
  constructor(root, { name = 'Faktarutan' } = {}) {
    this.root = root; this.name = name;
    this.state = 'half';
    this.onChange = () => {}; // (state) när läget ändras, rutan visas eller döljs
    const h = this.handle = document.createElement('button');
    h.type = 'button'; h.className = 'sheet-handle'; h.id = `${root.id}-handle`;
    h.innerHTML = '<span class="sheet-grip" aria-hidden="true"></span><span class="sheet-chev" aria-hidden="true"></span>';
    this._initDrag();
    // Ett tryck på rubriken i litet läge öppnar arket halvt (större tryckyta än handtaget)
    root.addEventListener('click', e => {
      if (narrow.matches && this.state === 'closed' && !e.target.closest('button, a')) this.set('half');
    });
    new MutationObserver(() => this._attach()).observe(root, { childList: true, attributes: true, attributeFilter: ['hidden'] });
    narrow.addEventListener('change', () => this._sync());
    this._attach();
  }

  /** Byt läge (bara smal skärm). */
  set(state) {
    if (!STATES.includes(state) || state === this.state) return;
    this.state = state;
    this._sync();
  }

  /** När man drar i globen fälls arket ihop till litet läge, så att kartan syns. Rubriken står kvar. */
  autoClose() {
    if (narrow.matches && !this.root.hidden) this.set('closed');
  }

  _attach() {
    if (this.root.firstElementChild !== this.handle) {
      this.root.prepend(this.handle);
      this.state = 'half'; // nytt innehåll: halvt, oavsett förra läget
    }
    this._sync();
  }

  _sync() {
    const st = this.state;
    if (this.root.dataset.sheet !== st) this.root.dataset.sheet = st;
    this.handle.setAttribute('aria-expanded', String(st !== 'closed'));
    this.handle.setAttribute('aria-label', `${this.name}, ${LABEL[st]}. ${st === 'full' ? 'Tryck för att göra den liten' : 'Tryck för att visa mer'}, eller använd pil upp och ner.`);
    if (st !== 'full') this.root.scrollTop = 0;
    this.onChange(narrow.matches && !this.root.hidden ? st : null);
  }

  _initDrag() {
    const h = this.handle;
    const step = d => this.set(STATES[Math.max(0, Math.min(2, STATES.indexOf(this.state) + d))]);
    let drag = null;
    h.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); step(e.key === 'ArrowUp' ? 1 : -1); }
    });
    h.addEventListener('pointerdown', e => {
      if (!narrow.matches) return;
      h.setPointerCapture(e.pointerId);
      drag = { id: e.pointerId, y: e.clientY, moved: false, heights: this._measure() };
      drag.h0 = drag.heights[this.state];
    });
    h.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dy) < 8) return;
      drag.moved = true;
      const { closed, full } = drag.heights;
      this.root.classList.add('sheet-dragging');
      this.root.style.height = `${Math.max(closed, Math.min(full, drag.h0 - dy))}px`;
    });
    const end = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (!d.moved) return; // ett tryck hanteras av click
      const now = this.root.getBoundingClientRect().height;
      this.root.classList.remove('sheet-dragging');
      this.root.style.height = '';
      this._dragged = true; // klicket som följer på ett drag ska inte också stega
      this.set(STATES.reduce((a, b) => Math.abs(d.heights[b] - now) < Math.abs(d.heights[a] - now) ? b : a));
    };
    h.addEventListener('pointerup', end);
    h.addEventListener('pointercancel', end);
    h.addEventListener('click', () => {
      if (this._dragged) { this._dragged = false; return; }
      this.set(STATES[(STATES.indexOf(this.state) + 1) % 3]);
    });
  }

  /** Rutans höjd i de tre lägena, mätt utan att något ritas (läget byts och återställs i samma steg). */
  _measure() {
    const ds = this.root.dataset, cur = ds.sheet, out = {};
    for (const s of STATES) { ds.sheet = s; out[s] = this.root.getBoundingClientRect().height; }
    ds.sheet = cur;
    return out;
  }
}
