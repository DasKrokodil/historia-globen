// Tillståndets åtgärder, prenumeration och JSON (#403). Körs med node --test 'tests/*.test.mjs'.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createStore, createState, toJSON, fromJSON, STATE_VERSION, MODES, MODE_RULES, modeRelation, exitRestore } from '../js/state.js';

test('åtgärderna ändrar tillståndet och meddelar prenumeranterna', () => {
  const store = createStore();
  const seen = [];
  const stop = store.subscribe(({ type }) => seen.push(type));
  const war = { id: 'andra-varldskriget' };
  store.setFocus({ type: 'war', id: war.id, from: 1939, to: 1945 }, { war });
  assert.equal(store.state.focusWar, war);
  assert.equal(store.state.focusRoute, null);
  store.setSelected('slaget-vid-stalingrad');
  store.setLayers({ events: true, areas: false });
  store.setFilters(new Set(['krig']));
  store.setCalm(1);
  assert.equal(store.state.calm, true);
  store.setFocus(null, { war });
  assert.equal(store.state.focusWar, null, 'utan fokus finns inget krig att följa');
  stop();
  store.setSelected(null);
  assert.deepEqual(seen, ['focus', 'selected', 'layers', 'filters', 'calm', 'focus']);
});

test('mirror speglar omritningens värden och meddelar bara när året ändras', () => {
  const store = createStore();
  const seen = [];
  store.subscribe(({ type }) => seen.push(type));
  store.mirror({ year: 1325, wholeYear: 1325, window: 38 });
  store.mirror({ year: 1325, window: 40 });
  store.mirror({ year: 1326 });
  assert.equal(store.state.window, 40);
  assert.deepEqual(seen, ['year', 'year']);
});

test('toJSON och fromJSON går fram och tillbaka', () => {
  const store = createStore();
  store.mirror({ year: 1944.4321987 });
  store.setFocus({ type: 'war', id: 'andra-varldskriget' }, { war: {} });
  store.setLayers({ events: true, areas: true, religions: false });
  store.setFilters(new Set(['krig', 'kultur']));
  const json = toJSON(store.state, { lat: 52.123456, lon: 13.4049, zoom: 2.2 });
  assert.deepEqual(json, {
    v: STATE_VERSION, year: 1944.4322, camera: { lat: 52.12, lon: 13.4, zoom: 2.2 },
    focus: 'war:andra-varldskriget', layers: ['areas', 'events'], filters: ['krig', 'kultur'], tag: null, calm: false,
  });
  assert.deepEqual(fromJSON(JSON.stringify(json)), json);
});

test('fromJSON rättar kameran och hoppar över okända fält', () => {
  const doc = fromJSON({ v: STATE_VERSION, year: -2599, camera: { lat: 120, lon: 200, zoom: 9 }, extra: 'x' });
  assert.deepEqual(doc.camera, { lat: 90, lon: -160, zoom: 3.2 });
  assert.equal(fromJSON({ v: STATE_VERSION, year: 0, camera: { lat: 0, lon: -200, zoom: 1 } }).camera.lon, 160);
  assert.equal('extra' in doc, false);
  assert.deepEqual(doc.layers, []);
});

test('fromJSON avvisar felaktigt tillstånd med en förklaring', () => {
  assert.throws(() => fromJSON('[]'), /inte ett objekt/);
  assert.throws(() => fromJSON({ v: 99, year: 1 }), /Okänd version/);
  assert.throws(() => fromJSON({ v: STATE_VERSION, year: '1325' }), /Året/);
  assert.throws(() => fromJSON({ v: STATE_VERSION, year: 1, focus: 'kung:x' }), /Okänt fokus/);
  assert.throws(() => fromJSON({ v: STATE_VERSION, year: 1, layers: ['<script>'] }), /Lagren/);
  assert.throws(() => fromJSON({ v: STATE_VERSION, year: 1, camera: { lat: 'a', lon: 0, zoom: 1 } }), /Kameran/);
});

// Lägeskontraktet (#893): tabellen MODE_RULES, utgångens återställning och biljetterna.
test('lägestabellen är hel och använder bara kända värden', () => {
  const values = new Set(['avslutar', 'stoppas', 'samtidigt', 'villkor']);
  const fields = new Set(['layers', 'focus', 'camera', 'tag']);
  assert.deepEqual(Object.keys(MODE_RULES).sort(), [...MODES].sort());
  for (const mode of MODES) {
    const rule = MODE_RULES[mode];
    assert.deepEqual(Object.keys(rule.when).sort(), MODES.filter(m => m !== mode).sort(), `${mode} har en rad för varje annat läge`);
    for (const v of Object.values(rule.when)) assert.ok(values.has(v), `${mode}: okänt värde ${v}`);
    for (const f of [...rule.restore, ...rule.takes]) assert.ok(fields.has(f), `${mode}: okänt fält ${f}`);
    assert.ok(!rule.restore.includes('year'), 'året står alltid kvar vid en utgång');
  }
});

