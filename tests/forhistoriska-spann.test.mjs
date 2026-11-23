// Förhistoriska tidsspann utan falsk exakthet (#2155): före 10 000 f.Kr. avrundas spannets ändar som enstaka år (formatYear,
// roundToStep), så att −46050/−32050 inte visas som "cirka 46 051–32 051 f.Kr.". Datan ändras inte, bara visningen.
// Körs med node --test 'tests/*.test.mjs'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { formatEventTime, formatYear } from '../js/model.js';

const events = JSON.parse(readFileSync(new URL('../data/events.json', import.meta.url), 'utf8')).events;
const byId = id => events.find(e => e.id === id);
const plain = s => s.replace(/[  ]/g, ' ');

test('Fa-Hien Lena, Batur och Sundaland visas avrundade till tusental före 10 000 f.Kr.', () => {
  assert.equal(plain(formatEventTime(byId('pil-och-bage-i-fa-hien-lena'))), 'cirka 46 000–32 000 f.Kr.');
  assert.equal(plain(formatEventTime(byId('baturs-kalderor'))), 'cirka 27 000–18 000 f.Kr.');
  // Slutet efter 10 000 f.Kr. är källans årtal och lämnas orört, som för enstaka år där
  assert.equal(plain(formatEventTime(byId('havet-dranker-sundaland'))), 'cirka 16 000–5000 f.Kr.');
});

test('inget spann före 10 000 f.Kr. slutar på 051 eller annan rest av den astronomiska årsräkningen', () => {
  const deep = events.filter(e => e.start !== e.end && e.start <= -10000);
  assert.ok(deep.length > 10, `bara ${deep.length} spann före 10 000 f.Kr.`);
  for (const e of deep) {
    const text = plain(formatEventTime(e));
    // Talen över 10 000 i texten är hela tusental
    for (const m of text.matchAll(/\b(\d{1,3}(?: \d{3})+)\b/g)) {
      const n = Number(m[1].replace(/ /g, ''));
      if (n >= 10000) assert.equal(n % 1000, 0, `${e.id}: ${text}`);
    }
  }
});

test('enstaka år och spann efter 10 000 f.Kr. är som förut', () => {
  assert.equal(plain(formatEventTime({ start: -46050, end: -46050, edtf: 'Y-46050~' })), plain(`cirka ${formatYear(-46050)}`));
  assert.equal(plain(formatEventTime({ start: -2599, end: -2580, edtf: '-2599/-2580' })), '2600–2581 f.Kr.');
  assert.equal(plain(formatEventTime({ start: -9050, end: -8050, edtf: '-9050~/-8050~' })), 'cirka 9051–8051 f.Kr.');
  assert.equal(formatEventTime({ start: 1500, end: 1600, edtf: '1500/1600' }), '1500–1600');
  // Ett spann som börjar före 10 000 f.Kr. och slutar efter vår tideräknings början
  assert.equal(plain(formatEventTime({ start: -12050, end: 50, edtf: 'Y-12050~/0050~' })), 'cirka 12 000 f.Kr.–50 e.Kr.');
});
