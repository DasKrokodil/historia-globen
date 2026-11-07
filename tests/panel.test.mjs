// En exakt daterad period är inte historisk osäkerhet (#364).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { uncertaintyRow, mythsHtml } from '../js/ui/panel.js';

const events = JSON.parse(readFileSync(new URL('../data/events.json', import.meta.url))).events;

test('en exakt tidsperiod får ingen osäkerhetsrad', () => {
  const event = events.find(item => item.id === 'andra-slaget-i-hakatabukten');
  assert.ok(event, 'testhändelsen ska finnas i data');
  assert.equal(event.edtf, '1281-06/1281-08');
  assert.equal(uncertaintyRow(event), '');
});

// Vanliga missuppfattningar i faktarutan (#838)

const myth = {
  id: 'prov', events: ['x'], review: 'two-sources', sources: ['a', 'saknas'],
  claim: { sv: 'Påstående <b>fet</b>' }, truth: { sv: 'Sanningen' }, origin: { sv: 'Ursprunget' },
};
const srcs = { a: { id: 'a', title: 'Källan A', url: 'https://example.org/a' } };

test('missuppfattningen visar påstående, sanning, ursprung och källa, och undflyr HTML', () => {
  const html = mythsHtml([myth], srcs);
  assert.match(html, /data-myth="prov"/);
  assert.match(html, /Påstående &lt;b&gt;fet&lt;\/b&gt;/);
  assert.ok(!html.includes('<b>fet</b>'), 'texten ska inte tolkas som HTML');
  assert.match(html, /Sanningen/);
  assert.match(html, /<details class="myth-origin">[\s\S]*Ursprunget/);
  assert.match(html, /href="https:\/\/example\.org\/a"/);
  assert.ok(!/saknas/.test(html.replace(/detail\.sourceMissing/g, '')), 'ett okänt källa-id ska hoppas över');
  assert.match(html, /review-badge two/);
});

test('missuppfattningen ritas inte medan källorna laddas eller när listan är tom', () => {
  assert.equal(mythsHtml([myth], srcs, true), '');
  assert.equal(mythsHtml([], srcs), '');
  assert.equal(mythsHtml(undefined, srcs), '');
});
