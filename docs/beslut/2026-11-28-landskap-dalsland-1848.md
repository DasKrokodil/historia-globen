# Dalsland som landskap (#1848)

**Datum:** 2026-11-28. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Dalsland byggs enligt mönstret från de tidigare landskapen.

## Byggt
- Platsen `dalsland` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap`), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=dalsland`. En del, 372 punkter, inga hål, Norge som grannland.
- Namnet är Wikidatas etikett (Q214806): "Dalsland" på sv, en, de och fr och "Dalia" på es. Alla fem språken har en etikett.
- **Ingen havskust:** kustklippningen tog inte bort någon yta (den oklippta och den klippta konturen är lika stora), och svenska Wikipedia, Store norske leksikon och Lex nämner ingen kust (Dalsland gränsar till Vänern, Värmland, Norge, Bohuslän och Västergötland). Noten säger att Dalsland saknar havskust, att gränsen i öster går genom Vänern och inte är kontrollerad mot någon källa, och att gränsen i nordväst går mot Norge.
- Källor (öppnade 2026-11-28): Store norske leksikon, Lex, svenska Wikipedia och Wikidata för landskapet, svenska Wikipedia om Dalslands historia, och 19 källposter för de nya händelserna (23 nya poster i `data/sources.json`).
- Ortnamn: `data/ortnamn/dalsland.json` (Natural Earth har bara Trollhättan och Vänersborg i ramen, båda utanför Dalsland; Norge; Skagerrak och Kattegatt) och fem orter ur Wikidata i `data/ortnamn-komplettering.json`: Åmål (Q271082), Dalaborg (Q846657, saknar es och fr), Högsbyns hällristningsområde (Q10532367, saknar es och fr), Håverud (Q1019584, saknar fr) och Tresticklan (Q1270469). Alla ligger inom 0,1 km från händelsernas punkter.
- Inga `major` (fem händelser: Fokus pausar vid alla).
- **Provet `tests/viktiga-platser.test.mjs` länkar nu platserna** med `linkIncludeEvents()`, som `loadPlaces` i `js/model.js` gör. Utan länkningen hade landskapen inga syskon i provet, och kustmarginalen räknade Dalaborg (i Dalsland, cirka 2 km från gränsen) och händelser i Halland och Småland till Västergötland: tio händelser i provet mot tre på det riktiga kortet, och provet föll. Ingen kod i `js/` är ändrad.

## Händelserna på kortet (fem, kravet för landskap är tre)
Mätt med `placeEvents()` (med `linkIncludeEvents`, händelser ur `data/events.json` som inte är `draft`) med konturen på plats men före de nya händelserna: noll. Efter: fem, i kultur, krig, civilisationer, ekonomi och natur, från bronsåldern till 1996. Alla punkter ligger inne i Dalslands kontur (cirka 2–19 km från kanten); Dalaborg ligger nära gränsen i Vänern och Tresticklan nära gränsen mot Norge.

Grannarnas kort är oförändrade, både med bara konturen och med händelserna: Värmland 5, Västergötland 3, Norge 16 (och Halland 7). Bohuslän finns inte som plats än; eftersom alla fem punkterna ligger inne i Dalslands kontur räknar syskonregeln dem inte till Bohuslän när det kommer. Sveriges kort går från 143 till 148 händelser (de fem nya ligger inom Sveriges gräns).

- **Hällristningarna i Högsbyn** (cirka 1000–500 f.Kr., kultur, `source-checked`): svenska Wikipedia (Högsbyns hällristningsområde och Tisselskogs socken), tyska Wikipedia och Wikidata (punkten). `note` med `kind: "date"`: svenska Wikipedia säger bara bronsåldern, tyska Wikipedia att ristningarna är 2 500–3 000 år gamla; spannet är räknat ur den uppgiften. Ingen oberoende andra källa öppnades (Statens fastighetsverks sida gick inte att nå).
- **Hertigarna bygger Dalaborg** (1304, krig, `two-sources`): svenska Wikipedia (Dalaborg och Dalslands historia), Store norske leksikon och Wikidata (1304, 1434 och punkten). **Källorna skiljer sig** om åren efter 1304: Wikipedia säger att borgen stod emot kung Birgers belägring och norska styrkor 1310, Store norske leksikon att kungen tog borgen efter kort tid, att den inte nämns efter 1309 och att den finns i källorna igen 1367. Det står i `note`; om 1304 och 1434 är källorna överens.
- **Åmål får stadsprivilegier** (1643, civilisationer, `two-sources`): svenska Wikipedia (Åmål och Dalslands historia), Store norske leksikon och Wikidata (punkten). Wikipedia ger dagen 1 april 1643; texten säger bara året, eftersom Sverige då följde den julianska kalendern och ingen källa säger vilken kalender dagen gäller. Krigsåren 1645 och 1676 kommer ur Store norske leksikon; Wikipedia säger att staden plundrades och delvis brändes under Hannibalsfejden och Gyldenløvefejden, utan år.
- **Dalslands kanal byggs** (1864–1868, ekonomi, `two-sources`): svenska Wikipedia (Dalslands kanal och Håverud), Store norske leksikon, Lex och Wikidata (punkten är Håverud, där akvedukten ligger). Källorna skiljer sig om antalet slussar och längden grävd kanal (31 slussar och cirka 12 km enligt Wikipedia, 32 slussar och cirka 10 km enligt Lex, 28 slussar i den äldsta delen enligt Store norske leksikon); texten nämner därför inga sådana tal.
- **Tresticklan blir nationalpark** (1996, natur, `source-checked`): svenska och engelska Wikipedia och Wikidata (7 maj 1996 och punkten). Ingen oberoende andra källa öppnades.

## Samiskt
Dalsland ligger utanför de områden där uppdraget kräver en sökning efter samiska namn eller samisk historia. Ingen sökning gjordes. (Wikidata har ingen etikett för Dalsland på sydsamiska eller nordsamiska; det sågs i förbigående när etiketterna lästes.)

## Osäkert
- Konturens area är cirka 4 330 km² (plant närmevärde), cirka 16 % över landarealen i källorna (svenska Wikipedia 3 715 km², Store norske leksikon 3 708 km², Lex 3 707 km²) men under Wikipedias totala areal 4 953 km². Troligen ingår en del av Vänern (antagande), som beslutet om gränskällan förutsåg (14–17 % för landskap vid stora sjöar).
- Dalaborgs punkt ligger cirka 2 km från konturens kant, mot Vänern. Gränsen i sjön är inte kontrollerad.
- Inte prövade eller inte tagna med: Magnus Barfot och trekungamötet 1101 (mötet hölls i Kungahälla, utanför Dalsland), Dalaborgstraktaten 1388 (källorna är oense om den skrevs på Dalaborg eller Bohus), bruken från 1600-talet, havreodlingen och nödåren 1866–1868, emigrationen (finns redan som händelse i Västergötland), järnvägarna 1879, skifferbrytningen och pappersindustrin, och befästningarna under andra världskriget.
- Wikipedia lästes som wikitext (`?action=raw`), inte via API:t.
- Landskapsvapen är inte med.

## Berör
#1848, `data/platser.json`, `data/sources.json`, `data/handelser/fkr.json`, `data/handelser/1-1499.json`, `data/handelser/1500-1799.json`, `data/handelser/1800-1899.json`, `data/handelser/1980-.json`, `data/ortnamn/dalsland.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`, `data/oversattning.json`, `data/events.json`, `data/genererat/`, `tests/viktiga-platser.test.mjs`.
