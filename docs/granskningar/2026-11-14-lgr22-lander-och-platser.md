# Lgr22: länder, Norden, landskap och regioner i kursplanerna (#1265)

**Datum:** 2026-11-14. **Status:** underlag till DasKrokodil och till #1163 (lektionsläget). Ingen kod och ingen text i appen är ändrad; alla ändringar nedan är **förslag**. Skriven av Claude Code (Opus) på DasKrokodils konto.

**Varför:** lärarens del i planeringen av ländernas historia (`docs/granskningar/2026-11-12-planering-regionhistoria.md`, punkt 8.2 och 54, pull request #1259) byggde på antaganden, eftersom kursplanerna inte gick att öppna då. Här är de öppnade.

## Öppnade källor (alla 2026-11-14)

| Käll-id i `data/sources.json` | Vad | Öppnad |
|---|---|---|
| `skolverket-lgr22-historia` | Kursplan i historia, GRGRHIS01 (syfte, centralt innehåll åk 1–3, 4–6, 7–9, betygskriterier) | ja, hela sidan |
| `skolverket-lgr22-geografi` (ny) | Kursplan i geografi, GRGRGEO01 | ja, hela sidan |
| `skolverket-lgr22-samhallskunskap` (ny) | Kursplan i samhällskunskap, GRGRSAM01 (bara sökt efter regioner, kommuner och urfolk) | ja, delvis läst |
| `skolverket-kommentar-geografi` (ny) | Kommentarmaterial till kursplanen i geografi, Skolverket 2022, 43 s. (pdf) | ja, sökt och läst kring namn, läge, länder, regioner, landskap |
| `skolverket-kommentar-historia` (ny) | Kommentarmaterial till kursplanen i historia, Skolverket 2022, 42 s. (pdf) | ja, s. 21–35 lästa |

Kursplanen i historia öppnades igen 2026-11-14 och stämmer med det som perioderna bygger på; kontrolldatumet 2026-11-08 står kvar, eftersom `tests/perioder.test.mjs` låser det till perioderna. Kursplanerna på webben har inga sidnummer; citaten anger stadium och rubrik. Kommentarmaterialens sidnummer är de tryckta. Båda kursplanerna anger "Ämne gäller från 2022-07-01".

**Licens:** sidan "Om webbplatsen" på skolverket.se anger inga villkor för återanvändning (öppnad 2026-11-14), som beslutet `docs/beslut/2026-11-08-epoknamn-egna-formuleringar.md` redan konstaterade för kursplanen i historia. Källorna är därför bara länkade. Rapporten har korta citat med källhänvisning och i övrigt egna sammanfattningar; ingen text är kopierad till `data/`. Upphovsrättslagen kunde inte öppnas (riksdagen.se och lagen.nu nekas av sessionens nätverk), så rapporten säger inget om lagens undantag för författningar.

## 1. Vad kursplanerna säger

### Åk 1–3 (samhällsorienterande ämnen, gemensamt centralt innehåll)

- Namn och läge: "Namn och läge på världsdelarna och världshaven samt på länder och platser som är betydelsefulla för eleven" (Att leva i världen).
- Norden: "Norden befolkas" och levnadsvillkor under "nordisk stenålder, bronsålder och järnålder".
- Närområdet: hemortens historia och "närområdets natur- och kulturlandskap".
- Migration "inom ett land och mellan länder".
- Kommentarmaterialet: "Kursplanen anger inte vilka namn på länder och platser som ska behandlas i undervisningen" (geografi s. 18, historia s. 16); urvalet görs av lärare och elever.

### Åk 4–6

**Historia.** Alla tre kunskapsområden är avgränsade till Norden, med Sverige i centrum:
- "Kulturmöten och statsbildning i Norden, cirka 800–1500": Nordens kulturmöten "med andra delar av världen" genom vikingars resor och medeltidens handel; statsbildning och kristendomens etablerande i Norden.
- "Maktförhållanden och levnadsvillkor i Norden, cirka 1500–1800": kampen om makten i Norden, reformationen, stark kungamakt i Sverige, "Det svenska Östersjöväldet" och konsekvenser "för människor runt Östersjön".
- "Folkökning, ändrade maktförhållanden och emigration, cirka 1800–1900": "Nya maktförhållanden i Sverige och mellan länder i Norden", jordbrukets omvandling, tidig industrialisering i Sverige, emigrationen från Sverige.
- Kommentarmaterialet (historia s. 24): statsbildningen visar att Sverige "inte alltid har funnits som nation", i en tid då "varken nationella gränser eller nationella identiteter existerade". S. 25: kampen om makten syftar främst på hur den svenska kungamakten lämnade Kalmarunionen. S. 27: 1809 och Kielfreden nämns som exempel på nya maktförhållanden. S. 28: jordbruksomvandlingen gav bönderna "i Sverige och Danmark" utökad rätt till jorden. Danmark, Norge och Finland nämns alltså som delar av Nordens historia, inte som egna studieobjekt.
- Progression (historia s. 23): "närområdet i årskurserna 1–3, via Sverige och Norden i årskurserna 4–6, till Europa och världen i årskurserna 7–9".

**Geografi.**
- "Namn och läge på geografiska objekt i Sverige, Europa och världen. Ett urval av hav, sjöar, floder, berg, öknar, regioner, länder och städer."
- "Utmärkande drag för några natur- och kulturlandskap i Sverige, Europa och världen."
- "Beskrivningar och enkla analyser av platser och regioner med hjälp av kartor".
- Kommentarmaterialet (geografi s. 26): formuleringen Sverige, Europa och världen pekar på "en mer detaljerad kunskap om det land och den världsdel som eleverna bor i", medan undervisningen "zoomar ut mer" för andra världsdelar. Kursplanen "specificerar inte exakt vilka namn som alla elever ska lära sig".
- Betygskriterier åk 6: kunskaper om "namn och lägen på platser och regioner i Sverige, Europa och världen".

**Samhällskunskap.** "kommuner, regioner och stat" (det offentligas ekonomi) och de nationella minoriteterna, däribland "urfolket samerna".

### Åk 7–9

**Historia.** Europa och världen:
- "Samhällsomvandlingar: framväxten av civilisationer och industrisamhällen" (utan årtal): "Framväxten av högkulturer i olika delar av världen, till exempel i Afrika, Amerika och Asien", antiken, "Europeisk kolonisation och slavhandel", industrialiseringen "i Europa och Sverige", revolutioner.
- "Imperialism och världskrig, cirka 1850–1950": nationalism, imperialism, demokrati och diktatur, världskrigen, Förintelsen och Gulag.
- "Demokratisering och ökad globalisering, cirka 1900 till nutid": demokratiseringen i Sverige och välfärdssamhället, kalla kriget, långa linjer (levnadsvillkor, migration, makt).
- Kommentarmaterialet (historia s. 29): "rimligt att sträva efter en geografisk spridning av de civilisationer som behandlas"; högkulturer i Amerika och Afrika söder om Sahara kopplas till mötet med kolonialmakterna. S. 34–35: perioden från cirka 1900 "utgår både från ett nationellt och från ett globalt perspektiv".

**Geografi.** "Namn och läge på platser och regioner som är relevanta för studierna av geografiska förhållanden, mönster, processer och hållbarhetsfrågor." Kommentarmaterialet (s. 27): innehållet i 7–9 är "avgränsat" till sådana namn, eftersom tidigare stadier är "en grundkurs i namngeografi".

**Samhällskunskap.** "Länders och regioners beroende av varandra i en globaliserad ekonomi" och "Sveriges politiska system med Europeiska unionen, riksdag, regering, Sametinget, regioner och kommuner"; samernas ställning som urfolk.

### Det kursplanerna inte säger

- **Landskap i betydelsen provins (Skåne, Uppland) nämns inte** i någon av de tre kursplanerna. Ordet landskap betyder där alltid natur- och kulturlandskap ("hur dessa formar och förändrar landskapet"); kommentarmaterialet kallar landskap ett organiserande begrepp vid sidan av plats, region och rum (geografi s. 9).
- **Län och delstater nämns inte.** "Regioner" i geografi är ett allmänt geografiskt begrepp; i samhällskunskap betyder det den politiska nivån (regioner och kommuner).
- **Inga enskilda länder utanför Norden nämns** i kursplanerna. Världsdelarna Afrika, Amerika och Asien nämns i historia 7–9 (högkulturer och global handel).

## 2. Antagandena i planeringen mot kursplanerna

| Antagande (planeringen 2026-11-12) | Kursplanerna | Bedömning |
|---|---|---|
| "Landskap passar troligen åk 4–6, delstater åk 7–9" | Varken landskap (provins) eller delstater nämns. Åk 4–6 geografi har "regioner" i urvalet; 7–9 platser och regioner "relevanta för studierna" | **Stöds inte och motsägs inte.** Nivån är lärarens val. Landskap kan motiveras i 4–6 som en region i Sverige, men inte som "kursplanens nivå" |
| Åk 4–6: "mitt land i världen: Sverige, Danmark, Norden" | Historia 4–6 är Norden 800–1900 med Sverige i centrum; geografi 4–6 har Sverige, Europa och världen | **Stöds** för Sverige och Norden. Danmark nämns i kommentarmaterialet som del av Nordens historia |
| Åk 7–9: "jämför två länder, källkritik" | Historia 7–9: högkulturer i olika världsdelar, kolonisation, imperialism, källkritiska kriterier; geografi 7–9: platser och regioner i studiernas sammanhang | **Stöds delvis.** Att jämföra länder står inte i kursplanen, men källkritik och långa linjer gör det |
| Risk: dagens gräns läses som att landet alltid fanns | Kommentarmaterialet: Sverige har "inte alltid … funnits som nation" (historia s. 24) | **Stöds**: precis det kursplanen vill lära ut |
| Urfolk och kolonialism | Historia 7–9: kolonisation och slavhandel; samhällskunskap: samerna som urfolk | **Stöds** (urfolk står i samhällskunskap, inte i historia) |

## 3. Pilotländerna mot kursplanerna

Siffrorna i sista kolumnen är en grov textsökning i `data/events.json` (händelser som inte är `draft` och nämner landet eller en kultur där i svensk titel eller sammanfattning, 1 146 händelser), **inte** händelser inom landets gräns. De visar ungefär var tyngdpunkten ligger, inget mer. **Starkt, Medel och Svagt är vår bedömning** av hur väl landet passar kursplanens innehåll, inte kursplanens ord.

| Land | Åk 4–6 | Åk 7–9 | Omnämnanden per Lgr22-period (före 800 / 800–1500 / 1500–1800 / 1800–1900 / 1900–) |
|---|---|---|---|
| Sverige | **Starkt**: hela historia 4–6; geografi "Sverige, Europa och världen" med mest detalj om eget land | **Starkt**: industrialisering i Sverige, demokratisering och välfärd | 5 / 4 / 26 / 9 / 8 (52; 25 krig) |
| Danmark | **Medel** (som del av Norden: Kalmarunionen, kampen om makten, jordbruket) | Svagt (Europa) | 1 / 6 / 13 / 5 / 14 (39; 18 krig) |
| Etiopien | Bara geografi (namn och läge i världen) | **Medel**: högkulturer i Afrika; imperialism 1850–1950 | 7 / 2 / 5 / 4 / 1 (19) |
| Peru | Bara geografi | **Starkt**: högkulturer i Amerika, kolonisation (kommentarmaterialet s. 30) | 10 / 4 / 9 / 1 / 3 (27) |
| Japan | Bara geografi | **Medel**: högkulturer i Asien, imperialism och världskrig | 1 / 7 / 15 / 2 / 16 (41; 25 krig) |
| Australien | Bara geografi | **Medel**: europeisk kolonisation och imperialism | 6 / 0 / 7 / 5 / 14 (32) |

Slutsatser:
- **Sverige och Danmark är de enda pilotländerna som hör hemma i historia 4–6.** Kortet för åk 4–6 bör därför byggas runt Norden 800–1900. Fyra länder utanför Europa hör till historia 7–9 och till geografins namn och läge.
- **Luckor för 4–6** (grov sökning, ingen träff): Dackefejden och jordbrukets omvandling (skiftena) saknas. Kursplanen nämner också reformationen och emigrationen, som finns. Luckorna bör källkontrolleras i #1262 och #1263, inte här.
- **Lucka för 7–9:** välfärdssamhället ("Demokratisering och ökad globalisering, cirka 1900 till nutid") har ingen träff.
- **Samerna** är ingen lucka i historia 4–6 (kursplanen nämner dem där bara i åk 1–3, samisk religion), utan en koppling till samhällskunskap: de nationella minoriteterna och "urfolket samerna" (4–6) och samernas ställning som urfolk (7–9). Globen har en träff (`sametinget-inrattas`, 1993).
- **Krig dominerar** för Sverige, Danmark och Japan. Kursplanen lägger tyngden på de långa linjerna levnadsvillkor, migration och makt (historia s. 22–23), så hållbarhetströskeln i #1269 (högst hälften krig) går i samma riktning som kursplanen.
- **Etiopien har bara en träff efter 1900.** Om Etiopien ska bära imperialism och världskrig i 7–9 behöver kortet källkontrollerade händelser 1850–1950 (#1270).

## 4. De fasta raderna i kortet mot kursplanerna

Lästa i `data/ui/sv.json`, `data/platser.json` och `js/focus/place.js` (mallen i `showPlace`, rad 19–27, och menyn, rad 72–76).

| Rad | Text i dag | Mot kursplanen | Förslag (inte gjort) |
|---|---|---|---|
| `place.borderNote` | "Linjen på kartan visar dagens gräns, inte den gräns som gällde då." | Stämmer med statsbildning och "inga nationella gränser" (historia s. 24) | Behåll |
| `intro` (Sverige, Danmark) | "Följ området som i dag är …" och "Det är ett urval, inte en heltäckande historia." | Stämmer: kursplanen lämnar urvalet till läraren (geografi s. 18, 26) | Behåll. Grönland och Nya Zeeland säger "Följ Grönland …", inte "området som i dag är"; överväg samma mönster (fem språk) |
| `place.type.landskap` och `place.typeOf` | "Landskap" och "Landskap i Sverige" (Skåne) | Kursplanerna använder "landskap" om natur- och kulturlandskap, aldrig om provins. Elever i åk 4–6 möter ordet i den betydelsen i geografi | Behåll typetiketten och lägg en förklarande rad i kortet, till exempel "ett av Sveriges gamla landskap, inte ett län" (fem språk). Frågan förs till ordlistan #1266, inte till ett eget issue. Att elever i 4–6 ändå möter provinsbetydelsen (i läromedel eller hemma) är ett **antagande**; kursplanerna säger inget om den |
| Skånes `intro` | "inom dagens gräns för Skåne län" | Län nämns inte i kursplanerna; samhällskunskap talar om "regioner" | Behåll "Skåne län" (det är vad konturen är), men lärarfältet kan förklara län, region och landskap |
| `place.type.country` | "Land" | Kursplanerna säger "länder"; kommentarmaterialet (historia s. 24–25) säger "Sverige … som nation" och "stater i Norden" | Behåll; ordlistan #1266 bör skilja land, stat, rike och nation |
| `focus.note.places`, `place.filters`, `place.events`, `place.emptyYear` | Urval, alla kategorier, antal, tomt år | Neutrala | Behåll |

## 5. Till lektionsläget (#1163)

- **Kursplanskoppling för en tur med platssteg:** stegfältet som öppnar en plats passar bäst i en tur för **åk 4–6 om Norden** (Sverige och Danmark 800–1900) och i turer för **åk 7–9** om högkulturer, kolonisation och imperialism (Peru, Etiopien, Japan, Australien). Turens `lesson.curriculum` kan då hänvisa till både historia och geografi, till exempel "Kopplad till Lgr22, geografi i årskurs 4–6: namn och läge på länder och regioner i Sverige, Europa och världen" med källan `skolverket-lgr22-geografi` (nu i källregistret). Skrivs som egen formulering och "kopplad till", aldrig "godkänd av Skolverket" (beslut 2026-11-07).
- **Lärarfältet** kan ta upp skillnaden mellan land i dag och stat då, med stöd i kommentarmaterialet (historia s. 24), och mellan landskap, län och region.
- Inget i kursplanerna talar för eller emot att eleverna öppnar platskort fritt; det är en fråga om lektionsläget, inte om Lgr22.

## 6. `data/perioder.json` (indelningen `lgr22`) mot kursplanen i historia

| Period | Kursplanen | Avvikelse |
|---|---|---|
| `norden-800-1500`, 800–1500, åk 4–6 | "Kulturmöten och statsbildning i Norden, cirka 800–1500" | Ingen |
| `norden-1500-1800`, 1500–1800, åk 4–6 | "Maktförhållanden och levnadsvillkor i Norden, cirka 1500–1800" | Ingen |
| `norden-1800-1900`, 1800–1900, åk 4–6 | "Folkökning, ändrade maktförhållanden och emigration, cirka 1800–1900" | Ingen |
| `imperialism-varldskrig-1850-1950`, 1850–1950, åk 7–9 | "Imperialism och världskrig, cirka 1850–1950" | **Namnet "Imperier och världskrig"** byter ord: imperialism (en politik) blir imperier (stater). Namnen är egna formuleringar enligt beslutet 2026-11-08, men betydelsen bör vara densamma, och lektionsturen om andra världskriget säger "Imperialism och världskrig". Förslag: "Imperialism och världskrig, cirka 1850–1950" på fem språk (kräver DasKrokodils ja eftersom beslutet gäller namnen) |
| `demokratisering-globalisering-1900-`, 1900–, öppen, åk 7–9 | "Demokratisering och ökad globalisering, cirka 1900 till nutid" | Ingen |
| (saknas) | "Samhällsomvandlingar: framväxten av civilisationer och industrisamhällen", åk 7–9, utan årtal | Avsiktligt utelämnad (inga årtal), som filens `note` och `docs/datamodell.md` säger. Ingen avvikelse |

Övrigt:
- Årtal, stadier och giltighetsdatum (2022-07-01) stämmer. Alla fem perioder har rätt `grades`.
- Indelningen `norden-forntid` (stenålder, bronsålder, järnålder) motsvarar SO-innehållet "Norden befolkas" i **åk 1–3**, men har inget `grades`. Förslag: `grades: "1–3"` (schemat tillåter vilken sträng som helst). **Stadiet (åk 1–3) kommer då från kursplanen** (`skolverket-lgr22-historia`, SO-innehållet "Att leva i världen"), **årtalen från Historiska museet** (`historiska-perioder` m.fl.), så perioderna får båda källorna.
- `docs/datamodell.md` (lektionsturerna, #1279) skriver att årskurs 4–6 "handlar bara om Norden". Det stämmer för kunskapsområdena, men det första nämner Nordens kulturmöten "med andra delar av världen". En nyans, ingen rättning krävs.

## 7. Experter

- **Lärarlinsen** (`larare`) har granskat rapporten 2026-11-14 via dirigenten, utan att själv öppna källorna. Fynden är rättade: välfärdssamhället flyttat till 7–9, samerna som koppling till samhällskunskap, Danmark Medel i 4–6, bedömningsskalan förklarad, förklarande rad i stället för ny typetikett och stadiet och årtalens olika källor i avsnitt 6. Citaten kontrollerades igen mot de öppnade källorna samma dag (bland annat "nordisk stenålder, bronsålder och järnålder" i åk 1–3 och kommentarmaterialet i historia s. 24 och s. 30).
- **Historikern** (`historiker`) granskade rapporten 2026-11-14 och kontrollerade alla citat och sidnummer ordagrant mot källorna (utom textsökningssiffrorna i tabellen i avsnitt 3). Godkänd med en rättning: i avsnitt 4 (`place.type.country`) kommer "Sverige … som nation" och "stater i Norden" ur kommentarmaterialet, inte ur kursplanerna; rättat.

## 8. Förslag på nya issues (skapas inte här)

1. **Periodnamnet "Imperier och världskrig"** ändras till "Imperialism och världskrig" på fem språk (`beslut-krävs`, berör beslutet 2026-11-08 om egna epoknamn).
2. **`grades: "1–3"` på Nordens forntid** i `data/perioder.json` med kursplanen som källa (litet, data).
3. **Luckor** att källkontrollera i Sverige- och Danmarkskorten (#1262, #1263): Dackefejden och jordbrukets omvandling (åk 4–6) och välfärdssamhället (åk 7–9). Läggs som kommentar på de issuen, inget nytt issue.

Inget eget issue: ordet "landskap" och den förklarande raden förs till ordlistan #1266.

## 9. Förslag till lärarfält och lektion (inte gjort)

- **Lärarfältet om land, stat, rike och nation** (i platskortens lektioner och i ordlistan #1266): *land* är området inom dagens gräns, som kortet visar; *stat* och *rike* är den makt som styrde området då, och de syns som riken på globen; *nation* är en gemenskap och en identitet som växte fram senare. Hur vet vi det? Kommentarmaterialet i historia (s. 24) säger att Sverige "inte alltid har funnits som nation" utan växte fram när "varken nationella gränser eller nationella identiteter existerade". Lärarfältet ska använda det som exempel på källa och skrivas med egna ord; definitionerna ovan är vårt förslag och behöver källa innan de skrivs in.
- **Lektionsidé för åk 7–9: jämför två pilotländer**, till exempel Peru och Etiopien. Följ båda korten genom samma period, före och efter mötet med europeiska kolonialmakter eller imperialismen, och fråga: vilka händelser finns på globen, vad säger källorna, och vad saknas? Stöd i kursplanen: högkulturer i Afrika och Amerika, kolonisation och imperialism och källkritiska kriterier; kommentarmaterialet s. 29 ("geografisk spridning") och s. 30. Förutsätter att korten för Peru och Etiopien finns (#1270, #1271) och stegfältet i turer (#1163).
