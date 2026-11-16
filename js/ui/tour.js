// Guidade turer (#47, Rikards beslut 2026-11-01): en tur är data i data/turer/<id>.json, och den här modulen
// spelar upp den. Turen är inget lager i registret och ritar inget eget; den styr det som redan finns:
// - året på tidslinjen (Timeline äger året, CLAUDE.md punkt 3) och pausen med Timeline.pause,
// - kameran på globen (flyTo och zoom) och samma mitt i Platt vy,
// - lagren via Lager (LayerMenu.set och onChange), så att state.js och lagerregistret räknar fram vad som syns,
// - faktarutan för en befintlig händelse (select).
// Fortsätt och spelknappen går till nästa steg. Ligger nästa steg nära i tiden spelas tiden fram dit och pausar;
// annars hoppar tidslinjen. Avsluta återställer besökarens lager, fokus och kamera och lämnar året där turen var.
import { t, isVisibleReview, formatYear } from '../model.js';
import { tourProblems } from '../tour-format.js';
import { teacherLink } from './print-sheet.js';
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
    return { labels: index.labels ?? {}, tours: tours.filter(Boolean), ids: index.tours ?? [], failed: false };
  } catch (err) {
    console.warn('Turerna kunde inte laddas', err);
    return { labels: {}, tours: [], ids: [], failed: true };
  }
}

