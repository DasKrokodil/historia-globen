import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const OUT = '/home/user/historia-globen/docs/ux-review/skisser';
const BASE = 'http://localhost:8765/?lang=sv';
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const only = process.argv[2];

async function open(vp, hash, mobile) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: !!mobile, hasTouch: !!mobile });
  await ctx.addInitScript(() => { try { localStorage.setItem('hg-calm', '1'); } catch {} });
  const page = await ctx.newPage();
  await page.goto(BASE + (hash || '')); await page.waitForTimeout(5500);
  return { ctx, page };
}
// Gemensamma hjälpare i sidan
const helpers = () => {
  window.mk = {
    freezeLabels(fn) {
      const L = document.getElementById('labels'); const c = L.cloneNode(true); c.id = 'labels-mock';
      c.style.pointerEvents = 'none'; L.style.display = 'none'; L.after(c);
      if (fn) for (const b of c.querySelectorAll('.glabel')) fn(b);
      return c;
    },
    note(html, css) { const d = document.createElement('div'); d.innerHTML = html; Object.assign(d.style, { position: 'fixed', zIndex: 9999, background: '#fff6b6', color: '#1a1a1a', font: '600 14px Instrument Sans, sans-serif', padding: '8px 12px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,.4)' }, css); document.body.appendChild(d); return d; },
    hide(...sels) { for (const s of sels) for (const e of document.querySelectorAll(s)) e.style.setProperty('display', 'none', 'important'); },
    text(sel, t) { const e = document.querySelector(sel); if (e) e.textContent = t; },
    eyebrow(t) { const p = document.querySelector('#funfact .ff-pre'); if (p) p.textContent = ''; mk.text('#ff-kind', t); },
    stamp(t) { mk.note(t, { left: '50%', top: '50%', transform: 'translate(-50%,-50%) rotate(-8deg)', background: 'transparent', boxShadow: 'none', color: 'rgba(255,100,100,.0)' }); },
  };
};
const direction = (year) => (b) => {
  // "· slut 1912" -> "· 4 år före (1912)", "· börjar 1942" -> "· om 3 år (1942)"
  for (const n of b.childNodes) if (n.nodeType === 3) {
    n.textContent = n.textContent.replace(/·\s*slut (\d+)/, (_, y) => `· ${year - y} år före (${y})`).replace(/·\s*börjar (\d+)/, (_, y) => `· om ${y - year} år (${y})`);
  }
};
const shots = {
  // ---------- UX-DESIGNERN ----------
  async 'D1-dator-forsta-vy'() {
    const { ctx, page } = await open({ width: 1400, height: 900 }, '#y=1325');
    await page.evaluate(helpers);
    await page.evaluate(() => {
      mk.hide('#ag-mode', '#ag-explore', '#btn-discovery', '#btn-intro', '#ff-pics', '.ff-foot', '#ff-events', '.tdot', '.tspan', '.troute');
      mk.text('#year-segment', 'VISAR 1325 OCH DET SOM HÄNDE 38 ÅR FÖRE ELLER EFTER');
      mk.eyebrow('OVÄNTAT SAMTIDIGT');
      const f = document.getElementById('funfact'); f.style.top = 'auto'; f.style.bottom = '120px';
      const more = document.createElement('button'); more.className = 'link-btn'; more.textContent = 'Visa bilder och källor ›'; more.style.marginTop = '8px'; document.getElementById('ff-text').after(more);
      mk.freezeLabels();
      // fönstret som band runt tummen
      const tr = document.getElementById('track'), th = document.getElementById('thumb');
      const band = document.createElement('div'); const px = 0.25 * tr.clientWidth / 800 * 38;
      Object.assign(band.style, { position: 'absolute', left: `calc(${th.style.left} - ${px}px)`, width: `${2 * px}px`, top: '2px', bottom: '2px', background: 'rgba(214,176,106,.35)', border: '1px solid #d6b06a', borderRadius: '4px', pointerEvents: 'none' });
      tr.appendChild(band);
      const r = th.getBoundingClientRect();
      mk.note('Dra här för att byta år ↓', { left: `${r.left - 300}px`, top: `${r.top - 50}px` });
      mk.note('◆ oväntat samband &nbsp; ▬ fönstret runt året', { left: '16px', top: '808px', background: '#1d2433', color: '#e9dcc0', font: '12px IBM Plex Mono, monospace', boxShadow: 'none' });
    });
    await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/D1-dator-forsta-vy.jpg`, type: 'jpeg', quality: 72 }); await ctx.close();
  },
  async 'D2-dator-folj-krig'() {
    const { ctx, page } = await open({ width: 1400, height: 900 }, '#y=1916');
    await page.evaluate(helpers);
    if (await page.isVisible('#more-toggle')) await page.click('#more-toggle');
    await page.click('#btn-focus'); await page.fill('#focus-menu .focus-search', 'första världskriget'); await page.waitForTimeout(600);
    await page.locator('#focus-menu .focus-item').first().click(); await page.waitForTimeout(4000);
    await page.evaluate(() => {
      mk.hide('#ag-mode', '#ag-explore', '#btn-discovery', '#btn-intro', '#war-play', '#next-pause', '.legend, #empire-legend, #religion-legend, [class*=war-legend]');
      const f = document.getElementById('funfact'); f.classList.add('ff-min'); f.style.setProperty('display', 'none', 'important');
      const tab = document.getElementById('ff-tab'); if (tab) { tab.hidden = false; tab.style.display = ''; }
      mk.text('#year-segment', 'FÖLJER FÖRSTA VÄRLDSKRIGET · VISAR 1916 ± 1 ÅR');
      const lbl = document.querySelector('#detail .story-label'); if (lbl) lbl.textContent = 'BAKGRUND';
      // en lägesrad
      const bar = document.getElementById('focus-bar');
      bar.innerHTML = '<span style="font:600 11px IBM Plex Mono,monospace;letter-spacing:.12em;color:#d6b06a">FÖLJER</span> <b style="font:20px IM Fell English,serif;margin:0 14px 0 8px">Första världskriget 1914–1918</b> <span style="font:12px IBM Plex Mono,monospace;opacity:.8;margin-right:14px">1916 · nästa stopp: USA går in i kriget (1917)</span> <button class="focus-play" style="background:#d6b06a;color:#1a1a1a;border:0;border-radius:20px;padding:7px 16px;font-weight:600">▶ Spela</button> <button style="margin-left:8px;background:transparent;color:#e9dcc0;border:1px solid #6b6250;border-radius:20px;padding:7px 16px">Avsluta</button>';
      document.querySelectorAll('.steps, #btn-speed').forEach(e => e.style.opacity = '.3');
      document.querySelectorAll('.step').forEach(e => e.style.opacity = '.3');
      mk.freezeLabels();
    });
    await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/D2-dator-folj-krig.jpg`, type: 'jpeg', quality: 72 }); await ctx.close();
  },
  async 'D3-mobil-forsta-vy'() {
    const { ctx, page } = await open({ width: 400, height: 800 }, '#y=1325', true);
    await page.evaluate(helpers);
    await page.evaluate(() => {
      const f = document.getElementById('funfact'); for (const s of ['half', 'full']) f.classList.remove(`ff-s-${s}`); f.classList.add('ff-s-closed');
      mk.hide('.tdot', '.tspan', '.troute');
      mk.text('#year-segment', 'VISAR 1325 OCH 38 ÅR FÖRE/EFTER');
      mk.eyebrow('OVÄNTAT SAMTIDIGT');
    });
    await page.waitForTimeout(800);
    await page.evaluate(() => { const r = document.getElementById('track').getBoundingClientRect(); mk.note('Dra här för att byta år', { left: '110px', top: `${r.top - 50}px` }); });
    await page.screenshot({ path: `${OUT}/D3-mobil-forsta-vy.jpg`, type: 'jpeg', quality: 72 }); await ctx.close();
  },
  // ---------- PEDAGOGEN ----------
  async 'L1-dator-samtidigt-grupperat'() {
    const { ctx, page } = await open({ width: 1400, height: 900 }, '#y=1325');
    await page.evaluate(helpers);
    await page.click('#btn-panel'); await page.waitForTimeout(800);
    await page.evaluate(async () => {
      const Y = 1325;
      const ev = await (await fetch('data/events.json')).json(); const list = Array.isArray(ev) ? ev : ev.events;
      const byId = Object.fromEntries(list.map(e => [e.id, e]));
      const items = [...document.querySelectorAll('#event-list .event-item')].map(li => ({ li, e: byId[li.querySelector('.event-btn').dataset.id] })).filter(x => x.e);
      const hande = [], pagick = [], nara = [];
      for (const x of items) { const { start, end } = x.e; if (start > Y || end < Y) nara.push(x); else if (end - start <= 10 || start === Y) hande.push(x); else pagick.push(x); }
      const sec = (title, arr, extra) => `<section class="region-group"><h3 class="region-head">${title} <span class="region-count">${arr.length}</span></h3><ol>${arr.map(x => { const li = x.li.cloneNode(true); li.classList.remove('is-near'); if (extra) { const m = li.querySelector('.meta'); m.textContent = extra(x.e) + ' · ' + m.textContent; } return li.outerHTML; }).join('')}</ol></section>`;
      const dir = e => e.start > Y ? `${e.start - Y} år senare` : `${Y - e.end} år tidigare`;
      document.getElementById('event-list').innerHTML = sec('Hände år 1325', hande) + sec('Strax före och efter', nara, dir) + sec('Pågick då (långa förlopp)', pagick);
      const sub = document.getElementById('panel-sub'); if (sub) sub.textContent = `${hande.length} hände år 1325, ${pagick.length} pågick då, ${nara.length} hände strax före eller efter (inom 38 år).`;
      mk.text('#year-segment', '1300-TALET · VISAR OCKSÅ DET SOM HÄNDE 38 ÅR FÖRE OCH EFTER');
      mk.eyebrow('SAMTIDIGT · 1324–1325');
      const q = document.createElement('div'); q.innerHTML = '<b>Hände något mer 1325?</b> Leta på globen, eller öppna listan till höger.'; Object.assign(q.style, { margin: '10px 0 4px', padding: '8px 10px', background: 'rgba(122,90,31,.12)', borderRadius: '8px', font: '14px Instrument Sans, sans-serif', color: '#3b2a10' });
      document.getElementById('ff-events').after(q);
      mk.hide('#ff-surprise');
      // tidslinjens skala
      for (const t of document.querySelectorAll('#ticks .tick')) if (t.textContent === '0') t.textContent = '1 e.Kr.';
      const segs = ['2 500 år', '1 500 år', '800 år', '226 år'];
      document.querySelectorAll('#track-segments .seg').forEach((s, i) => { s.style.position = 'relative'; const l = document.createElement('span'); l.textContent = segs[i]; Object.assign(l.style, { position: 'absolute', left: '50%', top: '-20px', transform: 'translateX(-50%)', font: '11px IBM Plex Mono, monospace', color: '#d6b06a', whiteSpace: 'nowrap', background: '#0e1420', padding: '0 6px' }); s.appendChild(l); s.style.borderRight = '2px solid #d6b06a'; });
      mk.hide('.tdot', '.tspan', '.troute', '.tff');
      mk.freezeLabels(b => { for (const n of b.childNodes) if (n.nodeType === 3) n.textContent = n.textContent.replace(/·\s*slut (\d+)/, (_, y) => `· ${Y - y} år före (${y})`).replace(/·\s*börjar (\d+)/, (_, y) => `· om ${y - Y} år (${y})`); });
    });
    await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/L1-dator-samtidigt-grupperat.jpg`, type: 'jpeg', quality: 72 }); await ctx.close();
  },
  async 'L2-dator-1916-riktning'() {
    const { ctx, page } = await open({ width: 1400, height: 900 }, '#y=1916');
    await page.evaluate(helpers);
    await page.evaluate(() => {
      const Y = 1916;
      mk.text('#year-segment', '1910-TALET · VISAR OCKSÅ DET SOM HÄNDE 11 ÅR FÖRE OCH EFTER');
      mk.eyebrow('NÄRA I TID · NÄR ETT KRIG BRÖT UT');
      mk.freezeLabels(b => { for (const n of b.childNodes) if (n.nodeType === 3) n.textContent = n.textContent.replace(/·\s*slut (\d+)/, (_, y) => `· ${Y - y} år före (${y})`).replace(/·\s*börjar (\d+)/, (_, y) => `· om ${y - Y} år (${y})`); });
      // pågående krig får etikett
      const area = document.querySelector('#labels-mock');
      const w = document.createElement('span'); w.className = 'glabel'; w.innerHTML = '<span class="dot" style="background:#e5675a"></span>Första världskriget · pågår (1914–1918)';
      Object.assign(w.style, { position: 'absolute', left: '0', top: '0', transform: 'translate(905px, 178px) translate(-50%, -100%)', opacity: 1 }); area.appendChild(w);
      for (const t of document.querySelectorAll('#ticks .tick')) if (t.textContent === '0') t.textContent = '1 e.Kr.';
    });
    await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/L2-dator-1916-riktning.jpg`, type: 'jpeg', quality: 72 }); await ctx.close();
  },
  async 'L3-dator-faktaruta-hur-vet-vi'() {
    const { ctx, page } = await open({ width: 1400, height: 900 }, '#y=1325');
    await page.evaluate(helpers);
    await page.click('#btn-panel'); await page.waitForTimeout(500); await page.click('.event-btn'); await page.waitForTimeout(1200);
    await page.click('#panel-close').catch(() => {}); await page.waitForTimeout(500);
    await page.evaluate(() => {
      const d = document.getElementById('detail');
      const fig = d.querySelector('figure, .fig, .detail-fig'); if (fig) fig.style.setProperty('display', 'none', 'important');
      d.querySelectorAll('img').forEach(i => i.closest('figure, div')?.style.setProperty('display', 'none', 'important'));
      const src = [...d.querySelectorAll('a')].find(a => /Wikipedia/.test(a.textContent))?.parentElement;
      if (src) src.innerHTML = '<b>Var kommer det här ifrån?</b> Engelska Wikipedia och Wikidata. Båda hör till Wikimedia. <a href="#">Ottoman Empire – Wikipedia (engelska)</a> · <a href="#">Wikidata Q12560</a><br><a href="#" style="font-weight:600">Hur vet vi det här? Så granskar du en källa ›</a>';
      d.querySelectorAll('.review-explain').forEach(e => e.style.setProperty('display', 'none', 'important'));
      const unc = [...d.querySelectorAll('b')].find(b => /Historisk osäkerhet/.test(b.textContent)); if (unc) unc.textContent = 'Säkert eller osäkert?';
      mk.text('#year-segment', '1300-TALET · VISAR OCKSÅ DET SOM HÄNDE 38 ÅR FÖRE OCH EFTER');
      const f = document.getElementById('funfact'); f.style.setProperty('display', 'none', 'important');
      mk.freezeLabels();
    });
    await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/L3-dator-faktaruta-hur-vet-vi.jpg`, type: 'jpeg', quality: 72 }); await ctx.close();
  },
  async 'L4-mobil-fraga-pa-kortet'() {
    const { ctx, page } = await open({ width: 400, height: 800 }, '#y=1325', true);
    await page.evaluate(helpers);
    await page.evaluate(() => {
      mk.hide('#ff-pics', '#ff-surprise');
      mk.text('#year-segment', '1300-TALET · OCKSÅ 38 ÅR FÖRE OCH EFTER');
      mk.eyebrow('SAMTIDIGT · 1324–1325');
      const q = document.createElement('div'); q.innerHTML = '<b>Hände något mer 1325?</b> Leta på globen.'; Object.assign(q.style, { margin: '8px 0 2px', padding: '8px 10px', background: 'rgba(122,90,31,.12)', borderRadius: '8px', font: '14px Instrument Sans, sans-serif', color: '#3b2a10' });
      document.getElementById('ff-text').after(q);
      mk.hide('#ff-events');
      for (const t of document.querySelectorAll('#ticks .tick')) if (t.textContent === '0') t.textContent = '1 e.Kr.';
    });
    await page.waitForTimeout(600); await page.screenshot({ path: `${OUT}/L4-mobil-fraga-pa-kortet.jpg`, type: 'jpeg', quality: 72 }); await ctx.close();
  },
};
for (const [n, f] of Object.entries(shots)) { if (only && !n.startsWith(only)) continue; try { await f(); console.log('ok', n); } catch (e) { console.log('FEL', n, e.message.split('\n')[0]); } }
await browser.close();
