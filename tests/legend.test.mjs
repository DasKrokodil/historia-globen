// #1197: kontrollera vad teckenförklaringen faktiskt skriver, inte bara språkfilernas nycklar.
// Varje språk får en egen process eftersom i18n.js väljer språk vid import.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
  test(`teckenförklaringens status, klickruta och reservtexter på ${lang} (#1197)`, () => {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
      import assert from 'node:assert/strict';
      globalThis.location = { search: '?lang=${lang}' };
      globalThis.document = { activeElement: null };
      globalThis.innerWidth = 1400; globalThis.innerHeight = 900;
      const { ReligionLegend, EmpireLegend } = await import('./js/ui/legend.js');
      const { ui } = await import('./js/i18n.js');
      const element = () => ({ hidden: true, innerHTML: '', style: {},
        contains: () => false, querySelector: () => null, setAttribute() {} });
      const legend = Object.assign(Object.create(ReligionLegend.prototype), {
        legend: element(), pop: element(), names: new Map(), open: true, discoveryOpen: true,
      });
      // Syntetiska namn och år: kontrollerna hävdar inga historiska fakta.
      const religion = { id: 'test', name: { sv: 'Testreligion', en: 'TestReligion', de: 'TestReligion', es: 'TestReligión', fr: 'TestReligion' }, color: '#fff', facts: {} };
      legend.items = [{ religion, unsure: true }, { religion, inherited: true }];
      legend.focus = { war: true, fadable: ['Alpha', 'Beta'] };
      legend.render();
      const html = () => legend.legend.innerHTML + legend.pop.innerHTML;
      for (const key of ['unsure', 'inherited', 'aboutReligions', 'showNormal', 'warNote']) {
        assert.ok(html().includes(ui('legend.' + key)), key);
      }
      assert.ok(html().includes('Alpha' + ui('legend.and') + 'Beta') || '${lang}' === 'sv');
      legend.showPop({ religion, snapshot: { sure: false }, polities: [], loading: true }, 100, 100);
      assert.ok(html().includes(ui('legend.loadingEmpire')));
      assert.ok(html().includes(ui('legend.unsureArea')));
      assert.ok(legend.pop.innerHTML.includes('aria-label="' + ui('common.close') + '"'));
      // Data måste fortsätta vara text, även i översatta meningar med flera platshållare.
      legend.showPop({ religion, snapshot: {}, polities: [], here: [{ name: '<test>&', wikipedia: 'https://en.wikipedia.org/wiki/Test' }] }, 100, 100);
      assert.ok(legend.pop.innerHTML.includes('&lt;test&gt;&amp;'));
      assert.ok(!legend.pop.innerHTML.includes('<test>'));
      assert.ok(legend.pop.innerHTML.includes(ui('legend.newTab')));
      const inherited = legend.inheritedNote({ religion,
        snapshot: { start: 0, inherited: { until: 10, from: ['Test A', 'Test B', 'Test C', 'Test D'] } },
        polities: [], here: [{ name: 'Test', rule: 'saknas' }],
      }, p => p.name);
      assert.ok(inherited.includes(ui('legend.missingReligion', { empire: 'Test' })));
      assert.ok(inherited.includes(ui('legend.andMore', { empires: 'Test A, Test B' })));
      const empire = Object.assign(Object.create(EmpireLegend.prototype), {
        legend: element(), visible: true, open: true, text: {}, items: [{ group: { id: 'test', name: 'Test', color: '#fff' }, colonial: true }],
      });
      empire.render();
      for (const key of ['colonialEmpires', 'highlightEmpire', 'closeEmpires']) {
        assert.ok(empire.legend.innerHTML.includes(ui('legend.' + key)), key);
      }
      const output = html() + inherited + empire.legend.innerHTML;
      assert.ok(!/legend\\.[a-zA-Z]+|\\{(?:religion|empires|empire|reason|year|layers|count|title)\\}/.test(output), 'rå nyckel eller platshållare');
      if ('${lang}' !== 'sv') assert.ok(!/Teckenförklaring|Söker riket|Läs mer om|Ärvt område|Stäng|osäkert/.test(output), 'svensk reservtext');
      if ('${lang}' === 'de') {
        assert.ok(legend.legend.innerHTML.includes('hervorzuheben'));
        assert.ok(legend.legend.innerHTML.includes('TestReligion'));
        assert.ok(!legend.legend.innerHTML.includes('testreligion'));
      }
    `], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.error?.message);
  });
}
