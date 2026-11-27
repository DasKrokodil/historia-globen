# Granskningslista för bildomgång amerika-2

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=38 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 38. **Med minst en användbar kandidat:** 27. **Utan kandidat:** 11.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `amerika-2-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/amerika-2-lista.txt`.

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

## 1. `noche-triste`: Noche Triste – mexica driver ut spanjorerna (1520, Tenochtitlan och dammvägarna över Texcocosjön)

Wikidata: [Q1308854](https://www.wikidata.org/wiki/Q1308854). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `aztekisk-kodex`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The Sad Night (Noche Triste) (Conquest of Mexico) Painting.jpg](https://commons.wikimedia.org/wiki/File:The_Sad_Night_(Noche_Triste)_(Conquest_of_Mexico)_Painting.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | second half of 17th century / 2024-03-10 01:33:21 | 1895 × 1250 | – |
- Nr 1: beskrivning: After the death of Moctezuma, Cortés and his forces leave Tenochtitlán. The Mexica spot them and fiercely attack the Spanish and their allies. Second half of the seventeenth century. Oil on canvas. · kategorier: 1651-1700 paintings; 17th-century paintings of battles; Battle of the Sad Night ("Noche Triste"); Hernán Cortés in art; Mexico in history paintings; Spanish Colonialism in art

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `slaget-vid-otumba`: Slaget vid Otumba (1520, Slätten Temalcatitlán nära Otumba, centrala Mexiko)

Wikidata: [Q2888038](https://www.wikidata.org/wiki/Q2888038). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `aztekisk-kodex`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Battle of Otumba (Conquest of Mexico) Painting.jpg](https://commons.wikimedia.org/wiki/File:Battle_of_Otumba_(Conquest_of_Mexico)_Painting.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | second half of 17 th century date QS:P571,+1650-00-00T00:00:00Z/7 / 2024-03-07 10:13:55 | 2984 × 1935 | – |
- Nr 1: beskrivning: Title: The Battle of Otumba (July 7, 1520). During this flight from Tenochtitlán, Cortés and his men encounter Cuitláhuac, the new Mexica leader of the Aztec empire, the brother of Moctezuma, who attacks the invaders. O… · kategorier: 1651-1700 paintings; 16th-century paintings of battles; 17th-century oil on canvas paintings; Battle of Otumba; Mexico in history paintings

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `spanska-erovringen-av-inkariket`: Spanska erövringen av Inkariket (1532, Anderna, från Ecuador till Peru (började vid Tumbes på Perus nordkust))

Wikidata: [Q636771](https://www.wikidata.org/wiki/Q636771). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `inka`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Inca-Spanish confrontation.JPG](https://commons.wikimedia.org/wiki/File:Inca-Spanish_confrontation.JPG) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Girolamo Benzoni / Theodor de Bry | 09:25, 20 September 2005 (UTC) 20 March 2005 (original upload date) / 2019-11-16 00:20:08 | 1200 × 900 | nutida-foto |
- Nr 1: beskrivning: Inca-Spanish confrontation in Cajamarca; there is Emperor Atahuallpa · kategorier: Atahualpa; Battle of Caxamarca; Francisco Pizarro; History of Cajamarca; Theodor de Bry

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `atahualpa-avrattas`: Atahualpa avrättas (1533, Cajamarca, norra Peru)

Wikidata: [Q179577](https://www.wikidata.org/wiki/Q179577). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `inka`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Atahuallpa, Inca XIIII From Berlin Ethnologisches Museum, Staatliche Museen, Berlin, Germany.png](https://commons.wikimedia.org/wiki/File:Atahuallpa,_Inca_XIIII_From_Berlin_Ethnologisches_Museum,_Staatliche_Museen,_Berlin,_Germany.png) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | anonymous | – / 2018-10-02 23:32:58 | 355 × 458 | datum-osakert, smal, staende |
- Nr 1: beskrivning: "Atahuallpa, Inca XIIII". Unknown artist from the Cusco School; An anonymous portrait painting of Inca King Atahualpa XIIII; located in Berlin Ethnologisches Museum, Staatliche Museen, Berlin, Germany ( Ethnological Mus… · kategorier: Atahualpa; Ethnologisches Museum (Berlin)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `belagringen-av-cusco-1536`: Manco Inca belägrar Cusco (1536, Cusco, inkarikets huvudstad (i dag Peru))

Wikidata: [Q2398589](https://www.wikidata.org/wiki/Q2398589). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `inka`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:POMA0402v.jpg](https://commons.wikimedia.org/wiki/File:POMA0402v.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Felipe Guaman Poma de Ayala | – / 2008-07-03 18:46:55 | 830 × 1200 | datum-osakert, staende |
- Nr 1: beskrivning: 400 [402] MANGO INGA PEGA FVEGO AL CVIVS MANGO a la santa crus · kategorier: Manco Inca; Nueva corónica y buen gobierno; Siege of Cuzco

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `slaget-vid-ollantaytambo`: Inkasegern vid Ollantaytambo (1537, Ollantaytambo i Urubambadalen (i dag Peru))

Wikidata: [Q2338569](https://www.wikidata.org/wiki/Q2338569). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `inka`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Historia de la conquista del Perú, 1851 427026 (3970910539).jpg](https://commons.wikimedia.org/wiki/File:Historia_de_la_conquista_del_Per%C3%BA,_1851_427026_(3970910539).jpg) | wikidata-P18 | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Fondo Antiguo de la Biblioteca de la Universidad de Sevilla from Sevilla, España | 2009-10-01 13:29 / 2016-09-22 22:41:19 | 1617 × 2184 | nutida-foto, staende |
- Nr 1: beskrivning: "La fortaleza de Tambo". Puede acceder al libro completo en el siguiente enlace : Historia de la conquista del Perú : con observaciones preliminares sobre la civilización de los incas / por Guillermo H. Prescott. - Madr… · kategorier: Battle of Ollantaytambo; Historia de la conquista del Perú (1851)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `san-marcos-universitet-1551`: Universitetet San Marcos grundas i Lima (1551, Lima, vicekungadömet Peru (i dag Peru))

Wikidata: [Q270145](https://www.wikidata.org/wiki/Q270145). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:UNMSM sedes principales.png](https://commons.wikimedia.org/wiki/File:UNMSM_sedes_principales.png) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Marco Carrasco | 2021-03-22 / 2024-01-29 06:46:34 | 1600 × 1400 | nutida-foto |
- Nr 1: beskrivning: UNMSM sedes principales Collage de: File:UNMSM plaza central.jpg, File:UNMSM Casona de San Marcos y Parque Universitario 2.0.jpg, File:UNMSM Campus San Fernando.jpg · kategorier: Universidad Nacional Mayor de San Marcos

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `tupac-amaru-avrattas`: Den siste inkan, Túpac Amaru, avrättas (1572, Cusco, vicekungadömet Peru)

Wikidata: [Q296269](https://www.wikidata.org/wiki/Q296269). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:TupacamaruI.JPG](https://commons.wikimedia.org/wiki/File:TupacamaruI.JPG) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Cuzco School / Unidentified painter | 18 th century date QS:P571,+1750-00-00T00:00:00Z/7 / 2023-05-26 01:55:12 | 864 × 1300 | staende |
- Nr 1: beskrivning: Túpac Amaru , the last inca of vilcabamba. · kategorier: 18th-century oil portraits of standing men at full length; 18th-century portrait paintings of men, artist, location and year missing; Golden inscriptions in portrait paintings; History of the Muisca; Holy Roman Empire;…

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `quebec-grundas-1608`: Samuel de Champlain grundar Québec (1608, Québec, Kanada)

Wikidata: [Q2145](https://www.wikidata.org/wiki/Q2145). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Buildings and Roads of Old Quebec City 14.jpg](https://commons.wikimedia.org/wiki/File:Buildings_and_Roads_of_Old_Quebec_City_14.jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Fabian Roudra Baroi | 2022-08-26 02:56:59 / 2023-02-05 04:26:13 | 4000 × 6000 | nutida-foto, staende |
- Nr 1: beskrivning: Buildings and Roads of Old Quebec City, Quebec, Canada · kategorier: Côte de la Montagne, Quebec City; Vieux-Québec

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `guld-i-minas-gerais-1695`: Guldrushen i Minas Gerais börjar (1695, Minas Gerais, Brasilien (markören vid Ouro Preto, tidigare Vila Rica))

Wikidata: [Q4958632](https://www.wikidata.org/wiki/Q4958632). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `barock`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ouro Preto November 2009-7.jpg](https://commons.wikimedia.org/wiki/File:Ouro_Preto_November_2009-7.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Alvesgaspar | 2009-11 / 2013-01-28 00:11:37 | 3872 × 2519 | nutida-foto |
- Nr 1: beskrivning: The Praça Tiradentes, view from the old School of Mines. Ouro Preto, state of Minas Gerais, Brasil · kategorier: Museu da Inconfidência; Praça Tiradentes (Ouro Preto)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `hans-egede-kommer-till-gronland`: Hans Egede kommer till Grönland (1721, Kangeq (Håbets ö) vid Godthåbsfjordens mynning)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `barock`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Hans Egede på Grønland - Louis Moe (17042).tif](https://commons.wikimedia.org/wiki/File:Hans_Egede_p%C3%A5_Gr%C3%B8nland_-_Louis_Moe_(17042).tif) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Louis Moe | 1898 date QS:P571,+1898-00-00T00:00:00Z/9 / 2017-08-20 16:30:08 | 4191 × 3335 | ur-sokning |
| 2 | [File:Hans Egede på Grønland - Louis Moe (17042) - cropped (cropped).png](https://commons.wikimedia.org/wiki/File:Hans_Egede_p%C3%A5_Gr%C3%B8nland_-_Louis_Moe_(17042)_-_cropped_(cropped).png) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Louis Moe | 1898 date QS:P571,+1898-00-00T00:00:00Z/9 / 2026-08-10 16:47:42 | 3019 × 2284 | ur-sokning |
| 3 | [File:Hans Egede på Grønland - Louis Moe (17042) - cropped.png](https://commons.wikimedia.org/wiki/File:Hans_Egede_p%C3%A5_Gr%C3%B8nland_-_Louis_Moe_(17042)_-_cropped.png) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Louis Moe | 1898 date QS:P571,+1898-00-00T00:00:00Z/9 / 2017-08-20 16:38:43 | 3132 × 2439 | ur-sokning |
- Nr 1: beskrivning: The Danish priest Hans Egede had a vision of converting the catholic norsemen, who had settled in Greenland, to the Protestant faith. But when he arrived in Greenland in 1721, they had perished, so instead he set out to… · kategorier: Educational wall pictures from AU Library, Campus Emdrup (DPB); Hans Egede; People of Greenland in art; Prints by Louis Moe; Wall charts
- Nr 2: beskrivning: The Danish priest Hans Egede had a vision of converting the catholic norsemen, who had settled in Greenland, to the Protestant faith. But when he arrived in Greenland in 1721, they had perished, so instead he set out to… · kategorier: Danmarks Historie i Billeder (1898); Denmark in history prints; Educational wall pictures from AU Library, Campus Emdrup (DPB); Hans Egede; People of Greenland in art; Prints by Louis Moe
- Nr 3: beskrivning: The Danish priest Hans Egede had a vision of converting the catholic norsemen, who had settled in Greenland, to the Protestant faith. But when he arrived in Greenland in 1721, they had perished, so instead he set out to… · kategorier: Danmarks Historie i Billeder (1898); Denmark in history prints; Educational wall pictures from AU Library, Campus Emdrup (DPB); Hans Egede; People of Greenland in art; Prints by Louis Moe

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `slaget-vid-curupayty`: Paraguayansk seger vid Curupayty (1866, Curupayty vid Paraguayfloden, södra Paraguay)

Wikidata: [Q2305019](https://www.wikidata.org/wiki/Q2305019). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Batalhacurupaiti.jpg](https://commons.wikimedia.org/wiki/File:Batalhacurupaiti.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown( Candido Lopez , w:en:Cándido López ) | 1866 / 2006-10-04 10:11:02 | 400 × 285 | smal |
- Nr 1: beskrivning: Battle of Curupaity, 24. september 1866. Pt: Soldados paraguaios em Curupaiti atirando de uma trincheira contra as tropas aliadas. · kategorier: 19th-century paintings of battles; Batalha de Curupaiti; Cannons in Paraguay; Cándido López

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `humaita-faller-1868`: Fästningen Humaitá faller (1868, Fästningen Humaitá vid Paraguayfloden, södra Paraguay)

Wikidata: [Q30326664](https://www.wikidata.org/wiki/Q30326664). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Guerra do Paraguai-Operações Passagem Humaita 1866-1868.png](https://commons.wikimedia.org/wiki/File:Guerra_do_Paraguai-Opera%C3%A7%C3%B5es_Passagem_Humaita_1866-1868.png) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Billyriobr | 2 August 2010 (upload date) / 2010-08-02 14:23:59 | 532 × 877 | karta, nutida-foto, smal, staende |
- Nr 1: beskrivning: Graphic scheme of the Passage of Humaita, who was a military operation, which was formed in order to pass through Humaitá Fortress, at the Paraguay River, with a small force of six monitors Navy of Brazil, on February 1… · kategorier: Maps of the Paraguayan War; Passagem de Humaitá

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `slaget-vid-acosta-nu`: Barnens slag vid Acosta Ñu (1869, Acosta Ñu nära Eusebio Ayala, Paraguay)

Wikidata: [Q2717440](https://www.wikidata.org/wiki/Q2717440). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Batalha de Campo Grande - 1871.jpg](https://commons.wikimedia.org/wiki/File:Batalha_de_Campo_Grande_-_1871.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Pedro Américo | 1871 date QS:P571,+1871-00-00T00:00:00Z/9 / 2020-05-04 00:29:34 | 620 × 387 | smal |
- Nr 1: kategorier: Batalha de Campo Grande (painting); History of Brazil 1840-1889 Pedro II Reign

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `slaget-vid-cerro-cora`: Solano López dödas vid Cerro Corá (1870, Cerro Corá i nordöstra Paraguay)

Wikidata: [Q3504617](https://www.wikidata.org/wiki/Q3504617). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:CHICO DIABO atravessando com uma lança Solano López (Semana Illustrada n 485, 27.03.1870).JPG](https://commons.wikimedia.org/wiki/File:CHICO_DIABO_atravessando_com_uma_lan%C3%A7a_Solano_L%C3%B3pez_(Semana_Illustrada_n_485,_27.03.1870).JPG) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1870-03-27 / 2025-12-27 05:06:08 | 2087 × 2543 | staende |
- Nr 1: beskrivning: Chico Diabo atravessando com uma lança Solano López (Semana Illustrada nº 485, 27/03/1870). · kategorier: Batalha de Cerro Corá; Chico Diabo; Dying in art; Images extracted from Semana Illustrada; Kepis of Brazil; Solano López in art

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 16. `yellowstone-nationalpark`: Yellowstone blir nationalpark (1872, Yellowstone, Wyoming, Montana och Idaho, USA)

Wikidata: [Q351](https://www.wikidata.org/wiki/Q351). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Grand Prismatic Spring 2013.jpg](https://commons.wikimedia.org/wiki/File:Grand_Prismatic_Spring_2013.jpg) | wikidata-P18 | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | James St. John from Newark, Ohio | 2013-06-05 18:04 / 2014-08-22 13:09:13 | 4288 × 2848 | nutida-foto |
- Nr 1: beskrivning: Grand Prismatic Spring · kategorier: Grand Prismatic Spring

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 17. `finlay-gula-febern`: Finlay: en mygga sprider gula febern (1881, Havanna, Kuba (där Finlays uppsats lades fram, enligt en fotnot i källan))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Walter Reed letter to Lieutenant Truby (Reeve 67753), National Museum of Health and Medicine (4837288053).jpg](https://commons.wikimedia.org/wiki/File:Walter_Reed_letter_to_Lieutenant_Truby_(Reeve_67753),_National_Museum_of_Health_and_Medicine_(4837288053).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | National Museum of Health and Medicine | 2010-07-28 10:28 / 2020-11-09 17:37:12 | 2386 × 3134 | nutida-foto, staende, ur-sokning |
- Nr 1: beskrivning: Walter Reed letter to Lieutenant Truby (Reeve 67753), National Museum of Health and Medicine Description: Letter from Walter Reed to Lieutenant Truby on December 10, 1900 from the Columbia Barracks. Letter announces adv… · kategorier: 1900 letters; Walter Reed

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 18. `azul-ruben-dario-1888`: Rubén Darío ger ut Azul… (1888, Valparaíso, Chile)

Wikidata: [Q5715218](https://www.wikidata.org/wiki/Q5715218). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Azul - Primera edición.JPG](https://commons.wikimedia.org/wiki/File:Azul_-_Primera_edici%C3%B3n.JPG) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Ruben Dario | 1888 / 2021-08-08 19:38:34 | 1199 × 2001 | staende |
- Nr 1: beskrivning: Azul... es un libro de cuentos y poemas del poeta nicaragüense Rubén Darío, considerado una de las obras más relevantes del modernismo hispánico. Se publicó por primera vez en Valparaíso el 30 de julio de 1888. Dos años… · kategorier: 1888 title pages; Azul...; Title pages from Chile

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 19. `slaget-vid-palonegro`: Slaget vid Palonegro (1900, Palonegro nära Bucaramanga, departementet Santander, Colombia)

Wikidata: [Q4871978](https://www.wikidata.org/wiki/Q4871978). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Visperas batalla palonegro.jpg](https://commons.wikimedia.org/wiki/File:Visperas_batalla_palonegro.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1899 / 2013-03-21 20:12:14 | 709 × 432 | smal |
- Nr 1: beskrivning: Combattants conservateurs avant la bataille de Palonegro, durant la Guerre des Mille Jours · kategorier: Battle of Palonegro; People with flags of Colombia; Thousand Days' War

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 20. `mont-pelee-1902`: Mont Pelée förstör Saint-Pierre (1902, Mont Pelée och Saint-Pierre, Martinique)

Wikidata: [Q386230](https://www.wikidata.org/wiki/Q386230). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The National geographic magazine (1902) (14595295848).jpg](https://commons.wikimedia.org/wiki/File:The_National_geographic_magazine_(1902)_(14595295848).jpg) | wikidata-P18 | No restrictions (flagga); filsidan: flagga – licensen kunde inte avgöras (inga igenkända licensmallar; API: "No restrictions") | Internet Archive Book Images | 1902 / 2023-07-06 17:45:15 | 1483 × 2341 | staende, licens-flagga |
- Nr 1: beskrivning: Identifier : nationalgeograp131902nati ( find matches ) Title : The National geographic magazine Year : 1888 ( 1880s ) Authors : National Geographic Society (U.S.) Subjects : Geography Publisher : Washington : National… · kategorier: 1902 eruption of Mount Pelée; National Geographic Magazine, 1902

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 21. `mexikanska-revolutionen`: Mexikanska revolutionen (1910, Mexiko (de första upproren bröt ut i Morelos och i norra Mexiko))

Wikidata: [Q214426](https://www.wikidata.org/wiki/Q214426). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Revolución mexicana 1915.svg](https://commons.wikimedia.org/wiki/File:Revoluci%C3%B3n_mexicana_1915.svg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Rαge | 2010-04-24 / 2017-02-24 08:56:51 | 976 × 655 | karta |
- Nr 1: beskrivning: Constitucionalistas, villistas y zapatistas en diciembre de 1915. Basado en la información de Introducción a la Revolución mexicana , Garcíadiego páginas 75 y 85. ISBN:970-9765-16-7. · kategorier: 1915 in Mexico; Maps of the Mexican Revolution

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 22. `bingham-vid-machu-picchu`: Hiram Bingham kommer till Machu Picchu (1911, Machu Picchu, Peru)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Hiram Bingham Perurail - linea Cusco-Machu Picchu - 2009-01-06 - Jorge Lascar.jpg](https://commons.wikimedia.org/wiki/File:Hiram_Bingham_Perurail_-_linea_Cusco-Machu_Picchu_-_2009-01-06_-_Jorge_Lascar.jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Jorge Láscar from Australia | 2009-01-06 18:46 / 2013-08-14 22:40:00 | 3216 × 2136 | ur-sokning |
| 2 | [File:Lascar Machu Picchu (4548077793).jpg](https://commons.wikimedia.org/wiki/File:Lascar_Machu_Picchu_(4548077793).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Jorge Láscar from Australia | 2009-01-06 13:20 / 2014-04-02 09:19:22 | 3216 × 2136 | karta, ur-sokning |
| 3 | [File:Lascar Machu Picchu (4548080603).jpg](https://commons.wikimedia.org/wiki/File:Lascar_Machu_Picchu_(4548080603).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Jorge Láscar from Australia | 2009-01-06 13:32 / 2014-04-02 09:19:23 | 4288 × 2848 | karta, ur-sokning |
- Nr 1: beskrivning: The Hiram Bingham train is the most luxurious way to journey between Cusco and Machu Picchu. For many visitors a trip to Machu Picchu is a once in a lifetime experience. The Hiram Bingham assures a magical journey never… · kategorier: 2009 in rail transport in Peru; Aguas Calientes railway station; Belmond Hiram Bingham; January 2009 in rail transport; Narrow gauge coaches of Peru; Narrow gauge rail vehicles of PeruRail
- Nr 2: beskrivning: Machu Picchu (Quechua: Machu Pikchu, "Old Peak") is a pre-Columbian Inca site located 2,430 metres (8,000 ft) above sea level. It is situated on a mountain ridge above the Urubamba Valley in Peru, which is 80 kilometres… · kategorier: Views of Machu Picchu with Huayna Picchu in the background
- Nr 3: beskrivning: Machu Picchu (Quechua: Machu Pikchu, "Old Peak") is a pre-Columbian Inca site located 2,430 metres (8,000 ft) above sea level. It is situated on a mountain ridge above the Urubamba Valley in Peru, which is 80 kilometres… · kategorier: Views of Machu Picchu with Huayna Picchu in the background

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 23. `plan-de-ayala`: Zapata utropar Plan de Ayala (1911, Ayala, Morelos)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Plan of Ayala WDL2970.jpg](https://commons.wikimedia.org/wiki/File:Plan_of_Ayala_WDL2970.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Montaño, Otilio (1877-1917) | 25 November 1911 date QS:P571,+1911-11-25T00:00:00Z/11 / 2014-03-13 10:00:49 | 1024 × 1600 | staende, ur-sokning |
- Nr 1: beskrivning: John Womack, historian of the Mexican Revolution, has called the Plan of Ayala the "Sacred Scripture" of the Zapatistas. Written by Emiliano Zapata and Otilio Montaño, and signed on November 25, 1911, the plan was procl… · kategorier: Manuscripts from the World Digital Library; Plan de Ayala

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 24. `decena-tragica`: Decena Trágica – kuppen mot Madero (1913, Mexico City (centrum))

Wikidata: [Q1187198](https://www.wikidata.org/wiki/Q1187198). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Decena trágica.JPG](https://commons.wikimedia.org/wiki/File:Decena_tr%C3%A1gica.JPG) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Osuna | 1913 / 2026-01-10 03:00:31 | 6098 × 4335 | – |
- Nr 1: beskrivning: Decena trágica. Soldados sublevados en acción. 1913. Fotografia: Osuna. · kategorier: Archivo Casasola; February 1913 in Mexico City; Hotchkiss machine guns in Mexican service; Mexican Revolution

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 25. `panamakanalen-oppnas`: Panamakanalen öppnas (1914, Panamakanalen, Panama)

Wikidata: [Q7350](https://www.wikidata.org/wiki/Q7350). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Panama Canal Gatun Locks.jpg](https://commons.wikimedia.org/wiki/File:Panama_Canal_Gatun_Locks.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – flera licenser: CC BY-SA 3.0, CC BY-SA 2.5; GFDL anges också (dubbellicens) | User:Stan Shebs | 2000-01-02 / 2005-01-30 18:47:20 | 1600 × 1067 | – |
| 2 | [File:Panama Canal, Agua Clara locks, Control tower (Torre de control).jpg](https://commons.wikimedia.org/wiki/File:Panama_Canal,_Agua_Clara_locks,_Control_tower_(Torre_de_control).jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Dr. Thomas Liptak | 2025-03-19 20:07:57 / 2025-06-20 13:46:57 | 5184 × 2916 | – |
- Nr 1: beskrivning: Photo of Panama Canal Gatun Locks. · kategorier: Gatun Locks
- Nr 2: beskrivning: Panama Canal: Agua Clara locks: Control tower · kategorier: 2025 photographs of Panama; Agua Clara Locks; Atlantic Bridge, Panama; Colón, Panama; Emerald Princess (ship, 2007); Panama Canal in 2025

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 26. `slaget-vid-zacatecas-1914`: Villa intar Zacatecas (1914, Zacatecas, norra Mexiko)

Wikidata: [Q1848264](https://www.wikidata.org/wiki/Q1848264). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:TakingofZacatecas.JPG](https://commons.wikimedia.org/wiki/File:TakingofZacatecas.JPG) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Ángel Boliver, (1926-1993) [ 1 ] | 1965 [ 2 ] / 2022-12-05 17:44:22 | 2769 × 1793 | – |
- Nr 1: beskrivning: Painting of Taking of Zacatecas, the largest battle of the Mexican Revolution, by Ángel Boliver, Museo Nacional de Historia · kategorier: Mexican Revolution; Pancho Villa

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 27. `vandringsduvan-dor-ut`: Martha, den sista vandringsduvan, dör (1914, Cincinnatis djurpark, Ohio, USA)

Wikidata: [Q1536726](https://www.wikidata.org/wiki/Q1536726). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Martha last passenger pigeon 1912.jpg](https://commons.wikimedia.org/wiki/File:Martha_last_passenger_pigeon_1912.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand-med-not Public domain – risk: public domain bara i USA (pd-us): kontrollera att verket först publicerades i USA, eller vad som gäller i ursprungslandet | Enno Meyer | 1912 , published 1921. / 2016-04-09 13:08:40 | 1587 × 2206 | staende, licens-risk |
- Nr 1: beskrivning: Martha the last passenger pigeon. · kategorier: Live Ectopistes migratorius; Martha (passenger pigeon) · licensrisk: public domain bara i USA (pd-us): kontrollera att verket först publicerades i USA, eller vad som gäller i ursprungslandet

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `smittkoppor-i-tenochtitlan-1520`: Smittkoppor drabbar Tenochtitlan (1520)
- `cocoliztli-1545`: Cocoliztli, den stora farsoten i Mexiko (1545)
- `vilcabamba-intas-1572`: Spanjorerna intar Vilcabamba (1572)
- `mita-i-potosi-1573`: Tvångsarbetet mit'a börjar i silvergruvorna i Potosí (1573)
- `cocoliztli-1576`: Cocoliztli slår till igen (1576)
- `palmares-quilombo`: Quilombon Palmares, ett samhälle av förrymda slavar (1605)
- `sor-juana-respuesta-1691`: Sor Juana försvarar kvinnors rätt till utbildning (1691)
- `godthab-grundas`: Godthåb, dagens Nuuk, grundas (1728)
- `stand-watie-kapitulerar`: Cherokeegeneralen Stand Watie lägger ner vapnen (1865)
- `chagas-ny-parasit-1909`: Carlos Chagas hittar en ny parasit (1909)
- `fordraget-i-ciudad-juarez`: Fördraget i Ciudad Juárez – Díaz avgår (1911)

## Val 2026-11-26 (#2097 och #2100)

13 av 40 händelser fick bild; 1 har en utsedd kandidat som inte kunde hämtas (`amerika-2-ej-hamtade.txt`). Filsidorna kontrollerades via verktygets licenskontroll (`action=raw`) och bilderna granskades visuellt i en kontaktbild.

- Avvisat efter att filsidan öppnats: `decena-tragica` (overifierad licens på ett foto från 1913), `slaget-vid-zacatecas-1914` (verk från 1965), `vandringsduvan-dor-ut` (PD-US-risk), `mont-pelee-1902` (licensen kunde inte avgöras), `bingham-vid-machu-picchu` (visar ett tåg).
- Händelserna `sjuarskriget` och `trippelalliansfordraget` saknades i den automatiska listan (de har `start` i stället för `year`); ingen manuell sökning hann göras.
- Egen sökning: `hans-egede-kommer-till-gronland` (kandidat i listan), `belagringen-av-cusco-1536` (kandidat i listan).
