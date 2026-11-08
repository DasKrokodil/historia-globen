// Elevuppdraget Samtidighetsjakten (#741): reglerna i js/uppdrag-rules.js och data/uppdrag.json.
// Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkHunt, eventRegion, huntDone, missionProblems, span } from '../js/uppdrag-rules.js';

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
  assert.deepEqual(checkHunt(at('b', 1510, kairo), mission, found, visible), { ok: true, region: 'Afrika' });
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
    // Minst count världsdelar har en synlig händelse inom åren, annars går uppdraget inte att klara
    const regions = new Set();
    for (const e of events) if (checkHunt(e, m, [], visible).ok) regions.add(eventRegion(e));
    assert.ok(regions.size >= m.count, `${m.id}: bara ${regions.size} världsdelar har händelser inom åren`);
  }
  assert.ok(missionProblems({ id: 'X!', kind: 'quiz', year: 1.5, window: 500, count: 9 }).length >= 5);
});
