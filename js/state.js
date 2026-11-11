// Det gemensamma tillståndet (#338): det som lagren läser när de väljer vad som syns.
// main.js fyller i det vid varje omritning (refresh) och skickar det till lagrens update(state).
// Ett år styr allt (CLAUDE.md punkt 3): year kommer från tidslinjen, och i fokusläget för korta krig är det ett
// decimaltal med månader och dagar (fine, #204). Resten är val som besökaren har gjort (lager, kategorier, fokus).
//
// Det mesta av tillståndet går att spara, till exempel i en delbar länk (#64): snapshot() plockar ut de delarna
// som vanliga värden. Det som räknas ut vid varje omritning (window, span, labels m.m.) behöver inte sparas.

/** Ett nytt, tomt tillstånd. Fälten fylls i av main.js och controllerna, helst via createStore (#403). */
export function createState() {
  return {
    // Tiden
    year: 0,          // tidslinjens år, decimaltal i fokusläget för korta krig (#204)
    wholeYear: 0,     // hela året, som riken, religioner och fun facts använder
    areaYear: 0,      // året som riken och religioner ritas för: wholeYear, men i ett tidsintervall slutåret (#756)
    fine: false,      // fokusläget för ett kort krig: tiden räknas i dagar (#204)
    window: 0,        // hur många år runt året som räknas som "samtidigt" (tidslinjens fönster)
    // Tidsintervallet (#569, #755): { from, to } eller null. from är året (year), to är slutåret. Läget 'intervall' i
    // lägeskontraktet (MODE_RULES nedan); det utesluter Fokus och uppspelning.
    range: null,
    span: e => [e.start, e.end], // en händelses tid som [början, slut], i fokusläget för korta krig datum ur edtf
    playing: false,   // spelade tidslinjen när omritningen började

    // Fokusläget (#109, #113, #376): { type: 'war' | 'empire' | 'religion' | 'route', id, from, to, fine, ... } eller null
    focus: null,
    focusWar: null,   // kriget man följer (händelsen), eller null
    focusRoute: null, // resan man följer, eller null

    // Besökarens val
    layers: {},       // valen i Lager: { events: true, areas: true, religions: false, ... } (LayerMenu.on)
    on: {},           // lager som faktiskt visas: valda, eller det man följer i fokusläget (räknas av registret)
    pause: {},        // vad uppspelningen pausar vid (LayerMenu.pause)
    calm: false,      // Lugn rörelse (#246)
    filters: new Set(), // kategorierna som syns (Panel.filters)
    tag: null,        // vyn visar bara händelser med den här taggen, till exempel 'framsteg' (#555), eller null

    // Det som är valt eller markerat
    selectedId: null, // händelsen i faktarutan
    highlight: new Set(), // händelserna i det öppna Samtidigt-kortet

    // Namn och symboler på lagerbilden (#154, #271, #301): storlek och om namnen syns, efter zoom och vy
    labels: { scale: 1, alpha: 1, religionNames: false, empireNames: true },

    // Lager som dämpas i fokusläget (#235), räknas av registret
    faded: new Set(),

    // Lägena som pågår ovanpå Utforska (#893), i den ordning de började: [{ mode, snapshot }]. Ändras bara med
    // store.enter och store.leave; reglerna står i MODE_RULES nedan.
    modes: [],
  };
}

/**
 * De delar av tillståndet som besökaren har valt, som vanliga värden (för delbara länkar, #64).
 * { year, focus: 'war:<id>' | null, layers: [...], filters: [...], tag, calm }
 */
export function snapshot(state) {
  return {
    year: state.year,
    focus: state.focus ? `${state.focus.type}:${state.focus.id}` : null,
    layers: Object.keys(state.layers).filter(k => state.layers[k]),
    filters: [...state.filters],
    calm: !!state.calm,
  };
}

// ---------------------------------------------------------------------------------------------------------
// Åtgärder, prenumeration och JSON (#403, del av #389)
//
// Tidslinjen äger året (CLAUDE.md punkt 3, Rikards val 2026-11-05 i #403): året ändras som förut via
// Timeline, och omritningen speglar det in i tillståndet med mirror(). Övriga val ändras med åtgärderna
// nedan, och den som vill veta om en ändring prenumererar. Adressen (delbara länkar, #64/#501) står i js/url-state.js.

/** Versionen av JSON-formatet. Höjs om fälten ändras på ett sätt som gamla länkar inte klarar. */
export const STATE_VERSION = 1;
const FOCUS_TYPES = ['war', 'empire', 'religion', 'route', 'theme', 'place']; // theme (#398) och place (#579): ett tema och en plats är fokus, inget eget läge

