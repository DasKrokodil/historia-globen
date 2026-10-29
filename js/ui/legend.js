// Teckenförklaring och klickruta för religionslagret (#166). Båda är vanliga
// HTML-element över globen (inte en del av kartbilden), och all text kommer ur
// religions.json via t().
import { t } from '../model.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cleanName = n => String(n).replace(/^\((.*)\)$/, '$1'); // "(Kingdom of France)" → "Kingdom of France"

const OBSTACLES = '.funfact, .ff-tab, .detail-card, .panel, .focus-bar, .pause-note';
const GAP = 10; // luft mellan förklaringen och det som ligger under

export class ReligionLegend {
  constructor({ legend, pop }) {
    Object.assign(this, { legend, pop });
    this.onFacts = () => {};
    // Öppen som standard i dator, hopfälld till en knapp i mobil (#193). Valet ligger kvar när året ändras.
    this.open = matchMedia('(min-width: 761px)').matches;
    legend.addEventListener('click', e => {
      if (!e.target.closest('.rl-toggle')) return;
      this.open = !this.open; this.render(); this.fit();
    });
    this.fit = this.fit.bind(this);
    this.fitSoon = () => { cancelAnimationFrame(this._raf); this._raf = requestAnimationFrame(this.fit); };
    addEventListener('resize', this.fitSoon);
    // Samtidigt-kortet, faktarutan, panelen och fokusraden byter höjd och plats: förklaringen får det som blir över
    const ro = new ResizeObserver(this.fitSoon);
    for (const el of document.querySelectorAll(OBSTACLES + ', .masthead')) ro.observe(el);
    new MutationObserver(this.fitSoon).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    document.addEventListener('animationend', this.fitSoon, true);
    pop.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) this.hidePop();
      const f = e.target.closest('[data-facts]');
      if (f) { this.hidePop(); this.onFacts(f.dataset.facts); }
    });
  }

  /** items från ReligionsLayer.legendItems(); tom lista döljer rutan. */
  update(items) {
    this.items = items;
    this.render(); this.fit();
  }

  render() {
    const items = this.items ?? [];
    if (!items.length) { this.legend.hidden = true; this.legend.textContent = ''; return; }
    const unsure = items.some(i => i.unsure);
    this.legend.innerHTML = `<button type="button" class="rl-toggle" aria-expanded="${this.open}" aria-controls="rl-body"><span class="rl-title">Religioner</span><span class="rl-chev" aria-hidden="true"></span></button>
      <div id="rl-body" class="rl-body" ${this.open ? '' : 'hidden'}><ul>${items.map(({ religion: r, sure, unsure: u }) =>
      `<li><span class="swatch" style="background:${esc(r.color)}"></span>${esc(t(r.name))}${u && !sure ? ' <em>(osäkert)</em>' : ''}</li>`).join('')}</ul>${
      unsure ? '<p class="rl-note"><span class="swatch rl-unsure"></span>Ljus med streckad kant: osäker uppgift</p>' : ''}</div>`;
    this.legend.hidden = false;
  }

  /** Lägger förklaringen under rubriken uppe till vänster och begränsar listans höjd så att den slutar
   *  ovanför det som ligger under: Samtidigt-kortet (eller fliken), faktarutan, panelen och fokusraden (#193).
   *  Får listan för lite plats fälls den ihop till knappen; listan scrollas om den är för hög. */
  fit() {
    const lg = this.legend;
    if (lg.hidden) return;
    const mast = document.querySelector('.masthead');
    const top = Math.round((mast ? mast.getBoundingClientRect().bottom : 56) + 8);
    lg.style.top = `${top}px`;
    const body = lg.querySelector('.rl-body'); if (!body) return;
    body.hidden = !this.open; body.style.maxHeight = '';
    if (!this.open) return;
    const me = lg.getBoundingClientRect();
    let limit = innerHeight - 150;
    for (const el of document.querySelectorAll(OBSTACLES)) {
      if (el.hidden || getComputedStyle(el).display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (r.width && r.left < me.right && r.right > me.left && r.bottom > top) limit = Math.min(limit, r.top);
    }
    const head = lg.querySelector('.rl-toggle').offsetHeight;
    const room = limit - GAP - top - head - 14; // 14 = rutans utfyllnad
    if (room < 56) body.hidden = true; // för lite plats: bara knappen syns
    else body.style.maxHeight = `${Math.floor(room)}px`;
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
