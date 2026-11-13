// Startar allt och kopplar ihop delarna:
// tidsreglaget skickar ut året → lagret väljer händelser → globen och panelen ritar om.
// Ansvaret ligger i js/controllers/ (#402): val av händelse, fokusläget, faktarutor om riken och religioner,
// omritningen, uppspelningens pauser, krigets berättelse och etiketterna. Här skapas delarna och kopplas ihop.
import { loadAll, loadAllEventDetails, loadReligionPolities, loadRoutes, loadSources, t, formatYear, formatEventTime, isVisibleReview, CAT } from './model.js';
import { buildIndex, search as searchIndex } from './search-index.js';
import { placeSuggestions, eventsNear, RADIUS_KM } from './place-search.js';
import { applyStatic, setupLangPicker, takeReturnYear, LANG_INFO, ui } from './i18n.js';
import { Globe } from './globe.js';
import { Timeline, setupYearJump } from './timeline.js';
import { LAYERS } from './layers/index.js';
import { hasTag } from './layers/events.js';
import { Panel } from './ui/panel.js';
import { FunFacts } from './ui/funfact.js';
import { SourcesDialog } from './ui/sources.js';
import { LayerMenu, loadViews } from './ui/layers.js';
import { ReligionLegend, EmpireLegend } from './ui/legend.js';
import { RoutePop } from './ui/routepop.js';
import { Help } from './ui/help.js';
import { Quiz } from './ui/quiz.js';
import { Hunt, loadMissions } from './ui/uppdrag.js';
import { Intro, loadIntro } from './ui/intro.js';
import { TourPlayer, loadTours } from './ui/tour.js';
import { LessonMode } from './ui/lesson.js';
import { FlatMap } from './ui/flatmap.js';
import { downloadPoster } from './ui/poster.js';
import { Feedback } from './ui/feedback.js';
import { Sheet } from './ui/sheet.js';
import { ViewMenu, ExtraMenu } from './ui/viewmenu.js';
import { ViewMode } from './ui/viewmode.js';
import { createStore, toJSON, timeLock } from './state.js';
import { LayerRegistry } from './layers/registry.js';
import { createSelection } from './controllers/selection.js';
import { createFacts } from './controllers/facts.js';
import { createFocus } from './controllers/focus.js';
import { createRender } from './controllers/render.js';
import { createPlayback } from './controllers/playback.js';
import { createRange } from './controllers/range.js';
import { createLabels } from './controllers/labels.js';
import { createAddress } from './controllers/address.js';
import { createJumpBack } from './controllers/jump-back.js';
import { createSurfaces } from './surfaces.js';

const $ = id => document.getElementById(id);

// Samtidigt-kortet (#120): när ett krig bryter ut visas vad mer som hände i världen
// inom några år. Allt hämtas ur händelserna, som var och en har källa.
const NEAR_YEARS = 5;
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
      // Texten på valt språk (#1240); språkbyte laddar om sidan, så den byggs en gång
      text: { sv: ui('ff.warStarts', { war: t(war.title), year: formatYear(war.start) }) },
    }];
  });
}

