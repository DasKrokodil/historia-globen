# CLAUDE.md: regionvyn som tredje ritväg och de nya filerna i filstrukturen (#1677)

**Datum:** 2026-11-15 (DasKrokodil sa ja i chatten till två små tillägg; CLAUDE.md ändras annars inte utan att fråga)

## Beslut
1. **Arkitektur punkt 4** (ekvirektangulär rendering) har fått en mening: regionvyn (#1641) är en tredje, skärmbunden ritväg, en lokal ekvirektangulär bild med skalan cos(mittbredden) i öst–väst som bara ritas på skärmen när en liten plats visas inzoomad. Den exporteras inte till affischen eller en fysisk globskärm, som får 4096-bilderna som förut, och bryter därför inte mot punkten. Meningen hänvisar till [2026-11-14-regionvy-steg-1a-1641.md](2026-11-14-regionvy-steg-1a-1641.md), som beskriver ritvägen.
2. **Filstrukturen** i CLAUDE.md har fått en rad vardera för `js/region-frame.js` och `js/region-markers.js` (efter `js/place-search.js`), `js/ui/region-marks.js` (efter `js/ui/flatmap.js`) och `js/controllers/region.js` (efter raden för `js/controllers/`).
3. Inget annat i CLAUDE.md är ändrat. README:ns filstruktur listar redan de fyra filerna (regionvyn står i raden om `js/controllers/`), så den är oförändrad.

## Varför
Regionvyn lade till en ritväg och fyra filer utan att CLAUDE.md sa något om dem. Utan meningen i punkt 4 kan en agent som läser "Bryt inte detta" tro att den skarpa regionkartan bryter mot beslut 1 och riva upp den, och utan raderna i filstrukturen hittar agenterna inte filerna.

## Berör
#1677, #1641, #1642, `CLAUDE.md`, `docs/beslut/2026-11-14-regionvy-steg-1a-1641.md`.
