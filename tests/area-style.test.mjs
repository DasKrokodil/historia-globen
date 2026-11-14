// Områden över datumlinjen (#1097, #1227): traceRing, hasSeam och strokeEdge i js/layers/area-style.js. Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { traceRing, tracePath, hasSeam, strokeEdge } from '../js/layers/area-style.js';

const W = 2048, H = 1024;
const X = lon => (lon + 180) / 360 * W, Y = lat => (90 - lat) / 180 * H;
// En låtsasduk som sparar banans delar (en del per moveTo)
const recorder = () => {
  const parts = [];
  return { parts, moveTo: (x, y) => parts.push([[x, y]]), lineTo: (x, y) => parts.at(-1).push([x, y]), closePath() {} };
};
const longestStep = part => Math.max(...part.slice(1).map(([x], i) => Math.abs(x - part[i][0])));

test('en ring som inte korsar datumlinjen läggs en gång, oförändrad', () => {
  const ctx = recorder();
  traceRing(ctx, [[10, 50], [30, 50], [30, 60], [10, 60], [10, 50]], X, Y);
  assert.equal(ctx.parts.length, 1);
  assert.deepEqual(ctx.parts[0].map(([x]) => Math.round(x)), [10, 30, 30, 10, 10].map(l => Math.round(X(l))));
});

test('en ring som korsar 180° går den korta vägen och läggs vid båda kanterna', () => {
  const ctx = recorder();
  traceRing(ctx, [[160, 50], [-170, 50], [-170, 62], [160, 62], [160, 50]], X, Y);
  assert.equal(ctx.parts.length, 2, 'en del vid östra och en vid västra kanten');
  for (const part of ctx.parts) assert.ok(longestStep(part) < W / 2, `ett streck går tvärs över kartan (${longestStep(part)} px)`);
  const xs = ctx.parts.flat().map(([x]) => x);
  assert.ok(xs.some(x => x > W - 120 && x <= W), 'ingen del vid östra kanten (160–180°)');
  assert.ok(xs.some(x => x >= 0 && x < 120), 'ingen del vid västra kanten (−180 till −170°)');
});

test('en ring som börjar väster om 180° vecklas ut åt andra hållet', () => {
  const ctx = recorder();
  traceRing(ctx, [[-175, 60], [175, 60], [175, 65], [-175, 65], [-175, 60]], X, Y);
  assert.equal(ctx.parts.length, 2);
  for (const part of ctx.parts) assert.ok(longestStep(part) < W / 2);
});

// Sömmen (#1227): data som delats vid ±180° (#1268) har segment där båda ändpunkterna ligger på kanten. Fyllningen behöver dem,
// strokningen ska hoppa över dem. En låtsasduk sparar linjerna: moveTo börjar en ny linje, lineTo fortsätter den.
const lines = parts => parts.map(part => part.length);
const east = [[160, 50], [180, 50], [180, 62], [160, 62], [160, 50]]; // sömmen är 180,50 → 180,62
const west = [[-180, 50], [-170, 50], [-170, 62], [-180, 62], [-180, 50]]; // sömmen är −180,62 → −180,50
const geometry = { type: 'MultiPolygon', coordinates: [[east], [west]] };

test('hasSeam: bara geometrier med ett segment mellan två punkter på ±180', () => {
  assert.equal(hasSeam(geometry), true);
  assert.equal(hasSeam({ type: 'Polygon', coordinates: [east] }), true);
  assert.equal(hasSeam({ type: 'Polygon', coordinates: [[[10, 50], [30, 50], [30, 60], [10, 50]]] }), false);
  assert.equal(hasSeam({ type: 'Polygon', coordinates: [[[160, 50], [180, 55], [160, 62], [160, 50]]] }), false, 'en enda punkt på 180 är ingen söm');
});

