# Sveriges och Danmarks rikesperioder mot Cliopatria (#1264)

Datum: 2026-11-13. Gjord av Claude Code (DasKrokodil) för #1264, punkt 4 och avstämningen mot #1356 och #1263.

## Metod

- Källa: Cliopatria v0.2.1, `cliopatria_polities_only_v021.geojson` (taggen `v0.2.1` i [Seshat-Global-History-Databank/cliopatria](https://github.com/Seshat-Global-History-Databank/cliopatria), CC BY 4.0), samma fil som `tools/riken.py` använder. Alla poster vars namn innehåller Sweden, Denmark, Kalmar, Norway, Finland och Iceland listades med år och yta.
- Repots data: för punkter i Sverige, Danmark, Norge, Finland och Nordatlanten kontrollerades vilket rike i `data/empires/` som täcker punkten åren 1401, 1402, 1406, 1407, 1501, 1502, 1520, 1521, 1523, 1525, 1526, 1611, 1612, 1658, 1659, 1721, 1722, 1808, 1809, 1813, 1814, 1815, 1904, 1905, 1914, 1939, 1940, 1944, 1945, 1946 och 2024. Punkterna är ungefärliga stadskoordinater och rikesgränserna är förenklade (0,2 grader), så en punkt vid kusten kan hamna utanför.
- Årtalet då Sverige lämnade Kalmarunionen öppnades i två källor: [Kalmar Union](https://en.wikipedia.org/wiki/Kalmar_Union) (`wp-kalmar-union`) och [Gustav I of Sweden](https://en.wikipedia.org/wiki/Gustav_I_of_Sweden) (`wp-gustav-vasa`), båda 2026-11-13. Båda säger att Gustav Vasa valdes till kung 6 juni 1523 och att Sverige därmed lämnade unionen.

## Sverige

| Cliopatria-post | År i Cliopatria | Del i repot |
|---|---|---|
| `Kingdom of Sweden` | 980–1401, 1502–1520, 1526–1611 | `sverige-medeltiden` (980–1611) |
| `Swedish Empire` | 1612–1814 | `svenska-stormaktsvaldet` (1612–1721) och `sverige-1722` (1722–1814) |
| `United Kingdoms of Sweden and Norway` | 1815–1904 | `sverige-norge` |
| `Kingdom of Sweden` | 1905–2024 | `sverige-1905` |
| `Kalmar Union` | 1402–1525 | gruppen `kalmarunionen` |

- **Luckorna 1402–1501 och 1521–1525 finns, och förklaringen är Kalmarunionen.** Cliopatria har inget eget Sverige de åren. Stockholm, Uppsala, Kalmar och Åbo ligger då i gruppen Kalmarunionen, så kartan har ingen tom yta. 1502–1520 har Cliopatria Sverige och en mindre Kalmarunion (med Danmark och Norge) bredvid varandra.
- **Källorna skiljer sig om slutet:** Cliopatria räknar Sverige till unionen till och med 1525, källorna säger att Sverige lämnade den 1523. Inga gränser är ändrade. Sveriges `mapNote` nämnde bara 1402–1501; nu nämner den också 1521–1525 och 1523, på fem språk.
- Övergångarna 1611/1612, 1721/1722, 1814/1815 och 1904/1905 har inga luckor i Sverige. Finland (Åbo) går till Ryska imperiet 1809, som i Cliopatria.

## Danmark (avstämning mot #1356, för #1263)

| År | Själland och Jylland (Roskilde, Ringsted, Odense, Århus, Viborg, Ribe) |
|---|---|
| 936–1401 | Konungariket Danmark |
| 1402–1525 | Kalmarunionen |
| 1526–1814 | Danmark-Norge |
| 1815–1939 | Danmark (`danmark-1815`) |
| 1940–1944 | Nazityskland (Cliopatria räknar området till `Nazi Germany`) |
| 1945– | Danmark (`danmark`) |

- **Luckan 1526–1944 är stängd** för det danska kärnområdet. Övergångarna 1406/1407, 1525/1526, 1814/1815, 1939/1940 och 1944/1945 ger ingen tom yta på Själland eller Jylland. År 1914 är Danmark `danmark-1815`.
- **1940–1944 är Danmark inte utan rike, som PR #1356 och `docs/datamodell.md` skrev,** utan ligger i gruppen Nazityskland (utom små hål i den förenklade gränsen, till exempel vid Århus 1944), eftersom den gruppen tar med Cliopatrias ockuperade områden. `docs/datamodell.md` är rättad. Det betyder att Danmark de åren slås ihop med ett annat samtidigt rike på kartan, vilket #1084 bad oss undvika; det följer källan, och ett eget val (till exempel att visa Danmark som ockuperat område) kräver DasKrokodils beslut.
- **1402–1406:** Cliopatrias `Kingdom of Denmark` har kvar en yta på 73 km² vid ungefär 26,1° Ö, 65,7° N (i dagens finska Lappland). Den finns i repot och försvinner 1407. Den ser ut som ett fel i källdatan och borde inte visas.
- **Köpenhamn ligger cirka 0,1–0,2 grader utanför Danmarks förenklade gräns** i alla perioder (Öresundskusten förenklas bort). Rikets yta och medalj påverkas inte, men en punkt i Köpenhamn träffar inget rike. #1263 räknar händelser med Natural Earth och påverkas inte.

## Fynd utanför Sverige och Danmark

- **Norge 1814:** Cliopatria har `Kingdom of Norway` 1814, men gruppen `norge` är klippt till 1905–2024, så Oslo är utan rike 1814.
- **Överlapp vid förenklade gränser:** Ribe ligger i både Danmark och Tyska riket 1864–1920, Göteborg i både Norgesväldet och Konungariket Danmark 1401, och Helsingborg är utan rike 1815 (kusten). De beror på förenklingen.
- Danmarks kontur 1815–1921 och Island, och medaljen på Island, står redan i #1381.

## Vad som ändrades

- `data/empires/index.json`: Sveriges `mapNote` (fem språk) och källorna `wp-kalmar-union` och `wp-gustav-vasa` i faktarutan.
- `docs/datamodell.md`: Danmark 1940–1944 rättat och ett stycke om kontrollen.
- `tools/riken.py`: kommentaren om när Cliopatria har Sverige (ingen kodändring).
