// Upptäcktsvyn (#101): ett bildlager (beslut 2) med gammal kartstil, som slås på i Lager.
//
// 1. Papperskartan (drawPaper): en åldrad karta som täcker grundkartan medan vyn är på. Haven i blekt
//    pergament, landet i mörkare pergament med bläckkust och vattenlinjer längs kusten, papperskorn, fläckar och
//    mörkare kanter. Den ritas en gång på en egen bild (i lagerbildens storlek) och läggs sedan bara på.
//    Grundkartan (baseCanvas) ändras inte. main.js lägger den underst, under riken och religioner.
// 2. Dimman: ett i princip ogenomskinligt "okänt"-lager i pergamentton över hela kartan, med papperskorn och
//    texten "Terra incognita" på några stora ytor. Kring varje etapp i data/routes som har börjat lyfts dimman i
//    en korridor med mjuk kant längs den del som linjelagret har ritat (LinesLayer.reached), och dimmans kant
//    skrafferas med bläck som på gamla kartor. Det som har lyfts förblir lyft senare år. Dimman visar alltså
//    bara vad resorna och vägarna i datan har nått, inte vad världen kände till; det säger raden i datafilen.
//    Händelsernas markörer ligger som 3D-objekt ovanpå och syns även i dimman.
// 3. Portolanlinjer: tunna bläcklinjer i alla riktningar ut från varje kompassros, ovanpå dimman.
// 4. Dekorationer: havsmonster och kompassrosor ur gamla kartor (public domain) mitt i öppna hav. Monster med
//    fade tonas bort när en lyft korridor kommer nära (inom bildens radie), så att utsmyckningen tunnas ut när
//    haven blir kända.
//
// Allt kommer ur data/upptackt.json (texter, platser, storlekar, styrkor och korridorens bredd) och färgerna ur
// CSS-variablerna --discovery-*. Allt ritas på den platta lagerbilden (beslut 1), så att Platt vy visar samma sak.
// Papperskartan ritas en gång. Dimman ritas på en egen bild i halv upplösning som bara görs om när året (eller
// vägarna) ändras; att lyfta den görs med destination-out.
import { t } from '../model.js';
import { traceWrapped, segDist } from './lines.js';

const SCALE = 0.5;           // dimbildens upplösning i förhållande till lagerbilden
const FINE_STEP = 0.01;      // i fokusläget för korta krig görs dimman om högst var hundradels år
const cssVar = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
const clamp01 = v => Math.max(0, Math.min(1, v));
const CLEAR = 'rgba(255,255,255,0)'; // genomskinligt vitt: gör ingenting med multiply

/** Slumptal med frö (mulberry32), så att korn och fläckar hamnar på samma ställe varje gång. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Papperskorn: en bricka med brus i gråskala som går att upprepa utan skarvar (varje bildpunkt för sig). */
function grainTile(size, seed) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d'), img = g.createImageData(size, size), r = rng(seed);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 255 - Math.round(Math.pow(r(), 3) * 120);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

/** Skraffering: tunna diagonala bläckstreck på en bricka som upprepas. */
function hatchTile(size, ink) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.strokeStyle = ink; g.lineWidth = Math.max(1, size / 6);
  for (const o of [-size, 0, size]) { g.beginPath(); g.moveTo(o, size); g.lineTo(o + size, 0); g.stroke(); }
  return c;
}

export class DiscoveryLayer {
  constructor(doc = null, land = null) {
    this.enabled = false;
    this.doc = doc;
    this.land = land;         // grundkartans land (data/land.json), ritas om i papperskartans färger
    this.images = new Map();  // fil → Image, laddas första gången lagret slås på
    this.onImage = () => {};  // en bild har laddats klart: lagret behöver ritas om
    this.fogKey = null;
    this.fonts = false;       // typsnittet för "Terra incognita" har laddats (annars ritas texten om när det kommer)
  }

