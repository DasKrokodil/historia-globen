# Uppdrag knyts till lektion i data, ett uppdrag per lektion (#1340)

**Datum:** 2026-11-13 (DasKrokodil sa ja i #1340; ur helganalysen #1289, förslag C12)

## Beslut
1. Ett elevuppdrag i `data/uppdrag.json` kan ha fältet `lesson` med en lektionsturs id. Lektionens slutkort visar det uppdraget, och uppdraget kan bara startas i den lektionen. Kopplingen står bara i `uppdrag.json`, inte också i turens lärarfält, så att den finns på ett ställe.
2. Årsregeln från #795 är kvar som reserv: en lektion utan eget uppdrag visar uppdrag utan `lesson` vars år ligger i lektionens låsta år.
3. Varje lektion med låsta år har ett uppdrag, och hela uppdragets spann ligger inom lektionens år (testet i `tests/uppdrag.test.mjs`). Samtidighetsjakten under Mer startar det första uppdraget utan lektion.
4. Ett uppdrag går att klara bara med händelser som syns på globen utan Fokus: krigets slag (`partOf` utan `top`) räknas inte i lösbarhetsprovet.
5. Reglaget är låst i en lektion (tidslåset, #1322). Ett lektionsuppdrag ska därför gå att klara med händelser som pågår uppdragets eget år, i minst `count` världsdelar.
6. Lektion 2 (vikingatiden, åk 4–6) får jakten omkring år 1000 (950–1050) med du-form i alla språk. Lektion 1 (andra världskriget, åk 7–9) får jakten år 1945, krigets sista år och turens sista steg, med `window` 0 och artigt tilltal på tyska, spanska och franska. År 1942 prövades först, men där syns bara händelser i Europa och Amerika när reglaget är låst. Båda kräver tre världsdelar och följer definitionen av samtidigt (#1311).

## Varför
Lektionerna är låsta till 793–1068 och 1939–1945, och det enda uppdraget gällde år 1500. Slutkortet dolde därför alltid uppdraget och lektionen ledde ingenstans. En koppling i data gör att varje lektion kan få ett uppdrag som passar den, utan att något hårdkodas i JS.

## Berör
`data/uppdrag.json`, `js/uppdrag-rules.js`, `js/ui/uppdrag.js`, `js/ui/lesson.js`, `data/ui/*.json` (nyckeln `lesson.hunt` tas bort: knappen visar uppdragets titel; nya `hunt.year` och `hunt.timeYear` för uppdrag på ett enda år), `tests/uppdrag.test.mjs`, `tests/webblasare.mjs`, `docs/datamodell.md`, `docs/arkitektur.md`, #1340, #741, #795, #1311.
