// Turformatet (#47): kontrollen i js/tour-format.js och turerna i data/turer/. Körs med node --test 'tests/*.test.mjs'.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { tourProblems, TOUR_VERSION } from '../js/tour-format.js';

const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const step = (over = {}) => ({ id: 'a', at: 1200, camera: { lat: 0, lon: 0, zoom: 1.4 }, text: { sv: 'Text.' }, layers: ['events'], sources: ['s1'], ...over });
const tour = (over = {}) => ({ version: TOUR_VERSION, id: 'exempel', title: { sv: 'Exempel' }, review: 'source-checked', steps: [step()], ...over });
const known = { events: new Set(['e1']), layers: new Set(['events', 'areas']), sources: new Set(['s1']) };

test('en hel tur har inga problem', () => {
  assert.deepEqual(tourProblems(tour({ steps: [step(), step({ id: 'b', at: 1200.5, open: 'e1' })] }), known), []);
});

test('fel i steg och tur hittas', () => {
  const problems = tourProblems(tour({
    version: 2,
    steps: [step({ camera: { lat: 95, lon: 0, zoom: 1 } }), step({ open: 'okand', layers: ['finns-inte'], sources: [] })],
  }), known);
  const all = problems.join('\n');
  for (const part of ['okänd version', 'kameran ligger utanför', 'id finns redan', 'händelsen okand', 'lagret finns-inte', 'källor saknas']) {
    assert.match(all, new RegExp(part), `saknar ${part}`);
  }
});

test('en tur utan steg eller med fel typ', () => {
  assert.equal(tourProblems(null).length, 1);
  assert.match(tourProblems(tour({ steps: [] })).join(), /inga steg/);
});

test('turerna i data/turer/ följer formatet och pekar på befintliga händelser och källor', () => {
  const index = read('data/turer/index.json');
  const events = new Set(read('data/events.json').events.map(e => e.id));
  const sources = new Set(read('data/sources.json').sources.map(s => s.id));
  // Lagrens id: posterna i js/layers/index.js heter som lagren (events, areas, …)
  const list = readFileSync(new URL('../js/layers/index.js', import.meta.url), 'utf8').match(/export const LAYERS = \[([^\]]*)\]/)[1];
  const layers = new Set(list.split(',').map(x => x.trim()).filter(Boolean));
  assert.ok(index.tours.length > 0);
  for (const id of index.tours) {
    const t = read(`data/turer/${id}.json`);
    assert.equal(t.id, id, 'filnamnet och id ska vara samma');
    assert.deepEqual(tourProblems(t, { events, sources, layers }), []);
  }
});
