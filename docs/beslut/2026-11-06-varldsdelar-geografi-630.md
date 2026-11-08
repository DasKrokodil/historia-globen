# Världsdelarna följer geografin: Mikronesien och Rapa Nui räknas till Oceanien

**Datum:** 2026-11-06

## Beslut
När en plats delas in i världsdel (`region()` i `js/model.js` och samma indelning i `tools/tackningsrapport.py`) går geografin före politiken. Mikronesien (till exempel Guam, Marianerna och Pohnpei) och Rapa Nui räknas till Oceanien, fast Rapa Nui hör till Chile.

## Varför
Rikard 2026-11-06 i #630: geografin är överordnad andra regler; hör en plats geografiskt till Oceanien och räknar sig själv dit, ska den vara där. Indelningen påverkar Samtidigt-panelen och täckningsmåttet per världsdel.

## Berör
`js/model.js`, `tools/tackningsrapport.py`, `tests/tackning-test.py`, #630.
