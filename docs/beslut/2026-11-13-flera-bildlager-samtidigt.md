# Flera bildlager får vara på samtidigt (#1325)

**Datum:** 2026-11-13 (DasKrokodil sa ja i chatten, antecknat i #1325)

## Beslut
1. Flera rader ur `data/bildlager.json` får vara på samtidigt i Lager. De ritas i filens ordning på bildlagrens plats i ritordningen.
2. En bild laddas först när raden är på och året ligger i skivans period, och släpps ur minnet när raden stängs av eller året lämnar perioden.
3. Ingen gräns för antalet samtidiga rader sätts nu. Minnet mäts i mobil innan en gräns bestäms.
4. Del 1 av #1325 fick röra `js/layers/images.js` och byggskripten trots "inget bygge", med oförändrat beteende, så att datafilen kunde byta format och schemat prövas mot riktig data.

## Varför
Skolatlasens lager (#8, #9, #55) och en forntida kust (#1096) ska kunna visas tillsammans med andra bildlager. En avkodad rasterbild tar bredd × höjd × 4 byte: nattljuset (3600 × 1800) cirka 26 MB, och den största tillåtna bilden (4096 × 2048) cirka 34 MB. Med rensningen håller ett avstängt lager inget minne, så kostnaden följer det som faktiskt visas. Siffrorna är räknade, inte uppmätta på en telefon; därför väntar gränsen på en mätning.

## Berör
`js/layers/images.js`, `js/layers/index.js`, `js/main.js`, `js/controllers/address.js`, `tests/images.test.mjs`, `docs/datamodell.md`, `docs/arkitektur.md`, #1325. Formatet står i beslutet 2026-11-13 om bildlager v2 (`2026-11-13-bildlager-v2-format.md`), där storleksgränsen per bild skrevs som cirka 32 MB (MiB); talen här är i MB.
