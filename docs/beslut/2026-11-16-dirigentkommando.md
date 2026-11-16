# Dirigentmönstret sparas som kommandot /dirigent

2026-11-16

**Beslut (DasKrokodil):** Prompten för en dirigent som kör en milstolpe eller en lista issues, med en underagent per issue och en
grenkö i stället för att vänta på plats för PR, sparas i repot som `.claude/commands/dirigent.md` och kan återanvändas med
`/dirigent <milstolpe eller issues> [modell]`.

**Innehåll i korthet:** steg 0 (läs läget, ta bara `redo`-issues och uttryckligen nämnda), modell per arbetstyp, en
fristående order till en underagent per issue (worktree), filkrockar och "en datauppgift åt gången", grenkö och
PR-regler, skärmbilder enligt beslutet 2026-11-14, AI-illustrationer av en människa (beslutet 2026-11-16), röd kontroll,
och en rapport som alltid slutar med raderna "Nya issues skapade: …" och "Kvar att ta: …".

**Motivering:** Mönstret har fungerat dagar i rad i flera trådar. Att det bara fanns i chatten gjorde att varje ny tråd
skrevs om, med risk för att regler (grenkö, skärmbilder, rapportens sista rader) föll bort. `/orkester` (en
dirigent per pass) och `/milstolpe` (planering före start) finns kvar och kompletteras av `/dirigent`.
