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
  namePriority, km, placeWord, brickSpot, PILE_PX, PILE_PX_TOUCH, MARK_PX,
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

test('brickan: händelser med scope "place" och ungefärlig plats; andra ungefärliga står kvar på sin punkt (#1674)', () => {
  const sk = regionItems(listOf('skane'), place('skane'), places);
  const whole = sk.filter(it => it.whole);
  // Urvalet som historikern föreslog (#1674): samma fyra som textregeln i steg 1b gav
  assert.deepEqual(whole.map(it => it.e.id),
    ['skane-under-magnus-eriksson', 'forsvenskningen-av-skane', 'skanes-generalguvernement-upphor', 'skane-lan-bildas']);
  for (const it of whole) {
    assert.equal(it.e.scope, 'place', it.e.id);
    assert.ok(['region', 'country'].includes(it.e.locationPrecision), `${it.e.id} är ungefärlig`);
  }
  // Ungefärliga händelser på en del av platsen (Barum, Uppåkra) och de som nämner mer än platsen (Skånska kriget, snapphanarna)
  // har inget scope och står kvar som markörer, märkta som ungefärliga
  const partial = sk.filter(it => it.approx && !it.whole);
  assert.ok(partial.length >= 4, 'Skåne har ungefärliga händelser på en del av platsen');
  assert.ok(partial.some(it => /^Skåne, /.test(it.e.place.sv)), 'en platstext som börjar med Skåne och fortsätter står på sin punkt');
  const dk = regionItems(listOf('danmark'), place('danmark'), places);
  assert.deepEqual(dk.filter(it => it.whole).map(it => it.e.id),
    ['stavnsbandet-upphavs', 'grundloven-1849', 'kvinnlig-rostratt-danmark-1915', 'danmark-gar-med-i-eg']);
  assert.ok(dk.some(it => it.approx && !it.whole), 'Danmark har ungefärliga händelser på en del av landet');
  // Varje händelse med scope "place" i datan är ungefärlig (validate-site.py kräver det)
  for (const e of events.filter(e => e.scope)) {
    assert.equal(e.scope, 'place', e.id);
    assert.ok(['region', 'country'].includes(e.locationPrecision), `${e.id}: scope "place" kräver locationPrecision`);
  }
});

