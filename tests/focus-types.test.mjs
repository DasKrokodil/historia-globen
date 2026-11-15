// Fokustyperna som poster (#1327): registret, kontraktet och en post per typ.
// Posternas load() prövas mot den riktiga datan, så att spannet för varje typ är det som besökaren får.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FOCUS_TYPES, MIN_YEAR, MAX_YEAR } from '../js/state.js';
import { createFocusTypes, focusTypeProblems, SELECTS_BY } from '../js/focus/registry.js';
import { FOCUS_ENTRIES } from '../js/focus/index.js';
import { founding } from '../js/focus/religion.js';
import { selectionSpan, pointCenter, huntImpossible, warnHuntImpossible } from '../js/focus/util.js';
import { placeEvents } from '../js/place-geo.js';
import { isVisibleReview } from '../js/model.js';
import { ui } from '../js/i18n.js';

const json = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url)));
const events = json('data/events.json').events;
const byId = Object.fromEntries(events.map(e => [e.id, e]));
for (const e of events) { [e._lon, e._lat] = e.location.coordinates; }
for (const e of events) if (e.kind === 'war') e._battles = events.filter(b => b.partOf === e.id);
const empireGroups = json('data/empires/index.json').groups;
// Sidan läser den uppdelade filen (data/genererat/), där faktarutan är ersatt av hasFacts (#337)
for (const g of empireGroups) g.hasFacts = !!g.facts;

/** En app som räcker för att skapa posterna och läsa det som inte hämtar filer. */
function fakeApp() {
  const calls = [];
  const note = name => (...args) => { calls.push([name, ...args]); return true; };
  return {
    calls,
    $: () => ({ classList: { add: note('class') } }),
    data: { events, byId, empireGroups, religionsDoc: null },
    registry: { get: () => ({ add: note('areas.add') }) },
    panel: { showStory: note('showStory'), showSelection: note('showSelection') },
    layers: { applyView: note('applyView') },
    store: { setSelected: note('setSelected') },
    surfaces: { closeAll: note('closeAll'), closeGroup: note('closeGroup') },
    narrow: { matches: false },
    showEmpireFacts: note('showEmpireFacts'), showReligionFacts: note('showReligionFacts'), select: note('select'), setReligions: note('setReligions'),
  };
}
const registry = (app = fakeApp()) => createFocusTypes(FOCUS_ENTRIES.map(entry => entry(app)));

test('varje typ i adressens vitlista har exakt en post, och ingen post står utanför listan', () => {
  const types = registry().all().map(p => p.type);
  assert.deepEqual([...types].sort(), [...FOCUS_TYPES].sort());
  assert.equal(new Set(types).size, types.length);
});

test('varje post följer kontraktet', () => {
  for (const post of registry().all()) assert.deepEqual(focusTypeProblems(post), [], post.type);
});

test('urvalet är en händelselista eller en geometri, och tidsspannet är aldrig ett fokus', () => {
  assert.deepEqual(SELECTS_BY, ['events', 'geometry']);
  const by = Object.fromEntries(registry().all().map(p => [p.type, p.selectsBy]));
  assert.deepEqual(by, { theme: 'events', place: 'geometry', war: null, empire: null, religion: null, route: null });
});

test('grupperna i Sök och följ står i samma ordning som förut', () => {
  assert.deepEqual(registry().menu().map(g => g.title), ['Teman', 'Platser', 'Krig', 'Riken', 'Försvunna länder', 'Religioner', 'Resor']);
});

test('det som hämtas först när menyn öppnas visas som laddas, och har inga rader', () => {
  const groups = Object.fromEntries(registry().menu().map(g => [g.title, g]));
  for (const title of ['Teman', 'Platser', 'Religioner', 'Resor']) {
    assert.equal(groups[title].loading, true, title);
    assert.deepEqual(groups[title].items, [], title);
  }
  for (const title of ['Krig', 'Riken', 'Försvunna länder']) {
    assert.ok(!groups[title].loading, title);
    assert.ok(groups[title].items.length > 0, title);
  }
  assert.equal(groups['Försvunna länder'].all, true);
});

test('varje rad i menyn har en nyckel med sin posts typ, ett namn och ett spann', () => {
  const reg = registry();
  for (const post of reg.all()) for (const group of post.menu()) for (const item of group.items) {
    assert.equal(item.key.split(':')[0], post.type, item.key);
    assert.ok(item.label, item.key);
    assert.ok(Number.isFinite(item.from) && Number.isFinite(item.to) && item.from <= item.to, item.key);
  }
});

