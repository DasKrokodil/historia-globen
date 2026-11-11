# Undantag så att fler agenter kan arbeta parallellt

**Datum:** 2026-11-09

## Beslut
DasKrokodil sa ja till fem undantag (förslag 1–5 i chatten 2026-11-09):

1. **Delade filer räknas inte som krock** när krocken är enkel att lösa: `data/ui/*.json` och `tests/webblasare.mjs`, så länge varje pull request bara lägger till eller ändrar sina egna nycklar och kontroller, och de genererade filerna `data/events.json`, `data/genererat/` och `data/oversattning.json`, som byggs om med `tools/dela_data.py` och `tools/oversattning.py` vid ombasering. Den som slås ihop sist ombaserar. Redigeringsfilerna (`data/handelser/<period>.json`, `data/empires/index.json`, `js/`, `css/`) räknas fortfarande.
2. **Alla översättningsissues får etiketten `översättning`**, så att Codex och Copilot får ta dem enligt beslutet 2026-11-08. `redo` sätts en omgång i taget och i den ordning som redan är beslutad (tyska först, sedan spanska, sist franska), med högst en pull request per redigeringsfil.
3. **Claude Code på Einzbengs konto får skapa issues** för fel och brister den hittar, utan `redo` och utan milstolpe. Dirigenten triagerar.
4. **Einzbengs agenter får förbereda `beslut-krävs`-issues** med underlag, skisser och mätningar, men inte bygga dem.
5. **Fler data-issues får `redo` för Claude Code**, en omgång i taget efter en kökontroll. Codex och Copilot tar fortfarande inte fakta, källor, riken eller bilder.

## Varför
UI/UX-kön (6.2.0) och översättningarna rör samma språkfiler, samma testfil och samma genererade filer. Med den tidigare regeln kunde bara en sådan pull request vara öppen åt gången, och Einzbengs agenter stod still. Krockarna i de här filerna är enkla att lösa, och källpolicyn, granskningen och att bara DasKrokodil slår ihop gäller som förut.

## Berör
AGENTS.md (Aldrig, Ta ett issue, Orkestern i Codex), CLAUDE.md (Två personer, flera agenter; Etiketterna `redo` och `pågår`, punkt 5), översättningsissuen i milstolpen Språk: översättning (#776–#839), #771 och milstolpen Version 6.2.0: UI/UX uppdatering. Gränsen på fyra öppna pull requests per person är oförändrad.
