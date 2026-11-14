# Rymden: första steget, `body` reserveras och månen kommer via händelsen (#14)

**Datum:** 2026-11-14 (DasKrokodil)

## Beslut
Ur förstudien i #14 (arkitekt, historiker, lärare, UX; skisser på grenen `skarmbilder`, `issue-14/`). DasKrokodil svarade ja på alla fem frågor i kommentaren om idén "tryck på händelsen på jorden, månen kommer upp", och bad att vi utgår från en riktig karta av månen.

1. **Rymden byggs i två etapper.** Etapp 1: knappen "Visa på månen" på de händelser som har en månkoppling, och en platt, schematisk månvy i en dialog. Etapp 2: månklotet, som kräver en egen beslutsfil om rendering. Inget klot byggs i etapp 1.
2. **Kopplingen ligger i en separat `data/rymd.json` (med schema), inte som fält på händelsen.** Händelsens `location` är alltid en jordplats (WGS 84) och används av platssökning, Platt vy, fokus och bågar. Posten har `eventId`, himlakropp, en selenografisk punkt, platstyp, `sources`, `review` och text på fem språk. Samma källpolicy gäller: månkoordinater och namn ska komma från öppnade källor (till exempel NASA och USGS), aldrig ur minnet. Visas en knapp bara när händelsen har en post, och tas filen bort försvinner funktionen.
3. **Månvyn är en dialog i etapp 1, inget eget läge och ingen fokustyp.** Den anmäler sig i stängregistret (`js/surfaces.js`) med Esc och en tydlig väg tillbaka till jorden, och tar fokus vid öppning och lämnar tillbaka det vid stängning. Vid hoppet stängs Samtidigt-kortet och faktarutan, så att ett kort visas i taget (kortkrocken, UX-granskningen i #14).
4. **Tiden:** jordens år styr oförändrat och visas i månvyn ("Året är 1969, jordens tid"). Månen har ingen egen tid. Reglaget ändrar inte månbilden.
5. **`body` reserveras** som eget fält i tillståndet och `b` i adressen (på samma sätt som `domain` i [2026-11-13-tidsdoman-reserverad.md](2026-11-13-tidsdoman-reserverad.md)). Värden: `earth` (standard) och `moon`; senare möjligen fler. `body` och `domain` är olika saker (himlakropp mot tidsdomän). Ett okänt värde öppnas som jorden. Fältet skrivs inte i adressen förrän en vy för en annan himlakropp byggs. I koden bör namnet vara tydligt mot DOM-elementet `body`.
6. **Beslut 1 (ekvirektangulär rendering) gäller per himlakropp.** Månens yta är också en ekvirektangulär bild (selenografisk längd och bredd), men `js/globe.js` har ett fast canvaspar, så ett månklot behöver ett eget par (förslagsvis 2048×1024) som skapas först när månen väljs, med platt reservvy. Det byggs först i etapp 2, efter en egen beslutsfil och mätning av minne på mobil.
7. **Satelliter:** bara märkta, schematiska markspår med egen data. Aldrig levande bandata (TLE, OMM): aktuella banelement är data, inte historia, CelesTraks licens är oklar och ett externt beroende kräver DasKrokodils ok.
8. **En riktig karta av månen.** Månvyn ska bygga på en verklig månkarta med en licens som går ihop med projektet (CC0, CC BY, CC BY-SA eller public domain, till exempel NASA- eller USGS-material, kontrollerad per fil), inte på en ritad skiss. Vilken karta, med källa, licens och bildstorlek, avgörs i en egen källundersökning före bygget.
9. **Texter:** skalan på månvyn märks "inte skalenlig". Ljuset och avstånden får inte ge intrycket att allt i rymden är "samtidigt". Elevtexter upp till 13 år har du-form. Ny gränssnittstext på alla fem språken. Textalternativ med `role="img"` och en tangentbordsnåbar lista.

## Motivering
Förstudien visade att ett månklot och satellitbanor ryms i beslut 1 i sak, men inte i dagens kod, och att idén om en knapp på händelsen är bättre än ett fristående klot: månen får en ingång där besökaren redan är, och tid och plats på jorden förblir i fokus. En separat datafil håller månplatser ifrån jordplatser. Att börja med en platt vy i en dialog är billigt, reversibelt och går att pröva innan klotet byggs.

## Berör
#14, #59, #60, #565, #128; `js/state.js`, `js/url-state.js`, `js/surfaces.js`, `js/ui/panel.js`, `data/rymd.json` (ny), docs/datamodell.md och docs/arkitektur.md när det byggs.
