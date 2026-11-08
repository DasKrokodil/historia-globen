# Blind spots inför v6.0.0: lektionsläget

2026-11-08. Separat Codex-granskning för #862 punkt 3 och release-PR #870. Granskad kod: `87ed68e271038a3ff74eabb6baa15078b1f22406` (main och #870:s huvud vid kontrollen). Den vanliga UX-genomgången görs inte om här.

**Bedömning: synpunkter. Tio fynd: ett blockerar releasen (F7), åtta bör rättas (F1–F6, F9–F10), ett kan vänta (F8).** Claude Code triagerar; ingen kod har rättats i denna granskning.

Rapporten prövar antaganden och övergångar. **Provat** betyder observerat i lokal Chromium med Playwright; **kodläst** betyder att beteendet har härletts utan motsvarande praktiskt prov. Inga historiska uppgifter har lagts till eller rättats. Källdetektivens frågor har jämförts med de anteckningar som redan finns i datan; detta är ingen ny extern käll- eller översättningsgranskning.

Endast denna rapport ändras enligt uppdraget. `handoff.json` lämnas därför orörd trots repots normala överlämningsrutin. Kommentarerna i #870 och #862 är överlämningen till Claude Codes triage. Inga issues skapas.

## Frågorna som lätt missas

- **Vad tar vi för givet?** Att en delad länk fortfarande pekar på en laddningsbar lektion, att läraren hittar utskriften via samma länk som eleven och att det gamla Fokus-läget kan återställas utan att störa utgångens löfte.
- **Tomt, delvis tomt och blandat:** saknad turfil är något annat än en vanlig vy; en källrubrik med tekniska id:n är något annat än användbara källor. Avsaknad av bild är däremot normalt för datan.
- **Ser reserven ut som ett fel?** Tysta återfall till den fria globen och tekniska käll-id:n behöver förklaras för besökaren.
- **Urval eller full lista?** Turens steg är ett pedagogiskt urval, inte hela periodens händelser. Samtidigt-listan och dess grupper kan dessutom visa närliggande händelser. De två urvalen behöver förstås var för sig.
- **Övergångarna:** sista steget, språkbyte, en ny länk i en redan använd flik och återgång från lektion är egna tillstånd. Ett grönt startprov bevisar inte dessa.

## Fynd

### F1. Lektionslänken ger ingen väg till elev- och lärarbladen

**Allvar: bör rättas. Provat (400 px) och kodläst.**

Öppna `/#t=andra-varldskriget&m=lektion` eller vikingalektionen. Turen har lärarfält och en utskriftsknapp i DOM, men `.app.lesson #tour-print` har `display: none !important` i `css/style.css`. "Visa hela globen" avslutar dessutom turen, så knappen kommer inte fram genom att bara lämna läget. Läraren måste själv hitta turen på nytt via Turer i den fria vyn. Det antas att läraren redan vet att samma tur finns i två olika lägen.

**Förslag:** erbjud utskrift i lektionsläget, eller en tydlig lärarväg till samma blad utan att först avsluta och leta upp turen igen. Prova därefter hela lärarflödet från den delade länken enligt #862 punkt 5, inte enbart `#t=...` utan `m=lektion` som utskriftstestet gör.

### F2. Felaktig lektionslänk byts tyst mot en annan upplevelse

**Allvar: bör rättas. Provat för okänt id och tur utan lärarfält; provat med HTTP 503 för turfilen vid en full sidladdning.**

Öppna `/#t=finns-inte&m=lektion`: den vanliga globen visas, utan meddelande att lektionen saknas. Öppna `/#t=tre-platser-1325&m=lektion`: en vanlig tur startar, utan lektionsband eller lås. En lärare kan därför tro att ett låst läge har delats fast det inte blev så.

