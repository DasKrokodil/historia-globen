// Religionslagret (#2150): riken med ett kontrollerat år för kristnandet (christianSince) visas inte i en annan
// religion efter det året, och de brittiska rikena (Brythonic Kingdoms, Brythons) får inte germansk religion när de
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
    assert.equal(p?.christianSince, year, `${name}: christianSince`);
    assert.ok(sourceIds.has(p.source), `${name}: källan ${p.source} finns inte i sources.json`);
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

test('inget rike med christianSince visas i en annan religion efter det året', () => {
  const fel = [];
  for (const r of data.religions) {
    if (r.id === 'kristendom') continue;
    for (const s of r.snapshots) {
      for (const name of s.polities || []) {
        const since = register.get(name)?.christianSince;
        if (since != null && s.start >= since) fel.push(`${name} i ${r.id} ${s.start}–${s.end}`);
      }
    }
  }
  assert.deepEqual(fel, []);
});
