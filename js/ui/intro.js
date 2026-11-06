// Frivillig introduktion (#363, #516): tre stilla steg med befintliga händelser och en fun fact.
// Texterna, id:na och startåret ligger i data/intro.json.
import { formatEventTime, t } from '../model.js';

async function getJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Kunde inte läsa ${path} (${res.status})`);
  return res.json();
}

export async function loadIntro() {
  try { return await getJSON('data/intro.json'); }
  catch (err) {
    console.warn('Introduktionen kunde inte laddas', err);
    return null;
  }
}

const focusable = root => [...root.querySelectorAll('button:not([disabled]), [href], input:not([disabled])')]
  .filter(el => !el.hidden && el.offsetParent !== null);

export class Intro {
  constructor({ root, close, progress, title, content, back, next, skip }, data, { events, funfacts, onStart, onExplore, onFollow, onTask, fallbackFocus }) {
    Object.assign(this, { root, closeBtn: close, progress, title, content, back, next, skip, data, events, funfacts, onStart, onExplore, onFollow, onTask, fallbackFocus });
    this.step = 0;
    this.opener = null;
    this.byId = Object.fromEntries(events.map(event => [event.id, event]));
    this.funfact = funfacts.find(funfact => funfact.id === data?.funfact);
    this.ready = Boolean(Number.isInteger(data?.year) && data.steps?.length && this.funfact && data.steps.every(step => !step.event || this.byId[step.event]));
    if (!this.ready) return;

    close.setAttribute('aria-label', t(data.labels.close));
    skip.textContent = t(data.labels.skip);
    back.textContent = t(data.labels.back);
    next.textContent = t(data.labels.next);
    close.addEventListener('click', () => this.close());
    skip.addEventListener('click', () => this.close());
    back.addEventListener('click', () => this.showStep(this.step - 1));
    next.addEventListener('click', () => this.showStep(this.step + 1));
    // När Nästa döljs på sista kortet kan webbläsaren flytta fokus till sidan. Lyssna därför på
    // dokumentet medan dialogen är öppen, så att Escape och fokusfällan alltid hör till rutan.
    document.addEventListener('keydown', event => {
      if (!root.hidden) this.onKeydown(event);
    });
  }

  open(opener = null) {
    if (!this.ready) return;
    this.opener = opener;
    this.onStart?.(this.data.year);
    this.root.hidden = false;
    this.showStep(0);
    requestAnimationFrame(() => this.closeBtn.focus({ preventScroll: true }));
  }

  close(refocus = true) {
    if (this.root.hidden) return;
    this.root.hidden = true;
    if (refocus) {
      const fallback = typeof this.fallbackFocus === 'function' ? this.fallbackFocus() : this.fallbackFocus;
      const target = this.opener?.isConnected && this.opener.offsetParent !== null ? this.opener : fallback;
      target?.focus({ preventScroll: true });
    }
    this.opener = null;
  }

  onKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== 'Tab') return;
    const buttons = focusable(this.root);
    if (!buttons.length) return;
    const first = buttons[0], last = buttons.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }

  showStep(index) {
    this.step = Math.max(0, Math.min(index, this.data.steps.length - 1));
    const step = this.data.steps[this.step], labels = this.data.labels;
    this.progress.textContent = t(labels.step).replace('{current}', String(this.step + 1)).replace('{total}', String(this.data.steps.length));
    this.title.textContent = t(step.title);
    this.content.replaceChildren(this.card(step, labels));
    const last = this.step === this.data.steps.length - 1;
    this.back.hidden = this.step === 0;
    this.next.hidden = last;
    this.skip.hidden = last;
  }

  card(step, labels) {
    const card = document.createElement('div');
    card.className = `intro-card intro-${step.kind}`;
    const text = document.createElement('p');
    text.className = 'intro-text'; text.textContent = t(step.text); card.append(text);
    if (step.kind === 'event' || step.kind === 'funfact') {
      const event = this.byId[step.event];
      card.append(this.eventCard(event, step.kind === 'event' ? t(labels.event) : t(labels.sameYear)));
      if (step.kind === 'funfact') {
        const fact = document.createElement('p');
        fact.className = 'intro-funfact'; fact.textContent = t(this.funfact.text); card.append(fact);
      }
    }
    if (step.kind === 'choices') {
      const choices = document.createElement('div');
      choices.className = 'intro-choices';
      for (const [id, callback] of [['explore', this.onExplore], ['follow', this.onFollow], ['task', this.onTask]]) {
        const button = document.createElement('button');
        button.type = 'button'; button.className = id === 'explore' ? 'intro-choice primary' : 'intro-choice';
        button.textContent = t(labels[id]);
        button.addEventListener('click', () => { this.close(false); callback?.(); });
        choices.append(button);
      }
      card.append(choices);
    }
    return card;
  }

  eventCard(event, label) {
    const card = document.createElement('div'); card.className = 'intro-event';
    const labelEl = document.createElement('p'); labelEl.className = 'intro-event-label'; labelEl.textContent = label;
    const name = document.createElement('h3'); name.className = 'intro-event-title'; name.textContent = t(event.title);
    const meta = document.createElement('p'); meta.className = 'intro-event-meta'; meta.textContent = `${formatEventTime(event)} · ${t(event.place)}`;
    card.append(labelEl, name, meta);
    return card;
  }
}
