# Reservruta för bildlösa Samtidigt-kort (#542)

**Datum:** 2026-11-03

## Beslut

En bildlös händelse i Samtidigt får en avsiktlig reservruta i samma bildrad som fotografier och illustrationer. Den visar den befintliga kategoriikonen, år, kategori och titel i händelsens kategorifärg och tidsålderns ram, och öppnar faktarutan med samma Läs mer-knapp som ett bildkort.

## Varför

En tommare bildyta såg ut som en trasig eller saknad bild. Reservrutan gör i stället händelsen tydlig utan att låtsas vara ett fotografi eller lägga till ny fakta eller bilddata.

## Berör

`js/ui/funfact.js`, `css/style.css`, `tests/webblasare.mjs`, `docs/arkitektur.md`, #542 och beslutet om bildstilar i `data/styles.json`.
