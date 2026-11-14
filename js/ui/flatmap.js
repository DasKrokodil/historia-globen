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
//
// Regionvyn (#1641): en liten plats (Skåne, Danmark; js/region-frame.js) ramas in mycket närmare än zoom 10. Där räcker
// 4096-bilden inte (den blir suddig och lagrens mått, som räknas i bildpunkter, blir grova), så kartan ritas skarpt för det
// som syns: grundkartan med den finare kusten (`base`, samma paintBase som globens utsnitt) och de lager som räknar i
// skärmpixlar (`setRegionLayers`, registry.draw med view.region). Bilden är fortfarande ekvirektangulär (beslut 1), men en
// grad i öst–väst ritas cos(mittbredden) gånger så bred (`kx`), så att platsen får sin form på marken. Den skarpa bilden
// ritas om när vyn har stått still en stund (SHARP_DELAY); under tiden flyttas och skalas den förra.
import { regionFrame } from '../region-frame.js';
import { medalTexture, medalSize, glyph } from '../layers/events.js';
import { cluster, clusterContents, placeLabels, dotBox } from './clusters.js';
import { empireBlocks } from './zoomlevels.js';
import { CAT, t } from '../model.js';
import { ui } from '../i18n.js';

const IMG_W = 4096, IMG_H = 2048;
const MAX_ZOOM = 10;
const STEP = 1.4; // zoom per knapptryck eller tangent
const WORLD = IMG_W / (2 * Math.PI); // bildpixlar per klotradie: markörernas storlek följer samma mått som på klotet
const CLICK_PX = 6; // längre rörelse än så räknas som att dra, inte klicka
const SHARP_DELAY = 120; // ms efter sista rörelsen innan regionvyns skarpa karta ritas om (#1641)
// Hur långt man kan zooma ut och in i regionvyn, räknat från ramen. Längre in stämmer varken kantlinjen (platsens gräns i datan)
// eller 1:10m-kusten med varandra
const REGION_ZOOM_OUT = 2.5, REGION_ZOOM_IN = 3;

