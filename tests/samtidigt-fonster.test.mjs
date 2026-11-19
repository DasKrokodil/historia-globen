// Samtidigt-fönstret räknat i reglagets läge (#1319, beslut 2026-11-13). Fönstret är 1,2 % av reglaget åt varje håll, och
// varje kant översätts till år för sig. Från #1958 har människans tid två reglage ("Före 3000 f.Kr." och "3000 f.Kr.–i dag"),
// och fönstret räknas på reglaget som året hör till; före 10 000 f.Kr. är det aldrig kortare än 10 000 år åt varje håll (minsta
// fönstret, docs/beslut/2026-11-19-tva-reglage-1958.md). Vid en segmentgräns inom ett reglage är fönstret olika långt före och efter.
import test from 'node:test';
import assert from 'node:assert/strict';
import { windowEdges, yearToPos, yearsAcross, scaleForYear, HUMAN_SCALES } from '../js/timeline.js';
import { roundWindowSpan } from '../js/model.js';

const F = 0.012;
const E = y => { const { before, after } = windowEdges(y, F); return [Math.round(before), Math.round(after)]; };
// Samma reglage utan minsta fönster: bara det som 1,2 % av reglaget ger
const bare = y => ({ ...scaleForYear(y), windowMin: undefined });
const [PRE, HISTORY] = HUMAN_SCALES;

test('inom ett segment är fönstret lika långt åt båda hållen och detsamma som förut', () => {
  for (const y of [-2000, -1500, 0, 1325, 1900, 2000]) {
    const { before, after } = windowEdges(y, F);
    assert.ok(Math.abs(before - yearsAcross(y, F)) < 1e-9, `före ${y}`);
    assert.ok(Math.abs(after - yearsAcross(y, F)) < 1e-9, `efter ${y}`);
  }
});

test('vid varje segmentgräns inom ett reglage är kanterna läget ± 1,2 % av reglaget, översatta var för sig', () => {
  for (const post of HUMAN_SCALES) {
    for (const { before: seg } of post.seams) {
      for (const y of [seg.to - 1, seg.to, seg.to + 1]) {
        const scale = bare(y), p = yearToPos(y, scale), { before, after } = windowEdges(y, F, scale);
        // Kantens år ska ligga på läget p ∓ 1,2 %: räkna tillbaka med skalan
        assert.ok(Math.abs(yearToPos(y - before, scale) - (p - F)) < 1e-6, `före ${y}: läget ${yearToPos(y - before, scale)} i stället för ${p - F}`);
        assert.ok(Math.abs(yearToPos(y + after, scale) - (p + F)) < 1e-6, `efter ${y}: läget ${yearToPos(y + after, scale)} i stället för ${p + F}`);
      }
    }
  }
});

test('minsta fönstret: före 10 000 f.Kr. aldrig kortare än 10 000 år åt varje håll, därefter 1,2 % av reglaget (#1958)', () => {
  assert.deepEqual(PRE.windowMin, [{ to: -10000, years: 10000 }]);
  assert.equal(HISTORY.windowMin, undefined);
  for (const y of [-99999, -50000, -20000, -10001, -10000]) {
    assert.deepEqual(E(y), [10000, 10000], `år ${y}`);
    // golvet gäller för reglagets 1,2 % (2160 år här): det är golvet som ger 10 000, inte skalan
    assert.ok(yearsAcross(y, F, PRE) < 10000, `år ${y}`);
  }
  assert.deepEqual(E(-9999), [2148, 168]);  // 10 000 f.Kr.: golvet är borta, kanterna är läget ± 1,2 % (före står kvar i det glesa segmentet)
  assert.deepEqual(E(-8000), [168, 168]);   // 8001 f.Kr.
  assert.deepEqual(E(-5000), [168, 168]);   // 5001 f.Kr.
  // golvet gäller bara om skalan ger mindre: ett fönster som redan är längre ändras inte
  assert.ok(Math.abs(windowEdges(-50000, 0.2, PRE).before - yearsAcross(-50000, 0.2, PRE)) < 1e-6);
});

test('gränsen mellan reglagen: -3000 är sista året före 3000 f.Kr. och -2999 det första i det historiska reglaget (#1958)', () => {
  assert.equal(scaleForYear(-3000), PRE);
  assert.equal(scaleForYear(-2999), HISTORY);
  assert.deepEqual(E(-3100), [168, 168]);
  assert.deepEqual(E(-3000), [168, 168]); // reglagets högra kant: bara den vänstra kanten finns, den används åt båda hållen
  assert.deepEqual(E(-2999), [125, 125]); // reglagets vänstra kant
  assert.deepEqual(E(-2998), [125, 125]);
  assert.deepEqual(E(-2000), [125, 125]); // 2001 f.Kr.: båda kanterna i samma segment
});

test('de övriga segmentgränserna: det glesa segmentet ger det längre fönstret', () => {
  assert.deepEqual(E(-501), [125, 75]);   // 502 f.Kr.
  assert.deepEqual(E(-500), [125, 75]);   // 501 f.Kr.
  assert.deepEqual(E(-499), [124, 75]);   // 500 f.Kr.
  assert.deepEqual(E(999), [75, 40]);
  assert.deepEqual(E(1000), [75, 40]);
  assert.deepEqual(E(1001), [74, 40]);
  assert.deepEqual(E(1799), [40, 11]);
  assert.deepEqual(E(1800), [40, 10]);
  assert.deepEqual(E(1801), [37, 10]);
});

test('vid reglagets ändar används den kant som finns åt båda hållen', () => {
  assert.deepEqual(E(-99999), [10000, 10000]); // 100 000 f.Kr.: den enda kanten är 2160 år, golvet gör den till 10 000
  const start = windowEdges(-99999, F, bare(-99999));
  assert.ok(start.before > 0 && Math.abs(start.before - start.after) < 1e-9);
  const end = windowEdges(2026, F);
  assert.ok(end.before > 0 && Math.abs(end.before - end.after) < 1e-9);
});

test('fönstret är aldrig längre åt något håll än golvet eller reglagets egna spann, och aldrig tomt', () => {
  for (let y = -99999; y <= 2026; y += 997) {
    const { before, after } = windowEdges(y, F);
    assert.ok(before > 0 && after > 0, `år ${y}`);
    assert.ok(before <= 10000 + 1e-6 && after <= 10000 + 1e-6, `år ${y}`);
  }
});

test('roundWindowSpan: lika efter avrundning visas med ±, annars i klartext', () => {
  assert.deepEqual(roundWindowSpan({ before: 138, after: 138 }), { before: 140, after: 140, same: true });
  assert.deepEqual(roundWindowSpan({ before: 44, after: 41 }), { before: 40, after: 40, same: true });
  assert.deepEqual(roundWindowSpan({ before: 11640, after: 2115 }), { before: 12000, after: 2000, same: false });
  assert.deepEqual(roundWindowSpan({ before: 83, after: 45 }), { before: 80, after: 50, same: false });
});
