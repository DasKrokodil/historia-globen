# Riktiga bilder i små bitar, och ett undantag för agenterna

**Datum:** 2026-11-20 (DasKrokodil i chatten)

## Beslut
1. **Riktiga bilder är målet.** På sikt ska händelserna ha riktiga bilder, inte illustrationer, där det finns en. Illustrationer (som en människa gör med ChatGPT, beslut 2026-11-16) är en reserv för det som saknar riktig bild.
2. **Ny löpande milstolpe "Löpande: Bilder: riktiga bilder (ingen release)"** (nummer 51). Den delar upp de 1 181 händelser som saknar bild (mätt på `main` 2026-11-20, utan de 16 som redan är prövade i [docs/bilder-saknas.md](../bilder-saknas.md)) i 61 issues om högst 20 händelser: Asien 18, Europa 16, Amerika 12, Afrika 9, Oceanien och övrigt 6, sorterade efter år. Alla har `redo` och ligger under samlingsissuet #299. Varje issue listar händelse-id och reglerna.
3. **Undantag från regeln att Codex och Copilot aldrig tar issues med `data` eller bilder.** Andreas och hans agenter, även Codex och Copilot, får ta issues i den milstolpen, på tre villkor:
   - bara **riktiga bilder**: agenter genererar aldrig bilder, och de hittar inte på källor;
   - bara om agenten kan lägga in `.webp`-filer i en gren **med git** (Codex hade tidigare problem med binära filer via GitHub-automation); annars tas issuet inte;
   - fakta, licenser och källor granskas fullt av en Claude Code som inte byggde ändringen.
   Undantaget gäller **bara den milstolpen**. Issues utanför den, och andra bildissues, följer reglerna som förut.
4. **Release 6.5.0 kräver inga fler bilder.** Inga händelser bedöms som extremt viktiga för releasen, utöver de två tursteg som väntar på en illustration av en människa (`al-bakri-beskriver-ghana` och `slaget-vid-tondibi`, #1875). De övriga bildissuesen (#772, #773, #299) flyttas till den nya milstolpen.
5. Andra undantag av samma slag (`översättning`, beslut 2026-11-08) gäller som förut.

## Varför
Bildarbetet är stort (över tusen händelser) och passar för små, parallella bitar som många kan ta utan att blockera en release. Riktiga bilder med egen licens är mer pålitliga än illustrationer och följer bildreglerna i CLAUDE.md. Rädslan för fel i fakta och licenser hanteras av korsgranskningen, och kravet på git för binära filer undviker de fel som uppstod tidigare.

## Berör
[CLAUDE.md](../../CLAUDE.md) (Etiketterna `redo` och `pågår` punkt 1, Löpande spår, Bilder), [AGENTS.md](../../AGENTS.md) (Ta ett issue).
