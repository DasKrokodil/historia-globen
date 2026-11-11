// Adressformatet (#501, #64): js/url-state.js. Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeHash, decodeHash, isNewStep } from '../js/url-state.js';
import { MIN_YEAR, MAX_YEAR } from '../js/state.js';

const base = { v: 1, year: 1325, camera: { lat: 34, lon: -50, zoom: 1.6 }, focus: null, layers: ['areas', 'events'], filters: ['krig', 'kultur'], calm: false };

test('en hash går fram och tillbaka', () => {
  const hash = encodeHash({ ...base, focus: 'war:hundraarskriget' });
  assert.equal(hash, '#y=1325&c=34,-50,1.6&f=war:hundraarskriget&l=areas,events&k=krig,kultur');
  const s = decodeHash(hash);
  assert.equal(s.year, 1325);
  assert.deepEqual(s.camera, { lat: 34, lon: -50, zoom: 1.6 });
  assert.equal(s.focus, 'war:hundraarskriget');
  assert.deepEqual(s.layers, ['areas', 'events']);
  assert.deepEqual(s.filters, ['krig', 'kultur']);
});

test('alla kategorier skrivs inte ut, och saknade fält behåller sidans val', () => {
  const hash = encodeHash(base, ['krig', 'kultur']);
  assert.ok(!hash.includes('k='));
  const s = decodeHash('#y=-499');
  assert.equal(s.year, -499);
  assert.equal(s.layers, null);
  assert.equal(s.filters, null);
  assert.equal(s.camera, null);
  assert.equal(s.focus, null);
});

test('l= utan lager betyder inga lager, och decimalår för korta krig behålls', () => {
  const s = decodeHash('#y=1879.0548&l=');
  assert.deepEqual(s.layers, []);
  assert.equal(s.year, 1879.0548);
});

test('trasiga länkar ger null eller hoppar över det trasiga fältet, utan att kasta', () => {
  for (const bad of ['', '#', '#y=', '#y=abc', '#foo=1', null, undefined]) assert.equal(decodeHash(bad), null, String(bad));
  const s = decodeHash('#y=1000&f=okänd:x&l=events,<script>&c=1,2');
  assert.equal(s.year, 1000);
  assert.equal(s.focus, null);
  assert.equal(s.focusError, true);
  assert.deepEqual(s.layers, ['events']);
  assert.equal(s.camera, null);
});

test('kameran hålls inom jordens gränser', () => {
  const s = decodeHash('#y=1&c=120,190,9');
  assert.deepEqual(s.camera, { lat: 90, lon: -170, zoom: 3.2 });
});

test('Lugn rörelse står aldrig i länken', () => {
  assert.ok(!encodeHash({ ...base, calm: true }).includes('calm'));
  assert.equal(decodeHash('#y=1&calm=1').calm, false);
});

test('en förinställd vy med urval följer med i delningslänken (#868)', () => {
  const hash = encodeHash({ ...base, layers: ['events'], tag: 'oversikt' }, ['krig', 'kultur']);
  assert.match(hash, /&l=events&g=oversikt$/);
  const state = decodeHash(hash);
  assert.deepEqual(state.layers, ['events']);
  assert.equal(state.tag, 'oversikt');
  assert.equal(decodeHash('#y=1325&g=OVERSIKT').tag, null, 'ogiltigt urval hoppas över');
});

test('ny post i historiken bara vid större steg', () => {
  assert.equal(isNewStep(null, base), false);
  assert.equal(isNewStep(base, { ...base, camera: { lat: 0, lon: 0, zoom: 1 } }), false);
  assert.equal(isNewStep(base, { ...base, year: 1325.4 }), false);
  assert.equal(isNewStep(base, { ...base, year: 1400 }), true);
  assert.equal(isNewStep(base, { ...base, year: 1400 }, { playing: true }), false);
  assert.equal(isNewStep(base, { ...base, focus: 'empire:rom' }), true);
  assert.equal(isNewStep(base, { ...base, layers: ['events'] }), true);
  assert.equal(isNewStep(base, { ...base, tag: 'oversikt' }), true);
  assert.equal(isNewStep(base, { ...base, filters: ['krig'] }), true);
});

