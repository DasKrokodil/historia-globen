// Turformatet (#47): kontrollen i js/tour-format.js och turerna i data/turer/. Körs med node --test 'tests/*.test.mjs'.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { tourProblems, TOUR_VERSION } from '../js/tour-format.js';
import { isVisibleReview } from '../js/model.js';
import { eventRegion } from '../js/uppdrag-rules.js';
import { imageRows } from '../js/layers/images.js';

const read = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const step = (over = {}) => ({ id: 'a', at: 1200, camera: { lat: 0, lon: 0, zoom: 1.4 }, text: { sv: 'Text.' }, layers: ['events'], sources: ['s1'], ...over });
const tour = (over = {}) => ({ version: TOUR_VERSION, id: 'exempel', title: { sv: 'Exempel' }, review: 'source-checked', steps: [step()], ...over });
const known = { events: new Set(['e1']), layers: new Set(['events', 'areas']), sources: new Set(['s1']) };

test('en hel tur har inga problem', () => {
  assert.deepEqual(tourProblems(tour({ steps: [step(), step({ id: 'b', at: 1200.5, open: 'e1' })] }), known), []);
});

test('fel i steg och tur hittas', () => {
  const problems = tourProblems(tour({
    version: 2,
    steps: [step({ camera: { lat: 95, lon: 0, zoom: 1 } }), step({ open: 'okand', layers: ['finns-inte'], sources: [] })],
  }), known);
  const all = problems.join('\n');
  for (const part of ['okänd version', 'kameran ligger utanför', 'id finns redan', 'händelsen okand', 'lagret finns-inte', 'källor saknas']) {
    assert.match(all, new RegExp(part), `saknar ${part}`);
  }
});

test('berättelseläget: kapitel, fråga och krig kontrolleras (#247)', () => {
  const ok = tour({ war: 'e1', steps: [step({ chapter: { sv: 'Början' }, question: { sv: 'Varför?' } })] });
  assert.deepEqual(tourProblems(ok, known), []);
  const bad = tour({ war: 'okant-krig', steps: [step({ chapter: 'Början', question: { en: 'Why?' } })] });
  const all = tourProblems(bad, known).join('\n');
  for (const part of ['kriget okant-krig', 'kapitlet ska vara text', 'frågan ska vara text']) assert.match(all, new RegExp(part), `saknar ${part}`);
});

test('rikens fall: status per steg och riket kontrolleras (#499)', () => {
  const k = { ...known, empires: new Set(['romarriket']) };
  assert.deepEqual(tourProblems(tour({ empire: 'romarriket', steps: [step({ status: 'omtvistat' })] }), k), []);
  const all = tourProblems(tour({ empire: 'atlantis', steps: [step({ status: 'kanske' })] }), k).join('\n');
  for (const part of ['riket atlantis', 'okänd status kanske']) assert.match(all, new RegExp(part), `saknar ${part}`);
});

test('lärarfälten för en lektionstur kontrolleras (#737)', () => {
  const lesson = (over = {}) => ({
    grades: '7-9', minutes: 30,
    curriculum: [{ text: { sv: 'Kopplad till Lgr22.' }, sources: ['s1'] }],
    teacher: { sv: 'Instruktion.' }, exitTicket: { sv: 'Fråga.' }, ...over,
  });
  assert.deepEqual(tourProblems(tour({ lesson: lesson() }), known), []);
  assert.deepEqual(tourProblems(tour({ lesson: lesson({ prerequisites: { sv: 'Inga.' } }) }), known), []);
  const all = tourProblems(tour({ lesson: lesson({
    grades: '10', minutes: 5, curriculum: [{ text: { en: 'x' }, sources: ['okand'] }],
    teacher: undefined, exitTicket: 'Fråga', prerequisites: 'Inga',
  }) }), known).join('\n');
  for (const part of ['okänd årskurs 10', 'minutes ska vara', 'texten saknas', 'källan okand', 'lärarinstruktionen saknas', 'exit ticket saknas', 'förkunskaperna ska vara']) {
    assert.match(all, new RegExp(part), `saknar ${part}`);
  }
  assert.match(tourProblems(tour({ lesson: lesson({ curriculum: [] }) }), known).join(), /läroplanen saknas/);
  assert.match(tourProblems(tour({ lesson: [] }), known).join(), /ska vara ett objekt/);
});

