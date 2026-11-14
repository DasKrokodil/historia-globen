# Lärarverktygen flyttas från turkortet till För lärare (#1583)

**Datum:** 2026-11-14 (DasKrokodil: "B" i #1583)

## Beslut (byggt)
- **Turkortet har inga lärarknappar.** "Skriv ut elev- och lärarblad" och "Kopiera lärarlänk" är borta ur turkortet, även för de turer som också är lektioner.
- **"Kopiera lärarlänk"** står vid varje lektion i **För lärare** under Mer, med besked ("Lärarlänken är kopierad", `role="status"`) i kortet. Länken har `r=lararen` och öppnar lektionen med utskriftsknappen i bandet. Rollen skrivs aldrig i adressen (oförändrat, #885).
- **Utskriften** nås från lektionsbandet för läraren: efter "Starta som lektion" (För lärare eller Turer) eller via lärarlänken.
- Texten i För lärare ("Vill du ha en länk som ger knappen …") pekar på Kopiera lärarlänk vid lektionen, på fem språk.

## Berör
`index.html`, `js/main.js`, `js/ui/tour.js` (`copyTeacherLink(tour, note)`), `js/ui/teacher.js`, `css/style.css`, `data/ui/*.json` (`teacher.copyLabel`, `teacher.printText`), `tests/webblasare.mjs` (kontrollen för #930 prövar För lärare; utskriftskontrollerna startar från lektionsbandet), `docs/arkitektur.md`.
