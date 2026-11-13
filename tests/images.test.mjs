// Bildlagren (#54, format 2 i #1325): urvalet av rader och skivor, utsnittet (bounds), rensningen av bilder
// som inte visas och äldre lager-id i delade länkar. Körs med node --test 'tests/*.test.mjs'.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { ImageLayer, imageRows, imageAliases, sliceAt, boundsRect, entries } from '../js/layers/images.js';

const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const example = read('tests/fixtures/bildlager-exempel.json');
const slice = (over = {}) => ({ id: 'a', format: 'raster', file: 'a.jpg', from: 1500, to: 1599, ...over });
/** Ett bildobjekt som beter sig som en färdigladdad bild. */
const fakeImage = () => ({ complete: true, naturalWidth: 10, src: '' });
const fakeCtx = () => { const calls = []; return { calls, save() {}, restore() {}, set globalAlpha(v) { calls.push(['alpha', v]); }, drawImage(...a) { calls.push(['draw', ...a.slice(1)]); } }; };

test('bara rader med kind lager och rasterskivor som inte är utkast visas', () => {
  const rows = imageRows(example);
  assert.deepEqual(rows.map(r => r.id), ['exempel-kallkarta'], 'kind grund läses inte förrän version 8');
  assert.deepEqual(rows[0].slices.map(s => s.id), ['exempel-utsnitt'], 'vektor (och utkast) hoppas över');
  const drafts = { layers: [{ id: 'x', kind: 'lager', slices: [slice({ review: 'draft' })] }] };
  assert.deepEqual(imageRows(drafts), [], 'en rad med bara utkast får ingen rad i Lager');
  assert.deepEqual(imageRows(null), []);
});

test('varje rad blir en egen post i lagerregistret med radens id', () => {
  const doc = { layers: [
    { id: 'ett', kind: 'lager', name: { sv: 'Ett' }, note: { sv: 'Not' }, slices: [slice()] },
    { id: 'tva', kind: 'lager', name: { sv: 'Två' }, group: 'power', slices: [slice({ id: 'b', file: 'b.jpg' })] },
  ] };
  const list = entries({ data: { imageLayers: doc }, refreshSoon() {} });
  assert.deepEqual(list.map(e => [e.id, e.group, e.menu.on]), [['ett', 'perspective', false], ['tva', 'power', false]]);
  assert.equal(list[0].enabled({ layers: { ett: true } }), true);
  assert.equal(list[1].enabled({ layers: { ett: true } }), undefined, 'raderna slås på var för sig');
});

test('skivan väljs efter året, och to som saknas betyder tills vidare', () => {
  const slices = [slice(), slice({ id: 'b', file: 'b.jpg', from: 1600, to: undefined })];
  assert.equal(sliceAt(slices, 1499), null);
  assert.equal(sliceAt(slices, 1500).id, 'a');
  assert.equal(sliceAt(slices, 1599).id, 'a');
  assert.equal(sliceAt(slices, 1600).id, 'b');
  assert.equal(sliceAt(slices, 2026).id, 'b');
});

test('bounds ger rutan på den ekvirektangulära bilden, och utan bounds hela bilden', () => {
  assert.deepEqual(boundsRect(undefined, 4096, 2048), { x: 0, y: 0, w: 4096, h: 2048 });
  assert.deepEqual(boundsRect([-180, -90, 180, 90], 360, 180), { x: 0, y: 0, w: 360, h: 180 });
  // Väst −30, syd 30, öst 60, nord 75 på en bild med en bildpunkt per grad
  assert.deepEqual(boundsRect([-30, 30, 60, 75], 360, 180), { x: 150, y: 15, w: 90, h: 45 });
});

test('lagret ritar skivan i sin ruta med sin täckning, också i en större bild (det skarpa utsnittet)', () => {
  const layer = new ImageLayer([slice({ bounds: [-30, 30, 60, 75], opacity: 0.8 })], fakeImage);
  layer.enabled = true;
  layer.update(1550);
  for (const [W, H, rect] of [[360, 180, [150, 15, 90, 45]], [3600, 1800, [1500, 150, 900, 450]]]) {
    const ctx = fakeCtx();
    layer.drawOverlay(ctx, W, H);
    assert.deepEqual(ctx.calls, [['alpha', 0.8], ['draw', ...rect]]);
  }
});

test('bilder som inte visas släpps: avstängt lager, annan skiva och år utan skiva', () => {
  const made = [];
  const layer = new ImageLayer([slice(), slice({ id: 'b', file: 'b.jpg', from: 1600, to: 1699 })], () => { const i = fakeImage(); made.push(i); return i; });
  layer.update(1550);
  assert.equal(layer.images.size, 0, 'ett avstängt lager laddar ingenting');
  layer.enabled = true;
  layer.update(1550);
  layer.update(1560);
  assert.deepEqual([...layer.images.keys()], ['a.jpg']);
  assert.equal(made.length, 1, 'samma skiva laddas inte om');
  layer.update(1650);
  assert.deepEqual([...layer.images.keys()], ['b.jpg'], 'den förra skivans bild släpps');
  assert.equal(made[0].src, '', 'bilden som släpps töms');
  layer.update(1750);
  assert.equal(layer.images.size, 0, 'ett år utan skiva håller ingen bild');
  layer.update(1650);
  layer.enabled = false;
  layer.update(1650);
  assert.equal(layer.images.size, 0, 'ett avstängt lager håller ingen bild');
  const ctx = fakeCtx();
  layer.drawOverlay(ctx, 360, 180);
  assert.deepEqual(ctx.calls, [], 'och ritar ingenting');
});

test('en bild som inte har laddats ritas inte', () => {
  const layer = new ImageLayer([slice()], () => ({ complete: false, naturalWidth: 0, src: '' }));
  layer.enabled = true;
  layer.update(1550);
  const ctx = fakeCtx();
  layer.drawOverlay(ctx, 360, 180);
  assert.deepEqual(ctx.calls, []);
});

// Lagrens id i dag: posterna i js/layers/index.js, där "images" står för bildlagrens rader
const layerIds = () => {
  const list = readFileSync(new URL('../js/layers/index.js', import.meta.url), 'utf8').match(/export const LAYERS = \[([^\]]*)\]/)[1];
  const ids = new Set(list.split(',').map(x => x.trim()).filter(Boolean));
  ids.delete('images');
  for (const row of imageRows(read('data/bildlager.json'))) ids.add(row.id);
  return ids;
};

test('nattljuset är en rad med id nattljus, och det äldre id:t images pekar dit', () => {
  const doc = read('data/bildlager.json');
  assert.ok(imageRows(doc).some(r => r.id === 'nattljus'));
  assert.deepEqual(imageAliases(doc), { images: 'nattljus' });
});

test('varje lager i länkarkivet finns kvar, direkt eller som alias (#1326, #1325)', () => {
  const ids = layerIds(), renamed = imageAliases(read('data/bildlager.json'));
  const links = read('tests/lankarkiv.json').links;
  const names = new Set(links.flatMap(l => l.expected.state?.layers ?? []));
  assert.ok(names.has('images'), 'arkivet ska ha en länk med det äldre id:t images');
  for (const name of names) assert.ok(ids.has(renamed[name] ?? name), `lagret ${name} i en äldre länk finns inte längre och saknar alias`);
});
