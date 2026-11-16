// Fokustypen plats (#579): ett urval av händelser, valt med en geometri (dagens gräns i data/platser.json).
// Draft-platser laddas aldrig.
import { loadPlaces, loadEmpireFacts, t, isVisibleReview, formatYear, rangeText } from '../model.js';
import { ui } from '../i18n.js';
import { say } from '../ui/status.js';
import { placeEvents, placeBounds } from '../place-geo.js';
import { regionButtonKey } from '../region-frame.js';
import { formatYearSpan } from '../controllers/facts.js';
import { langs, selectionSpan, warnHuntImpossible } from './util.js';

/**
 * Knappen i platskortet: "Visa i regionvyn" för en plats som får regionvyn (js/region-frame.js), i Platt vy (Skåne, Danmark) eller
 * på globen (Aotearoa, Grönland, #1644), annars "Visa på Platt karta" (Sverige; ord ändrade i #1864). En liten plats får regionvyn i
 * Platt vy bara när den fria ytan rymmer den (#1692): är fönstret för litet, till exempel en liggande telefon, ramas platsen in i
 * Platt vy, och då säger knappen det. key är textens nyckel (controllers/region.js, buttonKey), annars bara platsens storlek.
 */
export function flatAction(place, run, key = placeButtonKey(place)) {
  return { text: ui(key), label: `${ui(key)}: ${t(place.name)}`, run };
}

/** Knappens textnyckel när ytan inte är känd: regionvyn för en plats som får den, annars Platt karta. */
function placeButtonKey(place) {
  return regionButtonKey(place.boundary?.geometry ? placeBounds(place) : null);
}

/**
 * Typraden under namnet (#1479): typen, och när platsen ingår i något (`partOf`) typen följd av frasen, till exempel "Landskap i Sverige".
 * `partOf` är hela frasen per språk, med preposition och artikel som landet kräver ("in der Schweiz", "aux États-Unis"), så koden
 * lägger aldrig till en preposition själv; mallen `place.typeOf` är bara "{type} {of}". tx och tui är texthämtarna (för prov per språk).
 */
export function placeLead(place, tx = t, tui = ui) {
  const type = tui(`place.type.${place.type}`), of = place.partOf ? tx(place.partOf) : '';
  return of ? tui('place.typeOf', { type, of }) : type;
}

/**
 * Platsens kort (#579): samma kort i Fokus och i en turs steg (#1163). Skillnaden är det som hör till Fokus. I Fokus har kortet
 * knappen Avsluta platsen och Visa i Platt karta (#1161) och notisen om att filtren inte gäller; i en tur (follow: false)
 * har kortet ingen av dem: turen styr kameran och vyn och får inte avslutas av kortet. note är en rad direkt under namnet (att ett
 * tidsintervall avslutades när platsen började följas). focus: tar kortet tangentbordsfokus? Standard bara i Fokus; i en tur bara när
 * besökaren själv tryckte Läs om platsen.
 */
export function showPlaceCard(app, place, events, { follow = true, note = '', focus = follow } = {}) {
  const { $, panel } = app;
  // Rikena i landskortet (#1448): i Fokus är varje rike en knapp Följ riket; i en tur bara en rad, eftersom turen inte får avslutas av kortet
  const rows = placeEmpireRows(place, app.data?.empireGroups);
  const periods = rows.map(r => {
    const years = formatYearSpan(r.from, r.to);
    if (r.kind === 'gap') return { gap: ui('place.empireGap', { years }) };
    return { years, name: r.name, label: ui('place.followEmpire', { name: t(r.name), years }), mapNote: r.mapNote,
      run: follow && panel.onPlaceEmpire ? () => panel.onPlaceEmpire({ ...r, label: `${t(r.name)} ${years}` }) : null };
  });
  // Förklaringen står under listan, så att raderna syns först i smal skärm; i Fokus också att Följ riket lämnar platsen
  const empires = periods.length ? { title: ui('place.empires', { count: rows.filter(r => r.kind === 'empire').length }),
    note: [ui('place.empiresNote'), ...(follow ? [ui('place.followLeaves')] : [])].join(' '), follow: ui('place.followEmpireShort'), rows: periods } : null;
  app.store.setSelected(null);
  panel.showSelection({ label: ui('place.label'), name: place.name, lead: placeLead(place), emblems: place.emblems,
    intro: place.intro,
    // Visa i Platt karta (#1161): byter vy och ramar in platsen; knappen finns när main.js har kopplat återanropet
    // En liten plats får regionvyn (#1641), och knappen säger det, men bara när den ryms (#1692, controllers/region.js)
    action: follow && panel.onPlaceFlat ? flatAction(place, () => panel.onPlaceFlat(place), app.region?.buttonKey(place)) : null,
    // boundary.note (#1159): en fast rad om vad konturen är när den inte är platsens egen gräns (Skåne läns gräns för landskapet Skåne)
    notes: [ui('place.borderNote'), ...(place.boundary?.note ? [t(place.boundary.note)] : []), ...(follow ? [ui('place.filters')] : [])], banner: note, exit: follow ? ui('place.exit') : null,
    empires, summary: ui('place.events', { count: events.length }), events, sources: place.sources, focus, ariaLabel: ui('place.cardLabel'), aboutLabel: ui('place.about') });
  app.surfaces.closeGroup('meny');
  if (app.narrow.matches) app.surfaces.closeGroup('sidopanel');
  $('app').classList.add('has-detail');
  app.region?.refreshButton?.(follow ? place : null); // kortet syns nu: knappens text räknas om på det som täcker kartan (#1692)
}

