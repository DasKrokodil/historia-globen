// Det fokustyperna delar (#1327): mittpunkter, urvalets spann och namnen som sökningen letar i.
import { MIN_YEAR, MAX_YEAR } from '../state.js';

/** Sökningen i Fokus (#311) letar i namnen på alla språk som datan har. */
export const langs = n => Object.values(n ?? {}).filter(Boolean);

/** Neutral mittpunkt för spridda punkter, utan att datumgränsen gör 179° och −179° till 0°. */
export function pointCenter(events) {
  const sum = events.reduce((v, e) => {
    const lat = e._lat * Math.PI / 180, lon = e._lon * Math.PI / 180, c = Math.cos(lat);
    v[0] += c * Math.cos(lon); v[1] += c * Math.sin(lon); v[2] += Math.sin(lat);
    return v;
  }, [0, 0, 0]);
  const lon = Math.atan2(sum[1], sum[0]), hyp = Math.hypot(sum[0], sum[1]);
  return [Math.atan2(sum[2], hyp) * 180 / Math.PI, lon * 180 / Math.PI];
}

/** Mittpunkt för en GeoJSON-geometri (mitten av dess yttre gränser), som [lat, lon, bredd i grader]. */
export function geoCenter(geoms) {
  let a = 180, b = -180, c = 90, d = -90;
  for (const g of geoms) for (const poly of g.type === 'Polygon' ? [g.coordinates] : g.coordinates) {
    for (const [lon, lat] of poly[0]) { a = Math.min(a, lon); b = Math.max(b, lon); c = Math.min(c, lat); d = Math.max(d, lat); }
  }
  return [(c + d) / 2, (a + b) / 2, b - a];
}

/**
 * Spannet för ett urval av händelser i tidsordning (tema och plats): från den tidigaste till den senaste, inom
 * tidslinjens gränser. En händelse före tidslinjens början nås från kortet (#892, #942). lastEnd är det verkliga
 * slutet, som står i titeln.
 */
export function selectionSpan(events) {
  const lastEnd = Math.max(...events.map(e => e.end));
  const from = Math.min(Math.max(MIN_YEAR, events[0].start), MAX_YEAR), to = Math.max(from, Math.min(MAX_YEAR, lastEnd));
  return { from, to, lastEnd };
}
