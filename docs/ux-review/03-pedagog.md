# 03. Pedagogisk granskning

**Datum:** 2026-11-09
**Granskarens roll:** erfaren pedagog och historielärare (SO/historia, åk 4–9 och gymnasiet). Oberoende granskning; [02](02-uxdesigner.md) och [04](04-syntes.md) är inte lästa.
**Vad jag provade:** inventeringen [01](01-inventering.md) och alla skärmbilder i [skarmbilder/](skarmbilder/), och sedan appen lokalt (Chromium/Playwright, 1400 × 900 och 400 × 800): första vyn 1325, Samtidigt i världen, år 1916 och 501 f.Kr., följa första världskriget, lektionsläget för *Vikingatiden och världen samtidigt* (`#t=vikingatiden-och-varlden&m=lektion`, steg 1–3, dator och mobil), Samtidighetsjakten (start), Quiz (en fråga med svar), tidsintervallet med epokknappen *Nordisk bronsålder*, Om källorna. Jag har läst `data/turer/` (lärarfälten), `data/funfacts.json` (alla 56, mätt avståndet i tid), `data/intro.json`, `data/uppdrag.json`, `data/missuppfattningar.json`, `data/perioder.json`, `data/ui/sv.json` och reglerna i `js/quiz-rules.js` och `js/timeline.js`. Jag har räknat i `data/events.json` och `data/sources.json` med små skript.
**Kursplanen:** jag öppnade Skolverkets kursplan i historia (Lgr22, GRGRHIS01, samma adress som källan `skolverket-lgr22-historia`) 2026-11-09 med ett verktyg som sammanfattar sidan. Det jag skriver om kursplanen bygger på den sammanfattningen och bör kontrolleras ordagrant innan något byggs på det.
**Begränsningar:** ingen riktig elev eller lärare har varit med. Allt jag skriver om hur elever reagerar är **hypoteser** byggda på erfarenhet och märks så. Jag har inte provat surfplatta, skärmläsare, utskriften av bladen, hela Samtidighetsjakten eller en hel tur till slutkortet.

---

## Sammanfattning

Sidan har ett mycket starkt pedagogiskt grepp: samtidighet bryter den europeiska tidslinjen, och innehållet är seriöst och källbelagt. Att den känns plottrig och svår beror främst på tre saker. **(1) Kärnbegreppet "samtidigt" betyder minst sex olika saker.** Fönstret går från ±1 till ±120 år beroende på var på tidslinjen man står, sökningen använder upp till ±480 år, jakten ±25, quizet 50 år, och vart fjärde Samtidigt-kort jämför saker som ligger mer än 20 år isär (ett ligger 4 568 år isär). Det kan lära eleven att "samtidigt" betyder ungefär när som helst. **(2) Tidsangivelserna motsäger sidans egna källor.** Era-raden säger "Bronsålder" år 2901 f.Kr. och "Antiken och tidig medeltid" mitt i vikingalektionen. Tidslinjen visar ett år "0" som sidans egen ruta "Om år 0" säger inte finns. Krigets ruta säger "Innan kriget börjar" år 1916. **(3) Ingen ledning från "wow" till "jaha".** Man möter ett färdigt läge med cirka 650 klickbara saker, tre läsytor samtidigt och ingen fråga att svara på. Det som faktiskt leder, alltså introduktionen, turerna och den utmärkta turen *Hur vet vi det här?*, ligger gömt bakom namn som inte säger vad de är. Fördelningen bland mina tio fynd: **B (otydliga begrepp) 5, L (dålig ledning) 3, E (för många element) 2**. Mitt huvudbudskap till DasKrokodil är att plottrigheten mest är en **begreppsfråga**. Att ta bort knappar hjälper mindre än att ge tiden, "samtidigt" och kartans tecken en enda tydlig betydelse.

---

## Fynd

### 1. "Samtidigt" har ingen fast betydelse

