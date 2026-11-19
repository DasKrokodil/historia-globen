// Två reglage för människans tid (#1958, docs/beslut/2026-11-19-tva-reglage-1958.md): "Före 3000 f.Kr." och "3000 f.Kr.–i dag".
// Reglaget som visas räknas ur året, så adressen och gamla länkar fungerar som förut. Gränsen: -3000 (3001 f.Kr.) är sista året i det
// första reglaget och -2999 (3000 f.Kr.) det första i det andra. Provet kör Timeline utan webbläsare, med ritningen utbytt.
// Körs på svenska (språket är fast vid import).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Timeline, HUMAN_SCALES, scaleForYear, spanInScale, segmentAt, SEGMENTS, MIN_YEAR, MAX_YEAR } from '../js/timeline.js';
import { decodeHash } from '../js/url-state.js';
import { timeLock } from '../js/state.js';

const [PRE, HISTORY] = HUMAN_SCALES;

// Bara ritningen och webbläsarens delar ersätts; året, skalvalet, stegen och tangentbordet är Timeline själv.
class WithoutDrawing extends Timeline {
  _drawScale() {} _labelPlay() {} _labelSpeed() {} _labelSteps() {} _render() {} _showScale() {}
}
const button = () => Object.assign(new EventTarget(), { dataset: {} });
const classList = () => { const on = new Set(); return { add: c => on.add(c), remove: c => on.delete(c), toggle: (c, f) => (f ? on.add(c) : on.delete(c)), contains: c => on.has(c) }; };

function build(t) {
  const previous = globalThis.addEventListener;
  globalThis.addEventListener = () => {};
  t.after(() => { if (previous) globalThis.addEventListener = previous; else delete globalThis.addEventListener; });
  const track = Object.assign(button(), { classList: classList(), setAttribute() {}, removeAttribute() {}, offsetWidth: 0 });
  const timeline = new WithoutDrawing({ track, stepBtns: HISTORY.steps.map(button), speedBtn: button(), playBtn: button() });
  return { timeline, track };
}
const key = (track, k, shiftKey = false) => track.dispatchEvent(Object.assign(new Event('keydown'), { key: k, shiftKey }));

test('reglaget räknas ur året: -3000 är sista året före 3000 f.Kr. och -2999 det första i det andra reglaget', () => {
  assert.equal(scaleForYear(MIN_YEAR), PRE);
  assert.equal(scaleForYear(-3001), PRE);
  assert.equal(scaleForYear(-3000), PRE);
  assert.equal(scaleForYear(-2999), HISTORY);
  assert.equal(scaleForYear(-2998), HISTORY);
  assert.equal(scaleForYear(MAX_YEAR), HISTORY);
  // delen året ligger i följer med: gränsåren hör till de delar som är reglagets första och sista
  assert.equal(segmentAt(-3000), PRE.segments[1]);
  assert.equal(segmentAt(-2999), HISTORY.segments[0]);
  assert.equal(segmentAt(-10000), PRE.segments[0]); // 10 001 f.Kr.: sista året i den första delen, som upplösningen
  assert.equal(segmentAt(-9999), PRE.segments[1]);  // 10 000 f.Kr.
});

test('gamla länkar och y= fungerar som förut: adressen bär bara året', t => {
  for (const [y, id] of [[-2999, 'human-history'], [-3000, 'human-pre'], [-99999, 'human-pre'], [1325, 'human-history'], [-9999, 'human-pre']]) {
    assert.equal(decodeHash(`#y=${y}`).year, y);
    const { timeline } = build(t);
    timeline.year = y;
    assert.equal(timeline.year, y);
    assert.equal(timeline.scale.id, id, `y=${y}`);
  }
  // ingen annan del av adressen säger vilket reglage som visas
  assert.deepEqual(Object.keys(decodeHash('#y=-5000')).filter(k => /scale|track|reglage/i.test(k)), []);
});

test('gränsåret: -2999 visas som 3000 f.Kr. i det historiska reglaget och -3000 som 3000 f.Kr. (avrundat) i det första', t => {
  const { timeline } = build(t);
  timeline.year = -2999;
  assert.equal(timeline.scale, HISTORY);
  assert.equal(timeline.format(-2999).replace(/\s/g, ' '), '3000 f.Kr.');
  timeline.year = -3000;
  assert.equal(timeline.scale, PRE);
  assert.equal(timeline.format(-3000).replace(/\s/g, ' '), '3000 f.Kr.'); // upplösningen avrundar till hundratal; året i tillståndet är -3000
  assert.equal(timeline.year, -3000);
});

