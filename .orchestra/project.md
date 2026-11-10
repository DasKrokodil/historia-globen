# Orkesterns projektpolicy: Historia-globen

Inställningar för [dirigenten och orkestern](shared/README.md) i det här projektet (#145). Gemensamma regler står i
[shared/ORCHESTRA.md](shared/ORCHESTRA.md). Projektets regler här och i [CLAUDE.md](../CLAUDE.md) går före de
gemensamma standardvärdena. Arbetssättet är permanent sedan 2026-10-29 (#159), efter Rikards utvärdering av första passet.

- **Regler att läsa:** kärnan och det som uppgiften träffar enligt [context-map.md](context-map.md) (beslut 2026-10-31,
  ersätter "läs allt först"). Långa referensdokument och hela beslutsloggen läses inte som standard, utan söks i.
- **Språk:** svenska i chatt, issues, kommentarer och pull requests, kort och tydligt, enligt CLAUDE.md. Rikard är
  projektledare: förklara vad som ändrats och varför. Användarens område: argumentet till `/orkester`.
- **Läge:** `/orkester` med ett område (issuenummer eller ämne) kör ett avgränsat pass över just det området.
  `/orkester` utan område kör ett avgränsat pass över hela kön. Inget av dem startar timer, köavläsning eller
  bevakning. En obevakad kösession körs bara när Rikard uttryckligen ber om den.
- **Passets storlek:** ett pass levererar högst fyra pull requests, men normalstorleken är två till tre, så att Rikard
  hinner granska dem. Fyra bara för självständiga leveranser med låg risk; arkitektur, central UI och beroendekedjor
  levereras som en pull request, och beroende delsteg samlas när de inte är värdefulla och testbara var för sig.
  Därefter rapporterar dirigenten och stannar. Nästa pass startar när Rikard ber om det, till exempel "fortsätt med
  fler issues". Ett angivet område med fler issues får ändå tas i sin helhet.
- **Repo och samordning:** `DasKrokodil/historia-globen`. Ingen statusissue; status rapporteras i chatten och i
  varje issue.
- **Issues:** GitHub, enligt shared/ISSUE-WORKFLOW.md. Projektets etiketter: `idé`, `data`, `faktafel`,
  `källkontroll`, `utseende`, `utanför-kod`, `version-2`. Prioritetsetiketter används inte. Ordningen är då
  milstolpens versionsnummer (lägst först), sedan skapandetid. Issues med etiketten `utanför-kod` tas aldrig.
- **Krav per issue:** milstolpar som Rikard ännu inte har öppnat för arbete (versioner efter den pågående) tas inte
  utan att han ber om det, enligt CLAUDE.md: varje version slutar med hans utvärdering. Undantag: säger issuet
  självt att en del kan göras när som helst, får den delen tas, och pull requesten skriver "Del av #N".
- **Anspråk:** en kommentar på issuet ("Orkestern (DasKrokodil) tar det här, session <id>"), etiketten `pågår` och
  tilldelning till kontots person medan arbetet pågår (beslut 2026-11-06, samma för alla agenter). `pågår` tas bort när
  pull requesten är öppnad eller arbetet pausas. Dirigent är bara Claude Code på Rikards konto; på Andreas konto
  (`Einzbeng`) körs orkestern inte som dirigent, och hans Claude Code tar `redo`-issues som arbetare.
- **Integrationskön (shared v0.8.0, "integration-ready"):** i PR-läget är en öppen pull request med `Closes #N` den
  färdiga överlämningen. Ägaren, grenen, commit, bevisen och nästa steg står i pull requesten och dess kommentarer, och
  det är den som leder arbetet som återupptar den (rättar efter granskning, ombaserar). En sådan pull request tar ingen
  arbetarplats, men räknas mot gränsen på fyra öppna pull requests per person. Etiketten `integration-ready` används inte här,
  eftersom pull requesten själv visar läget och etikettkontrollen (#588) bara känner till våra egna etiketter.
- **Codex (beslut 2026-10-31):** Codex tar också issues och öppnar pull requests, enligt [AGENTS.md](../AGENTS.md). Orkestern
  hoppar över issues med etiketten `pågår` eller en tilldelad person, eller en öppen pull request (`*/issue-<N>-*`) som skriver
  `Closes #N` (beslut 2026-11-05 och 2026-11-06: ett issue, en ägare). För Codex pull requests gäller i stället: Codex-förgranskning efter att pull requesten öppnats, därefter Claude Codes beslut ("godkänd" eller arbetsorder) och sist Rikards merge. Samma diff och samma verifieringsbevis återanvänds, ingen del granskas två gånger. Dirigentens granskning "innan pull requesten öppnas" nedan gäller orkesterns egna arbetare.
  Dirigenten sätter den gemensamma etiketten `redo` (beslut 2026-11-06, ersätter `codex: redo` och `copilot: redo`) på
  issues som någon agent får ta: tydligt avgränsade, utan `beslut-krävs` och utan krock med pågående eller planerat
  arbete. Codex och Copilot tar inte `redo`-issues med fakta, data, källor, bilder eller riken; de tar Claude Code
  (Rikards eller Andreas). Etiketten tas bort när issuet tas. Varje pass och varje planering går igenom den pågående
  milstolpen efter nya sådana issues, och rapporten till Rikard har raden "Nya redo: #…" (eller ingen rad när inget är
  nytt). Kökontrollen rättar issues som både är `redo` och tagna.
  Codex får också köra `$orkester` (beslut 2026-11-01) enligt [AGENTS.md](../AGENTS.md). Sedan 2026-11-02 kör Codex
  löpande på `redo`-kön, med högst fyra öppna pull requests per person (en ändring som byggs räknas som öppen) och tre arbetare som bygger samtidigt. Dirigenten räknas inte som arbetare. En annan Codex-körning granskar
  först varje pull request ("Codex-granskning: godkänd"). Claude Code granskar därefter bara de som Codex har märkt "Klar för Claude Code-granskning", och bara det som kräver dirigentens bedömning (källpolicy, arkitektur, synligt resultat); fakta, data och källor granskas alltid fullt. `redo`
  sätts aldrig på arkitekturärenden förrän rätt förutsättningar finns, och tas bort om ett issue blir beroende av ett
  annat spår. Dirigentens eget arbete märks som alla andras (`pågår` och tilldelning).
- **Planering före milstolpe (beslut 2026-11-10):** `/milstolpe <milstolpe>` gör först en kort bemanningsanalys (vilka av agenterna i `.claude/agents/` som behövs: `historiker`, `forhistoriker`, `geograf`, `ux-tillganglighet`, `arkitekt`, `larare`, `sprak-en`, `sprak-de`, `sprak-es`, `sprak-fr`, och linserna i docs/produkt/06-granskningsperspektiv.md) och låter sedan de valda agenterna analysera milstolpens issues från sina perspektiv. Resultatet blir en rapport i `docs/granskningar/` till Rikard; inget byggs och inga issues skapas före hans ok.
- **Blind-spots-rundan (beslut 2026-11-02):** den separata, självkritiska analysen i UX-genomgången görs av Codex och
  skrivs som rapport i `docs/granskningar/`. Dirigenten läser rapporten och gör issues av fynden, men gör inte analysen själv.
- **Flödesregler (beslut 2026-11-02):** (1) Händelsedriven kögenomgång: efter varje ny, uppdaterad eller ihopslagen pull
  request görs direkt en lätt kökontroll av `redo`-issues (full granskning bara vid utlösarna i CLAUDE.md), och nästa blockerade ärende får förberedelsearbete. (2) Omedelbar
  handoff: när en arbetare öppnar eller uppdaterar en pull request börjar den separata Codex-granskningen i samma tur.
  (3) Ingen passiv `pågår`: etiketten kräver en aktiv arbetare, ett pågående test eller en publicering, eller en
  dokumenterad extern spärr; annars återupptas, förbereds eller avmarkeras ärendet direkt.
- **Riskbaserat flöde (beslut 2026-11-03):** Den tidigare kökontrollen efter varje PR är lättviktig och ersätter inte automatiskt en full review. Full review triggas av avslutad batch eller milstolpe, kritisk bugg, större central ändring, releasekandidat eller uttrycklig begäran. Testnivån följer risk: riktad för isolerade ändringar, komponent/integration för relaterade ändringar och full svit inför release eller vid central/riskfylld ändring. Snabbare merge kräver dokumenterad accepterad risk och uppföljning. Release publiceras först efter releasekontroll och Rikards godkännande.
- **Tokenbudget (beslut 2026-11-03):** Veckoplaner anger intervall, osäkerhet och reserv separat för Codex-förberedelse, Codex-implementation/granskning och Claude Code-triage/slutgranskning. Efter varje avslutat issue noteras faktisk förbrukning och avvikelsen mot uppskattningen, så att kommande veckoplaner kalibreras.
- **Kontextgrupper (beslut 2026-11-10, #1119, provregel):** issues som delar kontext (samma filer eller subsystem, samma källor eller region, samma översättningsarbete) görs i samma tråd; ett pass följer en grupp och byter inte domän mitt i. Fakta/data och gränssnitt blandas inte. `/milstolpe` sorterar milstolpens issues i grupper (steg 3) med modellnivå per grupp. Tokenbudgeten räknas per grupp: startkostnad en gång plus marginalkostnad per issue, som **procent av veckoanvändningen** när miljön visar den (annars skrivs "saknas" i rapporten). När en tråd stängs lämnas en överlämningsrad i issuet eller pull requesten (beslut, avvikelser, vad som inte gjordes). Reglerna är provregler tills mätningen är gjord: jämför 2–3 pass med issues som delar kontext mot samma issues i separata trådar, och skriv resultatet som en daterad rapport i `docs/granskningar/`. Taket på fyra pull requests per pass och normalstorleken två till tre ändras inte.
- **Kapacitet:** en arbetare är standard (resurspolicyn nedan). Högst tre arbetare samtidigt, inklusive hjälpare. Dirigenten får göra ett arbete själv, och det
  räknas då som en plats. Webbläsartester (Playwright) körs av en arbetare i taget, var och en med egen port. Kön
  hålls med en gemensam låsfil: `flock <scratchpad>/pw.lock node skript.cjs`. I molnmiljön når webbläsaren inte
  jsdelivr, så three.js routas till en lokal kopia (`three@0.160.0`) och Google Fonts avbryts.
- **Isolering:** varje arbetare har en egen arbetskopia (git worktree) och en egen port för
  `python3 -m http.server`: 8001, 8002 och 8003 (dirigenten använder 8000). Kontrollera att servern visar
  arbetarens egen kopia. Arbetskopiorna läggs utanför repot, till exempel `/home/user/orkester/<N>-<namn>`, och tas
  bort när pull requesten är ihopslagen.
- **Modeller:** dirigenten följer modellnivåerna i CLAUDE.md (Sonnet medium för triage och normal granskning, Sonnet
  high för större gränssnitts-, tidslinje- och renderingsändringar, Opus för arkitektur, fakta, källpolicy och datamodell).
  Arbetare får en billigare modell för rutinändringar i kod och utseende. **Undantag (källpolicyn):**
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
  requesten öppnas (orkesterns egna arbetare; för Codex pull requests, se Codex-punkten ovan). I faktaarbete stickprovskontrollerar dirigenten källorna själv. Fel rättas i en extra commit, och
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
  beslutet som egen fil i `docs/beslut/` (`ÅÅÅÅ-MM-DD-kortnamn.md`) i samma pull request när något sådant ändras. `docs/beslut.md` är fryst.
- **Väntan (Wait mechanism):** Claude Code väntar med schemalagda kontroller (`send_later` och schemalagda uppgifter) och aldrig med
  `sleep` eller en körning som står och väntar. Kan en körmiljö inte vänta (till exempel en engångskörning) gör den ett avgränsat
  pass och säger det. Codex kör löpande på `redo`-kön enligt [AGENTS.md](../AGENTS.md). Användningsgränsen kontrolleras före
  varje schemalagd kontroll, och vid 60 % av veckogränsen pausar dirigenten (beslut 2026-11-01).
- **Gränser och licenser:** kod GPL-3.0, data CC BY 4.0, källor och licenser enligt CLAUDE.md. Orkesterns filer i
  `.orchestra/shared` har MIT-licens och redigeras inte här. Ändringar i dem föreslås till upstream.
- **Installerad version:** uppströms release **v0.8.2**, commit `5a67f022cea5ec2a81fcadb99b727d9f3482e26a` (tagg `v0.8.2`, 2026-11-05), via git subtree med squash. Godkänd av Rikard 2026-11-05 (tidigare: v0.7.0, `2bd0021`). Slå ihop uppdateringar med **Create a merge commit**, så att subtree-historiken bevaras.
  Uppdatera enligt [shared/INSTALL.md](shared/INSTALL.md).
- **Uppströmsversioner:** https://github.com/solwation/dirigenten-och-orkestern, kontrolleras när dirigenten startar
  och återanvänds i 24 timmar. Dessutom jämför flödet Orkesterns version (`.github/workflows/orkesterversion.yml`, beslut
  2026-11-05) varje dag taggen på raden ovan med upstreams stabila taggar och skapar eller uppdaterar ett issue när en
  nyare version finns. Flödet importerar ingenting. Raden "Installerad version" måste därför behålla formen (tagg `vX.Y.Z`). Relevanta buggfixar föreslås som ett issue här. Andra uppgraderingar är frivilliga.
  Uppgraderingar importeras bara när Rikard godkänner. Verktyget `gh` finns inte i molnmiljön; använd GitHubs
  MCP-verktyg eller vanliga git-kommandon.

## Resurspolicy

Beslut 2026-10-31, efter granskningen i [docs/granskningar/2026-10-31-orkester-tokenanalys.md](../docs/granskningar/2026-10-31-orkester-tokenanalys.md).
Kompletterar "Spend resources deliberately" och "Choose the smallest useful team" i [shared/ORCHESTRA.md](shared/ORCHESTRA.md).
Granskning och källkontroll hoppas aldrig över; besparingen görs före och runt dem.

- **Bemanning efter uppgift:**

  | Uppgift | Bemanning | Kontroll |
  | --- | --- | --- |
  | Stavning, dokumentation, en liten konstant | Dirigenten direkt eller en billigare arbetare | Riktad |
  | Avgränsad ändring i kod eller utseende | En arbetare och dirigentens granskning | Komponent |
  | Fakta, årtal, källor, historisk data | Dirigenten eller en arbetare med samma modell som dirigenten | Komponent och källkontroll |
  | Arkitektur, datamodell, säkerhet, central rendering | Dirigenten och högst en arbetare till att börja med | Full |
  | Flera likadana, helt separata innehållspaket | Två eller tre arbetare, när mönster och fakta är låsta | Komponent, stickprov och sammanslagningstest |

- **Två eller tre arbetare** bara när dirigenten kan svara ja på allt detta: leveranserna har inga inbördes beroenden,
  de ändrar inte samma centrala filer eller genererade index (till exempel `js/main.js`, `css/style.css`,
  samma periodfil i `data/handelser/`, `data/events.json`, `data/sources.json`, `data/genererat/`, `docs/beslut/`), de kan verifieras var för sig, en
  misslyckad leverans blockerar inte de andra, och tidsvinsten är verklig trots kön till webbläsartestet. Annars körs
  uppgifterna efter varandra.
- **Uppdraget till arbetaren** följer [shared/WORKER.md](shared/WORKER.md), på högst cirka 800 ord, och har dessutom:
  vad som uttryckligen inte ingår, relevanta beslut och verifierade fakta, vilka avsnitt ur
  [context-map.md](context-map.md) som gäller, och **när arbetaren ska stanna och fråga** (osäkerheter som inte får
  gissas). Hela chatten, hela kön och hela dokument skickas inte.
- **Testnivåer efter risk:**
  1. **Riktad:** dokumentation, statiska texter och mycket små isolerade ändringar. Diff, syntax, länkar eller
     relevant validator (`python3 -m json.tool`, `scripts/build-site.sh`). Inget lokalt webbläsartest när bara
     dokumentation ändras (beslut 2026-11-01).
  2. **Komponent:** data, en panel eller ett lager. Validator plus ett avgränsat webbläsarflöde och skärmbilder av
     det som ändrats.
  3. **Full:** central JavaScript, rendering, tidslinje, mobillayout, dataladdning, arkitektur, beroenden och
     release. Dator och mobil, konsol, hela `tests/webblasare.mjs` lokalt och integrationsprov.

  Webbläsartestet i GitHub skyddar alltid `main`. Dirigenten granskar arbetarens bevis och kör om test bara vid
  konkret misstanke, bristfälligt bevis eller hög risk.
- **Paus vid tidigt fel:** hittar dirigenten en väsentlig rättning i någon av passets två första leveranser startas
  inga nya likadana uppdrag förrän orsaken har förts in i uppdraget, kontextkartan eller testkraven.
- **Resultatet skrivs en gång:** ett kort bevisblock (vad som ändrats för användaren, viktigaste filer, körda
  kontroller och utfall, skärmbilder eller källor, kända begränsningar) återanvänds i issuekommentar, pull request
  och rapport.
- **Uppföljning (försök under 10–20 issues):** varje pass rapporterar antal arbetare, pull requests, väsentliga
  rättningar i granskningen och omkörda tester med orsak. Tokenåtgång rapporteras bara när miljön visar den.
  Ändringen behålls om kvaliteten håller (oförändrad andel rättningar och inga fler fel efter ihopslagning).

## Projektets fashakar

| Hake | Fas och utlösare | Procedur | Ägare | Krav och bevis |
| --- | --- | --- | --- | --- |
| Källkontroll | `implementation`: ändringar i `data/` eller fakta i text | Öppna källsidan, jämför årtal, plats och påståenden, uppdatera `checked` i `sources.json` (docs/kallor.md) | Dirigenten eller arbetare med samma modell som dirigenten | Krävs: källor och kontrolldatum i diffen |
| Skärmbilder | `verification`: ändringar i utseendet | Playwright i dator- (1400 × 900) och mobilbredd (400 × 800) mot arbetarens egen server | Arbetaren | Krävs: skärmbilder och kontroll att horisontell scroll saknas och konsolen är felfri |
| Granska bilder | `review`: ändringar i utseendet | Jämför skärmbilderna med issuets mål och stilen i CLAUDE.md | Dirigenten | Krävs: granskningen beskriven i pull requesten |
