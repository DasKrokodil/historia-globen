# Delade gränser, steg 2: Brittiska öarna och Ryssland och Sibirien i datan (#1765)

**Datum:** 2026-11-26. **Av:** Claude Code (DasKrokodil). **Beslut:** [docs/beslut/2026-11-26-delade-granser-steg-2.md](../beslut/2026-11-26-delade-granser-steg-2.md). Före: [utredningen](2026-11-15-delade-granser-forenkling.md) och [piloten](2026-11-20-delade-granser-pilot.md).

## Underlag och mått
Underlag: Cliopatria v0.2.1 (`cliopatria_polities_only_v021.geojson` ur zip-filen på Zenodo, post 23128623, som verktygets docstring anger). "Före" är filerna på main (verktyget före ändringen ger byte för byte samma filer), "efter" är filerna i den här pull requesten. Samma mått som i piloten, räknade ur de byggda rikesfilerna efter avrundningen, varje år i regionens spann:

- **Överlapp:** summan av alla grannpars gemensamma yta i kvadratgrader (kv.grad-år över spannet).
- **Utöver underlaget:** bara överlapp utanför de ytor som redan överlappar i verktygets råa gränser (`raw_periods`).
- **Avvikelse:** symmetrisk skillnad mot verktygets råa gränser delad med deras yta.
- **Storlek** är hela rikesfilerna. För Ryssland ingår hela `mongolriket.json` och `ryska-imperiet.json`, fast bara Gyllene horden och Ryska tsardömet hör till regionen.

## Regionerna i siffror

| | Brittiska öarna före | efter | Ryssland och Sibirien före | efter |
|---|---|---|---|---|
| År | 500–1708 | | 1294–1600 | |
| Överlapp, summa (kv.grad-år) | 47,78 | 8,05 | 648,22 | 0,90 |
| … utöver underlaget | 37,94 | 0,20 | 647,79 | 0,05 |
| Största överlapp ett år utöver underlaget | 0,261 (1645) | 0,004 (628) | 4,295 (1450) | 0,004 (1422) |
| Avvikelse mot råa gränser | 5,76 % | 1,94 % | 2,29 % | 0,84 % |
| Filstorlek | 136,8 kB | 218,1 kB (+59 %) | 390,0 kB | 534,3 kB (+37 %) |
| Hörnpunkter (perioder i spannet) | 8 962 | 14 253 | 9 099 | 17 983 |
| Perioder i spannet | 150 | 159 | 96 | 129 |

Hela `data/empires/` växer från 8,56 till 8,79 MB (+2,6 %). En rikesfil laddas först när riket visas. Verktyget tar lika lång tid som förut (cirka 40 sekunder här).

"Utöver underlaget" efter (0,004) är kanten runt en yta som två riken delar i Cliopatria: den delade biten förenklas och flyttar lite mot de råa gränserna. Grannar utan gemensam yta i underlaget överlappar inte alls.

### Paren i issuet (största överlapp ett år utöver underlaget, kvadratgrader)

