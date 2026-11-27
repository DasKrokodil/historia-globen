# Granskningslista för bildomgång asien-3

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=35 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 35. **Med minst en användbar kandidat:** 18. **Utan kandidat:** 17.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `asien-3-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/asien-3-lista.txt`.

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

## 1. `belagringen-av-dapur`: Ramses II belägrar Dapur (1269 f.Kr., Dapur, troligen i Syrien norr om Kadesh (läget är omstritt))

Wikidata: [Q1629242](https://www.wikidata.org/wiki/Q1629242). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ramses II besieging the Cheta people in Dapur.jpg](https://commons.wikimedia.org/wiki/File:Ramses_II_besieging_the_Cheta_people_in_Dapur.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown, published in 1879 | 1879-01-01 / 2020-06-14 10:48:36 | 1846 × 850 | – |
- Nr 1: beskrivning: Other version Ramses II besieging the Cheta people in Dapur · kategorier: Illustrations of Ramses II

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `feniciska-alfabetet`: Det feniciska alfabetet (1050 f.Kr., Fenicien, med Byblos i dagens Libanon)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Phoenician alphabet as was discovered in Byblos.png](https://commons.wikimedia.org/wiki/File:Phoenician_alphabet_as_was_discovered_in_Byblos.png) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1949 / 2019-05-26 15:17:12 | 1776 × 1512 | ur-sokning |
| 2 | [File:Hamakar's comparison of "Phoenician" inscriptions, 1828.jpg](https://commons.wikimedia.org/wiki/File:Hamakar%27s_comparison_of_%22Phoenician%22_inscriptions,_1828.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Hendrik Arent Hamaker | 1828 / 2020-10-23 08:01:30 | 4307 × 3478 | ur-sokning |
| 3 | [File:Phoenicians' alphabet.jpg](https://commons.wikimedia.org/wiki/File:Phoenicians%27_alphabet.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand-med-not CC BY-SA 4.0 – flera licenser: Public domain, CC BY-SA 4.0 | रोहित साव27 | 2020-08-28 / 2020-08-27 23:23:39 | 2752 × 2340 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Phoenician alphabet as was discovered in Byblos. · kategorier: Byblos syllabary
- Nr 2: beskrivning: Plates from Hamaker's Miscellanea Phoenicia · kategorier: Hendrik Arent Hamaker; Phoenician alphabet charts
- Nr 3: beskrivning: {| class="licensetpl" style="display:none" | Public domain Public domain false false |} This work is in the public domain in its country of origin and other countries and areas where the copyright term is the author's l… · kategorier: Phoenician alphabet charts

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `bronstrummor-fran-dong-son`: Bronstrummorna från Đông Sơn (1000 f.Kr., Röda flodens delta, Vietnam; punkten är Cổ Loa, där en av trummorna hittades)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Tambour-song-da2.jpg](https://commons.wikimedia.org/wiki/File:Tambour-song-da2.jpg) | commons-sok | Public domain (trolig); filsidan: godkand-med-not Public domain – flera licenser: Public domain, CC0 |  | – / 2014-02-25 20:28:34 | 3255 × 2917 | datum-osakert, ur-sokning |
| 2 | [File:Warring States and Han Bronze Drums.jpg](https://commons.wikimedia.org/wiki/File:Warring_States_and_Han_Bronze_Drums.jpg) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Gary Todd | 2011-03-17 16:38:34 / 2021-02-03 06:49:29 | 4752 × 3168 | nutida-foto, ur-sokning |
| 3 | [File:Warring States and Han Bronze Drums 2.jpg](https://commons.wikimedia.org/wiki/File:Warring_States_and_Han_Bronze_Drums_2.jpg) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Gary Todd | 2011-03-17 16:38:12 / 2021-02-03 08:03:16 | 3168 × 4752 | nutida-foto, staende, ur-sokning |
- Nr 1: beskrivning: Drum From Song Da Vietnam . Dong Son II Culture. Mid 1st millennium BCE. Bronze · kategorier: Art of Vietnam in the Musée Guimet; Dong Son bronze drums
- Nr 2: beskrivning: Guangxi Provincial Museum, Nanning. Complete indexed photo collection at WorldHistoryPics.com. · kategorier: Bronze drums of China; Bronze in the Guangxi Museum; Dong Son bronze drums
- Nr 3: beskrivning: Guangxi Provincial Museum, Nanning. Complete indexed photo collection at WorldHistoryPics.com. · kategorier: Bronze drums of China; Bronze in the Guangxi Museum; Dong Son bronze drums

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `babyloniska-astronomiska-dagbocker`: Babyloniska astronomiska dagböcker (747 f.Kr., Babylon i dagens Irak)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Babylonian astronomical diary recording the death of Alexander the Great (British Museum).jpg](https://commons.wikimedia.org/wiki/File:Babylonian_astronomical_diary_recording_the_death_of_Alexander_the_Great_(British_Museum).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Shaunnol | 2006-08-22 / 2008-09-18 16:04:00 | 2272 × 1704 | nutida-foto, ur-sokning |
| 2 | [File:British Museum, Babylon Astronomical Diary, 331-330 BC.jpg](https://commons.wikimedia.org/wiki/File:British_Museum,_Babylon_Astronomical_Diary,_331-330_BC.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Brigade Piron | 2023-02-19 11:15:07 / 2023-02-19 18:23:53 | 4000 × 3000 | nutida-foto, ur-sokning |
| 3 | [File:Plejaden-Schaltregel.png](https://commons.wikimedia.org/wiki/File:Plejaden-Schaltregel.png) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Bautsch | 2022-10-11 / 2022-10-10 23:30:52 | 6980 × 2880 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: A diary of space and weather observations from the year 323-322 BC that records the death of Alexander the Great , referring to him simply as "The King". On display at the British Museum , London . British Museum 45962:… · kategorier: 320s BC; Astronomy clay tablets; Babylonian astronomy; Babylonian clay tablets; Death of Alexander the Great; Department of the Middle East, British Museum
- Nr 2: beskrivning: Babylonian tablet forming part of an astronomical diary which is the earliest contemporary record of the battle of Gaugamela in 331 BC. It records a lunar eclipse supposedly bringing about death and plague linked to Dar… · kategorier: Astronomy clay tablets; Battle of Gaugamela; Darius III; Room 52, British Museum
- Nr 3: beskrivning: Die Plejaden-Schaltregel im Monat Nisannu (Horizont dunkelgrün, Ekliptik rot gepunktet): Im Jahr X ist das Neulicht des Mondes am 1. Nisannu noch direkt über dem Horizont neben den Plejaden zu sehen. Im Jahr X steht die… · kategorier: Babylonian astronomy; Pleiades (star cluster)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `dosarna-i-gochang`: Dösarna i Gochang (700 f.Kr., Gochang, Jeonbuk, Sydkorea (punkten är kommunens mitt))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Gochang Dolmens, South Korea.jpg](https://commons.wikimedia.org/wiki/File:Gochang_Dolmens,_South_Korea.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Lance Vanlewen | 2018-12-16 11:26:06 / 2020-05-07 23:23:03 | 4096 × 3072 | nutida-foto, ur-sokning |
| 2 | [File:Gochang Dolmens Skyline, South Korea.jpg](https://commons.wikimedia.org/wiki/File:Gochang_Dolmens_Skyline,_South_Korea.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Lance Vanlewen | 2018-12-16 11:58:19 / 2020-05-07 23:23:01 | 4336 × 896 | nutida-foto, ur-sokning |
| 3 | [File:Korea-Gwangju-Gochang Dolmens 5349-06.JPG](https://commons.wikimedia.org/wiki/File:Korea-Gwangju-Gochang_Dolmens_5349-06.JPG) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Steve46814 | 2006-06-19 / 2009-09-21 22:01:45 | 1178 × 826 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Gochang Dolmens, South Korea · kategorier: Gochang Dolmens
- Nr 2: beskrivning: Gochang Dolmens Skyline, South Korea · kategorier: Gochang Dolmens
- Nr 3: beskrivning: This dolmen is one of the largest dolmens at the Gochang Jungnim-ri Dolmens and are centered in Maesan village, Gochang County, North Jeolla province. · kategorier: Gochang Dolmens

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `qanaterna-i-gonabad`: Qanaterna i Gonabad (700 f.Kr., Gonabad, Razavi Khorasan, Iran)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ghasabe Qanats of Gonabad.jpg](https://commons.wikimedia.org/wiki/File:Ghasabe_Qanats_of_Gonabad.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Tavasoli mohsen | 2015-04-06 10:55:53 / 2020-10-03 18:13:47 | 4610 × 2593 | nutida-foto, konstverk, ur-sokning |
| 2 | [File:Ghanat ghasabeh, khorasan razavi, gonabad (cropped).jpg](https://commons.wikimedia.org/wiki/File:Ghanat_ghasabeh,_khorasan_razavi,_gonabad_(cropped).jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Behzadjourabchi | 2019-03-01 12:32:40 / 2021-05-18 06:44:57 | 5724 × 1298 | nutida-foto, konstverk, ur-sokning |
| 3 | [File:Ghanat ghasabeh, khorasan razavi, gonabad.jpg](https://commons.wikimedia.org/wiki/File:Ghanat_ghasabeh,_khorasan_razavi,_gonabad.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Behzadjourabchi | 2019-03-01 12:32:40 / 2020-10-05 15:10:38 | 5724 × 3888 | nutida-foto, konstverk, ur-sokning |
- Nr 1: beskrivning: This is a photo of a monument in Iran identified by the ID · kategorier: Qasabeh Qanat
- Nr 2: beskrivning: This is a photo of a monument in Iran identified by the ID · kategorier: Qasabeh Qanat
- Nr 3: beskrivning: This is a photo of a monument in Iran identified by the ID · kategorier: Qasabeh Qanat

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `meroe-blir-huvudstad`: Meroë blir Kushrikets huvudstad (591 f.Kr., Meroë vid Nilen (i dag Sudan))

Wikidata: [Q5780](https://www.wikidata.org/wiki/Q5780). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Sudan Meroe Pyramids 2001.JPG](https://commons.wikimedia.org/wiki/File:Sudan_Meroe_Pyramids_2001.JPG) | wikidata-P18 | CC BY-SA 1.0 (trolig); filsidan: godkand CC BY-SA 1.0 | Photographer: B N Chagny | roku 2001 SFDAS 2001 / 2005-09-24 11:41:57 | 591 × 403 | nutida-foto, smal |
- Nr 1: beskrivning: Aerial view of the Nubian pyramids at Meroe in 2001 · kategorier: 2001 photographs of Sudan; Aerial photographs of Sudan; Pyramids of Meroe

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `kyros-grundar-perserriket`: Kyros den store besegrar mederna och grundar Perserriket (550 f.Kr., Ekbatana, mederrikets huvudstad (i dag Hamadan i Iran))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The story of the greatest nations; a comprehensive history, extending from the earliest times to the present, founded on the most modern authorities, and including chronological summaries and (14780871184).jpg](https://commons.wikimedia.org/wiki/File:The_story_of_the_greatest_nations;_a_comprehensive_history,_extending_from_the_earliest_times_to_the_present,_founded_on_the_most_modern_authorities,_and_including_chronological_summaries_and_(14780871184).jpg) | commons-sok | No restrictions (flagga); filsidan: flagga – licensen kunde inte avgöras (inga igenkända licensmallar; API: "No restrictions") | Internet Archive Book Images | 1913 / 2015-09-14 16:23:38 | 1994 × 796 | ur-sokning, licens-flagga |
| 2 | [File:The story of the greatest nations; a comprehensive history, extending from the earliest times to the present, founded on the most modern authorities, and including chronological summaries and (14803083693).jpg](https://commons.wikimedia.org/wiki/File:The_story_of_the_greatest_nations;_a_comprehensive_history,_extending_from_the_earliest_times_to_the_present,_founded_on_the_most_modern_authorities,_and_including_chronological_summaries_and_(14803083693).jpg) | commons-sok | No restrictions (flagga); filsidan: flagga – licensen kunde inte avgöras (inga igenkända licensmallar; API: "No restrictions") | Internet Archive Book Images | 1913 / 2015-09-14 15:42:43 | 508 × 1382 | smal, staende, ur-sokning, licens-flagga |
- Nr 1: beskrivning: Identifier : storyofgreatestn01elli ( find matches ) Title : The story of the greatest nations; a comprehensive history, extending from the earliest times to the present, founded on the most modern authorities, and incl… · kategorier: Pergamon in art; The story of the greatest nations; a comprehensive history, extending from the earliest times to the present (1913)
- Nr 2: beskrivning: Identifier : storyofgreatestn01elli ( find matches ) Title : The story of the greatest nations; a comprehensive history, extending from the earliest times to the present, founded on the most modern authorities, and incl… · kategorier: B in art; The story of the greatest nations; a comprehensive history, extending from the earliest times to the present (1913)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `guldmannen-i-issyk`: Guldmannen i Issykkurganen (400 f.Kr., Issyk, omkring 50 km öster om Almaty, Kazakstan)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Issyk kurgan (Golden Man belt).jpg](https://commons.wikimedia.org/wiki/File:Issyk_kurgan_(Golden_Man_belt).jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | eggry | 2018-12-05 19:21:51 / 2023-10-20 16:00:50 | 3238 × 2160 | nutida-foto, ur-sokning |
| 2 | [File:Issyk kurgan Flying elk with griffin.jpg](https://commons.wikimedia.org/wiki/File:Issyk_kurgan_Flying_elk_with_griffin.jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | eggry | 2018-12-05 19:16:50 / 2023-10-20 16:33:10 | 2879 × 1780 | nutida-foto, ur-sokning |
| 3 | [File:Issyk Kurgan sword.jpg](https://commons.wikimedia.org/wiki/File:Issyk_Kurgan_sword.jpg) | commons-sok | CC BY 2.5 (trolig); filsidan: godkand CC BY 2.5 | eggry | 2025-03-13 / 2025-03-13 06:57:07 | 1644 × 449 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Issyk kurgan (Golden Man belt) · kategorier: Issyk Golden Cataphract Warrior; Issyk kurgan; The Cradleland of the Golden Man
- Nr 2: beskrivning: Issyk kurgan tiger · kategorier: Issyk kurgan; The Cradleland of the Golden Man
- Nr 3: beskrivning: Issyk Kurgan sword · kategorier: Issyk Golden Cataphract Warrior; Issyk kurgan

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `belagringen-av-tyros`: Belägringen av Tyros (332 f.Kr., Tyros i Fenikien, i dagens Libanon)

Wikidata: [Q815233](https://www.wikidata.org/wiki/Q815233). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Siege tryre.gif](https://commons.wikimedia.org/wiki/File:Siege_tryre.gif) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Frank Martini. Cartographer, Department of History, United States Military Academy | – / 2006-02-24 13:09:24 | 738 × 563 | karta, datum-osakert, smal |
- Nr 1: beskrivning: Siege of Tyre. · kategorier: Ancient wars; Macedonian army; Maps of Alexander the Great's wars; Maps of Asia in the 4th century BC; Maps of Phoenicia; Maps of the United States Military Academy

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `nearchos-flotta-fran-indus`: Nearchos flotta seglar från Indus till Persiska viken (326 f.Kr., Kusten vid Karachi, Pakistan; Manora, som har identifierats med Nearchos Morontobara)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The story of the greatest nations, from the dawn of history to the twentieth century - a comprehensive history, founded upon the leading authorities, including a complete chronology of the world, and (14578669410).jpg](https://commons.wikimedia.org/wiki/File:The_story_of_the_greatest_nations,_from_the_dawn_of_history_to_the_twentieth_century_-_a_comprehensive_history,_founded_upon_the_leading_authorities,_including_a_complete_chronology_of_the_world,_and_(14578669410).jpg) | commons-sok | No restrictions (flagga); filsidan: flagga – licensen kunde inte avgöras (inga igenkända licensmallar; API: "No restrictions") | Ellis, Edward Sylvester, 1840-1916; Horne, Charles F. (Charles Francis), 1870-1942 | 1900 / 2015-10-18 23:02:08 | 3008 × 2124 | ur-sokning, licens-flagga |
- Nr 1: beskrivning: Identifier : storyofgreatestn02elli ( find matches ) Title : The story of the greatest nations, from the dawn of history to the twentieth century : a comprehensive history, founded upon the leading authorities, includin… · kategorier: Alexander the Great and Hephaistion; Engravings of Alexander the Great; Marriage in art; Stateira II; Susa; The story of the greatest nations, from the dawn of history to the twentieth century (1900)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `slaget-vid-hydaspes`: Slaget vid Hydaspes (326 f.Kr., Floden Hydaspes (i dag Jhelum) i Punjab, Pakistan)

Wikidata: [Q213074](https://www.wikidata.org/wiki/Q213074). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `indien-relief`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Le Brun, Alexander and Porus.jpg](https://commons.wikimedia.org/wiki/File:Le_Brun,_Alexander_and_Porus.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Charles Le Brun | 1673 date QS:P571,+1673-00-00T00:00:00Z/9 / 2015-11-04 09:04:11 | 2000 × 868 | – |
| 2 | [File:The phalanx attacking the centre in the battle of the Hydaspes by Andre Castaigne (1898-1899).jpg](https://commons.wikimedia.org/wiki/File:The_phalanx_attacking_the_centre_in_the_battle_of_the_Hydaspes_by_Andre_Castaigne_(1898-1899).jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | André Castaigne | between circa 1898 and circa 1899 date QS:P,+1898-00-00T00:00:00Z/8,P1319,+1898-00-00T00:00:00Z/9,P1326,+1899-00-00T00:00:00Z/9,P1480,Q5727902 / 2011-12-25 15:02:29 | 1534 × 2244 | staende |
| 3 | [File:LubokAlexanderPorus.jpg](https://commons.wikimedia.org/wiki/File:LubokAlexanderPorus.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Anonymous folk artist | XVIIIth century (first half) / 2008-03-03 18:29:27 | 700 × 273 | smal |
- Nr 1: beskrivning: Alexander and Porus by Charles Le Brun , painted 1673. Le Brun also spelled LEBRUN (b. Feb. 24, 1619, Paris, France--d. Feb. 12, 1690, Paris), painter and designer who became the arbiter of artistic production in France… · kategorier: History of Alexander the great (Le Brun); Paintings of Alexander the Great and Porus
- Nr 2: beskrivning: Alexander old drawings from Century Magazine. · kategorier: 1911 in art; Battle of Hydaspes; Engravings of Alexander the Great (André Castaigne); Military drawings; People with elephants in art; War elephants of India
- Nr 3: beskrivning: The glorious battle of Alexander, King of Macedon, and Porus, King of India. Russian lubok. · kategorier: Alexander the Great and Porus; Battle of Hydaspes; Lubok; Miniatures of Alexander the Great

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `alexanders-dod`: Alexander dör i Babylon (323 f.Kr., Nebukadnessar II:s palats i Babylon, i dagens Irak)

Wikidata: [Q5247391](https://www.wikidata.org/wiki/Q5247391). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Entry of Alexander in Babylon.jpg](https://commons.wikimedia.org/wiki/File:Entry_of_Alexander_in_Babylon.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Charles Le Brun (design) | between 1670 and 1682 date QS:P,+1650-00-00T00:00:00Z/7,P1319,+1670-00-00T00:00:00Z/9,P1326,+1682-00-00T00:00:00Z/9 / 2015-11-04 09:52:11 | 2143 × 1314 | ur-sokning |
| 2 | [File:Alexander the Great's Entry into Babylon - Thorvaldsens Museum - DSC08773.JPG](https://commons.wikimedia.org/wiki/File:Alexander_the_Great%27s_Entry_into_Babylon_-_Thorvaldsens_Museum_-_DSC08773.JPG) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Daderot | 2012-05-11 09:36:43 / 2012-07-05 10:25:52 | 4320 × 3240 | nutida-foto, ur-sokning |
| 3 | [File:Alexander the Great's Entry into Babylon - Thorvaldsens Museum - DSC08771.JPG](https://commons.wikimedia.org/wiki/File:Alexander_the_Great%27s_Entry_into_Babylon_-_Thorvaldsens_Museum_-_DSC08771.JPG) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Daderot | 2012-05-11 09:36:15 / 2012-07-05 10:25:37 | 4320 × 3240 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Entry of Alexander in Babylon · kategorier: Gobelins tapestries after Le Brun History of Alexander
- Nr 2: beskrivning: Sculpture in Thorvaldsens Museum, Copenhagen, Denmark. Sculptor: Bertel Thorvaldsen (c. 1770-1844). Photography was permitted in the museum without restriction. This artwork is now in the public domain because the artis… · kategorier: Alexander the Great in Babylon frieze by Bertel Thorvaldsen (Thorvaldsen Museum); Entrance of Alexander the Great into Babylon
- Nr 3: beskrivning: Sculpture in Thorvaldsens Museum, Copenhagen, Denmark. Sculptor: Bertel Thorvaldsen (c. 1770-1844). Photography was permitted in the museum without restriction. This artwork is now in the public domain because the artis… · kategorier: Alexander the Great in Babylon frieze by Bertel Thorvaldsen (Thorvaldsen Museum); Entrance of Alexander the Great into Babylon

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `cuju-bollspel-i-kina`: Cuju, ett tidigt bollspel i Kina (300 f.Kr., Ruinerna av Linzi, Qis huvudstad, i Zibo, Shandong, Kina)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Chinese Football Charm - China Numismatics (中國錢幣) 02.jpg](https://commons.wikimedia.org/wiki/File:Chinese_Football_Charm_-_China_Numismatics_(%E4%B8%AD%E5%9C%8B%E9%8C%A2%E5%B9%A3)_02.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown authorship during the Song Dynasty period (960-1279 AD). | Song Dynasty period (960-1279 AD). / 2023-07-23 17:35:10 | 600 × 598 | smal, staende, ur-sokning |
- Nr 1: beskrivning: The reverse side of this old Song Dynasty period Chinese football charm would display, in a minimalist style, the traditional symbols of a man (Chinese dragon) and a woman (Fenghuang). The animated dragon can be recogni… · kategorier: Chinese football charms; Numismatic charms of the Song Dynasty

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `asokas-inskrifter`: Asokas inskrifter (268 f.Kr., Girnar i Gujarat, en av många platser i dagens Indien, Nepal, Pakistan, Bangladesh och Afghanistan)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `indien-relief`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ashoka's Major Rock Edict, Girnar Gujarat 001.jpg](https://commons.wikimedia.org/wiki/File:Ashoka%27s_Major_Rock_Edict,_Girnar_Gujarat_001.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Snehrashmi | 2020-02-21 18:09:43 / 2020-09-21 04:25:26 | 4000 × 3000 | nutida-foto, ur-sokning |
| 2 | [File:Ashoka Rock Edict at Junagadh.jpg](https://commons.wikimedia.org/wiki/File:Ashoka_Rock_Edict_at_Junagadh.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Jadia gaurang at English Wikipedia | 25 December 2007 (original upload date) / 2012-11-01 02:45:09 | 1280 × 960 | nutida-foto, ur-sokning |
| 3 | [File:Well prserved rock edict from Gujarat.jpg](https://commons.wikimedia.org/wiki/File:Well_prserved_rock_edict_from_Gujarat.jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Prince Roy | 2006-01-13 / 2009-08-01 05:47:23 | 500 × 375 | nutida-foto, smal, ur-sokning |
- Nr 1: beskrivning: Ashokan Rock Edicts, Girnar, Junagadh · kategorier: Ashoka Major Rock Edict, Girnar
- Nr 2: beskrivning: This image is of Ashoka's Rock edict at Junagadh. I have captured it when I visited Janagadh early 2007. · kategorier: Ashoka Major Rock Edict, Girnar
- Nr 3: beskrivning: Replica of Ashoka's Major Rock Edict from Girnar, Gujarat displayed outside the main entrance of the National Museum, Delhi · kategorier: Ashoka Major Rock Edict, Girnar; Collections of the National Museum, New Delhi

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 16. `qins-enandekrig`: Qins enandekrig (230 f.Kr., Norra och mellersta Kina (började i staten Han))

Wikidata: [Q2986801](https://www.wikidata.org/wiki/Q2986801). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Hou Xuanxuan The situation map of Qin's war.gif](https://commons.wikimedia.org/wiki/File:Hou_Xuanxuan_The_situation_map_of_Qin%27s_war.gif) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Benedetta blair | 2015-12-14 / 2015-12-14 14:24:59 | 2372 × 2074 | karta, nutida-foto |
- Nr 1: beskrivning: Qin's wars of unification Describe the Strength of 6 states before the wars and the year and the process of unification. Compare the annual change in the territory. · kategorier: Animated maps of China; Maps of the Qin Dynasty

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 17. `lejontemplet-i-musawwarat-es-sufra`: Lejontemplet åt Apedemak i Musawwarat es-Sufra (220 f.Kr., Musawwarat es-Sufra, Sudan)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Apedemak temple in Musawwarat es-sufra 2018.jpg](https://commons.wikimedia.org/wiki/File:Apedemak_temple_in_Musawwarat_es-sufra_2018.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Vaido Otsar | 2018-02-23 11:44:08 / 2018-03-06 18:52:11 | 4522 × 3015 | nutida-foto, ur-sokning |
| 2 | [File:Apedemak (lion) temple in Musawwarat es-sufra (1) (34081397596).jpg](https://commons.wikimedia.org/wiki/File:Apedemak_(lion)_temple_in_Musawwarat_es-sufra_(1)_(34081397596).jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Hans Birger Nilsen | 2017-03-24 10:35 / 2017-06-23 19:57:37 | 3482 × 2019 | nutida-foto, ur-sokning |
| 3 | [File:MusawwaratLionTemple.jpg](https://commons.wikimedia.org/wiki/File:MusawwaratLionTemple.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Clemens Schmillen | 2017-01-01 / 2018-12-30 17:47:31 | 1024 × 683 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Apedemak (lion) temple in Musawwarat es-sufra · kategorier: Temple of Apedemak in Musawwarat es-Sufra
- Nr 2: beskrivning: Apedemak (lion) temple in Musawwarat es-sufra (1) · kategorier: March 2017 in Sudan; Temple of Apedemak in Musawwarat es-Sufra
- Nr 3: beskrivning: Musawwarat Apademak Temple · kategorier: Temple of Apedemak in Musawwarat es-Sufra

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 18. `chu-han-kriget`: Chu–Han-kriget (206 f.Kr., Guanzhong runt Qins gamla huvudstad Xianyang, nordvästra Kina (samtidigt uppror i Qi i öster))

Wikidata: [Q1151705](https://www.wikidata.org/wiki/Q1151705). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Chu-Han Contention.png](https://commons.wikimedia.org/wiki/File:Chu-Han_Contention.png) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | SY | 2017-07-08 / 2017-07-08 21:56:39 | 1275 × 902 | karta, nutida-foto |
- Nr 1: beskrivning: Map of Chu-Han Contention between Qin and Han dynasties. · kategorier: Liu Bang; Maps of the Qin Dynasty; Maps of the Western Han Dynasty

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `nauru-befolkas`: Nauru befolkas (1000 f.Kr.)
- `risodlingen-nar-japan`: Risodlingen når Japan (1000 f.Kr.)
- `arvsmassa-fran-palau`: Palauernas långa släktlinje (975 f.Kr.)
- `lapitafolket-pa-taumako`: Lapitafolket på Taumako (900 f.Kr.)
- `riket-dmt`: Riket D'mt på Etiopiens och Eritreas högland (800 f.Kr.)
- `stora-dammen-i-marib`: Den stora dammen i Marib (800 f.Kr.)
- `arvsmassa-fran-watom`: Arvsmassa från Watom under lapitatiden (751 f.Kr.)
- `paninis-grammatik`: Pāṇinis grammatik för sanskrit (600 f.Kr.)
- `skylax-seglar-nerfor-indus`: Skylax seglar nerför Indus (519 f.Kr.)
- `kungsvagen-susa-sardes`: Kungsvägen mellan Susa och Sardes (500 f.Kr.)
- `meroitisk-skrift`: Kushriket får egen skrift: meroitisk skrift (300 f.Kr.)
- `qin-erovrar-han`: Qin erövrar Han (230 f.Kr.)
- `handan-faller-228-fkr`: Zhaos huvudstad Handan faller (228 f.Kr.)
- `qin-intar-ji`: Qin intar Yans huvudstad Ji (226 f.Kr.)
- `daliang-satts-under-vatten`: Qin sätter Daliang under vatten (225 f.Kr.)
- `qin-erovrar-chu`: Chu faller (223 f.Kr.)
- `slaget-vid-pengcheng`: Slaget vid Pengcheng (205 f.Kr.)

## Val 2026-11-26 (#2060 och #2061)

16 av 40 händelser fick bild. Filsidorna öppnades via `action=raw` och bilderna granskades visuellt.

- Ur listan: `belagringen-av-dapur` (litografi 1879), `babyloniska-astronomiska-dagbocker` (dagbok 331–330 f.Kr.), `dosarna-i-gochang`, `qanaterna-i-gonabad`, `guldmannen-i-issyk` (utställning), `slaget-vid-hydaspes` (Le Brun), `lejontemplet-i-musawwarat-es-sufra`.
- Byten: `alexanders-dod` får tavlan som nämner hans död (i stället för Le Bruns "Alexanders intåg"); `bronstrummor-fran-dong-son` får Song Da-trumman (Dong Son II, Musée Guimet) i stället för Guangxi-trummorna; `asokas-inskrifter` får Dhauli-monumentet (Girnar-bilden visade en byggnad med folksamling och inte inskriften); `kyros-grundar-perserriket` får Kyroscylindern (kandidaterna var bokbilder med licensen "No restrictions"); `feniciska-alfabetet` får inskriften på Ahirams sarkofag (kandidaterna var en ritning från 1949 och en teckning från 1828).
- Egen sökning: `siloamtunneln` (kopia av inskriften), `kalingakriget`, `riket-dmt`, `meroe-blir-huvudstad` (kandidaten var 591 px).
- Avstådda på grund av gravar: `pazyrykgravarna`.
