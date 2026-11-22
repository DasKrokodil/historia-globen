# v6.5.0 släpps med röda Firefox- och WebKit-jobb

**Datum:** 2026-11-22 (DasKrokodil: "vi fixar det efter releasen, så vi godtar releasen som den är nu")

## Beslut
1. Release v6.5.0 (release-PR #2160) släpps med de röda Firefox- och WebKit-jobben i körning 44987723163 (commit `aabd234`). Chromium är grönt i alla elva jobb.
2. De orättade fynden samlas i issue [#2178](https://github.com/DasKrokodil/historia-globen/issues/2178) och rättas efter releasen.
3. Fyra fynd rättades i testet i pull request #2172 och släpps med den: Firefox #1161 (`data-view`) och #1785 (304), WebKit #1310 (`scrollIntoViewIfNeeded`) och #1089 (Home före länkens år).

## Hur det passar beslutet 2026-11-13
Punkt 4 i [2026-11-13-webkit-avbrutna-hamtningar-och-releasekrav](2026-11-13-webkit-avbrutna-hamtningar-och-releasekrav.md) låter DasKrokodil godta ett rött jobb när det finns ett issue med felraden och det är visat att felet sitter i testet. Issuet finns (#2178). Att felen sitter i testet är **inte visat** för fynden i issuet, och för minst ett (lektionens jakt, #1709, som faller i både Firefox och WebKit men inte i Chromium) kan det vara en riktig skillnad i sidan. Det här beslutet är därför ett medvetet undantag som DasKrokodil tar, inte en tillämpning av punkt 4.

## Varför
WebKit och Firefox har aldrig körts färdigt förut (WebKit hann inte klart på 60 minuter), så felen är nya i den meningen att de först nu syns. Ingen av dem är en regression i v6.5.0 som har visats mot en tidigare grön körning, och Chromium täcker samma kontroller.

Gäller: `docs/DEPLOYMENT.md` (tabellen över WebKit- och Firefox-fynd), #2171, #2172, #2178.
