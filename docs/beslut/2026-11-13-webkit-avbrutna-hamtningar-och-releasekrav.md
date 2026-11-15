# WebKit: avbrutna hämtningar räknas bort smalt, och vad som krävs för release

**Datum:** 2026-11-13 (DasKrokodil i #1393, efter arkitektgranskningen)

## Beslut
1. WebKit-felen reproduceras i CI med etiketten `alla-webbläsare`, eftersom WebKit inte går att köra i molnmiljön.
2. En avbruten hämtning räknas bort ur sidfelen bara när den kom under ett sidbyte i den egna sidan, gäller den egna webbplatsen, har WebKits exakta text och också syns som en avbruten begäran. Det skärper beslutet 2026-11-08 (#888, punkt 2) och gäller alla kontroller genom en gemensam hjälpfunktion. Antalet bortfiltrerade fel syns i resultatet.
3. WebKit delas inte i två jobb nu. Det omprövas om jobbet tar över cirka 38 minuter (gränsen var 45; höjd till 60 minuter 2026-11-14, se [2026-11-14-firefox-webkit-tidsgrans-60](2026-11-14-firefox-webkit-tidsgrans-60.md)).
4. Chromium måste vara grönt för en release. Firefox och WebKit är också krav, men DasKrokodil får godta ett rött jobb när det finns ett issue med felraden och det är visat att felet sitter i testet (så som för v6.3.0, 2026-11-13). `continue-on-error` används inte.

## Varför
Tre av fem fel på release-PR:en för v6.3.0 kom från testet (avbrutna hämtningar när kontrollen laddade om sin sida), inte från sidan. 31 av 39 ställen som samlar sidfel saknade filter och sex filtrerade för brett, så samma fel spred sig till nya kontroller. Ett smalt, gemensamt filter tar bort falska fel utan att dölja riktiga, till exempel ett CORS-fel mot en annan webbplats.

## Uppdatering 2026-11-14 (steg 2, #1393)
Efter steg 1 (#1425) föll #865, #996 och #1138 fortfarande i WebKit med samma text (körning 43433628576, jobb 131940232104). En justering av villkor 4 och några tillägg som inte ändrar de andra villkoren:

- **Villkor 4 (avbruten begäran) godtar också WebKits rad för begärans egen adress.** Före ändringen räckte bara `requestfailed` med texten `cancelled` eller `abort`. Nu räknas också en begäran vars text är WebKits rad `… <samma adress> due to access control checks.` Det gör inte filtret bredare: sidfelet måste fortfarande komma under sidans eget sidbyte (villkor 1), ha WebKits exakta text (2) och gälla den egna webbplatsen (3), och begärans text måste nämna just begärans egen adress, inte en annan. Ett 404, ett fel utanför ett sidbyte, ett fel från en annan webbplats och en begäran utan avbrott fäller fortfarande kontrollen (enhetsprov i `tests/avbrutna-hamtningar.test.mjs`). Skälet är att en hämtning som avbryts mitt i svaret kan klassas som åtkomstkontroll även på begäran, och att testet före #1393 godtog den raden på begäran (samma regex för sidfel och begäran). Det är en trolig orsak och inte bekräftad, eftersom WebKit inte går att köra i molnmiljön: därför visar ett sidfel som ändå fäller kontrollen nu vilka begäranden som misslyckades för adressen och med vilken text, så att nästa körning med `alla-webbläsare` avgör saken.
- **`goBack`, `goForward` och appens egen omladdning (`nav`) räknas som sidbyten** på samma sätt som `goto` och `reload`.
- **`check()` avgör en bevakning som kontrollen glömde att avgöra** (`settle()`), så att ett sidfel som väntar aldrig försvinner tyst.
- **Hjälpfunktionen flyttades till `tests/avbrutna-hamtningar.mjs`** så att den går att prova utan webbläsare, och används nu i alla kontroller som laddar om eller byter sida på samma sida (21 till).
- **#1138:** kapplöpningen i `#screen-reader-status` rättades redan i #1419/#1424 (`js/ui/status.js`). Felet i körningen efter #1425 kom enligt radnumret i loggen från sidfelet som kontrollen kastar sist, efter att alla påståenden om statusraden hade gått igenom.

## Uppdatering 2026-11-14 (konsolfel i Firefox, #1561)
Firefox-jobbet i #1531 föll i kontrollen om platsens adress (#1162) med konsolfelet `TypeError: NetworkError when attempting to fetch resource.`. Orsaken är ett sidbyte i testet: sidan hämtar riken och andra filer när kontrollen går vidare med `goto`, Firefox avbryter hämtningarna och sidans egna `.catch` skriver dem som `console.error`. Sidan fångar felet (inget ofångat fel, platsfilen ger en tom lista och besked), så det är ett mätfel, och filtret i #1393 kände bara igen sidfel och WebKits text. Ändringen i `abortWatch()` är lika smal som för sidfel:

- **Ett konsolfel räknas bort bara när alla tre gäller:** det kom under sidans eget sidbyte (`goto`, `reload`, `goBack`, `goForward`, `nav`), texten är exakt en av raderna i `ABORTED_FETCH` (WebKit `TypeError: Load failed`, Firefox `TypeError: NetworkError when attempting to fetch resource.`, `AbortError: The operation was aborted.`) och minst en begäran till den egna webbplatsen blev avbruten under samma sidbyte (`cancelled`, `net::ERR_ABORTED`, `NS_BINDING_ABORTED`). Konsolraden har ingen adress, så villkoret om samma adress som för sidfel går inte att ställa.
- Samma text utan sidbyte, under ett sidbyte utan avbruten begäran till den egna webbplatsen, eller någon annan text fäller kontrollen; felet visar då vilka begäranden som misslyckades.
- Kontrollerna om platsens adress (`placeAddrPage()`) är de första som använder det. Fler kontroller får det först när de visar samma fel.
- Firefox gick inte att köra i molnmiljön. Chromium rapporterar inga avbrutna begäranden vid sidbyte, så det positiva fallet är bara provat med enhetsprov och en simulerad begäran; Firefox-jobbet i CI avgör.

## Uppdatering 2026-11-14 (tidslinje efter första Firefox- och WebKit-körningen, #1561)
Körning 43620198695 på pull request #1601 visade två saker. Firefox: kontrollen om platsens adress föll ändå, och felraden saknade diagnosraden, så konsolfelet gick inte via `deferConsole` utan kom när inget sidbyte pågick (`navigating === 0`): troligen rapporterar Firefox avbrottet först efter att `goto`, `goBack` eller `goForward` har returnerat. WebKit: alla felrader slutar med `misslyckade begäranden: inga`, alltså skickar WebKit ingen `requestfailed` för avbrottet, och det finns ingen anledning att tro att Firefox beter sig annorlunda. Då kan villkor 3 (och villkor 4 för sidfel i #1393) inte uppfyllas i de motorerna.

Orsaken går inte att bevisa ur koden, och Firefox och WebKit går inte att köra i molnmiljön. Därför **ändras inga villkor**: varken sidfelsfiltret i #1393 eller konsolfiltret i #1561 görs bredare (en tidsmarginal efter sidbytet eller "en ofullbordad begäran räcker" vore antaganden, och de skulle kunna dölja riktiga fel). I stället fäller felet som förut och skriver en tidslinje på samma rad (`abortWatch().consoleDiag()`, enhetsprov i `tests/avbrutna-hamtningar.test.mjs`): tid sedan kontrollens start för varje sidbyte (start/slut och åtgärd), main-frame-navigering och `load`, varje `requestfailed`, varje svar med 4xx/5xx, konsolfelets tid och sidans adress, och vilka egna begäranden som var ofullbordade. Nästa körning i Firefox och WebKit avgör vilket villkor som är bevisbart: (a) en ofullbordad egen begäran när sidbytet börjar, (b) navigerings- och `load`-händelser, eller (c) en kort tidsmarginal efter sidbytet. Ett bevisat villkor skrivs då som nästa uppdatering här, med positiva och negativa prov.

Följd för #1393: sidfelsfiltret räknar bort något bara i motorer som skickar `requestfailed` (Chromium med `net::ERR_ABORTED`), så i WebKit räknas inget bort och felen visas som riktiga fel med sin diagnosrad. Det är säkert (inget döljs) men låter falska fel falla. Filtret ändras inte här.

## Uppdatering 2026-11-14 (Firefox ger "JSHandle@object", orsaken bekräftad, #1561)
Körning 43624749998 på pull request #1601 (commit e4fcd15) gav för kontrollen om platsens adress `konsol: JSHandle@object` tre gånger, utan tidslinje. **Orsaken är bekräftad ur koden:** Firefox ger strängen `JSHandle@object` som `m.text()` för `console.error(err)` när `err` är ett `Error`. `pushConsole()` försöker läsa handtaget efteråt och skriva över texten, men det misslyckas ofta när sidan har bytt adress. Initskriptet från #888 (som gör `Error`-argument till text i sidan) låg bara på huvudkontexten i `run()`, medan `touchPage()` och därmed `placeAddrPage()` skapar egna kontexter med `browser.newContext` utan det. Alltså var texten `JSHandle@object` när `aw.deferConsole(m.text())` och `aw.consoleDiag(m.text())` läste den, och de matchade aldrig `ABORTED_FETCH`: varken filtret eller tidslinjen kunde aktiveras i Firefox. Samma gäller `reloading && ABORTED_FETCH.test(m.text())` i den gemensamma lyssnaren.

Rättningen är ren mätning: `newTestContext()` i `tests/webblasare.mjs` skapar nu varje kontext i testet och lägger `textifyConsoleErrors()` (`tests/avbrutna-hamtningar.mjs`) som initskript. `Error` och `DOMException` blir strängen `Namn: meddelande` (till exempel `TypeError: NetworkError when attempting to fetch resource.`) innan de når konsolen; alla andra argument skickas oförändrade och det ursprungliga anropet görs alltid. Enhetsprov: exakt sträng, `DOMException`, orörda argument, originalanrop och att funktionen är fristående när den skickas som text. **Villkoren i filtret (#1393, #1561) är oförändrade.** Villkor 3 kan fortfarande inte uppfyllas i Firefox och WebKit (ingen `requestfailed`), så en avbruten hämtning under ett sidbyte räknas inte bort där, men raden visar nu tidslinjen och därmed orsaken. Firefox och WebKit gick inte att köra i molnmiljön; Firefox-jobbet i CI avgör nästa steg.

## Uppdatering 2026-11-15 (steg 3: en ofullbordad egen begäran uppfyller villkor 4, DasKrokodil i #1393)
WebKit-jobben efter steg 2 (körning 43575810806 på #1531 och 43680977726 på #1632) hade fortfarande 4–5 kontroller som föll av `… due to access control checks.` för den egna webbplatsens filer (`data/genererat/…`, `data/routes/index.json`, `img/icons/…`). Alla felrader hade diagnosen `(ingen avbruten begäran för adressen; misslyckade begäranden: inga)`. Den raden skrivs bara för ett sidfel som kom **under** sidans eget sidbyte, med WebKits exakta text och för den egna webbplatsen (villkor 1–3), så det enda som saknades var villkor 4. WebKit skickar alltså ingen `requestfailed` alls för en hämtning som avbryts av ett sidbyte, och villkor 4 kunde aldrig uppfyllas där.

**Beslut (DasKrokodil 2026-11-15, alternativ (a) i uppdateringen ovan):** villkor 4 uppfylls också när samma adress var en **ofullbordad egen begäran** när sidfelet kom: sidan hade skickat den (`request`), men den hade varken blivit klar (`requestfinished`) eller misslyckats (`requestfailed`). Villkor 1–3 är oförändrade.

Det döljer inte riktiga fel:
- En begäran som misslyckas på riktigt (nekad anslutning, avbrott i nätet) får `requestfailed` och är då inte längre ofullbordad.
- En fil som redan har hämtats klart är inte ofullbordad.
- En ofullbordad begäran för en **annan** adress räcker inte.
- Fel utanför ett sidbyte, ett 404 (annan text) och fel för en annan webbplats fäller som förut.

Enhetsprov för fallen finns i `tests/avbrutna-hamtningar.test.mjs`. Ett sidfel som ändå fäller får texten `(ingen avbruten eller ofullbordad begäran för adressen; …)`. Konsolfiltret för Firefox (#1561, villkor 3 för konsolfel) ändras inte här. WebKit går inte att köra i molnmiljön, så effekten redovisas ur CI med etiketten `alla-webbläsare`.

## Berör
`tests/webblasare.mjs`, `tests/avbrutna-hamtningar.mjs` (`abortWatch()`), `docs/DEPLOYMENT.md` (Firefox och WebKit i testet, release), [2026-11-08-firefox-webkit-testet-888](2026-11-08-firefox-webkit-testet-888.md), #1393, #1174, #1419.