  _loadImages() {
    for (const d of this.doc?.decorations ?? []) {
      if (this.images.has(d.file)) continue;
      const img = new Image();
      img.onload = () => this.onImage();
      img.onerror = () => console.warn(`Upptäcktsvyn: bilden ${d.file} kunde inte laddas`);
      img.src = d.file;
      this.images.set(d.file, img);
    }
    if (!this.fonts && document.fonts) {
      document.fonts.load('40px "IM Fell English"').then(() => { this.fonts = true; this.fogKey = null; this.onImage(); }).catch(() => {});
    }
  }

  /** state: year och fine som för LinesLayer, lines = linjelagret (vars vägar lyfter dimman). */
  update({ year, fine = false, lines }) {
    if (!this.enabled || !this.doc) return;
    this._loadImages();
    const now = fine ? Math.floor(year / FINE_STEP) * FINE_STEP : Math.floor(year);
    const key = `${now}|${fine}|${lines?.routes.length ?? 0}|${this.fonts}`;
    if (key !== this.fogKey) {
      this.fogKey = key;
      this.reached = lines ? lines.reached({ year: now, fine }) : [];
      this.fades = new Map((this.doc.decorations ?? []).filter(d => d.fade).map(d => [d.id, this._fade(d)]));
      this.fogDirty = true;
    }
  }

  /** Papperskornen som mönster; brickan görs en gång. */
  _grain(c) {
    if (!this.grainCanvas) this.grainCanvas = grainTile(256, this.doc.paper?.seed ?? 1539);
    return c.createPattern(this.grainCanvas, 'repeat');
  }

  /** Ritar den åldrade papperskartan (W × H är lagerbildens storlek) på den egna bilden. Görs en gång per storlek. */
  _drawPaperCanvas(W, H) {
    const p = this.doc.paper ?? {};
    if (!this.paperCanvas) this.paperCanvas = document.createElement('canvas');
    const pc = this.paperCanvas;
    pc.width = W; pc.height = H;
    const c = pc.getContext('2d');
    const deg = W / 360, ink = cssVar('--discovery-ink', '#5b4626');
    const land = this.land?.path ? new Path2D(this.land.path) : null;
    const kx = land ? W / this.land.width : 1, ky = land ? H / this.land.height : 1;
    // Haven i blekt pergament
    c.fillStyle = cssVar('--discovery-sea', '#d3cba6');
    c.fillRect(0, 0, W, H);
    if (land) {
      c.save();
      c.scale(kx, ky);
      // Vattenlinjer längs kusten: allt smalare och mörkare band i bläck, som på gravyrernas kuster
      const wl = p.waterLines ?? {};
      const n = wl.count ?? 3, wDeg = wl.widthDeg ?? 1.2;
      c.strokeStyle = ink; c.lineJoin = 'round';
      for (let i = 0; i < n; i++) {
        c.globalAlpha = clamp01(wl.opacity ?? 0.1) * (i + 1) / n;
        c.lineWidth = wDeg * deg * (n - i) / n / kx;
        c.stroke(land);
      }
      c.globalAlpha = 1;
      c.fillStyle = cssVar('--discovery-land', '#c8a66a');
      c.fill(land);
      c.restore();
    }
    // Fläckar i pappret, med frö så att de alltid hamnar på samma ställe
    const r = rng(p.seed ?? 1539);
    const stain = cssVar('--discovery-stain', '#a07a44');
    c.globalCompositeOperation = 'multiply';
    for (let i = 0; i < (p.stains ?? 0); i++) {
      const x = r() * W, y = H * (0.1 + r() * 0.8), rad = (6 + r() * 26) * deg;
      const g = c.createRadialGradient(x, y, rad * 0.1, x, y, rad);
      g.addColorStop(0, stain); g.addColorStop(0.6, stain); g.addColorStop(1, CLEAR);
      c.globalAlpha = clamp01(p.stainStrength ?? 0.1) * (0.4 + r() * 0.6);
      c.fillStyle = g;
      for (const dx of [-W, 0, W]) {
        if (x + dx + rad < 0 || x + dx - rad > W) continue;
        c.save(); c.translate(dx, 0); c.fillRect(x - rad, y - rad, rad * 2, rad * 2); c.restore();
      }
    }
    // Papperskorn
    c.globalAlpha = clamp01(p.grain ?? 0.2);
    c.fillStyle = this._grain(c);
    c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'source-over';
    // Bläckkusten, skarp ovanpå kornen
    if (land) {
      c.save();
      c.scale(kx, ky);
      c.globalAlpha = 0.85; c.strokeStyle = ink; c.lineJoin = 'round';
      c.lineWidth = (p.coastPx ?? 2.2) / kx;
      c.stroke(land);
      c.restore();
    }
    // Mörkare kanter: mot polerna och (svagare) mot datumlinjen, där kartan slutar i Platt vy
    const v = clamp01(p.vignette ?? 0.3), edge = cssVar('--discovery-edge', '#6b4a22');
    if (v > 0) {
      c.globalCompositeOperation = 'multiply';
      const gy = c.createLinearGradient(0, 0, 0, H);
      gy.addColorStop(0, edge); gy.addColorStop(0.18, CLEAR); gy.addColorStop(0.82, CLEAR); gy.addColorStop(1, edge);
      c.globalAlpha = v; c.fillStyle = gy; c.fillRect(0, 0, W, H);
      const gx = c.createLinearGradient(0, 0, W, 0);
      gx.addColorStop(0, edge); gx.addColorStop(0.07, CLEAR); gx.addColorStop(0.93, CLEAR); gx.addColorStop(1, edge);
      c.globalAlpha = v * clamp01(p.vignetteSides ?? 0.5); c.fillStyle = gx; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'source-over';
    }
    c.globalAlpha = 1;
  }

