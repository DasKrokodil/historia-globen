# Plan, backlog och UI/UX – uppföljning 2026-11-08

**Rekommendation: gör färdigt releaseflödet och rensa köinformationen före fler funktioner.** Den nya UI-rundan hittade ett ytterligare konkret hinder: när Samtidigt-listan är öppen hamnar Mer/Meny bakom den, så Samtidighetsjakten inte går att starta med pekning. Det gäller både dator och mobil. Det förstärker behovet av att granska övergångar mellan befintliga delar före nya lägen.

Detta är en fördjupning av [helhetsanalysen](2026-11-08-komplett-analys.md) i PR #875, på användarens uppdrag att särskilt granska planen, backloggen och UI/UX. Appens `main` är fortfarande `87ed68e271038a3ff74eabb6baa15078b1f22406`. Inga appfiler ändras och inga ärenden tas, triageras eller etiketter ändras. Förslagen nedan är underlag för Claude Code och DasKrokodil.

Tidigare täckning, benchmark och kostnadstabell gäller samma app-commit och återanvänds från helhetsanalysen. Här görs nya köavläsningar och en bredare praktisk UI-runda. Detta är inte en uppgift att bygga backloggens förslag.

## 1. Planens riktning är rimlig, men lägesbilden behöver förenklas

Rätt ordning är fortfarande release 6.0.0 → återstående 5.2 → senare innehåll och experiment. Den äldre skolplanens slutliga kvällsuppdatering säger uttryckligen att ingen klassrumspilot görs nu. Planens tidigare mål, byggtabeller och texter om kommande pilot får därför inte användas som dagens arbetsorder.

Turlänk, lärarfält, elev-/lärarblad, lektioner och elevuppdrag finns redan. Den återstående version-6-uppgiften är att visa att de fungerar tillsammans och att besluta om release, inte att bygga dem igen. En ny lägesruta högst upp i den operativa planen bör länka till slutliga beslut och dela upp **byggt**, **verifierat**, **kvar att rätta** och **väntar på beslut**. Bevara äldre plantext som historik.

Föreslagna mål för nästa arbete, med bevis:

| Mål | Mätbart färdigvillkor | Vad som inte räcker |
|---|---|---|
| En lärare kan använda paketet | Delad lektionslänk → åtkomlig utskrift → uppgift → läsbart källunderlag → återgång till samma steg | Att knappen eller faktatexten finns i DOM |
| Fri utforskning fungerar efter flera val | Samtidigt → Meny/Mer → jakt, Fokus → tur → utgång och språkbyte mitt i steg fungerar med pekning och tangentbord | Ett grönt prov från en ny tom flik |
| Nästa 5.2-del är levererbar | Ett intervall har tydlig avgränsning, komplett lista och förklarad karttid | Fler markörer utan begripligt urval |
| Innehållet blir mer balanserat | Täckning före/efter en liten källkontrollerad batch och åtkomligt underlag på avsett språk | Endast ett högre totalt antal poster |

Den nuvarande planen riskerar att belöna antal avslutade issues mer än färdiga användarvägar. Gör releaseflödet till grind för paketet, men låt ett avgränsat, oberoende förarbete fortsätta när det finns kapacitet.

## 2. Backloggens storlek och kvalitet

Ögonblicksbild 2026-11-08, två sidor av GitHubs öppna issues, PR:er borträknade. [Inventering per issue](2026-11-08-backlog-inventering.csv) bevarar nummer, titel, milstolpe, etiketter och om tilldelning finns. Etiketterna överlappar, så deras antal ska inte summeras till 160.

| Mått | Antal | Betydelse |
|---|---:|---|
| Öppna issues | 160 | Inkluderar samlingsärenden och framtidsidéer, inte 160 färdiga uppdrag |
| Namngivna milstolpar representerade | 21 | Fem issues saknar milstolpe |
| Språk: översättning | 43 | Största enskilda spåret; 26,9 % av hela kön |
| Paket: Temavyer och innehåll | 26 | En samling för framtida paket, inte en arbetskö för nästa release |
| Version 5.2 | 10 | Innehåller både byggdelar och beslut som inte är färdiga |
| Version 6 | 4 | #66, #250, #758, #862; två är övergripande samlingsärenden |
| `idé` / `data` | 78 / 79 | Idéer och datakrav kan finnas på samma issue |
| `redo` | 7 | Två teknikärenden och fem dataärenden |
| `beslut-krävs` / `behöver hjälp` | 12 / 3 | Olika sorters väntan ska inte förväxlas |

