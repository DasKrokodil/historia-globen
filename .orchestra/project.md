# Orkesterns projektpolicy: Historia-globen

Inställningar för [dirigenten och orkestern](shared/README.md) i det här projektet (#145). Gemensamma regler står i
[shared/ORCHESTRA.md](shared/ORCHESTRA.md). Projektets regler här och i [CLAUDE.md](../CLAUDE.md) går före de
gemensamma standardvärdena. Arbetssättet är permanent sedan 2026-10-29 (#159), efter Rikards utvärdering av första passet.

- **Regler att läsa först:** [CLAUDE.md](../CLAUDE.md) (arkitektur, datamodell, källpolicy, licenser, bilder,
  utseende, test och arbetssätt), [docs/beslut.md](../docs/beslut.md), [docs/kallor.md](../docs/kallor.md),
  [docs/datamodell.md](../docs/datamodell.md) och [docs/arkitektur.md](../docs/arkitektur.md).
- **Språk:** svenska i chatt, issues, kommentarer och pull requests, kort och tydligt, enligt CLAUDE.md. Rikard är
  projektledare: förklara vad som ändrats och varför. Användarens område: argumentet till `/orkester`.
- **Läge:** `/orkester` med ett område (issuenummer eller ämne) kör ett avgränsat pass över just det området.
  `/orkester` utan område kör ett avgränsat pass över hela kön. Inget av dem startar timer, köavläsning eller
  bevakning. En obevakad kösession körs bara när Rikard uttryckligen ber om den.
- **Passets storlek:** ett pass levererar högst fyra pull requests, så att Rikard hinner granska dem. Därefter
  rapporterar dirigenten och stannar. Nästa pass startar när Rikard ber om det, till exempel "fortsätt med fler
  issues". Ett angivet område med fler issues får ändå tas i sin helhet.
- **Repo och samordning:** `DasKrokodil/historia-globen`. Ingen statusissue; status rapporteras i chatten och i
  varje issue.
- **Issues:** GitHub, enligt shared/ISSUE-WORKFLOW.md. Projektets etiketter: `idé`, `data`, `faktafel`,
  `källkontroll`, `utseende`, `utanför-kod`, `version-2`. Prioritetsetiketter används inte. Ordningen är då
  milstolpens versionsnummer (lägst först), sedan skapandetid. Issues med etiketten `utanför-kod` tas aldrig.
- **Krav per issue:** milstolpar som Rikard ännu inte har öppnat för arbete (versioner efter den pågående) tas inte
  utan att han ber om det, enligt CLAUDE.md: varje version slutar med hans utvärdering. Undantag: säger issuet
  självt att en del kan göras när som helst, får den delen tas, och pull requesten skriver "Del av #N".
- **Anspråk:** en kommentar på issuet ("Orkestern tar det här, session <id>") och etiketten `orkester: pågår` medan
  arbetet pågår. Etiketten tas bort när pull requesten är öppnad eller arbetet pausas.
- **Codex (beslut 2026-10-31):** Codex tar också issues och öppnar pull requests, enligt [AGENTS.md](../AGENTS.md). Orkestern
  hoppar över issues med etiketten `codex: pågår` eller en öppen Codex-pull-request (`codex/issue-*`) som skriver
  `Closes #N`. Dirigenten granskar Codex pull requests på samma sätt som arbetarnas leveranser innan Rikard slår ihop.
- **Kapacitet:** högst tre arbetare samtidigt, inklusive hjälpare. Dirigenten får göra ett arbete själv, och det
  räknas då som en plats. Webbläsartester (Playwright) körs av en arbetare i taget, var och en med egen port. Kön
  hålls med en gemensam låsfil: `flock <scratchpad>/pw.lock node skript.cjs`. I molnmiljön når webbläsaren inte
  jsdelivr, så three.js routas till en lokal kopia (`three@0.160.0`) och Google Fonts avbryts.
- **Isolering:** varje arbetare har en egen arbetskopia (git worktree) och en egen port för
  `python3 -m http.server`: 8001, 8002 och 8003 (dirigenten använder 8000). Kontrollera att servern visar
  arbetarens egen kopia. Arbetskopiorna läggs utanför repot, till exempel `/home/user/orkester/<N>-<namn>`, och tas
  bort när pull requesten är ihopslagen.
- **Modeller:** arbetare får en billigare modell för rutinändringar i kod och utseende. **Undantag (källpolicyn):**
  issues med etiketten `data`, `faktafel` eller `källkontroll`, och allt som lägger in eller ändrar fakta, årtal,
  platser eller källor, görs av dirigenten själv eller av en arbetare med samma modell som dirigenten. Källsidan
  öppnas alltid. Ingen uppgift skrivs ur minnet. Nivåerna är `draft`, `source-checked` och `two-sources`; det finns ingen människogranskning (#252).
- **Personuppgifter:** arbetare och dirigent skickar aldrig Rikards namn, e-postadress eller andra personuppgifter till
  externa tjänster, till exempel i en User-Agent, en URL eller en förfrågan. Behöver en tjänst en kontaktuppgift används
  projektets namn och repots adress (`Historia-globen (https://github.com/DasKrokodil/historia-globen)`).
- **Spärrade källor:** molnmiljöns nätverk kan stoppa källsajter. Går en källa inte att öppna används den inte, inte
  ens via en sökträff. Uppgiften behåller sin nivå, och pull requesten säger vilka domäner som behöver släppas på.
  Är källorna oense skrivs det öppet i händelsens `note` ("Källorna skiljer sig") och nivån höjs inte.
- **Tider:** ingen köavläsning eller bevakning. Hjärtslag från arbetare var 15:e minut, och arbete
  utan framsteg i 45 minuter diagnostiseras.
- **Frågor:** frågor som bara Rikard kan svara på postas som kommentar på issuet, med alternativ och en
  rekommendation, och etiketten `user question`. Ett avgränsat pass frågar aldrig i chatten. Ändringar av
  arkitektur, nya beroenden, kategorier eller datakällor med ny licens är alltid sådana frågor (CLAUDE.md).
- **Inflöde:** inga automatiska inflödessteg. Undantag: när dirigenten startar läser den `docs/granskningar/handoff.json`. Är `status` `ready_for_triage` triageras rapporten enligt CLAUDE.md (Granskningar från Codex) innan passet börjar, och ingenting ur rapporten genomförs förrän Rikard har godkänt planen.
- **Granskning av varje leverans (obligatorisk):** dirigenten läser diffen och tittar på skärmbilderna innan pull
  requesten öppnas. I faktaarbete stickprovskontrollerar dirigenten källorna själv. Fel rättas i en extra commit, och
  pull requesten säger vad granskningen hittade. I första passet hittade granskningen något i hälften av leveranserna,
  så steget hoppas aldrig över.
- **Granskning när kön är tom:** standard, och dessutom slås alla öppna orkester-pull-requests ihop på prov i en
  separat kopia. JSON och källor kontrolleras, och sidan provkörs med allt ihopslaget. Fynd blir nya issues, men
  byggs inte utan att de ingår i passets område.
- **Test och bevis före pull request:** enligt CLAUDE.md, "Testa innan du är klar": inga fel i konsolen, giltig JSON
  och att varje `sources`-id finns i `sources.json`. Testa dator- och mobilbredd (cirka 400 px), med skärmbilder
  vid ändringar i utseendet. Molnmiljön kan inte ladda upp bilder till GitHub. Pull requesten beskriver därför vad
  skärmbilderna visar, med mått där det hjälper (till exempel "etiketten ligger på x 17–167"), och dirigenten
  skickar de viktigaste bilderna till Rikard i chatten.
- **Webbläsartestet i GitHub (#339):** varje pull request mot `main` och `production` får jobbet "Öppna sidan i
  Chromium" (`.github/workflows/browser-test.yml`), som kör `tests/webblasare.mjs` i dator- och mobilbredd: inga
  konsolfel, globen startar, tidslinjen, Lager, Fokus, Platt vy och Källor, ett rike och en väg syns, ingen horisontell
  scroll. Orkestern kan lita på att jobbet fångar trasiga grundfunktioner och läsa skärmbilderna i artefakten
  `skarmbilder`. Arbetare kör samma skript lokalt mot sin egen port innan pull requesten (docs/DEPLOYMENT.md); egna
  skärmbilder av det issuet ändrar behövs fortfarande.
- **Leverans (PR-läge):** pusha aldrig till `main`. Varje issue levereras på en egen gren `claude/issue-<N>-<namn>`
  som en pull request på svenska, med `Closes #N`, vad som ändrats, varför och hur Rikard testar. Ingen force push.
  Rikard slår ihop. Issuet stängs när pull requesten slås ihop, inte av orkestern. Uppdatera `docs/` och
  beslutsloggen i `docs/beslut.md` i samma pull request när något sådant ändras.
- **Gränser och licenser:** kod GPL-3.0, data CC BY 4.0, källor och licenser enligt CLAUDE.md. Orkesterns filer i
  `.orchestra/shared` har MIT-licens och redigeras inte här. Ändringar i dem föreslås till upstream.
- **Installerad version:** uppströms commit `84fc833611b4b69e290f3e7a829613bb72a74aa5` (efter v0.6.0, ännu utan release-tagg; innehåller reglerna från fältrapporten från Historia-globen), via git subtree med squash. Godkänd av Rikard 2026-10-30.
  Uppdatera enligt [shared/INSTALL.md](shared/INSTALL.md).
- **Uppströmsversioner:** https://github.com/solwation/dirigenten-och-orkestern, kontrolleras när dirigenten startar
  och återanvänds i 24 timmar. Relevanta buggfixar föreslås som ett issue här. Andra uppgraderingar är frivilliga.
  Uppgraderingar importeras bara när Rikard godkänner. Verktyget `gh` finns inte i molnmiljön; använd GitHubs
  MCP-verktyg eller vanliga git-kommandon.

## Projektets fashakar

| Hake | Fas och utlösare | Procedur | Ägare | Krav och bevis |
| --- | --- | --- | --- | --- |
| Källkontroll | `implementation`: ändringar i `data/` eller fakta i text | Öppna källsidan, jämför årtal, plats och påståenden, uppdatera `checked` i `sources.json` (docs/kallor.md) | Dirigenten eller arbetare med samma modell som dirigenten | Krävs: källor och kontrolldatum i diffen |
| Skärmbilder | `verification`: ändringar i utseendet | Playwright i dator- (1400 × 900) och mobilbredd (400 × 800) mot arbetarens egen server | Arbetaren | Krävs: skärmbilder och kontroll att horisontell scroll saknas och konsolen är felfri |
| Granska bilder | `review`: ändringar i utseendet | Jämför skärmbilderna med issuets mål och stilen i CLAUDE.md | Dirigenten | Krävs: granskningen beskriven i pull requesten |
