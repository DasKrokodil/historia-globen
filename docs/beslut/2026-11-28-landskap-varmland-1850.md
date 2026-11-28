# Värmland som landskap (#1850)

**Datum:** 2026-11-28. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Värmland byggs enligt mönstret från de tidigare landskapen.

**Varför Värmland:** av de landskap som var kvar hade Värmland flest färdiga grannar, tre av fem (Västergötland, Västmanland och Dalarna; Dalsland och Närke saknas).

## Byggt
- Platsen `varmland` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap`), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=varmland`. En del, Norge som grannland. Namnet är "Värmland" på sv, en, de och fr enligt Wikidata (Q211638). **Wikidata saknar spansk etikett**, så den spanska namnraden är också "Värmland" (samma som de andra språken). Noten säger att landskapet saknar havskust, att gränsen i Vänern inte är kontrollerad och att gränsen i väster går mot Norge.
- Källor (öppnade 2026-11-28): Store norske leksikon, Lex, svenska Wikipedia och Wikidata för landskapet, och 14 källposter för de nya händelserna.
- Ortnamn: `data/ortnamn/varmland.json` (Natural Earth) och Ritamäki (Q30177356) och Skansen Hultet (Q10669722, saknar etikett på de, es och fr) ur Wikidata i `data/ortnamn-komplettering.json`.
- Inga `major` (fem händelser: Fokus pausar vid alla).

## Händelserna på kortet (fem, kravet för landskap är tre)
Mätt med `placeEvents()` före ändringen: noll. Efter: fem, i civilisationer (4) och krig (1), från slutet av 1500-talet till 1941. Grannarnas kort är oförändrade (Västergötland 3, Västmanland 7, Dalarna 5). Kategorierna är inte så spridda som önskat; kultur, natur och ekonomi saknas (se Osäkert).

- **Skogsfinnarna i Värmland** (cirka 1580–1650, civilisationer, `source-checked`): svenska Wikipedia (Skogsfinnar, Värmland och Ritamäki finngård), Lex, Store norske leksikon och Wikidata (punkten för Ritamäki). **Källorna skiljer sig** om när invandringen började (1580, 1580-talet och början av 1600-talet, första hälften av 1600-talet eller från mitten av 1600-talet); spannet täcker dem, och skillnaden står i `note`. Punkten är finngården Ritamäki i Torsby finnskog, som står för finnbygden och inte för en enskild händelse.
- **Karlstad får stadsrättigheter** (1584, civilisationer, `two-sources`): svenska Wikipedia, Lex och Store norske leksikon.
- **Statskuppen 1809 börjar i Karlstad** (7 mars 1809, civilisationer, `source-checked`): svenska Wikipedia (Statskuppen 1809 och Värmland) och Wikidata (startdagen). Ingen oberoende andra källa öppnades.
- **Förhandlingarna i Karlstad 1905** (31 augusti–23 september 1905, civilisationer, `two-sources`): svenska Wikipedia, Store norske leksikon (med uppehållet 7–13 september, som står i `note` med `kind: "date"`), Lex och Wikidata.
- **Skansarna mot Norge** (1940–1941, krig, `source-checked`): svenska Wikipedia (Skansen Hultet och Värmland) och Wikidata (punkten).

## Samiskt
- **Inget samiskt namn på landskapet:** Wikidata har ingen etikett på sydsamiska (sma) eller nordsamiska (se), och ingen öppnad källa ger ett.
- **Samernas historia i Värmland:** svenska Wikipedia om Värmland har ingen text om samer. Sidan om skogssamer nämner en samisk befolkning på 1600-talet och tidigt 1700-tal i Dalarna, Västmanland, Hälsingland och Medelpad, men inte i Värmland. Det är en lucka, inte något som fyllts ut (se #2374).
- **Fynd för andra landskap:** att sidan om skogssamer nämner Västmanland och Medelpad står inte i de landskapens beslutsfiler (Västmanlands fil säger att ingen sökning gjordes). Det bör läggas till i #2374.

## Osäkert
- Konturens area är cirka 20 860 km², cirka 15 % över källorna (Store norske leksikon 18 202 km², Lex 18 204 km²). Troligen ingår Vänerns yta (antagande), som beslutet om gränskällan förutsåg (14–17 % för landskap vid stora sjöar).
- Inte prövade: förhistorien vid Vänern och på Värmlandsnäs, kungshögar och fornborgar från yngre järnålder, bonderesningen i Jösse härad 1437, bergsbruket i Filipstad och Långban, Gustaf Fröding och Selma Lagerlöf, emigrationen (finns redan som händelse i Västergötland) och Karlstads brand 1865.
- Wikipedias API svarade 429; sidorna lästes som wikitext (`?action=raw`).
- Landskapsvapen är inte med.

## Berör
#1850, #2374, `data/platser.json`, `data/sources.json`, `data/handelser/1500-1799.json`, `data/handelser/1800-1899.json`, `data/handelser/1900-1945.json`, `data/ortnamn/varmland.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`, `data/oversattning.json`, `data/events.json`, `data/genererat/`.
