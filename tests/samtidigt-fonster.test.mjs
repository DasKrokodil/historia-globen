// Samtidigt-fönstret räknat i reglagets läge (minsta delen av #1319, inför v6.3.0). Förhistoriens glesa segment (#1088) gav
// ±11 640 år i hela segmentet, så att nästan alla händelser räknades som samtidiga vid 5000 f.Kr. Nu är fönstret det kortaste
// avståndet till läget ±1,2 %, lika långt åt båda hållen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { windowAround, yearsAcross } from '../js/timeline.js';

const W = y => windowAround(y, 0.012);

test('inom ett segment är fönstret detsamma som förut', () => {
  for (const y of [-2849, 1325, 1916, 2000]) assert.ok(Math.abs(W(y) - yearsAcross(y, 0.012)) < 1e-9, `år ${y}`);
});

test('förhistorien: fönstret krymper mot segmentgränsen 3000 f.Kr.', () => {
  assert.equal(Math.round(W(-9999)), 7055);  // 10 000 f.Kr.
  assert.equal(Math.round(W(-4999)), 2115);  // 5000 f.Kr.
  assert.equal(Math.round(W(-2999)), 138);   // 3000 f.Kr., samma som året efter
  assert.equal(Math.round(W(-2998)), 138);   // 2999 f.Kr.
  assert.ok(W(-4999) < yearsAcross(-4999, 0.012) / 5);
});

test('vid reglagets ändar används den kant som finns', () => {
  assert.equal(Math.round(W(-99999)), 11640); // 100 000 f.Kr.: bara kanten framåt
  assert.ok(W(2026) > 0);
});

test('fönstret är aldrig längre än det gamla', () => {
  for (let y = -99999; y <= 2026; y += 997) assert.ok(W(y) <= yearsAcross(y, 0.012) + 1e-9, `år ${y}`);
});
