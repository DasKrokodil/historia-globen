// Datumet för ett stopp på en resa på fem språk (#1473): stopDate (js/model.js) har ingen hårdkodad svensk text, varje årstidsnyckel
// finns i alla språkfiler, och resultatet är rätt på varje språk för de edtf-mönster som finns i data/routes/ (sv är byte för byte som förut).
// Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const LANGS = ['sv', 'en', 'de', 'es', 'fr'];
const dicts = Object.fromEntries(LANGS.map(l => [l, JSON.parse(read(`data/ui/${l}.json`))]));
const model = new URL('../js/model.js', import.meta.url).href;
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

// Funktionen utan kommentarer, så att svenska i kommentarerna inte räknas
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '');
const stopDateSource = strip(/export function stopDate\(place\) \{[\s\S]*?\n\}\n/.exec(read('js/model.js'))?.[0] ?? '');

test('stopDate finns i js/model.js och har ingen hårdkodad svensk text', () => {
  assert.ok(stopDateSource.includes('time.season.'), 'stopDate hittades inte eller använder inte time.season.*');
  const literals = [...stopDateSource.matchAll(/'([^'\n]*)'|"([^"\n]*)"|`([^`]*)`/g)].map(m => m[1] ?? m[2] ?? m[3]);
  const swedish = literals.filter(s => /[åäöÅÄÖ]/.test(s) || /\b(hösten|våren|sommaren|vintern|cirka)\b/.test(s));
  assert.deepEqual(swedish, [], 'texter som syns för besökaren ska ligga i data/ui/<språk>.json');
});

test('stopDate och routeStops har ingen kopia av årstidstexterna i story.js, lines.js eller playback.js', () => {
  for (const f of ['js/controllers/story.js', 'js/controllers/playback.js', 'js/layers/lines.js']) {
    assert.doesNotMatch(strip(read(f)), /hösten|våren|sommaren|vintern|-23\$/, `${f} har en egen årstidstext`);
  }
  assert.match(read('js/layers/lines.js'), /const date = stopDate\(place\)/);
});

test('årstidsnycklarna finns på alla fem språk och tar {year}', () => {
  for (const l of LANGS) for (const s of SEASONS) {
    const v = dicts[l][`time.season.${s}`];
    assert.equal(typeof v, 'string', `${l} saknar time.season.${s}`);
    assert.match(v, /\{year\}/, `${l}: time.season.${s} saknar {year}`);
  }
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

test('årstiden i stoppets datum följer språket (edtf 1405-21 till 1405-24)', () => {
  const want = {
    sv: ['våren 1405', 'sommaren 1405', 'hösten 1405', 'vintern 1405'],
    en: ['spring 1405', 'summer 1405', 'autumn 1405', 'winter 1405'],
    de: ['Frühjahr 1405', 'Sommer 1405', 'Herbst 1405', 'Winter 1405'],
    es: ['primavera de 1405', 'verano de 1405', 'otoño de 1405', 'invierno de 1405'],
    fr: ['printemps 1405', 'été 1405', 'automne 1405', 'hiver 1405'],
  };
  for (const l of LANGS) {
    const got = run(l, `[21, 22, 23, 24].map(n => m.stopDate({ edtf: '1405-' + n }))`);
    assert.deepEqual(got, want[l], l);
  }
});

test('årstid före vår tideräkning får språkets f.Kr. (inte de fyra första tecknen av edtf)', () => {
  // astronomiskt -0129 är 130 f.Kr.
  const want = { sv: 'hösten 130 f.Kr.', en: 'autumn 130 BC', de: 'Herbst 130 v. Chr.', es: 'otoño de 130 a. C.', fr: 'automne 130 av. J.-C.' };
  for (const l of LANGS) assert.equal(run(l, `m.stopDate({ edtf: '-0129-23' })`), want[l], l);
});

test('stopDate för de mönster som finns i data/routes/ är oförändrat på svenska och följer språket i övrigt', () => {
  // Alla stopp i datan: etikett, dagsdatum, årstid eller edtf som det står. Tre fall per ordning, hämtade ur datan.
  const stops = [];
  for (const f of readdirSync(new URL('../data/routes/', import.meta.url)).filter(n => n.endsWith('.json') && n !== 'index.json')) {
    for (const r of JSON.parse(read(`data/routes/${f}`)).routes) {
      for (const leg of r.legs) for (const p of leg.places ?? []) if (p.stop) stops.push(p);
    }
  }
  assert.ok(stops.length > 50, 'stoppen i datan hittades inte');
  const kinds = new Set();
  for (const p of stops) kinds.add(p.dateLabel ? 'etikett' : p.date ? 'dag' : /^-?\d{4}-2[1-4]$/.test(p.edtf ?? '') ? 'årstid' : 'edtf');
  assert.ok(kinds.has('etikett') && kinds.has('dag') && kinds.has('årstid'), `mönster som saknas i datan: ${[...kinds]}`);
  // Förväntat svenskt resultat räknas fram för hand ur datan, utan stopDate: samma regler som före #1473
  const MONTHS = dicts.sv['time.months'];
  const expectSv = p => p.dateLabel ? p.dateLabel.sv
    : p.date ? (([y, mo, d]) => `${Number(d)} ${MONTHS[Number(mo) - 1]} ${y}`)(p.date.split('-'))
      : /^-?\d{4}-23$/.test(p.edtf ?? '') ? `hösten ${p.edtf.slice(0, 4)}` : p.edtf ?? '';
  const got = JSON.parse(spawnSync(process.execPath, ['--input-type=module', '-e', `
    globalThis.location = { search: '?lang=sv' };
    const m = await import(${JSON.stringify(model)});
    const stops = JSON.parse(process.argv[1]);
    console.log(JSON.stringify(stops.map(p => m.stopDate(p))));
  `, JSON.stringify(stops)], { encoding: 'utf8' }).stdout);
  assert.deepEqual(got, stops.map(expectSv));
  // På de andra språken väljs språkets egen etikett, och ett dagsdatum får språkets datumform
  const en = JSON.parse(spawnSync(process.execPath, ['--input-type=module', '-e', `
    globalThis.location = { search: '?lang=en' };
    const m = await import(${JSON.stringify(model)});
    console.log(JSON.stringify(JSON.parse(process.argv[1]).map(p => m.stopDate(p))));
  `, JSON.stringify(stops)], { encoding: 'utf8' }).stdout);
  assert.deepEqual(en, stops.map(p => p.dateLabel ? p.dateLabel.en
    : p.date ? new Date(`${p.date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
      : /^-?\d{4}-23$/.test(p.edtf ?? '') ? `autumn ${p.edtf.slice(0, 4)}` : p.edtf ?? ''));
});

test('edtf som inte är en årstid visas som det står (ingen svensk gissning)', () => {
  for (const l of LANGS) {
    assert.equal(run(l, `m.stopDate({ edtf: '1407?' })`), '1407?', l);
    assert.equal(run(l, `m.stopDate({ edtf: '1409-10' })`), '1409-10', l);
    assert.equal(run(l, `m.stopDate({})`), '', l);
  }
});
