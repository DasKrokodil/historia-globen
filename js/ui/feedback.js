// Besökarnas förslag (docs/feedback.md): ett formulär i samma stil som Hjälp-kortet. Öppnas från Hjälp
// ("Lämna förslag") och från en händelses faktaruta ("Rapportera faktafel"). Året, fokus och globens vy rörs inte.
//
// Avstängt tills index.html har en site key för Cloudflare Turnstile (data-sitekey) OCH integritetstexten är
// godkänd (data-privacy="approved"). Avstängt visas länkar till repots issue-mallar, skicka-knappen är avstängd och
// inget externt skript laddas. Påslaget laddas Turnstiles skript först när formuläret öppnas.
// Händelser skickar bara id:t för titel och tid. Övriga faktarutor skickar en validerad
// objektmarkör; adressen rensas alltid från sökparametrar och fragment.
import { FEEDBACK_CATEGORIES, LIMITS, validateFeedback } from '../feedback-rules.js';
import { ui } from '../i18n.js';
import { t, formatEventTime } from '../model.js';

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const message = (field, error) => ui(`feedback.error.${field}.${error}`, {
  descriptionMin: LIMITS.descriptionMin, descriptionMax: LIMITS.descriptionMax,
  sourceMax: LIMITS.sourceMax, emailMax: LIMITS.emailMax,
});
const FIELD_ORDER = ['category', 'description', 'source', 'email'];
const serverError = error => ui(`feedback.server.${error}`);

let turnstileLoading = null;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  turnstileLoading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = TURNSTILE_SRC; s.async = true; s.defer = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')));
    s.onerror = () => { turnstileLoading = null; reject(new Error('turnstile')); };
    document.head.append(s);
  });
  return turnstileLoading;
}

