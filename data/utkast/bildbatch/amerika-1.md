# Granskningslista för bildomgång amerika-1

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=34 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 34. **Med minst en användbar kandidat:** 18. **Utan kandidat:** 16.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `amerika-1-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/amerika-1-lista.txt`.

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

## 1. `white-sands-fotspar`: Fotspår från istiden vid White Sands (21500 f.Kr., White Sands nationalpark, New Mexico, USA)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ice Age Human Footprints (a45c5031-d519-43f0-8d64-7b81d653c3ff).JPG](https://commons.wikimedia.org/wiki/File:Ice_Age_Human_Footprints_(a45c5031-d519-43f0-8d64-7b81d653c3ff).JPG) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | NPS | Taken on 30 January 2020 / 2023-08-14 22:32:19 | 6000 × 4000 | nutida-foto, ur-sokning |
| 2 | [File:Archeologists Uncover Ice Age Footprints (7970cc77-e177-4e4f-a8dd-2ec1289d14fe).JPG](https://commons.wikimedia.org/wiki/File:Archeologists_Uncover_Ice_Age_Footprints_(7970cc77-e177-4e4f-a8dd-2ec1289d14fe).JPG) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | NPS | Taken on 14 January 2020 / 2023-08-14 21:08:25 | 4011 × 2416 | nutida-foto, ur-sokning |
| 3 | [File:Black and White Footprints (b0d6859c-17a5-4254-8901-cc116f9893e4).JPG](https://commons.wikimedia.org/wiki/File:Black_and_White_Footprints_(b0d6859c-17a5-4254-8901-cc116f9893e4).JPG) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | NPS | Taken on 15 January 2020 / 2023-08-14 23:00:32 | 4592 × 3448 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Seven human footprints preserved in Ice Age gypsum cement. Ice Age footprints from adolescent female estimated to 23,000-21,000 years ago. During this time warming and drying events caused Lake Otero to significantly dr… · kategorier: Archaeological sites in White Sands National Park; Footprints; Fossils; Gypsum in New Mexico; Ice ages
- Nr 2: beskrivning: Two researchers using two different methods to uncover footprints. Researchers must be careful to protect each archeological find whilst finding ways to best uncover their discoveries. Two methods include using a brush… · kategorier: Archaeological sites in White Sands National Park; Archaeologists; Brushes; Excavations; Fossil hominin footprints
- Nr 3: beskrivning: Aerial image of three fossilized human footprints in black and white. Black and white photo filters aid in contrasting images and better illustrate the depth and impressions of the footprints in the sediment. Keywords:… · kategorier: Archaeological sites in White Sands National Park; Footprints; Fossils; Gypsum in New Mexico; Ice ages

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `monte-verde`: Boplatsen Monte Verde i Chile (12500 f.Kr., Monte Verde, Chile)

Wikidata: [Q975775](https://www.wikidata.org/wiki/Q975775). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Monte Verde 3.JPG](https://commons.wikimedia.org/wiki/File:Monte_Verde_3.JPG) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Rodolfo Ditzel Lacoa | 2012-09-30 15:45:46 / 2012-09-30 22:47:28 | 4608 × 2216 | nutida-foto, konstverk |
- Nr 1: beskrivning: This is a photo of a national monument in Chile: · kategorier: Monte Verde, Chile

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `clovis-kulturen`: Clovis-kulturen i Nordamerika (11100 f.Kr., Blackwater Draw nära Clovis, New Mexico, USA (fynd över stora delar av Nordamerika))

Wikidata: [Q3485378](https://www.wikidata.org/wiki/Q3485378). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Clovis spear point, British Museum.jpg](https://commons.wikimedia.org/wiki/File:Clovis_spear_point,_British_Museum.jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: flagga CC BY-SA 4.0 – API:et säger "CC BY-SA 4.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Photograph by Mike Peel ( www.mikepeel.net ). | 2010-09-12 / 2010-09-26 07:52:34 | 1770 × 2585 | nutida-foto, staende, licens-flagga |
- Nr 1: beskrivning: Clovis spear point. Object 5 of 100. British Museum · kategorier: A History of The World in 100 Objects; Clovis points

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `havet-bryter-igenom-vid-berings-sund`: Havet bryter igenom vid Berings sund (9551 f.Kr., Berings sund mellan Tjuktjerhalvön och Alaska; punkten är tröskeln i sundet enligt studien)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:1772 Vaugondy and Diderot Map of the Pacific Northwest and the Northwest Passage - Geographicus - DeFonteAutres-vaugondy-1772.jpg](https://commons.wikimedia.org/wiki/File:1772_Vaugondy_and_Diderot_Map_of_the_Pacific_Northwest_and_the_Northwest_Passage_-_Geographicus_-_DeFonteAutres-vaugondy-1772.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | http://www.geographicus.com/mm5/cartographers/vaugondy.txt | 1772 (undated) / 2011-03-17 19:22:17 | 4000 × 3182 | karta, ur-sokning |
| 2 | [File:Edited by Donald W. Hood and John A. Calder" (1981).jpg](https://commons.wikimedia.org/wiki/File:Edited_by_Donald_W._Hood_and_John_A._Calder%22_(1981).jpg) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Internet Archive Book Images | 1981-01-01 / 2023-09-12 05:43:53 | 2116 × 1636 | karta, ur-sokning |
| 3 | [File:Bering Strait ESA390553.jpg](https://commons.wikimedia.org/wiki/File:Bering_Strait_ESA390553.jpg) | commons-sok | CC BY-SA 3.0 igo (trolig); filsidan: godkand CC BY-SA 3.0 IGO | European Space Agency | 2018-02-23 / 2018-02-23 16:56:53 | 2000 × 1335 | karta, nutida-foto, ur-sokning |
- Nr 1: beskrivning: One of the most splendid combinations of hard fact and speculative fantasy to appear in the history of cartography. This map, prepared by Joseph-Nicholas de Delisle 1762 and republished by Vaugondy in 1772, covers parts… · kategorier: 1772 maps; Northwest Passage; Old maps of Asia; Old maps of North America; Old maps of phantom islands; Old maps of the Arctic
- Nr 2: beskrivning: Title: The Eastern Bering Sea Shelf : oceanography and resources / edited by Donald W. Hood and John A. Calder Identifier: easternberings00hood Year: 1981 (1980s) Authors: Hood, D. W. (Donald Wilbur), 1918-; Calder, Joh… · kategorier: 1980s maps of Alaska
- Nr 3: beskrivning: The Copernicus Sentinel-1 mission takes us over the Bering Strait, which connects the Pacific and Arctic Oceans between Russia and the US state of Alaska. The image was created by combining three radar scans of 11 Decem… · kategorier: Sentinel-1 images

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `lapa-do-santo-begravningar`: Begravningsritualer i Lapa do Santo (8600 f.Kr., Lapa do Santo i Lagoa Santa-karsten, Minas Gerais, Brasilien)

Wikidata: [Q56678621](https://www.wikidata.org/wiki/Q56678621). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Lapa do Santo - Overview mais esqueleto para apresentar.jpg](https://commons.wikimedia.org/wiki/File:Lapa_do_Santo_-_Overview_mais_esqueleto_para_apresentar.jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: flagga CC BY-SA 4.0 – API:et säger "CC BY-SA 4.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Strauss MAE-USP | 2018-10-06 10:03:56 / 2018-10-06 13:07:05 | 1742 × 865 | nutida-foto, licens-flagga |
- Nr 1: beskrivning: Lapa do Santo - Vista aérea do maciço e esqueleto humano de cinco anos de idade. Os padrões de sepultamento do sítio arqueológico Lapa do Santo (Holoceno Inicial, Brasil) , p. 254 - Emílio Goeldi. A Lapa do Santo é um s… · kategorier: Lapa do Santo archaeological site; Museu de Arqueologia e Etnologia da Universidade de São Paulo

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `koster-hundgravar`: Amerikas äldsta kända hundgravar (7900 f.Kr., Koster nära Eldred i Illinoisflodens dal, Illinois, USA)

Wikidata: [Q16893638](https://www.wikidata.org/wiki/Q16893638). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:COLLEGE STUDENTS WORK WITH ARCHAEOLOGISTS AT "KOSTER DIG" AN ANCIENT INDIAN BURIAL SITE - NARA - 552495.jpg](https://commons.wikimedia.org/wiki/File:COLLEGE_STUDENTS_WORK_WITH_ARCHAEOLOGISTS_AT_%22KOSTER_DIG%22_AN_ANCIENT_INDIAN_BURIAL_SITE_-_NARA_-_552495.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Arthur Greenberg | June 1973 date QS:P571,+1973-06-00T00:00:00Z/10 / 2011-10-29 07:48:05 | 3000 × 2010 | – |
- Nr 1: kategorier: 1973 in archaeology; Archaeological sites in Illinois; DOCUMERICA photographs by Arthur Greenberg; DOCUMERICA photographs of Illinois; June 1973 in Illinois; Pre-Columbian cultures of North America

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `cueva-de-las-manos`: Händerna i Cueva de las Manos (7300 f.Kr., Cueva de las Manos, Santa Cruz, Argentina)

Wikidata: [Q223385](https://www.wikidata.org/wiki/Q223385). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:SantaCruz-CuevaManos-P2210651b.jpg](https://commons.wikimedia.org/wiki/File:SantaCruz-CuevaManos-P2210651b.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand-med-not Public domain – flera licenser: Public domain, CC BY-SA 3.0, CC BY-SA 2.5; GFDL anges också (dubbellicens) | Mariano | 2005-08-12 / 2024-10-25 04:12:24 | 1600 × 1200 | nutida-foto |
- Nr 1: beskrivning: Hands at the Cuevas de las Manos upon Río Pinturas , near the town of Perito Moreno in Santa Cruz Province , Argentina . Picture taken by me in 2005. · kategorier: Cave paintings in Cueva de las Manos, Río Pinturas; Rock paintings of hands

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `kopparkulturen-vid-stora-sjoarna`: Kopparkulturen vid de stora sjöarna (6500 f.Kr., Området kring de stora sjöarna, Nordamerika (punkten: Oconto, Wisconsin))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Atlas Van der Hagen-KW1049B11 075 14-Aangezicht op het pavilioen van Samson en het meer van- sijn Hoogheyt.jpeg](https://commons.wikimedia.org/wiki/File:Atlas_Van_der_Hagen-KW1049B11_075_14-Aangezicht_op_het_pavilioen_van_Samson_en_het_meer_van-_sijn_Hoogheyt.jpeg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Romeyn de Hooghe / Nicolaes Visscher II | circa 1685 date QS:P571,+1685-00-00T00:00:00Z/9,P1480,Q5727902 / 2015-07-18 12:51:48 | 5500 × 4509 | ur-sokning |
- Nr 1: beskrivning: The print shows the complex of pleasure gardens of Enghien near Brussels. The plan is part of a series of prints commissioned by Nicolaes Visscher II (1649-1702) and engraved by Romeyn de Hooghe (1645-1708). De Hooghe h… · kategorier: Atlas van der Hagen; Atlas van der Hagen (Volume 2); Jeu de mail in art; Parc d’Enghien in art; Prints by Romeyn de Hooghe; Prints published by Nicolaes Visscher II

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `mount-mazama-crater-lake`: Mount Mazama exploderar och Crater Lake bildas (5700 f.Kr., Crater Lake i Kaskadbergen, Oregon, USA)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Wizard Island, Crater Lake National Park, Oregon (219304137).jpg](https://commons.wikimedia.org/wiki/File:Wizard_Island,_Crater_Lake_National_Park,_Oregon_(219304137).jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Ken Lund from Reno, Nevada, USA | 2006-08-18 11:19 / 2025-12-09 15:04:16 | 1280 × 960 | nutida-foto, ur-sokning |
| 2 | [File:Wizard Island, Crater Lake National Park, Oregon (219303587).jpg](https://commons.wikimedia.org/wiki/File:Wizard_Island,_Crater_Lake_National_Park,_Oregon_(219303587).jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Ken Lund from Reno, Nevada, USA | 2006-08-18 11:12 / 2025-12-09 15:03:43 | 1280 × 960 | nutida-foto, ur-sokning |
| 3 | [File:Rhyodacite pumice fall deposit (Holocene; south of Grouse Hill, Crater Lake Caldera, Oregon, USA) 5.jpg](https://commons.wikimedia.org/wiki/File:Rhyodacite_pumice_fall_deposit_(Holocene;_south_of_Grouse_Hill,_Crater_Lake_Caldera,_Oregon,_USA)_5.jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | James St. John | 2012-08-04 16:43:50 / 2020-10-22 19:04:06 | 4288 × 2848 | karta, nutida-foto, ur-sokning |
- Nr 1: beskrivning: Wizard Island is a volcanic cinder cone which forms an island at the west end of Crater Lake in Crater Lake National Park, Oregon. The top of the island reaches 6,933 feet (2,113 m) above sea level, about 755 feet (230… · kategorier: Crater Lake
- Nr 2: beskrivning: Wizard Island is a volcanic cinder cone which forms an island at the west end of Crater Lake in Crater Lake National Park, Oregon. The top of the island reaches 6,933 feet (2,113 m) above sea level, about 755 feet (230… · kategorier: Crater Lake
- Nr 3: beskrivning: Rhyodacite pumice & volcanic ash in the Holocene of Orgeon, USA. Crater Lake is a large, deep, freshwater lake in the Cascade Range of America's Pacific Northwest. It formed about 7,700 years ago when an ancient volcano… · kategorier: Grouse Hill (Mt. Mazama); Holocene volcanism of Oregon; Pyroclastic rocks in Oregon; Rhyodacite pumice fall deposit (Holocene; south of Grouse Hill, Crater Lake Caldera, Oregon)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `san-agustins-statyer`: Stenstatyerna i San Agustín (5, San Agustín i departementet Huila, Colombia)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Parque Arqueológico de San Agustín-Mesita A 06.jpg](https://commons.wikimedia.org/wiki/File:Parque_Arqueol%C3%B3gico_de_San_Agust%C3%ADn-Mesita_A_06.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand-med-not CC BY-SA 4.0 – GFDL anges också (dubbellicens) | Bernard Gagnon | 2020-01-18 / 2020-12-02 19:27:58 | 4383 × 2922 | nutida-foto, konstverk, ur-sokning |
| 2 | [File:San Agustín Archaeological Park statue.jpg](https://commons.wikimedia.org/wiki/File:San_Agust%C3%ADn_Archaeological_Park_statue.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Sascha Grabow www.saschagrabow.com | 2009-12-30 / 2023-09-28 16:44:09 | 800 × 1007 | nutida-foto, konstverk, staende, ur-sokning |
| 3 | [File:Parque Arqueológico de San Agustín-Mesita A 04.jpg](https://commons.wikimedia.org/wiki/File:Parque_Arqueol%C3%B3gico_de_San_Agust%C3%ADn-Mesita_A_04.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand-med-not CC BY-SA 4.0 – GFDL anges också (dubbellicens) | Bernard Gagnon | 2020-01-18 / 2020-12-02 19:24:28 | 3177 × 4765 | nutida-foto, konstverk, staende, ur-sokning |
- Nr 1: beskrivning: Statues in Mesita A in San Agustín Archaeological Park, Colombia · kategorier: Parque Arqueológico de San Agustín - Mesita A; Stone sculptures in Colombia
- Nr 2: beskrivning: San Agustín Archaeological Park Statue · kategorier: Parque Arqueológico de San Agustín; Stone sculptures in Colombia
- Nr 3: beskrivning: Statue in Mesita A in San Agustín Archaeological Park, Colombia · kategorier: Parque Arqueológico de San Agustín - Mesita A; Stone sculptures in Colombia

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `moche-kulturen`: Mochekulturen och Señor de Sipán (100, Norra Perus kust, här Huaca Rajada vid Sipán (i dag Peru))

Wikidata: [Q208188](https://www.wikidata.org/wiki/Q208188). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Tomb of Lord of Sipán 05.jpg](https://commons.wikimedia.org/wiki/File:Tomb_of_Lord_of_Sip%C3%A1n_05.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Bernard Gagnon | 2014-11-24 / 2016-02-03 21:36:38 | 3470 × 2425 | nutida-foto, ur-sokning |
| 2 | [File:Tomb of Lord of Sipán 03.jpg](https://commons.wikimedia.org/wiki/File:Tomb_of_Lord_of_Sip%C3%A1n_03.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Bernard Gagnon | 2014-11-24 / 2025-05-09 14:52:36 | 5184 × 3456 | nutida-foto, ur-sokning |
| 3 | [File:Lord of Sipán tomb reconstruction. American Museum of Natural History.jpg](https://commons.wikimedia.org/wiki/File:Lord_of_Sip%C3%A1n_tomb_reconstruction._American_Museum_of_Natural_History.jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | Vicpeters | 2025-05-14 / 2025-05-17 22:03:39 | 4032 × 3024 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Skeleton of a sentry in the tomb of the Lord of Sipán, Huaca Rajada, Peru · kategorier: Royal tombs of Sipán
- Nr 2: beskrivning: Skeleton of a guardian in the tomb of the Lord of Sipán, Huaca Rajada, Peru · kategorier: Royal tombs of Sipán
- Nr 3: beskrivning: "Lord of Sipán" tomb reconstruction. American Museum of Natural History · kategorier: Hall of South American Peoples at American Museum of Natural History; May 2025 in Manhattan, New York City

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `befjadrade-ormens-tempel`: Den befjädrade ormens tempel i Teotihuacan (150, Teotihuacan, delstaten México, Mexiko)

Wikidata: [Q7698758](https://www.wikidata.org/wiki/Q7698758). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Teotihuacán, México, 2013-10-13, DD 80.JPG](https://commons.wikimedia.org/wiki/File:Teotihuac%C3%A1n,_M%C3%A9xico,_2013-10-13,_DD_80.JPG) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Diego Delso | 2013-10-13 12:43:09 / 2019-09-28 12:53:15 | 5419 × 2899 | nutida-foto |
- Nr 1: beskrivning: La Ciudadela, Teotihuacán, Mexico · kategorier: 2013 in Teotihuacán; Pirámide de la Serpiente Emplumada (Teotihuacán)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `glacier-peak-utbrott-omkring-200`: Vulkanen Glacier Peak får ett utbrott (150, Glacier Peak i Kaskadbergen, Washington, USA)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Glacier Peak (aerial view).jpg](https://commons.wikimedia.org/wiki/File:Glacier_Peak_(aerial_view).jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | brewbooks | 8 November 2006 (according to Exif data) / 2012-12-15 13:25:29 | 2592 × 1944 | nutida-foto, ur-sokning |
| 2 | [File:Crater Peak vent of Mount Spurr.jpg](https://commons.wikimedia.org/wiki/File:Crater_Peak_vent_of_Mount_Spurr.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | R. McGimsey (U.S. Geological Survey) | 1992-06-11 / 2008-02-04 20:25:37 | 1024 × 698 | nutida-foto, ur-sokning |
| 3 | [File:St Augustine Volcano, steaming peak of lava dome volcano, September 3, 1971 (GLACIERS 6804).jpg](https://commons.wikimedia.org/wiki/File:St_Augustine_Volcano,_steaming_peak_of_lava_dome_volcano,_September_3,_1971_(GLACIERS_6804).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Austin Post | Taken on 3 September 1971 / 2019-06-08 06:19:40 | 768 × 745 | smal, staende, ur-sokning |
- Nr 1: beskrivning: Glacier Peak is 3,213 meters (10,541 feet) stratovolcano, the 4th highest mountain in Washington (state); view from the south; Kodak Peak (1865 m, 6121 ft, bottom center); Indian Head Peak (2261 m, 7420 ft, right middle… · kategorier: Aerial photographs of clouds; Aerial photographs of the Cascade Range in Washington (state); Glacier Peak; Mountains with clouds; November 2006 in Washington (state); Valued images of Washington (state)
- Nr 2: beskrivning: Alaska Volcano Observatory scientist (upper right) observing hydrothermal activity inside the Crater Peak vent of Mount Spurr volcano stands on a rampart of pyroclastic debris deposited during the 1953 eruption. · kategorier: Crater glaciers; Crater walls (volcanism); Mount Spurr 1992 eruptions; Rims of volcanic craters; Vents (volcanism); Volcanic craters
- Nr 3: beskrivning: St. Augustine Volcano, steaming peak of lava dome volcano, September 3, 1971 · kategorier: 1971 eruptions of the Augustine Island Volcano; Glaciers in Alaska in September 1971; Photographs by Austin Post

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `torka-pa-yucatan-150-250`: Svår torka på Yucatánhalvön (150, Yucatánhalvön, Mexiko (punkten: Ría Lagartos, en av provplatserna))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:GOES-East Views Agricultural Fires in Yucatán Peninsula (49782370876).jpg](https://commons.wikimedia.org/wiki/File:GOES-East_Views_Agricultural_Fires_in_Yucat%C3%A1n_Peninsula_(49782370876).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | NOAA Satellites | 2020-03-24 14:57 / 2020-12-05 19:47:55 | 1920 × 1080 | nutida-foto, ur-sokning |
| 2 | [File:Fires in Mexico and Central America (14748).jpg](https://commons.wikimedia.org/wiki/File:Fires_in_Mexico_and_Central_America_(14748).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | NASA image created by Jesse Allen, Earth Observatory, using data obtained from the MODIS Rapid Response team. | Taken on 19 April 2005 / 2026-05-29 22:08:53 | 5200 × 5200 | nutida-foto, staende, ur-sokning |
- Nr 1: beskrivning: On March 24, 2020, the GOES-East satellite viewed the Yucatán Peninsula as prescribed fires peppered its northwestern coast. Its annual fire season, which lasts from March–May, is used to clear agricultural land and rep…
- Nr 2: beskrivning: Fires continued to burn across southern Mexico, the Yucatan Peninsula, and northern Central America on April 19, 2005. The smoke extends out over the water in both directions: north into the Gulf of Mexico (top), and so… · kategorier: 2005 MODIS images; 2005 in Central America; Fires in Mexico; NASA Earth Observatory in 2005; Photos by the Aqua (satellite) MODIS; Satellite pictures of 2005 wildfires

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `la-mojarra-stele-1`: Stelen från La Mojarra med istmisk skrift (156, La Mojarra vid floden Acula, Veracruz, Mexiko)

Wikidata: [Q2532833](https://www.wikidata.org/wiki/Q2532833). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Harvestermountainlord.jpg](https://commons.wikimedia.org/wiki/File:Harvestermountainlord.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | en:User:Maunus | 0156 / 2018-04-09 12:16:10 | 286 × 473 | smal, staende |
- Nr 1: beskrivning: Photograph of left side of La mojarra Stela 1 at the Museum of Anthropology at Xalapa, Vera Cruz, Mexico. · kategorier: Stela 1 of La Mojarra

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 16. `xitle-begraver-cuicuilco`: Vulkanen Xitle begraver Cuicuilco (245, Cuicuilco i Tlalpan, Mexico City (i dag Mexiko))

Wikidata: [Q1143307](https://www.wikidata.org/wiki/Q1143307). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Pirámide de Cuicuilco al Sur del Distrito Federal.jpg](https://commons.wikimedia.org/wiki/File:Pir%C3%A1mide_de_Cuicuilco_al_Sur_del_Distrito_Federal.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Felipe huerta hdez | 2010-02-14 13:43:51 / 2013-10-01 03:56:30 | 3777 × 2528 | nutida-foto, konstverk |
- Nr 1: beskrivning: This is a photo of a monument in Mexico, identified by ID · kategorier: Cuicuilco

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 17. `ilopango-utbrottet`: Vulkanutbrottet i Ilopango (431, Sjön Ilopango, El Salvador)

Wikidata: [Q105123270](https://www.wikidata.org/wiki/Q105123270). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Lake Ilopango Caldera.jpg](https://commons.wikimedia.org/wiki/File:Lake_Ilopango_Caldera.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | KMTRAGER | 2021-01-15 / 2021-01-15 14:00:32 | 1445 × 960 | nutida-foto, ur-sokning |
| 2 | [File:Lake Ilopango, El Salvado (ASTER).jpg](https://commons.wikimedia.org/wiki/File:Lake_Ilopango,_El_Salvado_(ASTER).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | NASA/METI/AIST/Japan Space Systems, and U.S./Japan ASTER Science Team | Taken on 5 March 2006 / 2023-06-25 11:36:15 | 2855 × 1538 | nutida-foto, ur-sokning |
| 3 | [File:Tierra Blanca Joven Ilopango eruption.jpg](https://commons.wikimedia.org/wiki/File:Tierra_Blanca_Joven_Ilopango_eruption.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Tadam | 2019-04-18 / 2019-04-18 09:37:59 | 652 × 600 | karta, nutida-foto, smal, ur-sokning |
- Nr 1: beskrivning: The TBJ eruption created a 8 x 11 km large caldera filled with water known as Lake Ilopango · kategorier: Aerial photographs of volcanoes in El Salvador; Ilopango Caldera; Tierra Blanca Joven eruption; Volcanoes in El Salvador
- Nr 2: beskrivning: Lake Ilopango is a crater lake which fills a volcanic caldera in central El Salvador, immediately east of the capital city San Salvador. The caldera collapsed most recently in about 500 AD, producing 20 times as much as… · kategorier: Ilopango; Photos of North America by ASTER; Satellite pictures of El Salvador
- Nr 3: beskrivning: Area of demographic collapse following the Ilopango eruption. based on file: Central american mountains.jpg and Figure 10.7 page 251 from "Eruptions that Shook the World" by Clive Oppenheimer, Cambridge University Press… · kategorier: Maps of volcanic eruptions; Maps of volcanoes in El Salvador; Tierra Blanca Joven eruption

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 18. `tainofolk-nar-bahamas`: Kanotfärder till Bahamas (500, Bahamas (punkten: Inagua, en av de föreslagna första anhalterna))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The merchant vessel - a sailor boy's voyages around the world (1884) (14593118478).jpg](https://commons.wikimedia.org/wiki/File:The_merchant_vessel_-_a_sailor_boy%27s_voyages_around_the_world_(1884)_(14593118478).jpg) | commons-sok | No restrictions (flagga); filsidan: flagga – licensen kunde inte avgöras (inga igenkända licensmallar; API: "No restrictions") | Internet Archive Book Images | 1884 / 2015-08-01 17:16:46 | 2944 × 1792 | ur-sokning, licens-flagga |
- Nr 1: beskrivning: Identifier : merchantvesselsa1884nord ( find matches ) Title : The merchant vessel : a sailor boy's voyages around the world Year : 1884 ( 1880s ) Authors : Nordhoff, Charles, 1830-1901 LaPlante, Charles. egr Wyllie, W.… · kategorier: Bahamas in the 1880s; The merchant vessel - a sailor boy's voyages around the world (1884)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `megafaunan-forsvinner-i-amerika`: Megafaunan försvinner i Amerika (11800 f.Kr.)
- `pumpan-tams-i-guila-naquitz`: Pumpan tämjs i Guilá Naquitz (8800 f.Kr.)
- `potatisen-tams`: Potatisen tämjs i Anderna (8000 f.Kr.)
- `obsidian-fran-oregon-under-huronsjon`: Obsidian från Oregon under Huronsjön (7050 f.Kr.)
- `majsen-tams-i-balsasdalen`: Majsen tämjs i Mexiko (7000 f.Kr.)
- `agassizsjon-toms`: Agassizsjön töms och klimatet kyls (6200 f.Kr.)
- `windover-gravarna`: Gravarna i Windover och omsorgen om en sjuk pojke (6050 f.Kr.)
- `indigo-i-huaca-prieta`: Indigoblå bomull i Huaca Prieta (4050 f.Kr.)
- `la-tolita-storhetstid`: Guld- och platinasmeder på La Tolita (90)
- `el-mollekulturen`: El Mollekulturen i norra Chile (300)
- `nya-grodor-hos-hohokam`: Hohokam får nya grödor genom handel (300)
- `havsytan-star-nastan-still-i-franska-polynesien`: Havsytan står nästan still i Franska Polynesien (350)
- `copans-kungaatt-grundas`: K'inich Yax K'uk' Mo' grundar Copáns kungaätt (426)
- `nazcas-puquios`: Nazcas underjordiska vattenledningar (puquios) (500)
- `tikals-nederlag-562`: Caracol besegrar Tikal (562)
- `wari-riket`: Wari-riket i Anderna (600)

## Val 2026-11-26 (#2091 och #2094)

14 av 40 händelser fick bild. Filsidorna kontrollerades via verktygets licenskontroll (`action=raw`) och bilderna granskades visuellt i en kontaktbild.

- Avvisat efter att bilden setts: `monte-verde` (park utan synliga lämningar), `pachacamac` (bilden visar hästar), `copans-kungaatt-grundas` (första kandidaten visade turister vid en ingångsbyggnad och byttes mot den hieroglyfiska trappan).
- Avstått på grund av kvarlevor, gravar och urfolks gravplatser: `lapa-do-santo-begravningar`, `koster-hundgravar`, `windover-gravarna`, `chinchorromumier`.
- Cueva de las Manos: verktyget valde "Public domain" (mallen PD-old gäller bergkonsten), men fotot är under CC BY-SA 3.0/2.5 och GFDL; den strängare CC BY-SA 3.0 används för fotot.
- Händelserna `missoulafloderna`, `bonnevillefloden`, `chinchorromumier`, `pachacamac`, `mogollonkulturen` och `casarabekulturen` saknades i den automatiska listan (de har `start` i stället för `year`); `missoulafloderna`, `pachacamac` och `mogollonkulturen` söktes manuellt.
- Egen sökning: `missoulafloderna`, `pachacamac`, `mogollonkulturen`, `nazcas-puquios`, `copans-kungaatt-grundas`, `tikals-nederlag-562`, `megafaunan-forsvinner-i-amerika`.
- Bildtexterna säger inte "världsarv" eftersom filsidorna inte anger det.
