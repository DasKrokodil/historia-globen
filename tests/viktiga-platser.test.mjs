// Platsernas viktiga händelser (#1620): uppspelningen i Fokus på en plats pausar vid händelserna med top eller major
// (#1255, themeStops i js/theme-stops.js). Varje plats ska ha minst en och högst nio sådana, så att pauserna
// berättar platsens historia utan att stanna hela tiden. Två markerade händelser samma år pausar var för sig (#1620,
// kön i js/controllers/playback.js; tests/theme-stops.test.mjs).
// Körs med node --test 'tests/*.test.mjs'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { visibleEvents } from '../js/focus/place.js';
import { themeStops } from '../js/theme-stops.js';

const json = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const events = json('data/events.json').events;
for (const e of events) { [e._lon, e._lat] = e.location?.coordinates ?? []; }
const places = json('data/platser.json').places.filter(p => p.review !== 'draft');
const important = place => themeStops(visibleEvents(place, events)).filter(e => e.top || e.major);

// Undantag från taket nio: Sverige omfattar Skåne, så alla Skånes markerade händelser räknas också i Sverige
// (#1620: 8 i historikerns lista för Sverige + 6 som bara står under Skåne = 14). Urvalet är historikerns; ett lägre
// tak kräver DasKrokodils beslut.
const MAX_OK = { sverige: 14 };

test('platserna finns och har händelser', () => {
  assert.ok(places.length > 0, 'inga platser i data/platser.json');
});

test('varje plats har minst en och högst nio viktiga händelser (top eller major)', () => {
  for (const p of places) {
    const n = important(p).length;
    assert.ok(n >= 1, `${p.id}: inga viktiga händelser, uppspelningen stannar vid alla ${visibleEvents(p, events).length}`);
    const max = MAX_OK[p.id] ?? 9;
    assert.ok(n <= max, `${p.id}: ${n} viktiga händelser, fler än ${max} pauser`);
  }
});

test('Skånes pauser går från Uppåkra till Öresundsbron, med båda 1658 i tur och ordning (#1620)', () => {
  const skane = places.find(p => p.id === 'skane');
  assert.ok(skane, 'Skåne saknas i data/platser.json');
  assert.deepEqual(important(skane).map(e => e.id), ['uppakra', 'lund-grundas', 'skane-under-magnus-eriksson',
    'trohetseden-i-malmo', 'forsvenskningen-av-skane', 'slaget-vid-lund', 'freden-i-lund', 'oresundsbron-oppnas']);
});
