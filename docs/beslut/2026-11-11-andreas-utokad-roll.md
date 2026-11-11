# Andreas får en utökad roll: reglerna följer risk, inte konto

**Datum:** 2026-11-11

## Beslut
DasKrokodil sa ja till förslag 1–4 i chatten 2026-11-11. Samarbetet med Einzbeng (Andreas) har gått bra, så begränsningarna som var skrivna efter person skrivs om efter vad som är riskabelt. Det här **ersätter delar av** [2026-11-09-undantag-for-parallellt-arbete.md](2026-11-09-undantag-for-parallellt-arbete.md) (punkt 3 och 4) och meningen "arbetare som inte sätter `redo`" i beslutet 2026-11-06.

1. **Andreas och hans Claude Code får sätta `redo`.** Villkoren är desamma som för dirigenten: issuet är tydligt avgränsat, saknar olösta beslut, saknar `beslut-krävs` och `utanför-kod`, och krockar inte med öppna pull requests eller pågående arbete. `redo` sätts bara i den milstolpe som DasKrokodil har öppnat för arbete. Dirigenten stickprovskollar vid kökontrollen och tar bort `redo` med en kommentar om något inte stämmer. Att öppna eller stänga en milstolpe och att ordna milstolparna är fortsatt DasKrokodils.
2. **Samma regler för en agent oavsett konto.** Andreas Claude Code får ta alla `redo`-issues, även `data`, `faktafel`, `källkontroll`, riken och bilder, med källpolicyn fullt ut. Andreas Codex och Copilot följer samma begränsningar som Rikards Codex och Copilot (inte fakta, källor, riken eller bilder; översättningsundantaget 2026-11-08 gäller). Gränsen på fyra öppna pull requests räknas per konto, som förut.
3. **Andreas Claude Code skapar issues enligt samma regler som Rikards** (CLAUDE.md, "Claude Code skapar egna issues"): sök dubbletter först; buggar och små förbättringar direkt; funktioner, utseende, ny data och allt som kräver beslut med `beslut-krävs` i milstolpen Senare och med avsnittet "Rekommendation till DasKrokodil". Issues utan beslut och utan historiska fakta får `redo` enligt punkt 1. Andreas agenter får fortfarande bara förbereda, inte bygga, `beslut-krävs`-issues. Codex och Copilot skapar inga egna issues.
4. **Korsgranskning.** Pull requests får granskas av vilken Claude Code eller Codex som helst som inte byggde dem, oavsett konto: Codex-granskningen och "Klar för Claude Code-granskning". Fakta, data och källor granskas fortfarande fullt, nu av en Claude Code som inte byggde pull requesten. Granskningen kvitteras med en kommentar (beslut 2026-11-07). Dirigenten kan alltid ta över en granskning.

## Det som är oförändrat
Bara DasKrokodil slår ihop pull requests, beslutar (arkitektur, kategorier, datakällor med ny licens, utseende, versionsplan, `beslut-krävs`), publicerar, släpper versioner och sköter hemligheter. Orkestern körs som dirigent bara på DasKrokodils konto. Källpolicyn, översättningsregeln och riskbaserad granskning gäller alla.

## Skyddsnät
Etikettkontrollen (#588) fångar dubbeltagna och felsatta etiketter. Beslutet prövas efter två veckor (2026-11-25): lätta mer om pull requests oftast går igenom utan arbetsorder, stram åt om det blir krockar, felsatta `redo` eller sakfel som granskningen missade.

## Berör
CLAUDE.md (Två personer, flera agenter; Etiketterna `redo` och `pågår`), AGENTS.md (inledningen, Skapa egna issues, Ta ett issue), .github/copilot-instructions.md, .orchestra/project.md.
