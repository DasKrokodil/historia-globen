// Skalposten (#1511): en instans ska använda posten den får, medan domängränserna och de gamla API:erna består.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HUMAN_SCALE, HUMAN_SCALES } from '../js/time-scale.js';
import { RESOLUTION, stepAt, roundToStep } from '../js/model.js';
import { Timeline, SEGMENTS, SEAMS, yearToPos, posToYear, windowEdges, segmentLabel, yearsPerTenth } from '../js/timeline.js';
import { MIN_YEAR, MAX_YEAR } from '../js/state.js';
import { decodeHash } from '../js/url-state.js';

// En avsiktligt annan testpost, inte en registrerad domän eller en ny skala i gränssnittet.
const fixture = {
  ...HUMAN_SCALE, from: -99, to: 0,
  segments: [{ from: -99, to: 0, a: 0, b: 1 }], ticks: [[-99, 1], [0, 1]], seams: [],
  resolution: [{ to: -1, step: 10 }, { to: Infinity, step: 1 }],
  steps: [-2, -1, 1, 2], speeds: [2, 4], defaultSpeed: 2,
};

// Ögonblicksbild av människans skala (#1976). Före #1958 var den en enda post med fem delar (js/timeline.js i 9b856be^); sedan #1958 är
// den två poster, "Före 3000 f.Kr." och "3000 f.Kr.–i dag". Det som inte ändrades (upplösning, steg, fartnivåer, skalstreck från -2999,
// delarnas gränsår och deras inbördes andelar) står kvar som förut; det som ändrades är det avsiktliga och står här i diffen.
const P_OLD = [0.10, 0.10 + 0.65 / 3, 0.10 + 1.30 / 3, 0.75]; // de gamla gränslägena mellan de fem delarna
const [PRE, HISTORY] = HUMAN_SCALES;

test('människans skala: domänen och det reglagen delar är oförändrat', () => {
  assert.deepEqual(HUMAN_SCALE, {
    id: 'human', from: -99999, to: MAX_YEAR,
    resolution: [{ to: -10000, step: 1000 }, { to: -3000, step: 100 }, { to: Infinity, step: 1 }],
    steps: [-100, -10, -1, 1, 10, 100], speeds: [1, 5, 25, 100], defaultSpeed: 25,
  });
  assert.equal(MIN_YEAR, -99999);
  // båda reglagen delar upplösning, steg och fartnivåer med domänen: ett steg över gränsen är samma steg på båda sidor
  for (const post of HUMAN_SCALES) {
    assert.equal(post.resolution, HUMAN_SCALE.resolution);
    assert.deepEqual(post.steps, [-100, -10, -1, 1, 10, 100]);
    assert.deepEqual(post.speeds, [1, 5, 25, 100]);
    assert.equal(post.defaultSpeed, 25);
  }
  assert.equal(PRE.from, HUMAN_SCALE.from);
  assert.equal(HISTORY.to, HUMAN_SCALE.to);
});

test('människans skala: två reglage med sex delar, namn och skalor', () => {
  assert.deepEqual(HUMAN_SCALES.map(p => [p.id, p.from, p.to]), [['human-pre', -99999, -3000], ['human-history', -2999, MAX_YEAR]]);
  assert.equal(PRE.to + 1, HISTORY.from); // -3000 är sista året i det första och -2999 det första i det andra: inget år delas
  assert.deepEqual(PRE.segments, [
    { from: -99999, to: -10000, a: 0, b: 0.5 },
    { from: -10000, to: -3000, a: 0.5, b: 1 },
  ]);
  assert.deepEqual(HISTORY.segments, [
    { from: -2999, to: -500, a: 0, b: 13 / 54 },
    { from: -500, to: 1000, a: 13 / 54, b: 26 / 54 },
    { from: 1000, to: 1800, a: 26 / 54, b: 39 / 54 },
    { from: 1800, to: MAX_YEAR, a: 39 / 54, b: 1 },
  ]);
  assert.deepEqual(SEGMENTS.map(s => segmentLabel(s)), [
    '100 000–10 000 f.Kr.', '10 000–3000 f.Kr.', '3000–500 f.Kr.', '500 f.Kr.–1000', '1000–1800', 'sedan 1800',
  ]);
  assert.deepEqual(SEGMENTS.map(yearsPerTenth), [18000, 1400, 1000, 620, 330, 81]);
  // De historiska delarna har samma gränsår och inbördes andelar som förut (fyra av de gamla fem delarna); modern tid fick fler pixlar per år (#49)
  const old = [[-2999, -500, 0.10, P_OLD[1]], [-500, 1000, P_OLD[1], P_OLD[2]], [1000, 1800, P_OLD[2], P_OLD[3]], [1800, MAX_YEAR, P_OLD[3], 1]];
  HISTORY.segments.forEach((s, i) => {
    assert.deepEqual([s.from, s.to], old[i].slice(0, 2));
    assert.ok(Math.abs((s.b - s.a) - (old[i][3] - old[i][2]) / 0.9) < 1e-12, `del ${i}: andelen av reglaget`);
  });
  const perYear = s => (s.b - s.a) / (s.to - s.from);
  assert.ok(perYear(HISTORY.segments.at(-1)) > (1 - 0.75) / (MAX_YEAR - 1800), 'modern tid får fler pixlar per år än i det gamla reglaget');
  // varje reglage fyller sin bredd utan glapp
  for (const post of HUMAN_SCALES) {
    assert.equal(post.segments[0].a, 0);
    assert.equal(post.segments.at(-1).b, 1);
    post.segments.slice(1).forEach((s, i) => assert.equal(s.a, post.segments[i].b));
  }
});

