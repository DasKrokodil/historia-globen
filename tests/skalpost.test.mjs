// Skalposten (#1511): en instans ska använda posten den får, medan domängränserna och de gamla API:erna består.
import test from 'node:test';
import assert from 'node:assert/strict';
import { HUMAN_SCALE } from '../js/time-scale.js';
import { RESOLUTION, stepAt, roundToStep } from '../js/model.js';
import { Timeline, SEGMENTS, SEAMS, yearToPos, posToYear, windowEdges } from '../js/timeline.js';
import { MIN_YEAR, MAX_YEAR } from '../js/state.js';
import { decodeHash } from '../js/url-state.js';

// En avsiktligt annan testpost, inte en registrerad domän eller en ny skala i gränssnittet.
const fixture = {
  ...HUMAN_SCALE, from: -99, to: 0,
  segments: [{ from: -99, to: 0, a: 0, b: 1 }], ticks: [[-99, 1], [0, 1]], seams: [],
  resolution: [{ to: -1, step: 10 }, { to: Infinity, step: 1 }],
  steps: [-2, -1, 1, 2], speeds: [2, 4], defaultSpeed: 2,
};

test('gamla exporter är samma värden ur människans enda skalpost', () => {
  assert.equal(SEGMENTS, HUMAN_SCALE.segments);
  assert.equal(SEAMS, HUMAN_SCALE.seams);
  assert.equal(RESOLUTION, HUMAN_SCALE.resolution);
  assert.equal(HUMAN_SCALE.from, MIN_YEAR);
  assert.equal(HUMAN_SCALE.to, MAX_YEAR);
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
