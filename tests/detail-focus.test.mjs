import test from 'node:test';
import assert from 'node:assert/strict';
import { createDetailFocus } from '../js/controllers/detail-focus.js';

// Fokus när faktarutan stängs (#1436). Atrapp av sidan: element med contains, hidden och focus. Bildrutan körs aldrig (later är tom
// tills ett test själv kör den), så fokus måste flyttas i den första mikrotasken. Det var det Firefox missade när fokus väntade på
// requestAnimationFrame och det dolda Stäng-elementet låg kvar som aktivt i cirka 1,7 s.
function setup() {
  const doc = { activeElement: null, body: { name: 'body' } };
  doc.activeElement = doc.body;
  const make = (name, { parent = null, hidden = false, data = null, cls = '' } = {}) => {
    const el = {
      name, hidden, cls, dataset: data ? { id: data } : {}, children: [],
      contains(x) { return x === el || el.children.some(c => c.contains(x)); },
      focus() { doc.activeElement = el; },
      getClientRects() { return el.hidden ? [] : [{}]; },
      querySelector(sel) {
        const m = /data-id="([^"]+)"/.exec(sel);
        return el.children.find(c => c.dataset?.id === m?.[1] && sel.includes(c.cls)) ?? null;
      },
    };
    parent?.children.push(el);
    return el;
  };
  const el = {};
  el.detail = make('detail', { hidden: true });
  el.close = make('close', { parent: el.detail });
  el.funfact = make('funfact');
  el['ff-events'] = make('ff-events', { parent: el.funfact });
  el.chip = make('chip', { parent: el.funfact, data: 'k1', cls: '.ff-chip' });
  el['ff-events'].children.push(el.chip);
  el['ff-next'] = make('ff-next', { parent: el.funfact });
  el['ff-handle'] = make('ff-handle', { parent: el.funfact });
  el.panel = make('panel');
  el['event-list'] = make('event-list', { parent: el.panel });
  el.row = make('row', { parent: el['event-list'], data: 'e1', cls: '.event-btn' });
  el['btn-panel'] = make('btn-panel');
  el['btn-focus'] = make('btn-focus');
  el['more-toggle'] = make('more-toggle');
  el['btn-more'] = make('btn-more', { hidden: true });
  el.tour = make('tour-next');
  const queue = [], laters = [];
  const f = createDetailFocus({ $: id => el[id], doc, esc: s => s, defer: fn => queue.push(fn), later: fn => laters.push(fn) });
  const flush = () => { while (queue.length) queue.shift()(); };
  // Rutan stängs: hidden sätts, och fokus ligger kvar på det dolda elementet tills webbläsaren rättar det (Chromium och Firefox)
  const close = active => { doc.activeElement = active; el.detail.hidden = true; f.close(active); };
  return { doc, el, f, flush, laters, close };
}

test('en rad i Samtidigt-listan: tillbaka till raden utan att en bildruta behövs', () => {
  const { doc, el, f, flush, laters, close } = setup();
  assert.equal(f.open(el.row), true, 'fokus ska gå till Stäng');
  close(el.close);
  assert.equal(doc.activeElement, el.close, 'före mikrotasken ligger fokus kvar på det dolda elementet');
  flush();
  assert.equal(doc.activeElement, el.row);
  assert.equal(laters.length, 0, 'inget andra försök när det första lyckades');
});

test('raden syns inte (mobil, panelen stängd): fokus går till knappen Samtidigt', () => {
  const { doc, el, f, flush, close } = setup();
  f.open(el.row);
  el.row.hidden = true;
  close(el.close);
  flush();
  assert.equal(doc.activeElement, el['btn-panel']);
});

test('en chip i Samtidigt-kortet: tillbaka till chippen, annars Nästa', () => {
  const a = setup();
  assert.equal(a.f.open(a.el.chip), true);
  a.close(a.el.close);
  a.flush();
  assert.equal(a.doc.activeElement, a.el.chip);
  const b = setup();
  b.f.open(b.el.chip);
  b.el.chip.hidden = true;
  b.close(b.el.close);
  b.flush();
  assert.equal(b.doc.activeElement, b.el['ff-next']);
});

test('utan öppnare (markör, etikett, tur, datumresultat): fokus på Stäng går till knappen Samtidigt', () => {
  const { doc, el, f, flush, close } = setup();
  assert.equal(f.open(el.tour), false, 'ingen öppnare: fokus flyttas inte till Stäng');
  close(el.close);
  assert.equal(doc.activeElement, el.close);
  flush();
  assert.equal(doc.activeElement, el['btn-panel']);
});

test('utan öppnare med fokus på body eller utanför rutan: inget flyttas', () => {
  const a = setup();
  a.close(a.doc.body);
  a.flush();
  assert.equal(a.doc.activeElement, a.doc.body);
  const b = setup();
  b.close(b.el.tour);
  b.flush();
  assert.equal(b.doc.activeElement, b.el.tour, 'turens Nästa behåller fokus');
  assert.equal(b.laters.length, 0);
});

