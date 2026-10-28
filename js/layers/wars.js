// Krig som spann (#27): ett krig är en händelse med start och slut (kind "war"),
// och slagen är händelser som pekar på kriget med partOf. Medan kriget pågår
// ritas krigsområdet som ett mjukt fält runt krigets plats och de slag som
// redan har utkämpats, så att man ser hur kriget sprids.
import { CAT, isVisibleReview } from '../model.js';

export class WarsLayer {
  constructor(events) {
    this.wars = events.filter(e => e.kind === 'war');
    this.enabled = true;
    this.active = []; // [{ war, points }]
  }

  update({ year, filters }) {
    this.active = [];
    if (!this.enabled) return this.active;
    for (const war of this.wars) {
      if (!filters.has(war.category) || !isVisibleReview(war.review)) continue;
      if (year < war.start || year > war.end) continue;
      const fought = war._battles.filter(b => b.start <= year && isVisibleReview(b.review));
      const points = [[war._lon, war._lat], ...fought.map(b => [b._lon, b._lat])];
      this.active.push({ war, points });
    }
    return this.active;
  }

  drawOverlay(ctx, W, H) {
    const k = W / 2048;
    ctx.save();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const { war, points } of this.active) {
      const px = points.map(([lon, lat]) => [(lon + 180) / 360 * W, (90 - lat) / 180 * H]);
      const hull = convexHull(px);
      const col = CAT[war.category]?.color ?? '#e5675a';
      // Ett fält runt punkterna: fyll höljet och rita en bred, rundad kant
      ctx.beginPath();
      hull.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.closePath();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = col; ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 34 * k; ctx.stroke();
      ctx.globalAlpha = 0.6;
      ctx.setLineDash([6 * k, 5 * k]); ctx.lineWidth = 1.4 * k;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
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
