// Språk i gränssnittet (#63, beslut 2026-11-05).
// Gränssnittets texter ligger i en fil per språk i data/ui/ (data skild från kod), och språken med vem som
// översatte och granskade står i data/ui/sprak.json. Datans texter (händelser, fun facts, riken) väljs med t()
// i model.js, med samma språk.
//
// Språket väljs i den här ordningen: ?lang= i adressen, det sparade valet (localStorage hg-lang), webbläsarens
// språk om det språket är markerat "auto" (bara färdiga översättningar väljs automatiskt, så att ingen hamnar i
// en halvfärdig översättning utan att ha valt den), annars svenska. Byte av språk laddar om sidan och behåller året (location.reload, eftersom adressens #-del annars stoppar omladdningen).
//
// Sidans fasta texter står på svenska i index.html. I ett annat språk byts de ut med attributen
// data-i18n="nyckel" (textinnehållet) och data-i18n-<attribut>="nyckel" (aria-label, title, placeholder,
// aria-roledescription). Saknas en nyckel i språket står svenskan kvar.

const BASE = 'sv';
const ATTRS = ['aria-label', 'title', 'placeholder', 'aria-roledescription'];

// Sökvägen räknas från den här filen (js/), så att det fungerar oavsett sidans adress. I node (testerna) läses
// filen från disk, eftersom fetch inte kan läsa file:-adresser där. I formulärets Cloudflare Pages Function
// (functions/api/feedback.js importerar model.js och därmed den här filen) finns varken fönster, node eller en
// giltig import.meta.url. Där får inget kasta fel, annars startar inte funktionen och hela publiceringen
// misslyckas; svenska används då.
async function getJSON(path) {
  try {
    const url = new URL(`../${path}`, import.meta.url);
    if (typeof window === 'undefined') {
      if (typeof process === 'undefined' || !process.versions?.node) return null;
      const fs = await import('node:fs/promises');
      return JSON.parse(await fs.readFile(url, 'utf8'));
    }
    const res = await fetch(url);
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

function storedLang() {
  if (typeof location === 'undefined') return null;
  try { return new URLSearchParams(location.search).get('lang') || localStorage.getItem('hg-lang'); } catch { return null; }
}

const META = (await getJSON('data/ui/sprak.json')) ?? { languages: [{ id: BASE, name: 'Svenska', auto: true, complete: true }] };
/** Språken i väljaren, i filens ordning. */
export const LANGUAGES = META.languages;
const known = id => LANGUAGES.some(l => l.id === id);

function chooseLang() {
  const chosen = storedLang();
  if (chosen && known(chosen)) return chosen;
  const nav = typeof navigator === 'undefined' ? {} : navigator;
  for (const tag of nav.languages ?? [nav.language]) {
    const id = String(tag || '').slice(0, 2).toLowerCase();
    if (LANGUAGES.some(l => l.id === id && l.auto)) return id;
  }
  return BASE;
}

/** Sidans språk: 'sv', 'en' … */
export const LANG = chooseLang();
/** Uppgifterna om språket (namn, om översättningen är färdig, vem som översatte och granskade). */
export const LANG_INFO = LANGUAGES.find(l => l.id === LANG) ?? LANGUAGES[0];

// Ordböckerna: valt språk, engelska och svenska som reserv (samma ordning som t() i model.js)
const ORDER = [...new Set([LANG, 'en', BASE])];
const DICTS = await Promise.all(ORDER.map(id => known(id) ? getJSON(`data/ui/${id}.json`) : null));

function lookup(key) {
  for (const d of DICTS) if (d && d[key] != null) return d[key];
  return null;
}
/** Har det valda språket en egen text för nyckeln (inte en reserv)? */
export const hasUi = key => DICTS[0]?.[key] != null;

/**
 * Gränssnittets text för en nyckel, på valt språk (annars engelska, sedan svenska). {namn} byts mot vars.namn.
 * En lista (till exempel månaderna) ges tillbaka som den är. Saknas nyckeln helt ges nyckeln, så att det syns.
 */
export function ui(key, vars) {
  const v = lookup(key);
  if (v == null) return key;
  if (typeof v !== 'string' || !vars) return v;
  return v.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));
}

/** Byter sidans fasta texter (index.html) till valt språk. Gör inget på svenska. */
export function applyStatic(root = document) {
  document.documentElement.lang = LANG;
  if (LANG === BASE) return;
  if (hasUi('meta.title')) document.title = ui('meta.title');
  const desc = document.querySelector('meta[name="description"]');
  if (desc && hasUi('meta.description')) desc.content = ui('meta.description');
  for (const el of root.querySelectorAll('[data-i18n]')) {
    const key = el.dataset.i18n;
    if (!hasUi(key)) continue;
    setText(el, ui(key));
  }
  for (const attr of ATTRS) {
    for (const el of root.querySelectorAll(`[data-i18n-${attr}]`)) {
      const key = el.getAttribute(`data-i18n-${attr}`);
      if (hasUi(key)) el.setAttribute(attr, ui(key));
    }
  }
}

