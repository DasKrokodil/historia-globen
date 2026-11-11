# Platser: första skivan byggd för Grönland och Aotearoa (#579)

**Datum:** 2026-11-11

## Beslut
Första skivan av Platser (#579) byggs för Grönland och Aotearoa/Nya Zeeland, enligt beslutet [2026-11-10-platser-och-typ-i-data.md](2026-11-10-platser-och-typ-i-data.md):
- **Ny fil `data/platser.json`** med schema, och gruppen **Platser** i Sök och följ. En plats följs som ett Fokus av typen `place`, byggt på temats mekanism (urval av händelser), utan nytt läge.
- **Händelser inom gränsen räknas vid körning** (punkt i polygon) med en **kustmarginal på 20 km**, eftersom 1:50m-kusten är grov. Ingen händelse i datan ligger inom 20 km från en annan plats gräns (mätt 2026-11-11).
- **Gränsen är Natural Earth admin-0** (public domain, redan i `sources.json`) för Grönland och Nya Zeeland utan Tokelau. Skåne väntar på CC0-gränsen för Skåne län och flaggor och vapen väntar på licenskontroll per fil; ingen av dem ingår i den här skivan.
- **Typen på kortet är bara det som finns i redan källkontrollerade händelser.** Grönland är `autonomous` (Självstyrt område) enligt händelsen om självstyret 2009 och dess källor; "inom Danmarks rike" (`partOf`) skrivs först när det har kontrollerats mot en öppnad källa. Wikipedia gick inte att nå från molnmiljön vid bygget.
- **Inledningen** beskriver bara urvalet (ett urval, inte en heltäckande historia) och påstår inget historiskt, så den behöver ingen egen källa.

## Varför
Det minsta som går att prova för DasKrokodil och Andreas: välja en plats, läsa kortet, se konturen och följa händelserna i tidsordning. Samma mekanism som teman gör bygget litet och lätt att ta bort om piloten inte lyckas.

## Berör
#579, `docs/datamodell.md`, `docs/arkitektur.md`, `docs/produkt/13-ordlista.md`, `js/place-geo.js`, `js/layers/places.js`.
