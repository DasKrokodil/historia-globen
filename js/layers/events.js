// Lagertyp "punkt" (beslut 2): händelser som punkter på globen.
// Varje lager har samma gränssnitt: update(state) och drawOverlay(ctx, W, H).
import { THREE, latLonToVec3, R } from '../globe.js';
import { CAT, isVisibleReview, t } from '../model.js';
import { Z } from './registry.js';

// Ikonfamiljen (#242): alla markörer är samma mässingsmedalj. Mörk botten, mässingsring och en inre
// cirkel i kategorins färg; bara symbolen i mitten (img/icons/, egna teckningar) skiljer. Händelser
// utan ikon får en prick i kategorins färg i mitten. Medaljen kodar också tre saker:
//   tid        – nedre bågen utanför ringen är en liten tidslinje: hela bågen lyser när händelsen pågår vid
//                året man står på, vänstra delen när den redan har hänt, högra delen när den kommer senare
//   betydelse  – en mässingspunkt uppe till höger för top och major
//   osäkerhet  – bågen är streckad när årtalet är osäkert (edtf med ~ eller ?, eller rutan "Källorna skiljer sig")
// Progressiv detalj: liten på skärmen (under cirka 30 px) ritas bara medaljen med symbol och punkt, större
// ritas hela medaljen med tidsbågen. Samma betydelse står i etikettens aria-label och title (describeMarker).
const BRASS = '#d6b06a', GROUND = '#10202c', INK = '#0b1219', GOLD = '#f1d98a', TRACK = 'rgba(214,176,106,0.35)';
const FULL_PX = 30;  // från den här storleken på skärmen ritas hela medaljen (ungefär från zoom 1,4 i datorn)
const MIN_PX = 16;   // minsta storlek på skärmen, även i mobilen (16–26 px beroende på hur aktuell händelsen är)
const MAX_PX = 48;   // största storlek: vid stark zoom växer markörerna inte längre (texturen är 128 px)

// Symbolerna laddas en gång per ikon, med lite kraftigare linjer än i Samtidigt-kortet så att de syns i 16 px
const glyphs = new Map(); // namn -> { img, ready, waiting: [textur] }
export function glyph(name) {
  if (glyphs.has(name)) return glyphs.get(name);
  const gl = { img: new Image(), ready: false, waiting: [] };
  glyphs.set(name, gl);
  fetch(`img/icons/${name}.svg`).then(r => r.text()).then(svg => {
    gl.img.onload = () => { gl.ready = true; for (const w of gl.waiting) w(); gl.waiting = []; };
    gl.img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace(/stroke-width="[\d.]+"/, 'stroke-width="2.1"'));
  }).catch(err => console.warn(`Ikonen ${name} kunde inte laddas`, err));
  return gl;
}

/** Hur markören ska se ut: tidsläge (now, past, future), betydelse och osäkerhet. */
export function markerInfo(e, when = 'now') {
  const unsure = /[~?]/.test(e.edtf ?? '') || t(e.note?.title) === 'Källorna skiljer sig';
  return { when, major: !!(e.top || e.major), unsure };
}

/** Samma betydelse som medaljen, i ord (för aria-label och title). */
export function describeMarker(info) {
  const parts = [{ now: 'pågår vid året du står på', past: 'har redan hänt', future: 'kommer senare' }[info.when]];
  if (info.major) parts.push('viktig händelse');
  if (info.unsure) parts.push('osäker uppgift');
  return parts.join(', ');
}

/**
 * Markörens storlek på skärmen och detaljnivå (#242), på globen och i Platt vy (#313). want är storleken
 * zoomen ger (px); markören är minst MIN_PX–MIN_PX + 6 px (mer för aktuella händelser och mer för vald eller
 * framhävd, big), högst MAX_PX, och ritas som hel medalj från FULL_PX.
 */
export function medalSize({ big, activity }, want) {
  const minPx = big ? MIN_PX + 10 : MIN_PX + 6 * activity;
  let px = Math.min(Math.max(want, minPx), big ? MAX_PX + 8 : MAX_PX);
  const full = px >= FULL_PX;
  if (full) px *= 55 / 46; // den hela medaljen har tidsbågen utanför ringen: ringen ska inte krympa
  return { px, full };
}

