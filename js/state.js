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
    fine: false,      // fokusläget för ett kort krig: tiden räknas i dagar (#204)
    window: 0,        // hur många år runt året som räknas som "samtidigt" (tidslinjens fönster)
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

    // Det som är valt eller markerat
    selectedId: null, // händelsen i faktarutan
    highlight: new Set(), // händelserna i det öppna Samtidigt-kortet

    // Namn och symboler på lagerbilden (#154, #271, #301): storlek och om namnen syns, efter zoom och vy
    labels: { scale: 1, alpha: 1, religionNames: false, empireNames: true },

    // Lager som dämpas i fokusläget (#235), räknas av registret
    faded: new Set(),
  };
}

/**
 * De delar av tillståndet som besökaren har valt, som vanliga värden (för delbara länkar, #64).
 * { year, focus: 'war:<id>' | null, layers: [...], filters: [...], calm }
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
const FOCUS_TYPES = ['war', 'empire', 'religion', 'route'];

/**
 * Ett lager med tillståndet och dess åtgärder. Varje åtgärd ändrar state och meddelar prenumeranterna
 * med { type, state }, där type är 'year', 'focus', 'selected', 'layers', 'filters' eller 'calm'.
 */
export function createStore(state = createState()) {
  const subscribers = new Set();
  const notify = type => { for (const fn of [...subscribers]) fn({ type, state }); };
  return {
    state,
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
    setCalm(on) {
      state.calm = !!on;
      notify('calm');
    },
  };
}

/**
 * Tillståndet som JSON-vänligt objekt: år, kamera, fokus, lager, kategorier och Lugn rörelse.
 * camera = { lat, lon, zoom } från globen (Globe.view), eller null.
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
    calm: !!state.calm,
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
  return { v: STATE_VERSION, year: doc.year, camera, focus, layers: words(doc.layers, 'Lagren'), filters: words(doc.filters, 'Kategorierna'), calm: !!doc.calm };
}
