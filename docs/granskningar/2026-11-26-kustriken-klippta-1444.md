# Kustriken klippta mot land: mätning före och efter (#1444, steg 2)

**Datum:** 2026-11-26. **Av:** Claude Code (DasKrokodil). **Beslut:** [docs/beslut/2026-11-26-kustriken-klipps-mot-land.md](../beslut/2026-11-26-kustriken-klipps-mot-land.md). **Före:** [2026-11-23-rikesytor-i-havet-1444.md](2026-11-23-rikesytor-i-havet-1444.md).

## Metod

- *I havet* mäts som i steg 1 (`tools/tackning.py`, `sea_share`, rad för rad var 0,05 grad mot `data/land-10m.json`). Marginalen runt kusten räknas där som hav, så en klippt yta kommer inte ner till 0 %: för ett litet rike med lång kust (Chimor 911–1201, 2 661 km²) är marginalen ensam omkring en fjärdedel av ytan.
- *Mer än 0,1° från land* är den del av ytan som ligger mer än 0,1 grad från land i Natural Earth 1:10m. Det är havet som klippningen ska ta bort, och det ska vara 0 efter.
- *Kustorter* är punkter ur Wikidata (Special:EntityData, öppnade 2026-11-26): Chan Chan Q277540, Trujillo Q214173, Tumbes Q827640, Dunadd Q233579, Marrakech Q101625, Rabat Q3551, Salé Q466046, Sevilla Q8717, Almería Q10400, Essaouira Q216939, Muskat Q3826 och Sur Q737270. Kolumnen visar de orter som ligger i riket; de är desamma före och efter i alla perioder. Iona (Q610) ligger utanför Cliopatrias Dalriada både före och efter. Orterna och sju punkter i havet (som låg i riket före men inte efter) är nya kontrollpunkter i `tests/riken-kontrollpunkter-test.py`.
- Marginalen valdes genom att mäta 0,03, 0,05, 0,08 och 0,1 grader. Med 0,1 ligger 30–40 % av Chimors ytor 911–1343 kvar som "hav" (mest marginalen själv); med 0,03 är marginalen vid Skottland bara cirka 2 km i öst–västlig led. Ingen kustort föll bort med någon av marginalerna. 0,05 är den nedre gränsen i DasKrokodils förslag (0,05–0,1).

## Resultat

| Rike | Del | Period | I havet före | efter | Mer än 0,1° från land före | efter | Hörnpunkter före → efter | Kustorter i riket (före = efter) |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Chimor | chimor | 911–1201 | 47 % | 25 % | 11 % | 0 % | 9 → 14 | Chan Chan, Trujillo |
| Chimor | chimor | 1202–1343 | 36 % | 18 % | 8 % | 0 % | 16 → 19 | Chan Chan, Trujillo |
| Chimor | chimor | 1344–1374 | 22 % | 10 % | 5 % | 0 % | 34 → 59 | Chan Chan, Trujillo |
| Chimor | chimor | 1375–1474 | 16 % | 8 % | 3 % | 0 % | 70 → 117 | Chan Chan, Trujillo, Tumbes |
| Chimor | chimor | 1475–1481 | 16 % | 8 % | 3 % | 0 % | 69 → 116 | Chan Chan, Trujillo, Tumbes |
| Dalriada | dal-riata | 540–586 | 24 % | 22 % | 1 % | 0 % | 44 → 89 | Dunadd |
| Dalriada | dal-riata | 587–611 | 25 % | 22 % | 1 % | 0 % | 49 → 97 | Dunadd |
| Dalriada | dal-riata | 612–643 | 26 % | 23 % | 1 % | 0 % | 59 → 115 | Dunadd |
| Dalriada | dal-riata | 644–749 | 29 % | 25 % | 1 % | 0 % | 52 → 95 | Dunadd |
| Dalriada | dal-riata | 750–839 | 14 % | 12 % | 0 % | 0 % | 90 → 188 | Dunadd |
| Dalriada | dal-riata | 840–899 | 8 % | 7 % | 0 % | 0 % | 38 → 82 | Dunadd |
| Almoravider | almoravider | 1056–1065 | 0 % | 0 % | 0 % | 0 % | 29 → 80 | – |
| Almoravider | almoravider | 1066–1071 | 1 % | 0 % | 0 % | 0 % | 29 → 102 | Marrakech, Essaouira |
| Almoravider | almoravider | 1072–1093 | 1 % | 1 % | 0 % | 0 % | 37 → 117 | Marrakech, Essaouira |
| Almoravider | almoravider | 1094–1110 | 1 % | 1 % | 0 % | 0 % | 59 → 191 | Marrakech, Rabat, Salé, Sevilla, Almería, Essaouira |
| Almoravider | almoravider | 1111–1125 | 1 % | 1 % | 0 % | 0 % | 63 → 194 | Marrakech, Rabat, Salé, Sevilla, Almería, Essaouira |
| Almoravider | almoravider | 1126–1138 | 1 % | 1 % | 0 % | 0 % | 76 → 223 | Marrakech, Rabat, Salé, Sevilla, Almería, Essaouira |
| Almoravider | almoravider | 1139–1151 | 3 % | 2 % | 0 % | 0 % | 53 → 158 | Marrakech, Rabat, Salé, Sevilla, Almería, Essaouira |
| Almoravider | almoravider | 1152–1205 | 31 % | 21 % | 2 % | 0 % | 10 → 24 | – (Balearerna) |
| Oman | oman | 1744–1747 | 5 % | 3 % | 1 % | 0,1 % | 175 → 189 | Sur |
| Oman | oman | 1748–1756 | 8 % | 4 % | 2 % | 0,1 % | 174 → 198 | Muskat, Sur |
| Oman | oman | 1757–1799 | 9 % | 5 % | 2 % | 0,1 % | 178 → 224 | Muskat, Sur |
| Oman | oman | 1800–1802 | 10 % | 6 % | 2 % | 0,2 % | 192 → 232 | Muskat, Sur |
| Oman | oman | 1803–1810 | 9 % | 5 % | 1 % | 0,1 % | 177 → 214 | Muskat, Sur |
| Oman | oman | 1811 | 8 % | 5 % | 1 % | 0,2 % | 187 → 213 | Sur |
| Oman | oman | 1812–1813 | 10 % | 6 % | 2 % | 0,1 % | 193 → 234 | Muskat, Sur |
| Oman | oman | 1814 | 10 % | 6 % | 2 % | 0,1 % | 181 → 222 | Muskat, Sur |
| Oman | oman | 1815–1819 | 11 % | 6 % | 2 % | 0 % | 19 → 65 | Muskat, Sur |
| Oman | oman | 1820–1829 | 10 % | 5 % | 2 % | 0 % | 21 → 66 | Muskat, Sur |
| Oman | oman | 1830–1855 | 10 % | 5 % | 2 % | 0 % | 37 → 130 | Muskat, Sur |
| Oman | oman | 1856–1869 | 11 % | 6 % | 2 % | 0 % | 26 → 72 | Muskat, Sur |
| Oman | oman | 1870–1879 | 9 % | 4 % | 2 % | 0 % | 29 → 71 | Muskat, Sur |
| Oman | oman | 1880–1897 | 9 % | 4 % | 2 % | 0 % | 33 → 109 | Muskat, Sur |
| Oman | oman | 1898–1899 | 9 % | 4 % | 2 % | 0 % | 23 → 64 | Muskat, Sur |
| Oman | oman | 1973–2024 | 6 % | 3 % | 1 % | 0 % | 31 → 109 | Muskat, Sur |
| Oman | muskat-och-oman | 1900–1912 | 10 % | 5 % | 2 % | 0 % | 37 → 78 | Muskat, Sur |
| Oman | muskat-och-oman | 1913–1915 | 32 % | 20 % | 5 % | 0 % | 29 → 56 | Muskat |
| Oman | muskat-och-oman | 1916–1919 | 26 % | 16 % | 4 % | 0 % | 34 → 70 | Muskat |
| Oman | muskat-och-oman | 1920–1921 | 8 % | 4 % | 2 % | 0 % | 40 → 86 | Sur |
| Oman | muskat-och-oman | 1922–1935 | 5 % | 3 % | 1 % | 0 % | 42 → 120 | Sur |
| Oman | muskat-och-oman | 1936–1955 | 5 % | 2 % | 1 % | 0 % | 35 → 102 | Sur |

