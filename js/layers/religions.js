// Lagertyp "område" (beslut 2): religioner. Varje rike i Cliopatria har fått
// sin officiella religion eller huvudreligion ur Wikipedia, och rikena är
// sammanslagna per religion i ögonblicksbilder över tiden (data/religions.json).
// Varje religion har en egen färg. Enskilda religioner kan döljas i undermenyn.
// Religioner med faktaruta (facts.origin, #90) får sin symbol där de uppstod (#271), på platsen för händelsen
// som origin pekar på: en mässingsmedalj med symbolen, som 3D-markör (origins.js) och på lagerbilden.
// Ärvda områden (snapshot.inherited, #269) ligger under riken vars faktaruta saknar religion och visar
// religionen området hade tidigare; de ritas ljusare med prickad kant.
// Religionens symbol (fältet symbol, #271) står också mitt i varje sammanhängande område som är stort nog,
// ljusare i osäkra och ärvda områden, och vid nära zoom står religionens namn under den. Pekar man på en
// religion i en meny eller i teckenförklaringen (highlight) lyser dess områden upp och de andra tonas ner.
import { glyph } from './events.js';
import { t } from '../model.js';

export const ORIGIN_R = 15; // medaljens radie på lagerbilden, i bildpunkter per 2048 i bredd (som k nedan)
const BRASS = '#d6b06a', GROUND = '#10202c', INK = 'rgba(11,18,25,0.85)', NAME = '#f6e7c4', DISC = 'rgba(16,32,44,0.6)';
const SYM = 22;      // symbolens storlek i områdena, bildpunkter per 2048 i bredd
const NAME_SIZE = 13; // namnets storlek vid nära zoom

export class ReligionsLayer {
  constructor() {
    this.religions = []; // fylls när datan har laddats, första gången lagret slås på
    this.enabled = false;
    this.hidden = new Set(); // religioner som är avbockade i undermenyn
    this.active = []; // [{ religion, snapshot }]
    this.origins = new Map(); // religionens id → händelsen där den uppstod
    this.stars = []; // [{ religion, event }] som syns det här året
    this.polities = new Map(); // rikets namn → uppgifter ur religions.json
    this.highlight = null; // religionens id som lyses upp (pekar i meny eller teckenförklaring), annars null
    this.labelScale = 1;   // symbolernas och namnens storlek, som riksnamnen (AreasLayer.labelScale)
    this.showNames = false; // namnen i områdena syns bara vid nära zoom
    this.onGlyph = () => {}; // anropas när en symbol har laddats, så att lagerbilden ritas om
  }

  /** Symbolens bild (img/icons/<symbol>.svg) när den har laddats, annars null. */
  _glyph(religion) {
    if (!/^[\w-]+$/.test(religion.symbol ?? '')) return null;
    const gl = glyph(religion.symbol);
    if (!gl.ready && !gl._layer) { gl._layer = true; gl.waiting.push(() => this.onGlyph()); }
    return gl.ready ? gl.img : null;
  }

  /** Händelserna där religionerna uppstod, som Map från religionens id. */
  setOrigins(origins) { this.origins = origins; }

  setData(religions) { this.religions = religions; }

  /** Rikena med religion (polities i religions.json), som Map från rikets namn. */
  setPolities(list) { this.polities = new Map((list ?? []).map(p => [p.name, p])); }

  /**
   * Teckenförklaringen (#166): religionerna som syns just det här året, i datans ordning,
   * med om något av områdena är osäkra eller ärvda (#269). [{ religion, sure, unsure, inherited }]
   */
  legendItems() {
    const items = new Map();
    for (const { religion, snapshot } of this.active) {
      const it = items.get(religion.id) ?? { religion, sure: false, unsure: false, inherited: false };
      if (snapshot.inherited) it.inherited = true;
      else snapshot.sure !== false ? (it.sure = true) : (it.unsure = true);
      items.set(religion.id, it);
    }
    return [...items.values()];
  }

  /**
   * Vilket område ligger punkten (lon, lat) i? Säkra områden prövas före osäkra och osäkra före ärvda.
   * Returnerar { religion, snapshot, polities } eller null. Områdena är sammanslagna, så
   * vilket rike som ligger just där tas fram med polityAt() när rikenas gränser har laddats.
   */
  hitTest(lon, lat) {
    const rank = s => s.inherited ? 2 : s.sure !== false ? 0 : 1;
    const sorted = [...this.active].sort((a, b) => rank(a.snapshot) - rank(b.snapshot));
    for (const { religion, snapshot } of sorted) {
      if (contains(snapshot.geometry, lon, lat)) {
        return { religion, snapshot, polities: snapshot.polities.map(n => this.polities.get(n) ?? { name: n }) };
      }
    }
    return null;
  }

