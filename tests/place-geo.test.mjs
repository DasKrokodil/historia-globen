// Tryck på en plats (#1161): platsen under en punkt, gränsrutan för inramning i Platt vy och när konturerna ritas.
// Körs med node --test 'tests/*.test.mjs'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { placeAt, placeBounds, inGeometry, edgeKm, placeEvents } from '../js/place-geo.js';
import { entry } from '../js/layers/places.js';

const square = (id, w, s, e, n) => ({ id, boundary: { geometry: { type: 'Polygon', coordinates: [[[w, s], [e, s], [e, n], [w, n], [w, s]]] } } });
const real = JSON.parse(readFileSync(new URL('../data/platser.json', import.meta.url), 'utf8')).places;
const place = id => real.find(p => p.id === id);

test('platsen under en punkt är den vars gräns innehåller punkten, annars null', () => {
  const places = [square('a', 0, 0, 10, 10), square('b', 20, 0, 30, 10)];
  assert.equal(placeAt(places, 5, 5).id, 'a');
  assert.equal(placeAt(places, 25, 5).id, 'b');
  assert.equal(placeAt(places, 15, 5), null, 'mellan platserna');
  assert.equal(placeAt(places, 5, 15), null, 'utanför rutan');
  assert.equal(placeAt([], 5, 5), null);
});

test('ligger punkten inom flera platser väljs den minsta, oavsett ordning', () => {
  const land = square('land', 0, 0, 10, 10), landskap = square('landskap', 4, 4, 6, 6);
  assert.equal(placeAt([land, landskap], 5, 5).id, 'landskap');
  assert.equal(placeAt([landskap, land], 5, 5).id, 'landskap');
  assert.equal(placeAt([land, landskap], 1, 1).id, 'land', 'utanför landskapet gäller landet');
});

test('ett hål i gränsen räknas som utanför, och kustmarginalen gäller inte för tryck', () => {
  const ring = (w, s, e, n) => [[w, s], [e, s], [e, n], [w, n], [w, s]];
  const withHole = { id: 'h', boundary: { geometry: { type: 'Polygon', coordinates: [ring(0, 0, 10, 10), ring(4, 4, 6, 6)] } } };
  assert.equal(placeAt([withHole], 5, 5), null);
  assert.equal(placeAt([withHole], 1, 1).id, 'h');
  assert.equal(placeAt([square('a', 0, 0, 10, 10)], 10.05, 5), null, 'strax utanför gränsen är inte platsen');
});

test('Grönland och Aotearoa hittas på riktiga punkter i datan, och havet runt dem ger ingen plats', () => {
  assert.equal(placeAt(real, -40, 72)?.id, 'gronland', 'inlandsisen');
  // 1:50m-kusten är grov: Nuuk ligger 1 km utanför linjen. Ett tryck räknar bara det som konturen visar (ingen kustmarginal).
  assert.equal(placeAt(real, -51.72, 64.18), null, 'Nuuk ligger precis utanför den ritade gränsen');
  assert.equal(placeAt(real, -21.9, 64.15), null, 'Reykjavik ligger på Island');
  assert.equal(placeAt(real, -30, 60), null, 'Atlanten sydost om Grönland');
  assert.equal(placeAt(real, 174.76, -36.85)?.id, 'aotearoa', 'Auckland');
  assert.equal(placeAt(real, 174.78, -41.29)?.id, 'aotearoa', 'Wellington');
  assert.equal(placeAt(real, 160, -40), null, 'Tasmanhavet');
});

test('gränsrutan viks upp kring platsens mitt, så att datumgränsen inte gör Aotearoa 340 grader bred', () => {
  const nz = placeBounds(place('aotearoa'));
  assert.ok(nz.east - nz.west < 30, `Aotearoa är ${nz.east - nz.west} grader bred`);
  assert.ok(nz.west > 160 && nz.east < 190, 'longituderna är uppvikta kring 174 grader (Chathamöarna ligger över 180)');
  assert.ok(nz.south < -46 && nz.north > -35);
  const gl = placeBounds(place('gronland'));
  assert.ok(gl.west < -70 && gl.east > -15 && gl.north > 80 && gl.south < 61);
  // Utan egen mitt används platsens view.center; en ruta som korsar datumgränsen får en ostlig kant över 180
  const across = { view: { center: [0, 179] }, boundary: { geometry: { type: 'Polygon', coordinates: [[[170, -5], [-170, -5], [-170, 5], [170, 5], [170, -5]]] } } };
  const b = placeBounds(across);
  assert.equal(b.west, 170);
  assert.equal(b.east, 190);
});

