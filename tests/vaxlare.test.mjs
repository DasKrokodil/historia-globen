// Växlaren mellan tidsreglagen (#1959, docs/beslut/2026-11-19-vaxlaren-a2-1959.md): vilket år man landar på när man byter reglage,
// att bytet är ett vanligt årsbyte (tidslåset gäller) och att namnen på växlarens knappar är reglagens egna. Provet kör Timeline
// utan webbläsare, med ritningen utbytt (som tests/tva-reglage.test.mjs). Körs på svenska (språket är fast vid import).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Timeline, HUMAN_SCALES, scaleText, scaleTextFull, segmentAt, MIN_YEAR, MAX_YEAR } from '../js/timeline.js';
import { scaleEntryYear } from '../js/time-scale.js';

const [PRE, HISTORY] = HUMAN_SCALES;

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
  return new WithoutDrawing({ track, stepBtns: HISTORY.steps.map(button), speedBtn: button(), playBtn: Object.assign(button(), { setAttribute() {} }) });
}

test('ingångsåret är kanten närmast: första året i ett reglage längre fram, sista året i ett reglage före', () => {
  assert.equal(scaleEntryYear(HISTORY, PRE), -2999);
  assert.equal(scaleEntryYear(PRE, HISTORY), -3000);
  // inget år delas och inget hoppas över: ingångsåren är gränsåren som ett enstaka steg över gränsen når
  assert.equal(scaleEntryYear(HISTORY, PRE), PRE.to + 1);
  assert.equal(scaleEntryYear(PRE, HISTORY), HISTORY.from - 1);
});

test('byte via växlaren landar på samma år som steget över gränsen, åt båda hållen, oavsett var man stod', t => {
  const timeline = build(t);
  for (const from of [MIN_YEAR, -50000, -10001, -3500, -3000]) {
    timeline.year = from;
    assert.equal(timeline.scale, PRE);
    assert.equal(timeline.goToScale(HISTORY), -2999, `från ${from}`);
    assert.equal(timeline.scale, HISTORY);
    assert.equal(timeline.stepFrom(-3000, 1), -2999);
  }
  for (const from of [-2999, -2000, 0, 1325, MAX_YEAR]) {
    timeline.year = from;
    assert.equal(timeline.scale, HISTORY);
    assert.equal(timeline.goToScale(PRE), -3000, `från ${from}`);
    assert.equal(timeline.scale, PRE);
    assert.equal(timeline.stepFrom(-2999, -1), -3000);
  }
});

test('att byta till reglaget man redan står på, ett okänt reglage eller medan tiden är låst ändrar ingenting', t => {
  const timeline = build(t);
  timeline.year = 1325;
  assert.equal(timeline.goToScale(HISTORY), null);
  assert.equal(timeline.goToScale({ id: 'annat', from: 0, to: 1 }), null);
  assert.equal(timeline.year, 1325);
  timeline.lock = () => ({ locked: true }); // en tur styr tiden (#1322)
  assert.equal(timeline.goToScale(PRE), null);
  assert.equal(timeline.year, 1325);
  assert.equal(timeline.scale, HISTORY);
});

test('i en lektion gör en dörr som skulle landa utanför lektionens år ingenting: varken år eller reglage ändras', t => {
  const timeline = build(t);
  timeline.year = 1325;
  timeline.lock = () => ({ locked: false, from: 1000, to: 1500 });
  assert.equal(timeline.goToScale(PRE), null); // -3000 ligger utanför lektionens år
  assert.equal(timeline.year, 1325);
  assert.equal(timeline.scale, HISTORY);
  // ligger lektionens år på båda sidor om gränsen går bytet, till ingångsåret
  timeline.lock = () => ({ locked: false, from: -3500, to: -2500 });
  timeline.year = -3300;
  assert.equal(timeline.goToScale(HISTORY), -2999);
  assert.equal(timeline.scale, HISTORY);
  assert.equal(timeline.goToScale(PRE), -3000);
  // ingångsåret precis utanför: -2999 ligger utanför ett lås som slutar vid -3000
  timeline.lock = () => ({ locked: false, from: -3500, to: -3000 });
  timeline.year = -3200;
  assert.equal(timeline.goToScale(HISTORY), null);
  assert.equal(timeline.year, -3200);
});

