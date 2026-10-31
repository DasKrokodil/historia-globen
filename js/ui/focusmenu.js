// Fokusmenyn (#113): välj vad du vill följa i fokusläget – ett krig, ett rike, ett försvunnet land
// eller en religion. Menyn fylls från datan och öppnas under knappgruppen.
// Överst ligger en sökruta, flikar och sortering (#240, #311); de ligger kvar medan listan under rullar.
// - Sökningen letar i alla namn en post har (svenska, engelska och för riken namnen på rikets delar,
//   till exempel "Bysantinska riket" i Rom), även delar av namn och utan att bry sig om accenter.
// - Flikarna: Alla, Krig, Riken, Försvunna länder, Religioner. Fliken och sorteringen sparas i localStorage.
// - Sorteringen: Relevans visar det som pågår nära året man står på, närmast först, och resten bakom
//   "Visa alla" (#121); Försvunna länder visas där alltid hela, i tidsordning (#72). Kronologiskt och
//   Alfabetiskt visar allt.
// - Tangentbord: pil ner från sökrutan går till listan, pilarna flyttar i listan, Enter väljer (i sökrutan
//   den första träffen), Escape stänger. På dator får sökrutan fokus när menyn öppnas.
const TABS = ['Alla', 'Krig', 'Riken', 'Försvunna länder', 'Religioner'];
const SORTS = [['relevans', 'Relevans'], ['kronologiskt', 'Kronologiskt'], ['alfabetiskt', 'Alfabetiskt']];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** Gemener utan accenter, så att "osterrike" hittar Österrike och "bys" hittar Bysantinska riket. */
const norm = s => String(s).toLocaleLowerCase('sv').normalize('NFD').replace(/\p{M}/gu, '');
const byName = (a, b) => a.label.localeCompare(b.label, 'sv');

export class FocusMenu {
  constructor({ button, menu }) {
    Object.assign(this, { button, menu });
    this.onPick = () => {};
    this.onOpen = () => {};
    this.groups = [];
    this.time = null;
    this.showAll = false;
    this.query = '';
    this.tab = 'Alla';
    this.sort = 'relevans';
    try {
      const v = localStorage.getItem('hg-focus-tab'); if (TABS.includes(v)) this.tab = v;
      const s = localStorage.getItem('hg-focus-sort'); if (SORTS.some(([id]) => id === s)) this.sort = s;
    } catch { /* utan lagring */ }
    // Huvudet byggs en gång, så att fältet behåller markören medan listan ritas om
    menu.classList.add('focus-menu');
    menu.innerHTML = `<div class="focus-head">
        <div class="layer-heading first">Följ i fokusläge</div>
        <input type="search" class="focus-search" placeholder="Sök krig, rike, land eller religion" aria-label="Sök i Fokus" autocomplete="off" spellcheck="false">
        <div class="focus-tabs" role="group" aria-label="Visa">${TABS.map(n => `<button type="button" class="chip-btn" data-tab="${n}" aria-pressed="${n === this.tab}">${n}</button>`).join('')}</div>
        <div class="focus-sort" role="group" aria-label="Ordna efter"><span class="focus-sort-label">Ordna</span>${SORTS.map(([id, n]) => `<button type="button" class="chip-btn" data-sort="${id}" aria-pressed="${id === this.sort}">${n}</button>`).join('')}</div>
      </div>
      <div class="focus-body" role="group" aria-label="Att följa"></div>
      <p class="focus-live sr-only" aria-live="polite"></p>`;
    this.body = menu.querySelector('.focus-body');
    this.live = menu.querySelector('.focus-live');
    this.input = menu.querySelector('.focus-search');
    this.input.addEventListener('input', () => { this.query = this.input.value; this.body.scrollTop = 0; this.render(); });
    const choose = (attr, key, prop) => {
      for (const b of menu.querySelectorAll(`[${attr}]`)) b.addEventListener('click', () => {
        this[prop] = b.getAttribute(attr);
        try { localStorage.setItem(key, this[prop]); } catch { /* utan lagring */ }
        for (const x of menu.querySelectorAll(`[${attr}]`)) x.setAttribute('aria-pressed', String(x === b));
        this.body.scrollTop = 0;
        this.render();
      });
    };
    choose('data-tab', 'hg-focus-tab', 'tab');
    choose('data-sort', 'hg-focus-sort', 'sort');
    menu.addEventListener('keydown', e => this.key(e));
    button.addEventListener('click', () => (menu.hidden ? this.open() : this.close()));
    document.addEventListener('pointerdown', e => {
      if (!menu.hidden && !menu.contains(e.target) && !button.contains(e.target)) this.close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { this.close(); button.focus(); } });
  }

