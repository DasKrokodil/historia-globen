// Omritningen (#402, del av #389): refresh() fyller i det gemensamma tillståndet, låter lagren välja vad
// som syns (beslut 2), ritar lagerbilden (beslut 1) och uppdaterar listan, teckenförklaringarna och årtalet.
// Sist får uppspelningen (playback.js) se om något ska pausa. Här finns också namnens storlek efter zoom
// (#154, #271, #301, #358) och rikets berättelse för Samtidigt-kortet (#171).
import { loadEventDetails } from '../model.js';
import { ui } from '../i18n.js';
import { segmentName } from '../timeline.js';
import { ZOOM_LEVELS, zoomLevel, pxPerImg, zoomView, eventKeepouts } from '../ui/zoomlevels.js';
import { empireStory } from '../ui/funfact.js';
import { rangeParts, rangeText } from './range.js';

export function createRender(app) {
  const { $, state, data, views, registry, globe, flatMap, timeline, panel, ff, layers, relLegend, empireLegend, empireLegendButton, routePop } = app;
  const layer = registry.get('events'), areas = registry.get('areas'), religions = registry.get('religions'), routes = registry.get('routes');
  let visible = [];

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
    if (!$('flat-view').hidden) return [ZOOM_LEVELS[zoomLevel(flatMap.scale)].flatScale, 1]; // efter zoomnivån (#358)
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
      // Ny zoomnivå (#358) ändrar vilka rikesnamn och medaljer som får plats
      if (l.scale !== sc || l.alpha !== al || l.religionNames !== religionNames() || l.empireNames !== empireNames()
        || areas.view.level !== zoomLevel(pxPerImg(globe, flatMap))) refresh();
    }, 150);
  };
  globe.onZoom = flatMap.onZoom = syncNameScale; // ny zoomnivå (#358) ritar om lagerbilden

  // Lagerbilden (beslut 1) ritas om vid varje refresh, med lagren i registrets ritordning (Z i layers/registry.js).
  // I fokusläget dämpas påslagna lager som inte hör till det man följer (#235); "Behåll mina lager" visar dem som vanligt.
  // Under en övergång för riken (#78) ritas bara lagerbilden om, en gång per bildruta, tills övergången är klar;
  // annars ritas inget mellan refresh.
  globe.detail.setLayers((ctx, W, H, drawFaded) => registry.draw(ctx, W, H, state, drawFaded));
  // Upptäcktsvyns papperskarta och dimma är bilder i helbildens storlek: där används inget utsnitt
  globe.detailAllowed = () => !registry.get('discovery')?.enabled;
  let overlayRaf = 0;
  function drawOverlay() {
    cancelAnimationFrame(overlayRaf); overlayRaf = 0;
    const ctx = globe.overlayContext();
    registry.draw(ctx, globe.overlayCanvas.width, globe.overlayCanvas.height, state, (draw, alpha) => globe.drawFaded(draw, alpha));
    globe.commitOverlay();
    globe.detail.layersChanged(); // det skarpa utsnittet vid inzoomning ritas om när det blir stilla
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
    const focus = state.focus;
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
    // Med ett tidsintervall (#755) gäller hela intervallet och inget tidsfönster runt året
    const range = state.range;
    const window = range ? 0 : timeline.windowYears(year);
    // Tidslinjen äger året; tillståndet speglar det (#403)
    app.store.mirror({ year, wholeYear, fine, window, span, playing, filters: panel.filters });
    // Singular och plural ur språkfilen ([en, flera]), till exempel "±1 dag" och "±3 dagar"
    const plural = (key, n) => String(ui(key)[n === 1 ? 0 : 1]).replace('{n}', n);
    const within = fine ? plural('time.withinDays', Math.round(window * 365.25)) : plural('time.withinYears', Math.round(window));
    ff.story = focus?.type === 'empire' ? storyFor(focus.id) : [];
    ff.update(wholeYear, panel.filters);
    state.highlight = ff.highlightIds();
    const eventsOn = layers.on.events;
    // Alla lager väljer vad som syns (beslut 2), i registrets ordning
    visible = registry.update(state).events;
    timeline.setMarks(registry.marks(state));
    prefetchDetails();
    const rangeLabel = range && rangeText(range.from, range.to);
    panel.render(visible, wholeYear, window, eventsOn, range ? { at: ui('range.at', { range: rangeLabel }), bare: rangeLabel, within, range }
      : fine ? { at: ui('time.onDate', { date: timeline.format(year) }), bare: timeline.format(year), within } : null);
    app.range?.render(visible.filter(v => v.inside).length);
    // Samma markörer i Platt vy (#313): de som syns på klotet, de i listan får klustras och etikett
    flatMap.setMarkers({ list: layer.sprites.filter(sp => sp.userData.active).map(sp => sp.userData),
      labeled: new Set(visible.map(v => v.e.id)), keep: ff.highlightIds(), selectedId: state.selectedId });
    // Zoomnivån (#358): vilka rikesnamn och medaljer som får plats, och de viktigaste händelserna som ska hållas fria.
    // Rikena har redan valt sina områden i registry.update; namnens platser räknas när de ritas (AreasLayer._layout),
    // så det räcker att sätta vyn här, när händelserna (visible) är kända och innan lagerbilden och markörerna ritas.
    areas.setView({ ...zoomView(globe, flatMap), keepouts: eventKeepouts(visible, { selectedId: state.selectedId, highlight: state.highlight, text: app.labelText }),
      // Alla händelsemarkörer som syns, med halva storleken på skärmen, så att huvudstädernas namn viker undan (#616)
      markers: layer.sprites.filter(sp => sp.userData.active).map(({ userData: u }) => ({ lon: u.event._lon, lat: u.event._lat, r: (flatMap.hidden ? (u.px ?? 22) : flatMap.markerPx(u)) / 2 + 2 })) });
    flatMap.obstacles = areas.placedBoxes(); // händelseetiketterna i Platt vy hamnar inte på rikesnamnen
    panel.setCurveYear(wholeYear);
    if (routePop.route && !routes.active.some(a => a.route === routePop.route)) routePop.hide(); // vägen syns inte längre
    const legend = registry.legend(state);
    relLegend.update(legend.items ?? [], { areas: !!legend.areas, war: !!legend.war, fadable: registry.fadable(state).map(e => e.name), keep: !!layers.on.keep,
      discovery: legend.discovery ?? null });
    empireLegend.update(legend.empires ?? [], views?.empireLegend ?? {});
    empireLegendButton.hidden = !layers.on.areas || !(legend.empires?.length);
    if (empireLegendButton.hidden && !$('empire-legend').hidden) empireLegend.onClose();
    if (!religions.enabled || state.faded.has('religions')) relLegend.hidePop();
    registry.markers(state);
    drawOverlay();

    // Korta krig: "22 jan" stort och året där tideräkningen annars står (#204)
    const [num, era] = range ? rangeParts(range.from, range.to) : timeline.formatParts(year);
    $('year-big').textContent = num;
    $('year-era').textContent = era;
    $('year-jump').classList.toggle('fine', fine);
    $('year-segment').textContent = range ? ui('range.segment')
      : `${focus ? ui('focus.segment', { name: focus.short }) : segmentName(year)} · ${ui('time.shows', { within })}`;
    // Pauserna i uppspelningen: krigets och resans stopp, grundanden, rikets nyckelår och krig som bryter ut
    app.playback.check({ year, fine, span, playing, eventsOn });
    $('app').classList.toggle('has-detail', !$('detail').hidden);
    app.playback.showNextPause();
  }
  // Byte mellan mobilglob och Platt vy byter canvasstorlek. Rita om lagren i den nya upplösningen.
  globe.onTextureSizeChange = () => refresh();

  // Rikets berättelse (#171): korten byggs en gång per rike ur facts.milestones
  const stories = new Map();
  function storyFor(id) {
    if (!stories.has(id)) stories.set(id, empireStory(data.empireGroups.find(g => g.id === id), data.byId));
    return stories.get(id);
  }

  return { refresh, syncNameScale, storyFor, get visible() { return visible; } };
}
