// Tillståndet i adressen (#501) och delbara länkar (#64).
// Formatet är en kort, läsbar hash efter sidans adress, byggd på toJSON()/fromJSON() i js/state.js (#403):
//
//   #y=1325&c=34,-50,1.6&f=war:hundraarskriget&l=areas,events&k=krig,kultur
//
//   y     året (decimaltal i fokusläget för korta krig, #204)
//   y2    slutåret när ett tidsintervall är valt (#755): y=1914&y2=1918 är 1914–1918. En äldre version hoppar över y2
//         och öppnar länken som året y
//   c     kameran: lat,lon,zoom
//   f     det man följer i Fokus: <typ>:<id>, typ = war, empire, religion, route, theme eller place (FOCUS_TYPES i js/state.js)
//   l     lagren som är på (id i lagerregistret), kommaseparerade; "l=" betyder inga lager
//   k     kategorierna som syns; saknas k syns alla kategorier
//   g     händelseurvalet i en förinställd vy, till exempel g=oversikt; saknas g visar alla händelser
//   t     en guidad tur som pågår (tur-id i data/turer/, #736); en länk med t startar turen
//   s     turens steg (stegets id); saknas s börjar turen vid första steget
//   u     ett elevuppdrag som pågår (uppdragets id i data/uppdrag.json, #741); en länk med u startar uppdraget
//   m     läget: bara m=lektion finns (#795). Tillsammans med t startar länken turen som lektion med låst
//         lagerval (lesson.lock i turen); utan en tur som är en lektionstur gör m ingenting
//
// En länk till en tur behöver bara t, till exempel #t=vikingatiden-och-varlden. Den äldre formen ?tur=<id>
// fungerar också. Medan turen pågår skriver sidan y, c, l, k, t och s för det steg som visas.
//
// Lugn rörelse står inte i länken: det är besökarens egen inställning för tillgänglighet och ska inte
// ändras av någon annans länk.
//
// Reserverade fält (#397, beslut 2026-11-13) skrivs inte än och får inte användas till något annat:
//   d = tidsdomänen i version 8 (människans eller jordens historia), tillståndets fält domain (RESERVED_STATE_KEYS i
//   js/state.js). Värdena bestäms när läget byggs. En länk med d öppnas i dag som om d saknades.
//
// Felkanalen (#1324): decodeProblems() säger vad i en länk som inte gick att tolka, som en lista med { kind, why, value }
// (kind: 'tour', 'focus' eller 'year'). Länken öppnas som förut; kanalen ändrar inget i tolkningen och skriver inget i
// adressen. Det som bara datan kan avgöra (finns turen, finns kriget?) lägger controllers/address.js till i samma lista.
//
// Bara y krävs (eller t, för en tur). Okända fält hoppas över, så att en länk från en senare version ändå öppnas så gott det går.
// Filen har inga importer från webbläsaren och testas i node (tests/url-state.test.mjs).

import { STATE_VERSION, fromJSON, parseFocusKey, MIN_YEAR, MAX_YEAR } from './state.js';

const ID = /^[a-z0-9-]+$/;
/** Adressfält som är reserverade för en senare version (#397): fältets namn och tillståndets fält det ska bära. */
export const RESERVED_HASH_FIELDS = { d: 'domain' };
export const LESSON_MODE = 'lektion';
/** Lärarens väg i lektionsläget (#885): `r=lararen` i en lektionslänk ger knappen för elev- och lärarblad. Skrivs aldrig tillbaka till adressen. */
export const TEACHER_ROLE = 'lararen';
const num = x => String(Math.round(x * 10000) / 10000);
const clampYear = year => Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));

/**
 * Hashen för ett tillstånd från toJSON(). allCategories är alla kategorier som finns i datan: syns alla,
 * skrivs k inte ut, så att länken blir kort och fortsätter att visa alla när en ny kategori kommer till.
 */
export function encodeHash(json, allCategories = [], tour = null, mission = null, mode = null) {
  const parts = [`y=${num(json.year)}`];
  if (json.yearEnd != null) parts.push(`y2=${num(json.yearEnd)}`);
  if (json.yearEnd != null && json.period && ID.test(json.period)) parts.push(`p=${json.period}`); // epoken som valdes (#980); äldre länkar saknar den
  if (json.camera) parts.push(`c=${[json.camera.lat, json.camera.lon, json.camera.zoom].map(num).join(',')}`);
  if (json.focus) parts.push(`f=${json.focus}`);
  parts.push(`l=${(json.layers ?? []).join(',')}`);
  const all = allCategories.length && allCategories.every(c => json.filters.includes(c));
  if (!all) parts.push(`k=${(json.filters ?? []).join(',')}`);
  if (json.tag && ID.test(json.tag)) parts.push(`g=${json.tag}`);
  if (tour?.id && ID.test(tour.id)) {
    parts.push(`t=${tour.id}`);
    if (tour.step && ID.test(tour.step)) parts.push(`s=${tour.step}`);
  }
  if (mission && ID.test(mission)) parts.push(`u=${mission}`);
  if (mode === LESSON_MODE && tour?.id) parts.push(`m=${mode}`); // läget hör till en tur
  return `#${parts.join('&')}`;
}

