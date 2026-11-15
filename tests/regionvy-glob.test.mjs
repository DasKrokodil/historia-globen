// Regionvy steg 2 (#1644): globen flyger in för stora platser. Ramningen är ren matematik i js/region-frame.js (globeFrame,
// orthographic, cameraDistance), räknad ur platsens gräns i data/platser.json. Kameran och knappen prövas av webbläsartestet
// (tests/webblasare.mjs, "regionvyn på globen").
// Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { placeBounds } from '../js/place-geo.js';
import { regionSize, regionEligible, globeRegionEligible, globeFrame, orthographic, outerPoints, cameraDistance,
  GLOBE_MIN_DEG, GLOBE_REGION_FOV, REGION_FILL, REGION_MAX_DEG } from '../js/region-frame.js';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const places = JSON.parse(read('data/platser.json')).places;
const place = id => places.find(p => p.id === id);
const close = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg}: ${a} mot ${b}`);
/** Den fria ytan i dator (1280 × 800, kortet till höger) och i mobil (400 × 800, arket nertill). */
const DESKTOP = { x: 0, y: 0, w: 844, h: 640 }, MOBILE = { x: 0, y: 60, w: 400, h: 400 };

test('Aotearoa och Grönland får globflyget; Sverige väntar (beslut 2026-11-15), Skåne och Danmark har Platt vys regionvy', () => {
  for (const id of ['aotearoa', 'gronland']) {
    const b = placeBounds(place(id));
    assert.ok(globeRegionEligible(b), `${id} ska få globflyget: ${regionSize(b).ground.toFixed(1)} grader`);
    assert.ok(!regionEligible(b), `${id} ska inte också få Platt vys regionvy`);
  }
  // Sverige ingår inte i steg 2: platsen ligger under gränsen och behåller Platt vys inramning som i dag
  const se = placeBounds(place('sverige'));
  assert.ok(!globeRegionEligible(se) && !regionEligible(se), `Sverige ska vara oförändrat: ${regionSize(se).ground.toFixed(1)} grader`);
  assert.ok(regionSize(se).ground < GLOBE_MIN_DEG);
  for (const id of ['skane', 'danmark']) {
    const b = placeBounds(place(id));
    assert.ok(regionEligible(b) && !globeRegionEligible(b), `${id} ska ha Platt vys regionvy och inget globflyg`);
    assert.ok(regionSize(b).ground <= REGION_MAX_DEG);
  }
});

test('den ortografiska projektionen: mitten är (0, 0), norr är uppåt och öster åt höger, bortsidan har z < 0', () => {
  const c = orthographic(15, 60, 60, 15);
  close(c.x, 0, 1e-12, 'x i mitten'); close(c.y, 0, 1e-12, 'y i mitten'); close(c.z, 1, 1e-12, 'z i mitten');
  assert.ok(orthographic(15, 61, 60, 15).y > 0, 'norr är uppåt');
  assert.ok(orthographic(16, 60, 60, 15).x > 0, 'öster är åt höger');
  assert.ok(orthographic(-165, -60, 60, 15).z < 0, 'motsatta punkten ligger på baksidan');
  // Över datumgränsen: 179° Ö och 179° V ligger två grader isär, inte 358
  const a = orthographic(179, -40, -40, 180), b = orthographic(-179, -40, -40, 180);
  close(b.x - a.x, 2 * Math.PI / 180 * Math.cos(40 * Math.PI / 180), 1e-4, 'två längdgrader vid 40° S');
});

test('ramen lägger platsen mitt i den fria ytan och låter den fylla 65 % av den i den led som tar slut först', () => {
  for (const id of ['aotearoa', 'gronland']) {
    const p = place(id), b = placeBounds(p);
    for (const free of [DESKTOP, MOBILE]) {
      const f = globeFrame(p.boundary.geometry, b, free);
      assert.ok(f, `${id} saknar ram`);
      assert.equal(f.fov, GLOBE_REGION_FOV);
      const w = f.box.x1 - f.box.x0, h = f.box.y1 - f.box.y0;
      // Den led som tar slut först fylls till REGION_FILL, den andra mindre
      close(Math.max(w / free.w, h / free.h), REGION_FILL, 1e-9, `${id} fyller ${REGION_FILL} av ${JSON.stringify(free)}`);
      close((f.box.x0 + f.box.x1) / 2, free.x + free.w / 2, 1e-9, `${id} i mitten i sidled`);
      close((f.box.y0 + f.box.y1) / 2, free.y + free.h / 2, 1e-9, `${id} i mitten i höjdled`);
      // Gränsens alla punkter (på framsidan) hamnar inne i rutan när de projiceras med samma mitt och skala
      for (const [lon, lat] of outerPoints(p.boundary.geometry)) {
        const q = orthographic(lon, lat, f.lat, f.lon);
        const x = f.cx + q.x * f.pxPerR, y = f.cy - q.y * f.pxPerR;
        assert.ok(q.z > 0 && x >= f.box.x0 - 1e-6 && x <= f.box.x1 + 1e-6 && y >= f.box.y0 - 1e-6 && y <= f.box.y1 + 1e-6,
          `${id}: punkten ${lon},${lat} hamnar utanför rutan`);
      }
    }
  }
});

test('Grönland ligger norr om den vanliga globens gräns mot polen (71,6°), och Aotearoa ramas in över datumgränsen', () => {
  const g = globeFrame(place('gronland').boundary.geometry, placeBounds(place('gronland')), DESKTOP);
  assert.ok(g.lat > 1.25 * 180 / Math.PI, `Grönlands mitt ${g.lat.toFixed(2)}° ska ligga norr om 71,6°, därför höjs gränsen i regionvyn`);
  assert.ok(g.lat < 85, 'och söder om regionvyns gräns på 85°');
  const p = place('aotearoa'), a = globeFrame(p.boundary.geometry, placeBounds(p), DESKTOP);
  // Mitten ligger vid Nya Zeeland (cirka 175° Ö), inte på andra sidan jorden, och Chathamöarna (176,8° V) ryms i rutan
  assert.ok(a.lon > 165 && a.lon <= 180, `Aotearoas mitt ${a.lon}`);
  const w = a.box.x1 - a.box.x0;
  assert.ok(w < DESKTOP.w, `Aotearoa är ${w} px bred, inte hela jorden`);
});

test('kamerans avstånd ger den skala ramen vill ha, också med ett annat synfält', () => {
  for (const fov of [12, 35]) {
    const h = 800, pxPerR = 900, d = cameraDistance(pxPerR, h, fov);
    // Tillbaka: skärmpixlar per klotradie mitt på klotet (samma formel som Globe.pxPerR och globePxPerImg)
    close(h / (2 * (d - 1) * Math.tan(fov / 2 * Math.PI / 180)), pxPerR, 1e-6, `synfältet ${fov}`);
  }
  // Det smala synfältet ställer kameran längre bort: perspektivet nästan försvinner (teleoptik)
  assert.ok(cameraDistance(900, 800, 12) > 2 * cameraDistance(900, 800, 35));
});
