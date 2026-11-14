// Platskortets typrad med landsnamn med artikel och preposition (#1479): `partOf` i data/platser.json är hela frasen per språk
// ("in der Schweiz", "aux États-Unis") och mallen place.typeOf är "{type} {of}", så koden lägger aldrig till en preposition själv.
// Körs med node --test 'tests/*.test.mjs'. Provplatserna nedan är testfixturer, inga platser i datan.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { placeLead } from '../js/focus/place.js';

const json = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const LANGS = ['sv', 'en', 'de', 'es', 'fr'];
const places = json('data/platser.json').places;
const dicts = Object.fromEntries(LANGS.map(l => [l, json(`data/ui/${l}.json`)]));

/** placeLead på ett visst språk: texthämtarna läser språkfilen och språkets text, utan reservspråk. */
const lead = (place, lang) => placeLead(place,
  obj => (typeof obj === 'string' ? obj : obj[lang]),
  (key, vars) => dicts[lang][key].replace(/\{(\w+)\}/g, (m, k) => vars?.[k] ?? m));

const phrase = (sv, en, de, es, fr) => ({ sv, en, de, es, fr });

test('Skånes typrad är oförändrad på alla fem språk', () => {
  const skane = places.find(p => p.id === 'skane');
  assert.deepEqual(Object.fromEntries(LANGS.map(l => [l, lead(skane, l)])), {
    sv: 'Landskap i Sverige',
    en: 'Province in Sweden',
    de: 'Landschaft in Schweden',
    es: 'Provincia histórica en Suecia',
    fr: 'Province historique en Suède',
  });
});

test('en plats utan partOf visar bara typen', () => {
  const gronland = places.find(p => p.id === 'gronland');
  assert.ok(!gronland.partOf);
  assert.deepEqual(Object.fromEntries(LANGS.map(l => [l, lead(gronland, l)])), {
    sv: 'Självstyrt område', en: 'Autonomous territory', de: 'Autonomes Gebiet', es: 'Territorio autónomo', fr: 'Territoire autonome',
  });
});

test('landsnamn med artikel och annan preposition får rätt rad: frasen skrivs hel i datan (fixturer)', () => {
  const fixture = partOf => ({ type: 'country', partOf });
  const ch = fixture(phrase('i Schweiz', 'in Switzerland', 'in der Schweiz', 'en Suiza', 'en Suisse'));
  assert.equal(lead(ch, 'de'), 'Land in der Schweiz');
  assert.equal(lead(ch, 'fr'), 'Pays en Suisse');
  const us = fixture(phrase('i USA', 'in the United States', 'in den USA', 'en Estados Unidos', 'aux États-Unis'));
  assert.equal(lead(us, 'en'), 'Country in the United States');
  assert.equal(lead(us, 'de'), 'Land in den USA');
  assert.equal(lead(us, 'fr'), 'Pays aux États-Unis');
  assert.equal(lead(us, 'es'), 'País en Estados Unidos');
  const dk = fixture(phrase('i Danmark', 'in Denmark', 'in Dänemark', 'en Dinamarca', 'au Danemark'));
  assert.equal(lead(dk, 'fr'), 'Pays au Danemark', 'au, inte en');
  assert.equal(lead(dk, 'sv'), 'Land i Danmark');
});

test('mallen place.typeOf är "{type} {of}" på alla språk: ingen fast preposition kvar i gränssnittstexterna', () => {
  for (const l of LANGS) assert.equal(dicts[l]['place.typeOf'], '{type} {of}', `place.typeOf på ${l}`);
});

test('varje partOf i datan är en hel fras på alla fem språk (preposition och landsnamn), aldrig bara landsnamnet', () => {
  for (const p of places.filter(x => x.partOf)) {
    for (const l of LANGS) {
      const text = p.partOf[l];
      assert.ok(typeof text === 'string' && /^\S+\s+\S/.test(text), `${p.id}.partOf.${l} är inte en hel fras: "${text}"`);
    }
  }
});

test('schemat kräver hel fras i partOf: ett bart landsnamn eller ett saknat språk avvisas', () => {
  const schema = json('schemas/platser.schema.json');
  const rule = schema.$defs.phrase;
  assert.deepEqual(rule.required, LANGS);
  assert.equal(schema.properties.places.items.properties.partOf.$ref, '#/$defs/phrase');
  const re = new RegExp(rule.properties.de.pattern);
  assert.ok(re.test('in der Schweiz') && re.test('aux États-Unis'));
  assert.ok(!re.test('Schweden'), 'bart landsnamn ska avvisas');
});