// ---------------------------------------------------------------------------------------------------------
// Lägeskontraktet (#893, beslut docs/beslut/2026-11-08-lagen.md)
//
// Besökaren är alltid i Utforska, och ovanpå det i noll eller flera lägen: Fokus, Tur, Lektion, Jakt och Intervall
// (tidsintervallet, #755, js/controllers/range.js). Varje läge börjar med store.enter(läge, ögonblicksbild) och slutar med store.leave([...lägen]).
// Tabellen MODE_RULES nedan säger vad som händer när ett läge börjar medan ett annat pågår, och vad en utgång
// får återställa. Samma tabell står i docs/arkitektur.md och prövas i tests/state.test.mjs.
//
// Tre regler:
// 1. Ett läge som börjar avslutar eller stoppas av de lägen som tabellen säger; resten pågår samtidigt.
// 2. En utgång återställer bara ur ögonblicksbilder från de lägen som själva slutar (aldrig ur ett annat läge), och
//    bara de fält som alla lägen som slutar tillåter. Det läge som avslutade dem tar över sina egna fält.
// 3. Den som laddar något innan ett läge börjar (till exempel ett rike i Fokus) tar en biljett (ticket) och får bara
//    börja läget om biljetten fortfarande gäller (current): ingen nyare begäran om samma läge och inget läge som
//    krockar har börjat under tiden.

/** Lägena utöver Utforska, som alltid ligger underst. */
export const MODES = ['fokus', 'tur', 'lektion', 'jakt', 'intervall'];

/**
 * Lägenas regler.
 * - when[annat läge]: vad som händer när läget börjar medan det andra pågår:
 *   'avslutar' (det andra slutar först), 'stoppas' (läget börjar inte), 'samtidigt' (båda pågår) eller
 *   'villkor' (beror på år eller tur och kontrolleras i lägets egen modul; förklaringen står i docs/arkitektur.md).
 * - restore: vad en utgång återställer ur ögonblicksbilden från när läget började. Året står alltid kvar.
 * - takes: vad läget tar över när det avslutar ett annat läge; de fälten återställs då inte.
 */
export const MODE_RULES = {
  fokus: {
    when: { tur: 'avslutar', lektion: 'stoppas', jakt: 'samtidigt', intervall: 'avslutar' },
    restore: [], takes: ['focus', 'camera'],
  },
  tur: {
    when: { fokus: 'avslutar', lektion: 'samtidigt', jakt: 'samtidigt', intervall: 'avslutar' },
    restore: ['layers', 'focus', 'camera'], takes: ['layers', 'focus', 'camera'],
  },
  lektion: {
    // Lektionen börjar före sin tur (js/ui/lesson.js); en jakt utanför lektionens år avslutas
    when: { fokus: 'avslutar', tur: 'samtidigt', jakt: 'villkor', intervall: 'avslutar' },
    restore: ['layers', 'camera'], takes: ['layers', 'focus', 'camera'], // aldrig fokus: utgången behåller lektionens år (#881)
  },
  jakt: {
    // I en lektion bara uppdrag inom lektionens år (#741, #795)
    when: { fokus: 'samtidigt', tur: 'samtidigt', lektion: 'villkor', intervall: 'avslutar' },
    restore: [], takes: [],
  },
  intervall: {
    // Uppspelning och dragning i tidslinjen stänger också intervallet (js/controllers/range.js); de är inga lägen
    when: { fokus: 'avslutar', tur: 'stoppas', lektion: 'stoppas', jakt: 'stoppas' },
    restore: [], takes: ['focus'],
  },
};

/** Vad som händer när läget mode börjar medan other pågår ('samtidigt' när tabellen inte säger något). */
export function modeRelation(mode, other) {
  return MODE_RULES[mode]?.when?.[other] ?? 'samtidigt';
}

/**
 * Vad en utgång återställer (regel 2). active: de pågående lägena [{ mode, snapshot }] i den ordning de började;
 * leaving: lägena som slutar nu; takenBy: läget som avslutade dem, eller null när besökaren själv lämnade.
 * Ger ett objekt med de fält ur ögonblicksbilden som ska återställas (tomt när inget ska det).
 */
export function exitRestore(active, leaving, takenBy = null) {
  const going = active.filter(x => leaving.includes(x.mode) && x.snapshot);
  const outer = going[0]; // det läge som började först har bilden från före alla de andra
  if (!outer) return {};
  const taken = new Set(takenBy ? MODE_RULES[takenBy]?.takes ?? [] : []);
  // Det strängaste läget bestämmer: ett fält återställs bara när alla lägen som slutar (och har en bild) tillåter det
  const fields = (MODE_RULES[outer.mode]?.restore ?? [])
    .filter(f => going.every(x => (MODE_RULES[x.mode]?.restore ?? []).includes(f)) && !taken.has(f));
  return Object.fromEntries(fields.filter(f => outer.snapshot[f] !== undefined).map(f => [f, outer.snapshot[f]]));
}

