# GitHub Copilot som tredje agent, ett issue en ägare

**Datum:** 2026-11-05

## Beslut
GitHub Copilot (agentläget i VS Code) får ta issues vid sidan av Codex och Claude Code. Två nya etiketter: `copilot: redo` (sätts av Claude Code) och `copilot: pågår` (sätts av Copilot). Instruktionerna ligger i `.github/copilot-instructions.md`. **Ett issue har högst en ägare:** `orkester: pågår`, `codex: pågår` och `copilot: pågår` utesluter varandra, `codex: redo` och `copilot: redo` får inte sitta på samma issue, och varje agent kontrollerar både före och direkt efter att den tar ett issue att ingen annan hunnit före. Grenar heter `copilot/issue-<N>-<namn>`. Högst fyra öppna pull requests räknas för alla agenter tillsammans.

## Varför
Rikard kopplar in Copilot för att öka takten. Utan en gemensam regel kan två agenter ta samma issue och göra dubbelarbete eller krocka i samma filer. Källpolicy, arkitekturgrindar, granskning och regeln att bara Rikard slår ihop är oförändrade.

## Berör
`AGENTS.md`, `CLAUDE.md`, `.orchestra/project.md`, `.github/copilot-instructions.md`, etiketterna `copilot: redo` och `copilot: pågår`. Bygger på besluten om Codex 2026-10-31 och 2026-11-02.
