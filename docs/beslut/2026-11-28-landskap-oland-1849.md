# Öland som landskap (#1849)

**Datum:** 2026-11-28. Följer beslutet [2026-11-27-landskapens-gransar-1847](2026-11-27-landskapens-gransar-1847.md) (gränskälla) och [2026-11-27-landskap-pauser-och-pilot-uppland](2026-11-27-landskap-pauser-och-pilot-uppland.md) (pauser, syskonregeln, verktyget). Inget nytt beslut av DasKrokodil: Öland byggs enligt mönstret från de tidigare landskapen.

## Byggt
- Platsen `oland` (typ `landskap`, `partOf: "sverige"`, `review: "source-checked"`): kontur ur Lantmäteriets distriktsindelning via `perliedman/svenska-landskap` (`boundary.landskap: "Öland"`, filen vid den fastlåsta commit som verktyget anger), klippt mot `data/land-10m.json` med `tools/platser_gransar.py --plats=oland`. En del, 114 punkter. **Inget grannland inom 30 km** (`boundary.neighbours` är tom). Konturen överlappar inte Smålands (prövat med shapely).
- **Klippningen:** distriktspolygonen i källfilen är cirka 1 760 km² (platt närmevärde) eftersom den går ut i vattnet; efter klippningen mot Natural Earths kust återstår cirka 1 235 km². Det som tas bort är vatten: cirka 295 km² öster om ön, cirka 210 km² i Kalmarsund och några mindre bitar vid norra udden. Natural Earth har alltså ön, men konturen blir cirka 8 % mindre än källornas area (Store norske leksikon 1 342 km², Lex 1 344 km², svenska Wikipedia och Wikidata 1 347 km²), troligen för att Natural Earths kust är grov (antagande).
- Namnet: Wikidatas objekt för **landskapet** är Q15981396 ("Öland", "province in Sweden"); ön har ett eget objekt (Q239276). Landskapsobjektet har etiketten "Öland" på sv, en, de och fr men **saknar spansk etikett**, så den spanska namnraden är också "Öland" (som för Värmland). Öobjektet har "Öland" på alla fem språken.
- Noten säger att konturen är förenklad och klippt mot kusten, att Öland är en ö i Östersjön skild från Småland av Kalmarsund, att Ölandsbron sedan 1972 förbinder ön med fastlandet vid Kalmar (svenska Wikipedia, Lex och Store norske leksikon om Öland) och att små öar och skär saknas.
- Källor (öppnade 2026-11-28): Store norske leksikon, Lex, svenska Wikipedia och Wikidata för landskapet, och 19 källposter för de nya händelserna.
- Ortnamn: `data/ortnamn/oland.json` (Natural Earth: bara Kalmar och Östersjön inom ramen) och Borgholm (Q893554), Färjestaden (Q1478888, saknar spansk etikett och har `es` som fallback) och Karlevi (Q2021953, saknar spansk etikett) ur Wikidata i `data/ortnamn-komplettering.json`. Hulterstad fick ingen egen ort: vrakplatsen ligger cirka 6 km från byn, mer än de 5 km som kompletteringen jämför mot. Inga andra ortnamnsfiler ändrades.
- Inga `major` (sju synliga händelser), enligt beslutet om landskapens pauser: Fokus pausar vid alla sju.

## Händelserna på kortet (sju, kravet för landskap är tre)
Mätt med `placeEvents()` (med `linkIncludeEvents` på alla platser, händelser ur `data/events.json` som inte är `draft`). **Före** (Öland fanns inte som plats): de två befintliga händelserna på Öland, `eketorps-borg-byggs` och `offerplatsen-skedemosse`, låg i Sverige, och Skedemosse syntes dessutom på Smålands kort via kustmarginalen. **Med Ölands kontur:** de två ligger inne i konturen (cirka 1,9 km från kanten). **Efter:** sju, i kultur (3), civilisationer, religion, krig och ekonomi, från järnåldern till 2000.

### `offerplatsen-skedemosse` försvinner från Smålands kort
Skedemosse (16,76° Ö 56,84° N) ligger cirka 16 km från Smålands kontur, inom kustmarginalen på 20 km, och visades därför på Smålands kort (se [beslutsfilen för Småland](2026-11-28-landskap-smaland-1849.md)). Nu ligger punkten inne i Ölands kontur, och syskonregeln (`inSibling()`) tar bort den från Småland: **Småland går från 9 till 8**, som väntat.

### Grannarnas kort
Alla platser i `data/platser.json` mättes före och efter. Bara tre kort ändras: Öland (0 → 7), Småland (9 → 8, Skedemosse) och Sverige (162 → 167, de fem nya). **Blekinge 7, Östergötland 8 och Gotland 4 är oförändrade.** `kalmarunionen-bildas` (Kalmar, inne i Smålands kontur, cirka 6 km från Ölands) ligger kvar på Smålands kort och hamnar inte på Ölands, eftersom punkten ligger i ett syskonlandskap.

