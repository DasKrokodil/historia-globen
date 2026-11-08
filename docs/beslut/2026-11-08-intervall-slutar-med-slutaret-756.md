# Intervallets riken, religioner och markörgräns (#756)

**Datum:** 2026-11-08

## Beslut
Del 3 av tidsintervallet (#569) byggs enligt inriktningen 2026-11-07 ([2026-11-07-tidsintervall-569](2026-11-07-tidsintervall-569.md)), och dessa val görs i bygget:
- **Riken och religioner visas för intervallets slutår** (alternativ A). Tillståndet får fältet `areaYear` (slutåret i ett intervall, annars hela året), så att lagren inte själva behöver känna till intervallet. Fun facts, nattljus och dagens gränser läser fortfarande `wholeYear`.
- **Etiketten "Områden visas för år N"** står under intervallet i huvudet och visas bara när Riken eller Religioner syns.
- **Markörgränsen är en inställning** (`EventsLayer.rangeMarkerLimit`), med förinställningen 300 (`DEFAULT_RANGE_MARKER_LIMIT`). Värdet kommer ur prestandarapporten (#752): ingen gräns behövs under cirka 250 markörer samtidigt, och 1900–1999 ska hållas under cirka 300. De viktigaste visas först (valda och markerade, `top`, `major`, sedan de som ligger helt inom intervallet), och resten finns kvar i listan. Raden under intervallet säger hur många av hur många som visas, så att urvalet inte ser ut som hela listan.
- Gränsen gäller bara i intervalläget.

## Varför
Läget vid slutet är ärligt om vilket år gränserna gäller, och `areaYear` ger minsta ändring av arkitekturen (ett år styr fortfarande allt, CLAUDE.md punkt 3). En inställning i stället för ett fast tal gör att gränsen kan ändras när datan växer (#61, #452) utan ändring i urvalet.

## Mätning (2026-11-08)
10× syntetisk data (som i #752), intervallet 1900–1999, 1 918 pågående händelser, Chromium med mjukvarurendering, tre varv: **5,6–5,8 bilder/s med gränsen och 5,5–5,7 utan** (ett enskilt år samma data: 5,8–6,7). Gränsen ger alltså ingen mätbar vinst i bildfrekvens här, eftersom ritningen av klotet dominerar (som #752 visade), men den begränsar antalet markörer och sprites till 300 av 1 918. Etiketterna var 64–66 med och utan gräns, eftersom etikettplaceringen redan håller nere dem. Siffrorna är relativa (delad molnmaskin).
