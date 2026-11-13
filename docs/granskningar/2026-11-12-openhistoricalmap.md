# OpenHistoricalMap som kontrollkälla: förstudie (#847)

Datum: 2026-11-12. Gjord av Claude Code (DasKrokodil) efter DasKrokodils ja på #847. Ingen data har lagts i `data/` och ingen ny källa i README:ns licensavsnitt.

## Sammanfattning

- **Licensen fungerar för gränser, men inte för allt.** Objekt utan `license`-tagg är CC0. Av landsgränserna (`admin_level=2`) är 4 048 av 4 156 utan tagg och resten märkta CC0, så de är förenliga med våra regler. I hela databasen finns däremot cirka 233 000 objekt under ODbL och några tusen under CC BY-SA, som vi inte får använda.
- **Inte som andra källa för händelser.** Databasen har föremål (byggnader, vägar, gränser), inte händelser. I stickprovet runt 93 av våra händelser fanns något objekt från rätt år i 58 fall, men nästan bara byggnader och vägar efter 1800 i Europa och Amerika. Före 1500 var Afrika och Oceanien tomma.
- **Det enda intressanta: afrikanska riken 1500–1900.** OpenHistoricalMap har gränser för till exempel Kongo, Dahomey, Rwanda, Mutapa, Lunda och Luba, där Cliopatria har få stater. I Asien och i medeltidens Europa är Cliopatria klart starkare.
- **Rekommendation:** använd den inte nu. Ta upp den som tänkbar extra gränskälla för Afrika i rikesarbetet (#556) först när det arbetet når dit. Det är en ny datakälla och kräver ett beslut. Se issuet som föreslås sist.

## Metod

Mätt 2026-11-12 med OpenHistoricalMaps öppna tjänster:

- **Taginfo** (`taginfo.openhistoricalmap.org`, data till 2026-11-07): antal objekt per tagg, licensvärden och vad de stora licensgrupperna innehåller.
- **Overpass** (`overpass-api.openhistoricalmap.org`): alla 4 156 relationer med `boundary=administrative` och `admin_level=2` (länder och riken), med datum, Wikidata-id och mittpunkt.
- **Stickprov runt våra händelser:** 3 händelser per period och världsdel (perioder och världsdelar som i `tools/tackning.py`, `review` inte `draft`, platsen inte ungefärlig), 93 händelser. För varje händelse hämtades alla objekt med `start_date` inom 25 km, och de som fanns händelsens år räknades.
- **Jämförelse med Cliopatria:** filen `cliopatria.geojson` ur [Zenodo-posten 13363121](https://zenodo.org/records/13363121) (version 0.0.1; våra riken bygger på `cliopatria_polities_only_v021`, så siffrorna är ungefärliga), bara poster med `Type` = `POLITY`. Världsdel efter mitten av gränsens omslutande rektangel. Världsdelarna är grova (till exempel kan ett rike med mitten i Nordafrika räknas till Asien).

Mätskripten ligger inte i repot; frågorna står ovan och går att köra om.

## Licens

| Källa | Vad den säger |
| --- | --- |
| [Copyright-sidan](https://www.openhistoricalmap.org/copyright) (öppnad) | "Except where otherwise noted, OpenHistoricalMap data is dedicated to the public domain under a Creative Commons CC0 dedication." Undantag: enskilda objekt under CC BY eller CC BY-SA "as noted in license=* tags on individual elements". Kust, sjöar och vattendrag kommer från OpenStreetMap under CC BY-SA 2.0. |
| [API:ets capabilities](https://www.openhistoricalmap.org/api/capabilities) (öppnad) | `license="https://creativecommons.org/public-domain/cc0/"`. Overpass svarar likadant: "The data included in this document is from www.openhistoricalmap.org. The data is made available under CC0." |
| Taginfo (mätt) | 5,79 miljoner objekt har `license`. De största värdena: CC-BY-4.0 5 243 671 (nästan allt en belgisk import av byggnader och adresser, `ref:picc`), ODbL 231 503 (mest vägar och järnvägar), CC-BY-2.0 134 982 (franska byggnader och departementsgränser), CC0-1.0 80 588, "public domain" 32 534. CC BY-SA i olika stavningar cirka 3 800, CC BY-NC och BY-NC-SA några stycken, och en del ogiltiga värden (gatunamn, "use at own risk"). |
| [Wikipedia: OpenHistoricalMap](https://en.wikipedia.org/wiki/OpenHistoricalMap) (sekundär, öppnad) | Nämner ODbL för vissa objekt. **Källorna skiljer sig:** copyright-sidan nämner bara CC BY och CC BY-SA som undantag, men taginfo visar att ODbL finns. |

Regel om den någon gång används: objekt utan `license` eller med CC0 eller public domain får användas; CC BY får användas med namngivning; ODbL, CC BY-SA, NC och okända värden får bara länkas. Vattenlagret hålls alltid utanför.

## Landsgränser: OpenHistoricalMap mot Cliopatria

Antal stater som fanns det året, per världsdel. **Cliopatria / OpenHistoricalMap.** OpenHistoricalMap räknas per Wikidata-id eller namn.

| År | Europa | Asien | Afrika | Amerika | Oceanien |
| ---: | ---: | ---: | ---: | ---: | ---: |
| -2000 | 0 / 2 | 3 / 5 | 1 / 0 | 0 / 1 | 0 / 0 |
| -500 | 7 / 7 | 37 / 0 | 3 / 2 | 2 / 2 | 0 / 0 |
| 1 | 5 / 3 | 36 / 5 | 3 / 0 | 3 / 5 | 0 / 0 |
| 500 | 21 / 20 | 32 / 9 | 5 / 3 | 3 / 10 | 0 / 0 |
| 1000 | 70 / 40 | 53 / 8 | 7 / 4 | 4 / 11 | 0 / 0 |
| 1300 | 99 / 41 | 41 / 22 | 9 / 12 | 4 / 16 | 0 / 1 |
| 1500 | 57 / 34 | 70 / 35 | 12 / 32 | 7 / 38 | 0 / 1 |
| 1700 | 34 / 45 | 61 / 45 | 20 / 41 | 5 / 45 | 0 / 2 |
| 1800 | 30 / 33 | 73 / 50 | 23 / 40 | 6 / 45 | 1 / 4 |
| 1900 | 17 / 24 | 32 / 47 | 21 / 61 | 24 / 40 | 1 / 18 |
| 1950 | 27 / 36 | 29 / 64 | 11 / 51 | 24 / 33 | 5 / 9 |
| 2000 | 41 / 43 | 54 / 54 | 51 / 59 | 39 / 46 | 8 / 13 |

Vad siffrorna betyder:

- **Före 1500** är Cliopatria starkare nästan överallt, särskilt i Asien (37 mot 0 år 500 f.Kr.).
- **Afrika 1500–1900** har OpenHistoricalMap 2–3 gånger fler stater. År 1700 är det bland annat Kongo, Dahomey, Rwanda, Burundi, Mutapa, Rozvi, Lunda, Luba, Kuba, Shilluk, Jolof, Cayor, Waalo, Imerina och portugisiska Angola.
- **Amerika 1500–1900** är OpenHistoricalMaps överskott mest kolonier (Virginia, New York, Saint-Domingue, Rupert's Land med flera) och bara några få urfolk (Catawba, Shoshone, Manche Chʼol).
- **Källor på objektet:** 3 422 av 4 156 landsgränser saknar `source`-tagg på själva gränsen; de som har en hänvisar till Wikipedia, gamla atlaser (Droysen, Spruner-Menke, Hammond 1917), Natural Earth och skannade kartor. Varje gräns måste alltså kontrolleras mot en öppnad källa innan den kan bli `source-checked`.
- **Våra riken finns där:** 258 av våra 342 riken med Wikidata-id finns som landsgräns i OpenHistoricalMap någon gång. Det gör en jämförelse av gränserna möjlig, men det är inte mätt hur väl de stämmer.

Vårt eget rikeslager har färre stater än Cliopatria (till exempel Afrika år 1700: 2 hos oss, 20 i Cliopatria). Det är vårt urval, inte källan, och det arbetas med i #556, #645 och #646.

## Stickprov runt våra händelser

Antal händelser med minst ett objekt som fanns händelsens år inom 25 km, och medianen av antalet sådana objekt. En gräns räknas bara om någon av dess linjer ligger inom 25 km, så stora riken missas ofta.

| Period | Europa | Asien | Afrika | Amerika | Oceanien |
| --- | ---: | ---: | ---: | ---: | ---: |
| Förhistoria | 1/1 (48) | 2/2 (34) | – | – | – |
| Antiken | 3/3 (2) | 1/3 (0) | 2/3 (12) | 0/3 (0) | 1/3 (0) |
| Medeltid | 2/3 (1) | 2/3 (2) | 0/3 (0) | 2/3 (9) | 0/3 (0) |
| Tidigmodern tid | 2/3 (39) | 2/3 (1) | 1/3 (0) | 3/3 (20) | 1/3 (0) |
| 1800-tal | 3/3 (428) | 1/3 (0) | 0/3 (0) | 3/3 (27) | 3/3 (7) |
| 1900-tal | 2/3 (6) | 1/3 (0) | 3/3 (44) | 3/3 (23) | 1/3 (0) |
| 2000-tal | 3/3 (3202) | 2/3 (1) | 3/3 (686) | 2/3 (2) | 3/3 (2954) |

- 58 av 93 händelser hade minst ett samtida objekt, 36 hade minst 10.
- Av de 213 626 samtida objekten var 158 043 byggnader och de flesta av resten vägar. Platser (`place=*`) och fornlämningar (`historic=*`) var få.
- Licens bland de samtida objekten: 97 % utan tagg (CC0), 3 777 ODbL, resten CC0 eller CC BY.
- För Afrika, Asien och Oceanien före 1800 hittades ofta ingenting (till exempel Lalibelas klippkyrkor, Al-Qarawiyyin, Ife-huvudet, Lothal, Lapita, Paquimé).

Slutsats: som kontroll av platser för våra händelser tillför OpenHistoricalMap lite. Wikidata, som vi redan använder, gör det bättre.

## Rekommendation till DasKrokodil

1. **Använd inte OpenHistoricalMap för händelser.** Den kan inte ge `two-sources`, och den är tom där våra luckor finns.
2. **Spara den som tänkbar gränskälla för afrikanska riken 1500–1900.** Det är där den har något som Cliopatria saknar, och landsgränserna är CC0. Varje gräns måste ändå kontrolleras mot en öppnad källa, eftersom de flesta saknar källa på objektet. Det kräver ett beslut om ny datakälla, och det är inte bråttom: rikesarbetet (#556) tar medeltiden och antiken först, och där är Cliopatria bättre.
3. **Regionkort och landsvyer (#579, #1115):** inte bedömt. Mätningen här gäller bara länder (`admin_level=2`), inte län eller landskap.

Uppföljning: #1200 (`beslut-krävs`, Senare), "Pröva OpenHistoricalMap som extra gränskälla för afrikanska riken 1500–1900". Med det kan #847 stängas.
