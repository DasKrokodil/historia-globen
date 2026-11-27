# Codex-pilot: Codex skriver källförsedda händelser i temat Språk och skrift (#471)

**Datum:** 2026-11-27

## Beslut
DasKrokodil valde spår B på #471 (2026-11-27). Codex och Copilot, på Andreas konto och på DasKrokodils, får ta `redo`-issues i milstolpen **"Tema: Språk och skrift"** som uttryckligen säger "Passar: Codex" (just nu #2401, #2402 och #2403), även om de har `data` och `källkontroll`. Det gäller med följande villkor:

- Varje uppgift (årtal, plats, påstående) kommer från en källa som agenten har öppnat. Pull requesten listar källans adress och vad den säger, per händelse.
- `review` blir högst `source-checked`, aldrig `two-sources`.
- Inga omstridda frågor, till exempel språkfamiljers ursprung. En sådan fråga blir en kommentar och händelsen hoppas över.
- Fel i befintliga händelser rättas inte. De lämnas som en kommentar med källa.
- `historiker` granskar fakta i batch före release (beslut 2026-11-23).
- Modellnivå: starkaste modellen med hög resonering.

Issues i milstolpen utan "Passar: Codex" (#2400, #2404, #2405) och uppföljningarna #2406–#2408 tar Claude Code. Allt annat är oförändrat: utanför den här milstolpen tar Codex fortfarande inte `data`, `faktafel`, `källkontroll` eller riken.

## Varför
Andreas har lediga Codex-resurser, och DasKrokodil vill att temat ska kunna byggas av Codex. Claude Code tar först fram urval och källplan (#2400), så att varje Codex-issue blir avgränsat. Piloten prövar samma upplägg som "Länder" i beslutet 2026-11-27 om översättning och bilder.

## Utvärdering
När #2401–#2403 är ihopslagna och `historiker` har granskat dem (enligt beslutet om piloter 2026-11-12): hur många fakta- och källfel hittades, och hur mycket fick Claude Code rätta? Om felen var få kan upplägget utvidgas till fler teman. Om de var många återgår det till spår A (Claude Code skriver fakta).

## Berör
#471, #2400–#2408, AGENTS.md, docs/referens/codex-regler.md, docs/referens/arbetssatt.md, beslut 2026-11-23 och 2026-11-27 (codex-tar-oversattning-och-bilder).
