// Turformatet (#47, Rikards beslut 2026-11-01): en guidad tur är en datafil i data/turer/<id>.json.
// Den här filen kontrollerar en tur utan att röra sidan, så att samma regler gäller i webbläsaren
// (js/ui/tour.js) och i testerna (tests/tour.test.mjs). Inga importer: filen ska gå att läsa i node.
//
// En tur:  { schema, version, id, title, summary?, war?, review, steps: [steg, ...] }
//   war     valfritt: kriget (händelse-id) som turen berättar om; krigets första kort får då "Följ berättelsen" (#247)
//   empire  valfritt: riket (grupp-id i data/empires/index.json) vars fall turen följer; rikets faktaruta får då en knapp (#499)
// Ett steg: { id, at, camera: { lat, lon, zoom }, title?, chapter?, question?, text, layers: [lager-id], open?, sources: [käll-id] }
//   chapter valfritt kapitelnamn per språk, visas ovanför rubriken (berättelseläget, #247)
//   question valfri fråga att fundera på, per språk; den påstår inget som stegets källor inte säger
//   status  valfritt: vad källorna säger om steget, samma ord som slutkortet (#500): belagt, omtvistat eller okant (#499)
//   at      år med astronomisk årsräkning; decimaltal är tillåtet (delar av år, #204), men utanför
//           fokusläget för korta krig visar tidslinjen hela år
//   camera  globens kameraläge; zoom som globen (0.8–3.2). Platt vy använder samma mitt.
//   layers  lagren som är på i steget (id i lagerregistret); de andra lagren som vyerna styr slås av
//   open    valfri händelse vars faktaruta öppnas
//   sources källorna för stegets text (id i data/sources.json)

export const TOUR_VERSION = 1;
export const TOUR_REVIEW = ['draft', 'source-checked', 'two-sources'];
export const STEP_STATUS = ['belagt', 'omtvistat', 'okant'];
const ID = /^[a-z0-9-]+$/;

const isText = v => !!v && typeof v === 'object' && !Array.isArray(v) && typeof v.sv === 'string' && v.sv.trim() !== '';
const isNum = v => typeof v === 'number' && Number.isFinite(v);

/**
 * Kontrollerar en tur. Returnerar en lista med problem på svenska (tom när turen är hel).
 * known = { events, layers, sources }: mängder (Set) med kända id. En mängd som saknas kontrolleras inte,
 * till exempel källorna i webbläsaren, där källregistret inte alltid är laddat.
 */
export function tourProblems(tour, known = {}) {
  const out = [];
  if (!tour || typeof tour !== 'object' || Array.isArray(tour)) return ['Turen är inte ett objekt.'];
  const name = typeof tour.id === 'string' ? tour.id : '?';
  const say = msg => out.push(`Turen ${name}: ${msg}`);
  if (tour.version !== TOUR_VERSION) say(`okänd version ${tour.version}.`);
  if (typeof tour.id !== 'string' || !ID.test(tour.id)) say('id saknas eller har fel tecken.');
  if (!isText(tour.title)) say('titeln saknas (title.sv).');
  if (!TOUR_REVIEW.includes(tour.review)) say(`okänd granskningsstatus ${tour.review}.`);
  if (tour.war != null && (typeof tour.war !== 'string' || (known.events && !known.events.has(tour.war)))) say(`kriget ${tour.war} finns inte.`);
  if (tour.empire != null && (typeof tour.empire !== 'string' || (known.empires && !known.empires.has(tour.empire)))) say(`riket ${tour.empire} finns inte.`);
  if (!Array.isArray(tour.steps) || !tour.steps.length) { say('har inga steg.'); return out; }
  const ids = new Set();
  tour.steps.forEach((s, i) => {
    const where = `steg ${i + 1}${s?.id ? ` (${s.id})` : ''}`;
    if (!s || typeof s !== 'object') { say(`${where} är inte ett objekt.`); return; }
    if (typeof s.id !== 'string' || !ID.test(s.id)) say(`${where}: id saknas eller har fel tecken.`);
    else if (ids.has(s.id)) say(`${where}: id finns redan i turen.`);
    ids.add(s.id);
    if (!isNum(s.at)) say(`${where}: året (at) ska vara ett tal.`);
    const c = s.camera;
    if (!c || !isNum(c.lat) || !isNum(c.lon) || !isNum(c.zoom)) say(`${where}: kameran ska ha lat, lon och zoom som tal.`);
    else if (Math.abs(c.lat) > 90 || Math.abs(c.lon) > 180 || c.zoom < 0.8 || c.zoom > 3.2) say(`${where}: kameran ligger utanför jorden eller zoomen (0.8–3.2).`);
    if (!isText(s.text)) say(`${where}: texten saknas (text.sv).`);
    if (s.title != null && !isText(s.title)) say(`${where}: titeln ska vara text per språk.`);
    if (s.chapter != null && !isText(s.chapter)) say(`${where}: kapitlet ska vara text per språk.`);
    if (s.question != null && !isText(s.question)) say(`${where}: frågan ska vara text per språk.`);
    if (s.status != null && !STEP_STATUS.includes(s.status)) say(`${where}: okänd status ${s.status}.`);
    if (!Array.isArray(s.layers)) say(`${where}: layers ska vara en lista med lager-id.`);
    else for (const l of s.layers) if (known.layers && !known.layers.has(l)) say(`${where}: lagret ${l} finns inte.`);
    if (s.open != null && (typeof s.open !== 'string' || (known.events && !known.events.has(s.open)))) say(`${where}: händelsen ${s.open} finns inte.`);
    if (!Array.isArray(s.sources) || !s.sources.length) say(`${where}: källor saknas (sources).`);
    else for (const id of s.sources) if (known.sources && !known.sources.has(id)) say(`${where}: källan ${id} finns inte.`);
  });
  return out;
}
