# Mer i grupper, Stöd och Lämna förslag flyttas dit (#1575, alternativ A + B)

**Datum:** 2026-11-14 (DasKrokodil: "Ja till rekommendationen" i #1575). Ändrar beslutet 2026-10-30 om att stödet står sist i Hjälp-kortet.

## Beslut
- **Menyn Mer** (och raden längst ned i Meny på mobil) har tre grupper med små rubriker: **Lär dig** (Kom igång, Hjälp, Källor, Quiz), **För skolan** (För lärare, Samtidighetsjakten) och **Hjälp projektet** (Dela, **Lämna förslag**, **Stöd ↗**).
- **Stöd** är en länk till Ko-fi som öppnas i en ny flik (`rel="noopener noreferrer"`, märkt ↗ och med skärmläsartext om ny flik). Den är **flyttad ur Hjälp** och **dold för elever i lektionsläget**. Ingen popup eller tidsstyrd vädjan.
- **Lämna förslag** finns som egen rad i Mer och ligger kvar i Hjälp (raden "Saknar du något?"), så texten i Om källorna ("… Lämna förslag i Hjälp") stämmer fortfarande.
- **Om källorna** har sist i avsnittet "Så väljer vi" en rad om projektet: "Ett hobbyprojekt med öppen källkod (GPL-3.0). Data under CC BY 4.0." med knappen **Lämna förslag**, **Stöd ↗** och **Källkod ↗** (GitHub). Det är den första platsen i gränssnittet som nämner licenserna och källkoden.

## Inte gjort här (kvar i #1575)
- Hjälp-dialogens steg 4 ("Läs om en plats", sex meningar) är inte kortad; en kortare svensk text kräver nya översättningar på fyra språk.
- Quiz och Samtidighetsjakten ligger fortfarande både i Mer och i För lärare (dubbla ingångar, "ett ord per sak" är inte uppfyllt).
- Fel i #1581: förslagsformulärets reservtext kan peka på dolda GitHub-länkar när servern svarar `disabled`.
- Gruppnamnen och Stöds nya plats är DasKrokodils ordval; ändras de är det textändringar i `data/ui/*.json`.

## Berör
`index.html` (Mer i grupper, Stöd som länk, Stöd ur Hjälp), `css/style.css` (`.extra-label`, `.extra-menu a.chip-btn`, `.src-about`, Stöd dold i lektion), `js/main.js` (Lämna förslag i Mer och i Om källorna), `js/ui/sources.js`, `data/ui/*.json` (`more.*`, `sources.about`, `sources.sourceCode`; `help.feedbackBtn` och `help.kofiLabel` också i `sv.json`), `tests/webblasare.mjs`.
