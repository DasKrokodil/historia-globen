// Kopierbara hänvisningar använder händelsens redan registrerade källor (#844).
import { formatEventTime, t } from '../model.js';
import { LANG, ui } from '../i18n.js';

const WEBSITE = 'https://historiagloben.se';
const openedDate = date => new Intl.DateTimeFormat(LANG, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
const sourceText = (sources, links = false) => sources.map(source => links ? source.url : `${source.title} (${source.url})`).join('; ') || ui('detail.sourceMissing');

export function eventCitation(event, sources, opened = new Date()) {
  return ui('citation.event', { title: t(event.title), year: formatEventTime(event), sources: sourceText(sources), website: WEBSITE, date: openedDate(opened) });
}

export function posterCitation(events, srcById, opened = new Date()) {
  const ids = [...new Set(events.flatMap(event => event.sources ?? []))];
  return ui('citation.poster', { sources: sourceText(ids.map(id => srcById[id]).filter(Boolean), true), website: WEBSITE, date: openedDate(opened) });
}
