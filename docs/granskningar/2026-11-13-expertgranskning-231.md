# Expertgranskning av #231: tidslinjebläddraren (2026-11-13)

Granskning av [#231](https://github.com/DasKrokodil/historia-globen/issues/231) ("Tidslinjebläddraren: följ en person eller resa och hoppa mellan tidslinjer där de korsas"), ett beslutsissue utan kod. DasKrokodil bad om en expertgranskning som första deluppgift (kommentar 2026-11-12). Granskare: `historiker`, `geograf`, `arkitekt`, `ux-tillganglighet` och `larare`. Språkexperterna kallades inte in, eftersom ingen text finns än. Experterna ändrade inga filer. Rapporten är underlag till DasKrokodil, inget beslut. Ingen webbläsare kördes. Allt som är läst i kod eller data är märkt så, resten är bedömning.

## Slutsats

1. **Issuets exempel finns inte i datan.** Det finns ingen Ibn Battuta-resa i `data/routes/` (issuet hänvisar till #42). Han finns som en punkthändelse (`ibn-battuta-resa`, 1325-06-14, Tanger) och i löptext i `kryddvagarna.json`. "Ibn Battuta i Kairo 1326" finns varken som händelse eller som stopp. Mansa Musa i Kairo juli 1324 finns (händelsen `mansa-musa-kairo` och turen `tre-platser-1325`).
2. **Det saknas stoppdata, inte kod.** Av 328 platser på resorna (voyage) har 104 datum och bara 9 `stop: true`, på två resor (Columbus resa 1: 6, Zheng He resa 1: 3). 16 av 18 resor har inga stopp, så det finns inget att trycka Nästa på. (Handelsvägarna har ytterligare 109 platser, 0 med datum; alla 437 platser i `data/routes/` är alltså 328 + 109.)
3. **Korsningar mellan resor ger noll med dagens data.** Resorna överlappar aldrig i tid (luckan mellan Zheng He 1433 och Columbus 1492, och så vidare). Den enda kombination som ger många träffar är resa mot rike (28–33 par), och resa mot händelse ger 10–19 par, varav kanske 3–5 är nya för besökaren.
4. **Korsningarna kräver inte #1311** i sin helhet, bara själva tidsregeln (arkitekten). Beroendet på #1327 gäller bara om en ny fokustyp `person` införs.
5. **Idén är värd att pröva i en smal form**: ett litet tillägg till resefokuset, inte ett eget läge, ingen "bläddrare" som ord i gränssnittet, och ingen fri hoppning i klassrummet.
6. **Experterna är oeniga om tidpunkten**, se "Konflikter".

## Fynd per expert

### Historiker (källor lästes via Wikipedia, sekundärkälla; Rihla, Wikidata och Cliopatria öppnades inte)

- **Exemplet är grovt:** Mansa Musa var i Kairo 19 juli–18 oktober 1324, Ibn Battuta kom dit troligen våren 1326 (månad okänd). Det är cirka 1,5 år, inte "två", och de möttes aldrig.
- **Källorna är osäkra på tre punkter:** Ibn Battutas kronologi (kan ha lämnat Mecka efter hajj 1328), Anatolien (Rihlas ordning är rörig) och Sanaa (besöket tveksamt). `kryddvagarna.json` säger redan "1330 eller 1332" öppet.
- **Turen `tre-platser-1325` har en möjlig kopieringsrest:** steget Tenochtitlan har `wp-ibn-battuta` bland källorna. Ej kontrollerat, bör ses över. Tenochtitlan ("omkring 1325") mot Tanger 1325 är dessutom ett exempel på en falsk korsning: samtidigt men cirka 10 000 km isär.
- **En Ibn Battuta-resa skulle kräva** `edtf` med `~` eller spann i stället för exakta datum, att omstridda besök utelämnas eller märks, `note` "Källorna skiljer sig" om 1328, och nivån `source-checked` (ingen andra oberoende källa är öppnad).
- **Vad som får korsas:** bara `voyage` med daterade stopp och punkthändelser med precision 9–11. Aldrig `trade` (spann på hundratals år), aldrig stopp utan datum. Decimalår (1405,7) ger skenexakthet; jämför i hela år eller den grövsta precisionen. Händelser med `locationPrecision` region eller country räknas inte som "nära" i km.
- **Förslag:** en kuraterad lista (`crossesWith`) i stället för ren beräkning tills regeln har stått sig. Det är ett förslag, inget källpolicykrav.
- **Balans:** alla resor är europeiska utom Zheng He. Kandidater som öppnades: Xuanzang (start 627 eller 629, oense), Zhang Qian, Marco Polo (omstridda besök), Mansa Musa (bara Kairo daterat). Ingen har mer än 1–2 öppet daterade stopp. Oceanien passar bättre som bosättningsvågor än som "följ en person". För Amerika före 1492 och Sydasien utöver Xuanzang öppnades ingen källa; rapporten är tom där, inte "ingen finns".

### Geograf (mätt med eget skript i scratchpad, repot oförändrat)

- **Mått:** storcirkelavstånd (haversine), mät mot stopp och mot tätad path (20 km). Datumgränsen och polerna är inget problem för avståndet. 300 km (som "Vad hände här?") är för grovt för resor. Förslag: 150 km, 50 km där båda sidor har exakt plats. Ingen skillnad mellan hav och land i första versionen.
- **Siffror (antaganden: stopp utan datum ärver etappens spann, egna händelser bortfiltrerade):**
  - Resa mot resa: 0 träffar vid 50/150/300 km och samma år, ±2 och ±10 år.
  - Resa mot händelse (par, varav exakt plats): samma år 9 (8) / 10 (9) / 12 (11); ±2 år 11 (8) / 12 (9) / 14 (11); ±10 år 15 (11) / 16 (12) / 19 (14), vid 50/150/300 km.
  - Resa mot rike (punkt i polygon, utan buffert): 28 par samma år, 29 vid ±2, 33 vid ±10. Risk: ett hamnstopp ligger i en imperiepolygon som i verkligheten bara var en handelsstation (Cliopatria öppnades inte).
  - Resa mot handelsväg: 23–24 par, men handelsvägarna har århundradeslånga spann, så "samtidigt" betyder inget.
- **Brus:** många träffar är resans egen plats (Cook 3 och slaget vid Mokuʻōhai, Zheng He och Malackasultanatet) eller hemhamnen. Filtret på resans egen händelse och `partOf` är nödvändigt. Tenmei-svälten (region, 225 km) är en artefakt av en mittpunkt.
- **Grovhet:** 129 av 134 etapper är `uncertain`. 35 % av händelserna (331 av 939) har ungefärlig plats (288 region, 43 country), alla som `Point`, så en landhändelse blir en mittpunkt som kan ligga hundratals km fel.
- **Namn:** historiska och nutida namn blandas (Calicut, Batavia, Ceylon, Van Diemens land). Osäkra platser står som text i namnet ("Guanahaní (troligen San Salvador)"), och några platsnamn är hela meningar, så "du är nu i X" kräver ett separat kortnamn. Anakronismrisk om rikets namn tas från nutida gränser.
- **Balans:** ingen resa 1–800, 1000–1405, 1433–1492 eller efter 1780; nästan inga punkter söder om Sahara, i Mellanöstern eller Sibirien. Kandidater att undersöka (ej inlagda, källor ej öppnade): Ibn Battuta, Marco Polo, Xuanzang, Faxian, Hanno, Vasco da Gama, Bering, polynesiska bosättningar.

### Arkitekt (läst i kod, inga tester körda)

- **Bygg på fokusläget med typen `route`.** Grenen finns (`focus.js:86–95`), stoppkön finns (`playback.js`, `routeStops()` i `lines.js:46–57`) och `FOCUS_TYPES` i `state.js` har redan `route`. En korsning är ett byte av fokus, och `startFocus` avslutar redan det gamla. Turformatet passar inte som bärare: stegen är handskrivna berättelse, och att generera dem ur resor vore ett tredje format (mot regeln i #1327).
- **Fokus filtrerar bort handelsvägar** (`focus.js:87` kräver `kind === 'voyage'`), och en länk till en `trade`-väg ger `focusError` i dag.
- **Korsningarna beräknas vid körning** när fokus på en resa börjar, inget incheckat. Kostnaden är under en halv miljon avståndsberäkningar (bedömning, ej mätt), `eventsNear` i `place-search.js` gör redan något liknande. En förberäknad fil i `data/genererat/` skulle bli inaktuell vid varje ändring och ge ombaseringskrockar. Översättningsspärren berörs inte, eftersom bara id:n och avstånd finns.
- **Väg tillbaka:** återanvänd inte `jump-back.js` (engångsrad på 20 s, sparar bara år och kamera). Webbläsarhistoriken räcker: `address.js` skriver redan ett historiesteg vid fokusbyte, och `f=route:<id>` med stoppet som `y=` ger delbara länkar utan nytt fält.
- **Tidslås och lägen:** `MODE_RULES` stoppar fokus i lektion och avslutar turen i tur. Fokus utesluter tidsintervall (#755). Ingen ny regel behövs.
- **Data:** `legs`/`places` räcker som stopp, det som saknas är täckning. Schemat har redan `stop: boolean`. Inget personobjekt behövs i första steget.
- **Förslag i tre steg:** A) källbelagda `stop: true` på fler resor (data, Opus, ingen kodkrock); B) Föregående/Nästa stopp i resefokuset (Sonnet high, efter #1161 och #1163 som krockar i `panel.js` och `state.js`); C) korsningar, efter #1327 och #1311.
- **Beslutsfil krävs** för "följ en tidslinje är ett fokus på en resa, inte ett läge och inte en tur" och för korsningsregeln. Nya kontrollnamn i `tests/webblasare.mjs` måste matcha ett mönster i `tests/jobb.json`.

### UX och tillgänglighet (läst i kod och CSS, inget mätt)

- **Ingen ny yta och inget eget läge.** Fokus-menyns Resor-grupp och fokusfältet med pausraden finns redan. Resefokus har redan "nästa stopp" som Fortsätt/uppspelning, men saknar Föregående. Använd inte Samtidigt-kortet: UX-syntesen räknar redan sex betydelser av "samtidigt".
- **Visa högst tre korsningar**, närmast i tid först, som länkrader: "Mansa Musa · Kairo · 1324 · 2 år före". Ingen rad alls om inget korsar, och ingen text "Inga korsningar".
- **Förklara varje korsning** med siffror ur datan ("inom X km och Y år"). Skriv aldrig "möttes", "träffade" eller "korsade varandras väg". Datum med "cirka". Ingen korsning på handelsvägar, resor med `locationPrecision: region` eller stopp utan egen källa.
- **Inget spår av följda tidslinjer.** Det finns redan fem sorters "tillbaka" (webbläsarens Bakåt/Framåt, jump-back, "Tillbaka till år X", "Tillbaka till hela tiden", turens Föregående). Använd Bakåt/Framåt via adressen. Risk (läst): `startFocus` återställer inte det gamla, så ett hopp mellan resor tappar utgången "till förra resan".
- **Ordval:** "följ", "resa", "stopp", "Samtidigt här". Inte "tidslinje" (betyder reglaget), inte "bläddrare", inte en egen sort "person".
- **Mobil och tangentbord:** nya knappar ska följa jump-back-mönstret (min 44 px), inte chip-mönstret (7 px padding, troligen under 44 px; ej mätt). Esc har ingen regel för resa i `focus.js` och måste utökas. Fokus ska stanna på knappen vid stoppbyte. Skärmläsartext: "Stopp 3 av 6. Kairo, 1326. …". Respektera Lugn rörelse. `prefers-reduced-motion` är inte verifierat.
- **Tomma lägen:** resa utan daterade stopp (16 av 18): dölj Nästa. Korsning dold av filter: säg det eller utelämna den. Ingen korsningsrad i tur och lektion (#1322).
- **Behovet är ett antagande:** vad som saknas i dag är ett målstyrt hopp från ett stopp till något samtida på samma plats. UX vill ha en mätning (hur många av de 9 stoppen får en korsning) och 2–3 observationer före bygget. Funktionen ökar antalet sätt att "gå vidare", så den bör ersätta något.
- Mikrotextförslag finns i UX-experternas svar; de ska granskas på alla fem språk innan de används. M-nummer mot `01-vision-och-mal.md` är inte kontrollerade.

### Lärare (läst i repot, ingen klassobservation)

- **Åk 4–6:** fritt hopp passar troligen inte. En färdig tur med lärarfält (som `vikingatiden-och-varlden`) fungerar bättre. **Åk 7–9:** användbart om läraren kan förbereda och låsa urvalet. Bläddraren passar nyfikna vuxna och äldre elever. Lgr22-kopplingen är ett antagande och öppnades inte.
- **Märkning:** "Samma plats, olika år" och "strax före/efter" med antal år, plus en fast mening: "De träffades inte. De var på samma plats vid olika tider." Visa den bara när datan stöder det: datan kan inte bevisa att två personer *inte* möttes, så märkningen ska bara redovisa plats och årtal. Aldrig "korsar" som rubrik i lektionsläget.
- **Tappad tråd:** synlig knapp "Tillbaka till [resan]", tak på hopp (förslag högst ett i taget, taket som data i turen), slutkort som #500.
- **Lektionsläget:** ett hopp byter år och lager, vilket `lesson.lock` hindrar. Rekommendation: hopp avstängt i lektionsläget, förutbestämda "samma plats"-steg ingår i en tur.
- **Känsliga urval:** urvalet blir europeiskt, med Zheng He som enda motvikt. Ordet "upptäckte" ska inte användas. Slavhandelslinjerna (`trade`) bör inte kunna följas som "resa" bredvid Columbus, och en automatisk korsning mot dem (till exempel vid Västafrikas kust) måste granskas redaktionellt. Ibn Battutas osäkra datering ska synas på kortet.
- **Lärarstöd:** minst 2–3 frågor, 3–5 begrepp och en rad om vad eleven ska ha med sig per resa. Inga lärarfält finns på Columbus, Magellan, Cook eller Zheng He. Ett uppdrag i Samtidighetsjakten efter #1311 vore en naturlig förlängning.
- **Luckor:** inget Lgr22-spår för upptäcktsresor eller handel i `perioder.json`; begreppen pilgrimsfärd, handelsväg och samtidigt saknas i elevordlistan.

## Konflikter och öppna punkter

- **Tidpunkt:** issuets rekommendation (vänta till efter 7.1, eget paket) delas av historiker, UX och lärare. Arkitekten tycker den är för grov och vill göra steg A (data) direkt, B efter #1163 och C efter #1327 och #1311. Skälet: de flesta beroenden i issuet gäller bara en ny fokustyp, inte stoppdata.
- **Korsningsbas:** historikern föreslår en kuraterad `crossesWith`, geografen och arkitekten beräkning vid körning. Geografens mätning stöder en kombination: beräkna, men filtrera på egen händelse, precision och granskningsnivå, och låt en historiker godkänna urvalet innan det visas för elever.
- **Resa mot resa är tomt.** Det går inte att bygga det issuet beskriver ("en annan tidslinje går genom samma plats och tid") för resor förrän fler resor 1300–1600 finns, och då inte ens Zheng He mot Ibn Battuta garanterar en träff.
- **Tid och plats:** fråga 2 i issuet ("hur nära") är en produktfråga. Mätningen visar att tidsregeln och ett tak på cirka 150 km är en rimlig utgångspunkt, men resultatet beror på stoppens datum, som mest saknas.
- **Platsantal:** 328 platser gäller bara `voyage`; 437 är alla platser i `data/routes/` inklusive 109 på handelsvägarna. Experterna avsåg samma data.
- **Beroenden i issuets rekommendation:** #1311 behövs för tidsregeln, inte för hela idén; #1327 för en ny fokustyp, inte för att stega mellan stopp.

## Förslag till justerad rekommendation i #231

1. **Fråga 1 (personer som egen tidslinje):** inte i första steget. En person är en resa i datan. Ibn Battuta kräver ett eget källarbete först, med osäker kronologi och nivån `source-checked`.
2. **Fråga 2 (hur nära räknas som "korsar"):** samma tidsregel som #1311, ett tak på cirka 150 km (50 km där platsen är exakt), bara daterade `voyage`-stopp mot punkthändelser med exakt plats, resans egna händelser bortfiltrerade, och aldrig `trade`. Avståndet och åren visas för besökaren. Märkning: "Samma plats, olika år", aldrig "korsar" eller "möttes".
3. **Fråga 3 (var):** inte som eget läge. Som tillägg till resefokuset i tre steg: A) källbelagda stopp på fler resor, B) Föregående/Nästa stopp, C) korsningar. Beslutet om A–B före eller efter 7.1 är DasKrokodils.
4. **Strykes ur issuet:** "En väg tillbaka" som spårlista (Bakåt/Framåt via adressen räcker) och ordet "bläddrare".
5. **Rätta issuets exempel** till något som går att belägga, till exempel Mansa Musa i Kairo juli 1324 och, först efter källkontroll, Ibn Battuta våren 1326, med texten att de inte möttes.

## Att göra före bygget

- **Beslut av DasKrokodil:** (1) steg A–B före 7.1 eller allt efter? (2) ska en Ibn Battuta-resa skrivas, och med vilka stopp? (3) vilken radie och tidsregel? (4) ska `trade`-vägar kunna följas i Fokus, och hur hanteras slavhandelslinjerna (experterna rekommenderar att de inte ingår i första versionen)? (5) ska hopp tillåtas i lektionsläget (rekommendation: nej)? (6) ska urvalet av korsningar kuraeras och redovisas öppet?
- **Källarbete (Claude Code, Opus):** stopp med datum på fler resor; en historikergranskning av Ibn Battutas stopp; kontroll av källan `wp-ibn-battuta` i steget Tenochtitlan i `tre-platser-1325`.
- **Mätning före bygget:** hur många av de 9 stoppen får minst en korsning med den valda regeln, och 2–3 observationer av besökare som försöker gå vidare från ett stopp i dag (UX-experten; annars är behovet ett antagande).
- **Beslutsfiler** (`docs/beslut/`): resefokus som bärare, korsningsregeln (radie, tid, körtid), eventuell fokustyp `person` via #1327. CLAUDE.md ändras bara om en fokustyp införs.
- **Modellnivå:** Opus för källarbete och korsningsregel, Sonnet high för steg B. Bara Claude Code gör steg A (data och källor).
- **Experter efter bygget:** läraren läser märkningen som enda underlag, historikern granskar urvalet (särskilt slavhandeln) och sprak-de, sprak-es, sprak-fr samt sprak-en granskar mikrotexten.
