// Gemensam modell: språk, kategorier, tidsformat och laddning av data.
// All data ligger i data/*.json (beslut: data skild från kod).

// Språket väljs i js/i18n.js (#63): adressen, det sparade valet eller webbläsaren, annars svenska.
// Gränssnittets texter hämtas med ui('nyckel') ur data/ui/<språk>.json.
import { LANG, ui, hasUi } from './i18n.js';
export { LANG, ui };
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
  { id: 'klimat',         name: { sv: 'Klimat' },                         color: '#7aa4e6', count: { sv: ['klimathändelse', 'klimathändelser'] } },
  // Katastrofer (#554, beslut 2026-11-03): natur- och teknikkatastrofer, svält. Inte epidemier (halsa) eller krig.
  // Violett, eftersom den skiljer sig från krig och de andra färgerna även vid simulerad färgblindhet.
  { id: 'katastrofer',    name: { sv: 'Katastrofer' },                    color: '#c256f5', count: { sv: ['katastrof', 'katastrofer'] } },
  { id: 'rymden',         name: { sv: 'Rymden' },                         color: '#cfcbff', count: { sv: ['rymdhändelse', 'rymdhändelser'] } },
];
// Kategorierna på andra språk (#63): svenskan står ovan, övriga språk i data/ui/<språk>.json (cat.<id> och cat.<id>.count)
for (const c of CATEGORIES) {
  if (hasUi(`cat.${c.id}`)) c.name[LANG] = ui(`cat.${c.id}`);
  if (hasUi(`cat.${c.id}.count`)) c.count[LANG] = ui(`cat.${c.id}.count`);
}
export const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// Granskningsstatus (källpolicy). Bara kontrollerade uppgifter visas som standard.
// Nivån säger hur väl källorna är kontrollerade; ingen människogranskning (#252).
// Texterna står i data/ui/<språk>.json (review.<status>), label är texten på valt språk.
export const REVIEW = {
  'draft':          { label: ui('review.draft'),          cls: 'draft' },
  'source-checked': { label: ui('review.source-checked'), cls: 'checked' },
  'two-sources':    { label: ui('review.two-sources'),    cls: 'two' },
};
// Statusraden säger vad statusen gäller (#196): "Fun facten: källkontrollerad".
// subject = Fun facten, Kriget, Riket, Händelsen, Religionen … (den svenska formen är nyckeln; texten på valt
// språk står i review.subject.<subject>). Förklaringen visas som tooltip (review.subjectHelp.<subject>).
const SUBJECTS_WITH_HELP = ['Fun facten', 'Kriget', 'Riket', 'Religionen', 'Landet', 'Händelsen'];
export const REVIEW_SUBJECT_HELP = Object.fromEntries(SUBJECTS_WITH_HELP.map(s => [s, ui(`review.subjectHelp.${s}`)]));
// Vad statusarna betyder (#310), samma betydelse som källpolicyn i CLAUDE.md. Visas bakom (i)-knappen i faktarutan.
export const REVIEW_HELP = ['source-checked', 'two-sources'].map(status => ({ status, text: ui(`review.help.${status}`) }));
export function reviewLabel(status, subject) {
  const rv = REVIEW[status] ?? REVIEW.draft;
  const key = `review.subject.${subject}`, translated = ui(key);
  const subj = LANG === 'sv' || translated === key ? subject : translated;
  return ui('review.line', { subject: subj, status: rv.label.charAt(0).toLowerCase() + rv.label.slice(1) });
}
export const settings = { showDrafts: false };
/** Vyn Översikt (#868) är ingen tagg i datan utan fältet significance: händelserna ur den godkända listan har det satt till 1. */
export const OVERVIEW_TAG = 'oversikt';
/**
 * Alla taggar en händelse har (#555, #868, #1141): taggarna i datan plus Översikt. Det enda stället som avgör det; Översikt-menyns antal
 * (panel.js), det som ritas och Lager-vyerna (layers/events.js, som exporterar den vidare) läser alla samma lista.
 * Ligger i model.js och inte i layers/events.js, som drar in three.js och därför inte går att läsa i node-testerna.
 */
export const eventTags = e => [...(Array.isArray(e?.tags) ? e.tags : []), ...(e?.significance === 1 ? [OVERVIEW_TAG] : [])];

export const isVisibleReview = r => settings.showDrafts || r === 'source-checked' || r === 'two-sources';

// ---------- Världsdelar ----------
// Grov indelning efter koordinater, för att gruppera listan "Samtidigt i världen" (#120).
// Gränserna är ungefärliga: Gibraltar, Medelhavet, Suez och Röda havet, Bosporen, Kaukasus och Ural.
export const REGIONS = ['Europa', 'Asien', 'Afrika', 'Amerika', 'Oceanien'];
// Västra Anatoliens kust som [lat, lon] från Dardanellerna i norr till Knidos i söder (#1334). Ungefärlig linje:
// öster om den ligger Mindre Asien, väster om den öarna i Egeiska havet (Lesbos, Chios, Samos, Kos) och Gallipoli.
const AEGEAN_COAST = [[40.45, 26.75], [40.0, 26.2], [39.5, 26.05], [39.4, 26.62], [39.0, 26.75], [38.7, 26.7],
  [38.45, 26.4], [38.3, 26.25], [38.0, 26.9], [37.75, 27.1], [37.6, 27.05], [37.4, 27.15], [37.0, 27.2],
  [36.95, 27.38], [36.6, 27.6]];
