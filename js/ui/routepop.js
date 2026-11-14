// Klickrutan för vägar och resor (#38): en liten ruta i samma stil som religionernas klickruta, med vägens
// namn, tid, sammanfattning, källor och "Läs mer" till den kopplade händelsen (fältet event).
import { CAT, MONTHS_SHORT, t, formatYear, formatEventTime, reviewLabel, needDetails } from '../model.js';
import { ui } from '../i18n.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const KIND = { voyage: 'Resa', trade: 'Handelsväg' };

/** Långa sammanfattningar delas i korta stycken om högst två meningar, så att texten inte blir en vägg (#1571). Texten ändras inte. */
function paragraphs(text) {
  if (text.length < 260) return [text];
  const sentences = text.split(/(?<=[.!?])\s+(?=\p{Lu})/u);
  const out = [];
  for (let i = 0; i < sentences.length; i += 2) out.push(sentences.slice(i, i + 2).join(' '));
  return out;
}

/** En del av en EDTF-sträng som text: "3 aug 1492", "aug 1492" eller "1492". */
function edtfText(s) {
  const m = /^(-?\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(s.replace(/[~?%]/g, ''));
  if (!m) return null;
  const y = formatYear(Number(m[1]));
  return [m[3] && Number(m[3]), m[2] && MONTHS_SHORT[Number(m[2]) - 1], y].filter(Boolean).join(' ');
}
/** Etappens tid ur edtf, annars ur from och to (hela år). */
function legTime(leg) {
  const parts = (leg.edtf ?? '').split('/').map(edtfText);
  const approx = (leg.edtf ?? '').includes('~') ? 'cirka ' : '';
  if (leg.edtf && parts.every(Boolean)) return approx + parts.join('–');
  const a = Math.floor(leg.from), b = Math.floor(leg.to);
  return a === b ? formatYear(a) : `${formatYear(a)}–${formatYear(b)}`;
}

export class RoutePop {
  constructor(pop, { srcById, byId }) {
    Object.assign(this, { pop, srcById, byId });
    this.route = null;
    this.onEvent = () => {};
    this.onReport = null;
    pop.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) this.hide();
      const ev = e.target.closest('[data-event]');
      if (ev) { this.hide(); this.onEvent(ev.dataset.event); }
      const report = e.target.closest('[data-report]');
      if (report) this.onReport?.({ type: 'route', id: report.dataset.report, label: t(this.route.title), year: Math.round(this.route.start) }, report);
    });
    // Escape stänger rutan (Platt vy stängs först vid nästa Escape)
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) this.hide(); });
  }

  /** Visar rutan vid klickpunkten (x, y i fönstret). hit = LinesLayer.hitTest(): { route, leg }. */
  show({ route, leg }, x, y) {
    // Källregistret laddas vid första klicket (#337); rutan ritas om med källorna när det har kommit
    needDetails([])?.then(() => { if (this.route === route && this.leg === leg && !this.pop.hidden) this.show({ route, leg }, x, y); })
      .catch(err => console.error(err));
    const col = CAT[route.category]?.color ?? '#f1dfb4';
    const ids = [...new Set([...(route.sources ?? []), ...(leg?.sources ?? [])])];
    const links = ids.map(id => this.srcById[id]).filter(Boolean).map(s => /^https:\/\//.test(s.url ?? '')
      ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(t(s.title))}<span class="sr-only"> (öppnas i en ny flik)</span></a>`
      : esc(t(s.title)));
    const ev = route.event && this.byId[route.event];
    const multi = (route.legs?.length ?? 0) > 1;
    // Ritas rutan om (källregistret har kommit) för samma väg ska utfällda avsnitt stå kvar öppna
    const same = this.route === route && this.leg === leg && !this.pop.hidden;
    const wasOpen = sel => same && !!this.pop.querySelector(`${sel}[open]`);
    const noteOpen = wasOpen('.rp-note-d'), aboutOpen = wasOpen('.rp-about');
    this.route = route; this.leg = leg;
    // Ordning (#1571): rubrik, tid, sammanfattning, noten som en hopfälld rad (oenigheten syns alltid som en rad), Läs mer,
    // och sist en hopfälld rad med källor och status. Osäkerhet göms inte: noten har sin rubrik synlig.
    this.pop.innerHTML = `<button type="button" class="detail-close" data-close aria-label="Stäng">×</button>
      <div class="rp-head"><span class="swatch" style="background:${esc(col)}"></span><strong>${esc(t(route.title))}</strong></div>
      <p class="rp-note">${esc(KIND[route.kind] ?? 'Väg')} · ${esc(formatEventTime(route))}</p>
      ${multi && leg ? `<p class="rp-note">Etapp: ${esc(legTime(leg))}${leg.uncertain ? ' · osäker väg (streckad)' : ''}</p>`
        : leg?.uncertain ? '<p class="rp-note">Osäker väg (streckad)</p>' : ''}
      ${route.summary ? paragraphs(t(route.summary)).map(x => `<p class="rp-summary">${esc(x)}</p>`).join('') : ''}
      ${route.note ? `<details class="rp-disc rp-note-d"${noteOpen ? ' open' : ''}><summary>${esc(t(route.note.title))}</summary><p>${esc(t(route.note.text))}</p></details>` : ''}
      ${ev ? `<button type="button" class="info-btn rp-more" data-event="${esc(ev.id)}">Läs mer om ${esc(t(ev.title))}</button>` : ''}
      <details class="rp-disc rp-about"${aboutOpen ? ' open' : ''}><summary>${esc(ui('route.sourcesCount', { n: ids.length }))} · ${esc(reviewLabel(route.review, route.kind === 'trade' ? 'Vägen' : 'Resan'))}</summary>
        ${links.length ? `<p class="rp-src">${links.join(', ')}</p>` : ''}
        ${this.onReport ? `<button type="button" class="link-btn report-btn" data-report="${esc(route.id)}" aria-haspopup="dialog" aria-controls="feedback">Rapportera faktafel</button>` : ''}
      </details>`;
    this.pop.setAttribute('aria-label', t(route.title));
    this.pop.hidden = false;
    this.pop.scrollTop = 0;
    const host = this.pop.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0, width: innerWidth, height: innerHeight };
    // Rutan hålls mellan knapparna uppe och tidslinjen nere, och rullar inuti när texten är lång
    const minTop = Math.max(8, (document.querySelector('.top-actions')?.getBoundingClientRect().bottom ?? 0) - host.top + 8);
    const maxBottom = Math.min(host.height, (document.querySelector('.timebar')?.getBoundingClientRect().top ?? innerHeight) - host.top) - 8;
    this.pop.style.maxHeight = `${Math.max(120, maxBottom - minTop)}px`;
    const w = this.pop.offsetWidth, h = this.pop.offsetHeight;
    const left = Math.min(Math.max(8, x - host.left - w / 2), host.width - w - 8);
    const top = Math.max(minTop, Math.min(y - host.top + 14, maxBottom - h));
    this.pop.style.left = `${left}px`; this.pop.style.top = `${top}px`;
  }

  hide() { this.pop.hidden = true; this.route = null; }
}
