# Underlag för "Idag i historien" (#753, inför #489)

**Datum:** 2026-11-12. **Underlag:** `data/events.json` på `main` (923 händelser, alla `source-checked` eller `two-sources`), räknat med ett engångsskript som använder `region()` ur `js/model.js`. Inga nya fakta och inga ändrade datafiler. Siffrorna gäller dagens data; kärnhändelserna (#452) och massimporten (#61) ändrar dem, så räkna om innan #489 byggs.

**Så räknas en händelse:** "har en dag" betyder `precision` 11 och en dag (`ÅÅÅÅ-MM-DD`) i början av `edtf`. Händelsen räknas på sin **startdag**, eftersom det är den dag kortet säger att något hände. Världsdel = `region(lat, lon)` för punkten, eller medelpunkten för ett område. Dagarna räknas över ett skottår (366 dagar).

## Sammanfattning

- **500 händelser har `precision` 11**, och **492 av dem har en riktig startdag i `edtf`**. Det är 53 % av alla händelser.
- **264 av årets 366 dagar har minst en händelse; 102 dagar har ingen.** Den längsta luckan är fem dagar (14–18 februari). Ingen dag har längre än **3 dagar** till närmaste dag med en händelse.
- **Krig och slag dominerar:** 335 av 492 (68 %). Händelser före 1500 är få (40); 1800- och 1900-talen står för 305 (62 %).
- **Världsdelarna är jämnare än väntat:** Asien 141, Europa 111, Amerika 111, Afrika 69, Oceanien 60. Men på en enskild dag syns oftast bara en världsdel (155 dagar), och bara 23 dagar har tre eller fler.
- **Rekommendation:** bygg kortet med regeln "närmast inom 3 dagar" och dölj det aldrig. Visa högst tre rader, med flera världsdelar först. Märk datum före 1753 med kalendern, eller visa dem bara i fullständiga listan. Se "Förslag till #489".

## 1. Kontroll av `precision` 11 mot `edtf`

| Fall | Antal |
|---|---|
| En dag (`1863-01-01`) | 319 |
| Dagspann (`1180-06-20/1185-04-25`) | 172 |
| Dag och öppet slut (`2022-02-24/..`) | 1 |
| **Precision 11 men en sida av spannet saknar dag** | **8** |
| Summa | 500 |

De åtta med en ofullständig sida: `ming` (`1368-01-23/1644`), `1519-02/1521-08-13`, `belagringen-av-cusco-1536` (`1536-05-06/1537-03`), `francis-xavier-i-japan` (`1549-08-15/1551`), `1707-12-16/1708`, `1853-05-08/1855`, `1860-09/1861-09-05` och `burke-och-wills-expedition` (`1860-08-20/1861-06~`, den enda med `~`). `start` stämmer med årtalet i `edtf` för alla 492.

**Följd för koden:** `selectEventsForDate` i `js/date-events.js` (datumhoppet) kräver en hel dag på båda sidor och missar därför de åtta, plus `rysslands-invasion-av-ukraina` (öppet slut). 490 händelser träffas. För "Idag i historien" räcker startdagen, så #489 bör läsa startdagen själv och inte återanvända `selectEventsForDate` som den är.

Tio händelser har en dag i `edtf` men lägre `precision` (9 eller 10), till exempel `magellans-jordenruntsegling` (`1519-08-10/1522-09`) och `folkmordet-i-rwanda` (`1994-04-07/1994-07`). Startdagen är exakt, men slutet är inte det. De räknas inte här. Om #489 ska ta med dem är ett beslut (förslag nedan), inte en datarättelse.

## 2. Per månad och världsdel (startdag)

| Månad | Europa | Asien | Amerika | Afrika | Oceanien | Summa |
|---|---|---|---|---|---|---|
| jan | 5 | 11 | 5 | 10 | 5 | 36 |
| feb | 11 | 9 | 5 | 5 | 5 | 35 |
| mar | 7 | 20 | 6 | 8 | 8 | 49 |
| apr | 11 | 13 | 12 | 4 | 2 | 42 |
| maj | 12 | 12 | 17 | 4 | 4 | 49 |
| jun | 11 | 17 | 10 | 4 | 6 | 48 |
| jul | 10 | 6 | 11 | 8 | 3 | 38 |
| aug | 3 | 17 | 14 | 7 | 5 | 46 |
| sep | 13 | 9 | 14 | 3 | 4 | 43 |
| okt | 7 | 10 | 3 | 8 | 8 | 36 |
| nov | 12 | 9 | 9 | 7 | 5 | 42 |
| dec | 9 | 8 | 5 | 1 | 5 | 28 |
| **Summa** | **111** | **141** | **111** | **69** | **60** | **492** |

Månaderna är någorlunda jämna (28–49). December är tunnast, och Afrika har bara en händelse i december.

**Dagar med flest världsdelar:**

| Världsdelar på dagen | Antal dagar |
|---|---|
| 0 | 102 |
| 1 | 155 |
| 2 | 86 |
| 3 | 18 |
| 4 | 5 |

## 3. Per kategori (startdag)

| Kategori | Antal |
|---|---|
| krig | 335 |
| civilisationer | 75 |
| katastrofer | 19 |
| rymden | 12 |
| upptackter | 11 |
| vetenskap | 10 |
| ekonomi | 9 |
| kultur | 6 |
| sport | 6 |
| religion | 4 |
| klimat | 3 |
| halsa | 2 |
| natur, manniskan | 0 |

Av de 335 krigshändelserna är 286 slag eller delar av ett krig (`partOf`) och 34 är själva krigen. Ett kort som visar dagens händelser blir därför oftast ett kort om slag. Det är en skev bild av "vad hände den här dagen", och den bör synas i urvalet (förslag 3 nedan).

**Per århundrade:** f.Kr. 1, 100–1499: 39, 1500-talet 34, 1600-talet 29, 1700-talet 38, 1800-talet 121, 1900-talet 184, 2000-talet 46.

## 4. Dagar utan händelse (102)

- **januari:** 2, 4, 5, 6, 8, 18, 19, 20, 24, 28, 31
- **februari:** 2, 3, 14, 15, 16, 17, 18, 20, 25, 29
- **mars:** 4, 23, 27, 30
- **april:** 1, 7, 8, 14, 18, 20, 27, 28
- **maj:** 2, 4, 5, 7, 9, 12, 17, 26, 28
- **juni:** 12, 13, 27, 29
- **juli:** 2, 12, 15, 16, 19, 23, 24, 29, 31
- **augusti:** 1, 3, 8, 10, 11, 12, 14, 18, 19, 31
- **september:** 6, 9, 12, 13, 14, 20, 21, 27, 29
- **oktober:** 2, 3, 8, 9, 11, 13, 19, 22, 27, 29, 30
- **november:** 6, 10, 13, 19, 21, 29
- **december:** 1, 3, 5, 8, 14, 18, 21, 22, 23, 27, 29

**Avstånd till närmaste dag med en händelse:** 264 dagar har en händelse, 94 har en dag bort, 7 har två dagar bort och 1 har tre dagar bort (16 februari). Längsta luckan: 14–18 februari.

Räknas också spannens **slutdag** (till exempel ett slags sista dag) täcks 292 dagar i stället för 264. Det hjälper lite, men det blir svårare att förklara ("slutade den här dagen").

## 5. Dagar med fler än tre händelser (19)

| Dag | Antal |
|---|---|
| 1 jan | 6 |
| 11 jan | 4 |
| 22 feb | 4 |
| 24 feb | 5 |
| 26 feb | 4 |
| 2 mar | 4 |
| 6 mar | 4 |
| 6 apr | 4 |
| 12 apr | 4 |
| 19 apr | 4 |
| 24 maj | 4 |
| 5 jun | 5 |
| 21 jul | 4 |
| 2 aug | 5 |
| 7 aug | 4 |
| 15 aug | 7 |
| 28 okt | 4 |
| 16 nov | 4 |
| 20 nov | 4 |

Histogram över alla dagar: 0 händelser 102 dagar, 1: 118, 2: 91, 3: 36, 4: 14, 5: 3, 6: 1, 7: 1.

**1 januari** (6) är inte ett fel i datan. Händelserna är självständigheter, en förbunds- och länsbildning, ett införande av en valuta och en proklamation (till exempel `haitis-sjalvstandighet`, `australiska-federationen`, `euron-infors`), som ofta sker vid årsskiftet. **15 augusti** (7) sprider sig över 636–2021 och fyra världsdelar.

## 6. Kalendern: datum före 1753

**119** av de 492 daterade händelserna börjar före 1753, då Sverige bytte till den gregorianska kalendern (beslutet 2026-11-10, `docs/beslut/2026-11-10-datum-fore-1753.md`). **69** börjar före 1582, då den gregorianska kalendern infördes över huvud taget. Bara **23** av de 119 har en `note` med `kind: "calendar"`. För resten står datumet som källan skrev det, oftast i den kalender som gällde på platsen.

**Följd för "Idag i historien":** "12 oktober 1492" (`columbus`) är inte samma dag på året som 12 oktober i dag, och en händelse på "samma datum" kan ha inträffat på en annan dag i vår kalender. Karl XII är exemplet i #948: 30 november enligt den julianska kalendern är 11 december enligt den gregorianska. Kortet säger "samma datum", inte "samma dag på året", och det bör synas.

## Förslag till #489

Det här är ett förslag, inget beslut; DasKrokodil avgör.

1. **Regel för "närmast":** visa dagens händelser. Saknas sådana, visa den närmaste dagen inom ±3 dagar (först framåt, sedan bakåt vid lika avstånd) med raden "Närmast: 3 november". Med dagens data räcker 3 dagar alltid. Om data försvinner och inget finns inom 3 dagar, visa raden "Inga händelser med datum nära i dag".
2. **Dölj inte kortet.** Varje dag har något inom tre dagar, så att dölja kortet skulle bara göra det oförutsägbart (det finns ibland, ibland inte). Ett kort som säger "närmast" förklarar sig självt.
3. **Urval när det är många:** visa högst tre rader och en länk "Visa alla (7)". Välj först så många världsdelar som möjligt, sedan `top` före `major` före övriga (samma ordning som `ordered()` i `date-events.js`), och högst en händelse med `partOf` till samma krig. Annars blir 15 augusti eller ett stort krigs dagar en lista med bara slag.
4. **Startdagen räknas,** inte varje dag i ett spann. En belägring som pågår i två år ska inte stå på kortet varje dag. Slutdagen kan läggas till senare om spannet är kort (till exempel högst sju dagar, 57 av de 172 spannen).
5. **Händelser med lägre `precision` men exakt startdag** (de tio i avsnitt 1): ta med dem, eftersom startdagen är exakt. Visa bara dag och år för starten.
6. **Kalendern:** visa datum före 1753 med en kort markering ("enligt kalendern på platsen") eller den `calendar`-not som redan finns. Alternativ: ta bara med händelser från 1753 och framåt i de tre första raderna och resten i "Visa alla". Det kräver en text på fem språk.
7. **Läs startdagen direkt ur `edtf`** i en egen funktion i `date-events.js` (till exempel `startMonthDay(event)`), i stället för att använda `selectEventsForDate`, som kräver hel dag på båda sidor (avsnitt 1).
8. **Räkna om innan bygget,** eftersom kärnhändelserna (#452) och massimporten (#61) ändrar siffrorna.

## Linser (docs/produkt/06-granskningsperspektiv.md)

- **Historielärare:** kortet ger en bra ingång ("vad hände i dag?"), men övervikten av slag (68 %) ger en snäv bild. Förslag 3 dämpar det; bättre balans kommer med fler händelser som inte är krig.
- **Historiker:** kalenderfrågan (avsnitt 6) är den största risken för en felaktig samtidighet. "Samma datum" måste betyda samma datum i källan, inte samma dag på året.
- **Senior UX:** ett kort som ibland finns och ibland inte är svårare att förstå än ett som säger "närmast". Högst tre rader passar 400 px.
