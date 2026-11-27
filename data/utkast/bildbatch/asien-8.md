# Granskningslista för bildomgång asien-8

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=36 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 36. **Med minst en användbar kandidat:** 31. **Utan kandidat:** 5.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `asien-8-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/asien-8-lista.txt`.

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

## 1. `nordkoreas-anfall-1950`: Nordkorea anfaller Sydkorea (1950, Längs 38:e breddgraden, Sydkorea)

Wikidata: [Q4260079](https://www.wikidata.org/wiki/Q4260079). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Korean War, train attack.jpg](https://commons.wikimedia.org/wiki/File:Korean_War,_train_attack.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | U.S. Army Military History Institute | 1950 / 2018-05-03 18:07:50 | 1367 × 1052 | ur-sokning |
| 2 | [File:People's Volunteer Army warship attacks enemies on a western Korean island, c. 1951.jpg](https://commons.wikimedia.org/wiki/File:People%27s_Volunteer_Army_warship_attacks_enemies_on_a_western_Korean_island,_c._1951.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | circa 1951 date QS:P,+1951-00-00T00:00:00Z/9,P1480,Q5727902 / 2023-10-26 20:17:01 | 1355 × 888 | ur-sokning |
| 3 | [File:U S Marines and Sailors conduct force on force exercise in South Korea (8964487).jpg](https://commons.wikimedia.org/wiki/File:U_S_Marines_and_Sailors_conduct_force_on_force_exercise_in_South_Korea_(8964487).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | U.S. Marine Corps photo by Cpl. Brian Long | Taken on 4 April 2025 / 2026-08-18 03:15:41 | 5184 × 3456 | ur-sokning |
- Nr 1: beskrivning: While trains were used to transport U.S. Soldiers and their equipment during the Korean War, trains in North Korea were targets of attack by U.S. and other U.N. forces. Here, U.S. forces target rail cars south of Wonsan… · kategorier: Attacks on rail transport; Damaged rail transport infrastructure; Explosions; Korean War in 1950; Rail transport in North Korea; Wonsan during Korean War
- Nr 2: beskrivning: People's Volunteer Army warship attacks enemies on a western Korean island, c. 1951 · kategorier: 1951 in North Korea; Korean War in 1951; People's Volunteer Army
- Nr 3: beskrivning: U.S. Marines and Sailors, with Marine Wing Support Squadron (MWSS) 171, Marine Aircraft Group 12, 1st Marine Aircraft Wing, buddy rush towards a stopped convoy at Dagmar North Live Fire Complex, South Korea, April 4, 20… · kategorier: 1st Marine Aircraft Wing; Milimedia files, South Korea (review needed)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `slaget-om-pusanperimetern`: Slaget om Pusanperimetern (1950, Pusanperimetern runt hamnstaden Pusan (Busan), sydöstra Sydkorea)

Wikidata: [Q482979](https://www.wikidata.org/wiki/Q482979). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:27th Infantry Regiment soldiers at the Pusan Perimeter, September 4, 1950.jpg](https://commons.wikimedia.org/wiki/File:27th_Infantry_Regiment_soldiers_at_the_Pusan_Perimeter,_September_4,_1950.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Pfc. Thomas Nebbia | 1950 date QS:P571,+1950-00-00T00:00:00Z/9 / 2010-12-26 01:18:30 | 800 × 625 | – |
- Nr 1: beskrivning: SC347752 - KOREAN CONFLICT Pfc. Robert Smith of Springfield, Colo., (left) and Pvt. Carl Fisher of Ponca, Okla., 27th Infantry Regiment, dug in and firing at Communist-led North Korean positions. 4 September 1950. Korea… · kategorier: 27th Infantry Regiment (United States) in the Korean War; Battle of Pusan Perimeter

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `slaget-vid-onjong`: Kina går in i kriget: slaget vid Onjong (1950, Trakten kring Onjong, Nordkorea)

Wikidata: [Q4871945](https://www.wikidata.org/wiki/Q4871945). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Map Chinese intervention.jpg](https://commons.wikimedia.org/wiki/File:Map_Chinese_intervention.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | F.Temple | 1992 / 2022-07-11 17:41:22 | 6600 × 5100 | karta |
- Nr 1: beskrivning: Map of Chinese intervention in the west between October 25 to November 1, 1950 · kategorier: Battle of the Ch'ongch'on River; Maps of battles and operations of the Korean War

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `tredje-slaget-om-seoul`: Tredje slaget om Seoul (1950, Seoul och fronten norr om staden, Sydkorea)

Wikidata: [Q493922](https://www.wikidata.org/wiki/Q493922). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:UK 29th Brigade Prisoner.jpg](https://commons.wikimedia.org/wiki/File:UK_29th_Brigade_Prisoner.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | PLA Daily | 1951 / 2015-02-13 11:08:40 | 450 × 313 | smal |
- Nr 1: beskrivning: Prisoners from the British 29th Infantry Brigade captured during the Third Battle of Seoul · kategorier: 1951 photographs of South Korea; 29th Infantry Brigade (United Kingdom); Third Battle of Seoul

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `mount-lamingtons-utbrott`: Mount Lamingtons utbrott (1951, Mount Lamington, Oroprovinsen (Papua Nya Guinea))

Wikidata: [Q110664553](https://www.wikidata.org/wiki/Q110664553). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Mount Lamington 1951 eruption column.jpg](https://commons.wikimedia.org/wiki/File:Mount_Lamington_1951_eruption_column.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Capt. Jacobson (published in Taylor, Tony (1958). The 1951 eruption of Mount Lamington, Papua . Bureau of Mineral Resources, Geology and Geophysics, Department of National Development) | 1951 / 2022-12-25 14:49:45 | 1024 × 644 | ur-sokning |
| 2 | [File:Mount Lamington devastation.jpg](https://commons.wikimedia.org/wiki/File:Mount_Lamington_devastation.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Bert Speer | 1951 / 2025-01-21 06:10:35 | 1000 × 695 | ur-sokning |
| 3 | [File:Mount Lamington February 1951.jpg](https://commons.wikimedia.org/wiki/File:Mount_Lamington_February_1951.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Tony Taylor, Australia Bureau of Mineral Resources | 1951-02-05 / 2022-12-26 00:28:02 | 1024 × 700 | ur-sokning |
- Nr 1: beskrivning: Mount Lamington eruption column photographed on 13 January 1951 · kategorier: Eruption columns in 1951; Eruption columns in Papua New Guinea; Historical photographs of Mount Lamington; Mount Lamington eruptions in 1951; VEI-4 eruptions
- Nr 2: beskrivning: A jeep up a tree. The result of the 1951 eruption of Mount Lamington in Papua New Guinea. · kategorier: 1951 in Papua New Guinea; Damage after Mount Lamington 1951 eruptions; Destroyed vehicles; Jeep vehicles; Oro Province
- Nr 3: beskrivning: The devastated landscape surrounding Mount Lamington photographed in February 1951 · kategorier: Historical photographs of Mount Lamington; Mount Lamington eruptions in 1951

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `everest-bestigs-1953`: Tenzing Norgay och Edmund Hillary når toppen av Mount Everest (1953, Mount Everest, på gränsen mellan Nepal och Kina)

Wikidata: [Q4567715](https://www.wikidata.org/wiki/Q4567715). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Everest kalapatthar.jpg](https://commons.wikimedia.org/wiki/File:Everest_kalapatthar.jpg) | wikidata-P18 | CC BY-SA 2.5 (trolig); filsidan: godkand CC BY-SA 2.5 | Pavel Novak | 2005 / 2013-08-05 04:09:53 | 2304 × 3456 | staende |
- Nr 1: beskrivning: Mount Everest from Kala Patthar. · kategorier: Khumbu Glacier; Views of Mount Everest from Kala Patthar

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `vapenstilleståndet-i-korea`: Vapenstilleståndet i Korea (1953, Panmunjom, vid gränsen mellan Nord- och Sydkorea)

Wikidata: [Q2862267](https://www.wikidata.org/wiki/Q2862267). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Korean Armistice Agreement in Chinese (1953).jpg](https://commons.wikimedia.org/wiki/File:Korean_Armistice_Agreement_in_Chinese_(1953).jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | United States Department of State | 1953-07-27 / 2021-05-25 01:21:08 | 3146 × 4283 | staende |
| 2 | [File:Korean Armistice Ko-Text 1953.jpg](https://commons.wikimedia.org/wiki/File:Korean_Armistice_Ko-Text_1953.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1953-07-27 / 2013-06-30 04:37:23 | 550 × 680 | smal, staende |
| 3 | [File:Korean Armistice Zh-Text 1953.jpg](https://commons.wikimedia.org/wiki/File:Korean_Armistice_Zh-Text_1953.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1953-07-27 / 2013-06-30 04:37:21 | 436 × 650 | smal, staende |
- Nr 1: beskrivning: ​1953年《聯合國軍總司令一方與朝鮮人民軍最高司令官及中國人民志願軍司令員另一方關於韓國軍事停戰的協定》的簽名頁。南日和威廉·凱利·海立勝的簽名在下一頁。 · kategorier: 1953 documents; Documents related to Kim Il-sung; Korean Armistice Agreement; Mark Wayne Clark; Signatures of Peng Dehuai
- Nr 2: beskrivning: Korean Text of Korean Armistice Agreement · kategorier: Korean Armistice Agreement; Korean typography
- Nr 3: beskrivning: Chinese Text of Korean Armistice Agreement · kategorier: Korean Armistice Agreement

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `stora-spranget`: Stora språnget (1958, Kina (markören i Peking))

Wikidata: [Q58715](https://www.wikidata.org/wiki/Q58715). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:People's commone canteen3.jpg](https://commons.wikimedia.org/wiki/File:People%27s_commone_canteen3.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1958 / 2011-01-17 10:45:20 | 400 × 416 | smal, staende |
- Nr 1: beskrivning: Canteen where people could eat for free in 1958. · kategorier: People's commune

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `aralsjon-borjar-krympa`: Aralsjön börjar krympa (1960, Aralsjön, mellan Kazakstan och Uzbekistan (då Sovjetunionen))

Wikidata: [Q35883](https://www.wikidata.org/wiki/Q35883). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Aral Sea 1989-2008.jpg](https://commons.wikimedia.org/wiki/File:Aral_Sea_1989-2008.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | NASA, derivative work by Zafiroblue05 at en.wikipedia | between July and September 5 October 2008 / 2011-12-19 12:41:06 | 1471 × 1250 | – |
- Nr 1: beskrivning: Comparison of Aral Sea between 1989 and 2008 · kategorier: 1989 satellite pictures; 2008 MODIS images; Before-and-after photographs of natural disasters; Landsat images; Satellite pictures of Aral Sea; Vozrozhdeniya Island

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `hoga-dammen-vid-assuan`: Höga dammen vid Assuan byggs (1960, Höga dammen vid Assuan, Egypten)

Wikidata: [Q38891](https://www.wikidata.org/wiki/Q38891). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Aswan High Dam-1.jpg](https://commons.wikimedia.org/wiki/File:Aswan_High_Dam-1.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | شرف الدين | 2008-02-19 / 2010-05-18 02:12:40 | 2592 × 1944 | – |
| 2 | [File:BarragemAssuão.jpg](https://commons.wikimedia.org/wiki/File:BarragemAssu%C3%A3o.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | NASA | 2001-03-18 / 2010-04-25 10:29:40 | 1160 × 960 | – |
- Nr 1: beskrivning: Aswan High Dam in Egypt · kategorier: Hydroelectric power plant at Aswan High Dam
- Nr 2: beskrivning: NASA satellite image of the Nile , Aswan High Dam , and Lake Nasser - southern Egypt . The Aswan High Dam was completed in 1970 and is one of the largest earthen embankment dams in the world. It is 364 feet (111 m) tall… · kategorier: Aswan High Dam; Earth photography during STS-102; PD NASA-AP; Satellite pictures of Egypt; Satellite pictures of rivers

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `opec-grundas`: OPEC grundas i Bagdad (1960, Bagdad, Irak)

Wikidata: [Q7795](https://www.wikidata.org/wiki/Q7795). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Wien - OPEC-Zentrale (a).JPG](https://commons.wikimedia.org/wiki/File:Wien_-_OPEC-Zentrale_(a).JPG) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | C.Stadler/Bwag | 2021-10-01 / 2021-10-01 12:21:48 | 4150 × 3173 | – |
- Nr 1: beskrivning: The headquarters of OPEC in Vienna. · kategorier: OPEC headquarters, 2009-

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `tereshkova-vostok-6`: Valentina Teresjkova blir första kvinnan i rymden (1963, Landning väster om Barnaul i Altaj, Sovjetunionen (i dag Ryssland))

Wikidata: [Q269668](https://www.wikidata.org/wiki/Q269668). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Vostok spacecraft.jpg](https://commons.wikimedia.org/wiki/File:Vostok_spacecraft.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | The original uploader was HPH at German Wikipedia . | 2002 / 2014-09-21 21:39:38 | 1304 × 942 | – |
| 2 | [File:RIAN archive 612748 Valentina Tereshkova.jpg](https://commons.wikimedia.org/wiki/File:RIAN_archive_612748_Valentina_Tereshkova.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: flagga CC BY-SA 3.0 – API:et säger "CC BY-SA 3.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Alexander Mokletsov / Александр Моклецов | 1969 / 2023-03-07 13:20:44 | 1014 × 1024 | staende, licens-flagga |
- Nr 1: beskrivning: Model of Vostok spacecraft , photo taken and edited by de:Benutzer:HPH on "Russia in Space" exhibition (Airport of Frankfurt, Germany, 2002) · kategorier: Russia in Space (2002 exhibition); Vostok spacecraft models
- Nr 2: beskrivning: “Valentina Tereshkova”. Valentina Tereshkova, pilot-cosmonaut, first female cosmonaut, Hero of the USSR. Pictured as a Major of the Soviet Air Forces. · kategorier: Bouffant; Lapels; Loose bangs, female; Orders of the Soviet Union; Photos by Alexander Mokletsov; Portraits of Valentina Tereshkova

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `slaget-i-ia-drang`: Slaget i Ia Drang (1965, Ia Drang-dalen vid Chu Pong-massivet, centrala högländerna, Sydvietnam)

Wikidata: [Q714749](https://www.wikidata.org/wiki/Q714749). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ia Drang Infantry disembarking from Helicopter.jpg](https://commons.wikimedia.org/wiki/File:Ia_Drang_Infantry_disembarking_from_Helicopter.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | United States Army | 1965-11 / 2006-04-14 08:42:49 | 978 × 650 | – |
- Nr 1: beskrivning: Soldiers of the U.S. Amry 1/7th Cavalry disembark from a Bell UH-1D Huey at LZ X-Ray during the battle of Ia Drang. · kategorier: 1965 in aviation in Vietnam; 7th Cavalry Regiment (United States) in the Vietnam War; Air assaults; Battle of Ia Drang; Bell UH-1 Iroquois in the Vietnam War

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `jerusalem-1967`: Israel tar Östra Jerusalem (1967, Ammunitionskullen och Gamla stan, Jerusalem)

Wikidata: [Q2336243](https://www.wikidata.org/wiki/Q2336243). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ammunition Hill P1000932.JPG](https://commons.wikimedia.org/wiki/File:Ammunition_Hill_P1000932.JPG) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | deror_avi | 2011-03-18 02:30:04 / 2011-03-19 16:07:11 | 3000 × 4000 | staende |
- Nr 1: beskrivning: Ammunition Hill, Jerusalem · kategorier: Ammunition Hill; Elef Milim - Ammunition Hill and Musrara

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `slaget-vid-abu-ageila-1967`: Slaget vid Abu-Ageila (1967, Abu-Ageila (Umm-Qatef), Sinaiöknen)

Wikidata: [Q2887798](https://www.wikidata.org/wiki/Q2887798). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Flickr - Government Press Office (GPO) - Centurion Tanks.jpg](https://commons.wikimedia.org/wiki/File:Flickr_-_Government_Press_Office_(GPO)_-_Centurion_Tanks.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: flagga CC BY-SA 3.0 – API:et säger "CC BY-SA 3.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Fritz Cohen | 1967-05-20 11:18:58 / 2017-06-06 16:55:44 | 3060 × 2048 | licens-flagga |
- Nr 1: beskrivning: Centurion tanks armed with 105 mm guns move during a stand-by in the Negev. · kategorier: 1967 black and white photographs; 1967 in military history; Armoured warfare; Black and white photographs of Israel in the 1960s; Centurion and Shot tanks in Israeli service; IDF in 1967

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 16. `belagringen-av-khe-sanh`: Belägringen av Khe Sanh (1968, Khe Sanh, provinsen Quảng Trị, nordvästra Sydvietnam)

Wikidata: [Q247253](https://www.wikidata.org/wiki/Q247253). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Tquad.jpg](https://commons.wikimedia.org/wiki/File:Tquad.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | – / 2006-10-01 11:35:59 | 699 × 344 | smal |
- Nr 1: kategorier: Battle of Khe Sanh; Guntrucks; M35 2½-ton cargo truck; M45 Quadmount

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 17. `dong-fang-hong-1`: Dong Fang Hong 1, Kinas första satellit (1970, Jiuquans uppskjutningscenter, Kina)

Wikidata: [Q49678](https://www.wikidata.org/wiki/Q49678). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:DFH-1 Satellite.jpg](https://commons.wikimedia.org/wiki/File:DFH-1_Satellite.jpg) | wikidata-P18 | CC0 (trolig); filsidan: godkand CC0 | Brücke-Osteuropa | 2011-10-28 / 2011-11-03 17:45:39 | 4320 × 2432 | – |
- Nr 1: beskrivning: Dong Fang Hong I - Chinese first satellite (1970), Space technology exhibition in Hohhot, Inner Mongolia, China · kategorier: Dong Fang Hong I

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 18. `faltaget-i-kambodja-1970`: Fälttåget i Kambodja (1970, Östra Kambodja, bland annat området Papegojnäbben (Parrot's Beak))

Wikidata: [Q2994973](https://www.wikidata.org/wiki/Q2994973). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Map Cambodian Incursion May 70 from USMA.jpg](https://commons.wikimedia.org/wiki/File:Map_Cambodian_Incursion_May_70_from_USMA.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | U.S Army | Unknown date / 2008-04-07 11:36:34 | 1451 × 903 | karta |
- Nr 1: beskrivning: Cambodian Campaign 1970 · kategorier: Maps of the Cambodian campaign

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 19. `ohsumi-japans-forsta-satellit`: Ohsumi, Japans första satellit (1970, Kagoshima Space Center (i dag Uchinoura), Japan)

Wikidata: [Q166596](https://www.wikidata.org/wiki/Q166596). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ohsumi.jpg](https://commons.wikimedia.org/wiki/File:Ohsumi.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Rlandmann | 2014-02-18 05:26:00 / 2014-02-17 19:28:06 | 1018 × 1024 | staende |
- Nr 1: beskrivning: Ohsumi satellite in orbit. Satellite image modified from https://commons.wikimedia.org/wiki/File:Ohsumi_Artificial_Satellite.jpg . Background is NASA image http://eol.jsc.nasa.gov/sseop/images/ISD/highres/STS106/STS106-… · kategorier: Ohsumi

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 20. `bangladeshs-befrielsekrig`: Bangladeshs befrielsekrig (1971, Östpakistan, i dag Bangladesh (började i Dhaka))

Wikidata: [Q371394](https://www.wikidata.org/wiki/Q371394). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Bangladesh 1971 Liberation.jpg](https://commons.wikimedia.org/wiki/File:Bangladesh_1971_Liberation.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Mike Young | – / 2007-10-29 13:01:11 | 1596 × 2000 | karta, staende |
- Nr 1: beskrivning: This map contains my estimates of the units involved in the Bangladesh liberation war. If you know better please contact user:Mike Young on the English Wikipedia, and I will correct the Paintshop Pro image I built this… · kategorier: Indo-Pakistani War of 1971; Maps of the Liberation War of Bangladesh

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 21. `bangladeshs-sjalvstandighet-utropas`: Bangladeshs självständighet utropas (1971, Dhaka)

Wikidata: [Q4855429](https://www.wikidata.org/wiki/Q4855429). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:2026-03-26 Tarique Rahman laying wreaths at tombs of Ziaur Rahman and Khaleda Zia on Independence and National Day, Zia Udyan, Sher-e-Bangla Nagar, Dhaka.jpg](https://commons.wikimedia.org/wiki/File:2026-03-26_Tarique_Rahman_laying_wreaths_at_tombs_of_Ziaur_Rahman_and_Khaleda_Zia_on_Independence_and_National_Day,_Zia_Udyan,_Sher-e-Bangla_Nagar,_Dhaka.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Press Information Department | 26 March 2026, 12:06:00 / 2026-03-26 06:08:12 | 1800 × 1196 | ur-sokning |
| 2 | [File:2026-03-31 State Minister for Liberation War Affairs Ishraque Hossain speech at Independence and National Day discussion meeting, National Press Club, Dhaka, with Information and Broadcasting Minister Zahir Uddin Swapan.jpg](https://commons.wikimedia.org/wiki/File:2026-03-31_State_Minister_for_Liberation_War_Affairs_Ishraque_Hossain_speech_at_Independence_and_National_Day_discussion_meeting,_National_Press_Club,_Dhaka,_with_Information_and_Broadcasting_Minister_Zahir_Uddin_Swapan.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Press Information Department | 31 March 2026, 15:22:00 / 2026-03-31 10:10:00 | 1800 × 1015 | ur-sokning |
| 3 | [File:2026-03-31 Minister Zahir Uddin Swapan speech at discussion meeting on Independence and National Day, National Press Club, Dhaka.jpg](https://commons.wikimedia.org/wiki/File:2026-03-31_Minister_Zahir_Uddin_Swapan_speech_at_discussion_meeting_on_Independence_and_National_Day,_National_Press_Club,_Dhaka.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Press Information Department | 31 March 2026, 15:21:00 / 2026-03-31 10:10:42 | 1800 × 1109 | ur-sokning |
- Nr 1: beskrivning: On the occasion of Great Independence and National Day, Prime Minister Tarique Rahman paid respects by laying wreaths at the tombs of the Proclaimer of Independence, Shaheed President Ziaur Rahman and former Prime Minis… · kategorier: Tarique Rahman in March 2026
- Nr 2: beskrivning: On Tuesday, March 31, 2026, State Minister for Liberation War Affairs Ishraque Hossain delivered a special guest speech at the National Press Club in Dhaka. The event was a discussion meeting titled 'Proclaimer of Indep… · kategorier: Ishraque Hossain; Zahir Uddin Swapan
- Nr 3: beskrivning: On Tuesday, March 31, 2026, Minister of Information and Broadcasting Zahir Uddin Swapan delivered a speech as the chief guest at a discussion meeting titled 'Proclaimer of Independence and Zia of the Battlefield' at the… · kategorier: Zahir Uddin Swapan

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 22. `operation-lam-son-719`: Operation Lam Son 719 i Laos (1971, Sydöstra Laos, längs väg 9 mot Tchepone (Xépôn))

Wikidata: [Q2095768](https://www.wikidata.org/wiki/Q2095768). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Map Lam Son 719.jpg](https://commons.wikimedia.org/wiki/File:Map_Lam_Son_719.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | U.S Army | Unknown date / 2017-12-17 11:29:54 | 1443 × 795 | karta |
- Nr 1: beskrivning: 32. South Vietnam, 1971 - LAM SON 719 · kategorier: Maps of battles and operations of the Vietnam War; Operation Lam Son 719

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 23. `operation-searchlight`: Operation Searchlight (1971, Dhaka och andra städer i Östpakistan)

Wikidata: [Q2985554](https://www.wikidata.org/wiki/Q2985554). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Chart 1 1971 Operation Searchlight-some instances of number of Hindus killed in different places.png](https://commons.wikimedia.org/wiki/File:Chart_1_1971_Operation_Searchlight-some_instances_of_number_of_Hindus_killed_in_different_places.png) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Human conciousness | 3/3/25 / 2025-03-03 20:23:21 | 1014 × 736 | ur-sokning |
| 2 | [File:1971 Events Montage.jpg](https://commons.wikimedia.org/wiki/File:1971_Events_Montage.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Bernard Gotfryd Michael Bernhard Adam Jones SheBeHuman NASA Afrank99 National Archives of the United Arab Emirates, Ministry of Presidential Affairs | 2023-05-07 / 2023-05-08 09:45:04 | 930 × 840 | ur-sokning |
| 3 | [File:Operation-searchlight.jpg](https://commons.wikimedia.org/wiki/File:Operation-searchlight.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Shajia Annoor | 2025-02-27 / 2025-02-27 09:09:14 | 2048 × 1536 | ur-sokning |
- Nr 1: beskrivning: 1971 Operation Searchlight-some instances of number of Hindus killed in different places · kategorier: Bar charts
- Nr 2: beskrivning: 1971 collage inspired in The ganymedian. · kategorier: 1971 events; Annual review collages
- Nr 3: beskrivning: A car depicting the Operation Searchlight at the Liberation War Museum · kategorier: Bangladesh Liberation War; Liberation War museums in Bangladesh

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 24. `saljut-1`: Saljut 1, världens första rymdstation (1971, Bajkonur, Kazakstan (då Sovjetunionen))

Wikidata: [Q211761](https://www.wikidata.org/wiki/Q211761). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:1972 CPA 4112.jpg](https://commons.wikimedia.org/wiki/File:1972_CPA_4112.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | USSR Post | 1972-04-05 / 2015-08-19 09:42:41 | 1247 × 889 | – |
- Nr 1: beskrivning: USSR stamp · kategorier: 1972 all stamps of the Soviet Union; Earth on stamps of the Soviet Union; Salyut 1; Space exploration on stamps of the Soviet Union

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 25. `jom-kippurkriget`: Jom kippurkriget (1973, Sinaihalvön, Suezkanalen och Golanhöjderna (började längs Suezkanalen och på Golan))

Wikidata: [Q49100](https://www.wikidata.org/wiki/Q49100). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Yom Kippur War. XXXVI.jpg](https://commons.wikimedia.org/wiki/File:Yom_Kippur_War._XXXVI.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: flagga CC BY-SA 3.0 – API:et säger "CC BY-SA 3.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Bamahane photographer | Taken on 15 October 1973 / 2020-04-14 06:27:05 | 1800 × 1350 | licens-flagga |
- Nr 1: beskrivning: מלחמת יום הכיפורים; סיני. פריסת גשר על תעלת סואץ מגח 6 של חטיבה 421 צולחים את תעלת סואץ התמסחים העבירו את הטנקים נראים מימין. הצילום ממערב לתעלה. · kategorier: Crossing of Suez Canal by Israel Defense Forces; EWK-Gillois bridgelayer in Israeli service; IDF in 1973; M48 and Magach 3/5 tanks in Israeli service

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 26. `slaget-vid-kinesiska-farmen`: Slaget vid Kinesiska farmen (1973, Norr om Stora bittersjön, öster om Suezkanalen)

Wikidata: [Q2072316](https://www.wikidata.org/wiki/Q2072316). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:1973 sinai war maps2.png](https://commons.wikimedia.org/wiki/File:1973_sinai_war_maps2.png) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | The Department of History, United States Military Academy | – / 2025-12-08 13:12:00 | 1200 × 1826 | karta, staende |
- Nr 1: beskrivning: Image of Operation Gazelle (also known as Operation Abiray-Lev or Operation Stouthearted Men) during the Yom Kippur War. Modified to show only the Israeli plan for the operation. · kategorier: Crossing of Suez Canal by Israel Defense Forces; Maps of the Yom Kippur War; Yom Kippur War in Sinai Peninsula and Egypt

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 27. `tararnas-dal-1973`: Slaget i Tårarnas dal (1973, Tårarnas dal, norra Golanhöjderna)

Wikidata: [Q2907870](https://www.wikidata.org/wiki/Q2907870). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:1973 Yom Kippur War - Golan heights theater.jpg](https://commons.wikimedia.org/wiki/File:1973_Yom_Kippur_War_-_Golan_heights_theater.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Department of History, U.S. Military Academy. See Department Maps page. | – / 2011-07-18 19:11:20 | 1117 × 854 | karta |
- Nr 1: beskrivning: Yom Kippur War 1973 on the Golan heights · kategorier: 20th-century maps of battles; Maps of the Yom Kippur War; Maps of the history of the Golan Heights

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 28. `aryabhata-indiens-forsta-satellit`: Aryabhata, Indiens första satellit (1975, Kapustin Jar, Astrachan oblast, Sovjetunionen (i dag Ryssland))

Wikidata: [Q19706](https://www.wikidata.org/wiki/Q19706). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Aryabhata Satellite.jpg](https://commons.wikimedia.org/wiki/File:Aryabhata_Satellite.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | ISRO | – / 2010-04-21 06:33:27 | 484 × 381 | smal |
- Nr 1: beskrivning: Aryabhata was India's first satellite and was designed for studies of X-ray astronomy, aeronomics and solar physics. Unfortunately, a power failure halted experiments after 4 days in orbit, and all signals from the spac… · kategorier: Aryabhata (satellite)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 29. `folkmordet-i-kambodja`: Folkmordet i Kambodja (1975, Demokratiska Kampuchea, i dag Kambodja (markören i Phnom Penh))

Wikidata: [Q2885072](https://www.wikidata.org/wiki/Q2885072). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Skulls from the killing fields.jpg](https://commons.wikimedia.org/wiki/File:Skulls_from_the_killing_fields.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | – / 2005-02-03 20:33:12 | 1760 × 1168 | – |
- Nr 1: kategorier: Skulls in ossuaries; Stupas in Choeung Ek

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 30. `papua-nya-guinea-blir-sjalvstandigt`: Papua Nya Guinea blir självständigt (1975, Port Moresby (Papua Nya Guinea))

Wikidata: [Q691](https://www.wikidata.org/wiki/Q691). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Papua new guinea provinces (numbers) 2012.png](https://commons.wikimedia.org/wiki/File:Papua_new_guinea_provinces_(numbers)_2012.png) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Keith Edkins at English Wikipedia | 2012-05-22 / 2012-05-28 18:05:48 | 1114 × 750 | karta |
| 2 | [File:LocationPapuaNewGuinea.png](https://commons.wikimedia.org/wiki/File:LocationPapuaNewGuinea.png) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | – / 2004-12-27 16:52:20 | 250 × 115 | karta, smal |
| 3 | [File:Papua New Guinea map.png](https://commons.wikimedia.org/wiki/File:Papua_New_Guinea_map.png) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | – / 2014-01-21 17:39:42 | 322 × 346 | karta, smal, staende |
- Nr 1: beskrivning: Map of Provinces of Papua New Guinea, including new provinces (Hela & Jiwaka) officially inaugurated in May 2012. Central Chimbu ( Simbu ) Eastern Highlands East New Britain East Sepik Enga Gulf Madang Manus Milne Bay M… · kategorier: Locator maps of provinces of Papua New Guinea; Maps numbering
- Nr 2: kategorier: Locator maps of Papua New Guinea; Locator maps of countries of Oceania (gray and green scheme); Locator maps of former subdivisions of Australia
- Nr 3: kategorier: Bismarck Sea; CIA World Factbook maps of Papua New Guinea; Coral Sea; Solomon Sea

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 31. `saigons-fall`: Saigons fall (1975, Saigon (i dag Ho Chi Minh-staden), Sydvietnam)

Wikidata: [Q482456](https://www.wikidata.org/wiki/Q482456). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:HCMCampaign.svg](https://commons.wikimedia.org/wiki/File:HCMCampaign.svg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | User:Ctmt | 8 May 2009 (original upload date) / 2013-12-24 03:10:07 | 2175 × 2670 | karta, staende |
- Nr 1: beskrivning: Map showing NVA movements around Saigon before 30 April 1975, the day South Vietnam fell. · kategorier: Maps of the fall of Saigon

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `ambedkar-blir-buddhist`: Ambedkar och hundratusentals anhängare går över till buddhismen (1956)
- `trieste-nar-challengerdjupet`: Trieste når botten av Challengerdjupet (1960)
- `golanhojderna-1967`: Israel tar Golanhöjderna, och vapenvilan börjar (1967)
- `slaget-vid-hilli`: Slaget vid Hilli (1971)
- `slaget-om-suez-1973`: Slaget om Suez och den sista vapenvilan (1973)

## Val 2026-11-26 (#2070 och #2071)

13 av 40 händelser fick bild; 1 har en utsedd kandidat som inte kunde hämtas (`asien-8-ej-hamtade.txt`). Filsidorna kontrollerades via verktygets licenskontroll (`action=raw`) och bilderna granskades visuellt i en kontaktbild.

- Avvisat efter att filsidan öppnats eller bilden setts: `slaget-vid-abu-ageila-1967` och `golanhojderna-1967` (licensflagga), `saljut-1` (frimärke med osäker licens och oklar koppling), `ohsumi-japans-forsta-satellit` (montage med okontrollerad delbild), `folkmordet-i-kambodja` (kvarlevor).
- Israeliska GPO-bilder från 1948–1967 används inte här: de är fria enligt Israels lag (PD-Israel) men kan fortfarande vara skyddade i USA (URAA); samma försiktighet gäller `operation-yoav` i föregående omgång (se #2311).
- Händelserna `vietnamkriget`, `sexdagarskriget`, `mujibnagarregeringen` och `ramsarkonventionen` saknades i den automatiska listan (de har `start` i stället för `year`); `vietnamkriget` och `sexdagarskriget` söktes manuellt.
- Egen sökning: `trieste-nar-challengerdjupet`, `golanhojderna-1967`, `sexdagarskriget`, `vietnamkriget`, `suez` och `ambedkar-blir-buddhist`.
