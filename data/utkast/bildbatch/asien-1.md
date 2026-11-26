# Granskningslista för bildomgång asien-1

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=34 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 34. **Med minst en användbar kandidat:** 10. **Utan kandidat:** 24.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `asien-1-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/asien-1-lista.txt`.

**Flaggorna** avvisar inget, de säger vad du ska titta efter:

- `karta`: karta: säg i bildtexten om kartan är samtida eller ritad senare
- `nutida-foto`: verkets datum enligt filsidan är 1990 eller senare för en händelse före 1900: bildtexten säger "Nutida foto (år) av …, inte från händelsens tid"
- `datum-osakert`: filsidan anger bara filens datum (ofta uppladdningen), 1990 eller senare: kontrollera om det är ett nutida foto eller ett äldre verk
- `staende`: stående eller nästan kvadratisk bild: 4:3-utsnittet tar bort mer än 20 % av höjden; skriv passa-in i tredje kolumnen i listan för att visa hela
- `konstverk`: modernt konstverk (monument, staty, skulptur, relief, väggmålning)? kontrollera frihet för panorama i landet och konstnärens dödsår
- `samma-fil`: samma fil föreslås för flera händelser i omgången: välj den för högst en
- `licens-risk`: licensen är tillåten men riskabel (till exempel public domain bara i USA, PD-self med annan licens, "eget verk" av en gammal bild): läs filsidan särskilt noga
- `smal`: smalare än 800 px: blir suddig i kortet
- `ur-sokning`: ur fritextsökning, inte Wikidatas bild: kontrollera särskilt att den visar händelsen
- `licens-flagga`: licensen kunde inte avgöras av programmet: en människa bedömer den på filsidan

## 1. `baishiya-denisovaner`: Denisovaner på Tibetanska högplatån (158000 f.Kr., Baishiya-grottan i Gansu, Kina, på Tibetanska högplatån)

