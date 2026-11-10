# Platser: samlingsordet och en typ i datan (#579)

**Datum:** 2026-11-10

## Beslut
Korten om platsers historia (#579) kallas **Platser** i gränssnittet, och gruppen i Sök och följ heter "Platser". Varje plats har en **typ** i datan (till exempel landskap, delstat, land, självstyrande område), som visas på kortet som en egen rad, till exempel "Landskap i Sverige" eller "Bundesland i Tyskland". Typen översätts på alla fem språken, så att varje land kan använda sitt eget ord (delstat i USA) utan att koden ändras. Ordet **region** behåller sin betydelse som världsdel (`region.Europa`).

Samtidigt godkände DasKrokodil, efter designförslaget och pedagoggranskningen i #579: väg C (ingång via sök) plus A (tryck på kontur efter inzoomning) plus knappen "Visa i Platt karta", nutida gräns i konturen, ett eget adressfält, händelser inom platsens gräns, tryck på kontur av i lektionsläget utom i turens steg, högst tre perioder per kort, slutåret i tidsintervallet och gränskälla. Piloten är Skåne, Grönland och Aotearoa. Flagga och vapen ska med på korten.

## Varför
"Region" är redan upptaget av världsdelar i gränssnittet, och ett enda svenskt ord (landskap) passar inte Bundesländer, amerikanska delstater eller ett land som Aotearoa. En typ i datan gör att samlingsordet kan vara neutralt medan kortet säger exakt vad platsen är.

## Berör
#579, #1056 (kameran), `docs/produkt/13-ordlista.md` (ordet läggs till när bygget börjar), `docs/datamodell.md` (ny datafil för platser, namn och schema beslutas vid bygget), `docs/granskningar/2026-11-10-platskort-plan-efter-pilot.md` (planen om piloten lyckas) och `docs/beslut/2026-11-09-codex-tar-uiux-med-beslut.md`. Gränskällans val och licens, och licensen för varje flagga och vapen, kontrolleras före bygge.
