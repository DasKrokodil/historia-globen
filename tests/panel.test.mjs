// En exakt daterad period är inte historisk osäkerhet (#364).
import test from 'node:test';
import { MIN_YEAR } from '../js/state.js';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { uncertaintyRow, mythsHtml, emptyCause, beforeTimelineStart, overviewCount } from '../js/ui/panel.js';

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

test('texterna för avstängda kategorier finns på alla fem språken, artigt tilltal utom svenska', async () => {
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    const ui = JSON.parse(readFileSync(new URL(`../data/ui/${lang}.json`, import.meta.url)));
    for (const key of ['panel.filtersOff', 'panel.filtersOffHelp', 'panel.showAllCategories']) {
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