### Viktigaste statusglappen

| Ärende | Verifierat underlag | Rekommenderad köåtgärd, inte genomförd |
|---|---|---|
| #764 | Överlämningen väntar på #852. PR #852 är ihopslagen 2026-11-07. | Claude Code kontrollerar ägare och aktuella filkrockar och avgör om spärren kan tas bort. Etiketten är inte bevis för att mergeberoendet finns kvar. |
| #765 | Väntar både på #852 och på #764. | #852-delen är klar, men #764 återstår. Håll kvar den verkliga kedjan #764 → #765. |
| #864 | Texten säger efter #855; #855 är ihopslagen. `redo` saknas. | Förutsättningen är uppfylld, men kontroll av grenskydd och ett ledigt testfönster återstår innan start. |
| #645 | Tilldelat samlingsärende med kommentarer om #748 och namnbeslut. #748 är ihopslagen; fler omgångar återstår enligt dess PR. | Uppdatera nästa batch och kvarvarande faktiska beslut mot aktuell data. Att #748 är stängd betyder inte att hela #645 är färdigt. |
| #85 och #86 | `redo` och utan tilldelning i ögonblicksbilden, men kommentarerna innehåller tidigare anspråk och källförberedelse från Claude Code. | Behandla dem inte som fritt byte. Kontrollera ägarskapet enligt regeln om första anspråkskommentar innan nästa agent börjar. |
| #838 | Har `beslut-krävs` trots att senaste statuskommentaren säger att första nivån redan är beslutad och byggd, med 18 poster i data. | Skilj genomförd första nivå från framtida flik/quiz/fler poster. Etikettändring väntar uttryckligen på DasKrokodils besked. |
| #489 / #753 | #489:s äldre order säger prototyp och en tillfällig spärr från #530; #753 kräver först datumunderlag och klar Version 6. | Skriv en aktuell operativ order som pekar på #753 och slutlig omfattning. En gammal order om `codex: redo` får inte återaktivera arbete av sig själv. |
| #843 | Överlämningen beskriver en extern framtida remissgrind. | Detta är en uppföljning enligt kalender/dokument, inte ett kodfel som ska äta en arbetarplats nu. Inga nya datum bedöms eller verifieras i denna analys. |
| #299 | Titeln säger 437 bildlösa händelser; samma datacommit har 625. | Uppdatera sammanfattningen vid nästa ordinarie triage, med datum och mätmetod. Det är ett gammalt antal, inte 188 nya buggar. |

Fem ärenden utan milstolpe är #866, #865, #864, #838 och #699. Särskilt #865 och #864 behöver synas i samma operativa plan som release- och 5.2-kedjan. Övriga är beslut, samlingsarbete respektive verktygsunderhåll; de ska inte få samma brådska bara för att de saknar milstolpe.

### `redo` och faktisk startbarhet

- **Teknik:** #865 och #754 är märkta `redo`. Kontrollera anspråk precis före start. #754 har uttryckligt godkännande att inte invänta den inställda piloten.
- **Data:** #839, #803, #776, #85, #86. De hör till Claude Code enligt policyn. För #85/#86 finns tidigare anspråk; en tom Assignees-ruta räcker inte som kontroll.
- **Kapacitet:** vid avläsningen är fyra PR:er öppna på samma konto: #870, #871, #874 och #875. Repots fyragräns innebär att ingen ny implementation ska startas på kontot innan en plats finns. Det är därför denna fördjupning levereras som uppdatering av #875, inte en femte PR.

Förslag: färdiggranska de rena rapport-/policy-PR:erna och låt DasKrokodil avgöra dem, så att teknikarbete kan få plats utan att forcera den blockerade releasen. Rapportgodkännande är inte releasegodkännande. Ändra inte kapacitetsregeln för att dölja en kö som väntar på beslut.

## 3. Rekommenderad arbetsordning

