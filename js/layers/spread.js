// Människans spridning (#1094, del 3 av #11): antagna områden och vågor som tolkningar av källorna, i förhistorien.
// Lagertyp "område" och "linje" (beslut 2) i ett eget lager, eftersom areas.js är byggt för riken (Cliopatria).
// Datan står i data/spridning.json och laddas först när lagret slås på, som dagens gränser (borders.js).
//
// Osäkerhetens språk (beslutet på #1095, 2026-11-13): ett enda språk på kartan, aldrig bara färg.
//   - Antaget område: låg täckning, glesa snedstreck och streckad kant, med ordet "tolkning" under namnet.
//   - Våg: linje med mörk kontur. Huvudvåg med långa streck; möjlig eller omstridd våg med prickar och "?" vid spetsen.
//     Flera grenar i stället för en enda pil, och vågen ritas fram över sitt spann.
// Ytorna är inga gränser: ett område ritas som ett mjukt hölje runt namngivna platser (fyndplatser ur
// data/events.json eller platser med koordinat ur Wikidata), och vågen går mellan sådana platser. Spann,
// källor och "källorna skiljer sig" står i teckenförklaringen, som också är kartans textalternativ (#1106).
//
// Istidens kust (#1565, beslut 2026-11-14): cirka 80 000–7 500 år sedan klipps alla områden mot torrt land
// utan is i modellen bakom bildlagret Istidens kust (PaleoMIST 1.0), för det närmaste modellsteget. Masken är en egen,
// liten bild per steg (skivans fält mask i data/bildlager.json, 2048 × 1024, alfa = land utan is), som laddas bara när
// lagret är på och ett område syns i det spannet, och släpps annars. Det fungerar också när bildlagret är av. Vågornas
// linjer klipps inte: de visar riktning, inte väg. Utanför spannet klipps bara Afrika (clipLand) mot dagens land.
import { Z } from './registry.js';
import { imageRows, sliceAt } from './images.js';
import { loadSpread, t } from '../model.js';
import { ui } from '../i18n.js';

/** Lagrets post i registret (#338). Av som standard; den förinställda vyn "Människans spridning" slår på det. */
export function entry({ data, refresh }) {
  const layer = new SpreadLayer(data.byId, data.srcById, data.land, maskSlices(data.imageLayers));
  layer.onMask = () => refresh(); // masken laddad: rita om, nu klippt mot istidens kust
  let loading = null;
  return {
    id: 'spread', name: ui('layer.spread'), group: 'movement', layer, z: Z.spread,
    menu: { on: false, note: ui('layer.spreadNote') },
    fade: { own: () => false },
    enabled: s => s.layers.spread,
    // Första gången lagret syns laddas datan och källregistret (för källornas namn i teckenförklaringen)
    apply: s => {
      if (!s.on.spread || layer.items || loading) return;
      loading = loadSpread()
        .then(doc => { layer.setData(doc); refresh(); })
        .catch(err => { loading = null; console.error(err); });
    },
    update: s => {
      layer.labelScale = s.labels?.scale ?? 1; // namnen följer rikenas storleksregel (#1416)
      return layer.update({ year: s.areaYear ?? s.wholeYear });
    },
    legend: s => ({ spread: s.faded.has('spread') || !layer.active.length ? null : layer.legendItems() }),
    drawOverlay: (ctx, W, H) => layer.drawOverlay(ctx, W, H),
  };
}

/** Skivorna med mask (land utan is, #1565) i bildlagret Istidens kust (raden istidens-kust); annars en tom lista. */
export function maskSlices(doc) {
  return imageRows(doc).find(row => row.id === 'istidens-kust')?.slices.filter(x => x.mask) ?? [];
}

/** En mask som går att rita med: laddad och läsbar. */
const ready = image => !!image && !image.failed && image.complete && image.naturalWidth > 0;

// Hur långt före slutet (i andelar av spannet) vågen är helt framritad; resten av spannet står den kvar
const GROW = 0.6;

