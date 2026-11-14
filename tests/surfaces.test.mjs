import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurfaces } from '../js/surfaces.js';

function setup() {
  const log = [];
  const s = createSurfaces();
  for (const [id, group] of [['panel', 'sidopanel'], ['layers', 'meny'], ['focus', 'meny'], ['jump', 'popover'], ['range', 'popover']]) s.register(id, group, () => log.push(id));
  return { s, log };
}

test('en öppnad meny stänger den andra menyn och sidopanelen, inte sig själv', () => {
  const { s, log } = setup();
  s.opened('layers');
  assert.deepEqual(log.sort(), ['focus', 'panel']); // popoverna rörs inte
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

test('closeAll stänger menyerna, och sidopanelen bara när narrow är sann (#1141)', () => {
  const { s, log } = setup();
  s.closeAll({ narrow: false });
  assert.deepEqual(log.sort(), ['focus', 'layers']);
  log.length = 0;
  s.closeAll({ narrow: true });
  assert.deepEqual(log.sort(), ['focus', 'layers', 'panel']);
  log.length = 0;
  s.closeAll(); // utan argument stängs allt (turen och Hjälp-genvägen)
  assert.deepEqual(log.sort(), ['focus', 'layers', 'panel']);
});

test('en öppnad popover stänger den andra popovern men varken menyer eller sidopanel (#1141)', () => {
  const { s, log } = setup();
  s.opened('range');
  assert.deepEqual(log, ['jump']);
  log.length = 0;
  s.opened('jump');
  assert.deepEqual(log, ['range']);
  log.length = 0;
  s.closeAll();
  assert.ok(!log.includes('jump') && !log.includes('range'));
});

test('okänd yta eller grupp ger ett fel i stället för att tigas ihjäl', () => {
  const { s } = setup();
  assert.throws(() => s.opened('finns-inte'), /Okänd yta/);
  assert.throws(() => s.register('x', 'finns-inte', () => {}), /Okänd ytgrupp/);
});

// Dialoggruppen och Escape (#1323)
function dialogSetup() {
  const log = [], open = new Set();
  const s = createSurfaces();
  const add = (id, group, opts = {}) => s.register(id, group, () => { open.delete(id); log.push(id); }, { isOpen: () => open.has(id), ...opts });
  add('sources', 'dialog'); add('help', 'dialog'); add('jump', 'popover'); add('hunt', 'uppdrag'); add('tours', 'meny', { central: true }); add('layers', 'meny');
  const show = id => { open.add(id); s.opened(id); };
  return { s, log, open, show };
}

test('en öppnad dialog stänger de andra dialogerna men inga andra ytor, och pausar uppspelningen', () => {
  const { s, log, show } = dialogSetup();
  const paused = [];
  s.onDialogOpen = id => paused.push(id);
  show('help');
  show('sources');
  assert.deepEqual(log, ['help']);
  assert.deepEqual(paused, ['help', 'sources']);
  show('jump'); // en popover är ingen dialog: ingen paus
  assert.deepEqual(paused, ['help', 'sources']);
});

test('Escape stänger det senast öppnade i den första gruppen som har något öppet', () => {
  const { s, log, open, show } = dialogSetup();
  show('jump'); show('hunt'); show('sources');
  assert.equal(s.escape(), true);
  assert.deepEqual(log, ['sources'], 'dialogen först');
  assert.equal(s.escape(), true);
  assert.deepEqual(log, ['sources', 'jump'], 'sedan årshoppet');
  assert.equal(s.escape(), true);
  assert.deepEqual(log, ['sources', 'jump', 'hunt'], 'sedan jakten');
  assert.equal(s.escape(), false, 'inget mer öppet');
  assert.equal(open.has('hunt'), false);
});

test('Escape tar bara med menyer som är anmälda som centrala', () => {
  const { s, log, show } = dialogSetup();
  show('layers');
  assert.equal(s.escape(), false, 'Lager har en egen Escape-lyssnare');
  show('tours'); // en öppnad meny stänger de andra menyerna
  assert.deepEqual(log, ['layers']);
  assert.equal(s.escape(), true);
  assert.deepEqual(log, ['layers', 'tours']);
});

test('anyOpen säger om någon yta i gruppen är öppen, och opener får fokus efter Escape', () => {
  const log = [], open = new Set(['x']);
  const s = createSurfaces();
  let focused = 0;
  const opener = { isConnected: true, offsetParent: {}, focus: () => focused++ };
  s.register('x', 'dialog', () => open.delete('x'), { isOpen: () => open.has('x'), opener });
  assert.equal(s.anyOpen('dialog'), true);
  s.escape();
  assert.equal(s.anyOpen('dialog'), false);
  assert.equal(focused, 1);
  assert.deepEqual(log, []);
});

test('en öppnad meny, panel, popover, dialog eller jakt stänger raden om en trasig länk, men raden stänger inget (#1324)', () => {
  for (const [id, group] of [['meny', 'meny'], ['panel', 'sidopanel'], ['popover', 'popover'], ['dialog', 'dialog'], ['jakt', 'uppdrag']]) {
    const log = [];
    const s = createSurfaces();
    s.register('besked', 'besked', () => log.push('besked'));
    s.register(id, group, () => log.push(id));
    s.opened(id);
    assert.ok(log.includes('besked'), `${group} stängde inte beskedet`);
  }
  const log = [];
  const s = createSurfaces();
  for (const [id, group] of [['panel', 'sidopanel'], ['layers', 'meny'], ['jump', 'popover'], ['hjalp', 'dialog'], ['besked', 'besked']]) s.register(id, group, () => log.push(id));
  s.opened('besked');
  assert.deepEqual(log, [], 'beskedet öppnades och stängde en annan yta');
});

test('Escape stänger raden om en trasig länk, efter dialoger, popovers och jakten (#1324)', () => {
  const closed = [];
  const open = { besked: true, dialog: true };
  const s = createSurfaces();
  s.register('besked', 'besked', () => { open.besked = false; closed.push('besked'); }, { isOpen: () => open.besked });
  s.register('hjalp', 'dialog', () => { open.dialog = false; closed.push('hjalp'); }, { isOpen: () => open.dialog });
  assert.equal(s.escape(), true);
  assert.deepEqual(closed, ['hjalp'], 'dialogen först');
  assert.equal(s.escape(), true);
  assert.deepEqual(closed, ['hjalp', 'besked']);
  assert.equal(s.escape(), false);
});
