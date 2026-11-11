// Fokusläget (#109, #113, #402, del av #389): följ ett krig, ett rike, ett försvunnet land, en religion eller
// en resa. Tidslinjen och globen zoomar in, och uppspelningen går långsamt. Här finns också Fokus-menyns
// listor och raden "Tiden flyttades" (#167). Det man följer står i state.focus, state.focusWar och
// state.focusRoute, som lagren läser. Ett tema (#398) är också fokus: ett namngivet urval av händelser.
import { loadReligions, loadThemes, loadPlaces, loadEmpire, loadEmpireFacts, loadEventDetails, loadRoutes, CAT, t, symbolUrl, formatYear, formatEventTime, isVisibleReview, edtfSpan, edtfHasDays } from '../model.js';
import { MIN_YEAR, MAX_YEAR } from '../timeline.js';
import { FocusMenu } from '../ui/focusmenu.js';
import { ui } from '../i18n.js';
import { warStory } from './story.js';
import { placeEvents } from '../place-geo.js';
import { formatYearSpan } from './facts.js';
import { eventRegion, span as missionSpan } from '../uppdrag-rules.js';

// Krig som ryms inom så här många år, med datum i edtf, följs dag för dag i fokusläget (#204)
const SHORT_WAR_YEARS = 2;

/** Neutral mittpunkt för spridda punkter, utan att datumgränsen gör 179° och −179° till 0°. */
function pointCenter(events) {
  const sum = events.reduce((v, e) => {
    const lat = e._lat * Math.PI / 180, lon = e._lon * Math.PI / 180, c = Math.cos(lat);
    v[0] += c * Math.cos(lon); v[1] += c * Math.sin(lon); v[2] += Math.sin(lat);
    return v;
  }, [0, 0, 0]);
  const lon = Math.atan2(sum[1], sum[0]), hyp = Math.hypot(sum[0], sum[1]);
  return [Math.atan2(sum[2], hyp) * 180 / Math.PI, lon * 180 / Math.PI];
}

/** Mittpunkt för en GeoJSON-geometri (mitten av dess yttre gränser), som [lat, lon]. */
function geoCenter(geoms) {
  let a = 180, b = -180, c = 90, d = -90;
  for (const g of geoms) for (const poly of g.type === 'Polygon' ? [g.coordinates] : g.coordinates) {
    for (const [lon, lat] of poly[0]) { a = Math.min(a, lon); b = Math.max(b, lon); c = Math.min(c, lat); d = Math.max(d, lat); }
  }
  return [(c + d) / 2, (a + b) / 2, b - a]; // [lat, lon, bredd i grader]
}

/** Fokusets spann för ett rike: kartdatan, och för ett försvunnet land också källornas årtal (#72). */
const empireSpan = g => g.vanished ? [Math.min(g.from, g.vanished.founded), Math.max(g.to, g.vanished.dissolved)] : [g.from, g.to];
/** Årtalen i Fokus: kartdatans spann, och för ett försvunnet land först källornas årtal (#72). */
const mapData = g => ui('search.mapData', { span: formatYearSpan(g.from, g.to) });
const empireYears = g => !g.vanished ? mapData(g)
  : `${formatYearSpan(g.vanished.founded, g.vanished.dissolved)} · ${g.file ? mapData(g) : ui('focus.mapPoint')}`;
// Religionens årtal i Fokus: grundandet där det går att belägga, annars bara kartdatans spann (#138)
// Ärvda områden (#269) räknas inte: spannet är där en faktaruta anger religionen
const stated = r => r.snapshots.filter(s => !s.inherited);
// Sökningen i Fokus (#311) letar i namnen på alla språk som datan har, och för riken och försvunna länder
// även i namnen på rikets delar (polities), till exempel "Bysantinska riket" i Rom och "Sverige"
const langs = n => Object.values(n ?? {}).filter(Boolean);
const empireTerms = g => [...langs(g.name), ...g.polities.flatMap(p => langs(p.name))];

