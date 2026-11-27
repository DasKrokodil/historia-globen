# Ångermanland som landskap (#1852)

**Datum:** 2026-11-27. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Ångermanland byggs enligt mönstret från de tidigare landskapen.

**Varför Ångermanland:** Ångermanland och Västmanland hade flest färdiga grannar (tre vardera). Ångermanland har tre av fyra klara (Medelpad, Jämtland och Lappland; Västerbotten saknas) och hör till #1852, där Medelpad just byggts.

## Byggt
- Platsen `angermanland` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap`), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=angermanland`. Två delar (fastlandet och en ö på cirka 46 km²), 543 punkter, inget grannland inom 30 km. Namnet är Wikidatas etikett (Q209853): "Ångermanland" på sv, en, de och fr, "Angermania" på es. Noten säger att små öar och skär saknas.
- Källor (öppnade 2026-11-27): Store norske leksikon, Lex, svenska Wikipedia och Wikidata för landskapet, och 18 källposter för de nya händelserna.
- Ortnamn: `data/ortnamn/angermanland.json` (Natural Earth) och Rogstaklippen (Q10656400, saknar etikett på es och fr) och Skuleberget (Q3486391) ur Wikidata i `data/ortnamn-komplettering.json`.
- Inga `major` (sju händelser: Fokus pausar vid alla).

## Händelserna på kortet (sju, kravet för landskap är tre)
Mätt med `placeEvents()` före ändringen: en (`guldet-i-timra`, som hör till Medelpad, se nedan). Efter: sju, varav sex egna, i civilisationer (3), ekonomi (2, varav guldet), krig (1) och natur (1), från omkring år 100 till 2000. Grannarnas kort är oförändrade (Medelpad 8, Jämtland 3, Lappland 4).

- **Järnåldersgården på Genesmon** (cirka 100–600, civilisationer, `source-checked`): svenska Wikipedia (Genesmon) och Lex (Örnsköldsvik). **Källorna skiljer sig:** Wikipedia anger 100–600 och beskriver bofasta bönder, Lex kallar platsen en kungsgård från romersk järnålder utan årtal. Det står i `note`.
- **Fornborgen på Rogstaklippen** (cirka 400–550, krig, `source-checked`): svenska Wikipedia (Rogstaklippen och Ångermanland) och Wikidata (bara punkten). Dateringen är de äldsta kolproven från 1998; andra prov är från 1000–1100-talen och 1500-talet. Ingen oberoende andra källa. Kategorin krig är vald för att fornborgen är en försvarsanläggning.
- **Härnösand grundas** (1585, civilisationer, `two-sources`): svenska Wikipedia, Lex och Store norske leksikon. Dagen för ryssarnas brand, 28 maj 1721, finns bara i Wikipedia; Lex och Store norske leksikon anger året.
- **Örnsköldsvik grundas** (1842, ekonomi, `two-sources`): svenska Wikipedia (Kunglig Majestäts beslut 6 oktober 1842) och Store norske leksikon (grundad 1842). Platsen har sydsamiska Orrestaare ur Wikidata.
- **Skotten i Ådalen** (14 maj 1931, civilisationer som de andra strejkerna, `two-sources`): svenska och engelska Wikipedia, Lex (14 maj, fem döda, fem skadade) och Wikidata (dagen och punkten i Lunde).
- **Höga kusten blir världsarv** (2000, natur, `two-sources`): svenska Wikipedia och Lex. **Källorna skiljer sig** om den högsta gamla kustlinjen (286 meter på Skuleberget enligt Store norske leksikon, 285 enligt Lex, nästan 300 enligt Wikipedia); texten säger "nästan 300 meter" om landhöjningen, och skillnaden står i `note`. Punkten är Skuleberget (Wikidata), eftersom Wikidatas punkt för Höga kusten ligger i havet utanför konturen.

### `guldet-i-timra` hamnar på båda korten
Punkten ligger i havet 0,2 km från Medelpads kontur och cirka 12 km från Ångermanlands, så kustmarginalen ger den till båda; syskonregeln gäller bara punkter på land. Händelsen hör till Medelpad. Den rörs inte här, eftersom den inte är Ångermanlands. Rekommendationen (flytta punkten 0,3 km in på land, eller en regel för närmaste landskap) står i #2418.

## Samiskt och urfolks tidsdjup
- **Inget samiskt namn på landskapet:** Wikidata har ingen etikett på sydsamiska (sma) eller nordsamiska (se), och ingen öppnad källa ger ett.
- **Örnsköldsvik på sydsamiska:** Wikidata (Q28327) har Orrestaare. Det står i händelsens plats.
- **Samernas historia i Ångermanland:** svenska Wikipedia om landskapet har ingen text om samer, bara hänvisningar till sidorna om skogssamer, sockenlappar och sydliga samer, som inte öppnades. Lex nämner finska inflyttare omkring 1600, inte samer. Det är en lucka, inte något som fyllts ut (se #2374).

## Osäkert
- Konturens area är cirka 20 600 km², över källorna: Store norske leksikon, Lex och svenska Wikipedia 19 800 km², Wikidata 19 444 km². Troligen ingår sjöyta (antagande).
- **Hällristningarna vid Nämforsen är inte med**, fast de är bland norra Europas största: svenska, tyska och franska Wikipedia daterar dem bara till yngre stenålder och äldre bronsålder, utan årtal, och Lex har ingen sida. Att räkna fram årtal ur periodgränser för Sydskandinavien vore att fylla ut, så de väntar på en källa med datering (till exempel Riksantikvarieämbetet).
- Inte prövade: Styresholm (fogdeborg omkring 1400), ryssarnas brand i Härnösand 1721 som egen händelse, Härnösands elektriska gatubelysning 1885, Skuleskogens nationalpark 1984 och Historia Norvegiae.
- Wikipedias API svarade 429; sidorna lästes som wikitext (`?action=raw`).
- Landskapsvapen är inte med.

## Berör
#1852, #2418, `data/platser.json`, `data/sources.json`, `data/handelser/1-1499.json`, `data/handelser/1500-1799.json`, `data/handelser/1800-1899.json`, `data/handelser/1900-1945.json`, `data/handelser/1980-.json`, `data/ortnamn/angermanland.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`, `data/oversattning.json`, `data/events.json`, `data/genererat/`.
