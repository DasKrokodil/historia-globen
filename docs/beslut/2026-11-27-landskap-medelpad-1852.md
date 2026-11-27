# Medelpad som landskap (#1852)

**Datum:** 2026-11-27. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Medelpad byggs enligt mönstret från de tidigare landskapen.

**Varför Medelpad:** av de 15 landskap som var kvar hade Medelpad och Västmanland flest färdiga grannar (tre vardera, räknat på Lantmäteriets landskapsgränser). Medelpad har tre av fyra grannar klara (Hälsingland, Härjedalen och Jämtland; Ångermanland saknas), och det avgör samtidigt frågan om `guldet-i-timra` som mätningen i #1852 lämnade öppen.

## Byggt
- Platsen `medelpad` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap`), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=medelpad`. En del, 215 punkter, inget grannland inom 30 km. Namnet är Wikidatas etikett (Q210687): "Medelpad" på sv, en, de och fr, "Medelpadia" på es.
- **Alnön saknas i konturen.** Natural Earths kust (1:10m) har inte Alnön, så klippningen tar bort ön, fast den finns i Lantmäteriets landskap. Noten på kortet säger det på alla fem språk ("Alnön och små öar och skär saknas, eftersom kustlinjen på globen inte har dem").
- Källor (öppnade 2026-11-27): Store norske leksikon, Lex, svenska Wikipedia och Wikidata för landskapet, och 15 källposter för de nya händelserna.
- Ortnamn: `data/ortnamn/medelpad.json` (Natural Earth: Sundsvall, Härnösand, Östersund, Bottniska viken) och Galtström (Q10502305) och Tunadal (Q2842068) ur Wikidata i `data/ortnamn-komplettering.json`; båda saknar spansk etikett och har `es` som fallback.
- Inga `major` (åtta händelser: Fokus pausar vid alla), enligt beslutet om landskapens pauser.

## Händelserna på kortet (åtta, kravet för landskap är tre)
Mätt med `placeEvents()` före ändringen: en (`guldet-i-timra`, 200–600, ekonomi; punkten ligger 0,2 km utanför konturen i havet och kommer med via kustmarginalen). Efter: åtta, i civilisationer (3), ekonomi (3), krig (1) och katastrofer (1), från 200-talet till 1888. Grannarnas kort är oförändrade (Hälsingland 4, Jämtland 3, Härjedalen 3, Gästrikland 4, Lappland 4, Uppland 19, Dalarna 5).

- **Storhögarna i Högom** (cirka 400–550, civilisationer, `source-checked`): svenska Wikipedia (Högoms gravfält, Sundsvall och Medelpad) och Wikidata (Q1486714, bara punkten). **Källorna skiljer sig lite** om dateringen (400–450 för den äldsta högen, omkring 500 för hövdingagraven och mitten av 500-talet för den outgrävda; 400–550 respektive 400–500 på de andra sidorna). Spannet täcker uppgifterna, och skillnaden står i `note`. Ingen oberoende andra källa öppnades.
- **Sundsvall grundas** (1621, civilisationer, `two-sources`): svenska Wikipedia (interimsbrev 23 augusti 1621, privilegiebrevet 1624, båda i texten), Store norske leksikon (stadsrättigheter 1621) och Wikidata (1621). Platsen har sydsamiska Sjädtavallie ur Wikidata.
- **Järnbruket i Galtström** (1673, ekonomi, `source-checked`): svenska Wikipedia (Galtströms bruk och Medelpad) och Wikidata (1673). Wikidatas år är troligen hämtat ur Wikipedia och räknas inte som oberoende.
- **Slaget vid Selånger** (1721, krig, del av stora nordiska kriget, `source-checked`): svenska Wikipedia (slaget och Sundsvall) och Wikidata (Q3428985). **Källorna skiljer sig:** svenska Wikipedia anger 25 maj, Wikidata 5 juni i gregoriansk kalender; texten säger därför "våren 1721". Siffran "mer än tjugo gånger större" är räknad ur Wikipedias styrkor (cirka 7 470 mot cirka 280, kvoten är cirka 27).
- **Sveriges första ångsåg** (1849, ekonomi, `two-sources`): svenska Wikipedia (Tunadal och Medelpad) och Lex (Medelpad), som oberoende anger Tunadal 1849.
- **Sundsvallsstrejken** (1879, civilisationer, som `februaristrejken-1941`, `source-checked`): svenska Wikipedia, Lex (Sundsvall) och Wikidata (startdagen 26 maj). **Källorna skiljer sig** om slutdagen (4 eller 5 juni) och om följderna (inga bättre villkor för de flesta, eller ett uppsving för fackföreningsrörelsen); det står i `note`, och nivån höjs inte.
- **Sundsvallsbranden** (25 juni 1888, katastrofer, `two-sources`): svenska Wikipedia, Wikidata (dagen och punkten), Lex och Store norske leksikon (båda: stadsbrand 1888 och återuppbyggnad i sten).

## Samiskt och urfolks tidsdjup
- **Inget samiskt namn på landskapet:** Wikidata har ingen etikett på sydsamiska (sma) eller nordsamiska (se) för Medelpad, och ingen öppnad källa ger ett.
- **Sundsvall på sydsamiska:** Wikidata (Q26476) har etiketten Sjädtavallie. Den står i händelsens plats ("Sundsvall (sydsamiska Sjädtavallie), Medelpad").
- **Samernas historia i Medelpad:** svenska Wikipedia skriver att en fångstkultur, eventuellt samisk, levde i inlandet under järnåldern och att källor från 1600-talet och senare talar om skogssamer och sockenlappar i Medelpad. Det räcker inte för en händelse med plats och tid, och inget är skrivet ur minnet. Det är en lucka, inte något som fyllts ut (se #2374).

## Osäkert
- Konturens area är cirka 7 440 km², över källorna: svenska Wikipedia och Wikidata 7 058 km², Store norske leksikon och Lex 6 792 km². Källorna skiljer sig sinsemellan. Troligen ingår sjöyta (antagande), trots att Alnön saknas.
- Wikipedias API svarade 429 under körningen; sidorna lästes som wikitext (`?action=raw`). Engelska Wikipedia öppnades inte. Riksantikvarieämbetets Fornsök och Historiska museet prövades inte för Högom.
- Inte prövade: hällmålningen i Långliden (4 000–6 000 år enligt svenska Wikipedia, ingen egen sida hittades), de äldsta fynden i Holmsjöändan (9 000 år), Stigeskatten i Indal, Kubal 1942, Bergeforsens kraftverk och Alnöområdets bergarter.
- Sundsvall och slaget vid Selånger har samma trakt som punkt som strejken och branden; fyra markörer ligger inom en kilometer. Strejken har Wikidatas punkt för staden, eftersom källorna inte ger en egen.
- Landskapsvapen är inte med.

## Berör
#1852, `data/platser.json`, `data/sources.json`, `data/handelser/1-1499.json`, `data/handelser/1500-1799.json`, `data/handelser/1800-1899.json`, `data/ortnamn/medelpad.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`, `data/oversattning.json`, `data/events.json`, `data/genererat/`.
