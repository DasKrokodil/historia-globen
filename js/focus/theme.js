// Fokustypen tema (#398): ett namngivet urval av händelser, valt med en händelselista (data/teman.json).
import { loadThemes, t, isVisibleReview } from '../model.js';
import { ui } from '../i18n.js';
import { formatYearSpan } from '../controllers/facts.js';
import { langs, pointCenter, selectionSpan, warnHuntImpossible } from './util.js';

export function entry(app) {
  const { $, data, panel, layers } = app;
  let list = null; // temana, hämtade första gången menyn öppnas
  // Temat visar bara händelser som syns (draft räknas inte)
  const visible = theme => theme.events.map(i => data.byId[i]).filter(e => e && isVisibleReview(e.review)).sort((a, b) => a.start - b.start);
  /** Temats introduktionskort (#398), med händelserna i tidsordning. Knappen Fakta i fokusraden öppnar det igen. */
  function showCard(f) {
    app.store.setSelected(null);
    panel.showSelection({ label: ui('theme.label'), name: f.theme.name, intro: f.theme.intro, notes: [ui('theme.filters')],
      exit: ui('theme.exit'), summary: ui('theme.events', { count: f.themeEvents.length }), events: f.themeEvents, sources: f.theme.sources });
    app.surfaces.closeAll({ narrow: app.narrow.matches });
    $('app').classList.add('has-detail');
  }
  return {
    type: 'theme',
    selectsBy: 'events',
    empty: { year: 'theme.emptyYear', next: 'theme.emptyYearNext' },
    async load(id) {
      const theme = (await loadThemes()).find(x => x.id === id);
      const evs = theme ? visible(theme) : [];
      // Saknas alla händelser börjar inget tema
      if (!evs.length) return { unavailable: 'theme.unavailable' };
      const { from, to, lastEnd } = selectionSpan(evs);
      return { title: `${t(theme.name)} · ${formatYearSpan(evs[0].start, lastEnd)}`, short: t(theme.name), from, to,
        center: pointCenter(evs), zoom: 1, theme, themeEvents: evs, eventIds: new Set(evs.map(e => e.id)) };
    },
    // Temats vy slås på före urvalet; lagren står kvar när temat slutar, som efter ett krig eller ett rike (#398)
    prepare: f => { if (f.theme.view) layers.applyView(f.theme.view); },
    start(f) {
      showCard(f);
      // En jakt pågår samtidigt med temat (#893). Temat begränsar vad som syns, så säg det när uppdraget inte går att klara
      warnHuntImpossible(app.hunt, f.themeEvents, 'theme.huntImpossible');
    },
    facts: { has: () => true, show: showCard },
    async menuLoad() { list ??= await loadThemes(); },
    // Ett tema visas med antal synliga händelser och spann ("12 händelser · 2200 f.Kr.–1989", #398).
    // Teman är en egen ingång högst upp under Alla (#1113), men fortfarande en del av Sök och följ.
    menu: () => [{ title: 'Teman', note: ui('focus.note.themes'), loading: !list, items: !list ? [] : list.map(th => {
      const evs = visible(th);
      if (!evs.length) return null;
      const to = Math.max(...evs.map(e => e.end));
      return { key: `theme:${th.id}`, label: t(th.name), terms: langs(th.name), sub: `${ui('focus.themeCount', { count: evs.length })} · ${formatYearSpan(evs[0].start, to)}`, from: evs[0].start, to };
    }).filter(Boolean) }],
  };
}
