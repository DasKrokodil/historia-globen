// Mätning av stora hopp i tiden (#692): hur länge sidans huvudtråd är blockerad när man börjar följa
// andra världskriget från 3000 f.Kr. med lagret Resor påslaget. Körs för hand, inte i CI.
//
//   bash scripts/build-site.sh
//   python3 -m http.server 8000 --directory dist &
//   node tools/matning_hopp.mjs 8000
//
// Miljövariabler (valfria):
//   STRYPNING=<tal>   CPU-strypning i Chrome (till exempel 4), som en svag dator
//   GPU=1             starta Chromium med grafikkort (--enable-gpu, --use-angle=default) i stället för mjukvarurendering
//   VARV=<tal>        antal mätningar (standard 3); medianen och det längsta värdet redovisas
//   HOPP=<hash>       vyn som det hoppas till (standard: andra världskriget i fokus)
// Playwright hämtas med require, så NODE_PATH fungerar (till exempel NODE_PATH=/opt/node22/lib/node_modules).
//
// Mätt under 30 sekunder efter hoppet (SEKUNDER=<tal> ändrar det): den längsta tiden sidan inte svarade (glappet
// mellan två varv av en timer som körs var 50:e ms), den längsta enskilda uppgiften och de långa uppgifternas
// summa (Long Tasks API, över 50 ms). Utan grafikkort är varje bildruta av globen en lång uppgift, så summan växer
// också när sidan står still; det är glappet som visar om sidan låser sig.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const playwright = require('playwright');

const PORT = Number(process.argv[2] || 8000);
const URL = `http://localhost:${PORT}/`;
const THROTTLE = Number(process.env.STRYPNING || 1);
const GPU = process.env.GPU === '1';
const ROUNDS = Number(process.env.VARV || 3);
const LAYERS = 'events,funfacts,areas,routes,wars';
const START = `#y=-2999&l=${LAYERS}`;
const TARGET = process.env.HOPP || `#y=-2999&f=war:andra-varldskriget&l=${LAYERS}`;

const args = GPU ? ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=default'] : [];

async function measure(browser) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.addInitScript(() => {
    window.__long = [];
    new PerformanceObserver(list => { for (const e of list.getEntries()) window.__long.push({ t: e.startTime, d: e.duration }); })
      .observe({ type: 'longtask', buffered: true });
  });
  await page.goto(URL + START);
  await page.waitForFunction(() => document.getElementById('loading')?.hidden || !document.getElementById('loading'), null, { timeout: 120000 });
  await page.waitForTimeout(4000); // låt starten lugna sig
  if (THROTTLE > 1) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
  }
  // Sonden: en timer var 50:e ms. Det längsta glappet mellan två varv är den längsta tiden sidan inte
  // kunde svara (klick och tangenter väntar lika länge).
  const t0 = await page.evaluate(target => {
    window.__long = []; window.__gaps = [];
    let last = performance.now();
    const tick = () => { const now = performance.now(); window.__gaps.push([last, now - last]); last = now; if (!window.__stop) setTimeout(tick, 50); };
    setTimeout(tick, 50);
    const t = performance.now();
    history.pushState(null, '', location.pathname + location.search + target);
    dispatchEvent(new PopStateEvent('popstate'));
    return t;
  }, TARGET);
  await new Promise(r => setTimeout(r, Number(process.env.SEKUNDER || 30) * 1000));
  const res = await page.evaluate(t0 => {
    window.__stop = true;
    const gaps = window.__gaps.filter(([t]) => t >= t0 - 100);
    const tasks = window.__long.filter(e => e.t + e.d >= t0);
    return { gap: Math.max(0, ...gaps.map(g => g[1])), first: (gaps[0]?.[0] ?? t0) + (gaps[0]?.[1] ?? 0) - t0, longest: Math.max(0, ...tasks.map(e => e.d)),
      total: tasks.reduce((s, e) => s + e.d, 0), count: tasks.length, year: document.getElementById('year-big')?.textContent,
      gpu: (() => { const gl = document.createElement('canvas').getContext('webgl'); const x = gl?.getExtension('WEBGL_debug_renderer_info'); return gl ? gl.getParameter(x ? x.UNMASKED_RENDERER_WEBGL : gl.RENDERER) : 'ingen WebGL'; })() };
  }, t0);
  await page.close();
  return res;
}

const browser = await playwright.chromium.launch({ args });
const rows = [];
for (let i = 0; i < ROUNDS; i++) {
  const r = await measure(browser);
  rows.push(r);
  console.log(`varv ${i + 1}: sidan svarade inte på ${Math.round(r.gap)} ms (första svaret efter ${Math.round(r.first)} ms); längsta uppgift ${Math.round(r.longest)} ms; långa uppgifter sammanlagt ${Math.round(r.total)} ms (${r.count} st, år ${r.year})`);
}
await browser.close();
const med = xs => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
console.log(`\nRenderare: ${rows[0].gpu}\n${GPU ? 'GPU=1' : 'standardläge'}, CPU-strypning ${THROTTLE}×: ` +
  `längsta tid utan svar median ${Math.round(med(rows.map(r => r.gap)))} ms (max ${Math.round(Math.max(...rows.map(r => r.gap)))} ms), ` +
  `långa uppgifter sammanlagt median ${Math.round(med(rows.map(r => r.total)))} ms`);
