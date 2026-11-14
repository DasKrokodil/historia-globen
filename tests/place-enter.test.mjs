// Enter på globen och kartan (#1161, #1454): i Fokus på en plats öppnar Enter kortet igen, och i andra lägen där man följer något
// säger statusraden varför ingenting händer. Provet kör controllers/places.js med en låtsasapp, så att beslutet i activate() prövas
// utan webbläsare; den riktiga vägen (globen, kartan, skärmläsarens rad) prövas av webbläsartestet.
// Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createPlaces } from '../js/controllers/places.js';
import { bindStatus, resetStatus } from '../js/ui/status.js';
import { MODES } from '../js/state.js';
import { ui } from '../js/i18n.js';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const json = p => JSON.parse(read(p));

// Statusraden skriver i nästa bildruta; i node finns ingen, så den kommer direkt
globalThis.requestAnimationFrame ??= fn => { fn(); return 0; };

/** Låtsasappen: bara det controllers/places.js rör vid när den skapas och när Enter trycks. */
function setup({ focus = null, modes = [] } = {}) {
  const canvas = () => ({ addEventListener() {}, classList: { toggle() {} } });
  const status = { textContent: '' };
  resetStatus();
  bindStatus(status);
  const calls = [];
  const app = {
    $: () => canvas(),
    state: { focus, modes: modes.map(mode => ({ mode })), labels: {} },
    data: { events: [] },
    globe: { view: { lon: 0, lat: 0 } },
    flatMap: { centre: () => ({ lon: 0, lat: 0 }) },
    registry: { get: () => ({}) },
    startFocus: key => { calls.push(['startFocus', key]); },
    showFocusFacts: () => { calls.push(['showFocusFacts']); },
    refresh() {},
  };
  createPlaces(app);
  return { enter: () => app.globe.onActivate(), status, calls, app };
}

test('Enter i Fokus på en plats öppnar kortet igen, som knappen Fakta', async () => {
  const { enter, calls, status } = setup({ focus: { type: 'place' }, modes: ['fokus'] });
  await enter();
  assert.deepEqual(calls, [['showFocusFacts']]);
  assert.equal(status.textContent, '', 'kortets rubrik läser upp sig själv; Enter säger inget extra');
});

// Varje läge som hindrar platser säger varför, och det strängaste läget gäller (lektion före tur före intervall före Fokus)
const BUSY = [
  { name: 'Fokus på ett krig', focus: { type: 'war' }, modes: ['fokus'], key: 'place.enterBusy.fokus' },
  { name: 'en tur', modes: ['tur'], key: 'place.enterBusy.tur' },
  { name: 'lektionsläget', modes: ['lektion'], key: 'place.enterBusy.lektion' },
  { name: 'en tur i lektionsläget', modes: ['lektion', 'tur'], key: 'place.enterBusy.lektion' },
  { name: 'ett tidsintervall', modes: ['intervall'], key: 'place.enterBusy.intervall' },
];
for (const { name, focus, modes, key } of BUSY) {
  test(`Enter under ${name} öppnar ingen plats och statusraden säger varför`, async () => {
    const { enter, calls, status } = setup({ focus, modes });
    await enter();
    assert.deepEqual(calls, [], 'ingen plats startades');
    assert.equal(status.textContent, ui(key));
    assert.notEqual(status.textContent, key, `texten för ${key} saknas`);
  });
}

test('en jakt hindrar inte platser: Enter säger vad som gäller i vanligt läge', async () => {
  const { enter, calls, status } = setup({ modes: ['jakt'] });
  await enter();
  assert.deepEqual(calls, []);
  assert.equal(status.textContent, ui('place.noneHere'));
});

test('varje läge som kan hindra en plats har en text på alla fem språken', () => {
  const langs = json('data/ui/sprak.json').languages.map(l => l.id);
  assert.deepEqual(langs.sort(), ['de', 'en', 'es', 'fr', 'sv']);
  for (const mode of MODES.filter(m => m !== 'jakt')) {
    for (const l of langs) {
      const text = json(`data/ui/${l}.json`)[`place.enterBusy.${mode}`];
      assert.ok(text && text.length > 20, `place.enterBusy.${mode} saknas i ${l}.json`);
    }
  }
});

test('hjälpen har raden om konturerna på alla språk, med Enter eller språkets namn på tangenten', () => {
  assert.match(read('index.html'), /data-i18n="help\.s4t"[^>]*>[^<]*prickad kontur[^<]*Enter/);
  const enter = { en: /Enter/, de: /Eingabetaste/, es: /Intro/, fr: /Entrée/ };
  for (const [l, re] of Object.entries(enter)) {
    const d = json(`data/ui/${l}.json`);
    assert.ok(d['help.s4'] && d['help.s4t'], `${l}.json saknar help.s4 eller help.s4t`);
    assert.match(d['help.s4t'], re, `${l}: raden nämner inte tangenten`);
  }
});
