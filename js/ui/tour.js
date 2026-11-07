// Guidade turer (#47, Rikards beslut 2026-11-01): en tur är data i data/turer/<id>.json, och den här modulen
// spelar upp den. Turen är inget lager i registret och ritar inget eget; den styr det som redan finns:
// - året på tidslinjen (Timeline äger året, CLAUDE.md punkt 3) och pausen med Timeline.pause,
// - kameran på globen (flyTo och zoom) och samma mitt i Platt vy,
// - lagren via Lager (LayerMenu.set och onChange), så att state.js och lagerregistret räknar fram vad som syns,
// - faktarutan för en befintlig händelse (select).
// Fortsätt och spelknappen går till nästa steg. Ligger nästa steg nära i tiden spelas tiden fram dit och pausar;
// annars hoppar tidslinjen. Avsluta återställer besökarens lager, fokus och kamera och lämnar året där turen var.
import { t, isVisibleReview } from '../model.js';
import { tourProblems } from '../tour-format.js';
import { printLesson } from './print-sheet.js';
import { ui } from '../i18n.js';

/** Längsta tid (sekunder) som uppspelningen får ta mellan två steg; längre avstånd blir ett hopp. */
const PLAY_SECONDS = 4;

async function getJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Kunde inte läsa ${path} (${res.status})`);
  return res.json();
}

/** Registret data/turer/index.json och turerna det listar. En tur som inte går att läsa hoppas över. */
export async function loadTours() {
  try {
    const index = await getJSON('data/turer/index.json');
    const tours = await Promise.all((index.tours ?? []).map(id => getJSON(`data/turer/${id}.json`).catch(err => {
      console.warn(`Turen ${id} kunde inte laddas`, err);
      return null;
    })));
    return { labels: index.labels ?? {}, tours: tours.filter(Boolean) };
  } catch (err) {
    console.warn('Turerna kunde inte laddas', err);
    return { labels: {}, tours: [] };
  }
}

const fill = (text, values) => Object.entries(values).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), text);

export class TourPlayer {
  /**
   * els: knappen, menyn, listan och kortets delar (index.html).
   * data: { labels, tours } från loadTours.
   * app: det som turen styr, se main.js (timeline, globe, flatMap, layers, controlled, select, mark, focusKey,
   *      startFocus, endFocus, openSources, events, layerIds, narrow, root).
   */
  constructor(els, data, app) {
    Object.assign(this, els, { app, labels: data.labels ?? {} });
    const known = { events: new Set(Object.keys(app.events)), layers: app.layerIds, empires: app.empires };
    // Bara hela turer som har passerat källkontrollen visas (draft visas aldrig, källpolicyn)
    this.tours = (data.tours ?? []).filter(tour => {
      const problems = tourProblems(tour, known);
      for (const p of problems) console.warn(p);
      return !problems.length && isVisibleReview(tour.review);
    });
    this.tour = null; this.index = 0; this.target = null; this.saved = null; this.opener = null;
    this.button.hidden = !this.tours.length;
    if (!this.tours.length) return;

    const label = key => t(this.labels[key]) || '';
    this.button.textContent = label('button') || 'Turer';
    this.menuTitle.textContent = label('menuTitle');
    this.back.textContent = `← ${label('back')}`;
    this.closeBtn.setAttribute('aria-label', label('end'));
    this.closeBtn.title = label('end');
    // Avsluta bredvid Nästa i kortet och bredvid Fortsätt i pausraden, så att det syns hur man kommer ur turen
    for (const b of [this.endBtn, this.pauseStop]) if (b) b.textContent = label('end');
    this.read.textContent = label('read');
    this.srcBtn.textContent = label('sources');
    this.questionLabel.textContent = label('question') || 'Att fundera på:';
    this.buildMenu();

    this.button.addEventListener('click', () => (this.menu.hidden ? this.openMenu() : this.closeMenu()));
    document.addEventListener('pointerdown', e => {
      if (!this.menu.hidden && !this.menu.contains(e.target) && !this.button.contains(e.target)) this.closeMenu();
    });
    this.menu.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); this.closeMenu(); } });
    this.back.addEventListener('click', () => this.go(this.index - 1));
    this.next.addEventListener('click', () => (this.last ? this.end() : this.go(this.index + 1)));
    this.closeBtn.addEventListener('click', () => this.end());
    this.endBtn?.addEventListener('click', () => this.end());
    this.pauseStop?.addEventListener('click', () => this.end());
    this.read.addEventListener('click', () => { const id = this.step?.open; if (id) app.select(id, false); });
    this.srcBtn.addEventListener('click', () => { const ids = this.step?.sources ?? []; app.openSources(ids); });
    // Skriv ut (#738): bara i en lektionstur, alltså en tur med lärarfält (lesson, #737)
    if (this.printBtn) {
      this.printBtn.textContent = ui('print.button');
      this.printBtn.addEventListener('click', () => printLesson(this.tour, app.printRoot));
    }
    // Escape i en lektion avslutar inte turen: utgången är "Visa hela globen" i bandet (#795)
    this.card.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); if (!app.lesson?.active) this.end(); } });

    const { timeline } = app;
    // Fortsätt i pausraden och spelknappen: nästa steg. Är det nära i tiden spelas tiden fram dit (change nedan).
    timeline.addEventListener('beforeplay', e => {
      if (!this.tour || this.last) return;
      const next = this.tour.steps[this.index + 1];
      const gap = next.at - timeline.year;
      if (gap > 0 && gap / timeline.yearsPerSecond <= PLAY_SECONDS) { this.target = this.index + 1; return; }
      e.preventDefault();
      this.go(this.index + 1);
    });
    timeline.addEventListener('change', () => {
      if (!this.tour || this.target == null || !timeline.playing) return;
      if (timeline.year >= this.tour.steps[this.target].at) this.go(this.target);
    });
    // Ett tidigare steg eller fler pauser: spelknappen ska heta Fortsätt så länge turen har fler steg
    const hasMore = timeline.hasMore;
    timeline.hasMore = () => (this.tour && !this.last) || hasMore();
  }

  /** Turen som berättar om kriget med id (fältet war), eller null (#247). */
  forWar(id) { return this.tours?.find(x => x.war === id) ?? null; }
  /** Turen som följer rikets fall (fältet empire, #499), eller null. */
  forEmpire(id) { return this.tours?.find(x => x.empire === id) ?? null; }
  /** Knappens text i krigets första kort, ur data/turer/index.json (labels.story). */
  storyLabel(tour, key = 'story') { return fill(t(this.labels[key]) || '{title}', { title: t(tour.title), total: tour.steps.length }); }

  get step() { return this.tour?.steps[this.index] ?? null; }
  get last() { return !!this.tour && this.index >= this.tour.steps.length - 1; }
  get active() { return !!this.tour; }

  buildMenu() {
    this.list.replaceChildren(...this.tours.map(tour => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tour-pick'; b.dataset.tour = tour.id;
      const name = document.createElement('span'); name.className = 'tour-pick-title'; name.textContent = t(tour.title);
      const meta = document.createElement('span'); meta.className = 'tour-pick-meta';
      meta.textContent = t(tour.summary);
      meta.hidden = !tour.summary;
      b.append(name, meta);
      b.addEventListener('click', () => { this.closeMenu(false); this.start(tour.id, this.button); });
      li.append(b);
      return li;
    }));
  }

  openMenu() {
    const r = (this.button.closest('.top-actions') ?? this.button).getBoundingClientRect();
    this.menu.style.top = `${r.bottom + 8}px`;
    this.menu.style.maxHeight = `calc(100dvh - ${r.bottom + 24}px)`;
    this.menu.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
    this.onOpen?.();
    this.menu.querySelector('.tour-pick')?.focus({ preventScroll: true });
  }

  closeMenu(refocus = true) {
    if (this.menu.hidden) return;
    const had = this.menu.contains(document.activeElement);
    this.menu.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
    if (had && refocus) this.button.focus({ preventScroll: true });
  }

  /** Var turen är: { id, step } (stegets id) eller null. Adressen skriver det som t och s (#736). */
  get position() { return this.tour ? { id: this.tour.id, step: this.step?.id ?? null } : null; }

  /** Stegets plats i turen (0 när id saknas eller inte finns). */
  stepIndex(stepId) { return Math.max(0, this.tour?.steps.findIndex(x => x.id === stepId) ?? 0); }

  /**
   * Startar turen med id, vid steget stepId om det finns (en länk med t och s, #736), annars vid första steget.
   * Besökarens lager, fokus och kamera sparas, så att Avsluta kan återställa dem. Ger false för en okänd tur.
   */
  start(id, opener = null, stepId = null) {
    const tour = this.tours.find(x => x.id === id);
    if (!tour) return false;
    const { app } = this;
    if (!this.tour) {
      this.saved = { layers: Object.fromEntries(app.controlled.map(l => [l, !!app.layers.on[l]])), focus: app.focusKey(), camera: app.globe.view };
    }
    if (app.focusKey()) app.endFocus(false);
    this.tour = tour; this.opener = opener; this.target = null;
    this.name.textContent = t(tour.title);
    this.card.hidden = false;
    app.root.classList.add('touring');
    this.go(this.stepIndex(stepId));
    requestAnimationFrame(() => this.next.focus({ preventScroll: true }));
    return true;
  }

  /** Visar steg i: året, kameran, lagren och faktarutan, och pausar tidslinjen med turens namn. */
  go(i) {
    if (!this.tour) return;
    const { app } = this, { timeline, globe, flatMap } = app;
    this.index = Math.max(0, Math.min(i, this.tour.steps.length - 1));
    this.target = null;
    const step = this.step;
    timeline.pause();
    this.setLayers(app.lesson?.layers ?? step.layers); // en lektion kan låsa lagren för hela turen (#795)
    timeline.year = step.at;
    // Faktarutan först (den flyttar kameran till händelsen), sedan stegets egen kamera
    // I smal skärm markeras händelsen bara på globen (krigets händelser syns annars inte utzoomat), och
    // faktarutan öppnas med "Läs om händelsen", så att arket inte täcker kortet
    if (step.open && !app.narrow.matches) app.select(step.open, false);
    else if (step.open) app.mark(step.open);
    else app.select(null, false);
    globe.flyTo(step.camera.lat, step.camera.lon);
    globe.setZoom(step.camera.zoom);
    flatMap.setView?.(step.camera.lat, step.camera.lon, step.camera.zoom);
    this.lift();

    const n = this.tour.steps.length;
    this.progress.textContent = fill(t(this.labels.step), { current: this.index + 1, total: n });
    this.title.textContent = t(step.title);
    this.title.hidden = !step.title;
    this.text.textContent = t(step.text);
    // Berättelseläget (#247): kapitlet ovanför rubriken och en fråga att fundera på under texten
    this.chapter.textContent = t(step.chapter);
    this.chapter.hidden = !step.chapter;
    this.questionText.textContent = t(step.question);
    this.question.hidden = !step.question;
    // Vad källorna säger om steget (#499), med samma ord som slutkortet (#500)
    this.status.textContent = step.status ? t(this.labels[`status-${step.status}`]) : '';
    this.status.className = `tour-status${step.status ? ` takeaway-${step.status}` : ''}`;
    this.status.hidden = !step.status;
    this.read.hidden = !step.open;
    if (this.printBtn) this.printBtn.hidden = !this.tour.lesson;
    this.back.hidden = this.index === 0;
    if (this.endBtn) this.endBtn.hidden = this.last; // sista steget: Klar avslutar
    if (this.pauseStop) this.pauseStop.hidden = false;
    this.next.textContent = this.last ? t(this.labels.done) : `${t(this.labels.next)} →`;
    // I en lektion står slutkortet kvar efter sista steget; utgången är "Visa hela globen" i bandet (#795)
    const stay = this.last && !!app.lesson?.active;
    if (stay && document.activeElement === this.next) this.back.focus({ preventScroll: true });
    this.next.hidden = stay;
    app.lesson?.renderEnd(this.last);
    // Pausraden visar turen och läses upp; Fortsätt där går till nästa steg (beforeplay ovan)
    const note = fill(t(this.labels.paused), { title: t(this.tour.title) });
    const say = [this.progress.textContent, t(step.chapter), t(step.title), this.status.hidden ? '' : this.status.textContent, t(step.text), t(step.question)].filter(Boolean).join('. ');
    if (this.last) timeline.pause();
    else timeline.pause(note, true, say);
  }

  /** Smal skärm: kortet täcker globens nedre del, så klotet lyfts och stegets plats hamnar mitt i den fria ytan
   *  mellan raden överst och kortet (samma lyft som faktarutan som ark, main.js). */
  lift() {
    const { globe, narrow } = this.app;
    requestAnimationFrame(() => {
      if (!this.tour || !narrow.matches) return globe.setViewLift(0);
      const top = document.querySelector('.top-actions')?.getBoundingClientRect().bottom ?? 0;
      const cardTop = this.card.getBoundingClientRect().top;
      globe.setViewLift(Math.max(0, globe.centerY() - (top + cardTop) / 2));
    });
  }

  /** Slår på stegets lager och av de andra som vyerna styr, genom Lager (samma väg som när besökaren väljer). */
  setLayers(wanted) {
    const { layers, controlled } = this.app;
    for (const id of controlled) {
      const on = wanted.includes(id);
      if (!!layers.on[id] === on) continue;
      layers.set(id, on);
      layers.onChange(id, on);
    }
  }

  /** Avslutar turen: lagren, fokus och kameran blir som innan, och året står kvar där turen var. */
  end() {
    if (!this.tour) return;
    const { app } = this, saved = this.saved;
    app.lesson?.leave(); // en tur som slutar tar lektionsläget med sig (#795)
    this.next.hidden = false;
    this.tour = null; this.target = null; this.saved = null;
    this.card.hidden = true;
    if (this.pauseStop) this.pauseStop.hidden = true;
    app.root.classList.remove('touring');
    app.globe.setViewLift(0);
    app.timeline.pause();
    app.select(null, false);
    if (saved) {
      for (const [id, on] of Object.entries(saved.layers)) {
        if (!!app.layers.on[id] === on) continue;
        app.layers.set(id, on);
        app.layers.onChange(id, on);
      }
      if (saved.focus) app.startFocus(saved.focus);
      if (saved.camera) { app.globe.flyTo(saved.camera.lat, saved.camera.lon); app.globe.setZoom(saved.camera.zoom); }
    }
    const back = this.opener?.isConnected && this.opener.offsetParent !== null ? this.opener : null;
    (back ?? app.fallbackFocus?.())?.focus({ preventScroll: true });
    this.opener = null;
  }
}
