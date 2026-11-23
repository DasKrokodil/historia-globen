# Färre granskningar och lättare CI för att spara tokens (2026-11-23)

**Beslut (DasKrokodil, 2026-11-23).** Granskning på granskning kostar mer än den ger. Vi släpper igenom och rättar efteråt.

## Bakgrund

Varje PR granskades av byggaren, av en separat Codex-granskning, av dirigenten och av en korsgranskare, och före release granskade tio experter allt en gång till. CI körde 11 Chromium-jobb per push (33 med Firefox och WebKit vid release), och ostadiga kontroller gjorde att många körningar blev röda och krävde nya omgångar. Instruktionsfilerna (CLAUDE.md, AGENTS.md och .orchestra/project.md, ungefär 130 kB) lästes av varje agent. DasKrokodil slår ändå ihop utan korsgranskning.

## Ändringar

1. **Korsgranskningen stryks.** Ingen annan agent behöver granska en PR före ihopslagning. Det gäller även Andreas PR:er. Den separata Codex-granskningen före dirigenten, kvitteringskommentarerna ("Codex-granskning: godkänd"), "Klar för Claude Code-granskning" och reglerna om omedelbar handoff och kökontroll efter varje PR upphör. Byggaren kör själv sina tester, öppnar PR:en och skriver en kort beskrivning. DasKrokodil slår ihop.
2. **Granskning efter ihopslagning är standard.** Fakta, data och källor granskas inte i varje PR utan i batch före release av en `historiker` (och `geograf` och `forhistoriker` vid behov) över allt som ändrats sedan förra releasen. Fynden rättas i nästa x.x.1. Källpolicyn gäller oförändrad för byggaren (aldrig fakta ur minnet, `source-checked` bara efter öppnad källa). Före ihopslagning granskas fortfarande, av dirigenten och bara på begäran: arkitektur, säkerhet och `functions/`.
3. **Expertgranskningen före release slimmas** från tio till högst tre pass: (a) `historiker`, med `geograf` och `forhistoriker` bara om platser, riken eller förhistoria ändrats; (b) `ux-tillganglighet`, bara om gränssnittet ändrats; (c) ett enda översättningspass (en sprak-agent) bara om texter ändrats; `tools/oversattning.py` spärrar redan oöversatt text. `larare` och `arkitekt` körs bara på begäran.
4. **CI skärs ner.** (a) Vanliga PR:er kör Chromium i färre och större jobb; (b) Firefox och WebKit körs inte längre som krav i release-PR utan manuellt eller veckovis (`workflow_dispatch` och `schedule`), eller med etiketten `alla-webbläsare`; (c) ostadiga kontroller som samlats i #1174 flyttas till ett eget jobb som inte stoppar ihopslagning tills de är rättade, så att rött betyder något trasigt; (d) ingen felsöker ett rött jobb mer än en gång (regeln i CLAUDE.md, Testa punkt 6, gäller). Själva ändringen av workflow-filen och `tests/jobb.json` görs i en egen PR.
5. **Instruktionerna kortas.** CLAUDE.md, AGENTS.md och .orchestra/project.md kortas till kärnor med länkar (mål cirka 15 kB för CLAUDE.md); filstruktur, versionsplan och beslutsförklaringar flyttas till docs/. Görs som ett eget issue med Sonnet high.
6. **Dirigenten förenklas.** Kortare promptar (en rad per spår), kökontroll per batch i stället för efter varje PR, `redo`-triage en gång per dag och inga utskrivna dubbelversioner av promptar.

## Följder

Fler fel kommer in på main och hittas vid release. Det accepteras. Beslutet ersätter beslut 2026-11-02 (Codex-granskning, flödesreglerna), 2026-11-07 (granskningar kvitteras), 2026-11-10 (expertgranskning före release, delvis; Codex-granskning-kommentar) och korsgranskningen i beslutet 2026-11-11 (punkt 4). Prövas efter två releaser: hur många faktafel hittades först vid release, och hur många tokens sparades.
