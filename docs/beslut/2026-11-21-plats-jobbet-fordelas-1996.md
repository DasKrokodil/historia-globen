# Platsjobbet fördelas mellan befintliga datorjobb (#1996, #2166)

**Datum:** 2026-11-21

## Beslut

Flytta kontrollerna #1956 och #1958 från `plats` till `lang`, och #1978 samt platskortets gemensamma kontroll #1790, #1791 och #1977 till `dator2`. Ändra bara jobbens urval; mobiljobben, kontrollerna och tidsgränserna behålls.

## Varför

`plats` tog 20 min 35 s i en lyckad CI-körning och nådde 25-minutersgränsen två gånger utan felande kontroll. De fyra kontrollerna tog tillsammans 374,7 s. Omfördelningen ger ett beräknat riktvärde kring 14–15 minuter för `plats` och använder ledigt utrymme i mottagarjobben. De faktiska tiderna för alla elva Chromium-jobb kontrolleras i första CI-körningen; inget bör överstiga cirka 16 minuter.

## Berör

`tests/jobb.json`, [publiceringsdokumentets mätning](../DEPLOYMENT.md#mätning-och-omfördelning-2026-11-21-2166), #2166 och tidigare mätningar i #1996. `node scripts/kontrolltackning.mjs` verifierar exakt ett jobb per kontroll och bredd, med testets gemensamma startkontroller som avsiktligt undantag.
