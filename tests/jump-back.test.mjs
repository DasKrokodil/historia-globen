import test from 'node:test';
import assert from 'node:assert/strict';
import { createJumpBack, JUMP_BACK_MS } from '../js/controllers/jump-back.js';

test('Tillbaka återställer år och kamera, sparar historiken och lämnar synligt fokus (#997)', () => {
  const oldDocument = globalThis.document, oldWindow = globalThis.window;
  const doc = new EventTarget();
  globalThis.document = doc;
  globalThis.window = new EventTarget();
  class Element extends EventTarget {
    hidden = false; textContent = '';
    contains(target) { return target === this || (this === elements['jump-back'] && target === elements['jump-back-button']); }
    focus() { doc.activeElement = this; }
    getClientRects() { return this.hidden ? [] : [{}]; }
  }
  const elements = Object.fromEntries(['jump-back', 'jump-back-text', 'jump-back-button', 'year-jump', 'source'].map(id => [id, new Element()]));
  const timeline = Object.assign(new EventTarget(), { year: 1325, pause() {} });
  const camera = { lat: 12, lon: -50, zoom: 1.4 };
  const globe = { view: { ...camera }, flyTo(lat, lon) { this.view = { ...this.view, lat, lon }; }, setZoom(zoom) { this.view.zoom = zoom; } };
  const history = [], timers = new Map();
  let nextTimer = 0;
  const app = { $: id => elements[id], timeline, globe, refresh() {}, address: { flush: () => history.push({ year: timeline.year, camera: { ...globe.view } }) } };
  try {
    assert.ok(JUMP_BACK_MS >= 15000, 'raden ska ligga kvar minst 15 s (WCAG 2.2.1, #1138)');
    const back = createJumpBack(app, {
      schedule: (fn, ms) => { assert.equal(ms, JUMP_BACK_MS); timers.set(++nextTimer, fn); return nextTimer; },
      cancel: id => timers.delete(id),
    });
    const jump = () => { timeline.year = 1500; globe.view = { lat: 20, lon: 80, zoom: 2 }; timeline.dispatchEvent(new Event('change')); };
    back.run(jump, elements.source);
    assert.equal(elements['jump-back'].hidden, false);
    assert.equal(elements['jump-back-text'].textContent, 'Från 1325');
    assert.equal(history[0].year, 1325);
    assert.equal(history[1].year, 1500);
    elements['jump-back-button'].focus();
    elements['jump-back-button'].dispatchEvent(new Event('click'));
    assert.equal(timeline.year, 1325);
    assert.deepEqual(globe.view, camera);
    assert.deepEqual(history.at(-1), { year: 1325, camera });
    assert.equal(elements['jump-back'].hidden, true);
    assert.equal(doc.activeElement, elements['year-jump']);
    assert.equal(timers.size, 0);
    // När tiden går ut på en fokuserad knapp hamnar fokus på en synlig kontroll.
    back.run(jump, elements.source);
    elements['jump-back-button'].focus();
    elements.source.hidden = true;
    [...timers.values()][0]();
    assert.equal(elements['jump-back'].hidden, true);
    assert.equal(doc.activeElement, elements['year-jump']);
    // En senare årshandling tar bort den gamla återgången.
    back.run(jump, elements.source);
    timeline.year = 1600;
    timeline.dispatchEvent(new Event('change'));
    elements['jump-back-button'].dispatchEvent(new Event('click'));
    assert.equal(timeline.year, 1600);
    assert.equal(elements['jump-back'].hidden, true);
  } finally { globalThis.document = oldDocument; globalThis.window = oldWindow; }
});

test('förhandsvisningen av nästa fun fact förbrukar inte regionbalansen (#997)', async () => {
  const oldMatch = globalThis.matchMedia;
  globalThis.matchMedia = () => ({ matches: false });
  try {
    const { FunFacts } = await import('../js/ui/funfact.js');
    const card = Object.assign(Object.create(FunFacts.prototype), {
      all: [{ id: 'a', events: ['e'], show: [100, 110], review: 'source-checked' }],
      byId: { e: { location: { coordinates: [10, 10] } } }, surpriseCounts: new Map(), surpriseStep: 0, surpriseRecent: [],
      surprise: { dataset: {}, textContent: '', disabled: true },
    });
    card._prepareSurprise();
    assert.equal(card.nextSurprise.fact.id, 'a');
    assert.equal(card.surprise.dataset.year, '100');
    const label = card.surprise.textContent;
    card._prepareSurprise();
    assert.equal(card.surprise.textContent, label);
    assert.equal(card.surpriseCounts.size, 0);
    assert.equal(card.surpriseStep, 0);
    assert.deepEqual(card.surpriseRecent, []);
    card.all = [];
    card._prepareSurprise(true);
    assert.equal(card.surprise.disabled, true);
    assert.equal(card.surprise.dataset.year, undefined);

    card.all = [
      { id: 'outside', events: ['e'], show: [100, 110], review: 'source-checked' },
      { id: 'inside', events: ['e'], show: [200, 210], review: 'source-checked' },
    ];
    card.setSurpriseRange(() => ({ from: 200, to: 250 }));
    assert.equal(card.nextSurprise.fact.id, 'inside');
    assert.equal(card.surprise.dataset.year, '200');
  } finally { globalThis.matchMedia = oldMatch; }
});
