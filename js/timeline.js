// Tidsreglaget äger det nuvarande året (arkitekturprincip 3).
// Beslut 4: segmenterad skala där nutiden får mer plats än forntiden.
import { formatYear, parseYear, yearParts, edtfSpan, dayParts, formatDay, monthStarts, MONTHS_SHORT } from './model.js';

export const MIN_YEAR = -2999;   // 3000 f.Kr.
export const MAX_YEAR = 2026;

export const SEGMENTS = [
  { from: -2999, to: -500, a: 0.00, b: 0.25, name: 'Bronsålder och tidig järnålder' },
  { from:  -500, to: 1000, a: 0.25, b: 0.50, name: 'Antiken och tidig medeltid' },
  { from:  1000, to: 1800, a: 0.50, b: 0.75, name: 'Medeltid och tidigmodern tid' },
  { from:  1800, to: 2026, a: 0.75, b: 1.00, name: 'Modern tid' },
];

// [år, nivå]: 1 = alltid, 2 = från 600 px, 3 = från 900 px
const TICKS = [
  [-2999, 1], [-1999, 2], [-999, 3], [-499, 2], [1, 1], [500, 2], [1000, 1],
  [1200, 3], [1400, 2], [1600, 3], [1800, 1], [1900, 2], [1950, 3], [2000, 1],
];

const clampY = y => Math.max(MIN_YEAR, Math.min(MAX_YEAR, y));
const segFor = y => SEGMENTS.find(s => y <= s.to) ?? SEGMENTS.at(-1);
const segForPos = p => SEGMENTS.find(s => p <= s.b) ?? SEGMENTS.at(-1);

export function yearToPos(y) {
  y = clampY(y);
  const s = segFor(y);
  return s.a + (y - s.from) / (s.to - s.from) * (s.b - s.a);
}
export function posToYear(p) {
  p = Math.max(0, Math.min(1, p));
  const s = segForPos(p);
  return Math.round(s.from + (p - s.a) / (s.b - s.a) * (s.to - s.from));
}
/** Hur många år som ryms i en viss andel av reglaget vid ett givet år. */
export function yearsAcross(y, fraction) {
  const s = segFor(clampY(y));
  return (s.to - s.from) / (s.b - s.a) * fraction;
}
export const segmentName = y => segFor(clampY(y)).name;

/** Uppspelningens nivåer i år per sekund. */
const SPEEDS = [1, 5, 25, 100];
// Under 10 år/s visas en decimal, annars heltal, så att knappen blir kort (till exempel "17 år/s" i stället för "17,17 år/s")
const fmtNum = r => String(r < 10 ? Math.round(r * 10) / 10 : Math.round(r)).replace('.', ',');
const fmtRate = r => `${fmtNum(r)} år/s`;
// I fokusläget för korta krig (#204) räknas farten och stegen i dagar
const DAYS_PER_YEAR = 365.25;
const fmtDays = r => { const n = fmtNum(r * DAYS_PER_YEAR); return `${n} ${n === '1' ? 'dag' : 'dagar'}/s`; };

