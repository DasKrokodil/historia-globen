// En exakt daterad period är inte historisk osäkerhet (#364).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { uncertaintyRow } from '../js/ui/panel.js';

const events = JSON.parse(readFileSync(new URL('../data/events.json', import.meta.url))).events;

test('en exakt tidsperiod får ingen osäkerhetsrad', () => {
  const event = events.find(item => item.id === 'andra-slaget-i-hakatabukten');
  assert.ok(event, 'testhändelsen ska finnas i data');
  assert.equal(event.edtf, '1281-06/1281-08');
  assert.equal(uncertaintyRow(event), '');
});
