# Närke som landskap (#1850)

**Datum:** 2026-11-28. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Närke byggs enligt mönstret från de tidigare landskapen.

**Varför Närke:** fyra av fem grannar är klara (Västergötland, Värmland, Västmanland och Södermanland; Östergötland saknas), och Närke hade noll händelser på kortet.

## Byggt
- Platsen `narke` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap`), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=narke`. En del, 453 punkter, inget grannland inom 30 km.
- Namnet är Wikidatas etikett (Q216687): "Närke" på sv, en, de och fr och "Nericia" på es. Alla fem språken har en etikett.
- Noten säger att Närke saknar havskust, att landskapet når Vättern i söder och Hjälmaren i öster, och att gränsen i sjöarna inte är kontrollerad mot någon källa. Konturen har inga borttagna öar att nämna: den är en enda del, och sjöarna är inte urklippta (Natural Earths land har inga sjöar).
- Källor (öppnade 2026-11-28): Store norske leksikon, Lex, svenska Wikipedia och Wikidata för landskapet, och 24 nya källposter för händelserna.
- Ortnamn: `data/ortnamn/narke.json` (Natural Earth: Örebro, Linköping, Norrköping, Mariestad; Östersjön) och Riseberga kloster (Q589426, saknar etikett på es och fr), Engelbrektsholmen (Q10484139, saknar de, es och fr) och Garphyttans nationalpark (Q761227) ur Wikidata i `data/ortnamn-komplettering.json`.
- Inga `major` (sju händelser: Fokus pausar vid alla).

## Händelserna på kortet (sju, kravet för landskap är tre)
Mätt med `placeEvents()` (med `linkIncludeEvents`, händelser ur `data/events.json` som inte är `draft`) med platsen på plats men före de nya händelserna: noll. Efter: sju, i kultur (2), religion, krig, civilisationer, natur och ekonomi, från 1000-talet till 1966. Alla punkter ligger inne i Närkes kontur (5–15 km från kanten), så syskonregeln påverkar inga grannar.

Grannarnas kort är oförändrade, både med bara konturen och med händelserna: Värmland 5, Västmanland 6, Södermanland 8, Västergötland 3 (och Halland 7).

- **Nastastenen** (mitten eller senare delen av 1000-talet, kultur, `source-checked`): svenska Wikipedia (Närkes runinskrifter 34) och Wikidata (punkten). `note` med `kind: "sources"`: namnen har lästs olika sedan 1600-talet; texten följer Sven B.F. Janssons läsning (Tored reste stenen efter sin son Lydbjörn), som Wikipedia återger. Ingen oberoende andra källa öppnades.
- **Riseberga kloster** (omkring 1180, religion, `source-checked`): svenska Wikipedia och Wikidata (1180 och punkten). Ingen oberoende andra källa öppnades. Wikipedias text säger att Birger Brosa skänkte jorden 1202, men bildtexten till hans donationsbrev säger cirka 1180; summeringen nämner därför bara gåvan, inte året.
- **Engelbrekt mördas vid Hjälmaren** (våren 1436, krig, `source-checked`): svenska Wikipedia (Engelbrekt Engelbrektsson och Engelbrektsholmen), Lex (våren 1436, ingen plats) och Wikidata (4 maj 1436; punkten är Engelbrektsholmen). `note` med `kind: "calendar"`: Engelbrektskrönikan anger 27 april och andra källor 4 maj, som i dag är allmänt accepterad; texten säger bara våren 1436, som Lex. Lex ger ingen plats, så nivån höjs inte. Wikipedia säger också att platsen inte är helt säker (de samtida källorna ger inget exakt svar).
- **Örebro slott blir renässansslott** (1573–1627, kultur, `two-sources`): svenska Wikipedia (arkitekterna 1573–1627), Lex (från 1570-talet till 1627, fyra flyglar, runda kanontorn) och Store norske leksikon (slottet från 1570-talet), Wikidata för punkten. `note` med `kind: "date"`: källorna skiljer sig om den första borgens ålder (Lex början av 1300-talet, Wikipedia mitten av 1300-talet, Wikidata 1270 och 1400-talet); därför handlar händelsen om ombyggnaden, där källorna är överens.
- **Bernadotte väljs till tronföljare i Örebro** (18 augusti 1810, civilisationer, `two-sources`): svenska Wikipedia (Urtima riksdagen 1810 och Sankt Nicolai kyrka, Örebro), Store norske leksikon (Örebro: riksdagen 1810 valde Bernadotte), Lex (Karl 14. Johan: augusti 1810) och Wikidata (riksdagen och punkten, Nikolaikyrkan). `note` med `kind: "date"`: stånden biföll förslaget 18 augusti och valakten justerades 25 augusti; Lex säger bara augusti.
- **Garphyttan blir nationalpark** (1909, natur, `source-checked`): svenska Wikipedia och Wikidata (21 juni 1909 och punkten). Ingen oberoende andra källa öppnades. Den nationella händelsen `sveriges-forsta-nationalparker` (punkten i Sarek) är oförändrad.
- **Skifferolja ur Kvarntorp** (1941–1966, ekonomi, `source-checked`): svenska Wikipedia (Kvarntorp, Kvarntorpshögen och Närke), Lex (Kvarntorp) och Wikidata (punkten är Kvarntorpshögen). **Källorna skiljer sig** om slutåret (1961, 1965 eller 1966 då verket stängdes); spannet täcker dem, och skillnaden står i `note`.

## Samiskt
Närke ligger utanför de områden där uppdraget kräver en sökning efter samiska namn eller samisk historia. Ingen sökning gjordes. (Wikidata har ingen etikett för Närke på sydsamiska eller nordsamiska; det sågs i förbigående när etiketterna lästes.)

## Osäkert
- Konturens area är cirka 4 750 km² (plant närmevärde), cirka 15 % över svenska Wikipedia och Store norske leksikon (4 126 km²) och Wikidata (4 122 km²), men cirka 3 % under Lex (4 884 km²). **Källorna skiljer sig** om arean. Troligen ingår delar av Vättern och Hjälmaren i konturen (antagande).
- Engelbrektsholmens punkt ligger i Hjälmaren nära stranden; med Lantmäteriets gräns ligger den inne i Närke, 5 km från kanten.
- Inte prövade eller inte tagna med: Tarstaborg (svenska Wikipedia ger ingen datering utöver "troligen mitten av järnåldern" på sidan om Närke), Örebro möte 1529 och riksmötet 1540, freden i Örebro 1812 (svenska Wikipedia säger 18 juli, Wikidata 6 juli 1812, med juliansk kalender som kalendermodell), Örebros brand 1854, Hjälmare kanal, järnvägen och Hallsberg, Kumlas skoindustri, alunbruk och bergsbruket i Kilsbergen.
- Wikipedia lästes som wikitext (`?action=raw`), inte via API:t. Engelska Wikipedia öppnades inte.
- Landskapsvapen är inte med.

## Berör
#1850, `data/platser.json`, `data/sources.json`, `data/handelser/1-1499.json`, `data/handelser/1500-1799.json`, `data/handelser/1800-1899.json`, `data/handelser/1900-1945.json`, `data/ortnamn/narke.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`, `data/oversattning.json`, `data/events.json`, `data/genererat/`.
