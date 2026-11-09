// Urvalet för ett intervall (#569 del 1, #754). Körs med node --test 'tests/*.test.mjs'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { selectEventsForRange, selectEventsForYear, markersToHide, DEFAULT_RANGE_MARKER_LIMIT } from '../js/date-events.js';

const events = JSON.parse(readFileSync(new URL('../data/events.json', import.meta.url))).events;
const ev = (id, start, end, extra = {}) => ({ id, start, end, ...extra });

test('en händelse ingår om spannet överlappar intervallet, och delvis inom märks partial', () => {
  const list = [
    ev('helt-inom', 1915, 1916), ev('borjar-fore', 1900, 1914), ev('slutar-efter', 1918, 1930),
    ev('omsluter', 1800, 1950), ev('fore', 1800, 1913), ev('efter', 1919, 1920), ev('punkt', 1914, 1914),
  ];
  const result = selectEventsForRange(list, 1914, 1918);
  assert.deepEqual(result.map(e => e.id).sort(), ['borjar-fore', 'helt-inom', 'omsluter', 'punkt', 'slutar-efter']);
  const partial = Object.fromEntries(result.map(e => [e.id, e.partial]));
  assert.deepEqual(partial, { 'helt-inom': false, punkt: false, 'borjar-fore': true, 'slutar-efter': true, omsluter: true });
});

test('start före intervallet ger partial och utan att ändra originalet', () => {
  const original = ev('a', 1900, 1920);
  const [hit] = selectEventsForRange([original], 1910, 1915);
  assert.equal(hit.partial, true);
  assert.equal('partial' in original, false, 'indata ska inte ändras');
});

test('ett omvänt intervall behandlas som från–till, och ogiltiga gränser ger tomt', () => {
  const list = [ev('a', 1915, 1915)];
  assert.equal(selectEventsForRange(list, 1918, 1914).length, 1);
  assert.deepEqual(selectEventsForRange(list, NaN, 1918), []);
  assert.deepEqual(selectEventsForRange(list, 1914, undefined), []);
});

test('öppna spann som började mer än 100 år före intervallets slut är bakgrund', () => {
  const list = [
    ev('gammal', 1500, 2026, { edtf: '1500/..' }),
    ev('nyare', 1850, 2026, { edtf: '1850/..' }),
  ];
  assert.deepEqual(selectEventsForRange(list, 1914, 1918).map(e => e.id), ['nyare']);
  assert.equal(selectEventsForRange(list, 1914, 1918, { background: true }).length, 2);
});

test('prioriteringen är top, major, övriga, och i dataordning inom varje grupp', () => {
  const list = [ev('c', 1915, 1915), ev('b', 1915, 1915, { major: true }), ev('a', 1915, 1915, { top: true }), ev('d', 1915, 1915)];
  assert.deepEqual(selectEventsForRange(list, 1914, 1918).map(e => e.id), ['a', 'b', 'c', 'd']);
});

test('ett intervall med ett enda år ger samma händelser som årsurvalet', () => {
  for (const year of [-2599, -499, 0, 1000, 1914, 1945, 2000]) {
    assert.deepEqual(selectEventsForRange(events, year, year).map(e => e.id), selectEventsForYear(year, events).map(e => e.id), `år ${year}`);
  }
});

// Antalen räknas här ur datan med en egen, enkel överlappsregel (start <= till och slut >= från,
// utan öppna spann äldre än 100 år före slutet), så att testet följer datan när den växer.
// Förstudien (docs/granskningar/2026-11-07-tidsintervall-forstudie.md) räknade 1914–1918: 23,
// 500–400 f.Kr.: 26 och 1900–1999: 196 på 761 händelser; med dagens data är det fler utom 1914–1918.
const reference = (from, to) => events.filter(e => e.start <= to && e.end >= from
  && !(/\/\.\.$/.test(e.edtf ?? '') && e.start <= to - 100));

for (const [name, from, to, expected] of [
  ['1914–1918', 1914, 1918, 23],
  ['500–400 f.Kr. (−499 till −399)', -499, -399, undefined],
  ['1900–1999', 1900, 1999, undefined],
]) {
  test(`intervallet ${name} ger samma träffar som den enkla överlappsregeln`, () => {
    const result = selectEventsForRange(events, from, to);
    assert.deepEqual(new Set(result.map(e => e.id)), new Set(reference(from, to).map(e => e.id)));
    assert.equal(result.length, reference(from, to).length);
    if (expected !== undefined) assert.equal(result.length, expected);
    assert.equal(result.filter(e => e.partial).length, result.filter(e => e.start < from || e.end > to).length);
  });
}

// Markörgränsen i intervalläget (#756)
const m = (id, extra = {}) => ({ id, top: false, major: false, partial: false, pinned: false, ...extra });

test('markörgränsen: under gränsen döljs inget, och ingen gräns döljer inget', () => {
  const items = [m('a'), m('b'), m('c')];
  assert.equal(markersToHide(items, 3).size, 0);
  assert.equal(markersToHide(items, 10).size, 0);
  for (const none of [Infinity, null, undefined, 0, NaN]) assert.equal(markersToHide(items, none).size, 0, `gräns ${none}`);
});

test('markörgränsen: de viktigaste behålls först (valda, top, major, övriga) och hela före delvis inom intervallet', () => {
  const items = [m('vanlig-1'), m('delvis', { partial: true }), m('major', { major: true }), m('vanlig-2'), m('top', { top: true }), m('vald', { pinned: true })];
  assert.deepEqual([...markersToHide(items, 3)].sort(), ['delvis', 'vanlig-1', 'vanlig-2'].sort());
  // Fyra platser: den första vanliga kommer med (ursprungsordning), den delvis inom intervallet kommer sist
  assert.deepEqual([...markersToHide(items, 4)].sort(), ['delvis', 'vanlig-2']);
  assert.deepEqual([...markersToHide(items, 5)], ['delvis']);
});

test('markörgränsen: valda och markerade döljs aldrig, även när de är fler än gränsen', () => {
  const items = [m('a', { pinned: true }), m('b', { pinned: true }), m('c', { top: true })];
  assert.deepEqual([...markersToHide(items, 1)], ['c']);
});

test('markörgränsen: intervallet 1900–1999 i datan hålls under förinställda gränsen med de viktigaste först', () => {
  const picked = selectEventsForRange(events, 1900, 1999);
  const items = picked.map(e => m(e.id, { top: !!e.top, major: !!e.major, partial: e.partial }));
  const hide = markersToHide(items, 50);
  assert.equal(items.length - hide.size, Math.min(50, items.length));
  // Alla top och major som ryms (färre än gränsen) visas
  const important = items.filter(i => i.top || i.major);
  if (important.length <= 50) assert.ok(important.every(i => !hide.has(i.id)), 'top och major ska visas före övriga');
  assert.ok(DEFAULT_RANGE_MARKER_LIMIT >= 250 && DEFAULT_RANGE_MARKER_LIMIT <= 300, 'förinställningen följer prestandarapporten (#752)');
});