function aegeanCoastLon(lat) {
  for (let i = 1; i < AEGEAN_COAST.length; i++) {
    const [a, x] = AEGEAN_COAST[i - 1], [b, y] = AEGEAN_COAST[i];
    if (lat >= b) return y + (lat - b) / (a - b) * (x - y);
  }
  return AEGEAN_COAST[AEGEAN_COAST.length - 1][1];
}
export function region(lat, lon) {
  if (lat > 50 && (lon < -168 || lon > 160)) return 'Asien'; // Sibiriens östspets och Wrangelön vid datumlinjen
  if (lon < -125 && lat < 35) return 'Oceanien'; // Hawaii, Midway och Stilla havet (Kalifornien ligger öster om -125)
  if (lon < -105 && lat < -10) return 'Oceanien'; // östra Polynesien med Rapa Nui; geografin går före politiken (#630)
  // Atlantöarna mellan -32 och -20 (#1334): Azorerna hör till Europa och Kap Verde till Afrika
  if (lon >= -32 && lon < -20) {
    if (lat > 36 && lat < 40.5) return 'Europa';
    if (lat > 13 && lat < 18) return 'Afrika';
  }
  if (lon < -25) return 'Amerika';
  // Grönlands östkust går öster om -25 norr om cirka 69° N; Island slutar vid 66,5° N (Natural Earth 1:10m, #1135)
  if (lon < -10 && lat >= 68) return 'Amerika';
  // Mikronesien (Guam, Marianerna, Palau, Pohnpei) ligger öster om 130° Ö och söder om 22° N; Filippinerna,
  // Taiwan och Japan ligger väster eller norr om det (#630)
  if ((lat < -10 && lon > 110) || (lat < 22 && lon > 130) || lon > 160) return 'Oceanien';
  const africa = lon >= -20 && lon < 52 && lat > -36 && (
    lon < -1.5 ? lat < 36 :
    lon <= 11.5 ? lat < 37.5 :
    lon <= 32.5 ? lat < 33.5 :
    (lat < 31.5 && lon < 32.5 + (30 - lat) * 0.62) || lat < 12); // väster om Röda havet; Somalia söder om Adenviken (#1334)
  if (africa) return 'Afrika';
  if (lon >= 52 && lon < 64 && lat > -22 && lat < -3) return 'Afrika'; // Maskarenerna och Seychellerna (#1334)
  if (lat >= 36.6 && lat <= 40.45 && lon < 28.9 && lon > aegeanCoastLon(lat)) return 'Asien'; // västra Anatolien (#1334)
  if (lat >= 35 &&(lon < 28.9 || (lat >= 41 && lon < 60 && !(lon > 40 && lat < 44.5)))) return 'Europa';
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

// Tideräkningens förkortningar på valt språk: f.Kr./e.Kr., BC/AD … (data/ui/<språk>.json)
const BCE_TXT = ui('time.bce'), CE_TXT = ui('time.ce');
export { BCE_TXT, CE_TXT };

// Stora år (#1085): från fem siffror med språkets tusentalsavgränsare ur språkfilen (time.groupSep, enligt ordlistan avsnitt 3
// och 13.3: hårt mellanrum på svenska, spanska och franska, komma på engelska, punkt på tyska). År med upp till fyra siffror
// skrivs som förut ("2600 f.Kr."). Intl ger grupperna; bara tecknet mellan dem kommer från språkfilen.
const NUM_LOCALE = LANG === 'en' ? 'en-GB' : LANG;
const GROUP_SEP = ui('time.groupSep');
export function groupDigits(n) {
  if (Math.abs(n) < 10000) return String(n);
  return new Intl.NumberFormat(NUM_LOCALE, { useGrouping: true, maximumFractionDigits: 0 }).formatToParts(n)
    .map(p => p.type === 'group' ? GROUP_SEP : p.value).join('');
}

/** Kort årtal för listor: "551 f.Kr.", "793", "1325", "300 000 f.Kr.". */
export function formatYear(y) {
  return isBCE(y) ? `${groupDigits(bce(y))} ${BCE_TXT}` : groupDigits(y);
}

/**
 * Ett antal miljoner år (#1085), till exempel "1 miljon år", "1,8 miljoner år", "2,5 millions d’années". Singular och plural väljs med
 * Intl.PluralRules för språket (franskan har singular under 2: "1,8 million d’années"), texten kommer ur språkfilen
 * (time.millionYears.one och .other) och decimaltecknet ur Intl. `years` är antalet år, inte ett astronomiskt år.
 */
export function formatYearCount(years) {
  const m = years / 1e6;
  const n = new Intl.NumberFormat(NUM_LOCALE, { maximumFractionDigits: 1 }).format(m);
  const form = new Intl.PluralRules(NUM_LOCALE).select(Number(m.toFixed(1))) === 'one' ? 'one' : 'other';
  return ui(`time.millionYears.${form}`).replace('{n}', n);
}

/**
 * Århundradet ett år ligger i, enligt svenskt bruk (#994): "1300-talet" är 1300–1399 och är det 14:e århundradet;
 * före vår tideräkning räknas från 1 f.Kr. (astronomiskt år 0), så 2901 f.Kr. ligger i "2900-talet f.Kr.".
 * År 1–99 (och 99–1 f.Kr.) är det första århundradet. Samma indelning i alla språk, bara skrivsättet skiljer.
 */
export function centuryOf(y) {
  const n = isBCE(y) ? bce(y) : y;
  return { bce: isBCE(y), c: Math.floor(n / 100) + 1, hundred: Math.floor(n / 100) * 100 };
}

const ROMAN = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
const roman = n => ROMAN.reduce((out, [v, r]) => { while (n >= v) { out += r; n -= v; } return out; }, '');
/** Engelskans ordningstal: 1st, 2nd, 3rd, 14th, 21st. Suffixen ligger i språkfilen (time.ordSuffix), tom i övriga språk. */
function ordinal(n) {
  const [st, nd, rd, th] = ui('time.ordSuffix');
  const last = n % 10;
  return `${n}${n % 100 >= 11 && n % 100 <= 13 ? th : last === 1 ? st : last === 2 ? nd : last === 3 ? rd : th}`;
}

/** Århundradet för året i ord: "1300-talet", "2900-talet f.Kr.", "14th century", "XIVe siècle". I förhistorien (före 10 000 f.Kr.,
 *  #1088) är århundraden för fina, och raden visar året avrundat till tusental i stället: "50 000 f.Kr.". */
export function formatCentury(y) {
  if (y < -9999) return formatYear(1 - Math.round(bce(y) / 1000) * 1000);
  const { bce: before, c, hundred } = centuryOf(y);
  const key = `time.century${c === 1 ? '1' : ''}.${before ? 'bce' : 'ce'}`;
  // Språket väljer hur numret skrivs (time.centuryStyle): 1300 (sv), 14th (en), 14 (de), XIV (es, fr)
  const n = { hundred, ordinal: ordinal(c), number: c, roman: roman(c) }[ui('time.centuryStyle')] ?? c;
  return ui(key, { n });
}

/**
 * Tidsfönstret avrundat för visning (#1191): fönstret är en andel av tidslinjen och blir därför ojämnt (38, 72, 120, cirka
 * 11 år). Raden visar ett avrundat tal, till närmaste 5 under 30 år och annars till närmaste 10 (11 → 10, 38 → 40,
 * 72 → 70, 120 → 120). Det som ritas använder fortfarande det exakta fönstret.
 */
export function roundWindow(n) {
  if (!(n > 0)) return 0;
  if (n >= 1000) return Math.round(n / 1000) * 1000; // förhistoriens glesa segment (#1088): ±11 640 blir ±12 000
  return n < 30 ? Math.max(5, Math.round(n / 5) * 5) : Math.round(n / 10) * 10;
}

/**
 * Fönstret före och efter året som avrundade tal (#1319): { before, after, same }. `same` är sant när de två sidorna blir
 * lika långa efter avrundningen; då visas fönstret med "±" som förut, annars skrivs båda sidorna i klartext.
 */
export function roundWindowSpan({ before, after }) {
  const b = roundWindow(before), a = roundWindow(after);
  return { before: b, after: a, same: b === a };
}

/** Text ur språkfilen som är en lista [en, flera] ("±1 år", "±3 år"), med {n} ersatt och eventuella andra värden i vars. */
export function pluralUi(key, n, vars = {}) {
  return String(ui(key)[n === 1 ? 0 : 1]).replace(/\{(\w+)\}/g, (m, k) => ({ n, ...vars })[k] ?? m);
}

/**
 * Hur långt en händelse ligger från året (hela år), med riktning (#995). Etiketten på klotet: "4 år före (1912)" för det som är
 * slut, "om 2 år (1918)" för det som börjar. Året står i parentes och formateras som vanligt (f.Kr. blir rätt).
 * Astronomiska år räknas rakt av: 1 e.Kr. minus 1 f.Kr. är 1 år, så det finns inget år 0 att räkna bort.
 */
export function formatDirection(when, year, eventYear) {
  // Hela år mellan årtalet på tidslinjen och årtalet i parentes, så att siffran alltid går att räkna efter. Spannen med månader
  // ger bråkdelar i dist (Afghanistankriget slutade 2021-08, alltså 4,3 år före 2026), men etiketten säger "5 år före (2021)".
  const n = Math.max(1, Math.abs(Math.floor(year) - eventYear));
  return pluralUi(when === 'past' ? 'time.beforeLabel' : 'time.afterLabel', n, { year: formatYear(eventYear) });
}

/**
 * Förhistoriens år visas avrundade (inför v6.3.0): i segmentet 100 000–3000 f.Kr. är ett steg på reglaget hundratals år, så
 * "99 001 f.Kr." eller "7413 f.Kr." låtsas en exakthet som inte finns. Före 10 000 f.Kr. avrundas året till närmaste tusental,
 * som århundraderaden redan gör (formatCentury), och 10 000–3000 f.Kr. till närmaste hundratal. 3000 f.Kr. och senare lämnas orörda.
 */
export function roundPrehistoric(y) {
  if (y < -9999) return 1 - Math.round(bce(y) / 1000) * 1000;
  if (y < -2999) return 1 - Math.round(bce(y) / 100) * 100;
  return y;
}

/**
 * Ett stort avstånd i år avrundat (inför v6.3.0): från 1000 år till närmaste hundratal och från 10 000 år till närmaste tusental,
 * så att panelen inte skriver "1001 år senare" i förhistorien. Mindre avstånd är exakta, som förut.
 */
export function roundLargeOffset(n) {
  if (n >= 10000) return Math.round(n / 1000) * 1000;
  if (n >= 1000) return Math.round(n / 100) * 100;
  return n;
}

/** Samma avstånd i Samtidigt-panelen: "34 år tidigare", "21 år senare". `amount` är hela år, och i fokusläget för korta krig (fine, #204) år som bråkdel som blir dagar. */
export function formatOffset(when, amount, fine = false) {
  const n = fine ? Math.max(1, Math.round(amount * 365.25)) : roundLargeOffset(Math.max(1, Math.round(amount)));
  return pluralUi(`panel.${when === 'past' ? 'earlier' : 'later'}${fine ? 'Days' : ''}`, n, { n: groupDigits(n) }); // "5 000 år tidigare" (#1093)
}

/** Stort årtal i huvudet: [siffra, epok]. */
export function yearParts(y) {
  if (isBCE(y)) return [groupDigits(bce(y)), BCE_TXT];
  if (y < 1000) return [String(y), CE_TXT];
  return [groupDigits(y), ''];
}

/** Tolkar ett inskrivet år till astronomiskt år, eller null. "2600 f.Kr.", "44 fkr", "300 BC" och
 *  "-500" blir före vår tideräkning; "1969", "800 e.Kr." och "AD 800" efter. Utan tideräkning i texten
 *  används `defaultEra` ('ce' eller 'bce'). Det finns inget år 0 i visningen: 1 f.Kr. är 0. */
export function parseYear(text, defaultEra = 'ce') {
  // Stora år (#1085) får skrivas med mellanrum mellan grupperna: "300 000 f.Kr."
  const m = /^\s*(?:(ad|a\.d\.)\s*)?([-−–]?)\s*(\d{1,3}(?:[ \u00a0\u202f]\d{3})+|\d{1,9})\s*(?:(f\.?\s*kr\.?|fkr|bc|b\.c\.|bce|e\.?\s*kr\.?|ekr|ad|a\.d\.|ce)\s*)?$/i.exec(text);
  if (!m) return null;
  const n = Number(m[3].replace(/[ \u00a0\u202f]/g, ''));
  if (n === 0) return null;
  const tag = (m[4] || '').toLowerCase().replace(/[.\s]/g, '');
  const isBc = m[2] ? true : tag ? /^(fkr|bc|bce)$/.test(tag) : m[1] ? false : defaultEra === 'bce';
  return isBc ? 1 - n : n;
}

function isValidDate(y, m, d) {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
  if (m < 1 || m > 12) return false;
  const maxDays = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return d >= 1 && d <= maxDays[m - 1];
}

export function parseYearInput(text, defaultEra = 'ce', now = new Date()) {
  const value = String(text ?? '').trim();
  if (!value) return { type: 'invalid', year: null, date: null, error: ui('time.error.input') };
  // Årshoppets era väljs uttryckligen, aldrig med ett inledande minustecken (#1075).
  if (/[-−–]/.test(value) && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { type: 'invalid', year: null, date: null, error: ui('jump.error.negative') };
  // Besökarens 0 är modellens astronomiska år 0, alltså 1 f.Kr. i visningen.
  if (/^0{1,4}$/.test(value)) return { type: 'year', year: 0, date: null };
  // Stora år (#1085): sex och åtta siffror utan något annat är datum (860426, 19860426). Ett stort år skrivs med
  // mellanrum ("300 000") eller med tideräkning ("300000 f.Kr."); fem, sju och nio siffror läses som år av parseYear.

  const iso = /^\d{4}-\d{2}-\d{2}$/.exec(value);
  if (iso) {
    const [y, mo, d] = value.split('-').map(Number);
    if (!isValidDate(y, mo, d)) return { type: 'invalid', year: null, date: null, error: ui('time.error.date') };
    return { type: 'date', year: y, date: value };
  }

  const full = /^\d{8}$/.exec(value);
  if (full) {
    const y = Number(value.slice(0, 4));
    const mo = Number(value.slice(4, 6));
    const d = Number(value.slice(6, 8));
    if (!isValidDate(y, mo, d)) return { type: 'invalid', year: null, date: null, error: ui('time.error.date') };
    return { type: 'date', year: y, date: `${value.slice(0, 4)}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}` };
  }

  const short = /^\d{6}$/.exec(value);
  if (short) {
    const yy = Number(value.slice(0, 2));
    const mo = Number(value.slice(2, 4));
    const d = Number(value.slice(4, 6));
    const currentYear = now.getFullYear();
    const year = yy <= currentYear % 100 ? 2000 + yy : 1900 + yy;
    if (!isValidDate(year, mo, d)) return { type: 'invalid', year: null, date: null, error: ui('time.error.date') };
    return { type: 'date', year, date: `${year}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}` };
  }

  const year = parseYear(value, defaultEra);
  if (year != null) return { type: 'year', year, date: null };
  return { type: 'invalid', year: null, date: null, error: ui('time.error.input') };
}

const MONTHS = ui('time.months'); // januari … december på valt språk
// Engelskan behåller dag–månad–år. Intl ger språkets skiljetecken och ordning; månad och år kommer från vår modell.
const calendarDate = new Intl.DateTimeFormat(LANG === 'en' ? 'en-GB' : LANG, {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});
function formatCalendarDate(year, month, day, yearText) {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day); // Date.UTC behandlar annars år 0–99 som 1900–1999
  return calendarDate.formatToParts(date).map(part => {
    if (part.type === 'month') return MONTHS[month - 1];
    if (part.type === 'year') return yearText;
    return part.value;
  }).join('');
}

/** Datum ur data ("2026-10-30") som text: "30 oktober 2026". */
export function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m && isValidDate(Number(m[1]), Number(m[2]), Number(m[3]))
    ? formatCalendarDate(Number(m[1]), Number(m[2]), Number(m[3]), m[1]) : (iso || '');
}