export class Timeline extends EventTarget {
  constructor({ track, thumb, segs, ticks, dots, ffMarks, playBtn, playIcon, stepBtns, speedBtn, pauseNote, pauseText, pauseGo }) {
    super();
    Object.assign(this, { track, thumb, playBtn, playIcon, speedBtn, pauseNote, pauseText, stepBtns, segsEl: segs, ticksEl: ticks });
    this._year = 1325;
    this.playing = false;
    this.focus = null; // { from, to, fine }: tidslinjen inzoomad på ett spann (fokusläge, #109)
    // fine: ett kort krig (#204). Då är året ett decimaltal, och skalan, stegen och farten räknas i dagar och månader.
    // Hastighet i år per sekund (#164). Det gamla sparade värdet ('hg-speed', ×-faktor) ignoreras.
    this.speed = 25;
    try { const v = Number(localStorage.getItem('hg-speed-ars')); if (SPEEDS.includes(v)) this.speed = v; } catch { /* utan lagring */ }
    this.dotsEl = dots; this.ffEl = ffMarks;
    this._drawScale();
    addEventListener('resize', () => { if (this.focus) this._drawScale(); }); // antal årtal beror på bredden

    speedBtn.addEventListener('click', () => {
      this.speed = SPEEDS[(SPEEDS.indexOf(this.speed) + 1) % SPEEDS.length];
      try { localStorage.setItem('hg-speed-ars', String(this.speed)); } catch { /* utan lagring */ }
      this._labelSpeed();
    });
    pauseGo?.addEventListener('click', () => this.play());
    this._labelPlay(false);
    this._labelSpeed();

    // Dra i reglaget
    const setFromX = x => {
      const r = track.getBoundingClientRect();
      this.year = this.toYear((x - r.left) / r.width);
    };
    track.addEventListener('pointerdown', e => { track.setPointerCapture(e.pointerId); this.pause(); setFromX(e.clientX); });
    track.addEventListener('pointermove', e => { if (track.hasPointerCapture(e.pointerId)) setFromX(e.clientX); });
    track.addEventListener('keydown', e => {
      const big = e.shiftKey ? 10 : 1;
      const map = { ArrowLeft: -big, ArrowRight: big, ArrowDown: -big, ArrowUp: big, PageDown: -100, PageUp: 100 };
      if (e.key in map) { this.year += map[e.key] * this.stepUnit; e.preventDefault(); }
      if (e.key === 'Home') { this.year = MIN_YEAR; e.preventDefault(); }
      if (e.key === 'End') { this.year = MAX_YEAR; e.preventDefault(); }
    });
    for (const b of stepBtns) b.addEventListener('click', () => { this.pause(); this.year += Number(b.dataset.step) * this.stepUnit; });
    playBtn.addEventListener('click', () => (this.playing ? this.pause() : this.play()));
  }

  /** Position (0–1) på reglaget för ett år, och tvärtom. I fokusläge är skalan linjär över spannet. */
  toPos(y) {
    if (!this.focus) return yearToPos(y);
    const { from, to } = this.focus;
    return Math.max(0, Math.min(1, (y - from) / (to - from)));
  }
  toYear(p) {
    if (!this.focus) return posToYear(p);
    const { from, to } = this.focus;
    const y = from + Math.max(0, Math.min(1, p)) * (to - from);
    return this.focus.fine ? y : Math.round(y);
  }
  /** Ett steg (knapparna och piltangenterna): ett år, eller en dag i fokusläget för korta krig. */
  get stepUnit() { return this.focus?.fine ? 1 / DAYS_PER_YEAR : 1; }
  /** Händelsens tid på reglaget: hela år, eller datum ur edtf i fokusläget för korta krig. */
  spanOf(e) { return this.focus?.fine ? edtfSpan(e) : [e.start, e.end]; }
  /** Året som text och som [stort, litet] för huvudet: "1879", eller "22 jan 1879" för korta krig. */
  format(y) { return this.focus?.fine ? formatDay(this._lastDay(y)) : formatYear(y); }
  formatParts(y) { return this.focus?.fine ? dayParts(this._lastDay(y)) : yearParts(y); }
  // Spannets slut är början av dagen efter krigets sista dag; där visas den sista dagen
  _lastDay(y) { return Math.min(y, this.focus.to - 0.5 / DAYS_PER_YEAR); }
  /** Hur många år före och efter som räknas som "samtidigt". */
  windowYears(y) {
    if (this.focus?.fine) return (this.focus.to - this.focus.from) * 0.03; // några dagar
    return this.focus ? Math.max(1, (this.focus.to - this.focus.from) * 0.03) : yearsAcross(y, 0.012);
  }

