// Utskrift av en lektionstur (#738): elevblad och lärarblad ur turens data (lärarfälten i lesson, #737), så att
// turen och papperen aldrig säger olika saker (beslut 2026-11-07). Bladen ritas som vanlig HTML i #print-sheet,
// som bara syns i utskrift (@media print i css/style.css). Inget nytt beroende och ingen PDF-generering.
//
// Elevbladet: turens titel, plats för namn, stegens frågor med plats för svar, exit ticket och källorna för
// stegen med frågor. Lärarbladet: årskurs, tid, förkunskaper, lärarinstruktion, kopplingen till läroplanen med
// källa, frågorna, exit ticket och länken till turen (#t=<id>, #736).
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
  for (let i = 0; i < n; i++) box.append(el('span', 'print-line'));
  return box;
};

/** Årskursen som den skrivs: 7–9, F–3 eller Gymnasiet. */
const gradeText = g => (g === 'gy' ? ui('print.gy') : String(g).replace('-', '–'));

/** Länken till turen, så att läraren kan öppna den direkt (#736). */
export const tourLink = tour => `${location.origin}${location.pathname}#t=${tour.id}`;

/** En källa som rad: titel och adress (utskrivet papper har inga klickbara länkar). */
function sourceItem(src, id) {
  const li = el('li');
  li.append(el('span', 'print-src-title', src?.title ?? id));
  if (src?.url) li.append(' ', el('span', 'print-src-url', src.url));
  return li;
}

/** Frågorna i turen, i stegens ordning: [{ step, n }] där n är stegets nummer. */
const questions = tour => tour.steps.map((step, i) => ({ step, n: i + 1 })).filter(x => x.step.question);

function head(tour, kind) {
  const h = el('header', 'print-head');
  h.append(el('p', 'print-kind', kind), el('h1', 'print-title', t(tour.title)));
  if (tour.summary) h.append(el('p', 'print-summary', t(tour.summary)));
  return h;
}

function studentSheet(tour, srcById) {
  const page = el('section', 'print-page print-student');
  page.append(head(tour, ui('print.student')));
  const name = el('p', 'print-name', `${ui('print.name')}: `);
  name.append(el('span', 'print-blank'));
  page.append(name);
  const list = el('ol', 'print-questions');
  for (const { step, n } of questions(tour)) {
    const li = el('li');
    li.append(el('p', 'print-step', ui('print.step', { n, title: t(step.title) || '' }).replace(/:\s*$/, '')));
    li.append(el('p', 'print-q', t(step.question)), lines(3));
    list.append(li);
  }
  page.append(list);
  const exit = el('div', 'print-exit');
  exit.append(el('h2', null, ui('print.exit')), el('p', 'print-q', t(tour.lesson.exitTicket)), lines(3));
  page.append(exit);
  const ids = [...new Set(questions(tour).flatMap(x => x.step.sources ?? []))];
  if (ids.length) {
    const box = el('div', 'print-sources');
    box.append(el('h2', null, ui('print.sources')));
    const ul = el('ul');
    ul.append(...ids.map(id => sourceItem(srcById[id], id)));
    box.append(ul);
    page.append(box);
  }
  return page;
}

function teacherSheet(tour, srcById) {
  const { lesson } = tour;
  const page = el('section', 'print-page print-teacher');
  page.append(head(tour, ui('print.teacher')));
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
  return page;
}

/**
 * Ritar elevbladet och lärarbladet för turen i root (#print-sheet) och öppnar webbläsarens utskrift.
 * Bladen tas bort efter utskriften. Ger false för en tur utan lärarfält.
 */
export async function printLesson(tour, root, { print = () => window.print() } = {}) {
  if (!tour?.lesson || !root) return false;
  let srcById = {};
  try { srcById = await loadSources(); } catch { /* utan källregistret skrivs källornas id ut */ }
  root.replaceChildren(studentSheet(tour, srcById), teacherSheet(tour, srcById));
  root.hidden = false;
  const done = () => { root.hidden = true; root.replaceChildren(); removeEventListener('afterprint', done); };
  addEventListener('afterprint', done);
  print();
  return true;
}
