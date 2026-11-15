# Ortnamn bredvid en enskild markör i regionvyn (#1682)

Datum: 2026-11-15

## Beslut

En ort ur `data/ortnamn/` som har händelser (någon händelse inom `NAME_KM`) och vars punkt ligger under en **enskild markör** får sitt namn bredvid markören, till höger, vänster, över eller under där det är fritt, och **ingen egen prick**: markören är pricken. DasKrokodil sa ja till rekommendationen i #1682 (2026-11-15), både att det gäller en ort under en enskild markör och att det bara gäller orter med händelser.

- Orter utan händelser behåller prick och namn som förut och ritas inte under en markör.
- Högar behåller sin etikett: en hög har redan sin ort som namn (`pileName`), så ortens namn ritas inte en gång till.
- Namnet följer samma regler som övriga namn: det ligger inte på markörer, högar eller andra namn och korsar inte platsens kantlinje. Ryms ingen sida utelämnas namnet.

## Hur

`placeNames` i `js/region-markers.js` får valet `marks` (de enskilda markörernas rutor). Kandidater som träffas av en markörruta prövas bredvid rutan i stället för vid sin egen punkt, och får `dotless: true`. `js/ui/region-marks.js` skickar markörrutorna och ritar ingen prick för `dotless`. Renderingsstatus för webbläsartestet: `data-region-names-beside` på `#flat-view`.

## Motivering

Vordingborg, Ribe och Lund, som #1676 lade in, ligger just där händelserna är och fick därför aldrig något namn på kartan, inte heller inzoomat. Det ändrar bara utseendet; inga data eller texter berörs.
