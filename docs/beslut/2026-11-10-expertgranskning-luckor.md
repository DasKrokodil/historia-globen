# Expertgranskningen letar också efter det som saknas

**Datum:** 2026-11-10

## Beslut
Expertgranskningen före release (docs/beslut/2026-11-10-expertgranskning-fore-release.md) gäller två saker: det som ändrats sedan förra releasen, och det som saknas inom expertens område. Experterna `historiker`, `forhistoriker`, `geograf` och `larare` rapporterar luckor i en egen avdelning, "Luckor (saknas)", åtskild från fynd i det ändrade. Luckor ska bygga på öppnade källor (till exempel Cliopatria, Wikidata, etablerade referenslistor) och mätningen `python3 tools/tackning.py`, aldrig på minnet. Luckor blir issues enligt de vanliga reglerna (nya funktioner och ny data med `beslut-krävs`, enkla rättelser utan fakta med `redo`) och **blockerar inte releasen**. Bara fynd i det ändrade kan blockera.

## Varför
En diff visar inte det som inte finns. Utan uppdraget granskar experterna bara det som lagts till, och slagsida eller tomma celler upptäcks aldrig. Att luckor inte blockerar håller releaserna igång: en lucka är en backlog-post, inte ett fel i det som släpps.

## Berör
`.claude/agents/historiker.md`, `forhistoriker.md`, `geograf.md`, `larare.md`, CLAUDE.md (Expertgranskning före varje release), täckningsrundan i CLAUDE.md (UX-genomgången), `tools/tackning.py`.
