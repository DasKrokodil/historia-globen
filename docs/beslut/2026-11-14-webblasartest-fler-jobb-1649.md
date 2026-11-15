# Webbläsartestet delas i fler jobb: plats och fokus (#1649)

**Datum:** 2026-11-14

## Beslut
Jobbet "dator, övrigt" i `tests/jobb.json` delas i två steg. Platskontrollerna (#15, #579, #1159–#1164, #1227, #1255, #1268, #1439, #1449, #1454, #1464) och kontrollerna för förhistoriens reglage (#1089, #1090, #1319–#1321) får ett eget jobb, `plats` (31 kontroller). En andra grupp, `fokus` (17 kontroller: fokustyperna #1327, Samtidighetsjakten #741, surfplattans topprad #992, låg höjd #1310, landskortet #1448, stängregistret #1436, resans stopp #1380, Fokus följer ett krig, Källor och Om källorna, Samtidigt-pauser), flyttas till ett eget jobb. Tidsgränsen på 25 minuter är oförändrad.

## Varför
"Dator, övrigt" tog allt som inte låg i något annat jobb och nådde 25-minutersgränsen på `main` och i #1632. Jag mätte jobbet lokalt med samma urval som CI: 166 kontroller med tid, sammanlagt cirka 2 280 s (den längsta, uppspelning vid platsens händelser, tar ensam 130 s).

Första delningen (`plats`, cirka 750 s lokalt) gav i CI 20 min 50 s för teststeget i `dator` (före: över 24,5 min), alltså bara cirka 4 minuter marginal. Min uppskattning på 16–17 minuter räknade med att CI går cirka 0,65 av den lokala tiden; mätt var förhållandet cirka 0,82. Därför flyttades en andra grupp (cirka 450 s lokalt) till `fokus`. Räknat med 0,82 ger det cirka 14 minuter kvar i `dator`, och målet i `browser-test.yml` är cirka 15. `scripts/kontrolltackning.mjs` visar att varje kontroll ligger i exakt ett jobb. Gränsen höjdes inte. Nästa gång `dator` närmar sig 20 minuter: mät på nytt (loggen har bara resultat i slutet, så kör jobbet lokalt) och flytta nästa avgränsade grupp.

## Tillägg 2026-11-15: mobilbredden delas (#1665)
Efter delningen av datorjobben blev "mobil" det längsta jobbet: 23 min 47 s i en CI-körning av #1658 och 19 min 15 s i en tidigare, alltså mycket varierande och nära gränsen på 25 minuter. Jag mätte mobilbredden lokalt med samma urval som CI (`BREDD=mobil UTAN=kombinationsmatris`): 189 kontroller med tid, sammanlagt cirka 1 245 s. Samma kontrollgrupper som redan hör till datorjobben `plats`, `fokus` och `lang` (cirka 560 s i mobilbredd) har flyttats till ett nytt jobb, `mobilplats` ("mobil, platser, fokus och länkar"), och står i `utan` för `mobil`. Det ger cirka 680 s kvar i `mobil` och cirka 560 s i `mobilplats`. Jobbet `mobil` behåller sitt namn, så att eventuella krav på kontrollnamn inte påverkas. Tidsgränsen är oförändrad (25 minuter).

## Tillägg 2026-11-15 (kväll): regionvyn och spridningen flyttas till `plats`
"Dator, övrigt" gick åter över 25 minuter. På `main` (a398c6c) och i #1717 avbröts jobbet vid tidsgränsen, och i fyra andra pull requests samma eftermiddag tog det 19–20 minuter. Enligt CI-loggen för #1774 tar kontrollerna sammanlagt cirka 1 100 s. Regionvyn (#1641, #1642, #1644), platskortets flagga och vapen (#1160, #1619) och människans spridning (#1094, #1414, #1417, #1418, #1565), cirka 240 s, flyttas därför till datorjobbet `plats`, som tog cirka 460 s. De hör till platserna och förhistorien, som jobbet redan har. Bara datorbredden ändras; mobilbredden är oförändrad. Tidsgränsen är oförändrad (25 minuter).
