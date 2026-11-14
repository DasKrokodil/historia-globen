# Landskortet: rikena som länkar i kortet, med perioderna i platsen (#1448)

**Datum:** 2026-11-14 (DasKrokodil sa ja till rekommendationerna i #1448; upptäckt i #1262, ordningen efter #1264)

## Beslut
1. **Fältet `periods` i platsen.** En plats i `data/platser.json` får ett valfritt fält `periods: [{ "empire", "polity", "from", "to" }]`: `empire` är gruppens id i `data/empires/index.json` (det som *Följ riket* följer), `polity` är delen i gruppen vars namn och perioder gäller (till exempel `sverige-norge` i gruppen `svenska-stormaktsvaldet`), och `from`/`to` är år. Inga egna texter: namnet på raden är delens eget namn i rikenas index. `polity` är ett tillägg till rekommendationens `{ empire, from, to }`. Det behövs eftersom Sveriges fem riken i datan är en enda grupp (`svenska-stormaktsvaldet`, 980–2024), så gruppens namn och spann ensamt skulle dölja både stormaktsväldet, unionen med Norge och luckorna. Planeringen föreslog samma sak (`periods` med `polity`, docs/granskningar/2026-11-12-planering-regionhistoria.md, del 1 punkt 5).
2. **Åren hämtas ur rikets data, inte för hand.** `scripts/validate-site.py` (och `tests/landskortet-riken.test.mjs`) kräver att riket och delen finns, att `from` är början och `to` slutet på delens perioder i rikets fil (`data/empires/<grupp>.json`), att perioderna däremellan följer på varandra utan lucka, och att listan står i tidsordning. En period får sluta vid en periodgräns inom delen (Kalmarunionen 1402–1501 för Sverige), eftersom Cliopatria där ändrar rikets yta.
3. **Bara riken som täcker landets centrala orter.** Perioderna är de riken i `data/empires/` som på kartan täcker landets centrala orter (prövat år för år med Stockholm, Uppsala, Jönköping och Östersund; Roskilde, Odense, Viborg och Århus; och Lund i Skåne). Rikena täcker inte alltid hela dagens land: Sverige 980–1002 täcker bara Mälardalen (Stockholm, Uppsala) och Jönköping först från 1003; Östersund (Jämtland) ligger i Sverige först 1564–1571 och från 1645, före det i Norgesväldet eller Danmark-Norge; Lund (Skåne) ligger i Danmarks rike eller Kalmarunionen till 1658, utom 1344–1374 då kartdatan räknar orten till Sverige. Sverige på kartan var alltså mindre än dagens land före 1645. Ett rike som bara täcker en ort i utkanten (Norgesväldet och Danmark-Norge i Jämtland, Kalmarunionen i Sverige 1502–1520) tas inte med.
4. **Alla rikesperioder visas, som undantag från högst tre perioder per kort** (beslutet 2026-11-10, #579): de är länkar, inte egen text. Listan står i en egen ihopfällbar ruta *Riken på kartan (antal)* i platskortet, öppen på bred skärm och ihopfälld i mobilbredd, som händelselistan.
5. **Luckorna syns.** År mellan första och sista perioden som ingen period täcker blir en egen rad ("1018–1055: kartan visar inget av rikena i listan här."), räknad ur perioderna i `placeEmpireRows()` (`js/focus/place.js`) och aldrig skriven i data eller kod. Raden påstår inget om historien. En kort förklaring står **under** listan, så att raderna syns först i 400 px: "Landet som det ser ut i dag. Förr hörde området till andra riken, med andra gränser." Unionerna (Kalmarunionen, Sverige-Norge, Danmark-Norge) visas med rikets eget namn. När gruppen bara har en del och har en rad Om kartan (`facts.mapNote`, i dag Kalmarunionen: "Källorna anger 1397–1523. Kartan visar unionen 1402–1525.") står den raden som en liten rad under gruppens första knapp i listan; texten hämtas ur rikenas faktarutor, som laddas med kortet.
5b. **Källan.** En plats med `periods` har `cliopatria` i `sources` (utöver gränsens källa); `validate-site.py` kräver det.
6. **Följ riket.** Varje rad är en knapp, och namnet för skärmläsare har den synliga textens ordning (WCAG 2.5.3): "1815–1904 Sverige-Norge, Följ riket". Den startar Fokus på gruppen (`empire:<id>`), och ligger året utanför perioden börjar Fokus vid periodens första år (`startFocus(key, { within })` i `js/controllers/focus.js`). Raden i fokusraden (`#focus-moved`, `role="status"`) säger alltid vilken period som valdes ("Perioden du valde: Sverige-Norge 1815–1904"), eftersom riket som öppnas är hela gruppen (Sverige 980–2024), och om tiden flyttades också "då perioden 1815–1904 börjar" med *Tillbaka till* som förut. Tangentbordsfokus flyttas till rikets kort (krysset), eller till fokusraden om kortet inte visas. I en tur är raderna bara text, eftersom kortet inte får avsluta turen, och i lektionsläget öppnar en rad bara rikets faktaruta.
6b. **Följ riket ersätter platsen, medvetet.** Fokustyperna utesluter varandra, så att följa ett rike avslutar platsen. Kortet säger det under listan ("Följ riket lämnar platsen."). En knapp *Tillbaka till platsen* byggs inte nu; den kräver ett beslut. **DasKrokodil bör se valet** (skärmbilderna i #1448) och säga om det räcker.
7. **Sverige och Danmark först.** Skåne (landskap) och de andra platserna får inga perioder utan nytt beslut.

## Perioderna (ur data/empires/, Cliopatria v0.2.1, källan `cliopatria`, `source-checked`)
| Plats | Rike (grupp) | Del (polity) | År |
|---|---|---|---|
| sverige | svenska-stormaktsvaldet | sverige-medeltiden | 980–1401 |
| sverige | kalmarunionen | kalmarunionen | 1402–1501 |
| sverige | svenska-stormaktsvaldet | sverige-medeltiden | 1502–1520 |
| sverige | kalmarunionen | kalmarunionen | 1521–1525 |
| sverige | svenska-stormaktsvaldet | sverige-medeltiden | 1526–1611 |
| sverige | svenska-stormaktsvaldet | svenska-stormaktsvaldet | 1612–1721 |
| sverige | svenska-stormaktsvaldet | sverige-1722 | 1722–1814 |
| sverige | svenska-stormaktsvaldet | sverige-norge | 1815–1904 |
| sverige | svenska-stormaktsvaldet | sverige-1905 | 1905–2024 |
| danmark | konungariket-danmark | konungariket-danmark | 936–1017 |
| danmark | konungariket-danmark | konungariket-danmark | 1056–1401 |
| danmark | kalmarunionen | kalmarunionen | 1402–1525 |
| danmark | konungariket-danmark | danmark-norge | 1526–1814 |
| danmark | konungariket-danmark | danmark-1815 | 1815–1939 |
| danmark | danmark | danmark | 1945–2024 |

**Sverige:** Sveriges luckor 1402–1501 och 1521–1525 (#1264) täcks av Kalmarunionen i listan, så ingen lucka står som egen rad; att källorna säger att Sverige lämnade unionen 1523 står redan i rikets ruta Om kartan (#1264). **Danmark:** två luckor blir rader. **1018–1055 är en öppen importlucka:** Cliopatria v0.2.1 har där North Sea Empire (1018–1039), Denmark-England (1040–1045) och Norway-Denmark (1046–1055) (historikern öppnade källfilen vid granskningen), men de posterna är inte importerade till `data/empires/`, så inget rike i datan täcker de danska orterna de åren. Inget importeras i #1448; luckan följs upp i ett eget issue, och raden säger bara att kartan inte visar något av rikena i listan. 1940–1944 ligger området i gruppen Nazityskland (#1264), som inte motsvarar landet och därför inte är med.

## Motivering
Rikena finns redan med källor i `data/empires/`, så kortet pekar på dem utan nya fakta. Att åren kontrolleras mot rikets egna perioder gör att listan inte kan glida isär från kartan, och att luckorna räknas ur perioderna gör att de syns i stället för att döljas.

## Berör
#1448, #1262, #1263, #1264, #579, `data/platser.json`, `schemas/platser.schema.json`, `scripts/validate-site.py`, `js/focus/place.js`, `js/ui/panel.js`, `js/controllers/focus.js`, `js/main.js`, `css/style.css`, `js/controllers/places.js`, `data/ui/*.json` (`place.empires`, `place.empiresNote`, `place.followEmpire`, `place.followEmpireShort`, `place.empireGap`, `place.followLeaves`, `focus.movedPeriod`, `focus.chosenPeriod`), `docs/datamodell.md`, `docs/arkitektur.md`, `tests/landskortet-riken.test.mjs`, `tests/webblasare.mjs`. `tools/platser_gransar.py` skriver bara `boundary`, så en omkörning behåller `periods`.
