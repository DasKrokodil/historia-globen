// Prestandamätning med en syntetisk, större datamängd (#752). Körs för hand, inte i CI. Appen och datan ändras inte.
//
//   python3 -m http.server 8000 &
//   NODE_PATH=<mapp med playwright> node tools/matning_datamangd.mjs 8000
//
// Verktyget gör av data/genererat/handelser.json (händelserna sidan laddar) en syntetisk kopia med 3× och 10×
// så många händelser: de extra händelserna är klonade med nytt id (<id>~<n>) och små förskjutningar i år och plats.
// De syntetiska filerna skrivs till en temporär mapp (os.tmpdir()), aldrig till data/. Sidan hämtar dem genom att
// Playwright byter ut svaret på förfrågan efter handelser.json; språk- och detaljfilerna är oförändrade, så de
// extra händelserna visas med svensk titel och utan detaljtext.
//
// Klonerna tappar fälten som kopplar till andra poster (partOf, kind, top, major, ongoing, founding, religion, wikidata),
// så att de inte ger extra krigsområden, religioner eller krigsfokus. Mätningen gäller alltså markörer och
// listor, inte områden eller bågar.
//
// Miljövariabler (valfria):
//   VARIANTER=1,3,10   multiplikatorer (standard 1,3,10)
//   VARV=<tal>         antal mätningar per cell (standard 3), medianen redovisas
//   GPU=1              med grafikkort i stället för mjukvarurendering (SwiftShader, som testet och en skoldator utan grafikkort)
//   STRYPNING=<tal>    CPU-strypning i Chrome (till exempel 4)
//   UT=<fil>           skriv också resultatet som JSON
//
// Mäter per multiplikator och bredd (dator 1400 × 900, mobil 400 × 800):
//   första ritning   tid från sidladdning till att laddningsrutan försvunnit och två bildrutor ritats (ms)
//   årshopp          tid från hopp 1969 → 1500 (popstate) till att året visas och två bildrutor ritats (ms),
//                    och det längsta glappet i en timer som körs var 50:e ms under hoppet (ms utan svar)
//   bildfrekvens     bildrutor per sekund under 3 s där musen drar i globen (rAF)
//   markörer         antal händelsemarkörer i data, antal synliga etiketter (#labels) och rader i Samtidigt-listan
//   minne            JS-heap (MB) efter hoppet, via Chrome DevTools Protocol
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const playwright = require('playwright');

const PORT = Number(process.argv[2] || 8000);
const BASE = `http://localhost:${PORT}/`;
const VARIANTS = (process.env.VARIANTER || '1,3,10').split(',').map(Number);
const ROUNDS = Number(process.env.VARV || 3);
const THROTTLE = Number(process.env.STRYPNING || 1);
const GPU = process.env.GPU === '1';
const VIEWPORTS = [{ name: 'dator', width: 1400, height: 900 }, { name: 'mobil', width: 400, height: 800 }];

// --- Syntetiska händelser -------------------------------------------------------------------------------------------
function rng(seed) { // liten deterministisk slumpgenerator (mulberry32), så att mätningarna går att upprepa
  let a = seed >>> 0;
  return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const DROP = ['partOf', 'kind', 'top', 'major', 'ongoing', 'founding', 'religion', 'wikidata', 'story', 'tags'];

function synthesize(doc, factor) {
  const rand = rng(752);
  const out = { ...doc, events: [...doc.events] };
  for (let n = 1; n < factor; n++) {
    for (const e of doc.events) {
      const c = { ...e, id: `${e.id}~${n}` };
      for (const k of DROP) delete c[k];
      const dy = Math.round((rand() * 2 - 1) * 40);
      c.start = e.start + dy; c.end = e.end + dy;
      c.edtf = c.start === c.end ? String(c.start) : `${c.start}/${c.end}`;
      const [lon, lat] = e.location.coordinates;
      c.location = { type: 'Point', coordinates: [
        Math.max(-180, Math.min(180, +(lon + (rand() * 2 - 1) * 4).toFixed(3))),
        Math.max(-85, Math.min(85, +(lat + (rand() * 2 - 1) * 3).toFixed(3)))] };
      out.events.push(c);
    }
  }
  return out;
}

const src = JSON.parse(fs.readFileSync(new URL('../data/genererat/handelser.json', import.meta.url), 'utf8'));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'historia-globen-syntetisk-'));
const files = new Map();
for (const f of VARIANTS) {
  const file = path.join(TMP, `handelser-${f}x.json`);
  fs.writeFileSync(file, JSON.stringify(f === 1 ? src : synthesize(src, f)));
  files.set(f, file);
  console.log(`${f}×: ${f === 1 ? src.events.length : src.events.length * f} händelser, ${(fs.statSync(file).size / 1e6).toFixed(2)} MB (${file})`);
}

// --- Mätning --------------------------------------------------------------------------------------------------------
const frames = n => `new Promise(r => { let i = 0; const f = () => ++i >= ${n} ? r() : requestAnimationFrame(f); requestAnimationFrame(f); })`;

