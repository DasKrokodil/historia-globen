// Regionvyns markörer (#1642): numrering i listans ordning, brickan för händelser som gäller hela platsen, högar och solfjädrar,
// högens namn och ortnamn utan krockar (js/region-markers.js). Knapparna, ritningen och tangentbordet prövas av webbläsartestet
// (tests/webblasare.mjs, "regionvyns markörer").
// Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { placeEvents, placeBounds, inGeometry } from '../js/place-geo.js';
import { regionFrame } from '../js/region-frame.js';
import { isVisibleReview, CAT } from '../js/model.js';
import {
  wholePlace, regionItems, groupMarkers, pileName, yearSpan, fanLayout, rowLayout, nameCandidates, placeNames, crossesEdge, tagSpot,
  namePriority, km, PILE_PX, MARK_PX,
} from '../js/region-markers.js';

const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const places = read('data/platser.json').places;
const place = id => places.find(p => p.id === id);
const events = read('data/events.json').events;
for (const e of events) if (e.location?.type === 'Point') [e._lon, e._lat] = e.location.coordinates;
/** Platsens lista "Händelser på platsen": samma urval och ordning som visibleEvents i js/focus/place.js. */
const listOf = id => placeEvents(place(id), events).filter(e => isVisibleReview(e.review));
const tx = o => (typeof o === 'string' ? o : o?.sv ?? '');
const overlaps = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

/** Skärmen för regionvyns ram (som flatmap.js): en karta på 1280 × 560 med platsen inramad i den vänstra delen. */
function screenOf(id, view = { w: 1280, h: 560 }, free = { x: 0, y: 0, w: 860, h: 560 }) {
  const b = placeBounds(place(id)), f = regionFrame(b, view, free);
  return (lat, lon) => ({ x: view.w / 2 + (lon - f.lon) * f.ppd * f.kx, y: view.h / 2 + (f.lat - lat) * f.ppd });
}

test('numret är radens nummer i listan, i listans ordning, och varje händelse finns kvar en gång', () => {
  for (const id of ['skane', 'danmark']) {
    const list = listOf(id), items = regionItems(list, place(id));
    assert.ok(list.length > 10, `${id} har händelser`);
    assert.deepEqual(items.map(it => it.n), list.map((_, i) => i + 1));
    assert.deepEqual(items.map(it => it.e.id), list.map(e => e.id));
    // Ingen händelse försvinner: brickan, markörerna och högarna har tillsammans varje rad exakt en gång
    const g = groupMarkers(items, screenOf(id));
    const all = [...g.brick, ...g.singles, ...g.piles.flatMap(p => p.members)].map(it => it.n).sort((a, b) => a - b);
    assert.deepEqual(all, items.map(it => it.n), `${id}: varje rad finns på kartan en gång`);
  }
});

test('brickan: bara ungefärliga händelser vars plats är hela platsen; andra ungefärliga står kvar på sin punkt', () => {
  const sk = regionItems(listOf('skane'), place('skane'));
  const whole = sk.filter(it => it.whole);
  assert.ok(whole.length >= 5, `Skåne har händelser som gäller hela landskapet (${whole.length})`);
  for (const it of whole) {
    assert.ok(['region', 'country'].includes(it.e.locationPrecision), `${it.e.id} är ungefärlig`);
    assert.ok(it.e.place.sv.startsWith('Skåne'), `${it.e.id}: ${it.e.place.sv}`);
  }
  // Ungefärliga händelser på en del av platsen (Barum, Uppåkra) står kvar som markörer och märks som ungefärliga
  const partial = sk.filter(it => it.approx && !it.whole);
  assert.ok(partial.length >= 1, 'Skåne har ungefärliga händelser på en del av platsen');
  for (const it of partial) assert.ok(!it.e.place.sv.startsWith('Skåne'), it.e.place.sv);
  // En exakt plats hamnar aldrig i brickan, även om platstexten börjar med platsens namn
  assert.equal(wholePlace({ place: { sv: 'Skåne' } }, place('skane')), false);
  assert.equal(wholePlace({ locationPrecision: 'region', place: { sv: 'Skånes kust' } }, place('skane')), false, 'ett annat ord');
  assert.equal(wholePlace({ locationPrecision: 'region', place: { sv: 'Skåne, Bohuslän' } }, place('skane')), true);
  assert.equal(wholePlace({ locationPrecision: 'country', place: { sv: 'Danmark (markören i Köpenhamn)' } }, place('danmark')), true);
  // Danmark: händelserna med hela landet som plats (country) står i brickan, Köpenhamn (ungefärlig) står kvar på sin punkt
  const dk = regionItems(listOf('danmark'), place('danmark'));
  assert.ok(dk.filter(it => it.whole).every(it => it.e.place.sv.startsWith('Danmark')));
  assert.ok(dk.some(it => it.approx && !it.whole), 'Danmark har ungefärliga händelser på en del av landet');
});

