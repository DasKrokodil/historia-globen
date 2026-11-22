// Religionslagret (#2162): Cliopatrias USA-post 1967–2005 har en del över södra Vietnam med Saigon (#2151). Rikeslagret
// klipper bort den med rutan VIETNAM_USA i tools/riken.py, och tools/religioner.py och tools/religioner_riken.py klipper
// bort samma ruta (KLIPP). Saigon ska därför inte räknas till kristendomen genom USA, och USA:s gräns i klickrutans fil
// ska inte nå dit. Läser data/religions.json och data/religions-polities.json som verktygen har byggt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inGeometry } from '../js/place-geo.js';

const read = f => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const data = read('religions.json');
const shapes = read('religions-polities.json').polities;
const USA = 'United States of America';
// Saigon (Ho Chi Minh-staden), Pleiku och Huế ligger i rutan; Washington ska vara kvar i USA
const VIETNAM = { Saigon: [106.7, 10.8], Pleiku: [108.0, 14.0], 'Huế': [107.6, 16.5] };

test('ingen religion över södra Vietnam 1967–2005 räknar upp USA', () => {
  const fel = [];
  for (const r of data.religions) {
    for (const s of r.snapshots) {
      if (s.end < 1967 || s.start > 2005 || !(s.polities || []).includes(USA)) continue;
      for (const [ort, [lon, lat]] of Object.entries(VIETNAM)) {
        if (inGeometry(s.geometry, lon, lat)) fel.push(`${ort} i ${r.id} ${s.start}–${s.end}`);
      }
    }
  }
  assert.deepEqual(fel, []);
});

test('Saigon är inte kristet 1970–2009 (före rättningen: genom USA)', () => {
  const [lon, lat] = VIETNAM.Saigon;
  const krist = data.religions.find(r => r.id === 'kristendom').snapshots
    .filter(s => s.start >= 1970 && s.end <= 2009 && inGeometry(s.geometry, lon, lat));
  assert.deepEqual(krist.map(s => `${s.start}–${s.end}`), []);
});

test('USA:s gräns i klickrutans fil når inte södra Vietnam, men USA finns kvar', () => {
  const periods = shapes[USA] || [];
  assert.ok(periods.some(p => p.start <= 1980 && 1980 <= p.end && inGeometry(p.geometry, -77.0, 38.9)),
    'USA 1980 täcker inte Washington');
  for (const p of periods.filter(q => q.start <= 2005 && q.end >= 1967)) {
    for (const [ort, [lon, lat]] of Object.entries(VIETNAM)) {
      assert.ok(!inGeometry(p.geometry, lon, lat), `USA ${p.start}–${p.end} täcker ${ort}`);
    }
  }
});
