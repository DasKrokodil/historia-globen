# Version 7: riktning och roller (#396, #49, #11, #767)

2026-11-10. Beslut av DasKrokodil efter planeringen i [docs/granskningar/2026-11-10-planering-version-7.md](../granskningar/2026-11-10-planering-version-7.md): ja enligt rekommendationerna på alla åtta frågor.

**Beslut**
1. **Alternativ B (a):** människans historia behåller dagens år och delar av år; jordens historia får en egen tidstyp (`beforePresent`) senare. Byggt i tre delar: del 1 (läsa `Y-…`, visa stora år, språkberoende talformat), del 2 (tidsreglaget går längre bak, #49), del 3 (läget Jordens historia, **version 8**). Bara del 3 ändrar arkitekturens punkt 3. Detta fastställer beslutet 2026-11-01 i #396.
2. **Hur långt bak (b):** människans läge går cirka 100 000 år bakåt som första steg. Artindelning och dateringar källkontrolleras före bygget; gränsen kan justeras om källorna kräver det.
3. **Reglagets andel (c):** högst cirka 10 % för förhistorien, men siffran avgörs av mätning i 360, 400 och 768 px. Modern tid (i dag 1800–2026 med 25 %) får inte få färre pixlar än i dag (kravet i #49).
4. **#767 (d):** förhistorien i täckningen väntar tills #49 är byggt.
5. **ROAD:** fortsätter att avstås som data (docs/beslut/2026-11-09-road-avstar.md). Först öppna källor (Wikidata, peer-reviewade översikter med CC BY); fråga ROCEEH om utdrag under CC BY om de inte räcker.
6. **Människoarterna är ett lager** med en förinställd vy i `data/vyer.json`, inte en egen vy.
7. **Osäkerhet syns alltid** på kartan och i kortet (spann, "tolkning", fyndplats skild från antaget område), med ett andra tecken än färg.
8. **Ny agent `forhistoriker`** (`.claude/agents/forhistoriker.md`, lins 15 i docs/produkt/06-granskningsperspektiv.md). Tas tillsammans med `historiker` när innehåll rör förhistoria.

**Gränser:** beslutet skapar inga issues och ändrar ingen kod eller data. Uppdelningen av #396, #49 och #11 och de nya issuesen i planeringsrapporten görs först när DasKrokodil har bett om det. Länkar till förhistorien klämms tyst i dag; efter del 2 hamnar de rätt, och en delad länk ger då olika resultat före och efter (accepterat).

**Motivering:** rekommendationerna i planeringen. Det minsta som täcker Afrika och ut ur Afrika är cirka 100 000 år (geografens bedömning, ska källkontrolleras); mätning av reglaget skyddar modern tid på mobil; osäkerheten följer källpolicyn punkt 6.
