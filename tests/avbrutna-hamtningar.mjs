// Avbrutna hämtningar under ett sidbyte i webbläsartestet (#1393, skärper beslutet 2026-11-08 om #888, punkt 2;
// docs/beslut/2026-11-13-webkit-avbrutna-hamtningar-och-releasekrav.md). Delas av tests/webblasare.mjs och
// tests/avbrutna-hamtningar.test.mjs, så att avgränsningen kan provas utan webbläsare. Ingen annan kod här: filen öppnar ingen webbläsare.
//
// WebKit skriver ett sidfel "… <adress> due to access control checks." när en hämtning avbryts för att sidan byts eller laddas om
// (Playwright delar WebKits rad vid första kolonet, så "Fetch API cannot load http://värd/a.json due to …" blir "/värd/a.json due to …").
// Ett sidfel räknas bort bara när alla fyra gäller:
//   1. det kom medan just den sidan bytte sida eller laddades om (nav, goto, reload, goBack, goForward runt anropet),
//   2. texten är exakt WebKits rad (WEBKIT_ABORT),
//   3. adressen hör till den egna webbplatsen (samma värd som BASE), och
//   4. samma adress också syns som en avbruten begäran (requestfailed med "cancelled", Chromium "net::ERR_ABORTED", eller WebKits
//      rad för just begärans egen adress, se nedan). Det fjärde avgörs i settle() när kontrollen är klar, eftersom ordningen mellan
//      händelserna varierar.
// Ett 404, ett fel utanför ett sidbyte och ett fel från en annan webbplats fäller fortfarande kontrollen.
//
// Konsolfel (#1561): Firefox (och WebKit) skriver en avbruten hämtning som ett konsolfel utan adress när sidans egen .catch loggar den:
// "TypeError: NetworkError when attempting to fetch resource." (Firefox), "TypeError: Load failed" (WebKit), "AbortError: …". Texten
// säger inte vilken adress det gällde, så villkoren är andra men lika snäva. Ett konsolfel räknas bort bara när alla tre gäller:
//   1. det kom medan just den sidan bytte sida eller laddades om (samma nav-räknare som för sidfel),
//   2. texten är exakt en av raderna i ABORTED_FETCH (inget annat felmeddelande), och
//   3. minst en begäran till den egna webbplatsen blev avbruten (requestfailed med "cancelled", "net::ERR_ABORTED" eller Firefox
//      "NS_BINDING_ABORTED") under samma sidbyte. Det avgörs i settle().
// Samma text utan sidbyte, eller under ett sidbyte där ingen begäran till den egna webbplatsen avbröts, fäller fortfarande kontrollen.
//
// Tidslinje (#1561, efter första Firefox-körningen): Firefox-jobbet 43620198695 visade att konsolfelet ändå fällde kontrollen utan
// diagnosraden, alltså kom det när inget sidbyte pågick (efter att goto/goBack/goForward hade returnerat, eller utan sidbyte alls),
// och WebKit-jobbet i samma körning visade att WebKit inte skickar någon requestfailed alls för avbrottet. Orsaken går inte att
// bevisa ur koden och Firefox/WebKit går inte att köra i molnmiljön, så villkoren ovan är OFÖRÄNDRADE. I stället skriver ett
// konsolfel av typen ABORTED_FETCH som fäller kontrollen en tidslinje på samma rad (consoleDiag och settle): tid sedan bevakningen
// skapades (kontrollens start) för varje sidbyte (start/slut och åtgärd), varje main-frame-navigering och load, varje requestfailed
// (adress, text), varje svar med 4xx/5xx, konsolfelets tid, sidans adress och vilka begäranden till den egna webbplatsen som var
// ofullbordade (request utan requestfinished eller requestfailed). Så avgör CI-loggen om felet kom före, under eller efter ett
// sidbyte, om någon begäran syntes som avbruten, och om "en egen begäran var ofullbordad" hade räckt som villkor 3.

/** Konsolradena för en avbruten hämtning: WebKit "TypeError: Load failed" (#702), Firefox "TypeError: NetworkError when attempting to
 *  fetch resource." eller "AbortError: The operation was aborted." (#888). Exakt de raderna, inget som bara liknar dem. */