  /**
   * Vilket rike i området ligger på punkten (#194)? shapes = polities ur
   * data/religions-polities.json (rikets namn → perioder). Bara rikena i ögonblicksbilden
   * prövas, med den period som gällde när ögonblicksbilden börjar (samma urval som ritas).
   * Ligger flera riken över varandra kommer enskilda skeden före sammanslagningar och
   * sedan det minsta riket först. Hamnar klicket precis utanför
   * alla (förenklade kanter) tas det närmaste riket inom en halv grad. Returnerar en lista
   * med uppgifter om rikena, tom om inget hittas.
   */
  polityAt(hit, lon, lat, shapes) {
    const y = hit.snapshot.start;
    const cands = [];
    for (const p of hit.polities) {
      const period = (shapes?.[p.name] ?? []).find(q => q.start <= y && y <= q.end);
      if (period) cands.push({ p, g: period.geometry });
    }
    // Namn inom parentes, till exempel (Kingdom of France), är Cliopatrias sammanslagning av ett
    // rikes alla skeden. De kommer efter det enskilda skedet, till exempel Kingdom of France.
    const agg = c => /^\(.*\)$/.test(c.p.name);
    const inside = cands.filter(c => contains(c.g, lon, lat)).map(c => ({ ...c, area: bboxArea(c.g) }));
    if (inside.length) return inside.sort((a, b) => agg(a) - agg(b) || a.area - b.area).map(c => c.p);
    let best = null, bestD = 0.5;
    for (const c of cands) {
      const d = distance(c.g, lon, lat);
      if (d < bestD) { best = c.p; bestD = d; }
    }
    return best ? [best] : [];
  }

  update({ year }) {
    this.active = [];
    this.stars = [];
    if (!this.enabled) return this.active;
    for (const religion of this.religions) {
      if (this.hidden.has(religion.id) && religion.id !== this.onlyId) continue;
      if (this.onlyId && religion.id !== this.onlyId) continue; // fokusläge för en religion
      // Stjärnan syns från det år religionen uppstod
      const origin = this.origins.get(religion.id);
      if (origin && year >= origin.start) this.stars.push({ religion, event: origin });
      // Upp till två områden per år: säkra uppgifter och osäkra (först nämnda)
      for (const snapshot of religion.snapshots) {
        if (year >= snapshot.start && year <= snapshot.end) this.active.push({ religion, snapshot });
      }
    }
    return this.active;
  }

