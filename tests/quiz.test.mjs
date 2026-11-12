// Quizet (#65): reglerna i js/quiz-rules.js. Kör: node --test 'tests/*.test.mjs'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MIN_GAP, MAX_SPAN, MIN_PRECISION, MAX_PAIR_GAP, gapBetween, distance, isSafelyWrong, makeQuestion, nextQuestion, quizFunfacts, shuffle } from '../js/quiz-rules.js';

const json = p => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const visible = r => r === 'source-checked' || r === 'two-sources';
// En förutsägbar slump, så att testet blir detsamma varje gång
const seeded = (seed = 1) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const ev = (id, start, end = start, over = {}) => ({ id, start, end, precision: 9, review: 'source-checked', ...over });

test('avståndet till ett spann', () => {
  assert.equal(distance(1500, ev('x', 1400, 1450)), 50);
  assert.equal(distance(1300, ev('x', 1400, 1450)), 100);
  assert.equal(distance(1420, ev('x', 1400, 1450)), 0);
});

test('reglerna för ett säkert felaktigt svar', () => {
  const a = ev('a', 1500), b = ev('b', 1510, 1520, { partOf: 'kriget' });
  const ff = { id: 'f', events: ['a', 'b'] };
  const ok = (e, msg) => assert.ok(isSafelyWrong(e, a, b, ff, visible), msg);
  const no = (e, msg) => assert.ok(!isSafelyWrong(e, a, b, ff, visible), msg);
  ok(ev('lång-före', 1100), '400 år före är fel');
  ok(ev('precis', 1500 - MIN_GAP), `exakt ${MIN_GAP} år före räcker`);
  no(ev('nära', 1500 - MIN_GAP + 1), 'mindre än 200 år från A');
  no(ev('nära-b', 1520 + MIN_GAP - 1), 'mindre än 200 år från B');
  no(ev('spann', 1000, 1000 + MAX_SPAN + 1), `spann över ${MAX_SPAN} år`);
  no(ev('grov', 1000, 1000, { precision: MIN_PRECISION - 1 }), 'för grov precision');
  no(ev('utkast', 1000, 1000, { review: 'draft' }), 'utkast syns inte');
  no(ev('a', 1000), 'en händelse i samma fun fact');
  no(ev('slag', 1000, 1000, { partOf: 'kriget' }), 'samma krig som B');
  no(ev('kriget', 1000, 1000, { kind: 'war' }), 'kriget som B hör till');
  no(ev('slutet-nära', 1270, 1310), 'starten ligger långt bort men slutet för nära A');
});

test('en fråga har A, rätt svar ur samma fun fact och två säkert felaktiga svar, i blandad ordning', () => {
  const events = [ev('a', 1500), ev('b', 1505), ev('c', 1000), ev('d', 2000), ev('e', 1450)];
  const byId = Object.fromEntries(events.map(e => [e.id, e]));
  const ff = { id: 'f', events: ['a', 'b'], review: 'source-checked' };
  const q = makeQuestion(ff, byId, events, visible, seeded(3));
  assert.ok(q);
  assert.ok(['a', 'b'].includes(q.a.id) && ['a', 'b'].includes(q.answer.id) && q.a.id !== q.answer.id);
  assert.equal(q.options.length, 3);
  assert.ok(q.options.includes(q.answer));
  assert.deepEqual(q.options.filter(o => o !== q.answer).map(o => o.id).sort(), ['c', 'd']);
  // Utan två felaktiga svar hoppas fun facten över
  assert.equal(makeQuestion(ff, byId, events.filter(e => e.id !== 'd'), visible), null);
  // En fun fact med bara en synlig händelse blir ingen fråga
  assert.equal(makeQuestion({ ...ff, events: ['a', 'saknas'] }, byId, events, visible), null);
});

test('en fun fact som jämför avstånd i tid blir ingen fråga om samtidighet', () => {
  const events = [ev('kleopatra', -68, -29), ev('apollo', 1969), ev('pyramid', -2600, -2560), ev('c', 1000), ev('d', 600)];
  const byId = Object.fromEntries(events.map(e => [e.id, e]));
  const ff = { id: 'avstand', events: ['kleopatra', 'apollo', 'pyramid'], review: 'source-checked' };
  assert.equal(makeQuestion(ff, byId, events, visible), null);
  assert.equal(quizFunfacts([ff], byId, visible).length, 0);
  assert.equal(gapBetween(ev('x', 1900, 1910), ev('y', 1950)), 40);
});

