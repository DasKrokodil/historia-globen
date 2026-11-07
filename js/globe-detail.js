// Detaljutsnitt för globen vid inzoomning. Hela kartbilden (baseCanvas och overlayCanvas, 4096 × 2048,
// beslut 1) räcker utzoomat, men vid full zoom blir varje bildpunkt flera skärmpixlar stor och kartan suddig.
// Här ritas därför bara det som syns, samma karta och samma lager, i mycket högre upplösning på två extra
// bilder (grundkartan och lagerbilden för utsnittet). De läggs som en liten bit av klotet ovanpå helbilden.
// Helbilden och Platt vy ändras inte, så kartan kan fortfarande skickas till en fysisk glob.
//
// Utsnittet är kvadratiskt i grader och har fast bildstorlek (N × N). Hur många grader det täcker, och därmed
// upplösningen, väljs efter hur mycket av klotet som syns: ju närmare, desto skarpare. Det ritas om först när
// rörelsen har stannat (DELAY), eftersom omritningen av lagren tar en stund. Under tiden ligger det gamla utsnittet
// kvar (det är fastlåst vid klotet, så det stämmer fortfarande), men ändras lagerbilden (nytt år, nya val) döljs
// utsnittets lagerbild direkt, så att aldrig ett gammalt års innehåll ligger över det nya.
//
// Helbildens lagerbild får ett "hål" där utsnittets lagerbild ligger, så att halvgenomskinliga lager inte
// ritas två gånger ovanpå varandra.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const FINE_LAND = 'data/land-10m.json'; // kustkartan 1:10m, bara för utsnittet (laddas första gången det används)
const DEG = Math.PI / 180;
const DELAY = 220;          // ms efter sista rörelsen eller ändringen innan utsnittet ritas
const MIN_GAIN = 1.5;       // utsnittet används först när det är minst så mycket skarpare än helbilden
const MARGIN = 1.3;         // utsnittet täcker så mycket mer än det som syns, så att litet panorerande ryms
const MAX_SPAN = 170;       // grader; större utsnitt ger ingen vinst
// Linjernas tjocklek i skärmpixlar (CSS-pixlar) i utsnittet: tunna och skarpa, inte förstorade med kartan
const LINE_PX = { grid: 1, equator: 1.4, coast: 1.3 };

export class GlobeDetail {
  /**
   * globe = Globe. paintBase(ctx, W, H, land, widths) ritar grundkartan. layers(ctx, W, H, drawFaded) ritar lagren
   * (sätts med setLayers). allowed() säger om utsnitt får användas just nu (inte i upptäcktsvyn, vars papperskarta
   * och dimma är bilder i helbildens storlek).
   */
  constructor(globe, { paintBase, allowed = () => true }) {
    this.globe = globe;
    this.paintBase = paintBase;
    this.allowed = allowed;
    this.layers = null;
    const mobile = (globe.canvas.clientWidth || innerWidth) <= 760;
    this.N = Math.min(mobile ? 1536 : 2048, globe.renderer.capabilities.maxTextureSize);
    this.baseCanvas = document.createElement('canvas');
    this.overlayCanvas = document.createElement('canvas');
    for (const c of [this.baseCanvas, this.overlayCanvas]) c.width = c.height = this.N;
    this.baseTex = new THREE.CanvasTexture(this.baseCanvas);
    this.overlayTex = new THREE.CanvasTexture(this.overlayCanvas);
    for (const t of [this.baseTex, this.overlayTex]) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = globe.baseTex.anisotropy; }

