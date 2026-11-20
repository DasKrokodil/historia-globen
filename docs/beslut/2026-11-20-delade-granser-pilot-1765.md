# Delade gränser mellan grannriken: pilot för Brittiska öarna och shapely 2.1 (#1765)

**Datum:** 2026-11-20

## Beslut
DasKrokodil sa ja i #1765 till två saker:

1. **En pilot bakom en flagga** i `tools/riken.py`: med `--delade-granser` förenklas Wessex, Mercia, Northumbria, Dalriada, Strathclyde, Skottland (med Alba), Kungariket Man, England och Nordsjöväldet tillsammans som en täckning (`shapely.coverage_simplify`) för perioder som börjar 500–1700, så att grannar får samma gräns där de möts. Flaggan är av som standard, och utan den blir rikesfilerna byte för byte som förut (#1220). Ingen rikesfil i `data/empires/` byggs om med flaggan i den här ändringen.
2. **Kravet på shapely höjs till 2.1 eller senare med GEOS 3.12 eller senare** för den som kör rikesverktyget. Det står i verktygets docstring, i README och i docs/arkitektur.md, och verktyget stannar med ett tydligt fel med en äldre shapely.

Hela kartan (steg 2) byggs inte nu. Den kräver ett nytt ja, efter rapporten [docs/granskningar/2026-11-20-delade-granser-pilot.md](../granskningar/2026-11-20-delade-granser-pilot.md).

## Varför
Grannriken som förenklas var för sig ritas delvis ovanpå varandra (#1743, #1744). Utredningen 2026-11-15 visade att `coverage_simplify` tar bort överlappen med lika många hörnpunkter. Med flaggan kan metoden prövas i de riktiga filerna för en region innan den används för hela kartan. Det påverkar inte sidan: inget nytt beroende och ingen kod på sidan ändras. shapely 2.1 behövs redan av `tools/ne_omstridda.py` (Östafrikas kust, #1787).

## Berör
`tools/riken.py` (`SHARED_GROUPS`, `cover_years`, `shared_borders`, `raw_periods`, `split_at`), `tests/riken-delade-granser-test.py`, docs/granskningar/2026-11-15-delade-granser-forenkling.md, docs/granskningar/2026-11-20-delade-granser-pilot.md, #1220, #1721, #1742, #1743, #1744.
