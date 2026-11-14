# Faktarutan och turkortet på mobil: kortet krymper (#1582)

**Datum:** 2026-11-14 (DasKrokodil: "gör som rekommenderat" i #1582)

## Beslut (byggt)
- I smal skärm (högst 760 px), under en tur eller en lektion, **krymper turkortet** medan faktarutan är öppen: det visar bara steget ("Steg 1 av 14"), stegindikatorn och Föregående och Nästa. Faktarutan står som ett ark **ovanför** det krympta kortet och täcker inte längre Nästa.
- Nästa går vidare utan att rutan stängs först (steget byter och rutan stängs, som förut), och Stäng på rutan återger hela kortet. Det är bara CSS (`:has(#detail:not([hidden]))`), ingen ny yta, och bred skärm är oförändrad (faktarutan ligger där på högersidan).
- Kortets höjd i det läget är 104 px (`--tour-reading-h`) och arkets underkant följer kortets (`--tour-card-b`, 136 eller 196 px beroende på pausraden). Det helt utfällda arket och lektionsbandet har samma gränser som förut, räknade från det krympta kortet.

## Berör
`css/style.css` (smal skärm, kortet och faktarutan), `tests/webblasare.mjs` (ny kontroll i smal skärm; den faller utan ändringen).
