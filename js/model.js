// Gemensam modell: språk, kategorier, tidsformat och laddning av data.
// All data ligger i data/*.json (beslut: data skild från kod).

export const LANG = 'sv';
const FALLBACK = ['en', 'sv'];

/** Plockar text på aktuellt språk, annars engelska, annars svenska. */
export function t(obj) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  if (obj[LANG]) return obj[LANG];
  for (const l of FALLBACK) if (obj[l]) return obj[l];
  return Object.values(obj)[0] ?? '';
}

// Fast kategorilista (beslut 7). Färgerna är valda för att synas mot mörk bakgrund.
// count = ord i ental och flertal när en klunga säger vad den innehåller (#243), till exempel "3 krigshändelser".
export const CATEGORIES = [
  { id: 'natur',          name: { sv: 'Natur och djur' },                 color: '#8cc084', count: { sv: ['naturhändelse', 'naturhändelser'] } },
  { id: 'manniskan',      name: { sv: 'Människans ursprung' },            color: '#c99263', count: { sv: ['händelse om människans ursprung', 'händelser om människans ursprung'] } },
  { id: 'civilisationer', name: { sv: 'Civilisationer och riken' },       color: '#e3a33f', count: { sv: ['rike eller civilisation', 'riken och civilisationer'] } },
  { id: 'religion',       name: { sv: 'Religion' },                       color: '#b892dc', count: { sv: ['religiös händelse', 'religiösa händelser'] } },
  { id: 'vetenskap',      name: { sv: 'Vetenskap och uppfinningar' },     color: '#5fb6dd', count: { sv: ['vetenskaplig händelse', 'vetenskapliga händelser'] } },
  { id: 'upptackter',     name: { sv: 'Upptäcktsresor' },                 color: '#4fc6b2', count: { sv: ['upptäcktsresa', 'upptäcktsresor'] } },
  { id: 'krig',           name: { sv: 'Krig och konflikter' },            color: '#e5675a', count: { sv: ['krigshändelse', 'krigshändelser'] } },
  { id: 'kultur',         name: { sv: 'Kultur och arkitektur' },          color: '#ec98bd', count: { sv: ['kulturhändelse', 'kulturhändelser'] } },
  { id: 'sport',          name: { sv: 'Sport' },                          color: '#f28c45', count: { sv: ['sporthändelse', 'sporthändelser'] } },
  { id: 'ekonomi',        name: { sv: 'Ekonomi och handel' },             color: '#a9bd5e', count: { sv: ['händelse i ekonomin', 'händelser i ekonomin'] } },
  { id: 'halsa',          name: { sv: 'Hälsa och epidemier' },            color: '#d8d46e', count: { sv: ['hälsohändelse', 'hälsohändelser'] } },
  { id: 'klimat',         name: { sv: 'Klimat och naturkatastrofer' },    color: '#7aa4e6', count: { sv: ['klimathändelse', 'klimathändelser'] } },
  { id: 'rymden',         name: { sv: 'Rymden' },                         color: '#cfcbff', count: { sv: ['rymdhändelse', 'rymdhändelser'] } },
];
export const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// Granskningsstatus (källpolicy). Bara kontrollerade uppgifter visas som standard.
// Nivån säger hur väl källorna är kontrollerade; ingen människogranskning (#252).
export const REVIEW = {
  'draft':          { sv: 'Utkast',             cls: 'draft' },
  'source-checked': { sv: 'Källkontrollerad',   cls: 'checked' },
  'two-sources':    { sv: 'Två källor stämmer', cls: 'two' },
};
// Statusraden säger vad statusen gäller (#196): "Fun facten: källkontrollerad".
// subject = Fun facten, Kriget, Riket, Händelsen, Religionen. Förklaringen visas som tooltip.
export const REVIEW_SUBJECT_HELP = {
  'Fun facten': 'Statusen gäller själva jämförelsen i kortet. Varje händelse har en egen status i sin faktaruta.',
  'Kriget': 'Statusen gäller krigets berättelse i kortet. Varje händelse har en egen status i sin faktaruta.',
  'Riket': 'Statusen gäller rikets faktaruta och berättelse. Varje händelse har en egen status i sin faktaruta.',
  'Religionen': 'Statusen gäller religionens faktaruta. Varje händelse har en egen status i sin faktaruta.',
  'Händelsen': 'Statusen gäller just den här händelsen. Samtidigt-kortet och fun facten har en egen status.',
};
export function reviewLabel(status, subject) {
  const rv = REVIEW[status] ?? REVIEW.draft;
  return `${subject}: ${rv.sv.charAt(0).toLowerCase()}${rv.sv.slice(1)}`;
}
export const settings = { showDrafts: false };
export const isVisibleReview = r => settings.showDrafts || r === 'source-checked' || r === 'two-sources';

