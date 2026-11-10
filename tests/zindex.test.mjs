import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// En kontroll av deklarationer, utan CSS-beroende. Maskningen behåller positioner
// och radnummer men hindrar exempel i kommentarer och strängar från att räknas.
export function unnamedLayers(css) {
  const masked = css.replace(/\/\*[\s\S]*?\*\/|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'/g,
    token => token.replace(/[^\r\n]/g, ' '));
  const declarations = /(?:^|[;{])\s*z-index\s*:\s*([+-]?\d+)\s*(?:!\s*important\s*)?(?=[;}])/gi;
  const violations = [];
  for (const match of masked.matchAll(declarations)) {
    const value = Number(match[1]);
    if (value <= 4) continue;
    const index = match.index + match[0].toLowerCase().indexOf('z-index');
    const open = masked.lastIndexOf('{', index);
    const start = Math.max(masked.lastIndexOf('{', open - 1), masked.lastIndexOf('}', open - 1), masked.lastIndexOf(';', open - 1)) + 1;
    const selector = css.slice(start, open).replace(/\/\*[\s\S]*?\*\//g, ' ').trim().replace(/\s+/g, ' ');
    violations.push({ selector, line: masked.slice(0, index).split('\n').length, value });
  }
  return violations;
}

test('kartans lager över 4 använder namn i :root (#1065)', () => {
  const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
  const violations = unnamedLayers(css);
  assert.equal(violations.length, 0, violations.map(({ selector, line, value }) =>
    `css/style.css:${line}: ${selector} har z-index: ${value}. Använd ett namngivet lager från :root: var(--z-…).`).join('\n'));
});

test('lagerkontrollen hittar tal även i mediaregler och med !important (#1065)', () => {
  const css = '/* z-index: 90; */\n@media (max-width: 760px) {\n  .popup, .panel {\n    Z-INDEX : +30 ! IMPORTANT;\n  }\n}\n.other { z-index: 5 }';
  assert.deepEqual(unnamedLayers(css), [
    { selector: '.popup, .panel', line: 4, value: 30 },
    { selector: '.other', line: 7, value: 5 },
  ]);
});

test('lagerkontrollen tillåter lokala och namngivna lager och ignorerar exempeltext (#1065)', () => {
  assert.deepEqual(unnamedLayers(`
    :root { --z-dialog: 50; }
    .local { z-index: 0; z-index: 1; z-index: 2; z-index: 3; z-index: 4 !important; }
    .dialog { z-index: var(--z-dialog); }
    /* .example { z-index: 30; } */
    .example::after { content: '} z-index: 30; {'; z-index: 2; }
  `), []);
});
