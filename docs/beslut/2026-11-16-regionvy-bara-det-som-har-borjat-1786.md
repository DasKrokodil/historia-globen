# Regionvyn visar bara det som har börjat vid årets tid (#1786)

Datum: 2026-11-16. Beslut av DasKrokodil i #1786 ("Gör enligt rekommendationerna": alternativ A och förslagen på svar).

## Beslut

1. **Kartan följer året.** Markörerna, högarna och brickan i regionvyn (Platt vy för Skåne och Danmark, globen för Aotearoa och Grönland) visar bara händelser som har börjat vid året: `Math.floor(start) <= Math.floor(år)` (`startedBy()` i `js/region-markers.js`). Året är `state.areaYear`, alltså slutåret i ett tidsintervall, annars årets värde.
2. **Listan behåller hela historien.** "Händelser på platsen" i kortet visar alla händelser, och numret på en markör är fortfarande radens nummer i listan. Numren på kartan kan därför ha luckor (1, 2, 5, 6 …) tills det som saknas har börjat. Rader som kartan inte visar än har inget nummer.
3. **Tom karta.** Har ingen händelse börjat står raden "Inga händelser har börjat här än. Nästa: {händelse}." i regionrutan (`regionView.next`, fem språk), också i mobil där rutans övriga text är dold. Händelsen är den första som inte har börjat, skriven som Fokus gör ("år · titel", `nextEvent()`).
4. **Samma regel i Platt vy och på globen**, eftersom de delar `controllers/region.js`.
5. Statusraden räknar de visade händelserna ("Regionvy: Skåne, 4 händelser, …").

## Följder att känna till

- Året flyttas när en händelse öppnas (som överallt på sidan). Öppnar man en tidig händelse från kartan försvinner därför de senare markörerna medan faktarutan står; listan har dem kvar.
- I Fokus på en plats stannar året inom platsens händelser (till exempel 7000 f.Kr.–2000 för Skåne), så den första händelsen har alltid börjat där. Raden "Nästa" syns därför bara när året ligger före den första händelsen på annat sätt (ett tidsintervall eller en länk).
- Regionvyn räknar om markörerna bara när det som syns ändras, inte för varje år under uppspelning.

## Avvisade alternativ

B (bara det som ligger nära året, som Samtidigt): regionvyn blir nästan alltid tom och ger ingen känsla av platsens historia. C (dämpa framtiden): löser inte det besökaren reagerade på.