/**
 * Ett lager med tillståndet och dess åtgärder. Varje åtgärd ändrar state och meddelar prenumeranterna
 * med { type, state }, där type är 'year', 'focus', 'selected', 'layers', 'filters', 'tag', 'calm', 'range' eller 'mode'.
 */
export function createStore(state = createState()) {
  const subscribers = new Set();
  const notify = type => { for (const fn of [...subscribers]) fn({ type, state }); };
  // Lägeskontraktet (#893): hur varje läge avslutas i gränssnittet, och räknare för biljetterna (regel 3)
  const exits = {};
  let epoch = 0;
  const seq = {}, enteredAt = {};
  const isActive = mode => state.modes.some(x => x.mode === mode);
  const bump = mode => { seq[mode] = (seq[mode] ?? 0) + 1; };
  return {
    state,
    /** Det översta läget som pågår, eller 'utforska'. */
    get mode() { return state.modes.at(-1)?.mode ?? 'utforska'; },
    /** Pågår läget? */
    active: isActive,
    /** fn(takenBy) avslutar läget i gränssnittet när ett annat läge som avslutar det börjar (MODE_RULES). */
    onExit(mode, fn) { exits[mode] = fn; },
    /** Får läget börja nu? Nej när ett läge som pågår stoppar det. */
    canEnter(mode) { return !state.modes.some(x => x.mode !== mode && modeRelation(mode, x.mode) === 'stoppas'); },
    /**
     * Läget börjar. snapshot är ögonblicksbilden från före läget (år, lager, fokus, kamera, kategorier), eller null.
     * Lägen som det avslutar slutar först, genom sina onExit. Pågår läget redan behålls den första bilden (till
     * exempel Bakåt och Framåt i samma tur). Ger false när ett annat läge stoppar det.
     */
    enter(mode, snapshot = null) {
      if (!this.canEnter(mode)) return false;
      for (const x of [...state.modes]) {
        if (x.mode === mode || modeRelation(mode, x.mode) !== 'avslutar') continue;
        exits[x.mode]?.(mode);
        if (isActive(x.mode)) this.leave([x.mode], mode); // om gränssnittet inte lämnade läget själv
      }
      epoch++; enteredAt[mode] = epoch; bump(mode);
      if (!isActive(mode)) state.modes.push({ mode, snapshot: snapshot ?? null });
      notify('mode');
      return true;
    },
    /**
     * Lägena slutar (de som inte pågår hoppas över). takenBy: läget som avslutade dem, eller null när besökaren
     * själv lämnade. Ger det som ska återställas ur ögonblicksbilden (exitRestore, regel 2).
     */
    leave(modes, takenBy = null) {
      const list = [].concat(modes);
      for (const m of list) bump(m); // en utgång är också en nyare begäran: en biljett från före den gäller inte
      if (!list.some(isActive)) return {};
      const restore = exitRestore(state.modes, list, takenBy);
      state.modes = state.modes.filter(x => !list.includes(x.mode));
      epoch++;
      notify('mode');
      return restore;
    },
    /** En biljett för att börja läget när det som behövs har laddats (regel 3). */
    ticket(mode) { bump(mode); return { mode, seq: seq[mode], epoch }; },
    /** Gäller biljetten? Nej när läget har begärts, börjat eller slutat igen, eller ett läge som krockar har börjat. */
    current(ticket) {
      if (seq[ticket.mode] !== ticket.seq) return false;
      return !MODES.some(m => m !== ticket.mode && modeRelation(ticket.mode, m) !== 'samtidigt' && (enteredAt[m] ?? 0) > ticket.epoch);
    },
    /** fn({ type, state }) anropas efter varje ändring. Returnerar en funktion som avslutar prenumerationen. */
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    /** Omritningens beräknade värden (år, fönster m.m.). Meddelar 'year' bara när året faktiskt ändrades. */
    mirror(values) {
      const before = state.year;
      Object.assign(state, values);
      if ('year' in values && values.year !== before) notify('year');
    },
    /** Det man följer i fokusläget: focus (eller null), och kriget eller resan när det är sådant fokus. */
    setFocus(focus, { war = null, route = null } = {}) {
      state.focus = focus ?? null;
      state.focusWar = focus ? war : null;
      state.focusRoute = focus ? route : null;
      notify('focus');
    },
    setSelected(id) {
      state.selectedId = id ?? null;
      notify('selected');
    },
    /** Valen i Lager, som { lager-id: true/false } (LayerMenu.on). */
    setLayers(on) {
      state.layers = on;
      notify('layers');
    },
    /** Kategorierna som syns. */
    setFilters(filters) {
      state.filters = filters;
      notify('filters');
    },
    /** Taggen som vyn visar (#555), till exempel 'framsteg', eller null för alla händelser. */
    setTag(tag) {
      state.tag = tag ?? null;
      notify('tag');
    },
    setCalm(on) {
      state.calm = !!on;
      notify('calm');
    },
    /** Tidsintervallet (#755): { from, to } med from < to, eller null för ett enskilt år. */
    setRange(range) {
      state.range = range ? { from: Math.min(range.from, range.to), to: Math.max(range.from, range.to), ...(typeof range.period === 'string' && range.period ? { period: range.period } : {}) } : null;
      notify('range');
    },
  };
}

