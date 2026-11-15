# Delade gränser vid förenkling av riken: utredning och mätning (#1765)

**Datum:** 2026-11-15. **Av:** Claude Code (DasKrokodil). **Beslut som utredningen bygger på:** DasKrokodil i #1765: först en utredning med mätning; ett nytt beroende bara om shapely inte räcker.

## Problemet
`tools/riken.py` förenklar varje rike för sig (`g.simplify(tol, preserve_topology=True)`, Douglas–Peucker). Två grannar som delar en gräns i Cliopatria får då olika förenklade gränser och ritas delvis ovanpå varandra. Att förenkla ett rike finare hjälper mot en granne men kan göra det sämre mot en annan (#1743: Moskvariket blev bättre mot Kalmarunionen men sämre mot Sibirkhanatet).

## Vad som finns utan nytt beroende
shapely 2.1 och senare (med GEOS 3.12 eller senare) har `shapely.coverage_simplify`. Den förenklar en hel täckning av grannpolygoner tillsammans (Visvalingam–Whyatt) och behåller samma linje där två polygoner möts. Sessionens miljö har shapely 2.2.0 med GEOS 3.14.1. **Inget nytt beroende behövs**, bara ett krav på shapely ≥ 2.1 i stället för "shapely" utan version.

## Mätning
Skript: `tools/forenkling_matning.py` (ändrar inga filer). Underlag: Cliopatria v0.2.1 (`cliopatria_polities_only_v021.geojson`). För varje år tas alla poster som finns året och skär regionens ruta, utom sammanslagna poster med namn inom parentes. De görs först till en giltig täckning (`buffer(0)` och, i namnordning, minus de tidigare posterna), så att råa överlapp i Cliopatria inte räknas. Sedan jämförs:

- **var för sig:** som verktyget i dag, med 0,2 grader (standard) och 0,1 grader (de finare `OVERRIDES`);
- **tillsammans:** `coverage_simplify` med den tolerans som ger lika många hörnpunkter, alltså samma filstorlek.

Överlapp = summan av alla grannpars gemensamma yta i kvadratgrader. Avvikelse = symmetrisk skillnad mot Cliopatria delat med Cliopatrias yta.

| Region | År | Riken | Metod | Överlapp (kv.grader) | Avvikelse | Hörnpunkter | Tid (ms) |
|---|---|---|---|---|---|---|---|
| Brittiska öarna | 650 | 18 | rå (Cliopatria, gjord giltig) | 0.000 | 0 | 765 | – |
| | | | var för sig, 0.2 | 0.444 | 8.6% | 186 | 1 |
| | | | tillsammans, lika många punkter (tol 0.399) | 0.000 | 10.0% | 186 | 1 |
| | | | var för sig, 0.1 | 0.175 | 3.1% | 319 | 1 |
| | | | tillsammans, lika många punkter (tol 0.183) | 0.000 | 3.1% | 320 | 1 |
| Brittiska öarna | 750 | 15 | rå (Cliopatria, gjord giltig) | 0.000 | 0 | 689 | – |
| | | | var för sig, 0.2 | 0.240 | 6.8% | 204 | 1 |
| | | | tillsammans, lika många punkter (tol 0.365) | 0.000 | 7.4% | 205 | 1 |
| | | | var för sig, 0.1 | 0.065 | 2.1% | 347 | 1 |
| | | | tillsammans, lika många punkter (tol 0.168) | 0.000 | 2.0% | 347 | 1 |
| Brittiska öarna | 850 | 15 | rå (Cliopatria, gjord giltig) | 0.000 | 0 | 993 | – |
| | | | var för sig, 0.2 | 0.388 | 9.5% | 314 | 1 |
| | | | tillsammans, lika många punkter (tol 0.381) | 0.001 | 11.6% | 313 | 1 |
| | | | var för sig, 0.1 | 0.085 | 3.2% | 521 | 1 |
| | | | tillsammans, lika många punkter (tol 0.167) | 0.001 | 3.4% | 521 | 1 |
| Brittiska öarna | 1000 | 15 | rå (Cliopatria, gjord giltig) | 0.000 | 0 | 1118 | – |
| | | | var för sig, 0.2 | 0.484 | 9.9% | 372 | 1 |
| | | | tillsammans, lika många punkter (tol 0.335) | 0.000 | 10.2% | 373 | 1 |
| | | | var för sig, 0.1 | 0.108 | 3.3% | 612 | 1 |
| | | | tillsammans, lika många punkter (tol 0.161) | 0.000 | 3.1% | 612 | 1 |
| Brittiska öarna | 1050 | 13 | rå (Cliopatria, gjord giltig) | 0.000 | 0 | 1218 | – |
| | | | var för sig, 0.2 | 0.248 | 10.3% | 418 | 1 |
| | | | tillsammans, lika många punkter (tol 0.323) | 0.000 | 9.9% | 419 | 2 |
| | | | var för sig, 0.1 | 0.098 | 3.1% | 698 | 1 |
| | | | tillsammans, lika många punkter (tol 0.155) | 0.000 | 2.9% | 698 | 1 |
| Brittiska öarna | 1100 | 11 | rå (Cliopatria, gjord giltig) | 0.000 | 0 | 989 | – |
| | | | var för sig, 0.2 | 0.336 | 9.0% | 369 | 1 |
| | | | tillsammans, lika många punkter (tol 0.296) | 0.000 | 8.6% | 370 | 1 |
| | | | var för sig, 0.1 | 0.222 | 2.8% | 595 | 1 |
| | | | tillsammans, lika många punkter (tol 0.155) | 0.000 | 2.6% | 596 | 1 |
| Ryssland och Sibirien | 1480 | 25 | rå (Cliopatria, gjord giltig) | 0.000 | 0 | 4545 | – |
| | | | var för sig, 0.2 | 3.886 | 2.4% | 1333 | 4 |
| | | | tillsammans, lika många punkter (tol 0.372) | 0.002 | 2.2% | 1335 | 5 |
| | | | var för sig, 0.1 | 1.116 | 0.9% | 2504 | 5 |
| | | | tillsammans, lika många punkter (tol 0.179) | 0.002 | 0.7% | 2505 | 4 |
| Ryssland och Sibirien | 1500 | 24 | rå (Cliopatria, gjord giltig) | 0.000 | 0 | 4350 | – |
| | | | var för sig, 0.2 | 3.539 | 2.4% | 1305 | 4 |
| | | | tillsammans, lika många punkter (tol 0.368) | 0.000 | 2.1% | 1305 | 5 |
| | | | var för sig, 0.1 | 0.933 | 0.9% | 2445 | 5 |
| | | | tillsammans, lika många punkter (tol 0.178) | 0.000 | 0.7% | 2447 | 4 |
| Ryssland och Sibirien | 1550 | 20 | rå (Cliopatria, gjord giltig) | 0.000 | 0 | 5174 | – |
| | | | var för sig, 0.2 | 2.502 | 2.8% | 1578 | 6 |
| | | | tillsammans, lika många punkter (tol 0.333) | 0.000 | 2.6% | 1579 | 6 |
| | | | var för sig, 0.1 | 0.738 | 1.1% | 2945 | 5 |
| | | | tillsammans, lika många punkter (tol 0.170) | 0.000 | 0.8% | 2944 | 5 |
| Ryssland och Sibirien | 1580 | 17 | rå (Cliopatria, gjord giltig) | 0.000 | 0 | 5430 | – |
| | | | var för sig, 0.2 | 2.829 | 2.9% | 1662 | 6 |
| | | | tillsammans, lika många punkter (tol 0.341) | 0.000 | 2.6% | 1664 | 6 |
| | | | var för sig, 0.1 | 0.631 | 1.1% | 3086 | 5 |
| | | | tillsammans, lika många punkter (tol 0.172) | 0.000 | 0.8% | 3086 | 5 |

## Resultat
- **Överlappen försvinner.** Med lika många hörnpunkter går överlappen från 0,24–0,48 kvadratgrader (0,2 grader) och 0,07–0,22 (0,1 grader) till 0,000–0,001 på Brittiska öarna. I Ryssland och Sibirien går de från 2,5–3,9 respektive 0,6–1,1 till 0,000–0,002.
- **Lika nära Cliopatria.** Avvikelsen är densamma eller mindre (Ryssland 0,7–0,8 % mot 0,9–1,1 % vid 0,1 grader). Undantaget är Brittiska öarna vid den grövsta nivån, där den är något högre (till exempel 10,0 % mot 8,6 % år 650).
- **Samma filstorlek och tid.** Hörnpunkterna är lika många per konstruktion, och tiden är 1–6 ms per år och region för båda.
- shapely räcker. Ett nytt beroende behövs inte.

## Vad som återstår innan det kan byggas in
Mätningen förenklar ett år i taget. Verktyget arbetar per rike och sätter sedan ihop perioder (`MERGE`), och mycket händer före förenklingen:

1. **Täckningen måste byggas efter verktygets egna steg.** `minus`, `fill`, `EXTEND`, `clip`, `homeland` och klippningen mot andra riken (`minus_others`) skapar gränser som inte finns i Cliopatria. Täckningen ska därför byggas av verktygets färdiga råa gränser för ett år, inte direkt ur Cliopatria.
2. **Vilka år.** Ett rikes period har en egen start, och grannarna kan ha andra. Förslag: förenkla tillsammans för varje år där något rike i regionen startar en period, och ge varje period gränsen från sitt startår. En gemensam linje mellan två riken förenklas likadant så länge dess ändpunkter (där tre riken möts) inte flyttas, så de flesta gränser blir stabila mellan åren.
3. **Överlapp i underlaget.** `coverage_simplify` kräver en giltig täckning. Cliopatrias poster överlappar ibland (till exempel Isle of Man i Northumbria och Dalriada, #1744, eller avsiktligt Holstein i Kalmarunionen och Tysk-romerska riket, #336). De måste lösas eller hållas utanför täckningen (de förenklas då som i dag).
4. **Avrundning.** Verktyget avrundar till en, två eller tre decimaler. Delade hörnpunkter avrundas likadant på båda sidor, så linjen förblir gemensam, men `DECIMALS` måste vara lika för grannar.
5. **`MIN_AREA` och `MERGE`.** Små öar tas bort, och perioder slås ihop efter förenklingen. Det fungerar som förut, men ordningen måste ses över, så att en ö inte tas bort på ena sidan av en gemensam gräns.
6. **Omkörning ger tom diff.** Det kravet (#1220) måste hålla, och `tests/riken-bevara-test.py` måste gå igenom. Alla rikesfiler ändras en gång när metoden byts.

## Rekommendation till DasKrokodil
Bygg det i två steg:

1. **Pilot bakom en flagga** i `tools/riken.py` för Brittiska öarna 500–1700 (Wessex, Mercia, Northumbria, Dalriada, Alba, Strathclyde, Kungariket Man, England, Skottland, Nordsjöväldet). Mät överlapp, filstorlek och tid i de riktiga filerna, med skärmbilder före och efter.
2. **Därefter hela kartan** om piloten håller, i en egen pull request, med granskning av `geograf`.

Ett nytt beroende behövs inte. Kravet blir shapely ≥ 2.1 (GEOS ≥ 3.12), och det skrivs i verktygets docstring och README.

**Fråga 1.** Ska piloten för Brittiska öarna byggas? **Förslag: ja.**
**Fråga 2.** Får kravet på shapely höjas till ≥ 2.1 för den som kör rikesverktyget? **Förslag: ja** (det påverkar inte sidan, bara den som bygger rikesfilerna).
