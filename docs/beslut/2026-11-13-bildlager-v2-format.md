# Bildlager v2: formatet med rader, tidsskivor, kind och bounds (#1325)

**Datum:** 2026-11-13 (DasKrokodils beslut i #1325, preciserat samma dag; formatet granskat av agenten `arkitekt`)

## Beslut
1. `data/bildlager.json` får formatet `historia-globen/bildlager@2`: varje post i `layers` är en rad i Lager, och varje rad har tidsskivor i `slices`. Fälten står i docs/datamodell.md och i `schemas/bildlager.schema.json`.
2. En rad har `kind`: `lager` (ritas på lagerbilden ovanpå grundkartan) eller `grund` (ersätter grundkartans land). **Formatet stöder båda redan nu.** Version 7.1 bygger forntida kust och landbryggor som `lager` (#1096). `grund` används först i version 8 (#397, #51), kräver fältet `label` och är alltid märkt.
3. En skiva är `raster` (bild) eller `vektor` (samma filform som `data/land.json`). Kusten ritas som vektor. En rasterskiva kan ha `bounds`, `[väst, syd, öst, nord]`, och täcker då ett utsnitt i stället för hela världen.
4. Radens `id` blir lagrets id. Äldre id står i `aliases`, så att delade länkar fortsätter att fungera (`images` för nattljuset).
5. Källpolicyn gäller varje skiva: `sources` (minst en) och `review` är obligatoriska, och `draft` visas inte.
6. Rasterbilder anger `width` och `height` och får vara högst 4096 × 2048 bildpunkter, så att minnet går att räkna på.
7. Ritstil för vektorer (`style`) och en finare fil för det skarpa utsnittet (`fineFile`) ingår inte. De läggs till när #1096 byggs, om de behövs.

## Varför
Sex issues i tre versioner bygger på bildlagret (#1096, #51, #249, #8, #9, #55). Det gamla formatet hade en platt lista, ett aktivt lager och alltid hela världen. Att lägga till `kind` och `bounds` nu är billigt; att lägga till dem när tre versioner har byggt var sin lösning är dyrt. Ett `lager` kan bara lägga till något ovanpå dagens karta, inte ta bort land där havet stod högre, och det är skälet till att `grund` behövs i version 8. Fält utan läsare och utan värdelista ströks, eftersom de inte går att kontrollera, och en rekonstruerad kust i mycket fin upplösning vore falsk exakthet (källpolicyn punkt 6). Arkitekturens punkt 4 bryts inte: allt ritas fortfarande ekvirektangulärt.

## Berör
`data/bildlager.json`, `schemas/bildlager.schema.json`, `docs/datamodell.md`, `scripts/validate-site.py`, `scripts/build-site.sh`, `tests/validate-schema-test.py`, `tests/fixtures/bildlager-exempel.json`. `js/layers/images.js` läser det nya formatet med oförändrat beteende (en rad med id `images`). Flera rader, `bounds`, vektor, alias i adressen (`js/controllers/address.js`) och rensning av bilder byggs i nästa pull request för #1325. Frågan om flera rasterrader får vara på samtidigt avgörs där. Hänger ihop med #1095 och #1096 (beslut 2026-11-13) och helganalysen (docs/granskningar/2026-11-13-helganalys-b-arkitektur-mot-backloggen.md, beslut 7).
