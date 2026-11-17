// Långa faktatexter delas i korta stycken (#1571). Det är ren presentation: orden är desamma och står i samma ordning,
// bara radbrytningen mellan meningar är ny. Filen har inga importer från webbläsaren och testas i node
// (tests/paragraphs.test.mjs), bland annat mot alla sammanfattningar i data/.

/** Texter kortare än så delas inte: ett kort stycke är redan lätt att läsa. */
export const SPLIT_FROM = 220;
/** Högst så många meningar i ett stycke. */
export const MAX_SENTENCES = 2;
/** Ett stycke som redan är så långt tar inga fler meningar. */
export const MAX_CHARS = 240;
/** En ensam slutmening kortare än så läggs till stycket före. */
export const SHORT_TAIL = 70;

// Förkortningar vars punkt inte avslutar en mening, på de fem språken (sv, en, de, es, fr). Jämförs med slutet av stycket före ett möjligt brott.
const ABBREVIATIONS = [
  'f\\.Kr', 'e\\.Kr', 'f\\.v\\.t', 'e\\.v\\.t', 'v\\. ?Chr', 'n\\. ?Chr', 'a\\. ?C', 'd\\. ?C', 'a\\. ?J\\.-C', 'apr\\. ?J\\.-C', 'av\\. ?J\\.-C', 'J\\.-C', 'B\\.C', 'A\\.D', 'B\\.C\\.E', 'C\\.E',
  'ca', 'c', 'cirka', 'approx', 't\\.ex', 'bl\\.a', 'm\\.fl', 'm\\.m', 'o\\.s\\.v', 'osv', 'd\\.v\\.s', 'dvs', 's\\.k', 'jfr', 'ang', 'resp', 'ev', 'inkl', 'ung', 'nr', 'no', 'kap', 'sid', 'ff', 'o\\.d', 'e\\.d', 'mfl', 'mm',
  'e\\.g', 'i\\.e', 'cf', 'vs', 'etc', 'viz', 'ed', 'eds', 'vol', 'pp', 'ch', 'fig',
  'z\\.B', 'u\\.a', 'd\\.h', 'u\\.a\\.m', 'usw', 'vgl', 'bzw', 'ggf', 'Nr', 'Chr', 'Jh', 'Hrsg', 'Prof', 'Bd', 'Abb',
  'p\\.ej', 'etc', 'aprox', 'núm', 'Sr', 'Sra', 'Srta', 'Dr', 'Dra', 'Sto', 'Sta', 'pág', 'págs', 'EE\\.UU', 'S\\.A', 'a\\. ?de ?C', 'd\\. ?de ?C',
  'env', 'p\\. ?ex', 'M', 'MM', 'Mme', 'Mlle', 'St', 'Ste', 'cf', 'av', 'apr', 'vol', 'n°', 'Mr', 'Mrs', 'Ms', 'Jr', 'Sr', 'Mt', 'Ft',
  'jan', 'feb', 'febr', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'okt', 'oct', 'nov', 'dec', 'janv', 'févr', 'avr', 'juil', 'déc', 'ene', 'abr', 'ago', 'dic', 'märz', 'mai',
];
const ABBREVIATION_END = new RegExp(`(?:^|[\\s(«“"'])(?:${[...new Set(ABBREVIATIONS)].join('|')})\\.$`, 'iu');
/** "v. Chr.", "n. Chr.", "a. C.", "f. Kr.": förkortningen är delad av ett blanksteg, så brottet får inte hamna mitt i den. */
const ERA_START = /^(?:Chr\.|Kr\.|C\.|J\.-C\.|de C\.)/u;
const ERA_PART_END = /(?:^|[\s(])(?:[vnfeacd]|av|apr)\.$/u;
/** En ensam versal som i ett förnamn ("J. Robert"), eller flera ("U.S."), är inget meningsslut. */
const INITIAL_END = /(?:^|[\s(«“"'])\p{Lu}\.$|(?:\p{Lu}\.){2,}$/u;
/** Ordningstal med en eller två siffror ("der 16. Dezember", "im 5. Jahrhundert", "5.–6. Jahrhundert") är inget meningsslut: tyskan skriver så. Årtal har tre eller fyra siffror. */
const ORDINAL_END = /(?:^|[\s(–-])\d{1,2}\.$/u;

/** Meningarna i en text. Ett mellanrum efter . ! ? (och eventuell slutcitat) före en versal eller ett citattecken är ett möjligt brott; efter en förkortning eller initial är det inget. */
export function sentences(text) {
  const parts = String(text ?? '').trim().split(/(?<=[.!?…]["”»’)]?)\s+(?=[\p{Lu}«“"¿¡])/u);
  const out = [];
  for (const part of parts) {
    const prev = out[out.length - 1];
    const joined = prev && (ABBREVIATION_END.test(prev) || INITIAL_END.test(prev) || ORDINAL_END.test(prev) || (ERA_PART_END.test(prev) && ERA_START.test(part)));
    if (joined) out[out.length - 1] = `${prev} ${part}`;
    else out.push(part);
  }
  return out;
}

/**
 * Delar en text i stycken: högst två meningar i varje och högst cirka 240 tecken, och bara om texten är minst 220 tecken lång.
 * En ensam, kort slutmening läggs till stycket före (då kan det stycket få tre meningar).
 * Stycken sammanfogade med ett blanksteg är exakt den ursprungliga texten.
 */
export function splitParagraphs(text) {
  const s = String(text ?? '').trim();
  if (s.length < SPLIT_FROM) return s ? [s] : [];
  const groups = [];
  let cur = [];
  const len = () => cur.join(' ').length;
  for (const sentence of sentences(s)) {
    if (cur.length && (cur.length >= MAX_SENTENCES || len() + 1 + sentence.length > MAX_CHARS)) { groups.push(cur); cur = []; }
    cur.push(sentence);
  }
  if (cur.length) groups.push(cur);
  // En ensam kort slutmening ("Det är krigets sista stora slag.") blir inget eget stycke: den hör till stycket före
  const last = groups.at(-1);
  if (groups.length > 1 && last.length === 1 && last[0].length < SHORT_TAIL) { groups.pop(); groups.at(-1).push(last[0]); }
  return groups.map(g => g.join(' '));
}
