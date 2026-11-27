# Händelser vid gränsen räknas till landet med en lista per plats (#2333)

**Datum:** 2026-11-27 (DasKrokodils beslut i chatten: "väg 1, en lista per plats")

## Beslut
En plats i `data/platser.json` kan ha fältet `includeEvents`, en lista med händelse-id som räknas till platsen trots den grova gränsen (Natural Earth 1:50m), också när punkten ligger i ett grannlands polygon. `placeEvents()` i `js/place-geo.js` räknar dem in; ingen rendering och ingen annan regel ändras. Listan används bara när händelsens egen källa placerar händelsen i landet, och `scripts/validate-site.py` stoppar ett id som inte finns, som redan ligger inom gränsen eller som ligger mer än **5 km** utanför den (`INCLUDE_MAX_KM`, samma tal i JS och Python). Ligger en listad händelse också inom en annan plats gräns skriver kontrollen en varning, eftersom den då räknas till båda korten.

Första listorna (källorna öppnade 2026-11-27):
- Luxemburg: `klostret-i-echternach` (en.wikipedia: klostret ligger i Echternach i östra Luxemburg; Wikidata Q702704: land Luxemburg) och `schengenavtalet` (en.wikipedia: undertecknat nära Schengen, Luxemburg; Wikidata Q2822795: plats Schengen, som har land Luxemburg).
- Belgien: `moresnet-blir-belgiskt` (en.wikipedia: Versaillesfreden gav Neutrala Moresnet till Belgien, som blev kommunen Kelmis; Wikidata Q151938 ersattes av Kelmis, land Belgien).
- Estland: `slaget-vid-narva-1700` (en.wikipedia: staden Narva i Estland; Wikidata Q155726: plats Narva, som har Estland som föredraget land).

## Varför
Den större lösningen, Natural Earth 1:10m för små länder, provades först (kommentaren i #2333) och räckte inte: Echternach, Schengen och Kelmis låg utanför också i 1:10m (0,3–1,3 km), och `data/platser.json` hade vuxit med 137 kB utan att en enda händelse flyttades. Koordinaterna är Wikidatas och flyttas inte för att passa gränsen. En lista med kontroll av avståndet är liten, syns i datan och kan inte användas för att lägga till godtyckliga händelser.

Aotearoa och `polynesier-pa-raoul` hör inte hit: Kermadecöarna saknas helt i 1:50m, det är ingen gränsflod, och punkten ligger långt mer än 5 km från gränsen. Den frågan kräver ett eget beslut.

Tyskland har ännu inget kort. När det kommer räknar det Echternach, Schengen och Kelmis (punkterna ligger i Tysklands 1:50m-polygon) om inget görs; varningen i `validate-site.py` visar det, och källorna stöder inte Tyskland. Samma gäller Ryssland och Narva.

## Berör
`js/place-geo.js` (`placeEvents`, `INCLUDE_MAX_KM`), `schemas/platser.schema.json`, `scripts/validate-site.py`, `data/platser.json` (Luxemburg, Belgien, Estland), notiserna i `klostret-i-echternach` och `schengenavtalet`, Luxemburgs inledning, `docs/datamodell.md`, `tests/place-geo.test.mjs`, `tests/platser-granser-test.py`, `tests/landskortet-riken.test.mjs`. Bygger på #1449 (grannländerna) och #1819 (Luxemburg).
