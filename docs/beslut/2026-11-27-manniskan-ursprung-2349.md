# Kategorin "Människans ursprung" (`manniskan`) räknas inte som lucka efter år 1500 (#2349)

**Datum:** 2026-11-27 (DasKrokodil: "ja till fråga 1" på #2349).

## Beslut
1. Kategorin `manniskan` behåller sitt innehåll: **människans ursprung** ("Människans ursprung" i `CATEGORIES`, `js/model.js`). Ingen ny kategori, inget nytt namn och ingen ändring av färg eller översättningar.
2. **Täckningsverktyget** (`tools/tackning.py`) räknar en tom `manniskan`-cell i en period som börjar efter år 1500 (tidigmodern tid, 1800-tal, 1900-tal, 2000-tal) som **ej tillämplig** och visar den som `–`, inte som `0`. Kategorin tas också bort från kolumnen "Tomma kategorier" i listan över de största luckorna för de perioderna. Gränsen står i `ORIGIN_ONLY` i verktyget.
3. Finns det ändå händelser i kategorin efter år 1500 visas de som vanligt.
4. Migration och levnadsvillkor tas, om de ska in, som **teman** (till exempel #161), inte som kategori.

## Varför
Releaserapporten 2026-11-26 och #2159 räknade nollan efter år 1500 som en lucka att fylla. Kategorin handlar om ursprung (57 händelser i förhistorien, 33 i antiken, 3 i medeltiden), så tomheten följer av namnet och ska inte driva urvalet mot fler händelser av en sort som inte hör hemma där.

## Berör
`tools/tackning.py`, `tests/tackning-test.py`, `docs/granskningar/tackning-2026-11-27.md` (körd om), #2159 (raden "människan efter 1500" gäller inte längre).
