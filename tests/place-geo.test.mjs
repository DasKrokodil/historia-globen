// Tryck på en plats (#1161): platsen under en punkt, gränsrutan för inramning i Platt vy och när konturerna ritas.
// Körs med node --test 'tests/*.test.mjs'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { placeAt, placeBounds, inGeometry } from '../js/place-geo.js';
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

test('lagret ritar konturerna bara utanför Fokus, inzoomat och när det finns platser med kort', () => {
  const { layer, enabled, update } = entry();
  const s = extra => ({ focus: null, labels: { placeHints: true }, ...extra });
  assert.equal(enabled(s()), false, 'inga platser laddade än');
  layer.cards = [place('gronland')];
  assert.equal(enabled(s()), true);
  assert.equal(enabled(s({ labels: { placeHints: false } })), false, 'utzoomat');
  assert.equal(enabled(s({ focus: { type: 'war' } })), false, 'inte i Fokus');
  assert.equal(enabled(s({ focus: { type: 'theme' } })), false);
  assert.equal(enabled(s({ focus: { type: 'place', place: place('gronland') } })), true, 'platsen man följer ritas som förut');
  update(s());
  assert.equal(layer.hints, true);
  assert.equal(layer.place, null);
  update(s({ focus: { type: 'place', place: place('aotearoa') } }));
  assert.equal(layer.hints, false, 'i Fokus på en plats ritas bara den platsen');
  assert.equal(layer.place.id, 'aotearoa');
  update(s({ focus: null, labels: {} }));
  assert.equal(layer.hints, false);
});

test('inGeometry är oförändrad: en punkt i en polygon och en utanför', () => {
  const g = square('x', 0, 0, 1, 1).boundary.geometry;
  assert.equal(inGeometry(g, 0.5, 0.5), true);
  assert.equal(inGeometry(g, 2, 2), false);
});