  /** Fokusläge: zooma in tidslinjen på ett spann, eller null för hela tiden. */
  setFocus(range) {
    this.pause();
    this.focus = range;
    if (!range?.fine) this._year = Math.floor(this._year); // utanför korta krig är året ett heltal
    this._labelSpeed();
    this._labelSteps();
    this._drawScale();
    if (this._marks) this.setMarks(...this._marks);
    if (range && (this._year < range.from || this._year > range.to)) this.year = range.from;
    else this._render();
  }

  _drawScale() {
    this.segsEl.replaceChildren(); this.ticksEl.replaceChildren();
    if (this.focus?.fine) { this._drawMonths(); return; }
    if (this.focus) {
      const { from, to } = this.focus, span = to - from;
      // Så många årtal som får plats utan att överlappa, på jämna år. Före vår
      // tideräkning räknas jämnheten på det visade året (700 f.Kr. = -699).
      const fit = Math.max(3, Math.floor(this.track.clientWidth / 90));
      const step = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find(s => span / s <= fit) ?? 2000;
      for (let v = Math.ceil(from / step) * step; v <= to + step; v += step) {
        const y = v < 0 ? v + 1 : v;
        if (v === 0 || y < from || y > to) continue;
        const d = document.createElement('div');
        d.className = 'tick lvl1' + (y === from ? ' first' : '');
        d.style.left = `${this.toPos(y) * 100}%`;
        d.textContent = formatYear(y);
        this.ticksEl.append(d);
      }
      const d = document.createElement('div');
      d.className = 'seg'; d.style.width = '100%';
      this.segsEl.append(d);
      return;
    }
    for (const s of SEGMENTS) {
      const d = document.createElement('div');
      d.className = 'seg'; d.style.width = `${(s.b - s.a) * 100}%`; d.title = s.name;
      this.segsEl.append(d);
    }
    for (const [y, level] of TICKS) {
      const d = document.createElement('div');
      d.className = `tick lvl${level}` + (y === MIN_YEAR ? ' first' : '');
      d.style.left = `${yearToPos(y) * 100}%`;
      d.textContent = y === 1 ? '0' : formatYear(y);
      this.ticksEl.append(d);
    }
  }

  /** Skalan för korta krig (#204): månader, så många som får plats, med året vid den första och vid januari. */
  _drawMonths() {
    const { from, to } = this.focus;
    const months = monthStarts(from, to);
    const fit = Math.max(3, Math.floor(this.track.clientWidth / 70));
    const step = [1, 2, 3, 6, 12].find(s => Math.ceil(months.length / s) <= fit) ?? 12;
    const tick = (y, text, first) => {
      const d = document.createElement('div');
      d.className = 'tick lvl1' + (first ? ' first' : '');
      d.style.left = `${this.toPos(y) * 100}%`;
      d.textContent = text;
      this.ticksEl.append(d);
    };
    // Ryms kriget inom en månad blir det bara startdatumet
    if (!months.length) tick(from, formatDay(from), true);
    months.forEach(({ t, y, m }, i) => {
      if (i % step) return;
      tick(t, i === 0 || m === 0 ? `${MONTHS_SHORT[m]} ${formatYear(y)}` : MONTHS_SHORT[m], false);
    });
    const d = document.createElement('div');
    d.className = 'seg'; d.style.width = '100%';
    this.segsEl.append(d);
  }

  get year() { return this._year; }
  set year(y) {
    y = clampY(this.focus?.fine ? y : Math.round(y));
    if (this.focus) y = Math.max(this.focus.from, Math.min(this.focus.to, y)); // stanna inom fokusspannet
    if (y === this._year) return;
    this._year = y;
    this._render();
    this.dispatchEvent(new CustomEvent('change', { detail: { year: y } }));
  }

