// Uppspelningens pauser i fokusläget (#402, del av #389): krigets stopp och slutkort (#122, #217, #232),
// resans stopp (#376), "Spela klart" (#244), huvudknappen i fokusraden (#360) och pauserna när ett krig
// bryter ut, en religion grundas eller ett rike når ett nyckelår.
//
// Köerna ägs här och ingen annanstans. Omritningen (render.js) anropar check() efter att lagren har ritats,
// och samma köer återupptas av Fortsätt (beforeplay). Därför flyttas omritningen och uppspelningen tillsammans:
// de delar köerna men inte tillståndet i state (beslutet i #402).
import { t, isVisibleReview } from '../model.js';
import { MAX_YEAR } from '../timeline.js';
import { routeStops as stopsForRoute } from '../layers/lines.js';
import { stopDate } from './story.js';

export function createPlayback(app) {
  const { $, state, data, timeline, panel, layers, ff } = app;
  let lastYear = 0;
  let warStops = [], stopping = false; // kö med stopp när man följer ett krig (#217)
  let routeStops = []; // kö med stopp när man följer en resa (#376)
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
      timeline.pause(focusWar.ongoing ? 'Pausad: läget i dag' : 'Pausad: kriget är slut', true); app.store.setSelected(focusWar.id); panel.showStory(focusWar, 'summary');
    } else {
      // I smal skärm öppnas inte panelen, så att kartan syns; händelsen markeras på globen
      shownStops.add(stop.id);
      timeline.pause('Pausad vid en stor händelse i kriget', true); app.store.setSelected(stop.id); panel.showDetail(stop, matchMedia('(min-width: 761px)').matches);
      // Tiden står på händelsens år, i ett kort krig på dess dag (#204, #224), också när flera
      // stopp kom i samma steg eller tiden redan hade hunnit förbi händelsen.
      timeline.year = timeline.spanOf(stop)[0];
    }
    stopping = false;
    $('app').classList.toggle('has-detail', !$('detail').hidden);
    showNextPause();
  }

  function showRouteStop(stop) {
    const focusRoute = state.focusRoute;
    stopping = true;
    const place = stop.place;
    const text = place.text ? `Pausad: ${t(place.text)} · ${t(focusRoute.title)}`
      : `Pausad vid ${t(place.name)} · ${stopDate(place)} · ${t(focusRoute.title)}`;
    // Noten finns redan i resedatan och ska synas vid varje stopp, så att osäkerheten inte tappas bort.
    // Rubriken syns i pausraden och texten fälls ut, så att raden inte blir så hög att den krockar (#647).
    // Skärmläsaren får hela noten.
    const note = focusRoute.note ? { title: t(focusRoute.note.title), text: t(focusRoute.note.text) } : null;
    timeline.pause(text, true, note ? `${text} · ${note.title}: ${note.text}` : text, note);
    timeline.year = stop.at;
    stopping = false;
    showNextPause();
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
    const text = !n ? '' : n === 'end' ? (focusWar.ongoing ? 'läget i dag' : 'när kriget är slut')
      : focusRoute ? `${t(n.place.name)} (${stopDate(n.place)})` : `${t(n.title)} (${timeline.format(timeline.spanOf(n)[0])})`;
    for (const [el, pre] of [[$('next-pause'), 'Nästa paus: '], [$('pause-next'), 'Nästa: ']]) {
      el.hidden = !text;
      el.textContent = text ? pre + text : '';
      el.title = text ? `Nästa paus: ${text}` : '';
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
    const label = running ? 'Pausa' : timeline.resumable ? 'Fortsätt' : timeline.atEnd ? 'Spela igen' : finish ? 'Spela klart' : 'Spela';
    action.dataset.action = running ? 'pause' : finish ? 'finish' : 'play';
    action.textContent = `${running ? 'Ⅱ' : '▶'} ${label}`;
    action.setAttribute('aria-label', `${label} tiden i fokusläget`);
    $('focus-state').textContent = `${timeline.format(timeline.year)} · ${running ? 'Spelar' : 'Står still'}`;
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
      if (hit) { timeline.pause('Pausad vid religionens grundande'); app.store.setSelected(hit.id); panel.showDetail(hit, matchMedia('(min-width: 761px)').matches); }
    }
    // I fokus på ett rike stannar uppspelningen vid rikets nyckelår, och kortet säger varför
    // riket växer eller krymper (#171). Valet finns i Lager.
    if (focus?.type === 'empire' && timeline.playing && layers.pause.empire) {
      const hit = app.storyFor(focus.id).find(c => c.year > lastYear && c.year <= year);
      if (hit) { timeline.pause(`Pausad vid ${hit.label}: ${hit.title || 'rikets nyckelår'}`); timeline.year = hit.year; }
    }
    // Pausa när ett krig bryter ut, om det är valt i lagermenyn (#114)
    if (!focus && timeline.playing && layers.pause.wars && eventsOn) {
      const war = data.events.find(e => e.kind === 'war' && e.start > lastYear && e.start <= year
        && panel.filters.has(e.category) && isVisibleReview(e.review));
      if (war) { timeline.pause('Pausad: ett krig bryter ut'); timeline.year = war.start; app.store.setSelected(war.id); panel.showDetail(war); }
    }
    lastYear = year;
  }

  /** Ett nytt fokus börjar (startFocus): resans kö töms. */
  function clearRouteStops() { routeStops = []; }
  /** Ett nytt fokus börjar på startYear (startFocus): passerade stopp räknas därifrån. */
  function startAt(startYear) { lastYear = startYear; }
  /** Fokus avslutas (endFocus): köerna, de visade stoppen och Spela klart glöms. */
  function reset() {
    warStops = []; routeStops = []; shownStops = new Set(); endShown = false; finishing = false;
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
      const tail = auto ? ` Fortsätter själv om ${secs} sekunder.` : '';
      timeline.pause('Pausad vid ett nytt Samtidigt-kort', false, `Pausad vid ett nytt Samtidigt-kort. ${ff.announcement()}${tail}`);
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
    countdownEl.textContent = countdown ? `Fortsätter om ${countdown.left} …` : '';
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

  return { check, startAt, clearRouteStops, reset, showNextPause, warEndOf, playToEnd };
}
