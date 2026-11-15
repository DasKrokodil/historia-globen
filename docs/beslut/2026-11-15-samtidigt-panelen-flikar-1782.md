# Samtidigt-panelen: flikar per världsdel och ihopfällt filter (#1782)

**Datum:** 2026-11-15 (DasKrokodil, [svaren i #1782](https://github.com/DasKrokodil/historia-globen/issues/1782#issuecomment-6899102912))

## Beslut
DasKrokodil valde **alternativ C** (flikar per världsdel), inte det rekommenderade A, och svarade ja eller "som rekommendationen säger" på de andra frågorna:

1. **Flikar per världsdel.** Listan i Samtidigt visar en världsdel åt gången. Fliken heter världsdelen med antalet ("Europa 9", `aria-label` "Europa, 9 händelser"). Fliken som är vald behålls när året ändras tills världsdelen blir tom; då väljs den med flest som pågår. Väljs en händelse i en annan världsdel följer fliken med.
2. **Pågår först, Nära i tid under.** Under fliken står två avsnitt, "Pågår" och "Nära i tid", var och ett med antal och högst sex rader bakom "Visa N till" (samma knapp som förut, nu per avsnitt). Pågår sedan länge ligger kvar som en hopfälld rad längst ner, för alla världsdelar. I ett tidsintervall (#755) finns bara Pågår.
3. **Orden.** "Träffar" är borta: raden under rubriken säger en gång "36 händelser pågår år 1325, 30 till inom ±40 år", och knappens namn för skärmläsare "Samtidigt, 36 pågår, 30 nära" (`panel.summary` i `data/vyer.json`).
4. **Filtret är ihopfällt som standard.** En knapp "Kategorier: alla 14" (eller "Kategorier: 11 av 14") fäller ut chipsen (`aria-expanded`). Filtret under Lager är oförändrat. Efter "Visa alla kategorier" och "Visa alla" går fokus till filterknappen.
5. **Knappen Samtidigt** visar fortfarande bara det som pågår (36), som i dag.

Stängknappen × som täckte rubriken i mobil är rättad i samma ändring (`.panel-head .panel-x` får `position: absolute` i mobilregeln för tryckytor).

## Varför
Filtret med 14 piller tog nästan halva skärmen före innehållet, "pågår" och "nära" var blandade i en lång lista, och sammanfattningen sa samma sak två gånger. Underlag: UX-granskningen i #1782 (före-bilder och skisser A, B och C på riktig data).

## Berör
`js/ui/panel.js` (flikraden, avsnitten, filterknappen), `index.html` (`#panel-filter-toggle`, `#panel-tabs`), `css/style.css`, `data/ui/*.json` (`panel.groupInside`, `panel.groupNear`, `panel.tabLabel`, `panel.regionsLabel`, `panel.filterAll`, `panel.filterSome` på fem språk), `data/vyer.json` (`panel.summary`), `data/oversattning.json`, `tests/webblasare.mjs` (hjälparna `openPanelFilters` och `panelEvent`), `docs/arkitektur.md`.

## Inte i den här ändringen
Regionvyns tidsregel (#1786), turernas händelser (#1784) och att rita på kartan i turer (#1785) är egna ärenden som väntar på beslut.
