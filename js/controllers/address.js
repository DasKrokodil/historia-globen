// Tillståndet i adressen (#501) och delbara länkar (#64). Formatet står i js/url-state.js och docs/arkitektur.md.
//
// - Vid start läses hashen: lagren, kategorierna, året, fokus och kameran ställs in i den ordningen
//   (fokus behåller året när det ligger inom spannet, och kameran sätts sist så att fokus inte flyttar den).
// - Därefter skrivs tillståndet i adressen med history.replaceState eller pushState. En ny post i historiken
//   (bakåt/framåt) blir det bara vid större steg: nytt fokus, ändrade lager eller kategorier, eller ett årshopp
//   som har stått still en stund. Uppspelning och vridning av globen ersätter den nuvarande posten.
// - Bakåt och framåt (popstate) läser hashen och ställer in vyn igen.
// - En guidad tur i länken (t och s, eller den äldre ?tur=<id>) startar turen vid rätt steg i stället för att
//   ställa in vyn (#736). Medan turen pågår skriver adressen turens id och steg, så att Dela ger en länk till
//   steget och Bakåt går till föregående steg. När turen avslutas försvinner t och s ur adressen.
// - Lektionsläget (m=lektion, #795) hör till en tur: en länk med t och m=lektion startar turen som lektion (js/ui/lesson.js).
//   Medan läget pågår skriver adressen m=lektion, så att omladdning, Dela och Bakåt/Framåt ger samma läge. Bakåt till en
//   adress utan m (eller utan tur) avslutar läget; Framåt startar det igen.
// - Ett tidsintervall (#755) står som y (från) och y2 (till). Det ställs in efter året och i stället för ett fokus, eftersom
//   intervallet och Fokus utesluter varandra; en adress utan y2 stänger ett intervall som är valt.
// - Knappen Dela kopierar länken, eller öppnar telefonens delningsmeny där den finns.
// - Versionsräknaren (#865, #893): varje inställning av vyen (start, länk, Bakåt/Framåt) får ett nytt nummer, och bara
//   den senaste får skriva år och kamera efter en väntan. Medan den pågår skrivs inget i adressen. Bakåt och Framåt
//   lyssnas på redan innan startens egen inställning är klar, så att en vy som byts medan ett fokus laddas inte går
//   förlorad. Vilka lägen som får börja står i lägeskontraktet (MODE_RULES i js/state.js).

import { toJSON } from '../state.js';
import { encodeHash, decodeHash, decodeTour, decodeMission, decodeMode, decodeRole, isNewStep, LESSON_MODE } from '../url-state.js';
import { ui } from '../i18n.js';
import { imageAliases } from '../layers/images.js';

const POLL_MS = 700;

