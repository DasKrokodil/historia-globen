# Jämtland som landskap (#1851)

**Datum:** 2026-11-27. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Jämtland byggs enligt mönstret från de tidigare landskapen.

## Byggt
- Platsen `jamtland` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap`), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=jamtland`. En del, 342 punkter, Norge som grannland. Namn, introtext och not på fem språk. Namnet är "Jämtland" på alla fem språk enligt Wikidata (Q211661, landskap i Sverige). Jämtland har ingen kust, så noten säger det.
- Källor (öppnade 2026-11-27): Store norske leksikon, Lex, svenska Wikipedia och Wikidata för landskapet, och tio källposter för de nya händelserna.
- Ortnamn: `data/ortnamn/jamtland.json` (Natural Earth) och Glösa (Q1004166, spanska etiketten saknas) och Frösön (Q1004189, 3,9 km från stenens punkt) ur Wikidata i `data/ortnamn-komplettering.json`.
- Inga `major` (tre händelser: Fokus pausar vid alla), enligt beslutet om landskapens pauser.

## Händelserna på kortet (tre, kravet för landskap är tre)
Mätt före ändringen: noll. Efter: tre, en vardera i kultur, religion och ekonomi, i årtusendet omkring 3000 f.Kr., 1000-talet och 1700-talet.

- **Hällristningarna i Glösa** (cirka 3000 f.Kr., `source-checked`): svenska Wikipedia (Glösa och Jämtland) anger "ungefär 5 000 år sedan"; Wikidata (Q29380540) har bara punkten. Ingen oberoende andra källa för dateringen. Riksantikvarieämbetets Fornsök gick inte att nå från sessionen.
- **Frösöstenen och Jämtlands kristnande** (cirka 1030–1050, `source-checked`): svenska och engelska Wikipedia och Wikidata (Q462807). **Källorna skiljer sig:** svenska Wikipedia och Wikidata anger omkring 1050, engelska Wikipedia 1030–1050. Spannet täcker båda, och skillnaden står i `note`. Runtextens innehåll är återgivet med egna ord, inte citerat.
- **Östersund grundas** (23 oktober 1786, `two-sources`): svenska och engelska Wikipedia och Wikidata (Q10728134) har samma dag.

## Samiskt och urfolks tidsdjup
- **Inget sydsamiskt namn på landskapet:** Wikidata har ingen etikett på sydsamiska (sma) eller nordsamiska (se) för landskapet Jämtland, och ingen öppnad källa ger ett. Nordsamiska "Jämtlánda leatna" gäller länet, inte landskapet, och används inte.
- **Östersund på sydsamiska:** Wikidata (Q26515) har etiketten Staare på sydsamiska. Den står i händelsens plats ("Östersund (sydsamiska Staare), Jämtland").
- **Samernas historia i Jämtland:** svenska Wikipedia skriver att samerna i Jämtland traditionellt har varit sydsamer och att samisk närvaro under förhistorisk tid är omdiskuterad; Store norske leksikon säger att kopplingen mellan fångstkulturen och samerna fortfarande är omstridd. Det räcker inte för en händelse med plats och tid, och inget är skrivet ur minnet. Det är en lucka, inte något som fyllts ut.

## Osäkert
- Konturens area är cirka 37 400 km², cirka 10 % över Store norske leksikon och svenska Wikipedia (34 009 km²), Lex (cirka 34 000) och Wikidata (33 800). Troligen ingår sjöyta som Storsjön (antagande).
- Jamtamot är inte med: källorna är oense om det var ett ting eller en marknad och om det börjar på 900-talet eller är belagt först 1380.
- Freden i Brömsebro 1645, då Jämtland blev svenskt, slöts i Brömsebro, utanför landskapet, och finns inte som händelse i projektet. Den hör hemma vid Brömsebro och är inte lagd här.
- Landskapsvapen är inte med.

## Berör
#1851, `data/platser.json`, `data/sources.json`, `data/handelser/fkr.json`, `data/handelser/1-1499.json`, `data/handelser/1500-1799.json`, `data/ortnamn/jamtland.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`, `data/oversattning.json`.