// ---------- Världsdelar ----------
// Grov indelning efter koordinater, för att gruppera listan "Samtidigt i världen" (#120).
// Gränserna är ungefärliga: Gibraltar, Medelhavet, Suez och Röda havet, Bosporen, Kaukasus och Ural.
export const REGIONS = ['Europa', 'Asien', 'Afrika', 'Amerika', 'Oceanien'];
export function region(lat, lon) {
  if (lat > 50 && (lon < -168 || lon > 160)) return 'Asien'; // Sibiriens östspets och Wrangelön vid datumlinjen
  if (lon < -125 && lat < 35) return 'Oceanien'; // Hawaii, Midway och Stilla havet (Kalifornien ligger öster om -125)
  if (lon < -25) return 'Amerika';
  if ((lat < -10 && lon > 110) || (lat < 0 && lon > 130) || lon > 160) return 'Oceanien';
  const africa = lon >= -20 && lon < 52 && lat > -36 && (
    lon < -1.5 ? lat < 36 :
    lon <= 11.5 ? lat < 37.5 :
    lon <= 32.5 ? lat < 33.5 :
    lat < 31.5 && lon < 32.5 + (30 - lat) * 0.62); // väster om Röda havet
  if (africa) return 'Afrika';
  if (lat >= 35 && (lon < 28.9 || (lat >= 41 && lon < 60 && !(lon > 40 && lat < 44.5)))) return 'Europa';
  return 'Asien';
}

// ---------- Bildstilar (#129) ----------
// Varje händelse får en bildstil efter år och plats (data/styles.json): en regional
// variant om året och platsen matchar, annars grundstilen för året. Ramen följer
// grundstilen, och en variant kan väljas efter kategori (till exempel portolankarta för resor).
export function styleFor(e, doc) {
  const year = e.start, lat = e._lat ?? e.location.coordinates[1], lon = e._lon ?? e.location.coordinates[0];
  const inTime = s => year >= s.from && year <= s.to;
  const inRegion = id => (doc.regions[id]?.bbox ?? []).some(([w, so, ea, n]) => lon >= w && lon <= ea && lat >= so && lat <= n);
  const base = doc.styles.find(s => !s.regions.length && inTime(s)) ?? doc.styles.at(0);
  const regional = doc.styles.find(s => s.regions.length && inTime(s) && s.regions.some(inRegion));
  const style = regional ?? base;
  return { style, base, frame: base.frame, variant: style.variants?.[e.category] ?? null };
}

// ---------- Tid ----------
// År lagras astronomiskt (ISO 8601): 0 = 1 f.Kr., -1 = 2 f.Kr.
export const isBCE = y => y <= 0;
export const bce = y => 1 - y;

/** Kort årtal för listor: "551 f.Kr.", "793", "1325". */
export function formatYear(y) {
  return isBCE(y) ? `${bce(y)} f.Kr.` : `${y}`;
}

/** Stort årtal i huvudet: [siffra, epok]. */
export function yearParts(y) {
  if (isBCE(y)) return [String(bce(y)), 'f.Kr.'];
  if (y < 1000) return [String(y), 'e.Kr.'];
  return [String(y), ''];
}

/** Tolkar ett inskrivet år till astronomiskt år, eller null. "2600 f.Kr.", "44 fkr", "300 BC" och
 *  "-500" blir före vår tideräkning; "1969", "800 e.Kr." och "AD 800" efter. Utan tideräkning i texten
 *  används `defaultEra` ('ce' eller 'bce'). Det finns inget år 0 i visningen: 1 f.Kr. är 0. */
