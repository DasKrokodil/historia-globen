# Granskningslista för bildomgång asien-4

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=33 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 33. **Med minst en användbar kandidat:** 17. **Utan kandidat:** 16.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `asien-4-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/asien-4-lista.txt`.

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

## 1. `slaget-vid-weifloden`: Slaget vid Weifloden (204 f.Kr., Weifloden vid Weifang i provinsen Shandong)

Wikidata: [Q4872718](https://www.wikidata.org/wiki/Q4872718). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Battle at the Wei River (Weihe).jpg](https://commons.wikimedia.org/wiki/File:Battle_at_the_Wei_River_(Weihe).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Qingkuan | between 1886 and 1890 date QS:P,+1850-00-00T00:00:00Z/7,P1319,+1886-00-00T00:00:00Z/9,P1326,+1890-00-00T00:00:00Z/9 / 2010-05-16 01:46:32 | 1143 × 519 | ur-sokning |
| 2 | [File:Statue of a Virginia frontiersman on a monument at Point Pleaasant Battle Monument State Park, called Tu-Endie-Wei Park locally, in Point Pleasant, a city on the Ohio River in West Virginia LCCN2015631940.tif](https://commons.wikimedia.org/wiki/File:Statue_of_a_Virginia_frontiersman_on_a_monument_at_Point_Pleaasant_Battle_Monument_State_Park,_called_Tu-Endie-Wei_Park_locally,_in_Point_Pleasant,_a_city_on_the_Ohio_River_in_West_Virginia_LCCN2015631940.tif) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Carol M. Highsmith | Taken on 9 May 2015, 15:33 (according to Exif data) / 2016-09-11 16:47:37 | 4470 × 6910 | nutida-foto, staende, ur-sokning |
| 3 | [File:Battle at the Wei River (Weihe) (cropped4to3).jpg](https://commons.wikimedia.org/wiki/File:Battle_at_the_Wei_River_(Weihe)_(cropped4to3).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Qingkuan | between 1886 and 1890 date QS:P,+1850-00-00T00:00:00Z/7,P1319,+1886-00-00T00:00:00Z/9,P1326,+1890-00-00T00:00:00Z/9 / 2023-01-19 18:24:52 | 692 × 519 | smal, ur-sokning |
- Nr 1: beskrivning: A scene of the Dungan revolt (1862-1877) · kategorier: Dungan revolt; Paintings of the Qing Dynasty
- Nr 2: beskrivning: Title: Statue of a Virginia frontiersman on a monument at Point Pleaasant Battle Monument State Park, called Tu-Endie-Wei Park locally, in Point Pleasant, a city on the Ohio River in West Virginia Physical description:… · kategorier: Battle of Point Pleasant Monument; Mason County, West Virginia in the 2010s
- Nr 3: beskrivning: A scene of the Dungan revolt (1862-1877) · kategorier: Dungan revolt; Paintings of the Qing Dynasty

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `lakekonst-i-mawangdui`: Läkekonst i gravarna vid Mawangdui (168 f.Kr., Mawangdui i Changsha, Hunan, Kina)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Daoyin tu - chart for leading and guiding people in exercise Wellcome L0036007.jpg](https://commons.wikimedia.org/wiki/File:Daoyin_tu_-_chart_for_leading_and_guiding_people_in_exercise_Wellcome_L0036007.jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 |  | – / 2014-10-12 10:04:30 | 8000 × 4449 | datum-osakert, ur-sokning |
| 2 | [File:Daoyin tu - chart for leading and guiding people in exercise Wellcome L0036007 (cropped).jpg](https://commons.wikimedia.org/wiki/File:Daoyin_tu_-_chart_for_leading_and_guiding_people_in_exercise_Wellcome_L0036007_(cropped).jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 |  | – / 2025-01-02 09:30:38 | 7394 × 3706 | datum-osakert, ur-sokning |
| 3 | [File:Daoyin tu - chart for leading and guiding people in exercise Wellcome L0040263.jpg](https://commons.wikimedia.org/wiki/File:Daoyin_tu_-_chart_for_leading_and_guiding_people_in_exercise_Wellcome_L0040263.jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 |  | – / 2014-10-13 03:01:28 | 6845 × 2739 | datum-osakert, ur-sokning |
- Nr 1: beskrivning: Daoyin tu - chart for leading and guiding people in exercise for improving health and treatment of pain, containing animal postures such as bear walk. This is a reconstruction of a 'Guiding and Pulling Chart' excavated… · kategorier: Human postures; Mawangdui; Tai-chi in art
- Nr 2: beskrivning: Daoyin tu - chart for leading and guiding people in exercise for improving health and treatment of pain, containing animal postures such as bear walk. This is a reconstruction of a 'Guiding and Pulling Chart' excavated… · kategorier: Human postures; Mawangdui; Tai-chi in art
- Nr 3: beskrivning: Daoyin tu - chart for leading and guiding people in exercise for improving health and treatment of pain, containing animal postures such as bear walk. The images originally come from a 'Guiding and Pulling Chart' excava… · kategorier: Asian continental ancestry group; Fitness in China; Human postures; Traditional Chinese medicine

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `jordbavningen-i-judeen-31-fkr`: Jordbävningen i Judeen (31 f.Kr., Judeen; punkten vid Jeriko är ungefärlig, eftersom epicentrum är okänt)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Tiberias from the walls. Safed in the distance. David Roberts. 1855.jpg](https://commons.wikimedia.org/wiki/File:Tiberias_from_the_walls._Safed_in_the_distance._David_Roberts._1855.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | David Roberts | 1855 (Originally from 1842} / 2014-11-13 06:30:35 | 2003 × 1390 | ur-sokning |
| 2 | [File:The life of our Lord and Savior Jesus Christ - containing a full, accurate, and universal history from his taking upon himself our nature to his crucifixion, resurrection, and ascension- together with (14592569250).jpg](https://commons.wikimedia.org/wiki/File:The_life_of_our_Lord_and_Savior_Jesus_Christ_-_containing_a_full,_accurate,_and_universal_history_from_his_taking_upon_himself_our_nature_to_his_crucifixion,_resurrection,_and_ascension-_together_with_(14592569250).jpg) | commons-sok | No restrictions (flagga); filsidan: flagga – licensen kunde inte avgöras (inga igenkända licensmallar; API: "No restrictions") | Internet Archive Book Images | 1830 / 2015-09-22 17:24:25 | 1928 × 1392 | ur-sokning, licens-flagga |
| 3 | [File:Image from page 400 of "Syria and the Holy Land - their scenery and their people - incidents of travel, &c. from the best and most recent authorities" (1844) (14799073193).jpg](https://commons.wikimedia.org/wiki/File:Image_from_page_400_of_%22Syria_and_the_Holy_Land_-_their_scenery_and_their_people_-_incidents_of_travel,_%26c._from_the_best_and_most_recent_authorities%22_(1844)_(14799073193).jpg) | commons-sok | No restrictions (flagga); filsidan: flagga – licensen kunde inte avgöras (inga igenkända licensmallar; API: "No restrictions") | Internet Archive Book Images | 2014-07-29 12:26 / 2014-09-06 12:11:24 | 1762 × 1208 | nutida-foto, ur-sokning, licens-flagga |
- Nr 1: beskrivning: This Sketch, in addition to the view of the City, gives, in the distance, crowning a lofty hill, the City of Safed. The land is peculiarly liable to earthquakes ; Safed was fearfully visited in the middle of the last ce… · kategorier: Sea of Galilee in art; The Holy Land, Syria, Idumea, Arabia, Egypt, and Nubia, volume 1; Tiberias by David Roberts
- Nr 2: beskrivning: The Crucifixion Identifier : lifeofourlordsav00flee ( find matches ) Title : The life of our Lord and Savior Jesus Christ : containing a full, accurate, and universal history from his taking upon himself our nature to h… · kategorier: Jesus Christ between the felons; The life of our Lord and Savior Jesus Christ (1830)
- Nr 3: beskrivning: Identifier : syriaholylandthe00kell Title : Syria and the Holy Land : their scenery and their people : incidents of travel, &c. from the best and most recent authorities Year : 1844 ( 1840s ) Authors : Kelly, Walter Kea… · kategorier: Cave of the Patriarchs in art; Syria and the Holy Land - their scenery and their people (1844)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `gula-floden-byter-lopp-ar-11`: Gula floden byter lopp (11, Wei-kommendanturen i södra Hebei och norra Henan, Kina; punkten är Ye, kommendanturens huvudort)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:黄河故道 - Old Course of the Yellow River - 2012.08 - panoramio.jpg](https://commons.wikimedia.org/wiki/File:%E9%BB%84%E6%B2%B3%E6%95%85%E9%81%93_-_Old_Course_of_the_Yellow_River_-_2012.08_-_panoramio.jpg) | commons-sok | CC BY 3.0 (trolig); filsidan: godkand CC BY 3.0 | rheins | Taken on 13 August 2012 / 2017-01-21 00:55:44 | 3200 × 2400 | nutida-foto, ur-sokning |
| 2 | [File:黄河故道 - Old Course of the Yellow River - 2012.08 - panoramio (1).jpg](https://commons.wikimedia.org/wiki/File:%E9%BB%84%E6%B2%B3%E6%95%85%E9%81%93_-_Old_Course_of_the_Yellow_River_-_2012.08_-_panoramio_(1).jpg) | commons-sok | CC BY 3.0 (trolig); filsidan: godkand CC BY 3.0 | rheins | Taken on 13 August 2012 / 2017-01-21 00:56:45 | 3200 × 2400 | nutida-foto, ur-sokning |
| 3 | [File:黄河故道 - Old Course of Yellow River - 2012.06 - panoramio.jpg](https://commons.wikimedia.org/wiki/File:%E9%BB%84%E6%B2%B3%E6%95%85%E9%81%93_-_Old_Course_of_Yellow_River_-_2012.06_-_panoramio.jpg) | commons-sok | CC BY 3.0 (trolig); filsidan: godkand CC BY 3.0 | rheins | Taken on 4 June 2012 / 2017-01-04 21:18:02 | 3200 × 2400 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: 黄河故道 - Old Course of the Yellow River - 2012.08 · kategorier: Yellow River Estuary National Park
- Nr 2: beskrivning: 黄河故道 - Old Course of the Yellow River - 2012.08 · kategorier: Yellow River Estuary National Park
- Nr 3: beskrivning: 黄河故道 - Old Course of Yellow River - 2012.06 · kategorier: Yellow River Estuary National Park

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `vita-hastens-tempel`: Vita hästens tempel, Kinas första buddhistiska tempel enligt traditionen (68, Luoyang i Henan, Kina)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:White Horse Thai Temple 27499-Luoyang (48757385163).jpg](https://commons.wikimedia.org/wiki/File:White_Horse_Thai_Temple_27499-Luoyang_(48757385163).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | xiquinhosilva | 2019-09-16 14:39 / 2023-10-05 14:14:50 | 3000 × 2335 | nutida-foto, ur-sokning |
| 2 | [File:White Horse Thai Temple 27504-Luoyang (48757708026).jpg](https://commons.wikimedia.org/wiki/File:White_Horse_Thai_Temple_27504-Luoyang_(48757708026).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | xiquinhosilva | 2019-09-16 14:41 / 2023-10-05 14:14:52 | 3000 × 2496 | nutida-foto, ur-sokning |
| 3 | [File:White Horse Thai Temple 27507-Luoyang (48757386323).jpg](https://commons.wikimedia.org/wiki/File:White_Horse_Thai_Temple_27507-Luoyang_(48757386323).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | xiquinhosilva | 2019-09-16 14:42 / 2023-10-05 14:14:51 | 3000 × 2195 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: White Horse Temple is, according to tradition, the first Buddhist temple in China, established in 68 AD under the patronage of Emperor Ming in the Eastern Han dynasty capital Luoyang. The site is just outside the walls… · kategorier: Thailand Hall, White Horse Temple
- Nr 2: beskrivning: White Horse Temple is, according to tradition, the first Buddhist temple in China, established in 68 AD under the patronage of Emperor Ming in the Eastern Han dynasty capital Luoyang. The site is just outside the walls… · kategorier: Thailand Hall, White Horse Temple
- Nr 3: beskrivning: White Horse Temple is, according to tradition, the first Buddhist temple in China, established in 68 AD under the patronage of Emperor Ming in the Eastern Han dynasty capital Luoyang. The site is just outside the walls… · kategorier: Thailand Hall, White Horse Temple

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `palmyras-tulltaxa`: Palmyras tulltaxa (101, Palmyra, Homs, Syrien)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Palmyra Tariff col. 1.png](https://commons.wikimedia.org/wiki/File:Palmyra_Tariff_col._1.png) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1-2 Century AD / 2017-04-27 19:45:06 | 1718 × 854 | ur-sokning |
| 2 | [File:Palmyra Tariff col. 2.png](https://commons.wikimedia.org/wiki/File:Palmyra_Tariff_col._2.png) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1 or 2 Century AD / 2017-04-27 19:46:35 | 954 × 1038 | staende, ur-sokning |
| 3 | [File:Hermitage room 91 - Palmyra 02.jpg](https://commons.wikimedia.org/wiki/File:Hermitage_room_91_-_Palmyra_02.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Netelo | 2019-09-27 19:34:08 / 2019-09-28 15:12:34 | 5472 × 3648 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Column 1 of the Palmyrian Tariff (or Tax Law of Palmyra). · kategorier: Palmyrian Tariff
- Nr 2: beskrivning: Column 2 of the Palmyrian Tariff (or Tax Law of Palmyra). · kategorier: Palmyrian Tariff
- Nr 3: beskrivning: Эрмитаж - Зимний дворец - 1-й этаж - зал 91 - Зал Пальмиры · kategorier: Hermitage hall 91; History of Palmyra; Palmyrian Tariff

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `zhang-hengs-seismoskop`: Zhang Hengs seismoskop (132, Hanhovet i Luoyang, Kina)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Valladolid - Museo Oriental de Valladolid 09.jpg](https://commons.wikimedia.org/wiki/File:Valladolid_-_Museo_Oriental_de_Valladolid_09.jpg) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Zarateman | 2016-09-30 / 2016-09-30 21:48:00 | 2304 × 1728 | nutida-foto, ur-sokning |
| 2 | [File:Zhang Heng's seismoscope.jpg](https://commons.wikimedia.org/wiki/File:Zhang_Heng%27s_seismoscope.jpg) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Pubblico dominio | 2015-09-30 / 2015-09-30 12:32:15 | 614 × 281 | nutida-foto, smal, ur-sokning |
| 3 | [File:Wang Zhenduo's reprodution of Heng's seismoscope.png](https://commons.wikimedia.org/wiki/File:Wang_Zhenduo%27s_reprodution_of_Heng%27s_seismoscope.png) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | WdW Review | 2015-09-30 / 2015-09-30 13:39:48 | 450 × 302 | nutida-foto, smal, ur-sokning |
- Nr 1: beskrivning: Museo Oriental de Valladolid · kategorier: Collections of the Museo Oriental de Valladolid; Houfeng Didong Yi
- Nr 2: beskrivning: Mechanisms Zhang Heng's seismoscope · kategorier: Houfeng Didong Yi
- Nr 3: beskrivning: Wang Zhenduo's reprodution of Heng's seismoscope · kategorier: Houfeng Didong Yi

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `antoninska-pesten`: Antoninska pesten (165, Seleukia vid Tigris (först rapporterad), sedan Romarriket)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Peter Johann Nepomuk Geiger - Antonine Plague in Rome, 165-180.jpg](https://commons.wikimedia.org/wiki/File:Peter_Johann_Nepomuk_Geiger_-_Antonine_Plague_in_Rome,_165-180.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Peter Johann Nepomuk Geiger | circa 1871 date QS:P,+1871-00-00T00:00:00Z/9,P1480,Q5727902 / 2025-09-26 02:04:55 | 1657 × 1196 | ur-sokning |
| 2 | [File:The angel of death striking a door during the plague of Rome Wellcome V0010664.jpg](https://commons.wikimedia.org/wiki/File:The_angel_of_death_striking_a_door_during_the_plague_of_Rome_Wellcome_V0010664.jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 |  | – / 2014-10-28 16:37:05 | 3172 × 2522 | datum-osakert, ur-sokning |
| 3 | [File:Memorial plaque commemorating soldiers who died in the Antonine Plague.jpg](https://commons.wikimedia.org/wiki/File:Memorial_plaque_commemorating_soldiers_who_died_in_the_Antonine_Plague.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Quinet | 2024-05-24 12:53:31 / 2025-08-18 16:07:53 | 1536 × 2048 | nutida-foto, staende, ur-sokning |
- Nr 1: beskrivning: Peter Johann Nepomuk Geiger - Antonine Plague in Rome, 165-180 · kategorier: Antonine Plague; Illustrations by Peter J. N. Geiger in Illustrirte Geschichte des deutschen Volkes; Illustrirte Geschichte des deutschen Volkes, Volume 1 (Zimmerman)
- Nr 2: beskrivning: The angel of death striking a door during the plague of Rome. Engraving by Jules Gabriel Levasseur after J. Delaunay. Iconographic Collections Keywords: Epidemics; EPIDEMIC; Rome; Plague; Jules-Elie Delaunay; Aesculapiu… · kategorier: Aesculapius; Angels in art; Antonine Plague; Jules Gabriel Levasseur; Paintings by Jules-Élie Delaunay; Plague in Rome in 1656
- Nr 3: beskrivning: Memorial plaque dedicated by legionary veterans and survivors · kategorier: Antonine Plague; Roman Empire; Roman legions

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `slaget-vid-vita-vargens-berg`: Slaget vid Vita vargens berg (207, Nära dagens Lingyuan i Liaoning, nordöstra Kina)

Wikidata: [Q848062](https://www.wikidata.org/wiki/Q848062). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:End of Han Dynasty Warlords.png](https://commons.wikimedia.org/wiki/File:End_of_Han_Dynasty_Warlords.png) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | SY | 2017-07-07 / 2017-07-09 02:17:53 | 1275 × 902 | karta, nutida-foto |
- Nr 1: beskrivning: Map showing the major warlords in China in the 190s, before the definitive end of the Han dynasty in 220. Dong Zhuo faction : When Emperor Ling died in 189, Dong Zhuo was appointed protector over Emperor Shao, a positio… · kategorier: Maps of the Eastern Han Dynasty; Maps of the Three Kingdoms; Maps showing 3rd-century history

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `aksums-stora-steler`: Aksums stora steler (301, Norra stelparken i Aksum (i dag Etiopien))

Wikidata: [Q2259366](https://www.wikidata.org/wiki/Q2259366). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Aksum, stele 3 detta di re ezana, l'unica mai crollata 05.jpg](https://commons.wikimedia.org/wiki/File:Aksum,_stele_3_detta_di_re_ezana,_l%27unica_mai_crollata_05.jpg) | wikidata-P18 | CC BY 3.0 (trolig); filsidan: godkand CC BY 3.0 | Sailko | 2018-11-16 07:23:17 / 2020-05-02 19:37:50 | 2904 × 5112 | nutida-foto, staende |
- Nr 1: beskrivning: Aksum Stele n. 3 (King Ezana's Stele) · kategorier: Aksum Stele n. 3 (King Ezana's Stele)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `imenkovokulturen-vid-volga`: Imenkovokulturen vid mellersta Volga (301, Mellersta Volga, Ryssland (punkten är byn Imenkovo i Tatarstan, som kulturen fått sitt namn efter))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Semi-dugout of Imenkovo culture.JPG](https://commons.wikimedia.org/wiki/File:Semi-dugout_of_Imenkovo_culture.JPG) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Engelberthumperdink | 2018-07-04 / 2018-08-01 14:29:15 | 5152 × 3864 | nutida-foto, ur-sokning |
| 2 | [File:Underground dwelling of Imenkovo culture.JPG](https://commons.wikimedia.org/wiki/File:Underground_dwelling_of_Imenkovo_culture.JPG) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Engelberthumperdink | 2018-07-04 / 2018-08-01 14:28:43 | 5152 × 3864 | nutida-foto, ur-sokning |
| 3 | [File:Origins 700.png](https://commons.wikimedia.org/wiki/File:Origins_700.png) | commons-sok | CC BY 3.0 (trolig); filsidan: flagga CC BY 3.0 – API:et säger "CC BY 3.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Hxseek at English Wikipedia | 24 March 2008 (original upload date) / 2008-04-02 07:31:30 | 670 × 458 | karta, nutida-foto, smal, ur-sokning, licens-flagga |
- Nr 1: beskrivning: Реконструкция полуземлянки именьковской культуры по материалам В. Ф. Генинга, П. Н. Старостина. · kategorier: Collections of the National museum of the Republic of Tatarstan; Imenkovo culture; Models of buildings in Kazan
- Nr 2: beskrivning: Наземное жилище именьковской культуры V—VII вв. н. э. По материалам Г. И. Матвеевой, Н. А. Лифанова. · kategorier: Collections of the National museum of the Republic of Tatarstan; Imenkovo culture; Models of buildings in Kazan
- Nr 3: beskrivning: Archaeological cultures of Eastern Europe in the 8th century AD · kategorier: Archaeological maps of Ukraine; Avar Khaganate; Imenkovo culture; Maps of Eurasian Avars; Maps of White Serbia; Maps of the White Croatia

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `jordbavningarna-i-galileen-363`: Jordbävningarna i Galileen år 363 (363, Galileen, norra Israel; skadorna nådde ända till Petra i Jordanien)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:PikiWiki Israel 3982 nevoraya synagogue.jpg](https://commons.wikimedia.org/wiki/File:PikiWiki_Israel_3982_nevoraya_synagogue.jpg) | commons-sok | CC BY 2.5 (trolig); filsidan: godkand CC BY 2.5 | אבישי טייכר (Avishai Teicher) | 2008-06-02 / 2009-08-03 12:00:38 | 2048 × 1536 | nutida-foto, ur-sokning |
| 2 | [File:Nabratein synagogue, 2005.jpg](https://commons.wikimedia.org/wiki/File:Nabratein_synagogue,_2005.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | he:User:אסף.צ at he.wikipedia at 18:16 on 6 Auguest 2005. (Original file name: קובץ:בית כנסת נבוריה.) | Auguest 2005 / 2011-12-21 14:17:58 | 640 × 480 | nutida-foto, smal, ur-sokning |
- Nr 1: beskrivning: nevoraya synagogue in biriya forest · kategorier: Nevoraya synagogue
- Nr 2: beskrivning: Remains of the Nabratein synagogue , northern Israel. · kategorier: Nevoraya synagogue

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `faxians-pilgrimsresa`: Faxians pilgrimsresa till Indien (399, Laoshan på Shandonghalvön, Kina, där Faxian gick i land 412; resan började i Chang'an)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Faxian zhuan.JPG](https://commons.wikimedia.org/wiki/File:Faxian_zhuan.JPG) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Faxian (5th century) | 12th-century book / 2009-07-05 23:49:20 | 963 × 1556 | staende, ur-sokning |
- Nr 1: beskrivning: 12th-century woodblock print, 1st page of the Travels of Faxian ( Record of the Buddhist Countries ). The first sentences read: "In Chang'an, Faxian was distressed that the Vinaya collections was incomplete, so in the 2… · kategorier: Record of Buddhist Kingdoms

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `justinianska-pesten-nar-egypten`: Justinianska pesten når Egypten (541, Pelusium vid Nildeltat, nära Suez (i dag Egypten))

Wikidata: [Q821711](https://www.wikidata.org/wiki/Q821711). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `tidig-medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Diptych Barberini Louvre OA9063 whole.jpg](https://commons.wikimedia.org/wiki/File:Diptych_Barberini_Louvre_OA9063_whole.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | early 6th century / 2011-03-26 14:00:42 | 2500 × 3125 | staende |
| 2 | [File:Yersinia pestis wayson.jpg](https://commons.wikimedia.org/wiki/File:Yersinia_pestis_wayson.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | U.S. Center for Disease Control | 2005-03-30 / 2006-10-28 18:45:22 | 600 × 441 | nutida-foto, smal |
- Nr 1: beskrivning: Barberini diptych. Constantinople, Late Roman Theodosian style. · kategorier: Barberini diptych
- Nr 2: beskrivning: Wayson stain of Yersinia pestis. Note the characteristic "safety pin" appearance of the bacteria. · kategorier: Yersinia pestis

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `arabiska-erovringarna`: De arabiska erövringarna (622, Från Arabiska halvön till Spanien och Indusdalen (började i Medina))

Wikidata: [Q275918](https://www.wikidata.org/wiki/Q275918). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `islamisk`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Map of expansion of Caliphate.svg](https://commons.wikimedia.org/wiki/File:Map_of_expansion_of_Caliphate.svg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | DieBuche | 2010-07-03 / 2022-08-27 18:16:50 | 900 × 413 | karta, nutida-foto |
- Nr 1: beskrivning: Age of the Caliphs Expansion under Muhammad, 622-632 (darkest red) Expansion during the Rashidun Caliphate, 632-661 (medium tone) Expansion during the Umayyad Caliphate, 661-750 Shows modern borders.(lightest tone) · kategorier: History of the Arabs; Islam in Central Asia; Language-neutral maps; Maps of the Caliphate; Maps of the Rashidun Caliphate; Maps of the Umayyad Caliphate (Damascus)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 16. `jerusalem-intas-637`: Jerusalem kapitulerar för kalifen Umar (636, Jerusalem)

Wikidata: [Q815154](https://www.wikidata.org/wiki/Q815154). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `islamisk`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Al aqsa moschee 2.jpg](https://commons.wikimedia.org/wiki/File:Al_aqsa_moschee_2.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Barbara Kabel | 1982 / 2006-07-10 15:10:16 | 1600 × 1050 | – |
- Nr 1: beskrivning: Al Jamea Al Qebli i Jerusalem · kategorier: Al-Qibli Chapel in 1982

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 17. `slaget-vid-qadisiyya`: Slaget vid al-Qadisiyya (636, Al-Qadisiyya, i dagens Irak)

Wikidata: [Q836844](https://www.wikidata.org/wiki/Q836844). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `islamisk`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Depiction of the Battle of al-Qādisiyyah from a manuscript of the Persian epic Shāh-nāmeh. Source- British Library (MS. I.O.Islamic 3265 (1614) f. 602r).jpg](https://commons.wikimedia.org/wiki/File:Depiction_of_the_Battle_of_al-Q%C4%81disiyyah_from_a_manuscript_of_the_Persian_epic_Sh%C4%81h-n%C4%81meh._Source-_British_Library_(MS._I.O.Islamic_3265_(1614)_f._602r).jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown artist Unknown artist | January 1614 date QS:P571,+1614-01-00T00:00:00Z/10 / 2013-02-18 04:53:29 | 524 × 800 | smal, staende |
- Nr 1: beskrivning: Depiction of the Battle of al-Qādisiyyah from a manuscript of the Persian epic Shāh-nāmeh from Astarabad. Source- British Library (MS. I.O.Islamic 3265 (1614) f. 602r) · kategorier: Battle of al-Qadisiyyah; British Library India Office Islamic Manuscripts; Manuscripts and illustrations of the Shahnameh in the British Library; Rostam Farrokhzad

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `slaget-vid-jingxing`: Slaget vid Jingxing (205 f.Kr.)
- `liu-bang-blir-kejsare`: Liu Bang blir kejsare och Handynastin grundas (202 f.Kr.)
- `oc-eo`: Óc Eo, Funans hamnstad (200 f.Kr.)
- `handelshamnen-adulis`: Adulis, Aksumrikets handelsplats vid Röda havet (1)
- `han-folkrakningen-ar-2`: Handynastins folkräkning år 2 (2)
- `gan-ying-mot-rom`: Gan Ying söker vägen till Rom (97)
- `cai-lun-papper`: Cai Lun förbättrar papperet (105)
- `sandebud-fran-rom-via-rinan`: Sändebud från Rom når Hanriket (166)
- `gaststjarnan-sn-185`: Kinesiska astronomer ser en gäststjärna (185)
- `aksums-mynt`: Aksum börjar prägla egna mynt (270)
- `slakten-i-imdang-och-joyeong`: Släktband i gravarna i Imdang och Joyeong (301)
- `loulan-overges`: Loulan överges, troligen när vattnet sinar (330)
- `ge-hongs-handbok-mot-feber`: Ge Hongs handbok med botemedel för nödfall (340)
- `offerpalarna-i-kutai`: Offerpålarna i Kutai (350)
- `daisen-kofun`: Daisen kofun, Japans största gravhög (450)
- `torka-i-sasanidernas-persien`: Torka i Sasanidernas Persien (480)

## Val 2026-11-26 (#2062 och #2063)

12 av 40 händelser fick bild; 2 har en utsedd kandidat som inte kunde hämtas (`asien-4-ej-hamtade.txt`). Filsidorna öppnades via `action=raw` och bilderna granskades visuellt.

- Avvisat efter att filsidan öppnats: `slaget-vid-weifloden` (bilden visar Dunganupproret), `rabatakinskriften` (omstridd identifiering), `jordbavningarna-i-galileen-363` (synagogan Nevoraya hör inte säkert till händelsen), `gula-floden-byter-lopp-ar-11` (oklart vilket lopp), `vita-hastens-tempel` (thailändska templet).
- Avstådda på grund av kvarlevor och gravar: `yingpanmannen`, `slakten-i-imdang-och-joyeong`.
- Byte: `nalanda` fick en detalj från tempel 12 i stället för en skylt.
- Egen sökning: `muzirispapyrusen`, `garimaevangelierna`, `nalanda`, `daisen-kofun`, `cai-lun-papper`, `oc-eo`.
