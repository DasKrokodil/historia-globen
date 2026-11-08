// Epoker enligt Lgr22 (#845, #476): formen på data/perioder.json och att årtalen är de som står i kursplanen.
// Körs med node --test 'tests/*.test.mjs'. Filen läses inte av appen än (snabbknapparna byggs efter #755).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = name => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url)));
const doc = read('perioder.json');
const sources = read('sources.json').sources;
const LANGS = ['sv', 'en', 'de', 'es', 'fr'];
const lgr22 = doc.divisions.find(d => d.id === 'lgr22');

test('indelningen lgr22 finns, har namn och en förenklingstext på alla fem språk', () => {
  assert.ok(lgr22);
  for (const key of ['name', 'simplification']) for (const l of LANGS) assert.ok(lgr22[key][l]?.length > 10, `${key}.${l}`);
  assert.match(lgr22.simplification.sv, /förenkling/);
  assert.match(lgr22.simplification.sv, /europacentrerad/);
});

test('de fem perioderna har Skolverkets årtal, i kursplanens ordning', () => {
  // Ur Lgr22, kursplanen i historia, centralt innehåll (Skolverket, öppnad 2026-11-08): "cirka 800–1500",
  // "cirka 1500–1800", "cirka 1800–1900" (åk 4–6), "cirka 1850–1950" och "cirka 1900 till nutid" (åk 7–9).
  assert.deepEqual(lgr22.periods.map(p => [p.start, p.end ?? null, !!p.open, p.grades]), [
    [800, 1500, false, '4–6'], [1500, 1800, false, '4–6'], [1800, 1900, false, '4–6'], [1850, 1950, false, '7–9'], [1900, null, true, '7–9'],
  ]);
});

test('varje period har unikt id, namn på alla språk, EDTF som stämmer med start och slut, källa och granskningsnivå', () => {
  const ids = lgr22.periods.map(p => p.id);
  assert.equal(new Set(ids).size, ids.length);
  const srcIds = new Set(sources.map(s => s.id));
  for (const p of lgr22.periods) {
    for (const l of LANGS) assert.ok(p.name[l]?.length > 3, `${p.id}.name.${l}`);
    const [from, to] = p.edtf.split('/');
    assert.equal(from, `${String(p.start).padStart(4, '0')}~`, `${p.id}: edtf start`);
    assert.equal(to, p.open ? '..' : `${String(p.end).padStart(4, '0')}~`, `${p.id}: edtf slut`);
    assert.ok(p.start <= (p.end ?? Infinity));
    assert.ok(p.sources.length >= 1 && p.sources.every(s => srcIds.has(s)), `${p.id}: källan finns i sources.json`);
    assert.ok(['source-checked', 'two-sources'].includes(p.review), `${p.id}: granskningsnivå`);
  }
});

test('källan är Skolverkets kursplan, bara länkad, och kontrollerad 2026-11-08', () => {
  const src = sources.find(s => s.id === 'skolverket-lgr22-historia');
  assert.ok(src);
  assert.match(src.url, /^https:\/\/www\.skolverket\.se\//);
  assert.match(src.license, /bara länkad/);
  assert.equal(src.checked, '2026-11-08');
});

test('Skolverkets Syllabus API är andra vägen till samma kursplan, och höjer inte granskningsnivån', () => {
  const api = sources.find(s => s.id === 'skolverket-syllabus-api-historia');
  assert.ok(api);
  assert.match(api.url, /^https:\/\/api\.skolverket\.se\/syllabus\/.*GRGRHIS01$/);
  assert.match(api.license, /bara länkad/);
  for (const p of lgr22.periods) {
    assert.ok(p.sources.includes('skolverket-syllabus-api-historia'), `${p.id}: API-källan`);
    assert.equal(p.review, 'source-checked', `${p.id}: samma utgivare räknas inte som två källor`);
  }
});

test('Del 2 (epoknamn utan årtal i läroplanen) är inte med förrän en andra källa är öppnad', () => {
  const names = JSON.stringify(lgr22.periods.map(p => p.name.sv)).toLowerCase();
  for (const word of ['stenålder', 'bronsålder', 'järnålder', 'antiken', 'medeltid']) assert.ok(!names.includes(word), word);
});
