// Quizet "Vad hände samtidigt som …?" (#65): en dialog som Hjälp och introduktionen, startad från Mer.
// Frågorna byggs av js/quiz-rules.js ur befintliga fun facts, så inga nya fakta skrivs. Efter svaret visas
// rätt eller fel, alla tre händelsernas årtal, fun factens text och händelsernas källor. Poängen räknas bara
// under besöket och sparas inte.
// Varannan fråga är "Sant eller myt?" (#846) ur data/missuppfattningar.json: besökaren gissar och får sedan vad
// källorna säger, varifrån missuppfattningen kommer och källorna. Den räknas inte i poängen (rätt svar är alltid myt).
import { t, formatEventTime, isVisibleReview, loadSources, needDetails, loadMisconceptions } from '../model.js';
import { ui } from '../i18n.js';
import { nextQuestion, nextMyth, isMythTurn } from '../quiz-rules.js';

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
    this.askedMyths = new Set();
    this.count = 0; // frågor ställda under besöket; varannan är Sant eller myt (#846)
    this.titleText = this.title?.textContent ?? '';
    this.eventLabel = this.event.querySelector('.intro-event-label');
    this.eventLabelText = this.eventLabel?.textContent ?? '';
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
    loadMisconceptions(); // laddas medan den första frågan läses; utan dem blir alla frågor om samtidighet
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
    const myth = isMythTurn(this.count) ? nextMyth(this.data.misconceptions, isVisibleReview, this.askedMyths) : null;
    this.count += 1;
    if (myth) { this.askMyth(myth); return; }
    if (this.title) this.title.textContent = this.titleText;
    if (this.eventLabel) this.eventLabel.textContent = this.eventLabelText;
    if (this.origin) this.origin.hidden = true;
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

  /** Sant eller myt? (#846): påståendet och två knappar. Inga årtal att avslöja, och frågan räknas inte i poängen. */
  askMyth(m) {
    if (this.askedMyths.size >= (this.data.misconceptions ?? []).length) this.askedMyths.clear();
    this.askedMyths.add(m.id);
    this.q = { myth: m };
    this.result.hidden = true;
    this.next.hidden = true;
    this.showScore();
    if (this.title) this.title.textContent = ui('quiz.mythTitle');
    if (this.eventLabel) this.eventLabel.textContent = ui('quiz.mythLabel');
    this.event.hidden = false;
    this.eventTitle.textContent = t(m.claim);
    this.eventMeta.textContent = ui('quiz.mythMeta');
    this.question.textContent = ui('quiz.mythQuestion');
    this.options.replaceChildren(...[['true', 'quiz.mythTrue'], ['myth', 'quiz.mythFalse']].map(([value, key]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'intro-choice quiz-option'; b.dataset.answer = value;
      const name = document.createElement('span'); name.className = 'quiz-option-title'; name.textContent = ui(key);
      b.append(name);
      b.addEventListener('click', () => this.answerMyth(value));
      return b;
    }));
    this.options.querySelector('button')?.focus({ preventScroll: true });
  }

  /** Facit för Sant eller myt: det är en myt, vad källorna säger, varifrån den kommer och källorna. */
  answerMyth(value) {
    const m = this.q?.myth;
    if (!m || !this.result.hidden) return;
    for (const b of this.options.querySelectorAll('button')) {
      b.disabled = true;
      b.classList.toggle('is-answer', b.dataset.answer === 'myth');
      b.classList.toggle('is-wrong', b.dataset.answer === value && value !== 'myth');
      if (b.dataset.answer === value) b.setAttribute('aria-pressed', 'true');
    }
    const right = value === 'myth';
    this.verdict.textContent = right ? ui('quiz.mythRight') : ui('quiz.mythWrong');
    this.verdict.className = `quiz-verdict ${right ? 'is-right' : 'is-wrong'}`;
    this.funfact.textContent = t(m.truth);
    if (this.origin) {
      this.origin.hidden = !m.origin;
      this.origin.textContent = m.origin ? `${ui('quiz.mythOrigin')} ${t(m.origin)}` : '';
    }
    this.showMythSources(m);
    this.result.hidden = false;
    this.next.hidden = false;
    this.next.focus({ preventScroll: true });
  }

  async showMythSources(m) {
    this.sources.replaceChildren();
    try { await loadSources(); } catch { /* utan källregistret visas id:na */ }
    if (this.q?.myth !== m) return;
    this.sources.replaceChildren(...(m.sources ?? []).map(id => this.sourceItem(id)));
  }

  sourceItem(id) {
    const src = this.data.srcById?.[id];
    const li = document.createElement('li');
    if (src?.url) {
      const a = document.createElement('a');
      a.href = src.url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = src.title;
      li.append(a);
    } else li.textContent = src?.title ?? id;
    return li;
  }

  /** Svaret: rätt eller fel, alla årtal, fun facten och källorna. Svarsknapparna låses. */
  answer(id) {
    const q = this.q;
    if (!q || q.myth || !this.result.hidden) return;
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
    this.sources.replaceChildren(...ids.map(id => this.sourceItem(id)));
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
