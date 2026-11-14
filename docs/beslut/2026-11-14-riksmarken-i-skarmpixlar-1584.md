# Riksmärkena kontrolleras mot varandra i skärmpixlar (#1584)

**Datum:** 2026-11-14 (DasKrokodil: "ja" i #1584)

## Beslut (byggt)
- Två riken som ligger fritt på kartan kan hamna tätt på klotet nära kanten vid låg inzoomning (Gyllene horden och Storfurstendömet Litauen år 1420 i mobil). Det är en placeringsregel och inget dataproblem.
- `EmpireMarkers.frame()` (`js/layers/empiremarks.js`) kontrollerar därför markörerna mot varandra i skärmpixlar varje bildruta: det större riket (`areaKm2`, nytt fält `area` i `AreasLayer.marks()`) behåller sin markör, och en markör som ligger närmare än 80 % av medaljernas storlek från en större granne hålls borta den bildrutan. På lagerbilden syns då bara den lilla medaljen under. Kartan och Platt vy påverkas inte, och ingen data ändras.

## Berör
`js/layers/empiremarks.js`, `js/layers/areas.js` (`area` i `marks()`), `tests/webblasare.mjs` (ny kontroll vid år 1420; den faller utan ändringen i mobil).
