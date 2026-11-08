// Epoker (#845, #476): formen på data/perioder.json, årtalen i Lgr22 (kursplanen) och de nordiska åldrarna (Historiska museet).
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

test('Del 2 (epoknamn utan årtal i läroplanen) är inte med förrän en andra källa är öppnad', () => {
  const names = JSON.stringify(lgr22.periods.map(p => p.name.sv)).toLowerCase();
  for (const word of ['stenålder', 'bronsålder', 'järnålder', 'antiken', 'medeltid']) assert.ok(!names.includes(word), word);
});

const forntid = doc.divisions.find(d => d.id === 'norden-forntid');
const edtfYear = y => (Math.abs(y) > 9999 ? 'Y' : '') + (y < 0 ? '-' : '') + String(Math.abs(y)).padStart(4, '0');

test('Del 2a: de tre nordiska åldrarna har Historiska museets årtal (astronomiska år), i tidsordning och utan glapp', () => {
  // Historiska museet, perioderna i Norden (öppnad 2026-11-08): stenålder 12 000–1700 f.Kr., bronsålder 1700–500 f.Kr.,
  // järnålder 500 f.Kr.–550 e.Kr. (översikten; järnålderns egen sida säger 1100 e.Kr., se note). N f.Kr. = 1 − N.
  assert.ok(forntid);
  for (const key of ['name', 'simplification']) for (const l of LANGS) assert.ok(forntid[key][l]?.length > 10, `${key}.${l}`);
  assert.match(forntid.simplification.sv, /förenkling/);
  assert.deepEqual(forntid.periods.map(p => [p.id, p.start, p.end]), [
    ['nordisk-stenalder', -11999, -1699], ['nordisk-bronsalder', -1699, -499], ['nordisk-jarnalder', -499, 550],
  ]);
});

test('Del 2a: namn, EDTF, källor och granskningsnivå stämmer, och oenigheten om järnålderns slut står öppet', () => {
  const srcIds = new Set(sources.map(s => s.id));
  for (const p of forntid.periods) {
    for (const l of LANGS) assert.ok(p.name[l]?.length > 5, `${p.id}.name.${l}`);
    assert.equal(p.edtf, `${edtfYear(p.start)}~/${edtfYear(p.end)}~`, `${p.id}: edtf`);
    assert.ok(p.sources.every(s => srcIds.has(s)), `${p.id}: källan finns i sources.json`);
    assert.ok(p.sources.every(s => s.startsWith('historiska-')), `${p.id}: källan är Historiska museet`);
    assert.equal(p.review, 'source-checked', `${p.id}: en källa (museets sidor), inte two-sources`);
  }
  const iron = forntid.periods.find(p => p.id === 'nordisk-jarnalder');
  for (const l of LANGS) assert.match(iron.note[l], /1100/, `järnåldern.note.${l}`);
  assert.match(iron.note.sv, /Källorna skiljer sig/);
});

test('Del 2a: Historiska museets källor är bara länkade och kontrollerade 2026-11-08', () => {
  for (const id of ['historiska-perioder', 'historiska-stenalder', 'historiska-bronsalder', 'historiska-jarnalder']) {
    const src = sources.find(s => s.id === id);
    assert.ok(src, id);
    assert.match(src.url, /^https:\/\/historiska\.se\//);
    assert.match(src.license, /bara länkad/);
    assert.equal(src.checked, '2026-11-08');
  }
});