test('wholePlace läser fältet, inte platstexten: fält, saknat fält och en mindre plats inom platsen (#1674)', () => {
  const at = (extra = {}) => ({ locationPrecision: 'region', _lon: 13.6167, _lat: 55.8, place: { sv: 'Skåne' }, ...extra });
  // Fältet satt: hela platsen
  assert.equal(wholePlace(at({ scope: 'place' }), place('skane'), places), true);
  // Saknat fält: aldrig brickan, inte ens när platstexten är exakt platsens namn (textregeln är borta)
  assert.equal(wholePlace(at(), place('skane'), places), false);
  assert.equal(wholePlace({ ...at(), locationPrecision: 'country', place: { sv: 'Danmark (markören i Köpenhamn)' } }, place('danmark'), places), false);
  // Ett okänt värde räknas inte
  assert.equal(wholePlace(at({ scope: 'country' }), place('skane'), places), false);
  // Fältet utan ungefärlig plats (en exakt punkt) ger ingen bricka
  assert.equal(wholePlace({ ...at({ scope: 'place' }), locationPrecision: undefined }, place('skane'), places), false);
  // Fältet gäller den minsta platsen händelsen ligger i: en skånsk händelse är "Hela Skåne", men i Sverige en ungefärlig markör
  assert.equal(wholePlace(at({ scope: 'place' }), place('sverige'), places), false, 'Skåne ligger i Sverige');
  // Utan listan över platser görs ingen sådan prövning (reserv när platserna inte har laddats)
  assert.equal(wholePlace(at({ scope: 'place' }), place('sverige')), true);
  // Platsen saknas
  assert.equal(wholePlace(at({ scope: 'place' }), null, places), false);
  // En svensk händelse för hela landet med punkten i Stockholm (inte i någon mindre plats) gäller hela Sverige
  assert.equal(wholePlace({ scope: 'place', locationPrecision: 'country', _lon: 18.0686, _lat: 59.3294 }, place('sverige'), places), true);
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

test('högens namn är ortnamn, inte fraser: platstexten kapas vid "nära", "vid", "utanför", "norr om" och "och"', () => {
  const words = JSON.parse(readFileSync(new URL('../data/ui/sv.json', import.meta.url), 'utf8'));
  const w = { cut: words['regionView.placeCut'], prefix: words['regionView.placePrefix'] };
  assert.equal(placeWord('Gallehus nära Møgeltønder, Danmark', w), 'Gallehus');
  assert.equal(placeWord('Norr om Lund, Skåne', w), 'Lund');
  assert.equal(placeWord('Ylleshed utanför Landskrona, Skåne', w), 'Ylleshed');
  assert.equal(placeWord('Lund och Malmö, Skåne', w), 'Lund');
  assert.equal(placeWord('Barum vid Oppmannasjön, nordost om Kristianstad', w), 'Barum');
  assert.equal(placeWord('Bjældskovdal, väster om Silkeborg', w), 'Bjældskovdal');
  assert.equal(placeWord('Lund, Skåne'), 'Lund', 'utan ord: första ledet');
  // Alla fem språk har orden som listor
  for (const l of ['sv', 'en', 'de', 'es', 'fr']) {
    const d = JSON.parse(readFileSync(new URL(`../data/ui/${l}.json`, import.meta.url), 'utf8'));
    assert.ok(Array.isArray(d['regionView.placeCut']) && d['regionView.placeCut'].every(x => /^ .+ $/.test(x)), `${l}: placeCut`);
    assert.ok(Array.isArray(d['regionView.placePrefix']) && d['regionView.placePrefix'].length, `${l}: placePrefix`);
  }
  // Högarna i Skåne och Danmark får ortnamn utan "nära", "vid" och "om"
  for (const id of ['skane', 'danmark']) {
    const doc = read(`data/ortnamn/${id}.json`);
    for (const r of [PILE_PX, PILE_PX_TOUCH]) {
      for (const p of groupMarkers(regionItems(listOf(id), place(id)), screenOf(id), r).piles) {
        const name = pileName(p.members, doc, tx, w);
        assert.ok(name && !/ (nära|vid|utanför|om|och) /i.test(name), `${id}: ${name}`);
      }
    }
  }
});

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

test('pekskärm: med högradien 36 px ligger markörer och högar så långt isär att tryckytorna (44 px) går in högst 8 px (Danmark i 400 px)', () => {
  assert.ok(PILE_PX_TOUCH >= 36 && PILE_PX_TOUCH > PILE_PX);
  // Mobilens ram: 400 × 520 karta med platsen i den övre delen (arket nere)
  for (const id of ['skane', 'danmark']) {
    const g = groupMarkers(regionItems(listOf(id), place(id)), screenOf(id, { w: 400, h: 520 }, { x: 0, y: 60, w: 400, h: 380 }), PILE_PX_TOUCH);
    const pts = [...g.singles.map(s => s.p), ...g.piles];
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      assert.ok(Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) >= PILE_PX_TOUCH - 1e-9, `${id}: två tryckytor går in i varandra`);
    }
  }
  // Tryckytorna i CSS: markören 24 + 2 · 10, högen 30 + 2 · 7, brickan 30 + 2 · 7
  const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
  assert.match(css, /\.rmark::before \{[^}]*inset: -10px/);
  assert.match(css, /\.rpile::before \{[^}]*inset: -7px/);
  assert.match(css, /\.rbrick::before \{[^}]*inset: -7px/);
});

test('brickan väjer för zoomknapparna och kortet, i sidled eller nedåt', () => {
  const zoom = { x0: 340, y0: 10, x1: 390, y1: 230 };
  const s = brickSpot({ x: 330, y: 60 }, { w: 140, h: 44 }, [zoom], 400, 600);
  assert.ok(s.x + 70 <= zoom.x0 || s.y - 44 >= zoom.y1, `brickan ligger på zoomknapparna: ${JSON.stringify(s)}`);
  assert.ok(s.x - 70 >= 6 && s.x + 70 <= 394, 'brickan ryms på kartan');
  // Ingenting i vägen: brickan står där den ska
  assert.deepEqual(brickSpot({ x: 200, y: 80 }, { w: 140, h: 44 }, [], 400, 600), { x: 200, y: 80 });
});

test('raderna i platsens kort är knappar med data-theme-event, som regionvyn läser (panel.js och region.js hör ihop)', () => {
  const panel = readFileSync(new URL('../js/ui/panel.js', import.meta.url), 'utf8');
  const region = readFileSync(new URL('../js/controllers/region.js', import.meta.url), 'utf8');
  assert.match(panel, /<button type="button" class="theme-event" data-theme-event="\$\{esc\(e\.id\)\}">/, 'raderna i showSelection');
  assert.match(region, /querySelectorAll\('\[data-theme-event\]'\)/, 'regionvyn läser raderna med samma attribut');
  assert.match(region, /dataset\.themeEvent/);
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
