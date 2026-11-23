# Rikesytor i havet (#1444)

**Datum:** 2026-11-23. **Av:** Claude Code (Einzbeng). **Underlag för:** DasKrokodils beslut om rikesytor ska klippas mot land när de ritas (steg 2 i #1444).

Mätningen är steg 1 i rekommendationen i #1444, som DasKrokodil sa ja till 2026-11-14. Den görs av `python3 tools/tackning.py` (avsnittet "Rikesytor i havet") och ändrar ingenting på kartan, i `areaKm2` eller i ytkurvan.

## Metod

- Varje period i `data/empires/*.json` (utom delar med `review: "draft"`) mäts mot kusten i `data/land-10m.json` (Natural Earth 1:10m). Saknas den används `data/land.json` (1:50m).
- För varje breddgrad var 0,05 grad räknas sträckorna inom rikets gräns och inom land; andelen i havet är 1 − (land inom gränsen ÷ hela gränsen), vägt med cos(latitud). Polygoner som överlappar räknas en gång.
- Kontroll: mot `data/land.json` ger Chimor 44 % (911–1201) och 33 % (1202–1343), samma tal som i issuet. Mot den finare kusten blir det 47 % och 36 %.
- Ytor under 5 000 km² står i en egen tabell: där ligger raderna för glest (cirka 5,5 km), och kusten saknar en del småöar, så en hög andel kan bero på mätningen. Chimor 911–1201 (2 661 km²) är ett riktigt fall bland dem.

## Resultat 2026-11-23


Andelen av varje rikesgräns som ligger i havet enligt kusten i `data/land-10m.json`, mätt rad för rad var 0,05 grad (#1444). Cliopatrias ytor är grova, så små kustriken hamnar delvis i havet, och `areaKm2` och ytkurvan räknar med det. Inget klipps mot land här. 3 633 perioder mättes; 68 perioder i 39 riken har mer än 20 % i havet.

### Ytor på minst 5 000 km²

| Rike | Del | Period | I havet | Yta (km²) |
| --- | --- | --- | ---: | ---: |
| Vanuatu | vanuatu | 1983–2024 | 58 % | 16 885 |
| Kap Verde | kap-verde | 1976–2024 | 56 % | 9 427 |
| Bahamas | bahamas | 1973–2024 | 45 % | 18 694 |
| Salomonöarna | salomonoarna | 1979–2024 | 44 % | 37 719 |
| Kungariket Man | kungariket-man | 1085–1093 | 44 % | 12 242 |
| Norgesväldet | norgesvaldet | 1028–1039 | 37 % | 25 414 |
| Kungariket Man | kungariket-man | 1169–1271 | 37 % | 6 003 |
| Chimor | chimor | 1202–1343 | 36 % | 6 897 |
| Kungariket Man | kungariket-man | 1094–1168 | 35 % | 14 607 |
| Oman | muskat-och-oman | 1913–1915 | 32 % | 21 230 |
| Almoravider | almoravider | 1152–1205 | 31 % | 6 926 |
| Kungariket Hawaii | kungariket-hawaii | 1811–1894 | 30 % | 24 850 |
| Nederländska kolonialväldet | nederlandska-republiken | 1588–1594 | 30 % | 17 899 |
| Cypern | cypern | 1976–2024 | 29 % | 11 634 |
| Haiti | haiti-1805 | 1805–1808 | 29 % | 31 292 |
| Haiti | haiti-1805 | 1846–1860 | 29 % | 31 292 |
| Haiti | haiti-1805 | 1865–1915 | 29 % | 31 292 |
| Haiti | haiti | 1936–2024 | 29 % | 31 292 |
| Dalriada | dal-riata | 644–749 | 29 % | 14 662 |
| Trinidad och Tobago | trinidad-och-tobago | 1963–2024 | 28 % | 6 177 |
| Kungariket Hawaii | kungariket-hawaii | 1796–1810 | 28 % | 20 559 |
| Haiti | saint-domingue | 1792–1802 | 28 % | 31 347 |
| Haiti | haiti-1805 | 1809–1821 | 28 % | 31 347 |
| Haiti | haiti-1805 | 1861–1864 | 28 % | 31 347 |
| Dalriada | dal-riata | 612–643 | 26 % | 18 553 |
| Oman | muskat-och-oman | 1916–1919 | 26 % | 34 008 |
| Nederländska kolonialväldet | nederlandska-republiken | 1670–1672 | 25 % | 243 658 |
| Dalriada | dal-riata | 587–611 | 25 % | 16 559 |
| Nederländska kolonialväldet | nederlandska-republiken | 1673–1676 | 25 % | 236 034 |
| Nederländska kolonialväldet | nederlandska-republiken | 1677–1682 | 25 % | 256 384 |
| Dalriada | dal-riata | 540–586 | 24 % | 15 792 |
| Fiji | fiji | 1973–2024 | 24 % | 21 696 |
| Jamaica | jamaica | 1963–2024 | 23 % | 13 346 |
| Chimor | chimor | 1344–1374 | 22 % | 43 085 |
| Konungariket Danmark | danmark-1815 | 1922–1935 | 22 % | 53 400 |
| Konungariket Danmark | danmark-1815 | 1936–1939 | 22 % | 53 111 |
| Konungariket Danmark | danmark-1815 | 1918–1921 | 22 % | 47 978 |
| Danmark | danmark | 1945–1945 | 22 % | 53 400 |
| Nederländska kolonialväldet | nederlandska-republiken | 1683–1686 | 22 % | 288 436 |
| Östtimor | osttimor | 2006–2024 | 21 % | 19 270 |
| Konungariket Danmark | konungariket-danmark | 936–946 | 21 % | 57 037 |
| Konungariket Danmark | konungariket-danmark | 947–959 | 21 % | 57 143 |
| Konungariket Danmark | konungariket-danmark | 1352–1362 | 21 % | 57 754 |
| Nederländska kolonialväldet | nederlanderna | 1814–1814 | 20 % | 326 082 |
| Nederländska kolonialväldet | nederlanderna | 1834–1839 | 20 % | 516 684 |

### Ytor under 5 000 km² (mätosäkert)

Raderna ligger för glest för små öar och kuststäder, och kusten i Natural Earth saknar en del småöar, så en hög andel här kan bero på mätningen och inte på gränsen.

| Rike | Del | Period | I havet | Yta (km²) |
| --- | --- | --- | ---: | ---: |
| Seychellerna | seychellerna | 1976–2024 | 96 % | 259 |
| Norge | norge | 1941–1944 | 74 % | 372 |
| Antigua och Barbuda | antigua-och-barbuda | 1967–2024 | 73 % | 586 |
| Rom: kungadöme, republik, kejsardöme och Bysans | bysantinska-riket | 1468–1474 | 65 % | 800 |
| Saint Lucia | saint-lucia | 1979–2024 | 64 % | 791 |
| Palau | palau | 1996–2024 | 63 % | 659 |
| Malta | malta | 1967–2024 | 58 % | 475 |
| Saint Vincent och Grenadinerna | saint-vincent-och-grenadinerna | 1969–2024 | 56 % | 565 |
| Dominica | dominica | 1979–2024 | 54 % | 1 263 |
| Mexiko | mexikanska-forbundsrepubliken | 1865–1865 | 53 % | 166 |
| Singapore | singapore | 1967–2024 | 51 % | 691 |
| Chimor | chimor | 911–1201 | 47 % | 2 661 |
| São Tomé och Príncipe | sao-tome-och-principe | 1976–2024 | 46 % | 1 485 |
| Mauritius | mauritius | 1969–2024 | 45 % | 2 480 |
| Barbados | barbados | 1967–2024 | 43 % | 735 |
| Rom: kungadöme, republik, kejsardöme och Bysans | bysantinska-riket | 1206–1226 | 41 % | 4 348 |
| Danska Indien | danska-indien | 1757–1799 | 41 % | 2 222 |
| Bahrain | bahrain | 1973–2024 | 31 % | 881 |
| Kievriket | kievriket | 1236–1240 | 28 % | 1 068 |
| Marshallöarna | marshalloarna | 1986–2024 | 28 % | 167 |
| Danska Indien | danska-indien | 1800–1802 | 25 % | 322 |
| Grenada | grenada | 1976–2024 | 24 % | 482 |
| Mexiko | centralistiska-republiken-mexiko | 1846–1847 | 21 % | 639 |

## De 10 största luckorna

Varje period och världsdel får en vikt: roten ur periodens längd i år gånger världsdelens andel av landytan. "Väntat" är alla händelser fördelade efter vikten. Listan visar cellerna med störst relativ brist (först tomma celler, sedan de som har minst i förhållande till väntat). Det är ett grovt mått för att hitta var man ska börja leta, inte ett mål.

Världsdelarnas andel av landytan (norr om 60° S): Europa 8 %, Asien 32 %, Afrika 22 %, Amerika 31 %, Oceanien 7 %.

| # | Period | Världsdel | Händelser | Väntat | Tomma kategorier |
| ---: | --- | --- | ---: | ---: | --- |
| 1 | Förhistoria (före 3000 f.Kr.) | Amerika | 21 | 181 | upptackter, krig, sport, katastrofer, rymden |
| 2 | Förhistoria (före 3000 f.Kr.) | Afrika | 32 | 129 | krig, sport, halsa, katastrofer, rymden |
| 3 | Förhistoria (före 3000 f.Kr.) | Asien | 62 | 186 | krig, sport, rymden |
| 4 | Förhistoria (före 3000 f.Kr.) | Oceanien | 18 | 39 | civilisationer, vetenskap, krig, sport, halsa, rymden |
| 5 | Antiken (3000 f.Kr.–500) | Amerika | 61 | 128 | krig, rymden |
| 6 | Medeltid (501–1500) | Amerika | 39 | 68 | natur, sport, halsa, katastrofer, rymden |
| 7 | Antiken (3000 f.Kr.–500) | Afrika | 61 | 91 | rymden |
| 8 | Antiken (3000 f.Kr.–500) | Asien | 104 | 131 |  |
| 9 | Medeltid (501–1500) | Afrika | 43 | 49 | sport, rymden |
| 10 | 2000-tal | Amerika | 10 | 11 | natur, manniskan, religion, vetenskap, upptackter, kultur, halsa, klimat, rymden |

## Iakttagelser (inga beslut)

- De flesta perioderna över 20 % är **ö-stater och skärgårdsriken** (Vanuatu, Kap Verde, Bahamas, Salomonöarna, Fiji, Hawaii, Kungariket Man) och **riken längs kusten** (Chimor, Dalriada, Almoravider, Oman). Där ritar Cliopatria grova ytor som täcker havet mellan öarna eller utanför kusten.
- **Danmark** (cirka 21–22 %) och **Nederländerna** (20–30 %) ligger strax över gränsen, eftersom Cliopatrias ytor täcker sund, Vadehavet och Zuiderzee.
- Inget av detta är ett faktafel i datan: ytorna följer källan. Frågan i steg 2 är bara hur kartan ska rita dem.

## Nästa steg (kräver DasKrokodils ja, #1444)

Rekommendationen i issuet står kvar: klippning mot land vid ritning ändrar kartans utseende (öriken, kolonialvälden och sund) och kräver ett beslut. `areaKm2` är Cliopatrias egen siffra och ändras inte.
