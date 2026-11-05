// Webbläsartest (#339): öppnar den byggda sidan i Chromium med Playwright, i datorbredd och mobilbredd,
// och kontrollerar grundfunktionerna. Körs i GitHub Actions (.github/workflows/browser-test.yml) och lokalt.
// Filen heter inte *.test.mjs, eftersom `node --test 'tests/*.test.mjs'` bara ska köra serverfunktionens tester.
//
//   bash scripts/build-site.sh
//   python3 -m http.server 8000 --directory dist &
//   node tests/webblasare.mjs 8000
//
// Argument: porten (standard 8000). Sidan hämtas från http://localhost:<port>/.
// Miljövariabler (alla valfria):
//   BASE_URL=<adress>    testa en redan publicerad sida i stället, till exempel https://historiagloben.se/
//   BROWSER=<motor>       chromium (standard), firefox eller webkit
//   SKARMBILDER=<mapp>   var skärmbilderna sparas (standard: <tmp>/historia-globen-webblasartest)
//   THREE_LOCAL=<fil>    lokal kopia av three.module.js (three@0.160.0) som ersätter jsdelivr. För miljöer utan
//                        nät till jsdelivr, till exempel molnmiljön. Google Fonts avbryts då också.
// Playwright hämtas med require, så NODE_PATH fungerar (till exempel NODE_PATH=/opt/node22/lib/node_modules).
//
// Kontrollerna (samma i båda bredderna):
//   inga fel i konsolen (bara avbrutna typsnitt från Google Fonts är tillåtna), three.js laddas, globen laddas
//   (laddningsrutan försvinner), tidslinjen går att flytta, Lager, Fokus, Platt vy och Källor öppnas, ett rike
//   och en väg syns på kartan, och sidan har ingen horisontell scroll.
// Testet väntar på tillstånd (waitForFunction, väntan på element), inte på fasta tider.
// Avslutas med kod 1 om någon kontroll misslyckas.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const playwright = require('playwright');
const { PNG } = require('playwright-core/lib/utilsBundle');

const PORT = Number(process.argv[2] || 8000);
const BROWSER = process.env.BROWSER || 'chromium';
const browserType = { chromium: playwright.chromium, firefox: playwright.firefox, webkit: playwright.webkit }[BROWSER];
if (!browserType) throw new Error(`Okänd webbläsarmotor: ${BROWSER}`);
const target = process.env.BASE_URL || `http://localhost:${PORT}/`;
const BASE = target.endsWith('/') ? target : `${target}/`;
const OUT = path.resolve(process.env.SKARMBILDER || path.join(os.tmpdir(), 'historia-globen-webblasartest'));
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const THREE_LOCAL = process.env.THREE_LOCAL || '';
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com']; // avbrutna typsnitt är tillåtna
const ROUTE_YEAR = 1420; // år med vägar och resor (Zheng He, handelsvägar) och riken
const T = { load: 90000, step: 15000 };

const VIEWPORTS = [
  { name: 'dator', width: 1400, height: 900 },
  { name: 'mobil', width: 400, height: 800 },
];

fs.mkdirSync(OUT, { recursive: true });
const isFont = url => { try { return FONT_HOSTS.includes(new URL(url).hostname); } catch { return false; } };

// Körs i sidan: jämför den platta kartans pixlar (#flat-canvas) med en sparad bild.
// Används för att se att ett lager faktiskt ritar något: lagret av → spara → lagret på → räkna ändrade pixlar.
const PIXELS = `(() => {
  const c = document.getElementById('flat-canvas');
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  return d;
})()`;
const DIFF = `((a, b) => {
  if (!a || !b || a.length !== b.length) return Infinity;
  let n = 0;
  for (let i = 0; i < a.length; i += 4) {
    if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 30) n++;
  }
  return n;
})`;

