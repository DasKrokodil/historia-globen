# Webbläsartestet delas i fler jobb: plats och fokus (#1649)

**Datum:** 2026-11-14

## Beslut
Jobbet "dator, övrigt" i `tests/jobb.json` delas i två steg. Platskontrollerna (#15, #579, #1159–#1164, #1227, #1255, #1268, #1439, #1449, #1454, #1464) och kontrollerna för förhistoriens reglage (#1089, #1090, #1319–#1321) får ett eget jobb, `plats` (31 kontroller). En andra grupp, `fokus` (17 kontroller: fokustyperna #1327, Samtidighetsjakten #741, surfplattans topprad #992, låg höjd #1310, landskortet #1448, stängregistret #1436, resans stopp #1380, Fokus följer ett krig, Källor och Om källorna, Samtidigt-pauser), flyttas till ett eget jobb. Tidsgränsen på 25 minuter är oförändrad.

## Varför
"Dator, övrigt" tog allt som inte låg i något annat jobb och nådde 25-minutersgränsen på `main` och i #1632. Jag mätte jobbet lokalt med samma urval som CI: 166 kontroller med tid, sammanlagt cirka 2 280 s (den längsta, uppspelning vid platsens händelser, tar ensam 130 s).

Första delningen (`plats`, cirka 750 s lokalt) gav i CI 20 min 50 s för teststeget i `dator` (före: över 24,5 min), alltså bara cirka 4 minuter marginal. Min uppskattning på 16–17 minuter räknade med att CI går cirka 0,65 av den lokala tiden; mätt var förhållandet cirka 0,82. Därför flyttades en andra grupp (cirka 450 s lokalt) till `fokus`. Räknat med 0,82 ger det cirka 14 minuter kvar i `dator`, och målet i `browser-test.yml` är cirka 15. `scripts/kontrolltackning.mjs` visar att varje kontroll ligger i exakt ett jobb. Gränsen höjdes inte. Nästa gång `dator` närmar sig 20 minuter: mät på nytt (loggen har bara resultat i slutet, så kör jobbet lokalt) och flytta nästa avgränsade grupp.
