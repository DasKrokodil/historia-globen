// Tillståndets åtgärder, prenumeration och JSON (#403). Körs med node --test 'tests/*.test.mjs'.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createStore, toJSON, fromJSON, STATE_VERSION } from '../js/state.js';

test('åtgärderna ändrar tillståndet och meddelar prenumeranterna', () => {
  const store = createStore();
  const seen = [];
  const stop = store.subscribe(({ type }) => seen.push(type));
  const war = { id: 'andra-varldskriget' };
  store.setFocus({ type: 'war', id: war.id, from: 1939, to: 1945 }, { war });
  assert.equal(store.state.focusWar, war);
  assert.equal(store.state.focusRoute, null);
  store.setSelected('slaget-vid-stalingrad');
  store.setLayers({ events: true, areas: false });
  store.setFilters(new Set(['krig']));
  store.setCalm(1);
  assert.equal(store.state.calm, true);
  store.setFocus(null, { war });
  assert.equal(store.state.focusWar, null, 'utan fokus finns inget krig att följa');
  stop();
  store.setSelected(null);
  assert.deepEqual(seen, ['focus', 'selected', 'layers', 'filters', 'calm', 'focus']);
});

test('mirror speglar omritningens värden och meddelar bara när året ändras', () => {
  const store = createStore();
  const seen = [];
  store.subscribe(({ type }) => seen.push(type));
  store.mirror({ year: 1325, wholeYear: 1325, window: 38 });
  store.mirror({ year: 1325, window: 40 });
  store.mirror({ year: 1326 });
  assert.equal(store.state.window, 40);
  assert.deepEqual(seen, ['year', 'year']);
});

test('toJSON och fromJSON går fram och tillbaka', () => {
  const store = createStore();
  store.mirror({ year: 1944.4321987 });
  store.setFocus({ type: 'war', id: 'andra-varldskriget' }, { war: {} });
  store.setLayers({ events: true, areas: true, religions: false });
  store.setFilters(new Set(['krig', 'kultur']));
  const json = toJSON(store.state, { lat: 52.123456, lon: 13.4049, zoom: 2.2 });
  assert.deepEqual(json, {
    v: STATE_VERSION, year: 1944.4322, camera: { lat: 52.12, lon: 13.4, zoom: 2.2 },
    focus: 'war:andra-varldskriget', layers: ['areas', 'events'], filters: ['krig', 'kultur'], calm: false,
  });
  assert.deepEqual(fromJSON(JSON.stringify(json)), json);
});

test('fromJSON rättar kameran och hoppar över okända fält', () => {
  const doc = fromJSON({ v: STATE_VERSION, year: -2599, camera: { lat: 120, lon: 200, zoom: 9 }, extra: 'x' });
  assert.deepEqual(doc.camera, { lat: 90, lon: -160, zoom: 3.2 });
  assert.equal(fromJSON({ v: STATE_VERSION, year: 0, camera: { lat: 0, lon: -200, zoom: 1 } }).camera.lon, 160);
  assert.equal('extra' in doc, false);
  assert.deepEqual(doc.layers, []);
});

test('fromJSON avvisar felaktigt tillstånd med en förklaring', () => {
  assert.throws(() => fromJSON('[]'), /inte ett objekt/);
  assert.throws(() => fromJSON({ v: 99, year: 1 }), /Okänd version/);
  assert.throws(() => fromJSON({ v: STATE_VERSION, year: '1325' }), /Året/);
  assert.throws(() => fromJSON({ v: STATE_VERSION, year: 1, focus: 'kung:x' }), /Okänt fokus/);
  assert.throws(() => fromJSON({ v: STATE_VERSION, year: 1, layers: ['<script>'] }), /Lagren/);
  assert.throws(() => fromJSON({ v: STATE_VERSION, year: 1, camera: { lat: 'a', lon: 0, zoom: 1 } }), /Kameran/);
});