- **Observation:** Sidans viktigaste ord betyder olika saker på olika ställen. Era-raden: "VISAR ±38 ÅR" vid 1325, ±11 vid 1916, ±120 vid 501 f.Kr., ±1 i fokus (`dator-01`, `dator-07`, `dator-09`, `dator-08`). Fönstret är 1,2 % av reglagets bredd (`yearsAcross(y, 0.012)` i `js/timeline.js`), alltså en följd av skärmskalan och inte ett historiskt val. *Sök och följ* listar "det som pågår inom ±40 år från 1916" och "±480 år från 501 f.Kr.". Samtidighetsjakten: "omkring år 1500 (1475–1525)", alltså ±25, medan era-raden samtidigt säger ±38 (`data/uppdrag.json`). Quizet räknar högst 50 år som samtidigt (`MAX_PAIR_GAP` i `js/quiz-rules.js`). Av 56 fun facts ligger 29 inte i samma tid: 9 ligger 1–5 år isär, 7 ligger 6–20 år, 7 ligger 21–100 år och 6 ligger mer än 100 år isär. Exempel är `fax-telefon` (33 år), `diamantsutran-gutenberg` (572 år) och `kleopatra-manen` (4 568 år). Alla får ändå etiketten **SAMTIDIGT · FUN FACT**. Projektet vet om problemet: kommentaren i `quiz-rules.js` säger att "samtidigt" vore "fel i sak" för Kleopatra-paret, men kortet säger det ändå. I tidsintervallet 1700–500 f.Kr. visar knappen "Samtidigt 58" för 1 200 år. Tecknet ± förklaras ingenstans.
- **Orsakstyp:** B (sekundär L)
- **Varför det är ett problem, och för vem:** Begreppet samtidighet är hela erbjudandet (kärna 1, M1). Elever bygger sina begrepp av hur ordet används, inte av definitioner. Hypotes: en elev i åk 4–6 som ser Titanic (1912) under "Samtidigt i världen" år 1916, eller "33 år innan" under rubriken Samtidigt, drar slutsatsen att samtidigt betyder "ungefär runt den tiden" och tappar skillnaden mellan *samtidigt*, *före* och *efter*. Det är den tidsuppfattning ämnet ska bygga. Den vuxna (persona A) märker inkonsekvensen och tappar förtroendet: "varför är 33 år samtidigt?". Tecknet ± är troligen okänt för många i åk 4–6 (hypotes). Lärare (B) kan inte förklara för klassen vad siffran på knappen betyder.
- **Allvar:** hög
- **Förslag:** Bestäm **en** definition och skriv den i [13-ordlista.md](../produkt/13-ordlista.md). Mitt förslag: *samtidigt = pågår samma år*, och allt annat heter *nära i tid* med riktning ("4 år före", "7 år efter"). Byt "VISAR ±38 ÅR" mot vardagsspråk, till exempel "Visar också det som hände 38 år före och efter". Ge fun facts en typ i datan: `samtidigt` (överlappar), `nära` (≤ 20 år) och `avstånd` (jämför tidsavstånd, som Kleopatra). Låt kortets etikett följa typen: "SAMTIDIGT", "NÄRA I TID", "TIDSAVSTÅND". Avståndskorten är pedagogiskt guld och ska vara kvar, men under rätt namn. Låt jakten och Samtidigt-panelen använda samma fönster, eller säg öppet att de skiljer sig. I tidsintervallet bör knappen heta något annat än "Samtidigt", till exempel "Under perioden 58".
- **Insats:** medel

### 2. Händelser och tillstånd blandas, och före och efter syns knappt

- **Observation:** År 1325 är 20 av 24 poster som "pågår" långvariga fenomen som varar över 100 år: Osmanska riket (cirka 1299–1922), Undervisning i Oxford, Hansan, Cahokia, Dorsetkulturen. Samma sak gäller 16 av 17 poster år 501 f.Kr. (räknat i `data/events.json`). Av alla synliga händelser varar 87 över 100 år och 55 över 300 år. I listan Samtidigt i världen (`dator-02`) står "Osmanska riket" överst. Därefter kommer "Digerdöden 1346–1353", som ligger 21 år *efter* 1325, och "Korstågen 1095–1291", som slutade 34 år *före*. De "nära" posterna skiljs bara med något svagare titelfärg (`.event-item.is-near` i `css/style.css`) och med ett ord i sammanfattningen överst. På kartan står "Titanic sjunker · slut 1912" och "Kongofristaten … · slut 1908" år 1916 (`dator-07`). I vikingalektionens första steg, år 793, står "Karl den store kröns till kejsare · börjar 800". Framtid och dåtid ritas i samma bildspråk som nuet.
- **Orsakstyp:** E (sekundär B)
- **Varför det är ett problem, och för vem:** Skillnaden mellan *händelse* (något som hände) och *tillstånd eller process* (något som fanns, en lång linje) är grundläggande i historieämnet. Enligt min läsning av kursplanen talar den om långa historiska linjer och om kontinuitet och förändring. När allt heter "händelse" och står i samma lista blir listan lång utan att säga något, och det skapar plottrighet (E). Hypotes: en elev läser "Samtidigt i världen 1325: Digerdöden" och skriver i sitt arbete att digerdöden var 1325. "Slut 1912" om en händelse som tog en natt är dessutom obegripligt, eftersom "slut" låter som ett slutår. Det slår mot M1 och mot alla elevpersonor C–E.
- **Allvar:** hög
- **Förslag:** Dela listan och kartans etiketter i tre tydliga grupper med ord, inte bara nyanser: **"Hände år 1325"**, **"Pågick då"** (riken, kulturer, städer, alltså långa fenomen, gärna hopfällt) och **"Strax före / strax efter"** med antal år ("21 år senare"). Byt "· slut 1912" mot "· 4 år tidigare (1912)" och "· börjar 800" mot "· om 7 år (800)". Ett datafält i stil med `"kind": "period"` för långa fenomen skulle räcka för att sortera, men det är ett beslut om datamodellen.
- **Insats:** medel

