# CLAUDE.md – Historia-globen

Instruktioner för Claude Code i det här repot. Läs kärnan (Projektet, Arkitektur, Källpolicy, Licenser, Testa, Arbetssätt) och sedan bara de avsnitt som uppgiften träffar, enligt [.orchestra/context-map.md](.orchestra/context-map.md). Absoluta förbud gäller alltid: aldrig fakta ur minnet, aldrig pusha till `main`.

## Projektet

Historia-globen är en snurrbar jordglob i webbläsaren. Man drar i tiden och ser vad som hände **samtidigt** på olika håll i världen. Fun facts lyfter fram oväntad samtidighet, till exempel att pyramiderna byggdes medan de sista mammutarna levde. Det är ett hobbyprojekt med öppen källkod. På sikt kan samma innehåll visas på en fysisk glob.

- Ägare: Rikard (GitHub `DasKrokodil`). Skriv till honom på **svenska**, kort och tydligt. Han är projektledare, inte utvecklare, så förklara vad som ändrats och varför, inte bara hur.
- Medarbetare: Andreas (GitHub `Einzbeng`, beslut 2026-11-06). Han kör egna agenter (Codex och Claude Code) som arbetare. Bara Rikard slår ihop, beslutar och sköter publicering, releaser och hemligheter. Se "Två personer, flera agenter" nedan.
- Live-prototyp (version 1, ursprunglig): https://claude.ai/artifact/SrLqWzKfXNE9RUiKUd99Lg
- Planeringsdokument (vision, benchmark, hårdvara, beslut): finns i Rikards Claude-projekt "Historia-globen". Du kommer inte åt det, så de viktiga besluten är upprepade här.

## Arkitektur (beslutad, ändra inte utan att fråga)

