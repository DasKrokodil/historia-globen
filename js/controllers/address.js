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
// - Knappen Dela kopierar länken, eller öppnar telefonens delningsmeny där den finns.

import { toJSON } from '../state.js';
import { encodeHash, decodeHash, decodeTour, isNewStep } from '../url-state.js';
import { ui } from '../i18n.js';

const POLL_MS = 700;

export function createAddress(app) {
  const { state, globe, timeline, layers, panel, data } = app;
  const allCategories = [...new Set(data.events.map(e => e.category))].sort();
  let applying = false, written = null, writtenHash = '', seenHash = '';

  const current = () => toJSON(state, globe.view);
  const position = () => app.tour?.position ?? null;
  const hashOf = (json, tour = null) => encodeHash(json, allCategories, tour);
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
          try { await app.startFocus(s.focus); } catch (err) { console.warn('Fokus i länken kunde inte öppnas', err); }
          timeline.year = s.year; // fokus kan ha flyttat året till sin start
        } else if (state.focus) app.endFocus();
      }
      if (s.camera) { globe.flyTo(s.camera.lat, s.camera.lon, 600); globe.setZoom(s.camera.zoom); }
      app.refresh();
    } finally {
      applying = false;
      settle();
    }
  }

  /** Startar turen i en länk ({ id, step } från decodeTour). Ger false när turen inte finns. */
  function applyTour(tl) {
    const tour = app.tour;
    if (!tl || !tour) return false;
    if (tour.active && tour.position?.id === tl.id) { tour.go(tour.stepIndex(tl.step)); return true; }
    return tour.start(tl.id, null, tl.step);
  }

  function write() {
    if (applying) return;
    const cur = current(), pos = position();
    const hash = hashOf(cur, pos);
    if (hash === writtenHash) return;
    if (!timeline.playing && hash !== seenHash) { seenHash = hash; return; } // vänta tills vyn står still
    const url = `${location.pathname}${search()}${hash}`;
    // Ett nytt steg i turen, eller att turen börjar eller slutar, blir en egen post (Bakåt går till steget innan)
    const tourStep = new URLSearchParams(writtenHash.slice(1)), newTour = (tourStep.get('t') ?? '') !== (pos?.id ?? '') || (tourStep.get('s') ?? '') !== (pos?.step ?? '');
    if (newTour || isNewStep(written, cur, { playing: timeline.playing })) history.pushState(null, '', url);
    else history.replaceState(null, '', url);
    written = cur; writtenHash = seenHash = hash;
  }

  /** Läser adressen vid start. Ger true om en giltig länk ställde in vyn. */
  async function start({ read = true } = {}) {
    // En tur i länken går före en delad vy; finns turen inte läses resten av länken som vanligt
    const touring = read && applyTour(decodeTour(location.hash, location.search));
    const s = read && !touring ? decodeHash(location.hash) : null;
    if (s) await apply(s);
    // Startläget får också en adress, så att Bakåt efter första steget kommer tillbaka hit
    settle();
    history.replaceState(null, '', `${location.pathname}${search()}${writtenHash}`);
    setInterval(write, POLL_MS);
    addEventListener('popstate', () => {
      const tl = decodeTour(location.hash);
      if (tl && applyTour(tl)) { settle(); return; }
      if (app.tour?.active) app.tour.end();
      const t = decodeHash(location.hash);
      if (t) apply(t); else settle();
    });
    return touring || !!s;
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
