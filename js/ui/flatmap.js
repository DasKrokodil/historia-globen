// Platt vy (#292): världen som en platt karta för skärmar, med zoom och panorering.
// Kartan är samma ekvirektangulära bilder som läggs på klotet (beslut 1): grundkartan (baseCanvas)
// och lagren (overlayCanvas), 4096 × 2048. Här ritas bara den synliga delen av dem, i skärmens
// upplösning (devicePixelRatio), så att kartan blir skarp när man zoomar in. Lagren ritas inte om
// här; de ritas av main.js som förut, och kartan ritas om när året ändras (draw()).
//
// Ytan går från knapparna uppe till tidslinjens knappar nere, i hela bredden. Kartan fyller ytan
// (zoom 1 = ytan täcks, i höga och smala skärmar fylls höjden och man panorerar i sidled). Väst–öst
// går runt vid datumlinjen; nord–syd begränsas så att kartan alltid täcker ytan.
//
// Markörerna (#313): händelsernas medaljer, klungor, etiketter och Samtidigt-kortets bågar ligger som ett
// lager ovanpå kartan, som 3D-objekten på klotet; baseCanvas och overlayCanvas ändras inte (beslut 1).
// Medaljerna är samma bilder som på klotet (medalTexture i layers/events.js) och ritas på kartans canvas
// i skärmens upplösning; klungorna och etiketterna är knappar (samma .gcluster och .glabel som på globen).
// Allt ritas bara om när något ändras: året, lagren, zoom, panorering, hovring eller bågarna.
import { medalTexture, medalSize, glyph } from '../layers/events.js';
import { cluster, clusterContents, placeLabels, dotBox } from './clusters.js';
import { empireBlocks } from './zoomlevels.js';
import { CAT, t } from '../model.js';

const IMG_W = 4096, IMG_H = 2048;
const MAX_ZOOM = 10;
const STEP = 1.4; // zoom per knapptryck eller tangent
const WORLD = IMG_W / (2 * Math.PI); // bildpixlar per klotradie: markörernas storlek följer samma mått som på klotet
const CLICK_PX = 6; // längre rörelse än så räknas som att dra, inte klicka

