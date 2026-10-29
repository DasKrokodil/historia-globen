// Teckenförklaring och klickruta för religionslagret (#166). Båda är vanliga
// HTML-element över globen (inte en del av kartbilden), och all text kommer ur
// religions.json via t().
import { t } from '../model.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cleanName = n => String(n).replace(/^\((.*)\)$/, '$1'); // "(Kingdom of France)" → "Kingdom of France"

export class ReligionLegend {
  constructor({ legend, pop }) {
    Object.assign(this, { legend, pop });
    this.onFacts = () => {};
    pop.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) this.hidePop();
      const f = e.target.closest('[data-facts]');
      if (f) { this.hidePop(); this.onFacts(f.dataset.facts); }
    });
  }

  /** items från ReligionsLayer.legendItems(); tom lista döljer rutan. */
  update(items) {
    if (!items.length) { this.legend.hidden = true; this.legend.textContent = ''; return; }
    const unsure = items.some(i => i.unsure);
    this.legend.innerHTML = `<div class="rl-title">Religioner</div><ul>${items.map(({ religion: r, sure, unsure: u }) =>
      `<li><span class="swatch" style="background:${esc(r.color)}"></span>${esc(t(r.name))}${u && !sure ? ' <em>(osäkert)</em>' : ''}</li>`).join('')}</ul>${
      unsure ? '<p class="rl-note"><span class="swatch rl-unsure"></span>Ljus med streckad kant: osäker uppgift</p>' : ''}`;
    this.legend.hidden = false;
  }

  /** Visar en ruta vid klickpunkten (x, y i fönstret) med religionen och rikena. */
  showPop(hit, x, y) {
    const { religion: r, snapshot, polities } = hit;
    const names = polities.map(p => cleanName(p.name));
    const where = names.length <= 3
      ? `Rike: ${names.map(esc).join(', ')}`
      : `Ett av ${names.length} riken i det här området med ${esc(t(r.name).toLowerCase())}`;
    this.pop.innerHTML = `<button type="button" class="detail-close" data-close aria-label="Stäng">×</button>
      <div class="rp-head"><span class="swatch" style="background:${esc(r.color)}"></span><strong>${esc(t(r.name))}</strong></div>
      <p>${where}</p>
      ${snapshot.sure === false ? '<p class="rp-note">Osäker uppgift</p>' : ''}
      ${r.facts ? `<button type="button" class="info-btn" data-facts="${esc(r.id)}">Fakta</button>` : ''}`;
    this.pop.hidden = false;
    const host = this.pop.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0, width: innerWidth, height: innerHeight };
    const w = this.pop.offsetWidth, h = this.pop.offsetHeight;
    const left = Math.min(Math.max(8, x - host.left - w / 2), host.width - w - 8);
    const top = Math.min(Math.max(8, y - host.top + 14), host.height - h - 8);
    this.pop.style.left = `${left}px`; this.pop.style.top = `${top}px`;
  }

  hidePop() { this.pop.hidden = true; }
}
