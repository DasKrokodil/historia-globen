// Stegningen mellan en resas stopp (#1380, steg B i #231): rena funktioner utan webbläsaren, delade med nodeproven
// (tests/route-steps.test.mjs). Stoppen är det routeStops() i js/layers/lines.js ger: { place, at, day, date, key } i tidsordning.
// js/controllers/playback.js äger köerna och pausraden och använder det här för att veta vilket stopp som är nästa.

/** Så nära ett stopps år ska tiden stå för att adressens avrundade år (fyra decimaler, js/url-state.js) räknas som stoppet. */
export const YEAR_EPSILON = 0.0006;

/**
 * Vilket stopp står tiden på? Index i stops, eller -1 om inget stopp ligger på året. Flera stopp kan ha samma år på en
 * resa i årstakt (Palembang och Nanjing 1407): då ger en adress det första av dem, eftersom adressen bara har året.
 */
export function stopIndexAt(stops, year) {
  return stops.findIndex(s => Math.abs(s.at - year) <= YEAR_EPSILON);
}

/**
 * Stoppet ett steg bort: index i stops, eller null när det inte finns något (före det första, efter det sista) eller
 * när utgångsläget saknas (index utanför listan, till exempel -1 när tiden inte står på ett stopp).
 */
export function stepTarget(stops, index, direction) {
  if (!Number.isInteger(index) || index < 0 || index >= stops.length) return null;
  const to = index + (direction < 0 ? -1 : 1);
  return to >= 0 && to < stops.length ? to : null;
}

/**
 * Knapparna vid ett stopp: { n, total, hasPrev, hasNext }. Med färre än två stopp finns inget att stega mellan, och då
 * visas inga knappar (hasPrev och hasNext är false): en resa utan daterade stopp ska inte ge ett fel eller döda knappar.
 */
export function stepState(stops, index) {
  const total = stops.length;
  if (total < 2 || !Number.isInteger(index) || index < 0 || index >= total) return { n: 0, total, hasPrev: false, hasNext: false };
  return { n: index + 1, total, hasPrev: index > 0, hasNext: index < total - 1 };
}

/**
 * Stoppen som ska ligga i kön efter att man har stegat till stoppet index: de följande stoppen med samma år. De visas av
 * Fortsätt före uppspelningen går vidare, eftersom tiden redan står på deras år och uppspelningen annars aldrig passerar dem.
 */
export function followersAtSameTime(stops, index) {
  const out = [];
  for (let i = index + 1; i < stops.length && stops[i].at <= stops[index].at; i++) out.push(stops[i]);
  return out;
}

/** Nycklarna till stoppen till och med index: de räknas som visade, så att Fortsätt går vidare i stället för att visa dem igen. */
export function keysThrough(stops, index) {
  return stops.slice(0, index + 1).map(s => s.key);
}
