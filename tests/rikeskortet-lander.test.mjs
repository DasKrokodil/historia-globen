// Dagens länder i rikeskortet (#1955): rikeskortet länkar till de länder vars kort själv nämner riket i periods (med Cliopatria som
// källa, #1448), med årtalen ur landskortet, som knappar som följer landet, och som text i lektionsläget. Texterna finns på fem språk.
// Körs med node --test 'tests/*.test.mjs'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { empirePlaces } from '../js/focus/place.js';
import { Panel } from '../js/ui/panel.js';

const json = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const places = json('data/platser.json').places;
const LANGS = ['sv', 'en', 'de', 'es', 'fr'];

test('länderna kommer ur platsernas periods: Sverige, Norge (Sverige-Norge), Finland, Estland och Lettland för Sverige-gruppen, Danmark, Norge (Danmark-Norge), Estland och Island för Konungariket Danmark, alla fem nordiska för Kalmarunionen, Finland, Estland, Lettland och Litauen för Ryska imperiet, Norge och Island för Norgesväldet, Storbritannien och Frankrike för Romarriket, Storbritannien och Irland för Brittiska imperiet, Storbritannien, Irland och Frankrike för Kungariket England, Irland för Kungariket Man och Irland, Frankrike för Frankerriket, Kungariket Frankrike, Franska kolonialväldet och Frankrike, och Belgien för Romarriket, Frankerriket, Tysk-romerska riket, Habsburgska riket, Spanska imperiet, Nederländska kolonialväldet, Belgien, Tyska riket och Nazityskland, Nederländerna för Romarriket, Frankerriket, Tysk-romerska riket, Habsburgska riket, Spanska imperiet, Nederländska kolonialväldet, Nazityskland och Nederländerna, och Luxemburg för Romarriket, Frankerriket, Tysk-romerska riket, Habsburgska riket, Spanska imperiet, Kungariket Frankrike, Nederländska kolonialväldet, Belgien, Luxemburg, Tyska riket och Nazityskland, och Tyskland för Romarriket, Frankerriket, Tysk-romerska riket, Preussen, Tyska riket, Weimarrepubliken, Nazityskland, Sovjetunionen (med Estland, Lettland och Litauen), Brittiska imperiet, USA, Franska kolonialväldet, Östtyskland, Västtyskland och Tyskland, och Österrike för Romarriket, Östgoternas rike, Frankerriket, Tysk-romerska riket, Habsburgska riket, Kungariket Ungern, Österrike-Ungern, Österrike och Nazityskland (men inte Spanska imperiet), och Schweiz för Romarriket, Frankerriket, Tysk-romerska riket och Schweiz, och Polen för Kungariket Polen, Preussen, Ryska imperiet, Tyska riket och Polen (men inte Nazityskland), och Tjeckien för Tysk-romerska riket, Habsburgska riket, Österrike-Ungern, Tjeckoslovakien och Tjeckien (men inte Kungariket Polen, Spanska imperiet, Preussen eller Nazityskland), och Slovakien för Kungariket Ungern, Habsburgska riket, Österrike-Ungern, Tjeckoslovakien och Slovakien (men inte Kungariket Polen, Tysk-romerska riket, Osmanska riket, Spanska imperiet eller Nazityskland)', () => {
  const ids = empire => empirePlaces(places, empire).map(p => p.id);
  assert.deepEqual(ids('svenska-stormaktsvaldet'), ['sverige', 'norge', 'finland', 'estland', 'lettland']);
  assert.deepEqual(ids('konungariket-danmark'), ['danmark', 'norge', 'estland', 'island']);
  assert.deepEqual(ids('kalmarunionen'), ['sverige', 'danmark', 'norge', 'finland', 'island']);
  assert.deepEqual(ids('ryska-imperiet'), ['finland', 'estland', 'lettland', 'litauen', 'polen']);
  assert.deepEqual(ids('norgesvaldet'), ['norge', 'island']);
  assert.deepEqual(ids('romarriket'), ['storbritannien', 'frankrike', 'belgien', 'nederlanderna', 'luxemburg', 'tyskland', 'osterrike', 'schweiz']);
  assert.deepEqual(ids('brittiska-imperiet'), ['storbritannien', 'irland', 'tyskland']);
  assert.deepEqual(ids('kungariket-england'), ['storbritannien', 'irland', 'frankrike']);
  assert.deepEqual(ids('kungariket-man'), ['irland']);
  assert.deepEqual(ids('irland'), ['irland']);
  assert.deepEqual(ids('frankerriket'), ['frankrike', 'belgien', 'nederlanderna', 'luxemburg', 'tyskland', 'osterrike', 'schweiz']);
  assert.deepEqual(ids('tysk-romerska-riket'), ['estland', 'lettland', 'belgien', 'nederlanderna', 'luxemburg', 'tyskland', 'osterrike', 'schweiz', 'tjeckien']);
  assert.deepEqual(ids('habsburgska-riket'), ['belgien', 'nederlanderna', 'luxemburg', 'osterrike', 'tjeckien', 'slovakien']);
  assert.deepEqual(ids('spanska-imperiet'), ['belgien', 'nederlanderna', 'luxemburg']);
  assert.deepEqual(ids('nederlandska-kolonialvaldet'), ['belgien', 'nederlanderna', 'luxemburg']);
  assert.deepEqual(ids('belgien'), ['belgien', 'luxemburg']);
  assert.deepEqual(ids('tyska-riket'), ['estland', 'lettland', 'litauen', 'belgien', 'luxemburg', 'tyskland', 'polen']);
  assert.deepEqual(ids('nazityskland'), ['belgien', 'nederlanderna', 'luxemburg', 'tyskland', 'osterrike']);
  assert.deepEqual(ids('ostgoternas-rike'), ['osterrike']);
  assert.deepEqual(ids('kungariket-ungern'), ['osterrike', 'slovakien']);
  assert.deepEqual(ids('osterrike-ungern'), ['osterrike', 'tjeckien', 'slovakien']);
  assert.deepEqual(ids('tjeckoslovakien'), ['tjeckien', 'slovakien']);
  assert.deepEqual(ids('slovakien'), ['slovakien']);
  assert.deepEqual(ids('tjeckien'), ['tjeckien']);
  assert.deepEqual(ids('osterrike'), ['osterrike']);
  assert.deepEqual(ids('schweiz'), ['schweiz']);
  assert.deepEqual(ids('luxemburg'), ['luxemburg']);
  assert.deepEqual(ids('preussen'), ['tyskland', 'polen']);
  assert.deepEqual(ids('kungariket-polen'), ['polen']);
  assert.deepEqual(ids('polen'), ['polen']);
  assert.deepEqual(ids('weimarrepubliken'), ['tyskland']);
  assert.deepEqual(ids('sovjetunionen'), ['estland', 'lettland', 'litauen', 'tyskland']);
  assert.deepEqual(ids('usa'), ['tyskland']);
  assert.deepEqual(ids('osttyskland'), ['tyskland']);
  assert.deepEqual(ids('vasttyskland'), ['tyskland']);
  assert.deepEqual(ids('tyskland'), ['tyskland']);
  assert.deepEqual(ids('nederlanderna'), ['nederlanderna']);
  assert.deepEqual(ids('kungariket-frankrike'), ['frankrike', 'luxemburg']);
  assert.deepEqual(ids('franska-kolonialvaldet'), ['frankrike', 'tyskland']);
  assert.deepEqual(ids('frankrike'), ['frankrike']);
  assert.deepEqual(ids('osmanska-riket'), [], 'ett rike som inget landskort nämner får ingen lista');
});

