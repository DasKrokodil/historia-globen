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
    this.names = new Map(); // rikets namn i Cliopatria → svenskt namn, där det finns (data/empires/index.json)
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

  /**
   * Visar en ruta vid klickpunkten (x, y i fönstret) med religionen och riket på platsen (#194).
   * hit.here = rikena på just den platsen (ReligionsLayer.polityAt), det mest träffande först; saknas den
   * (rikenas gränser kunde inte laddas, eller klicket hamnade mellan dem) visas rikena i området.
   */
  showPop(hit, x, y) {
    const { religion: r, snapshot, polities, here, loading } = hit;
    const name = p => { const n = cleanName(p.name); return this.names.get(n) ?? n; };
    let head = esc(t(r.name)), where;
    if (loading) {
      where = '<p class="rp-note">Söker riket på platsen…</p>';
    } else if (here?.length) {
      const names = [...new Set(here.map(name))]; // "(Kingdom of France)" och "Kingdom of France" visas en gång
      head += ` · ${esc(names[0])}`;
      where = names.length > 1 ? `<p>Även här: ${names.slice(1, 3).map(esc).join(', ')}</p>` : '';
    } else {
      const names = polities.map(name);
      where = `<p>${names.length <= 3
        ? `Rike: ${names.map(esc).join(', ')}`
        : `Ett av ${names.length} riken i det här området med ${esc(t(r.name).toLowerCase())}`}</p>`;
    }
    this.pop.innerHTML = `<button type="button" class="detail-close" data-close aria-label="Stäng">×</button>
      <div class="rp-head"><span class="swatch" style="background:${esc(r.color)}"></span><strong>${head}</strong></div>
      ${where}
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