/** Tid för en händelse enligt dess precision och EDTF-markering. */
export function formatEventTime(e) {
  const edtf = e.edtf || '';
  if (e.ongoing) return ui('time.ongoing', { start: formatYear(e.start) }); // pågående krig (#223)
  const approx = edtf.includes('~') ? ui('time.approx') : '';
  const day = /^(-?\d{4})-(\d{2})-(\d{2})$/.exec(edtf);
  if (day && e.start === e.end && isValidDate(Number(day[1]), Number(day[2]), Number(day[3]))) {
    return formatCalendarDate(Number(day[1]), Number(day[2]), Number(day[3]), formatYear(e.start));
  }
  if (edtf.endsWith('/..')) return ui('time.since', { start: formatYear(e.start) });
  if (edtf.startsWith('../')) return ui('time.until', { end: approx + formatYear(e.end) });
  if (e.start === e.end) return approx + formatYear(e.start);
  // Stora år med språkets avgränsare (#1085, #1093): "cirka 53 000–50 000 f.Kr."
  if (isBCE(e.start) && isBCE(e.end)) return `${approx}${groupDigits(bce(e.start))}–${groupDigits(bce(e.end))} ${BCE_TXT}`;
  if (isBCE(e.start)) return `${approx}${groupDigits(bce(e.start))} ${BCE_TXT}–${e.end} ${CE_TXT}`;
  return `${approx}${e.start}–${e.end}`;
}