export class SpreadLayer {
  constructor(byId = {}, srcById = {}, land = null, masks = [], makeImage = () => new Image()) {
    this.byId = byId; this.srcById = srcById;
    this.maskSlices = masks; this.makeImage = makeImage; // makeImage byts ut i testerna, där Image inte finns
    // fil → bild; högst två: masken som gäller året och, medan den laddas, den förra laddade (shown), som ritas
    // under tiden så att ytorna inte blinkar ut över hav och is vid stegbyte under uppspelning och dragning
    this.masks = new Map();
    this.mask = null; // skivan vars mask gäller året, eller null
    this.shown = null; // filen för den senaste masken som var laddad, reserv tills den nya är klar
    this.onMask = () => {};
    this.work = null; // en återanvänd duk där ett område ritas och klipps mot masken
    this.land = land?.path ? { path: new Path2D(land.path), width: land.width, height: land.height } : null; // för clipLand
    this.edge = null; // en återanvänd duk för områdenas ytterkant
    this.items = null;
    this.enabled = false;
    this.active = []; // [{ item, grow }]
    this.labelScale = 1; // namnens storlek relativt grundstorleken, som rikenas namn (labels.scale, #1416)
  }

  /** doc = data/spridning.json. Platserna (fyndplatser och platser ur Wikidata) blir [lon, lat]. */
  setData(doc) {
    this.colors = doc.colors ?? {};
    this.items = (doc.items ?? []).filter(i => i.review !== 'draft').map(i => ({
      ...i,
      // Ett område är en eller flera delar (parts); varje del blir ett hölje, och delarna ritas som en yta.
      // Delar gör att en yta kan följa en båge (Iberien–Kaukasus–Altaj) utan att täcka det som ligger innanför.
      _parts: (i.parts ?? [i.places ?? []]).map(part => part.map(p => this.coord(p)).filter(Boolean)).filter(part => part.length),
      _paths: (i.paths ?? []).map(path => path.map(p => this.coord(p)).filter(Boolean)).filter(p => p.length > 1),
    }));
  }

  /** En plats: { event } tar händelsens koordinat (samma som markören), annars { coord: [lon, lat] }. */
  coord(p) {
    if (p.event) {
      const e = this.byId[p.event];
      return e ? [e._lon ?? e.location.coordinates[0], e._lat ?? e.location.coordinates[1]] : null;
    }
    return p.coord ?? null;
  }

  update({ year }) {
    this.active = [];
    if (!this.enabled || !this.items) { this.mask = null; this.loadMask(null); this.work = null; return this.active; }
    for (const item of this.items) {
      if (year < item.start || year > item.end) continue;
      const span = Math.max(1, item.end - item.start);
      const grow = item.kind === 'wave' ? Math.min(1, (year - item.start) / (span * GROW)) : 1;
      this.active.push({ item, grow });
    }
    // Masken behövs bara när ett område syns och året har ett modellsteg; annars släpps den och duken med den
    const slice = this.active.some(a => a.item.kind === 'area') ? sliceAt(this.maskSlices, year) : null;
    this.mask = slice?.mask ? slice : null;
    this.loadMask(this.mask?.mask);
    if (!this.mask) this.work = null;
    return this.active;
  }

  /**
   * Laddar masken file. Den förra laddade masken behålls som reserv tills file är klar och släpps först då; alla
   * andra släpps direkt. Utan file (inget modellsteg eller lagret av) släpps allt.
   */
  loadMask(file) {
    const current = this.masks.get(file);
    if (ready(current)) this.shown = file;
    const keep = new Set([file, ready(this.masks.get(this.shown)) ? this.shown : null]);
    if (!file) keep.clear();
    this._release(keep);
    if (!file || current) return;
    const image = this.makeImage();
    image.onload = () => {
      if (this.masks.get(file) !== image) return; // släppt under tiden
      // Klar: nu ersätter den reserven, om den fortfarande gäller året
      if (this.mask?.mask === file) { this.shown = file; this._release(new Set([file])); }
      this.onMask();
    };
    image.onerror = () => { image.failed = true; console.warn(`Spridningslagret kunde inte läsa masken ${file}`); };
    image.src = file;
    this.masks.set(file, image);
  }

  /** Släpper alla masker utom de i keep. */
  _release(keep) {
    for (const [f, image] of this.masks) {
      if (keep.has(f)) continue;
      image.onload = image.onerror = null; image.src = '';
      this.masks.delete(f);
    }
    if (!this.masks.has(this.shown)) this.shown = null;
  }