export class FlatMap {
  constructor({ root, box, canvas, labels, zoomIn, zoomOut, reset, sources, base, onToggle, onSelect, labelText, fillLabel }) {
    Object.assign(this, { root, box, canvas, labels, sources, base, onToggle, onSelect, labelText, fillLabel });
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
    this.kx = 1;          // öst–västskalan: 1 utom i regionvyn, där den är cos(mittbredden) (#1641)
    this._region = null;  // regionvyn: { id, bounds, free, fitScale, moved } (#1641); moved: man har panorerat eller zoomat själv
    this._regionLayers = null; // (ctx, W, H, drawFaded, unit) ritar lagren i regionvyns skarpa karta
    this._sharp = null;   // regionvyns skarpa karta som den senast ritades: { canvas, X0, Y0, sx, sy, w, h, dpr, dirty }
    this._sharpTimer = 0;
    this.onRegion = null; // (id eller null, förra id, { quiet }) när regionvyn börjar eller slutar (controllers/region.js)
    this.onRegionReset = null; // Återställ i regionvyn: ramen är tillbaka (controllers/region.js säger det på statusraden)
    this._paints = 0;     // hur många gånger regionvyns skarpa karta har ritats (renderingsstatus för webbläsartestet)

    zoomIn.addEventListener('click', () => this.zoomBy(STEP));
    zoomOut.addEventListener('click', () => this.zoomBy(1 / STEP));
    // Återställ: hela världen, men i regionvyn tillbaka till platsens ram (#1641); regionvyn lämnas bara med sina egna utgångar
    reset.addEventListener('click', () => {
      if (this._region) { this.fitRegion(); this.onRegionReset?.(); return; }
      this.zoom = 1; this.cx = IMG_W / 2; this.cy = IMG_H / 2; this.draw(); this.onZoom?.();
    });
    this.onZoom = null; // anropas när zoomen eller ytans storlek ändras: rikesnamnen beror på zoomnivån (#358, ui/zoomlevels.js)

    // Mushjul: zooma kring muspekaren
    // Styrplattans nypning kommer som wheel med ctrlKey (Chrome, Edge, Firefox) och får en större faktor.
    // Etiketterna tar emot samma händelse, annars zoomas hela sidan när pekaren står på en etikett.
    const onWheel = e => {
      e.preventDefault();
      const k = e.ctrlKey ? 0.01 : (e.deltaMode === 1 ? 0.05 : 0.0018);
      this.zoomBy(Math.exp(-e.deltaY * k), this._local(e));
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    labels.addEventListener('wheel', onWheel, { passive: false });

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
    canvas.addEventListener('pointerleave', () => { this._setHover(null); canvas.classList.remove('on-place'); });

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
      else if (e.key === 'Enter' && this.onActivate) { this.onActivate(); } // tangentbordets tryck på platsen i mitten (#1161)
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
    // Renderingsstatus: samma urval som faktiskt ritas, även när en medalj blir en klunga eller saknar etikett vid låg zoom.
    this.root.dataset.visibleEvents = list.filter(u => u.activity > 0).map(u => u.event.id).join(' ');
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

  /** Kartans mitt och zoom, till exempel ett steg i en guidad tur (#47). Globens zoom (0.8–3.2) används som den är,
   *  inom kartans gränser. Sparas också när Platt vy är stängd, så att kartan öppnas där. */
  setView(lat, lon, zoom = 1) {
    this.leaveRegion(); // en tur eller en adress ställer kartan: regionvyn lämnas
    this.cx = (lon + 180) / 360 * IMG_W; this.cy = (90 - lat) / 180 * IMG_H;
    this.zoom = Math.min(MAX_ZOOM, Math.max(1, zoom));
    if (this.hidden || !this.w) return;
    this._clamp();
    this.draw();
    this.onZoom?.();
  }

  /** Öppna eller stäng Platt vy. */
  setOpen(open) {
    if (open === !this.hidden) return;
    if (!open) this.leaveRegion(); // regionvyn hör till Platt vy (#1641)
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
    const keep = this._region && this.w ? this.scale : 0; // regionvyns skala före, för en karta man har flyttat själv
    this.dpr = Math.min(3, window.devicePixelRatio || 1);
    this.w = r.width; this.h = r.height;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    // Regionvyn (#1641): ramas in igen i den nya ytan, men har man panorerat eller zoomat själv står kartan kvar i samma skala
    // (i mobil ändras ytan när adressfältet fälls ihop, och det får inte ta bort det man har gjort)
    if (this._region && !this._region.moved) this.fitRegion();
    else if (keep) this.zoom = keep / this._base();
    this._clamp(); // en mitt som sattes medan kartan var stängd (setView) hamnar inom ytan
    this.draw();
    this.onZoom?.();
  }

  /** Skärmpixlar per bildpixel vid zoom 1, då kartan täcker ytan. */
  _base() { return Math.max(this.w / IMG_W, this.h / IMG_H); }
  /** Skärmpixlar per bildpixel (i nord–syd). Zoom 1 täcker ytan. */
  get scale() { return this._base() * this.zoom; }
  /** Skärmpixlar per bildpixel i öst–väst: samma som scale utom i regionvyn (#1641). */
  get sx() { return this.scale * this.kx; }

  /** Markörens storlek på skärmen i Platt vy (px), som när den ritas (#616: huvudstädernas namn viker för den). */
  markerPx(u) { return medalSize(u, u.baseScale * WORLD * this.scale).px; }

  _local(e) { const r = this.canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  _pan(dx, dy) {
    if (this._region) this._region.moved = true;
    this.cx -= dx / this.sx; this.cy -= dy / this.scale;
    this._clamp();
  }

  /** Zoomens gränser: hela världen till zoom 10, i regionvyn runt ramen (#1641). */
  _zoomLimits() {
    const r = this._region;
    return r ? [r.fitScale / REGION_ZOOM_OUT / this._base(), r.fitScale * REGION_ZOOM_IN / this._base()] : [1, MAX_ZOOM];
  }

  /** Zooma med faktorn f kring punkten at (i kartans skärmkoordinater, standard mitten). */
  zoomBy(f, at = { x: this.w / 2, y: this.h / 2 }, redraw = true) {
    const [lo, hi] = this._zoomLimits();
    const z = Math.min(hi, Math.max(lo, this.zoom * f));
    if (z === this.zoom) return;
    if (this._region) this._region.moved = true;
    // Punkten under at ska ligga kvar under at
    const ix = this.cx + (at.x - this.w / 2) / this.sx, iy = this.cy + (at.y - this.h / 2) / this.scale;
    this.zoom = z;
    this.cx = ix - (at.x - this.w / 2) / this.sx; this.cy = iy - (at.y - this.h / 2) / this.scale;
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
    const s = this.scale, sx = this.sx;
    const x0 = this.cx - this.w / 2 / sx, y0 = this.cy - this.h / 2 / s;
    let x = (((lon + 180) / 360 * IMG_W - x0) % IMG_W + IMG_W) % IMG_W * sx;
    if (x > this.w + margin && x - IMG_W * sx > -margin) x -= IMG_W * sx;
    return { x, y: ((90 - lat) / 180 * IMG_H - y0) * s };
  }

  /** Platsen { lon, lat } i kartans mitt, för tangentbordets tryck och uppläsning (#1161). */
  centre() { return this._lonLat({ x: this.w / 2, y: this.h / 2 }); }

  /**
   * Rama in en ruta { west, east, south, north } (longituder uppvikta kring mitten, som place-geo.js ger) med lite luft runt
   * (#1161). Zoomen väljs så att hela rutan ryms, inom kartans gränser. Anropas när kartan är öppen och har mått.
   */
  frame({ west, east, south, north }, fill = 0.78, padRight = 0) {
    if (!this.w || !this.h) return;
    this.leaveRegion();
    const base = Math.max(this.w / IMG_W, this.h / IMG_H), wide = Math.max((east - west) / 360 * IMG_W, 1), high = Math.max((north - south) / 180 * IMG_H, 1);
    const free = Math.max(this.w * 0.3, this.w - padRight); // ytan som inte täcks av ett kort till höger
    const zoom = Math.min(MAX_ZOOM, Math.max(1, Math.min(free * fill / wide, this.h * fill / high) / base));
    // Rutans mitt hamnar mitt i den fria ytan: kartans mitt flyttas åt öster (padRight / 2 skärmpixlar)
    const shift = (this.w - free) / 2 / (base * zoom) / IMG_W * 360;
    this.setView((north + south) / 2, (east + west) / 2 + shift, zoom);
  }

  // ---- regionvyn (#1641) -------------------------------------------------------------------------------------------
  /** Platsen som regionvyn visar (id), eller null. */
  get region() { return this._region?.id ?? null; }

  /** Lagren i regionvyns skarpa karta: (ctx, W, H, drawFaded, unit), unit = bildpunkter per skärmpixel (render.js). */
  setRegionLayers(fn) { this._regionLayers = fn; }

  /** Lagren eller grundkartan har ändrats (nytt år, nya val, finare kust): regionvyns skarpa karta ritas om när det blir stilla. */
  regionLayersChanged() {
    if (!this._region || !this._sharp) return;
    this._sharp.dirty = true;
    this._scheduleSharp();
  }

  /**
   * Börja regionvyn för platsen id med gränsrutan bounds (placeBounds). free() ger den fria delen av kartans yta
   * ({ x, y, w, h } i kartans pixlar, region-frame.js freeArea): där hamnar platsen och fyller cirka 65 % av den.
   */
  enterRegion(id, bounds, free) {
    if (!this.w || !this.h) return;
    this._region = { id, bounds, free, fitScale: 0, moved: false };
    this._sharp = null;
    this.fitRegion();
    this.root.dataset.region = id;
    this.onRegion?.(id);
  }

  /** Har man panorerat eller zoomat själv sedan regionvyn ramade in platsen? Då ramas den inte in igen av sig själv. */
  get regionMoved() { return !!this._region?.moved; }

  /** Den fria ytan som ramen räknas i ({ x, y, w, h }), eller null utanför regionvyn. */
  regionFree() {
    const r = this._region;
    return r ? (r.free?.() ?? { x: 0, y: 0, w: this.w, h: this.h }) : null;
  }

  /** Rama in regionvyns plats igen (arket i mobil har fällts ihop, ytan har ändrat storlek, Återställ). */
  fitRegion() {
    const r = this._region;
    if (!r || !this.w || !this.h) return;
    const view = { w: this.w, h: this.h };
    const f = regionFrame(r.bounds, view, r.free?.() ?? { x: 0, y: 0, ...view });
    this.kx = f.kx;
    r.fitScale = f.ppd / (IMG_H / 180); // skärmpixlar per grad → skärmpixlar per bildpixel
    r.moved = false;
    this.zoom = r.fitScale / this._base();
    this.cx = (f.lon + 180) / 360 * IMG_W; this.cy = (90 - f.lat) / 180 * IMG_H;
    this._clamp();
    this.draw();
    this.onZoom?.();
  }

  /**
   * Lämna regionvyn: kartan blir som vanligt (zoom högst 10, lika skala åt alla håll). onRegion får veta det; quiet: inget
   * besked på statusraden (kartan ställs om av något annat, till exempel en tur eller Återställ).
   */
  leaveRegion({ quiet = true } = {}) {
    if (!this._region) return;
    const id = this._region.id;
    this._region = null;
    this.kx = 1;
    this.zoom = Math.min(MAX_ZOOM, Math.max(1, this.zoom));
    clearTimeout(this._sharpTimer); this._sharpTimer = 0;
    this._sharp = null;
    for (const key of ['region', 'regionBox', 'regionPpd', 'regionSharp', 'regionPaints']) delete this.root.dataset[key];
    this._clamp();
    this.draw();
    this.onZoom?.();
    this.onRegion?.(null, id, { quiet });
  }

  _scheduleSharp() {
    clearTimeout(this._sharpTimer);
    this._sharpTimer = setTimeout(() => this._paintSharp(), SHARP_DELAY);
  }

  /** Ritar regionvyns skarpa karta för vyn just nu: grundkartan och lagren i skärmens upplösning. */
  _paintSharp() {
    this._sharpTimer = 0;
    if (!this._region || this.hidden || !this.w || !this.h) return;
    const dpr = this.dpr, sx = this.sx, sy = this.scale;
    const X0 = this.cx - this.w / 2 / sx, Y0 = this.cy - this.h / 2 / sy;
    const c = this._sharp?.canvas ?? document.createElement('canvas');
    c.width = Math.round(this.w * dpr); c.height = Math.round(this.h * dpr);
    const g = c.getContext('2d');
    // Hela världen i den här skalan, i enhetspixlar: lagren och grundkartan ritar på den, och bara det som syns hamnar på bilden
    const W = IMG_W * sx * dpr, H = IMG_H * sy * dpr, top = -Y0 * sy * dpr;
    const drawFaded = (draw, alpha) => {
      const f = this._fade ??= document.createElement('canvas');
      f.width = c.width; f.height = c.height;
      const fc = f.getContext('2d');
      fc.setTransform(g.getTransform());
      draw(fc, W, H);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = alpha; g.drawImage(f, 0, 0); g.restore();
    };
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, c.width, c.height);
    for (const k of [-1, 0, 1]) { // en kopia av jorden per varv som syns (vid datumlinjen två)
      const left = (k * IMG_W - X0) * sx * dpr;
      if (left >= c.width || left + W <= 0) continue;
      g.save();
      g.setTransform(1, 0, 0, 1, left, top);
      // Linjerna i grundkartan i skärmpixlar, som i globens skarpa utsnitt
      this.base?.(g, W, H, { grid: dpr, equator: 1.4 * dpr, coast: 1.3 * dpr });
      this._regionLayers?.(g, W, H, drawFaded, dpr);
      g.restore();
    }
    this._sharp = { canvas: c, X0, Y0, sx, sy, w: this.w, h: this.h, dpr, dirty: false };
    this.root.dataset.regionSharp = `${c.width}x${c.height}`;
    this.root.dataset.regionPaints = String(++this._paints);
    this.draw();
  }

  /** Regionvyn: den skarpa kartan, flyttad och skalad till vyn om den ritades för en annan; annars ritas den om strax. */
  _renderRegion(ctx) {
    const dpr = this.dpr, sx = this.sx, sy = this.scale;
    const X0 = this.cx - this.w / 2 / sx, Y0 = this.cy - this.h / 2 / sy;
    const r = this._sharp;
    if (r) {
      const dxImg = ((r.X0 - X0 + IMG_W / 2) % IMG_W + IMG_W) % IMG_W - IMG_W / 2; // närmaste varvet
      ctx.drawImage(r.canvas, dxImg * sx * dpr, (r.Y0 - Y0) * sy * dpr, r.canvas.width / r.sx * sx, r.canvas.height / r.sy * sy);
    } else {
      this._blit(ctx, this.sources().slice(0, 1)); // tills den skarpa kartan finns: bara grundkartan, uppförstorad
    }
    const same = r && !r.dirty && r.w === this.w && r.h === this.h && r.dpr === dpr && Math.abs(r.sx / sx - 1) < 1e-6 && Math.abs(r.sy / sy - 1) < 1e-6
      && Math.abs((r.X0 - X0) * sx) < 0.25 && Math.abs((r.Y0 - Y0) * sy) < 0.25;
    if (!same && !this._sharpTimer) this._scheduleSharp();
    // Renderingsstatus för webbläsartestet: platsens ruta på skärmen och skärmpixlar per grad
    const b = this._region.bounds, a = this._toScreen(b.north, b.west, this.w);
    const z = { x: a.x + (b.east - b.west) / 360 * IMG_W * sx, y: this._toScreen(b.south, b.west).y };
    this.root.dataset.regionBox = [a.x, a.y, z.x, z.y].map(v => v.toFixed(1)).join(',');
    this.root.dataset.regionPpd = (sy * IMG_H / 180).toFixed(1);
  }

  /** Platsen { lon, lat } under en punkt i kartans skärmkoordinater (omvändningen av _toScreen). */
  _lonLat(at) {
    const ix = this.cx + (at.x - this.w / 2) / this.sx, iy = this.cy + (at.y - this.h / 2) / this.scale;
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
    const at = this._local(e), hit = this._hitTest(at);
    this._setHover(hit?.id ?? null);
    // Handen över en plats med kort (#1161), när ingen markör ligger under pekaren
    this.canvas.classList.toggle('on-place', !hit && !!this.placeAt?.(this._lonLat(at)));
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
    // Renderingsstatus: kartans mitt och zoom, så att webbläsartestet kan se vad som ramades in (#1161)
    this.root.dataset.view = `${(90 - this.cy / IMG_H * 180).toFixed(2)},${(this.cx / IMG_W * 360 - 180).toFixed(2)},${this.zoom.toFixed(2)}`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (this._region) this._renderRegion(ctx);
    else this._blit(ctx, this.sources());
    // Markörerna ritas ovanpå, i CSS-pixlar (lagret ovanpå kartan, #313)
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this._renderArcs(ctx);
    this._renderMarkers(ctx);
  }

  /** Den synliga delen av 4096-bilderna, uppförstorad till skärmens upplösning (i regionvyn med öst–västskalan kx). */
  _blit(ctx, sources) {
    const Sx = this.sx * this.dpr, Sy = this.scale * this.dpr; // enhetspixlar per bildpixel
    const cw = this.canvas.width, ch = this.canvas.height;
    const x0 = this.cx - cw / 2 / Sx, y0 = this.cy - ch / 2 / Sy;
    const sy0 = Math.max(0, y0), sy1 = Math.min(IMG_H, y0 + ch / Sy);
    const dy0 = Math.round((sy0 - y0) * Sy), dy1 = Math.round((sy1 - y0) * Sy);
    // En kopia av bilden per varv runt jorden som syns (oftast en eller två)
    for (let k = Math.floor(x0 / IMG_W); k * IMG_W < x0 + cw / Sx; k++) {
      const sx0 = Math.max(0, x0 - k * IMG_W), sx1 = Math.min(IMG_W, x0 + cw / Sx - k * IMG_W);
      if (sx1 <= sx0) continue;
      const dx0 = Math.round((k * IMG_W + sx0 - x0) * Sx), dx1 = Math.round((k * IMG_W + sx1 - x0) * Sx);
      for (const src of sources) ctx.drawImage(src, sx0, sy0, sx1 - sx0, sy1 - sy0, dx0, dy0, dx1 - dx0, dy1 - dy0);
    }
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
      const b = { x: a.x + dLon / 360 * IMG_W * this.sx, y: a.y + (la - lb) / 180 * IMG_H * s };
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      // Mitten lyfts mot norr, som bågarna som reser sig över klotet
      const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - Math.min(140, len * 0.22) };
      // Bågen ritas en jord till vänster och höger också, om den hamnar på ytan där
      for (const k of [-1, 0, 1]) {
        const ox = k * IMG_W * this.sx;
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
    // Markörerna växer med zoomen som förut, men i regionvyn inte mer än vid Platt vys största zoom (#1641)
    const s = Math.min(this.scale, Math.max(this.w / IMG_W, this.h / IMG_H) * MAX_ZOOM), hl = keep ?? new Set();
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
      ctx.globalAlpha = u.opacity;
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
        el.setAttribute('aria-label', ui('flat.clusterLabel', { n: c.members.length, text }));
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
    // Rikesnamnen ritas inte i regionvyn (#1641): där finns inget att vika för
    const soft = this._region ? [] : empireBlocks(this.obstacles, (lat, lon) => this._toScreen(lat, lon, this.w), 2 * s);
    // Pågående krig får lägga sin etikett över rikesnamn när inget annat ryms (#1022), som på globen
    const placed = placeLabels(named, { W: this.w, H: this.h, hoverId, markers, badges, soft, priority: it => it.e.kind === 'war' && it.u?.info?.when === 'now', text: this.labelText, pxOf: e => pxOf.get(e.id) });
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
