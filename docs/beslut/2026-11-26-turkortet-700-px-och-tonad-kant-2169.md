# Turkortet: 700 px i bred layout och tonad nederkant (#2169)

Datum: 2026-11-26. DasKrokodil svarade "ja till rekommendationerna" i #2169 (2026-11-21). Bygger på [beslutet om låg höjd (#2147)](2026-11-21-turkortet-lag-hojd-2147.md).

## Beslut

- Foten (Nästa, Lämna turen) rullar med texten och Fortsätt läsa döljs vid högst 600 px höjd, och i bred layout (minst 761 px bredd) vid högst 700 px. Därmed ger 1366×650 och 1280×700 tre fria textrader i stället för en. Smal layout mellan 601 och 700 px (till exempel 400×640) behåller den fasta foten och läsknappen. Gränsen står på ett ställe i JS, `LOW_WINDOW` i `js/tour-format.js`, som `js/ui/tour.js` (läsknapp, bildens plats, tonen) och `js/ui/lesson.js` (uppdragslänken) läser; CSS har samma uttryck, och `tests/lagt-turkort-2169.test.mjs` håller dem lika. Lektionens uppdragslänk följer alltså också 700 px i bred layout, så att foten inte får två olika lägen.
- I låga fönster får kortet en tonad nederkant så länge det finns mer att rulla (mer än 16 px). Det är ett `::after`-element med `position: sticky`, `pointer-events: none` och negativ marginal, så det tar ingen plats, fångar ingen pekning, har ingen text (ingen ny gränssnittstext, alltså ingen översättning) och rör inte fokus. Klassen `tour-mer-nedan` sätts av `updateMore()` i `tour.js`.
- Tonen ligger aldrig över en knapp: om foten redan sticker upp i kortets nederkant lyfts tonen med `--tour-mer-lyft` precis över den. När kortet är nedrullat tas tonen bort. Text under tonen är fortfarande läsbar när man rullar; tonen är en signal, inte ett innehåll.
- Tab från texten når Nästa utan att kortet flyttas; webbläsaren rullar bara kortets innehåll.

## Alternativ som skissades

- **A (vald):** tonad nederkant utan text (se ovan). Ingen översättning, ingen ny knapp, inget som kan fokuseras, ingen layoutändring.
- **B (förkastad):** fast rad "↓ mer" med linje och tjockare rullningslist. Skärmbild vid 800×360 visade att raden kapar kortets sista textrad, och den kräver en ny text på fem språk. Ändrar också utseendet mer än beställt.

## Kontroll

Webbläsarkontrollen `turkortet: foten rullar upp till 700 px och tonad nederkant syns (#2169) (#2147)` provar 1280×600, 1366×650, 1280×700, 800×360 och 400×600 (foten rullar, tonen finns, fångar ingen pekning och ligger inte över foten, Tab till Nästa flyttar inte kortet, tonen försvinner nedrullad och återkommer uppåt) samt oförändrade 1280×701, 1280×800, 400×640 och 400×700. Den befintliga kontrollen för #2147 provar nu också 1366×650 och 1280×700 och är inte försvagad. Provet är rött med gränsen 600 px i JS och 700 px i CSS. Firefox och WebKit kunde inte provas i den här miljön (proxyn); bara Chromium.
