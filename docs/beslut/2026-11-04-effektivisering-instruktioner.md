# Samordnade instruktioner för Claude Code och Codex

**Datum:** 2026-11-04

## Beslut
Tre motsägelser i instruktionerna rättas (förslag 1–3 i `docs/granskningar/effektivisering-claude-codex.md`, PR #576):
1. **Läs- och köregel:** `CLAUDE.md` säger inte längre "läs hela filen" utan hänvisar till kontextkartan. Efter varje pull request görs en lätt kökontroll, inte en full; full granskning görs vid de utlösare som beslutet 2026-11-03 anger.
2. **Blind-spots-rundan** görs bara av Codex. Claude Code gör ordinarie UX-genomgång och triage, inte samma analys en gång till.
3. **Granskningsgrind för Codex pull requests:** Codex-förgranskning efter öppning, sedan Claude Codes beslut, sedan Rikards merge. Dirigentens granskning före öppning gäller orkesterns egna arbetare. Samma diff och bevis återanvänds.

## Varför
Motstridiga regler kostar tolkningsarbete, onödig läsning och dubbelgranskning. Källpolicy, fakta- och arkitekturgrindar, releasekontroll och regeln att bara Rikard mergar är oförändrade.

## Berör
CLAUDE.md, `.orchestra/project.md`.
