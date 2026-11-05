# Händelser redigeras i en fil per period (#394)

**Datum:** 2026-11-05 (bygger på Rikards beslut 2026-11-01 i #394)

## Beslut
Händelserna redigeras i `data/handelser/<period>.json`, en fil per period efter startåret (`fkr`, `1-1499`, `1500-1799`, `1800-1899`, `1900-1945`, `1946-`, samma perioder som `data/genererat/`). `tools/dela_data.py` bygger `data/events.json` och `data/genererat/` ur dem, och `data/events.json` redigeras inte längre för hand. Piloten omfattar alla perioder (Rikards val 2026-11-05), inte bara en period, så att det bara finns ett ställe att redigera. Källorna (`data/sources.json`) ligger kvar i en fil.

## Varför
Inför massimporten (#61) och kärnhändelserna (#452) blir en enda stor `events.json` en krockzon när flera arbetar samtidigt. Med en fil per period krockar bara ändringar i samma period, och en pull request blir lättare att läsa. Allt som läser `data/events.json` (formulärets serverfunktion, webbläsartesterna, licensmanifesten, täckningsrapporten) fungerar oförändrat eftersom filen fortfarande finns, nu byggd. Inget byggsteg för sidan: de byggda filerna checkas in som förut. Går piloten dåligt slås filerna ihop igen.

## Berör
`data/handelser/`, `data/events.json`, `tools/dela_data.py`, `tools/bilder_in.py`, `scripts/validate-site.py`, `tests/dela-data-test.py`, `.github/workflows/validate-site.yml`, CLAUDE.md, AGENTS.md, `.github/copilot-instructions.md`, `docs/datamodell.md`, `docs/arkitektur.md`, `docs/kallor.md`. Följer beslutet 2026-11-01 (alternativ 3 nu, pilot med alternativ 2 inför #61) och förutsätter JSON Schema (#391). Blir parallella, oberoende redaktörer det normala prövas en fil per händelse i stället.
