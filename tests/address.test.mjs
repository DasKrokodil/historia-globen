// #1251: använd adresshanteringen och tidsreglagets verkliga årssetter tillsammans.
// En redan färdig fokusvy får inte klämma året när en vanlig adress tar över.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createAddress } from '../js/controllers/address.js';
import { createState } from '../js/state.js';
import { Timeline } from '../js/timeline.js';

function globalValue(t, name, value) {
  const before = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  t.after(() => {
    if (before) Object.defineProperty(globalThis, name, before);
    else delete globalThis[name];
  });
}

for (const { label, wanted, active = true, keep = false, expected = wanted } of [
  { label: 'efter fokusets slut', wanted: 30 },
  { label: 'före fokusets början', wanted: 5 },
  { label: 'inom fokusets spann', wanted: 15 },
  { label: 'utan aktivt fokus', wanted: 30, active: false },
  { label: 'med samma fokus kvar', wanted: 30, keep: true, expected: 20 },
]) {
  test(`en adress med år ${label} väljer rätt år (#1251)`, async t => {
    // Syntetiskt fokus och årtal, inga historiska uppgifter.
    const state = createState();
    state.year = 20;
    state.layers = { events: true };
    state.filters = new Set(['test']);
    state.focus = active ? { type: 'empire', id: 'test' } : null;
    const timeline = Object.create(Timeline.prototype);
    Object.assign(timeline, {
      _year: 20, focus: active ? { from: 10, to: 20 } : null,
      _render() {}, pause() {},
      dispatchEvent() { state.year = this.year; return true; },
    });
    const location = new URL(`https://example.invalid/#y=20${active ? '&f=empire:test' : ''}`);
    globalValue(t, 'location', location);
    globalValue(t, 'history', {
      replaceState(_state, _title, url) { location.href = new URL(url, location).href; },
    });
    let popstate;
    globalValue(t, 'addEventListener', (name, listener) => { if (name === 'popstate') popstate = listener; });
    t.mock.method(globalThis, 'setInterval', () => 0);
    let ended = 0;
    const app = {
      state, timeline, globe: { view: null },
      data: { events: [{ category: 'test' }], empireGroups: [{ id: 'test' }], byId: {} },
      layers: { on: { events: true }, setTag() {} },
      panel: { setFilters() {} }, store: { ticket() {} },
      refresh() { state.year = timeline.year; },
      startFocus() { assert.fail('samma eller tomt fokus ska inte startas om'); },
      endFocus() { ended++; state.focus = null; timeline.focus = null; },
    };
    await createAddress(app).start();
    assert.equal(typeof popstate, 'function');
    location.hash = `#y=${wanted}${keep ? '&f=empire:test' : ''}`;
    await popstate(new Event('popstate'));
    assert.equal(timeline.year, expected);
    assert.equal(state.year, expected);
    assert.equal(new URLSearchParams(location.hash.slice(1)).get('y'), String(wanted));
    assert.equal(ended, active && !keep ? 1 : 0);
    assert.equal(state.focus?.id ?? null, keep ? 'test' : null);
  });
}
