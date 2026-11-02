import assert from 'node:assert/strict';
import test from 'node:test';
import { selectPosterEvents } from '../js/ui/poster.js';

test('affischen väljer högst åtta aktiva händelser med top och major först', () => {
  const events = [
    { id: 'ordinary-first', start: 1900, end: 2000 },
    { id: 'major', start: 1950, end: 1970, major: true },
    { id: 'top', start: 1960, end: 1969, top: true },
    { id: 'before', start: 1900, end: 1968 },
    ...Array.from({ length: 8 }, (_, index) => ({ id: `ordinary-${index}`, start: 1969, end: 1969 })),
  ];
  const selected = selectPosterEvents(1969, events);
  assert.equal(selected.length, 8);
  assert.deepEqual(selected.slice(0, 3).map(event => event.id), ['top', 'major', 'ordinary-first']);
  assert.ok(!selected.some(event => event.id === 'before'));
});
