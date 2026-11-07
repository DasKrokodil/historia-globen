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

export class LessonMode {
  /**
   * els: bandet och dess delar i index.html (band, title, exit, endLinks, endList).
   * app: { root, timeline, tour, closeMenus } från main.js.
   */
  constructor(els, app) {
    Object.assign(this, els, { app });
    this.tour = null;
    this.exit.addEventListener('click', () => this.exitToGlobe());
  }

  get active() { return !!this.tour; }
  get lock() { return this.tour?.lesson?.lock ?? null; }
  /** Lagren som är på hela lektionen (lock.layers), eller null när turens steg bestämmer. */
  get layers() { return this.lock?.layers ?? null; }

  /** Kan turen id köras som lektion? Bara turer med lärarfält (lesson) kan det. */
  canStart(id) { return !!this.app.tour?.tours.find(x => x.id === id)?.lesson; }

  /** Börjar läget för turen id (före tour.start). Ger false när turen inte är en lektionstur. */
  enter(id) {
    const tour = this.app.tour?.tours.find(x => x.id === id);
    if (!tour?.lesson) return false;
    if (this.tour && this.tour.id !== tour.id) this.leave();
    this.tour = tour;
    const { root, timeline } = this.app;
    root.classList.add('lesson');
    this.title.textContent = ui('lesson.band', { title: t(tour.title) });
    this.band.hidden = false;
    this.exit.hidden = this.lock?.escape === false;
    const years = this.lock?.years;
    if (years) timeline.setFocus({ from: years[0], to: years[1], fine: false });
    this.app.closeMenus?.(); // menyer som stod öppna när länken öppnades
    return true;
  }

  /** Slutar läget utan att röra turen. Året står kvar. */
  leave() {
    if (!this.tour) return;
    const { root, timeline } = this.app;
    const hadYears = !!this.lock?.years;
    this.tour = null;
    root.classList.remove('lesson');
    this.band.hidden = true;
    this.endLinks.hidden = true;
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
    const { tour } = this.app;
    this.leave();
    tour.end();
  }
}
