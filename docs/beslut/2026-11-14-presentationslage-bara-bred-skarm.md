# Presentationsläget gäller bara från 761 px (#1457)

**Datum:** 2026-11-14 (rekommendationen i #1457; ändrar punkt 5 i [2026-11-13-for-larare.md](2026-11-13-for-larare.md) från "knappen visas inte" till "läget slås inte på")

## Beslut
1. Presentationsläget (#488) slås inte på under 761 px (`max-width: 760px`, samma brytpunkt som mobilläget i CSS), varken av `?presentation=1` eller av knappen i För lärare. Det ger ingen klass `presentation-mode` och ingen Avsluta-knapp.
2. Adressparametern är oförändrad och står kvar i smal skärm. Läget ritas efter adressen och bredden, så en gammal länk som öppnas i mobil ger en vanlig sida, och samma länk ger läget på en projektor. Avsluta på bred skärm tar bort parametern som förut.
3. Ändras fönstret över gränsen (rotation, ändrad storlek, zoom) ritas läget om direkt: smalt tar bort klassen och Avsluta, brett sätter tillbaka dem om parametern står kvar. `js/controllers/presentation.js` har en enda väg för det (`render`), så inget halvt tillstånd uppstår.
4. `set(true)` ger `false` och rör inte adressen i smal skärm, så inte heller ett sent klick på knappen i För lärare (kortet öppnades bred, fönstret blev smalt) slår på något. Knappen visas fortfarande inte i smal skärm.
5. Lägeskontraktet (`MODE_RULES` i `js/state.js`) och stängregistret (`js/surfaces.js`) är oförändrade: läget är en utseendeklass och ingen yta.

## Varför
Läget är till för projektor och storskärm. I smal skärm ändrade det bara toppraden: Avsluta stod först i raden uppe till höger, raden blev bredare än skärmen, texten klipptes och knappen låg över årtalet (`#year-jump` gick inte att klicka). Att korta texten eller låta raden bryta hade gett ett läge utan nytta på mobil; att inte slå på det ger inget som kan täcka årtalet och är den minsta ändringen.

## Berör
`js/controllers/presentation.js`, `js/ui/teacher.js`, `css/style.css` (kommentar), `tests/webblasare.mjs` (avsnittet presentationsläge och För lärare), `docs/arkitektur.md`, #1315, #1457.
