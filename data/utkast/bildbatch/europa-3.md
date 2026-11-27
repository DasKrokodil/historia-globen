# Granskningslista för bildomgång europa-3

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=34 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 34. **Med minst en användbar kandidat:** 22. **Utan kandidat:** 12.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `europa-3-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/europa-3-lista.txt`.

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

## 1. `slaget-vid-karkemish`: Slaget vid Karkemish (605 f.Kr., Karkemish vid Eufrat, på gränsen mellan dagens Syrien och Turkiet)

Wikidata: [Q633560](https://www.wikidata.org/wiki/Q633560). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `egypten`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The Battle of Carchemish.png](https://commons.wikimedia.org/wiki/File:The_Battle_of_Carchemish.png) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Egisto C. | 1915 / 2022-01-17 13:49:33 | 1255 × 893 | – |
- Nr 1: beskrivning: Illustration from 'Hutchinson's History of the Nations', 1915 · kategorier: 7th-century BC battles; Hebrew Bible battles; Hutchinson's story of the nations

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `delfinmynt-i-olbia`: Olbia gjuter mynt formade som delfiner (500 f.Kr., Olbia vid Södra Bugs mynningsvik, Mykolajiv oblast, Ukraina)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Olbian dolphin coins.jpg](https://commons.wikimedia.org/wiki/File:Olbian_dolphin_coins.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Krigore | 2026-10-19 00:47:24 / 2026-10-20 11:45:08 | 8096 × 4337 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Olbian dolphin coins – early forms of money shaped like dolphins, cast in bronze and used in Olbia Pontica, a Greek colony on the Black Sea near the mouth of the Boh River in present-day Ukraine, close to Mykolaiv. They… · kategorier: Ancient Greek coins of Olbia; Dolphin coins; Focus stacked image

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `joniska-upproret`: Joniska upproret (499 f.Kr., Miletos och Jonien i västra Mindre Asien, i dagens Turkiet)

Wikidata: [Q208261](https://www.wikidata.org/wiki/Q208261). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Map Anatolia ancient regions-en.svg](https://commons.wikimedia.org/wiki/File:Map_Anatolia_ancient_regions-en.svg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Asia_Minor_Political_500BC.svg : * Mysia.svg : Emok derivative work: Mysia_map_ancient_community.jpg : User:Roke derivative work: MinisterForBadTimes ( talk ) derivative work: MinisterForBadTimes ( talk ) | 2009-04-22 17:00 / 2024-11-30 21:15:57 | 921 × 596 | karta, nutida-foto |
- Nr 1: beskrivning: Regional map of Asia Minor in the 2nd Century BC · kategorier: Ancient Epirotes; Catalan-language SVG maps showing history; English-language SVG maps showing history of Asia; English-language SVG maps showing history of Europe; Maps of ancient Anatolia; Multilingual SVG with Catala…

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `slaget-vid-lade`: Sjöslaget vid Lade (494 f.Kr., Ön Lade utanför Miletos, i dagens Turkiet)

Wikidata: [Q427565](https://www.wikidata.org/wiki/Q427565). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Mycale map.gif](https://commons.wikimedia.org/wiki/File:Mycale_map.gif) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Marco Prins and Jona Lendering | – / 2008-07-01 08:23:02 | 366 × 315 | karta, datum-osakert, smal |
- Nr 1: beskrivning: Map of Mycale, Lade, and Miletus.

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `slaget-vid-marathon`: Slaget vid Marathon (490 f.Kr., Slätten vid Marathon i Attika, nordost om Aten)

Wikidata: [Q31900](https://www.wikidata.org/wiki/Q31900). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Scene of the Battle of Marathon.jpg](https://commons.wikimedia.org/wiki/File:Scene_of_the_Battle_of_Marathon.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | John Steeple Davis | 1900-01-01 / 2018-12-15 20:08:24 | 1452 × 952 | – |
| 2 | [File:Trophee bataille marathon.JPG](https://commons.wikimedia.org/wiki/File:Trophee_bataille_marathon.JPG) | wikidata-P18 | CC BY 2.5 (trolig); filsidan: godkand-med-not CC BY 2.5 – flera licenser: CC BY-SA 3.0, CC BY 2.5; GFDL anges också (dubbellicens) | karta24 | 2006-08-15 / 2007-01-03 12:24:07 | 2112 × 2816 | nutida-foto, staende |
- Nr 1: beskrivning: Scene of the Battle of Marathon · kategorier: Achaemenid navy; Battle of Marathon
- Nr 2: beskrivning: Trophée de la bataille de Marathon · kategorier: 2006 in Marathonas; Ancient Roman trophies; August 2006 Greece photographs; Battle of Marathon; Monuments and memorials in Marathonas; Triumph columns

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `slaget-vid-plataiai`: Slaget vid Plataiai (479 f.Kr., Nära staden Plataiai i Boiotien, Grekland (den exakta platsen är osäker))

Wikidata: [Q204636](https://www.wikidata.org/wiki/Q204636). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Scene of the Battle of Plataea.jpg](https://commons.wikimedia.org/wiki/File:Scene_of_the_Battle_of_Plataea.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | John Steeple Davis | 2018-12-15 / 2018-12-15 09:39:53 | 1484 × 981 | nutida-foto |
- Nr 1: beskrivning: Scene of the Battle of Plataea · kategorier: Battle of Plataea

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `slaget-vid-eurymedon`: Slaget vid Eurymedon (469 f.Kr., Floden Eurymedons mynning (i dag Köprüçay) i Pamfylien, södra Turkiet)

Wikidata: [Q607987](https://www.wikidata.org/wiki/Q607987). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Eurymedon Bridge, Aspendos, Turkey. Pic 01.jpg](https://commons.wikimedia.org/wiki/File:Eurymedon_Bridge,_Aspendos,_Turkey._Pic_01.jpg) | wikidata-P18 | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Adam Franco | 2005-06-25 12:51:56 / 2009-03-14 00:42:54 | 3072 × 2048 | nutida-foto |
- Nr 1: beskrivning: The Eurymedon Bridge ( Köprüpazar Köprüsü ) near Aspendos, Pamphylia, Turkey · kategorier: Eurymedon Bridge (Aspendos)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `slaget-vid-allia`: Slaget vid Allia (387 f.Kr., Floden Allia norr om Rom, Italien)

Wikidata: [Q655777](https://www.wikidata.org/wiki/Q655777). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Paul Jamin - Le Brenn et sa part de butin 1893.jpg](https://commons.wikimedia.org/wiki/File:Paul_Jamin_-_Le_Brenn_et_sa_part_de_butin_1893.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Paul Joseph Jamin | 1893 date QS:P571,+1893-00-00T00:00:00Z/9 / 2016-11-21 17:01:39 | 709 × 843 | smal, staende |
- Nr 1: kategorier: 1890s oil on canvas paintings; 1890s paintings in private collections; 1893 paintings; Academic paintings by artist; Ancient Rome in history paintings; Brennus (4th century BC)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `alexanders-faltag`: Alexander den stores fälttåg (336 f.Kr., Makedonien (började när Alexander blev kung i Pella, i dagens Grekland))

Wikidata: [Q551888](https://www.wikidata.org/wiki/Q551888). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Alexander and Bucephalus - Battle of Issus mosaic - Museo Archeologico Nazionale - Naples BW.jpg](https://commons.wikimedia.org/wiki/File:Alexander_and_Bucephalus_-_Battle_of_Issus_mosaic_-_Museo_Archeologico_Nazionale_-_Naples_BW.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand-med-not Public domain – flera licenser: Public domain, CC BY-SA 3.0 | Unknown creator Unknown creator | circa 100 BC / 2025-04-10 09:13:45 | 3905 × 2766 | – |
- Nr 1: beskrivning: Alexander Mosaic (detail), House of the Faun , Pompeii · kategorier: Aegis; Battle of Issus mosaic (from Pompeii) - Details

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `thebe-forstors`: Alexander förstör Thebe (335 f.Kr., Thebe i Boiotien, Grekland)

Wikidata: [Q2237798](https://www.wikidata.org/wiki/Q2237798). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Charles R. Stantonː Alexander at the Sack of Thebes in 335 BC (illustration from Hutchinsons History of the Nations, 1915).jpg](https://commons.wikimedia.org/wiki/File:Charles_R._Stanton%CB%90_Alexander_at_the_Sack_of_Thebes_in_335_BC_(illustration_from_Hutchinsons_History_of_the_Nations,_1915).jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Charles Rebel Stanton | 1 January 1915 date QS:P571,+1915-01-01T00:00:00Z/11 / 2023-09-10 14:34:41 | 1024 × 739 | – |
- Nr 1: beskrivning: Charles R. Stantonː Alexander at the Sack of Thebes in 335 BC (illustration from Hutchinsons History of the Nations, 1915) · kategorier: 1915 engravings; Battle of Thebes; Bucephalus (horse of Alexander); Charles Rebel Stanton; Engravings of Greece; Hutchinson's History of the Nations

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `slaget-vid-granikos`: Slaget vid Granikos (334 f.Kr., Floden Granikos (i dag Biga Çayı) i Troas, nordvästra Turkiet)

Wikidata: [Q192938](https://www.wikidata.org/wiki/Q192938). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Charles Le Brun, Le Passage du Granique, 1665.png](https://commons.wikimedia.org/wiki/File:Charles_Le_Brun,_Le_Passage_du_Granique,_1665.png) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Charles Le Brun / Abraham Genoels | 1665 date QS:P571,+1665-00-00T00:00:00Z/9 / 2015-04-26 12:00:53 | 2817 × 1276 | – |
- Nr 1: beskrivning: Les Grecs franchissent le Granique qui leur fermait l'entrée de l'Asie, malgré les troncs d'arbres amassés sur les bords du fleuve. Le tableau mêle des éléments de la Bataille de Cascina de Michel-Ange (disparue ; connu… · kategorier: Le passage du Granique (Louvre INV 2894)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `arkimedes-i-syrakusa`: Arkimedes verkar i Syrakusa (287 f.Kr., Syrakusa, Sicilien, Italien)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Tolley Building, Syracuse University (north west view).jpg](https://commons.wikimedia.org/wiki/File:Tolley_Building,_Syracuse_University_(north_west_view).jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Kiran891 | 2022-04-17 16:50:32 / 2023-07-10 09:06:58 | 9248 × 6936 | nutida-foto, ur-sokning |
| 2 | [File:Jewish Museum, Syracuse, Sicily, 121665x.jpg](https://commons.wikimedia.org/wiki/File:Jewish_Museum,_Syracuse,_Sicily,_121665x.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Zde | 2012-09-15 13:25:27 / 2016-12-15 19:01:18 | 2777 × 1851 | nutida-foto, ur-sokning |
| 3 | [File:Monument to Archimedes in the Syracuse. Sicily, Italy.jpg](https://commons.wikimedia.org/wiki/File:Monument_to_Archimedes_in_the_Syracuse._Sicily,_Italy.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Ввласенко | 2018-05-17 13:50:31 / 2024-01-19 16:29:34 | 1792 × 2953 | nutida-foto, konstverk, staende, ur-sokning |
- Nr 1: beskrivning: Tolley Administration Building (also Tolley Humanities Building & formerly von Ranke Library) is located on the west side of Crouse Drive on the main campus of Syracuse University in Syracuse, New York. The three-story… · kategorier: April 2022 in New York (state); Libraries in the United States photographed in 2022; Syracuse University in 2022; Tolley Administration Building
- Nr 2: beskrivning: Small Jewish Museum over mikvah in Syracuse, Sicily. · kategorier: Mikvah (Syracuse); The works of Archimedes
- Nr 3: beskrivning: Monument to Archimedes in the Syracuse. Sculptor Pietro Marchese, architect Virginia Rossello. Sicily, Italy · kategorier: Monument to Archimedes by Pietro Marchese; Sculptures of Archimedes; Statues in Syracuse; Works by Pietro Marchese

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `puniska-krigen`: De puniska krigen (264 f.Kr., Sicilien (började vid Messana, dagens Messina))

Wikidata: [Q124988](https://www.wikidata.org/wiki/Q124988). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Map of Rome and Carthage at the start of the Second Punic War.svg](https://commons.wikimedia.org/wiki/File:Map_of_Rome_and_Carthage_at_the_start_of_the_Second_Punic_War.svg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | William Robert Shepherd | 2012-04-29 12:43 / 2024-09-30 07:44:03 | 1067 × 768 | karta, nutida-foto |
- Nr 1: beskrivning: Map showing Rome and Carthage at the start of the Second Punic War and the theatre of the Punic Wars . · kategorier: English-language SVG maps showing history; Map of Rome and Carthage at the start of the Second Punic War, by William R. Shepherd; Maps based on maps by William R. Shepherd; Maps of the Iberian Peninsula in the 3rd centu…

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `slaget-vid-mylae`: Sjöslaget vid Mylae (260 f.Kr., Utanför Mylae (dagens Milazzo) på norra Sicilien)

Wikidata: [Q277345](https://www.wikidata.org/wiki/Q277345). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The story of the greatest nations, from the dawn of history to the twentieth century - a comprehensive history, founded upon the leading authorities, including a complete chronology of the world, and (14578958927).jpg](https://commons.wikimedia.org/wiki/File:The_story_of_the_greatest_nations,_from_the_dawn_of_history_to_the_twentieth_century_-_a_comprehensive_history,_founded_upon_the_leading_authorities,_including_a_complete_chronology_of_the_world,_and_(14578958927).jpg) | wikidata-P18 | No restrictions (flagga); filsidan: flagga – licensen kunde inte avgöras (inga igenkända licensmallar; API: "No restrictions") | Ellis, Edward Sylvester, 1840-1916; Horne, Charles F. (Charles Francis), 1870-1942 | 1900 / 2015-11-08 12:02:52 | 3008 × 2024 | licens-flagga |
- Nr 1: beskrivning: Identifier : storyofgreatestn02elli ( find matches ) Title : The story of the greatest nations, from the dawn of history to the twentieth century : a comprehensive history, founded upon the leading authorities, includin… · kategorier: Battle of Mylae; John Steeple Davis; The story of the greatest nations, from the dawn of history to the twentieth century (1900)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `slaget-vid-egadiska-oarna`: Slaget vid Egadiska öarna (241 f.Kr., Egadiska öarna utanför västra Sicilien)

Wikidata: [Q1134649](https://www.wikidata.org/wiki/Q1134649). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Aegadian Islands map.png](https://commons.wikimedia.org/wiki/File:Aegadian_Islands_map.png) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | – / 2016-02-26 22:24:00 | 690 × 528 | karta, datum-osakert, smal |
- Nr 1: kategorier: Battle of the Aegates; Favignana; Favignana (comune); Levanzo; Locator maps of Italian islands; Maps of Aegadian Islands

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 16. `belagringen-av-saguntum`: Hannibal belägrar Saguntum (219 f.Kr., Saguntum, i dag Sagunto i provinsen Valencia, Spanien)

Wikidata: [Q815210](https://www.wikidata.org/wiki/Q815210). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Castillo02 Sagunto.JPG](https://commons.wikimedia.org/wiki/File:Castillo02_Sagunto.JPG) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) |  | – / 2006-05-01 11:28:09 | 1984 × 1488 | datum-osakert |
- Nr 1: kategorier: Castell de Sagunt

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 17. `hannibal-over-alperna`: Hannibal går över Alperna (218 f.Kr., Alperna mellan dagens Frankrike och Italien (den exakta vägen är okänd))

Wikidata: [Q1337302](https://www.wikidata.org/wiki/Q1337302). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Hannibal route of invasion-en.svg](https://commons.wikimedia.org/wiki/File:Hannibal_route_of_invasion-en.svg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: flagga CC BY-SA 3.0 – API:et säger "CC BY-SA 3.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Pinpin | 2008-02-10 / 2026-07-12 09:46:42 | 764 × 479 | karta, nutida-foto, smal, licens-flagga |
- Nr 1: beskrivning: Map in english of Hannibal's route of invasion · kategorier: Maps of Hannibal's campaign

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 18. `slaget-vid-cannae`: Slaget vid Cannae (216 f.Kr., Cannae i Apulien, sydöstra Italien)

Wikidata: [Q179591](https://www.wikidata.org/wiki/Q179591). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Battle cannae destruction.-ca.svg](https://commons.wikimedia.org/wiki/File:Battle_cannae_destruction.-ca.svg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | File:Battle cannae destruction.gif : Frank Martini. Cartographer, Department of History, United States Military Academy. File:Battle cannae destruction.-fr.svg : User:Mr H. translation: SMP ( talk page ) | – / 2009-02-26 17:41:06 | 737 × 515 | karta, datum-osakert, smal |
- Nr 1: beskrivning: Battle of Cannae, in Catalan · kategorier: Catalan-language SVG maps showing history of Europe; Maps of the Battle of Cannae; Maps of the United States Military Academy

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 19. `karthago-forstors`: Karthago förstörs (146 f.Kr., Karthago, nordost om dagens Tunis i Tunisien)

Wikidata: [Q815160](https://www.wikidata.org/wiki/Q815160). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Carthage villas-romaines 1950.jpg](https://commons.wikimedia.org/wiki/File:Carthage_villas-romaines_1950.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | – / 2008-03-15 10:57:19 | 1740 × 1195 | datum-osakert |
- Nr 1: kategorier: 1950 in Tunisia; Aerial photographs of Carthage; Roman villas of Carthage

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 20. `etnas-utbrott-122-fkr`: Etnas våldsamma utbrott 122 f.Kr. (122 f.Kr., Etna, Sicilien, Italien (punkten är toppen))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Mount Etna Volcano Dawn at Paternò Sicilia Italy - Creative Commons by gnuckx (4773785162).jpg](https://commons.wikimedia.org/wiki/File:Mount_Etna_Volcano_Dawn_at_Patern%C3%B2_Sicilia_Italy_-_Creative_Commons_by_gnuckx_(4773785162).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | gnuckx | 2010-07-07 06:11 / 2013-02-08 15:24:30 | 4288 × 2704 | nutida-foto, ur-sokning |
| 2 | [File:Mount Etna Volcano Dawn at Paternò Sicilia Italy - Creative Commons by gnuckx (4772940241).jpg](https://commons.wikimedia.org/wiki/File:Mount_Etna_Volcano_Dawn_at_Patern%C3%B2_Sicilia_Italy_-_Creative_Commons_by_gnuckx_(4772940241).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | gnuckx | 2010-07-07 06:36 / 2013-02-08 15:24:30 | 4288 × 2848 | nutida-foto, ur-sokning |
| 3 | [File:Volcano Etna-Sicily-Italy - Creative Commons by gnuckx (3492495940).jpg](https://commons.wikimedia.org/wiki/File:Volcano_Etna-Sicily-Italy_-_Creative_Commons_by_gnuckx_(3492495940).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | gnuckx | 2008-10-27 07:43 / 2013-02-08 18:04:00 | 1440 × 1080 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: News Etna, the Forge of Hephaestus - Etna, la fucina di Efesto by Francesco Pappalardo. This is an excellent Photography book recently published by this great photographer and flickr friend cicciofarmaco . This book is… · kategorier: Etna 2010 eruptions; July 2010 in Sicily; Mount Etna at dawn; Sunrises of Sicily
- Nr 2: beskrivning: News Etna, the Forge of Hephaestus - Etna, la fucina di Efesto by Francesco Pappalardo. This is an excellent Photography book recently published by this great photographer and flickr friend cicciofarmaco . This book is… · kategorier: Etna 2010 eruptions; July 2010 in Sicily; Mount Etna at dawn; Sunrises of Sicily
- Nr 3: beskrivning: News Etna, the Forge of Hephaestus - Etna, la fucina di Efesto by Francesco Pappalardo. This is an excellent Photography book recently published by this great photographer and flickr friend cicciofarmaco . This book is… · kategorier: 2008 aerial photographs of Italy; Aerial views of Mount Etna; Ash fall at Mount Etna; Mount Etna eruption columns; October 2008 Italy photographs

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 21. `biatec-mynten`: Bojerna präglar Biatecmynt (100 f.Kr., Bratislava, Slovakien (punkten är staden))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:NBS, Biatec, informačná tabuľa.jpg](https://commons.wikimedia.org/wiki/File:NBS,_Biatec,_informa%C4%8Dn%C3%A1_tabu%C4%BEa.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | TomphanTK | 2023-09-08 11:26:36 / 2023-09-10 10:19:39 | 5184 × 3888 | nutida-foto, ur-sokning |
| 2 | [File:Web Biatec.jpg](https://commons.wikimedia.org/wiki/File:Web_Biatec.jpg) | commons-sok | Public domain (trolig); filsidan: godkand-med-not Public domain – flera licenser: Public domain, CC BY-SA 2.5; risk: PD-self, men filsidan nämner också en annan licens: skriv båda i källans note och i bildtexten | matissek | 2006 / 2013-08-16 20:27:40 | 824 × 408 | nutida-foto, ur-sokning, licens-risk |
| 3 | [File:BIATEC pri NBS 4.jpg](https://commons.wikimedia.org/wiki/File:BIATEC_pri_NBS_4.jpg) | commons-sok | Public domain (trolig); filsidan: godkand-med-not Public domain – risk: filsidan har en mall om frihet för panorama: kontrollera upphovsrätten för konstverket i bilden | Wizzard | 2008-12-30 / 2008-12-30 12:03:46 | 2560 × 1920 | nutida-foto, konstverk, ur-sokning, licens-risk |
- Nr 1: beskrivning: Informačná tabuľa pod plastikou Biateca pri NBS v Bratislave. · kategorier: Biatec
- Nr 2: beskrivning: left: Celtic coin of BIATEC found in Slovakia; right: coin of 5 Slovak korunas · kategorier: Coins of Biatec; Coins of Slovakia; Coins on coins; Coins with a face value of 5; Nude horsemen on coins; Silver coins · licensrisk: PD-self, men filsidan nämner också en annan licens: skriv båda i källans note och i bildtexten
- Nr 3: beskrivning: Unknown description Unknown description · kategorier: Sculpture of Biatec · licensrisk: filsidan har en mall om frihet för panorama: kontrollera upphovsrätten för konstverket i bilden

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 22. `slaget-vid-gindarus`: Slaget vid berget Gindarus (38 f.Kr., Berget Gindarus i Kyrrhestike, norra Syrien)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:J-m-dent-and-sons atlas-of-ancient-and-classical-geography 1912 syria-mesopotamia-assyria-etc-northern-middle-east 3296 2114 600.jpg](https://commons.wikimedia.org/wiki/File:J-m-dent-and-sons_atlas-of-ancient-and-classical-geography_1912_syria-mesopotamia-assyria-etc-northern-middle-east_3296_2114_600.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Samuel Butler | 1907 / 2019-01-03 07:07:54 | 3171 × 2077 | karta, ur-sokning |
| 2 | [File:Heinrich Kiepert. Asia citerior.Syria.jpg](https://commons.wikimedia.org/wiki/File:Heinrich_Kiepert._Asia_citerior.Syria.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Heinrich Kiepert | 1903 / 2012-11-29 13:57:56 | 1678 × 2216 | karta, staende, ur-sokning |
| 3 | [File:Coin of Pacorus I of Parthia.jpg](https://commons.wikimedia.org/wiki/File:Coin_of_Pacorus_I_of_Parthia.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Gdr at en.wikipedia | 3 April 2005 (original upload date) / 2011-09-29 09:32:06 | 500 × 253 | nutida-foto, smal, ur-sokning |
- Nr 1: beskrivning: Greater Syria region · kategorier: 1900s maps of Iraq; 1900s maps of Syria; 1900s maps of the Levant; Old maps of Mesopotamia; Old maps of the Neo-Assyrian Empire; The Atlas of Ancient and Classical Geography by Samuel Butler
- Nr 2: beskrivning: Syria. Asia citerior. Auctore Henrico Kiepert Berolinensi. Geographische Verlagshandlung Dietrich Reimer (Ernst Vohsen) Berlin, Wilhemlstr. 29. (1903) · kategorier: 1903 map of Asia citerior by Heinrich Kiepert; Details of old maps of Syria; Maps of Roman Syria
- Nr 3: beskrivning: Coin of Pacorus I of Parthia . Avers King, crowned with a wreath by the Greek goddess of victory Nike. Reverse shows a seated archer holding a bow. Greek inscription reads ΒΑΣΙΛ[ΕΩΣ] ΒΑΣΙΛΕ[ΩΝ] [ΑΡΣΑΚΟΥ] [Ε]ΥΕΡΓΕΤΟΥ ΔΙΚ… · kategorier: Archer king on coins; Coins of Pacorus I; Coins on white background

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `biskupin-byggs`: Den befästa byn i Biskupin byggs (748 f.Kr.)
- `lydiska-mynt`: Lydierna präglar några av världens första mynt (700 f.Kr.)
- `mjolkproteiner-i-skyternas-tandsten`: Mjölkproteiner i tandsten från skytisk tid (700 f.Kr.)
- `alkmaion-fran-kroton`: Alkmaion från Kroton och hälsan som jämvikt (500 f.Kr.)
- `hannos-resa-langs-afrika`: Hanno seglar längs Västafrikas kust (500 f.Kr.)
- `offerplatsen-skedemosse`: Offerplatsen Skedemosse på Öland (500 f.Kr.)
- `trakiska-graven-i-kazanlak`: Den trakiska graven i Kazanlak målas (400 f.Kr.)
- `pytheas-seglar-norrut`: Pytheas seglar till norra Europa (325 f.Kr.)
- `handelsstaden-tanais-grundas`: Handelsstaden Tanais grundas vid Don (300 f.Kr.)
- `corlea-vagen-byggs`: Vägen över mossen vid Corlea byggs (148 f.Kr.)
- `damhjortar-fors-till-britannien`: Damhjortar förs till Britannien (1)
- `gravar-av-estnisk-typ-vid-kroggardsmalmen`: Gravar av estnisk typ vid Kroggårdsmalmen (1)

## Val 2026-11-26 (#2079 och #2080)

12 av 40 händelser fick bild. Filsidorna kontrollerades via verktygets licenskontroll (`action=raw`) och bilderna granskades visuellt i en kontaktbild.

- Avvisat efter att filsidan öppnats eller bilden setts: `antikytheravraket` (licensflagga), `karthago-forstors` (saknar upphovsperson), `biatec-mynten` (informationstavla), `slaget-vid-mylae` (licensen kunde inte avgöras).
- Alexandermosaiken: filsidan har både PD-art (mosaiken) och CC BY-SA 3.0 (fotot); verktyget valde "Public domain", men den strängare CC BY-SA 3.0 används för fotot.
- Avstått på grund av kvarlevor: `tollundmannen`, `mjolkproteiner-i-skyternas-tandsten`, `gravar-av-estnisk-typ-vid-kroggardsmalmen`.
- Händelserna `perserkrigen`, `kalliasfreden`, `tollundmannen`, `medracen`, `uppakra` och `antikytheravraket` saknades i den automatiska listan (de har `start` i stället för `year`); `antikytheravraket`, `medracen` och `perserkrigen` söktes manuellt.
- Egen sökning: `lydiska-mynt`, `trakiska-graven-i-kazanlak`, `antikytheravraket`, `medracen`, `perserkrigen`, `arkimedes-i-syrakusa`, `biskupin-byggs`.
