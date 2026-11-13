// Definitionen av "samtidigt" (#1311): regeln i js/samtidighet.js och fun facts i data/funfacts.json.
// Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { RELATIONS, gapBetween, spread, together, nearLimit, relation, relationToYear, roundGap, funfactTiming } from '../js/samtidighet.js';

const json = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const ev = (id, start, end = start, over = {}) => ({ id, start, end, precision: 9, edtf: String(start), ...over });
const table = [{ until: 0, years: 100 }, { years: 50 }];

test('samtidigt är minst ett gemensamt år, räknat på start och slut', () => {
  assert.equal(gapBetween(ev('a', 1900, 1910), ev('b', 1910, 1920)), 0, 'samma slutår och startår räknas');
  assert.equal(gapBetween(ev('a', 1903), ev('b', 1904)), 1, 'nästa år är inte samtidigt');
  assert.equal(spread([ev('a', 1324), ev('b', 1325), ev('c', 1325, 1521)]), 1, 'alla händelserna räknas');
  assert.ok(together([ev('a', 1096, 2026), ev('b', 1325, 1521)]));
  assert.ok(!together([]));
});

test('nära i tid följer tabellen i datan, efter året där avståndet börjar', () => {
  assert.equal(nearLimit(table, -1752), 100);
  assert.equal(nearLimit(table, 0), 100, '1 f.Kr. är år 0 och räknas före vår tideräkning');
  assert.equal(nearLimit(table, 1), 50);
  assert.equal(relation([ev('a', 1636), ev('b', 1664, 1666)], table), 'near');
  assert.equal(relation([ev('a', 1433), ev('b', 1488)], table), 'apart', '55 år efter vår tideräkning är tidsavstånd');
  assert.equal(relation([ev('a', -1752), ev('b', -1699)], table), 'near', '53 år före vår tideräkning är nära i tid');
  assert.equal(relation([ev('a', -887), ev('b', -775)], table), 'apart');
  assert.equal(relation([ev('a', 1889), ev('b', 1889)], table), 'together');
});

test('ett år och ett fönster, som i jakten', () => {
  assert.equal(relationToYear(ev('a', 1400, 1550), 1500, 25), 'together');
  assert.equal(relationToYear(ev('a', 1520), 1500, 25), 'near');
  assert.equal(relationToYear(ev('a', 1525), 1500, 25), 'near');
  assert.equal(relationToYear(ev('a', 1526), 1500, 25), null);
});

test('avståndet för visning avrundas bara när ett årtal är ungefärligt, och aldrig till noll', () => {
  assert.equal(roundGap(33, false), 33);
  assert.equal(roundGap(73, true), 70);
  assert.equal(roundGap(3, true), 3);
  const byId = { a: ev('a', -550, -478, { edtf: '-0550~/-0478~' }), b: ev('b', -469, -398) };
  assert.deepEqual(funfactTiming({ events: ['a', 'b'], relation: 'near' }, byId), { relation: 'near', years: 9, approx: true });
});

test('riktig data: varje fun fact har en relation som stämmer med händelsernas årtal', () => {
  const doc = json('data/funfacts.json');
  const byId = Object.fromEntries(json('data/events.json').events.map(e => [e.id, e]));
  assert.ok(Array.isArray(doc.near) && doc.near.length, 'tabellen near saknas i data/funfacts.json');
  for (const f of doc.funfacts) {
    assert.ok(RELATIONS.includes(f.relation), `${f.id}: relation saknas eller är okänd (${f.relation})`);
    const events = f.events.map(id => byId[id]);
    assert.ok(events.every(Boolean), `${f.id}: en händelse saknas`);
    const want = relation(events, doc.near);
    assert.equal(f.relation, want, `${f.id}: relation ska vara ${want} (avståndet är ${spread(events)} år)`);
  }
});

test('riktig data: en fun fact som inte är samtidig säger inte "samtidigt" eller "samma år" om alla sina händelser', () => {
  // Ordet får bara stå om ett par i fun facten pågår samma år (till exempel Mohenjo-daro och Caral).
  const doc = json('data/funfacts.json');
  const byId = Object.fromEntries(json('data/events.json').events.map(e => [e.id, e]));
  for (const f of doc.funfacts.filter(f => f.relation !== 'together')) {
    if (!/samtidig|samma år/i.test(f.text.sv)) continue;
    const es = f.events.map(id => byId[id]);
    const somePair = es.some((a, i) => es.some((b, j) => i < j && gapBetween(a, b) === 0));
    assert.ok(somePair, `${f.id}: texten säger "samtidigt" men inga av händelserna pågår samma år`);
  }
});
