// Tidsreglaget äger det nuvarande året (arkitekturprincip 3).
// Beslut 4: segmenterad skala där nutiden får mer plats än forntiden.
import { formatYear, groupDigits, formatDate, isBCE, bce, BCE_TXT, parseYear, parseYearInput, yearParts, edtfSpan, dayParts, formatDay, monthStarts, roundDay, MONTHS_SHORT, CE_TXT, isVisibleReview, t, roundPrehistoric } from './model.js';
import { selectEventsForDate } from './date-events.js';
import { say, clearStatus } from './ui/status.js';
import { ui } from './i18n.js';
import { MIN_YEAR, MAX_YEAR } from './state.js'; // gränserna bor i state.js (#1141), så att url-state.js inte behöver importera hela tidsreglaget
export { MIN_YEAR, MAX_YEAR };

// Tidslinjens fem delar är en skala, inte epoker: de heter bara sina årtal (#979). Epoknamnen, med källa och
// förenklingstext, finns bara i data/perioder.json. Förhistorien (#1088) får ett glest första segment med 10 % av reglaget,
// enligt mätningen i docs/granskningar/2026-11-12-tidsreglagets-plats-1087.md: modern tid (1800–) behåller 25 % och samma
// pixlar per år som förut, och de tre segmenten däremellan delar lika på resten (21⅔ % var).
const P1 = 0.10, P2 = 0.10 + 0.65 / 3, P3 = 0.10 + 1.30 / 3;
export const SEGMENTS = [
  { from: MIN_YEAR, to: -2999, a: 0.00, b: P1 },
  { from: -2999, to: -500, a: P1, b: P2 },
  { from:  -500, to: 1000, a: P2, b: P3 },
  { from:  1000, to: 1800, a: P3, b: 0.75 },
  { from:  1800, to: MAX_YEAR, a: 0.75, b: 1.00 },
];

// [år, nivå]: 1 = alltid, 2 = från 600 px, 3 = från 900 px
const TICKS = [
  [MIN_YEAR, 1], [-49999, 3], [-2999, 2], [-1999, 2], [-999, 3], [-499, 2], [1, 1], [500, 2], [1000, 1],
  [1200, 3], [1400, 2], [1600, 3], [1800, 1], [1900, 2], [1950, 3], [2000, 1],
];

const clampY = y => Math.max(MIN_YEAR, Math.min(MAX_YEAR, y));
// Gränsen mellan två segment är ett runt årtal: -500 (astronomiskt) är 501 f.Kr., men segmentet heter 500 f.Kr. Ett år som
// redan är runt i f.Kr. (-2999 är 3000 f.Kr., -99999 är 100 000 f.Kr.) behålls (#1088).
const nominal = y => (y < 0 && bce(y) % 100 !== 0 ? y + 1 : y);
/** Skalnamnet för ett segment, bara årtal på valt språk: "3000–500 f.Kr.", "500 f.Kr.–1000", "sedan 1800". */
export function segmentLabel(s) {
  const from = nominal(s.from), to = nominal(s.to);
  if (s.to === MAX_YEAR) return ui('time.since', { start: formatYear(from) });
  if (isBCE(from) && isBCE(to)) return `${groupDigits(bce(from))}–${groupDigits(bce(to))} ${BCE_TXT}`;
  return `${formatYear(from)}–${formatYear(to)}`;
}
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
// Året vid ett läge på reglaget, utan avrundning (samma räkning som posToYear).
function yearAtPos(p) {
  const s = segForPos(p);
  return s.from + (p - s.a) / (s.b - s.a) * (s.to - s.from);
}
/**
 * Samtidigt-fönstret räknat i reglagets läge (#1319, beslut 2026-11-13): kanterna är läget minus och plus `fraction` av
 * reglaget, och varje kant översätts till år för sig. Fönstret kan därför bli olika långt före och efter året vid en
 * segmentgräns: vid 5000 f.Kr. är det cirka 2 100 år bakåt, där segmentet är glest, men längre framåt, där 3000 f.Kr.
 * och segmenten efter ger fler år per pixel. Inom ett segment är de två lika långa (samma som yearsAcross).
 * Vid reglagets ändar finns bara en kant; den används åt båda hållen (1,2 % av reglaget går inte att mäta bortom slutet).
 */
export function windowEdges(y, fraction) {
  y = clampY(y);
  const p = yearToPos(y);
  const lo = p - fraction >= 0 ? y - yearAtPos(p - fraction) : null;
  const hi = p + fraction <= 1 ? yearAtPos(p + fraction) - y : null;
  return { before: lo ?? hi, after: hi ?? lo };
}

