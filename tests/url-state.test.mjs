// Adressformatet (#501, #64): js/url-state.js. Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeHash, decodeHash, decodeProblems, decodeTour, decodeMode, decodeMission, decodeRole, isNewStep, RESERVED_HASH_FIELDS } from '../js/url-state.js';
import { noticeText, noticeKey, cleanName, NAME_MAX } from '../js/controllers/link-notice.js';
import { MIN_YEAR, MAX_YEAR, RESERVED_STATE_KEYS, toJSON, fromJSON } from '../js/state.js';
import { readFileSync } from 'node:fs';

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
  assert.deepEqual(s.problems, [{ kind: 'focus', why: 'missing', value: 'okänd:x' }]);
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
    ['#y=-200000&y2=3000', MIN_YEAR, MAX_YEAR],
    [`#y=${MIN_YEAR - 10}&y2=1500`, MIN_YEAR, 1500],
    [`#y=1500&y2=${MAX_YEAR + 10}`, 1500, MAX_YEAR],
    [`#y=${MIN_YEAR - 10}&y2=${MIN_YEAR - 1}`, MIN_YEAR, undefined],
    [`#y=${MAX_YEAR + 1}&y2=${MAX_YEAR + 10}`, MAX_YEAR, undefined],
    [`#y=${MIN_YEAR}&y2=${MAX_YEAR}`, MIN_YEAR, MAX_YEAR],
    ['#y=-200000', MIN_YEAR, undefined],
    ['#y=-20000', -20000, undefined], // förhistorien hamnar rätt i stället för att klämmas (#1088)
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

// Länkarkivet (#1326): länkar som de släppta versionerna har skrivit ska betyda samma sak i dag.
// tests/lankarkiv.json har länkarna och facit; se "om" i filen för hur den byggs på.
const archive = JSON.parse(readFileSync(new URL('./lankarkiv.json', import.meta.url), 'utf8'));
const readLink = (hash, search = '') => ({
  state: decodeHash(hash), tour: decodeTour(hash, search), mode: decodeMode(hash),
  mission: decodeMission(hash), role: decodeRole(hash),
});

test('äldre delade länkar öppnas på samma sätt som när de skrevs (#1326)', () => {
  assert.ok(archive.links.length >= 15, 'länkarkivet är tomt eller nästan tomt');
  for (const link of archive.links) {
    assert.ok(link.expected, `${link.what}: facit saknas`);
    assert.deepEqual(readLink(link.hash, link.search ?? ''), link.expected, `${link.versions.join(', ')}: ${link.what} (${link.hash || link.search})`);
  }
});

