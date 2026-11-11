import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurfaces } from '../js/surfaces.js';

function setup() {
  const log = [];
  const s = createSurfaces();
  for (const [id, group] of [['panel', 'sidopanel'], ['layers', 'meny'], ['focus', 'meny']]) s.register(id, group, () => log.push(id));
  return { s, log };
}

test('en öppnad meny stänger den andra menyn och sidopanelen, inte sig själv', () => {
  const { s, log } = setup();
  s.opened('layers');
  assert.deepEqual(log.sort(), ['focus', 'panel']);
});

test('en öppnad sidopanel stänger menyerna', () => {
  const { s, log } = setup();
  s.opened('panel');
  assert.deepEqual(log.sort(), ['focus', 'layers']);
});

test('closeGroup stänger gruppen, och except undantar en yta', () => {
  const { s, log } = setup();
  s.closeGroup('meny');
  assert.deepEqual(log.sort(), ['focus', 'layers']);
  log.length = 0;
  s.closeGroup('meny', 'focus');
  assert.deepEqual(log, ['layers']);
});

test('okänd yta eller grupp ger ett fel i stället för att tigas ihjäl', () => {
  const { s } = setup();
  assert.throws(() => s.opened('finns-inte'), /Okänd yta/);
  assert.throws(() => s.register('x', 'finns-inte', () => {}), /Okänd ytgrupp/);
});
