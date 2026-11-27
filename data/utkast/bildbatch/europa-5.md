# Granskningslista för bildomgång europa-5

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=37 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 37. **Med minst en användbar kandidat:** 26. **Utan kandidat:** 11.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `europa-5-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/europa-5-lista.txt`.

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

## 1. `slaget-vid-guadalete`: Slaget vid Guadalete (711, Södra Spanien (den exakta platsen är okänd))

Wikidata: [Q504172](https://www.wikidata.org/wiki/Q504172). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `tidig-medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The battle of Guadelete.jpg](https://commons.wikimedia.org/wiki/File:The_battle_of_Guadelete.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Salvador Martínez Cubells | Unknown date / 2012-02-13 19:50:33 | 2832 × 2088 | – |
| 2 | [File:Mariano Barbasán - Batalla de Guadalete.jpg](https://commons.wikimedia.org/wiki/File:Mariano_Barbas%C3%A1n_-_Batalla_de_Guadalete.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Mariano Barbasán Lagueruela | 1882 date QS:P571,+1882-00-00T00:00:00Z/9 / 2013-04-28 12:21:04 | 3200 × 1381 | – |
- Nr 1: beskrivning: The battle of Guadalete - as imagined some 1200 years later by the spanish painter Martinez Cubells (1845-1914). The details depicts the commencement of the Goths' retreat in the face of Tarik's Berber cavalry. · kategorier: Battle of Guadalete; Paintings in the Royal Academy of Fine Arts of San Fernando; Salvador Martínez Cubells; Spain in history paintings
- Nr 2: kategorier: 1882 paintings in Spain; 19th-century paintings of cavalry in battle; Battle of Guadalete; Paintings by Mariano Barbasán; Spain in history paintings

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `slaget-vid-zab`: Slaget vid Zab: umayyaderna faller (750, Vid floden Stora Zab, i dagens Irak)

Wikidata: [Q289492](https://www.wikidata.org/wiki/Q289492). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `islamisk`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Battle of Al-Zāb.jpg](https://commons.wikimedia.org/wiki/File:Battle_of_Al-Z%C4%81b.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Unknown author | 1962 / 2020-10-03 17:16:34 | 1220 × 941 | – |
- Nr 1: beskrivning: Battle of the Great Zāb River between the Umayyads and the Abbasids. · kategorier: Battle of the Zab; Illustrations from Al-Musawwar fi al-Tarikh

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `glagolitiska-alfabetet`: Kyrillos, Methodios och det glagolitiska alfabetet (862, Stormähren (i dag Tjeckien och Slovakien))

Wikidata: [Q145625](https://www.wikidata.org/wiki/Q145625). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `tidig-medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Tabla Za Dicu 03.jpg](https://commons.wikimedia.org/wiki/File:Tabla_Za_Dicu_03.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand-med-not Public domain – flera licenser: CC0, Public domain | Trubar, Primož [editor] Anton Dalmatin [translator] Consul, Stephan [translator] | 1561 / 2022-08-30 22:40:48 | 1334 × 1879 | staende |
| 2 | [File:Bascanska ploca.jpg](https://commons.wikimedia.org/wiki/File:Bascanska_ploca.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | – / 2005-09-29 15:38:13 | 900 × 509 | datum-osakert |
| 3 | [File:ZografskiyKodeks.png](https://commons.wikimedia.org/wiki/File:ZografskiyKodeks.png) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Anonymous Unknown author | 10-11 centuries/siècles/века / 2006-09-13 13:17:59 | 415 × 580 | smal, staende |
- Nr 1: beskrivning: Edne malahne knižice ... / Abecedarium, Und der gantze Catechißmus ohne außlegung in der Crobatischen Sprach. Personen:Trubar, Primož [Verfasser]. Ort(e):Tübingen. Signatur:Ck XII 61 · kategorier: Glagolitic alphabet charts; Glagolitic inscriptions in Germany; Primož Trubar typography in Tübingen; Tabla Za Dicu
- Nr 2: kategorier: Baška tablet
- Nr 3: beskrivning: The first page of the Gospel of John from Codex Zographensis · kategorier: Codex Zographensis; Gospel of John - Chapter 1

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `lund-grundas`: Lund grundas (1000, Lund, Skåne)

Wikidata: [Q2167](https://www.wikidata.org/wiki/Q2167). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `tidig-medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Stortorget lund 080508.jpg](https://commons.wikimedia.org/wiki/File:Stortorget_lund_080508.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Anton Holmquist Soasta | 2008-05-08 / 2008-05-08 18:09:55 | 3872 × 2321 | nutida-foto |
- Nr 1: beskrivning: Stortorget i Lund · kategorier: 2008 in Lund; Stortorget, Lund; Sydsvenska bankens byggnad, Lund

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `slaget-vid-stiklestad`: Slaget vid Stiklestad (1030, Stiklestad i Verdal, Trøndelag, Norge)

Wikidata: [Q830878](https://www.wikidata.org/wiki/Q830878). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Stiklestad.jpeg](https://commons.wikimedia.org/wiki/File:Stiklestad.jpeg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Peter Nicolai Arbo | 1859 date QS:P571,+1859-00-00T00:00:00Z/9 / 2014-10-18 13:03:24 | 1677 × 1108 | – |
| 2 | [File:Sivlesteinen-Stalheim.JPG](https://commons.wikimedia.org/wiki/File:Sivlesteinen-Stalheim.JPG) | wikidata-P18 | CC BY 2.5 (trolig); filsidan: godkand-med-not CC BY 2.5 – flera licenser: CC BY-SA 3.0, CC BY 2.5; GFDL anges också (dubbellicens) | Frode Inge Helland | 2004-05-20 / 2007-04-14 11:31:37 | 1793 × 2534 | nutida-foto, staende |
- Nr 1: beskrivning: Tore Hund, at right, spears Olaf at the battle of Stiklestad · kategorier: 1859 paintings from Norway; 19th-century paintings of battles; Battle of Stiklestad; Norway in history paintings; Olaf II of Norway in paintings; Paintings by Peter Nicolai Arbo
- Nr 2: beskrivning: Per Sivle Memorial stone, Stalheim, Voss municipality, Hordaland county. · kategorier: May 2004 in Norway; Sivlesteinen

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `slaget-vid-hastings`: Slaget vid Hastings (1066, Battle nära Hastings, England)

Wikidata: [Q83224](https://www.wikidata.org/wiki/Q83224). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Bayeux Tapestry scene57 Harold death.jpg](https://commons.wikimedia.org/wiki/File:Bayeux_Tapestry_scene57_Harold_death.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand-med-not Public domain – risk: "eget verk" av en bild daterad 1070: kontrollera vem som tog eller gjorde originalet | Myrabella | 1070s date QS:P,+1070-00-00T00:00:00Z/8 - Photograph: 2013-03-07 / 2013-04-15 21:58:13 | 2948 × 2568 | licens-risk |
- Nr 1: beskrivning: Bayeux Tapestry - Scene 57: the death of King Harold at the Battle of Hastings . Titulus: HIC HAROLD REX INTERFECTUS EST (Here King Harold is slain) · kategorier: Animals depicted on the Bayeux Tapestry; Bayeux Tapestry (scenes 50-58); Dying men in art; Harold II of England in tapestry; Horses in embroidery; Latin inscriptions in art · licensrisk: "eget verk" av en bild daterad 1070: kontrollera vem som tog eller gjorde originalet

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `kyrkomotet-i-clermont`: Påven Urban II kallar till korståg i Clermont (1095, Clermont, Auvergne (dagens Clermont-Ferrand, Frankrike))

Wikidata: [Q49964](https://www.wikidata.org/wiki/Q49964). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Passages d'outremer Fr5594, fol. 19r, Concile de Clermont.jpg](https://commons.wikimedia.org/wiki/File:Passages_d%27outremer_Fr5594,_fol._19r,_Concile_de_Clermont.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Jean Colombe | circa 1474 date QS:P571,+1474-00-00T00:00:00Z/9,P1480,Q5727902 / 2024-01-16 11:09:43 | 3163 × 4748 | staende |
- Nr 1: beskrivning: Miniature: Pope Urban II preaching at the Council of Clermont. Sébastien Mamerot, Les passages d'outremer · kategorier: 15th-century men of France; Crowds in France; Historical images of Puy-de-Dôme; History of Clermont-Ferrand; Interiors of churches in Puy-de-Dôme; Passage outremer

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `lund-blir-arkebiskopssate`: Lund blir ärkebiskopssäte för hela Norden (1103, Lund, Skåne)

Wikidata: [Q2860113](https://www.wikidata.org/wiki/Q2860113). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Lunds domkyrka1.jpeg](https://commons.wikimedia.org/wiki/File:Lunds_domkyrka1.jpeg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Kallekn | 2007-11-02 / 2008-05-16 23:57:21 | 3072 × 2304 | nutida-foto |
- Nr 1: beskrivning: Lunds domkyrka · kategorier: Churches in Sweden photographed in 2007; Façade and towers of Lunds domkyrka

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `koret-i-saint-denis`: Koret i Saint-Denis, den första gotiska byggnaden (1140, Saint-Denis, norr om Paris, Frankrike)

Wikidata: [Q184407](https://www.wikidata.org/wiki/Q184407). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Basilique St Denis façade ouest St Denis Seine St Denis 20.jpg](https://commons.wikimedia.org/wiki/File:Basilique_St_Denis_fa%C3%A7ade_ouest_St_Denis_Seine_St_Denis_20.jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Chabe01 | 2020-05-26 17:31:42 / 2020-05-26 19:06:08 | 3521 × 5520 | nutida-foto, staende |
- Nr 1: beskrivning: West facade of the Basilique Saint-Denis in Saint-Denis, Seine-Saint-Denis, France. · kategorier: May 2020 in Saint-Denis (Seine-Saint-Denis); West facade of Basilique Saint-Denis

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `belagringen-av-edessa-1144`: Edessa faller (1144, Edessa (dagens Şanlıurfa, Turkiet))

Wikidata: [Q2083368](https://www.wikidata.org/wiki/Q2083368). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Urfacastle.jpg](https://commons.wikimedia.org/wiki/File:Urfacastle.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | No machine-readable author provided. Gerry Lynch~commonswiki assumed (based on copyright claims). | 24 August 2005 (original upload date) / 2005-08-24 20:50:23 | 879 × 527 | nutida-foto |
| 2 | [File:The Crusader States in 1135.svg](https://commons.wikimedia.org/wiki/File:The_Crusader_States_in_1135.svg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Amitchell125 | 2021-04-18 / 2024-09-08 12:27:42 | 966 × 1322 | karta, nutida-foto, staende |
- Nr 1: beskrivning: Urfa Castle in South Eastern Turkey, whose towering columns were built by the Romans. (C) Gerry Lynch, 2003. · kategorier: 2003 photographs of Turkey; Urfa Castle Corinthian columns
- Nr 2: beskrivning: The Crusader States in 1135 · kategorier: English-language SVG maps showing history; Maps of the Crusader states in 1135; Multilingual SVG with Catalan language (ca) option; Multilingual SVG with Indonesian language (id) option; Multilingual SVG with Korean lan…

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `tornet-i-pisa-grundlaggs`: Grunden till tornet i Pisa läggs (1173, Pisa, republiken Pisa (i dag Italien))

Wikidata: [Q39054](https://www.wikidata.org/wiki/Q39054). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Campanile Dôme - Pise (IT52) - 2022-08-31 - 20.jpg](https://commons.wikimedia.org/wiki/File:Campanile_D%C3%B4me_-_Pise_(IT52)_-_2022-08-31_-_20.jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Chabe01 | 2022-08-31 19:11:32 / 2022-09-05 13:12:43 | 2601 × 5767 | nutida-foto, staende |
- Nr 1: beskrivning: Leaning Tower of Pisa, Italy. · kategorier: August 2022 in Pisa; Church towers in Italy photographed in 2022; Exterior of the Leaning Tower (Pisa)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `plundringen-av-konstantinopel-1204`: Fjärde korståget plundrar Konstantinopel (1204, Konstantinopel (dagens Istanbul, Turkiet))

Wikidata: [Q1750892](https://www.wikidata.org/wiki/Q1750892). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `miniatyr`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:PriseDeConstantinople1204PalmaLeJeune.JPG](https://commons.wikimedia.org/wiki/File:PriseDeConstantinople1204PalmaLeJeune.JPG) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Palma Le Jeune (1544–1620) | – / 2007-11-17 09:27:03 | 1160 × 985 | datum-osakert |
- Nr 1: beskrivning: The Taking of Constantinople · kategorier: Byzantine Empire in history paintings; Fall of Constantinople (1204)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `slaget-vid-kalka`: Slaget vid Kalka (1223, Floden Kalka, dagens Ukraina)

Wikidata: [Q570204](https://www.wikidata.org/wiki/Q570204). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Битва на Калке.png](https://commons.wikimedia.org/wiki/File:%D0%91%D0%B8%D1%82%D0%B2%D0%B0_%D0%BD%D0%B0_%D0%9A%D0%B0%D0%BB%D0%BA%D0%B5.png) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Anonymous Russian manuscript illuminators, 1560-1570s Facial Chronicle (Illustrated Chronicle of Ivan the Terrible) (in 10 volumes: pdf , pdf with translation ) Public domain image | 1568 / 2024-03-11 07:01:17 | 1200 × 2298 | staende |
- Nr 1: beskrivning: Battle of Kalka · kategorier: Battle of the Kalka River; Facial Chronicle (v.5) - Laptevskiy tom (1116-1252); Facial Chronicle miniatures (all); Mongols in Facial Chronicle

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `jyske-lov`: Jyske lov ges i Vordingborg (1241, Vordingborg, Själland, Danmark)

Wikidata: [Q658209](https://www.wikidata.org/wiki/Q658209). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Codex Holmiensis CE 1350.jpg](https://commons.wikimedia.org/wiki/File:Codex_Holmiensis_CE_1350.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain |  | – / 2018-04-08 00:26:08 | 385 × 384 | datum-osakert, smal, staende |
- Nr 1: kategorier: Codex Holmiensis

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `slaget-vid-mohi`: Slaget vid Mohi (1241, Muhi vid floden Sajó, Ungern)

Wikidata: [Q705874](https://www.wikidata.org/wiki/Q705874). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Battle of Mohi 1241.PNG](https://commons.wikimedia.org/wiki/File:Battle_of_Mohi_1241.PNG) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Anonymous illumination | 13 th century date QS:P,+1250-00-00T00:00:00Z/7 / 2022-04-11 09:33:44 | 1738 × 1055 | – |
| 2 | [File:Battle of Muhi.jpg](https://commons.wikimedia.org/wiki/File:Battle_of_Muhi.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) |  | – / 2006-08-05 15:58:55 | 624 × 491 | karta, datum-osakert, smal |
| 3 | [File:Batalla de mohi.jpg](https://commons.wikimedia.org/wiki/File:Batalla_de_mohi.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | No machine-readable author provided. Tibicena~commonswiki assumed (based on copyright claims). | 14 August 2006 (original upload date) / 2006-08-14 02:00:37 | 478 × 263 | karta, nutida-foto, smal |
- Nr 1: beskrivning: Miniture from a copy of Hayton of Corycus 's La Flor des estoires de la terre d'Orient in the Austrian National Library , illustrating his account of the Battle of Mohi in 1241 between Hungarians and Mongols and the pur… · kategorier: Armenian kings in art; Armenian nobility in art; Battle of Mohi; Great helms in art; Hayton of Corycus; Hungary in history paintings
- Nr 2: kategorier: Battle of Mohi; Maps of battles of Hungary
- Nr 3: beskrivning: Esquema de la Batalla de Mohi. · kategorier: Battle of Mohi; Maps of battles of Hungary

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 16. `florinen-praglas`: Florens präglar guldmyntet florin (1252, Florens, republiken Florens (i dag Italien))

Wikidata: [Q650702](https://www.wikidata.org/wiki/Q650702). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Fiorino d'oro.jpg](https://commons.wikimedia.org/wiki/File:Fiorino_d%27oro.jpg) | wikidata-P18 | CC BY-SA 2.5 (trolig); filsidan: flagga CC BY-SA 2.5 – API:et säger "CC BY-SA 2.5" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | CNG | 2019-11-23 15:54:27 / 2023-01-03 13:50:46 | 1600 × 796 | nutida-foto, licens-flagga |
- Nr 1: beskrivning: ITALY, Firenze. Repubblica. 1189-1532. AV Fiorino d’oro (20mm, 3.56 g, 3h). Series III, Type C. Segno: pyramid of three pellets. Struck 1252-1267. + FLOR ENTIA, large ornate lily / (triple pellets) S : IOHA NNES • B •,… · kategorier: Fiorino

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 17. `stockholm-namns-1252`: Stockholm nämns första gången i skrift (1252, Stockholm, Sverige)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Letter signed Sara, London, to (Ernst Filsinger), Stockholm, September 18, 1923 - DPLA - cfc5f32c3d747a4e06370d01a5421541 (page 2).jpg](https://commons.wikimedia.org/wiki/File:Letter_signed_Sara,_London,_to_(Ernst_Filsinger),_Stockholm,_September_18,_1923_-_DPLA_-_cfc5f32c3d747a4e06370d01a5421541_(page_2).jpg) | commons-sok | Public domain (trolig); filsidan: flagga Public domain – API:et säger "Public domain" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Teasdale, Sara, 1884-1933 | – / 2025-01-18 20:20:43 | 2000 × 1308 | datum-osakert, ur-sokning, licens-flagga |
| 2 | [File:Letter signed Sara, London, to (Ernst Filsinger), Stockholm, September 18, 1923 - DPLA - cfc5f32c3d747a4e06370d01a5421541 (page 3).jpg](https://commons.wikimedia.org/wiki/File:Letter_signed_Sara,_London,_to_(Ernst_Filsinger),_Stockholm,_September_18,_1923_-_DPLA_-_cfc5f32c3d747a4e06370d01a5421541_(page_3).jpg) | commons-sok | Public domain (trolig); filsidan: flagga Public domain – API:et säger "Public domain" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Teasdale, Sara, 1884-1933 | – / 2025-01-18 20:20:48 | 1541 × 2000 | datum-osakert, staende, ur-sokning, licens-flagga |
| 3 | [File:Letter signed Sara, London, to (Ernst Filsinger), Stockholm, September 18, 1923 - DPLA - cfc5f32c3d747a4e06370d01a5421541 (page 5).jpg](https://commons.wikimedia.org/wiki/File:Letter_signed_Sara,_London,_to_(Ernst_Filsinger),_Stockholm,_September_18,_1923_-_DPLA_-_cfc5f32c3d747a4e06370d01a5421541_(page_5).jpg) | commons-sok | Public domain (trolig); filsidan: flagga Public domain – API:et säger "Public domain" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Teasdale, Sara, 1884-1933 | – / 2025-01-18 20:20:54 | 1528 × 2000 | datum-osakert, staende, ur-sokning, licens-flagga |
- Nr 1: beskrivning: Mentions not receiving his salary checks in the mail. Includes envelope. Transcription: The American Women's Club. 46, Grosvenor Street. W.1. Letter No. 18. 33. Sept. 18, '23. Your cable just rec'd. Have plenty of money… · kategorier: Letters by Sara Teasdale
- Nr 2: beskrivning: Mentions not receiving his salary checks in the mail. Includes envelope. Transcription: The American Women's Club. 46, Grosvenor Street. W.1. Letter No. 18. 33. Sept. 18, '23. Your cable just rec'd. Have plenty of money… · kategorier: Letters by Sara Teasdale
- Nr 3: beskrivning: Mentions not receiving his salary checks in the mail. Includes envelope. Transcription: The American Women's Club. 46, Grosvenor Street. W.1. Letter No. 18. 33. Sept. 18, '23. Your cable just rec'd. Have plenty of money… · kategorier: Letters by Sara Teasdale

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 18. `giottos-fresker-i-padua`: Giottos fresker i Scrovegnikapellet (1305, Scrovegnikapellet, Padua, Italien)

Wikidata: [Q963954](https://www.wikidata.org/wiki/Q963954). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:La Cappella degli Scrovegni.JPG](https://commons.wikimedia.org/wiki/File:La_Cappella_degli_Scrovegni.JPG) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | Andrea Piroddi | 3 July 2007 (2 September 2007, according to Exif data) / 2008-02-05 16:42:28 | 2548 × 1891 | nutida-foto |
- Nr 1: beskrivning: The building of the Cappella degli Scrovegni (Scrovegni chaple) in Padua, Italy. · kategorier: Cappella degli Scrovegni (Padua) - Building

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 19. `paven-flyttar-till-avignon`: Påvarna flyttar till Avignon (1309, Avignon (då i kungariket Arles i Tysk-romerska riket, i dag Frankrike))

Wikidata: [Q202558](https://www.wikidata.org/wiki/Q202558). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Façade du Palais des Papes.jpg](https://commons.wikimedia.org/wiki/File:Fa%C3%A7ade_du_Palais_des_Papes.jpg) | wikidata-P18 | CC BY-SA 2.0 fr (trolig); filsidan: godkand CC BY-SA 2.0 FR | Chimigi | 2005-04-03 / 2006-11-28 12:40:57 | 969 × 730 | nutida-foto |
- Nr 1: beskrivning: Front of Pope's Palace in Avignon . · kategorier: Main facade of Palais des Papes d'Avignon

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 20. `stora-svalten-1315`: Den stora svälten i Europa (1315, Stora delar av Europa, österut till Polen och söderut till Alperna)

Wikidata: [Q1988505](https://www.wikidata.org/wiki/Q1988505). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Great famine.jpg](https://commons.wikimedia.org/wiki/File:Great_famine.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand-med-not Public domain – risk: "eget verk" av en bild daterad 1315: kontrollera vem som tog eller gjorde originalet | Scanned (by me) from the cover of The Great Famine (1996) by William Chester Jordan. Original cover art from a photograph courtesy of Stiftung Weimarer Klassik, Herzogin Anna Amalia Bibliothek. | 1315—1317 / 2006-02-21 11:34:44 | 1060 × 1540 | staende, licens-risk |
- Nr 1: beskrivning: From the Apocalypse in a Biblia Pauperum illuminated at Erfurt around the time of the Great Famine of 1315–1317 . Death ("Mors") sits astride a lion whose long tail ends in a ball of flame (Hell). Famine ("Fames") point… · kategorier: 14th-century illuminated manuscripts; Biblia pauperum; Book of Revelation in 14th-century art; Book of Revelation in miniatures; Crowned lions; Facing right in art works · licensrisk: "eget verk" av en bild daterad 1315: kontrollera vem som tog eller gjorde originalet

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 21. `jordbavningen-i-basel-1356`: Jordbävningen i Basel (1356, Basel, Tysk-romerska riket (i dag Schweiz))

Wikidata: [Q672705](https://www.wikidata.org/wiki/Q672705). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Erdbeben Basel Jauslin.JPG](https://commons.wikimedia.org/wiki/File:Erdbeben_Basel_Jauslin.JPG) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Karl Jauslin | – / 2008-04-14 16:53:51 | 2720 × 2048 | datum-osakert |
- Nr 1: beskrivning: Basel earthquake envisioned by the painter Karl Jauslin . · kategorier: 1356 Basel earthquake; 19th-century paintings; Earthquakes in art; Karl Jauslin; Paintings of Basel

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 22. `ibn-khalduns-muqaddima`: Ibn Khaldun skriver Muqaddiman (1377, Qalʿat ibn Salama, i dagens Algeriet)

Wikidata: [Q1259616](https://www.wikidata.org/wiki/Q1259616). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `islamisk`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:La Muqaddima d'Ibn Khaldoun.jpg](https://commons.wikimedia.org/wiki/File:La_Muqaddima_d%27Ibn_Khaldoun.jpg) | wikidata-P18 | CC BY 4.0 (trolig); filsidan: godkand CC BY 4.0 | Riad Salih | 2024-11-07 11:04:12 / 2024-11-07 10:09:29 | 1630 × 2012 | nutida-foto, staende |
- Nr 1: beskrivning: The Muqaddimah of Ibn Khaldun · kategorier: Arabic-language book covers; Muqaddima

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 23. `uret-i-salisbury`: Uret i Salisburys katedral (1386, Salisburys katedral, England)

Wikidata: [Q7404840](https://www.wikidata.org/wiki/Q7404840). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Salisbury Cathedral, medieval clock.JPG](https://commons.wikimedia.org/wiki/File:Salisbury_Cathedral,_medieval_clock.JPG) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Rwendland | 2012-09-22 14:59:48 / 2021-05-08 10:33:04 | 2405 × 3591 | nutida-foto, staende |
- Nr 1: beskrivning: Medieval clock in Salisbury Cathedral, operating a bell in the tower. Supposedly dating from about 1386, restored 1956. · kategorier: Salisbury Cathedral clock

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 24. `kalmarunionen-bildas`: Kalmarunionen: Danmark, Norge och Sverige får en gemensam kung (1397, Kalmar, Sverige)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `medeltid`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Castle Château Kalmar Suède Sweden - photo picture image photography (9586502122).jpg](https://commons.wikimedia.org/wiki/File:Castle_Ch%C3%A2teau_Kalmar_Su%C3%A8de_Sweden_-_photo_picture_image_photography_(9586502122).jpg) | commons-sok | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Grand Parc - Bordeaux, France from France | 2013-08-11 14:59 / 2014-12-15 20:58:32 | 5616 × 3744 | nutida-foto, ur-sokning |
- Nr 1: beskrivning: Kalmar Castle is a fortified castle in Kalmar, on the Strait of Kalmar in south-eastern Sweden. History: The castle was first built by King Magnus Ladulås. It was later upgraded to the time of the Vasa by Eric XIV and h… · kategorier: 2013 in Kalmar; Kalmar slott

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 25. `uppsala-universitet-grundas`: Uppsala universitet grundas (1477, Uppsala, Sverige)

Wikidata: [Q185246](https://www.wikidata.org/wiki/Q185246). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Universitas Regia Upsaliensis.jpg](https://commons.wikimedia.org/wiki/File:Universitas_Regia_Upsaliensis.jpg) | wikidata-P18 | CC0 (trolig); filsidan: godkand CC0 | This image was produced by me, David Castor ( user:dcastor ). The pictures I submit to the Wikipedia Project are released to the public domain. This gives you the right to use them in any way you like, without any kind of notification. This said, I would still appreciate to be mentioned as the originator whenever you think it complies well with your use of the picture. A message to me about how it has been used would also be welcome. You are obviously not required to respond to these wishes of mine, just in a friendly manner encouraged to. (All my photos are placed in Category:Images by David Castor or a subcategory thereof.) | 2011-10-09 / 2011-11-05 23:18:35 | 3519 × 1479 | nutida-foto |
- Nr 1: beskrivning: Main building of Uppsala University. · kategorier: Universitetshuset, Uppsala

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 26. `kopenhamns-universitet-invigs`: Köpenhamns universitet invigs (1479, Köpenhamn, Danmark)

Wikidata: [Q186285](https://www.wikidata.org/wiki/Q186285). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `renassans`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:University Main Building.jpg](https://commons.wikimedia.org/wiki/File:University_Main_Building.jpg) | wikidata-P18 | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Mik Hartwell | 2009-02-27 / 2012-03-27 12:50:34 | 1024 × 474 | nutida-foto |
- Nr 1: beskrivning: Copenhagen University Main Building · kategorier: Københavns Universitet (Frue Plads)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `ribe-handelsplats`: Ribe anläggs som handelsplats (705)
- `skane-namns-forsta-gangen`: Skåne nämns för första gången (811)
- `ansgar-i-birka`: Ansgar predikar i Birka (829)
- `knut-blir-kung-av-england`: Knut den store blir kung över England (1016)
- `uppsala-blir-arkebiskopssate`: Uppsala blir ärkebiskopssäte för Sverige (1164)
- `absalons-borg-kopenhamn`: Absalon bygger en borg vid Havn, början på Köpenhamn (1167)
- `gerard-av-cremona-almagest`: Gerard av Cremona översätter Almagest till latin i Toledo (1175)
- `fibonaccis-liber-abaci`: Fibonaccis Liber Abaci för de arabiska siffrorna till Europa (1202)
- `skane-under-magnus-eriksson`: Skåne under den svenske kungen Magnus Eriksson (1332)
- `karantan-i-ragusa-1377`: Ragusa inför karantän mot pesten (1377)
- `brunelleschis-kupol`: Brunelleschis kupol byggs över domen i Florens (1420)

## Val 2026-11-26 (#2083 och #2084)

20 av 40 händelser fick bild (taket på 20 bilder per PR); 2 har en utsedd kandidat som inte kunde hämtas (`europa-5-ej-hamtade.txt`). Filsidorna kontrollerades via verktygets licenskontroll (`action=raw`) och bilderna granskades visuellt i en kontaktbild.

- Avvisat efter att filsidan öppnats eller bilden setts: `slaget-vid-zab` (svag proveniens), `slaget-vid-hastings` (licensrisk), `tornet-i-pisa-grundlaggs` (för smal bild), `florinen-praglas` (licensflagga), `stora-svalten-1315` (licensrisk och svält).
- Licensval: Jellingestenen, Lund, Lunds domkyrka och Giottos kapell har dubbellicens med GFDL (CC BY-SA 3.0 används); Avignon har CC BY-SA 2.0 FR (fransk portning); Glagolitiska alfabetet har både CC0 och PD-scan.
- Händelserna `jellingestenen`, `korstagen` och `tordesillasfordraget` saknades i den automatiska listan (de har `start` i stället för `year`); `jellingestenen` och `korstagen` söktes manuellt.
- Egen sökning: `jellingestenen`, `korstagen`, `fibonaccis-liber-abaci`, `tordesillasfordraget`, `brunelleschis-kupol`, `absalons-borg-kopenhamn`, `uppsala-blir-arkebiskopssate`.
