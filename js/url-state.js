// Tillståndet i adressen (#501) och delbara länkar (#64).
// Formatet är en kort, läsbar hash efter sidans adress, byggd på toJSON()/fromJSON() i js/state.js (#403):
//
//   #y=1325&c=34,-50,1.6&f=war:hundraarskriget&l=areas,events&k=krig,kultur
//
//   y     året (decimaltal i fokusläget för korta krig, #204)
//   c     kameran: lat,lon,zoom
//   f     det man följer i Fokus: <typ>:<id>, typ = war, empire, religion eller route
//   l     lagren som är på (id i lagerregistret), kommaseparerade; "l=" betyder inga lager
//   k     kategorierna som syns; saknas k syns alla kategorier
//   t     en guidad tur som pågår (tur-id i data/turer/, #736); en länk med t startar turen
//   s     turens steg (stegets id); saknas s börjar turen vid första steget
//   u     ett elevuppdrag som pågår (uppdragets id i data/uppdrag.json, #741); en länk med u startar uppdraget
//
// En länk till en tur behöver bara t, till exempel #t=vikingatiden-och-varlden. Den äldre formen ?tur=<id>
// fungerar också. Medan turen pågår skriver sidan y, c, l, k, t och s för det steg som visas.
//
// Lugn rörelse står inte i länken: det är besökarens egen inställning för tillgänglighet och ska inte
// ändras av någon annans länk.
//
// Bara y krävs (eller t, för en tur). Okända fält hoppas över, så att en länk från en senare version ändå öppnas så gott det går.
// Filen har inga importer från webbläsaren och testas i node (tests/url-state.test.mjs).

import { STATE_VERSION, fromJSON } from './state.js';

const ID = /^[a-z0-9-]+$/;
const num = x => String(Math.round(x * 10000) / 10000);

/**
 * Hashen för ett tillstånd från toJSON(). allCategories är alla kategorier som finns i datan: syns alla,
 * skrivs k inte ut, så att länken blir kort och fortsätter att visa alla när en ny kategori kommer till.
 */
export function encodeHash(json, allCategories = [], tour = null, mission = null) {
  const parts = [`y=${num(json.year)}`];
  if (json.camera) parts.push(`c=${[json.camera.lat, json.camera.lon, json.camera.zoom].map(num).join(',')}`);
  if (json.focus) parts.push(`f=${json.focus}`);
  parts.push(`l=${(json.layers ?? []).join(',')}`);
  const all = allCategories.length && allCategories.every(c => json.filters.includes(c));
  if (!all) parts.push(`k=${(json.filters ?? []).join(',')}`);
  if (tour?.id && ID.test(tour.id)) {
    parts.push(`t=${tour.id}`);
    if (tour.step && ID.test(tour.step)) parts.push(`s=${tour.step}`);
  }
  if (mission && ID.test(mission)) parts.push(`u=${mission}`);
  return `#${parts.join('&')}`;
}

/** Elevuppdraget i en hash ("#…&u=<id>", #741), eller null. Id med fel tecken räknas som saknade. */
export function decodeMission(hash) {
  const id = new URLSearchParams(String(hash ?? '').replace(/^#/, '')).get('u');
  return id && ID.test(id) ? id : null;
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
 * Läser en hash ("#y=1325&…") till samma form som fromJSON() ger, med två tillägg: layers och filters är
 * null när de saknas i länken (då behålls sidans vanliga val). Ger null när hashen saknar ett giltigt år,
 * och kastar aldrig: en trasig länk ska ge det vanliga startläget, inte ett fel.
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
  const doc = { v: STATE_VERSION, year, camera, focus: params.get('f') || null, layers: layers ?? [], filters: filters ?? [], calm: false };
  let state;
  try { state = fromJSON(doc); } catch {
    // Ett trasigt fält (till exempel ett okänt fokus) tas bort; året och resten gäller ändå
    try { state = fromJSON({ ...doc, focus: null }); } catch { return null; }
    if (doc.focus) state.focusError = true;
  }
  return { ...state, layers: layers ? state.layers : null, filters: filters ? state.filters : null };
}

/**
 * Ska ändringen få en egen post i webbläsarens historik (bakåt/framåt)? Ja när fokus, lagren eller kategorierna
 * ändras, eller när året har hoppat (inte under uppspelning). Annars, till exempel när kameran vrids eller
 * tiden spelas upp, ersätts den nuvarande posten, så att bakåt inte stegar genom varje bildruta.
 */
export function isNewStep(prev, next, { playing = false } = {}) {
  if (!prev) return false;
  if (prev.focus !== next.focus) return true;
  if (prev.layers.join() !== next.layers.join() || prev.filters.join() !== next.filters.join()) return true;
  return !playing && Math.abs(prev.year - next.year) >= 1;
}
