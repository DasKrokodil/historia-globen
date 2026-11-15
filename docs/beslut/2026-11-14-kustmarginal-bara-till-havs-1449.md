# Kustmarginalen gäller bara till havs: grannländernas polygoner stänger ute grannlandets land (#1449)

**Datum:** 2026-11-14 (DasKrokodil sa ja till rekommendationerna i #1449; upptäckt i #1262, geografens granskning 2026-11-13)

## Beslut
1. **Regeln.** `placeEvents()` i `js/place-geo.js` räknar en händelse till en plats om punkten ligger i gränsen, eller inom 20 km från den (`COAST_MARGIN_KM`) **och inte inne i något annat lands polygon** i Natural Earth admin 0. En punkt på land hör bara till landet den ligger i. Marginalen hjälper bara punkter som hamnat i havet av kustens skull (Stockholm 0,6 km och Kalmar 3,3 km utanför 1:50m-linjen). En punkt inne i platsens egen polygon räknas alltid, också där grannens grova kust överlappar.
2. **Grannlistan är data, inte handskriven.** `tools/platser_gransar.py` skriver per plats `boundary.neighbours` (lista med `name`, `ne` när landet har ett id, och `geometry`) och `boundary.neighbourKm` (30) ur samma world-atlas 2.0.2 som platsernas länder. Bara de delar av grannlandets polygon som ligger inom 30 km från platsens gräns tas med (gränsen delas i bitar om högst 2 grader, varje bit får en ruta med 30 km marginal, grannpolygonerna klipps mot rutorna, hål lämnas bort). 30 km är de 20 km som prövas plus 10 km för det platta närmevärdet och avrundningen. Platsens eget land är inte med; för Skåne är det Sverige, så svensk mark strax utanför länet räknas som förut. Ingen handskriven lista (`notEvents`) har behövts: regeln ger inget fel någon annanstans i datan.
3. **Fälten är obligatoriska** i `schemas/platser.schema.json`, och `scripts/validate-site.py` kräver dem och att `neighbourKm` är minst marginalen. Annars skulle ett nytt kort utan listan i tysthet gå tillbaka till den gamla marginalen och dra in grannlandets land igen. Python-kopian `in_place` i validatorn och `inPlace()` körs mot samma fall (`tests/fixtures/granne.json`).
4. **Före Danmarks landskort (#1263).** Danmark finns redan i `data/platser.json`, och där hamnade Helsingborg (6,8 km från Danmarks gräns, i Sverige) i Danmarks kort; det är rättat nu.
5. **Kommentaren** i `js/place-geo.js` ("Ingen händelse i datan ligger inom 20 km från en annan plats gräns") var fel och är ersatt med regeln.

## Mätt (före och efter, alla händelser oavsett granskningsnivå, 2026-11-14)
Före/efter-jämförelsen av vilka händelser varje plats i `data/platser.json` får:
- Sverige: 54 → 53. Bort: `karl-xii-stupar-1718` (Fredriksten, Halden, Norge, 6,3 km utanför gränsen, inne i Norges polygon, Natural Earth id 578).
- Danmark: 27 → 26. Bort: `slaget-vid-helsingborg` (6,8 km utanför gränsen, inne i Sveriges polygon).
- Grönland 18, Aotearoa 42 och Skåne 21: oförändrade. Inget tillkommer någonstans.
- Kvar med marginalen: Stockholm, Kalmar och övriga punkter i havet; `oresundsbron-oppnas` (8,1 km från Sveriges gräns, 9,9 km från Danmarks och 6,5 km från Skånes, i sundet och i ingen polygon) hör fortfarande till Sverige, Danmark och Skåne. Händelserna i Köpenhamn räknas till Danmark som förut (0,2–0,7 km utanför den grova danska kusten, i ingen granne) och ligger 24,7–25,3 km från Sveriges gräns, utanför marginalen; Malmö, Landskrona och Lund ligger 20,8–35 km från Danmarks gräns, också utanför.
- Grannar som verktyget hittade: Sverige har Danmark, Finland, Norge och Åland (Natural Earth har Åland som eget land); Danmark har Tyskland och Sverige; Skåne har Danmark; Grönland har Kanada; Aotearoa har inga.

## Storlek
`data/platser.json` växte från 231 277 till 290 516 byte (27,2 till 31,5 kB gzip, +16 %) med 936 punkter i grannlistorna (Norge 440, Finland 173, Tyskland 128, Danmark 64 + 53, Sverige 38, Kanada 35, Åland 5). Filen laddas först när Fokusmenyn öppnas eller en plats finns i adressen, inte vid start. Punkterna ligger främst längs de delade landgränserna, där grannpolygonen behöver samma detaljrikedom som platsens egen gräns; cirka en tredjedel (335) ligger mer än 30 km från gränsen, där rutorna är större än behovet. En förenkling av grannpolygonerna med 1 km tolerans gav 672 punkter, men valdes bort: den flyttar linjer upp till 1 km, vilket är samma storleksordning som 1:50m-kustens egen osäkerhet och kunde vända en punkt precis vid gränsen, för en vinst på cirka 1 kB gzip.

## Licens
Samma källa och användning som platsernas länder (Natural Earth 1:50m admin 0 via world-atlas 2.0.2, public domain, `natural-earth-countries` i `data/sources.json` och `THIRD-PARTY-NOTICES.md`). Att gränsdata används också som grannpolygoner kräver ingen ny källa eller licens, och ingen historisk fakta har skrivits.

## Berör
#1449, #1262, #1263, #579, #1159, `js/place-geo.js` (`inNeighbour`, `inPlace`), `tools/platser_gransar.py`, `data/platser.json`, `schemas/platser.schema.json`, `scripts/validate-site.py`, `docs/datamodell.md`, `docs/arkitektur.md`, `tests/place-geo.test.mjs`, `tests/platser-granser-test.py`, `tests/fixtures/granne.json`, `tests/webblasare.mjs`. Bygger på [2026-11-10-platser-och-typ-i-data.md](2026-11-10-platser-och-typ-i-data.md) och [2026-11-11-skane-lansgrans-1159.md](2026-11-11-skane-lansgrans-1159.md) (kustmarginalen på 20 km är oförändrad; det som ändras är vad den får dra in).
