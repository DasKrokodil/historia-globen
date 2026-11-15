// Reglagets upplösning (#1320, beslut 2026-11-13): tusental före 10 000 f.Kr., hundratal till 3000 f.Kr., annars hela år.
// En källa (stepAt) för avrundning, steg, fart och uppläst värde.
import test from 'node:test';
import assert from 'node:assert/strict';
import { RESOLUTION, stepAt, roundToStep, roundPrehistoric, formatYear } from '../js/model.js';
import { decodeHash } from '../js/url-state.js';
import { posToYear, yearToPos } from '../js/timeline.js';

test('upplösningen per del av reglaget', () => {
  assert.equal(stepAt(-99999), 1000); // 100 000 f.Kr.
  assert.equal(stepAt(-10000), 1000); // 10 001 f.Kr.
  assert.equal(stepAt(-9999), 100);   // 10 000 f.Kr.
  assert.equal(stepAt(-3000), 100);   // 3001 f.Kr.
  assert.equal(stepAt(-2999), 1);     // 3000 f.Kr.
  assert.equal(stepAt(2026), 1);
  assert.equal(RESOLUTION.at(-1).step, 1);
});

test('året avrundas i f.Kr.-tal till upplösningen', () => {
  assert.equal(roundToStep(-99000), -98999);  // 99 001 f.Kr. blir 99 000 f.Kr.
  assert.equal(roundToStep(-7412), -7399);    // 7413 f.Kr. blir 7400 f.Kr.
  assert.equal(roundToStep(-2999), -2999);    // från 3000 f.Kr. orört
  assert.equal(roundToStep(1325), 1325);
  assert.equal(roundPrehistoric, roundToStep); // samma funktion som i v6.3.0
});

test('formatYear: djup tid i tusental, källornas årtal efter 10 000 f.Kr. orörda', () => {
  assert.equal(formatYear(-66000000).replace(/\s/g, ' '), '66 000 000 f.Kr.'); // inte 66 000 001
  assert.equal(formatYear(-99999).replace(/\s/g, ' '), '100 000 f.Kr.');
  assert.equal(formatYear(-3149), '3150 f.Kr.'); // ett källårtal ändras inte i listorna
  assert.equal(formatYear(1325), '1325');
});

test('ett drag i förhistorien landar på upplösningen', () => {
  for (let p = 0; p < 0.1; p += 0.0037) {
    const y = roundToStep(posToYear(p));
    assert.equal((1 - y) % stepAt(y), 0, `läge ${p}: ${y}`);
  }
});

test('gamla länkar med exakta år öppnas som de är', () => {
  assert.equal(decodeHash('#y=-7412').year, -7412);
  assert.equal(decodeHash('#y=-98999').year, -98999);
  assert.ok(yearToPos(-7412) > 0);
});
