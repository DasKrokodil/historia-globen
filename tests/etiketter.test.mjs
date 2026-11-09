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
