# Skarpt utsnitt på globen vid inzoomning

**Datum:** 2026-11-07

## Beslut
Globens hela kartbild (4096 × 2048, beslut 1) ändras inte. När man zoomar så nära att en bildpunkt blir mer än ungefär 1,5 gånger större på skärmen än helbildens bildpunkter ritas i stället det som syns om i hög upplösning på två extra bilder (grundkartan och lagerbilden för utsnittet, 2048 × 2048, 1536 × 1536 i smal mobil). De läggs som en liten bit av klotet ovanpå helbilden (`js/globe-detail.js`).

- Utsnittet ritas med samma kod som helbilden: grundkartan med `paintBase()` i `js/globe.js` och lagren med `registry.draw()` i en tänkt bild som är lika många gånger större som utsnittet kräver. Lagren ritar redan allt i förhållande till bildens bredd (`k = W / 2048`), så ingen lagerkod ändras.
- Det ritas om först 220 ms efter att rörelsen stannat. Det gamla utsnittet ligger kvar under tiden, eftersom det är fastlåst vid klotet. Ändras lagerbilden (nytt år, nya val) döljs utsnittets lagerbild direkt, så att aldrig ett gammalt års innehåll syns över det nya, och den ritas om när det blir stilla.
- Helbildens lagerbild får ett hål där utsnittets lagerbild ligger, så att halvgenomskinliga lager inte blandas två gånger.
- Kustlinjer och gradnät ritas tunna och skarpa i utsnittet (1 till 1,4 skärmpixlar) i stället för att växa med kartan.
- **Finare kust (1:10m):** utsnittet ritar kusten ur `data/land-10m.json` (Natural Earth 1:10m, samma källa, projektion och klippning vid datumlinjen som `data/land.json`). Filen är cirka 5 MB (cirka 400 000 punkter mot cirka 58 000 i 1:50m) och laddas först när utsnittet används första gången, inte vid start. Helbilden, Platt vy och upptäcktsvyn använder fortfarande `data/land.json` (1:50m). Går filen inte att läsa används 1:50m som förut. Filen byggs med `tools/land_10m.mjs` (d3-geo och topojson-client; samma verktyg återskapar `land.json` med 1:50m-källan, nästan identiskt: 57 818 mot 57 814 linjesegment). Tre ringar utan yta (kvantiserade småöar i Maldiverna) tas bort, eftersom d3 annars fyller hela kartan med dem.
- Utsnitt används inte i Platt vy (som har sin egen utsnittsritning), i upptäcktsvyn (papperskarta och dimma är bilder i helbildens storlek) och inte när bilden skulle bli mindre än 1,5 gånger skarpare än helbilden, till exempel utzoomat.

## Varför
Vid full zoom (3,2) är en bildpunkt i helbilden cirka 7 skärmpixlar bred på en dator, så kustlinjer och lager blev suddiga. En större helbild (8192 × 4096) hade gett bara hälften av vinsten, kostat cirka 170 MB grafikminne och gjort varje årsbyte fyra gånger dyrare. Utsnittet ger full skärpa utan att minnet växer och bryter inte beslut 1: det är samma ekvirektangulära ritning, bara för en del av bilden.

## Begränsningar
- Rikenas gränser (Cliopatria) är grova polygoner och följer inte kusten. Med den finare kusten syns glappen mellan riksområde och kust tydligare på vissa ställen.
- Omritningen med 1:10m är inte mätt på riktig grafikhårdvara.
- Nära polerna täcker utsnittet många längdgrader, så vinsten blir mindre där (cirka 2,5 gånger i stället för cirka 7).

## Berör
`js/globe-detail.js` (ny), `js/globe.js`, `js/controllers/render.js`, `data/land-10m.json` (ny), `tools/land_10m.mjs` (ny), `docs/arkitektur.md`, `docs/datamodell.md`, `docs/DEPLOYMENT.md`, `README.md`, `THIRD-PARTY-NOTICES.md`.