/** Elevuppdraget i en hash ("#…&u=<id>", #741), eller null. Id med fel tecken räknas som saknade. */
export function decodeMission(hash) {
  const id = new URLSearchParams(String(hash ?? '').replace(/^#/, '')).get('u');
  return id && ID.test(id) ? id : null;
}

/** Läget i en hash ("#…&m=lektion", #795): 'lektion' eller null. Okända lägen räknas som saknade. */
/** Läraren i en lektionslänk (`r=lararen`, #885), annars null. Eleven i den vanliga länken får ingen utskriftsknapp. */
export function decodeRole(hash) {
  return new URLSearchParams(String(hash ?? '').replace(/^#/, '')).get('r') === TEACHER_ROLE ? TEACHER_ROLE : null;
}

export function decodeMode(hash) {
  return new URLSearchParams(String(hash ?? '').replace(/^#/, '')).get('m') === LESSON_MODE ? LESSON_MODE : null;
}

/**
 * Turen i en hash ("#…&t=<id>&s=<steg>", #736) eller i den äldre formen ?tur=<id> (search). Ger { id, step }
 * eller null. step är null när länken inte anger något steg. Id med fel tecken räknas som saknade.
 */
export function decodeTour(hash, search = '') {
  const params = new URLSearchParams(String(hash ?? '').replace(/^#/, ''));
  const id = params.get('t') ?? new URLSearchParams(String(search ?? '')).get('tur');
  if (!id || !ID.test(id)) return null;
  const step = params.get('s');
  return { id, step: step && ID.test(step) ? step : null };
}

/**
 * Det i en länk som inte går att tolka (felkanalen, #1324): en lista med { kind, why, value }, tom när allt går att läsa.
 * value är texten ur länken, orörd (visningen kapar och skriver den som text). Tre slag, i den här ordningen:
 *   tour   t (eller ?tur=) med tecken som inget tur-id kan ha        why 'missing'
 *   focus  f som inte är <typ>:<id> med en känd typ (FOCUS_TYPES)    why 'missing'
 *   year   y som inte är ett tal (y= utan värde räknas som saknat)   why 'format'
 * Ren funktion utan DOM som aldrig kastar. Att ett id följer formen men saknas i datan avgörs där registren finns
 * (js/controllers/address.js), som lägger till { kind, why: 'missing' | 'fetch', value } i samma lista.
 */
export function decodeProblems(hash, search = '') {
  const params = new URLSearchParams(String(hash ?? '').replace(/^#/, ''));
  const problems = [];
  const tour = params.get('t') ?? new URLSearchParams(String(search ?? '')).get('tur');
  if (tour != null && tour.trim() !== '' && !ID.test(tour)) problems.push({ kind: 'tour', why: 'missing', value: tour });
  const focus = params.get('f');
  if (focus != null && focus !== '' && !parseFocusKey(focus)) problems.push({ kind: 'focus', why: 'missing', value: focus });
  const year = params.get('y');
  if (year != null && year.trim() !== '' && !Number.isFinite(Number(year))) problems.push({ kind: 'year', why: 'format', value: year });
  return problems;
}

/**
 * Läser en hash ("#y=1325&…") till samma form som fromJSON() ger, med två tillägg: layers och filters är
 * null när de saknas i länken (då behålls sidans vanliga val). Ger null när hashen saknar ett giltigt år,
 * och kastar aldrig: en trasig länk ska ge det vanliga startläget, inte ett fel. Det som inte gick att tolka står i
 * problems (felkanalen, #1324), som bara finns när något är trasigt; ett ogiltigt år ger null och läses med decodeProblems().
 */
export function decodeHash(hash) {
  const text = String(hash ?? '').replace(/^#/, '');
  if (!text) return null;
  const params = new URLSearchParams(text);
  const yText = params.get('y');
  if (yText == null || yText.trim() === '') return null;
  const year = Number(yText);
  if (!Number.isFinite(year)) return null;
  const list = key => (params.has(key) ? params.get(key).split(',').map(s => s.trim()).filter(s => /^[a-z0-9-]+$/.test(s)) : null);
  let camera = null;
  const c = params.get('c')?.split(',').map(Number);
  if (c?.length === 3 && c.every(Number.isFinite)) camera = { lat: c[0], lon: c[1], zoom: c[2] };
  const layers = list('l'), filters = list('k');
  const y2 = params.get('y2') != null && params.get('y2').trim() !== '' ? Number(params.get('y2')) : null;
  const tag = params.get('g');
  const doc = { v: STATE_VERSION, year: clampYear(year), camera, focus: params.get('f') || null, layers: layers ?? [], filters: filters ?? [], tag, calm: false };
  if (Number.isFinite(y2)) { doc.yearEnd = clampYear(Math.round(y2)); if (params.get('p')) doc.period = params.get('p'); } // fromJSON jämför efter klippningen: ett tomt intervall blir ett år
  let state;
  try { state = fromJSON(doc); } catch {
    // Ett trasigt fält (till exempel ett okänt fokus) tas bort; året och resten gäller ändå. Felet står i problems (#1324)
    try { state = fromJSON({ ...doc, focus: null }); } catch { return null; }
  }
  const problems = decodeProblems(text);
  return { ...state, layers: layers ? state.layers : null, filters: filters ? state.filters : null, ...(problems.length ? { problems } : {}) };
}

/**
 * Ska ändringen få en egen post i webbläsarens historik (bakåt/framåt)? Ja när fokus, tidsintervallet (#755), lagren
 * eller kategorierna ändras, eller när året har hoppat (inte under uppspelning). Annars, till exempel när kameran vrids eller
 * tiden spelas upp, ersätts den nuvarande posten, så att bakåt inte stegar genom varje bildruta.
 */
export function isNewStep(prev, next, { playing = false } = {}) {
  if (!prev) return false;
  if (prev.focus !== next.focus) return true;
  if ((prev.yearEnd ?? null) !== (next.yearEnd ?? null) || (prev.period ?? null) !== (next.period ?? null)) return true;
  if ((prev.tag ?? null) !== (next.tag ?? null)) return true;
  if (prev.layers.join() !== next.layers.join() || prev.filters.join() !== next.filters.join()) return true;
  return !playing && Math.abs(prev.year - next.year) >= 1;
}
