// En exakt daterad period är inte historisk osäkerhet (#364).
import test from 'node:test';
import { MIN_YEAR } from '../js/state.js';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { uncertaintyRow, mythsHtml, emptyCause, emptyTextKey, beforeTimelineStart, overviewCount, panelTimeGroup } from '../js/ui/panel.js';

const events = JSON.parse(readFileSync(new URL('../data/events.json', import.meta.url))).events;

test('en exakt tidsperiod får ingen osäkerhetsrad', () => {
  const event = events.find(item => item.id === 'andra-slaget-i-hakatabukten');
  assert.ok(event, 'testhändelsen ska finnas i data');
  assert.equal(event.edtf, '1281-06/1281-08');
  assert.equal(uncertaintyRow(event), '');
});

// Vanliga missuppfattningar i faktarutan (#838)

const myth = {
  id: 'prov', events: ['x'], review: 'two-sources', sources: ['a', 'saknas'],
  claim: { sv: 'Påstående <b>fet</b>' }, truth: { sv: 'Sanningen' }, origin: { sv: 'Ursprunget' },
};
const srcs = { a: { id: 'a', title: 'Källan A', url: 'https://example.org/a' } };

test('missuppfattningen visar påstående, sanning, ursprung och källa, och undflyr HTML', () => {
  const html = mythsHtml([myth], srcs);
  assert.match(html, /data-myth="prov"/);
  assert.match(html, /Påstående &lt;b&gt;fet&lt;\/b&gt;/);
  assert.ok(!html.includes('<b>fet</b>'), 'texten ska inte tolkas som HTML');
  assert.match(html, /Sanningen/);
  assert.match(html, /<details class="myth-origin">[\s\S]*Ursprunget/);
  assert.match(html, /href="https:\/\/example\.org\/a"/);
  assert.ok(!/saknas/.test(html.replace(/detail\.sourceMissing/g, '')), 'ett okänt källa-id ska hoppas över');
  assert.match(html, /review-badge two/);
});

test('missuppfattningen ritas inte medan källorna laddas eller när listan är tom', () => {
  assert.equal(mythsHtml([myth], srcs, true), '');
  assert.equal(mythsHtml([], srcs), '');
  assert.equal(mythsHtml(undefined, srcs), '');
});

// Varför listan är tom (#886)

test('tom lista: alla kategorier av ger filters, ett tomt år ger year, och en lista med träffar ger null', () => {
  assert.equal(emptyCause({ visibleCount: 0, filters: new Set() }), 'filters');
  assert.equal(emptyCause({ visibleCount: 0, filters: new Set(['krig']) }), 'year');
  assert.equal(emptyCause({ visibleCount: 3, filters: new Set() }), null);
  assert.equal(emptyCause({ visibleCount: 3, filters: new Set(['krig']) }), null);
});

// Meningen för tom lista (#1958): före 3000 f.Kr. säger den "Inga fynd i vår data", men ett kategorifilter förklaras alltid först
test('tom lista: texten följer orsaken, och förhistorien får sin egen mening när det är året som är tomt', () => {
  assert.equal(emptyTextKey({ cause: 'year' }), 'panel.empty');
  assert.equal(emptyTextKey({ cause: 'year', prehistory: true }), 'panel.emptyPrehistory');
  assert.equal(emptyTextKey({ cause: 'filters', prehistory: true }), 'panel.filtersOff');
  assert.equal(emptyTextKey({ cause: 'some', prehistory: true }), 'panel.filtersSome');
});

// Några kategorier av och noll träffar (#1304): bara när antalet kategorier som finns är känt
test('tom lista: några men inte alla kategorier av ger some, alla på ger year', () => {
  assert.equal(emptyCause({ visibleCount: 0, filters: new Set(['krig']), total: 3 }), 'some');
  assert.equal(emptyCause({ visibleCount: 0, filters: new Set(['krig', 'sport']), total: 3 }), 'some');
  assert.equal(emptyCause({ visibleCount: 0, filters: new Set(['krig', 'sport', 'natur']), total: 3 }), 'year');
  assert.equal(emptyCause({ visibleCount: 0, filters: new Set(), total: 3 }), 'filters');
  assert.equal(emptyCause({ visibleCount: 2, filters: new Set(['krig']), total: 3 }), null);
  assert.equal(emptyCause({ visibleCount: 0, filters: new Set(['krig']), total: null }), 'year');
});

