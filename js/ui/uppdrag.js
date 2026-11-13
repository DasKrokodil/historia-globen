// Elevuppdraget Samtidighetsjakten (#741): en liten ruta under knapparna (som Hjälp) med uppgiften, vilka
// världsdelar som är hittade och, när jakten är klar, en fråga att fundera på och händelsernas källor.
// Händelserna läggs i jakten med knappen "Lägg till i jakten" i faktarutan (js/ui/panel.js, huntFor/onHunt).
// Reglerna står i js/uppdrag-rules.js och uppdragen i data/uppdrag.json. Ingen poäng sparas.
import { t, formatEventTime, formatYear, isVisibleReview, needDetails } from '../model.js';
import { ui } from '../i18n.js';
import { checkHunt, huntDone, missionProblems, span, eventRegion, fitsLesson, defaultMission } from '../uppdrag-rules.js';

/** Uppdragen i data/uppdrag.json. Ett uppdrag med fel hoppas över (varning i konsolen). */
export async function loadMissions() {
  try {
    const res = await fetch('data/uppdrag.json');
    if (!res.ok) throw new Error(`data/uppdrag.json (${res.status})`);
    const doc = await res.json();
    return (doc.missions ?? []).filter(m => {
      const problems = missionProblems(m);
      for (const p of problems) console.warn(`Uppdraget ${p}`);
      return !problems.length;
    });
  } catch (err) {
    console.warn('Uppdragen kunde inte laddas', err);
    return [];
  }
}

const regionName = r => ui(`region.${r}`);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

export class Hunt {
  /**
   * els: rutans delar i index.html (root, title, task, years, progress, list, message, done, reflection, sources,
   *      closeBtn, endBtn). missions: från loadMissions. app: { timeline, byId, srcById, onChange, fallbackFocus, lesson (lektionsläget, #795) }.
   */
  constructor(els, missions, app) {
    Object.assign(this, els, { missions, app });
    this.mission = null; this.found = []; this.opener = null;
    this.closeBtn.addEventListener('click', () => this.end());
    this.endBtn.addEventListener('click', () => this.end());
    this.root.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); this.end(); } });
  }

  get ready() { return this.missions.length > 0; }
  get active() { return !!this.mission; }
  get missionId() { return this.mission?.id ?? null; }

  /**
   * Startar uppdraget (när id saknas det första som inte hör till en lektion). Tiden flyttas till uppdragets år.
   * Ger false för ett okänt id.
   */
  start(id = null, opener = null) {
    const m = id ? this.missions.find(x => x.id === id) : defaultMission(this.missions);
    if (!m) return false;
    // I en lektion (#795) gäller bara lektionens eget uppdrag, eller ett uppdrag utan lektion inom lektionens år, som i
    // slutkortet (js/ui/lesson.js, #1340): jakten flyttar året
    const lesson = this.app.lesson;
    if (lesson?.active && !fitsLesson(m, lesson.tour?.id, lesson.lock?.years)) return false;
    if (this.app.store && !this.app.store.enter('jakt')) return false; // läget Jakt (#893, MODE_RULES i js/state.js)
    this.mission = m; this.found = []; this.opener = opener;
    this.app.timeline.pause();
    this.app.timeline.year = m.year;
    this.root.hidden = false;
    this.place();
    this.render();
    this.message.textContent = '';
    this.app.onChange?.();
    requestAnimationFrame(() => this.title.focus({ preventScroll: true }));
    return true;
  }

  /** Avslutar jakten. Fokus tillbaka till knappen som startade den (eller Mer). */
  end(refocus = true) {
    if (!this.mission) return;
    this.app.store?.leave(['jakt']);
    this.mission = null; this.found = [];
    this.root.hidden = true;
    this.app.onChange?.();
    if (refocus) {
      const back = this.opener?.isConnected && this.opener.offsetParent !== null ? this.opener : this.app.fallbackFocus?.();
      back?.focus({ preventScroll: true });
    }
    this.opener = null;
  }

  /** Knappen i faktarutan för händelsen e: { label, disabled } medan jakten pågår, annars null. */
  buttonFor(e) {
    if (!this.mission || !e) return null;
    const added = this.found.some(x => x.id === e.id);
    return { label: added ? ui('hunt.added') : ui('hunt.add'), disabled: added || huntDone(this.mission, this.found) };
  }

  /** Lägger händelsen i jakten om reglerna tillåter det. Ger resultatet från checkHunt. */
  add(e) {
    if (!this.mission) return { ok: false, reason: 'inactive' };
    const r = checkHunt(e, this.mission, this.found, isVisibleReview);
    const [from, to] = span(this.mission).map(formatYear);
    const title = t(e?.title);
    if (r.ok) {
      this.found.push(e);
      this.message.textContent = ui('hunt.ok', { title, region: regionName(r.region) });
    } else {
      // Ett uppdrag med window 0 gäller ett enda år (#1340): "pågick inte år 1945" i stället för "utanför åren 1945–1945"
      const key = r.reason === 'time' && from === to ? 'hunt.timeYear' : `hunt.${r.reason}`;
      this.message.textContent = ui(key, { title, from, to, year: from, region: r.region ? regionName(r.region) : '' });
    }
    this.message.className = `hunt-message ${r.ok ? 'is-ok' : 'is-no'}`;
    this.render();
    return r;
  }

  render() {
    const m = this.mission;
    if (!m) return;
    const [from, to] = span(m).map(formatYear);
    this.title.textContent = t(m.title);
    this.task.textContent = t(m.task);
    this.years.textContent = from === to ? ui('hunt.year', { year: from }) : ui('hunt.years', { from, to });
    this.progress.textContent = ui('hunt.progress', { n: this.found.length, count: m.count });
    this.list.replaceChildren(...this.found.map(e => {
      const li = el('li');
      li.append(el('span', 'hunt-region', regionName(eventRegion(e))), ' ', el('span', 'hunt-title', t(e.title)), ' ', el('span', 'hunt-time', formatEventTime(e)));
      return li;
    }));
    const done = huntDone(m, this.found);
    this.done.hidden = !done;
    if (done) {
      this.reflection.textContent = t(m.reflection);
      this.showSources();
    }
  }

  /** Källorna för händelserna i jakten, som länkar ur källregistret. */
  async showSources() {
    const found = [...this.found];
    try { await (needDetails(found) ?? null); } catch { /* utan detaljer visas inga källor */ }
    if (!this.mission || found.some((e, i) => this.found[i] !== e)) return;
    const ids = [...new Set(found.flatMap(e => e.sources ?? []))];
    this.sources.replaceChildren(...ids.map(id => {
      const src = this.app.srcById[id];
      const li = el('li');
      if (src?.url) { const a = el('a', null, src.title); a.href = src.url; a.target = '_blank'; a.rel = 'noopener'; li.append(a); }
      else li.textContent = src?.title ?? id;
      return li;
    }));
  }

  /** Rutan läggs under knapparna uppe till höger, som Hjälp (help.js). */
  place() {
    const r = (document.querySelector('.top-actions') ?? document.body).getBoundingClientRect();
    this.root.style.top = `${Math.round(r.bottom + 10)}px`;
    this.root.style.maxHeight = `calc(100dvh - ${Math.round(r.bottom + 160)}px)`;
  }
}
