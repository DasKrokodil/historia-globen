# Webbläsartestet kan köra bara utvalda kontroller (#587)

**Datum:** 2026-11-05

## Beslut
`tests/webblasare.mjs` får miljövariabeln `ENDAST=<text>` (flera alternativ med `|`). Bara kontroller vars namn innehåller texten körs, och avsnitten "zoom och omflödning", "reducerad rörelse" och "presentationsläge" körs bara om texten matchar avsnittets namn. "sidan svarar" och "globen laddas" körs alltid eftersom de öppnar sidan, och "inga fel i konsolen" körs alltid. Matchar ingenting avslutas testet med kod 1. Utan `ENDAST` är beteendet oförändrat, och GitHub Actions kör hela sviten som förut.

## Varför
Hela testet tar flera minuter per körning. När en enda kontroll är röd kostar omkörning av allt tid och agentkvot (PR #585). Regeln "Röd kontroll" (beslut 2026-11-05) säger att agenter bara ska köra det som felade. Ett filtrerat test ger inget bevis för att hela sviten är grön: kontrollerna är inte alltid oberoende, så hela sviten körs en gång före inlämning.

## Berör
`tests/webblasare.mjs`, `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`. Hör ihop med beslutet om röd kontroll samma dag.
