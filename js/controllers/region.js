// Regionvyn (#1641, steg 1a av #1627): knappen "Visa i regionvy" i kortet för en liten plats (upp till cirka 5 grader på marken,
// i dag Skåne och Danmark; js/region-frame.js) ger en skarp, inzoomad karta över platsen och den närmaste omgivningen, med en
// sluten kantlinje i skärmpixlar och omgivningen nedtonad. Större platser ramas in i Platt vy som förut (controllers/places.js).
//
// Vyn hör till platsen man följer: den lämnas med knappen "Lämna regionvyn", med Escape (när inget ligger ovanpå: menyer,
// dialoger, kortet), när man slutar följa platsen, när en tur eller adress ställer kartan och när Platt vy stängs. Återställ
// ramar in platsen igen. Statusraden säger vilken plats som visas och att bara platsens gräns och händelser visas (ritningen och
// skälen: js/ui/flatmap.js, docs/beslut/2026-11-14-regionvy-steg-1a-1641.md). Ramen räknas ur platsens gräns (placeBounds),
// inte ur ett fält i datan, och lägger platsen i den del av kartan som kortet, arket, fokusraden och vyns egen ruta inte täcker.
//
// Markörerna (#1642, steg 1b): platsens händelser får numrerade markörer, där numret är raden i listan "Händelser på platsen" i
// kortet (raderna får samma nummer medan vyn är öppen). Händelser som gäller hela platsen (`scope: "place"`, #1674) står i brickan "Hela Skåne", markörer på
// samma ställe i en hög som fälls ut, och ortnamnen (data/ortnamn/<plats>.json) laddas när vyn öppnas (js/ui/region-marks.js).
// Lista och karta hör ihop: en rad i fokus eller under musen markerar markören, en markerad markör ger raden en ram, och Escape
// fäller först ihop en utfälld hög.
//
// Globflyget (#1644, steg 2): en stor plats (Aotearoa och Grönland; fler än 15 och högst 60 grader på marken, js/region-frame.js)
// får regionvyn på globen i stället: globen flyger in med ett smalt synfält och lägger platsen mitt i den fria ytan (Globe.setRegion),
// med samma ruta, markörer, bricka, högar, ortnamn, lista och vägar ut som i Platt vy (js/ui/globe-region.js). Sverige väntar på
// DasKrokodils bedömning och ramas in i Platt vy som förut (beslut 2026-11-15).
import { placeBounds } from '../place-geo.js';
import { regionEligible, regionSize, freeArea, globeRegionEligible, globeFrame } from '../region-frame.js';
import { GlobeRegion } from '../ui/globe-region.js';
import { regionItems } from '../region-markers.js';
import { visibleEvents } from '../focus/place.js';
import { OVERLAY_IDS } from '../surfaces.js';
import { t, loadOrtnamn, pluralUi, loadedPlaces } from '../model.js';
import { ui } from '../i18n.js';
import { say } from '../ui/status.js';

/** Arket i mobil fälls ihop med en övergång: ramen räknas om när den är klar, om man inte har flyttat kartan under tiden. */
const REFIT_MS = 450;
/** Luft mellan platsens ram och det som täcker kartan (skärmpixlar). */
const GAP = 8;
/**
 * Den minsta fria yta (skärmpixlar) där regionvyn är till nytta: platsen fyller 65 % av den, alltså minst cirka 150 × 100 px.
 * Är ytan mindre (till exempel en liggande telefon med arket uppe) ramas platsen in i Platt vy som förut.
 */
export const MIN_FREE = { w: 230, h: 150 };

