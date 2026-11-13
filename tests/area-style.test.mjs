// Områden över datumlinjen (#1097): traceRing i js/layers/area-style.js. Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { traceRing } from '../js/layers/area-style.js';

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
