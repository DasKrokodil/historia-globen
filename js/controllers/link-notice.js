// Besked om en trasig länk (#1324): en rad som säger vad i adressen som inte gick att öppna (en tur, något att följa, ett år).
// Raden fyller i det som js/url-state.js (decodeProblems) och js/controllers/address.js (det som saknas i datan) har samlat i
// felkanalen: en lista med { kind, why, value }. Sidan öppnas som förut; raden är bara en förklaring.
//
// - Samma plats och utseende som Fokus-beskedet (#focus-notice, .focus-notice i css/style.css). Statusraden (#link-notice,
//   role="status") finns hela tiden, så skärmläsaren läser upp texten när kortet visas; fokus flyttas aldrig dit.
// - Texten från adressen skrivs som text (textContent), aldrig som HTML, och kapas (cleanName).
// - Raden stängs av Stäng, Escape (stängregistret, js/surfaces.js, gruppen "besked"), nästa handling (tryck, hjul, en tangent
//   utom Tab och tillägg), ett nytt år, uppspelning, Bakåt/Framåt, en öppnad meny, panel eller dialog (CLOSES i js/surfaces.js)
//   och efter LINK_NOTICE_MS om ingen annan handling kommer.
import { ui } from '../i18n.js';

/** Hur länge raden ligger kvar om ingen annan handling kommer: 30 s (WCAG 2.2.1); Stäng och varje handling stänger den förr. */
export const LINK_NOTICE_MS = 30000;
/** Längsta namn som visas ur adressen, i tecken. */
export const NAME_MAX = 40;

/** Ui-nyckeln för ett problem ur felkanalen. */
export function noticeKey({ kind, why }) {
  if (kind === 'tour') return why === 'fetch' ? 'link.tourFetch' : 'link.noTour';
  if (kind === 'focus') return 'link.noFocus';
  return 'link.badYear';
}

/** Namnet ur adressen som kort, ofarlig text: styrtecken och riktningstecken bort, blanksteg ihop, högst NAME_MAX tecken. */
export function cleanName(value) {
  const text = String(value ?? '').replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g, ' ').replace(/\s+/g, ' ').trim();
  const chars = [...text];
  return chars.length > NAME_MAX ? `${chars.slice(0, NAME_MAX - 1).join('')}…` : text;
}

/** Raden för en lista med problem: en mening per problem, ett problem per slag (den första gäller). */
export function noticeText(problems, say = ui) {
  const seen = new Set();
  return (problems ?? []).filter(p => !seen.has(p.kind) && seen.add(p.kind))
    .map(p => say(noticeKey(p), { name: cleanName(p.value) })).join(' ');
}

export function createLinkNotice(app, { schedule = setTimeout, cancel = clearTimeout } = {}) {
  const { $, timeline, surfaces } = app;
  const card = $('link-notice-card'), text = $('link-notice-text'), close = $('link-notice-close');
  let timer = null;

  function hide() {
    if (timer != null) cancel(timer);
    timer = null;
    if (card.hidden) return;
    // Fokus på Stäng flyttas till årskontrollen, så att tangentbordet inte tappar sin plats
    if (card.contains(document.activeElement)) $('year-jump')?.focus({ preventScroll: true });
    card.hidden = true;
    text.textContent = '';
  }

  /** Visar raden för problemen, och döljer den om listan är tom. Ersätter en rad som redan visas. */
  function show(problems) {
    hide();
    const line = noticeText(problems);
    if (!line) return;
    text.textContent = line;
    card.hidden = false; // stängregistret märker det (watch) och stänger det som en ny yta stänger
    timer = schedule(hide, LINK_NOTICE_MS);
  }

  close.addEventListener('click', hide);
  surfaces.watch('link-notice', card, 'besked', () => hide());

  const dismiss = event => { if (!card.hidden && !card.contains(event.target)) hide(); };
  document.addEventListener('pointerdown', dismiss, true);
  document.addEventListener('wheel', dismiss, { capture: true, passive: true });
  document.addEventListener('keydown', event => {
    if (!['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'Escape'].includes(event.key)) dismiss(event); // Escape stängs av stängregistret
  }, true);
  timeline.addEventListener('change', hide);
  timeline.addEventListener('playstate', () => { if (timeline.playing) hide(); });
  window.addEventListener('popstate', hide);
  return { show, hide };
}
