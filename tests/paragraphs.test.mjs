// Delningen av långa faktatexter i stycken (#1571) ändrar bara radbrytningarna, aldrig orden.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { splitParagraphs, sentences, SPLIT_FROM, MAX_SENTENCES } from '../js/paragraphs.js';

const LANGS = ['sv', 'en', 'de', 'es', 'fr'];
const readJson = f => JSON.parse(fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));

/** Alla texter som faktarutan och resans ruta delar i stycken: sammanfattningar, krigens intro och utgång. */
function longTexts() {
  const out = [];
  const walk = (v, key) => {
    if (!v || typeof v !== 'object') return;
    if (!Array.isArray(v) && typeof v.sv === 'string' && /^(summary|intro|outcome)$/.test(key)) for (const l of LANGS) if (v[l]) out.push([l, v[l]]);
    for (const [k, x] of Object.entries(v)) walk(x, k);
  };
  for (const dir of ['data/handelser', 'data/routes']) {
    for (const f of fs.readdirSync(new URL(`../${dir}/`, import.meta.url)).filter(n => n.endsWith('.json'))) walk(readJson(`${dir}/${f}`), '');
  }
  return out;
}

test('en kort text delas inte', () => {
  assert.deepEqual(splitParagraphs('En kort mening. Och en till.'), ['En kort mening. Och en till.']);
  assert.deepEqual(splitParagraphs(''), []);
  assert.deepEqual(splitParagraphs(undefined), []);
});

test('en lång text delas i stycken om högst två meningar', () => {
  const text = 'Första meningen är ganska lång och handlar om något viktigt som hände. Andra meningen fortsätter med mer information om saken. Tredje meningen tillför en detalj som ingen väntade sig. Fjärde meningen avslutar hela berättelsen på ett värdigt sätt.';
  assert.ok(text.length >= SPLIT_FROM);
  const ps = splitParagraphs(text);
  assert.equal(ps.length, 2);
  assert.equal(ps.join(' '), text);
  for (const p of ps) assert.ok(sentences(p).length <= MAX_SENTENCES + 1);
});

test('en ensam kort slutmening får inget eget stycke', () => {
  const text = 'Tidigt på morgonen anfaller skeppen den japanska flottan i sundet, när japanerna försöker ta sig hem. Mer än hälften av de japanska skeppen förstörs eller erövras. Yi Sun-sin träffas av en kula och dör. Det är krigets sista slag.';
  const ps = splitParagraphs(text);
  assert.equal(ps.at(-1).startsWith('Det är'), false);
  assert.equal(ps.join(' '), text);
});

test('punkten i en förkortning eller ett ordningstal är inget meningsslut', () => {
  assert.equal(sentences('Kriget började 499 f.Kr. Kriget slutade 449 f.Kr. Freden kom sedan.').length, 1);
  assert.deepEqual(sentences('Um 500 v. Chr. Danach kam der Krieg. Im 5. Jahrhundert ging es weiter. Am 16. Dezember endete es.'),
    ['Um 500 v. Chr. Danach kam der Krieg.', 'Im 5. Jahrhundert ging es weiter.', 'Am 16. Dezember endete es.']);
  assert.deepEqual(sentences('Hacia el siglo III a. C. Los romanos llegaron. Después, nada.'), ['Hacia el siglo III a. C. Los romanos llegaron.', 'Después, nada.']);
  assert.equal(sentences('Han mötte J. Robert Oppenheimer i staden. Sedan reste han hem.').length, 2);
  // Ett riktigt meningsslut före en versal bryts
  assert.deepEqual(sentences('Slaget stod år 1598. Därefter drog trupperna hem.'), ['Slaget stod år 1598.', 'Därefter drog trupperna hem.']);
  assert.deepEqual(sentences('Hur gick det? Det gick bra! Inga fler frågor.'), ['Hur gick det?', 'Det gick bra!', 'Inga fler frågor.']);
});

test('i alla sammanfattningar och krigsberättelser på fem språk är orden desamma efter delningen', () => {
  const texts = longTexts();
  assert.ok(texts.length > 3000, `bara ${texts.length} texter hittades`);
  let split = 0;
  for (const [lang, text] of texts) {
    const ps = splitParagraphs(text);
    assert.equal(ps.join(' '), text.trim(), `${lang}: orden ändrades`);
    for (const p of ps) assert.ok(p.trim().length > 0 && p === p.trim(), `${lang}: tomt eller ojämnt stycke`);
    if (ps.length > 1) split++;
  }
  assert.ok(split > texts.length / 2, 'färre än hälften av texterna delades');
});

test('ingen delning mitt i en förkortning eller ett ordningstal i datan', () => {
  const bad = /(?<![\p{L}\d,.])(?:[vnadfe]\.|\d{1,2}\.)$|–\d{1,2}\.$/u;
  for (const [lang, text] of longTexts()) {
    const ps = splitParagraphs(text);
    for (const p of ps.slice(0, -1)) assert.ok(!bad.test(p), `${lang}: stycket slutar mitt i en förkortning: …${p.slice(-30)}`);
  }
});