/** Sätter ihop meningar för uppläsning: en punkt emellan, men ingen dubbel när delen redan slutar med skiljetecken ("Texten.", "Frågan?"). */
const sentences = parts => parts.filter(Boolean).reduce((out, part) => (out ? `${out}${/[.!?…:]$/.test(out) ? ' ' : '. '}${part}` : part), '');

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
    // Medan turen styr tiden är turkortets Nästa den enda framåtknappen (#999). Låset ligger i lägeskontraktet (timeLock i js/state.js, #1322);
    // här finns bara förklaringen som visas som hovertext på de låsta stegknapparna (#1280).
    app.timeline.lockReason = t(this.labels.locked) || '';
    const known = { events: new Set(Object.keys(app.events)), layers: app.layerIds, empires: app.empires };
    // Bara hela turer som har passerat källkontrollen visas (draft visas aldrig, källpolicyn)
    this.tours = (data.tours ?? []).filter(tour => {
      const problems = tourProblems(tour, known);
      for (const p of problems) console.warn(p);
      return !problems.length && isVisibleReview(tour.review);
    });
    this.tour = null; this.index = 0; this.target = null; this.opener = null; this.huntHidden = false; this.stepVersion = 0;
    this.button.hidden = !this.tours.length;
    if (!this.tours.length) return;

    const label = key => t(this.labels[key]) || '';
    this.button.textContent = label('button') || 'Turer';
    this.menuTitle.textContent = label('menuTitle');
    this.back.textContent = `← ${label('back')}`;
    this.closeBtn.setAttribute('aria-label', label('end'));
    this.closeBtn.title = label('end');
    // Avsluta bredvid Nästa i kortet och bredvid Fortsätt i pausraden, så att det syns hur man kommer ur turen
    if (this.endBtn) this.endBtn.textContent = label('end');
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
    this.read.addEventListener('click', () => {
      const s = this.step;
      if (s?.open) app.select(s.open, false);
      else if (s?.place) this.showPlace(s, true, true); // knappen är en uttrycklig handling: kortet får fokus (arket täcker annars knappen)
    });
    this.srcBtn.addEventListener('click', () => { const ids = this.step?.sources ?? []; app.openSources(ids); });
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

  /**
   * Menyn (#1573, ersätter gruppen "Hur föll det?" från #1280): turerna ligger under rubriker (Källkritik, Krig, Samtidigt i
   * världen, Hur föll det?), en tät rad per tur. Raden fälls ut med sammanfattningen och startknapparna. Gruppen kommer ur turens
   * fält group, annars ur war (krig) och empire (fall). Saknas rubrikerna i registret står alla turer i registrets ordning, utan grupp.
   */
  buildMenu() {
    const groupOf = tour => tour.group ?? (tour.empire ? 'fall' : tour.war ? 'krig' : null);
    const order = ['kallkritik', 'krig', 'tid', 'fall'];
    const heading = id => t(this.labels[`group-${id}`]);
    const grouped = order.every(id => heading(id));
    const rows = [];
    if (!grouped) rows.push(...this.tours.map(tour => this.menuItem(tour)));
    else {
      for (const id of order) {
        const tours = this.tours.filter(tour => groupOf(tour) === id);
        if (!tours.length) continue;
        const group = document.createElement('li');
        group.setAttribute('role', 'presentation');
        group.className = 'tour-group';
        const title = document.createElement('p');
        title.className = 'layer-heading tour-group-title';
        title.textContent = heading(id);
        group.append(title);
        rows.push(group, ...tours.map(tour => this.menuItem(tour)));
      }
      // Turer utan grupp (ett nytt slag som ännu inte har fått rubrik) står sist, så att ingen tur försvinner ur menyn
      rows.push(...this.tours.filter(tour => !order.includes(groupOf(tour))).map(tour => this.menuItem(tour)));
    }
    this.list.replaceChildren(...rows);
  }

  /**
   * En rad i menyn (#1573): en hopfälld rad med turens rubrik, och under den sammanfattningen och knapparna Starta turen
   * (#1002) och, för en lektionstur, Starta som lektion (#889, årskurs och tid står bredvid; lektionsläget är detsamma som
   * länken m=lektion ger, #795). Det tar ett tryck extra att starta, men listan blir kort.
   */
  menuItem(tour) {
    const li = document.createElement('li');
    const row = document.createElement('details');
    row.className = 'tour-row'; row.dataset.tour = tour.id;
    const head = document.createElement('summary');
    head.className = 'tour-pick'; head.dataset.tour = tour.id;
    const name = document.createElement('span'); name.className = 'tour-pick-title'; name.textContent = t(tour.title);
    head.append(name);
    const body = document.createElement('div'); body.className = 'tour-row-body';
    if (tour.summary) {
      const meta = document.createElement('p'); meta.className = 'tour-pick-meta'; meta.textContent = t(tour.summary);
      body.append(meta);
    }
    const lessonRow = document.createElement('div'); lessonRow.className = 'tour-lesson-row';
    const info = document.createElement('span'); info.className = 'tour-lesson-meta';
    const actions = document.createElement('span'); actions.className = 'tour-actions';
    const play = document.createElement('button');
    play.type = 'button'; play.className = 'tour-start-btn'; play.dataset.tour = tour.id;
    play.textContent = ui('tour.start');
    play.setAttribute('aria-label', ui('tour.startLabel', { title: t(tour.title) }));
    play.addEventListener('click', () => { this.closeMenu(false); this.start(tour.id, this.button); });
    actions.append(play);
    if (tour.lesson) { // lektionsläget skapas efter spelaren, så bara lärarfältet avgör här (som canStart)
      info.textContent = this.lessonMeta(tour);
      const go = document.createElement('button');
      go.type = 'button'; go.className = 'tour-lesson-start'; go.dataset.tour = tour.id;
      go.textContent = ui('tour.lessonStart');
      go.setAttribute('aria-label', ui('tour.lessonStartLabel', { title: t(tour.title) }));
      go.addEventListener('click', () => { this.closeMenu(false); this.startAsLesson(tour.id); });
      actions.append(go);
    }
    lessonRow.append(info, actions);
    body.append(lessonRow);
    row.append(head, body);
    li.append(row);
    return li;
  }

  /** "Lektion · årskurs 7–9 · 30 min" ur turens lärarfält (Turer-menyn och För lärare, #1315). */
  lessonMeta(tour) {
    const grades = tour.lesson.grades === 'gy' ? ui('print.gy') : String(tour.lesson.grades).replace('-', '–');
    return ui('tour.lessonMeta', { grades, n: tour.lesson.minutes });
  }

  /** Startar turen som lektion med lärarens verktyg (#885): den som väljer Starta som lektion är läraren. */
  startAsLesson(id) {
    const { lesson } = this.app;
    lesson?.enter(id, { teacher: true });
    if (!this.start(id, this.button)) lesson?.leave();
  }

  openMenu() {
    const r = (this.button.closest('.top-actions') ?? this.button).getBoundingClientRect();
    this.menu.style.top = `${r.bottom + 8}px`;
    this.menu.style.maxHeight = `calc(100dvh - ${r.bottom + 24}px)`;
    for (const d of this.list.querySelectorAll('details.tour-row[open]')) d.open = false; // menyn börjar alltid hopfälld (#1573)
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
   * Kopierar lektionslänken med lärarens väg till bladen (#930), som Dela: urklipp, annars en ruta att kopiera ur.
   * Knappen står vid varje lektion i För lärare (#1583); note är raden som säger att länken är kopierad.
   */
  async copyTeacherLink(tour, note = null) {
    if (!tour?.lesson) return;
    const url = teacherLink(tour);
    const say = (text, ok) => { if (!note) return; note.textContent = text; note.classList.toggle('is-ok', ok); note.hidden = false; };
    try {
      await navigator.clipboard.writeText(url);
      say(ui('tour.teacherLinkCopied'), true);
    } catch {
      say(ui('share.manual'), false);
      window.prompt(ui('tour.teacherLinkPrompt'), url);
    }
  }

  /**
   * Startar turen med id, vid steget stepId om det finns (en länk med t och s, #736), annars vid första steget.
   * Besökarens lager, fokus och kamera sparas, så att Avsluta kan återställa dem. Ger false för en okänd tur.
   */
  start(id, opener = null, stepId = null) {
    const tour = this.tours.find(x => x.id === id);
    if (!tour) return false;
    const { app } = this;
    // Läget Tur börjar (#893): ögonblicksbilden tas bara när ingen tur pågår, och ett fokus slutar (MODE_RULES i js/state.js)
    const hadFocus = !!app.focusKey();
    if (app.store) app.store.enter('tur', this.tour ? null : app.snapshot());
    else if (hadFocus) app.endFocus(false);
    if (hadFocus && app.lesson?.active) app.lesson.applyLock(); // endFocus släpper tidslåset (#795)
    // Turen visar alla händelser i turens år (#1181). Spara vyn först ovan; end återställer urvalet efter lagren.
    app.layers.setTag(null);
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
    this.huntHidden = false;
    this.card.hidden = false;
    this.app.root.classList.add('touring');
    const stepVersion = this.stepVersion = (this.stepVersion ?? 0) + 1;
    const { app } = this, { timeline, globe, flatMap } = app;
    this.index = Math.max(0, Math.min(i, this.tour.steps.length - 1));
    this.target = null;
    this.card.scrollTop = 0; // nytt steg börjar överst: stegräknaren, rubriken och bilden syns (#1856)
    const step = this.step;
    timeline.pause();
    this.setLayers(app.lesson?.layers ?? step.layers); // en lektion kan låsa lagren för hela turen (#795)
    timeline.year = step.at;
    // Faktarutan först (den flyttar kameran till händelsen), sedan stegets egen kamera
    // I smal skärm markeras händelsen bara på globen (krigets händelser syns annars inte utzoomat), och
    // faktarutan öppnas med "Läs om händelsen", så att arket inte täcker kortet
    app.places?.closeStep(); // platsens kontur från förra steget (#1163); omritningen nedan tar bort den
    // En markör med namn vid stegets plats (#1785): på kamerans mitt om steget inte anger en egen plats
    if (step.mark) app.places?.markStep({ lat: step.mark.lat ?? step.camera.lat, lon: step.mark.lon ?? step.camera.lon, label: t(step.mark.label), approx: !!step.mark.approx });
    // En linje på kartan (#1785): läses och ritas när filen har kommit, om turen fortfarande står kvar på steget
    if (step.line) app.places?.lineStep({ file: step.line.file, label: t(step.line.label), current: () => this.stepVersion === stepVersion });
    this.card.dataset.line = step.line ? step.line.file : '';
    this.card.dataset.mark = step.mark ? t(step.mark.label) : ''; // för webbläsartestet
    if (step.open && !app.narrow.matches) app.select(step.open, false);
    else if (step.open) app.mark(step.open);
    else app.select(null, false);
    // Ett steg med en plats (#1163): konturen på kartan och, utom i smal skärm, platsens kort (inget Fokus, turen pågår)
    const placeShown = step.place ? this.showPlace(step, !app.narrow.matches) : null;
    globe.flyTo(step.camera.lat, step.camera.lon);
    globe.setZoom(step.camera.zoom);
    flatMap.setView?.(step.camera.lat, step.camera.lon, step.camera.zoom);
    this.lift();

    const n = this.tour.steps.length;
    this.progress.textContent = fill(t(this.labels.step), { current: this.index + 1, total: n });
    this.drawMeter(n);
    this.title.textContent = t(step.title);
    this.title.hidden = !step.title;
    this.renderText(step);
    this.renderFigure(step);
    // Berättelseläget (#247): kapitlet ovanför rubriken och en fråga att fundera på under texten
    this.chapter.textContent = t(step.chapter);
    this.chapter.hidden = !step.chapter;
    this.questionText.textContent = t(step.question);
    this.question.hidden = !step.question;
    // Vad källorna säger om steget (#499), med samma ord som slutkortet (#500)
    this.status.textContent = step.status ? t(this.labels[`status-${step.status}`]) : '';
    this.status.className = `tour-status${step.status ? ` takeaway-${step.status}` : ''}`;
    this.status.hidden = !step.status;
    this.read.hidden = !step.open && !step.place;
    this.read.textContent = this.readLabel(step);
    this.back.hidden = this.index === 0;
    if (this.endBtn) this.endBtn.hidden = this.last; // sista steget: Klar avslutar
    this.next.textContent = this.last ? t(this.labels.done) : `${t(this.labels.next)} →`;
    // I en lektion står slutkortet kvar efter sista steget; utgången är "Visa hela globen" i bandet (#795)
    const stay = this.last && !!app.lesson?.active;
    if (stay && document.activeElement === this.next) this.back.focus({ preventScroll: true });
    this.next.hidden = stay;
    app.lesson?.renderEnd(this.last);
    // Pausraden visar turen och läses upp; Fortsätt där går till nästa steg (beforeplay ovan)
    // Pausraden säger också varför tidsknapparna är låsta (#1280)
    const locked = t(this.labels.locked);
    const note = [fill(t(this.labels.paused), { title: t(this.tour.title) }), locked].filter(Boolean).join(' · ');
    const say = sentences([this.progress.textContent, t(step.chapter), t(step.title), this.status.hidden ? '' : this.status.textContent, t(step.text).replace(/\s*\n\n+\s*/g, ' '), t(step.question)]);
    // Slutkortet har ingen pausrad, men skärmläsaren ska höra steget och att det var det sista (#878)
    const end = !this.last ? '' : app.lesson?.active ? ui('lesson.endAnnounce', { exit: ui('lesson.exit') }) : ui('tour.endAnnounce');
    // Kortet som steget öppnar på dator (en händelse eller en plats) säger sin rubrik när det öppnas (main.js, prioritet 2) och tog förut bort
    // stegets text. Nu sägs stegets text och kortets rubrik som en enda uppläsning ("Steg 2 av 3. Platsen. Plats: Grönland", #1464).
    // En händelses kort öppnas direkt, en plats laddas först (showPlace): uppläsningen väntar då tills kortet har öppnats.
    const cardOpens = !app.narrow.matches && !!(step.open || step.place);
    const speak = heading => {
      const text = sentences([say, heading, end]);
      // Prioritet 3 för slutannonsen (#878): den ska inte tappas när slutstegets faktaruta, som har prioritet 2 i statusraden (#1419), öppnas samtidigt
      timeline.announce(text, this.last ? 3 : heading ? 2 : 0);
    };
    if (this.last) timeline.pause(); // ingen pausrad i sista steget
    else timeline.pause(note, true, cardOpens ? '' : say); // med ett kort sägs uppläsningen av speak nedan, inte här
    if (placeShown && cardOpens) placeShown.then(shown => { if (this.tour && this.stepVersion === stepVersion && !this.huntHidden && this.step === step) speak(shown ? this.cardHeading() : ''); });
    else if (step.open && cardOpens) speak(this.cardHeading());
    else if (this.last) speak('');
  }

  /** Bilden i steget (#1794): bildtexten är alt-texten, krediten och licensen står under, och bilden öppnas i full storlek med ett tryck. */
  renderFigure(step) {
    const fig = document.getElementById('tour-figure'), img = step.image;
    if (!fig) return;
    fig.hidden = !img;
    if (!img) return;
    const caption = t(img.caption);
    document.getElementById('tour-figure-img').src = img.file;
    document.getElementById('tour-figure-img').alt = caption;
    document.getElementById('tour-figure-link').href = img.file;
    document.getElementById('tour-figure-caption').textContent = caption; // en illustrations bildtext säger själv att det är en illustration (bildreglerna i CLAUDE.md)
    document.getElementById('tour-figure-credit').textContent = [img.credit, img.license].filter(Boolean).join(' · ');
  }

  /**
   * Stegets text i stycken (#1793): en tom rad i texten (\n\n) börjar ett nytt stycke, och partLabels (nycklar i data/turer/index.json, labels,
   * som "Det sägs" och "Vad källorna säger") ger ett stycke en liten rubrik. Orden är desamma som förut; bara uppdelningen är ny.
   */
  renderText(step) {
    const parts = String(t(step.text) ?? '').split(/\n\n+/);
    const nodes = parts.flatMap((part, i) => {
      const key = step.partLabels?.[i], label = key ? t(this.labels[key]) : '';
      const para = document.createElement('p');
      para.textContent = part;
      if (i === 0) para.className = 'tour-lead';
      if (!label) return [para];
      const head = document.createElement('p');
      head.className = 'tour-part-label';
      head.textContent = label;
      return [head, para];
    });
    this.text.replaceChildren(...nodes);
  }

  /** Knappens text för steget: Läs om händelsen eller Läs om platsen (båda i data/turer/index.json, labels, #1464). */
  readLabel(step) { return t(this.labels[step.place ? 'readPlace' : 'read']); }

  /**
   * Rubriken som faktarutan eller platsens kort läses upp med (som main.js, "Plats: Grönland" eller "Om händelsen: …"), eller tomt när
   * inget kort är öppet.
   */
  cardHeading() {
    const detail = document.getElementById('detail');
    if (!detail || detail.hidden) return '';
    const title = detail.querySelector('h3')?.textContent.trim() ?? '';
    const kind = detail.classList.contains('detail-selection') ? detail.querySelector('.story-label')?.textContent.trim() : ui('detail.label');
    return title ? `${kind}: ${title}` : '';
  }

  /**
   * Steget öppnar en plats (#1163, controllers/places.js): konturen ritas och kortet öppnas om card är true. I smal skärm öppnas
   * kortet inte av sig självt, som för en händelse, eftersom arket skulle täcka turkortet; "Läs om platsen" öppnar det.
   * Platserna laddas först nu, så steget kan ha bytts när de kommer: då visas inget.
   */
  showPlace(step, card, focus = false) {
    const stepVersion = this.stepVersion;
    return Promise.resolve(this.app.places?.openStep(step.place, { card, focus, current: () => !!this.tour && this.stepVersion === stepVersion && !this.huntHidden && this.step === step })).then(Boolean, () => false); // en plats som inte gick att ladda: stegets text läses ändå
  }

  /** Stegindikatorn i kortet (#1280): ett streck per steg, de gjorda och det nuvarande fyllda. Bara en tillägg till
   *  "Steg n av N", så den är dold för skärmläsare. */
  drawMeter(n) {
    if (!this.meter) return;
    if (this.meter.children.length !== n) {
      this.meter.replaceChildren(...Array.from({ length: n }, () => document.createElement('span')));
    }
    [...this.meter.children].forEach((seg, i) => {
      seg.className = i < this.index ? 'is-done' : i === this.index ? 'is-current' : '';
    });
  }

  /** Smal skärm: kortet täcker globens nedre del, så klotet lyfts och stegets plats hamnar mitt i den fria ytan
   *  mellan raden överst och kortet (samma lyft som faktarutan som ark, main.js). */
  lift() {
    const { globe, narrow } = this.app;
    requestAnimationFrame(() => {
      if (!this.tour || this.card.hidden || !narrow.matches) return globe.setViewLift(0);
      const top = document.querySelector('.top-actions')?.getBoundingClientRect().bottom ?? 0;
      const cardTop = this.card.getBoundingClientRect().top;
      globe.setViewLift(Math.max(0, globe.centerY() - (top + cardTop) / 2));
    });
  }

  /** Lektionens slutkort lämnar plats åt jakten; lektionen och dess sparade vy fortsätter (#1709). */
  hideForHunt() {
    if (!this.last || !this.app.lesson?.active) return;
    this.huntHidden = true;
    this.stepVersion = (this.stepVersion ?? 0) + 1; // avbryt också platskort som fortfarande laddas
    this.card.hidden = true;
    this.app.root.classList.remove('touring'); // faktarutan ska också få jaktens vanliga plats när eleven öppnar en händelse
    this.target = null;
    this.app.places?.closeStep();
    this.app.select(null, false);
    this.app.globe.setViewLift(0);
  }

  /** Slutkortet visas igen när jakten slutar. Året står kvar, som vid andra utgångar ur jakten. */
  resumeAfterHunt() {
    if (!this.huntHidden || !this.tour) return null;
    this.huntHidden = false;
    this.card.hidden = false;
    this.app.root.classList.add('touring');
    this.app.select(null, false);
    this.lift();
    return this.card.querySelector('#tour-lesson-end-list button') ?? this.back;
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

  /**
   * Avslutar turen, och lektionen med den (#795). Året står kvar där turen var. Vad som blir som innan avgör
   * lägeskontraktet (#893, exitRestore i js/state.js): efter en vanlig tur lagren, fokus och kameran; efter en lektion
   * lagren och kameran men inte fokus, eftersom fokuset flyttar året och utgången ska behålla lektionens år (#881).
   * takenBy: läget som avslutade turen (till exempel 'fokus'); det tar då över sina egna delar.
   */
  end({ takenBy = null } = {}) {
    if (!this.tour) return;
    const { app } = this;
    const wasLesson = !!app.lesson?.active, tourId = this.tour.id;
    const restore = app.store?.leave(['tur', 'lektion'], takenBy) ?? {};
    app.lesson?.leave(); // en tur som slutar tar lektionsläget med sig (#795)
    this.next.hidden = false;
    this.tour = null; this.target = null; this.huntHidden = false;
    this.card.hidden = true;
    app.root.classList.remove('touring');
    app.globe.setViewLift(0);
    app.timeline.pause();
    app.places?.closeStep(); // platsens kontur (#1163) tas bort av omritningen i select
    app.select(null, false);
    for (const [id, on] of Object.entries(restore.layers ?? {})) {
      if (!!app.layers.on[id] === on) continue;
      app.layers.set(id, on);
      app.layers.onChange(id, on);
    }
    // Vyns urval (Översikt) efter lagren: ett lagerbyte ovan lämnar vyn; turen och lektionen släppte urvalet vid start (#1139, #1181)
    if ('tag' in restore) app.layers.setTag(restore.tag);
    if (restore.focus) app.startFocus(restore.focus);
    if (restore.camera) { app.globe.flyTo(restore.camera.lat, restore.camera.lon); app.globe.setZoom(restore.camera.zoom); }
    const back = this.opener?.isConnected && this.opener.offsetParent !== null ? this.opener : null;
    (back ?? app.fallbackFocus?.())?.focus({ preventScroll: true });
    // Besked efter utgången (#1572): turen är slut, vilket år man står på, och ett sätt att börja om. Inte när ett annat läge tog över eller efter en lektion.
    if (!takenBy && !wasLesson && app.linkNotice) {
      const year = formatYear(Math.round(app.timeline.year));
      const opener = back;
      app.linkNotice.showText(ui('tour.left', { year }), { ms: 20000, action: { label: ui('tour.restart'), run: () => this.start(tourId, opener) } });
    }
    this.opener = null;
  }
}