async function run(browser, vp) {
  const results = [];
  const errors = [];
  const webglWarnings = [];
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  let threeOk = false;

  page.on('console', m => {
    if (m.type() === 'warning' && /GL_INVALID_VALUE|glTexSubImage2D/i.test(m.text())) {
      webglWarnings.push(m.text());
      return;
    }
    if (m.type() !== 'error') return;
    const url = m.location()?.url || '';
    if (isFont(url)) return;
    errors.push(`konsol: ${m.text()}${url ? ` (${url})` : ''}`);
  });
  page.on('pageerror', e => errors.push(`sidfel: ${e.message}`));
  page.on('requestfailed', r => {
    if (isFont(r.url())) return;
    errors.push(`laddning misslyckades: ${r.url()} (${r.failure()?.errorText})`);
  });
  page.on('response', r => { if (r.url() === THREE_URL && r.ok()) threeOk = true; });

  if (THREE_LOCAL) {
    const body = fs.readFileSync(THREE_LOCAL, 'utf8');
    await page.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
    await page.route(u => isFont(u.href), r => r.abort());
  }

  const shot = async name => page.screenshot({ path: path.join(OUT, `${vp.name}-${name}.png`) });
  const screenshotPixel = (buffer, x, y) => {
    const image = PNG.sync.read(buffer);
    if (x < 0 || y < 0 || x >= image.width || y >= image.height) throw new Error('skärmbilden saknar mätpunkten');
    const offset = (y * image.width + x) * 4;
    return [...image.data.subarray(offset, offset + 3)];
  };
  const visible = sel => page.waitForSelector(sel, { state: 'visible', timeout: T.step });
  const hidden = sel => page.waitForSelector(sel, { state: 'hidden', timeout: T.step });
  const check = async (name, fn) => {
    const t0 = Date.now();
    try {
      const note = await fn();
      results.push({ name, ok: true, ms: Date.now() - t0, note });
    } catch (e) {
      results.push({ name, ok: false, ms: Date.now() - t0, note: String(e.message).split('\n')[0] });
      await shot(`FEL-${name.replace(/[^a-zåäö0-9]+/gi, '-')}`).catch(() => {});
      await page.keyboard.press('Escape').catch(() => {});
    }
  };
  const year = () => page.textContent('#year-big').then(s => s.trim());
  const yearNumber = () => page.evaluate(() => {
    const value = Number(document.getElementById('year-big').textContent.trim());
    return document.getElementById('year-era').textContent.trim() === 'f.Kr.' ? 1 - value : value;
  });
  // Platt vy, Källor och Hjälp ligger i mobilen i menyn Visa (#361): öppna den först när knappen inte syns
  const clickView = async sel => {
    if (await page.isHidden(sel) && await page.isVisible('#more-toggle')) await page.click('#more-toggle');
    await page.click(sel);
  };
  const jumpTo = async y => {
    await page.click('#year-jump');
    await visible('#jump-input');
    const text = y < 1 ? `${1 - y} f.Kr.` : String(y);
    await page.fill('#jump-input', text);
    await page.press('#jump-input', 'Enter');
    await page.waitForFunction(v => document.getElementById('year-big').textContent.trim() === v, String(y < 1 ? 1 - y : y), { timeout: T.step });
  };
  // Väntar tills den platta kartan står still (två bilder i rad nästan lika) och sparar den som jämförelsebild.
  const settleFlat = () => page.waitForFunction(`(() => {
    const now = ${PIXELS}, prev = window.__hgTestPrev;
    window.__hgTestPrev = now;
    if (prev && ${DIFF}(prev, now) < 20) { window.__hgTestBase = now; return true; }
    return false;
  })()`, null, { polling: 300, timeout: T.step });
  const layerRow = name => `#layer-menu input[data-layer="${name}"]`;
  const setLayer = async (name, on) => {
    if (await page.isHidden('#layer-menu')) { await page.click('#btn-layers'); await visible('#layer-menu'); }
    const box = page.locator(layerRow(name));
    if (await box.isHidden()) { await page.click('#layer-customize'); await box.waitFor({ state: 'visible', timeout: T.step }); }
    if ((await box.isChecked()) !== on) await box.click();
  };
  const setPause = async (name, on) => {
    if (await page.isHidden('#layer-menu')) { await page.click('#btn-layers'); await visible('#layer-menu'); }
    const box = page.locator(`input[data-pause="${name}"]`);
    if (await box.isHidden()) { await page.click('#layer-customize'); await box.waitFor({ state: 'visible', timeout: T.step }); }
    if ((await box.isChecked()) !== on) await box.click();
  };
  // Slår av ett lager, väntar på att kartan står still, slår på det och väntar på att minst min pixlar ändras.
  const layerDraws = async (name, min) => {
    await setLayer(name, false);
    await page.mouse.move(1, 1);
    await settleFlat();
    await setLayer(name, true);
    await page.mouse.move(1, 1);
    const h = await page.waitForFunction(`(() => { const n = ${DIFF}(window.__hgTestBase, ${PIXELS}); return n >= ${min} && n; })()`,
      null, { polling: 300, timeout: T.step });
    return h.jsonValue();
  };

  await check('sidan svarar', async () => {
    const r = await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: T.load });
    if (!r || !r.ok()) throw new Error(`HTTP ${r?.status()} för ${BASE}`);
  });

  await check('globen laddas', async () => {
    await page.waitForFunction(() => {
      const l = document.getElementById('loading');
      return l && (l.hidden || getComputedStyle(l).display === 'none');
    }, null, { timeout: T.load });
    const helpStartsHidden = await page.evaluate(() => ({
      hidden: document.getElementById('help')?.hidden,
      expanded: document.getElementById('btn-help')?.getAttribute('aria-expanded'),
      legacySeen: localStorage.getItem('hg-help-seen'),
    }));
    if (!helpStartsHidden.hidden) throw new Error('hjälpen öppnas automatiskt vid första besöket');
    if (helpStartsHidden.expanded !== 'false') throw new Error('Hjälp-knappen är inte stängd vid första besöket');
    if (helpStartsHidden.legacySeen !== null) throw new Error('hjälpen använder fortfarande hg-help-seen');
    const msg = await page.textContent('#loading');
    if (/kunde inte starta/i.test(msg)) throw new Error(msg.trim());
    if (!THREE_LOCAL && !threeOk) throw new Error('three.js laddades inte från jsdelivr');
    await shot('1-start');
    await shot('538-grundvy');
    return `år ${await year()}`;
  });

  await check('källor per påstående grupperas utan att ändra händelsedata', async () => {
    const rendered = await page.evaluate(async () => {
      const { evidenceView } = await import('./js/ui/panel.js');
      const view = evidenceView({ evidence: {
        summary: [{ source: 'a', role: 'text' }],
        date: [{ source: 'a', role: 'date' }],
        location: [{ source: 'b', role: 'map' }],
      } }, [
        { id: 'a', title: 'Källa A', url: 'https://example.test/a' },
        { id: 'b', title: 'Källa B', url: 'https://example.test/b' },
        { id: 'c', title: 'Källa C', url: 'https://example.test/c' },
      ]);
      return { summary: view.marker('summary'), location: view.marker('location'), sources: view.sources };
    });
    if (!rendered.summary.includes('[1]') || !rendered.location.includes('[2]')) {
      throw new Error('hänvisningssiffrorna efter påståendena saknas eller är inte stabila');
    }
    if (!/Alla källor/.test(rendered.sources) || !/Datum/.test(rendered.sources) || !/Text/.test(rendered.sources)
      || !/Karta/.test(rendered.sources) || !/Övriga källor/.test(rendered.sources)) {
      throw new Error('källorna grupperas inte efter roll med kvarvarande källor');
    }
    return 'hänvisningar och rollgrupper från testobjekt';
  });

  await check('hjälpen öppnas bara på begäran', async () => {
    const help = page.locator('#help');
    const helpButton = page.locator('#btn-help');
    await clickView('#btn-help');
    await visible('#help');
    if ((await helpButton.getAttribute('aria-expanded')) !== 'true') throw new Error('Hjälp-knappen visar inte att hjälpen är öppen');
    if (await page.evaluate(() => document.activeElement?.id !== 'help-close')) throw new Error('fokus flyttas inte till Stäng när hjälpen öppnas');
    await shot('1-hjalp-oppnas');
    await page.keyboard.press('Escape');
    await hidden('#help');
    if ((await helpButton.getAttribute('aria-expanded')) !== 'false') throw new Error('Hjälp-knappen visar inte att hjälpen är stängd');
    if (vp.width > 760 && await page.evaluate(() => document.activeElement?.id !== 'btn-help')) throw new Error('Escape lämnar inte fokus på Hjälp-knappen');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await clickView('#btn-help');
    await visible('#help');
    const animation = await help.evaluate(el => getComputedStyle(el).animationDuration);
    if ((Number.parseFloat(animation) || 0) > .001) throw new Error(`hjälpens rörelse stoppas inte vid reducerad rörelse: ${animation}`);
    await page.keyboard.press('Escape');
    await hidden('#help');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    return 'ingen automatisk hjälp; öppning, Escape, fokus och reducerad rörelse fungerar';
  });

  await check('Min dag i historien hoppar till år och visar datumurval', async () => {
    await clickView('#btn-help'); await visible('#help');
    const input = page.locator('#birthday-input');
    await input.fill('1969'); await page.locator('#birthday-form').evaluate(form => form.requestSubmit());
    await visible('#birthday-result');
    if (!/(1969: \d+ händelser)/.test((await page.textContent('#birthday-summary')) ?? '')) throw new Error('årsresultatet saknas');
    if (String(await year()) !== '1969') throw new Error(`året hoppade inte till 1969 utan ${await year()}`);
    await input.fill('1969-07-20'); await page.locator('#birthday-form').evaluate(form => form.requestSubmit());
    if (!/1969-07-20: \d+ händelser med dagsdatum/.test((await page.textContent('#birthday-summary')) ?? '')) throw new Error('datumresultatet saknar dagsdatum');
    await input.fill('inte ett år'); await page.locator('#birthday-form').evaluate(form => form.requestSubmit());
    await visible('#birthday-error');
    await page.click('#help-close');
    return 'årshopp, fullständigt datum och feltext fungerar';
  });

  await check('Samtidigt sorterar och skiljer gamla öppna spann', async () => {
    await jumpTo(1100); await page.click('#btn-panel'); await visible('#panel');
    if (!(await page.locator('#event-list .event-btn', { hasText: 'Undervisning i Oxford' }).count())) throw new Error('Oxford saknas i vanliga listan år 1100');
    await page.click('#panel-close');
    await clickView('#btn-flat');
    await page.click('#flat-reset'); await settleFlat();
    if (!/(^|\s)oxford(\s|$)/.test((await page.locator('#flat-view').getAttribute('data-visible-events')) ?? '')) throw new Error('Oxford-markören saknas i Platt vy år 1100');
    await clickView('#btn-flat');
    await jumpTo(1612);
    await page.click('#btn-panel'); await visible('#panel');
    const old = page.locator('#event-list [data-long]');
    if (!(await old.count()) || (await old.getAttribute('aria-expanded')) !== 'false') throw new Error('Oxford saknar hopfälld långvarig grupp år 1612');
    const panelText = (await page.textContent('#panel')).replace(/\s+/g, ' ');
    if (!/träffar: \d+ pågår, \d+ nära/.test(panelText) || /\{count\}|\{inside\}|\{near\}/.test(panelText)) throw new Error('panelen visar inte datastyrd träffsammanfattning');
    if (await page.locator('#panel button').evaluateAll(buttons => buttons.some(b => ['longRunning', 'showMore', 'showLess', 'summary'].includes(b.textContent.trim())))) throw new Error('panelen visar en rå datanyckel');
    if (!/Pågår sedan länge \(1\)/.test((await old.textContent()) ?? '')) throw new Error('långraden har fel synlig text');
    await old.focus(); await page.keyboard.press('Enter');
    if (!(await page.locator('#event-list .event-btn', { hasText: 'Undervisning i Oxford' }).count())) throw new Error('Oxford visas inte efter att långvarig grupp öppnas');
    await page.click('#panel-close');
    await clickView('#btn-flat');
    await page.click('#flat-reset'); await settleFlat();
    if (/(^|\s)oxford(\s|$)/.test((await page.locator('#flat-view').getAttribute('data-visible-events')) ?? '')) throw new Error('Oxford-markören syns i Platt vy år 1612');
    await clickView('#btn-flat');
    await page.click('#btn-panel'); await visible('#panel');
    const more = page.locator('#event-list [data-region]').first();
    if (await more.count()) { if (!/Visa \d+ till i /.test((await more.textContent()) ?? '')) throw new Error('Visa fler saknar synlig datastyrd världsdel'); await more.focus(); await page.keyboard.press('Enter'); if ((await more.getAttribute('aria-expanded')) !== 'true') throw new Error('Visa fler öppnas inte med tangentbord'); }
    await jumpTo(1889);
    return 'Oxford: vanlig 1100, hopfälld 1612; Visa fler nås med tangentbord';
  });

  await check('introduktionen startas frivilligt från Utforska', async () => {
    // Samtidigt-provet ovan öppnar listan för Visa fler. Stäng den som en besökare gör så att
    // introduktionsknappen provas utan en avsiktligt överlagrad panel i mobilbredd.
    if (await page.locator('#panel').isVisible()) await page.click('#panel-close');
    if (await page.isVisible('#intro')) throw new Error('introduktionen öppnas automatiskt vid första besöket');
    if (await page.locator('#help-intro').count()) throw new Error('Hjälp innehåller fortfarande en länk till introduktionen');
    const introButton = page.locator('#btn-intro');
    await visible('#btn-intro');
    if ((await introButton.textContent()).trim() !== 'Ett år, en plats') throw new Error('knappen under Utforska har fel text');
    await introButton.click();
    await visible('#intro');
    if ((await year()) !== '1889') throw new Error(`introduktionen startade på ${await year()} i stället för 1889`);
    const first = (await page.textContent('#intro')).replace(/\s+/g, ' ').trim();
    if (!first.includes('Eiffeltornet')) throw new Error('introduktionens första steg saknar den valda händelsen');
    await page.click('#intro-next');
    const second = (await page.textContent('#intro')).replace(/\s+/g, ' ').trim();
    if (!second.includes('Nintendo') || !second.includes('Samma år som Eiffeltornet')) throw new Error('introduktionen visar inte fun facten med två platser');
    await page.click('#intro-next');
    if (!(await page.locator('#intro .intro-choice').count())) throw new Error('introduktionens sista steg saknar val');
    await page.keyboard.press('Escape');
    await hidden('#intro');
    if ((await year()) !== '1889') throw new Error('året ändrades när introduktionen stängdes');
    if (await page.evaluate(() => localStorage.getItem('hg-intro-seen') !== null)) throw new Error('introduktionen använder fortfarande hg-intro-seen');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await introButton.click();
    await visible('#intro');
    const animation = await page.locator('.intro-box').evaluate(el => getComputedStyle(el).animationName);
    if (animation !== 'none') throw new Error(`introduktionen animeras trots Lugn rörelse: ${animation}`);
    await page.keyboard.press('Escape');
    await hidden('#intro');
    const focusRestored = await page.evaluate(() => document.activeElement?.id === 'btn-intro');
    if (!focusRestored) throw new Error('Escape lämnade inte fokus på knappen som öppnade introduktionen');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    return 'ingen automatisk popup; tre steg, år 1889, Escape och reducerad rörelse fungerar';
  });

  await check('Samtidigt-kortet går till nästa händelse', async () => {
    await visible('#funfact');
    if (await page.locator('#panel').isHidden()) await page.click('#btn-panel');
    await visible('#panel');
    await shot('538-samtidigt-oppet');
    await page.click('#panel-close');
    await hidden('#panel');
    const next = page.locator('#ff-next');
    if (await next.isHidden()) throw new Error('Samtidigt-kortet saknar Nästa vid ett kort med flera händelser');
    const before = (await page.textContent('#ff-events')).replace(/\s+/g, ' ').trim();
    const pagerBefore = (await page.textContent('#ff-pager')).trim();
    await next.click();
    await page.waitForFunction(({ before, pagerBefore }) => {
      const events = document.getElementById('ff-events')?.textContent.replace(/\s+/g, ' ').trim();
      const pager = document.getElementById('ff-pager')?.textContent.trim();
      return events && (events !== before || pager !== pagerBefore);
    }, { before, pagerBefore }, { timeout: T.step });
    const after = (await page.textContent('#ff-events')).replace(/\s+/g, ' ').trim();
    await shot('2-samtidigt-nasta');
    return `${pagerBefore} → ${(await page.textContent('#ff-pager')).trim()}: ${before} → ${after}`;
  });

  await check('Visste du? väljer ett regionbalanserat kort och hoppar till dess år', async () => {
    const surprise = page.locator('#ff-surprise');
    await surprise.waitFor({ state: 'visible', timeout: T.step });
    if ((await surprise.textContent()).trim() !== 'Visste du?') throw new Error('Visste du?-texten kommer inte från vyn');
    const selection = await page.evaluate(async () => {
      const [{ pickBalancedFunFact }, factDoc, eventDoc] = await Promise.all([
        import('./js/ui/funfact.js'), fetch('./data/funfacts.json').then(r => r.json()), fetch('./data/events.json').then(r => r.json()),
      ]);
      const byId = Object.fromEntries(eventDoc.events.map(event => [event.id, event]));
      const one = new Map(), two = new Map();
      const recentA = [], recentB = [];
      const a = [], b = [];
      for (let seed = 0; seed < 25; seed++) {
        const first = pickBalancedFunFact(factDoc.funfacts, byId, one, seed, recentA)?.fact.id;
        const second = pickBalancedFunFact(factDoc.funfacts, byId, two, seed, recentB)?.fact.id;
        a.push(first); b.push(second);
        recentA.push(first); recentB.push(second);
        if (recentA.length > 5) recentA.shift();
        if (recentB.length > 5) recentB.shift();
      }
      const counts = [...one.values()];
      const firstTen = a.slice(0, 10);
      const mostRepeated = Math.max(...Object.values(Object.groupBy(firstTen, id => id)).map(ids => ids.length));
      return { same: JSON.stringify(a) === JSON.stringify(b), spread: Math.max(...counts) - Math.min(...counts), available: counts.length, mostRepeated };
    });
    if (!selection.same || selection.available < 2 || selection.spread > 1 || selection.mostRepeated > 2) throw new Error(`urvalet är inte deterministiskt, jämnt och varierat (${JSON.stringify(selection)})`);
    // I mobil ligger kortets fot i ett eget rullbart ark. Klickhanteraren prövas
    // direkt här, medan den separata träffyte- och omflödeskontrollen nedan
    // verifierar att knappen också får plats på skärmen.
    await surprise.evaluate(button => button.click());
    await visible('#funfact');
    const chosen = await page.evaluate(async () => {
      const id = document.getElementById('funfact')?.dataset.funfactId;
      const doc = await fetch('./data/funfacts.json').then(r => r.json());
      return doc.funfacts.find(fact => fact.id === id);
    });
    if (!chosen || chosen.review === 'draft') throw new Error('knappen valde ingen redan synlig fun fact');
    const expected = String(chosen.show[0] < 1 ? 1 - chosen.show[0] : chosen.show[0]);
    if (await year() !== expected) throw new Error(`tiden hoppade inte till kortets år ${expected}`);
    if (vp.width <= 760) {
      await page.locator('#btn-layers').evaluate(button => button.click()); await visible('#layer-menu');
      const calm = page.locator('input[data-calm]');
      if (!(await calm.isChecked())) await calm.evaluate(input => input.click());
      // Kortets fot ligger längst ned i mobilarket. Aktivera samma knappprogram när
      // Lagermenyn är öppen, så testet prövar årshoppet utan att en överliggande meny
      // får Playwrights koordinatklick att fastna.
      await surprise.evaluate(button => button.click()); await visible('#funfact');
      if (!await page.evaluate(() => document.documentElement.classList.contains('calm'))) throw new Error('Lugn rörelse försvann vid Visste du?-hoppet');
      if (await calm.isChecked()) await calm.evaluate(input => input.click());
      await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
      await hidden('#layer-menu');
    }
    return `deterministiskt urval i ${selection.available} världsdelar, högst ${selection.mostRepeated} gånger samma fact på tio tryck; kortet hoppade till ${expected}`;
  });

  await check('Samtidigt-kortet ger bildlösa händelser en likvärdig reservruta', async () => {
    await jumpTo(1879); await visible('#funfact');
    const cards = page.locator('#ff-pics .ff-pic');
    const reserve = page.locator('#ff-pics .ff-pic.ff-reserve');
    const image = page.locator('#ff-pics .ff-pic img:not(.ff-reserve-icon)');
    if (await cards.count() < 3 || await reserve.count() < 2 || !await image.count()) throw new Error('1879 saknar blandade bild- och reservkort');
    const label = await reserve.first().getAttribute('aria-label');
    if (!/Krig och konflikter, 1879, Anglo-zuluiska kriget/.test(label ?? '')) throw new Error('reservkortet saknar kategori, år och titel i sitt namn');
    const missing = await reserve.evaluateAll(nodes => nodes.some(node => ['.ff-reserve-icon', '.ff-reserve-year', '.ff-reserve-category', '.ff-name'].some(selector => !node.querySelector(selector))));
    if (missing) throw new Error('reservkortet saknar ikon, år, kategori eller titel');
    const heights = await cards.evaluateAll(nodes => nodes.map(node => Math.round(node.getBoundingClientRect().height)));
    if (new Set(heights).size !== 1) throw new Error(`bild- och reservkort har olika höjd: ${heights.join(', ')}`);
    const imageHeight = await image.first().evaluate(el => Math.round(el.closest('.ff-pic').getBoundingClientRect().height));
    await page.screenshot({ path: path.join(OUT, `${vp.name}-samtidigt-reservkort-1879.png`), fullPage: false });
    try {
      await jumpTo(1274);
      if ((await page.textContent('#ff-kind')).trim() !== 'När ett krig bröt ut') throw new Error('1274 saknar det verifierade krigskortet i Samtidigt');
      const symbol = page.locator('#ff-pics .ff-symbol.ff-reserve');
      await symbol.waitFor({ state: 'visible', timeout: T.step });
      const symbolHeight = await symbol.evaluate(el => Math.round(el.getBoundingClientRect().height));
      if (Math.abs(symbolHeight - imageHeight) > 1) throw new Error(`bildlöst krigskort har höjd ${symbolHeight}, bildkortet ${imageHeight}`);
    } finally {
      await jumpTo(1889);
    }
    return 'bildkort och bildlöst krigskort har samma höjd och tillgängliga namn';
  });

  await check('skärmläsarstatusen säger paus och Samtidigt-text', async () => {
    const attrs = await page.evaluate(() => {
      const year = document.querySelector('.year-readout');
      const card = document.getElementById('funfact');
      const status = document.getElementById('screen-reader-status');
      const resume = document.getElementById('pause-go');
      return {
        yearLive: year?.getAttribute('aria-live'), cardLive: card?.getAttribute('aria-live'),
        statusRole: status?.getAttribute('role'), atomic: status?.getAttribute('aria-atomic'),
        statusClass: status?.classList.contains('sr-only'), resumeDescription: resume?.getAttribute('aria-describedby'),
      };
    });
    if (attrs.yearLive || attrs.cardLive) throw new Error('året eller hela Samtidigt-kortet är fortfarande en live region');
    if (attrs.statusRole !== 'status' || attrs.atomic !== 'true' || !attrs.statusClass) throw new Error('den permanenta osynliga statusraden saknas');
    if (attrs.resumeDescription !== 'pause-text') throw new Error('Fortsätt beskriver inte paustexten');
    const cardText = (await page.textContent('#ff-text')).replace(/\s+/g, ' ').trim();
    await page.waitForFunction(text => document.getElementById('screen-reader-status')?.textContent.includes(text), cardText, { timeout: T.step });
    return 'år och kort är inte live; Samtidigt-texten annonseras i den permanenta statusraden';
  });

  await check('en händelse öppnas från Samtidigt', async () => {
    const event = page.locator('#ff-events .ff-chip').first();
    const title = (await event.textContent()).replace(/\s+/g, ' ').trim();
    // Samtidigt-kortet kan ligga i en mobilpanel ovanpå globen. Klicka på själva knappen så att
    // testet provar kortets egen händelsehanterare, utan att fastna i panelens övergång.
    await event.evaluate(el => el.click());
    await visible('#detail');
    const detail = (await page.textContent('#detail')).replace(/\s+/g, ' ').trim();
    if (!detail.includes(title)) throw new Error(`faktarutan gäller inte den valda händelsen: ${title}`);
    await shot('3-handelse-oppnas');
    const calm = page.locator('input[data-calm]');
    if (await calm.isChecked()) await calm.click();
    // Valet flyger först till markören. När flygningen är klar ska den valda medaljen fortsätta
    // pulsera även om globen annars står helt stilla (#390).
    await page.waitForTimeout(1300);
    const pulseFrames = [await page.locator('#globe-canvas').screenshot()];
    for (let i = 0; i < 3; i++) { await page.waitForTimeout(80); pulseFrames.push(await page.locator('#globe-canvas').screenshot()); }
    if (pulseFrames.every(frame => frame.equals(pulseFrames[0]))) throw new Error('den valda markörens puls stannade när globen stod stilla');
    await page.locator('#detail [data-close]').click();
    await hidden('#detail');
    return `${title}; vald markör pulserar när globen står stilla`;
  });

  await check('sidzoom är tillåten utanför globen', async () => {
    const z = await page.evaluate(() => {
      const viewport = document.querySelector('meta[name="viewport"]')?.content ?? '';
      const bodyGesture = new Event('gesturestart', { bubbles: true, cancelable: true });
      document.body.dispatchEvent(bodyGesture);
      const globeGesture = new Event('gesturestart', { bubbles: true, cancelable: true });
      document.getElementById('globe-canvas').dispatchEvent(globeGesture);
      return { viewport, bodyPrevented: bodyGesture.defaultPrevented, globePrevented: globeGesture.defaultPrevented,
        pageTouchAction: getComputedStyle(document.documentElement).touchAction };
    });
    if (/maximum-scale|user-scalable\s*=\s*no/i.test(z.viewport)) throw new Error(`viewport blockerar zoom: ${z.viewport}`);
    if (z.bodyPrevented) throw new Error('en nypgest utanför globen stoppades');
    if (!z.globePrevented) throw new Error('globens egen nypgest skyddades inte');
    if (z.pageTouchAction === 'none') throw new Error('hela sidan har touch-action: none');
    return `sidan kan zoomas (${z.pageTouchAction}); bara globens egen nypgest fångas`;
  });

  await check('kontroller har tillräckliga träffytor', async () => {
    const targets = await page.evaluate(mobile => {
      const visible = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).display !== 'none'; };
      const size = el => {
        const r = el.getBoundingClientRect();
        if (!mobile) return { width: r.width, height: r.height };
        const p = getComputedStyle(el, '::after');
        const n = x => Number.parseFloat(x) || 0;
        return { width: r.width - n(p.left) - n(p.right), height: r.height - n(p.top) - n(p.bottom) };
      };
      const wanted = [...document.querySelectorAll('.glabel, .funfact .link-btn, .review-info, .info-btn')].filter(visible);
      return wanted.map(el => ({ name: el.id || el.className, ...size(el) }));
    }, vp.width <= 760);
    const min = vp.width <= 760 ? 44 : 24;
    const tooSmall = targets.filter(t => t.width < min || t.height < min);
    if (tooSmall.length) throw new Error(`${tooSmall.map(t => `${t.name} (${Math.round(t.width)} × ${Math.round(t.height)})`).join(', ')} är mindre än ${min} px`);
    return `${targets.length} små kontroller är minst ${min} × ${min} px`;
  });

  await check('tangentbordet lämnar globen', async () => {
    const globe = page.locator('#globe-canvas');
    const role = await globe.getAttribute('role');
    if (role !== 'region') throw new Error(`globens roll är "${role}" i stället för "region"`);
    // Globen är dokumentets första tabbstopp. Headless-motorer hanterar Skift+Tab där olika, så ett osynligt
    // föregående tabbstopp gör att testet kan kontrollera sidans flöde i stället för webbläsarens verktygsfält.
    await page.evaluate(() => {
      const before = document.createElement('input');
      before.type = 'text';
      before.id = 'test-before-globe';
      before.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
      document.getElementById('globe-canvas').before(before);
    });
    let afterTab, afterBack, afterEscape;
    try {
      await globe.focus();
      await page.keyboard.press('ArrowRight');
      if (!(await globe.evaluate(el => el === document.activeElement))) throw new Error('piltangenten flyttade fokus från globen');

      await page.keyboard.press('Tab');
      afterTab = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
      if (afterTab === 'globe-canvas') throw new Error('Tab fastnade i globen');

      await globe.focus();
      await page.keyboard.press('Shift+Tab');
      afterBack = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
      if (afterBack !== 'test-before-globe') throw new Error(`Shift+Tab gick till ${afterBack} i stället för föregående kontroll`);

      await globe.focus();
      await page.keyboard.press('Escape');
      afterEscape = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
      if (afterEscape !== 'year-jump') throw new Error(`Escape gick till ${afterEscape} i stället för årskontrollen`);
    } finally {
      await page.evaluate(() => document.getElementById('test-before-globe')?.remove());
    }
    return `Tab → ${afterTab}, Shift+Tab → ${afterBack}, Escape → ${afterEscape}`;
  });

  await check('ingen horisontell scroll', async () => {
    const w = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, body: document.body.scrollWidth, win: window.innerWidth }));
    if (Math.max(w.doc, w.body) > w.win) throw new Error(`sidan är ${Math.max(w.doc, w.body)} px bred i ett ${w.win} px fönster`);
    return `${Math.max(w.doc, w.body)} px av ${w.win}`;
  });

  await check('tidslinjen går att flytta', async () => {
    const before = await year();
    const box = await page.locator('#track').boundingBox();
    if (!box) throw new Error('#track syns inte');
    await page.mouse.click(box.x + box.width * 0.2, box.y + box.height / 2);
    await page.waitForFunction(v => document.getElementById('year-big').textContent.trim() !== v, before, { timeout: T.step });
    await shot('2-tidslinjen');
    return `${before} → ${await year()}`;
  });

  await check('årshopp vrider bara globen vid behov', async () => {
    const globe = page.locator('#globe-canvas');
    // Begränsa provet till krig så att en långvarig plats vid polcirkeln inte blir årets första rad.
    // Det använder samma kategorifilter som besökaren och ger Biafra-markören nära ekvatorn för 1968–1969.
    let filtersChanged = false;
    const restore = async () => {
      await page.emulateMedia({ reducedMotion: 'no-preference' }).catch(() => {});
      if (filtersChanged) {
        await page.evaluate(() => {
          for (const category of document.querySelectorAll('#filters [data-cat]')) {
            if (category.getAttribute('aria-pressed') === 'false') category.click();
          }
        }).catch(() => {});
      }
      // Ett misslyckat årshopp får inte lämna dess popover eller annan överlagring över nästa prov.
      await page.keyboard.press('Escape').catch(() => {});
    };
    try {
      await page.evaluate(() => {
        for (const category of document.querySelectorAll('#filters [data-cat]')) {
          if (category.dataset.cat !== 'krig' && category.getAttribute('aria-pressed') === 'true') category.click();
        }
      });
      filtersChanged = true;
      const spinAway = async () => {
        // Tangentbordets rotation är samma verkliga, tillgängliga användarflöde som canvasen erbjuder.
        // Flera steg före en enda väntan testar samma rörelse utan att betala spärrens tre sekunder per steggrupp.
        await globe.focus();
        for (let i = 0; i < 12; i++) await page.keyboard.press('Shift+ArrowRight');
        await page.waitForTimeout(3100); // den manuella styrningens spärr är tre sekunder
      };
      await page.evaluate(() => {
        window.__hgFlights = [];
        window.__hgOrientationRequests = [];
        const canvas = document.getElementById('globe-canvas');
        canvas.addEventListener('hg:globe-flight', event => window.__hgFlights.push(event.detail));
        canvas.addEventListener('hg:globe-orientation-request', event => window.__hgOrientationRequests.push(event.detail));
      });
      const reset = () => page.evaluate(() => {
        window.__hgFlights = [];
        window.__hgOrientationRequests = [];
      });
      const jumpRequest = async targetYear => {
        await reset();
        await jumpTo(targetYear);
        if (!(await page.locator('#event-list .event-btn').count())) throw new Error(`${targetYear} saknar panelhändelse för rotationsprovet`);
        await page.waitForFunction(() => window.__hgOrientationRequests?.length, null, { timeout: T.step });
        return page.evaluate(() => window.__hgOrientationRequests.at(-1));
      };
      const settleIfFlying = async request => {
        if (request.visible) return;
        await page.waitForFunction(() => window.__hgFlights?.some(f => f.phase === 'end'), null, { timeout: T.step });
      };

      // Välj först två skilda år som faktiskt använder samma första panelhändelse. Då bevisar provet
      // kamerans respons för en konkret markör, i stället för att anta panelordningen mellan två år.
      // Föregående tangentbordsprov vrider medvetet globen; vänta ut den produktregeln innan ett hopp får
      // begära orientering, annars prövar vi bara spärren för nylig manuell styrning.
      await page.waitForTimeout(3100);
      const baseYear = 1969;
      const base = await jumpRequest(baseYear);
      await settleIfFlying(base);
      let matchingYear = null;
      for (const candidate of [1968, 1970, 1967, 1971]) {
        const request = await jumpRequest(candidate);
        await settleIfFlying(request);
        if (request.id === base.id) { matchingYear = candidate; break; }
      }
      if (matchingYear == null) throw new Error(`ingen testbar granne till ${baseYear} har samma panelmarkör som ${base.id}`);

      // Ett nytt, uttryckligt hopp till samma markerings-id ska nu konstatera att den finns på framsidan.
      const front = await jumpRequest(baseYear);
      if (front.id !== base.id || !front.visible) throw new Error(`panelmarkören ${base.id} står inte verifierat på framsidan före manuell vridning`);
      // Zoomnivån skiljer sig mellan bredder. Vrid därför i högst tre tydliga halva varv och kontrollera
      // den verkliga markörens synlighet efter varje varv, i stället för att anta ett visst tangentsteg.
      const turnTargetToBack = async firstYear => {
        let targetYear = firstYear;
        const observed = [];
        for (let attempt = 0; attempt < 3; attempt++) {
          await spinAway();
          const request = await jumpRequest(targetYear);
          observed.push({ year: targetYear, visible: request.visible });
          if (request.id !== base.id) throw new Error(`år ${targetYear} bytte panelmarkör från ${base.id} till ${request.id}`);
          if (!request.visible) return { request, year: targetYear };
          targetYear = targetYear === baseYear ? matchingYear : baseYear;
        }
        throw new Error(`manuell vridning lade inte panelmarkören ${base.id} på baksidan: ${JSON.stringify(observed)}`);
      };
      const back = await turnTargetToBack(matchingYear);
      await page.waitForFunction(() => window.__hgFlights?.some(f => f.phase === 'end'), null, { timeout: T.step });
      const flight = await page.evaluate(() => window.__hgFlights);
      const start = flight.find(f => f.phase === 'start'), end = flight.find(f => f.phase === 'end');
      if (!start || !end || Math.abs(end.x - start.targetX) > 0.001 || Math.abs(end.y - start.targetY) > 0.001) {
        throw new Error('årshoppet nådde inte den förväntade globorienteringen');
      }

      const nextYear = back.year === baseYear ? matchingYear : baseYear;
      const afterFlight = await jumpRequest(nextYear);
      if (afterFlight.id !== base.id || !afterFlight.visible) throw new Error(`panelen bekräftade inte återställd framsida för ${base.id}`);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const reduced = await turnTargetToBack(back.year);
      await page.waitForTimeout(1250);
      const reducedFlights = await page.evaluate(() => window.__hgFlights);
      if (reduced.request.id !== base.id || reduced.request.visible || reducedFlights.length) throw new Error('reducerad rörelse startade ändå automatisk globrotation');
      return `markör ${base.id} verifierad fram/bak; år ${back.year} flyger tillbaka; reducerad rörelse lämnar globen stilla`;
    } finally {
      await restore();
    }
  });

  await check('Lager öppnas', async () => {
    await jumpTo(1900);
    await page.click('#btn-layers');
    await visible('#layer-menu');
    if (!(await page.locator('#layer-custom').isHidden())) throw new Error('de enskilda lagren är öppna på första nivån');
    const views = await page.locator('#layer-menu .view-chip[data-view]').count();
    if (views < 3) throw new Error(`bara ${views} färdiga vyer i menyn`);
    const n = await page.locator('#layer-menu input[data-layer]').count();
    if (n < 3) throw new Error(`bara ${n} lager i menyn`);
    const empireButton = page.locator('.empire-legend-button');
    await empireButton.waitFor({ state: 'visible', timeout: T.step });
    await empireButton.click();
    await visible('#empire-legend');
    const empireBody = page.locator('#empire-legend #el-body');
    if (await empireBody.isHidden()) await page.click('#empire-legend .el-toggle');
    const colonialRows = page.locator('#empire-legend .el-heading + ul > li[data-empire]');
    if (await colonialRows.count() < 1) throw new Error('rikesförklaringen saknar en rad under Kolonialvälden');
    const empireRow = colonialRows.first();
    await empireRow.click();
    await page.waitForFunction(() => document.querySelector('#empire-legend li[data-empire]')?.getAttribute('aria-pressed') === 'true', null, { timeout: T.step });
    await page.click('#empire-legend [data-empire-close]');
    await hidden('#empire-legend');
    await page.waitForFunction(() => {
      const menu = document.getElementById('layer-menu');
      const expected = menu?.hidden ? document.getElementById('btn-layers') : document.querySelector('.empire-legend-button');
      return document.activeElement === expected;
    }, null, { timeout: T.step });
    await shot('3-lager');
    if (await page.locator('#layer-menu').isHidden()) await page.click('#btn-layers');
    await visible('#layer-menu');
    await page.click('#layer-customize');
    await visible('#layer-custom');
    const menuWidth = await page.locator('#layer-menu').evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    if (menuWidth.scroll > menuWidth.client) throw new Error(`Lager-menyn är ${menuWidth.scroll}px bred i en yta på ${menuWidth.client}px`);
    await shot('3-lager-anpassa');
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    await page.click('#btn-layers');
    await visible('#layer-menu');
    await visible('#layer-custom');
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    return `${views} vyer, ${n} lager; Anpassa själv minns öppet läge`;
  });

  await check('Lager byter till en färdig vy', async () => {
    await page.click('#btn-layers');
    await visible('#layer-menu');
    const current = page.locator('#layer-menu .view-chip[data-view][aria-pressed="true"]');
    const before = await current.getAttribute('data-view');
    const choices = page.locator('#layer-menu .view-chip[data-view][aria-pressed="false"]');
    if (!await choices.count()) throw new Error('det finns ingen annan färdig Lager-vy att välja');
    const choice = choices.first();
    const after = await choice.getAttribute('data-view');
    await choice.click();
    await page.waitForFunction(({ before, after }) => {
      const active = document.querySelector('#layer-menu .view-chip[data-view][aria-pressed="true"]')?.dataset.view;
      return active === after && active !== before;
    }, { before, after }, { timeout: T.step });
    await shot('4-lager-vy');
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    return `${before} → ${after}`;
  });

  await check('Upptäcktsvyns förklaring går att fälla ihop', async () => {
    await setLayer('discovery', true);
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    const legend = page.locator('#religion-legend');
    const toggle = legend.locator('.rl-toggle');
    const body = legend.locator('#rl-body');
    await visible('#religion-legend');
    if ((await toggle.textContent()).trim() !== 'Upptäcktsvy') throw new Error('upptäcktsvyn saknar sin datahämtade rubrik');
    if (await body.isHidden()) await toggle.click();
    await visible('#religion-legend #rl-body');
    await toggle.click();
    await hidden('#religion-legend #rl-body');
    if (await page.evaluate(() => sessionStorage.getItem('hg-discovery-legend-open')) !== '0') {
      throw new Error('det hopfällda valet sparas inte för besöket');
    }
    await toggle.click();
    await visible('#religion-legend #rl-body');
    await shot('4b-upptacktsvy');
    await setLayer('discovery', false);
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    await hidden('#religion-legend');
    return 'fälls ihop och ut; valet sparas i sessionen';
  });

  await check('Fokus öppnas och följer ett rike', async () => {
    if (!(await page.locator('#religion-legend').isHidden())) throw new Error('rikesförklaringen syns på startskärmen');
    await page.click('#btn-focus');
    await visible('#focus-menu');
    await page.click('#focus-menu [data-tab="Alla"]');
    const focusGroups = page.locator('#focus-menu [data-group]');
    if (await focusGroups.count() < 5) throw new Error('Fokus visar inte alla hopfällbara grupper');
    if (await focusGroups.evaluateAll(buttons => buttons.some(button => button.getAttribute('aria-expanded') !== 'false'))) {
      throw new Error('Alla-fliken startar inte med hopfällda fokusgrupper');
    }
    const focusKinds = { Krig: 'war:', Riken: 'empire:', 'Försvunna länder': 'empire:', Religioner: 'religion:', Resor: 'route:' };
    const countInHeading = text => Number(/\((\d+)\)/.exec(text)?.[1]);
    const verifyFocusCount = async (tab, title) => {
      await page.click(`#focus-menu [data-tab="${tab}"]`);
      const group = page.locator(`#focus-menu .focus-group:has([data-group="${title}"])`);
      const heading = await group.locator('[data-group]').textContent();
      const expected = countInHeading(heading);
      const rows = group.locator('[data-key]');
      const actual = await rows.count();
      if (actual !== expected) throw new Error(`${tab} säger ${expected} resultat men visar ${actual}`);
      const wrong = await rows.evaluateAll((items, prefix) => items.some(item => !item.dataset.key.startsWith(prefix)), focusKinds[title]);
      if (wrong) throw new Error(`${tab} visar en post utanför sitt filter`);
    };
    for (const [tab, title] of [['Krig', 'Krig'], ['Riken', 'Riken'], ['Försvunna länder', 'Försvunna länder'], ['Religioner', 'Religioner'], ['Resor', 'Resor']]) {
      await verifyFocusCount(tab, title);
    }
    // Alla är en översikt: en grupp öppnas i taget, men dess räknare ska ändå
    // stämma när man väljer Visa alla.
    await page.click('#focus-menu [data-tab="Alla"]');
    for (const title of Object.keys(focusKinds)) {
      const group = page.locator(`#focus-menu .focus-group:has([data-group="${title}"])`);
      await group.locator('[data-group]').click();
      const more = group.locator('[data-group-all]');
      if (await more.count()) await more.click();
      const expected = countInHeading(await group.locator('[data-group]').textContent());
      if (await group.locator('[data-key]').count() !== expected) throw new Error(`Alla/${title} har fel räknare`);
      const near = group.locator('[data-group-near]');
      if (await near.count()) await near.click();
    }
    const wars = page.locator('#focus-menu [data-group="Krig"]');
    await wars.focus();
    await page.keyboard.press('ArrowDown');
    if (await page.evaluate(() => document.activeElement?.dataset.group) !== 'Riken') throw new Error('pil ner flyttar inte mellan fokusgrupper');
    await wars.focus();
    await page.keyboard.press('Enter');
    if (await wars.getAttribute('aria-expanded') !== 'true') throw new Error('Krig-gruppen fälls inte upp med tangentbordet');
    if (await page.locator('#focus-menu [data-group="Riken"]').getAttribute('aria-expanded') !== 'false') throw new Error('flera fokusgrupper är öppna samtidigt');
    const visibleWars = await page.locator('#focus-menu .focus-item[data-key^="war:"]').count();
    if (visibleWars > 8) throw new Error(`Alla/Krig visar ${visibleWars} poster före Visa alla, inte högst åtta`);
    const moreWars = page.locator('#focus-menu [data-group-all="Krig"]');
    if (await moreWars.count()) await moreWars.click();
    if (await page.locator('#focus-menu .focus-item[data-key^="war:"]').count() < visibleWars) throw new Error('Visa alla visar inte fler krig');
    await page.click('#focus-menu [data-group-age]');
    if (await page.locator('#focus-menu .focus-age').count() < 1) throw new Error('tidsåldersindelning saknas i Fokus');
    if (!await page.locator('#focus-menu .focus-age').filter({ hasText: 'Hög- och senmedeltid' }).count()) {
      throw new Error('Fokus visar inte den dataägda epoketiketten Hög- och senmedeltid');
    }
    await page.fill('#focus-menu .focus-search', 'rom');
    await page.click('#focus-menu [data-tab="Riken"]');
    await page.click('#focus-menu [data-sort="alfabetiskt"]');
    await visible('#focus-menu .focus-active');
    const active = (await page.textContent('#focus-menu .focus-active')).replace(/\s+/g, ' ').trim();
    if (!/Sök: “rom”/.test(active) || !/Filter: Riken/.test(active) || !/Sortering: Alfabetiskt/.test(active)) {
      throw new Error(`aktiva val saknas: ${active}`);
    }
    await page.fill('#focus-menu .focus-search', 'rom & "');
    const liveText = await page.textContent('#focus-menu .focus-live');
    if (!liveText.includes('Sök: “rom & "”') || liveText.includes('&amp;') || liveText.includes('&quot;')) {
      throw new Error(`live-regionen läser HTML-entiteter: ${liveText}`);
    }
    await page.fill('#focus-menu .focus-search', 'rom');
    await shot('5-fokus-sok');
    await page.keyboard.press('Escape');
    await hidden('#focus-menu');
    await page.click('#btn-focus');
    await visible('#focus-menu .focus-active');
    await page.click('#focus-menu [data-clear]');
    await hidden('#focus-menu .focus-active');
    if (await page.inputValue('#focus-menu .focus-search')) throw new Error('sökordet rensades inte');
    if (await page.getAttribute('#focus-menu [data-tab="Alla"]', 'aria-pressed') !== 'true') throw new Error('typfiltret återställdes inte');
    if (await page.getAttribute('#focus-menu [data-sort="relevans"]', 'aria-pressed') !== 'true') throw new Error('sorteringen återställdes inte');
    await page.click('#focus-menu [data-tab="Riken"]');
    const item = page.locator('#focus-menu .focus-item[data-key^="empire:"]').first();
    await item.waitFor({ state: 'visible', timeout: T.step });
    const label = (await item.locator('span').nth(1).textContent())?.trim();
    await shot('5-fokus-meny');
    await item.click();
    await visible('#focus-bar');
    await page.waitForFunction(() => document.getElementById('focus-title').textContent.trim() !== '', null, { timeout: T.step });
    const title = (await page.textContent('#focus-title')).trim();
    await visible('#religion-legend');
    const legendText = (await page.textContent('#religion-legend')).replace(/\s+/g, ' ').trim();
    if (!legendText.includes('Mjuk kant') || !legendText.includes('Glesa prickar')) {
      throw new Error(`rikesförklaringen saknar kartnycklar: ${legendText}`);
    }
    if (vp.width <= 760) {
      await visible('#detail .facts-section');
      const sections = page.locator('#detail .facts-section');
      const development = sections.filter({ hasText: 'Hur riket förändrades' });
      const sources = sections.filter({ hasText: 'Källor och karta' });
      if (await development.getAttribute('open') !== null || await sources.getAttribute('open') !== null) {
        throw new Error('rikets fördjupningsavsnitt ska vara stängda i mobilen');
      }
      await development.locator('summary').click();
      if (await development.getAttribute('open') === null) throw new Error('Hur riket förändrades gick inte att öppna');
      await sources.locator('summary').click();
      if (await sources.getAttribute('open') === null) throw new Error('Källor och karta gick inte att öppna');
    }
    await shot('6-fokus-rike');
    await page.click('#focus-exit');
    await hidden('#focus-bar');
    return `${label} → "${title}"`;
  });

  await check('Fokus har en huvudknapp för uppspelning', async () => {
    try {
      await page.click('#btn-focus');
      await visible('#focus-menu');
      // Ett rike saknar krigets berättelsekort och dess omedelbara stopp; här testas att den
      // gemensamma Fokus-knappen alltid speglar tidslinjens verkliga uppspelningsläge.
      await page.click('#focus-menu [data-tab="Riken"]');
      const empire = page.locator('#focus-menu .focus-item[data-key^="empire:"]').first();
      await empire.waitFor({ state: 'visible', timeout: T.step });
      await empire.click();
      await visible('#focus-bar');
      const action = page.locator('#focus-action');
      if (await page.locator('#btn-play').isVisible()) throw new Error('tidslinjens spelknapp syns också i fokusläget');
      const synced = async () => {
        await page.waitForFunction(() => {
          const actionText = document.getElementById('focus-action').textContent;
          const playLabel = document.getElementById('btn-play').getAttribute('aria-label');
          if (playLabel === 'Pausa') return actionText.includes('Pausa');
          if (playLabel === 'Fortsätt') return actionText.includes('Fortsätt');
          if (playLabel === 'Spela igen') return actionText.includes('Spela igen');
          return playLabel === 'Spela upp tiden' && (/▶ Spela$/.test(actionText) || actionText.includes('Spela klart'));
        }, null, { timeout: 3000 });
        return page.locator('#btn-play').getAttribute('aria-label');
      };
      const initial = await synced();
      if (initial !== 'Spela upp tiden') throw new Error(`huvudknappen börjar i fel läge: ${initial}`);
      await action.click();
      const afterStart = await synced();
      const noteVisible = await page.locator('#pause-note').isVisible();
      if (afterStart !== 'Pausa' && afterStart !== 'Fortsätt' && !noteVisible) {
        throw new Error(`första klicket startade inte eller pausade vid ett stopp: ${afterStart}`);
      }
      if (afterStart === 'Pausa') {
        await action.click();
        const afterPause = await synced();
        if (afterPause === 'Pausa') throw new Error('huvudknappen pausade inte tidslinjen');
      }
      return `tidslinje och Fokus-knapp är synkade (${initial} → ${afterStart}); tidslinjens spelknapp dold`;
    } finally {
      // Ett misslyckat kontrollsteg får inte lämna följande tester i fokusläge eller med tiden spelande.
      const action = page.locator('#focus-action');
      if (await action.isVisible().catch(() => false) && (await action.textContent()).includes('Pausa')) await action.click();
      if (await page.locator('#focus-bar').isVisible().catch(() => false)) await page.click('#focus-exit');
      await hidden('#focus-bar');
    }
  });

  await check('Fokus pausar vid en resas godkända stopp', async () => {
    try {
      await page.click('#btn-focus');
      await visible('#focus-menu');
      await page.click('#focus-menu [data-tab="Resor"]');
      await page.fill('#focus-menu .focus-search', 'Columbus första resa');
      const route = page.locator('#focus-menu .focus-item[data-key="route:columbus-resa-1"]');
      await route.waitFor({ state: 'visible', timeout: T.step });
      await route.click();
      await visible('#focus-bar');
      const stopMarks = await page.locator('.tdot.route-stop').count();
      if (stopMarks !== 6) throw new Error(`Columbus första resa har ${stopMarks} stopp, inte 6`);
      const speed = (await page.textContent('#btn-speed')).replace(/\s+/g, ' ').trim();
      if (!/dag|d\/s/.test(speed)) throw new Error(`resan med dagsdatum använder inte dagtakt: ${speed}`);
      await page.click('#focus-action');
      await visible('#pause-note');
      const pause = (await page.textContent('#pause-note')).replace(/\s+/g, ' ').trim();
      if (!pause.includes('Palos de la Frontera') || !pause.includes('3 augusti 1492') || !pause.includes('Columbus första resa')) {
        throw new Error(`pausraden saknar plats, datum eller resa: ${pause}`);
      }
      if (!pause.includes('Källorna skiljer sig')) throw new Error('resans osäkerhetsnot syns inte i pausrutan');
      const pauseText = (await page.textContent('#pause-text')).replace(/\s+/g, ' ').trim();
      await page.waitForFunction(text => document.getElementById('screen-reader-status')?.textContent.includes(text), pauseText, { timeout: T.step });
      await shot('6b-fokus-resa-stopp');
      await shot('538-fokus-columbus');
      await page.click('#focus-exit');
      await hidden('#focus-bar');

      await page.click('#btn-layers');
      await visible('#layer-menu');
      if (await page.locator('#layer-custom').isHidden()) await page.click('#layer-customize');
      const stops = page.locator('input[data-pause="route"]');
      await stops.waitFor({ state: 'visible', timeout: T.step });
      if (!(await stops.isChecked())) throw new Error('resestoppen är inte på som standard');
      await stops.click();
      await page.keyboard.press('Escape');
      await hidden('#layer-menu');

      await page.click('#btn-focus');
      await visible('#focus-menu');
      await page.click('#focus-menu [data-tab="Resor"]');
      await page.fill('#focus-menu .focus-search', 'Columbus första resa');
      await page.locator('#focus-menu .focus-item[data-key="route:columbus-resa-1"]').click();
      await page.click('#focus-action');
      await page.waitForTimeout(500);
      if (await page.locator('#pause-note').isVisible()) throw new Error('resan pausade trots att resestoppen är avstängda');
      await page.click('#focus-action');
      await page.click('#focus-exit');
      await hidden('#focus-bar');
      await jumpTo(1900); // följande krigstest söker nära tiden det står på
      return `${speed}; stoppet vid Palos pausar med plats, datum, resa och not; valet kan stängas av`;
    } finally {
      const action = page.locator('#focus-action');
      if (await action.isVisible().catch(() => false) && (await action.textContent()).includes('Pausa')) await action.click();
      if (await page.locator('#focus-bar').isVisible().catch(() => false)) await page.click('#focus-exit');
      // Återställ inställningen, så att senare flöden får sidans standard.
      if (!(await page.locator('#layer-menu').isVisible().catch(() => false))) await page.click('#btn-layers');
      const stops = page.locator('input[data-pause="route"]');
      if (await stops.isVisible().catch(() => false) && !(await stops.isChecked())) await stops.click();
      await page.keyboard.press('Escape');
    }
  });

  await check('Zheng Hes resa har tre köade stopp och årstakt', async () => {
    const previousYear = await yearNumber();
    const routePause = page.locator('input[data-pause="route"]');
    const routePauseWasOn = await routePause.isChecked();
    try {
      await setPause('route', true);
      await page.keyboard.press('Escape');
      await page.click('#btn-focus');
      await visible('#focus-menu');
      await page.click('#focus-menu [data-tab="Resor"]');
      await page.fill('#focus-menu .focus-search', 'Zheng Hes första resa');
      const route = page.locator('#focus-menu .focus-item[data-key="route:zheng-he-resa-1"]');
      await route.waitFor({ state: 'visible', timeout: T.step });
      await route.click();
      await visible('#focus-bar');

      const marks = await page.locator('.tdot.route-stop').evaluateAll(nodes => nodes.map(node =>
        node.getAttribute('aria-label') || node.title));
      if (marks.length !== 3) throw new Error(`Zheng Hes första resa har ${marks.length} stopp, inte 3`);
      for (const label of ['Nanjing · hösten 1405', 'Palembang', 'Nanjing · 2 oktober 1407']) {
        if (!marks.some(mark => mark.includes(label))) throw new Error(`resestoppet saknas: ${label}`);
      }

      const speed = (await page.textContent('#btn-speed')).replace(/\s+/g, ' ').trim();
      if (!/år\/s/.test(speed) || /dag|d\/s/.test(speed)) throw new Error(`Zheng Hes resa använder inte årstakt: ${speed}`);
      await shot('538-fokus-zheng-he');
      if (vp.width <= 760) return 'tre stopp och årstakt verifierade; den köade uppspelningen körs i datorbredd';

      const waitForNextPause = async previous => {
        await page.waitForFunction(text => {
          const note = document.getElementById('pause-note');
          return note && !note.hidden && note.textContent.replace(/\s+/g, ' ').trim() !== text;
        }, previous, { timeout: T.step });
        return (await page.textContent('#pause-note')).replace(/\s+/g, ' ').trim();
      };
      await page.click('#focus-action');
      await visible('#pause-note');
      const first = (await page.textContent('#pause-note')).replace(/\s+/g, ' ').trim();
      if (!first.includes('hösten 1405')) throw new Error(`första stoppet är inte hösten 1405: ${first}`);
      await page.click('#focus-action');
      const second = await waitForNextPause(first);
      if (!second.includes('Palembang') || !second.includes('1407, på hemresan')) {
        throw new Error(`hemresans stopp saknar Palembang och årstext: ${second}`);
      }
      await jumpTo(1406);
      await page.click('#focus-action');
      await page.waitForFunction(text => {
        const note = document.getElementById('pause-note');
        return note && !note.hidden && note.textContent.replace(/\s+/g, ' ').trim() === text;
      }, second, { timeout: T.step });
      const afterJump = (await page.textContent('#pause-note')).replace(/\s+/g, ' ').trim();
      if (!afterJump.includes('Palembang') || !afterJump.includes('1407, på hemresan')) {
        throw new Error(`manuellt tidshopp återställde inte resans stoppkö: ${afterJump}`);
      }
      await page.click('#focus-action');
      const third = await waitForNextPause(afterJump);
      if (!third.includes('Nanjing') || !third.includes('2 oktober 1407')) {
        throw new Error(`sista stoppet saknar Nanjing och datumet: ${third}`);
      }
      return `tre stopp i årstakt; manuellt tidshopp återställer kön: ${first}; ${second}; ${afterJump}; ${third}`;
    } finally {
      const action = page.locator('#focus-action');
      if (await action.isVisible().catch(() => false) && (await action.textContent()).includes('Pausa')) await action.click();
      if (await page.locator('#focus-bar').isVisible().catch(() => false)) await page.click('#focus-exit');
      await hidden('#focus-bar');
      if (await page.locator('#focus-menu').isVisible().catch(() => false)) await page.keyboard.press('Escape');
      await setPause('route', routePauseWasOn);
      await page.keyboard.press('Escape');
      await jumpTo(previousYear);
    }
  });

  await check('Tillbaka återställer tid och lager för alla Fokus-typer', async () => {
    const previousYear = await yearNumber();
    const layerNames = ['events', 'routes'];
    const originalLayers = Object.fromEntries(await Promise.all(layerNames.map(async name =>
      [name, await page.locator(layerRow(name)).isChecked()])));
    const cases = [
      { tab: 'Krig', query: 'andra världskriget', key: 'war:andra-varldskriget', shot: '538-fokus-krig' },
      { tab: 'Riken', query: 'rom', key: 'empire:romarriket' },
      { tab: 'Religioner', query: 'Kristendom', key: 'religion:kristendom' },
      { tab: 'Resor', query: 'Zheng Hes första resa', key: 'route:zheng-he-resa-1', shot: '538-fokus-resa' },
    ];
    const layersDuringFocus = { events: false, routes: true };
    if (vp.width <= 760) return 'hela Tillbaka-rundan körs i datorbredd; mobilens krigs- och resefokus finns i skärmbilderna';
    try {
      await setLayer('events', false);
      await setLayer('routes', true);
      await page.keyboard.press('Escape');
      await jumpTo(-2999);
      const beforeFocus = await yearNumber();
      const cameraBeforeFocus = await page.locator('#globe-canvas').screenshot();
      await shot('538-fore-fokus');

      for (const item of cases) {
        await page.click('#btn-focus');
        await visible('#focus-menu');
        await page.click(`#focus-menu [data-tab="${item.tab}"]`);
        await page.fill('#focus-menu .focus-search', item.query);
        const row = page.locator(`#focus-menu .focus-item[data-key="${item.key}"]`);
        await row.waitFor({ state: 'visible', timeout: T.step });
        await row.click();
        await visible('#focus-bar');
        const back = page.locator('#focus-moved-back');
        await back.waitFor({ state: 'visible', timeout: T.step });
        if (!(await back.textContent()).includes('Tillbaka till')) throw new Error(`${item.key}: Tillbaka saknar årtal`);
        if (item.shot) await shot(item.shot);

        await back.click();
        await hidden('#focus-bar');
        if (await yearNumber() !== beforeFocus) throw new Error(`${item.key}: Tillbaka återställde inte året`);
        for (const name of layerNames) {
          if (await page.locator(layerRow(name)).isChecked() !== layersDuringFocus[name]) {
            throw new Error(`${item.key}: Tillbaka återställde inte lagret ${name}`);
          }
        }
        if (item.shot === '538-fokus-krig') {
          if (await page.locator('#detail').isVisible()) await page.click('#detail [data-close]');
          const cameraAfterBack = await page.locator('#globe-canvas').screenshot();
          const beforePixel = screenshotPixel(cameraBeforeFocus, 1300, 450);
          const afterPixel = screenshotPixel(cameraAfterBack, 1300, 450);
          const difference = beforePixel.reduce((sum, channel, index) => sum + Math.abs(channel - afterPixel[index]), 0);
          if (difference > 18) throw new Error(`Tillbaka återställde inte globens zoom: kantpixel ${beforePixel} → ${afterPixel}`);
          await shot('538-efter-tillbaka');
        }
      }
      return 'krig, rike, religion och resa: Tillbaka återställer år och lager; krigets zoom återställs';
    } finally {
      if (await page.locator('#focus-bar').isVisible().catch(() => false)) {
        const action = page.locator('#focus-action');
        if ((await action.textContent()).includes('Pausa')) await action.click();
        await page.click('#focus-exit');
      }
      if (await page.locator('#focus-menu').isVisible().catch(() => false)) await page.keyboard.press('Escape');
      for (const name of layerNames) await setLayer(name, originalLayers[name]);
      await page.keyboard.press('Escape');
      await jumpTo(previousYear);
    }
  });

  await check('Samtidigt-pauser kan slås av i Lager', async () => {
    const previousYear = await yearNumber();
    const funfactsOn = await page.locator(layerRow('funfacts')).isChecked();
    const pauseOn = await page.locator('input[data-pause="funfacts"]').isChecked();
    if (vp.width <= 760) return 'uppspelning med och utan Samtidigt-paus verifieras i datorbredd';
    try {
      const target = await page.evaluate(async current => {
        const [factDoc, eventDoc] = await Promise.all([
          fetch('./data/funfacts.json').then(response => response.json()),
          fetch('./data/events.json').then(response => response.json()),
        ]);
        const byId = new Map(eventDoc.events.map(event => [event.id, event]));
        const max = Number(document.getElementById('track').getAttribute('aria-valuemax'));
        const fact = factDoc.funfacts
          .filter(candidate => candidate.review !== 'draft' && candidate.kind !== 'empire'
            && Number.isInteger(candidate.show?.[0]) && candidate.show[0] > current && candidate.show[0] <= max
            && candidate.events?.length && candidate.events.every(id => byId.has(id)))
          .sort((a, b) => a.show[0] - b.show[0])[0];
        return fact ? { id: fact.id, year: fact.show[0] } : null;
      }, previousYear);
      if (!target) throw new Error('hittade inget framtida Samtidigt-kort att testa');

      await setLayer('funfacts', true);
      await setPause('funfacts', true);
      await page.keyboard.press('Escape');
      for (let i = 0; i < 5 && !(await page.textContent('#btn-speed')).includes('1 år/s'); i++) await page.click('#btn-speed');
      if (!(await page.textContent('#btn-speed')).includes('1 år/s')) throw new Error('kunde inte välja 1 år/s för Samtidigt-testet');

      await jumpTo(target.year - 1);
      await page.click('#btn-play');
      await page.waitForFunction(() => {
        const note = document.getElementById('pause-note');
        return note && !note.hidden && note.textContent.includes('Pausad vid ett nytt Samtidigt-kort');
      }, null, { timeout: T.step });

      await setPause('funfacts', false);
      await page.keyboard.press('Escape');
      await jumpTo(target.year - 1);
      await page.click('#btn-play');
      await page.waitForFunction(year => {
        const n = Number(document.getElementById('year-big').textContent.trim());
        const era = document.getElementById('year-era').textContent.trim();
        const current = era === 'f.Kr.' ? 1 - n : n;
        return current > year && document.getElementById('btn-play').getAttribute('aria-label') === 'Pausa';
      }, target.year, { timeout: T.step });
      return `paus vid kortet år ${target.year}; avstängd paus låter uppspelningen fortsätta`;
    } finally {
      if (await page.locator('#btn-play').getAttribute('aria-label') === 'Pausa') await page.click('#btn-play');
      await setPause('funfacts', pauseOn);
      await setLayer('funfacts', funfactsOn);
      await page.keyboard.press('Escape');
      await jumpTo(previousYear);
    }
  });

  await check('Krigets stoppkö fortsätter, återställs vid tidshopp och följer Lager', async () => {
    if (vp.width <= 760) return 'krigsstoppkön testas i datorbredd; mobilens krigsfokus och Spela klart testas separat';
    const previousYear = await yearNumber();
    const majorWasOn = await page.locator('input[data-pause="major"]').isChecked();
    const focusFunfactsWasOn = await page.locator('input[data-pause="focusFunfacts"]').isChecked();
    try {
      const war = await page.evaluate(async () => {
        const doc = await fetch('./data/events.json').then(response => response.json());
        const choices = doc.events.filter(candidate => candidate.kind === 'war' && candidate.story
          && !candidate.ongoing && candidate.end - candidate.start > 2).map(event => {
          const parts = doc.events.filter(candidate => candidate.partOf === event.id);
          const major = parts.filter(candidate => candidate.major)
            .sort((a, b) => a.start - b.start)
            .map(candidate => ({ id: candidate.id, start: candidate.start, title: candidate.title?.sv || candidate.id }));
          return { event, parts: parts.length, major };
        }).filter(choice => choice.major.length >= 2)
          .sort((a, b) => a.parts - b.parts || a.event.end - a.event.start - (b.event.end - b.event.start));
        const choice = choices[0];
        if (!choice) return null;
        return {
          id: choice.event.id, title: choice.event.title?.sv || choice.event.id,
          start: choice.event.start, end: choice.event.end, major: choice.major,
        };
      });
      if (!war || war.major.length < 2) throw new Error('kriget saknar minst två stora händelser att köa');

      await setPause('major', true);
      await setPause('focusFunfacts', false);
      await page.keyboard.press('Escape');
      await jumpTo(war.start - 1);
      await page.click('#btn-focus');
      await visible('#focus-menu');
      await page.click('#focus-menu [data-tab="Krig"]');
      await page.fill('#focus-menu .focus-search', war.title);
      const warItem = page.locator(`#focus-menu .focus-item[data-key="war:${war.id}"]`);
      await warItem.waitFor({ state: 'visible', timeout: T.step });
      await warItem.click();
      await visible('#focus-bar');
      for (let i = 0; i < 6 && !(await page.textContent('#btn-speed')).includes('10 år/s'); i++) await page.click('#btn-speed');
      const speed = (await page.textContent('#btn-speed')).replace(/\s+/g, ' ').trim();
      if (!speed.includes('10 år/s')) throw new Error(`kunde inte välja högsta hastighet för krigsstoppkön: ${speed}`);
      await shot('538-fokus-krig');

      const nextPauseText = () => page.evaluate(() => {
        const values = ['next-pause', 'pause-next'].map(id =>
          (document.getElementById(id)?.textContent.replace(/\s+/g, ' ').trim() ?? '')
            .replace(/^Nästa(?: paus)?:\s*/, ''));
        return values.find(Boolean) ?? '';
      });
      const waitForNextPause = async previous => {
        await page.waitForFunction(text => {
          const values = ['next-pause', 'pause-next'].map(id =>
            (document.getElementById(id)?.textContent.replace(/\s+/g, ' ').trim() ?? '')
              .replace(/^Nästa(?: paus)?:\s*/, ''));
          return values.some(value => value && value !== text);
        }, previous, { timeout: T.step });
        return nextPauseText();
      };
      const beforePlay = await nextPauseText();
      if (!beforePlay.includes(war.major[0].title)) throw new Error(`första krigsstoppet saknas i raden Nästa paus: ${beforePlay}`);
      await page.click('#focus-action');
      await page.waitForFunction(previous => {
        const note = document.getElementById('pause-note');
        const values = ['next-pause', 'pause-next'].map(id =>
          (document.getElementById(id)?.textContent.replace(/\s+/g, ' ').trim() ?? '')
            .replace(/^Nästa(?: paus)?:\s*/, ''));
        return note && !note.hidden && values.some(value => value && value !== previous);
      }, beforePlay, { timeout: T.step });
      const first = await nextPauseText();
      if (!first.includes(war.major[1].title)) throw new Error(`Fortsätt-raden visar inte nästa krigsstopp: ${first}`);
      await page.click('#focus-action');
      const second = await waitForNextPause(first);
      if (second === first) throw new Error(`Fortsätt flyttade inte krigets stoppkö: ${second}`);

      let manualYear = (await yearNumber()) === war.start ? war.start + 1 : war.start;
      let nextMajor = war.major.find(stop => stop.start > manualYear
        || (manualYear === war.start && stop.start === manualYear));
      if (!nextMajor) {
        manualYear = war.start;
        nextMajor = war.major[0];
      }
      await jumpTo(manualYear);
      const beforeJump = await nextPauseText();
      if (!beforeJump.includes(nextMajor.title)) throw new Error(`tidhoppet återställde inte första väntande stoppet: ${beforeJump}`);
      await page.click('#focus-action');
      const afterJump = await waitForNextPause(beforeJump);
      const nextAfterJump = war.major[war.major.indexOf(nextMajor) + 1];
      if (nextAfterJump && !afterJump.includes(nextAfterJump.title)) {
        throw new Error(`Fortsätt efter tidshopp visade fel stopp: ${afterJump}`);
      }

      await setPause('major', false);
      await page.keyboard.press('Escape');
      const nearEnd = war.end - 1;
      await jumpTo((await yearNumber()) === nearEnd ? war.start : nearEnd);
      await page.click('#focus-action');
      await page.waitForFunction(() => {
        const note = document.getElementById('pause-note');
        return note && !note.hidden && document.getElementById('detail')?.textContent.includes('När kriget är slut');
      }, null, { timeout: T.step });
      const endPause = (await page.textContent('#pause-note')).replace(/\s+/g, ' ').trim();
      if (!/slut|idag/i.test(endPause) || /stor händelse/i.test(endPause)) {
        throw new Error(`avstängda krigspauser visade inte bara slutkortet: ${endPause}`);
      }
      return 'Fortsätt visar nästa stopp; manuellt tidshopp börjar om kön; Lager kan stänga av mellanstoppen';
    } finally {
      if (await page.locator('#focus-bar').isVisible().catch(() => false)) {
        const action = page.locator('#focus-action');
        if ((await action.textContent()).includes('Pausa')) await action.click();
        await page.click('#focus-exit');
      }
      if (await page.locator('#focus-menu').isVisible().catch(() => false)) await page.keyboard.press('Escape');
      await setPause('major', majorWasOn);
      await setPause('focusFunfacts', focusFunfactsWasOn);
      await page.keyboard.press('Escape');
      await jumpTo(previousYear);
    }
  });

  await check('tidslinjemärken följer Lager och resefokus', async () => {
    try {
      await setLayer('events', true);
      if (await page.locator('.tdot').count() < 1) throw new Error('Händelser saknar cirklar på tidslinjen');
      await setLayer('events', false);
      if (await page.locator('.tdot').count() !== 0) throw new Error('Händelsecirklar ligger kvar när Händelser är av');
      await setLayer('events', true);
      const eventMark = page.locator('.tdot').first();
      await eventMark.focus();
      const note = page.locator('#timeline-mark-note');
      if (await note.isHidden() || !(await note.textContent()).trim()) throw new Error('Tangentbordsfokus visar inte märkets text');
      await setLayer('funfacts', true);
      if (await page.locator('.tff').count() < 1) throw new Error('Samtidigt saknar romber på tidslinjen');
      await setLayer('routes', true);
      if (await page.locator('.troute').count() < 1) throw new Error('Resor saknar start- och slutstreck på tidslinjen');
      await page.keyboard.press('Escape');
      await page.click('#btn-focus');
      await visible('#focus-menu');
      await page.click('#focus-menu [data-tab="Resor"]');
      await page.fill('#focus-menu .focus-search', 'Columbus första resa');
      await page.locator('#focus-menu .focus-item[data-key="route:columbus-resa-1"]').click();
      if (await page.locator('.tdot.route-stop').count() < 1) throw new Error('Resefokus saknar märken för källbelagda stopp');
      return 'lagerfilter döljer händelsecirklar; romber, resestreck och resefokusets stopp syns';
    } finally {
      if (await page.locator('#focus-bar').isVisible().catch(() => false)) await page.click('#focus-exit');
      await hidden('#focus-bar');
      if (await page.locator('#layer-menu').isVisible().catch(() => false)) await page.keyboard.press('Escape');
    }
  });

  await check('Krigets tidslinje har läsbara mobiletiketter', async () => {
    // Föregående resefokus kan avslutas samtidigt som dess sista omritning sker.
    // Säkerställ grundläget innan detta fristående krigsflöde öppnar Fokus igen.
    if (await page.locator('#focus-bar').isVisible().catch(() => false)) {
      await page.click('#focus-exit');
      await hidden('#focus-bar');
    }
    try {
      await page.click('#btn-focus');
    await visible('#focus-menu');
    await page.click('#focus-menu [data-tab="Krig"]');
    await page.fill('#focus-menu .focus-search', 'andra världskriget'); // sökning visar även krig utanför årets relevansfönster
    const war = page.locator('#focus-menu .focus-item[data-key="war:andra-varldskriget"]');
    await war.waitFor({ state: 'visible', timeout: T.step });
    await war.click();
    await visible('#focus-bar');
    const story = await page.locator('#track-chapters .chap').evaluateAll(bands => bands.map(band => ({
      title: band.getAttribute('title'), aria: band.getAttribute('aria-label'),
      label: band.querySelector('.chap-label')?.textContent?.trim(),
      visible: !!(band.querySelector('.chap-label')?.offsetParent),
      box: (() => { const el = band.querySelector('.chap-label'), r = el?.getBoundingClientRect(); return r && { left: r.left, right: r.right, top: r.top, bottom: r.bottom, clipped: el.scrollWidth > el.clientWidth }; })(),
    })));
    if (!story.length || story.some(b => !b.title || !b.aria || !b.label || !b.aria.includes(b.label))) {
      throw new Error('krigets tidslinjeband saknar full titel eller tillgänglighetsnamn');
    }
    const visibleLabels = story.filter(b => b.visible);
    if (vp.width <= 760) {
      if (visibleLabels.length !== 1) throw new Error(`mobilen visar ${visibleLabels.length} tidslinjeetiketter i stället för en`);
      if (visibleLabels.some(b => b.box.right > vp.width || b.box.left < 0 || b.box.clipped)) throw new Error('mobilens synliga tidslinjeetikett klipps av');
    }
    await shot('6b-fokus-krig-tidslinje');
    return `${visibleLabels.length} synlig etikett; full text finns på alla ${story.length} band`;
    } finally {
      if (await page.locator('#focus-bar').isVisible().catch(() => false)) await page.click('#focus-exit');
      await hidden('#focus-bar');
    }
  });

  await check('Platt vy öppnas', async () => {
    if (vp.width <= 760) webglWarnings.length = 0;
    await clickView('#btn-flat');
    await visible('#flat-view');
    await page.waitForFunction(() => document.getElementById('btn-flat').getAttribute('aria-pressed') === 'true', null, { timeout: T.step });
    const map = page.locator('#flat-canvas');
    await map.focus();
    await page.keyboard.press('Tab');
    if (await map.evaluate(el => el === document.activeElement)) throw new Error('Tab fastnade i Platt vy');
    await jumpTo(ROUTE_YEAR);
    await hidden('#jump-pop');
  });

  await check('Affisch sparas från Platt vy', async () => {
    const button = page.locator('#flat-poster');
    await button.waitFor({ state: 'visible', timeout: T.step });
    if ((await button.textContent()).trim() !== 'Affisch') throw new Error('Affischknappen saknar text från vydata');
    await jumpTo(1969); // året har flera aktiva händelser; listan under kartan ska därför också exporteras
    await shot('6-affisch-fore-export');
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: T.step }),
      button.click(),
    ]);
    if (download.suggestedFilename() !== `historia-globen-${await year()}.png`) throw new Error(`fel affischnamn: ${download.suggestedFilename()}`);
    await download.saveAs(path.join(OUT, `${vp.name}-6-affisch.png`));
    const file = await download.path();
    const header = fs.readFileSync(file);
    if (header.toString('ascii', 1, 4) !== 'PNG' || header.readUInt32BE(16) !== 3508 || header.readUInt32BE(20) !== 2480) {
      throw new Error('affischen är inte A4 liggande PNG (3508 × 2480)');
    }
    const poster = await page.evaluate(async () => {
      const [{ selectPosterEvents }, doc, views] = await Promise.all([
        import('./js/ui/poster.js'),
        fetch('data/genererat/handelser.json').then(response => response.json()),
        fetch('data/vyer.json').then(response => response.json()),
      ]);
      return {
        ids: selectPosterEvents(1969, doc.events).map(event => event.id),
        website: views.poster.website.sv,
      };
    });
    if (poster.ids.length > 8 || poster.ids.includes('oxford')) throw new Error('affischen tar med för många eller långvariga bakgrundshändelser');
    if (poster.website !== 'historiagloben.se') throw new Error('affischen saknar webbplatsrad från vydata');
    await jumpTo(ROUTE_YEAR);
    return `${header.readUInt32BE(16)} × ${header.readUInt32BE(20)}; ${poster.ids.length} händelser; ${download.suggestedFilename()}`;
  });

  await check('ett rike syns', async () => {
    const n = await layerDraws('areas', 5000);
    return `${n} pixlar ändras när Riken slås på`;
  });

  await check('en väg syns', async () => {
    const n = await layerDraws('routes', 150);
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    await page.mouse.move(1, 1);
    await shot(`6-platt-vy-${ROUTE_YEAR}`);
    return `${n} pixlar ändras när Resor och handelsvägar slås på`;
  });

  await check('nattljus syns från 2016', async () => {
    await jumpTo(2016);
    const n = await layerDraws('images', 5000);
    await shot('8-bildlager-2016');
    return `${n} pixlar ändras när Nattljus slås på`;
  });

  await check('tidsfönstret skiljer avslutade och pågående krig', async () => {
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    await jumpTo(2026);
    await page.click('#btn-panel');
    await visible('#panel');
    const afghanistan = page.locator('#event-list .event-btn', { hasText: 'Kriget i Afghanistan' });
    await afghanistan.waitFor({ state: 'visible', timeout: T.step });
    await afghanistan.click();
    await page.waitForFunction(() => [...document.querySelectorAll('#flat-labels .glabel')]
      .some(el => /Kriget i Afghanistan.*slut 2021/.test(el.textContent)), null, { timeout: T.step });
    const label = await page.locator('#flat-labels .glabel').filter({ hasText: 'Kriget i Afghanistan' }).textContent();
    if (!label.includes('slut 2021')) throw new Error(`Afghanistan saknar slutetikett: ${label}`);
    await shot('6-tidsfonster-2026');
    const n = await layerDraws('wars', 200);
    return `${label.trim()}; ${n} pixlar från det pågående krigets område`;
  });

  await check('Platt vy stängs', async () => {
    await clickView('#btn-flat');
    await hidden('#flat-view');
    if (vp.width > 760) return 'stängs';
    await page.waitForTimeout(200);
    if (webglWarnings.length) throw new Error(`WebGL-varning efter Platt vy: ${webglWarnings[0]}`);

    // Lugn rörelse gör två bilder jämförbara. Händelser av/på ska ändra klotets bild även efter
    // att canvasarnas storlek växlats i Platt vy (#470).
    await page.click('#btn-layers');
    await visible('#layer-menu');
    const calm = page.locator('input[data-calm]');
    if (!(await calm.isChecked())) await calm.click();
    const events = page.locator(layerRow('events'));
    if (!(await events.isChecked())) await events.click();
    await events.click();
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const withoutEvents = await page.locator('#globe-canvas').screenshot();
    await page.click('#btn-layers');
    await visible('#layer-menu');
    await events.click();
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const withEvents = await page.locator('#globe-canvas').screenshot();
    if (withoutEvents.equals(withEvents)) throw new Error('globens bild ändras inte när Händelser slås på efter Platt vy');
    return 'stängs utan WebGL-varning och Händelser ritas om';
  });

  await check('Fokus följer ett krig till slutet', async () => {
    await page.click('#btn-focus');
    await visible('#focus-menu');
    // Föregående Fokus-flöde slutar i Riken; kriget måste sökas i rätt typflik som en besökare gör.
    await page.click('#focus-menu [data-tab="Krig"]');
    await page.fill('#focus-menu .focus-search', 'andra världskriget');
    const war = page.locator('#focus-menu .focus-item[data-key^="war:"]').first();
    await war.waitFor({ state: 'visible', timeout: T.step });
    await war.click();
    await visible('#focus-bar');
    await shot('538-fokus-krig');

    // Tio år per sekund håller flödet kort, men låter fortfarande uppspelningen stanna vid varje viktiga händelse.
    for (let i = 0; i < 6 && !(await page.textContent('#btn-speed')).includes('10 år/s'); i++) await page.click('#btn-speed');
    if (!(await page.textContent('#btn-speed')).includes('10 år/s')) throw new Error('kunde inte välja 10 år/s för krigsflödet');

    // "Spela klart" är krigets avsedda elevflöde: det går till slutet utan att fastna vid
    // mellanpauser och visar ändå berättelsens slutkort.
    // Datorn visar "Spela klart" i krigsraden, mobilen i pausraden. Välj den kontroll
    // som faktiskt är synlig, så att samma besöksflöde provas i båda layouterna.
    await page.locator('#wp-finish').evaluate(el => {
      const desktop = getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
      (desktop ? el : document.getElementById('pause-finish'))?.click();
    });
    await page.waitForFunction(() => document.getElementById('detail')?.textContent.includes('När kriget är slut'), null, { timeout: T.step });
    const summary = (await page.textContent('#detail')).replace(/\s+/g, ' ').trim();
    if (!summary.includes('Andra världskriget')) throw new Error('slutkortet saknar krigets namn');
    // Slutkortet animeras in samtidigt som WebGL-ytan ritar om. Stäng av just skärmbildens
    // rörelser i stället för att vänta på en stilla canvas som inte hör till kortet.
    await page.locator('#detail').screenshot({ path: path.join(OUT, `${vp.name}-9-krigets-slut.png`), animations: 'disabled' });
    return 'Spela klart når slutkortet';
  });

  await check('Källor öppnas', async () => {
    await clickView('#btn-sources');
    await visible('#sources-dialog');
    await page.waitForFunction(() => document.getElementById('sources-body').textContent.trim().length > 100, null, { timeout: T.step });
    await shot('7-kallor');
    await page.click('#sources-close');
    await hidden('#sources-dialog');
  });

  await check('faktarutan skiljer källkontroll från osäkerhet', async () => {
    if (await page.locator('#focus-bar').isVisible()) {
      await page.click('#focus-exit');
      await hidden('#focus-bar');
    }
    await setLayer('events', true);
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    await page.click('#year-jump');
    await visible('#jump-input');
    await page.fill('#jump-input', '2600 f.Kr.');
    await page.press('#jump-input', 'Enter');
    await hidden('#jump-pop');
    if (await page.isHidden('#panel')) await page.click('#btn-panel');
    await visible('#panel');
    const event = page.locator('#event-list .event-btn', { hasText: 'Cheopspyramiden' });
    await event.waitFor({ state: 'visible', timeout: T.step });
    await event.click();
    await visible('#detail .uncertainty-row');
    const text = (await page.textContent('#detail .uncertainty-row')).replace(/\s+/g, ' ').trim();
    if (!/Historisk osäkerhet:.*dateringen är ungefärlig/.test(text)) throw new Error(`osäkerhetsraden saknar ungefärlig datering: ${text}`);
    if (!(await page.locator('#detail .review-badge').count())) throw new Error('faktarutan saknar en separat rad för källkontroll');
    return text;
  });

  await check('ingen horisontell scroll efteråt', async () => {
    const w = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, body: document.body.scrollWidth, win: window.innerWidth }));
    if (Math.max(w.doc, w.body) > w.win) throw new Error(`sidan är ${Math.max(w.doc, w.body)} px bred i ett ${w.win} px fönster`);
    await shot('8-slut');
  });

  results.push({ name: 'inga fel i konsolen', ok: errors.length === 0, ms: 0, note: errors.slice(0, 10).join(' | ') || undefined });
  await context.close();
  return results;
}

