// Platsernas gräns (#579): vilka händelser som ligger inom dagens gräns för en plats. Ren funktion utan DOM,
// så att testerna kan dela den. Gränsen är en GeoJSON-MultiPolygon i WGS 84, [longitud, latitud] (data/platser.json).

const ringCache = new WeakMap();
/**
 * Ringen uppvikt som traceRing i layers/area-style.js (#1268): varje punkt ligger på den längdgrad som är närmast den förra, så
 * att en ring som korsar datumlinjen (180°) går den korta vägen över den och inte tvärs över kartan. Datan delas redan vid
 * 180° av tools/platser_gransar.py, så ringarna är oftast oförändrade; det här är körningsskyddet för en ring som ändå hoppar.
 * Ger { pts, min, max }: punkterna och deras längdgradsspann. Sparas per ring.
 */
function unwrapped(ring) {
  let info = ringCache.get(ring);
  if (info) return info;
  let prev = null, min = Infinity, max = -Infinity, changed = false;
  const pts = ring.map(([lon, lat]) => {
    const x = prev === null ? lon : lon - 360 * Math.round((lon - prev) / 360);
    if (x !== lon) changed = true;
    prev = x; min = Math.min(min, x); max = Math.max(max, x);
    return [x, lat];
  });
  info = { pts: changed ? pts : ring, min, max };
  ringCache.set(ring, info);
  return info;
}

/** Ligger punkten i ringen? Jämn-udda-regeln, med punkten som längdgrad lon och lon ± 360 (en ring över datumlinjen). */
function inRing(ring, lon, lat) {
  const { pts, min, max } = unwrapped(ring);
  for (const shift of [0, 360, -360]) {
    const x = lon + shift;
    if (x < min || x > max) continue;
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > lat) !== (yj > lat) && x < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    if (inside) return true;
  }
  return false;
}

/** Ligger punkten inom geometrin (Polygon eller MultiPolygon)? Hål i polygonen räknas som utanför. */
export function inGeometry(geometry, lon, lat) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polys.some(([outer, ...holes]) => inRing(outer, lon, lat) && !holes.some(h => inRing(h, lon, lat)));
}

/**
 * Kortaste avståndet i km från punkten till geometrins kant (platt närmevärde, duger för några tiotal km). Ringen viks upp
 * och punkten prövas som lon och lon ± 360, så att 179,5° och −179,5° är en grad från varandra. Segment där båda ändpunkterna
 * ligger på ±180 är sömmen där datan delats vid datumlinjen (#1268) och räknas inte som kust.
 */
export function edgeKm(geometry, lon, lat) {
  const k = Math.cos(lat * Math.PI / 180);
  let best = Infinity;
  for (const poly of geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates) {
    for (const ring of poly) {
      const { pts, min, max } = unwrapped(ring);
      for (const shift of [0, 360, -360]) {
        const px = lon + shift;
        if (Math.max(min - px, px - max, 0) * k * 111.2 >= best) continue; // ringens ruta ligger längre bort än bästa hittills
        for (let i = 1; i < pts.length; i++) {
          if (Math.abs(ring[i - 1][0]) === 180 && Math.abs(ring[i][0]) === 180) continue;
          const ax = (pts[i - 1][0] - px) * k, ay = pts[i - 1][1] - lat, bx = (pts[i][0] - px) * k, by = pts[i][1] - lat;
          const dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy;
          const u = len ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len)) : 0;
          best = Math.min(best, Math.hypot(ax + u * dx, ay + u * dy) * 111.2);
        }
      }
    }
  }
  return best;
}

/**
 * Kustmarginal: 1:50m-kusten är grov, så en plats vid kusten (Nuuk, Auckland, Golden Bay) kan hamna några
 * kilometer utanför linjen. Händelser inom så här många km från gränsen räknas som inom den. Ingen händelse i datan
 * ligger inom 20 km från en annan plats gräns; validate-site.py och testerna räknar med samma marginal.
 */
export const COAST_MARGIN_KM = 20;

/** Gränsrutan { west, east, south, north } för alla ringar i geometrin, med longituderna uppvikta kring centerLon. */
function boundsOf(geometry, centerLon = 0) {
  let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
  for (const poly of geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates) {
    for (const [lon, lat] of poly[0]) {
      const x = centerLon + (((lon - centerLon + 180) % 360) + 360) % 360 - 180; // närmast centerLon, så att datumgränsen inte spränger rutan
      west = Math.min(west, x); east = Math.max(east, x); south = Math.min(south, lat); north = Math.max(north, lat);
    }
  }
  return { west, east, south, north };
}

/**
 * Rutan runt platsens yttre gräns, för att rama in den i Platt vy (#1161). Longituderna viks upp kring centerLon
 * (platsens `view.center`), så att Aotearoa med Chathamöarna (över datumgränsen) blir 18 grader bred och inte 340.
 */
export function placeBounds(place, centerLon = place.view?.center?.[1] ?? 0) {
  return boundsOf(place.boundary.geometry, centerLon);
}

const boxCache = new WeakMap();
/** Rutan i längdgrader (uppvikt per ring, så den kan gå förbi ±180) och dess yta, till för att sålla bort platser snabbt vid uppslag. */
function rawBox(geometry) {
  let box = boxCache.get(geometry);
  if (!box) {
    let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
    for (const poly of geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates) {
      const { pts } = unwrapped(poly[0]); // uppvikt, så att en ring som hoppar över datumlinjen får rätt ruta (#1268)
      for (const [lon, lat] of pts) { west = Math.min(west, lon); east = Math.max(east, lon); south = Math.min(south, lat); north = Math.max(north, lat); }
    }
    box = { west, east, south, north, area: (east - west) * (north - south) };
    boxCache.set(geometry, box);
  }
  return box;
}

/**
 * Platsen under en punkt (#1161): den vars gräns innehåller punkten, annars null. Bara dagens gräns räknas, utan
 * kustmarginalen (ett tryck i havet utanför kusten är inte ett tryck på platsen). Ligger punkten inom flera platser
 * (ett landskap inom ett land) väljs den minsta, det vill säga den mest precisa. places är platserna som har ett kort.
 */
export function placeAt(places, lon, lat) {
  let best = null, bestArea = Infinity;
  for (const place of places) {
    const g = place.boundary?.geometry;
    if (!g) continue;
    const box = rawBox(g);
    if (![0, 360, -360].some(shift => lon + shift >= box.west && lon + shift <= box.east) || lat < box.south || lat > box.north || box.area >= bestArea) continue;
    if (inGeometry(g, lon, lat)) { best = place; bestArea = box.area; }
  }
  return best;
}

/** Händelserna (med _lon och _lat, som model.js sätter) som ligger inom platsens gräns, i tidsordning. */
export function placeEvents(place, events) {
  return events.filter(e => e._lon != null && (inGeometry(place.boundary.geometry, e._lon, e._lat) || edgeKm(place.boundary.geometry, e._lon, e._lat) <= COAST_MARGIN_KM)).sort((a, b) => a.start - b.start);
}
