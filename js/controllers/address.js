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
// - Knappen Dela kopierar länken, eller öppnar telefonens delningsmeny där den finns.

import { toJSON } from '../state.js';
import { encodeHash, decodeHash, decodeTour, decodeMission, decodeMode, isNewStep, LESSON_MODE } from '../url-state.js';
import { ui } from '../i18n.js';

const POLL_MS = 700;

export function createAddress(app) {
  const { state, globe, timeline, layers, panel, data } = app;
  const allCategories = [...new Set(data.events.map(e => e.category))].sort();
  let applying = false, written = null, writtenHash = '', seenHash = '';
  let version = 0; // räknas upp för varje apply(): en som har blivit överspelad av en nyare adress skriver inte längre (#865)

  const current = () => toJSON(state, globe.view);
  const position = () => app.tour?.position ?? null;
  const mission = () => app.hunt?.missionId ?? null; // elevuppdraget som pågår (#741)
  const mode = () => (app.lesson?.active ? LESSON_MODE : null); // lektionsläget (#795)
  const hashOf = (json, tour = null) => encodeHash(json, allCategories, tour, mission(), mode());
  /** Sidans adress utan den äldre ?tur= (turen står i hashen när den väl har startat). */
  const search = () => { const q = new URLSearchParams(location.search); q.delete('tur'); const t = q.toString(); return t ? `?${t}` : ''; };
  /** Det som nu står i adressen räknas som skrivet, så att det inte skrivs en gång till. */
  function settle() { written = current(); writtenHash = seenHash = hashOf(written, position()); }

  /** Finns det man följer i datan? (en gammal länk kan peka på något som har bytt namn) */
  function focusExists(key) {
    const [type, id] = key.split(':');
    if (type === 'war') return data.byId[id]?.kind === 'war';
    if (type === 'empire') return data.empireGroups.some(g => g.id === id);
    return true; // religioner och resor laddas först vid fokus; startFocus avbryter själv om de saknas
  }

  /** Ställer in vyn efter en läst hash (decodeHash). */
  async function apply(s) {
    const mine = ++version;
    applying = true;
    try {
      if (s.layers) {
        const want = new Set(s.layers);
        for (const name of Object.keys(layers.on)) {
          const on = want.has(name);
          if (!!layers.on[name] !== on) { layers.set(name, on); layers.onChange(name, on); }
        }
      }
      if (s.filters) panel.setFilters(s.filters.filter(c => allCategories.includes(c)));
      timeline.pause();
      timeline.year = s.year;
      const focusNow = state.focus ? `${state.focus.type}:${state.focus.id}` : null;
      if (s.focus !== focusNow) {
        if (s.focus && focusExists(s.focus)) {
          try { await app.startFocus(s.focus, { stale: () => mine !== version || !!app.tour?.active }); } catch (err) { console.warn('Fokus i länken kunde inte öppnas', err); }
          // Medan fokuset laddades kan en nyare adress ha tagit över, eller en tur (och därmed en lektion, #795) ha börjat.
          // Då äger den året och kameran, och den gamla adressen skriver inte över dem (#865)
          if (mine !== version || app.tour?.active) return;
          timeline.year = s.year; // fokus kan ha flyttat året till sin start
        } else if (state.focus) app.endFocus();
      }
      if (s.camera) { globe.flyTo(s.camera.lat, s.camera.lon, 600); globe.setZoom(s.camera.zoom); }
      app.refresh();
    } finally {
      // En nyare apply() har då redan tagit över (applying och settle är dess)
      if (mine === version) { applying = false; settle(); }
    }
  }

  /**
   * Startar turen i en länk ({ id, step } från decodeTour), som lektion när länken har m=lektion och turen är en
   * lektionstur (#795). Läget börjar före turen, så att första steget redan ligger inom låset. Ger false när turen
   * inte finns. Utan m, eller för en tur som inte är en lektion, blir det en vanlig tur.
   */
  function applyTour(tl, lessonWanted = false) {
    const tour = app.tour, lesson = app.lesson;
    if (!tl || !tour) return false;
    const asLesson = lessonWanted && !!lesson?.canStart(tl.id);
    if (lessonWanted && !asLesson) lesson?.explain(tl.id); // länken ville ha en lektion men blev en vanlig tur eller ingen alls (#877)
    if (tour.active && tour.position?.id === tl.id) {
      if (asLesson !== !!lesson?.active) { if (asLesson) lesson.enter(tl.id); else lesson.leave(); }
      tour.go(tour.stepIndex(tl.step));
      return true;
    }
    if (asLesson) lesson.enter(tl.id); else if (lesson?.active) lesson.leave();
    const ok = tour.start(tl.id, null, tl.step);
    if (!ok && asLesson) lesson.leave();
    return ok;
  }

  function write() {
    if (applying) return;
    const cur = current(), pos = position();
    const hash = hashOf(cur, pos);
    if (hash === writtenHash) return;
    if (!timeline.playing && hash !== seenHash) { seenHash = hash; return; } // vänta tills vyn står still
    const url = `${location.pathname}${search()}${hash}`;
    // Ett nytt steg i turen, eller att turen börjar eller slutar, blir en egen post (Bakåt går till steget innan)
    const tourStep = new URLSearchParams(writtenHash.slice(1)), newTour = (tourStep.get('t') ?? '') !== (pos?.id ?? '') || (tourStep.get('s') ?? '') !== (pos?.step ?? '')
      || (tourStep.get('u') ?? '') !== (mission() ?? '') // ett uppdrag som börjar eller slutar är också ett eget steg
      || (tourStep.get('m') ?? '') !== (mode() ?? ''); // och lektionsläget
    if (newTour || isNewStep(written, cur, { playing: timeline.playing })) history.pushState(null, '', url);
    else history.replaceState(null, '', url);
    written = cur; writtenHash = seenHash = hash;
  }

  /** Läser adressen vid start. Ger true om en giltig länk ställde in vyn. */
  async function start({ read = true } = {}) {
    // En tur i länken går före en delad vy; finns turen inte läses resten av länken som vanligt
    const touring = read && applyTour(decodeTour(location.hash, location.search), !!decodeMode(location.hash));
    const s = read && !touring ? decodeHash(location.hash) : null;
    if (s) await apply(s);
    // Ett elevuppdrag i länken (u, #741) startar efter vyn, så att uppdragets år gäller
    const missionId = read ? decodeMission(location.hash) : null;
    const hunting = !!missionId && !!app.hunt?.start(missionId);
    // Startläget får också en adress, så att Bakåt efter första steget kommer tillbaka hit
    settle();
    history.replaceState(null, '', `${location.pathname}${search()}${writtenHash}`);
    setInterval(write, POLL_MS);
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
      if (tl && applyTour(tl, !!decodeMode(location.hash))) { followMission(); settle(); return; }
      if (app.tour?.active) app.tour.end(); // tar lektionsläget med sig (js/ui/tour.js)
      followMission();
      const t = decodeHash(location.hash);
      if (t) apply(t); else settle();
    });
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

  return { start, link, share };
}
