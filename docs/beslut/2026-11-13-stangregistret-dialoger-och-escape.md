# Stängregistret: dialoggrupp, central Escape och fokus

**Datum:** 2026-11-13 (DasKrokodil sa ja i #1323, förslag P5 i helganalysen #1289)

## Beslut
1. Dialogerna (Källor, Hjälp, Kom igång, Quiz, förslagsformuläret) är en grupp i stängregistret: bara en är öppen, och en öppnad dialog pausar uppspelningen och nedräkningen, som inte fortsätter av sig själva.
2. Escape hanteras centralt: det översta öppna av dialog, popover (årshopp, intervallformulär), uppdrag (Samtidighetsjakten) och Turer-menyn stängs, också när fokus ligger utanför ytan, och fokus går till ytans knapp. Menyerna och panelen behåller sina egna Escape-lyssnare tills vidare, så att ett Escape inte stänger flera lager som förut ändras bara där ytan saknade lyssnare.
3. En faktaruta som öppnas från Samtidigt-listan flyttar fokus till Stäng och tillbaka till raden (eller knappen Samtidigt) när den stängs.

## Varför
Mätt: Källor öppnades år 1351 under en paus vid ett kort; 14 sekunder senare stod året på 1365 med dialogen fortfarande öppen. Fokus försvann till `body` när en faktaruta öppnades från listan, och Escape betedde sig olika per yta: årshoppet, intervallformuläret, Turer-menyn och jakten stängdes inte när fokus låg utanför dem.

## Kvar
Escape i turkortet avslutar hela turen utan fråga. Menyernas och panelens egna Escape-lyssnare flyttas in i registret i en senare omgång (ordningen mellan flera öppna lager prövas då).

## Berör
`js/surfaces.js`, `js/main.js`, `js/controllers/playback.js`, `js/controllers/range.js`, `tests/surfaces.test.mjs`, `tests/webblasare.mjs`, `docs/arkitektur.md`, #1323.
