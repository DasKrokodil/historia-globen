// Återanvändbart urval för datumvyer (#483, #489 och #485).
// Långvariga öppna intervall hör till bakgrunden, inte till årets korta lista.
export const isLongRunningBackgroundEvent = (event, year) => /\/\.\.$/.test(event.edtf ?? '') && event.start <= year - 100;

const priority = event => event.top ? 0 : event.major ? 1 : 2;
const ordered = events => events.map((event, index) => ({ event, index }))
  .sort((a, b) => priority(a.event) - priority(b.event) || a.index - b.index).map(({ event }) => event);

export function selectEventsForYear(year, events) {
  return ordered(events.filter(event => event.start <= year && event.end >= year && !isLongRunningBackgroundEvent(event, year)));
}

export function selectEventsForDate(date, events) {
  if (!/^\d{4}-\d\d-\d\d$/.test(date)) return [];
  return ordered(events.filter(event => {
    if (event.precision !== 11 || isLongRunningBackgroundEvent(event, Number(date.slice(0, 4)))) return false;
    const [from, to = from] = (event.edtf ?? '').split('/');
    return /^\d{4}-\d\d-\d\d$/.test(from) && /^\d{4}-\d\d-\d\d$/.test(to) && date >= from && date <= to;
  }));
}

// Urval för ett intervall (#569 del 1, #754). En händelse ingår om dess spann överlappar [from, to].
// Varje träff är en kopia med `partial`: true när händelsen börjar före eller slutar efter intervallet
// (listan ska då märka den "pågår före/efter intervallet"). Öppna spann som började mer än 100 år före
// intervallets slut är bakgrund och ingår inte, om inte `options.background` är sant.
export function selectEventsForRange(events, from, to, options = {}) {
  if (!Number.isFinite(from) || !Number.isFinite(to)) return [];
  if (from > to) [from, to] = [to, from];
  return ordered(events.filter(event => event.start <= to && event.end >= from
    && (options.background || !isLongRunningBackgroundEvent(event, to))))
    .map(event => ({ ...event, partial: event.start < from || event.end > to }));
}

// Markörgräns i intervalläget (#569 del 3, #756). Ett långt intervall (1900–1999) kan ge fler markörer än globen
// ritar flytande, så bara de viktigaste visas som markörer och resten finns kvar i listan. Gränsen är en inställning
// (EventsLayer.rangeMarkerLimit), inte ett fast tal i urvalet. Förinställningen kommer ur prestandarapporten
// (docs/granskningar/2026-11-07-prestanda-storre-datamangd.md, #752): ingen gräns behövs under cirka 250 markörer
// samtidigt, och intervallet 1900–1999 ska hållas under cirka 300. Mät om när datan har vuxit (#61, #452).
export const DEFAULT_RANGE_MARKER_LIMIT = 300;

// Vilka markörer som döljs när fler än `limit` skulle visas. items: [{ id, top, major, partial, pinned }] i den
// ordning de kom. De viktigaste behålls först: valda och markerade (pinned) alltid, sedan top, major och övriga, och i
// varje grupp de som ligger helt inom intervallet före de som bara delvis gör det, därefter ursprungsordningen.
// Ger mängden av id som ska döljas. Ingen gräns (Infinity, null eller ett tal under 1) döljer ingenting.
export function markersToHide(items, limit) {
  if (!Number.isFinite(limit) || limit < 1 || items.length <= limit) return new Set();
  const rank = it => (it.pinned ? -1 : it.top ? 0 : it.major ? 1 : 2);
  const sorted = items.map((it, i) => ({ it, i }))
    .sort((a, b) => rank(a.it) - rank(b.it) || Number(!!a.it.partial) - Number(!!b.it.partial) || a.i - b.i);
  const keep = Math.max(limit, items.filter(it => it.pinned).length); // det som är valt döljs aldrig
  return new Set(sorted.slice(keep).map(({ it }) => it.id));
}
