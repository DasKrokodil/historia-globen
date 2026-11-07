# Granskningar kvitteras alltid med en kommentar

**Datum:** 2026-11-07 (Rikard)

## Beslut
1. När en agent får i uppdrag att granska (en pull request, ett issue eller en fil) ska den lämna en kommentar som säger att granskningen är gjord, också när den inte hittade något: "Codex-granskning: godkänd" eller "synpunkter" (motsvarande för Copilot och Claude Code).
2. Har agenten skapat en fil (rapport, lista, skript, skärmbild) skriver kommentaren var den ligger: sökväg, gren och pull request. Alternativt lämnas synpunkterna som kommentarer direkt i pull requesten, med en sammanfattande kommentar.
3. En granskning utan kommentar räknas som inte gjord.
4. Claude Code skriver kravet i varje granskningsorder.

## Varför
Granskningar som bara finns i en agents arbetskatalog eller i ett chattsvar går inte att se i kön, och dirigenten kan inte skilja "granskad utan fynd" från "inte granskad". En kommentar gör granskningen synlig för Rikard, Andreas och alla agenter.

## Berör
`AGENTS.md` (Granskningar), `CLAUDE.md` (Arbetssätt), kökontrollen och granskningsorder från Claude Code.