test('högar: händelser på samma punkt och inom högens radie läggs ihop, i listans ordning; brickans händelser aldrig', () => {
  const sk = regionItems(listOf('skane'), place('skane'));
  const g = groupMarkers(sk, screenOf('skane'));
  // Lund: flera händelser inom 1,5 km blir en hög
  const lund = g.piles.find(p => p.members.some(m => /^Lund/.test(m.e.place.sv)));
  assert.ok(lund && lund.members.length >= 5, `Lunds hög har ${lund?.members.length} händelser`);
  for (const p of g.piles) {
    assert.deepEqual(p.members.map(m => m.n), [...p.members.map(m => m.n)].sort((a, b) => a - b), 'högen i listans ordning');
    assert.ok(p.members.every(m => !m.whole), 'brickans händelser ligger aldrig i en hög');
  }
  // Inga två markörer eller högar ligger närmare varandra än högens radie (då hade de lagts ihop)
  const pts = [...g.singles.map(s => s.p), ...g.piles];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    assert.ok(Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) >= PILE_PX - 1e-9, `två markörer ligger på varandra (${i}, ${j})`);
  }
  // Många händelser på exakt samma punkt (höga antal): en hög med alla, och solfjädern håller isär dem
  const same = Array.from({ length: 45 }, (_, i) => ({ e: { id: `e${i}`, start: 1000 + i, end: 1000 + i, _lat: 55.7, _lon: 13.2, place: { sv: 'Lund, Skåne' } }, n: i + 1 }));
  const g2 = groupMarkers(same, screenOf('skane'));
  assert.equal(g2.singles.length, 0);
  assert.equal(g2.piles.length, 1);
  assert.equal(g2.piles[0].members.length, 45);
  const f = fanLayout(45, g2.piles[0], { W: 1280, H: 560 });
  for (let i = 0; i < f.points.length; i++) {
    const a = f.points[i], b = f.points[(i + 1) % f.points.length];
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y) >= MARK_PX, 'markörerna i solfjädern går inte ihop');
    assert.ok(a.x >= 0 && a.x <= 1280 && a.y >= 0 && a.y <= 560, 'solfjädern ryms på kartan');
  }
  assert.deepEqual(yearSpan(g2.piles[0].members), { from: 1000, to: 1044 });
});

test('solfjädern börjar högst upp och flyttas in på ytan; brickans rad bryts på smal skärm', () => {
  const f = fanLayout(4, { x: 5, y: 5 }, { W: 400, H: 300, minR: 40 });
  close(f.points[0].x, f.cx); assert.ok(f.points[0].y < f.cy, 'första markören högst upp');
  for (const p of f.points) assert.ok(p.x - MARK_PX / 2 >= 0 && p.y - MARK_PX / 2 >= 0, 'innanför ytan');
  const row = rowLayout(9, { x: 200, y: 10 }, { W: 200 });
  for (const p of row) assert.ok(p.x - MARK_PX / 2 >= 0 && p.x + MARK_PX / 2 <= 200, `markören ${p.x} ryms i 200 px`);
  assert.ok(new Set(row.map(p => p.y)).size >= 2, 'raden bryts');
});
function close(a, b, eps = 1e-6) { assert.ok(Math.abs(a - b) <= eps, `${a} mot ${b}`); }

test('högens namn: orten när de flesta ligger där, annars två namn', () => {
  const ort = { places: [{ name: { sv: 'Malmö' }, coordinates: [13.023, 55.599] }] };
  const m = (place, lon, lat) => ({ e: { place: { sv: place }, _lon: lon, _lat: lat } });
  assert.equal(pileName([m('Lund, Skåne', 13.19, 55.70), m('Lund, Skåne', 13.19, 55.70), m('Norr om Lund', 13.18, 55.72)], ort, tx), 'Lund');
  assert.equal(pileName([m('Malmö, Skåne', 13, 55.583), m('Malmö–Lund, Skåne', 13, 55.583)], ort, tx), 'Malmö', 'orten ur ortnamnsfilen');
  assert.equal(pileName([m('Ribe, Jylland', 8.76, 55.33), m('Rødding, Jylland', 9.06, 55.37)], null, tx), 'Ribe, Rødding');
  assert.equal(pileName([m('Egtved', 9.28, 55.63), m('Jelling', 9.42, 55.76), m('Billund', 9.12, 55.72)], null, tx), 'Egtved, Jelling …');
  close(km([13, 55.6], [13, 55.7]), 11.12, 0.01);
});

