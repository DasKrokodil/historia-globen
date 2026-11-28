# Östergötland som landskap (#1849)

**Datum:** 2026-11-28. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Östergötland byggs enligt mönstret från de tidigare landskapen.

**Varför Östergötland:** alla fyra grannar på land är klara (Småland, Närke, Södermanland och Västergötland över Vättern), och landskapet hade bara en händelse på kortet.

## Byggt
- Platsen `ostergotland` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap`), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=ostergotland`. Tre delar (fastlandet och två öar i skärgården, cirka 27 och 8 km²), 752 punkter, inget grannland inom 30 km.
- Namnet är Wikidatas etikett (Q214829): "Östergötland" på sv, en, de och fr och "Ostrogotia" på es. Alla fem språken har en etikett.
- Noten säger att konturen är förenklad och klippt mot kusten, att Östergötland har kust mot Östersjön, att små öar och skär i skärgården saknas och att gränsen i Vättern inte är kontrollerad mot någon källa.
- Källor (öppnade 2026-11-28): Store norske leksikon, Lex, svenska Wikipedia och Wikidata för landskapet, och 26 nya källposter för händelserna.
- Ortnamn: `data/ortnamn/ostergotland.json` (Natural Earth: Linköping, Norrköping, Jönköping, Örebro, Nyköping, Mariestad; Östersjön) och fem orter ur Wikidata i `data/ortnamn-komplettering.json`: Alvastra (Q2664800, saknar spansk etikett och har `es` som fallback), Rökstenen (Q472975; byn Rök har ingen egen post med etiketter, så stenen används, som Garphyttans nationalpark i Närke), Vadstena (Q265682), Motala (Q54357) och Tåkern (Q1805733). Natural Earth saknar Vadstena och Motala. Stångebro och Saab ligger i Linköping och fick ingen egen ort.
- Inga `major` (åtta händelser: Fokus pausar vid alla).

## Händelserna på kortet (åtta, kravet för landskap är tre)
Mätt med `placeEvents()` (med `linkIncludeEvents`, händelser ur `data/events.json` som inte är `draft`) med platsen på plats men före de nya händelserna: en, `gota-kanal-invigs` (punkten 16,17° Ö 58,50° N, inne i konturen; händelsen är inte ändrad). Efter: åtta, varav sju nya, i religion (2), kultur, krig, ekonomi (3, med Göta kanal) och natur, från cirka 3100 f.Kr. till 1975.

**Grannarnas kort är oförändrade**, både med bara konturen och med händelserna: Småland 9, Södermanland 8, Närke 7, Västergötland 3 (alla andra platser har också samma antal som före ändringen). Ingen befintlig händelse flyttas av syskonregeln; `astrid-lindgren-fods` ligger 16 km utanför Östergötlands kontur men inne i Smålands och stannar där. Sveriges kort går från 143 till 150. Alla nya punkter ligger inne i konturen (prövat med shapely) och i inget annat landskap; närmast kanten ligger Vadstena (cirka 1 km, mot Vätterns strand) och Alvastra (cirka 3 km).

