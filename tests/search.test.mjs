// Sökningen (#570): js/search-index.js. Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalize, buildIndex, search } from '../js/search-index.js';

const json = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const events = json('data/genererat/handelser.json').events;
const empireGroups = json('data/genererat/riken.json').groups;
const visible = r => r === 'source-checked' || r === 'two-sources';
const t = x => (typeof x === 'string' ? x : x?.sv ?? x?.en ?? '');
const index = buildIndex({ events, empireGroups, routes: [
  { id: 'resa', kind: 'voyage', title: { sv: 'Testresan' }, start: 1492, end: 1493, review: 'source-checked' },
  { id: 'vag', kind: 'trade', title: { sv: 'Testvägen' }, start: 1, end: 2, review: 'source-checked' },
] }, { t, visible });

test('normalize tar bort accenter, versaler och skiljetecken', () => {
  assert.equal(normalize('  Pompéji, år 79! '), 'pompeji ar 79');
});

test('utkast och handelsvägar finns inte i indexet', () => {
  assert.ok(index.every(i => i.type !== 'event' || visible(i.ref.review)));
  assert.ok(!index.some(i => i.id === 'vag'));
  assert.ok(index.some(i => i.id === 'resa' && i.type === 'route'));
});

test('en händelse hittas på sin titel, oavsett versaler och accenter', () => {
  const e = events.find(x => visible(x.review) && x.kind !== 'war');
  const word = normalize(t(e.title)).split(' ').sort((a, b) => b.length - a.length)[0];
  const hits = search(index, word.toUpperCase());
  assert.ok(hits.some(h => h.id === e.id), `${word} hittade inte ${e.id}`);
});

test('krig får typen war och riken hittas på sina delrikens namn', () => {
  const war = events.find(x => x.kind === 'war' && visible(x.review));
  assert.equal(search(index, t(war.title)).find(h => h.id === war.id)?.type, 'war');
  const g = empireGroups.find(x => x.polities?.length > 1);
  const polity = t(g.polities.at(-1).name);
  assert.ok(search(index, polity).some(h => h.type === 'empire' && h.id === g.id), `${polity} hittade inte ${g.id}`);
});

test('alla ord måste finnas, och tom fråga eller nonsens ger inga träffar', () => {
  assert.deepEqual(search(index, ''), []);
  assert.deepEqual(search(index, '   '), []);
  assert.deepEqual(search(index, 'qxzvw'), []);
  const war = events.find(x => x.kind === 'war' && visible(x.review));
  assert.ok(!search(index, `${t(war.title)} qxzvw`).some(h => h.id === war.id));
});

test('namnträffar kommer före platsträffar, och gränsen följs', () => {
  const hits = search(index, 'a', 5);
  assert.equal(hits.length, 5);
  const place = events.find(x => visible(x.review) && t(x.place) && !normalize(t(x.title)).includes(normalize(t(x.place)).split(' ')[0]));
  const word = normalize(t(place.place)).split(' ')[0];
  const all = search(index, word, 1000);
  const firstPlaceOnly = all.findIndex(h => !h.names.some(n => n.includes(word)));
  const lastName = all.map(h => h.names.some(n => n.includes(word))).lastIndexOf(true);
  if (firstPlaceOnly >= 0) assert.ok(lastName < firstPlaceOnly, 'en platsträff kom före en namnträff');
});
