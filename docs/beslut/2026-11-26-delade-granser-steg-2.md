# Delade gränser mellan grannriken, steg 2: på i datan för två regioner (#1765)

**Datum:** 2026-11-26

## Beslut
DasKrokodil sa ja i dirigenttråden 2026-11-26 (återgivet i #1765) till steg 2 efter piloten ([beslut 2026-11-20](2026-11-20-delade-granser-pilot-1765.md)):

1. **Delade gränser slås på i datan** för **Brittiska öarna** (pilotens grupper plus **Angevinska riket**) och för nästa region, **Ryssland och Sibirien** (#1743). Rikesfilerna för de två regionerna byggs om med dem.
2. **`pip install 'shapely>=2.1'`** läggs i CI (`.github/workflows/validate-site.yml`), så att enhetsprovet `tests/riken-delade-granser-test.py` körs för varje pull request. Inget annat i arbetsflödet ändras.
3. **`OVERRIDES` och `DECIMALS` som bara fanns mot överlapp** tas bort där täckningen ersätter dem: Strathclyde och Skottland (#1721), Wessex, Mercia, Northumbria och Dalriada (#1744) och Moskvariket (#1743).
4. Övriga förslag i pilotrapporten följs där de träffar regionerna (tolerans per region med mått, skalning med cos för breddgraden, periodkanter, datumgränsen, överlapp i underlaget), eller lämnas öppna i [mätrapporten](../granskningar/2026-11-26-delade-granser-steg-2.md).

## Hur det är påslaget
Det finns ingen flagga längre. Regionerna står i `SHARED_REGIONS` i `tools/riken.py`, med grupper (eller en enskild del av en grupp), år, tolerans och breddgrad för skalningen. En vanlig körning, `python3 tools/riken.py <cliopatria.geojson>`, bygger därför exakt samma filer som ligger i repot (#1220), och `tests/riken-delade-granser-test.py` med `CLIOPATRIA=<fil>` kontrollerar det byte för byte. Verktyget kräver nu alltid shapely 2.1 eller senare med GEOS 3.12 eller senare och stannar med ett tydligt fel med en äldre. Det påverkar bara den som bygger rikesfilerna, inte sidan.

En ny region läggs till i `SHARED_REGIONS`, mäts som i mätrapporten och byggs om i en egen pull request.

| Region | Grupper | År | Tolerans | Skalning |
|---|---|---|---|---|
| Brittiska öarna | Wessex, Mercia, Northumbria, Dalriada, Strathclyde, Skottland (med Alba), Kungariket Man, England, Nordsjöväldet, Angevinska riket | 500–1708 (alla år rikena finns) | 0,1 (pilotens) | ingen |
| Ryssland och Sibirien | Moskvariket, Novgorod, Ryska tsardömet (bara den delen av Ryska imperiet), Gyllene horden (bara den delen av Mongolriket), Kazan, Astrachan, Nogajhorden, Sibirkhanatet, Kazakkhanatet, Mogulistan, Timuridriket, Buchara, Khiva, Kalmarunionen | 1294–1600 | 0,15 | x skalas med cos 55° |

## Ändrat mot piloten
- **Överlapp i underlaget ritas i båda** (punkt 2 i pilotrapporten). En yta som två riken i en region delar i Cliopatria, större än 0,01 kvadratgrader och bredare än cirka 0,04 grader, blir en egen bit i täckningen och läggs till båda. Isle of Man hålls alltså inte längre utanför: gränserna mot övriga grannar är delade också de åren, och ön ritas i båda rikena som i Cliopatria. Att ön ska gå att klicka i som ett rike gäller sidans kod och ingår inte här.
- **Perioder i en täckning slås ihop under högst `MERGE`** (0,02). Ryska imperiets 0,05 skulle annars behålla Ryska tsardömets gräns från 1582 också 1588–1594, och den överlappar då Sverige med cirka 5 kvadratgrader.
- **Datumgränsen:** verktyget stannar om en del i en region når 180°, i stället för att dra gränser tvärs över kartan. Ingen av de två regionerna gör det (längst österut 126° Ö).

## Varför
Grannar som förenklas var för sig ritas ovanpå varandra (#1743, #1744). Piloten visade att täckningen tar bort det. I de två regionerna går överlappet utöver underlaget från 37,9 till 0,2 kvadratgrad-år (Brittiska öarna) och från 647,8 till 0,05 (Ryssland och Sibirien), och gränserna ligger närmare Cliopatria. Priset är större filer för de berörda rikena (+59 % och +37 %; hela `data/empires/` +2,6 %) och mer överlapp mot grannar utanför regionerna, se mätrapporten.

## Berör
`tools/riken.py` (`SHARED_REGIONS`, `region_keys`, `cover_years`, `shared_borders`, `OVERRIDES`, `DECIMALS`), `tests/riken-delade-granser-test.py`, `.github/workflows/validate-site.yml`, `data/empires/` (de två regionernas 24 rikesfiler och `notes` i `index.json`), README, docs/arkitektur.md, [docs/granskningar/2026-11-26-delade-granser-steg-2.md](../granskningar/2026-11-26-delade-granser-steg-2.md), #1220, #1721, #1743, #1744, #1765.
