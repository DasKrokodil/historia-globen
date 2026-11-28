# Södermanland som landskap (#1850)

**Datum:** 2026-11-28. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Södermanland byggs enligt mönstret från de tidigare landskapen.

**Varför Södermanland:** två av fyra grannar är klara (Uppland och Västmanland; Närke och Östergötland saknas), och landskapet avgör frågan om `gustav-vasa`, som beslutet om Västmanland lämnade öppen.

## Byggt
- Platsen `sodermanland` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap`), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=sodermanland`. Sex delar (fastlandet och fem mindre delar i skärgården), 625 punkter, inget grannland inom 30 km.
- Namnet är Wikidatas etikett (Q626062): "Södermanland" på sv, en, de och fr. På es är etiketten "Sudermania (provincia histórica)"; kortet använder "Sudermania" utan tillägget inom parentes, som särskiljer artikeln från länet.
- Noten säger att konturen är förenklad och klippt mot kusten, att små öar och skär i skärgården saknas och att gränsen i Mälaren inte är kontrollerad mot någon källa.
- Källor (öppnade 2026-11-28): Store norske leksikon, Lex, svenska Wikipedia och Wikidata för landskapet, och 23 nya källposter för händelserna. `wp-sv-ryssharjningarna` fanns redan och återanvänds.
- Ortnamn: `data/ortnamn/sodermanland.json` (Natural Earth: Stockholm, Uppsala, Linköping, Örebro, Norrköping, Västerås, Nyköping; Östersjön och Bottniska viken) och Mariefred (Q194359) och Eskilstuna (Q26498) ur Wikidata i `data/ortnamn-komplettering.json`. Natural Earth saknar Eskilstuna. Båda har etiketter på alla fem språk, så ingen har `fallback`.
- Inga egna `major` (åtta händelser: Fokus pausar vid alla).

## Händelserna på kortet (åtta, kravet för landskap är tre)
Mätt med `placeEvents()` med platsen på plats men före de nya händelserna: en (`gustav-vasa`, se nedan). Efter: åtta, varav sju egna, i ekonomi, kultur (2), religion, civilisationer (2, med Gustav Vasa), krig och vetenskap, från 300-talet till 1853.

- **Tureholmsskatten** (cirka 300–550, ekonomi, `source-checked`): svenska Wikipedia (Tureholmsskatten, Södermanland, Västerljungs socken och Tureholms slott för punkten) och Wikidata (400-talet). **Källorna skiljer sig** om hur stor skatten är jämfört med andra (Sveriges största kända guldfynd, eller ett av de största); texten säger bara "omkring 12 kilo". Punkten är Tureholms slott, eftersom ingen källa ger en koordinat för fyndplatsen Tuna by. Båda står i `note`.
- **Sigurdsristningen vid Ramsund** (1000-talet, kultur, `two-sources`): svenska Wikipedia och Lex (Ramsundsristningen, början av 1000-talet nära Eskilstuna), Wikidata (punkten och 1000-talet). Källorna skiljer sig om vem bron gjordes för (Lex: Sigrids make; Wikipedia: Holmger, troligen hennes svärfar), så texten säger "en anhörigs själ". År och plats stämmer.
- **Klostret i Julita** (cirka 1180–1185, religion, `source-checked`): svenska Wikipedia (Julita kloster och Södermanland), Store norske leksikon (Julita) och Wikidata (punkten). **Källorna skiljer sig:** omkring 1180, 1185 eller troligen 1184; Wikidatas 1160 är grundandet vid Viby. Det står i `note`, och nivån höjs inte.
- **Nyköpings gästabud** (december 1317–1318, civilisationer, `source-checked`): svenska Wikipedia, Lex (Nyköping) och Wikidata (december 1317; punkten är Nyköpingshus). **Källorna skiljer sig** om hur hertigarna dog (oklart enligt Wikipedia, dödad enligt Lex); det står i `note` tillsammans med att huvudkällan är den partiska Erikskrönikan. Nivån höjs inte.
- **Gustav Vasa bygger Gripsholm** (1537, kultur, `two-sources`): svenska Wikipedia, Lex (Gripsholm) och Wikidata (1537 och punkten). Lex står för de fyra runda tornen och att Erik XIV satt fången där.
- **Ryssarna bränner Nyköping** (1719, krig, `partOf: "stora-nordiska-kriget"`, `two-sources`): svenska Wikipedia (Rysshärjningarna), Lex och Store norske leksikon (båda: Nyköping härjat av ryssarna 1719) och Wikidata (punkten för staden). `note` med `kind: "calendar"`: Wikipedia anger 24–25 juli utan att säga vilken kalender, så texten säger bara sommaren 1719.
- **Sveriges första ånglok** (2 juni 1853, vetenskap, `source-checked`): svenska Wikipedia (Förstlingen och Munktells Mekaniska Verkstad, vars koordinat är punkten) och Wikidata. Ingen oberoende andra källa öppnades. Wikidata anger att loket upphörde 1871, Wikipedia att det skrotades 1882; texten nämner inget av dem.

### `gustav-vasa` och syskonregeln
Gustav Vasas val i Strängnäs (punkten 17,03° Ö, 59,377° N) visades före ändringen på Upplands och Västmanlands kort via kustmarginalen (enligt beslutet om Västmanland 7,2 respektive 7,8 km från deras konturer). Punkten ligger **inne i Södermanlands kontur**, så syskonregeln tar nu bort den från de andra korten: Uppland går från 19 till 18 händelser och Västmanland från 7 till 6. Södermanland visar den som viktig (den är `major` i Sveriges lista), fast landskapet inte har några egna `major`. Gästriklands kort är oförändrat (4). `gustav-vasa` och koden i `js/` är inte ändrade.

## Samiskt
Södermanland ligger utanför de områden där uppdraget kräver en sökning efter samiska namn. Ingen sökning gjordes.

## Osäkert
- Konturens area är cirka 9 130 km² (plant närmevärde), cirka 9 % över källorna (Store norske leksikon, Lex, svenska Wikipedia och Wikidata: 8 388 km²). Troligen ingår delar av Mälaren och andra sjöar (antagande).
- Slaget vid Stäket 1719 prövades men togs inte med: Wikidatas punkt ligger i sundet, 40–50 m utanför både Upplands och Södermanlands kontur, och skulle synas på båda korten.
- Uppsa kulle lästes men togs inte med: svenska Wikipedia säger att högen aldrig har undersökts och ger ingen datering utöver järnåldern.
- Inte prövade: Södermannalagen 1327, Eskilstuna fristad, Södertälje kanal, slaget vid Julita 1467, Karl Knutsson i Strängnäs 1457. Stockholms södra del ligger i landskapet enligt Lex, men inga händelser där prövades; de befintliga händelserna i Stockholm ligger i Upplands kontur.
- Wikipedia lästes som wikitext (`?action=raw`), inte via API:t. Engelska Wikipedia öppnades inte.
- Landskapsvapen är inte med.

## Berör
#1850, `data/platser.json`, `data/sources.json`, `data/handelser/1-1499.json`, `data/handelser/1500-1799.json`, `data/handelser/1800-1899.json`, `data/ortnamn/sodermanland.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`, `data/oversattning.json`, `data/events.json`, `data/genererat/`.
