// Sjöresornas linjer över havet (#2157): Ibn Battutas resa Sonargaon → Samudra Pasai → Zaitun och tillbaka till Basra ritades
// rakt över land (Myanmar, Thailand, Kambodja, Laos och Vietnam, och Oman och Iran på hemvägen). Källan (en.wikipedia "Ibn
// Battuta", öppnad 2026-11-22) säger att han seglade: 40 dagar från Sunur Kawan till Samudra Pasai, med sultanens dschunk till
// Kina, med en dschunk tillbaka och genom Hormuzsundet mot Basra. Provet ritar etappernas storcirklar som js/layers/lines.js
// gör och mäter dem mot kartans land (data/land.json, Natural Earth 1:50m, samma bild som globen visar).
// node --test tests/resor-over-havet.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const RAD = Math.PI / 180;
const KM = 6371;
// Längsta sammanhängande bit över land som en sjöväg får ha, i km: sund, flodmynningar och kustens förenkling (samma gräns som
// geografens mätning före v6.5.0, "land i rad > 40 km")
const MAX_LAND_KM = 40;
// Hamnar en bit upp i en flod (Sonargaon vid Meghna, Basra vid Shatt al-Arab) och hamnar på land i 1:50m: vägen i början och i slutet
// av en sjöväg får gå så här långt över land
const MAX_PORT_KM = 150;
const STEP_KM = 5;

/** Kartans land som ringar i [longitud, latitud], med rutan runt varje ring. */
function landRings() {
  const { path, width, height } = read('data/land.json');
  const rings = [];
  for (const m of path.matchAll(/M([^MZ]*)Z?/g)) {
    const pts = m[1].split('L').map(p => {
      const [x, y] = p.split(',').map(Number);
      return [x / width * 360 - 180, 90 - y / height * 180];
    }).filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]));
    if (pts.length < 3) continue;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    rings.push({ pts, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] });
  }
  return rings;
}
const RINGS = landRings();

/** Om punkten ligger på land (jämnt–udda-regeln över alla ringar, så att sjöar och hål räknas rätt). */
function onLand([lon, lat]) {
  let inside = false;
  for (const { pts, box } of RINGS) {
    if (lon < box[0] || lon > box[2] || lat < box[1] || lat > box[3]) continue;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

const toVec = ([lon, lat]) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];
const toLonLat = ([x, y, z]) => [Math.atan2(y, x) / RAD, Math.atan2(z, Math.hypot(x, y)) / RAD];

/** Punkter längs storcirklarna mellan vägens punkter (som linjelagret ritar dem), ungefär STEP_KM isär. */
function sample(path) {
  const out = [path[0]];
  for (let i = 1; i < path.length; i++) {
    const a = toVec(path[i - 1]), b = toVec(path[i]);
    const d = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
    const n = Math.max(1, Math.ceil(d * KM / STEP_KM));
    for (let j = 1; j <= n; j++) {
      const f = j / n, s = Math.sin(d) || 1, ka = Math.sin((1 - f) * d) / s, kb = Math.sin(f * d) / s;
      out.push(d < 1e-9 ? path[i] : toLonLat([a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb]));
    }
  }
  return out;
}

/** Bitarna över land längs vägen: den i början (lead), den i slutet (tail) och den längsta däremellan (longest), i km. */
function landRuns(path) {
  const pts = sample(path);
  const runs = [];
  let cur = null;
  for (let i = 0; i < pts.length; i++) {
    const land = onLand(pts[i]);
    if (land && !cur) cur = { from: i, km: 0, at: pts[i] };
    if (land && i > 0) {
      const a = toVec(pts[i - 1]), b = toVec(pts[i]);
      cur.km += Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) * KM;
    }
    if (!land && cur) { runs.push({ ...cur, to: i - 1 }); cur = null; }
  }
  if (cur) runs.push({ ...cur, to: pts.length - 1 });
  const lead = runs[0]?.from === 0 ? runs.shift() : null;
  const tail = runs.at(-1)?.to === pts.length - 1 ? runs.pop() : null;
  const max = runs.reduce((m, r) => (r.km > m.km ? r : m), { km: 0, at: null });
  return { longest: max.km, where: max.at, lead: lead?.km ?? 0, tail: tail?.km ?? 0 };
}

/** Sjövägen delas vid punkter på land (hamnar, som Samudra Pasai och Calicut i 1:50m); varje bit får gå högst MAX_PORT_KM över land
 * från och till hamnen och högst MAX_LAND_KM i rad däremellan. */
