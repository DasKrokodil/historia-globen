# Granskningslista för bildomgång europa-1

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=26 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 26. **Med minst en användbar kandidat:** 13. **Utan kandidat:** 13.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `europa-1-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/europa-1-lista.txt`.

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

## 1. `obsidian-fran-melos-i-franchthi`: Obsidian från Melos i Franchthigrottan (13000 f.Kr., Franchthigrottan vid Kiladabukten i Argolis, Grekland)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Paleolithic, obsidian, Franchthi Cave, 202046.jpg](https://commons.wikimedia.org/wiki/File:Paleolithic,_obsidian,_Franchthi_Cave,_202046.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Zde | 2020-09-25 08:50:41 / 2020-12-02 11:33:00 | 5875 × 3909 | nutida-foto, ur-sokning |
| 2 | [File:Paleolithic, obsidian, Franchthi Cave, 202046x.jpg](https://commons.wikimedia.org/wiki/File:Paleolithic,_obsidian,_Franchthi_Cave,_202046x.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Zde | 2020-09-25 08:50:41 / 2020-12-02 12:26:46 | 2366 × 1574 | nutida-foto, ur-sokning |
| 3 | [File:Mesolithic, Franchthi Cave, AM of Nafplio, 202048.jpg](https://commons.wikimedia.org/wiki/File:Mesolithic,_Franchthi_Cave,_AM_of_Nafplio,_202048.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Zde | 2020-09-25 08:51:14 / 2020-12-02 12:34:47 | 5766 × 3837 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: (1-7) Flint tools. (8-9) Obsidian tools, obsidian of Melos. (10-12) Bone tools. (13-21) Perforated shells. (22-23) Bones of gilthead seabream, spaurus auratus, (24) red deer, Cervus elaphus and (25-26) wild pig, Sus scr… · kategorier: Cycladic obsidian; Flint tools; Paleolithic in the Archaeological Museum of Nafplio
- Nr 2: beskrivning: (8-9) Obsidian tools, obsidian of Melos. Below is flint tools, rights is bone tools. Paleolithic, 10000 - 8000 BC. Findings from Franchthi Cave. Archaeological Museum of Nafplio. · kategorier: Cycladic obsidian; Paleolithic in the Archaeological Museum of Nafplio
- Nr 3: beskrivning: (1-15) Flint tools. (16-17) Obsidian tools, obsidian of Melos. (18-19) Bone tools. (20-22) Perforated shells. (23) Landsnails, Helix figulina. Mesolithic, 7500 - 7000 BC. Findings from Franchthi Cave. Archaeological Mus… · kategorier: Cycladic obsidian; Mesolithic in the Archaeological Museum of Nafplio

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `laacher-see-utbrottet`: Vulkanutbrottet vid Laacher See (11051 f.Kr., Laacher See i Eifel, Rheinland-Pfalz, Tyskland)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Close-up of the Wingertsbergwand.jpg](https://commons.wikimedia.org/wiki/File:Close-up_of_the_Wingertsbergwand.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | OutcropWizard | 2019-09-20 11:32:10 / 2021-05-30 23:06:31 | 5472 × 3648 | nutida-foto, ur-sokning |
| 2 | [File:Carrière du Wingertsberg - éruption du Laacher See.jpeg](https://commons.wikimedia.org/wiki/File:Carri%C3%A8re_du_Wingertsberg_-_%C3%A9ruption_du_Laacher_See.jpeg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Tsuhful | 2011-05-07 / 2011-05-17 21:02:54 | 2560 × 1920 | nutida-foto, ur-sokning |
| 3 | [File:Steinbruch zwischen Laacher See und Mendig im Landschaftsschutzgebiet Rhein-Ahr-Eifel-9366.jpg](https://commons.wikimedia.org/wiki/File:Steinbruch_zwischen_Laacher_See_und_Mendig_im_Landschaftsschutzgebiet_Rhein-Ahr-Eifel-9366.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: flagga CC BY-SA 4.0 – API:et säger "CC BY-SA 4.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Raimond Spekking | 2013-12-29 13:12:05 / 2014-06-27 07:39:10 | 5184 × 2651 | nutida-foto, ur-sokning, licens-flagga |
- Nr 1: beskrivning: Close-up of the deposits of the Laacher See eruption at the Wingertsbergwand · kategorier: Laacher See; Laacher See Volcano; Mendig; Wingertsbergwand
- Nr 2: beskrivning: La couche supérieure, soit l'ULST - Upper Laacher See Tephra - est la zone la plus riche en phénocristaux et en minéraux mafiques. La couche moyenne - MLST, Middle Laacher See Tephra - présente des échantillons plus hét… · kategorier: Wingertsbergwand
- Nr 3: beskrivning: Steinbruch zwischen Laacher See und Mendig im Landschaftsschutzgebiet Rhein-Ahr-Eifel (Gebietsnummer 07-LSG-71-4) Steinbruch Michels - Asche- und Bimstufflagen der Laacher-See-Eruption (vor 11.000a), die hier im Steinbr… · kategorier: Cross-bedding; Pumice; Quaternary volcanism; Steinbruch Mendig; Tuff rock formations in Germany

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `yngre-dryas`: Yngre dryas: istidens sista köldknäpp (10900 f.Kr., Norra halvklotet (markören i Allerød, Danmark, där perioden först beskrevs))

Wikidata: [Q944279](https://www.wikidata.org/wiki/Q944279). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Partin 2015 YD global map.jpg](https://commons.wikimedia.org/wiki/File:Partin_2015_YD_global_map.jpg) | wikidata-P18 | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | Partin et al. | – / 2024-06-02 10:26:45 | 582 × 636 | karta, datum-osakert, smal, staende |
- Nr 1: beskrivning: This graphic shows the temperature and w:precipitation changes across parts of the globe during the w:Younger Dryas period. It has been modified from the original file by stacking the two halves vertically instead of ho… · kategorier: English-language maps of the world; Younger Dryas

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `natet-fran-antrea`: Nätet från Antrea (8540 f.Kr., Korpilahti i Antrea på Karelska näset, i dag Kamennogorsk i Ryssland; punkten är Kamennogorsk)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:AntreaNet.jpg](https://commons.wikimedia.org/wiki/File:AntreaNet.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Sakari Pälsi | 1920 / 2010-03-19 14:49:23 | 1227 × 1909 | staende, ur-sokning |
| 2 | [File:Antrean verkon kaivaus Sakari Pälsin kuvaamana 1914.jpg](https://commons.wikimedia.org/wiki/File:Antrean_verkon_kaivaus_Sakari_P%C3%A4lsin_kuvaamana_1914.jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | Sakari Pälsi | 30 July 1914 date QS:P571,+1914-07-30T00:00:00Z/11 / 2023-11-24 01:19:19 | 863 × 1200 | staende, ur-sokning |
| 3 | [File:Joint Operational Access Exercise 16-5 160205-F-NA975-206.jpg](https://commons.wikimedia.org/wiki/File:Joint_Operational_Access_Exercise_16-5_160205-F-NA975-206.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Staff Sgt. Marianique Santos | Taken on 5 February 2016 / 2017-04-16 18:48:33 | 3674 × 2761 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Some of the remains of the Paleolithic Antrea net. · kategorier: Archaeology in Finland; Neolithic fishing nets
- Nr 2: beskrivning: Photography from the excavations of the Antrea Net in 1914 by Sakari Pälsi. · kategorier: Archeological Picture Collection; Fishing nets in Finland; History of Finland; Neolithic artefacts from Finland; Photographs by Sakari Pälsi
- Nr 3: beskrivning: U.S. Army Staff Sgt. Lee Antreas, battalion air NCOIC with the 407th Brigade Support Battalion, 2nd Brigade Combat Team, 82nd Airborne Division, uses an anemometer to measure wind speed before a container deliver system… · kategorier: 2016 in Fort Bragg (North Carolina); 2nd Brigade Combat Team, 82nd Airborne Division; 82nd Airborne Division; Joint Operational Access Exercise 16-05

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `nevali-cori-kultbyggnad`: Kultbyggnaden i Nevalı Çori (8400 f.Kr., Nevalı Çori vid Eufrat, Şanlıurfaprovinsen, Turkiet (i dag under vatten))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Urfa museum Nevalı Çori Temple in 2025 1225.jpg](https://commons.wikimedia.org/wiki/File:Urfa_museum_Neval%C4%B1_%C3%87ori_Temple_in_2025_1225.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Dosseman | 2025-10-27 14:07:53 / 2025-11-22 09:40:13 | 8256 × 5504 | nutida-foto, ur-sokning |
| 2 | [File:Urfa museum Nevalı Çori Temple in 2025 1227.jpg](https://commons.wikimedia.org/wiki/File:Urfa_museum_Neval%C4%B1_%C3%87ori_Temple_in_2025_1227.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Dosseman | 2025-10-27 14:08:35 / 2025-11-22 09:40:14 | 8256 × 5504 | nutida-foto, ur-sokning |
| 3 | [File:Urfa museum Nevalı Çori Temple in 2025 1226.jpg](https://commons.wikimedia.org/wiki/File:Urfa_museum_Neval%C4%B1_%C3%87ori_Temple_in_2025_1226.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Dosseman | 2025-10-27 14:08:15 / 2025-11-22 09:40:13 | 8256 × 5504 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: A Turkish text has, translated "The temple, also called the Obelisk Building, is the only structure with a square plan among the 29 structures unearthed in the excavations and is 14x14 meters in size. This temple is sig… · kategorier: Temple from Nevalı Çori
- Nr 2: beskrivning: A Turkish text has, translated "The temple, also called the Obelisk Building, is the only structure with a square plan among the 29 structures unearthed in the excavations and is 14x14 meters in size. This temple is sig… · kategorier: Temple from Nevalı Çori
- Nr 3: beskrivning: A Turkish text has, translated "The temple, also called the Obelisk Building, is the only structure with a square plan among the 29 structures unearthed in the excavations and is 14x14 meters in size. This temple is sig… · kategorier: Temple from Nevalı Çori

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `doggerland-drankes`: Doggerland dränks (8000 f.Kr., Doggerland, i dag södra Nordsjön (markören på Doggers bank))

Wikidata: [Q1138308](https://www.wikidata.org/wiki/Q1138308). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Doggerland.svg](https://commons.wikimedia.org/wiki/File:Doggerland.svg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: flagga CC BY-SA 3.0 – API:et säger "CC BY-SA 3.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Max Naylor | 2008-02-22 / 2014-10-19 18:59:31 | 545 × 600 | karta, nutida-foto, smal, staende, licens-flagga |
- Nr 1: beskrivning: A map of the area known as Doggerland which connected the British Isles and the European continent. Loosely based on two images, found at http://www.bevpease.force9.co.uk/p.Flood_files/image002.jpg and http://humanities… · kategorier: Doggerland; Geological maps of the United Kingdom; Greenlandian palaeogeography; Maps of European Upper Paleolithic; Maps of the North Sea; Quaternary geology

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `tybrind-vig`: Boplatsen i Tybrind Vig (5400 f.Kr., Tybrind Vig, Lillebältskusten på västra Fyn, Danmark)

Wikidata: [Q1454480](https://www.wikidata.org/wiki/Q1454480). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Tybrind Vig bow tips.jpg](https://commons.wikimedia.org/wiki/File:Tybrind_Vig_bow_tips.jpg) | commons-sok | CC BY 3.0 (trolig); filsidan: godkand CC BY 3.0 | XXLRay | 2012-08-20 / 2012-08-20 11:21:49 | 2560 × 1920 | nutida-foto, ur-sokning |
| 2 | [File:Tybrind Vig Bow Tips Dark Background.jpg](https://commons.wikimedia.org/wiki/File:Tybrind_Vig_Bow_Tips_Dark_Background.jpg) | commons-sok | CC BY 3.0 (trolig); filsidan: godkand CC BY 3.0 | XXLRay | 2012-08-29 / 2012-08-29 15:03:59 | 2560 × 1920 | nutida-foto, ur-sokning |
| 3 | [File:Needle-netting technique.png](https://commons.wikimedia.org/wiki/File:Needle-netting_technique.png) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Stilfehler | 2024-08-23 / 2024-08-23 21:52:16 | 1200 × 1000 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Tips of a Tybrind Vig style bow · kategorier: Archaeological objects of Denmark; Bows (archery); Middlestone; Tybrind Vig
- Nr 2: beskrivning: Tips of a Tybrind Vig style bow · kategorier: Archaeological objects of Denmark; Bows (archery); Middlestone; Tybrind Vig
- Nr 3: beskrivning: A stone-age textile technique, found in textiles excavated in Tybrind vig, Denmark. · kategorier: Simple nålebinding

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `gravfaltet-i-naltjik`: Gravfältet i Naltjik (4930 f.Kr., Naltjik i Kabardinien-Balkarien, Ryssland (norra Kaukasus))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:NalchikJewishCemetery.jpg](https://commons.wikimedia.org/wiki/File:NalchikJewishCemetery.jpg) | commons-sok | CC BY 3.0 (trolig); filsidan: godkand CC BY 3.0 | Shaul | 1993 / 2025-07-16 17:06:40 | 800 × 600 | nutida-foto, konstverk, ur-sokning |
- Nr 1: beskrivning: Jewish Cemetery in Nalchik · kategorier: 1993 in Russia; Cemeteries in Kabardino-Balkaria; Jewish cemeteries in Russia; Monuments and memorials in Nalchik; Mountain Jews

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `varna-gravfaltet`: Guldet i Varnagravfältet (4569 f.Kr., Varna, Bulgarien)

Wikidata: [Q946052](https://www.wikidata.org/wiki/Q946052). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Or de Varna - Nécropole.jpg](https://commons.wikimedia.org/wiki/File:Or_de_Varna_-_N%C3%A9cropole.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – flera licenser: CC BY-SA 3.0, CC BY-SA 2.5; GFDL anges också (dubbellicens) | Yelkrokoyade | 2007-07-21 / 2026-01-29 23:30:40 | 1746 × 2592 | nutida-foto, staende |
- Nr 1: beskrivning: A tomb from the Varna necropolis (Bulgaria), circa 4600 BC, with the world's oldest gold jewellery yet discovered. · kategorier: Burial with skeleton and golden treasure (Varna Museum)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `flintgruvorna-i-spiennes`: Flintgruvorna i Spiennes (4300 f.Kr., Spiennes sydost om Mons, Belgien)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Neolithic Flint Mines at Spiennes 2.jpg](https://commons.wikimedia.org/wiki/File:Neolithic_Flint_Mines_at_Spiennes_2.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Thilo Parg | 2015-05-27 / 2015-08-18 14:12:05 | 3000 × 1688 | nutida-foto, ur-sokning |
| 2 | [File:Neolithic Flint Mines at Spiennes 1.jpg](https://commons.wikimedia.org/wiki/File:Neolithic_Flint_Mines_at_Spiennes_1.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Thilo Parg | 2015-05-27 / 2015-08-18 14:11:05 | 3000 × 1688 | nutida-foto, ur-sokning |
| 3 | [File:Neolithic Flint Mines at Spiennes 3.jpg](https://commons.wikimedia.org/wiki/File:Neolithic_Flint_Mines_at_Spiennes_3.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Thilo Parg | 2015-05-27 / 2015-08-18 14:13:35 | 3000 × 2000 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Neolithic Flint Mines at Spiennes · kategorier: Neolithic flint mines of Spiennes
- Nr 2: beskrivning: Neolithic Flint Mines at Spiennes · kategorier: Neolithic flint mines of Spiennes
- Nr 3: beskrivning: Neolithic Flint Mines at Spiennes · kategorier: Neolithic flint mines of Spiennes

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `hallristningarna-i-alta`: Hällristningarna i Alta (4200 f.Kr., Alta, Finnmark, Norge)

Wikidata: [Q433634](https://www.wikidata.org/wiki/Q433634). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Alta-Carvings-2012-07-17-12-15-018.jpg](https://commons.wikimedia.org/wiki/File:Alta-Carvings-2012-07-17-12-15-018.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Karl Brodowsky | 2012-07-17 / 2013-01-20 22:04:54 | 1024 × 1536 | nutida-foto, staende |
- Nr 1: beskrivning: Rock carvings near Alta (Norway) · kategorier: Rock art of Alta

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `hallmalningarna-i-astuvansalmi`: Hällmålningarna i Astuvansalmi (4000 f.Kr., Astuvansalmi vid sjön Yövesi i Saimen, Ristiina, Sankt Michel, Finland)

Wikidata: [Q43967](https://www.wikidata.org/wiki/Q43967). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Astuvansalmen kalliolippa.jpg](https://commons.wikimedia.org/wiki/File:Astuvansalmen_kalliolippa.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Ohto Kokko | – / 2006-01-19 08:24:59 | 768 × 1024 | datum-osakert, smal, staende |
- Nr 1: beskrivning: Astuvansalmi prehistoric rock paintings in Ristiina, Finland · kategorier: Astuvansalmi rock paintings

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `stenyxorna-fran-langdale`: Stenyxorna från Langdale (4000 f.Kr., Great Langdale i Lake District, England)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `grotta`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Neolithic polished stone axe fragment, Langdale stone (FindID 430451).jpg](https://commons.wikimedia.org/wiki/File:Neolithic_polished_stone_axe_fragment,_Langdale_stone_(FindID_430451).jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Derby Museums Trust, Rachel Atherton, 2011-03-08 12:34:54 | between 3500 BC and 2100 BC / 2017-02-05 18:56:04 | 3689 × 2223 | ur-sokning |
| 2 | [File:Neolithic Great Langdale Polished Stone Axehead (FindID 192567).jpg](https://commons.wikimedia.org/wiki/File:Neolithic_Great_Langdale_Polished_Stone_Axehead_(FindID_192567).jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | North Lincolnshire Museum, Lisa Staves, 2007-09-07 12:22:02 | between 3500 BC and 2100 BC / 2017-02-04 23:23:17 | 1500 × 909 | ur-sokning |
| 3 | [File:Neolithic axe, Langdale polished axe (FindID 767612).jpg](https://commons.wikimedia.org/wiki/File:Neolithic_axe,_Langdale_polished_axe_(FindID_767612).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Oxfordshire County Council, Anni Byard, 2016-02-12 13:51:05 | between 4000 BC and 2351 BC / 2020-11-01 00:33:19 | 4231 × 3023 | ur-sokning |
- Nr 1: beskrivning: Neolithic polished stone axehead fragment. From towards the butt end, but both ends broken and large flake broken off one surface (ancient damage). Longitudinal striations on middle of both surfaces, and diagonal striat… · kategorier: Neolithic artefacts in the Portable Antiquities Scheme; Portable Antiquities Scheme; Portable Antiquities Scheme, DENO
- Nr 2: beskrivning: An incomplete Neolithic polished stone axehead. The green coloured axe is sub-triangular in plan and pointed oval in cross section. The axe tapers in thickness to the cutting edge, which is still very sharp. The tip of… · kategorier: Neolithic artefacts in the Portable Antiquities Scheme; Portable Antiquities Scheme; Portable Antiquities Scheme, NLM
- Nr 3: beskrivning: A damaged and incomplete stone axe of Neolithic date, probably a Group VI Langdale axe. The stone axe has been polished and is grey-green in colour. The axe is made from a fine-grained siliceous tuff, a sedimentary volc… · kategorier: Photographs by Anni Byard; Portable Antiquities Scheme; Portable Antiquities Scheme, BERK

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `ranis-zlaty-kun`: Homo sapiens i Ranis och Zlatý kůň (47591 f.Kr.)
- `kampanska-ignimbriten`: Jätteutbrottet i Campi Flegrei (37756 f.Kr.)
- `tandingreppet-i-villabruna`: Ett ingrepp mot karies i Villabruna (12211 f.Kr.)
- `baltiska-issjon-tappas-ut`: Baltiska issjön töms vid Billingen (9671 f.Kr.)
- `ladoga-blir-en-egen-sjo`: Ladoga skiljs från Ancylussjön (6851 f.Kr.)
- `bar-och-fisk-i-zamostje`: Bär kokade med fisk i Zamostje (5700 f.Kr.)
- `rodockragraven-i-manjarv`: Rödockragraven i Manjärv (5200 f.Kr.)
- `koppargruvan-i-rudna-glava`: Koppargruvan i Rudna Glava (5000 f.Kr.)
- `hepatit-b-i-sachtysj`: Hepatit B bland jägarfolket i Sachtysj (4851 f.Kr.)
- `kamkeramikernas-byteshandel`: Kamkeramikernas byteshandel (4200 f.Kr.)
- `variscitgruvorna-i-gava`: Variscitgruvorna i Gavà (4200 f.Kr.)
- `saimen-bryter-igenom-salpausselka`: Saimen bryter igenom Salpausselkä (4051 f.Kr.)
- `trypillias-jatteboplatser`: Trypilliakulturens jätteboplatser (4000 f.Kr.)

## Val 2026-11-26 (#2074 och #2076)

11 av 40 händelser fick bild. Filsidorna kontrollerades via verktygets licenskontroll (`action=raw`) och bilderna granskades visuellt i en kontaktbild. Förhistoria (före 3000 f.Kr.): riktiga fynd och platser, inga ansiktsrekonstruktioner (beslut 2026-11-14); `forhistoriker` bör granska.

- Avvisat efter att bilden setts: `varna-gravfaltet` (rekonstruerad grav med skelett), `tybrind-vig` (bearbetad bild), `pessekanoten` (kanoten knappt synlig).
- Avstått på grund av kvarlevor och gravar: `tandingreppet-i-villabruna`, `barumkvinnan`, `rodockragraven-i-manjarv`, `hepatit-b-i-sachtysj`, `varna-gravfaltet`.
- Repliker och museiföremål är märkta i bildtexten (Chauvet: replik från museet Anthropos i Brno; Lejonmänniskan, obsidian, yxfragment, Sesklo: museiföremål).
- Händelserna `apidima`, `lejonmanniskan`, `chauvetgrottan`, `lascaux`, `pessekanoten`, `sesklo`, `catalhoyuk`, `akermyrapaddeln`, `barumkvinnan`, `storeggaskredet`, `ilumetsakratrarna`, `lillberget`, `majkopkurganen` och `ggantija` saknades i den automatiska listan (de har `start` i stället för `year`); `lejonmanniskan`, `chauvetgrottan`, `sesklo`, `catalhoyuk` och `pessekanoten` söktes manuellt.
- Egen sökning: `lejonmanniskan`, `chauvetgrottan`, `sesklo`, `catalhoyuk`, `pessekanoten`, `lascaux`, `ggantija`, `ilumetsakratrarna`.
