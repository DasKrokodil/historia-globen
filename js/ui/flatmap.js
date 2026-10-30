// Platt vy (#292): världen som en platt karta för skärmar, med zoom och panorering.
// Kartan är samma ekvirektangulära bilder som läggs på klotet (beslut 1): grundkartan (baseCanvas)
// och lagren (overlayCanvas), 4096 × 2048. Här ritas bara den synliga delen av dem, i skärmens
// upplösning (devicePixelRatio), så att kartan blir skarp när man zoomar in. Lagren ritas inte om
// här; de ritas av main.js som förut, och kartan ritas om när året ändras (draw()).
//
// Ytan går från knapparna uppe till tidslinjens knappar nere, i hela bredden. Kartan fyller ytan
// (zoom 1 = ytan täcks, i höga och smala skärmar fylls höjden och man panorerar i sidled). Väst–öst
// går runt vid datumlinjen; nord–syd begränsas så att kartan alltid täcker ytan.

const IMG_W = 4096, IMG_H = 2048;
const MAX_ZOOM = 10;
const STEP = 1.4; // zoom per knapptryck eller tangent

export class FlatMap {
  constructor({ root, box, canvas, zoomIn, zoomOut, reset, sources, onToggle }) {
    Object.assign(this, { root, box, canvas, sources, onToggle });
    this.ctx = canvas.getContext('2d');
    this.zoom = 1;
    this.cx = IMG_W / 2; this.cy = IMG_H / 2; // kartans mitt i bildens koordinater
    this.w = 0; this.h = 0; this.dpr = 1;
    this._raf = 0;
    this._pointers = new Map();

    zoomIn.addEventListener('click', () => this.zoomBy(STEP));
    zoomOut.addEventListener('click', () => this.zoomBy(1 / STEP));
    reset.addEventListener('click', () => { this.zoom = 1; this.cx = IMG_W / 2; this.cy = IMG_H / 2; this.draw(); });

    // Mushjul: zooma kring muspekaren
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const f = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0018));
      this.zoomBy(f, this._local(e));
    }, { passive: false });

    // Dra för att panorera, nyp med två fingrar för att zooma (pointer events)
    canvas.addEventListener('pointerdown', e => {
      canvas.setPointerCapture(e.pointerId);
      this._pointers.set(e.pointerId, this._local(e));
      canvas.classList.add('dragging');
    });
    canvas.addEventListener('pointermove', e => {
      const prev = this._pointers.get(e.pointerId);
      if (!prev) return;
      const pts = [...this._pointers.values()];
      const now = this._local(e);
      if (pts.length >= 2) {
        // Nyp: avståndet mellan fingrarna ger zoomen, mittpunkten flyttar kartan
        const other = [...this._pointers.entries()].find(([id]) => id !== e.pointerId)[1];
        const d0 = Math.hypot(prev.x - other.x, prev.y - other.y), d1 = Math.hypot(now.x - other.x, now.y - other.y);
        const m0 = { x: (prev.x + other.x) / 2, y: (prev.y + other.y) / 2 };
        const m1 = { x: (now.x + other.x) / 2, y: (now.y + other.y) / 2 };
        this._pan(m1.x - m0.x, m1.y - m0.y);
        if (d0 > 0) this.zoomBy(d1 / d0, m1, false);
      } else {
        this._pan(now.x - prev.x, now.y - prev.y);
      }
      this._pointers.set(e.pointerId, now);
      this.draw();
    });
    const up = e => {
      this._pointers.delete(e.pointerId);
      if (!this._pointers.size) canvas.classList.remove('dragging');
    };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);

    // Tangentbord när kartan har fokus: pilar panorerar, + och − zoomar, 0 återställer
    canvas.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const p = (e.shiftKey ? 0.3 : 0.12);
      let handled = true;
      if (e.key === 'ArrowLeft') this._pan(this.w * p, 0);
      else if (e.key === 'ArrowRight') this._pan(-this.w * p, 0);
      else if (e.key === 'ArrowUp') this._pan(0, this.h * p);
      else if (e.key === 'ArrowDown') this._pan(0, -this.h * p);
      else if (e.key === '+' || e.key === '=') this.zoomBy(STEP);
      else if (e.key === '-' || e.key === '_') this.zoomBy(1 / STEP);
      else if (e.key === '0') reset.click();
      else handled = false;
      if (!handled) return;
      e.preventDefault();
      this.draw();
    });

    // Ytan mäts om när fönstret, knapparna uppe eller tidslinjen ändrar storlek
    const ro = new ResizeObserver(() => { if (!this.hidden) this._layout(); });
    for (const sel of ['#app', '.top-actions', '.timebar']) ro.observe(document.querySelector(sel));
  }

  get hidden() { return this.root.hidden; }

  /** Öppna eller stäng Platt vy. */
  setOpen(open) {
    if (open === !this.hidden) return;
    this.root.hidden = !open;
    if (open) this._layout();
    this.onToggle?.(open);
  }

  /** Mät ytan mellan knapparna uppe och tidslinjens knappar nere. Pausraden och fokusraden ligger
   *  ovanpå kartan, så att kartan inte hoppar när de visas. */
  _layout() {
    const top = document.querySelector('.top-actions').getBoundingClientRect().bottom + 8;
    const bottom = document.querySelector('.timebar .controls').getBoundingClientRect().top - 8;
    this.box.style.top = `${Math.round(top)}px`;
    this.box.style.height = `${Math.max(120, Math.round(bottom - top))}px`;
    const r = this.box.getBoundingClientRect();
    this.dpr = Math.min(3, window.devicePixelRatio || 1);
    this.w = r.width; this.h = r.height;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.draw();
  }

  /** Skärmpixlar per bildpixel. Zoom 1 täcker ytan. */
  get scale() { return Math.max(this.w / IMG_W, this.h / IMG_H) * this.zoom; }

  _local(e) { const r = this.canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  _pan(dx, dy) {
    const s = this.scale;
    this.cx -= dx / s; this.cy -= dy / s;
    this._clamp();
  }

  /** Zooma med faktorn f kring punkten at (i kartans skärmkoordinater, standard mitten). */
  zoomBy(f, at = { x: this.w / 2, y: this.h / 2 }, redraw = true) {
    const s0 = this.scale;
    const z = Math.min(MAX_ZOOM, Math.max(1, this.zoom * f));
    if (z === this.zoom) return;
    // Punkten under at ska ligga kvar under at
    const ix = this.cx + (at.x - this.w / 2) / s0, iy = this.cy + (at.y - this.h / 2) / s0;
    this.zoom = z;
    const s1 = this.scale;
    this.cx = ix - (at.x - this.w / 2) / s1; this.cy = iy - (at.y - this.h / 2) / s1;
    this._clamp();
    if (redraw) this.draw();
  }

  _clamp() {
    const s = this.scale, vh = this.h / s;
    this.cx = ((this.cx % IMG_W) + IMG_W) % IMG_W; // väst–öst går runt
    this.cy = vh >= IMG_H ? IMG_H / 2 : Math.min(IMG_H - vh / 2, Math.max(vh / 2, this.cy));
  }

  /** Rita om kartan (vid nästa bildruta). Anropas när året eller lagren ändras. */
  draw() {
    if (this.hidden || this._raf) return;
    this._raf = requestAnimationFrame(() => { this._raf = 0; this._render(); });
  }

  _render() {
    const { ctx, canvas } = this;
    const S = this.scale * this.dpr; // enhetspixlar per bildpixel
    const cw = canvas.width, ch = canvas.height;
    const x0 = this.cx - cw / 2 / S, y0 = this.cy - ch / 2 / S;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const sy0 = Math.max(0, y0), sy1 = Math.min(IMG_H, y0 + ch / S);
    const dy0 = Math.round((sy0 - y0) * S), dy1 = Math.round((sy1 - y0) * S);
    // En kopia av bilden per varv runt jorden som syns (oftast en eller två)
    for (let k = Math.floor(x0 / IMG_W); k * IMG_W < x0 + cw / S; k++) {
      const sx0 = Math.max(0, x0 - k * IMG_W), sx1 = Math.min(IMG_W, x0 + cw / S - k * IMG_W);
      if (sx1 <= sx0) continue;
      const dx0 = Math.round((k * IMG_W + sx0 - x0) * S), dx1 = Math.round((k * IMG_W + sx1 - x0) * S);
      for (const src of this.sources()) ctx.drawImage(src, sx0, sy0, sx1 - sx0, sy1 - sy0, dx0, dy0, dx1 - dx0, dy1 - dy0);
    }
  }
}
