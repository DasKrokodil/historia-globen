# Granskningslista för bildomgång asien-2

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=36 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 36. **Med minst en användbar kandidat:** 9. **Utan kandidat:** 27.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `asien-2-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/asien-2-lista.txt`.

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

## 1. `kuk-jordbruk`: Jordbruk i Nya Guineas högland (7000 f.Kr., Kuk i Wahgidalen nära Mount Hagen, Papua Nya Guinea)

Wikidata: [Q1165562](https://www.wikidata.org/wiki/Q1165562). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Kuk New Guinea 2002.jpg](https://commons.wikimedia.org/wiki/File:Kuk_New_Guinea_2002.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | NASA: JPL | 2002-05-07 / 2010-05-20 02:54:33 | 2664 × 2108 | nutida-foto |
- Nr 1: beskrivning: The Kuk Early Agricultural Site consists of 116 ha of swamps in the western highlands of New Guinea 1,500 meters above sea-level. Archaeological excavation has revealed the landscape to be one of wetland reclamation wor… · kategorier: 2002 photographs of Papua New Guinea; Agriculture in Papua New Guinea; Kuk Swamp; Photos of Asia by ASTER; Satellite pictures of Papua New Guinea

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `utbrotten-i-ksudach`: Utbrotten i Ksudach (6851 f.Kr., Vulkanen Ksudach på södra Kamtjatka, Ryssland)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ksudach Volcano, Kamchatka, Russia (4826).jpg](https://commons.wikimedia.org/wiki/File:Ksudach_Volcano,_Kamchatka,_Russia_(4826).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Astronaut photograph ISS009-E-16836 was acquired July 26, 2004, with a Kodak K760C digital camera with an 800-mm lens, and is provided by the Earth Observations Laboratory, Johnson Space Center. The International Space Station Program supports the laboratory to help astronauts take pictures of Earth that will be of the greatest value to scientists and the public, and to make those images freely available on the Internet. Additional images taken by astronauts and cosmonauts can be viewed at the NASA/JSC Gateway to Astronaut Photography of Earth | Taken on 26 July 2004 / 2026-05-23 14:28:34 | 2007 × 3032 | nutida-foto, staende, ur-sokning |
- Nr 1: beskrivning: Some of the world’s most active volcanoes make up the spine of the Kamchatka Peninsula in far east Russia. Kamchatka is the northwestern edge of the Pacific “ring of fire,” where earthquakes and volcanism are caused by… · kategorier: ISS Expedition 9 Crew Earth Observations; Ksudach; NASA Earth Observatory in 2004; Photos of Russia from ISS

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `seongsan-ilchulbong-bildas`: Tuffkonen Seongsan Ilchulbong bildas (4751 f.Kr., Seongsan Ilchulbong på Jeju, Sydkorea)

Wikidata: [Q122225](https://www.wikidata.org/wiki/Q122225). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Seongsan Ilchulbong from the air.jpg](https://commons.wikimedia.org/wiki/File:Seongsan_Ilchulbong_from_the_air.jpg) | wikidata-P18 | CC BY-SA 2.0 (trolig); filsidan: flagga CC BY-SA 2.0 – API:et säger "CC BY-SA 2.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Korea.net / Korean Culture and Information Service | 2006-10-18 17:22 / 2022-02-13 12:33:42 | 5641 × 3675 | nutida-foto, licens-flagga |
| 2 | [File:성산일출봉 천연보호구역 2019년 촬영(출처 문화재청 대변인실).jpg](https://commons.wikimedia.org/wiki/File:%EC%84%B1%EC%82%B0%EC%9D%BC%EC%B6%9C%EB%B4%89_%EC%B2%9C%EC%97%B0%EB%B3%B4%ED%98%B8%EA%B5%AC%EC%97%AD_2019%EB%85%84_%EC%B4%AC%EC%98%81(%EC%B6%9C%EC%B2%98_%EB%AC%B8%ED%99%94%EC%9E%AC%EC%B2%AD_%EB%8C%80%EB%B3%80%EC%9D%B8%EC%8B%A4).jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Korea Heritage Service | 2019-12-13 07:40:06 / 2021-08-27 13:50:40 | 4454 × 2970 | nutida-foto |
- Nr 1: beskrivning: Jeju-do, a Special Self-Governing Province is the only special autonomous province of Korea, situated on and coterminous with the country's largest island. · kategorier: Seongsan Ilchulbong; Tuff rings; Volcanoes in South Korea
- Nr 2: beskrivning: Seongsan Ilchulbong Tuff Cone Natural Reserve · kategorier: Seongsan Ilchulbong

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `kopparbrytning-i-kargaly`: Kopparbrytningen i Kargaly (3000 f.Kr., Kargaly, Orenburg oblast, södra Ural, Ryssland (punkten är gruvområdets mitt))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Kargaly-fig-05.jpg](https://commons.wikimedia.org/wiki/File:Kargaly-fig-05.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Chernykh Evgenij | – / 2010-03-13 09:13:55 | 2362 × 1513 | datum-osakert, ur-sokning |
| 2 | [File:Kargaly-fig-09.jpg](https://commons.wikimedia.org/wiki/File:Kargaly-fig-09.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Chernykh Evgenij | Summer 1997 date QS:P,+1997-00-00T00:00:00Z/9,P4241,Q40720564 / 2010-03-13 09:22:17 | 1181 × 733 | nutida-foto, ur-sokning |
| 3 | [File:Kargaly-fig-03.jpg](https://commons.wikimedia.org/wiki/File:Kargaly-fig-03.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Chernykh Evgenij | 1994-07 / 2010-10-21 21:24:15 | 1601 × 2332 | nutida-foto, staende, ur-sokning |
- Nr 1: beskrivning: Kargaly: in the underground mine gouge Каргалы: в одной из подземных горных выработок · kategorier: Kargaly (Orenburg)
- Nr 2: beskrivning: Kargaly, the Late Bronze Age settlement Gorny: the stone anvil, hammer and casting moulds Каргалы, позднебронзовое поселение Горный: каменные наковальня, молоток и литейная форма · kategorier: Kargaly (Orenburg)
- Nr 3: beskrivning: Kargaly: the superficial traces of different types of mining works in the very limited area; the total number of the similar traces is equal approximately 35,000 · kategorier: Kargaly (Orenburg)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `sintashta-stridsvagnar`: Sintashtakulturen och de äldsta kända stridsvagnarna (2200 f.Kr., Sintashta i Tjeljabinsk oblast, Ryssland)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Chariot spread.png](https://commons.wikimedia.org/wiki/File:Chariot_spread.png) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | by en:User:Dbachmann | 2005 / 2021-09-27 04:00:21 | 400 × 231 | karta, nutida-foto, smal, ur-sokning |
- Nr 1: beskrivning: Historical spread of the chariot. This map combines various classes of information, historical and archaeological. The 'isochrones' as given should not be considered more than rough approximations, give or take a centur… · kategorier: 10th century BC; 12th century BC; 5th century BC; 6th century BC; Ancient four-wheeled chariots; Archaeological maps

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `mumierna-i-xiaohe`: Mumierna i Tarimbäckenet (2135 f.Kr., Gravfältet Xiaohe väster om Lop Nur, Xinjiang, Kina)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Infant mummy (Tarim).jpg](https://commons.wikimedia.org/wiki/File:Infant_mummy_(Tarim).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Michael Kan | 2010-05-27 / 2023-04-29 13:35:40 | 3299 × 1524 | nutida-foto, ur-sokning |
| 2 | [File:PC analysis The genomic origins of the Bronze Age Tarim Basin mummies, Nature, 2021.png](https://commons.wikimedia.org/wiki/File:PC_analysis_The_genomic_origins_of_the_Bronze_Age_Tarim_Basin_mummies,_Nature,_2021.png) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Fan Zhang, Chao Ning, Ashley Scott | 2023-09-03 / 2023-09-03 07:17:23 | 1050 × 1200 | nutida-foto, staende, ur-sokning |
| 3 | [File:Genetic structure of ancient and present-day populations (Tarim-MA1 proximity).png](https://commons.wikimedia.org/wiki/File:Genetic_structure_of_ancient_and_present-day_populations_(Tarim-MA1_proximity).png) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Fan Zhang, Chao Ning, Ashley Scott | 2023-04-08 / 2023-04-08 08:57:13 | 1050 × 1200 | nutida-foto, staende, ur-sokning |
- Nr 1: beskrivning: Infant mummy (Tarim). Items shown in the "Secrets of the Silk Road" exhibit touring America. · kategorier: Cherchen cemetery; Children of China; Clothed mummies; Mummies of children; Tarim mummies
- Nr 2: beskrivning: PC analysis The genomic origins of the Bronze Age Tarim Basin mummies, Nature, 2021 · kategorier: Ancient North Eurasian; Tarim mummies
- Nr 3: beskrivning: Genetic structure of ancient and present-day populations (Tarim-MA1 proximity) · kategorier: Ancient North Eurasian; Tarim mummies

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `den-syriska-elefanten`: Den syriska elefanten (1800 f.Kr., Västasien; punkten är Habbaniyahsjön i Irak, en av fyndplatserna)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Elephant Attacking a Feline.jpg](https://commons.wikimedia.org/wiki/File:Elephant_Attacking_a_Feline.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown Unknown , Syrian | late 4th century - 5th century (late) / 2009-02-11 13:53:27 | 1024 × 506 | ur-sokning |
| 2 | [File:Syrians Bringing an Elephant and a Bear, Tomb of Rekhmire MET DP161256.jpg](https://commons.wikimedia.org/wiki/File:Syrians_Bringing_an_Elephant_and_a_Bear,_Tomb_of_Rekhmire_MET_DP161256.jpg) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Nina M. Davies | circa 1504 date QS:P571,+1504-00-00T00:00:00Z/9,P1480,Q5727902 –1425 B.C. Period: New Kingdom Dynasty: Dynasty 18 / 2017-12-30 23:48:10 | 3959 × 3502 | ur-sokning |
| 3 | [File:Syrians bringing presents in the tomb of Rekhmire. More tribute.jpg](https://commons.wikimedia.org/wiki/File:Syrians_bringing_presents_in_the_tomb_of_Rekhmire._More_tribute.jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Heidi Kontkanen | 2019-04-24 12:05:56 / 2020-07-04 12:56:30 | 3264 × 4928 | nutida-foto, staende, ur-sokning |
- Nr 1: kategorier: 4th-century mosaics; Ancient Roman mosaics in the United States; Collections of the Minneapolis Institute of Art; Elephants in Graeco-Roman Antiquities; Elephas maximus in art; Mosaics of elephants
- Nr 2: beskrivning: Facsimile, Rekhmire (TT 100), Syrians, elephant, bear, ingot · kategorier: Ancient Syria; Asiatics in ancient Egyptian art; Elephants in ancient Egyptian art; Facsimiles of ancient Egyptian art in the Metropolitan Museum of Art; N. de Garis Davies; Tomb of Rekhmire TT100
- Nr 3: beskrivning: Detail from the scene from the transverse hall (left side). The tribute of foreign people. Rekhmire receives tribute on behalf of the king from various foreign countries. In the top register things from the land of Punt… · kategorier: Ancient Syria; Asiatics in ancient Egyptian art; Tomb of Rekhmire TT100

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `lapitakulturen-i-bismarckarkipelagen`: Lapitakulturen dyker upp i Bismarckarkipelagen (1600 f.Kr., Bismarckarkipelagen, bland annat ön Mussau (i dag Papua Nya Guinea))

Wikidata: [Q1021436](https://www.wikidata.org/wiki/Q1021436). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:PortVilaLapita.jpg](https://commons.wikimedia.org/wiki/File:PortVilaLapita.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Torbenbrinker | 2013-07-09 04:00:29 / 2013-09-01 14:36:17 | 3648 × 2736 | nutida-foto |
- Nr 1: beskrivning: Lapita pottery, Vanuatu Cultural Centre, Port Vila, Vanuatu · kategorier: Lapita pottery; Port Vila

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `hatshepsuts-expedition-till-punt`: Hatshepsuts expedition till Punt (1471 f.Kr., Hamnen Mersa Gawasis vid Röda havet (i dag Egypten), på väg till Punt)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Relief of Hatshepsut's expedition to the Land of Punt by Σταύρος.jpg](https://commons.wikimedia.org/wiki/File:Relief_of_Hatshepsut%27s_expedition_to_the_Land_of_Punt_by_%CE%A3%CF%84%CE%B1%CF%8D%CF%81%CE%BF%CF%82.jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Σταύρος | 2008-09-11 / 2012-05-11 19:23:03 | 3264 × 2211 | nutida-foto, ur-sokning |
| 2 | [File:Queen Hatshepsut's expedition to Punt, plaster cast of her mortuary temple at Deir el-Bahri, Western Thebes, Egypt - Royal Ontario Museum - DSC09766.JPG](https://commons.wikimedia.org/wiki/File:Queen_Hatshepsut%27s_expedition_to_Punt,_plaster_cast_of_her_mortuary_temple_at_Deir_el-Bahri,_Western_Thebes,_Egypt_-_Royal_Ontario_Museum_-_DSC09766.JPG) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Daderot | 2011-11-20 18:04:40 / 2011-12-28 20:54:18 | 4320 × 3240 | nutida-foto, ur-sokning |
| 3 | [File:Hatshepsut-tree.jpg](https://commons.wikimedia.org/wiki/File:Hatshepsut-tree.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Edal Anton Lefterov | 2011-09-20 / 2011-09-25 14:48:18 | 1000 × 667 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: This is a fine relief of members of Hatshepsut's trading expedition to the mysterious 'Land of Punt' from this pharaoh's elegant mortuary temple at Deir El-Bahri. In this scene, Egyptian soldiers bear tree branches and… · kategorier: Ancient Egyptian weapons; Ancient furs; Army of Egypt; Fur clothing of native people of Egypt; Male fur clothing in art; Man with arms raised (hieroglyph)
- Nr 2: beskrivning: Exhibit in the Royal Ontario Museum, Toronto, Ontario, Canada. This exhibit is old enough so that it is in the public domain, and photography was permitted in the museum. I took this photograph and release it into the p… · kategorier: Egyptian antiquities in the Royal Ontario Museum; Reliefs of expedition to Punt; Replicas of ancient Egyptian art
- Nr 3: beskrivning: This tree in front of Hatshepsut' Temple is claimed to have been brought from Punt by Hatshepsut's Expedition which is depicted on the Temple walls. · kategorier: Dead trees; Expedition to Punt; Gardens of Hatshepsut Temple

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `lacket-i-kakinoshima`: Rött lack i Kakinoshima (7051 f.Kr.)
- `jiahu-jast-dryck`: En blandad dryck i Jiahus krukor (7000 f.Kr.)
- `ris-i-lahuradewa`: Ris i Lahuradewa: odlat eller insamlat? (7000 f.Kr.)
- `elsjankakulturens-lerkarl`: Lerkärlen i Jelsjankakulturen (6700 f.Kr.)
- `kurilsjons-kaldera-bildas`: Utbrottet som skapade Kurilsjön (6460 f.Kr.)
- `skidfragment-vid-sindorsjon`: Skidliknande föremål vid Sindorsjön (6300 f.Kr.)
- `vassbatar-vid-h3-i-kuwait`: Vassbåtar på havet vid Kuwaitbukten (5511 f.Kr.)
- `eridu-grundas`: Eridu grundas i södra Mesopotamien (5400 f.Kr.)
- `akahoya-utbrottet-i-kikai`: Akahoyautbrottet drabbar södra Kyushu (5351 f.Kr.)
- `mustatilerna-i-arabien`: Mustatilerna och en kult kring boskap (5300 f.Kr.)
- `aitapeskallen-och-tsunamin`: Aitapeskallen och en tsunami på Nya Guineas nordkust (5050 f.Kr.)
- `vinkallaren-i-areni-1`: Vinframställning i grottan Areni-1 (4100 f.Kr.)
- `boplatsen-i-amsa-dong`: Stenåldersboplatsen i Amsa-dong (4000 f.Kr.)
- `sarazm-och-handeln`: Sarazm och förbindelserna i Centralasien (3900 f.Kr.)
- `botai-hastar`: Botaifolket och hästarna (3700 f.Kr.)
- `pesten-vid-angara`: Pest bland jägarna vid Bajkalsjön (3571 f.Kr.)
- `niuheliang-gudinnans-tempel`: Gudinnans tempel i Niuheliang (3500 f.Kr.)
- `kot-diji`: Kot Diji före Indusstäderna (3300 f.Kr.)
- `liangzhu-och-dammarna`: Liangzhu och dammarna vid Yangtzedeltat (3300 f.Kr.)
- `flankskred-pa-piton-de-la-fournaise`: Det senaste stora skredet på Piton de la Fournaise (2500 f.Kr.)
- `spetalska-i-balathal`: Spetälska i Balathal (2500 f.Kr.)
- `gonur-depe`: Gonur Depe, en bronsåldersstad i Centralasien (2400 f.Kr.)
- `dilmun-handelsplats`: Dilmun, mellanhand mellan Mesopotamien och Indusdalen (2200 f.Kr.)
- `torka-vid-mare-aux-songes`: Torka dödar dronter och jättesköldpaddor på Mauritius (2200 f.Kr.)
- `bronsgjutare-i-ban-chiang`: Bronsgjutare i Ban Chiang (2000 f.Kr.)
- `stort-utbrott-i-witori`: Ett av de största utbrotten i Witori (1470 f.Kr.)
- `ramses-krig-mot-hettiterna`: Ramses II:s krig mot hettiterna (1275 f.Kr.)

## Val 2026-11-26 (#2058 och #2059)

13 av 40 händelser fick bild. Filsidorna öppnades via `action=raw` och bilderna granskades visuellt. Avstådda på grund av kvarlevor: `aitapeskallen-och-tsunamin`, `pesten-vid-angara`, `spetalska-i-balathal`, `mumierna-i-xiaohe`.

- Egen sökning (listan hade ingen kandidat eller en olämplig): `mehrgarh`, `gonur-depe`, `hatshepsuts-expedition-till-punt` (Museo Egizios glasnegativ av reliefen, CC0, i stället för Ismoons Photoshop-bearbetning av en annan fil), `ramses-krig-mot-hettiterna` (reliefen vid Abu Simbel, CC0), `vinkallaren-i-areni-1`, `seongsan-ilchulbong-bildas`, `bronsgjutare-i-ban-chiang`, `sintashta-stridsvagnar`, `liangzhu-och-dammarna`, `kot-diji`, `utbrotten-i-ksudach`, `akahoya-utbrottet-i-kikai`, `sarazm-och-handeln`.
- Avvisat: `niuheliang-gudinnans-tempel` (gravföremål).
