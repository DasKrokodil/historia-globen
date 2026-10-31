// Lagertyp "område" (beslut 2): riken vars utbredning ändras över tid.
// Varje rike har perioder (start–end) med en GeoJSON-polygon. Lagret väljer
// den period som gäller för nuvarande år och ritar den på den platta lagerbilden.
import { t, isVisibleReview } from '../model.js';
import { softEdge, influenceAt, drawInfluence } from './area-style.js';

export class AreasLayer {
  constructor(polities = []) {
    this.polities = polities;
    this.enabled = true;
    this.active = []; // [{ polity, period }]
    this.labelAlpha = 1; // och hur synliga de är (tonas ut vid kraftig zoom)
    this.labelScale = 1; // namnens storlek relativt grundstorleken (1 = som på platta bilden)
  }

  /** Rikena laddas ett i taget (en fil per rike) och läggs till när de har kommit. */
  add(polities) {
    for (const p of polities) if (!this.polities.includes(p)) this.polities.push(p);
  }

  /** Försvunna länder utan gräns i Cliopatria (#72), till exempel Neutrala Moresnet: grupper med vanished.point.
   *  De ritas som en punkt med namn under de år landet fanns enligt källorna (vanished.founded–dissolved). */
  setPoints(groups) {
    this.points = groups.filter(g => g.vanished?.point);
  }

  /** Returnerar de riken som finns just det här året. */
  update({ year }) {
    this.active = [];
    this.activePoints = [];
    this.influence = [];
    if (!this.enabled) return this.active;
    this.activePoints = (this.points ?? []).filter(g => (!this.onlyGroup || g.id === this.onlyGroup)
      && isVisibleReview(g.vanished.review) && year >= g.vanished.founded && year <= g.vanished.dissolved);
    for (const polity of this.polities) {
      if (!isVisibleReview(polity.review)) continue;
      if (this.onlyGroup && polity.group !== this.onlyGroup) continue; // fokusläge för ett rike
      const period = polity.periods.find(p => year >= p.start && year <= p.end);
      if (period) this.active.push({ polity, period });
    }
    this.influence = influenceAt(this.active, year); // lydriken och vasaller (#75)
    return this.active;
  }