async function start() {
  // Språket (#63): sidans fasta texter på valt språk innan något annat skriver i dem
  applyStatic();
  $('lang-note').hidden = !!LANG_INFO.complete;
  // Presentationsläget är avsiktligt bara en delbar adressparameter. Det sparar inget val och
  // påverkar därför inte nästa besök utan parametern.
  const presentation = new URLSearchParams(location.search).get('presentation') === '1';
  const presentationExit = $('presentation-exit');
  $('app').classList.toggle('presentation-mode', presentation);
  presentationExit.hidden = !presentation;
  if (presentation) {
    const exit = new URL(location.href);
    exit.searchParams.delete('presentation');
    presentationExit.href = `${exit.pathname}${exit.search}${exit.hash}`;
  }
  // Lagrens grupper och förinställda vyer (#357) är en liten fil; den hämtas samtidigt med resten
  const [data, views, introData, toursData] = await Promise.all([loadAll(), loadViews(), loadIntro(), loadTours()]);
  const globe = new Globe($('globe-canvas'), $('year-jump'));
  globe.addZoomSurface($('labels')); // etiketterna ovanpå klotet: nypning och mushjul zoomar globen, inte sidan
  globe.drawBase(data.land);
  const flatMap = new FlatMap({
    root: $('flat-view'), box: $('flat-box'), canvas: $('flat-canvas'),
    zoomIn: $('flat-in'), zoomOut: $('flat-out'), reset: $('flat-reset'),
    sources: () => [globe.baseCanvas, globe.overlayCanvas],
    onToggle: open => {
      app.viewMode?.sync();
      globe.setFlatView(open); // Platt vy behåller 4096 × 2048 även när mobilens glob är mindre (#390)
      app.syncNameScale(); app.refresh();
    },
    // Markörerna i Platt vy (#313): klick öppnar faktarutan som på globen, etiketterna som på globen
    labels: $('flat-labels'), onSelect: id => app.select(id), labelText: (...a) => app.labelText(...a), fillLabel: (...a) => app.fillLabel(...a),
  });
  const poster = views?.poster;
  const posterButton = $('flat-poster');
  posterButton.hidden = !poster;
  if (poster) {
    posterButton.textContent = ui('poster.button');
    posterButton.title = ui('poster.button');
    posterButton.setAttribute('aria-label', ui('poster.button'));
  }

  // Det gemensamma tillståndet och lagerregistret (#338)
  // Åtgärder och prenumeration (#403): tidslinjen äger året, övriga val ändras med store.set…
  const store = createStore();
  const state = store.state;
  const registry = new LayerRegistry();
  // Det delade underlaget för controllerna (#402): komponenterna och funktionerna som de kopplas ihop med.
  // Funktionerna fylls i när varje controller skapas längre ner; anropen sker först efter starten.
  const narrow = matchMedia('(max-width: 760px)');
  const app = { $, data, views, state, store, registry, globe, flatMap, narrow, surfaces: createSurfaces() }; // surfaces: stängregistret (#894)
  // Hela tillståndet som JSON (#403): år, kamera, fokus, lager, kategorier och Lugn rörelse. Används av #64/#501.
  app.snapshot = () => toJSON(state, globe.view);
  // Det lagren får när de skapas: klotet, datan och vägar tillbaka till main.js (omritning, faktarutor)
  let glyphRaf = 0;
  const env = {
    globe, data, labelsEl: $('labels'), registry,
    refresh: () => app.refresh(),
    // En symbol som laddas klart ritas in på lagerbilden (en omritning per bildruta räcker)
    refreshSoon: () => { cancelAnimationFrame(glyphRaf); glyphRaf = requestAnimationFrame(() => app.refresh()); },
    showReligionFacts: id => app.showReligionFacts(id),
    showEmpireFacts: (id, polity) => app.showEmpireFacts(id, polity),
  };
  // Lagren anmäler sig i registret (layers/index.js), och raderna i Lager byggs ur det (före LayerMenu nedan)
  for (const make of LAYERS) registry.add(make(env));
  registry.buildMenu($('layer-menu'), views?.groups);
  // Lagren som main.js gör mer med än att rita: klick, fokus, listan och etiketterna
  const layer = registry.get('events'), areas = registry.get('areas'), religions = registry.get('religions'), routes = registry.get('routes');
  const panel = new Panel({
    root: $('panel'), list: $('event-list'), filters: $('filters'), chips: $('panel-filters'), detail: $('detail'),
    sub: $('panel-sub'), count: $('panel-count'), toggle: $('btn-panel'), close: $('panel-close'),
  }, data, { empireLegend: views?.empireLegend, uncertainty: views?.uncertainty, panel: views?.panel, tags: views?.tags });
  const ff = new FunFacts({
    root: $('funfact'), text: $('ff-text'), events: $('ff-events'), review: $('ff-review'),
    pager: $('ff-pager'), next: $('ff-next'), srcBtn: $('ff-sources'),
    pics: $('ff-pics'), kind: $('ff-kind'), min: $('ff-min'), tab: $('ff-tab'), tabCount: $('ff-tab-count'), handle: $('ff-handle'), status: $('screen-reader-status'),
  }, { funfacts: [...data.funfacts, ...warCards(data.events)], byId: data.byId, srcById: data.srcById, styles: data.styles, surprise: $('ff-surprise') });
  // Smal skärm (#361): faktarutan som ark nedifrån med tre lägen, och mobilmenyn (#530): Samtidigt och Meny i raden överst
  const detailSheet = new Sheet($('detail'));
  const viewMenu = new ViewMenu({ toggle: $('more-toggle'), menu: $('more-menu'), keep: $('btn-panel'), label: t(views?.menu?.label) });
  const extraMenu = new ExtraMenu({ toggle: $('btn-more'), menu: $('extra-menu') });
  const sources = new SourcesDialog({ root: $('sources-dialog'), body: $('sources-body'), close: $('sources-close'), openBtn: $('btn-sources') }, data);

  const timeline = new Timeline({
    track: $('track'), thumb: $('thumb'), segs: $('track-segments'), ticks: $('ticks'),
    dots: $('track-dots'), ffMarks: $('track-ff'), chapters: $('track-chapters'), warMarks: $('track-war'), markNote: $('timeline-mark-note'), playBtn: $('btn-play'), playIcon: $('play-icon'), pauseNote: $('pause-note'), pauseText: $('pause-text'),
    pauseGo: $('pause-go'), status: $('screen-reader-status'),
    stepBtns: document.querySelectorAll('.step[data-step]'), speedBtn: $('btn-speed'),
  });
  // Tidslåset (#1322): reglaget låses i en tur, och i en lektion stannar det inom lektionens år (timeLock i js/state.js)
  timeline.lock = () => timeLock(store.state.modes, app.lesson?.lock?.years ?? null);
  store.subscribe(({ type }) => { if (type === 'mode') timeline.syncLock(); });
  ff.setSurpriseRange(() => timeline.focus);
  const yearJump = setupYearJump(timeline, {
    button: $('year-jump'), pop: $('jump-pop'), input: $('jump-input'), msg: $('jump-msg'), epochs: $('jump-epochs'),
    events: data.events, onJump: () => { app.range?.close(); app.orientToPanelHighlight(); }, // ett hopp till ett år stänger intervallet (#755)
    onSelect: id => app.select(id, false), // raderna i datumresultatet (#590); året är redan rätt
    onOpen: () => app.surfaces.opened('jump'), // årshoppet och intervallformuläret stänger varandra (#1141)
  });
  app.surfaces.register('jump', 'popover', () => yearJump.close(), { isOpen: () => !$('jump-pop').hidden, opener: $('year-jump') });


  // Lagerväljaren: vilka lager som syns. Raderna och startläget kommer från registret.
  const layers = new LayerMenu({ button: $('btn-layers'), menu: $('layer-menu'),
    views: views && { ...views, controlled: registry.viewLayers(views.groups),
      tagCount: tag => data.events.filter(e => hasTag(e, tag) && isVisibleReview(e.review)).length } });
  // En vy med tagg (#555), till exempel Framsteg, visar bara händelser med taggen
  layers.onTag = tag => { store.setTag(tag); panel.tag = tag; app.refresh?.(); };
  // Första besöket börjar i den vy som datan utser. En delad länk ställs in efteråt och får alltid företräde.
  if (views?.defaultView) layers.applyView(views.defaultView);
  // Raden "Översikt: ett urval … Visa alla" (#1139) gör samma sak som Standard i Lager: alla händelser, samma lager
  panel.onShowAllEvents = () => layers.applyView('standard');
  panel.onEnableEvents = () => {
    layers.set('events', true);
    layers.onChange('events', true);
  };
  state.pause = layers.pause;
  store.setLayers(layers.on); store.setCalm(layers.calm);
  // Lugn rörelse (#246): också rikenas övergångar (#78) stängs av (i lagrets apply)
  globe.setCalm(layers.calm); layers.onCalm = on => { store.setCalm(on); globe.setCalm(on); registry.apply(state); };
  // Teckenförklaring och klickruta för religionslagret (#166)
  const relLegend = new ReligionLegend({ legend: $('religion-legend'), pop: $('religion-pop') });
  relLegend.empireLegend = views?.empireLegend ?? {};
  // Rikesförklaringen öppnas från Lager, aldrig automatiskt när Riken är på (#437, #427).
  const empireLegend = new EmpireLegend({ legend: $('empire-legend') });
  const empireLegendButton = document.createElement('button');
  empireLegendButton.type = 'button';
  empireLegendButton.className = 'link-btn empire-legend-button';
  empireLegendButton.textContent = views?.empireLegend?.show ?? 'Vilket rike?';
  empireLegendButton.setAttribute('aria-controls', 'empire-legend');
  empireLegendButton.setAttribute('aria-expanded', 'false');
  // Knappen hör till Lagermenyns första nivå: Riken kan vara på i en färdig vy utan att
  // besökaren först behöver öppna ”Anpassa själv” för att hitta förklaringen (#437).
  $('layer-menu').querySelector('.view-chips')?.after(empireLegendButton);
  // Klickrutan för vägar och resor (#38); "Läs mer" öppnar den kopplade händelsen
  const routePop = new RoutePop($('route-pop'), data);
  routePop.onEvent = id => app.select(id);
  relLegend.onFacts = id => app.showReligionFacts(id);
  relLegend.onAbout = () => app.showAboutReligions(); // "Läs om religionerna" (#308)
  relLegend.names = new Map(data.polities.map(p => [p.name.en, t(p.name)]));
  // Visa som vanligt / Dämpa i teckenförklaringen ändrar valet "Behåll mina lager" i Lager (#235)
  relLegend.onKeep = on => { layers.set('keep', on); app.refresh(); };
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
      app.refresh();
    });
  };
  relLegend.onPin = id => { pinnedReligion = pinnedReligion === id ? null : id; setHighlight(pinnedReligion); };
  let pinnedEmpire = null, wantEmpireHighlight = null, empireHlRaf = 0;
  const setEmpireHighlight = id => {
    wantEmpireHighlight = id ?? null;
    cancelAnimationFrame(empireHlRaf);
    empireHlRaf = requestAnimationFrame(() => {
      if (areas.highlight === wantEmpireHighlight && empireLegend.pinned === pinnedEmpire) return;
      areas.highlight = empireLegend.highlight = wantEmpireHighlight; empireLegend.pinned = pinnedEmpire;
      app.refresh();
    });
  };
  empireLegend.onPin = id => { pinnedEmpire = pinnedEmpire === id ? null : id; setEmpireHighlight(pinnedEmpire); };
  empireLegend.onClose = () => {
    empireLegend.setVisible(false);
    empireLegendButton.setAttribute('aria-expanded', 'false');
    pinnedEmpire = null; setEmpireHighlight(null);
    // Klick i rutan ligger utanför Lager och kan stänga menyn före ×-klicket. Välj
    // därför alltid den knapp som faktiskt syns, och upprepa fokus efter omritningen.
    const returnFocus = () => ($('layer-menu').hidden ? $('btn-layers') : empireLegendButton);
    returnFocus().focus({ preventScroll: true });
    requestAnimationFrame(() => returnFocus().focus({ preventScroll: true }));
  };
  empireLegendButton.addEventListener('click', () => {
    const open = !$('empire-legend').hidden;
    if (open) empireLegend.onClose();
    else {
      // Menyn ligger ovanpå kartan i mobil. Stäng den först, så att rikesrutan inte öppnas bakom den.
      app.surfaces.closeGroup('meny', 'focus'); // bara Lager-menyn (Fokus-menyn ligger kvar som förut)
      empireLegend.setVisible(true); empireLegendButton.setAttribute('aria-expanded', 'true');
    }
  });
  document.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch') return;
    const religion = e.target.closest?.('[data-religion]');
    const empire = e.target.closest?.('[data-empire]');
    setHighlight(religion ? religion.dataset.religion : pinnedReligion);
    setEmpireHighlight(empire ? empire.dataset.empire : pinnedEmpire);
  });
  document.addEventListener('focusin', e => {
    const religion = e.target.closest?.('[data-religion]');
    const empire = e.target.closest?.('[data-empire]');
    if (religion) setHighlight(religion.dataset.religion);
    if (empire) setEmpireHighlight(empire.dataset.empire);
  });
  document.addEventListener('focusout', e => {
    if (e.target.closest?.('[data-religion]')) setHighlight(pinnedReligion);
    if (e.target.closest?.('[data-empire]')) setEmpireHighlight(pinnedEmpire);
  });
  // I fokusläge syns det man följer även om lagret är avslaget i menyn
  const applyLayers = () => {
    registry.apply(state);
    ff.enabled = layers.on.funfacts;
  };
  applyLayers();
  // Controllerna (#402). Ordningen följer den gamla main.js, så att lyssnarna kopplas i samma ordning.
  Object.assign(app, { timeline, panel, ff, layers, relLegend, empireLegend, empireLegendButton, routePop, applyLayers });
  const selection = createSelection(app);
  const facts = createFacts(app);
  Object.assign(app, { select: selection.select, orientToPanelHighlight: selection.orientToPanelHighlight,
    ensureReligions: facts.ensureReligions, setReligions: facts.setReligions, showReligionFacts: facts.showReligionFacts,
    showEmpireFacts: facts.showEmpireFacts, showAboutReligions: facts.showAboutReligions });
  const focusCtl = createFocus(app);
  // Ögonblicksbilden från före ett läge (#893): det som en utgång kan återställa (MODE_RULES i js/state.js)
  app.modeSnapshot = () => {
    const controlled = registry.viewLayers(views?.groups);
    return {
      year: timeline.year, // står alltid kvar vid utgången, men finns med så att bilden är hel
      layers: Object.fromEntries(controlled.map(l => [l, !!layers.on[l]])),
      focus: state.focus ? `${state.focus.type}:${state.focus.id}` : null,
      camera: globe.view,
      tag: state.tag ?? null, // vyns urval (till exempel Översikt, #1139): lektionen släpper det och utgången återställer det
      filters: [...panel.filters],
    };
  };
  // Fokus (att följa ett krig, rike, en religion eller resa) stoppas av lektionsläget (#795) och av de andra lägen som
  // tabellen MODE_RULES i js/state.js säger (#893): en länk i en faktaruta eller en gammal adress kan inte släppa låset
  const startFocus = key => (store.canEnter('fokus') ? focusCtl.startFocus(key) : Promise.resolve(false));
  Object.assign(app, { startFocus, endFocus: focusCtl.endFocus, founding: focusCtl.founding, focusMenu: focusCtl.focusMenu, showThemeCard: focusCtl.showThemeCard, showPlaceCard: focusCtl.showPlaceCard });
  const render = createRender(app);
  Object.assign(app, { render, refresh: render.refresh, syncNameScale: render.syncNameScale, storyFor: render.storyFor });
  const jumpBack = createJumpBack(app);
  ff.onSurprise = fact => jumpBack.run(() => {
    timeline.pause();
    timeline.year = fact.show[0];
    app.refresh();
    app.orientToPanelHighlight();
  }, $('ff-surprise'));

  const labels = createLabels(app);
  Object.assign(app, { labelText: labels.labelText, fillLabel: labels.fillLabel });

  app.playback = createPlayback(app);
  // Tidsintervallet (#755): läget 'intervall' i lägeskontraktet, med formuläret i årshoppet och raden under årtalet
  app.range = createRange(app);

  panel.onSelect = (...a) => app.select(...a);
  panel.onFocus = id => app.startFocus(`war:${id}`);
  // Riken i kriget (#76) öppnar rikets faktaruta (utan faktaruta följs riket). Ett försvunnet lands
  // efterträdare eller föregångare som finns som rike (#72, follow) börjar följas direkt.
  // I lektionsläget (#795) följs ingenting: ett rike öppnar bara sin faktaruta
  panel.onEmpire = (id, follow = false) => ((!follow || app.lesson?.active) && app.showEmpireFacts(id)) || app.startFocus(`empire:${id}`);
  $('focus-exit').addEventListener('click', () => {
    const theme = state.focus?.type === 'theme' || state.focus?.type === 'place';
    app.endFocus();
    if (theme) $('btn-focus').focus({ preventScroll: true });
  });
  // Knappen Fakta i fokusraden öppnar rikets eller religionens faktaruta igen (#170)
  $('focus-facts').addEventListener('click', () => {
    const focus = state.focus;
    if (focus?.type === 'empire') app.showEmpireFacts(focus.id);
    else if (focus?.type === 'religion') app.showReligionFacts(focus.id, false);
    else if (focus?.type === 'theme') app.showThemeCard();
    else if (focus?.type === 'place') app.showPlaceCard();
  });
  panel.onThemeEvent = id => app.select(id);
  panel.onEndTheme = () => {
    app.endFocus();
    $('btn-focus').focus({ preventScroll: true });
  };
  panel.onFilter = (...a) => { store.setFilters(panel.filters); app.refresh(...a); };
  ff.onSelect = (...a) => app.select(...a);
  ff.onArcs = pairs => { globe.setArcs(pairs); flatMap.setArcs(pairs); };
  // På dator och surfplatta får faktarutan ensam vara läsytan. FunFacts behåller
  // däremot sitt eget hopfällda/öppna val och visar det igen när rutan stängs.
  // Fokus och skärmläsare (#1138): hela kortet byts via innerHTML, så #detail är inte aria-live (allt lästes om vid varje byte).
  // I stället säger statusraden rubriken en gång per ny ruta. Kom man från Samtidigt-kortet, som döljs, går fokus till Stäng
  // och tillbaka till samma knapp när rutan stängs (kortet ritas om, så knappen hittas på id eller händelse-id).
  let detailTitle = '', cardFocus = null, listFocus = null;
  panel.onDetailChange = open => {
    const detail = $('detail'), card = $('funfact'), active = document.activeElement;
    if (open) {
      if (!cardFocus && card.contains(active)) cardFocus = active.dataset?.id ? { chip: active.dataset.id } : { id: active.id };
      // En rad i Samtidigt-listan (#1323): fokus går till Stäng, och tillbaka till raden (eller knappen Samtidigt) när rutan stängs
      if (!cardFocus && !listFocus && $('panel').contains(active) && active.dataset?.id) listFocus = active.dataset.id;
      ff.setDetailOpen(true);
      if (cardFocus || listFocus) detail.querySelector('[data-close]')?.focus({ preventScroll: true });
      const title = detail.querySelector('h3')?.textContent.trim() ?? '';
      if (title && title !== detailTitle) $('screen-reader-status').textContent = `${ui('detail.label')}: ${title}`;
      detailTitle = title;
      return;
    }
    const back = cardFocus, wasInDetail = !active || active === document.body || detail.contains(active);
    ff.setDetailOpen(false);
    // I smal skärm döljs kortet av klassen has-detail tills omritningen har tagit bort den, så fokus flyttas efter den
    if (back && wasInDetail) requestAnimationFrame(() => {
      const now = document.activeElement;
      if (now && now !== document.body && !detail.contains(now)) return; // besökaren har redan flyttat fokus
      const own = back.chip ? $('ff-events').querySelector(`.ff-chip[data-id="${CSS.escape(back.chip)}"]`) : back.id && $(back.id);
      [own, $('ff-next'), $('ff-handle')].find(el => el && !el.hidden && el.getClientRects().length)?.focus({ preventScroll: true });
    });
    if (listFocus && wasInDetail) {
      const id = listFocus;
      requestAnimationFrame(() => {
        const now = document.activeElement;
        if (now && now !== document.body && !detail.contains(now)) return; // besökaren har redan flyttat fokus
        const row = $('event-list').querySelector(`.event-btn[data-id="${CSS.escape(id)}"]`);
        [row, $('btn-panel')].find(el => el && !el.hidden && el.getClientRects().length)?.focus({ preventScroll: true });
      });
    }
    cardFocus = null; listFocus = null; detailTitle = '';
  };
  // Kortets källor (#337): rikets berättelse har egna, fun facts och krigskort ärver händelsernas, som har laddats
  // när dialogen visar dem (Om källorna laddar alla händelsers källor först)
  ff.onSources = f => sources.open(() => f.kind === 'empire' ? f.sources
    : [...new Set(f.events.flatMap(id => data.byId[id]?.sources ?? []))]);
  panel.onSources = () => sources.open(); // knappen Om källorna under (i) vid granskningsstatusen (#310)
  sources.onSettings = (...a) => app.refresh(...a);

  // Mobilpanelen (#239): när man drar i globen stängs Samtidigt-kortet, så att globen syns. Ett tryck räknas inte.
  {
    const canvas = $('globe-canvas');
    let down = null;
    canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
    canvas.addEventListener('pointermove', e => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 12) { down = null; ff.autoClose(); detailSheet.autoClose(); }
    });
    for (const type of ['pointerup', 'pointercancel']) canvas.addEventListener(type, () => { down = null; });
  }

  // Faktarutan som ark (#361): när arket står halvt lyfts klotet, så att dess mitt (där den valda markören hamnar
  // efter flyTo) ligger mitt i den fria ytan mellan raden överst och arket. Litet ark och datorn: inget lyft.
  // Helt ark täcker ändå globen, så lyftet står kvar som i halvt läge.
  {
    let raf = 0;
    const lift = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const st = narrow.matches && !$('detail').hidden ? detailSheet.state : null;
        if (st === 'full') return;
        // Under en guidad tur lyfter turens kort klotet (js/ui/tour.js), annars inget lyft
        if (st !== 'half') return app.tour?.active ? app.tour.lift() : globe.setViewLift(0);
        const top = document.querySelector('.top-actions').getBoundingClientRect().bottom;
        const sheetTop = $('detail').getBoundingClientRect().top;
        globe.setViewLift(Math.max(0, globe.centerY() - (top + sheetTop) / 2));
      });
    };
    detailSheet.onChange = lift;
    window.addEventListener('resize', lift);
  }
  // Platsraden i faktarutan (#312, bara smal skärm): fäller ihop rutan till litet läge och visar markören på globen
  panel.onShowPlace = e => {
    detailSheet.set('closed');
    globe.flyTo(e._lat, e._lon);
    flatMap.reveal(e._lat, e._lon);
  };

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
    app.select(hit ? hit.userData.event.id : null);
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
  // Vyväljaren (#651): Glob, Platt karta och Upptäcktsresor
  app.viewMode = new ViewMode({ globe: $('btn-globe'), flat: $('btn-flat'), discovery: $('btn-discovery') }, { flatMap, layers });
  posterButton.addEventListener('click', async () => {
    if (!poster) return;
    posterButton.disabled = true;
    try {
      await Promise.all([loadSources(), loadAllEventDetails()]);
      await downloadPoster({
        baseCanvas: globe.baseCanvas, overlayCanvas: globe.overlayCanvas,
        year: Math.floor(timeline.year), events: data.events.filter(event => isVisibleReview(event.review)), srcById: data.srcById,
      });
    } catch (err) {
      console.error(err);
      window.alert(ui('poster.error'));
    } finally {
      posterButton.disabled = false;
    }
  });
  // Stängknappen i Lager, Sök och följ och Turer (mobil, #1309): menyerna fyller nästan hela skärmen. Knappen gör samma sak som
  // knappen som öppnade menyn, så att stängregistret och fokus beter sig som vid ett vanligt stängande.
  document.addEventListener('click', e => {
    const x = e.target.closest?.('.menu-x');
    const opener = x && { 'layer-menu': 'btn-layers', 'focus-menu': 'btn-focus', 'tour-menu': 'btn-tour' }[x.closest('.layer-menu')?.id];
    if (opener) $(opener).click();
  });
  // Escape stänger Platt vy, men först det som ligger ovanpå (menyer, Hjälp, förslagsformuläret, panelen, faktarutan)
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || flatMap.hidden) return;
    const open = ['help', 'feedback', 'layer-menu', 'focus-menu', 'sources-dialog', 'jump-pop', 'detail', 'religion-pop', 'route-pop'].some(id => !$(id).hidden);
    // Escape i turens kort avslutar turen (js/ui/tour.js), inte Platt vy
    if (open || $('app').classList.contains('panel-open') || $('tour-card').contains(document.activeElement)) return;
    flatMap.setOpen(false);
    $('btn-flat').focus({ preventScroll: true });
  }, { capture: true });

  layers.onChange = async (name, on) => {
    store.setLayers(layers.on);
    applyLayers(); app.refresh();
    if (name === 'discovery') app.viewMode?.sync(); // Upptäcktsresor i Vy följer lagret (#651)
    // Lagret slås bara på: menyn står kvar öppen och ingen faktaruta öppnas (#308). Första gången
    // visar teckenförklaringen en tipsrad; faktarutan finns bakom knappen "Läs om religionerna".
    if (name === 'religions') relLegend.setHint(on);
    if (name === 'areas' && !on && !$('empire-legend').hidden) empireLegend.onClose();
    await app.ensureReligions();
  };
  // Nyckelår i rikets och religionens faktaruta hoppar dit i tiden
  panel.onYear = year => { timeline.year = year; };

  // Rikenas namn ritas med IM Fell English, rita om när typsnittet har laddats
  document.fonts?.ready.then(() => app.refresh());

  // Menyerna uppe till höger och sidopanelen: en öppnad yta stänger sin grupp (js/surfaces.js, #894)
  const { surfaces } = app;
  surfaces.register('panel', 'sidopanel', () => panel.setOpen(false));
  surfaces.register('layers', 'meny', () => layers.close());
  surfaces.register('focus', 'meny', () => app.focusMenu.close());
  // Mobilens Meny och datorns Mer stängs när en annan meny öppnas, till exempel språklistan (#1167)
  surfaces.register('viewmenu', 'meny', () => { if (viewMenu.isOpen) viewMenu.set(false); });
  surfaces.register('extra', 'meny', () => { if (extraMenu.isOpen) extraMenu.set(false); });
  panel.onOpen = () => { surfaces.opened('panel'); app.orientToPanelHighlight(); };
  layers.onOpen = () => surfaces.opened('layers');

  // Sök och följ (#651, tidigare Sök #570): händelserna söks i samma ruta som det man kan följa. En händelse öppnas
  // på sitt år (lagret Händelser och händelsens kategori slås på om de är av); resten börjar följas i Fokus.
  let eventIndex = null;
  app.focusMenu.searchEvents = q => {
    eventIndex ??= buildIndex({ events: data.events }, { t, visible: isVisibleReview }).filter(it => it.type === 'event');
    return searchIndex(eventIndex, q, 30).map(it => ({
      key: `event:${it.id}`, label: it.title, from: it.start, to: it.end,
      sub: [formatEventTime(it.ref), it.place].filter(Boolean).join(' · '), color: CAT[it.ref.category]?.color ?? 'var(--brass)',
    }));
  };
  // Vad hände här? (#15): fliken Plats söker i platsnamnen som redan finns i händelserna och listar händelserna inom radien
  app.focusMenu.radiusKm = RADIUS_KM;
  app.focusMenu.searchPlaces = q => placeSuggestions(data.events, q, { t, visible: isVisibleReview });
  app.focusMenu.eventsNear = place => eventsNear(data.events, place, { visible: isVisibleReview, t }).map(({ event: e, approximate }) => ({
    key: `event:${e.id}`, label: t(e.title), approximate,
    sub: [formatEventTime(e), t(e.place)].filter(Boolean).join(' · '), color: CAT[e.category]?.color ?? 'var(--brass)',
  }));
  const follow = app.focusMenu.onPick;
  app.focusMenu.onPick = key => {
    if (!key.startsWith('event:')) return follow(key);
    const e = data.byId[key.slice(6)];
    if (!e) return;
    timeline.pause();
    if (!layers.on.events) { layers.set('events', true); layers.onChange('events', true); }
    if (!panel.filters.has(e.category)) $('filters').querySelector(`[data-cat="${e.category}"]`)?.click();
    if (state.focus) app.endFocus(false);
    timeline.year = e.start;
    app.select(e.id, false);
  };

  labels.start();

  $('loading').hidden = true;
  // Hjälpen öppnas bara från knappen Hjälp (#245, #527).
  let intro = null;
  const help = new Help({
    root: $('help'), button: $('btn-help'), close: $('help-close'),
  });
  // Besökarnas förslag (docs/feedback.md): från Hjälp och från faktarutans "Rapportera faktafel"
  const feedback = new Feedback($('feedback'));
  $('help-feedback').addEventListener('click', () => { help.close(false); feedback.open({ opener: $('btn-help') }); });
  const report = (object, btn) => {
    object.year = Math.round(timeline.year);
    feedback.open({ opener: btn, event: object.type === 'event' ? data.byId[object.id] : null, object });
  };
  panel.onReport = report;
  routePop.onReport = report;
  timeline.init(takeReturnYear() ?? 1325); // året finns kvar efter byte av språk
  // Språkväljaren i översta raden (#1167). Adressen skapas längre ned; beforeReload anropas först vid byte.
  const langPicker = setupLangPicker({
    toggle: $('btn-lang'), menu: $('lang-menu'), getYear: () => timeline.year,
    beforeReload: () => app.address?.flush(), onOpen: () => surfaces.opened('lang'),
  });
  surfaces.register('lang', 'meny', () => langPicker.close());
  globe.flyTo(34, -50, 1600);
  globe.autoRotate = false;

  // Frivillig introduktion (#363, #516): startas från Utforska och sätter bara då introduktionens år.
  intro = new Intro({
    root: $('intro'), close: $('intro-close'), progress: $('intro-progress'), title: $('intro-title'), content: $('intro-content'),
    back: $('intro-back'), next: $('intro-next'), skip: $('intro-skip'),
  }, introData, {
    events: data.events, funfacts: data.funfacts,
    onStart: year => { if (Number.isInteger(year)) timeline.year = year; },
    onExplore: () => $('track').focus({ preventScroll: true }),
    onFollow: () => $('btn-focus').click(),
    onTask: () => $('track').focus({ preventScroll: true }),
    fallbackFocus: () => $('btn-more'),
  });
  const introButton = $('btn-intro');
  introButton.hidden = !intro.ready;
  introButton.textContent = introData?.labels?.start ? t(introData.labels.start) : introButton.textContent;
  introButton.addEventListener('click', () => intro.open(introButton));

  // Engångstips vid tidslinjen (#996): visas tills besökaren har rört tidslinjen eller stängt det, sedan aldrig igen
  const yearTip = $('year-tip');
  const tipSeen = () => { try { return localStorage.getItem('hg-year-tip') === '1'; } catch { return false; } };
  const dismissTip = () => {
    yearTip.hidden = true;
    try { localStorage.setItem('hg-year-tip', '1'); } catch { /* utan lagring: tipset visas igen nästa gång */ }
  };
  if (!tipSeen()) {
    yearTip.hidden = false;
    $('track').addEventListener('pointerdown', dismissTip, { once: true, capture: true }); // före markeringarnas egen stopPropagation
    $('track').addEventListener('keydown', dismissTip, { once: true });
    $('year-tip-close').addEventListener('click', dismissTip);
  }

  // Teckenförklaringen under tidslinjen (#1003): öppen som standard, och valet att fälla ihop den sparas
  const tLegend = $('timeline-legend');
  try { if (localStorage.getItem('hg-teckenforklaring') === 'hopfalld') tLegend.open = false; } catch { /* utan lagring: öppen */ }
  // Sparas i klicket (före ändringen), inte i toggle-händelsen som kommer senare och kan hinna missas vid en omladdning
  tLegend.querySelector('summary').addEventListener('click', () => {
    try { localStorage.setItem('hg-teckenforklaring', tLegend.open ? 'hopfalld' : 'oppen'); } catch { /* utan lagring */ }
  });

  // Quiz (#65): frågor ur befintliga fun facts, startas från Mer. Knappen döljs om datan inte räcker till en fråga.
  const quizButton = $('btn-quiz');
  const quiz = new Quiz({
    root: $('quiz'), closeBtn: $('quiz-close'), score: $('quiz-score'), event: $('quiz-event'), eventTitle: $('quiz-event-title'),
    eventMeta: $('quiz-event-meta'), question: $('quiz-question'), options: $('quiz-options'), result: $('quiz-result'),
    verdict: $('quiz-verdict'), funfact: $('quiz-funfact'), sources: $('quiz-sources'), next: $('quiz-next'),
    title: $('quiz-title'), origin: $('quiz-origin'),
  }, data, { fallbackFocus: () => $('btn-more') });
  quizButton.hidden = !quiz.ready;
  quizButton.addEventListener('click', () => { help.close(false); quiz.open(quizButton); });

  // Samtidighetsjakten (#741): ett elevuppdrag. Knappen i faktarutan finns bara medan jakten pågår.
  const huntButton = $('btn-hunt');
  const refreshDetail = () => { if (panel.selectedId && !$('detail').hidden) panel.showDetail(data.byId[panel.selectedId]); };
  const hunt = new Hunt({
    root: $('hunt'), title: $('hunt-title'), task: $('hunt-task'), years: $('hunt-years'), progress: $('hunt-progress'),
    list: $('hunt-list'), message: $('hunt-message'), done: $('hunt-done'), reflection: $('hunt-reflection'),
    sources: $('hunt-sources'), closeBtn: $('hunt-close'), endBtn: $('hunt-end'),
  }, await loadMissions(), { timeline, byId: data.byId, srcById: data.srcById, onChange: refreshDetail, fallbackFocus: () => $('btn-more'), store, get lesson() { return app.lesson; } });
  app.hunt = hunt;
  panel.huntFor = e => hunt.buttonFor(e);
  panel.onHunt = e => hunt.add(e);
  huntButton.hidden = !hunt.ready;
  huntButton.addEventListener('click', () => { help.close(false); hunt.start(null, huntButton); });

  // Guidade turer (#47): en tur är data i data/turer/, och spelaren styr tidslinjen, kameran, Lager och faktarutan
  const tour = new TourPlayer({
    button: $('btn-tour'), menu: $('tour-menu'), menuTitle: $('tour-menu-title'), list: $('tour-list'),
    card: $('tour-card'), progress: $('tour-progress'), meter: $('tour-meter'), name: $('tour-name'), title: $('tour-title'), text: $('tour-text'),
    read: $('tour-read'), srcBtn: $('tour-sources'), back: $('tour-back'), next: $('tour-next'), closeBtn: $('tour-close'), endBtn: $('tour-end'),
    chapter: $('tour-chapter'), question: $('tour-question'), questionLabel: $('tour-question-label'), questionText: $('tour-question-text'), status: $('tour-status'),
    printBtn: $('tour-print'),
    printStatus: $('tour-print-status'),
    copyTeacherBtn: $('tour-copy-teacher'),
  }, toursData, {
    printRoot: $('print-sheet'),
    get lesson() { return app.lesson; }, // lektionsläget (#795) skapas efter spelaren
    timeline, globe, flatMap, layers, narrow, root: $('app'), events: data.byId,
    layerIds: new Set(registry.entries.map(e => e.id)), controlled: registry.viewLayers(views?.groups), empires: new Set(data.empireGroups.map(g => g.id)),
    select: (id, jump) => app.select(id, jump),
    // Markera en händelse på globen utan att öppna faktarutan (turens steg i smal skärm)
    mark: id => { panel.showDetail(null); store.setSelected(id); app.refresh(); },
    focusKey: () => (state.focus ? `${state.focus.type}:${state.focus.id}` : null),
    startFocus: key => app.startFocus(key), endFocus: redraw => app.endFocus(redraw),
    store, snapshot: () => app.modeSnapshot(),
    openSources: ids => sources.open(() => ids),
    fallbackFocus: () => $('track'),
  });
  app.tour = tour;
  // Lägeskontraktet (#893): så avslutas varje läge när ett annat läge som avslutar det börjar (MODE_RULES i js/state.js)
  store.onExit('fokus', () => app.endFocus(false));
  store.onExit('tur', takenBy => tour.end({ takenBy }));
  store.onExit('lektion', takenBy => tour.end({ takenBy })); // lektionen hör till sin tur och slutar med den
  store.onExit('jakt', () => hunt.end(false));
  // Lektionsläget (#795): en lektionslänk (m=lektion) startar turen med menyerna dolda och bandet överst
  app.lesson = new LessonMode({
    band: $('lesson-band'), title: $('lesson-band-title'), exit: $('lesson-exit'), printBtn: $('lesson-print'), printStatus: $('lesson-print-status'),
    notice: $('lesson-notice'), noticeText: $('lesson-notice-text'), retry: $('lesson-retry'), noticeClose: $('lesson-notice-close'), endLinks: $('tour-lesson-end'), endList: $('tour-lesson-end-list'),
  }, { root: $('app'), printRoot: $('print-sheet'), timeline, tour, hunt, toursData, store, layers, snapshot: () => app.modeSnapshot(), closeMenus: () => { surfaces.closeAll(); help.close(false); } });
  // Berättelseläget (#247): krigets första kort får "Följ berättelsen" när en tur berättar om kriget
  panel.tourFor = id => { const x = tour.forWar(id); return x && { id: x.id, label: tour.storyLabel(x) }; };
  // Rikens fall (#499): rikets faktaruta får en knapp när en tur följer rikets fall
  panel.empireTourFor = id => { const x = tour.forEmpire(id); return x && { id: x.id, label: tour.storyLabel(x, 'fall') }; };
  panel.onTour = (id, btn) => tour.start(id, btn);
  panel.howTour = () => { const x = tour.tours?.find(y => y.id === 'hur-vet-vi-det-har'); return x ? { id: x.id, label: t(x.title) } : null; };
  tour.onOpen = () => surfaces.closeAll();
  // Dialogerna och Escape (#1323, js/surfaces.js). Dialogerna är en grupp: bara en är öppen, och en öppnad dialog pausar
  // uppspelningen och nedräkningen, som inte fortsätter av sig själva. Registret märker öppnandet på attributet hidden, så att
  // dialogernas egen kod inte ändras. Escape stänger det översta öppna (dialog, årshopp eller intervallformulär, jakt, Turer-menyn)
  // också när fokus ligger utanför ytan, och fokus går tillbaka till ytans knapp.
  surfaces.onDialogOpen = () => { timeline.pause(); app.playback.stopCountdown(); };
  surfaces.watch('help', $('help'), 'dialog', refocus => help.close(refocus !== false), { opener: $('btn-help') });
  surfaces.watch('sources', $('sources-dialog'), 'dialog', () => sources.hide(), { opener: $('btn-sources') });
  surfaces.watch('intro', $('intro'), 'dialog', refocus => intro.close(refocus !== false), { opener: $('btn-intro') });
  surfaces.watch('quiz', $('quiz'), 'dialog', refocus => quiz.close(refocus !== false), { opener: $('btn-quiz') });
  surfaces.watch('feedback', $('feedback'), 'dialog', () => feedback.close());
  surfaces.watch('hunt', $('hunt'), 'uppdrag', refocus => hunt.end(refocus !== false), { opener: $('btn-hunt') });
  surfaces.register('tours', 'meny', () => tour.closeMenu(), { isOpen: () => !$('tour-menu').hidden, opener: $('btn-tour'), central: true });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (surfaces.escape()) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  // Tillståndet i adressen (#501) och knappen Dela (#64). En tur i adressen (t och s, eller ?tur=<id>) startar
  // direkt vid rätt steg och går före en delad vy (#736), till exempel från en lektion eller ett test.
  const address = createAddress(app);
  app.address = address;
  await address.start();
  const shareBtn = $('btn-share');
  let shareTimer = 0;
  shareBtn.addEventListener('click', () => address.share(text => {
    const label = shareBtn.textContent;
    shareBtn.textContent = text;
    $('screen-reader-status').textContent = text;
    clearTimeout(shareTimer);
    shareTimer = setTimeout(() => { shareBtn.textContent = label; }, 2500);
  }));
}


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
  return update;
}
const updateFocusTop = trackFocusBar();