test('lagret ritar konturerna bara utanför Fokus och inzoomat, och platsen man följer som förut', () => {
  const { layer, enabled, update } = entry();
  const s = extra => ({ focus: null, labels: { placeHints: true }, ...extra });
  const hints = state => { update(state); return layer.hints; };
  assert.equal(hints(s()), true, 'inzoomat i vanligt läge');
  assert.equal(hints(s({ labels: { placeHints: false } })), false, 'utzoomat');
  assert.equal(hints(s({ labels: {} })), false);
  assert.equal(hints(s({ focus: { type: 'war' } })), false, 'inte i Fokus');
  assert.equal(hints(s({ focus: { type: 'theme' } })), false);
  assert.equal(enabled(s()), false, 'valen i Lager styr inte konturerna runt platserna med kort');
  assert.equal(enabled(s({ focus: { type: 'war' } })), false);
  assert.equal(enabled(s({ focus: { type: 'place', place: place('gronland') } })), true, 'platsen man följer ritas som förut');
  update(s({ focus: { type: 'place', place: place('aotearoa') } }));
  assert.equal(layer.hints, false, 'i Fokus på en plats ritas bara den platsen');
  assert.equal(layer.place.id, 'aotearoa');
  update(s());
  assert.equal(layer.place, null);
});

test('ritar lagret något? Bara med platser som har kort: tomt kort-lista ritar inget', () => {
  const { layer } = entry();
  const calls = [];
  const ctx = { save: () => calls.push('save'), restore() {}, stroke: () => calls.push('stroke'), set lineJoin(v) {}, set strokeStyle(v) {}, set lineWidth(v) {}, setLineDash() {}, fill() {} };
  globalThis.Path2D ??= class { moveTo() {} lineTo() {} closePath() {} };
  layer.hints = true;
  layer.drawOverlay(ctx, 4096, 2048);
  assert.deepEqual(calls, [], 'inga platser med kort');
  layer.cards = [place('gronland'), place('aotearoa')];
  layer.drawOverlay(ctx, 4096, 2048);
  assert.equal(calls.filter(c => c === 'stroke').length, 4, 'en kant och en kontur per plats');
  calls.length = 0;
  layer.hints = false;
  layer.drawOverlay(ctx, 4096, 2048);
  assert.deepEqual(calls, [], 'inget utan hints och utan platsen man följer');
});

test('platsen som ett turssteg öppnar ritas som i Fokus utan att något Fokus pågår, och konturerna runt platserna visas då inte (#1163)', () => {
  const { layer, update } = entry();
  const calls = [];
  const ctx = { save: () => calls.push('save'), restore() {}, stroke: () => calls.push('stroke'), fill: () => calls.push('fill'), set lineJoin(v) {}, set strokeStyle(v) {}, set fillStyle(v) {}, set lineWidth(v) {}, setLineDash() {} };
  globalThis.Path2D ??= class { moveTo() {} lineTo() {} closePath() {} };
  layer.cards = [place('gronland'), place('aotearoa')];
  // Under en tur räknar render.js inte ut några konturer (placeHints är av), men turens steg sätter step
  update({ focus: null, labels: { placeHints: false } });
  layer.step = place('gronland');
  layer.drawOverlay(ctx, 4096, 2048);
  assert.deepEqual(calls.filter(c => c !== 'save'), ['fill', 'stroke'], 'platsen i steget ritas med fyllning och kontur, som i Fokus');
  // Ett Fokus på en annan plats går före steget
  calls.length = 0;
  layer.enabled = true;
  update({ focus: { type: 'place', place: place('aotearoa') }, labels: {} });
  layer.drawOverlay(ctx, 4096, 2048);
  assert.equal(calls.filter(c => c === 'fill').length, 1);
  assert.equal(layer.place.id, 'aotearoa');
  // När steget slutar (closeStep sätter step till null) ritas ingenting utan Fokus
  calls.length = 0;
  layer.enabled = false; layer.step = null;
  update({ focus: null, labels: { placeHints: false } });
  layer.drawOverlay(ctx, 4096, 2048);
  assert.deepEqual(calls, []);
});

test('inGeometry är oförändrad: en punkt i en polygon och en utanför', () => {
  const g = square('x', 0, 0, 1, 1).boundary.geometry;
  assert.equal(inGeometry(g, 0.5, 0.5), true);
  assert.equal(inGeometry(g, 2, 2), false);
});

// Datumlinjen (#1268): länder som Ryssland, Fiji och USA ligger på båda sidor om 180 grader. Gränserna delas vid 180 i datan
// (tools/platser_gransar.py), och place-geo.js skyddar ändå mot en ring som hoppar. Fallen delas med
// tests/platser-granser-test.py, som kör kopian i scripts/validate-site.py, så att de två inte glider isär.
const dl = JSON.parse(readFileSync(new URL('./fixtures/datumlinjen.json', import.meta.url), 'utf8'));