  /** groups: [{ title, note, loading, all, items: [{ key, label, terms, sub, color, symbol, from, to }] }].
   *  terms = alla namn posten kan sökas på (label ingår alltid). symbol = sökväg till symbolen (#271).
   *  all = gruppen visas alltid hel och i tidsordning när sorteringen är Relevans (Försvunna länder, #72). */
  setGroups(groups) {
    this.groups = groups.map(g => ({ ...g, items: g.items.map(it => ({ ...it, _terms: [...new Set([it.label, ...(it.terms ?? [])])].map(s => [s, norm(s)]) })) }));
    this.render();
  }

  /** Året man står på och fönstret runt det: { year, from, to, label }. Visa alla nollställs. */
  setTime(time) {
    this.time = time;
    this.showAll = false;
    this.render();
  }

  /** Posten om den matchar alla sökord, med det namn som träffade när det inte är postens egen rubrik. */
  match(it, words) {
    if (!words.length) return it;
    const hit = it._terms.find(([, n]) => words.every(w => n.includes(w)));
    if (!hit) return null;
    return hit[0] === it.label ? it : { ...it, also: hit[0] };
  }

  render() {
    const tm = this.time;
    const dist = it => !tm ? 0 : tm.year < it.from ? it.from - tm.year : tm.year > it.to ? tm.year - it.to : 0;
    const near = it => !tm || (it.to >= tm.from && it.from <= tm.to);
    const chrono = (a, b) => a.from - b.from || byName(a, b);
    const words = norm(this.query.trim()).split(/\s+/).filter(Boolean);
    const relevance = this.sort === 'relevans';
    let hidden = 0, found = 0;
    const groups = this.groups.filter(g => this.tab === 'Alla' || g.title === this.tab).map(g => {
      const cmp = this.sort === 'alfabetiskt' ? byName : this.sort === 'kronologiskt' || g.all ? chrono
        : (a, b) => dist(a) - dist(b) || byName(a, b);
      const sorted = [...g.items].sort(cmp);
      // Vid sökning, och i Kronologiskt och Alfabetiskt, letar vi bland alla poster, inte bara de nära året
      const items = words.length ? sorted.map(it => this.match(it, words)).filter(Boolean)
        : !relevance || this.showAll || g.all ? sorted : sorted.filter(near);
      hidden += sorted.length - items.length;
      found += items.length;
      return { ...g, items };
    }).filter(g => g.items.length || (g.loading && !words.length));
    const q = words.length > 0;
    // Raden om året gäller bara Relevans, och inte grupper som alltid visas hela (Försvunna länder, #72)
    const intro = q ? `<div class="layer-note pad">${found} ${found === 1 ? 'träff' : 'träffar'}.</div>`
      : relevance && tm && !this.showAll && groups.some(g => !g.all) ? `<div class="layer-note pad">Det som pågår ${esc(tm.label)}, närmast först.</div>` : '';
    const empty = q ? `Inget namn innehåller "${esc(this.query.trim())}".` : 'Inget att följa i den här tiden ännu.';
    // Förklaringen under en rubrik visas på gruppens egen flik, inte i Alla eller vid sökning, så att listan blir kort
    const own = this.tab !== 'Alla' && !q;
    this.body.innerHTML = intro + (groups.map(g => `
      <div class="layer-heading">${esc(g.title)}</div>
      ${g.note && own ? `<div class="layer-note pad focus-note">${esc(g.note)}</div>` : ''}
      ${g.items.length ? g.items.map(it => `<button type="button" class="layer-row focus-item" data-key="${esc(it.key)}"${it.key.startsWith('religion:') ? ` data-religion="${esc(it.key.slice(9))}"` : ''}>
        <span class="swatch" style="background:${esc(it.color)}"></span>${it.symbol ? `<img class="rel-sym" src="${esc(it.symbol)}" alt="" width="16" height="16">` : ''}<span class="focus-name">${esc(it.label)}</span>
        ${it.also ? `<span class="layer-note focus-also">även ${esc(it.also)}</span>` : ''}
        ${it.sub ? `<span class="layer-note">${esc(it.sub)}</span>` : ''}</button>`).join('') : '<div class="layer-note pad">Laddas …</div>'}`).join('')
      || `<div class="layer-note pad">${empty}</div>`)
      + (relevance && hidden && !q ? `<button type="button" class="layer-row focus-more" data-all>Visa alla (${hidden} till)</button>` : '')
      + (relevance && this.showAll && tm && !q ? `<button type="button" class="layer-row focus-more" data-near>Visa bara det som pågår ${esc(tm.label)}</button>` : '');
    this.live.textContent = q ? `${found} ${found === 1 ? 'träff' : 'träffar'}` : '';
    for (const b of this.body.querySelectorAll('[data-key]')) {
      b.addEventListener('click', () => { this.close(); this.onPick(b.dataset.key); });
    }
    const more = (attr, all) => this.body.querySelector(`[${attr}]`)?.addEventListener('click', () => {
      this.showAll = all; this.render();
      this.body.querySelector('.focus-more')?.focus({ preventScroll: true });
    });
    more('data-all', true);
    more('data-near', false);
  }

