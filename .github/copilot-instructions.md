# Instruktioner för GitHub Copilot – Historia-globen

Den här filen läses automatiskt av Copilot (agentläget i VS Code och Copilot på GitHub). **Reglerna finns i [CLAUDE.md](../CLAUDE.md), [AGENTS.md](../AGENTS.md) och [.orchestra/project.md](../.orchestra/project.md). Läs dem innan du ändrar något.** Vid motsägelse gäller CLAUDE.md. Här upprepas bara det viktigaste.

## Skriv till Rikard

Rikard (GitHub `DasKrokodil`) äger projektet. Andreas (`Einzbeng`) är medarbetare och kör egna agenter; bara Rikard slår ihop (beslut 2026-11-06). Rikard är projektledare, inte utvecklare. Skriv på svenska, kort och tydligt, i issues, kommentarer och pull requests: vad som ändrats, varför och hur han testar det.

## Aldrig

- **Fakta ur minnet.** Varje årtal, plats och påstående ska komma från en källa du har öppnat och som står i `data/sources.json`. Ny data är `draft` tills källan är kontrollerad. Kopiera aldrig text från Wikipedia eller andra källor.
- **Pusha till `main` eller `production`**, eller force-pusha. Allt levereras som pull request från en egen gren. Bara Rikard slår ihop.
- **Nya beroenden, ramverk eller byggsteg.** Vanliga ES-moduler, inget byggsteg, three.js 0.160.0 från jsDelivr. Fråga först.
- **Ändra arkitektur, datamodell, kategorier eller licenser** utan Rikards godkännande. Beslut skrivs som egen fil i `docs/beslut/`.
- **Hårdkoda händelser, texter eller årtal i JS.** Innehåll ligger i `data/*.json`.
- **Ändra mer än issuet kräver**, till exempel gemensamma CSS-variabler eller utseendet i övrigt.
- **Redigera `.orchestra/shared/`**, lägga hemligheter eller personuppgifter i repot, eller skapa egna issues. Hittar du något utanför issuet: skriv det som en kommentar i din pull request.

## Ta ett issue (ett issue, en ägare)

Flera agenter hos två personer arbetar parallellt (Claude Code, Codex och du). Ett issue får bara ha en ägare. Etiketterna är gemensamma för alla agenter (beslut 2026-11-06).

1. **Ta bara issues med etiketten `redo`**, eller ett issue som Rikard har pekat ut. Etiketten sätts av Claude Code (dirigenten), av Rikard eller av Andreas (eller hans Claude Code, beslut 2026-11-11). Ta dem i milstolpens ordning (lägst versionsnummer först).
2. **Ta aldrig** issues med `utanför-kod` eller `beslut-krävs`, och inte heller `data`, `faktafel`, `källkontroll`, bilder eller rikesarbete (de är Claude Codes) om Rikard inte ber om det. Undantag (beslut 2026-11-08): issues med etiketten `översättning` får du ta även när de också har `data`, så länge du bara översätter eller granskar och inte skriver eller ändrar fakta.
3. **Kontrollera att ingen annan har tagit issuet, direkt före du börjar:** etiketten `pågår` (eller en gammal `codex: pågår`, `orkester: pågår`, `copilot: pågår`), en tilldelad person, en öppen pull request som skriver `Closes #N` eller `Del av #N`, eller en gren `*/issue-<N>-*`. Är något av det sant: ta det inte, välj nästa.
4. **Ta issuet:** skriv en kommentar med konto ("Copilot (DasKrokodil) tar det här"), sätt `pågår`, ta bort `redo` och tilldela issuet personen vars konto du kör på. Läs issuet en gång till direkt efteråt: har någon annan hunnit före gäller den första kommentaren; kom du sist, backa genast (ta bort din tilldelning och skriv en kommentar).
5. **Bygg på grenen** `copilot/issue-<N>-<kort-namn>`, utgå från senaste `main`.
6. **Ta bort `pågår`** när pull requesten är öppnad (tilldelningen står kvar). Avbryter du: ta bort `pågår` och tilldelningen och sätt tillbaka `redo`. Ett `pågår` utan aktivt arbete ska alltid tas bort.
7. **Högst fyra öppna pull requests per person** (räknat på kontot du kör på; en ändring som byggs räknas). Är det redan fyra: bygg inget nytt, utan gör i stället klart dina egna (rätta efter granskning, laga röda kontroller) eller förbered nästa issue med en kommentar (vilka filer som ändras, testplan). Bygg inte färdigt på en gren i väntan på en ledig plats.
8. **Ingen tar ett issue som ändrar samma filer som en öppen pull request.** Välj ett annat, eller vänta.

## Testa innan pull request

Enligt CLAUDE.md, "Testa innan du är klar", och AGENTS.md, "Testa innan pull request":

- `bash scripts/build-site.sh` (bygger `dist/` och kör `scripts/validate-site.py`).
- `python3 -m json.tool` på ändrade JSON-filer. Händelser redigeras i `data/handelser/<period>.json`, inte i `data/events.json` (#394). Har du ändrat en fil i `data/handelser/` eller `data/empires/index.json`: kör `python3 tools/dela_data.py` och checka in `data/events.json` och `data/genererat/`.
- Ändras något som syns på sidan: kör `python3 -m http.server 8000`, kontrollera att konsolen är tom och att inget scrollar i sidled vid 400 px bredd, och kör `tests/webblasare.mjs`.
- Ändras `functions/`: `node --test 'tests/*.test.mjs'`.
- Testa beteendet, inte bara att inget kraschar: synlig text (inga råa nycklar), var tangentbordsfokus hamnar, och räkna hur många poster en dataregel slår på.

## Röd kontroll eller slut på kvot

1. **Läs loggen först:** öppna loggen för den felande kontrollen i GitHub Actions och hitta den första felande kontrollen innan du ändrar. Gissa inte.
2. **Ett försök:** rätta en gång, och bara om felet är trivialt (orsaken syns i loggen, några rader, i filer som issuet redan ändrar). Kör bara det som felade, inte hela webbläsartestet (`ENDAST="årshoppet" node tests/webblasare.mjs 8000` kör bara kontroller vars namn innehåller texten).
3. **Annars, eller är det fortfarande rött: lämna över.** Committa och pusha, skriv en överlämningsrapport som kommentar i pull requesten (vad som är klart, kontrollens namn och felraden, vad du har provat, vad du tror är orsaken, nästa steg), sätt etiketten `behöver hjälp` på pull requesten och issuet, ta bort `pågår` och gå vidare. Claude Code tar över. Försvaga eller ta aldrig bort ett test för att få det grönt.
4. **Närmar sig kvoten slut:** lämna över på samma sätt direkt. Se AGENTS.md, "Röd kontroll eller slut på tid".

## Pull request

- Rubrik och beskrivning på svenska, med `Closes #N`, vad som ändrats, varför, hur Rikard testar det och vad du inte har kunnat testa.
- Små, avgränsade pull requests, ett issue per pull request.
- Claude Code granskar pull requesten innan Rikard slår ihop. Svara på granskningen i pull requesten. Granskningar från Claude Code är order: gör det som står och svara kort i samma tråd, eller skriv en fråga om något är oklart.
