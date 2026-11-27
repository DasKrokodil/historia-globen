# Granskningslista för bildomgång europa-4

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=39 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 39. **Med minst en användbar kandidat:** 15. **Utan kandidat:** 24.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `europa-4-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/europa-4-lista.txt`.

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

## 1. `hobygraven-pa-lolland`: Hobygraven på Lolland (1, Hoby på Lolland, Danmark)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Silver cup Hoby Philoctetes Nationalmuseet.jpg](https://commons.wikimedia.org/wiki/File:Silver_cup_Hoby_Philoctetes_Nationalmuseet.jpg) | commons-sok | Public domain (trolig); filsidan: godkand-med-not Public domain – flera licenser: Public domain, CC BY 4.0 | Marie-Lan Nguyen | 2017-07-17 / 2020-02-20 08:17:31 | 4500 × 3375 | nutida-foto, ur-sokning |
| 2 | [File:Silver cup Hoby Priam Nationalmuseet n1.jpg](https://commons.wikimedia.org/wiki/File:Silver_cup_Hoby_Priam_Nationalmuseet_n1.jpg) | commons-sok | Public domain (trolig); filsidan: godkand-med-not Public domain – flera licenser: Public domain, CC BY 4.0 | Marie-Lan Nguyen | 2017-07-17 / 2020-02-20 08:47:07 | 4500 × 3004 | nutida-foto, ur-sokning |
| 3 | [File:Silver cup Hoby Priam Nationalmuseet n2.jpg](https://commons.wikimedia.org/wiki/File:Silver_cup_Hoby_Priam_Nationalmuseet_n2.jpg) | commons-sok | Public domain (trolig); filsidan: godkand-med-not Public domain – flera licenser: Public domain, CC BY 4.0 | Marie-Lan Nguyen | 2017-07-17 / 2020-02-20 08:55:11 | 4000 × 2669 | nutida-foto, ur-sokning |
- Nr 1: kategorier: Ancient Roman silverware in Denmark; Ancient Roman skyphoi; Cheirisophos; Hoby treasure; Philoctetes; Roman antiquities in Nationalmuseet, Copenhagen
- Nr 2: kategorier: Ancient Roman silverware in Denmark; Ancient Roman skyphoi; Cheirisophos; Hoby treasure; Ransom of Hector; Roman antiquities in Nationalmuseet, Copenhagen
- Nr 3: kategorier: Ancient Roman silverware in Denmark; Ancient Roman skyphoi; Cheirisophos; Hoby treasure; Ransom of Hector; Roman antiquities in Nationalmuseet, Copenhagen

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `claudius-tunnel-vid-fucinosjon`: Claudius tunnel ska sänka Fucinosjön (41, Claudius tunnlar vid berget Salviano nära Avezzano, Abruzzo, Italien)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Fuciner-lake nasa.jpg](https://commons.wikimedia.org/wiki/File:Fuciner-lake_nasa.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | ISS Crew Earth Observations experiment , Caption by M. Justin Wilkinson, NASA-JSC. | 2008-02-26 / 2008-03-20 07:23:59 | 1080 × 810 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: The light tan oval in this image is the floor of a lake in central Italy that has been drained by a tunnel dug through the surrounding hills. Numerous rectangular fields occupy the former lake bottom—now one of the most… · kategorier: Drained; ISS Expedition 16 Crew Earth Observations; Satellite pictures of Avezzano; Satellite pictures of Fucine Plain

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `guldgruvan-i-las-medulas`: Romarna bryter guld i stor skala i Las Médulas (51, Las Médulas nära Ponferrada, León, Spanien)

Wikidata: [Q696803](https://www.wikidata.org/wiki/Q696803). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Las Medulas (17504738221).jpg](https://commons.wikimedia.org/wiki/File:Las_Medulas_(17504738221).jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Frayle from Salamanca, España | 2014-05-09 14:22 / 2021-10-15 02:11:39 | 4288 × 2848 | nutida-foto |
- Nr 1: beskrivning: Las Medulas · kategorier: Las Médulas

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `herkules-torn-i-a-coruna`: Herkules torn, en romersk fyr vid Atlanten (71, A Coruña, Galicien, Spanien)

Wikidata: [Q245151](https://www.wikidata.org/wiki/Q245151). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Torre de Hércules 2023.jpg](https://commons.wikimedia.org/wiki/File:Torre_de_H%C3%A9rcules_2023.jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Fernando | 2023-04-30 13:34:55 / 2024-10-17 17:26:25 | 3823 × 5734 | nutida-foto, staende |
- Nr 1: beskrivning: Tower of Hercules, an ancient Roman lighthouse in A Coruña , northern Spain. · kategorier: Clouds and blue sky in Spain; Torre de Hércules

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `gravfaltet-vid-driffield-terrace`: Arvsmassan från det romerska gravfältet i York (101, York, England (punkten är staden; gravfältet ligger vid Driffield Terrace))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Bell Beaker Culture.png](https://commons.wikimedia.org/wiki/File:Bell_Beaker_Culture.png) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Maptist | 2026-09-07 / 2026-09-27 13:39:15 | 3200 × 2741 | karta, nutida-foto, ur-sokning |
- Nr 1: beskrivning: Simplified map of the Bell Beaker Culture and all of its subgroups · kategorier: Bellbeaker culture; Maps of the European Neolithic

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `vattenkvarnarna-i-barbegal`: Vattenkvarnarna i Barbegal (101, Barbegal vid Fontvieille, nära Arles, Frankrike)

Wikidata: [Q89272148](https://www.wikidata.org/wiki/Q89272148). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Barbegal aqueduct 01.jpg](https://commons.wikimedia.org/wiki/File:Barbegal_aqueduct_01.jpg) | wikidata-P18 | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | maarjaara | 2008-08-10 16:44:23 / 2009-05-17 08:08:08 | 3072 × 2304 | nutida-foto |
- Nr 1: beskrivning: Barbegal aqueduct · kategorier: Barbegal aqueduct

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `trajanus-bro-over-donau`: Trajanus bro över nedre Donau (103, Donau vid Drobeta-Turnu Severin, Rumänien, och Kladovo, Serbien)

Wikidata: [Q849786](https://www.wikidata.org/wiki/Q849786). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Piciorul Podului lui Traian, malul românesc (19 august 2009).jpg](https://commons.wikimedia.org/wiki/File:Piciorul_Podului_lui_Traian,_malul_rom%C3%A2nesc_(19_august_2009).jpg) | wikidata-P18 | CC BY-SA 3.0 ro (trolig); filsidan: godkand CC BY-SA 3.0 RO | Dan Mihai Pitea | 2009-08-19 12:00:07 / 2013-03-31 15:01:38 | 1368 × 1824 | nutida-foto, staende |
- Nr 1: beskrivning: The ancient ruin of a pier of Trajan's Bridge on the Romanian shore of the Danube, at Drobeta-Turnu Severin. It is presently surrounded by a square concrete compound which was built to protect it from the rise of the wa… · kategorier: Trajan's Bridge ruins in Drobeta-Turnu Severin

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `runorna-fran-vimose`: Runorna från Vimose (160, Vimose, nordvästra Fyn, Danmark)

Wikidata: [Q1465016](https://www.wikidata.org/wiki/Q1465016). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Kam-med-runer-fra-Vimose DO-4148 2000.jpg](https://commons.wikimedia.org/wiki/File:Kam-med-runer-fra-Vimose_DO-4148_2000.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: flagga CC BY-SA 3.0 – motsägelse: filsidans mallar ({{cc-by-sa-2.5}}) och API:et ("CC BY-SA 3.0") anger olika licens | Nationalmuseet, Roberto Fortuna og Kira Ursem | 2007-01-01 / 2016-03-01 11:35:42 | 2000 × 1616 | nutida-foto, ur-sokning, licens-flagga |
| 2 | [File:Kam-med-runer-fra-Vimose DO-4148 2000 (cropped).jpg](https://commons.wikimedia.org/wiki/File:Kam-med-runer-fra-Vimose_DO-4148_2000_(cropped).jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: flagga CC BY-SA 3.0 – motsägelse: filsidans mallar ({{cc-by-sa-2.5}}) och API:et ("CC BY-SA 3.0") anger olika licens | Nationalmuseet, Roberto Fortuna og Kira Ursem | 2007-01-01 / 2024-02-04 13:57:02 | 1275 × 1125 | nutida-foto, ur-sokning, licens-flagga |
| 3 | [File:Antler comb from Vimose, Funen, Denmark (DR 207).jpg](https://commons.wikimedia.org/wiki/File:Antler_comb_from_Vimose,_Funen,_Denmark_(DR_207).jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Bloodofox | – / 2008-05-28 20:45:22 | 1000 × 816 | datum-osakert, ur-sokning |
- Nr 1: beskrivning: Crest with runes HARJA. From Vimose, Næsbyhoved-Broby parish. It transliterates: "harja" (ᚺᚨᚱᛃᚨ), a male name. It translates: "warrior". · kategorier: Ancient Germanic combs; Elder Futhark inscriptions; Medieval objects in the Nationalmuseet, Copenhagen; Objects made of antler; Vimose
- Nr 2: beskrivning: Crest with runes HARJA. From Vimose, Næsbyhoved-Broby parish. It transliterates: "harja" (ᚺᚨᚱᛃᚨ), a male name. It translates: "warrior". · kategorier: Ancient Germanic combs; Elder Futhark inscriptions; Medieval objects in the Nationalmuseet, Copenhagen; Objects made of antler; Vimose
- Nr 3: beskrivning: A comb made of antler from around 150 to 200 CE and was found in Vimose on the island of Funen, Denmark. The Elder Futhark inscription reads "Harja", a male name. This is the oldest known runic inscription. The comb is… · kategorier: Ancient Germanic combs; Danish prehistory objects in the Nationalmuseet, Copenhagen; Elder Futhark inscriptions; Objects made of antler

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `kyla-i-syditalien-245-275`: Kallt och torrt i södra Italien (245, Södra Italien (punkten är borrkärnan i Tarantobukten))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Saharan dust over the Mediterranean Sea (MODIS 2016-03-08).jpg](https://commons.wikimedia.org/wiki/File:Saharan_dust_over_the_Mediterranean_Sea_(MODIS_2016-03-08).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Jeff Schmaltz, MODIS Land Rapid Response Team, NASA GSFC | Taken on 29 February 2016 / 2024-02-15 19:43:23 | 5000 × 6400 | nutida-foto, staende, ur-sokning |
| 2 | [File:2024-09-11--23 synops(svg)ver2'2.png](https://commons.wikimedia.org/wiki/File:2024-09-11--23_synops(svg)ver2%272.png) | commons-sok | Public domain (trolig); filsidan: godkand-med-not Public domain – flera licenser: Public domain, CC BY 4.0 | Map: EUMETNET – MeteoAlarm www.meteoalarm.org Graphics: Own work W!B: ( talk ) 23:52, 8 October 2024 (UTC) | 2024-09-16 / 2024-10-08 23:52:23 | 1220 × 1200 | karta, nutida-foto, staende, ur-sokning |
| 3 | [File:A descriptive catalogue of vegetables (1940) (20258260133).jpg](https://commons.wikimedia.org/wiki/File:A_descriptive_catalogue_of_vegetables_(1940)_(20258260133).jpg) | commons-sok | No restrictions (flagga); filsidan: flagga – licensen kunde inte avgöras (inga igenkända licensmallar; API: "No restrictions") | Internet Archive Book Images | 1940 / 2015-10-20 15:25:04 | 1902 × 1226 | ur-sokning, licens-flagga |
- Nr 1: beskrivning: In late February 2016, a river of dust flowed from the Saharan Desert across the Mediterranean Sea behind a strong cold front. The Moderate Resolution Imaging Spectroradiometer (MODIS) aboard NASA's Terra satellite acqu… · kategorier: 2016 satellite pictures; Mediterranean Sea; Photos by the Terra (satellite) MODIS
- Nr 2: beskrivning: Map showing a schematic surface weather analysis and impact areas of Vb-type low pressure system Boris causing heavy floods in Central Europe mid September 2024. Background shows alert levels given by EUMETNET – MeteoAl… · kategorier: 2024 Central European floods; Maps of weather and climate of Europe; Mediterranean tropical-like cyclone track maps; Meteorological analysis maps; Storm Boris (2024); Weather warning maps
- Nr 3: beskrivning: Title : A descriptive catalogue of vegetables Identifier : descriptivecatal1940asso ( find matches ) Year : 1940 ( 1940s ) Authors : Associated Seed Growers, Inc Subjects : Vegetables ; Commercial catalogs ; Nurseries (… · kategorier: 1940 catalogs; Brassica oleracea var. viridis; Descriptive catalogues

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `cyprianus-pest`: Cyprianus pest (249, Romarriket; Karthago, där biskop Cyprianus beskrev pesten (i dag Tunisien))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Heiliger Cyprianus.jpg](https://commons.wikimedia.org/wiki/File:Heiliger_Cyprianus.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Master of Messkirch | circa 1535/40 / 2007-02-20 07:45:13 | 910 × 1986 | staende, ur-sokning |
| 2 | [File:Saint Cyprien évêque de Carthage.jpg](https://commons.wikimedia.org/wiki/File:Saint_Cyprien_%C3%A9v%C3%AAque_de_Carthage.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1780-01-01 16:52:03 / 2017-09-17 17:20:30 | 826 × 1153 | staende, ur-sokning |
| 3 | [File:Nuremberg chronicles f 121v 1.png](https://commons.wikimedia.org/wiki/File:Nuremberg_chronicles_f_121v_1.png) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Michel Wolgemut, Wilhelm Pleydenwurff (Text: Hartmann Schedel ) | 1493 / 2007-07-21 21:32:31 | 230 × 293 | smal, staende, ur-sokning |
- Nr 1: beskrivning: Ausstattung der ehemaligen Seitenaltäre der Meßkircher St. Martinskirche, Standflügel: als Bischof und Märtyrer · kategorier: Bishops in art; Paintings by Meister von Meßkirch in the Staatsgalerie Stuttgart; Paintings of Saint Cyprian; Seitenaltäre des Meisters von Meßkirch (ehemals St. Martin, Meßkirch) (Seitentafeln)
- Nr 2: beskrivning: Saint Cyprien évêque de Carthage · kategorier: Prints of Saint Cyprian
- Nr 3: beskrivning: Illustration from the Nuremberg Chronicle · kategorier: Bishops in the Nuremberg Chronicle; Nuremberg Chronicle illustrations f 121-130; Prints of Saint Cyprian

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `vattengraven-i-levanluhta`: Vattengraven i Levänluhta (300, Levänluhta, Orismala by, Storkyro, Finland)

Wikidata: [Q10560736](https://www.wikidata.org/wiki/Q10560736). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Leväluhta bog, Merovingian age bones - National Museum of Finland - DSC04176.JPG](https://commons.wikimedia.org/wiki/File:Lev%C3%A4luhta_bog,_Merovingian_age_bones_-_National_Museum_of_Finland_-_DSC04176.JPG) | wikidata-P18 | CC0 (trolig); filsidan: godkand CC0 | Daderot | 2012-08-14 09:00:51 / 2012-12-05 23:28:50 | 4320 × 3240 | nutida-foto |
| 2 | [File:Leväluhta 2013.jpg](https://commons.wikimedia.org/wiki/File:Lev%C3%A4luhta_2013.jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Kaj Höglund | 2013-06-21 22:20:38 / 2017-09-29 09:05:58 | 5616 × 3744 | nutida-foto, konstverk |
- Nr 1: beskrivning: Remains from Levänluhta (Isokyrö, Ostrobothnia). Exhibit in the Archaeological collections, National Museum of Finland, Helsinki, Finland. Photography was permitted in the museum without restriction. · kategorier: Archaeological collections of the National Museum of Finland; Leväluhta; Skeleton specimens
- Nr 2: beskrivning: This is a photo of a monument in Finland identified by the ID 'Levänluhta' (Q10560736) · kategorier: Leväluhta

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `eketorps-borg-byggs`: Eketorps borg byggs på Öland (400, Eketorp, sydöstra Öland, Sverige)

Wikidata: [Q1011625](https://www.wikidata.org/wiki/Q1011625). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Eketorp main view.jpg](https://commons.wikimedia.org/wiki/File:Eketorp_main_view.jpg) | wikidata-P18 | CC BY 2.5 (trolig); filsidan: godkand-med-not CC BY 2.5 – flera licenser: CC BY-SA 3.0, CC BY 2.5; GFDL anges också (dubbellicens) | Håkan Svensson (Xauxa) | 2005-08-02 / 2006-08-19 17:33:56 | 2345 × 1777 | nutida-foto |
| 2 | [File:Eketorp main view02.jpg](https://commons.wikimedia.org/wiki/File:Eketorp_main_view02.jpg) | wikidata-P18 | CC BY 2.5 (trolig); filsidan: godkand-med-not CC BY 2.5 – flera licenser: CC BY-SA 3.0, CC BY 2.5; GFDL anges också (dubbellicens) | Håkan Svensson (Xauxa) | 2005-08-02 / 2006-08-19 17:34:52 | 1994 × 1492 | nutida-foto |
- Nr 1: beskrivning: Eketorp fornby / Eketorp ancient village. Island of Öland, Sweden. · kategorier: 2005 in Mörbylånga Municipality; August 2005 in Kalmar County; Eketorps fornborg
- Nr 2: beskrivning: Eketorp fornby / Eketorp ancient village. Island of Öland, Sweden. · kategorier: 2005 in Mörbylånga Municipality; August 2005 in Kalmar County; Eketorps fornborg

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `guldhornen-fran-gallehus`: Guldhornen från Gallehus (400, Gallehus nära Møgeltønder, Danmark)

Wikidata: [Q1394096](https://www.wikidata.org/wiki/Q1394096). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `antik`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Guldhornene.jpg](https://commons.wikimedia.org/wiki/File:Guldhornene.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: flagga CC BY-SA 3.0 – API:et säger "CC BY-SA 3.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) |  | – / 2025-06-06 14:32:59 | 650 × 384 | datum-osakert, smal, licens-flagga |
- Nr 1: kategorier: Golden horns of Gallehus

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `justinianska-pesten-541`: Justinianska pesten (541, Konstantinopel och Medelhavsområdet)

Wikidata: [Q821711](https://www.wikidata.org/wiki/Q821711). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `tidig-medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Diptych Barberini Louvre OA9063 whole.jpg](https://commons.wikimedia.org/wiki/File:Diptych_Barberini_Louvre_OA9063_whole.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | early 6th century / 2011-03-26 14:00:42 | 2500 × 3125 | staende |
| 2 | [File:Yersinia pestis wayson.jpg](https://commons.wikimedia.org/wiki/File:Yersinia_pestis_wayson.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | U.S. Center for Disease Control | 2005-03-30 / 2006-10-28 18:45:22 | 600 × 441 | nutida-foto, smal |
- Nr 1: beskrivning: Barberini diptych. Constantinople, Late Roman Theodosian style. · kategorier: Barberini diptych
- Nr 2: beskrivning: Wayson stain of Yersinia pestis. Note the characteristic "safety pin" appearance of the bacteria. · kategorier: Yersinia pestis

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `kairouan-grundas`: Kairouan grundas (670, Kairouan (i dag Tunisien))

Wikidata: [Q179570](https://www.wikidata.org/wiki/Q179570). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `islamisk`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:View of Kairouan from the Minaret of the Great Mosque - Tunisia - 1899.jpg](https://commons.wikimedia.org/wiki/File:View_of_Kairouan_from_the_Minaret_of_the_Great_Mosque_-_Tunisia_-_1899.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1899 / 2008-12-05 16:01:01 | 600 × 443 | smal |
- Nr 1: beskrivning: Photograph of Kairouan from the Minaret of the Great Mosque, Tunisia. This color photochrome print was taken in 1899 in Kairouan, Tunisia. · kategorier: Kairouan on photochrome prints

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `nero-och-korinthkanalen`: Nero börjar gräva en kanal genom Korinthiska näset (67)
- `romerska-fynd-vid-drumanagh`: Romerska föremål vid Drumanagh på Irlands östkust (71)
- `akvedukten-fran-zaghouan`: Akvedukten från Zaghouan leder vatten till Karthago (101)
- `kalendern-fran-coligny`: Bronstavlan från Coligny visar en gallisk kalender (101)
- `antiokia-jordbavningen-115`: Jordbävningen i Antiokia (115)
- `torka-i-romerska-nordafrika-under-hadrianus`: Fem år av torka i romerska Nordafrika (123)
- `vaxtavlan-fran-alburnus-maior`: Gruvstaden Alburnus Maior nämns på en vaxtavla (131)
- `guldet-i-timra`: Guldet i Timrå och handeln i Medelpad (200)
- `handelsplatsen-pa-helgo`: Handelsplatsen på Helgö växer fram (200)
- `baiae-sjunker-i-havet`: Baiae börjar sjunka i havet (201)
- `fynden-pa-fjallens-isfalt-okar`: Fynden på fjällens isfält blir fler (201)
- `hastarna-i-litauens-gravar`: Hästarna i Litauens gravar (201)
- `aldsta-hona-i-finland-pa-aland`: Finlands äldsta daterade höns fanns på Åland (266)
- `idrottande-kvinnor-i-villa-romana-del-casale`: Idrottande kvinnor i Villa Romana del Casale (300)
- `goternas-gravar-i-bulgarien`: Arvsmassa från gravplatser med gotisk anknytning i Bulgarien (320)
- `jordbavningen-i-nicomedia-358`: Jordbävning och brand ödelägger Nicomedia (358)
- `hovdingagravarna-i-snartemo`: Hövdingagravarna i Snartemo (375)
- `augustinus-skriver-bekannelser`: Augustinus skriver Bekännelser (397)
- `caelius-aurelianus-oversatter-soranos`: Caelius Aurelianus för över Soranos läkekonst till latin (400)
- `martianus-capella-och-de-sju-fria-konsterna`: Martianus Capella samlar de sju fria konsterna i en bok (410)
- `spetalska-i-great-chesterford`: Spetälska hos en ung man i Great Chesterford (415)
- `spetalska-i-fallward`: Mannen i båtgraven i Fallward hade spetälska (426)
- `malaria-i-barngravarna-vid-lugnano`: Malaria bland barnen vid Lugnano (450)
- `vesuvius-472`: Aska från Vesuvius når Konstantinopel (472)

## Val 2026-11-26 (#2081 och #2082)

10 av 40 händelser fick bild. Filsidorna kontrollerades via verktygets licenskontroll (`action=raw`) och bilderna granskades visuellt i en kontaktbild.

- Licensval: Hobygraven (filsidan har PD-old-100-1923 för bägaren och CC BY 4.0 för fotot; CC BY 4.0 används), Eketorp (tre licenser; den strängare CC BY-SA 3.0 används), Las Médulas (Flickrs Public Domain Mark, ingen CC-licens), Trajanus bro (CC BY-SA 3.0 RO).
- Zaghouan: filsidans titel anger Hadrianus som byggare men händelsen anger år 101; uppgifterna kan skilja sig (flaggat).
- Avstått på grund av kvarlevor, gravar och sjukdom: `vattengraven-i-levanluhta`, `spetalska-i-great-chesterford`, `spetalska-i-fallward`, `malaria-i-barngravarna-vid-lugnano`, `cyprianus-pest`, `justinianska-pesten-541`, `hovdingagravarna-i-snartemo`.
- Händelsen `tjerniachovkulturen` saknades i den automatiska listan (den har `start` i stället för `year`).
- Egen sökning: `nero-och-korinthkanalen`, `akvedukten-fran-zaghouan`, `idrottande-kvinnor-i-villa-romana-del-casale`, `kalendern-fran-coligny`, `baiae-sjunker-i-havet`, `augustinus-skriver-bekannelser`, `vesuvius-472`, `handelsplatsen-pa-helgo`.
