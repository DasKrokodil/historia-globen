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
export const CATEGORIES = [
  { id: 'natur',          name: { sv: 'Natur och djur' },                 color: '#8cc084' },
  { id: 'manniskan',      name: { sv: 'Människans ursprung' },            color: '#c99263' },
  { id: 'civilisationer', name: { sv: 'Civilisationer och riken' },       color: '#e3a33f' },
  { id: 'religion',       name: { sv: 'Religion' },                       color: '#b892dc' },
  { id: 'vetenskap',      name: { sv: 'Vetenskap och uppfinningar' },     color: '#5fb6dd' },
  { id: 'upptackter',     name: { sv: 'Upptäcktsresor' },                 color: '#4fc6b2' },
  { id: 'krig',           name: { sv: 'Krig och konflikter' },            color: '#e5675a' },
  { id: 'kultur',         name: { sv: 'Kultur och arkitektur' },          color: '#ec98bd' },
  { id: 'sport',          name: { sv: 'Sport' },                          color: '#f28c45' },
  { id: 'ekonomi',        name: { sv: 'Ekonomi och handel' },             color: '#a9bd5e' },
  { id: 'halsa',          name: { sv: 'Hälsa och epidemier' },            color: '#d8d46e' },
  { id: 'klimat',         name: { sv: 'Klimat och naturkatastrofer' },    color: '#7aa4e6' },
  { id: 'rymden',         name: { sv: 'Rymden' },                         color: '#cfcbff' },
];
export const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// Granskningsstatus (källpolicy). Bara kontrollerade uppgifter visas som standard.
export const REVIEW = {
  'draft':          { sv: 'Utkast',                          cls: 'draft' },
  'source-checked': { sv: 'Källa kontrollerad, ej granskad av människa', cls: 'checked' },
  'two-sources':    { sv: 'Två källor stämmer, ej granskad av människa', cls: 'two' },
  'human-reviewed': { sv: 'Granskad av människa',            cls: 'human' },
};
export const settings = { showDrafts: false };
export const isVisibleReview = r => settings.showDrafts || r === 'source-checked' || r === 'two-sources' || r === 'human-reviewed';

// ---------- Världsdelar ----------
// Grov indelning efter koordinater, för att gruppera listan "Samtidigt i världen" (#120).
// Gränserna är ungefärliga: Gibraltar, Medelhavet, Suez och Röda havet, Bosporen, Kaukasus och Ural.
export const REGIONS = ['Europa', 'Asien', 'Afrika', 'Amerika', 'Oceanien'];
export function region(lat, lon) {
  if (lat > 50 && (lon < -168 || lon > 160)) return 'Asien'; // Sibiriens östspets och Wrangelön vid datumlinjen
  if (lon < -120 && lat < 30) return 'Oceanien'; // Hawaii och Stilla havet
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

const MONTHS = ['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december'];

/** Tid för en händelse enligt dess precision och EDTF-markering. */
export function formatEventTime(e) {
  const edtf = e.edtf || '';
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
