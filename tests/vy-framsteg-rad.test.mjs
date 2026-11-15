// Raden som förklarar vyn Framsteg (#1379): finns på fem språk med ental och flertal och {count}, antalet skrivs aldrig in i texten,
// och tagViewNote ger text bara för en tagg med egen rad och bara när någon händelse har taggen.
// Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const LANGS = ['sv', 'en', 'de', 'es', 'fr'];
const dicts = Object.fromEntries(LANGS.map(l => [l, JSON.parse(read(`data/ui/${l}.json`))]));
const { tagViewNote } = await import(new URL('../js/model.js', import.meta.url).href);

test('view.progressNote finns på alla fem språk som [ental, flertal] med {count} och utan inskrivna siffror', () => {
  for (const l of LANGS) {
    const v = dicts[l]['view.progressNote'];
    assert.ok(Array.isArray(v) && v.length === 2, `${l}: ska vara [ental, flertal]`);
    for (const text of v) {
      assert.match(text, /\{count\}/, `${l}: saknar {count}`);
      assert.doesNotMatch(text.replace(/\{count\}/g, ''), /\d/, `${l}: antalet ska räknas ur datan, inte stå i texten`);
    }
    assert.notEqual(v[0], v[1], `${l}: ental och flertal ska skilja`);
  }
});

test('raden använder inte orden för tidslinjen eller bläddraren', () => {
  const forbidden = /tidslinje|bläddrare|timeline|browser|Zeitleiste|línea de tiempo|frise/i;
  for (const l of LANGS) for (const text of dicts[l]['view.progressNote']) assert.doesNotMatch(text, forbidden, l);
});

test('tagViewNote räknar in antalet, böjer ental och flertal och är tom utan tagg eller utan händelser', () => {
  assert.match(tagViewNote('framsteg', 1), /framsteg\. Än så länge är det 1 händelse\.$/);
  assert.match(tagViewNote('framsteg', 2), /Än så länge är det 2 händelser\.$/);
  assert.match(tagViewNote('framsteg', 37), /37 händelser\.$/);
  assert.equal(tagViewNote('framsteg', 0), '', 'tomt läge har egen text');
  assert.equal(tagViewNote('oversikt', 120), '', 'Översikt har sin egen rad i Samtidigt (#1139)');
  assert.equal(tagViewNote(null, 5), '');
  assert.equal(tagViewNote(undefined, 5), '');
});

test('Lager och Samtidigt använder tagViewNote i stället för egen text', () => {
  assert.match(read('js/ui/layers.js'), /tagViewNote\(/);
  assert.match(read('js/ui/panel.js'), /tagViewNote\(/);
});