test('registret vägrar en post som bryter mot kontraktet', () => {
  const ok = { type: 'war', selectsBy: null, load: async () => null, menu: () => [] };
  assert.deepEqual(focusTypeProblems(ok), []);
  assert.match(focusTypeProblems({ ...ok, type: 'art' }).join(' '), /FOCUS_TYPES/); // människoarter får ingen egen typ
  assert.match(focusTypeProblems({ ...ok, selectsBy: 'span' }).join(' '), /selectsBy/); // tidsspannet är läget intervall
  assert.match(focusTypeProblems({ ...ok, load: null }).join(' '), /load/);
  assert.match(focusTypeProblems({ ...ok, selectsBy: 'events' }).join(' '), /empty/);
  assert.match(focusTypeProblems({ ...ok, facts: { has: () => true } }).join(' '), /facts/);
  assert.throws(() => createFocusTypes([ok, ok]), /två gånger/);
  assert.throws(() => createFocusTypes([{ ...ok, type: 'art' }]), /FOCUS_TYPES/);
});

test('registret hittar posten för det man följer', () => {
  const reg = registry();
  assert.equal(reg.get('empire').type, 'empire');
  assert.equal(reg.get('okand'), null);
  assert.equal(reg.of(null), null);
  assert.equal(reg.of({ type: 'place', id: 'x' }).selectsBy, 'geometry');
});

test('startsAtRangeEnd: bara platsen börjar vid ett intervalls slutår, och fältet kontrolleras (#1163)', () => {
  const reg = registry();
  assert.equal(reg.get('place').startsAtRangeEnd, true);
  for (const type of ['war', 'empire', 'religion', 'route', 'theme']) assert.ok(!reg.get(type).startsAtRangeEnd, `${type} börjar som förut`);
  const app = fakeApp(), place = FOCUS_ENTRIES.map(entry => entry(app)).find(p => p.type === 'place');
  assert.deepEqual(focusTypeProblems({ ...place, startsAtRangeEnd: 'ja' }), ['place: startsAtRangeEnd ska vara true eller false.']);
  assert.deepEqual(focusTypeProblems({ ...place, startsAtRangeEnd: false }), []);
});

test('krig: kontrollen för gamla länkar, och ett okänt id börjar inget fokus', async () => {
  const war = registry().get('war');
  const known = events.find(e => e.kind === 'war').id, notWar = events.find(e => e.kind !== 'war').id;
  assert.equal(war.exists(known), true);
  assert.equal(war.exists(notWar), false);
  assert.equal(war.exists('finns-inte'), false);
  assert.equal(await war.load('finns-inte'), null);
  assert.equal(await war.load(notWar), null);
  assert.equal(war.movedKey, 'focus.movedWar');
  assert.deepEqual(war.follows({ id: known }), { war: byId[known] });
});

test('krig: inledningen visas bara när kriget har en berättelse', () => {
  const app = fakeApp(), war = createFocusTypes(FOCUS_ENTRIES.map(entry => entry(app))).get('war');
  const withStory = events.find(e => e.kind === 'war' && e.story), without = events.find(e => e.kind === 'war' && !e.story);
  war.start({ id: withStory.id });
  assert.deepEqual(app.calls.map(c => c[0]), ['setSelected', 'showStory', 'class']);
  assert.deepEqual(app.calls[1].slice(1), [withStory, 'intro']);
  if (without) { app.calls.length = 0; war.start({ id: without.id }); assert.deepEqual(app.calls, []); }
});

test('rike: kontrollen för gamla länkar, faktarutan och knappen Fakta', async () => {
  const app = fakeApp(), empire = createFocusTypes(FOCUS_ENTRIES.map(entry => entry(app))).get('empire');
  const withFacts = empireGroups.find(g => g.hasFacts), without = empireGroups.find(g => !g.hasFacts);
  assert.equal(empire.exists(withFacts.id), true);
  assert.equal(empire.exists('finns-inte'), false);
  assert.equal(await empire.load('finns-inte'), null);
  assert.equal(empire.facts.has({ id: withFacts.id }), true);
  if (without) assert.equal(empire.facts.has({ id: without.id }), false);
  assert.equal(empire.facts.has({ id: 'finns-inte' }), false);
  empire.start({ id: withFacts.id });
  assert.deepEqual(app.calls, [['showEmpireFacts', withFacts.id]]);
  assert.equal(empire.follows, undefined);
});

