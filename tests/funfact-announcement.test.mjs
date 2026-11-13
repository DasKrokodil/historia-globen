import test from 'node:test';
import assert from 'node:assert/strict';

test('intervallet avbryter en väntande kortuppläsning och kortet kan tala igen efteråt (#977)', async () => {
  const previousMatch = globalThis.matchMedia, previousFrame = globalThis.requestAnimationFrame;
  const frames = [];
  globalThis.matchMedia = () => ({ matches: false });
  globalThis.requestAnimationFrame = callback => frames.push(callback);
  try {
    const { FunFacts } = await import('../js/ui/funfact.js');
    const { bindStatus, resetStatus } = await import('../js/ui/status.js');
    resetStatus();
    const card = Object.assign(Object.create(FunFacts.prototype), {
      announcementsEnabled: true, index: 0, _announcedKey: '',
      kind: { textContent: 'Kort' }, text: { textContent: 'Text' },
    });
    card.status = { textContent: '' };
    bindStatus(card.status); // statusraden har en enda väg in (js/ui/status.js, #1419)
    card._announce({ id: 'test' });
    assert.equal(frames.length, 1);
    card.setAnnouncements(false);
    frames.shift()();
    assert.equal(card.status.textContent, '', 'den gamla bildrutan får inte tala över intervallet');
    card._announce({ id: 'test' });
    assert.equal(frames.length, 0, 'nya kort är tysta under intervallet');
    card.setAnnouncements(true);
    card._announce({ id: 'test' });
    frames.shift()();
    assert.equal(card.status.textContent, 'Kort. Text', 'kortet kan tala igen när intervallet avslutas');
    card._announce({ id: 'test' });
    assert.equal(frames.length, 0, 'samma kort upprepas inte');
  } finally {
    globalThis.matchMedia = previousMatch;
    globalThis.requestAnimationFrame = previousFrame;
  }
});