| Ordning | Paket och ansvar | Grind och filrisk |
|---|---|---|
| 0 | Claude Code läser #871, #875 och språkkommentaren i #870; DasKrokodil avgör färdiggranskade dokument-PR:er | Skilj dokumentleverans från release. Ingen ändring av appen i denna analys. |
| 1 | Avgränsade releasehinder: lektionskort/faktaruta, lärarens utskriftsväg och menyövergången U1 nedan | Codex kan bygga uttryckliga UI-order; Claude Code Sonnet high bedömer besökarflödet. Käll-/språkfel hos Claude Code med rätt källnivå. CSS/panel/tur/test skrivs i ordning. |
| 2 | #865, adressens föråldrade async-svar | Codex efter ledig PR-plats och anspråkskontroll. År, kamera, tur, Fokus och Bakåt/Framåt provas före vidare URL-arbete. |
| 3 | #864, delning av sviten | Ett eget testfönster efter att UI-order som ändrar testfilen är ihopslagna. Bevara kontrolltäckning. Grenskydd lästes med verktyget men gav 403 ”Resource not accessible by integration”; obligatoriska kontrollnamn är fortfarande inte fastställda. |
| Oberoende | #754:s rena intervallurval; spec till #15; källförslag till #476/#845 | Förberedelse kan ske utan appkrock. Bygge kräver plats och korrekt order. Historisk epoklista måste godkännas; den behöver inte vänta på #396. |
| 4 | #755 → #756 | Hård byggkedja efter #754. #865 före #755 är en rekommenderad stabilitetsordning. #752:s befintliga mätning måste läsas med begränsningen att själva intervalläget inte var mätt. |
| 5 | #15 och därefter #579, samt godkända epokknappar | Plats får spec först; kurerade regionkort behöver källor, gränslicens och godkänd modell. Undvik samtidig redigering av panel, tidslinje och fem UI-filer. |
| Litet separat UI-paket | #786, förklaring av källkontroll kontra osäker datering | Inget hårt beroende på intervallet. Kan triageras tidigt efter releasefönstret, eftersom det hjälper källuppgiften. Samordna panel/CSS/UI-filer med F7-rättningen. |
| Parallellt, avgränsat | En språk- eller faktabatch med verifierat ägarskap | Claude Code. Gemensamma sources, översättningsregister och genererade filer gör två olika periodfiler mindre oberoende än de ser ut. |

Skillnaden mellan hårt beroende och arbetsordning måste stå på varje order. Exempel: #754 måste finnas före #755, medan #786 inte behöver vara blockerat av att #755 byggs senare. Ett filkrocksfönster kan lösas genom ordning utan att göras till ett permanent produktberoende.

### Så bör framtidsbackloggen hållas hanterbar

- **#846 och #850 är inte dubbletter.** Den första gäller tid/samtidighet ur fun facts, den andra myter ur missuppfattningar. Samordna gränssnitt och regler när besluten finns, men håll innehåll, källkrav och färdigvillkor separata.
- **#66, #250, #556 och #63 är samlingsärenden.** Visa nästa konkreta leverans under dem; deras öppna status är inte bevis för att allt under dem är ogjort.
- **Temamotor #398 och innehåll är skilda leveranser.** Ett temaläge behöver motorn. Vanliga källkontrollerade händelser i exempelvis vetenskap/hälsa kan däremot förbättra globen utan att vänta på en temamotor. Blockera inte nyttigt innehåll med ett onödigt arkitekturberoende.
- **Översikt #868 är ett produkt-/urvalsbeslut.** Ett förvalt urval på 100–150 händelser behöver källgrund, balans och tydlig möjlighet att se hela listan. Det är inte en allmän lösning på överlappande menyer.
- **Offline #486 är uttryckligen uppskjutet.** Bättre återhämtning från laddningsfel kan bedömas inom dagens arkitektur; inför inte en service worker som en rutinmässig UI-rättning.
- **Låt experiment vänta.** Nya klot, flöden, topplistor och flera nya quizlägen bör inte konkurrera med att befintliga berättelser faktiskt går att läsa och lämna.

## 4. Ny UI/UX-granskning

Praktiskt prov av lokal `dist/` för samma app-commit, Chromium med SwiftShader, 1400 × 900 och 400 × 800. three.js 0.160.0 routades till lokal kopia; Google Fonts blockerades. Skärmbilder av grundvy, mobilmeny, panel, Lager, Fokus och Källor granskades visuellt. Det är ingen användarstudie och inga webbtypsnitt, riktiga hjälpmedel eller fysisk mobil har provats.

