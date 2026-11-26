import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LOW_WINDOW } from '../js/tour-format.js';

// Gränsen för att turkortets fot rullar med texten (#2147, #2169) står på tre ställen som måste vara lika:
// CSS (@media), turkortet (Fortsätt läsa, bildens plats, tonad nederkant) och lektionens uppdragslänk.
const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
const tour = readFileSync(new URL('../js/ui/tour.js', import.meta.url), 'utf8');
const lesson = readFileSync(new URL('../js/ui/lesson.js', import.meta.url), 'utf8');

test('gränsen är 600 px, och 700 px i bred layout', () => {
  assert.equal(LOW_WINDOW, '(max-height: 600px), (min-width: 761px) and (max-height: 700px)');
});

test('CSS använder samma gräns för foten, Fortsätt läsa och den tonade nederkanten', () => {
  const at = css.indexOf(`@media ${LOW_WINDOW} {\n  .tour-card .tour-bar { position: static; }`);
  assert.ok(at > 0, 'regeln för den rullande foten saknar den gemensamma gränsen');
  const block = css.slice(at, css.indexOf('\n}\n', at));
  assert.match(block, /\.tour-card \.tour-more \{ display: none; \}/);
  assert.match(block, /\.tour-card\.tour-mer-nedan::after \{[^}]*pointer-events: none/);
  assert.match(block, /bottom: var\(--tour-mer-lyft, 0px\)/, 'tonen ska lyftas över foten som sticker upp');
});

test('tour.js och lesson.js läser gränsen från tour-format.js', () => {
  assert.match(tour, /matchMedia\(LOW_WINDOW\)/);
  assert.match(lesson, /matchMedia\?\.\(LOW_WINDOW\)/);
  assert.doesNotMatch(tour + lesson, /\(max-height: 600px\)/, 'ingen egen kopia av gränsen');
});
