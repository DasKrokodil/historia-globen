// Startar allt och kopplar ihop delarna:
// tidsreglaget skickar ut året → lagret väljer händelser → globen och panelen ritar om.
import { loadAll, loadReligions, loadEmpire, CAT, t, yearParts, formatYear, formatEventTime, isVisibleReview } from './model.js';
import { Globe } from './globe.js';
import { Timeline, segmentName, setupYearJump } from './timeline.js';
import { EventsLayer } from './layers/events.js';
import { AreasLayer } from './layers/areas.js';
import { BordersLayer } from './layers/borders.js';
import { ReligionsLayer } from './layers/religions.js';
import { WarsLayer } from './layers/wars.js';
import { Panel } from './ui/panel.js';
import { FunFacts } from './ui/funfact.js';
import { SourcesDialog } from './ui/sources.js';
import { LayerMenu } from './ui/layers.js';
import { cluster } from './ui/clusters.js';
import { FocusMenu } from './ui/focusmenu.js';

const $ = id => document.getElementById(id);

// Samtidigt-kortet (#120): när ett krig bryter ut visas vad mer som hände i världen
// inom några år. Allt hämtas ur händelserna, som var och en har källa.
const NEAR_YEARS = 5;
const RANK = ['draft', 'source-checked', 'two-sources', 'human-reviewed'];
function warCards(events) {
  const shown = e => !e.partOf || e.top || e.major;
  return events.filter(e => e.kind === 'war').flatMap(war => {
    const near = events
      .filter(e => e !== war && e.kind !== 'war' && e.partOf !== war.id && shown(e) && Math.abs(e.start - war.start) <= NEAR_YEARS)
      .sort((a, b) => Math.abs(a.start - war.start) - Math.abs(b.start - war.start)).slice(0, 3);
    if (!near.length) return [];
    const evs = [war, ...near];
    return [{
      id: `war-${war.id}`, kind: 'war', events: evs.map(e => e.id), show: [war.start, war.start + 4],
      review: RANK[Math.min(...evs.map(e => Math.max(0, RANK.indexOf(e.review))))],
      sources: [...new Set(evs.flatMap(e => e.sources ?? []))],
      text: { sv: `${t(war.title)} bryter ut ${formatYear(war.start)}. Samtidigt i världen:` },
    }];
  });
}

