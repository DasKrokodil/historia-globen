// Quizet "Vad hände samtidigt som …?" (#65): en dialog som Hjälp och introduktionen, startad från Mer.
// Frågorna byggs av js/quiz-rules.js ur befintliga fun facts, så inga nya fakta skrivs. Efter svaret visas
// rätt eller fel, alla tre händelsernas årtal, fun factens text och händelsernas källor. Poängen räknas bara
// under besöket och sparas inte.
import { t, formatEventTime, isVisibleReview, loadSources, needDetails } from '../model.js';
import { ui } from '../i18n.js';
import { nextQuestion } from '../quiz-rules.js';

const focusable = root => [...root.querySelectorAll('button:not([disabled]), [href]')]
  .filter(el => !el.hidden && el.offsetParent !== null);

export class Quiz {
  /**
   * els: dialogens delar i index.html (root, close, score, title, event, eventTitle, eventMeta, question,
   *      options, result, verdict, funfact, sources, next).
   * data: { events, byId, funfacts, srcById } från loadAll (srcById fylls i av loadSources).
   */
  constructor(els, data, { fallbackFocus } = {}) {
    Object.assign(this, els, { data, fallbackFocus });
    this.asked = new Set();
    this.right = 0; this.total = 0;
    this.q = null; this.opener = null;
    this.closeBtn.addEventListener('click', () => this.close());
    this.next.addEventListener('click', () => this.ask());
    document.addEventListener('keydown', e => { if (!this.root.hidden) this.onKeydown(e); });
    // Ett klick på den mörka bakgrunden utanför rutan stänger quizet
    this.root.addEventListener('pointerdown', e => { if (e.target === this.root) this.close(); });
  }

  /** Finns det minst en fråga i datan? (annars döljs knappen) */
  get ready() {
    const { funfacts, byId, events } = this.data;
    return !!nextQuestion(funfacts, byId, events, isVisibleReview, new Set(), () => 0);
  }

  open(opener = null) {
    this.opener = opener;
    this.root.hidden = false;
    this.ask();
  }

  close(refocus = true) {
    if (this.root.hidden) return;
    this.root.hidden = true;
    if (refocus) {
      const fallback = this.fallbackFocus?.();
      const target = this.opener?.isConnected && this.opener.offsetParent !== null ? this.opener : fallback;
      target?.focus({ preventScroll: true });
    }
    this.opener = null;
  }

  /** Ställer nästa fråga. Fun facterna kommer i blandad ordning och upprepas inte förrän alla har kommit. */
  ask() {
    const { funfacts, byId, events } = this.data;
    const q = nextQuestion(funfacts, byId, events, isVisibleReview, this.asked);
    this.q = q;
    this.result.hidden = true;
    this.next.hidden = true;
    this.showScore();
    if (!q) {
      this.event.hidden = true;
      this.question.textContent = ui('quiz.empty');
      this.options.replaceChildren();
      requestAnimationFrame(() => this.closeBtn.focus({ preventScroll: true }));
      return;
    }
    if (this.asked.has(q.funfact.id)) this.asked.clear(); // alla har kommit en gång: börja om
    this.asked.add(q.funfact.id);
    // Källorna står i händelsernas långa fält; de laddas medan man läser frågan
    needDetails(q.funfact.events.map(id => byId[id]))?.catch(() => {});
    this.event.hidden = false;
    this.eventTitle.textContent = t(q.a.title);
    this.eventMeta.textContent = `${formatEventTime(q.a)} · ${t(q.a.place)}`;
    this.question.textContent = ui('quiz.question');
    this.options.replaceChildren(...q.options.map(e => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'intro-choice quiz-option'; b.dataset.event = e.id;
      const name = document.createElement('span'); name.className = 'quiz-option-title'; name.textContent = t(e.title);
      const when = document.createElement('span'); when.className = 'quiz-option-time'; when.hidden = true;
      when.textContent = formatEventTime(e);
      b.append(name, when);
      b.addEventListener('click', () => this.answer(e.id));
      return b;
    }));
    // Direkt, inte i nästa bildruta: rutan är redan synlig, och fokus ska stå på första svaret när frågan visas
    this.options.querySelector('button')?.focus({ preventScroll: true });
  }

  /** Svaret: rätt eller fel, alla årtal, fun facten och källorna. Svarsknapparna låses. */
  answer(id) {
    const q = this.q;
    if (!q || !this.result.hidden) return;
    const right = id === q.answer.id;
    this.total += 1;
    if (right) this.right += 1;
    for (const b of this.options.querySelectorAll('button')) {
      b.disabled = true;
      b.classList.toggle('is-answer', b.dataset.event === q.answer.id);
      b.classList.toggle('is-wrong', b.dataset.event === id && !right);
      b.querySelector('.quiz-option-time').hidden = false;
      if (b.dataset.event === id) b.setAttribute('aria-pressed', 'true');
    }
    this.verdict.textContent = right ? ui('quiz.right') : ui('quiz.wrong', { answer: t(q.answer.title) });
    this.verdict.className = `quiz-verdict ${right ? 'is-right' : 'is-wrong'}`;
    this.funfact.textContent = t(q.funfact.text);
    this.showSources(q);
    this.showScore();
    this.result.hidden = false;
    this.next.hidden = false;
    this.next.focus({ preventScroll: true });
  }

  /** Källorna är fun factens händelsers källor (data/funfacts.json, notes), som länkar ur källregistret. */
  async showSources(q) {
    const { byId } = this.data;
    this.sources.replaceChildren();
    try { await (needDetails(q.funfact.events.map(id => byId[id])) ?? loadSources()); } catch { /* utan källregistret visas id:na */ }
    if (this.q !== q) return;
    const ids = [...new Set(q.funfact.events.flatMap(id => byId[id]?.sources ?? []))];
    this.sources.replaceChildren(...ids.map(id => {
      const src = this.data.srcById[id];
      const li = document.createElement('li');
      if (src?.url) {
        const a = document.createElement('a');
        a.href = src.url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = src.title;
        li.append(a);
      } else li.textContent = src?.title ?? id;
      return li;
    }));
  }

  showScore() {
    this.score.textContent = this.total ? ui('quiz.score', { right: this.right, total: this.total }) : '';
  }

  onKeydown(e) {
    if (e.key === 'Escape') { e.preventDefault(); this.close(); return; }
    if (e.key !== 'Tab') return;
    const items = focusable(this.root);
    if (!items.length) return;
    const first = items[0], last = items.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}