export function createRegion(app) {
  const { $, state, data, flatMap, globe, store, surfaces } = app;
  // Regionvyn på globen (#1644): samma markörer ovanpå klotet
  const globeView = new GlobeRegion({ globe, root: $('globe-region'), canvas: $('globe-region-canvas'), labels: $('globe-region-labels'),
    onSelect: id => app.select(id, false), selectedId: () => state.selectedId });
  /** Var regionvyn är öppen: 'flat' (Platt vy, steg 1) eller 'globe' (globflyget, steg 2), annars null. */
  let where = null;
  /** Markörerna där vyn är öppen (Platt vy som standard, så att lyssnarna nedan alltid har något att fråga). */
  const M = () => (where === 'globe' ? globeView.regionMarks : flatMap.regionMarks);
  const marks = {
    get active() { return M().active; }, get content() { return M().content; }, get mark() { return M().mark; },
    get open() { return M().open; }, get box() { return M().box; },
    setContent: (...a) => M().setContent(...a), setMark: (...a) => M().setMark(...a), setHover: (...a) => M().setHover(...a),
    setNames: (...a) => M().setNames(...a), numberOf: (...a) => M().numberOf(...a), closeFan: (...a) => M().closeFan(...a),
  };
  /** Rutan med vilken plats som visas och vägen ut: i Platt vy och på globen var sin, med samma texter. */
  const chips = {
    flat: { chip: $('flat-region'), title: $('flat-region-name'), note: $('flat-region-note'), back: $('flat-region-back'), legend: $('flat-region-legend-text') },
    globe: { chip: $('globe-region-chip'), title: $('globe-region-name'), note: $('globe-region-note'), back: $('globe-region-back'), legend: $('globe-region-legend-text') },
  };
  const chip = chips.flat.chip;
  /** Är vyn öppen för platsen just nu? */
  const isOpen = () => (where === 'globe' ? globeView.region != null : !!flatMap.region);
  const openId = () => (where === 'globe' ? globeView.region : flatMap.region);
  // Samma rad överst i Lager medan regionvyn är öppen: valen där gäller inte kartan just då
  const layerNote = document.createElement('p');
  layerNote.className = 'layer-region-note';
  layerNote.hidden = true;
  $('layer-menu').prepend(layerNote);
  let place = null, refit = 0;

  /** Rutan för ett element i kartans pixlar, med luft runt, eller null när det inte syns. */
  function rect(el, box) {
    if (!el || el.hidden || !el.getClientRects().length) return null;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return { x0: r.left - box.left - GAP, y0: r.top - box.top - GAP, x1: r.right - box.left + GAP, y1: r.bottom - box.top + GAP };
  }
  /**
   * Den fria delen av kartan: utan kortet (dator) eller arket (mobil), fokusraden, pausraden och regionvyns ruta. Kortet och arket
   * går först, eftersom de är störst; varje remsa väljs så att platsen får så stor skala som möjligt (region-frame.js).
   */
  function free() {
    if (where === 'globe') return globeFree();
    const box = flatMap.canvas.getBoundingClientRect();
    const shape = place?.boundary?.geometry ? regionSize(placeBounds(place)) : null;
    // På dator ligger zoomknapparna till vänster om kortet medan det är öppet (#1660), alltså inne i den fria ytan: platsen ramas
    // då in vid sidan av dem. Annars ligger de vid högerkanten, där de alltid legat, och i mobil uppe till höger som förut.
    const zoom = !$('detail').hidden && matchMedia('(min-width: 761px)').matches ? document.querySelector('#flat-view .flat-zoom') : null;
    return freeArea({ w: box.width, h: box.height }, [$('detail'), $('focus-bar'), $('pause-note'), chip, zoom].map(el => rect(el, box)), shape);
  }
  const roomy = () => { const f = flatMap.regionFree(); return !!f && f.w >= MIN_FREE.w && f.h >= MIN_FREE.h; };
  /**
   * Den fria delen av globen (#1644): klotets canvas täcker hela sidan, så här dras också knapparna och årtalet överst och tidslinjen
   * nertill bort, utöver kortet eller arket, fokusraden, pausraden och rutan. Samma regel som i Platt vy (freeArea).
   */
  const globeCovering = () => [$('detail'), document.querySelector('.timebar'), $('focus-bar'), $('pause-note'), chips.globe.chip,
    document.querySelector('.masthead'), document.querySelector('.top-actions'), $('focus-moved')];
  function globeFree() {
    const box = globe.canvas.getBoundingClientRect();
    const shape = place?.boundary?.geometry ? regionSize(placeBounds(place)) : null;
    return freeArea({ w: box.width, h: box.height }, globeCovering().map(el => rect(el, box)), shape);
  }
  globeView.regionFree = () => globeFree();
  globeView.regionCovers = () => {
    const box = globe.canvas.getBoundingClientRect();
    return globeCovering().map(el => rect(el, box)).filter(Boolean).map(r => ({ x0: r.x0 + GAP, y0: r.y0 + GAP, x1: r.x1 - GAP, y1: r.y1 - GAP }));
  };
  // Det som ligger ovanpå kartan (också zoomknapparna): ortnamnen och brickan läggs inte där (#1642). rect() lägger till luften GAP
  // för ramen; här dras den av igen, så att rutorna är elementens egna
  flatMap.regionCovers = () => {
    const box = flatMap.canvas.getBoundingClientRect();
    return [$('detail'), $('focus-bar'), $('pause-note'), chip, document.querySelector('#flat-view .flat-zoom')].map(el => rect(el, box)).filter(Boolean)
      .map(r => ({ x0: r.x0 + GAP, y0: r.y0 + GAP, x1: r.x1 - GAP, y1: r.y1 - GAP }));
  };

  // ---- markörerna och listan (#1642) -------------------------------------------------------------------------------
  /** Platsens händelser i listans ordning: samma som kortet visar (Fokus på platsen), annars ur platsens gräns. */
  const placeEventsOf = p => (state.focus?.type === 'place' && state.focus.place?.id === p.id ? state.focus.themeEvents : visibleEvents(p, data.events)) ?? [];
  const rows = () => [...$('detail').querySelectorAll('[data-theme-event]')];
  /** Raderna i listan får markörernas nummer (och märket för hela platsen eller ungefärlig plats) medan vyn är öppen. */
  function decorate() {
    if (!place || !marks.active) return;
    // Raderna och markörerna ska vara samma händelser i samma ordning; gäller kortet en annan lista (ett nytt urval för platsen)
    // räknas markörerna om ur platsens händelser, så att numren aldrig pekar på fel rad
    const ids = rows().map(b => b.dataset.themeEvent);
    if (ids.length && ids.join() !== marks.content.items.map(it => it.e.id).join()) sync();
    for (const b of rows()) {
      const n = marks.numberOf(b.dataset.themeEvent);
      if (n == null || b.querySelector('.region-num')) continue;
      const it = marks.content.byId.get(b.dataset.themeEvent);
      const num = document.createElement('span');
      num.className = `region-num${it.whole ? ' is-whole' : it.approx ? ' is-approx' : ''}`;
      num.textContent = String(n);
      b.prepend(num);
    }
    $('detail').classList.add('region-numbered');
    markRows(marks.mark ? [marks.mark] : []);
  }
  /** Markörerna räknas om ur platsens händelser (listans ordning), med samma markering om händelsen finns kvar. */
  function sync() {
    const mark = marks.mark;
    marks.setContent({ place, events: placeEventsOf(place), places: loadedPlaces() });
    if (mark && marks.numberOf(mark) != null) marks.setMark(mark, { open: false });
    for (const el of $('detail').querySelectorAll('.region-num')) el.remove();
  }
  function undecorate() {
    for (const el of $('detail').querySelectorAll('.region-num')) el.remove();
    for (const el of $('detail').querySelectorAll('.is-region-marked')) el.classList.remove('is-region-marked');
    $('detail').classList.remove('region-numbered');
  }
  /** Ramen runt de markerade raderna; från kartan fälls listan ut och raden rullas fram. */
  function markRows(ids, from = 'list') {
    const set = new Set(ids);
    let first = null;
    for (const b of rows()) {
      const on = set.has(b.dataset.themeEvent);
      b.classList.toggle('is-region-marked', on);
      if (on && !first) first = b;
    }
    if (first && from !== 'list') {
      const list = first.closest('details');
      if (list && !list.open) list.open = true;
      first.scrollIntoView({ block: 'nearest' });
    }
  }
  flatMap.regionMarks.onMark = globeView.regionMarks.onMark = (ids, from) => markRows(ids, from);
  // Kortet ritas om (Fakta, en ny rad): raderna får numren igen
  new MutationObserver(() => { if (place) decorate(); }).observe($('detail'), { childList: true });
  // En rad i fokus markerar markören och fäller ut högen den ligger i; muspekaren över en rad markerar utan att fälla ut
  $('detail').addEventListener('focusin', e => {
    const b = e.target.closest?.('[data-theme-event]');
    if (b && place && marks.active) marks.setMark(b.dataset.themeEvent, { open: true, from: 'list' });
  });
  $('detail').addEventListener('pointerover', e => {
    if (!place || !marks.active || e.pointerType !== 'mouse') return; // ett tryck med finger öppnar raden, det är ingen hovring
    marks.setHover(e.target.closest?.('[data-theme-event]')?.dataset.themeEvent ?? null);
  });
  $('detail').addEventListener('pointerleave', () => { if (place && marks.active) marks.setHover(null); });

  /** Statusraden: "Skåne, 21 händelser, 7 gäller hela Skåne". */
  function countText(p, items) {
    const whole = items.filter(it => it.whole).length, name = t(p.name);
    return [pluralUi('regionView.count', items.length), ...(whole ? [pluralUi('regionView.whole', whole, { place: name })] : [])].join(', ');
  }

  /** Får platsen regionvyn? I Platt vy när den är liten nog, på globen när den är stor (region-frame.js). Sverige ingen av dem. */
  const eligible = p => !!p?.boundary?.geometry && (regionEligible(placeBounds(p)) || globeRegionEligible(placeBounds(p)));
  const onGlobe = p => !!p?.boundary?.geometry && globeRegionEligible(placeBounds(p));

  /** Platt vy som förut: platsen inramad, utan regionvyn (med kortets yta bortdragen i dator). */
  function frameFlat(p) {
    const card = $('detail');
    const covered = !app.narrow.matches && !card.hidden ? Math.max(0, flatMap.canvas.getBoundingClientRect().right - card.getBoundingClientRect().left) : 0;
    flatMap.frame(placeBounds(p), 0.78, covered);
  }

  /** För liten yta för regionvyn: lämna den tyst och visa platsen i Platt vy som förut, med samma besked som där. */
  function fallBack(p) {
    flatMap.leaveRegion();
    frameFlat(p);
    say(ui('place.flatShown', { place: t(p.name) }), 'plats', { priority: 2, immediate: true });
  }

  /**
   * Globens ruta står under årtalets ruta (överst till vänster), där religionernas förklaring annars står. Höjden räknas ur rutans
   * underkant, eftersom raden "Följer …" kan bli två rader på andra språk (UX-granskningen 2026-11-15); i smal skärm under
   * knapparna överst också.
   */
  function placeGlobeChip() {
    const app0 = $('app').getBoundingClientRect();
    const bottoms = [document.querySelector('.masthead'), ...(app.narrow.matches ? [document.querySelector('.top-actions')] : [])]
      .map(el => el?.getBoundingClientRect()).filter(r => r?.height).map(r => r.bottom - app0.top);
    if (bottoms.length) chips.globe.chip.style.top = `${Math.round(Math.max(...bottoms) + 8)}px`;
  }

  /** Rutans texter och de delar som är lika i Platt vy och på globen. */
  function showChip(p, w) {
    const c = chips[w], name = t(p.name);
    c.title.textContent = ui('regionView.title', { place: name });
    c.note.textContent = layerNote.textContent = `${ui('regionView.note')} ${ui('regionView.tap')}`; // och hur man får fakta (#1791)
    c.back.textContent = ui('regionView.leave');
    // Förklaringen till den streckade ringen runt markörer med ungefärlig plats (#1642), också i mobil
    c.legend.textContent = ui('regionView.legend');
    c.chip.hidden = false; // först: rutan tar plats, och ramen räknas utan den
    if (w === 'globe') placeGlobeChip();
    layerNote.hidden = false;
    $('app').classList.add('region-view');
  }

  /** Markörerna i listans ordning, ortnamnen när filen har laddats och beskedet på statusraden. */
  function fill(p) {
    const events = placeEventsOf(p);
    marks.setContent({ place: p, events, places: loadedPlaces() });
    decorate();
    loadOrtnamn(p.id).then(doc => { if (doc && openId() === p.id && place === p) marks.setNames(doc); });
    return events;
  }

  /**
   * Regionvyn på globen (#1644): globen flyger in till platsen med ett smalt synfält, utan Platt vy. Markörerna, högarna och brickan
   * från steg 1b ligger ovanpå klotet, och världslagren ritas inte (render.js, som i Platt vys regionvy).
   */
  function enterGlobe(p) {
    if (flatMap.region) flatMap.leaveRegion();
    if (where === 'globe' && globeView.region) closeGlobe();
    place = p;
    where = 'globe';
    app.viewMode.set('globe');
    showChip(p, 'globe');
    $('app').classList.add('globe-region-view');
    const b = placeBounds(p), geom = p.boundary.geometry;
    globeView.open(p.id, b, geom);
    globe.markerGroup.visible = globe.arcGroup.visible = false; // händelsernas medaljer och bågarna: markörerna ersätter dem
    globe.setRegion(() => globeFrame(geom, b, globeFree()));
    const events = fill(p);
    app.refresh(); // lagerbilden utan världslagren, och platsens linje med omgivningen nedtonad
    clearTimeout(refit);
    // I mobil fälls arket ihop strax efter: ramen räknas om när det har skett, om man inte har flyttat klotet
    refit = setTimeout(() => { if (where === 'globe' && globeView.region === p.id && !globe.regionMoved) globe.resetRegion(); }, REFIT_MS);
    say(ui('regionView.shownGlobe', { place: t(p.name), events: countText(p, regionItems(events, p, loadedPlaces())) }), 'plats', { priority: 2, immediate: true });
  }

  /** Globens regionvy stängs: kameran flyger tillbaka till den vanliga globen. */
  function closeGlobe({ quiet = true } = {}) {
    if (where !== 'globe' || !globeView.region) return;
    const was = place;
    globeView.close();
    globe.setRegion(null);
    globe.markerGroup.visible = globe.arcGroup.visible = true;
    $('app').classList.remove('globe-region-view');
    ended(was, quiet, 'regionView.leftGlobe');
    app.refresh();
  }

  /** Byt till regionvyn för platsen: i Platt vy för en liten plats, på globen för en stor (#1644). */
  function enter(p) {
    if (onGlobe(p)) { enterGlobe(p); return; }
    if (where === 'globe') closeGlobe();
    place = p;
    where = 'flat';
    const name = t(p.name);
    showChip(p, 'flat');
    flatMap.enterRegion(p.id, placeBounds(p), free);
    // I mobil fälls arket ihop strax efter; där avgörs storleken när det har skett
    if (!app.narrow.matches && !roomy()) { fallBack(p); return; }
    // Markörerna i listans ordning, och ortnamnen när filen har laddats (först nu, bara för den här platsen)
    const events = fill(p);
    // Den finare kusten (1:10m, samma som globens utsnitt) laddas en gång; kartan ritas om med den när den kommer
    globe.detail.loadFineLand?.()?.then(land => { if (land) flatMap.regionLayersChanged(); });
    clearTimeout(refit);
    refit = setTimeout(() => {
      if (flatMap.region !== p.id) return;
      if (!flatMap.regionMoved) flatMap.fitRegion();
      if (!roomy()) fallBack(p);
    }, REFIT_MS);
    say(ui('regionView.shown', { place: name, events: countText(p, regionItems(events, p, loadedPlaces())) }), 'plats', { priority: 2, immediate: true }); // som faktarutans rubrik: svaret på knappen
  }

  /** Lämna regionvyn med knappen eller Escape: Platt vy som förut, med platsen inramad, och fokus på kartan. På globen flyger
   *  kameran tillbaka till den vanliga globen, och fokus går till globen. */
  function leave() {
    const p = place;
    if (where === 'globe') {
      if (!p || !globeView.region) return;
      closeGlobe({ quiet: false });
      globe.canvas.focus({ preventScroll: true });
      return;
    }
    if (!p || !flatMap.region) return;
    flatMap.leaveRegion({ quiet: false });
    frameFlat(p);
    flatMap.canvas.focus({ preventScroll: true });
  }

  // Kartan säger till när vyn slutar, vad som än avslutade den (knappen, en tur, Platt vy som stängs)
  flatMap.onRegion = (id, prev, { quiet = true } = {}) => {
    if (id || where !== 'flat') return;
    ended(place, quiet);
  };
  /** Vyn är slut, i Platt vy eller på globen: rutan, raderna och klassen tas bort, och statusraden säger det när man själv lämnade. */
  function ended(was, quiet, leftKey = 'regionView.left') {
    place = null;
    where = null;
    undecorate();
    clearTimeout(refit);
    chips.flat.chip.hidden = chips.globe.chip.hidden = true;
    layerNote.hidden = true;
    $('app').classList.remove('region-view');
    if (!quiet && was) say(ui(leftKey, { place: t(was.name) }), 'plats', { priority: 2, immediate: true });
  }
  // Återställ i regionvyn ramar in platsen igen och säger det
  flatMap.onRegionReset = () => { if (place) say(ui('regionView.reset', { place: t(place.name) }), 'plats', { priority: 2, immediate: true }); };
  chips.flat.back.addEventListener('click', leave);
  chips.globe.back.addEventListener('click', leave);
  // Platt vy eller Upptäcktsresor öppnas medan globen visar regionvyn: vyn hör till globen och lämnas tyst
  const onToggle = flatMap.onToggle;
  flatMap.onToggle = open => { if (open && where === 'globe') closeGlobe(); onToggle?.(open); };
  // Upptäcktsresor slås på i Vy eller Lager: vyn stängs efter bildrutan, inte mitt i globens återanrop (Lager-menyns onChange sätts
  // först efter att den här modulen har skapats, därför frågar bildrutan)
  globe.onFrame(() => { if (where === 'globe' && globeView.region && app.layers?.on?.discovery) setTimeout(() => { if (app.layers?.on?.discovery) closeGlobe(); }); });

  // Arket, kortet och fokusraden ändrar höjd (ett läge i arket, en rad till i fokusraden): ramen räknas om när det har stannat,
  // men bara om man inte har panorerat eller zoomat själv
  if (typeof ResizeObserver !== 'undefined') {
    let timer = 0;
    const ro = new ResizeObserver(() => {
      if (!isOpen()) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (where === 'globe') { placeGlobeChip(); if (globeView.region && !globe.regionMoved) globe.resetRegion(300); return; }
        if (flatMap.region && !flatMap.regionMoved) flatMap.fitRegion();
      }, 200);
    });
    for (const id of ['detail', 'focus-bar']) if ($(id)) ro.observe($(id));
    if (document.querySelector('.masthead')) ro.observe(document.querySelector('.masthead')); // årtalets ruta växer (#1644)
  }

  // Vyn hör till platsen man följer: slutar man följa den (eller följer något annat) lämnas den
  store.subscribe(({ type }) => {
    if (type !== 'focus' || !isOpen()) return;
    if (state.focus?.type !== 'place' || state.focus.place?.id !== openId()) {
      if (where === 'globe') closeGlobe(); else flatMap.leaveRegion();
      return;
    }
    // Samma plats med ett nytt fokus (en adress eller Sök och följ startar den igen): markörerna följer dess lista
    if (place && marks.active && placeEventsOf(place).map(e => e.id).join() !== marks.content.items.map(it => it.e.id).join()) { sync(); decorate(); }
  });

  // Escape lämnar regionvyn, men först det som ligger ovanpå (OVERLAY_IDS och stängregistrets grupper). Lyssnaren ligger på
  // window i fångstfasen, så den går före dokumentets lyssnare som annars skulle avsluta Fokus och stänga Platt vy i samma tryck
  addEventListener('keydown', e => {
    if (e.key !== 'Escape' || e.defaultPrevented || !isOpen() || (where === 'flat' && flatMap.hidden)) return;
    // Fokus i en utfälld hög eller bricka (#1642): Escape fäller ihop den och lägger fokus på högen, före allt annat
    if (marks.open && marks.box?.contains(document.activeElement)) {
      e.preventDefault(); e.stopImmediatePropagation();
      marks.closeFan();
      return;
    }
    const open = OVERLAY_IDS.some(id => { const el = $(id); return el && !el.hidden; })
      || ['dialog', 'popover', 'uppdrag', 'besked', 'meny'].some(g => surfaces.anyOpen(g))
      || $('app').classList.contains('panel-open') || $('tour-card')?.contains(document.activeElement);
    if (open) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    // En utfälld hög eller bricka fälls ihop först (#1642), sedan lämnas vyn
    if (marks.closeFan()) return;
    leave();
  }, true);

  /** Ett tryck på klotet bredvid knapparna i globens regionvy: solfjädern fälls ihop och markeringen tas bort (main.js). */
  const background = () => globeView.regionMarks.background();

  return { eligible, onGlobe, enter, leave, background, get place() { return place; }, get globeOpen() { return where === 'globe' && globeView.region != null; } };
}
