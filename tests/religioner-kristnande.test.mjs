// Religionslagret (#2150): riken med ett kontrollerat år för kristnandet (conversion med religionen kristendom, tidigare
// christianSince, #2162) visas inte i en annan religion efter det året, och de brittiska rikena (Brythonic Kingdoms, Brythons) får inte germansk religion när de
// ärver ett område efter de anglosaxiska rikena. Läser data/religions.json som tools/religioner.py har byggt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../data/religions.json', import.meta.url), 'utf8'));
const sources = JSON.parse(readFileSync(new URL('../data/sources.json', import.meta.url), 'utf8')).sources;
const sourceIds = new Set(sources.map(s => s.id));

/** Religionerna vars ögonblicksbild det året räknar upp riket. */
function religionsAt(polity, year) {
  const out = [];
  for (const r of data.religions) {
    for (const s of r.snapshots) {
      if (s.start <= year && year <= s.end && (s.polities || []).includes(polity)) out.push(r.id);
    }
  }
  return out;
}

const register = new Map(data.polities.map(p => [p.name, p]));

test('de anglosaxiska rikena har ett år för kristnandet med källa', () => {
  const years = {
    'Kingdom of Kent': 624, 'Kingdom of East Anglia': 630, 'Kingdom of Northumbria': 635,
    'Kingdom of Wessex': 640, 'Kingdom of Mercia': 656, 'Kingdom of Sussex': 681,
  };
  for (const [name, year] of Object.entries(years)) {
    const p = register.get(name);
    assert.equal(p?.conversion?.religion, 'kristendom', `${name}: conversion.religion`);
    assert.equal(p.conversion.since, year, `${name}: conversion.since`);
    for (const id of p.conversion.sources) assert.ok(sourceIds.has(id), `${name}: källan ${id} finns inte i sources.json`);
  }
});

test('kontrollpunkter: kristna riken efter kristnandet, hedniska före', () => {
  assert.deepEqual(religionsAt('Kingdom of Mercia', 900), ['kristendom']);
  assert.deepEqual(religionsAt('Kingdom of Northumbria', 700), ['kristendom']);
  assert.deepEqual(religionsAt('Kingdom of Kent', 750), ['kristendom']);
  assert.deepEqual(religionsAt('Kingdom of Wessex', 900), ['kristendom']);
  assert.deepEqual(religionsAt('Kingdom of Sussex', 750), ['kristendom']);
  // Före kristnandet står faktarutans första religion kvar (osäker)
  assert.deepEqual(religionsAt('Kingdom of Mercia', 600), ['germansk']);
});

test('de brittiska rikena har inte germansk religion', () => {
  for (const name of ['(Brythonic Kingdoms)', 'Brythons']) {
    for (const year of [500, 600, 900, 1000, 1050]) {
      assert.ok(!religionsAt(name, year).includes('germansk'), `${name} ${year}: germansk`);
    }
  }
  assert.ok(religionsAt('(Brythonic Kingdoms)', 1000).includes('kristendom'));
});

test('inget rike med religionsbyte (conversion) visas i en annan religion efter bytets år', () => {
  const fel = [];
  for (const r of data.religions) {
    for (const s of r.snapshots) {
      for (const name of s.polities || []) {
        const c = register.get(name)?.conversion;
        if (c && c.religion !== r.id && s.start >= c.since) fel.push(`${name} i ${r.id} ${s.start}–${s.end}`);
      }
    }
  }
  assert.deepEqual(fel, []);
});
