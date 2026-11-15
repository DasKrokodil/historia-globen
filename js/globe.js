// 3D-globen. Beslut 1: allt ritas först på ekvirektangulära bilder (canvas)
// som sedan läggs på klotet. Samma bilder visas i Platt vy (ui/flatmap.js) och kan skickas till en fysisk glob.
//   baseCanvas    – grundkartan (hav, gradnät, land), ritas en gång
//   overlayCanvas – lagrens bild, ritas om när året ändras
// Klickbara markörer och bågar ligger som 3D-objekt ovanpå.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GlobeDetail } from './globe-detail.js';
import { cameraDistance } from './region-frame.js';

export { THREE };
export const R = 1;
const DEG = Math.PI / 180;
const GLOBE_TEXTURE = 4096;
/** Den vanliga globens synfält i grader. Avståndet (baseDist) räknas alltid ur det, också när regionvyn har ett smalare (#1644). */
const BASE_FOV = 35;
/** Kameran ligger så här mycket under klotets mitt (lämnar plats för tidslinjen), utom i regionvyn som lägger platsen exakt. */
const CAM_Y = -0.06;
/** Hur långt klotet får vridas mot polerna: 1,25 radianer (71,6°) som vanligt, och i regionvyn (#1644) 85°, så att Grönland
 *  (59,8–83,6° N, mitten 71,7°) kan ligga mitt i bilden. */
const MAX_TILT = 1.25;
const MAX_TILT_REGION = 85 * Math.PI / 180;
/** Regionvyns zoom (#1644): så här mycket ut och in från ramen. */
const REGION_ZOOM = [0.4, 3];
const MOBILE_GLOBE_TEXTURE = 2048;

/** Latitud/longitud till punkt på klotet, i samma system som klotets bildkoordinater. */
export function latLonToVec3(lat, lon, r = R) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

const landPaths = new WeakMap();
const scaledPaths = new WeakMap(); // landets bana skalad olika i öst–väst och nord–syd (regionvyn, #1641): { kx, ky, path }

/**
 * Ritar grundkartan (hav, gradnät, land) på en ekvirektangulär bild som är W × H stor. Delas av hela bilden
 * (Globe.drawBase) och av detaljutsnittet vid inzoomning (globe-detail.js), som ritar samma karta i en mycket
 * större "tänkt" bild och bara behåller utsnittet. Linjernas tjocklek anges i bildpunkter (grid, equator, coast);
 * utan val är de samma som förut, så hela bilden ser ut som alltid.
 */
