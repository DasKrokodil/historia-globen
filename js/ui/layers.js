// Lagerväljaren: en meny där man slår av och på lager (händelser, fun facts, riken, religioner, dagens gränser m.m.).
// Raderna, deras grupper och startläget kommer från lagerregistret (layers/registry.js, #338, #357).
// Överst står de förinställda vyerna ur data/vyer.json (#357): en vy slår på sina lager och av de andra.
import { t } from '../model.js';
import { ui } from '../i18n.js';

async function getJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Kunde inte läsa ${path} (${res.status})`);
  return res.json();
}

/**
 * Grupperna och vyerna i Lager (data/vyer.json, #357), med namnen på sidans språk. Saknas filen blir det
 * null, och Lager visas som en lista utan grupper och vyer.
 */
export async function loadViews() {
  try {
    const doc = await getJSON('data/vyer.json');
    return {
      title: t(doc.title), custom: t(doc.custom), customize: t(doc.customize),
      panel: Object.fromEntries(Object.entries(doc.panel ?? {}).map(([id, text]) => [id, t(text)])),
      poster: Object.fromEntries(Object.entries(doc.poster ?? {}).map(([id, text]) => [id, t(text)])),
      jump: Object.fromEntries(Object.entries(doc.jump ?? {}).map(([id, text]) => [id, t(text)])),
      funfacts: Object.fromEntries(Object.entries(doc.funfacts ?? {}).map(([id, text]) => [id, t(text)])),
      focus: {
        groupByAge: t(doc.focus?.groupByAge), showAll: t(doc.focus?.showAll), showNearest: t(doc.focus?.showNearest),
        timeAges: Object.fromEntries(Object.entries(doc.focus?.timeAges ?? {}).map(([id, text]) => [id, t(text)])),
      },
      empireLegend: Object.fromEntries(Object.entries(doc.empireLegend ?? {}).map(([id, text]) => [id, t(text)])),
      uncertainty: Object.fromEntries(Object.entries(doc.uncertainty ?? {}).map(([id, text]) => [id, t(text)])),
      sourceVersion: Object.fromEntries(Object.entries(doc.sourceVersion ?? {}).map(([id, text]) => [id, t(text)])),
      // Sammanfattningen i Om källorna (#517) är nästlad; sources.js översätter fälten själv
      sourcesSummary: doc.sourcesSummary ?? null,
      // Taggarnas texter (#555): { framsteg: { label, markLabel, about, empty, none } }
      tags: Object.fromEntries(Object.entries(doc.tags ?? {}).map(([id, texts]) =>
        [id, Object.fromEntries(Object.entries(texts).map(([k, text]) => [k, t(text)]))])),
      layerActions: Object.fromEntries(Object.entries(doc.layerActions ?? {}).map(([id, text]) => [id, t(text)])),
      groups: doc.groups.map(g => ({ ...g, name: t(g.name) })),
      views: doc.views.map(v => ({ ...v, name: t(v.name) })),
    };
  } catch (err) {
    console.warn('Lagrens grupper och vyer kunde inte laddas', err);
    return null;
  }
}

export class LayerMenu {
  /**
   * views (valfritt, #357): { title, custom, views: [{ id, name, layers, tag }], controlled: [lager-id] }.
   * controlled är lagren som vyerna styr; de andra raderna (till exempel "Behåll mina lager") rörs inte.
   * En vy med tag (#555) visar bara händelser med den taggen; tagCount(tag) ger hur många händelser som har den,
   * så att vyn kan säga att den är tom.
   */
  constructor({ button, menu, views = null }) {
    Object.assign(this, { button, menu });
    this.onChange = () => {};
    this.onTag = () => {};
    this.on = {};
    this.tag = null; // taggen som vyn visar (#555), eller null
    for (const input of menu.querySelectorAll('input[data-layer]')) {
      this.on[input.dataset.layer] = input.checked;
      input.addEventListener('change', () => {
        this.on[input.dataset.layer] = input.checked;
        this.setTag(null); // ett eget val av lager lämnar vyn med taggen
        this.syncView();
        this.onChange(input.dataset.layer, input.checked);
      });
    }
    this.buildViews(views);
    // Vad uppspelningen ska pausa vid (#114). Valen sparas till nästa besök.
    this.pause = {};
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('hg-pause') || '{}'); } catch { /* utan lagring */ }
    for (const input of menu.querySelectorAll('input[data-pause]')) {
      if (input.dataset.pause in saved) input.checked = saved[input.dataset.pause];
      this.pause[input.dataset.pause] = input.checked;
      input.addEventListener('change', () => {
        this.pause[input.dataset.pause] = input.checked;
        try { localStorage.setItem('hg-pause', JSON.stringify(this.pause)); } catch { /* utan lagring */ }
      });
    }
    // Lugn rörelse (#246): följer webbläsarens prefers-reduced-motion tills man själv väljer. Valet sparas.
    this.onCalm = () => {};
    const calmInput = menu.querySelector('input[data-calm]');
    this.calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    try { const s = localStorage.getItem('hg-calm'); if (s !== null) this.calm = s === '1'; } catch { /* utan lagring */ }
    const applyCalm = () => { document.documentElement.classList.toggle('calm', this.calm); this.onCalm(this.calm); };
    if (calmInput) {
      calmInput.checked = this.calm;
      calmInput.addEventListener('change', () => {
        this.calm = calmInput.checked;
        try { localStorage.setItem('hg-calm', this.calm ? '1' : '0'); } catch { /* utan lagring */ }
        applyCalm();
      });
    }
    document.documentElement.classList.toggle('calm', this.calm);
    this.onOpen = () => {};
    button.addEventListener('click', () => (menu.hidden ? this.open() : this.close()));
    document.addEventListener('pointerdown', e => {
      if (!menu.hidden && !menu.contains(e.target) && !button.contains(e.target)) this.close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { this.close(); button.focus(); } });
  }

  /** Sätter ett lager av eller på utifrån, till exempel "keep" från teckenförklaringen (#235). */
  set(name, on) {
    const input = this.menu.querySelector(`input[data-layer="${name}"]`);
    if (input) input.checked = on;
    this.on[name] = on;
    if (this.views?.controlled.includes(name)) this.setTag(null);
    this.syncView();
  }

  /** Taggen som händelserna filtreras på (#555), eller null. onTag anropas när den ändras. */
  setTag(tag) {
    tag ??= null;
    if (this.tag === tag) return;
    this.tag = tag;
    this.onTag(tag);
  }

  /**
   * De förinställda vyerna överst i menyn (#357, #380): en knapp per vy, och märket "Anpassad" när valen
   * inte stämmer med någon vy. Alla enskilda val ligger på nivå två bakom "Anpassa själv".
   * Knapparna nås med Tab och väljs med Enter eller mellanslag.
   */
  buildViews(views) {
    this.views = views?.views?.length ? views : null;
    if (!this.views) return;
    const box = document.createElement('div');
    box.className = 'layer-views';
    box.setAttribute('role', 'group');
    const head = document.createElement('div');
    head.className = 'layer-heading first'; head.id = 'layer-views-title'; head.textContent = views.title;
    box.setAttribute('aria-labelledby', head.id);
    const row = document.createElement('div');
    row.className = 'view-chips';
    this.viewBtns = views.views.map(v => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'view-chip'; btn.dataset.view = v.id;
      btn.textContent = v.name;
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', () => this.applyView(v.id));
      row.append(btn);
      return btn;
    });
    // Anpassad är inget man väljer, bara ett besked om att lagren har valts för hand
    this.customChip = document.createElement('span');
    this.customChip.className = 'view-chip view-custom';
    this.customChip.textContent = views.custom;
    row.append(this.customChip);
    this.customBtn = document.createElement('button');
    this.customBtn.type = 'button'; this.customBtn.className = 'layer-customize';
    this.customBtn.id = 'layer-customize'; this.customBtn.setAttribute('aria-controls', 'layer-custom');
    this.customBtn.append(document.createTextNode(views.customize));
    const chev = document.createElement('span');
    chev.className = 'layer-customize-chev'; chev.setAttribute('aria-hidden', 'true');
    this.customBtn.append(chev);
    this.customBox = document.createElement('div');
    this.customBox.className = 'layer-custom'; this.customBox.id = 'layer-custom';
    while (this.menu.firstChild) this.customBox.append(this.menu.firstChild);
    this.addLayerActions(views);
    let customOpen = false;
    try { customOpen = sessionStorage.getItem('hg-layer-customize') === '1'; } catch { /* utan lagring */ }
    this.customBtn.addEventListener('click', () => this.setCustomOpen(this.customBox.hidden));
    // Besked när en vy med tagg inte har några händelser ännu (#555)
    this.viewStatus = document.createElement('p');
    this.viewStatus.className = 'layer-view-status';
    this.viewStatus.setAttribute('role', 'status');
    this.viewStatus.hidden = true;
    box.append(head, row, this.viewStatus, this.customBtn);
    this.menu.append(box, this.customBox);
    this.setCustomOpen(customOpen, false);
    this.syncView();
  }

  /** Snabbvalen stänger alla kontrollerade lager eller återgår till Standard. */
  addLayerActions(views) {
    const labels = views.layerActions;
    if (!labels) return;
    const actions = document.createElement('div');
    actions.className = 'layer-actions';
    const disable = document.createElement('button');
    disable.type = 'button';
    disable.className = 'layer-action';
    disable.textContent = labels.disableAll;
    disable.setAttribute('aria-label', labels.disableAllLabel);
    disable.addEventListener('click', () => this.applyView('bara-kartan'));
    const restore = document.createElement('button');
    restore.type = 'button';
    restore.className = 'layer-action';
    restore.textContent = labels.restore;
    restore.setAttribute('aria-label', labels.restoreLabel);
    restore.addEventListener('click', () => this.applyView('standard'));
    this.actionStatus = document.createElement('p');
    this.actionStatus.className = 'layer-action-status';
    this.actionStatus.setAttribute('role', 'status');
    this.actionStatus.setAttribute('aria-live', 'polite');
    actions.append(disable, restore, this.actionStatus);
    this.customBox.prepend(actions);
  }

  /** Visar eller döljer de enskilda lagren och minns nivån under den här flikens besök (#380). */
  setCustomOpen(open, save = true) {
    if (!this.customBox) return;
    this.customBox.hidden = !open;
    this.customBtn.setAttribute('aria-expanded', String(open));
    if (save) {
      try { sessionStorage.setItem('hg-layer-customize', open ? '1' : '0'); } catch { /* utan lagring */ }
    }
  }

  /** Vyn som stämmer med valen just nu, eller null (Anpassad). */
  currentView() {
    if (!this.views) return null;
    const ids = this.views.controlled;
    return this.views.views.find(v => (v.tag ?? null) === this.tag && ids.every(id => !!this.on[id] === v.layers.includes(id)))?.id ?? null;
  }

  /** Slår på vyns lager och av de andra som vyerna styr; onChange anropas för varje lager som ändras. */
  applyView(id) {
    const view = this.views?.views.find(v => v.id === id);
    if (!view) return;
    const changed = [];
    for (const name of this.views.controlled) {
      const on = view.layers.includes(name);
      if (!!this.on[name] === on) continue;
      const input = this.menu.querySelector(`input[data-layer="${name}"]`);
      if (input) input.checked = on;
      this.on[name] = on;
      changed.push([name, on]);
    }
    const tagChanged = (view.tag ?? null) !== this.tag;
    this.tag = view.tag ?? null;
    this.syncView();
    if (id === 'standard' && this.actionStatus) this.actionStatus.textContent = this.views.layerActions.standardRestored;
    if (tagChanged) this.onTag(this.tag);
    for (const [name, on] of changed) this.onChange(name, on);
  }

  /** Markerar vyn som stämmer, eller visar Anpassad. */
  syncView() {
    if (!this.views) return;
    const cur = this.currentView();
    for (const btn of this.viewBtns) btn.setAttribute('aria-pressed', String(btn.dataset.view === cur));
    this.customChip.hidden = cur !== null;
    this.menu.dataset.view = cur ?? 'custom';
    const empty = this.tag && !(this.views.tagCount?.(this.tag) > 0) ? this.views.tags?.[this.tag]?.empty : '';
    this.viewStatus.textContent = empty || '';
    this.viewStatus.hidden = !empty;
    if (this.actionStatus) {
      this.actionStatus.textContent = cur === 'bara-kartan' ? this.views.layerActions.allOff : '';
    }
  }

  /**
   * Undermeny med en rad per religion, byggd från datan. Raden visar religionens
   * färg, så att undermenyn också fungerar som förklaring. onToggle(id, på).
   * Rader med info (religioner med faktaruta, #90) får en knapp som anropar onInfo(id).
   */
  sublist(container, items, onToggle, onInfo = () => {}) {
    for (const it of items) {
      const label = document.createElement('label');
      label.className = 'layer-row layer-subrow';
      label.dataset.religion = it.id; // pekar man på raden lyser religionens områden upp (#271)
      const input = document.createElement('input');
      input.type = 'checkbox'; input.checked = true;
      input.addEventListener('change', () => onToggle(it.id, input.checked));
      const sw = document.createElement('span');
      sw.className = 'swatch'; sw.style.background = it.color;
      label.append(input, sw);
      // Religionens symbol bredvid färgen (#271)
      if (it.symbol) {
        const img = document.createElement('img');
        img.className = 'rel-sym'; img.src = it.symbol; img.alt = ''; img.width = img.height = 16;
        label.append(img);
      }
      label.append(document.createTextNode(it.name));
      if (it.info) {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'info-btn';
        btn.textContent = ui('focus.facts');
        btn.setAttribute('aria-label', ui('layer.factsAbout', { name: it.name }));
        btn.addEventListener('click', ev => { ev.preventDefault(); this.close(); onInfo(it.id); });
        label.append(btn);
      }
      container.append(label);
    }
  }

  open() {
    // Menyn läggs under knappen, som kan hamna på olika rader i smal skärm
    const r = (this.button.closest('.top-actions') ?? this.button).getBoundingClientRect();
    this.menu.style.top = `${r.bottom + 8}px`;
    this.menu.style.maxHeight = `calc(100dvh - ${r.bottom + 24}px)`; // lång meny rullar i stället
    this.menu.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
    this.onOpen();
    this.menu.querySelector('input,button')?.focus({ preventScroll: true }); // fokus in i menyn (#246)
  }
  close() {
    const had = this.menu.contains(document.activeElement);
    this.menu.hidden = true;
    if (had) this.button.focus(); // tillbaka till knappen (#246)
    this.button.setAttribute('aria-expanded', 'false');
  }
}
