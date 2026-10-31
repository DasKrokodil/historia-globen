// Mjuk övergång när ett rikes område byter period (#78): när ett rike växer, krymper, delas eller
// slås ihop tonas den gamla gränsen ut och den nya in under en kort stund, i stället för att hoppa.
// Modulen räknar bara ut genomskinligheten för varje område. Ritningen sker som vanligt i
// AreasLayer.drawOverlay på den platta lagerbilden (beslut 1), med fyllning, kant och namn gånger alpha.
//
// Övergången startar bara när året har flyttats lite (uppspelning eller ett kort steg). Vid ett långt
// hopp, med "Lugn rörelse" (#246) eller när lagret slås på eller fokus byts visas nya läget direkt.

export const DURATION_MS = 450;
export const MAX_JUMP_YEARS = 10; // längre hopp (när tiden inte spelas upp) visas direkt

const key = a => a.polity.id + '|' + a.period.start;
const ease = t => t * t * (3 - 2 * t);

export class AreaTransition {
  constructor() {
    this.calm = false;
    this.fading = new Map(); // nyckel → { polity, period, from, to, t0 } för områden som tonas in eller ut
    this.prev = null; // { year, keys } vid förra jämförelsen
  }

  /** Jämför förra och nya listan över synliga områden. smooth = tiden flyttades lite (eller spelas upp). */
  track(prevActive, active, year, smooth) {
    const keys = new Set(active.map(key));
    const yearMoved = this.prev && this.prev.year !== year;
    const changed = yearMoved && (keys.size !== this.prev.keys.size || [...keys].some(k => !this.prev.keys.has(k)));
    this.prev = { year, keys };
    if (!changed) return;
    if (this.calm || !smooth) { this.fading.clear(); return; }
    const now = performance.now();
    const before = new Set(prevActive.map(key));
    // Ett område som försvinner tonas ut från den alpha det har just nu. Bara den senaste perioden
    // per rike tonas ut, så att snabb uppspelning inte lämnar en rad spökgränser efter sig.
    for (const a of prevActive) {
      const k = key(a);
      if (keys.has(k)) continue;
      for (const [k2, f] of this.fading) if (f.to === 0 && f.polity === a.polity) this.fading.delete(k2);
      this.fading.set(k, { ...a, from: this.alphaOf(k, now), to: 0, t0: now });
    }
    // Nya områden tonas in (från den alpha de har, om de var på väg ut)
    for (const a of active) {
      const k = key(a);
      if (before.has(k) && !this.fading.has(k)) continue;
      if (this.fading.get(k)?.to === 1) continue;
      this.fading.set(k, { ...a, from: this.fading.has(k) ? this.alphaOf(k, now) : 0, to: 1, t0: now });
    }
  }

  alphaOf(k, now = performance.now()) {
    const f = this.fading.get(k);
    if (!f) return 1;
    const p = Math.min(1, (now - f.t0) / DURATION_MS);
    return f.from + (f.to - f.from) * ease(p);
  }

  /** Pågår en övergång? Då behöver lagerbilden ritas om varje bildruta tills den är klar. */
  get running() {
    const now = performance.now();
    for (const f of this.fading.values()) if (now - f.t0 < DURATION_MS) return true;
    return false;
  }

  /** Det som ska ritas: områden som tonas ut först, sedan de som syns nu, var och en med sin alpha. */
  items(active) {
    if (!this.fading.size) return active.map(a => ({ ...a, alpha: 1 }));
    const now = performance.now();
    for (const [k, f] of this.fading) if (now - f.t0 >= DURATION_MS) this.fading.delete(k); // klara
    const shown = new Set(active.map(key));
    const out = [];
    for (const [k, f] of this.fading) if (f.to === 0 && !shown.has(k)) out.push({ polity: f.polity, period: f.period, alpha: this.alphaOf(k, now) });
    return [...out, ...active.map(a => ({ ...a, alpha: this.alphaOf(key(a), now) }))];
  }
}
