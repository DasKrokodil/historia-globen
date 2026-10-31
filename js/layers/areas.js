// Lagertyp "område" (beslut 2): riken vars utbredning ändras över tid.
// Varje rike har perioder (start–end) med en GeoJSON-polygon. Lagret väljer
// den period som gäller för nuvarande år och ritar den på den platta lagerbilden.
// Riken med symbol (#301) får en mässingsmedalj med symbolen på label-punkten, som religionernas ursprung (#271).
// Utzoomat på globen syns bara medaljen; vid nära zoom och i Platt vy står namnet under den. Medaljen på lagerbilden
// täcks på globen av en klickbar 3D-markör (empiremarks.js).
// Mindre trängsel (#358): vilka riken som får namn och medalj beror på zoomnivån (ui/zoomlevels.js) och rikets yta
// det året (areaKm2), och namn och medaljer som skulle täcka varandra eller de viktigaste händelserna flyttas undan
// eller döljs (_layout). Riket man följer i Fokus visas alltid.
import { t, isVisibleReview, loadEmpire } from '../model.js';
import { glyph } from './events.js';
import { drawMedal, ORIGIN_R } from './religions.js';
import { softEdge, influenceAt, drawInfluence } from './area-style.js';
import { AreaTransition, MAX_JUMP_YEARS } from './area-transition.js';
import { EmpireMarkers } from './empiremarks.js';
import { Z } from './registry.js';
import { ZOOM_LEVELS } from '../ui/zoomlevels.js';

/**
 * Lagrets post i registret (#338): på som standard. I fokusläget syns riket man följer även om lagret är av, bara
 * det riket visas, och lagret dämpas när man följer ett krig eller en religion (#235). Rikena laddas när året närmar
 * sig deras tid (en fil per rike, R1). Rikenas symboler (#301) är klickbara 3D-medaljer (empiremarks.js) som öppnar
 * faktarutan. Med Lugn rörelse (#246) stängs övergångarna (#78) av.
 */
export function entry({ globe, data, labelsEl, refresh, refreshSoon, showEmpireFacts }) {
  const layer = new AreasLayer();
  layer.setPoints(data.empireGroups); // försvunna länder utan gräns, som en punkt (#72)
  // Symbol i gruppen i empires/index.json, eller polityFacts.<rike>.symbol för ett rike i gruppen med egen
  // faktaruta (Bysantinska riket). Medaljen står på rikets label-punkt och öppnar faktarutan.
  const empireById = new Map(data.empireGroups.map(g => [g.id, g]));
  layer.symbolOf = polity => {
    const g = empireById.get(polity.group);
    const own = g?.polityFacts?.[polity.id];
    const symbol = own?.symbol ?? g?.symbol;
    return symbol ? { symbol, color: polity.color, name: t(polity.name), group: g.id, own: !!own?.facts } : null;
  };
  layer.onGlyph = refreshSoon;
  const marks = new EmpireMarkers(globe, labelsEl);
  marks.onPick = m => showEmpireFacts(m.group, m.own ? m.polity : null);
  // Rikena laddas när året närmar sig deras tid. När filen har kommit ritas allt om.
  const loads = new Set();
  const ensure = year => {
    if (!layer.enabled) return;
    const pad = 100;
    for (const g of data.empireGroups) {
      if (loads.has(g.id) || year < g.from - pad || year > g.to + pad) continue;
      loads.add(g.id);
      loadEmpire(g).then(ps => { layer.add(ps); refresh(); }).catch(err => { console.error(err); loads.delete(g.id); });
    }
  };
  let lastYear = 0;
  return {
    id: 'areas', name: 'Riken', group: 'power', menu: { on: true }, layer, z: Z.areas,
    fade: { own: focus => focus.type === 'empire' },
    // Rikenas kartnyckel behövs när man följer ett rike, inte på startsidan där Riken är på som standard (#427).
    legend: s => ({ areas: s.focus?.type === 'empire' }),
    enabled: s => s.focus?.type === 'empire' || s.layers.areas,
    apply: s => {
      layer.onlyGroup = s.focus?.type === 'empire' ? s.focus.id : null;
      layer.transition.calm = s.calm;
    },
    update: s => {
      layer.labelScale = marks.scale = s.labels.scale;
      layer.labelAlpha = s.labels.alpha;
      layer.showNames = s.labels.empireNames;
      ensure(s.wholeYear);
      // Övergången (#78) är mjuk när tiden spelas upp eller flyttas lite, annars visas nya läget direkt
      const out = layer.update({ year: s.wholeYear, smooth: s.playing || Math.abs(s.wholeYear - lastYear) <= MAX_JUMP_YEARS });
      lastYear = s.wholeYear;
      return out;
    },
    markers: s => marks.update(layer.marks(), layer.enabled && !s.faded.has('areas')),
    frame: () => marks.frame(),
    animating: () => layer.animating,
    drawOverlay: (ctx, W, H) => layer.drawOverlay(ctx, W, H),
  };
}

