# Tryck på en plats: konturen är en genväg, det som syns går att trycka på (#1161)

**Datum:** 2026-11-13

## Beslut
Väg A i beslutet [2026-11-10-platser-och-typ-i-data.md](2026-11-10-platser-och-typ-i-data.md) byggs som följer:

1. **Det som syns är det som går att trycka på.** Prickade konturer runt platser med kort syns, och ett tryck på dem fungerar, bara i vanligt läge (inte i Fokus, tur, lektion eller intervall) och bara inzoomat: på globen vid samma nära zoom som religionernas namn, i Platt vy från kartzoom 1,2. Inget val i Lager.
2. **Trycket använder dagens gräns utan kustmarginalen.** Kustmarginalen på 20 km gäller bara vilka händelser som hör till en plats, inte var man kan trycka. Ligger punkten inom flera platser väljs den minsta, så att ett landskap går före sitt land när fler platser finns.
3. **Allt annat har företräde och är oförändrat:** en händelsemarkör, en väg eller en religionsruta som träffas hanteras som förut, och platstrycket kommer bara hit när ingen av dem träffades. Med religionslagret på kan alltså en plats under ett religionsområde nås bara via Sök och följ.
4. **Lektionsläget och turer:** inget platstryck, eftersom ett fokus skulle avsluta turen (MODE_RULES) eller bryta lektionens låsning. Lektionsläget får eget issue, som beslutet 2026-11-10 säger.
5. **Konturen är bara en genväg.** Sök och följ → Platser är huvudingången. Tangentbordets motsvarighet är Enter på globen eller kartan, som följer platsen i mitten av vyn, och statusraden säger vilken plats med kort som ligger i mitten efter att man har flyttat vyn med tangenterna.
6. **Knappen "Visa i Platt karta"** i platskortet byter vy och ramar in platsen utan att kameran på globen flyger och utan eget läge. Inramningen räknas ur platsens gräns (longituderna uppvikta kring platsens mitt), inte ur ett fält i datan.
7. **På touch väntar ett platstryck 380 ms** så att första trycket i ett dubbeltryck som zoomar inte startar ett fokus.

## Varför
Konturen är en ingång som måste synas för att upptäckas, men den får inte störa en besökare som bara vill läsa globen: därför bara inzoomat och bara när inget annat följs. Att trycket följer det som ritas gör det lätt att förstå, också när 1:50m-kusten är grov (Nuuk ligger 1 km utanför linjen). Tangentbord och skärmläsare får samma möjlighet genom Enter och uppläsningen, och ingen ingång försvinner.

## Berör
#1161, #579, `js/controllers/places.js`, `js/layers/places.js`, `js/place-geo.js`, `js/controllers/render.js`, `js/ui/flatmap.js`, `docs/arkitektur.md`, `docs/produkt/13-ordlista.md`.
