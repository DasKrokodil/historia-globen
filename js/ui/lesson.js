// Lektionsläget (#795): en länk (#t=<tur>&m=lektion) startar en lektionstur med menyerna borta och ett smalt band
// överst med "Visa hela globen". Läget är lärarens val via länk; ingenting sparas om eleverna.
//
// Det som låses styrs av turens lesson.lock (js/tour-format.js):
// - years: tidslinjen stannar i intervallet (samma inzoomning som Fokus på ett krig, timeline.setFocus),
// - layers: lagren som är på hela lektionen (annars stegens egna lager, js/ui/tour.js),
// - escape: om "Visa hela globen" visas (standard ja).
// Saknas lock döljs bara menyerna och bandet visas. Menyerna döljs med CSS (.app.lesson, css/style.css); Fokus
// stoppas dessutom här, så att inget som ändå går att nå (till exempel en länk i en faktaruta) kan släppa låset.
//
// Läget börjar före turen (enter) så att första steget redan ligger inom låset, och slutar med leave. "Visa hela
// globen" avslutar läget och turen och behåller året.
import { t } from '../model.js';
import { ui } from '../i18n.js';
import { printLesson } from './print-sheet.js';

export class LessonMode {
  /**
   * els: bandet och dess delar i index.html (band, title, exit, endLinks, endList).
   * app: { root, timeline, tour, closeMenus, store, layers, snapshot } från main.js.
   */
  constructor(els, app) {
    Object.assign(this, els, { app });
    this.tour = null;
    this.teacher = false; // läraren har en knapp för elev- och lärarblad i bandet (#885); eleven i den vanliga länken har ingen
    this.exit.addEventListener('click', () => this.exitToGlobe());
    this.printBtn?.addEventListener('click', () => this.print());
    // Adressen skrivs om till den vanliga vyn när länken inte blev en lektion, så länken sparas här (explain)
    this.retry?.addEventListener('click', () => { if (this.noticeUrl) history.replaceState(null, '', this.noticeUrl); location.reload(); });
    this.noticeClose?.addEventListener('click', () => this.hideNotice());
  }

  /** Varför en lektionslänk inte kan startas (#877): 'fetch' (turen gick inte att hämta), 'noLesson' eller 'unknown'. */
  whyNot(id) {
    const info = this.app.toursData ?? {}, loaded = this.app.tour?.tours ?? [];
    if (loaded.find(x => x.id === id)) return 'noLesson';
    return info.failed || (info.ids ?? []).includes(id) ? 'fetch' : 'unknown';
  }

  /** Förklarar i bandet att länken inte blev en lektion, med Försök igen när det var ett hämtfel. */
  explain(id) {
    if (!this.notice) return;
    const why = this.whyNot(id);
    this.noticeText.textContent = ui(`lesson.notice${why === 'fetch' ? 'Fetch' : why === 'noLesson' ? 'NoLesson' : 'Unknown'}`);
    this.retry.hidden = why !== 'fetch';
    this.noticeUrl = location.href;
    this.notice.hidden = false;
    this.app.root.classList.add('lesson-notice');
  }

  hideNotice() {
    if (!this.notice || this.notice.hidden) return;
    this.notice.hidden = true;
    this.app.root.classList.remove('lesson-notice');
  }

  get active() { return !!this.tour; }
  get lock() { return this.tour?.lesson?.lock ?? null; }
  /** Lagren som är på hela lektionen (lock.layers), eller null när turens steg bestämmer. */
  get layers() { return this.lock?.layers ?? null; }

  /** Kan turen id köras som lektion? Bara turer med lärarfält (lesson) kan det. */
  canStart(id) { return !!this.app.tour?.tours.find(x => x.id === id)?.lesson; }

  /** Knappen för elev- och lärarblad syns bara för läraren (#885). */
  showTeacherTools() {
    if (this.printBtn) { this.printBtn.hidden = !this.teacher; this.printBtn.textContent = ui('print.button'); }
    if (this.printStatus) this.printStatus.hidden = true;
    this.app.root.classList.toggle('lesson-teacher', this.teacher); // bandet blir högre i smal skärm (css)
  }

  /** Skriver ut bladen ur steget läraren står i; lektionen, steget och året rörs inte. Går inte källorna att ladda skrivs inget ut (#879). */
  async print() {
    if (!this.tour || !this.teacher) return;
    if (this.printStatus) this.printStatus.hidden = true;
    const result = await printLesson(this.tour, this.app.printRoot);
    if (result === 'sources' && this.printStatus) {
      this.printStatus.textContent = ui('print.sourcesFailed');
      this.printStatus.hidden = false;
    }
    this.printBtn?.focus({ preventScroll: true });
  }