test('texterna för avstängda kategorier finns på alla fem språken (#886, #1304)', async () => {
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    const ui = JSON.parse(readFileSync(new URL(`../data/ui/${lang}.json`, import.meta.url)));
    for (const key of ['panel.filtersOff', 'panel.filtersOffHelp', 'panel.filtersSome', 'panel.filtersSomeHelp', 'panel.showAllCategories']) {
      assert.ok(typeof ui[key] === 'string' && ui[key].length > 5, `${lang}: ${key}`);
    }
  }
});

// Händelser som börjar före tidslinjens första år får en rad i faktarutan (#942)
test('beforeTimelineStart: före, vid och efter tidslinjens början', () => {
  assert.equal(beforeTimelineStart({ start: MIN_YEAR - 1 }), true);
  assert.equal(beforeTimelineStart({ start: MIN_YEAR }), false); // MIN_YEAR själv är inte före
  assert.equal(beforeTimelineStart({ start: -2999 }), false);
  assert.equal(beforeTimelineStart({ start: 1889 }), false);
  assert.equal(beforeTimelineStart({}), false);
  assert.equal(beforeTimelineStart(null), false);
});

// #892 gav de fem händelserna före den gamla gränsen (−2999) en rad i faktarutan. Sedan förhistorien fick ett eget segment
// (#1088) ligger de på tidslinjen och får ingen rad.
test('de fem händelserna före −2999 ligger på tidslinjen sedan #1088 (#892)', () => {
  const before = events.filter(beforeTimelineStart).map(e => e.id);
  for (const id of ['egypten-enas', 'gobekli-tepe', 'jordbrukets-borjan', 'kilskriften', 'stonehenge']) {
    const e = events.find(x => x.id === id);
    assert.ok(e && e.start < -2999 + 1000, `${id} finns`);
    assert.ok(!before.includes(id), `${id} ska ligga på tidslinjen`);
  }
  assert.ok(!beforeTimelineStart(events.find(e => e.id === 'eiffeltornet')));
});

// #1139: raden "Översikt: ett urval, cirka N händelser" räknar antalet ur datan och avrundar till tiotal
test('antalet i Översikts urvalsrad avrundas till tiotal och räknas ur datan (#1139)', () => {
  assert.equal(overviewCount(123), 120);
  assert.equal(overviewCount(126), 130);
  assert.equal(overviewCount(10), 10);
  assert.equal(overviewCount(7), 7, 'under tio står det exakta antalet');
  const n = events.filter(e => e.significance === 1).length;
  assert.ok(n > 0 && overviewCount(n) % 10 === 0, `datan har ${n} händelser i Översikt`);
});

// #1312: påhittade testspann prövar tidsregeln, inga historiska sakuppgifter.
test('panelens tre grupper skiljer årets händelser, pågående spann och närliggande', () => {
  const point = { e: { start: 2000, end: 2000 }, inside: true };
  const span = { e: { start: 1999, end: 2001 }, inside: true };
  assert.equal(panelTimeGroup(point), 'happened');
  assert.equal(panelTimeGroup(span), 'inside');
  assert.equal(panelTimeGroup({ ...point, inside: false }), 'near');
  assert.equal(panelTimeGroup({ ...span, inside: false, when: 'past' }), 'near');
  assert.equal(panelTimeGroup({ ...span, inside: false, when: 'future' }), 'near');
});

test('intervall och gamla öppna spann ger inga falska närliggande grupper (#1312)', () => {
  assert.equal(panelTimeGroup({ e: { start: 2000, end: 2000 }, inside: true }, { range: true }), 'happened');
  assert.equal(panelTimeGroup({ e: { start: 1990, end: 2010 }, inside: true, partial: true }, { range: true }), 'inside');
  const old = { e: { start: 1800, end: 2026 }, inside: false, longRunning: true };
  assert.equal(panelTimeGroup(old), 'inside');
  assert.equal(panelTimeGroup(old, { range: true }), 'inside');
});

test('datumläget skiljer en dag från ett spann inom samma år (#1312)', () => {
  const row = edtf => ({ e: { start: 2000, end: 2000, edtf }, inside: true });
  assert.equal(panelTimeGroup(row('2000-05-03'), { fine: true }), 'happened');
  assert.equal(panelTimeGroup(row('2000-05-01/2000-05-10'), { fine: true }), 'inside');
  assert.equal(panelTimeGroup(row('2000-05-01/2000-05-10')), 'happened', 'årsläget använder start och slut på årsnivå');
});
