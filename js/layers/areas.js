// Lagertyp "område" (beslut 2): riken vars utbredning ändras över tid.
// Varje rike har perioder (start–end) med en GeoJSON-polygon. Lagret väljer
// den period som gäller för nuvarande år och ritar den på den platta lagerbilden.
import { t, isVisibleReview } from '../model.js';

export class AreasLayer {
  constructor(polities) {
    this.polities = polities;
    this.enabled = true;
    this.active = []; // [{ polity, period }]
  }

  /** Returnerar de riken som finns just det här året. */
  update({ year }) {
    this.active = [];
    if (!this.enabled) return this.active;
    for (const polity of this.polities) {
      if (!isVisibleReview(polity.review)) continue;
      if (this.onlyGroup && polity.group !== this.onlyGroup) continue; // fokusläge för ett rike
      const period = polity.periods.find(p => year >= p.start && year <= p.end);
      if (period) this.active.push({ polity, period });
    }
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
      ctx.fillStyle = hexA(polity.color, 0.32);
      ctx.fill('evenodd');
      ctx.strokeStyle = hexA(polity.color, 0.95);
      ctx.lineWidth = 1.6 * k;
      ctx.stroke();
    }
    // Namnen sist, så att de hamnar ovanpå alla områden. Ryms namnet inte i
    // området skrivs det ovanför, med ett streck ner, så att området syns.
    const size = 16 * k;
    ctx.font = `italic ${size}px "IM Fell English", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const { polity, period } of this.active) {
      const name = t(polity.name);
      const b = bbox(period);
      const bw = X(b.maxLon) - X(b.minLon), bh = Y(b.minLat) - Y(b.maxLat);
      let x = X(period.label[0]), y = Y(period.label[1]);
      if (ctx.measureText(name).width > bw * 0.9 || bh < size * 2.5) {
        const top = Y(b.maxLat);
        y = top - size * 1.6;
        ctx.strokeStyle = 'rgba(246,231,196,0.8)';
        ctx.lineWidth = 1.2 * k;
        ctx.beginPath(); ctx.moveTo(x, top - 2 * k); ctx.lineTo(x, y + size * 0.6); ctx.stroke();
      }
      ctx.lineWidth = 3.5 * k;
      ctx.strokeStyle = 'rgba(16,22,30,0.8)';
      ctx.strokeText(name, x, y);
      ctx.fillStyle = '#f6e7c4';
      ctx.fillText(name, x, y);
    }
    ctx.restore();
  }
}

const polygons = g => g.type === 'Polygon' ? [g.coordinates] : g.coordinates;

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
