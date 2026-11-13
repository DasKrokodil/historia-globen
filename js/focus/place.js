// Fokustypen plats (#579): ett urval av händelser, valt med en geometri (dagens gräns i data/platser.json).
// Draft-platser laddas aldrig.
import { loadPlaces, t, isVisibleReview } from '../model.js';
import { ui } from '../i18n.js';
import { placeEvents } from '../place-geo.js';
import { formatYearSpan } from '../controllers/facts.js';
import { langs, selectionSpan } from './util.js';

export function entry(app) {
  const { $, data, panel } = app;
  let list = null; // platserna, hämtade första gången menyn öppnas
  // Händelserna inom gränsen, i tidsordning; bara de som syns
  const visible = place => placeEvents(place, data.events).filter(e => isVisibleReview(e.review));
  /** Platsens kort (#579): knappen Fakta i fokusraden öppnar det igen. */
  function showCard(f) {
    const { place } = f;
    const type = ui(`place.type.${place.type}`), of = place.partOf ? t(place.partOf) : '';
    app.store.setSelected(null);
    panel.showSelection({ label: ui('place.label'), name: place.name, lead: of ? ui('place.typeOf', { type, of }) : type, emblems: place.emblems,
      intro: place.intro,
      // Visa i Platt karta (#1161): byter vy och ramar in platsen; knappen finns när main.js har kopplat återanropet
      action: panel.onPlaceFlat ? { text: ui('place.flatMap'), label: `${ui('place.flatMap')}: ${t(place.name)}`, run: () => panel.onPlaceFlat(place) } : null,
      notes: [ui('place.borderNote'), ui('place.filters')], exit: ui('place.exit'),
      summary: ui('place.events', { count: f.themeEvents.length }), events: f.themeEvents, sources: place.sources });
    app.surfaces.closeGroup('meny');
    if (app.narrow.matches) app.surfaces.closeGroup('sidopanel');
    $('app').classList.add('has-detail');
  }
  return {
    type: 'place',
    selectsBy: 'geometry',
    empty: { year: 'place.emptyYear', next: 'place.emptyYearNext' },
    async load(id) {
      const place = (await loadPlaces()).find(x => x.id === id);
      const evs = place ? visible(place) : [];
      if (!evs.length) return { unavailable: 'place.unavailable' };
      const { from, to, lastEnd } = selectionSpan(evs);
      return { title: `${t(place.name)} · ${formatYearSpan(evs[0].start, lastEnd)}`, short: t(place.name), from, to,
        center: place.view.center, zoom: place.view.zoom, place, themeEvents: evs, eventIds: new Set(evs.map(e => e.id)) };
    },
    start: showCard,
    facts: { has: () => true, show: showCard },
    async menuLoad() { list ??= await loadPlaces(); },
    // En plats visas med typ och antal händelser inom gränsen ("Självstyrt område · 17 händelser · 2500 f.Kr.–2009", #579)
    menu: () => [{ title: 'Platser', note: ui('focus.note.places'), loading: !list, items: !list ? [] : list.map(pl => {
      const evs = visible(pl);
      if (!evs.length) return null;
      const to = Math.max(...evs.map(e => e.end));
      return { key: `place:${pl.id}`, label: t(pl.name), terms: langs(pl.name), sub: `${ui(`place.type.${pl.type}`)} · ${ui('focus.themeCount', { count: evs.length })} · ${formatYearSpan(evs[0].start, to)}`, from: evs[0].start, to };
    }).filter(Boolean) }],
  };
}
