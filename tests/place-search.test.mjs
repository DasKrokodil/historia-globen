// "Vad hände här?" (#15): avstånd, platsförslag och urval i tidsordning. Körs med node --test 'tests/*.test.mjs'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { distanceKm, placeSuggestions, eventsNear, RADIUS_KM } from '../js/place-search.js';

const ev = (id, start, place, lonlat, extra = {}) => ({ id, start, end: start, review: 'source-checked', title: { sv: id }, place: { sv: place },
  location: { type: 'Point', coordinates: lonlat }, ...extra });

test('avståndet är storcirkelavstånd i kilometer', () => {
  assert.equal(Math.round(distanceKm(0, 0, 0, 0)), 0);
  assert.ok(Math.abs(distanceKm(0, 0, 0, 1) - 111.19) < 0.5, 'en grad längs ekvatorn är cirka 111 km');
  assert.ok(Math.abs(distanceKm(0, 0, 0, 180) - 20015) < 5, 'halva jordens omkrets');
  assert.ok(Math.abs(distanceKm(59.33, 18.07, 55.68, 12.57) - 522) < 5, 'Stockholm–Köpenhamn är cirka 520 km');
});

test('platsförslagen hittar delar av namn utan hänsyn till accenter, och ett namn ger ett förslag', () => {
  const events = [
    ev('a', 100, 'Rom, Italien', [12.5, 41.9]), ev('b', 200, 'Rom, Italien', [12.6, 42.0]),
    ev('c', 300, 'Salisburyslätten, England', [-1.83, 51.18]), ev('d', 400, 'Roskilde, Danmark', [12.08, 55.64]),
    ev('e', 500, 'Rom, Italien', [12.5, 41.9], { review: 'draft' }),
  ];
  const s = placeSuggestions(events, 'rom');
  assert.deepEqual(s.map(x => x.label), ['Rom, Italien']); // Roskilde innehåller inte "rom"
  assert.deepEqual([s[0].lat, s[0].lon], [41.9, 12.5], 'första förekomstens koordinater');
  assert.deepEqual(placeSuggestions(events, 'ros').map(x => x.label), ['Roskilde, Danmark']);
  assert.deepEqual(placeSuggestions(events, ' ').map(x => x.label), []);
  assert.deepEqual(placeSuggestions(events, 'italien rom').map(x => x.label), ['Rom, Italien'], 'alla ord ska finnas');
  assert.deepEqual(placeSuggestions(events, 'saknas'), []);
  const visible = r => r !== 'draft';
  assert.equal(placeSuggestions([events[4]], 'rom', { visible }).length, 0, 'ej visade händelser ger inga förslag');
});

test('förslag som börjar med sökordet kommer före de som bara innehåller det', () => {
  const events = [ev('a', 1, 'Nya Rom', [0, 0]), ev('b', 2, 'Rom', [1, 1])];
  assert.deepEqual(placeSuggestions(events, 'rom').map(x => x.label), ['Rom', 'Nya Rom']);
});

test('sidans språk väljer namnet, men en sökning på ett annat språk hittar också', () => {
  const e = ev('a', 1, 'Rom', [12.5, 41.9]); e.place = { sv: 'Rom', en: 'Rome' };
  const en = placeSuggestions([e], 'rom', { t: x => x.en });
  assert.deepEqual(en.map(x => x.label), ['Rome']);
  assert.deepEqual(placeSuggestions([e], 'rome', { t: x => x.sv }).map(x => x.label), ['Rom']);
});

test('urvalet tar händelser inom 300 km, äldst först, och märker ungefärliga platser', () => {
  const center = { lat: 0, lon: 0 };
  const events = [
    ev('sent', 900, 'x', [1, 0]), ev('tidigt', -500, 'x', [0, 1]), ev('ungefar', 100, 'x', [0, 2], { locationPrecision: 'country' }),
    ev('for-langt', 50, 'x', [0, 3]), ev('exakt-nara', 100, 'x', [0, 0.01]), ev('utkast', 1, 'x', [0, 0.5], { review: 'draft' }),
  ];
  const hits = eventsNear(events, center, { visible: r => r !== 'draft' });
  assert.deepEqual(hits.map(h => h.event.id), ['tidigt', 'exakt-nara', 'ungefar', 'sent']);
  assert.deepEqual(hits.map(h => h.approximate), [false, false, true, false]);
  assert.ok(hits.every(h => h.km <= RADIUS_KM));
  assert.deepEqual(eventsNear(events, center, { radiusKm: 50, visible: r => r !== 'draft' }).map(h => h.event.id), ['exakt-nara'], 'radien är ett val; 50 km tar bara den närmaste');
  assert.deepEqual(eventsNear(events, null), []);
  assert.deepEqual(eventsNear(events, { lat: NaN, lon: 0 }), []);
});

test('händelser utan koordinater hoppas över och ger inget fel', () => {
  const broken = { id: 'x', start: 1, end: 1, review: 'source-checked', title: { sv: 'x' }, place: { sv: 'Någonstans' } };
  assert.deepEqual(eventsNear([broken], { lat: 0, lon: 0 }), []);
  assert.deepEqual(placeSuggestions([broken], 'någon'), []);
});

test('riktiga data: en känd plats ur datan ger förslag och en icke-tom, tidsordnad lista', () => {
  const events = JSON.parse(readFileSync(new URL('../data/events.json', import.meta.url))).events;
  const sug = placeSuggestions(events, 'rom');
  assert.ok(sug.length > 0, 'datan har platser som innehåller "rom"');
  const hits = eventsNear(events, sug[0]);
  assert.ok(hits.length > 0, 'platsens egen händelse ligger inom radien');
  for (let i = 1; i < hits.length; i++) assert.ok(hits[i - 1].event.start <= hits[i].event.start, 'sorterat i tid');
});
