// Platskortet i turens steg, uppföljning (#1464): raden om intervallets slutår utanför platsens spann, kortets namn för skärmläsare,
// knapptexten "Läs om platsen" på samma ställe som "Läs om händelsen" och gränssnittstexterna på alla fem språken.
// Körs med node --test 'tests/*.test.mjs'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { rangeEndSide, rangeEndedNote, visibleEvents } from '../js/focus/place.js';
import { Panel } from '../js/ui/panel.js';
import { selectionSpan } from '../js/focus/util.js';
import { entry as placesLayer } from '../js/layers/places.js';
import { ui } from '../js/i18n.js';

const json = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const events = json('data/events.json').events;
for (const e of events) [e._lon, e._lat] = e.location.coordinates;
const places = json('data/platser.json').places;
const LANGS = ['sv', 'en', 'de', 'es', 'fr'];

/** Platsens synliga händelser, som fokuset och kortet ser dem. */
const eventsOf = id => visibleEvents(places.find(p => p.id === id), events);
const ev = (start, end = start) => ({ start, end });

test('intervallets slutår inom platsens spann ger ingen förklaring, före eller efter ger den', () => {
  const list = [ev(1000), ev(1500, 1600), ev(1700)];
  assert.deepEqual(rangeEndSide(1000, list), { side: 'in', when: null }, 'första året ligger inom');
  assert.deepEqual(rangeEndSide(1700, list), { side: 'in', when: null }, 'sista året ligger inom');
  assert.deepEqual(rangeEndSide(1650.5, list), { side: 'in', when: null }, 'delar av år räknas som året');
  assert.deepEqual(rangeEndSide(1701, list), { side: 'after', when: 1700 });
  assert.deepEqual(rangeEndSide(999, list), { side: 'before', when: 1000 });
  assert.deepEqual(rangeEndSide(2000, [ev(1000, 1500), ev(1200, 1900)]), { side: 'after', when: 1900 }, 'det sista slutet räknas, inte den sista starten');
  assert.deepEqual(rangeEndSide(2000, []), { side: 'in', when: null }, 'inga händelser: ingen förklaring att ge');
});

test('årtalet i förklaringen räknas ur platsens egna händelser (Grönland), aldrig skrivet i koden', () => {
  const evs = eventsOf('gronland');
  assert.ok(evs.length > 1, 'Grönland ska ha händelser i datan');
  const { to, lastEnd } = selectionSpan(evs);
  const after = rangeEndSide(to + 11, evs), before = rangeEndSide(evs[0].start - 11, evs);
  assert.deepEqual(after, { side: 'after', when: Math.floor(lastEnd) });
  assert.deepEqual(before, { side: 'before', when: Math.floor(evs[0].start) });
  const note = rangeEndedNote({ from: to - 20, to: to + 11 }, to - 20, evs);
  assert.ok(note.includes(String(Math.floor(lastEnd))), `raden nämner platsens sista år (${lastEnd}): ${note}`);
  assert.match(note, /Platsens sista händelse är/);
  assert.ok(note.includes(String(to - 20)), 'raden nämner året platsen visas för');
});

test('raden för ett slutår inom spannet är oförändrad, och före och efter har egna meningar', () => {
  const list = [ev(1000), ev(1700)];
  const inside = rangeEndedNote({ from: 1100, to: 1600 }, 1600, list);
  assert.equal(inside, 'Tidsintervallet 1100–1600 avslutades när platsen började följas. För år 1600 visas platsen.');
  const after = rangeEndedNote({ from: 1650, to: 1800 }, 1650, list);
  assert.equal(after, 'Tidsintervallet 1650–1800 avslutades när platsen började följas. Platsens sista händelse är 1700, så platsen visas för år 1650.');
  const before = rangeEndedNote({ from: 800, to: 900 }, 1000, list);
  assert.match(before, /^Tidsintervallet 800–900 (e\.Kr\. )?avslutades när platsen började följas\. Platsens första händelse är 1000, så platsen visas för år 1000\.$/);
});

