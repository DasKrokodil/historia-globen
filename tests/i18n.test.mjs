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

// Översätt samtidigt (beslut 2026-11-06, #669): varje språk ska ha varje nyckel, också ett ofärdigt språk (beta).
// En ny gränssnittstext läggs alltså i alla språkfiler i samma pull request, och en saknad nyckel stoppar den.
const ph = s => [...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
for (const l of meta.languages.filter(l => l.id !== 'sv')) {
  const dict = json(`data/ui/${l.id}.json`);
  test(`${l.id}.json har alla nycklar som JavaScript hämtar (sv.json) och samma {platshållare}`, () => {
    const missing = Object.keys(sv).filter(k => !k.startsWith('_') && !(k in dict));
    assert.deepEqual(missing, [], `${l.id}.json saknar ${missing.join(', ')} (översätt samtidigt, beslut 2026-11-06)`);
    for (const [k, v] of Object.entries(sv)) {
      if (k.startsWith('_')) continue;
      if (Array.isArray(v)) { assert.equal(dict[k].length, v.length, k); continue; }
      assert.deepEqual(ph(dict[k]), ph(v), `${l.id}.json ${k}: platshållarna skiljer sig`);
    }
  });
  test(`${l.id}.json har alla nycklar i index.html`, () => {
    const missing = [...htmlKeys].filter(k => !(k in dict));
    assert.deepEqual(missing, [], `${l.id}.json saknar ${missing.join(', ')} (översätt samtidigt, beslut 2026-11-06)`);
  });
  test(`${l.id}.json har samma {platshållare} som engelskan för texterna i index.html`, () => {
    const en = json('data/ui/en.json');
    for (const k of htmlKeys) if (k in en && typeof en[k] === 'string') assert.deepEqual(ph(dict[k]), ph(en[k]), `${l.id}.json ${k}`);
  });
}

test('nycklarna i index.html finns i något språk', () => {
  const all = new Set(meta.languages.flatMap(l => Object.keys(json(`data/ui/${l.id}.json`))));
  for (const k of htmlKeys) assert.ok(all.has(k), `${k} finns inte i någon språkfil`);
});
