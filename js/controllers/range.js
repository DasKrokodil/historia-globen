// Tidsintervallet (#569 del 2, #755): välj från och till, se vad som hände under hela intervallet och gå tillbaka till ett år.
// Beslut: docs/beslut/2026-11-07-tidsintervall-569.md. Ett år styr fortfarande allt (CLAUDE.md punkt 3): året är
// intervallets början, och tillståndet får ett slutår (state.range = { from, to }). Urvalet görs av selectEventsForRange
// (js/date-events.js) i händelselagret.
//
// Intervallet är läget 'intervall' i lägeskontraktet (MODE_RULES i js/state.js, #893):
// - det avslutar Fokus när det börjar, och kan inte börja under en tur, en lektion eller en jakt;
// - Fokus, en tur eller en jakt som börjar avslutar intervallet (store.onExit nedan);
// - att spela upp tiden eller dra i tidslinjen går tillbaka till ett år, så att det aldrig finns två rörliga tidsmodeller.
//
// Valet görs med två årsfält med f.Kr.-val och stegknappar, inte två handtag på tidslinjen (mobil och pekskärm).
// Formuläret öppnas från årshoppet ("Välj ett tidsintervall"). Det aktiva intervallet syns som en rad under årtalet
// ("1914–1918 · 23 händelser") med knappen "Tillbaka till ett år", som går till intervallets slutår.
// Epokknapparna (#845 del 3, #965) sitter överst i formuläret, en grupp per indelning i data/perioder.json. De är genvägar
// till ett intervall som redan går att välja, inte ett nytt läge: ett klick gör samma sak som att fylla i Från och Till.
import { formatYear, yearParts, parseYear, loadPerioder, t } from '../model.js';
import { periodToRange } from '../period-range.js';
import { MIN_YEAR, MAX_YEAR } from '../timeline.js';
import { ui } from '../i18n.js';

const plural = (key, n, vars = {}) => String(ui(key)[n === 1 ? 0 : 1]).replace(/\{(\w+)\}/g, (m, k) => (k === 'count' ? n : vars[k] ?? m));

/** Intervallet som text: "1914–1918", "500–400 f.Kr." eller "50 f.Kr.–50". Ger [siffror, tideräkning] för huvudet. */
export function rangeParts(from, to) {
  const [n1, e1] = yearParts(from), [n2, e2] = yearParts(to);
  return e1 === e2 ? [`${n1}–${n2}`, e1] : [`${formatYear(from)}–${formatYear(to)}`, ''];
}
export const rangeText = (from, to) => rangeParts(from, to).filter(Boolean).join(' ');

