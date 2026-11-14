// Stoppen när man följer en plats eller ett tema (#1255, #1620), utan webbläsare så att testerna kan använda dem.
// playback.js visar stoppen och äger kön; här finns bara urvalet.

/**
 * Platsens eller temats stopp: händelserna med top eller major, annars alla, i tidsordning. Samma startår: den som slutar
 * först kommer först, så att en händelse det året (trohetseden i Malmö 1658) visas före en process som började då
 * (försvenskningen av Skåne 1658–1719); annars datans ordning.
 */
export function themeStops(themeEvents = []) {
  const evs = [...themeEvents].sort((a, b) => a.start - b.start || (a.end ?? a.start) - (b.end ?? b.start));
  const important = evs.filter(e => e.top || e.major);
  return important.length ? important : evs;
}

/** Nyckeln som ett visat stopp sparas under (skild från krigens och resornas). */
export const themeKey = e => 't:' + e.id;

/**
 * Stoppen som tiden passerade i ett steg och som inte har visats, i tidsordning. Alla kommer med, också flera samma år
 * (trohetseden och försvenskningen i Skåne 1658): den första visas nu och resten köas till nästa Fortsätt (#1620).
 */
export function passedThemeStops(stops, shown, passed) {
  return stops.filter(e => !shown.has(themeKey(e)) && passed(e.start));
}