test('perioder kant i kant slås ihop, och åren är landskortets egna', () => {
  const sv = empirePlaces(places, 'svenska-stormaktsvaldet')[0];
  const per = places.find(p => p.id === 'sverige').periods.filter(p => p.empire === 'svenska-stormaktsvaldet');
  assert.equal(sv.spans[0].from, Math.min(...per.map(p => p.from)));
  assert.equal(sv.spans.at(-1).to, Math.max(...per.map(p => p.to)));
  for (const s of sv.spans) assert.ok(per.some(p => p.from === s.from) && per.some(p => p.to === s.to), `${s.from}–${s.to} är inte landskortets år`);
  for (let i = 1; i < sv.spans.length; i++) assert.ok(sv.spans[i].from > sv.spans[i - 1].to + 1, 'två spann i rad borde ha slagits ihop');
  const fake = [{ id: 'x', name: { sv: 'X' }, periods: [{ empire: 'a', polity: 'a1', from: 10, to: 20 }, { empire: 'a', polity: 'a2', from: 21, to: 30 },
    { empire: 'b', polity: 'b', from: 31, to: 40 }, { empire: 'a', polity: 'a1', from: 41, to: 50 }] }];
  assert.deepEqual(empirePlaces(fake, 'a')[0].spans, [{ from: 10, to: 30 }, { from: 41, to: 50 }]);
  // Ett rike med egen faktaruta (polity) visar bara spannen för sin egen del
  assert.deepEqual(empirePlaces(fake, 'a', 'a2')[0].spans, [{ from: 21, to: 30 }]);
  assert.deepEqual(empirePlaces(fake, 'a', 'zz'), []);
  assert.deepEqual(empirePlaces(null, 'a'), []);
});

