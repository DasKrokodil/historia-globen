# Delade gränser, pilot för England, Skottland och Man (#1765, steg 1)

**Datum:** 2026-11-20 (rättad samma dag efter granskning av arkitekt och geograf). **Av:** Claude Code (DasKrokodil). **Beslut:** DasKrokodils ja i #1765 till en pilot bakom en flagga och till shapely 2.1 för flaggan ([beslutsfil](../beslut/2026-11-20-delade-granser-pilot-1765.md)). Utredningen före: [2026-11-15-delade-granser-forenkling.md](2026-11-15-delade-granser-forenkling.md).

## Omfång
Piloten gäller **England, Skottland och Man med föregångarna, 500–1700**. Det är grupperna i `SHARED_GROUPS`: Wessex, Mercia, Northumbria, Dalriada, Strathclyde, Kungariket Skottland (med Alba), Kungariket Man, Kungariket England och Nordsjöväldet.

Det är inte hela Brittiska öarna. Så här ser det ut i `data/empires/` före 1922, uppmätt med grova rutor runt Irland och Wales:
- **Inga egna irländska eller walesiska riken finns.**
- Wales ingår i Englands gräns 936–1708 och i Angevinska riket 1169–1209.
- Delar av Irland ingår i England 1210–1708 (som Cliopatria ritar det), i Angevinska riket 1177–1209 och i Dalriada 540–643 (nordöstra Irland).
- Från 1709 ingår båda i Brittiska imperiet.

Angevinska riket (1169–1209, mellan England-1072 och England från 1210) ingår inte i piloten, se steg 2.

## Vad som byggdes
`python3 tools/riken.py <cliopatria.geojson> --delade-granser` förenklar grupperna i `SHARED_GROUPS` tillsammans. Utan flaggan blir alla 377 filer i `data/empires/` byte för byte som i repot (se Kontroller). Utan flaggan fungerar verktyget också med äldre shapely: bara flaggan kräver shapely 2.1 eller senare med GEOS 3.12 eller senare. `--ut=<mapp>` skriver filerna någon annanstans. Ingen datafil i repot är ombyggd med flaggan.

Så går det till, punkt för punkt mot utredningens sex punkter:

1. **Täckningen byggs av verktygets egna råa gränser.** Funktionen `raw_periods` tar Cliopatria efter EXTEND, join, fill, prepend, minus, clip och DISPUTED; main använder samma funktion. Ingen av pilotens grupper har `homeland`, `SAME_AS_TOL` eller DISPUTED.
2. **Vilka år:** varje år 500–1700 där någon del i regionen börjar en period (120 år). Alla gränser det året skärs mot varandra (`polygonize`), så att grannar har samma hörnpunkter. Sedan förenklas de med `coverage_simplify`, tolerans `SHARED_TOL` = 0,1.
3. **Överlapp i underlaget:** två delar som överlappar mer än `SHARED_SLIVER` (0,01 kvadratgrader, cirka 70 km²) ett år hålls utanför täckningen det året och förenklas för sig som förut. Det händer tre gånger, och alla tre gäller Isle of Man (0,10–0,11 kvadratgrader):
   - Northumbria och Dalriada 626–632
   - Alba och Kungariket Man 1099–1168
   - England och Skottland 1326–1332 och 1402–1474

   **Vid Isle of Man är gränsen därför inte delad de åren.** Där finns överlapp på upp till 0,06 kvadratgrader utöver underlaget kvar. Mindre överlapp (0,0007–0,008) är remsor där samma gräns är något olika ritad. De går till den del som står först i `SHARED_GROUPS`. Ytmätningen nedan visar att det inte flyttar gränserna märkbart.