**Kodstöd:** `LessonMode.canStart`, `createAddress.applyTour` och `loadTours` i `js/ui/tour.js`. Vid 503 för `data/turer/andra-varldskriget.json` visades den fria globen vid 1325 utan lektionsband. En turfil som inte kan hämtas hoppas över; adresshanteringen använder sedan den vanliga vyn. Den snälla reservlösningen ser inte ut som ett laddningsfel och erbjuder ingen återhämtning.

**Förslag:** skilj på okänt id, vanlig tur och tillfälligt hämtfel. Visa en kort förklaring och återförsök vid hämtfel. Låt besökaren uttryckligen välja att gå till hela globen.

### F3. Sista steget saknar de tidigare stegens uppläsningssignal

**Allvar: bör rättas. Provat med DOM och tangentbordsfokus; faktisk skärmläsaruppläsning inte provad.**

Öppna andra världskrigets lektionslänk på 400 px och gå till steg 14 via Nästa. Slutkortet står kvar, Nästa döljs och fokus flyttas till `#tour-back` (Föregående). `#screen-reader-status` blir tom. På steg 1–13 innehöll samma status stegets nummer och innehåll. Kortet självt är ingen live-region, och i mobil öppnas inte faktarutan automatiskt.

**Kodstöd:** `TourPlayer.go()` bygger texten `say`, men vid `this.last` anropar den bara `timeline.pause()` utan text. Därmed töms statusraden.

**Förslag:** annonsera även sista steget och att lektionen är slut, eller flytta fokus till slutkortets rubrik på ett konsekvent sätt. Verifiera med riktig skärmläsare att både sluttexten och utgången blir begripliga, även vid direktlänk till sista steget.

### F4. Utskrift vid källbortfall ser färdig ut men saknar användbara hänvisningar

**Allvar: bör rättas. Provat med simulerat HTTP 503 för `data/sources.json`.**

På en mobil lektionssida för vikingatiden, innan faktarutan har öppnats: låt hämtningen av källregistret ge 503. Anropa sidans `printLesson` för turen med utskriftsdialogen ersatt av en tom funktion. Bladen skapas ändå. Under Källor står exempelvis `wp-diamond-sutra`, `whe-chinese-diamond-sutra` och `skolverket-lgr22-historia`, utan källtitlar eller adresser. Felet simulerades i webbläsaren, inga datafiler ändrades. API-anropet behövs för provet eftersom F1 döljer knappen i lektionsläget.

**Kodstöd:** `printLesson()` fångar hämtfelet och fortsätter med ett tomt källregister; `sourceItem()` skriver id som reserv. Detta kan bli bestående på papper och är särskilt illa i ett uppdrag om att undersöka källor.

**Förslag:** visa att källorna inte gick att ladda och erbjud nytt försök före utskrift. Om ofullständiga blad ändå får skrivas ut måste begränsningen stå tydligt på bladen. Skilj ett verkligt tomt källurval från ett misslyckat nätanrop.

### F5. Källdetektivens översatta frågor kräver delvis engelskt underlag

**Allvar: bör rättas. Kod- och dataläst; språkförståelsen hos elever har inte provats.**

Öppna andra världskrigets tur med `?lang=de`, `?lang=es` eller `?lang=fr`, läs Källdetektivens utskrivna frågor och öppna faktarutorna i steg `storbritannien` och `stalingrad`. Frågorna finns på alla fem språk, men de extra anteckningarna som frågorna hänvisar till har bara `sv` och `en` i händelsedatan. `t()` väljer därför engelska för dessa tre språk. Eleven förväntas kunna läsa ett annat språk för att lösa uppgiften. Det generella reservspråket är beslutat, men konsekvensen för just skoluppgiften är lätt att missa när utskriften granskas separat.

**Förslag:** prioritera översättning av just de två anteckningarna tillsammans med uppgiftens frågor, eller visa tydligt vilket språk underlaget har innan läraren delar ut bladen. Ändra inga sakuppgifter utan kontroll mot de befintliga källorna. Detta är en avgränsad beroendelucka, ingen full översättningsgranskning.

### F6. "Visa hela globen" kan återställa ett gammalt Fokus och byta år

