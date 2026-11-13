// Stegningen mellan resans stopp (#1380): rena funktioner i js/route-steps.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { stopIndexAt, stepTarget, stepState, followersAtSameTime, keysThrough, YEAR_EPSILON } from '../js/route-steps.js';

// Zheng Hes första resa: i årstakt, och två av stoppen har samma år (Palembang och Nanjing 1407)
const years = [1405, 1407, 1407];
const stops = years.map((at, i) => ({ at, key: `k${i}` }));
// Columbus första resa: dagstakt, sex stopp med egna år
const days = [1492.5918, 1492.7826, 1492.9863, 1493.0356, 1493.1704, 1493.2055].map((at, i) => ({ at, key: `c${i}` }));

test('stopIndexAt: tiden på ett stopp ger stoppet, annars -1', () => {
  assert.equal(stopIndexAt(days, 1492.7826), 1);
  assert.equal(stopIndexAt(days, 1492.7826 + YEAR_EPSILON / 2), 1); // adressens fyra decimaler
  assert.equal(stopIndexAt(days, 1492.7), -1);
  assert.equal(stopIndexAt(days, 1400), -1);
  assert.equal(stopIndexAt([], 1492), -1);
});

test('stopIndexAt: stopp med samma år ger det första (adressen har bara året)', () => {
  assert.equal(stopIndexAt(stops, 1407), 1);
});

test('stepTarget: ett steg framåt eller bakåt, inget före det första eller efter det sista', () => {
  assert.equal(stepTarget(days, 2, 1), 3);
  assert.equal(stepTarget(days, 2, -1), 1);
  assert.equal(stepTarget(days, 0, -1), null);
  assert.equal(stepTarget(days, 5, 1), null);
  assert.equal(stepTarget(days, 0, 1), 1);
  assert.equal(stepTarget(days, 5, -1), 4);
});

test('stepTarget: utan utgångsläge eller stopp finns inget steg', () => {
  assert.equal(stepTarget(days, -1, 1), null);
  assert.equal(stepTarget(days, 6, -1), null);
  assert.equal(stepTarget(days, null, 1), null);
  assert.equal(stepTarget([], 0, 1), null);
});

test('stepState: första stoppet döljer Föregående, sista döljer Nästa', () => {
  assert.deepEqual(stepState(days, 0), { n: 1, total: 6, hasPrev: false, hasNext: true });
  assert.deepEqual(stepState(days, 3), { n: 4, total: 6, hasPrev: true, hasNext: true });
  assert.deepEqual(stepState(days, 5), { n: 6, total: 6, hasPrev: true, hasNext: false });
});

test('stepState: en resa utan stopp eller med ett enda stopp visar inga knappar och inget fel', () => {
  assert.deepEqual(stepState([], 0), { n: 0, total: 0, hasPrev: false, hasNext: false });
  assert.deepEqual(stepState([], -1), { n: 0, total: 0, hasPrev: false, hasNext: false });
  assert.deepEqual(stepState([days[0]], 0), { n: 0, total: 1, hasPrev: false, hasNext: false });
  assert.deepEqual(stepState(days, -1), { n: 0, total: 6, hasPrev: false, hasNext: false });
});

test('followersAtSameTime: de följande stoppen med samma år köas, inga andra', () => {
  assert.deepEqual(followersAtSameTime(stops, 1).map(s => s.key), ['k2']);
  assert.deepEqual(followersAtSameTime(stops, 0).map(s => s.key), []);
  assert.deepEqual(followersAtSameTime(stops, 2).map(s => s.key), []);
  assert.deepEqual(followersAtSameTime(days, 2).map(s => s.key), []);
});

test('keysThrough: stoppen till och med det man står på räknas som visade', () => {
  assert.deepEqual(keysThrough(stops, 0), ['k0']);
  assert.deepEqual(keysThrough(stops, 2), ['k0', 'k1', 'k2']);
});

test('stegen går igenom hela resan åt båda håll och stannar vid ändarna', () => {
  let i = 0;
  const seen = [i];
  while (stepTarget(days, i, 1) !== null) { i = stepTarget(days, i, 1); seen.push(i); }
  assert.deepEqual(seen, [0, 1, 2, 3, 4, 5]);
  while (stepTarget(days, i, -1) !== null) { i = stepTarget(days, i, -1); seen.push(i); }
  assert.deepEqual(seen.slice(6), [4, 3, 2, 1, 0]);
});