export function createRange(app) {
  const { $, state, store, timeline } = app;
  let setting = false; // intervallet ställer själv in året: den ändringen stänger det inte

  // ---- Formuläret: två årsfält med f.Kr.-val och stegknappar ----
  const pop = document.createElement('form');
  pop.id = 'range-pop'; pop.className = 'jump-pop range-pop'; pop.hidden = true; pop.autocomplete = 'off';
  pop.setAttribute('aria-labelledby', 'range-pop-title');
  const title = document.createElement('p');
  title.id = 'range-pop-title'; title.className = 'jump-label'; title.textContent = ui('range.title');
  const msg = document.createElement('p');
  msg.id = 'range-msg'; msg.className = 'jump-msg'; msg.setAttribute('role', 'alert');

  /** Ett årsfält: siffran i fältet och f.Kr.-knappen; value är astronomiskt år. */
  function field(id, label) {
    const row = document.createElement('div');
    row.className = 'range-row';
    const lab = document.createElement('label');
    lab.className = 'range-label'; lab.htmlFor = id; lab.textContent = label;
    const minus = document.createElement('button'), plus = document.createElement('button');
    minus.type = plus.type = 'button';
    minus.className = plus.className = 'range-step';
    minus.textContent = '−'; plus.textContent = '+';
    minus.setAttribute('aria-label', ui('range.earlier', { field: label }));
    plus.setAttribute('aria-label', ui('range.later', { field: label }));
    const input = document.createElement('input');
    input.id = id; input.className = 'jump-input range-input'; input.type = 'text'; input.inputMode = 'numeric';
    input.setAttribute('aria-describedby', 'range-msg');
    const era = document.createElement('button');
    era.type = 'button'; era.className = 'jump-era-btn'; era.textContent = ui('time.bce');
    era.title = ui('range.bceTitle'); era.setAttribute('aria-pressed', 'false');
    era.setAttribute('aria-label', `${label}: ${ui('range.bceTitle')}`);
    row.append(lab, minus, input, plus, era);
    const bce = () => era.getAttribute('aria-pressed') === 'true';
    const f = {
      row, input,
      /** Astronomiskt år ur fältet, eller null när det inte går att läsa. */
      get value() { return parseYear(input.value, bce() ? 'bce' : 'ce'); },
      set value(y) {
        const isBce = y <= 0;
        input.value = String(isBce ? 1 - y : y);
        era.setAttribute('aria-pressed', String(isBce));
      },
    };
    const step = d => {
      const y = f.value ?? 0;
      f.value = Math.max(MIN_YEAR, Math.min(MAX_YEAR, y + d)); // över gränsen mellan f.Kr. och e.Kr. (1 f.Kr. + 1 = 1 e.Kr.)
      msg.textContent = '';
      input.focus();
    };
    minus.addEventListener('click', () => step(-1));
    plus.addEventListener('click', () => step(1));
    era.addEventListener('click', () => { era.setAttribute('aria-pressed', String(!bce())); msg.textContent = ''; input.focus(); });
    input.addEventListener('input', () => { msg.textContent = ''; });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); step(e.key === 'ArrowUp' ? 1 : -1); }
    });
    return f;
  }
  const fromField = field('range-from', ui('range.from'));
  const toField = field('range-to', ui('range.to'));
  const actions = document.createElement('div');
  actions.className = 'range-actions';
  const show = document.createElement('button');
  show.type = 'submit'; show.className = 'jump-go'; show.textContent = ui('range.show');
  const cancel = document.createElement('button');
  cancel.type = 'button'; cancel.className = 'link-btn'; cancel.textContent = ui('range.cancel');
  actions.append(show, cancel);
  const presets = document.createElement('div');
  presets.id = 'range-presets'; presets.className = 'range-presets';
  pop.append(title, presets, fromField.row, toField.row, msg, actions);
  $('jump-pop').after(pop);

  // Länken i årshoppet öppnar formuläret
  const openBtn = document.createElement('button');
  openBtn.type = 'button'; openBtn.id = 'range-open'; openBtn.className = 'link-btn range-open';
  openBtn.textContent = ui('range.open');
  openBtn.setAttribute('aria-controls', 'range-pop');
  openBtn.setAttribute('aria-expanded', 'false');
  $('jump-msg').after(openBtn);

  /** Länken erbjuds bara när lägeskontraktet faktiskt tillåter ett intervall (#981). */
  function syncAvailability() {
    const blocked = !store.canEnter('intervall');
    openBtn.hidden = blocked;
    if (blocked) closeForm(false);
  }
  // En tur, lektion eller jakt kan börja efter den vanliga omritningen (till exempel från en länk i adressen).
  // Följ därför själva lägesändringen, inte bara nästa render.
  store.subscribe(({ type }) => { if (type === 'mode') syncAvailability(); });
  syncAvailability();

  // ---- Raden med det aktiva intervallet ----
  const bar = document.createElement('p');
  bar.id = 'range-bar'; bar.className = 'range-bar'; bar.hidden = true;
  const barText = document.createElement('span');
  barText.id = 'range-bar-text';
  barText.setAttribute('aria-live', 'polite');
  barText.setAttribute('aria-atomic', 'true');
  const exitBtn = document.createElement('button');
  exitBtn.type = 'button'; exitBtn.id = 'range-exit'; exitBtn.className = 'link-btn range-exit';
  exitBtn.textContent = ui('range.exit');
  bar.append(barText, ' ', exitBtn);
  // Två rader till under raden (#756): vilket år riken och religionerna visas för, och hur många markörer gränsen döljer
  const areasNote = document.createElement('span');
  areasNote.id = 'range-areas'; areasNote.className = 'range-note'; areasNote.hidden = true;
  const capNote = document.createElement('span');
  capNote.id = 'range-capped'; capNote.className = 'range-note'; capNote.hidden = true;
  bar.append(areasNote, capNote);
  $('year-segment').after(bar);

  // ---- Epokknapparna: byggs första gången formuläret öppnas, när data/perioder.json har laddats ----
  let presetsBuilt = false;
  const presetButtons = [];
  function buildPresets() {
    if (presetsBuilt) return;
    presetsBuilt = true;
    loadPerioder().then(divisions => {
      divisions.forEach(div => {
        const group = document.createElement('section');
        group.className = 'range-preset-group'; group.setAttribute('role', 'group');
        const head = document.createElement('h2');
        head.id = `range-preset-${div.id}`; head.className = 'range-preset-head'; head.textContent = t(div.name);
        group.setAttribute('aria-labelledby', head.id);
        const note = document.createElement('p');
        note.className = 'range-preset-note'; note.textContent = t(div.simplification);
        const list = document.createElement('div');
        list.className = 'range-preset-list';
        div.periods.forEach(period => {
          const r = periodToRange(period, MIN_YEAR, MAX_YEAR);
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'range-preset'; b.dataset.period = period.id;
          const name = document.createElement('span');
          name.className = 'range-preset-name'; name.textContent = t(period.name);
          const years = document.createElement('span');
          years.className = 'range-preset-years';
          const extra = [r.clippedStart && ui('range.preset.clipped'), r.openEnd && ui('range.preset.today')].filter(Boolean);
          years.textContent = [rangeText(r.from, r.to), ...extra].join(' · ');
          // Namn med årtal läses redan i sin helhet. Övriga knappar behåller den egna årsraden och dess förklaringar.
          if (/\d/.test(name.textContent)) years.setAttribute('aria-hidden', 'true');
          b.append(name, years);
          b.addEventListener('click', () => choosePreset(r));
          presetButtons.push(b);
          list.append(b);
        });
        group.append(head, note, list);
        presets.append(group);
      });
      syncPresets();
    });
  }
  /** Knapparna är inaktiva när ett annat läge stoppar intervallet (en tur, en lektion eller en jakt); texten är den vanliga. */
  function syncPresets() {
    const blocked = !store.canEnter('intervall');
    presetButtons.forEach(b => { b.disabled = blocked; });
    if (blocked) msg.textContent = ui('range.blocked');
  }
  function choosePreset(r) {
    if (!set(r.from, r.to)) { msg.textContent = ui('range.blocked'); return; }
    closeForm(false);
    exitBtn.focus({ preventScroll: true });
  }

  function openForm() {
    if (!store.canEnter('intervall')) return;
    const r = state.range, y = Math.floor(timeline.year);
    fromField.value = r ? r.from : y;
    toField.value = r ? r.to : Math.min(MAX_YEAR, y + 10);
    msg.textContent = '';
    $('jump-pop').hidden = true; $('year-jump').setAttribute('aria-expanded', 'false');
    pop.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    fitPop();
    buildPresets();
    syncPresets();
    fromField.input.focus();
    fromField.input.select?.();
  }
  /** Formuläret rullar, men får aldrig sluta under skärmens nederkant: knapparna "Visa intervallet" och "Avbryt" ligger längst ner (#973). */
  function fitPop() {
    if (pop.hidden) return;
    pop.style.maxHeight = '';
    const top = pop.getBoundingClientRect().top;
    pop.style.maxHeight = `${Math.max(160, Math.floor(innerHeight - top - 12))}px`;
  }
  window.addEventListener('resize', fitPop);
  function closeForm(refocus = true) {
    if (pop.hidden) return;
    pop.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
    if (refocus) $('year-jump').focus({ preventScroll: true });
  }
  openBtn.addEventListener('click', openForm);
  cancel.addEventListener('click', () => closeForm());
  pop.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); closeForm(); } });
  document.addEventListener('pointerdown', e => { if (!pop.hidden && !pop.contains(e.target) && !openBtn.contains(e.target)) closeForm(false); });
  pop.addEventListener('submit', e => {
    e.preventDefault();
    const a = fromField.value, b = toField.value;
    if (a == null || b == null) { msg.textContent = ui('time.error.input'); return; }
    const lo = Math.min(a, b), hi = Math.max(a, b);
    if (lo < MIN_YEAR || hi > MAX_YEAR) { msg.textContent = ui('range.bounds', { min: formatYear(MIN_YEAR), max: formatYear(MAX_YEAR) }); return; }
    if (lo === hi) { msg.textContent = ui('range.same'); return; }
    if (!store.canEnter('intervall')) { msg.textContent = ui('range.blocked'); return; }
    closeForm(false);
    set(lo, hi);
    exitBtn.focus({ preventScroll: true });
  });

  /** Väljer intervallet från–till (from < to). Avslutar Fokus (lägeskontraktet). Ger false när ett annat läge stoppar det. */
  function set(from, to) {
    if (![from, to].every(Number.isFinite)) return false;
    from = Math.max(MIN_YEAR, Math.min(MAX_YEAR, from));
    to = Math.max(MIN_YEAR, Math.min(MAX_YEAR, to));
    if (from >= to) return false;
    if (!store.enter('intervall')) return false;
    setting = true;
    try {
      timeline.pause();
      store.setRange({ from, to });
      timeline.year = from;
      timeline.setRange(state.range);
    } finally { setting = false; }
    app.refresh();
    return true;
  }

  /**
   * Stänger intervallet. year: året som gäller efteråt; utan year står året kvar (till exempel när uppspelningen eller
   * Fokus tar över). "Tillbaka till ett år" går till intervallets slutår.
   */
  function close({ year = null, redraw = true } = {}) {
    if (!state.range) return;
    store.leave(['intervall']);
    store.setRange(null);
    timeline.setRange(null);
    if (year != null) { setting = true; try { timeline.year = year; } finally { setting = false; } }
    if (redraw) app.refresh();
  }
  exitBtn.addEventListener('click', () => {
    close({ year: state.range.to });
    $('year-jump').focus({ preventScroll: true });
  });
  // Fokus, en tur eller en jakt avslutar intervallet; de ställer själva in år och vy
  store.onExit('intervall', () => close({ redraw: false }));
  // Uppspelning och dragning i tidslinjen går tillbaka till ett år (beslutet om tidsintervall, 2026-11-07)
  timeline.addEventListener('playstate', () => { if (timeline.playing && state.range) close(); });
  timeline.addEventListener('change', () => { if (state.range && !setting && timeline.year !== state.range.from) close(); });

  /**
   * Raden och årtalet i huvudet. count: händelser som syns i intervallet. Anropas av omritningen.
   * areasYear: året riken och religionerna ritas för (slutåret), eller null när inget av lagren syns (#756).
   * capped: { shown, total } när markörgränsen döljer markörer, annars null; listan har ändå alla.
   */
  function render(count, { areasYear = null, capped = null } = {}) {
    syncAvailability();
    const r = state.range;
    bar.hidden = !r;
    $('year-jump').classList.toggle('is-range', !!r);
    if (!r) { barText.textContent = ''; return; }
    const text = `${rangeText(r.from, r.to)} · ${plural('range.count', count, { count })}`;
    if (barText.textContent !== text) barText.textContent = text; // samma omritning ska inte köa samma uppläsning igen
    areasNote.hidden = areasYear == null;
    areasNote.textContent = areasYear == null ? '' : ui('range.areasAt', { year: formatYear(areasYear) });
    capNote.hidden = !capped;
    capNote.textContent = capped ? ui('range.capped', { shown: capped.shown, total: capped.total }) : '';
  }

  return { set, close, render, openForm, get active() { return !!state.range; } };
}
