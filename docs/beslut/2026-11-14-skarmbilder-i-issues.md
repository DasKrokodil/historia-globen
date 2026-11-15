# Skärmbilder i issues som underlag för beslut

**Datum:** 2026-11-14 (DasKrokodil)

## Beslut
1. Ett issue som beskriver en bugg, en visuell ändring eller ett förslag som DasKrokodil ska ta ställning till har skärmbilder i issuet eller i en kommentar. Gäller alla agenter, och dirigenternas order tar med regeln.
2. Bilderna ligger på grenen `skarmbilder` (ingen historia från `main`, slås aldrig ihop, raderas aldrig), en mapp per issue: `issue-<N>/fore.webp`, `efter.webp`, `forslag-a.webp`. De länkas i issuet med `https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-<N>/<fil>.webp`. Repot är publikt, så länkarna fungerar utan inloggning.
3. Bugg: en bild "före" med markering och en rad om vad man ska titta på, och en bild "efter" i pull requesten. Förslag och beslut: en bild per alternativ, märkta A, B, C som svarsalternativen i issuet. Dator (1280 px) och mobil (400 px).
4. WebP, högst cirka 150 kB per bild, inga personuppgifter, alt-text och en bildtext som säger läge (år, språk, bredd). Går en bild inte att ta skrivs det öppet i issuet; en skärmbild hittas aldrig på.
5. Bara skärmbilder pushas till `skarmbilder`, aldrig kod eller data och aldrig till `main`. Skärmbilder tas med Playwright mot den lokala servern.

## Motivering
DasKrokodil är projektledare och ska kunna avgöra visuella frågor genom att se dem, inte genom att läsa en beskrivning. GitHub tillåter inte uppladdning av bilder till issues via API:t, och bilder i `main` bloaterar historiken och går inte att länka före en pull request. En egen gren ger stabila länkar utan att `main` växer. Äldre skärmbilder i `docs/ux-review/skarmbilder/` ligger kvar.

## Berör
CLAUDE.md (Arbetssätt), grenen `skarmbilder`, orkesterns och dirigenternas order.
