// Förslagsformulärets fasta texter (#2165): all synlig text i <aside id="feedback"> i index.html har en nyckel (data-i18n eller
// data-i18n-<attribut>), nyckelns svenska text är exakt texten i index.html, och nycklarna finns på alla fem språken.
// Undantag: symbolerna × och ↗, som inte är ord. Körs med node --test 'tests/*.test.mjs'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('index.html');
const LANGS = ['sv', 'en', 'de', 'es', 'fr'];
const files = Object.fromEntries(LANGS.map(l => [l, JSON.parse(read(`data/ui/${l}.json`))]));
const start = html.indexOf('<aside id="feedback"');
const aside = html.slice(start, html.indexOf('</aside>', start) + '</aside>'.length);
const VOID = new Set(['input', 'br', 'img', 'hr', 'meta', 'link']);
const SYMBOLS = new Set(['×', '↗']);
const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');

/** Elementen i formuläret med attribut och sina egna textnoder (inte barnens), i dokumentordning. */
function parse(src) {
  const all = [], stack = [];
  for (const m of src.matchAll(/<(\/?)([a-z0-9]+)([^>]*)>|([^<]+)/gi)) {
    if (m[4] !== undefined) { stack.at(-1)?.texts.push(decode(m[4])); continue; }
    const [, close, tag, rest] = m;
    if (close) { while (stack.length && stack.pop().tag !== tag.toLowerCase()); continue; }
    const attrs = Object.fromEntries([...rest.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(a => [a[1], a[2] ?? '']));
    const el = { tag: tag.toLowerCase(), attrs, texts: [] };
    all.push(el);
    if (!VOID.has(el.tag) && !rest.trim().endsWith('/')) stack.push(el);
  }
  return all;
}
const elements = parse(aside);

test('all synlig text i förslagsformuläret har data-i18n (#2165)', () => {
  const missing = elements.flatMap(el => el.texts.map(t => t.trim()).filter(t => t && !SYMBOLS.has(t) && !('data-i18n' in el.attrs))
    .map(t => `<${el.tag}${el.attrs.id ? ` id="${el.attrs.id}"` : ''}>: ${t}`));
  assert.deepEqual(missing, [], 'text utan data-i18n');
  // aria-label och andra attribut med text har också en nyckel
  for (const el of elements) for (const attr of ['aria-label', 'title', 'placeholder']) {
    if (el.attrs[attr]) assert.ok(`data-i18n-${attr}` in el.attrs, `<${el.tag} id="${el.attrs.id}"> ${attr} saknar data-i18n-${attr}`);
  }
});

test('nyckelns svenska text är texten i index.html, och nyckeln finns på alla fem språk', () => {
  let n = 0;
  for (const el of elements) {
    for (const [attr, key] of Object.entries(el.attrs).filter(([a]) => a === 'data-i18n' || a.startsWith('data-i18n-'))) {
      // Samma regel som setText i js/i18n.js: den första egna textnoden med innehåll; attributen jämförs med sitt värde
      const shown = attr === 'data-i18n' ? el.texts.find(t => t.trim())?.trim() : el.attrs[attr.slice('data-i18n-'.length)];
      for (const l of LANGS) assert.ok(typeof files[l][key] === 'string' && files[l][key].trim(), `${key} saknas på ${l}`);
      assert.equal(files.sv[key], shown, `${key}: svenskan i sv.json skiljer sig från index.html`);
      n++;
    }
  }
  assert.ok(n >= 40, `bara ${n} nycklar hittades i formuläret`);
});

test('franskan har hårt mellanrum före kolon, frågetecken och utropstecken i formulärets texter', () => {
  for (const [key, text] of Object.entries(files.fr).filter(([k]) => k.startsWith('feedback.'))) {
    assert.ok(!/ [:?!]/.test(text), `${key}: vanligt mellanrum före skiljetecken: ${text}`);
  }
});
