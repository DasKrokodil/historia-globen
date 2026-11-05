// Tester för etikettkontrollens rena delar (#588): .github/scripts/etikettkontroll.cjs.
// Körs med de andra funktionstesterna: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { bedom, stangda, kontrolleraIssue, stadaEfterMerge, dagligKontroll } = createRequire(import.meta.url)('../.github/scripts/etikettkontroll.cjs');

test('bedom: inga motsägelser är tom lista', () => {
  assert.deepEqual(bedom([]), []);
  assert.deepEqual(bedom(['idé', 'teknik']), []);
  assert.deepEqual(bedom(['codex: redo']), []);
  assert.deepEqual(bedom(['copilot: pågår']), []);
  assert.deepEqual(bedom(['behöver hjälp', 'orkester: pågår']), []);
});

test('bedom: flera ägare, två redo och redo med pågår ger varning', () => {
  assert.equal(bedom(['codex: pågår', 'copilot: pågår']).length, 1);
  assert.equal(bedom(['codex: redo', 'copilot: redo']).length, 1);
  assert.equal(bedom(['copilot: redo', 'copilot: pågår']).length, 1);
  assert.equal(bedom(['codex: redo', 'copilot: redo', 'orkester: pågår']).length, 2);
});

test('stangda: bara Closes, Fixes och Resolves, inte Del av', () => {
  assert.deepEqual(stangda('Closes #12\nDel av #13\nfixes #14 och Resolves #12'), [12, 14]);
  assert.deepEqual(stangda('Del av #13'), []);
  assert.deepEqual(stangda(null), []);
});

// Minimal låtsas-GitHub som skriver ner vad som anropas.
function fake({ issue, removed = [], calls = [] }) {
  return {
    calls,
    ctx: {
      context: { repo: { owner: 'o', repo: 'r' } },
      github: { rest: { issues: {
        get: async () => ({ data: issue }),
        addLabels: async a => { calls.push(['add', a.labels.join()]); },
        removeLabel: async a => { calls.push(['remove', a.name]); },
        createComment: async a => { calls.push(['comment', a.body.slice(0, 20)]); },
      } } },
    },
  };
}

test('kontrolleraIssue varnar bara en gång och tar bort varningen när det är rättat', async () => {
  let f = fake({ issue: { state: 'open', labels: [{ name: 'codex: pågår' }, { name: 'copilot: pågår' }] } });
  assert.equal(await kontrolleraIssue(f.ctx, 5), 'varnade');
  assert.deepEqual(f.calls.map(c => c[0]), ['add', 'comment']);
  f = fake({ issue: { state: 'open', labels: [{ name: 'codex: pågår' }, { name: 'copilot: pågår' }, { name: 'etikettfel' }] } });
  assert.equal(await kontrolleraIssue(f.ctx, 5), 'ok');
  assert.deepEqual(f.calls, []);
  f = fake({ issue: { state: 'open', labels: [{ name: 'codex: pågår' }, { name: 'etikettfel' }] } });
  assert.equal(await kontrolleraIssue(f.ctx, 5), 'varningen borttagen');
  assert.deepEqual(f.calls, [['remove', 'etikettfel']]);
  f = fake({ issue: { state: 'closed', labels: [{ name: 'codex: pågår' }, { name: 'copilot: pågår' }] } });
  assert.equal(await kontrolleraIssue(f.ctx, 5), 'hoppade över');
});

test('stadaEfterMerge tar bort pågår, redo och hjälp på issuen men låter andra etiketter vara', async () => {
  const f = fake({ issue: { state: 'closed', labels: [{ name: 'utseende' }, { name: 'copilot: pågår' }, { name: 'behöver hjälp' }] } });
  const gjorda = await stadaEfterMerge(f.ctx, { merged: true, number: 9, body: 'Closes #5\nDel av #6', labels: [{ name: 'behöver hjälp' }] });
  assert.deepEqual(gjorda, ['#5: copilot: pågår', '#5: behöver hjälp']);
  assert.ok(!f.calls.some(c => c[1] === 'utseende'));
  const ej = fake({ issue: { state: 'open', labels: [{ name: 'codex: pågår' }] } });
  assert.deepEqual(await stadaEfterMerge(ej.ctx, { merged: false, number: 9, body: 'Closes #5', labels: [] }), []);
  assert.deepEqual(ej.calls, []);
});

test('dagligKontroll påminner om gammalt pågår utan öppen pull request, men inte om nytt eller om det finns en aktiv pull request', async () => {
  const dagar = n => new Date(Date.now() - n * 24 * 3600 * 1000).toISOString();
  const issues = [
    { number: 1, state: 'open', updated_at: dagar(10), labels: [{ name: 'codex: pågår' }] },
    { number: 2, state: 'open', updated_at: dagar(2), labels: [{ name: 'codex: pågår' }] },
    { number: 3, state: 'open', updated_at: dagar(10), labels: [{ name: 'copilot: pågår' }] },
    { number: 4, state: 'open', updated_at: dagar(10), labels: [{ name: 'idé' }] },
  ];
  const pulls = [{ head: { ref: 'copilot/issue-3-version' }, updated_at: dagar(1) }];
  const kommentarer = [];
  const ctx = {
    context: { repo: { owner: 'o', repo: 'r' } },
    core: { info() {} },
    github: {
      paginate: async fn => (fn === ctx.github.rest.pulls.list ? pulls : issues),
      rest: {
        pulls: { list: () => {} },
        issues: {
          listForRepo: () => {},
          get: async a => ({ data: issues.find(i => i.number === a.issue_number) }),
          createComment: async a => { kommentarer.push(a.issue_number); },
          addLabels: async () => {}, removeLabel: async () => {},
        },
      },
    },
  };
  await dagligKontroll(ctx);
  assert.deepEqual(kommentarer, [1]);
});