test('en guidad tur i adressen: t och s skrivs och läses (#736)', async () => {
  const { decodeTour } = await import('../js/url-state.js');
  const hash = encodeHash(base, ['krig', 'kultur'], { id: 'tre-platser-1325', step: 'tanger' });
  assert.equal(hash, '#y=1325&c=34,-50,1.6&l=areas,events&t=tre-platser-1325&s=tanger');
  assert.deepEqual(decodeTour(hash), { id: 'tre-platser-1325', step: 'tanger' });
  // Bara t räcker för en länk till turen; då börjar den vid första steget
  assert.deepEqual(decodeTour('#t=vikingatiden-och-varlden'), { id: 'vikingatiden-och-varlden', step: null });
  // Den äldre formen ?tur=<id> fungerar, men t i hashen går före
  assert.deepEqual(decodeTour('', '?tur=andra-varldskriget'), { id: 'andra-varldskriget', step: null });
  assert.deepEqual(decodeTour('#t=a&s=b', '?tur=c'), { id: 'a', step: 'b' });
  // Fel tecken räknas som saknade, och utan tur skrivs inget t
  assert.equal(decodeTour('#t=<script>'), null);
  assert.deepEqual(decodeTour('#t=a&s=B!'), { id: 'a', step: null });
  assert.equal(decodeTour('#y=1325'), null);
  assert.ok(!encodeHash(base, [], null).includes('t='));
  // En hash med tur går fortfarande att läsa som vy
  assert.equal(decodeHash(hash).year, 1325);
});

test('ett elevuppdrag i adressen: u skrivs och läses (#741)', async () => {
  const { decodeMission } = await import('../js/url-state.js');
  const hash = encodeHash(base, ['krig', 'kultur'], null, 'samtidighetsjakten-1500');
  assert.ok(hash.endsWith('&u=samtidighetsjakten-1500'));
  assert.equal(decodeMission(hash), 'samtidighetsjakten-1500');
  assert.equal(decodeMission('#y=1500'), null);
  assert.equal(decodeMission('#u=Fel!'), null);
});

test('lärarens väg: r=lararen läses men skrivs aldrig i adressen (#885)', async () => {
  const { decodeRole, decodeMode } = await import('../js/url-state.js');
  const tour = { id: 'andra-varldskriget', step: null };
  assert.equal(decodeRole('#t=andra-varldskriget&m=lektion&r=lararen'), 'lararen');
  assert.equal(decodeMode('#t=andra-varldskriget&m=lektion&r=lararen'), 'lektion');
  for (const bad of ['#t=x&m=lektion', '#r=larare', '#r=Lararen', '#r=', '', null, undefined]) assert.equal(decodeRole(bad), null, String(bad));
  // Adressen som skrivs har ingen roll, så att Dela och en omladdning aldrig ger eleven utskriftsknappen
  assert.ok(!encodeHash(base, [], tour, null, 'lektion').includes('r='));
});

test('lärarlänken är lektionslänken plus r=lararen, och elevlänken har ingen roll (#930)', async () => {
  globalThis.location = { origin: 'https://exempel.se', pathname: '/' };
  const { tourLink, teacherLink } = await import('../js/ui/print-sheet.js');
  const { decodeRole, decodeMode, decodeTour } = await import('../js/url-state.js');
  const tour = { id: 'andra-varldskriget' };
  assert.equal(tourLink(tour), 'https://exempel.se/#t=andra-varldskriget&m=lektion');
  assert.equal(teacherLink(tour), 'https://exempel.se/#t=andra-varldskriget&m=lektion&r=lararen');
  const hash = '#' + teacherLink(tour).split('#')[1];
  assert.equal(decodeRole(hash), 'lararen');
  assert.equal(decodeMode(hash), 'lektion');
  assert.equal(decodeTour(hash).id, 'andra-varldskriget');
  assert.equal(decodeRole('#' + tourLink(tour).split('#')[1]), null);
  delete globalThis.location;
});

test('lektionsläget i adressen: m=lektion hör till en tur (#795)', async () => {
  const { decodeMode, decodeTour } = await import('../js/url-state.js');
  const tour = { id: 'andra-varldskriget', step: 'polen' };
  const hash = encodeHash(base, ['krig', 'kultur'], tour, null, 'lektion');
  assert.equal(hash, '#y=1325&c=34,-50,1.6&l=areas,events&t=andra-varldskriget&s=polen&m=lektion');
  assert.equal(decodeMode(hash), 'lektion');
  assert.deepEqual(decodeTour(hash), tour);
  // Utan tur skrivs inget m, så att läget aldrig står ensamt i en adress (inga tomma lägen)
  assert.ok(!encodeHash(base, [], null, null, 'lektion').includes('m='));
  // Okända lägen och fel tecken räknas som saknade
  for (const bad of ['#y=1&m=annat', '#m=Lektion', '#m=', '#y=1325', '', null, undefined]) assert.equal(decodeMode(bad), null, String(bad));
  // Lektionen och elevuppdraget kan stå tillsammans
  assert.ok(encodeHash(base, [], tour, 'samtidighetsjakten-1500', 'lektion').endsWith('&u=samtidighetsjakten-1500&m=lektion'));
  // Hashen går fortfarande att läsa som vy
  assert.equal(decodeHash(hash).year, 1325);
});

