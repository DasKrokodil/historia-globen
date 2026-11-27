# Granskningslista för bildomgång europa-2

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=35 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 35. **Med minst en användbar kandidat:** 16. **Utan kandidat:** 19.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `europa-2-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/europa-2-lista.txt`.

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

## 1. `ganggriften-i-rossberga`: Gånggriften i Rössberga (3500 f.Kr., Rössberga, cirka 10 km söder om Falköping, Västergötland, Sverige)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Rössberga 1, den 9 april 2006.JPG](https://commons.wikimedia.org/wiki/File:R%C3%B6ssberga_1,_den_9_april_2006.JPG) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Harri Blomberg | Taken on 9 April 2006 / 2006-04-12 22:17:35 | 2048 × 1536 | nutida-foto, ur-sokning |
| 2 | [File:Rössberga - KMB - 16000300034169.jpg](https://commons.wikimedia.org/wiki/File:R%C3%B6ssberga_-_KMB_-_16000300034169.jpg) | commons-sok | CC BY 2.5 (trolig); filsidan: godkand CC BY 2.5 | Bengt A. Lundberg | 26 April 2002 / 2017-06-09 14:17:10 | 768 × 512 | nutida-foto, smal, ur-sokning |
- Nr 1: beskrivning: En gånggrift i Rössberga i Falköpings kommun. Denna stenåldersgrav undersöktes 1962. Minst 128 individer begravdes där utifrån skelettfynden, men det var troligen fler. Det var ingen större skillnad i antal mellan män o… · kategorier: April 2006 in Västra Götaland County; Kambrosilurområdet; Passage graves in Falköping Municipality; Valtorps socken
- Nr 2: beskrivning: Notera Av dokumentationsskäl har originalbeskrivningen från Riksantikvarieämbetet behållits. Tillrättalägganden och alternativa beskrivningar bör införas separat från nedanstående information. Felaktigheter kan även anm… · kategorier: Kambrosilurområdet; Passage graves in Falköping Municipality; Photographs by Bengt A. Lundberg

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `kon-som-opererades-i-champ-durand`: En ko med ett hål i skallen i Champ-Durand (3400 f.Kr., Den befästa boplatsen Champ-Durand i Vendée, Frankrike)

Wikidata: [Q22963151](https://www.wikidata.org/wiki/Q22963151). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Nieul-autise champ-durand 07.jpg](https://commons.wikimedia.org/wiki/File:Nieul-autise_champ-durand_07.jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Liberliger | 2018-10-19 15:47:28 / 2018-10-20 18:57:07 | 6093 × 2877 | nutida-foto |
- Nr 1: beskrivning: Enceinte préhistorique de Champ Durand à Nieul-sur-l'Autise (85). · kategorier: Enceinte préhistorique de Champ Durand

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `skara-brae`: Stenbyn Skara Brae (3180 f.Kr., Skara Brae vid Bay of Skaill, Orkney, Skottland)

Wikidata: [Q816437](https://www.wikidata.org/wiki/Q816437). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Orkney Skara Brae.jpg](https://commons.wikimedia.org/wiki/File:Orkney_Skara_Brae.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Dr. John F. Burka | 2002-08-24 / 2006-01-14 21:19:44 | 800 × 533 | nutida-foto |
- Nr 1: beskrivning: Neolithic excavations at Skara Brae on Orkney in Scotland . · kategorier: Skara Brae

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `meteoritkratrarna-i-morasko`: Meteoritkratrarna i Morasko (3051 f.Kr., Morasko i norra Poznań, Polen)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Morasko krater zima.jpg](https://commons.wikimedia.org/wiki/File:Morasko_krater_zima.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) |  | – / 2005-05-26 18:23:40 | 1280 × 960 | datum-osakert, ur-sokning |
| 2 | [File:Morasko krater C.jpg](https://commons.wikimedia.org/wiki/File:Morasko_krater_C.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Szczureq | 2014-06-06 14:45 / 2014-07-28 12:28:22 | 3972 × 1495 | nutida-foto, ur-sokning |
| 3 | [File:Morasko Natural Reserve, COVID19 maseczka.jpg](https://commons.wikimedia.org/wiki/File:Morasko_Natural_Reserve,_COVID19_maseczka.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | MOs810 | 2020-04-25 16:44:50 / 2020-04-28 19:55:03 | 3088 × 2414 | nutida-foto, ur-sokning |
- Nr 1: kategorier: Morasko meteorite; Nature reserve Meteoryt Morasko
- Nr 2: beskrivning: Impact crater in Morasko filled with water. It is the third crater in diameter in group. · kategorier: Nature reserve Meteoryt Morasko
- Nr 3: beskrivning: Porzucona maseczka COVID-19 w Wielkopolskim Parku Narodowym. · kategorier: April 2020 in Poznań; COVID-19 pandemic in Poznań; Littering of personal protective equipment during the COVID-19 pandemic; Nature reserve Meteoryt Morasko; Used disposable surgical masks during the COVID-19 pandemic; W…

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `elfenbensdamen-i-valencina`: Elfenbensdamen i Valencina (2900 f.Kr., Valencina de la Concepción nära Sevilla, Spanien (punkten är orten))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Gold foil with four ‘oculi’.jpg](https://commons.wikimedia.org/wiki/File:Gold_foil_with_four_%E2%80%98oculi%E2%80%99.jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | Leonardo García Sanjuán, Timothy Earle. Photograph: Miguel Ángel Blanco de la Rubia. | 2025-06-01 / 2026-04-21 21:50:08 | 2215 × 2314 | nutida-foto, staende, ur-sokning |
- Nr 1: beskrivning: A) Gold foil with four ‘oculi’ found in Structure 10.029, a small non-funerary pit located near the grave of 'The Ivory Lady', in the PP4-Montelirio sector; B) Comparison of all three ‘oculus’ motifs on gold foil known… · kategorier: Prehistoric Iberia

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `kyla-i-alperna-4-2`: Kallt och torrt i Alperna (2250 f.Kr., Spannagelgrottan i Tyrolen, Österrike (punkten är grottan; folkminskningen gäller norra alpförlandet))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Late roman period temparature and moisture 1 1 1 1.png](https://commons.wikimedia.org/wiki/File:Late_roman_period_temparature_and_moisture_1_1_1_1.png) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Merikanto | 2025-07-22 / 2025-07-22 09:18:46 | 1200 × 600 | nutida-foto, ur-sokning |
| 2 | [File:Psathyrella, Posočje 2 crop.jpg](https://commons.wikimedia.org/wiki/File:Psathyrella,_Poso%C4%8Dje_2_crop.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | This image was created by user Amadej Trnkoczy (amadej) at Mushroom Observer , a source for mycological images. You can contact this user here . | 2011-09-11 03:17 / 2011-09-11 03:17:42 | 488 × 376 | nutida-foto, smal, ur-sokning |
| 3 | [File:India and South Asia Köppen climate map with legend.jpg](https://commons.wikimedia.org/wiki/File:India_and_South_Asia_K%C3%B6ppen_climate_map_with_legend.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | File:World Köppen Map.png : Original file by Peel, M. C., Finlayson, B. L., and McMahon, T. A. (University of Melbourne). Derivative work: Modifications by user Br-Sc-94 , ( User talk ). Cropping & addition of map legend-color box-to summary info by 2know4power , ( User talk ). | 2010-07-18 / 2015-11-20 03:28:29 | 545 × 537 | karta, nutida-foto, smal, staende, ur-sokning |
- Nr 1: beskrivning: Late roman period temparature and moisture. Based on proxien srom Gulf of Tarantino and from Alps. · kategorier: English-language charts; Late Holocene climate
- Nr 2: beskrivning: Psathyrella from Učja Valley, East Julian Alps, Posočje, Slovenia all wet with one dry spot showing the hygrophanous property of this fungus Motic B2-211A, magnification 1.000 x, oil, in water Habitat: Cold northeast in… · kategorier: Psathyrella in Slovenia; Unidentified Psathyrella
- Nr 3: beskrivning: South Asia- Köppen-Geiger climate classification map is based on native vegetation, temperature, precipitation and their seasonality. (Af) Tropical rainforest (Am) Tropical monsoon (Aw) Tropical savanna, wet & dry (BWh)… · kategorier: Biogeographical maps of India; Climate of India; Köppen-Geiger Climate Classification Maps for India; Köppen-Geiger source Peel 2007; Köppen climate classification maps by region; Maps of the Global Southeast

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `torka-i-mesopotamien-4-2`: Torka i norra Mesopotamien (2200 f.Kr., Norra Mesopotamien; Tell Leilan i Khaburdalen, nordöstra Syrien)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Gol e zard mg ca data 4400 3800 BP 1 1 1 1.png](https://commons.wikimedia.org/wiki/File:Gol_e_zard_mg_ca_data_4400_3800_BP_1_1_1_1.png) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | Merikanto | 2025-04-03 / 2025-04-03 12:06:30 | 1241 × 696 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Gol-e-Zard Cave mg-Ca data 4400 - 3800 BP · kategorier: Climate of Indus Valley Civilization

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `pest-i-bronsalderns-britannien`: Pest i bronsålderns Britannien (2196 f.Kr., Charterhouse Warren i Mendip Hills, Somerset, England (punkten är byn Charterhouse))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The political champion turned resurrection man! (BM 1868,0808.8476).jpg](https://commons.wikimedia.org/wiki/File:The_political_champion_turned_resurrection_man!_(BM_1868,0808.8476).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Print made by: Isaac Robert Cruikshank Published by: E King | 1819 date QS:P571,+1819-00-00T00:00:00Z/9 / 2020-05-12 03:30:09 | 1600 × 1204 | ur-sokning |
| 2 | [File:ProgenyOf KingEdwardIII DetailFromTomb WestminsterAbbey.png](https://commons.wikimedia.org/wiki/File:ProgenyOf_KingEdwardIII_DetailFromTomb_WestminsterAbbey.png) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Thomas Hollis and George Hollis | 1840 / 2015-08-14 15:12:48 | 1081 × 414 | ur-sokning |
| 3 | [File:Alliances in Europe 1740.png](https://commons.wikimedia.org/wiki/File:Alliances_in_Europe_1740.png) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Gundan | 2013-05 / 2020-09-26 09:57:55 | 3872 × 2761 | karta, nutida-foto, ur-sokning |
- Nr 1: beskrivning: Cobbett, astride the neck of a diabolical monster, and followed by demons, is about to land on the English coast, where a crowd hails his return. Below is the sea, and on the right the American shore. Cobbett (a good po… · kategorier: 1819 caricatures of the United Kingdom; British caricatures of Napoleon on Saint Helena; Caricatures of Thomas Paine; Curzon Collection; Demons; National flag of the United States in art
- Nr 2: beskrivning: Progeny of King Edward III (1327-1377), 1840 drawing of the six surviving brass statuettes (from the original twelve) on south side of his tomb in Westminster Abbey, in order as on monument ( http://www.westminster-abbe… · kategorier: Edmund of Langley, Duke of York; Joan of England (1335–1348); Lionel of England, 1st Duke of Clarence; Mary of England, Duchess of Brittany; Monument to Edward III of England in Westminster Abbey; Relief of Edward, the…
- Nr 3: beskrivning: Coalitions in Europe in 1740. Warning: the internal borders of the Holy Roman-German Empire are shown, but not those of the Ottoman Empire, with the exception of Montenegro and Tunisia: consequently, the tributary Chris… · kategorier: European balance of power; Maps of Europe in the 18th century; Maps of territorial evolution of Europe; Treaties with Austria as a party; Treaties with France as a party; Treaties with Prussia as a party

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `kopparbrytning-pa-great-orme`: Kopparbrytning på Great Orme (2000 f.Kr., Great Orme vid Llandudno, Wales)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Great Orme Copper Mines - geograph.org.uk - 2427618.jpg](https://commons.wikimedia.org/wiki/File:Great_Orme_Copper_Mines_-_geograph.org.uk_-_2427618.jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: flagga CC BY-SA 2.0 – API:et säger "CC BY-SA 2.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | David Dixon | 2011-05-21 / 2021-08-02 08:14:55 | 1280 × 960 | nutida-foto, ur-sokning, licens-flagga |
| 2 | [File:Great Orme Copper Mines - geograph.org.uk - 2427624.jpg](https://commons.wikimedia.org/wiki/File:Great_Orme_Copper_Mines_-_geograph.org.uk_-_2427624.jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: flagga CC BY-SA 2.0 – API:et säger "CC BY-SA 2.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | David Dixon | 2011-05-21 / 2021-08-02 08:16:44 | 1280 × 960 | nutida-foto, ur-sokning, licens-flagga |
| 3 | [File:Great Orme Copper Mines - geograph.org.uk - 2427628.jpg](https://commons.wikimedia.org/wiki/File:Great_Orme_Copper_Mines_-_geograph.org.uk_-_2427628.jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: flagga CC BY-SA 2.0 – API:et säger "CC BY-SA 2.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | David Dixon | 2011-05-21 / 2021-08-02 08:17:45 | 1280 × 960 | nutida-foto, ur-sokning, licens-flagga |
- Nr 1: beskrivning: Great Orme Copper Mines · kategorier: Great Orme Mine
- Nr 2: beskrivning: Great Orme Copper Mines · kategorier: Great Orme Mine; May 2011 in Llandudno
- Nr 3: beskrivning: Great Orme Copper Mines · kategorier: Great Orme Mine; May 2011 in Llandudno

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `offerberget-vid-kokino`: Offergåvor på berget vid Kokino (1900 f.Kr., Tatićev Kamen vid Kokino, kommunen Staro Nagoričane, Nordmakedonien)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ancient observatory Kokino, Macedonia.jpg](https://commons.wikimedia.org/wiki/File:Ancient_observatory_Kokino,_Macedonia.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | BrankaVV | 2012-08-14 12:54:26 / 2015-10-13 15:18:21 | 5315 × 3551 | nutida-foto, ur-sokning |
| 2 | [File:Stone blocks, Kokino, Macedonia.jpg](https://commons.wikimedia.org/wiki/File:Stone_blocks,_Kokino,_Macedonia.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | BrankaVV | 2012-08-14 11:55:33 / 2015-10-13 15:18:19 | 5315 × 3543 | nutida-foto, ur-sokning |
| 3 | [File:Stone throne, Kokino, Macedonia.jpg](https://commons.wikimedia.org/wiki/File:Stone_throne,_Kokino,_Macedonia.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | BrankaVV | 2012-08-14 12:36:38 / 2015-10-13 15:18:18 | 5315 × 3543 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Kokino is a Bronze Age archaeological site in the Republic of Macedonia, approximately 30 km from the town of Kumanovo, and about 6 km from the Serbian border, in the Staro Nagoricane municipality. It is situated betwee… · kategorier: Kokino megalithic observatory
- Nr 2: beskrivning: Kokino is a Bronze Age archaeological site in the Republic of Macedonia, approximately 30 km from the town of Kumanovo, and about 6 km from the Serbian border, in the Staro Nagoricane municipality. It is situated betwee… · kategorier: Kokino megalithic observatory
- Nr 3: beskrivning: Kokino is a Bronze Age archaeological site in the Republic of Macedonia, approximately 30 km from the town of Kumanovo, and about 6 km from the Serbian border, in the Staro Nagoricane municipality. It is situated betwee… · kategorier: Kokino megalithic observatory

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `nebra-himmelsskivan`: Himmelsskivan från Nebra (1800 f.Kr., Mittelberg vid Nebra, Sachsen-Anhalt, Tyskland)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:1600 Himmelsscheibe von Nebra sky disk anagoria.jpg](https://commons.wikimedia.org/wiki/File:1600_Himmelsscheibe_von_Nebra_sky_disk_anagoria.jpg) | commons-sok | Public domain (trolig); filsidan: flagga Public domain – motsägelse: filsidans mallar ({{GFDL}}, {{cc-by-3.0}}) och API:et ("Public domain") anger olika licens |  | um 1600 v. Chr. / 2012-12-11 18:06:21 | 2724 × 2724 | staende, ur-sokning, licens-flagga |
- Nr 1: beskrivning: The Nebra Sky disk; Mittelberg near Nebra (Germany); Special exhibition "Beyond the Horizon - Space and Knowledge in the Old World cultures" at the Pergamon Museum (22.06 -. 30.09.2012) · kategorier: Artifacts with black background; Nebra sky disk

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `hallristningarna-i-tanum`: Hällristningarna i Tanum (1700 f.Kr., Tanum, Bohuslän, Sverige)

Wikidata: [Q1761052](https://www.wikidata.org/wiki/Q1761052). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Tanumshede 2005 rock carvings 7.jpg](https://commons.wikimedia.org/wiki/File:Tanumshede_2005_rock_carvings_7.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | – / 2005-07-18 15:48:45 | 1632 × 1232 | datum-osakert |
- Nr 1: kategorier: Aspeberget, Tanum; Petroglyphs of ships

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `tjurhoppning-pa-knossos`: Tjurhopp på väggarna i Knossos (1450 f.Kr., Palatset i Knossos, Kreta, Grekland)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Bull leaping, fresco from the Great Palace at Knossos, Crete, Heraklion Archaeological Museum.jpg](https://commons.wikimedia.org/wiki/File:Bull_leaping,_fresco_from_the_Great_Palace_at_Knossos,_Crete,_Heraklion_Archaeological_Museum.jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | George Groutas | 2008-07-17 10:44:00 / 2008-10-27 18:30:36 | 3503 × 2054 | nutida-foto, ur-sokning |
| 2 | [File:Wall painting of male and female taureadors from Knossos (Court of the Stone Spout) - Heraklion AM - 07.jpg](https://commons.wikimedia.org/wiki/File:Wall_painting_of_male_and_female_taureadors_from_Knossos_(Court_of_the_Stone_Spout)_-_Heraklion_AM_-_07.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | ArchaiOptix | 2017-04-17 17:27:15 / 2020-05-29 15:48:04 | 5472 × 3648 | nutida-foto, ur-sokning |
| 3 | [File:Wall painting of male and female taureadors from Knossos (Court of the Stone Spout) - Heraklion AM - 03.jpg](https://commons.wikimedia.org/wiki/File:Wall_painting_of_male_and_female_taureadors_from_Knossos_(Court_of_the_Stone_Spout)_-_Heraklion_AM_-_03.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | ArchaiOptix | 2017-04-17 17:26:50 / 2020-05-29 15:47:57 | 3648 × 5472 | nutida-foto, staende, ur-sokning |
- Nr 1: beskrivning: Bull leaping&quot fresco (painted plaster) from a wall of the Palace at Knossos. The red figure is probably male (its hands probably not on the back of the bull as it should, maybe so to reduce the height of the image),… · kategorier: Archaeological Museum of Heraklion - Bull leaping fresco
- Nr 2: beskrivning: - object type: wall painting (fresco) - description: male and female taureadors (bull-leaping as a cultic sport) (one of several similar panels) - height: ca. 78 cm - period / date: (Immerwahr 1990) late minoan II - III… · kategorier: Archaeological Museum of Heraklion - Bull leaping fresco
- Nr 3: beskrivning: - object type: wall painting (fresco) - description: male and female taureadors (bull-leaping as a cultic sport) (one of several similar panels) - height: ca. 78 cm - period / date: (Immerwahr 1990) late minoan II - III… · kategorier: Archaeological Museum of Heraklion - Bull leaping fresco

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `solvagnen-fran-trundholm`: Solvagnen från Trundholm (1400 f.Kr., Trundholms mosse, Odsherred, Själland, Danmark)

Wikidata: [Q1137682](https://www.wikidata.org/wiki/Q1137682). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Solvognen DO-6865 2000.jpg](https://commons.wikimedia.org/wiki/File:Solvognen_DO-6865_2000.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: flagga CC BY-SA 3.0 – motsägelse: filsidans mallar ({{cc-by-sa-2.5}}) och API:et ("CC BY-SA 3.0") anger olika licens | Nationalmuseet, John Lee | 2006-01-01 / 2016-03-01 13:57:07 | 2000 × 1438 | nutida-foto, licens-flagga |
- Nr 1: beskrivning: Solvognen, natsiden synlig. Bronzealder, votiv/depot. · kategorier: Solvognen

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `bronsalderns-kollaps`: Bronsålderns kollaps (1200 f.Kr., Östra Medelhavet och Främre Orienten (markören vid Ugarit i Syrien))

Wikidata: [Q1059758](https://www.wikidata.org/wiki/Q1059758). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:2006 T372 Bronze Age hoard (FindID 192417).jpg](https://commons.wikimedia.org/wiki/File:2006_T372_Bronze_Age_hoard_(FindID_192417).jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Colchester Museums, Laura McLean, 2008-08-12 14:28:42 | between 1000 BC and 800 BC / 2017-02-02 15:28:44 | 1904 × 1570 | ur-sokning |
| 2 | [File:2006 T372 Bronze Age hoard, pottery fragment (FindID 192417).jpg](https://commons.wikimedia.org/wiki/File:2006_T372_Bronze_Age_hoard,_pottery_fragment_(FindID_192417).jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Colchester Museums, Laura McLean, 2008-08-12 14:28:42 | between 1000 BC and 800 BC / 2017-02-02 15:28:21 | 1614 × 738 | ur-sokning |
| 3 | [File:ESS-009610 Bronze Age Hoard, Ingot (10) Drawing by Sue Holden (FindID 192417).jpg](https://commons.wikimedia.org/wiki/File:ESS-009610_Bronze_Age_Hoard,_Ingot_(10)_Drawing_by_Sue_Holden_(FindID_192417).jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Colchester Museums, Laura McLean, 2008-08-14 17:11:05 | between 1000 BC and 800 BC / 2017-02-02 15:02:32 | 1408 × 1807 | staende, ur-sokning |
- Nr 1: beskrivning: Bronze Age Hoard 44 fragments of copper alloy ingot fragments were discovered in 2000 (prior to the inclusion of such hoards in the Treasure Act). These fragments weigh 4.882 kilogrammes; the average fragment weight is… · kategorier: Bronze Age axes in the Portable Antiquities Scheme; Hoards in the Portable Antiquities Scheme; Images by Laura McLean; Portable Antiquities Scheme; Portable Antiquities Scheme, ESS
- Nr 2: beskrivning: Bronze Age Hoard 44 fragments of copper alloy ingot fragments were discovered in 2000 (prior to the inclusion of such hoards in the Treasure Act). These fragments weigh 4.882 kilogrammes; the average fragment weight is… · kategorier: Bronze Age axes in the Portable Antiquities Scheme; Hoards in the Portable Antiquities Scheme; Images by Laura McLean; Portable Antiquities Scheme; Portable Antiquities Scheme, ESS
- Nr 3: beskrivning: Bronze Age Hoard 44 fragments of copper alloy ingot fragments were discovered in 2000 (prior to the inclusion of such hoards in the Treasure Act). These fragments weigh 4.882 kilogrammes; the average fragment weight is… · kategorier: Bronze Age axes in the Portable Antiquities Scheme; Drawings in the Portable Antiquities Scheme; Hoards in the Portable Antiquities Scheme; Images by Laura McLean; Portable Antiquities Scheme; Portable Antiquities Schem…

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 16. `karthago-grundas`: Kartago grundas (814 f.Kr., Kartago vid Tunissjön (i dag Tunisien))

Wikidata: [Q6343](https://www.wikidata.org/wiki/Q6343). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Tunisie Carthage Ruines 08.JPG](https://commons.wikimedia.org/wiki/File:Tunisie_Carthage_Ruines_08.JPG) | wikidata-P18 | CC BY 2.5 (trolig); filsidan: godkand-med-not CC BY 2.5 – flera licenser: CC BY-SA 3.0, CC BY 2.5; GFDL anges också (dubbellicens) | Calips | 5 September 2006 (according to Exif data) / 2010-06-24 04:33:48 | 3008 × 2000 | nutida-foto |
- Nr 1: beskrivning: Tunisie Carthage Photographie prise par Patrick GIRAUD · kategorier: Gulf of Tunis; House of the Cryptoporticus (Carthage); Views of Bou Kornine

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `vagnshjulen-i-novokorsunskaja`: Vagnshjulen i Novokorsunskaja (3500 f.Kr.)
- `los-millares`: Den befästa boplatsen Los Millares (3025 f.Kr.)
- `tumlarna-blir-farre-i-ostra-ostersjon`: Tumlarna blir färre i östra Östersjön (3000 f.Kr.)
- `meningokocker-pa-ajvide`: Spår av meningokocker på Ajvide (2800 f.Kr.)
- `kalenderkarlet-fran-vinkovci`: Lerkärlet från Vinkovci tolkas som en kalender (2600 f.Kr.)
- `mjolk-i-lerkarlen-i-kyrkslatt`: Mjölk i lerkärlen i Kyrkslätt (2500 f.Kr.)
- `metallen-till-sydskandinavien-byter-vag`: Metallen till Sydskandinavien byter väg (2100 f.Kr.)
- `kastelli-jattekyrka`: Kastelli jättekyrka byggs (2000 f.Kr.)
- `megalitgravarna-vid-trafalgar`: Megalitgravarna vid Kap Trafalgar (1875 f.Kr.)
- `bete-vid-mortensnes`: Betet sätter spår vid Mortensnes (1650 f.Kr.)
- `hirs-i-pielgrzymowice`: Hirs på bordet i Polen (1636 f.Kr.)
- `kaali-kratern`: En meteorit slår ner vid Kaali (1530 f.Kr.)
- `hekla-3-utbrottet`: Hekla får ett av sina största utbrott (1203 f.Kr.)
- `terramarebyarna-overges`: Terramarebyarna överges (1200 f.Kr.)
- `befasta-kullar-i-ostra-litauen`: Befästa boplatser på kullar i östra Litauen (1000 f.Kr.)
- `hastutrustningen-fran-eskelhem`: Hästutrustningen från Eskelhem (900 f.Kr.)
- `faltnabbmus-i-aalborg`: En fältnäbbmus i bronsålderns Danmark (897 f.Kr.)
- `barnsten-och-brons-i-kukuliskiai`: Bärnsten och bronsgjutning i Kukuliškiai (800 f.Kr.)
- `saltbrytning-i-hallstatt`: Saltgruvorna i Hallstatt blomstrar (800 f.Kr.)

## Val 2026-11-26 (#2077 och #2078)

13 av 40 händelser fick bild. Filsidorna kontrollerades via verktygets licenskontroll (`action=raw`) och bilderna granskades visuellt i en kontaktbild. Förhistoria (före 3000 f.Kr.): riktiga fynd och platser, inga ansiktsrekonstruktioner (beslut 2026-11-14); `forhistoriker` bör granska.

- Avvisat efter att filsidan öppnats eller bilden setts: `meteoritkratrarna-i-morasko` (saknar fotograf), `solvagnen-fran-trundholm` (motstridiga licensuppgifter), `nebra-himmelsskivan` och `kopparbrytning-pa-great-orme` (licensflagga).
- Karthago: tre licenser anges (GFDL, CC BY-SA 3.0, CC BY 2.5); verktyget valde CC BY 2.5, men den strängare CC BY-SA 3.0 används i data, källpost och bildtext.
- Avstått på grund av kvarlevor och gravar: `otzi`, `egtvedflickan`, `pest-i-bronsalderns-britannien`. Gravmonument (Rössberga, Hågahögen, Sammallahdenmäki) visas bara utifrån, utan kvarlevor.
- Händelserna `otzi`, `newgrange`, `sammallahdenmaki`, `egtvedflickan` och `hagahogen` saknades i den automatiska listan (de har `start` i stället för `year`); `sammallahdenmaki`, `hagahogen`, `newgrange` och `otzi` söktes manuellt.
- Egen sökning: `sammallahdenmaki`, `hagahogen`, `hekla-3-utbrottet`, `kaali-kratern`, `los-millares`, `saltbrytning-i-hallstatt`, `newgrange`.
