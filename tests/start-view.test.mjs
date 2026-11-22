// Startbilden (#1317): reglerna i js/start-view.js. Zoomen är appens lägsta (0,8) på bred skärm utan delad adress, annars 1.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startView, hasSharedAddress, START_ZOOM_WIDE, START_ZOOM_DEFAULT, WIDE_QUERY } from '../js/start-view.js';

test('bred skärm utan adress börjar på lägsta zoom över samma plats som förut', () => {
  assert.deepEqual(startView({ wide: true }), { lat: 34, lon: -50, zoom: 0.8 });
  assert.equal(START_ZOOM_WIDE, 0.8);
});

test('smal skärm och låg yta behåller zoom 1', () => {
  assert.deepEqual(startView({ wide: false }), { lat: 34, lon: -50, zoom: 1 });
  assert.equal(START_ZOOM_DEFAULT, 1);
  assert.match(WIDE_QUERY, /min-width: 761px/); // samma gräns som Visste du?-kortets ark nedtill
  assert.match(WIDE_QUERY, /min-height: 500px/); // låg yta (liggande telefon) är undantagen
});

test('en delad adress rör inte kameran: hash, äldre ?c= och ?tur= ger zoom 1', () => {
  for (const delad of [{ hash: '#y=1325' }, { hash: '#y=800&c=34,-50,1.6' }, { hash: '#t=tur&s=1' }, { search: '?c=56,13,3.2' }, { search: '?tur=forsta-varldskriget' }]) {
    assert.equal(hasSharedAddress(delad), true, JSON.stringify(delad));
    assert.equal(startView({ ...delad, wide: true }).zoom, 1, JSON.stringify(delad));
  }
});

test('en tom hash eller en fråga utan kamera räknas inte som delad adress', () => {
  for (const tom of [{ hash: '' }, { hash: '#' }, { search: '' }, { search: '?lang=sv' }, { search: '?ny=1' }]) {
    assert.equal(hasSharedAddress(tom), false, JSON.stringify(tom));
    assert.equal(startView({ ...tom, wide: true }).zoom, 0.8, JSON.stringify(tom));
  }
});

test('startzoomen är inom appens zoomgränser (Globe.setZoom: 0,8–3,2)', () => {
  const kalla = readFileSync(new URL('../js/globe.js', import.meta.url), 'utf8');
  assert.match(kalla, /Math\.max\(0\.8, z\)/, 'appens lägsta zoom är 0,8');
  assert.ok(START_ZOOM_WIDE >= 0.8 && START_ZOOM_WIDE <= 3.2);
});
