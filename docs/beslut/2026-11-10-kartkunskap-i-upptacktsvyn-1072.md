# Källbelagd kartkunskap i upptäcktsvyn (#1072)

**Datum:** 2026-11-10

## Beslut

Upptäcktsvyn får `knowledge`: tidsindelade, källbelagda GeoJSON-ytor som visar vad en samtida karta återger. De första posterna täcker Nordamerika, Sydamerika, Afrika, Asien, Oceanien och Antarktis med separata, daterade kartkällor. Senare källor läggs som egna och snävare poster i stället för att skriva om den äldre kunskapen: Sibirien 1827, USA 1839 och södra/östra Kanada 1844.

## Varför

Dimma som enbart följer de resor och riken som redan finns i appen gör delar av en väl kartlagd värld till *Terra incognita*. Ytan är därför en försiktig karttolkning, inte nutida gräns, politisk kontroll eller ett omdöme om lokalbefolkningens kunskap.

## Berör

`data/upptackt.json`, `data/sources.json`, `js/layers/discovery.js`, `docs/datamodell.md`, `docs/arkitektur.md`, #1072.
