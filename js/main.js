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
import { FunFacts, empireStory } from './ui/funfact.js';
import { SourcesDialog } from './ui/sources.js';
import { LayerMenu } from './ui/layers.js';
import { ReligionLegend } from './ui/legend.js';
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
    detailEl: $('ff-detail'), kind: $('ff-kind'), min: $('ff-min'), tab: $('ff-tab'), tabCount: $('ff-tab-count'),
  }, { funfacts: [...data.funfacts, ...warCards(data.events)], byId: data.byId, srcById: data.srcById, styles: data.styles });
  const sources = new SourcesDialog({ root: $('sources-dialog'), body: $('sources-body'), close: $('sources-close'), openBtn: $('btn-sources') }, data);

  const timeline = new Timeline({
    track: $('track'), thumb: $('thumb'), segs: $('track-segments'), ticks: $('ticks'),
    dots: $('track-dots'), ffMarks: $('track-ff'), playBtn: $('btn-play'), playIcon: $('play-icon'), pauseNote: $('pause-note'), pauseText: $('pause-text'),
    pauseGo: $('pause-go'),
    stepBtns: document.querySelectorAll('.step[data-step]'), speedBtn: $('btn-speed'),
  });
  setupYearJump(timeline, { button: $('year-jump'), pop: $('jump-pop'), input: $('jump-input'), msg: $('jump-msg'), epochs: $('jump-epochs'), onJump: () => flyToYearHighlight() });
  timeline.setMarks(data.events.filter(e => !e.partOf || e.top || e.major), data.funfacts, e => CAT[e.category]?.color ?? '#fff');

  let focusWar = null, focus = null, lastYear = 0;

  // Lagerväljaren: vilka lager som syns. Startläget står i index.html.
  const layers = new LayerMenu({ button: $('btn-layers'), menu: $('layer-menu') });
  // Teckenförklaring och klickruta för religionslagret (#166)
  const relLegend = new ReligionLegend({ legend: $('religion-legend'), pop: $('religion-pop') });
  relLegend.onFacts = id => showReligionFacts(id);
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
      setReligions(doc);
      $('religion-list').textContent = '';
      layers.sublist($('religion-list'), doc.religions.map(r => ({ id: r.id, name: t(r.name), color: r.color, info: !!r.facts })), (id, on) => {
        on ? religions.hidden.delete(id) : religions.hidden.add(id);
        refresh();
        // Slås en religion med faktaruta på igen visas rutan (#90)
        if (on) showReligionFacts(id);
      }, id => showReligionFacts(id));
      data.religionsDoc = doc;
      refresh();
    } catch (err) {
      console.error(err);
      $('religion-list').textContent = 'Religionerna kunde inte laddas.';
      religionsLoading = false;
    }
  }
  const noEvents = new Set();

  // Faktarutan om en religion och punkten där den uppstod (#90). Uppgifterna står i
  // religionens facts i religions.json, och punkten är händelsen som facts.origin pekar på.
  function setReligions(doc) {
    if (!religions.religions.length) religions.setData(doc.religions);
    religions.setPolities(doc.polities);
    religions.setOrigins(new Map(doc.religions.filter(r => data.byId[r.facts?.origin]).map(r => [r.id, data.byId[r.facts.origin]])));
  }
  function showReligionFacts(id, fly = true) {
    const r = data.religionsDoc?.religions.find(x => x.id === id);
    if (!r?.facts) return false;
    const origin = data.byId[r.facts.origin];
    selectedId = origin?.id ?? null;
    panel.showReligion(r, origin);
    // Menyerna stängs så att faktarutan och punkten syns
    layers.close(); focusMenu.close();
    if (narrow.matches) panel.setOpen(false);
    if (origin && fly) globe.flyTo(origin._lat, origin._lon);
    refresh();
    return true;
  }
  // Faktarutan om ett rike (#170): samma ruta som för religioner, med rikets facts i
  // empires/index.json. Kartans gränser kommer från Cliopatria och kan ha andra årtal
  // än rutans källor (#138), så rutan säger det.
  function showEmpireFacts(id) {
    const g = data.empireGroups.find(x => x.id === id);
    if (!g?.facts) return false;
    selectedId = null;
    // Ramen följer rikets tidsålder och platsen globen riktas mot i fokus
    const place = focus?.type === 'empire' && focus.id === id ? { start: g.from, _lat: focus.center[0], _lon: focus.center[1] } : null;
    const note = t(g.facts.mapNote);
    panel.showFacts({ kind: 'Rike', name: t(g.name), color: g.color, facts: g.facts, place,
      mapNote: `Gränserna på kartan kommer från Cliopatria (kartdata ${formatYearSpan(g.from, g.to)}). Fakta i rutan kommer från rutans källor.${note ? ` ${note}` : ''}` });
    layers.close(); focusMenu.close();
    if (narrow.matches) panel.setOpen(false);
    refresh();
    return true;
  }
  /** Har det man följer en faktaruta? (riken och religioner med facts) */
  function focusFacts(f) {
    if (f?.type === 'empire') return !!data.empireGroups.find(x => x.id === f.id)?.facts;
    if (f?.type === 'religion') return !!data.religionsDoc?.religions.find(x => x.id === f.id)?.facts;
    return false;
  }

  /** När religionslagret slås på: faktarutan för den första synliga religionen som har en. */
  function showFirstReligionFacts() {
    const r = data.religionsDoc?.religions.find(x => x.facts && !religions.hidden.has(x.id));
    if (r) showReligionFacts(r.id);
  }

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
      data.religionsDoc ??= doc;
      setReligions(doc);
      const r = doc.religions.find(x => x.id === id);
      // Fokus börjar när religionen grundades, om det finns en sådan händelse (#123)
      const first = founding(id)[0];
      const from = Math.min(first?.start ?? Infinity, r.snapshots[0].start), to = Math.max(r.snapshots.at(-1).end, first?.end ?? -Infinity);
      f = { type, id, title: `${t(r.name)} · ${religionSpan(r, first)}`, short: t(r.name), from, to,
        center: first ? [first._lat, first._lon] : geoCenter([r.snapshots[0].geometry]), zoom: 1.3 };
    }
    // Året stannar om det ligger inom spannet; annars flyttas det till starten och flytten visas (#167)
    const prevYear = timeline.year, keepYear = prevYear >= f.from && prevYear <= f.to;
    if (focus) endFocus(false);
    focus = f;
    focusWar = type === 'war' ? data.byId[id] : null;
    areas.onlyGroup = type === 'empire' ? id : null;
    religions.onlyId = type === 'religion' ? id : null;
    applyLayers();
    globe.flyTo(f.center[0], f.center[1], 900);
    globe.setZoom(f.zoom);
    $('focus-title').textContent = f.title;
    $('focus-facts').hidden = !focusFacts(f);
    $('focus-bar').hidden = false;
    $('app').classList.add('focusing');
    panel.setOpen(false); // listan stängs så att det man följer syns
    timeline.setFocus({ from: f.from, to: f.to });
    const startYear = keepYear ? prevYear : f.from;
    lastYear = startYear;
    timeline.year = startYear;
    showMoved(keepYear ? null : { prevYear, startYear, short: f.short, type });
    refresh();
    // Före start: varför kriget började och vilka som stred (#122)
    if (focusWar?.story) { selectedId = focusWar.id; panel.showStory(focusWar, 'intro'); $('app').classList.add('has-detail'); }
    // Religionens faktaruta visas först (#90), annars grundandet i faktarutan
    const first = type === 'religion' && founding(id)[0];
    if (type === 'religion' && !showReligionFacts(id, false) && first) select(first.id, false);
    // Rikets faktaruta visas när man börjar följa det (#170)
    if (type === 'empire') showEmpireFacts(id);
  }
  /** Raden i fokusraden när tiden flyttades till fokusets start (#167), med en väg tillbaka. */
  let movedBack = null;
  function showMoved(m) {
    $('focus-moved').hidden = !m;
    $('app').classList.toggle('focus-moved-on', !!m);
    movedBack = m;
    if (!m) return;
    const why = m.type === 'war' ? 'då kriget börjar' : m.type === 'religion' ? `då ${m.short} börjar` : `då ${m.short} börjar`;
    $('focus-moved-text').textContent = `Tiden flyttades till ${formatYear(m.startYear)}, ${why} · `;
    $('focus-moved-back').textContent = `Tillbaka till ${formatYear(m.prevYear)}`;
  }
  // Tillbaka lämnar fokus och går till året man stod på, eftersom det ligger utanför spannet
  $('focus-moved-back').addEventListener('click', () => {
    const y = movedBack?.prevYear;
    endFocus(false);
    if (y != null) timeline.year = y;
    refresh();
  });
  /** Händelser där en religion grundades (founding: true), i tidsordning. */
  const founding = id => data.events.filter(e => e.founding && e.religion === id).sort((a, b) => a.start - b.start);
  function endFocus(redraw = true) {
    focus = null; focusWar = null; showMoved(null);
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

  // Rikesnamnen ritas i kartbilden (beslut 1) och växer därför med globen: vid max zoom ser
  // kartbilden ca 10 gånger större ut på skärmen. Därför görs namnen mindre i bilden när man
  // zoomar in (men inte under 0,25, då blir texten för oskarp) och tonas sedan ut, så att de
  // inte täcker markörerna (#154). Värdena ändras i steg och bilden ritas om först 150 ms efter
  // att zoomandet stannat. Platt vy och en fysisk glob får grundstorleken.
  function nameStyle() {
    if (!$('flat-view').hidden) return [1, 1];
    const d = globe.baseDist, mag = Math.max(1, (d - 1) / (d / globe.zoom - 1)); // förstoring i mitten av klotet
    const scale = Math.max(0.25, Math.pow(mag, -0.7));
    const fade = Math.min(1, Math.max(0, (mag - 5) / 5)); // 0 vid mag 5 (zoom ca 2,3), 1 vid max
    return [Math.round(scale * 20) / 20, Math.round((1 - 0.5 * fade) * 20) / 20];
  }
  let nameTimer = 0;
  const syncNameScale = () => {
    clearTimeout(nameTimer);
    nameTimer = setTimeout(() => {
      const [sc, al] = nameStyle();
      if (areas.labelScale !== sc || areas.labelAlpha !== al) refresh();
    }, 150);
  };
  globe.onZoom = syncNameScale;

  function refresh() {
    [areas.labelScale, areas.labelAlpha] = nameStyle();
    const year = timeline.year;
    ensureEmpires(year);
    const window = timeline.windowYears(year);
    ff.story = focus?.type === 'empire' ? storyFor(focus.id) : [];
    ff.update(year, panel.filters);
    const eventsOn = layers.on.events;
    visible = layer.update({ year, window, filters: eventsOn ? panel.filters : noEvents, selectedId, highlight: ff.highlightIds(), focusId: focusWar?.id });
    panel.render(visible, year, window, eventsOn);
    areas.update({ year });
    borders.update({ year });
    religions.update({ year });
    relLegend.update(religions.legendItems());
    if (!religions.enabled) relLegend.hidePop();
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
      timeline.pause('Pausad: kriget är slut'); selectedId = focusWar.id; panel.showStory(focusWar, 'summary');
    } else if (focusWar && timeline.playing && layers.pause.major) {
      const hit = focusWar._battles.find(b => b.major && b.start > lastYear && b.start <= year);
      // I smal skärm öppnas inte panelen, så att kartan syns; händelsen markeras på globen
      if (hit) { timeline.pause('Pausad vid en stor händelse i kriget'); selectedId = hit.id; panel.showDetail(hit, matchMedia('(min-width: 761px)').matches); }
    }
    // I fokus på en religion stannar uppspelningen vid händelserna när den grundades (#123)
    if (focus?.type === 'religion' && timeline.playing) {
      const hit = founding(focus.id).find(e => e.start > lastYear && e.start <= year);
      if (hit) { timeline.pause('Pausad vid religionens grundande'); selectedId = hit.id; panel.showDetail(hit, matchMedia('(min-width: 761px)').matches); }
    }
    // I fokus på ett rike stannar uppspelningen vid rikets nyckelår, och kortet säger varför
    // riket växer eller krymper (#171). Valet finns i Lager.
    if (focus?.type === 'empire' && timeline.playing && layers.pause.empire) {
      const hit = storyFor(focus.id).find(c => c.year > lastYear && c.year <= year);
      if (hit) { timeline.pause(`Pausad vid ${hit.label}: ${hit.title || 'rikets nyckelår'}`); timeline.year = hit.year; }
    }
    // Pausa när ett krig bryter ut, om det är valt i lagermenyn (#114)
    if (!focus && timeline.playing && layers.pause.wars && eventsOn) {
      const war = data.events.find(e => e.kind === 'war' && e.start > lastYear && e.start <= year
        && panel.filters.has(e.category) && isVisibleReview(e.review));
      if (war) { timeline.pause('Pausad: ett krig bryter ut'); timeline.year = war.start; selectedId = war.id; panel.showDetail(war); }
    }
    lastYear = year;
    $('app').classList.toggle('has-detail', !$('detail').hidden);
  }

  // Rikets berättelse (#171): korten byggs en gång per rike ur facts.milestones
  const stories = new Map();
  function storyFor(id) {
    if (!stories.has(id)) stories.set(id, empireStory(data.empireGroups.find(g => g.id === id), data.byId));
    return stories.get(id);
  }

  // Efter "Hoppa till år" (#165): globen vänder sig mot årets viktigaste händelse, alltså den första
  // händelsen i det första Samtidigt-kortet, annars den första i listan. Hoppas över i fokusläge och
  // om användaren nyss vridit globen själv. Uppspelning och stegknappar anropar inte denna.
  const RECENT_TURN_MS = 3000;
  function flyToYearHighlight() {
    if (focus || performance.now() - globe.lastUserInput < RECENT_TURN_MS) return;
    // Närmast i tid först, och bland jämnbördiga den mest avgränsade (ett datum före ett spann som Oxford 1096–2026)
    const rank = e => [Math.max(0, e.start - timeline.year, timeline.year - e.end), e.end - e.start];
    const byRank = (a, b) => { const [x, y] = [rank(a), rank(b)]; return x[0] - y[0] || x[1] - y[1]; };
    const card = (ff.active[0]?.events ?? []).map(id => data.byId[id]).filter(Boolean);
    const e = card.sort(byRank)[0] ?? visible.map(v => v.e).sort(byRank)[0];
    if (e) globe.flyTo(e._lat, e._lon);
  }

  const narrow = matchMedia('(max-width: 760px)');
  /** Val i Samtidigt-kortet (#169): globen flyger dit och händelsen markeras, men bilden visas i kortet och inte i faktarutan. */
  function pick(id) {
    selectedId = id;
    const e = id ? data.byId[id] : null;
    panel.showDetail(e, false);
    if (e) {
      globe.flyTo(e._lat, e._lon);
      if (timeline.year < e.start - 400 || timeline.year > e.end + 400) timeline.year = e.start;
    }
    refresh();
  }

  function select(id, jump = true) {
    ff.closeEvent(); // faktarutan tar över, så att samma händelse inte visas två gånger
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
  // Knappen Fakta i fokusraden öppnar rikets eller religionens faktaruta igen (#170)
  $('focus-facts').addEventListener('click', () => {
    if (focus?.type === 'empire') showEmpireFacts(focus.id);
    else if (focus?.type === 'religion') showReligionFacts(focus.id, false);
  });
  panel.onFilter = refresh;
  ff.onSelect = select;
  ff.onPick = pick;
  ff.onArcs = pairs => globe.setArcs(pairs);
  ff.onSources = ids => sources.open(ids);
  // Uppspelningen stannar vid en ny fun fact, så att man hinner läsa. Play fortsätter.
  // Ihopfällt kort: ingen paus, eftersom kortet inte syns
  ff.onNew = () => { if (timeline.playing && layers.pause.funfacts && !ff.minimized) timeline.pause('Pausad vid ett nytt Samtidigt-kort'); };
  sources.onSettings = refresh;

  globe.onClick = (x, y) => {
    const hit = globe.pick(x, y, layer.sprites.filter(s => s.visible));
    relLegend.hidePop();
    select(hit ? hit.userData.event.id : null);
    // Händelsemarkörer har företräde. Annars: vilken religion ligger under klicket? (#166)
    if (!hit && religions.enabled && religions.active.length) {
      const ll = globe.pickLatLon(x, y);
      const rh = ll && religions.hitTest(ll.lon, ll.lat);
      if (rh) relLegend.showPop(rh, x, y);
    }
  };

  // Platt vy: det en fysisk glob skulle få
  $('btn-flat').addEventListener('click', () => {
    const fv = $('flat-view'), show = fv.hidden;
    fv.hidden = !show;
    $('btn-flat').setAttribute('aria-pressed', String(show));
    if (show) globe.composeFlat($('flat-canvas'));
    syncNameScale();
  });

  layers.onChange = async (name, on) => {
    applyLayers(); refresh();
    await ensureReligions();
    // Faktarutan om religionen visas när lagret slås på (#90)
    if (name === 'religions' && on && data.religionsDoc) showFirstReligionFacts();
  };
  // Nyckelår i rikets och religionens faktaruta hoppar dit i tiden
  panel.onYear = year => { timeline.year = year; };

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
      el.setAttribute('aria-label', `${c.members.length} händelser nära varandra: ${c.members.slice(0, 5).map(m => t(m.e.title)).join(', ')}. Zooma in.`);
      el.title = c.members.slice(0, 8).map(m => t(m.e.title)).join(', ') + (c.members.length > 8 ? ' …' : '');
      el.style.transform = `translate(${c.x}px, ${c.y}px) translate(-50%, -50%)`;
      el.hidden = false;
    });
    for (let i = clusters.length; i < clusterPool.length; i++) clusterPool[i].hidden = true;
    // Etiketterna får inte hamna utanför skärmen eller ovanpå andra markörer och klusterbrickor (#142)
    const W = globe.canvas.clientWidth, H = globe.canvas.clientHeight;
    const dotBox = (x, y, r) => ({ x0: x - r, x1: x + r, y0: y - r, y1: y + r });
    const hit = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
    const markers = items.filter(it => it.p.facing > 0.05 && !clustered.has(it.e.id)).map(it => ({ id: it.e.id, box: dotBox(it.p.x, it.p.y, 9) }));
    const badges = clusters.map(c => dotBox(c.x, c.y, 16));
    const placed = [];
    const seen = new Set();
    for (const { e, p } of singles.slice(0, 14)) {
      if (p.facing < 0.2) continue;
      // Händelser i ett krig får årtalet framför namnet
      const text = e.partOf ? `${e.start} · ${t(e.title)}` : t(e.title);
      const w = text.length * 6.6 + 30, h = 22;
      if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) continue; // markören syns inte, då visas ingen etikett
      // Skjut etiketten inåt så att hela rutan syns
      const cx = Math.min(Math.max(p.x, w / 2 + 4), Math.max(w / 2 + 4, W - w / 2 - 4));
      const box = { x0: cx - w / 2, x1: cx + w / 2, y0: p.y - 14 - h, y1: p.y - 14 };
      if (box.y0 < 4) continue;
      if (placed.some(b => hit(box, b)) || badges.some(b => hit(box, b)) ||
          markers.some(m => m.id !== e.id && hit(box, m.box))) continue;
      placed.push(box);
      let el = pool.get(e.id);
      if (!el) {
        el = document.createElement('button');
        el.type = 'button'; el.className = 'glabel';
        el.innerHTML = `<span class="dot" style="background:${CAT[e.category]?.color}"></span>${text.replace(/</g, '&lt;')}`;
        el.addEventListener('click', () => select(e.id));
        labelsEl.append(el); pool.set(e.id, el);
      }
      el.style.transform = `translate(${cx}px, ${p.y - 12}px) translate(-50%, -100%)`;
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
