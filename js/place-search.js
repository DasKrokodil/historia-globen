// "Vad hände här?" (#15): sök en plats ur de platsnamn som redan finns i händelsernas `place` och lista händelserna
// inom ett avstånd, i tidsordning. Ingen geokodning och ingen ny data: bara platser som står i datan går att hitta.
// Filen har inga importer från webbläsaren och testas i node (tests/place-search.test.mjs).
import { normalize } from './search-index.js';

/** Radien i kilometer (beslut 2026-11-06). */
export const RADIUS_KM = 300;

const lat = e => e._lat ?? e.location?.coordinates?.[1];
const lon = e => e._lon ?? e.location?.coordinates?.[0];
const hasPoint = e => Number.isFinite(lat(e)) && Number.isFinite(lon(e));
const allLangs = v => (v == null ? [] : typeof v === 'string' ? [v] : Object.values(v).filter(x => typeof x === 'string'));

/** Storcirkelavstånd i kilometer mellan två punkter i grader (haversine, jordradie 6371 km). */
export function distanceKm(lat1, lon1, lat2, lon2) {
  const rad = d => d * Math.PI / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Platsförslag för en sökning: [{ label, lat, lon }]. Alla sökord ska finnas i platsnamnet (på något språk), och
 * namn som börjar med första ordet kommer först. Samma namn på sidans språk ger ett förslag; det första
 * förekommande koordinaterna används som mitt. t(text) väljer text på sidans språk, visible(review) säger om en
 * händelse får visas.
 */
export function placeSuggestions(events, query, { t = x => x?.sv ?? x, visible = () => true, limit = 20 } = {}) {
  const words = normalize(query).split(' ').filter(Boolean);
  if (!words.length) return [];
  const seen = new Map();
  for (const e of events) {
    if (!visible(e.review) || !hasPoint(e) || !e.place) continue;
    const label = t(e.place);
    if (!label) continue;
    const texts = allLangs(e.place).map(normalize);
    if (!words.every(w => texts.some(s => s.includes(w)))) continue;
    const key = normalize(label);
    if (!seen.has(key)) seen.set(key, { label, lat: lat(e), lon: lon(e), rank: texts.some(s => s.startsWith(words[0])) ? 0 : 1 });
  }
  return [...seen.values()].sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label, 'sv'))
    .slice(0, limit).map(({ label, lat, lon }) => ({ label, lat, lon }));
}

/**
 * Händelserna inom radien runt en plats ({ lat, lon }), äldst först (sedan titel). Varje träff är
 * { event, km, approximate }, där approximate är sant när platsen bara är ungefärlig (`locationPrecision`).
 */
export function eventsNear(events, center, { radiusKm = RADIUS_KM, visible = () => true, t = x => x?.sv ?? x } = {}) {
  if (!center || !Number.isFinite(center.lat) || !Number.isFinite(center.lon)) return [];
  return events
    .filter(e => visible(e.review) && hasPoint(e))
    .map(event => ({ event, km: distanceKm(center.lat, center.lon, lat(event), lon(event)), approximate: !!event.locationPrecision }))
    .filter(h => h.km <= radiusKm)
    .sort((a, b) => a.event.start - b.event.start || String(t(a.event.title)).localeCompare(String(t(b.event.title)), 'sv'));
}
