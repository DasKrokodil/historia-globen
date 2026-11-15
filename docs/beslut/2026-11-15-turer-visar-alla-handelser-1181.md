# Vanliga turer visar alla händelser i turens år (#1181)

**Datum:** 2026-11-15 (dokumenterat vid bygget)

## Beslut
DasKrokodil har [godkänt alternativ A i #1181](https://github.com/DasKrokodil/historia-globen/issues/1181#issuecomment-6817580590): även vanliga turer släpper vyns urval medan de pågår och återställer det vid slutet. Regeln gäller alla turer, utan ett val per tur. Den utökar lektionsregeln i [beslutet för #1139](2026-11-11-oversikt-urval-och-lektion-1139.md).

## Varför
En tur som börjar från Översikt ska visa samtidiga händelser även utanför Översikts urval, oavsett om turen byter lager. Besökaren får tillbaka sin tidigare vy när turen slutar.

## Berör
`TourPlayer.start` släpper urvalet efter ögonblicksbilden. `MODE_RULES.tur.restore` återställer redan `tag`, och utgången sätter tillbaka det efter lagren. Byte mellan turer behåller den första bilden. Turformat, uteslutningstabell och lektionsregel är oförändrade. Kontroller i `tests/state.test.mjs` och `tests/webblasare.mjs`; beskrivningar i `docs/arkitektur.md` och `docs/datamodell.md`.
