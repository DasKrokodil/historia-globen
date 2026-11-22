// Religionslagret (#2140): handplockat val av religion per rike (religionOverride i registret i data/religions.json).
// Valet gäller bara när en öppnad källa uttryckligen säger vilken religion faktarutans allmännare ord betyder, och
// varje val har sin källa i sources.json. Visigoterna och Hwicce visas med germansk religion, Zapotekerna med
// mesoamerikansk. Chimor och Kanem-Bornu har inget val (beslut 2026-11-22). Läser data/religions.json som
// tools/religioner.py har byggt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../data/religions.json', import.meta.url), 'utf8'));
const sources = JSON.parse(readFileSync(new URL('../data/sources.json', import.meta.url), 'utf8')).sources;
const sourceIds = new Set(sources.map(s => s.id));
const religionIds = new Set(data.religions.map(r => r.id));
const register = new Map(data.polities.map(p => [p.name, p]));

/** Religionerna vars ögonblicksbild det året räknar upp riket (utan ärvda områden). */
function religionsAt(polity, year) {
  const out = [];
  for (const r of data.religions) {
    for (const s of r.snapshots) {
      if (!s.inherited && s.start <= year && year <= s.end && (s.polities || []).includes(polity)) out.push({ id: r.id, sure: s.sure });
    }
  }
  return out;
}

test('varje handplockat val har en religion i lagret och minst en källa i sources.json', () => {
  const val = data.polities.filter(p => p.religionOverride);
  assert.ok(val.length >= 3, 'för få riken med religionOverride');
  for (const p of val) {
    const o = p.religionOverride;
    assert.ok(religionIds.has(o.religion), `${p.name}: religionen ${o.religion} finns inte i lagret`);
    assert.ok(Array.isArray(o.sources) && o.sources.length, `${p.name}: religionOverride saknar källor`);
    for (const id of o.sources) assert.ok(sourceIds.has(id), `${p.name}: källan ${id} finns inte i sources.json`);
    assert.equal(p.religion, o.religion, `${p.name}: registrets religion följer inte valet`);
  }
});

test('valen i #2140: Visigoterna och Hwicce germansk, Zapotekerna mesoamerikansk', () => {
  const want = { Visigoths: 'germansk', Hwicce: 'germansk', 'Zapotec Civilization': 'mesoamerikansk' };
  for (const [name, rel] of Object.entries(want)) {
    assert.equal(register.get(name)?.religionOverride?.religion, rel, `${name}: religionOverride`);
  }
  // Valet byter religion men inte regel eller säkerhet: Visigoterna och Hwicce är fortfarande "först nämnd" (osäkra)
  assert.deepEqual(religionsAt('Visigoths', 420), [{ id: 'germansk', sure: false }]);
  assert.deepEqual(religionsAt('Hwicce', 620), [{ id: 'germansk', sure: false }]);
  for (const year of [-400, 0, 500, 850]) {
    assert.deepEqual(religionsAt('Zapotec Civilization', year), [{ id: 'mesoamerikansk', sure: true }], `Zapotekerna ${year}`);
  }
});

test('Chimor och Kanem-Bornu har inget handplockat val (beslut 2026-11-22)', () => {
  for (const name of ['Chimor', 'Chimu Empire', 'Bornu Empire', 'Empire of Kanem']) {
    const p = register.get(name);
    assert.ok(p, `${name} saknas i registret`);
    assert.equal(p.religionOverride, undefined, `${name} har fått religionOverride`);
  }
});
