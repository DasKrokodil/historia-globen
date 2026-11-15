# Marginal vid uppslag av punkt mot rike (#1524)

Datum: 2026-11-15

**Beslut:** uppslag av en punkt mot riken och religionsområden går genom en delad funktion, `areaAt()` i `js/area-lookup.js`. Ligger punkten inte i något område väljs det område vars gräns ligger närmast, om avståndet är under en marginal (längdgrader skalas med cos(latitud)). Standardmarginalen är 0,05 grader (`AREA_MARGIN_DEG`); religionsområdena har 0,15 (`RELIGION_MARGIN_DEG`) och riket under ett religionsklick behåller sina 0,5 (`POLITY_MARGIN_DEG`). Kartans gränser ändras inte.

**Skäl:** Cliopatrias gränser är förenklade, så Köpenhamn ligger cirka 0,015 grader utanför Danmarks gräns och fick inget rike. Religionsområdena är förenklade en gång till (Köpenhamn 0,05–0,11 grader utanför), därför en större marginal där. En punkt i havet, långt från kusten, får fortfarande inget rike.
