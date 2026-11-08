# Utskriften väntar på källregistret (#879)

**Datum:** 2026-11-08

**Beslut:** Elev- och lärarbladen skrivs inte ut om `data/sources.json` inte gick att ladda. `printLesson()` ger då `'sources'`, och turkortet visar ett besked (`print.sourcesFailed`, i alla fem språken) intill knappen. Ett nytt tryck på knappen försöker ladda registret igen. Tidigare skrevs bladen ut med källornas tekniska id (till exempel `wp-diamond-sutra`) utan titel och adress.

**Motivering:** Blad med källor utan titel och adress ser färdiga ut men går inte att använda, och det är värst i Källdetektiven, ett uppdrag om just källor. Att skriva ut ändå med en varningsrad på bladet valdes bort: papper delas ut och kan inte rättas efteråt, så det är bättre att läraren ser felet innan något skrivs ut. Reserven med id finns kvar för det som inte är ett nätfel, nämligen ett källid som saknas i ett laddat register.

**Test:** `tests/webblasare.mjs`, kontrollen "utskriften väntar på källregistret och visar besked när det inte laddas (#879)". Källfilen svarar 503 första gången: inget skrivs ut och beskedet visas; sedan ett nytt försök skriver ut med källtitlar. Röd utan rättningen, grön med den.