### U1 – nytt verifierat fynd: Samtidigt täcker Mer/Meny

**Hög prioritet, bör rättas före releasebeslut.** En vanlig väg från utforskning till elevuppgift är blockerad, men det finns en omväg genom att stänga listan först. Det är ett annat fynd än #871 F7, även om båda berör överlappande ytor.

Återskapa utan särskild data eller testmanipulation:

1. Öppna `/?lang=sv#y=1889` i 1400 × 900 eller 400 × 800.
2. Öppna **Samtidigt**.
3. Öppna **Mer** på dator eller **Meny** på mobil.
4. Försök trycka **Samtidighetsjakten**.

Resultat: knappen finns, är aktiv och har normal storlek, men Samtidigt-panelen tar emot klicket. På dator rapporterar Playwright `panel-head ... intercepts pointer events`; på mobil träffas en händelsetitel i `#panel`. Ett vanligt klick får timeout. Från en ny sida utan öppen Samtidigt-panel startar samma knapp korrekt jakten och flyttar till 1500 i båda bredderna. Det är därför ett **övergångs-/lagerproblem**, inte en saknad uppdragsfil.

Kodstöd: både `.top-actions` och `.panel` har `z-index: 15`. Menyns eget högre värde ligger inne i sidhuvudets staplingskontext. Detta är stöd för orsaken; rättningen ska provas och hållas avgränsad, inte bara höja ett globalt z-index utan kontroll av andra paneler.

**Minsta färdigvillkor för en framtida rättning:** Samtidigt → meny → jakt fungerar med pekning i båda bredderna; prova även Källor, Hjälp och Quiz från samma övergång, Escape, återkomst av fokus och lektionsläget. Stäng antingen konkurrerande panel konsekvent eller ge den öppnade menyn rätt plats i staplingen. Ingen `force` i testet och ingen extra stängning som döljer den faktiska användarvägen.

### U2 – nytt verifierat fynd: filtertomhet beskrivs som att data saknas

**Medelprioritet, återhämtning och begriplighet.** På 1400 × 900: öppna Samtidigt år 1889 och slå av alla kategorier med knapparna i panelen. Då finns noll aktiva filter och noll rader. Rubriken säger **”Inget i datan inom ±11 år från 1889.”** Hjälptexten rekommenderar att dra i tidslinjen eller starta uppspelning för att hitta nästa händelse.

Det var filtervalet som dolde händelserna, inte brist på data kring året. Kodstödet är entydigt: händelselagret kräver `filters.has(e.category)` för varje post; med en tom mängd hjälper inget årshopp. `Panel.render()` använder ändå samma `panel.empty`/`panel.emptyHelp` som för ett genuint tomt år.

Förslag till framtida order: skilj minst **alla kategorier av**, **händelselagret av** och **inga träffar kring året**. För det första behövs en förklaring och en enkel väg att återställa kategorier. Lägg nya texter i alla fem UI-språk. Prova sedan återställningen och att ett verkligt tomt år fortfarande får korrekt vägledning. Ingen ny historisk data behövs. Samma filtertomhet och hjälptext har även reproducerats på 400 × 800.

### Det som fungerar i den bredare rundan

Det riktade repotestet provade bland annat följande i båda bredderna:

| Flöde | Observerat |
|---|---|
| Grundvy och hjälp | Globen laddar, hjälpen öppnas frivilligt, Escape och fokus fungerar |
| Mobilmeny | Vy och Utforska syns, menyknapp/tangentbord och stängning fungerar i dess isolerade prov |
| Samtidigt | Pågående och närliggande skiljs, långvariga poster kan fällas ut och Visa fler nås med tangentbord |
| Quiz | Tre svar, Enter, rättningsbesked med år/källor, nästa fråga och fokus tillbaka fungerar |
| En händelse | Faktarutan öppnas och markeringsanimationen provas |
| Lager | Sex förvalda vyer, tio lager; Anpassa själv och återöppning fungerar |
| Rikesfokus | Sök/grupper/räknare och fokus på ett rike fungerar |
| Platt karta | Öppning, synlig skillnad när rikeslagret växlas och återgång fungerar |
| Källor | Statusfilter, Tab från sökning, tomt resultat och ingen horisontell scroll i kontrollen |
| Sök och följ | Händelse träffar rätt år, alternativnamn hittar rike, nonsens ger tydligt tomt resultat och Escape stänger |