**Allvar: bör rättas. Provat i 400 px och kodläst.**

1. Öppna `/?lang=sv#y=1916&f=war:forsta-varldskriget` och vänta tills Fokus visas.
2. Ändra adressens hash i samma flik till `#t=andra-varldskriget&m=lektion`.
3. Lektionen börjar korrekt 1939 med Fokus dolt. Tryck "Visa hela globen".
4. Lektionen avslutas, men det tidigare Fokus-läget återkommer och året blir **1914**, inte 1939. Utgången ger alltså inte den vanliga fria sidan med bibehållet år som bandet och beslutet lovar.

**Kodstöd:** `LessonMode.exitToGlobe()` anropar `tour.end()`, som återstartar `saved.focus`. `startFocus()` flyttar året till fokusets början när lektionsåret ligger utanför dess intervall.

**Förslag:** låt lektionsutgången uttryckligen gå till fri glob med det aktuella lektionsåret. Återställning av tidigare Fokus passar den vanliga turens Avsluta, men behöver hanteras separat här. Prova även med ett gammalt rikesfokus som laddar långsamt.

### F7. Faktarutan öppnas bakom lektionskortet på mobil

**Allvar: blockerar releasen. Provat i 400 × 800, med skärmbild och verkligt klickförsök.**

1. Öppna `/?lang=sv#t=andra-varldskriget&m=lektion&s=storbritannien` på 400 × 800.
2. Tryck "Läs om händelsen" för Källdetektivens första händelse.
3. Faktarutan öppnas i `data-sheet="half"`, men ligger bakom turkortet. Kortet täcker rubrik, handtag och stängknapp och nästan hela läsytan. Bara en smal del av underlaget sticker fram nedanför. Klick på faktarutans stängknapp misslyckas eftersom turkortets text tar emot klicket.

Mätning: faktarutan låg vid x=16, y=292 med bredd 368 och höjd 338. `elementFromPoint()` mitt på dess stängknapp träffade `#tour-text`, inte knappen. Samma överlapp bekräftades för `stalingrad` och `d-dagen`. Skärmbilden för Storbritannien visar att underlaget ligger bakom kortet, inte bara att testet väntade fel.

**Kodstöd:** turkortet har `z-index: 14`; det vanliga halva arket läggs under det. Först arkets fulla läge får `z-index: 16`. Att fokusera handtaget via Playwright och trycka Enter kan expandera arket, men en sådan omväg gör inte den övertäckta pekytan användbar på mobil.

**Varför blockerande:** #862 punkt 5 kräver att källuppdraget fungerar även i mobilbredd. Det underlag frågorna kräver är här övertäckt vid den avsedda öppningen. Detta är en kärnväg i den nya skolreleasen.

**Förslag:** låt "Läs om händelsen" öppna ett åtkomligt ark ovanpå eller i stället för turkortet, med tydlig återgång till samma steg. Verifiera med pekning på 400 px att handtag, hela anteckningen och Stäng går att använda. Prova samma övergång med och utan bild; kontrollera även tangentbordsfokus efter stängning.

### F8. En misslyckad bildhämtning lämnar en normal bildyta och bildtext

**Allvar: kan vänta. Provat med simulerat HTTP 404.**

Öppna lektionssteget `stalingrad`, tryck "Läs om händelsen" och expandera faktarutan med handtaget (tangentbord användes för att komma förbi F7). Låt `images/events/slaget-vid-stalingrad.webp` svara 404. Bildens `naturalWidth` blir 0, medan bildytan och den normala bildtexten/krediten står kvar; figuren mätte cirka 284 px på höjden i provet. Det ser ut som en trasig bild, till skillnad från en händelse som helt saknar `image` och inte får någon figur.

**Kodstöd:** `figure()` i `js/ui/panel.js` skapar en vanlig `img` med fast proportion och bildtext, utan särskild felpresentation vid misslyckad hämtning.

