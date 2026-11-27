# Lgr22, historia: kontrollista mot globens innehåll (åk 4–6 och 7–9)

**Skapad:** 2026-11-27 (#1342, milstolpe 6.8.0). **Status:** utkast. Kontrollistan visar vad kursplanen i historia tar upp och vad globen, turerna, lektionerna, uppdragen och quizet har som svarar mot det i dag. Ingen kod, data eller text i appen är ändrad. Ingen lärare har granskat listan (ingen pilot, beslut 2026-11-07); bedömningarna är dokumentation av vad som finns i repot, inte ett utlåtande om undervisning.

## Källa och version

| | |
|---|---|
| Källa | Kursplan i historia för grundskolan (GRGRHIS01), Lgr22, Skolverket. Käll-id `skolverket-lgr22-historia` i [data/sources.json](../../data/sources.json). |
| Sidan | https://www.skolverket.se/undervisning/grundskolan/laroplan-lgr22-for-grundskolan-samt-for-forskoleklassen-och-fritidshemmet/curriculums/LGR22/GRGRHIS01 |
| Öppnad | 2026-11-27, via Skolverkets öppna API för läroplaner (`https://api.skolverket.se/syllabus/v1/subjects/GRGRHIS01`), som ger samma kursplanetext som webbsidan. |
| Version | Ämnets version 14, ändrad 2024-02-09 (versionsanteckning hos Skolverket: "Redigering av rubrik för betygskriterier"), gäller från 2022-07-01. Alltså samma centrala innehåll som när perioderna i `data/perioder.json` byggdes (2026-11-08). |
| Nya kursplaner (#843) | Skolverket skickar förslag till nya läro- och kursplaner på remiss 9 november 2026–20 januari 2027 och lämnar omarbetade förslag till regeringen 14 maj 2027 (nyhet från 2026-11-04, öppnad 2026-11-27: https://www.skolverket.se/om-skolverket/nyheter-och-pressmeddelanden/nyheter/nyheter/2026-11-04-manga-forandringar-i-de-nya-laro--och-kursplanerna). Nyheten säger att visst innehåll i förslagen har flyttats mellan stadier och ämnen. **Den här listan gäller alltså gällande Lgr22, inte förslagen**, och ska göras om när nya kursplaner är beslutade (se #843). |

**Så är punkterna återgivna.** Skolverkets sida anger inga villkor för återanvändning (se beslutet [2026-11-08-epoknamn-egna-formuleringar](../beslut/2026-11-08-epoknamn-egna-formuleringar.md) och CLAUDE.md, Licenser). Därför står bara de nio korta områdesrubrikerna som citat, och varje punkt under dem är sammanfattad med egna ord. Issuet #1342 föreslog ordagrann återgivning av punkterna; det gjordes inte här, i linje med regeln att aldrig kopiera text, och DasKrokodil kan besluta om ordagrann återgivning som citat om det önskas. Åk 1–3 ingår inte. Kommentarmaterialet till kursplanen finns som `skolverket-kommentar-historia`; hur det tolkar länder och regioner står i [2026-11-14-lgr22-lander-och-platser.md](../granskningar/2026-11-14-lgr22-lander-och-platser.md).

## Så är täckningen bedömd

- **Händelser:** rubriker (och för osäkra fall sammanfattningar) i `data/events.json` (1 581 händelser) lästes mot punkten. Id:n nedan är de som svarar mot punkten enligt den läsningen; det är inte en uttömmande sökning och inte en bedömning av hur väl de förklarar punkten. Där inget hittades står "inget hittat", och sökningen som gjordes står i kolumnen.
- **Turer och lektioner:** `data/turer/`. Sju turer finns, varav fem har lektion (`lesson`): `vikingatiden-och-varlden` (åk 4–6), `hanrikets-fall`, `songhairikets-fall`, `vastroms-fall` och `andra-varldskriget` (alla åk 7–9). `forsta-varldskriget` är en tur utan lektion. Tre källkritiska turer saknar lektion: `hur-vet-vi-det-har`, `vad-vet-vi-egentligen`, `det-har-har-du-hort`.
- **Uppdrag och quiz:** `data/uppdrag.json` har tre samtidighetsjakter (år 1500, omkring år 1000, år 1945); `data/quiz.json` har tio frågor som jämför två händelser. `data/missuppfattningar.json` har 18 vanliga missuppfattningar.
- **Bedömning:** **Täcks** = händelser och minst en tur eller lektion. **Delvis** = händelser eller en tur men inte hela punkten. **Lucka** = inget i repot som svarar mot punkten, eller bara något som är en tolkning. Luckor är påståenden om repot, inte om världen.

## Åk 4–6

### "Kulturmöten och statsbildning i Norden, cirka 800–1500"

| # | Punkten med egna ord | Händelser | Turer, lektioner, uppdrag, quiz | Bedömning |
|---|---|---|---|---|
| 4–6 A1 | Nordens möten med omvärlden genom vikingars resor och medeltidens handel | `lindisfarne`, `ansgar-i-birka`, `hansan-vaxer-fram`, `hansan-pa-bryggen`, `reval-blir-hansastad`, `riga-blir-hansastad` | Lektionen `vikingatiden-och-varlden` (åk 4–6, 9 steg, 793–1068, kopplad till punkten i `lesson.curriculum`); uppdraget `samtidighetsjakten-ar-1000`; quizparet `lindisfarne-diamantsutran` | **Täcks** |
| 4–6 A2 | Hur stater bildades och kristendomen kom till Norden, och vad det ledde till | `jellingestenen`, `slaget-vid-stiklestad`, `lund-blir-arkebiskopssate`, `uppsala-blir-arkebiskopssate`, `lunds-domkyrka-invigs`, `kalmarunionen-bildas`, `abo-domkyrka-invigs` | Ingen tur eller lektion om statsbildning; lektionen om vikingatiden slutar 1068 | **Delvis** (bara händelser) |
| 4–6 A3 | Likheter och skillnader i levnadsvillkor för barn, kvinnor och män under perioden | Närmast: `osebergskeppet`, `digerdoden-nar-norge`. Ingen händelse som handlar om barns, kvinnors eller mäns villkor hittades i titlarna | Inget | **Lucka** |
| 4–6 A4 | Vad historiska källor är (fynd, texter, muntliga berättelser, digitalt) och hur de används | Lektionen om vikingatiden tar upp källor i `lesson.curriculum` | Källkritiska turerna `hur-vet-vi-det-har` (inkl. steget `vikingahjalmar`), `vad-vet-vi-egentligen`, `det-har-har-du-hort` (ingen kopplad lektion eller årskurs) | **Delvis** (turer utan lektion) |
| 4–6 A5 | Historiebruk i perioden, till exempel vikingar i populärkulturen | – | Missuppfattningen `vikingar-hade-horn-pa-hjalmen`; steget `vikingahjalmar` i `hur-vet-vi-det-har`. Ingen lektion tar upp historiebruk som begrepp | **Delvis** |

### "Maktförhållanden och levnadsvillkor i Norden, cirka 1500–1800"

| # | Punkten med egna ord | Händelser | Turer, lektioner, uppdrag, quiz | Bedömning |
|---|---|---|---|---|
| 4–6 B1 | Kampen om makten: reformationen, en stark kungamakt i Sverige, uppror och motstånd | `gustav-vasa`, `reformationen-i-skane`, `reformationen-i-danmark`, `friskyttar-och-snapphanar`. Inget hittat om Dackefejden eller Stockholms blodbad (sökt på "dacke" och "blodbad" i titlar och sammanfattningar) | Ingen tur eller lektion | **Delvis** |
| 4–6 B2 | Östersjöväldet: varför det uppstod och föll, och följderna för människor runt Östersjön | `stora-nordiska-kriget`, `slaget-vid-narva-1700`, `slaget-vid-poltava`, `freden-i-nystad`, `trettioariga-kriget`, `slaget-vid-lutzen-1632`, `westfaliska-freden`, `karl-xii-stupar-1718`; baltiska händelser som `hertigdomet-kurland-bildas` och `dagosvenskarna-flyttar` | Steget `karl-xii` i `vad-vet-vi-egentligen`. Ingen lektion | **Delvis** |
| 4–6 B3 | Likheter och skillnader i levnadsvillkor mellan grupper i ståndssamhället | Närmast: `stavnsbandet-upphavs` (Danmark). Inget hittat om det svenska ståndssamhället eller om häxprocesser (sökt på "häx", "stånd") | Inget | **Lucka** |
| 4–6 B4 | Vad källor från perioden (brev, dagböcker, kartor) kan berätta | Närmast: `riccis-varldskarta-1602`. Inget hittat om brev eller dagböcker som svenska källor | Inget | **Lucka** (kartkälla finns, inte kopplad) |
| 4–6 B5 | Historiebruk kopplat till perioden (gatunamn, minnesmärken, reklam) | – | Inget | **Lucka** |

### "Folkökning, ändrade maktförhållanden och emigration, cirka 1800–1900"

| # | Punkten med egna ord | Händelser | Turer, lektioner, uppdrag, quiz | Bedömning |
|---|---|---|---|---|
| 4–6 C1 | Nya maktförhållanden i Sverige och mellan nordiska länder | `freden-i-fredrikshamn`, `regeringsformen-1809`, `lantdagen-i-borga-1809`, `norges-grundlag-1814`, `grundloven-1849`, `representationsreformen`, `stormningen-av-dybbol` | Inget | **Delvis** (bara händelser) |
| 4–6 C2 | Jordbrukets omvandling, folkökningen och tidig industrialisering i Sverige, och följder för barns, kvinnors och mäns villkor | Närmast: `nodaren-1867-1869`, `gota-kanal-invigs`, `jarnvagen-malmo-lund`. Inget hittat om jordbrukets omvandling, skiften eller folkökningen (sökt på "skifte") | Inget | **Delvis** (tunt) |
| 4–6 C3 | Orsaker till och följder av emigrationen från Sverige | `emigrationen-fran-sverige` (1840), `nodaren-1867-1869` | Inget | **Delvis** (en händelse) |
| 4–6 C4 | Vad källor från perioden (kyrkböcker, fotografier, domstolsprotokoll) kan berätta | – | Inget | **Lucka** |
| 4–6 C5 | Historiebruk kopplat till perioden (hur händelser framställs i böcker och på museer) | Möjligt exempel men inte kopplat: `kalevala-ges-ut` (Finland, 1835) | Inget | **Lucka** |

## Åk 7–9

### "Samhällsomvandlingar: framväxten av civilisationer och industrisamhällen" (utan årtal)

| # | Punkten med egna ord | Händelser | Turer, lektioner, uppdrag, quiz | Bedömning |
|---|---|---|---|---|
| 7–9 A1 | Högkulturer i olika delar av världen (till exempel Afrika, Amerika, Asien) och antiken | Många: `cheopspyramiden`, `caral`, mayastäderna (`tikal-vaxer-fram`, `mayastadernas-nedgang`, `pakal-i-palenque`), `spanska-erovringen-av-aztekriket`, `spanska-erovringen-av-inkariket` | Lektionerna `hanrikets-fall` (Kina), `songhairikets-fall` (Västafrika), `vastroms-fall` (antiken); ingen lektion för Amerika | **Täcks** (Amerika bara händelser) |
| 7–9 A2 | Europeisk kolonisation och slavhandel: följder för människor och kulturer och för det globala handelsutbytet | `atlantiska-slavhandeln`, `slavhandeln-forbjuds-1807`, `slavupproret-1791`, `palmares-quilombo`, `goa-1510`, `kapkolonin-1652`, `kongofristaten`, de två spanska erövringarna | Inget | **Delvis** (händelser, ingen tur eller lektion, inget om handelsutbytet som helhet hittat) |
| 7–9 A3 | Industrialiseringen i Europa och Sverige: orsaker och följder för människor och miljö | Bara `watt-separat-kondensor`, `forsta-jarnvagen-mellan-stader`, `jarnvagen-malmo-lund`; i sammanfattningarna nämns industrialisering knappt (3 träffar på "industriell", "industrialis", "fabrik", "ångmaskin" 1700–1900). Epoken `industrialiseringen` finns i `data/perioder.json` men har nästan inga händelser att visa | Inget | **Lucka** (tunnast av punkterna) |
| 7–9 A4 | Revolutioner och nya idéer, samhällsklasser och politiska ideologier | `stormningen-av-bastiljen`, `haitiska-revolutionen`, `kant-vad-ar-upplysning`, `kommunistiska-manifestet`, `revolutionerna-1848`, `oktoberrevolutionen`, `xinhairevolutionen` | Inget | **Delvis** (bara händelser) |
| 7–9 A5 | Tolka och granska källor källkritiskt och värdera deras relevans | – | Källkritiska turerna (tre), `lesson.curriculum` i fyra av lektionerna, källdetektiv (`sourceDetective`) i `andra-varldskriget` och `songhairikets-fall` | **Täcks** |
| 7–9 A6 | Analysera historiebruk, till exempel hur historia används för nationell identitet | – | Missuppfattningarna (18) handlar om myter men inte om historiebruk som begrepp; ingen tur eller lektion | **Lucka** |

### "Imperialism och världskrig, cirka 1850–1950"

| # | Punkten med egna ord | Händelser | Turer, lektioner, uppdrag, quiz | Bedömning |
|---|---|---|---|---|
| 7–9 B1 | Nationalism, imperialism, demokrati och diktatur | `berlinkonferensen`, `kongofristaten`, `indiska-upproret-1857`, `boxarupproret`, `maji-maji-upproret`, `meijirestaurationen`, `oktoberrevolutionen`, `gulag`, `allman-rostratt-for-man-1911` | Inget | **Delvis** (bara händelser) |
| 7–9 B2 | Världskrigen, förtryck, folkfördrivningar och folkmord, Förintelsen och Gulag, motstånd | `forsta-varldskriget`, `slaget-vid-verdun`, `andra-varldskriget`, `armeniska-folkmordet`, `holodomor`, `gulag`, `auschwitz-befrias`, `raddningen-av-de-danska-judarna`. Ingen händelse om själva förföljelsen av judar hittades i titlarna; inget om folkfördrivningar hittat | Turen `forsta-varldskriget` (utan lektion), lektionen `andra-varldskriget` (åk 7–9, 14 steg inkl. `auschwitz`); uppdraget `samtidighetsjakten-1945` | **Täcks** (Förintelsen och motstånd tunt) |
| 7–9 B3 | Tolka och granska källor från perioden | – | Som A5; lektionen `andra-varldskriget` har källdetektiv | **Täcks** |
| 7–9 B4 | Analysera historiebruk i perioden (opinion, legitimitet) | – | Inget | **Lucka** |

### "Demokratisering och ökad globalisering, cirka 1900 till nutid"

| # | Punkten med egna ord | Händelser | Turer, lektioner, uppdrag, quiz | Bedömning |
|---|---|---|---|---|
| 7–9 C1 | Sveriges demokratisering och välfärdssamhälle, partier, folkrörelser, rösträtt, ändrad syn på kön och jämställdhet | `allman-rostratt-for-man-1911`, `kvinnor-rostar-1921`, `saltsjobadsavtalet`; nordiska jämförelser (`kvinnlig-rostratt-norge-1913`). Inget hittat om folkrörelser, nykterhet, frikyrkor, välfärd eller jämställdhet (sökt på "folkrörelse", "nykterhet", "frikyrk", "välfärd") | Inget | **Delvis** |
| 7–9 C2 | Kalla kriget och nya maktförhållanden efter det | `koreakriget`, `vietnamkriget`, `kubakrisen`, `berlinmuren-byggs`, `berlinmurens-fall`, `sovjetunionens-upplosning`, `sydafrikas-forsta-fria-val`, `attackerna-11-september-2001`, `euron-infors`, `sverige-gar-med-i-eu` | Inget | **Delvis** (bara händelser) |
| 7–9 C3 | Långa linjer i levnadsvillkor, migration och makt | Närmast: `spanska-sjukan`. Inget hittat om migration eller flykt 1900–nutid (sökt på "migration", "flykting", "invandr") | Inget | **Lucka** |
| 7–9 C4 | Tolka och granska källor från perioden | – | Som A5 | **Delvis** (källkritiska turer finns men gäller äldre perioder; ingen tur eller lektion använder källor från 1900-talet utöver andra världskriget) |
| 7–9 C5 | Analysera historiebruk i perioden (kritik mot samtiden, föreställningar om framtiden) | – | Inget | **Lucka** |

## Sammanfattning

Av 30 punkter: **5 täcks** (4–6 A1; 7–9 A1, A5, B2, B3), **14 delvis** (4–6: A2, A4, A5, B1, B2, C1, C2, C3; 7–9: A2, A4, B1, C1, C2, C4) och **11 är luckor** (4–6: A3, B3, B4, B5, C4, C5; 7–9: A3, A6, B4, C3, C5). Räkna om om en rad ändras.

Tydligaste luckor, i den ordning de syns:

1. **Historiebruk** saknas som tur, lektion och händelseurval i alla sex kunskapsområden: fem luckor (4–6 B5, C5; 7–9 A6, B4, C5) och en delvis (4–6 A5, vikingar i populärkulturen). Punkten finns i varje kunskapsområde i kursplanen.
2. **Källor i svensk kontext** (brev, dagböcker, kyrkböcker, fotografier, domstolsprotokoll; 4–6 B4 och C4) saknar koppling; de källkritiska turerna handlar om kända myter från hela världen.
3. **Industrialiseringen** (7–9 A3) har bara tre händelser, trots att epoken finns i perioderna.
4. **Levnadsvillkor för barn, kvinnor och män** (4–6 A3, B3, C2) och **migration och långa linjer** (7–9 C3) saknar händelser som svarar mot formuleringarna.
5. **Folkrörelser, välfärd och jämställdhet i Sverige** (7–9 C1) saknar händelser.
6. **Lektioner:** bara en lektion för åk 4–6 och fyra för åk 7–9; åk 4–6 har ingen lektion för 1500–1800 och 1800–1900.

Det här är fynd om repots täckning mot kursplanen. Vad som ska göras åt dem är DasKrokodils beslut och en fråga för innehållsplanen (nya händelser kräver öppnade källor enligt Källpolicyn). Sammanställningen är ett underlag, inte en lista att bocka av.

## Att kontrollera

- [ ] Kursplanen öppnades 2026-11-27 (version 14); ny version eller beslut om nya kursplaner (#843) gör listan inaktuell.
- [ ] Bedömningarna är gjorda av en agent mot rubriker i `data/events.json`; ingen lärare har granskat dem. De ersätts av observationer när en lärare har sett listan.
- [ ] Ändras en tur, lektion, ett uppdrag eller quiz, eller läggs händelser till i luckorna: uppdatera raden och datumet överst.
