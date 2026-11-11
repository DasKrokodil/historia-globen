// Världsindelningen region() (#630): geografin går före politiken (docs/beslut/2026-11-06-varldsdelar-geografi-630.md).
// Kontrollerar också validerarens Python-regel och elevuppdragets anrop (#1114).
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { region } from '../js/model.js';
import { eventRegion } from '../js/uppdrag-rules.js';

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

// Återanvänd koordinater ur repots data för de namngivna gränsfallen, inte nya geografiska uppgifter.
const events = JSON.parse(readFileSync(new URL('../data/events.json', import.meta.url), 'utf8')).events;
const edgeIds = ['sexdagarskriget', 'hagia-sofia-byggs-532', 'sintashta-stridsvagnar', 'mammutar-wrangel',
  'sovjetunionens-upplosning', 'nortontraditionen', 'ostgronlandsmalet', 'alltinget-grundas'];
const edgePoints = PLACES.map(([, lat, lon]) => [lat, lon]); // bland annat Honolulu/Hawaii
for (const id of edgeIds) {
  const event = events.find(e => e.id === id);
  assert.ok(event?.location?.type === 'Point', `${id}: gränsfallet behöver en punkt`);
  const [lon, lat] = event.location.coordinates;
  edgePoints.push([lat, lon]);
}
// Syntetiska punkter på och strax intill kodens gränser, inte exakta ortskoordinater.
// Bosporen/Istanbul, Ural (Moskva/Jekaterinburg), datumlinjen (Wrangel/Alaska) och övriga jämförelser.
const latitudes = [-90, -36, -10, 22, 30, 31.5, 33.5, 35, 36, 37.5, 41, 44.5, 50, 68, 90];
const longitudes = [-180, -168, -125, -105, -25, -20, -10, -1.5, 11.5, 28.9, 28.97, 32.5, 40, 52, 60, 60.19, 110, 130, 160, 180];
for (const lat of latitudes) for (const lon of longitudes) {
  for (const dy of [-0.0001, 0, 0.0001]) for (const dx of [-0.0001, 0, 0.0001]) {
    if (Math.abs(lat + dy) <= 90 && Math.abs(lon + dx) <= 180) edgePoints.push([lat + dy, lon + dx]);
  }
}
for (const lat of [0, 10, 20, 29, 30, 31, 31.4999]) {
  for (const dx of [-0.0001, 0, 0.0001]) edgePoints.push([lat, 32.5 + (30 - lat) * 0.62 + dx]);
}

// Grönlands östkust öster om -25 hör till Amerika, Island till Europa (#1135). Koordinaterna är händelsernas egna.
test('Östgrönlandsmålet räknas till Amerika och Alltinget till Europa (#1135)', () => {
  for (const [id, want] of [['ostgronlandsmalet', 'Amerika'], ['alltinget-grundas', 'Europa']]) {
    const [lon, lat] = events.find(e => e.id === id).location.coordinates;
    assert.equal(region(lat, lon), want, id);
  }
});

// Ett glest nät fångar också skillnader bortom de uttryckliga gränsfallen.
for (let lat = -60; lat <= 75; lat += 2.5) for (let lon = -180; lon < 180; lon += 2.5) edgePoints.push([lat, lon]);

test('validerarens region_of och region ger samma svar på kodgränser och platser (#1114)', t => {
  // Import av hela validate-site.py skulle köra hela byggets validering och avsluta processen.
  // Kör dess verkliga funktionsdefinition via Pythons AST, utan kopierad regel i testet.
  const py = `
import ast, json, pathlib, sys
path = pathlib.Path('scripts/validate-site.py')
tree = ast.parse(path.read_text(encoding='utf-8'), filename=str(path))
function = next(node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name == 'region_of')
namespace = {}
exec(compile(ast.Module(body=[function], type_ignores=[]), str(path), 'exec'), namespace)
print(json.dumps([namespace['region_of'](lat, lon) for lat, lon in json.load(sys.stdin)]))`;
  const r = spawnSync('python3', ['-c', py], { cwd: new URL('../', import.meta.url), input: JSON.stringify(edgePoints), encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const python = JSON.parse(r.stdout);
  assert.equal(python.length, edgePoints.length);
  for (const [i, [lat, lon]] of edgePoints.entries()) assert.equal(python[i], region(lat, lon), `lat=${lat}, lon=${lon}`);
  t.diagnostic(`${edgePoints.length} punkter jämförda mellan JavaScript och Python`);
});

test('eventRegion använder samma indelning för båda koordinatformerna (#1114)', () => {
  for (const [lat, lon] of edgePoints) {
    const want = region(lat, lon);
    assert.equal(eventRegion({ location: { type: 'Point', coordinates: [lon, lat] } }), want, `Point: ${lat}, ${lon}`);
    assert.equal(eventRegion({ _lat: lat, _lon: lon }), want, `laddad punkt: ${lat}, ${lon}`);
  }
  assert.equal(eventRegion({ location: { type: 'Polygon', coordinates: [] } }), null);
  assert.equal(eventRegion({ _lat: NaN, _lon: 10 }), null);
});
