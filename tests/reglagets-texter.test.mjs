// Reglagets texter på fem språk (#1101): inga hårdkodade svenska texter i js/timeline.js, varje nyckel reglaget använder finns i alla
// språkfiler (singular och plural där det behövs), decimaltecknet följer språket och romerska siffror räcker till århundrade 100.
// Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const LANGS = ['sv', 'en', 'de', 'es', 'fr'];
const dicts = Object.fromEntries(LANGS.map(l => [l, JSON.parse(read(`data/ui/${l}.json`))]));
const source = read('js/timeline.js');
const model = new URL('../js/model.js', import.meta.url).href;

// Texten utan kommentarer, så att svenska i kommentarerna inte räknas
const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '');

test('js/timeline.js har ingen hårdkodad svensk text', () => {
  const literals = [...code.matchAll(/'([^'\n]*)'|"([^"\n]*)"|`([^`]*)`/g)].map(m => m[1] ?? m[2] ?? m[3]);
  const swedish = literals.filter(s => /[åäöÅÄÖ]/.test(s) || /\b(år|dag|dagar|sedan|Välj|Tillbaka)\b/.test(s));
  assert.deepEqual(swedish, [], 'texter som syns för besökaren ska ligga i data/ui/<språk>.json');
});

test('varje gränssnittsnyckel som reglaget använder finns på alla fem språk', () => {
  const keys = new Set([...code.matchAll(/\b(?:ui|pluralUi)\(\s*'([\w.]+)'/g)].map(m => m[1]));
  for (const k of ['time.rateYears', 'time.yearsAgo', 'time.stepNow', 'time.step', 'jump.outsideBounds', 'time.since']) assert.ok(keys.has(k), `${k} används inte längre i timeline.js`);
  for (const l of LANGS) for (const k of keys) assert.ok(dicts[l][k] != null, `${l} saknar ${k}`);
});

test('stegbeskedet har singular och plural med {n} på alla språk', () => {
  for (const l of LANGS) {
    const v = dicts[l]['time.stepNow'];
    assert.ok(Array.isArray(v) && v.length === 2, `${l}: time.stepNow ska vara [en, flera]`);
    for (const s of v) assert.match(s, /\{n\}/, `${l}: ${s}`);
  }
  assert.match(dicts.en['time.stepNow'][0], /\{n\} year\.$/); // "1 year", inte "1 years"
  assert.match(dicts.de['time.stepNow'][0], /\{n\} Jahr\.$/);
  assert.match(dicts.es['time.stepNow'][0], /\{n\} año\.$/);
  assert.match(dicts.fr['time.stepNow'][0], /\{n\} an\.$/);
});

const run = (lang, body) => {
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', `
    globalThis.location = { search: '?lang=${lang}' };
    const m = await import(${JSON.stringify(model)});
    console.log(JSON.stringify(${body}));
  `], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout);
};

test('decimaltecknet i farten följer språket', () => {
  const want = { sv: '2,5', en: '2.5', de: '2,5', es: '2,5', fr: '2,5' };
  for (const l of LANGS) assert.equal(run(l, 'm.formatDecimal(2.5)'), want[l], l);
  assert.equal(run('en', 'm.formatDecimal(5)'), '5');
});

test('romerska siffror räcker till femtionde och hundrade århundradet (spanska och franska)', () => {
  // 5000 f.Kr. (astronomiskt -4999) ligger i "5000-talet f.Kr.", det 51:a århundradet i räkningen (centuryOf): LI, inte XXXXXI
  assert.equal(run('es', 'm.formatCentury(-4999)'), 'siglo LI a. C.');
  assert.equal(run('fr', 'm.formatCentury(-4999)'), 'LIe siècle av. J.-C.');
  assert.equal(run('es', 'm.formatCentury(-3999)'), 'siglo XLI a. C.');
  assert.equal(run('fr', 'm.formatCentury(-9799)'), 'XCIXe siècle av. J.-C.');
  assert.equal(run('fr', 'm.formatCentury(-9899)'), 'Ce siècle av. J.-C.');
  assert.equal(run('fr', 'm.formatCentury(1325)'), 'XIVe siècle'); // oförändrat
  assert.equal(run('es', 'm.formatCentury(-549)'), 'siglo VI a. C.');
});
