// Utskrift av en lektionstur (#738): elevblad och lärarblad ur turens data (lärarfälten i lesson, #737), så att
// turen och papperen aldrig säger olika saker (beslut 2026-11-07). Bladen ritas som vanlig HTML i #print-sheet,
// som bara syns i utskrift (@media print i css/style.css). Inget nytt beroende och ingen PDF-generering.
//
// Elevbladet: turens titel, plats för namn, stegens frågor med plats för svar, exit ticket och källorna för
// stegen med frågor. Lärarbladet: årskurs, tid, förkunskaper, lärarinstruktion, kopplingen till läroplanen med
// källa, frågorna, exit ticket och länken till lektionen (#t=<id>&m=lektion, #795). Har lektionen Källdetektiven
// (lesson.sourceDetective, #742) skrivs dess frågor på ett eget elevblad mellan de två, och lärarbladet får dem också.
//
// Tillgänglighet och papper (#757): varje blad är en märkt sektion med en egen rubrik på nivå 1 ("Elevblad <titel>"
// och "Lärarblad <titel>", och "Källdetektiven <titel>" när lektionen har den), därefter nivå 2, så att läsordning och rubriker blir rätta när utskriften sparas som
// taggad PDF. Skrivrader och namnrad är dekoration och göms för hjälpmedel. Allt är svart på vitt, och ingenting
// beror på färg. Länkar står som text, eftersom papper inte går att klicka på.
import { t, loadSources } from '../model.js';
import { ui } from '../i18n.js';

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

/** Tomma rader att skriva på. */
const lines = n => {
  const box = el('div', 'print-lines');
  box.setAttribute('aria-hidden', 'true'); // dekoration: papperet har rader, en PDF-läsare behöver inte höra dem
  for (let i = 0; i < n; i++) box.append(el('span', 'print-line'));
  return box;
};

/** Årskursen som den skrivs: 7–9, F–3 eller Gymnasiet. */
const gradeText = g => (g === 'gy' ? ui('print.gy') : String(g).replace('-', '–'));

/** Länken till turen, så att läraren kan öppna den direkt (#736). */
/** Länken som läraren delar: turen som lektion (#795). Bladen skrivs bara ut för turer med lärarfält. */
export const tourLink = tour => `${location.origin}${location.pathname}#t=${tour.id}&m=lektion`;

/** En källa som rad: titel och adress (utskrivet papper har inga klickbara länkar). */
function sourceItem(src, id) {
  const li = el('li');
  li.append(el('span', 'print-src-title', src?.title ?? id));
  if (src?.url) li.append(' ', el('span', 'print-src-url', src.url));
  return li;
}

/** Frågorna i turen, i stegens ordning: [{ step, n }] där n är stegets nummer. */
const questions = tour => tour.steps.map((step, i) => ({ step, n: i + 1 })).filter(x => x.step.question);

/** Källdetektiven (#742): [{ step, n, questions }] för de händelser i lesson.sourceDetective som ett steg öppnar. */
const detective = tour => (tour.lesson?.sourceDetective ?? []).map(d => {
  const i = tour.steps.findIndex(s => s.open === d.event);
  return i < 0 ? null : { step: tour.steps[i], n: i + 1, questions: d.questions ?? [] };
}).filter(Boolean);

/** Stegets rubrik som rad: "Steg 9: Stalingrad, 2 februari 1943". */
const stepLabel = (step, n) => ui('print.step', { n, title: t(step.title) || '' }).replace(/:\s*$/, '');

function head(tour, kind, id) {
  const h = el('header', 'print-head');
  // Bladets sort och turens titel i samma rubrik, så att de två bladen inte har samma h1
  const title = el('h1', 'print-heading');
  title.id = id;
  title.append(el('span', 'print-kind', kind), ' ', el('span', 'print-title', t(tour.title)));
  h.append(title);
  if (tour.summary) h.append(el('p', 'print-summary', t(tour.summary)));
  return h;
}

function studentSheet(tour, srcById) {
  const page = el('section', 'print-page print-student');
  page.setAttribute('aria-labelledby', 'print-student-title');
  page.append(head(tour, ui('print.student'), 'print-student-title'));
  const name = el('p', 'print-name', `${ui('print.name')}: `);
  const blank = el('span', 'print-blank');
  blank.setAttribute('aria-hidden', 'true');
  name.append(blank);
  page.append(name);
  const list = el('ol', 'print-questions');
  for (const { step, n } of questions(tour)) {
    const li = el('li');
    li.append(el('p', 'print-step', stepLabel(step, n)));
    li.append(el('p', 'print-q', t(step.question)), lines(3));
    list.append(li);
  }
  page.append(list);
  const exit = el('div', 'print-exit');
  exit.append(el('h2', null, ui('print.exit')), el('p', 'print-q', t(tour.lesson.exitTicket)), lines(3));
  page.append(exit);
  const sources = sourceBox(questions(tour), srcById);
  if (sources) page.append(sources);
  return page;
}

