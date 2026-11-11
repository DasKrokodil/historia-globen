# Skåne som Plats: konturen är Skåne län ur Natural Earth admin 1 (#1159)

**Datum:** 2026-11-11

## Beslut
Skåne läggs till i `data/platser.json` med typen `landskap` och **Skåne läns** gräns som kontur, som DasKrokodil beslutade i #579 2026-11-10.
- **Källa:** Natural Earth 1:10m admin 1 (`ne_10m_admin_1_states_provinces`, version 5.1.2, `adm1_code` `SWE-3429`). Natural Earths [användarvillkor](https://www.naturalearthdata.com/about/terms-of-use/) öppnades 2026-11-11: alla versioner av vektordatan är public domain. Någon annan CC0-källa behövdes inte. Skåne finns bara i 1:10m, inte i 1:50m. Gränsen ligger i `data/platser.json` med tre decimaler (cirka 100 m).
- **Länet är inte landskapet.** Enligt svenska Wikipedia (Skåne) består Skåne län av landskapet Skåne plus Östra Karups socken i Halland. Kortet har därför en egen rad (`boundary.note`) som säger det, ovanpå raden om att linjen är dagens gräns.
- **`partOf` "Sverige"** är kontrollerat mot tre öppnade sidor (Store norske leksikon och Lex, båda bara länkade, och svenska Wikipedia) som alla beskriver Skåne som Sveriges sydligaste landskap.
- **Kustmarginalen på 20 km räcker.** Mätt 2026-11-11: av händelserna utanför linjen ligger Öresundsbron 6,5 km från den och räknas med (landfästet är i Skåne), Freden i Köpenhamn 1660 ligger 23,6 km från linjen och räknas inte med, och Freden i Roskilde 53,5 km. Marginalen till Köpenhamn är alltså knapp (3,6 km): en ny händelse i Köpenhamn eller nära Öresund kan hamna fel, och då får marginalen bli ett fält per plats.

## Berör
#579, #1159, `tools/platser_gransar.py` (stöd för `admin1`), `schemas/platser.schema.json`, `data/sources.json`, README och `THIRD-PARTY-NOTICES.md`.
