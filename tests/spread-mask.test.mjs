// Människans spridning mot istidens kust (#1565): vilken mask som gäller ett år, att masken bara laddas när ett område
// syns i modellens spann och släpps annars, och att varje mask finns i repot. Körs med node --test 'tests/*.test.mjs'.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { SpreadLayer, maskSlices } from '../js/layers/spread.js';

const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const doc = read('data/bildlager.json');
const made = [];
const fakeImage = () => { const im = { complete: true, naturalWidth: 2048, src: '' }; made.push(im); return im; };
const area = { id: 'a', kind: 'area', start: -60000, end: -9999, places: [{ coord: [110, -5] }] };
const wave = { id: 'w', kind: 'wave', start: -60000, end: -9999, paths: [[{ coord: [40, 10] }, { coord: [110, -5] }]] };

test('varje skiva i istidens kust har en mask som finns i repot', () => {
  const masks = maskSlices(doc);
  assert.equal(masks.length, 9);
  for (const x of masks) {
    assert.match(x.mask, /^images\/lager\/istidens-land-\d+ka\.webp$/);
    assert.ok(existsSync(new URL(`../${x.mask}`, import.meta.url)), `${x.mask} saknas`);
  }
  assert.deepEqual(maskSlices({ layers: [] }), []);
});

test('masken för närmaste steg laddas bara när ett område syns, och släpps annars', () => {
  const layer = new SpreadLayer({}, {}, null, maskSlices(doc), fakeImage);
  layer.enabled = true;
  layer.setData({ items: [area, wave] });
  layer.update({ year: -18050 });
  assert.equal(layer.mask?.mask, 'images/lager/istidens-land-20ka.webp');
  assert.ok(layer.maskImage(), 'masken används när den är laddad');
  assert.deepEqual([...layer.masks.keys()], ['images/lager/istidens-land-20ka.webp']);
  layer.update({ year: -38050 });
  assert.deepEqual([...layer.masks.keys()], ['images/lager/istidens-land-40ka.webp'], 'den förra masken släpps');
  assert.equal(made[0].src, '', 'den släppta bilden håller inget minne');
  // Bara en våg syns: ingen mask
  layer.setData({ items: [area, { ...wave, start: -90000 }].map(i => i.kind === 'area' ? { ...i, start: -50000 } : i) });
  layer.update({ year: -85000 });
  assert.equal(layer.mask, null);
  assert.equal(layer.masks.size, 0);
  assert.equal(layer.legendItems().coast, '', 'ingen rad om kusten utan områden');
});

test('före modellens spann gäller ingen mask, och raden om kusten säger det', () => {
  const layer = new SpreadLayer({}, {}, null, maskSlices(doc), fakeImage);
  layer.enabled = true;
  layer.setData({ items: [{ ...area, start: -200000 }] });
  layer.update({ year: -100000 });
  assert.equal(layer.mask, null);
  assert.equal(layer.masks.size, 0);
  const before = layer.legendItems().coast;
  assert.notEqual(before, '');
  layer.update({ year: -18050 });
  assert.ok(layer.mask);
  assert.notEqual(layer.legendItems().coast, before, 'raden skiljer modellens kust från dagens');
});

test('vid stegbyte klipps med den förra masken tills den nya är laddad, och sedan släpps den förra', () => {
  // Bilder som laddas först när testet säger det, som i webbläsaren
  const pending = [];
  const slowImage = () => { const im = { complete: false, naturalWidth: 0, src: '' }; pending.push(im); return im; };
  const load = im => { im.complete = true; im.naturalWidth = 2048; im.onload?.(); };
  let redraws = 0;
  const layer = new SpreadLayer({}, {}, null, maskSlices(doc), slowImage);
  layer.onMask = () => { redraws++; };
  layer.enabled = true; layer.setData({ items: [area] });
  layer.update({ year: -18050 });
  assert.equal(layer.maskImage(), null, 'ingen mask laddad än: som utan modell');
  assert.match(layer.legendItems().coast, /./);
  const before = layer.legendItems().coast;
  load(pending[0]);
  assert.equal(redraws, 1);
  assert.equal(layer.maskImage(), pending[0]);
  assert.notEqual(layer.legendItems().coast, before, 'raden säger modellens kust först när något klipps');
  const model = layer.legendItems().coast;
  // Stegbyte till 30 000 år sedan: 20 000-masken ritas under tiden, och raden säger fortfarande modellens kust
  layer.update({ year: -28050 });
  assert.deepEqual([...layer.masks.keys()].sort(), ['images/lager/istidens-land-20ka.webp', 'images/lager/istidens-land-30ka.webp']);
  assert.equal(layer.maskImage(), pending[0], 'den förra masken är reserv');
  assert.equal(layer.legendItems().coast, model);
  // Ännu ett byte innan 30 000 är klar: högst två hålls, och reserven är fortfarande den laddade
  layer.update({ year: -38050 });
  assert.deepEqual([...layer.masks.keys()].sort(), ['images/lager/istidens-land-20ka.webp', 'images/lager/istidens-land-40ka.webp']);
  assert.equal(pending[1].src, '', 'masken som aldrig blev klar släpps');
  assert.equal(layer.maskImage(), pending[0]);
  load(pending[2]);
  assert.deepEqual([...layer.masks.keys()], ['images/lager/istidens-land-40ka.webp'], 'reserven släpps när den nya är klar');
  assert.equal(pending[0].src, '');
  assert.equal(layer.maskImage(), pending[2]);
});

test('ett avstängt lager håller ingen mask', () => {
  const layer = new SpreadLayer({}, {}, null, maskSlices(doc), fakeImage);
  layer.setData({ items: [area] });
  layer.enabled = true; layer.update({ year: -18050 });
  layer.enabled = false; layer.update({ year: -18050 });
  assert.equal(layer.masks.size, 0);
  assert.equal(layer.work, null);
});

test('en trasig mask ger ritning som utan modell', () => {
  const broken = () => ({ complete: true, naturalWidth: 0, src: '' });
  const layer = new SpreadLayer({}, {}, null, maskSlices(doc), broken);
  layer.enabled = true; layer.setData({ items: [area] }); layer.update({ year: -18050 });
  assert.equal(layer.maskImage(), null);
});
