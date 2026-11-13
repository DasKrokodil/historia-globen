// Statusraden för skärmläsare (#1419): en enda väg in, rubriken går före och bara den som skrev sist får tömma raden.
import test from 'node:test';
import assert from 'node:assert/strict';
import { bindStatus, say, clearStatus, resetStatus } from '../js/ui/status.js';

function setup() {
  resetStatus();
  const el = { textContent: '' };
  const frames = [];
  globalThis.requestAnimationFrame = fn => frames.push(fn);
  const flush = () => { while (frames.length) frames.shift()(); };
  bindStatus(el);
  return { el, flush };
}

test('immediate skriver direkt, annars töms raden och texten skrivs i nästa bildruta', () => {
  const { el, flush } = setup();
  say('rubrik', 'faktaruta', { immediate: true });
  assert.equal(el.textContent, 'rubrik');
  say('kort', 'funfact', { priority: 2 }); // samma prioritet
  assert.equal(el.textContent, '');
  flush();
  assert.equal(el.textContent, 'kort');
});

test('faktarutans rubrik skrivs inte över av något med lägre prioritet', () => {
  const { el, flush } = setup();
  say('Faktaruta: Titanic', 'faktaruta', { priority: 2, immediate: true });
  assert.equal(say('Samtidigt-kort', 'funfact'), false);
  assert.equal(say('Pausrad', 'pausnotis'), false);
  flush();
  assert.equal(el.textContent, 'Faktaruta: Titanic');
});

test('bara den som skrev sist får tömma raden', () => {
  const { el } = setup();
  say('Faktaruta: Titanic', 'faktaruta', { priority: 2, immediate: true });
  clearStatus('pausnotis'); // pausraden ritas om utan text: den skrev inte det som står där
  assert.equal(el.textContent, 'Faktaruta: Titanic');
  clearStatus('faktaruta');
  assert.equal(el.textContent, '');
});

test('en köad bildruta från en äldre text skriver inte över en nyare', () => {
  const { el, flush } = setup();
  say('gammal', 'funfact');
  say('ny', 'funfact');
  flush();
  assert.equal(el.textContent, 'ny');
});
