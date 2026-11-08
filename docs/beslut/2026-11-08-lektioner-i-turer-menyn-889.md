# Lektionerna märks i Turer-menyn (#889)

**Datum:** 2026-11-08

## Beslut
Turer med lärarfält (`lesson`, #737) märks i menyn Turer med årskurs och tid ("Lektion · årskurs 7–9 · 30 min") och får knappen "Starta som lektion", som gör samma sak som länken `#t=<tur-id>&m=lektion` (#795). Den vanliga starten av turen är oförändrad, och turer utan lärarfält får ingen knapp. Texterna läses ur turens `lesson`-fält och ur `data/ui/` (nycklarna `tour.lessonMeta`, `tour.lessonStart`, `tour.lessonStartLabel`, på alla fem språk). Ingen årskursväljare och ingen filtrering.

Det ändrar beslutet 2026-11-07 ([lektionslage](2026-11-07-lektionslage.md)) att besökare utan länk inte ska se lektionsläget: det syns nu i Turer-menyn. Knappen "Skriv ut" är fortfarande dold i lektionsläget, så läraren skriver ut från den vanliga turen, som ligger bredvid.

## Varför
DasKrokodil valde alternativ 2 i #889. Läget gick inte att hitta utan länken, vilket gjorde det svårt att visa upp och prova. Märkningen löser det med minsta ändring och utan ny data: en ny lektion dyker upp av sig själv. Risken är liten, eftersom eleverna redan kan öppna vilken tur som helst och läget bara döljer saker.

## Berör
#889, #795, #738, #757, `js/ui/tour.js`, `css/style.css`, `data/ui/*.json`, `tests/webblasare.mjs`, `docs/arkitektur.md`.
