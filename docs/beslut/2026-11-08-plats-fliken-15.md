# "Vad hände här?" blir fliken Plats i Sök och följ (#15)

Datum: 2026-11-08 (beslutet fattades av DasKrokodil 2026-11-06 som kommentar på #15; här skrivet som beslutsfil).

**Beslut:** "Vad hände här?" byggs som en flik **Plats** i Sök och följ. Man söker en plats ur platsnamnen som redan finns i händelsernas `place`, och listan visar de synliga händelserna inom 300 km (storcirkelavstånd), äldst först. Händelser med ungefärlig plats (`locationPrecision`) tas med och märks. Ingen geokodning, inget externt beroende och ingen ny data. Klick direkt på globen väntar, eftersom det krockar med klick på markörerna och ska delas med regionkorten (#579).

**Skäl:** återanvänder sökrutan och faktarutan som redan finns och lägger ingen ny lagertyp. 300 km är en enkel, förklarlig gräns som går att räkna fram ur datan. Att bara platser som finns i datan går att hitta står öppet under sökrutan.

**Logiken** ligger i `js/place-search.js` utan webbläsarberoenden, med nodtest. Intervalläget (#569) använder inte platsvalet än.