/** Uppspelningens nivåer i år per sekund. */
const SPEEDS = [1, 5, 25, 100];
// Under 10 år/s visas en decimal, annars heltal, så att knappen blir kort (till exempel "17 år/s" i stället för "17,17 år/s")
const fmtNum = r => String(r < 10 ? Math.round(r * 10) / 10 : Math.round(r)).replace('.', ',');
const fmtRate = r => ui('time.rateYears', { rate: fmtNum(r) });
// I fokusläget för korta krig (#204) räknas farten och stegen i dagar
const DAYS_PER_YEAR = 365.25;
const dayUnit = n => ui('time.dayNames')[n === '1' ? 0 : 1];
// Spelknappens ikoner: spela, pausa och spela igen (pil runt, #232)
const ICON_PLAY = 'M4 2.5v11l9-5.5z';
const ICON_PAUSE = 'M4 2.5h3v11H4zM9 2.5h3v11H9z';
const ICON_AGAIN = 'M8 2.5V0L4.2 3.6 8 7.2V4.5a3.5 3.5 0 1 1-3.5 3.5h-2A5.5 5.5 0 1 0 8 2.5z';
const fmtDays = r => { const n = fmtNum(r * DAYS_PER_YEAR); return ui('time.rateDays', { rate: n, unit: dayUnit(n) }); };

const DENSITY_LIMIT = 80; // fler händelsemärken än så blir ett täthetsband i översikten (#1000)

export class Timeline extends EventTarget {
  constructor({ track, thumb, segs, ticks, dots, ffMarks, chapters, warMarks, markNote, playBtn, playIcon, stepBtns, speedBtn, pauseNote, pauseText, pauseGo, status }) {
    super();
    Object.assign(this, { track, thumb, playBtn, playIcon, speedBtn, pauseNote, pauseText, pauseGo, status, stepBtns, segsEl: segs, ticksEl: ticks });
    this._year = 1325;
    this.playing = false;
    this._resume = false; // automatisk paus: knappen heter "Fortsätt"
    // Finns det mer att visa när tiden står i slutet? Den som lyssnar sätter den, till exempel
    // när ett krigs slutkort ännu inte har visats (#232). Annars blir knappen "Spela igen".
    this.hasMore = () => false;
    this.focus = null; // { from, to, fine }: tidslinjen inzoomad på ett spann (fokusläge, #109)
    this.range = null; // tidsintervallet { from, to } (#755), eller null
    this.focusLocked = false; // lektionsläget (#795) låser spannet: ett datum i årshoppet släpper det inte
    // Tidslåset (#1322): en funktion som ger { locked: true }, { locked: false, from, to } eller null (js/state.js, timeLock).
    // Den läses vid varje drag, klick, tangent och stegknapp; det som koden själv sätter (timeline.year = …) påverkas inte.
    this.lock = () => null;
    this.lockReason = ''; // hovertexten på de låsta stegknapparna
    // fine: ett kort krig (#204). Då är året ett decimaltal avrundat till hela dagar, och skalan,
    // stegen och farten räknas i dagar och månader.
    // Hastighet i år per sekund (#164). Det gamla sparade värdet ('hg-speed', ×-faktor) ignoreras.
    this.speed = 25;
    try { const v = Number(localStorage.getItem('hg-speed-ars')); if (SPEEDS.includes(v)) this.speed = v; } catch { /* utan lagring */ }
    this.dotsEl = dots; this.ffEl = ffMarks; this.chaptersEl = chapters; this.warEl = warMarks; this.markNote = markNote;
    this._story = null; // kapitel och markeringar när man följer ett krig (#244)
    this._drawScale();
    addEventListener('resize', () => { if (this.focus) { this._drawScale(); this._drawStory(); } else this._hideOverlaps(); }); // antal årtal beror på bredden

    speedBtn.addEventListener('click', () => {
      this.speed = SPEEDS[(SPEEDS.indexOf(this.speed) + 1) % SPEEDS.length];
      try { localStorage.setItem('hg-speed-ars', String(this.speed)); } catch { /* utan lagring */ }
      this._labelSpeed();
    });
    pauseGo?.addEventListener('click', () => this.play());
    this._labelPlay();
    this._labelSpeed();

    // Dra i reglaget
    const setFromX = x => {
      const r = track.getBoundingClientRect();
      this.setByUser(this.toYear((x - r.left) / r.width));
    };
    track.addEventListener('pointerdown', e => { if (this.locked) return; track.setPointerCapture(e.pointerId); this.pause(); setFromX(e.clientX); });
    track.addEventListener('pointermove', e => { if (track.hasPointerCapture(e.pointerId)) setFromX(e.clientX); });
    track.addEventListener('keydown', e => {
      if (this.locked) return;
      const big = e.shiftKey ? 10 : 1;
      const map = { ArrowLeft: -big, ArrowRight: big, ArrowDown: -big, ArrowUp: big, PageDown: -100, PageUp: 100 };
      if (e.key in map) { this.setByUser(this.year + map[e.key] * this.stepUnit); e.preventDefault(); }
      if (e.key === 'Home') { this.setByUser(MIN_YEAR); e.preventDefault(); }
      if (e.key === 'End') { this.setByUser(MAX_YEAR); e.preventDefault(); }
    });
    for (const b of stepBtns) b.addEventListener('click', () => { if (this.locked) return; this.pause(); this.setByUser(this.year + Number(b.dataset.step) * this.stepUnit); });
    playBtn.addEventListener('click', () => { if (this.locked) return; this.playing ? this.pause() : this.play(); });
  }

