# Taggen "framsteg" och vyn Framsteg (#555)

**Datum:** 2026-11-03 (byggt 2026-11-06)

## Beslut
Händelser får ett valfritt fält `tags`, en lista med taggar tvärs över kategorierna. Den enda tillåtna taggen är än så länge `framsteg` (enum i `schemas/event.schema.json`). Lager får en färdig vy **Framsteg** (`data/vyer.json`, vyn har `"tag": "framsteg"`) som visar bara händelser med taggen, på globen, i Samtidigt och som prickar under tidslinjen. Faktarutan visar en liten märkning "Framsteg" som fälls ut med förklaringen *"Händelser som de flesta ser som en förbättring för människors liv. Många framsteg hade också baksidor."* Märkningen är en tunn ram i kortets accentfärg utan fyllning, så att den inte ser ut som ett betyg eller en kategorifärg. Har ingen händelse taggen visar vyn ett tydligt tomt läge. Samtidigt-listans filter ändras inte.

Taggen sätts bara när källan på händelsen själv beskriver den som en förbättring, och aldrig på något omstritt (ett framsteg för en grupp som var en förlust för en annan). Inga händelser skrivs bara för att få ihop vyn. Det första steget bygger bara mekanismen; ingen riktig händelse taggas.

## Varför
429 av 490 händelser var krig när beslutet togs, och Rikard vill att det går att hitta det som blev bättre. En egen kategori fungerar inte, eftersom en händelse bara har en kategori: en rösträtt, ett vaccin och en månlandning hör till olika kategorier men kan alla vara framsteg. En lista med taggar gör att fler taggar kan läggas till senare utan ny struktur.

## Berör
`schemas/event.schema.json`, `data/vyer.json`, `js/state.js` (`tag`, `setTag`), `js/ui/layers.js`, `js/layers/events.js` (`hasTag`), `js/ui/panel.js`, `js/main.js`, `js/controllers/playback.js`, `css/style.css`, `tests/webblasare.mjs`, docs/datamodell.md och docs/arkitektur.md.