Wikidata: [Q63435825](https://www.wikidata.org/wiki/Q63435825). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Deep Tibetan admixture graph modeling.webp](https://commons.wikimedia.org/wiki/File:Deep_Tibetan_admixture_graph_modeling.webp) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Chi-Chun Liu, David Witonsky, Anna Gosling, Ju Hyeon Lee, Harald Ringbauer, Richard Hagan, Nisha Patel, Raphaela Stahl, John Novembre, Mark Aldenderfer, Christina Warinner, Anna Di Rienzo & Choongwon Jeong | 2022-03-08 / 2023-05-12 09:28:05 | 1350 × 1478 | nutida-foto, staende, ur-sokning |
- Nr 1: beskrivning: Although deriving 80–92% of their ancestry from a lineage related to Upper_YR_LN (Supplementary Table 4), the aMMD and present-day Sherpa/Tibetans are not adequately modeled as a sister clade to Upper_YR_LN, as expected… · kategorier: Genetic models; Human genetic diversity; Human genetics

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `homo-erectus-ngandong`: Homo erectus vid Ngandong på Java (115000 f.Kr., Ngandong vid floden Solo, Centraljava (Indonesien))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ngandong 7-Homo erectus.jpg](https://commons.wikimedia.org/wiki/File:Ngandong_7-Homo_erectus.jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Ryan Somma from Occoquan, USA | Unknown date Date, time or both in the file Exif metadata are incorrect/invalid. / 2014-05-13 18:15:59 | 1420 × 1120 | ur-sokning |
| 2 | [File:Reproducciones de cráneos de homo erectus. Museo Arqueológico Nacional de España.jpg](https://commons.wikimedia.org/wiki/File:Reproducciones_de_cr%C3%A1neos_de_homo_erectus._Museo_Arqueol%C3%B3gico_Nacional_de_Espa%C3%B1a.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Dorieo | 2015-09-22 11:23:18 / 2019-02-23 11:53:30 | 4000 × 2336 | nutida-foto, ur-sokning |
| 3 | [File:Ngandong 13 NMNH.jpg](https://commons.wikimedia.org/wiki/File:Ngandong_13_NMNH.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Jonathan Chen | 2024-07-31 11:45:27 / 2024-09-03 06:31:43 | 1859 × 1348 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Taken at the David H. Koch Hall of Human Origins at the Smithsonian Natural History Museum. www.ideonexus.com · kategorier: Ngandong 7
- Nr 2: beskrivning: Reproducciones de cráneos de homo erectus. Museo Arqueológico Nacional de España.. Descripcones de izquierda a derecha: Reproducción de una bóveda craneal, recuperada en la cueva de Sangirán (isla de Java, Indonesia), a… · kategorier: Homo erectus skulls; Human skulls in museums; Ngandong fossils; Replicas of skulls
- Nr 3: beskrivning: Homo erectus skull cast (Ngandong 13) on display at the Smithsonian's National Museum of Natural History. · kategorier: Homo erectus skulls; Ngandong fossils; Prehistoric human skulls in the National Museum of Natural History, USA

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `homo-floresiensis`: Homo floresiensis på Flores (98000 f.Kr., Liang Bua på Flores, Indonesien)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Homo floresiensis cave.jpg](https://commons.wikimedia.org/wiki/File:Homo_floresiensis_cave.jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Rosino | 2007-08-18 00:29 / 2008-08-16 03:26:22 | 3008 × 2000 | nutida-foto, ur-sokning |
| 2 | [File:Homo floresiensis (femme de flores, dite Flora).JPG](https://commons.wikimedia.org/wiki/File:Homo_floresiensis_(femme_de_flores,_dite_Flora).JPG) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Scailyna | 2014-09-20 11:14:48 / 2015-09-24 21:37:31 | 3618 × 2723 | nutida-foto, ur-sokning |
| 3 | [File:Homo floresiensis (femme de flores, dite Flora) - 2.JPG](https://commons.wikimedia.org/wiki/File:Homo_floresiensis_(femme_de_flores,_dite_Flora)_-_2.JPG) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Scailyna | 2014-09-20 11:15:12 / 2015-09-24 21:37:32 | 2904 × 3349 | nutida-foto, staende, ur-sokning |
- Nr 1: beskrivning: Cave where the remains of Homo floresiensis were discovered in 2003, Lian Bua , Flores, Indonesia [2007]. · kategorier: Archaeological excavations; Caves of Flores; Homo floresiensis; Lit cave entrances; Stalactites; Valued images of Indonesia
- Nr 2: beskrivning: Age estimé : 18 000 ans Provient d'Indonésie : Flores, grotte de Liang Bua · kategorier: Homo floresiensis skulls
- Nr 3: beskrivning: Age estimé : 18 000 ans Provient d'Indonésie : Flores, grotte de Liang Bua · kategorier: Homo floresiensis skulls

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `tam-pa-ling`: Homo sapiens i Tam Pà Ling i Laos (75000 f.Kr., Grottan Tam Pà Ling i norra Laos)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Taphonomy.jpg](https://commons.wikimedia.org/wiki/File:Taphonomy.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Bioanthropologist1 | 2025-12-22 / 2025-12-22 18:34:52 | 2979 × 3358 | nutida-foto, staende, ur-sokning |
| 2 | [File:Early presence of Homo sapiens in Southeast Asia by 86–68 kyr at Tam Pà Ling, Northern Laos - Figure 2.webp](https://commons.wikimedia.org/wiki/File:Early_presence_of_Homo_sapiens_in_Southeast_Asia_by_86%E2%80%9368_kyr_at_Tam_P%C3%A0_Ling,_Northern_Laos_-_Figure_2.webp) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | Sarah E. Freidline et al | 2023-06-13 / 2023-06-13 19:38:07 | 685 × 593 | nutida-foto, smal, ur-sokning |
| 3 | [File:Early presence of Homo sapiens in Southeast Asia by 86–68 kyr at Tam Pà Ling, Northern Laos - Figure 1.webp](https://commons.wikimedia.org/wiki/File:Early_presence_of_Homo_sapiens_in_Southeast_Asia_by_86%E2%80%9368_kyr_at_Tam_P%C3%A0_Ling,_Northern_Laos_-_Figure_1.webp) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | Sarah E. Freidline et al | 2023-06-13 / 2023-06-13 19:38:07 | 685 × 617 | nutida-foto, smal, ur-sokning |
- Nr 1: beskrivning: fossil record (rectangular image): https://en.wikipedia.org/wiki/Fossil#/media/File:Fossil_Diversity.png 2023 PaleoNeolitic Silhouettes: Population: https://www.phylopic.org/images/22a441e9-f828-4b14-8d62-4cb62f771844/h… · kategorier: Montages of science communications; Taphonomy
- Nr 2: beskrivning: a Medial view indicating the inferior portion of the tibial tuberosity; b left lateral view indicating the interosseous crest; c posterior view indicating the vertical line; d anterior view; e distal view; f proximal vi… · kategorier: Early presence of Homo sapiens in Southeast Asia by 86–68 kyr at Tam Pà Ling, Northern Laos; Photographs of human tibia
- Nr 3: beskrivning: a Anterior view of the left superciliary arch and supraorbital margin, and portions of the frontal squama and temporal line; b endocranial surface including some of the left orbital plate and frontal crest; c left later… · kategorier: Early presence of Homo sapiens in Southeast Asia by 86–68 kyr at Tam Pà Ling, Northern Laos; Photographs of human frontal bone

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `homo-luzonensis`: Homo luzonensis på Luzon (65000 f.Kr., Callaogrottan på Luzon, Filippinerna)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:HomoLuzonensisRestoration.jpg](https://commons.wikimedia.org/wiki/File:HomoLuzonensisRestoration.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Luzonensis | 2019-04-18 / 2019-04-20 16:47:37 | 1080 × 794 | nutida-foto, ur-sokning |
| 2 | [File:Homo luzonensis metatarsal.jpg](https://commons.wikimedia.org/wiki/File:Homo_luzonensis_metatarsal.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Luzonensis | 2019-04-23 / 2019-04-24 05:07:58 | 1595 × 1230 | nutida-foto, ur-sokning |
| 3 | [File:LuzonensisMolars.jpg](https://commons.wikimedia.org/wiki/File:LuzonensisMolars.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Luzonensis | 2019-05-26 16:29:34 / 2019-05-27 00:41:04 | 2208 × 1242 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: A mostly hypothetical reconstruction of Homo luzonensis, a newly-described species of primitive human from Luzon, Philippines. · kategorier: Homo luzonensis; Speculative paleoart
- Nr 2: beskrivning: CCH1, a third metatarsal bone (MT3) discovered on May 5, 2007 in Callao Cave, belonging to Homo luzonensis, a species of primitive human. · kategorier: Homo luzonensis; Human metatarsus; Museum collections from the Philippines
- Nr 3: beskrivning: Five teeth attributed to Homo luzonensis. · kategorier: Hominidae fossils; Homo luzonensis

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `sabeltandade-kattungen-i-jakutien`: Den frusna sabeltandade kattungen i Jakutien (35070 f.Kr., Floden Badjaricha, biflod till Indigirka, Jakutien, Ryssland)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Homotherium latidens cub mummy fig1.webp](https://commons.wikimedia.org/wiki/File:Homotherium_latidens_cub_mummy_fig1.webp) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | A. V. Lopatin, M. V. Sotnikova, A. I. Klimovsky, A. V. Lavrov, A. V. Protopopov, D. O. Gimranov & E. V. Parkhomchuk | 2024-11-14 / 2024-11-15 04:10:24 | 1926 × 907 | nutida-foto, ur-sokning |
| 2 | [File:Homotherium and lion cub skulls.png](https://commons.wikimedia.org/wiki/File:Homotherium_and_lion_cub_skulls.png) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | A. V. Lopatin, M. V. Sotnikova, A. I. Klimovsky, A. V. Lavrov, A. V. Protopopov, D. O. Gimranov & E. V. Parkhomchuk | 2024-11-14 / 2024-11-15 20:25:35 | 1858 × 1223 | nutida-foto, ur-sokning |
| 3 | [File:Homotherium cub - Lopatin et al 2024.tif](https://commons.wikimedia.org/wiki/File:Homotherium_cub_-_Lopatin_et_al_2024.tif) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | Lopatin et al. | 2024 / 2024-11-15 17:11:24 | 1926 × 907 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: The frozen mummy of Homotherium latidens (Owen, 1846), specimen DMF AS RS, no. Met-20-1, Russia, Republic of Sakha (Yakutia), Indigirka River basin, Badyarikha River; Upper Pleistocene: (A) external appearance; (B) skel… · kategorier: Homotherium fossils; Homotherium latidens mummies
- Nr 2: beskrivning: Skulls of three-week-old large felid cubs, left lateral view (A, C) and dorsal view (B, D): A, B, Homotherium latidens (Owen, 1846), specimen DMF AS RS, no. Met-20-1, frozen mummy, 3D computer models (image is reconstru… · kategorier: Homotherium latidens mummies; Homotherium skulls; Panthera leo skulls
- Nr 3: beskrivning: The frozen mummy of Homotherium latidens (Owen, 1846), specimen DMF AS RS, no. Met-20-1, Russia, Republic of Sakha (Yakutia), Indigirka River basin, Badyarikha River; Upper Pleistocene: (A) external appearance; (B) skel… · kategorier: Homotherium fossils; Homotherium latidens mummies

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `xianrendong-keramik`: Keramik under istiden i Xianrendong (18000 f.Kr., Xianrendonggrottan i Wannian, Jiangxi, Kina)

Wikidata: [Q2812194](https://www.wikidata.org/wiki/Q2812194). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Wannian Xianrendong yizhi 8789.jpg](https://commons.wikimedia.org/wiki/File:Wannian_Xianrendong_yizhi_8789.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Zhangzhugang | 2011-05-15 / 2011-05-16 10:32:47 | 1800 × 1200 | nutida-foto |
- Nr 1: beskrivning: ​江西万年仙人洞遗址，全国重点文物保护单位 · kategorier: Signs of the Major Historical and Cultural Site Protected at the National Level in Jiangxi; Xianrendong & Diaotonghuan Site

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `torressundet-bildas`: Havet skiljer Nya Guinea från Australien (10000 f.Kr., Torressundet mellan Kap York i Australien och Nya Guinea)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:C. Homann. Map of Asia. 1730. Caucasus.jpg](https://commons.wikimedia.org/wiki/File:C._Homann._Map_of_Asia._1730._Caucasus.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Johann Christoph Homann | circa 1730 date QS:P571,+1730-00-00T00:00:00Z/9,P1480,Q5727902 (undated) / 2014-08-20 08:49:40 | 1287 × 640 | karta, ur-sokning |
| 2 | [File:Australia and the Great Barrier Reef (MODIS 2018-04-30).jpg](https://commons.wikimedia.org/wiki/File:Australia_and_the_Great_Barrier_Reef_(MODIS_2018-04-30).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Jeff Schmaltz, MODIS Land Rapid Response Team, NASA GSFC | Taken on 26 April 2018 / 2024-02-17 01:47:07 | 4153 × 3959 | nutida-foto, staende, ur-sokning |
| 3 | [File:Portugal Império total.png](https://commons.wikimedia.org/wiki/File:Portugal_Imp%C3%A9rio_total.png) | commons-sok | Public domain (trolig); filsidan: flagga – licensen är inte tillåten: fair ({{PD-user-en}}, {{Copyrighted free use}}; API: "Public domain"); motsägelse: en tillåten och en otillåten licens anges | The Ogre at English Wikipedia / Later versions were uploaded by The Red Hat of Pat Ferrick at English Wikipedia . | 30 March 2007 (original upload date) / 2010-07-25 12:53:55 | 1425 × 625 | karta, nutida-foto, ur-sokning, licens-flagga |
- Nr 1: beskrivning: A rare and attractive 18th century map of Asia by German map publisher Johann Christoph Homann. Covers the entire continent of Asia as well as parts of Europe and northeastern Africa. This is essentially a revised and u… · kategorier: 1730s maps of Turkey; 1730s maps of Ukraine; 1730s maps of the Caucasus; 1730s maps of the Russian Empire; 18th-century maps of the Black Sea; Details of old maps of Asia
- Nr 2: beskrivning: One of the most easily recognizable and unique landforms of Australia, the Cape York Peninsula juts about 500 miles (800 km) northward from the Jardine River to the Torres Strait. The “Tip” –as it is sometimes called -… · kategorier: 2018 satellite pictures; Photos of Australia by the Terra (satellite) MODIS; Satellite pictures of the Great Barrier Reef
- Nr 3: beskrivning: An anachronous map of the Portuguese Empire (1415-1999). Red - actual possessions Olive green - explorations Orange - areas of influence and trade Pink - claims of sovereignty Light green - trading posts Blue - main sea… · kategorier: Maps of sea routes; Maps of the Portuguese Empire; Maps of the history of India; Maps using Tordesillas prime meridian

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `jerikos-torn`: Tornet i Jeriko (8000 f.Kr., Tell es-Sultan, Jeriko, Västbanken)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ausgrabungen bei Tell es-Sultan (3709391491).jpg](https://commons.wikimedia.org/wiki/File:Ausgrabungen_bei_Tell_es-Sultan_(3709391491).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | random exposure | 2009-04-24 11:23 / 2014-08-17 06:39:31 | 1024 × 768 | nutida-foto, ur-sokning |
| 2 | [File:Jericho Neolitic Tower P1190761.JPG](https://commons.wikimedia.org/wiki/File:Jericho_Neolitic_Tower_P1190761.JPG) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Deror_avi | 2012-12-05 12:20:13 / 2012-12-13 18:22:31 | 4000 × 3000 | nutida-foto, ur-sokning |
| 3 | [File:Jericho Neolitic Tower P1190752.JPG](https://commons.wikimedia.org/wiki/File:Jericho_Neolitic_Tower_P1190752.JPG) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Deror_avi | 2012-12-05 12:16:04 / 2012-12-13 17:43:25 | 4000 × 3000 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: ...die die Anfänge der wahrscheinlich ältesten Stadt der Welt freilegen. · kategorier: Tower of Jericho
- Nr 2: beskrivning: The Neolitic Tower, Tell Es Sultan, Jericho · kategorier: Tower of Jericho
- Nr 3: beskrivning: The Neolitic Tower, Tell Es Sultan, Jericho · kategorier: Tower of Jericho

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `tygerna-i-tjortovy-vorota`: Vävda tyger i grottan Tjortovy Vorota (7451 f.Kr., Grottan Tjortovy Vorota nära Dalnegorsk, Primorje kraj, Ryssland)

Wikidata: [Q30590768](https://www.wikidata.org/wiki/Q30590768). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Chertovy Vorota cave.jpg](https://commons.wikimedia.org/wiki/File:Chertovy_Vorota_cave.jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Романвер | 2016-02-04 13:12:24 / 2017-05-10 02:12:53 | 1944 × 2592 | nutida-foto, staende |
- Nr 1: beskrivning: Выход из пещеры · kategorier: Devil's Gate cave

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `qafzeh-och-skhul`: Tidiga Homo sapiens utanför Afrika i Qafzeh och Skhūl? (128000 f.Kr.)
- `sodra-kina-tidiga-tander`: Omstridda tidiga fynd av Homo sapiens i södra och centrala Kina (125000 f.Kr.)
- `denisova-11`: Denisova 11: barn till en neandertalare och en denisovan (116000 f.Kr.)
- `al-wusta`: Ett tidigt fynd av Homo sapiens i Arabien (88000 f.Kr.)
- `gua-dagang-arkaisk-manniska`: En arkaisk människa på Borneo (53000 f.Kr.)
- `utbrottet-som-skapade-maninjausjon`: Utbrottet som skapade Maninjausjön (50051 f.Kr.)
- `leang-karampuang`: Grottmålningar med en berättelse på Sulawesi (49200 f.Kr.)
- `pil-och-bage-i-fa-hien-lena`: Pil och båge i Fa-Hien Lena (46051 f.Kr.)
- `mammutkalven-ljuba`: Mammutkalven Ljuba dör i leran (40051 f.Kr.)
- `tonfisk-i-jerimalai`: Fiske i grottan Jerimalai (40051 f.Kr.)
- `amputationen-i-liang-tebo`: En amputation som läkte i Liang Tebo (29570 f.Kr.)
- `baturs-kalderor`: Vulkanen Batur rasar samman i två steg (27351 f.Kr.)
- `obsidian-fran-nya-britannien`: Obsidian från Nya Britannien förs över havet (21050 f.Kr.)
- `kuskusen-till-nya-irland`: Kuskusen kommer till Nya Irland (18000 f.Kr.)
- `havet-dranker-sundaland`: Havet dränker Sundaland (16051 f.Kr.)
- `sutlej-lamnar-sin-gamla-dal`: Sutlej lämnar sin gamla dal (13051 f.Kr.)
- `noshorning-i-vargvalpens-mage`: Ullhårig noshörning i en vargvalps mage (12451 f.Kr.)
- `persiska-viken-fylls`: Havet fyller Persiska viken efter istiden (10051 f.Kr.)
- `vaxtresterna-i-spirit-cave`: Växtresterna i Spirit Cave (9800 f.Kr.)
- `havet-fyller-palksundet`: Havet fyller Palksundet (9751 f.Kr.)
- `keramiken-i-gosan-ri`: Tidig keramik i Gosan-ri på Jeju (8000 f.Kr.)
- `ulleungdos-kaldera-bildas`: Utbrottet som gav Ulleungdo dess kaldera (8000 f.Kr.)
- `hundarna-pa-zjochovon`: Hundarna på Zjochovön (7575 f.Kr.)
- `salfangst-vid-bajkalsjon`: Sälfångst vid Bajkalsjön (7071 f.Kr.)

## Val 2026-11-26 (#2056 och #2057)

14 av 40 händelser fick bild, 5 har en utsedd kandidat som inte kunde hämtas (`asien-1-ej-hamtade.txt`), 21 är utan bild. Filsidorna öppnades via `action=raw` och bilderna granskades visuellt. Förhistoria: fossil, fyndplatser och landskap, inga ansiktsrekonstruktioner (beslut 2026-11-14).

- Ur listan: `homo-erectus-ngandong` (Ngandong 7, museiutställning), `homo-floresiensis` (Liang Bua), `homo-luzonensis` (mellanfotsben), `sabeltandade-kattungen-i-jakutien` (figur ur Lopatin m.fl. 2024), `xianrendong-keramik` (skylt), `jerikos-torn`, `tygerna-i-tjortovy-vorota` (grottöppning).
- Avvisat ur listan: kartan och diagrammet för `baishiya-denisovaner`, `torressundet-bildas` (karta över Kaukasus, satellitbild av hela Australien, en bild med otillåten licens) och figurerna för `tam-pa-ling`.
- Egen sökning: `tobautbrottet` (ASTER), `baturs-kalderor`, `denisovaner` (Denisovagrottan), `qafzeh-och-skhul` (ingången), `leang-karampuang` (grottan), `havet-fyller-palksundet` (MODIS), `misliya` (grottan).
- Programmet flaggade Denisovabilden för `denisova-11` (Wikimapia-mall); den används inte.
