# Projektets adress i User-Agent och originalfilen som reserv

**Datum:** 2026-11-22 (DasKrokodil i chatten: "gör 1 och 2")

## Beslut

1. **Kontaktuppgift i anropen.** Verktygen som anropar Wikimedia (`tools/bild_hamta.py` och `tools/bildkandidater.py`) skickar projektets publika adress i User-Agent:
   ```
   https://github.com/DasKrokodil/historia-globen
   ```
   Det gör Wikimedias regler för automatiska anrop, som ber om en kontaktuppgift. Inget namn, ingen e-post och inga andra personuppgifter skickas.
2. **Originalfilen som reserv.** Nekas miniatyren (HTTP 429) hämtar `bild_hamta.py` originalfilen i stället, om den är en rasterbild som Pillow läser (JPEG, PNG, GIF, WebP eller TIFF) och högst 30 MB. Rapporten säger att bilden är gjord av originalfilen. Licensen och granskningen är desamma som förut.

## Varför

Arbetsflödet för ej hämtade bilder (beslut 2026-11-22, bildpipelinen som standard) kördes för åtta bilder. Alla fick HTTP 429 på miniatyren efter tre försök, trots att arbetsflödet väntade upp till 24 minuter. Två troliga skäl är anrop utan kontaktuppgift och nekade miniatyrer. Det är en slutsats av mönstret, inte bevisat, och nästa körning visar om ändringen hjälper.

## Berör

- `tools/bild_hamta.py` och `tools/bildkandidater.py`
- [docs/bilder-riktiga.md](../bilder-riktiga.md), anropsreglerna punkt 2 och 3
- [docs/arkitektur.md](../arkitektur.md)
