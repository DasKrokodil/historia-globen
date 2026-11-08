# Faktarutan märker händelser före tidslinjens början (#942, alternativ A i #892)

**Datum:** 2026-11-08

**Beslut:** `MIN_YEAR` (3000 f.Kr.) behålls. Faktarutan för en händelse som börjar före det (`beforeTimelineStart(e)`, `e.start < MIN_YEAR`) har en kort rad under datumraden: "Händelsen börjar före tidslinjens början (3000 f.Kr.), så reglaget kan inte visa dess första år" (`detail.beforeScale`, fem språk). Det gäller de fem händelserna jordbrukets början, Göbekli Tepe, kilskriften, Egypten enas och Stonehenge. Alternativ B (utvidga `MIN_YEAR`) hör till #396 (Version 7).

**Motivering:** Efter en sökning stod tidslinjen på "3000 f.Kr." medan faktarutan sa till exempel "cirka 9500–8000 f.Kr.", utan förklaring (rapporten i #892). Raden förklarar skillnaden utan att ändra skalan, gamla länkar med −2999 eller något annat som hänger på tidsmodellen. Raden är text i flödet och ingen ny färg eller ikon. Att de tre äldsta bara går att nå via Sök löses inte av A.

**Test:** `tests/panel.test.mjs` (före, vid och efter gränsen, och de fem händelserna ur datan) och `tests/webblasare.mjs` ("händelser före tidslinjens början får en rad i faktarutan (#942)": de fem via Sök, raden täcker inte Stäng, ingen horisontell scroll, Eiffeltornet har ingen). Kontrollen är röd utan ändringen och grön med den, dator och mobil.