**Förslag:** visa en kort "Bilden kunde inte laddas" och håll faktatexten lätt att nå; erbjud vid behov nytt försök. Låt inte nätfel likställas med att datan saknar bild.

### F9. Ett språkbyte före adressens uppdatering tappar senaste steget

**Allvar: bör rättas. Provat som ett skriptat gränsfall i webbläsaren, inte uppmätt vid manuellt språkval.**

Öppna första steget i andra världskrigets lektion på svenska och vänta tills adressen innehåller `s=polen`. Aktivera Nästa och byt språk till engelska innan adressens fördröjda skrivning hinner gå. I provet gjordes detta i samma JavaScript-körning:

```js
document.querySelector('#tour-next').click();
const select = document.querySelector('#lang-select');
select.value = 'en';
select.dispatchEvent(new Event('change'));
```

Efter full omladdning och synligt turkort står sidan på **Step 1 of 14**, `s=polen`, trots att Nästa hade flyttat turen till steg 2. Ett vanligt språkbyte efter att adressen hunnit uppdateras behöll däremot steg 2 och lektionsläget i det tidigare provet.

**Kodstöd:** adressen skrivs genom polling (`POLL_MS = 700` och stabilitetsväntan i `createAddress.write()`), medan språkväljaren laddar om direkt och bara sparar året. Vid återstart går turens gamla `s` före det sparade året.

**Förslag:** skriv aktuellt tur-id, steg och läge synkront före språkbytet/omladdningen, eller ge språkbytet en väg att hämta den aktuella länken. Testa precis runt stegbyten; att vänta på rätt hash före varje omladdning döljer detta fel.

### F10. Reglagets tillgängliga intervall följer inte lektionslåset

**Allvar: bör rättas. Provat genom DOM och tangentbord; inte med verklig skärmläsare.**

Öppna vikingalektionen. Home och End ger korrekt 793 respektive 1068. Samtidigt anger `#track[role="slider"]` `aria-valuemin="-2999"` och `aria-valuemax="2026"`, alltså hela globens intervall. Det tillgängliga reglaget beskriver ett annat spann än det användaren kan välja.

**Förslag:** uppdatera ARIA-gränserna när tidslinjen låses och återställ dem vid utgången. Kontrollera med skärmläsare att aktuellt år, gränser och varför reglaget stannar förmedlas konsekvent.

## Testunderlag och avgränsningar

Byggt med `bash scripts/build-site.sh`: **ok**, 721 filer, 59 JS-moduler och 76 ikoner. Server: `python3 -m http.server 8000 --directory dist`.

Chromium använder SwiftShader (mjukvarurendering). three.js 0.160.0 routas till en lokal kopia enligt `docs/DEPLOYMENT.md`; Google Fonts blockeras. Detta provar inte nätåtkomst till jsDelivr på en verklig skoldator.

### Datans blandade lägen (kod- och dataläsning)

Andra världskrigets 14 steg öppnar 14 olika händelser; endast en har bild (Stalingrad). Vikingaturens 9 steg öppnar 8 händelser; två har bilder (Lindisfarne och Newfoundland), och Island-steget öppnar ingen faktaruta. Det är alltså normalt att samma knappar och kort ibland saknar bild eller "Läs om händelsen". `figure()` i `js/ui/panel.js` returnerar tom text när `image` saknas; ingen tom bildram skapas för en händelse utan bild. Ett angivet bildfält vars fil inte kan laddas är ett annat fall, se kompletterande prov nedan.

De två turerna använder 22 respektive 18 unika käll-id:n i stegen; alla finns i det lokala källregistret. Ingen saknad referens i dessa steg hittades. Detta bevisar registerkoppling, inte att källornas historiska uppgifter stämmer eller att externa länkar är nåbara.