test('rike: menyns spann är kartdatans, och ett försvunnet land går från bildandet till upplösningen', () => {
  const [riken, forsvunna] = registry().get('empire').menu();
  for (const item of riken.items) {
    const g = empireGroups.find(x => `empire:${x.id}` === item.key);
    assert.ok(!g.vanished, item.key);
    assert.deepEqual([item.from, item.to], [g.from, g.to], item.key);
  }
  for (const item of forsvunna.items) {
    const g = empireGroups.find(x => `empire:${x.id}` === item.key);
    assert.deepEqual([item.from, item.to], [Math.min(g.from, g.vanished.founded), Math.max(g.to, g.vanished.dissolved)], item.key);
  }
  assert.equal(riken.items.length + forsvunna.items.length, empireGroups.length);
});

test('religion: grundhändelserna i tidsordning, och faktarutan först', () => {
  const ids = [...new Set(events.filter(e => e.founding).map(e => e.religion))];
  assert.ok(ids.length > 0);
  for (const id of ids) {
    const list = founding(events, id);
    assert.ok(list.length > 0 && list.every(e => e.founding && e.religion === id));
    assert.deepEqual(list.map(e => e.start), [...list.map(e => e.start)].sort((a, b) => a - b));
  }
  assert.deepEqual(founding(events, 'finns-inte'), []);
  // Faktarutan visades: grundhändelsen väljs inte
  const app = fakeApp(), religion = createFocusTypes(FOCUS_ENTRIES.map(entry => entry(app))).get('religion');
  religion.start({ id: ids[0] });
  assert.deepEqual(app.calls, [['showReligionFacts', ids[0], false]]);
  // Ingen faktaruta: grundhändelsen visas i stället
  app.calls.length = 0; app.showReligionFacts = () => false;
  religion.start({ id: ids[0] });
  assert.deepEqual(app.calls, [['select', founding(events, ids[0])[0].id, false]]);
  assert.equal(religion.facts.has({ id: ids[0] }), false); // religionerna är inte laddade än
});

test('resa: det man följer står i fokusets route', () => {
  const route = registry().get('route');
  const r = { id: 'x' };
  assert.deepEqual(route.follows({ route: r }), { route: r });
  assert.equal(route.facts, undefined);
  assert.equal(route.exists, undefined);
});

test('tema och plats: texterna för ett tomt år, kortet och knappen Fakta', () => {
  const reg = registry();
  assert.deepEqual(reg.get('theme').empty, { year: 'theme.emptyYear', next: 'theme.emptyYearNext' });
  assert.deepEqual(reg.get('place').empty, { year: 'place.emptyYear', next: 'place.emptyYearNext' });
  for (const type of ['theme', 'place']) {
    assert.equal(reg.get(type).facts.has({}), true);
    assert.equal(reg.get(type).exists, undefined);
    assert.equal(reg.get(type).follows, undefined);
  }
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    const texts = json(`data/ui/${lang}.json`);
    for (const type of ['theme', 'place']) for (const key of [...Object.values(reg.get(type).empty), `${type}.unavailable`]) assert.ok(texts[key], `${lang}: ${key}`);
    assert.ok(texts[reg.get('war').movedKey], `${lang}: focus.movedWar`);
  }
});

test('tema: kortet visar urvalets händelser och stänger menyerna', () => {
  const app = fakeApp(), theme = createFocusTypes(FOCUS_ENTRIES.map(entry => entry(app))).get('theme');
  const doc = json('data/teman.json').themes[0];
  const evs = doc.events.map(id => byId[id]).filter(Boolean);
  const f = { type: 'theme', id: doc.id, theme: doc, themeEvents: evs };
  theme.start(f);
  assert.deepEqual(app.calls.map(c => c[0]), ['setSelected', 'showSelection', 'closeAll', 'class']);
  const card = app.calls[1][1];
  assert.equal(card.name, doc.name);
  assert.equal(card.intro, doc.intro);
  assert.equal(card.events, evs);
  assert.equal(card.notes.length, 1);
  assert.equal(card.lead, undefined);
  // Temats vy slås på före urvalet, bara om temat har en
  app.calls.length = 0;
  theme.prepare({ theme: { view: 'standard' } });
  theme.prepare({ theme: {} });
  assert.deepEqual(app.calls, [['applyView', 'standard']]);
});