export function parseYear(text, defaultEra = 'ce') {
  const m = /^\s*(?:(ad|a\.d\.)\s*)?([-−–]?)\s*(\d{1,4})\s*(?:(f\.?\s*kr\.?|fkr|bc|b\.c\.|bce|e\.?\s*kr\.?|ekr|ad|a\.d\.|ce)\s*)?$/i.exec(text);
  if (!m) return null;
  const n = Number(m[3]);
  if (n === 0) return null;
  const tag = (m[4] || '').toLowerCase().replace(/[.\s]/g, '');
  const isBc = m[2] ? true : tag ? /^(fkr|bc|bce)$/.test(tag) : m[1] ? false : defaultEra === 'bce';
  return isBc ? 1 - n : n;
}

const MONTHS = ['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december'];

/** Datum ur data ("2026-10-30") som text: "30 oktober 2026". */
export function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : (iso || '');
}

/** Tid för en händelse enligt dess precision och EDTF-markering. */
export function formatEventTime(e) {
  const edtf = e.edtf || '';
  if (e.ongoing) return `${formatYear(e.start)}–pågår`; // pågående krig (#223)
  const approx = edtf.includes('~') ? 'cirka ' : '';
  const day = /^(-?\d{4})-(\d{2})-(\d{2})$/.exec(edtf);
  if (day && e.start === e.end) {
    return `${Number(day[3])} ${MONTHS[Number(day[2]) - 1]} ${formatYear(e.start)}`;
  }
  if (edtf.endsWith('/..')) return `sedan ${formatYear(e.start)}`;
  if (edtf.startsWith('../')) return `till ${approx}${formatYear(e.end)}`;
  if (e.start === e.end) return approx + formatYear(e.start);
  if (isBCE(e.start) && isBCE(e.end)) return `${approx}${bce(e.start)}–${bce(e.end)} f.Kr.`;
  if (isBCE(e.start)) return `${approx}${bce(e.start)} f.Kr.–${e.end} e.Kr.`;
  return `${approx}${e.start}–${e.end}`;
}

// ---------- Delar av år (#204) ----------
// I fokusläget för korta krig räknar tidslinjen i dagar. Året är då ett decimaltal: året plus den
// andel av året som har gått, så att 1 januari 1879 är 1879,0 och 2 juli 1879 ungefär 1879,5.
// Datumen läses ur händelsernas edtf (proleptisk gregoriansk kalender, astronomiska år som i datan).
export const MONTHS_SHORT = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];
function utcMs(y, m, d) { const t = new Date(0); t.setUTCFullYear(y, m, d); return t.getTime(); } // fungerar även före år 100
const yearMs = y => [utcMs(y, 0, 1), utcMs(y + 1, 0, 1)];
function msToYear(ms) {
  const y = new Date(ms).getUTCFullYear(), [a, b] = yearMs(y);
  return y + (ms - a) / (b - a);
}
function yearToDate(yf) {
  const y = Math.floor(yf), [a, b] = yearMs(y);
  return new Date(a + (yf - y) * (b - a) + 1000); // en sekunds marginal mot avrundningsfel vid dygnsgränsen
}
const dateToYear = (y, m = 1, d = 1) => msToYear(utcMs(y, m - 1, d));
/** Avrundar ett decimalår till närmaste dagsgräns (midnatt UTC), som tidslinjen avrundar till hela år annars. */
export function roundDay(yf) {
  const y = Math.floor(yf), [a, b] = yearMs(y);
  return msToYear(Math.round((a + (yf - y) * (b - a)) / 86400000) * 86400000);
}