test('Källdetektiven: händelser som ett steg öppnar, med 1–4 frågor (#742)', () => {
  const lesson = sd => ({
    grades: '7-9', minutes: 30, curriculum: [{ text: { sv: 'Kopplad till Lgr22.' }, sources: ['s1'] }],
    teacher: { sv: 'Instruktion.' }, exitTicket: { sv: 'Fråga.' }, sourceDetective: sd,
  });
  const steps = [step(), step({ id: 'b', open: 'e1' })];
  assert.deepEqual(tourProblems(tour({ steps, lesson: lesson([{ event: 'e1', questions: [{ sv: 'Vad säger källorna?' }] }]) }), known), []);
  const k = { ...known, events: new Set(['e1', 'e2']) };
  const all = [
    tourProblems(tour({ steps, lesson: lesson([{ event: 'e2', questions: [{ sv: 'X?' }] }]) }), k),
    tourProblems(tour({ steps, lesson: lesson([{ event: 'okand', questions: [] }]) }), k),
    tourProblems(tour({ steps, lesson: lesson([{ event: 'e1', questions: [{ en: 'X?' }] }]) }), k),
    tourProblems(tour({ steps, lesson: lesson([]) }), k),
  ].flat().join('\n');
  for (const part of ['öppnas inte i något steg', 'händelsen okand finns inte', '1–4 frågor', 'text per språk', '1–2 händelser']) {
    assert.match(all, new RegExp(part), `saknar ${part}`);
  }
});

test('Källdetektivens händelser har en anteckning om källorna (note.kind, #742)', () => {
  const byId = new Map(read('data/events.json').events.map(e => [e.id, e]));
  for (const id of read('data/turer/index.json').tours) {
    for (const d of read(`data/turer/${id}.json`).lesson?.sourceDetective ?? []) {
      assert.ok(byId.get(d.event)?.note?.kind, `${id}: ${d.event} saknar note.kind`);
    }
  }
});

test('lektionsläget (lesson.lock) kontrolleras och får inte ge tomma lägen (#795)', () => {
  const lesson = (lock) => ({
    grades: '7-9', minutes: 30, curriculum: [{ text: { sv: 'Kopplad till Lgr22.' }, sources: ['s1'] }],
    teacher: { sv: 'Instruktion.' }, exitTicket: { sv: 'Fråga.' }, lock,
  });
  const k = { ...known, regionsIn: (a, b) => (a === 1200 && b === 1300 ? 3 : 1) };
  assert.deepEqual(tourProblems(tour({ lesson: lesson({ years: [1200, 1300], layers: ['events'], escape: false }) }), k), []);
  assert.deepEqual(tourProblems(tour({ lesson: lesson({}) }), k), []); // utan lås gör läget bara att menyerna döljs
  const all = tourProblems(tour({ lesson: lesson({ years: [1250, 1300], layers: ['finns-inte'], escape: 'nej' }) }), k).join('\n');
  for (const part of ['utanför years', 'från 1 världsdelar', 'lagret finns-inte', 'escape ska vara']) assert.match(all, new RegExp(part), `saknar ${part}`);
  assert.match(tourProblems(tour({ lesson: lesson({ years: [1300, 1200] }) }), k).join(), /från före till/);
  assert.match(tourProblems(tour({ lesson: lesson({ layers: [] }) }), k).join(), /layers ska vara/);
  assert.match(tourProblems(tour({ lesson: lesson({ years: [1200.5, 1300] }) }), k).join(), /hela år/); // heltal (#795)
  assert.match(tourProblems(tour({ lesson: lesson([]) }), k).join(), /lesson\.lock ska vara ett objekt/);
});

test('en tur utan steg eller med fel typ', () => {
  assert.equal(tourProblems(null).length, 1);
  assert.match(tourProblems(tour({ steps: [] })).join(), /inga steg/);
});

/** Antal världsdelar med synliga händelser som överlappar [från, till] (för lesson.lock.years, #795). */
const allEvents = read('data/events.json').events;
const regionsIn = (from, to) => new Set(allEvents.filter(e => isVisibleReview(e.review) && e.end >= from && e.start <= to).map(eventRegion).filter(Boolean)).size;

test('turerna i data/turer/ följer formatet och pekar på befintliga händelser och källor', () => {
  const index = read('data/turer/index.json');
  const events = new Set(read('data/events.json').events.map(e => e.id));
  const sources = new Set(read('data/sources.json').sources.map(s => s.id));
  const empires = new Set(read('data/empires/index.json').groups.map(g => g.id));
  // Lagrens id: posterna i js/layers/index.js heter som lagren (events, areas, …)
  const list = readFileSync(new URL('../js/layers/index.js', import.meta.url), 'utf8').match(/export const LAYERS = \[([^\]]*)\]/)[1];
  const layers = new Set(list.split(',').map(x => x.trim()).filter(Boolean));
  // Bildlagren ger en post per rad i data/bildlager.json (#1325): radernas id är lager-id, inte "images"
  layers.delete('images');
  for (const row of imageRows(read('data/bildlager.json'))) layers.add(row.id);
  assert.ok(index.tours.length > 0);
  for (const id of index.tours) {
    const t = read(`data/turer/${id}.json`);
    assert.equal(t.id, id, 'filnamnet och id ska vara samma');
    assert.deepEqual(tourProblems(t, { events, sources, layers, empires, regionsIn }), []);
  }
});

