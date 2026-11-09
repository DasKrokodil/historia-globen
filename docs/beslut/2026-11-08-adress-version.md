# En överspelad adress skriver inte över året och kameran (#865)

**Datum:** 2026-11-08

**Beslut:** `apply()` i `js/controllers/address.js` räknar upp en version för varje anrop. När ett fokus i en länk har laddats klart kontrolleras att inget nyare har tagit över (nyare adress eller en tur som har börjat). Samma kontroll skickas som `stale` till `startFocus`, som annars själv flyttar året, kameran och fokusraden när laddningen blir klar. Den särskilda kontrollen för lektionsläget (#795) ersätts av den allmänna, eftersom en lektion alltid är en tur.

**Motivering:** Reproducerat för en vanlig tur (`#t=forsta-varldskriget` medan ett rikesfokus laddas med fördröjda rikesfiler): steg 1 visade 1474 i stället för 1914 på både dator och mobil. Det räckte inte att rätta `apply()`; `startFocus` ställde själv in året efter laddningen (751 i nästa prov). Spärren ligger därför i båda, och är ett första steg mot versionsräknaren i #893. `js/state.js` är inte ändrad.

**Test:** `tests/webblasare.mjs`, kontrollen "en tur som startar medan ett fokus laddas behåller sitt första år och sin kamera (#865)". Röd utan rättningen, grön med den, dator och mobil.
