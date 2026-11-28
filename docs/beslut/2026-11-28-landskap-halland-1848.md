# Halland som landskap (#1848)

**Datum:** 2026-11-28. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Halland byggs enligt mönstret från de tidigare landskapen.

## Byggt
- Platsen `halland` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap`), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=halland`. En del, 499 punkter. Danmark ligger inom 30 km (en del med 8 punkter i `boundary.neighbours`), så punkter i havet som ligger i Danmark räknas inte till Halland. Namnet är Wikidatas etikett (Q626045): "Halland" på alla fem språken, också spanska. Noten säger att konturen är förenklad och klippt mot kusten och att små öar och skär saknas.
- Källor (öppnade 2026-11-28): Store norske leksikon, Lex, svenska Wikipedia och Wikidata för landskapet, och 20 källposter för de nya händelserna. Store norske leksikon har artikeln under `snl.no/Halland_-_landskap_i_Sverige` (`snl.no/Halland` svarar 404).
- Halland som danskt: Lex (Halland) skriver att Halland var danskt till freden i Brömsebro 1645, då det lämnades till Sverige på 30 år, och blev varaktigt svenskt vid freden i Roskilde 1658. Svenska Wikipedia och Store norske leksikon säger samma sak om 1645. Det är en egen händelse, `halland-blir-svenskt` (nedan).
- Ortnamn: `data/ortnamn/halland.json` (Natural Earth: Halmstad, Göteborg, Jönköping, Helsingborg, Borås, Kristianstad, Hillerød, Kattegatt och Öresund) och Varberg (Q21168) och Grimeton (Q922836) ur Wikidata i `data/ortnamn-komplettering.json`. Varberg saknas i Natural Earth. Grimeton saknar spansk etikett och har `es` som fallback.
- Inga `major` (sju händelser: Fokus pausar vid alla), enligt beslutet om landskapens pauser.

## Händelserna på kortet (sju, kravet för landskap är tre)
Mätt med `placeEvents()` före ändringen: inga. Efter: sju, i kultur (3), civilisationer, krig, vetenskap och ekonomi, från 1280-talet till 1974. Grannarnas kort är oförändrade (Skåne 21, Västergötland 3).