  /**
   * Masken att klippa med: årets mask när den är laddad, annars (medan den laddas) den förra laddade, och annars null
   * (inget modellsteg, ingen mask laddad än eller trasig: då som utan modell).
   */
  maskImage() {
    if (!this.mask) return null;
    const own = this.masks.get(this.mask.mask);
    if (ready(own)) return own;
    const prev = this.masks.get(this.shown);
    return ready(prev) ? prev : null;
  }

  /** Teckenförklaringen och textalternativet: allt som syns, med spann, säkerhet, not och källor. */
  legendItems() {
    // En rad om kusten när ett område syns: modellens kust och is, eller (utanför modellens spann) som förut
    const areas = this.active.some(a => a.item.kind === 'area');
    return {
      // Modellens kust bara när något faktiskt klipps (en mask är laddad), annars som utan modell
      coast: !areas ? '' : ui(this.maskImage() ? 'legend.spreadCoastModel' : 'legend.spreadCoastToday'),
      items: this.active.map(({ item }) => ({
        id: item.id, kind: item.kind, certainty: item.certainty, color: this.colors[item.group] ?? '#e9c46a',
        title: t(item.title), summary: t(item.summary), note: item.note ? t(item.note) : '',
        sources: (item.sources ?? []).map(id => this.srcById[id]).filter(Boolean).map(s => ({ title: s.title, url: s.url })),
      })),
    };
  }

  drawOverlay(ctx, W, H) {
    if (!this.enabled || !this.active.length) return;
    const k = W / 2048;
    ctx.save();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const labels = [];
    // Områdena först och vågorna ovanpå, så att en våg syns också där den går genom ett område
    for (const { item } of this.active) if (item.kind === 'area') labels.push(this.drawArea(ctx, W, H, k, item));
    for (const { item, grow } of this.active) if (item.kind === 'wave') this.drawWave(ctx, W, H, k, item, grow);
    this.drawLabels(ctx, W, k, labels.filter(Boolean));
    ctx.restore();
  }

