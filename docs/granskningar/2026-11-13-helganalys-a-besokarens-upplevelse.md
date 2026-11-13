# Helganalys, körning A: besökarens upplevelse

**Klart:** genomgång av sidan i dator- och mobilbredd, lärarlinsen och tillgänglighetslinsen, jämfört med `docs/ux-review/` och milstolpe 6.2.0. **Stod still:** benchmarken mot andra sidor och spel, eftersom sju av åtta sidor inte gick att öppna från molnmiljön (nätspärr). **Inget är byggt eller ändrat**, inga etiketter är satta och inga issues är skapade utöver samlingsissuet #1289.

**Datum:** 2026-11-13. **Version:** `6.3.0-dev`, `main` vid `235aad5`. **Konto:** DasKrokodil. **Modellnivå:** Sonnet high räcker för körningen (ingen ny fakta skrivs); issues som rör regler för "samtidigt", datamodell eller lektionsinnehåll bör tas med Opus.

## Läget när körningen började

- **Alla issues i 6.2.0 (#991–#1004) är stängda.** Körningen letar därför efter rester, följdfel och sådant ingen har granskat.
- **Öppna pull requests:** 4, alla öppnade från DasKrokodils konto (#1284, #1285, #1286, #1287). Det är gränsen på 4 per person. Einzbeng har 0.
- **`docs/granskningar/handoff.json`** står på `ready_for_triage` och pekar på `2026-11-10-version-6-3-0.md`. Den rapporten är inte triagerad här; det är ett eget uppdrag som kräver DasKrokodils godkännande.
- **Inga konsolfel** i något prov (utom de typsnitt som testmiljön avbryter med flit).

## Sammanfattning

6.2.0 har gjort det den skulle. Första vyn har 33 tabbstopp i stället för 655, etiketterna säger "4 år före (1912)", faktarutan dockar vid sidan, "Kom igång" och årstipset finns, och "Visste du?" säger vart den tar en. Det som är kvar är av tre slag.

### 1. Följdfel av rättningarna i 6.2.0 (små, bör rättas först)

| # | Fynd | Bevis | Allvar |
|---|---|---|---|
| A1 | **Årstipset "Dra här för att byta år" knuffar upp tidsraden 22 px, så att den krockar med det som ligger ovanför.** I mobil täcker stegknapparna kortets rad "Visste du? → 491 f.Kr." vid första besöket. I Fokus ligger fokusraden över stegknapparna (12 px på dator, 14 px i mobil). Utan tipset finns ingen krock. | Mätt: med tips `#focus-bar` slutar vid 682 och `#btn-speed` börjar vid 670; utan tips börjar knappen vid 692. I mobil: `#funfact` slutar vid 698, `#btn-play` börjar vid 682, och `#ff-surprise` är täckt. | Hög: det är precis förstagångsbesökaren som drabbas |
| A2 | **I tur och lektion går reglaget att dra och klicka, fast knapparna är låsta.** Året byts men kortet står kvar på samma steg, och adressen behåller det gamla året. Tipset "Dra här för att byta år" visas dessutom under turen. | `lockTimeControls` i `js/ui/tour.js:302` låser bara `.step` och `#btn-play`. Klick på `#track` i `#t=andra-varldskriget` gav år 1845 med kortet kvar på "Polen, 1 september 1939". | Hög: år och kort säger olika saker i klassrummet |
| A3 | **Svensk skärmläsare hör engelska: "About the event: …"** varje gång en faktaruta öppnas. | Nyckeln `detail.label` saknas i `data/ui/sv.json` men finns i `en.json`; `js/main.js:354` läser den. | Medel, mycket liten rättning |
| A4 | **Klartexten om tidsfönstret (#994) syns bara för skärmläsare.** På skärmen står fortfarande "1300-TALET · ±40 ÅR". Bara lektion och Fokus visar ord ("även 10 år före och efter"). | `#year-window-note` har klassen `sr-only` (`index.html:101`). | Medel: kärnbegreppet är fortfarande en symbol för den seende |
| A5 | **Två ord för samma sak:** etiketterna på globen säger "4 år före (1912)" och "om 2 år (1918)", listan i panelen säger "4 år tidigare" och "21 år senare". Romben heter "Visste du?" i teckenförklaringen, "Samtidigt-kortet" i Lager och "Fun fact" på kortet. | `time.beforeLabel`/`time.afterLabel` mot `panel.earlier`/`panel.later` i `data/ui/sv.json`. | Låg |
| A6 | **Teckenförklaringen under tidslinjen finns inte i mobil.** | `#timeline-legend` är tom vid 400 px. | Låg |

### 2. Lägen som inte har någon text eller som säger fel sak

| # | Fynd | Bevis | Allvar |
|---|---|---|---|
| B1 | **Uppspelningen fortsätter bakom en öppen dialog.** Öppnar man Källor medan uppspelningen står i paus vid ett kort ("Fortsätter om 10 …") räknar den ned och spelar vidare bakom dialogen. | Mätt i båda bredderna: år 1351 när Källor öppnades, 1365 efter 14 sekunder, dialogen fortfarande öppen. | Medel–hög: den som läser om källorna tappar sin plats |
| B2 | **En trasig länk säger ingenting.** `#t=finns-inte`, `#y=1500&f=war:finns-inte` och `#y=abc` öppnar startsidan eller året utan ett ord om att turen, kriget eller året inte fanns. | Prov via adressen; `#lesson-notice` och `#focus-notice` förblir dolda. | Medel: läraren som delar en länk med ett skrivfel får ingen hjälp |
| B3 | **Ett filter som ger noll träffar skyller på datan.** Med bara kategorin Sport vald år 1325 står det "Inget i datan inom ±40 år från 1325" och rådet att dra i tidslinjen. Inget säger att ett filter är på, och ingen knapp visar alla kategorier. | #886 rättade läget "alla filter av" (`panel.filtersOff`), men inte "några filter på, noll träffar" (`js/ui/panel.js:415`). | Medel, rest av #886 |
| B4 | **Årsbyte läses inte upp utanför reglaget, och ett år utan kort är bara tomt.** Knappen "+10" ger bara kortets text i statusraden, inte året. År 1400 har inget Samtidigt-kort och ingen förklaring till att det saknas. | `#screen-reader-status` vid stegknapparna; `#funfact` och `#ff-tab` dolda vid `#y=1400`. | Medel |
| B5 | **Tyska, franska och spanska: texten säger "på svenska", men det som visas är engelska.** `lang.beta` lyder "… werden noch auf Schwedisch angezeigt", men reservspråket är engelska, och listorna blandar "Das Osmanische Reich" med "The Hanseatic League emerges". Raden syns dessutom bara i Hjälp. De engelska styckena saknar `lang`-attribut. | 380 av 929 händelser har tysk titel, 168 spansk och fransk; alla har engelsk. `data/ui/de.json:6`, `fr.json:6`, `es.json:6`. | Medel: översättningen har egna issues (#63 m.fl.), men den felaktiga upplysningen och uppmärkningen är nya |
| B6 | **Förhistorien visar falsk exakthet.** Året skrivs "99 001 f.Kr." bredvid "99 000 F.KR. · ±12 000 ÅR", panelen skriver "Homo floresiensis … 1001 år senare" och "±12000" utan mellanrum, och vid 5000 f.Kr. står "Samtidigt 615" fast 0 pågår. | `#y=-99000`, `#y=-5000`. | Medel: hör till version 7.0 (#1089, #1090, #1104), men bryter mot källpolicyns punkt 6 redan nu |

### 3. Det som aldrig blev issues ur `docs/ux-review/`

- **Lista 2 i syntesen, punkterna A, B och I, finns varken som issue eller beslut:** en definition av "samtidigt" med typade fun facts, skillnaden mellan händelse och långt tillstånd, och en synlig tidsskala. Följden syns i dag: quizet kallar upp till 50 år "samtidigt" (`MAX_PAIR_GAP` i `js/quiz-rules.js:18`; i provet låg Hatepeutbrottet cirka 232 och Solpyramiden cirka 200 under frågan "hände samtidigt?"), och Samtidighetsjakten godkänner allt som överlappar 1475–1525, där 17 av 40 kandidater varar längre än 50 år.
- **Quizets felsvar är oförändrade** (`MIN_GAP = 200`), så rätt svar går att gissa på namnet.

### Per perspektiv, kort

- **Förstagångsbesökare:** startvyn är tydligare än i granskningen, men A1 gör att det första man ser i mobil är knappar ovanpå text. Kortet täcker dessutom en av de tre händelser det handlar om (etiketten "Tenochtitlan" ligger bakom kortet på dator).
- **Elev åk 4–6:** lektionen fungerar, men reglaget är olåst (A2), jakten blandar "kontinenter" och "världsdelar", elevbladet har rubriken "Exit ticket", och missuppfattningsrutan vid Lindisfarne visar vuxentexten.
- **Elev åk 7–9:** quizet går att gissa, och "Sant eller myt?" har alltid svaret myt.
- **Lärare:** inget på startsidan eller i Hjälp säger att lektioner, utskrift, quiz och jakt finns. Lärarbladet saknar förväntade svar. Bara två av åtta turer är lektioner, och lektionens slutkort leder aldrig till ett uppdrag, eftersom det enda uppdraget gäller år 1500.
- **Historieintresserad vuxen:** faktarutan på en bärbar dator (800 px hög) visar bara rubrik och bild; 336 av 949 px syns. Fördjupning och vidare läsning hör till #927.
- **Tillgänglighet:** fokus försvinner till `body` när en faktaruta öppnas från listan, Escape beter sig olika per yta, och vid 200 % zoom blir turkortet 108 px högt.

### Det som fungerar (mätt)

Alla knappar har namn, fokusringen syns, Källor, Kom igång och Quiz är riktiga dialoger som lämnar tillbaka fokus, `prefers-reduced-motion` slår på Lugn rörelse, sidan har ingen horisontell scroll vid 400 px eller 640 px, tomma år i förhistorien har träffar och text, och intervallet har egna tomtexter.

## Detaljer

### Egen genomgång (dirigenten)

Chromium via Playwright, 1280×800, 1366×768 och 400×800, `deviceScaleFactor` 1, mot `python3 -m http.server`. Provat: startvyn, tolv lägen via adressen (tomma år, i dag, inga lager, en kategori, intervall, tomt intervall, ogiltigt år, okänd tur, okänt fokus), panelen, en händelse med bild, Lager, Sök och följ, Turer, Mer, Hjälp, Fokus på första världskriget till slutet, uppspelning, Platt karta, Upptäcktsresor, Källor, tyska, lektionsläget, quiz, jakten och årshoppet.

Ytterligare iakttagelser som inte står i tabellerna:

- **Mobil, panelen över kortet:** när Samtidigt-panelen är öppen sticker kortets nederdel fram under den, och stegknapparna ligger över båda. #998 gällde bara dator.
- **Mobil, Platt karta under uppspelning:** kort, pausrad och stegrad ligger i tre lager, och pausraden täcker kortets källrad.
- **Mobilens faktaruta visar ingen bild i halvt läge.** Det är avsiktligt (`#detail[data-sheet="half"] .detail-fig { display: none; }`), men inget antyder att en bild finns.
- **Lektion på dator:** turkortet till vänster och faktarutan till höger är öppna samtidigt. Turen säger "Vikingar anfaller", händelsen "Vikingar plundrar".
- **Hjälp** har fyra korta punkter och nämner inte Samtidigt, tidsfönstret, Turer eller skolfunktionerna.

### Lärarlinsen (agenten `larare`, läste filerna, körde inte webbläsaren)

1. Lista 2 A, B och I blev aldrig issues (se ovan). Kräver beslut om datamodellen.
2. Lektionens slutkort (`renderEnd` i `js/ui/lesson.js`) visar bara uppdrag inom lektionens år; det enda uppdraget är 1500, lektionerna gäller 793–1068 och 1939–1945.
3. Jakten räknar långa tillstånd som "hände omkring år 1500" (`js/uppdrag-rules.js`), och texterna blandar "kontinenter" och "världsdelar".
4. Lärarbladet (`teacherSheet` i `js/ui/print-sheet.js`) saknar förväntade svar. Närliggande: #1279.
5. Två av åtta turer är lektioner. Lgr22-perioderna 1500–1800, 1800–1900 och 1900– saknar lektion. Releaseanalysen 2026-11-11 hänvisar till #1012, som inte finns bland de öppna; det är inte kontrollerat hur det stängdes.
6. Ingen ingång för läraren: lärarpaketet (#743) finns inte som fil, och Hjälp nämner inget av skolfunktionerna.
7. "Lägg till ?presentation=1 i adressen" står kvar i lärarfälten, och parametern måste in före `#` i bladets egen länk.
8. Elevbladet för åk 4–6: "Exit ticket" och engelska källtitlar.
9. Åk 4–6-lektionen: steget `island` öppnar ingen faktaruta, 2 av 8 öppnade händelser har bild, och orden "Fatimiderna", "befäst", "kol-14-dateringar", "inskrifter", "räden" och "den lärde" förklaras inte. Närliggande: #299, #774.
10. Quizet: `MIN_GAP = 200` oförändrat; tyskan säger "Was meinen Sie" i något yngre elever kan använda.
11. Epokknapparna för åk 4–6 heter "Norden" men visar hela världen; i en grov ruta över Norden ligger 10 av 156 händelser 800–1500. "Vad hände här?" ger 0 träffar på Oslo och Helsingfors. Lärarbladet skriver "Imperialism och världskrig", `perioder.json` "Imperier och världskrig"; vilket som är kursplanens ordalydelse är inte kontrollerat mot Skolverket (#843). Närliggande: #1265, #1115.
12. Ordlistan (`docs/produkt/13-ordlista.md`) säger "38 år före och efter" på en rad och "±40 år" på en annan, och "samma år" om jakten som är ±25. Hör till #919.

Pedagogens ursprungliga fynd: åtgärdade är 3, 4 och 10, riktning i tid och turlistan. Delvis åtgärdade är 1, 5, 6 och 9. Inte gjorda är 2 (händelse mot tillstånd), 8 (synlig skala), storskärmsknappen, "anfaller" mot "plundrar" och fler jaktår.

### Tillgänglighetslinsen (agenten `ux-tillganglighet`, mätte med Playwright)

1. Reglaget olåst i tur och lektion (A2). Rest av #999.
2. Fokus försvinner när faktarutan öppnas från listan: `document.activeElement` blir `body` på dator, `#btn-panel` i mobil. `js/main.js:347–352` flyttar bara fokus när rutan öppnas från kortet. Rest av #1138.
3. `detail.label` saknas på svenska (A3). Stickprovad av dirigenten.
4. Årsbyte läses inte upp (B4).
5. 200 % zoom (640×480): `#tour-card` är 108 px högt med 351 px innehåll, turens namn står två gånger och Samtidigt-kortet täcker nästan hela klotet. #992 provade bara surfplatta.
6. Reservspråk saknar `lang` (B5).
7. Escape stänger panelen, Sök och följ, Lager, Hjälp och faktarutan, men inte årshoppet, intervallformuläret, Turer-menyn, jakten eller turkortet när fokus ligger utanför. Ett Escape i turkortet avslutar hela turen utan fråga. Rest av #894.
8. Träffytor och text i mobil: filterchips 21 px höga med 11 px text, sorteringschips 22 px, "Tecken" 40×14 px, "Källor" och "Nästa" på kortet 34×24 px. Text på 9,5–10,5 px på fyra ställen. `#ff-min` har kontrast 4,20:1.
9. Förhistorien: "Samtidigt 615" när 0 pågår (B6).
10. Tabbordning: klotet och 1–4 kartmarkörer kommer före året och menyerna, och ingen hoppa-länk finns. I lektion ligger 8 markörer före "Visa hela globen".
11. Mobilens menyer (Lager, Sök och följ, Turer) fyller 382×746 av 400×800 utan stängknapp i ytan. Stängning med touch är inte provad.
12. Panelen säger samma sak två gånger: "45 träffar: 24 pågår, 21 nära. 24 händelser pågår år 1325, 21 till inom ±40 år."

### Benchmark: stod still

Den tidigare benchmarken (`2026-11-07-benchmark-skola-atlaser-spel.md`) täcker tolv sidor. Den här gången provades åtta andra. **Sju gick inte att öppna** från molnmiljön (värdnamnet nås inte genom nätspärren): runningreality.org, oldmapsonline.org, wikitrivia.tomjwatson.com, timeguessr.com, globle-game.com, humanorigins.si.edu, samt worldhistory.org som svarade 403. Inget skrivs om dem ur minnet.

Två idéer går att belägga, men **bara ur sökresultatens sammanfattningar av andra sidor, inte ur själva sidorna**:

- **Ordna i tid** (Wikitrivia): spelaren lägger kort i tidsordning på en tidslinje och förlorar ett liv vid fel, tre liv totalt; korten bygger på Wikidata och Wikipedia, och recensenter nämner att fel i Wikidata slår igenom ([Wikipedia om Wikitrivia](https://en.wikipedia.org/wiki/Wikitrivia), [Wikimedia Deutschland](https://www.wikimedia.de/2021/?p=1067)). Idé: en frågetyp i quizet där eleven ordnar tre av våra egna källkontrollerade händelser. Det kräver ingen definition av "samtidigt" och går inte att gissa på namnet.
- **Samma uppgift för alla varje dag** (TimeGuessr): en daglig omgång som är densamma för alla, med poäng för både år och plats ([Gigazine](https://gigazine.net/gsc_news/en/20230821-timeguessr), [PCWorld](https://www.pcworld.com/article/3233865/geoguessr-fans-should-try-this-addictive-history-game.html)). Idé: "Dagens år" som en klass kan göra samtidigt. Närliggande: #469, #566, #1126.

För en riktig benchmark behöver värdarna ovan tillåtas i miljöns nätinställningar, eller så görs den från en annan miljö.

## Förslag på issues

Inga är skapade. Öppna pull requests rör `data/` (#1284 bilder, #1285 fall-turerna, #1286 riken, #1287 franska). `data/ui/*.json` och `tests/webblasare.mjs` räknas inte som krock.

| # | Förslag | Etikett | Modellnivå | Filer | Krock |
|---|---|---|---|---|---|
| 1 | Årstipset får inte knuffa tidsraden över kortet och fokusraden (A1), döljs i tur, lektion och Fokus | `bug`, `utseende`, `redo` | Sonnet medium | `css/style.css`, `js/controllers/` (tipset), test | Ingen |
| 2 | Lås reglaget i tur och lektion, eller låt ett drag byta steg (A2) | `bug`, `redo` | Sonnet high | `js/ui/tour.js`, `js/timeline.js`, `js/ui/lesson.js`, test | Ingen; ta inte samtidigt som 6 |
| 3 | `detail.label` på svenska och ett test som kräver varje `ui()`-nyckel i `sv.json` (A3) | `bug`, `accessibility`, `redo` | Sonnet medium | `data/ui/sv.json`, `tests/` | Ingen |
| 4 | Pausa nedräkning och uppspelning medan en dialog är öppen (B1) | `bug`, `redo` | Sonnet high | `js/controllers/` (uppspelning), `js/surfaces.js`, test | Samma filer som 7 |
| 5 | Filter på och noll träffar: säg att filtret är på och visa "Visa alla kategorier" (B3) | `bug`, `redo` | Sonnet medium | `js/ui/panel.js`, `data/ui/*.json` | Samma fil som 9 och 10 |
| 6 | Trasig länk: en rad som säger att turen, kriget eller året inte fanns (B2) | `utseende`, `beslut-krävs` (ny text och ny yta) | Sonnet medium | `js/url-state.js`, `js/main.js`, `data/ui/*.json` | Ingen |
| 7 | Fokus till faktarutans Stäng och tillbaka, även från listan; Escape genom stängregistret för alla ytor | `accessibility`, `redo` | Sonnet high | `js/main.js`, `js/ui/panel.js`, `js/surfaces.js`, `js/controllers/range.js`, `js/ui/tour.js`, `js/ui/uppdrag.js` | Samma filer som 2 och 4; gör efter dem |
| 8 | Statusraden säger året och antalet träffar vid varje årsbyte, och ett år utan kort får en rad (B4) | `accessibility`, `redo` | Sonnet medium | `js/controllers/render.js`, `js/ui/funfact.js`, `data/ui/*.json` | Ingen |
| 9 | Ett ord för riktning i tid ("före"/"om") i panelen som på globen, och ett namn på romben (A5); panelens rad sägs en gång | `utseende`, `redo` | Sonnet medium | `data/ui/*.json`, `js/ui/panel.js` | Samma fil som 5 |
| 10 | Tidsfönstret i ord även för seende (A4), och teckenförklaring i mobil (A6) | `utseende`, `beslut-krävs` (ändrar första vyn) | Sonnet medium | `index.html`, `css/style.css`, `js/controllers/render.js` | Samma fil som 8 |
| 11 | `lang.beta` säger rätt reservspråk, syns när språket väljs, och reservtext får `lang` (B5) | `översättning`, `accessibility`, `redo` | Sonnet medium | `data/ui/de.json`, `es.json`, `fr.json`, `js/model.js`, `js/ui/panel.js` | #1287 rör franskt innehåll men inte `data/ui/fr.json`; kontrollera före start |
| 12 | Mobil: träffytor 44 px och minst 12 px text; stängknapp i Lager, Sök och följ och Turer | `accessibility`, `utseende`, `redo` | Sonnet medium | `css/style.css`, `index.html` | Samma fil som 1 och 13; gör i tur och ordning |
| 13 | Låg höjd och 200 % zoom: turkortet, turraden och faktarutan får plats (även 1280×800) | `utseende`, `redo` | Sonnet high | `css/style.css` | Samma fil som 1 och 12 |
| 14 | Förhistorien innan version 7: avrundade år i rubrik och panel, märket räknar bara "pågår" (B6) | `beslut-krävs` | Opus (källpolicy och tidsmodell) | `js/timeline.js`, `js/controllers/render.js`, `js/model.js` | Hör ihop med #1089, #1090, #1104; kan bli en kommentar där i stället |
| 15 | Definition av "samtidigt", typade fun facts och gränsen i quiz och jakt (syntesens A) | `beslut-krävs`, `data` | Opus | `data/funfacts.json`, `js/quiz-rules.js`, `js/uppdrag-rules.js`, `docs/produkt/13-ordlista.md` | Ingen öppen PR; styr 16 och 18 |
| 16 | "Hände år X", "Pågick då" och "Strax före eller efter" i panelen, först utan nytt datafält (syntesens B) | `beslut-krävs` | Opus för beslutet, Sonnet high för bygget | `js/ui/panel.js`, `data/ui/*.json` | Efter 15; samma fil som 5 och 9 |
| 17 | Synlig tidsskala: skarvarna i den hoptryckta skalan (syntesens I) | `beslut-krävs` | Opus | `js/timeline.js`, `css/style.css` | Hör till version 7.0; kan bli en kommentar på #49 |
| 18 | Quizet: svårare felsvar och en frågetyp "ordna i tid" | `idé`, `beslut-krävs` | Sonnet high | `js/quiz-rules.js`, `js/ui/quiz.js`, `data/ui/*.json` | Efter 15; närliggande #469, #1126 |
| 19 | "För lärare" i Hjälp eller Mer, och knapp för storskärm i stället för `?presentation=1` | `beslut-krävs`, `utseende` | Sonnet medium | `index.html`, `js/ui/lesson.js`, `js/ui/print-sheet.js`, `data/ui/*.json`, `data/turer/*` | #1285 rör tre andra turfiler; ingen krock i sak |
| 20 | Skolinnehåll: ett jaktår per lektion, förväntade svar på lärarbladet, ordförklaringar och åldersanpassat elevblad i åk 4–6-lektionen | `data`, `källkontroll`, `beslut-krävs` | Opus (källbunden text) | `data/uppdrag.json`, `data/turer/vikingatiden-och-varlden.json`, `data/turer/andra-varldskriget.json`, `data/ui/*.json` | Endast Claude Code; närliggande #1279, #299, #774 |

**Rekommenderad ordning:** 1, 2 och 3 först (följdfel av 6.2.0 som syns direkt), sedan 4, 5 och 8. Besluten i 15 bör tas före 16 och 18. 14 och 17 kan lika gärna bli kommentarer på version 7-issues som egna issues.

**Rekommendation till DasKrokodil om besluten:** säg ja till 15 med regeln "samtidigt = pågår samma år, annars nära i tid" (syntesens rekommendation 1), och låt 6, 10 och 19 gå som små paket; de ändrar lite men syns för förstagångsbesökaren och läraren.

## Inte kontrollerat

- Riktiga enheter, riktig skärmläsare, Firefox och WebKit. Klotet ritas med programvarurendering här, så bildkvalitet, prestanda och den mörka rutan över klotet i mobil är inte bedömda.
- Fliken Plats ("Vad hände här?"), förslagsformuläret, affischen, utskriften på papper och Dela.
- Stängda issues utöver #991–#1004 och #886, till exempel hur #1012 och #926 slutade.
- Lgr22:s ordalydelse hos Skolverket och sakinnehållet i turer och händelser. Inga sakfel är flaggade.
- dev.historiagloben.se: genomgången är gjord lokalt på `main`, inte på den publicerade sidan.
- Hur riktiga besökare upplever något av detta. Personor och upplevelser är antaganden.
- Produktdokumenten (`docs/produkt/05`, `06`, `13`) är inte uppdaterade; det görs i samma pull request som rättningarna.