- **Borgen i Varberg byggs** (1287–1300, kultur, `two-sources`): svenska Wikipedia (Varbergs fästning: byggd 1287–1300 av greve Jacob Nielsen, dömd fredlös 1287 och anklagad för mordet på Erik Klipping 1286; Kristian IV byggde ut den 1588–1618), Lex och Store norske leksikon (Varberg: borgen går tillbaka till 1280-talet) och Wikidata (Q847100, 1287 och punkten).
- **Bockstensmannen** (cirka 1350–1370, kultur, `source-checked`): svenska Wikipedia (död cirka 1350–1370, hittad 1936 i Bockstens mosse cirka 25 km öster om Varberg, Europas enda fullständigt bevarade medeltida mansdräkt), Lex (Varberg: "fra 1360'erne") och Wikidata (Q492499 för etiketterna, Q10431910 Bockstens mosse för punkten). **Källorna skiljer sig** om dateringen (kol-14 1350–1390, dräktanalys 2008 1340–1370, en analys 1985 första halvan av 1300-talet, Lex 1360-talet); det står i `note`. Lex nämner inte fyndplatsen, så nivån höjs inte.
- **Halland blir svenskt** (1645–1658, civilisationer, `source-checked`): Lex (Halland och Halmstad), svenska Wikipedia (Halland: Hallands län bildas 1658 med egen landshövding) och Store norske leksikon (Halland och Halmstad). Årtalen stämmer i alla tre, men punkten är vårt val: Halmstad, som Lex och Store norske leksikon anger som administrativt centrum för Hallands län. Det står i `note` (`kind: "place"`). Därför `source-checked` och inte `two-sources`.
- **Slaget vid Halmstad** (17 augusti 1676, krig, del av skånska kriget, `source-checked`): svenska Wikipedia och Wikidata (Q2888779, datum och punkt). Wikidatas datum är troligen hämtat ur Wikipedia och räknas inte som oberoende. Wikidata märker datumet som gregorianskt; källorna säger inte i vilken kalender det är räknat (`note` med `kind: "calendar"`). Förlustsiffrorna skiljer sig inom Wikipedia-artikeln (faktarutan och texten), och texten på globen nämner inga.
- **Sveriges första friluftsmuseum** (1876–1879, kultur, `source-checked`): svenska Wikipedia (Bålastugan: köpt 1876 av Alfred Bexell, museum vid Göingegården 1879; Halland: Sveriges första friluftsmuseum och en inspiration för Skansen) och Wikidata (Q4899773). Punkten är Wikipedias koordinat för stugans plats i Varberg i dag (dit den flyttades 1907); Wikidatas punkt ligger cirka 30 km längre söderut. Det står i `note` (`kind: "place"`). Båda punkterna ligger i Halland.
- **Radiostationen i Grimeton** (1 december 1924, vetenskap, `source-checked`): svenska Wikipedia (i drift 1 december 1924, sex 127 meter höga torn, världsarv 2004, den ena sändaren fungerar), Store norske leksikon (Varberg: världens enda elektromekaniska radiosändare som fortfarande är intakt, inget årtal) och Wikidata (Q920206, punkten). Bara Wikipedia ger året.
- **Ringhals ger sin första ström** (17 augusti 1974, ekonomi, `source-checked`): svenska Wikipedia, Store norske leksikon, Lex (Sveriges största kärnkraftverk, inget årtal) och Wikidata (Q205774, punkten). **Källorna skiljer sig:** Store norske leksikon skriver i texten att de två första reaktorerna togs i drift 1974 men anger i tabellen 1975 och 1976; det står i `note`, och nivån höjs inte. "Nästan 20 procent av Sveriges elförbrukning" 1983 är Store norske leksikons uppgift.

Alla punkter ligger inne i konturen (prövat med shapely) och i inget annat landskap.

## Samiskt
Halland ligger utanför de områden där uppdraget kräver en sökning efter samiska namn (Norrland och gränsen Värmland/Dalarna). Ingen sökning gjordes.

## Osäkert
- Konturens area är cirka 4 960 km² (platt närmevärde), cirka 4 % över källorna (Store norske leksikon, Lex och svenska Wikipedia 4 786 km², Wikidata 4 796 km²).
- Om någon större ö saknas i Natural Earths kust är inte prövat ö för ö: Lantmäteriets landskap omfattar också havsyta, så en jämförelse mellan den oklippta och den klippta konturen visar bara hav. Noten säger därför bara att små öar och skär saknas.
- Wikipedias API svarade inte; sidorna lästes som wikitext (`?action=raw`). Engelska Wikipedia öppnades inte. Lex har inga artiklar om Bockstensmannen eller Grimeton (404).
- Inte prövade: Eskatorpsbrakteaten (den äldsta texten i Halland enligt Wikipedia, utan årtal i artikeln om landskapet), Jordanes omnämnande av *hallin* omkring 550, kung Valdemars jordebok 1231 (Hallandslistan), unionsmötena i Halmstad 1435–1537 och Halmstadrecessen 1483 (Store norske leksikon), Halmstadgruppen 1929, Halmstads slott, branden i Halmstad 1619 och emigrationen på 1800-talet.
- Landskapsvapen är inte med.

## Berör
#1848, `data/platser.json`, `data/sources.json`, `data/handelser/1-1499.json`, `data/handelser/1500-1799.json`, `data/handelser/1800-1899.json`, `data/handelser/1900-1945.json`, `data/handelser/1946-1979.json`, `data/ortnamn/halland.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`, `data/oversattning.json`, `data/events.json`, `data/genererat/`.