/**
 * Rikena i landskortet (#1448): platsens periods i tidsordning, med rikets eget namn (delen, polity, i data/empires/index.json), och
 * en rad för varje lucka, år mellan första och sista perioden som ingen period täcker. Inga namn eller årtal står i koden: allt kommer
 * ur platsen och rikenas index, och scripts/validate-site.py kontrollerar att åren är rikets egna. En period vars rike eller del saknas
 * i indexet hoppas över. Ger [] när platsen saknar perioder.
 */
export function placeEmpireRows(place, groups = []) {
  const rows = [], noted = new Set();
  for (const p of place?.periods ?? []) {
    const g = (groups ?? []).find(x => x.id === p.empire), pol = g?.polities?.find(x => x.id === p.polity);
    if (!pol) continue;
    // Rikets egen rad Om kartan (facts.mapNote) står vid raden när gruppen bara har den här delen, så att texten gäller delen
    // (Kalmarunionen: källornas årtal mot kartans), och bara vid gruppens första rad. Laddas med rikenas faktarutor (ensurePlaceFacts).
    const mapNote = g.polities.length === 1 && g.facts?.mapNote && !noted.has(g.id) ? g.facts.mapNote : null;
    if (mapNote) noted.add(g.id);
    rows.push({ kind: 'empire', empire: g.id, polity: pol.id, name: pol.name, from: p.from, to: p.to, mapNote });
  }
  const gaps = [];
  let end = -Infinity;
  for (const r of [...rows].sort((a, b) => a.from - b.from)) {
    if (end !== -Infinity && r.from > end + 1) gaps.push({ kind: 'gap', from: end + 1, to: r.from - 1 });
    end = Math.max(end, r.to);
  }
  // Stabil sortering: perioder med samma första år står i platsens ordning, och en lucka står efter perioden före den
  return [...rows, ...gaps].sort((a, b) => a.from - b.from);
}

/** Rikenas faktarutor (mapNote vid raderna, #1448) laddas innan kortet för en plats med perioder ritas. Ett fel stoppar inte kortet. */
export const ensurePlaceFacts = place => (place?.periods?.length ? loadEmpireFacts().catch(err => console.warn('Rikenas faktarutor kunde inte laddas', err)) : null);

/**
 * Var intervallets slutår ligger i förhållande till platsens egna händelser (#1464): 'in' inom spannet (platsen visas för slutåret),
 * 'after' efter platsens sista händelse eller 'before' före den första. when är det årtal som raden nämner, räknat ur händelserna
 * (sista händelsens slut eller första händelsens start) och aldrig skrivet för hand. Samma spann som fokuset börjar i (selectionSpan).
 */
export function rangeEndSide(to, events) {
  if (!events?.length) return { side: 'in', when: null };
  const { from, to: spanTo, lastEnd } = selectionSpan(events), end = Math.floor(to);
  if (end > spanTo) return { side: 'after', when: Math.floor(lastEnd) };
  if (end < from) return { side: 'before', when: Math.floor(events[0].start) };
  return { side: 'in', when: null };
}

/**
 * Raden i kortet när ett tidsintervall avslutades av att platsen började följas (#1163): vad som hände och vilket år platsen visas för.
 * Ligger intervallets slutår utanför platsens händelser säger raden också varför platsen inte visas för slutåret (#1464).
 */
export function rangeEndedNote(range, year, events = []) {
  const { side, when } = rangeEndSide(range.to, events);
  const key = { in: 'place.rangeEnded', after: 'place.rangeEndedAfter', before: 'place.rangeEndedBefore' }[side];
  // Slutar årtalet med f.Kr. blir punkten efter förkortningen också meningens punkt, inte två
  return ui(key, { range: rangeText(range.from, range.to), year: formatYear(year), when: when == null ? '' : formatYear(when) }).replace(/\.\.$/, '.');
}

/** Händelserna inom platsens gräns i tidsordning, bara de som syns (draft visas aldrig). */
export const visibleEvents = (place, events) => placeEvents(place, events).filter(e => isVisibleReview(e.review));

export function entry(app) {
  const { data } = app;
  let list = null; // platserna, hämtade första gången menyn öppnas
  const visible = place => visibleEvents(place, data.events);
  /** Platsens kort (#579): knappen Fakta i fokusraden öppnar det igen. */
  function showCard(f, starting = false) {
    // Raden om intervallet står bara när platsen börjar följas; knappen Fakta visar kortet utan den
    const note = starting && f.closedRange ? rangeEndedNote(f.closedRange, f.startYear, f.themeEvents) : '';
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
      await ensurePlaceFacts(place);
      const { from, to, lastEnd } = selectionSpan(evs);
      return { title: `${t(place.name)} · ${formatYearSpan(evs[0].start, lastEnd)}`, short: t(place.name), from, to,
        center: place.view.center, zoom: place.view.zoom, place, themeEvents: evs, eventIds: new Set(evs.map(e => e.id)) };
    },
    start(f) {
      showCard(f, true);
      // En jakt pågår samtidigt med platsen (#893). Platsen begränsar vad som syns, så säg det när uppdraget inte går att klara (#1439)
      warnHuntImpossible(app.hunt, f.themeEvents, 'place.huntImpossible');
    },
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
