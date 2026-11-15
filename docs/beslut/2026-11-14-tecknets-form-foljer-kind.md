# Rikets tecken på kartan: formen följer `kind` (#1570)

**Datum:** 2026-11-14 (DasKrokodil valde alternativ D i #1570)

## Beslut
Formen på rikets märke på kartan visar vad tecknet är:
- **Flagga** (`kind: "flag"`, och när fältet saknas): en rektangel i flaggans egen 3:2-proportion med mörk kontur och tunn mässingslinje. Hela bilden visas, utan sträckning.
- **Symbol** (`kind: "symbol"`): en sköld. Bilden beskärs mot mitten med sköldens proportioner, utan sträckning. De teckningar som själva är sköldar (`norway-lion`, `norway-lion-axe`, `castile-leon`, `switzerland-arms`) behåller sin egen form, med mörk kant och en tunn mässingslinje runt silhuetten.
- **Modern återgivning** (`kind: "reconstruction"`): sköld som för symbol, men med streckad kontur.
Märket ritas på samma canvas på klotet (3D-markören) och i Platt vy (lagerbilden), så uttrycket är detsamma. Skärmläsartexten på markören och träffytorna är oförändrade. Teckningarna i `img/flags/` ritas inte om.

## Varför
Alla flaggfiler utom fyra är 3:2-rektanglar som tidigare pressades in i en nästan kvadratisk sköld, så motiven blev smala och mönster skars av. Sköldformen användes dessutom nästan bara för moderna flaggor, som aldrig var sköldar. Nu är formen en källkritisk signal (rektangel är flagga, sköld är tecken), i linje med [2026-11-11-flaggornas-typ-1148](2026-11-11-flaggornas-typ-1148.md), och silhuetten skiljer fortfarande rikestecknen från de runda händelsemedaljerna. Ersätter delen "sköldformat tygmärke" för flaggor i [2026-11-10-heraldiskt-flaggmarke](2026-11-10-heraldiskt-flaggmarke.md); materialkänslan (diskret väv) behålls.

## Berör
`js/layers/events.js` (`flagBadge`, `flagTexture(name, kind)`, `drawFlag`), `js/layers/areas.js`, `js/layers/empiremarks.js`, `tests/webblasare.mjs` (kontrollen "rikets tecken: flagga som rektangel, symbol som sköld"), `docs/datamodell.md` (`flags`).

## Kvar
- Litauens vytis beskärs vid sköldens kanter (alternativ E i #1570, `fit: "contain"` per post) och ska bedömas av DasKrokodil.
- Rektanglarna är ca 30 % bredare än sköldarna: trängseln i Platt vy bör följas upp.
- Vid hög zoom nära klotets kant syns en blurrig kopia bakom 3D-markören (markören ligger 1,4 % över ytan). Det fanns redan före ändringen och är inte åtgärdat här.
