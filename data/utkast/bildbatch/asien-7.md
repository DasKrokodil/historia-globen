# Granskningslista för bildomgång asien-7

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=35 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 35. **Med minst en användbar kandidat:** 30. **Utan kandidat:** 5.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `asien-7-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/asien-7-lista.txt`.

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

## 1. `belagringen-av-cawnpore`: Belägringen av Cawnpore (1857, Cawnpore (i dag Kanpur), vid Ganges)

Wikidata: [Q627881](https://www.wikidata.org/wiki/Q627881). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Massacre in the boats off Cawnpore - The history of the Indian Mutiny (1858-1859), opposite 336 - BL.jpg](https://commons.wikimedia.org/wiki/File:Massacre_in_the_boats_off_Cawnpore_-_The_history_of_the_Indian_Mutiny_(1858-1859),_opposite_336_-_BL.jpg) | wikidata-P18 | CC0 (trolig); filsidan: godkand CC0 | Charles Ball | 1858 date QS:P571,+1858-00-00T00:00:00Z/9 / 2014-03-05 03:18:00 | 1470 × 1057 | – |
- Nr 1: beskrivning: A contemporary engraving of the massacre at the Satichaura Ghat on 27 June 1857 following the Siege of Cawnpore during the 1857 Indian rebellion . · kategorier: Images released by British Library Images Online, March 2014; Massacre Ghat; Massacres in art; Siege of Cawnpore; The history of the Indian Mutiny, Volume I (CH. Bell)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `belagringen-av-lucknow`: Belägringen av Lucknow (1857, Residenset i Lucknow, Awadh)

Wikidata: [Q815165](https://www.wikidata.org/wiki/Q815165). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The Relief of Lucknow.jpg](https://commons.wikimedia.org/wiki/File:The_Relief_of_Lucknow.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Thomas J. Barker | circa 1914 date QS:P,+1914-00-00T00:00:00Z/9,P1480,Q5727902 / 2012-04-05 14:44:27 | 777 × 394 | konstverk, smal |
- Nr 1: beskrivning: "The Relief of Lucknow," by Thomas J. Barker; a print from c.1914 · kategorier: Siege of Lucknow; Thomas Jones Barker

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `indiska-upproret-1857`: Indiska upproret 1857 (1857, Norra och mellersta Indien (började i Meerut))

Wikidata: [Q129864](https://www.wikidata.org/wiki/Q129864). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Indian Rebellion of 1857.jpg](https://commons.wikimedia.org/wiki/File:Indian_Rebellion_of_1857.jpg) | wikidata-P18 | Public domain (trolig); filsidan: flagga Public domain – licensmallen (action=raw) kunde inte hämtas, så API:ets licens är inte korskontrollerad; licensmallen (action=raw) ej hämtad: HTTP 429 efter 3 försök | Unknown author Unknown author Cambridge University Press; Stanford's Geogl. Estabt.. | 1912 / 2012-09-11 15:35:47 | 1959 × 1647 | karta, licens-flagga |
- Nr 1: beskrivning: Map, "North India: The Mutiny 1857-9" from "The Cambridge Modern History Atlas". Cambridge University Press; London. 1912. Editors were Sir Adolphus William Ward ( †1924 ), G.W. Prothero ( †1922 ), and Sir Stanley Morda… · kategorier: 1850s maps of India; Cambridge Modern History Atlas; Maps of the Indian Rebellion of 1857; Old maps of North India

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `myteriet-i-meerut`: Myteriet i Meerut (1857, Meerut, cirka 65 km nordost om Delhi)

Wikidata: [Q120262092](https://www.wikidata.org/wiki/Q120262092). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The death of Colonel Finnis on the parade ground at Meerut.jpg](https://commons.wikimedia.org/wiki/File:The_death_of_Colonel_Finnis_on_the_parade_ground_at_Meerut.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 18 July 1857 date QS:P571,+1857-07-18T00:00:00Z/11 / 2019-09-20 20:47:50 | 797 × 600 | smal |
- Nr 1: beskrivning: The Death of Colonel Finnis on the Parade Ground at Meerut. Illustration for The Illustrated Times, 18 July 1857. Colonel John Finnis, 11th Regiment, Bengal Army. Colonel Finnis was shot off his horse, and fell dead to… · kategorier: 1857 engravings; 1857 in India; 1857 in Meerut; Death in art; Engravings of men of India; History of Meerut

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `belagringen-av-jhansi`: Belägringen av Jhansi (1858, Jhansi, Bundelkhand)

Wikidata: [Q16034303](https://www.wikidata.org/wiki/Q16034303). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Defeat of the Peshwa's army before Jhansi.jpg](https://commons.wikimedia.org/wiki/File:Defeat_of_the_Peshwa%27s_army_before_Jhansi.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Anonymous Unknown author | 1858 / 2021-06-11 17:02:11 | 1397 × 1143 | – |
- Nr 1: beskrivning: Defeat of the Peshwa's army before Jhansi · kategorier: Nana Sahib; Siege of Jhansi; The history of the Indian Mutiny (1858) by Charles Ball

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `slaget-vid-anqing`: Belägringen av Anqing (1860, Anqing, Anhui)

Wikidata: [Q10946696](https://www.wikidata.org/wiki/Q10946696). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Regaining the Provincial City Anqing2.jpg](https://commons.wikimedia.org/wiki/File:Regaining_the_Provincial_City_Anqing2.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Wu Youru | 1886 / 2010-05-14 03:35:00 | 1024 × 595 | – |
- Nr 1: beskrivning: A scene of the Taiping Rebellion, 1850-1864 · kategorier: Paintings of the Qing Dynasty; Taiping Rebellion; Wu Youru

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `slaget-vid-shanghai-1861`: Striderna om Shanghai (1861, Shanghai med omgivningar)

Wikidata: [Q3493762](https://www.wikidata.org/wiki/Q3493762). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Why the Fighting in Shanghai 7.png](https://commons.wikimedia.org/wiki/File:Why_the_Fighting_in_Shanghai_7.png) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1937 / 2025-11-14 23:04:16 | 9703 × 6879 | ur-sokning |
| 2 | [File:Why the Fighting in Shanghai 4.png](https://commons.wikimedia.org/wiki/File:Why_the_Fighting_in_Shanghai_4.png) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1937 / 2025-11-14 23:04:12 | 9693 × 6851 | ur-sokning |
| 3 | [File:Why the Fighting in Shanghai 3.png](https://commons.wikimedia.org/wiki/File:Why_the_Fighting_in_Shanghai_3.png) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1937 / 2025-11-14 23:04:12 | 10679 × 6941 | ur-sokning |
- Nr 1: beskrivning: Why the Fighting in Shanghai 7 · kategorier: Battle of Shanghai
- Nr 2: beskrivning: Why the Fighting in Shanghai 4 · kategorier: Battle of Shanghai
- Nr 3: beskrivning: Why the Fighting in Shanghai 3 · kategorier: Battle of Shanghai

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `tredje-slaget-vid-nanjing`: Nanjing faller (1864, Nanjing, Kina)

Wikidata: [Q7784779](https://www.wikidata.org/wiki/Q7784779). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Third Battle of Nanking.jpg](https://commons.wikimedia.org/wiki/File:Third_Battle_of_Nanking.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown 19th century | 2021-04-30 / 2021-04-30 05:03:25 | 538 × 388 | nutida-foto, smal |
- Nr 1: beskrivning: Qing Troops reclaiming back Nanking. · kategorier: Taiping Rebellion

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `muhammad-ahmad-utropar-sig-till-mahdi`: Muhammad Ahmad utropar sig till Mahdi (1881, Sudan; hans anhängare samlades på ön Aba i Vita Nilen)

Wikidata: [Q298678](https://www.wikidata.org/wiki/Q298678). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `islamisk`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Muhammad Ahmad al-Mahdi.jpg](https://commons.wikimedia.org/wiki/File:Muhammad_Ahmad_al-Mahdi.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | – / 2019-02-10 11:27:21 | 724 × 928 | datum-osakert, smal, staende |
- Nr 1: kategorier: Messianism; Muhammad Ahmad

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `bac-ninh-falttaget`: Fälttåget mot Bắc Ninh (1884, Bắc Ninh i norra Vietnam)

Wikidata: [Q4141584](https://www.wikidata.org/wiki/Q4141584). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Prise de Bac-Ninh.jpg](https://commons.wikimedia.org/wiki/File:Prise_de_Bac-Ninh.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Images d'Epinal | 1884 / 2010-06-13 18:01:29 | 416 × 255 | smal |
- Nr 1: beskrivning: Capture of Bac Ninh during the Tonkin campaign · kategorier: Bac-Ninh campaign; Images d'Épinal

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `forsta-italiensk-etiopiska-kriget`: Första italiensk-etiopiska kriget (1895, Italienska Eritrea och Etiopien (började vid Coatit i dagens Eritrea))

Wikidata: [Q989115](https://www.wikidata.org/wiki/Q989115). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `etiopien`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ethiopia Italia war-2.JPG](https://commons.wikimedia.org/wiki/File:Ethiopia_Italia_war-2.JPG) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Ethiopia_Italia_war.JPG : * Mekele_1896.jpg : Unknown but died more than 70 years ago In_Vista_Di_Massaua.jpg : Unknown but obviously died more than 70 years ago Ebalgume.jpg : Unknown but obviously died more than 70 years ago Prisonniers_italiens_en_Abyssinie-2.jpg : * Prisonniers_italiens_en_Abyssinie.jpg : Le Petit Journal - F. Méaulle, scan by Vob08 derivative work: Zheim ( talk ) Menelik_-_Adoua-2.jpg : * Menelik_-_Adoua.jpg : Le Petit Journal - F. Méaulle, scan by Vob08 derivative work: Zheim ( talk ) Ras_Mekonnen_Amba_Alage_2.jpg : Le Petit Journal - F. Méaulle derivative work: Vob08 ( talk ) improved colors: Zheim ( talk ) | 2010-03-07 12:27 / 2010-03-07 12:29:57 | 1379 × 2237 | nutida-foto, staende |
- Nr 1: beskrivning: Page from old french newspaper "Le Petit Journal" depicting Ras Mekonnen at the battle of Amba Alage - Detail · kategorier: First Italo-Ethiopian War

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `slaget-vid-amba-alagi-1895`: Etiopisk seger vid Amba Alagi (1895, Amba Alagi i södra Tigray, Etiopien)

Wikidata: [Q1398069](https://www.wikidata.org/wiki/Q1398069). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `etiopien`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ras Mekonnen Amba Alage-2.jpg](https://commons.wikimedia.org/wiki/File:Ras_Mekonnen_Amba_Alage-2.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand-med-not Public domain – GFDL anges också (dubbellicens) | Ras_Mekonnen_Amba_Alage.jpg : Le Petit Journal - F. Méaulle derivative work: Zheim ( talk ) | 2010-03-06 15:07 / 2010-03-06 15:08:56 | 3492 × 5077 | nutida-foto, staende |
- Nr 1: beskrivning: Page from old french newspaper "Le Petit Journal" depicting Ras Mekonnen at the battle of Amba Alage · kategorier: 1895 Le Petit Journal; Battle of Amba Alagi; Colored engravings; Engravings by Fortuné Méaulle; Ras Makonnen

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `slaget-vid-coatit`: Slaget vid Coatit (1895, Coatit (Quatit), Italienska Eritrea, i dag Eritrea)

Wikidata: [Q2888324](https://www.wikidata.org/wiki/Q2888324). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `etiopien`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Capitano Federico Ciccodicola.jpg](https://commons.wikimedia.org/wiki/File:Capitano_Federico_Ciccodicola.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1889 / 2013-02-01 11:31:05 | 2177 × 1333 | – |
- Nr 1: beskrivning: Fotografia di mia proprietà · kategorier: Cannone da 75B Montagne; Colonialism of Italy; Federico Ciccodicola; Italian occupation of Eritrea; Luigi Naretti; People of Italy in 1889

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `belagringen-av-mekelle`: Belägringen av Mekelle (1896, Mekelle, Tigray, Etiopien)

Wikidata: [Q2237609](https://www.wikidata.org/wiki/Q2237609). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `etiopien`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Mekele 1896.jpg](https://commons.wikimedia.org/wiki/File:Mekele_1896.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown but died more than 70 years ago | 1896 / 2009-11-03 22:22:01 | 687 × 499 | smal |
- Nr 1: beskrivning: The fort of Mekele in 1896, Ethiopian Empire · kategorier: Battle of Macallè; Yohannes IV Palace in Mek'ele

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `slaget-vid-quingua`: Slaget vid Quingua (1899, Quingua, i dag Plaridel, i provinsen Bulacan, Filippinerna)

Wikidata: [Q4872146](https://www.wikidata.org/wiki/Q4872146). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `1800-tal`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Battle of Quingua.jpg](https://commons.wikimedia.org/wiki/File:Battle_of_Quingua.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand-med-not Public domain – risk: public domain bara i USA (pd-us): kontrollera att verket först publicerades i USA, eller vad som gäller i ursprungslandet | Kurz & Allison | 2008-04-14 / 2024-12-30 09:17:34 | 8227 × 5882 | nutida-foto, licens-risk |
- Nr 1: beskrivning: Kurz & Allison print of the Battle of Quingua, April 23, 1899 · kategorier: 1899 in art; American Colonialism in art; Battle of Quingua; Kurz and Allison; Paintings of flags of the Philippines; Paintings of flags of the United States · licensrisk: public domain bara i USA (pd-us): kontrollera att verket först publicerades i USA, eller vad som gäller i ursprungslandet

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 16. `rysk-japanska-kriget`: Rysk-japanska kriget (1904, Manchuriet, Korea, Gula havet och Japanska havet (markören vid Port Arthur, i dagens Lüshunkou, där kriget började))

Wikidata: [Q159950](https://www.wikidata.org/wiki/Q159950). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `kina-tusch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:RUSSOJAPANESEWARIMAGE.jpg](https://commons.wikimedia.org/wiki/File:RUSSOJAPANESEWARIMAGE.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Original uploader and author was Dustandshadow at en.wikipedia | 22 July 2007 (original upload date) / 2024-12-11 05:33:15 | 655 × 916 | smal, staende |
- Nr 1: beskrivning: Russo-Japanese War montage · kategorier: Battle of the Yellow Sea - Russian forces; Pallada (ship, 1899); Pallada class cruiser; Protected cruisers of the Imperial Japanese Navy; Russo-Japanese War photography; Ships built in 1899

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 17. `raja-harishchandra-har-premiar`: Raja Harishchandra, Indiens första långfilm (1913, Bombay (Mumbai), Indien)

Wikidata: [Q2985396](https://www.wikidata.org/wiki/Q2985396). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Publicity poster for film, Raja Harishchandra (1913).jpg](https://commons.wikimedia.org/wiki/File:Publicity_poster_for_film,_Raja_Harishchandra_(1913).jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Dadasaheb Phalke | 1913 / 2008-08-22 14:32:13 | 256 × 390 | smal, staende |
- Nr 1: beskrivning: Publicity poster for film, Raja Harishchandra (1913), India's first full length completely indeginously made, feature film. · kategorier: Film posters of India; Posters of Maharashtra; Raja Harishchandra

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 18. `tutankhamons-grav-hittas`: Tutankhamons grav hittas (1922, Konungarnas dal, Egypten)

Wikidata: [Q835309](https://www.wikidata.org/wiki/Q835309). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Inside Pharaoh Tutankhamun's tomb, 18th dynasty.jpg](https://commons.wikimedia.org/wiki/File:Inside_Pharaoh_Tutankhamun%27s_tomb,_18th_dynasty.jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | EditorfromMars | 2016-05-20 10:07:55 / 2020-08-19 05:42:40 | 3264 × 2448 | – |
- Nr 1: beskrivning: Inside Pharaoh Tutankhamun's tomb, 18th dynasty · kategorier: KV62; Sarcophagus of Tutankhamun

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 19. `andra-kinesisk-japanska-kriget`: Andra kinesisk-japanska kriget (1937, Kina, Burma, Korea, Indokina och Taiwan (markören vid Marco Polo-bron nära Peking, där kriget började))

Wikidata: [Q170314](https://www.wikidata.org/wiki/Q170314). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Japanese Occupation of China 1940.svg](https://commons.wikimedia.org/wiki/File:Japanese_Occupation_of_China_1940.svg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | File:Japanese_Occupation_-_Map.jpg : original File:OcupaciónJaponesaDeChina1940.svg : Rowanwindwhistler ( talk ) "Turned into SVG and translated into Spanish." Odie5533 "Translated back into English" | 2012-11-13 20:23:39 / 2012-11-14 02:25:58 | 1119 × 857 | karta |
- Nr 1: beskrivning: Japanese Occupation of China in 1940. Translated back to English from the Spanish svg. · kategorier: English-language SVG maps of the history of China; Maps of the Second Sino-Japanese War; Maps showing 1940; Occupation of China by Japan; SVG maps of the Republic of China (1912–1949); SVG maps of the history of China

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 20. `rabindranath-tagore-dor-1941`: Rabindranath Tagore dör (1941, Jorasanko Thakur Bari, Tagorefamiljens hus i Calcutta, Brittiska Indien)

Wikidata: [Q7241](https://www.wikidata.org/wiki/Q7241). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Rabindranath Tagore in 1909.jpg](https://commons.wikimedia.org/wiki/File:Rabindranath_Tagore_in_1909.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Generalstabens litografiska anstalt | 1909 / 2018-05-13 11:10:03 | 1071 × 1500 | staende |
- Nr 1: beskrivning: Rabindranath Tagore in Kolkata . · kategorier: Men with beards; Portraits of Rabindranath Tagore; Rabindranath Tagore in 1909; Rabindranath Tagore with long beard

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 21. `svalten-i-henan-1942`: Svälten i Henan (1942, Provinsen Henan, Kina)

Wikidata: [Q11141749](https://www.wikidata.org/wiki/Q11141749). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Agsphoto 11239 full.jpg](https://commons.wikimedia.org/wiki/File:Agsphoto_11239_full.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Harrison Forman | 1943-01-01 / 2023-03-05 00:35:26 | 3645 × 5453 | staende, ur-sokning |
- Nr 1: beskrivning: Great Honan [Henan] famine. Famine victim crazed with hunger gnaws bark from tree. China. · kategorier: 1943 in China

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 22. `svalten-i-bengalen-1943`: Svälten i Bengalen (1943, Provinsen Bengalen i Brittiska Indien (dagens Bangladesh och Västbengalen); många sökte hjälp i Calcutta)

Wikidata: [Q522837](https://www.wikidata.org/wiki/Q522837). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:FatherSonCowRummagingFoodBengalFamine1943.jpg](https://commons.wikimedia.org/wiki/File:FatherSonCowRummagingFoodBengalFamine1943.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Kalyani Bhattacharyee, and Sj. Manoj Sarbadhikar, Servants of Bengal Society, at 153/3N, Upper Circular Road, Calcutta; All Rights Reserved. First edition 1944. Printed by Manindra Chandra Dutta at Sabita Press, 18-B, Shamacharan De Street, Calcutta. See also World Cat Catalog entry | 1944-11-22 / 2018-02-01 18:47:18 | 2257 × 1681 | – |
| 2 | [File:MotherWithShredsOfClothingAndChildCalcutta1943.jpg](https://commons.wikimedia.org/wiki/File:MotherWithShredsOfClothingAndChildCalcutta1943.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Kalyani Bhattacharyee, and Sj. Manoj Sarbadhikar, Servants of Bengal Society, at 153/3N, Upper Circular Road, Calcutta; All Rights Reserved. First edition 1944. Printed by Manindra Chandra Dutta at Sabita Press, 18-B, Shamacharan De Street, Calcutta. See also World Cat Catalog entry | 1944-11-22 / 2018-02-01 18:45:57 | 960 × 1287 | staende |
| 3 | [File:Bengal famine 1943 photo.jpg](https://commons.wikimedia.org/wiki/File:Bengal_famine_1943_photo.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1943 / 2012-06-14 21:39:58 | 763 × 571 | smal |
- Nr 1: beskrivning: A father, his young son, and a cow rummaging for scraps of food on the street during the Bengal famine 1943. The photo caption says, "destitute peasants lived on scrappings from drains. Bad food killed lakhs of people." · kategorier: 1943 Bengal famine; Bengal Speaks edited by Kalyani Bhattacharyee
- Nr 2: beskrivning: Mother in shreds of clothing with child begging on the streets of Calcutta during the Bengal famine of 1943 · kategorier: 1943 Bengal famine; Bengal Speaks edited by Kalyani Bhattacharyee; Kolkata in the 1940s; Mothers and children in India
- Nr 3: beskrivning: Bengali famine 1943 · kategorier: 1943 Bengal famine; Dog health; Dogs in West Bengal; Emaciation; Victims of British Imperialism

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 23. `tata-institutet-grundas-1945`: Tata-institutet för grundforskning grundas (1945, Indian Institute of Science, Bangalore, Brittiska Indien (flyttade till Bombay samma år))

Wikidata: [Q142617](https://www.wikidata.org/wiki/Q142617). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Tifr main.jpg](https://commons.wikimedia.org/wiki/File:Tifr_main.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Annytifr | 2007-10-23 / 2007-10-24 21:34:39 | 1600 × 1200 | – |
- Nr 1: beskrivning: tifr picture · kategorier: Tata Institute of Fundamental Research

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 24. `vietnams-sjalvstandighetsforklaring-1945`: Ho Chi Minh utropar Vietnams självständighet (1945, Ba Đình-torget, Hanoi, Vietnam)

Wikidata: [Q1925172](https://www.wikidata.org/wiki/Q1925172). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Bản Tuyên ngôn độc lập của nước Việt Nam Dân chủ Cộng hòa. - Trung tâm Lưu trữ quốc gia III. Phông Phủ Thủ tướng, hồ sơ 586, tờ số 1 – 3.jpg](https://commons.wikimedia.org/wiki/File:B%E1%BA%A3n_Tuy%C3%AAn_ng%C3%B4n_%C4%91%E1%BB%99c_l%E1%BA%ADp_c%E1%BB%A7a_n%C6%B0%E1%BB%9Bc_Vi%E1%BB%87t_Nam_D%C3%A2n_ch%E1%BB%A7_C%E1%BB%99ng_h%C3%B2a._-_Trung_t%C3%A2m_L%C6%B0u_tr%E1%BB%AF_qu%E1%BB%91c_gia_III._Ph%C3%B4ng_Ph%E1%BB%A7_Th%E1%BB%A7_t%C6%B0%E1%BB%9Bng,_h%E1%BB%93_s%C6%A1_586,_t%E1%BB%9D_s%E1%BB%91_1_%E2%80%93_3.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | The government of Vietnam. | 2020-08-14 18:57:43 / 2021-04-18 16:08:32 | 6896 × 2924 | – |
- Nr 1: beskrivning: A file from the Cục Văn thư và Lưu trữ nhà nước related to the August Revolution at the end of World War II (two). · kategorier: Declaration of Independence of the Democratic Republic of Vietnam

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 25. `arabisk-israeliska-kriget-1948`: Arabisk-israeliska kriget 1948 (1948, Det tidigare brittiska mandatet Palestina, Sinaihalvön och södra Libanon)

Wikidata: [Q49092](https://www.wikidata.org/wiki/Q49092). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:1948 Arab Israeli War - May 15-June 10.svg](https://commons.wikimedia.org/wiki/File:1948_Arab_Israeli_War_-_May_15-June_10.svg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Mr. Edward J. Krasnoborski and Mr. Frank Martini, Department of History, U.S. Military Academy Honza.havlicek ( talk ) | 2009-11-20 15:17 / 2023-10-12 03:34:51 | 904 × 884 | karta, staende |
- Nr 1: beskrivning: Map depicting military operations from 15th May 1948 to 10th June 1948 during Israeli War of Independence . Symbols used in the map are NATO military symbols . · kategorier: Maps of the 1948 Arab-Israeli War

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 26. `lydda-och-ramle-1948`: Fördrivningen från Lydda och Ramle (1948, Lydda (Lod) och Ramle)

Wikidata: [Q774054](https://www.wikidata.org/wiki/Q774054). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Israei soldiers in Ramle during 1948 Palestine war.webp](https://commons.wikimedia.org/wiki/File:Israei_soldiers_in_Ramle_during_1948_Palestine_war.webp) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1948 / 2024-10-22 04:18:46 | 1028 × 834 | ur-sokning |
| 2 | [File:1948 Arab-Israeli War 997008137024705171.jpg](https://commons.wikimedia.org/wiki/File:1948_Arab-Israeli_War_997008137024705171.jpg) | commons-sok | CC BY 4.0 (trolig); filsidan: flagga CC BY 4.0 – API:et säger "CC BY 4.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Benno Rothenberg | Taken on 10 July 1948 / 2022-01-08 21:03:04 | 1484 × 924 | ur-sokning, licens-flagga |
| 3 | [File:Palestinians in Ramle 1948.jpg](https://commons.wikimedia.org/wiki/File:Palestinians_in_Ramle_1948.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Eldad David | 1948 / 2024-10-20 18:32:41 | 720 × 480 | smal, ur-sokning |
- Nr 1: beskrivning: Description from source: "Troops of the nascent Israeli army in Ramle during the War of Independence. Credit: Bettmann Archive / GETTY IMAGES" · kategorier: 1948 Palestine war; 1948 Palestinian exodus from Lydda and Ramle; Nakba
- Nr 2: beskrivning: 1948 Arab-Israeli War, Ramla · kategorier: 1948 Palestinian exodus from Lydda and Ramle; 1948 Palestinian expulsion and flight; Meitar Collection; Meitar Collection (review needed); Photographs by Benno Rothenberg; Prisoners of war in the 1948 Arab–Israeli War
- Nr 3: beskrivning: Description from source: "Palestinians in the city of Ramle surrender to Israeli forces during 1948 war. (Eldad David/GPO)" · kategorier: 1948 Palestine war; 1948 Palestinian exodus from Lydda and Ramle; Nakba

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 27. `operation-yoav`: Operation Yoav i Negev (1948, Negevöknen)

Wikidata: [Q2890420](https://www.wikidata.org/wiki/Q2890420). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Beersheba 1948.jpg](https://commons.wikimedia.org/wiki/File:Beersheba_1948.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Hugo Mendelson | 1948-10-20 / 2020-02-16 07:00:46 | 3072 × 2048 | – |
- Nr 1: beskrivning: Israeli soldiers capturing Beersheba , 1948 · kategorier: 1948 in Beersheba; Historical images of the soldiers of the Israel Defense Forces; M3 halftracks in Israeli service; Operation Yoav; Photographs by Hugo Mendelson; Piper J-3 (Israeli Air Force)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 28. `striderna-vid-latrun-1948`: Striderna vid Latrun (1948, Latrun, vid vägen mellan Tel Aviv och Jerusalem)

Wikidata: [Q2096397](https://www.wikidata.org/wiki/Q2096397). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Latrun-Police-Building.jpg](https://commons.wikimedia.org/wiki/File:Latrun-Police-Building.jpg) | wikidata-P18 | CC BY 2.5 (trolig); filsidan: godkand-med-not CC BY 2.5 – flera licenser: CC BY-SA 3.0, CC BY 2.5; GFDL anges också (dubbellicens) | No machine-readable author provided. Bukvoed assumed (based on copyright claims). | 12 November 2005 (according to Exif data) / 2022-06-12 13:40:04 | 1296 × 972 | – |
- Nr 1: beskrivning: Former police building in Latrun, Israel. Now part of the Armored Corps Museum (Yad la-Shiryon). 2005. · kategorier: Buildings with flags in Israel; Latrun fort

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 29. `folkrepubliken-kina-utropas`: Folkrepubliken Kina utropas (1949, Tiananmen, Peking, Kina)

Wikidata: [Q10872057](https://www.wikidata.org/wiki/Q10872057). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:1996 -247-15a Beijing Tiananmen Gate (5068462443).jpg](https://commons.wikimedia.org/wiki/File:1996_-247-15a_Beijing_Tiananmen_Gate_(5068462443).jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Dan Lundberg | 2009-10-17 15:25 / 2019-04-27 04:10:22 | 1698 × 1007 | ur-sokning |
| 2 | [File:1996 -247-8a Beijing Tiananmen Square (5068460547).jpg](https://commons.wikimedia.org/wiki/File:1996_-247-8a_Beijing_Tiananmen_Square_(5068460547).jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Dan Lundberg | 2009-10-17 15:18 / 2019-04-27 04:10:17 | 1625 × 956 | ur-sokning |
| 3 | [File:Mao proclaiming establishment of PRC.jpg](https://commons.wikimedia.org/wiki/File:Mao_proclaiming_establishment_of_PRC.jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Unknown author Unknown author | 1949-10-01 / 2012-08-19 10:16:42 | 423 × 540 | smal, staende, ur-sokning |
- Nr 1: beskrivning: The Tiananmen, the “Gate of Heavenly Peace” which leads to the Forbidden City, forms the northern boundary of Tiananmen Square. The gate was built in the 15th century and restored in the 17th century. On October 1, 1949… · kategorier: 1996 in Beijing; Changhe CH-Series; FAW Tianjin Xiali; Jinghua BK6141; Taxis in Beijing; Tiananmen
- Nr 2: beskrivning: The Tiananmen, the “Gate of Heavenly Peace” which leads to the Forbidden City, forms the northern boundary of Tiananmen Square. The gate was built in the 15th century and restored in the 17th century. On October 1, 1949… · kategorier: 1996 in Beijing
- Nr 3: beskrivning: A retouched picture released by the Chinese official news agency showing the Chairman Mao Zedong ( ) proclaiming 01 October 1949 at the rostrum of Tiananmen Square in Beijing the establishment of the People's Republic o… · kategorier: 2 men; Dong Biwu; Founding Ceremony of People's Republic of China; Mao Zedong in 1949; Men with microphones in China; Microphones in 1949

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 30. `operation-uvda`: Operation Uvda: krigets sista fälttåg (1949, Umm Rashrash (dagens Eilat) vid Röda havet)

Wikidata: [Q931576](https://www.wikidata.org/wiki/Q931576). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `affisch`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Raising the Ink Flag at Umm Rashrash (Eilat).jpg](https://commons.wikimedia.org/wiki/File:Raising_the_Ink_Flag_at_Umm_Rashrash_(Eilat).jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: flagga CC BY-SA 3.0 – API:et säger "CC BY-SA 3.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Micha Perry | Taken on 10 March 1949 / 2015-03-15 08:45:53 | 1844 × 2821 | staende, licens-flagga |
- Nr 1: beskrivning: The ink-drawn national flag of Israel flies at Um Rashrash (now Eilat) across the Gulf of Aqaba on the northern tip of the Red Sea. · kategorier: Avraham Adan in 1949; Black and white photographs of Israel; Denison smock in Israeli service; Eilat in the 1940s; Historical images of the soldiers of the Israel Defense Forces; IDF in 1949

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `slaget-vid-gwalior-1858`: Slaget vid Gwalior och Rani Lakshmibais död (1858)
- `ross-malaria-myggan`: Ross hittar malariaparasiten i en mygga (1897)
- `bose-statistiken`: Bose räknar ljusets kvanta på ett nytt sätt (1924)
- `yukawas-mesonteori`: Yukawa förutsäger mesonen (1935)
- `lahoreresolutionen-1940`: Lahoreresolutionen kräver egna muslimska stater (1940)

## Val 2026-11-26 (#2068 och #2069)

10 av 40 händelser fick bild; 1 har en utsedd kandidat som inte kunde hämtas (`asien-7-ej-hamtade.txt`). Filsidorna öppnades via `action=raw` och bilderna granskades visuellt i en kontaktbild.

- Avvisat eller avstått efter att filsidan öppnats eller bilden setts: `belagringen-av-cawnpore` (gravyr av mord på kvinnor och barn), `svalten-i-henan-1942` och `svalten-i-bengalen-1943` (foton av utsvultna människor), `nanjingmassakern` (massmord), `ross-malaria-myggan` (licensen kunde inte avgöras), `bose-statistiken` (svag proveniens), `lydda-och-ramle-1948` (perspektiv), `operation-uvda` (licensflagga).
- Latrun: tre licenser anges på filsidan (GFDL, CC BY-SA 3.0, CC BY 2.5); verktyget valde CC BY 2.5, men den strängare CC BY-SA 3.0 används i data, källpost och bildtext.
- Händelserna `tianjingincidenten`, `boxarupproret`, `ramaneffekten`, `nanjingmassakern` och `koreakriget` saknades i den automatiska listan (de har `start` i stället för `year`); `koreakriget` lades in manuellt efter egen sökning.
- Egen sökning: `koreakriget`, `ross-malaria-myggan`, `bose-statistiken`, `yukawas-mesonteori`, `boxarupproret`, `tianjingincidenten`.

- Senare avstått: `operation-yoav` (Beersheba 1948.jpg, PD-Israel). Fotot är fritt enligt israelisk lag men kan fortfarande vara skyddat i USA (URAA); bilden togs bort ur omgången före ihopslagning.
