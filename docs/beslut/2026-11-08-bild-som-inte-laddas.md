# En bild som inte laddas ersätts av en rad i faktarutan (#884)

**Datum:** 2026-11-08

**Beslut:** När bilden i faktarutan inte går att hämta (404 eller nätfel) döljs `<img>` och ersätts av raden "Bilden kunde inte laddas" (`image.missing`, alla fem språken). Bildtext och kreditrad står kvar. `panel.js` lyssnar på `error` med fångstläge på `#detail`, eftersom händelsen inte bubblar, och inte med ett inbyggt `onerror` i HTML:en (skarp CSP, #707).

**Motivering:** Bildytan stod kvar med bildtexten (cirka 284 px hög) och såg ut som en trasig bild, till skillnad från en händelse utan `image`, som inte får någon figur. Nu blir figuren cirka 110–120 px. I mobilens halva läge är bilden dold med CSS och hämtas inte (`loading="lazy"`), så beskedet kommer först när kortet fälls ut och bilden faktiskt behövs.

**Test:** `tests/webblasare.mjs`, "en bild som inte laddas ersätts av en rad i faktarutan (#884)": bilden för Stalingrad svarar 404, raden visas, figuren är under 160 px och bildtexten finns kvar; med bilden tillgänglig visas den som förut. Röd utan rättningen, grön med den, dator och mobil.