export function createAddress(app) {
  const { state, globe, timeline, layers, panel, data, views } = app;
  const allCategories = [...new Set(data.events.map(e => e.category))].sort();
  let written = null, writtenHash = '', seenHash = '';
  // Den äldre, korta formen ?c=lat,lon,zoom används bara vid första läsningen. När den har
  // översatts till den vanliga hashen tas c bort ur frågesträngen, så att Dela ger en enda
  // kanonisk adress.
  let legacyCameraInSearch = false;
  // version räknas upp för varje inställning av vyen; done är den senaste som är klar. Skiljer de sig pågår en
  // inställning, och då skrivs inget i adressen. En överspelad inställning skriver inte längre (#865, #893).
  let version = 0, done = 0;

  const current = () => toJSON(state, globe.view);
  const position = () => app.tour?.position ?? null;
  const mission = () => app.hunt?.missionId ?? null; // elevuppdraget som pågår (#741)
  const mode = () => (app.lesson?.active ? LESSON_MODE : null); // lektionsläget (#795)
  const hashOf = (json, tour = null) => encodeHash(json, allCategories, tour, mission(), mode());
  /** Sidans adress utan den äldre ?tur= (turen står i hashen när den väl har startat). */
  const search = () => {
    const q = new URLSearchParams(location.search);
    q.delete('tur');
    if (legacyCameraInSearch) q.delete('c');
    const t = q.toString();
    return t ? `?${t}` : '';
  };
  /** Den korta kameradressen från äldre länkar: behåll aktuellt år och vanliga lager. */
  function legacyCamera() {
    const c = new URLSearchParams(location.search).get('c');
    if (!c) return null;
    // decodeHash har redan samma validering och begränsning av latitud, longitud och zoom
    // som vanliga delningslänkar. Ett hash-år behövs bara för formatet och tas från startvyn.
    const view = decodeHash(`#y=${timeline.year}&c=${encodeURIComponent(c)}`);
    if (!view?.camera) return null;
    legacyCameraInSearch = true;
    return view;
  }
  /** Det som nu står i adressen räknas som skrivet, så att det inte skrivs en gång till. */
  function settle() { written = current(); writtenHash = seenHash = hashOf(written, position()); }

  /** Finns det man följer i datan? (en gammal länk kan peka på något som har bytt namn) */
  function focusExists(key) {
    const [type, id] = key.split(':');
    // Posten (js/focus/, #1327) kan svara direkt för krig och riken; det som laddas först vid fokus har ingen
    // exists(), och då avbryter startFocus själv om det saknas
    return app.focusTypes.get(type)?.exists?.(id) ?? true;
  }

  /** Ställer in vyn efter en läst hash (decodeHash). */
  async function apply(s) {
    const mine = ++version;
    app.store.ticket('fokus'); // adressen är en nyare begäran om Fokus, också när den inte har något: ett äldre fokus som laddas börjar inte
    try {
      if (s.layers) {
        // Äldre lager-id i en delad länk (l=images) pekar på lagrets nuvarande id (aliases i data/bildlager.json, #1325)
        const renamed = imageAliases(data.imageLayers);
        const want = new Set(s.layers.map(name => renamed[name] ?? name));
        for (const name of Object.keys(layers.on)) {
          const on = want.has(name);
          if (!!layers.on[name] !== on) { layers.set(name, on); layers.onChange(name, on); }
        }
      }
      // Urvalet hör till den förinställda vyn och måste sättas efter lagren: varje enskilt lagerval lämnar annars vyn.
      layers.setTag(views?.tags?.[s.tag] ? s.tag : null);
      if (s.filters) panel.setFilters(s.filters.filter(c => allCategories.includes(c)));
      timeline.pause();
      // Tidsintervallet (#755): en adress med y2 och utan fokus väljer intervallet, annars stängs ett valt intervall
      const wantRange = s.yearEnd != null && !s.focus;
      if (!wantRange) app.range?.close({ redraw: false });
      // En vanlig vy lämnar fokuset före årsvalet. Annars klämmer tidsreglagets fokusspann
      // det nya året till den gamla gränsen när fokuset redan har laddats klart (#1251).
      if (!s.focus && state.focus) app.endFocus(false);
      timeline.year = s.year;
      if (wantRange && !app.range?.set(s.year, s.yearEnd, s.period ?? null)) app.range?.close({ redraw: false });
      const focusNow = state.focus ? `${state.focus.type}:${state.focus.id}` : null;
      if (s.focus !== focusNow) {
        if (s.focus && focusExists(s.focus)) {
          let started = false;
          try { started = await app.startFocus(s.focus); } catch (err) { console.warn('Fokus i länken kunde inte öppnas', err); }
          // Medan fokuset laddades kan en nyare adress ha tagit över, eller ett läge som krockar (en tur, en lektion) ha
          // börjat; då började fokuset inte (lägeskontraktet, #893). Den nya ägaren har året och kameran, och den gamla
          // adressen skriver inte över dem (#865)
          if (mine !== version || !started) return;
          timeline.year = s.year; // fokus kan ha flyttat året till sin start
        } else if (state.focus) app.endFocus();
      }
      if (s.camera) { globe.flyTo(s.camera.lat, s.camera.lon, 600); globe.setZoom(s.camera.zoom); }
      app.refresh();
    } finally {
      // En nyare inställning har annars redan tagit över (done och settle är dess)
      if (mine === version) { done = mine; settle(); }
    }
  }

  /**
   * Startar turen i en länk ({ id, step } från decodeTour), som lektion när länken har m=lektion och turen är en
   * lektionstur (#795). Läget börjar före turen, så att första steget redan ligger inom låset. Ger false när turen
   * inte finns. Utan m, eller för en tur som inte är en lektion, blir det en vanlig tur.
   */
  function applyTour(tl, lessonWanted = false, teacher = false) {
    const tour = app.tour, lesson = app.lesson;
    if (!tl || !tour) return false;
    const asLesson = lessonWanted && !!lesson?.canStart(tl.id);
    if (lessonWanted && !asLesson) lesson?.explain(tl.id); // länken ville ha en lektion men blev en vanlig tur eller ingen alls (#877)
    if (tour.active && tour.position?.id === tl.id) {
      if (asLesson !== !!lesson?.active) { if (asLesson) lesson.enter(tl.id, { teacher }); else lesson.leave(); }
      tour.go(tour.stepIndex(tl.step));
      return true;
    }
    if (asLesson) lesson.enter(tl.id, { teacher }); else if (lesson?.active) lesson.leave();
    const ok = tour.start(tl.id, null, tl.step);
    if (!ok && asLesson) lesson.leave();
    return ok;
  }

  /** force: skriv nu, utan att vänta tills vyn står still (flush, #882). */
  function write(force = false) {
    if (done !== version) return; // en inställning av vyen pågår
    const cur = current(), pos = position();
    const hash = hashOf(cur, pos);
    if (hash === writtenHash) return;
    // Ett nytt steg i turen, eller att turen börjar eller slutar, blir en egen post (Bakåt går till steget innan)
    const tourStep = new URLSearchParams(writtenHash.slice(1)), newTour = (tourStep.get('t') ?? '') !== (pos?.id ?? '') || (tourStep.get('s') ?? '') !== (pos?.step ?? '')
      || (tourStep.get('u') ?? '') !== (mission() ?? '') // ett uppdrag som börjar eller slutar är också ett eget steg
      || (tourStep.get('m') ?? '') !== (mode() ?? '') // och lektionsläget
      || (written?.yearEnd ?? null) !== (cur.yearEnd ?? null) || (written?.period ?? null) !== (cur.period ?? null); // och ett tidsintervall som väljs eller stängs (#755)
    // Vänta tills vyn står still, utom när ett läge eller turens steg har bytts: det skrivs direkt (#882, #893)
    if (!force && !newTour && !timeline.playing && hash !== seenHash) { seenHash = hash; return; }
    const url = `${location.pathname}${search()}${hash}`;
    if (newTour || isNewStep(written, cur, { playing: timeline.playing })) history.pushState(null, '', url);
    else history.replaceState(null, '', url);
    written = cur; writtenHash = seenHash = hash;
  }

  /** Läser adressen vid start. Ger true om en giltig länk ställde in vyn. */
  async function start({ read = true } = {}) {
    // Bakåt, Framåt och en ändrad hash lyssnas på före startens egen inställning: ett fokus i länken kan ta tid att
    // ladda, och en vy som byts under tiden ska gälla (fyndet från #888 i #893)
    addEventListener('popstate', () => {
      // Turen och lektionsläget först, sedan elevuppdraget: i en lektion (#795) avgör låset om jakten får börja, och
      // Bakåt ut ur lektionen ska kunna öppna jakten igen
      const followMission = () => {
        // Elevuppdraget följer adressen: Bakåt till innan jakten avslutar den, Framåt startar den igen (#741)
        const m = decodeMission(location.hash);
        if (m && m !== mission()) app.hunt?.start(m);
        else if (!m && app.hunt?.active) app.hunt.end(false);
      };
      const tl = decodeTour(location.hash);
      if (tl) {
        const mine = ++version; // turen tar över från en inställning som pågår
        if (applyTour(tl, !!decodeMode(location.hash))) { followMission(); done = mine; settle(); return; }
        done = mine;
      }
      if (app.tour?.active) app.tour.end(); // tar lektionsläget med sig (js/ui/tour.js)
      followMission();
      const t = decodeHash(location.hash);
      if (t) apply(t); else { done = ++version; settle(); }
    });
    // En tur i länken går före en delad vy; finns turen inte läses resten av länken som vanligt
    const touring = read && applyTour(decodeTour(location.hash, location.search), !!decodeMode(location.hash), !!decodeRole(location.hash));
    // Den vanliga hashen går före den korta, äldre ?c=-formen om båda finns i en länk.
    const s = read && !touring ? (decodeHash(location.hash) ?? legacyCamera()) : null;
    const before = version;
    if (s) await apply(s);
    setInterval(write, POLL_MS);
    // Har Bakåt eller en ändrad hash tagit över medan startens inställning pågick, äger den adressen nu
    if (version !== before + (s ? 1 : 0)) return touring || !!s;
    // Ett elevuppdrag i länken (u, #741) startar efter vyn, så att uppdragets år gäller
    const missionId = read ? decodeMission(location.hash) : null;
    const hunting = !!missionId && !!app.hunt?.start(missionId);
    // Startläget får också en adress, så att Bakåt efter första steget kommer tillbaka hit
    settle();
    history.replaceState(null, '', `${location.pathname}${search()}${writtenHash}`);
    legacyCameraInSearch = false; // ?c= är nu borta ur adressen (#1141): flaggan hör till första läsningen och nollställs här, inte i settle(), som apply() anropar före den här raden
    return touring || hunting || !!s;
  }

  /** Länken till vyn som den ser ut nu. */
  function link() {
    return `${location.origin}${location.pathname}${search()}${hashOf(current(), position())}`;
  }

  /** Knappen Dela (#64): delningsmenyn i telefonen, annars kopiera länken. status(text) visar resultatet. */
  async function share(status) {
    const url = link();
    history.replaceState(null, '', url);
    settle();
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try { await navigator.share({ title: document.title, url }); return; } catch (err) { if (err?.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(url);
      status(ui('share.copied'));
    } catch {
      status(ui('share.manual'));
      window.prompt(ui('share.prompt'), url);
    }
  }

  /**
   * Skriver vyn i adressen nu. Språkbytet (js/i18n.js) laddar om sidan direkt och tar adressen som den står; utan flush
   * står steget före senaste Nästa kvar (adressen skrivs annars först när vyn har stått still, #882).
   */
  function flush() { write(true); }

  return { start, link, share, flush };
}
