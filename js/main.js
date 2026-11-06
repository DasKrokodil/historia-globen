// Startar allt och kopplar ihop delarna:
// tidsreglaget skickar ut året → lagret väljer händelser → globen och panelen ritar om.
// Ansvaret ligger i js/controllers/ (#402): val av händelse, fokusläget, faktarutor om riken och religioner,
// omritningen, uppspelningens pauser, krigets berättelse och etiketterna. Här skapas delarna och kopplas ihop.
import { loadAll, loadReligionPolities, loadRoutes, t, formatYear, formatEventTime, isVisibleReview, CAT } from './model.js';
import { buildIndex, search as searchIndex } from './search-index.js';
import { applyStatic, setupLangPicker, takeReturnYear, LANG_INFO } from './i18n.js';
import { Globe } from './globe.js';
import { Timeline, setupYearJump } from './timeline.js';
import { LAYERS } from './layers/index.js';
import { Panel } from './ui/panel.js';
import { FunFacts } from './ui/funfact.js';
import { SourcesDialog } from './ui/sources.js';
import { LayerMenu, loadViews } from './ui/layers.js';
import { ReligionLegend, EmpireLegend } from './ui/legend.js';
import { RoutePop } from './ui/routepop.js';
import { Help } from './ui/help.js';
import { Intro, loadIntro } from './ui/intro.js';
import { TourPlayer, loadTours } from './ui/tour.js';
import { FlatMap } from './ui/flatmap.js';
import { downloadPoster } from './ui/poster.js';
import { Feedback } from './ui/feedback.js';
import { Sheet } from './ui/sheet.js';
import { ViewMenu, ExtraMenu } from './ui/viewmenu.js';
import { ViewMode } from './ui/viewmode.js';
import { createStore, toJSON } from './state.js';
import { LayerRegistry } from './layers/registry.js';
import { createSelection } from './controllers/selection.js';
import { createFacts } from './controllers/facts.js';
import { createFocus } from './controllers/focus.js';
import { createRender } from './controllers/render.js';
import { createPlayback } from './controllers/playback.js';
import { createLabels } from './controllers/labels.js';
import { createAddress } from './controllers/address.js';

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
      text: { sv: `${t(war.title)} bryter ut ${formatYear(war.start)}. Samtidigt i världen:` },
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
    posterButton.textContent = t(poster.button);
    posterButton.title = t(poster.button);
    posterButton.setAttribute('aria-label', t(poster.button));
  }

  // Det gemensamma tillståndet och lagerregistret (#338)
  // Åtgärder och prenumeration (#403): tidslinjen äger året, övriga val ändras med store.set…
  const store = createStore();
  const state = store.state;
  const registry = new LayerRegistry();
  // Det delade underlaget för controllerna (#402): komponenterna och funktionerna som de kopplas ihop med.
  // Funktionerna fylls i när varje controller skapas längre ner; anropen sker först efter starten.
  const narrow = matchMedia('(max-width: 760px)');
  const app = { $, data, views, state, store, registry, globe, flatMap, narrow };
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
  }, data, { empireLegend: views?.empireLegend, uncertainty: views?.uncertainty, panel: views?.panel });
  const ff = new FunFacts({
    root: $('funfact'), text: $('ff-text'), events: $('ff-events'), review: $('ff-review'),
    pager: $('ff-pager'), next: $('ff-next'), srcBtn: $('ff-sources'),
    pics: $('ff-pics'), kind: $('ff-kind'), min: $('ff-min'), tab: $('ff-tab'), tabCount: $('ff-tab-count'), handle: $('ff-handle'), status: $('screen-reader-status'),
  }, { funfacts: [...data.funfacts, ...warCards(data.events)], byId: data.byId, srcById: data.srcById, styles: data.styles, surprise: $('ff-surprise') });
  $('ff-surprise').textContent = t(views?.funfacts?.surprise) || 'Visste du?';
  // Smal skärm (#361): faktarutan som ark nedifrån med tre lägen, och mobilmenyn (#530): Samtidigt och Meny i raden överst
  const detailSheet = new Sheet($('detail'));
  new ViewMenu({ toggle: $('more-toggle'), menu: $('more-menu'), keep: $('btn-panel'), label: t(views?.menu?.label) });
  new ExtraMenu({ toggle: $('btn-more'), menu: $('extra-menu') });
  const sources = new SourcesDialog({ root: $('sources-dialog'), body: $('sources-body'), close: $('sources-close'), openBtn: $('btn-sources') }, data, { sourceVersion: views?.sourceVersion, summary: views?.sourcesSummary });

  const timeline = new Timeline({
    track: $('track'), thumb: $('thumb'), segs: $('track-segments'), ticks: $('ticks'),
    dots: $('track-dots'), ffMarks: $('track-ff'), chapters: $('track-chapters'), warMarks: $('track-war'), markNote: $('timeline-mark-note'), playBtn: $('btn-play'), playIcon: $('play-icon'), pauseNote: $('pause-note'), pauseText: $('pause-text'),
    pauseGo: $('pause-go'), status: $('screen-reader-status'),
    stepBtns: document.querySelectorAll('.step[data-step]'), speedBtn: $('btn-speed'),
  });
  setupYearJump(timeline, {
    button: $('year-jump'), pop: $('jump-pop'), input: $('jump-input'), msg: $('jump-msg'), epochs: $('jump-epochs'),
    events: data.events, copy: views?.jump ?? {}, onJump: () => app.orientToPanelHighlight(),
    onSelect: id => app.select(id, false), // raderna i datumresultatet (#590); året är redan rätt
  });
  // Samma direkta årshopp som Min dag i historien och Hoppa till år använder: stoppa
  // uppspelningen, flytta Timeline (som äger året) och låt refresh bygga Samtidigt-kortet.
  ff.onSurprise = fact => {
    timeline.pause();
    timeline.year = fact.show[0];
    app.refresh();
    app.orientToPanelHighlight();
  };


  // Lagerväljaren: vilka lager som syns. Raderna och startläget kommer från registret.
  const layers = new LayerMenu({ button: $('btn-layers'), menu: $('layer-menu'),
    views: views && { ...views, controlled: registry.viewLayers(views.groups) } });
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
  relLegend.names = new Map(data.polities.map(p => [p.name.en, p.name.sv]));
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
      layers.close();
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
  Object.assign(app, { startFocus: focusCtl.startFocus, endFocus: focusCtl.endFocus, founding: focusCtl.founding, focusMenu: focusCtl.focusMenu });
  const render = createRender(app);
  Object.assign(app, { render, refresh: render.refresh, syncNameScale: render.syncNameScale, storyFor: render.storyFor });

  const labels = createLabels(app);
  Object.assign(app, { labelText: labels.labelText, fillLabel: labels.fillLabel });

  app.playback = createPlayback(app);

  panel.onSelect = (...a) => app.select(...a);
  panel.onFocus = id => app.startFocus(`war:${id}`);
  // Riken i kriget (#76) öppnar rikets faktaruta (utan faktaruta följs riket). Ett försvunnet lands
  // efterträdare eller föregångare som finns som rike (#72, follow) börjar följas direkt.
  panel.onEmpire = (id, follow = false) => (!follow && app.showEmpireFacts(id)) || app.startFocus(`empire:${id}`);
  $('focus-exit').addEventListener('click', e => app.endFocus(e));
  // Knappen Fakta i fokusraden öppnar rikets eller religionens faktaruta igen (#170)
  $('focus-facts').addEventListener('click', () => {
    const focus = state.focus;
    if (focus?.type === 'empire') app.showEmpireFacts(focus.id);
    else if (focus?.type === 'religion') app.showReligionFacts(focus.id, false);
  });
  panel.onFilter = (...a) => { store.setFilters(panel.filters); app.refresh(...a); };
  ff.onSelect = (...a) => app.select(...a);
  ff.onArcs = pairs => { globe.setArcs(pairs); flatMap.setArcs(pairs); };
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
      await downloadPoster({
        baseCanvas: globe.baseCanvas, overlayCanvas: globe.overlayCanvas,
        year: Math.floor(timeline.year), events: data.events.filter(event => isVisibleReview(event.review)), labels: poster,
      });
    } catch (err) {
      console.error(err);
      window.alert(t(poster.error));
    } finally {
      posterButton.disabled = false;
    }
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

  // Menyerna uppe till höger: bara en åt gången
  panel.onOpen = () => { layers.close(); app.focusMenu.close(); app.orientToPanelHighlight(); };
  layers.onOpen = () => { panel.setOpen(false); app.focusMenu.close(); };

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
  setupLangPicker($('lang-select'), () => timeline.year);
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
    fallbackFocus: () => $('btn-intro'),
  });
  const introButton = $('btn-intro');
  introButton.hidden = !intro.ready;
  introButton.textContent = introData?.labels?.start ? t(introData.labels.start) : introButton.textContent;
  introButton.addEventListener('click', () => intro.open(introButton));

  // Guidade turer (#47): en tur är data i data/turer/, och spelaren styr tidslinjen, kameran, Lager och faktarutan
  const tour = new TourPlayer({
    button: $('btn-tour'), menu: $('tour-menu'), menuTitle: $('tour-menu-title'), list: $('tour-list'),
    card: $('tour-card'), progress: $('tour-progress'), name: $('tour-name'), title: $('tour-title'), text: $('tour-text'),
    read: $('tour-read'), srcBtn: $('tour-sources'), back: $('tour-back'), next: $('tour-next'), closeBtn: $('tour-close'), endBtn: $('tour-end'), pauseStop: $('pause-stop'),
  }, toursData, {
    timeline, globe, flatMap, layers, narrow, root: $('app'), events: data.byId,
    layerIds: new Set(registry.entries.map(e => e.id)), controlled: registry.viewLayers(views?.groups),
    select: (id, jump) => app.select(id, jump),
    // Markera en händelse på globen utan att öppna faktarutan (turens steg i smal skärm)
    mark: id => { panel.showDetail(null); store.setSelected(id); app.refresh(); },
    focusKey: () => (state.focus ? `${state.focus.type}:${state.focus.id}` : null),
    startFocus: key => app.startFocus(key), endFocus: redraw => app.endFocus(redraw),
    openSources: ids => sources.open(() => ids),
    fallbackFocus: () => $('track'),
  });
  app.tour = tour;
  tour.onOpen = () => { panel.setOpen(false); layers.close(); app.focusMenu.close(); };
  // Turen i adressen (?tur=<id>) startar direkt, till exempel från en lektion eller ett test
  const tourParam = new URLSearchParams(location.search).get('tur');
  if (tourParam) tour.start(tourParam);

  // Tillståndet i adressen (#501) och knappen Dela (#64). En tur i adressen går före en delad vy.
  const address = createAddress(app);
  app.address = address;
  await address.start({ read: !tourParam });
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
}
trackFocusBar();

// Safari på iPad och iPhone: globen sköter själv nypgesterna med pekhändelser. Stoppa därför Safaris
// sidzoom bara när gesten börjar på globen; resten av sidan ska gå att zooma som vanligt (#191, #404).
for (const type of ['gesturestart', 'gesturechange']) {
  $('globe-canvas').addEventListener(type, e => e.preventDefault(), { passive: false });
}

start().catch(err => {
  console.error(err);
  $('loading').textContent = `Globen kunde inte starta: ${err.message}`;
});
