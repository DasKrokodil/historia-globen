# sprak-de: granskning före v6.5.0

## Omfattning och stickprov
- Underlag: `andrade-texter-de.md` (1 271 nya eller ändrade tyska texter sedan 1a981da0). Jämfört med svenskan som källa, med `docs/ordlista-oversattning.md`, besluten om tilltal (2026-11-07, 2026-11-08) och #1715 (öppet).
- **data/ui/de.json: alla 142 lästa** (95 nya, 47 ändrade), plus de äldre nycklar som #1715 pekar på, för att se vad som är rättat.
- **Stickprov, cirka 210 av 1 129 övriga texter:**
  - `data/handelser/1-1499.json`: 57 av 254 (var sjätte rad plus 14 långa texter, bland annat korstagen, arabiska-erovringarna, bagdads-fall-1258, slaget-vid-zab, belagringen-av-akko-1189, jordbavningen-i-basel-1356, hagia-sofia-byggs-532 och tikals-nederlag-562).
  - `data/handelser/1946-1979.json`: 54 av 236 (algeriska-frihetskriget, biafrakriget, sexdagarskriget, koreakriget, vietnamkriget med flera).
  - `data/empires/` och `index.json`: cirka 50 (namn mot ordlistan avsnitt 9, kartnoter för usa, kina, bulgarien och italien).
  - `1500-1799`: 13, `fkr`: 12, `1900-1945`: 6, `1800-1899`: 3.
  - Turer: 9, resor: 4, `styles.json`: 2, `platser.json`: 1, `vyer.json`: 1.
