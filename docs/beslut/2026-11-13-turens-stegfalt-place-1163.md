# Platser i turen, lektionsläget och tidsintervallet: stegfältet `place` (#1163)

**Datum:** 2026-11-13

## Beslut
Beslutet [2026-11-10-platser-och-typ-i-data.md](2026-11-10-platser-och-typ-i-data.md) (tryck på kontur av i lektionsläget utom i turens steg, slutåret i tidsintervallet, stegfält i turerna) byggs som följer.

1. **Nytt valfritt fält `place` på ett turs steg** (`js/tour-format.js`, `schemas/tour.schema.json`, `docs/datamodell.md`): id för en plats i `data/platser.json`. Ett steg har `open` (en händelse) eller `place` (en plats), inte båda. Kontrollen delas med testerna: formen kontrolleras alltid, och finns platsen kontrolleras i `tests/tour.test.mjs` och `scripts/validate-site.py` (en plats som är ett utkast räknas inte).
2. **Steget öppnar kortet utan Fokus.** En plats är i vanliga fall Fokus, men ett Fokus avslutar turen (`MODE_RULES`). Turens steg använder därför samma kort (`showPlaceCard` i `js/focus/place.js`) utan att läget Fokus börjar, och `js/state.js` är oförändrad. Kortet har inte *Avsluta platsen* (inget Fokus att avsluta), inte *Visa i Platt karta* (turen styr kameran och vyn, så platskortet självt flyttar aldrig kameran; en rad i kortets lista öppnar däremot händelsen, och då flyger kameran dit som vid ett klick på en markör) och inte notisen om att filtren inte gäller (den hör till Fokus). Platsens kontur ritas på kartan som i Fokus, eftersom kortet säger att linjen på kartan är dagens gräns (`PlacesLayer.step`, satt av `controllers/places.js`).
3. **Smal skärm:** som för en händelse öppnas kortet inte av sig självt, eftersom arket täcker turkortet. Knappen i turkortet heter då *Läs om platsen* och öppnar det.
4. **Lektionsläget låser som förut.** Platstrycket är av i tur och lektion (beslutet 2026-11-13, `allowed()`), så läraren öppnar kortet genom turens steg och eleverna öppnar det inte fritt. Kortet ger ingen väg ut ur låset: inget Fokus, ingen vyändring, ingen yta som släpper lager, och en rad i kortets lista öppnar händelsen utan att hoppa året (`select(id, false)` i en tur; lektionens lås klämmer dessutom året inom lektionens spann). Kortet tar inte tangentbordsfokus i en tur, så Nästa behåller det.
5. **Tidsintervall och plats utesluter varandra, som lägeskontraktet säger** (Fokus avslutar intervallet och tvärtom, ingen ändring i `MODE_RULES`). Det som var oklart var att intervallet bara försvann. Nu börjar en plats som följs under ett intervall vid **intervallets slutår**, som riken (`state.areaYear`, #756) och *Tillbaka till ett år* redan gör, och kortet säger det: "Tidsintervallet 1900–1950 avslutades när platsen började följas. För år 1950 visas platsen." Raden står direkt under kortets namn (synlig utan att rulla) och läses upp efter rubriken Slutåret används bara om det ligger inom platsens spann; annars intervallets början om den gör det, annars platsens första händelse. Andra fokustyper börjar som förut vid intervallets början. Mekanismen är fältet `startsAtRangeEnd` i fokustypens post (`js/focus/registry.js`), som styrningen läser.
6. **Gränssnittstexter** (`place.rangeEnded`, `tour.readPlace`) finns på alla fem språken.
7. **Ingen riktig tur har ett platssteg än.** Proven lägger in en provtur med `route` i webbläsartestet. Att skriva en tur om en plats är innehåll (fakta och källor) och görs i eget issue.

## Inte gjort (väntar på DasKrokodil)
Punkt 4 i issuet: om platsen ska finnas i lärarbladet och utskriften (planen `docs/granskningar/2026-11-10-platskort-plan-efter-pilot.md`, steg 3). Ingen ändring i `js/ui/print-sheet.js` eller i lärarfälten.

## Varför
Stegfältet gör att läraren kan visa ett platskort i en lektion utan att ge eleverna nya ingångar, och utan att bygga ett eget läge. Att kortet delas med Fokus gör att texter, flaggor, vapen och källor är på ett ställe. Att platsen börjar vid slutåret gör att intervallet inte försvinner utan förklaring och följer samma regel som resten av sidan.

## Berör
#1163, #579, #1161, #795, #755, #893, `js/ui/tour.js`, `js/controllers/places.js`, `js/controllers/focus.js`, `js/focus/place.js`, `js/layers/places.js`, `js/ui/panel.js`, `docs/arkitektur.md`, `docs/datamodell.md`.
