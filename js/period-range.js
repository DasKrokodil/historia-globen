// Epoker som tidsintervall (#845 del 3, #965): gör en period ur data/perioder.json till ett intervall som får plats på tidslinjen.
// Ren funktion utan DOM och tillstånd, delas med testerna (tests/period-range.test.mjs).
// Perioder som börjar före tidslinjens början (nordisk stenålder, 12 000 f.Kr.) klipps vid minYear och märks clippedStart;
// en öppen period ("från cirka 1900 till i dag") slutar vid maxYear och märks openEnd. Texterna om detta står öppet i knappen.

/** { from, to, clippedStart, openEnd } för en period; minYear och maxYear är tidslinjens gränser (astronomiska år). */
export function periodToRange(period, minYear, maxYear) {
  const open = !!period.open;
  const end = open ? maxYear : Math.min(period.end, maxYear);
  return {
    from: Math.max(period.start, minYear),
    to: end,
    clippedStart: period.start < minYear,
    openEnd: open,
  };
}
