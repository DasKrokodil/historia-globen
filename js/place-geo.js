// Platsernas gräns (#579): vilka händelser som ligger inom dagens gräns för en plats. Ren funktion utan DOM,
// så att testerna kan dela den. Gränsen är en GeoJSON-MultiPolygon i WGS 84, [longitud, latitud] (data/platser.json).

/** Ligger punkten i ringen? Jämn-udda-regeln. */
function inRing(ring, lon, lat) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Ligger punkten inom geometrin (Polygon eller MultiPolygon)? Hål i polygonen räknas som utanför. */
export function inGeometry(geometry, lon, lat) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polys.some(([outer, ...holes]) => inRing(outer, lon, lat) && !holes.some(h => inRing(h, lon, lat)));
}

/** Kortaste avståndet i km från punkten till geometrins kant (platt närmevärde, duger för några tiotal km). */
export function edgeKm(geometry, lon, lat) {
  const k = Math.cos(lat * Math.PI / 180);
  let best = Infinity;
  for (const poly of geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates) {
    for (const ring of poly) {
      for (let i = 1; i < ring.length; i++) {
        const ax = (ring[i - 1][0] - lon) * k, ay = ring[i - 1][1] - lat, bx = (ring[i][0] - lon) * k, by = ring[i][1] - lat;
        const dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy;
        const u = len ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len)) : 0;
        best = Math.min(best, Math.hypot(ax + u * dx, ay + u * dy) * 111.2);
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
/** Rutan i vanliga longituder (utan uppvikning) och dess yta, till för att sålla bort platser snabbt vid uppslag. */
function rawBox(geometry) {
  let box = boxCache.get(geometry);
  if (!box) {
    let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
    for (const poly of geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates) {
      for (const [lon, lat] of poly[0]) { west = Math.min(west, lon); east = Math.max(east, lon); south = Math.min(south, lat); north = Math.max(north, lat); }
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
    if (lon < box.west || lon > box.east || lat < box.south || lat > box.north || box.area >= bestArea) continue;
    if (inGeometry(g, lon, lat)) { best = place; bestArea = box.area; }
  }
  return best;
}

/** Händelserna (med _lon och _lat, som model.js sätter) som ligger inom platsens gräns, i tidsordning. */
export function placeEvents(place, events) {
  return events.filter(e => e._lon != null && (inGeometry(place.boundary.geometry, e._lon, e._lat) || edgeKm(place.boundary.geometry, e._lon, e._lat) <= COAST_MARGIN_KM)).sort((a, b) => a.start - b.start);
}