export function createFocus(app) {
  const { $, state, data, views, globe, timeline, panel, layers } = app;
  const areas = app.registry.get('areas');

  /** Händelser där en religion grundades (founding: true), i tidsordning. */
  const founding = id => data.events.filter(e => e.founding && e.religion === id).sort((a, b) => a.start - b.start);

  /** Har det man följer en faktaruta? (riken och religioner med facts) */
  function focusFacts(f) {
    if (f?.type === 'empire') return !!data.empireGroups.find(x => x.id === f.id)?.hasFacts;
    if (f?.type === 'religion') return !!data.religionsDoc?.religions.find(x => x.id === f.id)?.facts;
    if (f?.type === 'theme' || f?.type === 'place') return true; // introduktionskortet
    return false;
  }

  /**
   * Börjar läget Fokus (#893). Fokuset börjar bara om biljetten fortfarande gäller när det har laddats: ingen nyare
   * begäran om Fokus (en annan länk, Bakåt, Avsluta) och ingen tur, lektion eller intervall har börjat under tiden
   * (#865). Ger true när fokuset började.
   */
  async function startFocus(key) {
    const ticket = app.store.ticket('fokus');
    const [type, id] = key.split(':');
    $('focus-notice').hidden = true;
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
    } else if (type === 'route') {
      const route = (await loadRoutes()).find(r => r.id === id && r.kind === 'voyage');
      if (!route) return false;
      // Dagar används bara när själva resans spann har dagprecision. Zheng Hes första resa
      // har medvetet bara år/månad utom vid hemkomsten (#376).
      const fine = edtfHasDays(route.edtf);
      const [from, to] = fine ? edtfSpan(route) : [route.start, route.end];
      const first = route.legs?.[0]?.path?.[0] ?? [0, 0];
      f = { type, id, title: `${t(route.title)} · ${formatEventTime(route)}`, short: t(route.title), from, to, fine,
        center: [first[1], first[0]], zoom: 1.5, route };
    } else if (type === 'theme') {
      const theme = (await loadThemes()).find(x => x.id === id);
      // Temat visar bara händelser som syns (draft räknas inte); saknas de alla börjar inget tema
      const evs = theme ? theme.events.map(i => data.byId[i]).filter(e => e && isVisibleReview(e.review)).sort((a, b) => a.start - b.start) : [];
      if (!evs.length) {
        $('focus-notice').textContent = ui('theme.unavailable');
        $('focus-notice').hidden = false;
        return false;
      }
      const lastEnd = Math.max(...evs.map(e => e.end));
      // Spannet går från den tidigaste till den senaste händelsen, inom tidslinjens gränser; en händelse före
      // tidslinjens början nås från kortet (#892, #942)
      const from = Math.min(Math.max(MIN_YEAR, evs[0].start), MAX_YEAR), to = Math.max(from, Math.min(MAX_YEAR, lastEnd));
      f = { type, id, title: `${t(theme.name)} · ${formatYearSpan(evs[0].start, lastEnd)}`, short: t(theme.name), from, to,
        center: pointCenter(evs), zoom: 1, theme, themeEvents: evs, eventIds: new Set(evs.map(e => e.id)) };
    } else if (type === 'place') {
      // En plats (#579) följs som ett tema: händelserna inom dagens gräns, i tidsordning. Draft-platser laddas aldrig.
      const place = (await loadPlaces()).find(x => x.id === id);
      const evs = place ? placeEvents(place, data.events).filter(e => isVisibleReview(e.review)) : [];
      if (!evs.length) {
        $('focus-notice').textContent = ui('place.unavailable');
        $('focus-notice').hidden = false;
        return false;
      }
      const lastEnd = Math.max(...evs.map(e => e.end));
      const from = Math.min(Math.max(MIN_YEAR, evs[0].start), MAX_YEAR), to = Math.max(from, Math.min(MAX_YEAR, lastEnd));
      f = { type, id, title: `${t(place.name)} · ${formatYearSpan(evs[0].start, lastEnd)}`, short: t(place.name), from, to,
        center: place.view.center, zoom: place.view.zoom, place, themeEvents: evs, eventIds: new Set(evs.map(e => e.id)) };
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
      app.setReligions(doc);
      const r = doc.religions.find(x => x.id === id);
      // Fokus börjar när religionen grundades, om det finns en sådan händelse (#123)
      const first = founding(id)[0];
      const st = stated(r);
      const from = Math.min(first?.start ?? Infinity, st[0].start), to = Math.max(st.at(-1).end, first?.end ?? -Infinity);
      f = { type, id, title: `${t(r.name)} · ${religionSpan(r, first)}`, short: t(r.name), from, to,
        center: first ? [first._lat, first._lon] : geoCenter([st[0].geometry]), zoom: 1.3 };
    }
    // Något annat tog över medan fokuset laddades, eller ett läge som stoppar Fokus pågår (lektionen, #795)
    if (!app.store.current(ticket) || !app.store.canEnter('fokus')) return false;
    if (state.focus) endFocus(false);
    app.store.enter('fokus'); // avslutar en tur som pågår (MODE_RULES i js/state.js); turens lager återställs, inte dess fokus
    // Året stannar om det ligger inom spannet; annars flyttas det till starten och flytten visas (#167)
    const prevYear = timeline.year, prevText = timeline.format(prevYear), keepYear = prevYear >= f.from && prevYear <= f.to;
    // Temats vy slås på före urvalet; lagren står kvar när temat slutar, som efter ett krig eller ett rike (#398)
    if (type === 'theme' && f.theme.view) layers.applyView(f.theme.view);
    app.store.setFocus(f, { war: type === 'war' ? data.byId[id] : null, route: type === 'route' ? f.route : null });
    app.playback.clearRouteStops();
    app.applyLayers();
    globe.flyTo(f.center[0], f.center[1], 900);
    globe.setZoom(f.zoom);
    $('focus-title').textContent = f.title;
    $('focus-facts').hidden = !focusFacts(f);
    $('focus-bar').hidden = false;
    $('app').classList.add('focusing');
    panel.setOpen(false); // listan stängs så att det man följer syns
    timeline.setFocus({ from: f.from, to: f.to, fine: !!f.fine });
    const focusWar = state.focusWar;
    if (focusWar) timeline.setStory(warStory(focusWar, { timeline, focus: f, end: app.playback.warEndOf() }));
    const startYear = keepYear ? prevYear : f.from;
    app.playback.startAt(startYear);
    timeline.year = startYear;
    showMoved(keepYear ? null : { prevYear, prevText, startYear, short: f.short, type });
    app.refresh();
    // Före start: varför kriget började och vilka som stred (#122)
    if (focusWar?.story) { app.store.setSelected(focusWar.id); panel.showStory(focusWar, 'intro'); $('app').classList.add('has-detail'); }
    // Religionens faktaruta visas först (#90), annars grundandet i faktarutan
    const first = type === 'religion' && founding(id)[0];
    if (type === 'religion' && !app.showReligionFacts(id, false) && first) app.select(first.id, false);
    // Rikets faktaruta visas när man börjar följa det (#170)
    if (type === 'empire') app.showEmpireFacts(id);
    // Platsens kort (#579)
    if (type === 'place') showPlaceCard();
    // Temats introduktion (#398) med händelserna i tidsordning
    if (type === 'theme') {
      showThemeCard();
      // En jakt pågår samtidigt med temat (#893). Temat begränsar vad som syns, så säg det när uppdraget inte går att klara
      const hunt = app.hunt;
      if (hunt?.active) {
        const [a, b] = missionSpan(hunt.mission);
        const regions = new Set(f.themeEvents.filter(e => e.end >= a && e.start <= b).map(eventRegion).filter(Boolean));
        if (regions.size < hunt.mission.count) { hunt.message.textContent = ui('theme.huntImpossible'); hunt.message.className = 'hunt-message is-no'; }
      }
    }
    return true;
  }
  /** Temats introduktionskort (#398): knappen Fakta i fokusraden öppnar det igen. */
  function showThemeCard() {
    const f = state.focus;
    if (f?.type !== 'theme') return;
    app.store.setSelected(null);
    panel.showTheme(f.theme, f.themeEvents);
    app.surfaces.closeGroup('meny');
    if (app.narrow.matches) app.surfaces.closeGroup('sidopanel');
    $('app').classList.add('has-detail');
  }
  /** Platsens kort (#579): knappen Fakta i fokusraden öppnar det igen. */
  function showPlaceCard() {
    const f = state.focus;
    if (f?.type !== 'place') return;
    app.store.setSelected(null);
    panel.showPlace(f.place, f.themeEvents);
    app.surfaces.closeGroup('meny');
    if (app.narrow.matches) app.surfaces.closeGroup('sidopanel');
    $('app').classList.add('has-detail');
  }
  /** Raden i fokusraden när tiden flyttades till fokusets start (#167), med en väg tillbaka. */
  let movedBack = null;
  function showMoved(m) {
    $('focus-moved').hidden = !m;
    $('app').classList.toggle('focus-moved-on', !!m);
    movedBack = m;
    if (!m) return;
    const why = m.type === 'war' ? ui('focus.movedWar') : ui('focus.movedStart', { name: m.short });
    $('focus-moved-text').textContent = `${ui('focus.moved', { year: timeline.format(m.startYear), why })} · `;
    $('focus-moved-back').textContent = ui('focus.movedBack', { year: m.prevText });
  }
  // Raden behövs bara innan man börjar spela: under uppspelningen gör den fokusraden högre och krockar med pausraden (#647)
  timeline.addEventListener('playstate', () => { if (timeline.playing && movedBack) showMoved(null); });
  // Tillbaka lämnar fokus och går till året man stod på, eftersom det ligger utanför spannet
  $('focus-moved-back').addEventListener('click', () => {
    const y = movedBack?.prevYear;
    endFocus(false);
    if (y != null) timeline.year = y;
    app.refresh();
  });
  function endFocus(redraw = true) {
    const wasTheme = state.focus?.type === 'theme' || state.focus?.type === 'place';
    app.store.leave(['fokus']);
    app.store.setFocus(null);
    if (wasTheme) {
      app.store.setSelected(null);
      panel.setDetailOpen(false);
    }
    app.playback.reset(); showMoved(null);
    app.applyLayers();
    $('focus-bar').hidden = true;
    $('app').classList.remove('focusing');
    timeline.setFocus(null);
    globe.setZoom(1);
    if (redraw) app.refresh();
  }

  /** Escape stänger först det som ligger ovanpå. När temakortet redan är stängt lämnar nästa Escape temat. */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || (state.focus?.type !== 'theme' && state.focus?.type !== 'place')) return;
    const overlay = ['detail', 'focus-menu', 'layer-menu', 'help', 'feedback', 'sources-dialog', 'jump-pop', 'religion-pop', 'route-pop']
      .some(id => { const el = $(id); return el && !el.hidden; });
    if (overlay || $('app').classList.contains('panel-open')) return;
    e.preventDefault();
    endFocus();
    $('btn-focus').focus({ preventScroll: true });
  }, { capture: true });

  // Fokusmenyn listar krig, riken, religioner och resor. Resorna och religionerna hämtas när menyn öppnas.
  // Tidsåldrarna i Fokus kommer från de globala bildstilarna, inte från ny historisk data (#507).
  const focusAges = data.styles.styles.filter(style => !style.regions.length).map(style => ({
    ...style, label: views?.focus?.timeAges?.[style.id] ?? '',
  }));
  const focusMenu = new FocusMenu({ button: $('btn-focus'), menu: $('focus-menu'), texts: {
    groupByAge: views?.focus?.groupByAge, showAll: views?.focus?.showAll, showNearest: views?.focus?.showNearest,
  }, ages: focusAges });
  // Varje post har sitt tidsspann (from–to), så att menyn kan visa det som hör till tiden man står i (#121)
  const religionSpan = (r, first) => {
    const st = stated(r);
    const map = ui('focus.stateReligion', { span: formatYearSpan(st[0].start, st.at(-1).end) });
    return first ? `${ui('focus.founded', { time: formatEventTime(first) })} · ${map}` : map;
  };
  const religionItems = doc => doc.religions.map(r => {
    const first = founding(r.id)[0];
    const st = stated(r);
    const from = Math.min(first?.start ?? Infinity, st[0].start), to = st.at(-1).end;
    return { key: `religion:${r.id}`, label: t(r.name), terms: langs(r.name), sub: religionSpan(r, first), color: r.color, symbol: symbolUrl(r), from, to };
  });
  const empireItems = () => data.empireGroups.filter(g => !g.vanished).map(g =>
    ({ key: `empire:${g.id}`, label: t(g.name), terms: empireTerms(g), sub: mapData(g), color: g.color, symbol: symbolUrl(g), from: g.from, to: g.to }));
  // Försvunna länder (#72): listas alla, i tidsordning, med när de bildades och upplöstes och vad de blev
  const vanishedItems = () => data.empireGroups.filter(g => g.vanished).map(g => {
    const [from, to] = empireSpan(g);
    const names = g.vanished.successors.map(s => t(s.name).split(' (')[0]);
    const blev = names.length > 4 ? ui('focus.andMore', { names: names.slice(0, 3).join(', '), count: names.length - 3 }) : names.join(', ');
    return { key: `empire:${g.id}`, label: t(g.name), terms: empireTerms(g), sub: `${empireYears(g)} · ${ui('focus.became', { names: blev })}`, color: g.color, symbol: symbolUrl(g), from, to };
  });
  let focusRoutes = null, focusThemes = null, focusPlaces = null;
  // En plats visas med typ och antal händelser inom gränsen ("Självstyrt område · 17 händelser · 2500 f.Kr.–2009", #579)
  const placeItems = list => list.map(pl => {
    const evs = placeEvents(pl, data.events).filter(e => isVisibleReview(e.review));
    if (!evs.length) return null;
    const to = Math.max(...evs.map(e => e.end));
    return { key: `place:${pl.id}`, label: t(pl.name), terms: langs(pl.name), sub: `${ui(`place.type.${pl.type}`)} · ${ui('focus.themeCount', { count: evs.length })} · ${formatYearSpan(evs[0].start, to)}`, from: evs[0].start, to };
  }).filter(Boolean);
  // Ett tema visas med antal synliga händelser och spann ("12 händelser · 2200 f.Kr.–1989", #398)
  const themeItems = list => list.map(th => {
    const evs = th.events.map(i => data.byId[i]).filter(e => e && isVisibleReview(e.review)).sort((a, b) => a.start - b.start);
    if (!evs.length) return null;
    const to = Math.max(...evs.map(e => e.end));
    return { key: `theme:${th.id}`, label: t(th.name), terms: langs(th.name), sub: `${ui('focus.themeCount', { count: evs.length })} · ${formatYearSpan(evs[0].start, to)}`, from: evs[0].start, to };
  }).filter(Boolean);
  const routeItems = list => list.filter(r => r.kind === 'voyage' && isVisibleReview(r.review)).map(r =>
    ({ key: `route:${r.id}`, label: t(r.title), terms: langs(r.title), sub: formatEventTime(r), color: CAT[r.category]?.color, from: r.start, to: r.end }));
  // title är gruppens id (samma som flikarna i focusmenu.js); namnet som visas hämtas där med ui() (#671)
  const focusGroups = (doc = null, routeList = focusRoutes, themeList = focusThemes, placeList = focusPlaces) => [
    // Teman är en egen ingång högst upp under Alla (#1113), men fortfarande en del av Sök och följ.
    { title: 'Teman', note: ui('focus.note.themes'), items: themeList ? themeItems(themeList) : [], loading: !themeList },
    { title: 'Platser', note: ui('focus.note.places'), items: placeList ? placeItems(placeList) : [], loading: !placeList },
    { title: 'Krig', items: data.events.filter(e => e.kind === 'war').map(e => ({ key: `war:${e.id}`, label: t(e.title), terms: langs(e.title), sub: formatEventTime(e), color: CAT[e.category]?.color, from: e.start, to: e.end })) },
    { title: 'Riken', note: ui('focus.note.empires'), items: empireItems() },
    { title: 'Försvunna länder', all: true, note: ui('focus.note.vanished'), items: vanishedItems() },
    { title: 'Religioner', note: ui('focus.note.religions'), items: doc ? religionItems(doc) : [], loading: !doc },
    { title: 'Resor', note: ui('focus.note.routes'), items: routeList ? routeItems(routeList) : [], loading: !routeList },
  ];
  focusMenu.setGroups(focusGroups());
  // Nära = inom fyra gånger det tidslinjen visar runt året (vid 1325 cirka ±150 år)
  const syncMenuTime = () => {
    const year = Math.floor(timeline.year), r = Math.round(timeline.windowYears(year) * 4 / 10) * 10;
    const window = ui('focus.window', { years: r, year: formatYear(year) });
    focusMenu.setTime({
      year, from: year - r, to: year + r,
      label: state.range ? `${window}. ${ui('focus.rangeYear')}` : window,
    });
  };
  // Byts året medan menyn är öppen (stegknapparna, uppspelning, adressen) ritas raden och listan om för det nya året (#993)
  timeline.addEventListener('change', () => { if (!focusMenu.menu.hidden) syncMenuTime(); });
  focusMenu.onOpen = async () => {
    app.surfaces.opened('focus');
    $('focus-notice').hidden = true;
    syncMenuTime();
    // Religionerna laddas en gång och sparas, så att de finns kvar nästa gång menyn öppnas, också när lagret
    // Religioner aldrig har öppnats (annars blev fliken tom andra gången)
    const doc = data.religionsDoc ??= await loadReligions();
    focusRoutes ??= await loadRoutes();
    focusThemes ??= await loadThemes();
    focusPlaces ??= await loadPlaces();
    focusMenu.setGroups(focusGroups(doc, focusRoutes, focusThemes, focusPlaces));
  };
  focusMenu.onPick = key => startFocus(key);

  return { startFocus, endFocus, founding, focusMenu, showThemeCard, showPlaceCard };
}
