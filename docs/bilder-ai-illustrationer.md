# AI-illustrationer med ChatGPT: steg för steg

Gäller när en händelse saknar en lämplig fri bild ([referens/bilder.md](referens/bilder.md), punkt 1–2). **Agenter (Claude Code, Codex, Copilot) kan inte generera bilder.** Ett steg görs alltid av en människa: DasKrokodil eller Andreas, med ChatGPT (beslut 2026-11-16). Bildverktyg och nycklar ligger aldrig i repot.

Rutin för riktiga bilder (Commons och loc.gov, anropsregler, licenskontroll): [bilder-riktiga.md](bilder-riktiga.md).

## Agentens del (innan en människa tar över)
1. Sök först efter en riktig bild på Wikimedia Commons eller loc.gov. Hittas ingen lämplig: skriv händelsen och skälet i `docs/bilder-saknas.md`.
2. Skriv prompten: `python3 tools/bildpromptar.py --out docs/bildpromptar-<issue-nummer>.md <händelse-id> <händelse-id> …`, checka in filen och skriv i issuet:
   **"Väntar på AI-illustration (görs av en människa i ChatGPT): <id, id, …>. Prompter: docs/bildpromptar-<N>.md, gren <gren>."**
3. Sätt inte `pågår` på väntan, och skriv "Del av #N" i pull requesten, inte "Closes". Fortsätt med de händelser som har riktiga bilder.

## Människans del (DasKrokodil eller Andreas, i ChatGPT)
1. Öppna prompten för händelsen i `docs/bildpromptar-<N>.md` och klistra in **hela** texten oförändrad i ChatGPT (bildgenerering). Format: 4:3 liggande.
2. Kontrollera bilden innan du sparar den:
   - Ingen läsbar text eller påhittade bokstäver, inga logotyper.
   - Ser inte ut som ett foto eller ett äkta dokument. Den ska tydligt vara en illustration.
   - Inga närbilder av riktiga personer, inget blod, inga döda.
   - Inga detaljer som händelsens källa inte stöder.
   - Profeten Muhammed avbildas aldrig. För människoarter inga ansiktsrekonstruktioner (beslutet 2026-11-14).
   - Passar bilden inte: generera om, högst 3 försök. Ändra inte prompten utan att skriva det i issuet.
3. Spara bilden som `images/incoming/<händelse-id>.png` (filnamnet är händelsens id).
4. Lägg en post i `images/incoming/bildlogg.json` (en lista, följ de befintliga posterna):
   ```json
   {
     "id": "<händelse-id>",
     "file": "<händelse-id>.png",
     "kind": "illustration",
     "style": "<stilens namn i data/styles.json, som prompten anger>",
     "caption": { "sv": "Illustration i stil med <stilen>, inte en historisk bild." },
     "credit": "AI-genererad med ChatGPT, <datum ÅÅÅÅ-MM-DD>",
     "prompt": "<exakt den prompt du använde>"
   }
   ```
5. Kör `python3 tools/bilder_in.py`, `python3 tools/dela_data.py` och `python3 tools/license_manifests.py`, och översätt bildtexten till en, de, es och fr (`python3 tools/oversattning.py`). Kör `node --test 'tests/*.test.mjs'`.
6. Checka in i samma gren och skriv i issuet vilka bilder som är gjorda. Be en Claude Code som inte byggde ändringen att granska bildtexten och motivet (illustrationen ska vara märkt).

Säg till i issuet om du fastnar. Gör ingen illustration för Auschwitz eller atombomberna utan ett ja från DasKrokodil (se #1874).