### De fem nya
- **Karlevistenen reses** (omkring 1000, kultur, `source-checked`): svenska Wikipedia (Ölands äldsta runsten, rest omkring år 1000, troligen i slutet av 900-talet, efter den danske hövdingen Sibbe, Foldars son; skaldestrofen på dróttkvætt en av få bevarade i original) och Wikidata (Q1506388: år 1000 med precisionen århundrade). Bara en källa med text, och Wikipedia nämner att Sven Söderberg daterade inskriften till slutet av 1000-talet; det står i `note` (`kind: "date"`). **Punkten är byn Karlevi** (Wikidata Q2021953), cirka 2 km från stenen: Wikidatas punkt för stenen ligger vid stranden, 0,1 km utanför den förenklade kusten och bara cirka 5 km från Smålands kontur, så den skulle ha visats på både Ölands och Smålands kort. Det står också i `note`.
- **Regalskeppet Kronan sjunker vid Öland** (1 juni 1676, krig, `two-sources`): svenska Wikipedia (kantrade i en för tvär gir i slaget vid Ölands södra udde, krutförrådet antändes, över 800 döda, bland dem Lorentz Creutz; vraket på 26 meters djup omkring sex km öster om Hulterstad, hittat 1980), Lex (Stora Kronan: sänkt 1.6.1676 med cirka 800 man, återfunnet 1980 öster om Öland på 26 meters djup; Öland: dansk-nederländsk flotta mot svensk) och Wikidata (Q736140 och Q1789811: datum och vrakets punkt). `note` med `kind: "calendar"`: Wikidata märker datumet för slaget som julianskt. Punkten ligger i havet, cirka 3,7 km utanför Ölands kontur och 22,5 km från Smålands, så den syns bara på Ölands (och Sveriges) kort.
- **Borgholms slott blir ruin efter en brand** (1806, kultur, `two-sources`): svenska Wikipedia (Borgholms slottsruin: torn i slutet av 1100-talet, Pahr från 1572, aldrig fullbordat, vådeld 14 oktober 1806), Lex (Borgholms slott: troligen uppfört i slutet av 1100-talet, ruin efter en brand 1806), Store norske leksikon (Borgholm: utbyggnaden började 1572, förföll på 1700-talet, brand 1806) och Wikidata (Q1589230, punkten). Dagen 14 oktober står bara i Wikipedia och visas inte på globen.
- **Ölandsbron invigs** (30 september 1972, ekonomi, `two-sources`): svenska Wikipedia (6 072 m, invigd 30 september 1972, Europas längsta bro till 1998, beslutet vände utflyttningen), Lex (6 072 m, Europas längsta vid öppnandet 1972; Öland: turismen har ökat kraftigt), Store norske leksikon (Svinö–Möllstorp, öppnad 1972; Öland: turismen växte efter öppnandet) och Wikidata (Q296799: öppnad 30 september 1972). **Punkten är Färjestaden** (Wikidata Q1478888): Wikidatas punkt för bron ligger mitt i Kalmarsund, inom kustmarginalen för både Öland och Småland, och skulle ha visats på båda korten. Det står i `note` (`kind: "place"`). Bron hör lika mycket till Kalmar; att den bara står på Ölands kort är vårt val.
- **Södra Ölands odlingslandskap blir världsarv** (2000, kultur, `two-sources`): Unescos sida (inskriven 2000, kriterierna iv och v, 56 286 ha, bosättning i omkring fem tusen år), svenska Wikipedia och Wikidata (Q396132: världsarv från 2000, punkten).

Punkterna på land ligger inne i konturen (prövat med shapely): Karlevi cirka 1,5 km från kanten, Färjestaden cirka 1,0 km, Borgholms slott cirka 0,8 km och världsarvets punkt cirka 2,8 km. Ingen ligger i Småland.

## Samiskt
Öland ligger utanför de områden där uppdraget kräver en sökning efter samiska namn. Ingen sökning gjordes.

## Osäkert
- Konturen är cirka 8 % mindre än källornas area (se Byggt). Vilka öar som saknas är inte prövat ö för ö; noten säger bara att små öar och skär saknas.
- Två markörer står inte på händelsens exakta plats: Karlevistenen (byn, cirka 2 km från stenen) och Ölandsbron (Färjestaden, inte brofästet vid Möllstorp, som ingen öppnad källa ger en koordinat för). Båda står i `note`.
- Karlevistenen har bara en källa med text (svenska Wikipedia). Ingen artikel om stenen hittades i Lex eller Store norske leksikon (404).
- De befintliga händelserna `eketorps-borg-byggs` och `offerplatsen-skedemosse` är inte kontrollerade om i den här körningen.
- Wikidatas API svarade ofta 429; omförsök användes. Wikipedias sidor lästes som wikitext (`?action=raw`). Engelska Wikipedia öppnades inte.
- Inte prövade: Ismantorps borg, Gettlinge gravfält, Köpingsvik, Ölands djurgård 1569–1801 och Karl X Gustavs mur 1653, Ottenby kungsgård, Solliden, Långe Jan, Ölands järnväg och emigrationen.
- Landskapsvapen är inte med.

## Berör
#1849, `data/platser.json`, `data/sources.json`, `data/handelser/1-1499.json`, `data/handelser/1500-1799.json`, `data/handelser/1800-1899.json`, `data/handelser/1946-1979.json`, `data/handelser/1980-.json`, `data/ortnamn/oland.json`, `data/ortnamn-komplettering.json`, `data/licenses.json`, `data/oversattning.json`, `data/events.json`, `data/genererat/`.
