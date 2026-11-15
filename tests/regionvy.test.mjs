// Regionvyn i Platt vy (#1641): ramningen av en liten plats (js/region-frame.js). Ramen räknas ur platsens gräns i
// data/platser.json (placeBounds), skalan i öst–väst är cos(mittbredden), och bara platser upp till cirka 5 grader på marken
// får vyn. Ritningen och knapparna prövas av webbläsartestet (tests/webblasare.mjs, "regionvyn").
// Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { placeBounds } from '../js/place-geo.js';
import { regionSize, regionEligible, regionFrame, freeArea, REGION_MAX_DEG, REGION_FILL } from '../js/region-frame.js';
import { PlacesLayer, entry } from '../js/layers/places.js';
import { LayerRegistry } from '../js/layers/registry.js';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const places = JSON.parse(read('data/platser.json')).places;
const place = id => places.find(p => p.id === id);
const close = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg}: ${a} mot ${b}`);

/** Platt vys största skala i skärmpixlar per grad (zoom 10 på en 1280 × 560 stor karta): regionvyn ska gå förbi den. */
const FLAT_MAX_PPD = Math.max(1280 / 4096, 560 / 2048) * 10 * 2048 / 180;

test('skalan i öst–väst är cos(mittbredden), så att platsen får sin form på marken', () => {
  const b = { west: 10, east: 14, south: 58, north: 62 };
  const { lat0, kx, wide, high } = regionSize(b);
  assert.equal(lat0, 60);
  close(kx, 0.5, 1e-9, 'cos(60°)');
  close(wide, 2, 1e-9, 'fyra längdgrader vid 60° N är två grader på marken');
  assert.equal(high, 4);
  // Vid ekvatorn är en längdgrad lika lång som en breddgrad
  close(regionSize({ west: -1, east: 1, south: -1, north: 1 }).kx, 1, 1e-12, 'ekvatorn');
});

test('Skåne och Danmark får regionvyn; Sverige, Aotearoa och Grönland behåller Platt vys inramning', () => {
  for (const id of ['skane', 'danmark']) {
    const b = placeBounds(place(id));
    assert.ok(regionEligible(b), `${id} ska få regionvyn: ${JSON.stringify(regionSize(b))}`);
    assert.ok(regionSize(b).ground <= REGION_MAX_DEG);
  }
  for (const id of ['sverige', 'aotearoa', 'gronland']) {
    const b = placeBounds(place(id));
    assert.ok(!regionEligible(b), `${id} är större än ${REGION_MAX_DEG} grader och ska inte få regionvyn: ${regionSize(b).ground.toFixed(1)}`);
  }
  // Danmark är 7 längdgrader brett men bara cirka 4 grader på marken (56° N): bredden räknas på marken
  const dk = regionSize(placeBounds(place('danmark')));
  assert.ok(dk.wide < REGION_MAX_DEG && dk.wide > 3, `Danmarks bredd på marken: ${dk.wide}`);
  // En tom eller trasig ruta ger ingen regionvy
  assert.equal(regionEligible({ west: 0, east: 0, south: 0, north: 0 }), false);
  assert.equal(regionEligible({ west: NaN, east: 1, south: 0, north: 1 }), false);
});

test('ramen för Skåne och Danmark: platsen fyller cirka 65 % av den fria ytan, mitt i den, skarpare än Platt vy', () => {
  const view = { w: 1280, h: 560 };
  // Dator: kortet täcker kartan till höger (från x = 866) och fokusraden nertill
  const free = freeArea(view, [{ x0: 858, y0: 8, x1: 1280, y1: 510 }, { x0: 274, y0: 500, x1: 1006, y1: 560 }]);
  assert.ok(free.x + free.w <= 858 && free.y + free.h <= 500, `den fria ytan ligger utanför kortet och fokusraden: ${JSON.stringify(free)}`);
  for (const id of ['skane', 'danmark']) {
    const b = placeBounds(place(id));
    const f = regionFrame(b, view, free);
    const { wide, high } = regionSize(b);
    const w = f.box.x1 - f.box.x0, h = f.box.y1 - f.box.y0;
    // Den led som tar slut först fylls till 65 %, den andra mindre
    const fillW = w / free.w, fillH = h / free.h;
    close(Math.max(fillW, fillH), REGION_FILL, 1e-9, `${id}: största fyllnad`);
    assert.ok(Math.min(fillW, fillH) <= REGION_FILL + 1e-9);
    // Formen: bredd/höjd på skärmen = bredd/höjd på marken
    close(w / h, wide / high, 1e-9, `${id}: formen`);
    // Rutan ligger mitt i den fria ytan och inom den, och kartans mitt flyttas åt öster (kortet ligger till höger)
    close((f.box.x0 + f.box.x1) / 2, free.x + free.w / 2, 1e-6, `${id}: mitt i x`);
    close((f.box.y0 + f.box.y1) / 2, free.y + free.h / 2, 1e-6, `${id}: mitt i y`);
    assert.ok(f.box.x0 >= free.x && f.box.x1 <= free.x + free.w && f.box.y0 >= free.y && f.box.y1 <= free.y + free.h);
    assert.ok(f.lon > (b.west + b.east) / 2, `${id}: kartans mitt ska ligga öster om platsen när kortet täcker till höger`);
    // Skarpare än Platt vy kan visa (36 px per grad vid zoom 10): regionvyn måste rita själv
    assert.ok(f.ppd > FLAT_MAX_PPD * 2, `${id}: ${f.ppd.toFixed(0)} px per grad mot Platt vys ${FLAT_MAX_PPD.toFixed(0)}`);
    close(f.kx, Math.cos((b.north + b.south) / 2 * Math.PI / 180), 1e-12, `${id}: kx`);
  }
  // Skåne: cirka 1,2 grader högt och 2,1 längdgrader brett; höjden tar slut först i datorns fria yta
  const sk = regionFrame(placeBounds(place('skane')), view, free);
  assert.ok(sk.ppd > 200 && sk.ppd < 400, `Skåne: ${sk.ppd} px per grad`);
});

test('mobil: arket och fokusraden nertill och vyns ruta upptill lämnar en fri yta i mitten, och platsen hamnar där', () => {
  const view = { w: 400, h: 640 };
  const shape = regionSize(placeBounds(place('skane')));
  const free = freeArea(view, [{ x0: 8, y0: 440, x1: 392, y1: 640 }, { x0: 8, y0: 30, x1: 300, y1: 160 }], shape);
  assert.deepEqual([free.x, free.y, free.x + free.w, free.y + free.h], [0, 160, 400, 440], 'remsor uppifrån och nerifrån');
  const f = regionFrame(placeBounds(place('skane')), view, free);
  assert.ok(f.box.y0 >= 160 && f.box.y1 <= 440 && f.box.x0 >= 0 && f.box.x1 <= 400, JSON.stringify(f.box));
});

test('den fria ytan väljer den remsa som ger platsen störst skala', () => {
  const view = { w: 1000, h: 600 };
  const box = { x0: 0, y0: 0, x1: 300, y1: 150 }; // rutan uppe till vänster
  // En bred plats (bredare än hög) tappar minst på en remsa uppifrån, en hög plats på en remsa från vänster
  assert.equal(freeArea(view, [box], { wide: 4, high: 1 }).y, 150);
  assert.equal(freeArea(view, [box], { wide: 1, high: 4 }).x, 300);
  // Utan form: den remsa som tar minst yta (300 · 600 mot 1000 · 150: uppifrån)
  assert.equal(freeArea(view, [box]).y, 150);
  // En rektangel utanför ytan eller null ändrar ingenting
  assert.deepEqual(freeArea(view, [null, { x0: 1200, y0: 0, x1: 1300, y1: 10 }]), { x: 0, y: 0, w: 1000, h: 600 });
});

test('platsens lager ritas i regionvyns skarpa karta, och bara lager som anmäler region', () => {
  const registry = new LayerRegistry();
  const calls = [];
  registry.add({ id: 'areas', z: 10, drawOverlay: () => calls.push('areas') });
  registry.add({ ...entry(), drawOverlay: (ctx, W, H, view) => calls.push(['places', view]) });
  const state = { faded: new Set() };
  registry.draw({}, 100, 50, state, () => {}, { region: true, unit: 2 });
  assert.deepEqual(calls, [['places', { region: true, unit: 2 }]], 'bara platsens lager, med vyn');
  calls.length = 0;
  registry.draw({}, 100, 50, state, () => {});
  assert.deepEqual(calls, ['areas', ['places', null]], 'utan vy ritas alla lager som förut');
  assert.equal(entry().region, true);
});

/** En låtsasyta som skriver upp linjebredder och fyllningar, för att se måtten utan webbläsare. */
function recorder() {
  const log = [];
  const ctx = {
    save() {}, restore() {}, set lineJoin(v) {}, set fillStyle(v) { this._fill = v; }, set strokeStyle(v) { this._stroke = v; },
    set lineWidth(v) { this._w = v; }, setLineDash(d) { log.push(['dash', d]); },
    fill(path, rule) { log.push(['fill', this._fill, rule]); }, stroke() { log.push(['stroke', this._stroke, this._w]); },
  };
  return { ctx, log };
}
globalThis.Path2D ??= class { rect() {} addPath() {} moveTo() {} lineTo() {} closePath() {} };

test('linjen i Fokus räknas i skärmpixlar: lika bred på skärmen hur stor bilden än ritas (#1627)', () => {
  const sq = { id: 'sq', boundary: { geometry: { type: 'Polygon', coordinates: [[[10, 50], [12, 50], [12, 52], [10, 52], [10, 50]]] } } };
  const widths = (W, px) => {
    const layer = new PlacesLayer();
    layer.enabled = true; layer.place = sq; layer.px = px;
    const { ctx, log } = recorder();
    layer.drawOverlay(ctx, W, W / 2);
    return log.filter(l => l[0] === 'stroke').map(l => l[2]);
  };
  // 4096-bilden visad med 1,5 skärmpixlar per bildpunkt: px = 1 / 1,5; och utzoomat 4 bildpunkter per skärmpixel
  const zoomed = widths(4096, 1 / 1.5), far = widths(4096, 4);
  // Kärnan är 2,5 skärmpixlar: i bildpunkter 2,5 · px, alltså smal på den förstorade bilden och bred på den utzoomade
  close(zoomed[1] * 1.5, 2.5, 1e-9, 'kärnan i skärmpixlar inzoomat');
  // Aldrig smalare än en bildpunkt, så att linjen inte försvinner på 4096-bilden (Platt vy vid zoom 10: 3,2 skärmpixlar)
  assert.equal(widths(4096, 1 / 3.2)[1], 1);
  close(far[1] / 4, 2.5, 1e-9, 'kärnan i skärmpixlar utzoomat');
  assert.ok(zoomed[0] > zoomed[1], 'den mörka kanten ligger under kärnan och är bredare');
  // Linjen är hel (inga streck som blir fläckar)
  const layer = new PlacesLayer();
  layer.enabled = true; layer.place = sq; layer.px = 1;
  const { ctx, log } = recorder();
  layer.drawOverlay(ctx, 4096, 2048);
  assert.ok(!log.some(l => l[0] === 'dash' && l[1].length), 'Fokus-linjen är inte streckad');
});

test('regionvyn: omgivningen tonas ned utanför platsen och måttet kommer från vyn', () => {
  const sq = { id: 'sq2', boundary: { geometry: { type: 'Polygon', coordinates: [[[10, 50], [12, 50], [12, 52], [10, 52], [10, 50]]] } } };
  const layer = new PlacesLayer();
  layer.enabled = true; layer.place = sq; layer.px = 99; // px gäller 4096-bilden och ska inte användas här
  const { ctx, log } = recorder();
  layer.drawOverlay(ctx, 100000, 50000, { region: true, unit: 2 });
  const fills = log.filter(l => l[0] === 'fill');
  assert.equal(fills.length, 1);
  assert.match(fills[0][1], /0\.25\)$/, 'omgivningen nedtonad cirka 25 %');
  assert.equal(fills[0][2], 'evenodd');
  close(log.filter(l => l[0] === 'stroke')[1][2], 5, 1e-9, 'kärnan 2,5 skärmpixlar · 2 bildpunkter per skärmpixel');
});
