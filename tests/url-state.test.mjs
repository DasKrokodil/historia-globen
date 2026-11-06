// Adressformatet (#501, #64): js/url-state.js. Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeHash, decodeHash, isNewStep } from '../js/url-state.js';

const base = { v: 1, year: 1325, camera: { lat: 34, lon: -50, zoom: 1.6 }, focus: null, layers: ['areas', 'events'], filters: ['krig', 'kultur'], calm: false };

test('en hash går fram och tillbaka', () => {
  const hash = encodeHash({ ...base, focus: 'war:hundraarskriget' });
  assert.equal(hash, '#y=1325&c=34,-50,1.6&f=war:hundraarskriget&l=areas,events&k=krig,kultur');
  const s = decodeHash(hash);
  assert.equal(s.year, 1325);
  assert.deepEqual(s.camera, { lat: 34, lon: -50, zoom: 1.6 });
  assert.equal(s.focus, 'war:hundraarskriget');
  assert.deepEqual(s.layers, ['areas', 'events']);
  assert.deepEqual(s.filters, ['krig', 'kultur']);
});

test('alla kategorier skrivs inte ut, och saknade fält behåller sidans val', () => {
  const hash = encodeHash(base, ['krig', 'kultur']);
  assert.ok(!hash.includes('k='));
  const s = decodeHash('#y=-499');
  assert.equal(s.year, -499);
  assert.equal(s.layers, null);
  assert.equal(s.filters, null);
  assert.equal(s.camera, null);
  assert.equal(s.focus, null);
});

test('l= utan lager betyder inga lager, och decimalår för korta krig behålls', () => {
  const s = decodeHash('#y=1879.0548&l=');
  assert.deepEqual(s.layers, []);
  assert.equal(s.year, 1879.0548);
});

test('trasiga länkar ger null eller hoppar över det trasiga fältet, utan att kasta', () => {
  for (const bad of ['', '#', '#y=', '#y=abc', '#foo=1', null, undefined]) assert.equal(decodeHash(bad), null, String(bad));
  const s = decodeHash('#y=1000&f=okänd:x&l=events,<script>&c=1,2');
  assert.equal(s.year, 1000);
  assert.equal(s.focus, null);
  assert.equal(s.focusError, true);
  assert.deepEqual(s.layers, ['events']);
  assert.equal(s.camera, null);
});

test('kameran hålls inom jordens gränser', () => {
  const s = decodeHash('#y=1&c=120,190,9');
  assert.deepEqual(s.camera, { lat: 90, lon: -170, zoom: 3.2 });
});

test('Lugn rörelse står aldrig i länken', () => {
  assert.ok(!encodeHash({ ...base, calm: true }).includes('calm'));
  assert.equal(decodeHash('#y=1&calm=1').calm, false);
});

test('ny post i historiken bara vid större steg', () => {
  assert.equal(isNewStep(null, base), false);
  assert.equal(isNewStep(base, { ...base, camera: { lat: 0, lon: 0, zoom: 1 } }), false);
  assert.equal(isNewStep(base, { ...base, year: 1325.4 }), false);
  assert.equal(isNewStep(base, { ...base, year: 1400 }), true);
  assert.equal(isNewStep(base, { ...base, year: 1400 }, { playing: true }), false);
  assert.equal(isNewStep(base, { ...base, focus: 'empire:rom' }), true);
  assert.equal(isNewStep(base, { ...base, layers: ['events'] }), true);
  assert.equal(isNewStep(base, { ...base, filters: ['krig'] }), true);
});
