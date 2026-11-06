// Fokusläget (#109, #113, #402, del av #389): följ ett krig, ett rike, ett försvunnet land, en religion eller
// en resa. Tidslinjen och globen zoomar in, och uppspelningen går långsamt. Här finns också Fokus-menyns
// listor och raden "Tiden flyttades" (#167). Det man följer står i state.focus, state.focusWar och
// state.focusRoute, som lagren läser.
import { loadReligions, loadEmpire, loadEmpireFacts, loadEventDetails, loadRoutes, loadThemes, CAT, t, symbolUrl, formatYear, formatEventTime, isVisibleReview, edtfSpan, edtfHasDays } from '../model.js';
import { MAX_YEAR } from '../timeline.js';
import { FocusMenu } from '../ui/focusmenu.js';
import { warStory } from './story.js';
import { formatYearSpan } from './facts.js';

// Krig som ryms inom så här många år, med datum i edtf, följs dag för dag i fokusläget (#204)
const SHORT_WAR_YEARS = 2;

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
const empireYears = g => !g.vanished ? `kartdata ${formatYearSpan(g.from, g.to)}`
  : `${formatYearSpan(g.vanished.founded, g.vanished.dissolved)} · ${g.file ? `kartdata ${formatYearSpan(g.from, g.to)}` : 'punkt på kartan'}`;
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
    if (f?.type === 'theme') return true; // temats introduktion och händelser (#398)
    return false;
  }

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
    } else if (type === 'route') {
      const route = (await loadRoutes()).find(r => r.id === id && r.kind === 'voyage');
      if (!route) return;
      // Dagar används bara när själva resans spann har dagprecision. Zheng Hes första resa
      // har medvetet bara år/månad utom vid hemkomsten (#376).
      const fine = edtfHasDays(route.edtf);
      const [from, to] = fine ? edtfSpan(route) : [route.start, route.end];
      const first = route.legs?.[0]?.path?.[0] ?? [0, 0];
      f = { type, id, title: `${t(route.title)} · ${formatEventTime(route)}`, short: t(route.title), from, to, fine,
        center: [first[1], first[0]], zoom: 1.5, route };
    } else if (type === 'theme') {
      // Ett tema (#398): bara temats händelser syns, och tidslinjen zoomar till deras spann
      const theme = (await loadThemes()).find(x => x.id === id);
      const evs = (theme?.events ?? []).map(x => data.byId[x]).filter(e => e && isVisibleReview(e.review));
      if (!evs.length) return;
      await loadEventDetails(evs); // källorna och texterna till temats faktaruta
      const from = Math.min(...evs.map(e => e.start)), to = Math.min(Math.max(...evs.map(e => e.end)), MAX_YEAR);
      f = { type, id, title: `${t(theme.name)} · ${formatYearSpan(from, to)}`, short: t(theme.name), from, to,
        center: [evs.reduce((s, e) => s + e._lat, 0) / evs.length, evs.reduce((s, e) => s + e._lon, 0) / evs.length], zoom: 1,
        events: new Set(evs.map(e => e.id)), theme, list: evs };
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
    // Året stannar om det ligger inom spannet; annars flyttas det till starten och flytten visas (#167)
    const prevYear = timeline.year, prevText = timeline.format(prevYear), keepYear = prevYear >= f.from && prevYear <= f.to;
    if (state.focus) endFocus(false);
    // Temats vy i Lager (#398): besökarens lager sparas och kommer tillbaka när fokus avslutas
    if (type === 'theme' && f.theme.view && layers.views) {
      savedLayers = Object.fromEntries((layers.views.controlled ?? []).map(l => [l, !!layers.on[l]]));
      layers.applyView(f.theme.view);
    }
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
    // Temats introduktion och händelser, som nyckelår som hoppar i tiden (#398)
    if (type === 'theme') showThemeFacts(f);
  }
  /** Temats faktaruta: introduktionen, och temats händelser i tidsordning. Källorna är händelsernas egna. */
  const RANK = ['draft', 'source-checked', 'two-sources'];
  function showThemeFacts(f) {
    const evs = [...f.list].sort((a, b) => a.start - b.start);
    const review = RANK[Math.min(...evs.map(e => Math.max(0, RANK.indexOf(e.review))))];
    panel.showFacts({ kind: 'Tema', name: t(f.theme.name), color: 'var(--brass)', place: evs[0], milestonesTitle: `Händelser i temat (${evs.length})`,
      facts: { summary: f.theme.intro, review, sources: [...new Set(evs.flatMap(e => e.sources ?? []))],
        milestones: evs.map(e => ({ year: e.start, title: e.title, text: e.place })) } });
    $('app').classList.toggle('has-detail', !$('detail').hidden);
  }
  let savedLayers = null;
  /** Raden i fokusraden när tiden flyttades till fokusets start (#167), med en väg tillbaka. */
  let movedBack = null;
  function showMoved(m) {
    $('focus-moved').hidden = !m;
    $('app').classList.toggle('focus-moved-on', !!m);
    movedBack = m;
    if (!m) return;
    const why = m.type === 'war' ? 'då kriget börjar' : m.type === 'theme' ? 'då temats första händelse sker' : `då ${m.short} börjar`;
    $('focus-moved-text').textContent = `Tiden flyttades till ${timeline.format(m.startYear)}, ${why} · `;
    $('focus-moved-back').textContent = `Tillbaka till ${m.prevText}`;
  }
  // Tillbaka lämnar fokus och går till året man stod på, eftersom det ligger utanför spannet
  $('focus-moved-back').addEventListener('click', () => {
    const y = movedBack?.prevYear;
    endFocus(false);
    if (y != null) timeline.year = y;
    app.refresh();
  });
  function endFocus(redraw = true) {
    const wasTheme = state.focus?.type === 'theme';
    app.store.setFocus(null);
    // Lagren som temats vy ändrade kommer tillbaka (#398)
    if (savedLayers) {
      const saved = savedLayers; savedLayers = null;
      for (const [l, on] of Object.entries(saved)) if (!!layers.on[l] !== on) { layers.set(l, on); layers.onChange(l, on); }
    }
    if (wasTheme && !$('detail').hidden) panel.showDetail(null);
    app.playback.reset(); showMoved(null);
    app.applyLayers();
    $('focus-bar').hidden = true;
    $('app').classList.remove('focusing');
    timeline.setFocus(null);
    globe.setZoom(1);
    if (redraw) app.refresh();
  }

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
    const map = `statsreligion på kartan ${formatYearSpan(st[0].start, st.at(-1).end)}`;
    return first ? `grundad ${formatEventTime(first)} · ${map}` : map;
  };
  const religionItems = doc => doc.religions.map(r => {
    const first = founding(r.id)[0];
    const st = stated(r);
    const from = Math.min(first?.start ?? Infinity, st[0].start), to = st.at(-1).end;
    return { key: `religion:${r.id}`, label: t(r.name), terms: langs(r.name), sub: religionSpan(r, first), color: r.color, symbol: symbolUrl(r), from, to };
  });
  const empireItems = () => data.empireGroups.filter(g => !g.vanished).map(g =>
    ({ key: `empire:${g.id}`, label: t(g.name), terms: empireTerms(g), sub: `kartdata ${formatYearSpan(g.from, g.to)}`, color: g.color, symbol: symbolUrl(g), from: g.from, to: g.to }));
  // Försvunna länder (#72): listas alla, i tidsordning, med när de bildades och upplöstes och vad de blev
  const vanishedItems = () => data.empireGroups.filter(g => g.vanished).map(g => {
    const [from, to] = empireSpan(g);
    const names = g.vanished.successors.map(s => t(s.name).split(' (')[0]);
    const blev = names.length > 4 ? `${names.slice(0, 3).join(', ')} och ${names.length - 3} till` : names.join(', ');
    return { key: `empire:${g.id}`, label: t(g.name), terms: empireTerms(g), sub: `${empireYears(g)} · blev ${blev}`, color: g.color, symbol: symbolUrl(g), from, to };
  });
  let focusRoutes = null, focusThemes = null;
  const themeItems = list => list.map(th => {
    const evs = th.events.map(x => data.byId[x]).filter(e => e && isVisibleReview(e.review));
    if (!evs.length) return null;
    const from = Math.min(...evs.map(e => e.start)), to = Math.max(...evs.map(e => e.end));
    return { key: `theme:${th.id}`, label: t(th.name), terms: langs(th.name), sub: `${evs.length} händelser · ${formatYearSpan(from, to)}`, color: 'var(--brass)', from, to };
  }).filter(Boolean);
  const routeItems = list => list.filter(r => r.kind === 'voyage' && isVisibleReview(r.review)).map(r =>
    ({ key: `route:${r.id}`, label: t(r.title), terms: langs(r.title), sub: formatEventTime(r), color: CAT[r.category]?.color, from: r.start, to: r.end }));
  const focusGroups = (doc = null, routeList = focusRoutes, themeList = focusThemes) => [
    { title: 'Krig', items: data.events.filter(e => e.kind === 'war').map(e => ({ key: `war:${e.id}`, label: t(e.title), terms: langs(e.title), sub: formatEventTime(e), color: CAT[e.category]?.color, from: e.start, to: e.end })) },
    { title: 'Riken', note: 'Gränser ur Cliopatria. Årtalen visar när kartdata finns och kan skilja sig från rikets historiska årtal. Ett kolonialvälde har samma färg överallt; stjärnan och den kraftiga kanten visar huvudlandet. En mjuk, utsuddad kant betyder att källorna säger att gränsen är osäker. Glesa prickar med streckad kant är inflytande: lydriken och vasaller enligt Cliopatria. Länder som inte finns längre står under Försvunna länder.', items: empireItems() },
    { title: 'Försvunna länder', all: true, note: 'Länder som inte finns längre: när de bildades och upplöstes enligt källorna, och vilka länder de blev. Gränser ur Cliopatria, som kan ha andra årtal.', items: vanishedItems() },
    { title: 'Religioner', note: 'Visar var religionen var officiell religion eller huvudreligion i en statsbildning, inte religionens ålder eller var alla troende bodde.', items: doc ? religionItems(doc) : [], loading: !doc },
    { title: 'Resor', note: 'Följ en resa i dess egen takt. Pauser finns bara vid källbelagda platser med datum.', items: routeList ? routeItems(routeList) : [], loading: !routeList },
    { title: 'Teman', all: true, note: 'Ett tema visar bara sina händelser, som redan finns på globen med källor. Lagren blir temats vy och kommer tillbaka när du lämnar temat.', items: themeList ? themeItems(themeList) : [], loading: !themeList },
  ];
  focusMenu.setGroups(focusGroups());
  focusMenu.onOpen = async () => {
    panel.setOpen(false); layers.close();
    // Nära = inom fyra gånger det tidslinjen visar runt året (vid 1325 cirka ±150 år)
    const year = Math.floor(timeline.year), r = Math.round(timeline.windowYears(year) * 4 / 10) * 10;
    focusMenu.setTime({ year, from: year - r, to: year + r, label: `inom ±${r} år från ${formatYear(year)}` });
    const doc = focusMenu.groups.find(g => g.title === 'Religioner').loading ? await loadReligions() : data.religionsDoc;
    focusRoutes ??= await loadRoutes();
    focusThemes ??= await loadThemes();
    focusMenu.setGroups(focusGroups(doc, focusRoutes, focusThemes));
  };
  focusMenu.onPick = key => startFocus(key);

  return { startFocus, endFocus, founding, focusMenu, showThemeFacts: () => state.focus?.type === 'theme' && showThemeFacts(state.focus) };
}