  /** Markeringar på reglaget: en prick per händelse, ett streck för spann, en romb per fun fact. */
  setMarks(events, funfacts, colorOf) {
    this._marks = [events, funfacts, colorOf];
    const inView = y => !this.focus || (y >= this.focus.from && y <= this.focus.to);
    this.dotsEl.replaceChildren();
    for (const e of events) {
      const [s0, s1] = this.spanOf(e);
      if (this.focus && (s1 < this.focus.from || s0 > this.focus.to)) continue;
      // I fokusläget för korta krig är ett datum en dag lång, och det ritas som en prick
      const a = this.toPos(s0), b = this.focus?.fine && s1 - s0 <= 1.5 / DAYS_PER_YEAR ? a : this.toPos(s1);
      const d = document.createElement('div');
      if (b - a > 0.004) {
        d.className = 'tspan';
        d.style.left = `${a * 100}%`; d.style.width = `${(b - a) * 100}%`;
      } else {
        d.className = 'tdot';
        d.style.left = `${a * 100}%`;
      }
      d.style.background = colorOf(e);
      this.dotsEl.append(d);
    }
    this.ffEl.replaceChildren();
    for (const f of funfacts) {
      const mid = (f.show[0] + f.show[1]) / 2;
      if (!inView(mid)) continue;
      const d = document.createElement('div');
      d.className = 'tff';
      d.style.left = `${this.toPos(mid) * 100}%`;
      this.ffEl.append(d);
    }
  }

  /** År per sekund just nu. I fokusläge ungefär en tiondel av nivån, och längre spann
   *  (till exempel en religion) skalas upp så att de tar högst cirka en och en halv minut (#164). */
  get yearsPerSecond() {
    if (!this.focus) return this.speed;
    const span = this.focus.to - this.focus.from;
    // Korta krig (#204): hela kriget på cirka en minut vid standardnivån (25)
    if (this.focus.fine) return (this.speed / 25) * span / 60;
    return (this.speed / 10) * Math.max(1, span / 90);
  }
  _labelSpeed() {
    const r = this.yearsPerSecond, fine = this.focus?.fine, t = fine ? fmtDays(r) : fmtRate(r);
    this.speedBtn.textContent = t;
    this.speedBtn.setAttribute('aria-label', `Uppspelningshastighet: ${t}. Tryck för att byta.`);
    this.speedBtn.title = `Uppspelningshastighet: ${t} (så många ${fine ? 'dagar' : 'år'} av historien går varje sekund). Tryck för att byta.`;
  }
  /** Stegknapparnas namn: år, eller dagar i fokusläget för korta krig. */
  _labelSteps() {
    for (const b of this.stepBtns) {
      const n = Number(b.dataset.step), a = Math.abs(n);
      const unit = this.focus?.fine ? (a === 1 ? 'dag' : 'dagar') : 'år';
      b.setAttribute('aria-label', `${a} ${unit} ${n < 0 ? 'bakåt' : 'framåt'}`);
      b.title = b.getAttribute('aria-label');
    }
  }
  _labelPlay(playing, resume = false) {
    const t = playing ? 'Pausa' : resume ? 'Fortsätt' : 'Spela upp tiden';
    this.playBtn.setAttribute('aria-label', t);
    this.playBtn.title = t;
  }

