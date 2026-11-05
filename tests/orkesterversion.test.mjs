// Tester för orkesterns versionskontroll: .github/scripts/orkesterversion.cjs.
// Körs med de andra funktionstesterna: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const { kontrollera, tolka, installerad, nyaste } = createRequire(import.meta.url)('../.github/scripts/orkesterversion.cjs');

test('tolka: bara stabila versioner', () => {
  assert.deepEqual(tolka('v0.8.2'), [0, 8, 2]);
  assert.equal(tolka('v0.9.0-rc1'), null);
  assert.equal(tolka('main'), null);
});

test('nyaste: jämför siffror, inte text eller ordning', () => {
  assert.equal(nyaste(['v0.7.0', 'v0.10.0', 'v0.9.1', 'v1.0.0-rc1']), 'v0.10.0');
  assert.equal(nyaste(['foo']), null);
});

test('installerad: läser taggen ur projektets egen project.md', () => {
  assert.match(installerad(fs.readFileSync('.orchestra/project.md', 'utf8')), /^v\d+\.\d+\.\d+$/);
  assert.equal(installerad('ingen sådan rad'), null);
});

function falskGithub(taggar, oppna = []) {
  const gjort = [];
  const rest = {
    repos: { listTags: 'listTags' },
    issues: {
      listForRepo: 'listForRepo',
      create: async a => { gjort.push(['create', a]); return { data: { number: 99 } }; },
      update: async a => { gjort.push(['update', a]); },
      createComment: async a => { gjort.push(['comment', a]); },
    },
  };
  const paginate = async fn => (fn === 'listTags' ? taggar.map(name => ({ name })) : oppna);
  return { github: { rest, paginate }, gjort, context: { repo: { owner: 'o', repo: 'r' } } };
}

test('kontrollera: inget görs när installerad är nyaste', async () => {
  const inst = installerad(fs.readFileSync('.orchestra/project.md', 'utf8'));
  const g = falskGithub([inst, 'v0.1.0']);
  assert.match(await kontrollera(g), /Aktuell/);
  assert.equal(g.gjort.length, 0);
});

test('kontrollera: nyare version ger ett issue, och ett öppet issue uppdateras i stället för en dubblett', async () => {
  const g = falskGithub(['v99.0.0']);
  await kontrollera(g);
  assert.equal(g.gjort[0][0], 'create');
  assert.match(g.gjort[0][1].title, /\(v99\.0\.0\)$/);

  const titel = g.gjort[0][1].title.replace('v99.0.0', 'v98.0.0');
  const h = falskGithub(['v99.0.0'], [{ number: 7, title: titel }]);
  await kontrollera(h);
  assert.deepEqual(h.gjort.map(x => x[0]), ['update', 'comment']);

  const k = falskGithub(['v99.0.0'], [{ number: 7, title: g.gjort[0][1].title }]);
  assert.match(await kontrollera(k), /gäller redan/);
  assert.equal(k.gjort.length, 0);
});
