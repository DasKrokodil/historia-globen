// Uppspelningens pauser i fokusläget (#402, del av #389): krigets stopp och slutkort (#122, #217, #232),
// resans stopp (#376), "Spela klart" (#244), huvudknappen i fokusraden (#360) och pauserna när ett krig
// bryter ut, en religion grundas, ett rike når ett nyckelår eller man följer en plats eller ett tema (#1255).
//
// Köerna ägs här och ingen annanstans. Omritningen (render.js) anropar check() efter att lagren har ritats,
// och samma köer återupptas av Fortsätt (beforeplay). Därför flyttas omritningen och uppspelningen tillsammans:
// de delar köerna men inte tillståndet i state (beslutet i #402).
import { t, isVisibleReview } from '../model.js';
import { MAX_YEAR } from '../timeline.js';
import { routeStops as stopsForRoute } from '../layers/lines.js';
import { hasTag } from '../layers/events.js';
import { stopDate } from './story.js';
import { stopIndexAt, stepTarget, stepState, followersAtSameTime, keysThrough } from '../route-steps.js';
import { ui } from '../i18n.js';

export function createPlayback(app) {
  const { $, state, data, timeline, panel, layers, ff, globe } = app;
  let lastYear = 0;
  let warStops = [], stopping = false; // kö med stopp när man följer ett krig (#217)
  let routeStops = []; // kö med stopp när man följer en resa (#376)
  // Stoppet som pausraden visar just nu (index bland resans stopp) och dess text: Föregående och Nästa stopp stegar därifrån (#1380).
  // -1 när raden visar något annat eller inte syns; då har knapparna inget att utgå från och döljs.
  let stepIdx = -1, stepText = null;
  // Stopp som redan har visats i den här genomspelningen, och om slutkortet har visats (#232).
  // Båda glöms när tiden flyttas för hand eller man följer något annat.
  let shownStops = new Set(), endShown = false;
  // "Spela klart" (#244): uppspelningen går till krigets slut utan att pausa vid stora händelser eller
  // Samtidigt-kort, men slutkortet visas. Gäller tills uppspelningen stannar eller tiden flyttas för hand.
  let finishing = false, finishNext = false;

  // Stopp i uppspelningen när man följer ett krig: en stor händelse eller 'end' för slutkortet (#122, #217)
  function showWarStop(stop, fine) {
    const focusWar = state.focusWar;
    stopping = true;
    if (stop === 'end') {
      endShown = true; finishing = false; // knappen blir "Spela igen" (#232)
      timeline.pause(ui(focusWar.ongoing ? 'play.pausedToday' : 'play.pausedWarEnd'), true); app.store.setSelected(focusWar.id); panel.showStory(focusWar, 'summary');
    } else {
      // I smal skärm öppnas inte panelen, så att kartan syns; händelsen markeras på globen
      shownStops.add(stop.id);
      timeline.pause(ui('play.pausedMajor'), true); app.store.setSelected(stop.id); panel.showDetail(stop, matchMedia('(min-width: 761px)').matches);
      // Tiden står på händelsens år, i ett kort krig på dess dag (#204, #224), också när flera
      // stopp kom i samma steg eller tiden redan hade hunnit förbi händelsen.
      timeline.year = timeline.spanOf(stop)[0];
    }
    stopping = false;
    $('app').classList.toggle('has-detail', !$('detail').hidden);
    showNextPause();
  }

  function showRouteStop(stop, index = null) {
    const focusRoute = state.focusRoute;
    stopping = true;
    const place = stop.place;
    const text = place.text ? `${ui('play.pausedText', { text: t(place.text) })} · ${t(focusRoute.title)}`
      : `${ui('play.pausedAt', { name: t(place.name) })} · ${stopDate(place)} · ${t(focusRoute.title)}`;
    // Noten finns redan i resedatan och ska synas vid varje stopp, så att osäkerheten inte tappas bort.
    // Rubriken syns i pausraden och texten fälls ut, så att raden inte blir så hög att den krockar (#647).
    // Skärmläsaren får hela noten, och "Stopp 3 av 6" först när resan har flera stopp (#1380).
    const note = focusRoute.note ? { title: t(focusRoute.note.title), text: t(focusRoute.note.text) } : null;
    const stops = stopsForRoute(focusRoute);
    const at = index ?? stops.findIndex(s => s.key === stop.key);
    const counter = stops.length > 1 && at >= 0 ? `${ui('route.stopOf', { n: at + 1, total: stops.length })}. ` : '';
    stepIdx = at; stepText = text; // före pause(), vars 'pausenote' säger att raden är stoppets
    timeline.pause(text, true, `${counter}${note ? `${text} · ${note.title}: ${note.text}` : text}`, note);
    timeline.year = stop.at;
    stopping = false;
    showNextPause();
  }

  /** Stopp, plats och datum för en stegknapp: "Rincónbukten, 13 januari 1493". */
  const stopLabel = stop => [t(stop.place.name), stopDate(stop.place)].filter(Boolean).join(', ');
  /** Föregående och Nästa stopp i pausraden (#1380): syns bara medan raden visar ett resestopp, och bara åt det håll det finns ett stopp. */
  function updateStepButtons() {
    const touring = app.store.active('tur') || app.store.active('lektion'); // ingen bläddring där turen eller lektionen styr tiden
    const stops = state.focusRoute && !touring ? stopsForRoute(state.focusRoute) : [];
    const s = stepState(stops, stepIdx);
    for (const [id, on, dir, key] of [['pause-prev-stop', s.hasPrev, -1, 'route.prevStop'], ['pause-next-stop', s.hasNext, 1, 'route.nextStop']]) {
      const button = $(id);
      button.hidden = !on;
      if (!on) continue;
      const to = stepTarget(stops, stepIdx, dir);
      button.setAttribute('aria-label', ui('route.stepLabel', { action: ui(key), where: stopLabel(stops[to]), n: to + 1, total: s.total }));
      button.title = button.getAttribute('aria-label');
    }
  }
  /** Steg till föregående (-1) eller nästa (1) stopp: tiden och kameran flyttas dit och pausraden visar stoppet. */
  function stepStop(direction) {
    const stops = state.focusRoute ? stopsForRoute(state.focusRoute) : [];
    const to = stepTarget(stops, stepIdx, direction);
    if (to == null || app.store.active('tur') || app.store.active('lektion')) return;
    const pressed = document.activeElement;
    if (timeline.playing) timeline.pause(); // byte under uppspelning pausar först
    app.address?.flush(); // stoppet man står på skrivs i adressen före flytten, så att Bakåt går tillbaka till det (#1380)
    // Kön och de visade stoppen följer det nya stoppet: Fortsätt går därifrån, också efter ett steg bakåt, och stopp med
    // samma år ligger i kön eftersom uppspelningen aldrig passerar dem
    routeStops = followersAtSameTime(stops, to);
    shownStops = new Set(keysThrough(stops, to));
    finishing = false;
    const [lon, lat] = stops[to].place.at ?? [];
    if (lat != null) globe.flyTo(lat, lon, 700); // Lugn rörelse hoppar i stället för att flyga (globe.js)
    showRouteStop(stops[to], to);
    app.address?.flush({ push: true });
    // Knappen som trycktes kan ha försvunnit (första eller sista stoppet): fokus flyttas till den som finns kvar, annars till Fortsätt
    if (pressed?.id?.startsWith('pause-') && pressed.hidden) {
      const other = [$('pause-prev-stop'), $('pause-next-stop')].find(b => !b.hidden) ?? $('pause-go');
      other.focus({ preventScroll: true });
    }
  }
  $('pause-prev-stop').addEventListener('click', () => stepStop(-1));
  $('pause-next-stop').addEventListener('click', () => stepStop(1));
  // Raden bytte text eller försvann: den visar inte längre stoppet, och knapparna har inget att utgå från
  timeline.addEventListener('pausenote', e => {
    if (e.detail.text !== stepText) { stepIdx = -1; stepText = null; }
    updateStepButtons();
  });

  /**
   * Tiden står på ett resestopp när fokus på resan börjar eller när Bakåt och Framåt flyttar tiden (adressen, #1380): visa stoppet
   * i pausraden, så att en länk till "Magellan vid stopp 4" visar stoppet och stegknapparna. Ger true när ett stopp visades.
   * Gäller bara när resans pauser är på (Lager) och uppspelningen står still.
   */
  function restoreStop() {
    if (!state.focusRoute || timeline.playing || !layers.pause.route) return false;
    const stops = stopsForRoute(state.focusRoute);
    const at = stopIndexAt(stops, timeline.year);
    if (at < 0) return false;
    routeStops = followersAtSameTime(stops, at);
    shownStops = new Set(keysThrough(stops, at));
    showRouteStop(stops[at], at);
    return true;
  }

  /** Platsens eller temats stopp (#1255): händelserna med top eller major, annars alla, i tidsordning. */
  function themeStops(focus) {
    const evs = [...(focus.themeEvents || [])].sort((a, b) => a.start - b.start);
    const important = evs.filter(e => e.top || e.major);
    return important.length ? important : evs;
  }

  /** Krigets slut i fokusläget: sista dagen eller året, och "i dag" för ett pågående krig (#223). */
  const warEndOf = () => Math.min(timeline.spanOf(state.focusWar)[1], MAX_YEAR);
  /** Nästa stopp som Fortsätt ska visa: kön, eller slutkortet om tiden står i krigets slut och
   *  kortet inte har visats än. Då börjar uppspelningen aldrig om före slutkortet (#232). */
  function queuedStop() {
    const { focusWar, focusRoute } = state;
    if (focusRoute) return routeStops[0] ?? null;
    if (!focusWar) return null;
    if (warStops.length) return warStops[0];
    return focusWar.story && !endShown && timeline.year >= warEndOf() ? 'end' : null;
  }
  /** Nästa paus när man följer ett krig: köat stopp, nästa stora händelse (om pausen är vald) eller slutkortet. */
  function nextPause() {
    const { focusWar, focusRoute, focus } = state;
    const q = queuedStop();
    if (q || focusRoute || !focusWar) return q;
    const y = timeline.year, at = e => timeline.spanOf(e)[0];
    // Händelser på fokusets första dag eller år räknas när uppspelningen startar där (#224)
    const ahead = e => !shownStops.has(e.id) && (at(e) > y || (at(e) === y && y === focus.from));
    const next = layers.pause.major && !finishing ? focusWar._battles.filter(b => b.major && ahead(b)).sort((a, b) => at(a) - at(b))[0] : null;
    return next ?? (focusWar.story && !endShown ? 'end' : null);
  }
  /** Raden "Nästa paus: …" vid spelknappen (#244). I smal skärm står den i pausraden. */
  function showNextPause() {
    const { focusWar, focusRoute } = state;
    const n = nextPause();
    const text = !n ? '' : n === 'end' ? ui(focusWar.ongoing ? 'play.nextToday' : 'play.nextWarEnd')
      : focusRoute ? `${t(n.place.name)} (${stopDate(n.place)})` : `${t(n.title)} (${timeline.format(timeline.spanOf(n)[0])})`;
    for (const [el, key] of [[$('next-pause'), 'play.nextPause'], [$('pause-next'), 'play.next']]) {
      el.hidden = !text;
      el.textContent = text ? ui(key, { text }) : '';
      el.title = text ? ui('play.nextPause', { text }) : '';
    }
    showWarPlay(focusWar ? n : null);
    timeline.refreshPlayLabel();
    updateFocusAction(n);
  }
  /** Fokusläget har samma tydliga huvudåtgärd för krig, riken och religioner (#360). */
  function updateFocusAction(next = nextPause()) {
    if (!state.focus) return;
    const action = $('focus-action');
    const running = timeline.playing;
    // Efter en automatisk paus ska eleven fortsätta där berättelsen stannade. "Spela klart"
    // erbjuds först när ett krigsstopp redan har visats, så starten alltid heter "Spela".
    const finish = !running && !timeline.resumable && !timeline.atEnd && state.focusWar && shownStops.size > 0 && next && next !== 'end' && !finishing;
    const label = ui(running ? 'play.pause' : timeline.resumable ? 'play.resume' : timeline.atEnd ? 'play.again' : finish ? 'play.finishLabel' : 'play.play');
    action.dataset.action = running ? 'pause' : finish ? 'finish' : 'play';
    action.textContent = `${running ? 'Ⅱ' : '▶'} ${label}`;
    action.setAttribute('aria-label', ui('play.focusActionLabel', { action: label }));
    $('focus-state').textContent = `${timeline.format(timeline.year)} · ${ui(running ? 'play.playing' : 'play.still')}`;
  }
  /** Raden vid spelknappen när man följer ett krig (#244): vilka pauser som är på (valen i Lager) och
   *  "Spela klart", som syns så länge det finns något att hoppa över före slutet. I smal skärm står
   *  knappen i pausraden och pauserna i knappens namn. */
  function showWarPlay(n) {
    const focusWar = state.focusWar;
    $('war-play').hidden = !focusWar;
    const skip = !!focusWar && !!n && n !== 'end' && !finishing;
    $('wp-finish').hidden = !skip;
    $('pause-finish').hidden = !skip;
    if (!focusWar) return;
    const item = (el, on, long, short, what) => {
      el.classList.toggle('on', on);
      el.replaceChildren(`${on ? '●' : '○'} `);
      for (const [cls, txt] of [['wp-long', long], ['wp-short', short]]) {
        const sp = document.createElement('span'); sp.className = cls; sp.textContent = txt; el.append(sp);
      }
      if (!on) el.append(` (${ui('play.off')})`);
      el.title = ui('play.pausesAt', { what, state: ui(on ? 'play.on' : 'play.off') });
    };
    item($('wp-major'), layers.pause.major, ui('play.wpMajor'), ui('play.wpMajorShort'), ui('play.wpMajorWhat'));
    item($('wp-ff'), layers.pause.focusFunfacts, ui('play.wpFf'), ui('play.wpFf'), ui('play.wpFfWhat'));
    const pauses = ui('play.pausesState', { major: ui(layers.pause.major ? 'play.on' : 'play.off'), ff: ui(layers.pause.focusFunfacts ? 'play.on' : 'play.off') });
    for (const b of [$('wp-finish'), $('pause-finish')]) {
      b.title = `${ui('play.finishTitle')} ${pauses}`;
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

  /**
   * Pauserna efter en omritning (anropas av render.js när lagren har ritats). year, fine och span är
   * omritningens, playing = om tidslinjen spelade när omritningen började, eventsOn = om Händelser är på.
   */
  function check({ year, fine, span, playing, eventsOn }) {
    const { focus, focusWar, focusRoute } = state;
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
    // Resans markerade stopp köas i samma steg. Det behövs när flera godkända stopp har samma år,
    // som Palembang och Nanjing 1407, och när den årsvisa tidslinjen går förbi dem i ett enda steg.
    if (focusRoute && playing && layers.pause.route) {
      const hits = stopsForRoute(focusRoute).filter(s => !shownStops.has(s.key) && passed(s.at));
      routeStops = [...routeStops, ...hits];
      if (routeStops.length) {
        const stop = routeStops.shift();
        shownStops.add(stop.key);
        showRouteStop(stop);
      }
    }
    // I fokus på en religion stannar uppspelningen vid händelserna när den grundades (#123)
    if (focus?.type === 'religion' && timeline.playing) {
      const hit = app.founding(focus.id).find(e => e.start > lastYear && e.start <= year);
      if (hit) { timeline.pause(ui('play.pausedFounding')); app.store.setSelected(hit.id); panel.showDetail(hit, matchMedia('(min-width: 761px)').matches); }
    }
    // I fokus på en plats eller ett tema stannar uppspelningen vid händelserna (#1255): de viktiga (top eller major)
    // om det finns några, annars alla. Tiden står på händelsens år, så nästa Spela fortsätter till nästa.
    if (focus?.themeEvents && playing && layers.pause.theme) {
      const hit = themeStops(focus).find(e => !shownStops.has('t:' + e.id) && passed(e.start));
      if (hit) {
        // Stoppet sparas som visat, så att en omritning under pausen inte ger samma stopp igen vid Fortsätt.
        // stopping hindrar att tidsflytten nedan tömmer shownStops (change-lyssnaren).
        shownStops.add('t:' + hit.id);
        timeline.pause(ui('play.pausedThemeEvent', { title: t(hit.title) }));
        stopping = true;
        timeline.year = hit.start;
        stopping = false;
        app.store.setSelected(hit.id);
        panel.showDetail(hit, matchMedia('(min-width: 761px)').matches);
      }
    }
    // I fokus på ett rike stannar uppspelningen vid rikets nyckelår, och kortet säger varför
    // riket växer eller krymper (#171). Valet finns i Lager.
    if (focus?.type === 'empire' && timeline.playing && layers.pause.empire) {
      const hit = app.storyFor(focus.id).find(c => c.year > lastYear && c.year <= year);
      if (hit) { timeline.pause(ui('play.pausedKeyYear', { label: hit.label, title: hit.title || ui('play.keyYear') })); timeline.year = hit.year; }
    }
    // Pausa när ett krig bryter ut, om det är valt i lagermenyn (#114)
    if (!focus && timeline.playing && layers.pause.wars && eventsOn) {
      const war = data.events.find(e => e.kind === 'war' && e.start > lastYear && e.start <= year
        && panel.filters.has(e.category) && hasTag(e, state.tag) && isVisibleReview(e.review));
      if (war) { timeline.pause(ui('play.pausedWarStart')); timeline.year = war.start; app.store.setSelected(war.id); panel.showDetail(war); }
    }
    lastYear = year;
  }

  /** Ett nytt fokus börjar (startFocus): resans kö töms. */
  function clearRouteStops() { routeStops = []; stepIdx = -1; stepText = null; updateStepButtons(); }
  /** Ett nytt fokus börjar på startYear (startFocus): passerade stopp räknas därifrån. */
  function startAt(startYear) { lastYear = startYear; }
  /** Fokus avslutas (endFocus): köerna, de visade stoppen och Spela klart glöms. */
  function reset() {
    warStops = []; routeStops = []; shownStops = new Set(); endShown = false; finishing = false;
    stepIdx = -1; stepText = null; updateStepButtons();
  }

  timeline.addEventListener('change', () => {
    // Tiden flyttades för hand (året ändrades utan uppspelning och inte av ett stopp): kön med krigets
    // stopp glöms, och stoppen visas igen när man spelar på nytt (#232). Också "Spela igen" går hit.
    if (!timeline.playing && !stopping) {
      warStops = []; routeStops = []; shownStops = new Set(); finishing = false;
      if (state.focusWar && timeline.year < warEndOf()) endShown = false;
    }
    app.refresh();
  });
  // Uppspelningen kan också ändras av ett stopp eller av att tidslinjen når slutet.
  // Huvudknappen i Fokus ska alltid följa tidslinjens faktiska läge (#360).
  timeline.addEventListener('playstate', () => updateFocusAction());
  // Fortsätt efter ett stopp i ett krig eller en resa: nästa köade stopp visas innan tiden går vidare.
  timeline.hasMore = () => !!queuedStop();
  timeline.addEventListener('beforeplay', e => {
    // Vanlig uppspelning pausar som valt i Lager; Spela klart sätter finishNext precis innan
    finishing = finishNext && !!state.focusWar; finishNext = false;
    const stop = queuedStop();
    if (!stop) return;
    e.preventDefault();
    if (state.focusRoute) {
      if (routeStops[0] === stop) routeStops.shift();
      shownStops.add(stop.key);
      showRouteStop(stop);
    } else {
      if (warStops[0] === stop) warStops.shift();
      showWarStop(stop, !!state.focus?.fine);
    }
  });
  $('focus-action').addEventListener('click', () => {
    if ($('focus-action').dataset.action === 'pause') timeline.pause();
    else if ($('focus-action').dataset.action === 'finish') playToEnd();
    else timeline.play();
    showNextPause();
  });
  // Uppspelningen stannar vid en ny fun fact, så att man hinner läsa. Play fortsätter.
  // Ihopfällt kort: ingen paus, eftersom kortet inte syns
  // I fokusläget pausar uppspelningen som standard bara vid det man följer; Samtidigt-pausen är där ett eget val (#234)
  // Med valet "Fortsätt själv" (på som standard, #578) räknas pausen ned och uppspelningen fortsätter av sig själv.
  ff.onNew = () => {
    const on = state.focus ? layers.pause.focusFunfacts : layers.pause.funfacts;
    if (timeline.playing && on && !ff.minimized && !finishing) {
      const auto = !!layers.pause.ffAuto;
      const secs = auto ? readingSeconds(ff.announcement()) : 0;
      const tail = auto ? ` ${ui('play.autoIn', { secs })}` : '';
      timeline.pause(ui('play.pausedFf'), false, `${ui('play.pausedFf')}. ${ff.announcement()}${tail}`);
      if (auto) startCountdown(secs);
    }
  };

  // Nedräkningen vid Samtidigt-kortet (#578). Tiden följer textens längd, minst 3 sekunder.
  // Siffran är aria-hidden: skärmläsaren får bara meddelandet ovan, inte varje sekund (#506).
  // Rör man kortet, väljer en händelse, flyttar tiden eller stänger av valet avbryts nedräkningen
  // och uppspelningen står still tills man trycker Fortsätt.
  const countdownEl = $('pause-countdown');
  let countdown = null;
  function readingSeconds(text) {
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.min(15, Math.max(3, Math.ceil(words / 3)));
  }
  function showCountdown() {
    countdownEl.hidden = !countdown;
    countdownEl.textContent = countdown ? ui('play.countdown', { secs: countdown.left }) : '';
  }
  function stopCountdown() {
    if (!countdown) return;
    clearInterval(countdown.timer);
    countdown = null;
    showCountdown();
  }
  function startCountdown(secs) {
    stopCountdown();
    countdown = { left: secs, year: timeline.year, selected: state.selectedId, focus: state.focus };
    countdown.timer = setInterval(() => {
      if (!countdown) return;
      // Pausen är inte längre Samtidigt-pausen (en annan paus, uppspelning eller valet avstängt)
      if (timeline.playing || !timeline.resumable || !layers.pause.ffAuto) { stopCountdown(); return; }
      countdown.left -= 1;
      if (countdown.left > 0) { showCountdown(); return; }
      stopCountdown();
      timeline.play();
    }, 1000);
    showCountdown();
  }
  timeline.addEventListener('beforeplay', stopCountdown);
  // Omritningen efter ett årsbyte kommer i samma change som pausen; bara ett nytt år avbryter
  timeline.addEventListener('change', () => { if (countdown && timeline.year !== countdown.year) stopCountdown(); });
  app.store.subscribe(({ type }) => {
    if (!countdown) return;
    if ((type === 'selected' && state.selectedId !== countdown.selected) || (type === 'focus' && state.focus !== countdown.focus)) stopCountdown();
  });
  for (const type of ['pointerdown', 'keydown']) ff.root.addEventListener(type, stopCountdown);
  ff.tab?.addEventListener('pointerdown', stopCountdown);

  // Raden "Nästa paus" följer pausvalen i Lager
  $('layer-menu').addEventListener('change', e => { if (e.target.dataset.pause) showNextPause(); });

  return { check, startAt, clearRouteStops, restoreStop, reset, showNextPause, warEndOf, playToEnd, stopCountdown };
}
