// Lagertyp "linje" med rörelse över tid (beslut 2, #38): vägar och resor ur data/routes/.
// Varje lager har samma gränssnitt: update(state) och drawOverlay(ctx, W, H).
//
// En resa (kind "voyage") består av etapper (legs) med tid (from, to i decimalår) och en väg (path,
// [lon, lat]). Etapper som är avslutade ritas hela, den pågående ritas fram till platsen som svarar mot
// året (räknat längs vägens längd mellan from och to) med ett skepp (en prick) där, och senare etapper
// ritas inte. Går flera etapper samtidigt får var och en ett skepp. När resan är slut syns den svagt lika länge som händelserna (timeline.windowYears), sedan
// försvinner den. En handelsväg (kind "trade") syns som en dämpad linje medan året ligger inom etappens
// from–to, plus samma fönster. Osäkra etapper (uncertain) ritas streckade.
//
// Allt ritas på den platta lagerbilden (beslut 1), så Platt vy visar samma sak. Långa sträckor följer
// storcirklar (punkter läggs in längs vägen), och linjer över datumlinjen ritas en bildbredd åt andra
// hållet också, så att de fortsätter på andra sidan bilden.
import { CAT, isVisibleReview } from '../model.js';

const RAD = Math.PI / 180;
const STEP_DEG = 2;       // längre sträckor än så delas upp längs storcirkeln
const HIT_DEG = 1.5;      // klick så här nära en synlig linje (i grader) träffar den
const FADED = 0.4;        // genomskinlighet för en resa som är slut
const TRADE = 0.6;        // handelsvägarnas dämpade färg

const toVec = ([lon, lat]) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];
const toLonLat = ([x, y, z]) => [Math.atan2(y, x) / RAD, Math.atan2(z, Math.hypot(x, y)) / RAD];
const angle = (a, b) => Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));

/** Punkt på storcirkeln mellan a och b (vektorer), andelen f. */
function slerp(a, b, d, f) {
  if (d < 1e-9) return a;
  const s = Math.sin(d), ka = Math.sin((1 - f) * d) / s, kb = Math.sin(f * d) / s;
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
}

/**
 * Förbereder en etapps väg: punkter längs storcirklar (högst STEP_DEG mellan två punkter) och
 * sträckans längd fram till varje punkt (i radianer), så att en andel av etappen kan ritas.
 */
function prepare(path) {
  const pts = [path[0]], cum = [0];
  for (let i = 1; i < path.length; i++) {
    const a = toVec(path[i - 1]), b = toVec(path[i]), d = angle(a, b);
    const n = Math.max(1, Math.ceil(d / RAD / STEP_DEG));
    for (let j = 1; j <= n; j++) {
      pts.push(j === n ? path[i] : toLonLat(slerp(a, b, d, j / n)));
      cum.push(cum.at(-1) + d / n);
    }
  }
  return { pts, cum, length: cum.at(-1) };
}

/** Vägen fram till andelen f av etappens längd: punkterna och platsen där den slutar. */
function partial(prep, f) {
  if (f >= 1) return { pts: prep.pts, at: prep.pts.at(-1) };
  const target = Math.max(0, f) * prep.length;
  let i = 1;
  while (i < prep.cum.length - 1 && prep.cum[i] < target) i++;
  const a = prep.pts[i - 1], b = prep.pts[i], seg = prep.cum[i] - prep.cum[i - 1];
  const g = seg > 0 ? (target - prep.cum[i - 1]) / seg : 1;
  const va = toVec(a), vb = toVec(b);
  const at = toLonLat(slerp(va, vb, angle(va, vb), g));
  return { pts: [...prep.pts.slice(0, i), at], at };
}

/** Longituder utan hopp över datumlinjen: varje punkt hamnar inom 180 grader från den förra. */
function unwrap(pts) {
  const out = [];
  let prev = null;
  for (const [lon, lat] of pts) {
    const l = prev === null ? lon : lon - 360 * Math.round((lon - prev) / 360);
    out.push([l, lat]); prev = l;
  }
  return out;
}

/** Avstånd i grader (longitud skalad med cos(lat)) från punkten p till sträckan a–b, nära p. */
function segDist(p, a, b) {
  const near = q => [q[0] - 360 * Math.round((q[0] - p[0]) / 360), q[1]];
  const k = Math.cos(p[1] * RAD);
  const [ax, ay] = near(a), bx0 = near(b);
  const bx = bx0[0] - 360 * Math.round((bx0[0] - ax) / 360), by = bx0[1];
  const px = p[0] * k, py = p[1], x1 = ax * k, x2 = bx * k;
  const dx = x2 - x1, dy = by - ay, len = dx * dx + dy * dy;
  const t = len > 0 ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - ay) * dy) / len)) : 0;
  return Math.hypot(px - (x1 + t * dx), py - (ay + t * dy));
}

export class LinesLayer {
  constructor(routes = []) {
    this.enabled = true;
    this.active = []; // [{ route, alpha, legs: [{ leg, pts, dashed }], ships: [[lon, lat], ...] }]
    this.setRoutes(routes);
  }

