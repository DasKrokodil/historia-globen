# Anteckningarna får en fast typ (`note.kind`) i stället för att rubriken avgör

**Datum:** 2026-11-06

## Beslut
En händelses anteckning (`note`) får fältet `kind` med ett värde ur en fast lista: `disagreement` (källorna skiljer sig), `single-source` (bara en källa), `calendar` (om kalendern), `date` (om datumet eller dateringen), `place` (om platsen), `sources` (om källorna) och `other`. Det är `kind`, inte rubrikens ordval, som avgör om anteckningen räknas som historisk osäkerhet (raden *Historisk osäkerhet* och markeringen *osäkert*, #606).

Ungefärligt eller osäkert årtal läses som förut ur `edtf` (`~`, `?`), och ungefärlig plats ur `locationPrecision`. Inget nytt osäkerhetsfält införs (#613, förslaget `uncertainty`).

## Varför
I dag räknas bara anteckningar med exakt rubriken "Källorna skiljer sig"; 31 olika rubriker gör att samma sorts osäkerhet behandlas olika. Att ge befintliga anteckningar en typ är sortering av text som redan finns och tillför inga fakta, så händelserna behöver inte källkontrolleras igen. Ett eget osäkerhetsfält hade krävt ny källgranskning av varje händelse. Typen gör det också möjligt att visa "källorna är jämförda" skilt från "dateringen är ungefärlig" (Codex helhetsanalys, fynd 4) och är grund för den källkritiska kartan (#365).

## Berör
`data/handelser/`, `schemas/event.schema.json`, `docs/datamodell.md` (fältet `note`), `js/ui/panel.js` (`uncertaintyRow`), #613, #606, #365.
