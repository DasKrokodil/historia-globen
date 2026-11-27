# Månvyn: bandets text och dolda kort (#1527)

**Datum:** 2026-11-27 (DasKrokodil, svar på frågorna i pull requesten för #1527)

## Beslut
1. **Bandet överst i månvyn heter "Månen · en plats utanför jorden"** (en *The Moon · a place beyond Earth*, de *Der Mond · ein Ort außerhalb der Erde*, es *La Luna · un lugar fuera de la Tierra*, fr *La Lune · un lieu hors de la Terre*). Det ersätter "Månen · utanför jordens tid och plats" i issuet. Att månen inte har någon egen tid i vyn säger raderna "Året är 1969, jordens tid" och "Tidsreglaget ändrar inte månkartan".
2. **Faktarutan och Samtidigt-kortet döljs medan månvyn är öppen, i stället för att stängas** (punkt 3 i [2026-11-14-rymden-forsta-steget.md](2026-11-14-rymden-forsta-steget.md)). Ett kort visas fortfarande i taget, och när man går tillbaka till jorden finns faktarutan och knappen Visa på månen kvar, så att fokus kan gå tillbaka dit.
3. **Källor och kredit i månvyn fälls ihop** som raden "Källor och osäkerhet" i faktarutan, med "inte skalenlig" synligt. Det görs i ett eget issue.
4. **Knappens plats i faktarutan på dator** (under händelsens bild) får stå kvar tills fler händelser har en plats på månen eller besökarna saknar knappen.

## Motivering
Historikern påpekade att "utanför jordens tid" kan läsas som att landningen inte hade någon tid på jorden, och att "hors du temps" på franska betyder ungefär "tidlös". Att dölja korten i stället för att stänga dem behåller platsen dit fokus går tillbaka och gör vägen tillbaka till jorden förutsägbar.

## Berör
#1527, #14; `data/ui/*.json` (`space.band`), `index.html`, `js/ui/moon.js`, `docs/arkitektur.md`.