async function measure(browser, factor, vp) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/data/genererat/handelser.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: fs.readFileSync(files.get(factor)) }));
  const t0 = Date.now();
  await page.goto(BASE + '#y=1969');
  await page.waitForFunction(() => document.getElementById('loading')?.hidden || !document.getElementById('loading'), null, { timeout: 180000 });
  await page.evaluate(frames(2));
  const first = Date.now() - t0;
  await page.waitForTimeout(3000); // låt starten lugna sig
  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable');
  if (THROTTLE > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });

  // Årshopp, med en timer som visar hur länge sidan inte svarade
  const jump = await page.evaluate(async () => {
    window.__gaps = [];
    let last = performance.now(), stop = false;
    const tick = () => { const n = performance.now(); window.__gaps.push(n - last); last = n; if (!stop) setTimeout(tick, 50); };
    setTimeout(tick, 50);
    const start = performance.now();
    history.pushState(null, '', location.pathname + location.search + '#y=1500');
    dispatchEvent(new PopStateEvent('popstate'));
    const shown = () => /1500/.test(document.getElementById('year-big')?.textContent ?? '');
    while (!shown() && performance.now() - start < 60000) await new Promise(r => setTimeout(r, 10));
    await new Promise(r => { let i = 0; const f = () => ++i >= 2 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); });
    const ms = performance.now() - start;
    await new Promise(r => setTimeout(r, 500));
    stop = true;
    return { ms, ok: shown(), gap: Math.max(0, ...window.__gaps) };
  });

  // Bildfrekvens under dragning i globen
  await page.evaluate(() => { window.__frames = 0; const f = () => { window.__frames++; window.__raf = requestAnimationFrame(f); }; window.__raf = requestAnimationFrame(f); });
  const box = await page.locator('#globe-canvas').boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const drag0 = Date.now();
  await page.mouse.move(cx, cy); await page.mouse.down();
  for (let i = 0; Date.now() - drag0 < 3000; i++) { await page.mouse.move(cx + 120 * Math.sin(i / 8), cy + 40 * Math.cos(i / 8)); await page.waitForTimeout(16); }
  await page.mouse.up();
  const secs = (Date.now() - drag0) / 1000;
  const fps = await page.evaluate(() => { cancelAnimationFrame(window.__raf); return window.__frames; }) / secs;

  const counts = await page.evaluate(() => ({
    labels: [...document.querySelectorAll('#labels > *')].filter(el => !el.hidden && el.style.display !== 'none').length,
    list: document.querySelectorAll('#event-list .event-btn').length,
  }));
  const heap = (await cdp.send('Performance.getMetrics')).metrics.find(m => m.name === 'JSHeapUsedSize').value / 1048576;
  await context.close();
  return { first, jump: jump.ms, jumpOk: jump.ok, gap: jump.gap, fps, heap, labels: counts.labels, list: counts.list, errors };
}

// Markörer som pågår ett visst år (utan slag i krig som inte är top), och det tätaste året, ur de syntetiska filerna
function density(factor) {
  const evs = (factor === 1 ? src : synthesize(src, factor)).events.filter(e => !e.partOf || e.top);
  const at = y => evs.filter(e => e.start <= y && y <= e.end).length;
  let peak = 0, peakYear = 0;
  for (let y = -3000; y <= 2026; y += 1) { const n = at(y); if (n > peak) { peak = n; peakYear = y; } }
  return { y1500: at(1500), y1969: at(1969), peak, peakYear };
}

const med = xs => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const browser = await playwright.chromium.launch({ args: GPU ? ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=default'] : ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const results = [];
try {
  for (const vp of VIEWPORTS) for (const f of VARIANTS) {
    const rows = [];
    for (let i = 0; i < ROUNDS; i++) { rows.push(await measure(browser, f, vp)); }
    const r = { vp: vp.name, factor: f, events: f === 1 ? src.events.length : src.events.length * f,
      first: Math.round(med(rows.map(x => x.first))), jump: Math.round(med(rows.map(x => x.jump))), gap: Math.round(med(rows.map(x => x.gap))),
      fps: +med(rows.map(x => x.fps)).toFixed(1), heap: Math.round(med(rows.map(x => x.heap))), labels: med(rows.map(x => x.labels)), list: med(rows.map(x => x.list)),
      jumpOk: rows.every(x => x.jumpOk), errors: [...new Set(rows.flatMap(x => x.errors))] };
    Object.assign(r, density(f));
    results.push(r);
    console.log(`${r.vp} ${r.factor}×: första ritning ${r.first} ms, årshopp ${r.jump} ms (glapp ${r.gap} ms), ${r.fps} bilder/s, ${r.labels} etiketter, ${r.list} i listan, heap ${r.heap} MB${r.jumpOk ? '' : ', ÅRSHOPPET NÅDDE INTE FRAM'}${r.errors.length ? `, fel: ${r.errors.join('; ')}` : ''}`);
  }
} finally {
  await browser.close();
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log(`\n| Bredd | Händelser | Första ritning (ms) | Årshopp (ms) | Längsta glapp (ms) | Bilder/s vid snurr | Etiketter | Rader i listan | JS-heap (MB) |\n|---|---|---|---|---|---|---|---|---|`);
for (const r of results) console.log(`| ${r.vp} | ${r.events} (${r.factor}×) | ${r.first} | ${r.jump} | ${r.gap} | ${r.fps} | ${r.labels} | ${r.list} | ${r.heap} |`);
console.log(`\n| Händelser | Pågår 1969 | Pågår 1500 | Tätaste året (antal) |\n|---|---|---|---|`);
for (const r of results.filter(x => x.vp === VIEWPORTS[0].name)) console.log(`| ${r.events} (${r.factor}×) | ${r.y1969} | ${r.y1500} | ${r.peakYear} (${r.peak}) |`);
console.log(`\nRenderare: ${GPU ? 'grafikkort (GPU=1)' : 'mjukvarurendering (SwiftShader)'}, CPU-strypning ${THROTTLE}×, median av ${ROUNDS} mätningar.`);
if (process.env.UT) fs.writeFileSync(process.env.UT, JSON.stringify(results, null, 2));