test('datumlinjen: konstruerade länder över 180 grader, odelade och delade, ger rätt inne/ute och avstånd', () => {
  for (const p of dl.points) {
    const g = dl.geometries[p.geometry];
    assert.equal(inGeometry(g, p.lon, p.lat), p.inside, p.namn);
    if (p.edgeKm) {
      const km = edgeKm(g, p.lon, p.lat);
      assert.ok(km >= p.edgeKm[0] && km <= p.edgeKm[1], `${p.namn}: ${km.toFixed(1)} km, väntat ${p.edgeKm.join('–')}`);
    }
  }
});

test('datumlinjen: 179,5 grader mot −179,5 grader är under 100 km från varandra, inte tvärs över jorden', () => {
  const g = { type: 'Polygon', coordinates: [[[-179.5, 60], [-170, 60], [-170, 70], [-179.5, 70], [-179.5, 60]]] };
  assert.ok(edgeKm(g, 179.5, 65) < 100, `${edgeKm(g, 179.5, 65)} km`);
  assert.ok(edgeKm(g, 179.5, 65) > 30);
  assert.equal(inGeometry(g, 179.5, 65), false);
});

test('datumlinjen: sömmen vid ±180 räknas inte som kust, så en händelse vid linjen utanför landet kommer inte med', () => {
  const place = { boundary: { geometry: dl.geometries.slutar_vid_somen } };
  const ev = (id, lon, lat) => ({ id, start: 0, _lon: lon, _lat: lat });
  // Landet slutar vid 180 (en delad ring) men fortsätter inte på andra sidan: −179,9 ligger 5 km från sömmen men inte från kusten
  assert.deepEqual(placeEvents(place, [ev('inne', 175, 62.5), ev('over-somen', -179.9, 62.5)]).map(e => e.id), ['inne']);
  // Delad ring: händelser vid ±180 inom 20 km från sömmen, men utanför landet, räknas inte som inom gränsen
  const split = { boundary: { geometry: dl.geometries.ryssland_delad } };
  assert.deepEqual(placeEvents(split, [ev('norr', 179.9, 71), ev('norr-ost', -179.9, 71)]).map(e => e.id), [], 'norr om landet vid sömmen');
  assert.deepEqual(placeEvents(split, [ev('inne', 179.9, 60), ev('inne-ost', -179.9, 60)]).map(e => e.id).sort(), ['inne', 'inne-ost']);
});

test('datumlinjen: platsen under en punkt hittas på båda sidor om linjen, också för en ring som hoppar', () => {
  const places = [{ id: 'ryssland', boundary: { geometry: dl.geometries.ryssland_odelad } }, { id: 'fiji', boundary: { geometry: dl.geometries.fiji } }];
  assert.equal(placeAt(places, 177.5, 64.7)?.id, 'ryssland', 'Anadyr');
  assert.equal(placeAt(places, -175, 60)?.id, 'ryssland', 'Tjukotka öster om linjen');
  assert.equal(placeAt(places, -160, 60), null);
  assert.equal(placeAt(places, 179.5, -16.5)?.id, 'fiji');
  assert.equal(placeAt(places, -179.5, -16.5)?.id, 'fiji');
});

test('datumlinjen: ingen ring i data/platser.json hoppar mer än 180 grader i längdgrad mellan två punkter', () => {
  for (const p of real) {
    const g = p.boundary.geometry;
    for (const poly of g.type === 'Polygon' ? [g.coordinates] : g.coordinates) {
      for (const ring of poly) {
        assert.deepEqual(ring[0], ring[ring.length - 1], `${p.id}: ringen är inte sluten`);
        for (let i = 1; i < ring.length; i++) {
          assert.ok(Math.abs(ring[i][0] - ring[i - 1][0]) <= 180, `${p.id}: hopp ${ring[i - 1]} → ${ring[i]} (dela ringen vid 180 med tools/platser_gransar.py)`);
        }
      }
    }
  }
});

test('datumlinjen: dagens platser ger samma svar som förut (Aotearoa med Chathamöarna, Grönland, Sverige)', () => {
  assert.equal(inGeometry(place('aotearoa').boundary.geometry, 174.76, -36.85), true, 'Auckland');
  assert.equal(inGeometry(place('aotearoa').boundary.geometry, -176.5, -43.95), true, 'Chathamöarna ligger öster om linjen');
  assert.equal(inGeometry(place('aotearoa').boundary.geometry, 178, -40), false, 'havet');
  assert.ok(edgeKm(place('aotearoa').boundary.geometry, 179.5, -44) > 100, 'Chathamöarna är 3 grader bort, inte på kartans andra kant');
  assert.equal(inGeometry(place('gronland').boundary.geometry, -40, 72), true);
  assert.equal(inGeometry(place('sverige').boundary.geometry, 20.2, 67.85), true, 'Kiruna');
});
