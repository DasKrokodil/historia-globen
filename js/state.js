// Det gemensamma tillståndet (#338): det som lagren läser när de väljer vad som syns.
// main.js fyller i det vid varje omritning (refresh) och skickar det till lagrens update(state).
// Ett år styr allt (CLAUDE.md punkt 3): year kommer från tidslinjen, och i fokusläget för korta krig är det ett
// decimaltal med månader och dagar (fine, #204). Resten är val som besökaren har gjort (lager, kategorier, fokus).
//
// Det mesta av tillståndet går att spara, till exempel i en delbar länk (#64): snapshot() plockar ut de delarna
// som vanliga värden. Det som räknas ut vid varje omritning (window, span, labels m.m.) behöver inte sparas.

/** Ett nytt, tomt tillstånd. Fälten fylls i av main.js. */
export function createState() {
  return {
    // Tiden
    year: 0,          // tidslinjens år, decimaltal i fokusläget för korta krig (#204)
    wholeYear: 0,     // hela året, som riken, religioner och fun facts använder
    fine: false,      // fokusläget för ett kort krig: tiden räknas i dagar (#204)
    window: 0,        // hur många år runt året som räknas som "samtidigt" (tidslinjens fönster)
    span: e => [e.start, e.end], // en händelses tid som [början, slut], i fokusläget för korta krig datum ur edtf
    playing: false,   // spelade tidslinjen när omritningen började

    // Fokusläget (#109, #113): { type: 'war' | 'empire' | 'religion', id, from, to, fine, ... } eller null
    focus: null,
    focusWar: null,   // kriget man följer (händelsen), eller null

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