export class Feedback {
  constructor(root) {
    this.root = root;
    const $ = id => root.querySelector(`#${id}`);
    Object.assign(this, {
      form: $('fb-form'), closed: $('fb-closed'), errorsEl: $('fb-errors'), category: $('fb-category'),
      eventBox: $('fb-event'), eventTitle: $('fb-event-title'), eventTime: $('fb-event-time'),
      description: $('fb-description'), source: $('fb-source'), email: $('fb-email'), website: $('fb-website'),
      count: $('fb-count'), widget: $('fb-turnstile'), status: $('fb-status'), submit: $('fb-submit'),
      done: $('fb-done'), closeBtn: $('fb-close'),
    });
    this.endpoint = root.dataset.endpoint || '/api/feedback';
    this.event = null;
    this.object = null;
    this.opener = null;
    this.token = '';
    this.widgetId = null;
    this.sending = false;
    this.serverClosed = false; // servern svarade att formuläret är avstängt (#1581): då ska länkarna till GitHub synas

    for (const c of FEEDBACK_CATEGORIES) this.category.add(new Option(ui(`feedback.category.${c.id}`), c.id));

    this.closeBtn.addEventListener('click', () => this.close());
    $('fb-cancel').addEventListener('click', () => this.close()); // Avbryt i den fasta raden nedtill (#310), samma som Stäng
    $('fb-done-close').addEventListener('click', () => this.close());
    $('fb-again').addEventListener('click', () => { this.done.hidden = true; this.form.hidden = false; this.category.focus(); });
    this.category.addEventListener('change', () => { this.renderEvent(); this.clearError('category'); });
    this.description.addEventListener('input', () => { this.renderCount(); this.clearError('description'); });
    this.source.addEventListener('input', () => this.clearError('source'));
    this.email.addEventListener('input', () => this.clearError('email'));
    this.form.addEventListener('submit', ev => { ev.preventDefault(); this.send(); });
    // Escape stänger formuläret och inget annat (faktarutan och listan ligger kvar)
    root.addEventListener('keydown', ev => {
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); this.close(); }
    });
    // Länkarna i felsammanfattningen flyttar fokus till fältet
    this.errorsEl.addEventListener('click', ev => {
      const a = ev.target.closest('a[data-field]');
      if (!a) return;
      ev.preventDefault();
      this[a.dataset.field]?.focus();
    });
  }

  /** Påslaget bara med site key och godkänd integritetstext (läses varje gång, så att ett test kan ändra dem). */
  get enabled() {
    return !!this.root.dataset.sitekey && this.root.dataset.privacy === 'approved';
  }

  /**
   * Öppna formuläret. opener = knappen som öppnade det (fokus går tillbaka dit). event = händelsen när
   * besökaren rapporterar ett faktafel från faktarutan; då är kategorin faktafel förvald.
   */
  open({ opener = null, event = null, object = null } = {}) {
    this.opener = opener;
    const wasOpen = !this.root.hidden;
    if (event || object || !wasOpen) {
      this.event = event;
      this.object = object;
      if (event || object) this.category.value = 'correction';
      this.done.hidden = true; this.form.hidden = false;
    }
    this.renderEvent();
    this.renderCount();
    this.applyMode();
    this.place();
    this.root.hidden = false;
    this.root.scrollTop = 0;
    (event ? this.description : this.category).focus({ preventScroll: true });
    if (this.enabled) this.mountTurnstile();
  }

  /** Stäng utan att röra det besökaren har skrivit. Fokus tillbaka till knappen som öppnade formuläret. */
  close() {
    if (this.root.hidden) return;
    this.root.hidden = true;
    const back = this.opener?.isConnected && this.opener.offsetParent !== null ? this.opener : document.getElementById('btn-help');
    back?.focus({ preventScroll: true });
  }

  /** I dator till vänster under rubriken, så att globen och faktarutan syns; i mobil under knapparna. */
  place() {
    const wide = innerWidth > 760;
    const anchor = wide ? document.querySelector('.masthead') : document.querySelector('.top-actions');
    const top = Math.round((anchor?.getBoundingClientRect().bottom ?? 80) + 10);
    this.root.classList.toggle('fb-left', wide);
    this.root.style.top = `${top}px`;
    this.root.style.maxHeight = `calc(100dvh - ${top + (wide ? 150 : 130)}px)`;
  }

  applyMode() {
    const on = this.enabled;
    // Reservlänkarna syns när formuläret är avstängt i klienten eller när servern säger att det är avstängt (#1581)
    const closed = !on || this.serverClosed;
    this.closed.hidden = !closed;
    this.submit.disabled = !on || this.sending;
    if (closed) this.submit.setAttribute('aria-describedby', 'fb-closed'); else this.submit.removeAttribute('aria-describedby');
  }

  renderEvent() {
    const show = !!(this.event || this.object) && this.category.value === 'correction';
    this.eventBox.hidden = !show;
    if (show) {
      this.eventTitle.textContent = this.event ? t(this.event.title) : `${this.object.label} (${this.object.id})`;
      this.eventTime.textContent = this.event ? formatEventTime(this.event) : ui('feedback.objectYear', { year: this.object.year });
    }
  }

  renderCount() {
    const n = this.description.value.trim().length;
    this.count.textContent = n ? ui('feedback.count', { n, max: LIMITS.descriptionMax }) : '';
  }

  mountTurnstile() {
    if (this.widgetId !== null) return;
    loadTurnstile().then(ts => {
      if (this.widgetId !== null) return;
      this.widgetId = ts.render(this.widget, {
        sitekey: this.root.dataset.sitekey,
        theme: 'dark', language: 'sv', action: 'feedback',
        callback: token => { this.token = token; },
        'expired-callback': () => { this.token = ''; },
        'error-callback': () => { this.token = ''; },
      });
    }).catch(() => {
      this.setStatus(ui('feedback.turnstileLoadFailed'), true);
    });
  }

  resetTurnstile() {
    this.token = '';
    if (this.widgetId !== null) { try { window.turnstile?.reset(this.widgetId); } catch { /* ingen widget */ } }
  }

  // ---------- Fel ----------
  fieldEl(name) { return FIELD_ORDER.includes(name) ? this[name] : null; }

  clearError(name) {
    const el = this.fieldEl(name);
    const err = this.root.querySelector(`#fb-${name}-err`);
    if (!el || el.getAttribute('aria-invalid') !== 'true') return;
    el.removeAttribute('aria-invalid');
    err.hidden = true; err.textContent = '';
  }

  showErrors(errors) {
    const names = FIELD_ORDER.filter(n => errors[n]);
    for (const n of FIELD_ORDER) {
      const el = this.fieldEl(n), err = this.root.querySelector(`#fb-${n}-err`);
      const msg = errors[n] ? message(n, errors[n]) : '';
      if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
      err.textContent = msg; err.hidden = !msg;
    }
    if (!names.length) { this.errorsEl.hidden = true; this.errorsEl.textContent = ''; return; }
    const label = n => this.root.querySelector(`label[for="fb-${n}"]`).firstChild.textContent.trim();
    this.errorsEl.innerHTML = `<p>${ui(names.length === 1 ? 'feedback.errorSummary.one' : 'feedback.errorSummary.many', { n: names.length })}</p><ul></ul>`;
    const ul = this.errorsEl.querySelector('ul');
    for (const n of names) {
      const li = document.createElement('li'), a = document.createElement('a');
      a.href = `#fb-${n}`; a.dataset.field = n;
      a.textContent = `${label(n)} – ${message(n, errors[n])}`;
      li.append(a); ul.append(li);
    }
    this.errorsEl.hidden = false;
    this.fieldEl(names[0]).focus();
  }

  setStatus(text, isError = false) {
    this.status.textContent = text;
    this.status.classList.toggle('is-error', isError);
  }

  // ---------- Skicka ----------
  async send() {
    if (this.sending) return;
    this.setStatus('');
    const input = {
      category: this.category.value, description: this.description.value, source: this.source.value, email: this.email.value,
      eventId: this.event && this.category.value === 'correction' ? this.event.id : '',
    };
    const { errors, value } = validateFeedback(input);
    this.showErrors(errors);
    if (Object.keys(errors).length) return;
    if (!this.enabled) { this.setStatus(ui('feedback.server.disabled'), true); return; }
    if (!this.token) { this.setStatus(ui('feedback.waitForTurnstile'), true); return; }

    const body = { category: value.category, description: value.description, turnstileToken: this.token, website: this.website.value };
    if (value.source) body.source = value.source;
    if (value.email) body.email = value.email;
    if (value.eventId) body.eventId = value.eventId;
    if (this.object && value.category === 'correction') {
      body.objectType = this.object.type;
      body.objectId = this.object.id;
      body.objectYear = String(this.object.year);
      body.pageUrl = currentPageUrl();
    }

    this.sending = true; this.applyMode();
    this.form.setAttribute('aria-busy', 'true');
    this.setStatus(ui('feedback.sending'));
    let res = null, out = null;
    try {
      res = await fetch(this.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'same-origin' });
      out = await res.json().catch(() => null);
    } catch { /* nätverksfel */ }
    this.sending = false; this.applyMode();
    this.form.removeAttribute('aria-busy');
    this.resetTurnstile(); // en token gäller bara en gång
    if (out?.error === 'disabled') { this.serverClosed = true; this.applyMode(); } // servern är avstängd trots att klienten är påslagen (#1581)

    if (res?.status === 201 && out?.ok === true) {
      this.form.reset();
      this.event = null; this.object = null;
      this.renderEvent(); this.renderCount();
      this.setStatus('');
      this.form.hidden = true; this.done.hidden = false;
      this.done.focus();
      return;
    }
    if (res?.status === 400 && out?.fields) {
      this.setStatus('');
      this.showErrors(out.fields);
      if (!Object.keys(out.fields).some(k => FIELD_ORDER.includes(k))) this.setStatus(serverError(out.error) || ui('feedback.receiveFailed'), true);
      return;
    }
    const msg = !res ? ui('feedback.networkFailed') : (serverError(out?.error) || ui('feedback.sendFailed'));
    this.setStatus(msg, true);
  }
}

/** Samma sida men utan besökarens sökparametrar eller fragment. */
export function currentPageUrl(location = window.location) {
  const url = new URL(location.href);
  url.search = ''; url.hash = ''; url.username = ''; url.password = '';
  return url.href;
}