test('tema: en jakt som inte går att klara inom temat får veta det, och bara då (#893)', () => {
  const doc = json('data/teman.json').themes[0];
  const evs = doc.events.map(id => byId[id]).filter(Boolean);
  const f = { type: 'theme', id: doc.id, theme: doc, themeEvents: evs };
  const run = hunt => {
    const app = fakeApp(); app.hunt = hunt;
    createFocusTypes(FOCUS_ENTRIES.map(entry => entry(app))).get('theme').start(f);
    return hunt;
  };
  const year = evs[0].start;
  // Fler världsdelar än temat har inom uppdragets år: uppdraget går inte att klara
  const impossible = run({ active: true, mission: { year, window: 0, count: 6 }, message: { textContent: '', className: '' } });
  assert.equal(impossible.message.className, 'hunt-message is-no');
  assert.ok(impossible.message.textContent);
  // En världsdel räcker, och temat har en händelse det året: inget sägs
  const possible = run({ active: true, mission: { year, window: 0, count: 1 }, message: { textContent: '', className: '' } });
  assert.equal(possible.message.className, '');
  // Ingen jakt pågår: inget sägs
  const idle = run({ active: false, mission: { year, window: 0, count: 6 }, message: { textContent: '', className: '' } });
  assert.equal(idle.message.className, '');
});

test('plats: en jakt som inte går att klara inom platsen får veta det, med platsens egen text, och bara då (#1439)', () => {
  const doc = json('data/platser.json').places.find(p => p.id === 'gronland');
  const evs = placeEvents(doc, events).filter(e => isVisibleReview(e.review));
  assert.ok(evs.length, 'Grönland har synliga händelser');
  const f = { type: 'place', id: doc.id, place: doc, themeEvents: evs };
  const run = hunt => {
    const app = fakeApp(); app.hunt = hunt;
    createFocusTypes(FOCUS_ENTRIES.map(entry => entry(app))).get('place').start(f);
    return hunt;
  };
  const year = evs[0].start, msg = () => ({ textContent: '', className: '' });
  // En plats ligger i en världsdel: uppdraget med fem världsdelar går inte att klara
  const impossible = run({ active: true, mission: { year, window: 0, count: 5 }, message: msg() });
  assert.equal(impossible.message.className, 'hunt-message is-no');
  assert.ok(impossible.message.textContent);
  // Texten är platsens egen: temats text säger Avsluta temat
  assert.notEqual(impossible.message.textContent, ui('theme.huntImpossible'));
  assert.equal(impossible.message.textContent, ui('place.huntImpossible'));
  // En världsdel räcker och platsen har en händelse det året: inget sägs
  assert.equal(run({ active: true, mission: { year, window: 0, count: 1 }, message: msg() }).message.className, '');
  // Ingen jakt pågår: inget sägs
  assert.equal(run({ active: false, mission: { year, window: 0, count: 5 }, message: msg() }).message.className, '');
  assert.doesNotThrow(() => run(undefined));
});

test('jaktens kontroll är gemensam för tema och plats och räknar världsdelar inom uppdragets år (#1439)', () => {
  const ev = (id, lat, lon, start, end = start) => ({ id, _lat: lat, _lon: lon, start, end });
  // Europa, Asien och Afrika år 1000, men Nordamerika först 1500
  const evs = [ev('a', 48, 2, 1000), ev('b', 35, 105, 990, 1010), ev('c', 0, 20, 1000), ev('d', 40, -100, 1500)];
  const hunt = (count, window = 0, year = 1000) => ({ active: true, mission: { year, window, count } });
  assert.equal(huntImpossible(hunt(3), evs), false);
  assert.equal(huntImpossible(hunt(4), evs), true, 'Nordamerika ligger utanför uppdragets år');
  assert.equal(huntImpossible(hunt(4, 500), evs), false, 'ett vidare fönster når Nordamerika');
  assert.equal(huntImpossible(hunt(1, 0, 1200), evs), true, 'ingen händelse alls det året');
  assert.equal(huntImpossible({ active: false, mission: { year: 1000, window: 0, count: 9 } }, evs), false);
  assert.equal(huntImpossible(null, evs), false);
  const h = { ...hunt(4), message: { textContent: '', className: '' } };
  assert.equal(warnHuntImpossible(h, evs, 'place.huntImpossible'), true);
  assert.equal(h.message.textContent, ui('place.huntImpossible'));
  const ok = { ...hunt(3), message: { textContent: '', className: '' } };
  assert.equal(warnHuntImpossible(ok, evs, 'place.huntImpossible'), false);
  assert.equal(ok.message.textContent, '');
});

