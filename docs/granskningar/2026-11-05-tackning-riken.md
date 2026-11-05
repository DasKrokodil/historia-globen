# Täckningsrapport: riken mot Cliopatria (#556, fas 0), 2026-11-05

Gjord av Claude Code med `tools/tackning_riken.py` på Cliopatria v0.2.1 (`cliopatria_polities_only_v021.geojson`, CC BY 4.0) och urvalet i `tools/riken.py` efter R7-omgången för Amerika (#407). Skriptet ändrar inga datafiler. Ingen `handoff.json` ändras, eftersom rapporten är ett underlag för #556 och inte en Codex-granskning.

## Sammanfattning

- **Cliopatria har 1 587 stater** (namn), varav 43 är sammanslagningar inom parentes, till exempel `(British Empire)`. **Vi har 102 av dem** i 64 grupper.
- **Störst lucka i nutid.** Vi täcker 68–85 % av Cliopatrias land 1650–1925, men andelen sjunker till 53 % 1950, 35 % 1975 och 18 % 2000–2024, när imperierna upphör och de nya staterna saknas. Av de 192 staterna som finns 2024 har vi 7.
- **Före 1500** växlar andelen mellan 0 och cirka 70 %. Lägst efter vår tideräkning är 1000–1200 (17–21 %), där Liaodynastin, stäppen (Kimek-Kipchak), Tibet, seldjukerna och Europas kungariken saknas.
- **Saknade stater per tid** (utan sammanslagningar): före vår tideräkning 179, 0–999 382, 1000–1499 486, 1500–1799 295, 1800–1945 349, 1946–2024 255. En stat kan räknas i flera perioder.
- **Storleken på arbetet:** med cirka tio stater per pull request, som planen i #556 säger, blir det över hundra pull requests för hela världen. Kartan går före fakta, så omgångar med bara gränser och namn går fortare än R1–R6 med faktarutor.

## Förslag till ordning (Rikard bestämmer)

1. **Sverige efter 1814** (fas 1, Rikards fråga): `United Kingdoms of Sweden and Norway` och `Kingdom of Sweden` i gruppen som i dag slutar 1814.
2. **Nutida stater** (störst lucka i ytan): Kina, Ryska federationen, Indien, Kanada, Australien och de andra stora staterna, och sedan Afrikas stater efter självständigheten. Här gäller beslutet om omstridda gränser (Sveriges officiella hållning, kommentar på #556), så den omgången behöver en lista med UD-källor först.
3. **Medeltidens luckor** i Asien och Europa: Liao, Tibet, Kimek-Kipchak, seldjukerna, Frankrike, England, Ungern, Polen–Litauen, Novgorod, Moskva, Norge och Danmark–Norge.
4. **Antiken:** Xiongnu, Kush, Ptolemaierna, Kushan, Satavahana, Scythia och Indusdalen.

## Metod och begränsningar

- För varje provår (vart hundrade år före 1500, var 25:e år efter) läggs alla Cliopatria-staters gränser ihop till "Cliopatrias land", och våra staters gränser till "våra riken". Ytan räknas ytriktigt på en sfär (`km2` i `tools/riken.py`).
- En saknad stat räknas med den del av sin yta som våra riken inte täcker, gånger antalet år provåret står för. Mindre än 1 000 km² räknas inte.
- Världsdelen är ungefärlig och kommer ur statens mittpunkt (Danmark hamnar till exempel i Amerika genom Grönland).
- Tysk-romerska riket efter 1458 byggs i `tools/riken.py` ihop av andra poster (`EXTEND`). Här räknas bara rikets egna poster, så Centraleuropa 1475–1800 ser lite sämre täckt ut än det är.
- Sammanslagningar inom parentes överlappar med sina delar, som också står i listorna.

## Resultat (genererat)

Andel av Cliopatrias land (alla stater i filen det året) som våra riken täcker. Ytor i miljoner km².

| År | Cliopatrias land | Våra riken | Andel |
|---|---:|---:|---:|
| 3400 f.Kr. | 0.0 | 0.0 | 0 % |
| 3300 f.Kr. | 0.0 | 0.0 | 0 % |
| 3200 f.Kr. | 0.0 | 0.0 | 0 % |
| 3100 f.Kr. | 0.0 | 0.0 | 0 % |
| 3000 f.Kr. | 0.1 | 0.0 | 0 % |
| 2900 f.Kr. | 0.1 | 0.0 | 0 % |
| 2800 f.Kr. | 0.1 | 0.0 | 0 % |
| 2700 f.Kr. | 0.2 | 0.0 | 0 % |
| 2600 f.Kr. | 0.2 | 0.0 | 0 % |
| 2500 f.Kr. | 0.2 | 0.1 | 39 % |
| 2400 f.Kr. | 0.2 | 0.1 | 39 % |
| 2300 f.Kr. | 1.2 | 0.1 | 7 % |
| 2200 f.Kr. | 1.2 | 0.0 | 0 % |
| 2100 f.Kr. | 1.0 | 0.0 | 0 % |
| 2000 f.Kr. | 1.0 | 0.0 | 0 % |
| 1900 f.Kr. | 1.0 | 0.0 | 0 % |
| 1800 f.Kr. | 1.0 | 0.1 | 8 % |
| 1700 f.Kr. | 0.8 | 0.1 | 8 % |
| 1600 f.Kr. | 0.7 | 0.1 | 9 % |
| 1500 f.Kr. | 1.4 | 0.7 | 48 % |
| 1400 f.Kr. | 1.6 | 0.7 | 46 % |
| 1300 f.Kr. | 1.7 | 0.9 | 52 % |
| 1200 f.Kr. | 1.9 | 1.2 | 61 % |
| 1100 f.Kr. | 1.6 | 1.2 | 71 % |
| 1000 f.Kr. | 1.6 | 0.4 | 23 % |
| 900 f.Kr. | 2.0 | 0.6 | 30 % |
| 800 f.Kr. | 2.0 | 0.5 | 24 % |
| 700 f.Kr. | 3.0 | 1.0 | 32 % |
| 600 f.Kr. | 7.3 | 0.8 | 11 % |
| 500 f.Kr. | 8.2 | 5.8 | 70 % |
| 400 f.Kr. | 9.6 | 5.3 | 55 % |
| 300 f.Kr. | 11.6 | 6.6 | 57 % |
| 200 f.Kr. | 15.8 | 6.4 | 41 % |
| 100 f.Kr. | 16.8 | 6.6 | 39 % |
| 100 | 19.8 | 11.6 | 59 % |
| 200 | 22.4 | 10.8 | 48 % |
| 300 | 17.8 | 7.3 | 41 % |
| 400 | 20.1 | 9.0 | 45 % |
| 500 | 23.5 | 5.6 | 24 % |
| 600 | 24.0 | 6.7 | 28 % |
| 700 | 28.8 | 14.4 | 50 % |
| 800 | 32.6 | 13.3 | 41 % |
| 900 | 28.4 | 9.1 | 32 % |
| 1000 | 29.6 | 6.1 | 21 % |
| 1100 | 33.2 | 6.2 | 19 % |
| 1200 | 32.7 | 5.6 | 17 % |
| 1300 | 41.1 | 28.5 | 69 % |
| 1400 | 38.9 | 18.0 | 46 % |
| 1500 | 43.4 | 13.5 | 31 % |
| 1525 | 42.9 | 16.5 | 39 % |
| 1550 | 45.1 | 22.4 | 50 % |
| 1575 | 46.2 | 24.6 | 53 % |
| 1600 | 47.1 | 30.8 | 66 % |
| 1625 | 48.6 | 32.4 | 67 % |
| 1650 | 55.1 | 38.7 | 70 % |
| 1675 | 59.2 | 42.4 | 72 % |
| 1700 | 60.7 | 44.4 | 73 % |
| 1725 | 61.5 | 44.2 | 72 % |
| 1750 | 61.0 | 41.6 | 68 % |
| 1775 | 70.3 | 52.5 | 75 % |
| 1800 | 75.2 | 58.5 | 78 % |
| 1825 | 79.6 | 58.2 | 73 % |
| 1850 | 83.3 | 60.3 | 72 % |
| 1875 | 94.0 | 73.4 | 78 % |
| 1900 | 119.9 | 101.8 | 85 % |
| 1925 | 129.9 | 91.0 | 70 % |
| 1950 | 135.3 | 71.9 | 53 % |
| 1975 | 135.6 | 48.1 | 35 % |
| 2000 | 135.1 | 24.7 | 18 % |
| 2024 | 135.1 | 24.5 | 18 % |

### Saknade stater per världsdel

Rangordnade efter land som inte täcks av våra riken (miljoner km² × år, summerat över provåren). Världsdelen är ungefärlig, ur statens mittpunkt (Danmark hamnar till exempel i Amerika genom Grönland). Spannet är provåren då staten finns. Namn inom parentes, till exempel (Kingdom of France), är Cliopatrias sammanslagning av en stats alla delar och överlappar med delarna, som också står i listan.

#### Asien (488 stater, 33 miljarder km² × år)

| Stat i Cliopatria | Provår | Mkm² × år |
|---|---|---:|
| Kimek-Kipchak confederation | 800–1200 | 1022 |
| People's Republic of China | 1950–2024 | 915 |
| Xiongnu | 200 f.Kr.–100 | 886 |
| (Russian Federation) | 2000–2024 | 842 |
| Russian Federation | 2000–2024 | 842 |
| Kazakh Khanate | 1500–1825 | 776 |
| Tibetans | 900–1200 | 742 |
| Western Jin | 300–400 | 681 |
| Tibet | 1400–1950 | 663 |
| Tibetan Empire | 700–800 | 638 |
| Xianbei | 100–200 | 620 |
| Indus Valley Civilization | 3000 f.Kr.–1800 f.Kr. | 416 |
| Great Seljuk Empire | 1100–1200 | 403 |
| Rouran Khaganate | 500–500 | 384 |
| Liao Dynasty | 1000–1100 | 384 |
| Kushan Empire | 100–200 | 365 |
| Northern Yuan | 1400–1400 | 343 |
| Scythia | 600 f.Kr.–300 f.Kr. | 342 |
| Ghaznavid Empire | 1000–1100 | 337 |
| Sui Dynasty | 600–600 | 332 |
| White Huns | 500–500 | 330 |
| Yuezhi | 400 f.Kr.–100 f.Kr. | 319 |
| Republic of India | 1950–2024 | 318 |
| Western Göktürks | 600–600 | 311 |
| Srivijaya | 700–1200 | 310 |
| … och 463 till | | |

#### Europa (399 stater, 7 miljarder km² × år)

| Stat i Cliopatria | Provår | Mkm² × år |
|---|---|---:|
| (Kingdom of France) | 1000–1775 | 359 |
| Novgorod Republic | 1100–1400 | 249 |
| Old Kingdom of Norway | 900–1400 | 213 |
| Kingdom of Sweden | 1000–2024 | 200 |
| Kingdom of France | 1000–1775 | 200 |
| Scandinavian minor kingdoms | 500–1000 | 184 |
| (Kingdom of England) | 1000–1700 | 180 |
| Visigothic Kingdom | 500–700 | 180 |
| Kingdom of Hungary | 1000–1525 | 178 |
| Polish-Lithuanian Commonwealth | 1575–1775 | 174 |
| Denmark-Norway | 1550–1925 | 171 |
| Grand Principality of Moscow | 1300–1525 | 139 |
| Avar Khaganate | 600–800 | 137 |
| Kingdom of England | 1000–1700 | 104 |
| (Polish-Lithuania Kingdom) | 1400–1400 | 104 |
| First Bulgarian Empire | 700–1000 | 96 |
| Republic of Turkey | 1925–2024 | 96 |
| Hittites | 1600 f.Kr.–1200 f.Kr. | 91 |
| Grand Duchy of Lithuania | 1300–1400 | 89 |
| Greek City-States | 800 f.Kr.–100 f.Kr. | 89 |
| Emirate of Córdoba | 800–900 | 83 |
| Crown of Castile | 1300–1500 | 81 |
| Halych-Volhynia occupation | 1100–1200 | 81 |
| United Kingdoms of Sweden and Norway | 1825–1900 | 80 |
| Kingdom of Poland | 1000–1400 | 68 |
| … och 374 till | | |

#### Afrika (121 stater, 7 miljarder km² × år)

| Stat i Cliopatria | Provår | Mkm² × år |
|---|---|---:|
| Kingdom of Kush | 1000 f.Kr.–300 | 461 |
| Mamluk Sultanate | 1300–1500 | 332 |
| Fatimid Caliphate | 1000–1100 | 276 |
| Ptolemaic Kingdom | 300 f.Kr.–100 f.Kr. | 205 |
| Ayyubid Sultanate | 1200–1200 | 204 |
| Makuria | 400–1400 | 190 |
| Funj Sultanate | 1525–1800 | 189 |
| Almoravid Dynasty | 1100–1200 | 188 |
| Belgian Congo | 1900–1950 | 176 |
| People's Democratic Republic of Algeria | 1975–2024 | 175 |
| Republic of Sudan | 1975–2024 | 171 |
| French Fifth Republic | 1975–2024 | 169 |
| South Africa | 1950–2024 | 165 |
| Alodia | 400–1500 | 140 |
| Almohad Caliphate | 1200–1300 | 131 |
| Morocco | 1675–2024 | 127 |
| Democratic Republic of the Congo | 2000–2024 | 116 |
| Bornu Empire | 1400–1875 | 115 |
| Estado Novo | 1950–2024 | 111 |
| Middle Kingdom of Egypt | 2000 f.Kr.–1700 f.Kr. | 105 |
| Tulunids | 900–900 | 97 |
| Republic of Chad | 1975–2024 | 96 |
| Rustamid dynasty | 800–900 | 94 |
| Mali Federation | 1975–2024 | 94 |
| Republic of the Niger | 1975–2024 | 89 |
| … och 96 till | | |

#### Amerika (57 stater, 3 miljarder km² × år)

| Stat i Cliopatria | Provår | Mkm² × år |
|---|---|---:|
| Canada | 1950–2024 | 990 |
| Mayan City-States | 200 f.Kr.–800 | 307 |
| Republic of Peru | 1825–2024 | 293 |
| Bolivia | 1825–2024 | 275 |
| Denmark | 1950–2024 | 226 |
| Republic of Colombia | 1875–2024 | 206 |
| Venezuela | 1850–2024 | 188 |
| Republic of Chile | 1825–2024 | 142 |
| Later Mayan City-States | 900–1525 | 95 |
| Republic of Ecuador | 1850–2024 | 53 |
| Zapotec Civilization | 500 f.Kr.–800 | 47 |
| Haudenosaunee | 1500–1775 | 42 |
| Jesuit Reducciones | 1600–1750 | 42 |
| Republic of New Granada | 1850–1850 | 36 |
| Río de la Plata | 1825–1825 | 35 |
| Netherlands Antilles | 1825–2024 | 30 |
| Republic of Nicaragua | 1850–2024 | 26 |
| Honduras | 1850–2024 | 23 |
| Guatemala | 1850–2024 | 22 |
| Greenland | 1750–1925 | 20 |
| New France | 1625–1775 | 19 |
| Guyana | 1975–2024 | 16 |
| English Colonial Empire | 1625–1700 | 12 |
| Republic of Costa Rica | 1850–2024 | 11 |
| United Provinces of Central America | 1825–1825 | 11 |
| … och 32 till | | |

#### Oceanien (9 stater, 1 miljarder km² × år)

| Stat i Cliopatria | Provår | Mkm² × år |
|---|---|---:|
| Commonwealth of Australia | 1925–2024 | 975 |
| Papua New Guinea | 1950–2024 | 48 |
| New Zealand | 1950–2024 | 30 |
| Northern Fujiwara | 1100–1100 | 4 |
| Solomon Islands | 2000–2024 | 2 |
| New Hebrides | 1900–1975 | 2 |
| Republic of Fiji | 2000–2024 | 1 |
| Vanuatu | 2000–2024 | 1 |
| Kingdom of Fiji | 1875–1875 | 1 |