/** Källorna för stegen i listan, som ruta längst ned på ett elevblad (null när stegen saknar källor). */
function sourceBox(items, srcById) {
  const ids = [...new Set(items.flatMap(x => x.step.sources ?? []))];
  if (!ids.length) return null;
  const box = el('div', 'print-sources');
  box.append(el('h2', null, ui('print.sources')));
  const ul = el('ul');
  ul.append(...ids.map(id => sourceItem(srcById[id], id)));
  box.append(ul);
  return box;
}

/** Källdetektiven (#742): ett eget elevblad, så att elevbladet för turen får plats på ett A4 och uppdraget kan delas ut för sig. */
function detectiveSheet(tour, cases, srcById) {
  const page = el('section', 'print-page print-detective');
  page.setAttribute('aria-labelledby', 'print-detective-title');
  page.append(head(tour, ui('print.detective'), 'print-detective-title'));
  const name = el('p', 'print-name', `${ui('print.name')}: `);
  const blank = el('span', 'print-blank');
  blank.setAttribute('aria-hidden', 'true');
  name.append(blank);
  page.append(name, el('p', 'print-detective-intro', ui('print.detectiveIntro')));
  for (const { step, n, questions: qs } of cases) {
    const item = el('div', 'print-detective-case');
    item.append(el('h2', null, stepLabel(step, n)));
    for (const q of qs) item.append(el('p', 'print-q', t(q)), lines(3));
    page.append(item);
  }
  const sources = sourceBox(cases, srcById);
  if (sources) page.append(sources);
  return page;
}

function teacherSheet(tour, srcById) {
  const { lesson } = tour;
  const page = el('section', 'print-page print-teacher');
  page.setAttribute('aria-labelledby', 'print-teacher-title');
  page.append(head(tour, ui('print.teacher'), 'print-teacher-title'));
  const facts = el('dl', 'print-facts');
  const fact = (label, value) => { facts.append(el('dt', null, label), el('dd', null, value)); };
  fact(ui('print.gradesLabel'), gradeText(lesson.grades));
  fact(ui('print.time'), ui('print.minutes', { n: lesson.minutes }));
  if (lesson.prerequisites) fact(ui('print.prereq'), t(lesson.prerequisites));
  const link = el('dd', 'print-link', tourLink(tour));
  facts.append(el('dt', null, ui('print.link')), link);
  page.append(facts);
  const how = el('div', 'print-block');
  how.append(el('h2', null, ui('print.instruction')), el('p', null, t(lesson.teacher)));
  page.append(how);
  const cur = el('div', 'print-block');
  cur.append(el('h2', null, ui('print.curriculum')));
  const ul = el('ul', 'print-curriculum');
  ul.append(...lesson.curriculum.map(c => el('li', null, t(c.text))));
  // Källorna för kopplingarna en gång var, under listan (oftast samma kursplan för alla)
  const srcs = el('ul', 'print-sources-inline');
  srcs.append(...[...new Set(lesson.curriculum.flatMap(c => c.sources ?? []))].map(id => sourceItem(srcById[id], id)));
  cur.append(ul, el('p', 'print-src-label', ui('print.sources')), srcs);
  page.append(cur);
  const qs = el('div', 'print-block');
  qs.append(el('h2', null, ui('print.questions')));
  const ol = el('ol', 'print-questions-short');
  for (const { step, n } of questions(tour)) ol.append(el('li', null, `${ui('print.stepShort', { n })}: ${t(step.question)}`));
  ol.append(el('li', null, `${ui('print.exit')}: ${t(lesson.exitTicket)}`));
  qs.append(ol);
  page.append(qs);
  const cases = detective(tour);
  if (cases.length) {
    const det = el('div', 'print-block print-detective-teacher');
    det.append(el('h2', null, ui('print.detective')), el('p', null, ui('print.detectiveTeacher')));
    const dl = el('ol', 'print-questions-short');
    for (const { n, questions: dq } of cases) dl.append(el('li', null, `${ui('print.stepShort', { n })}: ${dq.map(q => t(q)).join(' ')}`));
    det.append(dl);
    page.append(det);
  }
  return page;
}

/**
 * Ritar elevbladet (och Källdetektiven) och lärarbladet för turen i root (#print-sheet) och öppnar webbläsarens utskrift.
 * Bladen tas bort efter utskriften. Ger false för en tur utan lärarfält.
 */
export async function printLesson(tour, root, { print = () => window.print() } = {}) {
  if (!tour?.lesson || !root) return false;
  let srcById = {};
  try { srcById = await loadSources(); } catch { /* utan källregistret skrivs källornas id ut */ }
  const cases = detective(tour);
  const sheets = [studentSheet(tour, srcById)];
  if (cases.length) sheets.push(detectiveSheet(tour, cases, srcById));
  root.replaceChildren(...sheets, teacherSheet(tour, srcById));
  root.hidden = false;
  const done = () => { root.hidden = true; root.replaceChildren(); removeEventListener('afterprint', done); };
  addEventListener('afterprint', done);
  print();
  return true;
}
