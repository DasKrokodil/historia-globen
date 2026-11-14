# Noteringar, källor och status på korten: tre nivåer, resans ruta som pilot (#1571)

**Datum:** 2026-11-14 (DasKrokodil valde alternativ E i #1571)

## Beslut
Sekundär information på korten ordnas i tre nivåer:
1. **Alltid synligt:** märkningen "Illustration, inte en historisk bild", osäkerhetsrader och notens rubrik som en hopfälld rad med vinkel (så att det syns att källorna skiljer sig eller att något är osäkert utan att texten måste läsas), samt granskningsstatus.
2. **Hopfällt per notering:** själva noten.
3. **En hopfälld rad längst ned** med antal källor och status ("Källor (6) · Resan: källkontrollerad"): källor, och rapportera faktafel. För faktarutan kommer samma mönster ("Om uppgifterna") i en senare pull request.

Piloten är resans klickruta (`js/ui/routepop.js`): ordningen är rubrik, tid, sammanfattning, notrad, "Läs mer", källrad. Rutan är 340 px bred (var 260), så att sammanfattningen och "Läs mer" ryms utan rullning. Utfällda avsnitt står kvar öppna när rutan ritas om (källregistret laddas sent). Långa sammanfattningar delas i korta stycken om högst två meningar; texten ändras inte. Ny nyckel `route.sourcesCount` på alla fem språken.

## Varför
Noterna om oenighet i dateringar är upp till 1 340 tecken och fyllde rutan så att "Läs mer", källorna och statusen hamnade under vikningen. Källpolicyn kräver att osäkerhet och oense källor visas öppet: notens rubrik står därför kvar synlig. DasKrokodil bad också om kortare, lättare faktatexter; att korta själva texterna är ett innehållsarbete med källkontroll och översättning och är inte gjort här.

## Berör
`js/ui/routepop.js`, `css/style.css` (`.route-pop`, `.rp-disc`), `data/ui/*.json` (`route.sourcesCount`), `tests/webblasare.mjs` ("resans ruta: noten och källorna är hopfällda …").

## Kvar i #1571
Upptäcktsvyns panel (`discovery.readTitle`, `discovery.imagesTitle`), händelsens faktaruta ("Om uppgifterna", `detail.aboutData`), nyckeln `how.agree.differ` ("Se anteckningen ovan"), samt att korta faktatexterna.
