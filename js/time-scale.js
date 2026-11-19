// Tidsreglagets skalor som poster (#1511, #1958). Människans tid har två reglage, och reglaget som visas räknas ur året
// (scaleForYear): "Före 3000 f.Kr." och "3000 f.Kr.–i dag". Domänens gränser stannar i state.js; den här filen har inga
// beroenden till modell, språk eller DOM.
import { MIN_YEAR, MAX_YEAR } from './state.js';

// Gränsen mellan reglagen är det runda årtalet 3000 f.Kr. Året 3000 f.Kr. (astronomiskt -2999) är första året i det
// historiska reglaget, så "Före 3000 f.Kr." slutar vid 3001 f.Kr. (-3000). Det är samma gräns som upplösningen har (sista
// hundraårssteget är -3000, därefter hela år) och gränsen delar inget år mellan reglagen (docs/beslut/2026-11-19-tva-reglage-1958.md).
export const PREHISTORY_LAST = -3000;
export const HISTORY_FIRST = -2999;

// Skarvens visade årtal: ett år som redan är runt i f.Kr. (-2999 är 3000 f.Kr., -99999 är 100 000 f.Kr.) behålls, ett annat
// (-500 är 501 f.Kr., -3000 är 3001 f.Kr.) visas som det runda årtalet. Segmentens namn och skalans sista årtal använder samma regel.
export const nominal = y => (y < 0 && (1 - y) % 100 !== 0 ? y + 1 : y);

const seamsOf = segments => segments.slice(0, -1).map((s, i) => ({ at: s.b, year: nominal(s.to), before: s, after: segments[i + 1] }));

// De sex delarna är en skala, inte epoker: de heter bara sina årtal (#979). Epoknamnen, med källa och förenklingstext, finns bara i
// data/perioder.json. Det första reglaget delas vid 10 000 f.Kr. på hälften var (istid med glesa fynd, sedan holocen), och det
// historiska reglaget behåller de fyra delarnas inbördes andelar från förut (13/54 × 3 och 15/54: modern tid 1800– fick
// 25 % av det gamla reglaget och får nu 27,8 % av ett reglage som är lika brett, alltså fler pixlar per år, #49).
const prehistorySegments = [
  { from: MIN_YEAR, to: -10000, a: 0, b: 0.5 },
  { from: -10000, to: PREHISTORY_LAST, a: 0.5, b: 1 },
];
const historySegments = [
  { from: HISTORY_FIRST, to: -500, a: 0, b: 13 / 54 },
  { from: -500, to: 1000, a: 13 / 54, b: 26 / 54 },
  { from: 1000, to: 1800, a: 26 / 54, b: 39 / 54 },
  { from: 1800, to: MAX_YEAR, a: 39 / 54, b: 1 },
];

// Det som reglagen delar: upplösning för avrundning, steg och uppspelning (#1320; to är sista året i delen), stegknapparna och
// uppspelningens fartnivåer. En enda källa, så att ett steg över gränsen är samma steg på båda sidor.
const resolution = [{ to: -10000, step: 1000 }, { to: PREHISTORY_LAST, step: 100 }, { to: Infinity, step: 1 }];
const shared = { resolution, steps: [-100, -10, -1, 1, 10, 100], speeds: [1, 5, 25, 100], defaultSpeed: 25 };

/** Hela domänen människans tid: gränserna och det reglagen delar. Har inga segment; de finns i reglagens egna poster. */
export const HUMAN_SCALE = { id: 'human', from: MIN_YEAR, to: MAX_YEAR, ...shared };

// [år, nivå]: 1 = alltid, 2 = från 600 px, 3 = från 900 px. Reglagets sista år (-3000) skrivs som 3000 f.Kr. (nominal).
export const PREHISTORY_SCALE = {
  ...shared,
  id: 'human-pre',
  from: MIN_YEAR,
  to: PREHISTORY_LAST,
  segments: prehistorySegments,
  ticks: [[MIN_YEAR, 1], [-79999, 3], [-59999, 2], [-39999, 3], [-19999, 2], [-9999, 1], [-7999, 2], [-4999, 2], [PREHISTORY_LAST, 1]],
  seams: seamsOf(prehistorySegments),
  // Samtidigt-fönstret är aldrig kortare än så åt varje håll före 10 000 f.Kr., där fynden är glesa, men golvet avtar mot slutet av delen
  // (`to` är sista året i delen) så att det inte når in i den täta delen efter (#1958).
  windowMin: [{ to: -10000, years: 10000 }],
};

export const HISTORY_SCALE = {
  ...shared,
  id: 'human-history',
  from: HISTORY_FIRST,
  to: MAX_YEAR,
  segments: historySegments,
  ticks: [
    [HISTORY_FIRST, 1], [-1999, 2], [-999, 3], [-499, 2], [1, 1], [500, 2], [1000, 1],
    [1200, 3], [1400, 2], [1600, 3], [1800, 1], [1900, 2], [1950, 3], [2000, 1],
  ],
  seams: seamsOf(historySegments),
};

/** Reglagen i tidsordning. Det första börjar där domänen börjar och det sista slutar där den slutar. */
export const HUMAN_SCALES = [PREHISTORY_SCALE, HISTORY_SCALE];

/**
 * Reglaget som ett år hör till: det första vars sista år inte ligger före året, annars det sista. -3000 är alltså det sista året i
 * det första reglaget och -2999 det första i det andra. Ett år utanför domänen hör till det närmaste reglaget.
 */
export const scaleForYear = (y, scales = HUMAN_SCALES) => scales.find(s => y <= s.to) ?? scales.at(-1);

/**
 * Året man landar på när besökaren byter reglage med växlaren (#1959): kanten av det nya reglaget som ligger närmast reglaget man står
 * på. Ligger det nya reglaget längre fram i tiden är det dess första år (3000 f.Kr., -2999), annars dess sista (3001 f.Kr., -3000). Det är
 * samma år som ett steg över gränsen når (`stepFrom` i js/timeline.js), så inget år hoppas över och växlaren och stegknappen är ett och samma byte.
 */
export const scaleEntryYear = (target, current) => (target.from > current.to ? target.from : target.to);
