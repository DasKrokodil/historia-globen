# Röd kontroll och slut på kvot: ett försök, sedan överlämning till Claude Code

**Datum:** 2026-11-05

## Beslut
Claude Code, Codex och Copilot följer samma regel när en kontroll är röd eller kvoten tar slut: läs loggen och hitta den första felande kontrollen, rätta **högst en gång** och bara om felet är trivialt (tydlig orsak, några rader, i issuets egna filer), kör bara det som felade. Annars lämnar agenten en överlämningsrapport i pull requesten, sätter etiketten `behöver hjälp` på pull requesten och issuet, tar bort sin `pågår`-etikett och går vidare till nästa issue. Claude Code letar efter `behöver hjälp` vid kökontrollen, rättar på samma gren (`orkester: pågår` medan det pågår) eller skriver en fråga till Rikard om felet kräver beslut, fakta eller arkitektur. Test får aldrig hoppas över, tas bort eller försvagas för att bli gröna.

## Varför
PR #585 (Copilot) fastnade på ett rött webbläsartest och kvoten tog slut. Orsaken hittades direkt när felloggen lästes. Webbläsartestet tar flera minuter per körning, så upprepade provkörningar kostar mycket kvot. Claude Code når GitHubs loggar och har överblick över repot, medan Codex och Copilot har små kvoter. Rikard föreslog att agenterna ska lämna rapport och gå vidare i stället för att lägga kvot på felsökning. Ett försök kvar för triviala fel, så att Claude Code inte blir flaskhals för allt.

## Berör
`AGENTS.md`, `CLAUDE.md` (Testa innan du är klar, punkt 6), `.github/copilot-instructions.md`, etiketten `behöver hjälp`. Följdförslag: #587 (kör bara utvalda webbläsarkontroller).
