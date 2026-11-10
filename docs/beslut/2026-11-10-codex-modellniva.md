# Modellnivå för Codex efter uppgift

**Datum:** 2026-11-10

## Beslut
Codex väljer modellnivå efter uppgiften, på samma sätt som Claude Code (CLAUDE.md, "Modellnivå för Claude Code"):

| Uppgift | Nivå |
|---|---|
| Codex Luna: köplaner, synpunkter, förberedelse | Mindre eller snabb modell, medelstor resonering |
| Codex Terra: vanliga UI-, CSS-, test- och dokumentationsissues och små rättningar | Standardmodell, medelstor resonering |
| Codex Terra: större ändringar i tidslinje, rendering eller tillstånd | Starkaste modellen, hög resonering |
| Codex-granskning av en pull request | Samma nivå som bygget, aldrig lägre |
| Issues med `översättning` | Standardmodell; årtal, siffror, namn och platser kontrolleras mot svenskan |

Byt nivå när uppgiften kräver djupare bedömning, inte bara för att den är lång. Arkitektur, datamodell och beslut som påverkar flera issues avgörs först av Claude Code (Opus); Codex bygger när ordern är klar. Exakta modellnamn står inte i repot: de väljs i Codex egna inställningar och kan bytas utan nytt beslut.

## Varför
Roller (Luna och Terra) finns sedan 2026-11-01, men inget sa vilken modellnivå som passar vilken uppgift. En svagare granskare riskerar att missa fel som en starkare byggare gör, och dyr resonering på enkla issues kostar tokens utan vinst.

## Berör
AGENTS.md (Roller och signal). Ändrar inga etiketter, ingen arbetsfördelning och ingen datamodell.