test('människans skala: skalstreck, skarvarnas årtal och minsta fönster', () => {
  assert.deepEqual(PRE.ticks, [
    [-99999, 1], [-79999, 3], [-59999, 2], [-39999, 3], [-19999, 2], [-9999, 1], [-7999, 2], [-4999, 2], [-3000, 1],
  ]);
  assert.deepEqual(HISTORY.ticks, [
    [-2999, 1], [-1999, 2], [-999, 3], [-499, 2], [1, 1], [500, 2], [1000, 1],
    [1200, 3], [1400, 2], [1600, 3], [1800, 1], [1900, 2], [1950, 3], [2000, 1],
  ]);
  // skalstrecken från förut finns kvar (utom det som låg i förhistorien)
  for (const [y] of [[-1999], [-999], [-499], [1], [500], [1000], [1200], [1400], [1600], [1800], [1900], [1950], [2000]]) assert.ok(HISTORY.ticks.some(t => t[0] === y), `skalstrecket ${y}`);
  assert.deepEqual(PRE.seams.map(s => ({ at: s.at, year: s.year })), [{ at: 0.5, year: -9999 }]);
  assert.deepEqual(HISTORY.seams.map(s => ({ at: s.at, year: s.year })), [
    { at: 13 / 54, year: -499 }, { at: 26 / 54, year: 1000 }, { at: 39 / 54, year: 1800 },
  ]);
  for (const post of HUMAN_SCALES) post.seams.forEach((seam, i) => {
    assert.equal(seam.before, post.segments[i]);
    assert.equal(seam.after, post.segments[i + 1]);
  });
  assert.deepEqual(PRE.windowMin, [{ to: -10000, years: 10000 }]);
  assert.equal(HISTORY.windowMin, undefined);
  // de gamla exporterna ger samma värden som posterna
  assert.deepEqual(SEGMENTS, HUMAN_SCALES.flatMap(p => p.segments));
  assert.deepEqual(SEAMS, HUMAN_SCALES.flatMap(p => p.seams));
  assert.deepEqual(RESOLUTION, HUMAN_SCALE.resolution);
});

test('stegknapparnas tal i index.html är samma som skalpostens (stegen står bara på ett ställe i koden)', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const steps = [...html.matchAll(/<button class="step" type="button" data-step="(-?\d+)"/g)].map(m => Number(m[1]));
  assert.deepEqual(steps, HUMAN_SCALE.steps);
});

test('js/url-state.js importerar varken timeline.js eller time-scale.js (#1511)', () => {
  const source = readFileSync(new URL('../js/url-state.js', import.meta.url), 'utf8');
  const imports = [...source.matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s+['"]([^'"]+)['"]/gm)].map(m => m[1])
    .concat([...source.matchAll(/\bimport\(\s*['"]([^'"]+)['"]/g)].map(m => m[1]));
  assert.ok(imports.length > 0, 'provet hittar importerna');
  assert.ok(imports.includes('./state.js'), 'gränserna kommer från state.js');
  for (const path of imports) assert.doesNotMatch(path, /timeline|time-scale/, `url-state.js importerar ${path}`);
});

test('år, läge, fönster och upplösning kan räknas ur en annan post utan att domängränsen ändras', () => {
  assert.equal(yearToPos(-99, fixture), 0);
  assert.equal(yearToPos(0, fixture), 1);
  assert.equal(posToYear(0.5, fixture), -49);
  assert.equal(stepAt(-49, fixture), 10);
  assert.equal(roundToStep(-45, fixture), -49);
  const edges = windowEdges(-49, 0.1, fixture);
  assert.ok(Math.abs(edges.before - 9.9) < 1e-10);
  assert.ok(Math.abs(edges.after - 9.9) < 1e-10);
  assert.equal(decodeHash(`#y=${MIN_YEAR}`).year, MIN_YEAR);
  assert.equal(decodeHash(`#y=${MAX_YEAR}`).year, MAX_YEAR);
});

// Bara ritningen ersätts; konstruktor, händelsekopplingar, steg, fart och årssättning är Timeline själv.
class WithoutDrawing extends Timeline {
  _drawScale() {} _labelPlay() {} _labelSpeed() {} _labelSteps() {} _render() {} _showScale() {}
}
const button = () => Object.assign(new EventTarget(), { dataset: {} });

test('Timeline använder den mottagna postens gränser, steg och fartnivåer', t => {
  const previous = globalThis.addEventListener;
  globalThis.addEventListener = () => {};
  t.after(() => { if (previous) globalThis.addEventListener = previous; else delete globalThis.addEventListener; });
  const steps = fixture.steps.map(button), speedBtn = button(), track = button();
  const timeline = new WithoutDrawing({ track, stepBtns: steps, speedBtn, playBtn: button() }, fixture);
  assert.equal(timeline.scale, fixture);
  assert.deepEqual(steps.map(b => Number(b.dataset.step)), fixture.steps);
  assert.equal(timeline.year, fixture.to);
  timeline.year = -49;
  assert.equal(timeline.stepUnit, 10);
  assert.equal(timeline.stepFrom(-49, 1), -39);
  assert.equal(timeline.toYear(0.5), -49);
  assert.equal(timeline.yearsPerSecond, 20);
  assert.deepEqual(timeline.windowSpan(-49), windowEdges(-49, 0.012, fixture));
  speedBtn.dispatchEvent(new Event('click'));
  assert.equal(timeline.yearsPerSecond, 40);
  timeline.year = MIN_YEAR;
  assert.equal(timeline.year, fixture.from);
  timeline.year = MAX_YEAR;
  assert.equal(timeline.year, fixture.to);
});
