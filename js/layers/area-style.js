// Hur riken ritas när gränsen är osäker (#73) och hur inflytandet runt ett rike ritas (#75).
// Hjälpfunktioner till områdeslagret (areas.js). Allt ritas på den platta lagerbilden (beslut 1).
// Vad som är osäkert eller inflytande står i rikets data (uncertainBorder och influence, byggda av tools/riken.py).

const polygons = g => g.type === 'Polygon' ? [g.coordinates] : g.coordinates;

/** Är segmentet sömmen där datan delats vid datumlinjen (#1268, #1227)? Båda ändpunkterna ligger på −180 eller 180. Samma regel
 *  som `edgeKm` i place-geo.js. Sömmen är ingen gräns: fyllningen behöver den, men strokningen ska hoppa över den. */
const isSeam = (a, b) => Math.abs(a[0]) === 180 && Math.abs(b[0]) === 180;

const seamCache = new WeakMap();
/** Har geometrin (Polygon eller MultiPolygon) minst ett sömsegment? Sparas per geometri, så att omritningen inte räknar om. */
export function hasSeam(geometry) {
  let has = seamCache.get(geometry);
  if (has === undefined) {
    has = polygons(geometry).some(rings => rings.some(ring => ring.some((p, i) => i && isSeam(ring[i - 1], p))));
    seamCache.set(geometry, has);
  }
  return has;
}

/**
 * Ligger punkten (lon, lat) på områdets yta? Strålmetoden över varje polygon i geometrin: yttre ringen, minus hålen.
 * Längden följer ringen över datumlinjen på samma sätt som traceRing, och punkten prövas också ett varv åt vardera hållet.
 * Områdeslagret använder den för en medalj som flyttas från label-punkten: den ska stå på rikets egen yta, inte bara inom
 * ytterrutan (areas.js, _layout).
 */
export function covers(geometry, lon, lat) {
  const inside = ring => {
    let prev = null;
    const pts = ring.map(([x, y]) => {
      const l = prev === null ? x : x - 360 * Math.round((x - prev) / 360);
      prev = l;
      return [l, y];
    });
    return [0, 360, -360].some(shift => {
      let hit = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > lat) !== (yj > lat) && lon + shift < (xj - xi) * (lat - yi) / (yj - yi) + xi) hit = !hit;
      }
      return hit;
    });
  };
  return polygons(geometry).some(rings => inside(rings[0]) && !rings.slice(1).some(inside));
}

/**
 * Lägger en ring (en yttre gräns eller ett hål) som en del av banan i ctx (#1097). Ringen vecklas ut som linjerna i
 * lines.js (unwrap): varje punkt läggs på den längdgrad som ligger närmast den förra, så att en ring som korsar
 * datumlinjen (180°) går den korta vägen över den och inte tvärs över hela kartan. Hamnar den utvecklade ringen utanför
 * −180…180 läggs den en gång till, ett varv förskjuten, så att båda kanterna av den platta bilden får sin del; det som
 * hamnar utanför bilden klipps bort. X och Y räknar längd- och breddgrad till bildpunkter (X är linjär i längdgraden).
 *
 * `skipSeams` (#1227) lägger ringen som öppna linjer för strokning: segment där båda ändpunkterna ligger på ±180 (sömmen
 * där datan delats vid datumlinjen) hoppas över, så att sömmen inte syns som en linje längs kartans kant (på globen en
 * prickad linje längs 180°-meridianen). En ring utan söm läggs som förut, sluten. Banan fylls inte med skipSeams:
 * fyllningen läggs alltid utan, så att den är oförändrad.
 */
export function traceRing(ctx, ring, X, Y, skipSeams = false) {
  let seq = ring, seam = null;
  if (skipSeams && ring.some((p, i) => i && isSeam(ring[i - 1], p))) {
    // Börja efter en söm, så att varje linje är sammanhängande (ringen är sluten: sista punkten är den första)
    const closed = ring.length > 1 && ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1];
    const core = closed ? ring.slice(0, -1) : ring, n = core.length;
    const s = core.findIndex((p, i) => isSeam(core[(i + n - 1) % n], p));
    seq = [...core.slice(s), ...core.slice(0, s), core[s]];
    seam = seq.map((p, i) => i > 0 && isSeam(seq[i - 1], p));
  }
  let prev = null, min = Infinity, max = -Infinity;
  const pts = seq.map(([lon, lat]) => {
    const l = prev === null ? lon : lon - 360 * Math.round((lon - prev) / 360);
    prev = l; min = Math.min(min, l); max = Math.max(max, l);
    return [l, lat];
  });
  const shifts = [0];
  if (max > 180) shifts.push(-360);
  if (min < -180) shifts.push(360);
  for (const s of shifts) {
    pts.forEach(([lon, lat], i) => i && !seam?.[i] ? ctx.lineTo(X(lon + s), Y(lat)) : ctx.moveTo(X(lon + s), Y(lat)));
    if (!seam) ctx.closePath();
  }
}

