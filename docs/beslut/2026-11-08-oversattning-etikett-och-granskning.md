# Etiketten `översättning` och ord-för-ord-granskning av engelskan (#63, #896–#901)

**Datum:** 2026-11-08 (Rikard godkände förslaget samma dag)

## Beslut
1. En ny etikett **`översättning`** markerar issues som gäller att översätta eller granska en översättning. **Codex och Copilot får ta dem även när de också har `data`**, så länge ingen fakta skrivs eller ändras. Ett sakfel de hittar i svenskan blir ett eget issue med `faktafel` och `källkontroll` för Claude Code. Regeln om att Codex och Copilot inte tar `data` gäller i övrigt oförändrad.
2. **Ord-för-ord-granskning av engelskan** (#897–#901): en annan agent än den som översatte (Codex, i praktiken Andreas) granskar hela engelskan i fem delar: gränssnittet, händelser före 1500, 1500–1899, 1900 och framåt, samt övrigt innehåll. Granskaren **ändrar inga filer** och rapporterar i en tabell (fil, nyckel, svenska, engelska, problem, förslag, nivå **Fel** eller **Förbättring**). Claude Code rättar **Fel**, kör `tools/oversattning.py` och `tools/dela_data.py` och slutgranskar. Granskningen kvitteras med en kommentar (beslutet 2026-11-07).
3. En **ordlista för engelska och tyska** (#896) skrivs först, ur den användning som redan finns i datan, i `docs/ordlista-oversattning.md`.
4. Tyska, spanska och franska får motsvarande granskning när deras innehåll är översatt; gränssnittet granskas i #674.

## Varför
Ingen översättning är ord-för-ord-granskad i dag (`reviewedBy: null` för alla språk i `data/ui/sprak.json`), och engelskan är den enda med fullt innehåll. Översättningsissuena (cirka 40) låg hos Claude Code på grund av etikettregeln, vilket är den dyraste vägen för ren textarbete. Granskningen skiljs från rättningen så att Codex kan granska mycket text billigt och Claude Code bara rättar det som är fel. Faktakravet står kvar: ingen agent skriver eller ändrar historiska uppgifter i en översättning.

## Berör
CLAUDE.md (redo-regeln), AGENTS.md, `.github/copilot-instructions.md`, GitHub-etiketten `översättning` (ska läggas på #776–#835 och #896–#901 av dirigenten när den här PR:en är ihopslagen). Bygger på [2026-11-06-oversatt-samtidigt.md](2026-11-06-oversatt-samtidigt.md) och [2026-11-07-oversattningsgranskning-vid-release.md](2026-11-07-oversattningsgranskning-vid-release.md).
