// Etiketter på globen och i Platt vy (#142, #1022): placeLabels i js/ui/clusters.js. Ett pågående krig går före rikesnamnen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { placeLabels, WAR_LABELS } from '../js/ui/clusters.js';

const W = 800, H = 600;
const single = (id, x, y, kind) => ({ e: { id, kind }, p: { x, y, facing: 1 } });
const place = (singles, extra = {}) => placeLabels(singles, { W, H, hoverId: null, markers: [], badges: [], text: it => `Etikett ${it.id}`, pxOf: () => 20, ...extra });
// Rikesnamn och medaljer (soft) som täcker platsen ovanför och under markören
const cover = (x, y) => [{ x0: x - 200, x1: x + 200, y0: y - 80, y1: y + 80 }];
const war = single('kriget', 400, 300, 'war');
const priority = it => it.e.kind === 'war';

test('en vanlig händelse viker för rikesnamn: ingen etikett när rutorna är täckta', () => {
  const out = place([single('slaget', 400, 300)], { soft: cover(400, 300), priority });
  assert.equal(out.length, 0);
});

test('ett pågående krig får sin etikett över rikesnamn när inget annat ryms (#1022)', () => {
  const out = place([war], { soft: cover(400, 300), priority });
  assert.equal(out.length, 1);
  assert.equal(out[0].e.id, 'kriget');
});

test('utan rikesnamn står kriget ovanför markören som förut', () => {
  const [l] = place([war], { priority });
  assert.ok(l.y < 300, 'etiketten står ovanför markören');
});

test('kriget tas före andra etiketter, så en annan etikett inte tar dess plats', () => {
  const other = single('annat', 400, 270); // nästan på samma ställe, men inte ett krig
  const out = place([other, war], { soft: [], priority });
  assert.ok(out.some(l => l.e.id === 'kriget'), 'kriget har etikett');
  assert.equal(out[0].e.id, 'kriget', 'kriget placeras först');
});

test('kriget får inte täcka andra markörer, klungor eller knappar: de är fasta hinder', () => {
  const markers = [{ id: 'annat', box: { x0: 330, x1: 470, y0: 240, y1: 285 } }];
  const blocked = [{ x0: 300, x1: 500, y0: 315, y1: 360 }];
  // Ovanför: markören i vägen. Under: knappen. Bredvid ryms den.
  const out = place([war], { markers, blocked, soft: cover(400, 300), priority });
  for (const l of out) {
    const w = `Etikett ${l.e.id}`.length * 6.6 + 30, box = { x0: l.x - w / 2, x1: l.x + w / 2, y0: l.y - 2 - 22, y1: l.y - 2 };
    for (const b of [...blocked, ...markers.map(m => m.box)]) {
      assert.ok(!(box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0), 'etiketten ligger inte ovanpå ett fast hinder');
    }
  }
});

test(`högst ${WAR_LABELS} krig går före rikesnamnen, och taket på 14 etiketter gäller kriget också`, () => {
  const wars = Array.from({ length: WAR_LABELS + 2 }, (_, i) => single(`krig${i}`, 100 + i * 120, 300, 'war'));
  const soft = wars.flatMap(w => cover(w.p.x, 300));
  assert.equal(place(wars, { soft, priority }).length, WAR_LABELS);
  const many = Array.from({ length: 20 }, (_, i) => single(`h${i}`, 20 + (i % 10) * 75, 60 + Math.floor(i / 10) * 400));
  assert.ok(place([...many, war], { priority }).length <= 14);
});

test('utan priority och soft fungerar placeLabels som förut (anropen i Platt vy och på globen utan krig)', () => {
  const out = place([single('a', 200, 200), single('b', 600, 400)]);
  assert.equal(out.length, 2);
});

// #1538: mobil (400 × 800), år 1916. Verdun och Versaillesfreden bildar en klunga alldeles intill Första världskriget, och två klungor
// ligger ovanför och bredvid. Ovanför, under och på sidorna intill markören är upptaget av klungor, så etiketten måste ligga längre bort.
// Lägena är de verkliga ur globen (skärmpositioner, klungor, knappar och rikesnamn).
test('Första världskriget får etikett även när klungor ligger ovanför, under och bredvid markören (#1538)', () => {
  const W = 401, H = 800;
  const at = (id, x, y, kind) => ({ e: { id, kind, title: id }, p: { x, y, facing: 0.8 } });
  const singles = [
    at('forsta-varldskriget', 335, 297, 'war'), at('panamakanalen-oppnas', 98, 460), at('vandringsduvan-dor-ut', 108, 352),
    at('mexikanska-revolutionen', 54, 404, 'war'), at('mexikos-grundlag-1917', 53, 397), at('spanska-sjukan', 73, 341),
    at('titanic-sjunker', 201, 358), at('bingham-vid-machu-picchu', 125, 528), at('insulin-forsta-patienten', 125, 341),
    at('chagas-ny-parasit-1909', 219, 547), at('sveriges-forsta-nationalparker', 273, 249)];
  const dot = (x, y, r) => ({ x0: x - r, x1: x + r, y0: y - r, y1: y + r });
  const markers = singles.map(s => ({ id: s.e.id, box: dot(s.p.x, s.p.y, 9) }));
  const badges = [[348, 296], [297, 273], [312, 301], [324, 354], [374, 449]].map(([x, y]) => dot(x, y, 16));
  const blocked = [[11, 1, 20, 10], [12, 2, 68, 54], [12, 49, 379, 73], [203, 2, 321, 48], [316, 2, 389, 48], [12, 700, 61, 742], [57, 700, 106, 742],
    [102, 700, 151, 742], [147, 700, 201, 742], [197, 700, 245, 742], [241, 700, 290, 742], [286, 700, 335, 742], [331, 700, 389, 742]]
    .map(([x0, y0, x1, y1]) => ({ x0, y0, x1, y1 }));
  const soft = [[327, 306, 332, 313], [316, 322, 321, 329], [321, 312, 327, 319], [317, 300, 322, 308], [261, 261, 282, 287], [281, 309, 307, 335],
    [57, 359, 77, 371], [185, 532, 218, 544], [294, 333, 320, 359], [348, 293, 374, 319]].map(([x0, y0, x1, y1]) => ({ x0, y0, x1, y1 }));
  const isWar = it => it.e.kind === 'war';
  const out = placeLabels(singles, { W, H, hoverId: null, markers, badges, blocked, soft, priority: isWar, text: e => (e.id === 'forsta-varldskriget' ? 'Första världskriget' : e.id), pxOf: () => 18 });
  const l = out.find(x => x.e.id === 'forsta-varldskriget');
  assert.ok(l, 'Första världskriget har etikett');
  const w = 'Första världskriget'.length * 6.6 + 30, box = { x0: l.x - w / 2, x1: l.x + w / 2, y0: l.y - 2 - 22, y1: l.y - 2 };
  assert.ok(box.x0 >= 4 && box.x1 <= W - 4, 'etiketten ryms på skärmen');
  const hit = b => box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0;
  assert.ok(!badges.some(hit), 'etiketten ligger inte över en klunga');
  assert.ok(!blocked.some(hit), 'etiketten ligger inte över knappar eller rubrik');
  assert.ok(!markers.filter(m => m.id !== 'forsta-varldskriget').some(m => hit(m.box)), 'etiketten ligger inte över en grannmarkör');
});
