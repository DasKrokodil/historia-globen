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
//      rad för just begärans egen adress, se nedan), ELLER var en ofullbordad egen begäran när sidfelet kom: sidan hade skickat den
//      (request) men den hade varken blivit klar (requestfinished) eller misslyckats (requestfailed). Det fjärde avgörs i settle() när
//      kontrollen är klar, eftersom ordningen mellan händelserna varierar.
// Den ofullbordade begäran (steg 3, DasKrokodil 2026-11-15): WebKit skickar aldrig requestfailed för en hämtning som avbryts av ett
// sidbyte (körningarna 43575810806 och 43680977726: alla kvarvarande sidfel hade "misslyckade begäranden: inga"). En begäran som
// misslyckades på riktigt (till exempel nekad anslutning) får requestfailed och är inte längre ofullbordad, så den fäller fortfarande.
// Inga motbevis (steg 3, andra delen, DasKrokodil 2026-11-15): spåren per fil i körning 43689485698 visade att WebKit inte heller
// skickar request för den avbrutna hämtningen. Sidfelet kom före varje request för adressen som Playwright såg (till exempel
// "sidfel +408 ms under sidbyte 2" mot "request +652 ms, requestfinished +1108 ms"), eller så syntes ingen request alls
// (data/land-10m.json). Villkor 4 går alltså inte att observera i WebKit. Därför räcker det också att adressen saknar motbevis under
// kontrollen: ingen requestfailed med annan text än ett avbrott, och inget svar med status 400 eller högre. Villkor 1–3 gäller som förut.
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
    const realFail = new Set(); // motbevis (steg 3): adresser med requestfailed som inte är ett avbrott, eller ett svar med status >= 400
    const consoleCandidates = [], abortedOwnNav = new Set(); // abortedOwnNav: sidbyten där en begäran till den egna webbplatsen avbröts
    const isOwn = r => urlKey(r.url())?.host === siteHost;
    const pendingKeys = new Map(); // egen begäran till dess nyckel (urlKey), så länge den är ofullbordad (villkor 4, steg 3)
    const isPending = key => [...pendingKeys.values()].includes(key);
    // Spår per egen adress (steg 3, diagnos): när begäran skickades, blev klar eller misslyckades, och när sidfelet kom. Skrivs bara på
    // ett sidfel som ändå fäller kontrollen, så att en körning i WebKit visar vad webbläsaren rapporterade för just den filen.
    const trail = new Map();
    const track = (u, what) => { const k = urlKey(u)?.key; if (!k) return; const l = trail.get(k) ?? []; l.push(`${what} +${now() - t0} ms`); if (l.length > 12) l.shift(); trail.set(k, l); };
    p.on('request', r => { if (isOwn(r)) { pending.set(r, shortUrl(r.url())); pendingKeys.set(r, urlKey(r.url())?.key); track(r.url(), `request${navigating ? ` (sidbyte ${navSerial})` : ''}`); } });
    p.on('requestfinished', r => {
      if (pendingKeys.has(r)) track(r.url(), 'requestfinished');
      pending.delete(r); pendingKeys.delete(r);
      if (FONT_HOST.test(urlKey(r.url())?.host ?? '')) return;
      try { Promise.resolve(r.response?.()).then(res => { const st = res?.status?.(); if (st >= 400) { note(`svar ${st}: ${shortUrl(r.url())}`); const k = urlKey(r.url())?.key; if (k) { realFail.add(k); track(r.url(), `svar ${st}`); } } }).catch(() => {}); } catch { /* fakesidor i proven saknar response() */ }
    });
    p.on('framenavigated', f => { if (!p.mainFrame || f === p.mainFrame()) note(`navigerade till ${shortUrl(f?.url?.() ?? '')}`); });
    p.on('load', () => note('load'));
    p.on('requestfailed', r => {
      const k = urlKey(r.url()), text = r.failure()?.errorText ?? '';
      if (pendingKeys.has(r)) track(r.url(), `requestfailed (${text || 'ingen text'})`);
      pending.delete(r); pendingKeys.delete(r);
      if (!FONT_HOST.test(k?.host ?? '')) note(`requestfailed: ${shortUrl(r.url())} (${text || 'ingen text'})`);
      if (k) failedTexts.set(k.key, [...(failedTexts.get(k.key) ?? []), text]);
      // En avbruten begäran har texten "cancelled" (Chromium "net::ERR_ABORTED"), eller WebKits rad "… <samma adress> due to access control
      // checks." när avbrottet kom mitt i hämtningen och WebKit klassar det som åtkomstkontroll (så skrev testet före #1393, då samma
      // regex gällde både sidfel och begäran). Raden räknas bara när den nämner just begärans egen adress (steg 2).
      const own = text.match(WEBKIT_ABORT);
      if (!/cancel|abort/i.test(text) && !(own && k && urlKey(own[1])?.key === k.key)) { if (k) realFail.add(k.key); return; }
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
        candidates.push({ key: k.key, message, pending: isPending(k.key), at: `sidfel +${now() - t0} ms under sidbyte ${navSerial}` }); // ofullbordad just när sidfelet kom (villkor 4, steg 3)
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
        const real = candidates.filter(c => !aborted.has(c.key) && !c.pending && realFail.has(c.key));
        const realConsole = consoleCandidates.filter(c => !abortedOwnNav.has(c.serial));
        filtered(candidates.length - real.length + consoleCandidates.length - realConsole.length);
        candidates.length = 0;
        consoleCandidates.length = 0;
        const allFailed = [...failedTexts.entries()].map(([key, t]) => `${key}: ${t.join(' / ')}`).join(' | ') || 'inga';
        const consoleReal = realConsole.map(c => `konsol: ${c.text} (under sidbyte, men ingen begäran till den egna webbplatsen avbröts; misslyckade begäranden: ${allFailed})${watch.consoleDiag(c.text)}`);
        // Villkor 4 uppfylldes inte: texten säger vad webbläsaren rapporterade som misslyckad begäran för adressen, så att en körning i
        // WebKit visar varför felet inte räknades bort (ett sidfel utan den raden kom utanför ett sidbyte). Villkoren är oförändrade.
        return [...real.map(c => `${c.message} (ingen avbruten eller ofullbordad begäran för adressen, och adressen misslyckades på riktigt; misslyckade begäranden: ${failedTexts.get(c.key)?.join(' | ') || 'inga'}; spår: ${[...(trail.get(c.key) ?? ['ingen request för adressen']), c.at].join(', ')})`), ...consoleReal];
      },
    };
    register(watch);
    return watch;
  };
}

