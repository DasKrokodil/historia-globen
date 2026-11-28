# Alla agenter får ta landskort och landskap, även Andreas Codex och Claude Code (2026-11-28)

**Datum:** 2026-11-28. **Beslut (DasKrokodil, i chatten):** Andreas Codex och Claude Code får också ta landskort, det vill säga issues om länder (`country`) och landskap (`landskap`) i `data/platser.json`.

## Beslut
1. **Landskorts- och landskapsissues får tas av alla agenter, på båda konton:** Claude Code, Codex och Copilot, på DasKrokodils konto och på Andreas (`Einzbeng`). Villkoren är de vanliga: etiketten `redo`, ingen `pågår` eller tilldelning, högst fyra öppna pull requests per person, och källpolicyn fullt ut (öppnad källa per uppgift listad i pull requesten, högst `source-checked`, omstridda frågor och omstridda gränser som kommentar enligt `docs/omstridda-granser.md`).
2. **Raden "Passar: Andreas Claude Code. Codex och Copilot tar inte det (data)"** i äldre landsissues (till exempel #1807 och #1827–#1846) **gäller inte längre.** Den skrevs före beslutet [2026-11-28-codex-tar-faktaissues](2026-11-28-codex-tar-faktaissues.md), som redan lät Codex och Copilot ta `data`, `källkontroll` och rikesarbete. Det här beslutet gör det uttryckligt för landskorten och för Andreas agenter. "Passar" är ett tips, ingen spärr.
3. **Pågående arbete rörs inte:** ett issue som redan har `pågår` eller en öppen pull request stannar hos den som tagit det (Codex tar för närvarande #1827–#1842).
4. **Filkrock:** landspull requests som bara ändrar sin egen post i `data/platser.json` krockar inte med varandra ([2026-11-16-europa-och-landskap](2026-11-16-europa-och-landskap.md)). Den som slås ihop sist ombaserar och bygger om de genererade filerna. Det gäller oavsett vem som bygger.
5. **Spridning:** beslutet om Europa 2026-11-16 och utvärderingen #1274 (rapport 2026-11-28) gäller. Pilotländerna utanför Europa (#1270–#1273) bör tas parallellt med de europeiska länderna, så att andelen Europa inte växer.

## Varför
Fler kan bygga länder samtidigt, och Andreas har lediga agenter. Källpolicyn och granskningen i batch före release är kvar.

## Berör
CLAUDE.md ("Etiketter och tak"), AGENTS.md, `docs/referens/arbetssatt.md`, `docs/referens/codex-regler.md`.
