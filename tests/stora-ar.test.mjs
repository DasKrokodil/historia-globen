// Stora år (#1085): Y-… i edtf, tusentalsavgränsare per språk (ordlistan avsnitt 3 och 13), miljoner år med singular och plural,
// och inskrivna stora år. Befintlig visning (år med upp till fyra siffror) ändras inte.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const model = new URL('../js/model.js', import.meta.url).href;
const NB = ' ';
const cases = {
  sv: { big: `300${NB}000 f.Kr.`, ce: `12${NB}000`, small: '2600 f.Kr.', m: ['1 miljon år', '2 miljoner år', '1,8 miljoner år', '2,5 miljoner år'] },
  en: { big: '300,000 BC', ce: '12,000', small: '2600 BC', m: ['1 million years', '2 million years', '1.8 million years', '2.5 million years'] },
  de: { big: '300.000 v. Chr.', ce: '12.000', small: '2600 v. Chr.', m: ['1 Million Jahre', '2 Millionen Jahre', '1,8 Millionen Jahre', '2,5 Millionen Jahre'] },
  es: { big: `300${NB}000 a. C.`, ce: `12${NB}000`, small: '2600 a. C.', m: ['1 millón de años', '2 millones de años', '1,8 millones de años', '2,5 millones de años'] },
  fr: { big: `300${NB}000 av. J.-C.`, ce: `12${NB}000`, small: '2600 av. J.-C.', m: ['1 million d’années', '2 millions d’années', '1,8 million d’années', '2,5 millions d’années'] },
};

for (const [lang, want] of Object.entries(cases)) {
  test(`stora år på ${lang}: avgränsare, miljoner och oförändrade små år`, () => {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
      globalThis.location = { search: '?lang=${lang}' };
      const { LANG, formatYear, formatYearCount, yearParts } = await import(${JSON.stringify(model)});
      console.log(JSON.stringify({
        lang: LANG,
        big: formatYear(-299999),
        ce: formatYear(12000),
        small: formatYear(-2599),
        y1325: formatYear(1325),
        y551: formatYear(-550),
        parts: yearParts(-299999),
        m: [1e6, 2e6, 1.8e6, 2.5e6].map(formatYearCount),
      }));
    `], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const got = JSON.parse(result.stdout);
    assert.equal(got.lang, lang);
    assert.equal(got.big, want.big);
    assert.equal(got.ce, want.ce);
    assert.equal(got.small, want.small);
    assert.equal(got.y1325, '1325');
    assert.ok(got.y551.startsWith('551 '), got.y551);
    assert.equal(got.parts[0] + ' ' + got.parts[1], want.big);
    assert.deepEqual(got.m, want.m);
  });
}

test('Y-… i edtf och inskrivna stora år', () => {
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
    globalThis.location = { search: '?lang=sv' };
    const { edtfSpan, parseYear, parseYearInput } = await import(${JSON.stringify(model)});
    console.log(JSON.stringify({
      one: edtfSpan({ edtf: 'Y-60000', start: 0, end: 0 }),
      approx: edtfSpan({ edtf: 'Y-60000~', start: 0, end: 0 }),
      span: edtfSpan({ edtf: 'Y-100000/Y-58000', start: 0, end: 0 }),
      mixed: edtfSpan({ edtf: 'Y-12000/-9999', start: 0, end: 0 }),
      old: edtfSpan({ edtf: '1879-01-22', start: 0, end: 0 })[0] > 1879,
      p1: parseYear('300 000 f.Kr.'),
      p2: parseYear('300000 BC'),
      p3: parseYear('2600 f.Kr.'),
      p4: parseYear('1325'),
      i1: parseYearInput('300000 f.Kr.', 'bce'),
      i2: parseYearInput('300 000', 'bce'),
      i3: parseYearInput('260301', 'bce').type,
      i4: parseYearInput('12000', 'bce').year,
    }));
  `], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const got = JSON.parse(result.stdout);
  assert.deepEqual(got.one, [-60000, -59999]);
  assert.deepEqual(got.approx, [-60000, -59999]);
  assert.deepEqual(got.span, [-100000, -57999]);
  assert.deepEqual(got.mixed, [-12000, -9998]);
  assert.equal(got.old, true);
  assert.equal(got.p1, -299999);
  assert.equal(got.p2, -299999);
  assert.equal(got.p3, -2599);
  assert.equal(got.p4, 1325);
  assert.deepEqual(got.i1, { type: 'year', year: -299999, date: null });
  assert.equal(got.i2.year, -299999);
  assert.equal(got.i3, 'date');
  assert.equal(got.i4, -11999);
});
