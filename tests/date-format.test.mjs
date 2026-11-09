// Datumformat enligt ordlistan (#983), med samma språkval som i webbläsaren.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const model = new URL('../js/model.js', import.meta.url).href;
const cases = [
  ['sv', '4 juli 2026', '4 juli 0044', '4 juli 44 f.Kr.', '4 juli 1 f.Kr.'],
  ['en', '4 July 2026', '4 July 0044', '4 July 44 BC', '4 July 1 BC'],
  ['de', '4. Juli 2026', '4. Juli 0044', '4. Juli 44 v. Chr.', '4. Juli 1 v. Chr.'],
  ['es', '4 de julio de 2026', '4 de julio de 0044', '4 de julio de 44 a. C.', '4 de julio de 1 a. C.'],
  ['fr', '4 juillet 2026', '4 juillet 0044', '4 juillet 44 av. J.-C.', '4 juillet 1 av. J.-C.'],
];

for (const [lang, full, early, bce, zero] of cases) {
  test(`datum på ${lang}: dag, månad, år och tiden före år 1`, () => {
    // En egen process per språk isolerar modulernas språkval och månadstabeller.
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
      globalThis.location = { search: '?lang=${lang}' };
      const { LANG, formatDate, formatEventTime } = await import(${JSON.stringify(model)});
      const event = (year, edtf) => formatEventTime({ start: year, end: year, edtf });
      console.log(JSON.stringify({
        lang: LANG,
        full: formatDate('2026-07-04'),
        event: event(2026, '2026-07-04'),
        early: formatDate('0044-07-04'),
        earlyEvent: event(44, '0044-07-04'),
        bce: event(-43, '-0043-07-04'),
        zero: event(0, '0000-07-04'),
        span: formatEventTime({ start: 1500, end: 1600, edtf: '1500/1600' }),
        year: event(2026, '2026'),
        unchanged: ['2026-07', 'text', '2026-02-30', '2026-13-04', '', null].map(formatDate),
      }));
    `], { encoding: 'utf8', env: { ...process.env, TZ: 'Pacific/Honolulu' } });
    assert.equal(result.status, 0, result.stderr);
    const got = JSON.parse(result.stdout);
    assert.equal(got.lang, lang);
    assert.equal(got.full, full);
    assert.equal(got.event, full);
    assert.equal(got.early, early);
    assert.equal(got.earlyEvent, early.replace('0044', '44'));
    assert.equal(got.bce, bce);
    assert.equal(got.zero, zero);
    assert.equal(got.span, '1500–1600');
    assert.equal(got.year, '2026');
    assert.deepEqual(got.unchanged, ['2026-07', 'text', '2026-02-30', '2026-13-04', '', '']);
  });
}
