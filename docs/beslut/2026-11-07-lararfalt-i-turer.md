# Lärarfält i turformatet (#737)

**Datum:** 2026-11-07

## Beslut
En guidad tur kan ha ett valfritt fält `lesson` som gör den till en lektionstur: årskurs (`F-3`, `4-6`, `7-9`, `gy`), lektionens längd i minuter, kopplingen till läroplanen med källa, lärarinstruktion, exit ticket och valfria förkunskaper. Kopplingen till läroplanen skrivs alltid "kopplad till Lgr22" (eller Gy25), aldrig "godkänd av Skolverket" eller liknande. Den behöver en källa i `sources.json`, i praktiken Skolverkets kursplan, öppnad och kontrollerad som andra källor.

## Varför
Skolpiloten (Version 6, docs/beslut/2026-11-07-skolpilot-version-6.md) behöver lektioner som en lärare kan köra utan förberedelse. Att lägga lärarfälten i turen gör att turen, elevbladet och lärarbladet (#738) bygger på samma data. Att aldrig skriva "godkänd" undviker att en koppling vi har gjort själva ser ut som ett myndighetsbeslut.

## Berör
`js/tour-format.js`, `schemas/tour.schema.json`, `scripts/validate-site.py`, `tests/tour.test.mjs`, `docs/datamodell.md`, #66, #738, #739, #740.
