// Rikena i landskortet (#1448): platsens periods pekar på riken i data/empires/ och åren är rikets egna, luckorna blir egna rader,
// kortet visar rikena som knappar med hela namnet för skärmläsare, och de nya texterna finns på alla fem språken.
// Körs med node --test 'tests/*.test.mjs'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { placeEmpireRows } from '../js/focus/place.js';
import { Panel } from '../js/ui/panel.js';
import { ui } from '../js/i18n.js';

const json = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const places = json('data/platser.json').places;
const groups = json('data/empires/index.json').groups;
const LANGS = ['sv', 'en', 'de', 'es', 'fr'];

/** Delens perioder i rikets fil, som [start, end] i tidsordning. */
const spansOf = (empire, polity) => {
  const g = groups.find(x => x.id === empire);
  const pol = json(g.file).polities.find(p => p.id === polity);
  return pol.periods.map(q => [q.start, q.end]).sort((a, b) => a[0] - b[0]);
};

test('varje period pekar på ett rike och en del som finns, och åren är början och slut på delens egna perioder utan lucka', () => {
  const withPeriods = places.filter(p => p.periods);
  assert.ok(withPeriods.some(p => p.id === 'sverige') && withPeriods.some(p => p.id === 'danmark'), 'Sverige och Danmark ska ha perioder');
  for (const pl of withPeriods) {
    let prev = -Infinity;
    for (const per of pl.periods) {
      const where = `${pl.id}: ${per.empire}/${per.polity} ${per.from}–${per.to}`;
      assert.deepEqual(Object.keys(per).sort(), ['empire', 'from', 'polity', 'to'], `${where}: bara id och år, inga egna texter`);
      const g = groups.find(x => x.id === per.empire);
      assert.ok(g, `${where}: riket finns inte i data/empires/index.json`);
      assert.ok(g.polities.some(p => p.id === per.polity), `${where}: delen finns inte i gruppen`);
      const spans = spansOf(per.empire, per.polity);
      const i = spans.findIndex(s => s[0] === per.from);
      assert.ok(i >= 0, `${where}: from är inte början på en period i rikets data`);
      let end = spans[i][1];
      for (const [a, b] of spans.slice(i + 1)) { if (end >= per.to || a !== end + 1) break; end = b; }
      assert.equal(end, per.to, `${where}: to är inte slutet på en sammanhängande följd av rikets perioder`);
      assert.ok(per.from >= prev, `${where}: perioderna står inte i tidsordning`);
      prev = per.from;
    }
  }
});

test('en plats med perioder har källan cliopatria (rikenas gränser och år)', () => {
  for (const pl of places.filter(p => p.periods)) assert.ok(pl.sources.includes('cliopatria'), `${pl.id} saknar cliopatria i sources`);
});

test('rikets egen rad Om kartan står vid raden bara när gruppen har en enda del, och bara vid gruppens första rad', () => {
  const note = { sv: 'Källorna anger x.' };
  const gs = [{ id: 'u', facts: { mapNote: note }, polities: [{ id: 'u', name: { sv: 'Unionen' } }] },
    { id: 'm', facts: { mapNote: { sv: 'gäller hela gruppen' } }, polities: [{ id: 'm1', name: { sv: 'M1' } }, { id: 'm2', name: { sv: 'M2' } }] }];
  const rows = placeEmpireRows({ periods: [{ empire: 'm', polity: 'm1', from: 1, to: 5 }, { empire: 'u', polity: 'u', from: 6, to: 9 },
    { empire: 'm', polity: 'm2', from: 10, to: 12 }, { empire: 'u', polity: 'u', from: 13, to: 14 }] }, gs);
  assert.deepEqual(rows.map(r => r.mapNote), [null, note, null, null]);
  // Utan laddade faktarutor: ingen rad, inget fel
  assert.deepEqual(placeEmpireRows({ periods: [{ empire: 'u', polity: 'u', from: 6, to: 9 }] }, [{ ...gs[0], facts: undefined }]).map(r => r.mapNote), [null]);
});

test('Skåne (landskap) och platser utan beslut har inga perioder', () => {
  for (const pl of places.filter(p => !['sverige', 'danmark'].includes(p.id))) assert.equal(pl.periods, undefined, pl.id);
});

test('raderna får rikets eget namn ur indexet och en lucka för år som ingen period täcker', () => {
  const fake = { periods: [{ empire: 'a', polity: 'a1', from: 900, to: 1000 }, { empire: 'b', polity: 'b1', from: 1001, to: 1100 },
    { empire: 'a', polity: 'a2', from: 1200, to: 1300 }, { empire: 'saknas', polity: 'x', from: 1300, to: 1400 }] };
  const gs = [{ id: 'a', polities: [{ id: 'a1', name: { sv: 'A ett' } }, { id: 'a2', name: { sv: 'A två' } }] }, { id: 'b', polities: [{ id: 'b1', name: { sv: 'B' } }] }];
  const rows = placeEmpireRows(fake, gs);
  assert.deepEqual(rows.map(r => [r.kind, r.name?.sv ?? null, r.from, r.to]), [
    ['empire', 'A ett', 900, 1000], ['empire', 'B', 1001, 1100], ['gap', null, 1101, 1199], ['empire', 'A två', 1200, 1300]]);
  assert.equal(rows[3].empire, 'a', 'Följ riket startar Fokus på gruppen, inte på delen');
  assert.deepEqual(placeEmpireRows({}, gs), [], 'en plats utan perioder har ingen lista');
  // Överlappande perioder (en union bredvid landet) ger ingen lucka
  assert.deepEqual(placeEmpireRows({ periods: [{ empire: 'a', polity: 'a1', from: 900, to: 1100 }, { empire: 'b', polity: 'b1', from: 1000, to: 1050 }] }, gs)
    .filter(r => r.kind === 'gap'), []);
});

