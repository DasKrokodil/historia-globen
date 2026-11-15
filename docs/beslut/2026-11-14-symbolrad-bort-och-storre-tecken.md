# Rubrikens tecken blir större och raden för symboler tas bort

**Datum:** 2026-11-14 (önskemål från DasKrokodil i chatten)

## Beslut
1. Tecknet bredvid namnet i faktarutans rubrik (rikets flagga eller symbol, religionens symbol) ritas 44 px högt i stället för 22 px. Höjden styr och bredden följer teckningen, så en 3:2-flagga blir cirka 66 px bred och en kvadratisk symbol 44 px.
2. Raden under rubriken visas inte längre för en symbol (`kind: "symbol"` och rikets medalj). Den visas kvar för en flagga (`flag`) och för en modern återgivning (`reconstruction`), eftersom de två är de fall där besökaren annars kan missförstå vad bilden är. Nyckeln `facts.symbolKind.symbol` är borttagen ur alla fem språkfilerna.
3. Markörens skärmläsartext (`marks.empire.symbol`) är oförändrad, så vad tecknet är sägs fortfarande för den som använder skärmläsare.

## Varför
Symbolen är för liten för att läsas och förklaringsraden tar plats utan att ge besökaren något när tecknet redan syns. Delvis ändrar detta beslutet [2026-11-11-flaggornas-typ-1148](2026-11-11-flaggornas-typ-1148.md), som gav även symboler en rad. Källkritiken behålls där den behövs: en modern återgivning och en flagga är fortfarande märkta.

## Berör
`css/style.css` (`.detail h3 .rel-sym-h`), `js/ui/panel.js`, `data/ui/*.json`, `tests/webblasare.mjs` (kontrollen för #1148), `docs/datamodell.md` (`flags`).

## Öppet
Sköldarna på kartan fylls inte jämnt av symbolen (flaggteckningarna är 3:2 och pressas till en nästan kvadratisk sköld, `flagBadge` i `js/layers/events.js`). Alternativ tas fram separat och beslutas av DasKrokodil.
