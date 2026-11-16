# Samtidigt väntar under en tur och stänger platskortet, och tvärtom (#1865)

Datum: 2026-11-16. Beslut av DasKrokodil i #1865 ("Ja, enligt rekommendationerna"). Fynd 1.5 och 2.5 i [baslinjegenomgången](../ux-review/2026-11-16-baslinje-per-yta.md) (#1799). Byggt ovanpå turkortet (#1866), eftersom båda ändrar `js/ui/tour.js`-sidan av turen.

## Läget före

- Skåne i Platt vy med regionvyn öppen, tryck Samtidigt: på dator la sig panelen bakom platskortet så att bara en kant syntes; på mobil la den sig över arkets knopp och raden i listan klipptes mot ett skymtande "Skåne".
- I en tur, tryck Samtidigt: på mobil låg panelen över turkortet och täckte rubriken och första texten. Knappen sa "Samtidigt 0" och panelen "Händelselagret är avstängt. Slå på Händelser", vars enda åtgärd slår på lager mitt i en tur där #1784/#1785 med flit har släckt dem.

## Beslut

1. **Samtidigt väntar under en tur.** Knappen är nedtonad och inaktiv (`aria-disabled="true"`, så att den kan få fokus och nås av tangentbord och skärmläsare) så länge klassen `touring` står på sidan, alltså under turen, på slutkortet (#1866) och i lektionsläget. Hovertexten och det tillgängliga namnet är "Samtidigt väntar tills turen är slut" (fem språk, `panel.waitsTour`); namnet börjar med det synliga ordet (WCAG 2.5.3). Ett tryck eller Enter öppnar inte listan utan läser upp förklaringen i statusraden. En lista som är öppen när turen startar stängs. Knappen går tillbaka till sitt vanliga namn och sin vanliga funktion när turen är slut.
2. **Samtidigt-panelen och platskortet är en yta.** I stängregistret (`js/surfaces.js`) har platskortet gruppen `kort`, och `sidopanel` och `kort` stänger varandra. En öppnad panel stänger kortet på samma sätt som kryssen (platsen följs kvar och Om platsen öppnar kortet igen), och ett öppnat kort stänger panelen, i bred skärm också (förut bara i smal). Den som öppnas sist vinner.
3. **Escape stänger först den senast öppnade ytan.** Eftersom panelen och kortet aldrig är öppna samtidigt stänger Escape den som är öppen; i regionvyn stänger första Escape panelen och nästa lämnar vyn (som i regionvyns Escape-kedja i dag).

## Avgränsningar

- Faktarutan för en vald händelse är inte med i gruppen: i bred skärm får Samtidigt-listan fortfarande stå bredvid den (#998, #1051), och en vald händelse stänger listan i smal skärm som förut. Temakortet och de andra urvalskorten är inte heller med; bara platskortet (`detail-place`).
- Kortet ligger i en egen grupp och inte i `sidopanel`, eftersom `closeGroup('sidopanel')` och `closeAll()` anropas när en händelse väljs och när en meny öppnas och då skulle stänga ett kort som just öppnats.
- Lektionsläget har samma väntan som en tur, eftersom lektionen är en tur. Samtidighetsjakten tar bort `touring` medan den visas över lektionens slutkort och kan därför använda listan.

## Vad som återstår och vilken fråga som behövs

- **Regionkortet (rutan "Regionvy: Skåne" med Lämna regionvyn) är inte med i gruppen.** Beslutet nämner "plats- och regionkorten", men att stänga rutan betyder att lämna regionvyn (kartan ramas om), och det skulle ske bara för att man tittar i Samtidigt. Panelen täcker rutan på mobil men lämnar vyn orörd, och Escape lämnar vyn efter panelen. Fråga till DasKrokodil: ska en öppnad Samtidigt-panel också lämna regionvyn, eller räcker det att panelen ligger över rutan? Förslag: räcker.
- På pekskärm syns inte hovertexten. Förklaringen når skärmläsare (namn och statusrad) men en seende pekanvändare ser bara en nedtonad knapp. Ett synligt tips vid trycket är ett nytt utseende och väntar på ett beslut.
- Räknaren på knappen ("Samtidigt 0") står kvar nedtonad under turen; den visar 0 eftersom turen släcker händelselagret. Att dölja den medan knappen väntar är en liten ändring som kan göras om DasKrokodil vill.