// Byter den första texten i elementet och lämnar inre element (räknare, ikoner, länkar) orörda.
function setText(el, text) {
  const node = [...el.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
  if (!node) { if (!el.children.length) el.textContent = text; else el.prepend(text + ' '); return; }
  const lead = /^\s*/.exec(node.textContent)[0], trail = /\s*$/.exec(node.textContent)[0];
  node.textContent = lead + text + trail;
}

const YEAR_KEY = 'hg-lang-year';
/** Året som sidan hade innan språket byttes, en gång; annars null. */
export function takeReturnYear() {
  try {
    const v = sessionStorage.getItem(YEAR_KEY);
    sessionStorage.removeItem(YEAR_KEY);
    return v == null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v);
  } catch { return null; }
}

/**
 * Språkväljaren (#63, synlig i översta raden sedan #1167): en knapp med en jordglob och språkets kod (SV, EN …)
 * som öppnar en kort lista med språkens egna namn. Ofärdiga översättningar har märket "beta" i listan. Inga
 * flaggor: flaggor är länder, inte språk (beslut i #1167).
 * Byte sparar valet, kommer ihåg året och laddar om sidan (?lang= tas bort ur adressen, så att det sparade valet
 * gäller). beforeReload() anropas först och ska skriva vyn i adressen (address.flush, #882). onOpen() anropas när
 * listan öppnas, så att stängregistret (js/surfaces.js) kan stänga de andra menyerna. Returnerar { close }.
 */
export function setupLangPicker({ toggle, menu, getYear, beforeReload, onOpen }) {
  if (!toggle || !menu) return { close() {} };
  const wrap = toggle.parentElement;
  const code = toggle.querySelector('.lang-code');
  const label = ui('lang.label');
  if (code) code.textContent = LANG.toUpperCase();
  toggle.dataset.lang = LANG;
  toggle.setAttribute('aria-label', `${label}: ${LANG_INFO.name}`);
  toggle.title = label;
  menu.setAttribute('aria-label', label);
  const items = LANGUAGES.map(l => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-item';
    b.dataset.lang = l.id;
    b.lang = l.id;
    const name = document.createElement('span');
    name.textContent = l.name;
    b.append(name);
    if (!l.complete) {
      const beta = document.createElement('span');
      beta.className = 'lang-beta';
      beta.textContent = l.beta ?? 'beta';
      b.append(' ', beta);
    }
    if (l.id === LANG) b.setAttribute('aria-current', 'true');
    b.addEventListener('click', () => (l.id === LANG ? set(false, true) : choose(l.id)));
    li.append(b);
    return li;
  });
  menu.replaceChildren(...items);
  const buttons = () => [...menu.querySelectorAll('button')];

  const isOpen = () => !menu.hidden;
  function set(open, refocus = false) {
    if (open === isOpen()) return;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    wrap.classList.toggle('lang-open', open);
    if (open) {
      onOpen?.();
      (menu.querySelector('[aria-current="true"]') ?? buttons()[0])?.focus({ preventScroll: true });
    } else if (refocus) toggle.focus({ preventScroll: true });
  }
  toggle.addEventListener('click', () => set(!isOpen()));
  document.addEventListener('pointerdown', e => { if (isOpen() && !wrap.contains(e.target)) set(false); });
  wrap.addEventListener('focusout', e => { if (isOpen() && e.relatedTarget && !wrap.contains(e.relatedTarget)) set(false); });
  wrap.addEventListener('keydown', e => {
    if (!isOpen()) return;
    if (e.key === 'Escape') { e.stopPropagation(); set(false, true); return; }
    const list = buttons(), i = list.indexOf(document.activeElement);
    const to = e.key === 'ArrowDown' ? (i + 1) % list.length : e.key === 'ArrowUp' ? (i - 1 + list.length) % list.length
      : e.key === 'Home' ? 0 : e.key === 'End' ? list.length - 1 : -1;
    if (to >= 0 && list.length) { e.preventDefault(); list[to].focus(); }
  });

  function choose(id) {
    // Adressen skrivs färdig innan den läses nedan, annars tappar omladdningen steget i en tur eller lektion (#882)
    try { beforeReload?.(); } catch (err) { console.warn('Adressen kunde inte skrivas före språkbytet', err); }
    try {
      localStorage.setItem('hg-lang', id);
      const y = getYear?.();
      if (Number.isFinite(y)) sessionStorage.setItem(YEAR_KEY, String(y));
    } catch { /* utan lagring: bara adressen bär språket */ }
    const url = new URL(location.href);
    url.searchParams.delete('lang');
    let stored = false;
    try { stored = localStorage.getItem('hg-lang') === id; } catch { /* ingen lagring */ }
    if (!stored) url.searchParams.set('lang', id);
    // Adressen ändras på plats och sidan laddas om. location.assign() räcker inte: adressen har en #-del
    // (url-state.js, #501), och en adress som bara skiljer sig i #-delen, eller inte alls, laddar inte om sidan.
    history.replaceState(history.state, '', url.href);
    location.reload();
  }
  return { close: () => set(false) };
}
