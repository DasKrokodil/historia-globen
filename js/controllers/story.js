// Krigets och resans berättelse på tidslinjen (#402, del av #389): kapitel, markeringar och slutpunkt
// när man följer ett krig (#244). Stoppens datum (stopDate, #376) ligger i model.js sedan #1473. Rena funktioner:
// de läser bara det de får och ändrar inget tillstånd.
import { t, edtfSpan, isVisibleReview } from '../model.js';
import { markerInfo } from '../layers/events.js';

/**
 * Kapitel och markeringar på tidslinjen när man följer ett krig (#244). Allt kommer ur datan:
 * - Kapitel ur krigets story.chapters (namn, from, to och egna källor), om fältet finns.
 * - Annars neutrala band mellan krigets stora händelser (major eller top), märkta bara med händelsens
 *   namn ("Fram till …", och "Efter …" för det sista), så att inget kapitelnamn hittas på.
 * - En markering per händelse i kriget (större för stora, kryss för osäkert datum, samma regel som
 *   medaljerna på globen, markerInfo) och en slutpunkt där slutkortet visas.
 * timeline = tidslinjen, focus = det man följer (state.focus), end = krigets slut i fokusläget (warEndOf).
 */
export function warStory(war, { timeline, focus, end }) {
  const at = e => timeline.spanOf(e)[0];
  const events = war._battles.filter(e => isVisibleReview(e.review));
  let bands;
  if (war.story?.chapters?.length) {
    bands = war.story.chapters.map(c => {
      // Samma tidsformat som händelserna: år, och datum i edtf för korta krig
      const [a, b] = timeline.focus?.fine && c.edtf ? edtfSpan({ start: c.from, end: c.to, edtf: c.edtf }) : [c.from, c.to];
      // I korta krig slutar spannet vid början av dagen efter, så den sista dagen visas
      const last = timeline.focus?.fine && c.edtf ? b - 0.5 / 365.25 : b;
      return { from: Math.max(a, focus.from), to: Math.min(b, end), label: t(c.title), title: `${t(c.title)} (${timeline.format(a)}–${timeline.format(last)})`, data: true };
    });
  } else {
    const majors = events.filter(e => e.major || e.top).sort((a, b) => at(a) - at(b));
    let from = focus.from;
    bands = [];
    for (const e of majors) {
      if (at(e) > from) bands.push({ from, to: at(e), label: `Fram till ${t(e.title)}`, title: `Fram till ${t(e.title)} (${timeline.format(at(e))})` });
      from = Math.max(from, at(e));
    }
    const last = majors.at(-1);
    if (last && end > from) bands.push({ from, to: end, label: `Efter ${t(last.title)}`, title: `Efter ${t(last.title)} (${timeline.format(at(last))}) till krigets slut` });
  }
  // Händelser på samma ställe (samma år, i korta krig samma dag) blir en markering med alla namn
  const groups = new Map();
  for (const e of events) {
    const k = at(e);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(e);
  }
  const marks = [...groups].map(([k, es]) => {
    const infos = es.map(e => markerInfo(e));
    const label = es.map((e, i) => `${t(e.title)}, ${timeline.format(at(e))}${infos[i].major ? ', stor händelse' : ''}${infos[i].unsure ? ', osäkert datum' : ''}`).join(' · ');
    const until = es.length === 1 ? timeline.spanOf(es[0])[1] : null;
    return { at: k, until: until != null && timeline.focus?.fine ? until : null, major: infos.some(i => i.major), unsure: infos.some(i => i.unsure), label };
  });
  // Slutpunkten: ligger en händelse där (till exempel freden) blir den en del av slutpunkten
  if (war.story) {
    const label = `${war.ongoing ? 'Läget i dag' : 'Slutkort: hur kriget slutade'}, ${timeline.format(end)}`;
    const same = marks.find(m => m.at >= end);
    if (same) Object.assign(same, { end: true, label: `${same.label} · ${label}` });
    else marks.push({ at: end, end: true, label });
  }
  return { bands, marks };
}
