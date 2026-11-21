// Den synliga tidsskalan (#1313): skarvarna mellan segmenten och skalraden ("en tiondel av tidslinjen ≈ N år").
// Alla tal räknas ur segmentens egna fält i SEGMENTS (js/timeline.js); inget tal skrivs för hand i texterna. Från #1958 ligger
// segmenten i två reglage (HUMAN_SCALES): "Före 3000 f.Kr." (två delar) och "3000 f.Kr.–i dag" (fyra delar).
// Körs på svenska (språket är fast vid import).
import test from 'node:test';
import assert from 'node:assert/strict';
import { SEGMENTS, SEAMS, HUMAN_SCALES, segmentAt, yearsPerTenth, scaleText, scaleTextFull, yearToPos, posToYear, MIN_YEAR, MAX_YEAR } from '../js/timeline.js';

test('varje segment har en skala: år per tiondel av tidslinjen, räknat ur segmentets egna fält', () => {
  assert.equal(SEGMENTS.length, 6);
  for (const post of HUMAN_SCALES) for (const s of post.segments) {
    const exact = (s.to - s.from) / (s.b - s.a) / 10;
    const got = yearsPerTenth(s);
    // två gällande siffror: avvikelsen är högst en halv enhet i näst sista siffran
    assert.ok(Math.abs(got - exact) / exact < 0.055, `${s.from}–${s.to}: ${got} mot ${exact}`);
    // och talet går att kontrollera mot reglaget: en tiondel av läget motsvarar ungefär så många år inne i segmentet
    const mid = (s.a + s.b) / 2;
    const measured = posToYear(mid + 0.05, post) - posToYear(mid - 0.05, post);
    assert.ok(Math.abs(measured - got) / got < 0.06 + 2 / got, `${s.from}–${s.to}: mätt ${measured}, skala ${got}`);
  }
});

test('skalan blir tätare ju närmare nutiden: tiondelen rymmer färre år i varje nytt segment', () => {
  const per = SEGMENTS.map(yearsPerTenth);
  for (let i = 1; i < per.length; i++) assert.ok(per[i] < per[i - 1], `segment ${i}: ${per[i]} inte under ${per[i - 1]}`);
});

test('en skarv per gräns mellan två segment i samma reglage, på reglaget där det ena slutar och nästa börjar', () => {
  // Gränsen mellan reglagen är reglagets kant och ingen skarv: sex segment i två reglage ger 1 + 3 skarvar
  assert.equal(SEAMS.length, SEGMENTS.length - HUMAN_SCALES.length);
  assert.deepEqual(SEAMS, HUMAN_SCALES.flatMap(post => post.seams));
  for (const post of HUMAN_SCALES) {
    assert.equal(post.seams.length, post.segments.length - 1);
    post.seams.forEach((seam, i) => {
      assert.equal(seam.before, post.segments[i]);
      assert.equal(seam.after, post.segments[i + 1]);
      assert.equal(seam.at, post.segments[i].b);
      assert.equal(seam.at, post.segments[i + 1].a);
      assert.ok(Math.abs(yearToPos(post.segments[i].to, post) - seam.at) < 1e-9);
    });
    // reglaget fyller hela sin bredd, och dess första och sista del börjar och slutar på dess egna år
    assert.equal(post.segments[0].a, 0);
    assert.equal(post.segments.at(-1).b, 1);
    assert.equal(post.segments[0].from, post.from);
    assert.equal(post.segments.at(-1).to, post.to);
  }
});

test('segmentAt ger segmentet för ett år, och gränsåret hör till det segment som slutar där', () => {
  assert.equal(segmentAt(MIN_YEAR), SEGMENTS[0]);
  assert.equal(segmentAt(MAX_YEAR), SEGMENTS.at(-1));
  for (const s of SEGMENTS.slice(0, -1)) {
    assert.equal(segmentAt(s.to), s);
    assert.equal(segmentAt(s.to + 1), SEGMENTS[SEGMENTS.indexOf(s) + 1]);
  }
});

test('skalraden: samma segment ger "Här är …", ett segmentbyte ger "Ny skala … (förut …)"', () => {
  const here = scaleText(1325);
  assert.match(here, /^Här är en tiondel av tidslinjen ≈ 330 år$/);
  assert.equal(scaleText(1325, segmentAt(1325)), here); // ingen skarv: samma text
  const crossed = scaleText(1325, segmentAt(500));
  assert.match(crossed, /^Ny skala: en tiondel ≈ 330 år \(förut 620\)$/);
  assert.match(scaleText(-50000, segmentAt(-2000)), /≈ 18\s000 år \(förut 1000\)/);
  assert.match(scaleText(-5000, segmentAt(-2000)), /≈ 1400 år \(förut 1000\)/); // över gränsen mellan reglagen
});

test('samma sak i hela meningar för skärmläsare', () => {
  assert.match(scaleTextFull(1325, segmentAt(500)), /Ny skala: en tiondel av tidslinjen är nu cirka 330 år, förut cirka 620 år\./);
});

test('alla fem språken har texterna, med {n} (och {m}, {label}) kvar', async () => {
  const { readFile } = await import('node:fs/promises');
  const need = { 'scale.here': ['{n}'], 'scale.new': ['{n}', '{m}'], 'scale.newFull': ['{n}', '{m}'], 'scale.seg': ['{label}', '{n}'], 'tlegend.seam': [] };
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    const ui = JSON.parse(await readFile(new URL(`../data/ui/${lang}.json`, import.meta.url), 'utf8'));
    for (const [key, vars] of Object.entries(need)) {
      assert.equal(typeof ui[key], 'string', `${lang}: ${key} saknas`);
      for (const v of vars) assert.ok(ui[key].includes(v), `${lang}: ${key} saknar ${v}`);
    }
  }
});