/**
 * Tillståndet som JSON-vänligt objekt: år, kamera, fokus, lager, kategorier och Lugn rörelse, och slutåret
 * (yearEnd) när ett tidsintervall är valt (#755). camera = { lat, lon, zoom } från globen (Globe.view), eller null.
 * yearEnd är ett valfritt tillägg: utan det är tillståndet ett år som förut, så STATE_VERSION är oförändrad.
 */
export function toJSON(state, camera = null) {
  const round = (x, n) => Math.round(x * 10 ** n) / 10 ** n;
  return {
    v: STATE_VERSION,
    year: round(state.year, 4),
    camera: camera ? { lat: round(camera.lat, 2), lon: round(camera.lon, 2), zoom: round(camera.zoom, 2) } : null,
    focus: state.focus ? `${state.focus.type}:${state.focus.id}` : null,
    layers: Object.keys(state.layers).filter(k => state.layers[k]).sort(),
    filters: [...state.filters].sort(),
    tag: state.tag ?? null,
    calm: !!state.calm,
    ...(state.range ? { yearEnd: Math.round(state.range.to), ...(state.range.period ? { period: state.range.period } : {}) } : {}),
  };
}

/**
 * Läser tillståndet ur JSON (en sträng eller ett objekt från toJSON). Kontrollerar typerna, rättar
 * kameran inom jordens gränser och hoppar över okända fält. Ett fel kastas med en förklaring på svenska;
 * då ska den som anropar behålla det vanliga startläget.
 */
export function fromJSON(value) {
  const doc = typeof value === 'string' ? JSON.parse(value) : value;
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) throw new Error('Tillståndet är inte ett objekt.');
  if (doc.v !== STATE_VERSION) throw new Error(`Okänd version av tillståndet: ${doc.v}.`);
  if (typeof doc.year !== 'number' || !Number.isFinite(doc.year)) throw new Error('Året saknas eller är inte ett tal.');
  const words = (list, what) => {
    if (list == null) return [];
    if (!Array.isArray(list) || list.some(x => typeof x !== 'string' || !/^[a-z0-9-]+$/.test(x))) throw new Error(`${what} ska vara en lista med id.`);
    return [...new Set(list)].sort();
  };
  let focus = null;
  if (doc.focus != null) {
    const m = typeof doc.focus === 'string' && doc.focus.match(/^([a-z]+):([A-Za-z0-9_-]+)$/);
    if (!m || !FOCUS_TYPES.includes(m[1])) throw new Error(`Okänt fokus: ${doc.focus}.`);
    focus = `${m[1]}:${m[2]}`;
  }
  let camera = null;
  if (doc.camera != null) {
    const { lat, lon, zoom } = doc.camera;
    if (![lat, lon, zoom].every(x => typeof x === 'number' && Number.isFinite(x))) throw new Error('Kameran ska ha lat, lon och zoom som tal.');
    const clean = x => Number(x.toFixed(6)); // utan flyttalsbrus från omräkningen
    camera = { lat: clean(Math.max(-90, Math.min(90, lat))), lon: clean(((((lon + 180) % 360) + 360) % 360) - 180), zoom: clean(Math.max(0.8, Math.min(3.2, zoom))) };
  }
  // Slutåret (#755) är valfritt: saknas det, är det inget tal eller inte efter året, öppnas tillståndet som ett år
  const yearEnd = typeof doc.yearEnd === 'number' && Number.isFinite(doc.yearEnd) && Math.round(doc.yearEnd) > doc.year ? Math.round(doc.yearEnd) : null;
  const tag = typeof doc.tag === 'string' && /^[a-z0-9-]+$/.test(doc.tag) ? doc.tag : null;
  return { v: STATE_VERSION, year: doc.year, camera, focus, layers: words(doc.layers, 'Lagren'), filters: words(doc.filters, 'Kategorierna'), tag, calm: !!doc.calm,
    ...(yearEnd != null ? { yearEnd } : {}),
    // Epokens id (#980) hör till intervallet och är bara en etikett; visningen kontrollerar att åren stämmer
    ...(yearEnd != null && typeof doc.period === 'string' && /^[a-z0-9-]+$/.test(doc.period) ? { period: doc.period } : {}) };
}