/** Pågående institutioner hör hemma i panelens egen, hopfällda grupp först efter ett sekel (#508). */
export const isLongRunning = (e, year) => /\/\.\.$/.test(e.edtf ?? '') && year - e.start >= 100;

// ---------- Delar av år (#204) ----------
// I fokusläget för korta krig räknar tidslinjen i dagar. Året är då ett decimaltal: året plus den
// andel av året som har gått, så att 1 januari 1879 är 1879,0 och 2 juli 1879 ungefär 1879,5.
// Datumen läses ur händelsernas edtf (proleptisk gregoriansk kalender, astronomiska år som i datan).
export const MONTHS_SHORT = ui('time.monthsShort'); // jan … dec på valt språk
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
// År med fler än fyra siffror skrivs med prefixet Y i EDTF (#1085): "Y-60000" är astronomiskt år -60000, ett helt år
const EDTF_LONG = /^Y(-?\d{5,})$/;
function edtfPart(s) {
  const clean = s.replace(/[~?%]/g, '');
  const long = EDTF_LONG.exec(clean);
  if (long) { const y = Number(long[1]); return [y, y + 1]; }
  const m = EDTF_PART.exec(clean);
  if (!m) return null;
  const y = Number(m[1]), mo = m[2] && Number(m[2]), d = m[3] && Number(m[3]);
  if (d) return [dateToYear(y, mo, d), dateToYear(y, mo, d + 1)];
  if (mo) return [dateToYear(y, mo), dateToYear(y, mo + 1)];
  return [y, y + 1];
}
/** Händelsens tid som [början, slut] i decimalår, ur edtf, även år med fler än fyra siffror ("Y-60000", #1085). Går edtf
 *  inte att läsa (öppna spann) används start och slut som hela år. Används bara i fokusläget för korta krig. */
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
// Det som syns direkt laddas vid start; det som bara behövs vid klick laddas när det behövs (#337).
// Händelserna och rikena kommer från de uppdelade filerna i data/genererat/, som tools/dela_data.py skriver ur
// data/events.json och data/empires/index.json (källfilerna är det man redigerar, docs/datamodell.md).
async function getJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Kunde inte läsa ${path} (${res.status})`);
  return res.json();
}

const isPlain = v => v != null && typeof v === 'object' && !Array.isArray(v);
/**
 * Lägger fälten i src på target, och slår ihop objekt på djupet (texter per språk, #337, #675). En fil med bara
 * engelska texter ({ title: { en } }) kan då läggas ovanpå en med svenska utan att de svenska försvinner,
 * och t() väljer språk som förut. Ett objekt ovanpå en lista ({ "2": { label: { en } } }) slås ihop med posten
 * på den platsen i listan, så att en språkfil kan översätta texter i en lista (tools/dela_data.py). Annars
 * ersätts listor (källor, berättelsens parter).
 */
export function mergeTexts(target, src) {
  for (const [k, v] of Object.entries(src)) {
    if (isPlain(v) && isPlain(target[k])) mergeTexts(target[k], v);
    else if (isPlain(v) && Array.isArray(target[k])) {
      for (const [i, part] of Object.entries(v)) {
        if (isPlain(part) && isPlain(target[k][i])) mergeTexts(target[k][i], part);
        else target[k][i] = part;
      }
    } else target[k] = v;
  }
  return target;
}

// Språkfilerna (#675): tools/dela_data.py skriver svenskan i grundfilerna och varje annat språk i en egen fil
// ovanpå (handelser-fkr.en.json …), listade i fältet translations i handelser.json. Sidan laddar bara det valda
// språket och engelska, som är reservspråket i t(). På svenska laddas inga språkfiler, eftersom varje text som
// delas upp har svenska. Kan en språkfil inte laddas visas svenskan i stället.
const TEXT_LANGS = LANG === 'sv' ? [] : [...new Set([LANG, ...FALLBACK])].filter(l => l !== 'sv');
let translations = {};
function languageFiles(file) {
  const stem = file.replace(/^.*\//, '').replace(/\.json$/, '');
  return Promise.all(TEXT_LANGS.filter(l => translations[l]?.includes(stem)).map(l =>
    getJSON(file.replace(/\.json$/, `.${l}.json`))
      .catch(err => { console.warn(`Texterna på ${l} kunde inte laddas (${file})`, err); return null; })));
}
/** Lägger språkfilernas texter (doc[key] = { id: texter }) på posterna; target(id) ger posten. */
function mergeLanguages(docs, key, target) {
  for (const doc of docs) {
    for (const [id, fields] of Object.entries(doc?.[key] ?? {})) {
      const t = target(id);
      if (t) mergeTexts(t, fields);
    }
  }
}

let DATA = null; // det loadAll() returnerade; de senare laddningarna fyller i samma objekt

export async function loadAll() {
  const [events, funfacts, land, empires, styles, discovery, imageLayers] = await Promise.all([
    getJSON('data/genererat/handelser.json'),
    getJSON('data/funfacts.json'),
    getJSON('data/land.json'),
    getJSON('data/genererat/riken.json'),
    getJSON('data/styles.json'),
    // Upptäcktsvyn (#101): liten fil; saknas den fungerar sidan ändå, utan upptäcktsvyn
    getJSON('data/upptackt.json').catch(err => { console.warn('Upptäcktsvyn kunde inte laddas', err); return null; }),
    getJSON('data/bildlager.json').catch(err => { console.warn('Bildlagren kunde inte laddas', err); return { layers: [] }; }),
  ]);
  const byId = Object.fromEntries(events.events.map(e => [e.id, e]));
  // Språkfilerna för händelserna och rikena (#675) läggs på innan något annat räknas ut
  translations = events.translations ?? {};
  const groupsById = Object.fromEntries(empires.groups.map(g => [g.id, g]));
  const [eventLangs, empireLangs] = await Promise.all([
    languageFiles('data/genererat/handelser.json'), languageFiles('data/genererat/riken.json')]);
  mergeLanguages(eventLangs, 'events', id => byId[id]);
  mergeLanguages(empireLangs, 'groups', id => groupsById[id]);
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
  // Krig och riken (#76): kriget anger rikena i empires (grupp-id i empires/index.json). Slagen ärver dem via
  // partOf (e._war._empires). Varje rike får sina krig i tidsordning i g._wars.
  for (const g of empires.groups) g._wars = [];
  for (const e of events.events) {
    if (e.kind !== 'war' || !Array.isArray(e.empires)) continue;
    e._empires = e.empires.map(id => groupsById[id]).filter(Boolean);
    for (const g of e._empires) g._wars.push(e);
  }
  for (const g of empires.groups) g._wars.sort((a, b) => a.start - b.start || a.end - b.end);
  DATA = {
    events: events.events, byId, funfacts: funfacts.funfacts, land,
    // Källregistret laddas vid första klick (loadSources); sources och srcById fylls i då, i samma objekt och lista
    sources: [], srcById: {},
    // Händelsernas långa fält (sammanfattning, källor, bild, berättelse) ligger per period (loadEventDetails)
    periods: events.periods.map(p => ({ ...p, from: p.from ?? -Infinity })).sort((a, b) => a.from - b.from),
    // Rikena ligger i en fil per rike (R1): indexet vid start, själva gränserna med loadEmpire(), faktarutorna med loadEmpireFacts()
    empireGroups: empires.groups, polities: empires.groups.flatMap(g => g.polities.map(p => ({ ...p, group: g.id }))),
    // Dagens gränser laddas när lagret slås på (loadBorders)
    borders: null, styles, discovery, imageLayers,
  };
  return DATA;
}

/** Källregistret (data/sources.json), första gången en faktaruta, Om källorna eller en källrad behöver det. */
let sourcesPromise = null;
export const sourcesReady = () => !!DATA?.sourcesLoaded;
export function loadSources() {
  sourcesPromise ??= getJSON('data/sources.json').then(doc => {
    DATA.sources.push(...doc.sources);
    Object.assign(DATA.srcById, Object.fromEntries(doc.sources.map(s => [s.id, s])));
    DATA.sourcesLoaded = true;
    return DATA.srcById;
  }).catch(err => { sourcesPromise = null; throw err; });
  return sourcesPromise;
}

/**
 * Epokerna (#845, #965): indelningarna i data/perioder.json (Lgr22 och Nordens forntid) som snabbknappar i intervallformuläret.
 * Laddas första gången formuläret öppnas, inte vid start. Går filen inte att ladda blir listan tom och knapparna uteblir;
 * formuläret med årsfälten fungerar ändå.
 */
let perioderPromise = null;
export function loadPerioder() {
  perioderPromise ??= getJSON('data/perioder.json').then(doc => doc.divisions ?? []).catch(err => {
    console.warn('Epokerna kunde inte laddas', err);
    return [];
  });
  return perioderPromise;
}

/**
 * Teman (data/teman.json, #398): namngivna urval av befintliga händelser som Fokus följer. Laddas första gången
 * Fokusmenyn öppnas eller ett tema i adressen börjar. Bara teman som är kontrollerade (inte draft) behålls, och en
 * fil som saknas eller inte går att läsa ger en tom lista; sidan fungerar ändå.
 */
/**
 * Platser (data/platser.json, #579): kurerade kort om platsers historia, med dagens gräns som kontur. Laddas första
 * gången Fokusmenyn öppnas eller en plats i adressen börjar. Bara kontrollerade platser (inte draft) behålls; en
 * fil som saknas eller inte går att läsa ger en tom lista.
 */
let placesPromise = null;
export function loadPlaces() {
  placesPromise ??= getJSON('data/platser.json').then(doc => (Array.isArray(doc?.places) ? doc.places : [])
    .filter(p => p && typeof p.id === 'string' && p.boundary?.geometry && isVisibleReview(p.review))).catch(err => {
    console.warn('Platser kunde inte laddas', err);
    return [];
  });
  return placesPromise;
}

let themesPromise = null;
export function loadThemes() {
  themesPromise ??= getJSON('data/teman.json').then(doc => (Array.isArray(doc?.themes) ? doc.themes : [])
    .filter(th => th && typeof th.id === 'string' && Array.isArray(th.events) && isVisibleReview(th.review))).catch(err => {
    console.warn('Teman kunde inte laddas', err);
    return [];
  });
  return themesPromise;
}

/**
 * Missuppfattningarna (data/missuppfattningar.json, #838), första gången en faktaruta visas. Bara de som är
 * kontrollerade (inte draft) behålls. En post hör till faktarutan för varje händelse i sitt fält events;
 * poster utan händelse visas inte än.
 */
let misconceptionsPromise = null;
export const misconceptionsReady = () => !!DATA?.misconceptionsLoaded;
export function loadMisconceptions() {
  misconceptionsPromise ??= getJSON('data/missuppfattningar.json').then(doc => {
    DATA.misconceptions = (doc.misconceptions ?? []).filter(m => isVisibleReview(m.review));
    DATA.misconceptionsLoaded = true;
  }).catch(err => {
    // Går filen inte att ladda räknas den som färdig med en tom lista: ingen ny laddning vid varje omritning,
    // och felet loggas en gång. Faktarutan ritas ändå med händelsens egen källrad.
    console.warn('Missuppfattningarna kunde inte laddas', err);
    DATA.misconceptions = [];
    DATA.misconceptionsLoaded = true;
  });
  return misconceptionsPromise;
}
/** Quizets frågor om tid (data/quiz.json, #846), första gången quizet öppnas. Går filen inte att läsa blir listan tom. */
let quizPostsPromise = null;
export function loadQuizPosts() {
  quizPostsPromise ??= getJSON('data/quiz.json').then(doc => { DATA.quizPosts = doc.questions ?? []; })
    .catch(err => { console.warn('Quizets tidsfrågor kunde inte laddas', err); DATA.quizPosts = []; });
  return quizPostsPromise;
}
/** Missuppfattningarna som hör till en händelse (tom lista innan de har laddats). */
export const misconceptionsFor = id => (DATA?.misconceptions ?? []).filter(m => m.events?.includes(id));

/** Perioden en händelse hör till efter sitt startår (samma regel som period_of i tools/dela_data.py). */
function periodOf(e) {
  let p = DATA.periods[0];
  for (const q of DATA.periods) if (e.start >= q.from) p = q;
  return p;
}
const periodFiles = new Map();
function loadPeriod(p) {
  if (!periodFiles.has(p.id)) {
    periodFiles.set(p.id, Promise.all([getJSON(p.file), languageFiles(p.file)]).then(([doc, langs]) => {
      for (const [id, fields] of Object.entries(doc.events)) if (DATA.byId[id]) mergeTexts(DATA.byId[id], fields);
      mergeLanguages(langs, 'events', id => DATA.byId[id]);
      // Alla händelser i perioden räknas som klara, också en som saknas i filen, så att ingen väntar i en evig loop
      for (const e of DATA.events) if (periodOf(e) === p) e._full = true;
    }).catch(err => { periodFiles.delete(p.id); throw err; }));
  }
  return periodFiles.get(p.id);
}
/**
 * Händelsernas långa fält (summary, note, story, image, sources, wikidata, evidence) för de här händelserna. Filerna per
 * period laddas en gång; händelserna får fälten i samma objekt och _full = true. Ger ett löfte.
 */
export function loadEventDetails(events) {
  const ps = new Set(events.filter(e => e && !e._full).map(periodOf));
  return Promise.all([...ps].map(loadPeriod));
}
/** Alla perioder (Om källorna räknar källor för alla händelser). Fun facts ärver då källorna från sina händelser. */
export function loadAllEventDetails() {
  return Promise.all(DATA.periods.map(loadPeriod)).then(() => {
    // Fun facts ärver källorna från sina händelser (källa krävs för båda leden).
    for (const f of DATA.funfacts) f.sources = [...new Set(f.events.flatMap(id => DATA.byId[id]?.sources ?? []))];
  });
}
/**
 * Det som saknas för att visa de här händelserna i en faktaruta: deras långa fält och källregistret.
 * Ger null om allt redan finns (då kan anroparen rita klart direkt), annars ett löfte.
 */
export function needDetails(events = [], { sources = true, misconceptions = false } = {}) {
  const missing = events.some(e => e && !e._full);
  const needMisc = misconceptions && !misconceptionsReady();
  if (!missing && !needMisc && (!sources || sourcesReady())) return null;
  return Promise.all([missing ? loadEventDetails(events) : null, sources ? loadSources() : null,
    // loadMisconceptions misslyckas aldrig: faktarutan ritas även om filen inte kan laddas
    needMisc ? loadMisconceptions() : null]);
}

/** Rikenas faktarutor (data/genererat/riken-fakta.json): fyller i facts i varje grupp som har hasFacts. */
let empireFactsPromise = null;
export function loadEmpireFacts() {
  const file = 'data/genererat/riken-fakta.json';
  empireFactsPromise ??= Promise.all([getJSON(file), languageFiles(file)]).then(([doc, langs]) => {
    for (const g of DATA.empireGroups) if (doc.facts[g.id]) g.facts = doc.facts[g.id];
    mergeLanguages(langs, 'facts', id => DATA.empireGroups.find(g => g.id === id)?.facts);
  }).catch(err => { empireFactsPromise = null; throw err; });
  return empireFactsPromise;
}

/** Dagens gränser (data/borders.json), när lagret slås på eller Om källorna öppnas. */
let bordersPromise = null;
export function loadBorders() {
  bordersPromise ??= getJSON('data/borders.json').then(doc => (DATA.borders = doc))
    .catch(err => { bordersPromise = null; throw err; });
  return bordersPromise;
}

/** Människans spridning (data/spridning.json, #1094) och källregistret, när lagret slås på. */
let spreadPromise = null;
export function loadSpread() {
  spreadPromise ??= Promise.all([getJSON('data/spridning.json'), loadSources()]).then(([doc]) => doc)
    .catch(err => { spreadPromise = null; throw err; });
  return spreadPromise;
}

/** Allt som Om källorna räknar med: källregistret, alla händelsers källor och bilder, rikenas faktarutor och gränserna. */
export function loadForSources() {
  return Promise.all([loadSources(), loadAllEventDetails(), loadEmpireFacts(), loadBorders()]);
}

/** Ett rikes gränser (data/empires/<grupp>.json), laddas första gången riket behövs.
 *  Ett försvunnet land utan gräns i Cliopatria har ingen fil, bara en punkt (vanished.point, #72). */
const empireFiles = new Map();
/**
 * Fast medaljplats (#1189): labelAt i gruppen ersätter label-punkten för de perioder som ligger helt inom
 * from–to, när den största delen av ytan ger fel bild (Danmark på Grönland). at: null betyder ingen medalj
 * och inget namn de åren, när källans yta inte innehåller landet självt (Norge 1941–1944 är bara Jan Mayen).
 */
function applyLabelAt(group, polities) {
  for (const r of group.labelAt ?? []) {
    const polity = polities.find(p => p.id === r.polity);
    for (const period of polity?.periods ?? []) {
      if (period.start >= r.from && period.end <= r.to) period.label = Array.isArray(r.at) ? r.at : null;
    }
  }
  return polities;
}

export function loadEmpire(group) {
  if (!empireFiles.has(group.id)) empireFiles.set(group.id, group.file ? getJSON(group.file).then(d => applyLabelAt(group, d.polities)) : Promise.resolve([]));
  return empireFiles.get(group.id);
}

/**
 * Vägar och resor (#38): data/routes/index.json listar filerna (files), och varje fil har { routes: [...] }.
 * Filerna laddas efter starten, så att sidan inte väntar på dem. En fil som saknas eller inte går att läsa
 * hoppas över med en varning, och saknas index.json blir det inga vägar; sidan fungerar ändå.
 * En post i files är en sökväg från repots rot ("data/routes/columbus.json") eller ett filnamn i data/routes/.
 */
let routesPromise = null;
export function loadRoutes() {
  routesPromise ??= getJSON('data/routes/index.json').then(async index => {
    const paths = (index.files ?? []).map(f => typeof f === 'string' ? f : f?.file).filter(Boolean)
      .map(f => f.includes('/') ? f : `data/routes/${f}`);
    const files = await Promise.allSettled(paths.map(getJSON));
    return files.flatMap((r, i) => {
      if (r.status === 'fulfilled' && Array.isArray(r.value?.routes)) return r.value.routes;
      console.warn(`Vägarna i ${paths[i]} kunde inte läsas`, r.reason ?? '');
      return [];
    });
  }).catch(err => { console.warn('Vägar och resor kunde inte laddas', err); return []; });
  return routesPromise;
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

/**
 * Religionens symbol (#271): fältet symbol i religions.json är namnet på en egen teckning i img/icons/.
 * symbolUrl ger sökvägen (null om symbol saknas), symbolImg en <img> som står bredvid färgen i menyer och rutor.
 * Symbolen är dekor bredvid namnet, så alt är tomt.
 */
export const symbolUrl = r => /^[\w-]+$/.test(r?.symbol ?? '') ? `img/icons/${r.symbol}.svg` : null;
export const symbolImg = (r, cls = 'rel-sym') => symbolUrl(r) ? `<img class="${cls}" src="${symbolUrl(r)}" alt="" width="16" height="16">` : '';
export const flagUrl = r => /^[\w-]+$/.test(r?.file ?? '') ? `img/flags/${r.file}.svg` : null;
export const flagImg = (r, cls = 'rel-sym') => flagUrl(r) ? `<img class="${cls}" src="${flagUrl(r)}" alt="" width="16" height="16">` : '';