  drawOverlay(ctx, W, H) {
    if (!this.active.length && !this.stars.length) return;
    const X = lon => (lon + 180) / 360 * W, Y = lat => (90 - lat) / 180 * H;
    const k = W / 2048;
    const hi = this.highlight && this.active.some(a => a.religion.id === this.highlight) ? this.highlight : null;
    ctx.save();
    ctx.lineJoin = 'round';
    for (const { religion, snapshot } of this.active) {
      const g = snapshot.geometry;
      ctx.beginPath();
      for (const rings of g.type === 'Polygon' ? [g.coordinates] : g.coordinates) {
        for (const ring of rings) {
          ring.forEach(([lon, lat], i) => i ? ctx.lineTo(X(lon), Y(lat)) : ctx.moveTo(X(lon), Y(lat)));
          ctx.closePath();
        }
      }
      // Osäkra områden ritas ljusare och med streckad kant, ärvda (#269) ännu ljusare med prickad kant
      // (visa osäkerhet öppet). Markerad religion (#271): starkare fyllning och kant, de andra tonas ner.
      const inherited = !!snapshot.inherited, sure = !inherited && snapshot.sure !== false;
      const lit = hi === religion.id, dim = hi && !lit ? 0.3 : 1;
      ctx.globalAlpha = (sure ? 0.5 : inherited ? 0.2 : 0.25) * (lit ? 1.5 : dim);
      ctx.fillStyle = religion.color;
      ctx.fill('evenodd');
      ctx.globalAlpha = (sure ? 1 : 0.8) * dim;
      ctx.strokeStyle = lit ? NAME : religion.color;
      ctx.lineWidth = (lit ? 2.4 : 1.4) * k;
      ctx.setLineDash(sure ? [] : inherited ? [1.5 * k, 3.5 * k] : [6 * k, 4 * k]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
    this._drawMarks(ctx, X, Y, k, hi);
    // Punkten där religionen uppstod (#271): mässingsmedaljen med religionens symbol, som 3D-markören (origins.js)
    const R = ORIGIN_R * k * this.labelScale;
    for (const { religion, event } of this.stars) {
      const cx = X(event._lon), cy = Y(event._lat);
      ctx.globalAlpha = hi && hi !== religion.id ? 0.5 : 1;
      ctx.fillStyle = GROUND;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = R * 0.16; ctx.strokeStyle = BRASS; ctx.stroke();
      ctx.lineWidth = R * 0.07; ctx.strokeStyle = religion.color;
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.76, 0, Math.PI * 2); ctx.stroke();
      const img = this._glyph(religion);
      if (img) ctx.drawImage(img, cx - R * 0.56, cy - R * 0.56, R * 1.12, R * 1.12);
      else { ctx.fillStyle = religion.color; ctx.beginPath(); ctx.arc(cx, cy, R * 0.3, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  }

  /**
   * Symbolen i varje sammanhängande område (#271), och vid nära zoom namnet under den. Ett område får symbol
   * bara när det finns plats för den (centerOf: den inre punkten längst från kanten), så att små områden
   * förblir rena. Osäkra och ärvda områden får en ljusare symbol. Namnen skrivs som riksnamnen (areas.js),
   * men raka och med versaler, så att de inte förväxlas med rikenas.
   */
  _drawMarks(ctx, X, Y, k, hi) {
    const sc = this.labelScale, size = SYM * k * sc, pxPerDeg = X(1) - X(0);
    const font = NAME_SIZE * k * sc;
    ctx.font = `${font}px "IM Fell English", Georgia, serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${(font * 0.12).toFixed(1)}px`;
    for (const { religion, snapshot } of this.active) {
      const img = this._glyph(religion);
      const name = t(religion.name).toLocaleUpperCase('sv');
      const sure = !snapshot.inherited && snapshot.sure !== false;
      const dim = hi && hi !== religion.id ? 0.3 : 1;
      for (const c of centersOf(snapshot)) {
        const room = c.r * pxPerDeg; // radien för den största cirkeln som ryms (ungefär), i bildpunkter
        if (room < size * 0.9) continue;
        const x = X(c.lon), y = Y(c.lat);
        ctx.globalAlpha = (sure ? 0.95 : 0.5) * dim;
        if (img) {
          // En mörk, genomskinlig skiva under symbolen, så att den syns mot både ljusa och mörka färger
          // Bredare mot polerna (1 / cos latitud, högst dubbelt), så att symbolen blir rund på klotet
          const sx = Math.min(2, 1 / Math.cos(c.lat * Math.PI / 180));
          ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1);
          ctx.fillStyle = DISC;
          ctx.beginPath(); ctx.arc(0, 0, size * 0.66, 0, Math.PI * 2); ctx.fill();
          ctx.drawImage(img, -size / 2, -size / 2, size, size);
          ctx.restore();
        }
        if (!this.showNames || room < size * 1.6) continue;
        const w = ctx.measureText(name).width;
        if (w > c.w * pxPerDeg * 0.8) continue; // namnet ryms inte i området
        const ny = img ? y + size * 0.5 + font * 0.8 : y;
        ctx.lineWidth = 3 * k * sc; ctx.strokeStyle = INK;
        ctx.strokeText(name, x, ny);
        ctx.fillStyle = NAME; ctx.fillText(name, x, ny);
      }
    }
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }
}

/**
 * Mittpunkterna för ögonblicksbildens sammanhängande områden (varje polygon i MultiPolygon), räknas ut en gång:
 * [{ lon, lat, r, w }]. r = avståndet (grader) från punkten till närmaste kant, w = områdets bredd (grader).
 * Punkten söks i ett rutnät över polygonens rektangel och förfinas runt den bästa, ungefär som "pole of
 * inaccessibility": den inre punkt som ligger längst från kanten, där symbolen syns bäst.
 */
function centersOf(snapshot) {
  if (snapshot._centers) return snapshot._centers;
  const g = snapshot.geometry, out = [];
  for (const rings of g.type === 'Polygon' ? [g.coordinates] : g.coordinates) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of rings[0]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    if (Math.min(x1 - x0, y1 - y0) < 2) continue; // smalare än två grader: aldrig plats för en symbol
    const poly = { type: 'Polygon', coordinates: rings };
    let best = null;
    const tryAt = (lon, lat) => {
      if (!contains(poly, lon, lat)) return;
      const r = distance(poly, lon, lat);
      if (!best || r > best.r) best = { lon, lat, r, w: x1 - x0 };
    };
    const N = 10;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) tryAt(x0 + (i + 0.5) / N * (x1 - x0), y0 + (j + 0.5) / N * (y1 - y0));
    if (best) {
      const sx = (x1 - x0) / N, sy = (y1 - y0) / N, b = { ...best };
      for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) tryAt(b.lon + i * sx / 3, b.lat + j * sy / 3);
      out.push(best);
    }
  }
  snapshot._centers = out;
  return out;
}

const ringsOf = g => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).flat();

/** Punkt i polygon (evenodd, som ritningen), i lon/lat. */
function contains(g, lon, lat) {
  let inside = false;
  for (const ring of ringsOf(g)) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

/** Ytan av områdets omskrivna rektangel (kvadratgrader), för att välja det minsta riket. */
function bboxArea(g) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const ring of ringsOf(g)) for (const [x, y] of ring) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return (x1 - x0) * (y1 - y0);
}

/** Kortaste avståndet (grader) från punkten till områdets kant. */
function distance(g, lon, lat) {
  let best = Infinity;
  for (const ring of ringsOf(g)) {
    for (let i = 1; i < ring.length; i++) {
      const [ax, ay] = ring[i - 1], [bx, by] = ring[i];
      const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
      const t = l ? Math.max(0, Math.min(1, ((lon - ax) * dx + (lat - ay) * dy) / l)) : 0;
      best = Math.min(best, Math.hypot(lon - ax - t * dx, lat - ay - t * dy));
    }
  }
  return best;
}
