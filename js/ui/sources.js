// "Om källorna": källpolicy och källregistret från data/sources.json.
// Källorna grupperas efter vad de används till (#141). Grupperna räknas fram ur datan:
// vilka händelser, fun facts, riken, religioner, kartlager och bilder som pekar på varje källa.
import { t, settings, loadReligions, loadForSources } from '../model.js';
import { ui } from '../i18n.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Sökningen bryr sig inte om stora bokstäver eller accenter (å, ä, ö räknas som a, a, o)
const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const short = (s, n = 70) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

const GROUPS = [
  { id: 'events', label: ui('sources.group.events') },
  { id: 'empires', label: ui('sources.group.empires') },
  { id: 'religions', label: ui('sources.group.religions') },
  { id: 'maps', label: ui('sources.group.maps') },
  { id: 'images', label: ui('sources.group.images') },
  { id: 'other', label: ui('sources.group.other') },
];
const LEVELS = [
  { key: 'checked', review: 'source-checked', label: ui('sources.level.checked') },
  { key: 'two', review: 'two-sources', label: ui('sources.level.two') },
  { key: 'draft', review: 'draft', label: ui('sources.level.draft') },
];
const imageKind = key => ({ one: ui(`sources.kind.${key}.names`)[0], many: ui(`sources.kind.${key}.names`)[1], label: ui(`sources.kind.${key}.label`) });
const KINDS = { illustration: imageKind('illustration'), historisk: imageKind('historisk') };
const kindOf = k => KINDS[k] ?? { one: ui('sources.noun.image')[0], many: ui('sources.noun.image')[1], label: ui('sources.image') };
const MAX_USES = 8;   // fler användningar än så fälls ihop

