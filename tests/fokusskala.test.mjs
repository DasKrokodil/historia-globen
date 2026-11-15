// Fokusskalans årtal (#1321): steglistan fortsätter över 1000 år, så att antalet årtal ryms på skalan.
import test from 'node:test';
import assert from 'node:assert/strict';
import { focusTickStep } from '../js/timeline.js';

// Steglistan före #1321, som referens för att kortare spann inte ändras.
const OLD = (span, fit) => [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find(s => span / s <= fit) ?? 2000;
const ticks = (from, to, step) => { let n = 0; for (let v = Math.ceil(from / step) * step; v <= to; v += step) if (v !== 0) n++; return n; };

test('ett spann på 60 000 år ger högst så många årtal som får plats', () => {
  for (const fit of [4, 11]) {
    const step = focusTickStep(60000, fit);
    assert.ok(60000 / step <= fit, `steg ${step} ger för många årtal`);
    assert.ok(ticks(-60000, 0, step) <= fit + 1);
  }
  assert.equal(focusTickStep(60000, 11), 10000);
  assert.equal(focusTickStep(60000, 4), 20000);
});

test('stegen fortsätter över 1000 år: 5000, 10 000, 20 000', () => {
  assert.equal(focusTickStep(12000, 3), 5000);
  assert.equal(focusTickStep(25000, 3), 10000);
  assert.equal(focusTickStep(50000, 3), 20000);
  assert.equal(focusTickStep(5_000_000, 11), 500000);
});

test('felet före rättningen: 60 000 år gav 30 årtal', () => {
  assert.equal(60000 / OLD(60000, 11), 30);
  assert.ok(60000 / focusTickStep(60000, 11) <= 11);
});

test('kortare spann ger samma steg som förut', () => {
  for (const fit of [3, 4, 11])
    for (const span of [3, 10, 40, 100, 250, 900, 1500, 3000, 4000, 9000, 11000])
      if (span / 1000 <= fit) assert.equal(focusTickStep(span, fit), OLD(span, fit), `spann ${span}, plats ${fit}`);
});