test('knapparnas namn är reglagens egna, med stor bokstav, och samma i skalraden', t => {
  const timeline = build(t);
  assert.equal(timeline.scaleName(PRE), 'Före 3000 f.Kr.');
  assert.equal(timeline.scaleName(HISTORY), '3000 f.Kr.–i dag');
  // skalraden säger i text vilket reglage man är på
  const here = scaleText(-50000, null, PRE, timeline.scaleName(PRE));
  assert.match(here, /^Före 3000 f\.Kr\.: en tiondel ≈ /);
  assert.match(scaleText(1325, null, HISTORY, timeline.scaleName(HISTORY)), /^3000 f\.Kr\.–i dag: en tiondel ≈ /);
  // vid en skarv står den vanliga raden kvar (reglaget är detsamma, och raden ryms i 400 px)
  assert.match(scaleText(1325, segmentAt(500), HISTORY, timeline.scaleName(HISTORY)), /^Ny skala: /);
  // utan namn (en enda skala) är texten som förut
  assert.match(scaleText(1325), /^Här är en tiondel av tidslinjen ≈ /);
  assert.ok(scaleTextFull(1325, segmentAt(500)));
});

test('en tidslinje med ett enda reglage har inget namn och ingen växlare att fylla', t => {
  const previous = globalThis.addEventListener;
  globalThis.addEventListener = () => {};
  t.after(() => { if (previous) globalThis.addEventListener = previous; else delete globalThis.addEventListener; });
  const track = Object.assign(button(), { classList: classList(), setAttribute() {}, removeAttribute() {}, offsetWidth: 0 });
  const one = new WithoutDrawing({ track, stepBtns: HISTORY.steps.map(button), speedBtn: button(), playBtn: Object.assign(button(), { setAttribute() {} }) }, HISTORY);
  assert.equal(one.scaleName(HISTORY), '');
});

test('nya texter finns på alla fem språken: gruppnamnet, skalraden med reglagets namn och hjälpen nämner knapparna', () => {
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    const ui = JSON.parse(readFileSync(new URL(`../data/ui/${lang}.json`, import.meta.url), 'utf8'));
    assert.ok(ui['time.switchLabel']?.length > 3, `${lang}: time.switchLabel`);
    for (const ph of ['{name}', '{n}']) assert.ok(ui['scale.hereIn']?.includes(ph), `${lang}: scale.hereIn saknar ${ph}`);
    assert.ok(ui['help.s5t'].length > 200, `${lang}: help.s5t`);
  }
  const sv = JSON.parse(readFileSync(new URL('../data/ui/sv.json', import.meta.url), 'utf8'));
  assert.equal(sv['time.switchLabel'], 'Tidsreglage');
  assert.match(sv['help.s5t'], /Före 3000 f\.Kr\. och 3000 f\.Kr\.–i dag, byter reglage/);
});

test('scaleEntry säger vilket år en dörr landar på, och null när den inte byter reglage (Tillbaka-raden visas bara då, #997)', t => {
  const timeline = build(t);
  timeline.year = -50000;
  assert.equal(timeline.scaleEntry(HISTORY), -2999);
  assert.equal(timeline.scaleEntry(PRE), null); // reglaget man redan står på
  timeline.year = 1325;
  assert.equal(timeline.scaleEntry(PRE), -3000);
  assert.equal(timeline.scaleEntry({ id: 'annat', from: 0, to: 1 }), null);
  timeline.lock = () => ({ locked: true });
  assert.equal(timeline.scaleEntry(PRE), null);
  timeline.lock = () => ({ locked: false, from: 1000, to: 1500 });
  assert.equal(timeline.scaleEntry(PRE), null); // utanför lektionens år
  timeline.lock = () => null;
  timeline.focus = { from: 1900, to: 1950, fine: false };
  assert.equal(timeline.scaleEntry(PRE), null); // Fokus har egen skala
  timeline.focus = null;
  // goToScale gör exakt det scaleEntry säger
  assert.equal(timeline.goToScale(PRE), -3000);
  assert.equal(timeline.goToScale(HISTORY), -2999);
});