export class AreasLayer {
  constructor(polities = []) {
    this.polities = polities;
    this.enabled = true;
    this.active = []; // [{ polity, period }]
    this.labelAlpha = 1; // och hur synliga de är (tonas ut vid kraftig zoom)
    this.labelScale = 1; // namnens storlek relativt grundstorleken (1 = som på platta bilden)
    this.symbolOf = () => null; // rikets symbol: (polity) → { symbol, color, name, group } eller null (sätts i main.js)
    this.showNames = true; // namnen under symbolerna (false utzoomat på globen, #301)
    this.onGlyph = () => {}; // anropas när en symbol har laddats, så att lagerbilden ritas om
    this.transition = new AreaTransition(); // mjuk övergång när ett område byter period (#78)
    // Zoomnivån och platserna som ska hållas fria (#358), sätts med setView(). Utan setView gäller nivån
    // "hela världen", till exempel för en fysisk glob.
    this.view = { level: 0, pxPerImg: 0.3, minMedalPx: 0, keepouts: [] };
    this._rev = 0; this._lay = null;
  }

  /**
   * Zoomnivån och det som ska hållas fritt (#358): level = nivå i ZOOM_LEVELS, pxPerImg = skärmpixlar per bildpunkt
   * (4096 i bredd), minMedalPx = 3D-medaljens minsta storlek på skärmen (på globen, 0 i Platt vy) och
   * keepouts = händelser som alltid har företräde, med plats för etiketten (eventKeepouts i ui/zoomlevels.js).
   */
  setView(view) {
    this.view = { ...this.view, ...view };
    this._rev++;
  }

  /** Pågår en övergång? Då behöver lagerbilden ritas om varje bildruta tills den är klar. */
  get animating() { return this.transition.running; }

  /** Symbolens bild (img/icons/<symbol>.svg) när den har laddats, annars null. */
  _glyph(name) {
    if (!/^[\w-]+$/.test(name ?? '')) return null;
    const gl = glyph(name);
    if (!gl.ready && !gl._areas) { gl._areas = true; gl.waiting.push(() => this.onGlyph()); }
    return gl.ready ? gl.img : null;
  }

  /**
   * Symbolerna som syns det här året (#301), en per rike med symbol, på rikets label-punkt:
   * [{ key, symbol, color, name, lon, lat, group, polity }] (för 3D-markörerna).
   */
  marks() {
    const out = [], L = this._layout();
    for (const { polity, period } of this.active) {
      const d = L.get(akey(polity, period));
      // På label-punkten, eller strax bredvid om den platsen var upptagen (_layout)
      if (d?.medal) out.push({ key: polity.id, ...d.medal, polity, lon: d.px / 2048 * 360 - 180, lat: 90 - d.py / 1024 * 180 });
    }
    return out;
  }

  /** Rikesnamnen och medaljerna som syns, som { lon, lat, hw, hh } (mitt och halv storlek i grundmått, 2048 i
   *  bredd), så att händelseetiketterna kan hålla sig borta från dem (empireBlocks i ui/zoomlevels.js, #358). */
  placedBoxes() {
    this._layout();
    return this._lay.placed.map(b => ({ lon: (b.x0 + b.x1) / 2 / 2048 * 360 - 180, lat: 90 - (b.y0 + b.y1) / 2 / 1024 * 180,
      hw: (b.x1 - b.x0) / 2, hh: (b.y1 - b.y0) / 2 }));
  }