4. **Avrundning:** pilotens grupper avrundas alla till två decimaler. England, Man och Nordsjöväldet hade en.
5. **MIN_AREA och MERGE:**
   - En ö under `MIN_AREA` tas bort efter förenklingen, men bara om den inte rör en granne. Ingen del försvinner alltså på bara ena sidan av en gemensam gräns.
   - En del som ändras mindre än `MERGE` behåller sin förra gräns, som förut.
   - En behållen gräns får ändå årets nya gräns om den annars skulle överlappa en granne mer än `SHARED_FIX` (0,001 kvadratgrader). Perioden delas då (`split_at`). Det ger 11 fler perioder, 154 mot 143.
6. **Omkörning ger tom diff:** ja, utan flaggan.
   - Verktyget skrev förut `index.json` utan radslut sist, medan filen i repot har ett. Nu skrivs radslutet, så omkörningen ger en helt tom diff.
   - Med flaggan ger samma indata samma utdata.
   - Texten i `notes` i index.json ändras bara med flaggan. Då står det där att gränsen inte är delad vid Isle of Man de åren.

## Mätning i de riktiga filerna
Underlag: Cliopatria v0.2.1 (`cliopatria_polities_only_v021.geojson` ur zip-filen på Zenodo, post 23128623, som verktygets docstring anger), hämtad till en tillfällig mapp. Varje år 500–1700 räknades ur de byggda rikesfilerna, efter avrundningen. Mätorden:
- **Överlapp:** summan av alla grannpars gemensamma yta i kvadratgrader.
- **"Utöver underlaget":** bara överlapp utanför de ytor som redan överlappar i verktygets råa gränser.
- **Avvikelse mot verktygets råa gränser:** den symmetriska skillnaden mot gränserna efter EXTEND, minus, clip och DISPUTED, delad med deras yta, för perioder som börjar 500–1700. Den mäter alltså förenklingen och inte verktygets andra steg. Avvikelsen mot orörd Cliopatria står längre ned.

| | I dag (flaggan av) | Pilot, tolerans 0,1 (vald) | Tolerans 0,15 | Tolerans 0,2 |
|---|---|---|---|---|
| Överlapp, summa över åren (kv.grad-år) | 45,98 | 20,88 | 20,19 | 17,36 |
| … utöver underlaget | 36,58 | 8,82 | 8,98 | 8,84 |
| År med överlapp utöver underlaget > 0,001 | 941 av 1 201 | 157 (bara åren vid Isle of Man ovan) | 157 | 157 |
| Största överlapp ett år utöver underlaget | 0,261 | 0,059 | 0,059 | 0,059 |
| Grannar utan något överlapp i underlaget: största överlapp ett år | – | 0,0004 | – | – |
| Filstorlek, nio grupper | 130,4 kB | 194,3 kB (+49 %) | 165,0 kB | 134,1 kB |
| Hörnpunkter | 8 515 | 12 495 | 10 328 | 8 052 |
| Avvikelse mot verktygets råa gränser | 6,7 % | 2,5 % | 3,5 % | 5,5 % |
| Överlapp mot grannar utanför piloten (Norgesväldet, Frankrike m.fl.), summa | 51,90 | 57,22 | 58,08 | 58,36 |

**Avvikelse mot orörd Cliopatria** (pilotens riken som finns året, varje rikes Cliopatria-poster som de är, symmetrisk skillnad delad med Cliopatrias yta):

| År | Riken | I dag | Pilot 0,1 |
|---|---|---|---|
| 650 | 5 | 1,6 % | 1,7 % |
| 850 | 5 | 1,2 % | 1,2 % |
| 1050 | 3 | 5,9 % | 1,0 % |
| 1300 | 2 | 6,2 % | 0,8 % |
| 1600 | 2 | 5,3 % | 1,0 % |