test('luckorna i Sverige och Danmark räknas ur datan: inga av de listade delarna täcker luckans år', () => {
  for (const id of ['sverige', 'danmark']) {
    const pl = places.find(p => p.id === id);
    const rows = placeEmpireRows(pl, groups);
    assert.equal(rows.filter(r => r.kind === 'empire').length, pl.periods.length, `${id}: alla perioder blir rader`);
    for (const gap of rows.filter(r => r.kind === 'gap')) {
      for (const per of pl.periods) assert.ok(per.to < gap.from || per.from > gap.to, `${id}: luckan ${gap.from}–${gap.to} överlappar ${per.polity}`);
    }
    // Varje år mellan första och sista perioden är antingen en period eller en lucka
    const first = Math.min(...rows.map(r => r.from)), last = Math.max(...rows.map(r => r.to));
    for (let y = first; y <= last; y++) assert.ok(rows.some(r => r.from <= y && y <= r.to), `${id}: år ${y} saknas i listan`);
  }
});

test('kortet visar rikena som knappar med hela namnet, luckan som en rad och i en tur bara text', () => {
  globalThis.matchMedia ??= () => ({ matches: false });
  const html = [];
  const el = { addEventListener() {}, focus() {} };
  const make = () => ({ detail: { set innerHTML(v) { html.push(v); }, querySelector: () => el, querySelectorAll: () => [] }, styles: json('data/styles.json'),
    srcById: {}, setDetailOpen() {}, onSelect() {} });
  const rows = [{ years: '1612–1721', name: { sv: 'Svenska stormaktsväldet' }, label: ui('place.followEmpire', { name: 'Svenska stormaktsväldet', years: '1612–1721' }), run: () => {} },
    { gap: ui('place.empireGap', { years: '1018–1055' }) },
    { years: '1402–1501', name: { sv: 'Kalmarunionen' }, label: 'x', mapNote: { sv: 'Källorna anger y.' }, run: () => {} }];
  const opts = { label: 'Plats', name: { sv: 'Sverige' }, intro: { sv: 'x' }, summary: 's', events: [{ start: 1700, _lat: 60, _lon: 15 }],
    empires: { title: ui('place.empires', { count: 1 }), note: ui('place.empiresNote'), follow: ui('place.followEmpireShort'), rows } };
  Panel.prototype.showSelection.call(make(), opts);
  const out = html.at(-1);
  // Namnet har samma ordning som den synliga texten (år, namn, Följ riket; WCAG 2.5.3)
  assert.match(out, /<button type="button" class="theme-event" data-place-empire="0" aria-label="1612–1721 Svenska stormaktsväldet, Följ riket">/);
  assert.match(out, /<li class="place-empire-gap">1018–1055: kartan visar inget av rikena i listan här\.<\/li>/);
  assert.match(out, /Riken på kartan \(1\)/);
  // Rikets rad Om kartan står under knappen och beskriver den
  assert.match(out, /aria-describedby="place-empire-note-2"><span[^]*?<\/button><p class="place-empire-note" id="place-empire-note-2">Källorna anger y\.<\/p><\/li>/);
  // Förklaringen står efter listan, så att raderna syns först
  assert.ok(out.indexOf('place-empires-note') > out.indexOf('class="theme-events place-empires"'), 'förklaringen står före listan');
  // I en tur (ingen run) är raden text: ingen knapp som kan avsluta turen
  Panel.prototype.showSelection.call(make(), { ...opts, empires: { ...opts.empires, rows: [{ ...rows[0], run: null }] } });
  assert.ok(!html.at(-1).includes('data-place-empire'), 'en rad utan run får ingen knapp');
  // Utan perioder: ingen lista alls
  Panel.prototype.showSelection.call(make(), { ...opts, empires: null });
  assert.ok(!html.at(-1).includes('place-empire'), 'ett kort utan perioder har ingen rikeslista');
});

test('de nya texterna finns på alla fem språken med samma platshållare', () => {
  const sv = json('data/ui/sv.json');
  const holders = text => [...String(text).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join();
  for (const key of ['place.empires', 'place.empiresNote', 'place.followEmpire', 'place.followEmpireShort', 'place.empireGap', 'place.followLeaves', 'focus.movedPeriod', 'focus.chosenPeriod']) {
    for (const lang of LANGS) {
      const file = json(`data/ui/${lang}.json`);
      assert.ok(file[key], `${key} saknas på ${lang}`);
      assert.equal(holders(file[key]), holders(sv[key]), `${key} på ${lang} har andra platshållare än svenskan`);
    }
  }
});

test('franska har hårt mellanrum före kolon i de nya texterna', () => {
  const fr = json('data/ui/fr.json');
  for (const key of ['place.empireGap', 'focus.chosenPeriod']) assert.ok(!/ :/.test(fr[key]) && /\u00a0:/.test(fr[key]), `${key}: ${fr[key]}`);
});
