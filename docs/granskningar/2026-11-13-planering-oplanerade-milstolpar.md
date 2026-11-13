# Planering: de milstolpar som ännu inte analyserats

**Datum:** 2026-11-13. **Status:** förslag till DasKrokodil. Inget är byggt, inga issues är skapade, inga etiketter är satta och inget är beslutat. Skriven med `/milstolpe` (beslut [2026-11-10-planering-med-agenter-fore-milstolpe.md](../beslut/2026-11-10-planering-med-agenter-fore-milstolpe.md)).

**Underlag:** sex agentrapporter (historiker, förhistoriker, geograf, arkitekt, ux-tillganglighet, larare) över 21 milstolpar och cirka 230 öppna issues. Agenterna öppnade nästan inga externa källor; allt om omvärlden (licenser, forskningsläge, Skolverket) är **antaganden** som ska källkontrolleras före bygge. Påståenden om repot är stickprovskontrollerade (avsnitt 2).

## 0. Avgränsning

Redan planerade (ingår inte): Version 6.3.0 Teman, Version 7 (7.0.0), Version 6.4.0 Regionkort och Länders historia (`2026-11-10-planering-version-6-3-0-teman.md`, `…-version-7.md`, `…-regionhistoria.md`).

Analyserade här: Version 8 Jordens historia (5), Version 9 Atlas (6), Experiment Lekar (7), Experiment Rymden (8), Paket Vetenskap och medicin (12), Hårdvara (14), Paket Temavyer (15), Experiment Historiska datum (19), Experiment Flöden (20), Bilder: batchar (22), Senare: teknik (23), Senare: innehåll och media (24), Riken: global täckning (28), Språk: översättning (30), Täckning (31), Att följa upp (32), Version 7.1 Människoarter (38), Version 7.2 Lärarstöd (39), Riken: symboler och flaggor (40), Quiz och källkritik (41), Teknik: webbläsartestet (42).

Ingick inte: milstolpe 37 (Version 6.2.1, 0 öppna) och Senare: beslut krävs (18, 10 öppna), som ska gås igenom i en egen omgång. Hårdvara (14) är med i listan men bara som notering: alla issues är `utanför-kod` (se punkt 1).

## 1. Bemanning (steg 1)

| Agent | Behövdes | Varför |
|---|---|---|
| `historiker` | ja | Täckning, riken, vetenskap/medicin, kalenderfrågor, quiz, bilder, tema |
| `forhistoriker` | ja | 7.1, 7.2, Version 8, täckning av förhistorien |
| `geograf` | ja | Riken, symboler, Atlas, flöden, rymden, forntida kartor |
| `arkitekt` | ja | Lägen, lager, partiklar, rymdklot, offline, webbläsartest |
| `ux-tillganglighet` | ja | 7.1/7.2, temavyer, ögonblick, quiz, bilder, jämförelse |
| `larare` | ja | 7.2, quiz, fall-turer, temavyer, lekar |
| `sprak-en/de/es/fr` | nej | Milstolpe 30 är genomförande av redan beslutade översättningar; ingen ny text att granska före bygget. Språkexperterna tas in vid releasekontrollen |
| Övriga linser | nej | Täcks av agenterna ovan |

