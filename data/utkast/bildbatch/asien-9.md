# Granskningslista för bildomgång asien-9

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=32 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 32. **Med minst en användbar kandidat:** 26. **Utan kandidat:** 6.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `asien-9-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/asien-9-lista.txt`.

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

## 1. `iraks-invasion-av-iran`: Irak invaderar Iran (1980, Västra Iran, främst provinsen Khuzestan, längs gränsen mot Irak)

Wikidata: [Q5941438](https://www.wikidata.org/wiki/Q5941438). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Battle of khorramshahr 4.jpg](https://commons.wikimedia.org/wiki/File:Battle_of_khorramshahr_4.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Kazem Akhavan | September or November 1980 / 2023-05-25 14:27:14 | 1080 × 725 | – |
- Nr 1: beskrivning: Iranian soldiers fighting in the Battle of Khorramshahr . · kategorier: AKM in Iranian service; Battle of Khorramshahr; Casualty movement; Graffiti in Iran; Graffiti in the 1980s; Military men wearing boots

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `iran-irak-kriget`: Kriget mellan Iran och Irak (1980, Iran, Irak och Persiska viken (började med Iraks invasion av västra Iran, bland annat Khuzestan))

Wikidata: [Q82664](https://www.wikidata.org/wiki/Q82664). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Iran-Iraq War Montage.png](https://commons.wikimedia.org/wiki/File:Iran-Iraq_War_Montage.png) | wikidata-P18 | Public domain (trolig); filsidan: godkand-med-not Public domain – flera licenser: CC BY-SA 3.0, Public domain; GFDL anges också (dubbellicens) | Uploader was gIre_3piCH2005 at fa.wikipedia | 2009-12-22 / 2009-12-22 19:31:12 | 380 × 500 | smal, staende |
- Nr 1: beskrivning: Montage of Iran-Iraq War · kategorier: Iran-Iraq War; Montages of Iran; Montages of Iraq; Montages of war

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `operation-ramadan`: Iran går in i Irak: Operation Ramadan (1982, Nordost om Basra, södra Irak)

Wikidata: [Q919834](https://www.wikidata.org/wiki/Q919834). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Basra location.PNG](https://commons.wikimedia.org/wiki/File:Basra_location.PNG) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | – / 2018-01-24 00:41:04 | 328 × 351 | karta, smal, staende |
- Nr 1: kategorier: CIA World Factbook maps of Iraq; Maps of Basra

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `svalten-i-etiopien-1983-1985`: Svälten i Etiopien (1983, Norra Etiopien, främst Tigray, Wollo och Eritrea)

Wikidata: [Q1637896](https://www.wikidata.org/wiki/Q1637896). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Opbushel.jpg](https://commons.wikimedia.org/wiki/File:Opbushel.jpg) | wikidata-P18 | CC BY 3.0 (trolig); filsidan: flagga CC BY 3.0 – API:et säger "CC BY 3.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Talskiddy at English Wikipedia | 3 November 2007 (original upload date) / 2009-10-08 23:56:03 | 500 × 336 | smal, licens-flagga |
- Nr 1: beskrivning: Photo i took whilst serving with 47 Air Despatch Squadron RCT in Ethiopia in 1985. Talskiddy 19:46, 3 November 2007 (UTC) · kategorier: 1983–1985 famine in Ethiopia; Airdropping from Lockheed C-130 Hercules; Humanitarian operations; XV300 (aircraft)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `forsta-slaget-om-al-faw`: Första slaget om al-Faw (1986, Halvön al-Faw vid Shatt al-Arabs mynning, Irak)

Wikidata: [Q83002](https://www.wikidata.org/wiki/Q83002). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Al-faw.jpg](https://commons.wikimedia.org/wiki/File:Al-faw.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | UNEP / ChrisO ( talk ) ( Uploads ) | – / 2013-07-24 00:11:33 | 495 × 381 | smal |
- Nr 1: beskrivning: Al-Faw peninsula , Iraq - · kategorier: Al-Faw; Battle of Al Faw (2003); Peninsulas of Iraq

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `halabja-1988`: Gasattacken mot Halabja (1988, Halabja, irakiska Kurdistan)

Wikidata: [Q579179](https://www.wikidata.org/wiki/Q579179). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Family Graves for Victims of 1988 Chemical Attack - Halabja - Kurdistan - Iraq.jpg](https://commons.wikimedia.org/wiki/File:Family_Graves_for_Victims_of_1988_Chemical_Attack_-_Halabja_-_Kurdistan_-_Iraq.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Adam Jones, Ph.D. | 2011-04-20 00:53:22 / 2012-10-19 11:57:55 | 3456 × 2304 | – |
- Nr 1: beskrivning: Family Graves for Victims of 1988 Chemical Attack - Halabja - Kurdistan - Iraq · kategorier: Family graves of Halabja chemical attack victims; Graves in Iraq

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `vapenvilan-iran-irak-1988`: Vapenvila enligt FN:s resolution 598 (1988, Gränsen mellan Iran och Irak (resolutionen antogs i FN:s säkerhetsråd i New York))

Wikidata: [Q2359436](https://www.wikidata.org/wiki/Q2359436). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Iran-Iraq war-gallery.png](https://commons.wikimedia.org/wiki/File:Iran-Iraq_war-gallery.png) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand-med-not CC BY-SA 4.0 – flera licenser: CC BY-SA 3.0, CC BY-SA 4.0; GFDL anges också (dubbellicens) | Unknown author Unknown author | 2015-08-05 / 2017-05-29 08:06:23 | 572 × 642 | smal, staende |
- Nr 1: beskrivning: Child soldiers on Iranian front (top left); Iranian soldier wearing a gas mask (top right); Port quarter view of USS Stark listing to port after being mistakenly struck by an Iraqi warplane (middle left); PMOI forces ki… · kategorier: Iran-Iraq War; Montages of war

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `himmelska-fridens-torg-1989`: Protesterna och massakern på Himmelska fridens torg (1989, Himmelska fridens torg, Peking, Kina)

Wikidata: [Q99717](https://www.wikidata.org/wiki/Q99717). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:蒲志強19890510.jpg](https://commons.wikimedia.org/wiki/File:%E8%92%B2%E5%BF%97%E5%BC%B719890510.jpg) | wikidata-P18 | CC BY 2.5 (trolig); filsidan: godkand CC BY 2.5 | 蔡淑芳@sfchoi8964 | 1989-05-10 / 2013-08-15 06:16:32 | 550 × 749 | smal, staende |
- Nr 1: beskrivning: ​1989年5月10日浦志强在北京游行争取言论自由。（圖中為浦志强1989年5月10日在北京游行时所拍摄。） 來源： http://img.ly/Zr1 攝影師：蔡淑芳@sfchoi8964 版權持有: 蔡淑芳@sfchoi8964/Getty Images （1989年5月10日） 版权声明： https://twitter.com/sfchoi8964/status/18489368276 · kategorier: Banners and signs at demonstrations and protests in China; Chinese-language signage at demonstrations; Demonstrations and protests by students in 1989; Demonstrations and protests by students in China; May 1989 China ph…

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `irak-invaderar-kuwait`: Irak invaderar Kuwait (1990, Kuwait City och hela Kuwait)

Wikidata: [Q856650](https://www.wikidata.org/wiki/Q856650). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:An abandoned Iraqi Type 69 tank on the road into Kuwait City during the Gulf War.JPEG](https://commons.wikimedia.org/wiki/File:An_abandoned_Iraqi_Type_69_tank_on_the_road_into_Kuwait_City_during_the_Gulf_War.JPEG) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | J.R. Roark, US Marines | 1991-02-24 / 2010-04-11 15:48:20 | 2790 × 1850 | – |
- Nr 1: beskrivning: An abandoned Iraqi Type 69 main battle tank sits on the side on the road into Kuwait City during the ground phase of Operation Desert Storm. · kategorier: Iraqi Type 69 tanks during the Gulf War (1990–1991)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `luftkriget-mot-irak-1991`: Koalitionen inleder luftkriget (1991, Irak och Kuwait, bland annat Bagdad)

Wikidata: [Q8256467](https://www.wikidata.org/wiki/Q8256467). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:USAF F-16A F-15C F-15E Desert Storm edit2.jpg](https://commons.wikimedia.org/wiki/File:USAF_F-16A_F-15C_F-15E_Desert_Storm_edit2.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | US Air Force | – / 2007-12-05 01:17:43 | 2000 × 1274 | – |
- Nr 1: beskrivning: USAF aircraft of the 4th Fighter Wing ( F-16 , F-15C and F-15E ) fly over Kuwaiti oil fires, set by the retreating Iraqi army during Operation Desert Storm in 1991. Almost the same as Image:USAF F-16A F-15C F-15E Desert… · kategorier: Aircraft formation flight of F-16A/B Fighting Falcon (United States Air Force); F-15C/D Eagle in flight; F-15E Strike Eagle in flight; Kuwaiti oil fires; Mixed aircraft formation flight; United States Air Force in the G…

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `slaget-vid-73-easting`: Slaget vid 73 Easting (1991, Öknen i sydöstra Irak, väster om Kuwait)

Wikidata: [Q1402530](https://www.wikidata.org/wiki/Q1402530). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Type 69 Operation Desert Storm.jpg](https://commons.wikimedia.org/wiki/File:Type_69_Operation_Desert_Storm.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Uncertain (possibly Tom Johnson Nottingham, UK) | 1991-02-28 / 2014-12-10 15:30:57 | 2200 × 1272 | – |
- Nr 1: beskrivning: An Iraqi Type 69 main battle tank burns after an attack by the 1st United Kingdom Armored Division during Operation Desert Storm. · kategorier: Burning tanks; Destroyed tanks; Iraqi Type 69 tanks during the Gulf War (1990–1991)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `slaget-vid-khafji`: Slaget vid Khafji (1991, Khafji, östra Saudiarabien)

Wikidata: [Q718770](https://www.wikidata.org/wiki/Q718770). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:RemnantsofLAV25.jpg](https://commons.wikimedia.org/wiki/File:RemnantsofLAV25.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Lt. Col. Charles H. Cureton\ | 1991-01-29 / 2016-03-13 02:58:34 | 1000 × 442 | – |
| 2 | [File:Cleaning up Khafji.jpg](https://commons.wikimedia.org/wiki/File:Cleaning_up_Khafji.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Captain Charles G. Grow | – / 2010-06-02 11:43:36 | 1029 × 702 | – |
- Nr 1: beskrivning: Destroyed LAV-AT by friendly anti-tank missile during the Battle of Khafji . That vehicle was killed by a tow missle fired from another lav-at from its own platoon. They were from 1st lai bn from camp pendleton,CA. They… · kategorier: Battle of Khafji; Coalition forces in the Gulf War (1990–1991); Destroyed armored fighting vehicles; Gulf War; LAV-25; United States Marine Corps in the Gulf War (1990–1991)
- Nr 2: beskrivning: Marines of 3rd Battalion , search for Iraqi stragglers and examine damage following the Battle of Khafji . · kategorier: 3d Bn 3d Mar 1991-2004; Battle of Khafji; United States Marine Corps in art; United States Marine Corps in the Gulf War (1990–1991)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `asienkrisen-1997`: Asienkrisen börjar i Thailand (1997, Thailand)

Wikidata: [Q80880](https://www.wikidata.org/wiki/Q80880). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:PIIGS Mk 4 map.png](https://commons.wikimedia.org/wiki/File:PIIGS_Mk_4_map.png) | commons-sok | CC BY 3.0 (trolig); filsidan: godkand CC BY 3.0 | The original uploader was Snow storm in Eastern Asia at English Wikipedia . | 4 June 2010 (original upload date) / 2015-10-07 23:23:07 | 3180 × 1485 | karta, ur-sokning |
- Nr 1: beskrivning: I modified a copy of the map 'File:Commonwealth games 1998 medal winners.PNG' by Commons user Roke . It replaces my map 'File:PIGS Mk 3 map.png' which became defective would not update, when I uploaded the updated image… · kategorier: 2015 maps of the world; Disasters; Economic crises; Economic maps of the world; Economy in the 2000s; Epidemiology of hunger

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `bamiyan-buddhorna-forstors`: Buddhastatyerna i Bamiyan förstörs (2001, Bamiyandalen, Afghanistan)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:17- Buddha Salsal.jpg](https://commons.wikimedia.org/wiki/File:17-_Buddha_Salsal.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | EFarid | 2020-03-04 19:23:27 / 2021-10-08 04:02:42 | 5184 × 3456 | ur-sokning |
| 2 | [File:Sunrise of Bamyan Valley.jpg](https://commons.wikimedia.org/wiki/File:Sunrise_of_Bamyan_Valley.jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Afghanistan Matters from Brunssum, Netherlands | 2010-03-23 06:53 / 2011-01-08 22:28:39 | 1600 × 1063 | ur-sokning |
| 3 | [File:10- Buddha Salsal.jpg](https://commons.wikimedia.org/wiki/File:10-_Buddha_Salsal.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | EFarid | 2020-03-04 19:12:54 / 2021-10-08 04:02:25 | 5184 × 3456 | ur-sokning |
- Nr 1: beskrivning: At the beginning of the 7th century, Yaqut gave a detailed account of Bamyan and the great idols of Bamyan. One is called Bad Red and the other is called Bad Bad (Red Buddha and Gray Buddha) and is said to have no count… · kategorier: Bamiyan Valley; Buddhas of Bamiyan; Uploaded via Campaign:WHindanger 2021 in Afghanistan
- Nr 2: beskrivning: Bamyan Valley is home to the giant ancient Buddha statues, at least what is left of them after the Taliban destroyed them in 2001. They valley is stunning with a rich history, some of it very prosperous and powerful, ot… · kategorier: Bamiyan Valley caves; Buddhas of Bamiyan
- Nr 3: beskrivning: In 1999, Mullah Omar ordered the protection of Buddhist statues in Bamyan, which were carved into a rock in the Hazarajat valley in the Bamyan Valley in the 6th century AD. But in March 2001, the statues were destroyed… · kategorier: Buddhas of Bamiyan; Uploaded via Campaign:WHindanger 2021 in Afghanistan

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `kriget-i-afghanistan-2001`: Kriget i Afghanistan (2001–2021) (2001, Afghanistan (började med flyganfall mot mål över hela landet))

Wikidata: [Q182865](https://www.wikidata.org/wiki/Q182865). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Collage of the War in Afghanistan (2001-2021).png](https://commons.wikimedia.org/wiki/File:Collage_of_the_War_in_Afghanistan_(2001-2021).png) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Original photographers: see sources Montage work: Weaveravel and OspreyPL | 2021-08-24 / 2021-08-24 12:21:03 | 926 × 920 | staende |
- Nr 1: beskrivning: Collage of the War in Afghanistan (2001–2021) , using 7 photographs, clockwise from top-left, plus central image: A U.S. Air Force F-15E Strike Eagle, from the 336th Expeditionary Fighter Squadron, drops 2,000-pound mun… · kategorier: Montages of the War in Afghanistan (2001–2021)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 16. `slaget-vid-tora-bora`: Slaget vid Tora Bora (2001, Grottkomplexet Tora Bora i bergskedjan Safed Koh, Nangarhar, nära gränsen mot Pakistan)

Wikidata: [Q2237280](https://www.wikidata.org/wiki/Q2237280). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Tora Bora.JPG](https://commons.wikimedia.org/wiki/File:Tora_Bora.JPG) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: flagga CC BY-SA 3.0 – API:et säger "CC BY-SA 3.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | FATA_(8).jpg : Hbtila at en.wikipedia derivative work: Victor falk at en.wikipedia | 15 June 2007 (original upload date) / 2017-09-16 22:37:37 | 450 × 605 | karta, smal, staende, licens-flagga |
- Nr 1: beskrivning: Tora Bora · kategorier: Maps of the War in Afghanistan (2001–2021); Tora Bora

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 17. `operation-anaconda`: Operation Anaconda (2002, Shah-i-Kotdalen, provinsen Paktia)

Wikidata: [Q1476042](https://www.wikidata.org/wiki/Q1476042). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:AnacondaAreaOfOperations.jpg](https://commons.wikimedia.org/wiki/File:AnacondaAreaOfOperations.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | U.S. Army | 2006-03-17 / 2008-04-28 14:52:41 | 1354 × 883 | karta |
- Nr 1: beskrivning: Strategic map for U.S. Army operation Anaconda. The area outlined in blue is the Shahi Kowt Valley, about one hundred miles south of Kabul, Afghanistan, near the Pakistani border. · kategorier: Maps of the War in Afghanistan (2001–2021); Operation Anaconda

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 18. `bagdad-faller-2003`: Bagdad faller (2003, Bagdad)

Wikidata: [Q1804983](https://www.wikidata.org/wiki/Q1804983). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Marines in Saddams palace DM-SD-04-12222.jpg](https://commons.wikimedia.org/wiki/File:Marines_in_Saddams_palace_DM-SD-04-12222.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Lance Corporal Kevin C. Quihuis Jr. (USMC)Sgt.Luciano Carlucci (USMC) | 2003-04-09 / 2006-07-23 22:54:15 | 1720 × 1160 | – |
| 2 | [File:SaddamStatue.jpg](https://commons.wikimedia.org/wiki/File:SaddamStatue.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown U.S. military or Department of Defense employee | 2003-04-09 / 2024-02-14 19:03:28 | 1700 × 1072 | konstverk |
- Nr 1: beskrivning: US Marines Corps (USMC) Marines from the 1st Battalion, 7th Marines (1/7), Charlie Company, Twentynine Palms, California (CA), cover each other with 5.56 mm M16A2 assault rifles as they prepare to enter one of Saddam Hu… · kategorier: 1st Battalion 7th Marines in the Iraq War; Al-Baqara 255; Baghdad in the Iraq War; Desert Camouflage Uniform in 2003; Desert MARPAT in 2003; M16 rifle with M203
- Nr 2: beskrivning: Statue of Saddam Hussein being toppled in Firdos Square after the US invasion of Iraq. Found on the US military website. CAPTION: The statue of Saddam Hussein topples in Baghdad's Firdos Square on April 9, 2003. Three y… · kategorier: 17th of Ramadan Mosque; Cult of personality; Firdos Square statue destruction; Iconic photographs; Toppled statues

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 19. `saddam-hussein-tillfangatas`: Saddam Hussein tillfångatas (2003, En gård utanför ad-Dawr, söder om Tikrit)

Wikidata: [Q3780506](https://www.wikidata.org/wiki/Q3780506). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:SaddamSpiderHole.jpg](https://commons.wikimedia.org/wiki/File:SaddamSpiderHole.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 2003-12 / 2007-11-21 09:01:19 | 640 × 480 | smal |
- Nr 1: beskrivning: Iraqi-American, Samir, 34, pinning deposed Iraqi leader Saddam Hussein to the ground during his capture in Tikrit, on Saturday, December 13, 2003. Samir was the translator for the U.S. Special Forces that helped find Hu… · kategorier: 1st Special Forces Operational Detachment-Delta (Airborne); Capture of Saddam Hussein; December 2003 in Iraq; December 2003 photographs; Desert Camouflage Uniform in 2003; Heads of state with military people

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 20. `andra-slaget-om-falluja`: Andra slaget om Falluja (2004, Falluja, provinsen Anbar)

Wikidata: [Q1330136](https://www.wikidata.org/wiki/Q1330136). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Fallujah 2004.JPG](https://commons.wikimedia.org/wiki/File:Fallujah_2004.JPG) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | CPL Joel A. Chaverri, United States Marine Corps | 2004-11-10 / 2012-03-20 22:39:52 | 3000 × 1996 | – |
- Nr 1: beskrivning: A confirmed insurgent stronghold goes up in smoke after a strategic aerial strike during combat operations while US Marine Corps (USMC) Marines, 1st Battalion (BN), 8th Marine Regiment (1/8), search for insurgents and w… · kategorier: 2004 airstrikes; Al Anbar campaign; Battle of Fallujah; Military operations in the Iraq War

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 21. `attentatet-mot-al-askarimosken`: Attentatet mot al-Askarimoskén (2006, Al-Askarimoskén i Samarra)

Wikidata: [Q2918175](https://www.wikidata.org/wiki/Q2918175). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Al Askari Mosque.jpg](https://commons.wikimedia.org/wiki/File:Al_Askari_Mosque.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Toushiro | before 2006 date QS:P,+2006-00-00T00:00:00Z/7,P1326,+2006-00-00T00:00:00Z/9 / 2008-10-13 20:05:49 | 1401 × 989 | – |
- Nr 1: beskrivning: Al Askari Mosque - Shrine of the 10th and 11th Shia Imams: Ali an-Naqi & Hasan al-Askari - Before the bombing in 2006, Samarra, Iraq. · kategorier: Al-Askari Shrine in 2004; Golden dome of Al-Askari Shrine; Narjis

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 22. `baijin-forklaras-funktionellt-utdod`: Jangtsedelfinen baiji förklaras funktionellt utdöd (2006, Jangtsefloden, Kina)

Wikidata: [Q188130](https://www.wikidata.org/wiki/Q188130). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Baiji Dolphin killed by Charles Hoy 1914.jpg](https://commons.wikimedia.org/wiki/File:Baiji_Dolphin_killed_by_Charles_Hoy_1914.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Charles Hoy | 1914-01-01 / 2020-02-22 22:20:15 | 1024 × 614 | – |
| 2 | [File:Chinese Baiji dolphin specimen Qi Qi.jpg](https://commons.wikimedia.org/wiki/File:Chinese_Baiji_dolphin_specimen_Qi_Qi.jpg) | wikidata-P18 | CC BY 3.0 (trolig); filsidan: godkand CC BY 3.0 | Huangdan2060 | 2011-07-27 10:51:06 / 2020-02-23 03:51:46 | 3000 × 2000 | – |
- Nr 1: beskrivning: A Baiji Dolphin ( Lipotes vexillifer ) killed in 1914 by Charles Hoy, a American. · kategorier: Lipotes vexillifer
- Nr 2: beskrivning: Chinese Baiji dolphin specimen Qi Qi in the Institute of Hydrobiology, Chinese Academy of Sciences, on 27 July 2011. · kategorier: Institute of Hydrobiology, Chinese Academy of Sciences; Lipotes vexillifer; Taxidermied Cetacea

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 23. `operation-moshtarak`: Operation Moshtarak i Marjah (2010, Marjah, provinsen Helmand)

Wikidata: [Q843588](https://www.wikidata.org/wiki/Q843588). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:1st Battalion 3rd Marines near Marja.jpg](https://commons.wikimedia.org/wiki/File:1st_Battalion_3rd_Marines_near_Marja.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Sgt. Brian A. Tuthill | Taken on 9 February 2010 / 2010-02-13 07:12:46 | 3786 × 2536 | karta |
- Nr 1: beskrivning: HELMAND PROVINCE, Islamic Republic of Afghanistan – A Marine with Weapons Platoon, Charlie Company, 1st Battalion, 3rd Marine Regiment, sprints down the line of heavy machine guns to deliver a map after a firefight with… · kategorier: 1st Battalion, 3rd Marines in the War in Afghanistan (2001–14); Browning M2 in USMC service; Marjah, Afghanistan; Operation Moshtarak; People with Browning M2

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 24. `sista-amerikanska-trupperna-lamnar-irak`: De sista amerikanska trupperna lämnar Irak (2011, Bagdad och gränsen mellan Irak och Kuwait)

Wikidata: [Q4118977](https://www.wikidata.org/wiki/Q4118977). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Last US convoy crosses into Kuwait.jpg](https://commons.wikimedia.org/wiki/File:Last_US_convoy_crosses_into_Kuwait.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | U.S. Army | 2011-12-18 / 2011-12-20 04:11:25 | 4037 × 2691 | – |
- Nr 1: beskrivning: Kuwaiti soldiers look on as the last U.S. convoy crosses the border into Kuwait from Iraq, Dec. 18, 2011. U.S. Army photo by Cpl. Jordan Johnson. · kategorier: Iraq War; Operation New Dawn

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 25. `sista-amerikanska-trupperna-lamnar-afghanistan`: De sista amerikanska soldaterna lämnar Afghanistan (2021, Flygplatsen i Kabul (Hamid Karzai International Airport))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:First Sting.jpg](https://commons.wikimedia.org/wiki/File:First_Sting.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Stuart Brown | 2008 / 2018-04-30 16:10:33 | 1582 × 1056 | ur-sokning |
| 2 | [File:Last American Soldier leaves Afghanistan.jpg](https://commons.wikimedia.org/wiki/File:Last_American_Soldier_leaves_Afghanistan.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Master Sgt. Alexander Burnett, U.S. Central Command Public Affairs | 2021-08-30 19:48 / 2021-08-31 00:42:14 | 1536 × 1536 | staende, ur-sokning |
| 3 | [File:The last American Soldier to leave Afghanistan.jpg](https://commons.wikimedia.org/wiki/File:The_last_American_Soldier_to_leave_Afghanistan.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Photo by Master Sgt. Alexander Burnett | 2021-08-29 20:00:00 / 2021-09-02 05:43:05 | 1600 × 1600 | staende, ur-sokning |
- Nr 1: beskrivning: First Sting, Oil on Canvas. In 1979, the Soviets invaded Afghanistan to protect its new socialist puppet government. The US along with the vast majority of nations condemned this Soviet attempt to extend its colonial do… · kategorier: Afghan mujahideen; FIM-92 Stinger; Launches of MANPADS; Mil Mi-24 in Soviet service
- Nr 2: beskrivning: Major General Chris Donahue, commander of the U.S. Army 82nd Airborne Division, XVIII Airborne Corps, boards a C-17 cargo plane at the Hamid Karzai International Airport in Kabul, Afghanistan. Maj. Gen. Donahue is the f… · kategorier: Christopher T. Donahue; Iconic photographs; Jumpable Plate Carrier; Male humans walking; Male people with M4 carbine; Male people with helmets
- Nr 3: beskrivning: Paratroopers assigned to the 82nd Airborne Division prepare to board a U.S. Air Force C-17 on August 30th, 2021 at the Hamid Karzai International Airport. Maj. Gen. Donahue was the last American Soldier to leave Afghani… · kategorier: Operation Allies Refuge in Afghanistan

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 26. `talibanerna-intar-kabul-2021`: Talibanerna intar Kabul (2021, Kabul)

Wikidata: [Q108102583](https://www.wikidata.org/wiki/Q108102583). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Crowds in front of Kabul International Airport.jpg](https://commons.wikimedia.org/wiki/File:Crowds_in_front_of_Kabul_International_Airport.jpg) | wikidata-P18 | Public domain (trolig); filsidan: flagga Public domain – API:et säger "Public domain" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | VOA | Taken on 17 August 2021 / 2021-09-01 09:12:30 | 1024 × 768 | licens-flagga |
- Nr 1: beskrivning: On the second day of the Taliban's rule in Kabul, the front of Hamid Karzai International Airport was crowded with people trying to travel abroad, but were stopped by Taliban militants. · kategorier: Fall of Kabul; Kabul International Airport; Operation Allies Refuge in Afghanistan; Taliban militants

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `iranska-revolutionen`: Iranska revolutionen (1978)
- `upproret-vid-panguna`: Upproret vid Panguna börjar (1988)
- `panguna-gruvan-stangs`: Panguna-gruvan stängs (1989)
- `vapenvila-i-gulfkriget`: Vapenvila efter hundra timmar (1991)
- `arawa-aterintas`: Armén återtar Arawa (1993)
- `folkomrostning-om-bougainvilles-sjalvstandighet`: Bougainville röstar för självständighet (2019)

## Val 2026-11-26 (#2072 och #2073)

13 av 38 händelser fick bild. Filsidorna kontrollerades via verktygets licenskontroll (`action=raw`) och bilderna granskades visuellt i en kontaktbild.

- Avvisat efter att filsidan öppnats eller bilden setts: `slaget-vid-73-easting` (bilden hör till en annan strid), `slaget-vid-khafji` (bilden ser konstgjord ut efter konvertering), `irak-invaderar-kuwait` (bilden är från 1991), `talibanerna-intar-kabul-2021` (licensflagga).
- Avstått på grund av gravar och hungersnöd: `halabja-1988`, `svalten-i-etiopien-1983-1985`.
- Händelserna `tankerkriget`, `bougainvillekonflikten`, `gulfkriget`, `sandlineaffaren`, `kyotoprotokollet` och `irakkriget` saknades i den automatiska listan (de har `start` i stället för `year`); `gulfkriget`, `kyotoprotokollet` och `irakkriget` söktes manuellt.
- Egen sökning: `gulfkriget`, `kyotoprotokollet`, `irakkriget`, `tankerkriget`, `iranska-revolutionen`, `bougainvillekonflikten`, `asienkrisen-1997`.