  /**
   * Ett antaget område: ett mjukt hölje med radien radiusKm runt platserna i varje del, och alla delar som en yta.
   * Ytan fylls svagt och med snedstreck; ytterkanten är streckad med mörk kontur under, så att den syns mot både land och
   * hav (skissen på #1094, fynd 2). Kanterna där delarna överlappar suddas bort, så att bara ytterkanten syns.
   * Med en mask (istidens kust, #1565) klipps ytan, snedstrecken och kanten mot land utan is i modellen: ytan ritas på en
   * egen duk som sedan behåller bara det som masken täcker. Utan mask klipps ett område med clipLand mot dagens land
   * (data/land.json), och övriga områden klipps inte.
   */
  drawArea(ctx, W, H, k, item) {
    const col = this.colors[item.group] ?? '#e9c46a';
    const polys = item._parts.map(pts => padHull(pts, item.radiusKm ?? 600, W, H)).filter(h => h.length > 2);
    if (!polys.length) return null;
    const all = polys.flat(), xs = all.map(([x]) => x), ys = all.map(([, y]) => y), shifts = [0];
    if (Math.min(...xs) < 0) shifts.push(W);
    if (Math.max(...xs) > W) shifts.push(-W);
    const m = 8 * k, bx = Math.floor(Math.min(...xs) - m), by = Math.floor(Math.min(...ys) - m);
    const bw = Math.ceil(Math.max(...xs) + m) - bx, bh = Math.ceil(Math.max(...ys) + m) - by;
    const mask = this.maskImage();
    for (const dx of shifts) {
      // Det synliga: utan del på kartan (0…W) hoppas förskjutningen över
      if (bx + dx >= W || bx + dx + bw <= 0) continue;
      const path = new Path2D();
      for (const h of polys) { h.forEach(([x, y], i) => i ? path.lineTo(x + dx, y) : path.moveTo(x + dx, y)); path.closePath(); }
      // Med mask ritas allt på arbetsduken w, som har samma koordinater som kartan (förskjuten till rutan bx + dx, by)
      const w = mask ? this.workCanvas(bw, bh) : ctx;
      w.save();
      if (mask) { w.setTransform(1, 0, 0, 1, -bx - dx, -by); w.clearRect(bx + dx, by, bw, bh); }
      else if (item.clipLand) this.clipToLand(w, W, H);
      w.globalAlpha = 0.14; w.fillStyle = col; w.fill(path);
      w.globalAlpha = 1; w.fillStyle = stripes(w, col, k); w.fill(path);
      // Kanten ritas på en egen duk: dubbelt bred, och sedan suddas allt innanför ytan, så att bara ytterhalvan blir kvar
      const e = this.edgeCanvas(bw, bh);
      e.setTransform(1, 0, 0, 1, -bx - dx, -by);
      e.clearRect(bx + dx, by, bw, bh);
      e.save();
      if (!mask && item.clipLand) this.clipToLand(e, W, H);
      e.lineJoin = 'round'; e.lineCap = 'round';
      e.setLineDash([9 * k, 6 * k]);
      e.strokeStyle = 'rgba(16,22,30,0.55)'; e.lineWidth = 7.2 * k; e.stroke(path);
      e.strokeStyle = col; e.lineWidth = 3.6 * k; e.stroke(path);
      e.restore();
      e.globalCompositeOperation = 'destination-out'; e.fill(path); e.globalCompositeOperation = 'source-over';
      w.drawImage(e.canvas, 0, 0, bw, bh, bx + dx, by, bw, bh);
      if (mask) {
        // Behåll bara det som ligger på land utan is. Bara den del av masken som motsvarar rutan (inom kartan 0…W)
        // skalas upp, mjukt; utanför kartan blir duken tom, men den delen syns ändå inte.
        const x0 = Math.max(0, bx + dx), x1 = Math.min(W, bx + dx + bw), y0 = Math.max(0, by), y1 = Math.min(H, by + bh);
        const sx = mask.naturalWidth / W, sy = mask.naturalHeight / H;
        w.globalCompositeOperation = 'destination-in';
        w.drawImage(mask, x0 * sx, y0 * sy, (x1 - x0) * sx, (y1 - y0) * sy, x0, y0, x1 - x0, y1 - y0);
        w.restore();
        ctx.drawImage(w.canvas, 0, 0, bw, bh, bx + dx, by, bw, bh);
      } else w.restore();
    }
    // Namnet mitt i den största delen, så att det inte hamnar i ett grannområde
    const main = polys.reduce((a, b) => polyArea(b) > polyArea(a) ? b : a);
    let x = main.reduce((a, [hx]) => a + hx, 0) / main.length;
    const y = main.reduce((a, [, hy]) => a + hy, 0) / main.length;
    x = ((x % W) + W) % W;
    // Ordet under namnet följer säkerheten, som i listan: en hypotes kallas hypotes, annars tolkning
    return { x, y, text: t(item.label ?? item.title), col, word: ui(item.certainty === 'hypotes' ? 'spread.certainty.hypotes' : 'spread.interpretation') };
  }

  /** Klipper ctx mot dagens land (data/land.json, färdigprojicerad i width × height). */
  clipToLand(ctx, W, H) {
    if (!this.land) return;
    const sx = W / this.land.width, sy = H / this.land.height;
    ctx.scale(sx, sy); ctx.clip(this.land.path); ctx.scale(1 / sx, 1 / sy);
  }

