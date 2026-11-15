// Fokustypen religion (#123, #90, #138): börjar vid grundandet där det går att belägga, och visar sedan
// religionens spridning som statsreligion.
import { loadReligions, t, symbolUrl, formatEventTime } from '../model.js';
import { ui } from '../i18n.js';
import { formatYearSpan } from '../controllers/facts.js';
import { langs, geoCenter } from './util.js';

/** Händelser där en religion grundades (founding: true), i tidsordning. */
export const founding = (events, id) => events.filter(e => e.founding && e.religion === id).sort((a, b) => a.start - b.start);
// Ärvda områden (#269) räknas inte: spannet är där en faktaruta anger religionen
const stated = r => r.snapshots.filter(s => !s.inherited);
// Religionens årtal i Fokus: grundandet där det går att belägga, annars bara kartdatans spann (#138)
const religionSpan = (r, first) => {
  const st = stated(r);
  const map = ui('focus.stateReligion', { span: formatYearSpan(st[0].start, st.at(-1).end) });
  return first ? `${ui('focus.founded', { time: formatEventTime(first) })} · ${map}` : map;
};

export function entry(app) {
  const { data } = app;
  const first = id => founding(data.events, id)[0];
  return {
    type: 'religion',
    selectsBy: null,
    async load(id) {
      const doc = await loadReligions();
      data.religionsDoc ??= doc;
      app.setReligions(doc);
      const r = doc.religions.find(x => x.id === id);
      if (!r) return null;
      // Fokus börjar när religionen grundades, om det finns en sådan händelse (#123)
      const f = first(id), st = stated(r);
      const from = Math.min(f?.start ?? Infinity, st[0].start), to = Math.max(st.at(-1).end, f?.end ?? -Infinity);
      return { title: `${t(r.name)} · ${religionSpan(r, f)}`, short: t(r.name), from, to,
        center: f ? [f._lat, f._lon] : geoCenter([st[0].geometry]), zoom: 1.3 };
    },
    // Religionens faktaruta visas först (#90), annars grundandet i faktarutan
    start(f) {
      const event = first(f.id);
      if (!app.showReligionFacts(f.id, false) && event) app.select(event.id, false);
    },
    facts: { has: f => !!data.religionsDoc?.religions.find(x => x.id === f.id)?.facts, show: f => app.showReligionFacts(f.id, false) },
    // Religionerna laddas en gång och sparas, så att de finns kvar nästa gång menyn öppnas, också när lagret
    // Religioner aldrig har öppnats (annars blev fliken tom andra gången)
    async menuLoad() { data.religionsDoc ??= await loadReligions(); },
    menu() {
      const doc = data.religionsDoc;
      return [{ title: 'Religioner', note: ui('focus.note.religions'), loading: !doc, items: !doc ? [] : doc.religions.map(r => {
        const f = first(r.id), st = stated(r);
        const from = Math.min(f?.start ?? Infinity, st[0].start), to = st.at(-1).end;
        return { key: `religion:${r.id}`, label: t(r.name), terms: langs(r.name), sub: religionSpan(r, f), color: r.color, symbol: symbolUrl(r), from, to };
      }) }];
    },
  };
}
