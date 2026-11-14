// Platskortets typrad med landsnamn med artikel och preposition (#1479): `partOf` i data/platser.json är hela frasen per språk
// ("in der Schweiz", "aux États-Unis") och mallen place.typeOf är "{type} {of}", så koden lägger aldrig till en preposition själv.
// Körs med node --test 'tests/*.test.mjs'.
// OBS: provplatserna och fraserna nedan är testfixturer som bara provar mallen och hur frasen sätts ihop med typen. De är inga riktiga
// platser, ingen av dem finns i data/platser.json och frasernas form är inte källkontrollerad här; varje riktig fras kontrolleras
// mot målspråkets Wikipedia när platsen byggs (docs/ordlista-oversattning.md 17.2).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { placeLead } from '../js/focus/place.js';

const json = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const LANGS = ['sv', 'en', 'de', 'es', 'fr'];
const places = json('data/platser.json').places;
const dicts = Object.fromEntries(LANGS.map(l => [l, json(`data/ui/${l}.json`)]));

// Typtexter som bara finns i testet, för fixturerna (delstat och kanton i stället för "Land"); datans typer läses ur data/ui/
const FIXTURE_TYPES = {
  state: { sv: 'Delstat', en: 'State', de: 'US-Bundesstaat', es: 'Estado', fr: 'État' },
  canton: { sv: 'Kanton', en: 'Canton', de: 'Kanton', es: 'Cantón', fr: 'Canton' },
};

/** placeLead på ett visst språk: texthämtarna läser språkfilen och språkets text, utan reservspråk. */
const lead = (place, lang) => placeLead(place,
  obj => (typeof obj === 'string' ? obj : obj[lang]),
  (key, vars) => {
    const fixture = FIXTURE_TYPES[key.replace(/^place\.type\./, '')]?.[lang];
    return (fixture ?? dicts[lang][key]).replace(/\{(\w+)\}/g, (m, k) => vars?.[k] ?? m);
  });

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

test('landsnamn med artikel och annan preposition får rätt rad: frasen skrivs hel i datan (fixturer, inga riktiga platser)', () => {
  const fixture = (type, partOf) => ({ type, partOf });
  const canton = fixture('canton', phrase('i Schweiz', 'in Switzerland', 'in der Schweiz', 'en Suiza', 'en Suisse'));
  assert.equal(lead(canton, 'de'), 'Kanton in der Schweiz');
  assert.equal(lead(canton, 'fr'), 'Canton en Suisse');
  const us = fixture('state', phrase('i USA', 'in the United States', 'in den USA', 'en Estados Unidos', 'aux États-Unis'));
  assert.equal(lead(us, 'en'), 'State in the United States');
  assert.equal(lead(us, 'de'), 'US-Bundesstaat in den USA');
  assert.equal(lead(us, 'fr'), 'État aux États-Unis');
  assert.equal(lead(us, 'es'), 'Estado en Estados Unidos');
  // Artikeln står kvar efter prepositionen på spanska och engelska
  const nl = fixture('state', phrase('i Nederländerna', 'in the Netherlands', 'in den Niederlanden', 'en los Países Bajos', 'aux Pays-Bas'));
  assert.equal(lead(nl, 'es'), 'Estado en los Países Bajos', 'artikeln los står kvar');
  assert.equal(lead(nl, 'en'), 'State in the Netherlands', 'the med liten bokstav mitt i raden');
  assert.equal(lead(nl, 'fr'), 'État aux Pays-Bas');
  const dk = fixture('state', phrase('i Danmark', 'in Denmark', 'in Dänemark', 'en Dinamarca', 'au Danemark'));
  assert.equal(lead(dk, 'fr'), 'État au Danemark', 'au, inte en');
  assert.equal(lead(dk, 'sv'), 'Delstat i Danmark');
});

test('mallen place.typeOf är "{type} {of}" på alla språk: ingen fast preposition kvar i gränssnittstexterna', () => {
  for (const l of LANGS) assert.equal(dicts[l]['place.typeOf'], '{type} {of}', `place.typeOf på ${l}`);
});

test('varje partOf i datan är en hel fras på alla fem språk (preposition och landsnamn), aldrig bara landsnamnet', () => {
  const rule = json('schemas/platser.schema.json').$defs.phrase;
  for (const p of places.filter(x => x.partOf)) {
    for (const l of LANGS) {
      const text = p.partOf[l];
      assert.ok(typeof text === 'string' && new RegExp(rule.properties[l].pattern).test(text), `${p.id}.partOf.${l} är inte en hel fras: "${text}"`);
    }
  }
});

test('schemat kräver en inledande preposition per språk: bara landsnamn avvisas, fixturfraserna och Skånes fraser godtas', () => {
  const schema = json('schemas/platser.schema.json');
  const rule = schema.$defs.phrase;
  assert.deepEqual(rule.required, LANGS);
  assert.equal(schema.properties.places.items.properties.partOf.$ref, '#/$defs/phrase');
  const ok = (lang, text) => new RegExp(rule.properties[lang].pattern).test(text);
  // Bara landsnamn (aldrig en fras) ska avvisas på alla språk
  for (const name of ['New Zealand', 'Sri Lanka', 'Czech Republic', 'Schweden', 'Sverige', 'Suède', 'Suecia']) {
    for (const l of LANGS) assert.ok(!ok(l, name), `${l}: "${name}" godtogs som fras`);
  }
  // En preposition utan landsnamn räcker inte heller
  for (const l of LANGS) { assert.ok(!ok(l, 'in'), l); assert.ok(!ok(l, 'en '), l); }
  // Fixturfraserna godtas
  const good = {
    sv: ['i Schweiz', 'i USA', 'i Nederländerna', 'i Danmark'],
    en: ['in Switzerland', 'in the United States', 'in the Netherlands', 'in Denmark'],
    de: ['in der Schweiz', 'in den USA', 'in den Niederlanden', 'in Dänemark'],
    es: ['en Suiza', 'en Estados Unidos', 'en los Países Bajos', 'en Dinamarca'],
    fr: ['en Suisse', 'aux États-Unis', 'aux Pays-Bas', 'au Danemark'],
  };
  for (const l of LANGS) for (const text of good[l]) assert.ok(ok(l, text), `${l}: "${text}" avvisades`);
  // Skånes fraser (datan) godtas
  const skane = places.find(p => p.id === 'skane');
  for (const l of LANGS) assert.ok(ok(l, skane.partOf[l]), `Skånes ${l}`);
  // Prepositioner som listan ännu saknar avvisas, så den får utökas när en plats behöver dem (beslutsfilen)
  assert.ok(!ok('fr', 'chez les Pays-Bas'));
});
