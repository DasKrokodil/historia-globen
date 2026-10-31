// Hur riken ritas när gränsen är osäker (#73) och hur inflytandet runt ett rike ritas (#75).
// Hjälpfunktioner till områdeslagret (areas.js). Allt ritas på den platta lagerbilden (beslut 1).
// Vad som är osäkert eller inflytande står i rikets data (uncertainBorder och influence, byggda av tools/riken.py).

const polygons = g => g.type === 'Polygon' ? [g.coordinates] : g.coordinates;

/** Lägger rikets gräns som en bana i ctx (alla delar och hål). */
export function tracePath(ctx, geometry, X, Y) {
  ctx.beginPath();
  for (const rings of polygons(geometry)) {
    for (const ring of rings) {
      ring.forEach(([lon, lat], i) => i ? ctx.lineTo(X(lon), Y(lat)) : ctx.moveTo(X(lon), Y(lat)));
      ctx.closePath();
    }
  }
}

/** Mjuk kant för ett rike med osäker gräns (#73). Banan ska redan vara lagd (tracePath).
 *  I stället för en skarp linje läggs tre breda, svaga linjer på varandra: tätast vid gränsen och
 *  allt svagare utåt, så att kanten flyter ut. Fyllningen är lite ljusare än för andra riken. */
export function softEdge(ctx, color, k) {
  ctx.fillStyle = rgba(color, 0.26);
  ctx.fill('evenodd');
  for (const [w, a] of SOFT) {
    ctx.strokeStyle = rgba(color, a);
    ctx.lineWidth = w * k;
    ctx.stroke();
  }
}
const SOFT = [[14, 0.06], [9, 0.08], [5, 0.1]]; // [linjebredd, styrka], från ytterst till innerst

/** Inflytandet som gäller det här året: [{ polity, item }] för de riken som syns (active från AreasLayer.update). */
export function influenceAt(active, year) {
  const out = [];
  for (const { polity } of active) {
    for (const item of polity.influence ?? []) if (year >= item.start && year <= item.end) out.push({ polity, item });
  }
  return out;
}

/** Inflytande (#75): lydriken och vasaller ritas med glesa prickar i rikets färg, nästan ingen fyllning och
 *  streckad kant, så att ett annat rike som ligger där syns igenom. Prickar i stället för snedstreck, eftersom
 *  krigsområdena redan är snedstreckade (#211). Ritas efter rikenas egna områden, så att det syns också där lydriket
 *  självt är ett rike på kartan (till exempel Hawaii under Storbritannien). */
export function drawInfluence(ctx, list, X, Y, k) {
  if (!list.length) return;
  ctx.save();
  for (const { polity, item } of list) {
    tracePath(ctx, item.geometry, X, Y);
    ctx.fillStyle = rgba(polity.color, 0.06);
    ctx.fill('evenodd');
    ctx.fillStyle = stipple(ctx, polity.color, k);
    ctx.fill('evenodd');
    ctx.setLineDash([5 * k, 4 * k]);
    ctx.strokeStyle = rgba(polity.color, 0.8);
    ctx.lineWidth = 1.2 * k;
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

// Ett prickmönster per färg och storlek, skapas en gång. Mönstret ligger fast i kartans koordinater.
// Två prickar per ruta, förskjutna, så att prickarna bildar ett jämnt rutmönster på snedden.
const stipples = new Map();
function stipple(ctx, color, k) {
  const key = `${color}|${k}`;
  if (!stipples.has(key)) {
    const s = Math.max(4, Math.round(9 * k)), r = Math.max(0.8, 1.2 * k);
    const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(s, s) : Object.assign(document.createElement('canvas'), { width: s, height: s });
    const g = c.getContext('2d');
    g.fillStyle = rgba(color, 0.8);
    for (const [x, y] of [[s / 4, s / 4], [s * 3 / 4, s * 3 / 4]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    stipples.set(key, ctx.createPattern(c, 'repeat'));
  }
  return stipples.get(key);
}

function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
}