### 3. Tidsangivelserna motsäger sidans egna källor

- **Observation:** Era-raden kommer från fyra hårdkodade namn i `SEGMENTS` i `js/timeline.js`, inte från den källbelagda `data/perioder.json`.
  - År 2901 f.Kr. säger raden "BRONSÅLDER OCH TIDIG JÄRNÅLDER" (`dator-18`). Sidans egen indelning efter Historiska museet sätter *Nordisk stenålder* till 1700 f.Kr.
  - I åk 4–6-lektionen om vikingatiden, år 793, säger raden "ANTIKEN OCH TIDIG MEDELTID" (min skärmbild i lektionsläge). Sidans egen period *Antiken* slutar enligt källorna "från cirka 300 till cirka 600 e.Kr." (`data/perioder.json`).
  - År 1700 heter "Medeltid och tidigmodern tid" (`dator-14`), och samma europeiska etikett står över Mexiko och Mali 1325.
  - Tidslinjen visar "0" (`d.textContent = y === 1 ? '0' : …` i `js/timeline.js`). Sidans egen ruta "Om år 0" i `data/handelser/fkr.json` säger: "Det finns inget år 0".
  - Krigets faktaruta säger **INNAN KRIGET BÖRJAR** när året är 1916 och kriget pågår (`dator-08`, `mobil-08`; nyckeln `story.labelIntro`).
  - Årsrutan har länken "Välj ett tidsintervall" och direkt under den fem knappar som hoppar till ett *år* (`dator-19`). Det ser ut som intervall men är det inte.
- **Orsakstyp:** B
- **Varför det är ett problem, och för vem:** Epokbegrepp är det som elever i skolan faktiskt ska använda, och läraren rättar dem. En sida som säger "antiken" om vikingatiden mitt i en lektion för åk 4–6 skapar ett fel som läraren måste reda ut, och det skadar trovärdigheten (B, M2, M3). Kursplanen talar enligt min läsning om en historisk referensram och en kronologisk överblick. "Inget år 0" är just en sådan sak som lärare tar upp (hypotes). Sidan har redan rätt kunskap i datan, och därför är motsägelsen extra synlig. Felen är dessutom osynliga för den som utvecklar, eftersom de bara syns i läget.
- **Allvar:** hög
- **Förslag:** Låt era-raden antingen försvinna eller hämta sitt namn ur `data/perioder.json` med källa och förenklingstext. Mitt förslag är att visa bara århundradet ("1300-talet", "800-talet", "2900-talet f.Kr."). Det är neutralt, gäller hela världen och är lätt att lära sig. Epoknamnen hör hemma i intervallformuläret, där de redan har källor och förbehåll. Byt "0" på tidslinjen mot "1 e.Kr." eller "Vår tideräkning börjar". Byt "Innan kriget börjar" mot "Bakgrund: varför kriget började". Döp om eller flytta snabbknapparna i årsrutan så att de inte hamnar under rubriken om intervall.
- **Insats:** liten

### 4. Första minuten: ett färdigt läge utan fråga och utan väg in

