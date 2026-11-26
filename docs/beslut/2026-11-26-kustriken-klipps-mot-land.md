# Kustriken klipps mot land i verktyget (#1444)

**Datum:** 2026-11-26 (DasKrokodils beslut i dirigenttråden, efter mätningen i `docs/granskningar/2026-11-23-rikesytor-i-havet-1444.md`)

## Beslut
Pilot: rikesytorna för fyra kustriken på fastland, Chimor (`chimor`), Dalriada (`dal-riata`), Almoravider (`almoravider`) och Oman (`oman`, med Muskat och Oman), klipps mot kusten i Natural Earth 1:10m (`data/land-10m.json`, public domain) när `tools/riken.py` bygger filerna, inte när kartan ritas (`js/layers/areas.js` är oförändrad). Det som ligger mer än **0,05 grader** (cirka 5,5 km i nord–sydlig led, cirka 3 km i öst–västlig led vid Skottland) från land klipps bort; marginalen gör att kuststäder, hamnar, flodmynningar och småöar nära kusten står kvar. Ö-stater och skärgårdsriken klipps inte. `areaKm2` är fortfarande Cliopatrias siffra och räknar med havet; Chimors `mapNote` säger det på fem språk.

## Hur
- `KUST_KLIPP` i `tools/riken.py` listar grupperna med en ruta var. Havet i rutan är rutan minus landet med marginalen runt (kustlinjen förenklad 0,02 grader, mindre än marginalen, så att allt land står kvar). Det klipps sist, efter förenklingen och efter `DISPUTED` (som `efter` och `dec`), så perioderna, sammanslagningen och namnets plats blir desamma. Bara de delar av gränsen som havet når räknas om och avrundas till två decimaler; resten behåller sina koordinater. Rester under cirka 6 km² tas bort.
- Omans ruta omfattar bara Arabiska halvön och Hormuzsundet. Östafrikas kust följer redan Natural Earth (#1787), och Gwadar ligger utanför rutan.
- Almoraviderna 1152–1205 är i Cliopatria Balearerna (Mallorca, Menorca, Ibiza). Öarna står kvar; bara havet mellan och runt dem längre ut än marginalen försvinner.
- Utan `KUST_KLIPP` blir alla filer byte för byte som förut; med den ändras bara de fyra rikenas filer och en mening i `notes` i `data/empires/index.json`.

## Varför
Mätningen visade att 10 perioder i de fyra rikena hade mer än 20 % av ytan i havet (Chimor 911–1201 47 %). Klippningen i verktyget ändrar inte kartans ritning för andra riken, och marginalen 0,05 grader (DasKrokodils förslag 0,05–0,1) valdes efter mätning: 0,1 grader lämnar 30–40 % av Chimors tidiga ytor som hav, medan 0,05 behåller alla kustorter i punktproven och ger inga ytor längre än 0,1 grader från land (`docs/granskningar/2026-11-26-kustriken-klippta-1444.md`).

## Berör
`tools/riken.py` (`KUST_KLIPP`, `land_10m`, `kust_hav`, `klipp_kust`), `data/empires/{chimor,dal-riata,almoravider,oman,index}.json`, `tools/tackning.py` (texten om klippningen), `tests/tackning-test.py`, `tests/riken-kontrollpunkter-test.py`, `tests/fixtures/chimor-oklippt-1444.json`. Bygger på #1444 (steg 1), #1787 (Östafrikas kust) och #1765 (delade gränser, där Dalriada ingår; klippningen görs efter den delade förenklingen). Fler kustriken kräver ett nytt beslut.
