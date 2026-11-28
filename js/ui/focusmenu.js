// Fokusmenyn (#113): välj vad du vill följa i fokusläget – ett krig, ett rike, ett försvunnet land
// eller en religion. Menyn fylls från datan och öppnas under knappgruppen.
// Överst ligger en sökruta, flikar och sortering (#240, #311); de ligger kvar medan listan under rullar.
// - Sökningen letar i alla namn en post har (svenska, engelska och för riken namnen på rikets delar,
//   till exempel "Bysantinska riket" i Rom), även delar av namn och utan att bry sig om accenter.
// - Flikarna: Alla, Länder och landskap (#1947, id Platser), Händelser, Krig, Riken, Försvunna länder, Religioner, Resor, Teman (#398)
//   och Nära en plats (id Plats, #15). Menyn öppnas alltid med Alla;
//   bara sorteringen sparas i localStorage (#709). Sök och följ (#651): Sök (#570) ingår här. Händelser har ingen lista att bläddra i; de hittas
//   när man skriver (searchEvents, ur js/search-index.js) och öppnas i stället för att följas.
// - Sorteringen: Relevans visar det som pågår nära året man står på, närmast först, och resten bakom
//   "Visa alla" (#121); Försvunna länder visas där alltid hela, i tidsordning (#72). Kronologiskt och
//   Alfabetiskt visar allt. Länder och landskap (#1947) är ett träd, världsdel → land → landskap, alltid i namnordning; där
//   gäller ingen sortering och raden döljs. Varje nivå är en knapp med aria-expanded, som gruppernas rubriker.
// - Länder och landskap (#1261): överst en urvalsrad ("Ett urval: N länder. Fler kommer."), där N räknas ur de laddade länderna (ingen siffra
//   för hur många länder som finns, för den saknar källa). Ger en sökning på den fliken inget land står "Landet finns inte bland korten ännu"
//   och en knapp till Nära en plats med sökordet med sig, så att sökningen inte är en återvändsgränd; Enter i sökrutan gör samma sak.
// - Gruppens antal är antalet rader som visas: under en sökning träffarna, inte hela gruppen (#1953).
// - Tangentbord: pil ner från sökrutan går till listan, pilarna flyttar i listan, Enter väljer (i sökrutan
//   den första träffen), Escape stänger. Pilarna hoppar över rader i en ihopfälld nivå. På dator får sökrutan fokus när menyn öppnas.
import { ui } from '../i18n.js';
import { REGIONS } from '../model.js';

// Flikarnas och sorteringens id är svenska ord, eftersom sorteringens sparas i localStorage och flikarnas är
// desamma som gruppernas id (focus.js). Det som visas hämtas med ui() på valt språk (#671).
const EVENTS = 'Händelser';
const PLACE = 'Plats'; // "Nära en plats" (#15, namnet sedan #1947): händelser nära en plats ur datan
const PLACES = 'Platser'; // "Länder och landskap" (#1947): platserna med eget kort, direkt efter Alla
const TABS = ['Alla', PLACES, EVENTS, 'Krig', 'Riken', 'Försvunna länder', 'Religioner', 'Resor', 'Teman', PLACE];
const TAB_KEY = { Alla: 'all', [EVENTS]: 'events', Krig: 'wars', Riken: 'empires', 'Försvunna länder': 'vanished', Religioner: 'religions', Resor: 'routes', Teman: 'themes', Platser: 'places', [PLACE]: 'place' };
/** Flikens eller gruppens namn på valt språk; ett okänt id visas som det är. */
export const tabName = id => (TAB_KEY[id] ? ui(`focus.tab.${TAB_KEY[id]}`) : id);
const SORTS = ['relevans', 'kronologiskt', 'alfabetiskt'];
const LOW_MENU = 280; // px under knapparna: mindre än så räcker inte till huvudet och tre rader, och menyn läggs över knapparna (#1951)
const sortName = id => ui(`focus.sort.${id}`);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** Gemener utan accenter, så att "osterrike" hittar Österrike och "bys" hittar Bysantinska riket. */
const norm = s => String(s).toLocaleLowerCase('sv').normalize('NFD').replace(/\p{M}/gu, '');
const byName = (a, b) => a.label.localeCompare(b.label, 'sv');
/** Text med en form för ett och en för flera ([ett, flera] i språkfilen), {count} byts mot antalet. */
const countText = (key, n) => String(ui(key)[n === 1 ? 0 : 1]).replace('{count}', n);

