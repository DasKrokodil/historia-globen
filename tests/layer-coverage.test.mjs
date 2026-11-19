// Var ett lagers data finns i tiden (#1960): täckningen räknas ur datans from/to, och raden i Lager visas bara när ett påslaget
// lager saknar data i året. Körs med node --test 'tests/*.test.mjs'.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { spanOf, edtfApprox, outsideCoverage } from '../js/layer-coverage.js';
import { LayerRegistry } from '../js/layers/registry.js';
import { imageRows, sliceCoverage } from '../js/layers/images.js';
import { WarsLayer } from '../js/layers/wars.js';
import { SpreadLayer } from '../js/layers/spread.js';
import { register } from 'node:module';

// Vägarna och religionerna importerar globen, som hämtar three.js från en adress; här byts den mot en tom modul (ingenting ritas)
register('data:text/javascript,' + encodeURIComponent(`
  export async function resolve(specifier, context, next) {
    if (specifier.startsWith('https://')) return { url: 'data:text/javascript,export default {}', shortCircuit: true };
    return next(specifier, context);
  }
`));
const { LinesLayer } = await import('../js/layers/lines.js');
const { ReligionsLayer } = await import('../js/layers/religions.js');

const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));

test('täckningen är tidigaste from och senaste to', () => {
  assert.deepEqual(spanOf([{ from: -500, to: -100 }, { from: -300, to: 200 }, { from: 50, to: 80 }]),
    { from: -500, to: 200, approxFrom: false, approxTo: false });
});

test('en post utan slut gäller tills vidare, och poster utan from hoppas över', () => {
  const span = spanOf([{ from: 2016 }, { from: null, to: 5 }, {}, null]);
  assert.equal(span.from, 2016);
  assert.equal(span.to, Infinity);
  assert.equal(outsideCoverage(span, 2100), null, 'efter en öppen början finns data i alla år');
  assert.deepEqual(outsideCoverage(span, 1999), { side: 'before', limit: 2016, approx: false });
});

test('inga poster ger ingen täckning, och ingen täckning ger ingen rad', () => {
  assert.equal(spanOf([]), null);
  assert.equal(spanOf(), null);
  assert.equal(outsideCoverage(null, 1500), null, 'okänd täckning (datan inte laddad) visar ingen rad');
  assert.equal(outsideCoverage(spanOf([{ from: 0, to: 10 }]), NaN), null);
});

test('raden visas bara utanför täckningen, och gränserna själva räknas som data', () => {
  const span = spanOf([{ from: -2500, to: 2024 }]);
  assert.equal(outsideCoverage(span, -2500), null);
  assert.equal(outsideCoverage(span, 2024), null);
  assert.equal(outsideCoverage(span, 0), null);
  assert.deepEqual(outsideCoverage(span, -2501), { side: 'before', limit: -2500, approx: false });
  assert.deepEqual(outsideCoverage(span, 2025), { side: 'after', limit: 2024, approx: false });
  assert.deepEqual(outsideCoverage(span, 1500.5), null, 'ett decimalår (fokus på ett kort krig) räknas som vanligt');
});

test('en gräns är ungefärlig bara när alla poster som sätter den är det', () => {
  const both = spanOf([{ from: -100, to: 0, approxFrom: true, approxTo: true }, { from: -100, to: 0, approxFrom: false, approxTo: true }]);
  assert.equal(both.approxFrom, false, 'en säker post med samma gräns gör gränsen säker');
  assert.equal(both.approxTo, true);
  const later = spanOf([{ from: -100, to: 0, approxFrom: true }, { from: -50, to: 20, approxFrom: false, approxTo: false }]);
  assert.equal(later.approxFrom, true, 'gränsen sätts av den tidigaste posten');
  assert.equal(later.approxTo, false, 'slutet sätts av den senaste posten');
});

test('EDTF: ~ och ? gör sidan ungefärlig, ett öppet eller exakt led gör den inte det', () => {
  assert.deepEqual(edtfApprox('Y-297999~/Y-9999~'), { from: true, to: true });
  assert.deepEqual(edtfApprox('Y-62999?/Y-41999~'), { from: true, to: true });
  assert.deepEqual(edtfApprox('../Y-36999~'), { from: false, to: true });
  assert.deepEqual(edtfApprox('Y-21499/Y-19699'), { from: false, to: false });
  assert.deepEqual(edtfApprox('1066'), { from: false, to: false });
  assert.deepEqual(edtfApprox(undefined), { from: false, to: false });
});

test('registret frågar bara lager som är påslagna i Lager och som har en täckning', () => {
  const reg = new LayerRegistry();
  const span = spanOf([{ from: -500, to: -100 }]);
  reg.add({ id: 'a', coverage: () => ({ year: 1500, span }) });
  reg.add({ id: 'b', coverage: () => ({ year: -300, span }) });          // inom täckningen
  reg.add({ id: 'c', coverage: () => ({ year: 1500, span }) });          // avslaget i Lager
  reg.add({ id: 'd', coverage: () => null });                            // täckningen okänd
  reg.add({ id: 'e' });                                                  // utan täckning (till exempel Händelser)
  let asked = [];
  reg.add({ id: 'f', coverage: () => { asked.push('f'); return { year: -900, span }; } });
  const gaps = reg.coverage({ layers: { a: true, b: true, c: false, d: true, e: true, f: true } });
  assert.deepEqual([...gaps.keys()], ['a', 'f']);
  assert.deepEqual(gaps.get('a'), { side: 'after', limit: -100, approx: false });
  assert.deepEqual(gaps.get('f'), { side: 'before', limit: -500, approx: false });
  asked = [];
  reg.coverage({ layers: { f: false } });
  assert.deepEqual(asked, [], 'ett avslaget lager frågas inte');
});

