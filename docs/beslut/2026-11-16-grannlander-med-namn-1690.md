# Länder över havet får namn i regionvyn (#1690)

**Datum:** 2026-11-16 (DasKrokodil: "Följ rekommendationerna" i #1690). Uppföljning av [regionvyn på globen (#1644)](../arkitektur.md) och ortnamnen (#1643).

## Beslut
1. Ortnamnsfilerna i `data/ortnamn/` namnger också länder som saknar landgräns mot platsen men ligger inom platsens marginal (`padKm`, samma som orterna och ramen). Ett land räknas när någon punkt i dess polygon i Natural Earth 1:10m admin 0 ligger högst `padKm` från platsens gräns (storcirkelavstånd mellan punkterna). Platsens eget land (för ett län landet länet ligger i, via `ADM0_A3` i `adm1_code`) och grannarna med landgräns (`boundary.neighbours`) är inte med.
2. Länderna står sist i `neighbours`, efter grannarna med landgräns, med `"sea": true` och de närmaste först. Namnets punkt läggs på de delar av landet (polygoner) som ligger inom marginalen. Ger de delarna ingen punkt i ramen tas landet inte med.
3. Samma källa (Natural Earth, public domain, `natural-earth-ortnamn`) och samma namnfält (`NAME_SV` … `NAME_FR`, engelska med `fallback` där ett språk saknas). Inga namn skrivs för hand.
4. I regionvyn prövas länderna efter grannarna med landgräns och före orter utan händelser (`namePriority` 1,5), med samma stil och samma regler mot krockar som förut. Regeln gäller alla platser, inte bara öar, så att det inte blir något undantag per plats.

## Resultat (2026-11-16)
- Grönland: Island (286 km från Grönlands gräns, marginalen är 794 km). Norge ligger också inom marginalen (439 km), men de delarna av landet ger ingen punkt i ramen, så Norge får inget namn.
- Aotearoa: inget land. Den närmaste delen av Australien i Natural Earth ligger 619 km bort, strax utanför marginalen (605 km), och Australiens fastland ligger utanför ramen (ramen börjar vid 158,4° O, fastlandet slutar vid 153,6° O i Natural Earth). Australien syns alltså på globen men får inget namn med den här regeln. Att namnge det kräver en större marginal för länder än för orter, och det är ett nytt beslut för DasKrokodil.
- Sverige: Tyskland, Lettland, Estland, Polen, Litauen, Ryssland och Nederländerna. Sverige har i dag ingen regionvy, så det syns inte.
- Danmark: Polen och Norge, i regionvyn i Platt vy.
- Skåne: oförändrat.

## Varför
`boundary.neighbours` listar bara länder med landgräns, eftersom den listan finns för att avgöra vilka händelser som hör till platsen (#1449). Regionvyn på globen visar större områden, och där syntes Island bara genom sina orter. Samma marginal som orterna gör att filen bara namnger länder som syns runt platsen.

## Berör
#1690, `tools/ortnamn.py`, `data/ortnamn/`, `schemas/ortnamn.schema.json`, `scripts/validate-site.py`, `js/region-markers.js`, `js/ui/region-marks.js`, `tests/regionvy-markorer.test.mjs`, `tests/validate-schema-test.py`, `tests/webblasare.mjs`, `docs/datamodell.md`, `docs/arkitektur.md`.
