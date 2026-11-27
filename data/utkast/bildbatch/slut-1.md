# Granskningslista för bildomgång slut-1

> Skapad av `python3 tools/bildbatch.py` 2026-11-26 (ids=30 licens=strikt). FÖRSLAG, inte beslut: programmet väljer aldrig bild och skriver ingen bildtext. Öppna filsidan för den kandidat du väljer, kontrollera licensen och att bilden visar händelsen, och skriv motivet med bara det filsidan stöder (docs/bilder-riktiga.md). Appen läser inte den här filen.

**Händelser:** 30. **Med minst en användbar kandidat:** 26. **Utan kandidat:** 4.

**Gör så här:** fyll i "Vald" och "Motiv" för varje händelse (eller "ingen" med skäl), ta bort `#` på motsvarande rad i `slut-1-lista.txt` (byt fil om du valde en annan kandidat) och kör `python3 tools/bild_hamta.py --lista data/utkast/bildbatch/slut-1-lista.txt`.

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

## 1. `brasilia-invigs`: Brasília blir Brasiliens huvudstad (1960, Brasília, Brasilien)

Wikidata: [Q2844](https://www.wikidata.org/wiki/Q2844). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Planalto Central (cropped).jpg](https://commons.wikimedia.org/wiki/File:Planalto_Central_(cropped).jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Arturdiasr | 2015-03-29 11:30:21 / 2022-03-05 01:31:47 | 2733 × 1308 | konstverk |
- Nr 1: beskrivning: This is a photo of a monument in Brazil identified by the ID · kategorier: Clouds and blue sky in Brazil; Plano Piloto (administrative region); Views of Eixo Monumental from Torre de TV de Brasília southeastward

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 2. `jamaica-blir-sjalvstandigt`: Jamaica blir självständigt (1962, Kingston, Jamaica)

Wikidata: [Q17080530](https://www.wikidata.org/wiki/Q17080530). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Independence Proclamation of Jamaica.jpg](https://commons.wikimedia.org/wiki/File:Independence_Proclamation_of_Jamaica.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Royal Constitutional Convention of Queen Elizabeth II | 1962-08-06 / 2018-10-21 14:54:26 | 1000 × 600 | – |
- Nr 1: beskrivning: Independence Proclamation of Jamaica · kategorier: 1962-08-06; 1962 in Jamaica

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 3. `karnvapenproven-pa-moruroa`: Frankrikes kärnvapenprov på Moruroa (1966, Atollen Moruroa, Tuamotuöarna (Franska Polynesien))

Wikidata: [Q318446](https://www.wikidata.org/wiki/Q318446). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Moruroa 1971 bâche d'eau.jpg](https://commons.wikimedia.org/wiki/File:Moruroa_1971_b%C3%A2che_d%27eau.jpg) | wikidata-P18 | CC BY 3.0 (trolig); filsidan: godkand CC BY 3.0 | Gérard JOYON | 2005-12-16 / 2013-01-27 10:23:41 | 3360 × 2240 | – |
- Nr 1: beskrivning: Cette réserve d'eau nous servait pour la consommation. La centrale n'étant pas encore en fonction, c'était l'eau du lagon, passée par les bouilleurs de la marine, qui était contenue, en plein soleil dans ce réservoir. L… · kategorier: 1971 in France; Mururoa; Water towers in France; Water towers in Oceania

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 4. `cites-washingtonkonventionen`: CITES: avtalet mot handel med hotade arter (1973, Washington D.C., USA)

Wikidata: [Q191836](https://www.wikidata.org/wiki/Q191836). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Leopardenfelle 2001-01-110008.JPG](https://commons.wikimedia.org/wiki/File:Leopardenfelle_2001-01-110008.JPG) | wikidata-P18 | Public domain (trolig); filsidan: flagga Public domain – API:et säger "Public domain" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Kürschner ( talk ) 08:01, 12 February 2010 (UTC) | 2010-02-11 / 2010-02-12 08:20:41 | 2048 × 1536 | licens-flagga |
| 2 | [File:Indicaz etichetta cites.png](https://commons.wikimedia.org/wiki/File:Indicaz_etichetta_cites.png) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand-med-not CC BY-SA 4.0 – GFDL anges också (dubbellicens) | Mario Pazzaglia | 2016-11-29 / 2016-11-29 22:10:19 | 480 × 360 | smal |
- Nr 1: beskrivning: Leopard fur-skin, Stamp for CITES · kategorier: Convention on International Trade in Endangered Species of Wild Fauna and Flora; Furs in 2010; Leopard fur-skins
- Nr 2: beskrivning: explanation in italian Language of caviar label according Cites regulation · kategorier: Convention on International Trade in Endangered Species of Wild Fauna and Flora

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 5. `operation-condor`: Operation Condor (1975, Sydamerikas södra kon (markören i Santiago, Chile, där samarbetet bildades))

Wikidata: [Q156017](https://www.wikidata.org/wiki/Q156017). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Operation Condor participants.svg](https://commons.wikimedia.org/wiki/File:Operation_Condor_participants.svg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand CC BY-SA 3.0 | Sannita | 2012-02-16 / 2022-11-22 11:41:40 | 363 × 353 | karta, smal, staende |
- Nr 1: beskrivning: Map of the States that took part in Operation Condor . Green: main active members. Light green: less active members. Blue: United States (cooperation). · kategorier: Operation Condor

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 6. `ariane-1-forsta-uppskjutningen`: Den första Ariane-raketen skjuts upp (1979, Kourou, Franska Guyana)

Wikidata: [Q18375](https://www.wikidata.org/wiki/Q18375). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ariane 1 Le Bourget FRA 001.jpg](https://commons.wikimedia.org/wiki/File:Ariane_1_Le_Bourget_FRA_001.jpg) | wikidata-P18 | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – flera licenser: CC BY-SA 3.0, CC BY-SA 2.5; GFDL anges också (dubbellicens) | ignis | 8/Sep./2006 / 2006-10-27 21:58:01 | 2311 × 3471 | staende |
- Nr 1: beskrivning: A model of an European rocket Ariane 1 in the Museum of Air and Space (Musée de l'air et de l'espace, Le Bourget, France) · kategorier: Ariane 1 at the Musée de l'Air

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 7. `gronland-lamnar-eg`: Grönland lämnar EG (1982, Grönland)

Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:EUenl.gif](https://commons.wikimedia.org/wiki/File:EUenl.gif) | commons-sok | CC BY-SA 3.0 (trolig); filsidan: godkand-med-not CC BY-SA 3.0 – GFDL anges också (dubbellicens) | No machine-readable author provided. Roke~commonswiki assumed (based on copyright claims). | 2022 / 2007-05-26 02:35:42 | 262 × 160 | karta, smal, ur-sokning |
- Nr 1: beskrivning: Founding and enlarging the EU. Image made using the freely licenced maps at commons: EU-6 , EU-9 , EU-10 , EU-12 , EU-15 , EU-25 , EU-27 EU-28 · kategorier: Animated maps of the European Union; Maps of the enlargement of the European Union

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 8. `klimatkonventionen-rio-1992`: Klimatkonventionen undertecknas i Rio (1992, Rio de Janeiro, Brasilien)

Wikidata: [Q208645](https://www.wikidata.org/wiki/Q208645). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:2014-06-12 Altes Abgeordnetenhochhaus, Bonn IMG 5597.jpg](https://commons.wikimedia.org/wiki/File:2014-06-12_Altes_Abgeordnetenhochhaus,_Bonn_IMG_5597.jpg) | wikidata-P18 | CC BY-SA 3.0 de (trolig); filsidan: flagga CC BY-SA 3.0 DE – API:et säger "CC BY-SA 3.0 de" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Eckhard Henkel | 2014-06-12 / 2014-12-29 03:39:28 | 2179 × 1732 | licens-flagga |
- Nr 1: beskrivning: “Old highrise of members of parliament”, Platz der Vereinten Nationen 1, Bonn -Gronau; now used as office building by the secretary of the United Nations Framework Convention on Climate Change and part of the “UN-Campus” · kategorier: 2014 in Bonn; Altes Abgeordnetenhochhaus (Bonn); Außenthermometer (Altes Abgeordnetenhaus Bonn)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 9. `sverige-gar-med-i-eu`: Sverige blir medlem i EU (1995, Sverige)

Wikidata: [Q4590816](https://www.wikidata.org/wiki/Q4590816). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:EU15-1995 European Union map enlargement.svg](https://commons.wikimedia.org/wiki/File:EU15-1995_European_Union_map_enlargement.svg) | wikidata-P18 | CC BY-SA 2.5 (trolig); filsidan: godkand CC BY-SA 2.5 | Europe_countries.svg : Júlio Reis derivative work: Kolja21 ( talk ) | 2009-05-18 23:11 / 2014-02-01 10:13:43 | 680 × 520 | karta, smal |
- Nr 1: beskrivning: European Union (EU 15) · kategorier: SVG maps of the enlargement of the European Union; SVG maps of the history of the European Union

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 10. `skane-lan-bildas`: Skåne län bildas (1997, Skåne)

Wikidata: [Q103659](https://www.wikidata.org/wiki/Q103659). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:20200508 Radhus Skane Stora Torg Kristianstad 005 (49908236963).jpg](https://commons.wikimedia.org/wiki/File:20200508_Radhus_Skane_Stora_Torg_Kristianstad_005_(49908236963).jpg) | wikidata-P18 | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Johan Wessman / News Oresund | Taken on 8 May 2020, 11:34:06 (according to Exif data) / 2021-03-11 18:00:20 | 6000 × 4000 | – |
- Nr 1: beskrivning: Rådhus Skåne vid Stora Torg i Kristianstad. En gemensam byggnad för Kristianstads kommuns och Region Skånes centrala och politiska administrationer. Photo: News Øresund - Johan Wessman © News Øresund - Johan Wessman (CC… · kategorier: Foreground flowers in Europe; Kristianstads rådhus; Stora torg, Kristianstad

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 11. `euron-infors`: Euron införs (1999, Euroområdet (Europeiska centralbanken i Frankfurt, Tyskland))

Wikidata: [Q4916](https://www.wikidata.org/wiki/Q4916). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Euro coins and banknotes.jpg](https://commons.wikimedia.org/wiki/File:Euro_coins_and_banknotes.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | Avij ( talk · contribs ) | 2006-10-14 / 2006-10-28 14:40:55 | 2272 × 1704 | – |
| 2 | [File:Euro Series Banknotes (2019) - centered.png](https://commons.wikimedia.org/wiki/File:Euro_Series_Banknotes_(2019)_-_centered.png) | wikidata-P18 | ECB decisions ECB/2003/4 and ECB/2003/5 (flagga); filsidan: flagga – licensen kunde inte avgöras (inga igenkända licensmallar; API: "ECB decisions ECB/2003/4 and ECB/2003/5") | The RedBurn | 2026-04-22 / 2026-04-22 19:29:35 | 1280 × 959 | licens-flagga |
- Nr 1: beskrivning: A picture of some Euro banknotes and various Euro coins . · kategorier: Euro banknotes and coins; Euro coins (10 cents); Euro coins (1 euro); Euro coins (20 cents); Euro coins (2 euro); Euro coins (50 cents)
- Nr 2: beskrivning: Euro Banknotes Europa series as of 28th May 2019 · kategorier: Second series Euro banknotes

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 12. `oresundsbron-oppnas`: Öresundsförbindelsen öppnas (2000, Öresund mellan Malmö och Köpenhamn)

Wikidata: [Q297871](https://www.wikidata.org/wiki/Q297871). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Øresund Bridge from the air in September 2015.jpg](https://commons.wikimedia.org/wiki/File:%C3%98resund_Bridge_from_the_air_in_September_2015.jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Nick-D | 2015-09-28 12:16:29 / 2015-11-28 09:13:15 | 4000 × 3000 | – |
- Nr 1: beskrivning: Øresund Bridge viewed from a plane taking off from Copenhagen Airport · kategorier: Aerial photographs of Oresund Bridge; Peberholm; September 2015 Denmark photographs

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 13. `orkanen-katrina`: Orkanen Katrina (2005, New Orleans och Mexikanska golfens kust (USA))

Wikidata: [Q16422](https://www.wikidata.org/wiki/Q16422). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Katrina 2005-08-28 1700Z.jpg](https://commons.wikimedia.org/wiki/File:Katrina_2005-08-28_1700Z.jpg) | wikidata-P18 | Public domain (trolig); filsidan: godkand Public domain | NASA | 2005-08-28 / 2024-08-23 12:10:04 | 5400 × 7200 | staende |
- Nr 1: beskrivning: Hurricane Katrina on August 28, 2005 · kategorier: 250m-resolution MODIS images of tropical cyclones; Satellite pictures of Hurricane Katrina

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 14. `obama-valjs-till-president`: Barack Obama väljs till USA:s president (2008, USA (segertalet i Grant Park, Chicago))

Wikidata: [Q45578](https://www.wikidata.org/wiki/Q45578). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:CNT Staff Toast President-Elect Barack Obama (3214944005).jpg](https://commons.wikimedia.org/wiki/File:CNT_Staff_Toast_President-Elect_Barack_Obama_(3214944005).jpg) | commons-sok | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | Center for Neighborhood Technology from Chicago, USA | 2008-11-05 14:05 / 2024-12-22 12:22:01 | 1280 × 720 | ur-sokning |
| 2 | [File:Barack Obama meets with Donald Trump in the Oval Office (crop 1).jpg](https://commons.wikimedia.org/wiki/File:Barack_Obama_meets_with_Donald_Trump_in_the_Oval_Office_(crop_1).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Jesusemen Oni / VOA | 2016-11-10 / 2020-06-04 14:37:03 | 3451 × 1926 | ur-sokning |
| 3 | [File:Barack Obama meets with Donald Trump in the Oval Office (crop 2).jpg](https://commons.wikimedia.org/wiki/File:Barack_Obama_meets_with_Donald_Trump_in_the_Oval_Office_(crop_2).jpg) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Jesusemen Oni / VOA | 2016-11-10 / 2020-06-04 14:39:36 | 2361 × 1811 | ur-sokning |
- Nr 1: beskrivning: On November 5, CNT Staff gathered on our patio to toast the election of former CNT board member, Barack Obama. · kategorier: Barack Obama 2009 presidential inauguration; Barack Obama 2009 presidential inauguration images for SecretName101 to review
- Nr 2: beskrivning: President Barack Obama meets with President-elect Donald Trump at the White House, Nov. 10, 2016. (Photo: J. Oni / VOA) · kategorier: Barack Obama gesturing with hands; Bust of Martin Luther King, Jr. by Charles Alston; Donald Trump wearing red necktie; President Barack Obama meets with President-elect Donald Trump (November 10, 2016)
- Nr 3: beskrivning: President Barack Obama meets with President-elect Donald Trump at the White House, Nov. 10, 2016. (Photo: J. Oni / VOA) · kategorier: Barack Obama gesturing with hands; Bust of Martin Luther King, Jr. by Charles Alston; Donald Trump wearing red necktie; President Barack Obama meets with President-elect Donald Trump (November 10, 2016)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 15. `gruvarbetarna-i-copiapo-raddas`: De 33 gruvarbetarna i Chile räddas (2010, Gruvan San José nära Copiapó, Atacamaöknen, Chile)

Wikidata: [Q214790](https://www.wikidata.org/wiki/Q214790). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Mina San José de Copiapó en 2010.jpg](https://commons.wikimedia.org/wiki/File:Mina_San_Jos%C3%A9_de_Copiap%C3%B3_en_2010.jpg) | wikidata-P18 | CC BY-SA 2.0 (trolig); filsidan: godkand CC BY-SA 2.0 | desierto_atacama | 2010-08-10 15:24 / 2010-10-15 15:04:25 | 1024 × 768 | – |
- Nr 1: beskrivning: Mina San Josè, lugar de tragedia minera. 2010 · kategorier: 2010 Copiapó mining accident; Drilling rigs

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 16. `jordbavningen-i-haiti-2010`: Jordbävningen i Haiti (2010, Nära Léogâne, cirka 25 km väster om Port-au-Prince (Haiti))

Wikidata: [Q43777](https://www.wikidata.org/wiki/Q43777). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Ruins of Haiti National Palace - Port au Prince 2012.jpg](https://commons.wikimedia.org/wiki/File:Ruins_of_Haiti_National_Palace_-_Port_au_Prince_2012.jpg) | wikidata-P18 | CC BY 2.0 (trolig); filsidan: godkand CC BY 2.0 | Trocaire from Ireland | 2012-01-10 14:31 / 2013-04-14 00:07:28 | 4608 × 3072 | – |
- Nr 1: beskrivning: In January 2010 a massive earthquake struck Haiti, killing over 300,000 people and making 1.5 million people homeless. The disaster was the worst in the history of a country that has been ravaged by conflict and crisis.… · kategorier: 2010 Haiti earthquake damage in Port-au-Prince; National Palace (Haiti)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 17. `pavevalet-2013`: Franciskus väljs till den förste påven från Amerika (2013, Sixtinska kapellet, Vatikanstaten)

Wikidata: [Q4422669](https://www.wikidata.org/wiki/Q4422669). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Pope Francis in March 2013.jpg](https://commons.wikimedia.org/wiki/File:Pope_Francis_in_March_2013.jpg) | wikidata-P18 | CC BY-SA 2.0 (trolig); filsidan: flagga CC BY-SA 2.0 – API:et säger "CC BY-SA 2.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Casa Rosada | 2013-03-18 / 2025-02-27 13:30:09 | 996 × 996 | staende, licens-flagga |
- Nr 1: beskrivning: Pope Francis · kategorier: Franciscus in 2013; Portrait photographs of Franciscus; White zucchettos

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 18. `os-i-rio-2016`: Olympiska sommarspelen i Rio de Janeiro (2016, Rio de Janeiro, Brasilien (huvudarena Maracanã))

Wikidata: [Q8613](https://www.wikidata.org/wiki/Q8613). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Rio de Janeiro 2016 Committee in Geneva.jpg](https://commons.wikimedia.org/wiki/File:Rio_de_Janeiro_2016_Committee_in_Geneva.jpg) | wikidata-P18 | CC BY 3.0 br (trolig); filsidan: flagga CC BY 3.0 BR – API:et säger "CC BY 3.0 br" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Ricardo Stuckert/PR | 2009-06-15 / 2009-07-09 01:58:42 | 4018 × 3357 | licens-flagga |
- Nr 1: beskrivning: Genebra (Suíça) - O ministro do Esporte, Orlando Silva, o presidente Luiz Inácio Lula da Silva e o governador do Rio de Janeiro, Sérgio Cabral, defendem, em Genebra, a candidatura do Rio como sede das Olimpíadas de 2016. · kategorier: 2016 Summer Olympics logos and marketing; Luiz Inácio Lula da Silva in 2009; Orlando Silva (politician); Rio de Janeiro bid for the 2016 Summer Olympics

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 19. `belagringen-av-mariupol`: Belägringen av Mariupol (2022, Mariupol, Donetsk oblast, Ukraina)

Wikidata: [Q111017791](https://www.wikidata.org/wiki/Q111017791). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Russian bombing of Mariupol.jpg](https://commons.wikimedia.org/wiki/File:Russian_bombing_of_Mariupol.jpg) | wikidata-P18 | CC BY 4.0 (trolig); filsidan: flagga CC BY 4.0 – API:et säger "CC BY 4.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Міністерство внутрішніх справ України | 2022-03-03 / 2022-03-08 20:59:26 | 949 × 1002 | staende, licens-flagga |
| 2 | [File:Russian bombing of Mariupol (05).jpg](https://commons.wikimedia.org/wiki/File:Russian_bombing_of_Mariupol_(05).jpg) | wikidata-P18 | CC BY 4.0 (trolig); filsidan: flagga CC BY 4.0 – API:et säger "CC BY 4.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Ministry of Internal Affairs of Ukraine | 2022-03-03 / 2022-03-09 17:08:18 | 960 × 1200 | staende, licens-flagga |
| 3 | [File:Russian bombing of Mariupol (03).jpg](https://commons.wikimedia.org/wiki/File:Russian_bombing_of_Mariupol_(03).jpg) | wikidata-P18 | CC BY 4.0 (trolig); filsidan: flagga CC BY 4.0 – API:et säger "CC BY 4.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Ministry of Internal Affairs of Ukraine | 2022-03-03 / 2022-03-10 06:42:57 | 576 × 1280 | smal, staende, licens-flagga |
- Nr 1: beskrivning: Russian bombing of Mariupol · kategorier: Battle of Mariupol; Buildings in Ukraine photographed in 2022; Damaged retail buildings in the 2022 Russian invasion of Ukraine; Epicentr K; Fires in Donetsk Oblast; Gray corrugated slate roofs in Ukraine
- Nr 2: beskrivning: Aftermath of Russian bombing of Mariupol city (Ukraine) diring siege of Mariupol . · kategorier: Air conditioners in Ukraine; Destroyed in Ukraine in 2022; March 2022 in Mariupol; Nine-story buildings in Ukraine; Russo-Ukrainian War on 2022-03-03; Satellite dishes (residential) in Ukraine
- Nr 3: beskrivning: Aftermath of Russian bombing of Mariupol city (Ukraine) diring siege of Mariupol . · kategorier: 113-87; Air conditioners in Ukraine; Blue objects in Ukraine; Buildings in Ukraine photographed in 2022; Damaged buildings in Mariupol; Damaged objects in Ukraine

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 20. `charkivoffensiven-2022`: Ukrainas motoffensiv i Charkiv oblast (2022, Charkiv oblast, Ukraina (började vid Balaklija))

Wikidata: [Q113865480](https://www.wikidata.org/wiki/Q113865480). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:UA flag in liberated Balakliia 01.png](https://commons.wikimedia.org/wiki/File:UA_flag_in_liberated_Balakliia_01.png) | wikidata-P18 | CC BY 4.0 (trolig); filsidan: flagga CC BY 4.0 – API:et säger "CC BY 4.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | General Staff of the Ukrainian Armed Forces | 2022-09-08 / 2022-09-10 11:47:27 | 604 × 1047 | smal, staende, licens-flagga |
- Nr 1: beskrivning: Ukrainian soldiers of the Kraken Regiment with national flag in Balakliia after its liberation from Russian forces.One soldier is holding a SCAR rifle · kategorier: 2022 Ukrainian Kharkiv counteroffensive; 3 people in Ukraine; Battle of Balakliia; Blue tape in military identification (Ukraine); Kraken Special Unit; National flag of Ukraine in liberated populated places

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 21. `chersons-befrielse`: Ukraina befriar Cherson (2022, Cherson, Ukraina)

Wikidata: [Q115172927](https://www.wikidata.org/wiki/Q115172927). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:UA 128th brigade liberating Kherson region 03.jpg](https://commons.wikimedia.org/wiki/File:UA_128th_brigade_liberating_Kherson_region_03.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Ministry of Defence of Ukraine | 2022-10-09 / 2022-10-14 21:56:16 | 1284 × 963 | ur-sokning |
| 2 | [File:Kherson Counteroffensive Tanks (Cropped).png](https://commons.wikimedia.org/wiki/File:Kherson_Counteroffensive_Tanks_(Cropped).png) | commons-sok | Public domain (trolig); filsidan: godkand Public domain | Defense of Ukraine | 2022-11-11 / 2022-11-12 02:41:30 | 1062 × 807 | ur-sokning |
| 3 | [File:UA 128th brigade liberating Kherson region 02.jpg](https://commons.wikimedia.org/wiki/File:UA_128th_brigade_liberating_Kherson_region_02.jpg) | commons-sok | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Ministry of Defence of Ukraine | 2022-10-09 / 2022-10-14 21:56:17 | 1284 × 963 | ur-sokning |
- Nr 1: beskrivning: 128th Zakarpattia Mountain Assault Brigade liberating Kherson region from Russian soldiers. A truck was captured and achieved a new tactical marking of AFU, a yellow square · kategorier: 2022 Russian Invasion V-shaped markings on military vehicles; 2022 Ukrainian Kherson counteroffensive; Blue or yellow color markings on military vehicles of Ukraine; Captured military vehicles in the 2022 Russian invasi…
- Nr 2: beskrivning: A column of Ukrainian tanks liberating territory in Kherson Oblast. · kategorier: 2022 Ukrainian Kherson counteroffensive; T-72 tanks in Ukrainian service; Tanks in Kherson Raion
- Nr 3: beskrivning: 128th Zakarpattia Mountain Assault Brigade liberating Kherson region from Russian soldiers. T-62M with cope cage was captured · kategorier: 2022 Russian Invasion vehicle improvised armor; 2022 Ukrainian Kherson counteroffensive; Captured military vehicles in the 2022 Russian invasion of Ukraine; Captured tanks of the Russo-Ukrainian War; Cope cage; T-62M ta…

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 22. `fn-resolution-es-11-1`: FN:s generalförsamling fördömer invasionen (2022, FN:s högkvarter, New York)

Wikidata: [Q111060761](https://www.wikidata.org/wiki/Q111060761). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:United Nations General Assembly resolution ES-11 L.1 vote.svg](https://commons.wikimedia.org/wiki/File:United_Nations_General_Assembly_resolution_ES-11_L.1_vote.svg) | wikidata-P18 | CC0 (trolig); filsidan: godkand CC0 | Jurta | 2022-03-02 / 2022-03-19 13:10:25 | 2754 × 1398 | karta |
- Nr 1: beskrivning: A map that shows the countries and their respective voting in the eleventh emergency special session of the United Nations General Assembly resolution ES-11/1 . In favor Against Abstentions Absent Non member · kategorier: Language-neutral maps of the world; Russo-Ukrainian War on 2022-03-02; UN resolutions maps; World maps of the international reaction to the 2022 Russian invasion of Ukraine

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 23. `massakern-i-butja`: Massakern i Butja (2022, Butja nordväst om Kyiv, Ukraina)

Wikidata: [Q111467700](https://www.wikidata.org/wiki/Q111467700). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:The city of Bucha after liberation from the Russians 01.jpg](https://commons.wikimedia.org/wiki/File:The_city_of_Bucha_after_liberation_from_the_Russians_01.jpg) | wikidata-P18 | CC BY 3.0 (trolig); filsidan: flagga CC BY 3.0 – API:et säger "CC BY 3.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | Ukrinform TV | Taken on 3 April 2022 / 2022-06-26 21:27:33 | 1920 × 677 | licens-flagga |
| 2 | [File:Executed people in basement in Bucha.jpg](https://commons.wikimedia.org/wiki/File:Executed_people_in_basement_in_Bucha.jpg) | wikidata-P18 | CC BY 3.0 (trolig); filsidan: godkand CC BY 3.0 | Військове телебачення України | 2022-04-03 / 2022-04-04 20:27:29 | 1920 × 1080 | – |
- Nr 1: beskrivning: Video published by the National News Agency of Ukraine showing Bucha civilians massacred by Russian soldiers. · kategorier: Bucha massacre; Human corpses in Ukraine; Pallet piles in Ukraine; Russo-Ukrainian War on 2022-04-03; Stacks of construction materials in Ukraine; Stacks of paving stones
- Nr 2: beskrivning: Civilian casualties found in a basement in Bucha. 3 April 2022. From left to right: Mateshko Serhiy Viktorovych, born in 1981, native of Gostomel. Shulmeister Dmytro Valeriiovych, born in 1968, native of Kyiv. Boychenko… · kategorier: Bucha massacre; Human corpses in Ukraine; People killed in the 2022 Russian invasion of Ukraine (civilians); Russo-Ukrainian War on 2022-04-04

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 24. `rysslands-invasion-av-ukraina`: Rysslands invasion av Ukraina (2022, Ukraina (anfall från norr, öster och söder, bland annat mot Kyiv))

Wikidata: [Q110999040](https://www.wikidata.org/wiki/Q110999040). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Последствия удара ракеты по Голосеевскому району Киева (6).jpg](https://commons.wikimedia.org/wiki/File:%D0%9F%D0%BE%D1%81%D0%BB%D0%B5%D0%B4%D1%81%D1%82%D0%B2%D0%B8%D1%8F_%D1%83%D0%B4%D0%B0%D1%80%D0%B0_%D1%80%D0%B0%D0%BA%D0%B5%D1%82%D1%8B_%D0%BF%D0%BE_%D0%93%D0%BE%D0%BB%D0%BE%D1%81%D0%B5%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%BC%D1%83_%D1%80%D0%B0%D0%B9%D0%BE%D0%BD%D1%83_%D0%9A%D0%B8%D0%B5%D0%B2%D0%B0_(6).jpg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Arrikel | 2022-02-24 13:32:24 / 2022-02-24 17:17:59 | 4032 × 3024 | – |
- Nr 1: beskrivning: The consequences of a missile strike on Kyiv (6) · kategorier: Damaged buildings in Kyiv; Russo-Ukrainian War on 2022-02-24; War damages in Kyiv (2022 Russian invasion of Ukraine)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 25. `slaget-om-bachmut`: Slaget om Bachmut (2022, Bachmut, Donetsk oblast, Ukraina)

Wikidata: [Q112114958](https://www.wikidata.org/wiki/Q112114958). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:Bakhmut after Russian shelling, 2022-09-15 (15).jpg](https://commons.wikimedia.org/wiki/File:Bakhmut_after_Russian_shelling,_2022-09-15_(15).jpg) | wikidata-P18 | CC BY 4.0 (trolig); filsidan: flagga CC BY 4.0 – API:et säger "CC BY 4.0" men ingen licensmall kändes igen på filsidan (inga igenkända licensmallar) | АрміяInform | 2022-09-15 / 2022-09-16 04:15:49 | 1200 × 898 | licens-flagga |
- Nr 1: beskrivning: 5-store residential building in Bakhmut city (Donetsk Oblast of Ukraine) after Russian airstrike in the night on 15 September 2022. · kategorier: Destroyed buildings in Bakhmut; Russo-Ukrainian War on 2022-09-15; September 2022 in Bakhmut; War damages in Bakhmut (2022 Russian invasion of Ukraine)

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## 26. `ukrainas-offensiv-2023`: Ukrainas offensiv 2023 (2023, Zaporizjzja och Donetsk oblast, Ukraina (bland annat Robotyne))

Wikidata: [Q118951092](https://www.wikidata.org/wiki/Q118951092). Kandidater hämtade 2026-11-22. Stil enligt data/styles.json: `rymdalder`.

| Nr | Fil | Källa | Licens | Upphov | Datum (verk / fil) | Storlek | Flaggor |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [File:2022 Russian invasion of Ukraine.svg](https://commons.wikimedia.org/wiki/File:2022_Russian_invasion_of_Ukraine.svg) | wikidata-P18 | CC BY-SA 4.0 (trolig); filsidan: godkand CC BY-SA 4.0 | Viewsridge | 24 February 2022 (first version), last update: 11 months ago / 2026-11-17 06:18:55 | 2199 × 1478 | karta |
- Nr 1: beskrivning: full-scale Russo-Ukrainian war – full-scale invasion of Ukraine by Russia starting on 24 February 2022, part of Russo-Ukrainian War [ edit ] · kategorier: 2022 maps; Multilingual SVG maps of 2020-ies Russia-Ukraine war; Multilingual SVG with Arabic language (ar) option; Multilingual SVG with Armenian language (hy) option; Multilingual SVG with Basque language (eu) option;…

- [ ] Vald (nr eller "ingen" med skäl): 
- Motiv (bara det filsidan stöder): 

## Utan användbar kandidat

Sök själv bara om händelsen är viktig (tur, tema, fun fact); skriv annars händelsen i `docs/bilder-saknas.md` med datum och skäl.

- `medellinkonferensen-1968`: Biskoparna i Medellín väljer de fattigas sida (1968)
- `gronlands-hemstyre`: Grönland får hemstyre (1979)
- `gronlands-sjalvstyre`: Grönland får självstyre (2009)
- `fredsavtalet-med-farc`: Fredsavtalet mellan Colombia och FARC (2016)

## Val 2026-11-26 (#2090 och #2102)

9 av 31 händelser fick bild; 1 har en utsedd kandidat som inte kunde hämtas (`slut-1-ej-hamtade.txt`). Filsidorna öppnades via `action=raw` och bilderna granskades visuellt i en kontaktbild. Wikimedia svarade ofta med HTTP 429, så flera sökningar gav inget.

- Avvisat efter att filsidan öppnats: `pavevalet-2013`, `belagringen-av-mariupol`, `chersons-befrielse`, `slaget-om-bachmut`, `euron-infors` (osäkra licenser), `massakern-i-butja` (offer), `slaget-om-bachmut` (människor under rasmassor).
- `kurskoffensiven` saknades i den automatiska listan (den har `start` i stället för `year`) och söktes manuellt.
- Licensval: Ariane 1-modellen har dubbellicens med GFDL (CC BY-SA 3.0 används).
- Egen sökning: `kurskoffensiven`, `obama-valjs-till-president`, `klimatkonventionen-rio-1992`, `sverige-gar-med-i-eu`, `gronlands-hemstyre`, `fredsavtalet-med-farc`, `skane-lan-bildas`.