Turernas urval ska inte läsas som kompletta listor: datan innehåller 21 respektive 39 synliga händelser vars intervall överlappar lektionslåset (start ≤ låsets slut och slut ≥ låsets början). Detta är ett enkelt intervallmått, inte antalet markörer som visas i en viss vy. `Panel.render()` skiljer händelser i året från närliggande, och grupper med fler än fem har en knapp för resten. Ingen ny fullständighetsgaranti bör knytas till turens stegantal.

Quizets tomläge hanteras i `Quiz.ask()` med `quiz.empty`, tömd svarslista och fokus på Stäng; `ready` döljer startknappen om inga frågor kan byggas. Detta tomläge är kodläst, inte provat med manipulerad frågedata. Samtidighetsjaktens saknade uppdragsfil ger en tom lista i `loadMissions()`; detta fel har inte simulerats. Att en knapp försvinner kan dölja skillnaden mellan "inte tillgängligt" och "kunde inte laddas".

### Slutkortets tomma uppdragsdel (avsiktlig begränsning)

Provat i andra världskrigets slutkort och kodläst för båda: inga uppdragslänkar visas. Den enda jakten gäller 1500 och ligger utanför båda låsen; quizet väljer globalt och Källdetektiven finns på papper. Detta är uttryckligen uppskjutet i `docs/beslut/2026-11-07-lektionslage.md`, därför räknas det inte som ett nytt funktionsfel. Förslaget är att förklara på slutkortet vad läraren kan göra härnäst; en tom uppdragsdel behöver inte se ofärdig ut om nästa steg framgår. Källdetektiven finns bara i andra världskrigets data, inte i vikingalektionen.

### Genomförda webbläsarprov

Kört enligt lokalanvisningen:

```bash
NODE_PATH=/tmp/pw/node_modules \
THREE_LOCAL=/tmp/pw/node_modules/three/build/three.module.js \
ENDAST='lektionsläget|lektionstur|bladen|quiz|jakten|turlänk' \
node tests/webblasare.mjs 8000
```

**Grönt på 315 sekunder.** Skriptet rapporterar 7 kontroller/avsnitt körda och 127 överhoppade. Båda bredderna (1400 × 900 och 400 × 800) klarade lektionsprovet, jakt, quiz och konsolkontrollen; utskriftsprovet körs av skriptet i datorgrenen. Urvalsorden `bladen` och `turlänk` träffade inte de separata A4- respektive turlänkskontrollernas namn. De ska inte räknas som körda. A4 och direkta steg-länkar kompletterades därför separat nedan. Hela sviten har inte körts om: uppdraget gäller blind-spots-rundan och ändrar bara dokumentation.

| Scenario | Vad som faktiskt provats och utfall |
|---|---|
| Delad länk, omladdning, Bakåt/Framåt | Standardtestets lektionsflöde grönt i båda bredderna, inklusive återkomst till lektionsläget och rätt steg. |
| Länk i redan använd flik | Standardtestet provar befintligt Fokus och långsam fokusladdning samt pågående jakt utanför låset. Komplettering: annan tur → vikingalektionen gav steg 1 av 9 vid 793. Utgång efter gammalt Fokus gav F6. |
| År och lager | Standardtestet avvisar år/datum utanför 1939–1945 och tillåter datum inom låset. Separat Home/End i vikingalektionen gav 793/1068. ARIA beskriver fel spann, F10. |
| Språk mitt i lektion | Svenska → engelska efter stegbyte behöll steg 2 när adressen hunnit med. Synkront steg- och språkbyte tappade steget, F9. Övriga språk provades för utskrift, inte alla tänkbara språkbyten. |
| Slutkort och paus | Andra världskriget kördes från första till sista steget med mjukvarurendering; slutkortet står kvar. Ingen uppdragslänk i intervallet (beslutad begränsning). Uppläsningssignalen försvinner, F3. |
| Tangentbord | Standardtest: Tab når utgången; quiz besvaras med Enter, Nästa fråga och Escape återställer fokus. Komplettering: Home/End, fokus på Föregående vid slutkort och Enter för att expandera faktarutan. |
| Saknad tur och blandat bildläge | Okänt id, vanlig tur med `m=lektion`, 503 för lektionsfil, 503 för källregister och 404 för en angiven bildfil. Steg med bild och utan bild öppnades; mobilens överlapp är F7. |
| Källdetektiven | Båda aktuella faktarutornas extra anteckningar och källänkar fanns i DOM på svenska. Frågornas hänvisningar motsvarar dessa anteckningar. Pekvägen blockeras av F7. Anteckningarnas språk saknas delvis, F5. Ingen ny historisk källkontroll genomförd. |
| Utan grafikkort | Chromium/SwiftShader klarade hela lektionsflödet och riktade tester. Ett separat prov med WebGL helt avstängt gav "Globen kunde inte starta: Error creating WebGL context." Ingen platt reservlektion startade. Mjukvaru-WebGL och helt saknat WebGL är alltså olika förutsättningar; en fysisk skoldator har inte provats. |