Detta gör inte hela rundan grön: samma svit får två röda kontroller för U1. Att isolerade menyprov är gröna samtidigt som en menykedja är röd är just skälet att prova kombinationer.

### Begriplighet och visuell hierarki

Behåll observatorietemat. Glob, mässingsaccent och pergamentkort ger en sammanhållen identitet. Mobilmenyn ger stora och tydligt grupperade val utan att alla funktioner behöver ligga i sidhuvudet. Samtidigt-listan anger både antal pågående och närliggande händelser, vilket är en styrka.

Tre hypoteser bör prövas med användare innan större omritning:

- **Vad betyder tiden i en översikt?** I rikesfokus på 1900 kan faktarutan innehålla sammanfattning av hela rikets historia och samtidighetskort från närliggande år. Det är inte ett verifierat faktafel. En kort signal ”historisk översikt” respektive ”inom ±N år” nära respektive text kan behövas för att inte alla texter ska läsas som läget exakt det valda året. Knyt till #786 och intervallens etiketter, inte en ny tidsmodell.
- **Kan en ny besökare hitta uppdraget?** Menyn fungerar isolerat, men valet mellan Turer, Ett år/en plats, Sök och följ och spel kräver olika förkunskaper. Prova tre uppgifter: hitta något samtidigt, följ en berättelse, välj lärarmaterial. Antal knappar är inte i sig bevis för överbelastning; #571 ska fortsätta vara en hypotes tills det finns användarbevis.
- **Vad gäller ett källfilter?** Källsidan visar källor och uppgifter i olika räknare. Det är korrekt att en källa kan förekomma i flera grupper. #786 bör skilja jämförda källor från säker datering; undvik att lägga en tredje snarlik statusindikator ovanpå dem.

## 5. Separat blind-spots-runda

Den självkritiska frågan i denna runda var: **vilka tester förutsätter redan att andra ytor är stängda?** U1 uppstod när Samtidigt-kontrollen lämnade listan öppen. Den filtrerade sviten ändrade ordningen så att jakten följde direkt efter. Det första felet kunde ha avfärdats som ett testberoende; det isolerade provet visade i stället en verklig pekningsblockering.

Ändra därför testmetoden: kombinera varje huvudmeny med minst en redan öppen panel, och mät vad som faktiskt tar emot klicket. En knapp som `isVisible()` accepterar kan fortfarande ligga bakom ett annat element. Behåll isolerade test för felsökning, men komplettera med de naturliga övergångarna.

Tidigare fynd #871 F1/F7/F10 är redan reproducerade i helhetsanalysen och får inte räknas som nya här. Laddningsbortfall, bildreserv, slutsteg, språkbyte och källutskrift från #871 gäller oförändrad appkod; de är återanvända bevis, inte samtliga nytestade i denna runda. Riktig skärmläsare och faktisk upplevelse av textens begriplighet återstår.

## 6. Testbevis och begränsningar

Riktat repotest, 2026-11-08:

```bash
THREE_LOCAL=<lokal three.js 0.160.0> SKARMBILDER=<tillfällig bildmapp> \
ENDAST='mobilmenyn|hjälpen öppnas|Samtidigt sorterar|Lager öppnas|Fokus öppnas och följer ett rike|Sök och följ hittar|Platt vy öppnas|Platt vy stängs|Om källorna|quizet ställer|Samtidighetsjakten räknar|en händelse öppnas|ett rike syns|bildlager' \
node tests/webblasare.mjs 8000
```

**Utfall: två fel på 184 sekunder**, båda jakten när Samtidigt är öppen, ett per bredd. Skriptet rapporterar 26 kontroller/avsnitt valda och 108 överhoppade; obligatoriska start-/konsolkontroller skrivs dessutom i resultatet. Konsolkontrollen är grön i båda bredderna. Ordvalet `bildlager` matchade inte kontrollnamnet ”nattljus syns från 2016”; det provet får inte räknas som kört av detta kommando. Zoom, reducerad rörelse och presentation skrevs ut som avsnittsrubriker men valdes inte av filtret; inga nya attesteringar av dem görs här.