1. **Inget byggsteg.** Vanliga ES-moduler som webbläsaren läser direkt. Inga ramverk (React m.fl.), ingen bundler, ingen server-backend. Det ska gå att köra med `python3 -m http.server`. Undantag: functions/api/feedback.js, beslut 2026-10-30 (besökarnas förslag, se docs/feedback.md).
2. **Data skild från kod.** All innehållsdata ligger i `data/*.json`. Hårdkoda aldrig händelser, texter eller årtal i JS.
3. **Ett år styr allt.** `Timeline` äger nuvarande år och skickar `change`, och i fokusläget för korta krig räknas året i delar av år (månader och dagar, #204). Lager och paneler lyssnar och ritar om.
4. **Ekvirektangulär rendering (beslut 1).** Allt som ritas på klotet ritas först på en ekvirektangulär canvas (`baseCanvas` 4096×2048 för grundkartan, `overlayCanvas` 4096×2048 för lager) som läggs på sfären. Klickbara markörer och bågar ligger som 3D-objekt ovanpå. Skälet: samma platta bild visas som karta i "Platt vy" och ska kunna skickas till en fysisk globskärm. Bryt inte detta.
5. **Lager som moduler (beslut 2).** Fem lagertyper: punkt (händelser), linje (handelsvägar, migration, fronter), område (riken, utbredning), bildlager (nattljus, klimat) och tur (guidade fördjupningar som data). Varje lager har samma gränssnitt: `update(state)` som returnerar det som syns, och `drawOverlay(ctx, W, H)`. Varje lager anmäler sig i lagerregistret (`js/layers/registry.js`, #338) med en post från sin egen fil.
6. **three.js** laddas som ES-modul från `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js`. Exakt version, ändra bara medvetet. Inga andra externa beroenden utan att fråga.

### Filstruktur

```
index.html
CONTENT-LICENSE.md   sammanfattning av licenser för kod, data och bilder
THIRD-PARTY-NOTICES.md licenser för externa komponenter och datakällor
AGENTS.md             regler för Codex och andra agenter; pekar på CLAUDE.md
_headers              Cloudflare Pages cache-regler (no-cache, så att en release inte blandas med gamla filer)
css/style.css
js/main.js            startar allt och kopplar ihop delarna
js/controllers/       main.js uppdelad i val, fokus, faktarutor, omritning, uppspelning, berättelse, etiketter (#402) och adressen (#501)
js/model.js           språk, kategorier, granskningsstatus, tidsformat, laddning
js/i18n.js            språkval och gränssnittets texter: ui('nyckel') ur data/ui/<språk>.json och data-i18n i index.html (#63)
js/url-state.js       adressformatet för delbara länkar och Bakåt/Framåt (#501, #64)
js/search-index.js    sökningens index och matchning (#570)
js/date-events.js     återanvändbart urval av händelser för år eller exakt datum (#483, #489, #485)
js/state.js           det gemensamma tillståndet (år, fokus, lager, filter) som lagren läser (#338), med åtgärder, prenumeration och JSON (#403)
js/globe.js           3D-globen, kamera, styrning, ekvirektangulära canvasar, bågar
js/globe-detail.js    skarpt utsnitt av kartan vid inzoomning: samma ritning i högre upplösning för det som syns
js/timeline.js        tidsreglage, segmenterad skala, uppspelning
js/layers/registry.js lagerregistret: ritordning, Lager-menyn, uppdatering och toning (#338)
js/layers/index.js    listan över lagren i Lager-menyns ordning; ett nytt lager läggs till här (#338)
js/layers/events.js   punktlager: händelser
js/layers/lines.js    linjelager: vägar och resor som ritas fram över tiden (#38)
js/layers/discovery.js upptäcktsvyn: gammal kartstil, havsmonster och dimma som resorna lyfter (#101)
js/ui/panel.js        "Samtidigt i världen" per världsdel, filter, detaljvy
js/ui/funfact.js      Samtidigt-kortet (fun facts m.m.) och bågar
js/ui/sources.js      sidan Om källorna
js/ui/flatmap.js      Platt vy: platt karta med zoom och panorering
js/ui/poster.js       A4-affisch som PNG från Platt vy
js/ui/routepop.js     klickrutan för vägar och resor
js/ui/intro.js        frivillig introduktion till samtidighet i tre stilla steg (#363)
js/ui/quiz.js         quizet "Vad hände samtidigt?" under Mer, frågor ur befintliga fun facts (#65)
js/ui/print-sheet.js  utskrift av en lektionstur: elevblad och lärarblad ur turens lärarfält (#738)
js/ui/uppdrag.js      elevuppdraget Samtidighetsjakten under Mer, med knappen i faktarutan (#741)
js/uppdrag-rules.js   jaktens regler: år, världsdel och vad som räknas, delas med testerna (#741)
js/quiz-rules.js      quizets regler: frågor och säkert felaktiga svar, delas med testerna (#65)
js/ui/viewmode.js     vyväljaren: Glob, Platt karta och Upptäcktsresor (#651)
js/ui/tour.js         guidade turer: spelar upp en tur ur data/turer/ steg för steg (#47)
js/ui/lesson.js       lektionsläget: länken m=lektion döljer menyerna, låser år och lager och visar bandet med "Visa hela globen" (#795)
js/tour-format.js     turformatets kontroll, delas med testerna (#47)
js/ui/feedback.js     formuläret för besökarnas förslag (avstängt som standard, docs/feedback.md)
js/feedback-rules.js  förslagens kategorier, gränser och validering (delas med functions/)
functions/api/feedback.js  Cloudflare Pages Function som skapar issues i ett privat repo (enda undantaget från punkt 1)
tests/                tester för functions/ med node:test (node --test 'tests/*.test.mjs')
tests/webblasare.mjs  webbläsartest med Playwright, körs i GitHub Actions för varje PR (#339)
data/handelser/       händelserna, en redigeringsfil per period (fkr.json, 1-1499.json … 1946-1979.json, 1980-.json); här redigeras händelser (#394)
data/events.json      alla händelser i en fil, byggs av tools/dela_data.py ur data/handelser/; redigeras inte
data/funfacts.json    fun facts (kopplade till händelse-id)
data/missuppfattningar.json vanliga historiska missuppfattningar: påstående, vad källorna säger och ursprung (#838); visas i faktarutan för händelserna i `events`
data/intro.json       introduktionens steg och referenser till befintliga händelser/fun facts (#363)
data/uppdrag.json     elevuppdragen (Samtidighetsjakten): år, spann, antal världsdelar och texter (#741)
data/turer/           guidade turer: index.json och en fil per tur (#47, beslut 2026-11-01)
data/sources.json     källregister
data/version.json     versionsnummer och länk till releaserna
data/licenses.json    genererat register över källornas licensuppgifter (#393)
data/land.json        grundkarta: Natural Earth 1:50m, färdigprojicerad SVG-path i 4096×2048
data/land-10m.json    finare kust: Natural Earth 1:10m, samma format; laddas först när utsnittet vid inzoomning används (tools/land_10m.mjs)
data/empires/         riken: index.json och en fil per rike, byggs med tools/riken.py ur Cliopatria
data/routes/          vägar och resor: index.json listar filerna, en fil per resa eller väg (#38)
data/genererat/       händelser och riken uppdelade i mindre filer som sidan laddar (#337), med en fil per språk ovanpå (#675); skrivs av tools/dela_data.py, redigeras inte
data/oversattning.json spärren mot oöversatta texter och registret över översättningar (#675); skrivs av tools/oversattning.py, publiceras inte
data/upptackt.json    upptäcktsvyn: perspektivrad, dimma och kartbilder (#101)
data/vyer.json        grupperna och de förinställda vyerna i Lager (#357)
data/ui/              gränssnittets texter: sprak.json (språken, vem som översatte och granskade) och en fil per språk (#63)
data/religions.json   religioner som områden (statsreligion per rike ur Cliopatria) och faktarutor
data/religions-polities.json  rikenas områden per religion och period, laddas vid klick (tools/religioner_riken.py)
data/styles.json      bildstilar efter tidsålder och plats (ramar och promptar)
data/utkast/          utkast från massimport (draft), läses inte av appen; hced.json byggs med tools/hced.py
images/events/        bilder till händelser, <händelse-id>.webp, 800 × 600
images/licenses.json  genererat register över händelsebildernas licenser (#393)
images/karta/         kartbilder till upptäcktsvyn (public domain, ur gamla kartor)
images/incoming/      Rikards nya bilder, innan de konverteras
tools/                hjälpskript som körs för hand; tools/license_manifests.py genererar licensmanifesten, och dela_data.py körs efter ändring i data/handelser/ eller empires/index.json
docs/                 dokumentation: arkitektur, datamodell, beslutslogg, källarbete, bildpromptar, publicering (DEPLOYMENT.md), besökarnas förslag (feedback.md), externa granskningar (granskningar/)
scripts/              build-site.sh kopierar webbplatsens filer till dist/ och kör validate-site.py (publicering, ingen kodändring); pages-function-check.sh startar formulärets funktion som Cloudflare (#663)
.orchestra/           dirigenten och orkestern: project.md (projektets policy) och shared/ (fäst version, redigeras inte)
```

Nya lager läggs i `js/layers/`, ny UI i `js/ui/`, ny data i `data/`. Uppdatera filstrukturen i README.md när den ändras.

## Datamodell och standarder (beslut 3, 6, 8)

- **År** = heltal med astronomisk årsräkning (ISO 8601): `0` = 1 f.Kr., `-1` = 2 f.Kr., `-2599` = 2600 f.Kr. Konvertering: *N f.Kr.* → `1 - N`. Visningen ("f.Kr.") görs i `model.js`.
- **Osäkerhet** = EDTF-sträng i fältet `edtf`: `~` ungefär, `?` osäker, `/` spann, `../` öppen start, `/..` pågår. År med fler än fyra siffror skrivs `Y-66000000`.
- **Precision** = Wikidatas skala i fältet `precision`: 0 miljard år, 6 årtusende, 7 århundrade, 8 decennium, 9 år, 10 månad, 11 dag.
- **Fälla:** Wikidatas JSON saknar år 0 (1 f.Kr. kommer som -1). Lägg till 1 på alla år före vår tideräkning vid import.
- **Plats** = GeoJSON i WGS 84, `[longitud, latitud]`. Områden blir `Polygon`/`MultiPolygon`. Valfritt `locationPrecision`: `region` eller `country` när platsen är ungefärlig.
- **Texter** lagras per språk: `{ "sv": "...", "en": "...", "fr", "de", "es" }`. Svenska först. Saknas ett språk visas engelska, sedan svenska (`t()` i `model.js`).
- **Kategorier** (fast lista, `CATEGORIES` i `model.js`): natur, manniskan, civilisationer, religion, vetenskap, upptackter, krig, kultur, sport, ekonomi, halsa, klimat, katastrofer, rymden. Nya kategorier kräver Rikards ok.
- **Händelse**, obligatoriska fält: `id` (läsbart, unikt), `category`, `start`, `end`, `precision`, `edtf`, `location`, `place`, `title`, `summary`, `sources` (lista med id från sources.json), `review`. Valfritt: `wikidata` (Q-id, bara om du har verifierat det eller om det kommer från en datakälla vi litar på, se Beslutslogg). Valfritt `note` (`title`, `text`): en extra ruta i faktarutan, till exempel "Om år 0". Valfritt `tags` (#555): än så länge bara `["framsteg"]`, och bara när källan själv beskriver händelsen som en förbättring (se docs/datamodell.md).
- **Religioners grundande:** en händelse med `"founding": true` och `"religion": "<religionens id i religions.json>"`. Fokus på religionen börjar vid den första sådana händelsen och stannar vid de följande. Ikonen (`icon`) är religionens symbol (`symbol` i religions.json, till exempel `cross`, #271). Religioner som växte fram gradvis (judendom, hinduism, shinto, kinesisk religion) får ingen grundhändelse.
- **Krig och slag:** ett krig är en händelse med `"kind": "war"` och start och slut (spann). Slag och andra händelser i kriget pekar på kriget med `partOf` (krigets id). Krigets `location` är platsen där det började, med `locationPrecision: "region"`. Krigsområdet ritas runt krigets plats och de slag som har utkämpats, med ett område per krigsskådeplats när slagen ligger långt isär (#211). Utzoomat syns bara krigets enda viktigaste händelse (`"top": true`) och krigsområdet. I fokusläget syns krigets alla händelser med årtal, och uppspelningen pausar vid dem som har `"major": true` (går att stänga av i Lager). Valfritt fält `story` på kriget: `intro` (varför kriget började), `parties` (sidor med namn och deltagare), `outcome` (hur det slutade), `casualties` (döda, som spann) och `sources`. Det visas som ett kort när man börjar följa kriget och när uppspelningen når krigets slut. Ett pågående krig har `"ongoing": true` och `edtf` med öppet slut (`2022-02-24/..`); `end` är året då läget kontrollerades och räknas till i år vid laddning, `outcome` är då läget i dag med datum i `story.asOf`, och slutkortet heter "Läget i dag".

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

- **Ny gränssnittstext** läggs i alla fem språkfilerna i `data/ui/` (`sv`, `en`, `de`, `es`, `fr`) i samma pull request.
- **Nytt innehåll** (händelse, fun fact, tur, rike, religion, väg): svenskan skrivs och källkontrolleras först, och översättningarna till `en`, `de`, `es` och `fr` görs i samma pull request. En översättning ändrar aldrig fakta: årtal, siffror, namn, platser och påståenden är desamma som i svenskan. Granskaren kontrollerar källor och översättningar i samma steg.
- **Ändras svenskan** uppdateras översättningarna i samma pull request.
- **Tilltal och stil (beslut 2026-11-07, preciserat 2026-11-08):** artigt tilltal i alla språk (`Sie`, `usted`, `vous`), **utom i texter för elever upp till 13 år** (Samtidighetsjakten och lektion 2, åk 4–6), som har du-form i alla språk ([docs/beslut/2026-11-08-tilltal-efter-alder.md](docs/beslut/2026-11-08-tilltal-efter-alder.md)). Ordlista, tidsangivelser och typografi för spanska och franska: [docs/ordlista-oversattning.md](docs/ordlista-oversattning.md); nya termer läggs till där.
- Antalet oöversatta texter får aldrig öka. Äldre innehåll översätts i omgångar: engelska först, sedan tyska, spanska och franska (docs/beslut/2026-11-06-oversatt-samtidigt.md).

## Bilder (#129)

Varje händelse kan få en bild i fältet `image` (fil, `kind`, stil, bildtext, kredit, licens, och för illustrationer prompten). Stilen följer tidsåldern och platsen enligt `data/styles.json`, och faktarutans ram följer stilen även när bild saknas.

1. **Riktig bild först.** Sök på Wikimedia Commons efter en historisk bild innan en illustration görs. Kontrollera licensen på filsidan och lägg filsidan som källa i `sources.json`. Tillåtet för historiska bilder: public domain, CC0, CC BY, CC BY-SA och Library of Congress-bilder märkta "No known restrictions on publication" (beslut 2026-10-29). Även Library of Congress (loc.gov) går att söka i. Bilden behåller sin egen licens, som står i bildtexten.
2. **Illustrationer märks alltid** med en synlig bildtext, till exempel "Illustration i stil med …, inte en historisk bild". De får aldrig se ut som fotografier eller äkta dokument.
3. **Bilden förmedlar stämning, inte fakta.** Lägg inte in detaljer i bilden som inte stöds av händelsens källa.
4. **Respekt.** Profeten Muhammed avbildas aldrig; Hijra visas med landskap, karavan och arkitektur. Våra egna illustrationer karikerar aldrig folk eller personer. Krig, sjukdom och död får visas när händelsen handlar om det (beslut 2026-10-29; kan anpassas för olika åldrar senare). Även kvarlevor, avrättningar, våld, symboler, flaggor och samtida karikatyrer (till exempel Darwin som apa) får visas när bilden är historiskt relevant för händelsen; bildtexten säger vad bilden visar och om den är en karikatyr eller propaganda, och licensreglerna gäller som vanligt (beslut 2026-11-06). Riktiga personers ansikten får visas, både i historiska porträtt och i illustrationer (beslut 2026-10-30).
5. **Spårbarhet.** Spara stil, verktyg, datum och exakt prompt för varje illustration i `image`.
6. **Filer.** `images/events/<händelse-id>.webp`, 800 × 600 pixlar, helst under 150 kB. `python3 tools/bilder_in.py` konverterar bilder från `images/incoming/` och fyller i `image` i händelsens fil i `data/handelser/` från bildloggen `images/incoming/bildlogg.json`. `python3 tools/bildpromptar.py` skriver promptar till `docs/bildpromptar.md`. Lägg aldrig API-nycklar för bildverktyg i repot.
7. **Platshållare** har `"placeholder": true` och märks "Platshållare" i kortet tills den riktiga bilden finns.

## Utseende

Rikard gillar stilen. Behåll den:

- Mörkt observatorietema (avsiktligt bara mörkt), pergamentfärgat land på djupblått hav, mässing som accent.
- Typsnitt: IM Fell English (rubriker och årtal), Instrument Sans (brödtext), IBM Plex Mono (årtal och metadata).
- Alla färger som CSS-variabler i `:root`. Kategorifärgerna finns i `model.js`.
- Sidan ska fungera i mobilbredd (cirka 400 px) utan horisontell scroll.

## Testa innan du är klar

1. `python3 -m http.server 8000` och öppna http://localhost:8000.
2. Inga fel i konsolen. Globen snurrar, tidslinjen går att dra, uppspelning fungerar, fun facts dyker upp, "Platt vy" och "Källor" (sidan Om källorna) öppnas.
3. Kontrollera all JSON (`python3 -m json.tool data/*.json`) och att varje `sources`-id finns i `sources.json` och varje händelse-id i `funfacts.json` finns i `events.json`. Händelser redigeras i `data/handelser/<period>.json` (perioden efter startåret), inte i `events.json` (#394). Har du ändrat en fil i `data/handelser/` eller `data/empires/index.json`: kör `python3 tools/dela_data.py` och checka in `data/events.json` och `data/genererat/` (sidan läser de uppdelade filerna, #337). Har du ändrat innehåll: kör `python3 tools/oversattning.py` och checka in `data/oversattning.json` (#675); den stoppar ny text utan översättning och inaktuella översättningar.
4. Testa både desktop och mobilbredd.
5. Ändras formuläret för förslag eller `functions/`: kör `node --test 'tests/*.test.mjs'` (se docs/feedback.md).
6. **Röd kontroll (beslut 2026-11-05, skärpt samma dag):** läs loggen och hitta den första felande kontrollen, rätta högst en gång och bara om felet är trivialt (kör bara den felande kontrollen: `ENDAST="<del av namnet>" node tests/webblasare.mjs <port>`), annars lämna en överlämningsrapport och sätt `behöver hjälp` (Codex och Copilot gör så, och Claude Code tar över vid kökontrollen). Se [AGENTS.md](AGENTS.md#röd-kontroll-eller-slut-på-tid-samma-regel-för-alla-agenter-beslut-2026-11-05-skärpt-samma-dag).

## Arbetssätt för idéer, beslut och ändringar

- **GitHub Issues är projektets idélista och backlog.** Varje idé, önskemål eller fel blir ett eget issue. Använd mallarna i `.github/ISSUE_TEMPLATE/` och etiketterna (version-2, idé, data, faktafel, källkontroll, utseende, utanför-kod).
- **Ny idé i chatten:** föreslå att skapa ett issue för den i stället för att bygga direkt, om det inte är en liten ändring. Ber Rikard om det, skapa issuet direkt.
- **Claude Code skapar egna issues (beslut 2026-11-01):** sök först efter dubbletter. Buggar, tydliga brister och små förbättringar som inte ändrar hur sidan fungerar för besökaren skapas direkt; de enkla, utan historiska fakta, får `redo`. Nya funktioner, ändrat utseende, ny data eller nya källor och allt annat som kräver beslut skapas med `beslut-krävs` i milstolpen Senare och påbörjas inte förrän Rikard har sagt ja. Rapporten till Rikard har raden "Nya issues: #…". Codex skapar inga egna issues (AGENTS.md).
- **UX-genomgång (beslut 2026-11-01, utökat 2026-11-02):** en gång om dagen när något nytt har slagits ihop, och alltid inför en release, går Claude Code igenom dev.historiagloben.se i dator- och mobilbredd: tidslinjen, uppspelning, Samtidigt, en händelse, Lager, Fokus (ett rike och ett krig till slutet), bildlagret, Platt vy och Källor. Leta efter konsolfel, sådant som är svårt att hitta eller läsa och sådant som krockar. Den separata, självkritiska **blind-spots-analysen** görs av Codex (se "Codex kör löpande"), inte av Claude Code; den ställer andra frågor än den första rundan: vad tar vi för givet, vad händer när data saknas eller bara delvis finns, ser en reservlösning ut som ett fel, är skillnaden mellan urval och full lista tydlig, och vad händer i laddning, paus, byte och övergångar? Testa särskilt tomma, delvis tomma och blandade lägen, till exempel händelser med och utan bilder. Ett användarfynd som testet missade ska inte bara läggas till som en punkt; det ska också leda till en ändring av testmetoden. Fynden blir issues enligt punkten ovan. Nya fynd efter granskningen förs in som daterade uppföljningar i granskningsrapporten eller på berört issue. Gör också en **täckningsrunda** (beslut 2026-11-03): saknas det fakta eller länder vi borde ha? Kontrollera täckningen per tidsperiod, världsdel och kategori (händelser, riken, fun facts, bilder, källor), tomma celler och glapp, skev balans (till exempel krig mot övrigt, negativt mot positivt) och vilka länder eller riken som saknas efter ett visst år. Listan över det som borde finnas ska bygga på källor (till exempel Cliopatria, Wikidata och etablerade referenslistor), inte på minnet. Resultatet blir en daterad täckningsrapport som Claude Code triagerar till issues; mätningen av var det är tomt görs med `python3 tools/tackning.py` (#563), och listan över vad som saknas bygger på öppnade källor. Varje fullständig analys ska också **benchmarka mot andra sidor och spel** (beslut 2026-11-03): historieatlaser och tidslinjer, geografi- och kunskapsspel, skolmaterial och dataportaler. Syftet är idéer vi kan bli inspirerade av, inte kopiering. Inför en release skrivs en kort rapport i release-PR:en (#150, del C). Hittas inget skrivs inget till Rikard.
- **Byggorder (lärdom 2026-11-03):** agenterna väntar på etiketten `redo`, inte på en kommentar. När Claude Code skriver en byggorder sätts `redo` **i samma steg**, och ordern ska stå i issuet (kommentar eller text). Villkor som "starta efter #N" skrivs i ordern, och etiketten sätts först när villkoret är uppfyllt, annars börjar Codex för tidigt. Vid granskning av en röd svit: leta först efter den första felande kontrollen, eftersom följdfel är vanliga.
- **Arbetssätt för Claude Code i molnet:** `gh pr create` fungerar inte (GraphQL är blockerat); skapa pull requests med `gh api repos/<ägare>/<repo>/pulls` (REST). Wikidata-API:et ger 429 vid många anrop: vänta och hämta färre poster; kunde den andra källan inte jämföras blir nivån `source-checked`, aldrig `two-sources`.
- **"Ta issue #N":** läs issuet, ställ frågor om något är oklart, bygg på en egen gren och öppna en pull request som skriver `Closes #N`.
- **Pull requests** beskrivs på svenska: vad som ändrats, varför, och hur Rikard testar det. Små, avgränsade PR:er hellre än en stor.
- **Beslut:** när vi bestämmer något som påverkar arkitektur, datamodell, källor, licenser, kategorier eller utseende, skriv det som en **egen fil** i [docs/beslut/](docs/beslut/README.md), `ÅÅÅÅ-MM-DD-kortnamn.md` (datum, beslut, kort motivering), i samma pull request. En fil per beslut gör att pull requests inte krockar (beslut 2026-11-03). Den gamla loggen [docs/beslut.md](docs/beslut.md) är fryst.
- **Dokumentation** ligger i `docs/`: [arkitektur.md](docs/arkitektur.md), [datamodell.md](docs/datamodell.md), [beslut.md](docs/beslut.md) (fryst) och [beslut/](docs/beslut/README.md), samt [kallor.md](docs/kallor.md). Uppdatera dem i samma pull request när koden, ett datafält eller ett arbetssätt ändras.
- **Fråga först** innan du ändrar arkitekturen, lägger till beroenden, kategorier eller datakällor med ny licens.
- **Orkestern (#145, permanent sedan #159):** `/orkester [issue eller område]` kör dirigenten och orkestern enligt [.orchestra/project.md](.orchestra/project.md): ett avgränsat pass i PR-läge med högst fyra pull requests, där issues med fakta och data görs med samma modell som dirigenten och dirigenten granskar varje leverans. "Fortsätt med fler issues" startar nästa pass. Filerna i `.orchestra/shared/` redigeras inte här.
- **Två personer, flera agenter (beslut 2026-11-06):** Rikard (`DasKrokodil`) och Andreas (`Einzbeng`) kör var sin uppsättning agenter: Claude Code, Codex och ibland Copilot. **Dirigent är bara Claude Code som körs på Rikards konto.** Kontrollera vems konto du kör på (GitHub-inloggningen, till exempel `get_me` eller `gh api user`) innan du triagerar, sätter `redo` eller granskar. Kör du på Andreas konto är du arbetare: du tar `redo`-issues som alla andra agenter, men triagerar inte, sätter inte `redo`, skapar inga egna issues och ger inga order till andra agenter; fynd skrivs som kommentar i din pull request. Andreas Claude Code får ta `redo`-issues med fakta och data (källpolicyn gäller fullt), och Rikards Claude Code granskar dem fullt. Bara Rikard slår ihop.
- **Etiketterna `redo` och `pågår` (beslut 2026-11-06, ersätter `codex:`/`copilot:`/`orkester:`-etiketterna):**
  1. **`redo`** sätts av dirigenten (eller av Rikard) när ett issue är tydligt avgränsat, saknar olösta beslut och inte krockar med öppna pull requests. Vilken agent som helst får ta det, med ett undantag: Codex och Copilot tar aldrig issues med `data`, `faktafel`, `källkontroll`, rikesarbete eller bilder; de tar bara Claude Code. **Undantag (beslut 2026-11-08):** issues med etiketten `översättning` får Codex och Copilot ta även när de också har `data`, så länge uppgiften är att översätta eller granska en översättning och ingen fakta skrivs eller ändras; ett sakfel de hittar blir ett eget issue med `faktafel` och `källkontroll` för Claude Code. Passar ett issue särskilt en agent kan det stå i issuets text ("Passar: Copilot"), men det är ett tips, ingen spärr.
  2. **Ta ett issue:** kontrollera direkt före att det fortfarande har `redo` och saknar `pågår`, tilldelning och öppen pull request med `Closes #N`. Skriv en kommentar ("Codex (Einzbeng) tar det här", "Claude Code (DasKrokodil) tar det här"), sätt `pågår`, ta bort `redo` och tilldela issuet personen vars konto du kör på (Assignees). Läs issuet igen direkt efteråt: har någon annan hunnit före gäller **den första kommentaren**, och den som kom sist backar (tar bort sin tilldelning och skriver en kommentar).
  3. **Grenen** visar agenten: `claude/…`, `codex/issue-<N>-<namn>` eller `copilot/issue-<N>-<namn>`.
  4. **`pågår` tas bort** när pull requesten är öppnad (tilldelningen står kvar), eller när arbetet avbryts; då tas även tilldelningen bort och `redo` sätts tillbaka om issuet fortfarande går att ta. Ett `pågår` kräver en aktiv arbetare, ett pågående test eller en dokumenterad spärr.
  5. **Högst 4 öppna pull requests per person** (räknat på det konto som öppnade dem; en ändring som byggs räknas som öppen), alltså högst 8 totalt. Ingen tar ett issue som ändrar samma filer som en öppen pull request, oavsett vems den är. **När det är fullt fortsätter arbetet utan nya pull requests**, i den här ordningen: (1) gör klart dina egna (rätta efter granskning, laga röda kontroller, ombasera); (2) gör Codex-granskningen av den andra personens pull requests, så att de blir klara för slutgranskning snabbare; (3) förbered nästa issue: källarbete för fakta-issues (öppnade källors adresser och vad de säger, som kommentar på issuet), synpunkter och testplan; (4) analyser som rapport (täckning, blind spots, benchmark). Bygg inte färdigt på en gren och vänta med pull requesten; arbete som inte syns blir gammalt. Gränsen prövas efter en vecka: höjs om pull requests oftast slås ihop inom ett dygn och agenterna ofta står still, sänks om de väntar mer än två dygn eller ofta måste ombaseras.
- **Codex tar issues (beslut 2026-10-31):** Codex följer [AGENTS.md](AGENTS.md), som pekar hit, tar `redo`-issues enligt punkten ovan och bygger på grenar `codex/issue-<N>-<namn>`. Claude Code granskar Codex pull requests innan Rikard slår ihop.
- **Codex kör löpande (beslut 2026-11-02):** Codex fortsätter på `redo`-kön utan nytt kommando, med högst 4 öppna pull requests per person (en ändring som byggs räknas som öppen) och 3 arbetare som bygger parallellt, där dirigenten inte räknas som arbetare, enligt [AGENTS.md](AGENTS.md). Codex Luna förbereder och lämnar köplaner, Codex Terra bygger. En annan Codex-körning granskar först varje pull request (diff, filkrockar, test, krav; "Codex-granskning: godkänd", beslut 2026-11-02). Claude Code granskar de pull requests som har kommentaren "Klar för Claude Code-granskning", och bara det som kräver dirigentens bedömning: källpolicy, arkitektur och hur det ser ut och fungerar för besökaren. Fakta, data och källor granskas alltid fullt. Svaret är "godkänd" eller konkreta, minimala arbetsorder i samma pull request, och bara Rikard slår ihop. Dirigenten sätter `redo` först när ett issue är tydligt avgränsat, saknar olösta beslut och inte krockar med öppna pull requests eller eget arbete, aldrig på arkitektur. Eget pågående arbete märks som alla andras (`pågår` och tilldelning), och `redo` tas bort om ett issue blir beroende av ett annat spår eller ett beslut. Planer och beslut skrivs som kommentar på berört issue. **Blind-spots-rundan i UX-genomgången görs av Codex (beslut 2026-11-02):** Codex gör den separata, självkritiska analysen (tomma, delvis tomma och blandade lägen, reservlösningar, urval mot full lista, laddning, paus, byte och övergångar) och skriver resultatet som en daterad rapport i `docs/granskningar/`. Claude Code läser rapporten, jämför med öppna issues och gör issues av fynden enligt reglerna ovan, men gör inte själv analysen. **Tre regler för flödet (beslut 2026-11-02):** (1) efter varje ny, uppdaterad eller ihopslagen pull request görs direkt en lätt kökontroll (status, krockar, beroenden, nästa möjliga issue) av `redo`-issues, och nästa blockerade ärende får förberedelsearbete; full granskning görs bara vid de utlösare som anges under "Riskbaserat granskningsflöde"; (2) när en arbetare öppnar eller uppdaterar en pull request börjar den separata Codex-granskningen i samma tur, inte vid nästa heartbeat, CI-resultat eller statusfråga; (3) ett `pågår` måste alltid ha en aktiv arbetare, pågående test eller publicering, eller en dokumenterad extern spärr, annars återupptas, förbereds eller avmarkeras det direkt.
- **Granskningar måste kvitteras med en kommentar (beslut 2026-11-07):** när Rikard eller Claude Code ber en annan agent om granskning ska den lämna en kommentar i pull requesten eller issuet som säger att granskningen är gjord ("Codex-granskning: godkänd" eller "synpunkter"). Har den skapat en fil ska kommentaren säga var den ligger (sökväg, gren och pull request), eller så lämnas synpunkterna som kommentarer direkt i pull requesten. En granskning utan kommentar räknas som inte gjord. Detaljerna står i [AGENTS.md](AGENTS.md#granskar-du-åt-rikard-eller-claude-code-lämna-alltid-en-kommentar-beslut-2026-11-07). Claude Code ska också skriva det i varje granskningsorder.
- **Copilot tar issues (beslut 2026-11-05):** GitHub Copilot (agentläget i VS Code) följer [.github/copilot-instructions.md](.github/copilot-instructions.md), som pekar hit och på AGENTS.md. Copilot tar `redo`-issues enligt "Etiketterna `redo` och `pågår`" ovan och bygger på grenar `copilot/issue-<N>-<namn>`. Copilots pull requests granskas som Codex: Claude Code granskar bara det som kräver dirigentens bedömning, fakta, data och källor alltid fullt, och bara Rikard slår ihop. **Etikettkontrollen (#588, `.github/workflows/etikettkontroll.yml`)** varnar med etiketten `etikettfel` och en kommentar när ett issue har både `redo` och `pågår`, flera `pågår`-etiketter eller är taget men tilldelat flera personer, städar etiketterna när en pull request med `Closes #N` slås ihop och påminner dagligen om ett `pågår` som ingen har rört på 7 dagar; rätta etiketterna och ta aldrig bort `etikettfel` för hand, den försvinner när det stämmer.
- **Modellnivå för Claude Code (beslut 2026-11-02):** Sonnet medium för löpande triage, etiketter, köplanering och normal granskning av pull requests. Sonnet high för större ändringar i gränssnitt, tidslinje och rendering. Opus för arkitektur, historiska fakta och källor, källpolicy, datamodell och beslut som påverkar flera issues. Byt inte modell bara för att uppgiften är lång, utan när den kräver djupare bedömning, och säg kort vilken nivå som passar i början av en större granskning och varför. Rikard byter modell med `/model`.
- **Granskningar från Codex:** när en session eller `/orkester` startar, läs `docs/granskningar/handoff.json` om den finns. Är `status` `ready_for_triage`: läs rapporten i `report`, jämför den med koden, dokumentationen och de öppna issues, rapportera dubbletter och föreslå en prioriterad plan. En fullständig analys ska dessutom gå igenom de närmaste öppna milstolparna: alla relevanta issues och PR:er, beroenden, filkrockar, historiska fakta- och källkrav, vilka delar Codex respektive Claude Code bör ta, testnivå och minsta säkra arbetsordning. Den ska också analysera hur samarbetet mellan Codex och Claude Code kan göras effektivare: rätt agent och modellnivå för varje uppgift, handoff-kvalitet, granskningsgrindar, parallellism, token- och kontextkostnad samt onödig ställtid eller ombasering. Den planen ska stämmas av mot projektvyn så att den visuella kön och rapporten inte säger olika saker. Genomför inget och skapa inga issues förrän Rikard har godkänt planen. Efter godkänd triage: sätt `status` till `triaged` och lägg till `triagedAt` (i en pull request). Se [docs/granskningar/README.md](docs/granskningar/README.md).
- **Riskbaserat granskningsflöde (beslut 2026-11-03):** Den fulla review- och testkedjan körs inte efter varje issue. Efter varje PR görs en lätt kökontroll av status, krockar, beroenden och nästa möjliga issue. Full review triggas av avslutad batch eller milstolpe, kritisk bugg, större central ändring, releasekandidat eller uttrycklig begäran. Isolerade och reversibla ändringar får snabbare merge med riktad kontroll om accepterad risk och uppföljning är dokumenterad. Full kontroll krävs fortsatt för fakta, källor, datamodell, arkitektur, säkerhet, centrala flöden och release. Release förbereds när kriterierna är uppfyllda men publiceras först efter releasekontroll och Rikards godkännande. Veckoplaner ska uppskatta tokenkostnaden som intervall separat för Codex-förberedelse, Codex-implementation/granskning och Claude Code-triage/slutgranskning, med osäkerhet, reserv och faktisk förbrukning efteråt.
- **Sådant som inte är kod** (namn, domän, fysisk glob, hårdvara, affärsfrågor) planeras i Rikards Claude-projekt "Historia-globen", inte här. Om sådant kommer upp: påminn Rikard om det och skapa högst ett issue med etiketten `utanför-kod` som anteckning.

## Versionsplan

**GitHub-milstolparna är huvudkällan** för vad som ingår och vad som pågår. Versionsnumren nedan beskriver ordningen och upprepas inte i andra dokument. Version 2–5.0 och rikena R1–R7 är klara och släppta, senast **v5.0.0** (2026-11-06), som också innehåller 4.2, 4.3, 5.1a, 5.1c och de första delarna av 5.2 (sök och delbara länkar). Kvar i 5.1 är bilderna till kärnhändelserna (#453 i 5.1b). Ordningen ändrades 2026-10-31 (docs/beslut.md): först det som gör sidan stabil och användbar i skolan, sedan de dyra specialfunktionerna. Tekniska förutsättningar byggs före de funktioner som behöver dem.

| Version | Innehåll |
|---|---|
| 4.2 Stabilitet och tillgänglighet | Upptäcktsvyn (#375, #376, #378; dimman över riken #377 ligger i R7), tangentbord och zoom (#386, #362), kontroll efter publicering (#388), läsbar tidslinje (#298), faktarutor och introduktion (#359, #363, #364) och små förenklingar |
| 4.3 Teknisk grund | main.js delas upp och tillståndet blir centralt (#389, utan adressdelen som är #501 i 5.2), lättare mobilrendering (#390), JSON Schema (#391), lagertypen bildlager (#54) |
| 5.0 Guidade berättelser | Turformat som data (#47), turer om andra och första världskriget (#13, #48), berättelseläget med kapitel och frågor (#247) och slutkort med det viktigaste att ta med sig (#500). Rikens fall (#499) och tidslinjebläddraren (#231) flyttades till senare (2026-11-06) |
| 5.1 Global täckning, delad i tre (beslut 2026-11-03) | **5.1a** redigeringsformat (#394), **5.1b** kärnhändelser (#452) och deras bilder (#453) i källkontrollerade batchar om högst 20 per PR, **5.1c** massimport per världsdel (#61) när format, schema, källflöde och täckningsmått är stabila. Granskningsvyn för människor (#62) är stängd (#252) |
| 5.1d Stabilisering (2026-11-06) | Efter helhetsanalysen (docs/granskningar/2026-11-06-gemensam-rekommendation.md): mobilkortet (#706), låsning utan grafikkort (#692), webbläsartestet i Firefox och WebKit (#702), skarp CSP (#707), zoom och tangentbord i testet (#708) |
| 6.0.0 Skolpaketet | Quiz (#65), turlänk (#736), lärarfält i turerna (#737), utskrift av elev- och lärarblad (#738), lektion 1 åk 7–9 (#739) och lektion 2 åk 4–6 (#740), Samtidighetsjakten (#741), Källdetektiven (#742), lektionsläget (#795) och lärarpaket (#743). Ingen pilot med lärare och klass görs nu (#744 stängd, beslut 2026-11-07); släpps som 6.0.0 (#862, plan i docs/granskningar/2026-11-07-plan-version-6.md) |
| 6.0.1 Rättningar efter skolreleasen | Fynd ur blind-spots-rundan (#871, #877–#884), lärarens väg till bladen (#885), Samtidigt mot Mer/Meny (#887), tomma filter (#886), webbläsartestet (#864, #891, utredningen av Firefox och WebKit #890), adressens kapplöpning (#865) och de fem händelserna före tidslinjens start (#892) |
| 6.1.0 Tidsintervall, plats och epoker | Ersätter "Version 5.2" (beslut 2026-11-08, docs/beslut/2026-11-08-version-6-1-0.md): tidsintervall (#569 i #754–#756), "Vad hände här?" (#15), faktarutans förklaring (#786) och epoker enligt svenska läroplanen (#845, #476, listan godkänns först). Lägeskontraktet (#893) ska vara avgjort före #755; sök och delbara länkar släpptes redan i v5.0.0 |
| 6.2.0 Regionkort | Regionkort (#579): kurerade kort per region, med gränskälla, licens och källor godkända före bygge |
| 7 Människans långa historia | Tidsmodell för ungefärliga datum, tidslinje i nivåer (#49), människoarter (#11) |
| 8 Jordens historia | Eget läge med geologisk tidslinje och forntida kartor (#12, #51–#53) |
| 9 Atlas och jämförelse | Jämför två tider (#248), historiska kartor (#249), skolatlasens bildlager (#8, #9, #55) |

Parallella spår (milstolpar utan versionsnummer, görs bredvid huvudversionerna):
- **Innehållspaket:** vetenskap, medicin, teknik, rymdfärdens milstolpar (#84) och temavyer (musik, litteratur, filosofi, ekonomi, personer, byggnadsverk, perspektiv). Paketen blockerar inte varandra eller huvudversionerna.
- **Språk: översättning** (#63, #670–#679): gränssnittets texter en del i taget, sedan innehållet per period, engelska först (beslut 2026-11-06).
- **Riken:** R1–R7 är klara; nu pågår milstolpen "Riken: global täckning" (#556, #644–#646).
- **Hårdvara** (H1–H3): anteckningar, planeringen sker i Rikards Claude-projekt.
- **Experiment och senare:** experimenten är delade i "Historiska datum och utskrift", "Flöden och rörelse", "Lekar och tankeexperiment" och "Rymden". "Senare" är delad i "beslut krävs", "teknik" och "innehåll och media". "Teman: temamotor" (#398) är förutsättningen för temavyerna, och "Paket: Temavyer och innehåll" är en samlingsrubrik, inte en arbetsmilstolpe. Bilder görs i "Bilder: batchar".

Regler:
- **Varje version slutar med att Rikard utvärderar** innan nästa börjar.
- **Stora datamängder fylls på först när tekniken för dem fungerar.**
- **Varje paket och varje version ska ha innehåll från flera världsdelar**, eftersom öppna data har slagsida mot Europa.
- Nya datakällor läggs in i README:ns licensavsnitt när de faktiskt används, inte innan.

## Öppna frågor (Rikard bestämmer)

- Ska projektet få en egen .se-domän, och behålls namnet Historia-globen eller blir det ett internationellt namn?
- Vilket fördjupningsläge kommer först (till exempel andra världskriget)?

## Beslutslogg

Beslut före 2026-11-03 finns i [docs/beslut.md](docs/beslut.md) (fryst) och nyare beslut som en fil vardera i [docs/beslut/](docs/beslut/README.md). **Läs båda innan du ändrar arkitektur, datamodell, källor, licenser, kategorier eller utseende.** Nya beslut skrivs som egen fil `docs/beslut/ÅÅÅÅ-MM-DD-kortnamn.md`, med datum, beslut och kort motivering, i samma pull request som ändringen.