- **Observation:** Sidan öppnar 1325 med klotet, cirka 650 fokuserbara element, tre bildkort, en fun fact med tre chips och tre länkar, 14 Lager-val bakom en knapp, sju stegknappar och en tidslinje full av prickar och romber utan förklaring (`dator-01`, `mobil-01`; inventeringen avsnitt 1). Introduktionen startar inte av sig själv. Knappen heter "Ett år, en plats" och står bland Utforska-knapparna, så namnet säger inte att det är en introduktion. Hjälp säger "Välj … under **Fokus**", men knappen heter "Sök och följ" (`dator-11`). "Visste du?" flyttar besökaren 1 800 år och över halva jorden utan förvarning. Introduktionens tredje steg ("Nu är det din tur": utforska fritt, följ en berättelse, gör ett uppdrag) är den bästa ledningen på hela sidan, men den nås bara för den som hittar introduktionen.
- **Orsakstyp:** L (sekundär E)
- **Varför det är ett problem, och för vem:** M1 ("förstå samtidighet på under en minut") kräver att besökaren *gör* något som leder till aha-upplevelsen, inte bara ser den. Fun facten 1324–1325 är ett utmärkt exempel, men den läses som en text bland många. Hypotes: den nyfikna förstagångsbesökaren (F) och eleven (C) frågar "vad ska jag göra?" och drar i tidslinjen på måfå. Spelaren (persona 10) är van vid en första uppgift i spel. Läraren (B) som visar sidan på projektor får börja med att förklara gränssnittet i stället för innehållet.
- **Allvar:** hög
- **Förslag:** Byt namn på "Ett år, en plats" till **"Kom igång"**, eller visa en diskret rad första gången, till exempel *"Ny här? Se vad som hände samtidigt på 30 sekunder →"*, som kan stängas och inte visas igen. Sätt en fråga på Samtidigt-kortet: "Hittar du en sak till som hände 1325?". Rätta "Fokus" i Hjälp. Låt "Visste du?" säga vart den tar en ("Till 491 f.Kr. →"). Lägg en liten förklaring vid tidslinjen: prick = händelse, romb = samtidigt-kort, streck = resa. Den finns i dag bara inne i Lager.
- **Insats:** liten till medel

### 5. Källkritiken visar en process, men lär inte ut frågorna (M9)

- **Observation:**
  - Faktarutan visar "Källa: Ottoman Empire – Wikipedia, Wikidata Q12560", statusraden "Händelsen: två källor stämmer (i)" och "Kontrollen gäller källorna, inte om historien är säker" (`dator-03`).
  - Av 827 synliga händelser har 786 (95 %) bara Wikipedia och/eller Wikidata som källa. Av 420 med "två källor stämmer" är 397 just paret Wikipedia + Wikidata (räknat i `data/sources.json`). Båda är Wikimedia-projekt, och en elev som lär sig källkritik kommer att fråga om de är *oberoende*.
  - Källregistret har 1 373 länkar till engelska Wikipedia och 1 till svenska.
  - Det bästa källkritiska materialet ligger gömt: turen *Hur vet vi det här? Sex saker många tror* ("Vem sa det, och när?", "Vem ritade bilden, och varför?", "Vem tjänar på det?"), statusen "Här är forskare inte överens" i turerna, vikingalektionens frågor om al-Bakri och Island, och missuppfattningsrutorna. Turen ligger sist av åtta i turlistan, och missuppfattningarna (18 st.) syns bara i faktarutan för vissa händelser.
