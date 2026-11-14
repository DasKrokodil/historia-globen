# Landskortet: rikena som länkar i kortet, med perioderna i platsen (#1448)

**Datum:** 2026-11-14 (DasKrokodil sa ja till rekommendationerna i #1448; upptäckt i #1262, ordningen efter #1264)

## Beslut
1. **Fältet `periods` i platsen.** En plats i `data/platser.json` får ett valfritt fält `periods: [{ "empire", "polity", "from", "to" }]`: `empire` är gruppens id i `data/empires/index.json` (det som *Följ riket* följer), `polity` är delen i gruppen vars namn och perioder gäller (till exempel `sverige-norge` i gruppen `svenska-stormaktsvaldet`), och `from`/`to` är år. Inga egna texter: namnet på raden är delens eget namn i rikenas index. `polity` är ett tillägg till rekommendationens `{ empire, from, to }`. Det behövs eftersom Sveriges fem riken i datan är en enda grupp (`svenska-stormaktsvaldet`, 980–2024), så gruppens namn och spann ensamt skulle dölja både stormaktsväldet, unionen med Norge och luckorna. Planeringen föreslog samma sak (`periods` med `polity`, docs/granskningar/2026-11-12-planering-regionhistoria.md, del 1 punkt 5).
2. **Åren hämtas ur rikets data, inte för hand.** `scripts/validate-site.py` (och `tests/landskortet-riken.test.mjs`) kräver att riket och delen finns, att `from` är början och `to` slutet på delens perioder i rikets fil (`data/empires/<grupp>.json`), att perioderna däremellan följer på varandra utan lucka, och att listan står i tidsordning. En period får sluta vid en periodgräns inom delen (Kalmarunionen 1402–1501 för Sverige), eftersom Cliopatria där ändrar rikets yta.
3. **Bara riken vars område på kartan motsvarar landet.** Perioderna valdes genom att pröva vilka riken i `data/empires/` som täcker fyra orter i landet varje år (Stockholm, Uppsala, Jönköping och Östersund; Roskilde, Odense, Viborg och Århus). Ett rike som bara täcker en ort (Norgesväldet och Danmark-Norge i Jämtland, Kalmarunionen i Sverige 1502–1520) tas inte med.
4. **Alla rikesperioder visas, som undantag från högst tre perioder per kort** (beslutet 2026-11-10, #579): de är länkar, inte egen text. Listan står i en egen ihopfällbar ruta *Riken på kartan (antal)* i platskortet, öppen på bred skärm och ihopfälld i mobilbredd, som händelselistan.
5. **Luckorna syns.** År mellan första och sista perioden som ingen period täcker blir en egen rad ("1018–1055: på kartan ligger området inte i något av rikena i listan."), räknad ur perioderna i `placeEmpireRows()` (`js/focus/place.js`) och aldrig skriven i data eller kod. En fast rad över listan säger att kortet visar dagens land, att listan visar vilket rike området låg i på kartan, att ett rike kan vara större eller mindre än landet eller en union med andra länder, och att årtalen är kartdatans. Unionerna (Kalmarunionen, Sverige-Norge, Danmark-Norge) visas med rikets eget namn.
6. **Följ riket.** Varje rad är en knapp med hela namnet för skärmläsare ("Följ riket Sverige-Norge 1815–1904"). Den startar Fokus på gruppen (`empire:<id>`), och ligger året utanför perioden börjar Fokus vid periodens första år; raden om flytten säger "då perioden 1815–1904 börjar" och har *Tillbaka till* som förut (`startFocus(key, { within })` i `js/controllers/focus.js`). I en tur är raderna bara text, eftersom kortet inte får avsluta turen, och i lektionsläget öppnar en rad bara rikets faktaruta.
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

**Sverige:** Sveriges luckor 1402–1501 och 1521–1525 (#1264) täcks av Kalmarunionen i listan, så ingen lucka står som egen rad; att källorna säger att Sverige lämnade unionen 1523 står redan i rikets ruta Om kartan (#1264). **Danmark:** två luckor blir rader. 1018–1055 har delen `konungariket-danmark` ingen period i `data/empires/konungariket-danmark.json` (perioderna slutar 1017 och börjar igen 1056), och inget rike i `data/empires/` täcker de fyra danska orterna de åren. Det är en iakttagelse i kartdatan, inte kontrollerad mot någon källa om vad som hände då; därför säger raden bara att kartan inte har något av rikena i listan. Den bör granskas av historikern. 1940–1944 ligger området i gruppen Nazityskland (#1264), som inte motsvarar landet och därför inte är med.

## Motivering
Rikena finns redan med källor i `data/empires/`, så kortet pekar på dem utan nya fakta. Att åren kontrolleras mot rikets egna perioder gör att listan inte kan glida isär från kartan, och att luckorna räknas ur perioderna gör att de syns i stället för att döljas.

## Berör
#1448, #1262, #1263, #1264, #579, `data/platser.json`, `schemas/platser.schema.json`, `scripts/validate-site.py`, `js/focus/place.js`, `js/ui/panel.js`, `js/controllers/focus.js`, `js/main.js`, `css/style.css`, `data/ui/*.json` (`place.empires`, `place.empiresNote`, `place.followEmpire`, `place.followEmpireShort`, `place.empireGap`, `focus.movedPeriod`), `docs/datamodell.md`, `docs/arkitektur.md`, `tests/landskortet-riken.test.mjs`, `tests/webblasare.mjs`. `tools/platser_gransar.py` skriver bara `boundary`, så en omkörning behåller `periods`.