test('lektionsturerna har lås, och intervallet har händelser från minst två världsdelar (#795)', () => {
  for (const id of ['andra-varldskriget', 'vikingatiden-och-varlden']) {
    const t = read(`data/turer/${id}.json`);
    const years = t.lesson?.lock?.years;
    assert.ok(Array.isArray(years), `${id} saknar lesson.lock.years`);
    assert.ok(regionsIn(years[0], years[1]) >= 2, `${id}: färre än två världsdelar i intervallet`);
  }
});

test('turen Hur vet vi det här? (#938) har sex steg med kapitel, fråga och text på alla fem språken', () => {
  const t = read('data/turer/hur-vet-vi-det-har.json');
  const langs = ['sv', 'en', 'de', 'es', 'fr'];
  const full = v => langs.every(l => typeof v?.[l] === 'string' && v[l].trim() !== '');
  assert.equal(t.steps.length, 6);
  assert.ok(full(t.title) && full(t.summary), 'titel och sammanfattning på alla språk');
  for (const s of t.steps) {
    assert.ok(full(s.title) && full(s.chapter) && full(s.question) && full(s.text), `${s.id}: titel, kapitel, fråga och text på alla språk`);
    assert.ok(s.open && s.sources.length >= 2, `${s.id}: öppnar en händelse och har minst två källor`);
  }
});

test('turen Det här har du hört (#947) har sex steg med kapitel, fråga, text och källor på alla fem språken', () => {
  const t = read('data/turer/det-har-har-du-hort.json');
  const langs = ['sv', 'en', 'de', 'es', 'fr'];
  const full = v => langs.every(l => typeof v?.[l] === 'string' && v[l].trim() !== '');
  assert.equal(t.steps.length, 6);
  assert.ok(full(t.title) && full(t.summary), 'titel och sammanfattning på alla språk');
  for (const s of t.steps) {
    assert.ok(full(s.title) && full(s.chapter) && full(s.question) && full(s.text), `${s.id}: titel, kapitel, fråga och text på alla språk`);
    assert.ok(s.sources.length >= 1, `${s.id}: minst en källa`);
  }
  // Gymnasiet: artigt tilltal (bokstäver med accent räknas, så att "tué" inte läses som "tu") i tyska, spanska och franska (beslut 2026-11-08), alltså inga du-former
  const informal = { de: /(?<!\p{L})(du|dich|dir|dein\p{L}*)(?!\p{L})/iu, es: /(?<!\p{L})(tú|puedes|sabes|crees)(?!\p{L})/iu, fr: /(?<!\p{L})(tu|toi|ton|ta|tes)(?!\p{L})/iu };
  for (const s of t.steps) for (const [l, re] of Object.entries(informal)) {
    for (const f of ['question', 'text', 'title', 'chapter']) assert.ok(!re.test(s[f][l]), `${s.id}.${f}.${l}: du-form`);
  }
});

test('turen Vad vet vi egentligen? (#948) har sex steg som öppnar händelser, med artigt tilltal i tyska, spanska och franska', () => {
  const t = read('data/turer/vad-vet-vi-egentligen.json');
  const langs = ['sv', 'en', 'de', 'es', 'fr'];
  const full = v => langs.every(l => typeof v?.[l] === 'string' && v[l].trim() !== '');
  assert.equal(t.steps.length, 6);
  assert.ok(full(t.title) && full(t.summary), 'titel och sammanfattning på alla språk');
  const informal = { de: /(?<!\p{L})(du|dich|dir|dein\p{L}*)(?!\p{L})/iu, es: /(?<!\p{L})(tú|puedes|sabes|crees)(?!\p{L})/iu, fr: /(?<!\p{L})(tu|toi|ton|ta|tes)(?!\p{L})/iu };
  for (const s of t.steps) {
    assert.ok(full(s.title) && full(s.chapter) && full(s.question) && full(s.text), `${s.id}: titel, kapitel, fråga och text på alla språk`);
    assert.ok(s.open && s.sources.length >= 1, `${s.id}: öppnar en händelse och har källor`);
    for (const [l, re] of Object.entries(informal)) for (const f of ['question', 'text', 'title', 'chapter']) assert.ok(!re.test(s[f][l]), `${s.id}.${f}.${l}: du-form`);
  }
});