| Par | Före | Efter |
|---|---|---|
| Wessex och Mercia | 0,016 (692) | 0 |
| Alba/Skottland och Strathclyde | 0,005 (960) | 0 |
| Moskvariket och Sibirkhanatet | 0,609 (1475) | 0 |
| Sibirkhanatet och Kazakkhanatet | 0,751 (1482) | 0 |
| Kalmarunionen och Moskvariket (Karelen, #1743) | 0,099 (1482) | 0,001 (1502) |
| Moskvariket och Novgorod | 2,504 (1429) | 0,004 (1422) |

Siffrorna i issuet (upp till 0,37 för Wessex och Mercia och 0,15 för Alba och Strathclyde) gällde före #1721 och #1744. De finare `OVERRIDES` som rättade dem tas nu bort, eftersom täckningen ersätter dem.

### Toleransen
Pilotrapporten föreslog högst 1–2 % avvikelse och högst cirka 20 % filtillväxt. Mätt med samma bygge (Ryssland före rättningen av MERGE nedan; skillnaden är under 2 %):

| Brittiska öarna | Storlek | Avvikelse |
|---|---|---|
| 0,1 (vald) | 218,1 kB (+59 %) | 1,94 % |
| 0,15 | 180,5 kB (+32 %) | 3,29 % |
| 0,2 | 144,9 kB (+6 %) | 5,63 % |
| 0,25 | 123,9 kB (−9 %) | 7,51 % |

| Ryssland och Sibirien (x skalat med cos 55°) | Storlek | Avvikelse |
|---|---|---|
| 0,1 | 631,7 kB (+62 %) | 0,48 % |
| 0,15 (vald) | 527,6 kB (+35 %) | 0,89 % |
| 0,2 | 471,1 kB (+21 %) | 1,30 % |
| 0,3 | 409,1 kB (+5 %) | 2,03 % |

- **Brittiska öarna:** ingen tolerans klarar båda målen. Med 0,15 avviker de små rikena 2,4–5,4 % (i dag 1–1,4 %), med 0,1 som förut. Pilotens 0,1 behålls. Tillväxten är nästan bara England (48,9 → 108,8 kB) och Angevinska riket (6,4 → 14,2 kB).
- **Ryssland och Sibirien:** 0,2 klarar nästan båda målen, men då hamnar Köpenhamn utanför Kalmarunionen också med marginalen (`tests/area-lookup.test.mjs`, #1524, föll 1402–1525). Därför 0,15, med +35 %.

### Per rike (avvikelse mot råa gränser, storlek, perioder)

| Rike | Före | Efter |
|---|---|---|
| Wessex | 1,29 %, 15,5 kB, 23 | 1,41 %, 15,1 kB, 24 |
| Mercia | 0,97 %, 17,0 kB, 23 | 1,06 %, 16,2 kB, 25 |
| Northumbria | 1,36 %, 7,0 kB, 11 | 1,01 %, 8,2 kB, 13 |
| Dalriada | 1,29 %, 5,6 kB, 6 | 1,62 %, 5,5 kB, 6 |
| Strathclyde | 1,28 %, 1,6 kB, 3 | 3,16 %, 1,8 kB, 4 |
| Skottland (med Alba) | 0,97 %, 19,4 kB, 13 | 1,33 %, 24,1 kB, 18 |
| Kungariket Man | 41,09 %, 2,4 kB, 4 | 4,29 %, 5,3 kB, 5 |
| England | 8,50 %, 48,9 kB, 56 | 2,59 %, 108,8 kB, 54 |
| Nordsjöväldet | 5,41 %, 12,8 kB, 4 | 0,84 %, 18,9 kB, 4 |
| Angevinska riket | 7,45 %, 6,4 kB, 7 | 0,53 %, 14,2 kB, 6 |
| Moskvariket | 1,73 %, 25,8 kB, 17 | 0,98 %, 34,6 kB, 20 |
| Novgorod | 2,37 %, 10,6 kB, 6 | 0,83 %, 29,5 kB, 11 |
| Ryska tsardömet (1547–1600) | 2,77 %, 6 | 0,65 %, 7 (hela filen 204,8 → 227,1 kB) |
| Gyllene horden (1294–1600) | 1,72 %, 11 | 0,54 %, 12 (hela `mongolriket.json` 59,5 → 75,4 kB) |
| Kazankhanatet | 5,87 %, 1,0 kB, 2 | 2,09 %, 2,3 kB, 3 |
| Astrachankhanatet | 5,17 %, 1,0 kB, 2 | 1,22 %, 1,7 kB, 2 |
| Nogajhorden | 3,57 %, 1,5 kB, 2 | 1,02 %, 5,8 kB, 5 |
| Sibirkhanatet | 1,33 %, 6,7 kB, 5 | 0,50 %, 27,0 kB, 9 |
| Kazakkhanatet | 1,93 %, 13,8 kB, 9 | 0,56 %, 27,5 kB, 12 |
| Mogulistan | 2,96 %, 4,8 kB, 8 | 0,80 %, 13,9 kB, 15 |
| Timuridriket | 1,83 %, 14,4 kB, 14 | 0,51 %, 33,4 kB, 17 |
| Buchara | 3,90 %, 8,2 kB, 6 | 1,08 %, 10,6 kB, 6 |
| Khiva | 4,47 %, 3,9 kB, 2 | 1,55 %, 4,4 kB, 2 |
| Kalmarunionen | 2,84 %, 34,0 kB, 6 | 2,15 %, 41,2 kB, 8 |

Perioderna räknas i regionens spann. Strathclyde avviker mer än förut (3,2 %, som i piloten); det är fortfarande 16–22 hörnpunkter per period och ingen fyrhörning som i #1721. Alla riken i Ryssland och Sibirien ligger närmare de råa gränserna än förut.

## Grannar utanför regionerna
Överlapp utöver underlaget mellan regionens riken och grannar som förenklas för sig (kv.grad-år; största ett år inom parentes):

| | Före | Efter | Största par efter |
|---|---|---|---|
| Brittiska öarna mot Frankrike, Norgesväldet, Danmark, Tysk-romerska riket och Brittiska imperiet | 30,65 (0,392) | 43,76 (0,675) | England och Frankrike 32,4 |
| Ryssland och Sibirien mot Litauen, Sverige, Osmanska riket, Oiraterna, Norra Yuan, Danmark, Tysk-romerska riket, Polen, Safaviderna, Ming, Aq Qoyunlu och Norgesväldet | 150,79 (2,004) | 262,47 (2,227) | Mogulistan och Norra Yuan 46,7; Gyllene horden och Litauen 36,2 |

**Det här blir sämre.** Två grannar som båda förenklas för sig med Douglas–Peucker och samma tolerans får ofta nästan samma linje, eftersom metoden behåller samma hörnpunkter på en gemensam gräns. När den ena förenklas i en täckning (Visvalingam–Whyatt) och den andra för sig stämmer linjerna mindre bra, fast regionens sida ligger närmare Cliopatria (Mogulistan 1500: 0,37 i stället för 0,83 kvadratgrader utanför den råa gränsen). Det försvinner när grannen kommer med i en region. Inom regionerna försvann 37,7 respektive 647,7 kv.grad-år, mot 13,1 respektive 111,7 som tillkom utanför.

## Ändringar mot piloten och hur förslagen följdes
1. **Region för region** (punkt 1): två regioner, `SHARED_REGIONS`. En del står i högst en region (verktyget stannar annars).
2. **Överlapp i underlaget** (punkt 2): den gemensamma ytan blir en egen bit i täckningen och läggs till båda rikena. Ytor under `SHARED_SLIVER` (0,01 kvadratgrader) eller smalare än cirka 0,04 grader (2 × `SLIVER`, som i `big_change`) är samma gräns något olika ritad och går till den som står först. Verktyget skriver ut varje delad yta:
   - Brittiska öarna (Isle of Man): Northumbria och Dalriada 626 och 628 (0,106 kvadratgrader), Alba och Kungariket Man 1099, 1147 och 1152 (0,098), Skottland och England 1326 och 1402–1459 (0,106). Förut hölls de utanför täckningen; nu är gränsen mot övriga grannar delad också de åren, och ön ritas i båda rikena som i Cliopatria.
   - Ryssland och Sibirien, små ytor (0,011–0,041): Moskvariket och Novgorod 1415 och 1422, Gyllene horden och Astrachan 1475–1497, Astrachan och Nogajhorden 1521–1552, Buchara och Khiva 1526, Sibirkhanatet och Kazakkhanatet 1529–1552.
   - **Öppet:** att Isle of Man ska gå att klicka i som ett rike (och inte försvinna bakom två lager) gäller sidans kod och ingår inte här.
3. **Tolerans per region** (punkt 3): se tabellen ovan. Målet på högst cirka 20 % tillväxt nås inte i någon av regionerna utan att avvikelsen eller Köpenhamn blir sämre.
4. **Skalning med cos** (punkt 4): Ryssland och Sibirien skalas med cos 55° (x × 0,57) före förenklingen och tillbaka efter. Brittiska öarna skalas inte, så att pilotens mätta tolerans gäller; regionen sträcker sig från cirka 41° N (Angevinska riket) till cirka 70° N (Norge i Nordsjöväldet), men de flesta gränserna ligger på 50–59° N. Ryssland och Sibirien sträcker sig från cirka 25° till 73° N.
5. **Angevinska riket** (punkt 5): med i Brittiska öarna. Det överlappar inte England-1072 eller England i underlaget, och gränsen mot Skottland är delad. Mot Frankrike och Tysk-romerska riket, som förenklas för sig, finns överlapp kvar (5,3 och 3,6 kv.grad-år).
6. **Periodkanter** (punkt 6): Brittiska öarna tar alla år rikena finns (första perioden börjar 534, England slutar 1708), så ingen gräns hoppar vid en kant. Ryssland och Sibirien börjar 1294, när Moskvariket börjar i datan, och slutar 1600. Perioder som börjar efter 1600 (Ryska tsardömet, Kazakkhanatet, Gyllene horden, Mogulistan, Buchara, Khiva) och Gyllene hordens perioder före 1294 förenklas för sig, och där kan gränsen hoppa. **Öppet:** kanten 1600 flyttas när nästa region (Sibirien efter 1600 eller Centralasien) läggs till.
7. **Kontroller mot Cliopatria** (punkt 7, Norgesväldet och Kungariket Man): inte gjorda. Norgesväldet ingår inte i någon region; Kungariket Mans lucka 1272–1343 ändras inte av täckningen.
8. **Datumgränsen** (punkt 8): ingen av regionerna når 180° (längst österut 126,1° Ö, Gyllene horden). Verktyget stannar med ett fel om en region gör det, i stället för att dra gränser tvärs över kartan. Att dela vid 180° är inte byggt.
9. **CI och färre undantag** (punkt 9): `pip install 'shapely>=2.1'` och provet i `validate-site.yml`. Borttagna `OVERRIDES`: Strathclyde, Skottland, Wessex, Mercia, Northumbria, Dalriada, Moskvariket. Borttagna `DECIMALS`: Strathclyde, Skottland, Wessex, Mercia, Northumbria, Dalriada. Kvar: Nordsjöväldet (Danmarks kust, #1602) och Kalmarunionen (Öresund, #1466) i `OVERRIDES`, eftersom de inte bara gällde överlapp; deras tolerans används inte längre när alla deras perioder ligger i en täckning, men `SAME_AS_TOL` för Kalmarunionen gäller som förut.

**Rättat under arbetet:** I en täckning slås perioder nu ihop under högst `MERGE` (0,02). Med Ryska imperiets 0,05 behöll Ryska tsardömet sin gräns från 1582 också 1588–1594, och den överlappade då Sverige med 5,1 kvadratgrader (före: 0,4).

## Punktprov med städer ur Wikidata
Koordinaterna är hämtade ur Wikidata (Special:EntityData/Qxxx.json, öppnade 2026-11-26): London Q84, York Q42462, Edinburgh Q23436, Winchester Q172157, Moskva Q649, Kazan Q900, Tobolsk Q168782, Astrachan Q3927, Novgorod Q2235. Provet testar vilket av regionernas riken staden ligger i, i filerna före och efter. **Alla 40 prov ger samma rike före och efter.** Proven säger bara att förenklingen inte flyttar staden till ett annat rike; vilket rike Cliopatria anger är oförändrat och prövas inte här.

| Stad | År | Rike (före = efter) |
|---|---|---|
| London | 700, 900 / 1000 / 1100 / 1180 / 1300, 1600 | Wessex / England / England 1072 / Angevinska riket / England |
| York | 650, 800 / 1020 / 1050, 1300 | Northumbria / Nordsjöväldet / England |
| Edinburgh | 700 / 950 / 1100 / 1300, 1500 | Northumbria / England / Alba / Skottland |
| Winchester | 600 / 800 / 1180 | inget / Mercia / Angevinska riket |
| Moskva | 1300, 1400, 1500 / 1560, 1590 | Moskvariket / Ryska tsardömet |
| Kazan | 1450, 1500, 1550 / 1560 | Kazankhanatet / Ryska tsardömet |
| Tobolsk | 1450, 1500, 1580 / 1590 | Sibirkhanatet / Ryska tsardömet |
| Astrachan | 1480, 1520 / 1560 | Astrachankhanatet / Ryska tsardömet |
| Novgorod | 1350, 1450, 1480 / 1500 | Novgorod / Moskvariket |

## Täckningsrapporten
`python3 tools/tackning.py` före och efter: allt är lika utom tabellen över rikesytor i havet (#1444). Där mäts 3 680 perioder i stället för 3 633 (de nya perioderna i regionerna), och 70 i stället för 68 perioder har mer än 20 % i havet: Kungariket Man (33–39 % i stället för 35–44 %, och perioden 1094–1168 delas vid 1099) och Isle of Man 1344–1401 (44 %, en liten ö vars gräns nu följer Cliopatria närmare). Dalriadas andel ändras högst en procentenhet.

## Pull requests som också ändrar `tools/riken.py`
- **#2296** (#1444) klipper bland annat `dal-riata` mot kusten. Dalriada ingår i Brittiska öarna. Klippningen görs sist, efter förenklingen och sammanslagningen av perioder, och bara i havet, så den tar inte bort något av den delade gränsen på land och lägger inte till något överlapp. Den som slås ihop sist ombaserar på main och bygger om `data/empires/` med verktyget.
- **#2293** (#1767, Frankrike och Tyskland vid Lauter) rör inga riken i regionerna, men ändrar samma fil. Samma regel: den som slås ihop sist ombaserar och bygger om.

## Kontroller
- `python3 tests/riken-delade-granser-test.py`: enhetsprov med påhittade polygoner, nu också delad yta i underlaget, smala remsor, skalning med cos och att varje del står i högst en region. Med `CLIOPATRIA=<fil>`: hela verktyget ger byte för byte filerna i `data/empires/`, och största överlapp ett år utöver underlaget är 0,0011 (Brittiska öarna) och 0,0010 (Ryssland och Sibirien) kvadratgrader.
- `tests/riken-kontrollpunkter-test.py` (1 386 kontrollpunkter), `riken-bevara-test.py`, `cliopatria-ar-test.py`, `riken-namn-test.py`, `riken-oversatta-namn-test.py`: gick igenom.
- `node --test 'tests/*.test.mjs'`: 736 godkända, 0 fel (med tolerans 0,2 för Ryssland föll två prov om Köpenhamn, se Toleransen).
- `tools/dela_data.py`, `tools/oversattning.py`, `tools/textlangd.py`, `tools/license_manifests.py`: inga ändringar.
- Webbläsarkontrollerna "punkt mot rike … Köpenhamn", "Fokus öppnas och följer ett rike" och "huvudstaden följer året": gick igenom, inga konsolfel.

## Skärmbilder
Globen med filerna på main (före) och i den här pull requesten (efter), laddade lokalt, inga konsolfel. Grenen `skarmbilder`, mappen `issue-1765/`:

- Dator 1280 px: [England 900 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/steg2-dator-england-900-fore.webp), [efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/steg2-dator-england-900-efter.webp); [Moskva 1550 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/steg2-dator-moskva-1550-fore.webp), [efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/steg2-dator-moskva-1550-efter.webp)
- Utsnitt, förstorade två gånger: [England 900 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/steg2-dator-england-900-utsnitt-fore.webp), [efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/steg2-dator-england-900-utsnitt-efter.webp); [Ryska tsardömet, Sibirkhanatet och Nogajhorden 1550 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/steg2-dator-moskva-1550-utsnitt-fore.webp), [efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/steg2-dator-moskva-1550-utsnitt-efter.webp) (före går två linjer bredvid varandra, efter en)
- Mobil 400 px: [England 900 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/steg2-mobil-england-900-fore.webp), [efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/steg2-mobil-england-900-efter.webp); [Moskva 1550 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/steg2-mobil-moskva-1550-fore.webp), [efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/steg2-mobil-moskva-1550-efter.webp)

## Expertgranskning
Underagenterna `geograf` och `arkitekt` gick inte att kalla in i den här körningen (inget agentverktyg). Ändringen är inte granskad av dem; enligt beslutet 2026-11-23 granskar `historiker` med `geograf` i batch före release, och dirigenten granskar arkitekturen före ihopslagning.

## Nästa regioner (förslag)
1. **Norden och Östersjön** med Danmark, Sverige, Norgesväldet, Litauen, Polen och Tyska orden, så att överlappen mot Ryssland och Sibirien (Sverige, Litauen) och Holstein försvinner. Kräver en tolerans som håller Öresund (Köpenhamn).
2. **Centralasien och Mongoliet efter 1600** med Norra Yuan, Oiraterna, Dzungarkhanatet och Ryska tsardömet till 1721; där behövs troligen delningen vid 180° (punkt 8).
3. **Frankrike och Tyskland**, så att överlappet mellan England och Frankrike (32 kv.grad-år) försvinner.