export class FlatMap {
  constructor({ root, box, canvas, labels, zoomIn, zoomOut, reset, sources, onToggle, onSelect, labelText, fillLabel }) {
    Object.assign(this, { root, box, canvas, labels, sources, onToggle, onSelect, labelText, fillLabel });
    this.ctx = canvas.getContext('2d');
    this.zoom = 1;
    this.cx = IMG_W / 2; this.cy = IMG_H / 2; // kartans mitt i bildens koordinater
    this.w = 0; this.h = 0; this.dpr = 1;
    this._raf = 0;
    this._pointers = new Map();
    this._marks = { list: [], selectedId: null }; // händelserna som syns, från setMarkers()
    this._arcs = [];     // Samtidigt-kortets bågar, [[lat, lon], [lat, lon]]
    this._hits = [];     // medaljerna på skärmen senast det ritades, för klick och hovring
    this.hoverId = null;
    this._labelPool = new Map();
    this._clusterPool = [];
    this._waitGlyph = new Set();
    this.obstacles = []; // rikesnamn och medaljer på kartbilden (AreasLayer.placedBoxes, #358): etiketterna hamnar inte på dem

    zoomIn.addEventListener('click', () => this.zoomBy(STEP));
    zoomOut.addEventListener('click', () => this.zoomBy(1 / STEP));
    reset.addEventListener('click', () => { this.zoom = 1; this.cx = IMG_W / 2; this.cy = IMG_H / 2; this.draw(); this.onZoom?.(); });
    this.onZoom = null; // anropas när zoomen eller ytans storlek ändras: rikesnamnen beror på zoomnivån (#358, ui/zoomlevels.js)

    // Mushjul: zooma kring muspekaren
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const f = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0018));
      this.zoomBy(f, this._local(e));
    }, { passive: false });

    // Dra för att panorera, nyp med två fingrar för att zooma (pointer events)
    canvas.addEventListener('pointerdown', e => {
      canvas.setPointerCapture(e.pointerId);
      const at = this._local(e);
      this._pointers.set(e.pointerId, at);
      // Ett klick är en tryckning med ett finger eller musen som inte flyttas mer än CLICK_PX
      this._down = this._pointers.size === 1 ? { moved: 0 } : null;
      canvas.classList.add('dragging');
    });
    canvas.addEventListener('pointermove', e => {
      const prev = this._pointers.get(e.pointerId);
      if (!prev) { this._hover(e); return; }
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
        if (this._down) this._down.moved += Math.abs(now.x - prev.x) + Math.abs(now.y - prev.y);
        this._pan(now.x - prev.x, now.y - prev.y);
      }
      this._pointers.set(e.pointerId, now);
      this.draw();
    });
    const up = e => {
      if (!this._pointers.has(e.pointerId)) return;
      this._pointers.delete(e.pointerId);
      if (!this._pointers.size) canvas.classList.remove('dragging');
      // Klick på en medalj öppnar faktarutan, som på globen
      const d = this._down; this._down = null;
      if (e.type === 'pointerup' && d && d.moved < CLICK_PX && !this._pointers.size) {
        const at = this._local(e), hit = this._hitTest(at, e.pointerType);
        if (hit) this.onSelect?.(hit.id);
        // Annars: platsen som klickades, till exempel för vägar och resor på lagerbilden (#38)
        else this.onMapClick?.(this._lonLat(at), e.clientX, e.clientY);
      }
    };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('pointerleave', () => this._setHover(null));

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

  /**
   * Händelserna som syns (anropas av refresh() i main.js efter EventsLayer.update): list är markörernas
   * userData ({ event, color, info, big, activity }), labeled de händelser som får klustras och etikett
   * (samma urval som listan Samtidigt), keep de som aldrig klustras (Samtidigt-kortets händelser).
   */
  setMarkers({ list, labeled, keep, selectedId }) {
    this._marks = { list, labeled, keep, selectedId };
    this.draw();
  }

  /** Samtidigt-kortets bågar (ff.onArcs), samma par som globe.setArcs. */
  setArcs(pairs) {
    this._arcs = pairs;
    this.draw();
  }

  /** Flytta kartan så att platsen syns, om den ligger utanför ytan (när en händelse väljs). */
  reveal(lat, lon) {
    if (this.hidden) return;
    const p = this._toScreen(lat, lon), m = 40;
    if (p.x >= m && p.x <= this.w - m && p.y >= m && p.y <= this.h - m) return;
    this.cx = (lon + 180) / 360 * IMG_W; this.cy = (90 - lat) / 180 * IMG_H;
    this._clamp();
    this.draw();
  }

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
    this.onZoom?.();
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
    this.onZoom?.();
  }

  _clamp() {
    const s = this.scale, vh = this.h / s;
    this.cx = ((this.cx % IMG_W) + IMG_W) % IMG_W; // väst–öst går runt
    this.cy = vh >= IMG_H ? IMG_H / 2 : Math.min(IMG_H - vh / 2, Math.max(vh / 2, this.cy));
  }

  /** Skärmposition (CSS-pixlar i kartans ruta) för en plats. Väst–öst: den kopia av jorden som ligger
   *  på ytan (med marginalen margin), annars den närmast till höger om ytans vänsterkant. */
  _toScreen(lat, lon, margin = 0) {
    const s = this.scale;
    const x0 = this.cx - this.w / 2 / s, y0 = this.cy - this.h / 2 / s;
    let x = (((lon + 180) / 360 * IMG_W - x0) % IMG_W + IMG_W) % IMG_W * s;
    if (x > this.w + margin && x - IMG_W * s > -margin) x -= IMG_W * s;
    return { x, y: ((90 - lat) / 180 * IMG_H - y0) * s };
  }

  /** Platsen { lon, lat } under en punkt i kartans skärmkoordinater (omvändningen av _toScreen). */
  _lonLat(at) {
    const s = this.scale;
    const ix = this.cx + (at.x - this.w / 2) / s, iy = this.cy + (at.y - this.h / 2) / s;
    const lon = ((ix / IMG_W * 360) % 360 + 360) % 360 - 180;
    return { lon, lat: 90 - iy / IMG_H * 180 };
  }

  /** Medaljen under en punkt, de viktigaste först. Med finger räcker det att träffa nära (44 px tryckyta). */
  _hitTest(at, pointerType = 'mouse') {
    const touch = pointerType !== 'mouse';
    let best = null, bestD = Infinity;
    for (const h of this._hits) {
      const d = Math.hypot(h.x - at.x, h.y - at.y);
      if (d <= (touch ? Math.max(22, h.r + 8) : h.r) && d < bestD - 0.5) { best = h; bestD = d; }
    }
    return best;
  }

  _hover(e) {
    if (e.pointerType !== 'mouse' || e.buttons) return;
    this._setHover(this._hitTest(this._local(e))?.id ?? null);
  }

  _setHover(id) {
    this.canvas.classList.toggle('on-marker', !!id);
    if (id === this.hoverId) return;
    this.hoverId = id;
    this.draw(); // markören under musen får alltid sin etikett
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
    // Markörerna ritas ovanpå, i CSS-pixlar (lagret ovanpå kartan, #313)
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this._renderArcs(ctx);
    this._renderMarkers(ctx);
  }

  /** Samtidigt-kortets bågar: en böjd linje mellan platserna, den kortaste vägen runt jorden. */
  _renderArcs(ctx) {
    if (!this._arcs.length) return;
    const s = this.scale;
    ctx.save();
    ctx.lineCap = 'round';
    for (const [[la, lo], [lb, lob]] of this._arcs) {
      let dLon = lob - lo;
      if (dLon > 180) dLon -= 360; else if (dLon < -180) dLon += 360;
      const a = this._toScreen(la, lo, this.w);
      const b = { x: a.x + dLon / 360 * IMG_W * s, y: a.y + (la - lb) / 180 * IMG_H * s };
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      // Mitten lyfts mot norr, som bågarna som reser sig över klotet
      const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - Math.min(140, len * 0.22) };
      // Bågen ritas en jord till vänster och höger också, om den hamnar på ytan där
      for (const k of [-1, 0, 1]) {
        const ox = k * IMG_W * s;
        if (Math.max(a.x, b.x) + ox < 0 || Math.min(a.x, b.x) + ox > this.w) continue;
        for (const [w, style] of [[4, rgba(cssVar('--night'), 0.55)], [1.6, rgba(cssVar('--parchment'), 0.9)]]) {
          ctx.lineWidth = w; ctx.strokeStyle = style;
          ctx.beginPath(); ctx.moveTo(a.x + ox, a.y); ctx.quadraticCurveTo(c.x + ox, c.y, b.x + ox, b.y); ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  /** Medaljer, klungor och etiketter (#313), samma urval och regler som på globen (globe.onFrame i main.js). */
  _renderMarkers(ctx) {
    const { list, labeled, keep, selectedId } = this._marks;
    const s = this.scale, hl = keep ?? new Set();
    const hoverId = this.hoverId;
    // Viktigast först: vald, under musen, i Samtidigt-kortet, mest aktuell
    const order = list.filter(u => u.activity > 0).sort((a, b) =>
      ((b.event.id === selectedId) - (a.event.id === selectedId)) || ((b.event.id === hoverId) - (a.event.id === hoverId)) ||
      (hl.has(b.event.id) - hl.has(a.event.id)) || (b.activity - a.activity));
    const M = 30; // markörer strax utanför kanten ritas också (de syns till hälften)
    const items = [];
    for (const u of order) {
      const e = u.event, p = this._toScreen(e._lat, e._lon, M);
      if (p.x < -M || p.x > this.w + M || p.y < -M || p.y > this.h + M) continue;
      // Samma storlek som på klotet: baseScale (klotradier) gånger bildpixlar per klotradie gånger zoomen
      const { px, full } = medalSize(u, u.baseScale * WORLD * s);
      // Vald händelse, Samtidigt-kortets händelser och de som inte står i listan klustras aldrig
      items.push({ e, u, p, px, full, keep: e.id === selectedId || hl.has(e.id) || !labeled?.has(e.id) });
    }
    // Klustra händelser som ligger nära varandra på skärmen (#26), som på globen
    const { singles, clusters } = cluster(items);
    this._hits = [];
    for (let i = singles.length - 1; i >= 0; i--) { // de viktigaste ritas sist, alltså överst
      const { e, u, p, px, full } = singles[i];
      const tex = medalTexture(e.icon, u.color, u.info, full);
      if (e.icon && !glyph(e.icon).ready && !this._waitGlyph.has(e.icon)) {
        // Symbolen ritas in i medaljen när den har laddats, och då ritas kartan om
        this._waitGlyph.add(e.icon);
        glyph(e.icon).waiting.push(() => this.draw());
      }
      ctx.globalAlpha = 0.45 + 0.55 * u.activity;
      if (e.id === selectedId) { // vald händelse: en mässingsring runt medaljen (på klotet pulserar den)
        ctx.lineWidth = 2; ctx.strokeStyle = cssVar('--brass');
        ctx.beginPath(); ctx.arc(p.x, p.y, px / 2 + 3, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.drawImage(tex.image, p.x - px / 2, p.y - px / 2, px, px);
      this._hits.unshift({ id: e.id, x: p.x, y: p.y, r: px / 2 });
    }
    ctx.globalAlpha = 1;

    // Klungorna: samma knapp som på globen (#243); klick zoomar in kartan mot klungan så att den delas upp
    clusters.forEach((c, i) => {
      let el = this._clusterPool[i];
      if (!el) {
        el = document.createElement('button');
        el.type = 'button'; el.className = 'gcluster';
        el.addEventListener('click', () => this.zoomBy(2, { x: el._x, y: el._y }));
        this.labels.append(el); this._clusterPool[i] = el;
      }
      const key = c.members.map(m => m.e.id).join();
      if (el._key !== key) {
        el._key = key;
        const { text, ring } = clusterContents(c.members, CAT, t);
        el.textContent = String(c.members.length);
        el.style.setProperty('--ring', ring);
        el.setAttribute('aria-label', `${c.members.length} händelser nära varandra: ${text}. Zooma in.`);
        el.dataset.contents = text; // syns under klungan vid hovring och fokus (CSS)
        el.title = `${c.members.slice(0, 8).map(m => t(m.e.title)).join(', ')}${c.members.length > 8 ? ' …' : ''}`;
      }
      el._x = c.x; el._y = c.y;
      el.style.transform = `translate(${c.x}px, ${c.y}px) translate(-50%, -50%)`;
      el.hidden = false;
    });
    for (let i = clusters.length; i < this._clusterPool.length; i++) this._clusterPool[i].hidden = true;

    // Etiketter för de viktigaste händelserna, utan överlapp (samma regel som på globen, placeLabels)
    const pxOf = new Map(items.map(it => [it.e.id, it.px]));
    const markers = singles.map(it => ({ id: it.e.id, box: dotBox(it.p.x, it.p.y, Math.max(9, it.px / 2)) }));
    const badges = clusters.map(c => dotBox(c.x, c.y, 16));
    const named = singles.filter(it => labeled?.has(it.e.id));
    const seen = new Set();
    const blocked = empireBlocks(this.obstacles, (lat, lon) => this._toScreen(lat, lon, this.w), 2 * s);
    const placed = placeLabels(named, { W: this.w, H: this.h, hoverId, markers, badges, blocked, text: this.labelText, pxOf: e => pxOf.get(e.id) });
    for (const { e, text, x, y } of placed) {
      let el = this._labelPool.get(e.id);
      if (!el) {
        el = document.createElement('button');
        el.type = 'button'; el.className = 'glabel';
        el.addEventListener('click', () => this.onSelect?.(e.id));
        this.labels.append(el); this._labelPool.set(e.id, el);
      }
      this.fillLabel(el, e, text);
      el.classList.toggle('glabel-hover', e.id === hoverId);
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
      el.hidden = false;
      seen.add(e.id);
    }
    for (const [id, el] of this._labelPool) if (!seen.has(id)) el.hidden = true;
  }
}

// Färgerna hämtas ur CSS-variablerna i :root (en gång per namn)
const cssCache = new Map();
function cssVar(name) {
  if (!cssCache.has(name)) cssCache.set(name, getComputedStyle(document.documentElement).getPropertyValue(name).trim());
  return cssCache.get(name);
}
function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