test('länkarkivet täcker varje släppt version, varje adressdel och varje fokustyp (#1326)', () => {
  const versions = new Set(archive.links.flatMap(l => l.versions));
  for (const v of ['v5.0.0', 'v6.0.0', 'v6.1.0', 'v6.2.0']) assert.ok(versions.has(v), `ingen länk från ${v}`);
  const keys = new Set(archive.links.flatMap(l => [...new URLSearchParams(l.hash.replace(/^#/, '')).keys(), ...new URLSearchParams(l.search ?? '').keys()]));
  // Adressdelarna i kommentaren överst i js/url-state.js, plus p (epok, #980), r (lärarlänken, #885) och ?tur=
  const header = readFileSync(new URL('../js/url-state.js', import.meta.url), 'utf8').match(/^\/\/ {3}([a-z0-9]+) {2,}/gm).map(s => s.trim().split(/\s+/)[1]);
  for (const key of [...header, 'p', 'r', 'tur']) assert.ok(keys.has(key), `ingen länk i arkivet har ${key}=; lägg till en (se "om" i tests/lankarkiv.json)`);
  const focusTypes = new Set(archive.links.map(l => l.expected.state?.focus?.split(':')[0]).filter(Boolean));
  for (const type of ['war', 'empire', 'religion', 'route', 'theme', 'place']) assert.ok(focusTypes.has(type), `ingen länk följer ${type}`);
});

// Reserverade namn för tidsdomänen i version 8 (#397, beslut 2026-11-13): d i adressen, domain i tillståndet
test('d och domain är reserverade: de skrivs inte, och en länk med d öppnas som förut (#397)', () => {
  assert.deepEqual(RESERVED_HASH_FIELDS, { d: 'domain' });
  assert.ok(RESERVED_STATE_KEYS.includes('domain'));
  // Inget fält som skrivs i dag får ha ett reserverat namn
  const full = encodeHash({ ...base, focus: 'war:hundraarskriget', yearEnd: 1400, period: 'medeltiden', tag: 'oversikt' }, [], { id: 'en-tur', step: 'ett-steg' }, 'ett-uppdrag', 'lektion');
  const written = [...new URLSearchParams(full.slice(1)).keys()];
  for (const key of Object.keys(RESERVED_HASH_FIELDS)) assert.ok(!written.includes(key), `${key}= är reserverat (#397)`);
  // En länk med d (till exempel från version 8) öppnas som om d saknades
  assert.deepEqual(decodeHash('#y=1325&d=jorden&l=areas'), decodeHash('#y=1325&l=areas'));
  // Tillståndet skriver inte domain, och läser det som ett okänt fält
  const json = toJSON({ year: 1325, focus: null, layers: { areas: true }, filters: new Set(['krig']), tag: null, calm: false, range: null });
  for (const key of RESERVED_STATE_KEYS) assert.ok(!(key in json), `${key} är reserverat (#397)`);
  assert.ok(!('domain' in fromJSON({ ...json, domain: 'jorden' })));
});

// Felkanalen (#1324): vad i en länk som inte gick att tolka. Länken öppnas som förut; kanalen ändrar inget i tolkningen.
test('felkanalen: ett ogiltigt år, en tur med fel tecken och ett okänt fokus ger varsitt problem, i fast ordning', () => {
  assert.deepEqual(decodeProblems('#y=abc'), [{ kind: 'year', why: 'format', value: 'abc' }]);
  assert.deepEqual(decodeProblems('#t=Finns Inte'), [{ kind: 'tour', why: 'missing', value: 'Finns Inte' }]);
  assert.deepEqual(decodeProblems('', '?tur=Fel!'), [{ kind: 'tour', why: 'missing', value: 'Fel!' }], 'den äldre ?tur= läses också');
  assert.deepEqual(decodeProblems('#y=1500&f=okänd:x'), [{ kind: 'focus', why: 'missing', value: 'okänd:x' }]);
  assert.deepEqual(decodeProblems('#y=1500&f=finns-inte:x'), [{ kind: 'focus', why: 'missing', value: 'finns-inte:x' }], 'okänd typ');
  assert.deepEqual(decodeProblems('#y=1500&f=war'), [{ kind: 'focus', why: 'missing', value: 'war' }], 'saknar id');
  // Sammanblandade parametrar: alla tre samtidigt, i ordningen tur, fokus, år
  assert.deepEqual(decodeProblems('#y=abc&f=x&t=A B').map(p => p.kind), ['tour', 'focus', 'year']);
});

test('felkanalen: en giltig länk, en tom eller en saknad del ger inget problem, och kanalen kastar aldrig', () => {
  for (const ok of ['', '#', '#y=1500', '#y=-499&l=events', '#y=1879.0548', '#y=1500&f=war:hundraarskriget', '#y=1500&f=place:ett_id', '#t=vikingatiden-och-varlden&s=ett-steg',
    '#y=', '#y=%20', '#t=', '#f=', '#y=1500&d=jorden', '#y=1&calm=1', '#foo=1']) assert.deepEqual(decodeProblems(ok), [], ok);
  assert.deepEqual(decodeProblems(null, null), []);
  assert.deepEqual(decodeProblems(undefined), []);
  assert.deepEqual(decodeProblems('#y=%E0%A4%A').map(p => p.kind), ['year'], 'trasig procentkodning kastar inte');
});

test('felkanalen: hashen tolkas som förut, och problems finns bara när något är trasigt', () => {
  const ok = decodeHash('#y=1500&f=war:hundraarskriget');
  assert.ok(!('problems' in ok));
  // Ett okänt fokus tas bort ur tillståndet som förut; felet står i problems
  const bad = decodeHash('#y=1000&f=okänd:x&l=events');
  assert.equal(bad.year, 1000);
  assert.equal(bad.focus, null);
  assert.deepEqual(bad.layers, ['events']);
  assert.deepEqual(bad.problems.map(p => p.kind), ['focus']);
  // Ett ogiltigt år ger fortfarande null (startläget): problemet läses då med decodeProblems
  assert.equal(decodeHash('#y=abc&f=war:hundraarskriget'), null);
  assert.deepEqual(decodeProblems('#y=abc&f=war:hundraarskriget').map(p => p.kind), ['year']);
  // En fokusnyckel som följer formen men saknas i datan är inget formfel: det avgörs i address.js
  assert.deepEqual(decodeProblems('#y=1500&f=war:finns-inte'), []);
  assert.equal(decodeHash('#y=1500&f=war:finns-inte').focus, 'war:finns-inte');
});

test('felkanalen: gamla länkar ur arkivet ger inget problem', () => {
  for (const link of archive.links) assert.deepEqual(decodeProblems(link.hash, link.search ?? ''), [], `${link.versions.join(', ')}: ${link.what}`);
});

test('felkanalen: raden säger vad som saknades, med namnet som text, kapat, och ett problem per slag', () => {
  const say = (key, vars) => `${key}|${vars.name}`;
  assert.equal(noticeText([{ kind: 'tour', why: 'missing', value: 'finns-inte' }], say), 'link.noTour|finns-inte');
  assert.equal(noticeText([{ kind: 'tour', why: 'fetch', value: 'en-tur' }], say), 'link.tourFetch|en-tur');
  assert.equal(noticeText([{ kind: 'focus', why: 'missing', value: 'x' }, { kind: 'year', why: 'format', value: 'abc' }], say), 'link.noFocus|x link.badYear|abc');
  assert.equal(noticeText([{ kind: 'tour', value: 'a' }, { kind: 'tour', value: 'b' }], say), 'link.noTour|a', 'den första av ett slag gäller');
  assert.equal(noticeText([], say), '');
  assert.equal(noticeText(null, say), '');
  assert.equal(noticeKey({ kind: 'year', why: 'format' }), 'link.badYear');
  // Namnet kommer ur adressen: HTML lämnas orört (raden skrivs med textContent), men styrtecken och riktningstecken tas bort och längden kapas
  assert.equal(cleanName('<img src=x onerror=alert(1)>'), '<img src=x onerror=alert(1)>');
  assert.equal(cleanName('a‮b\u0000c\n d'), 'a b c d');
  assert.equal([...cleanName('x'.repeat(500))].length, NAME_MAX);
  assert.ok(cleanName('x'.repeat(500)).endsWith('…'));
  assert.equal(cleanName(null), '');
});

test('felkanalen: varje text finns i alla fem språken, med {name}, och i artigt tilltal', () => {
  const keys = ['link.noTour', 'link.tourFetch', 'link.noFocus', 'link.badYear'];
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    const ui = JSON.parse(readFileSync(new URL(`../data/ui/${lang}.json`, import.meta.url), 'utf8'));
    for (const key of keys) {
      assert.ok(ui[key], `${lang} saknar ${key}`);
      assert.ok(ui[key].includes('{name}'), `${lang}: ${key} saknar {name}`);
    }
    const text = keys.map(k => ui[k]).join(' ');
    if (lang === 'de') assert.ok(!/\b(du|dein|dir)\b/i.test(text), 'de: du-form');
    if (lang === 'es') assert.ok(!/\b(tú|tu|vuelve|inténtalo)\b/i.test(text), 'es: tú-form');
    if (lang === 'fr') assert.ok(!/\b(tu|ton|ta|recharge)\b/i.test(text), 'fr: tu-form');
  }
});
