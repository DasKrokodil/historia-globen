// Stoppen när man följer en plats eller ett tema (#1255, #1620): urvalet i js/theme-stops.js som playback.js köar.
// Körs med node --test 'tests/*.test.mjs'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { themeStops, themeKey, passedThemeStops } from '../js/theme-stops.js';

const ev = (id, start, extra = {}) => ({ id, start, ...extra });
// Samma regel som playback.js: tiden passerades om den ligger efter förra ritningen och till och med den här
const passedBetween = (lastYear, year) => tt => tt > lastYear && tt <= year;
const ids = list => list.map(e => e.id);

test('bara de viktiga (major eller top) blir stopp, i tidsordning', () => {
  const evs = [ev('c', 1700, { major: true }), ev('a', 1500), ev('b', 1600, { top: true })];
  assert.deepEqual(ids(themeStops(evs)), ['b', 'c']);
});

test('utan viktiga händelser blir alla stopp (reserv för platser och teman utan urval)', () => {
  assert.deepEqual(ids(themeStops([ev('b', 20), ev('a', 10)])), ['a', 'b']);
  assert.deepEqual(themeStops([]), []);
  assert.deepEqual(themeStops(), []);
});

test('flera stopp samma år kommer alla med, den som slutar först först (Skåne 1658)', () => {
  const stops = themeStops([ev('uppakra', -99, { major: true }), ev('forsvenskningen', 1658, { end: 1719, major: true }),
    ev('trohetseden', 1658, { end: 1658, major: true }), ev('slaget', 1676, { major: true })]);
  const hits = passedThemeStops(stops, new Set(), passedBetween(1650, 1660));
  assert.deepEqual(ids(hits), ['trohetseden', 'forsvenskningen']);
});

test('ett visat stopp kommer inte igen, men nästa samma år gör det', () => {
  const stops = themeStops([ev('trohetseden', 1658, { major: true }), ev('forsvenskningen', 1658, { major: true })]);
  const shown = new Set([themeKey(stops[0])]);
  assert.deepEqual(ids(passedThemeStops(stops, shown, passedBetween(1650, 1660))), ['forsvenskningen']);
  shown.add(themeKey(stops[1]));
  assert.deepEqual(passedThemeStops(stops, shown, passedBetween(1650, 1660)), []);
});

test('stopp i olika år: bara de som passerades i steget', () => {
  const stops = themeStops([ev('a', 1000, { major: true }), ev('b', 1332, { major: true }), ev('c', 1658, { major: true })]);
  assert.deepEqual(ids(passedThemeStops(stops, new Set(), passedBetween(999, 1001))), ['a']);
  assert.deepEqual(ids(passedThemeStops(stops, new Set(), passedBetween(1001, 1700))), ['b', 'c']);
  assert.deepEqual(passedThemeStops(stops, new Set(), passedBetween(1700, 1800)), []);
});

test('nyckeln skiljer platsens stopp från krigens och resornas', () => {
  assert.equal(themeKey({ id: 'x' }), 't:x');
});