  play() {
    const end = this.focus ? this.focus.to : MAX_YEAR;
    if (this._year >= end) this.year = this.focus ? this.focus.from : MIN_YEAR;
    this.playing = true;
    this._showNote(null);
    const run = this._run = (this._run ?? 0) + 1; // bara en uppspelning åt gången
    this.playIcon.setAttribute('d', 'M4 2.5h3v11H4zM9 2.5h3v11H9z');
    this.playBtn.setAttribute('aria-pressed', 'true');
    this._labelPlay(true);
    let last = performance.now();
    let yf = this._year; // året som decimaltal, så att långsamma nivåer räknas upp jämnt
    let shown = this._year;
    const step = now => {
      if (!this.playing || run !== this._run) return;
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (this._year !== shown) yf = this._year; // året flyttades utifrån (till exempel hopp vid krig)
      yf += dt * this.yearsPerSecond;
      this.year = yf;
      shown = this._year;
      if (this._year >= end) { this.pause(); return; }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  /** Pausar. Med `reason` (text) är det en automatisk paus: knappen blir "Fortsätt" och raden vid knappen visar varför. */
  pause(reason) {
    const wasPlaying = this.playing;
    this.playing = false;
    this.playIcon.setAttribute('d', 'M4 2.5v11l9-5.5z');
    this.playBtn.setAttribute('aria-pressed', 'false');
    const auto = !!reason && wasPlaying;
    this._labelPlay(false, auto);
    this._showNote(auto ? reason : null);
  }
  _showNote(text) {
    if (!this.pauseNote) return;
    this.pauseNote.hidden = !text;
    if (text) this.pauseText.textContent = text;
  }

  _render() {
    const p = this.toPos(this._year);
    this.thumb.style.left = `${p * 100}%`;
    this.track.setAttribute('aria-valuenow', String(this._year));
    this.track.setAttribute('aria-valuetext', this.format(this._year));
  }
  init(y) { this._year = clampY(y); this._render(); this.dispatchEvent(new CustomEvent('change', { detail: { year: this._year } })); }
}


/** "Hoppa till år": tryck på årtalet, skriv ett år (med f.Kr./e.Kr.) eller välj en tidsålder (#140). */
export function setupYearJump(timeline, { button, pop, input, msg, epochs, onJump }) {
  let era = 'ce';
  const setEra = e => {
    era = e;
    for (const b of pop.querySelectorAll('.jump-era-btn')) b.setAttribute('aria-pressed', String(b.dataset.era === era));
  };
  const close = () => { pop.hidden = true; button.setAttribute('aria-expanded', 'false'); };
  const open = () => {
    setEra('ce'); input.value = ''; msg.textContent = '';
    pop.hidden = false; button.setAttribute('aria-expanded', 'true');
    input.focus();
  };
  const jump = y => {
    timeline.pause();
    timeline.year = y;
    // I fokusläget för korta krig hamnar ett år inom kriget på krigets första dag det året (#204)
    if (Math.floor(timeline.year) !== y) { // fokusläget håller året inom spannet
      msg.textContent = `Året ligger utanför det du följer nu (${timeline.format(timeline.focus.from)}–${timeline.format(timeline.focus.to)}).`;
      return;
    }
    close(); button.focus();
    onJump?.(y); // bara hopp, inte uppspelning eller stegknappar (#165)
  };
  const chip = (label, y) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'jump-epoch';
    const [num, e] = yearParts(y);
    b.innerHTML = `<span class="jump-epoch-name"></span><span class="jump-epoch-year"></span>`;
    b.firstChild.textContent = label; b.lastChild.textContent = `${num} ${e || 'e.Kr.'}`.trim();
    b.addEventListener('click', () => jump(y));
    epochs.append(b);
  };
  // gränsåret hör till segmentet före, så varje tidsålder utom den första börjar året efter
  SEGMENTS.forEach((s, i) => chip(s.name, i ? s.from + 1 : s.from));
  chip('Idag', MAX_YEAR);

  button.addEventListener('click', () => (pop.hidden ? open() : close()));
  for (const b of pop.querySelectorAll('.jump-era-btn')) b.addEventListener('click', () => { setEra(b.dataset.era); input.focus(); });
  pop.addEventListener('submit', ev => {
    ev.preventDefault();
    const y = parseYear(input.value, era);
    if (y === null) { msg.textContent = 'Skriv ett år, till exempel 1969 eller 2600 f.Kr.'; return; }
    if (y < MIN_YEAR || y > MAX_YEAR) { msg.textContent = `Välj ett år mellan ${formatYear(MIN_YEAR)} och ${formatYear(MAX_YEAR)}.`; return; }
    jump(y);
  });
  input.addEventListener('input', () => { msg.textContent = ''; });
  pop.addEventListener('keydown', ev => { if (ev.key === 'Escape') { close(); button.focus(); } });
  document.addEventListener('pointerdown', ev => { if (!pop.hidden && !pop.contains(ev.target) && !button.contains(ev.target)) close(); });
}
