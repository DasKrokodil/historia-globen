# Granskningslista för bildomgång europa-7

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=33 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 33. **Med minst en användbar kandidat:** 21. **Utan kandidat:** 12.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `europa-7-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/europa-7-lista.txt`.

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

## 1. `de-forsta-nobelprisen`: De första Nobelprisen delas ut (1901, Musikaliska Akademiens hus, Stockholm, Sverige)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:36th Ig Nobel Prize Ceremony Zurich 188.jpg](https://commons.wikimedia.org/wiki/File:36th_Ig_Nobel_Prize_Ceremony_Zurich_188.jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | Albinfo | 2026-09-03 19:56:53 / 2026-09-06 18:09:33 | 6000 × 4000 | ur-sokning |
| 2 | [File:Secretary Clinton and First Lady Obama With 2011 Nobel Peace Prize Laureates Leymah Gbowee and Tawakkol Karman.jpg](https://commons.wikimedia.org/wiki/File:Secretary_Clinton_and_First_Lady_Obama_With_2011_Nobel_Peace_Prize_Laureates_Leymah_Gbowee_and_Tawakkol_Karman.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | United States government work | 2012-03-08 11:02:48 / 2015-05-09 12:04:17 | 2000 × 1331 | ur-sokning |
| 3 | [File:Nobel prize medal awarded to Alexander Fleming, 1945. (9660573705).jpg](https://commons.wikimedia.org/wiki/File:Nobel_prize_medal_awarded_to_Alexander_Fleming,_1945._(9660573705).jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Science Museum London / Science and Society Picture Library | 2013-08-28 15:11 / 2013-09-03 10:25:08 | 1017 × 1250 | staende, ur-sokning |
- Nr 1: beskrivning: The 36th First Annual Ig Nobel Prize Ceremony 2026 in Zurich, Switzerland: Swiss didgeridoo performer Alex Suarez who was awarded the Ig Peace Nobel Price in 2017 · kategorier: 36th First Annual Ig Nobel Prize Ceremony; Didgeridoo performers; Ig Nobel laureates; Ursina Gabriela Roesch
- Nr 2: beskrivning: U.S. Secretary of State Hillary Rodham Clinton, center right; and First Lady Michelle Obama, center left; pose for a photo with 2012 International Women of Courage (IWOC) Awards Ceremony special guests and 2011 Nobel Pe… · kategorier: Leymah Gbowee; Nobel Peace Prize 2011; Tawakkul Karman in 2011
- Nr 3: beskrivning: The inscription on reverse side reads; 'Alexander Fleming Prix Nobel 1945'. In 1928 Alexander Fleming (1881-1955) had discovered that a strain of penicillium mould exuded a substance which killed certain bacteria. Follo… · kategorier: Alexander Fleming; Nobel Prize medals

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `sveriges-forsta-nationalparker`: Sverige inrättar Europas första nationalparker (1909, Sarek och åtta andra parker, Sverige)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Palūšė 04.jpg](https://commons.wikimedia.org/wiki/File:Pal%C5%AB%C5%A1%C4%97_04.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Scotch Mist | Taken on 10 June 2019, 10:45:04 / 2020-07-23 09:33:17 | 5296 × 3520 | ur-sokning |
| 2 | [File:Palūšė 16.jpg](https://commons.wikimedia.org/wiki/File:Pal%C5%AB%C5%A1%C4%97_16.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Scotch Mist | Taken on 10 June 2019, 11:18:52 / 2020-07-27 12:29:58 | 5840 × 3880 | ur-sokning |
| 3 | [File:Trakai Island 13.jpg](https://commons.wikimedia.org/wiki/File:Trakai_Island_13.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Scotch Mist | Taken on 6 June 2018, 09:09:41 / 2020-07-27 14:17:23 | 3946 × 5935 | staende, ur-sokning |
- Nr 1: beskrivning: Lithuania , officially the Republic of Lithuania, is a country in the Baltic region of Europe and is considered to be one of the Baltic states . It is situated along the southeastern shore of the Baltic Sea , to the eas… · kategorier: Anas platyrhynchos; Anas platyrhynchos in Lithuania; Aukštaitija National Park; Nymphaeaceae; Palūšė; Piers in Lithuania
- Nr 2: beskrivning: Lithuania , officially the Republic of Lithuania, is a country in the Baltic region of Europe and is considered to be one of the Baltic states . It is situated along the southeastern shore of the Baltic Sea , to the eas… · kategorier: Blue paint; Lūšiai; Palūšė; Rowboats in Lithuania
- Nr 3: beskrivning: Lithuania , officially the Republic of Lithuania, is a country in the Baltic region of Europe and is considered to be one of the Baltic states . It is situated along the southeastern shore of the Baltic Sea , to the eas… · kategorier: Exterior of the outer bailey of Trakai Island Castle

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `armeniska-folkmordet`: Armeniska folkmordet (1915, Osmanska riket, från Anatolien till Syriska öknen (markören i Konstantinopel, i dag Istanbul, där gripandena började den 24 april 1915))

Wikidata: [Q80034](https://www.wikidata.org/wiki/Q80034). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ambassador Morgenthau's Story p314.jpg](https://commons.wikimedia.org/wiki/File:Ambassador_Morgenthau%27s_Story_p314.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand-med-not Public domain – risk: public domain bara i USA (pd-us): kontrollera att verket först publicerades i USA, eller vad som gäller i ursprungslandet | Henry Morgenthau | published 1918 / 2020-09-15 01:51:35 | 3999 × 2731 | licens-risk |
- Nr 1: beskrivning: Picture showing Armenians killed during the Armenian Genocide . Image taken from Ambassador Morgenthau's Story , written by Henry Morgenthau, Sr. and published in 1918. Original description : "THOSE WHO FELL BY THE WAYS… · kategorier: Ambassador Morgenthau's Story; Armenian Genocide victims · licensrisk: public domain bara i USA (pd-us): kontrollera att verket först publicerades i USA, eller vad som gäller i ursprungslandet

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `turkiska-frihetskriget`: Turkiska frihetskriget (1919, Anatolien och östra Thrakien (markören i Smyrna, i dag İzmir, där kriget började))

Wikidata: [Q234738](https://www.wikidata.org/wiki/Q234738). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Turkish War of Independence - collage.jpg](https://commons.wikimedia.org/wiki/File:Turkish_War_of_Independence_-_collage.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Youngottoman | 2008-01-14 / 2008-01-13 12:04:42 | 404 × 404 | smal, staende |
- Nr 1: beskrivning: Clockwise from top left : The British army is executing a death penalty in İzmit; Greek soldiers are occupying Smyrna; The Turkish delegation at the Sivas Conference; Turkish horse cavalry; Bayonet attack in Afyonkarahi… · kategorier: Montages of Turkish War of Independence

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `massakern-vid-monte-arruit`: Massakern vid Monte Arruit (1921, Monte Arruit vid Al Aaroui, omkring 35 km söder om Melilla)

Wikidata: [Q104852916](https://www.wikidata.org/wiki/Q104852916). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Guerra del Rif 1922 - 2.jpg](https://commons.wikimedia.org/wiki/File:Guerra_del_Rif_1922_-_2.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1922 / 2011-11-30 18:21:45 | 711 × 607 | smal |
- Nr 1: beskrivning: January 1922. Rif War. Months after the Battle of Annual (July-August 1921) the remains are still scattered. · kategorier: 1922 black and white photographs; Massacre of Monte Arruit

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `rifrepubliken-utropas`: Rifrepubliken utropas (1921, Rif, norra Marocko)

Wikidata: [Q37102](https://www.wikidata.org/wiki/Q37102). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:222Drapeau de l'ancienne république du rif (1921-1926).png](https://commons.wikimedia.org/wiki/File:222Drapeau_de_l%27ancienne_r%C3%A9publique_du_rif_(1921-1926).png) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Zenata123 | – / 2020-10-15 05:13:40 | 2560 × 1707 | ur-sokning |
| 2 | [File:Seal of the Republic of the Rif.png](https://commons.wikimedia.org/wiki/File:Seal_of_the_Republic_of_the_Rif.png) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Visma | 2023-10-17 / 2023-10-17 21:53:43 | 5764 × 5820 | staende, ur-sokning |
| 3 | [File:Flag Map of the Republic of the Rif (1921-26).png](https://commons.wikimedia.org/wiki/File:Flag_Map_of_the_Republic_of_the_Rif_(1921-26).png) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | SpaceImplorerExplorerImplorer | 2019-10-11 / 2019-10-11 16:35:31 | 993 × 662 | karta, ur-sokning |
- Nr 1: beskrivning: drapeau republique rif · kategorier: Flags of the Rif Republic
- Nr 2: beskrivning: Seal of the Council of Ministers of the Rif Republic. · kategorier: Coats of arms of Morocco; Rif Republic
- Nr 3: beskrivning: Flag Map of the Republic of the Rif (1921-26), a short-lived republic in northern Morocco that declared its independence from Spanish occupation and the Moroccan sultan Yusef. · kategorier: Flag maps of Rif; Flag maps of Tamazgha; Flags of the Rif Republic

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `landstigningen-vid-alhucemas`: Landstigningen vid Alhucemas (1925, Alhucemasbukten vid Al Hoceima, norra Marocko)

Wikidata: [Q3026815](https://www.wikidata.org/wiki/Q3026815). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:14. La playa de Morro Nuevo en los días del desembarco.jpg](https://commons.wikimedia.org/wiki/File:14._La_playa_de_Morro_Nuevo_en_los_d%C3%ADas_del_desembarco.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1925-09 / 2018-02-12 08:31:09 | 1168 × 647 | – |
- Nr 1: beskrivning: 14. La playa de Morro Nuevo en los días del desembarco. · kategorier: 1925 postcards of Spain; Landing of Alhucemas; X-lighter (United Kingdom)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `lego-grundas`: LEGO börjar i en snickarverkstad i Billund (1932, Billund, Jylland, Danmark)

Wikidata: [Q1063455](https://www.wikidata.org/wiki/Q1063455). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Legoland Minilands London.jpg](https://commons.wikimedia.org/wiki/File:Legoland_Minilands_London.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Fluteflute | 2008-08 / 2008-12-08 17:17:12 | 1280 × 960 | – |
- Nr 1: beskrivning: London Miniland at Legoland Windsor · kategorier: Lego models of buildings in London; London at Miniland (Legoland Windsor)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `spanska-inbordeskriget`: Spanska inbördeskriget (1936, Spanien och Spanska Marocko (markören i Tetouan, huvudstad i Spanska Marocko; upproret började i Spanska Marocko))

Wikidata: [Q10859](https://www.wikidata.org/wiki/Q10859). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Soldrepteruel1937.jpg](https://commons.wikimedia.org/wiki/File:Soldrepteruel1937.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1937-12 / 2017-02-19 21:45:23 | 3500 × 2664 | – |
- Nr 1: beskrivning: Soldados republicanos en las calles de Teruel, durante la conquista de la ciudad. · kategorier: 1937 photographs of Spain; 20th-century black and white photographs of Aragon; Battle of Teruel; December 1937 photographs; Military people in 1937; People of Spain in 1937

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `karnklyvningen-upptacks`: Kärnklyvningen upptäcks (1938, Kaiser Wilhelm-sällskapets kemiinstitut, Berlin)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Nuclear Fission Experimental Apparatus 1938 - Deutsches Museum - Munich.jpg](https://commons.wikimedia.org/wiki/File:Nuclear_Fission_Experimental_Apparatus_1938_-_Deutsches_Museum_-_Munich.jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | J Brew | 2006-05-28 07:48:46 / 2014-09-03 02:41:30 | 2592 × 1944 | ur-sokning |
| 2 | [File:Versuchsaufbau Hahn Deutsches Museum-2.jpg](https://commons.wikimedia.org/wiki/File:Versuchsaufbau_Hahn_Deutsches_Museum-2.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Versuchsaufbau_Hahn_Deutsches_Museum.jpg : Luidger derivative work: Hic et nunc | 2012-08-13 16:57 / 2012-08-13 17:00:11 | 1280 × 844 | ur-sokning |
| 3 | [File:Mnohonásobné bariéry.png](https://commons.wikimedia.org/wiki/File:Mnohon%C3%A1sobn%C3%A9_bari%C3%A9ry.png) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Routnmil | 2015-03-26 / 2015-03-26 19:35:26 | 892 × 600 | ur-sokning |
- Nr 1: beskrivning: The Experimental Apparatus with which the team of Otto Hahn , and Fritz Strassmann discovered Nuclear Fission in 1938. The arrangement was originally in 3 separate rooms: irradiation, measurement, and chemistry at the K… · kategorier: Fritz Straßmann; Mockups of physics experiments; Nuclear physics; Otto Hahn
- Nr 2: beskrivning: Versuchsapparaturen, mit denen Otto Hahn, Lise Meitner und Fritz Straßmann von 1935 bis 1938 nach Transuranen suchten, und Otto Hahn und sein Assistent Fritz Straßmann am 17. Dezember 1938 die Kernspaltung entdeckten. D… · kategorier: Deutsches Museum - Physik (Physics); Fritz Straßmann; Mockups of physics experiments; Nuclear fission; Otto Hahn
- Nr 3: beskrivning: Mnohonásobné bariéry · kategorier: Natural nuclear fission reactor

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `jordbavningen-i-erzincan-1939`: Jordbävningen i Erzincan (1939, Erzincan, östra Turkiet)

Wikidata: [Q3045050](https://www.wikidata.org/wiki/Q3045050). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:1939 Events Collage V 1.1.jpg](https://commons.wikimedia.org/wiki/File:1939_Events_Collage_V_1.1.jpg) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | Kingdom of Italy Unknown author. Михаил Михайлович Калашников unknown Fernando Melcher Marmara Üniversitesi captured photo Hans Sönnke | 2023-12-07 / 2023-12-07 09:23:09 | 4096 × 3694 | ur-sokning |
| 2 | [File:1939 Erzincan depremi için yardımda bulunan ülkeler.png](https://commons.wikimedia.org/wiki/File:1939_Erzincan_depremi_i%C3%A7in_yard%C4%B1mda_bulunan_%C3%BClkeler.png) | commons-sok | CC0 (trolig); filsidan: godkand-med-not CC0 – risk: "eget verk" av en bild daterad 1939: kontrollera vem som tog eller gjorde originalet | SahinBasaran | 1939-12-27 / 2024-01-09 02:19:09 | 7752 × 3840 | karta, ur-sokning, licens-risk |
| 3 | [File:Statue of Inönü in Erzincan 2579.jpg](https://commons.wikimedia.org/wiki/File:Statue_of_In%C3%B6n%C3%BC_in_Erzincan_2579.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Dosseman | 2006-06-03 16:18:32 / 2024-01-27 19:04:17 | 4288 × 2848 | konstverk, ur-sokning |
- Nr 1: beskrivning: Clockwise: Italian invasion of Albania Winter War Molotov–Ribbentrop Pact Pact of Steel "Gone with the Wind" 1939 Erzincan earthquake Battles of Khalkhin Gol Invasion of Poland · kategorier: 1939; Annual review collages; Gone with the Wind (film)
- Nr 2: beskrivning: 1939 Erzincan depremi için yardımda bulunan ülkeler. · kategorier: 1939-12-27; 1939 Erzincan earthquake; Earthquakes of 1939; Locator maps of Turkey; Maps showing 1939 · licensrisk: "eget verk" av en bild daterad 1939: kontrollera vem som tog eller gjorde originalet
- Nr 3: beskrivning: After wrongly thinking it was about Atatürk I was corrected: it refers to Inönü, as implied by the text "This monument tells about president İsmet İnönü and the Erzincan earthquake. İnönü was visiting the city right aft… · kategorier: Statue of Inönü in Erzincan

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `raddningen-av-de-danska-judarna`: De danska judarna räddas till Sverige (1943, Köpenhamn och Själlands kust, Danmark)

Wikidata: [Q514188](https://www.wikidata.org/wiki/Q514188). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The fishing boat "Elisabeth" took part in the rescue of Danish Jews in 1943. Around 700 Jews fled trough Dragør harbour to neutral Sweden. - Flickr - Cederskjold Photo.jpg](https://commons.wikimedia.org/wiki/File:The_fishing_boat_%22Elisabeth%22_took_part_in_the_rescue_of_Danish_Jews_in_1943._Around_700_Jews_fled_trough_Drag%C3%B8r_harbour_to_neutral_Sweden._-_Flickr_-_Cederskjold_Photo.jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | Jens Cederskjold from København S, Danmark | Taken on 11 August 2026, 17:16 / 2026-09-22 03:21:38 | 2048 × 1472 | ur-sokning |
| 2 | [File:Danish Rescue Boat (USHMM).jpg](https://commons.wikimedia.org/wiki/File:Danish_Rescue_Boat_(USHMM).jpg) | commons-sok | CC BY 3.0 (trolig); filsidan: godkand CC BY 3.0 | Brigade Piron | 17 September 2023 (according to Exif data) / 2023-11-21 08:08:52 | 8000 × 6000 | ur-sokning |
| 3 | [File:Odden Smokehouse 02.jpg](https://commons.wikimedia.org/wiki/File:Odden_Smokehouse_02.jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | seier+seier | 2008-08-17 23:40 / 2022-06-26 18:34:08 | 1944 × 2629 | staende, ur-sokning |
- Nr 1: beskrivning: The fishing boat "Elisabeth" took part in the rescue of Danish Jews in 1943. Around 700 Jews fled trough Dragør harbour to neutral Sweden. · kategorier: Denmark in World War II; Dragør Havn; Fishing boats of Denmark
- Nr 2: beskrivning: A Danish rescue boat in the collection of the United States Holocaust Memorial Museum. This particular example was used in teh earliest operations for the evacuation of Danish Jews organised by the Helsingor Sewing Club… · kategorier: Collections of the United States Holocaust Memorial Museum; Ships of Denmark; The Holocaust in Denmark
- Nr 3: beskrivning: odden smokehouse, odden, denmark 1943. architect: arne jacobsen, 1902-1971. I know...there is something wrong with these pictures - or at least with the date of the buildings they aim to portray. 1943. because of the wa… · kategorier: Røgeriet (Havnebyen)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `vapenstillestand-egypten-israel-1949`: Vapenstillestånd mellan Egypten och Israel (1949, Rhodos, Grekland)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Rhodes 1949 Palestine War Armnistice Plate.jpg](https://commons.wikimedia.org/wiki/File:Rhodes_1949_Palestine_War_Armnistice_Plate.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Catlemur | 2024-03-03 / 2024-03-05 19:59:57 | 1530 × 2040 | staende, ur-sokning |
- Nr 1: beskrivning: Commemorative ceramic plate celebrating the armistices between Israel and Egypt (24.2.1949) and Jordan (3.4.1949). The plate was made by the Jewish community on Rhodos. Jewish Museum of Greece. · kategorier: 1949 Armistice Agreements; Ceramic plates; Jewish Museum of Greece; Rhodes in the 1940s

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `algeriska-frihetskriget`: Algeriska frihetskriget (1954, Franska Algeriet (började med samordnade anfall över hela landet))

Wikidata: [Q200790](https://www.wikidata.org/wiki/Q200790). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Algerian war collage wikipedia.jpg](https://commons.wikimedia.org/wiki/File:Algerian_war_collage_wikipedia.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Madame Grinderche | 2010 / 2023-04-14 16:06:41 | 960 × 960 | staende |
- Nr 1: beskrivning: Collage made by me using screenshots from two Public Domain videos. Collage description: (first row) Muslim rebels army ALN; French Army M8 Greyhound patrol; French settlers take up arms after the August 1955 Constantin… · kategorier: Algerian War; History of the French Army; Montages of Algeria; Montages of war

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `slaget-om-alger`: Slaget om Alger (1956, Alger, särskilt Kasbah, Franska Algeriet)

Wikidata: [Q1761043](https://www.wikidata.org/wiki/Q1761043). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Casbah-cache-Ali-lapointe.jpg](https://commons.wikimedia.org/wiki/File:Casbah-cache-Ali-lapointe.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – risk: filsidan har en mall om frihet för panorama: kontrollera upphovsrätten för konstverket i bilden | Saber68 | photo prise, le 2011-12-20 / 2016-05-16 03:33:07 | 1600 × 960 | licens-risk |
| 2 | [File:Ali-la-pointe-Mort.jpg](https://commons.wikimedia.org/wiki/File:Ali-la-pointe-Mort.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1957-10-08 / 2023-02-19 17:42:04 | 746 × 536 | smal |
| 3 | [File:Djamila-Bouazza-22-ans (cropped).jpg](https://commons.wikimedia.org/wiki/File:Djamila-Bouazza-22-ans_(cropped).jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1960s date QS:P,+1960-00-00T00:00:00Z/8 / 2023-02-27 15:51:04 | 736 × 759 | smal, staende |
- Nr 1: beskrivning: The remains of a house in the Casbah of Algiers destroyed in the explosion that killed Ali la Pointe, Hassiba Ben Bouali, Petit Omar and Mohamed Bouhmidi, october 8, 1957 · kategorier: Algerian War; Ali Ammar; Battle of Algiers; Casbah of Algiers; Hassiba Ben Bouali; Rue des Abdérames (Algiers) · licensrisk: filsidan har en mall om frihet för panorama: kontrollera upphovsrätten för konstverket i bilden
- Nr 2: beskrivning: La mort de Ali la pointe avec une bombe de l'armé française en 1957 · kategorier: Algerian War; Ali Ammar; Battle of Algiers; Dead people; Fellaghas; Shahid
- Nr 3: beskrivning: Djamila bouazza with her bomb during the reconstitution of the Cafeteria attack in Algiers. · kategorier: Algerian War; Battle of Algiers; Djamila Bouazza

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 16. `ungernrevolten-1956`: Ungernrevolten (1956, Budapest, Ungern)

Wikidata: [Q164348](https://www.wikidata.org/wiki/Q164348). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Hungarian Revolution of 1956.png](https://commons.wikimedia.org/wiki/File:Hungarian_Revolution_of_1956.png) | wikidata-P18 | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | Atoljaka | 2024-10-23 / 2024-10-23 12:20:51 | 2400 × 3000 | staende |
| 2 | [File:Hole in flag - Budapest 1956.jpg](https://commons.wikimedia.org/wiki/File:Hole_in_flag_-_Budapest_1956.jpg) | wikidata-P18 | Attribution (flagga); filsidan: flagga – licensen kunde inte avgöras (inga igenkända licensmallar; API: "Attribution") | The American Hungarian Federation | october 1956 (heavy artillery on the street) / 2006-10-23 10:27:19 | 433 × 600 | smal, staende, licens-flagga |
- Nr 1: beskrivning: Montage of the Hungarian Revolution of 1956 · kategorier: Hungarian Revolution of 1956
- Nr 2: beskrivning: Corvin köz, Budapest Hungary, Central Europe. In october 1956 this place was an important defence stronghold of hungarians against the invading soviet army. Commanders: Pongrátz Gergely and Kovács László Iván. Russian t… · kategorier: 37mm anti-aircraft automatic cannon model 1939 during the Hungarian Revolution of 1956; Hungarian Revolution of 1956 at Corvin köz, Budapest; The Flag-with-the-Hole

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 17. `generalskuppen-1961`: Generalernas kupp i Alger misslyckas (1961, Alger, Franska Algeriet)

Wikidata: [Q2605231](https://www.wikidata.org/wiki/Q2605231). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Plan D'Alger Et Ses Environs d'après Boutin.png](https://commons.wikimedia.org/wiki/File:Plan_D%27Alger_Et_Ses_Environs_d%27apr%C3%A8s_Boutin.png) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1830 / 2023-01-05 09:55:14 | 7639 × 8784 | karta, staende, ur-sokning |
- Nr 1: beskrivning: Map of Algiers and its Environs, according to Boutin. · kategorier: 19th-century maps of Algiers; Algiers in the 19th century; Ottoman period in the history of Algeria; Synagogues in Algiers

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 18. `andra-vatikankonciliet`: Andra Vatikankonciliet (1962, Peterskyrkan, Vatikanstaten)

Wikidata: [Q169789](https://www.wikidata.org/wiki/Q169789). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Second Vatican Council by Lothar Wolleh 005 cropped.jpg](https://commons.wikimedia.org/wiki/File:Second_Vatican_Council_by_Lothar_Wolleh_005_cropped.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Lothar Wolleh | 3 October 2014 (upload date) / 2014-10-03 13:54:39 | 1326 × 1060 | – |
| 2 | [File:Konzilseroeffnung 2.jpg](https://commons.wikimedia.org/wiki/File:Konzilseroeffnung_2.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Peter Geymayer | 1962-10-11 / 2008-05-22 14:20:01 | 2500 × 1662 | – |
| 3 | [File:Second Vatican Council by Lothar Wolleh 007.jpg](https://commons.wikimedia.org/wiki/File:Second_Vatican_Council_by_Lothar_Wolleh_007.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Lothar Wolleh | 2012-06-03 / 2012-07-02 23:46:30 | 1328 × 1328 | staende |
- Nr 1: beskrivning: Second Vatican Council · kategorier: 1960s photographs of the Vatican City; Apse of Saint Peter's Basilica; Crossing of Saint Peter's Basilica; Historical images of Saint Peter's Basilica - interior; Second Vatican Council; Works by Lothar Wolleh
- Nr 2: beskrivning: Council bishops on Saint Peter's Square (1962, Italy) · kategorier: 1960s photographs of the Vatican City; 1962 in Rome; Eastern Catholic bishops; October 1962 in Italy; People in Saint Peter's Square; Roman Catholic mitres
- Nr 3: beskrivning: Second Vatican Council · kategorier: Eastern Catholic bishops; Second Vatican Council; Works by Lothar Wolleh

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 19. `stockholmskonferensen-1972`: FN:s miljökonferens i Stockholm (1972, Stockholm, Sverige)

Wikidata: [Q1781365](https://www.wikidata.org/wiki/Q1781365). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:UN-environment-in-Stockholm-1972.jpg](https://commons.wikimedia.org/wiki/File:UN-environment-in-Stockholm-1972.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Anonymous Unknown author / Pressens Bild | Taken on 4 June 1972 / 2023-03-01 15:59:31 | 1920 × 1205 | ur-sokning |
| 2 | [File:Riksdag.ipred b9dn510 4451.jpg](https://commons.wikimedia.org/wiki/File:Riksdag.ipred_b9dn510_4451.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Janwikifoto | 2009-02-25 / 2011-01-29 10:14:11 | 3028 × 2002 | ur-sokning |
| 3 | [File:Medaille raesaenen 037 01a kleiner.jpg](https://commons.wikimedia.org/wiki/File:Medaille_raesaenen_037_01a_kleiner.jpg) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Dietrich.Klose | 1972 / 2011-11-10 13:39:05 | 531 × 532 | smal, staende, ur-sokning |
- Nr 1: beskrivning: Photograph of members of the United Nations Conference on the Human Environment (1972) on bicycles in Stockholm. In the middle, chairman Maurice Strong. · kategorier: Cycling people in Sweden; Maurice Strong; United Nations Conference on the Human Environment
- Nr 2: beskrivning: Swedish Parliament, voting for the Ipred law · kategorier: Assembly hall of the Riksdag
- Nr 3: beskrivning: Kauko Räsänen (born 1926), Medal for the United Nations Conference on the Human Environment, Stockholm 1972, Avers: Female head. · kategorier: Medals in the Staatliche Münzsammlung; United Nations Environment Programme

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 20. `danmark-gar-med-i-eg`: Danmark går med i EG (1973, Danmark (markören i Köpenhamn))

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Securing Our Future (EC pic) 2025-03-02-15-13.jpg](https://commons.wikimedia.org/wiki/File:Securing_Our_Future_(EC_pic)_2025-03-02-15-13.jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: flagga CC BY 4.0 – API:et säger "CC BY 4.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Christophe Licoppe, © European Union, 2025 | 2025-03-02 / 2025-03-02 17:50:12 | 5717 × 3811 | ur-sokning, licens-flagga |
| 2 | [File:Securing Our Future London Summit participants on 2 March 2025.jpg](https://commons.wikimedia.org/wiki/File:Securing_Our_Future_London_Summit_participants_on_2_March_2025.jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: flagga CC BY 4.0 – API:et säger "CC BY 4.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Christophe Licoppe, © European Union, 2025 | 2025-03-02 / 2025-03-03 19:39:37 | 3577 × 2684 | ur-sokning, licens-flagga |
| 3 | [File:New Year's Greetings from President of Ukraine Volodymyr Zelenskyy in Kyiv, Ukraine on 31 December 2024.jpg](https://commons.wikimedia.org/wiki/File:New_Year%27s_Greetings_from_President_of_Ukraine_Volodymyr_Zelenskyy_in_Kyiv,_Ukraine_on_31_December_2024.jpg) | commons-sok | CC0 (trolig); filsidan: godkand CC0 | President Of Ukraine from Україна | 2024-12-31 20:36 / 2025-01-01 05:20:53 | 2422 × 1817 | ur-sokning |
- Nr 1: beskrivning: The Prime Minister of the United Kingdom, Kier Starmer, welcomed Italy's Prime Minister Giorgia Meloni to Downing Street, before being joined at the summit in central London by the leaders of Ukraine, France, Germany, D… · kategorier: Alexander Stubb in 2025; António Costa in 2025; Coalition of the willing (Ukraine); Dick Schoof in 2025; Donald Tusk in March 2025; Donald Tusk in the United Kingdom
- Nr 2: beskrivning: The Prime Minister of the United Kingdom, Kier Starmer, welcomed Italy's Prime Minister Giorgia Meloni to Downing Street, before being joined at the summit in central London by the leaders of Ukraine, France, Germany, D… · kategorier: Alexander Stubb in 2025; António Costa in 2025; Dick Schoof in 2025; Donald Tusk in March 2025; Donald Tusk in the United Kingdom; Emmanuel Macron in March 2025
- Nr 3: beskrivning: Dear People! Behind me stands Mother Ukraine. Ukraine that stands firmly on its feet, does not bow its head, looks ahead, believes in its future and victory over all the evil that Russia has brought us. Ukraine that is… · kategorier: December 2024 in Kyiv; Mother Ukraine; Night in Kyiv; Photographs of national flags in Ukraine; Searchlight beams; Volodymyr Zelenskyy in December 2024

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 21. `esa-bildas`: Europeiska rymdorganisationen ESA bildas (1975, Paris, Frankrike (ESA:s huvudkontor))

Wikidata: [Q42262](https://www.wikidata.org/wiki/Q42262). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:ESA Headquarters in Paris.jpg](https://commons.wikimedia.org/wiki/File:ESA_Headquarters_in_Paris.jpg) | wikidata-P18 | CC BY-SA 3.0 igo (trolig); filsidan: flagga CC BY-SA 3.0 IGO – API:et säger "CC BY-SA 3.0 igo" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | ESA/P. Sebirot, CC BY-SA 3.0 IGO | 2023-11-23 / 2025-03-21 13:35:04 | 5000 × 3712 | licens-flagga |
- Nr 1: beskrivning: ESA Headquarters in Paris, France, European Union, is located in the 15th Arrondissement · kategorier: European Space Agency; European Space Agency Headquarters

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `arrhenius-koldioxid-och-temperatur`: Arrhenius räknar på koldioxid och jordens temperatur (1896)
- `einsteins-artiklar-1905`: Einsteins fyra artiklar (1905)
- `allman-rostratt-for-man-1911`: Första valet med allmän rösträtt för män (1911)
- `wegener-kontinentaldriften`: Wegener lägger fram kontinentaldriften (1912)
- `kvinnlig-rostratt-danmark-1915`: Kvinnor får rösträtt till riksdagen i Danmark (1915)
- `kvinnor-rostar-1921`: Kvinnor röstar för första gången till riksdagen (1921)
- `abd-el-krim-ger-upp`: Abd el-Krim ger upp (1926)
- `toussaint-rouge`: FLN inleder upproret (Toussaint Rouge) (1954)
- `philippeville-1955`: Augustoffensiven vid Philippeville (1955)
- `majkrisen-1958`: Kuppen i Alger fäller fjärde republiken (1958)
- `ipcc-bildas`: FN:s klimatpanel IPCC bildas (1988)
- `sametinget-inrattas`: Sametinget i Sverige inrättas (1993)

## Val 2026-11-26 (#2088 och #2089)

13 av 40 händelser fick bild; 2 har en utsedd kandidat som inte kunde hämtas (`europa-7-ej-hamtade.txt`). Filsidorna öppnades via `action=raw` (verktygets licenskontroll och egen läsning) och bilderna granskades visuellt i en kontaktbild. Wikimedia svarade ofta med HTTP 429, så många sökningar gav inget.

- Avvisat efter att filsidan öppnats: `armeniska-folkmordet` (bilden visar dödade), `andra-vatikankonciliet` (första kandidaten Konzilseroeffnung 2.jpg har osäker proveniens: "eget foto" av en bild från 1962; Lothar Wollehs foto valdes i stället), `stockholmskonferensen-1972` (licensosäkerhet för ett pressfoto från 1972).
- Händelserna `versaillesfreden`, `rifkriget`, `gulag`, `holodomor`, `saltsjobadsavtalet`, `pragvaren` och `tjernobylkatastrofen` saknades i den automatiska listan (de har `start` i stället för `year`) och söktes manuellt.
- Licensval: inga dubbellicenser; Tjernobylbilden kommer från IAEA:s Flickr (CC BY-SA 2.0, granskad) men filsidan anger också "Copyright IAEA Imagebank" och en ukrainsk förening som källa, så upphovet flaggas.
- Egen sökning: `versaillesfreden`, `wegener-kontinentaldriften`, `rifrepubliken-utropas`, `arrhenius-koldioxid-och-temperatur`, `rifkriget`, `gulag`, `saltsjobadsavtalet`, `holodomor`, `tjernobylkatastrofen`, `einsteins-artiklar-1905`, `lego-grundas`, `de-forsta-nobelprisen`.