/**
 * Initskript för webbläsartestet (#888, #1561): gör Error- och DOMException-argument till strängar INNAN de når webbläsarens konsol.
 * Firefox ger texten "JSHandle@object" i m.text() för console.error(err) när konsolhändelsen kommer, och handtaget går inte att läsa
 * i efterhand om sidan hunnit byta adress. Då matchar inget filter på m.text() (ABORTED_FETCH, tidslinjen) i Firefox. Efter det här
 * är texten "Namn: meddelande" direkt, samma form som WebKit och Chromium ger. Alla andra argument skickas oförändrade, och det
 * ursprungliga anropet görs alltid. Bara testet använder funktionen; sidans egen kod (js/) ändras inte.
 *
 * Funktionen ska vara fristående: Playwright skickar den som text till sidan (page.addInitScript, context.addInitScript), så den får
 * inte använda något utanför sig själv. Parametern finns för enhetsproven (ett objekt med error och warn i stället för console).
 */
export function textifyConsoleErrors(target = console) {
  const isErr = a => a instanceof Error || (typeof DOMException !== 'undefined' && a instanceof DOMException);
  for (const level of ['error', 'warn']) {
    const original = target[level];
    target[level] = function (...args) {
      return original.apply(this, args.map(a => (isErr(a) ? `${a.name}: ${a.message}` : a)));
    };
  }
}
