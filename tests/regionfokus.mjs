// #1950: tangentbord från platskort till karta. Kör: NODE_PATH=<playwright> node tests/regionfokus.mjs <port>.
// Eget skript så att kontrollen kan köras utan den stora webbläsarsviten. Samma Playwright-beroende som den sviten.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const port = Number(process.argv[2] ?? 8000);
assert.ok(Number.isInteger(port) && port > 0 && port < 65536, 'ange en lokal port');
const base = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ headless: true });
const cases = [
  { place: 'skane', target: 'flat-region-back' },
  { place: 'sverige', target: 'flat-canvas' },
  { place: 'gronland', target: 'globe-region-back', motion: 'no-preference' },
  { place: 'gronland', target: 'globe-region-back', motion: 'reduce' },
];
try {
  for (const width of [1280, 400]) for (const { place, target, motion = 'no-preference' } of cases) {
    const context = await browser.newContext({ viewport: { width, height: 800 }, reducedMotion: motion, locale: 'sv-SE' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)\.com/.test(m.location().url)) errors.push(m.text()); });
    try {
      // Platserna provar de tre olika kartvägarna; året styr inte vilken väg en plats får.
      await page.goto(`${base}?lang=sv#y=1800&f=place:${place}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#loading', { state: 'hidden', timeout: 60000 });
      const action = page.locator('#detail [data-selection-action]');
      await action.waitFor({ state: 'visible' });
      if (target === 'globe-region-back') await page.evaluate(async () => {
        // Läs den verkliga kamerans övergång när knappen används, utan att ändra övergångens beteende.
        const { Globe } = await import('./js/globe.js');
        const original = Globe.prototype.setRegion;
        Globe.prototype.setRegion = function (...args) {
          const result = original.apply(this, args);
          window.__regionMotion = { calm: this.calm, ms: this._pose?.ms };
          return result;
        };
      });
      await action.focus();
      await page.keyboard.press('Enter');
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const destination = page.locator(`#${target}`);
      assert.ok(await destination.isVisible(), `${width}/${place}: målet måste synas`);
      assert.equal(await page.locator(':focus').getAttribute('id'), target, `${width}/${place}: fokus efter knapp och mobilark`);
      // Kartans egna markörer och etiketter (#flat-labels) ligger ovanpå kartytan och räknas som kartan, inte som något som täcker
      // den (#2425: ett händelsekluster mitt i Sverige i 400 px); ark, paneler och knappar räknas fortfarande som täckning.
      assert.ok(await destination.evaluate(el => {
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        const own = el.id === 'flat-canvas' ? document.getElementById('flat-labels') : null;
        return el.contains(hit) || !!(own && own.contains(hit));
      }), `${width}/${place}: fokusmålet är täckt`);
      if (target === 'globe-region-back') {
        const state = await page.evaluate(() => window.__regionMotion);
        assert.equal(state.calm, motion === 'reduce', `${width}/${place}: reducerad rörelse följer webbläsaren`);
        assert.ok(motion === 'reduce' ? state.ms <= 1 : state.ms > 1, `${width}/${place}: faktisk kameratid ${JSON.stringify(state)}`);
      }
      if (target === 'flat-canvas') {
        const before = await page.locator('#flat-view').getAttribute('data-view');
        await page.keyboard.press('ArrowRight');
        await page.waitForFunction(v => document.querySelector('#flat-view').dataset.view !== v, before);
      } else {
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => !document.querySelector('#app').classList.contains('region-view'));
        assert.equal(await page.locator(':focus').getAttribute('id'), 'globe-canvas', `${width}/${place}: lämna med tangentbord återför fokus till globen`);
      }
      assert.deepEqual(errors, [], `${width}/${place}: konsolfel`);
      console.log(`OK ${width}px ${place} ${motion}: ${target}, tangentbord och rörelse`);
    } catch (e) {
      if (process.env.SKARMBILDER) {
        mkdirSync(process.env.SKARMBILDER, { recursive: true });
        await page.screenshot({ path: join(process.env.SKARMBILDER, `1950-${width}-${place}-${motion}.png`) }).catch(() => {});
      }
      throw e;
    } finally {
      // Varje fall har egen kontext; öppna kort och kartor lämnas aldrig kvar till nästa fall.
      await context.close();
    }
  }
} finally {
  await browser.close();
}
