# CLAUDE.md – Historia-globen

Instruktioner för Claude Code i det här repot. Läs den här kärnan och sedan bara det uppgiften träffar, enligt tabellen sist och [.orchestra/context-map.md](.orchestra/context-map.md). Långa regler, filstruktur och versionsplan ligger i [docs/referens/](docs/referens/README.md); inget har tagits bort, bara flyttats (beslut 2026-11-23, punkt 5).

## Absoluta förbud (gäller alltid)

- **Aldrig fakta ur minnet.** Allt som läggs in kommer från en källa som du har öppnat (Källpolicyn nedan).
- **Aldrig pusha till `main`** (eller `production`) och aldrig force-push. Allt levereras som pull request från en egen gren.
- Inga personuppgifter eller hemligheter i repot, i issues eller till externa tjänster.
- Inga nya beroenden eller ändrad arkitektur, datamodell, kategorier eller licenser utan DasKrokodils ok.
- `.orchestra/shared/` redigeras inte.

## Färre granskningar (beslut 2026-11-23)

Beslut: [docs/beslut/2026-11-23-farre-granskningar-sparar-tokens.md](docs/beslut/2026-11-23-farre-granskningar-sparar-tokens.md).

- Ingen korsgranskning och ingen separat Codex-granskning av pull requests.
- Fakta, data och källor granskas i batch före release av högst tre experter: `historiker` (med `geograf` och `forhistoriker` vid behov), `ux-tillganglighet` om gränssnittet ändrats, och ett översättningspass om texter ändrats.
- Dirigenten granskar före ihopslagning bara arkitektur, säkerhet och `functions/`.
- Källpolicyn gäller som förut för den som skriver. Fullständigt: [docs/referens/arbetssatt.md](docs/referens/arbetssatt.md).

## Projektet

Historia-globen är en snurrbar jordglob i webbläsaren. Man drar i tiden och ser vad som hände **samtidigt** på olika håll i världen. Fun facts lyfter fram oväntad samtidighet, till exempel att pyramiderna byggdes medan de sista mammutarna levde. Det är ett hobbyprojekt med öppen källkod. På sikt kan samma innehåll visas på en fysisk glob.

- Ägare: DasKrokodil (Rikard, GitHub `DasKrokodil`). Skriv till honom på **svenska**, kort och tydligt. Han är projektledare, inte utvecklare, så förklara vad som ändrats och varför, inte bara hur. Adresser, domäner och andra värden han ska lägga in någonstans (till exempel i nätverksinställningar) ges alltid som en lista i ett kodblock, ett värde per rad, så att han kan kopiera och klistra in dem, aldrig bara i löptext (önskemål 2026-11-12). I ny text på GitHub skrivs ägaren som **DasKrokodil**.
- Medarbetare: Andreas (GitHub `Einzbeng`, beslut 2026-11-06). Han kör egna agenter (Codex och Claude Code) som arbetare. Bara DasKrokodil slår ihop, beslutar och sköter publicering, releaser och hemligheter. Se [arbetssatt.md](docs/referens/arbetssatt.md), "Två personer, flera agenter".
- Live-prototyp (version 1): https://claude.ai/artifact/SrLqWzKfXNE9RUiKUd99Lg. Planeringsdokumenten ligger i hans Claude-projekt "Historia-globen" och går inte att nå här; de viktiga besluten finns i `docs/beslut/`.

## Arkitektur (beslutad, ändra inte utan att fråga)

Full text: [docs/referens/arkitektur-beslut.md](docs/referens/arkitektur-beslut.md). Filstruktur: [docs/referens/filstruktur.md](docs/referens/filstruktur.md).

