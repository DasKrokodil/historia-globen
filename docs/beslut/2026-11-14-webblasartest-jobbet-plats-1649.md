# Webbläsartestet får ett eget jobb för platser och förhistoriens reglage (#1649)

**Datum:** 2026-11-14

## Beslut
Jobbet "dator, övrigt" i `tests/jobb.json` delas: platskontrollerna (#15, #579, #1159–#1164, #1227, #1255, #1268, #1439, #1449, #1454, #1464) och kontrollerna för förhistoriens reglage (#1089, #1090, #1319–#1321) får ett eget jobb, `plats` (31 kontroller). Tidsgränsen på 25 minuter är oförändrad.

## Varför
"Dator, övrigt" tog allt som inte låg i något annat jobb och nådde 25-minutersgränsen på `main` och i #1632. Loggen visar bara resultaten i slutet, så det gick inte att se om någon kontroll föll. Jag mätte jobbet lokalt med samma urval som CI: 166 kontroller med tid, sammanlagt cirka 2 280 s, där de 31 flyttade kontrollerna står för cirka 750 s (en av dem, uppspelning vid platsens händelser, tar ensam 130 s). Med CI:s förhållande till den lokala tiden (cirka 0,65) ger det ungefär 16–17 minuter kvar i `dator` och 8–9 minuter i `plats`. `scripts/kontrolltackning.mjs` visar att varje kontroll fortfarande ligger i exakt ett jobb. Gränsen höjdes inte. Nästa gång `dator` närmar sig 20 minuter: mät på nytt och flytta nästa avgränsade grupp (till exempel Fokus eller Om källorna).