**Perioder med mer än 20 % i havet:** 10 före och 6 efter i de fyra rikena (Chimor 911–1201 25 %, Dalriada 540–749 22–25 % och Almoravider 1152–1205 21 %). I hela rapporten från `tools/tackning.py` blir det 64 perioder i 38 riken i stället för 68 i 39.

- **Dalriada** ändras minst: Cliopatrias gräns låg redan nästan helt inom cirka 10 km från land (1 % längre ut). Det som står kvar som "hav" i mätningen är sund och vikar mellan Kintyre, Islay, Jura och Mull, inom marginalen. I skärmbilden syns nu Strathclydes kant vid Clydefjorden, som förut täcktes av Dalriadas yta i havet.
- **Almoraviderna 1152–1205** är Balearerna i Cliopatria. Öarna står kvar, och havet runt dem inom marginalen.
- **Oman 1744–1814** har 0,1–0,2 % längre än 0,1 grad från land kvar. Det ligger utanför rutan på Arabiska halvön (Östafrikas kust, som redan följer Natural Earth, #1787).
- Muskat (Q3826) ligger inte i Cliopatrias Oman 1744–1747, 1811 och 1920–1955, och Sur inte 1913–1919. Så var det också före, och det ändras inte här (Muskat 1946–1955 står i `docs/omstridda-granser.md`).

## Filstorlek och hörnpunkter

| Fil | Före (byte) | Efter (byte) | Hörnpunkter före | efter |
| --- | ---: | ---: | ---: | ---: |
| `data/empires/chimor.json` | 3 854 | 5 733 | 198 | 325 |
| `data/empires/dal-riata.json` | 5 646 | 10 289 | 332 | 666 |
| `data/empires/almoravider.json` | 5 611 | 16 068 | 356 | 1 089 |
| `data/empires/oman.json` | 32 603 | 47 283 | 1 893 | 2 924 |

Tillsammans cirka 31 kB mer. Filerna laddas först när riket behövs.

## Kontroll av att inget annat ändras

`python3 tools/riken.py <cliopatria_polities_only_v021.geojson>` på main gav alla 412 filer byte för byte lika med `data/empires/`. Med `KUST_KLIPP` ändras bara de fyra rikenas filer och en mening i `notes` i `index.json`; perioder, `areaKm2`, `label` och alla andra fält är oförändrade. Körningen med `--delade-granser` går också igenom.