const route = read('data/routes/ibn-battuta.json').routes.find(r => r.id === 'ibn-battuta');
const same = (a, b) => Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;
const PORTS = route.legs.flatMap(l => l.places.map(p => p.at));
function assertSea(path, label) {
  // Bara resans namngivna platser får ligga på land; en mellanpunkt på land vore ingen hamn utan ett fel i vägen
  for (const p of path.slice(1, -1)) {
    if (onLand(p)) assert.ok(PORTS.some(q => same(q, p)), `${label}: mellanpunkten ${p.join(', ')} ligger på land`);
  }
  const parts = [];
  let cur = [path[0]];
  for (const p of path.slice(1)) {
    cur.push(p);
    if (onLand(p)) { parts.push(cur); cur = [p]; }
  }
  if (cur.length > 1) parts.push(cur);
  for (const part of parts) {
    const r = landRuns(part);
    const at = `${label}, ${part[0].join(', ')} → ${part.at(-1).join(', ')}`;
    assert.ok(r.longest <= MAX_LAND_KM, `${at}: ${Math.round(r.longest)} km över land i rad vid ${r.where?.map(v => v.toFixed(2))}`);
    assert.ok(r.lead <= MAX_PORT_KM && r.tail <= MAX_PORT_KM, `${at}: ${Math.round(r.lead)} km över land i början och ${Math.round(r.tail)} km i slutet`);
  }
}

const placeAt = (leg, sv) => {
  const p = leg.places.find(q => q.name.sv === sv);
  assert.ok(p, `platsen ${sv} saknas i etappen`);
  const i = leg.path.findIndex(q => same(q, p.at));
  assert.ok(i >= 0, `${sv} ligger inte på etappens väg`);
  return i;
};
/** Vägen mellan två platser i etappen. */
const between = (leg, from, to) => leg.path.slice(placeAt(leg, from), placeAt(leg, to) + 1);

test('kartans land fungerar för provet: Bengaliska viken och Malackasundet är hav, Myanmar och Sumatra land', () => {
  assert.equal(onLand([88.0, 15.0]), false, 'Bengaliska viken');
  assert.equal(onLand([100.5, 3.0]), false, 'Malackasundet');
  assert.equal(onLand([113.0, 12.0]), false, 'Sydkinesiska havet');
  assert.equal(onLand([96.0, 20.0]), true, 'Myanmar');
  assert.equal(onLand([101.0, 0.0]), true, 'Sumatra');
  assert.equal(onLand([104.0, 17.0]), true, 'Laos');
});

test('Ibn Battuta seglar från Sonargaon till Samudra Pasai och vidare till Zaitun över havet (#2157)', () => {
  const leg = route.legs.find(l => l.places.some(p => p.name.sv === 'Sylhet') && l.places.some(p => p.name.sv === 'Zaitun (Quanzhou)'));
  assert.ok(leg, 'etappen Sylhet → Zaitun finns');
  // Ordningen i källan: Sylhet, Sonargaon (Sunur Kawan, en.wikipedia "Sonargaon"), Samudra Pasai, Zaitun
  const order = ['Sylhet', 'Sonargaon', 'Samudra Pasai', 'Zaitun (Quanzhou)'].map(n => placeAt(leg, n));
  assert.deepEqual([...order].sort((a, b) => a - b), order, 'platserna står i källans ordning');
  for (const [a, b] of [['Sonargaon', 'Samudra Pasai'], ['Samudra Pasai', 'Zaitun (Quanzhou)']]) {
    assertSea(between(leg, a, b), `${a} → ${b}`);
  }
});

test('Ibn Battuta seglar tillbaka från Zaitun via Samudra Pasai och Calicut till Hormuzsundet och Basra över havet (#2157)', () => {
  const leg = route.legs.find(l => l.places[0]?.name.sv === 'Zaitun (Quanzhou)');
  assert.ok(leg, 'etappen från Zaitun finns');
  const basra = leg.path.findIndex(p => same(p, [47.8, 30.5]));
  assert.ok(basra > 0, 'vägen går till Basra');
  const sea = leg.path.slice(0, basra + 1);
  assertSea(sea, 'Zaitun → Basra');
  // Hormuzsundet (källan): vägen går mellan Musandam och Iran, alltså genom rutan 55,5–57° Ö, 25,8–27° N
  assert.ok(sample(sea).some(([x, y]) => x >= 55.5 && x <= 57 && y >= 25.8 && y <= 27), 'vägen går genom Hormuzsundet');
});