  /** Börjar läget för turen id (före tour.start). Ger false när turen inte är en lektionstur. */
  enter(id, { teacher = false } = {}) {
    const tour = this.app.tour?.tours.find(x => x.id === id);
    if (!tour?.lesson) return false;
    if (this.tour && this.tour.id !== tour.id) this.leave();
    this.teacher = teacher || (this.tour?.id === tour.id && this.teacher); // Bakåt/Framåt i samma lektion behåller rollen
    // Läget Lektion börjar (#893) och avslutar ett fokus (MODE_RULES i js/state.js); bilden tas bara första gången
    this.app.store?.enter('lektion', this.tour ? null : this.app.snapshot?.() ?? null);
    this.tour = tour;
    // Lektionen visar alltid alla händelser i lektionens år (#1139): vyns urval (Översikt) släpps medan lektionen pågår
    // och återställs av utgången (MODE_RULES.lektion.restore i js/state.js)
    this.app.layers?.setTag(null);
    this.hideNotice();
    const { root, timeline } = this.app;
    root.classList.add('lesson');
    this.title.textContent = ui('lesson.band', { title: t(tour.title) });
    this.band.hidden = false;
    this.exit.hidden = this.lock?.escape === false;
    this.showTeacherTools();
    this.applyLock();
    // En jakt som redan pågår och hör till ett år utanför låset avslutas, annars står rutan kvar för ett annat år
    const years = this.lock?.years, hunt = this.app.hunt;
    if (years && hunt?.active && (hunt.mission.year < years[0] || hunt.mission.year > years[1])) hunt.end(false);
    this.app.closeMenus?.(); // menyer som stod öppna när länken öppnades
    return true;
  }

  /**
   * Lägger tidslåset (lock.years). Anropas av enter, och igen av TourPlayer.start efter att ett fokus som var på har
   * släppts (endFocus nollställer annars tidslinjens spann). timeline.focusLocked hindrar årshoppets datum från
   * att släppa låset.
   */
  applyLock() {
    const years = this.lock?.years;
    if (!years) return;
    const { timeline } = this.app;
    timeline.focusLocked = true;
    const f = timeline.focus;
    if (!f || f.fine || f.from !== years[0] || f.to !== years[1]) timeline.setFocus({ from: years[0], to: years[1], fine: false });
  }

  /** Slutar läget utan att röra turen. Året står kvar. */
  leave() {
    if (!this.tour) return;
    const { root, timeline } = this.app;
    const hadYears = !!this.lock?.years;
    this.app.store?.leave(['lektion']); // turen fortsätter; har den slutat har den redan lämnat lektionen (js/ui/tour.js)
    this.tour = null;
    this.teacher = false;
    this.showTeacherTools();
    root.classList.remove('lesson');
    this.band.hidden = true;
    this.endLinks.hidden = true;
    timeline.focusLocked = false;
    if (hadYears) timeline.setFocus(null);
  }

  /**
   * Slutkortet efter turens sista steg: länkar till lektionens uppdrag. Än så länge Samtidighetsjakten (#741), och
   * bara uppdrag vars år ligger i lektionens intervall, så att ett uppdrag aldrig flyttar eleven utanför lektionen.
   * Finns inget uppdrag i intervallet döljs raden. Quiz (#65) och Källdetektiven (#742) läggs till när de kan
   * hämta frågor ur intervallet.
   */
  renderEnd(last) {
    const years = this.lock?.years, hunt = this.app.hunt;
    const missions = last && years && hunt ? hunt.missions.filter(m => m.year >= years[0] && m.year <= years[1]) : [];
    this.endLinks.hidden = !missions.length;
    this.endList.replaceChildren(...missions.map(m => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'link-btn';
      b.textContent = ui('lesson.hunt', { title: t(m.title) });
      b.addEventListener('click', () => hunt.start(m.id, b));
      return b;
    }));
  }

  /** "Visa hela globen": läget och turen slutar, året behålls och sidan blir den vanliga. */
  exitToGlobe() {
    if (!this.tour) return;
    // Turen och lektionen slutar tillsammans; lektionens regel återställer aldrig fokus, så utgången går till fri glob
    // med lektionens år och inte till ett gammalt fokus (#881, MODE_RULES i js/state.js)
    this.app.tour.end();
  }
}
