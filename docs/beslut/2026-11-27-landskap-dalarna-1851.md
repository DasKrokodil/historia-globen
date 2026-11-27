# Dalarna som landskap (#1851)

**Datum:** 2026-11-27. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Dalarna byggs enligt mönstret från Uppland, Lappland, Västergötland och Gotland.

## Byggt
- Platsen `dalarna` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap`), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=dalarna`. En del, 489 punkter, Norge som grannland. Namn, introtext och not på fem språk. Namnen är Wikidatas etiketter (Q205218, landskap i Sverige): Dalarna (sv, en, de), Dalecarlia (es), Dalécarlie (fr). Dalarna har ingen kust, så noten säger det i stället för att tala om öar och skär.
- Källor (öppnade 2026-11-27): Store norske leksikon, Lex, svenska Wikipedia och Wikidata för landskapet, och åtta källposter för de nya händelserna.
- Ortnamn: `data/ortnamn/dalarna.json` (Natural Earth) och Mora ur Wikidata (Q849874, tätorten, 1,1 km från Vasaloppets mål) i `data/ortnamn-komplettering.json`.
- Inga `major` (fem händelser: Fokus pausar vid alla), enligt beslutet om landskapens pauser.

## Händelserna på kortet (fem, kravet för landskap är tre)
Mätt före ändringen: en händelse (Åkermyrapaddeln, människan, före vår tideräkning). Efter: fem, en vardera i kategorierna människan, ekonomi, katastrofer, sport och kultur, och i sekel före vår tideräkning, 1200-, 1600-, 1900- och 2000-talet.

- **Paddeln från Åkermyra** (`akermyrapaddeln`, befintlig) granskades mot sina källor: Historiska museet (funnen 1928 vid torvtäkt i Åkermyra, Hedemora, 87 cm, furu, daterad 2006 till 7040–6640 f.Kr.) och Riksantikvarieämbetet ("vid jultid 1927"). Källorna skiljer sig om fyndåret, och texten säger redan "1927 eller 1928". Inget att ändra.
- **Kopparberget i Falun nämns i skrift** (1288, ny, `two-sources`): svenska och engelska Wikipedia och Wikidata (Q15107508, äldsta skriftliga belägg 1288). Brytningen började mellan 850 och 1080 (båda Wikipedia-sidorna).
- **Raset i Falu gruva: Stora stöten** (1687, ny, `source-checked`): svenska Wikipedia (Falu koppargruva och Stora stöten) och engelska Wikipedia. **Källorna skiljer sig** om dagen (midsommardagen 25 juni eller midsommarafton) och om följderna (ingen omkom, eller en stor olycka undveks); det står i händelsens `note`, och precisionen är året.
- **Det första Vasaloppet** (19 mars 1922, ny, `two-sources`): svenska och engelska Wikipedia och Wikidata (Q6379635). Antalet anmälda skiljer sig (139 eller 136) och nämns inte; 119 startande stämmer i båda.
- **Falu gruva blir världsarv** (2001, ny, `two-sources`): svenska och engelska Wikipedia och Wikidata (Q636194, världsarv från 2001). Unescos egen sida gav 403.

## Osäkert
- Konturens area är cirka 31 000 km², cirka 7 % över Store norske leksikon (29 002 km²), Lex och svenska Wikipedia (29 086 km²); källorna skiljer sig också sinsemellan. Troligen ingår sjöyta (Siljan), som för Uppland och Lappland (antagande).
- Andelen av Europas koppar: svenska Wikipedia skriver "under medeltiden två tredjedelar av Europas kopparproduktion", engelska "as much as two-thirds of Europe's copper needs". Texten säger "som mest upp till två tredjedelar".
- Engelbrektsupproret 1434 började i Dalarna men har ingen bestämd plats i de öppnade källorna och är inte med.
- Samiska eller andra namn och landskapsvapen är inte med: ingen öppnad källa i den här körningen bär dem för Dalarna.

## Berör
#1851, `data/platser.json`, `data/sources.json`, `data/handelser/1-1499.json`, `data/handelser/1500-1799.json`, `data/handelser/1900-1945.json`, `data/handelser/1980-.json`, `data/ortnamn/dalarna.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`, `data/oversattning.json`.
