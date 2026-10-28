// Lagertyp "område" (beslut 2): religioner. En religion visas som de riken där
// den var statsreligion, med rikets gränser från Cliopatria (data/religions.json).
// Områdena ritas randiga, så att de syns tydligt även ovanpå rikenas färger.
import { isVisibleReview } from '../model.js';

export class ReligionsLayer {
  constructor(religions) {
    this.religions = religions;
    this.enabled = false;
    this.active = []; // [{ religion, state, period }]
  }

  update({ year }) {
    this.active = [];
    if (!this.enabled) return this.active;
    for (const religion of this.religions) {
      for (const state of religion.states) {
        if (!isVisibleReview(state.review)) continue;
        const period = state.periods.find(p => year >= p.start && year <= p.end);
        if (period) this.active.push({ religion, state, period });
      }
    }
    return this.active;
  }

  drawOverlay(ctx, W, H) {
    if (!this.active.length) return;
    const X = lon => (lon + 180) / 360 * W, Y = lat => (90 - lat) / 180 * H;
    const k = W / 2048;
    ctx.save();
    ctx.lineJoin = 'round';
    for (const religion of this.religions) {
      const items = this.active.filter(a => a.religion === religion);
      if (!items.length) continue;
      ctx.beginPath();
      for (const { period } of items) {
        const g = period.geometry;
        for (const rings of g.type === 'Polygon' ? [g.coordinates] : g.coordinates) {
          for (const ring of rings) {
            ring.forEach(([lon, lat], i) => i ? ctx.lineTo(X(lon), Y(lat)) : ctx.moveTo(X(lon), Y(lat)));
            ctx.closePath();
          }
        }
      }
      ctx.fillStyle = stripes(ctx, religion.color, k);
      ctx.fill('evenodd');
      ctx.strokeStyle = religion.color;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 1.2 * k;
      ctx.setLineDash([5 * k, 3 * k]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
}

/** Diagonala ränder i religionens färg, som mönster att fylla områden med. */
function stripes(ctx, color, k) {
  const s = Math.round(10 * k);
  const c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d');
  g.strokeStyle = color; g.globalAlpha = 0.9; g.lineWidth = 3 * k;
  g.beginPath();
  for (const o of [-s, 0, s]) { g.moveTo(o, s); g.lineTo(o + s, 0); }
  g.stroke();
  return ctx.createPattern(c, 'repeat');
}
