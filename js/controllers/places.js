// Tryck på en plats (#1161, del av #579): ett tryck på konturen av en plats med kort öppnar kortet (Fokus av typen place),
// både på globen och i Platt vy, och knappen "Visa på Platt karta" i kortet byter vy och ramar in platsen.
// Ett tryck är en genväg: Sök och följ → Platser räcker fortfarande för den som använder tangentbord eller skärmläsare.
// Tangentbordets motsvarighet är Enter på globen eller kartan, som följer platsen i mitten av vyn; och efter att man har
// flyttat vyn med tangenterna säger statusraden vilken plats med kort som ligger i mitten. Enter i Fokus på en plats öppnar
// kortet igen, och i övriga lägen där man följer något säger statusraden varför ingenting händer (#1454).
//
// Vad som syns är det som går att trycka på: konturerna (layers/places.js) och trycken gäller bara inzoomat och i vanligt
// läge (controllers/render.js, placeHints), aldrig i tur, lektion eller intervall. Följer man platsen (Fokus, regionvyn) öppnar ett tryck
// på den kortet igen (#1791). Ett tryck som träffar en
// händelsemarkör, en väg eller en religion hanteras som förut (main.js) och kommer aldrig hit.
import { loadPlaces, isVisibleReview, t } from '../model.js';
import { placeAt, placeEvents, placeBounds } from '../place-geo.js';
import { showPlaceCard, visibleEvents, ensurePlaceFacts } from '../focus/place.js';
import { ui } from '../i18n.js';
import { say } from '../ui/status.js';

/** Hur länge ett tryck med finger väntar på ett eventuellt dubbeltryck (som zoomar, #233) innan det öppnar platsen. */
const TOUCH_WAIT_MS = 380;
/** Hur länge vyn ska stå still efter en tangent innan statusraden säger vilken plats som ligger i mitten. */
const ANNOUNCE_MS = 900;
/** Hur länge beskedet om att Enter inte öppnar en plats syns för den som ser: tillräckligt för att läsa två meningar; Stäng och nästa handling tar bort det förr. */
const BUSY_NOTICE_MS = 10000;