  /** Den återanvända duken för ytterkanten, minst w × h. */
  edgeCanvas(w, h) {
    if (!this.edge || this.edge.canvas.width < w || this.edge.canvas.height < h) {
      const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });
      this.edge = c.getContext('2d');
    }
    return this.edge;
  }

  /** Arbetsduken för ett område som klipps mot masken, minst w × h; växer bara, och släpps när masken släpps. */
  workCanvas(w, h) {
    if (!this.work || this.work.canvas.width < w || this.work.canvas.height < h) {
      const cw = Math.max(w, this.work?.canvas.width ?? 0), ch = Math.max(h, this.work?.canvas.height ?? 0);
      const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(cw, ch) : Object.assign(document.createElement('canvas'), { width: cw, height: ch });
      this.work = c.getContext('2d');
    }
    return this.work;
  }

  /** En våg: en linje per gren, framritad till andelen grow av sin längd. */
  drawWave(ctx, W, H, k, item, grow) {
    const col = this.colors[item.group] ?? '#e9c46a';
    const sure = item.certainty === 'huvudvag';
    for (const path of item._paths) {
      // Längdgraderna vecklas ut som i lines.js, så att en gren över datumlinjen går den korta vägen
      // Varje sträcka följer storcirkeln (den kortaste vägen på klotet), inte en rak linje på den platta kartan
      let prev = null;
      const px = greatCircle(path).map(([lon, lat]) => {
        const l = prev === null ? lon : lon - 360 * Math.round((lon - prev) / 360);
        prev = l;
        return [(l + 180) / 360 * W, (90 - lat) / 180 * H];
      });
      const part = cut(px, grow);
      if (part.length < 2) continue;
      for (const dx of [0, W, -W]) {
        const xs = part.map(([x]) => x + dx);
        if (Math.max(...xs) < 0 || Math.min(...xs) > W) continue;
        ctx.beginPath();
        part.forEach(([x, y], i) => i ? ctx.lineTo(x + dx, y) : ctx.moveTo(x + dx, y));
        ctx.setLineDash(sure ? [14 * k, 7 * k] : [0.1, 7 * k]);
        ctx.strokeStyle = 'rgba(16,22,30,0.7)'; ctx.lineWidth = (sure ? 5.5 : 6) * k; ctx.stroke();
        ctx.strokeStyle = col; ctx.lineWidth = (sure ? 2.6 : 3.4) * k; ctx.stroke();
        ctx.setLineDash([]);
        // Spetsen: en pil, och för en möjlig eller omstridd våg ett frågetecken
        const [x1, y1] = part.at(-1), [x0, y0] = part.at(-2);
        const a = Math.atan2(y1 - y0, x1 - x0), s = 9 * k;
        ctx.beginPath();
        ctx.moveTo(x1 + dx, y1);
        ctx.lineTo(x1 + dx - s * Math.cos(a - 0.45), y1 - s * Math.sin(a - 0.45));
        ctx.lineTo(x1 + dx - s * Math.cos(a + 0.45), y1 - s * Math.sin(a + 0.45));
        ctx.closePath();
        ctx.fillStyle = col; ctx.strokeStyle = 'rgba(16,22,30,0.7)'; ctx.lineWidth = 1.5 * k;
        ctx.fill(); ctx.stroke();
        if (!sure) {
          ctx.font = `bold ${15 * k}px "IM Fell English", Georgia, serif`;
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.lineWidth = 3.5 * k; ctx.strokeStyle = 'rgba(16,22,30,0.85)';
          ctx.strokeText('?', x1 + dx + 6 * k, y1 - 8 * k);
          ctx.fillStyle = col; ctx.fillText('?', x1 + dx + 6 * k, y1 - 8 * k);
        }
      }
    }
  }

  /**
   * Områdenas namn, med ordet "tolkning" (eller "hypotes") under, mitt i området. Storleken följer samma regel som rikenas
   * namn (labels.scale i render.js, #1416), så att namnen går att läsa i Platt vy och på klotet i mobil. Ordet ritas alltid
   * (beslutet på #1416): det är det som skiljer en tolkad yta från en gräns, och det ritas sist så att det ligger överst.
   */
  drawLabels(ctx, W, k, labels) {
    // Samma grundstorlek som rikenas namn i areas.js (16). Ordet under har samma storlek, i kursiv, så att det går att
    // läsa lika bra som namnet (#1416); förut var det 10,5 och gick inte att läsa i mobil.
    const sc = this.labelScale ?? 1, size = 16 * k * sc, small = 16 * k * sc;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    for (const { x, y, text, col, word } of labels) {
      const y1 = Math.max(size + small + 4 * k * sc, y + small);
      for (const dx of x < W / 8 ? [0, W] : x > W * 7 / 8 ? [0, -W] : [0]) {
        ctx.lineWidth = 3.5 * k * sc; ctx.strokeStyle = 'rgba(16,22,30,0.85)';
        ctx.font = `${size}px "IM Fell English", Georgia, serif`;
        ctx.strokeText(text, x + dx, y1 - small - 2 * k * sc); ctx.fillStyle = col; ctx.fillText(text, x + dx, y1 - small - 2 * k * sc);
        ctx.font = `italic ${small}px "IM Fell English", Georgia, serif`;
        ctx.strokeText(word, x + dx, y1); ctx.fillStyle = '#f1dfb4'; ctx.fillText(word, x + dx, y1);
      }
    }
  }
}

