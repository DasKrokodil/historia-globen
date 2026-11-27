# Granskningslista för bildomgång asien-5

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=36 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 36. **Med minst en användbar kandidat:** 23. **Utan kandidat:** 13.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `asien-5-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/asien-5-lista.txt`.

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

## 1. `slaget-vid-jalula`: Slaget vid Jalula (637, Jalula, nordost om Ktesifon i dagens Irak)

Wikidata: [Q2700721](https://www.wikidata.org/wiki/Q2700721). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `tidig-medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:BATTLE DISPOSITION 1-jalula.JPG](https://commons.wikimedia.org/wiki/File:BATTLE_DISPOSITION_1-jalula.JPG) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Mohkum Shabbir | – / 2009-11-27 06:52:12 | 738 × 468 | datum-osakert, smal, ur-sokning |
| 2 | [File:Phase Ijalula.JPG](https://commons.wikimedia.org/wiki/File:Phase_Ijalula.JPG) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Mohkum Shabbir | 2009-11-26 / 2009-11-27 07:28:09 | 738 × 468 | nutida-foto, smal, ur-sokning |
| 3 | [File:Phase IVjalula.JPG](https://commons.wikimedia.org/wiki/File:Phase_IVjalula.JPG) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Mohkum Shabbir | 2009-11-26 / 2009-11-27 08:45:45 | 738 × 468 | nutida-foto, smal, ur-sokning |
- Nr 1: beskrivning: Battle of jalula disposition on eve of battle · kategorier: Battle of Jalula
- Nr 2: beskrivning: phase 1 of jalula · kategorier: Battle of Jalula
- Nr 3: beskrivning: the fourth phase · kategorier: Battle of Jalula

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `slaget-vid-nahavand`: Slaget vid Nahavand (642, Nahavand, nära Hamadan, Iran)

Wikidata: [Q603549](https://www.wikidata.org/wiki/Q603549). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `tidig-medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Castle Nahavend by Eugène Flandin.jpg](https://commons.wikimedia.org/wiki/File:Castle_Nahavend_by_Eug%C3%A8ne_Flandin.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Eugène Flandin | 1840 / 2013-10-25 08:01:48 | 1907 × 990 | – |
- Nr 1: beskrivning: Castle Nahavend · kategorier: City gates in Iran; Drawings of gates in Iran; Eugène Flandin; Nahavand Castle; Voyage en Perse

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `visdomens-hus-bagdad`: Visdomens hus i Bagdad (754, Bagdad, Irak)

Wikidata: [Q33018](https://www.wikidata.org/wiki/Q33018). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `islamisk`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Maqamat hariri.jpg](https://commons.wikimedia.org/wiki/File:Maqamat_hariri.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand-med-not Public domain – risk: "eget verk" av en bild daterad 1250: kontrollera vem som tog eller gjorde originalet | Zereshk | 13 th century date QS:P,+1250-00-00T00:00:00Z/7 / 2023-06-14 02:13:41 | 974 × 989 | staende, licens-risk |
- Nr 1: beskrivning: Manuscript with depiction by Yahya ibn Vaseti found in the Maqama of Hariri located at the Bibliotheque Nationale de France. Image depicts a library with pupils in it. · kategorier: Education in Iran; History of the Arabs; Maqamat of al-Hariri - BNF Arabe5847 · licensrisk: "eget verk" av en bild daterad 1250: kontrollera vem som tog eller gjorde originalet

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `slaget-vid-uji-1180`: Slaget vid Uji (1180, Uji utanför Kyoto)

Wikidata: [Q1887494](https://www.wikidata.org/wiki/Q1887494). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Byodoin Phoenix Hall Uji 10-2R.jpg](https://commons.wikimedia.org/wiki/File:Byodoin_Phoenix_Hall_Uji_10-2R.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Oilstreet ( talk ) | 2010-03-12 / 2010-04-04 06:20:48 | 3000 × 2000 | nutida-foto |
- Nr 1: beskrivning: Byōdō-in Phoenix Hall, Uji , Kyoto prefecture , Japan , 1059. · kategorier: 2010 in Uji, Kyoto; Phoenix Hall (1957-2012)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `slaget-vid-kurikara`: Slaget vid Kurikara (1183, Kurikarapasset, provinsen Etchū)

Wikidata: [Q2889028](https://www.wikidata.org/wiki/Q2889028). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Battle of Kurikaradani Kassen Zu.jpg](https://commons.wikimedia.org/wiki/File:Battle_of_Kurikaradani_Kassen_Zu.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Katsukawa Shuntei, 1770-1820, artist | 1810 / 2020-11-29 05:35:40 | 8498 × 4293 | ur-sokning |
| 2 | [File:Kurikaradani kassen- Kiso Yoshinaka Heisho Tomonori wo uchitori 倶利伽羅谷合戦- 木曽義仲平將智教をうちとり (BM 2008,3037.18401 1).jpg](https://commons.wikimedia.org/wiki/File:Kurikaradani_kassen-_Kiso_Yoshinaka_Heisho_Tomonori_wo_uchitori_%E5%80%B6%E5%88%A9%E4%BC%BD%E7%BE%85%E8%B0%B7%E5%90%88%E6%88%A6-_%E6%9C%A8%E6%9B%BD%E7%BE%A9%E4%BB%B2%E5%B9%B3%E5%B0%87%E6%99%BA%E6%95%99%E3%82%92%E3%81%86%E3%81%A1%E3%81%A8%E3%82%8A_(BM_2008,3037.18401_1).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Print artist: Utagawa Kuniyoshi (歌川国芳) Published by: Yamaguchiya Tobei (山口屋藤兵衛) | 1853 (6th month) / 2020-05-08 09:48:43 | 1067 × 1600 | staende, ur-sokning |
| 3 | [File:Kurikara Station - Staircase.jpg](https://commons.wikimedia.org/wiki/File:Kurikara_Station_-_Staircase.jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | Fred Cherrygarden | 2025-01-21 11:07:32 / 2025-01-24 14:37:48 | 4000 × 6000 | nutida-foto, staende, ur-sokning |
- Nr 1: beskrivning: The battle of Kurikaradani (Kurikaradani Kassen zu). It occurred on June 2, 1183. Abstract/medium: 1 print (3 sheets) : woodcut, color ; 37.1 x 25.4 cm (left panel), 37 x 25 cm (center panel), 37.4 x 25.6 cm (right pane… · kategorier: Katsukawa Shuntei; Moriya Jihei; Ukiyo-e of the Battle of Kurikara
- Nr 2: beskrivning: Woodblock triptych print, oban tate-e. Minamoto no Yoshinaka kills the Taira commander Tomonori (right) amongst trees, whilst Taira Kagekiyo (centre) kills the oxen that the Minamoto sent into the Taira ranks with burni… · kategorier: Japanese prints in the British Museum; Kurikaradani kassen: Kiso Yoshinaka Heishō Tomonori wo uchitori by Utagawa Kuniyoshi
- Nr 3: beskrivning: The staircase at Kurikara Station, Tsubata, with art depicting the “fiery bull” used in the Battle of Kurikara Pass. · kategorier: Battle of Kurikara in art; Kurikara Station; Oxen in art

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `slaget-vid-ichi-no-tani`: Slaget vid Ichi-no-Tani (1184, Ichi-no-Tani vid Suma, väster om dagens Kobe)

Wikidata: [Q2116658](https://www.wikidata.org/wiki/Q2116658). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Battle of Ichi-no-Tani Folding Screen by Kano School.jpg](https://commons.wikimedia.org/wiki/File:Battle_of_Ichi-no-Tani_Folding_Screen_by_Kano_School.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Kano School | circa 1650 date QS:P,+1650-00-00T00:00:00Z/9,P1480,Q5727902 / 2022-07-15 18:40:37 | 10601 × 4513 | – |
- Nr 1: beskrivning: The Battle of Ichi-no-Tani [right of a pair of Scenes from the Tale of the Heike], mid 17th century. These screens illustrate two battles of the epochal Genpei War (1180–85) as narrated in the Tales of the Heike, an epi… · kategorier: Battle of Ichi-no-Tani (six-fold screen); Paintings of the Battle of Ichi-no-Tani

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `slaget-vid-yashima`: Slaget vid Yashima (1185, Yashima vid dagens Takamatsu, Shikoku)

Wikidata: [Q2117322](https://www.wikidata.org/wiki/Q2117322). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Battle of Yashima Folding Screens Kano School.jpg](https://commons.wikimedia.org/wiki/File:Battle_of_Yashima_Folding_Screens_Kano_School.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Kano School | circa 1650 date QS:P,+1650-00-00T00:00:00Z/9,P1480,Q5727902 / 2022-06-20 19:31:18 | 10969 × 4896 | – |
- Nr 1: beskrivning: The Battle of Yashima [left of a pair of Scenes from the Tale of the Heike], mid 17th century. Ink, color, gold, and silver on paper. These screens illustrate two battles of the epochal Genpei War (1180–85) as narrated… · kategorier: Armour in 1650s art of Japan; Genpei War; Minamoto clan; Paintings of the Battle of Yashima; Paintings on screens from Japan; Taira clan

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `belagringen-av-akko-1189`: Belägringen av Akko (1189, Akko (Acre), i dagens Israel)

Wikidata: [Q815116](https://www.wikidata.org/wiki/Q815116). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `islamisk`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Philippe Auguste et Richard Acre.jpg](https://commons.wikimedia.org/wiki/File:Philippe_Auguste_et_Richard_Acre.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | between circa 1375 and circa 1380 date QS:P571,+1350-00-00T00:00:00Z/7,P1319,+1375-00-00T00:00:00Z/9,P1326,+1380-00-00T00:00:00Z/9,P1480,Q5727902 / 2019-03-13 18:53:51 | 967 × 953 | staende |
- Nr 1: beskrivning: Philippe Auguste et Richard Cœur de Lion reçoivent les clés d'Acre (1191). Enluminure des Grandes Chroniques de France , vers 1375-1380. Paris, Bibliothèque nationale de France, département des Manuscrits, Français 2813… · kategorier: Grandes Chroniques de France (BNF, FR 2813); Philip II of France in miniature; Richard I of England in miniature; Siege of Acre (1189–1191)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `mongolernas-erovringar`: Mongolernas erövringar (1209, Asien och Östeuropa (började i Västra Xia, dagens nordvästra Kina))

Wikidata: [Q2092093](https://www.wikidata.org/wiki/Q2092093). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Bataille de vâliyân (1221).jpeg](https://commons.wikimedia.org/wiki/File:Bataille_de_v%C3%A2liy%C3%A2n_(1221).jpeg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Sayf al-Vâhidî. Hérât. Afghanistan | 1430 / 2024-02-10 08:46:23 | 3188 × 2080 | – |
- Nr 1: beskrivning: Battle of Vâliyân (1221). Jami' al-tawarikh , Rashid al-Din . "Mongol officers Taqacaq and Mulgar attempted to take Waliyan. Jalal al-Din moved to Parwan; making a quick move across the mountains to the north, he surpri… · kategorier: Battle of Waliyan; Battles in 1221; Bibliothèque nationale Supplément persan 1113; Cavalry in ancient Asia; Cavalry of the history of Iran; Mongol conquests

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `zhongdus-fall-1215`: Zhongdu (Peking) faller (1215, Zhongdu (dagens Peking), Jindynastins huvudstad)

Wikidata: [Q954923](https://www.wikidata.org/wiki/Q954923). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Siège de Beijing (1213-1214).jpeg](https://commons.wikimedia.org/wiki/File:Si%C3%A8ge_de_Beijing_(1213-1214).jpeg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Sayf al-Vâhidî. Hérât. Afghanistan | 1430 / 2010-04-14 22:20:06 | 1503 × 1181 | – |
- Nr 1: beskrivning: Siege of Beijing. Jami' al-tawarikh , Rashid al-Din . · kategorier: 1210s; Battle of Zhongdu; Battles in 1213; Battles in 1214; Bibliothèque nationale Supplément persan 1113; Genghis Khan in miniature

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `sukhothairiket-grundas`: Sukhothairiket grundas (1238, Sukhothai, Thailand)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Sukhothai, Wat, Thailand.jpg](https://commons.wikimedia.org/wiki/File:Sukhothai,_Wat,_Thailand.jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: flagga CC BY 4.0 – API:et säger "CC BY 4.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Vyacheslav Argenberg | 2007-02-03 09:48:23 / 2021-10-28 15:43:14 | 3072 × 2048 | nutida-foto, ur-sokning, licens-flagga |
| 2 | [File:Sukhothai City Old Map c1901.png](https://commons.wikimedia.org/wiki/File:Sukhothai_City_Old_Map_c1901.png) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | From the book written by Narisara Nuwattiwong | circa 1901 date QS:P,+1901-00-00T00:00:00Z/9,P1480,Q5727902 / 2025-05-23 12:11:04 | 3000 × 2713 | karta, ur-sokning |
| 3 | [File:4Y1A0470 Sukhothai (34384204661).jpg](https://commons.wikimedia.org/wiki/File:4Y1A0470_Sukhothai_(34384204661).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Ninara from Helsinki, Finland | 2017-01-03 18:07 / 2018-05-17 03:51:09 | 2861 × 2445 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Wat Mahathat or Mahathat Temple is the most important and most impressive temple in Sukhothai Park. The temple's name translates to 'temple of the great relic'. It was founded in the early 14th century as the main templ… · kategorier: Sukhothai Historical Park; Wat Mahathat (Sukhothai)
- Nr 2: beskrivning: Old map of the city of Sukhothai. This is a copy made around 1901 of an antique map. Sukhothai city was founded in 1238. It is located about 12 km from the city Sukhotaj Thani. It was the capital city of the Sukhothai K… · kategorier: Old maps of Sukhothai; Sukhothai Kingdom
- Nr 3: beskrivning: Sukhothai, Thailand, Wat Sorasak Wikipedia: Sukhothai was the capital of the Sukhothai Kingdom. Sukhothai is 12 km west of the modern city of Sukhothai Thani. Founded in 1238, it is about 427 km north of Bangkok. Sukhot… · kategorier: Mueang Sukhothai District

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `soltemplet-i-konark`: Soltemplet i Konark byggs (1250, Konark i Odisha, Indien)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `miniatyr`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Wheel engraved in the 13th century built Konark Sun Temple in Orissa, India.jpg](https://commons.wikimedia.org/wiki/File:Wheel_engraved_in_the_13th_century_built_Konark_Sun_Temple_in_Orissa,_India.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Joydeep | 2025-11-18 10:31:41 / 2025-11-23 14:00:40 | 5130 × 3318 | nutida-foto, ur-sokning |
| 2 | [File:Stone wheel engraved in the 13th century built Konark Sun Temple in Orissa, India.jpg](https://commons.wikimedia.org/wiki/File:Stone_wheel_engraved_in_the_13th_century_built_Konark_Sun_Temple_in_Orissa,_India.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Subhrajyoti07 | 2016-08-13 17:15:32 / 2018-10-06 05:24:42 | 4984 × 3638 | nutida-foto, ur-sokning |
| 3 | [File:Closeup of the center of a stone wheel - Konark Sun Temple, Orissa, India.jpg](https://commons.wikimedia.org/wiki/File:Closeup_of_the_center_of_a_stone_wheel_-_Konark_Sun_Temple,_Orissa,_India.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Subhrajyoti07 | 2018-09-22 16:32:47 / 2018-10-09 16:37:50 | 5814 × 3866 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Wheel engraved in the 13th century built Konark Sun Temple in Orissa, India. · kategorier: Chariot wheels of Konark Sun Temple; Odisha; Tourism in Odisha
- Nr 2: beskrivning: This is a wheel engraved in the 13th century built Konark Sun Temple in Orissa, India. The temple is designed as a chariot consisting of 24 such wheels. Each wheel has a diameter of 9 feet 9 inches with 8 spokes. Each w… · kategorier: Chariot wheels of Konark Sun Temple
- Nr 3: beskrivning: Center of a stone wheel engraved in the 13th century built Konark Sun Temple in Orissa, India · kategorier: Chariot wheels of Konark Sun Temple

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `slaget-vid-ain-jalut`: Slaget vid Ain Jalut (1260, Ain Jalut i Jisreeldalen, Galileen)

Wikidata: [Q244356](https://www.wikidata.org/wiki/Q244356). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `islamisk`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Campaign of the Battle of Ain Jalut 1260.svg](https://commons.wikimedia.org/wiki/File:Campaign_of_the_Battle_of_Ain_Jalut_1260.svg) | wikidata-P18 | CC BY 3.0 (trolig); filsidan: godkand CC BY 3.0 | MapMaster | 2008-06-13 / 2008-07-07 19:01:07 | 432 × 572 | karta, nutida-foto, smal, staende |
- Nr 1: beskrivning: A map of the campaign leading to the Battle of Ain Jalut — in 1260 CE. · kategorier: Battle of Ain Jalut (1260); Maps of the County of Tripoli; Maps of the Kingdom of Jerusalem; Maps of the Levant in the 13th century; Maps of the Mongol Empire; Maps of the history of the Levant

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `forsta-slaget-i-hakatabukten`: Första slaget i Hakatabukten (1274, Hakatabukten vid dagens Fukuoka, Kyushu)

Wikidata: [Q2237386](https://www.wikidata.org/wiki/Q2237386). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Mooko-HakataWall.jpg](https://commons.wikimedia.org/wiki/File:Mooko-HakataWall.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | – / 2019-08-24 12:54:48 | 2085 × 875 | datum-osakert |
- Nr 1: kategorier: Depictions of samurai on horses; Details of Mōko Shūrai Ekotoba, Scroll 2

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `mongolerna-landar-pa-tsushima-1274`: Mongolerna landar på Tsushima (1274, Tsushima, Japan)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Da Qing fen sheng yu tu LOC 2002626726-1.jpg](https://commons.wikimedia.org/wiki/File:Da_Qing_fen_sheng_yu_tu_LOC_2002626726-1.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1754 / 2019-01-03 14:52:53 | 5280 × 4534 | karta, ur-sokning |
| 2 | [File:Da Qing fen sheng yu tu LOC 2002626726-1.tif](https://commons.wikimedia.org/wiki/File:Da_Qing_fen_sheng_yu_tu_LOC_2002626726-1.tif) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1754 / 2019-01-03 14:52:38 | 5280 × 4534 | karta, ur-sokning |
- Nr 1: beskrivning: The General Map of the 1754 Da Qing Fensheng Yutu , showing the Qing Empire during the reign of the Qianlong Emperor. Provincial borders and capitals, the Yangtze and Yellow River, Great Wall and Willow Palisade, and Go… · kategorier: 1750s maps of China; 18th-century maps of Korea; 18th-century maps of Vietnam; Daqing Fensheng Yutu; Gobi Desert; Maps of the Great Wall of China
- Nr 2: beskrivning: The General Map of the 1754 Da Qing Fensheng Yutu , showing the Qing Empire during the reign of the Qianlong Emperor. Provincial borders and capitals, the Yangtze and Yellow River, Great Wall and Willow Palisade, and Go… · kategorier: LC TIF images with categorized JPGs

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 16. `mongolernas-invasioner-av-japan`: Mongolernas invasioner av Japan (1274, Norra Kyushu och öarna Tsushima och Iki, Japan (började på Tsushima))

Wikidata: [Q208156](https://www.wikidata.org/wiki/Q208156). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Kikuchi Yoosai - Mongol Invasion (mōko shūrai) - Tokyo National Museum.jpg](https://commons.wikimedia.org/wiki/File:Kikuchi_Yoosai_-_Mongol_Invasion_(m%C5%8Dko_sh%C5%ABrai)_-_Tokyo_National_Museum.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Kikuchi Yoosai / (of the reproduction) Tokyo National Museum | 1847 / 2008-06-11 14:25:17 | 1499 × 2409 | staende, samma-fil |
| 2 | [File:Japan in Marco Polo's travel record (2).JPG](https://commons.wikimedia.org/wiki/File:Japan_in_Marco_Polo%27s_travel_record_(2).JPG) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | 江戸東京博物館、熊本県立美術館 | 2013-09-26 18:28:17 / 2013-09-26 09:50:53 | 1102 × 653 | nutida-foto |
- Nr 1: beskrivning: Mongol Invasion (Japanese: mōko shūrai), by Kikuchi Yōsai, 1847. Ink and water colors on paper. Tokyo National Museum. Shows the destruction of the Mongol fleet in a typhoon · kategorier: 1847 watercolor paintings; Edo paintings in the Tokyo National Museum; Ink paintings; Paintings by Kikuchi Yōsai; Paintings of the Mongol invasions of Japan; Watercolor paintings from Japan · samma fil föreslås också för `andra-slaget-i-hakatabukten`
- Nr 2: beskrivning: Japan in Marco Polo's travel record · kategorier: Japan in art; Le Livre de Marco Polo, ms. BnF fr. 2810; Marco Polo in miniatures; Mongol invasions of Japan; Mongol invasions of Japan in art

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 17. `slaget-vid-yamen`: Slaget vid Yamen: Songdynastin faller (1279, Yamen i Guangdong, södra Kina)

Wikidata: [Q1078359](https://www.wikidata.org/wiki/Q1078359). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Jingmen002.jpg](https://commons.wikimedia.org/wiki/File:Jingmen002.jpg) | wikidata-P18 | CC BY 3.0 (trolig); filsidan: godkand-med-not CC BY 3.0 – GFDL anges också (dubbellicens) | (Long night without wind) 长夜无风 | 2008-05-03 / 2008-07-05 04:06:54 | 2304 × 1728 | nutida-foto |
- Nr 1: beskrivning: Songyuan Yamen Sea Battle Cultural Tourism Zone, Xinhui District, Jiangmen City · kategorier: Battles of the Yuan dynasty; Xinhui

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 18. `andra-slaget-i-hakatabukten`: Andra invasionen: striderna i Hakatabukten (1281, Hakatabukten vid dagens Fukuoka, Kyushu)

Wikidata: [Q2237622](https://www.wikidata.org/wiki/Q2237622). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Kikuchi Yoosai - Mongol Invasion (mōko shūrai) - Tokyo National Museum.jpg](https://commons.wikimedia.org/wiki/File:Kikuchi_Yoosai_-_Mongol_Invasion_(m%C5%8Dko_sh%C5%ABrai)_-_Tokyo_National_Museum.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Kikuchi Yoosai / (of the reproduction) Tokyo National Museum | 1847 / 2008-06-11 14:25:17 | 1499 × 2409 | staende, samma-fil |
| 2 | [File:Mooko-SamuraiShips.jpg](https://commons.wikimedia.org/wiki/File:Mooko-SamuraiShips.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | – / 2005-12-20 00:18:15 | 601 × 379 | datum-osakert, smal |
- Nr 1: beskrivning: Mongol Invasion (Japanese: mōko shūrai), by Kikuchi Yōsai, 1847. Ink and water colors on paper. Tokyo National Museum. Shows the destruction of the Mongol fleet in a typhoon · kategorier: 1847 watercolor paintings; Edo paintings in the Tokyo National Museum; Ink paintings; Paintings by Kikuchi Yōsai; Paintings of the Mongol invasions of Japan; Watercolor paintings from Japan · samma fil föreslås också för `mongolernas-invasioner-av-japan`
- Nr 2: kategorier: Boats in Japan in art; Details of Mōko Shūrai Ekotoba, Scroll 2; Shimazu Hisatsune; Shōni Tsunesuke

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 19. `akkos-fall-1291`: Akkos fall (1291, Akko (Acre), kungariket Jerusalem)

Wikidata: [Q325985](https://www.wikidata.org/wiki/Q325985). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `islamisk`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:SiegeOfAcre1291.jpg](https://commons.wikimedia.org/wiki/File:SiegeOfAcre1291.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Dominique Papety | circa 1840 date QS:P571,+1840-00-00T00:00:00Z/9,P1480,Q5727902 / 2020-05-20 20:15:45 | 1145 × 1457 | staende |
- Nr 1: beskrivning: The Hospitalier Master Mathieu de Clermont defending the walls in 1291. · kategorier: Acre (city) in art; Paintings by Dominique Papety; Paintings of the Order of Saint John of Jerusalem; Siege of Acre (1291)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 20. `vijayanagarariket-grundas`: Vijayanagarariket grundas (1336, Vijayanagara (i dag Hampi) i Karnataka, Indien)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `miniatyr`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Hampi, India, Watch Tower, The Zenana Enclosure, Vijayanagara Empire.jpg](https://commons.wikimedia.org/wiki/File:Hampi,_India,_Watch_Tower,_The_Zenana_Enclosure,_Vijayanagara_Empire.jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: flagga CC BY 4.0 – API:et säger "CC BY 4.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Vyacheslav Argenberg | 2011-02-04 16:53:32 / 2020-11-09 14:50:50 | 4032 × 2688 | nutida-foto, ur-sokning, licens-flagga |
| 2 | [File:Vijayanagara, Hampi.jpg](https://commons.wikimedia.org/wiki/File:Vijayanagara,_Hampi.jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Aleksandr Zykov | 2015-01-19 13:01:39 / 2021-09-28 07:52:21 | 3264 × 2448 | nutida-foto, ur-sokning |
| 3 | [File:Hampi, India, Elephant Stable for royal elephants of the Vijayanagara Empire.jpg](https://commons.wikimedia.org/wiki/File:Hampi,_India,_Elephant_Stable_for_royal_elephants_of_the_Vijayanagara_Empire.jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: flagga CC BY 4.0 – API:et säger "CC BY 4.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Vyacheslav Argenberg | 2011-02-04 16:54:41 / 2020-11-09 14:50:51 | 4032 × 2688 | nutida-foto, ur-sokning, licens-flagga |
- Nr 1: beskrivning: Indo-Islamic style structure. Hampi, Karnataka, India. Ancient temples at Hampi, Vijayanagara Empire, 14th century, a UNESCO World Heritage Site. · kategorier: Southeast Watch Tower in the Zenana Enclosure
- Nr 2: beskrivning: File from Flickr · kategorier: Vijayanagara
- Nr 3: beskrivning: Indo-Islamic style structure. Hampi, Karnataka, India. Ancient temples at Hampi, Vijayanagara Empire, 14th century, a UNESCO World Heritage Site. · kategorier: Elephant stables at Hampi

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 21. `malacka-grundas`: Malackasultanatet grundas (1400, Malacka, Malaysia)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Soldo (Tin) - Portuguese Malacca (Dom Joao III) - Scott Semans 01.jpg](https://commons.wikimedia.org/wiki/File:Soldo_(Tin)_-_Portuguese_Malacca_(Dom_Joao_III)_-_Scott_Semans_01.jpg) | commons-sok | CC BY 3.0 (trolig); filsidan: flagga CC BY 3.0 – API:et säger "CC BY 3.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Scott Semans | 2018-09-25 / 2018-09-25 10:20:12 | 1494 × 752 | nutida-foto, ur-sokning, licens-flagga |
| 2 | [File:Soldo (Tin) - Portuguese Malacca (Dom Sebastiao I) - Scott Semans.jpg](https://commons.wikimedia.org/wiki/File:Soldo_(Tin)_-_Portuguese_Malacca_(Dom_Sebastiao_I)_-_Scott_Semans.jpg) | commons-sok | CC BY 3.0 (trolig); filsidan: flagga CC BY 3.0 – API:et säger "CC BY 3.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Scott Semans | 2018-09-25 / 2018-09-25 10:20:17 | 467 × 259 | nutida-foto, smal, ur-sokning, licens-flagga |
| 3 | [File:Dinheiro (Tin) - Portuguese Malacca (Dom Sebastiao I) - Scott Semans.jpg](https://commons.wikimedia.org/wiki/File:Dinheiro_(Tin)_-_Portuguese_Malacca_(Dom_Sebastiao_I)_-_Scott_Semans.jpg) | commons-sok | CC BY 3.0 (trolig); filsidan: flagga CC BY 3.0 – API:et säger "CC BY 3.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Scott Semans | 2018-09-25 / 2018-09-25 10:20:17 | 481 × 253 | nutida-foto, smal, ur-sokning, licens-flagga |
- Nr 1: beskrivning: PORTUGUESE MALACCA For pre-Portuguese coins, see Malacca Sultanate . I know of no really good reference for this series, and authors disagree on ruler attributions and denominations. Since it at least has a straightforw… · kategorier: Coins of Portuguese Malacca
- Nr 2: beskrivning: PORTUGUESE MALACCA For pre-Portuguese coins, see Malacca Sultanate . I know of no really good reference for this series, and authors disagree on ruler attributions and denominations. Since it at least has a straightforw… · kategorier: Coins of Portuguese Malacca
- Nr 3: beskrivning: PORTUGUESE MALACCA For pre-Portuguese coins, see Malacca Sultanate . I know of no really good reference for this series, and authors disagree on ruler attributions and denominations. Since it at least has a straightforw… · kategorier: Coins of Portuguese Malacca

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 22. `goa-1510`: Portugal erövrar Goa (1510, Gamla Goa, Indien)

Wikidata: [Q2357384](https://www.wikidata.org/wiki/Q2357384). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `miniatyr`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:"Plan de Goa", in Histoire générale des voyages,1750.jpg](https://commons.wikimedia.org/wiki/File:%22Plan_de_Goa%22,_in_Histoire_g%C3%A9n%C3%A9rale_des_voyages,1750.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand-med-not Public domain – risk: "eget verk" av en bild daterad 1750: kontrollera vem som tog eller gjorde originalet | Victorcouto | 1750 / 2009-07-01 22:59:56 | 5707 × 3339 | karta, licens-risk |
- Nr 1: beskrivning: "Plan de Goa", Goa. PREVOST D’EXILES, Antoine François. " Histoire générale des Voyages, ou Nouvelle Collection de toutes les Relations de Voyages par Mer et par Terre, qui ont été publiées […] Avec les mœurs et les usa… · kategorier: Colonial wars of Portugal; Maps of Goa by Linschoten; Portuguese India · licensrisk: "eget verk" av en bild daterad 1750: kontrollera vem som tog eller gjorde originalet

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 23. `magellan-nar-guam`: Magellans flotta når Guam (1521, Guam i Marianerna, traditionellt vid Umatac (i dag Guam, USA))

Wikidata: [Q1225170](https://www.wikidata.org/wiki/Q1225170). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Detail from a map of Ortelius - Magellan's ship Victoria.png](https://commons.wikimedia.org/wiki/File:Detail_from_a_map_of_Ortelius_-_Magellan%27s_ship_Victoria.png) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Abraham Ortelius | 1590 / 2016-01-02 17:14:41 | 2522 × 1538 | karta |
- Nr 1: beskrivning: Detail from a map of Ortelius : Magellan 's ship Victoria · kategorier: 1590 in art; Details of maps; Drawings of sailing ships; Iberian ship development, 1400–1600; Maps by Abraham Ortelius; Paintings of carracks

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `jiaozi-statliga-sedlar`: Songstaten ger ut de första statliga sedlarna (1024)
- `byodo-in-blir-tempel`: Byōdō-in i Uji blir buddhistiskt tempel (1052)
- `nizamiyya-i-bagdad`: Nizamiyya, ett lärosäte i Bagdad, grundas (1065)
- `kutadgu-bilig`: Kutadgu Bilig skrivs för fursten i Kashgar (1069)
- `shen-kuo-magnetkompassen`: Shen Kuo beskriver magnetkompassen (1088)
- `mongolerna-anfaller-vastra-xia`: Mongolerna anfaller Västra Xia (1209)
- `mongolerna-intar-buchara`: Mongolerna intar Buchara (1220)
- `observatoriet-i-maragheh`: Bygget av observatoriet i Maragheh börjar (1259)
- `jordbavningen-i-hongdong-1303`: Jordbävningen i Hongdong (1303)
- `mausoleet-i-soltaniyeh`: Mausoleet med kupolen i Soltaniyeh byggs (1307)
- `pesten-vid-issyk-kul`: Pestgravarna vid Issyk-Kul, de tidigaste kända offren för digerdöden (1338)
- `safaviderna-tar-makten-1501`: Ismail I blir shah och safaviderna tar makten i Iran (1501)
- `funjsultanatet-grundas`: Funjsultanatet grundas i Sennar (1504)

## Val 2026-11-26 (#2064 och #2065)

20 av 40 händelser fick bild. Filsidorna öppnades via `action=raw` och bilderna granskades visuellt i en kontaktbild.

- Avvisat efter att filsidan öppnats eller bilden setts: `slaget-vid-jalula` (stridsdiagram utan källa), `forsta-slaget-i-hakatabukten` (muren är inte säkert från 1274), `mongolerna-landar-pa-tsushima-1274` (kinesisk provinskarta), `malacka-grundas` (portugisiska mynt från 1500-talet), `sukhothairiket-grundas` (flaggad licens).
- Avstådd på grund av kvarlevor och gravar: `pesten-vid-issyk-kul`.
- Byten: Fenixhallen i Byōdō-in (Uji) används för `byodo-in-blir-tempel`, inte för slaget vid Uji. Soltaniyeh: första kandidaten (Dome of Soltaniyeh, 2010) var ihopsydd och beskuren på ett sätt som såg fel ut och byttes mot ett foto av ett invändigt valv (Fulvio Spada). Vijayanagara: Argenbergs foto flaggades av verktyget (licensmall okänd) och byttes mot Aleksandr Zykovs Flickr-foto (CC BY-SA 2.0).
- Maragheh-observatoriet fick ett utsett foto men ryms inte inom taket på 20 bilder.
- Händelserna `shwezigonpagoden`, `jalalikalendern`, `zagwedynastin` och `genpeikriget` saknades i den automatiska listan (de har `start` i stället för `year`); `shwezigonpagoden` lades in manuellt.
- Egen sökning: `byodo-in-blir-tempel`, `shwezigonpagoden`, `mausoleet-i-soltaniyeh`, `observatoriet-i-maragheh`, `jiaozi-statliga-sedlar`, `shen-kuo-magnetkompassen`, `safaviderna-tar-makten-1501`, `zagwedynastin`.