// Epoken (#980) följer med intervallet som p=, men bara tillsammans med y2
test('epoken står som p= bredvid y2, och p= utan y2 eller med fel tecken tas bort', () => {
  const hash = encodeHash({ ...base, year: -2999, yearEnd: -1699, period: 'nordisk-stenalder' });
  assert.match(hash, /y2=-1699&p=nordisk-stenalder/);
  assert.equal(decodeHash(hash).period, 'nordisk-stenalder');
  assert.equal(decodeHash('#y=1325&p=nordisk-stenalder').period, undefined, 'p= utan y2 hör inte till något intervall');
  assert.equal(decodeHash('#y=1325&y2=1418&p=BAD ID').period, undefined);
  assert.equal(encodeHash({ ...base, period: 'x' }).includes('p='), false);
});

// Tidsintervallet (#755): y2 är slutåret
test('ett tidsintervall står som y och y2, och en länk utan y2 är ett år som förut', () => {
  const hash = encodeHash({ ...base, yearEnd: 1418 });
  assert.equal(hash, '#y=1325&y2=1418&c=34,-50,1.6&l=areas,events&k=krig,kultur');
  assert.equal(decodeHash(hash).yearEnd, 1418);
  assert.equal(decodeHash('#y=-499&y2=-399').yearEnd, -399, 'före vår tideräkning');
  assert.equal(decodeHash('#y=1325').yearEnd, undefined, 'utan y2 är det ett år');
  assert.equal(encodeHash(base).includes('y2='), false);
  // Ett slutår som inte ligger efter året, eller inte är ett tal, tas bort; året gäller ändå
  for (const bad of ['#y=1918&y2=1914', '#y=1914&y2=1914', '#y=1914&y2=abc', '#y=1914&y2=']) {
    const s = decodeHash(bad);
    assert.equal(s.year, Number(new URLSearchParams(bad.slice(1)).get('y')), bad);
    assert.equal(s.yearEnd, undefined, bad);
  }
});

test('år i länkar klipps till tidslinjen innan intervallet kontrolleras (#976)', () => {
  for (const [hash, year, yearEnd] of [
    ['#y=-20000&y2=3000', MIN_YEAR, MAX_YEAR],
    [`#y=${MIN_YEAR - 10}&y2=1500`, MIN_YEAR, 1500],
    [`#y=1500&y2=${MAX_YEAR + 10}`, 1500, MAX_YEAR],
    [`#y=${MIN_YEAR - 10}&y2=${MIN_YEAR - 1}`, MIN_YEAR, undefined],
    [`#y=${MAX_YEAR + 1}&y2=${MAX_YEAR + 10}`, MAX_YEAR, undefined],
    [`#y=${MIN_YEAR}&y2=${MAX_YEAR}`, MIN_YEAR, MAX_YEAR],
    ['#y=-20000', MIN_YEAR, undefined],
    [`#y=${MAX_YEAR + 10}`, MAX_YEAR, undefined],
  ]) {
    const s = decodeHash(hash);
    assert.equal(s.year, year, hash);
    assert.equal(s.yearEnd, yearEnd, hash);
    assert.equal(decodeHash(encodeHash(s)).year, year, 'länken behåller det klippta året');
    assert.equal(decodeHash(encodeHash(s)).yearEnd, yearEnd, 'länken behåller det klippta slutåret');
  }
});

test('att välja eller stänga ett intervall är en egen post i historiken', () => {
  assert.equal(isNewStep(base, { ...base, yearEnd: 1418 }), true);
  assert.equal(isNewStep({ ...base, yearEnd: 1418 }, base), true);
  assert.equal(isNewStep({ ...base, yearEnd: 1418 }, { ...base, yearEnd: 1418 }), false);
  assert.equal(isNewStep({ ...base, yearEnd: 1418 }, { ...base, yearEnd: 1420 }), true);
});