/** Punkterna längs storcirkeln mellan varje par av platser, 24 steg per sträcka. [lon, lat] in och ut. */
function greatCircle(path) {
  const rad = Math.PI / 180, out = [path[0]];
  const vec = ([lon, lat]) => [Math.cos(lat * rad) * Math.cos(lon * rad), Math.cos(lat * rad) * Math.sin(lon * rad), Math.sin(lat * rad)];
  for (let i = 1; i < path.length; i++) {
    const a = vec(path[i - 1]), b = vec(path[i]);
    const w = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
    for (let s = 1; s <= 24; s++) {
      const f = s / 24;
      if (w < 1e-6) { out.push(path[i]); break; }
      const p = Math.sin((1 - f) * w) / Math.sin(w), q = Math.sin(f * w) / Math.sin(w);
      const [x, y, z] = [p * a[0] + q * b[0], p * a[1] + q * b[1], p * a[2] + q * b[2]];
      out.push([Math.atan2(y, x) / rad, Math.atan2(z, Math.hypot(x, y)) / rad]);
    }
  }
  return out;
}

/** Höljet (bildpunkter) runt platserna, med radien rKm runt varje plats. */
function padHull(pts, rKm, W, H) {
  const ref = pts[0][0], ring = [], rLat = rKm / 111.2; // grader
  for (const [lon0, lat] of pts) {
    const lon = lon0 - 360 * Math.round((lon0 - ref) / 360);
    const rLon = rLat / Math.max(0.2, Math.cos(lat * Math.PI / 180));
    for (let a = 0; a < 16; a++) {
      const v = a * Math.PI / 8;
      ring.push([(lon + rLon * Math.cos(v) + 180) / 360 * W, (90 - Math.max(-89, Math.min(89, lat + rLat * Math.sin(v)))) / 180 * H]);
    }
  }
  return convexHull(ring);
}

/** Ytan av en polygon (bildpunkter). */
function polyArea(h) {
  return Math.abs(h.reduce((a, [x, y], i) => { const [x2, y2] = h[(i + 1) % h.length]; return a + x * y2 - x2 * y; }, 0)) / 2;
}

/** Början av en linje i bildpunkter, till andelen f av hela längden. */
function cut(px, f) {
  if (f >= 1) return px;
  if (f <= 0) return [];
  const lens = px.slice(1).map((p, i) => Math.hypot(p[0] - px[i][0], p[1] - px[i][1]));
  let left = lens.reduce((a, b) => a + b, 0) * f;
  const out = [px[0]];
  for (let i = 0; i < lens.length; i++) {
    if (left >= lens[i]) { out.push(px[i + 1]); left -= lens[i]; continue; }
    const r = lens[i] ? left / lens[i] : 0;
    out.push([px[i][0] + (px[i + 1][0] - px[i][0]) * r, px[i][1] + (px[i + 1][1] - px[i][1]) * r]);
    break;
  }
  return out;
}

// Glesa snedstreck åt andra hållet än krigsområdenas (wars.js), ett mönster per färg och storlek
const patterns = new Map();
function stripes(ctx, color, k) {
  const key = `${color}|${k}`;
  if (!patterns.has(key)) {
    const s = Math.max(8, Math.round(14 * k));
    const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(s, s) : Object.assign(document.createElement('canvas'), { width: s, height: s });
    const g = c.getContext('2d');
    g.strokeStyle = color; g.globalAlpha = 0.5; g.lineWidth = Math.max(1, 1.2 * k);
    g.beginPath();
    for (const o of [-s, 0, s]) { g.moveTo(o, 0); g.lineTo(o + s, s); }
    g.stroke();
    patterns.set(key, ctx.createPattern(c, 'repeat'));
  }
  return patterns.get(key);
}

/** Konvext hölje (monotone chain) av punkter i bildkoordinater. */
function convexHull(pts) {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const q of p) { while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), q) <= 0) lower.pop(); lower.push(q); }
  for (const q of [...p].reverse()) { while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), q) <= 0) upper.pop(); upper.push(q); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}