    this.baseMesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshLambertMaterial({ map: this.baseTex }));
    this.overlayMesh = new THREE.Mesh(new THREE.BufferGeometry(),
      new THREE.MeshBasicMaterial({ map: this.overlayTex, transparent: true, depthWrite: false }));
    this.baseMesh.visible = this.overlayMesh.visible = false;
    this.baseMesh.scale.setScalar(1.0008);
    this.overlayMesh.scale.setScalar(1.0028);
    globe.group.add(this.baseMesh, this.overlayMesh);

    // Helbildens lagerbild släpper igenom hålet (i dess egna texturkoordinater, u = (lon + 180) / 360, v = (lat + 90) / 180)
    this.hole = { value: new THREE.Vector4(0, 0, 0, 0) };
    globe.overlayMesh.material.onBeforeCompile = shader => {
      shader.uniforms.uHole = this.hole;
      shader.fragmentShader = `uniform vec4 uHole;\n${shader.fragmentShader}`.replace('#include <map_fragment>', `
        bool holeX = false;
        for (int i = -1; i <= 1; i++) { float ux = vMapUv.x + float(i); if (ux > uHole.x && ux < uHole.z) holeX = true; }
        if (holeX && vMapUv.y > uHole.y && vMapUv.y < uHole.w) discard;
        #include <map_fragment>`);
    };
    globe.overlayMesh.material.needsUpdate = true;

    this.region = null;       // utsnittet som är ritat: { lat0, lon0, span, ppd, latMax, lonMin }
    this.layersDirty = true;
    this.timer = 0;
    this.fade = null;
    this.lastDrawMs = 0;
    this.fineLand = null;     // 1:10m när den har laddats; tills dess (och om den inte går att läsa) ritas 1:50m
    this.fineRequested = false;
  }

  /** Hämtar den finare kustkartan första gången utsnittet behövs. Misslyckas hämtningen används 1:50m som förut. */
  _loadFineLand() {
    if (this.fineRequested) return;
    this.fineRequested = true;
    fetch(FINE_LAND)
      .then(res => { if (!res.ok) throw new Error(`${res.status}`); return res.json(); })
      .then(land => {
        this.fineLand = land;
        if (this.region) { this._drawBase(); this.globe.invalidate(); } // byt kusten under utsnittet som redan syns
      })
      .catch(err => console.warn('Den finare kustkartan kunde inte laddas, grundkartan används', err));
  }

  /** Lagrens ritfunktion: (ctx, W, H, drawFaded) => void, samma anrop som registry.draw. */
  setLayers(fn) { this.layers = fn; }

  /** Kameran eller storleken har ändrats: rita om utsnittet när rörelsen har stannat. */
  touch() { this._schedule(); }

  /** Lagerbilden ritades om (nytt år eller nya val): utsnittets lagerbild är inaktuell och döljs tills den ritats om. */
  layersChanged() {
    this.layersDirty = true;
    this._showOverlay(false);
    if (this.region) this._schedule();
  }

  /** Helbildens storlek har bytts (mobilglob eller Platt vy): utsnittet räknas om från början. */
  reset() { this._hide(); this._schedule(); }

  _schedule() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this._settle(), DELAY);
  }

  /** Utsnittet som behövs för vyn just nu, eller null när helbilden räcker. */
  _wanted() {
    const g = this.globe;
    if (g._flatView || !g._land || !this.allowed()) return null;
    const w = g.canvas.clientWidth, h = g.canvas.clientHeight;
    if (!w || !h) return null;
    const r = g.canvas.getBoundingClientRect();
    const mid = g.pickLatLon(r.left + w / 2, r.top + h / 2);
    if (!mid) return null;
    // Skärmpixlar per klotradie mitt på klotet (som globePxPerImg i ui/zoomlevels.js)
    const cam = g.camera;
    const pxPerR = h / (2 * Math.max(0.2, cam.position.z - 1) * Math.tan(cam.fov / 2 * DEG));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Hur många grader från mitten som syns i hörnen (med marginal för perspektivet)
    const a = Math.min(Math.PI / 2, Math.hypot(w, h) / 2 / pxPerR * MARGIN);
    const lat0 = mid.lat;
    const sinA = Math.sin(a), cosLat = Math.cos(lat0 * DEG);
    const lonHalf = sinA >= cosLat ? 180 : Math.asin(sinA / cosLat) / DEG;
    const need = 2 * Math.max(a / DEG, lonHalf);
    if (need > MAX_SPAN) return null;
    const target = pxPerR / (180 / Math.PI) * dpr; // bildpunkter per grad som ger en bildpunkt per skärmpixel
    const ppd = Math.min(target, this.N / need);
    if (ppd < MIN_GAIN * g.baseCanvas.width / 360) return null;
    return { lat0, lon0: mid.lon, span: this.N / ppd, need, ppd, texelPerCss: ppd / (pxPerR * DEG) };
  }

  _covers(want) {
    const c = this.region;
    if (!c || want.ppd > c.ppd * 1.25 || want.need > c.span) return false;
    const room = (c.span - want.need) / 2;
    const dlon = ((want.lon0 - c.lon0 + 540) % 360) - 180;
    return Math.abs(want.lat0 - c.lat0) <= room && Math.abs(dlon) <= room;
  }

  _settle() {
    const want = this._wanted();
    if (!want) { this._hide(); return; }
    this._loadFineLand();
    if (!this._covers(want)) this._redrawRegion(want);
    else if (this.layersDirty) this._drawOverlay();
  }

  _hide() {
    this.region = null;
    this.baseMesh.visible = this.overlayMesh.visible = false;
    this.hole.value.set(0, 0, 0, 0);
    this.globe.invalidate();
  }

  _showOverlay(on) {
    if (on && !this.region) return;
    this.overlayMesh.visible = on;
    const c = this.region;
    if (on && c) this.hole.value.set((c.lonMin + 180) / 360, (c.latMax - c.span + 90) / 180, (c.lonMin + c.span + 180) / 360, (c.latMax + 90) / 180);
    else this.hole.value.set(0, 0, 0, 0);
    this.globe.invalidate();
  }

  _redrawRegion(want) {
    const span = want.span;
    // Utsnittet får inte sticka utanför polerna: flytta det i stället för att beskära det
    const latMax = Math.max(-90 + span, Math.min(90, want.lat0 + span / 2));
    const lonMin = want.lon0 - span / 2;
    this.region = { lat0: want.lat0, lon0: want.lon0, span, ppd: want.ppd, texelPerCss: want.texelPerCss, latMax, lonMin };
    // Klotbiten: samma vinklar som helbildens sfär (phi = lon + 180, theta = 90 - lat)
    const geo = new THREE.SphereGeometry(1, 48, 48, (lonMin + 180) * DEG, span * DEG, (90 - latMax) * DEG, span * DEG);
    this.baseMesh.geometry.dispose();
    this.baseMesh.geometry = this.overlayMesh.geometry = geo;
    this._showOverlay(false);
    this._drawBase();
    this.baseMesh.visible = true;
    this.layersDirty = true;
    this._drawOverlay();
  }

  /** Ritar något på en bild som visar utsnittet, en gång per kopia av världen som syns (över datumlinjen två). */
  _paint(ctx, draw) {
    const c = this.region, W = 360 * c.ppd, H = 180 * c.ppd;
    const x0 = (c.lonMin + 180) * c.ppd, y0 = (90 - c.latMax) * c.ppd;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.N, this.N);
    for (const k of [-1, 0, 1]) {
      const left = k * W - x0;
      if (left >= this.N || left + W <= 0) continue;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, left, -y0);
      draw(ctx, W, H);
      ctx.restore();
    }
  }

  _drawBase() {
    const c = this.region, t = c.texelPerCss;
    const ctx = this.baseCanvas.getContext('2d');
    this._paint(ctx, (cx, W, H) => {
      const land = this.fineLand ?? this.globe._land;
      // paintBase ritar kustlinjen i land-bildens enheter; coast anges där i bildpunkter på bilden W × H
      this.paintBase(cx, W, H, land, { grid: LINE_PX.grid * t, equator: LINE_PX.equator * t, coast: LINE_PX.coast * t });
    });
    this.baseTex.needsUpdate = true;
  }

  _drawOverlay() {
    if (!this.layers || !this.region) return;
    const t0 = performance.now();
    const ctx = this.overlayCanvas.getContext('2d');
    this._paint(ctx, (cx, W, H) => {
      const drawFaded = (draw, alpha) => {
        if (!this.fade) { this.fade = document.createElement('canvas'); this.fade.width = this.fade.height = this.N; }
        const f = this.fade.getContext('2d');
        f.setTransform(1, 0, 0, 1, 0, 0);
        f.clearRect(0, 0, this.N, this.N);
        f.setTransform(cx.getTransform());
        draw(f, W, H);
        cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0);
        cx.globalAlpha = alpha; cx.drawImage(this.fade, 0, 0);
        cx.restore();
      };
      this.layers(cx, W, H, drawFaded);
    });
    this.overlayTex.needsUpdate = true;
    this.layersDirty = false;
    this.lastDrawMs = performance.now() - t0;
    this._showOverlay(true);
  }
}
