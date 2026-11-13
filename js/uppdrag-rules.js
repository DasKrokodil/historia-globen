// Elevuppdrag (#741, ur idésamlingen #250): Samtidighetsjakten. "Hitta händelser på olika kontinenter omkring
// år X." Eleven lägger händelser i jakten, och reglerna här avgör ur datan om de räknas. Inga nya fakta.
// Filen använder bara region() ur js/model.js och testas i node (tests/uppdrag.test.mjs).
//
// En händelse räknas när den syns (isVisible), har en punkt på globen, pågår uppdragets år (samtidigt) eller
// ligger högst window år därifrån (nära i tid), och dess världsdel inte redan finns i jakten. "Samtidigt" och
// "nära i tid" är samma regel som i fun facts och quizet (js/samtidighet.js, #1311); window står i uppdraget.
import { region } from './model.js';
import { relationToYear } from './samtidighet.js';

export const MISSION_ID = /^[a-z0-9-]+$/;

/** Uppdragets år som [från, till]. */
export const span = m => [m.year - m.window, m.year + m.window];

/** Händelsens världsdel ur dess punkt (samma indelning som Samtidigt-panelen), eller null. */
export function eventRegion(e) {
  const lat = e._lat ?? (e.location?.type === 'Point' ? e.location.coordinates[1] : NaN);
  const lon = e._lon ?? (e.location?.type === 'Point' ? e.location.coordinates[0] : NaN);
  return Number.isFinite(lat) && Number.isFinite(lon) ? region(lat, lon) : null;
}

/**
 * Får händelsen e läggas i jakten? found är händelserna som redan finns där.
 * Ger { ok: true, region } eller { ok: false, reason } där reason är hidden, place, time, already eller region.
 */
export function checkHunt(e, mission, found, isVisible) {
  if (!e || !isVisible(e.review)) return { ok: false, reason: 'hidden' };
  if (found.some(x => x.id === e.id)) return { ok: false, reason: 'already' };
  const r = eventRegion(e);
  if (!r) return { ok: false, reason: 'place' };
  const when = relationToYear(e, mission.year, mission.window);
  if (!when) return { ok: false, reason: 'time' };
  if (found.some(x => eventRegion(x) === r)) return { ok: false, reason: 'region', region: r };
  return { ok: true, region: r, when };
}

/**
 * Får uppdraget m startas i lektionen tourId med låsta år years ([från, till])? Ett uppdrag med fältet lesson hör
 * till den lektionen och bara den (#1340, beslutet i docs/beslut/2026-11-13-uppdrag-knutna-till-lektion.md). Ett
 * uppdrag utan lesson får användas i en lektion när dess år ligger i lektionens år (reserv, som före #1340).
 */
export function fitsLesson(m, tourId, years) {
  if (m.lesson) return m.lesson === tourId;
  return !years || (m.year >= years[0] && m.year <= years[1]);
}

/** Uppdragen som lektionens slutkort visar: lektionens egna, annars de utan lektion vars år ligger i lektionens år. */
export function missionsForLesson(missions, tourId, years) {
  const own = missions.filter(m => m.lesson === tourId);
  return own.length ? own : missions.filter(m => !m.lesson && years && fitsLesson(m, tourId, years));
}

/** Uppdraget som Mer startar: det första som inte hör till en lektion (lektionens uppdrag nås från slutkortet). */
export const defaultMission = missions => missions.find(m => !m.lesson) ?? missions[0] ?? null;

/**
 * Händelserna som eleven kan hitta på globen och som räknas i jakten, per världsdel: { världsdel: [id, …] }.
 * Slag och andra händelser i ett krig (partOf) syns bara i Fokus på kriget, utom krigets viktigaste (top), så de
 * räknas inte här (js/layers/events.js). Används av testet som visar att varje uppdrag går att klara.
 */
export function huntCandidates(events, mission, isVisible) {
  const out = {};
  for (const e of events) {
    if (e.partOf && !e.top) continue;
    const r = checkHunt(e, mission, [], isVisible);
    if (r.ok) (out[r.region] ??= []).push(e.id);
  }
  return out;
}

/** Är jakten klar? */
export const huntDone = (mission, found) => found.length >= mission.count;

const isText = v => !!v && typeof v === 'object' && typeof v.sv === 'string' && v.sv.trim() !== '';

/** Kontrollerar ett uppdrag i data/uppdrag.json. Ger en lista med problem (tom när uppdraget är helt). */
export function missionProblems(m) {
  const out = [];
  const name = m?.id ?? '?';
  if (!m || typeof m !== 'object') return ['Uppdraget är inte ett objekt.'];
  if (typeof m.id !== 'string' || !MISSION_ID.test(m.id)) out.push(`${name}: id saknas eller har fel tecken.`);
  if (m.kind !== 'hunt') out.push(`${name}: okänd sort ${m.kind}.`);
  if (!Number.isInteger(m.year)) out.push(`${name}: året ska vara ett heltal.`);
  if (!Number.isInteger(m.window) || m.window < 0 || m.window > 100) out.push(`${name}: window ska vara 0–100 år.`);
  if (!Number.isInteger(m.count) || m.count < 2 || m.count > 5) out.push(`${name}: count ska vara 2–5 världsdelar.`);
  if (m.lesson != null && (typeof m.lesson !== 'string' || !MISSION_ID.test(m.lesson))) out.push(`${name}: lesson ska vara en turs id.`);
  for (const k of ['title', 'task', 'reflection']) if (!isText(m[k])) out.push(`${name}: ${k} saknas (${k}.sv).`);
  return out;
}