Här ingår också det som verktyget avsiktligt ändrar, till exempel Isle of Man som klipps ur Skottland 1344–1401 (#1742).

Överlapp ett visst år (kvadratgrader; inom parentes utöver underlaget):

| År | Underlaget | I dag | Pilot 0,1 |
|---|---|---|---|
| 650 | 0,002 | 0,039 (0,038) | 0,000 |
| 800 | 0,001 | 0,009 (0,008) | 0,000 |
| 1000 | 0,000 | 0,075 (0,075) | 0,000 |
| 1050 | 0,004 | 0,101 (0,100) | 0,000 |
| 1100 | 0,098 | 0,135 (0,061) | 0,151 (0,059) |
| 1300 | 0,000 | 0,047 (0,047) | 0,000 |
| 1600 | 0,000 | 0,060 (0,060) | 0,000 |

**Yta per grupp:** medelyta i km² (sfärisk yta, samma `km2` som verktyget) över de år gruppen finns 500–1700. Tabellen visar om remsorna som går till den som står först i `SHARED_GROUPS` flyttar gränsen åt ett håll.

| Grupp | År | Råa gränser | I dag | Pilot 0,1 |
|---|---|---|---|---|
| Wessex | 370 | 30 517 | 30 425 (−0,3 %) | 30 440 (−0,3 %) |
| Mercia | 335 | 43 909 | 43 881 (−0,1 %) | 43 962 (+0,1 %) |
| Northumbria | 323 | 37 366 | 37 308 (−0,2 %) | 37 434 (+0,2 %) |
| Dalriada | 360 | 30 885 | 30 873 (−0,0 %) | 30 941 (+0,2 %) |
| Strathclyde | 390 | 9 959 | 9 935 (−0,2 %) | 9 866 (−0,9 %) |
| Kungariket Skottland | 700 | 69 662 | 69 570 (−0,1 %) | 69 826 (+0,2 %) |
| Kungariket Man | 245 | 7 590 | 6 208 (−18,2 %) | 7 645 (+0,7 %) |
| Kungariket England | 696 | 208 319 | 206 504 (−0,9 %) | 207 339 (−0,5 %) |
| Nordsjöväldet | 38 | 341 843 | 339 806 (−0,6 %) | 342 102 (+0,1 %) |

Ytorna ändras högst 0,9 procent mot de råa gränserna, och åt båda hållen. Strathclyde står efter Dalriada i ordningen och minskar mest: −0,9 %, cirka 90 km² i medel. Remsan mellan dem är 0,0015 kvadratgrader, cirka 10 km², så det mesta av minskningen kommer från förenklingen. Någon systematisk förskjutning syns inte.

Avvikelse och storlek per grupp, i dag → pilot 0,1 (mot de råa gränserna):

| Grupp | Avvikelse | Storlek |
|---|---|---|
| Wessex | 1,2 → 1,3 % | 15,5 → 15,1 kB |
| Mercia | 1,0 → 1,1 % | |
| Northumbria | 1,2 → 1,0 % | |
| Dalriada | 1,5 → 1,7 % | |
| Strathclyde | 1,2 → 2,9 % | 1,6 → 1,8 kB |
| Skottland | 0,9 → 1,3 % | 19,4 → 23,2 kB |
| Kungariket Man | 42,5 → 4,4 % | |
| England | 8,5 → 3,2 % | 48,9 → 101,5 kB |
| Nordsjöväldet | 5,5 → 0,8 % | 12,8 → 18,9 kB |

Strathclyde har 16–22 hörnpunkter per period och blir alltså ingen fyrhörning som i #1721.

**Tid:** hela verktyget tar 57–61 sekunder med och utan flaggan. Den delade förenklingen själv tar 0,3 sekunder för alla 120 år.

**Toleransen:** 0,1 valdes. Då behåller de grupper som redan var finare för att inte överlappa ungefär sin noggrannhet (0,05 grader, #1721, #1744), och England, Man och Nordsjöväldet blir mycket närmare Cliopatria. Nackdelen är att England blir dubbelt så stor, cirka 100 kB, som laddas först när riket visas. Med 0,2 blir storleken densamma som i dag, men de små rikena avviker 4–9 % i stället för 1–1,5 %.

## Kontroller
- `python3 tests/riken-delade-granser-test.py` (nytt) är enhetsprov med påhittade polygoner. Provet kräver shapely och hoppas därför över i CI. Det prövar att:
  - grannar inte överlappar
  - överlapp i underlaget hålls utanför
  - remsor ger en giltig täckning
  - en ö bara tas bort när den inte rör en granne
  - en liten ändring behåller sin gräns, och en ändring större än MERGE ger en ny period
  - en granne som annars skulle överlappa får en ny gräns
  - `split_at` delar rätt
  - verktyget utan flaggan kommer förbi versionskontrollen med en shapely utan `coverage_simplify`, men med flaggan stannar det
  - `simplify_alone` ger samma gräns som en frusen förväntad geometri, tagen när hela verktyget gav samma filer som förut
- Med `CLIOPATRIA=<fil>` körs hela verktyget utan och med flaggan. Utskrift från körningen 2026-11-20 efter rättningarna:

  ```
  $ CLIOPATRIA=…/cliopatria_polities_only_v021.geojson python3 tests/riken-delade-granser-test.py
  ok: delade gränser utan överlapp, överlapp i underlaget hålls utanför, öar och sammanslagning som de ska; hela verktyget: utan flaggan samma filer, med flaggan högst 0.0004 kv.grader överlapp ett år
  exit 0
  ```

  "Utan flaggan samma filer" betyder att alla 377 filer i `data/empires/` jämfördes byte för byte med utdatan.
- `python3 -I tests/riken-bevara-test.py`, `tests/cliopatria-ar-test.py`, `tests/riken-namn-test.py` och `tests/riken-oversatta-namn-test.py` gick igenom.
- `tests/riken-kontrollpunkter-test.py` gick igenom, också med pilotens filer inkopierade: alla 1 260 kontrollpunkter stämmer.
- `node --test 'tests/*.test.mjs'`: 682 godkända, 0 fel.
- Inga datafiler ändrades, så `tools/dela_data.py` och `tools/oversattning.py` behövdes inte.

## Skärmbilder
Globen med dagens filer (före) och pilotens filer (efter), laddade lokalt. Inga konsolfel. Bilderna ligger på grenen `skarmbilder`, mappen `issue-1765/`:

- Dator 1280 px: [650 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-650-fore.webp), [650 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-650-efter.webp), [800 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-800-fore.webp), [800 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-800-efter.webp), [1300 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-1300-fore.webp), [1300 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-1300-efter.webp)
- Utsnitt av datorbilderna, förstorade två gånger: [650 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-650-utsnitt-fore.webp), [650 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-650-utsnitt-efter.webp) (gränsen mellan Wessex och Mercia), [1300 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-1300-utsnitt-fore.webp), [1300 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-1300-utsnitt-efter.webp) (England mot Skottland, Englands kust)
- Mobil 400 px: [650 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/mobil-650-fore.webp), [650 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/mobil-650-efter.webp), [800 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/mobil-800-fore.webp), [800 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/mobil-800-efter.webp), [1300 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/mobil-1300-fore.webp), [1300 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/mobil-1300-efter.webp)

År 800 syns skillnaden knappt, eftersom överlappet redan var litet (0,009). I mobilen är globen redan inzoomad så långt det går (zoom 3,2).

## Expertgranskning
I den första omgången gick det inte att starta underagenterna, så jag gick själv igenom ändringen med deras checklistor. Sedan granskade arkitekt och geograf pull requesten (#2028) åt dirigenten. Rättningarna efter den granskningen:

- versionskontrollen körs bara med flaggan
- avvikelsen beskrivs som avvikelse mot verktygets råa gränser, och avvikelsen mot orörd Cliopatria är tillagd
- förbehållet för Isle of Man står i rapporten, beslutsfilen och `notes`
- omfånget heter England, Skottland och Man
- ytan per grupp är mätt
- utskriften från provet med hela verktyget är inklistrad
- provet jämför med en frusen geometri i stället för en kopia av koden och har ett MERGE-fall till
- upprepade rader om överlapp i underlaget slås ihop till en rad per par

## Slutsats
Piloten håller för grannar som inte överlappar i underlaget:
- Överlappen försvinner i de riktiga filerna: högst 0,0004 kvadratgrader ett år, mot upp till 0,26 i dag.
- Avvikelsen mot verktygets råa gränser minskar från 6,7 till 2,5 %, och mot orörd Cliopatria lika mycket eller mer.
- Ytorna flyttas inte systematiskt.

Det som återstår:
- **Isle of Man:** de år Cliopatria räknar ön till två riken förenklas båda för sig. Där är gränsen inte delad, och överlappet runt ön blir som förut (upp till 0,06 kvadratgrader utöver underlaget).
- **Filstorleken** växer 49 % med den valda toleransen, nästan bara för England.
- **Grannarna utanför piloten** (Norgesväldet, Frankrike och Angevinska riket) har kvar sina överlapp.

## Förslag på steg 2 (byggs inte nu; kräver DasKrokodils ja)
1. **Hela kartan i omgångar per region**, inte allt på en gång. Varje rikesfil ändras en gång och granskas av `geograf`. Börja med regioner med kända överlapp: Ryssland och Sibirien (#1743) och Tyskland med grannar.
2. **Överlapp i underlaget:** den gemensamma ytan kan bli en egen bit i täckningen, som läggs till båda rikena. Då ritas den i båda, som i Cliopatria, och gränserna mot övriga grannar blir ändå gemensamma. Det tar bort åren vid Isle of Man. Isle of Man ska då också gå att klicka i, alltså höra till ett rike vid tryck och inte försvinna bakom två lager.
3. **Tolerans per region** med ett mått: till exempel högst 1–2 % ytavvikelse per rike mot de råa gränserna (tabellen ovan), och en gräns för hur mycket filerna får växa (till exempel +20 %; för England, Skottland och Man motsvarar det ungefär 0,15).
4. **Grader är inte lika långa åt alla håll.** Toleransen och alla ytor räknas i grader, och en grad öst–väst är kortare ju längre norrut. Långt norrut (Sibirien, Norge, cirka 60–70° N) förenklas därför gränser i öst–väst ungefär dubbelt så hårt i kilometer som i nord–syd. Förslag: skala x med cos(mittbredden) för varje region före förenklingen och tillbaka efter, som regionvyn gör.
5. **Angevinska riket** (1169–1209) gränsar mot England-1072 och England och omfattar Wales och delar av Irland, men ingår inte i piloten. Det låg inte i den lista DasKrokodil godkände. I steg 2 bör det läggas till i samma region.
6. **Hopp vid periodkanterna 500 och 1700:** en period som börjar 1699 får delad gräns, men en som börjar 1701 förenklas för sig. Gränsen kan alltså hoppa vid övergången. I steg 2 bör hela tidsspannet för gruppen tas med, eller kanten läggas där regionens riken byts.
7. **Kontrollera mot Cliopatria före steg 2:**
   - Norgesväldet 1028–1039 har `areaKm2` 25 414, mot 282 297–296 290 i perioderna runt omkring (#1602; resten ligger i Nordsjöväldet).
   - Norgesväldet saknar period 1046–1055 (Norge–Danmark i Nordsjöväldet).
   - Kungariket Man saknas 1272–1343.

   Ytan och luckorna står i `data/empires/norgesvaldet.json` och `kungariket-man.json`. Om de stämmer med Cliopatria är inte kontrollerat.
8. **Datumgränsen och polarområdena:** en täckning som korsar 180° (Ryssland och Alaska, Stilla havet) eller når polerna behöver delas vid 180° före förenklingen, så att `polygonize` och `coverage_simplify` inte drar gränser tvärs över kartan.
9. **Prov i CI och färre undantag (kräver DasKrokodils ja):** lägg till `pip install 'shapely>=2.1'` i arbetsflödet, så att enhetsprovet körs för varje pull request. Ta bort de `OVERRIDES` och `DECIMALS` som bara finns mot överlapp (#1721, #1743, #1744), när täckningen ersätter dem.
