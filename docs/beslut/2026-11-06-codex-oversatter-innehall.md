# Codex översätter innehållet till tyska, spanska och franska (#677–#679)

**Datum:** 2026-11-06 (Rikard)

## Beslut
1. **Codex får ta issuena om att översätta innehållet till tyska (#677), spanska (#678) och franska (#679)**, trots etiketten `data`. Det är ett uttryckligt undantag från regeln att Codex och Copilot aldrig tar issues med `data`. Andra `data`-issues (nya händelser, källor, riken, bilder, faktafel) tar fortfarande bara Claude Code.
2. **Engelskan (#676) gör Claude Code**, eftersom den blir mönstret för de andra språken.
3. **Codex översätter från svenskan**, som är källtexten, och får jämföra med engelskan där den finns. Översättningen ändrar inga fakta: årtal, siffror, namn, platser och påståenden är desamma som i svenskan, och inget läggs till eller tas bort.
4. **Ordningen:** en period i taget, en pull request per period och språk. Ett språk kan börja på en period när den periodens engelska är ihopslagen, så att två pull requests inte skriver i samma fil i `data/handelser/` samtidigt. Det ersätter "ett språk görs färdigt innan nästa börjar" i punkt 5 i [2026-11-06-oversatt-samtidigt.md](2026-11-06-oversatt-samtidigt.md). De genererade filerna (`data/oversattning.json`, `data/events.json`, `data/genererat/`) skrivs om med verktygen vid ombasering och räknas inte som en krock.
5. **Granskning:** Codex-granskningen kontrollerar hela pull requesten. Claude Code granskar med stickprov: alla texter med siffror eller årtal, och minst tio andra texter per pull request. Hittas ett fel som ändrar fakta granskas hela pull requesten.

## Varför
Innehållet är cirka 40 000 ord per språk. Codex har mer tid än Claude Code, och översättningen tillför inga nya fakta, så källpolicyn gäller oförändrat genom att svenskan redan är källkontrollerad. Engelskan blir ett mönster för namn och termer.

## Berör
CLAUDE.md, AGENTS.md, #676–#679. Ändrar punkt 5 i [2026-11-06-oversatt-samtidigt.md](2026-11-06-oversatt-samtidigt.md).
