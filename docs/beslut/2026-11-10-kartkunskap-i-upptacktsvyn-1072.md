# Källbelagd kartkunskap i upptäcktsvyn (#1072)

**Datum:** 2026-11-10

## Beslut

Upptäcktsvyn får `knowledge`: tidsindelade, källbelagda GeoJSON-ytor som visar vad en samtida karta återger. De första posterna täcker Nordamerika, Sydamerika, Afrika, Asien, Oceanien och Antarktis med separata, daterade kartkällor. Senare källor läggs som egna och snävare poster i stället för att skriva om den äldre kunskapen: Australiens kuster 1808, Sibirien 1827, Centralasien och USA 1839 samt södra/östra Kanada och ryska Fjärran östern 1844. När senare världskartor uttryckligen beskriver ett inland som spekulativt begränsas den äldre ytans inlandsdel i stället för att moderna konturer fylls.

## Varför

Dimma som enbart följer de resor och riken som redan finns i appen gör delar av en väl kartlagd värld till *Terra incognita*. Ytan är därför en försiktig karttolkning, inte nutida gräns, politisk kontroll eller ett omdöme om lokalbefolkningens kunskap.

## Berör

`data/upptackt.json`, `data/sources.json`, `js/layers/discovery.js`, `docs/datamodell.md`, `docs/arkitektur.md`, #1072.