// WCAG 1.4.4/1.4.10 (#404): 200 och 400 procents sidzoom motsvarar att en 1400 × 900-yta
// omflödar till 700 × 450 respektive 350 × 225 CSS-pixlar. Kontrollera de viktigaste vägarna i båda.
async function runReflow(browser) {
  const results = [];
  const context = await browser.newContext({ viewport: { width: 700, height: 450 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url || '')) errors.push(`konsol: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`sidfel: ${e.message}`));
  if (THREE_LOCAL) {
    const body = fs.readFileSync(THREE_LOCAL, 'utf8');
    await page.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
    await page.route(u => isFont(u.href), r => r.abort());
  }
  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: T.load });
    await page.waitForFunction(() => document.getElementById('loading')?.hidden, null, { timeout: T.load });
    if (await page.isVisible('#intro')) await page.click('#intro-close');
    if (await page.isVisible('#help')) await page.click('#help-close');

    for (const z of [{ percent: 200, width: 700, height: 450 }, { percent: 400, width: 350, height: 225 }]) {
      const t0 = Date.now();
      try {
        await page.setViewportSize({ width: z.width, height: z.height });
        await page.waitForFunction(([w, h]) => innerWidth === w && innerHeight === h, [z.width, z.height]);
        const frame = await page.evaluate(() => {
          const ids = ['year-jump', 'btn-panel', 'btn-layers', 'btn-focus', 'btn-intro', 'more-toggle', 'btn-play', 'btn-speed', 'track'];
          const outside = ids.filter(id => {
            const r = document.getElementById(id)?.getBoundingClientRect();
            return !r || r.width < 1 || r.height < 1 || r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight;
          });
          return { outside, scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth), width: innerWidth };
        });
        if (frame.outside.length) throw new Error(`kontroller utanför skärmen: ${frame.outside.join(', ')}`);
        if (frame.scroll > frame.width) throw new Error(`sidan är ${frame.scroll}px bred i en yta på ${frame.width}px`);

        await page.click('#btn-panel');
        const panelRoom = await page.locator('#event-list').evaluate(el => el.clientHeight);
        if (panelRoom < 1) throw new Error('Samtidigt-listan saknar rullbar yta');
        await page.keyboard.press('Escape');

        await page.click('#btn-layers');
        const layerRoom = await page.locator('#layer-menu').evaluate(el => ({ client: el.clientHeight, scroll: el.scrollHeight }));
        if (layerRoom.client < 1) throw new Error('Lager-menyn saknar rullbar yta');
        await page.keyboard.press('Escape');

        await page.click('#btn-focus');
        const focusRoom = await page.locator('#focus-menu .focus-body').evaluate(el => el.clientHeight);
        if (focusRoom < 1) throw new Error('Fokus-listan saknar rullbar yta');
        await page.keyboard.press('Escape');

        await page.click('#more-toggle');
        await page.click('#btn-help');
        const help = page.locator('#help');
        const helpRoom = await help.evaluate(el => ({ client: el.clientHeight, scroll: el.scrollHeight, overflow: getComputedStyle(el).overflowY }));
        if (helpRoom.client < 1 || (helpRoom.scroll > helpRoom.client && helpRoom.overflow !== 'auto')) throw new Error('Hjälpen kan inte rullas');
        await page.locator('#help-feedback').scrollIntoViewIfNeeded();
        await page.click('#help-close');

        await page.click('#more-toggle');
        await page.click('#btn-sources');
        const sourceRoom = await page.locator('#sources-body').evaluate(el => el.clientHeight);
        if (sourceRoom < 1) throw new Error('Källsidan saknar rullbar yta');
        await page.screenshot({ path: path.join(OUT, `zoom-${z.percent}.png`) });
        await page.click('#sources-close');

        results.push({ name: `omflöde vid ${z.percent} %`, ok: true, ms: Date.now() - t0,
          note: `${z.width} × ${z.height}, menyer och sidor går att nå` });
      } catch (e) {
        results.push({ name: `omflöde vid ${z.percent} %`, ok: false, ms: Date.now() - t0, note: String(e.message).split('\n')[0] });
        await page.screenshot({ path: path.join(OUT, `FEL-zoom-${z.percent}.png`) }).catch(() => {});
        await page.keyboard.press('Escape').catch(() => {});
      }
    }
    results.push({ name: 'inga fel vid zoomprov', ok: errors.length === 0, ms: 0, note: errors.slice(0, 10).join(' | ') || undefined });
  } finally {
    await context.close();
  }
  return results;
}

// Lugn rörelse (#246, #406) ska slås på automatiskt för besökare som valt reducerad rörelse i systemet.
async function runReducedMotion(browser) {
  const context = await browser.newContext({ viewport: { width: 400, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  if (THREE_LOCAL) {
    const body = fs.readFileSync(THREE_LOCAL, 'utf8');
    await page.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
    await page.route(u => isFont(u.href), r => r.abort());
  }
  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: T.load });
    await page.waitForFunction(() => document.getElementById('loading')?.hidden, null, { timeout: T.load });
    const calm = await page.evaluate(() => ({
      html: document.documentElement.classList.contains('calm'),
      checkbox: document.querySelector('input[data-calm]')?.checked,
      animation: getComputedStyle(document.querySelector('.funfact')).animationDuration,
      transition: getComputedStyle(document.querySelector('.glabel')).transitionDuration,
    }));
    if (!calm.html || !calm.checkbox) throw new Error('Lugn rörelse aktiverades inte från systeminställningen');
    if (Number.parseFloat(calm.animation) > 0.01 || Number.parseFloat(calm.transition) > 0.01) {
      throw new Error(`rörelse är inte avstängd (${calm.animation}, ${calm.transition})`);
    }
    return [{ name: 'reducerad rörelse', ok: true, ms: 0, note: 'Lugn rörelse aktiveras automatiskt och CSS-rörelser stoppas' }];
  } catch (e) {
    return [{ name: 'reducerad rörelse', ok: false, ms: 0, note: String(e.message).split('\n')[0] }];
  } finally {
    await context.close();
  }
}

async function runPresentation(browser) {
  const results = [];
  const presentationUrl = new URL(BASE);
  presentationUrl.searchParams.set('presentation', '1');
  for (const vp of [
    { name: 'presentation-1280', width: 1280, height: 720 },
    { name: 'presentation-1920', width: 1920, height: 1080 },
    { name: 'presentation-mobil', width: 400, height: 800 },
    { name: 'presentation-zoom-400', width: 350, height: 225 },
  ]) {
    const context = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: vp.name === 'presentation-mobil' ? 'reduce' : 'no-preference' });
    const page = await context.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url || '')) errors.push(m.text()); });
    page.on('pageerror', e => errors.push(e.message));
    if (THREE_LOCAL) {
      const body = fs.readFileSync(THREE_LOCAL, 'utf8');
      await page.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
      await page.route(u => isFont(u.href), r => r.abort());
    }
    const t0 = Date.now();
    try {
      await page.goto(presentationUrl.href, { waitUntil: 'domcontentloaded', timeout: T.load });
      await page.waitForFunction(() => document.getElementById('loading')?.hidden, null, { timeout: T.load });
      const state = await page.evaluate(() => ({
        active: document.getElementById('app')?.classList.contains('presentation-mode'),
        exit: document.getElementById('presentation-exit')?.getBoundingClientRect().toJSON(),
        scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        width: innerWidth,
        stored: Object.keys(localStorage).some(key => /presentation/i.test(key)),
        calm: document.documentElement.classList.contains('calm'),
      }));
      if (!state.active || !state.exit?.width || !state.exit?.height) throw new Error('presentationsläget eller avslutsknappen saknas');
      if (state.scroll > state.width) throw new Error(`presentationsläget ger ${state.scroll}px horisontell scroll i ${state.width}px`);
      if (state.stored) throw new Error('presentationsläget sparas i localStorage');
      if (vp.name === 'presentation-mobil' && !state.calm) throw new Error('reducerad rörelse aktiverar inte Lugn rörelse i presentationsläge');
      if (vp.width >= 1000) {
        await page.click('#btn-panel');
        const event = page.locator('#event-list .event-btn').first();
        await event.waitFor({ state: 'visible', timeout: T.step });
        await event.click();
        const detail = await page.locator('#detail').boundingBox();
        if (!detail || detail.width < 430) throw new Error('faktarutan är inte större i presentationsläge');
        await page.locator('#detail [data-close]').click();
        await page.click('#btn-flat');
        await page.waitForSelector('#flat-view', { state: 'visible', timeout: T.step });
        await page.click('#btn-flat');
      }
      if (vp.name === 'presentation-1280' || vp.name === 'presentation-1920') await page.screenshot({ path: path.join(OUT, `${vp.name}.png`) });
      await page.locator('#presentation-exit').focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => !new URL(location.href).searchParams.has('presentation'), null, { timeout: T.load });
      results.push({ name: `presentationsläge ${vp.width} × ${vp.height}`, ok: errors.length === 0, ms: Date.now() - t0,
        note: errors.join(' | ') || 'klass, exit, kärnkontroller och omflöde fungerar' });
    } catch (e) {
      results.push({ name: `presentationsläge ${vp.width} × ${vp.height}`, ok: false, ms: Date.now() - t0, note: String(e.message).split('\n')[0] });
      await page.screenshot({ path: path.join(OUT, `FEL-${vp.name}.png`) }).catch(() => {});
    } finally {
      await context.close();
    }
  }
  return results;
}

const t0 = Date.now();
const browser = await browserType.launch(BROWSER === 'chromium'
  ? { args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }
  : {});
let failed = 0;
try {
  for (const vp of VIEWPORTS) {
    console.log(`\n${vp.name} (${vp.width} × ${vp.height})`);
    for (const r of await run(browser, vp)) {
      if (!r.ok) failed++;
      console.log(`  ${r.ok ? 'OK  ' : 'FEL '} ${r.name}${r.note ? `: ${r.note}` : ''}${r.ms ? ` (${(r.ms / 1000).toFixed(1)} s)` : ''}`);
    }
  }
  console.log('\nzoom och omflödning');
  for (const r of await runReflow(browser)) {
    if (!r.ok) failed++;
    console.log(`  ${r.ok ? 'OK  ' : 'FEL '} ${r.name}${r.note ? `: ${r.note}` : ''}${r.ms ? ` (${(r.ms / 1000).toFixed(1)} s)` : ''}`);
  }
  console.log('\nreducerad rörelse');
  for (const r of await runReducedMotion(browser)) {
    if (!r.ok) failed++;
    console.log(`  ${r.ok ? 'OK  ' : 'FEL '} ${r.name}${r.note ? `: ${r.note}` : ''}`);
  }
  console.log('\npresentationsläge');
  for (const r of await runPresentation(browser)) {
    if (!r.ok) failed++;
    console.log(`  ${r.ok ? 'OK  ' : 'FEL '} ${r.name}${r.note ? `: ${r.note}` : ''}${r.ms ? ` (${(r.ms / 1000).toFixed(1)} s)` : ''}`);
  }
} finally {
  await browser.close();
}
console.log(`\n${failed ? `${failed} kontroller misslyckades` : 'Alla kontroller gick igenom'} på ${((Date.now() - t0) / 1000).toFixed(0)} s. Skärmbilder: ${OUT}`);
process.exit(failed ? 1 : 0);