export function paintBase(ctx, W, H, land, widths = {}) {
  const { grid = 1.5, equator = 2, coast = 1.6 * W / land.width } = widths;
  const X = lon => (lon + 180) / 360 * W, Y = lat => (90 - lat) / 180 * H;

  const sea = ctx.createLinearGradient(0, 0, 0, H);
  sea.addColorStop(0, '#1b3b55'); sea.addColorStop(0.5, '#15354f'); sea.addColorStop(1, '#1b3b55');
  ctx.fillStyle = sea; ctx.fillRect(0, 0, W, H);

  // Gradnät var 15:e grad
  ctx.strokeStyle = 'rgba(214,190,140,0.16)'; ctx.lineWidth = grid;
  for (let lon = -180; lon <= 180; lon += 15) { ctx.beginPath(); ctx.moveTo(X(lon), 0); ctx.lineTo(X(lon), H); ctx.stroke(); }
  for (let lat = -75; lat <= 75; lat += 15) { ctx.beginPath(); ctx.moveTo(0, Y(lat)); ctx.lineTo(W, Y(lat)); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(214,176,106,0.35)'; ctx.lineWidth = equator;
  ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(W, Y(0)); ctx.stroke();

  // Land: färdigprojicerad path (klippt vid datumlinjen) i 4096x2048
  let path = landPaths.get(land);
  if (!path) landPaths.set(land, path = new Path2D(land.path));
  const kx = W / land.width, ky = H / land.height;
  if (Math.abs(kx / ky - 1) > 1e-3) {
    // Olika skala i öst–väst och nord–syd (regionvyn i Platt vy, #1641): banan skalas och inte pennan, så att kusten blir
    // lika tjock åt alla håll. Den skalade banan sparas per karta och skala (en omritning efter panorering byggs inte om).
    // Koordinaterna blir stora (vid regionvyns största zoom i mobil med dpr 3 cirka 400 000 bildpunkter), men 32-bitars flyttal
    // ger då fortfarande en upplösning på några hundradels bildpunkter, så linjen hoppar inte
    let cached = scaledPaths.get(land);
    if (!cached || cached.kx !== kx || cached.ky !== ky) {
      const p = new Path2D();
      p.addPath(path, new DOMMatrix([kx, 0, 0, ky, 0, 0]));
      scaledPaths.set(land, cached = { kx, ky, path: p });
    }
    const scaled = cached.path;
    ctx.fillStyle = '#cdb88d';
    ctx.fill(scaled);
    ctx.strokeStyle = 'rgba(80,58,25,0.55)'; ctx.lineWidth = coast;
    ctx.stroke(scaled);
    return;
  }
  ctx.save();
  ctx.scale(W / land.width, H / land.height);
  ctx.fillStyle = '#cdb88d';
  ctx.fill(path);
  ctx.strokeStyle = 'rgba(80,58,25,0.55)'; ctx.lineWidth = coast * land.width / W;
  ctx.stroke(path);
  ctx.restore();
}

export class Globe {
  constructor(canvas, exitTarget = null) {
    this.canvas = canvas;
    this.exitTarget = exitTarget;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.1, 100);
    this.region = null; // regionvyn på globen (#1644): { frame, rz, moved }, se setRegion
    this._pose = null;  // kamerans övergång mellan vanlig glob och regionvy: { t0, ms, from, to }
    this.zoom = 1;
    this.viewShiftPx = 0;
    this.viewLiftPx = 0; // lyft uppåt i pixlar när faktarutan står som ark nedtill (#361)

    this.group = new THREE.Group();
    this.group.rotation.order = 'XYZ';
    this.scene.add(this.group);

    // Ekvirektangulära bilder
    this.baseCanvas = document.createElement('canvas');
    this.overlayCanvas = document.createElement('canvas');
    this._textureWidth = 0;
    this._setTextureSize();

    this.baseTex = new THREE.CanvasTexture(this.baseCanvas);
    this.baseTex.colorSpace = THREE.SRGBColorSpace;
    this.baseTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.overlayTex = new THREE.CanvasTexture(this.overlayCanvas);
    this.overlayTex.colorSpace = THREE.SRGBColorSpace;
    this.overlayTex.anisotropy = this.baseTex.anisotropy;

    const sphere = new THREE.SphereGeometry(R, 128, 64);
    this.baseMesh = new THREE.Mesh(sphere, new THREE.MeshLambertMaterial({ map: this.baseTex }));
    this.overlayMesh = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.002, 128, 64),
      new THREE.MeshBasicMaterial({ map: this.overlayTex, transparent: true, depthWrite: false }),
    );
    this.group.add(this.baseMesh, this.overlayMesh);
    // Skarpt utsnitt vid inzoomning, ritas om när rörelsen har stannat
    this.detail = new GlobeDetail(this, { paintBase, allowed: () => this.detailAllowed() });

    // Atmosfär: svagt sken runt kanten
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.12, 64, 32),
      new THREE.ShaderMaterial({
        side: THREE.BackSide, transparent: true, depthWrite: false,
        uniforms: { c: { value: new THREE.Color('#7fa6c9') } },
        vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader: 'uniform vec3 c; varying vec3 vN; void main(){ float i = pow(0.72 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(c, clamp(i,0.0,1.0)*0.55); }',
      }),
    );
    this.scene.add(atmo);

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const sun = new THREE.DirectionalLight(0xfff3dd, 1.4);
    sun.position.set(-2, 2, 3);
    this.scene.add(sun);

    this.markerGroup = new THREE.Group();
    this.arcGroup = new THREE.Group();
    this.group.add(this.markerGroup, this.arcGroup);

    this.raycaster = new THREE.Raycaster();
    this.frameCallbacks = [];
    this.autoRotate = true;
    this.calm = false; // Lugn rörelse (#246): ingen automatisk snurr, ingen flygning, ingen utrullning
    this._vel = { x: 0, y: 0 };
    this._fly = null;
    this._needsRender = true;

    this.group.rotation.set(0.35, 0, 0);
    this._initControls();
    this._resize();
    new ResizeObserver(() => this._resize()).observe(canvas);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.invalidate(); });
    this.renderer.setAnimationLoop(t => this._tick(t));
  }

  // ---------- Grundkarta ----------
  drawBase(land) {
    this._land = land;
    const c = this.baseCanvas, ctx = c.getContext('2d');
    paintBase(ctx, c.width, c.height, land);
    this.baseTex.needsUpdate = true;
    this.invalidate();
  }

  overlayContext() {
    const ctx = this.overlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    return ctx;
  }
  commitOverlay() { this.overlayTex.needsUpdate = true; this.invalidate(); }
  /** Ritar ett lager dämpat på lagerbilden (#235): först på en egen bild i samma storlek, som sedan
   *  läggs på med genomskinlighet alpha. Lagren sätter själva globalAlpha, så det går inte att dämpa direkt. */
  drawFaded(draw, alpha) {
    const W = this.overlayCanvas.width, H = this.overlayCanvas.height;
    if (!this.fadeCanvas) { this.fadeCanvas = document.createElement('canvas'); this.fadeCanvas.width = W; this.fadeCanvas.height = H; }
    const f = this.fadeCanvas.getContext('2d');
    f.clearRect(0, 0, W, H);
    draw(f, W, H);
    const ctx = this.overlayCanvas.getContext('2d');
    ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(this.fadeCanvas, 0, 0); ctx.restore();
  }

  // ---------- Bågar mellan samtidiga platser ----------
  // Bågen ritas som en ljus linje på en mörk kant, som i Platt vy (4 och 1,6 px), så att den syns på både hav och
  // pergament (Upptäcktsresor har ljus botten överallt). Rören har en bredd i pixlar som hålls vid zoom och storleksändring.
  setArcs(pairs) {
    this._arcPairs = pairs;
    this._buildArcs();
  }

  /** En pixel på skärmen vid klotets yta, i världsenheter. */
  _pxWorld() {
    return 2 * Math.tan(this.camera.fov / 2 * DEG) * this.camera.position.z / (this.canvas.clientHeight || 1);
  }

  _buildArcs() {
    for (const ch of [...this.arcGroup.children]) { ch.geometry.dispose(); ch.material.dispose(); this.arcGroup.remove(ch); }
    const px = this._arcPx = this._pxWorld();
    for (const [a, b] of this._arcPairs ?? []) {
      const va = latLonToVec3(a[0], a[1]).normalize(), vb = latLonToVec3(b[0], b[1]).normalize();
      const ang = va.angleTo(vb);
      const pts = [];
      for (let i = 0; i <= 96; i++) {
        const t = i / 96;
        const v = slerp(va, vb, t, ang);
        v.multiplyScalar(R * (1.006 + Math.sin(Math.PI * t) * Math.min(0.16, ang * 0.1)));
        pts.push(v);
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      // [bredd i px, färg, täckning, ritordning]: kanten först, den ljusa linjen ovanpå
      for (const [width, color, opacity, order] of [[4, 0x0b1219, 0.55, 1], [1.6, 0xecdfc2, 0.9, 2]]) {
        const mesh = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 96, width * px / 2, 6, false),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
        );
        mesh.renderOrder = order;
        this.arcGroup.add(mesh);
      }
    }
    this.invalidate();
  }

  /** Bygger om bågarna när en pixel har ändrat storlek (zoom, fönstret), så att bredden håller sig. */
  _refreshArcs() {
    if (this._arcPairs?.length && Math.abs(this._pxWorld() / this._arcPx - 1) > 0.06) this._buildArcs();
  }

  // ---------- Kamera och styrning ----------
  setViewShift(px) { this.viewShiftPx = px; this._resize(); }

  /** Platt vy behöver den fulla gemensamma bilden; annars räcker halva upplösningen på smal mobil. */
  setFlatView(open) {
    if (this._flatView === open) return;
    this._flatView = open;
    this._setTextureSize();
  }

  /** Utsnittet får användas om inget annat ställer sig i vägen. main.js byter ut den (upptäcktsvyn). */
  detailAllowed() { return true; }

  /** Lugn rörelse stannar också eventuell utrullning och ber om en sista, stilla bild. */
  setCalm(on) { this.calm = on; this.invalidate(); }

  /**
   * Lyft bilden av klotet uppåt med py pixlar (#361): i smal skärm, när faktarutan står som ark nedtill,
   * flyttas klotet upp så att mitten (och den valda markören) hamnar i den fria ytan ovanför arket.
   * Glider över ms millisekunder (Lugn rörelse: direkt). 0 = som vanligt.
   */
  setViewLift(py, ms = 350) {
    py = Math.round(py);
    if (py === (this._lift?.to ?? this.viewLiftPx)) return;
    if (this.calm) ms = 1;
    this._lift = { t0: performance.now(), ms, from: this.viewLiftPx, to: py };
    this.invalidate();
  }

  /** Klotets mitt på skärmen (y i pixlar från canvasens överkant), utan lyftet. */
  centerY() {
    const v = new THREE.Vector3(0, 0, 0).project(this.camera);
    return (1 - v.y) / 2 * (this.canvas.clientHeight || 1) + this.viewLiftPx;
  }

  _applyView() {
    if (this.region || this._pose) { this._applyPose(this._pose ? this._posed() : this._regionPose()); return; }
    const w = this.canvas.clientWidth || 1, h = this.canvas.clientHeight || 1;
    if (this.viewShiftPx || this.viewLiftPx) this.camera.setViewOffset(w, h, this.viewShiftPx, this.viewLiftPx, w, h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
  }

  _resize() {
    const w = this.canvas.clientWidth || 1, h = this.canvas.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this._applyView();
    // I smal, stående skärm (#361) får klotet nästan hela bredden (marginal cirka 5 procent i stället för 32),
    // eftersom bredden är det som begränsar. Datorn och liggande skärmar är som förut.
    const k = w <= 760 && this.camera.aspect < 1 ? 1.1 : 1.32;
    // Ur den vanliga globens synfält, inte kamerans: i regionvyn är synfältet smalare, och zoomen ska betyda samma sak (#1644)
    const fit = R * k / Math.tan(BASE_FOV / 2 * DEG);
    this.baseDist = this.camera.aspect < 1 ? fit / this.camera.aspect : fit;
    if (this.region || this._pose) {
      if (this.region) this._reframe();
      this._applyView();
    } else {
      // Lämna plats för tidslinjen nedtill
      this.camera.position.set(0, CAM_Y, this.baseDist / this.zoom);
      this.camera.lookAt(0, CAM_Y, 0);
      this.camera.updateProjectionMatrix();
    }
    this._setTextureSize();
    this._refreshArcs();
    this.invalidate();
  }

  /**
   * Zoomen på den vanliga globen. I regionvyn (#1644) sätter den bara zoomen som globen får tillbaka när vyn lämnas (en tur, en adress
   * eller Fokus anger den absolut); hjulet, + och −, dubbeltrycket och nypningen zoomar regionvyn med zoomBy.
   */
  setZoom(z) {
    if (this.region) { this.zoom = Math.min(3.2, Math.max(0.8, z)); this.onZoom?.(this.zoom); return; }
    this.zoom = Math.min(3.2, Math.max(0.8, z));
    this.camera.position.z = this.baseDist / this.zoom;
    this._refreshArcs();
    this.onZoom?.(this.zoom);
    this.invalidate();
  }

  /** Besökarens zoom med faktorn f: regionvyns zoom när den är öppen, annars globens. */
  zoomBy(f) {
    if (this.region) this._regionZoomTo(this.region.rz * f);
    else this.setZoom(this.zoom * f);
  }

  /** Tid (performance.now) då användaren senast vred, zoomade eller tryckte på globen (#165). */
  lastUserInput = -Infinity;

  flyTo(lat, lon, ms = 1100, { force = false } = {}) {
    // I regionvyn (#1644) flyttas klotet bara om punkten inte syns i bilden (en vald händelse, uppspelningen), som reveal() i Platt vy
    if (this.region && !force) {
      if (this._onScreen(lat, lon)) return;
      this.region.moved = true; // klotet flyttas bort från ramen: den räknas inte om när storleken ändras
    }
    const theta = (lon + 180) * DEG;
    let ty = Math.PI / 2 - theta;
    const cy = this.group.rotation.y;
    ty = cy + wrapPi(ty - cy);
    const tx = this._tilt(lat * DEG);
    this.autoRotate = false;
    this._vel = { x: 0, y: 0 };
    if (this.calm) ms = 1; // hoppar i stället för att flyga
    this._fly = { t0: performance.now(), ms, fx: this.group.rotation.x, fy: cy, tx, ty };
    // Ett litet offentligt händelsepar gör att användargränssnitt och regressionstester kan följa
    // den faktiska orienteringen utan att läsa renderade pixlar (#515).
    this.canvas.dispatchEvent(new CustomEvent('hg:globe-flight', { detail: { phase: 'start', x: this.group.rotation.x, y: cy, targetX: tx, targetY: ty } }));
    this.invalidate();
  }

  /**
   * Var kameran tittar, som { lat, lon, zoom } (#403): omvändningen av flyTo, för tillståndet som JSON.
   * Under en flygning är det målet som räknas, så att ett sparat läge blir dit globen är på väg.
   */
  get view() {
    const x = this._fly ? this._fly.tx : this.group.rotation.x, y = this._fly ? this._fly.ty : this.group.rotation.y;
    const lon = ((((Math.PI / 2 - y) / DEG - 180) % 360) + 540) % 360 - 180;
    return { lat: x / DEG, lon, zoom: this.zoom };
  }

  /** Är punkten på den synliga halvan av klotet? Används för att inte röra
   * kameran i onödan efter ett uttryckligt årshopp (#515). */
  isPointVisible(lat, lon) {
    this.camera.updateMatrixWorld();
    this.group.updateMatrixWorld();
    return this.project(latLonToVec3(lat, lon)).facing > 0;
  }

  // ---------- Regionvyn på globen (#1644) ----------
  // En stor plats (Aotearoa, Grönland) visas genom att globen flyger in med ett smalt synfält, så att bilden blir nästan ortografisk
  // med mitten i platsen. Kameran beskrivs då av en "pose": synfält, skärmpixlar per klotradie mitt i bilden (pxPerR), kamerans höjd
  // och var klotets mitt ligger på skärmen (offX, offY i setViewOffset). Den vanliga globen har samma pose som förut (35°, avståndet
  // baseDist / zoom, kameran 0,06 under mitten, viewShiftPx och viewLiftPx), så att den ser ut och beter sig exakt som förut.
  // Mellan dem glider kameran (_pose), samtidigt som klotet vrids (flyTo). Ramningen (var platsen ska ligga och hur stor) räknas
  // av den som anropar (js/region-frame.js, globeFrame) och räknas om när storleken ändras, om man inte har flyttat klotet själv.

  /** Regionvyn på globen är öppen? */
  get regionOpen() { return !!this.region; }

  /**
   * Öppnar regionvyn: frame() ger { lat, lon, pxPerR, cx, cy, fov } (globeFrame) och anropas igen när storleken ändras.
   * null stänger den: kameran glider tillbaka till den vanliga globen med samma zoom som förut. ms: flygningens längd.
   */
  setRegion(frame, ms = 1100) {
    if (this.calm) ms = 1;
    const from = this._currentPose();
    if (frame) {
      const target = frame();
      if (!target) return false;
      this.region = { frame, rz: 1, moved: false, target };
      this.autoRotate = false;
      this.flyTo(target.lat, target.lon, ms, { force: true });
    } else {
      if (!this.region) return false;
      this.region = null;
      // Tillbaka innanför den vanliga gränsen mot polerna (Grönland ligger annars över 71,6°)
      // view läser målet under en flygning, så att en vy som lämnas mitt i flygningen inte fortsätter mot 71,7°
      if (Math.abs(this.view.lat * DEG) > MAX_TILT) this.flyTo(this.view.lat, this.view.lon, ms, { force: true });
    }
    this._pose = { t0: performance.now(), ms, from, to: null };
    this.invalidate();
    return true;
  }

  /** Ramar in platsen igen (Återställ, eller ny storlek när man inte har flyttat klotet). ms: glidningens längd. */
  resetRegion(ms = 500) {
    if (!this.region) return;
    const target = this.region.frame();
    if (!target) return;
    const from = this._currentPose();
    Object.assign(this.region, { target, rz: 1, moved: false });
    this.flyTo(target.lat, target.lon, ms, { force: true });
    this._pose = { t0: performance.now(), ms: this.calm ? 1 : ms, from, to: null };
    this.onZoom?.(this.zoom);
  }

  /** Har man panorerat eller zoomat i regionvyn sedan den ramades in? */
  get regionMoved() { return !!this.region?.moved; }

  /** Skärmpixlar per klotradie mitt i bilden, med kamerans faktiska avstånd och synfält. */
  pxPerR() {
    const h = this.canvas.clientHeight || 1;
    return h / (2 * Math.max(0.05, this.camera.position.z - R) * Math.tan(this.camera.fov / 2 * DEG));
  }

  /** Förstoringen mitt på klotet jämfört med zoom 1 (render.js, namnens storlek). Utan regionvyn samma tal som förut. */
  magnification() {
    const d = this.baseDist;
    if (!this.region && !this._pose) return Math.max(1, (d - 1) / (d / this.zoom - 1));
    const h = this.canvas.clientHeight || 1, base = h / (2 * (d - R) * Math.tan(BASE_FOV / 2 * DEG));
    return Math.max(1, this.pxPerR() / base);
  }

  /** Ligger punkten på framsidan och inne i bilden, med 40 px marginal? */
  _onScreen(lat, lon) {
    this.camera.updateMatrixWorld();
    this.group.updateMatrixWorld();
    const p = this.project(latLonToVec3(lat, lon)), w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    return p.facing > 0 && p.x > 40 && p.x < w - 40 && p.y > 40 && p.y < h - 40;
  }

  _tilt(x) {
    const max = this.region ? MAX_TILT_REGION : MAX_TILT;
    return Math.max(-max, Math.min(max, x));
  }

  _regionZoomTo(rz) {
    const r = this.region;
    r.rz = Math.min(REGION_ZOOM[1], Math.max(REGION_ZOOM[0], rz));
    r.moved = true;
    if (!this._pose) this._applyView();
    this._refreshArcs();
    this.onZoom?.(this.zoom);
    this.invalidate();
  }

  /** Ny storlek i regionvyn: ramen räknas om, men står kvar om man har flyttat klotet (mitten och skalan behålls då). */
  _reframe() {
    const r = this.region;
    if (r.moved) return;
    const target = r.frame();
    if (!target) return;
    r.target = target;
    if (!this._fly) { this.group.rotation.x = this._tilt(target.lat * DEG); this.group.rotation.y = this.group.rotation.y + wrapPi(Math.PI / 2 - (target.lon + 180) * DEG - this.group.rotation.y); }
  }

  /** Den vanliga globens pose, som _resize och _applyView ställer in den. */
  _basePose() {
    const h = this.canvas.clientHeight || 1, dist = this.baseDist / this.zoom;
    return { fov: BASE_FOV, pxPerR: h / (2 * (dist - R) * Math.tan(BASE_FOV / 2 * DEG)), camY: CAM_Y, offX: this.viewShiftPx, offY: this.viewLiftPx };
  }

  /** Regionvyns pose: ramens skala gånger regionzoomen, och projektionens mitt där ramen vill ha den. */
  _regionPose() {
    if (!this.region) return this._basePose();
    const w = this.canvas.clientWidth || 1, h = this.canvas.clientHeight || 1, t = this.region.target, rz = this.region.rz;
    // Zoomen sker kring den fria ytans mitt: projektionens mitt flyttas lika mycket som platsen växer
    const fx = t.box ? (t.box.x0 + t.box.x1) / 2 : w / 2, fy = t.box ? (t.box.y0 + t.box.y1) / 2 : h / 2;
    const cx = fx + (t.cx - fx) * rz, cy = fy + (t.cy - fy) * rz;
    return { fov: t.fov, pxPerR: t.pxPerR * rz, camY: 0, offX: w / 2 - cx, offY: h / 2 - cy };
  }

  /** Kamerans läge just nu som pose (mitt i en glidning: där den är). */
  _currentPose() {
    if (this._pose) return this._posed();
    return this.region ? this._regionPose() : this._basePose();
  }

  /** Posen under glidningen: synfältet, höjden och förskjutningen linjärt, skalan logaritmiskt (jämn zoom), samma kurva som flyTo. */
  _posed() {
    const p = this._pose, s = Math.min(1, (performance.now() - p.t0) / p.ms);
    const e = s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2;
    const a = p.from, b = this.region ? this._regionPose() : this._basePose();
    const mix = (u, v) => u + (v - u) * e;
    return { fov: mix(a.fov, b.fov), pxPerR: Math.exp(mix(Math.log(a.pxPerR), Math.log(b.pxPerR))), camY: mix(a.camY, b.camY), offX: mix(a.offX, b.offX), offY: mix(a.offY, b.offY) };
  }

  _applyPose(p) {
    const w = this.canvas.clientWidth || 1, h = this.canvas.clientHeight || 1;
    const dist = cameraDistance(p.pxPerR, h, p.fov);
    this.camera.fov = p.fov;
    this.camera.position.set(0, p.camY, dist);
    this.camera.lookAt(0, p.camY, 0);
    if (p.offX || p.offY) this.camera.setViewOffset(w, h, p.offX, p.offY, w, h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
  }

  _initControls() {
    const el = this.canvas;
    const pts = new Map();
    let last = null, moved = 0, pinch0 = 0, zoom0 = 1, lastTap = null;
    el.addEventListener('pointerdown', e => {
      el.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      last = { x: e.clientX, y: e.clientY, t: performance.now() };
      moved = 0;
      this.autoRotate = false; this._fly = null; this.lastUserInput = performance.now();
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = this.region ? this.region.rz : this.zoom; }
      el.classList.add('dragging');
      this.invalidate();
    });
    el.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        const f = Math.hypot(a.x - b.x, a.y - b.y) / (pinch0 || 1);
        if (this.region) this._regionZoomTo(zoom0 * f); else this.setZoom(zoom0 * f); // från nypningens början, inte stegvis
        moved += 10; return;
      }
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      // I regionvyn följer klotet fingret: en skärmpixel är 1 / pxPerR radianer mitt i bilden (#1644)
      const k = this.region ? 1 / this.pxPerR() : 0.0042 / this.zoom;
      if (this.region) this.region.moved = true;
      this.group.rotation.y += dx * k;
      this.group.rotation.x = this._tilt(this.group.rotation.x + dy * k);
      const now = performance.now(), dt = Math.max(8, now - last.t);
      this._vel = { x: dy * k / dt * 16, y: dx * k / dt * 16 };
      last = { x: e.clientX, y: e.clientY, t: now };
      this.invalidate();
    });
    const end = e => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      el.classList.remove('dragging');
      if (moved < 6 && e.type === 'pointerup') {
        // Dubbeltryck med finger eller penna (#233): zooma in ett steg mot punkten. Sidan zoomas inte (touch-action och gesturestart-skyddet finns kvar).
        const now = performance.now();
        if (e.pointerType !== 'mouse' && lastTap && now - lastTap.t < 350 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30) {
          lastTap = null;
          this.onDoubleTap?.(); // första trycket kan ha väntat på att bli ett platstryck (#1161)
          const at = this.pickLatLon(e.clientX, e.clientY);
          if (at) this.flyTo(at.lat, at.lon, 500, { force: true });
          this.zoomBy(1.6);
          return;
        }
        lastTap = { x: e.clientX, y: e.clientY, t: now };
        this.onClick?.(e.clientX, e.clientY, e.pointerType);
      }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    // Tangentbord (#139, #386): piltangenter snurrar, + och − zoomar, Escape lämnar globen.
    // Canvasen fångar aldrig Tab, så att man alltid kan gå vidare eller tillbaka i sidan.
    el.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (this.exitTarget) this.exitTarget.focus({ preventScroll: true });
        else el.blur();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Enter är tangentbordets tryck (#1161): platsen i mitten av vyn, om den har ett kort
      if (e.key === 'Enter' && this.onActivate) { e.preventDefault(); this.onActivate(); return; }
      // En pil under en flygning (till exempel till adressens kamera direkt efter laddningen) utgår från flygningens mål, som
      // Globe.view redan säger, och inte från där klotet råkade vara mitt i flygningen (#1606)
      if (this._fly && /^Arrow(Left|Right|Up|Down)$/.test(e.key)) {
        this.group.rotation.x = this._fly.tx; this.group.rotation.y = this._fly.ty;
      }
      const step = this.region ? (e.shiftKey ? 160 : 60) / this.pxPerR() : (e.shiftKey ? 0.24 : 0.1) / this.zoom;
      if (this.region && /^Arrow/.test(e.key)) this.region.moved = true;
      let handled = true;
      if (e.key === 'ArrowLeft') this.group.rotation.y += step;
      else if (e.key === 'ArrowRight') this.group.rotation.y -= step;
      else if (e.key === 'ArrowUp') this.group.rotation.x = this._tilt(this.group.rotation.x + step);
      else if (e.key === 'ArrowDown') this.group.rotation.x = this._tilt(this.group.rotation.x - step);
      else if (e.key === '+' || e.key === '=') this.zoomBy(1.2);
      else if (e.key === '-' || e.key === '_') this.zoomBy(1 / 1.2);
      else handled = false;
      if (!handled) return;
      e.preventDefault();
      this.autoRotate = false; this._fly = null; this._vel = { x: 0, y: 0 }; this.lastUserInput = performance.now();
      this.invalidate();
    });
    this.addZoomSurface(el);
  }

  /** Mushjul och nypning på styrplattan zoomar globen när gesten börjar på el. Chrome, Edge och Firefox
   *  skickar styrplattans nypning som wheel med ctrlKey; utan preventDefault zoomas hela sidan. Etiketterna
   *  och klustren ovanpå klotet anmäler sig också, annars zoomas sidan när pekaren råkar stå på en etikett. */
  addZoomSurface(el) {
    el.addEventListener('wheel', e => {
      this.lastUserInput = performance.now();
      e.preventDefault();
      // Nypningens steg är mycket mindre än mushjulets, så de får en större faktor.
      const k = e.ctrlKey ? 0.01 : (e.deltaMode === 1 ? 0.04 : 0.0012);
      this.zoomBy(Math.exp(-e.deltaY * k));
    }, { passive: false });
  }

  /** Skärmposition för en punkt i klotets koordinater, och om den syns (vänd mot kameran). */
  project(local) {
    const world = local.clone().applyMatrix4(this.group.matrixWorld);
    const toCam = this.camera.position.clone().sub(world).normalize();
    const facing = world.clone().normalize().dot(toCam);
    const p = world.clone().project(this.camera);
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    return { x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h, facing };
  }

  pick(clientX, clientY, objects) {
    const r = this.canvas.getBoundingClientRect();
    const v = new THREE.Vector2((clientX - r.left) / r.width * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(v, this.camera);
    const hits = this.raycaster.intersectObjects([this.baseMesh, ...objects], false);
    const first = hits[0];
    return first && first.object !== this.baseMesh ? first.object : null;
  }

  /** Longitud och latitud under en klickpunkt på globen (via sfärens texturkoordinat), annars null. */
  pickLatLon(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect();
    const v = new THREE.Vector2((clientX - r.left) / r.width * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(v, this.camera);
    const hit = this.raycaster.intersectObject(this.baseMesh, false)[0];
    return hit?.uv ? { lon: hit.uv.x * 360 - 180, lat: hit.uv.y * 180 - 90 } : null;
  }

  /**
   * Körs före varje rendering. `animating` talar om att återkommande bilder behövs även när
   * kameran står still, till exempel för en vald händelses puls.
   */
  onFrame(cb, animating = null) { this.frameCallbacks.push({ cb, animating }); }

  /** Nästa bild behövs efter en tillstånds-, textur- eller kameraförändring. */
  invalidate() { this._needsRender = true; }

  _setTextureSize() {
    const w = this.canvas.clientWidth || innerWidth, h = this.canvas.clientHeight || innerHeight;
    const mobile = !this._flatView && w <= 760 && h > w;
    const width = mobile ? MOBILE_GLOBE_TEXTURE : GLOBE_TEXTURE;
    if (width === this._textureWidth) return false;
    // CanvasTexture behåller annars den tidigare GPU-storleken när canvasen växlar mellan
    // mobilglob och Platt vy. Frigör den gamla GPU-texturen före storleksbytet (#470).
    this.baseTex?.dispose();
    this.overlayTex?.dispose();
    this._textureWidth = width;
    for (const canvas of [this.baseCanvas, this.overlayCanvas]) { canvas.width = width; canvas.height = width / 2; }
    this.fadeCanvas = null;
    if (this._land) this.drawBase(this._land);
    this.detail?.reset();
    this.onTextureSizeChange?.(width, width / 2);
    return true;
  }

  _tick(t) {
    if (document.hidden) return;
    let moving = false;
    if (this._lift) {
      const l = this._lift, s = Math.min(1, (performance.now() - l.t0) / l.ms);
      const e = 1 - Math.pow(1 - s, 3);
      this.viewLiftPx = Math.round(l.from + (l.to - l.from) * e);
      if (s >= 1) this._lift = null;
      this._applyView();
      moving = true;
    }
    if (this._pose) {
      const done = performance.now() - this._pose.t0 >= this._pose.ms;
      this._applyPose(this._posed());
      if (done) {
        this._pose = null;
        // Tillbaka på den vanliga globen: exakt samma kamera som _resize ställer in, utan avrundningar från glidningen
        if (!this.region) {
          this.camera.fov = BASE_FOV;
          this.camera.position.set(0, CAM_Y, this.baseDist / this.zoom);
          this.camera.lookAt(0, CAM_Y, 0);
        }
        this._applyView();
        this._refreshArcs();
        this.onZoom?.(this.zoom);
      }
      moving = true;
    }
    if (this._fly) {
      const f = this._fly, s = Math.min(1, (performance.now() - f.t0) / f.ms);
      const e = s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2;
      this.group.rotation.x = f.fx + (f.tx - f.fx) * e;
      this.group.rotation.y = f.fy + (f.ty - f.fy) * e;
      if (s >= 1) {
        this._fly = null;
        this.canvas.dispatchEvent(new CustomEvent('hg:globe-flight', { detail: { phase: 'end', x: this.group.rotation.x, y: this.group.rotation.y } }));
      }
      moving = true;
    } else if (this.autoRotate && !this.calm) {
      this.group.rotation.y += 0.0009;
      moving = true;
    } else if (!this.calm && Math.abs(this._vel.x) + Math.abs(this._vel.y) > 1e-5) {
      this.group.rotation.y += this._vel.y;
      this.group.rotation.x = this._tilt(this.group.rotation.x + this._vel.x);
      this._vel.x *= 0.92; this._vel.y *= 0.92;
      moving = true;
    }
    const frameAnimating = !this.calm && this.frameCallbacks.some(f => f.animating?.());
    if (!moving && !this._needsRender && !frameAnimating) return;
    this._needsRender = false;
    const sig = `${this.group.rotation.x}|${this.group.rotation.y}|${this.camera.position.z}|${this.camera.fov}|${this.viewShiftPx}|${this.viewLiftPx}`;
    if (sig !== this._viewSig) {
      this._viewSig = sig;
      this.detail.touch();
      this._statusDue = true;
    }
    // Renderingsstatus för proven (som data-view i Platt vy): synfält, kamerans höjd och avstånd, förskjutningen och vridningen mot
    // polen (#1644). Skrivs när vyn har stannat, och under rörelse högst var 250:e ms, så att den vanliga globen inte får en
    // skrivning i sidan per bildruta
    if (this._statusDue && (!moving || t - (this._statusT ?? -1e9) > 250)) {
      this._statusDue = false;
      this._statusT = t;
      const c = this.camera, v = c.view;
      this.canvas.dataset.camera = [c.fov, c.position.y, c.position.z, v?.enabled ? v.offsetX : 0, v?.enabled ? v.offsetY : 0, this.group.rotation.x].map(n => Number(n.toFixed(4))).join(',');
    } else if (this._statusDue) this._needsRender = true; // en bild till när rörelsen har stannat, så att statusen blir den sista
    this.group.updateMatrixWorld();
    for (const { cb } of this.frameCallbacks) cb(t);
    this.renderer.render(this.scene, this.camera);
  }
}

function wrapPi(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
function slerp(a, b, s, ang) {
  if (ang < 1e-6) return a.clone();
  const sa = Math.sin(ang);
  return a.clone().multiplyScalar(Math.sin((1 - s) * ang) / sa).add(b.clone().multiplyScalar(Math.sin(s * ang) / sa));
}
