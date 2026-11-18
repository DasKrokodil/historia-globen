// Tidsreglagets skala som post (#1511). Bara människans nuvarande skala är registrerad.
// Domänens gränser stannar i state.js; den här filen har inga beroenden till modell, språk eller DOM.
import { MIN_YEAR, MAX_YEAR } from './state.js';

// Tidslinjens fem delar är en skala, inte epoker: de heter bara sina årtal (#979). Epoknamnen, med källa och
// förenklingstext, finns bara i data/perioder.json. Förhistorien (#1088) får ett glest första segment med 10 % av reglaget,
// enligt mätningen i docs/granskningar/2026-11-12-tidsreglagets-plats-1087.md: modern tid (1800–) behåller 25 % och samma
// pixlar per år som förut, och de tre segmenten däremellan delar lika på resten (21⅔ % var).
const P1 = 0.10, P2 = 0.10 + 0.65 / 3, P3 = 0.10 + 1.30 / 3;
const segments = [
  { from: MIN_YEAR, to: -2999, a: 0.00, b: P1 },
  { from: -2999, to: -500, a: P1, b: P2 },
  { from:  -500, to: 1000, a: P2, b: P3 },
  { from:  1000, to: 1800, a: P3, b: 0.75 },
  { from:  1800, to: MAX_YEAR, a: 0.75, b: 1.00 },
];

// [år, nivå]: 1 = alltid, 2 = från 600 px, 3 = från 900 px
const ticks = [
  [MIN_YEAR, 1], [-49999, 3], [-2999, 2], [-1999, 2], [-999, 3], [-499, 2], [1, 1], [500, 2], [1000, 1],
  [1200, 3], [1400, 2], [1600, 3], [1800, 1], [1900, 2], [1950, 3], [2000, 1],
];

// Skarvens visade årtal: samma nominella avrundning som segmentens namn i timeline.js.
const nominal = y => (y < 0 && (1 - y) % 100 !== 0 ? y + 1 : y);

export const HUMAN_SCALE = {
  id: 'human',
  from: MIN_YEAR,
  to: MAX_YEAR,
  segments,
  ticks,
  seams: segments.slice(0, -1).map((s, i) => ({ at: s.b, year: nominal(s.to), before: s, after: segments[i + 1] })),
  // Upplösning för avrundning, steg och uppspelning (#1320); to är sista året i delen.
  resolution: [{ to: -10000, step: 1000 }, { to: -3000, step: 100 }, { to: Infinity, step: 1 }],
  steps: [-100, -10, -1, 1, 10, 100],
  speeds: [1, 5, 25, 100],
  defaultSpeed: 25,
};
