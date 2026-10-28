// Startar allt och kopplar ihop delarna:
// tidsreglaget skickar ut året → lagret väljer händelser → globen och panelen ritar om.
import { loadAll, CAT, t, yearParts } from './model.js';
import { Globe } from './globe.js';
import { Timeline, yearsAcross, segmentName } from './timeline.js';
import { EventsLayer } from './layers/events.js';
import { AreasLayer } from './layers/areas.js';
import { BordersLayer } from './layers/borders.js';
import { Panel } from './ui/panel.js';
import { FunFacts } from './ui/funfact.js';
import { SourcesDialog } from './ui/sources.js';

const $ = id => document.getElementById(id);

async function start() {
  const data = await loadAll();
  const globe = new Globe($('globe-canvas'));
  globe.drawBase(data.land);

  const layer = new EventsLayer(globe, data.events);
  const areas = new AreasLayer(data.polities);
  const borders = new BordersLayer(data.borders);
  const panel = new Panel({
    root: $('panel'), list: $('event-list'), filters: $('filters'), detail: $('detail'),
    sub: $('panel-sub'), count: $('panel-count'), toggle: $('btn-panel'),
  }, data);
  const ff = new FunFacts({
    root: $('funfact'), text: $('ff-text'), events: $('ff-events'), review: $('ff-review'),
    pager: $('ff-pager'), next: $('ff-next'), srcBtn: $('ff-sources'),
  }, data);
  const sources = new SourcesDialog({ root: $('sources-dialog'), body: $('sources-body'), close: $('sources-close'), openBtn: $('btn-sources') }, data);

  const timeline = new Timeline({
    track: $('track'), thumb: $('thumb'), segs: $('track-segments'), ticks: $('ticks'),
    dots: $('track-dots'), ffMarks: $('track-ff'), playBtn: $('btn-play'), playIcon: $('play-icon'),
    stepBtns: document.querySelectorAll('.step'),
  });
  timeline.setMarks(data.events, data.funfacts, e => CAT[e.category]?.color ?? '#fff');

  let selectedId = null;
  let visible = [];

  function refresh() {
    const year = timeline.year;
    const window = yearsAcross(year, 0.012);
    ff.update(year, panel.filters);
    visible = layer.update({ year, window, filters: panel.filters, selectedId, highlight: ff.highlightIds() });
    panel.render(visible, year, window);
    areas.update({ year });
    borders.update({ year });
    const ctx = globe.overlayContext();
    const W = globe.overlayCanvas.width, H = globe.overlayCanvas.height;
    // Ordning nedifrån och upp: riken, dagens gränser, händelsernas sken
    areas.drawOverlay(ctx, W, H);
    borders.drawOverlay(ctx, W, H);
    layer.drawOverlay(ctx, W, H);
    globe.commitOverlay();
    if (!$('flat-view').hidden) globe.composeFlat($('flat-canvas'));

    const [num, era] = yearParts(year);
    $('year-big').textContent = num;
    $('year-era').textContent = era;
    $('year-segment').textContent = `${segmentName(year)} · visar ±${Math.round(window)} år`;
  }

  function select(id) {
    selectedId = id;
    const e = id ? data.byId[id] : null;
    panel.showDetail(e);
    if (e) {
      globe.flyTo(e._lat, e._lon);
      // Hoppa i tiden om händelsen ligger långt bort
      if (timeline.year < e.start - 400 || timeline.year > e.end + 400) timeline.year = e.start;
    }
    refresh();
  }

  timeline.addEventListener('change', refresh);
  panel.onSelect = select;
  panel.onFilter = refresh;
  ff.onSelect = select;
  ff.onArcs = pairs => globe.setArcs(pairs);
  ff.onSources = ids => sources.open(ids);
  ff.onNew = () => timeline.hold(3500);
  sources.onSettings = refresh;

  globe.onClick = (x, y) => {
    const hit = globe.pick(x, y, layer.sprites.filter(s => s.visible));
    select(hit ? hit.userData.event.id : null);
  };

  // Platt vy: det en fysisk glob skulle få
  $('btn-flat').addEventListener('click', () => {
    const fv = $('flat-view'), show = fv.hidden;
    fv.hidden = !show;
    $('btn-flat').setAttribute('aria-pressed', String(show));
    if (show) globe.composeFlat($('flat-canvas'));
  });

  // Dagens landsgränser: ett filter som är av från början
  $('btn-borders').addEventListener('click', () => {
    borders.enabled = !borders.enabled;
    $('btn-borders').setAttribute('aria-pressed', String(borders.enabled));
    refresh();
  });

  // Rikenas namn ritas med IM Fell English, rita om när typsnittet har laddats
  document.fonts?.ready.then(refresh);

  // Flytta globen åt vänster när panelen ligger till höger
  const mq = matchMedia('(min-width: 761px)');
  const shift = () => globe.setViewShift(mq.matches ? 170 : 0);
  mq.addEventListener('change', shift); shift();

  // Etiketter för synliga händelser, utan överlapp
  const labelsEl = $('labels');
  const pool = new Map();
  globe.onFrame(now => {
    layer.pulse(now, selectedId);
    const hl = ff.highlightIds();
    const order = [...visible].sort((a, b) =>
      ((b.e.id === selectedId) - (a.e.id === selectedId)) || (hl.has(b.e.id) - hl.has(a.e.id)) || (b.activity - a.activity));
    const placed = [];
    const seen = new Set();
    for (const { e } of order.slice(0, 14)) {
      const p = globe.project(e._pos);
      if (p.facing < 0.2) continue;
      const w = t(e.title).length * 6.6 + 30, h = 22;
      const box = { x0: p.x - w / 2, x1: p.x + w / 2, y0: p.y - 14 - h, y1: p.y - 14 };
      if (placed.some(b => box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0)) continue;
      placed.push(box);
      let el = pool.get(e.id);
      if (!el) {
        el = document.createElement('div');
        el.className = 'glabel';
        el.innerHTML = `<span class="dot" style="background:${CAT[e.category]?.color}"></span>${t(e.title).replace(/</g, '&lt;')}`;
        el.addEventListener('click', () => select(e.id));
        labelsEl.append(el); pool.set(e.id, el);
      }
      el.style.transform = `translate(${p.x}px, ${p.y - 12}px) translate(-50%, -100%)`;
      el.style.opacity = String(Math.min(1, (p.facing - 0.2) * 4));
      el.hidden = false;
      seen.add(e.id);
    }
    for (const [id, el] of pool) if (!seen.has(id)) el.hidden = true;
  });

  $('loading').hidden = true;
  timeline.init(1325);
  globe.flyTo(34, -50, 1600);
  globe.autoRotate = false;
}

start().catch(err => {
  console.error(err);
  $('loading').textContent = `Globen kunde inte starta: ${err.message}`;
});