test('en ring med söm läggs som öppna linjer utan sömmen när skipSeams är sant', () => {
  const ctx = recorder();
  traceRing(ctx, east, X, Y, true);
  assert.equal(ctx.parts.length, 2, 'en sammanhängande linje och den ensamma slutpunkten där sömmen tar vid');
  const steps = ctx.parts.reduce((n, p) => n + p.length - 1, 0);
  assert.equal(steps, 3, 'sömmen (180,50 → 180,62) är borta, de andra tre kanterna finns kvar');
  const pts = ctx.parts.flat().map(([x, y]) => `${Math.round(x)},${Math.round(y)}`);
  assert.ok(pts.includes(`${Math.round(X(180))},${Math.round(Y(50))}`) && pts.includes(`${Math.round(X(180))},${Math.round(Y(62))}`), 'sömmens ändpunkter finns kvar som ändar på linjerna');
  let longest = 0;
  for (const part of ctx.parts) for (let i = 1; i < part.length; i++) longest = Math.max(longest, Math.hypot(part[i][0] - part[i - 1][0], part[i][1] - part[i - 1][1]));
  assert.ok(longest < W / 4, 'ingen linje går tvärs över kartan');
});

test('skipSeams ändrar inte fyllningen och inte en ring utan söm', () => {
  const plain = recorder(), skip = recorder(), ring = [[10, 50], [30, 50], [30, 60], [10, 60], [10, 50]];
  traceRing(plain, ring, X, Y);
  traceRing(skip, ring, X, Y, true);
  assert.deepEqual(skip.parts, plain.parts, 'utan söm lägger skipSeams ringen som förut');
  const fill = recorder(); // fyllningens bana (tracePath utan skipSeams) har sömmen med: ringen är sluten
  fill.beginPath = () => {};
  tracePath(fill, { type: 'Polygon', coordinates: [east] }, X, Y);
  assert.deepEqual(lines(fill.parts), [5], 'en sluten ring med alla fem punkterna');
});

test('en söm mitt i ringen: linjen börjar efter sömmen så att den inte klipps vid ringens början', () => {
  const ctx = recorder();
  const ring = [[170, 50], [175, 55], [180, 60], [180, 52], [175, 48], [170, 50]]; // sömmen är 180,60 → 180,52
  traceRing(ctx, ring, X, Y, true);
  assert.equal(ctx.parts.length, 2, 'en lång linje och den ensamma slutpunkten efter sömmen');
  assert.equal(ctx.parts[0].length, 5, 'från 180,52 runt hela ringen till 180,60: fem punkter');
  const first = ctx.parts[0][0], last = ctx.parts[0].at(-1);
  assert.equal(Math.round(first[0]), Math.round(X(180)));
  assert.equal(Math.round(first[1]), Math.round(Y(52)));
  assert.equal(Math.round(last[1]), Math.round(Y(60)));
});

test('strokeEdge: en geometri utan söm strokas ur banan som är lagd, med söm ur en egen bana utan sömmen', () => {
  const calls = [];
  const paths = [];
  globalThis.Path2D = class { constructor() { this.parts = recorder(); this.moveTo = this.parts.moveTo; this.lineTo = this.parts.lineTo; this.closePath = () => {}; paths.push(this); } };
  try {
    const ctx = { stroke: (...a) => calls.push(a) };
    strokeEdge(ctx, { type: 'Polygon', coordinates: [[[10, 50], [30, 50], [30, 60], [10, 50]]] }, X, Y);
    assert.deepEqual(calls, [[]], 'utan söm: ctx.stroke() ur den lagda banan, ingen ny bana');
    assert.equal(paths.length, 0);
    strokeEdge(ctx, geometry, X, Y);
    assert.equal(calls.length, 2);
    assert.equal(calls[1][0], paths[0], 'med söm: strokar den nya banan');
    assert.equal(paths[0].parts.parts.reduce((n, p) => n + p.length - 1, 0), 6, 'sex kanter (tre per del), de två sömmarna är borta');
  } finally { delete globalThis.Path2D; }
});