  /** Tangentbordet i menyn: pilarna mellan sökrutan och listan, och mellan flikarna och sorteringarna. */
  key(e) {
    const t = e.target;
    const rows = [...this.body.querySelectorAll('button')];
    const go = el => { if (el) { e.preventDefault(); el.focus(); el.scrollIntoView({ block: 'nearest' }); } };
    if (t === this.input) {
      if (e.key === 'ArrowDown') go(rows[0]);
      else if (e.key === 'Enter') { e.preventDefault(); rows.find(b => b.dataset.key)?.click(); }
      return;
    }
    const i = rows.indexOf(t);
    if (i >= 0) {
      if (e.key === 'ArrowDown') go(rows[i + 1]);
      else if (e.key === 'ArrowUp') go(i ? rows[i - 1] : this.input);
      else if (e.key === 'Home') go(rows[0]);
      else if (e.key === 'End') go(rows.at(-1));
      return;
    }
    // Flikar och sortering: vänster och höger inom raden, ner till listan
    const row = t.closest('.focus-tabs, .focus-sort');
    if (row) {
      const bs = [...row.querySelectorAll('button')], j = bs.indexOf(t);
      if (e.key === 'ArrowRight') go(bs[(j + 1) % bs.length]);
      else if (e.key === 'ArrowLeft') go(bs[(j - 1 + bs.length) % bs.length]);
      else if (e.key === 'ArrowDown' && row.classList.contains('focus-sort')) go(rows[0]);
    }
  }

  open() {
    const r = (this.button.closest('.top-actions') ?? this.button).getBoundingClientRect();
    this.menu.style.top = `${r.bottom + 8}px`;
    this.menu.style.maxHeight = `calc(100dvh - ${r.bottom + 24}px)`;
    this.menu.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
    this.onOpen();
    // Fokus in i menyn (#246). På dator i sökrutan, så att man kan skriva direkt. Med pekskärm menyn själv,
    // så att tangentbordet på skärmen inte fälls upp och täcker listan.
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) this.input.focus({ preventScroll: true });
    else { this.menu.tabIndex = -1; this.menu.focus({ preventScroll: true }); }
  }
  close() {
    const had = this.menu.contains(document.activeElement);
    this.menu.hidden = true;
    if (had) this.button.focus(); // tillbaka till knappen (#246)
    this.button.setAttribute('aria-expanded', 'false');
  }
}
