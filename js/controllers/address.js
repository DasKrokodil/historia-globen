// Tillståndet i adressen (#501) och delbara länkar (#64). Formatet står i js/url-state.js och docs/arkitektur.md.
//
// - Vid start läses hashen: lagren, kategorierna, året, fokus och kameran ställs in i den ordningen
//   (fokus behåller året när det ligger inom spannet, och kameran sätts sist så att fokus inte flyttar den).
// - Därefter skrivs tillståndet i adressen med history.replaceState eller pushState. En ny post i historiken
//   (bakåt/framåt) blir det bara vid större steg: nytt fokus, ändrade lager eller kategorier, eller ett årshopp
//   som har stått still en stund. Uppspelning och vridning av globen ersätter den nuvarande posten.
// - Bakåt och framåt (popstate) läser hashen och ställer in vyn igen.
// - Knappen Dela kopierar länken, eller öppnar telefonens delningsmeny där den finns.

import { toJSON } from '../state.js';
import { encodeHash, decodeHash, isNewStep } from '../url-state.js';
import { ui } from '../i18n.js';

const POLL_MS = 700;

export function createAddress(app) {
  const { state, globe, timeline, layers, panel, data } = app;
  const allCategories = [...new Set(data.events.map(e => e.category))].sort();
  let applying = false, written = null, seen = null;

  const current = () => toJSON(state, globe.view);
  const hashOf = json => encodeHash(json, allCategories);

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
      written = seen = current();
    }
  }

  function write() {
    if (applying || app.tour?.active) return;
    const cur = current();
    const hash = hashOf(cur);
    if (written && hash === hashOf(written)) return;
    if (!timeline.playing && (!seen || hash !== hashOf(seen))) { seen = cur; return; } // vänta tills vyn står still
    const url = `${location.pathname}${location.search}${hash}`;
    if (isNewStep(written, cur, { playing: timeline.playing })) history.pushState(null, '', url);
    else history.replaceState(null, '', url);
    written = seen = cur;
  }

  /** Läser adressen vid start. Ger true om en giltig länk ställde in vyn. */
  async function start({ read = true } = {}) {
    const s = read ? decodeHash(location.hash) : null;
    if (s) await apply(s);
    // Startläget får också en adress, så att Bakåt efter första steget kommer tillbaka hit
    written = seen = current();
    history.replaceState(null, '', `${location.pathname}${location.search}${hashOf(written)}`);
    setInterval(write, POLL_MS);
    addEventListener('popstate', () => {
      const t = decodeHash(location.hash);
      if (t) apply(t);
    });
    return !!s;
  }

  /** Länken till vyn som den ser ut nu. */
  function link() {
    return `${location.origin}${location.pathname}${location.search}${hashOf(current())}`;
  }

  /** Knappen Dela (#64): delningsmenyn i telefonen, annars kopiera länken. status(text) visar resultatet. */
  async function share(status) {
    const url = link();
    history.replaceState(null, '', url);
    written = seen = current();
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
