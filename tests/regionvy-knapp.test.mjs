// Knappen i platskortet lovar bara regionvyn när den ryms (#1692): texten följer om den fria ytan rymmer regionvyn (MIN_FREE i
// js/region-frame.js), annars heter knappen "Visa på Platt karta" (orden ändrades i #1864, regeln är oförändrad). Regeln är ren (regionButtonKey, hasRoom) och delas av beslutet när
// vyn öppnas och av texten; mätningen av den fria ytan och att texten följer fönstret prövas av webbläsartestet
// (tests/webblasare.mjs, "platskortets knapp säger Platt karta när regionvy inte ryms").
// Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { placeBounds } from '../js/place-geo.js';
import { regionButtonKey, hasRoom, MIN_FREE, freeArea } from '../js/region-frame.js';
import { flatAction } from '../js/focus/place.js';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const places = JSON.parse(read('data/platser.json')).places;
const bounds = id => placeBounds(places.find(p => p.id === id));
const REGION = 'place.regionMap', FLAT = 'place.flatMap';

test('hasRoom: exakt MIN_FREE räcker, en pixel mindre i någon led gör det inte, och ingen yta ger nej', () => {
  assert.deepEqual(MIN_FREE, { w: 230, h: 150 });
  assert.equal(hasRoom({ x: 0, y: 0, w: MIN_FREE.w, h: MIN_FREE.h }), true);
  assert.equal(hasRoom({ x: 0, y: 0, w: MIN_FREE.w - 1, h: MIN_FREE.h }), false);
  assert.equal(hasRoom({ x: 0, y: 0, w: MIN_FREE.w, h: MIN_FREE.h - 1 }), false);
  assert.equal(hasRoom(null), false);
  assert.equal(hasRoom(undefined), false);
});

test('Skåne och Danmark: regionvyn när ytan ryms, Platt karta när den inte gör det', () => {
  for (const id of ['skane', 'danmark']) {
    assert.equal(regionButtonKey(bounds(id), { x: 0, y: 0, w: 300, h: 200 }), REGION, `${id}: ryms`);
    assert.equal(regionButtonKey(bounds(id), { x: 0, y: 0, w: 300, h: 120 }), FLAT, `${id}: för låg yta (liggande telefon)`);
    assert.equal(regionButtonKey(bounds(id), { x: 0, y: 0, w: 200, h: 400 }), FLAT, `${id}: för smal yta`);
    assert.equal(regionButtonKey(bounds(id), null), FLAT, `${id}: ytan kunde mätas men var tom`);
    // Okänd yta (inget att mäta på): som förut, knappen lovar regionvyn
    assert.equal(regionButtonKey(bounds(id), undefined), REGION, `${id}: okänd yta`);
  }
});

test('Sverige har alltid Platt karta och en stor plats (Grönland, Aotearoa) alltid regionvyn, hur liten ytan än är', () => {
  const tiny = { x: 0, y: 0, w: 10, h: 10 }, big = { x: 0, y: 0, w: 900, h: 600 };
  assert.equal(regionButtonKey(bounds('sverige'), big), FLAT);
  assert.equal(regionButtonKey(bounds('sverige'), tiny), FLAT);
  for (const id of ['gronland', 'aotearoa']) {
    assert.equal(regionButtonKey(bounds(id), tiny), REGION, `${id}: regionvyn på globen har ingen gräns för ytan`);
    assert.equal(regionButtonKey(bounds(id), big), REGION, id);
  }
  // En plats utan gräns har ingen regionvy
  assert.equal(regionButtonKey(null, big), FLAT);
});

test('de fyra storlekarna ur issuet: samma regel på de mått som kortet, fokusraden och knapparna lämnar', () => {
  // Kartans ruta och det som täcker den, som uppmätt i Playwright 2026-11-16 (Skåne, år 1827, kortet öppet), i kartans pixlar
  // med luft runt (GAP 8 i controllers/region.js). Provet kontrollerar regeln på ytorna, inte mätningen i webbläsaren.
  const skane = bounds('skane'), shapeOf = b => ({ wide: (b.east - b.west) * Math.cos((b.north + b.south) / 2 * Math.PI / 180), high: b.north - b.south });
  const sizes = [
    // [namn, kartans ruta, det som täcker, ska rymmas?]
    ['800 × 360', { w: 800, h: 120 }, [{ x0: 370, y0: -8, x1: 800, y1: 88 }], false],
    ['640 × 360', { w: 640, h: 204 }, [{ x0: 8, y0: 45, x1: 632, y1: 146 }, { x0: 8, y0: 138, x1: 632, y1: 212 }], false],
    ['400 × 800', { w: 400, h: 644 }, [{ x0: 8, y0: 443, x1: 392, y1: 544 }, { x0: 8, y0: 536, x1: 392, y1: 652 }, { x0: 8, y0: 8, x1: 296, y1: 100 }], true],
    ['1280 × 800', { w: 1280, h: 560 }, [{ x0: 858, y0: 11, x1: 1280, y1: 508 }, { x0: 262, y0: 501, x1: 1018, y1: 566 }], true],
  ];
  for (const [name, view, covers, room] of sizes) {
    const free = freeArea(view, covers, shapeOf(skane));
    assert.equal(hasRoom(free), room, `${name}: fri yta ${Math.round(free.w)} × ${Math.round(free.h)}`);
    assert.equal(regionButtonKey(skane, free), room ? REGION : FLAT, name);
  }
});

test('knappen: texten och namnet för skärmläsare följer nyckeln, och utan nyckel bara platsens storlek', () => {
  const skane = places.find(p => p.id === 'skane'), sverige = places.find(p => p.id === 'sverige');
  const a = flatAction(skane, () => {}, FLAT), b = flatAction(skane, () => {}, REGION);
  assert.notEqual(a.text, b.text, 'de två texterna ska skilja sig åt');
  assert.ok(a.label.startsWith(a.text) && b.label.startsWith(b.text), 'namnet för skärmläsare börjar med knappens text');
  // Utan nyckel (inget mått): Skåne lovar regionvyn som förut, Sverige Platt karta
  assert.equal(flatAction(skane, () => {}).text, b.text);
  assert.equal(flatAction(sverige, () => {}).text, a.text);
});

test('båda knapptexterna finns på alla fem språk och skiljer sig åt (ingen ny text i #1692)', () => {
  const langs = JSON.parse(read('data/ui/sprak.json')).languages.map(l => l.id);
  assert.deepEqual([...langs].sort(), ['de', 'en', 'es', 'fr', 'sv']);
  for (const l of langs) {
    const ui = JSON.parse(read(`data/ui/${l}.json`));
    assert.ok(ui[FLAT] && ui[REGION], `${l}: båda texterna ska finnas`);
    assert.notEqual(ui[FLAT], ui[REGION], `${l}: texterna ska skilja sig åt`);
  }
});