test('lägestabellen säger det som #755 och #881 kräver', () => {
  assert.equal(modeRelation('intervall', 'fokus'), 'avslutar', 'intervallet avslutar Fokus (#755)');
  assert.equal(modeRelation('fokus', 'intervall'), 'avslutar');
  assert.equal(modeRelation('fokus', 'lektion'), 'stoppas', 'Fokus är låst i lektionen (#795)');
  assert.equal(modeRelation('tur', 'fokus'), 'avslutar');
  assert.ok(!MODE_RULES.lektion.restore.includes('focus'), 'lektionens utgång återställer aldrig fokus (#881)');
  // Två lägen får aldrig avsluta varandra och samtidigt stoppas av varandra
  for (const a of MODES) for (const b of MODES) {
    if (a !== b && modeRelation(a, b) === 'stoppas') assert.notEqual(modeRelation(b, a), 'stoppas', `${a} och ${b} stoppar varandra`);
  }
});

test('en utgång återställer bara ur de lägen som slutar, och det strängaste läget bestämmer', () => {
  const before = { year: 1500, layers: { areas: true }, focus: 'empire:romarriket', camera: { lat: 1, lon: 2, zoom: 1 } };
  const tour = [{ mode: 'tur', snapshot: before }];
  assert.deepEqual(exitRestore(tour, ['tur']), { layers: before.layers, focus: before.focus, camera: before.camera });
  // Lektionen började före turen: utgången återställer lagren och kameran men inte fokus (#881)
  const lesson = [{ mode: 'lektion', snapshot: before }, { mode: 'tur', snapshot: { ...before, focus: null } }];
  assert.deepEqual(exitRestore(lesson, ['tur', 'lektion']), { layers: before.layers, camera: before.camera });
  // Lektionen började under turen (samma tur blev lektion): fortfarande inget fokus
  const later = [{ mode: 'tur', snapshot: before }, { mode: 'lektion', snapshot: before }];
  assert.deepEqual(Object.keys(exitRestore(later, ['tur', 'lektion'])).sort(), ['camera', 'layers']);
  // Fokus avslutar turen: Fokus tar över fokus och kamera, bara lagren blir som innan
  assert.deepEqual(exitRestore(tour, ['tur'], 'fokus'), { layers: before.layers });
  // Ett läge som inte slutar ger ingenting, och inte heller ett annat lägets bild
  assert.deepEqual(exitRestore(tour, ['jakt']), {});
  assert.deepEqual(exitRestore([{ mode: 'jakt', snapshot: null }, ...tour], ['jakt']), {});
});

// #1139: lektionen visar alltid alla händelser i lektionens år. Vyns urval (tag, till exempel Översikt) släpps när lektionen
// börjar, och utgången ("Visa hela globen") återställer det som det var, på samma sätt som lagren.
test('lektionens utgång återställer vyns urval (tag) tillsammans med lagren (#1139)', () => {
  assert.ok(MODE_RULES.lektion.restore.includes('tag'), 'lektionen återställer urvalet');
  assert.ok(MODE_RULES.tur.restore.includes('tag'), 'turen återställer urvalet, annars hindrar den lektionens återställning (det strängaste läget bestämmer)');
  const before = { year: 1939, layers: { areas: true }, focus: null, camera: { lat: 1, lon: 2, zoom: 1 }, tag: 'oversikt' };
  // Lektionen började före sin tur; turens bild är tagen när lektionen redan släppt urvalet (tag: null)
  const lesson = [{ mode: 'lektion', snapshot: before }, { mode: 'tur', snapshot: { ...before, tag: null } }];
  assert.deepEqual(exitRestore(lesson, ['tur', 'lektion']), { layers: before.layers, camera: before.camera, tag: 'oversikt' });
  // En bild utan tag (äldre bild) återställer inget urval, och ett urval som var av (null) återställs som av
  assert.equal('tag' in exitRestore([{ mode: 'lektion', snapshot: { layers: {}, camera: null } }], ['lektion']), false);
  assert.equal(exitRestore([{ mode: 'lektion', snapshot: { ...before, tag: null } }], ['lektion']).tag, null);
  // Ett läge som avslutar lektionen och tar över lagren släpper inte urvalet: tag återställs ändå
  assert.equal(exitRestore(lesson, ['tur', 'lektion'], 'fokus').tag, 'oversikt');
});

