# Istidens kust: den äldsta skivan börjar vid modellens äldsta steg (#2137)

**Datum:** 2026-11-22 (DasKrokodils svar på #2137 2026-11-21: "Följ rekommendationerna")

## Beslut
Den äldsta skivan i bildlagret Istidens kust (`istidens-kust-80ka` i `data/bildlager.json`) börjar vid PaleoMIST:s äldsta steg, 80 000 år före 1950, alltså `from: -78050` (1950 − 80 000), i stället för vid 81 250 år sedan (`from: -79300`). Det ersätter den delen av punkt 5 i [beslutet om istidens kust](2026-11-14-istidens-kust.md) ("den äldsta från 81 250 år sedan"). Resten av punkt 5 gäller som förut: varje skiva gäller fram till mitten mot nästa steg, den yngsta till 7 500 år sedan, och modellens år räknas före 1950 (BP).

## Varför
PANGAEA-sidan för datamängden (Gowan 2019, https://doi.org/10.1594/PANGAEA.905800, öppnad 2026-11-22) säger att rekonstruktionen gäller "the past 80000 years, at 2500 year time steps". Före 80 000 år sedan finns inget modellsteg, och kartan ska inte visa en modellerad kust för en tid som modellen inte täcker (källpolicyn punkt 6, ingen falsk exakthet). Fyndet kom från expertgranskningen före v6.4.0 (#1704, punkt 15).
