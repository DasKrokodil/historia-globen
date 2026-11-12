// Hur många markörer syns samtidigt i vanligt läge, år för år (#1192, beslut 2026-11-12). Körs för hand, inte i CI.
//
//   node tools/markortak.mjs            skriver de tätaste åren och medianen per segment
//   TAK=60 node tools/markortak.mjs     avslutas med kod 1 om något år går över taket (standard 60)
//
// Räknar som händelselagret (js/layers/events.js, update utan intervall): granskade händelser (isVisibleReview),
// i ett krig bara den viktigaste (top) eftersom inget krig följs, inte gamla öppna spann (isLongRunning), och en
// händelse räknas när året ligger i dess spann eller inom tidsfönstret (timeline.windowYears = yearsAcross(år, 0,012)).
// Alla kategorier är på, inget tema och ingen tagg. Samtidigt-kortets markerade händelser och den valda händelsen,
// som alltid syns, räknas inte; de är högst några stycken. Taket byggs först när något år går över (#1192).
import fs from 'node:fs';
import { yearsAcross, SEGMENTS } from '../js/timeline.js';
import { isLongRunning, isVisibleReview } from '../js/model.js';
import { MIN_YEAR, MAX_YEAR } from '../js/state.js';

const TAK = Number(process.env.TAK || 60);
const events = JSON.parse(fs.readFileSync(new URL('../data/events.json', import.meta.url), 'utf8'));
const list = (Array.isArray(events) ? events : events.events).filter(e => isVisibleReview(e.review) && (!e.partOf || e.top));

const counts = [];
for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
  const w = yearsAcross(y, 0.012);
  let n = 0;
  for (const e of list) {
    if (isLongRunning(e, y)) continue;
    const inside = y >= e.start && y <= e.end;
    const dist = inside ? 0 : Math.min(Math.abs(y - e.start), Math.abs(y - e.end));
    if (dist <= w) n++;
  }
  counts.push({ y, n, w });
}

const fmt = y => (y <= 0 ? `${1 - y} f.Kr.` : String(y));
const top = [...counts].sort((a, b) => b.n - a.n || a.y - b.y);
console.log(`Händelser som kan synas: ${list.length}. Tak: ${TAK}.`);
console.log('Tätaste åren:');
for (const c of top.slice(0, 8)) console.log(`  ${fmt(c.y).padStart(10)}  ${String(c.n).padStart(3)} markörer  (fönster ±${c.w.toFixed(1)} år)`);
console.log('Per segment (median och högst):');
let from = MIN_YEAR;
for (const s of SEGMENTS) {
  const seg = counts.filter(c => c.y >= from && c.y <= s.to).map(c => c.n).sort((a, b) => a - b);
  if (seg.length) console.log(`  ${fmt(from).padStart(10)} – ${fmt(Math.min(s.to, MAX_YEAR)).padEnd(10)} median ${seg[Math.floor(seg.length / 2)]}, högst ${seg.at(-1)}`);
  from = s.to + 1;
}
const over = counts.filter(c => c.n > TAK);
if (over.length) {
  console.log(`VARNING: ${over.length} år över taket ${TAK}, till exempel ${over.slice(0, 5).map(c => `${fmt(c.y)} (${c.n})`).join(', ')}. Dags att bygga taket (#1192).`);
  process.exitCode = 1;
} else {
  console.log(`Inget år över taket ${TAK}: inget tak behövs än (#1192).`);
}
