// Upptäcktsvyn (#101): ett bildlager (beslut 2) med gammal kartstil, som slås på i Lager.
//
// 1. Dimman: ett halvgenomskinligt "okänt"-lager i pergamentton över hela kartan, med texten "Terra incognita"
//    på några stora ytor. Kring varje etapp i data/routes som har börjat lyfts dimman i en korridor längs den del
//    som linjelagret har ritat (LinesLayer.reached). Det som har lyfts förblir lyft senare år. Dimman visar alltså
//    bara vad resorna och vägarna i datan har nått, inte vad världen kände till; det säger raden i datafilen.
// 2. Dekorationer: havsmonster och kompassrosor ur gamla kartor (public domain) mitt i öppna hav. Monster med
//    fade tonas bort när en lyft korridor kommer nära (inom bildens radie), så att utsmyckningen tunnas ut när
//    haven blir kända.
//
// Allt kommer ur data/upptackt.json (texter, platser, storlekar, dimmans styrka och korridorens bredd) och ritas
// på den platta lagerbilden (beslut 1), så att Platt vy visar samma sak. Dimman ritas på en egen bild i halv
// upplösning som bara görs om när året (eller vägarna) ändras; att lyfta den görs med destination-out.
import { t } from '../model.js';
import { traceWrapped, segDist } from './lines.js';

const SCALE = 0.5;           // dimbildens upplösning i förhållande till lagerbilden
const FINE_STEP = 0.01;      // i fokusläget för korta krig görs dimman om högst var hundradels år
const cssVar = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

export class DiscoveryLayer {
  constructor(doc = null) {
    this.enabled = false;
    this.doc = doc;
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

  /** Ritar dimman (W × H är lagerbildens storlek) på den egna bilden. */
  _drawFog(W, H) {
    const fog = this.doc.fog ?? {};
    const w = Math.round(W * SCALE), h = Math.round(H * SCALE);
    if (!this.fogCanvas) {
      this.fogCanvas = document.createElement('canvas');
      this.fogCanvas.width = w; this.fogCanvas.height = h;
    }
    const c = this.fogCanvas.getContext('2d');
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, w, h);
    c.globalAlpha = Math.max(0, Math.min(1, fog.opacity ?? 0.6));
    c.fillStyle = cssVar('--discovery-fog', '#d4cfbd');
    c.fillRect(0, 0, w, h);
    // Terra incognita, i bläck på dimman
    c.globalAlpha = 0.55;
    c.fillStyle = cssVar('--discovery-ink', '#5b4626');
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const deg = w / 360;
    for (const l of fog.labels ?? []) {
      const [lon, lat] = l.at;
      c.font = `italic ${Math.round((l.size ?? 4) * deg)}px "IM Fell English", Georgia, serif`;
      c.fillText(t(l.text), (lon + 180) * deg, (90 - lat) / 180 * h);
    }
    // Korridorerna: mjuk kant (bredare och svagare) och sedan själva korridoren
    c.globalCompositeOperation = 'destination-out';
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.strokeStyle = '#000';
    const width = (fog.corridorDeg ?? 5) * deg, soft = fog.soften ?? 0.6;
    for (const [mult, alpha] of [[1 + soft, 0.3], [1 + soft / 2, 0.45], [1, 1]]) {
      c.lineWidth = width * mult; c.globalAlpha = alpha;
      for (const pts of this.reached ?? []) traceWrapped(c, pts.length > 1 ? pts : [pts[0], pts[0]], w, h, ctx => ctx.stroke());
    }
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    this.fogDirty = false;
  }

  /**
   * Hur synlig en dekoration med fade är, 0 till 1: den tonas bort när den närmaste lyfta korridorens kant kommer
   * innanför bildens radie och är borta när korridoren går genom bildens inre tredjedel.
   */
  _fade(d) {
    const r = d.width / 2, half = (this.doc.fog?.corridorDeg ?? 5) / 2;
    let near = Infinity;
    for (const pts of this.reached ?? []) {
      for (let i = 1; i < pts.length; i++) near = Math.min(near, segDist(d.at, pts[i - 1], pts[i]));
      if (pts.length === 1) near = Math.min(near, segDist(d.at, pts[0], pts[0]));
    }
    return Math.max(0, Math.min(1, (near - half - r / 3) / (r * 2 / 3)));
  }

  drawOverlay(ctx, W, H) {
    if (!this.enabled || !this.doc) return;
    if (this.fogDirty || !this.fogCanvas) this._drawFog(W, H);
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.fogCanvas, 0, 0, W, H);
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
