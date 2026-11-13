# WebKit: avbrutna hämtningar räknas bort smalt, och vad som krävs för release

**Datum:** 2026-11-13 (DasKrokodil i #1393, efter arkitektgranskningen)

## Beslut
1. WebKit-felen reproduceras i CI med etiketten `alla-webbläsare`, eftersom WebKit inte går att köra i molnmiljön.
2. En avbruten hämtning räknas bort ur sidfelen bara när den kom under ett sidbyte i den egna sidan, gäller den egna webbplatsen, har WebKits exakta text och också syns som en avbruten begäran. Det skärper beslutet 2026-11-08 (#888, punkt 2) och gäller alla kontroller genom en gemensam hjälpfunktion. Antalet bortfiltrerade fel syns i resultatet.
3. WebKit delas inte i två jobb nu. Det omprövas om jobbet tar över cirka 38 minuter (gränsen är 45).
4. Chromium måste vara grönt för en release. Firefox och WebKit är också krav, men DasKrokodil får godta ett rött jobb när det finns ett issue med felraden och det är visat att felet sitter i testet (så som för v6.3.0, 2026-11-13). `continue-on-error` används inte.

## Varför
Tre av fem fel på release-PR:en för v6.3.0 kom från testet (avbrutna hämtningar när kontrollen laddade om sin sida), inte från sidan. 31 av 39 ställen som samlar sidfel saknade filter och sex filtrerade för brett, så samma fel spred sig till nya kontroller. Ett smalt, gemensamt filter tar bort falska fel utan att dölja riktiga, till exempel ett CORS-fel mot en annan webbplats.

## Berör
`tests/webblasare.mjs` (`abortWatch()`), `docs/DEPLOYMENT.md` (Firefox och WebKit i testet, release), [2026-11-08-firefox-webkit-testet-888](2026-11-08-firefox-webkit-testet-888.md), #1393, #1174, #1419.
