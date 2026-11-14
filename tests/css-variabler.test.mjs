import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

// En kontroll av deklarationer, i samma stil som lagerkontrollen (tests/zindex.test.mjs, #1065).
// En `var(--x)` utan reservvärde och utan någon deklaration av --x blir ogiltig vid beräkning:
// en `outline: 2px solid var(--x)` försvinner då helt, och fokusringen saknas (#1471).
// Maskningen behåller positioner och radnummer men hindrar exempel i kommentarer och strängar från att räknas.
const mask = css => css.replace(/\/\*[\s\S]*?\*\/|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'/g,
  token => token.replace(/[^\r\n]/g, ' '));

// Variabler som deklareras någonstans i CSS-filen (i :root eller i en regel).
export function declaredVariables(css) {
  return new Set([...mask(css).matchAll(/(?:^|[;{\s])(--[\w-]+)\s*:/g)].map(m => m[1]));
}

// Använda variabler utan reservvärde: `var(--x)` men inte `var(--x, reserv)`.
export function usesWithoutFallback(css) {
  const masked = mask(css);
  const uses = [];
  for (const match of masked.matchAll(/var\(\s*(--[\w-]+)\s*([,)])/g)) {
    if (match[2] === ',') continue;
    uses.push({ name: match[1], line: masked.slice(0, match.index).split('\n').length });
  }
  return uses;
}

export function undefinedVariables(css, allowed = {}) {
  const declared = declaredVariables(css);
  return usesWithoutFallback(css).filter(({ name }) => !declared.has(name) && !(name in allowed));
}

// Variabler som medvetet saknar deklaration i css/style.css. De som sätts i JS ligger inline på elementet
// (style.setProperty eller style="--x:…") och får inte läggas till här i stället för en deklaration i :root.
// Provet kontrollerar att varje post fortfarande behövs, så att listan inte blir kvar när felet är rättat.
export const SATTS_I_JS = {
  '--ac': 'js/ui/areacurve.js: ytkurvans färg, inline på svg-elementet',
  '--war': 'js/ui/legend.js: krigets färg, inline på teckenförklaringens ruta',
  '--ff-reserve-color': 'js/ui/funfact.js: kategorifärgen på reservkortet, inline på knappen',
  '--focus-top': 'js/main.js: fokusradens höjd, på app-elementet',
  '--pause-top': 'js/main.js: pausradens höjd, på app-elementet',
};
// Känt fel som väntar på egen rättning: `.jump-era > span` använder --dim, som aldrig har definierats,
// så färgen ärvs. Ta bort posten när variabeln definieras eller byts mot --parchment-dim.
export const KANDA_FEL = {
  '--dim': 'css/style.css: .jump-era > span (se Nya issues i #1471)',
};

const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
const allowed = { ...SATTS_I_JS, ...KANDA_FEL };

function jsFiles(dir, root = new URL('../', import.meta.url)) {
  const out = [];
  for (const entry of readdirSync(new URL(dir, root), { withFileTypes: true })) {
    const path = `${dir}${entry.name}`;
    if (entry.isDirectory()) out.push(...jsFiles(`${path}/`, root));
    else if (entry.name.endsWith('.js')) out.push(path);
  }
  return out;
}

test('varje var(--x) i css/style.css har en deklaration eller ett reservvärde (#1471)', () => {
  const violations = undefinedVariables(css, allowed);
  assert.equal(violations.length, 0, violations.map(({ name, line }) =>
    `css/style.css:${line}: var(${name}) saknar deklaration och reservvärde. Definiera ${name} i :root eller skriv var(${name}, reserv).`).join('\n'));
});

test('--brass-light är definierad i :root eftersom fokusringarna bygger på den (#1471)', () => {
  const root = css.slice(css.indexOf(':root {'), css.indexOf('\n}', css.indexOf(':root {')));
  assert.match(root, /--brass-light\s*:/);
});

test('undantagslistan innehåller bara variabler som fortfarande används utan deklaration (#1471)', () => {
  const declared = declaredVariables(css);
  const used = new Set(usesWithoutFallback(css).map(u => u.name));
  for (const name of Object.keys(allowed)) {
    assert.ok(!declared.has(name), `${name} är nu deklarerad i css/style.css: ta bort den ur undantagslistan.`);
    assert.ok(used.has(name), `${name} används inte längre utan reservvärde: ta bort den ur undantagslistan.`);
  }
});

test('variablerna som sägs sättas i JS sätts där (#1471)', () => {
  const source = jsFiles('js/').map(file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')).join('\n');
  for (const name of Object.keys(SATTS_I_JS)) {
    assert.ok(source.includes(name), `${name} står som satt i JS men finns inte i js/: ta bort den ur undantagslistan eller definiera den i :root.`);
  }
});

test('variabelkontrollen hittar saknade variabler, tillåter reservvärden och ignorerar kommentarer (#1471)', () => {
  const sample = `
    :root { --brass: #d6b06a; --a-b2: 1px; }
    /* .x { outline: var(--kommentar); } */
    .a { outline: 2px solid var(--brass-light); }
    .b { color: var( --saknas ,  var(--brass)); background: var(--brass); }
    .c { content: 'var(--text)'; border-width: var(--a-b2); }
    .d { margin: calc(var(--n)
      + var(--brass)); }
    .e { color: var(--brass-light, var(--brass)); }
  `;
  assert.deepEqual([...declaredVariables(sample)].sort(), ['--a-b2', '--brass']);
  assert.deepEqual(undefinedVariables(sample), [
    { name: '--brass-light', line: 4 },
    { name: '--n', line: 7 },
  ]);
  assert.deepEqual(undefinedVariables(sample, { '--n': 'inline' }), [{ name: '--brass-light', line: 4 }]);
});