const medalCache = new Map();
export function medalTexture(icon, color, { when, major, unsure }, full) {
  const key = [icon, color, full ? when : '', major, full && unsure, full].join('|');
  if (medalCache.has(key)) return medalCache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  // Liten: medaljen fyller nästan hela bilden. Hel: plats för tidsbågen utanför ringen.
  const ring = full ? 46 : 55, ringW = full ? 7 : 9, inner = full ? 38 : 45, glyphSize = full ? 50 : 62;
  const draw = () => {
    g.clearRect(0, 0, 128, 128);
    if (full) {
      // Tidsbågen: nedre halvan (0 = höger, π = vänster). Spåret syns svagt, delen som gäller lyser.
      const AR = 58; // tidsbågens radie
      // Mörk kant under bågen, så att den syns mot både hav, land och krigsområden i samma färg
      g.lineCap = 'butt'; g.setLineDash([]);
      g.lineWidth = 12; g.strokeStyle = 'rgba(11,18,25,0.75)';
      g.beginPath(); g.arc(64, 64, AR, 0.06, Math.PI - 0.06); g.stroke();
      g.lineWidth = 7; g.strokeStyle = TRACK;
      g.beginPath(); g.arc(64, 64, AR, 0.1, Math.PI - 0.1); g.stroke();
      const [a0, a1] = when === 'now' ? [0.1, Math.PI - 0.1] : when === 'future' ? [0.1, 1.15] : [Math.PI - 1.15, Math.PI - 0.1];
      g.strokeStyle = color; g.lineWidth = 8;
      g.setLineDash(unsure ? [9, 6] : []);
      g.beginPath(); g.arc(64, 64, AR, a0, a1); g.stroke();
      g.setLineDash([]);
    }
    g.fillStyle = GROUND;
    g.beginPath(); g.arc(64, 64, ring, 0, Math.PI * 2); g.fill();
    g.lineWidth = ringW; g.strokeStyle = BRASS;
    g.beginPath(); g.arc(64, 64, ring, 0, Math.PI * 2); g.stroke();
    g.lineWidth = full ? 2.5 : 3.5; g.strokeStyle = color;
    g.beginPath(); g.arc(64, 64, inner, 0, Math.PI * 2); g.stroke();
    if (!icon) {
      g.fillStyle = color;
      g.beginPath(); g.arc(64, 64, full ? 13 : 17, 0, Math.PI * 2); g.fill();
    } else {
      const gl = glyph(icon);
      if (gl.ready) g.drawImage(gl.img, 64 - glyphSize / 2, 64 - glyphSize / 2, glyphSize, glyphSize);
    }
    if (major) {
      const d = full ? 44 : 46, r = full ? 11 : 15;
      const x = 64 + d * Math.SQRT1_2, y = 64 - d * Math.SQRT1_2;
      g.fillStyle = GOLD; g.lineWidth = 5; g.strokeStyle = INK;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    tex.needsUpdate = true;
  };
  draw();
  if (icon && !glyph(icon).ready) glyph(icon).waiting.push(draw);
  medalCache.set(key, tex);
  return tex;
}

/**
 * Lagrets post i registret (#338): på som standard. Avslaget lager eller bortfiltrerad kategori visar ändå
 * händelserna i det öppna Samtidigt-kortet (highlight). update returnerar de synliga händelserna till listan.
 */
export function entry({ globe, data }) {
  const layer = new EventsLayer(globe, data.events);
  const none = new Set();
  return {
    id: 'events', name: 'Händelser', group: 'people', menu: { on: true }, layer, z: Z.events,
    enabled: s => s.layers.events,
    update: s => layer.update({ year: s.year, window: s.window, filters: s.layers.events ? s.filters : none,
      selectedId: s.selectedId, highlight: s.highlight, focusId: s.focusWar?.id, span: s.span }),
    frame: (now, s) => layer.frame(now, s.selectedId),
    frameAnimating: s => !s.calm && layer.hasSelected(s.selectedId),
    drawOverlay: (ctx, W, H) => layer.drawOverlay(ctx, W, H),
  };
}

export class EventsLayer {
  constructor(globe, events) {
    this.globe = globe;
    this.events = events;
    this.state = new Map(); // id -> { activity, inside, dist, when, fought, opacity }
    this.sprites = [];
    this.byId = new Map(); // händelse-id -> sprite
    for (const e of events) {
      const [lon, lat] = e.location.coordinates;
      e._lat = lat; e._lon = lon;
      e._pos = latLonToVec3(lat, lon, R * 1.012);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
      s.position.copy(e._pos);
      s.scale.setScalar(0.034);
      s.userData.event = e;
      s.userData.color = CAT[e.category]?.color ?? '#ffffff';
      s.userData.full = false;
      s.visible = false;
      this.globe.markerGroup.add(s);
      this.sprites.push(s);
      this.byId.set(e.id, s);
    }
  }

  /** Den valda markören pulserar bara när den faktiskt är synlig. */
  hasSelected(id) { return !!id && !!this.byId.get(id)?.visible; }

  /** Byter medaljens bild när tidsläget eller detaljnivån ändras (texturerna återanvänds ur medalCache). */
  _paint(s) {
    const { event: e, color, info, full } = s.userData;
    const map = medalTexture(e.icon, color, info, full);
    if (s.material.map !== map) { s.material.map = map; s.material.needsUpdate = true; }
  }

  /**
   * year: nuvarande år. window: hur många år före/efter som räknas som "samtidigt".
   * span (valfritt): händelsens tid som [början, slut]. I fokusläget för korta krig är det datum ur edtf (#204).
   * Returnerar händelserna som syns, de pågående först.
   */
  update({ year, window, filters, selectedId, highlight, focusId = null, span = e => [e.start, e.end] }) {
    const visible = [];
    for (const s of this.sprites) {
      const e = s.userData.event;
      // Händelser i ett krig: utzoomat syns bara den viktigaste (top). I fokusläge
      // syns krigets alla händelser. Valda händelser syns alltid.
      const onMap = !e.partOf || e.top || e.partOf === focusId || e.id === selectedId;
      const okFilter = onMap && filters.has(e.category) && isVisibleReview(e.review);
      // Händelserna i Samtidigt-kortet syns alltid, så att kortets bågar har markörer i båda ändar,
      // också när lagret Händelser är avslaget eller kategorin filtrerad bort. De räknas inte i listan.
      const shown = okFilter || (highlight.has(e.id) && isVisibleReview(e.review));
      const [s0, s1] = span(e);
      const inside = year >= s0 && year <= s1;
      const dist = inside ? 0 : Math.min(Math.abs(year - s0), Math.abs(year - s1));
      const near = dist <= window;
      // I fokusläge ligger krigets redan utkämpade slag kvar, lite svagare
      const fought = e.partOf === focusId && s1 < year;
      const activity = !shown ? 0 : inside ? 1 : near ? 1 - 0.6 * dist / Math.max(1, window) : fought ? 0.45 : 0;
      const when = inside ? 'now' : s1 < year ? 'past' : 'future';
      // Utanför Fokus gör det lägre tonläget tydligt att händelsen bara ligger i tidsfönstret.
      // Redan utkämpade slag i Fokus behåller sin tidigare svaga visning (#434).
      const opacity = inside || fought ? 0.45 + 0.55 * activity : Math.min(0.45, activity);
      this.state.set(e.id, { activity, inside, dist, when, fought, opacity });
      s.userData.info = markerInfo(e, when);
      s.userData.big = e.id === selectedId || highlight.has(e.id);
      s.userData.activity = activity;
      s.visible = activity > 0;
      s.userData.active = activity > 0; // klustringen döljer markörer som ingår i ett kluster
      s.material.opacity = opacity;
      s.userData.baseScale = (s.userData.big ? 0.078 : 0.045 + 0.018 * activity);
      if (activity > 0) this._paint(s);
      if (activity > 0 && okFilter) visible.push({ e, activity, inside, dist });
    }
    visible.sort((a, b) => (b.inside - a.inside) || (a.dist - b.dist) || (a.e.start - b.e.start));
    return visible;
  }

  /** Ritar ett mjukt sken per synlig händelse på den platta lagerbilden. */
  drawOverlay(ctx, W, H) {
    const k = W / 2048; // skenet blir lika stort oavsett bildens upplösning
    for (const e of this.events) {
      const st = this.state.get(e.id);
      if (!st || st.activity <= 0 || (!st.inside && !st.fought)) continue;
      const x = (e._lon + 180) / 360 * W, y = (90 - e._lat) / 180 * H;
      const r = (26 + 18 * st.activity) * k;
      const col = CAT[e.category]?.color ?? '#ffffff';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, hexA(col, 0.55 * st.activity));
      g.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }

  /**
   * Varje bildruta: storlek på skärmen och detaljnivå (#242). Markören är minst MIN_PX–MIN_PX + 6 px stor (mer
   * för aktuella händelser), växer med zoomen upp till MAX_PX och ritas som hel medalj från FULL_PX. Vald händelse pulserar.
   */
  frame(t, selectedId) {
    const cam = this.globe.camera, h = this.globe.canvas.clientHeight || 1;
    // Världsenheter per pixel vid klotets framsida
    const perPx = 2 * Math.max(0.2, cam.position.z - R) * Math.tan(cam.fov / 2 * Math.PI / 180) / h;
    for (const s of this.sprites) {
      if (!s.visible) continue;
      const u = s.userData;
      const { px, full } = medalSize(u, u.baseScale / perPx);
      if (full !== u.full) { u.full = full; this._paint(s); }
      const pulse = u.event.id === selectedId ? 1 + 0.12 * Math.sin(t / 240) : 1;
      u.px = px; // storleken på skärmen, för etiketterna i main.js
      s.scale.setScalar(px * perPx * pulse);
    }
  }
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
}
