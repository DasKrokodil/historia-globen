// Språkfilerna (#63): varje nyckel som sidan använder finns i språkens filer.
// Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const json = p => JSON.parse(read(p));
const meta = json('data/ui/sprak.json');
const sv = json('data/ui/sv.json');
const html = read('index.html');
const htmlKeys = new Set([...html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)].map(m => m[1]));

test('sprak.json har svenska som grundspråk och unika språk', () => {
  assert.equal(meta.default, 'sv');
  const ids = meta.languages.map(l => l.id);
  assert.deepEqual(ids, [...new Set(ids)]);
  assert.ok(ids.includes('sv'));
  for (const l of meta.languages) {
    assert.ok(l.name, `${l.id} saknar name`);
    if (l.auto) assert.ok(l.complete, `${l.id} väljs automatiskt men är inte färdigt`);
    if (l.id !== 'sv') assert.ok(['unreviewed', 'reviewed'].includes(l.review), `${l.id} saknar review`);
  }
});

for (const l of meta.languages.filter(l => l.id !== 'sv')) {
  const dict = json(`data/ui/${l.id}.json`);
  // Engelska är reservspråket och färdiga språk ska ha allt; ett ofärdigt språk (beta) får sakna en nyckel,
  // som då visas på engelska enligt reservordningen, men en text som finns ska ha samma platshållare.
  const strict = l.id === 'en' || l.complete;
  test(`${l.id}.json har ${strict ? 'alla nycklar' : 'rätt form på nycklarna'} som JavaScript hämtar (sv.json) och samma {platshållare}`, () => {
    for (const [k, v] of Object.entries(sv)) {
      if (k.startsWith('_')) continue;
      if (!strict && !(k in dict)) { console.warn(`${l.id}: saknar ${k} (visas på engelska)`); continue; }
      assert.ok(k in dict, `${l.id}.json saknar ${k}`);
      if (Array.isArray(v)) { assert.equal(dict[k].length, v.length, k); continue; }
      const ph = s => [...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
      assert.deepEqual(ph(dict[k]), ph(v), `${k}: platshållarna skiljer sig`);
    }
  });
  test(`${l.id}.json har alla nycklar i index.html${l.complete ? '' : ' (ofärdigt språk: bara en varning)'}`, () => {
    const missing = [...htmlKeys].filter(k => !(k in dict));
    if (l.complete) assert.deepEqual(missing, []);
    else if (missing.length) console.warn(`${l.id}: saknar ${missing.join(', ')}`);
  });
}

test('nycklarna i index.html finns i något språk', () => {
  const all = new Set(meta.languages.flatMap(l => Object.keys(json(`data/ui/${l.id}.json`))));
  for (const k of htmlKeys) assert.ok(all.has(k), `${k} finns inte i någon språkfil`);
});
