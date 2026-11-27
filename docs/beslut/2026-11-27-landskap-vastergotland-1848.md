# Västergötland som landskap (#1848)

**Datum:** 2026-11-27. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Västergötland byggs enligt mönstret från Uppland.

## Byggt
- Platsen `vastergotland` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap`), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=vastergotland`. Två delar, 804 punkter, giltig geometri. Namn, introtext och not på fem språk. Namnet är "Västergötland" på alla fem språk enligt Wikidata (Q213551).
- Källor (öppnade 2026-11-27): Store norske leksikon, Lex, svenska Wikipedia och Wikidata, i `data/sources.json`.
- Ortnamn: `data/ortnamn/vastergotland.json` (Natural Earth) och Billingen ur Wikidata (Q862885, bergets punkt är händelsens egen) i `data/ortnamn-komplettering.json`.
- Inga `major` (tre händelser: Fokus pausar vid alla), enligt beslutet om landskapens pauser.

## Händelserna på kortet (tre, kravet för landskap är tre)
Granskade mot sina källor 2026-11-27:
- **Baltiska issjön töms vid Billingen** (`baltiska-issjon-tappas-ut`, −9670). Engelska Wikipedia, *Baltic Ice Lake*: genombrott vid Billingen omkring 11 620 kalibrerade år före nutid, i flera steg, "between about half a year to 1.5 years", därefter Yoldiahavet; infoboxen ger Yoldiahavet från 9670 f.Kr. *Billingen*: mesa i Skara och Skövde kommuner, Västra Götaland. Stämmer.
- **Gånggriften i Rössberga** (`ganggriften-i-rossberga`, −3499 till −2799). Historiska museet (gånggrifter): omkring två tredjedelar av Sveriges kända gånggrifter ligger i Falbygden, trattbägarkulturens senare fas omkring 3500–2800 f.Kr., Rössberga cirka 10 km söder om Falköping, ben från 128–131 individer, DNA tyder på att olika släktgrupper använde olika delar av kammaren. Stämmer.
- **Emigrationen från Sverige till Amerika** (`emigrationen-fran-sverige`, 1840–1925). Engelska Wikipedia, *Swedish emigration to the United States*: höjdpunkten 1870–1900, nästan 800 000 svenskamerikaner enligt 1890 års folkräkning, flest reste från Göteborg med båt till Hull och med tåg till Liverpool, fem vågor mellan 1840-talet och 1920-talet; *Swedish famine of 1867–1869*: nödåren som utlösare. **Källorna skiljer sig om antalet** (rättat 2026-11-27, en tidigare version av meningen var fel): utvandringssidan anger "about 1.3 million", och nödårssidan, händelsens andra källa, "an estimated 1.25 million … from the 1860s to the 1920s". Händelsetexten ("1,25–1,3 miljoner") anger båda och händelsen har redan en `note` om att källorna skiljer sig. Inget att ändra.

Inga nya händelser lades till: landskapet når tre, men två av tre är före vår tideräkning och den tredje börjar 1840, så mellantiden saknas. Ytterligare händelser (till exempel för medeltiden och Skara stift, kyrkorna, Göta älv) kräver öppnade källor och är ett eget arbete under #1848.

## Osäkert
- Konturens area är cirka 18 570 km², cirka 11 % över Store norske leksikon (16 709), Lex (16 694) och svenska Wikipedia (16 676). Orsaken är inte utredd. Två kontrollpunkter i Vänern ligger utanför konturen, så det är troligen inte Vänern, men en punkt vid Hjo i Vättern ligger innanför; sjöyta kan alltså delvis ingå. Arealen på kortet visas inte.
- **Rössberga** finns inte som ort i Wikidata under de namn som prövades (Rössberga, Rössberga gånggrift, Rössbergagraven, Rössberga gravkammare, Rössberga by, Rössberga socken), så den ligger inte i kompletteringen.
- Kontrollerat i sidan på dator och i 400 px: tre händelser på kortet, inga konsolfel, ingen horisontell scroll. Hela `tests/webblasare.mjs` kördes inte här.
- Landskapsvapen och urfolks- eller andra namn är inte med: ingen öppnad källa i den här körningen bär dem.

## Berör
#1848, `data/platser.json`, `data/sources.json`, `data/ortnamn/vastergotland.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`.