test('enter och leave följer tabellen och avslutar lägen genom deras onExit', () => {
  const store = createStore();
  const seen = [], exited = [];
  store.subscribe(({ type }) => seen.push(type));
  store.onExit('fokus', by => { exited.push(['fokus', by]); store.leave(['fokus'], by); });
  store.onExit('tur', by => exited.push(['tur', by])); // lämnar inte själv: storen tar bort läget
  assert.equal(store.mode, 'utforska');
  assert.equal(store.enter('fokus'), true);
  assert.equal(store.enter('jakt'), true, 'jakten pågår samtidigt som Fokus');
  assert.equal(store.enter('tur', { layers: {} }), true);
  assert.deepEqual(exited, [['fokus', 'tur']], 'turen avslutade Fokus');
  assert.deepEqual(store.state.modes.map(x => x.mode), ['jakt', 'tur']);
  assert.equal(store.mode, 'tur');
  // Samma läge igen behåller den första bilden (Bakåt och Framåt i samma tur)
  store.enter('tur', { layers: { other: true } });
  assert.deepEqual(store.state.modes.find(x => x.mode === 'tur').snapshot, { layers: {} });
  store.enter('lektion', { layers: {} });
  assert.equal(store.canEnter('fokus'), false, 'lektionen stoppar Fokus');
  assert.equal(store.enter('fokus'), false);
  assert.equal(store.canEnter('intervall'), false, 'turen och lektionen stoppar intervallet');
  store.leave(['tur', 'lektion']);
  assert.equal(store.enter('fokus'), true);
  assert.equal(store.enter('intervall'), false, 'jakten stoppar intervallet');
  store.leave('jakt');
  assert.equal(store.enter('intervall'), true);
  assert.deepEqual(exited.at(-1), ['fokus', 'intervall'], 'intervallet avslutade Fokus');
  assert.deepEqual(store.state.modes.map(x => x.mode), ['intervall']);
  assert.ok(seen.every(t => t === 'mode') && seen.length > 0);
});

test('en biljett gäller inte efter en nyare begäran eller när ett läge som krockar har börjat', () => {
  const store = createStore();
  // Ett fokus som laddas och en nyare begäran om Fokus (en annan länk) under tiden
  const a = store.ticket('fokus');
  const b = store.ticket('fokus');
  assert.equal(store.current(a), false);
  assert.equal(store.current(b), true);
  // En tur som börjar medan fokuset laddas (#865)
  store.enter('tur');
  assert.equal(store.current(b), false);
  store.leave('tur');
  // En jakt pågår samtidigt som Fokus och tar inte biljetten
  const c = store.ticket('fokus');
  store.enter('jakt');
  assert.equal(store.current(c), true);
  // Avsluta Fokus (eller en adress utan fokus) medan ett fokus laddas
  store.leave(['fokus']);
  assert.equal(store.current(c), false);
});

// Tidsintervallet (#755): ett valfritt slutår i tillståndet
test('tidsintervallet: setRange, toJSON och fromJSON', () => {
  const store = createStore();
  const seen = [];
  store.subscribe(({ type }) => seen.push(type));
  store.setRange({ from: 1918, to: 1914 });
  assert.deepEqual(store.state.range, { from: 1914, to: 1918 }, 'från och till sorteras');
  store.mirror({ year: 1914 });
  const json = toJSON(store.state);
  assert.equal(json.yearEnd, 1918);
  assert.equal(fromJSON(json).yearEnd, 1918);
  store.setRange(null);
  assert.equal(store.state.range, null);
  assert.equal('yearEnd' in toJSON(store.state), false, 'ett år har inget slutår');
  assert.deepEqual(seen.filter(t => t === 'range').length, 2);
  // Äldre tillstånd utan slutår, och ett slutår före året, öppnas som ett år
  assert.equal('yearEnd' in fromJSON({ v: STATE_VERSION, year: 1914 }), false);
  assert.equal('yearEnd' in fromJSON({ v: STATE_VERSION, year: 1914, yearEnd: 1900 }), false);
  assert.equal('yearEnd' in fromJSON({ v: STATE_VERSION, year: 1914, yearEnd: 'x' }), false);
});

test('fromJSON tar emot ett tema som fokus (#398), och avvisar ett okänt', () => {
  assert.equal(fromJSON({ v: STATE_VERSION, year: 1, focus: 'theme:teknik' }).focus, 'theme:teknik');
  assert.equal(fromJSON(toJSON({ ...createState(), year: 1, focus: { type: 'theme', id: 'teknik' } })).focus, 'theme:teknik');
  assert.throws(() => fromJSON({ v: STATE_VERSION, year: 1, focus: 'tema:teknik' }), /Okänt fokus/);
  // Ett tema är fokus och inget eget läge: MODE_RULES har ingen post för det
  assert.equal(Object.hasOwn(MODE_RULES, 'tema'), false);
});
