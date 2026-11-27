# Granskningslista för bildomgång asien-6

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=37 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 37. **Med minst en användbar kandidat:** 29. **Utan kandidat:** 8.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `asien-6-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/asien-6-lista.txt`.

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

## 1. `forsta-slaget-vid-panipat`: Första slaget vid Panipat (1526, Panipat, norr om Delhi (i dag Haryana, Indien))

Wikidata: [Q605321](https://www.wikidata.org/wiki/Q605321). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `miniatyr`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Battle of Panipat (20 April 1526). Baburnama of 1598.jpg](https://commons.wikimedia.org/wiki/File:Battle_of_Panipat_(20_April_1526)._Baburnama_of_1598.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | 1598 artist | 1598 / 2024-12-28 04:40:48 | 3690 × 3048 | – |
| 2 | [File:Vaki'at-i Baburi - The Battle of Panipat (1526) by Deo Gujarati.jpg](https://commons.wikimedia.org/wiki/File:Vaki%27at-i_Baburi_-_The_Battle_of_Panipat_(1526)_by_Deo_Gujarati.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Deo Gujarati | circa 1590 date QS:P571,+1590-00-00T00:00:00Z/9,P1480,Q5727902 / 2024-04-29 18:29:11 | 1173 × 2000 | staende |
- Nr 1: beskrivning: Battle of Panipat (20 April 1526). Baburnama of 1598 · kategorier: Baburnama, National Museum, New Delhi; First Battle of Panipat
- Nr 2: beskrivning: The battle of Panipat between the armies of Babur and Ibrahim Lodi (1526). An illustration to the Vaqi 'at-i Baburi , a Persian translation of the Baburnama, c.1590. This miniature is in the Mughal/Akbar style. British… · kategorier: Baburnama, British Library; First Battle of Panipat; Ibrahim Lodi

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `slaget-vid-wofla`: Slaget vid Wofla (1542, Wofla (Ofla) nära sjön Ashenge, Tigray)

Wikidata: [Q835180](https://www.wikidata.org/wiki/Q835180). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `etiopien`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Burning of churches by the Adalites and the execution of Cristóvão da Gama.png](https://commons.wikimedia.org/wiki/File:Burning_of_churches_by_the_Adalites_and_the_execution_of_Crist%C3%B3v%C3%A3o_da_Gama.png) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Kegneketa Jemlieri Hailu of Gondar (fl.1900) | 1900 / 2025-02-02 15:05:49 | 2258 × 786 | ur-sokning |
| 2 | [File:FallAhmedGragn.jpg](https://commons.wikimedia.org/wiki/File:FallAhmedGragn.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Kegneketa Jemlieri Hailu of Gondar (fl.1900) | 1900 / 2017-09-06 16:47:06 | 588 × 399 | smal, ur-sokning |
| 3 | [File:Adal.JPG](https://commons.wikimedia.org/wiki/File:Adal.JPG) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: flagga CC BY-SA 3.0 – API:et säger "CC BY-SA 3.0" men ingen licensmall kändes igen på filsidan ({{GFDL}}) | אליש 00:53, 6 בדצמבר 2007 (IST) | 6 בדצמבר 2007 / 2012-01-06 07:28:34 | 600 × 532 | karta, nutida-foto, smal, ur-sokning, licens-flagga |
- Nr 1: beskrivning: The execution of Cristóvão da Gama by Ahmad Gragn
- Nr 2: beskrivning: Burning of Churches Muslims and the Death of Cristobal de Gama and the Fall and Death of Ahmad ibn Ibrahim al-Ghazi Shot by a Portuguese Musketeer · kategorier: Ahmad ibn Ibrahim al-Ghazi; Paintings
- Nr 3: beskrivning: The Horn of Africa on the eve of the Battle of Adal in 1529. The Ethiopian Empire (Christians, in orange) and Adal (Muslims, in green). · kategorier: 1529 in Africa; Maps of Africa in the 16th century; Maps of the Adal Sultanate; Maps of the Ethiopian Empire; Maps showing 1529

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `andra-slaget-vid-panipat`: Andra slaget vid Panipat (1556, Panipat, norr om Delhi (i dag Haryana, Indien))

Wikidata: [Q233414](https://www.wikidata.org/wiki/Q233414). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `miniatyr`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The defeat of Hemu, Akbarnama.jpg](https://commons.wikimedia.org/wiki/File:The_defeat_of_Hemu,_Akbarnama.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Kankar | between 1595 and 1600 date QS:P,+1500-00-00T00:00:00Z/6,P1319,+1595-00-00T00:00:00Z/9,P1326,+1600-00-00T00:00:00Z/9 / 2026-11-06 03:53:18 | 2000 × 3321 | staende |
- Nr 1: beskrivning: The defeat of Hemu at the Second Battle of Panipat, a c. 1590s painting by Kankar from the Akbarnama. Neither Hemu nor Akbar are depicted here suggesting that this might be part of a double-page composition. · kategorier: Akbarnama; Art of India in the National Gallery of Victoria; Elephant riding in art of India; Islamic miniatures of elephants (India); Second Battle of Panipat; War elephants of the Mughal Empire

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `jordbavningen-i-shaanxi-1556`: Jordbävningen i Shaanxi (1556, Huaxian (i dag Huazhou) i Weidalen, Shaanxi, Mingrikets Kina)

Wikidata: [Q191293](https://www.wikidata.org/wiki/Q191293). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The Daci'en Temple, Xi'an (50613091213).jpg](https://commons.wikimedia.org/wiki/File:The_Daci%27en_Temple,_Xi%27an_(50613091213).jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Hugh Llewelyn from Keynsham, UK | 2009-04-22 09:22 / 2023-10-03 12:10:32 | 4592 × 3056 | nutida-foto, ur-sokning |
| 2 | [File:The Daci'en Temple, Xi'an (50613945967).jpg](https://commons.wikimedia.org/wiki/File:The_Daci%27en_Temple,_Xi%27an_(50613945967).jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Hugh Llewelyn from Keynsham, UK | 2009-04-22 09:23 / 2023-10-03 12:10:31 | 4592 × 3056 | nutida-foto, ur-sokning |
| 3 | [File:Shaanxi 1556 earthquake map of provinces.png](https://commons.wikimedia.org/wiki/File:Shaanxi_1556_earthquake_map_of_provinces.png) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) |  | – / 2005-11-07 04:46:15 | 700 × 554 | karta, datum-osakert, smal, ur-sokning |
- Nr 1: beskrivning: A Buddha inside the Great Wild Goose Pagoda (Da Yan Pagoda) in the Daci'en Temple complex, Xi'an (formerly Chang'an), Shaanxi, 22 April 2009. The Budhist temple is a complex of temples, pagodas and pavilions. It was bui… · kategorier: Buddhist art in Shaanxi; Daci'en Temple
- Nr 2: beskrivning: Inside the Great Wild Goose Pagoda (Da Yan Pagoda) in the Daci'en Temple complex, Xi'an (formerly Chang'an), Shaanxi, 22 April 2009. The Budhist temple is a complex of temples, pagodas and pavilions. It was built in 648… · kategorier: Daci'en Temple
- Nr 3: kategorier: 1556 earthquakes in China; Disasters and accidents in Shaanxi; History of Shaanxi; Maps of Shaanxi; Maps of earthquakes in China; Maps using Pinyin

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `mendana-nar-salomonoarna`: Mendaña når Salomonöarna (1568, Santa Isabel (i dag Salomonöarna))

Wikidata: [Q713182](https://www.wikidata.org/wiki/Q713182). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:SantaIsabelmap.png](https://commons.wikimedia.org/wiki/File:SantaIsabelmap.png) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | This map's source is here , with the uploader's modifications, and the GMT homepage says that the tools are released under the GNU General Public License. | Originally uploaded to en:Wikipedia ( log ) in April 2006 by Kelisi ( talk ). / 2008-03-03 19:59:19 | 495 × 487 | karta, nutida-foto, smal, staende |
- Nr 1: beskrivning: Map of Santa Isabel and neighbouring islands in the Solomon Islands. · kategorier: Maps of Santa Isabel Island

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `slaget-vid-komaki-nagakute`: Striderna vid Komaki och Nagakute (1584, Komaki och Nagakute i Owari, nära dagens Nagoya, Japan)

Wikidata: [Q1353633](https://www.wikidata.org/wiki/Q1353633). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Nagakute Historic Battlefield.jpg](https://commons.wikimedia.org/wiki/File:Nagakute_Historic_Battlefield.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: flagga CC BY-SA 3.0 – licensmallen (action=raw) kunde inte hämtas, så API:ets licens är inte korskontrollerad; licensmallen (action=raw) ej hämtad: HTTP 429 efter 3 försök | 立花左近 | 2011-09-20 / 2011-09-20 15:39:53 | 1280 × 960 | nutida-foto, licens-flagga |
- Nr 1: beskrivning: Nagakute Historic Battlefield located in Aichi pref.,Japan · kategorier: Battlefield of Nagakute; Memorial stones in Japan

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `belagringen-av-busan-1592`: Japanerna stormar Busan (1592, Busan, Korea)

Wikidata: [Q497046](https://www.wikidata.org/wiki/Q497046). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `korea-joseon`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Siege-of-Busanjin-1592.jpg](https://commons.wikimedia.org/wiki/File:Siege-of-Busanjin-1592.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | – / 2019-06-25 20:39:00 | 968 × 1467 | datum-osakert, staende |
- Nr 1: beskrivning: Japanese Siege of Busanjin (1592) · kategorier: Busanjin sunjeoldo; Piracy

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `farden-till-vastern-1592`: Färden till Västern ges ut (1592, Nanjing, Kina)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:HXD1D 0681 with Y406@NJH (20260519135010).jpg](https://commons.wikimedia.org/wiki/File:HXD1D_0681_with_Y406@NJH_(20260519135010).jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | N509FZ | 2026-05-19 13:50:10 / 2026-05-19 17:48:08 | 5254 × 3503 | nutida-foto, ur-sokning |
| 2 | [File:HXD1D 0681 with Y406@NJH (20260519135012).jpg](https://commons.wikimedia.org/wiki/File:HXD1D_0681_with_Y406@NJH_(20260519135012).jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | N509FZ | 2026-05-19 13:50:12 / 2026-05-19 17:48:08 | 6013 × 4009 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Y406 "Delta Star Express" from Shanghai West to Tianshui, departing on this "China Tourism Day". CR Shanghai's latest charter train using modified 25K's, with a 5-digit price for a 18-day journey along the Silk Road, co… · kategorier: China Railway HXD1D; Delta Star Express; May 2026 in rail transport in China; Trains at Nanjing Railway Station
- Nr 2: beskrivning: Y406 "Delta Star Express" from Shanghai West to Tianshui, departing on this "China Tourism Day". CR Shanghai's latest charter train using modified 25K's, with a 5-digit price for a 18-day journey along the Silk Road, co… · kategorier: China Railway HXD1D; Delta Star Express; May 2026 in rail transport in China; Trains at Nanjing Railway Station

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `sjoslaget-vid-hansan`: Sjöslaget vid Hansan (1592, Vid ön Hansan utanför Koreas sydkust)

Wikidata: [Q487332](https://www.wikidata.org/wiki/Q487332). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `korea-joseon`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Documentary painting of the Battle of Hansan Island.jpg](https://commons.wikimedia.org/wiki/File:Documentary_painting_of_the_Battle_of_Hansan_Island.jpg) | commons-sok | KOGL Type 1 (flagga); filsidan: flagga – licensen kunde inte avgöras (inga igenkända licensmallar; API: "KOGL Type 1") | War Memorial of Korea Open Archives | 2023-11-24 / 2023-11-24 06:21:37 | 1200 × 781 | nutida-foto, ur-sokning, licens-flagga |
- Nr 1: beskrivning: This is a documentary paint depicting the Joseon Navy under Admiral Yi Sun-shin defeating the Japanese Navy in the sea off Hansan Island in 1592. · kategorier: Hansan Island; Japanese invasions of Korea in art; Naval battles of the Imjin War

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `slaget-vid-chungju-1592`: Slaget vid Chungju (1592, Tangeumdae vid Chungju, Korea)

Wikidata: [Q486979](https://www.wikidata.org/wiki/Q486979). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `korea-joseon`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:회본태합기신립.jpg](https://commons.wikimedia.org/wiki/File:%ED%9A%8C%EB%B3%B8%ED%83%9C%ED%95%A9%EA%B8%B0%EC%8B%A0%EB%A6%BD.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | 일본, 조선왕조 | 2013-06-05 09:20:19 / 2013-09-24 16:24:21 | 588 × 404 | nutida-foto, smal |
- Nr 1: beskrivning: 회본태합기 삽화 · kategorier: Ehon Taikōki; Japanese invasions of Korea in art

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `belagringen-av-pyongyang-1593`: Belägringen av Pyongyang (1593, Pyongyang, Korea)

Wikidata: [Q14475856](https://www.wikidata.org/wiki/Q14475856). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `korea-joseon`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Chinapyongyangimjin.jpg](https://commons.wikimedia.org/wiki/File:Chinapyongyangimjin.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | before 1644 date QS:P,+1644-00-00T00:00:00Z/7,P1326,+1644-00-00T00:00:00Z/9 / 2011-01-22 15:04:03 | 600 × 424 | smal |
- Nr 1: beskrivning: Chinese cavalry and infantry attacking the walls of Pyongyang in 1593, from a Chinese painted screen in the Hizen-Nagoya castle museum · kategorier: Pyongyangseong gongbangdo; Soldiers of Ming

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `slaget-vid-haengju`: Slaget vid Haengju (1593, Fästningen Haengju vid Hanfloden, väster om Hanseong (Seoul))

Wikidata: [Q279611](https://www.wikidata.org/wiki/Q279611). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `korea-joseon`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Haengjudaecheopbi.jpg](https://commons.wikimedia.org/wiki/File:Haengjudaecheopbi.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | IRTC1015 | 2016-05-28 17:51:25 / 2016-06-05 15:02:34 | 3120 × 4160 | nutida-foto, konstverk, staende |
- Nr 1: beskrivning: 행주대첩 비(재건). · kategorier: Haengjusanseong; Monuments and memorials to the Japanese invasions of Korea; Siege of Haengju

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `sjoslaget-vid-myeongnyang`: Sjöslaget vid Myeongnyang (1597, Myeongnyangsundet vid ön Jindo, Korea)

Wikidata: [Q385677](https://www.wikidata.org/wiki/Q385677). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `korea-joseon`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Navalzhugenu2.jpg](https://commons.wikimedia.org/wiki/File:Navalzhugenu2.jpg) | wikidata-P18 | CC BY 1.0 (trolig); filsidan: godkand CC BY 1.0 | 太田天洋(1884～1946) | 2006-08-12 19:13:00 / 2006-08-12 19:13:11 | 464 × 368 | nutida-foto, smal |
- Nr 1: beskrivning: 『朝鮮戦役海戦図屏風』／昭和16年前後／太田天洋（海軍発注の戦意高揚画であり、特定の戦役を描写したものではないことに注意） · kategorier: Naval ships of Korea

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `adi-granth-i-gyllene-templet`: Adi Granth placeras i Gyllene templet (1604, Harmandir Sahib (Gyllene templet), Amritsar, Indien)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `miniatyr`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Golden Temple - Amritsar - Punjab - 0002.jpg](https://commons.wikimedia.org/wiki/File:Golden_Temple_-_Amritsar_-_Punjab_-_0002.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Rupeshsarkar | 2019-08-13 22:33:14 / 2020-09-11 09:35:40 | 4032 × 3024 | nutida-foto, ur-sokning |
| 2 | [File:Golden Temple - Amritsar - Punjab - 003.jpg](https://commons.wikimedia.org/wiki/File:Golden_Temple_-_Amritsar_-_Punjab_-_003.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Rupeshsarkar | 2019-08-13 10:13:49 / 2020-09-12 04:39:49 | 6547 × 1922 | nutida-foto, ur-sokning |
| 3 | [File:Golden Temple - Amritsar - Punjab - 0001.jpg](https://commons.wikimedia.org/wiki/File:Golden_Temple_-_Amritsar_-_Punjab_-_0001.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Rupeshsarkar | 2019-08-13 12:01:54 / 2020-09-12 04:10:39 | 4032 × 2865 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: The night view of the Golden Temple, also known as “Harmandir Sahib”, meaning "abode of God", is the preeminent spiritual site of Sikhism. The Gurdwara is built around a man-made pool (sarovar) that was completed by the… · kategorier: Atta Mandi Deori; Darshani Deori (Golden Temple); Golden Temple (Harmandir Sahib) illuminated; Harmandir Sahib causeway; Ramgarhia Bunga
- Nr 2: beskrivning: Panoramic View of The Golden Temple, also known as “Harmandir Sahib”, meaning "abode of God", is the preeminent spiritual site of Sikhism. The Gurdwara is built around a man-made pool (sarovar) that was completed by the… · kategorier: Atta Mandi Deori; Ghanta Ghar Deori; Golden Temple (Harmandir Sahib); Holy trees at Harmandir Sahib
- Nr 3: beskrivning: The Golden Temple, also known as “Harmandir Sahib”, meaning "abode of God", is the preeminent spiritual site of Sikhism. The Gurdwara is built around a man-made pool (sarovar) that was completed by the fourth Sikh Guru,… · kategorier: Ath Sath Tirath; Atta Mandi Deori; Golden Temple (Harmandir Sahib); Harmandir Sahib causeway

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `torres-seglar-genom-torressundet`: Torres seglar genom Torressundet (1606, Torressundet mellan Nya Guinea och Kap Yorkhalvön (i dag Papua Nya Guinea och Australien))

Wikidata: [Q179188](https://www.wikidata.org/wiki/Q179188). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Torres Strait.jpg](https://commons.wikimedia.org/wiki/File:Torres_Strait.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Transferred from en.wikipedia to Commons by OAlexander . | 27 February 2008 / 2008-02-27 22:55:05 | 444 × 446 | nutida-foto, smal, staende |
- Nr 1: beskrivning: The Torres Strait. Image courtesy of the Image Analysis Laboratory, NASA Johnson Space Center. · kategorier: PD NASA-AP; Torres Strait

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 16. `sakoku-japan-stanger`: Japan stänger sig (sakoku) (1633, Japan (Dejima, Nagasaki))

Wikidata: [Q332075](https://www.wikidata.org/wiki/Q332075). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `japan-ukiyoe`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:志筑忠雄訳「鎖国論」.jpg](https://commons.wikimedia.org/wiki/File:%E5%BF%97%E7%AD%91%E5%BF%A0%E9%9B%84%E8%A8%B3%E3%80%8C%E9%8E%96%E5%9B%BD%E8%AB%96%E3%80%8D.jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | 大島明秀 | 2016-03-24 12:12:05 / 2019-07-28 04:28:03 | 2054 × 3015 | nutida-foto, staende |
- Nr 1: beskrivning: 「鎖国論」上巻の内題、ケンペルの名が「検夫尓」と表記されている · kategorier: History of Japan; Sakoku

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 17. `spansk-chamorriska-krigen`: De spansk-chamorriska krigen (1670, Marianerna, började i Hagåtña på Guam (i dag Guam och Nordmarianerna, USA))

Wikidata: [Q105973572](https://www.wikidata.org/wiki/Q105973572). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `barock`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Women tending the gardens outside the government center on Guam.png](https://commons.wikimedia.org/wiki/File:Women_tending_the_gardens_outside_the_government_center_on_Guam.png) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Louis-Auguste de Sainson (1801-1887) | 19 th century date QS:P,+1850-00-00T00:00:00Z/7 / 2021-02-28 07:30:11 | 604 × 391 | smal, ur-sokning |
- Nr 1: beskrivning: Women tending the gardens outside the Spanish government center in Hagåtña, Guam · kategorier: Guam in the 19th century; Louis-Auguste de Sainson; Mariana Islands in the Spanish East Indies

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 18. `khalsa-grundas`: Guru Gobind Singh grundar Khalsa (1699, Anandpur Sahib, Punjab, Indien)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `miniatyr`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Fresco depicting Guru Gobind Singh formalizing the Khalsa Panth with the Panj Piare at Anandpur Sahib, from Gurdwara Babe-di-Ber, Sialkot, circa 19th century.jpg](https://commons.wikimedia.org/wiki/File:Fresco_depicting_Guru_Gobind_Singh_formalizing_the_Khalsa_Panth_with_the_Panj_Piare_at_Anandpur_Sahib,_from_Gurdwara_Babe-di-Ber,_Sialkot,_circa_19th_century.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | MaplesyrupSushi | September 2019 / 2026-04-09 01:02:06 | 1322 × 800 | nutida-foto, ur-sokning |
| 2 | [File:1 Sri Kesgarh Takhat Anandpur Sahib Khalsa birthplace Punjab India.jpg](https://commons.wikimedia.org/wiki/File:1_Sri_Kesgarh_Takhat_Anandpur_Sahib_Khalsa_birthplace_Punjab_India.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Ms Sarah Welch | 2017-09-18 13:13:28 / 2017-09-24 19:04:51 | 4032 × 3024 | nutida-foto, ur-sokning |
| 3 | [File:3 Sri Kesgarh Takhat Anandpur Sahib Punjab India Khalsa birthplace.jpg](https://commons.wikimedia.org/wiki/File:3_Sri_Kesgarh_Takhat_Anandpur_Sahib_Punjab_India_Khalsa_birthplace.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Ms Sarah Welch | 2017-09-18 13:35:53 / 2017-09-24 19:04:48 | 4032 × 3024 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Fresco depicting Guru Gobind Singh formalizing the Khalsa Panth with the Panj Piare/Pyare at Anandpur Sahib in 1699, from Gurdwara Babe-di-Ber/Beri Sahib, Sialkot, circa 19th century. The frescoes of the gurdwara were u…
- Nr 2: beskrivning: Takht Sri Keshgarh Sahib also known as Anandpur Sahib is the historic site in Sikhism where Khalsa was founded by Guru Gobind Singh. It is located near Himalayan foothills near the river Satluj. The site is second only… · kategorier: Khalsa; Takht Sri Kesgarh Sahib
- Nr 3: beskrivning: Takht Sri Keshgarh Sahib also known as Anandpur Sahib is the historic site in Sikhism where Khalsa was founded by Guru Gobind Singh. It is located near Himalayan foothills near the river Satluj. The site is second only… · kategorier: Khalsa; Takht Sri Kesgarh Sahib

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 19. `afghansk-marathiska-kriget`: Afghansk-marathiska kriget (1758, Punjab och trakten kring Delhi (började vid Sirhind))

Wikidata: [Q127257738](https://www.wikidata.org/wiki/Q127257738). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `miniatyr`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The Third battle of Panipat 13 January 1761.jpg](https://commons.wikimedia.org/wiki/File:The_Third_battle_of_Panipat_13_January_1761.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Anonymous Unknown author | circa 1770 date QS:P,+1770-00-00T00:00:00Z/9,P1480,Q5727902 / 2026-01-29 04:25:18 | 2000 × 1563 | ur-sokning |
| 2 | [File:The Richness of Indian Heritage.jpg](https://commons.wikimedia.org/wiki/File:The_Richness_of_Indian_Heritage.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Aryan Jadav | 2018-07-08 14:03:50 / 2021-09-03 10:36:27 | 4032 × 3024 | nutida-foto, ur-sokning |
| 3 | [File:Map of the Battles and Battlefields of the Bengal Subah.png](https://commons.wikimedia.org/wiki/File:Map_of_the_Battles_and_Battlefields_of_the_Bengal_Subah.png) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Borders drawn by Greatswrd | 2025-03-30 / 2025-03-30 12:13:33 | 1200 × 1000 | karta, nutida-foto, ur-sokning |
- Nr 1: beskrivning: A circa 1770 date QS:P,+1770-00-00T00:00:00Z/9,P1480,Q5727902 Faizabad style drawing of the Third battle of Panipat which took place on 13 January 1761. The centre of the image is dominated by the twin arcs of the lines… · kategorier: History of Haryana; Military history of Maharashtra; Military history of the Mughal Empire; Najibabad; Third Battle of Panipat
- Nr 2: beskrivning: Chhatrapati Shivaji Terminus Chhatrapati Shivaji Terminus (officially Chhatrapati Shivaji Maharaj Terminus; station code: CSTM (mainline)/ST (suburban)), is a historic terminal train station and UNESCO World Heritage Si… · kategorier: Chhatrapati Shivaji Maharaj Terminus building
- Nr 3: beskrivning: Map of the Bengal Subah and Nawabs of Bengal (1576-1793) and the approximate locations of their major recorded battles and battlefields. · kategorier: Maps of the history of Bengal

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 20. `sirhind-1758`: Marathas och sikher intar Sirhind (1758, Sirhind, Punjab)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `miniatyr`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Marathi letter references on Ala Singh of Patiala State (1).jpg](https://commons.wikimedia.org/wiki/File:Marathi_letter_references_on_Ala_Singh_of_Patiala_State_(1).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Maratha Confederacy | ca.1760's / 2024-08-23 22:47:01 | 525 × 775 | smal, staende, ur-sokning, samma-fil |
| 2 | [File:Marathi letter references on Ala Singh of Patiala State (2).jpg](https://commons.wikimedia.org/wiki/File:Marathi_letter_references_on_Ala_Singh_of_Patiala_State_(2).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Maratha Confederacy | ca.1760's / 2024-08-23 22:47:01 | 529 × 769 | smal, staende, ur-sokning, samma-fil |
- Nr 1: beskrivning: Marathi letter references on Ala Singh of Patiala State. Description [sic]: APPENDIX NO. 4. Marathi References on Baba Ala Singh From Vasu Deva Dikshitam to the Peshwa (Balaji Baji Rao). Nagar Mai, the representative of… · kategorier: Marathi language · samma fil föreslås också för `marathas-tar-delhi-1760`
- Nr 2: beskrivning: Marathi letter references on Ala Singh of Patiala State. Description [sic]: APPENDIX NO. 4. Marathi References on Baba Ala Singh From Vasu Deva Dikshitam to the Peshwa (Balaji Baji Rao). Nagar Mai, the representative of… · kategorier: Marathi language · samma fil föreslås också för `marathas-tar-delhi-1760`

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 21. `marathas-tar-delhi-1760`: Marathas tar Delhi (1760, Delhi)

Wikidata: [Q125745882](https://www.wikidata.org/wiki/Q125745882). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `miniatyr`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:1768 Jeffreys Wall Map of India and Ceylon - Geographicus - India-jeffreys-1768.jpg](https://commons.wikimedia.org/wiki/File:1768_Jeffreys_Wall_Map_of_India_and_Ceylon_-_Geographicus_-_India-jeffreys-1768.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | http://www.geographicus.com/mm5/cartographers/jefferys.txt | 1768 / 2011-03-23 13:16:39 | 7000 × 5455 | karta, ur-sokning |
| 2 | [File:Marathi letter references on Ala Singh of Patiala State (1).jpg](https://commons.wikimedia.org/wiki/File:Marathi_letter_references_on_Ala_Singh_of_Patiala_State_(1).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Maratha Confederacy | ca.1760's / 2024-08-23 22:47:01 | 525 × 775 | smal, staende, ur-sokning, samma-fil |
| 3 | [File:Marathi letter references on Ala Singh of Patiala State (2).jpg](https://commons.wikimedia.org/wiki/File:Marathi_letter_references_on_Ala_Singh_of_Patiala_State_(2).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Maratha Confederacy | ca.1760's / 2024-08-23 22:47:01 | 529 × 769 | smal, staende, ur-sokning, samma-fil |
- Nr 1: beskrivning: This is a staggering wall size map of India and Ceylon issued in 1768 by Thomas Jeffreys. Covers the Indian subcontinent from Mekran in the west to Assam and Aracan in the east, and from Bhutan in the north, south to Ce… · kategorier: The East Indies, with the roads (1768)
- Nr 2: beskrivning: Marathi letter references on Ala Singh of Patiala State. Description [sic]: APPENDIX NO. 4. Marathi References on Baba Ala Singh From Vasu Deva Dikshitam to the Peshwa (Balaji Baji Rao). Nagar Mai, the representative of… · kategorier: Marathi language · samma fil föreslås också för `sirhind-1758`
- Nr 3: beskrivning: Marathi letter references on Ala Singh of Patiala State. Description [sic]: APPENDIX NO. 4. Marathi References on Baba Ala Singh From Vasu Deva Dikshitam to the Peshwa (Balaji Baji Rao). Nagar Mai, the representative of… · kategorier: Marathi language · samma fil föreslås också för `sirhind-1758`

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 22. `svalten-i-bengalen-1770`: Svälten i Bengalen 1770 (1769, Bengalen och Bihar, i dag Indien och Bangladesh (markören i Murshidabad))

Wikidata: [Q2477522](https://www.wikidata.org/wiki/Q2477522). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `miniatyr`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Distressed Natives Going to the Relief Works - The Graphic 1874.jpg](https://commons.wikimedia.org/wiki/File:Distressed_Natives_Going_to_the_Relief_Works_-_The_Graphic_1874.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown artist Unknown artist | 18 April 1874 date QS:P571,+1874-04-18T00:00:00Z/11 / 2015-11-23 13:51:28 | 850 × 567 | – |
- Nr 1: beskrivning: "Distressed Natives Going to the Relief Works The Famine in Bengal. Illustration for The Graphic, 18 April 1874. https://www.lookandlearn.com/history-images/U233585/The-Famine-in-Bengal · kategorier: 1874 in West Bengal; Bihar famine of 1873–74; Bundles (luggage); Groups of people in West Bengal; The Graphic 1874

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 23. `tenmei-svalten`: Den stora Tenmei-svälten (1782, Tōhoku i norra Honshu, Japan (Hirosaki))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `japan-ukiyoe`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Great Tenmei famine.jpg](https://commons.wikimedia.org/wiki/File:Great_Tenmei_famine.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Unknown author Unknown author | 1790年代 / 2023-07-30 12:04:47 | 1007 × 705 | ur-sokning |
| 2 | [File:Shibamata-hachiman-jinja, sekihi-2.jpg](https://commons.wikimedia.org/wiki/File:Shibamata-hachiman-jinja,_sekihi-2.jpg) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Saigen Jiro | 2021-10-08 16:43:01 / 2021-10-10 22:34:34 | 5568 × 3712 | nutida-foto, ur-sokning |
| 3 | [File:Shibamata-hachiman-jinja 13.jpg](https://commons.wikimedia.org/wiki/File:Shibamata-hachiman-jinja_13.jpg) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Higa4 | 2023-06-24 12:38:10 / 2023-06-25 12:19:25 | 4032 × 3024 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Hungered people in the Great Tenmei famine (1782-1788). They ate horses and human meat. It was said to have been caused by the eruption of Mount Asama in 1783. · kategorier: Great Tenmei famine
- Nr 2: beskrivning: 柴又八幡神社 柴又勧農事績碑 · kategorier: 1826 sculptures in Japan; Great Tenmei famine; Steles at Shibamata-hachiman-jinja
- Nr 3: beskrivning: 柴又八幡神社 · kategorier: 1826 sculptures in Japan; Great Tenmei famine; Steles at Shibamata-hachiman-jinja

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 24. `forsta-opiumkriget`: Första opiumkriget (1839, Kinas kust från Pärlfloden till Yangtze (började vid Kowloon, i dagens Hongkong))

Wikidata: [Q191282](https://www.wikidata.org/wiki/Q191282). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Destroying Chinese war junks, by E. Duncan (1843).jpg](https://commons.wikimedia.org/wiki/File:Destroying_Chinese_war_junks,_by_E._Duncan_(1843).jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Edward Duncan | 30 May 1843 date QS:P571,+1843-05-30T00:00:00Z/11 / 2017-09-06 18:28:50 | 1040 × 681 | – |
- Nr 1: beskrivning: The East India Company iron steam ship Nemesis , commanded by Lieutenant W. H. Hall, with boats from the Sulphur , Calliope , Larne and Starling , destroying the Chinese war junks in Anson's Bay, on 7 January 1841. An e… · kategorier: 1841 in water transport; 1843 paintings; 1843 paintings from the United Kingdom; 19th-century oil paintings; Century of Humiliation; Chinese imperialism

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 25. `skarmytslingen-vid-kowloon-1839`: Skärmytslingen vid Kowloon (1839, Kowloon, dagens Hongkong)

Wikidata: [Q4871489](https://www.wikidata.org/wiki/Q4871489). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Hong-kong, from Kow-loon.jpg](https://commons.wikimedia.org/wiki/File:Hong-kong,_from_Kow-loon.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Drawn by Thomas Allom, from a sketch by Capt. Stoddart, Royal Navy. Engraved by S. Fisher. | 1841–1842 [1] / 2010-09-26 01:50:10 | 2258 × 1476 | – |
- Nr 1: beskrivning: Hong Kong from Kowloon. · kategorier: Historical images of Hong Kong skylines (Hong Kong Island); Historical images of Tsim Sha Tsui; Historical images of Victoria Harbour; Historical images of Victoria Peak; Hong Kong in the 1840s; Images from China, in a…

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 26. `britterna-intar-zhoushan-1840`: Britterna intar Zhoushan (1840, Dinghai på ön Zhoushan (Chusan), Zhejiang)

Wikidata: [Q5036997](https://www.wikidata.org/wiki/Q5036997). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Chusan conference 1840.jpg](https://commons.wikimedia.org/wiki/File:Chusan_conference_1840.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Drawn on the spot by Sir Harry Darell. Lithograph by James Henry Lynch. | Published January 1842 / 2016-06-26 23:02:55 | 7780 × 5205 | – |
- Nr 1: beskrivning: Conference between Commodore Sir James John Gordon Bremer and Chinese Admiral Zhang Chaofa (Governor of Chusan) with the chief Mandarins, on board HMS Wellesley of Captain Thomas Maitland, on 4 July 1840, in the harbour… · kategorier: 1842 lithographs; Capture of Chusan; George Burrell; Gordon Bremer; HMS Wellesley (ship, 1815); James Henry Lynch

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 27. `andra-slaget-vid-chuanbi`: Andra slaget vid Chuanbi (1841, Humen (Bogue) vid Pärlflodens mynning, Guangdong)

Wikidata: [Q7443080](https://www.wikidata.org/wiki/Q7443080). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Attack and Capture of Chuenpee, near Canton.jpg](https://commons.wikimedia.org/wiki/File:Attack_and_Capture_of_Chuenpee,_near_Canton.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Drawn by Thomas Allom, from a sketch by Lieut. White, Royal Marines. Engraved by H. Adlard. | published 1843 / 2010-09-18 20:01:58 | 2277 × 1404 | – |
| 2 | [File:Nemesis in Anson's Bay.jpg](https://commons.wikimedia.org/wiki/File:Nemesis_in_Anson%27s_Bay.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Thomas Allom | published 1858 / 2016-08-06 03:15:29 | 2007 × 1359 | – |
- Nr 1: beskrivning: Attack and capture of Chuenpee, near Canton. · kategorier: Henry Adlard; Images from China, in a Series of Views, Displaying the Scenery, Architecture, and Social Habits of that Ancient Empire; Paintings of the Qing Dynasty; Second Battle of Chuenpi
- Nr 2: beskrivning: The Nemesis and boats of the Sulphur, Calliope, Larne, and Starling destroying the Chinese war junks in Anson's Bay, 7 January 1841. · kategorier: Nemesis (ship, 1839); Second Battle of Chuenpi; Thomas Allom

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 28. `slaget-vid-zhenjiang-1842`: Slaget vid Zhenjiang (1842, Zhenjiang vid Yangtze och Kejsarkanalen, Jiangsu)

Wikidata: [Q4870730](https://www.wikidata.org/wiki/Q4870730). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:West Gate of Ching-Keang-Foo 1842.jpg](https://commons.wikimedia.org/wiki/File:West_Gate_of_Ching-Keang-Foo_1842.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Drawn by Thomas Allom, from a sketch on the spot by Capt. James Stoddart, RN. Engraved by J. M. Starling. | published 1843 / 2016-06-24 20:55:06 | 4493 × 2950 | – |
- Nr 1: beskrivning: West gate of Ching-Keang-Foo , 21 July 1842. · kategorier: Battle of Chinkiang; J. M. Starling; Thomas Allom

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 29. `norra-expeditionen-taiping`: Norra expeditionen mot Peking (1853, Från Yangzhou norrut mot Tianjin)

Wikidata: [Q6140803](https://www.wikidata.org/wiki/Q6140803). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Chiang Kai-Shek paying reverence at the tomb of the late Dr. Sun Yat-Sen, August 04, 1928.jpg](https://commons.wikimedia.org/wiki/File:Chiang_Kai-Shek_paying_reverence_at_the_tomb_of_the_late_Dr._Sun_Yat-Sen,_August_04,_1928.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | Taken on 6 July 1928 / 2022-08-27 18:35:34 | 2048 × 1463 | ur-sokning |
- Nr 1: beskrivning: (Original Caption) 8/4/1928-Peking, China: China's three military leaders are paying reverence at the tomb of the late Dr. Sun Yat-Sen. This photo shows General Kiang Kin Shih, the speaker at this memorial service. · kategorier: 1928 black and white photographs in Beijing; Chiang Kai-shek in 1928; Chiang Kai-shek in China; Northern Expedition; Sun Yat-sen; Temple of Azure Clouds

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `saavedra-over-stilla-havet`: Saavedra seglar från Mexiko över Stilla havet (1527)
- `portugiserna-landstiger-i-massawa`: Portugisisk hjälp når Etiopien (1541)
- `francis-xavier-i-japan`: Francis Xavier kommer till Japan (1549)
- `hoei-utbrottet-1707`: Fuji får sitt senaste utbrott (1707)
- `slaget-vid-barari-ghat`: Slaget vid Barari Ghat (1760)
- `slaget-vid-kunjpura`: Slaget vid Kunjpura (1760)
- `hanaoka-narkos-1804`: Hanaoka Seishū opererar under narkos (1804)
- `bab-framtrader-1844`: Báb träder fram i Shiraz (1844)

## Val 2026-11-26 (#2066 och #2067)

14 av 40 händelser fick bild. Filsidorna öppnades via `action=raw` och bilderna granskades visuellt i en kontaktbild.

- Avvisat efter att filsidan öppnats: `slaget-vid-wofla` (CC0 på ett verk från cirka 1900, osäkert), `portugiserna-landstiger-i-massawa` (källa okänd), `tenmei-svalten` (osäker licens och obehaglig bild), `sjoslaget-vid-hansan` (KOGL Type 1), `khalsa-grundas` (religiös bild, svag proveniens), `svalten-i-bengalen-1770` (fel hungersnöd), `andra-slaget-vid-chuanbi` (hör till januaristriderna 1841).
- Byte: `jintianupproret` fick först ett foto med en modern staty i centrum (konstverk, tänkbar panoramafrihet) och byttes mot ett foto av stenen på det gamla kasernområdet.
- `francis-xavier-i-japan` fick den välkända japanska kristna målningen från cirka 1600 (Kyoto University Museum) i stället för en 1800-talsbild med Facebook som källa.
- Händelserna `imjinkriget`, `taipingupproret` och `jintianupproret` saknades i den automatiska listan (de har `start` i stället för `year`); de lades in manuellt efter egen sökning.
- Egen sökning: `francis-xavier-i-japan`, `hoei-utbrottet-1707`, `hanaoka-narkos-1804`, `imjinkriget`, `taipingupproret`, `jintianupproret`, `portugiserna-landstiger-i-massawa`, `khalsa-grundas`, `belagringen-av-pyongyang-1593`.
