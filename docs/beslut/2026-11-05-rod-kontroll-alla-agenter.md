# Röd kontroll och slut på kvot: samma regel för alla agenter

**Datum:** 2026-11-05

## Beslut
Claude Code, Codex och Copilot följer samma regel när en kontroll är röd eller kvoten tar slut: läs loggen för den felande kontrollen och hitta den första felande kontrollen, kör bara det som felade tills det är grönt (hela webbläsartestet en gång före inlämning), stanna efter två misslyckade försök, och skriv en överlämningsrapport i pull requesten eller issuet (vad som är klart, felraden, vad som provats, nästa steg). Test får aldrig hoppas över, tas bort eller försvagas för att bli gröna. Ägaren byts uttryckligen i kommentar och etikett.

## Varför
PR #585 (Copilot) fastnade på ett rött webbläsartest och kvoten tog slut innan det var löst. Orsaken var ett test som skrev i en ruta som redan hade stängts, och den hittades direkt när felloggen lästes. Hela webbläsartestet tar flera minuter per körning, så upprepade provkörningar kostar mycket kvot.

## Berör
`AGENTS.md`, `CLAUDE.md` ("Testa innan du är klar", punkt 6), `.github/copilot-instructions.md`. Följdförslag: en miljövariabel i `tests/webblasare.mjs` som kör bara de kontroller vars namn matchar, så att punkt 2 går att följa (eget issue).