### Utskrift på alla fem språk

Separat öppnades båda turerna i vanligt turläge (`#t=<id>`, eftersom lektionsläget döljer knappen). Den riktiga utskriftsknappen användes, med `window.print` ersatt för att slippa systemdialogen. Print-media, 680 px bredd och DejaVu Sans som uttryckligt reservtypsnitt. Höjder i CSS-pixlar, ordning elevblad / Källdetektiven / lärarblad:

| Språk | Andra världskriget | Vikingatiden |
|---|---|---|
| sv | 982 / 852 / 926 | 872 / 798 |
| en | 1021 / 852 / 966 | 872 / 837 |
| de | 1021 / 891 / 1037 | 872 / 896 |
| es | 1021 / 891 / 966 | 872 / 837 |
| fr | 1021 / 891 / 1005 | 892 / 856 |

Alla tio kombinationer låg under skriptets A4-gräns 1039 px. Andra världskriget hade tre blad och fem lektionsfrågor; vikingatiden två blad och fyra frågor. Det tyska lärarbladet för andra världskriget har mycket liten marginal (1037 px). Rubrikernas bladnamn följde valt språk, men delar av andra världskrigets innehåll, inklusive turens titel, använder engelsk reserv på de/es/fr. Layoutmåtten bevisar inte en fullständig översättning.

### Inte kontrollerat och nästa kontroll

- Ingen riktig skärmläsare (NVDA, VoiceOver eller motsvarande). ARIA, live-region och DOM-fokus har kontrollerats, inte vad en viss skärmläsare faktiskt säger.
- Inga webbtypsnitt i dessa prov, ingen fysisk skrivare, ingen fullständig visuell kontroll av varje utskriven sida eller taggad PDF i ett hjälpmedel. Standardtestets svenska PDF-kontroll gick igenom; de tio kompletterande kombinationerna är HTML-mått i print-media.
- Ingen fysisk mobil/skoldator, ingen verifiering av skolnät, ingen Firefox/WebKit eller full prestandamätning. Inga uppmätta slutsatser om äldre datorers svarstider.
- Ingen inloggad dev/Cloudflare-kontroll eller produktionspublicering. Ingen bred täckningsrunda, benchmark, roadmap eller ny vanlig UX-genomgång; detta är den uttryckligen beställda separata blind-spots-rapporten.
- F7 bör rättas och återprovas före releasebeslutet. Föreslagen ordning för Claude Codes triage därefter: F6 (utgång), F1/F4/F5 (lärar- och källflödet), F2/F9 (länkar och återhämtning), F3/F10 (hjälpmedel), F8 (bildfel). Skapa inga nya fakta för att lösa gränssnittsproblemen.

Testmetoden framöver bör alltid kombinera **öppna → läsa → stänga → fortsätta**, i samma mobilvy och med riktig pekning. Att bara kontrollera att faktatext finns i DOM missar F7. Prova även **byt steg → byt språk direkt**, i stället för att alltid vänta in den uppdaterade adressen. Det är förändringarna i metoden som gör att nästa granskning kan fånga dessa fel.
