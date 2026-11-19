// Skalposten (#1511): en instans ska använda posten den får, medan domängränserna och de gamla API:erna består.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HUMAN_SCALE } from '../js/time-scale.js';
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

// Ögonblicksbild av människans skala (#1976): värdena är de som gällde före #1511 (js/timeline.js i 9b856be^) och som
// gäller på main i dag. Ändras en rad här avsiktligt (till exempel av två skalposter, #1958) ska ändringen synas i diffen.
test('människans skala: segment, namn, gränser och lägen är oförändrade', () => {
  const P1 = 0.10, P2 = 0.10 + 0.65 / 3, P3 = 0.10 + 1.30 / 3;
  assert.equal(HUMAN_SCALE.id, 'human');
  assert.equal(HUMAN_SCALE.from, -99999);
  assert.equal(HUMAN_SCALE.to, MAX_YEAR);
  assert.equal(MIN_YEAR, -99999);
  assert.deepEqual(HUMAN_SCALE.segments, [
    { from: -99999, to: -2999, a: 0, b: P1 },
    { from: -2999, to: -500, a: P1, b: P2 },
    { from: -500, to: 1000, a: P2, b: P3 },
    { from: 1000, to: 1800, a: P3, b: 0.75 },
    { from: 1800, to: MAX_YEAR, a: 0.75, b: 1 },
  ]);
  assert.deepEqual(HUMAN_SCALE.segments.map(s => segmentLabel(s)), [
    '100 000–3000 f.Kr.', '3000–500 f.Kr.', '500 f.Kr.–1000', '1000–1800', 'sedan 1800',
  ]);
  assert.deepEqual(HUMAN_SCALE.segments.map(yearsPerTenth), [97000, 1200, 690, 370, 90]);
  // delarna fyller reglaget utan glapp
  assert.equal(HUMAN_SCALE.segments[0].a, 0);
  assert.equal(HUMAN_SCALE.segments.at(-1).b, 1);
  HUMAN_SCALE.segments.slice(1).forEach((s, i) => assert.equal(s.a, HUMAN_SCALE.segments[i].b));
});

test('människans skala: skalstreck, skarvarnas årtal, upplösning, steg och fartnivåer', () => {
  assert.deepEqual(HUMAN_SCALE.ticks, [
    [-99999, 1], [-49999, 3], [-2999, 2], [-1999, 2], [-999, 3], [-499, 2], [1, 1], [500, 2], [1000, 1],
    [1200, 3], [1400, 2], [1600, 3], [1800, 1], [1900, 2], [1950, 3], [2000, 1],
  ]);
  assert.deepEqual(HUMAN_SCALE.seams.map(s => ({ at: s.at, year: s.year })), [
    { at: 0.1, year: -2999 },
    { at: 0.10 + 0.65 / 3, year: -499 },
    { at: 0.10 + 1.30 / 3, year: 1000 },
    { at: 0.75, year: 1800 },
  ]);
  HUMAN_SCALE.seams.forEach((seam, i) => {
    assert.equal(seam.before, HUMAN_SCALE.segments[i]);
    assert.equal(seam.after, HUMAN_SCALE.segments[i + 1]);
  });
  assert.deepEqual(HUMAN_SCALE.resolution, [{ to: -10000, step: 1000 }, { to: -3000, step: 100 }, { to: Infinity, step: 1 }]);
  assert.deepEqual(HUMAN_SCALE.steps, [-100, -10, -1, 1, 10, 100]);
  assert.deepEqual(HUMAN_SCALE.speeds, [1, 5, 25, 100]);
  assert.equal(HUMAN_SCALE.defaultSpeed, 25);
  // de gamla exporterna ger samma värden som posten
  assert.deepEqual(SEGMENTS, HUMAN_SCALE.segments);
  assert.deepEqual(SEAMS, HUMAN_SCALE.seams);
  assert.deepEqual(RESOLUTION, HUMAN_SCALE.resolution);
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