test('registret ändrar inte lagren: ingen dämpning och inget avslag', () => {
  const reg = new LayerRegistry();
  reg.add({ id: 'a', coverage: () => ({ year: 1500, span: spanOf([{ from: -500, to: -100 }]) }) });
  const state = { layers: { a: true }, on: { a: true }, faded: new Set(), focus: null };
  reg.coverage(state);
  assert.equal(state.layers.a, true);
  assert.equal(state.on.a, true);
  assert.equal(state.faded.size, 0);
});

test('bildlagren: täckningen räknas ur skivornas from och to, som sliceAt', () => {
  const rows = Object.fromEntries(imageRows(read('data/bildlager.json')).map(r => [r.id, r]));
  const lights = sliceCoverage(rows.nattljus.slices);
  assert.equal(lights.from, 2016);
  assert.equal(lights.to, Infinity, 'nattljus 2016 gäller tills vidare');
  assert.deepEqual(outsideCoverage(lights, 1500), { side: 'before', limit: 2016, approx: false });
  assert.equal(outsideCoverage(lights, 2020), null);
  const coast = sliceCoverage(rows['istidens-kust'].slices);
  const last = rows['istidens-kust'].slices.reduce((a, b) => (b.to > a.to ? b : a));
  assert.equal(coast.to, last.to);
  assert.equal(coast.approxTo, true, 'skivorna är modellsteg med caveat, så gränsen är cirka');
  assert.ok(coast.to < -2999, 'istidens kust slutar före 3000 f.Kr.');
  assert.deepEqual(outsideCoverage(coast, 1500), { side: 'after', limit: coast.to, approx: true });
  assert.equal(outsideCoverage(coast, -20000), null);
});

test('krigen: från första kriget till sista slutet, utkast räknas inte', () => {
  const layer = new WarsLayer([
    { id: 'a', kind: 'war', start: -1274, end: -1274, review: 'source-checked', _battles: [] },
    { id: 'b', kind: 'war', start: 1914, end: 1918, review: 'two-sources', _battles: [] },
    { id: 'c', kind: 'war', start: -5000, end: 2100, review: 'draft', _battles: [] },
    { id: 'd', start: -9000, end: 9000, review: 'source-checked' }, // ingen krigspost
  ]);
  assert.deepEqual(layer.coverage(), { from: -1274, to: 1918, approxFrom: false, approxTo: false });
  assert.equal(new WarsLayer([]).coverage(), null);
});

test('vägarna: etappernas from och to, och ingen täckning innan de har laddats', () => {
  assert.equal(new LinesLayer([]).coverage(), null);
  const path = [[0, 0], [10, 10]];
  const layer = new LinesLayer([
    { id: 'x', review: 'source-checked', legs: [{ from: -129, to: -100, path }, { from: 1400, to: 1433, path }, { from: 5, to: 6 }] },
    { id: 'y', review: 'draft', legs: [{ from: -9000, to: 9000, path }] },
  ]);
  assert.deepEqual(layer.coverage(), { from: -129, to: 1433, approxFrom: false, approxTo: false });
});

test('människans spridning: posternas start och slut, ungefärliga enligt edtf, och okänd före laddning', () => {
  const layer = new SpreadLayer();
  assert.equal(layer.coverage(), null, 'datan laddas först när lagret slås på');
  layer.setData(read('data/spridning.json'));
  const span = layer.coverage();
  const items = read('data/spridning.json').items.filter(i => i.review !== 'draft');
  assert.equal(span.from, Math.min(...items.map(i => i.start)));
  assert.equal(span.to, Math.max(...items.map(i => i.end)));
  assert.ok(span.to < -2999, 'spridningen slutar före 3000 f.Kr.');
  assert.equal(span.approxTo, true);
  assert.deepEqual(outsideCoverage(span, 1500), { side: 'after', limit: span.to, approx: true });
});

test('religionerna: ögonblicksbildernas start och slut, okänd före laddning', () => {
  const layer = new ReligionsLayer();
  assert.equal(layer.coverage(), null);
  layer.setData(read('data/religions.json').religions);
  const span = layer.coverage();
  const snaps = read('data/religions.json').religions.flatMap(r => r.snapshots);
  assert.equal(span.from, Math.min(...snaps.map(x => x.start)));
  assert.equal(span.to, Math.max(...snaps.map(x => x.end)));
  assert.deepEqual(outsideCoverage(span, -20000), { side: 'before', limit: span.from, approx: false });
});

test('rikena: tidigaste from och senaste to i empires/index.json, och reglaget före 3000 f.Kr. saknar data', () => {
  const groups = read('data/empires/index.json').groups;
  const span = spanOf(groups);
  assert.equal(span.from, Math.min(...groups.map(g => g.from)));
  assert.equal(span.to, Math.max(...groups.map(g => g.to)));
  assert.deepEqual(outsideCoverage(span, -3000), { side: 'before', limit: span.from, approx: false }, 'riken saknas också 3000–2500 f.Kr.');
  assert.equal(outsideCoverage(span, 1500), null);
});
