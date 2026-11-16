# Tenochtitlan och Texcoco: källans ytor står kvar (#1443)

**Datum:** 2026-11-14 (DasKrokodil i #1443: "Följ rekommendationerna och gör A")

## Beslut
- **A: ytorna byts inte.** Cliopatrias ytor för Tenochtitlan och Texcoco 1326–1428 ser förväxlade ut, eftersom ingen av dem innehåller sin stad, men det är inte bevisat och det finns ingen andra källa för var stadsstaterna låg. Kartan visar ytorna som i källan, och avvikelsen står öppet i rutan Om kartan (`mapNote`) för Aztekriket och Texcoco på fem språk.
- **Finare förenkling för `aztekriket`** (0,03 grader, två decimaler, som Chimor och Purépecha), så att Tenochtitlan inte blir en triangel och förbundet inte ritas över Purépecha.
- **Texcoco läggs in** som egen grupp med Wikidata Q2047652 (inte Cliopatrias Q1178043, som är en förgreningssida). Rutan Om kartan säger att kartan är en tolkning med ungefärliga gränser, att 1428 är inträdet i trippelalliansen och inte ett slut, att Wikipedia anger 1200 och Cliopatria 1202, och att Wikipedia anger förbundet till 1428 i faktarutan men 1430 i brödtexten. Nivån är `source-checked`, aldrig `two-sources`.

## Motivering
Ett felaktigt byte är värre än att visa källan öppet (geografens bedömning i #1443). Texcocos yta 1202–1325 ligger också väster om staden, så felet ser ut att följa hela serien och inte bara ett ombyte 1326. Bytet prövas först med en andra källa, i en egen funktion som `fix_swapped_shapes` (#1187).

## Berör
`tools/riken.py` (`OVERRIDES`, `DECIMALS`, gruppen `texcoco`), `data/empires/index.json`, `data/empires/aztekriket.json`, `data/empires/texcoco.json`, `data/sources.json`, `tests/riken-kontrollpunkter-test.py` och `docs/datamodell.md`.
