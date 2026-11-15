// Samtidigt-fönstret räknat i reglagets läge (#1319, beslut 2026-11-13). Fönstret är 1,2 % av reglaget åt varje håll, och
// varje kant översätts till år för sig. Förhistoriens glesa segment (#1088) gav ±11 640 år i hela segmentet i den gamla
// räkningen; nu mäts kanterna i reglagets läge, och vid en segmentgräns blir fönstret olika långt före och efter året.
import test from 'node:test';
import assert from 'node:assert/strict';
import { windowEdges, yearToPos, yearsAcross, SEGMENTS } from '../js/timeline.js';
import { roundWindowSpan } from '../js/model.js';

const F = 0.012;
const E = y => { const { before, after } = windowEdges(y, F); return [Math.round(before), Math.round(after)]; };

test('inom ett segment är fönstret lika långt åt båda hållen och detsamma som förut', () => {
  for (const y of [-2000, -1500, 0, 1325, 1900, 2000]) {
    const { before, after } = windowEdges(y, F);
    assert.ok(Math.abs(before - yearsAcross(y, F)) < 1e-9, `före ${y}`);
    assert.ok(Math.abs(after - yearsAcross(y, F)) < 1e-9, `efter ${y}`);
  }
});

test('vid varje segmentgräns är kanterna läget ± 1,2 % av reglaget, översatta var för sig', () => {
  for (const s of SEGMENTS.slice(0, -1)) {
    for (const y of [s.to - 1, s.to, s.to + 1]) {
      const p = yearToPos(y), { before, after } = windowEdges(y, F);
      // Kantens år ska ligga på läget p ∓ 1,2 %: räkna tillbaka med skalan
      assert.ok(Math.abs(yearToPos(y - before) - (p - F)) < 1e-6, `före ${y}: läget ${yearToPos(y - before)} i stället för ${p - F}`);
      assert.ok(Math.abs(yearToPos(y + after) - (p + F)) < 1e-6, `efter ${y}: läget ${yearToPos(y + after)} i stället för ${p + F}`);
    }
  }
});

test('förhistorien: före året är fönstret långt (glest segment), efter året kortare när det når 3000 f.Kr.', () => {
  assert.deepEqual(E(-9999), [11640, 7055]);  // 10 000 f.Kr.
  assert.deepEqual(E(-4999), [11640, 2115]);  // 5000 f.Kr.
  assert.deepEqual(E(-3000), [11640, 139]);   // 3001 f.Kr.
  assert.deepEqual(E(-2999), [11640, 138]);   // 3000 f.Kr. (segmentgränsen)
  assert.deepEqual(E(-2998), [11557, 138]);   // 2999 f.Kr.
  assert.deepEqual(E(-2000), [138, 138]);     // 2001 f.Kr.: båda kanterna i samma segment
});

test('de övriga segmentgränserna: det glesa segmentet ger det längre fönstret', () => {
  assert.deepEqual(E(-501), [138, 83]);   // 502 f.Kr.
  assert.deepEqual(E(-500), [138, 83]);   // 501 f.Kr.
  assert.deepEqual(E(-499), [138, 83]);   // 500 f.Kr.
  assert.deepEqual(E(999), [83, 45]);
  assert.deepEqual(E(1000), [83, 44]);
  assert.deepEqual(E(1001), [82, 44]);
  assert.deepEqual(E(1799), [44, 12]);
  assert.deepEqual(E(1800), [44, 11]);
  assert.deepEqual(E(1801), [41, 11]);
});

test('vid reglagets ändar används den kant som finns åt båda hållen', () => {
  assert.deepEqual(E(-99999), [11640, 11640]); // 100 000 f.Kr.
  const end = windowEdges(2026, F);
  assert.ok(end.before > 0 && Math.abs(end.before - end.after) < 1e-9);
});

test('fönstret är aldrig längre åt något håll än hela reglagets spann', () => {
  for (let y = -99999; y <= 2026; y += 997) {
    const { before, after } = windowEdges(y, F);
    assert.ok(before > 0 && after > 0, `år ${y}`);
    assert.ok(before <= 11640 + 1e-6 && after <= 11640 + 1e-6, `år ${y}`);
  }
});

test('roundWindowSpan: lika efter avrundning visas med ±, annars i klartext', () => {
  assert.deepEqual(roundWindowSpan({ before: 138, after: 138 }), { before: 140, after: 140, same: true });
  assert.deepEqual(roundWindowSpan({ before: 44, after: 41 }), { before: 40, after: 40, same: true });
  assert.deepEqual(roundWindowSpan({ before: 11640, after: 2115 }), { before: 12000, after: 2000, same: false });
  assert.deepEqual(roundWindowSpan({ before: 83, after: 45 }), { before: 80, after: 50, same: false });
});