test('ett drag byter aldrig reglage: pointermove klipps vid det synliga reglagets kant', t => {
  const { timeline } = build(t);
  timeline.year = -5000;
  const first = timeline.scale;
  for (let p = 0; p <= 1; p += 0.01) {
    const y = timeline.toYear(p);
    assert.ok(y >= PRE.from && y <= PRE.to, `läge ${p}: ${y} ligger utanför reglaget`);
  }
  assert.equal(timeline.toYear(1), -3000); // högra kanten är reglagets sista år, inte -2999 (som avrundningen annars ger)
  assert.equal(timeline.toYear(0), MIN_YEAR);
  assert.equal(timeline.scale, first);
  timeline.year = 1325;
  for (let p = 0; p <= 1; p += 0.01) {
    const y = timeline.toYear(p);
    assert.ok(y >= HISTORY.from && y <= HISTORY.to, `läge ${p}: ${y}`);
  }
  assert.equal(timeline.toYear(0), -2999);
  assert.equal(timeline.toYear(1), MAX_YEAR);
  // ett drag som sätter året med setByUser stannar därför i reglaget
  timeline.year = -5000;
  timeline.setByUser(timeline.toYear(1));
  assert.equal(timeline.scale, PRE);
  assert.equal(timeline.year, -3000);
});

test('steg, piltangenter och stegknappar går över gränsen utan stopp, åt båda hållen', t => {
  const { timeline, track } = build(t);
  timeline.year = -2999;
  key(track, 'ArrowLeft');                 // −1 steg från 3000 f.Kr.: bakåt över gränsen räknas med den grövre upplösningen (100 år)
  assert.equal(timeline.year, -3099);
  assert.equal(timeline.scale, PRE);
  key(track, 'ArrowRight');                // +1 steg tillbaka: till 3000 f.Kr., första året i det historiska reglaget
  assert.equal(timeline.year, -2999);
  assert.equal(timeline.scale, HISTORY);
  key(track, 'PageDown');                  // hundra steg bakåt (10 000 år) hoppar över hela det första reglagets slut
  assert.ok(timeline.year < -9999 && timeline.scale === PRE);
  assert.equal(timeline.stepFrom(-3099, 1), -2999);
  assert.equal(timeline.stepFrom(-3099, 10), -2099);
  assert.equal(timeline.stepFrom(-2999, -10), -3999);
  assert.equal(timeline.stepFrom(-3000, 1), -2900); // från reglagets sista år: 100 år framåt
});

test('Home och End går till ändarna av reglaget som syns, inte till domänens', t => {
  const { timeline, track } = build(t);
  timeline.year = 1325;
  key(track, 'Home');
  assert.equal(timeline.year, -2999);
  assert.equal(timeline.scale, HISTORY);
  key(track, 'End');
  assert.equal(timeline.year, MAX_YEAR);
  timeline.year = -5000;
  key(track, 'End');
  assert.equal(timeline.year, -3000);
  assert.equal(timeline.scale, PRE);
  key(track, 'Home');
  assert.equal(timeline.year, MIN_YEAR);
});

test('uppspelningens slut är slutet av allt, inte slutet av reglaget som syns', t => {
  const { timeline } = build(t);
  timeline.year = -3000; // reglagets sista år i förhistorien: Spela igen ska inte visas, uppspelningen fortsätter över gränsen
  assert.equal(timeline.atEnd, false);
  timeline.year = MAX_YEAR;
  assert.equal(timeline.atEnd, true);
  // skärmläsarens "för cirka N år sedan" räknas från i dag, också i det första reglaget
  timeline.year = -50000;
  assert.match(timeline.valueText(-50000).replace(/\s/g, ' '), /50 000 f\.Kr\., för cirka 52 000 år sedan/);
});

test('tidslåset gäller också bytet av reglage (#1322): låst, och i en lektion inom lektionens år', t => {
  const { timeline } = build(t);
  timeline.year = -2999;
  timeline.lock = () => ({ locked: true });
  timeline.setByUser(timeline.stepFrom(-2999, -1));
  assert.equal(timeline.year, -2999);
  assert.equal(timeline.scale, HISTORY);
  // en lektion med år på båda sidor om gränsen får gå över den, men aldrig utanför sina år
  timeline.lock = () => timeLock([{ mode: 'lektion' }], [-3500, -2500]);
  assert.deepEqual(timeline.lock(), { locked: false, from: -3500, to: -2500 });
  timeline.setByUser(-3099);
  assert.equal(timeline.year, -3099);
  assert.equal(timeline.scale, PRE);
  timeline.setByUser(timeline.stepFrom(-3099, -100)); // −10 000 år: klipps vid lektionens första år
  assert.equal(timeline.year, -3500);
  timeline.setByUser(timeline.stepFrom(-3500, 100));
  assert.equal(timeline.year, -2500);
  assert.equal(timeline.scale, HISTORY);
});