  drawOverlay(ctx, W, H) {
    const X = lon => (lon + 180) / 360 * W, Y = lat => (90 - lat) / 180 * H;
    const k = W / 2048; // linjer och text ritas lika stora oavsett bildens upplösning
    ctx.save();
    ctx.lineJoin = 'round';
    for (const { polity, period } of this.active) {
      ctx.beginPath();
      for (const rings of polygons(period.geometry)) {
        for (const ring of rings) {
          ring.forEach(([lon, lat], i) => i ? ctx.lineTo(X(lon), Y(lat)) : ctx.moveTo(X(lon), Y(lat)));
          ctx.closePath();
        }
      }
      if (polity.uncertainBorder) { softEdge(ctx, polity.color, k); continue; } // osäker gräns: mjuk kant (#73)
      ctx.fillStyle = hexA(polity.color, 0.32);
      ctx.fill('evenodd');
      ctx.strokeStyle = hexA(polity.color, 0.95);
      ctx.lineWidth = 1.6 * k;
      ctx.stroke();
    }
    // Inflytandet (#75) ovanpå: glesa prickar, så att ett lydrike som själv är ett rike på kartan syns igenom
    drawInfluence(ctx, this.influence ?? [], X, Y, k);
    // Huvudlandet i ett utspritt välde (#74): samma färg men tätare fyllning och en kraftig kant
    // med mörk kontur, så att moderlandet syns bland kolonierna. Vilken del det är står i datan (period.homeland).
    for (const { polity, period } of this.active) {
      if (!period.homeland) continue;
      ctx.beginPath();
      for (const rings of polygons(period.homeland)) {
        for (const ring of rings) {
          ring.forEach(([lon, lat], i) => i ? ctx.lineTo(X(lon), Y(lat)) : ctx.moveTo(X(lon), Y(lat)));
          ctx.closePath();
        }
      }
      ctx.fillStyle = hexA(polity.color, 0.4);
      ctx.fill('evenodd');
      ctx.strokeStyle = 'rgba(16,22,30,0.85)';
      ctx.lineWidth = 5 * k;
      ctx.stroke();
      ctx.strokeStyle = polity.color;
      ctx.lineWidth = 2.6 * k;
      ctx.stroke();
    }
    // Namnen sist, så att de hamnar ovanpå alla områden. Ryms namnet inte i
    // området skrivs det ovanför, med ett streck ner, så att området syns.
    const size = 16 * k * this.labelScale;
    ctx.font = `italic ${size}px "IM Fell English", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = this.labelAlpha;
    const placed = []; // namnens rutor, så att huvudländernas namn inte hamnar på varandra (#74)
    const lead = (x1, y1, x2, y2) => {
      ctx.strokeStyle = 'rgba(246,231,196,0.8)';
      ctx.lineWidth = 1.2 * k * this.labelScale;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    };
    const write = (name, x, y) => {
      ctx.lineWidth = 3.5 * k * this.labelScale;
      ctx.strokeStyle = 'rgba(16,22,30,0.8)';
      ctx.strokeText(name, x, y);
      ctx.fillStyle = '#f6e7c4';
      ctx.fillText(name, x, y);
    };
    // Först de vanliga namnen, som de alltid har stått
    for (const { polity, period } of this.active) {
      if (period.homeland) continue;
      const name = t(polity.name);
      const b = bbox(period);
      const bw = X(b.maxLon) - X(b.minLon), bh = Y(b.minLat) - Y(b.maxLat);
      let x = X(period.label[0]), y = Y(period.label[1]);
      const w = ctx.measureText(name).width;
      if (w > bw * 0.9 || bh < size * 2.5) {
        const top = Y(b.maxLat);
        y = top - size * 1.6;
        lead(x, top - 2 * k, x, y + size * 0.6);
      }
      placed.push(box(x, y, w, size));
      write(name, x, y);
    }
    // Sedan huvudländerna: en mässingsstjärna i moderlandet och rikets namn strax ovanför (i stället för mitt
    // i den största kolonin). Ligger platsen på ett annat namn flyttas namnet upp eller ner, med ett streck till stjärnan.
    for (const { polity, period } of this.active) {
      if (!period.homeland) continue;
      const name = t(polity.name), w = ctx.measureText(name).width;
      const x = X(period.label[0]), y0 = Y(period.label[1]);
      star(ctx, x, y0, 7 * k * this.labelScale);
      const offsets = [-1.05, 1.15, -2.2, 2.3, -3.35, 3.45, -4.5, 4.6];
      const dy = offsets.find(o => !placed.some(p => overlaps(p, box(x, y0 + o * size, w, size)))) ?? offsets[0];
      const y = y0 + dy * size;
      if (Math.abs(dy) > 1.2) lead(x, y0 + Math.sign(dy) * 8 * k * this.labelScale, x, y - Math.sign(dy) * size * 0.55);
      placed.push(box(x, y, w, size));
      write(name, x, y);
    }
    // Försvunna länder utan gräns (#72): en ring med prick i landets färg och namnet till höger. Området är för
    // litet för kartan (Neutrala Moresnet var 3,5 km²), så punkten visar bara var det låg.
    for (const g of this.activePoints ?? []) {
      const [lon, lat] = g.vanished.point.coordinates;
      const x = X(lon), y = Y(lat), r = 5 * k * this.labelScale;
      ctx.beginPath(); ctx.arc(x, y, r * 1.9, 0, Math.PI * 2);
      ctx.lineWidth = 3 * k * this.labelScale; ctx.strokeStyle = 'rgba(16,22,30,0.85)'; ctx.stroke();
      ctx.lineWidth = 1.6 * k * this.labelScale; ctx.strokeStyle = g.color; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = g.color; ctx.fill();
      ctx.lineWidth = 1.2 * k * this.labelScale; ctx.strokeStyle = 'rgba(16,22,30,0.85)'; ctx.stroke();
      ctx.textAlign = 'left';
      write(t(g.name), x + r * 2.8, y);
      ctx.textAlign = 'center';
    }
    ctx.restore();
  }
}

const box = (x, y, w, h) => ({ x0: x - w / 2, x1: x + w / 2, y0: y - h * 0.55, y1: y + h * 0.55 });
const overlaps = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

const polygons = g => g.type === 'Polygon' ? [g.coordinates] : g.coordinates;

let brass = null; // --brass i css/style.css, läses första gången stjärnan ritas
const BRASS = () => (brass ??= getComputedStyle(document.documentElement).getPropertyValue('--brass').trim() || '#d6b06a');

/** En femuddig mässingsstjärna med mörk kant, märket för huvudlandet (#74). */
function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r * 0.45 : r;
    i ? ctx.lineTo(x + d * Math.cos(a), y + d * Math.sin(a)) : ctx.moveTo(x + d * Math.cos(a), y + d * Math.sin(a));
  }
  ctx.closePath();
  ctx.lineWidth = r * 0.45;
  ctx.strokeStyle = 'rgba(16,22,30,0.85)';
  ctx.stroke();
  ctx.fillStyle = BRASS();
  ctx.fill();
}

/** Områdets yttre gränser i grader, räknas ut en gång per period. */
function bbox(period) {
  if (!period._bbox) {
    const b = { minLon: 180, maxLon: -180, minLat: 90, maxLat: -90 };
    for (const rings of polygons(period.geometry)) {
      for (const [lon, lat] of rings[0]) {
        b.minLon = Math.min(b.minLon, lon); b.maxLon = Math.max(b.maxLon, lon);
        b.minLat = Math.min(b.minLat, lat); b.maxLat = Math.max(b.maxLat, lat);
      }
    }
    period._bbox = b;
  }
  return period._bbox;
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
}
