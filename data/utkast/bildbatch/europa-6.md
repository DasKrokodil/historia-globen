# Granskningslista för bildomgång europa-6

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=38 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 38. **Med minst en användbar kandidat:** 30. **Utan kandidat:** 8.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `europa-6-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/europa-6-lista.txt`.

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

## 1. `sixtinska-kapellets-tak`: Michelangelo målar Sixtinska kapellets tak (1508, Sixtinska kapellet i Vatikanen, Rom, Kyrkostaten (i dag Vatikanstaten))

Wikidata: [Q844675](https://www.wikidata.org/wiki/Q844675). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:CAPPELLA SISTINA Ceiling.jpg](https://commons.wikimedia.org/wiki/File:CAPPELLA_SISTINA_Ceiling.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Michelangelo | from 1508 until 1512 date QS:P571,+1550-00-00T00:00:00Z/7,P580,+1508-00-00T00:00:00Z/9,P582,+1512-00-00T00:00:00Z/9 / 2013-08-29 08:31:41 | 3129 × 1125 | – |
- Nr 1: kategorier: Sistine Chapel ceiling

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `defenestrationen-1618`: Defenestrationen i Prag (1618, Prag, Böhmen)

Wikidata: [Q374696](https://www.wikidata.org/wiki/Q374696). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Prager.Fenstersturz.1618.jpg](https://commons.wikimedia.org/wiki/File:Prager.Fenstersturz.1618.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Johann Philipp Abelinus | – / 2008-10-05 11:20:04 | 1530 × 1112 | datum-osakert |
- Nr 1: beskrivning: Second Defenestration of Prague · kategorier: Defenestration of Prague (1618); Engravings of Theatrum Europaeum; Theatrum Europaeum, Volume 1 (1635)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `slaget-vid-vita-berget`: Slaget vid Vita berget (1620, Vita berget nära Prag, Böhmen)

Wikidata: [Q4373](https://www.wikidata.org/wiki/Q4373). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Schlacht am Weißen Berg C-K 063.jpg](https://commons.wikimedia.org/wiki/File:Schlacht_am_Wei%C3%9Fen_Berg_C-K_063.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Peter Snayers | 1620 date QS:P571,+1620-00-00T00:00:00Z/9 / 2006-09-16 20:42:41 | 897 × 569 | – |
- Nr 1: beskrivning: Battle of White Mountain · kategorier: 1620 landscape paintings; 1620s landscape paintings; 17th-century paintings of angels; 17th-century paintings of cavalry in battle; Angels with banners; Battle of White Mountain

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `vasa-sjunker`: Regalskeppet Vasa sjunker (1628, Stockholms hamn, Sverige)

Wikidata: [Q219821](https://www.wikidata.org/wiki/Q219821). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The Vasa from the Bow.jpg](https://commons.wikimedia.org/wiki/File:The_Vasa_from_the_Bow.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | JavierKohen | 2009-10-08 / 2009-10-11 09:43:01 | 6048 × 4032 | nutida-foto |
- Nr 1: beskrivning: The Vasa from the Bow · kategorier: Exterior of Vasa (ship, 1627)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `slaget-vid-breitenfeld-1631`: Slaget vid Breitenfeld (1631, Breitenfeld vid Leipzig, Sachsen)

Wikidata: [Q205379](https://www.wikidata.org/wiki/Q205379). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Dankaerts-Historis-9302.tif](https://commons.wikimedia.org/wiki/File:Dankaerts-Historis-9302.tif) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Matthäus Merian | 1642 / 2014-05-07 16:47:04 | 5430 × 2160 | – |
| 2 | [File:29a Gustave Adolphe à la bataille de Breitenfeld, 1632.jpg](https://commons.wikimedia.org/wiki/File:29a_Gustave_Adolphe_%C3%A0_la_bataille_de_Breitenfeld,_1632.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | DCHNwam | 2025-04-15 10:59:31 / 2025-04-21 17:03:48 | 3876 × 2529 | nutida-foto |
| 3 | [File:Erste-schlacht-bei-breitenf.jpg](https://commons.wikimedia.org/wiki/File:Erste-schlacht-bei-breitenf.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | circa 1885 date QS:P,+1885-00-00T00:00:00Z/9,P1480,Q5727902 / 2005-02-10 12:58:35 | 362 × 381 | karta, smal, staende |
- Nr 1: beskrivning: Battle of Breitenfeld (1631) , 7 Old Style/17 September 1631 New Style. Latin text: Diatyposis utriusque aciei Regi Sueciae et Electoralis Saxonicae, hisque oppositae caesareae et ligisticae, sub ductu comitis Tillii, u… · kategorier: Battle of Breitenfeld (1631); Prints from Dankaerts Historis at the Peace Palace Library
- Nr 2: beskrivning: A photograph taken by DCHNwam · kategorier: April 2025 Alsace photographs; April 2025 in Strasbourg; Gustavus Adolphus at the Battle of Breitenfeld
- Nr 3: beskrivning: Kärtchen zur Schlacht bei Breitenfeld · kategorier: 19th-century maps of battles; Maps from Meyers Konversationslexikon 4th edition; Maps of the Battle of Breitenfeld

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `slaget-vid-nordlingen-1634`: Slaget vid Nördlingen (1634, Nördlingen, Bayern)

Wikidata: [Q312212](https://www.wikidata.org/wiki/Q312212). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Battle of Nordlingen in 1634 by Jacques Courtois.jpg](https://commons.wikimedia.org/wiki/File:Battle_of_Nordlingen_in_1634_by_Jacques_Courtois.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Jacques Courtois | 1648 date QS:P571,+1648-00-00T00:00:00Z/9 / 2007-01-31 09:20:18 | 620 × 308 | smal |
- Nr 1: kategorier: 1640s paintings from France; 1676 paintings; 17th-century oil paintings in Germany; 17th-century paintings of cavalry in battle; Baroque paintings of war; Paintings by Jacques Courtois

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `slaget-vid-wittstock`: Slaget vid Wittstock (1636, Wittstock, Brandenburg)

Wikidata: [Q428972](https://www.wikidata.org/wiki/Q428972). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The Battle of Wittstock 1636.jpg](https://commons.wikimedia.org/wiki/File:The_Battle_of_Wittstock_1636.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 17 th century date QS:P,+1650-00-00T00:00:00Z/7 / 2007-08-09 07:37:20 | 1000 × 803 | – |
- Nr 1: beskrivning: Battle of Wittstock · kategorier: Battle of Wittstock

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `rundetarn-star-klart`: Rundetårn står klart som observatorium (1642, Köpenhamn, Danmark)

Wikidata: [Q1140534](https://www.wikidata.org/wiki/Q1140534). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Copenhagen - Rundetårn - 2013.jpg](https://commons.wikimedia.org/wiki/File:Copenhagen_-_Rundet%C3%A5rn_-_2013.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Avda | 2013-07-30 11:56:08 / 2013-08-07 12:18:22 | 1302 × 2048 | nutida-foto, staende |
- Nr 1: beskrivning: Copenhagen - Rundetårn - 2013 · kategorier: Rundetårn

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `slaget-vid-rocroi`: Slaget vid Rocroi (1643, Rocroi, Frankrike)

Wikidata: [Q728480](https://www.wikidata.org/wiki/Q728480). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:La Bataille de Rocroi.jpg](https://commons.wikimedia.org/wiki/File:La_Bataille_de_Rocroi.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Sauveur Lecomte | 17 December 2011 / 2019-12-02 07:34:46 | 593 × 400 | nutida-foto, smal |
- Nr 1: beskrivning: Peinture du peintre Sauveur Le Conte, représentant la victoire du Grand Condé lors de la bataille de Rocroi en 1643. · kategorier: Battle of Rocroi; Series of the Actions of the Great Condé – Musée Condé

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `slaget-vid-jankau`: Slaget vid Jankau (1645, Jankov, Böhmen)

Wikidata: [Q1415925](https://www.wikidata.org/wiki/Q1415925). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Old copper engraving of the Battle of Jankov.jpg](https://commons.wikimedia.org/wiki/File:Old_copper_engraving_of_the_Battle_of_Jankov.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | – / 2007-11-11 11:53:49 | 460 × 370 | datum-osakert, smal |
- Nr 1: beskrivning: Old copper engraving of the Battle of Jankov . · kategorier: Battle of Jankov

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `westfaliska-freden`: Westfaliska freden (1648, Osnabrück och Münster, Westfalen)

Wikidata: [Q150995](https://www.wikidata.org/wiki/Q150995). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Westfaelischer Friede in Muenster (Gerard Terborch 1648).jpg](https://commons.wikimedia.org/wiki/File:Westfaelischer_Friede_in_Muenster_(Gerard_Terborch_1648).jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Gerard ter Borch | 1648 / 2018-03-24 21:07:57 | 6000 × 4649 | – |
- Nr 1: kategorier: 1640s furniture in art; 1640s interiors in art; 1640s oil on copper paintings; 1648 in Münster (Westfalen); 1648 portrait paintings of men; 17th-century group portraits

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `forsvenskningen-av-skane`: Försvenskningen av Skåne (1658, Skåne)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `barock`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Framsidan på Konung Fredrik III cessionsbrev gällande provinsen Skåne.jpg](https://commons.wikimedia.org/wiki/File:Framsidan_p%C3%A5_Konung_Fredrik_III_cessionsbrev_g%C3%A4llande_provinsen_Sk%C3%A5ne.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Riksarkivet | 1658-02-24 / 2022-11-01 12:23:34 | 7753 × 7038 | ur-sokning |
| 2 | [File:Malmö, statue of Carl X Gustav.JPG](https://commons.wikimedia.org/wiki/File:Malm%C3%B6,_statue_of_Carl_X_Gustav.JPG) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | Dguendel | 2018-06-21 / 2019-08-24 12:12:57 | 3260 × 4823 | nutida-foto, konstverk, staende, ur-sokning |
- Nr 1: beskrivning: I samband med freden i Roskilde så avträdde Danmark bl.a. provinsen Skåne till Sverige. Bilden föreställer cessionsbrevet gällande avträdelse av Skåne till Sverige. Undertecknat 24 februari 1658 i Köpenhamn. Hämtad från… · kategorier: Denmark in the 1650s; Frederick III of Denmark; History of Skåne; Sweden in the 1650s; Treaties in the National Archives of Sweden
- Nr 2: beskrivning: Malmö, statue of Carl X Gustav · kategorier: Statue of Carl X Gustav in Malmö

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `freden-i-roskilde`: Freden i Roskilde (1658, Roskilde, Själland)

Wikidata: [Q212234](https://www.wikidata.org/wiki/Q212234). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `barock`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Treaty of Roskilde - peace banquet (7949340).jpg](https://commons.wikimedia.org/wiki/File:Treaty_of_Roskilde_-_peace_banquet_(7949340).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Erik Dahlbergh | 1696 / 2026-03-11 20:25:44 | 4472 × 3680 | ur-sokning |
| 2 | [File:Treaty of Roskilde - peace banquet (fragment) (7949340).jpg](https://commons.wikimedia.org/wiki/File:Treaty_of_Roskilde_-_peace_banquet_(fragment)_(7949340).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Erik Dahlbergh | 1696 / 2026-03-11 20:27:55 | 2565 × 2019 | ur-sokning |
| 3 | [File:9. 1658 Freden i Roskilde.png](https://commons.wikimedia.org/wiki/File:9._1658_Freden_i_Roskilde.png) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Kasper Holl | 2021-04-23 / 2021-04-23 21:44:26 | 2000 × 2541 | karta, nutida-foto, staende, ur-sokning |
- Nr 1: beskrivning: The peace banquet (Fredstaffelet) at Frederiksborg Castle following the signing of the Treaty of Roskilde in 1658. · kategorier: Charles X Gustav of Sweden; De rebus a Carolo Gustavo Sveciae rege gestis commentariorum libri septem (1696) (SD XVII.4.2668); Erik Dahlbergh; Frederick III of Denmark; History of Hillerød; Interior of Frederiksborg Pal…
- Nr 2: beskrivning: The peace banquet (Fredstaffelet) at Frederiksborg Castle following the signing of the Treaty of Roskilde in 1658. · kategorier: Charles X Gustav of Sweden; De rebus a Carolo Gustavo Sveciae rege gestis commentariorum libri septem (1696) (SD XVII.4.2668); Erik Dahlbergh; Frederick III of Denmark; History of Hillerød; Interior of Frederiksborg Pal…
- Nr 3: beskrivning: Freden i Roskilde bliver indgået i 1658 og Danmark afgiver Skånelandene og Trondheim til Sverige · kategorier: Maps of Denmark in the 17th century; Maps of Estonia in the 17th century; Maps of Finland in the 17th century; Maps of Latvia in the 17th century; Maps of Norway in the 17th century; Maps of Scandinavia in the 17th cent…

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `freden-i-kopenhamn-1660`: Freden i Köpenhamn (1660, Köpenhamn)

Wikidata: [Q829702](https://www.wikidata.org/wiki/Q829702). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `barock`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Sju bocker om konung Carl X Gustafs bragder. 2 1915 (151982553).jpg](https://commons.wikimedia.org/wiki/File:Sju_bocker_om_konung_Carl_X_Gustafs_bragder._2_1915_(151982553).jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Samuel Pufendorf | – / 2023-03-07 12:46:04 | 11228 × 8727 | datum-osakert |
- Nr 1: beskrivning: Adres wydawniczy : Stockholm : Wahlström & Widstrand, [1915] Współtwórcy : Hillman, Adolf (1844-1933). Tłumaczenie Opis fizyczny : [207] k. tabl., [32] k. tabl. złoż. : il. ; 38 cm · kategorier: Sju böcker om konung Carl X Gustafs bragder. 2 (1915); Treaty of Copenhagen (1660)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `lunds-universitet-grundas`: Lunds universitet grundas (1666, Lund, Skåne)

Wikidata: [Q218506](https://www.wikidata.org/wiki/Q218506). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `barock`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Universitetsbyggnaden, Lund.JPG](https://commons.wikimedia.org/wiki/File:Universitetsbyggnaden,_Lund.JPG) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) |  | – / 2004-10-07 15:07:40 | 640 × 480 | datum-osakert, smal |
- Nr 1: kategorier: Unidentified year in Skåne County; Universitetshuset, Lund

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 16. `riksbanken-grundas`: Riksbanken grundas (1668, Stockholm, Sverige)

Wikidata: [Q564652](https://www.wikidata.org/wiki/Q564652). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `barock`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Sveriges Riksbank, Brunkebergstorg, 2020.jpg](https://commons.wikimedia.org/wiki/File:Sveriges_Riksbank,_Brunkebergstorg,_2020.jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Holger.Ellgaard | 2020-08-04 13:11:09 / 2020-08-04 13:29:58 | 2235 × 1614 | nutida-foto |
- Nr 1: beskrivning: Sveriges Riksbank, fasad mot Brunkebergstorg · kategorier: Brunkebergstorg; Riksbankshuset, Stockholm

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 17. `regeringsformen-1809`: 1809 års regeringsform (1809, Sverige)

Wikidata: [Q2255302](https://www.wikidata.org/wiki/Q2255302). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Sveriges riksdag building (24831063816).jpg](https://commons.wikimedia.org/wiki/File:Sveriges_riksdag_building_(24831063816).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Jorge Láscar from Melbourne, Australia | 17 October 2014, 23:05 (according to Exif data) / 2018-02-01 07:43:56 | 7095 × 4735 | nutida-foto, ur-sokning |
| 2 | [File:Sveriges riksdag (24764089871).jpg](https://commons.wikimedia.org/wiki/File:Sveriges_riksdag_(24764089871).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Jorge Láscar from Melbourne, Australia | 17 October 2014, 20:42 (according to Exif data) / 2018-02-01 07:46:37 | 5520 × 3680 | nutida-foto, ur-sokning |
| 3 | [File:Sveriges riksdag (24230695003).jpg](https://commons.wikimedia.org/wiki/File:Sveriges_riksdag_(24230695003).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Jorge Láscar from Melbourne, Australia | 17 October 2014, 20:40 (according to Exif data) / 2018-02-01 07:45:44 | 5520 × 3680 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: The Riksdag (Swedish: riksdagen or Sveriges riksdag) is the national legislature and the supreme decision-making body of Sweden. Since 1971, the Riksdag has been a unicameral legislature with 349 members (Swedish: riksd… · kategorier: Riksgatan
- Nr 2: beskrivning: The Riksdag (Swedish: riksdagen or Sveriges riksdag) is the national legislature and the supreme decision-making body of Sweden. Since 1971, the Riksdag has been a unicameral legislature with 349 members (Swedish: riksd… · kategorier: Riksgatan
- Nr 3: beskrivning: The Riksdag (Swedish: riksdagen or Sveriges riksdag) is the national legislature and the supreme decision-making body of Sweden. Since 1971, the Riksdag has been a unicameral legislature with 349 members (Swedish: riksd… · kategorier: Riksgatan

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 18. `slaget-vid-wagram`: Slaget vid Wagram (1809, Wagram nordost om Wien, Österrike)

Wikidata: [Q467777](https://www.wikidata.org/wiki/Q467777). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Napoleon Wagram.jpg](https://commons.wikimedia.org/wiki/File:Napoleon_Wagram.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Horace Vernet | 1836 date QS:P571,+1836-00-00T00:00:00Z/9 / 2017-12-15 15:41:40 | 3154 × 2326 | – |
- Nr 1: kategorier: 1836 oil on canvas paintings in France; 1836 paintings by Horace Vernet; Battle of Wagram; Equestrian paintings of Napoleon Bonaparte; History paintings by Horace Vernet; Paintings in the Galerie des Batailles

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 19. `slaget-vid-leipzig`: Folkslaget vid Leipzig (1813, Leipzig, Sachsen (i dag Tyskland))

Wikidata: [Q151005](https://www.wikidata.org/wiki/Q151005). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Battle of Leipzig MKL Bd. 10 1890 (128443424).jpg](https://commons.wikimedia.org/wiki/File:Battle_of_Leipzig_MKL_Bd._10_1890_(128443424).jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1890 / 2025-10-16 20:26:56 | 2009 × 1989 | karta, staende |
- Nr 1: beskrivning: Historic map of the battle of the nations by Leipzig (18.10.1813) · kategorier: 1813-10-18; Maps from Meyers Konversationslexikon 4th edition; Maps of the Battle of Leipzig; Meyers Konversations-Lexikon Bd. 10 (1890)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 20. `slaget-vid-vitoria`: Slaget vid Vitoria (1813, Vitoria, Baskien, Spanien)

Wikidata: [Q276059](https://www.wikidata.org/wiki/Q276059). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Vitoria - Museo de Armeria 06.JPG](https://commons.wikimedia.org/wiki/File:Vitoria_-_Museo_de_Armeria_06.JPG) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Zarateman | 2008-04-21 / 2008-04-21 21:55:49 | 1300 × 975 | nutida-foto |
- Nr 1: beskrivning: Museo de Armería de Álava, Vitoria-Gasteiz, País Vasco, España. La maqueta reproduce el enfrentamiento de las tropas aliadas y francesas por la posesión del puente Momario sobre el Zadorra, a la altura de Mendoza, en el… · kategorier: Battle of Vitoria; Collections of the Museo de Armería de Álava; Models of battles; Río Zadorra (Special Area of Conservation); Zadorra

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 21. `andra-parisfreden`: Andra Parisfreden (1815, Paris, Frankrike)

Wikidata: [Q233688](https://www.wikidata.org/wiki/Q233688). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:A map of the Eastern boundary of France to illustrate The Second Peace of Paris 20th Nov 1815.jpg](https://commons.wikimedia.org/wiki/File:A_map_of_the_Eastern_boundary_of_France_to_illustrate_The_Second_Peace_of_Paris_20th_Nov_1815.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Edward Hertslet; and Stafford's Geng Estab, 55 Charing Cross | 2014-09-03 22:19:56 / 2014-09-03 21:31:49 | 2114 × 1626 | karta, nutida-foto, ur-sokning |
| 2 | [File:Newspaper Cutting - Paris Peace Conference - 1919 (16135368718).jpg](https://commons.wikimedia.org/wiki/File:Newspaper_Cutting_-_Paris_Peace_Conference_-_1919_(16135368718).jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Archives New Zealand from New Zealand | 2015-01-20 11:00 / 2016-02-18 10:21:09 | 4167 × 6587 | nutida-foto, staende, ur-sokning |
| 3 | [File:Paris Peace Conference, 1919 (28087214059).jpg](https://commons.wikimedia.org/wiki/File:Paris_Peace_Conference,_1919_(28087214059).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Archives New Zealand from New Zealand | 2018-01-24 16:13 / 2020-12-17 14:03:21 | 2129 × 2989 | nutida-foto, staende, ur-sokning |
- Nr 1: beskrivning: A map of the Eastern boundary of France to illustrate The Second Peace of Paris 20th Nov 1815 · kategorier: Map of Europe by Treaty, 1875; Maps of territory lost by France in 1815; Treaty of Paris, 1815
- Nr 2: beskrivning: On 25 January 1919, the League of Nations was formed during the Paris Peace Conference. A product of the revulsion of war and earlier discussions on international arbitration, the League's principal mission was to maint… · kategorier: 1919 newspapers of the United Kingdom; Daily Mirror; League of Nations; Paris Peace Conference (1919–1920)
- Nr 3: beskrivning: On 25 January 1919, the League of Nations was formed during the Paris Peace Conference. A product of the revulsion of war and earlier discussions on international arbitration, the League's principal mission was to maint… · kategorier: Postcards of Paris

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 22. `gota-kanal-invigs`: Göta kanal öppnas (1832, Göta kanal, Västergötland och Östergötland, Sverige)

Wikidata: [Q431863](https://www.wikidata.org/wiki/Q431863). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Göta kanal - KMB - 16001000013273.jpg](https://commons.wikimedia.org/wiki/File:G%C3%B6ta_kanal_-_KMB_-_16001000013273.jpg) | wikidata-P18 | CC BY 2.5 (trolig); filsidan: godkand CC BY 2.5 | Pål-Nils Nilsson | Unknown date / 2017-09-29 01:46:54 | 768 × 504 | smal |
- Nr 1: beskrivning: Notera Av dokumentationsskäl har originalbeskrivningen från Riksantikvarieämbetet behållits. Tillrättalägganden och alternativa beskrivningar bör införas separat från nedanstående information. Felaktigheter kan även anm… · kategorier: Aerial photographs of Motala Municipality; Canals in Sweden; Göta Canal; Photographs by Pål-Nils Nilsson

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 23. `revolutionerna-1848`: Revolutionerna 1848 (1848, Europa (markören i Palermo på Sicilien, där den första revolutionen började))

Wikidata: [Q3588](https://www.wikidata.org/wiki/Q3588). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Horace Vernet-Barricade rue Soufflot.jpg](https://commons.wikimedia.org/wiki/File:Horace_Vernet-Barricade_rue_Soufflot.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Horace Vernet | between 1848 and 1849 date QS:P571,+1848-00-00T00:00:00Z/8,P1319,+1848-00-00T00:00:00Z/9,P1326,+1849-00-00T00:00:00Z/9 / 2022-03-01 08:48:31 | 4961 × 3893 | – |
- Nr 1: beskrivning: On the barricades on the Rue Soufflot, Paris, 25 June 1848 (1848-49), by Horace Vernet · kategorier: 1848 paintings by Horace Vernet; Barricades during June Days Uprising; Barricades in art; Flags with red fields; French Revolution of 1848; French army under king Louis-Philippe (1830-1848)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 24. `grundloven-1849`: Danmark får sin första grundlag (1849, Danmark (markören i Köpenhamn))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Celebrating Alaska Statehood 50 Years January 3, 1959 - 2009 - A Personal Reflection.jpg](https://commons.wikimedia.org/wiki/File:Celebrating_Alaska_Statehood_50_Years_January_3,_1959_-_2009_-_A_Personal_Reflection.jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Wonderlane from Seattle, USA | 2008-12-26 04:35 / 2012-01-02 12:52:35 | 3008 × 2000 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: I remember it like it was just a few months ago - I was already 2 years old and my Mom, a second generation Alaskan - Dee Lane, and my Dad, a third generation Alaskan - Chic Lane, took my sister Lisa and I over the few… · kategorier: 2008 in Anchorage, Alaska; 50th anniversaries in the United States; Christmas 2007 in the United States; Christmas 2008 in the United States; Christmas in Alaska; Flagpoles in Alaska

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 25. `kolera-i-kopenhamn-1853`: Koleraepidemin i Köpenhamn (1853, Köpenhamn, Danmark)

Wikidata: [Q4554867](https://www.wikidata.org/wiki/Q4554867). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:H.G.F. Holm - Teltleiren paa Glaciet Anno 1853.png](https://commons.wikimedia.org/wiki/File:H.G.F._Holm_-_Teltleiren_paa_Glaciet_Anno_1853.png) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Heinrich Gustav Ferdinand Holm | circa 1853 date QS:P571,+1853-00-00T00:00:00Z/9,P1480,Q5727902 / 2024-12-15 11:31:25 | 1720 × 1185 | ur-sokning |
| 2 | [File:H.G.F. Holm - Fra Dyrehavsbakken i koleratiden - 1852.png](https://commons.wikimedia.org/wiki/File:H.G.F._Holm_-_Fra_Dyrehavsbakken_i_koleratiden_-_1852.png) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Heinrich Gustav Ferdinand Holm | 1852 date QS:P571,+1852-00-00T00:00:00Z/9 / 2022-12-29 23:07:35 | 1816 × 1391 | ur-sokning |
| 3 | [File:Holger Drachmann - Hamburg an der Elbe - 1892.png](https://commons.wikimedia.org/wiki/File:Holger_Drachmann_-_Hamburg_an_der_Elbe_-_1892.png) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Holger Drachmann | 1892 date QS:P571,+1892-00-00T00:00:00Z/9 / 2026-06-02 03:49:58 | 3350 × 2342 | ur-sokning |
- Nr 1: beskrivning: During the cholera epidemic in Copenhagen in 1853, a number of the hardest hit families were housed in tents just outside the walls of Copenhagen. · kategorier: 1850s prints from Denmark; 1853 Copenhagen cholera outbreak; H.G.F. Holm
- Nr 2: kategorier: 1852 drawings from Denmark; 1853 Copenhagen cholera outbreak; Drawings by H.G.F. Holm; Dyrehavsbakken in art
- Nr 3: beskrivning: From the auction notes: Drachmann goes to Hamburg in 1892 and is stuck there for months as the city closes due to a cholera epidemic. The present motif relates to a work “Parti fra Hamborgs Havn” (A view of the harbour… · kategorier: 1892 marine paintings from Denmark; Paintings by Holger Drachmann; Paintings of the Port of Hamburg

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 26. `jarnvagen-malmo-lund`: Järnvägen Malmö–Lund öppnas (1856, Malmö–Lund, Skåne)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Oresundstag Malmo C 20120109 0033F (8184247339).jpg](https://commons.wikimedia.org/wiki/File:Oresundstag_Malmo_C_20120109_0033F_(8184247339).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Johan Wessman / News Oresund | Taken on 14 November 2012, 06:13 / 2013-05-16 11:13:12 | 4032 × 3024 | nutida-foto, ur-sokning |
| 2 | [File:Oresundstag Malmo C 20121115 0023F (8188297248).jpg](https://commons.wikimedia.org/wiki/File:Oresundstag_Malmo_C_20121115_0023F_(8188297248).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Johan Wessman / News Oresund | Taken on 15 November 2012, 08:58:18 (according to Exif data) / 2013-05-16 11:12:29 | 5760 × 3840 | nutida-foto, ur-sokning |
| 3 | [File:L1007145-1 - Flickr - Sigfrid Lundberg.jpg](https://commons.wikimedia.org/wiki/File:L1007145-1_-_Flickr_-_Sigfrid_Lundberg.jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Sigfrid Lundberg from Lund, Sweden | Taken on 22 February 2018, 19:15 / 2020-08-11 08:04:28 | 5984 × 4000 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Øresundståg vid stationen vid Malmö Central 2012-01-09. Foto: News Øresund – Johan Wessman. © News Øresund. Bilden får fritt publiceras under förutsättning att källa anges. The picture can be used freely under the prere… · kategorier: 2012 in Malmö; 2012 in rail transport in Sweden; Litra ET; November 2012 in Skåne County; Number 4537 on rail vehicles; Platforms of Malmö centralstation
- Nr 2: beskrivning: Øresundståg på Malmö C 2012-11-15 Foto: News Øresund – Johan Wessman. © News Øresund. Bilden får fritt publiceras under förutsättning att källa anges. (The picture can be used freely under the prerequisite that the sour… · kategorier: 2012 in Malmö; 2012 in rail transport in Sweden; Litra ET; November 2012 in Skåne County; Number 4516 on rail vehicles; Platforms of Malmö centralstation
- Nr 3: beskrivning: Hyllie, Sweden. A woman walks along the fence towards the border control. Passengers waiting outside to get on the train, once the border control is over. · kategorier: Apochromatic Leica lenses; Female police officers of Sweden; Hyllie

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 27. `kungariket-italien-utropas`: Kungariket Italien utropas (1861, Palazzo Carignano, Turin, Italien)

Wikidata: [Q3922436](https://www.wikidata.org/wiki/Q3922436). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Legge 17 marzo 1861.png](https://commons.wikimedia.org/wiki/File:Legge_17_marzo_1861.png) | wikidata-P18 | CC0 (trolig); filsidan: godkand CC0 | Parlamento del Regno di Sardegna | 1861-03-17 / 2026-07-03 20:24:50 | 2640 × 3618 | staende |
- Nr 1: beskrivning: Legge 17 marzo 1861, n. 4671 che proclamò Vittorio Emanuele II Re d'Italia. VITTORIO EMANUELE II. Re di Sardegna, di Cipro e di Gerusalemme ECC. ECC. ECC. Il Senato e la Camera dei Deputati hanno approvato; Noi abbiamo… · kategorier: Italian Risorgimento

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 28. `stormningen-av-dybbol`: Stormningen av Dybbøl (1864, Dybbøl, Danmark)

Wikidata: [Q695107](https://www.wikidata.org/wiki/Q695107). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Dybbol Skanse.jpg](https://commons.wikimedia.org/wiki/File:Dybbol_Skanse.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Jørgen Sonne | 1871 / 2014-04-14 21:42:55 | 1122 × 657 | – |
- Nr 1: beskrivning: The Battle of Dybbøl , 1864. · kategorier: 19th-century paintings of battles; Battle of Dybbøl; Paintings by Jørgen Valentin Sonne

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 29. `nodaren-1867-1869`: Nödåren i Sverige (1867, Norra Sverige, bland annat Västerbottens län)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Emergency help image Fäderneslandet 1867.jpg](https://commons.wikimedia.org/wiki/File:Emergency_help_image_F%C3%A4derneslandet_1867.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Fäderneslandet, old Swedish newspaper | 1867 / 2008-03-31 22:09:53 | 2240 × 1324 | ur-sokning |
| 2 | [File:Starvation image from Fäderneslandet 1867.jpg](https://commons.wikimedia.org/wiki/File:Starvation_image_from_F%C3%A4derneslandet_1867.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Fäderneslandet, old Swedish newspaper | 1867 / 2008-03-15 14:04:20 | 1540 × 1500 | staende, ur-sokning |
| 3 | [File:PIIGS Mk 4 map.png](https://commons.wikimedia.org/wiki/File:PIIGS_Mk_4_map.png) | commons-sok | CC BY 3.0 (trolig); filsidan: godkand CC BY 3.0 | The original uploader was Snow storm in Eastern Asia at English Wikipedia . | 4 June 2010 (original upload date) / 2015-10-07 23:23:07 | 3180 × 1485 | karta, nutida-foto, ur-sokning |
- Nr 1: beskrivning: Illustration of the inefficiency of emergency food aid during the famine in northern Sweden 1867. From left can be seen the county governor, the police and tax authorities and rich farmers - all of them helping each oth… · kategorier: 1867 in Sweden; Food relief
- Nr 2: beskrivning: Illustration of starvation in northern Sweden · kategorier: Famine in art; Famines in the United Kingdoms of Sweden and Norway
- Nr 3: beskrivning: I modified a copy of the map 'File:Commonwealth games 1998 medal winners.PNG' by Commons user Roke . It replaces my map 'File:PIGS Mk 3 map.png' which became defective would not update, when I uploaded the updated image… · kategorier: 2015 maps of the world; Disasters; Economic crises; Economic maps of the world; Economy in the 2000s; Epidemiology of hunger

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 30. `tyska-kejsardomet-utropas`: Tyska kejsardömet utropas (1871, Spegelsalen, Versailles, Frankrike)

Wikidata: [Q10354157](https://www.wikidata.org/wiki/Q10354157). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:A v Werner - Kaiserproklamation am 18 Januar 1871 (3. Fassung 1885).jpg](https://commons.wikimedia.org/wiki/File:A_v_Werner_-_Kaiserproklamation_am_18_Januar_1871_(3._Fassung_1885).jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Anton von Werner | 1885 date QS:P571,+1885-00-00T00:00:00Z/9 / 2017-12-07 20:20:44 | 1482 × 1097 | – |
- Nr 1: beskrivning: The third version of the proclamation of Prussian king Wilhelm I as German Emperor at Versailles, by Anton von Werner. The first two versions were destroyed in the Second World War. This version was commissioned by the… · kategorier: Bismarck-Museum Friedrichsruh; German Empire; Kaiserproklamation im Spiegelsaal von Versailles am 18. Januar 1871 (1885) by Anton von Werner; Kaiserproklamation im Spiegelsaal von Versailles am 18. Januar 1871 by Anton…

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `reformationen-i-danmark`: Reformationen införs i Danmark (1536)
- `reformationen-i-skane`: Reformationen: ärkebiskopsdömet i Lund upphör (1536)
- `trohetseden-i-malmo`: Skåningarna svär trohet till den svenske kungen (1658)
- `friskyttar-och-snapphanar`: Friskyttar och snapphanar (1676)
- `freden-i-fredrikshamn`: Sverige förlorar Finland (1809)
- `kielfreden-gronland`: Kielfreden: Grönland stannar hos Danmark (1814)
- `orsted-elektromagnetism`: Ørsted upptäcker elektromagnetismen (1820)
- `rodding-folkhogskola`: Den första folkhögskolan öppnar i Rødding (1844)

## Val 2026-11-26 (#2085 och #2087)

20 av 40 händelser fick bild (taket på 20 bilder per PR); inga utsedda bilder återstår att hämta. Filsidorna öppnades via `action=raw` och bilderna granskades visuellt i en kontaktbild.

- Inte valda efter att kandidaten setts: `slaget-vid-nordlingen-1634`, `slaget-vid-rocroi`, `slaget-vid-jankau`, `lunds-universitet-grundas`, `gota-kanal-invigs` (för smala bilder), `slaget-vid-leipzig` (karta), `slaget-vid-vitoria` (nutida museifoto), `andra-parisfreden` och `grundloven-1849` (kandidaterna gäller andra händelser), `freden-i-kopenhamn-1660` (osäkert datum).
- Händelserna `wienkongressen` och `representationsreformen` saknades i den automatiska listan (de har `start` i stället för `year`) och söktes inte vidare.
- Licensval: inga filer har dubbellicens; Rundetårn, Sixtinska kapellet och Vasa är CC BY-SA 3.0, Riksbanken CC BY-SA 4.0, riksdagshuset och Öresundståget CC BY 2.0, lagen om Italien CC0.
- Av `nodaren-1867-1869` valdes en satirisk tidningsbild om hur nödhjälp delades ut; bilder av svältande personer valdes bort.
