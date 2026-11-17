# #1687: reproduktionen stoppas innan regionvyn öppnas

Kontrollerat 2026-11-17 av Codex (Einzbeng) på main-commit
`cea927a039e2fe4555bd9f4a826df71e674ba7d3`.

## Resultat

Etikettfelet i #1687 är ännu inte bedömt eller rättat. Ingen produktkod har ändrats.
Playwright i Chromium, mobil 400 × 800 med pekskärm, stoppas innan regionvyn öppnas:

```text
TypeError: app.viewMode.set is not a function
    at enterGlobe (js/controllers/region.js:404:18)
    at Object.enter (js/controllers/region.js:432:23)
    at Object.showInFlat (js/controllers/places.js:147:50)
    at panel.onPlaceFlat (js/main.js:424:16)
    at Object.run (js/focus/place.js:61:73)
    at HTMLButtonElement.<anonymous> (js/ui/panel.js:799:98)
```

## Reproduktion

1. Starta webbplatsen med `python3 -m http.server 8005`.
2. Öppna `http://localhost:8005/?ny=1687#y=1721&f=place:gronland` i 400 × 800.
3. Vänta tills laddningsrutan försvunnit och platskortet visas.
4. Aktivera **Visa i regionvyn**, med pekning eller tangentbordsfokus och Enter.
5. Konsolen visar felet ovan. `#globe-region` saknar `data-region`; kamerans synfält
   står kvar på 35 i stället för regionvyns 12. Platskortet är kvar.

Samma öppningsfel inträffade vid år 2009. Den lokala provmiljön använde projektets
exakta three.js 0.160.0 lokalt och avbröt Google Fonts enligt molnpolicyn.

## Avgränsning och nästa steg

`ViewMode` i `js/ui/viewmode.js` har metoden `setSurface`, medan `enterGlobe`
anropar `set`. Det pekar på ett anrop som inte längre följer vyhanteringens
aktuella gränssnitt. Ingen rättning har provats: vyhanteringen ligger utanför
etikettbuggens avsedda filer. AGENTS.md, ”Röd kontroll eller slut på tid”, kräver
överlämning när rättningen inte är trivial och inom redan berörda filer.

#1902 ändrade `placeNames` för enskilda markörers ortnamn, inte `tagSpot` för
högarnas etiketter. Det är kodgranskning, inte bevis för hur #1687 ser ut i dag.

Efter att öppningsfelet har hanterats behöver högens namn mätas mot bildkanten
på mobil och dator, även vid år 2009 när hela urvalet visas. Därefter avgörs om
etiketträttning och kanttest fortfarande behövs. Inga kanttester har lagts till
och hela webbläsarsviten har inte körts. Rapportens dokumentationsleverans
valideras med webbplatsens byggskript; den gör inga anspråk på fungerande regionvy.
