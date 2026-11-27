/** Begränsar ett år till de angivna gränserna. Anroparen väljer spannet och avrundar vid behov. */
export function clampYear(year, { from = -Infinity, to = Infinity }) {
  return Math.max(from, Math.min(to, year));
}
