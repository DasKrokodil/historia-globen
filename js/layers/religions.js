// Lagertyp "område" (beslut 2): religioner. En religion visas som de riken där
// den var officiell religion, med rikets gränser från Cliopatria (data/religions.json).
// Varje religion har en egen färg. Enskilda religioner kan döljas i undermenyn.
import { isVisibleReview } from '../model.js';

export class ReligionsLayer {
  constructor(religions) {
    this.religions = religions;
    this.enabled = false;
    this.hidden = new Set(); // religioner som är avbockade i undermenyn
    this.active = []; // [{ religion, state, period }]
  }

  update({ year }) {
    this.active = [];
    if (!this.enabled) return this.active;
    for (const religion of this.religions) {
      if (this.hidden.has(religion.id)) continue;
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
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = religion.color;
      ctx.fill('evenodd');
      ctx.globalAlpha = 1;
      ctx.strokeStyle = religion.color;
      ctx.lineWidth = 1.4 * k;
      ctx.stroke();
    }
    ctx.restore();
  }
}
