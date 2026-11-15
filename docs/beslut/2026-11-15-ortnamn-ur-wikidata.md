# Regionvyn: saknade orter får namn ur Wikidata (#1676)

**Datum:** 2026-11-15 (DasKrokodil i chatten: ja till Wikidata som källa för saknade orter, bara för pilotplatserna och som eget issue)

## Beslut (byggt)
- Orter som händelser på en plats pekar på men som Natural Earth saknar får namn och koordinat ur **Wikidata (CC0)**. Först gjort för Skåne (Lund, Barum) och Danmark (Ribe, Jelling, Egtved, Vordingborg, Rødding, Dybbøl, Billund, Gallehus).
- Orterna står för hand i `data/ortnamn-komplettering.json` (publiceras inte) med Q-id, etiketter på fem språk, koordinat och de händelser de jämfördes med. Ligger en ort mer än 5 km (regionvyns `NAME_KM`) från händelsens egen punkt läggs den inte till. Saknas en etikett används engelska, och språket står i `fallback`.
- Bara bebyggelse tas med, inte fornlämningar, mossar eller hav (Uppåkra är i Wikidata en fornlämningsplats och står inte i listan).
- `tools/ortnamn.py` lägger orterna sist i `data/ortnamn/<plats>.json` med `id` `wd-<Q-id>`, `rank` 10, `source` och `wikidata`, så att det syns att namnet inte kommer från Natural Earth.

## Skäl
Natural Earth saknar små orter som är viktiga i händelserna. Wikidata är CC0, används redan som andra källa, och etiketterna finns på alla fem språk för de flesta orter.

## Att veta
En orts prick får inte ligga under en markör (`placeNames` i `js/region-markers.js`), och orterna här ligger där händelserna är. De ritas därför inte som egna namn i dag; de ger högarna deras namn (`pileName`). Om en ort under en enskild markör ska få ett eget namn är en fråga om utseende och avgörs separat.

## Berör
`data/ortnamn-komplettering.json`, `data/ortnamn/skane.json`, `data/ortnamn/danmark.json`, `tools/ortnamn.py`, `schemas/ortnamn.schema.json`, `scripts/validate-site.py`, `tests/regionvy-markorer.test.mjs`, README.md, THIRD-PARTY-NOTICES.md, docs/datamodell.md, docs/arkitektur.md.
