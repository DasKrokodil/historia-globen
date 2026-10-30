// "Om källorna": källpolicy och källregistret från data/sources.json.
// Källorna grupperas efter vad de används till (#141). Grupperna räknas fram ur datan:
// vilka händelser, fun facts, riken, religioner, kartlager och bilder som pekar på varje källa.
import { t, settings, loadReligions } from '../model.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Sökningen bryr sig inte om stora bokstäver eller accenter (å, ä, ö räknas som a, a, o)
const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const short = (s, n = 70) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

const GROUPS = [
  { id: 'events', label: 'Händelser och fun facts' },
  { id: 'empires', label: 'Riken' },
  { id: 'religions', label: 'Religioner' },
  { id: 'maps', label: 'Kartdata' },
  { id: 'images', label: 'Bilder' },
  { id: 'other', label: 'Övriga källor' },
];
const LEVELS = [
  { key: 'checked', review: 'source-checked', label: 'källkontrollerade' },
  { key: 'two', review: 'two-sources', label: 'två källor' },
  { key: 'draft', review: 'draft', label: 'utkast' },
];
const KINDS = {
  illustration: { one: 'illustration', many: 'illustrationer', label: 'Illustration' },
  historisk: { one: 'historisk bild', many: 'historiska bilder', label: 'Historisk bild' },
};
const kindOf = k => KINDS[k] ?? { one: String(k ?? 'bild'), many: String(k ?? 'bilder'), label: String(k ?? 'Bild') };
const MAX_USES = 8;   // fler användningar än så fälls ihop

