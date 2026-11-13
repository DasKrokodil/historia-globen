// Vad betyder "samtidigt"? (#1311, docs/beslut/2026-11-13-definition-av-samtidigt.md)
//
// En regel för fun facts, quizet och Samtidighetsjakten, så att ordet betyder samma sak överallt:
// - samtidigt (together): händelserna pågår minst ett gemensamt år, räknat på start och slut (astronomiska år);
// - nära i tid (near): inget gemensamt år, men högst ett visst antal år isär. Antalet år står alltid med;
// - tidsavstånd (apart): längre isär än så. Fun facts av den sorten jämför avstånd i tid (Kleopatra).
// Hur många år "nära i tid" får vara står i datan, inte här: fun facts i data/funfacts.json (nearYears) och
// jakten i uppdraget (window i data/uppdrag.json). Avståndet räknas rakt av på astronomiska år, som i panelen
// (beslut 2026-11-09), så 1903 och 1904 ligger 1 år isär även om det bara skiljer 26 dagar.
// Filen har inga importer och delas av sidan och testerna (tests/samtidighet.test.mjs).

export const RELATIONS = ['together', 'near', 'apart'];

/** Avståndet i år mellan två spann (0 när de har ett gemensamt år). */
export const gapBetween = (x, y) => Math.max(0, x.start - y.end, y.start - x.end);

/**
 * Avståndet i år för en grupp händelser: senaste start minus tidigaste slut, och 0 när alla har ett gemensamt år.
 * För två händelser är det samma sak som gapBetween.
 */
export function spread(events) {
  if (!events?.length) return 0;
  const latestStart = Math.max(...events.map(e => e.start));
  const earliestEnd = Math.min(...events.map(e => e.end));
  return Math.max(0, latestStart - earliestEnd);
}

/** Pågår alla händelserna minst ett gemensamt år? */
export const together = events => events.length > 0 && spread(events) === 0;

/**
 * Hur många år "nära i tid" får vara, ur tabellen near i data/funfacts.json: [{ until, years }, …, { years }].
 * Raden väljs efter året där avståndet börjar (det tidigaste slutet): den första raden vars until (astronomiskt år)
 * är minst det året, annars den sista raden utan until. Före vår tideräkning är dateringarna grövre (beslutet #1311).
 */
export function nearLimit(table, year) {
  for (const row of table ?? []) if (row.until == null || year <= row.until) return row.years;
  return 0;
}

/**
 * Relationen i tid mellan händelserna: 'together', 'near' (högst nearLimit år isär) eller 'apart'.
 * table är tabellen near ur datan (data/funfacts.json).
 */
export function relation(events, table) {
  const gap = spread(events);
  if (gap === 0) return 'together';
  const from = Math.min(...events.map(e => e.end));
  return gap <= nearLimit(table, from) ? 'near' : 'apart';
}

/** Relationen mellan en händelse och ett år, med window år för "nära i tid" (jakten), eller null när den ligger längre bort. */
export function relationToYear(e, year, window) {
  const gap = gapBetween(e, { start: year, end: year });
  if (gap === 0) return 'together';
  return gap <= window ? 'near' : null;
}

/** Är händelsens tid ungefärlig? (edtf med ~ eller ?, eller precision grövre än år) */
export const isApprox = e => /[~?]/.test(e.edtf ?? '') || !(e.precision >= 9);

/**
 * Avståndet för visning: exakt när båda årtalen är säkra, annars avrundat till närmaste tiotal (och skrivet med "cirka").
 * Under 10 år avrundas inte, så att "cirka 3 år" aldrig blir "cirka 0 år".
 */
export const roundGap = (n, approx) => (approx && n >= 10 ? Math.round(n / 10) * 10 : n);

/**
 * Det som Samtidigt-kortet visar om en fun fact: { relation, years, approx }. years är avståndet avrundat för
 * visning (bara för 'near'); approx är sant när något av årtalen är ungefärligt.
 */
export function funfactTiming(funfact, byId) {
  const events = (funfact.events ?? []).map(id => byId[id]).filter(Boolean);
  const approx = events.some(isApprox);
  const rel = funfact.relation ?? null;
  return { relation: rel, years: rel === 'near' ? roundGap(spread(events), approx) : null, approx };
}
