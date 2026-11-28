# Västmanland som landskap (#1850)

**Datum:** 2026-11-27. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Västmanland byggs enligt mönstret från de tidigare landskapen.

**Varför Västmanland:** av de landskap som var kvar hade Västmanland flest färdiga grannar, tre av sex (Uppland, Gästrikland och Dalarna; Närke, Södermanland och Värmland saknas).

## Byggt
- Platsen `vastmanland` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap`), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=vastmanland`. En del, 613 punkter, inget grannland inom 30 km. Namnet är Wikidatas etikett (Q321430): "Västmanland" på sv, en, de och fr, "Vestmania" på es. Noten säger att landskapet saknar havskust och att gränsen i Mälaren inte är kontrollerad mot någon källa.
- Källor (öppnade 2026-11-27): Store norske leksikon, Lex, svenska Wikipedia och Wikidata för landskapet, och 17 källposter för de nya händelserna.
- Ortnamn: `data/ortnamn/vastmanland.json` (Natural Earth: Västerås, Örebro, Uppsala, Borlänge) och Lapphyttan (Q6488345, saknar etikett på de) och Anundshög (Q612476, saknar etikett på es) ur Wikidata i `data/ortnamn-komplettering.json`.
- Inga egna `major` (sju händelser: Fokus pausar vid alla).

## Händelserna på kortet (sju, kravet för landskap är tre)
Mätt med `placeEvents()` före ändringen: en (`gustav-vasa`, se nedan). Efter: sju, varav sex egna, i kultur (2), vetenskap, ekonomi (2), religion och civilisationer (Gustav Vasa), från 200-talet till 1947. Grannarnas kort är oförändrade (Uppland 19, Gästrikland 4, Dalarna 5).

- **Anundshög** (210–540, kultur, `source-checked`): svenska Wikipedia och Wikidata (bara punkten). Årtalen är en härd under högen (C14); Riksantikvarieämbetet daterar enligt Wikipedia högen till folkvandringstid–vikingatid, så högen kan vara yngre. Det står i `note`, liksom att måtten skiljer sig (8 och 60 meter, eller 9 och 64 meter enligt Fastighetsverket). Ingen oberoende andra källa.
- **Masugnen vid Lapphyttan** (cirka 1175–1399, vetenskap, `source-checked`): svenska Wikipedia (C14: slutet av 1100-talet till 1300-talet, Europas äldsta kända masugn) och Wikidata (punkten). Store norske leksikon säger bara att masugnsdriften i Västmanland går tillbaka till minst 1200-talet. Startåret 1175 är ett närmevärde för "slutet av 1100-talet" och markerat som osäkert (`~`).
- **Silvret i Sala** (1512–1550, ekonomi, `source-checked`): svenska Wikipedia (privilegiebrevet 1512, bästa åren 1530- och 1540-talen, minskning från 1550), Lex och Store norske leksikon. **Källorna skiljer sig** om när brytningen började (1400-talet eller 1506); det står i `note`.
- **Riksdagen i Västerås** (16–18 juni 1527, religion, `two-sources`): svenska Wikipedia (Riksdagen 1527 och Västerås), Lex (Västerås recess 1527) och Wikidata (startdagen).
- **Gymnasiet i Västerås** (1623, kultur, `source-checked`): svenska Wikipedia (Rudbeckianska gymnasiet och Västerås) och Wikidata. **Källorna skiljer sig:** Lex anger 1626. Wikipedia om Västerås påpekar att det fanns gymnasier i Malmö 1529 och Lund 1620, när Skåne var danskt. Båda står i `note`.
- **Den första Hennes-butiken** (1947, ekonomi, `source-checked`): svenska Wikipedia (Hennes & Mauritz och Västerås: butiken i Västerås) och Lex (1947, men ingen plats; omkring 2 500 butiker i 43 länder 2011). Platsen bärs bara av Wikipedia, så nivån höjs inte. Lex anger att herrkläderna kom i mitten av 1960-talet, Wikipedia att Mauritz Widforss köptes 1968; texten nämner inget år för det.

### `gustav-vasa` via kustmarginalen
Gustav Vasas val i Strängnäs (Södermanland) ligger i Mälaren, 7,8 km från Västmanlands kontur och 7,2 km från Upplands, och syns därför på båda korten tills Södermanland finns som plats (samma sak som beslutet om Uppland beskriver). Händelsen är `major` i Sveriges lista, så Västmanlands kort visar den som viktig, fast landskapet självt inte har några `major`. Det försvinner när Södermanland byggs, och provet `tests/viktiga-platser.test.mjs` är grönt.

## Samiskt
Västmanland ligger utanför de områden där uppdraget kräver en sökning efter samiska namn (Norrland och gränsen Värmland/Dalarna). Ingen sökning gjordes.

## Osäkert
- Konturens area är cirka 9 240 km², cirka 10 % över källorna (Store norske leksikon och svenska Wikipedia 8 363 km², Lex 8 430 km²). Troligen ingår Mälarens yta (antagande).
- Inte prövade: Arboga möte 1435, Engelbrektsupproret 1434, ASEA (grundat i Stockholm 1883, till Västerås omkring 1890; för invecklat för en kort text utan fler källor), David av Munktorp omkring 1082, Västerås slott, Strömsholm och Norbergs gruvor.
- Wikipedias API svarade 429; sidorna lästes som wikitext (`?action=raw`).
- Landskapsvapen är inte med.

## Berör
#1850, `data/platser.json`, `data/sources.json`, `data/handelser/1-1499.json`, `data/handelser/1500-1799.json`, `data/handelser/1946-1979.json`, `data/ortnamn/vastmanland.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`, `data/oversattning.json`, `data/events.json`, `data/genererat/`.
