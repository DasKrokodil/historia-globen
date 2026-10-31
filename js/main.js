// Startar allt och kopplar ihop delarna:
// tidsreglaget skickar ut året → lagret väljer händelser → globen och panelen ritar om.
import { loadAll, loadReligions, loadReligionPolities, loadEmpire, loadEmpireFacts, loadEventDetails, CAT, t, symbolUrl, symbolImg, formatYear, formatEventTime, isVisibleReview, edtfSpan, edtfHasDays, dayParts } from './model.js';
import { Globe } from './globe.js';
import { Timeline, segmentName, setupYearJump, MAX_YEAR } from './timeline.js';
import { markerInfo, describeMarker } from './layers/events.js';
import { LAYERS } from './layers/index.js';
import { Panel } from './ui/panel.js';
import { FunFacts, empireStory } from './ui/funfact.js';
import { SourcesDialog } from './ui/sources.js';
import { LayerMenu } from './ui/layers.js';
import { ReligionLegend } from './ui/legend.js';
import { RoutePop } from './ui/routepop.js';
import { cluster, clusterContents, placeLabels, dotBox } from './ui/clusters.js';
import { FocusMenu } from './ui/focusmenu.js';
import { Help } from './ui/help.js';
import { FlatMap } from './ui/flatmap.js';
import { Feedback } from './ui/feedback.js';
import { createState } from './state.js';
import { LayerRegistry } from './layers/registry.js';

const $ = id => document.getElementById(id);

// Samtidigt-kortet (#120): när ett krig bryter ut visas vad mer som hände i världen
// inom några år. Allt hämtas ur händelserna, som var och en har källa.
const NEAR_YEARS = 5;
// Krig som ryms inom så här många år, med datum i edtf, följs dag för dag i fokusläget (#204)
const SHORT_WAR_YEARS = 2;
const RANK = ['draft', 'source-checked', 'two-sources'];
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
      text: { sv: `${t(war.title)} bryter ut ${formatYear(war.start)}. Samtidigt i världen:` },
    }];
  });
}

