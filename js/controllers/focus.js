// Fokusläget (#109, #113, #402, del av #389): följ ett krig, ett rike, ett försvunnet land, en religion, en resa,
// ett tema eller en plats. Tidslinjen och globen zoomar in, och uppspelningen går långsamt. Här finns också
// Fokus-menyns listor och raden "Tiden flyttades" (#167). Det man följer står i state.focus, state.focusWar och
// state.focusRoute, som lagren läser.
//
// Varje typ är en post i js/focus/ (#1327, kontraktet står överst i js/focus/registry.js): posten laddar och räknar
// spannet, säger vad kortet visar och ger sin grupp i menyn. Här står bara det som är lika för alla typer.
import { formatYear, groupDigits, placesLoadStatus } from '../model.js';
import { FocusMenu } from '../ui/focusmenu.js';
import { ui } from '../i18n.js';
import { OVERLAY_IDS } from '../surfaces.js';
import { warStory } from './story.js';
import { formatYearSpan } from './facts.js';
import { createFocusTypes } from '../focus/registry.js';
import { FOCUS_ENTRIES } from '../focus/index.js';
import { founding as foundingOf } from '../focus/religion.js';

export function createFocus(app) {
  const { $, state, data, views, globe, timeline, panel } = app;
  const types = app.focusTypes = createFocusTypes(FOCUS_ENTRIES.map(entry => entry(app)));

  /** Händelser där en religion grundades (founding: true), i tidsordning. */
  const founding = id => foundingOf(data.events, id);

  let pendingPlaceNotice = null;
  // Beskedet hör till begäran som visade det. En ny adress kan hinna före medan platsen laddas.
  const clearNotice = () => {
    pendingPlaceNotice = null;
    $('focus-notice').hidden = true;
  };

  /**
   * Börjar läget Fokus (#893). Fokuset börjar bara om biljetten fortfarande gäller när det har laddats: ingen nyare
   * begäran om Fokus (en annan länk, Bakåt, Avsluta) och ingen tur, lektion eller intervall har börjat under tiden
   * (#865). Ger true när fokuset började.
   *
   * Ordningen är en del av kontraktet (#1327): biljetten tas, raden i menyn döljs, posten laddar (load, som får
   * lägga till data men inte ändra vyn), beskedet visas om urvalet saknas och biljetten fortfarande gäller, biljetten kontrolleras, det gamla fokuset
   * slutar, läget börjar, året jämförs med spannet, posten förbereder (prepare), fokuset sätts, det gemensamma
   * ställs in och ritas, och sist visar posten sitt kort (start).
   *
   * within ({ from, to }, valfri, #1448): en period inom fokusets spann, till exempel ett rike i landskortet. Året stannar bara om det
   * ligger inom perioden; annars börjar fokuset vid periodens första år, och raden om flytten nämner perioden.
   *
   * origin ({ key, name }, valfri, #1713): fokuset började från ett annat fokus som det ersätter, till exempel Följ riket i landskortet.
   * Fokusraden får då knappen "Till platsen …" som börjar följa origin.key igen, så att man inte måste använda webbläsarens Bakåt.
   */
  async function startFocus(key, { within = null, origin = null, fromAddress = false } = {}) {
    const ticket = app.store.ticket('fokus');
    const [type, id] = key.split(':');
    clearNotice();
    const post = types.get(type);
    if (fromAddress && type === 'place' && ['idle', 'loading'].includes(placesLoadStatus())) {
      pendingPlaceNotice = ticket;
      $('focus-notice').textContent = ui('place.loadingLink');
      $('focus-notice').hidden = false;
    }
    // En okänd typ eller ett okänt id börjar inget fokus
    let loaded;
    try {
      loaded = post ? await post.load(id) : null;
    } finally {
      if (pendingPlaceNotice === ticket) clearNotice();
    }
    if (!loaded) return false;
    if (loaded.unavailable) {
      // Beskedet visas bara om ingen nyare begäran har tagit över: en plats som laddas långsamt och saknas ska inte ge ett
      // besked ovanpå den vy som besökaren redan har gått vidare till (#865, #1162)
      if (app.store.current(ticket)) {
        $('focus-notice').textContent = ui(loaded.unavailable);
        $('focus-notice').hidden = false;
      }
      return false;
    }
    const f = { type, id, ...loaded };
    if (origin?.key) f.origin = { key: origin.key, name: origin.name };
    types.checkLoaded(post, f);
    // Något annat tog över medan fokuset laddades, eller ett läge som stoppar Fokus pågår (lektionen, #795)
    if (!app.store.current(ticket) || !app.store.canEnter('fokus')) return false;
    // Ett tidsintervall som pågår avslutas av Fokus (MODE_RULES). En typ med startsAtRangeEnd (platsen, #1163) börjar vid intervallets
    // slutår, som Tillbaka till ett år, och kortet säger att intervallet avslutades; övriga typer börjar som förut vid intervallets början
    const closedRange = post.startsAtRangeEnd && state.range ? { from: state.range.from, to: state.range.to } : null;
    if (state.focus) endFocus(false);
    app.store.enter('fokus'); // avslutar en tur som pågår (MODE_RULES i js/state.js); turens lager återställs, inte dess fokus
    // Året stannar om det ligger inom spannet; annars flyttas det till starten och flytten visas (#167). Efter ett intervall: slutåret
    // om det ligger inom spannet, annars intervallets början om den gör det (som förut), annars spannets start
    const inSpan = y => y >= f.from && y <= f.to;
    const prevYear = closedRange ? [closedRange.to, closedRange.from].map(Math.floor).find(inSpan) ?? Math.floor(closedRange.from) : timeline.year;
    if (closedRange) f.closedRange = closedRange;
    const inWithin = y => !within || (y >= within.from && y <= within.to);
    const prevText = timeline.format(prevYear), keepYear = inSpan(prevYear) && inWithin(prevYear);
    const periodStart = within && inSpan(within.from) ? within.from : null;
    post.prepare?.(f);
    const { war = null, route = null } = post.follows?.(f) ?? {};
    app.store.setFocus(f, { war, route });
    app.playback.clearRouteStops();
    app.applyLayers();
    globe.flyTo(f.center[0], f.center[1], 900);
    globe.setZoom(f.zoom);
    $('focus-title').textContent = f.title;
    $('focus-facts').hidden = !post.facts?.has(f);
    // Platsens knapp heter Om platsen i stället för det anonyma Fakta (#1790); data-i18n följer med vid språkbyte
    const factsKey = f.type === 'place' ? 'place.cardLabel' : 'focus.facts';
    $('focus-facts').dataset.i18n = factsKey;
    $('focus-facts').textContent = ui(factsKey);
    showOrigin(f.origin);
    $('focus-bar').hidden = false;
    $('app').classList.add('focusing');
    app.surfaces.closeGroup('sidopanel'); // listan stängs så att det man följer syns
    timeline.setFocus({ from: f.from, to: f.to, fine: !!f.fine });
    // Krigets kapitel på tidslinjen hör till det man följer (state.focusWar), inte till en typ
    const focusWar = state.focusWar;
    if (focusWar) timeline.setStory(warStory(focusWar, { timeline, focus: f, end: app.playback.warEndOf() }));
    const startYear = keepYear ? prevYear : periodStart ?? f.from;
    f.startYear = startYear; // kortet kan säga vilket år det visas för (#1163)
    app.playback.startAt(startYear);
    timeline.year = startYear;
    // Perioden som valdes i landskortet (#1448) står i raden, eftersom riket som följs är hela gruppen (Sverige 980–2024)
    const period = within?.name ? ui('focus.chosenPeriod', { name: within.name, years: formatYearSpan(within.from, within.to) }) : '';
    showMoved(keepYear && !period ? null : { prevYear, prevText, startYear, short: f.short, movedKey: post.movedKey, moved: !keepYear, period,
      why: periodStart != null ? ui('focus.movedPeriod', { years: formatYearSpan(within.from, within.to) }) : null });
    app.refresh();
    post.start?.(f);
    return true;
  }
  /** Knappen Fakta i fokusraden: postens faktaruta eller kort för det man följer. */
  function showFacts() {
    const f = state.focus;
    if (f) types.of(f)?.facts?.show(f);
  }
  /** Följer man ett urval (tema eller plats)? Då hör kortet till fokuset, och Escape och Avsluta lämnar det. */
  const isSelection = () => !!state.focus?.eventIds;
  /**
   * Raden i fokusraden när tiden flyttades till fokusets start (#167), med en väg tillbaka. period (#1448): perioden som valdes i
   * landskortet står först i raden, också när tiden inte flyttades (moved: false; då utan Tillbaka). Raden är role="status".
   */
  let movedBack = null;
  function showMoved(m) {
    $('focus-moved').hidden = !m;
    $('app').classList.toggle('focus-moved-on', !!m);
    movedBack = m;
    if (!m) return;
    const moved = m.moved !== false;
    const why = m.why ?? (m.movedKey ? ui(m.movedKey) : ui('focus.movedStart', { name: m.short }));
    const parts = [m.period, moved ? ui('focus.moved', { year: timeline.format(m.startYear), why }) : ''].filter(Boolean);
    $('focus-moved-text').textContent = `${parts.join(' · ')}${moved ? ' · ' : ''}`;
    $('focus-moved-back').hidden = !moved;
    $('focus-moved-back').textContent = moved ? ui('focus.movedBack', { year: m.prevText }) : '';
  }
  // Raden behövs bara innan man börjar spela: under uppspelningen gör den fokusraden högre och krockar med pausraden (#647)
  timeline.addEventListener('playstate', () => { if (timeline.playing && movedBack) showMoved(null); });
  // Raden säger året tiden flyttades till. Står året inte längre där (slutkortet, ett hopp, en länk som pekar efter slutet, dragning)
  // stämmer den inte, och då försvinner den; en vald period (#1448) står kvar, utan "Tiden flyttades" och Tillbaka (#1857).
  // Toleransen är en dag i fokusläget för korta krig och ett halvt år annars, så att avrundningen när året sätts inte räknas.
  timeline.addEventListener('change', () => {
    const m = movedBack;
    if (!m || m.moved === false) return;
    const tol = timeline.focus?.fine ? 1 / 365.25 : 0.5;
    if (Math.abs(timeline.year - m.startYear) <= tol) return;
    showMoved(m.period ? { ...m, moved: false } : null);
  });
  // Tillbaka lämnar fokus och går till året man stod på, eftersom det ligger utanför spannet
  $('focus-moved-back').addEventListener('click', () => {
    const y = movedBack?.prevYear;
    endFocus(false);
    if (y != null) timeline.year = y;
    app.refresh();
  });
  /** Knappen tillbaka till det fokus som ersattes (#1713, till exempel platsen när Följ riket trycktes); dold när fokuset inte kom därifrån. */
  function showOrigin(origin) {
    const button = $('focus-origin');
    button.hidden = !origin;
    button.textContent = origin ? ui('focus.originPlace', { name: origin.name }) : '';
  }
  $('focus-origin').addEventListener('click', async () => {
    const origin = state.focus?.origin;
    if (!origin) return;
    // Platsens kort tar tangentbordsfokus själv när det ritas (showPlaceCard); misslyckas starten ligger fokus kvar på knappen
    await startFocus(origin.key);
  });
  function endFocus(redraw = true) {
    const wasTheme = isSelection();
    app.store.leave(['fokus']);
    app.store.setFocus(null);
    if (wasTheme) {
      app.store.setSelected(null);
      panel.setDetailOpen(false);
    }
    app.playback.reset(); showMoved(null);
    app.applyLayers();
    $('focus-bar').hidden = true;
    showOrigin(null);
    $('app').classList.remove('focusing');
    timeline.setFocus(null);
    globe.setZoom(1);
    if (redraw) app.refresh();
  }

  /** Följer man en resa (#1380)? Escape lämnar den som ett tema, så att man kommer ut utan musen när stegknapparna har fokus. */
  const isRoute = () => state.focus?.type === 'route';

  /** Escape stänger först det som ligger ovanpå. När temakortet redan är stängt lämnar nästa Escape temat, och likadant resan. */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !(isSelection() || isRoute())) return;
    const overlay = OVERLAY_IDS.some(id => { const el = $(id); return el && !el.hidden; });
    if (overlay || $('app').classList.contains('panel-open')) return;
    e.preventDefault();
    endFocus();
    // Sök och följ ligger i menyn Meny i smal skärm och syns inte där: fokus går då till menyknappen i stället för att tappas
    ['btn-focus', 'more-toggle', 'btn-more'].map($).find(el => el?.getClientRects().length)?.focus({ preventScroll: true });
  }, { capture: true });

  // Fokusmenyn listar posternas grupper. Resorna, religionerna, temana och platserna hämtas när menyn öppnas.
  // Tidsåldrarna i Fokus kommer från de globala bildstilarna, inte från ny historisk data (#507).
  const focusAges = data.styles.styles.filter(style => !style.regions.length).map(style => ({
    ...style, label: views?.focus?.timeAges?.[style.id] ?? '',
  }));
  const focusMenu = new FocusMenu({ button: $('btn-focus'), menu: $('focus-menu'), texts: {
    groupByAge: views?.focus?.groupByAge, showAll: views?.focus?.showAll, showNearest: views?.focus?.showNearest,
  }, ages: focusAges });
  // Varje post ger sin grupp, och varje rad har sitt tidsspann (from–to), så att menyn kan visa det som hör till
  // tiden man står i (#121). title är gruppens id (samma som flikarna i focusmenu.js); namnet hämtas där med ui() (#671)
  focusMenu.setGroups(types.menu());
  // Nära = inom fyra gånger det tidslinjen visar runt året (vid 1325 cirka ±150 år)
  const syncMenuTime = () => {
    // Fönstret kan vara olika långt före och efter året vid en segmentgräns (#1319)
    const year = Math.floor(timeline.year), span = timeline.windowSpan(year);
    const rb = Math.round(span.before * 4 / 10) * 10, ra = Math.round(span.after * 4 / 10) * 10;
    const window = rb === ra ? ui('focus.window', { years: rb, year: formatYear(year) })
      : ui('focus.windowAsym', { before: groupDigits(rb), after: groupDigits(ra), year: formatYear(year) });
    focusMenu.setTime({
      year, from: year - rb, to: year + ra,
      label: state.range ? `${window}. ${ui('focus.rangeYear')}` : window,
    });
  };
  // Byts året medan menyn är öppen (stegknapparna, uppspelning, adressen) ritas raden och listan om för det nya året (#993)
  timeline.addEventListener('change', () => { if (!focusMenu.menu.hidden) syncMenuTime(); });
  focusMenu.onOpen = async () => {
    app.surfaces.opened('focus');
    if (!pendingPlaceNotice) clearNotice();
    syncMenuTime();
    // Det som hämtas först nu (religioner, resor, teman, platser) hämtas en gång, och menyn ritas om en gång
    for (const post of types.all()) await post.menuLoad?.();
    focusMenu.setGroups(types.menu());
  };
  // Kortet som valet öppnar hör till menyknappen (#1696): Escape och Stäng ger fokus tillbaka dit, inte till Samtidigt
  focusMenu.onPick = async key => {
    app.detailFocus?.pickFromMenu(true);
    try { return await startFocus(key); } finally { app.detailFocus?.pickFromMenu(false); }
  };
  focusMenu.onRetryPlaces = async () => {
    const request = types.get('place').menuLoad({ retry: true });
    focusMenu.setGroups(types.menu());
    await request;
    if (state.labels?.placeHints) app.places.ensure();
    focusMenu.setGroups(types.menu());
  };

  return { startFocus, endFocus, founding, focusMenu, showFacts, isSelection, clearNotice };
}
