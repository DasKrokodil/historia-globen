# Missuppfattningar visas i faktarutan (#838)

**Datum:** 2026-11-07

## Beslut
Rikard bad om att bygga visningen. Faktarutan för en händelse visar nu en ruta "Vanlig missuppfattning" för varje post i `data/missuppfattningar.json` som pekar på händelsen i `events`:
- **Först:** vad många tror, och vad källorna säger.
- **Hopfälld rad** "Varifrån kom missuppfattningen?" med ursprunget.
- **Källor** och granskningsnivå ("Missuppfattningen: två källor stämmer").
- Poster med `review: "draft"` visas aldrig.
- Nivån i första steget är bara faktarutan. Egen flik under Mer och quizet "Sant eller myt?" (#850) görs först efter dina beslut.

**Poster utan händelse på globen visas inte än.** Sex av 18 poster saknar `events` (Kinesiska muren, Salem, Marie Antoinette, Sfinxen, Washingtons tänder och El Dorado) och har därför ingen faktaruta att ligga i. De ligger kvar i datan och kommer med när de får en egen plats, till exempel en lista under Mer, eller när motsvarande händelse läggs till på globen.

## Varför
Det är minsta möjliga arbete och kräver ingen ny vy: missuppfattningen visas där besökaren redan läser om händelsen. Filen laddas först när en faktaruta visas, och en faktaruta ritas även om filen inte kan laddas.

## Berör
#838, #850, `js/model.js` (`loadMisconceptions`, `misconceptionsFor`), `js/ui/panel.js` (`mythsHtml`), `css/style.css`, `data/ui/*.json` (`detail.myth.*`, `review.subject.Missuppfattningen`), `scripts/build-site.sh`, `tests/panel.test.mjs`, `tests/webblasare.mjs`. Bygger på `2026-11-07-missuppfattningar-838.md` och `2026-11-07-missuppfattningar-tonen-838.md`.
