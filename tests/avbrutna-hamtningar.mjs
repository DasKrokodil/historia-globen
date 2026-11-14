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
export function skapaAbortWatch({ siteHost, filtered = () => {}, register = () => {} }) {
  return function abortWatch(p) {
    let navigating = 0;
    const candidates = [], aborted = new Set(), failedTexts = new Map(); // failedTexts: adress till texterna på alla misslyckade begäranden
    p.on('requestfailed', r => {
      const k = urlKey(r.url()), text = r.failure()?.errorText ?? '';
      if (k) failedTexts.set(k.key, [...(failedTexts.get(k.key) ?? []), text]);
      // En avbruten begäran har texten "cancelled" (Chromium "net::ERR_ABORTED"), eller WebKits rad "… <samma adress> due to access control
      // checks." när avbrottet kom mitt i hämtningen och WebKit klassar det som åtkomstkontroll (så skrev testet före #1393, då samma
      // regex gällde både sidfel och begäran). Raden räknas bara när den nämner just begärans egen adress (steg 2).
      const own = text.match(WEBKIT_ABORT);
      if (!/cancel|abort/i.test(text) && !(own && k && urlKey(own[1])?.key === k.key)) return;
      if (k) aborted.add(k.key);
    });
    const nav = async go => { navigating++; try { return await go(); } finally { navigating--; } };
    const watch = {
      nav,
      goto: (url, opts) => nav(() => p.goto(url, opts)),
      reload: opts => nav(() => p.reload(opts)),
      goBack: opts => nav(() => p.goBack(opts)),
      goForward: opts => nav(() => p.goForward(opts)),
      /** true om sidfelet kan vara en avbruten hämtning och väntar på settle(); false om det räknas som fel direkt. */
      defer(message, navigatingNow = navigating > 0) {
        if (!navigatingNow) return false;
        const m = String(message ?? '').match(WEBKIT_ABORT);
        const k = m && urlKey(m[1]);
        if (!k || k.host !== siteHost) return false;
        candidates.push({ key: k.key, message });
        return true;
      },
      /** Sidfelen som ändå är riktiga fel (ingen avbruten begäran för samma adress). Räknar de bortfiltrerade. */
      settle() {
        const real = candidates.filter(c => !aborted.has(c.key));
        filtered(candidates.length - real.length);
        candidates.length = 0;
        // Villkor 4 uppfylldes inte: texten säger vad webbläsaren rapporterade som misslyckad begäran för adressen, så att en körning i
        // WebKit visar varför felet inte räknades bort (ett sidfel utan den raden kom utanför ett sidbyte). Villkoren är oförändrade.
        return real.map(c => `${c.message} (ingen avbruten begäran för adressen; misslyckade begäranden: ${failedTexts.get(c.key)?.join(' | ') || 'inga'})`);
      },
    };
    register(watch);
    return watch;
  };
}
