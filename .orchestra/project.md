# Orkesterns projektpolicy: Historia-globen

Inställningar för [dirigenten och orkestern](shared/README.md) i det här projektet (#145). Gemensamma regler står i
[shared/ORCHESTRA.md](shared/ORCHESTRA.md). Projektets regler här och i [CLAUDE.md](../CLAUDE.md) går före de
gemensamma standardvärdena. Arbetssättet är permanent sedan 2026-10-29 (#159). Den fullständiga texten (kapacitet,
isolering, test och bevis före pull request, tokenbudget, kontextgrupper, planering före milstolpe (`/milstolpe`), blind-spots-rundan, väntan, tider, uppföljning m.m.) ligger i
[docs/referens/orkestern.md](../docs/referens/orkestern.md); det som ersatts av beslutet 2026-11-23 står i
[docs/referens/ersatta-granskningsregler.md](../docs/referens/ersatta-granskningsregler.md).

- **Regler att läsa:** kärnan och det som uppgiften träffar enligt [context-map.md](context-map.md) (beslut 2026-10-31).
  Långa referensdokument och hela beslutsloggen läses inte som standard, utan söks i.
- **Språk:** svenska i chatt, issues, kommentarer och pull requests, kort och tydligt. DasKrokodil är projektledare:
  förklara vad som ändrats och varför. Användarens område: argumentet till `/orkester`.
- **Läge och passets storlek:** `/orkester` med ett område (issuenummer eller ämne) eller utan område kör ett avgränsat pass.
  Inget startar timer, köavläsning eller bevakning. Ett pass levererar högst fyra pull requests, normalt två till tre
  (fyra bara för självständiga leveranser med låg risk; arkitektur, central UI och beroendekedjor som en pull request).
  Därefter rapporterar dirigenten och stannar. Nästa pass startar när DasKrokodil ber om det.
- **Repo och samordning:** `DasKrokodil/historia-globen`. Ingen statusissue; status rapporteras i chatten och i varje issue.
- **Issues:** GitHub, enligt shared/ISSUE-WORKFLOW.md. Projektets etiketter: `idé`, `data`, `faktafel`,
  `källkontroll`, `utseende`, `utanför-kod`, `version-2`. Prioritetsetiketter används inte; ordningen är milstolpens
  versionsnummer (lägst först), sedan skapandetid. Issues med `utanför-kod` tas aldrig.
- **Krav per issue:** milstolpar som DasKrokodil ännu inte har öppnat för arbete tas inte utan att han ber om det
  (varje version slutar med hans utvärdering). Undantag: säger issuet självt att en del kan göras när som helst, får den
  delen tas, och pull requesten skriver "Del av #N".
- **Anspråk:** en kommentar på issuet ("Orkestern (DasKrokodil) tar det här, session <id>"), etiketten `pågår` och
  tilldelning till kontots person medan arbetet pågår (beslut 2026-11-06). `pågår` tas bort när pull requesten är öppnad
  eller arbetet pausas. Dirigent är bara Claude Code på DasKrokodils konto; på Andreas konto (`Einzbeng`) körs orkestern
  inte som dirigent, men hans Claude Code tar `redo`-issues, får sätta `redo` och skapa issues enligt samma regler (beslut 2026-11-11).
- **Codex (beslut 2026-10-31):** Codex tar också issues enligt [AGENTS.md](../AGENTS.md). Orkestern hoppar över issues med
  `pågår`, en tilldelad person eller en öppen pull request (`*/issue-<N>-*`) som skriver `Closes #N` (ett issue, en ägare).
  Dirigenten (och DasKrokodil, Andreas och hans Claude Code, med dirigentens stickprov) sätter `redo` på tydligt avgränsade
  issues utan `beslut-krävs` och utan krock. Codex och Copilot tar inte `redo`-issues med fakta, data, källor, bilder (utom översättningar och riktiga bilder, beslut 2026-11-27) eller
  riken. Varje pass går igenom den pågående milstolpen efter nya `redo`; rapporten har raden "Nya redo: #…" (eller ingen
  rad). **Granskning (beslut 2026-11-23):** ingen separat Codex-granskning; dirigenten granskar före ihopslagning bara
  arkitektur, säkerhet och `functions/`.
- **Kapacitet och isolering:** högst tre arbetare samtidigt, var och en i egen git worktree med egen port (8001–8003,
  dirigenten använder 8000). Webbläsartester körs en i taget med `flock`. Detaljer: [orkestern.md](../docs/referens/orkestern.md).
- **Modeller:** dirigenten följer modellnivåerna i CLAUDE.md. Arbetare får en billigare modell för rutinändringar i kod och
  utseende. **Undantag (källpolicyn):** issues med `data`, `faktafel` eller `källkontroll`, och allt som lägger in eller
  ändrar fakta, årtal, platser eller källor, görs av dirigenten själv eller av en arbetare med samma modell som dirigenten.
  Källsidan öppnas alltid. Ingen uppgift skrivs ur minnet. Nivåerna är `draft`, `source-checked` och `two-sources`; det finns ingen människogranskning (#252).
- **Personuppgifter:** skicka aldrig DasKrokodils namn, e-postadress eller andra personuppgifter till externa tjänster. Behöver en tjänst en kontaktuppgift används
  `Historia-globen (https://github.com/DasKrokodil/historia-globen)`.
- **Spärrade källor:** går en källa inte att öppna används den inte, inte ens via en sökträff. Uppgiften behåller sin nivå,
  och pull requesten säger vilka domäner som behöver släppas på. Är källorna oense skrivs det öppet i händelsens `note` och nivån höjs inte.
- **Frågor:** frågor som bara DasKrokodil kan svara på postas som kommentar på issuet, med alternativ och en rekommendation,
  och etiketten `user question`. Ett avgränsat pass frågar aldrig i chatten. Arkitektur, nya beroenden, kategorier och datakällor med ny licens är alltid sådana frågor.
- **Granskning av varje leverans från orkesterns egna arbetare:** dirigenten läser diffen och tittar på skärmbilderna innan pull
  requesten öppnas; i faktaarbete stickprovskontrollerar dirigenten källorna. Fel rättas i en extra commit och pull requesten säger vad granskningen hittade.
- **Leverans (PR-läge):** pusha aldrig till `main`. Varje issue levereras på en egen gren `claude/issue-<N>-<namn>` som en
  pull request på svenska, med `Closes #N`, vad som ändrats, varför och hur DasKrokodil testar. Ingen force push. DasKrokodil slår ihop.
  Uppdatera `docs/` och beslutet som egen fil i `docs/beslut/` i samma pull request. `docs/beslut.md` är fryst.
- **Installerad version:** uppströms release **v0.8.2**, commit `5a67f022cea5ec2a81fcadb99b727d9f3482e26a` (tagg `v0.8.2`, 2026-11-05), via git subtree med squash. Godkänd av Rikard 2026-11-05 (tidigare: v0.7.0, `2bd0021`). Slå ihop uppdateringar med **Create a merge commit**, så att subtree-historiken bevaras.
  Uppdatera enligt [shared/INSTALL.md](shared/INSTALL.md). Uppströms: https://github.com/solwation/dirigenten-och-orkestern; flödet Orkesterns version
  (`.github/workflows/orkesterversion.yml`) läser raden ovan, så den måste behålla formen (tagg `vX.Y.Z`). Uppgraderingar importeras bara när DasKrokodil godkänner.

## Resurspolicy

Beslut 2026-10-31. Granskning och källkontroll hoppas aldrig över; besparingen görs före och runt dem. Detaljer, regler för två eller tre arbetare, uppdragets innehåll och uppföljning: [orkestern.md](../docs/referens/orkestern.md).

| Uppgift | Bemanning | Kontroll |
| --- | --- | --- |
| Stavning, dokumentation, en liten konstant | Dirigenten direkt eller en billigare arbetare | Riktad |
| Avgränsad ändring i kod eller utseende | En arbetare och dirigentens granskning | Komponent |
| Fakta, årtal, källor, historisk data | Dirigenten eller en arbetare med samma modell som dirigenten | Komponent och källkontroll |
| Arkitektur, datamodell, säkerhet, central rendering | Dirigenten och högst en arbetare till att börja med | Full |
| Flera likadana, helt separata innehållspaket | Två eller tre arbetare, när mönster och fakta är låsta | Komponent, stickprov och sammanslagningstest |

Testnivåer: **Riktad** (dokumentation, statiska texter, mycket små ändringar: diff, syntax, länkar, validator; inget lokalt webbläsartest när bara dokumentation ändras), **Komponent** (data, en panel eller ett lager: validator, ett avgränsat webbläsarflöde, skärmbilder), **Full** (central JavaScript, rendering, tidslinje, mobillayout, dataladdning, arkitektur, beroenden och release: hela `tests/webblasare.mjs`).

## Projektets fashakar

| Hake | Fas och utlösare | Procedur | Ägare | Krav och bevis |
| --- | --- | --- | --- | --- |
| Källkontroll | `implementation`: ändringar i `data/` eller fakta i text | Öppna källsidan, jämför årtal, plats och påståenden, uppdatera `checked` i `sources.json` (docs/kallor.md) | Dirigenten eller arbetare med samma modell som dirigenten | Krävs: källor och kontrolldatum i diffen |
| Skärmbilder | `verification`: ändringar i utseendet | Playwright i dator- (1400 × 900) och mobilbredd (400 × 800) mot arbetarens egen server | Arbetaren | Krävs: skärmbilder och kontroll att horisontell scroll saknas och konsolen är felfri |
| Granska bilder | `review`: ändringar i utseendet | Jämför skärmbilderna med issuets mål och stilen i CLAUDE.md | Dirigenten | Krävs: granskningen beskriven i pull requesten |
