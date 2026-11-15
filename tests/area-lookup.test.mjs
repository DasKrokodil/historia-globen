// Punkt mot rike med marginal (#1524): js/area-lookup.js. Rikenas gränser kommer ur Cliopatria och är förenklade (0,1 graders
// koordinater), så Köpenhamn (Q1748, 55,676° N, 12,569° Ö) ligger cirka 0,015 grader utanför Danmarks gräns. Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { areaAt, AREA_MARGIN_DEG } from '../js/area-lookup.js';
import { inGeometry } from '../js/place-geo.js';

const KPH = [12.569, 55.676];
const dir = new URL('../data/empires/', import.meta.url);
const load = f => JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8')).polities;
// De riken som Köpenhamn hör till genom tiderna enligt Cliopatria, plus Nazityskland (ockupationen) och Sverige (grannen)
const polities = ['danmark.json', 'konungariket-danmark.json', 'kalmarunionen.json', 'nazityskland.json', 'svenska-stormaktsvaldet.json'].flatMap(load);
const itemsAt = year => polities.flatMap(p => p.periods.filter(q => q.start <= year && year <= q.end).map(q => ({ id: p.id, geometry: q.geometry })));
const DANISH = /^(danmark|danmark-1815|danmark-norge|konungariket-danmark|kalmarunionen|danmark-england|norge-danmark|nordsjovaldet)$/;
const square = (x0, y0, x1, y1) => ({ type: 'Polygon', coordinates: [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]] });

test('marginalen är cirka 0,05 grader', () => {
  assert.equal(AREA_MARGIN_DEG, 0.05);
});

test('Köpenhamn ligger i ett danskt rike de år Danmark finns, trots förenklad gräns', () => {
  const years = [950, 1100, 1300, 1450, 1550, 1700, 1850, 1900, 1950, 2000];
  for (const year of years) {
    const items = itemsAt(year);
    assert.ok(items.some(i => DANISH.test(i.id)), `${year}: testdatan saknar ett danskt rike`);
    const found = areaAt(items, ...KPH);
    assert.equal(found.items.length, 1, `${year}: Köpenhamn hamnar utan rike`);
    assert.match(found.items[0].id, DANISH, `${year}: fel rike (${found.items[0].id})`);
    assert.equal(found.viaMargin, true, `${year}: punkten ligger utanför den förenklade gränsen och ska komma via marginalen`);
  }
});

test('Köpenhamn har ett danskt rike varje år där ett danskt rike finns', () => {
  const missing = [];
  for (let year = 936; year <= 2024; year++) {
    const items = itemsAt(year);
    if (!items.some(i => DANISH.test(i.id))) continue;
    const got = areaAt(items, ...KPH).items[0];
    if (!got || !DANISH.test(got.id)) missing.push(`${year}:${got?.id ?? '-'}`);
  }
  assert.deepEqual(missing, []);
});

test('under ockupationen 1940–1944 finns inget danskt rike, och Nazityskland ligger för långt bort', () => {
  for (const year of [1940, 1942, 1944]) assert.deepEqual(areaAt(itemsAt(year), ...KPH).items, [], String(year));
});

test('en punkt långt ute i havet får inget rike', () => {
  for (const year of [1000, 1650, 1950]) {
    for (const [lon, lat] of [[3, 56.5], [-30, 40], [18, 58.5]]) {
      assert.deepEqual(areaAt(itemsAt(year), lon, lat).items, [], `${year} ${lon},${lat}`);
    }
  }
});

test('en punkt mitt i ett rike ändras inte: samma rike som utan marginal, och inte via marginalen', () => {
  const items = itemsAt(1900);
  const strict = items.filter(i => inGeometry(i.geometry, 9.5, 56.0)).map(i => i.id);
  assert.ok(strict.includes('danmark-1815'), 'Jylland ligger i Danmark 1900');
  const got = areaAt(items, 9.5, 56.0);
  assert.deepEqual(got.items.map(i => i.id), strict);
  assert.equal(got.viaMargin, false);
});

