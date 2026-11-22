// Färger och läsbarhet (#1318): kategorifärgerna ska kunna skiljas åt också med simulerad färgblindhet, och etiketterna på globen
// ska läsas med minst 4,5:1 även när de vetter bort mot klotets kant. Räkningen ligger i tests/farg-berakning.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CATEGORIES } from '../js/model.js';
import { LABEL_FADE_FROM, LABEL_MIN_FACING, LABEL_MIN_OPACITY, labelOpacity } from '../js/ui/clusters.js';
import { hexToRgb, lab, deltaE00, skillnad, skillnadFargblind, simulera, kontrast, blanda } from './farg-berakning.mjs';

const cssVar = name => readFileSync(new URL('../css/style.css', import.meta.url), 'utf8').match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`))[1];
const NATT = cssVar('--night'), HAV = cssVar('--ocean'), PERGAMENT = cssVar('--parchment');

test('CIEDE2000 räknar som referenspunkterna i Sharma, Wu och Dalal (2005)', () => {
  assert.ok(Math.abs(deltaE00([50, 2.6772, -79.7751], [50, 0, -82.7485]) - 2.0425) < 0.001);
  assert.ok(Math.abs(deltaE00([50, 2.5, 0], [50, 0, -2.5]) - 4.3065) < 0.001);
  assert.ok(Math.abs(deltaE00([50, 2.5, 0], [73, 25, -18]) - 27.1492) < 0.001);
});

test('färgblindhetssimuleringen låter vitt och grått vara grått och ändrar rött och grönt vid deuteranopi', () => {
  for (const typ of ['deuteranopi', 'protanopi', 'tritanopi']) {
    const [r, g, b] = simulera([128, 128, 128], typ);
    assert.ok(Math.abs(r - 128) < 1.5 && Math.abs(g - 128) < 1.5 && Math.abs(b - 128) < 1.5, `${typ}: grått förblir grått`);
  }
  assert.ok(skillnad('#ff0000', '#00aa00') > 40 && skillnad('#ff0000', '#00aa00', 'deuteranopi') < 40, 'rött och grönt ligger närmare vid deuteranopi');
});

const PAR = CATEGORIES.flatMap((a, i) => CATEGORIES.slice(i + 1).map(b => [a, b]));
// Krig (svärd på 78 procent av händelserna) och rymden (satellit och raket på 72 procent) bär sin skillnad också i formen. Alla andra
// kategorier är en prick i kategorins färg på markören, och i etiketten och brickorna, så där är färgen det enda som skiljer dem åt.
const FORM = new Set(['krig', 'rymden']);

test('de 14 kategorifärgerna: inga två utan egen form går att blanda ihop vid färgblindhet (ΔE00 minst 5)', () => {
  assert.equal(CATEGORIES.length, 14);
  const svaga = PAR.filter(([a, b]) => !FORM.has(a.id) && !FORM.has(b.id) && skillnadFargblind(a.color, b.color) < 5)
    .map(([a, b]) => `${a.id}/${b.id} ${skillnadFargblind(a.color, b.color).toFixed(1)}`);
  assert.deepEqual(svaga, [], 'par som blir för lika vid deuteranopi, protanopi eller tritanopi');
});

test('kategorifärgerna: par med krig eller rymden håller ΔE00 minst 4 vid färgblindhet, och alla par minst 9 med normalt färgseende', () => {
  const svaga = PAR.filter(([a, b]) => skillnadFargblind(a.color, b.color) < 4).map(([a, b]) => `${a.id}/${b.id}`);
  assert.deepEqual(svaga, []);
  const lika = PAR.filter(([a, b]) => skillnad(a.color, b.color) < 9).map(([a, b]) => `${a.id}/${b.id} ${skillnad(a.color, b.color).toFixed(1)}`);
  assert.deepEqual(lika, []);
});

test('kategorifärgerna syns mot natthimlen (minst 4,5:1) och mot havet (minst 3,5:1)', () => {
  for (const c of CATEGORIES) {
    assert.ok(kontrast(hexToRgb(c.color), hexToRgb(NATT)) >= 4.5, `${c.id} mot --night: ${kontrast(hexToRgb(c.color), hexToRgb(NATT)).toFixed(2)}`);
    assert.ok(kontrast(hexToRgb(c.color), hexToRgb(HAV)) >= 3.5, `${c.id} mot --ocean: ${kontrast(hexToRgb(c.color), hexToRgb(HAV)).toFixed(2)}`);
  }
});

test('de rättade färgerna är fortfarande samma färgfamilj: ingen kategori har flyttat mer än ΔE00 6 från de ursprungliga', () => {
  // Färgerna före #1318, så att en framtida ändring av tonen märks här och inte bara i en skärmbild.
  const FORE = { natur: '#8cc084', manniskan: '#c99263', civilisationer: '#e3a33f', religion: '#b892dc', vetenskap: '#5fb6dd', upptackter: '#4fc6b2',
    krig: '#e5675a', kultur: '#ec98bd', sport: '#f28c45', ekonomi: '#a9bd5e', halsa: '#d8d46e', klimat: '#7aa4e6', katastrofer: '#c256f5', rymden: '#cfcbff' };
  for (const c of CATEGORIES) assert.ok(skillnad(FORE[c.id], c.color) <= 6, `${c.id}: ${skillnad(FORE[c.id], c.color).toFixed(1)}`);
  assert.equal(CATEGORIES.find(c => c.id === 'krig').color, FORE.krig, 'krigsfärgen står också i Hjälp (index.html) och är oförändrad');
});

test('en etikett på globen har minst 4,5:1 mellan text och bakgrund över hav, land, istidens kust och is, på alla avstånd från kanten', () => {
  const under = [HAV, '#c8b48a', '#d6c496', '#f1f4f6', '#ffffff'].map(hexToRgb); // hav, land, istidens kust, inlandsis, vitt som yttersta fall
  const text = hexToRgb(PERGAMENT), natt = hexToRgb(NATT);
  let lagsta = Infinity;
  for (let facing = LABEL_MIN_FACING; facing <= 1.0001; facing += 0.01) {
    const a = labelOpacity(facing);
    for (const u of under) {
      // Elementet har bakgrunden --night med 78 procents täckning och ligger över underlaget med styrkan a (css .glabel + style.opacity)
      const bakgrund = blanda(blanda(natt, u, 0.78), u, a), skrift = blanda(text, u, a);
      lagsta = Math.min(lagsta, kontrast(skrift, bakgrund));
    }
  }
  assert.ok(lagsta >= 4.5, `lägsta kontrast ${lagsta.toFixed(2)}:1`);
});

test('labelOpacity: dold under gränsen, full styrka från LABEL_FADE_FROM, och aldrig svagare än LABEL_MIN_OPACITY däremellan', () => {
  assert.equal(labelOpacity(0), 0);
  assert.equal(labelOpacity(LABEL_MIN_FACING - 0.001), 0);
  assert.equal(labelOpacity(LABEL_MIN_FACING), LABEL_MIN_OPACITY);
  assert.equal(labelOpacity(LABEL_FADE_FROM), 1);
  assert.equal(labelOpacity(1), 1);
  let prev = 0;
  for (let f = LABEL_MIN_FACING; f <= 1; f += 0.01) { const o = labelOpacity(f); assert.ok(o >= LABEL_MIN_OPACITY && o >= prev - 1e-9 && o <= 1); prev = o; }
  assert.ok(LABEL_MIN_OPACITY >= 0.85, 'under 85 procents styrka går kontrasten över is under 4,5:1');
});

test('Lab-omvandlingen ger svart L=0 och vitt L=100', () => {
  assert.ok(Math.abs(lab([0, 0, 0])[0]) < 0.01);
  assert.ok(Math.abs(lab([255, 255, 255])[0] - 100) < 0.01);
});