Hårdvara (14: #79–#81, #931) är bara `utanför-kod` och planeras i Rikards Claude-projekt; ingen agent behövdes.

**Ny expert:** Ingen ny expert behövs. Två återkommande behov hanteras av befintliga roller men nämns: licenskontroll av datakällor (GPlates, PBDB, NASA, kartor) gjordes av geograf och förhistoriker som antagande. En jurist-roll vore överdriven; licenskontroll ska i stället göras som uppgift på öppnade licenssidor (se fråga 4).

## 2. Stickprovskontroll av agenternas påståenden

| Påstående | Resultat |
|---|---|
| Historiker: `data/missuppfattningar.json` har över 8 poster, ingen SPQR-post | Stämmer: 18 poster, 0 träffar på SPQR |
| Historiker: #1066 öppet fast noterna finns | Stämmer: issuet är öppet, 23 `calendar`-noter finns i `1500-1799.json`, Helsingborg på rad 615 |
| Historiker och geograf: `redo` på #1153, #1155, #1156 före rapporten #1147 | **Inaktuellt.** #1147 är stängt (2026-11-12), så villkoret är uppfyllt. Att rapporten är ihopslagen i `main` är inte kontrollerat |
| Geograf: `nattljus-2016` finns redan i `data/bildlager.json` (#9) | Stämmer (2 träffar) |
| Arkitekt: `js/date-events.js` och `js/layers/images.js` finns | Stämmer |
| UX: `prefers-reduced-motion` på tre ställen | Fel i detalj: fyra träffar. Ska ändå kontrolleras före #454 |
| UX: #1280 överdriver markörstorleken | Delvis rätt: fylld markör 8 px, de två övriga 6 px med 2 px kant |
| Förhistoriker: arterna (neandertalare m.fl.) finns redan i `events.json`, kalltabellens "inget före −9999" är föråldrad | Delvis kontrollerat: beslutsfilerna för reglaget och artlistan finns; händelserna själva är inte omräknade här |
| Lärare: #843 stämmer (10 Lgr22-träffar per tur) och bara två turer har `lesson`-block | Inte omräknat; agentens stickprov |

Agenternas motstridiga åsikter: ingen väsentlig. Samstämmigt rapporterat av flera: #1106 bör slås ihop med #1094, #12 med #397, #1107 med #1104 (lärare/UX föreslår, arkitekt/förhistoriker håller med om ordningen), #1279 och #843 överlappar. UX vill dela #1107 i snabbhopp och quiz/jakt.

## 3. De viktigaste fynden

**Blockerar**
1. **Version 8: licenser och läge.** GPlates-modellernas licens (#51) och PBDB (#52) är inte verifierade (EarthByte anger CC BY 3.0 för sin data men inte per modell; PBDB anger ingen licens). #397 ändrar principen "ett år styr allt" (CLAUDE.md punkt 3) och kräver beslutsfil. Inget byggs före 7.1.
2. **7.1: beslutskedjan #1095 → #1096 → #1105 → #1106.** Ingen beslutsfil finns för någon av dem; #1094 (kartlagret) kan inte byggas före. Kartan ska aldrig visa "inga fynd" som "ingen var där" (Amerika har 0 händelser i förhistorien).
3. **Rymden, flöden och partiklar** bryter mot beslut 1 (allt ritas på ekvirektangulär canvas) om de ritas som egna 3D-objekt eller per bildruta. Kräver beslutsfil före bygge. #432 (filnamn med versionsnummer) bryter mot "inget byggsteg" och #486 (offline) kräver service worker.

**Viktigt**
4. **Föråldrade issues:** #9 (nattljus finns redan), #838 (missuppfattningar byggt, `beslut-krävs` kvar), #1066 (noterna finns, men ej källkontrollerade mot Lex), #767 och #1093 (delvis byggda), #1061 (beslutat), #12 mot #397 (dubblett), och flera issues med fel milstolpe i texten (#51–#53 "Version 7", #8/#9/#55 "Version 8", #56/#10 "Version 9", Rymden "Version 10").
5. **Täckning:** förhistorien har 11 händelser (Amerika 0, Afrika 1), Afrika och Amerika 1100–1400 är glesa (tackning-2026-11-13). #1014 är tematiskt, inte geografiskt, och förvärrar annars Europaslagsidan. Dela efter tomma celler.
6. **Riken:** #1116/#385 släktträd saknar id-mappning (bara Sovjetunionen har föregångare och efterföljare, och som fria namn). #1083 och #1084 rör omstridda gränser. #556/#645/#646 saknar mätbart "klar".
7. **Lärarstödet (7.2):** inget är avgjort; alla utom #1108 har `beslut-krävs`. Epokknappen: Historiska museets `nordisk-stenalder` är svensk periodisering och passar illa i tysk och fransk text.
8. **Bilder:** #1288 (`bilder_in.py` kräver sex mellanslag före `"sources":`) bör göras före #772–#774 och #299, annars blir `image` handarbete. #299 och #774 har `redo`.
9. **Temavyer:** 25 idéer och en motor; nästa tema avgörs först av #1207. Flera kan samlas (kultur: #102, #104, #106, #459, #460, #477; linser: #384, #461, #481, #330, #558).

## 4. Kontextgrupper, ordning och vem som tar vad

Modellnivå enligt CLAUDE.md: fakta/data/källor Opus, gränssnitt/rendering Sonnet high, översättning/köstädning Sonnet medium. Fakta och gränssnitt blandas inte.

| Grupp | Issues | Delar | Nivå | Ordning och krockar |
|---|---|---|---|---|
| **G1 Röjning och rättning** (ingen kod) | Milstolpe-/titelrättningar, #9, #838, #1061, #1066 (förslag), #12→#397, #1288 | Bara issuetext och metadata | Sonnet medium | Först. Stängning/etiketter först efter Rikards ok |
| **G2 Bildverktyg och bilder** | #1288, sedan #299, #772–#774 | `tools/bilder_in.py`, `images/`, `data/handelser/` | #1288 Sonnet medium; bilder Opus | #1288 före övriga. Krock med G7 (samma händelsefiler) |
| **G3 Förhistorien: data** | #1093 (sapiens, Afrika), #767+#1016, #1015 | `data/handelser/fkr.json`, källor | Opus | Efter beslut om #1095. Amerika kräver en CC BY-källa först |
| **G4 Förhistorien: lager och UX** | #1095, #1096, #1105, #1106, #1094, #1104, #1107 | `js/layers/`, `data/vyer.json`, `data/ui/*.json` | Beslut: Opus; lager: Sonnet high | Efter G3-beslut; #1106 ingår i #1094. Krock med G8 (lagerregistret) |
| **G5 Lärarstöd 7.2** | #1102 först, #1103, #1098, #1109 sist, #1108 | `docs/`, turer, `data/perioder.json` | Opus (begrepp/fakta), Sonnet medium (docs) | #1102 kan starta direkt efter ok. Beroende av epokbeslutet |
| **G6 Riken: data** | #1083, #1084, #1116, #556/#645/#646 (mätmål först) | `data/empires/`, `tools/riken.py` | Opus | Mät regionbalans först; omstridda gränser enligt `docs/omstridda-granser.md` |
| **G7 Täckning: händelser** | #765, #1014 (delad), #1017–#1019, #85, #86 | `data/handelser/*.json` | Opus | Ordna efter tomma celler i `tackning.py`. Krock med G2 |
| **G8 Rikessymboler** | #1152–#1156 | `data/empires/`, symboler | Opus | Nu fria att starta (#1147 stängt); Afrika/Oceanien kan slås ihop om få belagda |
| **G9 Skolinnehåll och quiz** | #1229, #948, #1279, #843+#1265 (väntar till 2027-01-20), #1126/#469 (beslut) | `data/missuppfattningar.json`, turer | Opus | #1229 kräver öppnad fackkälla före bygge |
| **G10 Gränssnitt: små** | #1280 (pågår), #553, #1091, #489 (kortet) | `js/ui/`, `timeline.js` | Sonnet high | #489 efter #1061; #1280 ligger redan hos en arbetare |
| **G11 Tema** | #1207 först, därefter samlingsissues | `data/teman.json` | Beslut: Opus | Inget bygge före #1207 |
| **G12 Test och process** | #1174, #1060, #699, #919, #895 | `tests/webblasare.mjs`, workflow | Sonnet medium | Ett i taget (samma fil). #919 (prestandabudget) före #56/#248 |
| **G13 Version 8/9, rymd, flöden, lekar** (parkerade) | #397, #51–#53, #8, #55, #248, #249, #399, #56–#58, #59, #60, #83, #465, #472, #558 | Läge, rendering, nya källor | Opus (beslut), Sonnet high (bygge) | Inget bygge före 7.1 och före beslut 1–5 nedan |
| **G14 Språk** | #897–#901 och de 30 översättningsissuena | `data/handelser/*`, `data/ui/` | Sonnet medium | Pågår som egen ström; ändrar aldrig fakta; paraplyerna #63, #677–#679 stängs när delarna är klara |
| **Egna grupper** | #531/#1206 (utvärdering), #1208, #1209, #1120, hårdvara #79–#81, #931 | – | – | Ensamma; hårdvara planeras utanför repot |

**Arbetsfördelning:** Claude Code tar G1, G3, G5, G6, G7, G8, G9 (fakta och data, Codex tar aldrig dessa). Codex kan ta G10, G12 och #1288, samt `översättning`-issues enligt undantaget. Andreas Claude Code får ta `redo`-issues i G2/G3/G6/G8 efter Rikards ok.

**Rekommenderad övergripande ordning:** G1 → G2 (#1288) → beslut i G4 → G3 och G5 → G6/G7/G8 parallellt med G14 → G11 efter #1207 → G13 sist.

## 5. Öppna frågor till DasKrokodil

Rekommendation först, enligt CLAUDE.md.

**Rekommendation i korthet:** Gör G1 (röjning) och #1288 nu, besluta kedjan i 7.1, och parkera Version 8/9, rymden, flöden och lekar tills 7.1 är klar. Håll nere antalet nya ytor och experiment.

1. **7.1: osäkerhetens språk och kustlinjer (#1095, #1096, #1105, #1106).** Rekommendation: ett enda språk på kartan (tonad eller streckad kant plus textetikett, inte bara färg), kust och landbryggor först som ett lager (inte som växlande grundkarta), inga ansiktsrekonstruktioner utan märkt tolkning, och textalternativ som krav i #1094. Gör skissen i 400 px med färgblindsimulering före bygge.
2. **Epokknappen i 7.2:** följer den Historiska museets `nordisk-stenalder` eller en egen "människans förhistoria"? Rekommendation: egen indelning för förhistorien, med den svenska som sidoreferens, så att tyska och franska texter inte blir svenska.
3. **Vem granskar förhistorien som lärare (#1109)?** Rekommendation: utse en person före #1098, och inga hänvisningar till åk 4–6 före granskningen.
4. **Licenser (GPlates, PBDB, NASA, historiska kartor):** rekommendation: ge i uppdrag att öppna licenssidan per modell/källa före någon byggorder; ingen byggs på antagande.
5. **Lägen:** ska Jordens historia, Rymden och Jämför vara läge (enligt lägeskontraktet #893) eller lager? Rekommendation: läge för Jordens historia, vänta med Rymden; #248 först avgörs när ett andra år i tillståndet har prövats. Kräver beslutsfil och troligen ändring av punkt 3 i CLAUDE.md.
6. **Partiklar och extra klot utanför canvasen (beslut 1):** rekommendation: nej tills ett litet bevis med #399 (slavhandeln, redan data) visar att `lines.js` inte räcker. Slå ihop #56 i #399.
7. **#432 (filnamn med version) och #486 (offline):** rekommendation: stäng #432 tills trafiken kräver det; behåll #486 med `beslut-krävs`.
8. **#465 (alternativhistoria):** rekommendation: ersätt med "vändpunkter" med källor; om ett läge byggs, aldrig som skolinnehåll för åk 4–6.
9. **Symbolerna #1152–#1156:** får `redo` behållas nu när #1147 är stängt? Rekommendation: ja, efter att du bekräftat att rapporten är ihopslagen.
10. **Släktträd (#385/#1116):** länka till våra rik-id eller Wikidata-id? Rekommendation: våra rik-id, med grå noder för poster utan eget rike; data först, bild sedan.
11. **Stängning av föråldrade issues (#9, #838, #1061, #12, #1066 efter källkontroll):** rekommendation: ja, i G1 efter ditt ok. Dessutom att milstolpetexterna rättas.
12. **Version 9 eller 8 för atlasen, version 10 eller experiment för rymden?** Rekommendation: milstolparna gäller; rätta issuetexterna.

Beslut som saknar rekommendation här: inga.

## 6. Luckor (saknas), blockerar inget

H. sapiens i Afrika, Amerikas första människor, södra Asien, tidigmodern tid i Oceanien och Amerika, medeltida Afrika (se `tackning-2026-11-13.md`), Italienska Östafrika och Danmark 1407–1944 som riken. Ingen lista är byggd mot Cliopatria eller Wikidata i den här körningen; den görs av den som tar G6/G7. Ingen luckmätning av riken gjordes (`tools/tackning_riken.py` kräver `shapely`, som saknas i molnmiljön).

## 7. Uppskattad kostnad

Miljön visar inte veckoanvändningen i procent: **saknas**. Relativa intervall (osäkra, att kalibreras mot faktisk förbrukning enligt `.orchestra/project.md`):

| Grupp | Start | Per issue |
|---|---|---|
| G1 röjning | låg | mycket låg |
| G2 | låg | låg (#1288) / hög (bildbatch) |
| G3, G6, G7, G8, G9 (Opus, källor) | medel | medel–hög |
| G4 | medel (beslut + skiss) | medel |
| G5 | medel | låg–medel |
| G10, G12 | låg | låg |
| G11, G13 | beslut: medel; bygge: hög | hög |
| G14 | låg | låg per omgång, många omgångar |

Efter varje avslutat issue noteras faktisk förbrukning.

## 8. Nästa steg

Inget görs förrän DasKrokodil har godkänt planen. Förslag: svara per fråga (1–12) och per grupp, så skapar Claude Code issues och rättar milstolpetexter i G1.
