// Klickrutan för vägar och resor (#38): en liten ruta i samma stil som religionernas klickruta, med vägens
// namn, tid, sammanfattning, källor och "Läs mer" till den kopplade händelsen (fältet event).
import { CAT, MONTHS_SHORT, t, formatYear, formatEventTime, reviewLabel } from '../model.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const KIND = { voyage: 'Resa', trade: 'Handelsväg' };

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
    pop.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) this.hide();
      const ev = e.target.closest('[data-event]');
      if (ev) { this.hide(); this.onEvent(ev.dataset.event); }
    });
    // Escape stänger rutan (Platt vy stängs först vid nästa Escape)
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) this.hide(); });
  }

  /** Visar rutan vid klickpunkten (x, y i fönstret). hit = LinesLayer.hitTest(): { route, leg }. */
  show({ route, leg }, x, y) {
    this.route = route;
    const col = CAT[route.category]?.color ?? '#f1dfb4';
    const ids = [...new Set([...(route.sources ?? []), ...(leg?.sources ?? [])])];
    const links = ids.map(id => this.srcById[id]).filter(Boolean).map(s => /^https:\/\//.test(s.url ?? '')
      ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(t(s.title))}<span class="sr-only"> (öppnas i en ny flik)</span></a>`
      : esc(t(s.title)));
    const ev = route.event && this.byId[route.event];
    const multi = (route.legs?.length ?? 0) > 1;
    this.pop.innerHTML = `<button type="button" class="detail-close" data-close aria-label="Stäng">×</button>
      <div class="rp-head"><span class="swatch" style="background:${esc(col)}"></span><strong>${esc(t(route.title))}</strong></div>
      <p class="rp-note">${esc(KIND[route.kind] ?? 'Väg')} · ${esc(formatEventTime(route))}</p>
      ${multi && leg ? `<p class="rp-note">Etapp: ${esc(legTime(leg))}${leg.uncertain ? ' · osäker väg (streckad)' : ''}</p>`
        : leg?.uncertain ? '<p class="rp-note">Osäker väg (streckad)</p>' : ''}
      ${route.summary ? `<p>${esc(t(route.summary))}</p>` : ''}
      ${route.note ? `<p class="rp-note-box"><strong>${esc(t(route.note.title))}</strong> ${esc(t(route.note.text))}</p>` : ''}
      ${links.length ? `<p class="rp-src">Källor: ${links.join(', ')}</p>` : ''}
      <p class="rp-note">${esc(reviewLabel(route.review, route.kind === 'trade' ? 'Vägen' : 'Resan'))}</p>
      ${ev ? `<button type="button" class="info-btn rp-more" data-event="${esc(ev.id)}">Läs mer om ${esc(t(ev.title))}</button>` : ''}`;
    this.pop.setAttribute('aria-label', t(route.title));
    this.pop.hidden = false;
    const host = this.pop.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0, width: innerWidth, height: innerHeight };
    const w = this.pop.offsetWidth, h = this.pop.offsetHeight;
    const left = Math.min(Math.max(8, x - host.left - w / 2), host.width - w - 8);
    const top = Math.min(Math.max(8, y - host.top + 14), host.height - h - 8);
    this.pop.style.left = `${left}px`; this.pop.style.top = `${top}px`;
  }

  hide() { this.pop.hidden = true; this.route = null; }
}
