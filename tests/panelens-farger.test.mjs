// Samtidigt-panelens färger (#1317, del 3): panelen är en läsyta av pergament med guldram. Räknar kontrasten för färgerna i css/style.css
// (variablerna --pn-* i .panel och de gemensamma --vellum, --vellum-ink, --rubric, --gold, --medal) så att en ändring av tonen märks här.
// Webbläsarkontrollen "Samtidigt-panelen har faktarutans pergament …" mäter samma sak på de riktiga elementen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CATEGORIES } from '../js/model.js';
import { hexToRgb, kontrast, blanda } from './farg-berakning.mjs';

const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
const rot = name => css.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`))[1];
const panelBlock = css.match(/\n\.panel \{\n\s+--pn-bg:[\s\S]*?\n\}/)[0];
const pn = name => { const m = panelBlock.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`)); assert.ok(m, `${name} är en hex i .panel`); return m[1]; };
const rgb = hex => hexToRgb(hex);
const kr = (a, b) => kontrast(a, b);

const VELLUM = rgb(rot('--vellum')), INK = rgb(rot('--vellum-ink')), RUBRIC = rgb(rot('--rubric')), GOLD = rgb(rot('--gold')), MEDAL = rgb(rot('--medal'));
const DIM = rgb(pn('--pn-dim')), KONTROLL = rgb(pn('--pn-control'));
const TINT = blanda(GOLD, VELLUM, 0.18); // --pn-tint: color-mix(gold 18 %, vellum), används på filterknappen, chipsen och markerad rad

test('panelens bakgrund och ram är pergamentet och guldet från faktarutans ram', () => {
  assert.match(panelBlock, /--pn-bg:\s*var\(--vellum\)/);
  assert.match(panelBlock, /border:\s*2px solid var\(--gold\)/);
  assert.match(panelBlock, /inset 0 0 0 5px var\(--rubric\)/, 'innerlinjen i rubrikrött som .frame-medeltid');
});

test('text på pergamentet: brödtext 4,5:1 eller mer, dämpad text och rubrikrött också, även på den tonade ytan', () => {
  for (const [namn, text] of [['text', INK], ['dämpad', DIM], ['rubrikrött', RUBRIC]]) {
    assert.ok(kr(text, VELLUM) >= 4.5, `${namn} mot pergament: ${kr(text, VELLUM).toFixed(2)}`);
    assert.ok(kr(text, TINT) >= 4.5, `${namn} mot tonad yta: ${kr(text, TINT).toFixed(2)}`);
  }
  assert.ok(kr(INK, GOLD) >= 4.5, `text på den valda fliken (guld): ${kr(INK, GOLD).toFixed(2)}`);
});

test('kontrollramar mot pergament och tonad yta: minst 3:1', () => {
  assert.ok(kr(KONTROLL, VELLUM) >= 3, `mot pergament: ${kr(KONTROLL, VELLUM).toFixed(2)}`);
  assert.ok(kr(KONTROLL, TINT) >= 3, `mot tonad yta: ${kr(KONTROLL, TINT).toFixed(2)}`);
});

test('kategoriprickarna: den mörka botten syns mot pergamentet, och färgen syns mot botten (4,5:1, som mot natthimlen i #1318)', () => {
  assert.ok(kr(MEDAL, VELLUM) >= 3, `botten mot pergament: ${kr(MEDAL, VELLUM).toFixed(2)}`);
  for (const c of CATEGORIES) assert.ok(kr(rgb(c.color), MEDAL) >= 4.5, `${c.id} mot --medal: ${kr(rgb(c.color), MEDAL).toFixed(2)}`);
  assert.match(css, /\.panel \.filter \.dot \{[^}]*outline: 2px solid var\(--medal\)/);
  assert.match(css, /\.panel \.event-btn \.dot \{ outline: 2px solid var\(--medal\)/);
});

test('chipsens av-läge syns inte bara med genomskinlighet, och chipsen är minst 12 px med 24 px yta', () => {
  assert.match(css, /\.panel \.filter\[aria-pressed="false"\] \{ opacity: 1; [^}]*border-style: dashed/);
  assert.match(css, /\.panel \.filter, \.panel-filters \.filter \{[^}]*min-height: 24px; font-size: 12px/);
});

test('Visste du?-kortet behåller pergamentet och stängknapparna i andra kort är orörda', () => {
  assert.match(css, /\.funfact \{[^}]*background: var\(--parchment\)/);
  assert.doesNotMatch(css, /\n\.panel-x \{[^}]*--pn-/, 'bara .panel .panel-x ändras');
});