  /** Den åldrade papperskartan, underst på lagerbilden (main.js anropar den före riken och religioner). */
  drawPaper(ctx, W, H) {
    if (!this.enabled || !this.doc) return;
    if (!this.paperCanvas || this.paperCanvas.width !== W || this.paperCanvas.height !== H) this._drawPaperCanvas(W, H);
    ctx.drawImage(this.paperCanvas, 0, 0);
  }

  /** Ritar dimman (W × H är lagerbildens storlek) på den egna bilden. */
  _drawFog(W, H) {
    const fog = this.doc.fog ?? {};
    const w = Math.round(W * SCALE), h = Math.round(H * SCALE);
    if (!this.fogCanvas || this.fogCanvas.width !== w || this.fogCanvas.height !== h) {
      this.fogCanvas = document.createElement('canvas');
      this.fogCanvas.width = w; this.fogCanvas.height = h;
    }
    const c = this.fogCanvas.getContext('2d');
    const ink = cssVar('--discovery-ink', '#5b4626'), deg = w / 360;
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.clearRect(0, 0, w, h);
    c.fillStyle = cssVar('--discovery-fog', '#d4cfbd');
    c.fillRect(0, 0, w, h);
    // Papperskorn i dimman
    c.globalCompositeOperation = 'multiply';
    c.globalAlpha = clamp01(fog.grain ?? 0.2);
    c.fillStyle = this._grain(c);
    c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = 'source-over';
    // Terra incognita, i bläck på dimman
    c.globalAlpha = 0.6;
    c.fillStyle = ink;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const l of fog.labels ?? []) {
      const [lon, lat] = l.at;
      c.font = `italic ${Math.round((l.size ?? 4) * deg)}px "IM Fell English", Georgia, serif`;
      c.fillText(t(l.text), (lon + 180) * deg, (90 - lat) / 180 * h);
    }
    const reached = this.reached ?? [];
    const each = () => { for (const pts of reached) traceWrapped(c, pts.length > 1 ? pts : [pts[0], pts[0]], w, h, ctx => ctx.stroke()); };
    c.lineJoin = 'round'; c.lineCap = 'round';
    const width = (fog.corridorDeg ?? 7) * deg, soft = fog.soften ?? 0.6;
    // Skrafferad kant: bläckstreck i ett band utanför korridoren, som dimmans kant på gamla kartor
    const hatch = clamp01(fog.hatch ?? 0);
    if (hatch > 0 && reached.length) {
      c.globalAlpha = hatch;
      c.strokeStyle = c.createPattern(hatchTile(Math.max(4, Math.round((fog.hatchSpacingDeg ?? 0.6) * deg)), ink), 'repeat');
      c.lineWidth = width * (1 + soft) + 2 * (fog.hatchDeg ?? 1.2) * deg;
      each();
    }
    // Korridorerna: mjuk kant i flera steg (bredare och svagare) och sedan själva korridoren
    c.globalCompositeOperation = 'destination-out';
    c.strokeStyle = '#000';
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      c.lineWidth = width * (1 + soft * (1 - i / steps));
      c.globalAlpha = i === steps ? 1 : 0.25;
      each();
    }
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    this.fogDirty = false;
  }

  /**
   * Hur synlig en dekoration med fade är, 0 till 1: den tonas bort när den närmaste lyfta korridorens kant kommer
   * innanför bildens radie och är borta när korridoren går genom bildens inre tredjedel.
   */
  _fade(d) {
    const r = d.width / 2, half = (this.doc.fog?.corridorDeg ?? 7) / 2;
    let near = Infinity;
    for (const pts of this.reached ?? []) {
      for (let i = 1; i < pts.length; i++) near = Math.min(near, segDist(d.at, pts[i - 1], pts[i]));
      if (pts.length === 1) near = Math.min(near, segDist(d.at, pts[0], pts[0]));
    }
    return clamp01((near - half - r / 3) / (r * 2 / 3));
  }

  /**
   * Portolanlinjer ut från varje kompassros (dekoration med rhumb: true): de åtta huvudvindarna i bläck,
   * halvvindarna i grönt och kvartsvindarna i rött, som på 1500-talets sjökort.
   */
  _drawRhumbs(ctx, W, H) {
    const rh = this.doc.paper?.rhumb;
    if (!rh) return;
    const n = Math.max(8, Math.round((rh.directions ?? 32) / 8) * 8), deg = W / 360, len = (rh.lengthDeg ?? 70) * deg;
    const cols = [cssVar('--discovery-ink', '#5b4626'), cssVar('--discovery-rhumb-half', '#4d6b3c'), cssVar('--discovery-rhumb-quarter', '#9a3b2b')];
    const step = n / 8;
    ctx.lineWidth = rh.widthPx ?? 1.6;
    for (const d of this.doc.decorations ?? []) {
      if (!d.rhumb) continue;
      const x0 = (d.at[0] + 180) * deg, y0 = (90 - d.at[1]) / 180 * H;
      for (let i = 0; i < n; i++) {
        const rank = i % step === 0 ? 0 : (i % (step / 2) === 0 ? 1 : 2);
        const a = i / n * Math.PI * 2;
        ctx.strokeStyle = cols[rank];
        ctx.globalAlpha = clamp01(rh.opacity ?? 0.45) * (rank === 0 ? 1 : 0.8);
        const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
        for (const dx of [-W, 0, W]) {
          if (Math.max(x0, x1) + dx < 0 || Math.min(x0, x1) + dx > W) continue;
          ctx.beginPath(); ctx.moveTo(x0 + dx, y0); ctx.lineTo(x1 + dx, y1); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  drawOverlay(ctx, W, H) {
    if (!this.enabled || !this.doc) return;
    if (this.fogDirty || !this.fogCanvas) this._drawFog(W, H);
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.globalAlpha = clamp01(this.doc.fog?.opacity ?? 0.95);
    ctx.drawImage(this.fogCanvas, 0, 0, W, H);
    ctx.globalAlpha = 1;
    this._drawRhumbs(ctx, W, H);
    const deg = W / 360;
    for (const d of this.doc.decorations ?? []) {
      const img = this.images.get(d.file);
      if (!img?.complete || !img.naturalWidth) continue;
      const alpha = d.fade ? this.fades?.get(d.id) ?? 1 : 1;
      if (alpha <= 0.02) continue;
      const w = d.width * deg, h = w * img.naturalHeight / img.naturalWidth;
      const x = (d.at[0] + 180) * deg - w / 2, y = (90 - d.at[1]) / 180 * H - h / 2;
      ctx.globalAlpha = 0.92 * alpha;
      ctx.drawImage(img, x, y, w, h);
      if (x < 0) ctx.drawImage(img, x + W, y, w, h);
      if (x + w > W) ctx.drawImage(img, x - W, y, w, h);
    }
    ctx.restore();
  }
}
