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
//   HEADLESS=0           öppna webbläsaren med fönster (i Actions kör Firefox så i Xvfb, eftersom det huvudlösa
//                        läget saknar GL-drivrutin, #702)
//   SKARMBILDER=<mapp>   var skärmbilderna sparas (standard: <tmp>/historia-globen-webblasartest)
//   THREE_LOCAL=<fil>    lokal kopia av three.module.js (three@0.160.0) som ersätter jsdelivr. För miljöer utan
//                        nät till jsdelivr, till exempel molnmiljön. Google Fonts avbryts då också.
//   ENDAST=<text>        kör bara kontroller vars namn innehåller texten (gemener/versaler spelar ingen roll; flera
//                        alternativ skiljs med |, till exempel ENDAST="årshoppet|versionsraden"). Hela avsnitten
//                        "zoom och omflödning", "reducerad rörelse" och "presentationsläge" körs bara om texten matchar
//                        avsnittets namn. "inga fel i konsolen" körs alltid. Matchar ingen kontroll avslutas testet med
//                        kod 1, så att ett stavfel inte ger grönt. "sidan svarar" och "globen laddas" körs alltid, eftersom
//                        de öppnar sidan och väntar in globen. För felsökning (#587): kontrollerna är inte alltid
//                        oberoende av varandra, så kör hela sviten en gång innan pull requesten lämnas in.
//   UTAN=<text>          (#864) kör allt utom kontroller vars namn innehåller texten (samma regler som ENDAST: flera
//                        alternativ med |, versaler spelar ingen roll). Anges både ENDAST och UTAN körs det som matchar
//                        ENDAST men inte UTAN (först väljs in, sedan tas bort). "sidan svarar", "globen laddas" och
//                        "inga fel i konsolen" tas aldrig bort av UTAN. Hela avsnitten (zoom och omflödning, reducerad
//                        rörelse, presentationsläge) tas bort om UTAN matchar avsnittets namn.
//   BREDD=<dator|mobil>  (#864) kör bara den bredden (flera med |, till exempel BREDD="dator|mobil"). Avsnitten zoom och
//                        omflödning, reducerad rörelse och presentationsläge har egna fönsterstorlekar och hör till
//                        datorjobbet: de körs när BREDD saknas eller innehåller dator. Okänt värde avslutar testet med kod 1.
//   Utan UTAN och BREDD är beteendet som förut. CI delar sviten i tre jobb med dem (tests/jobb.json, docs/beslut/
//   2026-11-08-webblasartestet-tre-jobb-864.md); scripts/kontrolltackning.mjs bevisar att varje kontroll ligger i exakt ett jobb.
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
import { list, urval, bredder, ALLTID } from './urval.mjs';

const require = createRequire(import.meta.url);
const playwright = require('playwright');
const { PNG } = require('playwright-core/lib/utilsBundle');

const PORT = Number(process.argv[2] || 8000);
const BROWSER = process.env.BROWSER || 'chromium';
// ENDAST (#587): kör bara kontroller vars namn innehåller någon av texterna. Utan ENDAST körs allt som förut.
const ENDAST = list(process.env.ENDAST);
// ALLTID: 'sidan svarar' och 'globen laddas' öppnar sidan och väntar in globen, så de körs alltid (tests/urval.mjs).
// UTAN (#864): tar bort kontroller ur urvalet; ENDAST väljer in först, UTAN tar bort sedan. 'inga fel i konsolen' skrivs
// efter kontrollerna och går inte genom wanted, så den körs alltid.
const UTAN = list(process.env.UTAN);
const wanted = urval({ endast: process.env.ENDAST, utan: process.env.UTAN });
// BREDD (#864): kör bara de bredder som anges. Utan BREDD körs båda.
const BREDDER = list(process.env.BREDD);
let matched = 0;
let skipped = 0;
const browserType = { chromium: playwright.chromium, firefox: playwright.firefox, webkit: playwright.webkit }[BROWSER];
if (!browserType) throw new Error(`Okänd webbläsarmotor: ${BROWSER}`);
const target = process.env.BASE_URL || `http://localhost:${PORT}/`;
const BASE = target.endsWith('/') ? target : `${target}/`;
const OUT = path.resolve(process.env.SKARMBILDER || path.join(os.tmpdir(), 'historia-globen-webblasartest'));
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const THREE_LOCAL = process.env.THREE_LOCAL || '';
// #1100: läs samma tidsgränser som sidan använder, även på testernas egna sidor.
const timelineBounds = page => page.evaluate(async () => {
  const { MIN_YEAR, MAX_YEAR } = await import('./js/timeline.js');
  return { min: MIN_YEAR, max: MAX_YEAR };
});
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com']; // avbrutna typsnitt är tillåtna
const ROUTE_YEAR = 1420; // år med vägar och resor (Zheng He, handelsvägar) och riken
const T = { load: 90000, step: 15000 };

const ALLA_VIEWPORTS = [
  { name: 'dator', width: 1400, height: 900 },
  { name: 'mobil', width: 400, height: 800 },
];
const { kor: KOR_BREDDER, medAvsnitt: MED_AVSNITT } = bredder(process.env.BREDD); // kastar vid okänd BREDD
const VIEWPORTS = ALLA_VIEWPORTS.filter(v => KOR_BREDDER.includes(v.name));

fs.mkdirSync(OUT, { recursive: true });
const isFont = url => { try { return FONT_HOSTS.includes(new URL(url).hostname); } catch { return false; } };

// Körs i sidan: jämför den platta kartans pixlar (#flat-canvas) med en sparad bild.
// Används för att se att ett lager faktiskt ritar något: lagret av → spara → lagret på → räkna ändrade pixlar.
// Hjälpen läggs i window.__hgTestPixels av en vanlig funktion (inte en textsträng), eftersom en sträng måste köras
// med eval, och det stoppar sidans skarpa Content-Security-Policy (#707) när testet körs mot den publicerade sidan.
function installPixelHelpers() {
  window.__hgTestPixels ??= {
    now() {
      const c = document.getElementById('flat-canvas');
      return c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    },
    diff(a, b) {
      if (!a || !b || a.length !== b.length) return Infinity;
      let n = 0;
      for (let i = 0; i < a.length; i += 4) {
        if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 30) n++;
      }
      return n;
    },
  };
  return window.__hgTestPixels;
}

// Felraden för en kontroll (#702): första raden i felet, vad Playwright väntade på och raden i testet där det
// hände. Förr syntes bara "page.waitForFunction: Timeout 15000ms exceeded.", och det gick inte att se vilken väntan
// i kontrollen som hängde utan skärmbilderna.
function failNote(e) {
  const lines = String(e?.message ?? e).replace(/\u001b\[\d+m/g, '').split('\n');
  const waiting = lines.find(l => /^\s*-\s*waiting for /.test(l))?.replace(/^\s*-\s*/, '').trim();
  // Hjälparna (visible, hidden …) ligger också i filen, så de tre första raderna visas: hjälparen och kontrollen
  const here = [...new Set(String(e?.stack ?? '').split('\n').map(l => l.match(/webblasare\.mjs:(\d+):\d+/)?.[1]).filter(Boolean))].slice(0, 3);
  return [lines[0], waiting && `(${waiting})`, here.length && `[rad ${here.join(', ')}]`].filter(Boolean).join(' ');
}

// En hämtning som avbryts av en omladdning eller navigering skrivs som ett fel i konsolen: WebKit "TypeError: Load failed"
// (#702), Firefox "TypeError: NetworkError when attempting to fetch resource." eller "AbortError: The operation was aborted."
// (#888). Bara exakt de meddelandena, och bara
// medan sidan navigerar, räknas bort; de syns inte för en besökare som lämnar sidan.
const ABORTED_FETCH = /^(TypeError: (Load failed|NetworkError when attempting to fetch resource\.)|AbortError: The operation was aborted\.\s*)$/;

// Firefox skriver ett typsnitt som navigeringen avbröt som konsolfel utan adress, så isFont(m.location().url) räknar inte bort
// det (#888, PR #959): turkortets typsnitt (Instrument Sans 600, IM Fell kursiv) hämtas först när kortet visas, och nästa
// goto avbryter dem. Status 2152398850 är NS_BINDING_ABORTED (0x804B0002), alltså avbruten och inte ett misslyckat nät. Bara
// exakt det meddelandet, bara från Googles typsnittsvärdar och bara medan sidan navigerar; ett typsnitt som inte kunde
// hämtas av annat skäl (en annan status) fäller kontrollen som förut.
const ABORTED_FONT = /^\[JavaScript Error: "downloadable font: download failed \(font-family: "[^"]+" style:\w+ weight:\d+ width:\d+ src index:\d+\): status=2152398850 source: https:\/\/fonts\.(gstatic|googleapis)\.com\/[^"\s]+"\]$/;

// Konsolmeddelanden (#888): när console.error får ett objekt (till exempel ett Error) ger Firefox texten
// "JSHandle@object" i m.text(), och loggen visade bara det. Texten sparas först som förut, och när meddelandet
// innehåller ett handtag byts den ut mot en läsbar rad: felets namn och meddelande, eller objektet som JSON.
// Filtreringen på texten (till exempel "Load failed") görs fortfarande på m.text().
function pushConsole(sink, m, format = t => t) {
  const i = sink.push(format(m.text())) - 1;
  if (!/JSHandle@/.test(m.text())) return;
  const describe = v => {
    if (v instanceof Error) return `${v.name}: ${v.message}`;
    if (v && typeof v === 'object') { try { return JSON.stringify(v); } catch { return String(v); } }
    return String(v);
  };
  Promise.all(m.args().map(a => a.evaluate(describe).catch(() => String(a))))
    .then(parts => { sink[i] = format(parts.join(' ')); })
    .catch(() => {});
}

// Läget i sidan när en väntan på en tur eller ett lektionsband tar slut (#888): adress, om kortet och bandet syns och vilka
// konsolfel som kommit, så att en körning i en motor jag inte kan köra själv visar vad som hände.
async function waitDiag(pg, label, sink, selector, timeout) {
  try {
    await pg.waitForSelector(selector, { state: 'visible', timeout });
  } catch (e) {
    const st = await pg.evaluate(() => ({
      hash: location.hash,
      ready: document.readyState,
      card: document.getElementById('tour-card')?.hidden,
      band: document.getElementById('lesson-band')?.hidden,
      touring: document.querySelectorAll('.touring').length,
      focusBar: !document.getElementById('focus-bar')?.hidden,
      hgGammal: !!window.__hgGammal,
    })).catch(err => ({ fel: err.message }));
    throw new Error(`${label}: ${selector} syntes inte inom ${timeout / 1000} s; läge ${JSON.stringify(st)}; konsol: ${sink.join(' | ') || 'inga fel'}`);
  }
}

async function run(browser, vp) {
  const results = [];
  const errors = [];
  const webglWarnings = [];
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  // Firefox ger "JSHandle@object" som text för console.error(err) (#888), och handtaget går inte alltid att läsa i efterhand
  // (sidan kan ha navigerat). Därför görs Error-argument om till text i sidan, innan de når webbläsarens konsol: "Namn:
  // meddelande", samma form som WebKit och Chromium redan ger. Strängar och andra argument passerar oförändrade.
  await context.addInitScript(() => {
    for (const level of ['error', 'warn']) {
      const original = console[level];
      console[level] = function (...args) {
        return original.apply(this, args.map(a => (a instanceof Error ? `${a.name}: ${a.message}` : a)));
      };
    }
  });
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
    // En hämtning som avbryts av omladdningen skrivs som ett fel i konsolen: WebKit "TypeError: Load failed" (#702),
    // Firefox "TypeError: NetworkError when attempting to fetch resource." (#888). Bara exakt de meddelandena, och bara
    // medan språktestet laddar om sidan, räknas bort. Övriga fel visar vilken kontroll som pågick när de kom.
    if (reloading && ABORTED_FETCH.test(m.text())) return;
    const during = currentCheck;
    pushConsole(errors, m, t => `konsol: ${t}${url ? ` (${url})` : ''}${during ? ` [under: ${during.slice(0, 60)}]` : ''}`);
  });
  // Medan språktestet laddar om sidan (#63) avbryter webbläsaren hämtningar som pågår, till exempel ikoner. WebKit
  // rapporterar det som fel ("Load request cancelled", "… due to access control checks", i konsolen "TypeError: Load
  // failed"); det är omladdningen,
  // inte ett fel på sidan. Bara avbrutna hämtningar under omladdningen räknas bort (v5.0.0).
  let reloading = false;
  const cancelled = text => /cancel|abort|access control checks/i.test(text ?? '');
  // "ResizeObserver loop completed with undelivered notifications" är enligt specifikationen ett ofarligt meddelande
  // om att en storleksändring skickas i nästa bildruta; WebKit rapporterar det som sidfel. Bara exakt det räknas bort.
  const benign = msg => /^ResizeObserver loop completed with undelivered notifications\.?$/.test(msg ?? '');
  page.on('pageerror', e => {
    if (benign(e.message) || (reloading && cancelled(e.message))) return;
    errors.push(`sidfel: ${e.message}`);
  });
  page.on('requestfailed', r => {
    if (isFont(r.url())) return;
    if (reloading && cancelled(r.failure()?.errorText)) return;
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
  let currentCheck = '';
  const check = async (name, fn) => {
    if (!wanted(name)) { skipped++; return; }
    if (!ALLTID.includes(name)) matched++;
    currentCheck = name;
    const t0 = Date.now();
    try {
      const note = await fn();
      results.push({ name, ok: true, ms: Date.now() - t0, note });
    } catch (e) {
      // Läget i sidan när kontrollen föll (#702): vilket element som har fokus och vilka paneler som är öppna
      const state = await page.evaluate(ids => {
        const a = document.activeElement;
        const focus = a ? `${a.tagName.toLowerCase()}${a.id ? `#${a.id}` : ''}${a.className && typeof a.className === 'string' ? `.${a.className.trim().split(/\s+/).join('.')}` : ''}` : 'inget';
        const open = ids.filter(id => { const el = document.getElementById(id); return el && !el.hidden && el.getClientRects().length; });
        const menu = document.querySelector('.top-actions')?.classList.contains('more-open') ? ', Meny öppen' : '';
        return `läge: år ${document.getElementById('year-big')?.textContent.trim()}, fokus ${focus}, öppna: ${open.join(' ') || 'inga'}${menu}`;
      }, ['jump-pop', 'help', 'layer-menu', 'focus-menu', 'empire-legend', 'detail', 'panel', 'sources-dialog', 'search-pop', 'flat-view', 'tour-card']).catch(() => '');
      results.push({ name, ok: false, ms: Date.now() - t0, note: [failNote(e), state].filter(Boolean).join(' · ') });
      await shot(`FEL-${name.replace(/[^a-zåäö0-9]+/gi, '-')}`).catch(() => {});
      await page.keyboard.press('Escape').catch(() => {});
    }
  };
  const year = () => page.textContent('#year-big').then(s => s.trim());
  const yearNumber = () => page.evaluate(() => {
    const value = Number(document.getElementById('year-big').textContent.replace(/\s/g, '')); // stora år har avgränsare (#1085)
    return document.getElementById('year-era').textContent.trim() === 'f.Kr.' ? 1 - value : value;
  });
  // Lager, Fokus, Kom igång, Platt vy, Källor och Hjälp ligger i mobilen i menyn Meny (#361, #530):
  // öppna den först när knappen inte syns
  // Källor, Hjälp och Dela ligger i datorn bakom knappen Mer (#651)
  const clickView = async sel => {
    if (await page.isHidden(sel) && await page.isVisible('#more-toggle')) await page.click('#more-toggle');
    if (await page.isHidden(sel) && await page.isVisible('#btn-more')) await page.click('#btn-more');
    await page.click(sel);
  };
  const jumpTo = async y => {
    await page.click('#year-jump');
    await visible('#jump-input');
    const text = y < 1 ? `${1 - y} f.Kr.` : String(y);
    await page.fill('#jump-input', text);
    await page.press('#jump-input', 'Enter');
    // Stora år visas med språkets tusentalsavgränsare (#1085), så mellanrum räknas inte
    await page.waitForFunction(v => document.getElementById('year-big').textContent.replace(/\s/g, '') === v, String(y < 1 ? 1 - y : y), { timeout: T.step });
  };
  // Väntar tills den platta kartan står still (två bilder i rad nästan lika) och sparar den som jämförelsebild.
  const settleFlat = async () => {
    await page.evaluate(installPixelHelpers);
    await page.waitForFunction(() => {
      const px = window.__hgTestPixels, now = px.now(), prev = window.__hgTestPrev;
      window.__hgTestPrev = now;
      if (prev && px.diff(prev, now) < 20) { window.__hgTestBase = now; return true; }
      return false;
    }, null, { polling: 300, timeout: T.step });
  };
  const layerRow = name => `#layer-menu input[data-layer="${name}"]`;
  const setLayer = async (name, on) => {
    if (await page.isHidden('#layer-menu')) { await clickView('#btn-layers'); await visible('#layer-menu'); }
    const box = page.locator(layerRow(name));
    if (await box.isHidden()) { await page.click('#layer-customize'); await box.waitFor({ state: 'visible', timeout: T.step }); }
    if ((await box.isChecked()) !== on) await box.click();
  };
  const setPause = async (name, on) => {
    if (await page.isHidden('#layer-menu')) { await clickView('#btn-layers'); await visible('#layer-menu'); }
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
    await page.evaluate(installPixelHelpers);
    const h = await page.waitForFunction(min => {
      const px = window.__hgTestPixels, n = px.diff(window.__hgTestBase, px.now());
      return n >= min && n;
    }, min, { polling: 300, timeout: T.step });
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
    // Startvyn är Översikt (#868). Den delade sidan går över till Standard, så att kontrollerna efter ser alla händelser;
    // Översikt som startvy provas på en egen sida i kontrollen om vyn Översikt.
    await page.evaluate(() => document.querySelector('#layer-menu .view-chip[data-view="standard"]')?.click());
    await page.waitForFunction(() => document.querySelector('#layer-menu .view-chip[data-view="standard"]')?.getAttribute('aria-pressed') === 'true', null, { timeout: T.step });
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

  await check('mobilmenyn samlar knapparna (#530)', async () => {
    const inMenu = ['btn-layers', 'btn-focus', 'btn-intro', 'btn-tour', 'btn-globe', 'btn-flat', 'btn-discovery', 'btn-sources', 'btn-help'];
    if (vp.width > 760) {
      if (await page.isVisible('#more-toggle')) throw new Error('knappen Meny syns i datorbredd');
      // Källor och Hjälp ligger bakom Mer i datorn (#651)
      const shown = inMenu.filter(id => !['btn-sources', 'btn-help', 'btn-intro'].includes(id));
      for (const id of ['btn-panel', 'btn-more', ...shown]) if (await page.isHidden(`#${id}`)) throw new Error(`#${id} syns inte i datorbredd`);
      await page.click('#btn-more');
      for (const id of ['btn-sources', 'btn-help', 'btn-share', 'btn-intro']) if (await page.isHidden(`#${id}`)) throw new Error(`#${id} syns inte under Mer`);
      await page.keyboard.press('Escape');
      if (await page.isVisible('#btn-help')) throw new Error('Escape stänger inte Mer');
      if (!await page.evaluate(() => !!document.getElementById('btn-panel').closest('.action-group'))) throw new Error('Samtidigt står inte i gruppen Utforska i datorn');
      return 'datorn: grupperna Vy och Utforska och knappen Mer, ingen Meny';
    }
    const toggle = page.locator('#more-toggle');
    await visible('#more-toggle');
    if ((await toggle.textContent()).trim() !== 'Meny') throw new Error('knappen heter inte Meny');
    if (await toggle.getAttribute('aria-expanded') !== 'false') throw new Error('menyn är öppen från början');
    if (await page.isHidden('#btn-panel')) throw new Error('Samtidigt syns inte bredvid Meny');
    if (await page.evaluate(() => !!document.getElementById('btn-panel').closest('#more-menu'))) throw new Error('Samtidigt ligger kvar i menyn');
    if (await page.isVisible('#btn-layers')) throw new Error('Lager syns fast menyn är stängd');
    // Tangentbord: Enter öppnar, Escape stänger och fokus tillbaka till Meny, mellanslag öppnar
    await toggle.focus();
    await page.keyboard.press('Enter');
    await visible('#more-menu');
    if (await toggle.getAttribute('aria-expanded') !== 'true') throw new Error('aria-expanded blir inte true');
    if (!await page.evaluate(() => document.getElementById('more-menu').contains(document.activeElement))) throw new Error('fokus flyttas inte in i menyn');
    const layout = await page.evaluate(ids => {
      const box = id => document.getElementById(id).getBoundingClientRect();
      const m = box('more-menu'), y = box('year-jump'), bar = document.querySelector('.timebar').getBoundingClientRect();
      const overlap = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      return {
        hidden: ids.filter(id => { const r = box(id); return !document.getElementById(id).hidden && (r.width < 1 || r.left < 0 || r.right > innerWidth); }),
        year: overlap(m, y), bar: m.bottom > bar.top, heading: getComputedStyle(document.getElementById('ag-mode')).display !== 'none',
        rowYear: overlap(box('btn-panel'), y) || overlap(box('more-toggle'), y),
      };
    }, inMenu);
    if (layout.hidden.length) throw new Error(`syns inte i menyn: ${layout.hidden.join(', ')}`);
    if (layout.year || layout.rowYear) throw new Error('menyn eller knapparna täcker årtalet');
    if (layout.bar) throw new Error('menyn täcker tidslinjen');
    if (!layout.heading) throw new Error('rubriken Vy saknas i menyn');
    await shot('530-mobilmeny-oppen');
    await page.keyboard.press('Escape');
    await hidden('#more-menu');
    if (await toggle.getAttribute('aria-expanded') !== 'false') throw new Error('aria-expanded blir inte false');
    if (await page.evaluate(() => document.activeElement?.id !== 'more-toggle')) throw new Error('Escape lämnar inte fokus på Meny');
    await page.keyboard.press('Space');
    await visible('#more-menu');
    await page.click('#more-toggle');
    await hidden('#more-menu');
    // Lager nås från menyn, menyn stänger sig, och Escape i Lager lämnar fokus på Meny
    await page.click('#more-toggle');
    await page.click('#btn-layers');
    await visible('#layer-menu');
    if (await page.isVisible('#more-menu')) throw new Error('menyn står kvar när Lager öppnas');
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    if (await page.evaluate(() => document.activeElement?.id !== 'more-toggle')) throw new Error('fokus går inte till Meny när Lager stängs');
    return 'Samtidigt och Meny i raden; Enter, mellanslag, Escape och fokus; menyn täcker inte årtal eller tidslinje';
  });

  // #1167: språket väljs med en knapp i översta raden (jordglob och kod), inte i Mer. Listan har språkens egna namn,
  // "beta" för ofärdiga översättningar, tangentbord och stängregistret (en öppnad lista stänger Lager och Meny).
  await check('språkknappen i översta raden (#1167)', async () => {
    const btn = page.locator('#btn-lang');
    await visible('#btn-lang');
    if ((await btn.textContent()).trim() !== 'SV') throw new Error(`knappen visar "${(await btn.textContent()).trim()}", inte SV`);
    if (!/Svenska/.test(await btn.getAttribute('aria-label') ?? '')) throw new Error('aria-label säger inte vilket språk som är valt');
    if (await page.evaluate(() => !!document.querySelector('#extra-menu [data-lang], #lang-select'))) throw new Error('språkvalet ligger kvar i Mer');
    const row = await page.evaluate(() => {
      const box = el => el.getBoundingClientRect();
      const b = box(document.getElementById('btn-lang'));
      const overlap = (a, c) => a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom;
      const others = [...document.querySelectorAll('.top-actions .chip-btn')].filter(el => el.id !== 'btn-lang' && el.getClientRects().length);
      return { out: b.left < 0 || b.right > innerWidth, year: overlap(b, box(document.getElementById('year-jump'))),
        hits: others.filter(el => overlap(b, box(el))).map(el => el.id || el.className) };
    });
    if (row.out) throw new Error('språkknappen ligger utanför skärmen');
    if (row.year) throw new Error('språkknappen täcker årtalet');
    if (row.hits.length) throw new Error(`språkknappen krockar med ${row.hits.join(', ')}`);
    // Lager öppet, sedan språklistan: Lager stängs (js/surfaces.js)
    if (vp.width <= 760) await page.click('#more-toggle');
    await page.click('#btn-layers');
    await visible('#layer-menu');
    await btn.focus();
    await page.keyboard.press('Enter');
    await visible('#lang-menu');
    if (await page.isVisible('#layer-menu')) throw new Error('Lager står kvar när språklistan öppnas');
    if (await btn.getAttribute('aria-expanded') !== 'true') throw new Error('aria-expanded blir inte true');
    const list = await page.evaluate(() => [...document.querySelectorAll('#lang-menu [data-lang]')].map(b => ({
      id: b.dataset.lang, beta: !!b.querySelector('.lang-beta'), current: b.getAttribute('aria-current') === 'true', focus: b === document.activeElement,
    })));
    if (list.length !== 5) throw new Error(`listan har ${list.length} språk, inte 5`);
    const cur = list.find(l => l.current);
    if (cur?.id !== 'sv' || !cur.focus) throw new Error('svenska är inte markerad och fokuserad när listan öppnas');
    if (list.filter(l => l.beta).length < 1 || list.find(l => l.id === 'sv').beta) throw new Error('beta-märket saknas eller står på svenska');
    await page.keyboard.press('ArrowDown');
    if (await page.evaluate(() => document.activeElement?.dataset.lang) !== list[1].id) throw new Error('pil ned flyttar inte fokus i listan');
    await shot('1167-sprakknapp');
    await page.keyboard.press('Escape');
    await hidden('#lang-menu');
    if (await page.evaluate(() => document.activeElement?.id !== 'btn-lang')) throw new Error('Escape lämnar inte fokus på språkknappen');
    // Klick utanför stänger
    await page.click('#btn-lang');
    await visible('#lang-menu');
    await page.evaluate(() => document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
    await hidden('#lang-menu');
    return `${list.map(l => l.id + (l.beta ? ' (beta)' : '')).join(', ')}; Enter, pilar, Escape och klick utanför; Lager stängs`;
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
    const helpReturn = vp.width > 760 ? 'btn-more' : 'more-toggle'; // Hjälp ligger i den stängda menyn Mer (#651) eller Meny (#530)
    if (await page.evaluate(id => document.activeElement?.id !== id, helpReturn)) throw new Error(`Escape lämnar inte fokus på ${helpReturn}`);

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

  if (vp.name === 'dator') {
    await check('surfplattans topprad täcker inte årtalet eller förklaringen (#992)', async () => {
      const pp = await context.newPage();
      const errors = [];
      pp.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) errors.push(m.text()); });
      pp.on('pageerror', e => errors.push(e.message));
      const layout = async () => {
        await pp.waitForFunction(() => {
          if (innerWidth <= 760 || innerWidth > 1100) return true;
          const header = document.querySelector('.masthead'), actions = document.querySelector('.top-actions');
          return parseFloat(getComputedStyle(header).getPropertyValue('--tablet-actions-height')) === actions.getBoundingClientRect().height
            && header.getBoundingClientRect().top >= actions.getBoundingClientRect().bottom;
        }, null, { timeout: T.step });
        const m = await pp.evaluate(() => {
          const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, height: r.height }; };
          // Hela årskortet (den mörka plattan, #1190) mot varje synlig knapp i toppraden; i mobil (≤ 760 px) är kortet
          // med flit lika brett som skärmen och knapparna ligger i dess högra del, så där mäts bara år och förklaring
          const card = rect('.masthead');
          const buttons = innerWidth <= 760 ? [] : [...document.querySelectorAll('.top-actions .chip-btn')]
            .filter(el => el.getClientRects().length).map(el => { const r = el.getBoundingClientRect(); return { id: el.id || el.className, left: r.left, top: r.top, right: r.right, bottom: r.bottom }; });
          return { width: innerWidth, height: innerHeight, lang: document.documentElement.lang, year: rect('#year-jump'), note: rect('#year-segment'), actions: rect('.top-actions'), card, buttons, scroll: document.documentElement.scrollWidth };
        });
        const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        if (overlaps(m.year, m.actions) || overlaps(m.note, m.actions)) throw new Error(`knapparna täcker år eller förklaring: ${JSON.stringify(m)}`);
        const onCard = m.buttons.filter(b => overlaps(b, m.card));
        if (onCard.length) throw new Error(`knappar ligger över årskortet vid ${m.width} px (${m.lang}): ${onCard.map(b => b.id).join(', ')}`);
        if ([m.year, m.note].some(r => r.left < 0 || r.top < 0 || r.right > m.width || r.bottom > m.height) || m.scroll > m.width) throw new Error(`text utanför skärmen eller horisontell scroll: ${JSON.stringify(m)}`);
        return m;
      };
      try {
        if (THREE_LOCAL) {
          await pp.route(THREE_URL, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(THREE_LOCAL, 'utf8') }));
          await pp.route(u => isFont(u.href), r => r.abort());
        }
        await pp.goto(BASE);
        await pp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        for (const [width, height] of [[768, 1024], [820, 1180], [1024, 768], [1400, 900], [400, 800], [761, 1024], [1100, 768], [1101, 768]]) {
          await pp.setViewportSize({ width, height });
          await layout();
          await pp.screenshot({ path: path.join(OUT, `992-${width}x${height}.png`) });
        }
        // Längre knappar på andra språk och en senare fontomflödning får också ändra reserverad höjd.
        // Datorbredderna prövas också på varje språk (#1190): knapparna är längst på tyska, spanska och franska och
        // lade sig över årskortet mellan 1101 och cirka 1550 px, där testet förut bara prövade svenska.
        for (const lang of ['en', 'de', 'es', 'fr']) {
          await pp.setViewportSize({ width: 820, height: 1180 });
          await pp.goto(`${BASE}?lang=${lang}`);
          await pp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
          await layout();
          await pp.screenshot({ path: path.join(OUT, `992-820x1180-${lang}.png`) });
          for (const [width, height] of [[1101, 768], [1280, 800], [1440, 900], [1500, 900]]) {
            await pp.setViewportSize({ width, height });
            await layout();
          }
          await pp.screenshot({ path: path.join(OUT, `1190-1500x900-${lang}.png`) });
        }
        const before = (await layout()).actions.height;
        const font = await pp.addStyleTag({ content: '.top-actions .chip-btn { font-size: 18px !important; }' });
        await pp.waitForFunction(height => document.querySelector('.top-actions').getBoundingClientRect().height > height, before, { timeout: T.step });
        await layout();
        await font.evaluate(node => node.remove());
        await layout();
        if (errors.length) throw new Error(errors.join(' | '));
      } finally { await pp.close(); }
      return 'tre iPad-format, dator, mobil och brytpunkternas kanter utan överlapp eller scroll; fem språk i surfplatte- och datorbredd (#1190) och fontomflödning';
    });
  }
  await check('årshoppet accepterar år, datum och felmeddelanden', async () => {
    // Öppna årshoppet bara när det är stängt: ett datumresultat kan lämna rutan öppen, och då stänger ett klick
    // på årtalet den i stället (föll i WebKit i mobilbredd inför v5.0.0).
    const openJump = async () => { if (await page.isHidden('#jump-input')) await page.click('#year-jump'); await visible('#jump-input'); };
    await openJump();
    const input = page.locator('#jump-input');
    await input.fill('1986'); await page.locator('#jump-pop').evaluate(form => form.requestSubmit());
    if (String(await year()) !== '1986') throw new Error(`året hoppade inte till 1986 utan ${await year()}`);
    await openJump();
    await input.fill('19860426'); await page.locator('#jump-pop').evaluate(form => form.requestSubmit());
    if (!/26 april 1986: \d+ händelser med dagsdatum/.test((await page.textContent('#jump-date-summary')) ?? '')) throw new Error('datumresultatet saknar dagsdatum på svenska');
    await openJump();
    await input.fill('860426'); await page.locator('#jump-pop').evaluate(form => form.requestSubmit());
    if (!/26 april 1986: \d+ händelser med dagsdatum/.test((await page.textContent('#jump-date-summary')) ?? '')) throw new Error('kort datum tolkas inte som 26 april 1986');
    await openJump();
    await input.fill('19861340'); await page.locator('#jump-pop').evaluate(form => form.requestSubmit());
    if (!(await page.locator('#jump-msg').textContent()).includes('Ogiltigt datum')) throw new Error('ogiltigt datum visar inte felmeddelande');
    const beforeInvalidYear = await yearNumber();
    await page.fill('#jump-input', '-2600'); await page.locator('#jump-pop').evaluate(form => form.requestSubmit());
    if (await yearNumber() !== beforeInvalidYear || !(await page.textContent('#jump-msg')).trim()) throw new Error('minustecken avvisas inte utan att ändra året (#1075)');
    await openJump();
    await page.fill('#jump-input', '20240229'); await page.locator('#jump-pop').evaluate(form => form.requestSubmit());
    if (!/29 februari 2024: \d+ händelser med dagsdatum/.test((await page.textContent('#jump-date-summary')) ?? '')) throw new Error('skottdag tolkas inte som giltigt datum');
    // Båda erorna kan väljas uttryckligen (#1075).
    if (await page.locator('#jump-pop .jump-era-btn').count() !== 2) throw new Error('årshoppet saknar ett av de två eravalen');
    await page.click('#year-jump'); if (await page.isHidden('#jump-input')) await openJump();
    await page.click('#jump-pop .jump-era-btn[data-era="bce"]');
    if (await page.getAttribute('#jump-pop .jump-era-btn[data-era="bce"]', 'aria-pressed') !== 'true') throw new Error('knappen f.Kr. slås inte på');
    await page.fill('#jump-input', '500'); await page.locator('#jump-pop').evaluate(form => form.requestSubmit());
    if ((await yearNumber()) !== -499) throw new Error(`500 med f.Kr. gav ${await yearNumber()} i stället för -499`);
    return 'år, datum och skottdag fungerar; fel och minustecken avvisas, båda erorna kan väljas';
  });

  await check('årshoppet: aktivt eraval, år 0 och ogiltig inmatning på fem språk (#1075)', async () => {
    const isolated = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, locale: 'sv-SE', reducedMotion: 'reduce' });
    try {
      for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
        const pp = await isolated.newPage();
        const errors = [];
        pp.on('pageerror', e => errors.push(e.message));
        pp.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) errors.push(m.text()); });
        try {
          if (THREE_LOCAL) {
            await pp.route(THREE_URL, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(THREE_LOCAL, 'utf8') }));
            await pp.route(u => isFont(u.href), r => r.abort());
          }
          await pp.goto(`${BASE}?lang=${lang}#y=1325`);
          await pp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
          const copy = await pp.evaluate(async () => {
            const { ui } = await import('./js/i18n.js');
            return { bce: ui('time.bce'), ce: ui('time.ce'), era: ui('jump.era'), negative: ui('jump.error.negative') };
          });
          const era = name => pp.locator(`#jump-pop [data-era="${name}"]`);
          const chosen = async name => {
            if (await era(name).getAttribute('aria-pressed') !== 'true' || await era(name === 'ce' ? 'bce' : 'ce').getAttribute('aria-pressed') !== 'false') throw new Error(`${lang}: fel eraval ${name}`);
          };
          const open = async () => { if (await pp.isHidden('#jump-pop')) await pp.click('#year-jump'); };
          const submit = async value => { await pp.fill('#jump-input', value); await pp.locator('#jump-pop').evaluate(form => form.requestSubmit()); };
          await open();
          if ((await era('ce').innerText()).trim() !== copy.ce || (await era('bce').innerText()).trim() !== copy.bce) throw new Error(`${lang}: erornas texter`);
          if ((await pp.textContent('#jump-era-label')).trim() !== copy.era) throw new Error(`${lang}: gruppnamnet`);
          await chosen('ce');
          await era('bce').focus(); await pp.keyboard.press('Enter'); await chosen('bce');
          await era('ce').focus(); await pp.keyboard.press('Space'); await chosen('ce');
          await submit('0'); await chosen('bce');
          await pp.waitForFunction(() => /(?:#|&)y=0(?:&|$)/.test(location.hash), null, { timeout: T.step });
          if (await pp.inputValue('#jump-input') !== '1' || (await pp.textContent('#year-big')).trim() !== '1' || (await pp.textContent('#year-era')).trim() !== copy.bce) throw new Error(`${lang}: 0 normaliserades inte till 1 f.Kr.`);
          await pp.screenshot({ path: path.join(OUT, `${vp.name}-1075-${lang}-noll.png`) });
          await open(); await era('bce').click(); await submit('0'); await chosen('bce');
          if (await pp.inputValue('#jump-input') !== '1') throw new Error(`${lang}: 0 med f.Kr. valt`);
          await open(); await era('bce').click(); await submit('500');
          await pp.waitForFunction(() => /(?:#|&)y=-499(?:&|$)/.test(location.hash), null, { timeout: T.step });
          await open(); await era('ce').click(); await submit('500');
          await pp.waitForFunction(() => /(?:#|&)y=500(?:&|$)/.test(location.hash), null, { timeout: T.step });
          await open();
          for (const bad of ['-500', '−500', '–500', '500.5', '1e3', '500abc', '9999']) {
            const before = pp.url();
            await submit(bad);
            if (!(await pp.textContent('#jump-msg')).trim() || (await pp.textContent('#year-big')).trim() !== '500' || pp.url() !== before || await pp.isHidden('#jump-pop')) throw new Error(`${lang}: ogiltigt ${bad} ändrade året eller saknar fel`);
            if (/^[-−–]/.test(bad) && (await pp.textContent('#jump-msg')).trim() !== copy.negative) throw new Error(`${lang}: minustecknets feltext`);
          }
          await era('bce').click(); await submit('1986-04-26'); await chosen('ce');
          await pp.waitForSelector('#jump-date-result:not([hidden])', { timeout: T.step });
          if ((await pp.textContent('#year-big')).trim() !== '1986') throw new Error(`${lang}: datum med f.Kr. valt`);
          await pp.fill('#jump-input', '0'); await pp.locator('#jump-pop').evaluate(form => form.requestSubmit()); await chosen('bce');
          await open();
          await pp.screenshot({ path: path.join(OUT, `${vp.name}-1075-${lang}-era.png`) });
          const layout = await pp.evaluate(() => {
            const pop = document.getElementById('jump-pop').getBoundingClientRect();
            const buttons = [...document.querySelectorAll('#jump-pop .jump-era-btn')].map(b => b.getBoundingClientRect());
            return document.documentElement.scrollWidth <= innerWidth && pop.left >= 0 && pop.right <= innerWidth && buttons.every(b => b.width >= 24 && b.height >= 44 && b.left >= pop.left && b.right <= pop.right);
          });
          if (!layout || errors.length) throw new Error(`${lang}: omflöde, tryckyta eller sidfel: ${errors.join(' | ')}`);
        } finally { await pp.close(); }
      }
    } finally { await isolated.close(); }
    return 'fem språk: två eror med tangentbord, 0 → 1 f.Kr. från båda erorna, minustecken/skräp/gräns avvisas, datum synkar eran; inga sidfel eller sidscroll';
  });

  // #979: tidslinjens segment är en skala och heter bara årtal; epoknamnen finns bara i data/perioder.json
  await check('årshoppets snabbval och tidslinjens segment heter bara årtal (#979)', async () => {
    if (await page.isHidden('#jump-pop')) await page.click('#year-jump');
    await visible('#jump-epochs');
    const names = await page.locator('#jump-epochs .jump-epoch-name').allTextContents();
    const want = ['100\u00a0000–3000 f.Kr.', '3000–500 f.Kr.', '500 f.Kr.–1000', '1000–1800', 'sedan 1800', 'Idag']; // förhistorien sedan #1088
    if (JSON.stringify(names) !== JSON.stringify(want)) throw new Error(`snabbvalen heter ${JSON.stringify(names)}, väntade ${JSON.stringify(want)}`);
    const titles = await page.locator('#track-segments .seg[title]').evaluateAll(els => els.map(e => e.title));
    if (titles.some(x => /ålder|Antiken|Medeltid|Modern/i.test(x))) throw new Error(`segmenten har epoknamn: ${JSON.stringify(titles)}`);
    await page.keyboard.press('Escape');
    return `snabbvalen ${names.join(' · ')}; segmenten ${titles.join(' · ')}`;
  });

  await check('datumresultatets rader öppnar händelsen (#590)', async () => {
    if (await page.isHidden('#jump-pop')) await page.click('#year-jump');
    await visible('#jump-input');
    await page.fill('#jump-input', '19860426'); await page.locator('#jump-pop').evaluate(form => form.requestSubmit());
    const row = page.locator('#jump-date-events button.jump-date-event', { hasText: 'Tjernobylkatastrofen' });
    await row.waitFor({ state: 'visible', timeout: T.step });
    // I mobilen döljs snabbhoppen när ett datum visas, så att resultatet tar mindre plats
    const epochsShown = await page.isVisible('#jump-epochs');
    if (vp.width <= 760 && epochsShown) throw new Error('snabbhoppen syns fortfarande efter ett datum i mobilen');
    if (vp.width > 760 && !epochsShown) throw new Error('snabbhoppen döljs i datorn');
    // Tangentbord: raden nås med Tab och öppnas med Enter
    await row.focus();
    await page.keyboard.press('Enter');
    await hidden('#jump-pop');
    await page.waitForFunction(() => document.querySelector('#detail')?.textContent.includes('Tjernobylkatastrofen'), null, { timeout: T.step });
    if (String(await year()) !== '1986') throw new Error(`året ändrades till ${await year()} när händelsen öppnades`);
    await page.locator('#detail [data-close]').first().click().catch(() => page.keyboard.press('Escape'));
    return `raden är en knapp, Enter öppnar faktarutan för Tjernobyl; snabbhopp ${epochsShown ? 'kvar' : 'dolda'}`;
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

  // #1304: några kategorier av och noll träffar. Raden säger att urvalet kan dölja händelser, och knappen visar alla igen.
  await check('några kategorier av och noll träffar: raden säger det, och Visa alla kategorier ger träffarna tillbaka (#1304)', async () => {
    await jumpTo(1325);
    if (await page.locator('#panel').isHidden()) await page.click('#btn-panel');
    await visible('#panel');
    const cats = await page.locator('#panel-filters [data-cat]').evaluateAll(els => els.map(e => e.dataset.cat));
    const setOnly = async keep => {
      for (const c of cats) {
        const chip = page.locator(`#panel-filters [data-cat="${c}"]`);
        if (((await chip.getAttribute('aria-pressed')) === 'true') !== (c === keep)) await chip.click();
      }
    };
    // Hitta en kategori utan händelse kring året: slå av alla andra och se när listan blir tom
    let empty = null;
    for (const keep of cats) {
      await setOnly(keep);
      if (!(await page.locator('#event-list .event-btn').count())) { empty = keep; break; }
    }
    if (!empty) throw new Error('ingen kategori är tom kring 1325, så läget kan inte provas');
    const sub = (await page.textContent('#panel-sub')).trim();
    if (!/^Inget i de valda kategorierna inom .+ från 1325\.$/.test(sub)) throw new Error(`raden under rubriken säger "${sub}"`);
    if (/avstängda, så inga/.test(sub)) throw new Error('läget "alla kategorier av" visas fast bara några är av');
    const help = (await page.textContent('#event-list .empty-note')).trim();
    if (!/kan dölja händelser/.test(help)) throw new Error(`hjälptexten säger "${help}"`);
    const reset = page.locator('#event-list .panel-show-all-categories');
    if (await reset.count() !== 1 || !(await reset.isVisible())) throw new Error('knappen Visa alla kategorier saknas');
    if ((await reset.textContent()).trim() !== 'Visa alla kategorier') throw new Error('knappen har fel text');
    await reset.click();
    await page.waitForFunction(() => document.querySelectorAll('#event-list .event-btn').length > 0, null, { timeout: T.step });
    const pressed = await page.locator('#panel-filters [data-cat]').evaluateAll(els => els.every(e => e.getAttribute('aria-pressed') === 'true'));
    if (!pressed) throw new Error('Visa alla kategorier slog inte på alla kategorier');
    if (await page.locator('#event-list .panel-show-all-categories').count()) throw new Error('knappen står kvar när listan har träffar');
    if (!(await page.evaluate(() => !!document.activeElement?.closest('#panel-filters')))) throw new Error('fokus gick inte till kategorierna efter knappen');
    return `${empty} ensam ger en tom lista med raden "kan dölja händelser" och knappen; Visa alla kategorier ger träffarna och alla kategorier tillbaka`;
  });

  await check('kategorin Katastrofer visar Tjernobyl (#554)', async () => {
    await jumpTo(1986);
    if (await page.locator('#panel').isHidden()) await page.click('#btn-panel');
    await visible('#panel');
    const chip = page.locator('#panel-filters [data-cat="katastrofer"]');
    if (await chip.count() !== 1) throw new Error('filterknappen Katastrofer saknas');
    if ((await chip.textContent()).trim() !== 'Katastrofer') throw new Error(`filterknappen heter "${(await chip.textContent()).trim()}"`);
    // Färgen mot panelens bakgrund (--night-2): minst 3:1 för en grafisk markering (WCAG 1.4.11, #505)
    const ratio = await chip.evaluate(el => {
      const rgb = c => c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
      const lum = c => { const [r, g, b] = rgb(c).map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      const probe = document.createElement('span'); probe.style.color = 'var(--night-2)'; document.body.append(probe);
      const bg = getComputedStyle(probe).color; probe.remove();
      const [a, b] = [lum(getComputedStyle(el.querySelector('.dot')).backgroundColor), lum(bg)].sort((x, y) => y - x);
      return (a + 0.05) / (b + 0.05);
    });
    if (ratio < 3) throw new Error(`kategorifärgen har bara kontrasten ${ratio.toFixed(1)}:1`);
    const row = page.locator('#event-list .event-btn', { hasText: 'Tjernobylkatastrofen' });
    await row.first().waitFor({ state: 'visible', timeout: T.step });
    await chip.click();
    await row.first().waitFor({ state: 'detached', timeout: T.step });
    await chip.click();
    await row.first().waitFor({ state: 'visible', timeout: T.step });
    await page.click('#panel-close');
    return `filterknapp, Tjernobyl följer filtret, kontrast ${ratio.toFixed(1)}:1`;
  });

  // #1003: markeringarna ligger utanför tabbordningen, och teckenförklaringen syns, täcker inga knappar och minns att den fälldes ihop
  await check('tidslinjens markeringar är utanför tabbordningen och teckenförklaringen går att fälla ihop (#1003)', async () => {
    await page.waitForSelector('#track-dots > *, #track-ff > *', { state: 'attached', timeout: T.step });
    const bad = await page.evaluate(() => [...document.querySelectorAll('.tdot, .tspan, .tff, .troute')].filter(m => m.tabIndex !== -1).length);
    if (bad) throw new Error(`${bad} markeringar har tabbstopp`);
    const marks = await page.evaluate(() => document.querySelectorAll('.tdot, .tspan, .tff, .troute').length);
    // I smal skärm döljs raden medan engångstipset visas (#1138); texten finns ändå, och raden syns efter första draget (provas nedan)
    await page.waitForSelector('#timeline-legend', { state: 'attached', timeout: T.step });
    const texts = (await page.textContent('#timeline-legend')).replace(/\s+/g, ' ').trim();
    if (!/händelse/.test(texts) || !/Visste du/.test(texts) || !/resa/.test(texts)) throw new Error(`teckenförklaringen saknar tecken: ${texts}`);
    const covered = await page.evaluate(() => [...document.querySelectorAll('.timebar .step, #btn-play')].filter(b => {
      const r = b.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !(hit === b || b.contains(hit));
    }).length);
    if (covered) throw new Error('teckenförklaringen eller något annat täcker steg- eller spelknapparna');
    // Ihopfällningen och omladdningen provas på en egen sida, så att den delade sidans tillstånd inte ändras för kontrollerna efter
    // Den statiska details-rutan kan synas innan appen har läst det sparade valet.
    const fresh = await context.newPage();
    try {
      await fresh.goto(BASE);
      await fresh.evaluate(() => { try { localStorage.removeItem('hg-teckenforklaring'); localStorage.setItem('hg-year-tip', '1'); } catch { /* */ } }); // utan tipset, som annars döljer raden i smal skärm (#1138)
      await fresh.reload();
      await fresh.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await fresh.waitForSelector('#timeline-legend summary', { state: 'visible', timeout: T.step });
      await fresh.click('#timeline-legend summary');
      if (await fresh.getAttribute('#timeline-legend', 'open') !== null) throw new Error('teckenförklaringen fälldes inte ihop');
      await fresh.reload();
      await fresh.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await fresh.waitForSelector('#timeline-legend summary', { state: 'visible', timeout: T.step });
      if (await fresh.getAttribute('#timeline-legend', 'open') !== null) throw new Error('valet att fälla ihop sparades inte');
      await fresh.click('#timeline-legend summary');
      if (await fresh.getAttribute('#timeline-legend', 'open') === null) throw new Error('teckenförklaringen öppnades inte igen');
      await fresh.reload();
      await fresh.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await fresh.waitForSelector('#timeline-legend summary', { state: 'visible', timeout: T.step });
      if (await fresh.getAttribute('#timeline-legend', 'open') === null) throw new Error('valet att öppna sparades inte');
    } finally { await fresh.close(); }
    return `${marks} markeringar utan tabbstopp; tecknen syns, täcker inga knappar och valet sparas`;
  });

  // #996: engångstipset vid tidslinjen syns vid första besöket, försvinner efter första klicket i tidslinjen och kommer inte tillbaka
  await check('engångstipset vid tidslinjen försvinner efter första draget och kommer inte tillbaka (#996)', async () => {
    const fresh = await context.newPage();
    const errs = [];
    // WebKit skriver en avbruten hämtning som sidfel ("… due to access control checks"): samma regel som i resten av testet (#996)
    fresh.on('pageerror', e => { if (!cancelled(e.message)) errs.push(e.message); });
    try {
      await fresh.goto(BASE);
      await fresh.evaluate(() => { try { localStorage.removeItem('hg-year-tip'); } catch { /* */ } });
      await fresh.reload();
      await fresh.waitForSelector('#year-tip', { state: 'visible', timeout: T.step });
      if (!/\S/.test(await fresh.textContent('#year-tip span'))) throw new Error('tipset är tomt');
      await fresh.locator('#track').click({ timeout: T.step });
      await fresh.waitForSelector('#year-tip', { state: 'hidden', timeout: T.step });
      await fresh.reload();
      await fresh.waitForSelector('#track', { timeout: T.step });
      await fresh.waitForTimeout(400);
      if (await fresh.isVisible('#year-tip')) throw new Error('tipset kom tillbaka efter omladdning');
      if (errs.length) throw new Error(errs.join('; '));
    } finally { await fresh.close(); }
    return 'syns första gången, försvinner efter klicket i tidslinjen, kommer inte tillbaka';
  });

  // #1302: engångstipset låg som en rad i tidsradens flöde och gjorde den 22 px högre medan det syntes, så att stegknapparna täckte
  // Samtidigt-kortet (mobil) och fokusraden låg över dem. Nu ligger det över tidsradens nedersta rad och tar ingen höjd.
  await check('engångstipset ändrar inte tidsradens läge, täcker inte kortet eller fokusraden och syns inte i tur eller Fokus (#1302)', async () => {
    const fresh = await context.newPage();
    const errs = [];
    fresh.on('pageerror', e => { if (!cancelled(e.message)) errs.push(e.message); });
    let n = 0;
    const open = async hash => {
      const url = `${BASE}?ny=tip1302-${Date.now()}-${n++}`;
      await fresh.goto(url);
      await fresh.evaluate(() => { try { localStorage.removeItem('hg-year-tip'); } catch { /* */ } });
      await fresh.goto(`${url}${hash}`);
      await fresh.reload();
      await fresh.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
    };
    const geo = () => fresh.evaluate(() => {
      const box = sel => { const e = document.querySelector(sel); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return r.width ? { top: r.top, bottom: r.bottom } : null; };
      return { bar: box('.timebar'), controls: box('.timebar .controls'), tip: box('#year-tip'), card: box('#funfact'), focus: box('#focus-bar'),
        legend: getComputedStyle(document.getElementById('timeline-legend')).visibility, vh: innerHeight };
    });
    try {
      // 1. Med och utan tips ligger tidsraden på samma ställe, och tipset ryms på skärmen utan att täcka kortet eller knapparna
      await open('#y=1325');
      await fresh.waitForSelector('#year-tip', { state: 'visible', timeout: T.step });
      await fresh.waitForSelector('#funfact', { state: 'visible', timeout: T.step });
      await fresh.waitForTimeout(500);
      const withTip = await geo();
      await fresh.evaluate(() => { document.getElementById('year-tip').hidden = true; });
      await fresh.waitForTimeout(300);
      const without = await geo();
      if (!withTip.tip || !withTip.bar || !withTip.controls || !withTip.card) throw new Error(`en yta saknas med tipset: ${JSON.stringify(withTip)}`);
      if (Math.abs(withTip.bar.top - without.bar.top) > 1 || Math.abs(withTip.controls.top - without.controls.top) > 1) throw new Error(`tipset flyttade tidsraden: ${Math.round(withTip.bar.top)} mot ${Math.round(without.bar.top)}, knapparna ${Math.round(withTip.controls.top)} mot ${Math.round(without.controls.top)}`);
      if (withTip.card.bottom > withTip.controls.top + 1) throw new Error(`kortet slutar vid ${Math.round(withTip.card.bottom)} men knapparna börjar vid ${Math.round(withTip.controls.top)} med tipset`);
      if (withTip.tip.top < withTip.controls.bottom - 1) throw new Error(`tipset (från ${Math.round(withTip.tip.top)}) täcker knapparna (till ${Math.round(withTip.controls.bottom)})`);
      if (withTip.tip.bottom > withTip.vh + 1) throw new Error(`tipset slutar vid ${Math.round(withTip.tip.bottom)} utanför skärmen (${withTip.vh})`);
      if (withTip.legend !== 'hidden') throw new Error('teckenförklaringen syns på tipsets rad');

      // 2. I Fokus syns inget tips, och fokusraden ligger inte över knapparna
      await open('#y=100&f=empire:hanriket');
      await fresh.waitForSelector('#focus-bar', { state: 'visible', timeout: T.step });
      await fresh.waitForTimeout(500);
      const inFocus = await geo();
      if (await fresh.isVisible('#year-tip')) throw new Error('tipset syns i Fokus');
      if (!inFocus.focus || !inFocus.controls) throw new Error('fokusraden eller knapparna saknas i Fokus');
      if (inFocus.focus.bottom > inFocus.controls.top + 1) throw new Error(`fokusraden slutar vid ${Math.round(inFocus.focus.bottom)} men knapparna börjar vid ${Math.round(inFocus.controls.top)}`);

      // 3. I en tur syns inget tips
      await open('#t=forsta-varldskriget');
      await fresh.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
      if (await fresh.isVisible('#year-tip')) throw new Error('tipset syns i en tur');
      if (errs.length) throw new Error(errs.join('; '));
      return `tidsraden ligger still (${Math.round(withTip.controls.top)} px), kortet slutar vid ${Math.round(withTip.card.bottom)}, tipset ${Math.round(withTip.tip.top)}–${Math.round(withTip.tip.bottom)}; inget tips i Fokus eller tur`;
    } finally { await fresh.close(); }
  });

  await check('introduktionen startas frivilligt från Utforska', async () => {
    // Samtidigt-provet ovan öppnar listan för Visa fler. Stäng den som en besökare gör så att
    // introduktionsknappen provas utan en avsiktligt överlagrad panel i mobilbredd.
    if (await page.locator('#panel').isVisible()) await page.click('#panel-close');
    if (await page.isVisible('#intro')) throw new Error('introduktionen öppnas automatiskt vid första besöket');
    if (await page.locator('#help-intro').count()) throw new Error('Hjälp innehåller fortfarande en länk till introduktionen');
    const introButton = page.locator('#btn-intro');
    // Kom igång ligger under Mer: bakom knappen Mer i datorn och i menyn Meny i mobilen (#996)
    if (await introButton.isHidden() && await page.isVisible('#more-toggle')) await page.click('#more-toggle');
    if (await introButton.isHidden() && await page.isVisible('#btn-more')) await page.click('#btn-more');
    await visible('#btn-intro');
    if ((await introButton.textContent()).trim() !== 'Kom igång') throw new Error('knappen under Mer har fel text');
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
    await clickView('#btn-intro');
    await visible('#intro');
    const animation = await page.locator('.intro-box').evaluate(el => getComputedStyle(el).animationName);
    if (animation !== 'none') throw new Error(`introduktionen animeras trots Lugn rörelse: ${animation}`);
    await page.keyboard.press('Escape');
    await hidden('#intro');
    // I mobilen ligger knappen i den stängda menyn, och då går fokus till Meny (#530)
    const focusRestored = await page.evaluate(id => document.activeElement?.id === id, vp.width > 760 ? 'btn-more' : 'more-toggle');
    if (!focusRestored) throw new Error('Escape lämnade inte fokus på knappen som öppnade introduktionen');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    return 'ingen automatisk popup; tre steg, år 1889, Escape och reducerad rörelse fungerar';
  });

  // Samtidighetsjakten (#741): starta från Mer, lägg händelser i jakten från faktarutan, samma världsdel ger besked,
  // tre världsdelar ger frågan och källorna, uppdraget står i adressen, Escape avslutar och fokus kommer tillbaka
  await check('Samtidighetsjakten räknar världsdelar och år ur datan (#741)', async () => {
    try { return await huntCheck(); } catch (err) { if (await page.isVisible('#hunt')) await page.click('#hunt-end'); throw err; }
  });
  async function huntCheck() {
    await clickView('#btn-hunt');
    await visible('#hunt');
    if ((await year()) !== '1500') throw new Error(`jakten började på ${await year()}, inte 1500`);
    if (!/^0 /.test((await page.textContent('#hunt-progress')).trim())) throw new Error('jakten börjar inte på noll');
    // Som en elev: öppna händelsen i Samtidigt och tryck på Lägg till i jakten i faktarutan
    const add = async id => {
      if (await page.isHidden('#panel')) await clickView('#btn-panel');
      await page.locator(`#event-list .event-btn[data-id="${id}"]`).first().click();
      await page.waitForSelector('#detail [data-hunt]', { state: 'visible', timeout: T.step });
      await page.click('#detail [data-hunt]');
      return (await page.textContent('#hunt-message')).trim();
    };
    await add('columbus');
    await add('bartolomeu-dias-rundar-afrika');
    const same = await add('spanska-erovringen-av-aztekriket');
    if (!/redan/.test(same)) throw new Error(`två händelser från Amerika godtogs: ${same}`);
    await add('vasco-da-gama-nar-indien');
    await visible('#hunt-done');
    if (await page.locator('#hunt-list li').count() !== 3) throw new Error('jakten har inte tre händelser');
    await page.waitForFunction(() => document.querySelectorAll('#hunt-sources li a').length > 0, null, { timeout: T.step });
    const wide = await page.evaluate(() => document.scrollingElement.scrollWidth > innerWidth + 1);
    if (wide) throw new Error('jakten ger horisontell scroll');
    await page.waitForFunction(() => location.hash.includes('u=samtidighetsjakten-1500'), null, { timeout: T.step });
    if (await page.isVisible('#panel-close')) await page.click('#panel-close');
    await page.focus('#hunt-end');
    await page.keyboard.press('Escape');
    await hidden('#hunt');
    const back = await page.evaluate(() => document.activeElement?.id);
    if (!['btn-hunt', 'btn-more', 'more-toggle'].includes(back)) throw new Error(`fokus gick till ${back} efter Escape`);
    await page.waitForFunction(() => !location.hash.includes('u='), null, { timeout: T.step });
    if (await page.isVisible('#detail')) await page.keyboard.press('Escape');
    return 'år 1500; Amerika två gånger ger besked; tre världsdelar ger fråga och källor; u= i adressen och bort efter Escape';
  }

  // Menyn över en öppen Samtidigt-panel (#887): knapparna i Mer/Meny ska ta emot klicket, inte panelen.
  // isVisible() räcker inte, så vi mäter vad som ligger överst mitt på knappen.
  await check('Mer/Meny ligger över en öppen Samtidigt-panel (#887)', async () => {
    try {
      if (await page.isHidden('#panel')) await page.click('#btn-panel');
      await visible('#panel');
      if (await page.isVisible('#more-toggle')) await page.click('#more-toggle'); else await page.click('#btn-more');
      const blocked = await page.evaluate(ids => ids.filter(id => {
        const b = document.getElementById(id);
        if (!b || !b.getClientRects().length) return false;
        const r = b.getBoundingClientRect();
        const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return !(el && b.contains(el));
      }), ['btn-hunt', 'btn-quiz', 'btn-sources', 'btn-help']);
      if (blocked.length) throw new Error(`panelen tar emot klicket i stället för ${blocked.join(', ')}`);
      // Och ett riktigt klick (utan force) startar jakten
      await page.click('#btn-hunt');
      await visible('#hunt');
      if (await page.isVisible('#panel-close')) await page.click('#panel-close');
      await page.click('#hunt-end');
      await hidden('#hunt');
      return 'Källor, Hjälp, Quiz och Samtidighetsjakten når klicket med Samtidigt öppen';
    } finally {
      if (await page.isVisible('#hunt')) await page.click('#hunt-end').catch(() => {});
      if (await page.isVisible('#panel-close')) await page.click('#panel-close').catch(() => {});
    }
  });

  // Kombinationsmatris (#891): varje meny och verktyg ovanpå varje yta som redan kan vara öppen. Isolerade prov är
  // gröna medan en kedja är röd, och isVisible() godkänner en knapp som ligger bakom något annat. Därför mäts vad som
  // faktiskt ligger överst mitt på knappen (elementFromPoint), och sedan klickas den med riktig pekning (ingen force).
  // Varje par får en ny sida, så att inget ärvs från föregående par. Kör i ett eget jobb (tests/jobb.json).
  await check('kombinationsmatris: menyer och verktyg ovanpå öppna ytor (#891)', async () => {
    const SURFACES = [
      { id: 'Samtidigt', hash: '#y=1889', setup: async p => { await p.click('#btn-panel'); await p.waitForSelector('#panel', { state: 'visible', timeout: T.step }); } },
      { id: 'faktaruta', hash: '#y=1889', setup: async p => {
        await p.click('#btn-panel');
        await p.locator('#event-list .event-btn').first().click({ timeout: T.step });
        await p.waitForSelector('#detail', { state: 'visible', timeout: T.step });
        if (await p.isVisible('#panel-close')) await p.click('#panel-close');
      } },
      { id: 'tur', hash: '#t=forsta-varldskriget', setup: async p => { await p.waitForSelector('#tour-card', { state: 'visible', timeout: T.step }); } },
    ];
    // [knapp, det som öppnas]. Öppnas ingenting av dessa räknas klicket som missat.
    const CONTROLS = [
      ['btn-layers', ['#layer-menu']], ['btn-focus', ['#focus-menu']], ['btn-help', ['#help']],
      ['btn-sources', ['#sources-dialog']], ['btn-quiz', ['#quiz']], ['btn-hunt', ['#hunt']],
    ];
    const problems = [];
    let measured = 0, skipped = 0, n = 0;
    for (const surface of SURFACES) {
      for (const [btn, opens] of CONTROLS) {
        const mp = await context.newPage();
        try {
          if (THREE_LOCAL) {
            const body = fs.readFileSync(THREE_LOCAL, 'utf8');
            await mp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
            await mp.route(u => isFont(u.href), r => r.abort());
          }
          await mp.goto(`${BASE}?ny=m${n++}${surface.hash}`);
          await mp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
          await surface.setup(mp);
          // Knappen kan ligga i Mer/Meny: öppna den som en besökare gör
          if (!(await mp.isVisible(`#${btn}`))) {
            if (await mp.isVisible('#more-toggle')) await mp.click('#more-toggle'); else if (await mp.isVisible('#btn-more')) await mp.click('#btn-more');
          }
          if (!(await mp.isVisible(`#${btn}`))) { skipped++; continue; } // finns inte i den här bredden eller i det här läget
          measured++;
          const cover = await mp.evaluate(id => {
            const b = document.getElementById(id), r = b.getBoundingClientRect();
            const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
            if (el && b.contains(el)) return null;
            return el ? `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).join('.')}` : ''}` : 'ingenting';
          }, btn);
          if (cover) { problems.push(`${surface.id} → ${btn}: täcks av ${cover}`); continue; }
          try { await mp.click(`#${btn}`, { timeout: 5000 }); } catch (e) { problems.push(`${surface.id} → ${btn}: riktigt klick gick inte (${String(e.message).split('\n')[0]})`); continue; }
          await mp.waitForTimeout(400);
          const opened = await mp.evaluate(sels => sels.some(sel => { const el = document.querySelector(sel); return el && !el.hidden && el.getClientRects().length > 0; }), opens);
          if (!opened) problems.push(`${surface.id} → ${btn}: klicket öppnade inte ${opens.join(' eller ')}`);
        } finally {
          await mp.close();
        }
      }
    }
    if (problems.length) throw new Error(`${problems.length} av ${measured} par felar: ${problems.join(' | ')}`);
    return `${measured} par (${SURFACES.map(x => x.id).join(', ')} × ${CONTROLS.length} knappar) klickbara med riktig pekning; ${skipped} fanns inte i bredden`;
  });

  // Kombinationsmatris, del 2 (#891): fel som kommer efter att sidan har fungerat, i den övergång besökaren gör, och
  // skolflödet fråga → underlag → svar → återgång med riktig pekning. Enskilda prov för bild (#884), källregister vid
  // utskrift (#879) och turfil vid sidladdning (#877) finns redan; här prövas att felet mitt i sessionen ger besked och
  // att sidan kommer tillbaka när felet är över, utan omladdning. Egen sida med pekning (hasTouch) för varje prov.
  const touchPage = async () => {
    const tctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, hasTouch: true });
    const tp = await tctx.newPage();
    const errs = [];
    tp.on('pageerror', e => errs.push(e.message));
    if (THREE_LOCAL) {
      const body = fs.readFileSync(THREE_LOCAL, 'utf8');
      await tp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
      await tp.route(u => isFont(u.href), r => r.abort());
    }
    return { tp, tctx, errs };
  };
  // Mäter vad som ligger överst mitt på elementet och trycker sedan med pekning; felet säger vad som täckte.
  const tapReal = async (pg, selector, what) => {
    const cover = await pg.evaluate(sel => {
      const b = document.querySelector(sel);
      if (!b) return 'finns inte';
      const r = b.getBoundingClientRect();
      const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      if (el && b.contains(el)) return null;
      return el ? `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/).join('.')}` : ''}` : 'ingenting';
    }, selector);
    if (cover) throw new Error(`${what} nås inte: ${cover}`);
    await pg.tap(selector, { timeout: T.step });
  };
  await check('kombinationsmatris: fel mitt i en session ger besked och sidan återhämtar sig (#891)', async () => {
    const { tp, tctx, errs } = await touchPage();
    const notes = [];
    try {
      // 1. Källregistret svarar 503 först efter att sidan har fungerat: Om källorna ger besked, och nästa öppning går igenom
      await tp.goto(`${BASE}?ny=mf1#y=1943`);
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      const openSources = async () => {
        if (!(await tp.isVisible('#btn-sources'))) {
          if (await tp.isVisible('#more-toggle')) await tp.tap('#more-toggle'); else if (await tp.isVisible('#btn-more')) await tp.tap('#btn-more');
        }
        await tapReal(tp, '#btn-sources', 'Källor');
      };
      await tp.route('**/data/sources.json*', r => r.fulfill({ status: 503, body: 'nere' }));
      await openSources();
      await tp.waitForFunction(() => /kunde inte laddas/.test(document.getElementById('sources-dialog')?.textContent ?? ''), null, { timeout: T.step });
      await tp.unroute('**/data/sources.json*');
      await tapReal(tp, '#sources-close', 'Stäng i Om källorna');
      await tp.waitForSelector('#sources-dialog', { state: 'hidden', timeout: T.step });
      await openSources();
      await tp.waitForFunction(() => document.querySelectorAll('#sources-dialog a[href^="http"]').length > 20, null, { timeout: T.load });
      await tapReal(tp, '#sources-close', 'Stäng i Om källorna');
      notes.push('källregistret: besked vid 503, listan vid nästa öppning');
      // 2. En händelsebild som felar i ett lektionssteg, på mobil: raden syns, och turen går vidare utan att kortet har tappats bort
      await tp.route(u => /images\/events\/slaget-vid-stalingrad\.webp/.test(u.href), r => r.fulfill({ status: 404, body: '' }));
      await tp.goto(`${BASE}?ny=mf2#t=andra-varldskriget&m=lektion&s=stalingrad`);
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await tp.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
      await tp.getByRole('button', { name: /Läs om händelsen/ }).first().tap({ timeout: T.step });
      await tp.waitForSelector('#detail:not([hidden])', { state: 'visible', timeout: T.step });
      if (await tp.evaluate(() => document.getElementById('detail').dataset.sheet === 'half')) {
        await tp.focus('#detail-handle');
        await tp.keyboard.press('ArrowUp');
      }
      await tp.waitForSelector('#detail .detail-fig.is-missing', { state: 'attached', timeout: T.step });
      await tapReal(tp, '#detail .detail-close', 'Stäng i faktarutan');
      await tp.waitForSelector('#detail', { state: 'hidden', timeout: T.step });
      if (!(await tp.isVisible('#tour-card'))) throw new Error('turkortet försvann efter ett bildfel i faktarutan');
      notes.push('bildfel i lektionssteget: raden syns och Stäng ger tillbaka kortet');
      // 3. Samma utfällda faktaruta i lärarens version, där bandet är högre: Mer/Meny får inte täcka Stäng (#891, del 2)
      await tp.goto(`${BASE}?ny=mf4#t=andra-varldskriget&m=lektion&r=lararen&s=stalingrad`);
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await tp.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
      await tp.getByRole('button', { name: /Läs om händelsen/ }).first().tap({ timeout: T.step });
      await tp.waitForSelector('#detail:not([hidden])', { state: 'visible', timeout: T.step });
      if (await tp.evaluate(() => document.getElementById('detail').dataset.sheet === 'half')) {
        await tp.focus('#detail-handle');
        await tp.keyboard.press('ArrowUp');
      }
      await tapReal(tp, '#detail .detail-close', 'Stäng i den utfällda faktarutan (lärarens lektionsläge)');
      await tp.waitForSelector('#detail', { state: 'hidden', timeout: T.step });
      notes.push('utfälld faktaruta: Stäng nås i elevens och lärarens lektionsläge');
      if (errs.length) throw new Error(`sidfel: ${errs.join('; ')}`);
      return notes.join('; ');
    } finally {
      await tctx.close();
    }
  });
  // Skolflödet (#742, #862): fråga → underlag → svar → återgång, med pekning i samma vy, utan att något täcker eller tappas.
  await check('kombinationsmatris: skolflödet fråga, underlag, svar och återgång med pekning (#891)', async () => {
    const { tp, tctx, errs } = await touchPage();
    try {
      await tp.goto(`${BASE}?ny=mf3#t=andra-varldskriget&m=lektion&s=storbritannien`);
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await tp.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
      const stepOf = () => tp.evaluate(() => (document.getElementById('tour-progress')?.textContent ?? '').trim());
      const first = await stepOf();
      // Fråga: stegets "Att fundera på" syns på kortet
      if (!(await tp.isVisible('#tour-question'))) throw new Error('stegets fråga saknas på kortet');
      // Underlag: Läs om händelsen öppnar faktarutan ovanpå kortet, med Stäng nåbar
      await tp.getByRole('button', { name: /Läs om händelsen/ }).first().tap({ timeout: T.step });
      await tp.waitForSelector('#detail:not([hidden])', { state: 'visible', timeout: T.step });
      const note = await tp.evaluate(() => document.querySelector('#detail')?.textContent ?? '');
      if (note.trim().length < 80) throw new Error('underlaget i faktarutan är tomt');
      // Svar: Stäng ger tillbaka frågan på samma steg
      await tapReal(tp, '#detail .detail-close', 'Stäng i faktarutan');
      await tp.waitForSelector('#detail', { state: 'hidden', timeout: T.step });
      if ((await stepOf()) !== first) throw new Error(`steget byttes av underlaget: "${first}" → "${await stepOf()}"`);
      // Återgång: Nästa och Föregående med pekning, och steget är det man kom från
      await tapReal(tp, '#tour-next', 'Nästa');
      await tp.waitForFunction(s => (document.getElementById('tour-progress')?.textContent ?? '').trim() !== s, first, { timeout: T.step });
      await tapReal(tp, '#tour-back', 'Föregående');
      await tp.waitForFunction(s => (document.getElementById('tour-progress')?.textContent ?? '').trim() === s, first, { timeout: T.step });
      if (errs.length) throw new Error(`sidfel: ${errs.join('; ')}`);
      return `fråga → underlag (${note.trim().length} tecken) → Stäng → Nästa → Föregående tillbaka på "${first}", allt med pekning`;
    } finally {
      await tctx.close();
    }
  });

  // #884: en bild som svarar 404 ska ge en kort rad i faktarutan, inte en tom bildyta som ser trasig ut.
  await check('en bild som inte laddas ersätts av en rad i faktarutan (#884)', async () => {
    const ip = await context.newPage();
    const errs = [];
    ip.on('pageerror', e => errs.push(e.message));
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await ip.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await ip.route(u => isFont(u.href), r => r.abort());
      }
      let broken = true;
      await ip.route(u => /images\/events\/slaget-vid-stalingrad\.webp/.test(u.href), r => (broken ? r.fulfill({ status: 404, body: '' }) : r.continue()));
      let loads = 0;
      const openEvent = async (year, id) => {
        await ip.goto(`${BASE}?ny=22${loads++}#y=${year}`); // ny sida varje gång, så att adressen inte bara byter fragment
        await ip.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        if (await ip.isHidden('#panel')) await ip.click('#btn-panel');
        await ip.locator(`#event-list .event-btn[data-id="${id}"]`).first().click({ timeout: T.step });
      };
      await openEvent(1943, 'slaget-vid-stalingrad');
      // I mobilens halva läge är bilden dold och hämtas inte (loading=lazy); fäll ut kortet som en användare (pil upp på handtaget)
      if (await ip.evaluate(() => document.getElementById('detail').dataset.sheet === 'half')) {
        await ip.focus('#detail-handle');
        await ip.keyboard.press('ArrowUp');
      }
      await ip.waitForSelector('#detail .detail-fig.is-missing', { state: 'attached', timeout: T.step });
      const got = await ip.evaluate(() => {
        const fig = document.querySelector('#detail .detail-fig');
        const img = fig.querySelector('img');
        const note = fig.querySelector('.fig-missing');
        return { imgShown: img.getClientRects().length > 0, note: note?.textContent.trim() ?? '', noteShown: !!note && note.getClientRects().length > 0, height: Math.round(fig.getBoundingClientRect().height), caption: !!fig.querySelector('.fig-caption')?.textContent.trim() };
      });
      if (got.imgShown) throw new Error('den trasiga bilden visas fortfarande');
      if (!got.noteShown || !/kunde inte laddas/.test(got.note)) throw new Error(`raden saknas eller är fel: "${got.note}"`);
      if (got.height > 160) throw new Error(`figuren är ${got.height} px hög och ser fortfarande ut som en bildyta`);
      if (!got.caption) throw new Error('bildtexten försvann');
      // Samma händelse när bilden finns: den visas som förut
      broken = false;
      await openEvent(1943, 'slaget-vid-stalingrad');
      if (await ip.evaluate(() => document.getElementById('detail').dataset.sheet === 'half')) {
        await ip.focus('#detail-handle');
        await ip.keyboard.press('ArrowUp');
      }
      await ip.waitForSelector('#detail .detail-fig img', { state: 'visible', timeout: T.step });
      await ip.waitForFunction(() => { const i = document.querySelector('#detail .detail-fig img'); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: T.step });
      if (await ip.locator('#detail .detail-fig.is-missing').count()) throw new Error('en bild som laddas märktes som saknad');
      if (errs.length) throw new Error(`sidfel: ${errs.join('; ')}`);
      return `404 ger raden "${got.note}" (figuren ${got.height} px, bildtexten kvar); en bild som laddas visas som förut`;
    } finally {
      await ip.close();
    }
  });
  // Quizet (#65): tre svar ur datan, rätt eller fel med årtal och källor, nästa fråga, bara tangentbord och Escape
  await check('quizet ställer frågor ur fun facts och går att svara på med tangentbordet (#65)', async () => {
    // Fallerar kontrollen stängs quizet, så att rutan inte täcker sidan för kontrollerna efter
    try { return await quizCheck(); } catch (err) { if (await page.isVisible('#quiz')) await page.keyboard.press('Escape'); throw err; }
  });
  async function quizCheck() {
    await clickView('#btn-quiz');
    await visible('#quiz');
    if ((await page.textContent('#quiz-event-title')).trim() === '') throw new Error('frågan saknar händelse');
    if (await page.locator('#quiz-options button').count() !== 3) throw new Error('frågan har inte tre svar');
    const wide = await page.evaluate(() => document.scrollingElement.scrollWidth > innerWidth + 1);
    if (wide) throw new Error('quizet ger horisontell scroll');
    // Fokus står på första svaret; Enter svarar
    const onOption = await page.waitForFunction(() => document.activeElement?.classList.contains('quiz-option'), null, { timeout: 2000 }).then(() => true, () => false);
    if (!onOption) throw new Error('fokus står inte på ett svar när frågan öppnas');
    await page.keyboard.press('Enter');
    await visible('#quiz-result');
    if (!(await page.textContent('#quiz-verdict')).trim()) throw new Error('svaret säger inte rätt eller fel');
    if (await page.locator('#quiz-options .is-answer').count() !== 1) throw new Error('rätt svar markeras inte');
    if (await page.locator('#quiz-options .quiz-option-time:visible').count() !== 3) throw new Error('årtalen visas inte efter svaret');
    await page.waitForFunction(() => document.querySelectorAll('#quiz-sources li a').length > 0, null, { timeout: T.step });
    if (!/ av 1|1 /.test(await page.textContent('#quiz-score'))) throw new Error(`poängen visar ${await page.textContent('#quiz-score')}`);
    const onNext = await page.evaluate(() => document.activeElement?.id === 'quiz-next');
    if (!onNext) throw new Error('fokus går inte till Nästa fråga efter svaret');
    await page.keyboard.press('Enter');
    await hidden('#quiz-result');
    if (await page.locator('#quiz-options button:disabled').count()) throw new Error('nästa fråga har låsta svar');
    // #846: den andra frågan är Sant eller myt? ur missuppfattningarna, två svar, facit med ursprung och källor, ingen poäng
    if ((await page.textContent('#quiz-title')).trim() !== 'Sant eller myt?') throw new Error(`andra frågan är inte Sant eller myt: ${await page.textContent('#quiz-title')}`);
    if (await page.locator('#quiz-options button').count() !== 2) throw new Error('Sant eller myt har inte två svar');
    if (!(await page.textContent('#quiz-event-title')).trim()) throw new Error('Sant eller myt saknar påstående');
    if ((await page.textContent('#quiz-event .intro-event-label')).trim() !== 'Påståendet') throw new Error('etiketten säger inte Påståendet');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // det andra svaret, Myt
    await visible('#quiz-result');
    if ((await page.textContent('#quiz-verdict')).trim() !== 'Rätt, det är en myt.') throw new Error(`facit säger ${await page.textContent('#quiz-verdict')}`);
    if (!(await page.textContent('#quiz-funfact')).trim() || !(await page.isVisible('#quiz-origin'))) throw new Error('vad källorna säger eller varifrån myten kommer saknas');
    await page.waitForFunction(() => document.querySelectorAll('#quiz-sources li').length > 0, null, { timeout: T.step });
    if (!/ av 1|1 /.test(await page.textContent('#quiz-score'))) throw new Error(`Sant eller myt räknades i poängen: ${await page.textContent('#quiz-score')}`);
    await page.keyboard.press('Enter'); // Nästa fråga: en tidsfråga ur data/quiz.json (#846)
    await page.waitForFunction(() => /^(Vad kom först\?|Vad låg närmast i tid\?)$/.test(document.getElementById('quiz-title').textContent.trim()), null, { timeout: T.step });
    if (await page.isVisible('#quiz-origin')) throw new Error('mytens ursprung står kvar på nästa fråga');
    if (await page.isVisible('#quiz-event') && (await page.textContent('#quiz-event .intro-event-label')).trim() !== 'Händelsen') throw new Error('etiketten står kvar som Påståendet på nästa fråga');
    if (await page.locator('#quiz-options button').count() !== 2) throw new Error('tidsfrågan har inte två svar');
    if (await page.locator('#quiz-options .quiz-option-time:visible').count()) throw new Error('årtalen syns före svaret');
    await page.keyboard.press('Enter');
    await visible('#quiz-result');
    if (await page.locator('#quiz-options .quiz-option-time:visible').count() !== 2) throw new Error('årtalen visas inte efter svaret på tidsfrågan');
    if (!/\d+ år/.test(await page.textContent('#quiz-funfact'))) throw new Error(`facit räknar inte ut avståndet: ${await page.textContent('#quiz-funfact')}`);
    await page.waitForFunction(() => document.querySelectorAll('#quiz-sources li').length > 0, null, { timeout: T.step });
    if (!/ av 2|2 /.test(await page.textContent('#quiz-score'))) throw new Error(`tidsfrågan räknades inte i poängen: ${await page.textContent('#quiz-score')}`);
    await page.keyboard.press('Escape');
    await hidden('#quiz');
    const back = await page.evaluate(() => document.activeElement?.id);
    if (!['btn-quiz', 'btn-more', 'more-toggle'].includes(back)) throw new Error(`fokus gick till ${back} efter Escape`);
    return 'tre svar, Enter svarar, årtal och källor efter svaret, Nästa fråga, Sant eller myt med facit utan poäng och en tidsfråga med uträknat avstånd (#846), Escape och fokus tillbaka';
  }

  await check('en guidad tur går att spela steg för steg och återställer lagren (#47)', async () => {
    const layersOn = () => page.evaluate(() => [...document.querySelectorAll('#layer-menu input[data-layer]')].filter(i => i.checked).map(i => i.dataset.layer).sort().join(','));
    const before = await layersOn();
    await clickView('#btn-tour');
    await visible('#tour-menu');
    await page.click('#tour-menu .tour-pick[data-tour="tre-platser-1325"]');
    await visible('#tour-card');
    const progress = () => page.textContent('#tour-progress').then(s => s.trim());
    if ((await progress()) !== 'Steg 1 av 3') throw new Error(`turen började på ${await progress()}`);
    if ((await year()) !== '1324') throw new Error(`turens första steg står på ${await year()} i stället för 1324`);
    await visible('#pause-note');
    if (!(await page.textContent('#pause-text')).includes('Turen:')) throw new Error('pausraden visar inte turen');
    if ((await layersOn()) !== 'areas,events') throw new Error(`stegets lager är ${await layersOn()} i stället för areas,events`);
    await page.click('#tour-next');
    if ((await progress()) !== 'Steg 2 av 3') throw new Error('Nästa gick inte till steg 2');
    // En framåtknapp och en avsluta-knapp (#999): pausraden har ingen Fortsätt eller Avsluta, och tidsradens steg- och spelknappar är avstängda
    for (const sel of ['#pause-go']) if (await page.isVisible(sel)) throw new Error(`${sel} syns i en tur (dubblett av turkortet)`);
    if (!(await page.isDisabled('#btn-play'))) throw new Error('spelknappen är inte avstängd medan turen styr tiden');
    await page.click('#tour-next');
    await page.waitForFunction(() => document.getElementById('tour-progress').textContent.includes('3 av 3'), null, { timeout: T.step });
    if ((await year()) !== '1325') throw new Error(`sista steget står på ${await year()} i stället för 1325`);
    if (await page.isVisible('#funfact')) throw new Error('Samtidigt-kortet syns ovanpå turens kort');
    await page.click('#tour-back');
    if ((await progress()) !== 'Steg 2 av 3') throw new Error('Föregående gick inte tillbaka');
    await page.click('#tour-close');
    await hidden('#tour-card');
    if ((await layersOn()) !== before) throw new Error(`lagren återställdes inte: ${await layersOn()} i stället för ${before}`);
    return 'tre steg med år, lager och paus; Nästa är enda framåtknappen; Föregående och Avsluta fungerar';
  });

  // #1280: fall-turerna står under en egen rubrik i Turer-menyn, och turkortet har en stegindikator, en större statusmarkör,
  // en Nästa-knapp på minst 44 px och en förklaring till varför tidsknapparna är låsta.
  await check('Turer-menyn grupperar fall-turerna, och turkortet har stegindikator och större markör (#1280)', async () => {
    const startYear = Number(await page.getAttribute('#track', 'aria-valuenow'));
    const speedTitle = await page.getAttribute('#btn-speed', 'title');
    await clickView('#btn-tour');
    await visible('#tour-menu');
    const rows = await page.evaluate(() => [...document.querySelectorAll('#tour-list > li')].map(li => (
      li.querySelector('.tour-group-title') ? `#${li.querySelector('.tour-group-title').textContent.trim()}` : li.querySelector('.tour-pick')?.dataset.tour)));
    const at = rows.findIndex(r => String(r).startsWith('#'));
    if (at < 1 || rows.filter(r => String(r).startsWith('#')).length !== 1) throw new Error(`Turer-menyn har ingen enda grupprubrik efter de övriga turerna: ${rows.join(', ')}`);
    if (rows[at] !== '#Hur föll det?') throw new Error(`grupprubriken heter ${rows[at]}`);
    const falls = rows.slice(at + 1);
    if (falls.join() !== 'vastroms-fall,hanrikets-fall,songhairikets-fall') throw new Error(`under rubriken står ${falls.join(', ')}`);
    if (rows.slice(0, at).some(r => /-fall$/.test(r))) throw new Error('en fall-tur står före rubriken');
    if (await page.locator('#tour-list > li[role="presentation"]').count() !== 1) throw new Error('rubrikraden ska vara role=presentation');

    await page.click('#tour-menu .tour-pick[data-tour="hanrikets-fall"]');
    await visible('#tour-card');
    const total = Number((await page.textContent('#tour-progress')).match(/av (\d+)/)[1]);
    const meter = () => page.evaluate(() => {
      const m = document.getElementById('tour-meter');
      return { n: m.children.length, done: m.querySelectorAll('.is-done').length, current: [...m.children].findIndex(c => c.classList.contains('is-current')), hidden: m.getAttribute('aria-hidden') };
    });
    let m = await meter();
    if (m.n !== total || m.current !== 0 || m.done !== 0 || m.hidden !== 'true') throw new Error(`stegindikatorn i steg 1: ${JSON.stringify(m)}, väntade ${total} streck`);
    await page.click('#tour-next');
    m = await meter();
    if (m.current !== 1 || m.done !== 1) throw new Error(`stegindikatorn i steg 2: ${JSON.stringify(m)}`);
    await page.click('#tour-back');
    m = await meter();
    if (m.current !== 0 || m.done !== 0) throw new Error(`stegindikatorn efter Föregående: ${JSON.stringify(m)}`);

    const next = await page.locator('#tour-next').boundingBox();
    if (!next || next.height < 43.5) throw new Error(`Nästa är ${next?.height} px hög, ska vara minst 44`);
    const marker = await page.evaluate(() => {
      const st = document.getElementById('tour-status'), cs = getComputedStyle(st, '::before');
      return { shown: !st.hidden, w: parseFloat(cs.width), h: parseFloat(cs.height), border: cs.borderTopStyle };
    });
    if (!marker.shown || marker.w < 12 || marker.h < 12) throw new Error(`statusmarkören är ${marker.w}×${marker.h} px, ska vara minst 12`);

    // Förklaringen till de låsta tidsknapparna: på pausraden och som hovertext på knapparna
    if (!(await page.textContent('#pause-text')).includes('Turen styr tiden')) throw new Error('pausraden förklarar inte att turen styr tiden');
    const locked = await page.evaluate(() => [...document.querySelectorAll('.timebar .controls .step[data-step]')].map(b => ({ title: b.title, off: b.disabled })));
    if (!locked.length || locked.some(b => b.title !== 'Turen styr tiden' || !b.off)) throw new Error(`de låsta stegknapparnas hovertext och låsning: ${JSON.stringify(locked)}`);

    await page.click('#tour-close');
    await hidden('#tour-card');
    if ((await page.getAttribute('#btn-speed', 'title')) !== speedTitle) throw new Error('hastighetsknappens egen hovertext kom inte tillbaka efter turen');
    if (await page.evaluate(() => [...document.querySelectorAll('.timebar .controls .step')].some(b => b.title === 'Turen styr tiden'))) throw new Error('en stegknapp säger fortfarande att turen styr tiden efter turen');
    if (await page.evaluate(() => [...document.querySelectorAll('.timebar .controls .step, #btn-play')].some(b => b.hasAttribute('data-before-tour')))) throw new Error('tidsknapparna har kvar spåret efter turen');
    await jumpTo(startYear);
    return `rubriken "Hur föll det?" med ${falls.length} turer, ${total} streck i stegindikatorn, Nästa ${Math.round(next.height)} px, markör ${marker.w} px och förklaringen i pausraden och på stegknapparna`;
  });

  await check('krigets första kort startar berättelsen med kapitel och frågor (#247)', async () => {
    const startYear = Number(await page.getAttribute('#track', 'aria-valuenow'));
    await clickView('#btn-focus');
    await page.fill('#focus-menu input', 'Första världskriget');
    await page.click('#focus-menu [data-key="war:forsta-varldskriget"]');
    const start = page.locator('#detail .story-tour[data-tour="forsta-varldskriget"]');
    await start.waitFor({ state: 'visible', timeout: T.step });
    await start.click();
    await visible('#tour-card');
    if (!(await page.isVisible('#tour-chapter'))) throw new Error('första steget visar inget kapitel');
    if ((await page.textContent('#tour-chapter')).trim() !== 'Hur kriget började') throw new Error('fel kapitel i första steget');
    await page.click('#tour-next');
    if (!(await page.isVisible('#tour-question'))) throw new Error('andra steget visar ingen fråga');
    if (!(await page.textContent('#tour-question')).includes('Att fundera på')) throw new Error('frågan saknar rubrik');
    await page.click('#tour-close');
    await hidden('#tour-card');
    // Turen återställer fokus på kriget; lämna sidan som den var
    if (!(await page.evaluate(() => document.getElementById('focus-bar').hidden))) await page.click('#focus-exit');
    await page.$eval('#focus-menu input', el => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });
    if (await page.isVisible('#detail')) await page.click('#detail [data-close]');
    await jumpTo(startYear);
    return 'Följ berättelsen i krigets kort; kapitel i steg 1 och fråga i steg 2; Avsluta återställer fokus';
  });

  await check('slutkortet visar det viktigaste att ta med sig med källa per punkt (#500)', async () => {
    const startYear = Number(await page.getAttribute('#track', 'aria-valuenow'));
    await clickView('#btn-focus');
    await page.fill('#focus-menu input', 'Första världskriget');
    await page.click('#focus-menu [data-key="war:forsta-varldskriget"]');
    // Fokusläget flyttar först tiden till krigets början; först därefter går End till krigets slut
    await page.waitForFunction(() => document.getElementById('track').getAttribute('aria-valuenow') === '1914', null, { timeout: T.step });
    const box = await page.locator('#track').boundingBox();
    await page.mouse.click(box.x + box.width - 1, box.y + box.height / 2); // längst till höger: krigets slut
    await page.waitForFunction(() => document.getElementById('track').getAttribute('aria-valuenow') === '1918', null, { timeout: T.step });
    await page.click('#focus-action');
    await visible('.takeaway-box');
    const heads = await page.$$eval('.takeaway-head', h => h.map(x => x.textContent.trim()));
    const want = ['Det här vet vi från källorna', 'Här är forskare inte överens', 'Det här vet vi inte säkert'];
    if (heads.join('|') !== want.join('|')) throw new Error(`rubrikerna är ${heads.join(', ')}`);
    const items = await page.$$eval('.takeaways li', l => l.map(li => !!li.querySelector('.takeaway-src a')));
    if (!items.length || items.includes(false)) throw new Error('en punkt saknar egen källa');
    await page.click('#focus-exit');
    await page.waitForFunction(() => document.getElementById('focus-bar').hidden, null, { timeout: T.step });
    // Lämna sidan som den var för nästa kontroll: tom sökruta i Fokus och samma år som före kontrollen
    await page.$eval('#focus-menu input', el => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });
    if (await page.isVisible('#detail')) await page.click('#detail [data-close]');
    await jumpTo(startYear);
    return `${items.length} punkter under tre rubriker, var och en med källa`;
  });

  // #1148: faktarutan och markörens skärmläsartext skiljer flagga, symbol och modern återgivning. Japans flagga
  // görs här till en modern återgivning (bara i testet), Osmanska riket har en vanlig flagga och Rom bara en symbol.
  await check('rikets tecken: flagga, symbol eller modern återgivning (#1148)', async () => {
    const lp = await context.newPage();
    const errs = [];
    lp.on('pageerror', e => errs.push(e.message));
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await lp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await lp.route(u => isFont(u.href), r => r.abort());
      }
      await lp.route(u => /\/data\/genererat\/riken\.json(\?|$)/.test(u.pathname + u.search), async route => {
        const res = await route.fetch();
        const doc = await res.json();
        for (const f of doc.groups.find(g => g.id === 'japanska-imperiet')?.flags ?? []) f.kind = 'reconstruction';
        await route.fulfill({ response: res, json: doc });
      });
      const open = async (year, id, search) => {
        await lp.goto(`${BASE}?ny=1148#y=${year}`);
        await lp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        if (vp.width <= 760) await lp.click('#more-toggle');
        await lp.click('#btn-focus');
        await lp.fill('#focus-menu input', search);
        await lp.click(`#focus-menu [data-key="empire:${id}"]`);
        await lp.waitForSelector('#detail h3', { state: 'visible', timeout: T.step });
        return lp.evaluate(() => {
          const year = Number(document.getElementById('track').getAttribute('aria-valuenow'));
          const line = document.querySelector('#detail .symbol-kind');
          return { year, kind: line?.dataset.symbolKind ?? null, text: line?.textContent ?? '',
            marks: [...document.querySelectorAll('[aria-label]')].map(el => el.getAttribute('aria-label')).filter(l => /^[^:]+: (rikets|modern återgivning)/.test(l)) };
        });
      };
      const japan = await open(1900, 'japanska-imperiet', 'Japanska');
      const japanWant = japan.year >= 1870 && japan.year <= 1945 ? 'reconstruction' : 'symbol';
      if (japan.kind !== japanWant) throw new Error(`Japan ${japan.year}: raden är ${japan.kind}, inte ${japanWant}`);
      if (japanWant === 'reconstruction' && !/^Modern återgivning/.test(japan.text)) throw new Error(`fel text för modern återgivning: "${japan.text}"`);
      if (japanWant === 'reconstruction' && !japan.marks.some(l => /modern återgivning av rikets symbol/.test(l))) throw new Error(`markören säger inte modern återgivning: ${japan.marks.join(' | ')}`);
      const ottoman = await open(1900, 'osmanska-riket', 'Osmanska');
      const ottoWant = ottoman.year >= 1793 && ottoman.year <= 1922 ? 'flag' : 'symbol';
      if (ottoman.kind !== ottoWant) throw new Error(`Osmanska riket ${ottoman.year}: raden är ${ottoman.kind}, inte ${ottoWant}`);
      if (ottoWant === 'flag' && !/^Flagga/.test(ottoman.text)) throw new Error(`fel text för flagga: "${ottoman.text}"`);
      const rome = await open(100, 'romarriket', 'Rom: kungadöme');
      if (rome.kind !== 'symbol' || !/inte en flagga/.test(rome.text)) throw new Error(`Rom: raden är ${rome.kind} "${rome.text}", inte symbol`);
      const han = await open(100, 'hanriket', 'Hanriket');
      if (han.kind !== null) throw new Error('Hanriket har ingen symbol men får en rad om tecknet');
      if (errs.length) throw new Error(`sidfel: ${errs.join('; ')}`);
      return `Japan ${japan.year}: ${japan.kind}, Osmanska riket ${ottoman.year}: ${ottoman.kind}, Rom: symbol, Hanriket: ingen rad`;
    } finally {
      await lp.close();
    }
  });

  // Styrplattans nypning i Chrome är wheel med ctrlKey. Står pekaren på en etikett eller ett kluster ovanpå klotet
  // ska globen zooma och sidan inte; tidigare släppte etiketterna igenom händelsen och Chrome zoomade hela sidan.
  await check('nypning på en etikett zoomar globen, inte sidan', async () => {
    const lp = await context.newPage();
    const errs = [];
    lp.on('pageerror', e => errs.push(e.message));
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await lp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await lp.route(u => isFont(u.href), r => r.abort());
      }
      await lp.goto(`${BASE}?c=-30,170,2#y=1293`);
      await lp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await lp.waitForFunction(() => [...document.querySelectorAll('#labels .glabel, #labels .gcluster')]
        .some(e => e.offsetParent && e.getBoundingClientRect().width > 0), null, { timeout: T.step });
      const out = await lp.evaluate(() => {
        const el = [...document.querySelectorAll('#labels .glabel, #labels .gcluster')]
          .find(e => e.offsetParent && e.getBoundingClientRect().width > 0);
        const r = el.getBoundingClientRect();
        const ev = new WheelEvent('wheel', { deltaY: -40, ctrlKey: true, bubbles: true, cancelable: true, clientX: r.x + 4, clientY: r.y + 4 });
        el.dispatchEvent(ev);
        return { cls: el.className, prevented: ev.defaultPrevented };
      });
      if (!out.prevented) throw new Error(`nypning på ${out.cls} släpps igenom: Chrome zoomar hela sidan`);
      if (errs.length) throw new Error(`sidfel: ${errs.join('; ')}`);
      return `nypning på ${out.cls} fångas av globen`;
    } finally {
      await lp.close();
    }
  });

  // #1193: nutida staters flaggor (modernState) syns på globen bara vid nära zoom, utzoomat står namnet. Sverige
  // (svenska-stormaktsvaldet) räknas inte som nutida stat och behåller flaggan utzoomat.
  await check('nutida staters flaggor bara vid nära zoom (#1193)', async () => {
    const lp = await context.newPage();
    const errs = [];
    lp.on('pageerror', e => errs.push(e.message));
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await lp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await lp.route(u => isFont(u.href), r => r.abort());
      }
      await lp.goto(`${BASE}?c=18,-70,1#y=2000`);
      await lp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      const modern = new Set(['Bahamas', 'Jamaica', 'Trinidad och Tobago', 'Barbados', 'Grenada', 'Saint Lucia', 'Antigua och Barbuda',
        'Saint Kitts och Nevis', 'Kanada', 'Colombia', 'Peru', 'Bolivia', 'Chile', 'Argentina', 'Uruguay', 'Costa Rica', 'Guatemala', 'Honduras']);
      const flags = () => lp.evaluate(() => [...document.querySelectorAll('button[aria-label*="rikets flagga"]')]
        .filter(e => e.offsetParent && getComputedStyle(e).visibility !== 'hidden').map(e => e.getAttribute('aria-label').split(':')[0]));
      await lp.waitForTimeout(1500);
      const out = await flags();
      if (out.some(n => modern.has(n))) throw new Error(`utzoomat syns nutida flaggor: ${out.join(', ')}`);
      if (vp.width <= 760) return `utzoomat ${out.length} flaggor och inga nutida (mobilbredd: inget mushjul, zoomsteget prövas i datorbredd)`;
      const size = lp.viewportSize();
      await lp.mouse.move(size.width / 2, size.height * 0.6);
      for (let i = 0; i < 12; i++) { await lp.mouse.wheel(0, -300); await lp.waitForTimeout(80); }
      await lp.waitForFunction(names => [...document.querySelectorAll('button[aria-label*="rikets flagga"]')]
        .some(e => e.offsetParent && getComputedStyle(e).visibility !== 'hidden' && names.includes(e.getAttribute('aria-label').split(':')[0])),
        [...modern], { timeout: T.step });
      const inside = (await flags()).filter(n => modern.has(n));
      if (errs.length) throw new Error(`sidfel: ${errs.join('; ')}`);
      return `utzoomat ${out.length} flaggor och inga nutida; inzoomat ${inside.join(', ')}`;
    } finally {
      await lp.close();
    }
  });

  await check('rikets faktaruta startar turen om rikets fall med status per steg (#499)', async () => {
    const startYear = Number(await page.getAttribute('#track', 'aria-valuenow'));
    await clickView('#btn-focus');
    await page.fill('#focus-menu input', 'Hanriket');
    await page.click('#focus-menu [data-key="empire:hanriket"]');
    const start = page.locator('#detail .story-tour[data-tour="hanrikets-fall"]');
    await start.waitFor({ state: 'visible', timeout: T.step });
    await start.click();
    await visible('#tour-card');
    if (!(await page.isVisible('#tour-status'))) throw new Error('första steget visar ingen status');
    // Märkningen följer regeln i #1278: källor som skiljer sig ger omtvistat (Gula turbanerna, arméerna vid Röda klipporna)
    if ((await page.textContent('#tour-status')).trim() !== 'Här är forskare inte överens') throw new Error('fel status i första steget');
    for (let i = 0; i < 4; i++) await page.click('#tour-next');
    if ((await page.textContent('#tour-status')).trim() !== 'Här är forskare inte överens') throw new Error('steget om arméernas storlek är inte märkt som omtvistat');
    await page.click('#tour-close');
    await hidden('#tour-card');
    if (!(await page.evaluate(() => document.getElementById('focus-bar').hidden))) await page.click('#focus-exit');
    await page.$eval('#focus-menu input', el => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });
    if (await page.isVisible('#detail')) await page.click('#detail [data-close]');
    await jumpTo(startYear);
    return 'Följ fallet i rikets ruta; status i steg 1 och okänt i steg 5';
  });

  // #627: i mobilen hamnade arket med krigets slutkort bakom fokusraden när raden "Tiden flyttades" och
  // pausraden syntes samtidigt, eftersom en mobilregel för --ff-b vann över den uppmätta fokusraden.
  await check('krigets slutkort ligger ovanför fokusraden (#627)', async () => {
    const startYear = Number(await page.getAttribute('#track', 'aria-valuenow'));
    await clickView('#btn-focus');
    await page.fill('#focus-menu input', 'Koreakriget');
    await page.click('#focus-menu [data-key="war:koreakriget"]');
    await page.waitForFunction(() => document.getElementById('track').getAttribute('aria-valuenow') === '1950', null, { timeout: T.step });
    const box = await page.locator('#track').boundingBox();
    await page.mouse.click(box.x + box.width - 1, box.y + box.height / 2); // krigets slut
    await page.waitForFunction(() => document.getElementById('track').getAttribute('aria-valuenow') === '1953', null, { timeout: T.step });
    await page.click('#focus-action');
    await visible('#detail');
    await page.waitForFunction(() => !document.getElementById('pause-note').hidden, null, { timeout: T.step });
    const r = await page.evaluate(() => {
      const d = document.getElementById('detail').getBoundingClientRect(), f = document.getElementById('focus-bar').getBoundingClientRect();
      return { detailBottom: Math.round(d.bottom), barTop: Math.round(f.top), moved: document.getElementById('app').classList.contains('focus-moved-on') };
    });
    if (r.detailBottom > r.barTop) throw new Error(`arket slutar vid ${r.detailBottom} px men fokusraden börjar vid ${r.barTop} px`);
    await page.click('#focus-exit');
    await page.waitForFunction(() => document.getElementById('focus-bar').hidden, null, { timeout: T.step });
    await page.$eval('#focus-menu input', el => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });
    if (await page.isVisible('#detail')) await page.click('#detail [data-close]');
    await jumpTo(startYear);
    return `arket slutar vid ${r.detailBottom} px, fokusraden börjar vid ${r.barTop} px${r.moved ? ' (med raden Tiden flyttades)' : ''}`;
  });

  // Teman (#398): ett testtema ersätter data/teman.json via route, så inget riktigt tema behövs. Egen sida, eftersom
  // temana laddas en gång per sidladdning.
  await check('tema hittas och lämnas, har lugna tomlägen och ryms i mobil (#398, #1113)', async () => {
    const { tp, tctx, errs } = await touchPage();
    const ids = ['sintashta-stridsvagnar', 'rhind-papyrusen', 'plimpton-322', 'babyloniska-astronomiska-dagbocker',
      'fyren-pa-faros', 'dujiangyan', 'eratosthenes-mater-jordens-omkrets', 'aldsta-langa-rakningen-chiapa-de-corzo',
      'cai-lun-papper', 'zhang-hengs-seismoskop', 'aryabhatiya', 'gutenberg'];
    const tx = v => ({ sv: v, en: v, de: v, es: v, fr: v });
    const doc = { schema: 'historia-globen/teman@1', themes: [{ id: 'testtema', name: tx('Testtema'), intro: tx('Ett urval för testet.'), events: ids, sources: [], review: 'source-checked' }] };
    try {
      await tp.route('**/data/teman.json*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(doc) }));
      const listed = () => tp.evaluate(() => [...document.querySelectorAll('#event-list .event-btn')].map(b => b.dataset.id));
      // 1. Länken #f=theme:<id> startar temat; bara temats händelser syns
      await tp.goto(`${BASE}?ny=tema1#y=120&f=theme:testtema`);
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await tp.waitForFunction(() => !document.getElementById('focus-bar').hidden && /Testtema/.test(document.getElementById('focus-title').textContent), null, { timeout: T.step });
      await tp.waitForSelector('#detail', { state: 'visible', timeout: T.step });
      if (!/Ett urval för testet/.test(await tp.textContent('#detail'))) throw new Error('introduktionskortet visar inte temats text');
      if (!/oavsett.*kategor/i.test(await tp.textContent('#detail'))) throw new Error('introduktionskortet förklarar inte kategorifiltret');
      // #1138: #detail är inte aria-live (hela kortet byts via innerHTML och lästes om); temakortet annonseras i stället
      // av att fokus flyttas in i det (nästa rad) och av rubriken i #screen-reader-status.
      if (await tp.getAttribute('#detail', 'aria-live')) throw new Error('#detail ska inte vara aria-live (#1138)');
      if (await tp.evaluate(() => !document.activeElement?.matches('#detail [data-close]'))) throw new Error('fokus flyttas inte in i temakortet');
      await tp.waitForFunction(() => new URLSearchParams(location.hash.slice(1)).has('c'), null, { timeout: T.step });
      const camera = await tp.evaluate(() => new URLSearchParams(location.hash.slice(1)).get('c').split(',').slice(0, 2).map(Number));
      if (Math.hypot(camera[0] - 52.4862, camera[1] - 60.1883) < 1) throw new Error('temakameran står kvar på den tidigaste händelsen');
      const layout = await tp.evaluate(() => {
        const detail = document.getElementById('detail').getBoundingClientRect();
        const track = document.getElementById('track').getBoundingClientRect();
        const globe = document.getElementById('globe-canvas').getBoundingClientRect();
        return { ratio: detail.height / innerHeight, listOpen: document.querySelector('.theme-event-list').open,
          globeAbove: detail.top - globe.top, trackVisible: track.top >= 0 && track.bottom <= innerHeight };
      });
      if (layout.ratio > 0.5) throw new Error(`temakortet täcker ${Math.round(layout.ratio * 100)} % av höjden`);
      if (layout.globeAbove < 120) throw new Error(`bara ${Math.round(layout.globeAbove)} px av globytan syns ovanför temakortet`);
      if (!layout.trackVisible) throw new Error('tidsreglaget syns inte tillsammans med temakortet');
      if (vp.width <= 760 && layout.listOpen) throw new Error('temats händelselista är inte hopfälld i mobil');
      const inside = await listed();
      if (!inside.length) throw new Error('inga händelser i listan inom temats spann');
      if (inside.some(id => !ids.includes(id))) throw new Error(`listan visar händelser utanför temat: ${inside.filter(id => !ids.includes(id)).join(', ')}`);
      // 2. Escape stänger först kortet, sedan temat, och lämnar fokus på Sök och följ
      await tp.keyboard.press('Escape');
      if (!(await tp.isHidden('#detail')) || await tp.isHidden('#focus-bar')) throw new Error('första Escape ska bara stänga temakortet');
      await tp.keyboard.press('Escape');
      await tp.waitForFunction(() => document.getElementById('focus-bar').hidden, null, { timeout: T.step });
      const returnButton = vp.width <= 760 ? 'more-toggle' : 'btn-focus'; // mobilens stängda meny använder sin synliga Meny-knapp (#530)
      if (await tp.evaluate(id => document.activeElement?.id !== id, returnButton)) throw new Error('fokus återgår inte till Sök och följ/Meny när temat avslutas');

      // 3. Temagruppen ligger först under Alla, fliken listar temat och raden startar det
      if (await tp.isHidden('#btn-focus') && await tp.isVisible('#more-toggle')) await tp.click('#more-toggle');
      if (await tp.isHidden('#btn-focus') && await tp.isVisible('#btn-more')) await tp.click('#btn-more');
      await tp.click('#btn-focus');
      if (await tp.isHidden('#focus-menu [data-tab="Teman"]')) await tp.waitForSelector('#focus-menu [data-tab="Teman"]', { state: 'visible', timeout: T.step });
      const firstGroup = await tp.locator('#focus-menu [data-group]').first().getAttribute('data-group');
      if (firstGroup !== 'Teman') throw new Error(`Teman ligger inte först under Alla (först är ${firstGroup})`);
      await tp.click('#focus-menu [data-tab="Teman"]');
      const row = tp.locator('#focus-menu [data-key="theme:testtema"]');
      await row.waitFor({ state: 'visible', timeout: T.step });
      if (!/12 händelser/.test(await row.textContent())) throw new Error(`raden saknar antalet händelser: ${await row.textContent()}`);
      await row.click();
      await tp.waitForFunction(() => !document.getElementById('focus-bar').hidden && /Testtema/.test(document.getElementById('focus-title').textContent), null, { timeout: T.step });
      if (new URL(tp.url()).hash.indexOf('f=theme:testtema') < 0) await tp.waitForFunction(() => location.hash.includes('f=theme:testtema'), null, { timeout: T.step });

      // 4. En avstängd kategori döljer inte temats händelser, och kategorivalet ändras inte
      const chip = tp.locator('#panel-filters [data-cat="vetenskap"]');
      await chip.evaluate(el => el.click());
      if (await chip.getAttribute('aria-pressed') !== 'false') throw new Error('kategorin gick inte att stänga av');
      const still = await listed();
      if (!still.length || still.some(id => !ids.includes(id))) throw new Error('en avstängd kategori ska inte ändra temats urval');
      // Konsolfel prövas bara för den första sidladdningen: när testet byter sida längre ned avbryts hämtningar som pågår,
      // och WebKit loggar dem som "access control checks" (releasekörningen 2026-11-09, #988)
      if (errs.length) throw new Error(`fel i konsolen: ${errs.join(' | ')}`);
      // 5. Den tydliga knappen avslutar temat och stänger kortet; kategorivalet finns kvar
      await tp.click('#detail [data-end-theme]');
      await tp.waitForFunction(() => document.getElementById('focus-bar').hidden, null, { timeout: T.step });
      if (!(await tp.isHidden('#detail'))) throw new Error('temakortet ligger kvar efter Avsluta temat');
      if (await tp.evaluate(id => document.activeElement?.id !== id, returnButton)) throw new Error('Avsluta temat återställer inte fokus');
      await chip.evaluate(el => el.click());
      await tp.waitForFunction(ids => [...document.querySelectorAll('#event-list .event-btn')].some(b => !ids.includes(b.dataset.id)), ids, { timeout: T.step });

      // 6. Ett år utan temahändelser pekar lugnt vidare till nästa
      await tp.goto(`${BASE}?ny=tema-tomt#y=800&f=theme:testtema`);
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await tp.waitForFunction(() => !document.getElementById('focus-bar').hidden, null, { timeout: T.step });
      if (await tp.isHidden('#btn-panel') && await tp.isVisible('#more-toggle')) await tp.click('#more-toggle');
      await tp.click('#btn-panel');
      await tp.waitForFunction(() => /Inga händelser i temat.*Nästa:/.test(document.getElementById('panel-sub').textContent), null, { timeout: T.step });

      // 7. Ett okänt tema i länken ger startläget och ett lugnt besked
      await tp.goto(`${BASE}?ny=tema2#y=120&f=theme:finns-inte`);
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      if (!(await tp.isHidden('#focus-bar'))) throw new Error('ett okänt tema ska inte starta Fokus');
      await tp.waitForSelector('#focus-notice', { state: 'visible', timeout: T.step });
      if (!/inte tillgängligt/.test(await tp.textContent('#focus-notice'))) throw new Error('ett okänt tema saknar lugnt besked');

      // 8. Ett draft-tema beter sig likadant
      const draft = { ...doc, themes: [{ ...doc.themes[0], review: 'draft' }] };
      await tp.route('**/data/teman.json*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(draft) }));
      await tp.goto(`${BASE}?ny=tema-draft#y=120&f=theme:testtema`);
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await tp.waitForSelector('#focus-notice', { state: 'visible', timeout: T.step });
      if (!(await tp.isHidden('#focus-bar'))) throw new Error('ett draft-tema ska ge samma lugna läge som ett saknat tema');

      // 9. Utan teman syns ingen tom flik Teman, och den är inte fortsatt markerad
      await tp.route('**/data/teman.json*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ schema: 'historia-globen/teman@1', themes: [] }) }));
      await tp.goto(`${BASE}?ny=tema3#y=120`);
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      if (await tp.isHidden('#btn-focus') && await tp.isVisible('#more-toggle')) await tp.click('#more-toggle');
      if (await tp.isHidden('#btn-focus') && await tp.isVisible('#btn-more')) await tp.click('#btn-more');
      await tp.click('#btn-focus');
      await tp.waitForSelector('#focus-menu [data-tab="Resor"]', { state: 'visible', timeout: T.step });
      await tp.waitForFunction(() => document.querySelector('#focus-menu [data-key^="route:"]'), null, { timeout: T.step }).catch(() => {});
      if (await tp.isVisible('#focus-menu [data-tab="Teman"]')) throw new Error('fliken Teman syns trots att det inte finns några teman');
      if (await tp.getAttribute('#focus-menu [data-tab="Teman"]', 'aria-pressed') !== 'false') throw new Error('den dolda temafliken är fortfarande markerad');
      return `ingång, tangentbord, utgång, tomt år, saknat/draft tema och kategorier; kort ${Math.round(layout.ratio * 100)} % av ${vp.width}×${vp.height}`;
    } finally { await tctx.close(); }
  });

  // #105: det publicerade temat Teknik (data/teman.json, utan route) startar via länk och visar bara sitt urval.
  await check('det publicerade temat Teknik startar via länk och visar bara sitt urval (#105)', async () => {
    const { tp, tctx } = await touchPage();
    try {
      const theme = (await (await tctx.request.get(`${BASE}data/teman.json`)).json()).themes.find(t => t.id === 'teknik');
      if (!theme || theme.review === 'draft') throw new Error('temat teknik saknas eller är draft i data/teman.json');
      await tp.goto(`${BASE}?ny=teknik#y=1900&f=theme:teknik`);
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await tp.waitForFunction(() => !document.getElementById('focus-bar').hidden && /Teknik/.test(document.getElementById('focus-title').textContent), null, { timeout: T.step });
      const shown = await tp.evaluate(() => [...document.querySelectorAll('#event-list .event-btn')].map(b => b.dataset.id));
      if (shown.some(id => !theme.events.includes(id))) throw new Error(`listan visar händelser utanför temat: ${shown.filter(id => !theme.events.includes(id)).join(', ')}`);
      return `${theme.events.length} händelser i temat, ${shown.length} i listan`;
    } finally { await tctx.close(); }
  });

  // #579: platserna (data/platser.json, utan route): Grönland och Aotearoa väljs i Sök och följ, kortet säger vad platsen
  // är och att linjen är dagens gräns, bara händelserna inom gränsen syns, och platsen lämnas med knappen.
  await check('platsen Grönland väljs i Sök och följ och visar bara händelserna inom gränsen (#579)', async () => {
    const { tp, tctx, errs } = await touchPage();
    try {
      const doc = await (await tctx.request.get(`${BASE}data/platser.json`)).json();
      const place = doc.places.find(p => p.id === 'gronland');
      if (!place || place.review === 'draft') throw new Error('platsen gronland saknas eller är draft i data/platser.json');
      await tp.goto(`${BASE}?ny=plats1#y=1000`);
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      if (await tp.isHidden('#btn-focus') && await tp.isVisible('#more-toggle')) await tp.click('#more-toggle');
      if (await tp.isHidden('#btn-focus') && await tp.isVisible('#btn-more')) await tp.click('#btn-more');
      await tp.click('#btn-focus');
      await tp.waitForSelector('#focus-menu [data-tab="Platser"]', { state: 'visible', timeout: T.step });
      await tp.click('#focus-menu [data-tab="Platser"]');
      const row = tp.locator('#focus-menu [data-key="place:gronland"]');
      await row.waitFor({ state: 'visible', timeout: T.step });
      if (!/Självstyrt område/.test(await row.textContent())) throw new Error(`raden saknar typen: ${await row.textContent()}`);
      await row.click();
      await tp.waitForFunction(() => !document.getElementById('focus-bar').hidden && /Grönland/.test(document.getElementById('focus-title').textContent), null, { timeout: T.step });
      await tp.waitForFunction(() => location.hash.includes('f=place:gronland'), null, { timeout: T.step });
      await tp.waitForSelector('#detail .place-type', { state: 'visible', timeout: T.step });
      const card = await tp.textContent('#detail');
      if (!/Självstyrt område/.test(card)) throw new Error('kortet visar inte platsens typ');
      if (!/dagens gräns/.test(card)) throw new Error('kortet säger inte att linjen är dagens gräns');
      if (!/oavsett.*kategor/i.test(card)) throw new Error('kortet förklarar inte kategorifiltret');
      // Hela tiden: listan i kortet visar bara händelser som ligger på Grönland (de som inte är draft)
      const inCard = await tp.evaluate(() => [...document.querySelectorAll('#detail [data-theme-event]')].map(b => b.dataset.themeEvent));
      if (inCard.length < 5) throw new Error(`kortet listar bara ${inCard.length} händelser`);
      const events = (await (await tctx.request.get(`${BASE}data/events.json`)).json());
      const byId = new Map((events.events ?? events).map(e => [e.id, e]));
      const outside = inCard.filter(id => { const [lon, lat] = byId.get(id).location.coordinates; return !(lon < -10 && lon > -75 && lat > 59 && lat < 84); });
      if (outside.length) throw new Error(`kortet listar händelser utanför Grönland: ${outside.join(', ')}`);
      const shown = await tp.evaluate(() => [...document.querySelectorAll('#event-list .event-btn')].map(b => b.dataset.id));
      if (shown.some(id => !inCard.includes(id))) throw new Error(`listan visar händelser utanför platsen: ${shown.filter(id => !inCard.includes(id)).join(', ')}`);
      if (errs.length) throw new Error(`fel i konsolen: ${errs.join(' | ')}`);
      // Avsluta platsen lämnar fokus och stänger kortet
      await tp.click('#detail [data-end-theme]');
      await tp.waitForFunction(() => document.getElementById('focus-bar').hidden, null, { timeout: T.step });
      if (!(await tp.isHidden('#detail'))) throw new Error('platskortet ligger kvar efter Avsluta platsen');
      // En plats som inte finns ger ett lugnt besked i stället för ett fel
      await tp.goto(`${BASE}?ny=plats2#y=1000&f=place:finns-inte`);
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      if (!(await tp.isHidden('#focus-bar'))) throw new Error('en plats som inte finns startade ändå ett fokus');
      return `${inCard.length} händelser inom gränsen, ${shown.length} syns i listan`;
    } finally { await tctx.close(); }
  });

  // #1255: när man följer en plats stannar uppspelningen vid platsens händelser. Grönland har inga viktiga
  // händelser, så den stannar vid alla; första stoppet är den äldsta händelsen. Valet i Lager stänger av pauserna.
  await check('uppspelningen pausar vid platsens händelser när man följer en plats (#1255)', async () => {
    const { tp, tctx, errs } = await touchPage();
    try {
      await tp.goto(`${BASE}?ny=plats3#y=-2600&f=place:gronland`);
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await tp.waitForFunction(() => !document.getElementById('focus-bar').hidden && /Grönland/.test(document.getElementById('focus-title').textContent), null, { timeout: T.step });
      // Pausvalet för platser och teman finns i Lager och är på från början
      const on = await tp.evaluate(() => document.querySelector('input[data-pause="theme"]')?.checked);
      if (on !== true) throw new Error('valet "Händelser när man följer en plats eller ett tema" saknas eller är av från början');
      const events = await (await tctx.request.get(`${BASE}data/events.json`)).json();
      const first = (events.events ?? events).filter(e => e.location?.coordinates?.[0] < -10 && e.location.coordinates[0] > -75 && e.location.coordinates[1] > 59 && e.location.coordinates[1] < 84 && e.review !== 'draft').sort((a, b) => a.start - b.start)[0];
      if (!first) throw new Error('ingen händelse på Grönland i datan');
      await tp.click('#focus-action');
      await tp.waitForFunction(() => /Pausad vid/.test(document.body.textContent) && document.getElementById('focus-action').dataset.action !== 'pause', null, { timeout: T.step * 3 });
      const pause = await tp.evaluate(() => document.getElementById('pause-text')?.textContent || '');
      if (!/Pausad vid/.test(pause)) throw new Error(`pausraden saknas: "${pause}"`);
      const year = await tp.evaluate(() => document.getElementById('focus-state').textContent);
      if (!year.includes(String(Math.abs(first.start <= 0 ? first.start - 1 : first.start)))) throw new Error(`tiden står inte på första händelsens år (${first.start}): "${year}"`);
      // I smal skärm öppnas inte faktarutan vid pausen, så att kartan syns (som för krigets stopp); händelsen markeras på globen
      if (vp.width > 760 && await tp.isHidden('#detail')) throw new Error('faktarutan visar inte händelsen vid pausen');
      if (errs.length) throw new Error(`fel i konsolen: ${errs.join(' | ')}`);
      return `pausade vid första händelsen (${first.start}): ${pause}`;
    } finally { await tctx.close(); }
  });

  // #706: i mobil hamnade Samtidigt-kortets knapprad (Källor, Nästa) under kortets nederkant, bakom tidslinjen.
  // I halvöppet läge ska Källor och Nästa ligga helt inne i kortets synliga yta, och kortet ska sluta ovanför
  // uppspelningsraden, i 400 × 800 och i den lägre 360 × 640.
  await check('Samtidigt-kortets knapprad syns ovanför tidslinjen i mobil (#706)', async () => {
    if (vp.width > 760) return 'bara i smal skärm';
    await visible('#funfact');
    const measure = () => page.evaluate(() => {
      const box = id => document.getElementById(id).getBoundingClientRect();
      const ff = document.getElementById('funfact');
      if (!ff.classList.contains('ff-s-half')) return { state: ff.className };
      const f = box('funfact'), play = box('btn-play'), track = box('track');
      const bad = ['ff-sources', 'ff-next'].filter(id => {
        const r = box(id);
        return !r.width || r.top < f.top - 0.5 || r.bottom > f.bottom + 0.5 || r.bottom > play.top || r.bottom > track.top;
      });
      return { bad, cardBottom: Math.round(f.bottom), playTop: Math.round(play.top), sources: Math.round(box('ff-sources').bottom) };
    });
    const out = [];
    const size = page.viewportSize();
    try {
      for (const [w, h] of [[size.width, size.height], [360, 640]]) {
        if (w !== page.viewportSize().width || h !== page.viewportSize().height) {
          await page.setViewportSize({ width: w, height: h });
          await page.waitForFunction(([w, h]) => innerWidth === w && innerHeight === h, [w, h], { timeout: T.step });
          await page.waitForTimeout(300); // låt kortets plats räknas om efter den nya höjden
        }
        const r = await measure();
        if (r.state) throw new Error(`kortet är inte halvöppet i ${w} × ${h} (${r.state})`);
        if (r.bad.length) throw new Error(`${r.bad.join(' och ')} syns inte i ${w} × ${h}: kortet slutar vid ${r.cardBottom} px, uppspelningsraden börjar vid ${r.playTop} px`);
        if (r.cardBottom > r.playTop) throw new Error(`kortet täcker uppspelningsraden i ${w} × ${h} (${r.cardBottom} > ${r.playTop} px)`);
        await shot(`706-knapprad-${w}x${h}`);
        out.push(`${w} × ${h}: Källor slutar vid ${r.sources} px, kortet vid ${r.cardBottom}, uppspelningen börjar vid ${r.playTop}`);
      }
    } finally {
      await page.setViewportSize(size);
      await page.waitForFunction(([w, h]) => innerWidth === w && innerHeight === h, [size.width, size.height], { timeout: T.step }).catch(() => {});
    }
    return out.join('; ');
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
    const forecast = await surprise.evaluate(async button => {
      const { formatYear } = await import('./js/model.js');
      const year = Number(button.dataset.year);
      return { year, valid: button.dataset.year != null && Number.isFinite(year) && button.textContent.trim() === `Visste du? → ${formatYear(year)}` };
    });
    if (!forecast.valid) throw new Error('Visste du?-knappen saknar sitt datahämtade målår');
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
    if (chosen.show[0] !== forecast.year) throw new Error('hoppet gick inte till det förhandsvisade målåret');
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
    await page.keyboard.press('Escape'); // även den tillfälliga återgångsraden städas undan
    return `deterministiskt urval i ${selection.available} världsdelar, högst ${selection.mostRepeated} gånger samma fact på tio tryck; kortet hoppade till förhandsvisade ${expected}`;
  });

  await check('Visste du? visar målet och Tillbaka återställer år och kamera på fem språk (#997)', async () => {
    const savedCalm = await page.evaluate(() => localStorage.getItem('hg-calm'));
    for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
      const pp = await context.newPage();
      const errors = [];
      pp.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) errors.push(m.text()); });
      pp.on('pageerror', e => errors.push(e.message));
      try {
        if (THREE_LOCAL) {
          await pp.route(THREE_URL, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(THREE_LOCAL, 'utf8') }));
          await pp.route(u => isFont(u.href), r => r.abort());
        }
        await pp.addInitScript(calm => {
          localStorage.setItem('hg-calm', calm ? '1' : '0');
          window.__jumpFlights = [];
          document.addEventListener('hg:globe-flight', e => window.__jumpFlights.push(e.detail), true);
        }, lang !== 'sv');
        await pp.goto(`${BASE}?lang=${lang}#y=1325&c=20,-45,1.6`);
        await pp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        await pp.waitForFunction(() => window.__jumpFlights.some(f => f.phase === 'end'), null, { timeout: T.step });
        const state = () => pp.evaluate(async () => (await import('./js/url-state.js')).decodeHash(location.hash));
        const before = await state();
        const surprise = pp.locator('#ff-surprise');
        const target = Number(await surprise.getAttribute('data-year'));
        const expected = await pp.evaluate(async target => {
          const { ui } = await import('./js/i18n.js');
          const { formatYear } = await import('./js/model.js');
          return { target: ui('ff.surpriseTarget', { year: formatYear(target) }), from: ui('jumpBack.from', { year: formatYear(1325) }) };
        }, target);
        if ((await surprise.textContent()).trim() !== expected.target) throw new Error(`${lang}: knappen visar inte det väntade målåret`);
        await surprise.evaluate(button => button.click());
        await pp.waitForSelector('#jump-back:not([hidden])', { state: 'visible', timeout: T.step });
        if ((await state()).year !== target) throw new Error(`${lang}: det visade målåret nåddes inte`);
        if ((await pp.textContent('#jump-back-text')).trim() !== expected.from) throw new Error(`${lang}: återgångsraden saknar utgångsåret`);
        const landed = await state();
        const flightsBeforeReturn = await pp.evaluate(() => window.__jumpFlights.length);
        await pp.locator('#jump-back-button').click();
        const returned = await state();
        if (returned.year !== before.year || JSON.stringify(returned.camera) !== JSON.stringify(before.camera)) throw new Error(`${lang}: år eller kamera återställdes inte: ${JSON.stringify({ before, returned })}`);
        if (await pp.evaluate(() => document.activeElement?.id) !== 'year-jump') throw new Error(`${lang}: Tillbaka lämnade inte fokus på årskontrollen`);
        await pp.waitForFunction(({ start, camera }) => window.__jumpFlights.slice(start).some(f => {
          if (f.phase !== 'end') return false;
          const lat = f.x * 180 / Math.PI;
          const lon = (((((Math.PI / 2 - f.y) * 180 / Math.PI - 180) % 360) + 540) % 360) - 180;
          return Math.abs(lat - camera.lat) < 0.0001 && Math.abs(lon - camera.lon) < 0.0001;
        }), { start: flightsBeforeReturn, camera: before.camera }, { timeout: T.step });
        await pp.goBack();
        await pp.waitForFunction(year => new URLSearchParams(location.hash.slice(1)).get('y') === String(year), landed.year, { timeout: T.step });
        await pp.goForward();
        await pp.waitForFunction(year => new URLSearchParams(location.hash.slice(1)).get('y') === String(year), before.year, { timeout: T.step });
        if (lang === 'sv') {
          // Även nästa hopp får en retur, som upphör av tid utan att flytta året tillbaka.
          await surprise.evaluate(button => button.click());
          await pp.locator('#jump-back-button').focus();
          await pp.screenshot({ path: path.join(OUT, `${vp.name}-997-tillbaka.png`) });
          await pp.waitForSelector('#jump-back', { state: 'hidden', timeout: 25000 }); // raden ligger kvar i 20 s (#1138)
          if (await pp.evaluate(() => document.activeElement?.id) !== 'year-jump') throw new Error('utgången tid lämnade fokus på en dold knapp');
        }
        if (await pp.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`${lang}: horisontell scroll`);
        if (lang !== 'sv' && !await pp.evaluate(() => document.documentElement.classList.contains('calm'))) throw new Error(`${lang}: Lugn rörelse förlorades`);
        if (errors.length) throw new Error(`${lang}: ${errors.join(' | ')}`);
      } finally {
        await pp.evaluate(value => { if (value == null) localStorage.removeItem('hg-calm'); else localStorage.setItem('hg-calm', value); }, savedCalm).catch(() => {});
        await pp.close();
      }
    }
    return 'fem språk: förhandsvisat mål, exakt år och kamera tillbaka, snabb återgång och Bakåt/Framåt, tidsgräns och fokus; Lugn rörelse';
  });

  await check('Samtidigt-kortet ger bildlösa händelser en likvärdig reservruta', async () => {
    await jumpTo(1879); await visible('#funfact');
    const cards = page.locator('#ff-pics .ff-pic');
    const reserve = page.locator('#ff-pics .ff-pic.ff-reserve');
    const image = page.locator('#ff-pics .ff-pic img:not(.ff-reserve-icon)');
    // Minst ett kort av varje sort räcker för att pröva blandningen; fler bilder i datan (#453) får inte fälla testet.
    if (await cards.count() < 2 || !await reserve.count() || !await image.count()) throw new Error('1879 saknar blandade bild- och reservkort');
    const label = await reserve.first().getAttribute('aria-label');
    if (!/Krig och konflikter, 1879, Anglo-zuluiska kriget/.test(label ?? '')) throw new Error('reservkortet saknar kategori, år och titel i sitt namn');
    const missing = await reserve.evaluateAll(nodes => nodes.some(node => ['.ff-reserve-icon', '.ff-reserve-year', '.ff-reserve-category', '.ff-name'].some(selector => !node.querySelector(selector))));
    if (missing) throw new Error('reservkortet saknar ikon, år, kategori eller titel');
    // Reservsymbolen får inte växa ur rutan (#975): en regel för alla bilder i .ff-pic gjorde den 173 px i en ruta på 132 px.
    const spill = await reserve.evaluateAll(nodes => nodes.flatMap(n => {
      const box = n.getBoundingClientRect();
      return [...n.querySelectorAll('.ff-reserve-icon, .ff-reserve-year, .ff-reserve-category, .ff-name')].filter(c => c.getClientRects().length).filter(c => {
        const r = c.getBoundingClientRect();
        return r.top < box.top - 1 || r.left < box.left - 1 || r.right > box.right + 1 || r.bottom > box.bottom + 1;
      }).map(c => `${c.className} ${Math.round(c.getBoundingClientRect().width)}×${Math.round(c.getBoundingClientRect().height)} i en ruta på ${Math.round(box.width)}×${Math.round(box.height)}`);
    }));
    if (spill.length) throw new Error(`reservkortets innehåll ligger utanför rutan: ${spill.join('; ')}`);
    const heights = await cards.evaluateAll(nodes => nodes.map(node => Math.round(node.getBoundingClientRect().height)));
    if (new Set(heights).size !== 1) throw new Error(`bild- och reservkort har olika höjd: ${heights.join(', ')}`);
    const imageHeight = await image.first().evaluate(el => Math.round(el.closest('.ff-pic').getBoundingClientRect().height));
    await page.screenshot({ path: path.join(OUT, `${vp.name}-samtidigt-reservkort-1879.png`), fullPage: false });
    try {
      await jumpTo(1274);
      if ((await page.textContent('#ff-kind')).trim() !== 'När ett krig bröt ut') throw new Error('1274 saknar det verifierade krigskortet i Samtidigt');
      // Krigskortet är en symbolruta när inget kort har bild och en reservruta bland bildkort (Marco Polo 1271 fick bild i #453).
      const symbol = page.locator('#ff-pics .ff-reserve[aria-label^="Krig och konflikter"]').first();
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

  // #1305: statusraden säger året och antalet träffar efter varje årsbyte, hur året än byttes, och ett år utan Samtidigt-kort säger det.
  // Året är ändå ingen live-region (#506): raden läses inte upp under uppspelning.
  await check('statusraden säger året och antalet träffar vid årsbyte, och ett år utan kort säger det (#1305)', async () => {
    const startYear = Number(await page.getAttribute('#track', 'aria-valuenow'));
    const status = () => page.textContent('#screen-reader-status').then(s => s.replace(/\s+/g, ' ').trim());
    const saysYear = (y, n = '\\d+') => page.waitForFunction(([year, count]) => new RegExp(`^År ${year}: ${count} händelse(r)?\\.`).test(document.getElementById('screen-reader-status').textContent.replace(/\s+/g, ' ').trim()), [String(y), n], { timeout: T.step });
    // 1. Ett årshopp, 2. knappen +10 (som bara läste upp kortet förut) och 3. flera snabba steg som samlas till ett besked
    await jumpTo(1290); // ett annat år än starten, så att hoppet ändrar året
    await saysYear(1290);
    await jumpTo(1325);
    await saysYear(1325);
    await page.click('.timebar .controls .step[data-step="10"]');
    await saysYear(1335);
    for (let i = 0; i < 3; i++) await page.click('.timebar .controls .step[data-step="10"]');
    await saysYear(1365);
    // Antalet är det som står i Samtidigt-listan
    const listed = await page.evaluate(() => document.getElementById('panel-count').textContent.trim());
    const said = (await status()).match(/^År 1365: (\d+) /);
    if (!said || said[1] !== listed) throw new Error(`statusraden säger "${await status()}" men Samtidigt-räknaren visar ${listed}`);
    // 4. Ett år utan Samtidigt-kort: raden säger det i stället för att vara tom
    let empty = null;
    for (const y of [1400, 1420, 1380, 1450, 1360]) {
      await jumpTo(y);
      if (await page.locator('#funfact').isHidden() && await page.locator('#ff-tab').isHidden()) { empty = y; break; }
    }
    if (!empty) throw new Error('hittade inget år utan Samtidigt-kort kring 1400');
    await saysYear(empty);
    await page.waitForFunction(() => document.getElementById('screen-reader-status').textContent.includes('Inget Samtidigt-kort för det här året.'), null, { timeout: T.step });
    // 5. Under uppspelning läses året inte upp (#506)
    await page.evaluate(() => { document.getElementById('screen-reader-status').textContent = ''; });
    await page.click('#btn-play');
    await page.waitForTimeout(1500);
    const during = await status();
    if (await page.getAttribute('#btn-play', 'aria-pressed') === 'true') await page.click('#btn-play');
    if (/^År \d+: \d+ händelse/.test(during)) throw new Error(`statusraden läste upp året under uppspelning: "${during}"`);
    await jumpTo(startYear);
    return `hopp, +10 och flera steg ger "År N: n händelser" (n som i Samtidigt-räknaren); ${empty} utan kort säger det; inget under uppspelning`;
  });

  await check('en händelse öppnas från Samtidigt', async () => {
    const event = page.locator('#ff-events .ff-chip').first();
    const title = (await event.textContent()).replace(/\s+/g, ' ').trim();
    if (vp.width > 760) {
      await page.click('#btn-panel');
      await visible('#panel');
    }
    // Flygningen till markören avslutas med hg:globe-flight (phase: 'end', js/globe.js). Lyssnaren sätts före klicket (#1174).
    await page.evaluate(() => {
      window.__hgPulseFlight = [];
      window.__hgPulseT0 = performance.now();
      document.getElementById('globe-canvas').addEventListener('hg:globe-flight', e => window.__hgPulseFlight?.push(e.detail.phase));
    });
    // Samtidigt-kortet kan ligga i en mobilpanel ovanpå globen. Klicka på själva knappen så att
    // testet provar kortets egen händelsehanterare, utan att fastna i panelens övergång.
    await event.evaluate(el => el.click());
    await visible('#detail');
    const detail = (await page.textContent('#detail')).replace(/\s+/g, ' ').trim();
    if (!detail.includes(title)) throw new Error(`faktarutan gäller inte den valda händelsen: ${title}`);
    if (vp.width > 760) {
      const layout = await page.evaluate(() => {
        const panel = document.getElementById('panel').getBoundingClientRect();
        const detail = document.getElementById('detail').getBoundingClientRect();
        return { panelOpen: document.getElementById('panel').classList.contains('open'), cardHidden: document.getElementById('funfact').hidden, tabVisible: !document.getElementById('ff-tab').hidden, right: Math.round(detail.right - panel.right) };
      });
      if (!layout.panelOpen || !layout.cardHidden || !layout.tabVisible || Math.abs(layout.right) > 1) throw new Error('faktarutan delar inte högersidans läsyta med Samtidigt');
      // #1051: rutan ska också ta emot klick. Mäts i punkten mitt i rutan, där listan annars kan ligga över
      const hit = await page.evaluate(() => { const r = document.getElementById('detail').getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!el?.closest('#detail'); });
      if (!hit) throw new Error('faktarutan är täckt av Samtidigt-listan och tar inte emot klick (#1051)');
    }
    await shot('3-handelse-oppnas');
    const calm = page.locator('input[data-calm]');
    if (await calm.isChecked()) await calm.click();
    // Valet flyger först till markören. När flygningen är klar ska den valda medaljen fortsätta
    // pulsera även om globen annars står helt stilla (#390).
    // #1174: vänta in flygningens slut i stället för en fast väntan (CI kan vara sen), och mät över minst en halv
    // pulsperiod. Pulsen är 1 + 0,12·sin(t/240), period cirka 1 500 ms. Fyra bilder inom 240 ms nära kurvans topp
    // eller botten skiljer under en pixel och kunde bli lika fast pulsen gick; över en halv period ändras skalan
    // alltid med minst 0,12, oavsett var mätningen börjar.
    // Syns markören redan flyger globen inte alls: då räcker en kort stund utan att någon flygning har börjat
    await page.waitForFunction(() => { const f = window.__hgPulseFlight ?? []; return f.includes('end') || (!f.includes('start') && performance.now() - window.__hgPulseT0 > 500); }, null, { timeout: T.step }).catch(() => {});
    await page.waitForTimeout(200);
    // Mätningen slutar vid första bild som skiljer sig (oftast den andra), och tar annars högst sju bilder över 750 ms
    const first = await page.locator('#globe-canvas').screenshot();
    let pulsing = false;
    for (let i = 0; i < 6 && !pulsing; i++) { await page.waitForTimeout(125); pulsing = !(await page.locator('#globe-canvas').screenshot()).equals(first); }
    await page.evaluate(() => { delete window.__hgPulseFlight; delete window.__hgPulseT0; });
    if (!pulsing) throw new Error('den valda markörens puls stannade när globen stod stilla');
    await page.locator('#detail [data-close]').click();
    await hidden('#detail');
    if (vp.width > 760) {
      await visible('#funfact');
      await page.click('#panel-close');
    }
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
    await clickView('#btn-layers');
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
      // I mobilen ligger Lager i den stängda menyn Meny, och då går fokus till Meny (#530)
      const layersButton = innerWidth > 760 ? document.getElementById('btn-layers') : document.getElementById('more-toggle');
      const expected = menu?.hidden ? layersButton : document.querySelector('.empire-legend-button');
      return document.activeElement === expected;
    }, null, { timeout: T.step });
    await shot('3-lager');
    if (await page.locator('#layer-menu').isHidden()) await clickView('#btn-layers');
    await visible('#layer-menu');
    await page.click('#layer-customize');
    await visible('#layer-custom');
    const menuWidth = await page.locator('#layer-menu').evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    if (menuWidth.scroll > menuWidth.client) throw new Error(`Lager-menyn är ${menuWidth.scroll}px bred i en yta på ${menuWidth.client}px`);
    await shot('3-lager-anpassa');
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    await clickView('#btn-layers');
    await visible('#layer-menu');
    await visible('#layer-custom');
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    return `${views} vyer, ${n} lager; Anpassa själv minns öppet läge`;
  });

  await check('Lager byter till en färdig vy', async () => {
    await clickView('#btn-layers');
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

  await check('Stäng av alla lager och återställ Standard', async () => {
    const panel = page.locator('#panel');
    const menu = page.locator('#layer-menu');
    try {
      if (await panel.evaluate(el => el.classList.contains('open'))) await page.click('#panel-close');
      await clickView('#btn-layers');
      await visible('#layer-menu');
      if (await page.locator('#layer-custom').isHidden()) await page.click('#layer-customize');
      await visible('#layer-custom');
      await page.getByRole('button', { name: 'Stäng av alla lager' }).focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('#layer-menu [data-view="bara-kartan"]')?.getAttribute('aria-pressed') === 'true', null, { timeout: T.step });
      const offStates = await page.locator('#layer-custom input[data-layer]').evaluateAll(inputs =>
        inputs.filter(input => input.closest('[data-group]')?.dataset.group !== 'settings').map(input => input.checked));
      if (!offStates.length || offStates.some(Boolean)) throw new Error('Stäng av alla lämnade lager på');
      if ((await page.locator('.layer-action-status').textContent()).trim() !== 'Alla lager är avstängda.') {
        throw new Error('statusraden säger inte att alla lager är avstängda');
      }

      await page.getByRole('button', { name: 'Bara kartan', exact: true }).click();
      if (await page.locator('#layer-menu [data-view="bara-kartan"]').getAttribute('aria-pressed') !== 'true') {
        throw new Error('vyn Bara kartan markeras inte som vald');
      }
      await page.keyboard.press('Escape');
      await hidden('#layer-menu');
      await page.click('#btn-panel');
      await visible('#panel');
      if ((await page.locator('#panel-sub').textContent()).trim() !== 'Händelselagret är avstängt.') {
        throw new Error('Samtidigt förklarar inte att händelselagret är avstängt');
      }
      await page.getByRole('button', { name: 'Slå på händelselagret' }).click();
      if (!await page.locator(layerRow('events')).isChecked()) throw new Error('panelen slog inte på händelselagret');
      if (await page.evaluate(() => document.activeElement?.id) !== 'btn-panel') throw new Error('fokus hamnade inte på den synliga panelknappen');
      await page.click('#btn-panel');
      await clickView('#btn-layers');
      await visible('#layer-menu');
      if (await page.locator('#layer-custom').isHidden()) await page.click('#layer-customize');
      await visible('#layer-custom');
      await page.getByRole('button', { name: 'Återställ standardvyn' }).click();
      await page.waitForFunction(() => document.querySelector('#layer-menu [data-view="standard"]')?.getAttribute('aria-pressed') === 'true', null, { timeout: T.step });
      if ((await page.locator('.layer-action-status').textContent()).trim() !== 'Standardvyn är återställd.') {
        throw new Error('statusraden bekräftar inte återställningen');
      }
      const expected = await page.evaluate(() => fetch('data/vyer.json').then(response => response.json()).then(doc => doc.views.find(view => view.id === 'standard').layers));
      const standardStates = await page.locator('#layer-custom input[data-layer]').evaluateAll(inputs =>
        Object.fromEntries(inputs.filter(input => input.closest('[data-group]')?.dataset.group !== 'settings').map(input => [input.dataset.layer, input.checked])));
      if (expected.some(id => standardStates[id] !== true) || Object.entries(standardStates).some(([id, on]) => on !== expected.includes(id))) {
        throw new Error(`Återställ gav inte Standard: ${JSON.stringify(standardStates)}`);
      }
      return 'alla kontrollerade lager stängs av, Samtidigt kan slå på Händelser och Återställ återställer Standard';
    } finally {
      if (await panel.evaluate(el => el.classList.contains('open'))) await page.click('#panel-close');
      if (await menu.isHidden()) await clickView('#btn-layers');
      if (await page.locator('#layer-custom').isHidden()) await page.click('#layer-customize');
      await page.getByRole('button', { name: 'Återställ standardvyn' }).click();
      await page.keyboard.press('Escape');
      await hidden('#layer-menu');
    }
  });

  // #868: vyn Översikt visar bara händelserna med significance 1. Tidslinjen visar dem som enskilda märken
  // (inte täthetsbandet), listan innehåller bara dem, och Standard visar allt igen.
  await check('vyn Översikt visar bara det viktigaste, i listan och på tidslinjen (#868)', async () => {
    const ids = await page.evaluate(async () => (await (await fetch('data/events.json')).json()).events.filter(e => e.significance === 1).length);
    if (ids !== 123) throw new Error(`datan har ${ids} händelser med significance 1, väntade 123`);
    await clickView('#btn-layers');
    await visible('#layer-menu');
    const chip = page.locator('#layer-menu .view-chip[data-view="oversikt"]');
    if (await chip.count() !== 1) throw new Error('vyn Översikt saknas i Lager');
    // Första besöket provas på en egen sida: den delade sidan har redan bytt vy i kontrollerna före.
    const first = await context.newPage();
    try {
      await first.goto(BASE);
      await first.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await first.waitForFunction(() => document.querySelector('#layer-menu .view-chip[data-view="oversikt"]')?.getAttribute('aria-pressed') === 'true', null, { timeout: T.step });
      await first.waitForFunction(() => /([?&#])g=oversikt(?:&|$)/.test(location.hash), null, { timeout: T.step });
      // Översikt väljer bara händelserna: lagren är som i Standard, så Riken och Samtidigt finns kvar
      const on = await first.evaluate(() => ['areas', 'funfacts', 'routes', 'wars'].filter(l => document.querySelector(`[data-layer="${l}"]`)?.checked));
      if (on.length !== 4) throw new Error(`Översikt som startvy ska behålla Standards lager, men bara ${on.join(', ') || 'inga'} är på`);
    } finally { await first.close(); }
    await chip.click();
    await page.waitForFunction(() => document.querySelector('#layer-menu [data-view="oversikt"]')?.getAttribute('aria-pressed') === 'true', null, { timeout: T.step });
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    await page.waitForFunction(() => document.querySelectorAll('#track-dots .tdot, #track-dots .tspan').length > 0 && !document.querySelector('.tdensity'), null, { timeout: T.step });
    const marks = await page.locator('#track-dots .tdot, #track-dots .tspan').count();
    if (marks < 60 || marks > 123) throw new Error(`Översikt har ${marks} märken på tidslinjen, väntade 60–123`);
    await jumpTo(1969);
    if (await page.locator('#panel').isHidden()) await page.click('#btn-panel');
    await visible('#panel');
    const titles = await page.locator('#event-list .event-btn').evaluateAll(b => b.map(x => x.textContent));
    if (titles.length > 25) throw new Error(`Översikt listar ${titles.length} händelser år 1969, väntade bara det viktigaste`);
    await page.click('#panel-close');
    await clickView('#btn-layers');
    await visible('#layer-menu');
    await page.click('#layer-menu .view-chip[data-view="standard"]');
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    await page.waitForFunction(() => !!document.querySelector('.tdensity'), null, { timeout: T.step });
    return `${marks} märken på tidslinjen, ${titles.length} i listan år 1969, Standard ger bandet tillbaka`;
  });

  // #1139: Översikt är ett urval, och Samtidigt säger det överst med en knapp till alla händelser (samma åtgärd som Standard i Lager).
  // Raden syns också när listan är tom ("Inget ur Översikt …"), och den ryms utan sidscroll.
  await check('Översikt säger i Samtidigt att det är ett urval, med en knapp till alla händelser (#1139)', async () => {
    const dataCount = await page.evaluate(async () => (await (await fetch('data/events.json')).json()).events.filter(e => e.significance === 1).length);
    const expected = dataCount >= 10 ? Math.round(dataCount / 10) * 10 : dataCount;
    await clickView('#btn-layers');
    await visible('#layer-menu');
    await page.click('#layer-menu .view-chip[data-view="oversikt"]');
    await page.waitForFunction(() => document.querySelector('#layer-menu [data-view="oversikt"]')?.getAttribute('aria-pressed') === 'true', null, { timeout: T.step });
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    try {
      await jumpTo(1969);
      if (await page.locator('#panel').isHidden()) await page.click('#btn-panel');
      await visible('#panel');
      const note = page.locator('#panel-tag-note');
      await note.waitFor({ state: 'visible', timeout: T.step });
      const text = (await page.locator('#panel-tag-text').textContent()).trim();
      if (text !== `Översikt: ett urval, cirka ${expected} händelser.`) throw new Error(`urvalsraden säger "${text}", väntade cirka ${expected} (${dataCount} i datan)`);
      const button = page.locator('#panel-tag-all');
      if ((await button.evaluate(el => el.tagName)) !== 'BUTTON' || (await button.textContent()).trim() !== 'Visa alla') throw new Error('Visa alla är ingen knapp med rätt text');
      if (!(await button.getAttribute('aria-label'))) throw new Error('knappen saknar tillgängligt namn');
      // Raden ligger överst i rutan, ovanför kategorierna och listan, och ger ingen sidscroll
      const order = await page.evaluate(() => {
        const y = id => document.getElementById(id).getBoundingClientRect().top;
        return y('panel-tag-note') < y('panel-filters') && y('panel-filters') < y('event-list');
      });
      if (!order) throw new Error('urvalsraden ligger inte ovanför kategorierna och listan');
      if (await page.evaluate(() => document.scrollingElement.scrollWidth > innerWidth + 1)) throw new Error('urvalsraden ger horisontell scroll');
      const fits = await page.evaluate(() => { const r = document.getElementById('panel-tag-all').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.width > 0; });
      if (!fits) throw new Error('knappen Visa alla ryms inte i bredden');
      // Tomläget finns kvar och raden står ovanför det
      await jumpTo(-2849); // 2850 f.Kr.: inget ur Översikt inom ±120 år
      await page.waitForFunction(() => !!document.querySelector('#event-list .tag-empty'), null, { timeout: T.step });
      if (!/Inget ur Översikt/.test(await page.locator('#event-list .tag-empty').textContent())) throw new Error('tomläget "Inget ur Översikt" saknas');
      if (!(await note.isVisible())) throw new Error('urvalsraden försvann i tomläget');
      // Visa alla: samma vy som Standard i Lager, urvalet släpps och raden försvinner
      await jumpTo(1969);
      await button.click();
      await page.waitForFunction(() => document.getElementById('panel-tag-note').hidden, null, { timeout: T.step });
      await page.waitForFunction(() => !/([?&#])g=oversikt(?:&|$)/.test(location.hash) && !!document.querySelector('.tdensity'), null, { timeout: T.step });
      await clickView('#btn-layers');
      await visible('#layer-menu');
      if (await page.locator('#layer-menu [data-view="standard"]').getAttribute('aria-pressed') !== 'true') throw new Error('Visa alla gav inte vyn Standard');
      await page.keyboard.press('Escape');
      await hidden('#layer-menu');
      return `raden säger cirka ${expected} (${dataCount} i datan), står ovanför listan och tomläget, och Visa alla ger Standard`;
    } finally {
      if (await page.locator('#layer-menu [data-view="standard"]').getAttribute('aria-pressed') !== 'true') {
        if (await page.locator('#layer-menu').isHidden()) await clickView('#btn-layers');
        await page.click('#layer-menu .view-chip[data-view="standard"]');
        await page.keyboard.press('Escape');
      }
      if (await page.locator('#panel').evaluate(el => el.classList.contains('open'))) await page.click('#panel-close');
    }
  });

  // #555: vyn Framsteg i Lager. Tomläget prövas i en egen flik där taggarna tas bort ur datan (sedan #85 har
  // riktiga händelser taggen), och urvalet med en fixtur där bara Apollo 11 har taggen (bara i testet, inte i
  // datan): vyn ska visa just den händelsen och faktarutan ha märkningen med ett namn för skärmläsare.
  const withTags = async (tp, tagged) => {
    if (THREE_LOCAL) {
      const body = fs.readFileSync(THREE_LOCAL, 'utf8');
      await tp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
      await tp.route(u => isFont(u.href), r => r.abort());
    }
    await tp.route('**/data/genererat/handelser.json', async route => {
      const res = await route.fetch();
      const doc = await res.json();
      for (const e of doc.events) { if (tagged.includes(e.id)) e.tags = ['framsteg']; else delete e.tags; }
      await route.fulfill({ response: res, json: doc });
    });
  };
  await check('vyn Framsteg är tom utan taggar och visar taggade händelser (#555)', async () => {
    // Det tomma läget: samma sida i en ny flik, där ingen händelse har taggen
    const emptyPage = await context.newPage();
    try {
      await withTags(emptyPage, []);
      await emptyPage.goto(`${BASE}#y=1969`);
      await emptyPage.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      const emptyView = async sel => {
        if (await emptyPage.isHidden(sel) && await emptyPage.isVisible('#more-toggle')) await emptyPage.click('#more-toggle');
        await emptyPage.click(sel);
      };
      await emptyView('#btn-layers');
      await emptyPage.waitForSelector('#layer-menu', { state: 'visible', timeout: T.step });
      const chip = emptyPage.locator('#layer-menu .view-chip[data-view="framsteg"]');
      if (await chip.count() !== 1) throw new Error('vyn Framsteg saknas i Lager');
      await chip.focus();
      await emptyPage.keyboard.press('Enter');
      await emptyPage.waitForFunction(() => document.querySelector('#layer-menu [data-view="framsteg"]')?.getAttribute('aria-pressed') === 'true', null, { timeout: T.step });
      const status = emptyPage.locator('#layer-menu .layer-view-status');
      await status.waitFor({ state: 'visible', timeout: T.step });
      if (!/Inga händelser är markerade som framsteg ännu/.test(await status.textContent())) throw new Error(`tomt läge saknas i Lager: "${await status.textContent()}"`);
      await emptyPage.keyboard.press('Escape');
      if (await emptyPage.locator('#panel').isHidden()) await emptyPage.click('#btn-panel');
      await emptyPage.waitForSelector('#panel', { state: 'visible', timeout: T.step });
      await emptyPage.waitForFunction(() => /markerade som framsteg/.test(document.querySelector('#event-list .tag-empty')?.textContent ?? ''), null, { timeout: T.step });
      if (await emptyPage.locator('#event-list .event-btn').count()) throw new Error('vyn Framsteg visar otaggade händelser');
    } finally {
      await emptyPage.close();
    }

    // Test-fixturen: samma sida i en ny flik, där bara Apollo 11 har taggen framsteg
    const tagPage = await context.newPage();
    const tagErrors = [];
    tagPage.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) pushConsole(tagErrors, m); });
    tagPage.on('pageerror', e => tagErrors.push(e.message));
    try {
      await withTags(tagPage, ['apollo-11']);
      await tagPage.goto(`${BASE}#y=1969`);
      await tagPage.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      const tagView = async sel => {
        if (await tagPage.isHidden(sel) && await tagPage.isVisible('#more-toggle')) await tagPage.click('#more-toggle');
        await tagPage.click(sel);
      };
      await tagView('#btn-layers');
      await tagPage.waitForSelector('#layer-menu', { state: 'visible', timeout: T.step });
      await tagPage.click('#layer-menu .view-chip[data-view="framsteg"]');
      if (await tagPage.locator('#layer-menu .layer-view-status').isVisible()) throw new Error('tomt läge visas trots en taggad händelse');
      await tagPage.keyboard.press('Escape');
      if (await tagPage.locator('#panel').isHidden()) await tagPage.click('#btn-panel');
      await tagPage.waitForSelector('#event-list .event-btn[data-id="apollo-11"]', { state: 'visible', timeout: T.step });
      const ids = await tagPage.locator('#event-list .event-btn').evaluateAll(bs => bs.map(b => b.dataset.id));
      if (ids.length !== 1 || ids[0] !== 'apollo-11') throw new Error(`vyn visar ${ids.join(', ')}, inte bara den taggade händelsen`);
      await tagPage.click('#event-list .event-btn[data-id="apollo-11"]');
      const mark = tagPage.locator('#detail .tag-mark[data-tag="framsteg"] summary');
      await mark.waitFor({ state: 'visible', timeout: T.step });
      const name = await mark.getAttribute('aria-label');
      if (!name || !name.startsWith('Framsteg')) throw new Error(`märkningen saknar namn för skärmläsare (${name})`);
      // Vänta tills faktarutan är färdigladdad, annars ritas den om och stänger märkningen
      await tagPage.waitForFunction(() => !document.querySelector('#detail .detail-loading'), null, { timeout: T.step });
      await mark.focus();
      await tagPage.keyboard.press('Enter');
      const about = tagPage.locator('#detail .tag-mark[data-tag="framsteg"] p');
      await about.waitFor({ state: 'visible', timeout: T.step });
      if (!/baksidor/.test(await about.textContent())) throw new Error('förklaringen till märkningen saknas');
      const wide = await tagPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      if (wide) throw new Error('märkningen ger horisontell scroll');
      await tagPage.screenshot({ path: path.join(OUT, `${vp.name}-framsteg.png`) });
      if (tagErrors.length) throw new Error(`fixturen gav konsolfel: ${tagErrors.join('; ')}`);
    } finally {
      await tagPage.close();
    }
    return 'tomt läge i Lager och Samtidigt; med fixtur bara Apollo 11, märkning med namn och förklaring';
  });

  // #474: huvudstaden som gäller året syns när man följer ett rike. Testet tar ett rike ur datan med minst två daterade
  // huvudstäder och kontrollerar mitt i varje stads spann att just den staden visas, med den riktiga modulen.
  await check('huvudstaden följer året när man följer ett rike', async () => {
    const r = await page.evaluate(async () => {
      const { AreasLayer } = await import('./js/layers/areas.js');
      const get = url => fetch(url).then(res => res.json());
      const { groups } = await get('data/genererat/riken.json');
      const g = groups.find(x => x.file && (x.capitals ?? []).filter(c => c.from != null && c.to != null && c.to - c.from >= 2).length >= 2);
      if (!g) return { missing: true };
      const { polities } = await get(g.file);
      const layer = new AreasLayer(polities);
      layer.setCapitals(groups);
      layer.onlyGroup = g.id;
      const checks = g.capitals.filter(c => c.from != null && c.to != null && c.to - c.from >= 2).map(c => {
        const year = Math.floor((c.from + c.to) / 2);
        layer.update({ year });
        const names = layer.activeCapitals.map(x => x.name.sv);
        return { year, want: c.name.sv, names, ok: names.includes(c.name.sv) || !layer.active.length };
      });
      // #616: en händelsemarkör på huvudstaden. Namnet ska då stå bredvid markören, inte under den.
      layer.update({ year: checks[0].year });
      const c0 = layer.activeCapitals[0];
      let skymd = null;
      if (c0) {
        layer.setView({ pxPerImg: 1, markers: [{ lon: c0.at[0], lat: c0.at[1], r: 20 }] });
        layer._layout();
        const cap = layer._lay.caps[0], x = (c0.at[0] + 180) / 360 * 2048, y = (90 - c0.at[1]) / 180 * 1024, r = 20 / 2;
        skymd = cap.b.x0 < x + r && x - r < cap.b.x1 && cap.b.y0 < y + r && y - r < cap.b.y1 ? cap.name : null;
      }
      layer.onlyGroup = null;
      layer.update({ year: checks[0].year });
      return { group: g.id, checks, utanFokus: layer.activeCapitals.length, skymd };
    });
    if (r.missing) throw new Error('inget rike med två daterade huvudstäder i data/genererat/riken.json');
    const bad = r.checks.find(c => !c.ok);
    if (bad) throw new Error(`${r.group} ${bad.year}: väntade ${bad.want}, fick ${bad.names.join(', ') || 'ingen'}`);
    if (r.utanFokus) throw new Error('huvudstäder visas fast inget rike följs');
    if (r.skymd) throw new Error(`${r.skymd}: namnet ligger under en händelsemarkör på staden (#616)`);
    return `${r.group}: ${r.checks.map(c => `${c.year} ${c.want}`).join(', ')}; inga utan Fokus; namnet viker för en markör`;
  });

  await check('Upptäcktsvyns förklaring går att fälla ihop', async () => {
    await setLayer('discovery', true);
    await page.keyboard.press('Escape');
    await hidden('#layer-menu');
    const legend = page.locator('#religion-legend');
    const toggle = legend.locator('.rl-toggle');
    const body = legend.locator('#rl-body');
    await visible('#religion-legend');
    if ((await toggle.textContent()).trim() !== 'Upptäcktsresor') throw new Error('Upptäcktsresor saknar sin datahämtade rubrik');
    if (await body.isHidden()) await toggle.click();
    await visible('#religion-legend #rl-body');
    const coverage = page.locator('#religion-legend .rl-coverage');
    await coverage.waitFor({ state: 'visible', timeout: T.step });
    const jump = async value => {
      if (await page.isHidden('#jump-input')) await page.click('#year-jump');
      await page.fill('#jump-input', value);
      await page.locator('#jump-pop').evaluate(form => form.requestSubmit());
      await page.waitForFunction(want => document.querySelector('#year-big')?.textContent.trim() === want, value, { timeout: T.step });
      await coverage.waitFor({ state: 'visible', timeout: T.step });
    };
    await jump('1500');
    const earlyCoverage = (await coverage.textContent()).trim();
    if (!/\d+ %/.test(earlyCoverage)) throw new Error(`mätaren saknar avrundad procent: ${earlyCoverage}`);
    await jump('1900');
    await page.waitForFunction(before => document.querySelector('#religion-legend .rl-coverage')?.textContent.trim() !== before, earlyCoverage, { timeout: T.step });
    const note = await page.textContent('#religion-legend .rl-coverage-note');
    if (!/inte ett mått på all mänsklig kunskap/.test(note ?? '')) throw new Error('mätaren förklarar inte sin begränsning');
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

  // #377, regel A: dimman lyfts över hela riket när en resa har nått dess område. USA används eftersom issuets
  // krav är att USA syns under inbördeskriget (1863). Den riktiga modulen och USA:s fil laddas; vägarna ersätts av
  // en punkt i landet (reached), så att testet inte beror på vilka resor som finns i datan.
  await check('upptäcktsvyn lyfter dimman över ett rike som en resa har nått', async () => {
    const r = await page.evaluate(async () => {
      const { DiscoveryLayer } = await import('./js/layers/discovery.js');
      const get = url => fetch(url).then(res => res.json());
      const [rawDoc, index] = await Promise.all([get('data/upptackt.json'), get('data/empires/index.json')]);
      // Provet av regel A ska isolera rikeslogiken från källbelagd kartkunskap.
      const doc = { ...rawDoc, knowledge: [] };
      const group = index.groups.find(g => g.id === 'usa');
      if (!group) return { missing: true };
      const { polities } = await get(group.file);
      const last = polities[0].periods.at(-1);
      const lifted = (pts, year) => {
        const layer = new DiscoveryLayer(doc, null);
        layer.enabled = true;
        layer._loadImages = () => {};
        layer.addEmpire(group.id, polities);
        layer.update({ year, lines: { routes: [1], reached: () => [pts] } });
        return layer.lifted.length;
      };
      return { inne: lifted([last.label], 1863), fore: lifted([last.label], group.from - 1), langtBort: lifted([[0, 0]], 1863) };
    });
    if (r.missing) throw new Error('USA saknas i data/empires/index.json (#407)');
    if (!r.inne) throw new Error('dimman lyfts inte över USA 1863 fast en resa har nått landet');
    if (r.fore) throw new Error('dimman lyfts över USA innan landet fanns');
    if (r.langtBort) throw new Error('dimman lyfts över USA fast ingen resa har nått landet');
    return `USA 1863: ${r.inne} perioder lyfta; före landet fanns och utan kontakt: inga`;
  });

  await check('upptäcktsvyn lyfter bara källbelagd kartkunskap under dess tid (#1072)', async () => {
    const r = await page.evaluate(async () => {
      const { DiscoveryLayer } = await import('./js/layers/discovery.js');
      const rawDoc = await (await fetch('data/upptackt.json')).json();
      const doc = { ...rawDoc, home: { ...rawDoc.home, regions: [] } };
      const inside = (pt, geometries) => {
        const inRing = (ring) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
        return geometries.some(g => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).some(rings => inRing(rings[0]) && !rings.slice(1).some(inRing)));
      };
      const lifted = year => {
        const layer = new DiscoveryLayer(doc, null);
        layer.enabled = true;
        layer._loadImages = () => {};
        layer.update({ year, lines: { routes: [], reached: () => [] } });
        return layer.lifted;
      };
      return {
        source: doc.knowledge?.find(k => k.id === 'nordamerika-1755')?.sources?.[0],
        before: inside([-78, 38], lifted(1754)),
        mitchellArea: inside([-78, 38], lifted(1755)),
        west: inside([-120, 40], lifted(1767)),
        usaBefore: inside([-116, 38], lifted(1838)),
        usa1839: inside([-116, 38], lifted(1839)),
        usaSource: doc.knowledge?.find(k => k.id === 'usa-1839')?.sources?.[0],
        siberiaBefore: inside([110, 65], lifted(1826)),
        siberia1827: inside([110, 65], lifted(1827)),
        siberiaSource: doc.knowledge?.find(k => k.id === 'sibirien-1827')?.sources?.[0],
        canadaBefore: inside([-61, 48], lifted(1843)),
        canada1844: inside([-61, 48], lifted(1844)),
        canadaSource: doc.knowledge?.find(k => k.id === 'kanada-sydost-1844')?.sources?.[0],
        baffinBefore: inside([-62, 74], lifted(1902)),
        baffin1903: inside([-62, 74], lifted(1903)),
        baffinSource: doc.knowledge?.find(k => k.id === 'baffinbukten-1903')?.sources?.[0],
        africaBefore: inside([-1, -10], lifted(1574)),
        africa: inside([-1, -10], lifted(1575)),
        africaInterior: inside([18, 0], lifted(1844)),
        africaSource: doc.knowledge?.find(k => k.id === 'afrika-1575')?.sources?.[0],
        southAmericaBefore: inside([-51, -5], lifted(1561)),
        southAmerica: inside([-51, -5], lifted(1562)),
        southAmericaInterior: inside([-60, -10], lifted(1844)),
        southAmericaSource: doc.knowledge?.find(k => k.id === 'sydamerika-1562')?.sources?.[0],
        caribbeanBefore: inside([-72, 19], lifted(1561)),
        caribbean1562: inside([-72, 19], lifted(1562)),
        caribbeanSource: doc.knowledge?.find(k => k.id === 'karibien-1562')?.sources?.[0],
        pacificBefore: inside([-149, -17], lifted(1776)),
        pacific1777: inside([-149, -17], lifted(1777)),
        pacificSource: doc.knowledge?.find(k => k.id === 'sodra-stilla-havet-1777')?.sources?.[0],
        asiaBefore: inside([75, 30], lifted(1578)),
        asia: inside([75, 30], lifted(1579)),
        asiaSource: doc.knowledge?.find(k => k.id === 'asien-1579')?.sources?.[0],
        centralAsiaBefore: inside([75, 40], lifted(1838)),
        centralAsia1839: inside([75, 40], lifted(1839)),
        centralAsiaSource: doc.knowledge?.find(k => k.id === 'centralasien-1839')?.sources?.[0],
        farEastBefore: inside([160, 55], lifted(1843)),
        farEast1844: inside([160, 55], lifted(1844)),
        farEastSource: doc.knowledge?.find(k => k.id === 'ryska-fjarran-ostern-1844')?.sources?.[0],
        australiaBefore: inside([119, -21], lifted(1658)),
        australia: inside([119, -21], lifted(1659)),
        australiaSource: doc.knowledge?.find(k => k.id === 'australien-vastkust-1659')?.sources?.[0],
        australiaEastBefore: inside([150, -28], lifted(1807)),
        australiaEast1808: inside([150, -28], lifted(1808)),
        australiaInterior: inside([134, -25], lifted(1844)),
        australiaEastSource: doc.knowledge?.find(k => k.id === 'australien-kuster-1808')?.sources?.[0],
        antarcticaBefore: inside([130, -67], lifted(1843)),
        antarctica: inside([130, -67], lifted(1844)),
        antarcticaSource: doc.knowledge?.find(k => k.id === 'antarktis-wilkes-land-1844')?.sources?.[0],
      };
    });
    if (r.source !== 'loc-mitchell-map-1755') throw new Error(`kartkunskapen saknar Mitchell-källan: ${r.source}`);
    if (r.before || !r.mitchellArea || r.west) throw new Error(`fel tids- eller områdesavgränsning: ${JSON.stringify(r)}`);
    if (r.usaSource !== 'loc-burr-usa-1839' || r.usaBefore || !r.usa1839) throw new Error(`USA:s senare kartkunskap har fel källa eller tid: ${JSON.stringify(r)}`);
    if (r.siberiaSource !== 'loc-piadyshev-russian-empire-1827' || r.siberiaBefore || !r.siberia1827) throw new Error(`Sibiriens senare kartkunskap har fel källa eller tid: ${JSON.stringify(r)}`);
    if (r.canadaSource !== 'loc-tanner-atlas-1844' || r.canadaBefore || !r.canada1844) throw new Error(`Kanadas senare kartkunskap har fel källa eller tid: ${JSON.stringify(r)}`);
    if (r.baffinSource !== 'loc-polar-regions-1903' || r.baffinBefore || !r.baffin1903) throw new Error(`Baffinbuktens kartkunskap har fel källa eller tid: ${JSON.stringify(r)}`);
    if (r.africaSource !== 'loc-ortelius-africa-1575' || r.africaBefore || !r.africa || r.africaInterior) throw new Error(`Afrikas källbelagda område har fel källa, tid eller för brett inland: ${JSON.stringify(r)}`);
    if (r.southAmericaSource !== 'loc-gutierrez-americas-1562' || r.southAmericaBefore || !r.southAmerica || r.southAmericaInterior) throw new Error(`Sydamerikas källbelagda område har fel källa, tid eller för brett inland: ${JSON.stringify(r)}`);
    if (r.caribbeanSource !== 'loc-gutierrez-americas-1562' || r.caribbeanBefore || !r.caribbean1562) throw new Error(`Karibiens kartkunskap har fel källa eller tid: ${JSON.stringify(r)}`);
    if (r.pacificSource !== 'loc-cook-south-pacific-1777' || r.pacificBefore || !r.pacific1777) throw new Error(`Södra Stilla havets kartkunskap har fel källa eller tid: ${JSON.stringify(r)}`);
    if (r.asiaSource !== 'loc-ortelius-asia-1579' || r.asiaBefore || !r.asia) throw new Error(`Asiens källbelagda område har fel källa eller tid: ${JSON.stringify(r)}`);
    if (r.centralAsiaSource !== 'loc-berghaus-central-asia-1839' || r.centralAsiaBefore || !r.centralAsia1839) throw new Error(`Centralasiens senare kartkunskap har fel källa eller tid: ${JSON.stringify(r)}`);
    if (r.farEastSource !== 'loc-russian-asia-1844' || r.farEastBefore || !r.farEast1844) throw new Error(`Ryska Fjärran österns kartkunskap har fel källa eller tid: ${JSON.stringify(r)}`);
    if (r.australiaSource !== 'loc-blaeu-new-holland-1659' || r.australiaBefore || !r.australia) throw new Error(`Australiens källbelagda område har fel källa eller tid: ${JSON.stringify(r)}`);
    if (r.australiaEastSource !== 'loc-freycinet-new-holland-1808' || r.australiaEastBefore || !r.australiaEast1808 || r.australiaInterior) throw new Error(`Australiens senare kartkunskap har fel källa, tid eller för brett inland: ${JSON.stringify(r)}`);
    if (r.antarcticaSource !== 'loc-wilkes-antarctica-1844' || r.antarcticaBefore || !r.antarctica) throw new Error(`Antarktis källbelagda område har fel källa eller tid: ${JSON.stringify(r)}`);
    return 'Varje världsdel har en tidsbunden, källbelagd kontrollpunkt; bara kartans dokumenterade område lyfts';
  });

  // #872: Europa är känt från vyns början. Utan riken och resor är dimman redan lyft över Europa vid tidslinjens början (Paris, Uppsala,
  // Moskva väster om Ural), men inte över Peking, Ankara eller Sibirien. Gränsen kommer ur data/upptackt-europa.json.
  await check('upptäcktsvyn lyfter dimman över Europa från vyns början (#872)', async () => {
    const r = await page.evaluate(async () => {
      const { DiscoveryLayer } = await import('./js/layers/discovery.js');
      const { MIN_YEAR } = await import('./js/timeline.js');
      const doc = await (await fetch('data/upptackt.json')).json();
      const layer = new DiscoveryLayer(doc, null);
      layer.enabled = true;
      layer._loadImages = () => {};
      layer.update({ year: MIN_YEAR, lines: { routes: [], reached: () => [] } });
      for (let i = 0; i < 100 && !layer.regions.length; i++) await new Promise(res => setTimeout(res, 100));
      layer.fogKey = null;
      layer.update({ year: MIN_YEAR, lines: { routes: [], reached: () => [] } });
      const inRing = (pt, ring) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
      const inside = pt => layer.lifted.some(g => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).some(rings => inRing(pt, rings[0]) && !rings.slice(1).some(h => inRing(pt, h))));
      return { firstYear: MIN_YEAR, regioner: layer.regions.length, lyfta: layer.lifted.length, paris: inside([2.35, 48.85]), uppsala: inside([17.64, 59.86]), moskva: inside([37.6, 55.75]), peking: inside([116.4, 39.9]), ankara: inside([32.85, 39.93]), sibirien: inside([90, 60]) };
    });
    if (!r.regioner) throw new Error('Europa-regionen laddades inte');
    if (!r.paris || !r.uppsala || !r.moskva) throw new Error(`Europa är inte lyft: ${JSON.stringify(r)}`);
    if (r.peking || r.ankara || r.sibirien) throw new Error(`dimman är lyft utanför Europa: ${JSON.stringify(r)}`);
    return `Paris, Uppsala och Moskva lyfta år ${r.firstYear}; Peking, Ankara och Sibirien dolda (${r.lyfta} geometrier)`;
  });

  // Hemriken: vyn ser världen från Europa, så Makedonien (med Alexanders erövringar) och dess grannar syns utan
  // resor. Persiska riket är granne till Makedonien; Hanriket låg aldrig nära ett hemrike och förblir dolt.
  await check('upptäcktsvyn lyfter dimman över hemrikena och deras grannar', async () => {
    const r = await page.evaluate(async () => {
      const { DiscoveryLayer } = await import('./js/layers/discovery.js');
      const get = url => fetch(url).then(res => res.json());
      const [doc, index] = await Promise.all([get('data/upptackt.json'), get('data/empires/index.json')]);
      const layer = new DiscoveryLayer(doc, null);
      layer.enabled = true;
      layer._loadImages = () => {};
      for (const id of ['alexanders-rike', 'persiska-riket', 'hanriket']) {
        const group = index.groups.find(g => g.id === id);
        if (!group) return { missing: id };
        layer.addEmpire(id, (await get(group.file)).polities);
      }
      const shown = year => {
        layer.fogKey = null;
        layer.update({ year, lines: { routes: [], reached: () => [] } });
        return [...layer.empires].filter(([, e]) => layer.lifted.some(g => e.periods.some(q => q.geometry === g))).map(([id]) => id);
      };
      return { y257: shown(-257), y700: shown(-700) };
    });
    if (r.missing) throw new Error(`${r.missing} saknas i data/empires/index.json`);
    if (!r.y257.includes('alexanders-rike')) throw new Error('dimman är inte lyft över Makedonien 257 f.Kr.');
    if (!r.y257.includes('persiska-riket')) throw new Error('dimman är inte lyft över grannen Persiska riket 257 f.Kr.');
    if (r.y257.includes('hanriket')) throw new Error('dimman lyfts över Hanriket fast det aldrig gränsade till ett hemrike');
    if (r.y700.includes('persiska-riket')) throw new Error('dimman lyfts över Persiska riket innan det fanns');
    return `257 f.Kr.: ${r.y257.join(', ')}`;
  });

  // Vad hände här? (#15): fliken Plats i Sök och följ
  await check('fliken Plats: sök en plats, se händelserna nära den i tidsordning och öppna en (#15)', async () => {
    await clickView('#btn-focus');
    await visible('#focus-menu');
    try {
      await page.click('#focus-menu [data-tab="Plats"]');
      if (!/plats/i.test(await page.getAttribute('#focus-menu .focus-search', 'placeholder'))) throw new Error('sökrutan fick inte platstext');
      if (!(await page.textContent('#focus-menu .focus-body')).includes('bland händelserna')) throw new Error('raden om att bara platser i datan hittas saknas');
      await page.fill('#focus-menu .focus-search', 'zzzzqq');
      await page.waitForSelector('#focus-menu .focus-body .layer-note:has-text("Ingen plats")', { timeout: T.step });
      await page.fill('#focus-menu .focus-search', 'rom');
      await page.waitForSelector('#focus-menu [data-place]', { timeout: T.step });
      // Enter i sökrutan väljer första förslaget (tangentbord)
      await page.press('#focus-menu .focus-search', 'Enter');
      await page.waitForSelector('#focus-menu [data-place-reset]', { timeout: T.step });
      const head = await page.textContent('#focus-menu .focus-active-text');
      if (!/händelse(r)? inom 300 km från/.test(head)) throw new Error(`rubriken saknar urvalet: "${head}"`);
      const rows = await page.locator('#focus-menu [data-key]').evaluateAll(els => els.map(e => ({ key: e.dataset.key, text: e.textContent })));
      const n = Number(/^(\d+)/.exec(head.trim())?.[1]);
      if (!rows.length || rows.length !== n) throw new Error(`rubriken säger ${n} men listan har ${rows.length} rader`);
      if (rows.some(r => !r.key.startsWith('event:'))) throw new Error('en rad är inte en händelse');
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('horisontell scroll i Plats');
      // Ett klick öppnar händelsen och flyttar tiden, som Sök gör
      const first = rows[0].key.slice(6);
      await page.locator('#focus-menu [data-key]').first().click();
      await hidden('#focus-menu');
      await visible('#detail');
      if (!(await page.textContent('#detail')).length) throw new Error('faktarutan är tom');
      // Tillbaka: Välj en annan plats rensar
      await clickView('#btn-focus');
      await visible('#focus-menu');
      await page.click('#focus-menu [data-tab="Plats"]');
      await page.fill('#focus-menu .focus-search', 'rom');
      await page.locator('#focus-menu [data-place]').first().click();
      await page.click('#focus-menu [data-place-reset]');
      if (await page.inputValue('#focus-menu .focus-search')) throw new Error('"Välj en annan plats" rensade inte sökrutan');
      if (await page.locator('#focus-menu [data-key]').count()) throw new Error('listan låg kvar efter "Välj en annan plats"');
      return `Rom: "${head.trim()}", ${rows.length} rader i tidsordning, Enter väljer första förslaget, ${first} öppnas`;
    } finally {
      if (await page.isVisible('#focus-menu')) await page.keyboard.press('Escape');
      if (await page.isVisible('#detail')) await page.keyboard.press('Escape');
    }
  });

  await check('Fokus öppnas och följer ett rike', async () => {
    if (!(await page.locator('#religion-legend').isHidden())) throw new Error('rikesförklaringen syns på startskärmen');
    await clickView('#btn-focus');
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
    await clickView('#btn-focus');
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
      await development.locator(':scope > summary').click();
      if (await development.getAttribute('open') === null) throw new Error('Hur riket förändrades gick inte att öppna');
      await sources.locator(':scope > summary').click();
      if (await sources.getAttribute('open') === null) throw new Error('Källor och karta gick inte att öppna');
    }
    await shot('6-fokus-rike');
    await page.click('#focus-exit');
    await hidden('#focus-bar');
    return `${label} → "${title}"`;
  });

  await check('Fokus har en huvudknapp för uppspelning', async () => {
    try {
      await clickView('#btn-focus');
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
        // WebKit utan grafikkort hinner ibland inte hantera klicket innan synced() läser läget, som då fortfarande
        // är ett synkat "Pausa". Vänta därför först på att tidslinjen har lämnat Pausa (själva kontrollen står kvar nedan).
        await page.waitForFunction(() => document.getElementById('btn-play').getAttribute('aria-label') !== 'Pausa', null, { timeout: T.step }).catch(() => {});
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
      await clickView('#btn-focus');
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
      // #647: fokusraden får inte ligga över pausraden, inte heller när noten är utfälld,
      // och raden "Tiden flyttades" ska inte ligga kvar när uppspelningen har startat.
      if (await page.locator('#focus-moved').isVisible()) throw new Error('raden "Tiden flyttades" ligger kvar under uppspelningen');
      const overlap = () => page.evaluate(() => {
        const a = document.getElementById('focus-bar').getBoundingClientRect();
        const b = document.getElementById('pause-note').getBoundingClientRect();
        return a.bottom > b.top + 1 && a.top < b.bottom - 1 && a.right > b.left && a.left < b.right;
      });
      if (await overlap()) throw new Error('fokusraden ligger över pausraden');
      await page.click('#pause-more summary');
      await page.waitForFunction(() => document.getElementById('pause-more').open, null, { timeout: T.step });
      // ResizeObserver flyttar fokusraden efter att noten har fällts ut (#888: en fast väntan på 100 ms räckte inte i
      // Firefox i CI). Vänta på tillståndet i stället: raderna ska sluta överlappa inom T.step, annars är det ett fel.
      await page.waitForFunction(() => {
        const a = document.getElementById('focus-bar').getBoundingClientRect();
        const b = document.getElementById('pause-note').getBoundingClientRect();
        return !(a.bottom > b.top + 1 && a.top < b.bottom - 1 && a.right > b.left && a.left < b.right);
      }, null, { timeout: T.step }).catch(() => { throw new Error('fokusraden ligger över pausraden när noten är utfälld'); });
      await page.click('#pause-more summary');
      const pauseText = (await page.textContent('#pause-text')).replace(/\s+/g, ' ').trim();
      await page.waitForFunction(text => document.getElementById('screen-reader-status')?.textContent.includes(text), pauseText, { timeout: T.step });
      await shot('6b-fokus-resa-stopp');
      await shot('538-fokus-columbus');
      await page.click('#focus-exit');
      await hidden('#focus-bar');

      await clickView('#btn-layers');
      await visible('#layer-menu');
      if (await page.locator('#layer-custom').isHidden()) await page.click('#layer-customize');
      const stops = page.locator('input[data-pause="route"]');
      await stops.waitFor({ state: 'visible', timeout: T.step });
      if (!(await stops.isChecked())) throw new Error('resestoppen är inte på som standard');
      await stops.click();
      await page.keyboard.press('Escape');
      await hidden('#layer-menu');

      await clickView('#btn-focus');
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
      return `${speed}; stoppet vid Palos pausar med plats, datum, resa och not utan att krocka med fokusraden; valet kan stängas av`;
    } finally {
      const action = page.locator('#focus-action');
      if (await action.isVisible().catch(() => false) && (await action.textContent()).includes('Pausa')) await action.click();
      if (await page.locator('#focus-bar').isVisible().catch(() => false)) await page.click('#focus-exit');
      // Återställ inställningen, så att senare flöden får sidans standard.
      if (!(await page.locator('#layer-menu').isVisible().catch(() => false))) await clickView('#btn-layers');
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
      await clickView('#btn-focus');
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

  // Magellans resa fick källbelagda stopp med korta platsnamn (#1377)
  await check('Magellans resa har tio stopp med korta namn', async () => {
    try {
      await clickView('#btn-focus');
      await visible('#focus-menu');
      await page.click('#focus-menu [data-tab="Resor"]');
      await page.fill('#focus-menu .focus-search', 'Magellan');
      const route = page.locator('#focus-menu .focus-item[data-key="route:magellan-elcano"]');
      await route.waitFor({ state: 'visible', timeout: T.step });
      await route.click();
      await visible('#focus-bar');
      const marks = await page.locator('.tdot.route-stop').evaluateAll(nodes => nodes.map(node =>
        node.getAttribute('aria-label') || node.title));
      if (marks.length !== 10) throw new Error(`Magellans resa har ${marks.length} stopp, inte 10: ${marks.join(' | ')}`);
      for (const label of ['Sevilla · avfärd 10 augusti 1519', 'Mactan · 27 april 1521', 'Sanlúcar de Barrameda · 6 september 1522']) {
        if (!marks.some(mark => mark.includes(label))) throw new Error(`resestoppet saknas: ${label} (${marks.join(' | ')})`);
      }
      if (marks.some(mark => /: Magellan|\(övervintring\)|: Victoria/.test(mark))) throw new Error(`ett stopp har fortfarande en mening som namn: ${marks.join(' | ')}`);
      return `10 stopp, bland annat ${marks[0]}`;
    } finally {
      if (await page.locator('#focus-bar').isVisible().catch(() => false)) await page.click('#focus-exit');
      await hidden('#focus-bar');
      if (await page.locator('#focus-menu').isVisible().catch(() => false)) await page.keyboard.press('Escape');
    }
  });

  // Fokus-menyn hade religionerna bara första gången den öppnades, när lagret Religioner inte hade öppnats (#402-uppdelningen)
  await check('Fokus-menyn har religionerna också andra gången den öppnas', async () => {
    const counts = [];
    try {
      for (let i = 0; i < 2; i++) {
        await clickView('#btn-focus');
        await visible('#focus-menu');
        await page.click('#focus-menu [data-tab="Religioner"]');
        await page.fill('#focus-menu .focus-search', 'Kristendom');
        await page.locator('#focus-menu .focus-item[data-key="religion:kristendom"]').waitFor({ state: 'visible', timeout: T.step })
          .catch(() => { throw new Error(`Kristendom saknas i Fokus-menyn gång ${i + 1}`); });
        counts.push(await page.locator('#focus-menu .focus-item').count());
        await page.keyboard.press('Escape');
        await hidden('#focus-menu');
      }
      return `Kristendom finns båda gångerna (${counts.join(' och ')} träffar)`;
    } finally {
      if (await page.isVisible('#focus-menu')) await page.keyboard.press('Escape');
      await page.evaluate(() => localStorage.removeItem('hg-focus-tab'));
      await clickView('#btn-focus');
      await page.fill('#focus-menu .focus-search', '');
      await page.click('#focus-menu [data-tab="Alla"]');
      await page.keyboard.press('Escape');
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
      await jumpTo((await timelineBounds(page)).min);
      const beforeFocus = await yearNumber();
      const cameraBeforeFocus = await page.locator('#globe-canvas').screenshot();
      await shot('538-fore-fokus');

      for (const item of cases) {
        await clickView('#btn-focus');
        await visible('#focus-menu');
        await page.click(`#focus-menu [data-tab="${item.tab}"]`);
        await page.fill('#focus-menu .focus-search', item.query);
        const row = page.locator(`#focus-menu .focus-item[data-key="${item.key}"]`);
        await row.waitFor({ state: 'visible', timeout: T.step });
        await row.click();
        // #635: hoppet från 3000 f.Kr. ritar om hela lagerbilden (4096 × 2048) och laddar upp den till grafiken. Utan
        // grafikkort, som i CI och i molnet, kan sidan då stå still i över 20 sekunder, så att visible() med T.step
        // tar slut fast sidan gör rätt. Vänta därför på tillståndet (fokusraden och raden Tillbaka till) med T.load.
        await page.waitForFunction(() => {
          const bar = document.getElementById('focus-bar'), link = document.getElementById('focus-moved-back');
          return !bar.hidden && bar.offsetHeight > 0 && link.offsetParent !== null;
        }, null, { timeout: T.load, polling: 250 });
        const back = page.locator('#focus-moved-back');
        if (!(await back.textContent()).includes('Tillbaka till')) throw new Error(`${item.key}: Tillbaka saknar årtal`);
        if (item.shot) await shot(item.shot);

        await back.click();
        // Tillbaka till 3000 f.Kr. ritar om lagerbilden igen (se ovan)
        await page.waitForFunction(() => document.getElementById('focus-bar').hidden, null, { timeout: T.load, polling: 250 });
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

  await check('Samtidigt-pauser kan slås av i Lager och fortsätter själv efter nedräkning', async () => {
    const previousYear = await yearNumber();
    const funfactsOn = await page.locator(layerRow('funfacts')).isChecked();
    const pauseOn = await page.locator('input[data-pause="funfacts"]').isChecked();
    const autoOn = await page.locator('input[data-pause="ffAuto"]').isChecked();
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

      const atCard = () => page.waitForFunction(() => {
        const note = document.getElementById('pause-note');
        return note && !note.hidden && note.textContent.includes('Pausad vid ett nytt Samtidigt-kort');
      }, null, { timeout: T.step });
      const playLabel = () => page.locator('#btn-play').getAttribute('aria-label');

      // Fortsätt själv (#578, på som standard): nedräkning som skärmläsaren inte får, sedan fortsätter uppspelningen
      await setPause('ffAuto', true);
      await page.keyboard.press('Escape');
      await jumpTo(target.year - 1);
      await page.click('#btn-play');
      await atCard();
      const cd = page.locator('#pause-countdown');
      if (!(await cd.isVisible()) || !/Fortsätter om \d/.test(await cd.textContent())) throw new Error('nedräkningen syns inte vid Samtidigt-kortet');
      if (await cd.getAttribute('aria-hidden') !== 'true') throw new Error('nedräkningen ska inte läsas upp varje sekund');
      await page.waitForFunction(() => document.getElementById('btn-play').getAttribute('aria-label') === 'Pausa'
        && document.getElementById('pause-countdown').hidden, null, { timeout: 20000 });
      await page.click('#btn-play');

      // Rör man kortet under nedräkningen avbryts den och uppspelningen står still
      await jumpTo(target.year - 1);
      await page.click('#btn-play');
      await atCard();
      await page.dispatchEvent('#funfact', 'pointerdown');
      if (await cd.isVisible()) throw new Error('nedräkningen avbröts inte när man rörde kortet');
      await page.waitForTimeout(3500);
      if (await playLabel() === 'Pausa') throw new Error('uppspelningen fortsatte fast nedräkningen avbröts');

      // Utan Fortsätt själv står uppspelningen still tills man trycker Fortsätt
      await setPause('ffAuto', false);
      await page.keyboard.press('Escape');
      await jumpTo(target.year - 1);
      await page.click('#btn-play');
      await atCard();
      if (await cd.isVisible()) throw new Error('nedräkningen syns fast Fortsätt själv är av');
      await page.waitForTimeout(3500);
      if (await playLabel() === 'Pausa') throw new Error('uppspelningen fortsatte fast Fortsätt själv är av');

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
      return `paus vid kortet år ${target.year} med nedräkning som fortsätter själv, avbryts av kortet och kan stängas av; avstängd paus låter uppspelningen fortsätta`;
    } finally {
      if (await page.locator('#btn-play').getAttribute('aria-label') === 'Pausa') await page.click('#btn-play');
      await setPause('ffAuto', autoOn);
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
      await clickView('#btn-focus');
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
      // Översikten (#1000): många händelser blir ett täthetsband, inte hundratals knappar
      if (await page.locator('.tdensity').count() !== 1) throw new Error('Översikten saknar täthetsband');
      if (await page.locator('.tdot, .tspan').count() > 100) throw new Error('Översikten har för många enskilda händelsemärken');
      await setLayer('events', false);
      if (await page.locator('.tdot, .tdensity').count() !== 0) throw new Error('Händelsemärken eller band ligger kvar när Händelser är av');
      await setLayer('events', true);
      await setLayer('funfacts', true);
      if (await page.locator('.tff').count() < 1) throw new Error('Samtidigt saknar romber på tidslinjen');
      const eventMark = page.locator('.tff').first();
      await eventMark.focus();
      const note = page.locator('#timeline-mark-note');
      if (await note.isHidden() || !(await note.textContent()).trim()) throw new Error('Tangentbordsfokus visar inte märkets text');
      await setLayer('routes', true);
      await page.keyboard.press('Escape');
      await clickView('#btn-focus');
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
      await clickView('#btn-focus');
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

  await check('källhänvisning kan kopieras från händelsen och finns på affischen (#844)', async () => {
    if (await page.locator('#detail').isVisible()) await page.locator('#detail [data-close]').click();
    const event = page.locator('#ff-events .ff-chip').first();
    await event.evaluate(el => el.click());
    await page.waitForSelector('#detail [data-citation]', { state: 'visible', timeout: T.step });
    await page.evaluate(() => { window.__copiedCitation = null; Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.__copiedCitation = text; } }, configurable: true }); });
    await page.locator('#detail [data-citation]').click();
    await page.waitForFunction(() => window.__copiedCitation, null, { timeout: T.step });
    const citation = await page.evaluate(() => ({
      text: window.__copiedCitation,
      status: document.querySelector('#detail [data-citation-status]')?.textContent.trim(),
      role: document.querySelector('#detail [data-citation-status]')?.getAttribute('role'),
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));
    const posterLine = await page.evaluate(async () => {
      const [{ posterCitation }, doc] = await Promise.all([import('./js/ui/citation.js'), fetch('data/sources.json').then(response => response.json())]);
      const source = doc.sources[0];
      return posterCitation([{ sources: [source.id] }], { [source.id]: source });
    });
    if (!citation.text.includes('historiagloben.se') || !citation.text.includes('CC BY 4.0') || !/^.+\(.+\)\./.test(citation.text)) throw new Error(`urklippet saknar händelse, adress eller licens: ${citation.text}`);
    if (!citation.status || citation.role !== 'status') throw new Error('kopieringen saknar läsbar bekräftelse');
    if (!posterLine.includes('historiagloben.se') || !posterLine.includes('CC BY 4.0') || !posterLine.includes('naturalearthdata.com')) throw new Error(`affischens källrad saknar källa, adress eller licens: ${posterLine}`);
    if (citation.overflow) throw new Error('källhänvisningen ger horisontell scroll');
    await page.locator('#detail [data-close]').click();
    await jumpTo(ROUTE_YEAR); // lämna sidan i samma läge som före kontrollen, annars felar "en väg syns" efteråt i mobilbredd
    return 'urklippet har händelse, år, källor, adress och licens; bekräftelsen har role=status och affischen ritar källrad';
  });

  // #1097: ett område som korsar datumlinjen (180°) ritas vid båda kanterna av den platta bilden, inte som ett band tvärs
  // över kartan. Ritas med områdeslagrets egen bana (tracePath i js/layers/area-style.js) på en riktig canvas.
  await check('områden över datumlinjen ritas vid kanterna, inte tvärs över kartan (#1097)', async () => {
    if (vp.width <= 760) return 'körs i datorjobbet';
    const r = await page.evaluate(async () => {
      const { tracePath } = await import('./js/layers/area-style.js');
      const W = 2048, H = 1024, c = document.createElement('canvas');
      c.width = W; c.height = H;
      const ctx = c.getContext('2d');
      const X = lon => (lon + 180) / 360 * W, Y = lat => (90 - lat) / 180 * H;
      tracePath(ctx, { type: 'Polygon', coordinates: [[[160, 50], [-170, 50], [-170, 62], [160, 62], [160, 50]]] }, X, Y);
      ctx.fillStyle = '#ff0000'; ctx.fill('evenodd');
      const at = (lon, lat) => ctx.getImageData(Math.min(W - 1, Math.round(X(lon))), Math.round(Y(lat)), 1, 1).data[3];
      return { east: at(170, 56), west: at(-175, 56), middle: at(0, 56), europe: at(30, 56) };
    });
    if (!r.east || !r.west) throw new Error(`området saknas vid kanterna: ${JSON.stringify(r)}`);
    if (r.middle || r.europe) throw new Error(`området ritas tvärs över kartan: ${JSON.stringify(r)}`);
    return 'fyllt vid 170° öst och 175° väst, tomt vid 0° och 30° öst';
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
    const n = await layerDraws('nattljus', 5000);
    await shot('8-bildlager-2016');
    return `${n} pixlar ändras när Nattljus slås på`;
  });

  // Bildlagren (#1325): nattljuset hette images som lager före formatet med rader; en äldre delad länk ska slå på det
  await check('en äldre länk med l=images slår på nattljuset', async () => {
    const linkPage = await context.newPage();
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await linkPage.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await linkPage.route(u => isFont(u.href), r => r.abort());
      }
      await linkPage.goto(`${BASE}#y=2016&l=events,areas,images`);
      await linkPage.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await linkPage.waitForFunction(() => document.querySelector('#layer-menu input[data-layer="nattljus"]')?.checked, null, { timeout: T.step });
      const got = await linkPage.evaluate(() => ({
        old: !!document.querySelector('#layer-menu input[data-layer="images"]'),
        events: document.querySelector('#layer-menu input[data-layer="events"]').checked,
        routes: document.querySelector('#layer-menu input[data-layer="routes"]').checked,
      }));
      if (got.old) throw new Error('raden med det äldre id:t images finns kvar i Lager');
      if (!got.events || got.routes) throw new Error(`länkens övriga lager stämmer inte (events ${got.events}, routes ${got.routes})`);
      // Adressen skrivs om med det nya id:t, så att en ny delning inte sprider det äldre
      await linkPage.waitForFunction(() => /[=,]nattljus(,|&|$)/.test(location.hash) && !/[=,]images(,|&|$)/.test(location.hash), null, { timeout: T.step });
      return 'Nattljus är på, och adressen skriver nattljus';
    } finally { await linkPage.close(); }
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
      .some(el => /Kriget i Afghanistan.* · 5 år före \(2021\)/.test(el.textContent)), null, { timeout: T.step });
    const label = await page.locator('#flat-labels .glabel').filter({ hasText: 'Kriget i Afghanistan' }).textContent();
    if (!label.includes('5 år före (2021)')) throw new Error(`Afghanistan saknar slutetikett: ${label}`);
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
    await clickView('#btn-layers');
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
    await clickView('#btn-layers');
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
    await clickView('#btn-focus');
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
    if (!(await page.locator('#detail .review-badge').count())) throw new Error('krigets slutkort saknar granskningsstatus (#608)');
    if (!summary.includes('Andra världskriget')) throw new Error('slutkortet saknar krigets namn');
    // Slutkortet animeras in samtidigt som WebGL-ytan ritar om. Stäng av just skärmbildens
    // rörelser i stället för att vänta på en stilla canvas som inte hör till kortet.
    await page.locator('#detail').screenshot({ path: path.join(OUT, `${vp.name}-9-krigets-slut.png`), animations: 'disabled' });
    return 'Spela klart når slutkortet';
  });

  await check('reservspråket: upplysning vid språkbyte och lang på engelsk text (#1308)', async () => {
    if (vp.width <= 760) return 'körs i datorjobbet';
    const pp = await context.newPage();
    const errors = [];
    pp.on('pageerror', e => errors.push(e.message));
    pp.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) errors.push(m.text()); });
    try {
      if (THREE_LOCAL) {
        await pp.route(THREE_URL, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(THREE_LOCAL, 'utf8') }));
        await pp.route(u => isFont(u.href), r => r.abort());
      }
      await pp.goto(`${BASE}?lang=sv#y=1600`);
      await pp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      if (await pp.locator('.lang-notice').count()) throw new Error('upplysningen syns utan språkbyte');
      // Byt till tyska i språkväljaren; sidan laddas om
      await pp.click('#btn-lang');
      await Promise.all([pp.waitForEvent('load', { timeout: T.load }), pp.click('#lang-menu [data-lang="de"]')]);
      await pp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await pp.waitForSelector('.lang-notice', { timeout: T.step });
      const note = (await pp.textContent('.lang-notice p')).trim();
      const want = await pp.evaluate(async () => (await import('./js/i18n.js')).ui('lang.beta'));
      if (note !== want || !/Englisch/.test(note)) throw new Error(`upplysningen: ${note}`);
      await pp.click('.lang-notice-close');
      if (await pp.locator('.lang-notice').count()) throw new Error('upplysningen stängs inte');
      // Samtidigt-listan: titlar som saknar tyska visas på engelska och märks lang="en"
      if (await pp.locator('#panel').isHidden()) await pp.click('#btn-panel');
      await pp.waitForSelector('#panel .event-btn .ttl', { timeout: T.load });
      const marks = await pp.evaluate(() => [...document.querySelectorAll('#panel .event-btn .ttl')].map(el => el.getAttribute('lang')));
      if (!marks.includes('en')) throw new Error(`ingen titel med lang="en" år 1600: ${JSON.stringify(marks)}`);
      if (marks.includes('de')) throw new Error('en tysk titel har fått lang="de" fast sidan redan är tysk');
      // En omladdning utan nytt byte visar inte upplysningen igen
      await pp.reload();
      await pp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      if (await pp.locator('.lang-notice').count()) throw new Error('upplysningen visas igen utan språkbyte');
      if (errors.length) throw new Error(errors[0]);
      return `${marks.filter(m => m === 'en').length} av ${marks.length} titlar på engelska`;
    } finally {
      try { await pp.evaluate(() => localStorage.removeItem('hg-lang')); } catch { /* sidan är redan stängd */ }
      await pp.close();
    }
  });

  // Upplysningen efter byte till de, es eller fr ska aldrig ligga över en knapp, när knappraden blir två rader (#1378).
  // Namnet börjar som kontrollen ovan, så att den ligger i samma CI-jobb (tests/jobb.json).
  await check('reservspråket: upplysning vid språkbyte täcker inga knappar i dator- och surfplattebredd (#1378)', async () => {
    if (vp.width <= 760) return 'körs i datorjobbet';
    const fel = [];
    let antal = 0;
    for (const lang of ['de', 'es', 'fr']) {
      const pp = await context.newPage();
      const errors = [];
      pp.on('pageerror', e => errors.push(e.message));
      pp.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) errors.push(m.text()); });
      try {
        if (THREE_LOCAL) {
          await pp.route(THREE_URL, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(THREE_LOCAL, 'utf8') }));
          await pp.route(u => isFont(u.href), r => r.abort());
        }
        // Som efter ett språkbyte: valet är sparat och upplysningen väntar på nästa laddning
        await pp.addInitScript(l => {
          try { localStorage.setItem('hg-lang', l); sessionStorage.setItem('hg-lang-chosen', l); } catch { /* utan lagring */ }
        }, lang);
        for (const [w, h] of [[1400, 900], [1024, 768]]) {
          await pp.setViewportSize({ width: w, height: h });
          await pp.goto(`${BASE}#y=1600`);
          await pp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
          await pp.waitForSelector('.lang-notice', { timeout: T.step });
          const r = await pp.evaluate(() => {
            const n = document.querySelector('.lang-notice').getBoundingClientRect();
            const knappar = [...document.querySelectorAll('.top-actions button, .top-actions a')]
              .filter(e => e.offsetParent && !e.closest('.lang-notice') && !e.closest('[hidden]'))
              .filter(e => { const b = e.getBoundingClientRect(); return b.width && b.left < n.right && b.right > n.left && b.top < n.bottom && b.bottom > n.top; })
              .map(e => e.id || e.textContent.trim().slice(0, 14));
            return { knappar, synlig: n.left >= 0 && n.right <= innerWidth && n.top >= 0 && n.bottom <= innerHeight };
          });
          if (r.knappar.length) fel.push(`${lang} ${w} px: upplysningen ligger över ${r.knappar.join(', ')}`);
          if (!r.synlig) fel.push(`${lang} ${w} px: upplysningen ligger delvis utanför fönstret`);
          antal++;
        }
        if (errors.length) fel.push(`${lang}: ${errors[0]}`);
      } finally {
        try { await pp.evaluate(() => { localStorage.removeItem('hg-lang'); sessionStorage.removeItem('hg-lang-chosen'); }); } catch { /* sidan är redan stängd */ }
        await pp.close();
      }
    }
    if (fel.length) throw new Error(fel.join('; '));
    return `${antal} kombinationer av språk och bredd utan överlapp`;
  });

  await check('krigskortet på valt språk, inte svenska (#1240)', async () => {
    if (vp.width <= 760) return 'körs i datorjobbet';
    const seen = [];
    for (const lang of ['de', 'fr']) {
      const pp = await context.newPage();
      const errors = [];
      pp.on('pageerror', e => errors.push(e.message));
      pp.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) errors.push(m.text()); });
      try {
        if (THREE_LOCAL) {
          await pp.route(THREE_URL, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(THREE_LOCAL, 'utf8') }));
          await pp.route(u => isFont(u.href), r => r.abort());
        }
        // Första världskriget börjar 1914 och har ett krigskort (warCards i main.js); ingen fakta provas här
        await pp.goto(`${BASE}?lang=${lang}#y=1914`);
        await pp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        await pp.waitForSelector('#ff-text', { timeout: T.load });
        const warKind = await pp.evaluate(async () => (await import('./js/i18n.js')).ui('ff.kind.war'));
        let text = null;
        for (let i = 0; i < 8 && text == null; i++) {
          if ((await pp.textContent('#ff-kind')).trim() === warKind) text = (await pp.textContent('#ff-text')).trim();
          else if (await pp.locator('#ff-next').isVisible()) { await pp.click('#ff-next'); await pp.waitForTimeout(200); }
          else break;
        }
        if (text == null) throw new Error(`${lang}: inget krigskort år 1914`);
        if (/bryter ut|Samtidigt i världen/.test(text)) throw new Error(`${lang}: krigskortet är på svenska: ${text}`);
        if (/ff\.warStarts|\{(war|year)\}/.test(text)) throw new Error(`${lang}: rå nyckel eller platshållare: ${text}`);
        if (errors.length) throw new Error(`${lang}: ${errors[0]}`);
        seen.push(`${lang}: ${text}`);
      } finally { await pp.close(); }
    }
    return seen.join(' | ');
  });

  await check('tidslinjen, årshoppet, Platt vy, affischen och källorna på fem språk (#672)', async () => {
    const copies = {
      sv: ['år/s', 'Källregister', 'Affisch'], en: ['yr/s', 'Source register', 'Poster'],
      de: ['J./s', 'Quellenverzeichnis', 'Plakat'], es: ['años/s', 'Registro de fuentes', 'Póster'],
      fr: ['ans/s', 'Registre des sources', 'Affiche'],
    };
    for (const [lang, [rateUnit, register, poster]] of Object.entries(copies)) {
      const pp = await context.newPage();
      const errors = [];
      pp.on('pageerror', e => errors.push(e.message));
      pp.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) errors.push(m.text()); });
      try {
        if (THREE_LOCAL) {
          await pp.route(THREE_URL, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(THREE_LOCAL, 'utf8') }));
          await pp.route(u => isFont(u.href), r => r.abort());
        }
        await pp.goto(`${BASE}?lang=${lang}`);
        await pp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        const copy = await pp.evaluate(async () => {
          const { ui } = await import('./js/i18n.js');
          return { play: ui('time.play'), pause: ui('time.pause'), bounds: ui('jump.outsideBounds', {
            from: (await import('./js/model.js')).formatYear((await import('./js/timeline.js')).MIN_YEAR),
            to: (await import('./js/model.js')).formatYear((await import('./js/timeline.js')).MAX_YEAR),
          }), day: ui('time.dayShort'), noMatch: ui('sources.noMatch', { query: ui('sources.query', { query: 'zzzz672nomatch' }), where: '' }) };
        });
        if (!(await pp.textContent('#btn-speed')).includes(rateUnit)) throw new Error(`${lang}: hastigheten saknar ${rateUnit}`);
        if (await pp.getAttribute('#btn-play', 'aria-label') !== copy.play) throw new Error(`${lang}: spelknappens namn`);
        const pauseLabel = await pp.evaluate(() => {
          const button = document.getElementById('btn-play');
          button.click(); const label = button.getAttribute('aria-label'); button.click(); return label;
        });
        if (pauseLabel !== copy.pause) throw new Error(`${lang}: pausknappens namn`);
        await pp.click('#year-jump'); await pp.fill('#jump-input', '9999'); await pp.press('#jump-input', 'Enter');
        if ((await pp.textContent('#jump-msg')).trim() !== copy.bounds) throw new Error(`${lang}: årshoppets feltext`);
        await pp.keyboard.press('Escape');
        // Ett kort krig visar dagar i stället för år; bara gränssnittet provas, ingen fakta ändras.
        await pp.evaluate(async () => {
          const { events } = await (await fetch('data/genererat/handelser.json')).json();
          const war = events.find(e => e.id === 'sexdagarskriget');
          // Delade fokuslänkar kräver också y; ett ensamt f ignoreras av decodeHash().
          location.hash = `#y=${Math.floor(war.start)}&f=war:${war.id}`;
        });
        await pp.waitForSelector('#focus-bar:not([hidden])', { timeout: T.load });
        await pp.waitForFunction(() => document.querySelector('#btn-speed .unit-short'), null, { timeout: T.step });
        if (await pp.textContent('#btn-speed .unit-short') !== copy.day) throw new Error(`${lang}: dagförkortningen`);
        await pp.evaluate(() => document.getElementById('btn-sources').click());
        await pp.waitForSelector('#sources-dialog', { state: 'visible', timeout: T.step });
        await pp.waitForSelector('.src-group[data-group="events"]', { timeout: T.load });
        if (!await pp.locator('#sources-body h3').filter({ hasText: register }).count()) throw new Error(`${lang}: källregistrets rubrik`);
        await pp.fill('#src-q', 'zzzz672nomatch');
        if ((await pp.textContent('.src-hits')).trim() !== copy.noMatch) throw new Error(`${lang}: tomt sökresultat`);
        await pp.fill('#src-q', '');
        await pp.waitForSelector('.src-version:not([hidden])', { timeout: T.step });
        const raw = await pp.locator('#sources-body').innerText();
        if (/sources(?:Summary)?\.[a-z]|sourceVersion\./.test(raw)) throw new Error(`${lang}: rå gränssnittsnyckel`);
        await pp.screenshot({ path: path.join(OUT, `${vp.name}-672-${lang}-kallor.png`) });
        if (await pp.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`${lang}: horisontell scroll`);
        await pp.click('#sources-close');
        await pp.evaluate(() => document.getElementById('btn-flat').click());
        await pp.waitForSelector('#flat-poster', { state: 'visible', timeout: T.step });
        if ((await pp.textContent('#flat-poster')).trim() !== poster) throw new Error(`${lang}: affischknappen`);
        const labels = await pp.evaluate(async () => {
          const { createPoster } = await import('./js/ui/poster.js');
          const { ui } = await import('./js/i18n.js');
          const drawn = [], original = CanvasRenderingContext2D.prototype.fillText;
          CanvasRenderingContext2D.prototype.fillText = function (text, ...args) { drawn.push(String(text)); return original.call(this, text, ...args); };
          try {
            const blank = document.createElement('canvas'); blank.width = blank.height = 1;
            createPoster({ baseCanvas: blank, overlayCanvas: blank, year: 1325, events: [] });
          } finally { CanvasRenderingContext2D.prototype.fillText = original; }
          return { drawn, expected: ['title', 'legend', 'sources', 'website', 'license', 'empty'].map(key => ui(`poster.${key}`)) };
        });
        for (const label of labels.expected) if (!labels.drawn.includes(label)) throw new Error(`${lang}: affischen saknar ${label}`);
        if (errors.length) throw new Error(`${lang}: ${errors.join(' | ')}`);
      } finally { await pp.close(); }
    }
    return 'fem språk: hastighet och spelknapp, årshoppets fel, dagläge, källor/sökning och affischens ritade etiketter; ingen rå nyckel eller sidscroll';
  });

  await check('Källor öppnas', async () => {
    await clickView('#btn-sources');
    await visible('#sources-dialog');
    await page.waitForFunction(() => document.getElementById('sources-body').textContent.trim().length > 100, null, { timeout: T.step });
    await page.waitForFunction(() => {
      const row = document.querySelector('.src-version');
      return row && !row.hidden;
    }, null, { timeout: T.step });
    // Om urvalet (#916): rubriken och de fem styckena finns, och ingen rå textnyckel syns
    const urval = page.locator('.src-urval');
    await urval.waitFor({ state: 'visible', timeout: T.step });
    if (await urval.locator('p').count() !== 5) throw new Error('Om urvalet har inte fem stycken');
    if (/sources\.urval/.test(await urval.textContent())) throw new Error('Om urvalet visar en rå textnyckel');
    const version = await page.evaluate(() => fetch('data/version.json').then(response => response.json()));
    const versionRow = page.locator('.src-version');
    const versionText = (await versionRow.textContent()).replace(/\s+/g, ' ').trim();
    if (!versionText.includes(`Version ${version.version}`) || (!version.released && !versionText.includes('utvecklingsversion'))) {
      throw new Error(`versionsraden visar inte versionen och statusen: ${versionText}`);
    }
    if (/sourceVersion|development|releases/.test(versionText)) throw new Error(`versionsraden visar en rå textnyckel: ${versionText}`);
    const releaseLink = versionRow.getByRole('link', { name: 'releaser' });
    if (await releaseLink.getAttribute('href') !== version.releases
      || await releaseLink.getAttribute('target') !== '_blank'
      || await releaseLink.getAttribute('rel') !== 'noopener') {
      throw new Error('releaselänken saknar rätt adress eller säker öppning i ny flik');
    }
    if (vp.name === 'dator') {
      for (const width of [700, 350]) {
        await page.setViewportSize({ width, height: 900 });
        const layout = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          row: document.querySelector('.src-version').getBoundingClientRect(),
        }));
        if (layout.document > layout.viewport || layout.row.right > layout.viewport + 1) {
          throw new Error(`versionsraden får horisontell scroll vid ${width}px: ${JSON.stringify(layout)}`);
        }
      }
      await page.setViewportSize({ width: vp.width, height: vp.height });
    }
    await versionRow.scrollIntoViewIfNeeded();
    const versionBox = await versionRow.boundingBox();
    if (!versionBox || versionBox.bottom > vp.height) throw new Error('versionsraden går inte att rulla fram i Om källorna');
    await shot('7-kallor');
    await page.click('#sources-close');
    await hidden('#sources-dialog');
    return `Version ${version.version}, fungerande releaselänk och omflöde utan horisontell scroll`;
  });

  await check('Om källorna: sammanfattning och statusfilter', async () => {
    await clickView('#btn-sources');
    await visible('#sources-dialog');
    await page.waitForSelector('#src-status option', { state: 'attached', timeout: T.step });
    const rows = await page.locator('.src-summary .src-level').count();
    if (rows !== 3) throw new Error(`sammanfattningen har ${rows} rader i stället för 3`);
    const summaryText = (await page.textContent('.src-summary')).replace(/\s+/g, ' ');
    if (/sourcesSummary|\{status\}/.test(summaryText)) throw new Error(`sammanfattningen visar en rå textnyckel: ${summaryText}`);
    // Tangentbord: filtret nås med Tab från sökrutan och byts med piltangenten
    await page.focus('#src-q');
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => document.activeElement?.id) !== 'src-status') throw new Error('statusfiltret nås inte med Tab från sökrutan');
    const before = await page.locator('.src-list tbody tr').count();
    await page.selectOption('#src-status', 'two');
    const hits = await page.textContent('.src-hits');
    if (!hits.includes('Två källor stämmer')) throw new Error(`träffraden nämner inte filtret: ${hits}`);
    const after = await page.locator('.src-list tbody tr').count();
    if (!after || after >= before) throw new Error(`filtret Två källor stämmer gav ${after} rader av ${before}`);
    await shot('517-kallor-filter');
    // Tomt resultat: ett sökord som inget matchar ger en tydlig rad i stället för en tom lista
    await page.fill('#src-q', 'zzqxv');
    const empty = await page.textContent('.src-hits');
    if (!empty.startsWith('Ingen källa matchar') || await page.locator('.src-list tbody tr').count()) throw new Error(`tomt filterresultat visas inte tydligt: ${empty}`);
    const wide = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (wide) throw new Error('Om källorna får horisontell scroll');
    await page.fill('#src-q', '');
    await page.selectOption('#src-status', '');
    await page.click('#sources-close');
    await hidden('#sources-dialog');
    return `3 rader i sammanfattningen, filtret ger ${after} av ${before} rader, tomt resultat tydligt`;
  });

  if (vp.name === 'dator') {
    await check('versionsraden döljs om versionsfilen saknas', async () => {
      const fallbackPage = await context.newPage();
      const fallbackErrors = [];
      fallbackPage.on('console', message => {
        if (message.type() !== 'error' || isFont(message.location()?.url)) return;
        // Chromium reports an intentional 404 for this optional file as a console error.
        if (message.text() === 'Failed to load resource: the server responded with a status of 404 (Not Found)') return;
        fallbackErrors.push(message.text());
      });
      fallbackPage.on('pageerror', error => fallbackErrors.push(error.message));
      try {
        if (THREE_LOCAL) {
          const body = fs.readFileSync(THREE_LOCAL, 'utf8');
          await fallbackPage.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
          await fallbackPage.route(u => isFont(u.href), r => r.abort());
        }
        await fallbackPage.route('**/data/version.json', route => route.fulfill({ status: 404, body: 'Not found' }));
        await fallbackPage.goto(BASE);
        await fallbackPage.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        const responsePromise = fallbackPage.waitForResponse(response => response.url().endsWith('/data/version.json'));
        await fallbackPage.click('#btn-more'); // Källor ligger bakom Mer i datorn (#651)
        await fallbackPage.click('#btn-sources');
        const response = await responsePromise;
        if (response.status() !== 404) throw new Error(`versionsfilen svarade ${response.status()} i stället för 404`);
        await fallbackPage.waitForFunction(() => document.getElementById('sources-body').textContent.trim().length > 100, null, { timeout: T.step });
        const row = fallbackPage.locator('.src-version');
        if (await row.count() !== 1 || !await row.isHidden()) throw new Error('versionsraden visas trots att data/version.json saknas');
        if (fallbackErrors.length) throw new Error(`saknad versionsfil gav konsolfel: ${fallbackErrors.join('; ')}`);
      } finally {
        await fallbackPage.close();
      }
      return '404 döljer raden utan konsolfel';
    });
  }

  if (vp.name === 'dator') {
    // Tillståndet i adressen (#501) och delbara länkar (#64): en länk återskapar år och fokus, och Bakåt fungerar
    await check('en delad länk återskapar år och fokus', async () => {
      const linkPage = await context.newPage();
      const linkErrors = [];
      linkPage.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) pushConsole(linkErrors, m); });
      linkPage.on('pageerror', e => linkErrors.push(e.message));
      try {
        if (THREE_LOCAL) {
          const body = fs.readFileSync(THREE_LOCAL, 'utf8');
          await linkPage.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
          await linkPage.route(u => isFont(u.href), r => r.abort());
        }
        await linkPage.goto(`${BASE}#y=1630&f=war:trettioariga-kriget&l=areas,events,funfacts`);
        await linkPage.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        await linkPage.waitForSelector('#focus-bar', { state: 'visible', timeout: T.step });
        const got = await linkPage.evaluate(() => ({ year: document.getElementById('year-big').textContent.trim(), title: document.getElementById('focus-title').textContent }));
        if (got.year !== '1630') throw new Error(`länken gav året ${got.year}, inte 1630`);
        if (!/Trettioåriga/.test(got.title)) throw new Error(`länken följer inte trettioåriga kriget (${got.title})`);
        // Lämna fokus: ett nytt steg i historiken. Bakåt ska ge kriget igen.
        await linkPage.click('#focus-exit');
        await linkPage.waitForSelector('#focus-bar', { state: 'hidden', timeout: T.step });
        await linkPage.waitForFunction(() => !location.hash.includes('f=war'), null, { timeout: T.step });
        await linkPage.goBack();
        await linkPage.waitForSelector('#focus-bar', { state: 'visible', timeout: T.step });
        // En trasig länk ger det vanliga startläget utan fel
        await linkPage.goto(`${BASE}?ny=1#y=abc&f=war:finns-inte`); // ?ny=1 gör att sidan laddas om
        await linkPage.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        if (await linkPage.locator('#focus-bar').isVisible()) throw new Error('en trasig länk startade ett fokus');
        if (linkErrors.length) throw new Error(`länken gav konsolfel: ${linkErrors.join('; ')}`);
      } finally {
        await linkPage.close();
      }
      return 'år 1630 och trettioåriga kriget ur länken; Bakåt efter Tillbaka ger kriget igen; trasig länk ger startläget';
    });
  }

  // Den korta kameradressen ?c=lat,lon,zoom används i äldre länkar. Den ska hamna på
  // platsen också efter att den vanliga startflygningen har körts (#1056).
  await check('en kort kameradress stannar på begärd plats', async () => {
    const cameraPage = await context.newPage();
    const cameraErrors = [];
    cameraPage.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url) && !cancelled(m.text())) pushConsole(cameraErrors, m); });
    cameraPage.on('pageerror', e => { if (!cancelled(e.message)) cameraErrors.push(e.message); });
    await cameraPage.addInitScript(() => {
      window.__hgCameraFlights = [];
      document.addEventListener('hg:globe-flight', event => window.__hgCameraFlights.push(event.detail), true);
    });
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await cameraPage.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await cameraPage.route(u => isFont(u.href), r => r.abort());
      }
      const targets = [
        { name: 'Skåne', c: '56,13,3.2' },
        { name: 'Stockholmstrakten', c: '60,15,2' },
        { name: 'Nya Zeeland', c: '-41,174,3.2' },
      ];
      for (const target of targets) {
        await cameraPage.goto(`${BASE}?c=${encodeURIComponent(target.c)}`, { waitUntil: 'domcontentloaded', timeout: T.load });
        await cameraPage.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        const expected = target.c.split(',').map(Number);
        await cameraPage.waitForFunction(({ lat, lon, zoom }) => window.__hgCameraFlights.some(f => {
          if (f.phase !== 'start') return false;
          const gotLat = f.targetX / Math.PI * 180;
          const gotLon = ((((Math.PI / 2 - f.targetY) / Math.PI * 180 - 180) % 360) + 540) % 360 - 180;
          return Math.abs(gotLat - lat) < 0.001 && Math.abs(gotLon - lon) < 0.001;
        }), { lat: expected[0], lon: expected[1], zoom: expected[2] }, { timeout: T.step });
        const hash = new URL(cameraPage.url()).hash;
        if (!hash.includes(`c=${target.c}`) || new URL(cameraPage.url()).searchParams.has('c')) {
          throw new Error(`${target.name}: kameradressen blev inte en kanonisk hash (${cameraPage.url()})`);
        }
        await cameraPage.evaluate(() => { window.__hgCameraFlights = []; });
      }
      if (cameraErrors.length) throw new Error(`kameralänken gav konsolfel: ${cameraErrors.join('; ')}`);
    } finally {
      await cameraPage.close();
    }
    return 'Skåne, Stockholmstrakten och Nya Zeeland följer ?c= i den här bredden';
  });

  if (vp.name === 'dator') {
    // En länk till en guidad tur (#736): t och s i adressen startar turen vid rätt steg, adressen följer turen,
    // Bakåt går till steget innan, Avsluta tar bort turen ur adressen, och en okänd tur ger en vanlig vy
    await check('en länk startar en guidad tur vid rätt steg (#736)', async () => {
      const tourPage = await context.newPage();
      const tourErrors = [];
      tourPage.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) pushConsole(tourErrors, m); });
      tourPage.on('pageerror', e => tourErrors.push(e.message));
      const progress = () => tourPage.textContent('#tour-progress').then(x => x.trim());
      const hashHas = text => tourPage.waitForFunction(t => location.hash.includes(t), text, { timeout: T.step });
      try {
        if (THREE_LOCAL) {
          const body = fs.readFileSync(THREE_LOCAL, 'utf8');
          await tourPage.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
          await tourPage.route(u => isFont(u.href), r => r.abort());
        }
        await tourPage.goto(`${BASE}#t=tre-platser-1325&s=tanger`);
        await tourPage.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        await tourPage.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
        if ((await progress()) !== 'Steg 2 av 3') throw new Error(`länken med s=tanger öppnade ${await progress()}`);
        const y = (await tourPage.textContent('#year-big')).trim();
        if (y !== '1325') throw new Error(`steget tanger står på ${y}, inte 1325`);
        await tourPage.click('#tour-next');
        await hashHas('s=tenochtitlan');
        await tourPage.goBack();
        await tourPage.waitForFunction(() => document.getElementById('tour-progress').textContent.includes('2 av 3'), null, { timeout: T.step });
        await tourPage.click('#tour-close');
        await tourPage.waitForSelector('#tour-card', { state: 'hidden', timeout: T.step });
        await tourPage.waitForFunction(() => !location.hash.includes('t='), null, { timeout: T.step });
        // Den äldre formen ?tur=<id> startar vid första steget och flyttas in i hashen
        await tourPage.goto(`${BASE}?tur=tre-platser-1325`);
        await tourPage.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        await tourPage.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
        if ((await progress()) !== 'Steg 1 av 3') throw new Error(`?tur= öppnade ${await progress()}`);
        if (await tourPage.evaluate(() => location.search.includes('tur='))) throw new Error('?tur= ligger kvar i adressen');
        await hashHas('t=tre-platser-1325');
        // En okänd tur hoppas över, och resten av länken gäller
        await tourPage.goto(`${BASE}?ny=1#y=1500&t=finns-inte`);
        await tourPage.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        // Adressen ställs in efter att laddningsrutan har försvunnit; WebKit i CI hann inte före avläsningen (#888).
        // Vänta på året, och kontrollera sedan att turens kort inte öppnades.
        await tourPage.waitForFunction(() => document.getElementById('year-big').textContent.trim() === '1500', null, { timeout: T.step }).catch(() => {});
        const y2 = (await tourPage.textContent('#year-big')).trim();
        if (y2 !== '1500') throw new Error(`länken med okänd tur gav året ${y2}, inte 1500`);
        if (await tourPage.locator('#tour-card').isVisible()) throw new Error('en okänd tur öppnade turens kort');
        if (tourErrors.length) throw new Error(`turlänken gav konsolfel: ${tourErrors.join('; ')}`);
      } finally {
        await tourPage.close();
      }
      return 's=tanger ger steg 2 år 1325; adressen följer turen och Bakåt går till steget innan; Avsluta tar bort t; ?tur= flyttas in i hashen; okänd tur ger år 1500';
    });
  }
  // Lektionsläget (#795): en länk med m=lektion startar turen med menyerna dolda och bandet överst. Låset håller vid
  // direktlänk, omladdning och Bakåt/Framåt, tangentbordet når "Visa hela globen", slutkortet står kvar efter sista
  // steget och utgången behåller året och ger den vanliga sidan. Kontrollen körs i dator- och mobilbredd.
  await check('lektionsläget låser menyerna och har en utgång som behåller året (#795)', async () => {
    const lessonPage = await context.newPage();
    const lessonErrors = [];
    let navigating = false; // som i #865-kontrollen: bara "TypeError: Load failed" under navigering räknas bort (#888)
    lessonPage.on('console', m => {
      if (m.type() !== 'error' || isFont(m.location()?.url)) return;
      if (navigating && ABORTED_FETCH.test(m.text())) return;
      pushConsole(lessonErrors, m);
    });
    lessonPage.on('pageerror', e => { if (!(navigating && cancelled(e.message))) lessonErrors.push(e.message); }); // avbruten hämtning under navigering (#888)
    const lp = sel => lessonPage.locator(sel);
    let slowEmpires = false;
    const EMPIRE_DELAY = 2500;
    const progress = () => lessonPage.textContent('#tour-progress').then(x => x.trim());
    const shown = sel => lessonPage.evaluate(s => { const el = document.querySelector(s); return !!el && el.getClientRects().length > 0; }, sel);
    const open = async url => {
      navigating = true;
      try {
        await lessonPage.goto(url);
        await lessonPage.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      } finally { navigating = false; }
    };
    // reload, Bakåt och Framåt avbryter också hämtningar som pågår (#888): markera navigeringen som i open()
    const nav = async go => { navigating = true; try { return await go(); } finally { navigating = false; } };
    const hashHas = text => lessonPage.waitForFunction(t => location.hash.includes(t), text, { timeout: T.step });
    const locked = async () => {
      await lessonPage.waitForSelector('#lesson-band', { state: 'visible', timeout: T.step });
      if (!/^Lektionsläge: /.test((await lp('#lesson-band-title').textContent()).trim())) throw new Error('bandet saknar "Lektionsläge:"');
      if ((await lp('#lesson-band').getAttribute('aria-labelledby')) !== 'lesson-band-title') throw new Error('bandet är ingen märkt landmärke');
      for (const sel of ['#btn-layers', '#btn-focus', '#btn-globe', '#btn-flat', '#btn-discovery', '#btn-tour', '#filters', '#tour-close', '#tour-end']) {
        if (await shown(sel)) throw new Error(`${sel} syns i lektionsläget`);
      }
      // Knappen ligger i Mer-menyn och har ingen yta medan den är stängd: kontrollera själva regeln, inte om den syns
      if (await lessonPage.evaluate(() => getComputedStyle(document.getElementById('btn-hunt')).display) !== 'none') throw new Error('#btn-hunt är inte dold i lektionsläget');
      if (await lessonPage.evaluate(() => document.scrollingElement.scrollWidth > innerWidth + 1)) throw new Error('lektionsläget ger horisontell scroll');
    };
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await lessonPage.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await lessonPage.route(u => isFont(u.href), r => r.abort());
      }
      // Rikesfilerna kan göras långsamma, som på ett långsamt skolnät (fokus som laddas när lektionen börjar)
      await lessonPage.route(u => /data\/empires\//.test(u.href), async r => {
        if (slowEmpires) await new Promise(res => setTimeout(res, EMPIRE_DELAY));
        await r.continue().catch(() => {});
      });
      // Direktlänk: bandet, låsta menyer, första steget och året 1939
      await open(`${BASE}?ny=1#t=andra-varldskriget&m=lektion`);
      await locked();
      await lessonPage.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
      if (!/^Steg 1 av 14$/.test(await progress())) throw new Error(`lektionen öppnade ${await progress()}`);
      if ((await lessonPage.textContent('#year-big')).trim() !== '1939') throw new Error('lektionen börjar inte 1939');
      // Tidslinjen går inte att flytta utanför lektionens år
      // Tidslåset (#1322): i en lektion styr turen tiden, så årshoppet är låst (aria-disabled), formuläret öppnas inte och året står kvar.
      // Det ersätter de äldre proven av att året 1500 och datumet 1066-10-14 avvisades som "utanför" lektionens år: de går inte längre att göra
      // eftersom årshoppet inte går att öppna alls. Lektionens årsgräns provas av tidslåset i state.test.mjs och av Home på reglaget nedan.
      const jumpLocked = async (what, year = '1939') => {
        await lessonPage.click('#year-jump', { force: true });
        if ((await lessonPage.getAttribute('#year-jump', 'aria-disabled')) !== 'true') throw new Error(`${what}: årshoppet är inte låst i lektionen`);
        if (!(await lessonPage.locator('#jump-pop').isHidden())) throw new Error(`${what}: årshoppet öppnades i lektionen`);
        const now = (await lessonPage.textContent('#year-big')).trim();
        if (now !== year) throw new Error(`${what}: året blev ${now} i stället för ${year}`);
      };
      await jumpLocked('direktlänk');
      if (!(await lessonPage.isVisible('#lesson-band'))) throw new Error('bandet försvann efter ett klick på årshoppet');
      // Omladdning mitt i lektionen ger samma läge och steg
      await lessonPage.click('#tour-next');
      await lessonPage.click('#tour-next');
      await hashHas('s=storbritannien');
      await hashHas('m=lektion');
      await nav(() => lessonPage.reload());
      await lessonPage.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await locked();
      await lessonPage.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
      if (!/^Steg 3 av 14$/.test(await progress())) throw new Error(`omladdningen öppnade ${await progress()}`);
      // Bakåt och Framåt släpper inte låset
      await lessonPage.click('#tour-next');
      await hashHas('s=barbarossa');
      await nav(() => lessonPage.goBack());
      await lessonPage.waitForFunction(() => document.getElementById('tour-progress').textContent.includes('3 av 14'), null, { timeout: T.step });
      await locked();
      await nav(() => lessonPage.goForward());
      await lessonPage.waitForFunction(() => document.getElementById('tour-progress').textContent.includes('4 av 14'), null, { timeout: T.step });
      await locked();
      // Tangentbordet når "Visa hela globen" (bandet ligger före kortet i tabbordningen)
      await lessonPage.focus('#tour-next');
      let reached = false;
      for (let i = 0; i < 60 && !reached; i++) {
        await lessonPage.keyboard.press('Shift+Tab');
        reached = await lessonPage.evaluate(() => document.activeElement?.id === 'lesson-exit');
      }
      if (!reached) throw new Error('Tab når inte "Visa hela globen"');
      // Turens slut: slutkortet står kvar, Escape avslutar inte, och det finns ingen Klar-knapp som tömmer läget
      for (let i = 0; i < 10; i++) await lessonPage.click('#tour-next');
      await lessonPage.waitForFunction(() => document.getElementById('tour-progress').textContent.includes('14 av 14'), null, { timeout: T.step });
      await lessonPage.waitForSelector('#tour-next', { state: 'hidden', timeout: T.step });
      // Skärmläsaren hör även sista steget och att lektionen är slut (#878)
      await lessonPage.waitForFunction(() => /sista steget i lektionen/.test(document.getElementById('screen-reader-status')?.textContent ?? ''), null, { timeout: T.step });
      if (!/14 av 14/.test(await lessonPage.textContent('#screen-reader-status'))) throw new Error('uppläsningen av sista steget saknade stegets nummer');
      await lessonPage.focus('#tour-back');
      await lessonPage.keyboard.press('Escape');
      if (!(await lessonPage.isVisible('#tour-card')) || !(await lessonPage.isVisible('#lesson-band'))) throw new Error('Escape avslutade lektionen');
      const last = (await lessonPage.textContent('#year-big')).trim();
      // Utgången: året står kvar, läget och turen slutar, menyerna är tillbaka och fokus hamnar på något synligt
      await lessonPage.focus('#lesson-exit');
      await lessonPage.keyboard.press('Enter');
      await lessonPage.waitForSelector('#lesson-band', { state: 'hidden', timeout: T.step });
      await lessonPage.waitForSelector('#tour-card', { state: 'hidden', timeout: T.step });
      if ((await lessonPage.textContent('#year-big')).trim() !== last) throw new Error('"Visa hela globen" ändrade året');
      if (await lessonPage.isVisible('#more-toggle')) await lessonPage.click('#more-toggle'); // i mobilen ligger knapparna i menyn
      for (const sel of ['#btn-layers', '#btn-focus', '#btn-globe']) if (!(await shown(sel))) throw new Error(`${sel} kom inte tillbaka`);
      await lessonPage.waitForFunction(() => !/[?&#]m=|t=/.test(location.hash), null, { timeout: T.step });
      const focusOk = await lessonPage.evaluate(() => { const a = document.activeElement; return !!a && a !== document.body && a.getClientRects().length > 0; });
      if (!focusOk) throw new Error('fokus hamnade på ingenting efter "Visa hela globen"');
      // Tidslinjen är fri igen
      await lessonPage.click('#year-jump');
      await lessonPage.fill('#jump-input', '1500');
      await lessonPage.press('#jump-input', 'Enter');
      await lessonPage.waitForFunction(() => document.getElementById('year-big').textContent.trim() === '1500', null, { timeout: T.step });
      // Vikingatiden (åk 4–6) har samma läge; m=lektion utan en lektionstur, och utan tur, gör ingenting
      await open(`${BASE}?ny=1#t=vikingatiden-och-varlden&m=lektion`);
      await locked();
      if ((await lessonPage.textContent('#year-big')).trim() !== '793') throw new Error('vikingalektionen börjar inte 793');
      // Reglagets ARIA-gränser följer lektionens lås (#883) och återställs när man lämnar lektionen
      const ariaBounds = () => lessonPage.evaluate(() => { const t = document.getElementById('track'); return [t.getAttribute('aria-valuemin'), t.getAttribute('aria-valuemax')].join('..'); });
      if ((await ariaBounds()) !== '793..1068') throw new Error(`reglagets ARIA-gränser i vikingalektionen var ${await ariaBounds()} i stället för 793..1068`);
      await lessonPage.click('#lesson-exit');
      const { min: firstYear } = await timelineBounds(lessonPage);
      await lessonPage.waitForFunction(min => document.getElementById('track').getAttribute('aria-valuemin') === String(min), firstYear, { timeout: T.step });
      if ((await ariaBounds()).startsWith('793')) throw new Error('ARIA-gränserna låg kvar efter Visa hela globen');
      await open(`${BASE}?ny=1#t=tre-platser-1325&m=lektion`);
      await lessonPage.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
      if (await lessonPage.isVisible('#lesson-band')) throw new Error('en tur utan lärarfält startade lektionsläge');
      await open(`${BASE}?ny=1#y=1500&m=lektion`);
      if (await lessonPage.isVisible('#lesson-band') || await lessonPage.isVisible('#tour-card')) throw new Error('m=lektion utan tur gav ett tomt läge');
      // En lektionslänk som inte går att starta förklaras i stället för att tyst bli en vanlig glob (#877)
      const noticeText = async () => (await lessonPage.isVisible('#lesson-notice')) ? (await lessonPage.textContent('#lesson-notice-text')).trim() : '';
      await open(`${BASE}?ny=11#t=finns-inte&m=lektion`);
      await lessonPage.waitForSelector('#lesson-notice', { state: 'visible', timeout: T.step });
      if (!/finns inte/.test(await noticeText()) || await lessonPage.isVisible('#lesson-retry') || await lessonPage.isVisible('#lesson-band')) throw new Error(`okänd lektion förklarades som "${await noticeText()}"`);
      await open(`${BASE}?ny=12#t=tre-platser-1325&m=lektion`);
      await lessonPage.waitForSelector('#lesson-notice', { state: 'visible', timeout: T.step });
      if (!/ingen lektion/.test(await noticeText()) || await lessonPage.isVisible('#lesson-band')) throw new Error(`tur utan lärarfält förklarades som "${await noticeText()}"`);
      await lessonPage.click('#lesson-notice-close');
      if (await lessonPage.isVisible('#lesson-notice')) throw new Error('förklaringen gick inte att stänga');
      await lessonPage.route('**/data/turer/index.json', r => r.fulfill({ status: 503, body: 'nere' }));
      await open(`${BASE}?ny=13#t=vikingatiden-och-varlden&m=lektion`);
      await lessonPage.waitForSelector('#lesson-notice', { state: 'visible', timeout: T.step });
      if (!/kunde inte hämtas/.test(await noticeText()) || !(await lessonPage.isVisible('#lesson-retry')) || await lessonPage.isVisible('#lesson-band')) throw new Error(`hämtfel förklarades som "${await noticeText()}"`);
      await lessonPage.unroute('**/data/turer/index.json');
      lessonErrors.splice(0, lessonErrors.length, ...lessonErrors.filter(e => !/503/.test(e))); // det väntade felet från den spärrade turfilen
      await lessonPage.click('#lesson-retry');
      await lessonPage.waitForSelector('#lesson-band', { state: 'visible', timeout: T.load });
      if (await lessonPage.isVisible('#lesson-notice')) throw new Error('förklaringen låg kvar efter Försök igen');
      // Ett fokus som redan var på tar inte bort låset när lektionslänken öppnas i samma flik
      await open(`${BASE}?ny=3#y=1942&f=war:andra-varldskriget`);
      await lessonPage.waitForSelector('#focus-bar:not([hidden])', { state: 'attached', timeout: T.load });
      await hashHas('c='); // fokuset är klart och har skrivit adressen (på en belastad maskin tar det flera sekunder)
      await lessonPage.evaluate(() => { location.hash = '#t=andra-varldskriget&m=lektion'; });
      await lessonPage.waitForSelector('#lesson-band', { state: 'visible', timeout: T.step });
      await lessonPage.waitForFunction(() => document.getElementById('tour-progress').textContent.includes('1 av 14'), null, { timeout: T.step });
      await lessonPage.focus('#track');
      await lessonPage.keyboard.press('Home');
      await lessonPage.waitForTimeout(300);
      if ((await lessonPage.textContent('#year-big')).trim() !== '1939') throw new Error(`Home på reglaget gav ${(await lessonPage.textContent('#year-big')).trim()} i stället för 1939 efter ett fokus och lektionslänken`);
      await jumpLocked('lektionslänken efter ett fokus'); // tidslinjen är låst även när lektionen börjar efter ett fokus
      // "Visa hela globen" återställer inte ett gammalt fokus och byter inte året (#881)
      await open(`${BASE}?ny=14#y=1916&f=war:forsta-varldskriget`);
      await lessonPage.waitForSelector('#focus-bar:not([hidden])', { state: 'attached', timeout: T.load });
      await hashHas('c=');
      await lessonPage.evaluate(() => { location.hash = '#t=andra-varldskriget&m=lektion'; });
      await lessonPage.waitForSelector('#lesson-band', { state: 'visible', timeout: T.step });
      await lessonPage.waitForFunction(() => document.getElementById('tour-progress').textContent.includes('1 av 14'), null, { timeout: T.step });
      await lessonPage.click('#lesson-exit');
      await lessonPage.waitForSelector('#lesson-band', { state: 'hidden', timeout: T.step });
      await lessonPage.waitForTimeout(1500); // ett återställt fokus laddas och flyttar året efter en stund
      if ((await lessonPage.textContent('#year-big')).trim() !== '1939') throw new Error(`utgången gav året ${(await lessonPage.textContent('#year-big')).trim()} i stället för lektionens 1939`);
      if (await lessonPage.isVisible('#focus-bar')) throw new Error('utgången återställde ett gammalt fokus');
      // Ett fokus som fortfarande laddas när lektionen börjar får inte släppa låset när det blir klart
      await open(`${BASE}?ny=5`);
      slowEmpires = true;
      await lessonPage.evaluate(() => { location.hash = '#y=1942&f=empire:romarriket&c=-30,-120,3'; });
      await lessonPage.waitForTimeout(150);
      await lessonPage.evaluate(() => { location.hash = '#t=andra-varldskriget&m=lektion'; });
      // Med rikesfiler som svarar efter 2,5 s var 15 s för kort i WebKit i CI (#888); 90 s räckte inte heller, så läget visas
      await waitDiag(lessonPage, 'lektionen startade inte medan ett fokus laddades', lessonErrors, '#lesson-band', 40000);
      await lessonPage.waitForTimeout(EMPIRE_DELAY + 1500); // fokuset blir klart under tiden
      slowEmpires = false;
      if (await lessonPage.isVisible('#focus-bar')) throw new Error('ett fokus som laddades när lektionen började visades i lektionen');
      // Steg 1 ska visa lektionens första år och kamera, inte den gamla adressens (året 1942 och kameran -30,-120)
      if ((await lessonPage.textContent('#year-big')).trim() !== '1939') throw new Error(`steg 1 visade ${(await lessonPage.textContent('#year-big')).trim()} i stället för 1939 när ett fokus blev klart i lektionen`);
      if (/c=-30,-120,/.test(await lessonPage.evaluate(() => location.hash))) throw new Error('den gamla adressens kamera flyttade globen i lektionens steg 1');
      await lessonPage.focus('#track');
      await lessonPage.keyboard.press('Home');
      await lessonPage.waitForTimeout(300);
      if ((await lessonPage.textContent('#year-big')).trim() !== '1939') throw new Error(`reglaget gick till ${(await lessonPage.textContent('#year-big')).trim()} när ett fokus blev klart i lektionen`);
      await jumpLocked('fokus som blev klart i lektionen'); // låset ligger kvar när ett fokus som laddades vid starten blir klart
      // Samtidighetsjakten (år 1500) krockar med låset: knappen är dold, och ett u= utanför lektionens år ignoreras
      await open(`${BASE}?ny=4#t=andra-varldskriget&m=lektion&u=samtidighetsjakten-1500`);
      await lessonPage.waitForSelector('#lesson-band', { state: 'visible', timeout: T.step });
      await lessonPage.waitForTimeout(500);
      if (await shown('#btn-hunt')) throw new Error('Samtidighetsjakten syns i lektionsläget');
      if (await lessonPage.isVisible('#hunt')) throw new Error('u= utanför lektionens år öppnade jakten i lektionsläget');
      if ((await lessonPage.textContent('#year-big')).trim() !== '1939') throw new Error('u= flyttade året i lektionsläget');
      if (/u=/.test(await lessonPage.evaluate(() => location.hash))) throw new Error('adressen behöll u= som ignorerades');
      // Samma flik: en vanlig sida och sedan lektionslänken med u=, och en jakt som redan pågår när lektionen börjar
      await open(`${BASE}?ny=6#y=1600`);
      await lessonPage.evaluate(() => { location.hash = '#t=andra-varldskriget&m=lektion&u=samtidighetsjakten-1500'; });
      await lessonPage.waitForSelector('#lesson-band', { state: 'visible', timeout: T.step });
      await lessonPage.waitForTimeout(800);
      if (await lessonPage.isVisible('#hunt')) throw new Error('jakten öppnades av en lektionslänk i samma flik');
      await open(`${BASE}?ny=7#y=1500&u=samtidighetsjakten-1500`);
      await lessonPage.waitForSelector('#hunt:not([hidden])', { state: 'attached', timeout: T.step });
      await lessonPage.evaluate(() => { location.hash = '#t=andra-varldskriget&m=lektion&u=samtidighetsjakten-1500'; });
      await lessonPage.waitForSelector('#lesson-band', { state: 'visible', timeout: T.step });
      await lessonPage.waitForTimeout(800);
      if (await lessonPage.isVisible('#hunt')) throw new Error('en jakt som pågick stod kvar när lektionen började');
      if ((await lessonPage.textContent('#year-big')).trim() !== '1939') throw new Error('året flyttades av jakten i lektionsläget');
      // Bakåt ut ur lektionen öppnar jakten igen
      await nav(() => lessonPage.goBack());
      await lessonPage.waitForSelector('#hunt:not([hidden])', { state: 'attached', timeout: T.step });
      if (await lessonPage.isVisible('#lesson-band')) throw new Error('Bakåt lämnade bandet kvar');
      if (lessonErrors.length) throw new Error(`lektionsläget gav konsolfel: ${lessonErrors.join('; ')}`);
    } finally {
      await lessonPage.close();
    }
    return 'direktlänk, omladdning och Bakåt/Framåt behåller låset; året låst till 1939–1945; Tab når utgången; slutkortet står kvar; utgången behåller året; utan lektionstur eller tur inget läge';
  });
  // #1139: lektionsläget visar alltid alla händelser i lektionens år, också när lektionens lager är exakt Översikts fem lager
  // (då slår turen inte av något lager, och vyns urval skulle annars ligga kvar). Utgången ("Visa hela globen") ger tillbaka
  // Översikt som det var före lektionen. Lektionens lager skrivs om i testet så att de blir lika med Översikts.
  await check('lektionsläget från Översikt visar alla händelser och lämnar inget urval kvar (#1139)', async () => {
    const lp = await context.newPage();
    const errors = [];
    lp.on('pageerror', e => errors.push(e.message));
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await lp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await lp.route(u => isFont(u.href), r => r.abort());
      }
      const overviewLayers = ['events', 'funfacts', 'areas', 'routes', 'wars'];
      await lp.route(u => /data\/turer\/andra-varldskriget\.json/.test(u.href), async r => {
        const res = await r.fetch();
        const doc = await res.json();
        doc.lesson.lock.layers = overviewLayers;
        await r.fulfill({ response: res, json: doc });
      });
      // En bar länk till lektionen: första besöket börjar i Översikt, och lektionen slår inte av något lager
      await lp.goto(`${BASE}?ny=1139#t=andra-varldskriget&m=lektion`);
      await lp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await lp.waitForSelector('#lesson-band', { state: 'visible', timeout: T.step });
      await lp.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
      const view = id => lp.evaluate(v => document.querySelector(`#layer-menu [data-view="${v}"]`)?.getAttribute('aria-pressed'), id);
      await lp.waitForFunction(() => document.querySelector('#layer-menu [data-view="standard"]')?.getAttribute('aria-pressed') === 'true', null, { timeout: T.step });
      if (await view('oversikt') !== 'false') throw new Error('Översikt är kvar som vy i lektionen');
      // Samtidigt visar händelser som inte hör till Översikt: urvalet gäller inte i lektionen
      const ids = await lp.evaluate(() => [...document.querySelectorAll('#event-list .event-btn')].map(b => b.dataset.id));
      const outside = await lp.evaluate(async list => {
        const events = (await (await fetch('data/events.json')).json()).events;
        return list.filter(id => events.find(e => e.id === id)?.significance !== 1);
      }, ids);
      if (!ids.length || !outside.length) throw new Error(`lektionen år 1939 visar ${ids.length} händelser och ingen utanför Översikt: urvalet läcker in i lektionen`);
      if (!await lp.evaluate(() => document.getElementById('panel-tag-note').hidden)) throw new Error('urvalsraden syns i lektionen');
      if (/[#&]g=/.test(await lp.evaluate(() => location.hash))) throw new Error('adressen har ett urval (g=) i lektionen');
      // Visa hela globen: lektionen slutar, året står kvar och Översikt är tillbaka som före lektionen
      await lp.click('#lesson-exit');
      await lp.waitForSelector('#lesson-band', { state: 'hidden', timeout: T.step });
      await lp.waitForFunction(() => document.querySelector('#layer-menu [data-view="oversikt"]')?.getAttribute('aria-pressed') === 'true', null, { timeout: T.step });
      await lp.waitForFunction(() => /([?&#])g=oversikt(?:&|$)/.test(location.hash), null, { timeout: T.step });
      if (await lp.evaluate(() => document.getElementById('panel-tag-note').hidden)) throw new Error('urvalsraden saknas när Översikt är tillbaka efter lektionen');
      if (errors.length) throw new Error(`konsolfel: ${errors.join('; ')}`);
      return `lektionen visar ${ids.length} händelser år 1939, varav ${outside.length} utanför Översikt; utgången ger Översikt tillbaka`;
    } finally { await lp.close(); }
  });
  // #865: en gammal adress som väntar på att ett fokus ska laddas får inte skriva över året och kameran när en vanlig
  // tur har startat under tiden (apply() i js/controllers/address.js). Rikesfilerna görs långsamma, som på ett skolnät.
  await check('en tur som startar medan ett fokus laddas behåller sitt första år och sin kamera (#865)', async () => {
    const tp = await context.newPage();
    const errors = [];
    // Turens första steg hämtar många rikesfiler, och testet navigerar bort direkt efteråt. WebKit loggar hämtningar som
    // avbryts av navigeringen som "TypeError: Load failed" (#702, #888). Bara exakt det meddelandet, och bara medan
    // sidan navigerar, räknas bort; samma regel som vid omladdningen i språktestet.
    let navigating = false;
    tp.on('console', m => {
      if (m.type() !== 'error' || isFont(m.location()?.url)) return;
      if (navigating && (ABORTED_FETCH.test(m.text()) || ABORTED_FONT.test(m.text()))) return;
      pushConsole(errors, m);
    });
    // WebKit skriver en avbruten hämtning som sidfel ("Fetch API cannot load … due to access control checks"): samma regel som
    // i huvudhanteraren, bara medan sidan navigerar (#888)
    tp.on('pageerror', e => { if (!(navigating && cancelled(e.message))) errors.push(e.message); });
    let slow = false;
    const DELAY = 2500;
    const yearOf = () => tp.textContent('#year-big').then(x => x.trim());
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await tp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await tp.route(u => isFont(u.href), r => r.abort());
      }
      await tp.route(u => /data\/empires\//.test(u.href), async r => {
        if (slow) await new Promise(res => setTimeout(res, DELAY));
        await r.continue().catch(() => {});
      });
      const open = async url => {
        navigating = true;
        try { await tp.goto(url); await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load }); } finally { navigating = false; }
      };
      // Så ser steg 1 ut utan någon gammal adress
      await open(`${BASE}?ny=11#t=forsta-varldskriget`);
      await tp.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
      const wantYear = await yearOf();
      // Ett fokus som laddas, och en turlänk i samma flik innan det blivit klart
      await open(`${BASE}?ny=12`);
      slow = true;
      await tp.evaluate(() => { location.hash = '#y=1942&f=empire:romarriket&c=-30,-120,3'; });
      await tp.waitForTimeout(150);
      await tp.evaluate(() => { location.hash = '#t=forsta-varldskriget'; });
      await waitDiag(tp, 'turen startade inte medan ett fokus laddades', errors, '#tour-card', 40000);
      await tp.waitForTimeout(DELAY + 1500); // det gamla fokuset blir klart under tiden
      slow = false;
      if (await yearOf() !== wantYear) throw new Error(`steg 1 visade ${await yearOf()} i stället för ${wantYear} när den gamla adressens fokus blev klart`);
      if (/c=-30,-120,/.test(await tp.evaluate(() => location.hash))) throw new Error('den gamla adressens kamera flyttade globen i turens steg 1');
      if (await tp.isVisible('#focus-bar')) throw new Error('det gamla fokuset visades ovanpå turen');
      // Regression: ett vanligt fokus via adressen och Bakåt/Framåt fungerar som förut
      await open(`${BASE}?ny=13#y=1942&f=war:andra-varldskriget`);
      await tp.waitForSelector('#focus-bar:not([hidden])', { state: 'attached', timeout: T.load });
      if (errors.length) throw new Error(`konsolfel: ${errors.join('; ')}`);
    } finally {
      await tp.close();
    }
    return 'turens första år och kamera står kvar när ett gammalt fokus blir klart; vanligt fokus via adressen fungerar';
  });
  // #893 (lägeskontraktet): övergångar mellan lägen. Två kedjor som saknade gemensam ordning före kontraktet:
  // 1. Fokus som börjar under en tur avslutar turen (MODE_RULES i js/state.js), och turens utgång lämnar det nya fokuset
  //    i fred i stället för att återställa fokuset från före turen.
  // 2. En vy som byts medan startens fokus laddas (fyndet från #888): popstate lyssnas på före startens apply(), så att
  //    lektionslänken gäller och det gamla fokuset inte skriver över adressen när det blir klart.
  await check('lägeskontraktet: Fokus avslutar en tur, och en vy som byts medan startens fokus laddas gäller (#893)', async () => {
    const tp = await context.newPage();
    const errors = [];
    tp.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) errors.push(m.text()); });
    tp.on('pageerror', e => errors.push(e.message));
    let slow = false;
    const DELAY = 2500;
    const hash = () => tp.evaluate(() => location.hash);
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await tp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await tp.route(u => isFont(u.href), r => r.abort());
      }
      await tp.route(u => /data\/empires\//.test(u.href), async r => {
        if (slow) await new Promise(res => setTimeout(res, DELAY));
        await r.continue().catch(() => {});
      });
      const open = async url => { await tp.goto(url); await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load }); };
      // 1. Ett fokus, sedan en tur (som avslutar fokuset), sedan ett nytt fokus ur Fokus-menyn
      await open(`${BASE}?ny=81#y=1916&f=war:forsta-varldskriget`);
      await tp.waitForSelector('#focus-bar:not([hidden])', { state: 'attached', timeout: T.load });
      await tp.evaluate(() => { location.hash = '#t=tre-platser-1325'; });
      await tp.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
      if (await tp.isVisible('#focus-bar')) throw new Error('fokuset stod kvar när turen började');
      await tp.evaluate(() => document.getElementById('btn-focus').click()); // menyknappen ligger under Meny i mobilen
      await tp.fill('#focus-menu input', 'Koreakriget');
      await tp.evaluate(() => document.querySelector('#focus-menu [data-key="war:koreakriget"]').click());
      await tp.waitForSelector('#focus-bar:not([hidden])', { state: 'attached', timeout: T.step });
      await tp.waitForTimeout(1500); // en återställning av det gamla fokuset skulle hinna börja
      if (await tp.isVisible('#tour-card')) throw new Error('turen fortsatte ovanpå fokuset');
      if (!(await tp.textContent('#focus-title')).includes('Korea')) throw new Error(`fokusraden visar ${await tp.textContent('#focus-title')} i stället för Koreakriget`);
      const h1 = await hash();
      if (!/f=war:koreakriget/.test(h1) || /[#&]t=/.test(h1)) throw new Error(`adressen blev ${h1}`);
      // 2. En delad länk med ett långsamt fokus, och en lektionslänk i samma flik innan fokuset är klart
      slow = true;
      await open(`${BASE}?ny=82#y=1474&f=empire:romarriket&c=-30,-120,3`);
      await tp.evaluate(() => { location.hash = '#t=andra-varldskriget&m=lektion'; });
      await tp.waitForSelector('#lesson-band', { state: 'visible', timeout: T.step });
      await tp.waitForTimeout(DELAY + 1500); // det gamla fokuset blir klart under tiden
      slow = false;
      const h2 = await hash();
      if (!/t=andra-varldskriget/.test(h2) || !/m=lektion/.test(h2)) throw new Error(`adressen skrevs över med startens vy: ${h2}`);
      if (!(await tp.isVisible('#tour-card'))) throw new Error('turens kort försvann när startens fokus blev klart');
      if (await tp.isVisible('#focus-bar')) throw new Error('startens fokus visades ovanpå lektionen');
      const year = Number((await tp.textContent('#year-big')).trim());
      if (!(year >= 1939 && year <= 1945)) throw new Error(`året blev ${year}, utanför lektionens 1939–1945`);
      // 3. Samma fönster med en vanlig vy i stället för en tur (#953): en hash som ändras direkt efter laddningsrutan, medan
      //    startens fokus fortfarande hämtas, ska gälla. Laddningsrutan döljs före address.start(), så ingen väntan på adressen
      //    står mellan öppningen och ändringen; då fanns det ingen popstate-lyssnare och startens skrivning tog bort ändringen.
      slow = true;
      await open(`${BASE}?ny=83#y=1474&f=empire:romarriket&c=-30,-120,3`);
      await tp.evaluate(() => { location.hash = '#y=1500'; });
      await tp.waitForTimeout(DELAY + 1500); // startens fokus blir klart under tiden
      slow = false;
      const h3 = await hash();
      if (!/y=1500/.test(h3) || /f=/.test(h3)) throw new Error(`adressen skrevs över med startens fokus: ${h3}`);
      if (await tp.isVisible('#focus-bar')) throw new Error('startens fokus visades trots att vyn byttes medan det laddades');
      const year3 = (await tp.textContent('#year-big')).trim();
      if (year3 !== '1500') throw new Error(`året blev ${year3} i stället för 1500 när startens fokus blev klart`);
      if (errors.length) throw new Error(`konsolfel: ${errors.join('; ')}`);
    } finally {
      await tp.close();
    }
    return 'Fokus under en tur avslutar turen utan att det gamla fokuset kommer tillbaka; en lektionslänk eller en vanlig hashändring medan startens fokus laddas gäller';
  });
  // #755: tidsintervallet. En delad länk med y2, Tillbaka till ett år, valet med tangentbordet (årsfält, pil upp, Enter) och
  // lägeskontraktet: Fokus och uppspelning stänger intervallet, och under en tur går det inte att välja.
  await check('tidsintervallet: delad länk, tangentbord, Tillbaka till ett år, och Fokus och uppspelning stänger det (#755)', async () => {
    const tp = await context.newPage();
    const errors = [];
    tp.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) errors.push(m.text()); });
    tp.on('pageerror', e => errors.push(e.message));
    const text = sel => tp.textContent(sel).then(x => x.trim());
    const hashHas = (re, want = true) => tp.waitForFunction(([src, w]) => new RegExp(src).test(location.hash) === w, [re.source, want], { timeout: T.step });
    const shown = sel => tp.evaluate(q => { const el = document.querySelector(q); return !!el && !el.hidden && el.getClientRects().length > 0; }, sel);
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await tp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await tp.route(u => isFont(u.href), r => r.abort());
      }
      // #976: en handskriven länk utanför tidslinjen klipps i både raden och adressen.
      await tp.goto(`${BASE}?ny=90#y=-200000&y2=3000`); // före MIN_YEAR (100 000 f.Kr. sedan #1088)
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      const bounds = await tp.evaluate(async () => {
        const { MIN_YEAR, MAX_YEAR } = await import('./js/timeline.js');
        const { rangeText } = await import('./js/controllers/range.js');
        return { min: MIN_YEAR, max: MAX_YEAR, label: rangeText(MIN_YEAR, MAX_YEAR) };
      });
      await tp.waitForFunction(([min, max]) => {
        const p = new URLSearchParams(location.hash.slice(1));
        return p.get('y') === String(min) && p.get('y2') === String(max);
      }, [bounds.min, bounds.max], { timeout: T.step });
      if (!(await text('#range-bar-text')).startsWith(`${bounds.label} · `)) throw new Error(`intervallet klipptes inte: ${await text('#range-bar-text')}`);
      await tp.click('#range-exit');
      if (await text('#year-big') !== String(bounds.max)) throw new Error('Tillbaka till ett år gav inte det klippta slutåret');
      // 1. Den delade länken öppnar intervallet
      await tp.goto(`${BASE}?ny=91#y=1914&y2=1918`);
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await tp.waitForSelector('#range-bar:not([hidden])', { state: 'attached', timeout: T.step });
      if (await text('#year-big') !== '1914–1918') throw new Error(`årtalet visar ${await text('#year-big')} i stället för 1914–1918`);
      if (!(await text('#range-bar-text')).startsWith('1914–1918 · ')) throw new Error(`raden visar ${await text('#range-bar-text')}`);
      if (!(await text('#panel-sub')).includes('1914–1918')) throw new Error(`listan säger inte intervallet: ${await text('#panel-sub')}`);
      // #756: riken visas för slutåret, med en synlig etikett (Riken är på som standard), och intervallet når händelselagret
      if (!(await text('#range-areas')).includes('1918')) throw new Error(`etiketten säger inte slutåret: ${await text('#range-areas')}`);
      await hashHas(/y2=1918/);
      // #981: Fokus listar fortfarande nära startåret, inte hela intervallet.
      if (await tp.isHidden('#btn-focus') && await tp.isVisible('#more-toggle')) await tp.click('#more-toggle');
      if (await tp.isHidden('#btn-focus') && await tp.isVisible('#btn-more')) await tp.click('#btn-more');
      await tp.click('#btn-focus');
      await tp.waitForSelector('#focus-menu:not([hidden])', { state: 'visible', timeout: T.step });
      if (!(await text('#focus-menu .layer-note')).includes('Listan följer året, inte tidsintervallet')) throw new Error('Fokus förklarar inte att listan följer året under ett intervall');
      await tp.keyboard.press('Escape');
      // 2. Tillbaka till ett år går till slutåret
      await tp.click('#range-exit');
      await tp.waitForSelector('#range-bar', { state: 'hidden', timeout: T.step });
      if (await text('#year-big') !== '1918') throw new Error(`Tillbaka till ett år gav ${await text('#year-big')}, inte 1918`);
      await hashHas(/y2=/, false);
      // 3. Tangentbordet: årshoppet, länken till intervallet, årsfälten med pil upp och Enter
      await tp.focus('#year-jump');
      await tp.keyboard.press('Enter');
      await tp.waitForSelector('#jump-pop', { state: 'visible', timeout: T.step });
      await tp.focus('#range-open');
      await tp.keyboard.press('Enter');
      await tp.waitForSelector('#range-pop', { state: 'visible', timeout: T.step });
      if (await tp.evaluate(() => document.activeElement?.id) !== 'range-from') throw new Error('fältet Från fick inte fokus när formuläret öppnades');
      await tp.fill('#range-from', '1939');
      await tp.keyboard.press('ArrowUp');
      if (await tp.inputValue('#range-from') !== '1940') throw new Error(`pil upp gav ${await tp.inputValue('#range-from')} i stället för 1940`);
      await tp.fill('#range-to', '1945');
      await tp.keyboard.press('Enter');
      await tp.waitForSelector('#range-bar:not([hidden])', { state: 'attached', timeout: T.step });
      if (await text('#year-big') !== '1940–1945') throw new Error(`formuläret gav ${await text('#year-big')}`);
      if (await tp.evaluate(() => document.activeElement?.id) !== 'range-exit') throw new Error('fokus hamnade inte på Tillbaka till ett år');
      await hashHas(/y=1940&y2=1945/);
      // f.Kr. med stegknappen över gränsen: 1 f.Kr. + 1 år = 1 e.Kr.
      await tp.evaluate(() => { document.getElementById('year-jump').click(); document.getElementById('range-open').click(); });
      await tp.fill('#range-from', '1');
      await tp.evaluate(() => { const b = document.querySelector('#range-pop .range-row .jump-era-btn'); if (b.getAttribute('aria-pressed') !== 'true') b.click(); });
      await tp.click('#range-pop .range-row .range-step:nth-of-type(2)');
      const after = await tp.evaluate(() => [document.getElementById('range-from').value, document.querySelector('#range-pop .range-row .jump-era-btn').getAttribute('aria-pressed')]);
      if (after.join() !== '1,false') throw new Error(`1 f.Kr. + 1 år gav ${after.join(' ')} i stället för 1 e.Kr.`);
      await tp.keyboard.press('Escape');
      await tp.waitForSelector('#range-pop', { state: 'hidden', timeout: T.step });
      // 4. Fokus stänger intervallet
      await tp.evaluate(() => document.getElementById('btn-focus').click());
      await tp.fill('#focus-menu input', 'Koreakriget');
      await tp.evaluate(() => document.querySelector('#focus-menu [data-key="war:koreakriget"]').click());
      await tp.waitForSelector('#focus-bar:not([hidden])', { state: 'attached', timeout: T.step });
      if (await shown('#range-bar')) throw new Error('intervallet stod kvar när Fokus började');
      await hashHas(/f=war:koreakriget/);
      if (/y2=/.test(await tp.evaluate(() => location.hash))) throw new Error('adressen har både fokus och intervall');
      // Ett intervall i adressen avslutar Fokus
      await tp.evaluate(() => { location.hash = '#y=1914&y2=1918'; });
      await tp.waitForSelector('#range-bar:not([hidden])', { state: 'attached', timeout: T.step });
      if (await shown('#focus-bar')) throw new Error('Fokus stod kvar när intervallet valdes');
      // 5. Uppspelningen stänger intervallet
      await tp.evaluate(() => document.getElementById('btn-play').click());
      await tp.waitForSelector('#range-bar', { state: 'hidden', timeout: T.step });
      await tp.evaluate(() => document.getElementById('btn-play').click()); // pausa
      // 6. Under en tur erbjuds inget tidsintervall
      await tp.evaluate(() => { location.hash = '#t=tre-platser-1325'; });
      await tp.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
      // Tidslåset (#1322): årshoppet är låst i en tur, så formuläret med intervallet kan inte ens öppnas
      await tp.click('#year-jump', { force: true });
      if (await tp.getAttribute('#year-jump', 'aria-disabled') !== 'true') throw new Error('årshoppet är inte låst under turen');
      if (await shown('#jump-pop')) throw new Error('årshoppet öppnades under turen');
      if (await shown('#range-open')) throw new Error('intervallänken syns under turen');
      if (await shown('#range-pop')) throw new Error('intervallformuläret syns under turen');
      if (await shown('#range-bar')) throw new Error('ett intervall valdes under turen');
      if (errors.length) throw new Error(`konsolfel: ${errors.join('; ')}`);
    } finally {
      await tp.close();
    }
    return 'länken med y2, Tillbaka till slutåret, årsfält med tangentbord och f.Kr.-gränsen; Fokus och uppspelning stänger intervallet, och en tur döljer valet';
  });
  await check('skärmläsare: intervallformuläret och platsfältet på fem språk (#977)', async () => {
    for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
      const pp = await context.newPage();
      const errors = [];
      pp.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) errors.push(m.text()); });
      pp.on('pageerror', e => errors.push(e.message));
      try {
        if (THREE_LOCAL) {
          await pp.route(THREE_URL, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(THREE_LOCAL, 'utf8') }));
          await pp.route(u => isFont(u.href), r => r.abort());
        }
        await pp.goto(`${BASE}?lang=${lang}`);
        await pp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        const copy = await pp.evaluate(async () => {
          const { ui } = await import('./js/i18n.js');
          return { place: ui('place.searchLabel'), search: ui('focus.searchLabel') };
        });
        if (await pp.getAttribute('#range-open', 'aria-expanded') !== 'false') throw new Error(`${lang}: intervallet börjar som expanderat`);
        await pp.click('#year-jump');
        await pp.click('#range-open');
        await pp.waitForSelector('.range-preset', { timeout: T.step });
        if (await pp.getAttribute('#range-open', 'aria-expanded') !== 'true') throw new Error(`${lang}: öppet formulär saknar expanderat läge`);
        const form = pp.locator('#range-pop');
        const snapshot = await form.ariaSnapshot();
        fs.writeFileSync(path.join(OUT, `${vp.name}-977-${lang}-formular.aria.yml`), snapshot);
        const groups = await pp.locator('.range-preset-group').count();
        if (!groups || await form.getByRole('heading', { level: 2 }).count() !== groups || !snapshot.includes('[level=2]')) throw new Error(`${lang}: epokgrupperna saknar rubriker`);
        for (const button of await pp.locator('.range-preset').all()) {
          const name = await button.ariaSnapshot();
          const years = name.match(/\d+/g) ?? [];
          if (new Set(years).size !== years.length) throw new Error(`${lang}: upprepade årtal i ${name}`);
        }
        // En knapp utan år i namnet behåller datumen och förklaringen om klippningen.
        const stone = await pp.locator('[data-period="nordisk-stenalder"]').ariaSnapshot();
        if (!/12\s?[\s.,]?000/.test(stone) || !stone.includes('1700')) throw new Error(`${lang}: stenålderns intervall saknas i knappnamnet`); // 12 000 f.Kr. sedan #1088
        await pp.locator('.range-preset').first().focus();
        await pp.keyboard.press('Enter');
        await pp.waitForSelector('#range-bar:not([hidden])', { state: 'attached', timeout: T.step });
        if (await pp.getAttribute('#range-open', 'aria-expanded') !== 'false') throw new Error(`${lang}: valet stängde inte expanderat läge`);
        if (await pp.getAttribute('#range-bar-text', 'aria-live') !== 'polite' || await pp.getAttribute('#range-bar-text', 'aria-atomic') !== 'true') throw new Error(`${lang}: intervallets rad är inte live och atomär`);
        await pp.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        if ((await pp.textContent('#screen-reader-status')).trim()) throw new Error(`${lang}: Samtidigt-kortet talar över intervallet`);
        await pp.click('#range-exit');
        if ((await pp.textContent('#range-bar-text')).trim()) throw new Error(`${lang}: en gammal intervalluppläsning står kvar`);
        await pp.click('#year-jump');
        await pp.click('#range-open');
        await pp.keyboard.press('Escape');
        if (await pp.getAttribute('#range-open', 'aria-expanded') !== 'false') throw new Error(`${lang}: Escape lämnade expanderat läge`);
        await pp.evaluate(() => document.getElementById('btn-focus').click());
        await pp.click('#focus-menu [data-tab="Plats"]');
        const input = pp.locator('#focus-menu').getByRole('searchbox', { name: copy.place, exact: true });
        await input.fill('zzzzqq');
        await pp.waitForFunction(() => document.querySelector('#focus-menu .focus-live')?.textContent.includes('zzzzqq'), null, { timeout: T.step });
        const place = pp.locator('#focus-menu');
        fs.writeFileSync(path.join(OUT, `${vp.name}-977-${lang}-plats.aria.yml`), await place.ariaSnapshot());
        if ((await place.locator('.focus-body').ariaSnapshot()).includes('zzzzqq')) throw new Error(`${lang}: ingen träff läses både i listan och statusen`);
        if (!(await place.locator('.focus-live').ariaSnapshot()).includes('zzzzqq')) throw new Error(`${lang}: ingen träff saknas i statusen`);
        await pp.click('#focus-menu [data-tab="Alla"]');
        if (await pp.getAttribute('#focus-menu .focus-search', 'aria-label') !== copy.search) throw new Error(`${lang}: det vanliga söknamnet återställdes inte`);
        if (await pp.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`${lang}: horisontell scroll`);
        if (errors.length) throw new Error(`${lang}: ${errors.join(' | ')}`);
      } finally { await pp.close(); }
    }
    return 'ARIA-snapshots på fem språk: rubriker, årtal en gång, expanderat läge, tyst kort under intervallet och rätt platsnamn utan dubbelt felbesked';
  });
  // #965: epokknapparna i intervallformuläret (#845 del 3): ett klick väljer intervallet, adressen och Bakåt följer med,
  // knapparna går att nå med tangentbordet, rymmer sig i bredden, och stoppas under en tur (samma spärr som formuläret).
  await check('epokknapparna i intervallformuläret väljer ett intervall med ett klick (#965)', async () => {
    const tp = await context.newPage();
    const errors = [];
    tp.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) errors.push(m.text()); });
    tp.on('pageerror', e => errors.push(e.message));
    const text = sel => tp.textContent(sel).then(x => x.trim());
    const hashHas = (re, want = true) => tp.waitForFunction(([src, w]) => new RegExp(src).test(location.hash) === w, [re.source, want], { timeout: T.step });
    const shown = sel => tp.evaluate(q => { const el = document.querySelector(q); return !!el && !el.hidden && el.getClientRects().length > 0; }, sel);
    const openForm = async () => {
      await tp.evaluate(() => { const pop = document.getElementById('jump-pop'); if (pop.hidden) document.getElementById('year-jump').click(); document.getElementById('range-open').click(); });
      await tp.waitForSelector('#range-pop', { state: 'visible', timeout: T.step });
      await tp.waitForSelector('#range-presets .range-preset', { state: 'attached', timeout: T.step });
    };
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await tp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await tp.route(u => isFont(u.href), r => r.abort());
      }
      await tp.goto(`${BASE}?ny=92#y=1400`);
      await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await openForm();
      // En grupp per indelning i data/perioder.json (i dag fyra), med rubrik och förenklingstext, och en knapp per epok.
      // Antalet läses ur datan, så att en ny indelning inte gör testet rött (granskningen 2026-11-08).
      const wanted = await tp.evaluate(() => fetch('data/perioder.json').then(r => r.json()).then(d => d.divisions.map(x => [true, true, x.periods.length])));
      const groups = await tp.evaluate(() => [...document.querySelectorAll('.range-preset-group')].map(g => [g.querySelector('.range-preset-head').textContent.length > 3, g.querySelector('.range-preset-note').textContent.length > 20, g.querySelectorAll('button.range-preset').length]));
      if (JSON.stringify(groups) !== JSON.stringify(wanted)) throw new Error(`grupperna ser ut så här: ${JSON.stringify(groups)}`);
      // Rymmer sig i bredden och har tryckyta på minst 44 px
      const fit = await tp.evaluate(() => {
        const pop = document.getElementById('range-pop').getBoundingClientRect();
        const bad = [...document.querySelectorAll('.range-preset')].filter(b => { const r = b.getBoundingClientRect(); return r.height < 43.5 || r.right > innerWidth + 1 || r.left < -1; }).length;
        return { bad, over: document.documentElement.scrollWidth > innerWidth + 1, popRight: pop.right <= innerWidth + 1 };
      });
      if (fit.bad || fit.over || !fit.popRight) throw new Error(`knapparna ryms inte eller är för låga: ${JSON.stringify(fit)}`);
      // Formuläret ryms också på höjden, och "Visa intervallet" går att träffa med musen (#973): det rullar i stället för att sluta under skärmen
      const reach = await tp.evaluate(() => {
        const pop = document.getElementById('range-pop'), go = pop.querySelector('.jump-go');
        pop.scrollTop = pop.scrollHeight;
        const r = go.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        const out = { popBottom: Math.round(pop.getBoundingClientRect().bottom), height: innerHeight, goBottom: Math.round(r.bottom), reachable: !!hit && (hit === go || go.contains(hit)) };
        pop.scrollTop = 0;
        return out;
      });
      if (reach.popBottom > reach.height + 1 || !reach.reachable) throw new Error(`"Visa intervallet" nås inte: ${JSON.stringify(reach)}`);
      // Tangentbord: fokus på en knapp och Enter
      await tp.focus('[data-period="norden-1500-1800"]');
      await tp.keyboard.press('Enter');
      await tp.waitForSelector('#range-bar:not([hidden])', { state: 'attached', timeout: T.step });
      if (await text('#year-big') !== '1500–1800') throw new Error(`epoken gav ${await text('#year-big')}`);
      if (!(await text('#range-bar-text')).startsWith('Norden, cirka 1500–1800 · ')) throw new Error(`raden visar ${await text('#range-bar-text')}`);
      await hashHas(/y=1500&y2=1800/);
      if (await tp.evaluate(() => document.activeElement?.id) !== 'range-exit') throw new Error('fokus hamnade inte på Tillbaka till ett år');
      if (await tp.evaluate(() => !document.getElementById('range-pop').hidden)) throw new Error('formuläret stod kvar öppet');
      // Bakåt återställer
      await tp.goBack();
      await hashHas(/y2=/, false);
      await tp.waitForSelector('#range-bar', { state: 'hidden', timeout: T.step });
      // Stenåldern ryms på tidslinjen sedan #1088 (12 000–1700 f.Kr.); 1900 till nutid går till i dag
      await openForm();
      const { min: firstYear } = await timelineBounds(tp);
      const stone = await text('[data-period="nordisk-stenalder"] .range-preset-years');
      if (!stone.replace(/\s/g, ' ').startsWith('12 000–1700 f.Kr.')) throw new Error(`stenåldern säger ${stone}`);
      const today = await text('[data-period="demokratisering-globalisering-1900-"] .range-preset-years');
      if (!/^1900–\d{4} · /.test(today)) throw new Error(`1900 till nutid säger ${today}`);
      await tp.click('[data-period="nordisk-stenalder"]');
      await tp.waitForSelector('#range-bar:not([hidden])', { state: 'attached', timeout: T.step });
      await hashHas(/y=-11999&y2=-1699/);
      // #980: epoken syns i intervallraden och följer med i länken; en länk med andra år visar ingen epok
      await hashHas(/p=nordisk-stenalder/);
      const epochBar = await text('#range-bar-text');
      if (!/^[^\d]+ · 12\s000–1700 f\.Kr\. · \d+ händelse/.test(epochBar)) throw new Error(`intervallraden visar inte epoken: ${epochBar}`);
      await tp.evaluate(min => { location.hash = `#y=${min}&y2=-1599&p=nordisk-stenalder`; }, -11999);
      await tp.waitForFunction(() => /1600 f\.Kr\./.test(document.getElementById('range-bar-text')?.textContent ?? ''), null, { timeout: T.step });
      if (/^[^\d]+ · /.test(await text('#range-bar-text'))) throw new Error('en epok visas fast åren inte är epokens');
      await tp.evaluate(min => { location.hash = `#y=${min}&y2=-1699&p=nordisk-stenalder`; }, -11999);
      await tp.waitForFunction(() => /1700 f\.Kr\./.test(document.getElementById('range-bar-text')?.textContent ?? ''), null, { timeout: T.step });
      await tp.click('#range-exit');
      // Under en tur erbjuds inte intervallet eller dess epokknappar
      await tp.evaluate(() => { location.hash = '#t=tre-platser-1325'; });
      await tp.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
      await tp.click('#year-jump', { force: true }); // låst i en tur (#1322): formuläret kan inte öppnas
      if (await shown('#range-open') || await shown('#range-pop')) throw new Error('tidsintervallet erbjuds fortfarande under en tur');
      if (errors.length) throw new Error(`konsolfel: ${errors.join('; ')}`);
    } finally {
      await tp.close();
    }
    return 'en grupp per indelning i datan, tangentbord, adress och Bakåt, stenålder och nutid märkta; intervallet erbjuds inte under en tur';
  });
  // #974: i intervallet räknar märket, intervallraden och panelen samma händelser, och ingen text säger "±0 år" (en händelse som
  // pågått sedan länge hamnade som "nära" med ±0 år och gav märket ett högre tal än raden).
  await check('intervallet räknar samma i märket, raden och panelen (#974)', async () => {
    const tp = await context.newPage();
    const errors = [];
    tp.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) errors.push(m.text()); });
    tp.on('pageerror', e => errors.push(e.message));
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await tp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await tp.route(u => isFont(u.href), r => r.abort());
      }
      for (const hash of ['#y=1914&y2=1918', '#y=1900&y2=2026']) {
        await tp.goto(`${BASE}?ny=92${hash}`);
        await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        await tp.waitForSelector('#range-bar:not([hidden])', { state: 'attached', timeout: T.step });
        await tp.waitForFunction(() => /\d/.test(document.getElementById('range-bar-text')?.textContent ?? '') && document.getElementById('panel-sub')?.textContent.length > 5, null, { timeout: T.step });
        const got = await tp.evaluate(() => ({
          badge: document.getElementById('panel-count').textContent.trim(),
          bar: (document.getElementById('range-bar-text').textContent.match(/(\d[\d\s\u00a0]*) händelse/) || [])[1]?.replace(/\D/g, ''),
          sub: document.getElementById('panel-sub').textContent,
        }));
        if (got.badge !== got.bar) throw new Error(`${hash}: märket visar ${got.badge} men raden ${got.bar}`);
        if (/±\s*0\b/.test(got.sub)) throw new Error(`${hash}: panelen säger ±0 år: ${got.sub}`);
      }
      if (errors.length) throw new Error(`konsolfel: ${errors.join('; ')}`);
    } finally {
      await tp.close();
    }
    return 'märket, intervallraden och panelen räknar lika (1914–1918 och 1900–i dag), utan "±0 år"';
  });
  // #885: läraren får en väg till elev- och lärarbladen i lektionsläget (r=lararen i länken eller Starta som lektion i
  // Turer-menyn); eleven i den vanliga lektionslänken ser ingen utskriftsknapp. Utskriften rör inte steget.
  await check('läraren når elev- och lärarbladen i lektionsläget, eleven inte (#885)', async () => {
    const tp = await context.newPage();
    const errs = [];
    tp.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) errs.push(m.text()); });
    tp.on('pageerror', e => errs.push(e.message));
    const shown = sel => tp.evaluate(s => { const el = document.querySelector(s); return !!el && el.getClientRects().length > 0; }, sel);
    const open = async url => { await tp.goto(url); await tp.waitForSelector('#loading', { state: 'hidden', timeout: T.load }); await tp.waitForSelector('#lesson-band', { state: 'visible', timeout: T.step }); await tp.waitForSelector('#tour-card', { state: 'visible', timeout: T.step }); };
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await tp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await tp.route(u => isFont(u.href), r => r.abort());
      }
      // Eleven i den vanliga lektionslänken: ingen utskriftsknapp någonstans
      await open(`${BASE}?ny=31#t=andra-varldskriget&m=lektion`);
      if (await shown('#lesson-print') || await shown('#tour-print')) throw new Error('eleven ser en utskriftsknapp i den vanliga lektionslänken');
      // Läraren: knappen i bandet, med namn, och utskriften skapar de tre bladen utan att lämna steget
      await open(`${BASE}?ny=32#t=andra-varldskriget&m=lektion&r=lararen`);
      if (!(await shown('#lesson-print'))) throw new Error('läraren ser ingen utskriftsknapp i bandet');
      if (!/Skriv ut/.test((await tp.textContent('#lesson-print')).trim())) throw new Error('knappen saknar ett läsbart namn');
      await tp.evaluate(() => { window.__prints = 0; window.print = () => { window.__prints++; }; });
      await tp.click('#tour-next'); await tp.click('#tour-next'); // till steg 3, så att vi ser att steget står kvar
      const before = { step: (await tp.textContent('#tour-progress')).trim(), year: (await tp.textContent('#year-big')).trim() };
      await tp.click('#lesson-print');
      await tp.waitForFunction(() => window.__prints === 1, null, { timeout: T.step });
      const got = await tp.evaluate(() => ({ pages: document.querySelectorAll('#print-sheet .print-page').length, focus: document.activeElement?.id, hash: location.hash }));
      if (got.pages < 2) throw new Error(`utskriften gav ${got.pages} blad`);
      const after = { step: (await tp.textContent('#tour-progress')).trim(), year: (await tp.textContent('#year-big')).trim() };
      if (after.step !== before.step || after.year !== before.year) throw new Error(`steget ändrades av utskriften: ${before.step}/${before.year} → ${after.step}/${after.year}`);
      if (got.focus !== 'lesson-print') throw new Error(`fokus gick till ${got.focus} efter utskriften`);
      // Rollen skrivs aldrig i adressen: Dela och omladdning ger inte eleven knappen
      if (/[#&]r=/.test(got.hash)) throw new Error(`adressen har fått rollen: ${got.hash}`);
      if (!/m=lektion/.test(got.hash)) throw new Error('adressen tappade m=lektion');
      await tp.reload();
      await tp.waitForSelector('#lesson-band', { state: 'visible', timeout: T.load });
      if (await shown('#lesson-print')) throw new Error('knappen finns kvar efter omladdning utan r= i adressen');
      if (errs.length) throw new Error(`konsolfel: ${errs.join('; ')}`);
    } finally {
      await tp.close();
    }
    return 'eleven ser ingen knapp; r=lararen ger knappen i bandet, tre blad skrivs ut, steget och året står kvar, fokus kommer tillbaka och rollen skrivs aldrig i adressen';
  });
  // #930: Kopiera lärarlänk i turkortet (den fria vyn) ger lektionslänken med r=lararen; den hamnar aldrig i adressen,
  // och länken öppnar lektionen med lärarens utskriftsknapp i bandet.
  await check('Kopiera lärarlänk ger en länk som öppnar lektionen med utskriftsknappen (#930)', async () => {
    const cp = await context.newPage();
    const errs = [];
    cp.on('pageerror', e => errs.push(e.message));
    const shown = sel => cp.evaluate(s => { const el = document.querySelector(s); return !!el && el.getClientRects().length > 0; }, sel);
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await cp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await cp.route(u => isFont(u.href), r => r.abort());
      }
      const open = async url => { await cp.goto(url); await cp.waitForSelector('#loading', { state: 'hidden', timeout: T.load }); await cp.waitForSelector('#tour-card', { state: 'visible', timeout: T.step }); };
      // En tur utan lärarfält har ingen knapp
      await open(`${BASE}?ny=51#t=tre-platser-1325`);
      if (await shown('#tour-copy-teacher')) throw new Error('en tur utan lärarfält har Kopiera lärarlänk');
      // En lektionstur i den fria vyn har den, och urklippet får lärarlänken
      await open(`${BASE}?ny=52#t=andra-varldskriget`);
      if (!(await shown('#tour-copy-teacher'))) throw new Error('en lektionstur saknar Kopiera lärarlänk');
      if (!/lärarlänk/i.test(await cp.textContent('#tour-copy-teacher'))) throw new Error('knappen har fel namn');
      await cp.evaluate(() => { window.__copied = null; Object.defineProperty(navigator, 'clipboard', { value: { writeText: async t => { window.__copied = t; } }, configurable: true }); });
      await cp.click('#tour-copy-teacher');
      await cp.waitForFunction(() => window.__copied, null, { timeout: T.step });
      const got = await cp.evaluate(() => ({ copied: window.__copied, status: document.getElementById('tour-print-status').textContent.trim(), statusShown: !document.getElementById('tour-print-status').hidden, role: document.getElementById('tour-print-status').getAttribute('role'), hash: location.hash }));
      if (!/#t=andra-varldskriget&m=lektion&r=lararen$/.test(got.copied)) throw new Error(`urklippet har fel länk: ${got.copied}`);
      if (!got.statusShown || !/kopierad/.test(got.status) || got.role !== 'status') throw new Error(`bekräftelsen saknas eller annonseras inte: "${got.status}"`);
      if (/[#&]r=/.test(got.hash)) throw new Error(`adressen har fått rollen: ${got.hash}`);
      // Lärarlänken öppnar lektionen med utskriftsknappen
      await cp.goto(got.copied);
      await cp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await cp.waitForSelector('#lesson-band', { state: 'visible', timeout: T.step });
      if (!(await shown('#lesson-print'))) throw new Error('lärarlänken gav ingen utskriftsknapp i bandet');
      if (await shown('#tour-copy-teacher')) throw new Error('Kopiera lärarlänk syns i lektionsläget');
      if (errs.length) throw new Error(`sidfel: ${errs.join('; ')}`);
    } finally {
      await cp.close();
    }
    return 'ingen knapp i en tur utan lärarfält; lektionsturen kopierar länken med r=lararen, bekräftar med role=status och lämnar adressen utan roll; länken öppnar lektionen med utskriftsknappen';
  });
  // #862 F7: i mobil öppnades faktarutan bakom turkortet, så att kortets text täckte rubrik, handtag och Stäng.
  // Prövar att faktarutans stängknapp är det som träffas mitt på knappen (inte kortet) och att Stäng fungerar.
  await check('faktarutan öppnas ovanpå lektionskortet och går att stänga (#862)', async () => {
    const dp = await context.newPage();
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await dp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await dp.route(u => isFont(u.href), r => r.abort());
      }
      await dp.goto(`${BASE}?ny=8#t=andra-varldskriget&m=lektion&s=storbritannien`);
      await dp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await dp.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
      await dp.getByRole('button', { name: /Läs om händelsen/ }).first().click({ timeout: T.step });
      await dp.waitForSelector('#detail:not([hidden])', { state: 'visible', timeout: T.step });
      const hit = await dp.evaluate(() => {
        const close = document.querySelector('#detail .detail-close');
        if (!close) return { error: 'faktarutan saknar stängknapp' };
        const b = close.getBoundingClientRect();
        const el = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
        const handle = document.querySelector('#detail .sheet-handle');
        const hb = handle && handle.getClientRects().length ? handle.getBoundingClientRect() : null;
        const topAtHandle = hb ? document.elementFromPoint(hb.x + hb.width / 2, hb.y + hb.height / 2) : null;
        return { onClose: !!el && close.contains(el), top: el && (el.id || el.className || el.tagName),
          handleCovered: !!hb && !handle.contains(topAtHandle) };
      });
      if (hit.error) throw new Error(hit.error);
      if (!hit.onClose) throw new Error(`faktarutans Stäng är övertäckt av ${hit.top}`);
      if (hit.handleCovered) throw new Error('faktarutans handtag är övertäckt');
      await dp.click('#detail .detail-close', { timeout: T.step });
      await dp.waitForSelector('#detail', { state: 'hidden', timeout: T.step });
      if (!(await dp.isVisible('#tour-card'))) throw new Error('turkortet försvann när faktarutan stängdes');
    } finally {
      await dp.close();
    }
    return 'Läs om händelsen: Stäng och handtag nås, och Stäng ger tillbaka turkortet';
  });
  // #889: lektionerna märks i Turer-menyn och startas som lektion med en knapp; vanliga turer får ingen sådan knapp
  await check('Turer-menyn märker lektionerna och startar dem som lektion (#889)', async () => {
    const mp = await context.newPage();
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await mp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await mp.route(u => isFont(u.href), r => r.abort());
      }
      await mp.goto(`${BASE}?ny=9`);
      await mp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      if (await mp.isHidden('#btn-tour') && await mp.isVisible('#more-toggle')) await mp.click('#more-toggle');
      if (await mp.isHidden('#btn-tour') && await mp.isVisible('#btn-more')) await mp.click('#btn-more');
      await mp.click('#btn-tour');
      await mp.waitForSelector('#tour-menu:not([hidden])', { state: 'visible', timeout: T.step });
      const picks = await mp.evaluate(() => [...document.querySelectorAll('#tour-menu li')].map(li => ({ tour: li.querySelector('.tour-pick')?.dataset.tour, start: li.querySelector('.tour-start-btn')?.dataset.tour })));
      if (picks[0]?.tour !== 'hur-vet-vi-det-har') throw new Error(`turlistan börjar med ${picks[0]?.tour}, väntade hur-vet-vi-det-har (#1002)`);
      const bare = picks.filter(x => x.start !== x.tour);
      if (bare.length) throw new Error(`turer utan synlig startknapp: ${bare.map(x => x.tour).join(', ')} (#1002)`);
      const rows = await mp.evaluate(() => [...document.querySelectorAll('#tour-menu .tour-lesson-row')].filter(r => r.querySelector('.tour-lesson-meta')?.textContent.trim()).map(r => ({
        meta: r.querySelector('.tour-lesson-meta')?.textContent.trim(), tour: r.querySelector('.tour-lesson-start')?.dataset.tour,
        label: r.querySelector('.tour-lesson-start')?.getAttribute('aria-label') })));
      if (rows.length !== 2) throw new Error(`${rows.length} lektioner märkta i menyn, väntade 2`);
      const ww = rows.find(r => r.tour === 'andra-varldskriget');
      if (!ww || !/Lektion · årskurs 7–9 · \d+ min/.test(ww.meta) || !/Starta som lektion: /.test(ww.label)) throw new Error(`lektionen för andra världskriget märks fel: ${JSON.stringify(ww)}`);
      if (await mp.locator('#tour-menu .tour-lesson-start[data-tour="forsta-varldskriget"]').count()) throw new Error('en vanlig tur har fått knappen Starta som lektion');
      await mp.click('#tour-menu .tour-lesson-start[data-tour="andra-varldskriget"]');
      await mp.waitForSelector('#lesson-band', { state: 'visible', timeout: T.step });
      await mp.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
      if (!/^Steg 1 av 14$/.test((await mp.textContent('#tour-progress')).trim())) throw new Error('lektionen startade inte vid steg 1');
      if ((await mp.textContent('#year-big')).trim() !== '1939') throw new Error('lektionen börjar inte 1939');
      if (!(await mp.isVisible('#lesson-print'))) throw new Error('Starta som lektion i menyn ger läraren ingen utskriftsknapp i bandet (#885)');
      await mp.waitForFunction(() => location.hash.includes('m=lektion'), null, { timeout: T.step }).catch(() => { throw new Error('adressen saknar m=lektion efter knappen'); });
      // Den vanliga starten gör fortfarande en vanlig tur utan band
      await mp.click('#lesson-exit');
      await mp.waitForSelector('#lesson-band', { state: 'hidden', timeout: T.step });
    } finally {
      await mp.close();
    }
    return 'två lektioner märkta (årskurs och tid), Starta som lektion ger bandet, steg 1 och 1939, m=lektion i adressen; vanliga turer utan lektionsknapp; Hur vet vi det här först och en Starta turen-knapp på varje tur (#1002)';
  });
  // #994 och #995: raden under årtalet säger århundradet och fönstret i klartext, och det som ligger före eller efter året
  // säger hur långt ("4 år före (1912)", "21 år senare") i stället för "slut 1912"
  await check('tidsfönstret i vardagsspråk och riktning i tid på etiketter och i listan (#994, #995)', async () => {
    const wp = await context.newPage();
    const errs = [];
    wp.on('pageerror', e => errs.push(e.message));
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await wp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await wp.route(u => isFont(u.href), r => r.abort());
      }
      let loads = 0;
      const open = async hash => {
        await wp.goto(`${BASE}?ny=w${loads++}${hash}`);
        await wp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        await wp.waitForSelector('#event-list .event-item', { state: 'attached', timeout: T.step });
      };
      const row = () => wp.evaluate(() => document.getElementById('year-segment').textContent.trim());
      const metas = () => wp.evaluate(() => [...document.querySelectorAll('#event-list .event-item .meta')].map(m => m.textContent));
      const labels = () => wp.evaluate(() => [...document.querySelectorAll('#labels .glabel')].map(l => l.textContent));
      const want = async (hash, pattern) => {
        await open(hash);
        // Följandet och raden uppdateras efter att sidan har öppnats: vänta in raden (WebKit är långsammare), men kräv fortfarande mönstret
        await wp.waitForFunction(p => new RegExp(p).test(document.getElementById('year-segment').textContent.trim()), pattern.source, { timeout: 8000 }).catch(() => {});
        const got = await row();
        if (!pattern.test(got)) throw new Error(`${hash}: raden under årtalet säger "${got}"`);
        if (/Bronsålder|Antiken|Medeltid|Modern tid/.test(got)) throw new Error(`${hash}: raden har kvar epoknamn: "${got}"`);
        return got;
      };
      // En sidladdning per år, så att kontrollen inte tar tid från resten av jobbet
      const rows = [];
      // #1191: avrundat fönster med "±" (beslut 2026-11-12), och förklaringen "nära i tid" i title och som dold text
      rows.push(await want('#y=1325', /^1300-talet · ±\d*0 år$/));
      const note = await wp.evaluate(() => ({ title: document.getElementById('year-segment').title, sr: document.getElementById('year-window-note').textContent }));
      if (!/nära i tid/.test(note.title) || note.sr !== note.title) throw new Error(`förklaringen av fönstret saknas: ${JSON.stringify(note)}`);
      // Listan: det som ligger nära året säger riktning
      const list = await metas();
      if (!list.some(m => /^\d+ år (tidigare|senare) · /.test(m))) throw new Error('listan 1325 har ingen rad med "N år tidigare/senare"');
      // Klotets etiketter: "N år före (år)" och "om N år (år)", aldrig "slut" eller "börjar"
      rows.push(await want('#y=1916', /^1900-talet · ±\d*[05] år$/));
      // Etiketterna ritas om en bildruta efter att raden bytt text: vänta in dem (annars läses de gamla, #1138), men kräv fortfarande att etiketten finns
      await wp.waitForFunction(() => [...document.querySelectorAll('#labels .glabel')].some(l => l.textContent === 'Första världskriget'), null, { timeout: 8000 }).catch(() => {});
      const shown = await labels();
      const before = shown.find(l => /Titanic/.test(l));
      if (before && !/ · 4 år före \(1912\)$/.test(before)) throw new Error(`Titanic 1916 säger "${before}"`);
      // #1022: det som pågår går före rikesnamnen. Första världskriget får en etikett i dator- och mobilbredd (i mobilbredd
      // ligger markören vid kanten, så etiketten får som sista utväg ligga över en grannmarkör), och rikesnamnen får inte ta hela platsen över Europa
      if (!shown.some(l => l === 'Första världskriget')) throw new Error(`år 1916 saknar etikett för första världskriget: ${shown.join(' | ')}`);
      if (shown.some(l => / · (slut|börjar) \d/.test(l))) throw new Error(`etikett med slut/börjar kvar: ${shown.find(l => / · (slut|börjar) \d/.test(l))}`);
      // 500 f.Kr. ligger vid en segmentgräns och har olika långt fönster före och efter (#1319, egen kontroll nedan); 1500 f.Kr. ligger inne i ett segment
      rows.push(await want('#y=-1500', /^1500-talet f\.Kr\. · ±\d*0 år$/));
      rows.push(await want('#y=1914&f=war:forsta-varldskriget', /^Följer .+ · visar \d+ (år|dagar?) före och efter$/));
      // Yngre läsare (#1191): lektion 2 för åk 4–6 skriver fönstret i ord i stället för med "±"
      rows.push(await want('#t=vikingatiden-och-varlden&m=lektion', /^\d+-talet · även \d+ år före och efter$/));
      if (errs.length) throw new Error(`sidfel: ${errs[0]}`);
      return `${rows[0]} | ${rows[2]} | 1916: ${before ?? '(ingen Titanic-etikett)'}`;
    } finally { await wp.close(); }
  });
  // #1387 (WCAG 2.5.3, Label in Name): knappens tillgängliga namn börjar med den synliga texten, så att röststyrning som säger
  // "Samtidigt" hittar den. Svenska och engelska (där knappen heter något annat) körs i samma bredd som jobbet.
  await check('Samtidigt-knappens tillgängliga namn börjar med den synliga texten (#1387)', async () => {
    const wp = await context.newPage();
    const errs = [];
    wp.on('pageerror', e => errs.push(e.message));
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await wp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await wp.route(u => isFont(u.href), r => r.abort());
      }
      const out = [];
      let loads = 0;
      for (const lang of ['sv', 'en']) {
        await wp.goto(`${BASE}?lang=${lang}&ny=n${loads++}#y=1325`);
        await wp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        await wp.waitForSelector('#event-list .event-item', { state: 'attached', timeout: T.step });
        const m = await wp.evaluate(() => {
          const b = document.getElementById('btn-panel');
          const visible = [...b.childNodes].find(n => n.nodeType === 3 && n.textContent.trim())?.textContent.trim();
          return { visible, name: b.getAttribute('aria-label') };
        });
        if (!m.visible) throw new Error(`${lang}: knappen har ingen synlig text`);
        if (!m.name || !m.name.startsWith(`${m.visible},`)) throw new Error(`${lang}: namnet "${m.name}" börjar inte med den synliga texten "${m.visible}"`);
        if (!/\d/.test(m.name)) throw new Error(`${lang}: namnet "${m.name}" har tappat antalet träffar`);
        out.push(m.name);
      }
      if (errs.length) throw new Error(`sidfel: ${errs[0]}`);
      return out.join(' | ');
    } finally { await wp.close(); }
  });
  // #1319: fönstret är 1,2 % av reglaget åt varje håll, räknat i reglagets läge. Vid en segmentgräns blir det olika långt före
  // och efter året, och raden under årtalet skriver då båda sidorna i klartext i stället för "±". Inne i ett segment är det som förut.
  await check('tidsfönstret före och efter året vid en segmentgräns (#1319)', async () => {
    const wp = await context.newPage();
    const errs = [];
    wp.on('pageerror', e => errs.push(e.message));
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await wp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await wp.route(u => isFont(u.href), r => r.abort());
      }
      let loads = 0;
      const text = async hash => {
        await wp.goto(`${BASE}?lang=sv&ny=f${loads++}${hash}`);
        await wp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        await wp.waitForSelector('#event-list .event-item', { state: 'attached', timeout: T.step });
        await wp.waitForFunction(() => document.getElementById('year-segment').textContent.trim() !== '', null, { timeout: 8000 });
        return wp.evaluate(() => ({ row: document.getElementById('year-segment').textContent.trim(), title: document.getElementById('year-segment').title, sr: document.getElementById('year-window-note').textContent }));
      };
      // 5000 f.Kr.: det glesa segmentet bakåt (cirka 11 600 år), kortare framåt där 3000 f.Kr. och det täta segmentet börjar
      const a = await text('#y=-4999');
      if (!/ · 12\s000 år före, 2000 år efter$/.test(a.row)) throw new Error(`5000 f.Kr.: raden säger "${a.row}"`);
      if (/±/.test(a.row + a.title)) throw new Error(`5000 f.Kr.: "±" visas fast sidorna är olika långa: ${a.row}`);
      if (!/upp till 12\s000 år före eller 2000 år efter/.test(a.title) || a.sr !== a.title) throw new Error(`5000 f.Kr.: förklaringen säger "${a.title}"`);
      // 501 f.Kr.: segmentgräns med 140 år före och 80 år efter
      const b = await text('#y=-500');
      if (!/ · 140 år före, 80 år efter$/.test(b.row)) throw new Error(`501 f.Kr.: raden säger "${b.row}"`);
      // Inne i ett segment är sidorna lika långa och raden är som förut
      const c = await text('#y=1325');
      if (!/^1300-talet · ±\d*0 år$/.test(c.row)) throw new Error(`1325: raden säger "${c.row}"`);
      if (errs.length) throw new Error(`sidfel: ${errs[0]}`);
      return `${a.row} | ${b.row} | ${c.row}`;
    } finally { await wp.close(); }
  });
  // #1322: tidslåset i lägeskontraktet. I en tur och i en lektion (som börjar med en tur) går året inte att byta med drag, klick,
  // tangenter, stegknappar eller årshoppet, och steget och adressen står kvar. När turen slutar fungerar reglaget igen.
  await check('tidslåset: reglaget är låst i en tur och en lektion och släpps när turen slutar (#1322)', async () => {
    const wp = await context.newPage();
    const errs = [];
    wp.on('pageerror', e => errs.push(e.message));
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await wp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await wp.route(u => isFont(u.href), r => r.abort());
      }
      const state = () => wp.evaluate(() => ({ year: document.getElementById('year-big').textContent.trim(), step: document.getElementById('tour-progress').textContent.trim() }));
      let loads = 0;
      const open = async hash => {
        await wp.goto(`${BASE}?lang=sv&ny=l${loads++}${hash}`);
        await wp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        await wp.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
      };
      const tryToMove = async () => {
        const before = await state();
        const box = await wp.locator('#track').boundingBox();
        const y = box.y + box.height / 2;
        await wp.mouse.click(box.x + box.width * 0.2, y);
        await wp.mouse.move(box.x + box.width * 0.9, y); await wp.mouse.down();
        await wp.mouse.move(box.x + box.width * 0.3, y, { steps: 4 }); await wp.mouse.up();
        await wp.focus('#track');
        for (const k of ['ArrowLeft', 'ArrowRight', 'PageUp', 'Home', 'End']) await wp.keyboard.press(k);
        await wp.evaluate(() => { for (const b of document.querySelectorAll('.step[data-step], #btn-play')) b.click(); }); // även ett programmatiskt klick
        await wp.click('#year-jump', { force: true }).catch(() => {});
        const jumped = !(await wp.locator('#jump-pop').isHidden());
        const after = await state();
        return { before, after, jumped, aria: await wp.getAttribute('#track', 'aria-disabled'), disabled: await wp.evaluate(() => [...document.querySelectorAll('.step[data-step]')].every(b => b.disabled)) };
      };
      const out = [];
      for (const hash of ['#t=andra-varldskriget', '#t=andra-varldskriget&m=lektion']) {
        await open(hash);
        const r = await tryToMove();
        if (r.after.year !== r.before.year || r.after.step !== r.before.step) throw new Error(`${hash}: reglaget flyttade ${JSON.stringify(r.before)} till ${JSON.stringify(r.after)}`);
        if (r.jumped) throw new Error(`${hash}: årshoppet öppnades i en låst tur`);
        if (r.aria !== 'true' || !r.disabled) throw new Error(`${hash}: reglaget visar inte låset (aria-disabled ${r.aria}, stegknappar avstängda ${r.disabled})`);
        out.push(`${hash.includes('lektion') ? 'lektion' : 'tur'} låst vid ${r.before.year}`);
      }
      // Turen slutar: reglaget fungerar igen
      await open('#t=andra-varldskriget');
      await wp.click('#tour-close');
      await wp.waitForSelector('#tour-card', { state: 'hidden', timeout: T.step });
      const free = await wp.evaluate(() => ({ aria: document.getElementById('track').getAttribute('aria-disabled'), steps: [...document.querySelectorAll('.step[data-step]')].some(b => b.disabled) }));
      if (free.aria !== null || free.steps) throw new Error(`reglaget är kvar i låst läge efter turen: ${JSON.stringify(free)}`);
      const y0 = (await wp.textContent('#year-big')).trim();
      await wp.click('.step[data-step="10"]');
      if ((await wp.textContent('#year-big')).trim() === y0) throw new Error('stegknappen fungerar inte efter turen');
      if (errs.length) throw new Error(`sidfel: ${errs[0]}`);
      return `${out.join(', ')}; fritt efter turen`;
    } finally { await wp.close(); }
  });
  // #1309: i mobil ska träffytor vara minst 44 × 44 px (själva knappen eller dess osynliga förlängning), ingen text vara under 12 px och
  // Lager, Sök och följ och Turer ha en synlig stängknapp. Kartans etiketter och klungor och tidsskalans små märken (.tff) ingår inte än.
  await check('mobil: träffytor på 44 px, text på minst 12 px och stängknapp i menyerna (#1309)', async () => {
    if (vp.width > 760) return 'körs i mobiljobbet';
    const wp = await context.newPage();
    const errs = [];
    wp.on('pageerror', e => errs.push(e.message));
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await wp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await wp.route(u => isFont(u.href), r => r.abort());
      }
      await wp.goto(`${BASE}?lang=sv&ny=m${Date.now()}#y=1325`);
      await wp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await wp.waitForSelector('#event-list .event-item', { state: 'attached', timeout: T.step });
      const fel = [];
      const scan = async label => {
        const r = await wp.evaluate(() => {
          const name = e => (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') || e.tagName.toLowerCase();
          const vis = e => { const b = e.getBoundingClientRect(), cs = getComputedStyle(e); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth; };
          const small = [], text = [];
          for (const e of document.querySelectorAll('button, a[href], input, select, summary, [role=button], [role=tab]')) {
            if (!vis(e) || e.closest('[hidden]') || e.matches('.glabel, .gcluster, .gorigin, .tff') || e.closest('.glabel, .gcluster, .gorigin')) continue;
            const b = e.getBoundingClientRect();
            let w = b.width, h = b.height;
            for (const pe of ['::before', '::after']) {
              const ps = getComputedStyle(e, pe);
              if (ps.content !== 'none' && ps.position === 'absolute') { w = Math.max(w, parseFloat(ps.width) || 0); h = Math.max(h, parseFloat(ps.height) || 0); }
            }
            if (w < 43.5 || h < 43.5) small.push(`${name(e)} ${Math.round(w)}×${Math.round(h)}`);
          }
          const seen = new Set();
          for (const e of document.querySelectorAll('body *')) {
            if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || !vis(e) || e.closest('.glabel, .gcluster, .gorigin')) continue;
            const fs = parseFloat(getComputedStyle(e).fontSize);
            const k = `${name(e)} ${fs}px`;
            if (fs < 12 && !seen.has(k)) { seen.add(k); text.push(k); }
          }
          return { small, text };
        });
        if (r.small.length) fel.push(`${label}: träffyta under 44 px: ${r.small.slice(0, 6).join(', ')}`);
        if (r.text.length) fel.push(`${label}: text under 12 px: ${r.text.slice(0, 6).join(', ')}`);
      };
      await scan('start');
      await wp.click('#btn-panel'); await wp.waitForSelector('#panel', { state: 'visible', timeout: T.step });
      await scan('Samtidigt');
      await wp.keyboard.press('Escape');
      const closed = [];
      for (const [label, btn, menu] of [['Lager', '#btn-layers', '#layer-menu'], ['Sök och följ', '#btn-focus', '#focus-menu'], ['Turer', '#btn-tour', '#tour-menu']]) {
        if (!(await wp.locator('#more-toggle[aria-expanded="true"]').count())) await wp.click('#more-toggle');
        if (!(await wp.locator(btn).isVisible())) continue; // Turer saknas om inga turer är laddade
        await wp.click(btn);
        await wp.waitForSelector(`${menu}:not([hidden])`, { timeout: T.step });
        await scan(label);
        const x = wp.locator(`${menu} .menu-x`);
        if (!(await x.isVisible())) { fel.push(`${label}: ingen synlig stängknapp`); await wp.keyboard.press('Escape'); continue; }
        const box = await x.boundingBox();
        if (box.width < 43.5 || box.height < 43.5) fel.push(`${label}: stängknappen är ${Math.round(box.width)}×${Math.round(box.height)}`);
        await x.click();
        await wp.waitForSelector(`${menu}[hidden]`, { state: 'attached', timeout: T.step }).catch(() => fel.push(`${label}: menyn stängs inte av stängknappen`));
        closed.push(label);
      }
      if (errs.length) fel.push(`sidfel: ${errs[0]}`);
      if (fel.length) throw new Error(fel.join('; '));
      return `inga mindre ytor eller texter i fem lägen; stängknapp i ${closed.join(', ')}`;
    } finally { await wp.close(); }
  });
  // #1134: raden under årtalet radbryts i smal skärm i stället för att klippas med ellips. Längsta texten styr: alla
  // fem språk, ett f.Kr.-år (längst rubrik) och ett intervall, i 400 px bredd. Körs i mobiljobbet (en egen sida, egen bredd).
  await check('raden under årtalet ryms på 400 px på fem språk (#1134)', async () => {
    if (vp.width > 760) return 'körs i mobiljobbet';
    const sp = await context.newPage();
    const errs = [];
    sp.on('pageerror', e => errs.push(e.message));
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await sp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await sp.route(u => isFont(u.href), r => r.abort());
      }
      await sp.setViewportSize({ width: 400, height: 800 });
      let loads = 0;
      const out = [];
      for (const lang of ['sv', 'en', 'de', 'es', 'fr']) {
        for (const hash of ['#y=1900', '#y=-2600']) {
          await sp.goto(`${BASE}?lang=${lang}&ny=s${loads++}${hash}`);
          await sp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
          const m = await sp.evaluate(() => {
            const e = document.getElementById('year-segment');
            const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
            return { text: e.textContent.trim(), sw: e.scrollWidth, cw: e.clientWidth, h: r.height, line: parseFloat(cs.lineHeight), left: r.left, right: r.right,
              clipped: cs.textOverflow === 'ellipsis' && cs.whiteSpace === 'nowrap', page: document.documentElement.scrollWidth, width: innerWidth };
          });
          if (!m.text) throw new Error(`${lang} ${hash}: raden är tom`);
          if (m.sw > m.cw || m.clipped) throw new Error(`${lang} ${hash}: raden klipps (scrollWidth ${m.sw} > clientWidth ${m.cw}): "${m.text}"`);
          if (m.left < 0 || m.right > m.width || m.page > m.width) throw new Error(`${lang} ${hash}: raden går utanför skärmen eller sidan scrollar sidled: ${JSON.stringify(m)}`);
          if (m.h > m.line * 3 + 1) throw new Error(`${lang} ${hash}: raden tar mer än tre rader (${Math.round(m.h)} px): "${m.text}"`);
          out.push(`${lang}${hash}: ${Math.round(m.h / m.line)} rader`);
        }
      }
      // Intervallet har en kort rad men ska också ryms
      await sp.goto(`${BASE}?ny=s${loads++}#y=1900&y2=1950`);
      await sp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      const r = await sp.evaluate(() => { const e = document.getElementById('year-segment'); return { sw: e.scrollWidth, cw: e.clientWidth }; });
      if (r.sw > r.cw) throw new Error(`intervallet: raden klipps (${r.sw} > ${r.cw})`);
      if (errs.length) throw new Error(`sidfel: ${errs[0]}`);
      return out.join(', ');
    } finally { await sp.close(); }
  });
  // #1138: tillgänglighet. Mäts i den bredd jobbet kör (400 × 800 eller 1400 × 900) på en egen sida med ren lagring.
  await check('tillgänglighet: namn, fokus, träffytor, aria-invalid och tipset (#1138)', async () => {
    const ap = await context.newPage();
    const errs = [];
    ap.on('pageerror', e => { if (!cancelled(e.message)) errs.push(e.message); });
    const notes = [];
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await ap.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await ap.route(u => isFont(u.href), r => r.abort());
      }
      await ap.goto(`${BASE}?ny=a11y#y=-2600`);
      await ap.evaluate(() => { try { localStorage.removeItem('hg-year-tip'); } catch { /* */ } });
      await ap.goto(`${BASE}?ny=a11y2#y=-2600`);
      await ap.reload();
      await ap.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      // 5. Tipset överlappar inte teckenförklaringen: antingen står det under raden eller så är raden dold medan tipset visas (smal skärm)
      await ap.waitForSelector('#year-tip:not([hidden])', { timeout: T.step });
      const tip = await ap.evaluate(() => {
        const legend = document.getElementById('timeline-legend'), a = legend.getBoundingClientRect();
        const text = document.querySelector('#year-tip span').getBoundingClientRect();
        const items = [...legend.children].map(c => c.getBoundingClientRect());
        const right = Math.max(...items.map(r => r.right)), left = Math.min(...items.map(r => r.left));
        const vertical = text.top < a.bottom && text.bottom > a.top, horizontal = text.left < right && text.right > left;
        return { overlap: vertical && horizontal, hidden: getComputedStyle(legend).visibility === 'hidden', text: [text.left, text.right], legend: [left, right] };
      });
      if (vp.width <= 760 && !tip.hidden) throw new Error('teckenförklaringen är kvar under engångstipset i smal skärm');
      if (tip.overlap && !tip.hidden) throw new Error(`tipset överlappar teckenförklaringen: ${JSON.stringify(tip)}`);
      // 4. Träffytor: teckenförklaringens knapp har en osynlig yta (::before) på minst 24 px höjd, och fokusramen klipps inte uppåt eller nedåt
      const hit = await ap.evaluate(() => {
        const legend = document.getElementById('timeline-legend'), summary = legend.querySelector('summary');
        const cs = getComputedStyle(summary, '::before'), ls = getComputedStyle(legend);
        return { w: parseFloat(cs.width), h: parseFloat(cs.height), overflowY: ls.overflowY, overflowX: ls.overflowX };
      });
      if (hit.w < 23.5 || hit.h < 23.5) throw new Error(`teckenförklaringens träffyta är ${Math.round(hit.w)} × ${Math.round(hit.h)} px`);
      if (hit.overflowY !== 'visible') throw new Error(`teckenförklaringen klipper fokusramen i höjd (overflow-y: ${hit.overflowY})`);
      notes.push(`teckenförklaringens träffyta ${Math.round(hit.w)}×${Math.round(hit.h)}`);
      // 1 och 6. Intervallformuläret: f.Kr.-knappens namn innehåller det synliga ordet, och fel ger aria-invalid
      await ap.click('#year-jump');
      await ap.waitForSelector('#jump-pop:not([hidden])', { timeout: T.step });
      // 6. Årshoppet
      await ap.fill('#jump-input', 'abc');
      await ap.press('#jump-input', 'Enter');
      await ap.waitForFunction(() => document.getElementById('jump-input').getAttribute('aria-invalid') === 'true' && document.getElementById('jump-msg').textContent.trim(), null, { timeout: T.step });
      await ap.fill('#jump-input', '19');
      if (await ap.getAttribute('#jump-input', 'aria-invalid') !== null) throw new Error('årshoppets aria-invalid står kvar efter ändring');
      await ap.click('#range-open');
      await ap.waitForSelector('#range-pop:not([hidden])', { timeout: T.step });
      const names = await ap.evaluate(() => [...document.querySelectorAll('#range-pop .jump-era-btn')].map(b => ({ text: b.textContent.trim(), name: b.getAttribute('aria-label') })));
      if (names.length !== 2 || names.some(n => !n.name || !n.name.includes(n.text))) throw new Error(`f.Kr.-knappens namn saknar det synliga ordet: ${JSON.stringify(names)}`);
      await ap.fill('#range-from', 'abc');
      await ap.press('#range-from', 'Enter');
      await ap.waitForFunction(() => document.getElementById('range-from').getAttribute('aria-invalid') === 'true', null, { timeout: T.step });
      if (await ap.getAttribute('#range-to', 'aria-invalid') !== null) throw new Error('Till markerades som fel fast bara Från är ogiltigt');
      await ap.fill('#range-from', '1914');
      await ap.fill('#range-to', '1914');
      await ap.press('#range-to', 'Enter');
      await ap.waitForFunction(() => document.getElementById('range-from').getAttribute('aria-invalid') === 'true' && document.getElementById('range-to').getAttribute('aria-invalid') === 'true', null, { timeout: T.step });
      await ap.fill('#range-to', '1918');
      if (await ap.getAttribute('#range-from', 'aria-invalid') !== null || await ap.getAttribute('#range-to', 'aria-invalid') !== null) throw new Error('intervallets aria-invalid står kvar efter ändring');
      await ap.press('#range-to', 'Escape');
      await ap.waitForSelector('#range-pop', { state: 'hidden', timeout: T.step });
      // 2 och 3. Faktarutan: ingen aria-live på kortet, rubriken går till statusraden, fokus går till Stäng och tillbaka till samma knapp
      if (await ap.getAttribute('#detail', 'aria-live') !== null) throw new Error('#detail har kvar aria-live');
      await ap.waitForSelector('#funfact .ff-chip', { state: 'visible', timeout: T.step });
      const chipId = await ap.evaluate(() => document.querySelector('#funfact .ff-chip').dataset.id);
      await ap.focus('#funfact .ff-chip');
      await ap.keyboard.press('Enter');
      await ap.waitForSelector('#detail:not([hidden])', { timeout: T.step });
      await ap.waitForFunction(() => document.activeElement?.hasAttribute('data-close') && document.getElementById('detail').contains(document.activeElement), null, { timeout: T.step });
      // Rubriken ska stå kvar på statusraden även när Samtidigt-kortet och pausraden ritas om i samma stund (#1419): vänta på rubriken
      // och läs sedan igen efter en kort stund, så att något som skriver över den fångas
      const saidNow = () => ap.evaluate(() => ({ status: document.getElementById('screen-reader-status').textContent, title: document.querySelector('#detail h3')?.textContent.trim() }));
      await ap.waitForFunction(() => { const t = document.querySelector('#detail h3')?.textContent.trim(); return !!t && document.getElementById('screen-reader-status').textContent.includes(t); }, null, { timeout: T.step })
        .catch(async () => { const s = await saidNow(); throw new Error(`statusraden säger inte rubriken: "${s.status}" mot "${s.title}"`); });
      await ap.waitForTimeout(1500);
      const said = await saidNow();
      if (!said.title || !said.status.includes(said.title)) throw new Error(`statusraden tappade rubriken efter en stund: "${said.status}" mot "${said.title}"`);
      await ap.keyboard.press('Escape');
      await ap.waitForSelector('#detail', { state: 'hidden', timeout: T.step });
      await ap.waitForFunction(id => document.activeElement?.classList.contains('ff-chip') && document.activeElement.dataset.id === id, chipId, { timeout: T.step })
        .catch(async () => { throw new Error(`fokus kom inte tillbaka till Samtidigt-kortets knapp: ${await ap.evaluate(() => `${document.activeElement?.tagName}.${document.activeElement?.className}`)}`); });
      // Kortet läses inte upp igen när rutan stängs: statusraden är oförändrad
      const after = await ap.evaluate(() => document.getElementById('screen-reader-status').textContent);
      if (after !== said.status) throw new Error(`statusraden ändrades när faktarutan stängdes: "${after}" mot "${said.status}"`);
      if (errs.length) throw new Error(`sidfel: ${errs[0]}`);
      return notes.join('; ');
    } finally { await ap.close(); }
  });
  // #942: händelser som börjar före tidslinjens början (−2999) får en rad i faktarutan; en vanlig händelse får ingen.
  await check('händelser före tidslinjens början får en rad i faktarutan (#942)', async () => {
    const ap = await context.newPage();
    const errs = [];
    ap.on('pageerror', e => errs.push(e.message));
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await ap.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await ap.route(u => isFont(u.href), r => r.abort());
      }
      let loads = 0;
      const open = async (query, hash = '') => {
        await ap.goto(`${BASE}?ny=9${loads++}${hash}`);
        await ap.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        if (await ap.isHidden('#focus-menu')) {
          if (await ap.isHidden('#btn-focus') && await ap.isVisible('#more-toggle')) await ap.click('#more-toggle');
          await ap.click('#btn-focus');
        }
        await ap.waitForSelector('#focus-menu', { state: 'visible', timeout: T.step });
        await ap.click('#focus-menu [data-tab="Alla"]');
        await ap.fill('#focus-menu .focus-search', query);
        await ap.waitForSelector('#focus-menu [data-key^="event:"]', { timeout: T.step });
        await ap.press('#focus-menu .focus-search', 'Enter');
        await ap.waitForSelector('#detail:not([hidden])', { state: 'visible', timeout: T.step });
        if (await ap.evaluate(() => document.getElementById('detail').dataset.sheet === 'half')) { await ap.focus('#detail-handle'); await ap.keyboard.press('ArrowUp'); }
      };
      const note = () => ap.evaluate(() => {
        const n = document.querySelector('#detail .scale-note');
        const close = document.querySelector('#detail .detail-close');
        const r = n?.getBoundingClientRect(), c = close?.getBoundingClientRect();
        return { text: n?.textContent.trim() ?? '', shown: !!n && n.getClientRects().length > 0,
          overlapsClose: !!(r && c && r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top),
          wide: document.scrollingElement.scrollWidth > innerWidth + 1 };
      });
      const names = { kilskriften: 'kilskrift i Uruk', 'gobekli-tepe': 'Göbekli Tepe', stonehenge: 'Stonehenge', 'egypten-enas': 'Egypten enas', 'jordbrukets-borjan': 'Jordbruket börjar' };
      for (const [id, q] of Object.entries(names)) {
        await open(q);
        const got = await note();
        // Sedan förhistorien fick ett eget segment (#1088) ligger de fem på tidslinjen och har ingen rad
        if (got.shown) throw new Error(`${id}: ligger på tidslinjen sedan #1088 men har raden ("${got.text}")`);
        if (got.wide) throw new Error(`${id}: faktarutan ger horisontell scroll`);
      }
      await open('Eiffeltornet');
      if ((await note()).shown) throw new Error('en vanlig händelse (Eiffeltornet) har fått raden');
      if (errs.length) throw new Error(`sidfel: ${errs.join('; ')}`);
    } finally {
      await ap.close();
    }
    return 'kilskriften, Göbekli Tepe, Stonehenge, Egypten enas och jordbrukets början ligger på tidslinjen sedan #1088 och har ingen rad; Eiffeltornet har ingen';
  });
  // #879: går källregistret inte att ladda skrivs inga blad med tekniska källid ut; ett besked visas och en ny tryckning
  // försöker igen. Källfilen svarar 503 första gången och sedan som vanligt.
  await check('utskriften väntar på källregistret och visar besked när det inte laddas (#879)', async () => {
    const pp = await context.newPage();
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await pp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await pp.route(u => isFont(u.href), r => r.abort());
      }
      let failing = true;
      await pp.route(u => /data\/sources\.json/.test(u.href), r => (failing ? r.fulfill({ status: 503, body: 'fel' }) : r.continue()));
      await pp.goto(`${BASE}?ny=21#t=andra-varldskriget`);
      await pp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await pp.waitForSelector('#tour-print', { state: 'visible', timeout: T.step });
      await pp.evaluate(() => { window.__prints = 0; window.print = () => { window.__prints++; }; });
      await pp.click('#tour-print');
      await pp.waitForSelector('#tour-print-status', { state: 'visible', timeout: T.step });
      if (!/gick inte att ladda/.test(await pp.textContent('#tour-print-status'))) throw new Error('beskedet säger inte att källorna inte gick att ladda');
      const failed = await pp.evaluate(() => ({ prints: window.__prints, pages: document.querySelectorAll('#print-sheet .print-page').length }));
      if (failed.prints || failed.pages) throw new Error(`blad skrevs ut utan källregistret (${failed.prints} utskrifter, ${failed.pages} blad)`);
      failing = false;
      await pp.click('#tour-print');
      await pp.waitForFunction(() => window.__prints === 1, null, { timeout: T.step });
      const ok = await pp.evaluate(() => ({
        hidden: document.getElementById('tour-print-status').hidden,
        titles: [...document.querySelectorAll('#print-sheet .print-src-title')].map(e => e.textContent.trim()),
      }));
      if (!ok.hidden) throw new Error('beskedet stod kvar efter ett lyckat nytt försök');
      if (!ok.titles.length || ok.titles.some(x => /^[a-z0-9-]+$/.test(x))) throw new Error(`bladen har källor utan titel: ${ok.titles.join(', ')}`);
    } finally {
      await pp.close();
    }
    return 'källfilen 503: inget skrivs ut och beskedet visas; nytt försök skriver ut med källtitlar';
  });
  if (vp.name === 'dator') {
    // Mätningarna i utskriftsvyn (#757): körs i sidan med print-media påslaget
    const printAudit = () => {
      const root = document.getElementById('print-sheet');
      const heads = [...root.querySelectorAll('h1, h2, h3, h4')];
      const levels = heads.map(h => Number(h.tagName[1]));
      const h1s = heads.filter(h => h.tagName === 'H1').map(h => h.textContent.trim());
      const texts = [...root.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim());
      const css = (e, p) => getComputedStyle(e).getPropertyValue(p);
      const avoid = ['.print-questions > li', '.print-exit', '.print-sources li'].flatMap(s => [...root.querySelectorAll(s)]);
      return {
        h1: h1s.length,
        h1Same: new Set(h1s).size !== h1s.length,
        skippedHeading: levels.some((l, i) => l > (levels[i - 1] ?? 0) + 1),
        unlabelled: [...root.querySelectorAll('.print-page')].filter(s => !document.getElementById(s.getAttribute('aria-labelledby') ?? '')?.textContent.trim()).length,
        visibleLines: [...root.querySelectorAll('.print-lines, .print-blank')].filter(e => e.getAttribute('aria-hidden') !== 'true').length,
        colors: [...new Set(texts.map(e => `${css(e, 'color')} på ${css(e, 'background-color')}`))],
        smallest: Math.min(...texts.map(e => parseFloat(css(e, 'font-size')) * 0.75)),
        markers: [...root.querySelectorAll('.print-questions, .print-questions-short')].filter(l => css(l, 'list-style-type') !== 'none').length,
        splits: avoid.filter(e => !/avoid/.test(css(e, 'break-inside'))).length + heads.filter(h => h.tagName === 'H2' && !/avoid/.test(css(h, 'break-after'))).length,
        wide: [...root.querySelectorAll('*')].filter(e => e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1).length,
        urls: root.querySelectorAll('.print-src-url, .print-link').length,
        // Bladens höjd och papperets bredd mäts i A4:s tryckbara bredd (se testet nedan)
        heights: [...root.querySelectorAll('.print-page')].map(s => Math.ceil(s.getBoundingClientRect().height)),
        paperWidth: document.documentElement.scrollWidth,
      };
    };
    // Utskrift av en lektionstur (#738): knappen bara i en tur med lärarfält, och i utskrift syns bara elevbladet
    // och lärarbladet. Webbläsarens utskriftsdialog ersätts, så att testet inte väntar på den.
    await check('en lektionstur skriver ut elevblad och lärarblad (#738)', async () => {
      const printPage = await context.newPage();
      const printErrors = [];
      printPage.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url)) pushConsole(printErrors, m); });
      printPage.on('pageerror', e => printErrors.push(e.message));
      try {
        if (THREE_LOCAL) {
          const body = fs.readFileSync(THREE_LOCAL, 'utf8');
          await printPage.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
          await printPage.route(u => isFont(u.href), r => r.abort());
        }
        await printPage.goto(`${BASE}#t=tre-platser-1325`);
        await printPage.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        await printPage.waitForSelector('#tour-card', { state: 'visible', timeout: T.step });
        if (await printPage.isVisible('#tour-print')) throw new Error('en tur utan lärarfält har knappen Skriv ut');
        await printPage.goto(`${BASE}?ny=1#t=andra-varldskriget`);
        await printPage.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
        await printPage.waitForSelector('#tour-print', { state: 'visible', timeout: T.step });
        await printPage.evaluate(() => { window.print = () => { window.__printed = true; }; });
        await printPage.click('#tour-print');
        await printPage.waitForFunction(() => window.__printed, null, { timeout: T.step });
        await printPage.emulateMedia({ media: 'print' });
        const got = await printPage.evaluate(() => ({
          pages: document.querySelectorAll('#print-sheet .print-page').length,
          questions: document.querySelectorAll('#print-sheet .print-student .print-questions > li').length,
          detective: document.querySelectorAll('#print-sheet .print-detective .print-detective-case').length,
          detectiveHeading: document.querySelector('#print-sheet .print-detective h1')?.textContent.trim() ?? '',
          sheet: getComputedStyle(document.getElementById('print-sheet')).display,
          app: getComputedStyle(document.getElementById('app')).display,
          link: document.querySelector('#print-sheet .print-link')?.textContent ?? '',
          teacher: document.querySelector('#print-sheet .print-teacher')?.textContent ?? '',
        }));
        // Mätningen görs i A4:s tryckbara yta, 210 mm minus marginalerna 2 × 15 mm = 180 mm = 680 px bred och
        // 297 mm minus 2 × 11 mm = 275 mm = 1039 px hög, så att ett blad som är för brett eller för högt larmar innan det
        // spiller över, och svaret blir detsamma på alla maskiner (ett fönster på 1400 px skulle inte hitta något)
        const A4_WIDTH = 680;
        const A4_HEIGHT = 1039;
        const viewport = printPage.viewportSize();
        await printPage.setViewportSize({ width: A4_WIDTH, height: viewport?.height ?? 900 });
        // Höjden mäts först när webbtypsnitten har laddats, annars mäts reservtypsnittet (#757)
        await printPage.evaluate(() => document.fonts.ready);
        Object.assign(got, await printPage.evaluate(printAudit));
        if (viewport) await printPage.setViewportSize(viewport);
        // Sidbrytning: hela bladen ryms på ett A4 var (Chromium kan skriva PDF; Firefox och WebKit kan inte)
        const pdfPages = BROWSER === 'chromium'
          ? (await printPage.pdf({ format: 'A4', preferCSSPageSize: true })).toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length ?? 0
          : got.pages;
        await printPage.emulateMedia({ media: 'screen' });
        // Utskriften (#757): läsordning och rubriker för hjälpmedel, svart på vitt utan färg, läsbar textstorlek och
        // sidbrytning som inte delar ett svarsfält
        if (got.h1 !== got.pages || got.skippedHeading) throw new Error(`rubrikerna är fel i utskriften: ${got.h1} h1 för ${got.pages} blad, hopp i nivåerna: ${got.skippedHeading}`);
        if (got.h1Same) throw new Error('två blad har samma rubrik');
        if (got.unlabelled) throw new Error(`${got.unlabelled} blad saknar märkning (aria-labelledby)`);
        if (got.visibleLines) throw new Error('skrivraderna syns för hjälpmedel i stället för att vara dekoration');
        if (got.colors.length !== 1) throw new Error(`utskriften har fler färger än svart på vitt: ${got.colors.join(' ')}`);
        if (got.smallest < 8) throw new Error(`minsta texten i utskriften är ${got.smallest.toFixed(1)} pt, minst 8 pt krävs`);
        if (got.markers) throw new Error('listornas siffror säger emot stegnumren på bladen');
        if (got.splits) throw new Error(`${got.splits} svarsfält eller grupper får delas av en sidbrytning`);
        if (got.wide) throw new Error(`${got.wide} element är bredare än utskriftsytan`);
        if (got.urls < 2) throw new Error('adresser står inte som text på bladen (papper går inte att klicka på)');
        if (got.paperWidth > A4_WIDTH) throw new Error(`utskriften är ${got.paperWidth} px bred, A4 rymmer ${A4_WIDTH} px`);
        // Minst 3 % luft: texten kan variera något med typsnitt och webbläsare
        const maxHeight = Math.floor(A4_HEIGHT * 0.97);
        if (got.heights.some(h => h > maxHeight)) throw new Error(`ett blad är ${Math.max(...got.heights)} px högt, högst ${maxHeight} px av A4:s ${A4_HEIGHT} px (${got.heights.join(', ')})`);
        if (pdfPages !== got.pages) throw new Error(`utskriften blev ${pdfPages} A4-sidor i stället för ett blad per sida (${got.pages} blad)`);
        if (got.pages !== 3) throw new Error(`${got.pages} blad i stället för elevblad, Källdetektiven och lärarblad`);
        if (!/^Källdetektiven /.test(got.detectiveHeading)) throw new Error(`Källdetektiv-bladets rubrik är "${got.detectiveHeading}"`);
        if (got.questions !== 5) throw new Error(`elevbladet har ${got.questions} frågor, turen har 5`);
        if (got.detective !== 2) throw new Error(`Källdetektiven har ${got.detective} händelser, lektionen har 2 (#742)`);
        if (got.sheet === 'none' || got.app !== 'none') throw new Error(`i utskrift: bladen ${got.sheet}, sidan ${got.app}`);
        if (!got.link.endsWith('#t=andra-varldskriget&m=lektion')) throw new Error(`lärarbladets länk är ${got.link}`);
        if (!/Lgr22/.test(got.teacher) || !/Skolverket/.test(got.teacher)) throw new Error('lärarbladet saknar kopplingen till Lgr22 med källa');
        if (printErrors.length) throw new Error(`utskriften gav konsolfel: ${printErrors.join('; ')}`);
      } finally {
        await printPage.close();
      }
      return 'ingen knapp utan lärarfält; tre blad (elevblad, Källdetektiven, lärarblad), fem frågor, bara bladen i utskrift, länk och Lgr22 med källa';
    });
    // Höjden på bladen (#757, #742): alla fem språken och båda lektionerna, med webbtypsnitten och med reservtypsnittet.
    // Engelska, tyska, spanska och franska är längre än svenska, och utan webbtypsnitten byts typsnittet mot ett bredare
    // (DejaVu Sans på Linux), så ett mått på svenska med webbtypsnitt säger inget om de andra fallen.
    await check('elevbladet och lärarbladet ryms på en A4-sida i alla språk, med och utan webbtypsnitt (#757)', async () => {
      const A4_WIDTH = 680;
      const A4_HEIGHT = 1039;
      const LANGS = ['sv', 'en', 'de', 'es', 'fr'];
      const TOURS = ['andra-varldskriget', 'vikingatiden-och-varlden'];
      // Firefox kan skriva familjenamnet med citattecken i document.fonts (#888): jämför utan dem
      const hasWebFont = fonts => fonts.some(f => f.replace(/"/g, '') === 'Instrument Sans');
      const measure = async (lang, tour, fallback) => {
        const pg = await context.newPage();
        try {
          if (THREE_LOCAL) {
            const body = fs.readFileSync(THREE_LOCAL, 'utf8');
            await pg.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
          }
          if (fallback) await pg.route(u => isFont(u.href), r => r.abort());
          await pg.goto(`${BASE}?ny=1&lang=${lang}#t=${tour}`);
          await pg.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
          await pg.waitForSelector('#tour-print', { state: 'visible', timeout: T.load });
          await pg.evaluate(() => { window.print = () => { window.__printed = true; }; });
          await pg.click('#tour-print');
          await pg.waitForFunction(() => window.__printed, null, { timeout: T.step });
          await pg.emulateMedia({ media: 'print' });
          // Reservtypsnittet är DejaVu Sans, så att mätningen blir densamma på alla maskiner (annars väljer
          // webbläsaren själv något bland systemets typsnitt)
          if (fallback) await pg.addStyleTag({ content: '@media print { #print-sheet, #print-sheet * { font-family: "DejaVu Sans", sans-serif !important; } }' });
          await pg.setViewportSize({ width: A4_WIDTH, height: 900 });
          await pg.evaluate(() => document.fonts.ready);
          const got = await pg.evaluate(() => ({
            lang: document.documentElement.lang,
            heights: [...document.querySelectorAll('#print-sheet .print-page')].map(s => Math.ceil(s.getBoundingClientRect().height)),
            h1: document.querySelectorAll('#print-sheet h1').length,
            webFonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family),
            allFonts: [...document.fonts].map(f => `${f.family}:${f.status}`).join(' '),
            bodyFont: getComputedStyle(document.querySelector('#print-sheet .print-q')).fontFamily,
          }));
          return got;
        } finally {
          await pg.close();
        }
      };
      const limit = { web: Math.floor(A4_HEIGHT * 0.97), fallback: A4_HEIGHT - 1 };
      const rows = [];
      for (const fallback of [false, true]) {
        // Utan nät (THREE_LOCAL) blockeras webbtypsnitten av den vanliga routen och går inte att mäta
        if (!fallback && THREE_LOCAL && !hasWebFont((await measure('sv', TOURS[0], false)).webFonts)) continue;
        for (const tour of TOURS) {
          // Andra världskriget är det längsta bladet och mäts på alla språk; vikingatiden är cirka 90 px lägre och
          // mäts på det längsta språket (tyska) med webbtypsnitt också på engelska, så att testet inte tar för lång tid
          const langs = tour === TOURS[0] ? LANGS : fallback ? ['de'] : ['en', 'de'];
          const results = [];
          for (const lang of langs) results.push(await measure(lang, tour, fallback));
          results.forEach((got, i) => {
            const lang = langs[i];
            if (got.lang !== lang) throw new Error(`språket blev ${got.lang} i stället för ${lang}`);
            const used = hasWebFont(got.webFonts);
            if (!fallback && !used) throw new Error(`${tour} ${lang}: webbtypsnitten laddades inte, så höjden mäter fel typsnitt (${got.bodyFont}; laddade enligt document.fonts: ${got.webFonts.join(', ') || 'inga'}; alla: ${got.allFonts})`);
            // WebKit skriver DejaVu Sans, sans-serif utan citattecken, Chromium med (#888): jämför utan dem
            if (fallback && (used || !got.bodyFont.replace(/"/g, '').startsWith('DejaVu Sans'))) throw new Error(`${tour} ${lang}: reservmätningen använder fel typsnitt (${got.bodyFont}, webbtypsnitt: ${used})`);
            const max = Math.max(...got.heights);
            const lim = limit[fallback ? 'fallback' : 'web'];
            // Andra världskriget har Källdetektiven (#742) och därmed tre blad, vikingatiden har två; varje blad har en h1
            const sheets = tour === TOURS[0] ? 3 : 2;
            if (got.heights.length !== sheets || got.h1 !== sheets) throw new Error(`${tour} ${lang}: ${got.heights.length} blad och ${got.h1} h1 i stället för ${sheets}`);
            if (max > lim) throw new Error(`${tour} ${lang} ${fallback ? 'med reservtypsnitt' : 'med webbtypsnitt'}: ett blad är ${max} px högt, högst ${lim} px av A4:s ${A4_HEIGHT} px (${got.heights.join(', ')})`);
            rows.push(`${fallback ? 'reserv' : 'web'} ${tour.slice(0, 4)} ${lang} ${got.heights.join('/')}`);
          });
        }
      }
      return `${rows.length} mätningar inom gränsen: ${rows.join('; ')}`;
    });
  }
  // Sök och följ (#651, tidigare Sök #570): en händelse öppnas på sitt år, ett rike börjar följas, och tomt resultat syns tydligt
  await check('Sök och följ hittar händelser och riken', async () => {
    if (await page.locator('#focus-bar').isVisible()) { await page.click('#focus-exit'); await hidden('#focus-bar'); }
    const openSearch = async () => {
      if (await page.isHidden('#focus-menu')) await clickView('#btn-focus');
      await visible('#focus-menu');
    };
    await openSearch();
    await page.click('#focus-menu [data-tab="Alla"]'); // en flik från ett tidigare test kan vara sparad
    await page.fill('#focus-menu .focus-search', 'pompeji');
    await page.waitForSelector('#focus-menu [data-key^="event:"]', { timeout: T.step });
    await page.press('#focus-menu .focus-search', 'Enter');
    await hidden('#focus-menu');
    await visible('#detail');
    const year = (await page.textContent('#year-big')).trim();
    if (year !== '79') throw new Error(`Pompeji öppnades på året ${year}, inte 79`);
    if (!/Pompeji/.test(await page.textContent('#detail'))) throw new Error('faktarutan visar inte Pompeji');
    await page.keyboard.press('Escape');
    await openSearch();
    await page.fill('#focus-menu .focus-search', 'bysantinska');
    await page.locator('#focus-menu [data-key]').first().click();
    await visible('#focus-bar');
    if (!/Rom/.test(await page.textContent('#focus-title'))) throw new Error('Bysantinska hittade inte Rom i Fokus');
    await page.click('#focus-exit');
    await hidden('#focus-bar');
    await openSearch();
    await page.fill('#focus-menu .focus-search', 'qxzvw');
    await page.waitForFunction(() => /Inget/.test(document.querySelector('#focus-menu .focus-body').textContent), null, { timeout: T.step });
    if (await page.locator('#focus-menu [data-key]').count()) throw new Error('nonsens gav träffar');
    await page.fill('#focus-menu .focus-search', '');
    await page.keyboard.press('Escape');
    await hidden('#focus-menu');
    if (await page.locator('#more-menu').isVisible() && await page.isVisible('#more-toggle')) await page.click('#more-toggle').catch(() => {});
    return 'Pompeji öppnas år 79; Bysantinska ger Rom i Fokus; nonsens ger "Inget …"; Escape stänger';
  });

  // Vanliga missuppfattningar (#838): faktarutan för en händelse med en missuppfattning visar påståendet, vad
  // källorna säger och källan, och ursprunget ligger i en hopfälld rad. En händelse utan missuppfattning får ingen ruta.
  await check('faktarutan visar vanlig missuppfattning med källa och hopfälld förklaring (#838)', async () => {
    if (await page.locator('#focus-bar').isVisible()) { await page.click('#focus-exit'); await hidden('#focus-bar'); }
    const openSearch = async () => {
      if (await page.isHidden('#focus-menu')) await clickView('#btn-focus');
      await visible('#focus-menu');
    };
    await openSearch();
    await page.click('#focus-menu [data-tab="Alla"]');
    await page.fill('#focus-menu .focus-search', 'machu picchu');
    await page.waitForSelector('#focus-menu [data-key^="event:"]', { timeout: T.step });
    await page.press('#focus-menu .focus-search', 'Enter');
    await hidden('#focus-menu');
    await visible('#detail');
    await page.waitForSelector('#detail .detail-myth', { timeout: T.step });
    const myth = page.locator('#detail .detail-myth').first();
    const text = (await myth.textContent()).replace(/\s+/g, ' ');
    if (!/Bingham/.test(text)) throw new Error(`missuppfattningen nämner inte Bingham: ${text.slice(0, 120)}`);
    if (!await myth.locator('a[href^="http"]').count()) throw new Error('missuppfattningen saknar källänk');
    if (await myth.locator('details.myth-origin').evaluate(d => d.open)) throw new Error('ursprunget ska vara hopfällt från början');
    await myth.locator('summary').click();
    if (!await myth.locator('details.myth-origin').evaluate(d => d.open)) throw new Error('raden Varifrån kom det? öppnades inte');
    await shot('3-missuppfattning-i-faktarutan');
    await page.keyboard.press('Escape');
    await openSearch();
    await page.fill('#focus-menu .focus-search', 'pompeji');
    await page.waitForSelector('#focus-menu [data-key^="event:"]', { timeout: T.step });
    await page.press('#focus-menu .focus-search', 'Enter');
    await hidden('#focus-menu');
    await visible('#detail');
    if (await page.locator('#detail .detail-myth').count()) throw new Error('Pompeji har ingen missuppfattning men fick en ruta');
    await page.keyboard.press('Escape');
    return 'Machu Picchu visar påstående, källa och hopfälld förklaring; Pompeji får ingen ruta';
  });

  // Missuppfattningsfilen går inte att ladda (#838, rättning efter granskningen av #858): filen efterfrågas högst en gång
  // (förut om och om igen, med växande konsolfel), faktarutan ritas ändå med sin egen källrad och får ingen missuppfattning.
  await check('faktarutan ritas med källrad när missuppfattningsfilen inte kan laddas (#838)', async () => {
    const blockedPage = await context.newPage();
    const msgs = [];
    let calls = 0;
    blockedPage.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !isFont(m.location()?.url)) msgs.push(m.text()); });
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await blockedPage.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
      }
      await blockedPage.route(u => isFont(u.href), r => r.abort());
      await blockedPage.route('**/missuppfattningar.json*', r => { calls++; r.abort(); });
      await blockedPage.goto(BASE);
      await blockedPage.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      if (await blockedPage.isHidden('#btn-focus') && await blockedPage.isVisible('#more-toggle')) await blockedPage.click('#more-toggle');
      await blockedPage.click('#btn-focus');
      await blockedPage.click('#focus-menu [data-tab="Alla"]');
      await blockedPage.fill('#focus-menu .focus-search', 'machu picchu');
      await blockedPage.waitForSelector('#focus-menu [data-key^="event:"]', { timeout: T.step });
      await blockedPage.press('#focus-menu .focus-search', 'Enter');
      await blockedPage.waitForSelector('#detail .src', { timeout: T.step });
      // Tid nog för upprepade omladdningar att visa sig (förut cirka två anrop i sekunden)
      await blockedPage.waitForTimeout(4000);
      if (calls !== 1) throw new Error(`missuppfattningsfilen efterfrågades ${calls} gånger, högst 1 tillåts`);
      if (await blockedPage.locator('#detail .detail-myth').count()) throw new Error('missuppfattningsruta visas trots att filen saknas');
      if (!await blockedPage.locator('#detail .src').count()) throw new Error('händelsens källrad saknas');
      const mine = msgs.filter(t => /issuppfattningarna/.test(t));
      if (mine.length > 1) throw new Error(`felet loggades ${mine.length} gånger: ${mine.join(' | ')}`);
      if (msgs.length > 2) throw new Error(`upprepade konsolmeddelanden: ${msgs.slice(0, 5).join(' | ')}`);
    } finally {
      await blockedPage.close();
    }
    return 'filen efterfrågas en gång, källraden syns, ingen missuppfattningsruta, felet loggas en gång';
  });

  // Sök och följ med bara tangentbordet (#708): Enter öppnar, sökrutan får fokus (dator), pil ner når listan,
  // Escape stänger och fokus går tillbaka till knappen som öppnade panelen (i mobil: Meny, som bär knappen)
  await check('Sök och följ med tangentbord: fokus in, pil ner, Escape och fokus tillbaka', async () => {
    if (await page.locator('#focus-bar').isVisible()) { await page.click('#focus-exit'); await hidden('#focus-bar'); }
    if (await page.isVisible('#detail')) await page.keyboard.press('Escape');
    const narrow = vp.width <= 760;
    if (narrow) {
      await page.click('#more-toggle');
      await visible('#btn-focus');
    }
    await page.locator('#btn-focus').focus();
    await page.keyboard.press('Enter');
    await visible('#focus-menu');
    if (await page.getAttribute('#btn-focus', 'aria-expanded') !== 'true') throw new Error('aria-expanded blir inte true på Sök och följ');
    const where = await page.evaluate(() => {
      const a = document.activeElement;
      return { inMenu: document.getElementById('focus-menu').contains(a), search: a?.classList.contains('focus-search') };
    });
    if (!where.inMenu) throw new Error('fokus flyttas inte in i Sök och följ');
    const fine = await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches);
    if (fine && !where.search) throw new Error('sökrutan får inte fokus när panelen öppnas med tangentbordet');
    // Pil ner från sökrutan når listan (en grupprubrik eller en träff)
    await page.locator('#focus-menu .focus-search').focus();
    await page.keyboard.press('ArrowDown');
    const inList = await page.evaluate(() => {
      const a = document.activeElement;
      return !!a && document.getElementById('focus-menu').contains(a) && !a.classList.contains('focus-search') && (a.hasAttribute('data-group') || a.hasAttribute('data-key'));
    });
    if (!inList) throw new Error('pil ner från sökrutan når inte listan');
    await page.keyboard.press('Escape');
    await hidden('#focus-menu');
    if (await page.getAttribute('#btn-focus', 'aria-expanded') !== 'false') throw new Error('aria-expanded blir inte false på Sök och följ');
    const back = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
    if (!(narrow ? ['btn-focus', 'more-toggle'] : ['btn-focus']).includes(back)) throw new Error(`Escape lämnar fokus på ${back}, inte på knappen som öppnade panelen`);
    if (narrow && await page.isVisible('#more-menu')) await page.click('#more-toggle').catch(() => {});
    return `Enter öppnar, ${fine ? 'sökrutan har fokus, ' : ''}pil ner når listan, Escape stänger och fokus går till ${back}`;
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
    // Kontrollen och osäkerheten skiljs åt med en kort förklaring som syns direkt i rutan (#786)
    const explain = page.locator('#detail .review-explain');
    await explain.waitFor({ state: 'visible', timeout: T.step });
    const explainText = (await explain.textContent()).trim();
    if (explainText.length < 15 || /^review\./.test(explainText)) throw new Error(`förklaringen under granskningsmärket saknas eller är en rå textnyckel: ${explainText}`);
    // Rubrik och datumrad före bilden (#605), platsen en gång (#607) och markeringen i datumraden (#606)
    const order = await page.evaluate(() => {
      const d = document.getElementById('detail');
      const pos = s => { const el = d.querySelector(s); return el ? [...d.querySelectorAll('*')].indexOf(el) : -1; };
      return { h3: pos('h3'), meta: pos('.meta'), fig: pos('.detail-fig'), places: d.querySelectorAll('.place-name').length };
    });
    if (order.h3 < 0 || order.meta < order.h3 || (order.fig >= 0 && order.fig < order.meta)) throw new Error(`rubrik och datumrad står inte före bilden: ${JSON.stringify(order)}`);
    if (order.places) throw new Error('platsen står två gånger i faktarutan');
    const mark = page.locator('#detail .meta [data-unc-mark]');
    if (!(await mark.count())) throw new Error('datumraden saknar markeringen för osäkerhet');
    await mark.first().click();
    if (await page.evaluate(() => document.activeElement?.id) !== 'detail-uncertainty') throw new Error('markeringen leder inte till raden Historisk osäkerhet');
    return text;
  });

  // #993: byts året medan Sök och följ är öppen ska raden "Det som pågår …" och listan följa det nya året
  await check('Sök och följ följer året när det byts medan menyn är öppen (#993)', async () => {
    await jumpTo(1916);
    await clickView('#btn-focus');
    await visible('#focus-menu');
    // Tidigare kontroller kan ha lämnat sökord, flik eller sortering kvar; raden "Det som pågår" visas bara i grundläget
    if (await page.locator('#focus-menu [data-clear]').count()) await page.click('#focus-menu [data-clear]');
    const note = () => page.locator('#focus-menu .layer-note.pad').first().textContent().then(s => s.replace(/\s+/g, ' '));
    if (!(await note()).includes('1916')) throw new Error(`raden nämner inte 1916: ${await note()}`);
    // Samma väg som tidslinjens stegknappar och adressen: året byts utan att menyn stängs
    await page.evaluate(() => { location.hash = '#y=-500'; });
    await page.waitForFunction(() => !document.getElementById('focus-menu').hidden && /501 f\.Kr\./.test(document.querySelector('#focus-menu .layer-note.pad')?.textContent ?? ''), null, { timeout: T.step })
      .catch(async () => { throw new Error(`raden följde inte året: ${await note()}`); });
    if ((await page.locator('#focus-menu [data-tab][aria-pressed="true"]').getAttribute('data-tab')) !== 'Alla') throw new Error('fliken ändrades när året byttes');
    const text = await note();
    await page.keyboard.press('Escape');
    await hidden('#focus-menu');
    return text;
  });

  // #991: sidan motsäger inte sig själv: år 1 heter "1 e.Kr." (inte "0") och listan slutar inte med två punkter
  await check('tidslinjen skriver 1 e.Kr. i stället för 0 och Samtidigt-raden får inte två punkter (#991)', async () => {
    const ticks = await page.evaluate(() => [...document.querySelectorAll('#ticks .tick, .ticks .tick')].map(x => x.textContent.trim()));
    if (ticks.includes('0')) throw new Error(`tidslinjen har en markering "0": ${ticks.join(', ')}`);
    if (!ticks.includes('1 e.Kr.')) throw new Error(`tidslinjen saknar "1 e.Kr.": ${ticks.join(', ')}`);
    await page.click('#year-jump');
    await visible('#jump-input');
    await page.fill('#jump-input', '2901 f.Kr.');
    await page.press('#jump-input', 'Enter');
    await hidden('#jump-pop');
    const sub = (await page.textContent('#panel-sub')).trim();
    if (/\.\./.test(sub)) throw new Error(`Samtidigt-raden har två punkter: ${sub}`);
    return sub;
  });

  // #937: raden "Hur vet vi det här?" under källistan: hopfälld, fyra frågor, länk till turen
  await check('faktarutan har raden "Hur vet vi det här?" med fyra svar och en länk till turen (#937)', async () => {
    // Egen uppställning: öppnar Cheopspyramidens faktaruta, så att kontrollen inte beror på vad en tidigare kontroll lämnade kvar
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
    const pyramid = page.locator('#event-list .event-btn', { hasText: 'Cheopspyramiden' });
    await pyramid.waitFor({ state: 'visible', timeout: T.step });
    await pyramid.click();
    const row = page.locator('#detail details.how-know');
    await row.waitFor({ state: 'visible', timeout: T.step });
    if (await row.evaluate(d => d.open)) throw new Error('raden är utfälld från början');
    const summary = row.locator('summary');
    const box = await summary.boundingBox();
    if (!box || box.height < 43) throw new Error(`träffytan är ${box?.height} px hög, minst 44 px krävs`);
    await summary.focus();
    await page.keyboard.press('Enter');
    if (!(await row.evaluate(d => d.open))) throw new Error('raden går inte att fälla ut med tangentbordet');
    const answers = await row.locator('dd').allTextContents();
    if ((await row.locator('dt').count()) !== 4 || answers.length !== 4) throw new Error(`raden har ${answers.length} svar, fyra väntades`);
    if (answers.some(a => !a.trim() || /^(how|review)\./.test(a.trim()))) throw new Error(`ett svar är tomt eller en rå textnyckel: ${answers.join(' | ')}`);
    if (!(await row.locator('dd a[href]').count())) throw new Error('svaret på "Vem säger det?" saknar länk till källan');
    const tour = row.locator('[data-tour="hur-vet-vi-det-har"]');
    await tour.click();
    await visible('#tour-card');
    await page.click('#tour-close');
    await hidden('#tour-card');
    return answers.join(' | ');
  });

  await check('ingen horisontell scroll efteråt', async () => {
    const w = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, body: document.body.scrollWidth, win: window.innerWidth }));
    if (Math.max(w.doc, w.body) > w.win) throw new Error(`sidan är ${Math.max(w.doc, w.body)} px bred i ett ${w.win} px fönster`);
    await shot('8-slut');
  });

  // #882: Nästa och ett språkbyte i samma ögonblick (före adressens fördröjda skrivning) ska behålla steget. Utan
  // address.flush() före omladdningen stod steget före Nästa kvar i adressen och turen började om på steg 1.
  await check('språkbyte direkt efter Nästa behåller steget i lektionen (#882)', async () => {
    const lp = await context.newPage();
    const errs = [];
    lp.on('pageerror', e => errs.push(e.message));
    try {
      if (THREE_LOCAL) {
        const body = fs.readFileSync(THREE_LOCAL, 'utf8');
        await lp.route(THREE_URL, r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
        await lp.route(u => isFont(u.href), r => r.abort());
      }
      await lp.goto(`${BASE}?ny=71#t=andra-varldskriget&m=lektion`);
      await lp.waitForSelector('#loading', { state: 'hidden', timeout: T.load });
      await lp.waitForSelector('#lesson-band', { state: 'visible', timeout: T.step });
      if (!/^Steg 1 av 14$/.test((await lp.textContent('#tour-progress')).trim())) throw new Error('lektionen började inte på steg 1');
      // Nästa och språkbytet i samma evaluate: adressens 700 ms-tick hinner inte skriva steget emellan
      await lp.evaluate(() => {
        window.__hgGammal = true;
        document.getElementById('tour-next').click();
        document.querySelector('#lang-menu [data-lang="en"]').click();
      });
      await lp.waitForFunction(() => {
        const l = document.getElementById('loading');
        return !window.__hgGammal && document.documentElement.lang === 'en' && !!l && (l.hidden || getComputedStyle(l).display === 'none')
          && document.querySelectorAll('#lang-menu [data-lang]').length > 1;
      }, null, { timeout: T.load });
      await lp.waitForSelector('#lesson-band', { state: 'visible', timeout: T.step });
      const got = await lp.evaluate(() => ({ progress: document.getElementById('tour-progress').textContent.trim(), hash: location.hash }));
      if (!/\b2 of 14\b/.test(got.progress)) throw new Error(`steget tappades: "${got.progress}" i stället för steg 2 (${got.hash})`);
      if (/[?&#]s=polen\b/.test(got.hash) || !/m=lektion/.test(got.hash)) throw new Error(`adressen efter omladdningen är fel: ${got.hash}`);
      if (errs.length) throw new Error(`sidfel: ${errs.join('; ')}`);
      return `Nästa och byte till engelska i samma ögonblick: omladdningen står på "${got.progress}" med läget kvar`;
    } finally {
      await lp.evaluate(() => { try { localStorage.setItem('hg-lang', 'sv'); } catch { /* ingen lagring */ } }).catch(() => {});
      await lp.close();
    }
  });

  // Språkbytet laddar om sidan även när adressen har en #-del (url-state.js, #501). Med location.assign() till
  // samma adress laddades sidan inte om: valet sparades men texterna stod kvar på svenska. Körs sist, eftersom
  // sidan laddas om, och återställer svenska efteråt.
  // Omladdningen bevisas med ett märke på den gamla sidan som ska vara borta (framenavigated räcker inte, eftersom
  // den också kommer när sidan skriver om #-delen, och load kan dröja i GitHub Actions när typsnitten hänger).
  // Efter omladdningen väntar testet tills sidan har startat och språkväljaren har sina språk; den kopplas in sist
  // i starten, och ett byte före det gör ingenting.
  await check('språkbytet laddar om sidan på det nya språket (#63)', async () => {
    if (!(await page.evaluate(() => location.hash))) throw new Error('adressen saknar #-del, så testet prövar inte felet');
    const ready = l => {
      const b = document.getElementById('btn-lang'), loading = document.getElementById('loading');
      return !window.__hgGammal && document.documentElement.lang === l && document.querySelectorAll('#lang-menu [data-lang]').length > 1
        && b?.dataset.lang === l
        && !!loading && (loading.hidden || getComputedStyle(loading).display === 'none');
    };
    const pick = async lang => {
      reloading = true;
      await page.evaluate(l => {
        window.__hgGammal = true;
        document.querySelector(`#lang-menu [data-lang="${l}"]`).click();
      }, lang);
      try {
        await page.waitForFunction(ready, lang, { timeout: T.load });
      } catch (err) {
        const st = await page.evaluate(() => ({
          gammal: !!window.__hgGammal, lang: document.documentElement.lang, stored: localStorage.getItem('hg-lang'),
          url: location.pathname + location.search + location.hash, nav: performance.getEntriesByType('navigation')[0]?.type,
        })).catch(e => ({ fel: e.message }));
        throw new Error(`sidan bytte inte till ${lang}: ${JSON.stringify(st)}`);
      } finally {
        reloading = false;
      }
    };
    await pick('en');
    const label = await page.evaluate(() => document.getElementById('btn-layers').textContent.trim());
    if (label === 'Lager') throw new Error('knappen Lager står kvar på svenska efter byte till engelska');
    await pick('sv');
    return `engelska: ${label}`;
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
  page.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url || '')) pushConsole(errors, m, t => `konsol: ${t}`); });
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
          // I smal skärm ligger Lager, Fokus och Kom igång i menyn Meny (#530); de prövas nedan via menyn
          const ids = innerWidth > 760 ? ['year-jump', 'btn-panel', 'btn-layers', 'btn-focus', 'btn-play', 'btn-speed', 'track']
            : ['year-jump', 'btn-panel', 'more-toggle', 'btn-play', 'btn-speed', 'track'];
          const outside = ids.filter(id => {
            const r = document.getElementById(id)?.getBoundingClientRect();
            return !r || r.width < 1 || r.height < 1 || r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight;
          });
          return { outside, scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth), width: innerWidth };
        });
        if (frame.outside.length) throw new Error(`kontroller utanför skärmen: ${frame.outside.join(', ')}`);
        if (frame.scroll > frame.width) throw new Error(`sidan är ${frame.scroll}px bred i en yta på ${frame.width}px`);

        // Tangentbord (#708): tidslinjen, årtalet, Meny/knapparna och Samtidigt nås med Tab och ligger då i bild
        // Tab börjar efter globen, så att fokus som blev kvar från förra zoomsteget inte avgör ordningen
        await page.locator('#globe-canvas').focus();
        const needed =new Set(z.width > 760
          ? ['year-jump', 'btn-panel', 'btn-layers', 'btn-focus', 'btn-play', 'track']
          : ['year-jump', 'btn-panel', 'more-toggle', 'btn-play', 'track']);
        const reached = new Set();
        const offscreen = new Set();
        for (let i = 0; i < 60 && reached.size < needed.size; i++) {
          await page.keyboard.press('Tab');
          const hit = await page.evaluate(() => {
            const a = document.activeElement;
            const r = a?.getBoundingClientRect();
            return a && a !== document.body ? { id: a.id, out: !r || r.width < 1 || r.left < 0 || r.right > innerWidth || r.bottom < 0 || r.top > innerHeight } : null;
          });
          if (hit?.id && needed.has(hit.id)) { reached.add(hit.id); if (hit.out) offscreen.add(hit.id); }
        }
        const missing = [...needed].filter(id => !reached.has(id));
        if (missing.length) throw new Error(`nås inte med Tab vid ${z.percent} %: ${missing.join(', ')}`);
        if (offscreen.size) throw new Error(`fokuserad kontroll utanför bild vid ${z.percent} %: ${[...offscreen].join(', ')}`);
        await page.evaluate(() => document.activeElement?.blur());

        await page.click('#btn-panel');
        const panelRoom =await page.locator('#event-list').evaluate(el => el.clientHeight);
        if (panelRoom < 1) throw new Error('Samtidigt-listan saknar rullbar yta');
        await page.keyboard.press('Escape');

        const openMenu = async () => { if (await page.isVisible('#more-toggle')) await page.click('#more-toggle'); };
        const openMore = async () => { await openMenu(); if (await page.isVisible('#btn-more')) await page.click('#btn-more'); };
        await openMenu();
        await page.click('#btn-layers');
        const layerRoom = await page.locator('#layer-menu').evaluate(el => ({ client: el.clientHeight, scroll: el.scrollHeight }));
        if (layerRoom.client < 1) throw new Error('Lager-menyn saknar rullbar yta');
        await page.keyboard.press('Escape');

        await openMenu();
        await page.click('#btn-focus');
        const focusRoom = await page.locator('#focus-menu .focus-body').evaluate(el => el.clientHeight);
        if (focusRoom < 1) throw new Error('Fokus-listan saknar rullbar yta');
        await page.keyboard.press('Escape');

        await openMore();
        await page.click('#btn-help');
        const help = page.locator('#help');
        const helpRoom = await help.evaluate(el => ({ client: el.clientHeight, scroll: el.scrollHeight, overflow: getComputedStyle(el).overflowY }));
        if (helpRoom.client < 1 || (helpRoom.scroll > helpRoom.client && helpRoom.overflow !== 'auto')) throw new Error('Hjälpen kan inte rullas');
        await page.locator('#help-feedback').scrollIntoViewIfNeeded();
        await page.click('#help-close');

        await openMore();
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
    page.on('console', m => { if (m.type() === 'error' && !isFont(m.location()?.url || '')) pushConsole(errors, m); });
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
// Ingen av webbläsarna har ett grafikkort i GitHub Actions. Chromium ritar WebGL med SwiftShader. Firefox hittar
// ingen GL-drivrutin i huvudlöst läge ("Exhausted GL driver options", #702), så i Actions körs det med fönster i
// Xvfb med Mesas mjukvarudrivrutin (HEADLESS=0, browser-test.yml). webgl.force-enabled hindrar att Firefox spärrar
// mjukvarudrivrutinen, och WebGL körs i samma process, eftersom GPU-processen inte startar utan grafikkort.
const LAUNCH = {
  chromium: { args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] },
  firefox: { firefoxUserPrefs: { 'webgl.force-enabled': true, 'webgl.disabled': false, 'webgl.out-of-process': false } },
  webkit: {},
};
const browser = await browserType.launch({ ...LAUNCH[BROWSER], headless: process.env.HEADLESS !== '0' });
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
  if (MED_AVSNITT && wanted('zoom och omflödning')) matched++; else skipped++;
  for (const r of MED_AVSNITT && wanted('zoom och omflödning') ? await runReflow(browser) : []) {
    if (!r.ok) failed++;
    console.log(`  ${r.ok ? 'OK  ' : 'FEL '} ${r.name}${r.note ? `: ${r.note}` : ''}${r.ms ? ` (${(r.ms / 1000).toFixed(1)} s)` : ''}`);
  }
  console.log('\nreducerad rörelse');
  if (MED_AVSNITT && wanted('reducerad rörelse')) matched++; else skipped++;
  for (const r of MED_AVSNITT && wanted('reducerad rörelse') ? await runReducedMotion(browser) : []) {
    if (!r.ok) failed++;
    console.log(`  ${r.ok ? 'OK  ' : 'FEL '} ${r.name}${r.note ? `: ${r.note}` : ''}`);
  }
  console.log('\npresentationsläge');
  if (MED_AVSNITT && wanted('presentationsläge')) matched++; else skipped++;
  for (const r of MED_AVSNITT && wanted('presentationsläge') ? await runPresentation(browser) : []) {
    if (!r.ok) failed++;
    console.log(`  ${r.ok ? 'OK  ' : 'FEL '} ${r.name}${r.note ? `: ${r.note}` : ''}${r.ms ? ` (${(r.ms / 1000).toFixed(1)} s)` : ''}`);
  }
} finally {
  await browser.close();
}
if (ENDAST.length || UTAN.length || BREDDER.length) {
  const urval = [ENDAST.length && `ENDAST="${ENDAST.join('|')}"`, UTAN.length && `UTAN="${UTAN.join('|')}"`, BREDDER.length && `BREDD="${BREDDER.join('|')}"`].filter(Boolean).join(' ');
  console.log(`\n${urval}: ${matched} kontroller och avsnitt kördes, ${skipped} hoppades över.`);
  if (!matched) { console.log('FEL Urvalet (ENDAST, UTAN, BREDD) matchade ingen kontroll. Kontrollera stavningen.'); failed++; }
}
console.log(`\n${failed ? `${failed} kontroller misslyckades` : 'Alla kontroller gick igenom'} på ${((Date.now() - t0) / 1000).toFixed(0)} s. Skärmbilder: ${OUT}`);
process.exit(failed ? 1 : 0);