test('ligger punkten innanför flera riken ges alla, i indatans ordning, och marginalen används inte', () => {
  const a = { id: 'a', geometry: square(0, 0, 10, 10) }, b = { id: 'b', geometry: square(4, 4, 6, 6) };
  const got = areaAt([a, b], 5, 5);
  assert.deepEqual(got.items.map(i => i.id), ['a', 'b']);
  assert.equal(got.viaMargin, false);
});

test('nära två riken väljer det närmaste', () => {
  const a = { id: 'a', geometry: square(0, 0, 10, 10) };
  const b = { id: 'b', geometry: square(10.06, 0, 20, 10) };
  // 0,02 grader från a, 0,04 från b
  assert.deepEqual(areaAt([a, b], 10.02, 5).items.map(i => i.id), ['a']);
  assert.deepEqual(areaAt([b, a], 10.02, 5).items.map(i => i.id), ['a']);
  assert.deepEqual(areaAt([a, b], 10.04, 5).items.map(i => i.id), ['b']);
  assert.deepEqual(areaAt([b, a], 10.04, 5).items.map(i => i.id), ['b']);
});

test('nära två riken i riktig data (Köpenhamn 1660): danska riket före det svenska även med en bredare marginal', () => {
  const items = itemsAt(1660);
  assert.ok(items.some(i => i.id === 'svenska-stormaktsvaldet'), 'testdatan saknar Sverige 1660');
  assert.match(areaAt(items, ...KPH, { margin: 0.5 }).items[0].id, DANISH);
});

test('längdgrader skalas med cos(latitud): samma lonstjocklek är längre bort vid ekvatorn än vid 60° N', () => {
  const at = lat => ({ id: 'x', geometry: square(10, lat - 5, 20, lat + 5) });
  // 0,08 grader öster om kanten i längdled: 0,04 grader på marken vid 60° N, 0,08 vid ekvatorn
  assert.equal(areaAt([at(60)], 20.08, 60).items.length, 1, '60° N: inom marginalen');
  assert.equal(areaAt([at(0)], 20.08, 0).items.length, 0, 'ekvatorn: utanför marginalen');
  // Nordligt avstånd räknas som det är
  assert.equal(areaAt([at(0)], 15, 5.04).items.length, 1);
  assert.equal(areaAt([at(0)], 15, 5.06).items.length, 0);
});

test('marginalen hittar över datumlinjen', () => {
  const g = square(170, 10, 179.99, 20);
  assert.equal(areaAt([{ id: 'x', geometry: g }], -179.98, 15).items.length, 1, '0,03 grader över linjen');
  assert.equal(areaAt([{ id: 'x', geometry: g }], -179.5, 15).items.length, 0, '0,5 grader över linjen');
});

test('marginalen räknas från gränsen även för hål: en punkt i en sjö nära stranden hör till riket', () => {
  const g = { type: 'Polygon', coordinates: [square(0, 0, 10, 10).coordinates[0], square(4, 4, 6, 6).coordinates[0]] };
  assert.equal(areaAt([{ id: 'x', geometry: g }], 5, 5).items.length, 0, 'mitt i hålet: långt från kanten');
  assert.equal(areaAt([{ id: 'x', geometry: g }], 4.03, 5).items.length, 1, 'i hålet, 0,03 från kanten');
});

test('geometry kan hämtas ur valfritt fält och marginalen går att ändra', () => {
  const item = { name: 'n', period: { geometry: square(0, 0, 1, 1) } };
  assert.equal(areaAt([item], 1.1, 0.5, { geometry: i => i.period.geometry }).items.length, 0);
  assert.equal(areaAt([item], 1.1, 0.5, { geometry: i => i.period.geometry, margin: 0.2 }).items.length, 1);
});
