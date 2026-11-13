// Tryck på en plats (#1161, del av #579): ett tryck på konturen av en plats med kort öppnar kortet (Fokus av typen place),
// både på globen och i Platt vy, och knappen "Visa i Platt karta" i kortet byter vy och ramar in platsen.
// Ett tryck är en genväg: Sök och följ → Platser räcker fortfarande för den som använder tangentbord eller skärmläsare.
// Tangentbordets motsvarighet är Enter på globen eller kartan, som följer platsen i mitten av vyn; och efter att man har
// flyttat vyn med tangenterna säger statusraden vilken plats med kort som ligger i mitten.
//
// Vad som syns är det som går att trycka på: konturerna (layers/places.js) och trycken gäller bara inzoomat och i vanligt
// läge (controllers/render.js, placeHints), aldrig i Fokus, tur, lektion eller intervall. Ett tryck som träffar en
// händelsemarkör, en väg eller en religion hanteras som förut (main.js) och kommer aldrig hit.
import { loadPlaces, isVisibleReview, t } from '../model.js';
import { placeAt, placeEvents, placeBounds } from '../place-geo.js';
import { ui } from '../i18n.js';
import { say } from '../ui/status.js';

/** Hur länge ett tryck med finger väntar på ett eventuellt dubbeltryck (som zoomar, #233) innan det öppnar platsen. */
const TOUCH_WAIT_MS = 380;
/** Hur länge vyn ska stå still efter en tangent innan statusraden säger vilken plats som ligger i mitten. */
const ANNOUNCE_MS = 900;

export function createPlaces(app) {
  const { $, state, data, globe, flatMap, registry } = app;
  const layer = registry.get('places');
  let cards = [], loading = null, pending = 0, lastSaid = null, announceTimer = 0;

  /** Vanligt läge: inget Fokus, ingen tur, lektion eller intervall (en jakt pågår bredvid, #893). */
  const allowed = () => !state.focus && !state.modes.some(m => m.mode !== 'jakt');
  /** Syns konturerna just nu, och är platserna laddade? Då går ett tryck på dem att göra. */
  const hintsOn = () => !!state.labels?.placeHints && cards.length > 0;

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
    if (!allowed() || !hintsOn()) return false;
    const place = at(ll);
    if (!place) return false;
    // Med finger kan trycket vara första halvan av ett dubbeltryck som zoomar: vänta lite (globe.onDoubleTap avbryter)
    if (touch) pending = setTimeout(() => { if (allowed()) follow(place); }, TOUCH_WAIT_MS);
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
      if (e.pointerType !== 'mouse' || e.buttons || !hintsOn() || !allowed()) { set(false); return; }
      raf = requestAnimationFrame(() => set(!!at(globe.pickLatLon(e.clientX, e.clientY))));
    });
    canvas.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); set(false); });
  }
  flatMap.placeAt = ll => allowed() && hintsOn() && !!at(ll);

  // ---- tangentbord och skärmläsare -------------------------------------------------------------------------------
  const flatOpen = () => !$('flat-view').hidden;
  /** Mitten av vyn som { lon, lat }: globens eller, när Platt vy är öppen, kartans. */
  const centre = () => {
    if (flatOpen()) return flatMap.centre();
    const { lon, lat } = globe.view;
    return { lon, lat };
  };

  /** Enter: följ platsen i mitten av vyn, om den har ett kort. Utan sådan säger statusraden vad man kan göra i stället. */
  async function activate() {
    if (!allowed()) return;
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

  // ---- knappen "Visa i Platt karta" i platsens kort --------------------------------------------------------------
  /** Byt till Platt karta och ram in platsen. Kameran på globen flyger inte, och inget eget läge börjar. */
  function showInFlat(place) {
    app.viewMode.set('flat');
    // På bred skärm ligger kortet till höger och täcker kartan: inramningen räknar bara med ytan till vänster om det
    const card = $('detail'), covered = !app.narrow.matches && !card.hidden ? Math.max(0, flatMap.canvas.getBoundingClientRect().right - card.getBoundingClientRect().left) : 0;
    flatMap.frame(placeBounds(place), 0.78, covered);
    say(ui('place.flatShown', { place: t(place.name) }), 'plats', { priority: 2, immediate: true }); // som faktarutans rubrik: svaret på knappen får inte tystas av den
  }

  return { allowed, ensure, tap, showInFlat, cards: () => cards };
}
