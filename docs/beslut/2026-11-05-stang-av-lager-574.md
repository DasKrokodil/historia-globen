# Stäng av alla lager (#574)

**Datum:** 2026-11-05

## Beslut
Lägg till snabbvalen "Stäng av alla" och "Återställ" under "Anpassa själv", samt vyn "Bara kartan". Samtidigt-listan erbjuder en knapp som slår på Händelser igen när händelselagret är avstängt.

## Varför
Det ska gå snabbt att visa bara grundkartan utan att besökaren tappar vägen tillbaka till standardvyn eller händelselistan.

## Berör
`data/vyer.json`, Lager-menyn, Samtidigt-listan och deras webbläsartester. Hänger ihop med #357 och #380.