  /** Är reglaget låst för besökaren (tidslåset, #1322)? */
  get locked() { return this.lock()?.locked === true; }

  /** Besökarens drag, klick, tangent eller stegknapp: ett lås gäller, och i en lektion stannar året inom lektionens år (#1322). */
  setByUser(y) {
    const l = this.lock();
    if (l?.locked) return;
    this.year = l?.from != null ? Math.max(l.from, Math.min(l.to, y)) : y;
  }

  /**
   * Visar låset (#1322): stegknapparna och spelknappen tonas ned och går inte att nå medan reglaget är låst, och reglaget får
   * aria-disabled. Anropas när ett läge börjar eller slutar (js/main.js). Förklaringen (lockReason) står som hovertext på stegknapparna.
   */
  syncLock() {
    const on = this.locked;
    for (const b of [...this.stepBtns, this.playBtn]) {
      b.disabled = on;
      b.classList.toggle('time-locked', on);
      // Spelknappens text styrs av _labelPlay och playback.js, så bara stegknapparna får förklaringen
      if (b === this.playBtn) continue;
      if (on && this.lockReason) {
        if (b.dataset.beforeLock == null) b.dataset.beforeLock = b.getAttribute('title') ?? '';
        b.title = this.lockReason;
      } else if (b.dataset.beforeLock != null) {
        if (b.dataset.beforeLock) b.title = b.dataset.beforeLock; else b.removeAttribute('title');
        delete b.dataset.beforeLock;
      }
    }
    this.track.classList.toggle('time-locked', on);
    if (on) this.track.setAttribute('aria-disabled', 'true'); else this.track.removeAttribute('aria-disabled');
    this.dispatchEvent(new CustomEvent('lockchange', { detail: { locked: on } })); // årshoppet följer med (setupYearJump)
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
  // I förhistorien avrundas året till tusental (roundPrehistoric), eftersom ett steg på reglaget där är hundratals år
  format(y) { return this.focus?.fine ? formatDay(this._lastDay(y)) : formatYear(roundPrehistoric(y)); }
  formatParts(y) { return this.focus?.fine ? dayParts(this._lastDay(y)) : yearParts(roundPrehistoric(y)); }
  // Spannets slut är början av dagen efter krigets sista dag; där visas den sista dagen
  _lastDay(y) { return Math.min(y, this.focus.to - 0.5 / DAYS_PER_YEAR); }
  /**
   * Hur många år före och efter som räknas som "samtidigt" (#1319): { before, after }. Utanför Fokus är det 1,2 % av reglaget
   * åt varje håll, så att längden kan skilja sig vid en segmentgräns. I Fokus är det lika långt åt båda hållen.
   */
  windowSpan(y) {
    if (this.focus?.fine) { const d = (this.focus.to - this.focus.from) * 0.03; return { before: d, after: d }; } // några dagar
    if (this.focus) { const d = Math.max(1, (this.focus.to - this.focus.from) * 0.03); return { before: d, after: d }; }
    return windowEdges(y, 0.012);
  }
  /** Den längre av de två sidorna, för det som bara behöver ett tal (till exempel Fokus-menyns avstånd). */
  windowYears(y) {
    const { before, after } = this.windowSpan(y);
    return Math.max(before, after);
  }

  /**
   * Tidsintervallet (#755): ett band på reglaget från from till to, eller null. Handtaget står på from (året). Bandet
   * följer hela skalan; intervallet och Fokus utesluter varandra (lägeskontraktet i js/state.js).
   */
  setRange(range) {
    this.range = range;
    if (!this._rangeBand) {
      this._rangeBand = document.createElement('div');
      this._rangeBand.className = 'range-band';
      this._rangeBand.setAttribute('aria-hidden', 'true');
      this.track.prepend(this._rangeBand);
    }
    this._rangeBand.hidden = !range;
    if (range) {
      const a = this.toPos(range.from), b = this.toPos(range.to);
      this._rangeBand.style.left = `${a * 100}%`;
      this._rangeBand.style.width = `${Math.max(0.4, (b - a) * 100)}%`;
    }
    this._render();
  }

  /** Fokusläge: zooma in tidslinjen på ett spann, eller null för hela tiden. */
  setFocus(range) {
    this.pause();
    this.focus = range;
    if (!range) this._story = null; // kapitel och markeringar hör till det man följer
    if (!range?.fine) this._year = Math.floor(this._year); // utanför korta krig är året ett heltal
    this._labelSpeed();
    this._labelSteps();
    this._drawScale();
    // Samma märken får en annan plats på den inzoomade skalan, även om deras data är oförändrad.
    this._marksKey = null;
    if (this._marks) this.setMarks(...this._marks);
    this._drawStory();
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
      d.className = 'seg'; d.style.width = `${(s.b - s.a) * 100}%`; d.title = segmentLabel(s);
      this.segsEl.append(d);
    }
    for (const [y, level] of TICKS) {
      const d = document.createElement('div');
      d.className = `tick lvl${level}` + (y === MIN_YEAR ? ' first' : '');
      d.style.left = `${yearToPos(y) * 100}%`;
      d.textContent = y === 1 ? ui('time.year1') : formatYear(y);
      d.dataset.level = level;
      this.ticksEl.append(d);
    }
    this._hideOverlaps();
    requestAnimationFrame(() => this._hideOverlaps()); // en gång till när typsnitten och layouten är klara
  }