/** Räknar fram vilka uppgifter som pekar på varje källa, grupp för grupp. */
function collect({ sources, events, funfacts, polities, empireGroups = [], land, borders }, religionsDoc) {
  const groups = Object.fromEntries(GROUPS.map(g => [g.id, { ...g, uses: new Map(), items: [] }]));
  const add = (gid, ids, label, review, item = true) => {
    const g = groups[gid];
    if (item) g.items.push({ label, review });
    for (const id of new Set(ids)) {
      if (!g.uses.has(id)) g.uses.set(id, []);
      g.uses.get(id).push(label);
    }
  };
  for (const e of events) add('events', [...(e.sources ?? []), ...(e.story?.sources ?? [])], t(e.title), e.review);
  for (const f of funfacts) add('events', f.sources ?? [], `Fun fact: ${short(t(f.text))}`, f.review);
  for (const p of polities) add('empires', p.sources ?? [], t(p.name), p.review);
  // Faktarutan om riket (#170) och dess nyckelår
  for (const g of empireGroups) {
    if (!g.facts) continue;
    add('empires', g.facts.sources ?? [], `${t(g.name)}: faktarutan`, g.facts.review);
    for (const m of g.facts.milestones ?? []) add('empires', m.sources ?? [], `${t(g.name)}: ${t(m.label)}`, g.facts.review);
  }
  if (religionsDoc) {
    const rp = religionsDoc.polities ?? [];
    // Riken med kontrollerat år för kristnandet har en egen källa
    for (const p of rp.filter(p => p.source)) add('religions', [p.source], `${p.name} (kristnandet)`, 'source-checked');
    // Källor för hela religionsfilen (se notes i data/religions.json): de räknas inte som egna uppgifter
    const whole = (id, label) => add('religions', [id], label, null, false);
    if (rp.length) whole('cliopatria', 'Religioner: områdena följer rikenas gränser i Cliopatria');
    if (rp.some(p => p.wikipedia)) whole('wikipedia-religion', 'Religioner: varje rikes religion (faktarutan på Wikipedia)');
    if (rp.some(p => p.modern)) whole('wp-religion-by-country', 'Religioner: nutida länder från 1900');
    // Faktarutan om religionen (#90) och dess nyckelår
    for (const r of religionsDoc.religions ?? []) {
      if (!r.facts) continue;
      add('religions', r.facts.sources ?? [], `${t(r.name)}: faktarutan`, r.facts.review);
      for (const m of r.facts.milestones ?? []) add('religions', m.sources ?? [], `${t(r.name)}: ${t(m.label)}`, r.facts.review);
    }
  }
  if (land?.source) add('maps', [land.source], 'Grundkartan', null);
  if (borders?.source) add('maps', [borders.source], 'Dagens gränser', null);
  // Bilder (#195): varje bild på globen listas med ursprung och licens, även illustrationer utan extern källa.
  // De räknas inte som uppgifter med granskningsnivå; bara historiska bilder med image.source får en post i källtabellen.
  const shownEvents = events.filter(e => e.image && (settings.showDrafts || e.review !== 'draft'));
  groups.images.images = shownEvents.map(e => ({ event: e, image: e.image }));
  for (const e of shownEvents) if (e.image.source) add('images', [e.image.source], `Bild: ${t(e.title)}`, null, false);
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
    this.onSettings = () => {};
    this.query = '';
    this.group = null;
    openBtn.addEventListener('click', () => this.open());
    close.addEventListener('click', () => this.hide());
    root.addEventListener('click', e => { if (e.target === root) this.hide(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !root.hidden) this.hide(); });
  }

  open(highlightIds = null) {
    this.highlight = highlightIds;
    this.query = '';
    this.group = null;
    const { events, funfacts, polities, empireGroups = [] } = this.data;
    const empireFacts = empireGroups.filter(g => g.facts).map(g => g.facts);
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
      return `${counts.checked + counts.two} uppgifter har kontrollerad källa, och för ${counts.two} av dem stämmer också en andra källa. ${counts.draft} är utkast.`;
    };

    this.body.innerHTML = `
      ${highlightIds ? '<p><strong>Källor för den här fun facten.</strong> <button type="button" class="link-btn" data-all>Visa alla källor</button></p>' : ''}
      <h3>Källpolicy</h3>
      <ol>
        <li>Varje uppgift har minst en källa, med länk och datum då den kontrollerades.</li>
        <li>Varje uppgift har en granskningsstatus: utkast, källkontrollerad eller två källor stämmer. Utkast visas inte.</li>
        <li>"Två källor stämmer" betyder att årtal och plats har jämförts med en andra, oberoende källa, till exempel Wikidata, och att de stämmer.</li>
        <li>Uppgifter som Claude föreslår är utkast tills källan är öppnad och stämmer.</li>
        <li>Osäkerhet visas öppet, till exempel "cirka" eller ett spann. Om källorna är oense står det i faktarutan.</li>
        <li>En fun fact som jämför två saker har källa för båda leden.</li>
      </ol>
      <h3>Läget just nu</h3>
      <p class="src-total">${total(religionsDoc)}</p>
      <h3>Källregister</h3>
      <p class="src-intro">Källorna är grupperade efter vad de används till, och en källa kan höra till flera grupper. Tryck på en grupp för att bara visa den, eller sök.</p>
      <div class="src-groups" role="group" aria-label="Grupper"></div>
      <div class="src-search">
        <label for="src-q">Sök</label>
        <input type="search" id="src-q" autocomplete="off" spellcheck="false" placeholder="Källa eller vad den används till">
      </div>
      <p class="src-hits" aria-live="polite"></p>
      <div class="src-list"></div>
      <div class="check-row">
        <input type="checkbox" id="show-drafts" ${settings.showDrafts ? 'checked' : ''}>
        <label for="show-drafts">Visa även utkast (för den som kontrollerar källor)</label>
      </div>`;
    this.body.querySelector('[data-all]')?.addEventListener('click', () => this.open());
    this.body.querySelector('#show-drafts').addEventListener('change', e => {
      settings.showDrafts = e.target.checked;
      this.onSettings();
    });
    this.body.querySelector('#src-q').addEventListener('input', e => { this.query = e.target.value; this.render(); });
    this.body.querySelector('.src-groups').addEventListener('click', e => {
      const b = e.target.closest('[data-group]');
      if (!b) return;
      this.group = this.group === b.dataset.group ? null : b.dataset.group;
      this.render();
    });
    this.groups = collect(this.data, religionsDoc);
    this.render();
    this.returnTo = this.root.hidden ? document.activeElement : this.returnTo;
    this.root.hidden = false;
    this.body.scrollTop = 0;
    this.root.querySelector('#sources-close')?.focus({ preventScroll: true }); // fokus in i dialogen (#246)
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

  render() {
    const { sources } = this.data;
    const groups = GROUPS.map(g => this.groups[g.id]).filter(g => g.id !== 'other' || g.uses.size);
    const loadingReligions = !this.data.religionsDoc;
    const pick = this.highlight ? s => this.highlight.includes(s.id) : () => true;
    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

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
        : g.id === 'images' ? (this.highlight ? 'Inga för den här fun facten' : 'Inga bilder ännu')
        : g.id === 'religions' && loadingReligions ? 'Laddar…'
        : g.id === 'other' ? 'Används inte av någon uppgift just nu'
        : g.items.length ? 'Ingen granskningsnivå per uppgift' : 'Inga uppgifter ännu';
      const status = g.reviewed
        ? LEVELS.filter(l => l.key !== 'draft' || g.counts.draft).map(l => `<span class="lv-txt"><i class="lv-${l.key}"></i>${g.counts[l.key]} ${l.label}</span>`).join('')
        : `<span class="lv-txt">${note}</span>`;
      return `<button type="button" class="src-group" data-group="${g.id}" aria-pressed="${this.group === g.id}">
        <span class="src-group-name">${esc(g.label)}</span>
        <span class="src-group-meta">${g.id === 'images' ? `${plural(nImg, 'bild', 'bilder')}${n ? ` · ${plural(n, 'källa', 'källor')}` : ''}` : `${plural(n, 'källa', 'källor')}${g.items.length ? ` · ${plural(g.items.length, 'uppgift', 'uppgifter')}` : ''}`}</span>
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
        const uses = g.uses.get(s.id);
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
      const imgRows = this.highlight ? [] : (g.images ?? []).map(x => imageRow(x, sources, q, groupHit)).filter(Boolean);
      imgShown += imgRows.length;
      if (!rows.length && !imgRows.length) return '';
      const imgTable = imgRows.length ? `<h5 class="src-sub">Bilder på globen <span class="src-n">${imgRows.length}</span></h5>
        <div class="src-table-wrap"><table class="src-table src-images">
          <thead><tr><th>Händelse</th><th>Sort</th><th>Kredit</th><th>Licens</th></tr></thead>
          <tbody>${imgRows.join('')}</tbody>
        </table></div>` : '';
      const srcTable = rows.length ? `${imgRows.length ? '<h5 class="src-sub">Källor för historiska bilder</h5>' : ''}
        <div class="src-table-wrap"><table class="src-table">
          <thead><tr><th>Källa</th><th>Licens</th><th>Kontrollerad</th></tr></thead>
          <tbody>${rows.join('')}</tbody>
        </table></div>` : '';
      return `<section class="src-section" data-group="${g.id}">
        <h4>${esc(g.label)} <span class="src-n">${g.images ? imgRows.length + rows.length : rows.length}</span></h4>
        ${imgTable}${srcTable}
      </section>`;
    }).filter(Boolean);

    const all = sources.filter(pick).length;
    const where = this.group ? ` i ${this.groups[this.group].label}` : '';
    this.body.querySelector('.src-hits').textContent = q || this.group
      ? (shown.size || imgShown ? `Visar ${[shown.size || !imgShown ? `${shown.size} av ${all} källor` : '', imgShown ? `${imgShown} ${imgShown === 1 ? 'bild' : 'bilder'}` : ''].filter(Boolean).join(' och ')}${where}.` : `Ingen källa matchar${q ? ` "${this.query.trim()}"` : ''}${where}.`)
      : `${all} källor.`;
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
    return `<div class="used-by">Används för: <mark>${hits.map(esc).join('</mark>, <mark>')}</mark>${rest ? ` (och ${rest} till)` : ''}</div>`;
  }
  if (uses.length <= MAX_USES) return `<div class="used-by">Används för: ${uses.map(esc).join(', ')}</div>`;
  return `<details class="used-by"><summary>Används för ${uses.length} uppgifter: ${uses.slice(0, 3).map(esc).join(', ')} …</summary>${uses.map(esc).join(', ')}</details>`;
}

/** En rad i bildlistan: händelse, sort, kredit och licens. Prompten är hopfälld. Null om sökningen inte matchar. */
function imageRow({ event: e, image: im }, sources, q, groupHit) {
  const kind = kindOf(im.kind);
  const src = im.source ? sources.find(s => s.id === im.source) : null;
  const hay = [t(e.title), kind.label, kind.one, im.style, im.credit, im.license, im.caption ? t(im.caption) : '', im.prompt, src?.title, im.placeholder ? 'platshållare' : '', e.id];
  if (q && !groupHit && !hay.some(x => norm(x).includes(q))) return '';
  const creditHtml = src ? `<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(im.credit || src.title)}</a>` : esc(im.credit || 'Okänt ursprung');
  const prompt = im.prompt ? `<details class="used-by"><summary>Prompt</summary>${esc(im.prompt)}</details>` : '';
  return `<tr>
    <td>${esc(t(e.title))}${im.placeholder ? ' <span class="src-ph">Platshållare</span>' : ''}${prompt}</td>
    <td>${esc(kind.label)}${im.kind === 'illustration' ? '<div class="used-by">Inte en historisk bild</div>' : ''}</td>
    <td>${creditHtml}</td>
    <td>${esc(im.license || '–')}</td>
  </tr>`;
}
