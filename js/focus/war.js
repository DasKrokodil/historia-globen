// Fokustypen krig (#109, #204, #223): kriget och dess slag följs från början till slut, korta krig dag för dag.
import { loadEventDetails, CAT, t, formatEventTime, edtfSpan, edtfHasDays } from '../model.js';
import { MAX_YEAR } from '../state.js';
import { langs } from './util.js';

// Krig som ryms inom så här många år, med datum i edtf, följs dag för dag i fokusläget (#204)
const SHORT_WAR_YEARS = 2;

export function entry(app) {
  const { $, data, panel } = app;
  return {
    type: 'war',
    selectsBy: null,
    movedKey: 'focus.movedWar',
    exists: id => data.byId[id]?.kind === 'war',
    async load(id) {
      const war = data.byId[id];
      if (war?.kind !== 'war') return null;
      const pts = [war, ...war._battles];
      // Krigets berättelse och slagens texter ligger i händelsernas långa fält (#337)
      await loadEventDetails(pts);
      // Ett kort krig följs från dess första till sista dag, och året blir ett decimaltal (#204)
      const fine = war.end - war.start <= SHORT_WAR_YEARS && edtfHasDays(war.edtf);
      const [from, to] = fine ? edtfSpan(war) : [war.start, Math.min(war.end, MAX_YEAR)]; // pågående krig slutar i dag (#223)
      return { title: `${t(war.title)} ${formatEventTime(war)}`, short: t(war.title), from, to, fine,
        center: [pts.reduce((s, e) => s + e._lat, 0) / pts.length, pts.reduce((s, e) => s + e._lon, 0) / pts.length], zoom: 2.2 };
    },
    follows: f => ({ war: data.byId[f.id] }),
    // Före start: varför kriget började och vilka som stred (#122)
    start(f) {
      const war = data.byId[f.id];
      if (!war.story) return;
      app.store.setSelected(war.id);
      panel.showStory(war, 'intro');
      $('app').classList.add('has-detail');
    },
    menu: () => [{ title: 'Krig', items: data.events.filter(e => e.kind === 'war').map(e =>
      ({ key: `war:${e.id}`, label: t(e.title), terms: langs(e.title), sub: formatEventTime(e), color: CAT[e.category]?.color, from: e.start, to: e.end })) }],
  };
}
