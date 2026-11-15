# Västberlins gräns ur Berlins öppna data, och Östberlin som en del av DDR (#1731)

**Datum:** 2026-11-15 (DasKrokodils svar "Ja enligt rekommendationerna" på #1731)

## Beslut
1. Västberlin 1949–1990 får en gräns ur en öppen källa med licensen public domain, CC0 eller CC BY, inte ur OpenStreetMap (ODbL). Källan är **Verlauf der Berliner Mauer, 1989** (WFS-tjänsten `https://gdi.berlin.de/services/wfs/berlinermauer`, i datenregister.berlin.de; Forum für Geschichte und Gegenwart e.V. och Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Berlin), med licensen **Datenlizenz Deutschland – Zero – Version 2.0**. Den licensen ger fri användning utan villkor, alltså samma som CC0. Gränsen är gränsmuren ("Vorderlandmauer") och den politiska gränsen där den avviker från muren, handritade efter ett flygfoto 25 april 1989 och uttagna med `tools/vastberlin.py` till `tools/vastberlin.geojson`.
2. Östberlin ritas som en del av DDR, som DDR själv räknade det. Rutan Om kartan säger att västmakterna inte erkände Östberlin som DDR:s huvudstad (en.wikipedia "East Berlin"). Östberlins gräns är hela Berlin i Natural Earth admin 1 (5.1.2, public domain, används redan för platsernas gränser) minus Västberlin.
3. Västberlin visas utan stat. Det var en enklav under de västallierade och hörde formellt inte till Förbundsrepubliken (en.wikipedia "West Berlin"), som det redan står i rutan Om kartan för Västtyskland.

## Varför
Cliopatrias hål i DDR för Västberlin stämmer bara ungefär: det täckte delar av Östberlin, södra Västberlin (Kreuzberg, Neukölln, Zehlendorf) låg kvar i DDR, och 1973–1975 saknades hålet. Västberlin är centralt för kalla kriget i skolan, och felet syns när man klickar i staden. Datamängden är en officiell, öppen källa utan villkor, och gränsen är spårbar till muren 1989. Exklaverna (till exempel Steinstücken) är för små för kartan.

## Berör
`tools/vastberlin.py` och `tools/vastberlin.geojson` (nya), `tools/ne_omstridda.py` och `tools/ne-omstridda-omraden.geojson` (Berlin ur admin 1), `tools/riken.py` (områdena `('geojson', fil)` och `('skillnad', a, b)` i `DISPUTED`), `data/empires/osttyskland.json`, rutan Om kartan för Östtyskland, `data/sources.json` (`berlin-mauer-1989`, `wp-east-berlin`), README:ns licensavsnitt och `tests/riken-kontrollpunkter-test.py`.
