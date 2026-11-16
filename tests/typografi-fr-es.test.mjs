// Fransk och spansk typografi i texterna (#1715, ordlistan avsnitt 3): hårt mellanrum (U+00A0) där ett vanligt mellanrum
// kan bryta raden på fel ställe. Franska: före : ; ? ! och », efter «, och i tal från fyra siffror (7 500). Spanska: i tal
// från fem siffror (40 000, RAE och beslutet 2026-11-12). Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const SKIP = ['data/genererat', 'data/events.json', 'data/oversattning.json', 'data/licenses.json', 'data/utkast'];
function* jsonFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name), rel = relative(root, p);
    if (SKIP.some(s => rel === s || rel.startsWith(`${s}/`))) continue;
    if (statSync(p).isDirectory()) yield* jsonFiles(p);
    else if (name.endsWith('.json')) yield rel;
  }
}

// Alla texter på ett språk: värden under nyckeln "fr"/"es", och hela språkfilen data/ui/<språk>.json
function texts(lang) {
  const out = [];
  const walk = (v, where) => {
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) {
      if (k === lang && typeof x === 'string') out.push({ where: `${where}.${k}`, text: x });
      else walk(x, `${where}.${k}`);
    }
  };
  for (const file of jsonFiles(join(root, 'data'))) {
    const doc = JSON.parse(readFileSync(join(root, file), 'utf8'));
    if (file === `data/ui/${lang}.json`) {
      for (const [k, v] of Object.entries(doc)) if (typeof v === 'string') out.push({ where: `${file} ${k}`, text: v });
    } else if (!file.startsWith('data/ui/')) walk(doc, file);
  }
  return out;
}

// Ett tal med vanliga mellanrum mellan tusentalsgrupperna och minst min siffror
const spacedNumber = min => text => [...text.matchAll(/(?<![\d.,])(\d{1,3})((?: \d{3})+)(?!\d)/g)]
  .some(m => (m[1] + m[2].replaceAll(' ', '')).length >= min);

test('franska: hårt mellanrum före : ; ? ! », efter « och i tal från fyra siffror (#1715)', () => {
  const bad = texts('fr').filter(({ text }) => / [:;?!»]/.test(text) || /« /.test(text) || spacedNumber(4)(text));
  assert.deepEqual(bad.slice(0, 5), [], `${bad.length} franska texter med vanligt mellanrum; rätta med U+00A0`);
});

test('spanska: hårt mellanrum i tal från fem siffror (#1715)', () => {
  const bad = texts('es').filter(({ text }) => spacedNumber(5)(text));
  assert.deepEqual(bad.slice(0, 5), [], `${bad.length} spanska texter med vanligt mellanrum i tal; rätta med U+00A0`);
});