export class FocusMenu {
  constructor({ button, menu, texts = {}, ages = [] }) {
    Object.assign(this, { button, menu });
    this.texts = texts;
    this.ages = ages;
    this.onPick = () => {};
    this.onOpen = () => {};
    this.onRetryPlaces = () => {};
    this.searchEvents = () => []; // (sökord) → händelser som träffar: [{ key: 'event:<id>', label, sub, color }]
    this.searchPlaces = () => []; // (sökord) → platser ur datan: [{ label, lat, lon }] (#15)
    this.eventsNear = () => []; // ({ label, lat, lon }) → händelser nära platsen, äldst först: [{ key, label, sub, color, approximate }]
    this.place = null; // den valda platsen på fliken Plats
    this.groups = [];
    this.time = null;
    this.showAll = false;
    this.showAllGroups = new Set();
    this.openGroup = null;
    this.nodes = new Map(); // nivåerna i trädet Länder och landskap (#1947) som besökaren har fällt ut eller ihop: nod → öppen
    this.groupByAge = false;
    this.query = '';
    this.tab = 'Alla';
    this.sort = 'relevans';
    try {
      localStorage.removeItem('hg-focus-tab'); // fliken sparas inte längre (#709); städa bort ett gammalt val
      const s = localStorage.getItem('hg-focus-sort'); if (SORTS.includes(s)) this.sort = s;
    } catch { /* utan lagring */ }
    // Huvudet byggs en gång, så att fältet behåller markören medan listan ritas om
    menu.classList.add('focus-menu');
    menu.innerHTML = `<div class="focus-head">
        <button type="button" class="menu-x" aria-label="${esc(ui('common.close'))}">×</button>
        <div class="layer-heading first">${esc(ui('top.focus'))}</div>
        <input type="search" class="focus-search" placeholder="${esc(ui('focus.placeholder'))}" aria-label="${esc(ui('focus.searchLabel'))}" autocomplete="off" spellcheck="false" enterkeyhint="search">
        <div class="focus-tabs" role="group" aria-label="${esc(ui('focus.tabsLabel'))}">${TABS.map(n => `<button type="button" class="chip-btn" data-tab="${esc(n)}" aria-pressed="${n === this.tab}">${esc(tabName(n))}</button>`).join('')}</div>
        <div class="focus-sort" role="group" aria-label="${esc(ui('focus.sortLabel'))}"><span class="focus-sort-label">${esc(ui('focus.sort'))}</span>${SORTS.map(id => `<button type="button" class="chip-btn" data-sort="${id}" aria-pressed="${id === this.sort}">${esc(sortName(id))}</button>`).join('')}<button type="button" class="chip-btn" data-group-age aria-pressed="false">${esc(this.texts.groupByAge)}</button></div>
      </div>
      <div class="focus-body" role="group" aria-label="${esc(ui('focus.listLabel'))}"></div>
      <p class="focus-live sr-only" aria-live="polite"></p>`;
    this.body = menu.querySelector('.focus-body');
    this.live = menu.querySelector('.focus-live');
    this.input = menu.querySelector('.focus-search');
    this.input.addEventListener('input', () => { this.query = this.input.value; if (this.tab === PLACE) this.place = null; this.nodes.clear(); this.body.scrollTop = 0; this.render(); });
    const choose = (attr, key, prop) => {
      for (const b of menu.querySelectorAll(`[${attr}]`)) b.addEventListener('click', () => {
        this[prop] = b.getAttribute(attr);
        if (key) try { localStorage.setItem(key, this[prop]); } catch { /* utan lagring */ }
        for (const x of menu.querySelectorAll(`[${attr}]`)) x.setAttribute('aria-pressed', String(x === b));
        b.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }); // i mobil är flikarna en rullrad (#1947)
        this.body.scrollTop = 0;
        this.render();
      });
    };
    choose('data-tab', null, 'tab'); // fliken minns vi inte (#709)
    choose('data-sort', 'hg-focus-sort', 'sort');
    menu.querySelector('[data-group-age]').addEventListener('click', e => {
      this.groupByAge = !this.groupByAge;
      e.currentTarget.setAttribute('aria-pressed', String(this.groupByAge));
      this.render();
    });
    menu.addEventListener('keydown', e => this.key(e));
    button.addEventListener('click', () => (menu.hidden ? this.open() : this.close()));
    document.addEventListener('pointerdown', e => {
      if (!menu.hidden && !menu.contains(e.target) && !button.contains(e.target)) this.close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { this.close(); button.focus(); } });
  }

  /** Tömmer sökningen och återställer flik och sortering till standard (#381). */
  clearFilters() {
    this.query = '';
    this.input.value = '';
    this.tab = 'Alla';
    this.place = null;
    this.sort = 'relevans';
    this.showAll = false;
    this.showAllGroups.clear();
    this.openGroup = null;
    this.nodes.clear();
    this.groupByAge = false;
    for (const b of this.menu.querySelectorAll('[data-tab]')) b.setAttribute('aria-pressed', String(b.dataset.tab === this.tab));
    for (const b of this.menu.querySelectorAll('[data-sort]')) b.setAttribute('aria-pressed', String(b.dataset.sort === this.sort));
    this.menu.querySelector('[data-group-age]')?.setAttribute('aria-pressed', 'false');
    try {
      localStorage.removeItem('hg-focus-sort');
    } catch { /* utan lagring */ }
    this.body.scrollTop = 0;
    this.render();
    this.live.textContent = ui('focus.cleared');
    this.input.focus({ preventScroll: true });
  }

  /** groups: [{ title, note, loading, all, items: [{ key, label, terms, sub, color, symbol, from, to }] }].
   *  terms = alla namn posten kan sökas på (label ingår alltid). symbol = sökväg till symbolen (#271).
   *  all = gruppen visas alltid hel och i tidsordning när sorteringen är Relevans (Försvunna länder, #72). */
  setGroups(groups) {
    this.groups = groups.map(g => ({ ...g, items: g.items.map(it => ({ ...it, _terms: [...new Set([it.label, ...(it.terms ?? [])])].map(s => [s, norm(s)]) })) }));
    // Fliken Teman (#398) syns först när det finns minst ett tema; en tom flik ser ut som ett fel
    // Länder och landskap behåller fliken vid ett laddningsfel och medan ett nytt försök pågår.
    for (const title of ['Teman', PLACES]) {
      const tab = this.menu.querySelector(`[data-tab="${title}"]`);
      const has = this.groups.some(g => g.title === title && (g.items.length ||
        (title === PLACES && (g.loadError || (g.loading && tab && !tab.hidden)))));
      if (tab) tab.hidden = !has;
      if (!has && this.tab === title) {
        this.tab = 'Alla';
        for (const b of this.menu.querySelectorAll('[data-tab]')) b.setAttribute('aria-pressed', String(b.dataset.tab === this.tab));
      }
    }
    this.render();
  }

  /** Året man står på och fönstret runt det: { year, from, to, label }. Visa alla nollställs. */
  setTime(time) {
    this.time = time;
    this.render();
  }

  ageFor(item) {
    return this.ages.find(age => item.from >= age.from && item.from <= age.to) ?? this.ages.at(-1);
  }

  /** Posten om den matchar alla sökord, med det namn som träffade när det inte är postens egen rubrik. */
  match(it, words) {
    if (!words.length) return it;
    const hit = it._terms.find(([, n]) => words.every(w => n.includes(w)));
    if (!hit) return null;
    return hit[0] === it.label ? it : { ...it, also: hit[0] };
  }

  /** Fliken Plats (#15): sök en plats ur datan, välj den och se händelserna inom radien i tidsordning. */
  renderPlace() {
    this.input.placeholder = ui('place.placeholder');
    this.input.setAttribute('aria-label', ui('place.searchLabel'));
    this.menu.querySelector('.focus-sort').style.display = 'none'; // sortering gäller inte platslistan (alltid i tid)
    const query = this.query.trim();
    const hint = `<div class="layer-note pad">${esc(ui('place.hint'))}</div>`;
    const plural = (key, n, vars) => String(ui(key)[n === 1 ? 0 : 1]).replace(/\{(\w+)\}/g, (m, k) => (k === 'count' ? n : vars[k] ?? m));
    const row = (it, attr) => `<button type="button" class="layer-row focus-item" ${attr}>
        <span class="swatch" style="background:${esc(it.color ?? 'var(--brass)')}"></span><span class="focus-name">${esc(it.label)}</span>
        ${it.sub ? `<span class="layer-note">${esc(it.sub)}${it.approximate ? ` · ${esc(ui('place.approx'))}` : ''}</span>` : ''}</button>`;
    let html = hint, live = '';
    if (this.place) {
      const hits = this.eventsNear(this.place);
      const km = this.radiusKm ?? 300;
      const head = hits.length ? plural('place.result', hits.length, { km, place: this.place.label }) : ui('place.empty', { km, place: this.place.label });
      html += `<div class="focus-active"><span class="focus-active-text"><strong>${esc(head)}</strong></span>
        <button type="button" class="focus-clear" data-place-reset>${esc(ui('place.other'))}</button></div>`
        + hits.map(h => row(h, `data-key="${esc(h.key)}"`)).join('');
      live = head;
    } else if (query) {
      this.suggestions = this.searchPlaces(query);
      html += this.suggestions.length ? this.suggestions.map((p, i) => row({ label: p.label }, `data-place="${i}"`)).join('')
        : `<div class="layer-note pad" aria-hidden="true">${esc(ui('place.noMatch', { query }))}</div>`;
      live = this.suggestions.length ? ui('focus.results', { count: this.suggestions.length }) : ui('place.noMatch', { query });
    }
    this.body.innerHTML = html;
    this.live.textContent = live;
    this.body.querySelector('[data-place-reset]')?.addEventListener('click', () => {
      this.place = null; this.query = ''; this.input.value = ''; this.render(); this.input.focus({ preventScroll: true });
    });
    for (const b of this.body.querySelectorAll('[data-place]')) b.addEventListener('click', () => {
      this.place = this.suggestions[Number(b.dataset.place)]; this.body.scrollTop = 0; this.render();
      (this.body.querySelector('[data-place-reset]') ?? this.input).focus({ preventScroll: true });
    });
    for (const b of this.body.querySelectorAll('[data-key]')) b.addEventListener('click', () => { this.close(); this.onPick(b.dataset.key); });
  }

  /** Från en sökning utan land (#1261) till Nära en plats med sökordet med sig. Fokus går till första förslaget, annars till flikens knapp;
   *  sökrutan får det inte, så att tangentbordet på skärmen inte fälls upp. */
  goToNear() {
    this.tab = PLACE;
    this.place = null;
    for (const b of this.menu.querySelectorAll('[data-tab]')) b.setAttribute('aria-pressed', String(b.dataset.tab === this.tab));
    this.body.scrollTop = 0;
    this.render();
    const tab = this.menu.querySelector(`[data-tab="${PLACE}"]`);
    tab?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    (this.body.querySelector('[data-place]') ?? tab)?.focus({ preventScroll: true });
  }

  render() {
    if (this.tab === PLACE) return this.renderPlace();
    this.input.placeholder = ui('focus.placeholder');
    this.input.setAttribute('aria-label', ui('focus.searchLabel'));
    // Sorteringen gäller inte trädet Länder och landskap (alltid i namnordning, #1947); raden döljs där och tar ingen plats i mobil
    this.menu.querySelector('.focus-sort').style.display = this.tab === PLACES ? 'none' : '';
    const tm = this.time;
    const dist = it => !tm ? 0 : tm.year < it.from ? it.from - tm.year : tm.year > it.to ? tm.year - it.to : 0;
    const near = it => !tm || (it.to >= tm.from && it.from <= tm.to);
    const chrono = (a, b) => a.from - b.from || byName(a, b);
    const words = norm(this.query.trim()).split(/\s+/).filter(Boolean);
    const relevance = this.sort === 'relevans';
    let found = 0;
    const query = this.query.trim();
    const eventGroup = words.length && (this.tab === 'Alla' || this.tab === EVENTS)
      ? [{ title: EVENTS, pre: true, items: this.searchEvents(query) }] : [];
    const groups = [...this.groups, ...eventGroup].filter(g => this.tab === 'Alla' || g.title === this.tab).map(g => {
      const cmp = this.sort === 'alfabetiskt' || g.tree ? byName : this.sort === 'kronologiskt' || g.all ? chrono
        : (a, b) => dist(a) - dist(b) || byName(a, b);
      // Händelserna kommer färdigsorterade och färdigmatchade ur sökningen (search-index.js)
      if (g.pre) { found += g.items.length; return { ...g, total: g.items.length }; }
      const sorted = [...g.items].sort(cmp);
      // En öppen rullgardin visar alltid de närmaste åtta; sökning visar alla träffar.
      const items = words.length ? sorted.map(it => this.match(it, words)).filter(Boolean) : sorted;
      found += items.length;
      // Antalet är raderna som visas: under en sökning träffarna, inte hela gruppen (#1953). full behövs för trädets länder (#1947)
      return { ...g, total: items.length, items, full: sorted };
    }).filter(g => g.items.length || (g.loading && !words.length));
    const q = words.length > 0;
    const activeHtml = [], activeText = [];
    if (q) {
      activeHtml.push(esc(ui('focus.activeSearch', { query: this.query.trim() })));
      activeText.push(ui('focus.activeSearch', { query: this.query.trim() }));
    }
    if (this.tab !== 'Alla') {
      activeHtml.push(esc(ui('focus.activeFilter', { name: tabName(this.tab) })));
      activeText.push(ui('focus.activeFilter', { name: tabName(this.tab) }));
    }
    if (this.sort !== 'relevans') {
      activeHtml.push(esc(ui('focus.activeSort', { name: sortName(this.sort) })));
      activeText.push(ui('focus.activeSort', { name: sortName(this.sort) }));
    }
    if (this.groupByAge) {
      activeHtml.push(esc(this.texts.groupByAge));
      activeText.push(this.texts.groupByAge);
    }
    const activeRow = activeHtml.length ? `<div class="focus-active">
      <span class="focus-active-text"><strong>${esc(ui('focus.results', { count: found }))}</strong> · ${activeHtml.join(' · ')}</span>
      <button type="button" class="focus-clear" data-clear>${esc(ui('focus.clearAll'))}</button>
    </div>` : '';
    const intro = !q && relevance && tm && groups.some(g => !g.all && !g.tree)
      ? `<div class="layer-note pad">${esc(ui('focus.nearFirst', { window: tm.label }))}</div>` : '';
    // Länder och landskap (#1261): urvalsraden står överst (inte sist bakom rullningen). N är länderna på nivån land i trädet, räknade ur de
    // laddade platserna, inte träffarna; ett landskap vars land saknas räknas som eget land, som i treeHtml. Ingen siffra för alla länder (saknar källa).
    const places = this.groups.find(g => g.title === PLACES);
    const placeItems = places?.items ?? [];
    const placeError = this.tab === PLACES && places?.loadError ? ui('focus.places.loadError') : '';
    const placeLoading = this.tab === PLACES && places?.loading;
    const countries = placeItems.filter(it => !it.parent || !placeItems.some(o => o.id === it.parent)).length;
    const sample = this.tab === PLACES && countries ? `<p class="focus-sample">${esc(countText('focus.places.sample', countries))}</p>` : '';
    // Ett land som saknas: skriv det öppet och visa vägen vidare. Texten är dold för skärmläsare (aria-hidden) och sägs en gång i live-regionen,
    // som övriga tomma sökningar (renderPlace); knappen är inte dold.
    const missing = this.tab === PLACES && !placeError && !placeLoading && q && !found ? ui('focus.places.missing', { query: this.query.trim() }) : '';
    const empty = esc(q ? ui('focus.noMatch', { query: this.query.trim() })
      : this.tab === EVENTS ? ui('focus.eventsHint') : ui('focus.nothing'));
    // Förklaringen under en rubrik visas på gruppens egen flik, inte i Alla eller vid sökning, så att listan blir kort
    const own = this.tab !== 'Alla' && !q;
    const rows = items => items.map(it => `<button type="button" class="layer-row focus-item" data-key="${esc(it.key)}"${it.key.startsWith('religion:') ? ` data-religion="${esc(it.key.slice(9))}"` : ''}>
        <span class="swatch" style="background:${esc(it.color)}"></span>${it.symbol ? `<img class="rel-sym" src="${esc(it.symbol)}" alt="" width="16" height="16">` : ''}<span class="focus-name">${esc(it.label)}</span>
        ${it.also ? `<span class="layer-note focus-also">${esc(ui('focus.also', { name: it.also }))}</span>` : ''}
        ${it.sub ? `<span class="layer-note">${esc(it.sub)}</span>` : ''}</button>`).join('');
    const groupItems = (g, expanded) => {
      if (!expanded) return '';
      if (!g.items.length) return g.loading && g.title !== this.tab ? `<div class="layer-note pad">${esc(ui('focus.loading'))}</div>` : '';
      if (g.tree) return this.treeHtml(g, rows, q);
      // En vald flik är redan ett avgränsat urval. Visa därför hela gruppen så
      // att antalet i rubriken direkt motsvarar de synliga raderna; Alla behåller
      // sin korta, hopfällbara översikt.
      const showAll = q || this.tab !== 'Alla' || this.showAllGroups.has(g.title);
      const visible = showAll ? g.items : g.items.slice(0, 8);
      const ageRows = this.groupByAge ? visible.reduce((html, it) => {
        const age = this.ageFor(it);
        const label = age?.label ?? '';
        if (label !== html.last) html.html += `<div class="focus-age">${esc(label)}</div>`;
        html.last = label; html.html += rows([it]); return html;
      }, { html: '', last: null }).html : rows(visible);
      const more = !q && g.items.length > visible.length ? `<button type="button" class="layer-row focus-more" data-group-all="${esc(g.title)}">${esc(String(this.texts.showAll).replace('{count}', g.items.length - visible.length))}</button>` : '';
      const less = !q && showAll && g.items.length > 8 ? `<button type="button" class="layer-row focus-more" data-group-near="${esc(g.title)}">${esc(this.texts.showNearest)}</button>` : '';
      return `${ageRows}${more}${less}`;
    };
    const placeStatus = placeError
      ? `<div class="focus-missing"><p class="layer-note pad" aria-hidden="true">${esc(placeError)}</p><button type="button" class="focus-clear focus-missing-link" data-retry-places>${esc(ui('focus.places.retry'))}</button></div>`
      : placeLoading ? `<p class="layer-note pad" aria-hidden="true">${esc(ui('focus.loading'))}</p>` : '';
    this.body.innerHTML = sample + activeRow + intro + (placeStatus || groups.map(g => {
      const expanded = q || (this.tab !== 'Alla' ? true : this.openGroup === g.title);
      return `<section class="focus-group"><button type="button" class="focus-group-toggle" data-group="${esc(g.title)}" aria-expanded="${expanded}"><span>${esc(tabName(g.title))} <span class="focus-group-count">(${g.total})</span></span><span class="focus-group-chev" aria-hidden="true"></span></button>
      ${g.note && own && !g.tree ? `<div class="layer-note pad focus-note">${esc(g.note)}</div>` : ''}${groupItems(g, expanded)}${g.note && own && g.tree ? `<div class="layer-note pad focus-note">${esc(g.note)}</div>` : ''}</section>`;
    }).join('')
      || (missing ? `<div class="focus-missing"><p class="layer-note pad" aria-hidden="true">${esc(missing)}</p><button type="button" class="focus-clear focus-missing-link" data-to-near>${esc(ui('focus.places.toNear'))}</button></div>`
        : `<div class="layer-note pad">${empty}</div>`));
    this.body.classList.toggle('focus-own-tab', this.tab !== 'Alla'); // gruppens rubrik döljs på sin egen flik i låg skärm (css, #1951)
    this.live.textContent = placeError || (placeLoading ? ui('focus.loading') : '') || missing || (activeText.length ? `${ui('focus.results', { count: found })}. ${activeText.join('. ')}` : '');
    this.body.querySelector('[data-clear]')?.addEventListener('click', () => this.clearFilters());
    this.body.querySelector('[data-to-near]')?.addEventListener('click', () => this.goToNear());
    this.body.querySelector('[data-retry-places]')?.addEventListener('click', async () => {
      const tab = this.menu.querySelector(`[data-tab="${PLACES}"]`);
      tab?.focus({ preventScroll: true });
      await this.onRetryPlaces();
      if (document.activeElement === tab) this.body.querySelector('[data-retry-places]')?.focus({ preventScroll: true });
    });
    for (const b of this.body.querySelectorAll('[data-key]')) {
      b.addEventListener('click', () => { this.close(); this.onPick(b.dataset.key); });
    }
    for (const b of this.body.querySelectorAll('[data-group]')) b.addEventListener('click', () => {
      const title = b.dataset.group;
      this.openGroup = this.openGroup === title ? null : title;
      this.render();
      [...this.body.querySelectorAll('[data-group]')].find(x => x.dataset.group === title)?.focus({ preventScroll: true });
    });
    for (const b of this.body.querySelectorAll('[data-node]')) b.addEventListener('click', () => {
      const node = b.dataset.node;
      this.nodes.set(node, b.getAttribute('aria-expanded') !== 'true');
      this.render();
      [...this.body.querySelectorAll('[data-node]')].find(x => x.dataset.node === node)?.focus({ preventScroll: true });
    });
    for (const b of this.body.querySelectorAll('[data-group-all]')) b.addEventListener('click', () => {
      this.showAllGroups.add(b.dataset.groupAll); this.render();
      [...this.body.querySelectorAll('[data-group-all]')].find(x => x.dataset.groupAll === b.dataset.groupAll)?.focus({ preventScroll: true });
    });
    for (const b of this.body.querySelectorAll('[data-group-near]')) b.addEventListener('click', () => {
      this.showAllGroups.delete(b.dataset.groupNear); this.render();
      [...this.body.querySelectorAll('[data-group-all]')].find(x => x.dataset.groupAll === b.dataset.groupNear)?.focus({ preventScroll: true });
    });
  }

  /**
   * Trädet Länder och landskap (#1947): världsdel → land → landskap. Världsdelarna i samma ordning som i Samtidigt (REGIONS i model.js),
   * länderna och landskapen i namnordning. Varje nivå är en knapp med aria-expanded (inte role="tree"), och en ihopfälld nivås rader
   * ligger kvar i sidan med hidden, så att aria-controls pekar på något och pilarna hoppar över dem. Världsdelarna är utfällda och
   * landskapen ihopfällda från början; under en sökning är allt med träffar utfällt. Antalet är träffarna i nivån (#1953).
   * Ett land som inte träffar men har landskap som gör det står kvar som rad, så att landskapet syns under sitt land.
   */
  treeHtml(g, rows, q) {
    const hits = g.items, full = g.full ?? hits;
    const open = (node, standard) => this.nodes.get(node) ?? (q || standard);
    const domId = node => `focus-node-${node.replace(/[^a-z0-9]+/gi, '-')}`;
    const toggle = (node, label, count, expanded, level) => `<button type="button" class="focus-node-toggle focus-node-${level}" data-node="${esc(node)}" aria-expanded="${expanded}" aria-controls="${domId(node)}"><span>${esc(label)} <span class="focus-group-count">(${count})</span></span><span class="focus-group-chev" aria-hidden="true"></span></button>`;
    const body = (node, expanded, html) => `<div class="focus-node-body" id="${domId(node)}"${expanded ? '' : ' hidden'}>${html}</div>`;
    const byId = new Map(full.map(it => [it.id, it]));
    // En plats vars land saknas i listan (utkast eller inga händelser) står som ett eget land
    const top = it => !it.parent || !byId.has(it.parent);
    return REGIONS.map(r => {
      const inRegion = hits.filter(it => it.region === r);
      if (!inRegion.length) return '';
      // Länderna: först de som bara står som land till ett landskap som träffar, sedan träffarna, så att träffens rad (med "också") vinner
      const countries = [...new Map([...inRegion.filter(it => !top(it)).map(it => byId.get(it.parent)), ...inRegion.filter(top)]
        .map(c => [c.id, c])).values()].sort(byName);
      const html = countries.map(c => {
        const kids = inRegion.filter(it => !top(it) && it.parent === c.id);
        const types = [...new Set(kids.map(k => k.type))];
        return rows([c]) + types.map(type => {
          const list = kids.filter(k => k.type === type), node = `c:${c.id}:${type}`, expanded = open(node, false);
          const kind = ui(`place.types.${type}`), label = c.nameIn ? ui('place.typeOf', { type: kind, of: c.nameIn }) : kind;
          return `<div class="focus-node">${toggle(node, label, list.length, expanded, 'kids')}${body(node, expanded, rows(list))}</div>`;
        }).join('');
      }).join('');
      const node = `r:${r}`, expanded = open(node, true);
      return `<div class="focus-node">${toggle(node, ui(`region.${r}`), inRegion.length, expanded, 'region')}${body(node, expanded, html)}</div>`;
    }).join('');
  }

  /** Tangentbordet i menyn: pilarna mellan sökrutan och listan, och mellan flikarna och sorteringarna. */
  key(e) {
    const t = e.target;
    // Rader i en ihopfälld nivå (hidden) och rubriker som inte visas hoppas över (#1947, #1951)
    const shown = b => b.getClientRects().length > 0;
    const headings = [...this.body.querySelectorAll('[data-group]')].filter(shown);
    const rows = [...this.body.querySelectorAll('button:not([data-group])')].filter(shown);
    const go = el => { if (el) { e.preventDefault(); el.focus(); el.scrollIntoView({ block: 'nearest' }); } };
    if (t === this.input) {
      if (e.key === 'ArrowDown') go(headings[0] ?? rows[0]);
      else if (e.key === 'Enter') { e.preventDefault(); (rows.find(b => b.dataset.key || b.dataset.place !== undefined) ?? rows.find(b => b.dataset.toNear !== undefined))?.click(); }
      return;
    }
    const h = headings.indexOf(t);
    if (h >= 0) {
      if (e.key === 'ArrowDown') go(headings[(h + 1) % headings.length]);
      else if (e.key === 'ArrowUp') go(headings[(h - 1 + headings.length) % headings.length]);
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
    // Låg skärm (liggande telefon, 800 × 360, #1947, #1951): under knapparna rymdes bara huvudet, och ingen rad syntes. Där läggs menyn
    // över knapparna i stället; den stängs med ×, Escape eller ett tryck utanför som förut.
    const low = innerHeight - r.bottom < LOW_MENU, top = low ? 8 : r.bottom + 8;
    this.menu.classList.toggle('focus-menu-low', low);
    this.menu.style.top = `${top}px`;
    this.menu.style.maxHeight = `calc(100dvh - ${top + 16}px)`;
    this.menu.scrollTop = 0; // i liggande telefon rullar hela menyn; en ny öppning börjar vid sökrutan (#1951)
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