  /**
   * Döljer årtal på skalan som skulle krocka med ett viktigare årtal (#63). Bredden beror på språket:
   * "1000 av. J.-C." är längre än "1000 f.Kr.". Nivå 1 behålls alltid, sedan nivå 2 och 3 där de får plats.
   */
  _hideOverlaps() {
    const ticks = [...this.ticksEl.querySelectorAll('.tick[data-level]')];
    for (const d of ticks) d.classList.remove('tick-hidden');
    const kept = [];
    for (const level of ['1', '2', '3']) {
      for (const d of ticks.filter(t => t.dataset.level === level)) {
        const r = d.getBoundingClientRect();
        if (!r.width) continue; // dold av bredden (lvl2 och lvl3 i smal skärm)
        if (level !== '1' && kept.some(k => r.left < k.right + 6 && r.right > k.left - 6)) { d.classList.add('tick-hidden'); continue; }
        kept.push(r);
      }
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
    // Hela år, eller hela dagar i fokusläget för korta krig, så att allt ritas om en gång per dag (#204)
    y = clampY(this.focus?.fine ? roundDay(y) : Math.round(y));
    if (this.focus) y = Math.max(this.focus.from, Math.min(this.focus.to, y)); // stanna inom fokusspannet
    if (y === this._year) return;
    this._year = y;
    this._render();
    this.dispatchEvent(new CustomEvent('change', { detail: { year: y } }));
  }

  /** Märken från lagerregistret (#378): cirkel = händelse, romb = Samtidigt, streck = resa. */
  setMarks(marks = [], { curated = false } = {}) {
    // curated: vyn visar redan ett litet, valt urval (Översikt, Framsteg), och då får alla märken vara enskilda (#868, #1000)
    const band = !curated && !this.focus && !this.range && marks.filter(m => m.type === 'event').length > DENSITY_LIMIT;
    const key = band + '\u001d' + marks.map(mark => [mark.type, mark.at, mark.until ?? '', mark.color ?? '', mark.label ?? ''].join('\u001f')).join('\u001e');
    if (key === this._marksKey) return;
    this._marksKey = key;
    this._marks = [marks, { curated }];
    this.dotsEl.replaceChildren();
    this.ffEl.replaceChildren();
    const show = mark => {
      if (!this.markNote) return;
      this.markNote.textContent = mark.label;
      this.markNote.hidden = false;
    };
    // Översikten (#1000): många händelser blir ett lugnt täthetsband i stället för hundratals knappar.
    // Romberna (samband) ligger kvar; resornas streck döljs i bandet. Fokus, tur, tema, intervall och
    // smala filter har färre märken och visar dem som förut.
    if (band) this._drawDensity(marks.filter(m => m.type === 'event'));
    for (const mark of marks) {
      if (band && (mark.type === 'event' || mark.type === 'route')) continue;
      const [s0, s1] = mark.until == null ? [mark.at, mark.at] : this.spanOf({ start: mark.at, end: mark.until, edtf: '' });
      if (this.focus && (s1 < this.focus.from || s0 > this.focus.to)) continue;
      const a = this.toPos(s0), b = this.focus?.fine && s1 - s0 <= 1.5 / DAYS_PER_YEAR ? a : this.toPos(s1);
      const d = document.createElement('button');
      d.type = 'button'; d.className = mark.type === 'funfact' ? 'tff' : mark.type === 'route' ? 'troute' : 'tdot';
      d.setAttribute('aria-label', mark.label); d.title = mark.label;
      d.tabIndex = -1; // reglaget (#track) är tabbstoppet; markeringarna nås med mus och finger, och Samtidigt i världen är textalternativet (#1003)
      if (mark.type === 'route-stop') d.classList.add('route-stop');
      if (mark.until != null && b - a > 0.004) {
        d.className = 'tspan';
        d.style.left = `${a * 100}%`; d.style.width = `${(b - a) * 100}%`;
      } else {
        d.style.left = `${a * 100}%`;
      }
      if (mark.color) d.style.background = mark.color;
      d.addEventListener('pointerdown', e => e.stopPropagation());
      d.addEventListener('focus', () => show(mark));
      d.addEventListener('click', e => { e.stopPropagation(); show(mark); });
      (mark.type === 'funfact' ? this.ffEl : this.dotsEl).append(d);
    }
  }

  /** Täthetsbandet (#1000): mörkare där det finns många händelser, räknat per del av tidslinjen. */
  _drawDensity(events) {
    const N = 120, bins = new Array(N).fill(0);
    for (const m of events) {
      const [s0, s1] = m.until == null ? [m.at, m.at] : this.spanOf({ start: m.at, end: m.until, edtf: '' });
      const a = Math.min(N - 1, Math.max(0, Math.floor(this.toPos(s0) * N)));
      const b = Math.min(N - 1, Math.max(a, Math.floor(this.toPos(s1) * N)));
      for (let i = a; i <= Math.min(b, a + 3); i++) bins[i]++; // långa spann ger inte hela bandet
    }
    const max = Math.max(1, ...bins);
    const stops = bins.map((n, i) => `rgba(201,162,75,${(n ? .15 + .75 * Math.sqrt(n / max) : 0).toFixed(2)}) ${(i / N * 100).toFixed(2)}% ${((i + 1) / N * 100).toFixed(2)}%`);
    const d = document.createElement('div');
    d.className = 'tdensity';
    d.setAttribute('aria-hidden', 'true');
    d.style.background = `linear-gradient(to right, ${stops.join(',')})`;
    this.dotsEl.append(d);
  }

  /**
   * Kapitel och markeringar när man följer ett krig (#244). bands: [{ from, to, label, title, data }]
   * ritas som band över reglaget, med namnet ovanför (data: kapitel ur story.chapters, annars neutrala
   * band mellan krigets stora händelser). marks: [{ at, until, major, unsure, end, label }] ritas på
   * linjen: större för stora händelser, ett kryss för osäkert datum och en ring för slutkortet.
   * Texterna kommer ur datan; den här klassen placerar dem bara. null tar bort allt.
   */
  setStory(story) { this._story = story; this._drawStory(); }
  _drawStory() {
    if (!this.chaptersEl) return;
    this.chaptersEl.replaceChildren(); this.warEl.replaceChildren();
    const st = this.focus && this._story;
    this.track.classList.toggle('storied', !!st?.bands.length);
    this.track.classList.toggle('war-marked', !!st);
    if (!st) return;
    const pct = v => `${v * 100}%`;
    let n = 0; // banden växlar färg i den ordning de ritas
    for (const c of st.bands) {
      const a = this.toPos(c.from), b = this.toPos(c.to);
      if (b - a < 0.01) continue; // för smalt för att synas
      const band = document.createElement('div');
      band.className = `chap ${c.data ? `chap-data chap-${n % 4}` : `chap-auto chap-${n % 2}`}`;
      n++;
      band.style.left = pct(a); band.style.width = pct(b - a);
      band.title = c.title;
      // På mobil döljs de övriga namnen visuellt, men varje band behåller sin fulla
      // beskrivning för skärmläsare och som tooltip (#446).
      band.setAttribute('role', 'img');
      band.setAttribute('aria-label', c.title);
      band.dataset.center = String((a + b) / 2);
      const label = document.createElement('span');
      label.className = 'chap-label';
      label.textContent = c.label;
      // Namnet visas bara när bandet är brett nog för några tecken
      if ((b - a) * this.track.clientWidth < 44) label.hidden = true;
      band.append(label);
      this.chaptersEl.append(band);
    }
    for (const m of st.marks) {
      const d = document.createElement('div');
      d.className = 'wmark' + (m.major ? ' major' : '') + (m.unsure ? ' unsure' : '') + (m.end ? ' end' : '');
      d.style.left = pct(this.toPos(m.at));
      d.setAttribute('role', 'img');
      d.setAttribute('aria-label', m.label);
      d.title = m.label;
      // Ett slag som pågick länge får ett streck till sitt slut
      if (m.until != null && this.toPos(m.until) - this.toPos(m.at) > 0.004) {
        const line = document.createElement('div');
        line.className = 'wspan';
        line.style.left = pct(this.toPos(m.at)); line.style.width = pct(this.toPos(m.until) - this.toPos(m.at));
        this.warEl.append(line);
      }
      this.warEl.append(d);
    }
    this._showNearestStoryLabel();
  }

  /** I en smal tidslinje får bara bandet närmast reglaget ett synligt namn (#446). */
  _showNearestStoryLabel() {
    const bands = [...this.chaptersEl.querySelectorAll('.chap')];
    if (!bands.length) return;
    const at = this.toPos(this._year);
    let nearest = bands[0];
    for (const band of bands.slice(1)) {
      if (Math.abs(Number(band.dataset.center) - at) < Math.abs(Number(nearest.dataset.center) - at)) nearest = band;
    }
    for (const band of bands) {
      const current = band === nearest;
      band.querySelector('.chap-label')?.classList.toggle('chap-label-current', current);
      band.classList.toggle('chap-label-flip', current && Number(band.dataset.center) > 0.5);
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
    // Dagar: i smal skärm står bara "d/s" (CSS), så att knappen får plats
    if (fine) {
      const n = fmtNum(r * DAYS_PER_YEAR);
      this.speedBtn.innerHTML = `${n} <span class="unit-long">${dayUnit(n)}</span><span class="unit-short">${ui('time.dayShort')}</span>/s`;
    }
    this.speedBtn.setAttribute('aria-label', ui('time.speedLabel', { rate: t }));
    this.speedBtn.title = ui('time.speedHelp', { rate: t, unit: ui(fine ? 'time.dayNames' : 'time.yearNames')[1] });
  }
  /** Stegknapparnas namn: år, eller dagar i fokusläget för korta krig. */
  _labelSteps() {
    for (const b of this.stepBtns) {
      const n = Number(b.dataset.step), a = Math.abs(n);
      const unit = ui(this.focus?.fine ? 'time.dayNames' : 'time.yearNames')[a === 1 ? 0 : 1];
      b.setAttribute('aria-label', ui('time.step', { n: a, unit, direction: ui(n < 0 ? 'time.backward' : 'time.forward') }));
      b.title = b.getAttribute('aria-label');
      if (this.locked && this.lockReason) b.title = this.lockReason; // låset visar sin förklaring (#1322)
    }
  }
  /** I slutet (fokusets slut eller sista året) och utan något kvar att visa börjar nästa uppspelning om. */
  get atEnd() { return !this.playing && this._year >= (this.focus ? this.focus.to : MAX_YEAR) && !this.hasMore(); }
  /** Sant efter en automatisk paus, när nästa uppspelning fortsätter där tiden stannade. */
  get resumable() { return this._resume; }
  /** Spelknappens ikon och namn: "Pausa", "Fortsätt" (efter automatisk paus), "Spela igen" (i slutet, #232)
   *  eller "Spela upp tiden". Knappen i pausraden byter text på samma sätt. */
  _labelPlay() {
    const again = this.atEnd;
    const t = ui(this.playing ? 'time.pause' : again ? 'time.replay' : this._resume ? 'time.resume' : 'time.play');
    this.playIcon.setAttribute('d', this.playing ? ICON_PAUSE : again ? ICON_AGAIN : ICON_PLAY);
    this.playBtn.setAttribute('aria-label', t);
    this.playBtn.title = t;
    if (this.pauseGo) this.pauseGo.textContent = `${again ? '\u21BB' : '\u25B6'} ${ui(again ? 'time.replay' : 'time.resume')}`;
    this.dispatchEvent(new CustomEvent('playstate'));
  }
  /** Läs om knappens läge, till exempel när slutkortet har visats utan att året ändrades. */
  refreshPlayLabel() { this._labelPlay(); }

  play() {
    // Den som lyssnar kan ta över (preventDefault), till exempel för att visa nästa stopp i ett krig (#217)
    if (!this.dispatchEvent(new CustomEvent('beforeplay', { cancelable: true }))) return;
    const end = this.focus ? this.focus.to : MAX_YEAR;
    // Börja om bara från slutet, och då har knappen hetat "Spela igen" (#232)
    if (this._year >= end) this.year = this.focus ? this.focus.from : MIN_YEAR;
    this.playing = true;
    this._resume = false;
    this._showNote(null);
    const run = this._run = (this._run ?? 0) + 1; // bara en uppspelning åt gången
    this.playBtn.setAttribute('aria-pressed', 'true');
    this._labelPlay();
    let last = performance.now();
    let yf = this._year; // året som decimaltal, så att långsamma nivåer räknas upp jämnt
    let shown = this._year;
    const step = now => {
      if (!this.playing || run !== this._run) return;
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (this._year !== shown) yf = this._year; // året flyttades utifrån (till exempel hopp vid krig)
      yf += dt * this.yearsPerSecond;
      this.year = yf;
      if (!this.playing) return; // pausad av den som lyssnar på change (till exempel vid krigets slut), med sin paustext
      shown = this._year;
      if (this._year >= end) { this.pause(); return; }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  /** Pausar. Med `reason` (text) är det en automatisk paus: knappen blir "Fortsätt" och raden vid knappen visar varför.
   *  `always` visar raden även om uppspelningen redan stod still (nästa stopp i ett krig, #217).
   *  `more` ({ title, text }) är en fällbar rad i pausraden, till exempel resans not om att källorna skiljer sig (#647).
   */
  pause(reason, always = false, announcement = reason, more = null) {
    const wasPlaying = this.playing;
    this.playing = false;
    this.playBtn.setAttribute('aria-pressed', 'false');
    const auto = !!reason && (wasPlaying || always);
    this._resume = auto;
    this._labelPlay();
    this._showNote(auto ? reason : null, auto ? announcement : null, auto ? more : null);
  }
  _showNote(text, announcement = text, more = null) {
    if (!this.pauseNote) return;
    this.pauseNote.hidden = !text;
    if (text) this.pauseText.textContent = text;
    const box = this.pauseNote.querySelector('#pause-more');
    if (box) {
      box.hidden = !more;
      box.open = false;
      box.querySelector('#pause-more-title').textContent = more ? more.title : '';
      box.querySelector('#pause-more-text').textContent = more ? more.text : '';
    }
    if (announcement) this._announce(announcement);
    else clearStatus('pausnotis');
  }
  /** Den här raden finns alltid i DOM:en, så att skärmläsaren säkert får ändringen. */
  /** Läser upp text för skärmläsare utan att visa en pausrad (till exempel turens slutkort, #878). */
  announce(text) { this._announce(text); }
  _announce(text) {
    say(text, 'pausnotis'); // via statusraden (js/ui/status.js, #1419)
  }

  _render() {
    const p = this.toPos(this._year);
    this.thumb.style.left = `${p * 100}%`;
    this._showNearestStoryLabel();
    // Gränserna följer det man kan välja: fokusspannet (lektionens år, ett krig) eller hela skalan (#883)
    this.track.setAttribute('aria-valuemin', String(this.focus ? this.focus.from : MIN_YEAR));
    this.track.setAttribute('aria-valuemax', String(this.focus ? this.focus.to : MAX_YEAR));
    this.track.setAttribute('aria-valuenow', String(this._year));
    // Med ett intervall (#755) läser skärmläsaren hela intervallet, inte bara handtagets år
    this.track.setAttribute('aria-valuetext', this.range ? `${this.format(this.range.from)}–${this.format(this.range.to)}` : this.format(this._year));
    this._labelPlay(); // i slutet heter knappen "Spela igen"
  }
  init(y) { this._year = clampY(y); this._render(); this.dispatchEvent(new CustomEvent('change', { detail: { year: this._year } })); }
}


/** "Hoppa till år": tryck på årtalet, skriv ett år (med f.Kr./e.Kr.) eller ett datum (#140, #551).
 *  Raderna i datumresultatet är knappar som stänger årshoppet och öppnar händelsen (`onSelect(id)`, #590). */
export function setupYearJump(timeline, { button, pop, input, msg, epochs, events = [], onJump, onSelect, onOpen }) {
  const result = pop.querySelector('#jump-date-result');
  const summary = pop.querySelector('#jump-date-summary');
  const list = pop.querySelector('#jump-date-events');
  const clearResult = () => {
    if (result) { result.setAttribute('hidden', 'hidden'); result.hidden = true; }
    summary && (summary.textContent = ''); list && list.replaceChildren();
    pop.classList.remove('has-date-result');
  };
  // Felet står i msg (role=alert) och fältet får aria-invalid så länge det står kvar (#1138)
  const showError = text => {
    msg.textContent = text;
    if (text) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  };
  let era = 'ce';
  const setEra = e => {
    era = e;
    for (const b of pop.querySelectorAll('.jump-era-btn')) b.setAttribute('aria-pressed', String(b.dataset.era === era));
  };
  const close = () => { clearResult(); pop.hidden = true; button.setAttribute('aria-expanded', 'false'); };
  const open = () => {
    setEra('ce'); input.value = ''; showError(''); clearResult();
    pop.hidden = false; button.setAttribute('aria-expanded', 'true');
    onOpen?.();
    input.focus();
  };
  const jump = y => {
    timeline.pause();
    timeline.year = y;
    // I fokusläget för korta krig hamnar ett år inom kriget på krigets första dag det året (#204)
    if (Math.floor(timeline.year) !== y) { // fokusläget håller året inom spannet
      showError(ui('jump.outsideFocus', { from: timeline.format(timeline.focus.from), to: timeline.format(timeline.focus.to) }));
      return;
    }
    close(); button.focus();
    onJump?.(y); // bara hopp, inte uppspelning eller stegknappar (#165)
  };
  const showDateResult = (date, year, found) => {
    if (!result || !summary || !list) return;
    summary.textContent = ui(date ? 'jump.dateResult' : 'jump.yearResult', {
      date: date ? formatDate(date) : '', year: formatYear(year), count: found.length,
    });
    list.replaceChildren(...found.slice(0, 5).map(event => {
      const item = document.createElement('li');
      if (!onSelect) { item.textContent = t(event.title); return item; }
      // Varje rad öppnar händelsens faktaruta, på samma sätt som en rad i Samtidigt (#590)
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'jump-date-event'; b.dataset.id = event.id;
      b.textContent = t(event.title);
      b.addEventListener('click', () => { close(); onSelect(event.id); });
      item.append(b);
      return item;
    }));
    if (!found.length) {
      const item = document.createElement('li');
      item.textContent = ui('jump.empty');
      list.append(item);
    } else if (found.length > 5) {
      const item = document.createElement('li');
      item.textContent = ui('jump.more', { count: 5 });
      list.append(item);
    }
    result.hidden = false;
    result.removeAttribute('hidden');
    pop.classList.add('has-date-result'); // i mobilen döljs snabbhoppen, så att resultatet tar mindre plats (#590)
  };
  const chip = (label, y, showYear = true) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'jump-epoch';
    const [num, e] = yearParts(y);
    b.innerHTML = `<span class="jump-epoch-name"></span><span class="jump-epoch-year"></span>`;
    b.firstChild.textContent = label; b.lastChild.textContent = `${num} ${e || CE_TXT}`.trim();
    if (!showYear) b.lastChild.remove(); // segmentets namn är redan årtalen
    b.addEventListener('click', () => jump(y));
    epochs.append(b);
  };
  // gränsåret hör till segmentet före, så varje tidsålder utom den första börjar året efter
  SEGMENTS.forEach((s, i) => chip(segmentLabel(s), i ? s.from + 1 : s.from, false));
  chip(ui('jump.today'), MAX_YEAR);

  // Tidslåset (#1322): i en tur går året inte att byta med årshoppet heller
  timeline.addEventListener('lockchange', e => {
    button.classList.toggle('time-locked', e.detail.locked);
    if (e.detail.locked) { button.setAttribute('aria-disabled', 'true'); close(); } else button.removeAttribute('aria-disabled');
  });
  button.addEventListener('click', () => {
    if (timeline.locked) return;
    if (!pop.hidden && result && !result.hidden) {
      input.focus();
      return;
    }
    (pop.hidden ? open() : close());
  });
  for (const b of pop.querySelectorAll('.jump-era-btn')) b.addEventListener('click', () => { setEra(b.dataset.era); clearResult(); showError(''); input.focus(); });
  pop.addEventListener('submit', ev => {
    ev.preventDefault();
    const parsed = parseYearInput(input.value, era === 'bce' ? 'bce' : 'ce');
    if (parsed.type === 'invalid') { clearResult(); showError(parsed.error); return; }
    const y = parsed.year;
    if (y < MIN_YEAR || y > MAX_YEAR) { clearResult(); showError(ui('jump.outsideBounds', { from: formatYear(MIN_YEAR), to: formatYear(MAX_YEAR) })); return; }
    // Datum och en era i texten bestämmer året; knapparna speglar samma tolkning.
    setEra(isBCE(y) ? 'bce' : 'ce');
    if (parsed.type === 'year') input.value = String(isBCE(y) ? bce(y) : y);
    if (parsed.type === 'date') {
      // Under en lektion (#795) gäller låset även datum: ett datum utanför intervallet avvisas som ett år gör
      const f = timeline.focus;
      if (timeline.focusLocked && f && (y < f.from || y > f.to)) {
        clearResult();
        showError(ui('jump.outsideFocus', { from: timeline.format(f.from), to: timeline.format(f.to) }));
        return;
      }
      const visible = events.filter(event => isVisibleReview(event.review));
      const found = selectEventsForDate(parsed.date, visible);
      timeline.pause();
      if (!timeline.focusLocked) timeline.setFocus(null);
      timeline.year = y;
      showDateResult(parsed.date, y, found);
      onJump?.(y);
      if (Math.floor(timeline.year) !== y) {
        showError(ui('jump.outsideFocus', { from: timeline.format(timeline.focus.from), to: timeline.format(timeline.focus.to) }));
        return;
      }
      return;
    }
    jump(y);
  });
  input.addEventListener('input', () => { showError(''); clearResult(); });
  pop.addEventListener('keydown', ev => { if (ev.key === 'Escape') { close(); button.focus(); } });
  document.addEventListener('pointerdown', ev => { if (!pop.hidden && !pop.contains(ev.target) && !button.contains(ev.target)) close(); });
  return { close };
}