/** Pausraden kan bli flera rader hög (#647). CSS får dess ovankant som --pause-top (avstånd från sidans underkant),
 *  så att fokusraden alltid ligger ovanför den i stället för ett fast antal pixlar upp. */
function trackPauseNote(after) {
  const app = $('app'), note = $('pause-note');
  const update = () => {
    const on = !note.hidden && note.offsetHeight > 0;
    app.classList.toggle('pause-var', on);
    if (on) app.style.setProperty('--pause-top', `${Math.round(window.innerHeight - note.getBoundingClientRect().top)}px`);
    after(); // fokusraden flyttades: korten ovanför den följer med
  };
  new ResizeObserver(update).observe(note);
  new MutationObserver(update).observe(note, { attributes: true, attributeFilter: ['hidden'] });
  window.addEventListener('resize', update);
  update();
}
trackPauseNote(updateFocusTop);

// Safari på iPad och iPhone: globen sköter själv nypgesterna med pekhändelser. Stoppa därför Safaris
// sidzoom bara när gesten börjar på globen; resten av sidan ska gå att zooma som vanligt (#191, #404).
// Etiketterna och klustren ovanpå klotet räknas som globen, så att sidan inte zoomas när gesten börjar på dem.
for (const type of ['gesturestart', 'gesturechange']) {
  for (const el of [$('globe-canvas'), $('labels')]) el.addEventListener(type, e => e.preventDefault(), { passive: false });
}

start().catch(err => {
  console.error(err);
  $('loading').textContent = `Globen kunde inte starta: ${err.message}`;
});
