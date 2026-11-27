# Landkortets inledning: rikesstyckena flyttas till Om kartan och källor (#2353)

**Datum:** 2026-11-27 (DasKrokodil: "Ja till alternativ 1" på #2353).

## Beslut
1. Platsens `intro` i `data/platser.json` är en **kort inledning**: vad kortet följer, och att det är ett urval (högst cirka 400 tecken per språk). Det som ligger däremellan, nämligen konturens avgränsning (Svalbard, Åland, Grönland), landets rikesperioder och luckor och andra kartanteckningar, flyttas till det nya valfria fältet **`introNotes`** (text på alla fem språk).
2. Kortet visar `introNotes` som första stycke i den **hopfällda** raden Om kartan och källor, före flaggans källa, kartanteckningarna och källorna. Knappen Visa på kartan syns därmed i kortets första skärm för alla länder.
3. Inga fakta, årtal eller översättningar ändras: uppdelningen är maskinell och förlustfri (varje språks `intro` före ändringen är lika med `intro` och `introNotes` hopsatta, kontrollerat för alla 15 berörda länder och fem språk). Platser med bara inledning och urvalsmening (Sverige, Grönland, Aotearoa, Skåne) är oförändrade.

## Varför
I dator (1280 × 800) låg Visa på kartan utanför kortets första skärm för Frankrike, Belgien, Nederländerna, Luxemburg och Tyskland (knappens topp 734–1 028 px, kortet slutar vid cirka 623 px), på grund av långa inledningar (Tyskland 21 000 tecken i kortet). Efter ändringen ligger knappen på 398–440 px för alla länder, dator och mobil. Beslutet för #1977 (knappen i kortets första skärm) gäller nu alla länder.

## Berör
`data/platser.json`, `schemas/platser.schema.json`, `js/focus/place.js`, `js/ui/panel.js` (`showSelection`, parametern `introNotes`), `tests/landskortet-riken.test.mjs`, `docs/datamodell.md`. Nya länder skriver sin inledning kort och lägger resten i `introNotes`.
