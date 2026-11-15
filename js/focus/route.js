// Fokustypen resa (#376): en voyage följs ensam i linjelagret, dag för dag när hela resans spann har dagdatum.
import { loadRoutes, CAT, t, formatEventTime, isVisibleReview, edtfSpan, edtfHasDays } from '../model.js';
import { ui } from '../i18n.js';
import { langs } from './util.js';

export function entry() {
  let list = null; // resorna, hämtade första gången menyn öppnas
  return {
    type: 'route',
    selectsBy: null,
    async load(id) {
      const route = (await loadRoutes()).find(r => r.id === id && r.kind === 'voyage');
      if (!route) return null;
      // Dagar används bara när själva resans spann har dagprecision. Zheng Hes första resa
      // har medvetet bara år/månad utom vid hemkomsten (#376).
      const fine = edtfHasDays(route.edtf);
      const [from, to] = fine ? edtfSpan(route) : [route.start, route.end];
      const first = route.legs?.[0]?.path?.[0] ?? [0, 0];
      return { title: `${t(route.title)} · ${formatEventTime(route)}`, short: t(route.title), from, to, fine,
        center: [first[1], first[0]], zoom: 1.5, route };
    },
    follows: f => ({ route: f.route }),
    async menuLoad() { list ??= await loadRoutes(); },
    menu: () => [{ title: 'Resor', note: ui('focus.note.routes'), loading: !list,
      items: !list ? [] : list.filter(r => r.kind === 'voyage' && isVisibleReview(r.review)).map(r =>
        ({ key: `route:${r.id}`, label: t(r.title), terms: langs(r.title), sub: formatEventTime(r), color: CAT[r.category]?.color, from: r.start, to: r.end })) }],
  };
}