export const ABORTED_FETCH = /^(TypeError: (Load failed|NetworkError when attempting to fetch resource\.)|AbortError: The operation was aborted\.\s*)$/;

/** WebKits rad för en avbruten hämtning: grupp 1 är adressen (med eller utan "Fetch API cannot load " och "http:"). */
export const WEBKIT_ABORT = /^(?:(?:Fetch API|XMLHttpRequest) cannot load |Cannot load )?(\S+) due to access control checks\.?$/;

/** "http://localhost:8000/a.json", "//localhost:8000/a.json" och "/localhost:8000/a.json" ger samma nyckel (värd + sökväg, utan sökdel). */
export const urlKey = text => {
  const m = String(text ?? '').match(/^(?:https?:)?\/{0,2}([^/\s?#]+)(\/[^\s?#]*)?/);
  return m ? { host: m[1], key: `${m[1]}${m[2] ?? '/'}` } : null;
};

/**
 * Bygger abortWatch för en webbplats.
 * @param {{siteHost: string, filtered?: (n: number) => void, register?: (watch: object) => void}} o
 *   siteHost: värden för den egna webbplatsen (new URL(BASE).host); filtered: får antalet bortfiltrerade fel när settle() avgör dem;
 *   register: får varje ny bevakning, så att den som kör kontrollen kan avgöra de som glömdes bort.
 */
export function skapaAbortWatch({ siteHost, filtered = () => {}, register = () => {}, now = Date.now }) {
  return function abortWatch(p) {
    const t0 = now(), timeline = [], pending = new Map(); // timeline: rader med tid för tidslinjen (#1561); pending: egna begäranden utan slut
    const FONT_HOST = /^fonts\.(googleapis|gstatic)\.com$/;
    const note = text => { timeline.push(`+${now() - t0} ms ${text}`); if (timeline.length > 80) timeline.shift(); };
    // Egna adresser utan värd men med sökdel och #-del (de skiljer sidbytena åt), andra med värd och sökväg
    const shortUrl = u => { const k = urlKey(u); return k ? (k.host === siteHost ? String(u).replace(/^(?:https?:)?\/*[^/?#\s]+/, '') || '/' : k.key) : String(u ?? ''); };
    const pendingText = () => {
      const l = [...pending.values()];
      return `${l.length} ofullbordade egna begäranden${l.length ? ` (${l.slice(0, 6).join(', ')}${l.length > 6 ? ', …' : ''})` : ''}`;
    };
    let navigating = 0, navSerial = 0; // navSerial räknar sidbytena, så att en konsolrad hör ihop med avbrott under just sitt sidbyte
    const candidates = [], aborted = new Set(), failedTexts = new Map(); // failedTexts: adress till texterna på alla misslyckade begäranden
    const consoleCandidates = [], abortedOwnNav = new Set(); // abortedOwnNav: sidbyten där en begäran till den egna webbplatsen avbröts
    const isOwn = r => urlKey(r.url())?.host === siteHost;
    p.on('request', r => { if (isOwn(r)) pending.set(r, shortUrl(r.url())); });
    p.on('requestfinished', r => {
      pending.delete(r);
      if (FONT_HOST.test(urlKey(r.url())?.host ?? '')) return;
      try { Promise.resolve(r.response?.()).then(res => { const st = res?.status?.(); if (st >= 400) note(`svar ${st}: ${shortUrl(r.url())}`); }).catch(() => {}); } catch { /* fakesidor i proven saknar response() */ }
    });
    p.on('framenavigated', f => { if (!p.mainFrame || f === p.mainFrame()) note(`navigerade till ${shortUrl(f?.url?.() ?? '')}`); });
    p.on('load', () => note('load'));
    p.on('requestfailed', r => {
      const k = urlKey(r.url()), text = r.failure()?.errorText ?? '';
      pending.delete(r);
      if (!FONT_HOST.test(k?.host ?? '')) note(`requestfailed: ${shortUrl(r.url())} (${text || 'ingen text'})`);
      if (k) failedTexts.set(k.key, [...(failedTexts.get(k.key) ?? []), text]);
      // En avbruten begäran har texten "cancelled" (Chromium "net::ERR_ABORTED"), eller WebKits rad "… <samma adress> due to access control
      // checks." när avbrottet kom mitt i hämtningen och WebKit klassar det som åtkomstkontroll (så skrev testet före #1393, då samma
      // regex gällde både sidfel och begäran). Raden räknas bara när den nämner just begärans egen adress (steg 2).
      const own = text.match(WEBKIT_ABORT);
      if (!/cancel|abort/i.test(text) && !(own && k && urlKey(own[1])?.key === k.key)) return;
      if (k) aborted.add(k.key);
      if (k?.host === siteHost) abortedOwnNav.add(navSerial);
    });
    const nav = async (go, label = 'nav') => {
      navigating++; navSerial++;
      note(`sidbyte ${navSerial} börjar: ${label}; ${pendingText()}`);
      try { return await go(); } finally { navigating--; note(`sidbyte ${navSerial} slut: ${label}; ${pendingText()}`); }
    };
    const watch = {
      nav,
      goto: (url, opts) => nav(() => p.goto(url, opts), `goto ${shortUrl(url)}`),
      reload: opts => nav(() => p.reload(opts), 'reload'),
      goBack: opts => nav(() => p.goBack(opts), 'goBack'),
      goForward: opts => nav(() => p.goForward(opts), 'goForward'),
      /** true om sidfelet kan vara en avbruten hämtning och väntar på settle(); false om det räknas som fel direkt. */
      defer(message, navigatingNow = navigating > 0) {
        if (!navigatingNow) return false;
        const m = String(message ?? '').match(WEBKIT_ABORT);
        const k = m && urlKey(m[1]);
        if (!k || k.host !== siteHost) return false;
        candidates.push({ key: k.key, message });
        return true;
      },
      /** true om konsolraden kan vara en avbruten hämtning och väntar på settle(); false om den räknas som fel direkt (#1561). */
      deferConsole(text, navigatingNow = navigating > 0) {
        if (!ABORTED_FETCH.test(String(text ?? ''))) return false;
        note(`konsolfel "${text}" ${navigatingNow ? `under sidbyte ${navSerial}` : `UTANFÖR sidbyte (senaste är ${navSerial}, ${navigating} pågår)`}; sidan ${shortUrl(p.url?.() || 'okänd')}; ${pendingText()}`);
        if (!navigatingNow) return false;
        consoleCandidates.push({ text, serial: navSerial });
        return true;
      },
      /** Tidslinjen på en rad (#1561), tom om texten inte är en av ABORTED_FETCH-raderna. Anropas av den som räknar konsolraden som fel. */
      consoleDiag(text) {
        return ABORTED_FETCH.test(String(text ?? '')) ? ` (tidslinje, tid sedan kontrollens start: ${timeline.join(' ; ')})` : '';
      },
      /** Sidfelen och konsolraderna som ändå är riktiga fel (ingen avbruten begäran). Räknar de bortfiltrerade. */
      settle() {
        const real = candidates.filter(c => !aborted.has(c.key));
        const realConsole = consoleCandidates.filter(c => !abortedOwnNav.has(c.serial));
        filtered(candidates.length - real.length + consoleCandidates.length - realConsole.length);
        candidates.length = 0;
        consoleCandidates.length = 0;
        const allFailed = [...failedTexts.entries()].map(([key, t]) => `${key}: ${t.join(' / ')}`).join(' | ') || 'inga';
        const consoleReal = realConsole.map(c => `konsol: ${c.text} (under sidbyte, men ingen begäran till den egna webbplatsen avbröts; misslyckade begäranden: ${allFailed})${watch.consoleDiag(c.text)}`);
        // Villkor 4 uppfylldes inte: texten säger vad webbläsaren rapporterade som misslyckad begäran för adressen, så att en körning i
        // WebKit visar varför felet inte räknades bort (ett sidfel utan den raden kom utanför ett sidbyte). Villkoren är oförändrade.
        return [...real.map(c => `${c.message} (ingen avbruten begäran för adressen; misslyckade begäranden: ${failedTexts.get(c.key)?.join(' | ') || 'inga'})`), ...consoleReal];
      },
    };
    register(watch);
    return watch;
  };
}