/** Lägger rikets gräns som en bana i ctx (alla delar och hål). `skipSeams`: som i traceRing, för strokning (#1227). */
export function tracePath(ctx, geometry, X, Y, skipSeams = false) {
  ctx.beginPath();
  for (const rings of polygons(geometry)) {
    for (const ring of rings) traceRing(ctx, ring, X, Y, skipSeams);
  }
}

/**
 * Strokar gränsen som banan i ctx ligger (tracePath eller traceRing för samma geometri), men utan sömmen vid datumlinjen
 * (#1227). Geometrier utan söm, alltså nästan alla, strokas som förut ur den lagda banan; har geometrin en söm byggs en
 * andra bana med öppna linjer som strokas i stället. Fyllningen använder alltid den första banan. Kräver Path2D (webbläsaren).
 */
export function strokeEdge(ctx, geometry, X, Y) {
  if (!hasSeam(geometry)) return ctx.stroke();
  const edge = new Path2D();
  for (const rings of polygons(geometry)) {
    for (const ring of rings) traceRing(edge, ring, X, Y, true);
  }
  ctx.stroke(edge);
}

/** Mjuk kant för ett rike med osäker gräns (#73). Banan ska redan vara lagd (tracePath).
 *  I stället för en skarp linje läggs tre breda, svaga linjer på varandra: tätast vid gränsen och
 *  allt svagare utåt, så att kanten flyter ut. Fyllningen är lite ljusare än för andra riken. */
export function softEdge(ctx, color, k, stroke = () => ctx.stroke()) {
  ctx.fillStyle = rgba(color, 0.26);
  ctx.fill('evenodd');
  for (const [w, a] of SOFT) {
    ctx.strokeStyle = rgba(color, a);
    ctx.lineWidth = w * k;
    stroke(); // strokeEdge i areas.js: utan sömmen vid datumlinjen (#1227)
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
    strokeEdge(ctx, item.geometry, X, Y);
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

/**
 * Områden som inte är en stat (#1300) ritas först, under alla riken (beslutet 2026-11-13, punkt 7). kindOf(polity) ger
 * areaKind eller null. Ordningen inom varje del är oförändrad, och utan områden ges samma lista tillbaka.
 */
export function areaFirst(items, kindOf) {
  const areas = [], rest = [];
  for (const it of items) (kindOf(it.polity) ? areas : rest).push(it);
  return areas.length ? [...areas, ...rest] : items;
}

// Mönstret för ett område som inte är en stat (#1300): små ringar i rutnät. Snedstreck (krig, spridning), prickar
// (inflytande) och mjuk eller streckad kant betyder redan annat. Rutan är större än prickmönstrets (18 mot 9 i
// grundmåttet 2048), så att ringarna inte smälter ihop till en färgton i mobilens halva upplösning.
const ringPatterns = new Map();
export function areaPattern(ctx, color, k) {
  const kk = Math.round(k * 4) / 4; // avrundat, så att utsnittet vid inzoomning inte skapar ett mönster per zoomsteg
  const key = `${color}|${kk}`;
  if (!ringPatterns.has(key)) {
    const s = Math.max(8, Math.round(18 * kk)), r = Math.max(1.5, 3.4 * kk);
    const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(s, s) : Object.assign(document.createElement('canvas'), { width: s, height: s });
    const g = c.getContext('2d');
    g.strokeStyle = rgba(color, 0.95);
    g.lineWidth = Math.max(1, 1.3 * kk);
    g.beginPath(); g.arc(s / 2, s / 2, r, 0, Math.PI * 2); g.stroke();
    ringPatterns.set(key, ctx.createPattern(c, 'repeat'));
  }
  return ringPatterns.get(key);
}

function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
}