- **Pålbyggnaden i Alvastra** (cirka 3100–3000 f.Kr., religion, `source-checked`): svenska Wikipedia (Alvastra pålbyggnad och Östergötland), Lex (Alvastra pælebygning) och Wikidata (punkten). `note` med `kind: "date"`: Wikipedia anger omkring 3100 f.Kr. (en kol-14-datering), Lex omkring 3000 f.Kr.; därför ett spann och ingen höjning. Båda kallar platsen kult- eller rituell plats, därav kategorin religion.
- **Rökstenen reses** (troligen början av 800-talet, kultur, `two-sources`): svenska Wikipedia, Lex, Store norske leksikon och Wikidata (punkten och 800-talet). År och plats stämmer. **Källorna är oense** om vem som reste stenen efter vem (Wikipedia/Riksantikvarieämbetet: fadern Varin efter sonen Vämod; Lex: Vamod efter sonen Varin) och om antalet tecken (760, över 750, omkring 750); texten nämner inga namn och säger "omkring 750 runor". Det står i `note` (`kind: "disagreement"`).
- **Vadstena kloster grundas** (1346–1384, religion, `two-sources`): svenska Wikipedia (testamentet 1346, invigt 1384, stängt 1595), Lex (stiftat 1346, bygget i gång cirka 1369, upphävt 1595), Store norske leksikon (vallfartsort) och Wikidata (punkten, 1384).
- **Slaget vid Stångebro** (1598, krig, `source-checked`): svenska Wikipedia, Lex och Wikidata (punkten). `note` med `kind: "calendar"`: Wikipedia 25 september (juliansk), Wikidata också 5 oktober (gregoriansk, datumet i `edtf`), Lex bara året; texten säger "hösten 1598". Wikipedia lägger slaget strax öster om Linköping, Lex norr om staden, så nivån höjs inte.
- **Motala verkstad grundas** (1822, ekonomi, `two-sources`): svenska Wikipedia, Lex (Motala) och Wikidata (1822). Punkten är Motala stad (Wikidata Q54357), eftersom Wikidata saknar koordinat för verkstaden; Wikipedia säger att området ligger 1–2 km från centrum. Lex påstående att verkstaden byggde Sveriges första ångfartyg 1831 togs inte med.
- **Saab flyttar till Linköping** (1939, ekonomi, `two-sources`): svenska Wikipedia (Saab AB: grundat 1937, köpte ASJA 1939 och flyttade huvudkontoret till Linköping), Lex (Saab AB: grundat 1937; Linköping: flygfabriken flyttade dit 1939, största arbetsgivaren med tiden) och Wikidata (punkten är Linköping, Q25413).
- **Tåkern blir naturreservat** (1975, natur, `source-checked`): svenska Wikipedia (naturreservat sedan 1975, en av Nordeuropas främsta fågelsjöar), Lex (fågelreservat efter 1975), Store norske leksikon (naturreservat, våtmarksfåglar) och Wikidata (punkten). **Källorna skiljer sig** om sjöns yta (44, 30, 45 och omkring 25 km²) och om när sjön sänktes (1842–1844 enligt Wikipedia, 1970-talet enligt Store norske leksikon); texten nämner ingen yta, och skillnaden står i `note`.

### `tests/viktiga-platser.test.mjs`
Provet länkade inte platserna, så kustmarginalen räknade händelser i Östergötland (Alvastra, Rökstenen, Vadstena med flera, över Vättern) till Västergötland: 10 händelser utan `major`. I appen länkas platserna (`linkIncludeEvents` i `loadPlaces`), och där har Västergötland 3. Provet länkar nu platserna på samma sätt, med exakt samma ändring som Dalslands pull request #2448. `js/` är inte ändrat.

## Samiskt
Östergötland ligger utanför de områden där uppdraget kräver en sökning efter samiska namn. Ingen sökning gjordes.

## Osäkert
- Konturens area är cirka 11 100 km² (plant närmevärde), cirka 11 % över svenska Wikipedia och Store norske leksikon (9 979 km²) och Wikidata (9 987 km²). Troligen ingår en del av Vättern (antagande). Lex anger ingen area.
- Stångebro och Saab ligger båda i Linköping, cirka 0,7 km från varandra; markörerna kan ligga tätt.
- Inte prövade eller inte tagna med: Alvastra kloster 1143 (läst i Lex sökresultat, utelämnat för att inte lägga en tredje markör vid Omberg), Vreta kloster, Linköpings blodbad 1600 (Lex nämner det), Linköpings domkyrka, Götavirke, Skänninge möte, Norrköpings textilindustri och rysshärjningarna 1719, Åtvidabergs koppargruvor, Linköpings universitet (Lex 1975, Store norske leksikon 1970) och Kolmården.
- Wikipedia lästes som wikitext (`?action=raw`), Wikidata via `Special:EntityData` och `wbgetentities`; Lex och Store norske leksikon via `.json` och sökgränssnittet. Engelska Wikipedia öppnades inte.
- Landskapsvapen är inte med.

## Berör
#1849, `data/platser.json`, `data/sources.json`, `data/handelser/fkr.json`, `data/handelser/1-1499.json`, `data/handelser/1500-1799.json`, `data/handelser/1800-1899.json`, `data/handelser/1900-1945.json`, `data/handelser/1946-1979.json`, `data/ortnamn/ostergotland.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`, `data/oversattning.json`, `data/events.json`, `data/genererat/`, `tests/viktiga-platser.test.mjs`.
