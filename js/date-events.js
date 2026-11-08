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
