// Synliga datum på alla fem språk (#983). Starta dist/ på en egen port först.
// NODE_PATH=<Playwrights node_modules> THREE_LOCAL=<three.module.js> node tests/date-format.webblasare.mjs 8001
import { createRequire } from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const base = `http://localhost:${Number(process.argv[2] || 8001)}/`;
const cases = [
  ['sv', '4 juli 2026', '26 april 1986'],
  ['en', '4 July 2026', '26 April 1986'],
  ['de', '4. Juli 2026', '26. April 1986'],
  ['es', '4 de julio de 2026', '26 de abril de 1986'],
  ['fr', '4 juillet 2026', '26 avril 1986'],
];
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  for (const width of [1400, 400]) for (const [lang, date, eventDate] of cases) {
    const context = await browser.newContext({ viewport: { width, height: width === 400 ? 800 : 900 }, timezoneId: 'America/Los_Angeles' });
    const errors = [];
    try {
      if (process.env.THREE_LOCAL) {
        await context.route('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js', route => route.fulfill({
          contentType: 'application/javascript', body: fs.readFileSync(process.env.THREE_LOCAL, 'utf8'),
        }));
        await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
      }
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error' && !/fonts\.(googleapis|gstatic)\.com/.test(message.location()?.url || '')) errors.push(message.text());
      });
      await page.goto(`${base}?lang=${lang}`);
      await page.locator('#loading').waitFor({ state: 'hidden', timeout: 90000 });
      const jump = async input => {
        if (!await page.locator('#jump-input').isVisible()) await page.locator('#year-jump').click();
        await page.locator('#jump-input').fill(input);
        await page.locator('#jump-pop').evaluate(form => form.requestSubmit());
      };
      await jump('20260704');
      assert.ok((await page.locator('#jump-date-summary').innerText()).includes(date), `${lang}: ${date}`);
      // Öppna samma befintliga datumresultat som huvudsvitens prov av faktarutan (#590).
      await jump('19860426');
      await page.locator('#jump-date-events button.jump-date-event[data-id="tjernobylkatastrofen"]').click();
      await page.locator('#detail').waitFor({ state: 'visible' });
      assert.ok((await page.locator('#detail .meta').first().innerText()).startsWith(eventDate), `${lang}: ${eventDate}`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${lang}: horisontell scroll`);
      assert.deepEqual(errors, [], `${lang}: konsolfel`);
      console.log(`OK ${lang} ${width}px: ${date}; faktarutan ${eventDate}`);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