Oberoende komplettering av U1: två bredder × två startlägen. Ren sida → jakt fungerar 2/2; öppen Samtidigt-panel → jakt blockeras 2/2. Pekningslogg och skärmbilder granskade, inga `pageerror` i kompletteringen. Inga app- eller testfiler rättades för att göra utfallet grönt.

Kompletterande datorprov: alla kategorier av ger noll rader och missvisande tomtext (U2). Direkt Fokus på Koreakriget, flytt till 1953 och huvudknappen visar ”När kriget är slut” och ett synligt pauskort. Ett eget pixelprov av nattljus i Platt vy gav därefter timeout efter 30 s och avbröt det skriptet före dess mobilvarv. Ingen säker rotorsak är fastställd och inget påstående om trasigt nattljus görs utifrån enbart detta prov; det är **inte godkänt**, och måttet ska inte döljas bakom tidigare grönt CI. Separat mobilprov slutfördes: samma filtertomhet och missvisande hjälptext, samt korrekt slutkort vid 1953 med synligt pauskort. Det första tillfälliga filterprovet hade ett instabilt locatorurval när listan ändrades; det rättades i granskningsskriptet, inga appfiler ändrades.

[Maskinläsbart provunderlag](2026-11-08-uiux-bevis.json) innehåller de egna övergångsprovens utfall och de uttryckliga begränsningarna. Skärmbilder granskades lokalt men ligger inte inbäddade i PR:n.

Tidigare gröna bygg-/Node-/översättningskontroller återanvänds för samma app-commit från helhetsanalysen. Firefox/WebKit-releasefelen är fortfarande olösta beviskrav, inga nya lokala körningar av dem har gjorts. Dev kräver inloggning enligt tidigare åtkomstprov. GitHub Projects-fält kan inte läsas med anslutna verktyg, så projektvyn är inte avstämd. Grenskyddets API gav uttryckligt 403, inte bevis för att skydd saknas.

## 7. Samarbete, budget och rekommendation till DasKrokodil

Återanvänd issuebudgetarna i helhetsanalysen för #754–#756, #865, #864 och språkpaketen; detta är samma planeringsunderlag, ingen ny mätning av modellförbrukning. Den nya U1 behöver en egen avgränsad order efter triage. Grov extra planeringsram: Codex förberedelse **2–4k token**, implementation och separat review **8–18k**, Claude Code Sonnet high granskning **3–6k**, plus cirka 25 % reserv. Osäkerheten är staplingssamspelet med andra paneler. Käll-/licensbedömning ingår inte eftersom ingen ny fakta behövs för en avgränsad menyfix.

Kögrooming av ovanstående statusglapp kan göras som en samlad förberedelse: uppskattat **3–6k Codex-token** och **4–8k Claude Code-token** för kontroll och beslut. Gör inte en full ny helhetsanalys per etikettändring. Faktisk förbrukning och veckokvot exponeras inte här och kan inte intygas.

För U2, om det blir ett avgränsat UI-issue: ungefär **1–2k** förberedelse, **5–10k** implementation/separat review och **2–4k** Claude Code-granskning, plus cirka 25 % reserv. Osäkerheten gäller samspelet mellan kategorier, taggvyer och avstängt händelselager. Det är en mindre rättning än ett nytt sök- eller översiktsläge.

**Förslag på beslut:**

1. **Ja till att färdigställa releasevägarna först**, inklusive nya U1, innan ytterligare spellägen/regionkort börjar byggas.
2. **Ja till en samlad kökontroll** av #764/#765, #864, #85/#86, #838 och #489/#753. Claude Code föreslår aktuella statusar; denna rapport ändrar inga etiketter eller ägare.
3. **Behåll #754 som liten självständig teknikleverans när en PR-plats finns**, och förbered Plats-spec/epoklista under tiden. Därefter #865 före större adressarbete, eget testfönster för #864 och sedan intervallkedjan.
4. **Bevara separata beslut för översiktsurval, epoker, regioninnehåll och nya quizfrågor.** Återanvänd komponenter, men låt inte en gemensam teknisk motor ersätta käll- och produktbesluten.

Claude Code triagerar rapporten tillsammans med #871 och den ursprungliga helhetsanalysen. DasKrokodil godkänner arbetsordning och release. Ingen rekommendation här är en order att starta arbete, ändra historiska uppgifter eller publicera.