test('platsens text om en omöjlig jakt finns på alla fem språken, i du-form (elevtext, #1439)', () => {
  const du = { sv: /\bdu\b/, en: /\bif you\b/, de: /\bBeende\b.*\bwillst\b/, es: /\bTermina\b.*\bquieres\b/, fr: /\bTermine\b.*\bveux\b/ };
  for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
    const texts = json(`data/ui/${lang}.json`);
    assert.ok(texts['place.huntImpossible'], `${lang}: place.huntImpossible`);
    assert.match(texts['place.huntImpossible'], du[lang], `${lang}: du-form`);
    assert.notEqual(texts['place.huntImpossible'], texts['theme.huntImpossible'], `${lang}: egen text för platsen`);
  }
});

test('ett laddat fokus måste stämma med postens deklaration', () => {
  const reg = registry();
  const base = { title: 'T', short: 'T', from: 1, to: 2, center: [0, 0], zoom: 1 };
  const sel = { ...base, themeEvents: [], eventIds: new Set() };
  reg.checkLoaded(reg.get('war'), base);
  reg.checkLoaded(reg.get('theme'), sel);
  reg.checkLoaded(reg.get('place'), sel);
  assert.throws(() => reg.checkLoaded(reg.get('war'), sel), /selectsBy/); // ett krig som ger ett urval skulle bete sig som ett tema
  assert.throws(() => reg.checkLoaded(reg.get('theme'), base), /selectsBy/);
  assert.throws(() => reg.checkLoaded(reg.get('empire'), { ...base, eventIds: new Set() }), /selectsBy/);
  assert.throws(() => reg.checkLoaded(reg.get('war'), { ...base, from: 3 }), /spann/);
  assert.throws(() => reg.checkLoaded(reg.get('war'), { ...base, title: undefined }), /title/);
});

test('plats: kortet har typraden, noten om dagens gräns och platsens emblem', () => {
  const app = fakeApp(), place = createFocusTypes(FOCUS_ENTRIES.map(entry => entry(app))).get('place');
  const doc = json('data/platser.json').places[0];
  const f = { type: 'place', id: doc.id, place: doc, themeEvents: [events[0]] };
  place.start(f);
  assert.deepEqual(app.calls.map(c => c[0]), ['setSelected', 'showSelection', 'closeGroup', 'class']);
  assert.deepEqual(app.calls[2].slice(1), ['meny']);
  const card = app.calls[1][1];
  assert.equal(card.name, doc.name);
  assert.ok(card.lead);
  assert.equal(card.notes.length, 2);
  assert.equal(card.emblems, doc.emblems);
  assert.equal(place.prepare, undefined);
});

test('urvalets spann hålls inom tidslinjen, och titeln får det verkliga slutet', () => {
  assert.deepEqual(selectionSpan([{ start: 100, end: 100 }, { start: 300, end: 450 }]), { from: 100, to: 450, lastEnd: 450 });
  // En händelse före tidslinjens början nås från kortet (#892, #942)
  assert.deepEqual(selectionSpan([{ start: MIN_YEAR - 5000, end: MIN_YEAR - 5000 }, { start: 10, end: 10 }]), { from: MIN_YEAR, to: 10, lastEnd: 10 });
  assert.deepEqual(selectionSpan([{ start: 2000, end: MAX_YEAR + 50 }]), { from: 2000, to: MAX_YEAR, lastEnd: MAX_YEAR + 50 });
  // Ett urval helt före tidslinjen blir en punkt vid dess början, aldrig ett bakvänt spann
  assert.deepEqual(selectionSpan([{ start: MIN_YEAR - 10, end: MIN_YEAR - 5 }]), { from: MIN_YEAR, to: MIN_YEAR, lastEnd: MIN_YEAR - 5 });
});

test('mittpunkten för spridda punkter klarar datumgränsen', () => {
  const [lat, lon] = pointCenter([{ _lat: 0, _lon: 179 }, { _lat: 0, _lon: -179 }]);
  assert.ok(Math.abs(lat) < 1e-9);
  assert.ok(Math.abs(Math.abs(lon) - 180) < 1e-9);
});
