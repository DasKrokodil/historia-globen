# Helhetsanalys av Historia-globen

## Sammanfattning

**Granskningsdatum:** 2026-11-06  
**Verifierad produkt:** `v5.0.0`, live på [historiagloben.se](https://historiagloben.se/)  
**Verifierad kod:** `38236a4607c6923b10d6109df780bfa70402ad2d` (`main`)  
**Testmiljö:** Codex In-app Browser, Chromium-baserad, viewport 1400×900 och 400×800.

Historia-globen har en tydlig och ovanlig kärnidé: en rumslig tidslinje där samtidighet blir synlig. Den fungerar redan som en attraktiv upptäcktsmiljö för nyfikna vuxna och äldre elever, och källstatusen är mer transparent än i många liknande visualiseringar. Den tekniska grundprincipen – vanliga ES-moduler, data separerad från kod, genererade delmängder och ett centralt tillstånd – bör behållas.

Det som bör prioriteras nu är inte fler stora funktioner. Först bör projektet göra kärnflödet lättare att förstå och använda: en ny besökare ska snabbt förstå vad som går att göra, sökningen ska börja i ett neutralt läge, mobilkortet ska inte konkurrera med tidslinjen och sidan ska degradera värdigt utan fungerande WebGL. Därefter passar delbara vyer och en liten skolpilot bättre än ett fullt LMS, fler teman eller djup tid.

## 1. Regression och användartest

### Testat

- Startsidan laddades med unik queryparameter i 1400×900 och 400×800.
- Glob, platt vy-knapp, tidslinje, stegknappar, uppspelning, hastighetsknapp, Samtidigt-kort, sökpanelen, faktaruta, källor/status och mobilkortets utfällning observerades.
- En händelsefaktaruta för Tenochtitlan öppnades. Den visade bildtext, licens, källor, osäkerhet och granskningsstatus.
- Sökpanelen öppnades och dess filter, sortering och resultatlista lästes.
- Konsolloggar efter laddning och interaktioner: inga `warn` eller `error` fångades.
- Liveheaders kontrollerades med `curl`: `Cache-Control: no-cache`, `Permissions-Policy`, `X-Content-Type-Options` och CSP i `Report-Only` fanns.
- Fullständig tangentbordssekvens, 200 procents zoom, Escape-fokus, långsamma hopp utan grafikkort och samtliga krig/rike/religionsflöden kunde inte testas i denna körning.

### Fynd

#### Fynd 1: Mobilkortet täcker delar av arbetsytan i sitt initiala läge

- **Typ:** svårbegripligt / layoutproblem
- **Allvar:** medel
- **Bredd:** mobil
- **Persona:** 12-åring, lärare
- **Steg:** 1. Öppna sidan i 400×800. 2. Läs det halvt utfällda Samtidigt-kortet.
- **Förväntat:** Kortet ger en tydlig ingång utan att dölja tidslinjens viktigaste kontroller.
- **Faktiskt:** Kortet ligger över globen och går ned mot uppspelningsraden; i skärmbilden hamnar delar av fun factens nederkant och länkrad precis bakom eller nära tidslinjen. Kortet kan fällas ut, men det är inte uppenbart från bilden att vissa kontroller ligger under det.
- **Rekommendation:** reservera en fast, responsiv höjd för kortet och flytta tidslinjen när kortet är helt eller delvis öppet. Lägg till ett riktat mobiltest som kontrollerar synlighet för `Källor`, `Nästa` och uppspelningsraden.
- **Prioritet:** hög. **Storlek:** medel.

#### Fynd 2: Sökningen öppnas med filtret “Försvunna länder”

- **Typ:** svårbegripligt
- **Allvar:** medel
- **Bredd:** båda
- **Persona:** 12-åring, lärare
- **Steg:** 1. Klicka på “Sök och följ”.
- **Förväntat:** Ett neutralt sökläge eller en kort instruktion som visar hur man söker.
- **Faktiskt:** Panelen öppnas med `Försvunna länder` aktivt och 11 resultat, trots att användaren inte har valt ett ämne. Det är funktionellt men ser ut som ett sparat eller dolt urval.
- **Rekommendation:** öppna med “Alla” och tomma resultat, eller visa en tydlig “Exempel att prova”-yta separat från riktiga sökresultat.
- **Prioritet:** medel. **Storlek:** liten.

#### Fynd 3: Den visuella mängden kräver en förklaring före fri utforskning

- **Typ:** svårbegripligt / förslag
- **Allvar:** medel
- **Bredd:** båda
- **Persona:** 12-åring, lärare
- **Steg:** 1. Ladda startsidan. 2. Försök förstå globen, tidslinjen, medaljerna, färgerna och Samtidigt-kortet inom en minut.
- **Förväntat:** Användaren förstår den primära handlingen och vad en markör betyder.
- **Faktiskt:** Sidan visar många samtidiga lager: 33 träffar vid året 1325, markörer, kort, tidslinjemärken och flera kontrollgrupper. Hjälp och introduktion finns, men kärnförklaringen konkurrerar med själva visualiseringen.
- **Rekommendation:** gör introduktionen till en tydlig, frivillig “Börja här”-åtgärd med tre uppgifter: dra året, klicka en markör, jämför två platser. Behåll avancerade lager och turer bakom samma nivåindelning.
- **Prioritet:** medel. **Storlek:** medel.

#### Fynd 4: Källstatusen är en styrka men behöver pedagogisk tolkning

- **Typ:** förslag
- **Allvar:** medel
- **Bredd:** båda
- **Persona:** källgranskare, lärare
- **Observation:** Tenochtitlans ruta visar “osäkert”, ungefärlig datering, två källor stämmer, Wikipedia och Wikidata samt en separat förklaring av granskningsstatus.
- **Bedömning:** Transparensen är bra, men “två källor stämmer” kan för en elev låta som att historien är säker, medan “osäkert” samtidigt avser dateringen. Det är en viktig skillnad mellan källkontroll och historisk säkerhet.
- **Rekommendation:** behåll två nivåer visuellt: “Källorna är jämförda” och “Dateringen är ungefärlig/omstridd”. Lägg en kort elevnära förklaring direkt i rutan, inte bara bakom informationsknappen.
- **Prioritet:** medel. **Storlek:** liten.

#### Fynd 5: Kärnflödet fungerar, men fullständig tillgänglighetsregression återstår

- **Typ:** förslag / testlucka
- **Allvar:** medel
- **Bredd:** båda
- **Persona:** källgranskare, lärare
- **Observation:** DOM:en exponerar en region för globen, namngivna knappar, slider för år och tydliga aria-labels. Konsollen var ren. Den fullständiga sekvensen Tab, Shift+Tab, Enter, mellanslag, piltangenter, plus/minus, Escape och 200 procents zoom kördes inte.
- **Rekommendation:** gör ett kort, deterministiskt tillgänglighetsflöde obligatoriskt i webbläsartestet: öppna/stäng faktaruta, sökpanel och mobilmeny; verifiera fokusets återkomst och att årskontrollen kan nås utan mus.
- **Prioritet:** hög. **Storlek:** medel.

## 2. UX, innehåll och källtillit

### Styrkor

- “Vad hände samtidigt?” är en tydlig och minnesvärd produktkärna. Samtidigt-kortet gör den abstrakta idén konkret.
- Glob, platt karta och tidslinje kompletterar varandra. Markörerna har tillgängliga namn som beskriver tidsläge och osäkerhet.
- Faktarutan visar bildens karaktär, licens, källa och granskningsstatus. Det gör AI-genererade illustrationer spårbara i stället för att låta dem se historiska ut.
- Urvalet är faktiskt globalt. `data/events.json` innehåller 761 händelser, varav 409 är `two-sources` och 352 `source-checked`; 182 har bild. Det är ett bra underlag, men fördelningen är kraftigt krigsdominerad: 438 av 761 händelser är krig.

### Innehålls- och perspektivrisker

Krig är en effektiv väg in i historien men får inte bli modellens implicit viktigaste historia. Nuvarande kategorier innehåller bara en post under `manniskan`, fyra under `natur` och få poster om vardagsliv, arbete, barn, kön, sjukdom, klimat, migration och ekonomi. Detta bör behandlas som en innehållsbalansfråga, inte bara som “fler händelser”. Återanvändbara perspektivlinser – vardagsliv, migration/diaspora, urfolk/minoriteter, kön/barndom, arbete/handel, klimat/sjukdom och historiebruk – ger större pedagogisk effekt än många nya specialvyer.

## 3. Produktstrategi, benchmark och skola

### Vad andra produkter lär ut

- [History of the World](https://www.historyofthe.world/) kombinerar djup tid, kartförändring och guidade turer. Lärdomen är att ett stort innehåll kräver tydliga berättelseingångar; Historia-globen bör låna principen om turer, inte bygga en lika bred geologisk motor ännu.
- [TimelineJS](https://timeline.knightlab.com/) löser problemet “berätta en avgränsad kronologisk historia med media” på ett lättviktigt sätt. Historia-globen har en starkare rumslig identitet och bör därför prioritera datadrivna turer och delbara startlägen framför en generell tidslinjebyggare.
- [World History Encyclopedia Map](https://www.worldhistory.org/mapselect/iframe/) visar nyttan av ett enkelt årsreglage för politiska förändringar. Historia-globen skiljer sig genom samtidighet, källstatus och globen; den bör inte konkurrera med ren atlasbredd.

### Skolkoppling

I Lgr22 ska historia bland annat ge elever möjlighet att förstå historiska förhållanden, tolka och värdera källor och analysera historiebruk. Skolverkets [kursplan för historia](https://www.skolverket.se/undervisning/grundskolan/laroplan-lgr22-for-grundskolan-samt-for-forskoleklassen-och-fritidshemmet/curriculums/LGR22/GRGRHIS01) och [kommentarmaterial](https://www.skolverket.se/download/18.68c99c081804c5929ea1376/1652438374459/pdf9789.pdf) stödjer särskilt tre konkreta användningar:

1. **Åk 4–6:** jämför kulturmöten, handel, migration och levnadsvillkor kring 800–1500; låt eleverna följa vikingaresor och samtidigt välja en händelse i Afrika, Asien eller Amerika.
2. **Åk 7–9:** analysera civilisationer i olika delar av världen, kolonisation/slavhandel, demokratisering och globala förändringar.
3. **Källkritik:** välj två händelser med olika status och be eleverna formulera vad källorna stödjer, vad som är ungefärligt och vilken fråga som fortfarande är öppen.

Första skolsteget bör vara konto- och integritetsminimerat: delbar URL, lärarhandledning i Markdown/PDF, elevuppdrag med utskrift och gärna lokal sparning av ett uppdrag. Bygg inte elevkonton, resultatdatabas eller LMS-integration innan en lärare har testat ett konkret flöde.

## 4. Teknisk arkitektur och drift

### Beslut: behåll arkitekturen, ändra stegvis

Behåll den statiska arkitekturen. Den passar projektets ideella omfattning, är lätt att publicera och gör data- och licensgranskning synlig. Nuvarande kod har bra sömmar: centralt state, lagerregister, controllers, genererade datafiler och läsning av data separat från UI. `scripts/build-site.sh` och valideringen fungerade, och `node --test 'tests/*.test.mjs'` gav **103/103 godkända**.

### P0/P1/P2

#### P0 – gör före nästa större innehålls- eller skolrelease

- **P0.1 GPU-fallback och långa hopp:** GitHub issue [#692](https://github.com/DasKrokodil/historia-globen/issues/692) beskriver låsning i upp till 20 sekunder utan grafikkort. Inför en synlig fallback: platt karta/listläge, reducerad upplösning eller pausad rendering när WebGL inte kan leverera. **Prioritet: hög. Storlek: stor.**
- **P0.2 Mobil arbetsyta:** åtgärda Fynd 1 och lägg ett test för att kort, källor och tidslinje inte överlappar. **Prioritet: hög. Storlek: medel.**
- **P0.3 CSP:** live skickar fortfarande `Content-Security-Policy-Report-Only`. Behåll report-only under verifiering, men samla och åtgärda avvikelser och byt sedan till verkställande CSP med samma uttryckliga källor. **Prioritet: hög. Storlek: liten–medel.**

#### P1 – nästa avgränsade produktsteg

- **P1.1 Neutral sökstart och delbara lektionstillstånd:** färdigställ sök/delning med en URL som innehåller år, lager, fokus och språk. Lägg till ett lärarblad med 3–5 uppdrag. **Prioritet: hög. Storlek: medel.**
- **P1.2 Tillgänglighetsflöde:** lägg fokusåterkomst, tangentbord, zoom och reducerad rörelse i CI, inte bara frånvaro av konsolfel. **Prioritet: hög. Storlek: medel.**
- **P1.3 Innehållsbalans:** sätt mätbara mål per perspektiv och region innan fler krig importeras. **Prioritet: medel. Storlek: medel.**

#### P2 – senare

- Temamotor och fler innehållspaket när kärnflödet är stabilt.
- Människans långa historia som separat tidsläge med hierarkisk tidsskala.
- Jordens historia som eget geologiskt läge, inte som dinosaurier på den årsbaserade historiska tidslinjen.
- Full atlas/jämförelse först när delning, kartlager och historisk osäkerhet är beprövade.

### Säkerhet, integritet och CI

`Permissions-Policy` är snäv och feedbackfunktionen är avstängd som standard. Det är lämpligt för skola. CSP är dock bara rapporterande, så skyddet är inte verkställande ännu. `Cache-Control: no-cache` är ett rimligt korrekthetsval för filnamn som inte versionshashas, men bör följas upp om trafik eller filstorlek växer.

CI är stark: build/validering, JSON-/schema-/funktionskontroller och webbläsartest finns. Däremot visar [#702](https://github.com/DasKrokodil/historia-globen/issues/702) att Firefox/WebKit i releaseflödet har miljö- eller WebGL-problem. Separera “testet kunde inte starta motorn” från “produkten har ett beteendefel”, och behåll en liten CPU-/fallbackkontroll som kan köras även utan WebGL.

## 5. Milestones och rekommenderad roadmap

GitHub-snapshot 2026-11-06: 28 milestones totalt. Öppna milstolpar omfattar bland annat 13 issues i `Version 5.2`, 6 i `Version 6`, 26 i `Paket: Temavyer och innehåll`, 5 vardera i version 7–9 och flera parallella experiment-/hårdvaruspår. `v5.0.0` är släppt och releasekontrollen pågår vid granskningstillfället.

Det som är bra är den uttryckliga ordningen: stabilitet före skolpilot, teknisk grund före stora innehållsmassor och ett separat läge för djup tid. Det som bör ändras är att 5.2 inte får bli en säck för språk, sök, delning och introduktion samtidigt som 26 temaidéer konkurrerar om samma uppmärksamhet.

### Föreslagen ordning

1. **Stabiliseringspaket:** #692, Fynd 1, #702 och tillgänglighetsflödet. Exit-test: 400×800 utan överlapp, 1400×900, reducerad rörelse, tangentbord, CPU/WebGL-fallback och produktionskontroll.
2. **Avgränsad 5.2:** neutral sökstart, delbar URL och språkstatus. Exit-test: en lärare kan skicka en länk som öppnar samma år, fokus, lager och språk.
3. **Skolpilot:** ett elevuppdrag om samtidighet och ett om källstatus, med lärarhandledning och utskrift. Exit-test: en faktisk lärare kan genomföra 20–30 minuter utan konto.
4. **Innehållsbalans:** fyll perspektivluckor i små, granskade paket med täckningsrapport.
5. **Senare:** temamotor, människans långa historia, Jordens historia och atlasfunktioner.

### Bygg inte ännu

Bygg inte ett fullt LMS, offentlig elevranking, dagliga streaks, en kontinuerlig plattektonisk simulering, fler än ett litet antal nya specialvyer eller en generisk tidslinjebyggare ännu. De ökar innehålls-, test- och underhållsskulden innan den nuvarande upplevelsen är tillräckligt lätt för en ny elev och tillräckligt robust på svag hårdvara.

## 6. Prioriterad åtgärdslista

### Nu

- Fixa mobilkortets överlapp och neutralisera sökstarten.
- Gör GPU-/WebGL-fallbacken synlig och testbar.
- Lägg till ett deterministiskt tangentbords-/fokusflöde i CI.
- Dokumentera och åtgärda CSP-avvikelser inför verkställande CSP.

### Nästa

- Slutför delbar URL som lärarverktyg.
- Paketera två konto-fria elevuppdrag med källkritiska frågor.
- Sätt ett mål för perspektiv- och regionbalans, inte bara totalt antal händelser.

### Senare

- Temamotor och bredare innehållspaket.
- Separata lägen för människans långa historia och Jordens historia.
- Atlas/jämförelse efter att kärnflödet och skolpiloten har bekräftats.

Den roligaste delen är hur snabbt samtidighet blir begriplig när globen, kortet och tidslinjen pekar på samma år. Mest begripligt är faktarutan med osäkerhet och källstatus. Mest förvirrande är den stora mängden visuella signaler i första läget, särskilt på mobil, där kort och tidslinje konkurrerar om samma yta.