test('årtalen i raden skrivs med f.Kr. när platsens händelser ligger före vår tideräkning (formatYear)', () => {
  // Astronomisk årsräkning: 2600 f.Kr. är -2599 och 2000 f.Kr. är -1999
  const early = [ev(-2599, -1999), ev(-1500)];
  const before = rangeEndedNote({ from: -2999, to: -2899 }, -2599, early);
  assert.match(before, /Platsens första händelse är 2600 f\.Kr\., så platsen visas för år 2600 f\.Kr\.$/);
  assert.ok(!before.includes('-2599'), 'det astronomiska årtalet ska inte visas');
  const after = rangeEndedNote({ from: -500, to: -100 }, -500, [ev(-2599, -1999)]);
  assert.match(after, /Platsens sista händelse är 2000 f\.Kr\., så platsen visas för år 501 f\.Kr\.$/);
  assert.ok(!after.includes('-1999'));
  assert.deepEqual(rangeEndSide(-2899, early), { side: 'before', when: -2599 });
  assert.deepEqual(rangeEndSide(-100, [ev(-2599, -1999)]), { side: 'after', when: -1999 });
});

test('texterna finns på alla fem språken med samma platshållare, och tour.readPlace är flyttad', () => {
  const sv = json('data/ui/sv.json');
  const holders = text => [...String(text).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join();
  for (const key of ['place.rangeEnded', 'place.rangeEndedAfter', 'place.rangeEndedBefore', 'place.cardLabel', 'theme.cardLabel']) {
    assert.ok(sv[key], `${key} saknas på svenska`);
    for (const lang of LANGS) {
      const file = json(`data/ui/${lang}.json`);
      assert.ok(file[key], `${key} saknas på ${lang}`);
      assert.equal(holders(file[key]), holders(sv[key]), `${key} på ${lang} har andra platshållare än svenskan`);
    }
  }
  for (const lang of LANGS) assert.ok(!('tour.readPlace' in json(`data/ui/${lang}.json`)), `tour.readPlace finns kvar på ${lang}: texten står i data/turer/index.json (labels.readPlace)`);
});

test('knapptexterna Läs om händelsen och Läs om platsen står båda i turregistrets labels, på alla språk', () => {
  const { labels } = json('data/turer/index.json');
  for (const key of ['read', 'readPlace']) {
    for (const lang of LANGS) assert.ok(labels[key]?.[lang], `labels.${key} saknar ${lang}`);
  }
  assert.equal(labels.readPlace.sv, 'Läs om platsen');
  // Texten får inte skilja sig åt mellan händelse och plats bara i ett språk: de ska vara två olika texter
  for (const lang of LANGS) assert.notEqual(labels.readPlace[lang], labels.read[lang], `${lang}: samma text för händelse och plats`);
});

test('kortet heter Om händelsen om inget annat sägs och Om platsen för platsens kort, och ärver inte det förra kortets namn', () => {
  const calls = [], attrs = {};
  const fake = { detail: { hidden: true, setAttribute: (k, v) => { attrs[k] = v; } }, onDetailChange: open => calls.push(open) };
  Panel.prototype.setDetailOpen.call(fake, true, ui('place.cardLabel'));
  assert.equal(attrs['aria-label'], 'Om platsen');
  assert.equal(fake.detail.hidden, false);
  Panel.prototype.setDetailOpen.call(fake, true);
  assert.equal(attrs['aria-label'], 'Om händelsen', 'nästa kort utan namn får standardnamnet');
  Panel.prototype.setDetailOpen.call(fake, false);
  assert.equal(attrs['aria-label'], 'Om händelsen', 'att stänga ändrar inte namnet');
  assert.equal(fake.detail.hidden, true);
  assert.deepEqual(calls, [true, true, false]);
});

test('konturen från ett turssteg ritas bara medan en tur pågår: ett Fokus som avslutar turen lämnar ingen kontur kvar (#1464)', () => {
  const { layer, update } = placesLayer();
  const step = places.find(p => p.id === 'gronland'), other = places.find(p => p.id !== 'gronland');
  layer.step = step;
  // Turen pågår: steget behåller sin kontur
  update({ focus: null, modes: [{ mode: 'tur' }], labels: {} });
  assert.equal(layer.step, step);
  // Ett Fokus på en annan plats avslutade turen (MODE_RULES): ingen kontur från steget, bara platsen man följer
  update({ focus: { type: 'place', place: other }, modes: [{ mode: 'fokus' }], labels: {} });
  assert.equal(layer.step, null, 'stegets kontur låg kvar efter att turen avslutades');
  assert.equal(layer.place, other);
  // Samma sak när Fokus är på samma plats som steget
  layer.step = step;
  update({ focus: { type: 'place', place: step }, modes: [{ mode: 'fokus' }], labels: {} });
  assert.equal(layer.step, null);
});
