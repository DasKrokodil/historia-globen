# Skåne som Plats: konturen är Skåne län ur Natural Earth admin 1 (#1159)

**Datum:** 2026-11-11 (beslutet av DasKrokodil i #579 2026-11-10; byggt och mätt 2026-11-14)

## Beslut
Skåne läggs till i `data/platser.json` med typen `landskap` och **Skåne läns** gräns som kontur, som DasKrokodil beslutade i #579 2026-11-10.
- **Källa:** Natural Earth 1:10m admin 1 (`ne_10m_admin_1_states_provinces`, version 5.1.2, `adm1_code` `SWE-3429`, "Skåne County", `iso_3166_2` SE-M). Natural Earths [användarvillkor](https://www.naturalearthdata.com/about/terms-of-use/) öppnades 2026-11-14: alla versioner av Natural Earths raster- och vektordata är public domain. Det uppfyller kravet på en fri källa (CC0 eller public domain), så någon annan källa behövdes inte. Gränsen ligger i `data/platser.json` med tre decimaler (cirka 100 m) och tas ut med `tools/platser_gransar.py` (fältet `boundary.admin1`).
- **Länet är inte landskapet.** Enligt svenska Wikipedia (Skåne, Skåne län och Östra Karups socken, öppnade 2026-11-14) består Skåne län av landskapet Skåne plus Östra Karups socken, som ligger i landskapet Halland. Kortet har därför en fast rad (`boundary.note`, fem språk) som säger det, under raden om att linjen är dagens gräns.
- **`partOf` "Sverige"** är kontrollerat mot tre öppnade sidor (svenska Wikipedia, Store norske leksikon och Lex, de två senare bara länkade) som alla beskriver Skåne som Sveriges sydligaste landskap.
- **Kustmarginalen på 20 km räcker än så länge.** Mätt 2026-11-14 med `inGeometry` och `edgeKm` ur `js/place-geo.js` mot `data/events.json`: alla 19 händelser i Skåne ligger inne i polygonen; Öresundsförbindelsen (punkten i sundet) ligger 6,5 km från linjen och räknas med. Närmast utanför ligger händelserna i Köpenhamn, 22,9–23,6 km från linjen (Rundetårn 22,9 km), och räknas inte med; Freden i Roskilde ligger 53,5 km bort. Marginalen till Köpenhamn är knapp (2,9 km): en ny händelse i Köpenhamn eller på Själlands kust nära Öresund kan hamna fel, och då får marginalen bli ett fält per plats. Webbläsartestet kontrollerar detta.

## Berör
#579, #1159, `tools/platser_gransar.py` (stöd för `admin1`), `schemas/platser.schema.json` (typen `landskap`, `boundary.admin1`, `boundary.note`), `js/focus/place.js`, `data/sources.json`, README och `THIRD-PARTY-NOTICES.md`.
