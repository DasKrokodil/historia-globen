// Sökningen i globens innehåll (#570): ett enkelt index över det som redan är publicerat, utan ny data.
// Händelser (titel och plats), riken (rikets namn, delrikenas namn och huvudstäderna) och resor (titel).
// Inga alias hittas på: det som går att hitta är det som står i datan, på valt språk och på svenska.
// Filen har inga importer från webbläsaren och testas i node (tests/search.test.mjs).

/** Gemener utan accenter och skiljetecken, så att "Pompeji", "pompeji" och "Pompéji" blir samma sak. */
export function normalize(text) {
  return String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

// Alla språkversioner av en text ({ sv, en }), så att en svensk sökning hittar även när sidan visas på engelska
const allLangs = v => (v == null ? [] : typeof v === 'string' ? [v] : Object.values(v).filter(x => typeof x === 'string'));

/**
 * Bygger indexet. t(text) väljer text på sidans språk (model.js). visible(review) säger om en uppgift får visas.
 * Varje post: { type: 'event' | 'war' | 'empire' | 'route', id, title, place, start, end, ref, names, places }.
 */
export function buildIndex({ events = [], empireGroups = [], routes = [] }, { t = x => x?.sv ?? x, visible = () => true } = {}) {
  const out = [];
  for (const e of events) {
    if (!visible(e.review)) continue;
    out.push({ type: e.kind === 'war' ? 'war' : 'event', id: e.id, title: t(e.title), place: t(e.place), start: e.start, end: e.end, ref: e,
      names: allLangs(e.title).map(normalize), places: allLangs(e.place).map(normalize) });
  }
  for (const g of empireGroups) {
    const polities = (g.polities ?? []).flatMap(p => allLangs(p.name));
    const capitals = (g.capitals ?? []).flatMap(c => allLangs(c.name));
    out.push({ type: 'empire', id: g.id, title: t(g.name), place: '', start: g.from, end: g.to, ref: g,
      names: [...allLangs(g.name), ...polities].map(normalize), places: capitals.map(normalize) });
  }
  for (const r of routes) {
    if (r.kind !== 'voyage' || !visible(r.review)) continue; // handelsvägar har inget eget fokus än
    out.push({ type: 'route', id: r.id, title: t(r.title), place: '', start: r.start, end: r.end, ref: r,
      names: allLangs(r.title).map(normalize), places: [] });
  }
  return out;
}

// Poäng för ett ord i en text: hela texten börjar med ordet > ett ord börjar med det > ordet finns någonstans
function wordScore(word, texts) {
  let best = 0;
  for (const s of texts) {
    if (s.startsWith(word)) return 3;
    if (s.includes(` ${word}`)) best = Math.max(best, 2);
    else if (s.includes(word)) best = Math.max(best, 1);
  }
  return best;
}

/**
 * Söker i indexet. Alla ord i frågan ska finnas i namnet eller platsen. Namnträffar går före platsträffar, och
 * vid lika poäng kommer krig och riken före enskilda händelser och sedan det äldsta först. Ger högst limit träffar.
 */
export function search(index, query, limit = 30) {
  const words = normalize(query).split(' ').filter(Boolean);
  if (!words.length) return [];
  const TYPE = { war: 0, empire: 1, route: 2, event: 3 };
  const hits = [];
  for (const item of index) {
    let score = 0;
    for (const w of words) {
      const n = wordScore(w, item.names), p = wordScore(w, item.places);
      if (!n && !p) { score = -1; break; }
      score += n ? 10 + n : p;
    }
    if (score > 0) hits.push({ item, score });
  }
  hits.sort((a, b) => b.score - a.score || TYPE[a.item.type] - TYPE[b.item.type] || a.item.start - b.item.start);
  return hits.slice(0, limit).map(h => h.item);
}
