# Firefox och WebKit körs i samma elva jobb som Chromium

**Datum:** 2026-11-22 (DasKrokodil sa ja: "gör 1 och 2", #2171)

## Beslut
1. Firefox- och WebKit-jobben i webbläsartestet (`.github/workflows/browser-test.yml`, bara på release-PR:er och pull requests med etiketten `alla-webbläsare`) körs i **samma elva jobb som Chromium**, med urvalet ur `tests/jobb.json` (`BREDD`, `ENDAST`, `UTAN`). `scripts/kontrolltackning.mjs` bevisar att varje kontroll ligger i exakt ett jobb, och gäller alla tre motorerna.
2. Varje Firefox- och WebKit-jobb får **45 minuter** (Chromium behåller 25).
3. Webbläsartestet skriver nu en rad när varje kontroll börjar (`… namn`) och en rad när den är klar (`✓ namn (tid)` eller `✗ namn: orsak`). Den samlade listan med `OK` och `FEL` skrivs som förut när jobbet är klart.

## Varför
WebKits dator-omgång ensam tog över 60 minuter (körning 44948040892, jobb 136979641680, 2026-11-21): den nådde `tidsintervallet … (#755)` kl. 21:46:30 och avbröts av tidsgränsen kl. 21:46:53, och mobil-omgången hann aldrig börja. Firefox nådde också 60-minutersgränsen. Ett avbrutet jobb gav inget resultat alls, eftersom resultaten skrevs ut först när jobbet var klart, så fyra riktiga WebKit-fel var rättade men resten av sviten kunde inte avgöras.

Det ersätter punkt 3 i [2026-11-13-webkit-avbrutna-hamtningar-och-releasekrav](2026-11-13-webkit-avbrutna-hamtningar-och-releasekrav.md) ("WebKit delas inte i två jobb nu. Det omprövas om jobbet tar över cirka 38 minuter") och punkt 3 i [2026-11-14-firefox-webkit-tidsgrans-60](2026-11-14-firefox-webkit-tidsgrans-60.md) ("prövas igen när jobben har delats"). Releasekravet i punkt 4 i beslutet 2026-11-13 är oförändrat: Chromium måste vara grönt, Firefox och WebKit är också krav, och DasKrokodil får godta ett rött jobb när det finns ett issue med felraden och det är visat att felet sitter i testet.

## Kostnad
En körning med etiketten `alla-webbläsare` eller mot `production` har 33 jobb i stället för 13. Varje jobb installerar sin motor (cirka en minut med apt-cachen). Följer varje jobb sin gräns tar hela körningen drygt 20–45 minuter i stället för över en timme.

## Prövas
Uppföljning efter nästa release-PR: tar något Firefox- eller WebKit-jobb över cirka 35 minuter delas det jobbets urval vidare i `tests/jobb.json`. Hittas fler WebKit-fel som tidigare var dolda av tidsgränsen blir de egna issues.

Gäller: `.github/workflows/browser-test.yml`, `tests/webblasare.mjs`, `docs/DEPLOYMENT.md`.