  /**
   * Var namn, medaljer och stjärnor står det här året (#358), i bildens grundmått (2048 × 1024, k = 1).
   * Rikena går i tur och ordning efter prioritet: riket man följer i Fokus först, sedan efter yta (areaKm2, störst
   * först). Nivån bestämmer hur många som får plats (ZOOM_LEVELS[level].names). Ett namn eller en medalj som
   * skulle täcka något som redan står där (ett större rike, de viktigaste händelsernas markörer, eller den valda
   * händelsen och Samtidigt-kortets händelser med sina etiketter, view.keepouts) flyttas uppåt eller nedåt med ett streck, eller döljs. Övriga händelseetiketter
   * viker i stället för rikena (placedBoxes). Samma princip som etiketterna (placeLabels i ui/clusters.js):
   * en gemensam lista med upptagna rutor. Returnerar Map från akey (och 'pt:' + grupp för försvunna länder) till
   * { px, py, medal, star, name, x, y, lead }. Räknas om bara när året, nivån eller storleken har ändrats.
   */
  _layout() {
    const v = this.view;
    const key = `${this._rev}|${this.labelScale}|${this.showNames}`;
    if (this._lay?.key === key) return this._lay.map;
    const map = new Map();
    const X = lon => (lon + 180) / 360 * 2048, Y = lat => (90 - lat) / 180 * 1024;
    const unit = Math.max(0.05, 2 * v.pxPerImg); // skärmpixlar per grundmåttsenhet
    const sc = this.labelScale, size = 16 * sc, R = ORIGIN_R * sc;
    const Rm = Math.max(R * 1.15, (v.minMedalPx || 0) / 2 / unit); // medaljen som den syns (3D-medaljen kan vara större)
    const font = `italic ${size}px "IM Fell English", Georgia, serif`;
    const used = [], placed = [];
    const free = b => !used.some(u => overlaps(u, b));
    const take = b => { used.push(b); placed.push(b); };
    // Händelserna som har företräde, med etikett när w > 0 (skärmpixlar räknas om till grundmått)
    for (const o of v.keepouts ?? []) {
      const x = X(o.lon), y = Y(o.lat), r = o.r / unit, off = Math.max(14, o.r + 3) / unit;
      used.push(sq(x, y, r));
      if (o.w) used.push({ x0: x - o.w / 2 / unit, x1: x + o.w / 2 / unit, y0: y - off - o.h / unit, y1: y - off });
    }
    const keep = !!this.onlyGroup; // fokusläge för ett rike: allt som syns hör till riket och visas alltid
    const cands = this.active.map(a => ({ ...a, area: a.period.areaKm2 ?? 0 }))
      .sort((a, b) => b.area - a.area);
    const limit = keep ? Infinity : (ZOOM_LEVELS[v.level] ?? ZOOM_LEVELS[0]).names;
    const offsets = [-1.05, 1.15, -2.2, 2.3, -3.35, 3.45];
    cands.forEach(({ polity, period }, rank) => {
      if (rank >= limit) return; // för litet för den här zoomnivån: bara området syns
      const px = X(period.label[0]), py = Y(period.label[1]);
      const name = t(polity.name), w = measure(name, font);
      const sym = this.symbolOf(polity);
      const d = { px, py, medal: null, star: false, name: null, x: px, y: py, lead: null };
      if (sym) {
        // Medaljen står på label-punkten. Är platsen upptagen flyttas den lite inom området (rutan runt det); ryms den
        // inte alls syns bara området. Namnet står under medaljen (eller ovanför); ryms det inte syns bara medaljen.
        // På globen har 3D-medaljen samma storlek överallt, men bilden pressas ihop mot polerna: rutan blir bredare där.
        const rx = v.minMedalPx ? Rm / Math.max(0.3, Math.cos(period.label[1] * Math.PI / 180)) : Rm;
        const b = bbox(period);
        const spot = [[0, 0], [0, -2.2], [0, 2.2], [-2.2, 0], [2.2, 0], [-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]]
          .map(([dx, dy]) => [px + dx * rx, py + dy * Rm])
          .find(([x, y], i) => (keep && i === 0) || (free({ x0: x - rx, x1: x + rx, y0: y - Rm, y1: y + Rm }) &&
            (i === 0 || (x > X(b.minLon) + rx && x < X(b.maxLon) - rx && y > Y(b.maxLat) + Rm && y < Y(b.minLat) - Rm))));
        if (!spot) return;
        const [mx, my] = spot;
        take({ x0: mx - rx, x1: mx + rx, y0: my - Rm, y1: my + Rm });
        Object.assign(d, { px: mx, py: my, x: mx, medal: sym });
        if (this.showNames) {
          // Namnet under medaljen, eller ovanför om det är upptaget under
          const gap = Math.max(R * 1.25, Rm) + size * 0.6;
          const ny = [my + gap, my - gap].find((y, i) => (keep && i === 0) || free(box(mx, y, w, size)));
          if (ny != null) { take(box(mx, ny, w, size)); Object.assign(d, { name, y: ny }); }
        }
        map.set(akey(polity, period), d);
        return;
      }
      let y0 = py;
      if (period.homeland) {
        // Huvudland (#74): stjärnan i moderlandet och namnet strax ovanför eller under
        const sb = sq(px, py, 7 * sc);
        if (!keep && !free(sb)) return;
        take(sb); d.star = true;
      } else {
        // Ryms namnet inte i området skrivs det ovanför, med ett streck ner, så att området syns
        const b = bbox(period);
        const bw = X(b.maxLon) - X(b.minLon), bh = Y(b.minLat) - Y(b.maxLat);
        if (w > bw * 0.9 || bh < size * 2.5) {
          const top = Y(b.maxLat);
          y0 = top - size * 1.6;
          d.lead = [px, top - 2, px, y0 + size * 0.6];
        }
        const nb = box(px, y0, w, size);
        if (keep || free(nb)) {
          take(nb); Object.assign(d, { name, y: y0 });
          map.set(akey(polity, period), d);
          return;
        }
        d.lead = null;
      }
      // Platsen är upptagen: namnet flyttas uppåt eller nedåt, med ett streck till label-punkten
      const dy = offsets.find(o => free(box(px, y0 + o * size, w, size)));
      if (dy == null) { if (d.star) map.set(akey(polity, period), d); return; }
      const y = y0 + dy * size;
      take(box(px, y, w, size));
      if (Math.abs(dy) > 1.2 || !d.star) d.lead = [px, py + Math.sign(dy) * (d.star ? 8 * sc : 2), px, y - Math.sign(dy) * size * 0.55];
      Object.assign(d, { name, y });
      map.set(akey(polity, period), d);
    });
    // Försvunna länder utan gräns (#72) sist: de har ingen yta och syns när det finns plats
    for (const g of this.activePoints ?? []) {
      const [lon, lat] = g.vanished.point.coordinates;
      const x = X(lon), y = Y(lat), r = 5 * sc, w = measure(t(g.name), font);
      const b = { x0: x - r * 1.9, x1: x + r * 2.8 + w, y0: y - size * 0.55, y1: y + size * 0.55 };
      if (!keep && (v.level < ZOOM_LEVELS.length - 1 || !free(b))) continue;
      take(b); map.set('pt:' + g.id, true);
    }
    this._lay = { key, map, placed };
    return map;
  }