- **Orsakstyp:** L (sekundär B)
- **Varför det är ett problem, och för vem:** M9 säger "vem säger det, hur vet vi, finns fler källor, är de överens". Statusen svarar på en annan fråga, nämligen *har sidan kontrollerat?*. Hypotes: elever läser "källkontrollerad" och "två källor stämmer" som "det är sant", och förbehållet i liten text läses inte. Elever i åk 4–6 och många i 7–9 kan inte läsa källorna, eftersom de är på engelska. Då blir länken en symbol och inte ett verktyg. Enligt min läsning av kursplanen är *vad historiska källor är*, *tolkning av källor* och *historiebruk* centralt innehåll. Turen om vikingahjälmar och om Napoleon är ett skolexempel på historiebruk, men ingen hittar den.
- **Allvar:** hög
- **Förslag:** Flytta *Hur vet vi det här?* först i turlistan, eller ge den en egen ingång ("Hur vet vi?") i faktarutan, nära källan. Byt statusraden mot frågeform, till exempel *"Var kommer det här ifrån? Wikipedia (engelska) och Wikidata. Båda hör till Wikimedia."* Det lär ut frågan samtidigt som svaret ges. Visa "Här är forskare inte överens" även i faktarutan när en händelse har `note` om oenighet, inte bara i turer. Lägg till svenska Wikipedia som källa när den finns och stämmer, åtminstone för händelserna i lektionerna. Gör `two-sources` med Wikipedia + Wikidata till en fråga för DasKrokodil: ska det heta "två källor stämmer" när de är systerprojekt? (Källfrågan avgörs i #926.)
- **Insats:** medel

### 6. Tre läsytor samtidigt, och mest av allt i skolflödena

- **Observation:** På dator kan Samtidigt-kortet, Samtidigt-panelen och faktarutan vara öppna på en gång (`dator-03`). I fokus på ett krig syns legenden Krigsområden, Samtidigt-kortet, krigets faktaruta, fokusraden, pausraden ("Pauser: ● Krigets händelser ○ Samtidigt (av) · Spela klart ▶"), "Nästa paus: …" och stegknapparna (`dator-08`). I lektionen för åk 4–6 visar faktarutan för Lindisfarne en missuppfattningsruta med en lång vuxentext ("Undantaget är två eller tre avbildningar av (rituella) hjälmar med utskott …") och sedan tre statusrader: "Missuppfattningen: två källor stämmer", "Händelsen: två källor stämmer" och "Kontrollen gäller källorna …". I lektionen finns tre sätt att gå framåt: "Nästa →", "▶ Fortsätt" och ▶ i stegraden.
- **Orsakstyp:** E
- **Varför det är ett problem, och för vem:** Arbetsminnet räcker inte till tre parallella texter, en karta och en tidslinje. Det blir tydligast hos de yngre (C) och hos elever med läs- och skrivsvårigheter (H). Hypotes: en elev i åk 4–6 som ska svara på lektionens fråga läser fel ruta eller trycker "Fortsätt" när "Nästa" var menat, och hamnar ur fas med klassen. Läraren på projektor (B) får svårt att peka ut vad klassen ska titta på.
- **Allvar:** medel
- **Förslag:** Regeln **en läsyta åt gången**: när faktarutan öppnas fälls Samtidigt-kortet ihop och panelen stängs, eller tvärtom. I lektionsläget räcker turkortet, och faktarutan öppnas bara när någon trycker "Läs om händelsen". Visa missuppfattningsrutan hopfälld ("Vanlig missuppfattning: hade vikingar horn? Visa"). Visa en statusrad, inte tre. Ha en knapp framåt i turer och lektioner, och flytta "Fortsätt" (spela fram tiden) till en sekundär plats med text som säger vad den gör.
- **Insats:** medel

### 7. Kartan visar konstruktioner som ser ut som fakta

- **Observation:**
  - Krigsområdet för första världskriget 1916 är en spetsig, rödrandig kil från Storbritannien till Mellanöstern (`dator-07`). Den är ritad runt krigets slagplatser ("område runt kriget och slagen hittills") men ser ut som ett ockuperat område eller en front.
  - Riken ur Cliopatria har skarpa gränser, och "ett kolonialvälde har samma färg överallt" (`focus.note.empires`). Förklaringen syns först i fokusläget.
  - År 2901 f.Kr. är kartan nästan tom: tre markörer och inga riken (`dator-18`), och "Om urvalet" finns bara under Källor.
  - Långvariga fenomen sitter på en punkt. Osmanska riket står vid Konstantinopel år 1325, och faktarutan säger själv "huvudstad från 1453" (`dator-03`).
- **Orsakstyp:** B
- **Varför det är ett problem, och för vem:** Kartläsning är en förkunskap som sidan tar för given. Hypoteser: elever läser den röda kilen som "där striderna var", färgen som "samma land", en tom karta som "här fanns inga människor" och en punkt som "här låg riket då". Vuxna (A) förstår mer, men även de kan läsa en skarp gräns som exakt. Det slår mot M2 (det belagda ska inte se mer exakt ut än källan) och mot M4 (urvalet ska synas).
- **Allvar:** medel
- **Förslag:** En alltid nåbar **"Vad visar kartan?"**-ruta (en rad per tecken: punkt, färgat område, rödrandig yta, streckad linje), och inte bara undertexter i Lager. Rita krigsområdet med mjukare kant och märk det "ungefärligt område för striderna". När få händelser syns: skriv på kartan "Globen visar ett urval. Här finns än så länge få händelser" med länk till Om urvalet. Skriv "Platsen visar huvudstaden 1453–1922" eller låt punkten vara tom före det året (beslut för DasKrokodil).
- **Insats:** medel

### 8. Tidslinjens skala lär ut fel längd på tiden

- **Observation:** Skalan är segmenterad: 3000–500 f.Kr. (2 500 år), 500 f.Kr.–1000 (1 500 år), 1000–1800 (800 år) och 1800 till i dag (cirka 226 år) får lika stor bredd var (`SEGMENTS` i `js/timeline.js`, beslut 4). Det syns bara på etiketterna under linjen. Enda ledtråden är att avståndet mellan "0" och "500" ser ut som avståndet mellan "1900" och "1950" (`dator-01`). Uppspelningen går "25 år/s" överallt, så forntiden går lika fort per sekund men tar mycket kortare skärmsträcka.
- **Orsakstyp:** B
- **Varför det är ett problem, och för vem:** Valet är rimligt för att få plats med det moderna. Men elever lär sig tidslinjer som avstånd = tid, och en lärare kommer att fråga om det (hypotes). Hypotes: elever i åk 4–6 får intrycket att forntiden var kort och att mycket har hänt nyligen, alltså motsatsen till det läraren försöker bygga. Det blir viktigare med version 7 (människans långa historia) och 8 (jordens historia).
- **Allvar:** medel
- **Förslag:** Gör skalbytena synliga: tunna skarvar med text som "1 cm ≈ 250 år" och "1 cm ≈ 20 år", eller färgade band med längden i år. Lägg en kort mening i Hjälp: "Tidslinjen är hoptryckt långt bak i tiden." Överväg en knapp "Visa tiden i rätt skala" som pedagogiskt verktyg. Den gör sedan en bra fråga till lärarbladet: "Varför ser forntiden så kort ut?".
- **Insats:** liten (förklaring) till medel (rätt-skala-läge)

### 9. Quiz och jakt prövar annat än samtidighet

- **Observation:** Quizets felaktiga svar ska ligga minst 200 år från rätt svar (`MIN_GAP` i `js/quiz-rules.js`). Svaren visas utan årtal och plats tills man har svarat (`dator-21`: Mingdynastin 1368–1644 mot "Brasília blir Brasiliens huvudstad", "Tenochtitlan", "Kokodafälttåget"). Frågan går därför att lösa genom att gissa "gammalt eller modernt" utifrån namnet. Återkopplingen efter svaret är bra: årtal, förklaring ur fun facten och källor. Samtidighetsjakten ger en tydlig uppgift och en bra reflektionsfråga ("Kände människorna på de olika platserna till varandra? Hur skulle du kunna ta reda på det?"), men den nås via Mer och har ett annat fönster än sidan i övrigt (fynd 1).
- **Orsakstyp:** L (sekundär B)
- **Varför det är ett problem, och för vem:** Ett quiz som går att lösa genom att känna igen ord som "Brasília" eller "fälttåg" övar inte på att placera saker i tid och rum. Hypotes: elever i åk 7–9 (D) märker det snabbt och slutar ta quizet på allvar. Jakten är sidans bästa aktivitet för att *göra* samtidighet. Den förtjänar att synas mer, särskilt för den nyfikna (F), och inte bara för skolan.
- **Allvar:** medel
- **Förslag:** Låt en svårare nivå använda felsvar som ligger 50–150 år bort, och visa plats och årtal för alla tre svar redan i frågan. Då blir uppgiften att räkna och jämföra, inte att gissa. Ge jakten en plats i introduktionens tredje steg (finns: "Gör ett uppdrag") och i Samtidigt-panelen ("Jaga själv: hitta tre världsdelar"). Fler jaktår, till exempel ett i antiken och ett efter 1900, vore en innehållsfråga för DasKrokodil.
- **Insats:** liten till medel

### 10. Namn på knappar och lägen betyder flera saker

- **Observation:** Inventeringens avsnitt 7: "Vy" betyder två saker (Glob/Platt karta/Upptäcktsresor och förvalen i Lager), "Utforska" två (knappgruppen och ett förval), "Upptäckt" två (Upptäcktsresor och Upptäcktsvy). Fokus, Följ, Sök och följ, Följ berättelsen, Tur, Lektion, Rikets berättelse och Berättelseläge betyder närliggande men olika saker. "Ett år, en plats" är introduktionen, men namnet säger det inte.
- **Orsakstyp:** B (sekundär E)
- **Varför det är ett problem, och för vem:** Varje ord man måste lära sig för att använda verktyget är ett ord som inte handlar om historia. Hypotes: lärare (B) och elever (C, D) blandar ihop "följa ett krig" och "ta en tur", och vet inte vilket som har frågor och slutkort. Det skapar en känsla av plottrighet utan att någon kan säga varför, och det är just DasKrokodils upplevelse.
- **Allvar:** medel
- **Förslag:** Ett ord per sak, gärna verb som säger vad man gör: **Utforska** (fritt), **Följ** (krig, rike, resa: tiden spelas upp), **Berättelser** (turer och lektioner), **Kom igång** (introduktionen). Döp om förvalen i Lager till "Visa: Allt / Bara kartan / Makt och gränser …" i stället för "VY". Stäm av mot projektordlistan i samma pull request.
- **Insats:** liten

### Mindre iakttagelser

- "e.Kr." visas ibland ("793 *e.Kr.*" i lektionen) och ibland inte ("1325"). Visa det konsekvent, åtminstone under år 1000, så att eleven ser att det finns två håll.
- Samtidigt-panelen år 2901 f.Kr.: "pågår år 2901 f.Kr.." (två punkter, `dator-18`).
- Källtitlarna i faktarutan är på engelska ("Ottoman Empire – Wikipedia") även i det svenska gränssnittet. Skriv "engelska Wikipedia" så att eleven vet vad som väntar.
- Hastigheten "7,6 år/s" i lektionsläget och "2,5 år/s" i fokus säger lite för en elev. "Snabbare/långsammare" räcker.
- Introduktionen använder du-form ("Du står kvar på 1889") och quizet artig neutral form. Det är rimligt på svenska, men kontrollera mot tilltalsbeslutet för de andra språken.
- Lärarbladets text hänvisar till "lägg till ?presentation=1 i adressen". Det är teknisk handpåläggning för en lärare. En knapp "Visa på storskärm" vore enklare.
- Vikingalektionens första steg säger "Vikingar anfaller", men händelsen heter "Vikingar plundrar". Det är små skillnader, men elever citerar ordagrant.

---

## Från nyfikenhet till förståelse

**I dag:** besökaren landar i ett färdigt, rikt läge (1325). Hen ser en fin fun fact men får ingen fråga. Hen drar på tidslinjen och ser etiketter komma och gå, utan att veta vad som räknas som "samtidigt" eller vad färgerna betyder. Fördjupningarna (följa krig, turer, jakt, quiz, *Hur vet vi?*) finns, men de ligger bredvid varandra med namn som kräver att man redan vet vad de är. Kedjan *undra → pröva → se sambandet → fråga hur vi vet* finns i delarna men inte i flödet.

**Den ledning jag skulle önska, steg för steg:**

1. **Ett år, ett samband, en fråga (0–30 s).** Samma start som i dag, men Samtidigt-kortet slutar med en fråga och en knapp: *"Hände något mer 1325? Leta på globen."* Era-raden säger bara "1325, 1300-talet".
2. **Eleven gör själv (30–60 s).** Ett tryck på en markör ger en kort ruta med *"Hände 1325"* eller *"Pågick då (sedan 1299)"*. Besökaren lär sig skillnaden mellan händelse och tillstånd genom att se den, utan definitioner.
3. **Tiden rör sig (1–2 min).** Ett tips: *"Dra till 1350. Vad är nytt? Vad har försvunnit?"* Etiketterna säger "för 4 år sedan" och "om 7 år", inte "slut" och "börjar".
4. **Välj en väg (2 min).** Samma val som introduktionens tredje steg, men alltid nåbara under ett namn: *Utforska själv* · *Följ ett krig eller rike* · *Ta en berättelse* · *Gör en jakt*.
5. **Hur vet vi? (när som helst).** I varje faktaruta står en rad i frågeform om var uppgiften kommer ifrån, med länk till *Hur vet vi det här?* och, där det finns, "Här är forskare inte överens".
6. **Avsluta med något att ta med sig.** Turer och jakt har det redan (slutkort, reflektionsfråga). Fritt utforskande kan få en enkel motsvarighet: *"Du har tittat på 1325 i Afrika, Europa och Amerika. Visste människorna där om varandra?"*

Inget av detta kräver konton eller en läroplattform. Det handlar om ord, ordning och en eller två frågor i rätt ögonblick.

---

## Kommande tillägg

Det här bör pedagogiskt vara på plats **innan** fler lager och lägen läggs till:

1. **En definition av "samtidigt"** (fynd 1), och typning av fun facts. Den behövs för 6.1 (tidsintervall), där "samtidigt" annars blir "inom 1 200 år". Den behövs också för 9 (jämföra två tider), där användaren jämför två fönster och måste veta hur stora de är.
2. **Skillnaden mellan händelse och tillstånd i datan och i listan** (fynd 2). Teman (6.2) och regionkort (6.3) kommer annars att fylla listan med fler "pågår"-poster. Ett tema om teknik blir begripligt först när "uppfinningen görs" och "tekniken används" skiljs åt.
3. **Era-raden ur källbelagd data, eller århundraden** (fynd 3). Epokerna i 6.1 och eran i sidhuvudet får inte säga olika saker. I dag gör de det: "Bronsålder" mot *Nordisk stenålder* för samma år.
4. **Synlig tidsskala** (fynd 8) före version 7 (tidslinje i nivåer) och 8 (jordens historia). När tidslinjen ska spänna över tiotusentals eller miljontals år måste användaren alltid se hur mycket tid en centimeter är, och övergången mellan nivåer måste märkas i ord ("Nu visar tidslinjen 100 000 år").
5. **En legend "Vad visar kartan?" och högst ett områdeslager åt gången som standard** (fynd 7). Riken, religioner, dagens gränser och krigsområden finns redan. Fler områden (regionkort, forntida kartor i 8, historiska kartor i 9) kräver att besökaren alltid kan se vad en färgyta betyder, var den kommer ifrån och hur säker den är. Religionslagrets egen förbehållstext ("Visar var religionen var officiell religion … inte … var alla troende bodde") är en bra modell och bör synas utan fokusläge.
6. **"Hur vet vi?" som återkommande mönster** (fynd 5) innan mer innehåll tillkommer. Varje nytt lager (geologiska tider, människoarter) har sin egen typ av belägg: datering, fynd, modeller. Version 7 och 8 vilar på metoder (kol-14, stratigrafi) som besökaren behöver ett enkelt språk för. Det bör planeras in i formatet, inte läggas till i efterhand.
7. **Jordens historia som eget läge med tydlig gräns** (redan tänkt). Pedagogiskt viktigt: att det aldrig ser ut som att dinosaurier och pyramider ligger på samma tidslinje i samma skala.

---

## Frågor att ta med till en riktig lärare

1. När du visar sidan för en klass i åk 4–6: förstår eleverna vad "±38 år" och skillnaden mellan "pågår" och "nära" betyder, eller behöver du förklara det varje gång? Hur lång tid tar det?
2. Använder du själv ordet "samtidigt" om saker som ligger 20–50 år isär, eller skulle du rätta en elev som gör det? Ska kort som "33 år före" finnas under rubriken Samtidigt?
3. Vilken epokindelning vill du se i sidhuvudet: århundraden, läroplanens perioder, de nordiska åldrarna eller ingen alls? Har du märkt att elever blir förvirrade av "antiken och tidig medeltid" om vikingatiden?
4. Godtar du Wikipedia (på engelska) som källa i undervisningen, och skulle du lära ut att Wikipedia och Wikidata är "två oberoende källor"? Vad borde det stå i stället?
5. Hittade du turen *Hur vet vi det här?* själv? Skulle du använda den i ett arbete om källkritik eller historiebruk, och vad saknas för att den ska räcka till en lektion?
6. Läser eleverna kartans rödrandiga krigsområden och rikenas färger rätt? Be två elever beskriva vad de ser år 1916 och jämför med det sidan menar.
7. Vilken tidslinje använder ni i klassrummet: lika långa sträckor för lika lång tid, eller hoptryckt forntid? Skulle den hoptryckta skalan störa det du lär ut?
8. Om du bara fick en sak ändrad före nästa lektion, vilken skulle det vara: färre rutor, tydligare ord, eller en tydligare första uppgift?
