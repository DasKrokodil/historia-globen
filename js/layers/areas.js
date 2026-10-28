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
      const period = polity.periods.find(p => year >= p.start && year <= p.end);
      if (period) this.active.push({ polity, period });
    }
    return this.active;
  }

  drawOverlay(ctx, W, H) {
    const X = lon => (lon + 180) / 360 * W, Y = lat => (90 - lat) / 180 * H;
    ctx.save();
    ctx.lineJoin = 'round';
    for (const { polity, period } of this.active) {
      const g = period.geometry;
      const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
      ctx.beginPath();
      for (const rings of polys) {
        for (const ring of rings) {
          ring.forEach(([lon, lat], i) => i ? ctx.lineTo(X(lon), Y(lat)) : ctx.moveTo(X(lon), Y(lat)));
          ctx.closePath();
        }
      }
      ctx.fillStyle = hexA(polity.color, 0.32);
      ctx.fill('evenodd');
      ctx.strokeStyle = hexA(polity.color, 0.95);
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    // Namnen sist, så att de hamnar ovanpå alla områden
    ctx.font = 'italic 20px "IM Fell English", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const { polity, period } of this.active) {
      const [lon, lat] = period.label;
      const name = t(polity.name);
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(16,22,30,0.75)';
      ctx.strokeText(name, X(lon), Y(lat));
      ctx.fillStyle = '#f6e7c4';
      ctx.fillText(name, X(lon), Y(lat));
    }
    ctx.restore();
  }
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
}