async function start() {
  const data = await loadAll();
  const globe = new Globe($('globe-canvas'));
  globe.drawBase(data.land);
  const flatMap = new FlatMap({
    root: $('flat-view'), box: $('flat-box'), canvas: $('flat-canvas'),
    zoomIn: $('flat-in'), zoomOut: $('flat-out'), reset: $('flat-reset'),
    sources: () => [globe.baseCanvas, globe.overlayCanvas],
    onToggle: open => { $('btn-flat').setAttribute('aria-pressed', String(open)); syncNameScale(); },
    // Markörerna i Platt vy (#313): klick öppnar faktarutan som på globen, etiketterna som på globen
    labels: $('flat-labels'), onSelect: id => select(id), labelText, fillLabel,
  });

  // Det gemensamma tillståndet och lagerregistret (#338)
  const state = createState();
  const registry = new LayerRegistry();
  // Det lagren får när de skapas: klotet, datan och vägar tillbaka till main.js (omritning, faktarutor)
  let glyphRaf = 0;
  const env = {
    globe, data, labelsEl: $('labels'), registry,
    refresh: () => refresh(),
    // En symbol som laddas klart ritas in på lagerbilden (en omritning per bildruta räcker)
    refreshSoon: () => { cancelAnimationFrame(glyphRaf); glyphRaf = requestAnimationFrame(() => refresh()); },
    showReligionFacts: id => showReligionFacts(id),
    showEmpireFacts: (id, polity) => showEmpireFacts(id, polity),
  };
  // Lagren anmäler sig i registret (layers/index.js), och raderna i Lager byggs ur det (före LayerMenu nedan)
  for (const make of LAYERS) registry.add(make(env));
  registry.buildMenu($('layer-menu'));
  // Lagren som main.js gör mer med än att rita: klick, fokus, listan och etiketterna
  const layer = registry.get('events'), areas = registry.get('areas'), religions = registry.get('religions'), routes = registry.get('routes');
  const panel = new Panel({
    root: $('panel'), list: $('event-list'), filters: $('filters'), detail: $('detail'),
    sub: $('panel-sub'), count: $('panel-count'), toggle: $('btn-panel'), close: $('panel-close'),
  }, data);
  const ff = new FunFacts({
    root: $('funfact'), text: $('ff-text'), events: $('ff-events'), review: $('ff-review'),
    pager: $('ff-pager'), next: $('ff-next'), srcBtn: $('ff-sources'),
    pics: $('ff-pics'), kind: $('ff-kind'), min: $('ff-min'), tab: $('ff-tab'), tabCount: $('ff-tab-count'), handle: $('ff-handle'),
  }, { funfacts: [...data.funfacts, ...warCards(data.events)], byId: data.byId, srcById: data.srcById, styles: data.styles });
  const sources = new SourcesDialog({ root: $('sources-dialog'), body: $('sources-body'), close: $('sources-close'), openBtn: $('btn-sources') }, data);

  const timeline = new Timeline({
    track: $('track'), thumb: $('thumb'), segs: $('track-segments'), ticks: $('ticks'),
    dots: $('track-dots'), ffMarks: $('track-ff'), chapters: $('track-chapters'), warMarks: $('track-war'), playBtn: $('btn-play'), playIcon: $('play-icon'), pauseNote: $('pause-note'), pauseText: $('pause-text'),
    pauseGo: $('pause-go'),
    stepBtns: document.querySelectorAll('.step[data-step]'), speedBtn: $('btn-speed'),
  });
  setupYearJump(timeline, { button: $('year-jump'), pop: $('jump-pop'), input: $('jump-input'), msg: $('jump-msg'), epochs: $('jump-epochs'), onJump: () => flyToYearHighlight() });
  // Översikten visar varje krig som en prick vid dess viktigaste händelse (top); krigets streck och slagen
  // märkta major syns först i fokusläget (#298)
  timeline.setMarks(data.events.filter(e => !e.partOf || e.top || e.major), data.funfacts, e => CAT[e.category]?.color ?? '#fff',
    e => e.kind === 'war' || (e.partOf && !e.top));

  let focusWar = null, focus = null, lastYear = 0;
  let warStops = [], stopping = false; // kö med stopp när man följer ett krig (#217)
  // Stopp som redan har visats i den här genomspelningen, och om slutkortet har visats (#232).
  // Båda glöms när tiden flyttas för hand eller man följer något annat.
  let shownStops = new Set(), endShown = false;
  // "Spela klart" (#244): uppspelningen går till krigets slut utan att pausa vid stora händelser eller
  // Samtidigt-kort, men slutkortet visas. Gäller tills uppspelningen stannar eller tiden flyttas för hand.
  let finishing = false, finishNext = false;

  // Lagerväljaren: vilka lager som syns. Raderna och startläget kommer från registret.
  const layers = new LayerMenu({ button: $('btn-layers'), menu: $('layer-menu') });
  Object.assign(state, { layers: layers.on, pause: layers.pause, calm: layers.calm });
  // Lugn rörelse (#246): också rikenas övergångar (#78) stängs av (i lagrets apply)
  globe.calm = layers.calm; layers.onCalm = on => { state.calm = globe.calm = on; registry.apply(state); };
  // Teckenförklaring och klickruta för religionslagret (#166)
  const relLegend = new ReligionLegend({ legend: $('religion-legend'), pop: $('religion-pop') });
  // Klickrutan för vägar och resor (#38); "Läs mer" öppnar den kopplade händelsen
  const routePop = new RoutePop($('route-pop'), data);
  routePop.onEvent = id => select(id);
  relLegend.onFacts = id => showReligionFacts(id);
  relLegend.onAbout = () => showAboutReligions(); // "Läs om religionerna" (#308)
  relLegend.names = new Map(data.polities.map(p => [p.name.en, p.name.sv]));
  // Visa som vanligt / Dämpa i teckenförklaringen ändrar valet "Behåll mina lager" i Lager (#235)
  relLegend.onKeep = on => { layers.set('keep', on); refresh(); };
  // Markering när man pekar (#271): musen eller tangentbordets fokus på en religion i undermenyn, i Fokus eller i
  // teckenförklaringen lyser upp religionens områden och tonar ner de andra. I mobilen trycker man på religionen i
  // teckenförklaringen (tryck i Lager och Fokus gör redan något annat); markeringen ligger kvar tills man trycker igen.
  // Ändringen ritas en gång per bildruta, så att flera händelser i rad bara ger en omritning.
  let pinnedReligion = null, wantHighlight = null, hlRaf = 0;
  const setHighlight = id => {
    wantHighlight = id ?? null;
    cancelAnimationFrame(hlRaf);
    hlRaf = requestAnimationFrame(() => {
      if (religions.highlight === wantHighlight && relLegend.pinned === pinnedReligion) return;
      religions.highlight = relLegend.highlight = wantHighlight; relLegend.pinned = pinnedReligion;
      refresh();
    });
  };
  relLegend.onPin = id => { pinnedReligion = pinnedReligion === id ? null : id; setHighlight(pinnedReligion); };
  document.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch') return;
    const el = e.target.closest?.('[data-religion]');
    setHighlight(el ? el.dataset.religion : pinnedReligion);
  });
  document.addEventListener('focusin', e => {
    const el = e.target.closest?.('[data-religion]');
    if (el) setHighlight(el.dataset.religion);
  });
  document.addEventListener('focusout', e => { if (e.target.closest?.('[data-religion]')) setHighlight(pinnedReligion); });
  // I fokusläge syns det man följer även om lagret är avslaget i menyn
  const applyLayers = () => {
    registry.apply(state);
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
      // Knappen "Läs om religionerna" överst i undermenyn öppnar faktarutan på begäran (#308)
      if (doc.religions.some(r => r.facts)) {
        const about = document.createElement('button');
        about.type = 'button'; about.className = 'info-btn rel-about';
        about.textContent = 'Läs om religionerna';
        about.addEventListener('click', () => showAboutReligions());
        $('religion-list').append(about);
      }
      // Att bocka i eller ur en religion ändrar bara lagret; menyn står kvar öppen (#308)
      layers.sublist($('religion-list'), doc.religions.map(r => ({ id: r.id, name: t(r.name), color: r.color, symbol: symbolUrl(r), info: !!r.facts })), (id, on) => {
        on ? religions.hidden.delete(id) : religions.hidden.add(id);
        refresh();
      }, id => showReligionFacts(id));
      data.religionsDoc = doc;
      refresh();
    } catch (err) {
      console.error(err);
      $('religion-list').textContent = 'Religionerna kunde inte laddas.';
      religionsLoading = false;
    }
  }

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
    state.selectedId = origin?.id ?? null;
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
  // polity = ett rike i gruppen med egen faktaruta (polityFacts, #301), till exempel Bysantinska riket; då visas
  // rikets egen ruta med dess symbol och kartdata för just det riket.
  function showEmpireFacts(id, polity = null) {
    const g = data.empireGroups.find(x => x.id === id);
    const own = polity && g?.polityFacts?.[polity.id];
    // Rikenas faktarutor laddas vid första klicket (#337); hasFacts säger att riket har en
    if (!own?.facts && g?.hasFacts && !g.facts) {
      loadEmpireFacts().then(() => showEmpireFacts(id, polity)).catch(err => console.error(err));
      return true;
    }
    const facts = own?.facts ?? g?.facts;
    if (!facts) return false;
    state.selectedId = null;
    // Ramen följer rikets tidsålder och platsen globen riktas mot i fokus
    const place = focus?.type === 'empire' && focus.id === id ? { start: g.from, _lat: focus.center[0], _lon: focus.center[1] } : null;
    const from = own ? Math.min(...polity.periods.map(p => p.start)) : g.from;
    const to = own ? Math.max(...polity.periods.map(p => p.end)) : g.to;
    // Osäker gräns (#73) gäller gruppen; inflytandet (#75) står per rike, så ett rike med egen ruta (#301) visar bara sitt
    const note = [t(facts.mapNote), own ? '' : t(g.uncertainBorder?.note),
      influenceNote(own ? { influence: g.influence?.filter(a => a.polity === polity.id) } : g)].filter(Boolean).join(' ');
    const sym = own?.symbol ? { symbol: own.symbol } : g;
    const curveId = own ? `${g.id}:${polity.id}` : g.file ? g.id : '';
    // Rikets krig (#76); ett rike med egen ruta visar krigen under sin egen tid
    const wars = own ? (g._wars ?? []).filter(w => w.end >= from && w.start <= to) : g._wars;
    // Ett försvunnet land (#72) har årtal, föregångare och efterträdare; ett land utan gräns visas som en punkt
    const lineage = g.vanished && !own ? { ...g.vanished, groups: data.empireGroups } : null;
    panel.showFacts({ kind: lineage ? 'Försvunnet land' : 'Rike', name: t(own ? polity.name : g.name), color: g.color, facts, place, curveId,
      symbol: symbolImg(sym, 'rel-sym rel-sym-h'), wars, lineage,
      mapNote: g.file ? `Gränserna på kartan kommer från Cliopatria (kartdata ${formatYearSpan(from, to)}). Fakta i rutan kommer från rutans källor.${note ? ` ${note}` : ''}` : note });
    // Ytkurvan (#77) ritas när rikets fil har laddats (den laddas ändå för kartan); för ett rike med egen
    // faktaruta (#301) visar kurvan bara det riket
    if (own) panel.setCurve(curveId, [polity], { from, to, color: g.color }, timeline.year);
    else if (g.file) loadEmpire(g).then(ps => panel.setCurve(g.id, ps, g, timeline.year)).catch(err => console.error(err));
    layers.close(); focusMenu.close();
    if (narrow.matches) panel.setOpen(false);
    refresh();
    return true;
  }
  /** Inflytandet runt riket (#75) i rutan Om kartan: lydriken och vasaller enligt Cliopatrias relationer. */
  function influenceNote(g) {
    if (!g.influence?.length) return '';
    const kind = { allegiance: 'lojalitet', vassalage: 'vasall' };
    const list = g.influence.map(a => `${t(a.name)} (${kind[a.relation] ?? a.relation}, ${formatYearSpan(a.from, a.to)})`);
    return `Glest prickade områden med streckad kant lydde enligt Cliopatria under riket utan att höra till det: ${list.join(', ')}.`;
  }
  /** Har det man följer en faktaruta? (riken och religioner med facts) */
  function focusFacts(f) {
    if (f?.type === 'empire') return !!data.empireGroups.find(x => x.id === f.id)?.hasFacts;
    if (f?.type === 'religion') return !!data.religionsDoc?.religions.find(x => x.id === f.id)?.facts;
    return false;
  }

  /** Knappen "Läs om religionerna" (#308): faktarutan för religionen man följer i Fokus, annars för den
   *  första synliga religionen som har en (tidigare visades den automatiskt när lagret slogs på, #90). */
  function showAboutReligions() {
    if (focus?.type === 'religion' && showReligionFacts(focus.id, false)) return;
    const r = data.religionsDoc?.religions.find(x => x.facts && !religions.hidden.has(x.id))
      ?? data.religionsDoc?.religions.find(x => x.facts);
    if (r) showReligionFacts(r.id);
  }

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
      // Krigets berättelse och slagens texter ligger i händelsernas långa fält (#337)
      await loadEventDetails(pts);
      // Ett kort krig följs från dess första till sista dag, och året blir ett decimaltal (#204)
      const fine = war.end - war.start <= SHORT_WAR_YEARS && edtfHasDays(war.edtf);
      const [from, to] = fine ? edtfSpan(war) : [war.start, Math.min(war.end, MAX_YEAR)]; // pågående krig slutar i dag (#223)
      f = { type, id, title: `${t(war.title)} ${formatEventTime(war)}`, short: t(war.title), from, to, fine,
        center: [pts.reduce((s, e) => s + e._lat, 0) / pts.length, pts.reduce((s, e) => s + e._lon, 0) / pts.length], zoom: 2.2 };
    } else if (type === 'empire') {
      const g = data.empireGroups.find(x => x.id === id);
      // Rikets berättelse (#171) står i faktarutan, som laddas med gränserna (#337)
      const [ps] = await Promise.all([loadEmpire(g), g.hasFacts ? loadEmpireFacts() : null]);
      areas.add(ps);
      // Globen riktas mot riket när det var som störst, och zoomar mindre för vidsträckta riken
      const periods = ps.flatMap(p => p.periods);
      const biggest = periods.reduce((a, b) => (b.areaKm2 > a.areaKm2 ? b : a), periods[0]);
      // Ett försvunnet land utan gräns (#72) har bara en punkt
      const pt = g.vanished?.point?.coordinates;
      const [lat, lon, span] = biggest ? geoCenter([biggest.geometry]) : [pt[1], pt[0], 0];
      // Årtalen är kartdatans spann i Cliopatria, inte nödvändigtvis rikets historiska årtal (#138).
      // Ett försvunnet land följs från bildandet till upplösningen enligt källorna, och kartdatan står efter (#72).
      const [from, to] = empireSpan(g);
      f = { type, id, title: `${t(g.name)} · ${empireYears(g)}`, short: t(g.name), from, to,
        center: [lat, lon], zoom: !biggest ? 2.4 : span > 150 ? 1 : span > 60 ? 1.3 : 1.8 };
    } else {
      const doc = await loadReligions();
      data.religionsDoc ??= doc;
      setReligions(doc);
      const r = doc.religions.find(x => x.id === id);
      // Fokus börjar när religionen grundades, om det finns en sådan händelse (#123)
      const first = founding(id)[0];
      const st = stated(r);
      const from = Math.min(first?.start ?? Infinity, st[0].start), to = Math.max(st.at(-1).end, first?.end ?? -Infinity);
      f = { type, id, title: `${t(r.name)} · ${religionSpan(r, first)}`, short: t(r.name), from, to,
        center: first ? [first._lat, first._lon] : geoCenter([st[0].geometry]), zoom: 1.3 };
    }
    // Året stannar om det ligger inom spannet; annars flyttas det till starten och flytten visas (#167)
    const prevYear = timeline.year, prevText = timeline.format(prevYear), keepYear = prevYear >= f.from && prevYear <= f.to;
    if (focus) endFocus(false);
    focus = state.focus = f;
    focusWar = state.focusWar = type === 'war' ? data.byId[id] : null;
    applyLayers();
    globe.flyTo(f.center[0], f.center[1], 900);
    globe.setZoom(f.zoom);
    $('focus-title').textContent = f.title;
    $('focus-facts').hidden = !focusFacts(f);
    $('focus-bar').hidden = false;
    $('app').classList.add('focusing');
    panel.setOpen(false); // listan stängs så att det man följer syns
    timeline.setFocus({ from: f.from, to: f.to, fine: !!f.fine });
    if (focusWar) timeline.setStory(warStory(focusWar));
    const startYear = keepYear ? prevYear : f.from;
    lastYear = startYear;
    timeline.year = startYear;
    showMoved(keepYear ? null : { prevYear, prevText, startYear, short: f.short, type });
    refresh();
    // Före start: varför kriget började och vilka som stred (#122)
    if (focusWar?.story) { state.selectedId = focusWar.id; panel.showStory(focusWar, 'intro'); $('app').classList.add('has-detail'); }
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
    $('focus-moved-text').textContent = `Tiden flyttades till ${timeline.format(m.startYear)}, ${why} · `;
    $('focus-moved-back').textContent = `Tillbaka till ${m.prevText}`;
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
    focus = state.focus = null; focusWar = state.focusWar = null; warStops = []; shownStops = new Set(); endShown = false; finishing = false; showMoved(null);
    applyLayers();
    $('focus-bar').hidden = true;
    $('app').classList.remove('focusing');
    timeline.setFocus(null);
    globe.setZoom(1);
    if (redraw) refresh();
  }
  const formatYearSpan = (a, b) => formatEventTime({ start: a, end: b, edtf: '' });
  /** Fokusets spann för ett rike: kartdatan, och för ett försvunnet land också källornas årtal (#72). */
  const empireSpan = g => g.vanished ? [Math.min(g.from, g.vanished.founded), Math.max(g.to, g.vanished.dissolved)] : [g.from, g.to];
  /** Årtalen i Fokus: kartdatans spann, och för ett försvunnet land först källornas årtal (#72). */
  const empireYears = g => !g.vanished ? `kartdata ${formatYearSpan(g.from, g.to)}`
    : `${formatYearSpan(g.vanished.founded, g.vanished.dissolved)} · ${g.file ? `kartdata ${formatYearSpan(g.from, g.to)}` : 'punkt på kartan'}`;

  // Fokusmenyn listar krig, riken och religioner. Religionerna hämtas när menyn öppnas.
  const focusMenu = new FocusMenu({ button: $('btn-focus'), menu: $('focus-menu') });
  // Varje post har sitt tidsspann (from–to), så att menyn kan visa det som hör till tiden man står i (#121)
  // Religionens årtal i Fokus: grundandet där det går att belägga, annars bara kartdatans spann (#138)
  // Ärvda områden (#269) räknas inte: spannet är där en faktaruta anger religionen
  const stated = r => r.snapshots.filter(s => !s.inherited);
  const religionSpan = (r, first) => {
    const st = stated(r);
    const map = `statsreligion på kartan ${formatYearSpan(st[0].start, st.at(-1).end)}`;
    return first ? `grundad ${formatEventTime(first)} · ${map}` : map;
  };
  const religionItems = doc => doc.religions.map(r => {
    const first = founding(r.id)[0];
    const st = stated(r);
    const from = Math.min(first?.start ?? Infinity, st[0].start), to = st.at(-1).end;
    return { key: `religion:${r.id}`, label: t(r.name), sub: religionSpan(r, first), color: r.color, symbol: symbolUrl(r), from, to };
  });
  const empireItems = () => data.empireGroups.filter(g => !g.vanished).map(g =>
    ({ key: `empire:${g.id}`, label: t(g.name), sub: `kartdata ${formatYearSpan(g.from, g.to)}`, color: g.color, symbol: symbolUrl(g), from: g.from, to: g.to }));
  // Försvunna länder (#72): listas alla, i tidsordning, med när de bildades och upplöstes och vad de blev
  const vanishedItems = () => data.empireGroups.filter(g => g.vanished).map(g => {
    const [from, to] = empireSpan(g);
    const names = g.vanished.successors.map(s => t(s.name).split(' (')[0]);
    const blev = names.length > 4 ? `${names.slice(0, 3).join(', ')} och ${names.length - 3} till` : names.join(', ');
    return { key: `empire:${g.id}`, label: t(g.name), sub: `${empireYears(g)} · blev ${blev}`, color: g.color, symbol: symbolUrl(g), from, to };
  });
  const focusGroups = (doc = null) => [
    { title: 'Krig', items: data.events.filter(e => e.kind === 'war').map(e => ({ key: `war:${e.id}`, label: t(e.title), sub: formatEventTime(e), color: CAT[e.category]?.color, from: e.start, to: e.end })) },
    { title: 'Riken', note: 'Gränser ur Cliopatria. Årtalen visar när kartdata finns och kan skilja sig från rikets historiska årtal. Ett kolonialvälde har samma färg överallt; stjärnan och den kraftiga kanten visar huvudlandet. En mjuk, utsuddad kant betyder att källorna säger att gränsen är osäker. Glesa prickar med streckad kant är inflytande: lydriken och vasaller enligt Cliopatria. Länder som inte finns längre står under Försvunna länder.', items: empireItems() },
    { title: 'Försvunna länder', all: true, note: 'Länder som inte finns längre: när de bildades och upplöstes enligt källorna, och vilka länder de blev. Gränser ur Cliopatria, som kan ha andra årtal.', items: vanishedItems() },
    { title: 'Religioner', note: 'Visar var religionen var officiell religion eller huvudreligion i en statsbildning, inte religionens ålder eller var alla troende bodde.', items: doc ? religionItems(doc) : [], loading: !doc },
  ];
  focusMenu.setGroups(focusGroups());
  focusMenu.onOpen = async () => {
    panel.setOpen(false); layers.close();
    // Nära = inom fyra gånger det tidslinjen visar runt året (vid 1325 cirka ±150 år)
    const year = Math.floor(timeline.year), r = Math.round(timeline.windowYears(year) * 4 / 10) * 10;
    focusMenu.setTime({ year, from: year - r, to: year + r, label: `inom ±${r} år från ${formatYear(year)}` });
    if (focusMenu.groups.find(g => g.title === 'Religioner').loading) focusMenu.setGroups(focusGroups(await loadReligions()));
  };
  focusMenu.onPick = key => startFocus(key);


  // Rikesnamnen ritas i kartbilden (beslut 1) och växer därför med globen: vid max zoom ser
  // kartbilden ca 10 gånger större ut på skärmen. Därför görs namnen mindre i bilden när man
  // zoomar in (men inte under 0,25, då blir texten för oskarp) och tonas sedan ut, så att de
  // inte täcker markörerna (#154). Värdena ändras i steg och bilden ritas om först 150 ms efter
  // att zoomandet stannat. Platt vy (och en fysisk glob) får grundstorleken.
  const zoomMag = () => { const d = globe.baseDist; return Math.max(1, (d - 1) / (d / globe.zoom - 1)); }; // förstoring i mitten av klotet
  // Religionernas namn i områdena syns bara vid nära zoom på globen, utzoomat och i Platt vy bara symbolen (#271)
  const NAMES_MAG = 2.4;
  const religionNames = () => $('flat-view').hidden && zoomMag() >= NAMES_MAG;
  // Riken med symbol (#301): utzoomat på globen bara symbolen, vid nära zoom och i Platt vy även namnet
  const empireNames = () => !$('flat-view').hidden || zoomMag() >= NAMES_MAG;
  function nameStyle() {
    if (!$('flat-view').hidden) return [1, 1];
    const mag = zoomMag();
    const scale = Math.max(0.25, Math.pow(mag, -0.7));
    const fade = Math.min(1, Math.max(0, (mag - 5) / 5)); // 0 vid mag 5 (zoom ca 2,3), 1 vid max
    return [Math.round(scale * 20) / 20, Math.round((1 - 0.5 * fade) * 20) / 20];
  }
  let nameTimer = 0;
  const syncNameScale = () => {
    clearTimeout(nameTimer);
    nameTimer = setTimeout(() => {
      const [sc, al] = nameStyle();
      const l = state.labels;
      if (l.scale !== sc || l.alpha !== al || l.religionNames !== religionNames() || l.empireNames !== empireNames()) refresh();
    }, 150);
  };
  globe.onZoom = syncNameScale;

  /**
   * Kapitel och markeringar på tidslinjen när man följer ett krig (#244). Allt kommer ur datan:
   * - Kapitel ur krigets story.chapters (namn, from, to och egna källor), om fältet finns.
   * - Annars neutrala band mellan krigets stora händelser (major eller top), märkta bara med händelsens
   *   namn ("Fram till …", och "Efter …" för det sista), så att inget kapitelnamn hittas på.
   * - En markering per händelse i kriget (större för stora, kryss för osäkert datum, samma regel som
   *   medaljerna på globen, markerInfo) och en slutpunkt där slutkortet visas.
   */
  function warStory(war) {
    const at = e => timeline.spanOf(e)[0];
    const end = warEndOf();
    const events = war._battles.filter(e => isVisibleReview(e.review));
    let bands;
    if (war.story?.chapters?.length) {
      bands = war.story.chapters.map(c => {
        // Samma tidsformat som händelserna: år, och datum i edtf för korta krig
        const [a, b] = timeline.focus?.fine && c.edtf ? edtfSpan({ start: c.from, end: c.to, edtf: c.edtf }) : [c.from, c.to];
        // I korta krig slutar spannet vid början av dagen efter, så den sista dagen visas
        const last = timeline.focus?.fine && c.edtf ? b - 0.5 / 365.25 : b;
        return { from: Math.max(a, focus.from), to: Math.min(b, end), label: t(c.title), title: `${t(c.title)} (${timeline.format(a)}–${timeline.format(last)})`, data: true };
      });
    } else {
      const majors = events.filter(e => e.major || e.top).sort((a, b) => at(a) - at(b));
      let from = focus.from;
      bands = [];
      for (const e of majors) {
        if (at(e) > from) bands.push({ from, to: at(e), label: `Fram till ${t(e.title)}`, title: `Fram till ${t(e.title)} (${timeline.format(at(e))})` });
        from = Math.max(from, at(e));
      }
      const last = majors.at(-1);
      if (last && end > from) bands.push({ from, to: end, label: `Efter ${t(last.title)}`, title: `Efter ${t(last.title)} (${timeline.format(at(last))}) till krigets slut` });
    }
    // Händelser på samma ställe (samma år, i korta krig samma dag) blir en markering med alla namn
    const groups = new Map();
    for (const e of events) {
      const k = at(e);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(e);
    }
    const marks = [...groups].map(([k, es]) => {
      const infos = es.map(e => markerInfo(e));
      const label = es.map((e, i) => `${t(e.title)}, ${timeline.format(at(e))}${infos[i].major ? ', stor händelse' : ''}${infos[i].unsure ? ', osäkert datum' : ''}`).join(' · ');
      const until = es.length === 1 ? timeline.spanOf(es[0])[1] : null;
      return { at: k, until: until != null && timeline.focus?.fine ? until : null, major: infos.some(i => i.major), unsure: infos.some(i => i.unsure), label };
    });
    // Slutpunkten: ligger en händelse där (till exempel freden) blir den en del av slutpunkten
    if (war.story) {
      const label = `${war.ongoing ? 'Läget i dag' : 'Slutkort: hur kriget slutade'}, ${timeline.format(end)}`;
      const same = marks.find(m => m.at >= end);
      if (same) Object.assign(same, { end: true, label: `${same.label} · ${label}` });
      else marks.push({ at: end, end: true, label });
    }
    return { bands, marks };
  }

  // Stopp i uppspelningen när man följer ett krig: en stor händelse eller 'end' för slutkortet (#122, #217)
  function showWarStop(stop, fine) {
    stopping = true;
    if (stop === 'end') {
      endShown = true; finishing = false; // knappen blir "Spela igen" (#232)
      timeline.pause(focusWar.ongoing ? 'Pausad: läget i dag' : 'Pausad: kriget är slut', true); state.selectedId = focusWar.id; panel.showStory(focusWar, 'summary');
    } else {
      // I smal skärm öppnas inte panelen, så att kartan syns; händelsen markeras på globen
      shownStops.add(stop.id);
      timeline.pause('Pausad vid en stor händelse i kriget', true); state.selectedId = stop.id; panel.showDetail(stop, matchMedia('(min-width: 761px)').matches);
      // Tiden står på händelsens år, i ett kort krig på dess dag (#204, #224), också när flera
      // stopp kom i samma steg eller tiden redan hade hunnit förbi händelsen.
      timeline.year = timeline.spanOf(stop)[0];
    }
    stopping = false;
    $('app').classList.toggle('has-detail', !$('detail').hidden);
    showNextPause();
  }

  /** Krigets slut i fokusläget: sista dagen eller året, och "i dag" för ett pågående krig (#223). */
  const warEndOf = () => Math.min(timeline.spanOf(focusWar)[1], MAX_YEAR);
  /** Nästa stopp som Fortsätt ska visa: kön, eller slutkortet om tiden står i krigets slut och
   *  kortet inte har visats än. Då börjar uppspelningen aldrig om före slutkortet (#232). */
  function queuedStop() {
    if (!focusWar) return null;
    if (warStops.length) return warStops[0];
    return focusWar.story && !endShown && timeline.year >= warEndOf() ? 'end' : null;
  }
  /** Nästa paus när man följer ett krig: köat stopp, nästa stora händelse (om pausen är vald) eller slutkortet. */
  function nextPause() {
    const q = queuedStop();
    if (q || !focusWar) return q;
    const y = timeline.year, at = e => timeline.spanOf(e)[0];
    // Händelser på fokusets första dag eller år räknas när uppspelningen startar där (#224)
    const ahead = e => !shownStops.has(e.id) && (at(e) > y || (at(e) === y && y === focus.from));
    const next = layers.pause.major && !finishing ? focusWar._battles.filter(b => b.major && ahead(b)).sort((a, b) => at(a) - at(b))[0] : null;
    return next ?? (focusWar.story && !endShown ? 'end' : null);
  }
  /** Raden "Nästa paus: …" vid spelknappen (#244). I smal skärm står den i pausraden. */
  function showNextPause() {
    const n = nextPause();
    const text = !n ? '' : n === 'end' ? (focusWar.ongoing ? 'läget i dag' : 'när kriget är slut')
      : `${t(n.title)} (${timeline.format(timeline.spanOf(n)[0])})`;
    for (const [el, pre] of [[$('next-pause'), 'Nästa paus: '], [$('pause-next'), 'Nästa: ']]) {
      el.hidden = !text;
      el.textContent = text ? pre + text : '';
      el.title = text ? `Nästa paus: ${text}` : '';
    }
    showWarPlay(n);
    timeline.refreshPlayLabel();
  }
  /** Raden vid spelknappen när man följer ett krig (#244): vilka pauser som är på (valen i Lager) och
   *  "Spela klart", som syns så länge det finns något att hoppa över före slutet. I smal skärm står
   *  knappen i pausraden och pauserna i knappens namn. */
  function showWarPlay(n) {
    $('war-play').hidden = !focusWar;
    const skip = !!focusWar && !!n && n !== 'end' && !finishing;
    $('wp-finish').hidden = !skip;
    $('pause-finish').hidden = !skip;
    if (!focusWar) return;
    const item = (el, on, long, short, what) => {
      el.classList.toggle('on', on);
      el.replaceChildren(`${on ? '\u25CF' : '\u25CB'} `);
      for (const [cls, txt] of [['wp-long', long], ['wp-short', short]]) {
        const sp = document.createElement('span'); sp.className = cls; sp.textContent = txt; el.append(sp);
      }
      if (!on) el.append(' (av)');
      el.title = `Pausar ${what}: ${on ? 'på' : 'av'}. Ändras under Lager.`;
    };
    item($('wp-major'), layers.pause.major, 'Krigets händelser', 'Krig', 'vid krigets stora händelser');
    item($('wp-ff'), layers.pause.focusFunfacts, 'Samtidigt', 'Samtidigt', 'vid Samtidigt-kortet');
    const pauses = `Pauser: krigets händelser ${layers.pause.major ? 'på' : 'av'}, Samtidigt ${layers.pause.focusFunfacts ? 'på' : 'av'}.`;
    for (const b of [$('wp-finish'), $('pause-finish')]) {
      b.title = `Spela klart: till krigets slut utan pauser vid stora händelser. Slutkortet visas. ${pauses}`;
      b.setAttribute('aria-label', b.title);
    }
  }
  /** Spela klart: hoppar över stoppen som väntar (utom slutkortet) och spelar till krigets slut. */
  function playToEnd() {
    for (const s of warStops) if (s !== 'end') shownStops.add(s.id);
    warStops = warStops.filter(s => s === 'end');
    finishNext = true;
    timeline.play();
  }
  $('wp-finish').addEventListener('click', playToEnd);
  $('pause-finish').addEventListener('click', playToEnd);

  // Lagerbilden (beslut 1) ritas om vid varje refresh, med lagren i registrets ritordning (Z i layers/registry.js).
  // I fokusläget dämpas påslagna lager som inte hör till det man följer (#235); "Behåll mina lager" visar dem som vanligt.
  // Under en övergång för riken (#78) ritas bara lagerbilden om, en gång per bildruta, tills övergången är klar;
  // annars ritas inget mellan refresh.
  let overlayRaf = 0;
  function drawOverlay() {
    cancelAnimationFrame(overlayRaf); overlayRaf = 0;
    const ctx = globe.overlayContext();
    registry.draw(ctx, globe.overlayCanvas.width, globe.overlayCanvas.height, state, (draw, alpha) => globe.drawFaded(draw, alpha));
    globe.commitOverlay();
    flatMap.draw(); // Platt vy ritas om med samma bilder (gör inget när den är stängd)
    if (registry.animating()) overlayRaf = requestAnimationFrame(drawOverlay);
  }

  // Händelsernas långa fält (sammanfattning, bild, källor) för det som syns laddas strax efter att man har dragit
  // dit (#337), så att faktarutan och Samtidigt-kortets bilder oftast redan finns när man klickar
  let prefetchTimer = 0;
  function prefetchDetails() {
    clearTimeout(prefetchTimer);
    prefetchTimer = setTimeout(() => {
      const evs = [...visible.map(v => v.e), ...ff.active.flatMap(f => f.events.map(id => data.byId[id]))];
      if (evs.some(e => e && !e._full)) loadEventDetails(evs).catch(err => console.warn('Händelsernas texter kunde inte laddas', err));
    }, 400);
  }

  function refresh() {
    // Namn och symboler på lagerbilden efter zoom och vy (#154, #271, #301)
    const [scale, alpha] = nameStyle();
    state.labels = { scale, alpha, religionNames: religionNames(), empireNames: empireNames() };
    // I fokusläget för korta krig är året ett decimaltal (#204). Händelser och krig får då sina
    // datum ur edtf (span), medan riken, religioner och fun facts får det hela året som förut.
    const year = timeline.year, wholeYear = Math.floor(year), fine = !!focus?.fine;
    const span = e => timeline.spanOf(e);
    // Spelade det när ritningen började? Ett nytt Samtidigt-kort kan pausa nedan, men krigets
    // stopp ska ändå visas, annars börjar Fortsätt om från krigets början (#224)
    const playing = timeline.playing;
    const window = timeline.windowYears(year);
    Object.assign(state, { year, wholeYear, fine, window, span, playing, filters: panel.filters });
    const within = fine ? `±${Math.round(window * 365.25)} dagar` : `±${Math.round(window)} år`;
    ff.story = focus?.type === 'empire' ? storyFor(focus.id) : [];
    ff.update(wholeYear, panel.filters);
    state.highlight = ff.highlightIds();
    const eventsOn = layers.on.events;
    // Alla lager väljer vad som syns (beslut 2), i registrets ordning
    visible = registry.update(state).events;
    prefetchDetails();
    panel.render(visible, wholeYear, window, eventsOn, fine ? { at: `den ${timeline.format(year)}`, within } : null);
    // Samma markörer i Platt vy (#313): de som syns på klotet, de i listan får klustras och etikett
    flatMap.setMarkers({ list: layer.sprites.filter(sp => sp.userData.active).map(sp => sp.userData),
      labeled: new Set(visible.map(v => v.e.id)), keep: ff.highlightIds(), selectedId: state.selectedId });
    panel.setCurveYear(wholeYear);
    if (routePop.route && !routes.active.some(a => a.route === routePop.route)) routePop.hide(); // vägen syns inte längre
    const legend = registry.legend(state);
    relLegend.update(legend.items ?? [], { war: !!legend.war, fadable: registry.fadable(state).map(e => e.name), keep: !!layers.on.keep,
      discovery: legend.discovery ?? null });
    if (!religions.enabled || state.faded.has('religions')) relLegend.hidePop();
    registry.markers(state);
    drawOverlay();

    // Korta krig: "22 jan" stort och året där tideräkningen annars står (#204)
    const [num, era] = timeline.formatParts(year);
    $('year-big').textContent = num;
    $('year-era').textContent = era;
    $('year-jump').classList.toggle('fine', fine);
    $('year-segment').textContent = `${focus ? `Fokus: ${focus.short}` : segmentName(year)} · visar ${within}`;
    // Passerades tiden t sedan förra ritningen? Också fokusets första dag eller år räknas,
    // när uppspelningen startar där, så att den pausar vid händelsen som inledde kriget (#204, #224)
    const passed = tt => (tt > lastYear && tt <= year) || (tt === focus?.from && lastYear === tt && year > tt);
    // I fokusläge stannar uppspelningen vid krigets viktigaste händelser
    // I slutet: hur kriget slutade och hur många som dog (#122)
    // Alla stora händelser som passerades stoppar i tur och ordning, och slutkortet kommer sist (#217).
    // Det som inte hinns med nu ligger i warStops och visas när man trycker Fortsätt.
    const warEnd = focusWar && Math.min(span(focusWar)[1], MAX_YEAR); // ett pågående krig når "i dag" (#223)
    // Kön töms bara när tiden flyttas för hand (i lyssnaren på change), inte vid varje omritning, till exempel
    // när man klickar i faktarutan eller på globen under en paus (#232)
    if (focusWar && playing) {
      const hits = layers.pause.major && !finishing ? focusWar._battles.filter(b => b.major && !shownStops.has(b.id) && passed(span(b)[0])).sort((a, b) => span(a)[0] - span(b)[0]) : [];
      const ended = focusWar.story && lastYear < warEnd && year >= warEnd;
      warStops = [...hits, ...(ended ? ['end'] : [])];
      if (warStops.length) showWarStop(warStops.shift(), fine);
    }
    // I fokus på en religion stannar uppspelningen vid händelserna när den grundades (#123)
    if (focus?.type === 'religion' && timeline.playing) {
      const hit = founding(focus.id).find(e => e.start > lastYear && e.start <= year);
      if (hit) { timeline.pause('Pausad vid religionens grundande'); state.selectedId = hit.id; panel.showDetail(hit, matchMedia('(min-width: 761px)').matches); }
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
      if (war) { timeline.pause('Pausad: ett krig bryter ut'); timeline.year = war.start; state.selectedId = war.id; panel.showDetail(war); }
    }
    lastYear = year;
    $('app').classList.toggle('has-detail', !$('detail').hidden);
    showNextPause();
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
  function select(id, jump = true) {
    state.selectedId = id;
    const e = id ? data.byId[id] : null;
    panel.showDetail(e);
    // I smal skärm stängs listan när en händelse väljs, så att faktarutan syns
    if (e && narrow.matches) panel.setOpen(false);
    if (e) {
      globe.flyTo(e._lat, e._lon);
      flatMap.reveal(e._lat, e._lon); // i Platt vy flyttas kartan dit om platsen inte syns
      // Hoppa i tiden om händelsen ligger långt bort
      if (jump && (timeline.year < e.start - 400 || timeline.year > e.end + 400)) timeline.year = e.start;
    }
    refresh();
  }

  timeline.addEventListener('change', () => {
    // Tiden flyttades för hand (året ändrades utan uppspelning och inte av ett stopp): kön med krigets
    // stopp glöms, och stoppen visas igen när man spelar på nytt (#232). Också "Spela igen" går hit.
    if (!timeline.playing && !stopping) {
      warStops = []; shownStops = new Set(); finishing = false;
      if (focusWar && timeline.year < warEndOf()) endShown = false;
    }
    refresh();
  });
  // Fortsätt efter ett stopp i ett krig: nästa stora händelse samma år, eller slutkortet,
  // i stället för att uppspelningen börjar om från krigets början (#217, #232)
  timeline.hasMore = () => !!queuedStop();
  timeline.addEventListener('beforeplay', e => {
    // Vanlig uppspelning pausar som valt i Lager; Spela klart sätter finishNext precis innan
    finishing = finishNext && !!focusWar; finishNext = false;
    const stop = queuedStop();
    if (!stop) return;
    e.preventDefault();
    if (warStops[0] === stop) warStops.shift();
    showWarStop(stop, !!focus?.fine);
  });
  panel.onSelect = select;
  panel.onFocus = id => startFocus(`war:${id}`);
  // Riken i kriget (#76) öppnar rikets faktaruta (utan faktaruta följs riket). Ett försvunnet lands
  // efterträdare eller föregångare som finns som rike (#72, follow) börjar följas direkt.
  panel.onEmpire = (id, follow = false) => (!follow && showEmpireFacts(id)) || startFocus(`empire:${id}`);
  $('focus-exit').addEventListener('click', endFocus);
  // Knappen Fakta i fokusraden öppnar rikets eller religionens faktaruta igen (#170)
  $('focus-facts').addEventListener('click', () => {
    if (focus?.type === 'empire') showEmpireFacts(focus.id);
    else if (focus?.type === 'religion') showReligionFacts(focus.id, false);
  });
  panel.onFilter = refresh;
  ff.onSelect = select;
  ff.onArcs = pairs => { globe.setArcs(pairs); flatMap.setArcs(pairs); };
  // Kortets källor (#337): rikets berättelse har egna, fun facts och krigskort ärver händelsernas, som har laddats
  // när dialogen visar dem (Om källorna laddar alla händelsers källor först)
  ff.onSources = f => sources.open(() => f.kind === 'empire' ? f.sources
    : [...new Set(f.events.flatMap(id => data.byId[id]?.sources ?? []))]);
  panel.onSources = () => sources.open(); // knappen Om källorna under (i) vid granskningsstatusen (#310)
  // Uppspelningen stannar vid en ny fun fact, så att man hinner läsa. Play fortsätter.
  // Ihopfällt kort: ingen paus, eftersom kortet inte syns
  // I fokusläget pausar uppspelningen som standard bara vid det man följer; Samtidigt-pausen är där ett eget val (#234)
  ff.onNew = () => {
    const on = focus ? layers.pause.focusFunfacts : layers.pause.funfacts;
    if (timeline.playing && on && !ff.minimized && !finishing) timeline.pause('Pausad vid ett nytt Samtidigt-kort');
  };
  // Raden "Nästa paus" följer pausvalen i Lager
  $('layer-menu').addEventListener('change', e => { if (e.target.dataset.pause) showNextPause(); });
  sources.onSettings = refresh;

  // Mobilpanelen (#239): när man drar i globen stängs Samtidigt-kortet, så att globen syns. Ett tryck räknas inte.
  {
    const canvas = $('globe-canvas');
    let down = null;
    canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
    canvas.addEventListener('pointermove', e => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 12) { down = null; ff.autoClose(); }
    });
    for (const type of ['pointerup', 'pointercancel']) canvas.addEventListener(type, () => { down = null; });
  }

  let popClick = 0; // räknar klick, så att en sen klickruta inte visas efter ett nytt klick
  // Klick nära en väg eller resa som syns (#38) visar klickrutan. Sant om en väg träffades.
  const routeClick = (ll, x, y) => {
    const rh = ll && routes.enabled && routes.hitTest(ll.lon, ll.lat);
    if (rh) routePop.show(rh, x, y);
    return !!rh;
  };
  // I Platt vy: klick bredvid markörerna (#38)
  flatMap.onMapClick = (ll, x, y) => {
    relLegend.hidePop(); routePop.hide(); popClick++;
    routeClick(ll, x, y);
  };
  globe.onClick = (x, y) => {
    const hit = globe.pick(x, y, layer.sprites.filter(s => s.visible));
    relLegend.hidePop(); routePop.hide(); popClick++;
    select(hit ? hit.userData.event.id : null);
    // Händelsemarkörer har företräde, sedan vägar och resor (de ritas ovanpå områdena)
    if (!hit && routes.active.length && routeClick(globe.pickLatLon(x, y), x, y)) return;
    // Annars: vilken religion ligger under klicket? (#166)
    if (!hit && religions.enabled && !state.faded.has('religions') && religions.active.length) {
      const ll = globe.pickLatLon(x, y);
      const rh = ll && religions.hitTest(ll.lon, ll.lat);
      if (rh) showReligionPop(rh, ll, x, y);
    }
  };
  // Riket på just den platsen (#194): rikenas gränser laddas vid det första klicket.
  // Ett senare klick vinner om laddningen hinner bli klar efter det.
  let religionPolitiesReady = false;
  async function showReligionPop(rh, ll, x, y) {
    const n = popClick;
    // Första gången tar laddningen en stund: rutan visas direkt och fylls i när riket är känt
    const waiting = !religionPolitiesReady;
    if (waiting) relLegend.showPop({ ...rh, loading: true }, x, y);
    try {
      rh.here = religions.polityAt(rh, ll.lon, ll.lat, (await loadReligionPolities()).polities);
      religionPolitiesReady = true;
    } catch (err) {
      console.warn(err); // utan rikenas gränser visas rikena i området, som förut
    }
    if (n === popClick && !(waiting && relLegend.pop.hidden)) relLegend.showPop(rh, x, y); // inte om rutan stängdes under tiden
  }

  // Platt vy (#292): världen som en platt karta för skärmar, med zoom och panorering.
  // Tidslinjen, Samtidigt, Lager och Fokus fungerar som vanligt medan den är öppen.
  $('btn-flat').addEventListener('click', () => flatMap.setOpen(flatMap.hidden));
  // Escape stänger Platt vy, men först det som ligger ovanpå (menyer, Hjälp, förslagsformuläret, panelen, faktarutan)
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || flatMap.hidden) return;
    const open = ['help', 'feedback', 'layer-menu', 'focus-menu', 'sources-dialog', 'jump-pop', 'detail', 'religion-pop', 'route-pop'].some(id => !$(id).hidden);
    if (open || $('app').classList.contains('panel-open')) return;
    flatMap.setOpen(false);
    $('btn-flat').focus({ preventScroll: true });
  }, { capture: true });

  layers.onChange = async (name, on) => {
    applyLayers(); refresh();
    // Lagret slås bara på: menyn står kvar öppen och ingen faktaruta öppnas (#308). Första gången
    // visar teckenförklaringen en tipsrad; faktarutan finns bakom knappen "Läs om religionerna".
    if (name === 'religions') relLegend.setHint(on);
    await ensureReligions();
  };
  // Nyckelår i rikets och religionens faktaruta hoppar dit i tiden
  panel.onYear = year => { timeline.year = year; };

  // Rikenas namn ritas med IM Fell English, rita om när typsnittet har laddats
  document.fonts?.ready.then(refresh);

  // Menyerna uppe till höger: bara en åt gången
  panel.onOpen = () => { layers.close(); focusMenu.close(); };
  layers.onOpen = () => { panel.setOpen(false); focusMenu.close(); };

  // Etikettens text och beskrivning, samma på globen och i Platt vy (#313).
  // Händelser i ett krig får årtalet framför namnet, i ett kort krig datumet (#204)
  function labelText(e) {
    return !e.partOf ? t(e.title) : `${focus?.fine ? dayParts(edtfSpan(e)[0])[0] : formatYear(e.start)} · ${t(e.title)}`;
  }
  function fillLabel(el, e, text) {
    if (el._text !== text) { // texten byts när fokusläget för ett kort krig börjar eller slutar
      el._text = text;
      el.innerHTML = `<span class="dot" style="background:${CAT[e.category]?.color}"></span>${text.replace(/</g, '&lt;')}`;
    }
    // Samma betydelse som medaljen, i ord (#242): tidsläge, betydelse och osäkerhet
    const desc = `${t(e.title)}, ${formatEventTime(e)}: ${describeMarker(markerInfo(e, layer.state.get(e.id)?.when))}`;
    if (el._desc !== desc) { el._desc = desc; el.setAttribute('aria-label', desc); el.title = desc; }
  }

  // Etiketter för synliga händelser, utan överlapp
  const labelsEl = $('labels');
  const pool = new Map();
  const clusterPool = [];
  // Hovring (#242): markören under musen får alltid sin etikett, även när den annars skulle krocka med en annan
  let hoverId = null;
  {
    const canvas = $('globe-canvas');
    // Pekar man på ett religionsområde visas religionens symbol och namn i en liten ruta före klick (#271)
    const tip = $('religion-tip');
    let tipRaf = 0;
    const religionTip = (x, y) => {
      cancelAnimationFrame(tipRaf);
      tipRaf = requestAnimationFrame(() => {
        const on = religions.enabled && !state.faded.has('religions') && religions.active.length && relLegend.pop.hidden;
        const ll = on && globe.pickLatLon(x, y);
        relLegend.showTip(tip, ll ? religions.hitTest(ll.lon, ll.lat) : null, x, y);
      });
    };
    const hideTip = () => { cancelAnimationFrame(tipRaf); tip.hidden = true; };
    canvas.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || e.buttons) { hoverId = null; canvas.classList.remove('on-marker'); hideTip(); return; }
      const hit = globe.pick(e.clientX, e.clientY, layer.sprites.filter(s => s.visible));
      hoverId = hit ? hit.userData.event.id : null;
      canvas.classList.toggle('on-marker', !!hit);
      if (hit) hideTip(); else religionTip(e.clientX, e.clientY);
    });
    canvas.addEventListener('pointerleave', () => { hoverId = null; canvas.classList.remove('on-marker'); hideTip(); });
    canvas.addEventListener('pointerdown', hideTip);
  }
  globe.onFrame(now => {
    // Lagrens 3D-markörer: storlek på skärmen och plats (händelsernas medaljer, religionernas och rikenas symboler)
    registry.frame(now, state);
    const hl = ff.highlightIds();
    const order = [...visible].sort((a, b) =>
      ((b.e.id === state.selectedId) - (a.e.id === state.selectedId)) || ((b.e.id === hoverId) - (a.e.id === hoverId)) ||
      (hl.has(b.e.id) - hl.has(a.e.id)) || (b.activity - a.activity));
    // Klustra händelser som ligger nära varandra på skärmen (#26)
    const items = order.map(v => ({ e: v.e, p: globe.project(v.e._pos), keep: v.e.id === state.selectedId || hl.has(v.e.id) }));
    const { singles, clusters } = cluster(items.filter(it => it.p.facing > 0.05));
    const clustered = new Set(clusters.flatMap(c => c.members.map(m => m.e.id)));
    // Händelsen där en religion uppstod ligger under religionens symbol (#271): bara symbolen och etiketten syns
    const underOrigin = registry.coveredEvents();
    for (const s of layer.sprites) s.visible = s.userData.active && !clustered.has(s.userData.event.id) && !underOrigin.has(s.userData.event.id);
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
      // Ringen visar kategorierna i klungan, och texten säger vad den innehåller (#243). Siffran står kvar i mitten.
      const key = c.members.map(m => m.e.id).join();
      if (el._key !== key) {
        el._key = key;
        el._members = c.members;
        const { text, ring } = clusterContents(c.members, CAT, t);
        el.textContent = String(c.members.length);
        el.style.setProperty('--ring', ring);
        el.setAttribute('aria-label', `${c.members.length} händelser nära varandra: ${text}. Zooma in.`);
        el.dataset.contents = text; // syns under klungan vid hovring och fokus (CSS)
        el.title = `${c.members.slice(0, 8).map(m => t(m.e.title)).join(', ')}${c.members.length > 8 ? ' …' : ''}`;
      }
      el.style.transform = `translate(${c.x}px, ${c.y}px) translate(-50%, -50%)`;
      el.hidden = false;
    });
    for (let i = clusters.length; i < clusterPool.length; i++) clusterPool[i].hidden = true;
    // Etiketterna får inte hamna utanför skärmen eller ovanpå andra markörer och klusterbrickor (#142).
    // Samma regel i Platt vy (placeLabels i ui/clusters.js, #313).
    const W = globe.canvas.clientWidth, H = globe.canvas.clientHeight;
    const pxOf = e => layer.byId.get(e.id)?.userData.px;
    const markers = items.filter(it => it.p.facing > 0.05 && !clustered.has(it.e.id)).map(it => ({ id: it.e.id, box: dotBox(it.p.x, it.p.y, Math.max(9, (pxOf(it.e) ?? 18) / 2)) }));
    const badges = clusters.map(c => dotBox(c.x, c.y, 16));
    // Knapparna och raderna längst ner ligger alltid över globen (#318), och i smal skärm också rubriken, årtalet,
    // knappgrupperna och teckenförklaringen (#289): etiketter som skulle hamna under dem visas inte.
    // Rutorna räknas om i canvasens koordinater.
    const blocked = [];
    {
      const c = globe.canvas.getBoundingClientRect();
      for (const el of document.querySelectorAll(narrowView.matches ? `${UI_OVER_GLOBE}, ${UI_BOTTOM}` : UI_BOTTOM)) {
        if (el.hidden || !el.offsetParent) continue;
        const r = el.getBoundingClientRect();
        if (r.width) blocked.push({ x0: r.left - c.left - 4, x1: r.right - c.left + 4, y0: r.top - c.top - 4, y1: r.bottom - c.top + 4 });
      }
    }
    const seen = new Set();
    for (const { e, p, text, x, y } of placeLabels(singles, { W, H, hoverId, markers, badges, blocked, text: labelText, pxOf })) {
      let el = pool.get(e.id);
      if (!el) {
        el = document.createElement('button');
        el.type = 'button'; el.className = 'glabel';
        el.addEventListener('click', () => select(e.id));
        labelsEl.append(el); pool.set(e.id, el);
      }
      fillLabel(el, e, text);
      el.classList.toggle('glabel-hover', e.id === hoverId);
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
      el.style.opacity = String(Math.min(1, (p.facing - 0.2) * 4));
      el.hidden = false;
      seen.add(e.id);
    }
    for (const [id, el] of pool) if (!seen.has(id)) el.hidden = true;
  });

  $('loading').hidden = true;
  // Kort hjälp för nya besökare (#245), när globen har laddats
  const help = new Help({ root: $('help'), button: $('btn-help'), close: $('help-close') });
  help.showFirstTime();
  // Besökarnas förslag (docs/feedback.md): från Hjälp och från faktarutans "Rapportera faktafel"
  const feedback = new Feedback($('feedback'));
  $('help-feedback').addEventListener('click', () => { help.close(false); feedback.open({ opener: $('btn-help') }); });
  panel.onReport = (e, btn) => feedback.open({ opener: btn, event: e });
  timeline.init(1325);
  globe.flyTo(34, -50, 1600);
  globe.autoRotate = false;
}

