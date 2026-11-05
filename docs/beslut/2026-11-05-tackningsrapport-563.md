# Täckningsrapport som mäter luckor (#563)

**Datum:** 2026-11-05 (bygger på Rikards beslut 2026-11-03 i PR #562 och #563)

## Beslut
`tools/tackning.py` skriver en daterad täckningsrapport i `docs/granskningar/tackning-ÅÅÅÅ-MM-DD.md`: händelser per period, världsdel och kategori, per sekel från 1000, balansen krig mot övrigt, andel med bild, fun fact och två källor, osäkerhet och de tio största luckorna. Rapporten mäter bara var det är tomt och skriver inga fakta och inga "saknade händelser". Världsdelarna följer `region()` i `js/model.js`. Luckorna vägs med roten ur periodens längd gånger världsdelens andel av landytan, som räknas ur vår egen grundkarta (`data/land.json`, Natural Earth) i stället för siffror ur minnet.

## Varför
Granskningarna ska också hitta det som saknas, inte bara fel i det som finns. Ett mätbart, deterministiskt underlag gör det möjligt att prioritera kärnhändelser (#452) och massimport (#61) mot de tommaste områdena. Roten ur periodens längd hindrar att långa perioder som antiken tar över hela listan.

## Berör
`tools/tackning.py`, `tests/tackning-test.py`, `.github/workflows/validate-site.yml`, `docs/arkitektur.md`, README, CLAUDE.md (täckningsrundan). Hör ihop med #556 (riken), #555 (framsteg), #452 och #61. Det äldre `tools/tackningsrapport.py` (#484) finns kvar; `tools/tackning.py` använder dess `region()`.
