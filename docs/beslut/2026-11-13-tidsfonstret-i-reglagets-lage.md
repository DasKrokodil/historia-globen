# Tidsfönstret räknas i reglagets läge, olika långt före och efter

**Datum:** 2026-11-13 (DasKrokodil sa ja i #1319, reglagets grund 1)

## Beslut
1. Samtidigt-fönstret är 1,2 procent av reglaget åt varje håll, räknat i reglagets läge: läget minus och plus 1,2 procent, och varje kant översätts till år för sig (`windowEdges` i `js/timeline.js`).
2. Vid en segmentgräns blir fönstret därför olika långt före och efter året. Vid 5000 f.Kr. är det cirka 11 600 år bakåt, i förhistoriens glesa segment, och cirka 2 100 år framåt, där segmentet efter 3000 f.Kr. är tätare. Inne i ett segment är sidorna lika långa, som förut.
3. Visningen följer avrundningen i beslutet 2026-11-12 (tidsfönstret avrundat). Blir de två sidorna lika långa efter avrundningen visas fönstret med "±" som förut. Annars skrivs båda sidorna i klartext: "12 000 år före, 2000 år efter" (raden under årtalet och förklaringen "tonade markörer"), "inom 12 000 år före och 2000 år efter" (panelen) och "inom … år före och … år efter" i Fokus-menyn. Texterna finns i alla fem språken (`time.windowYearsAsym`, `time.windowNoteAsym`, `time.withinYearsAsym`, `focus.windowAsym`).
4. Vid reglagets ändar finns bara en kant, och den används åt båda hållen.
5. Händelselagret och linjelagret mäter det som ligger före året mot fönstrets ena sida och det som ligger efter mot den andra (`windowBefore`, `windowAfter` i tillståndet; `window` är den längre sidan).
6. Fönstret förblir en andel av tidslinjen (beslutet 2026-11-12). I Fokus är det oförändrat och lika långt åt båda hållen.

## Varför
Det gamla fönstret var en andel av reglaget omräknad till år med segmentets lutning, så förhistoriens glesa segment gav ±11 640 år i hela segmentet och nästan alla händelser räknades som "nära" vid 5000 f.Kr. (923 av 929, ingen som pågick). Minsta delen, ett lika långt fönster åt båda hållen med det kortaste avståndet, kom i v6.3.0 (#1319, kommentar 2026-11-13). Den här delen gör räkningen i reglagets läge hela vägen, utan att kapa den ena sidan, och säger öppet när sidorna är olika långa i stället för att visa en falsk symmetri.

## Berör
`js/timeline.js` (`windowEdges`, `windowSpan`, `windowYears`), `js/model.js` (`roundWindowSpan`), `js/state.js`, `js/controllers/render.js`, `js/controllers/focus.js`, `js/layers/events.js`, `js/layers/lines.js`, `data/ui/*.json`, `tests/samtidigt-fonster.test.mjs`, `tests/webblasare.mjs`, `docs/arkitektur.md`, #1319. Reglagets upplösning och avrundning av året (#1320) och fokusskalan (#1321) görs separat.