const narrowView = matchMedia('(max-width: 760px)');
const UI_OVER_GLOBE = '.brand, #year-jump, #year-segment, .action-group, #religion-legend';
const UI_BOTTOM = '.timebar .controls > *, #war-play, #pause-note, #focus-bar';

/** Korten ovanför fokusraden (#183): fokusraden växer när raden "Tiden flyttades" syns och flyttas upp när pausraden
 *  syns, så CSS får höjden som --focus-top (avstånd från sidans underkant till fokusradens ovankant). */
function trackFocusBar() {
  const app = $('app'), bar = $('focus-bar');
  const update = () => {
    const on = !bar.hidden && bar.offsetHeight > 0;
    app.classList.toggle('focus-var', on);
    if (on) app.style.setProperty('--focus-top', `${Math.round(window.innerHeight - bar.getBoundingClientRect().top)}px`);
  };
  new ResizeObserver(update).observe(bar);
  new MutationObserver(update).observe(app, { attributes: true, attributeFilter: ['class'], subtree: true });
  window.addEventListener('resize', update);
  update();
}
trackFocusBar();

// Safari på iPad och iPhone: stoppa nypgesten som zoomar hela sidan. Globen zoomar själv med pekhändelser,
// som inte påverkas. En inzoomad sida gick annars inte att zooma ut, eftersom globen fångar fingrarna (#191).
for (const type of ['gesturestart', 'gesturechange']) document.addEventListener(type, e => e.preventDefault(), { passive: false });

start().catch(err => {
  console.error(err);
  $('loading').textContent = `Globen kunde inte starta: ${err.message}`;
});
