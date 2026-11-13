# Tidslås i lägeskontraktet: reglaget låses i tur och inom lektionens år

**Datum:** 2026-11-13 (DasKrokodil sa ja i #1322, förslag P4 i helganalysen #1289)

## Beslut
1. Reglaget låses i en **tur**. I en **lektion** stannar det inom lektionens år (turens `lock.years`). Ett drag byter inte steg i turen.
2. Låset ligger i lägeskontraktet (#893): fältet `timeLock` i `MODE_RULES` (`js/state.js`) och funktionen `timeLock(modes, lessonYears)`. `Timeline` läser det vid drag, klick, tangenter, stegknappar, spelknapp och årshopp. Det strängaste läget gäller: en tur i en lektion låser helt.
3. Det som koden själv sätter (till exempel en turs steg) påverkas inte av låset.
4. Tur och lektion har inga egna spärrar på reglaget längre (`lockTimeControls` i `js/ui/tour.js` är borttagen); turen ger bara förklaringen som hovertext på de låsta stegknapparna.

## Varför
Reglaget gick att dra och klicka i en tur fast knapparna var låsta: året byttes men kortet stod kvar på samma steg, och adressen behöll det gamla året (prov: klick i `#track` i `#t=andra-varldskriget` gav år 1845 med kortet kvar på "Polen, 1 september 1939"). Spärren fanns bara på stegknapparna, så varje ny väg till tiden krävde en ny spärr. Ett lås i lägeskontraktet gäller alla vägar på en gång och förebygger den sortens fel.

## Berör
`js/state.js`, `js/timeline.js`, `js/main.js`, `js/ui/tour.js`, `css/style.css` (`.time-locked`), `tests/state.test.mjs`, `tests/webblasare.mjs`, `docs/arkitektur.md`, #1322 (före #1163, som väntar på låset).
