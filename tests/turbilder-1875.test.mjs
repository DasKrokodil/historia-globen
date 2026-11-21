// Bilderna till övriga turer och lektioner (#1875): varje händelse som fick en riktig bild ska öppnas av ett steg i sin tur
// och ha filen images/events/<id>.webp i 800 × 600, bildtext på alla fem språken, upphov och licens, och filsidan eller
// katalogposten som källa i data/sources.json med kontrolldatum. Händelserna utan fri bild står i docs/bilder-saknas.md
// och har en prompt i docs/bildpromptar-1875.md. Bildreglerna står i CLAUDE.md (Bilder).
// Körs med node --test 'tests/*.test.mjs'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const text = path => readFileSync(new URL(path, root), 'utf8');
const json = path => JSON.parse(text(path));
const events = Object.fromEntries(json('data/events.json').events.map(e => [e.id, e]));
const sources = Object.fromEntries(json('data/sources.json').sources.map(s => [s.id, s]));
const LANGS = ['sv', 'en', 'de', 'es', 'fr'];

/** Bredd och höjd ur en webp-fils huvud (VP8, VP8L eller VP8X). */
function webpSize(buf) {
  assert.equal(buf.toString('ascii', 0, 4), 'RIFF');
  assert.equal(buf.toString('ascii', 8, 12), 'WEBP');
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  if (chunk === 'VP8L') {
    const b = buf.readUInt32LE(21);
    return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1];
  }
  if (chunk === 'VP8X') return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
  throw new Error(`okänt webp-format ${chunk}`);
}

// Tur -> händelser som fick en riktig bild i #1875
const MED_BILD = {
  'vikingatiden-och-varlden': ['kairo-grundas', 'polynesier-nar-hawaii', 'cahokia'],
  'vad-vet-vi-egentligen': ['slaget-vid-thermopyle', 'karl-xii-stupar-1718'],
  'hur-vet-vi-det-har': ['napoleonkrigen'],
};
// Utan fri bild: väntar på en illustration som en människa gör (docs/bilder-ai-illustrationer.md)
const VANTAR = ['al-bakri-beskriver-ghana', 'slaget-vid-tondibi'];

test('#1875: händelserna öppnas av sina turer och har en riktig bild', () => {
  for (const [tur, ids] of Object.entries(MED_BILD)) {
    const opened = new Set(json(`data/turer/${tur}.json`).steps.map(s => s.open));
    for (const id of ids) {
      assert.ok(opened.has(id), `${id} öppnas inte av något steg i ${tur}`);
      const img = events[id]?.image;
      assert.ok(img, `${id} saknar bild`);
      assert.equal(img.kind, 'historisk', `${id}: bara riktiga bilder i #1875`);
      assert.equal(img.file, `images/events/${id}.webp`, `${id}: filnamnet`);
      const file = new URL(img.file, root);
      assert.ok(existsSync(file), `${id}: ${img.file} finns inte`);
      const buf = readFileSync(file);
      assert.deepEqual(webpSize(buf), [800, 600], `${id}: storleken`);
      assert.ok(buf.length <= 150_000, `${id}: ${buf.length} byte, över 150 kB`);
      for (const l of LANGS) assert.ok(img.caption?.[l]?.trim(), `${id}: bildtext saknas på ${l}`);
      assert.ok(img.credit && img.license, `${id}: upphov eller licens saknas`);
      const src = sources[img.source];
      assert.ok(src, `${id}: källan ${img.source} finns inte i sources.json`);
      assert.match(src.url, /^https:\/\/(commons\.wikimedia\.org\/wiki\/File:|www\.loc\.gov\/item\/)/, `${id}: källan ska vara filsidan`);
      assert.ok(src.license && src.checked, `${id}: källans licens eller kontrolldatum saknas`);
    }
  }
});

test('#1875: händelserna utan fri bild står i bilder-saknas och har en prompt', () => {
  const saknas = text('docs/bilder-saknas.md');
  const promptar = text('docs/bildpromptar-1875.md');
  for (const id of VANTAR) {
    if (events[id]?.image) continue; // illustrationen är gjord
    assert.ok(saknas.includes(`\`${id}\``), `${id} står inte i docs/bilder-saknas.md`);
    assert.ok(promptar.includes(`(\`${id}\`)`), `${id} saknar prompt i docs/bildpromptar-1875.md`);
  }
});