1. **Inget byggsteg.** Vanliga ES-moduler, inga ramverk, ingen bundler, ingen server-backend; `python3 -m http.server` räcker. Enda undantaget är `functions/api/feedback.js` (beslut 2026-10-30).
2. **Data skild från kod.** Allt innehåll ligger i `data/*.json`; hårdkoda aldrig händelser, texter eller årtal i JS.
3. **Ett år styr allt.** `Timeline` äger året och skickar `change`; lager och paneler lyssnar och ritar om (även tidsintervallet, de två tidsreglagen och fokusläget för korta krig, se arkitektur-beslut.md).
4. **Ekvirektangulär rendering.** Allt på klotet ritas först på en ekvirektangulär canvas (4096×2048) som läggs på sfären; klickbara markörer och bågar är 3D-objekt ovanpå. Bryt inte detta (regionvyn #1641 är en skärmbunden tredje ritväg som inte bryter mot det).
5. **Lager som moduler.** Fem lagertyper (punkt, linje, område, bildlager, tur) med samma gränssnitt, `update(state)` och `drawOverlay(ctx, W, H)`, anmälda i `js/layers/registry.js`.
6. **three.js 0.160.0** från jsDelivr, exakt version. Inga andra externa beroenden utan att fråga.

Nya lager läggs i `js/layers/`, ny UI i `js/ui/`, ny data i `data/`. Uppdatera filstrukturen i README.md när den ändras.

## Datamodell och standarder (beslut 3, 6, 8)

I korthet. Full text: [docs/referens/datamodell-kort.md](docs/referens/datamodell-kort.md) och [docs/datamodell.md](docs/datamodell.md).

- **År** är heltal med astronomisk årsräkning: `0` = 1 f.Kr., *N f.Kr.* → `1 - N`. **Fälla:** Wikidatas JSON saknar år 0; lägg till 1 på alla år före vår tideräkning vid import.
- Osäkerhet i `edtf` (EDTF), precision i `precision` (Wikidatas skala), plats som GeoJSON `[longitud, latitud]`.
- Texter per språk (`sv` först, saknas ett språk visas `en`, sedan `sv`). Kategorierna är en fast lista (`CATEGORIES` i `model.js`); nya kräver DasKrokodils ok.
- Händelser redigeras i `data/handelser/<period>.json`, aldrig i `data/events.json`.

## Källpolicy – viktigast av allt

Rikard är mycket mån om att inget påhittat hamnar på globen. Följ detta strikt:

1. **Ingen uppgift utan källa.** Varje händelse och fun fact pekar på minst en post i `data/sources.json` (id, titel, url, licens, datum då den kontrollerades).
2. **Granskningsstatus** i fältet `review`: `draft` → `source-checked` → `two-sources`. Alla utom `draft` visas på globen. Det är källkontrollen som gäller: vi litar på det källorna säger, och ingen människa granskar uppgifterna i efterhand (beslut 2026-10-30, #252). `two-sources` betyder att årtal och plats har jämförts med en andra, oberoende källa (till exempel Wikidata) och stämmer; båda källorna står i `sources`. Statusen syns i detaljvyn och under Om källorna, inte som eget märke på globen.
3. **Du får aldrig skriva fakta ur minnet.** Allt du lägger till är `draft` tills du har öppnat källsidan och sett att årtal, plats och påståenden stämmer. Då får du sätta `source-checked`.
4. **Är källorna oense, skriv det öppet** i uppgiften (till exempel i händelsens `note`, "Källorna skiljer sig") i stället för att välja en av dem i tysthet. Nivån höjs inte till `two-sources` när källorna inte stämmer.
5. **Fun facts** som jämför saker behöver källa för alla led. Siffror i texten (till exempel "229 år") ska gå att räkna fram ur händelsernas årtal.
6. **Visa osäkerhet öppet** ("cirka", spann) i stället för falsk exakthet. Om källor är oense, skriv det.
7. Wikipedia räknas som sekundärkälla. Den duger för prototypen, men hellre den källa Wikipedia själv hänvisar till, eller forskningsdata.

## Licenser (beslut 10)

- Kod: **GPL-3.0** (`LICENSE`). Data i `data/`: **CC BY 4.0** (`data/LICENSE`). Namnet "Historia-globen" omfattas inte.
- Använd bara data vars licens är förenlig med detta: CC0, CC BY, public domain, eller GPL för gränsdata. **Inte** CC BY-NC, inte "all rights reserved", inte data med oklara villkor. Undantag: källor med NC-licens får användas som länkade källor för att kontrollera årtal och plats, så länge ingen text eller data kopieras (beslut 2026-10-29).
- Kopiera aldrig text från Wikipedia eller andra källor. Skriv egna korta sammanfattningar och länka källan.
- Ange varje ny datakälla i `data/sources.json` och i README:ns licensavsnitt.

## Språk: översätt samtidigt (beslut 2026-11-06)

Full text: [docs/referens/sprak.md](docs/referens/sprak.md).

- Ny gränssnittstext läggs i alla fem filerna i `data/ui/` (`sv`, `en`, `de`, `es`, `fr`) i samma pull request.
- Nytt innehåll: svenskan skrivs och källkontrolleras först, översättningarna till `en`, `de`, `es` och `fr` görs i samma pull request och ändrar aldrig fakta. Ändras svenskan uppdateras översättningarna i samma pull request.
- Artigt tilltal (`Sie`, `usted`, `vous`), utom i texter för elever upp till 13 år (du-form), enligt [docs/beslut/2026-11-08-tilltal-efter-alder.md](docs/beslut/2026-11-08-tilltal-efter-alder.md). Ordlista: [docs/ordlista-oversattning.md](docs/ordlista-oversattning.md).
- Antalet oöversatta texter får aldrig öka.

## Bilder (#129)

Full text: [docs/referens/bilder.md](docs/referens/bilder.md). Riktig bild från Wikimedia Commons eller liknande först, illustration bara som reserv och alltid märkt. Bilden förmedlar stämning, inte fakta. Agenter kan inte generera bilder. Läs hela bildavsnittet innan du rör `images/` eller fältet `image`.

## Utseende

Rikard gillar stilen. Behåll den:

- Mörkt observatorietema (avsiktligt bara mörkt), pergamentfärgat land på djupblått hav, mässing som accent.
- Typsnitt: IM Fell English (rubriker och årtal), Instrument Sans (brödtext), IBM Plex Mono (årtal och metadata).
- Alla färger som CSS-variabler i `:root`. Kategorifärgerna finns i `model.js`.
- Sidan ska fungera i mobilbredd (cirka 400 px) utan horisontell scroll.

## Testa innan du är klar

Full text: [docs/referens/testa.md](docs/referens/testa.md).

1. `python3 -m http.server 8000`; inga konsolfel; globen, tidslinjen, uppspelning, fun facts, Platt vy och Källor fungerar; testa dator och mobil (400 px).
2. `python3 -m json.tool data/*.json`; varje `sources`-id finns i `sources.json` och varje händelse-id i `funfacts.json` finns i `events.json`.
3. Ändrad fil i `data/handelser/` eller `data/empires/index.json`: `python3 tools/dela_data.py` och checka in `data/events.json` och `data/genererat/`. Ändrat innehåll: `python3 tools/oversattning.py` och checka in `data/oversattning.json`. Ändrad `summary` i `data/handelser/` eller `data/routes/`: `python3 tools/textlangd.py` och checka in `data/textlangd.json`.
4. Ändras `functions/` eller förslagsformuläret: `node --test 'tests/*.test.mjs'`.
5. **Röd kontroll (beslut 2026-11-05, skärpt samma dag):** läs loggen och hitta den första felande kontrollen, rätta högst en gång och bara om felet är trivialt (kör bara den felande kontrollen: `ENDAST="<del av namnet>" node tests/webblasare.mjs <port>`), annars lämna en överlämningsrapport och sätt `behöver hjälp` (Codex och Copilot gör så, och Claude Code tar över vid kökontrollen). **Faller samma kontroll i flera pull requests (beslut 2026-11-11):** samla uppgifterna i ett och samma issue (sök först efter det, lägg en kommentar med pull request, körning, jobb, felrad och datum; skapa annars ett bug-issue) i stället för ett nytt issue per pull request. Se [AGENTS.md](AGENTS.md#röd-kontroll-eller-slut-på-tid-samma-regel-för-alla-agenter-beslut-2026-11-05-skärpt-samma-dag).

## Arbetssätt i korthet

Full text: [docs/referens/arbetssatt.md](docs/referens/arbetssatt.md).

- **GitHub Issues är backloggen.** Ny idé i chatten: föreslå ett issue i stället för att bygga direkt (utom små ändringar). Claude Code skapar egna issues för buggar och brister (sök först efter dubbletter); nya funktioner, ändrat utseende, ny data och allt som kräver beslut får `beslut-krävs` med ett avsnitt "Rekommendation till DasKrokodil" och påbörjas inte före hans ja.
- **"Ta issue #N":** läs issuet, bygg på en egen gren och öppna pull requesten direkt med `Closes #N` (eller "Del av #N" om det bara delvis blir klart). Pull requests på svenska: vad som ändrats, varför, hur DasKrokodil testar. `gh pr create` fungerar inte i molnet; använd `gh api repos/<ägare>/<repo>/pulls`.
- **Etiketter och tak:** ta bara `redo`-issues, sätt `pågår` och tilldela dig själv, högst 4 öppna pull requests per person (docs-, test- och överlämnings-PR räknas inte; översättnings-PR räknas inte heller men har eget tak på 8, [beslut 2026-11-23](docs/beslut/2026-11-23-oversattnings-pr-utanfor-taket.md)). Codex och Copilot får även ta `data`, `faktafel`, `källkontroll` och riken (källpolicyn gäller den som skriver: öppnad källa per uppgift listad i pull requesten, högst `source-checked`, omstridda frågor lämnas till en människa; fakta granskas i batch före release), [beslut 2026-11-28](docs/beslut/2026-11-28-codex-tar-faktaissues.md). Översättningar (`översättning` och milstolpen "Löpande: Språk: översättning") tas bara av Andreas agenter, inte av DasKrokodils. Riktiga bilder: [beslut 2026-11-27](docs/beslut/2026-11-27-codex-tar-oversattning-och-bilder.md). Landspull requests som bara ändrar sin egen post i `data/platser.json` krockar inte med varandra ([beslut 2026-11-16](docs/beslut/2026-11-16-europa-och-landskap.md)). **Landskort och landskap (beslut 2026-11-28, [docs/beslut/2026-11-28-andreas-agenter-tar-landskort.md](docs/beslut/2026-11-28-andreas-agenter-tar-landskort.md)):** alla agenter får ta dem, även Andreas Codex och Claude Code (och Copilot), på båda konton; raden "Codex och Copilot tar inte det (data)" i äldre landsissues gäller inte längre.
- **Beslut** skrivs som egen fil i `docs/beslut/ÅÅÅÅ-MM-DD-kortnamn.md` i samma pull request. Beslut före 2026-11-03 finns i den frysta [docs/beslut.md](docs/beslut.md). Läs dem innan du ändrar arkitektur, datamodell, källor, licenser, kategorier eller utseende, och fråga först.
- **Modellnivå för Claude Code (beslut 2026-11-02):** Sonnet medium för triage och normal granskning, Sonnet high för större gränssnitts-, tidslinje- och renderingsändringar, Opus för arkitektur, historiska fakta och källor, källpolicy, datamodell och beslut. Säg kort vilken nivå som passar; byt inte själv.
- **Rapporten till DasKrokodil slutar alltid med två rader:** "Nya issues skapade: ja, #… / nej (inga nya skapades i den här körningen)" och "Kvar att ta: N issues med redo (#…) / inga".
- **Orkestern:** `/orkester [issue eller område]` (se [.orchestra/project.md](.orchestra/project.md)) och `/dirigent "<milstolpe eller #issues>"` (`.claude/commands/dirigent.md`).
- **Release:** expertgranskning (se rutan överst), backlog review och utvärderingar av piloter: [arbetssatt.md](docs/referens/arbetssatt.md). Release publiceras först efter DasKrokodils godkännande.
- **Sådant som inte är kod** (namn, domän, fysisk glob, hårdvara, affärsfrågor) planeras i hans Claude-projekt; påminn honom och skapa högst ett issue med `utanför-kod`.

## Läs det här när du …

| När du … | Läs |
|---|---|
| letar efter en fil eller lägger till en ny | [docs/referens/filstruktur.md](docs/referens/filstruktur.md) |
| ändrar tidslinje, lager, rendering eller tillstånd | [docs/referens/arkitektur-beslut.md](docs/referens/arkitektur-beslut.md), [docs/arkitektur.md](docs/arkitektur.md) |
| skriver eller ändrar data, händelser, riken, turer | [docs/referens/datamodell-kort.md](docs/referens/datamodell-kort.md), [docs/datamodell.md](docs/datamodell.md), [docs/kallor.md](docs/kallor.md) |
| rör bilder | [docs/referens/bilder.md](docs/referens/bilder.md), [docs/bilder-riktiga.md](docs/bilder-riktiga.md) |
| översätter | [docs/referens/sprak.md](docs/referens/sprak.md) |
| testar eller får röd kontroll | [docs/referens/testa.md](docs/referens/testa.md), [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| tar issues, etiketter, pull requests, Codex, Copilot, Andreas roll, piloter, backlog review, release | [docs/referens/arbetssatt.md](docs/referens/arbetssatt.md) |
| kör orkestern eller dirigenten | [.orchestra/project.md](.orchestra/project.md), [docs/referens/orkestern.md](docs/referens/orkestern.md) |
| är Codex eller en annan agent | [AGENTS.md](AGENTS.md), [docs/referens/codex-regler.md](docs/referens/codex-regler.md) |
| planerar version eller milstolpe | [docs/referens/versionsplan.md](docs/referens/versionsplan.md) (GitHub-milstolparna är huvudkällan) |
| undrar vad som ersattes 2026-11-23 | [docs/referens/ersatta-granskningsregler.md](docs/referens/ersatta-granskningsregler.md) |
| väljer vad du ska läsa efter uppgift | [.orchestra/context-map.md](.orchestra/context-map.md) |
