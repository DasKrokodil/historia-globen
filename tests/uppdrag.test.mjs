// Elevuppdraget Samtidighetsjakten (#741): reglerna i js/uppdrag-rules.js och data/uppdrag.json.
// Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkHunt, eventRegion, huntDone, missionProblems, span, fitsLesson, missionsForLesson, defaultMission, huntCandidates } from '../js/uppdrag-rules.js';

const json = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const visible = r => r === 'source-checked' || r === 'two-sources';
const mission = { id: 'm', kind: 'hunt', year: 1500, window: 25, count: 3, title: { sv: 'T' }, task: { sv: 'U' }, reflection: { sv: 'F' } };
// Platser: Paris (Europa), Kairo (Afrika), Peking (Asien), Tenochtitlan (Amerika)
const at = (id, start, [lon, lat], over = {}) => ({ id, start, end: start, review: 'source-checked', location: { type: 'Point', coordinates: [lon, lat] }, ...over });
const paris = [2.35, 48.86], kairo = [31.24, 30.04], peking = [116.4, 39.9], mexiko = [-99.13, 19.43];

test('spannet och världsdelen', () => {
  assert.deepEqual(span(mission), [1475, 1525]);
  assert.equal(eventRegion(at('a', 1500, paris)), 'Europa');
  assert.equal(eventRegion(at('b', 1500, kairo)), 'Afrika');
  assert.equal(eventRegion({ id: 'c', location: { type: 'Polygon', coordinates: [] } }), null);
});

test('en händelse räknas bara inom åren och på en ny världsdel', () => {
  const found = [at('a', 1500, paris)];
  assert.deepEqual(checkHunt(at('b', 1510, kairo), mission, found, visible), { ok: true, region: 'Afrika', when: 'near' });
  assert.equal(checkHunt(at('c', 1520, [10, 50]), mission, found, visible).reason, 'region');
  assert.equal(checkHunt(at('d', 1400, peking), mission, found, visible).reason, 'time');
  assert.equal(checkHunt(at('e', 1530, peking), mission, found, visible).reason, 'time');
  assert.ok(checkHunt(at('f', 1450, peking, { end: 1480 }), mission, found, visible).ok, 'ett spann som överlappar räknas');
  assert.equal(checkHunt(at('a', 1500, paris), mission, found, visible).reason, 'already');
  assert.equal(checkHunt(at('g', 1500, mexiko, { review: 'draft' }), mission, found, visible).reason, 'hidden');
  assert.equal(checkHunt({ id: 'h', start: 1500, end: 1500, review: 'source-checked', location: { type: 'Polygon' } }, mission, found, visible).reason, 'place');
});

test('jakten är klar vid rätt antal världsdelar', () => {
  assert.ok(!huntDone(mission, [1, 2]));
  assert.ok(huntDone(mission, [1, 2, 3]));
});

test('uppdragen i data/uppdrag.json är hela och går att klara med datan', () => {
  const doc = json('data/uppdrag.json');
  assert.equal(doc.schema, 'historia-globen/uppdrag@1');
  assert.ok(doc.missions.length > 0);
  const events = json('data/events.json').events;
  for (const m of doc.missions) {
    assert.deepEqual(missionProblems(m), [], m.id);
    for (const k of ['title', 'task', 'reflection']) for (const l of ['sv', 'en', 'de', 'es', 'fr']) assert.ok(m[k][l], `${m.id}: ${k}.${l} saknas`);
    // Minst count världsdelar har en händelse inom åren som syns på globen utan Fokus, annars går uppdraget inte att klara
    const regions = Object.keys(huntCandidates(events, m, visible));
    assert.ok(regions.length >= m.count, `${m.id}: bara ${regions.length} världsdelar har händelser inom åren`);
  }
  assert.ok(missionProblems({ id: 'X!', kind: 'quiz', year: 1.5, window: 500, count: 9 }).length >= 5);
});

test('ett uppdrag knyts till lektionen i data (#1340)', () => {
  const a = { ...mission, id: 'a' }, b = { ...mission, id: 'b', year: 1000, lesson: 'vikingar' }, c = { ...mission, id: 'c', year: 1942, lesson: 'krig' };
  const all = [b, a, c];
  assert.deepEqual(missionsForLesson(all, 'vikingar', [793, 1068]).map(m => m.id), ['b'], 'lektionens eget uppdrag');
  assert.deepEqual(missionsForLesson(all, 'annan', [1400, 1600]).map(m => m.id), ['a'], 'reserven: år inom lektionen');
  assert.deepEqual(missionsForLesson(all, 'annan', [1600, 1700]), [], 'inget uppdrag i intervallet');
  assert.deepEqual(missionsForLesson(all, 'annan', null), [], 'lektion utan årslås har ingen reserv');
  assert.ok(fitsLesson(b, 'vikingar', [793, 1068]) && !fitsLesson(c, 'vikingar', [793, 1068]), 'en annan lektions uppdrag startar inte');
  assert.ok(!fitsLesson(a, 'vikingar', [793, 1068]) && fitsLesson(a, 'x', null));
  assert.equal(defaultMission(all).id, 'a', 'Mer startar uppdraget utan lektion');
  assert.ok(missionProblems({ ...mission, lesson: 'Fel id!' }).some(p => /lesson/.test(p)));
});

test('lektionens uppdrag i data passar lektionen (#1340)', () => {
  const missions = json('data/uppdrag.json').missions;
  const tours = json('data/turer/index.json').tours.map(x => x.id ?? x);
  const lessons = new Set();
  for (const m of missions.filter(x => x.lesson)) {
    assert.ok(tours.includes(m.lesson), `${m.id}: turen ${m.lesson} finns inte`);
    const tour = json(`data/turer/${m.lesson}.json`);
    const years = tour.lesson?.lock?.years;
    assert.ok(years, `${m.id}: ${m.lesson} är ingen lektion med låsta år`);
    // Hela uppdragets spann ligger i lektionens år, så att jakten aldrig skickar eleven utanför lektionen
    const [from, to] = span(m);
    assert.ok(from >= years[0] && to <= years[1], `${m.id}: ${from}–${to} ligger utanför lektionens ${years.join('–')}`);
    assert.ok(!lessons.has(m.lesson), `${m.lesson} har mer än ett uppdrag`);
    lessons.add(m.lesson);
  }
  // Varje lektion med årslås har ett uppdrag
  for (const id of tours) {
    const tour = json(`data/turer/${id}.json`);
    if (tour.lesson?.lock?.years) assert.ok(missionsForLesson(missions, id, tour.lesson.lock.years).length > 0, `lektionen ${id} har inget uppdrag`);
  }
  assert.ok(!defaultMission(missions).lesson, 'Mer ska starta ett uppdrag utan lektion');
});
