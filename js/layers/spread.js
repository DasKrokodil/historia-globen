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
import { Z } from './registry.js';
import { loadSpread, t } from '../model.js';
import { ui } from '../i18n.js';

/** Lagrets post i registret (#338). Av som standard; den förinställda vyn "Människans spridning" slår på det. */
export function entry({ data, refresh }) {
  const layer = new SpreadLayer(data.byId, data.srcById);
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
    update: s => layer.update({ year: s.areaYear ?? s.wholeYear }),
    legend: s => ({ spread: s.faded.has('spread') || !layer.active.length ? null : layer.legendItems() }),
    drawOverlay: (ctx, W, H) => layer.drawOverlay(ctx, W, H),
  };
}

// Hur långt före slutet (i andelar av spannet) vågen är helt framritad; resten av spannet står den kvar
const GROW = 0.6;

export class SpreadLayer {
  constructor(byId = new Map(), srcById = {}) {
    this.byId = byId; this.srcById = srcById;
    this.items = null;
    this.enabled = false;
    this.active = []; // [{ item, grow }]
  }

  /** doc = data/spridning.json. Platserna (fyndplatser och platser ur Wikidata) blir [lon, lat]. */
  setData(doc) {
    this.colors = doc.colors ?? {};
    this.items = (doc.items ?? []).filter(i => i.review !== 'draft').map(i => ({
      ...i,
      _points: (i.places ?? []).map(p => this.coord(p)).filter(Boolean),
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
    if (!this.enabled || !this.items) return this.active;
    for (const item of this.items) {
      if (year < item.start || year > item.end) continue;
      const span = Math.max(1, item.end - item.start);
      const grow = item.kind === 'wave' ? Math.min(1, (year - item.start) / (span * GROW)) : 1;
      this.active.push({ item, grow });
    }
    return this.active;
  }

  /** Teckenförklaringen och textalternativet: allt som syns, med spann, säkerhet, not och källor. */
  legendItems() {
    return {
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

  /** Ett antaget område: ett mjukt hölje runt platserna, med radien radiusKm runt varje plats. */
  drawArea(ctx, W, H, k, item) {
    const pts = item._points;
    if (!pts.length) return null;
    const col = this.colors[item.group] ?? '#e9c46a';
    const ref = pts[0][0], ring = [];
    const rLat = (item.radiusKm ?? 600) / 111.2; // grader
    for (const [lon0, lat] of pts) {
      const lon = lon0 - 360 * Math.round((lon0 - ref) / 360);
      const rLon = rLat / Math.max(0.2, Math.cos(lat * Math.PI / 180));
      for (let a = 0; a < 16; a++) {
        const v = a * Math.PI / 8;
        ring.push([(lon + rLon * Math.cos(v) + 180) / 360 * W, (90 - Math.max(-89, Math.min(89, lat + rLat * Math.sin(v)))) / 180 * H]);
      }
    }
    const hull = convexHull(ring);
    const xs = hull.map(([x]) => x), shifts = [0];
    if (Math.min(...xs) < 0) shifts.push(W);
    if (Math.max(...xs) > W) shifts.push(-W);
    for (const dx of shifts) {
      ctx.beginPath();
      hull.forEach(([x, y], i) => i ? ctx.lineTo(x + dx, y) : ctx.moveTo(x + dx, y));
      ctx.closePath();
      ctx.globalAlpha = 0.14; ctx.fillStyle = col; ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = stripes(ctx, col, k); ctx.fill();
      // Streckad kant med mörk kontur under, så att den syns mot både land och hav (skissen på #1094, fynd 2)
      ctx.setLineDash([9 * k, 6 * k]);
      ctx.strokeStyle = 'rgba(16,22,30,0.55)'; ctx.lineWidth = 3.6 * k; ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 1.8 * k; ctx.stroke();
      ctx.setLineDash([]);
    }
    // Namnet mitt i området (höljets tyngdpunkt), så att det inte hamnar i ett grannområde
    let x = hull.reduce((a, [hx]) => a + hx, 0) / hull.length;
    const y = hull.reduce((a, [, hy]) => a + hy, 0) / hull.length;
    x = ((x % W) + W) % W;
    return { x, y, text: t(item.label ?? item.title), col };
  }

  /** En våg: en linje per gren, framritad till andelen grow av sin längd. */
  drawWave(ctx, W, H, k, item, grow) {
    const col = this.colors[item.group] ?? '#e9c46a';
    const sure = item.certainty === 'huvudvag';
    for (const path of item._paths) {
      // Längdgraderna vecklas ut som i lines.js, så att en gren över datumlinjen går den korta vägen
      let prev = null;
      const px = path.map(([lon, lat]) => {
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

  /** Områdenas namn, med ordet "tolkning" under, mitt i området. */
  drawLabels(ctx, W, k, labels) {
    const size = 13 * k, small = 10.5 * k, word = ui('spread.interpretation');
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    for (const { x, y, text, col } of labels) {
      const y1 = Math.max(size + small + 4 * k, y + small);
      for (const dx of x < W / 8 ? [0, W] : x > W * 7 / 8 ? [0, -W] : [0]) {
        ctx.lineWidth = 3.5 * k; ctx.strokeStyle = 'rgba(16,22,30,0.85)';
        ctx.font = `${size}px "IM Fell English", Georgia, serif`;
        ctx.strokeText(text, x + dx, y1 - small - 2 * k); ctx.fillStyle = col; ctx.fillText(text, x + dx, y1 - small - 2 * k);
        ctx.font = `italic ${small}px "IM Fell English", Georgia, serif`;
        ctx.strokeText(word, x + dx, y1); ctx.fillStyle = '#f1dfb4'; ctx.fillText(word, x + dx, y1);
      }
    }
  }
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
