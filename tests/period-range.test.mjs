// Epokknapparna (#845 del 3, #965): periodToRange för de tio perioderna i data/perioder.json.
// Körs med node --test 'tests/*.test.mjs'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { periodToRange } from '../js/period-range.js';

const doc = JSON.parse(readFileSync(new URL('../data/perioder.json', import.meta.url)));
const all = doc.divisions.flatMap(d => d.periods);
const MIN = -2999, MAX = 2026; // som MIN_YEAR och MAX_YEAR i js/timeline.js (i dag 2026)
const r = id => periodToRange(all.find(p => p.id === id), MIN, MAX);

test('det finns tio perioder', () => assert.equal(all.length, 10));

test('vanliga perioder behåller sina årtal och är varken klippta eller öppna', () => {
  assert.deepEqual(r('norden-800-1500'), { from: 800, to: 1500, clippedStart: false, openEnd: false });
  assert.deepEqual(r('norden-1500-1800'), { from: 1500, to: 1800, clippedStart: false, openEnd: false });
  assert.deepEqual(r('norden-1800-1900'), { from: 1800, to: 1900, clippedStart: false, openEnd: false });
  assert.deepEqual(r('imperialism-varldskrig-1850-1950'), { from: 1850, to: 1950, clippedStart: false, openEnd: false });
  assert.deepEqual(r('nordisk-bronsalder'), { from: -1699, to: -499, clippedStart: false, openEnd: false });
  assert.deepEqual(r('nordisk-jarnalder'), { from: -499, to: 550, clippedStart: false, openEnd: false });
  assert.deepEqual(r('antiken'), { from: -799, to: 500, clippedStart: false, openEnd: false });
  assert.deepEqual(r('industrialiseringen'), { from: 1760, to: 1840, clippedStart: false, openEnd: false });
});

test('stenåldern börjar före tidslinjen: klipps vid första året och märks', () => {
  assert.deepEqual(r('nordisk-stenalder'), { from: MIN, to: -1699, clippedStart: true, openEnd: false });
});

test('"1900 till nutid" går till i dag och märks öppen', () => {
  assert.deepEqual(r('demokratisering-globalisering-1900-'), { from: 1900, to: MAX, clippedStart: false, openEnd: true });
});

test('varje period ger ett intervall som går att välja: från före till, inom tidslinjen', () => {
  for (const p of all) {
    const x = periodToRange(p, MIN, MAX);
    assert.ok(x.from < x.to, p.id);
    assert.ok(x.from >= MIN && x.to <= MAX, p.id);
  }
});