- Mätningar med skript över alla tyska texter i innehållet (7 614): ordval, citattecken, tusentalsavgränsare, „Public domain“ mot „gemeinfrei“ och du-form.
- **Helhetsintryck:** tyskan i de nya omgångarna (#777, #781) är mycket god. Grammatiken och tonen är säkra, och namnen följer tysk praxis (Akkon, Dschingis Khan, Ktesiphon, Westjordanland, Incheon, Tal der Tränen). Datum skrivs rätt („16. Dezember 1971“) och Sie-tilltalet följs. Jag hittade ingen ändrad faktauppgift i stickprovet. Inget blockerar releasen.

## Blockerande
Inget.

## Bör rättas
1. **„Der islamische Staat“ som namn på en sida i ett krig** (`data/handelser/1-1499.json`, `arabiska-erovringarna`, `story.parties[0].name`, och i `summary`). För läsare i Tyskland, Österrike och Schweiz betyder „Islamischer Staat“ först terrorgruppen IS. Som rubrik på en krigsparti blir det missvisande. **Förslag:** `Die frühen Kalifate` eller `Das Kalifat (Medina, Raschidun, Umayyaden)`. I `summary`: „wuchs der frühe islamische Staat …“. Samma problem finns i källtexten („Den islamiska staten“, sv) och på engelska („The Islamic State“), se avsnittet till andra experter. Ingen fakta ändras, men rubriken bör ändras i alla språk samtidigt.
2. **„vor {n} Jahren“ betyder två olika saker i gränssnittet** (`panel.earlier`, `panel.earlierDays`, `time.beforeLabel`, ändrade i #1306, mot `detail.yearsAgo`/`yearsAgoShort`, nya i #1979). I Samtidigt-listan betyder „vor 34 Jahren“ 34 år före det valda året. I faktarutan betyder „≈ vor 40.000 Jahren“ räknat från i dag. Svenskan skiljer på dem („34 år före“ mot „år sedan“), tyskan gör det inte. I förhistorien står de bredvid varandra. **Förslag:** låt panelen stå kvar och gör faktarutans form entydig: `detail.yearsAgoShort` „≈ {n} Jahre vor heute“, `detail.yearsAgo` „Jahre vor heute und v. Chr.: „Jahre vor heute“ wird ab heute gezählt (auf Tausender gerundet), die Jahreszahl ab dem Jahr 1. {year} ist daher ≈ {n} Jahre vor heute.“, och `detail.yearsAgoInfo` „Jahre vor heute und v. Chr. erklären“. Det stämmer med innehållet, som redan skriver „Jahre vor heute“.
3. **„Karte“ betyder både kort och karta, och problemet har växt** (redan känt: #1715, punkten om Infokarte). Beslutet #1948 ger kartvyn namnet „Karte des Ortes“, och samtidigt heter platskortet fortfarande „Karte“:
   - `place.noneHere`: „kein Ort mit eigener Karte“ (läses nu som en egen karta).
   - `place.hereKey`, `globe.label`, `flat.label`: „wenn er eine Karte hat“.
   - Nya `facts.placesNote`: „Länder, deren Karte auf dieser Seite das Reich zeigt, mit den Jahren, in denen das Reich das Land auf der Karte abdeckt“ (två betydelser i samma mening).
   - Nya `sources.highlight.card`: „Quellen für diese Karte“.
   - Nya `help.s4t` använder tre ord för samma kort: „eine Karte hat“, „Im Steckbrief“ och „die Karte des Ortes“ (kartan).

   **Förslag:** platskortet heter `Infokarte` (som #1715 föreslog). „Karte“ står kvar för kartor och i den beslutade formen „die Karte „Wussten Sie?““. I `facts.placesNote`: „Länder, deren Infokarte auf dieser Seite das Reich zeigt …“. I `help.s4t`: „… dass er eine Infokarte hat … In der Infokarte öffnet „Auf der Karte zeigen“ die Karte des Ortes …“. Skriv in termen i ordlistan.
4. **Ordlistan säger fortfarande „Nahkarte“** (`docs/ordlista-oversattning.md` rad 517 och 523). Enligt #1948 ska namnet vara „Karte des Ortes“, och knappen heter „Auf der Karte zeigen“. de.json följer redan beslutet, men ordlistan styr nästa översättare fel. **Förslag:** uppdatera de två raderna på alla språk.
5. **Tre namn på knappen för faktafel:** `detail.report` „Sachfehler melden“, nya `feedback.reportCorrection` „Faktenfehler melden“ (i resornas ruta) och nya `feedback.category.correction` „Einen sachlichen Fehler melden“. `sources.urval.p5` hänvisar till „Sachfehler melden“. Svenskan har ett namn, „Rapportera faktafel“. **Förslag:** „Sachfehler melden“ och „Einen Sachfehler melden“.
6. **Faktarutan heter två saker i de.json.** „Faktenfeld“ finns i 16 nycklar, och ordlistan rad 524 säger „som i övriga de.json“. „Faktenkasten“ finns i 6 nycklar: `layer.religionsNote`, `marks.empire.flag`, `marks.empire.symbol`, `marks.empire.reconstruction`, `marks.origin.title` och `marks.origin.label`. „Faktenkasten“ finns också kvar i `data/uppdrag.json` (2 gånger, redan känt: #1715). **Förslag:** byt till „Faktenfeld“ överallt.
7. **„Lizenz: Public domain“ i bildtexterna:** 73 tyska texter i innehållet har „Public domain/Domain“, 39 har „gemeinfrei“. Exempel i den här releasen: `ibn-battuta-resa`, `konstantinopels-fall`, `landstigningen-vid-inchon` och `slaget-vid-tanga` (med versalt D). #2054 bestämmer formen „Lizenz: gemeinfrei“, men gäller fälten `credit`/`license`. Det här är de översatta bildtexterna. **Förslag:** byt med skript till „Lizenz: gemeinfrei“ och „gemeinfrei laut Wikimedia Commons“.
8. **`slaget-vid-otumba` (summary), möjlig förändrad betydelse:** „… versucht eine aztekische Armee …, die sich zurückziehenden Spanier und Tlaxkalteken zu vernichten. Sie schaffen es und gelangen nach Tlaxcala …“. „Sie schaffen es“ läses som att aztekerna lyckades förinta dem. Svenskan säger „De klarar sig“, alltså att spanjorerna överlevde. **Förslag:** „Diese entkommen jedoch und gelangen nach Tlaxcala, wo sie neue Kräfte sammeln können.“
9. **„Gymnasium“ som målgrupp** (`data/turer/det-har-har-du-hort.json` `audience`, och den äldre `print.gy`). I Tyskland och Österrike börjar Gymnasium vid cirka 10 års ålder (Schweiz: cirka 12–15 år), så det säger inte att turen är för 16–19 år. Engelskan har „Upper secondary“. **Förslag:** „Sekundarstufe II (16–19 Jahre)“, eller kort „Oberstufe“ i `print.gy`.
10. **`vyer.json` `panel.summary`:** „{inside} laufend, {near} in der Nähe“. „nära“ betyder här nära i tid, men „in der Nähe“ betyder nära i rummet. **Förslag:** „{inside} laufend, {near} zeitnah“, eller i samma ord som `panel.groupNear`: „{near} kurz davor oder danach“.
11. **Kvar från #1715 och fortfarande inte rättat** (redan känt: #1715):
    - `place.enterBusy.fokus`, `regionView.keys` („fächert sie auf“), `focus.windowAsym`, `place.rangeEnded`.
    - `link.noFocus` („verfolgt“), och „Verfolgen Sie“/„Verfolgens“ i `focus.note.places`, `legend.followLayers` och `legend.layersDimmed`.
    - Lektion, Unterrichtsstunde och Unterrichtsmodus (`lesson.band`, `teacher.lessons`, turernas „Als Unterricht starten“).
    - „Nordleute“ (10 texter), `hunt.timeYear` („fand nicht … statt“ ska vara „war … nicht im Gange“), `scale.newFull`, `play.pausesAt`, `regionView.brickLabel` (utan „Nr.“), `layers.groupCount`, `legend.spreadCoastToday` och „Felsschutz“ (fkr, Xihuatoxtla).
    - När källorna skiljer sig finns två former: „Die Quellen weichen voneinander ab“ (189) och „… unterscheiden sich“ (125).

    **Rättat sedan v6.4.0:** knappen och kortet „Gleichzeitig-Karte“ har bytts till „die Karte „Wussten Sie?““ överallt enligt #1867, och tilltalet i jakten är gjort opersonligt (#1710).

## Smått
- `panel.groupInside` „Lief zu dieser Zeit“ låter ovant. Förslag: „Damals im Gange“.
- `place.huntImpossible` (opersonlig sedan #1710) „Um die Jagd fortzusetzen, muss das Folgen des Ortes beendet werden“ är tung. Förslag: „Um mit der Jagd weiterzumachen, zuerst dem Ort nicht mehr folgen.“
- `feedback.server.busy` „Es ist gerade ausgelastet.“ har inget subjekt. Förslag: „Der Dienst ist gerade ausgelastet.“
- **Tusental med mellanslag i stället för punkt**, 24 ställen, mot punkt i resten av innehållet:
  - `1-1499`: `bagdads-fall-1258` „200 000“, `arabiska-erovringarna` (4) och `korstagen` (bland annat „3 000–10 000“, „19 000“, „100 000“).
  - `fkr` `mammutar-wrangel` och `orakelben-skrift`, turerna `songhairikets-fall` och `hanrikets-fall`, och resan `zheng-he` „2 000“.

  Byt till „200.000“ och så vidare med skript.
- **Årtionden:** „1960er-Jahre“ finns 34 gånger och „1960er Jahre“ 29 gånger. Ordlistan avsnitt 2 säger „die 1960er Jahre“. Välj en form.
- **Raka citattecken** i tre tyska texter: Hatata („"Untersuchung"“, 1500-1799), Lothal („"Dock"“, fkr) och `empires/index.json` („"Hungarian Nationalists"“). Byt till „…“.
- `slaget-vid-wayna-daga`, bildtexten: „Musketeer“ ska vara „Musketier“.
- „Infokasten“ används om Wikipedias faktaruta (25 gånger, till exempel `sexdagarskriget` „413.000 im Infokasten“). de.wikipedia kallar den „Infobox“, som redan står i 13 texter. Välj „Infobox“.
- `belagringen-av-akko-1189`: „in dem, was der Dritte Kreuzzug wurde“ är ordagrant. Förslag: „im späteren Dritten Kreuzzug“.
- `slaget-vid-zab`: „Umayyaden-Kalifat“ och „Abbasidenkalifat“ står i samma mening. Välj en skrivform.
- `jordbavningen-i-basel-1356`: „Die Erdbebenserie dauerte ein Jahr“, men svenskan säger „Efterskalven fortsatte i ett år“. Förslag: „Die Nachbeben hielten ein Jahr lang an.“
- `utbrotten-i-ksudach`: tyskan lägger till „im Holozän“, som inte står i svenskan („efter istiden“). Det är ett tillägg och ingen ändring, men översättningen ska inte lägga till något. Stryk „im Holozän,“.
- `massakern-i-cholula` „Erzählungen der Ureinwohner“, och en fun fact „die Ureinwohner im heutigen Louisiana“. Förslag: „indigene Erzählungen“ och „die indigene Bevölkerung“, som innehållet annars skriver (15 gånger).
- `slaget-vid-yarmuk`: på tyska skrivs floden oftast „Jarmuk“. Det är ett antagande som jag inte har kontrollerat mot de.wikipedia.
- Äldre text, inte ändrad i den här releasen: `data/vyer.json` `panel.eventsOffHelp` „Schalte Ereignisse ein …“ är du-form i det allmänna gränssnittet. Förslag: „Schalten Sie Ereignisse ein, um zu sehen, was geschah.“ Spanskan har samma fel („Activa“), se sprak-es.

## Möjliga sakfel till andra experter
- **historiker och sprak-sv/sprak-en:** `arabiska-erovringarna`, parten „Den islamiska staten“ / „The Islamic State“. Det är inget sakfel, men namnet kan förväxlas med IS i alla språk. Överväg „De tidiga kalifaten“ eller liknande i källtexten, så att alla språk följer med.
- Jag såg inga översättningar som ändrar årtal, siffror eller namn i stickprovet, utom tillägget „im Holozän“ (`utbrotten-i-ksudach`) ovan.

## Luckor (saknas)
Gäller inte sprak-de.

## Ej kontrollerat
- Namnformerna „Schlacht bei Muhi“, „Jarmuk“, „Ammunition Hill“ och „Schlacht von Abu Ageila“ är inte kontrollerade mot de.wikipedia. Jag har ingen webbåtkomst i den här körningen, så det är antaganden och inga fel.
- Cirka 920 av de 1 129 innehållstexterna är inte lästa enskilt, bara mätta med skript.
- Hur långa texterna blir i gränssnittet är inte provat i webbläsaren. De nya nycklarna är ungefär lika långa som svenskan. De längsta är `layers.pFocusLabel` och `help.s5t`, som ligger i inställningar och hjälp och inte i knappar.
