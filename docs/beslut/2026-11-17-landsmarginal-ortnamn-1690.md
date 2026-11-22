# Länder får en större marginal än orter i regionvyn (#1690)

**Datum:** 2026-11-17. DasKrokodil svarade 2026-11-16 "Ja enligt rekommendationen" i #1690: länder får en större marginal än orter (förslag 1 000 km), om raden i regionvyn inte blir överfull. Fortsättning på [länder över havet får namn](2026-11-16-grannlander-med-namn-1690.md).

## Beslut
1. **Landsmarginalen** (`landPadKm` i `data/ortnamn/<plats>.json`, `LAND_PAD_SHARE` i `tools/ortnamn.py`) är platsens längsta sida, minst ortmarginalen `padKm` (som är 30 % av den). Ett land utan landgräns mot platsen namnges när någon del av det ligger inom landsmarginalen från platsens gräns. Orter och hav har kvar `padKm`.
2. **Namnets punkt:** i första hand som förut, på landets delar inom `padKm` och inom ramen (Island vid Grönland, Polen och Norge vid Danmark är oförändrade). Ger de ingen punkt, läggs namnet på landets delar inom landsmarginalen, högst `landPadKm` från platsens gräns, och landet får `"far": true`.
3. **Begränsning 1, nord–syd:** namnets punkt ska ligga inom ramens nord–sydled, men får ligga utanför ramen i öst–väst (landsramen). Skärmen är bredare än hög, så regionvyn visar mer av omgivningen åt öst och väst.
4. **Begränsning 2, ordningen:** regionvyn prövar ett land med `far` först efter orterna och haven (`namePriority` 3). Det får bara plats som blir över och tränger aldrig undan en ort eller ett hav.
5. Samma källa och namnfält som förut (Natural Earth 1:10m admin 0, public domain, `NAME_SV` … `NAME_FR`). Ingen ny datakälla, inga namn skrivs för hand. `km` (landets kortaste avstånd från platsens gräns) står i filen för varje land över havet.

## Varför inte 1 000 km
De 619 km som mättes 2026-11-16 var avståndet till Macquarieön, en liten australisk ö söder om Aotearoa som är för liten för en namnpunkt. Australiens fastland ligger 1 645 km från Aotearoas gräns (Tasmanien 1 490 km). Med 1 000 km hade Australien alltså fortfarande inte fått något namn. En fast marginal som når fastlandet (över 1 600 km) hade gett Skåne (ortmarginal 40 km) och Danmark (130 km) halva Europa. En marginal som följer platsens storlek följer också regionvyn, som ramar in platsen så att den fyller cirka 65 % av bilden. Aotearoa får 2 017 km, Grönland 2 645, Sverige 1 522, Danmark 434 och Skåne 133 km.

## Varför begränsningarna
Utan dem (mätt i webbläsaren 2026-11-17) fick Aotearoa också Nya Kaledonien och Antarktis, som ligger norr och söder om bilden, och på en stor skärm (1920 × 1080) ritades tolv länder i Europa vid Grönland i stället för Grönlands och Islands orter: raden blev överfull. Med begränsningarna ritas samma namn som förut för Grönland, Danmark och Skåne i 1280 × 800, 400 × 800 och 1920 × 1080, och Aotearoa får Australien i dator och på stor skärm. I mobilbredd ligger Australien utanför bilden och får inget namn.

## Resultat (2026-11-17)
- Aotearoa: Australien (`far`), namnet i landets sydöstra del (147,8° O, 36,7° S).
- Grönland: tolv länder med `far` i filen (Norge, Ryssland, Storbritannien, Sverige, Finland, Irland, Danmark, USA, Tyskland, Estland, Lettland, Polen); inget av dem ritas i de tre storlekarna.
- Danmark: Ryssland (Kaliningrad), Litauen och Lettland med `far`; ritas inte i de tre storlekarna.
- Sverige: Belarus, Ukraina, Storbritannien, Irland och Island med `far` (Sverige har ingen regionvy).
- Skåne: oförändrat.

DasKrokodil kan ändra talet (`LAND_PAD_SHARE`) eller ta bort en begränsning; varje ändring kräver en omkörning av `python3 tools/ortnamn.py`.

## Berör
#1690, `tools/ortnamn.py`, `data/ortnamn/`, `schemas/ortnamn.schema.json`, `scripts/validate-site.py`, `js/region-markers.js`, `tests/regionvy-markorer.test.mjs`, `tests/validate-schema-test.py`, `tests/webblasare.mjs`, `docs/datamodell.md`, `docs/arkitektur.md`.
