// Punkt mot område med marginal (#1524): vilket rike (eller religionsområde) ligger en punkt i? Rikenas gränser kommer ur Cliopatria och
// är förenklade (data/empires/, koordinater i 0,1 grader), så en kuststad som Köpenhamn (55,676° N, 12,569° Ö) kan ligga cirka 0,015
// grader utanför Danmarks gräns och skulle då sakna rike. Därför gäller: ligger punkten inte i något område väljs det område vars
// gräns ligger närmast, om det är inom marginalen. Gränserna på kartan ändras inte; marginalen gäller bara uppslaget.
// Ren funktion utan DOM, delad av religionslagret (js/layers/religions.js) och testerna. Punkt i polygon och avstånd till gränsen kommer
// från place-geo.js (samma ringar, hål och datumlinjen som platserna), så det finns en enda kopia av geometrin.
import { inGeometry, edgeKm } from './place-geo.js';

/** Marginalen i grader på marken (cirka 5,5 km): längre bort än så är punkten utanför, till exempel i havet. */
export const AREA_MARGIN_DEG = 0.05;

/**
 * Marginalen för religionsområdena i klick och pekare (religions.js). Områdena är rikena sammanslagna per religion och förenklade en
 * gång till, så kusten ligger längre in: Köpenhamn är 0,05–0,11 grader utanför kristendomens område (data/religions.json) mot
 * 0,015 utanför rikets egen gräns. 0,15 grader (cirka 11–17 km) fångar kuststäderna utan att havet i närheten får något område.
 */
export const RELIGION_MARGIN_DEG = 0.15;

/** Samma jordradie som edgeKm i place-geo.js: km per grad. */
const KM_PER_DEG = 111.2;

/**
 * Avståndet i grader på marken från punkten till geometrins kant (längdgrader skalas med cos(latitud)), eller `within` om kanten ligger
 * längre bort. `within` gör sökningen snabb när bara närheten är intressant.
 */
export function edgeDeg(geometry, lon, lat, within = Infinity) {
  return edgeKm(geometry, lon, lat, within * KM_PER_DEG) / KM_PER_DEG;
}

/**
 * Vilka områden ligger punkten i? items = vilka som helst poster; geometry(item) ger områdets GeoJSON (Polygon eller MultiPolygon).
 * Ger { items, viaMargin }:
 *  - punkten ligger inom ett eller flera områden: de, i indatans ordning, viaMargin false (marginalen används inte, så en punkt mitt i
 *    ett rike ändras aldrig);
 *  - annars det område vars gräns ligger närmast om avståndet är mindre än `margin` grader (viaMargin true; vid lika avstånd det första);
 *  - annars en tom lista (till exempel en punkt i havet).
 */
export function areaAt(items, lon, lat, { geometry = item => item.geometry, margin = AREA_MARGIN_DEG } = {}) {
  const inside = items.filter(item => inGeometry(geometry(item), lon, lat));
  if (inside.length) return { items: inside, viaMargin: false };
  let best = null, bestD = margin;
  for (const item of items) {
    const d = edgeDeg(geometry(item), lon, lat, bestD);
    if (d < bestD) { best = item; bestD = d; }
  }
  return { items: best ? [best] : [], viaMargin: !!best };
}
