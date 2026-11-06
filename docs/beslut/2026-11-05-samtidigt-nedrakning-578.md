# Samtidigt-pausen räknas ned och fortsätter själv (#578)

**Datum:** 2026-11-05

## Beslut
Rikard beslutade i #578: när uppspelningen pausar vid ett nytt Samtidigt-kort, i vanligt läge och i fokusvyerna, visas en nedräkning och uppspelningen fortsätter sedan av sig själv. Det är ett eget val i Lager, "Fortsätt själv efter Samtidigt-kortet", på som standard; den som vill att pausen står still stänger av det. Tiden följer textens längd, minst 3 sekunder (byggt som ett ord per tredjedels sekund, högst 15 sekunder). Rör man kortet, en händelse eller tiden under nedräkningen avbryts den och uppspelningen står still. Skärmläsaren läser inte upp nedräkningen varje sekund.

## Varför
Man ska slippa trycka Fortsätt vid varje kort men ändå hinna läsa det. Den som vill läsa längre stoppar nedräkningen genom att röra kortet.

## Berör
`js/controllers/playback.js` (`ff.onNew`, nedräkningen), `index.html` (valet i Lager och `#pause-countdown`), `css/style.css`, `tests/webblasare.mjs`, `docs/arkitektur.md`. Hänger ihop med #234 och #506.
