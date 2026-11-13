// Fokustypen plats (#579): ett urval av händelser, valt med en geometri (dagens gräns i data/platser.json).
// Draft-platser laddas aldrig.
import { loadPlaces, t, isVisibleReview, formatYear, rangeText } from '../model.js';
import { ui } from '../i18n.js';
import { say } from '../ui/status.js';
import { placeEvents } from '../place-geo.js';
import { formatYearSpan } from '../controllers/facts.js';
import { langs, selectionSpan } from './util.js';

/**
 * Platsens kort (#579): samma kort i Fokus och i en turs steg (#1163). Skillnaden är det som hör till Fokus. I Fokus har kortet
 * knappen Avsluta platsen och Visa i Platt karta (#1161) och notisen om att filtren inte gäller; i en tur (follow: false)
 * har kortet ingen av dem: turen styr kameran och vyn och får inte avslutas av kortet. note är en rad direkt under namnet (att ett
 * tidsintervall avslutades när platsen började följas). focus: tar kortet tangentbordsfokus? Standard bara i Fokus; i en tur bara när
 * besökaren själv tryckte Läs om platsen.
 */
export function showPlaceCard(app, place, events, { follow = true, note = '', focus = follow } = {}) {
  const { $, panel } = app;
  const type = ui(`place.type.${place.type}`), of = place.partOf ? t(place.partOf) : '';
  app.store.setSelected(null);
  panel.showSelection({ label: ui('place.label'), name: place.name, lead: of ? ui('place.typeOf', { type, of }) : type, emblems: place.emblems,
    intro: place.intro,
    // Visa i Platt karta (#1161): byter vy och ramar in platsen; knappen finns när main.js har kopplat återanropet
    action: follow && panel.onPlaceFlat ? { text: ui('place.flatMap'), label: `${ui('place.flatMap')}: ${t(place.name)}`, run: () => panel.onPlaceFlat(place) } : null,
    notes: [ui('place.borderNote'), ...(follow ? [ui('place.filters')] : [])], banner: note, exit: follow ? ui('place.exit') : null,
    summary: ui('place.events', { count: events.length }), events, sources: place.sources, focus });
  app.surfaces.closeGroup('meny');
  if (app.narrow.matches) app.surfaces.closeGroup('sidopanel');
  $('app').classList.add('has-detail');
}

/** Raden i kortet när ett tidsintervall avslutades av att platsen började följas (#1163): vad som hände och vilket år platsen visas för. */
export const rangeEndedNote = (range, year) => ui('place.rangeEnded', { range: rangeText(range.from, range.to), year: formatYear(year) });

/** Händelserna inom platsens gräns i tidsordning, bara de som syns (draft visas aldrig). */
export const visibleEvents = (place, events) => placeEvents(place, events).filter(e => isVisibleReview(e.review));

export function entry(app) {
  const { data } = app;
  let list = null; // platserna, hämtade första gången menyn öppnas
  const visible = place => visibleEvents(place, data.events);
  /** Platsens kort (#579): knappen Fakta i fokusraden öppnar det igen. */
  function showCard(f, starting = false) {
    // Raden om intervallet står bara när platsen börjar följas; knappen Fakta visar kortet utan den
    const note = starting && f.closedRange ? rangeEndedNote(f.closedRange, f.startYear) : '';
    showPlaceCard(app, f.place, f.themeEvents, { follow: true, note });
    // Kortets rubrik läses upp med högre prioritet (js/main.js); beskedet om intervallet läses efter den och tappas inte
    if (note) setTimeout(() => { if (app.state.focus === f) say(note, 'plats', { priority: 2, immediate: true }); }, 1600);
  }
  return {
    type: 'place',
    selectsBy: 'geometry',
    startsAtRangeEnd: true, // började platsen följas under ett tidsintervall visas den för intervallets slutår, som riken och Tillbaka till ett år (#1163)
    empty: { year: 'place.emptyYear', next: 'place.emptyYearNext' },
    async load(id) {
      const place = (await loadPlaces()).find(x => x.id === id);
      const evs = place ? visible(place) : [];
      if (!evs.length) return { unavailable: 'place.unavailable' };
      const { from, to, lastEnd } = selectionSpan(evs);
      return { title: `${t(place.name)} · ${formatYearSpan(evs[0].start, lastEnd)}`, short: t(place.name), from, to,
        center: place.view.center, zoom: place.view.zoom, place, themeEvents: evs, eventIds: new Set(evs.map(e => e.id)) };
    },
    start: f => showCard(f, true),
    facts: { has: () => true, show: f => showCard(f) },
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