  /** Rikena laddas ett i taget (en fil per rike) och läggs till när de har kommit. */
  add(polities) {
    for (const p of polities) if (!this.polities.includes(p)) this.polities.push(p);
  }

  /** Försvunna länder utan gräns i Cliopatria (#72), till exempel Neutrala Moresnet: grupper med vanished.point.
   *  De ritas som en punkt med namn under de år landet fanns enligt källorna (vanished.founded–dissolved). */
  setPoints(groups) {
    this.points = groups.filter(g => g.vanished?.point);
  }

  /** Returnerar de riken som finns just det här året. */
  update({ year, smooth = false }) {
    const prev = this.active;
    this.active = [];
    this.activePoints = [];
    this.influence = [];
    this._rev++;
    if (!this.enabled) { this.transition.track(prev, this.active, year, false); return this.active; }
    this.activePoints = (this.points ?? []).filter(g => (!this.onlyGroup || g.id === this.onlyGroup)
      && isVisibleReview(g.vanished.review) && year >= g.vanished.founded && year <= g.vanished.dissolved);
    for (const polity of this.polities) {
      if (!isVisibleReview(polity.review)) continue;
      if (this.onlyGroup && polity.group !== this.onlyGroup) continue; // fokusläge för ett rike
      const period = polity.periods.find(p => year >= p.start && year <= p.end);
      if (period) this.active.push({ polity, period });
    }
    this.influence = influenceAt(this.active, year); // lydriken och vasaller (#75)
    this._rev++; // namnens platser räknas om (#358)
    this.transition.track(prev, this.active, year, smooth);
    return this.active;
  }

