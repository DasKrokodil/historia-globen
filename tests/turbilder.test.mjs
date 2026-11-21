// Bilderna till turen om första världskriget (#1873): varje händelse som turens steg öppnar och som har en bild ska ha filen
// images/events/<id>.webp i 800 × 600, bildtext på alla fem språken, upphov och licens, och en historisk bild en källa
// (filsidan) i data/sources.json med kontrolldatum. Bildreglerna står i CLAUDE.md (Bilder).
// Körs med node --test 'tests/*.test.mjs'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const json = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const events = Object.fromEntries(json('data/events.json').events.map(e => [e.id, e]));
const sources = Object.fromEntries(json('data/sources.json').sources.map(s => [s.id, s]));
const tour = json('data/turer/forsta-varldskriget.json');
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

// Händelserna i turen som fick en riktig bild i #1873 (Verdun hade redan en)
const MED_BILD = ['skotten-i-sarajevo', 'forsta-varldskriget', 'slaget-vid-tannenberg-1914', 'forsta-slaget-vid-marne',
  'belagringen-av-tsingtao', 'slaget-vid-tanga', 'gallipolifalttaget', 'belagringen-av-kut', 'slaget-vid-jylland', 'slaget-vid-somme',
  'usa-gar-in-i-forsta-varldskriget', 'freden-i-brest-litovsk', 'vapenstillestandet-1918'];

test('turens händelser från #1873 har bild', () => {
  const opened = new Set(tour.steps.map(s => s.open));
  for (const id of MED_BILD) {
    assert.ok(opened.has(id), `${id} öppnas inte av något steg i turen`);
    assert.ok(events[id]?.image, `${id} saknar bild`);
  }
});

test('bilderna i turen: fil 800 × 600, bildtext på fem språk, upphov, licens och källa', () => {
  for (const step of tour.steps) {
    const e = events[step.open], img = e?.image;
    if (!img || !MED_BILD.includes(e.id)) continue;
    assert.equal(img.file, `images/events/${e.id}.webp`, `${e.id}: filnamnet`);
    const file = new URL(img.file, root);
    assert.ok(existsSync(file), `${e.id}: ${img.file} finns inte`);
    const buf = readFileSync(file);
    assert.deepEqual(webpSize(buf), [800, 600], `${e.id}: storleken`);
    assert.ok(buf.length <= 150_000, `${e.id}: ${buf.length} byte, över 150 kB`);
    for (const l of LANGS) assert.ok(img.caption?.[l]?.trim(), `${e.id}: bildtext saknas på ${l}`);
    assert.ok(img.credit && img.license, `${e.id}: upphov eller licens saknas`);
    assert.equal(img.kind, 'historisk', `${e.id}: bara riktiga bilder i #1873`);
    const src = sources[img.source];
    assert.ok(src, `${e.id}: källan ${img.source} finns inte i sources.json`);
    assert.match(src.url, /^https:\/\/(commons\.wikimedia\.org\/wiki\/File:|www\.loc\.gov\/item\/)/, `${e.id}: källan ska vara filsidan`);
    assert.ok(src.license && src.checked, `${e.id}: källans licens eller kontrolldatum saknas`);
  }
});
