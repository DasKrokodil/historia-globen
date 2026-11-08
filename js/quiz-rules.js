// Quizet "Vad hände samtidigt som …?" (#65, Rikards beslut 2026-11-06): frågorna byggs ur befintliga fun facts,
// och inga nya fakta skrivs. Filen har inga importer från webbläsaren och testas i node (tests/quiz.test.mjs).
//
// En fråga: händelse A ur en fun fact, och tre svar. Rätt svar är en annan händelse B i samma fun fact.
// De två felaktiga svaren hämtas ur datan med regler som gör dem säkert fel:
// - händelsen syns (isVisible), har precision ≥ 7 (århundrade eller bättre) och ett spann på högst 50 år;
// - både start och slut ligger minst 200 år från både A:s och B:s spann;
// - den hör inte till samma fun fact och inte till samma krig (partOf) som A eller B.
// Finns inte två sådana händelser hoppas fun facten över.
//
// A och B måste också ligga högst MAX_PAIR_GAP år från varandra. Några fun facts jämför avstånd i tid i stället
// för samtidighet (Kleopatra levde närmare månlandningen än pyramidbygget); där vore "samtidigt" fel i sak,
// så de paren blir inga frågor.

export const MIN_GAP = 200;
export const MAX_SPAN = 50;
export const MIN_PRECISION = 7;
export const MAX_PAIR_GAP = 50;

/** Avståndet i år från year till spannet [start, end] (0 när året ligger inom spannet). */
export const distance = (year, e) => (year < e.start ? e.start - year : year > e.end ? year - e.end : 0);

/** Avståndet i år mellan två spann (0 när de överlappar). */
export const gapBetween = (x, y) => Math.max(0, x.start - y.end, y.start - x.end);

/** Paren [A, B] ur fun factens synliga händelser som ligger nära nog i tid för att kallas samtidiga. */
export function closePairs(funfact, byId, isVisible) {
  const own = (funfact.events ?? []).map(id => byId[id]).filter(e => e && isVisible(e.review));
  const pairs = [];
  for (const a of own) for (const b of own) if (a !== b && gapBetween(a, b) <= MAX_PAIR_GAP) pairs.push([a, b]);
  return pairs;
}

/** Kriget som händelsen hör till, eller händelsen själv om den är ett krig. */
const warOf = e => e.partOf ?? (e.kind === 'war' ? e.id : null);

/** Är händelsen e ett säkert felaktigt svar när frågan gäller A och rätt svar är B? */
export function isSafelyWrong(e, a, b, funfact, isVisible) {
  if (!e || !isVisible(e.review)) return false;
  if (!(e.precision >= MIN_PRECISION) || e.end - e.start > MAX_SPAN) return false;
  if (funfact.events.includes(e.id)) return false;
  const wars = new Set([warOf(a), warOf(b)].filter(Boolean));
  if (warOf(e) && wars.has(warOf(e))) return false;
  return [a, b].every(x => distance(e.start, x) >= MIN_GAP && distance(e.end, x) >= MIN_GAP);
}

/** Alla säkert felaktiga svar för frågan om A med rätt svar B. */
export const wrongAnswers = (events, a, b, funfact, isVisible) => events.filter(e => isSafelyWrong(e, a, b, funfact, isVisible));

/**
 * Fun facts som kan bli frågor: synliga och med minst ett par synliga händelser som ligger nära i tid.
 * byId: händelserna efter id.
 */
export function quizFunfacts(funfacts, byId, isVisible) {
  return funfacts.filter(f => isVisible(f.review) && closePairs(f, byId, isVisible).length > 0);
}

/** Blandar en kopia av listan (Fisher–Yates) med slumpfunktionen rnd (0 ≤ rnd() < 1). */
export function shuffle(list, rnd = Math.random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * En fråga ur fun facten, eller null när den inte har två synliga händelser nära i tid eller två säkert felaktiga svar.
 * Ger { funfact, a, answer, options } där options är tre händelser i blandad ordning (answer är en av dem).
 */
export function makeQuestion(funfact, byId, events, isVisible, rnd = Math.random) {
  const pairs = closePairs(funfact, byId, isVisible);
  if (!pairs.length) return null;
  const [a, answer] = pairs[Math.floor(rnd() * pairs.length)];
  const wrong = shuffle(wrongAnswers(events, a, answer, funfact, isVisible), rnd).slice(0, 2);
  if (wrong.length < 2) return null;
  return { funfact, a, answer, options: shuffle([answer, ...wrong], rnd) };
}

/**
 * Nästa fråga: fun facterna i blandad ordning, utan att upprepa de redan ställda (asked, en mängd med id)
 * förrän alla har kommit. Ger null när ingen fun fact kan bli en fråga.
 */
export function nextQuestion(funfacts, byId, events, isVisible, asked = new Set(), rnd = Math.random) {
  const pool = quizFunfacts(funfacts, byId, isVisible);
  const fresh = pool.filter(f => !asked.has(f.id));
  for (const f of [...shuffle(fresh, rnd), ...shuffle(pool, rnd)]) {
    const q = makeQuestion(f, byId, events, isVisible, rnd);
    if (q) return q;
  }
  return null;
}