test('ortnamnen: prioritet, inga krockar med varandra eller markörerna, och aldrig över kantlinjen', () => {
  for (const id of ['skane', 'danmark']) {
    const doc = read(`data/ortnamn/${id}.json`), list = listOf(id);
    const cands = nameCandidates(doc, list, tx);
    assert.ok(cands.length >= 5, `${id} har namn`);
    // Ordningen: orter med händelser först
    for (let i = 1; i < cands.length; i++) assert.ok(namePriority(cands[i - 1]) <= namePriority(cands[i]));
    const withEvents = cands.filter(c => c.hasEvents);
    assert.ok(withEvents.length >= 1, `${id}: någon ort har händelser`);
    const toScreen = screenOf(id), geom = place(id).boundary.geometry;
    // Markörerna som hinder: en ruta per markör och hög
    const g = groupMarkers(regionItems(list, place(id)), toScreen);
    const blocked = [...g.singles.map(s => s.p), ...g.piles].map(p => ({ x0: p.x - 16, y0: p.y - 16, x1: p.x + 16, y1: p.y + 16 }));
    // Skärmpunkt till lon/lat (omvänd ram), för att pröva kantlinjen
    const b = placeBounds(place(id)), f = regionFrame(b, { w: 1280, h: 560 }, { x: 0, y: 0, w: 860, h: 560 });
    const inside = (x, y) => inGeometry(geom, f.lon + (x - 640) / (f.ppd * f.kx), f.lat - (y - 280) / f.ppd);
    const placed = placeNames(cands.map(c => ({ ...c, p: toScreen(c.at[1], c.at[0]) })), {
      W: 1280, H: 560, blocked, measure: text => text.length * 7, crosses: bx => crossesEdge(bx, inside) });
    assert.ok(placed.length >= 3, `${id}: ${placed.length} namn ryms`);
    for (let i = 0; i < placed.length; i++) {
      const a = placed[i].box;
      assert.ok(a.x0 >= 0 && a.x1 <= 1280 && a.y0 >= 0 && a.y1 <= 560, 'på kartan');
      assert.ok(!blocked.some(bx => overlaps(a, bx)), `${placed[i].text} ligger på en markör`);
      assert.ok(!crossesEdge(a, inside), `${placed[i].text} ligger över kantlinjen`);
      for (let j = i + 1; j < placed.length; j++) assert.ok(!overlaps(a, placed[j].box), `${placed[i].text} krockar med ${placed[j].text}`);
    }
  }
  // Krock: av två namn på samma punkt ryms bara det första i prioritetsordningen
  const two = [{ id: 'a', kind: 'place', text: 'Stor', p: { x: 100, y: 100 } }, { id: 'b', kind: 'sea', text: 'Havet', p: { x: 112, y: 100 } }];
  const out = placeNames(two, { W: 300, H: 300, measure: t => t.length * 7, blocked: [{ x0: 60, y0: 80, x1: 96, y1: 120 }, { x0: 100, y0: 70, x1: 200, y1: 92 }, { x0: 100, y0: 108, x1: 200, y1: 130 }] });
  assert.deepEqual(out.map(n => n.id), ['a']);
  assert.equal(out[0].align, 'left');
});

test('högens namn står där det är fritt, och helst inte över kantlinjen', () => {
  const s = tagSpot({ x: 100, y: 100 }, { w: 60, h: 20 }, 19, [{ x0: 110, y0: 80, x1: 200, y1: 120 }], 400, 400);
  assert.equal(s.side, 'left');
  const s2 = tagSpot({ x: 100, y: 100 }, { w: 60, h: 20 }, 19, [], 400, 400, bx => bx.x0 > 100);
  assert.equal(s2.side, 'left', 'till höger korsar kantlinjen');
  assert.equal(tagSpot({ x: 10, y: 10 }, { w: 60, h: 20 }, 19, [{ x0: 0, y0: 0, x1: 400, y1: 400 }], 400, 400), null);
});

test('numret på markören går att läsa: mörk siffra mot kategorins färg, minst 4,5:1', () => {
  const lum = hex => {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
  const night = /--night:\s*(#[0-9a-f]{6})/i.exec(css)[1];
  for (const [id, c] of Object.entries(CAT)) {
    const ratio = (lum(c.color) + 0.05) / (lum(night) + 0.05);
    assert.ok(ratio >= 4.5, `${id} (${c.color}) mot ${night}: ${ratio.toFixed(2)}:1`);
  }
});
