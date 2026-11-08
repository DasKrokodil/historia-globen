# Kopiera lärarlänk i turkortet (#930)

**Datum:** 2026-11-08

**Beslut:** Turkortet i den fria vyn har för turer med lärarfält en knapp "Kopiera lärarlänk" bredvid "Skriv ut elev- och lärarblad". Den kopierar lektionslänken med `r=lararen` (`teacherLink()` i `js/ui/print-sheet.js`), på samma sätt som Dela: urklipp, annars en ruta att kopiera ur. Bekräftelsen annonseras (`role="status"`, samma rad som utskriftsbeskedet, i grönt). Knappen syns inte i lektionsläget, och lärarlänken skrivs aldrig i adressen och står inte på lärarbladen.

**Motivering:** #885 gav läraren en väg till bladen via `r=lararen`, men ingen väg att få länken. Lärarbladet kunde inte få en extra rad (A4-gränsen, #757), och Dela ger medvetet bara elevlänken. DasKrokodil sa ja till knappen 2026-11-08.

**Test:** `tests/url-state.test.mjs` (länkens form) och `tests/webblasare.mjs` ("Kopiera lärarlänk ger en länk som öppnar lektionen med utskriftsknappen (#930)"): ingen knapp i en tur utan lärarfält, rätt länk i urklippet, bekräftelsen, adressen utan roll, och länken öppnar lektionen med utskriftsknappen.