test('kortet visar länderna som knappar med namn för skärmläsare, och i lektionsläget som text', () => {
  globalThis.matchMedia ??= () => ({ matches: false });
  // Faktarutan hämtar källregistret (needDetails) och ritas om när det har kommit; här kommer det aldrig, så kortet ritas en gång
  globalThis.fetch = () => new Promise(() => {});
  const html = [];
  const el = { addEventListener() {}, focus() {} };
  const make = extra => ({ detail: { set innerHTML(v) { html.push(v); }, querySelector: () => el, querySelectorAll: () => [], contains: () => false, dataset: {} },
    styles: json('data/styles.json'), srcById: {}, empireLegend: {}, _whenLoaded: () => false, setDetailOpen() {}, onSelect() {}, bindLinks() {}, bindReviewInfo() {}, ...extra });
  const opts = { kind: 'empire', name: 'Kalmarunionen', color: '#000', facts: { summary: { sv: 's' }, items: [], review: 'source-checked' },
    places: [{ id: 'sverige', name: 'Sverige', years: '1402–1501, 1521–1525' }], factsKey: 'kalmarunionen:' };
  const panel = make({ onFollowPlace() {} });
  Panel.prototype.showFacts.call(panel, opts);
  const out = html.at(-1);
  assert.match(out, /<h4>Dagens länder<\/h4>/);
  assert.match(out, /<button type="button" class="link-btn" data-follow-place="sverige" aria-label="Följ Sverige">▶ Sverige<\/button> <span class="meta">1402–1501, 1521–1525<\/span>/);
  assert.match(out, /<details class="facts-section" open><summary>/, 'Kortfattat öppnas när det bara finns länderna');
  assert.equal(panel.detail.dataset.facts, 'kalmarunionen:', 'kortet säger vilket rike det visar, så att det ritas om när platserna kommer');
  Panel.prototype.showFacts.call(make({ onFollowPlace() {}, followLocked: () => true }), opts);
  assert.ok(!html.at(-1).includes('data-follow-place') && html.at(-1).includes('Sverige'), 'i lektionsläget är landet text');
  Panel.prototype.showFacts.call(make({ onFollowPlace() {} }), { ...opts, places: [] });
  assert.ok(!html.at(-1).includes('empire-places'), 'utan länder ingen lista');
});

test('de nya texterna finns på alla fem språken med samma platshållare', () => {
  const sv = json('data/ui/sv.json');
  const holders = text => [...String(text).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join();
  for (const key of ['facts.places', 'facts.placesNote', 'facts.followPlaceLabel']) {
    for (const lang of LANGS) {
      const file = json(`data/ui/${lang}.json`);
      assert.ok(file[key], `${key} saknas på ${lang}`);
      assert.equal(holders(file[key]), holders(sv[key]), `${key} på ${lang} har andra platshållare än svenskan`);
    }
  }
});
