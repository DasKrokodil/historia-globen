// Fokusläget (#109, #113, #402, del av #389): följ ett krig, ett rike, ett försvunnet land, en religion, en resa,
// ett tema eller en plats. Tidslinjen och globen zoomar in, och uppspelningen går långsamt. Här finns också
// Fokus-menyns listor och raden "Tiden flyttades" (#167). Det man följer står i state.focus, state.focusWar och
// state.focusRoute, som lagren läser.
//
// Varje typ är en post i js/focus/ (#1327, kontraktet står överst i js/focus/registry.js): posten laddar och räknar
// spannet, säger vad kortet visar och ger sin grupp i menyn. Här står bara det som är lika för alla typer.
import { formatYear, groupDigits } from '../model.js';
import { FocusMenu } from '../ui/focusmenu.js';
import { ui } from '../i18n.js';
import { warStory } from './story.js';
import { createFocusTypes } from '../focus/registry.js';
import { FOCUS_ENTRIES } from '../focus/index.js';
import { founding as foundingOf } from '../focus/religion.js';

export function createFocus(app) {
  const { $, state, data, views, globe, timeline, panel } = app;
  const types = app.focusTypes = createFocusTypes(FOCUS_ENTRIES.map(entry => entry(app)));

  /** Händelser där en religion grundades (founding: true), i tidsordning. */
  const founding = id => foundingOf(data.events, id);

  /**
   * Börjar läget Fokus (#893). Fokuset börjar bara om biljetten fortfarande gäller när det har laddats: ingen nyare
   * begäran om Fokus (en annan länk, Bakåt, Avsluta) och ingen tur, lektion eller intervall har börjat under tiden
   * (#865). Ger true när fokuset började.
   *
   * Ordningen är en del av kontraktet (#1327): biljetten tas, raden i menyn döljs, posten laddar (load, som får
   * lägga till data men inte ändra vyn), raden visas om urvalet saknas, biljetten kontrolleras, det gamla fokuset
   * slutar, läget börjar, året jämförs med spannet, posten förbereder (prepare), fokuset sätts, det gemensamma
   * ställs in och ritas, och sist visar posten sitt kort (start).
   */
  async function startFocus(key) {
    const ticket = app.store.ticket('fokus');
    const [type, id] = key.split(':');
    $('focus-notice').hidden = true;
    const post = types.get(type);
    // En okänd typ eller ett okänt id börjar inget fokus
    const loaded = post ? await post.load(id) : null;
    if (!loaded) return false;
    if (loaded.unavailable) {
      $('focus-notice').textContent = ui(loaded.unavailable);
      $('focus-notice').hidden = false;
      return false;
    }
    const f = { type, id, ...loaded };
    types.checkLoaded(post, f);
    // Något annat tog över medan fokuset laddades, eller ett läge som stoppar Fokus pågår (lektionen, #795)
    if (!app.store.current(ticket) || !app.store.canEnter('fokus')) return false;
    // Ett tidsintervall som pågår avslutas av Fokus (MODE_RULES). En typ med startsAtRangeEnd (platsen, #1163) börjar vid intervallets
    // slutår, som Tillbaka till ett år, och kortet säger att intervallet avslutades; övriga typer börjar som förut vid intervallets början
    const closedRange = post.startsAtRangeEnd && state.range ? { from: state.range.from, to: state.range.to } : null;
    if (state.focus) endFocus(false);
    app.store.enter('fokus'); // avslutar en tur som pågår (MODE_RULES i js/state.js); turens lager återställs, inte dess fokus
    if (closedRange) { timeline.year = Math.floor(closedRange.to); f.closedRange = closedRange; }
    // Året stannar om det ligger inom spannet; annars flyttas det till starten och flytten visas (#167)
    const prevYear = timeline.year, prevText = timeline.format(prevYear), keepYear = prevYear >= f.from && prevYear <= f.to;
    post.prepare?.(f);
    const { war = null, route = null } = post.follows?.(f) ?? {};
    app.store.setFocus(f, { war, route });
    app.playback.clearRouteStops();
    app.applyLayers();
    globe.flyTo(f.center[0], f.center[1], 900);
    globe.setZoom(f.zoom);
    $('focus-title').textContent = f.title;
    $('focus-facts').hidden = !post.facts?.has(f);
    $('focus-bar').hidden = false;
    $('app').classList.add('focusing');
    app.surfaces.closeGroup('sidopanel'); // listan stängs så att det man följer syns
    timeline.setFocus({ from: f.from, to: f.to, fine: !!f.fine });
    // Krigets kapitel på tidslinjen hör till det man följer (state.focusWar), inte till en typ
    const focusWar = state.focusWar;
    if (focusWar) timeline.setStory(warStory(focusWar, { timeline, focus: f, end: app.playback.warEndOf() }));
    const startYear = keepYear ? prevYear : f.from;
    f.startYear = startYear; // kortet kan säga vilket år det visas för (#1163)
    app.playback.startAt(startYear);
    timeline.year = startYear;
    showMoved(keepYear ? null : { prevYear, prevText, startYear, short: f.short, movedKey: post.movedKey });
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
  /** Raden i fokusraden när tiden flyttades till fokusets start (#167), med en väg tillbaka. */
  let movedBack = null;
  function showMoved(m) {
    $('focus-moved').hidden = !m;
    $('app').classList.toggle('focus-moved-on', !!m);
    movedBack = m;
    if (!m) return;
    const why = m.movedKey ? ui(m.movedKey) : ui('focus.movedStart', { name: m.short });
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
    $('app').classList.remove('focusing');
    timeline.setFocus(null);
    globe.setZoom(1);
    if (redraw) app.refresh();
  }

  /** Escape stänger först det som ligger ovanpå. När temakortet redan är stängt lämnar nästa Escape temat. */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !isSelection()) return;
    const overlay = ['detail', 'focus-menu', 'layer-menu', 'help', 'feedback', 'sources-dialog', 'jump-pop', 'religion-pop', 'route-pop']
      .some(id => { const el = $(id); return el && !el.hidden; });
    if (overlay || $('app').classList.contains('panel-open')) return;
    e.preventDefault();
    endFocus();
    $('btn-focus').focus({ preventScroll: true });
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
    $('focus-notice').hidden = true;
    syncMenuTime();
    // Det som hämtas först nu (religioner, resor, teman, platser) hämtas en gång, och menyn ritas om en gång
    for (const post of types.all()) await post.menuLoad?.();
    focusMenu.setGroups(types.menu());
  };
  focusMenu.onPick = key => startFocus(key);

  return { startFocus, endFocus, founding, focusMenu, showFacts, isSelection };
}