async function start() {
  const data = await loadAll();
  const globe = new Globe($('globe-canvas'));
  globe.drawBase(data.land);

  const layer = new EventsLayer(globe, data.events);
  const areas = new AreasLayer();
  const borders = new BordersLayer(data.borders);
  const religions = new ReligionsLayer();
  const wars = new WarsLayer(data.events);
  const panel = new Panel({
    root: $('panel'), list: $('event-list'), filters: $('filters'), detail: $('detail'),
    sub: $('panel-sub'), count: $('panel-count'), toggle: $('btn-panel'), close: $('panel-close'),
  }, data);
  const ff = new FunFacts({
    root: $('funfact'), text: $('ff-text'), events: $('ff-events'), review: $('ff-review'),
    pager: $('ff-pager'), next: $('ff-next'), srcBtn: $('ff-sources'),
    kind: $('ff-kind'), min: $('ff-min'), tab: $('ff-tab'), tabCount: $('ff-tab-count'),
  }, { funfacts: [...data.funfacts, ...warCards(data.events)], byId: data.byId });
  const sources = new SourcesDialog({ root: $('sources-dialog'), body: $('sources-body'), close: $('sources-close'), openBtn: $('btn-sources') }, data);

  const timeline = new Timeline({
    track: $('track'), thumb: $('thumb'), segs: $('track-segments'), ticks: $('ticks'),
    dots: $('track-dots'), ffMarks: $('track-ff'), playBtn: $('btn-play'), playIcon: $('play-icon'),
    stepBtns: document.querySelectorAll('.step[data-step]'), speedBtn: $('btn-speed'),
  });
  setupYearJump(timeline, { button: $('year-jump'), pop: $('jump-pop'), input: $('jump-input'), msg: $('jump-msg'), epochs: $('jump-epochs') });
  timeline.setMarks(data.events.filter(e => !e.partOf || e.top || e.major), data.funfacts, e => CAT[e.category]?.color ?? '#fff');

  let focusWar = null, focus = null, lastYear = 0;

  // Lagerväljaren: vilka lager som syns. Startläget står i index.html.
  const layers = new LayerMenu({ button: $('btn-layers'), menu: $('layer-menu') });
  // I fokusläge syns det man följer även om lagret är avslaget i menyn
  const applyLayers = () => {
  // och det andra av riken och religioner göms, så att områdena inte täcker varandra
    areas.enabled = focus?.type === 'empire' || (layers.on.areas && focus?.type !== 'religion');
    borders.enabled = layers.on.borders;
    religions.enabled = focus?.type === 'religion' || (layers.on.religions && focus?.type !== 'empire');
    $('religion-list').hidden = !layers.on.religions;
    ff.enabled = layers.on.funfacts;
  };
  applyLayers();
  // Religionerna laddas första gången lagret slås på, och då byggs undermenyn
  let religionsLoading = false;
  async function ensureReligions() {
    if (religionsLoading || !layers.on.religions) return;
    religionsLoading = true;
    $('religion-list').textContent = 'Laddar religioner…';
    try {
      const doc = await loadReligions();
      religions.setData(doc.religions);
      $('religion-list').textContent = '';
      layers.sublist($('religion-list'), doc.religions.map(r => ({ id: r.id, name: t(r.name), color: r.color })), (id, on) => {
        on ? religions.hidden.delete(id) : religions.hidden.add(id);
        refresh();
      });
      data.religionsDoc = doc;
      refresh();
    } catch (err) {
      console.error(err);
      $('religion-list').textContent = 'Religionerna kunde inte laddas.';
      religionsLoading = false;
    }
  }
  const noEvents = new Set();

  let selectedId = null;
  let visible = [];

  /** Mittpunkt för en GeoJSON-geometri (mitten av dess yttre gränser), som [lat, lon]. */
  function geoCenter(geoms) {
    let a = 180, b = -180, c = 90, d = -90;
    for (const g of geoms) for (const poly of g.type === 'Polygon' ? [g.coordinates] : g.coordinates) {
      for (const [lon, lat] of poly[0]) { a = Math.min(a, lon); b = Math.max(b, lon); c = Math.min(c, lat); d = Math.max(d, lat); }
    }
    return [(c + d) / 2, (a + b) / 2, b - a]; // [lat, lon, bredd i grader]
  }

  // Fokusläge (#109, #113): följ ett krig, ett rike eller en religion. Tidslinjen och
  // globen zoomar in, och uppspelningen går långsamt.
  async function startFocus(key) {
    const [type, id] = key.split(':');
    let f;
    if (type === 'war') {
      const war = data.byId[id];
      const pts = [war, ...war._battles];
      f = { type, id, title: `${t(war.title)} ${formatEventTime(war)}`, short: t(war.title), from: war.start, to: war.end,
        center: [pts.reduce((s, e) => s + e._lat, 0) / pts.length, pts.reduce((s, e) => s + e._lon, 0) / pts.length], zoom: 2.2 };
    } else if (type === 'empire') {
      const g = data.empireGroups.find(x => x.id === id);
      const ps = await loadEmpire(g);
      areas.add(ps);
      // Globen riktas mot riket när det var som störst, och zoomar mindre för vidsträckta riken
      const periods = ps.flatMap(p => p.periods);
      const biggest = periods.reduce((a, b) => (b.areaKm2 > a.areaKm2 ? b : a));
      const [lat, lon, span] = geoCenter([biggest.geometry]);
      // Årtalen är kartdatans spann i Cliopatria, inte nödvändigtvis rikets historiska årtal (#138)
      f = { type, id, title: `${t(g.name)} · kartdata ${formatYearSpan(g.from, g.to)}`, short: t(g.name), from: g.from, to: g.to,
        center: [lat, lon], zoom: span > 150 ? 1 : span > 60 ? 1.3 : 1.8 };
    } else {
      const doc = await loadReligions();
      const r = doc.religions.find(x => x.id === id);
      // Fokus börjar när religionen grundades, om det finns en sådan händelse (#123)
      const first = founding(id)[0];
      const from = Math.min(first?.start ?? Infinity, r.snapshots[0].start), to = Math.max(r.snapshots.at(-1).end, first?.end ?? -Infinity);
      f = { type, id, title: `${t(r.name)} · ${religionSpan(r, first)}`, short: t(r.name), from, to,
        center: first ? [first._lat, first._lon] : geoCenter([r.snapshots[0].geometry]), zoom: 1.3 };
      if (!religions.religions.length) religions.setData(doc.religions);
    }
    if (focus) endFocus(false);
    focus = f;
    focusWar = type === 'war' ? data.byId[id] : null;
    areas.onlyGroup = type === 'empire' ? id : null;
    religions.onlyId = type === 'religion' ? id : null;
    applyLayers();
    globe.flyTo(f.center[0], f.center[1], 900);
    globe.setZoom(f.zoom);
    $('focus-title').textContent = f.title;
    $('focus-bar').hidden = false;
    $('app').classList.add('focusing');
    panel.setOpen(false); // listan stängs så att det man följer syns
    timeline.setFocus({ from: f.from, to: f.to });
    lastYear = f.from;
    timeline.year = f.from;
    refresh();
    // Före start: varför kriget började och vilka som stred (#122)
    if (focusWar?.story) { selectedId = focusWar.id; panel.showStory(focusWar, 'intro'); $('app').classList.add('has-detail'); }
    // Religionens grundande visas först, i faktarutan
    const first = type === 'religion' && founding(id)[0];
    if (first) select(first.id, false);
  }
  /** Händelser där en religion grundades (founding: true), i tidsordning. */
  const founding = id => data.events.filter(e => e.founding && e.religion === id).sort((a, b) => a.start - b.start);
  function endFocus(redraw = true) {
    focus = null; focusWar = null;
    areas.onlyGroup = null; religions.onlyId = null;
    applyLayers();
    $('focus-bar').hidden = true;
    $('app').classList.remove('focusing');
    timeline.setFocus(null);
    globe.setZoom(1);
    if (redraw) refresh();
  }
  const formatYearSpan = (a, b) => formatEventTime({ start: a, end: b, edtf: '' });

  // Fokusmenyn listar krig, riken och religioner. Religionerna hämtas när menyn öppnas.
  const focusMenu = new FocusMenu({ button: $('btn-focus'), menu: $('focus-menu') });
  // Varje post har sitt tidsspann (from–to), så att menyn kan visa det som hör till tiden man står i (#121)
  // Religionens årtal i Fokus: grundandet där det går att belägga, annars bara kartdatans spann (#138)
  const religionSpan = (r, first) => {
    const map = `statsreligion på kartan ${formatYearSpan(r.snapshots[0].start, r.snapshots.at(-1).end)}`;
    return first ? `grundad ${formatEventTime(first)} · ${map}` : map;
  };
  const religionItems = doc => doc.religions.map(r => {
    const first = founding(r.id)[0];
    const from = Math.min(first?.start ?? Infinity, r.snapshots[0].start), to = r.snapshots.at(-1).end;
    return { key: `religion:${r.id}`, label: t(r.name), sub: religionSpan(r, first), color: r.color, from, to };
  });
  const empireItems = () => data.empireGroups.map(g =>
    ({ key: `empire:${g.id}`, label: t(g.name), sub: `kartdata ${formatYearSpan(g.from, g.to)}`, color: g.color, from: g.from, to: g.to }));
  const focusGroups = (doc = null) => [
    { title: 'Krig', items: data.events.filter(e => e.kind === 'war').map(e => ({ key: `war:${e.id}`, label: t(e.title), sub: formatEventTime(e), color: CAT[e.category]?.color, from: e.start, to: e.end })) },
    { title: 'Riken', note: 'Gränser ur Cliopatria. Årtalen visar när kartdata finns och kan skilja sig från rikets historiska årtal.', items: empireItems() },
    { title: 'Religioner', note: 'Visar var religionen var officiell religion eller huvudreligion i en statsbildning, inte religionens ålder eller var alla troende bodde.', items: doc ? religionItems(doc) : [], loading: !doc },
  ];
  focusMenu.setGroups(focusGroups());
  focusMenu.onOpen = async () => {
    panel.setOpen(false); layers.close();
    // Nära = inom fyra gånger det tidslinjen visar runt året (vid 1325 cirka ±150 år)
    const year = timeline.year, r = Math.round(timeline.windowYears(year) * 4 / 10) * 10;
    focusMenu.setTime({ year, from: year - r, to: year + r, label: `inom ±${r} år från ${formatYear(year)}` });
    if (focusMenu.groups[2].loading) focusMenu.setGroups(focusGroups(await loadReligions()));
  };
  focusMenu.onPick = key => startFocus(key);

  // Rikena laddas när året närmar sig deras tid (en fil per rike, R1). När filen har kommit ritas allt om.
  const empireLoads = new Set();
  function ensureEmpires(year) {
    if (!areas.enabled) return;
    const pad = 100;
    for (const g of data.empireGroups) {
      if (empireLoads.has(g.id) || year < g.from - pad || year > g.to + pad) continue;
      empireLoads.add(g.id);
      loadEmpire(g).then(ps => { areas.add(ps); refresh(); }).catch(err => { console.error(err); empireLoads.delete(g.id); });
    }
  }

  function refresh() {
    const year = timeline.year;
    ensureEmpires(year);
    const window = timeline.windowYears(year);
    ff.update(year, panel.filters);
    const eventsOn = layers.on.events;
    visible = layer.update({ year, window, filters: eventsOn ? panel.filters : noEvents, selectedId, highlight: ff.highlightIds(), focusId: focusWar?.id });
    panel.render(visible, year, window, eventsOn);
    areas.update({ year });
    borders.update({ year });
    religions.update({ year });
    wars.enabled = eventsOn;
    wars.update({ year, filters: panel.filters });
    const ctx = globe.overlayContext();
    const W = globe.overlayCanvas.width, H = globe.overlayCanvas.height;
    // Ordning nedifrån och upp: riken, religioner, dagens gränser, krigsområden, händelsernas sken
    areas.drawOverlay(ctx, W, H);
    religions.drawOverlay(ctx, W, H);
    borders.drawOverlay(ctx, W, H);
    wars.drawOverlay(ctx, W, H);
    layer.drawOverlay(ctx, W, H);
    globe.commitOverlay();
    if (!$('flat-view').hidden) globe.composeFlat($('flat-canvas'));

    const [num, era] = yearParts(year);
    $('year-big').textContent = num;
    $('year-era').textContent = era;
    $('year-segment').textContent = `${focus ? `Fokus: ${focus.short}` : segmentName(year)} · visar ±${Math.round(window)} år`;
    // I fokusläge stannar uppspelningen vid krigets viktigaste händelser
    // I slutet: hur kriget slutade och hur många som dog (#122)
    if (focusWar?.story && timeline.playing && lastYear < focusWar.end && year >= focusWar.end) {
      timeline.pause(); selectedId = focusWar.id; panel.showStory(focusWar, 'summary');
    } else if (focusWar && timeline.playing && layers.pause.major) {
      const hit = focusWar._battles.find(b => b.major && b.start > lastYear && b.start <= year);
      // I smal skärm öppnas inte panelen, så att kartan syns; händelsen markeras på globen
      if (hit) { timeline.pause(); selectedId = hit.id; panel.showDetail(hit, matchMedia('(min-width: 761px)').matches); }
    }
    // I fokus på en religion stannar uppspelningen vid händelserna när den grundades (#123)
    if (focus?.type === 'religion' && timeline.playing) {
      const hit = founding(focus.id).find(e => e.start > lastYear && e.start <= year);
      if (hit) { timeline.pause(); selectedId = hit.id; panel.showDetail(hit, matchMedia('(min-width: 761px)').matches); }
    }
    // Pausa när ett krig bryter ut, om det är valt i lagermenyn (#114)
    if (!focus && timeline.playing && layers.pause.wars && eventsOn) {
      const war = data.events.find(e => e.kind === 'war' && e.start > lastYear && e.start <= year
        && panel.filters.has(e.category) && isVisibleReview(e.review));
      if (war) { timeline.pause(); timeline.year = war.start; selectedId = war.id; panel.showDetail(war); }
    }
    lastYear = year;
    $('app').classList.toggle('has-detail', !$('detail').hidden);
  }

  const narrow = matchMedia('(max-width: 760px)');
  function select(id, jump = true) {
    selectedId = id;
    const e = id ? data.byId[id] : null;
    panel.showDetail(e);
    // I smal skärm stängs listan när en händelse väljs, så att faktarutan syns
    if (e && narrow.matches) panel.setOpen(false);
    if (e) {
      globe.flyTo(e._lat, e._lon);
      // Hoppa i tiden om händelsen ligger långt bort
      if (jump && (timeline.year < e.start - 400 || timeline.year > e.end + 400)) timeline.year = e.start;
    }
    refresh();
  }

  timeline.addEventListener('change', refresh);
  panel.onSelect = select;
  panel.onFocus = id => startFocus(`war:${id}`);
  $('focus-exit').addEventListener('click', endFocus);
  panel.onFilter = refresh;
  ff.onSelect = select;
  ff.onArcs = pairs => globe.setArcs(pairs);
  ff.onSources = ids => sources.open(ids);
  // Uppspelningen stannar vid en ny fun fact, så att man hinner läsa. Play fortsätter.
  // Ihopfällt kort: ingen paus, eftersom kortet inte syns
  ff.onNew = () => { if (timeline.playing && layers.pause.funfacts && !ff.minimized) timeline.pause(); };
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

  layers.onChange = () => { applyLayers(); ensureReligions(); refresh(); };

  // Rikenas namn ritas med IM Fell English, rita om när typsnittet har laddats
  document.fonts?.ready.then(refresh);

  // Menyerna uppe till höger: bara en åt gången
  panel.onOpen = () => { layers.close(); focusMenu.close(); };
  layers.onOpen = () => { panel.setOpen(false); focusMenu.close(); };

  // Etiketter för synliga händelser, utan överlapp
  const labelsEl = $('labels');
  const pool = new Map();
  const clusterPool = [];
  globe.onFrame(now => {
    layer.pulse(now, selectedId);
    const hl = ff.highlightIds();
    const order = [...visible].sort((a, b) =>
      ((b.e.id === selectedId) - (a.e.id === selectedId)) || (hl.has(b.e.id) - hl.has(a.e.id)) || (b.activity - a.activity));
    // Klustra händelser som ligger nära varandra på skärmen (#26)
    const items = order.map(v => ({ e: v.e, p: globe.project(v.e._pos), keep: v.e.id === selectedId || hl.has(v.e.id) }));
    const { singles, clusters } = cluster(items.filter(it => it.p.facing > 0.05));
    const clustered = new Set(clusters.flatMap(c => c.members.map(m => m.e.id)));
    for (const s of layer.sprites) s.visible = s.userData.active && !clustered.has(s.userData.event.id);
    clusters.forEach((c, i) => {
      let el = clusterPool[i];
      if (!el) {
        el = document.createElement('button');
        el.type = 'button'; el.className = 'gcluster';
        el.addEventListener('click', () => {
          // Zooma in mot klustret så att det delas upp
          const ms = el._members;
          globe.flyTo(ms.reduce((s, m) => s + m.e._lat, 0) / ms.length, ms.reduce((s, m) => s + m.e._lon, 0) / ms.length, 700);
          globe.setZoom(globe.zoom * 1.8);
        });
        labelsEl.append(el); clusterPool[i] = el;
      }
      el._members = c.members;
      el.textContent = String(c.members.length);
      el.title = c.members.slice(0, 8).map(m => t(m.e.title)).join(', ') + (c.members.length > 8 ? ' …' : '');
      el.style.transform = `translate(${c.x}px, ${c.y}px) translate(-50%, -50%)`;
      el.hidden = false;
    });
    for (let i = clusters.length; i < clusterPool.length; i++) clusterPool[i].hidden = true;
    const placed = [];
    const seen = new Set();
    for (const { e, p } of singles.slice(0, 14)) {
      if (p.facing < 0.2) continue;
      // Händelser i ett krig får årtalet framför namnet
      const text = e.partOf ? `${e.start} · ${t(e.title)}` : t(e.title);
      const w = text.length * 6.6 + 30, h = 22;
      const box = { x0: p.x - w / 2, x1: p.x + w / 2, y0: p.y - 14 - h, y1: p.y - 14 };
      if (placed.some(b => box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0)) continue;
      placed.push(box);
      let el = pool.get(e.id);
      if (!el) {
        el = document.createElement('div');
        el.className = 'glabel';
        el.innerHTML = `<span class="dot" style="background:${CAT[e.category]?.color}"></span>${text.replace(/</g, '&lt;')}`;
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