test('fokus som besökaren redan har flyttat före mikrotasken rörs inte', () => {
  const a = setup();
  a.f.open(a.el.row);
  a.close(a.el.close);
  a.doc.activeElement = a.el.tour;
  a.flush();
  assert.equal(a.doc.activeElement, a.el.tour);
  const b = setup();
  b.close(b.el.close);
  b.doc.activeElement = b.el.tour;
  b.flush();
  assert.equal(b.doc.activeElement, b.el.tour);
});

test('rutan öppnas igen före mikrotasken: fokus flyttas inte', () => {
  const { doc, el, f, flush, close } = setup();
  f.open(el.row);
  close(el.close);
  el.detail.hidden = false; // nästa steg öppnade en ny ruta
  flush();
  assert.equal(doc.activeElement, el.close);
});

test('säkerhetsnätet: kunde inget fokuseras i mikrotasken försöker nästa bildruta igen', () => {
  const { doc, el, f, flush, laters, close } = setup();
  f.open(el.row);
  el.row.hidden = true; el['btn-panel'].hidden = true;
  close(el.close);
  flush();
  assert.equal(doc.activeElement, el.close);
  assert.equal(laters.length, 1);
  el['btn-panel'].hidden = false;
  laters.shift()();
  assert.equal(doc.activeElement, el['btn-panel']);
});

// En numrerad markör i regionvyn (#1713): fokus går till Stäng när kortet öppnas, och tillbaka till markören när det stängs.
function regionMark(el, doc) {
  const mark = { name: 'rmark', hidden: false, dataset: { event: 'skane-1' }, closest: sel => (sel === '.region-marks' ? {} : null), focus() { doc.activeElement = mark; }, getClientRects() { return mark.hidden ? [] : [{}]; } };
  doc.querySelectorAll = sel => (sel.includes('data-event="skane-1"') && !mark.hidden ? [mark] : []);
  return mark;
}

test('markör i regionvyn: fokus går till Stäng och tillbaka till markören', () => {
  const { doc, el, f, flush, close } = setup();
  const mark = regionMark(el, doc);
  assert.equal(f.open(mark), true, 'fokus ska gå till Stäng och inte stanna på markören');
  close(el.close);
  flush();
  assert.equal(doc.activeElement, mark);
});

test('markören finns inte längre (regionvyn lämnad): fokus går till knappen Samtidigt', () => {
  const { doc, el, f, flush, close } = setup();
  const mark = regionMark(el, doc);
  f.open(mark);
  mark.hidden = true;
  close(el.close);
  flush();
  assert.equal(doc.activeElement, el['btn-panel']);
});

// Ett kort som öppnas från menyn Sök och följ (#1696): Escape och Stäng ger fokus tillbaka till menyknappen, inte till Samtidigt.
test('valt i Sök och följ: fokus på Stäng går tillbaka till knappen Sök och följ (#1696)', () => {
  const { doc, el, f, flush, close } = setup();
  f.pickFromMenu(true);
  assert.equal(f.open(el['btn-focus']), false, 'fokus flyttas inte till Stäng av detail-focus; kortet gör det själv');
  f.pickFromMenu(false);
  close(el.close);
  flush();
  assert.equal(doc.activeElement, el['btn-focus']);
});

test('valt i Sök och följ i smal skärm: knappen ligger i en stängd meny, fokus går till Meny (#1696)', () => {
  const { doc, el, f, flush, close } = setup();
  el['btn-focus'].hidden = true;
  f.pickFromMenu(true);
  f.open(doc.body);
  f.pickFromMenu(false);
  close(el.close);
  flush();
  assert.equal(doc.activeElement, el['more-toggle']);
});

test('ett kort som öppnas efter att valet är klart får inte menyns öppnare (#1696)', () => {
  const { doc, el, f, flush, close } = setup();
  f.pickFromMenu(true);
  f.pickFromMenu(false);
  f.open(el.tour);
  close(el.close);
  flush();
  assert.equal(doc.activeElement, el['btn-panel'], 'utan öppnare gäller reserven: knappen Samtidigt');
});

test('valt i Sök och följ men fokus står kvar utanför kortet: inget flyttas (#1696)', () => {
  const { doc, el, f, flush, close } = setup();
  f.pickFromMenu(true);
  f.open(el['btn-focus']);
  f.pickFromMenu(false);
  close(el['btn-focus']);
  flush();
  assert.equal(doc.activeElement, el['btn-focus']);
});

test('en rad i Samtidigt-listan vinner över menyvalet: tillbaka till raden (#1696)', () => {
  const { doc, el, f, flush, close } = setup();
  f.pickFromMenu(true);
  f.open(el.row);
  f.pickFromMenu(false);
  close(el.close);
  flush();
  assert.equal(doc.activeElement, el.row);
});