async function loadVersion() {
  const response = await fetch('data/version.json');
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Kunde inte läsa data/version.json (${response.status})`);
  return response.json();
}

/** Räknar fram vilka uppgifter som pekar på varje källa, grupp för grupp. */
function collect({ sources, events, funfacts, polities, empireGroups = [], land, borders, discovery }, religionsDoc) {
  const groups = Object.fromEntries(GROUPS.map(g => [g.id, { ...g, uses: new Map(), items: [] }]));
  const add = (gid, ids, label, review, item = true) => {
    const g = groups[gid];
    if (item) g.items.push({ label, review });
    for (const id of new Set(ids)) {
      if (!g.uses.has(id)) g.uses.set(id, []);
      g.uses.get(id).push({ label, review });
    }
  };
  for (const e of events) add('events', [...(e.sources ?? []), ...(e.story?.sources ?? [])], t(e.title), e.review);
  for (const f of funfacts) add('events', f.sources ?? [], ui('sources.funfact', { text: short(t(f.text)) }), f.review);
  for (const p of polities) add('empires', p.sources ?? [], t(p.name), p.review);
  // Faktarutan om riket (#170) och dess nyckelår
  for (const g of empireGroups) {
    // Försvunna länder (#72): årtal, föregångare och efterträdare har egna källor och egen status
    if (g.vanished) add('empires', g.vanished.sources ?? [], ui('sources.successors', { name: t(g.name) }), g.vanished.review);
    // Osäker gräns (#73): källan som säger att gränsen var osäker
    if (g.uncertainBorder) add('empires', g.uncertainBorder.sources ?? [], ui('sources.uncertainBorder', { name: t(g.name) }), g.uncertainBorder.review);
    if (!g.facts) continue;
    add('empires', g.facts.sources ?? [], ui('sources.factBox', { name: t(g.name) }), g.facts.review);
    for (const m of g.facts.milestones ?? []) add('empires', m.sources ?? [], `${t(g.name)}: ${t(m.label)}`, g.facts.review);
  }
  if (religionsDoc) {
    const rp = religionsDoc.polities ?? [];
    // Riken med kontrollerat år för kristnandet har en egen källa
    for (const p of rp.filter(p => p.source)) add('religions', [p.source], ui('sources.christianisation', { name: p.name }), 'source-checked');
    // Källor för hela religionsfilen (se notes i data/religions.json): de räknas inte som egna uppgifter
    const whole = (id, label) => add('religions', [id], label, null, false);
    if (rp.length) whole('cliopatria', ui('sources.religionAreas'));
    if (rp.some(p => p.wikipedia)) whole('wikipedia-religion', ui('sources.religionWiki'));
    if (rp.some(p => p.modern)) whole('wp-religion-by-country', ui('sources.religionModern'));
    // Faktarutan om religionen (#90) och dess nyckelår
    for (const r of religionsDoc.religions ?? []) {
      if (!r.facts) continue;
      add('religions', r.facts.sources ?? [], ui('sources.factBox', { name: t(r.name) }), r.facts.review);
      for (const m of r.facts.milestones ?? []) add('religions', m.sources ?? [], `${t(r.name)}: ${t(m.label)}`, r.facts.review);
    }
  }
  if (land?.source) add('maps', [land.source], ui('sources.baseMap'), null);
  if (borders?.source) add('maps', [borders.source], ui('sources.modernBorders'), null);
  // Upptäcktsvyns kartbilder (#101): havsmonster och kompassrosor ur gamla kartor, public domain
  for (const d of new Map((discovery?.decorations ?? []).map(d => [d.source, d])).values()) if (d.source) add('maps', [d.source], ui('sources.discovery', { title: t(d.title) }), null, false);
  // Bilder (#195): varje bild på globen listas med ursprung och licens, även illustrationer utan extern källa.
  // De räknas inte som uppgifter med granskningsnivå; bara historiska bilder med image.source får en post i källtabellen.
  const shownEvents = events.filter(e => e.image && (settings.showDrafts || e.review !== 'draft'));
  groups.images.images = shownEvents.map(e => ({ event: e, image: e.image }));
  for (const e of shownEvents) if (e.image.source) add('images', [e.image.source], ui('sources.imageUse', { title: t(e.title) }), null, false);
  // Källor som ingen uppgift pekar på just nu (räknas först när religionerna har laddats)
  if (religionsDoc) {
    const used = new Set(GROUPS.flatMap(g => [...groups[g.id].uses.keys()]));
    for (const s of sources) if (!used.has(s.id)) groups.other.uses.set(s.id, []);
  }
  for (const g of Object.values(groups)) {
    g.counts = Object.fromEntries(LEVELS.map(l => [l.key, 0]));
    for (const it of g.items) {
      if (!it.review) continue;
      const l = LEVELS.find(l => l.review === it.review) ?? LEVELS.find(l => l.key === 'draft');
      g.counts[l.key]++;
    }
    g.reviewed = g.items.filter(it => it.review).length;
  }
  return groups;
}

export class SourcesDialog {
  constructor({ root, body, close, openBtn }, data) {
    Object.assign(this, { root, body, data, openBtn });
    this.versionPromise = null;
    this.onSettings = () => {};
    this.query = '';
    this.group = null;
    this.status = '';   // statusfiltret (#517): '' = alla, annars en nyckel i LEVELS
    openBtn.addEventListener('click', () => this.open());
    close.addEventListener('click', () => this.hide());
    root.addEventListener('click', e => { if (e.target === root) this.hide(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !root.hidden) this.hide(); });
  }

  /**
   * highlightIds = källorna att visa (fun factens), eller en funktion som ger dem när allt har laddats.
   * Källregistret, händelsernas källor och rikenas faktarutor laddas första gången dialogen öppnas (#337);
   * under tiden står "Laddar källorna…" i dialogen.
   */
  open(highlightIds = null) {
    const token = this.opening = {};
    if (!this.prepared) {
      this.body.innerHTML = `<p class="detail-loading" role="status">${esc(ui('sources.loading'))}</p>`;
      this._reveal();
      loadForSources().then(() => {
        this.prepared = true;
        if (this.opening === token && !this.root.hidden) this.open(highlightIds);
      }).catch(err => { console.error(err); this.body.innerHTML = `<p>${esc(ui('sources.loadFailed'))}</p>`; });
      return;
    }
    if (typeof highlightIds === 'function') highlightIds = highlightIds();
    this.highlight = highlightIds;
    this.query = '';
    this.group = null;
    this.status = '';
    const { events, funfacts, polities, empireGroups = [] } = this.data;
    const empireFacts = [...empireGroups.filter(g => g.facts).map(g => g.facts), ...empireGroups.filter(g => g.vanished).map(g => g.vanished),
      ...empireGroups.filter(g => g.uncertainBorder).map(g => g.uncertainBorder)];
    const religionsDoc = this.data.religionsDoc;
    const total = doc => {
      // Religionslagrets riken: med kontrollerat år för kristnandet har de en egen källa
      const states = (doc?.polities ?? []).filter(p => p.source).map(() => ({ review: 'source-checked' }));
      const counts = { checked: 0, two: 0, draft: 0 };
      for (const x of [...events, ...funfacts, ...polities, ...empireFacts, ...states]) {
        if (x.review === 'two-sources') counts.two++;
        else if (x.review === 'source-checked') counts.checked++;
        else counts.draft++;
      }
      return ui('sources.total', { checked: counts.checked + counts.two, two: counts.two, draft: counts.draft });
    };

    this.body.innerHTML = `
      ${highlightIds ? `<p><strong>${esc(ui('sources.highlight'))}</strong> <button type="button" class="link-btn" data-all>${esc(ui('sources.showAll'))}</button></p>` : ''}
      ${this.summaryHtml()}
      <h3>${esc(ui('sources.policyTitle'))}</h3>
      <ol>
        ${[1, 2, 3, 4, 5, 6].map(n => `<li>${esc(ui(`sources.policy${n}`))}</li>`).join('')}
      </ol>
      <section class="src-urval" aria-labelledby="src-urval-title">
        <h3 id="src-urval-title">${esc(ui('sources.urval.title'))}</h3>
        <p>${esc(ui('sources.urval.p1'))}</p>
        <p>${esc(ui('sources.urval.p2'))}</p>
        <p>${esc(ui('sources.urval.p3'))}</p>
        <p>${esc(ui('sources.urval.p4'))}</p>
        <p>${esc(ui('sources.urval.p5'))}</p>
      </section>
      <h3>${esc(ui('sources.current'))}</h3>
      <p class="src-total">${total(religionsDoc)}</p>
      <h3>${esc(ui('sources.register'))}</h3>
      <p class="src-intro">${esc(ui('sources.intro'))}</p>
      <div class="src-groups" role="group" aria-label="${esc(ui('sources.groups'))}"></div>
      <div class="src-search">
        <label for="src-q">${esc(ui('sources.search'))}</label>
        <input type="search" id="src-q" autocomplete="off" spellcheck="false" placeholder="${esc(ui('sources.searchPlaceholder'))}">
      </div>
      <div class="src-search src-status">
        <label for="src-status">${esc(ui('sourcesSummary.filter'))}</label>
        <select id="src-status"></select>
      </div>
      <p class="src-hits" aria-live="polite"></p>
      <div class="src-list"></div>
      <div class="check-row">
        <input type="checkbox" id="show-drafts" ${settings.showDrafts ? 'checked' : ''}>
        <label for="show-drafts">${esc(ui('sources.showDrafts'))}</label>
      </div>
      <p class="src-version" hidden></p>`;
    this.body.querySelector('[data-all]')?.addEventListener('click', () => this.open());
    this.body.querySelector('#show-drafts').addEventListener('change', e => {
      settings.showDrafts = e.target.checked;
      this.onSettings();
    });
    this.body.querySelector('#src-q').addEventListener('input', e => { this.query = e.target.value; this.render(); });
    this.body.querySelector('#src-status').addEventListener('change', e => { this.status = e.target.value; this.render(); });
    this.body.querySelector('.src-groups').addEventListener('click', e => {
      const b = e.target.closest('[data-group]');
      if (!b) return;
      this.group = this.group === b.dataset.group ? null : b.dataset.group;
      this.render();
    });
    this.groups = collect(this.data, religionsDoc);
    this.render();
    this.showVersion();
    this._reveal();
    // Religionsdatan laddas först när den behövs; religionernas källor fylls i när den har kommit
    if (!religionsDoc) {
      loadReligions().then(doc => {
        this.data.religionsDoc ??= doc;
        if (this.root.hidden || this.highlight !== highlightIds) return;
        this.body.querySelector('.src-total').textContent = total(doc);
        this.groups = collect(this.data, doc);
        this.render();
      }).catch(err => console.error(err));
    }
  }

  /** Sammanfattningen överst (#517): två granskningsnivåer och historisk osäkerhet, som gäller oavsett nivå. */
  summaryHtml() {
    const s = { title: ui('sourcesSummary.title') };
    for (const key of ['checked', 'two', 'uncertain']) s[key] = {
      label: ui(`sourcesSummary.${key}.label`), text: ui(`sourcesSummary.${key}.text`),
    };
    s.uncertain.example = ui('sourcesSummary.uncertain.example');
    const row = (cls, r, extra = '') => `<div class="src-level ${cls}"><dt>${cls === 'src-level-uncertain' ? '' : `<i class="lv-${cls === 'src-level-two' ? 'two' : 'checked'}" aria-hidden="true"></i>`}${esc(t(r.label))}</dt><dd>${esc(t(r.text))}${extra}</dd></div>`;
    return `<section class="src-summary" aria-labelledby="src-summary-title">
      <h3 id="src-summary-title">${esc(t(s.title))}</h3>
      <dl>
        ${row('src-level-checked', s.checked)}
        ${row('src-level-two', s.two)}
        ${row('src-level-uncertain', s.uncertain, s.uncertain.example ? ` <em>${esc(t(s.uncertain.example))}</em>` : '')}
      </dl>
    </section>`;
  }

  /** Statusfiltrets val: alla, de två nivåerna och utkast bara när det finns utkast. */
  statusOptions(groups) {
    const drafts = groups.reduce((n, g) => n + g.counts.draft, 0);
    const opts = [['', ui('sourcesSummary.all')], ['checked', ui('sourcesSummary.checked.label')], ['two', ui('sourcesSummary.two.label')]];
    if (drafts || this.status === 'draft') opts.push(['draft', ui('sourcesSummary.draft')]);
    return opts;
  }

  showVersion() {
    this.versionPromise ??= loadVersion();
    this.versionPromise.then(version => {
      const row = this.body.querySelector('.src-version');
      if (!version || !row) return;
      const development = version.version.endsWith('-dev');
      row.append(`${ui('sourceVersion.version')} ${version.version}${development ? ` · ${ui('sourceVersion.development')}` : ''} · `);
      const link = document.createElement('a');
      link.href = version.releases;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = ui('sourceVersion.releases');
      row.append(link);
      row.hidden = false;
    }).catch(err => console.error('Versionsinformationen kunde inte laddas', err));
  }

  /** Visar dialogen och flyttar fokus in i den (#246); returnTo = det som hade fokus innan. */
  _reveal() {
    this.returnTo = this.root.hidden ? document.activeElement : this.returnTo;
    this.root.hidden = false;
    this.body.scrollTop = 0;
    this.root.querySelector('#sources-close')?.focus({ preventScroll: true }); // fokus in i dialogen (#246)
  }

  render() {
    const { sources } = this.data;
    const groups = GROUPS.map(g => this.groups[g.id]).filter(g => g.id !== 'other' || g.uses.size);
    const loadingReligions = !this.data.religionsDoc;
    const pick = this.highlight ? s => this.highlight.includes(s.id) : () => true;
    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    const status = LEVELS.find(l => l.key === this.status) ?? null;
    const options = this.statusOptions(groups);
    const select = this.body.querySelector('#src-status');
    if (select) {
      select.innerHTML = options.map(([v, label]) => `<option value="${v}"${v === this.status ? ' selected' : ''}>${esc(label)}</option>`).join('');
    }
    const statusLabel = status ? options.find(([v]) => v === status.key)?.[1] ?? status.label : '';

    // Gruppkorten: antal källor och hur långt granskningen har kommit
    this.body.querySelector('.src-groups').innerHTML = groups.map(g => {
      const n = sources.filter(s => g.uses.has(s.id) && pick(s)).length;
      const bar = g.reviewed
        ? `<span class="src-bar" aria-hidden="true">${LEVELS.filter(l => g.counts[l.key]).map(l =>
            `<span class="lv-${l.key}" style="flex:${g.counts[l.key]}"></span>`).join('')}</span>`
        : '';
      const nImg = this.highlight ? 0 : (g.images?.length ?? 0);
      const imgKinds = nImg ? Object.entries(g.images.reduce((m, x) => ({ ...m, [x.image.kind]: (m[x.image.kind] ?? 0) + 1 }), {}))
        .map(([k, c]) => plural(c, kindOf(k).one, kindOf(k).many)).join(', ') : '';
      const note = g.id === 'images' && nImg ? imgKinds
        : g.id === 'images' ? (this.highlight ? ui('sources.noHighlightImages') : ui('sources.noImages'))
        : g.id === 'religions' && loadingReligions ? ui('sources.loadingShort')
        : g.id === 'other' ? ui('sources.unused')
        : g.items.length ? ui('sources.noReview') : ui('sources.noItems');
      const status = g.reviewed
        ? LEVELS.filter(l => l.key !== 'draft' || g.counts.draft).map(l => `<span class="lv-txt"><i class="lv-${l.key}"></i>${g.counts[l.key]} ${l.label}</span>`).join('')
        : `<span class="lv-txt">${note}</span>`;
      return `<button type="button" class="src-group" data-group="${g.id}" aria-pressed="${this.group === g.id}">
        <span class="src-group-name">${esc(g.label)}</span>
        <span class="src-group-meta">${g.id === 'images' ? `${plural(nImg, ...ui('sources.noun.image'))}${n ? ` · ${plural(n, ...ui('sources.noun.source'))}` : ''}` : `${plural(n, ...ui('sources.noun.source'))}${g.items.length ? ` · ${plural(g.items.length, ...ui('sources.noun.claim'))}` : ''}`}</span>
        ${bar}
        <span class="src-group-status">${status}</span>
      </button>`;
    }).join('');

    // Listan: källorna i varje grupp, filtrerade på vald grupp och sökord
    const q = norm(this.query.trim());
    const shown = new Set();
    let imgShown = 0;
    const sections = groups.filter(g => !this.group || g.id === this.group).map(g => {
      const groupHit = q && norm(g.label).includes(q);
      const rows = sources.filter(s => g.uses.has(s.id) && pick(s)).map(s => {
        // Med statusfiltret (#517) visas bara källor som någon uppgift med den statusen pekar på,
        // och "Används för" visar bara de uppgifterna.
        const uses = g.uses.get(s.id).filter(u => !status || u.review === status.review).map(u => u.label);
        if (status && !uses.length) return '';
        const srcHit = !q || groupHit || [s.title, s.id, s.license].some(x => norm(x).includes(q));
        const useHits = q ? uses.filter(u => norm(u).includes(q)) : [];
        if (!srcHit && !useHits.length) return '';
        shown.add(s.id);
        return `<tr>
          <td><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>${usedBy(uses, srcHit ? null : useHits)}</td>
          <td>${esc(s.license)}</td>
          <td class="num">${esc(s.checked)}</td>
        </tr>`;
      }).filter(Boolean);
      const imgRows = this.highlight || status ? [] : (g.images ?? []).map(x => imageRow(x, sources, q, groupHit)).filter(Boolean);
      imgShown += imgRows.length;
      if (!rows.length && !imgRows.length) return '';
      const imgTable = imgRows.length ? `<h5 class="src-sub">${esc(ui('sources.imagesOnGlobe'))} <span class="src-n">${imgRows.length}</span></h5>
        <div class="src-table-wrap"><table class="src-table src-images">
          <thead><tr><th>${esc(ui('sources.event'))}</th><th>${esc(ui('sources.kind'))}</th><th>${esc(ui('sources.credit'))}</th><th>${esc(ui('sources.license'))}</th></tr></thead>
          <tbody>${imgRows.join('')}</tbody>
        </table></div>` : '';
      const srcTable = rows.length ? `${imgRows.length ? `<h5 class="src-sub">${esc(ui('sources.imageSources'))}</h5>` : ''}
        <div class="src-table-wrap"><table class="src-table">
          <thead><tr><th>${esc(ui('sources.source'))}</th><th>${esc(ui('sources.license'))}</th><th>${esc(ui('sources.checked'))}</th></tr></thead>
          <tbody>${rows.join('')}</tbody>
        </table></div>` : '';
      return `<section class="src-section" data-group="${g.id}">
        <h4>${esc(g.label)} <span class="src-n">${g.images ? imgRows.length + rows.length : rows.length}</span></h4>
        ${imgTable}${srcTable}
      </section>`;
    }).filter(Boolean);

    const all = sources.filter(pick).length;
    const where = (this.group ? ui('sources.inGroup', { group: this.groups[this.group].label }) : '')
      + (status ? ` ${ui('sourcesSummary.filtered', { status: `"${statusLabel}"` })}` : '');
    const items = [shown.size || !imgShown ? ui('sources.sourceFraction', { n: shown.size, all }) : '',
      imgShown ? plural(imgShown, ...ui('sources.noun.image')) : ''].filter(Boolean).join(ui('sources.join'));
    this.body.querySelector('.src-hits').textContent = q || this.group || status
      ? (shown.size || imgShown ? ui('sources.showing', { items, where })
        : ui('sources.noMatch', { query: q ? ui('sources.query', { query: this.query.trim() }) : '', where }))
      : `${plural(all, ...ui('sources.noun.source'))}.`;
    this.body.querySelector('.src-list').innerHTML = sections.join('');
  }

  hide() {
    this.root.hidden = true;
    // Fokus tillbaka dit den var, normalt knappen Om källorna (#246)
    const to = this.returnTo?.isConnected ? this.returnTo : this.openBtn;
    this.returnTo = null;
    to?.focus?.({ preventScroll: true });
  }
}

/** "Används för": alla användningar, eller bara de som matchar sökningen. Långa listor fälls ihop. */
function usedBy(uses, hits) {
  if (!uses.length) return '';
  if (hits) {
    const rest = uses.length - hits.length;
    return `<div class="used-by">${esc(ui('sources.usedFor'))} <mark>${hits.map(esc).join('</mark>, <mark>')}</mark>${rest ? ui('sources.moreUses', { n: rest }) : ''}</div>`;
  }
  if (uses.length <= MAX_USES) return `<div class="used-by">${esc(ui('sources.usedFor'))} ${uses.map(esc).join(', ')}</div>`;
  return `<details class="used-by"><summary>${esc(ui('sources.usedSummary', { n: uses.length, items: uses.slice(0, 3).join(', ') }))}</summary>${uses.map(esc).join(', ')}</details>`;
}

/** En rad i bildlistan: händelse, sort, kredit och licens. Prompten är hopfälld. Null om sökningen inte matchar. */
function imageRow({ event: e, image: im }, sources, q, groupHit) {
  const kind = kindOf(im.kind);
  const src = im.source ? sources.find(s => s.id === im.source) : null;
  const hay = [t(e.title), kind.label, kind.one, im.style, im.credit, im.license, im.caption ? t(im.caption) : '', im.prompt, src?.title, im.placeholder ? ui('sources.placeholder') : '', e.id];
  if (q && !groupHit && !hay.some(x => norm(x).includes(q))) return '';
  const creditHtml = src ? `<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(im.credit || src.title)}</a>` : esc(im.credit || ui('sources.unknownCredit'));
  const prompt = im.prompt ? `<details class="used-by"><summary>${esc(ui('sources.prompt'))}</summary>${esc(im.prompt)}</details>` : '';
  return `<tr>
    <td>${esc(t(e.title))}${im.placeholder ? ` <span class="src-ph">${esc(ui('sources.placeholder'))}</span>` : ''}${prompt}</td>
    <td>${esc(kind.label)}${im.kind === 'illustration' ? `<div class="used-by">${esc(ui('sources.notHistorical'))}</div>` : ''}</td>
    <td>${creditHtml}</td>
    <td>${esc(im.license || '–')}</td>
  </tr>`;
}