test('blandningen behåller alla poster', () => {
  const list = [1, 2, 3, 4, 5];
  assert.deepEqual(shuffle(list, seeded(7)).sort(), list);
  assert.deepEqual(list, [1, 2, 3, 4, 5], 'originalet ändras inte');
});

test('frågorna upprepas inte förrän alla har kommit', () => {
  const events = [ev('a', 1500), ev('b', 1505), ev('c', 1000), ev('d', 2000), ev('x', 800), ev('y', 805), ev('z', 1300)];
  const byId = Object.fromEntries(events.map(e => [e.id, e]));
  const ffs = [{ id: 'f1', events: ['a', 'b'], review: 'source-checked' }, { id: 'f2', events: ['x', 'y'], review: 'source-checked' }];
  const asked = new Set(['f1']);
  for (let i = 1; i < 6; i++) assert.equal(nextQuestion(ffs, byId, events, visible, asked, seeded(i)).funfact.id, 'f2');
});

test('riktig data: varje fun fact som kan bli en fråga ger säkert felaktiga svar', () => {
  const events = json('data/events.json').events, funfacts = json('data/funfacts.json').funfacts;
  const byId = Object.fromEntries(events.map(e => [e.id, e]));
  const pool = quizFunfacts(funfacts, byId, visible);
  assert.ok(pool.length >= 10, `bara ${pool.length} fun facts kan bli frågor`);
  for (const f of pool) {
    for (let seed = 1; seed <= 5; seed++) {
      const q = makeQuestion(f, byId, events, visible, seeded(seed));
      if (!q) continue;
      assert.ok(f.events.includes(q.a.id) && f.events.includes(q.answer.id), f.id);
      assert.ok(gapBetween(q.a, q.answer) <= MAX_PAIR_GAP, `${f.id}: ${q.a.id} och ${q.answer.id} ligger inte samtidigt`);
      for (const o of q.options.filter(o => o !== q.answer)) {
        assert.ok(isSafelyWrong(o, q.a, q.answer, f, visible), `${f.id}: ${o.id} är inte säkert fel`);
        assert.ok(o.precision >= MIN_PRECISION && o.end - o.start <= MAX_SPAN, `${f.id}: ${o.id}`);
        for (const x of [q.a, q.answer]) {
          assert.ok(distance(o.start, x) >= MIN_GAP && distance(o.end, x) >= MIN_GAP, `${f.id}: ${o.id} ligger för nära ${x.id}`);
        }
      }
    }
  }
});

// Sant eller myt? (#846): påståenden ur data/missuppfattningar.json
import { quizMyths, nextMyth, isMythTurn } from '../js/quiz-rules.js';

test('Sant eller myt: varannan fråga, med start på den andra', () => {
  assert.deepEqual([0, 1, 2, 3].map(isMythTurn), [false, true, false, true]);
});

test('Sant eller myt: bara synliga poster med påstående och svar, utan upprepning förrän alla har kommit', () => {
  const myths = [
    { id: 'a', claim: { sv: 'A' }, truth: { sv: 'a' }, review: 'source-checked' },
    { id: 'b', claim: { sv: 'B' }, truth: { sv: 'b' }, review: 'two-sources' },
    { id: 'utkast', claim: { sv: 'U' }, truth: { sv: 'u' }, review: 'draft' },
    { id: 'utan-svar', claim: { sv: 'X' }, review: 'source-checked' },
  ];
  assert.deepEqual(quizMyths(myths, visible).map(m => m.id), ['a', 'b']);
  const asked = new Set();
  const first = nextMyth(myths, visible, asked, seeded(3)); asked.add(first.id);
  const second = nextMyth(myths, visible, asked, seeded(3)); asked.add(second.id);
  assert.notEqual(first.id, second.id, 'samma påstående kom två gånger i rad');
  assert.ok(['a', 'b'].includes(nextMyth(myths, visible, asked, seeded(3)).id), 'börjar om när alla har kommit');
  assert.equal(nextMyth([], visible), null);
});

test('Sant eller myt: varje kontrollerad post i datan kan bli en fråga, med källor', () => {
  const doc = json('data/missuppfattningar.json');
  const pool = quizMyths(doc.misconceptions, visible);
  assert.ok(pool.length >= 15, `för få frågor: ${pool.length}`);
  for (const m of pool) assert.ok(m.sources?.length, `${m.id} saknar källor`);
});