  /** Vägarna ur loadRoutes() i model.js. Etapper utan väg hoppas över. */
  setRoutes(routes) {
    this.routes = routes.map(route => {
      const legs = (route.legs ?? [])
        .filter(l => Array.isArray(l.path) && l.path.length >= 2 && Number.isFinite(l.from) && Number.isFinite(l.to))
        .sort((a, b) => a.from - b.from)
        .map(leg => ({ leg, prep: prepare(leg.path) }));
      return { route, legs };
    }).filter(r => r.legs.length);
  }

  /**
   * state: year (i fokusläget för korta krig ett decimaltal), fine (true när året är ett decimaltal),
   * window (timeline.windowYears), filters (kategorierna som syns). Utanför fokusläget är året ett heltal;
   * vägarna ritas då som de låg vid årets slut, så att en resa som började under året syns samma år.
   */
  update({ year, fine = false, window = 0, filters = null }) {
    this.active = [];
    if (!this.enabled) return this.active;
    const now = fine ? year : Math.floor(year) + 0.999;
    for (const { route, legs } of this.routes) {
      if (!isVisibleReview(route.review) || (filters && !filters.has(route.category))) continue;
      if (route.kind === 'trade') {
        const shown = legs.filter(({ leg }) => now >= leg.from - window && year <= leg.to + window)
          .map(({ leg, prep }) => ({ leg, pts: prep.pts, dashed: !!leg.uncertain }));
        if (shown.length) this.active.push({ route, alpha: TRADE, legs: shown, ships: [], trade: true });
        continue;
      }
      const first = legs[0].leg.from, last = Math.max(...legs.map(l => l.leg.to));
      if (now < first || year > last + window) continue;
      // Etapper kan gå samtidigt (till exempel när en flotta delas): varje pågående etapp får ett skepp.
      // Pågår ingen etapp (resan ligger i hamn mellan två etapper) står skeppet där den senaste etappen slutade.
      const shown = [], moving = [];
      let latest = -Infinity, docked = [];
      for (const { leg, prep } of legs) {
        if (leg.from > now) break;
        if (leg.to <= now) {
          shown.push({ leg, pts: prep.pts, dashed: !!leg.uncertain });
          if (leg.to > latest) { latest = leg.to; docked = []; }
          if (leg.to === latest) docked.push(prep.pts.at(-1));
          continue;
        }
        const p = partial(prep, (now - leg.from) / (leg.to - leg.from));
        shown.push({ leg, pts: p.pts, dashed: !!leg.uncertain, current: true });
        moving.push(p.at);
      }
      const ended = now >= last;
      this.active.push({ route, alpha: ended ? FADED : 1, legs: shown, ships: ended ? [] : moving.length ? moving : docked });
    }
    return this.active;
  }

  drawOverlay(ctx, W, H) {
    if (!this.enabled || !this.active.length) return;
    const k = W / 2048; // samma mått som krigsområdena och händelsernas sken
    const xy = ([lon, lat]) => [(lon + 180) / 360 * W, (90 - lat) / 180 * H];
    ctx.save();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const { route, alpha, legs, ships, trade } of this.active) {
      const col = CAT[route.category]?.color ?? '#f1dfb4';
      for (const { pts, dashed } of legs) {
        const line = unwrap(pts).map(xy);
        const xs = line.map(([x]) => x), shifts = [0];
        if (Math.min(...xs) < 0) shifts.push(W);
        if (Math.max(...xs) > W) shifts.push(-W);
        for (const dx of shifts) {
          ctx.beginPath();
          line.forEach(([x, y], i) => i ? ctx.lineTo(x + dx, y) : ctx.moveTo(x + dx, y));
          // Mörk kant under linjen, så att den syns mot både land och hav
          ctx.setLineDash(dashed ? [9 * k, 6 * k] : []);
          ctx.globalAlpha = alpha * 0.7; ctx.strokeStyle = '#0b1219'; ctx.lineWidth = (trade ? 4 : 5.6) * k; ctx.stroke();
          ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = (trade ? 2 : 3) * k; ctx.stroke();
        }
      }
      // Skeppet: en prick i kategorins färg med mässingsring där resan är just nu
      for (const ship of ships) {
        const [x, y] = xy(ship);
        ctx.setLineDash([]); ctx.globalAlpha = 1;
        for (const dx of x < 8 * k ? [0, W] : x > W - 8 * k ? [0, -W] : [0]) {
          ctx.beginPath(); ctx.arc(x + dx, y, 6 * k, 0, Math.PI * 2);
          ctx.fillStyle = col; ctx.fill();
          ctx.lineWidth = 2 * k; ctx.strokeStyle = '#d6b06a'; ctx.stroke();
          ctx.beginPath(); ctx.arc(x + dx, y, 8 * k, 0, Math.PI * 2);
          ctx.lineWidth = 1.2 * k; ctx.strokeStyle = '#0b1219'; ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  /** Vägen under en punkt (lon, lat), inom HIT_DEG grader från en synlig linje: { route, leg } eller null. */
  hitTest(lon, lat, tol = HIT_DEG) {
    let best = null, bestD = tol;
    for (const { route, legs } of this.active) {
      for (const { leg, pts } of legs) {
        for (let i = 1; i < pts.length; i++) {
          const d = segDist([lon, lat], pts[i - 1], pts[i]);
          if (d <= bestD) { bestD = d; best = { route, leg }; }
        }
      }
    }
    return best;
  }
}
