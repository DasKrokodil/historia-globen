// "För lärare" (#1315): en samlad ingång under Mer till det som finns för lektioner: lektionerna (turer med lärarfält,
// #737), utskriften av elev- och lärarblad (#738), quizet (#65), Samtidighetsjakten (#741) och presentationsläget (#488).
// Inga elevkonton behövs och inget sparas om eleverna. Kortet är samma slags kort som Hjälp (js/ui/help.js), och
// anmäler sig som dialog i stängregistret (js/surfaces.js). Texterna står i index.html; bara lektionslistan byggs här,
// ur turerna, så att den aldrig säger något annat än turernas data.
import { t } from '../model.js';
import { ui } from '../i18n.js';
import { Help } from './help.js';

export class TeacherGuide extends Help {
  /**
   * els: root, button, close, list, empty, quizBtn, quizRow, huntBtn, huntRow, presentationBtn, presentationRow.
   * app: { tour, quiz, hunt, presentation, narrow, lesson } från main.js (alla finns när kortet skapas). narrow: matchMedia för smal skärm.
   */
  constructor(els, app) {
    super({ root: els.root, button: els.button, close: els.close });
    const { list, empty, quizBtn, quizRow, huntBtn, huntRow, presentationBtn, presentationRow } = els; // inte close: det är metoden i Help
    Object.assign(this, { list, empty, quizBtn, quizRow, huntBtn, huntRow, presentationBtn, presentationRow, app });
    this.quizBtn.addEventListener('click', () => { this.close(false); this.app.quiz.open(this.button); });
    this.huntBtn.addEventListener('click', () => { this.close(false); this.app.hunt.start(null, this.button); });
    this.presentationBtn.addEventListener('click', () => {
      this.close(false);
      // Avsluta är det första att nå med tangentbordet. Raden visas inte i smal skärm; slår fönstret ihop medan kortet är öppet ger set false
      if (this.app.presentation.set(true)) document.getElementById('presentation-exit')?.focus({ preventScroll: true });
    });
  }

  /** Lektionerna är turerna med lärarfält. Listan byggs om varje gång kortet öppnas, så att språk och laddning stämmer. */
  build() {
    const { tour, quiz, hunt } = this.app;
    const lessons = (tour?.tours ?? []).filter(x => x.lesson);
    this.list.replaceChildren(...lessons.map(x => this.row(x)));
    this.list.hidden = !lessons.length;
    this.empty.hidden = !!lessons.length; // aldrig ett tomt kort utan förklaring (blind-spots: data saknas)
    this.quizRow.hidden = !quiz?.ready;
    this.huntRow.hidden = !hunt?.ready;
    // Presentationsläget är till för projektor och storskärm: i smal skärm ändrar det bara toppraden, och Avsluta täcker årtalet
    this.presentationRow.hidden = !!this.app.narrow?.matches || !!this.app.presentation?.active; // inget att slå på när läget redan är på
  }

  row(tourData) {
    const li = document.createElement('li');
    li.className = 'teacher-lesson';
    const name = document.createElement('span'); name.className = 'teacher-lesson-title'; name.textContent = t(tourData.title);
    const meta = document.createElement('span'); meta.className = 'teacher-lesson-meta'; meta.textContent = this.app.tour.lessonMeta(tourData);
    const go = document.createElement('button');
    go.type = 'button'; go.className = 'tour-lesson-start teacher-lesson-start'; go.dataset.tour = tourData.id;
    go.textContent = ui('tour.lessonStart');
    go.setAttribute('aria-label', ui('tour.lessonStartLabel', { title: t(tourData.title) }));
    go.addEventListener('click', () => { this.close(false); this.app.tour.startAsLesson(tourData.id); });
    li.append(name, meta, go);
    return li;
  }

  open(fromButton) {
    // I en lektion är kortet dolt: en elev som öppnat elevlänken ska inte kunna starta en annan lektion som lärare (#885)
    if (this.app.lesson?.active) return;
    this.build();
    super.open(fromButton);
  }
}