  drawOverlay(ctx, W, H) {
    const X = lon => (lon + 180) / 360 * W, Y = lat => (90 - lat) / 180 * H;
    const k = W / 2048; // linjer och text ritas lika stora oavsett bildens upplösning
    ctx.save();
    ctx.lineJoin = 'round';
    // Under en övergång (#78) ritas gamla och nya läget, var och en med sin alpha; annars är alpha 1
    const items = this.transition.items(this.active);
    for (const { polity, period, alpha } of items) {
      ctx.beginPath();
      for (const rings of polygons(period.geometry)) {
        for (const ring of rings) {
          ring.forEach(([lon, lat], i) => i ? ctx.lineTo(X(lon), Y(lat)) : ctx.moveTo(X(lon), Y(lat)));
          ctx.closePath();
        }
      }
      if (polity.uncertainBorder) { // osäker gräns: mjuk kant (#73)
        ctx.globalAlpha = alpha; softEdge(ctx, polity.color, k); ctx.globalAlpha = 1; continue;
      }
      ctx.fillStyle = hexA(polity.color, 0.32 * alpha);
      ctx.fill('evenodd');
      ctx.strokeStyle = hexA(polity.color, 0.95 * alpha);
      ctx.lineWidth = 1.6 * k;
      ctx.stroke();
    }
    // Inflytandet (#75) ovanpå: glesa prickar, så att ett lydrike som själv är ett rike på kartan syns igenom
    drawInfluence(ctx, this.influence ?? [], X, Y, k);
    // Huvudlandet i ett utspritt välde (#74): samma färg men tätare fyllning och en kraftig kant
    // med mörk kontur, så att moderlandet syns bland kolonierna. Vilken del det är står i datan (period.homeland).
    for (const { polity, period, alpha } of items) {
      if (!period.homeland) continue;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      for (const rings of polygons(period.homeland)) {
        for (const ring of rings) {
          ring.forEach(([lon, lat], i) => i ? ctx.lineTo(X(lon), Y(lat)) : ctx.moveTo(X(lon), Y(lat)));
          ctx.closePath();
        }
      }
      ctx.fillStyle = hexA(polity.color, 0.4);
      ctx.fill('evenodd');
      ctx.strokeStyle = 'rgba(16,22,30,0.85)';
      ctx.lineWidth = 5 * k;
      ctx.stroke();
      ctx.strokeStyle = polity.color;
      ctx.lineWidth = 2.6 * k;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Namnen och medaljerna sist, så att de hamnar ovanpå alla områden. Vilka som syns och var namnen står
    // bestäms av _layout() (#358) i bildens grundmått (2048 i bredd) och skalas här med k.
    const L = this._layout();
    const size = 16 * k * this.labelScale;
    ctx.font = `italic ${size}px "IM Fell English", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const R = ORIGIN_R * k * this.labelScale;
    const lead = ([x1, y1, x2, y2]) => {
      ctx.strokeStyle = 'rgba(246,231,196,0.8)';
      ctx.lineWidth = 1.2 * k * this.labelScale;
      ctx.beginPath(); ctx.moveTo(x1 * k, y1 * k); ctx.lineTo(x2 * k, y2 * k); ctx.stroke();
    };
    const write = (name, x, y) => {
      ctx.lineWidth = 3.5 * k * this.labelScale;
      ctx.strokeStyle = 'rgba(16,22,30,0.8)';
      ctx.strokeText(name, x * k, y * k);
      ctx.fillStyle = '#f6e7c4';
      ctx.fillText(name, x * k, y * k);
    };
    // Bara det läge (period) som gäller nu får namn; ett område som tonas ut (#78) visar bara gränsen
    for (const { polity, period, alpha } of items) {
      const d = L.get(akey(polity, period));
      if (!d) continue;
      ctx.globalAlpha = alpha;
      // Rike med symbol (#301): medaljen på label-punkten
      if (d.medal) drawMedal(ctx, d.px * k, d.py * k, R, polity.color, this._glyph(d.medal.symbol));
      // Huvudland (#74) utan symbol: mässingsstjärnan i moderlandet
      if (d.star) star(ctx, d.px * k, d.py * k, 7 * k * this.labelScale);
      ctx.globalAlpha = this.labelAlpha * alpha;
      if (!d.name) continue;
      if (d.lead) lead(d.lead);
      write(d.name, d.x, d.y);
    }
    ctx.globalAlpha = this.labelAlpha;
    // Försvunna länder utan gräns (#72): en ring med prick i landets färg och namnet till höger. Området är för
    // litet för kartan (Neutrala Moresnet var 3,5 km²), så punkten visar bara var det låg.
    for (const g of this.activePoints ?? []) {
      if (!L.get('pt:' + g.id)) continue;
      const [lon, lat] = g.vanished.point.coordinates;
      const x = X(lon), y = Y(lat), r = 5 * k * this.labelScale;
      ctx.beginPath(); ctx.arc(x, y, r * 1.9, 0, Math.PI * 2);
      ctx.lineWidth = 3 * k * this.labelScale; ctx.strokeStyle = 'rgba(16,22,30,0.85)'; ctx.stroke();
      ctx.lineWidth = 1.6 * k * this.labelScale; ctx.strokeStyle = g.color; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = g.color; ctx.fill();
      ctx.lineWidth = 1.2 * k * this.labelScale; ctx.strokeStyle = 'rgba(16,22,30,0.85)'; ctx.stroke();
      ctx.textAlign = 'left';
      write(t(g.name), (x + r * 2.8) / k, y / k);
      ctx.textAlign = 'center';
    }
    ctx.restore();
  }
}

const box = (x, y, w, h) => ({ x0: x - w / 2, x1: x + w / 2, y0: y - h * 0.55, y1: y + h * 0.55 });
const overlaps = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const sq = (x, y, r) => ({ x0: x - r, x1: x + r, y0: y - r, y1: y + r });
const akey = (polity, period) => polity.id + '|' + period.start;

// Textens bredd utan att rita (en liten canvas för mätningen, #358)
let measureCtx = null;
function measure(text, font) {
  measureCtx ??= document.createElement('canvas').getContext('2d');
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}

const polygons = g => g.type === 'Polygon' ? [g.coordinates] : g.coordinates;

let brass = null; // --brass i css/style.css, läses första gången stjärnan ritas
const BRASS = () => (brass ??= getComputedStyle(document.documentElement).getPropertyValue('--brass').trim() || '#d6b06a');

/** En femuddig mässingsstjärna med mörk kant, märket för huvudlandet (#74). */
function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r * 0.45 : r;
    i ? ctx.lineTo(x + d * Math.cos(a), y + d * Math.sin(a)) : ctx.moveTo(x + d * Math.cos(a), y + d * Math.sin(a));
  }
  ctx.closePath();
  ctx.lineWidth = r * 0.45;
  ctx.strokeStyle = 'rgba(16,22,30,0.85)';
  ctx.stroke();
  ctx.fillStyle = BRASS();
  ctx.fill();
}

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
