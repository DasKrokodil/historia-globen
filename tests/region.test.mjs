// Världsindelningen region() (#630): geografin går före politiken (docs/beslut/2026-11-06-varldsdelar-geografi-630.md).
// Kontrollerar platserna i byggordern och att js/model.js och tools/tackningsrapport.py ger samma svar.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { region } from '../js/model.js';

// [namn, lat, lon, världsdel]
const PLACES = [
  ['Guam (Hagåtña)', 13.47, 144.75, 'Oceanien'],
  ['Saipan', 15.18, 145.75, 'Oceanien'],
  ['Nan Madol, Pohnpei', 6.84, 158.33, 'Oceanien'],
  ['Palau', 7.5, 134.6, 'Oceanien'],
  ['Rapa Nui', -27.11, -109.36, 'Oceanien'],
  ['Honolulu', 21.31, -157.86, 'Oceanien'],
  ['Tahiti', -17.65, -149.43, 'Oceanien'],
  ['Tokyo', 35.68, 139.69, 'Asien'],
  ['Okinawa', 26.21, 127.68, 'Asien'],
  ['Manila', 14.6, 120.98, 'Asien'],
  ['Mindanao, östkusten', 7.0, 126.5, 'Asien'],
  ['Taipei', 25.03, 121.57, 'Asien'],
  ['Lima', -12.05, -77.04, 'Amerika'],
  ['Galápagos', -0.74, -90.31, 'Amerika'],
  ['Juan Fernández', -33.64, -78.83, 'Amerika'],
];

test('platserna i #630 hamnar i rätt världsdel', () => {
  for (const [name, lat, lon, want] of PLACES) assert.equal(region(lat, lon), want, name);
});

test('js/model.js och tools/tackningsrapport.py delar in lika', () => {
  const points = [];
  for (let lat = -60; lat <= 75; lat += 2.5) for (let lon = -180; lon < 180; lon += 2.5) points.push([lat, lon]);
  const py = `
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('tr', 'tools/tackningsrapport.py')
tr = importlib.util.module_from_spec(spec); spec.loader.exec_module(tr)
print(json.dumps([tr.region(lat, lon) for lat, lon in json.load(sys.stdin)]))`;
  const r = spawnSync('python3', ['-c', py], { input: JSON.stringify(points), encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const pyRegions = JSON.parse(r.stdout);
  const diff = points.filter(([lat, lon], i) => region(lat, lon) !== pyRegions[i]);
  assert.deepEqual(diff, [], 'punkter där JavaScript och Python skiljer sig');
});
