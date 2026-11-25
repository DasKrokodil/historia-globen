// Religionslagret (#2162, beslut 2026-11-25): religionsbyte per rike (conversion = { religion, since, sources, note? } i
// registret i data/religions.json). Fältet ersätter christianSince och source. Ghanariket har islam från 1076 (källa:
// Wikipedia, Ghana Empire, som hänvisar till Gomez 2018) och visas därför med islam från ögonblicksbilden 1100, med en
// mening om att källorna skiljer sig om hur det gick till. Kontrollpunkten är Koumbi Saleh, 15.76556 N, 7.96861 V
// (Wikipedia, Koumbi Saleh, öppnad 2026-11-25). De 26 riken som hade christianSince har samma år och källa som förut.
// Läser data/religions.json och data/religions-polities.json som tools/religioner.py och tools/religioner_riken.py har byggt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inGeometry } from '../js/place-geo.js';

const read = f => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const data = read('religions.json');
const shapes = read('religions-polities.json').polities;
const sourceIds = new Set(read('sources.json').sources.map(s => s.id));
const religionIds = new Set(data.religions.map(r => r.id));
const register = new Map(data.polities.map(p => [p.name, p]));
const KOUMBI_SALEH = [-7.96861, 15.76556];
const LANGS = ['sv', 'en', 'de', 'es', 'fr'];

/** Religionerna (id, säker) vars egna (inte ärvda) områden täcker platsen det året. */
function religionsHere(year, [lon, lat]) {
  const out = [];
  for (const r of data.religions) {
    for (const s of r.snapshots) {
      if (!s.inherited && s.start <= year && year <= s.end && inGeometry(s.geometry, lon, lat)) {
        out.push({ id: r.id, sure: s.sure, polities: s.polities });
      }
    }
  }
  return out;
}

test('christianSince och source finns inte kvar; varje religionsbyte har religion, år och källor', () => {
  const byten = data.polities.filter(p => p.conversion);
  for (const p of data.polities) {
    assert.equal(p.christianSince, undefined, `${p.name}: christianSince finns kvar`);
    assert.equal(p.source, undefined, `${p.name}: source finns kvar`);
  }
  for (const p of byten) {
    const c = p.conversion;
    assert.ok(religionIds.has(c.religion), `${p.name}: religionen ${c.religion} finns inte i lagret`);
    assert.ok(Number.isInteger(c.since), `${p.name}: since är inget år`);
    assert.ok(Array.isArray(c.sources) && c.sources.length, `${p.name}: conversion saknar källor`);
    for (const id of c.sources) assert.ok(sourceIds.has(id), `${p.name}: källan ${id} finns inte i sources.json`);
    if (c.note) for (const l of LANGS) assert.ok(c.note[l]?.trim(), `${p.name}: conversion.note saknar ${l}`);
  }
});

test('de 26 kristnade rikena har samma år och källa som i christianSince före #2162', () => {
  const fore = {
    Alodia: [580, 'wp-alodia'], 'Caucasian Iberia': [337, 'wp-christianization-iberia'],
    'Ethiopian Empire': [1270, 'wp-ethiopian-empire'], 'Grand Duchy of Lithuania': [1387, 'wp-christianization-lithuania'],
    'Holy Roman Empire': [962, 'wp-holy-roman-empire'], 'Icelandic Commonwealth': [1000, 'wp-christianization-iceland'],
    "Kievan Rus'": [988, 'wp-christianization-kievan-rus'], 'Kingdom of Armenia': [301, 'wp-armenia-antiquity'],
    'Kingdom of Axum': [325, 'wp-aksum'], 'Kingdom of Denmark': [965, 'wp-christianization-scandinavia'],
    'Kingdom of East Anglia': [630, 'wp-sigeberht-east-anglia'], 'Kingdom of Hungary': [1000, 'wp-christianization-hungary'],
    'Kingdom of Kent': [624, 'wp-christianisation-anglo-saxon-england'], 'Kingdom of Kongo': [1491, 'wp-kongo'],
    'Kingdom of Mercia': [656, 'wp-mercia'], 'Kingdom of Northumbria': [635, 'wp-northumbria'],
    'Kingdom of Poland': [966, 'wp-christianization-poland'], 'Kingdom of Sussex': [681, 'wp-kingdom-of-sussex'],
    'Kingdom of Sweden': [1100, 'wp-christianization-scandinavia'], 'Kingdom of Wessex': [640, 'wp-wessex'],
    'Kingdom of the Franks': [498, 'wp-clovis'], Makuria: [568, 'wp-makuria'], 'Makuria Kingdom': [568, 'wp-makuria'],
    Nobatia: [543, 'wp-nobatia'], 'Roman Empire': [380, 'wp-edict-thessalonica'], Visigoths: [390, 'wp-gothic-christianity'],
  };
  const kristna = data.polities.filter(p => p.conversion?.religion === 'kristendom').map(p => p.name).sort();
  assert.deepEqual(kristna, Object.keys(fore).sort());
  for (const [name, [since, source]] of Object.entries(fore)) {
    assert.deepEqual(register.get(name).conversion, { religion: 'kristendom', since, sources: [source] }, name);
  }
});

test('efter bytet är riket säkert i den nya religionen i varje egen ögonblicksbild', () => {
  const fel = [];
  for (const r of data.religions) {
    for (const s of r.snapshots) {
      if (s.inherited) continue;
      for (const name of s.polities) {
        const c = register.get(name)?.conversion;
        if (c && s.start >= c.since && !(r.id === c.religion && s.sure)) fel.push(`${name} i ${r.id} ${s.start}–${s.end}`);
      }
    }
  }
  assert.deepEqual(fel, []);
});

test('Ghanariket: islam från 1076 med källa och en mening om att källorna skiljer sig', () => {
  const c = register.get('Ghana Empire')?.conversion;
  assert.equal(c?.religion, 'islam');
  assert.equal(c.since, 1076);
  assert.deepEqual(c.sources, ['wp-ghana-empire']);
  assert.match(c.note.sv, /Källorna skiljer sig/);
  assert.match(c.note.sv, /almoravid/i);
  for (const l of LANGS) assert.match(c.note[l], /1076/, `note.${l} saknar 1076`);
});

test('Koumbi Saleh ligger i Ghanarikets gräns i klickrutans fil 800–1201', () => {
  const periods = shapes['Ghana Empire'] || [];
  for (const year of [800, 1050, 1100, 1150, 1200]) {
    assert.ok(periods.some(p => p.start <= year && year <= p.end && inGeometry(p.geometry, ...KOUMBI_SALEH)),
      `Ghanariket ${year} täcker inte Koumbi Saleh`);
  }
});

test('Koumbi Saleh: traditionell religion (osäker) före 1100, islam (säker) från 1100 genom Ghanariket', () => {
  for (const year of [800, 1000, 1050, 1099]) {
    const here = religionsHere(year, KOUMBI_SALEH);
    assert.deepEqual(here.map(h => [h.id, h.sure]), [['afrikansk', false]], `${year}`);
    assert.ok(here[0].polities.includes('Ghana Empire'), `${year}: Ghanariket saknas`);
  }
  for (const year of [1100, 1150, 1199]) {
    const here = religionsHere(year, KOUMBI_SALEH);
    assert.deepEqual(here.map(h => [h.id, h.sure]), [['islam', true]], `${year}`);
    assert.ok(here[0].polities.includes('Ghana Empire'), `${year}: Ghanariket saknas`);
  }
});
