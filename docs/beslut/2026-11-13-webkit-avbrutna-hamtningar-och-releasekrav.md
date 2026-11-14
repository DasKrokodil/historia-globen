# WebKit: avbrutna hämtningar räknas bort smalt, och vad som krävs för release

**Datum:** 2026-11-13 (DasKrokodil i #1393, efter arkitektgranskningen)

## Beslut
1. WebKit-felen reproduceras i CI med etiketten `alla-webbläsare`, eftersom WebKit inte går att köra i molnmiljön.
2. En avbruten hämtning räknas bort ur sidfelen bara när den kom under ett sidbyte i den egna sidan, gäller den egna webbplatsen, har WebKits exakta text och också syns som en avbruten begäran. Det skärper beslutet 2026-11-08 (#888, punkt 2) och gäller alla kontroller genom en gemensam hjälpfunktion. Antalet bortfiltrerade fel syns i resultatet.
3. WebKit delas inte i två jobb nu. Det omprövas om jobbet tar över cirka 38 minuter (gränsen är 45).
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

## Berör
`tests/webblasare.mjs`, `tests/avbrutna-hamtningar.mjs` (`abortWatch()`), `docs/DEPLOYMENT.md` (Firefox och WebKit i testet, release), [2026-11-08-firefox-webkit-testet-888](2026-11-08-firefox-webkit-testet-888.md), #1393, #1174, #1419.
