import test from 'node:test';
import assert from 'node:assert/strict';
import { parseYear, parseYearInput } from '../js/model.js';

test('årshoppet tolkar 0 som internår 0 oavsett vald era', () => {
  for (const era of ['ce', 'bce']) {
    for (const text of ['0', ' 0 ', '0000']) assert.deepEqual(parseYearInput(text, era), { type: 'year', year: 0, date: null });
    assert.equal(parseYearInput('1', era).year, era === 'ce' ? 1 : 0);
    assert.equal(parseYearInput('500', era).year, era === 'ce' ? 500 : -499);
  }
});

test('minustecken och ogiltiga tecken avvisas utan ett användbart år', () => {
  for (const era of ['ce', 'bce']) for (const text of ['-500', '−500', '–500', '-0', '−0', 'AD -500', '+500', '500.5', '1e3', '500abc', '500-1', '']) {
    const result = parseYearInput(text, era);
    assert.equal(result.type, 'invalid', `${era}: ${text}`);
    assert.equal(result.year, null);
    assert(result.error.length > 0);
  }
  // Intervallformulärets separata årparser behåller sitt befintliga kontrakt.
  assert.equal(parseYear('-500'), -499);
});

test('datum behåller sin egen tideräkning och fyrsiffriga år, även med f.Kr. valt', () => {
  const now = new Date('2026-11-10T12:00:00Z');
  for (const era of ['ce', 'bce']) {
    for (const text of ['1986-04-26', '19860426', '860426']) assert.deepEqual(parseYearInput(text, era, now), { type: 'date', year: 1986, date: '1986-04-26' });
    for (const text of ['0000-01-01', '00000101']) assert.deepEqual(parseYearInput(text, era, now), { type: 'date', year: 0, date: '0000-01-01' });
    assert.equal(parseYearInput('2024-02-29', era).type, 'date');
    assert.equal(parseYearInput('2023-02-29', era).type, 'invalid');
    assert.equal(parseYearInput('19861340', era).type, 'invalid');
    assert.equal(parseYearInput('44 f.Kr.', era).year, -43);
    assert.equal(parseYearInput('44 e.Kr.', era).year, 44);
  }
});