test('byte av reglage: ett meddelande en gång, via ett steg, och skalan och årtalen ritas för det nya reglaget', t => {
  const { timeline } = build(t);
  const swaps = [];
  timeline.addEventListener('scalechange', e => swaps.push(e.detail.to.id));
  timeline.year = -2999;
  timeline.setByUser(-3099);
  assert.deepEqual(swaps, ['human-pre']);
  const note = timeline.takeStepNote();
  assert.match(note, /Tidslinjen visar nu före 3000 f\.Kr\./);
  assert.equal(timeline.takeStepNote(), '', 'meddelandet läses en gång');
  timeline.setByUser(-4000); // inom samma reglage: inget nytt byte
  assert.deepEqual(swaps, ['human-pre']);
  timeline.setByUser(-2999);
  assert.deepEqual(swaps, ['human-pre', 'human-history']);
  assert.match(timeline.takeStepNote(), /Tidslinjen visar nu 3000 f\.Kr\.–i dag/);
});

test('spann som slutar på gränsåret hör till båda reglagen, med regeln spanInScale (#1958)', () => {
  // Reglagen delar inget år: ett spann hör till reglaget om något av dess år gör det
  assert.equal(spanInScale(-12599, -2999, PRE), true);     // den-grona-sahara: slutar 3000 f.Kr.
  assert.equal(spanInScale(-12599, -2999, HISTORY), true); // ... och ritas som en punkt vid det historiska reglagets början
  assert.equal(spanInScale(-5000, -3000, PRE), true);
  assert.equal(spanInScale(-5000, -3000, HISTORY), false); // slutar -3000: bara i det första
  assert.equal(spanInScale(-2999, -2999, PRE), false);     // börjar -2999: bara i det historiska
  assert.equal(spanInScale(-2999, -2999, HISTORY), true);
  assert.equal(spanInScale(-3999, 500, PRE), true);        // ett spann över gränsen hör till båda
  assert.equal(spanInScale(-3999, 500, HISTORY), true);
  // De som finns i datan (data/events.json byggs ur data/handelser/): spannen som slutar exakt -2999 och började tidigare
  const { events } = JSON.parse(readFileSync(new URL('../data/events.json', import.meta.url), 'utf8'));
  const ending = events.filter(e => e.end === -2999 && e.start < -2999);
  assert.ok(ending.length >= 4 && ending.some(e => e.id === 'den-grona-sahara'), `fann ${ending.map(e => e.id)}`);
  for (const e of ending) {
    assert.equal(spanInScale(e.start, e.end, PRE), true, e.id);
    assert.equal(spanInScale(e.start, e.end, HISTORY), true, e.id);
  }
  // Varje händelse som börjar i domänen hör till minst ett reglage; ingen går förlorad vid gränsen
  for (const e of events) if (e.end >= MIN_YEAR && e.start <= MAX_YEAR) assert.ok(HUMAN_SCALES.some(p => spanInScale(e.start, e.end, p)), e.id);
});

test('hjälpen nämner reglagens gräns men säger inte att förhistorien slutar där (#1958)', () => {
  const words = /förhistori|prehistor|vorgeschicht|préhistoire/i;
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    const d = JSON.parse(readFileSync(new URL(`../data/ui/${lang}.json`, import.meta.url), 'utf8'));
    for (const k of ['help.s5', 'help.s5t', 'time.trackFirst', 'time.trackLast', 'time.trackLabel', 'time.trackNow', 'panel.emptyPrehistory']) assert.equal(typeof d[k], 'string', `${lang}: ${k}`);
    assert.doesNotMatch(d['help.s5t'], words, `${lang}: hjälpen påstår något om förhistorien`);
    assert.match(d['help.s5t'], /3000/, `${lang}: hjälpen nämner gränsen`);
    for (const k of ['time.trackFirst', 'time.trackLast']) assert.match(d[k], /\{(to|from)\}/, `${lang}: ${k}`);
  }
});

test('alla delar finns kvar: sex delar i två reglage', () => {
  assert.equal(SEGMENTS.length, 6);
});