export function createPlaces(app) {
  const { $, state, data, globe, flatMap, registry } = app;
  const layer = registry.get('places');
  let cards = [], loading = null, pending = 0, lastSaid = null, announceTimer = 0;

  /** Vanligt läge: inget Fokus, ingen tur, lektion eller intervall (en jakt pågår bredvid, #893). */
  const allowed = () => !state.focus && !state.modes.some(m => m.mode !== 'jakt');
  /** Syns konturerna just nu, och är platserna laddade? Då går ett tryck på dem att göra. */
  const hintsOn = () => !!state.labels?.placeHints && cards.length > 0;
  /** Platsen man följer (Fokus på en plats, också i regionvyn, #1791): ett tryck på dess yta öppnar kortet igen, utan nytt Fokus. */
  const followed = () => (state.focus?.type === 'place' && state.focus.place?.boundary?.geometry ? state.focus.place : null);
  const inFollowed = ll => { const p = followed(); return !!(p && ll && placeAt([p], ll.lon, ll.lat)); };

  /** Laddar platserna en gång. Bara de som har minst en synlig händelse har ett kort (som i Sök och följ). */
  function ensure() {
    loading ??= loadPlaces().then(list => {
      cards = list.filter(p => placeEvents(p, data.events).some(e => isVisibleReview(e.review)));
      layer.cards = cards;
      if (state.labels?.placeHints && cards.length) app.refresh();
      return cards;
    });
    return loading;
  }

  const at = ll => (ll ? placeAt(cards, ll.lon, ll.lat) : null);
  const follow = place => app.startFocus(`place:${place.id}`);

  // ---- tryck -----------------------------------------------------------------------------------------------------
  /** Ett tryck på globen eller kartan som inte träffade något annat. touch: tryck med finger eller penna. */
  function tap(ll, touch = false) {
    clearTimeout(pending);
    // Följer man platsen öppnar ett tryck på den kortet igen (som knappen Om platsen); statusraden läser upp kortets rubrik (main.js)
    if (inFollowed(ll)) {
      const reopen = () => { if (inFollowed(ll)) { app.showFocusFacts(); } };
      // Med finger väntar trycket tills webbläsaren har skickat sitt klick (#1978): kortet som öppnas lägger sig annars över tryckpunkten
      // först, och klicket träffar kortet och tar fokus från Stäng. Med mus kommer klicket före, och fokus ligger kvar på Stäng.
      if (touch) pending = setTimeout(reopen, TOUCH_WAIT_MS); else reopen();
      return true;
    }
    // Regionvyn startar inget nytt Fokus (#1978): ett tryck på ett grannland eller på havet gör ingenting, bara platsen man följer öppnar kortet
    if (app.region?.place) return false;
    if (!allowed() || !hintsOn()) return false;
    const place = at(ll);
    if (!place) return false;
    // Med finger kan trycket vara första halvan av ett dubbeltryck som zoomar: vänta lite (globe.onDoubleTap avbryter). Platt vy har inget
    // dubbeltryck, och där följs platsen direkt som förut (bara det som öppnar kortet för platsen man följer väntar, se ovan)
    if (touch && !flatOpen()) pending = setTimeout(() => { if (allowed()) follow(place); }, TOUCH_WAIT_MS);
    else follow(place);
    return true;
  }
  globe.onDoubleTap = () => clearTimeout(pending);

  // ---- hovring: handen över en plats med kort --------------------------------------------------------------------
  {
    const canvas = $('globe-canvas');
    let raf = 0;
    const set = on => canvas.classList.toggle('on-place', on);
    canvas.addEventListener('pointermove', e => {
      cancelAnimationFrame(raf);
      if (e.pointerType !== 'mouse' || e.buttons || (!followed() && (!hintsOn() || !allowed()))) { set(false); return; }
      raf = requestAnimationFrame(() => { const ll = globe.pickLatLon(e.clientX, e.clientY); set(followed() ? inFollowed(ll) : !!at(ll)); });
    });
    canvas.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); set(false); });
  }
  flatMap.placeAt = ll => (followed() ? inFollowed(ll) : allowed() && hintsOn() && !!at(ll));

  // ---- tangentbord och skärmläsare -------------------------------------------------------------------------------
  const flatOpen = () => !$('flat-view').hidden;
  /** Mitten av vyn som { lon, lat }: globens eller, när Platt vy är öppen, kartans. */
  const centre = () => {
    if (flatOpen()) return flatMap.centre();
    const { lon, lat } = globe.view;
    return { lon, lat };
  };

  /** Varför Enter inte öppnar någon plats just nu (#1454): det läge som hindrar, det strängaste först. Fokus är det som är kvar. */
  const busyMode = () => ['lektion', 'tur', 'intervall'].find(m => state.modes.some(x => x.mode === m)) ?? 'fokus';

  /**
   * Enter (#1161, #1454). Följer man en plats öppnar Enter kortet igen, som knappen Fakta i fokusraden. Följer man något annat, eller
   * pågår en tur, en lektion eller ett tidsintervall, händer ingenting med platserna, och statusraden säger varför i stället för att
   * tiga. I vanligt läge följs platsen i mitten av vyn, om den har ett kort; utan sådan säger statusraden vad man kan göra i stället.
   */
  async function activate() {
    if (state.focus?.type === 'place') { app.showFocusFacts(); return; }
    if (!allowed()) {
      // Skärmläsaren hör det på statusraden (prioritet 2: svaret på en tangent tystas inte av en rubrik som nyss lästes upp); den som ser
      // får samma text en stund i beskedraden (link-notice), som inte läser upp den en andra gång (announce: false)
      const line = ui(`place.enterBusy.${busyMode()}`);
      say(line, 'plats', { priority: 2 });
      app.linkNotice?.showText(line, { ms: BUSY_NOTICE_MS, announce: false });
      return;
    }
    await ensure();
    const place = at(centre());
    if (place) follow(place);
    else say(ui('place.noneHere'), 'plats', { priority: 1 });
  }
  globe.onActivate = flatMap.onActivate = activate;

  /** Efter tangentbordsflytt: säg vilken plats med kort som ligger i mitten, en gång per plats. */
  async function announceHere() {
    announceTimer = 0;
    if (!allowed()) return;
    await ensure();
    const place = at(centre());
    if (place?.id === lastSaid) return;
    lastSaid = place?.id ?? null;
    if (place) say(ui('place.hereKey', { place: t(place.name) }), 'plats');
  }
  for (const canvas of [$('globe-canvas'), $('flat-canvas')]) {
    canvas.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey || !/^(Arrow(Left|Right|Up|Down)|[-+=_])$/.test(e.key)) return;
      clearTimeout(announceTimer);
      announceTimer = setTimeout(announceHere, ANNOUNCE_MS);
    });
  }

  // ---- knappen "Visa på Platt karta" i platsens kort --------------------------------------------------------------
  /**
   * Byt till Platt karta och ram in platsen. Kameran på globen flyger inte, och inget eget läge börjar. En liten plats (upp till
   * cirka 5 grader, Skåne och Danmark) får regionvyn i stället (#1641, controllers/region.js): en skarp, inzoomad karta.
   */
  function showInFlat(place) {
    // Regionvyn kommer ihåg vyn och kameran man kommer från, innan vyn byts, så att Lämna regionvyn kan ställa tillbaka dem (#1864)
    if (app.region?.eligible(place)) app.region.rememberOrigin();
    // En stor plats (Aotearoa, Grönland) får regionvyn på globen (#1644): globen flyger in, och Platt vy öppnas inte
    if (app.region?.onGlobe(place)) { app.region.enter(place); return; }
    app.viewMode.setSurface('flat');
    if (app.region?.eligible(place)) { app.region.enter(place); return; }
    // På bred skärm ligger kortet till höger och täcker kartan: inramningen räknar bara med ytan till vänster om det
    const card = $('detail'), covered = !app.narrow.matches && !card.hidden ? Math.max(0, flatMap.canvas.getBoundingClientRect().right - card.getBoundingClientRect().left) : 0;
    flatMap.frame(placeBounds(place), 0.78, covered);
    say(ui('place.flatShown', { place: t(place.name) }), 'plats', { priority: 2, immediate: true }); // som faktarutans rubrik: svaret på knappen får inte tystas av den
  }

  // ---- turens steg med en plats (#1163) --------------------------------------------------------------------------
  /**
   * Ett steg i en tur (js/ui/tour.js, fältet place i turformatet) öppnar platsen id: konturen ritas som i Fokus och, när card är
   * true, öppnas kortet. Inget Fokus börjar, för ett fokus avslutar turen (MODE_RULES i js/state.js); kortet har därför inte
   * Avsluta platsen och inte Visa i Platt karta, eftersom turen styr kameran och vyn. Platstrycket är fortfarande avstängt i
   * tur och lektion (allowed): läraren öppnar kortet genom turens steg, eleverna öppnar det inte fritt. current() ger false när
   * turen har gått vidare medan platserna laddades. Ger true när platsen visades.
   */
  async function openStep(id, { card = true, focus = false, current = () => true } = {}) {
    const place = (await loadPlaces()).find(p => p.id === id);
    const events = place ? visibleEvents(place, data.events) : [];
    if (!place || !events.length) return false;
    await ensurePlaceFacts(place); // rikenas rad Om kartan vid raderna i kortet (#1448)
    if (!current()) return false;
    layer.step = place;
    if (card) showPlaceCard(app, place, events, { follow: false, focus });
    app.refresh();
    return true;
  }
  /** Turens steg slutar visa platsen och markören: de tas bort vid nästa omritning (den som anropar ritar om). */
  function closeStep() { layer.step = null; layer.stepMark = null; layer.stepLine = null; }
  /** Ett steg med en markör (#1785, fältet mark i turformatet): ringen och namnet ritas på kartan vid nästa omritning. */
  function markStep({ lat, lon, label, approx = false }) { layer.stepMark = { lat, lon, label, approx }; }

  /**
   * Ett steg med en linje (#1785, fältet line): filen med linjerna läses (en gång) och ritas vid nästa omritning. current() ger false när turen
   * har gått vidare medan filen lästes; då ritas inget. Misslyckas läsningen ritas ingen linje, och steget fungerar som förut.
   */
  const lineFiles = new Map();
  async function lineStep({ file, label = '', current = () => true }) {
    if (!lineFiles.has(file)) lineFiles.set(file, fetch(file).then(r => { if (!r.ok) throw new Error(`${file}: ${r.status}`); return r.json(); }));
    try {
      const data = await lineFiles.get(file);
      if (!current()) return false;
      layer.stepLine = { lines: data.lines ?? [], label };
      app.refresh();
      return true;
    } catch (err) {
      lineFiles.delete(file);
      console.warn('Linjen i turens steg kunde inte läsas', err);
      return false;
    }
  }

  return { allowed, ensure, tap, showInFlat, openStep, closeStep, markStep, lineStep, cards: () => cards };
}