// En del av en EDTF-sträng: "1879-01-22", "1879-01" eller "1879", som [början, slut] i decimalår.
// Slutet är början av nästa dag, månad eller år, så att en dag täcker hela dygnet.
const EDTF_PART = /^(-?\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;
function edtfPart(s) {
  const m = EDTF_PART.exec(s.replace(/[~?%]/g, ''));
  if (!m) return null;
  const y = Number(m[1]), mo = m[2] && Number(m[2]), d = m[3] && Number(m[3]);
  if (d) return [dateToYear(y, mo, d), dateToYear(y, mo, d + 1)];
  if (mo) return [dateToYear(y, mo), dateToYear(y, mo + 1)];
  return [y, y + 1];
}
/** Händelsens tid som [början, slut] i decimalår, ur edtf. Går edtf inte att läsa (öppna spann,
 *  år med fler än fyra siffror) används start och slut som hela år. Används bara i fokusläget för korta krig. */
export function edtfSpan(e) {
  if (e._span) return e._span;
  const parts = (e.edtf || '').split('/').map(edtfPart);
  const ok = parts.length <= 2 && parts.every(Boolean);
  return (e._span = ok ? [parts[0][0], parts.at(-1)[1]] : [e.start, e.end + 1]);
}
/** Har edtf datum med dag i både början och slut? (till exempel "1879-01-11/1879-07-04") */
export const edtfHasDays = edtf => (edtf || '').replace(/[~?%]/g, '').split('/').every(s => /^-?\d{4}-\d{2}-\d{2}$/.test(s));

/** Datum för ett decimalår, för det stora årtalet: ["22 jan", "1879"]. */
export function dayParts(yf) {
  const d = yearToDate(yf);
  return [`${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`, formatYear(d.getUTCFullYear())];
}
export const formatDay = yf => dayParts(yf).join(' ');

/** Månadernas början mellan två decimalår: [{ t, y, m }], m = 0 för januari. För tidslinjens skala. */
export function monthStarts(a, b) {
  const d = yearToDate(a), out = [];
  for (let y = d.getUTCFullYear(), m = d.getUTCMonth(); ; m++) {
    if (m === 12) { m = 0; y++; }
    const t = dateToYear(y, m + 1);
    if (t > b) return out;
    if (t >= a) out.push({ t, y, m });
  }
}

// ---------- Laddning ----------
async function getJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Kunde inte läsa ${path} (${res.status})`);
  return res.json();
}

export async function loadAll() {
  const [events, funfacts, sources, land, empires, borders, styles] = await Promise.all([
    getJSON('data/events.json'),
    getJSON('data/funfacts.json'),
    getJSON('data/sources.json'),
    getJSON('data/land.json'),
    getJSON('data/empires/index.json'),
    getJSON('data/borders.json'),
    getJSON('data/styles.json'),
  ]);
  const byId = Object.fromEntries(events.events.map(e => [e.id, e]));
  // Pågående (#223): end i datan är året då läget senast kontrollerades; det räknas till i år enligt datorns klocka
  // Det gäller också andra händelser som pågår, med öppet slut i edtf ("1096/..", till exempel Oxford, #229)
  for (const e of events.events) if (e.ongoing || /\/\.\.$/.test(e.edtf ?? '')) e.end = Math.max(e.end, new Date().getFullYear());
  // Krig och slag (#27): slagen pekar på sitt krig med partOf
  for (const e of events.events) if (e.kind === 'war') e._battles = [];
  for (const e of events.events) {
    const war = e.partOf && byId[e.partOf];
    if (war?._battles) { e._war = war; war._battles.push(e); }
  }
  for (const e of events.events) e._battles?.sort((a, b) => a.start - b.start || (a.edtf < b.edtf ? -1 : 1));
  const srcById = Object.fromEntries(sources.sources.map(s => [s.id, s]));
  // Fun facts ärver källorna från sina händelser (källa krävs för båda leden).
  for (const f of funfacts.funfacts) {
    f.sources = [...new Set(f.events.flatMap(id => byId[id]?.sources ?? []))];
  }
  return {
    events: events.events, byId, funfacts: funfacts.funfacts, sources: sources.sources, srcById, land,
    // Rikena ligger i en fil per rike (R1): index.json vid start, själva gränserna med loadEmpire()
    empireGroups: empires.groups, polities: empires.groups.flatMap(g => g.polities.map(p => ({ ...p, group: g.id }))), borders, styles,
  };
}

/** Ett rikes gränser (data/empires/<grupp>.json), laddas första gången riket behövs. */
const empireFiles = new Map();
export function loadEmpire(group) {
  if (!empireFiles.has(group.id)) empireFiles.set(group.id, getJSON(group.file).then(d => d.polities));
  return empireFiles.get(group.id);
}

/** Religionsdatan är stor och laddas först när religionslagret slås på. */
let religionsPromise = null;
export function loadReligions() {
  religionsPromise ??= getJSON('data/religions.json');
  return religionsPromise;
}

/**
 * Varje rikes gräns i religionslagret (#194), för klickrutan. Filen laddas först vid det
 * första klicket på ett religionsområde, så att startladdningen inte blir tyngre.
 */
let religionPolitiesPromise = null;
export function loadReligionPolities() {
  religionPolitiesPromise ??= getJSON('data/religions-polities.json').catch(err => { religionPolitiesPromise = null; throw err; });
  return religionPolitiesPromise;
}
