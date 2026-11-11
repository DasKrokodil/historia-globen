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

/** Händelserna (med _lon och _lat, som model.js sätter) som ligger inom platsens gräns, i tidsordning. */
export function placeEvents(place, events) {
  return events.filter(e => e._lon != null && (inGeometry(place.boundary.geometry, e._lon, e._lat) || edgeKm(place.boundary.geometry, e._lon, e._lat) <= COAST_MARGIN_KM)).sort((a, b) => a.start - b.start);
}
