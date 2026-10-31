// Vad som syns på vilken zoomnivå (#358): tre nivåer, samma på globen och i Platt vy.
// Nivån räknas ur hur stor kartbilden (4096 × 2048, beslut 1) ser ut på skärmen: skärmpixlar per bildpunkt.
// På globen mäts det mitt på klotet (kamerans avstånd), i Platt vy är det kartans skala (zoomfaktorn).
// Samma mått på båda ställena gör att trängseln blir lika: det som ryms på skärmen är det som avgör.
// En mobil (400 px) ser jorden mindre och stannar därför längre på nivån "hela världen".
//
// Alla tröskelvärden står här, på ett ställe. Vilka riken som får namn och medalj räknas fram ur datan
// (rikets yta det året, areaKm2) i AreasLayer (layers/areas.js); här står bara hur många som får plats per nivå.
import { MIN_PX as MEDAL_MIN_PX } from '../layers/origins.js';
import { latLonToVec3 } from '../globe.js';

/**
 * Nivåerna, från utzoomat till inzoomat. minPx = lägsta antal skärmpixlar per bildpunkt för nivån.
 * names = högst så många riken (de största först) får namn och medalj; resten döljs tills man zoomar in.
 * flatScale = namnens och medaljernas storlek på kartbilden i Platt vy (1 = grundstorleken). Mindre när man har
 * zoomat in, så att fler namn ryms utan att täcka varandra och texten inte blir jättestor på skärmen.
 */
export const ZOOM_LEVELS = [
  { id: 'world', name: 'Hela världen', minPx: 0, names: 14, flatScale: 1 },
  { id: 'region', name: 'Världsdel', minPx: 0.55, names: 40, flatScale: 0.7 },
  { id: 'close', name: 'Inzoomat', minPx: 1.1, names: Infinity, flatScale: 0.4 },
];

/** Nivåns nummer (0 = hela världen, 1 = världsdel, 2 = inzoomat) för pxPerImg skärmpixlar per bildpunkt. */
export function zoomLevel(pxPerImg) {
  let lvl = 0;
  ZOOM_LEVELS.forEach((z, i) => { if (pxPerImg >= z.minPx) lvl = i; });
  return lvl;
}

/** Skärmpixlar per bildpunkt mitt på klotet (samma mått som frameMedals i layers/origins.js). */
export function globePxPerImg(globe) {
  const cam = globe.camera, h = globe.canvas.clientHeight || 1;
  const perPx = 2 * Math.max(0.2, cam.position.z - 1) * Math.tan(cam.fov / 2 * Math.PI / 180) / h; // klotradien är 1
  return (2 * Math.PI / 4096) / perPx;
}

/** Skärmpixlar per bildpunkt där kartan visas just nu: Platt vys skala när den är öppen, annars globens. */
export function pxPerImg(globe, flatMap) {
  return flatMap.hidden ? globePxPerImg(globe) : flatMap.scale;
}

/** Det AreasLayer.setView behöver om zoomen: nivån, skärmpixlar per bildpunkt och 3D-medaljens minsta storlek
 *  (bara på globen; i Platt vy ritas medaljen på kartbilden och har ingen minsta storlek). */
export function zoomView(globe, flatMap) {
  const px = pxPerImg(globe, flatMap);
  return { level: zoomLevel(px), pxPerImg: px, minMedalPx: flatMap.hidden ? MEDAL_MIN_PX : 0 };
}

/** Hur många av de viktigaste händelserna vars markörer rikesnamnen och medaljerna håller sig borta från
 *  (samma antal som högst får etikett i placeLabels, ui/clusters.js). */
export const EVENT_MARKERS = 14;

/**
 * Händelser som rikesnamn och medaljer viker för (#358). visible = listan från EventsLayer.update ([{ e, activity }]).
 * Den valda händelsen och Samtidigt-kortets händelser har alltid företräde, med plats för etiketten ovanför markören
 * (w × h, som i placeLabels i ui/clusters.js). För de viktigaste av de andra hålls bara markören fri; deras etiketter
 * viker i stället för rikena (empireBlocks nedan). Returnerar [{ lon, lat, r, w, h }] i skärmpixlar (w = 0: ingen etikett).
 */
export function eventKeepouts(visible, { selectedId, highlight = new Set(), text }) {
  const first = ({ e }) => e.id === selectedId || highlight.has(e.id);
  const rest = visible.filter(v => !first(v)).sort((a, b) => b.activity - a.activity).slice(0, EVENT_MARKERS);
  return [
    ...visible.filter(first).map(({ e }) => ({ lon: e._lon, lat: e._lat, r: 12, w: text(e).length * 6.6 + 30, h: 22 })),
    ...rest.map(({ e }) => ({ lon: e._lon, lat: e._lat, r: 11, w: 0, h: 0 })),
  ];
}

/**
 * Rikesnamnen och medaljerna som rutor på skärmen (#358), så att händelseetiketterna inte hamnar på dem
 * (blocked i placeLabels). boxes = AreasLayer.placedBoxes() ([{ lon, lat, hw, hh }], halva bredden och höjden i
 * kartbildens grundmått, 2048 i bredd). project(lat, lon) ger { x, y, facing } på skärmen och unit skärmpixlar per
 * grundmåttsenhet. På globen (globe = true) blir rutorna smalare mot polerna, som bilden på klotet.
 */
export function empireBlocks(boxes, project, unit, globe = false) {
  const out = [];
  for (const b of boxes) {
    const p = project(b.lat, b.lon);
    if ((p.facing ?? 1) < 0.2) continue;
    const hw = b.hw * unit * (globe ? Math.cos(b.lat * Math.PI / 180) : 1), hh = b.hh * unit;
    out.push({ x0: p.x - hw, x1: p.x + hw, y0: p.y - hh, y1: p.y + hh });
  }
  return out;
}

/** Samma rutor på globen, varje bildruta (globe.onFrame i main.js): rikenas namn och medaljer där de syns just nu. */
export function globeEmpireBlocks(areas, globe) {
  return empireBlocks(areas.placedBoxes(), (lat, lon) => globe.project(latLonToVec3(lat, lon, 1)), 2 * globePxPerImg(globe), true);
}
