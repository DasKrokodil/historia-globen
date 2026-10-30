// Krig som spann (#27): ett krig är en händelse med start och slut (kind "war"),
// och slagen är händelser som pekar på kriget med partOf. Medan kriget pågår
// ritas krigsområdet som ett mjukt fält runt krigets plats och de slag som
// redan har utkämpats, så att man ser hur kriget sprids. Ligger slagen långt
// isär får varje krigsskådeplats ett eget område (#211).
import { CAT, isVisibleReview } from '../model.js';

export class WarsLayer {
  constructor(events) {
    this.wars = events.filter(e => e.kind === 'war');
    this.enabled = true;
    this.active = []; // [{ war, points }]
  }

  // span (valfritt): tiden som [början, slut], i fokusläget för korta krig datum ur edtf (#204)
  update({ year, filters, span = e => [e.start, e.end] }) {
    this.active = [];
    if (!this.enabled) return this.active;
    for (const war of this.wars) {
      if (!filters.has(war.category) || !isVisibleReview(war.review)) continue;
      const [s0, s1] = span(war);
      if (year < s0 || year > s1) continue;
      const fought = war._battles.filter(b => span(b)[0] <= year && isVisibleReview(b.review));
      const points = [[war._lon, war._lat], ...fought.map(b => [b._lon, b._lat])];
      this.active.push({ war, points });
    }
    return this.active;
  }

  drawOverlay(ctx, W, H) {
    const k = W / 2048;
    ctx.save();
    ctx.lineJoin = 'round';
    for (const { war, points } of this.active) {
      const col = CAT[war.category]?.color ?? '#e5675a';
      // Krigsskådeplatsen som i en historisk kartbok: ett avrundat område runt
      // krigets plats och slagen, med hel kantlinje och diagonal skraffering.
      // Ett område per krigsskådeplats, så att ett världskrig inte täcker halva jorden (#211)
      const r = 14 * k;
      for (const group of theatres(points)) {
        // Longituderna räknas nära gruppens första plats, så att en skådeplats över
        // datumlinjen (till exempel Midway och Guadalcanal) inte blir ett band runt jorden
        const ref = group[0][0], ring = [];
        for (const [lon, lat] of group) {
          const x = (lon - 360 * Math.round((lon - ref) / 360) + 180) / 360 * W, y = (90 - lat) / 180 * H;
          for (let a = 0; a < 12; a++) ring.push([x + r * Math.cos(a * Math.PI / 6), y + r * Math.sin(a * Math.PI / 6)]);
        }
        const hull = convexHull(ring);
        // Går området över bildens kant ritas det också en bildbredd åt andra hållet
        const xs = hull.map(([x]) => x), shifts = [0];
        if (Math.min(...xs) < 0) shifts.push(W);
        if (Math.max(...xs) > W) shifts.push(-W);
        for (const dx of shifts) {
          ctx.beginPath();
          hull.forEach(([x, y], i) => i ? ctx.lineTo(x + dx, y) : ctx.moveTo(x + dx, y));
          ctx.closePath();
          ctx.globalAlpha = 0.12; ctx.fillStyle = col; ctx.fill();
          ctx.globalAlpha = 1; ctx.fillStyle = hatch(ctx, col, k); ctx.fill();
          ctx.strokeStyle = '#7a1f17'; ctx.lineWidth = 4 * k; ctx.globalAlpha = 0.5; ctx.stroke();
          ctx.strokeStyle = col; ctx.lineWidth = 2.2 * k; ctx.globalAlpha = 1; ctx.stroke();
        }
      }
    }
    ctx.restore();
  }
}

// Platser som ligger närmare än så här (till närmaste plats i gruppen) hör till samma krigsskådeplats (#211)
const THEATRE_KM = 2000;
/** Avstånd i km längs jordytan mellan två [lon, lat]. */
function km([lon1, lat1], [lon2, lat2]) {
  const rad = Math.PI / 180, dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.min(1, Math.sqrt(a)));
}
/** Delar upp platserna i krigsskådeplatser: grupper där varje plats ligger inom THEATRE_KM från någon annan i gruppen. */
function theatres(points) {
  const groups = [];
  for (const p of points) {
    const near = groups.filter(g => g.some(q => km(p, q) <= THEATRE_KM));
    const merged = [p, ...near.flat()];
    for (const g of near) groups.splice(groups.indexOf(g), 1);
    groups.push(merged);
  }
  return groups;
}

/** Diagonal skraffering i krigets färg. */
function hatch(ctx, color, k) {
  const s = Math.max(6, Math.round(9 * k));
  const c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d');
  g.strokeStyle = color; g.globalAlpha = 0.75; g.lineWidth = Math.max(1, 1.6 * k);
  g.beginPath();
  for (const o of [-s, 0, s]) { g.moveTo(o, s); g.lineTo(o + s, 0); }
  g.stroke();
  return ctx.createPattern(c, 'repeat');
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
