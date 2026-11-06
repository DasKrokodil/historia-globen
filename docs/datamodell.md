# Datamodell

Alla datafiler i `data/` och deras fält. Standarderna (årtal, osäkerhet, precision, plats och språk) står också i [CLAUDE.md](../CLAUDE.md#datamodell-och-standarder-beslut-3-6-8). Den här filen uppdateras när ett fält läggs till eller ändras.

## Kort sammanfattning

Läs detta först och sök sedan upp det avsnitt du behöver.

- **År** är heltal med astronomisk årsräkning (`0` = 1 f.Kr.); osäkerhet skrivs som EDTF i `edtf` och precision med Wikidatas skala i `precision`.
- **Plats** är GeoJSON i WGS 84, `[longitud, latitud]`.
- **Texter** lagras per språk, svenska först.
- **Källor och granskning:** posterna pekar på id i `sources.json` och har `review` (`draft`, `source-checked` eller `two-sources`).
- **Redigera källfilerna,** inte `data/events.json` eller `data/genererat/`. Händelser redigeras i `data/handelser/<period>.json` (#394). Kör `python3 tools/dela_data.py` efter ändringar i `data/handelser/` och `empires/index.json`.
- **JSON Schema:** `schemas/` beskriver den gemensamma grundnivån för händelser, källor, rikesregistret, vägar/resor och fun facts. `scripts/validate-site.py` använder en liten egen kontroll för `type`, `required`, `properties`, `items`, `enum`, `pattern` och `minimum`/`maximum`; den körs vid varje bygge. Det är medvetet inget externt Python-paket (#391).

**Avsnitt**
- Gemensamma standarder – år, osäkerhet, precision, plats, text, källor och granskning.
- `handelser/` och `events.json` – händelsernas redigeringsfiler och fält, inklusive bilder (`image`).
- `utkast/` – utkast från massimport som appen inte läser.
- `funfacts.json` – fun facts kopplade till händelser.
- `sources.json` – källregistret.
- `empires/` – riken: registret, faktarutor och rikenas fält.
- `routes/` (#38) – vägar och resor med etapper.
- `upptackt.json` (#101) – det som upptäcktsvyn visar.
- `religions.json` – religioner, områden och faktarutor.
- `religions-polities.json` (#194) – rikenas gränser i religionslagret.
- `styles.json` – bildstilar efter tid och plats.
- `genererat/` (#337) – de uppdelade filer som sidan laddar, med en fil per språk ovanpå (#675).
- `oversattning.json` (#675) – spärren mot oöversatta texter och registret över översättningar; skrivs av `tools/oversattning.py`, publiceras inte.
- `land.json` och `borders.json` – grundkartan och dagens gränser.
- `vyer.json` (#357) – grupper och förinställda vyer i Lager.

## Gemensamma standarder

| Vad | Standard | Exempel |
|---|---|---|
| År | Heltal, astronomisk årsräkning (ISO 8601): `0` = 1 f.Kr., `-1` = 2 f.Kr. *N f.Kr.* blir `1 - N`. | 2600 f.Kr. = `-2599` |
| Osäkerhet | EDTF-sträng i `edtf`: `~` ungefär, `?` osäker, `/` spann, `../` öppen start, `/..` pågår | `"-0005~/-0003~"` |
| Precision | Wikidatas skala i `precision`: 6 årtusende, 7 århundrade, 8 decennium, 9 år, 10 månad, 11 dag | `9` |
| Plats | GeoJSON i WGS 84, `[longitud, latitud]` | `{ "type": "Point", "coordinates": [35.226, 31.779] }` |
| Text | Per språk, svenska först. Saknas ett språk visas engelska, sedan svenska. | `{ "sv": "Jerusalem" }` |
| Källor | Lista med id ur `sources.json` | `["wp-crucifixion"]` |
| Granskning | `review`: `draft`, `source-checked` eller `two-sources`. Se [kallor.md](kallor.md). | `"source-checked"` |

## `handelser/` och `events.json`: händelser

**Redigeringsfiler (#394, beslut 2026-11-05):** händelserna redigeras i `data/handelser/`, en fil per period efter händelsens **startår**: `fkr.json` (år 0 och tidigare), `1-1499.json`, `1500-1799.json`, `1800-1899.json`, `1900-1945.json`, `1946-1979.json` och `1980-.json` (`1946-` delades vid 1980 i #611). Det är samma perioder som de uppdelade filerna i [`genererat/`](#genererat-uppdelade-filer-337). Varje fil har `schema`, `period` (filens period), `note` och `events`, en lista med händelser i formatet nedan. En ny händelse läggs sist i filen för sitt startår. Ändras `start` så att händelsen hamnar i en annan period, flyttas den till den filen.

`data/events.json` byggs av `tools/dela_data.py` ur redigeringsfilerna och redigeras inte. Den har alla händelser i en fil, en per rad: periodfilerna i periodernas ordning och händelserna i filens ordning. Verktyg, tester och formulärets serverfunktion läser den som förut. `python3 tools/dela_data.py --check` och `scripts/validate-site.py` stoppar en händelse i fel periodfil, ett id som finns två gånger, en okänd fil i `data/handelser/` och en `events.json` som inte stämmer med redigeringsfilerna (till exempel efter en ändring för hand).

Sidan läser händelserna uppdelade i ett index och de långa fälten per period, som `tools/dela_data.py` skriver (se [`genererat/`](#genererat-uppdelade-filer-337)).

```json
{ "id": "korsfastelsen", "category": "religion", "icon": "cross", "religion": "kristendom", "founding": true,
  "start": 30, "end": 33, "precision": 9, "edtf": "0030/0033",
  "location": { "type": "Point", "coordinates": [35.226, 31.779] }, "place": { "sv": "Jerusalem" },
  "title": { "sv": "Jesus korsfästs" },
  "summary": { "sv": "Jesus korsfästs i Jerusalem, troligen år 30 eller 33. …" },
  "sources": ["wp-crucifixion", "wp-jerusalem"], "review": "source-checked" }
```

**Obligatoriska fält:** `id` (läsbart och unikt), `category` (en av de fjorton kategorierna i `model.js`; `katastrofer` sedan #554), `start`, `end`, `precision`, `edtf`, `location`, `place`, `title`, `summary`, `sources` och `review`.

**Valfria fält:**

| Fält | Betydelse |
|---|---|
| `locationPrecision` | `region` eller `country` när platsen är ungefärlig |
| `wikidata` | Q-id, bara om det är kontrollerat eller kommer från en källa vi litar på |
| `icon` | Ikonens namn i `img/icons/`, till exempel `swords`, `crown`, `star`, `treaty` (fredsavtal, vapenstillestånd och kapitulationer: dokument med sigill, #242) |
| `kind` | `"war"` för ett krig, med start och slut som spann |
| `partOf` | Krigets id, för slag och andra händelser i ett krig |
| `top` | `true` för krigets enda viktigaste händelse, som syns utzoomat |
| `major` | `true` för krigets stora händelser, där uppspelningen pausar i fokusläget |
| `story` | Krigets berättelse i fokusläget: `intro`, `parties` (lista med `name` och `members`), `outcome`, `casualties` och `sources` |
| `empires` | Valfritt, bara på krig (#76): lista med grupp-id ur `data/empires/index.json` (till exempel `["romarriket", "kartago"]`) för riken i kartdatan som var krigförande part. En koppling läggs bara in när krigets `story.parties` (eller källan bakom dem) nämner riket som part, och när rikets kartspann (`from`–`to`) överlappar krigets år. Ett rike som bara skickade vapen eller stöd räknas inte. Slag och händelser i kriget ärver kopplingen via `partOf` och anger inte fältet själva. Rikets faktaruta listar rikets krig under "Krig", och krigets kort och faktaruta visar "Riken i kriget". `scripts/validate-site.py` kontrollerar att varje id finns. |
| `ongoing` | `true` för ett krig som pågår (#223). `edtf` har öppet slut (`"2022-02-24/.."`), och `end` är året då läget senast kontrollerades. Vid laddning flyttar `model.js` fram `end` till innevarande år enligt datorns klocka, så kriget räcker till i dag utan att något årtal står i koden. Tiden visas "2022–pågår". |
| `story.takeaways` | Valfritt (#500, Rikards beslut 2026-11-03): det viktigaste att ta med sig, visat i slutkortet under "Hur kriget slutade" (och under "Läget i dag" för pågående krig). Lista med punkter `{ status, text, sources }`. `status` är `belagt` (rubriken "Det här vet vi från källorna"), `omtvistat` ("Här är forskare inte överens") eller `okant` ("Det här vet vi inte säkert"). Varje punkt har egna `sources`, och texten säger bara det som källan säger; inga läxor eller värderingar som vi själva hittar på. `outcome` återberättas inte. En osäker punkt förklarar i ord vad som är osäkert. Saknas fältet är slutkortet som förut. Första krigen: första och andra världskriget och Haitiska revolutionen. |
| `story.asOf` | För ett pågående krig: datumet (`"2026-10-30"`) då läget i dag och dödssiffrorna senast kontrollerades. `outcome` är då läget i dag, inte hur kriget slutade, och `casualties` skrivs som "hittills, enligt uppskattningar" med datum och vem som har uppskattat. |
| `story.chapters` | Valfritt (#244): krigets kapitel som band över tidslinjen i fokusläget. Lista med `title` (per språk), `from` och `to` (år, som `start` och `end` i händelserna), valfritt `edtf` med datum för korta krig (`"1967-06-05/1967-06-06"`) och `sources` (minst ett id i sources.json). Kapitlen och deras namn ska komma ur källorna, till exempel en indelning i faser som källan själv gör; hitta aldrig på namn. Saknas fältet visas neutrala band mellan krigets stora händelser i stället. Inga krig har fältet än. |
| `religion` och `founding` | Religionens id i `religions.json` och `true` för händelser där religionen grundades. Fokus på religionen börjar där. Ikonen (`icon`) är religionens symbol (`symbol` i `religions.json`, #271), till exempel `cross` för kristendomen. |
| `note` | Extra ruta i faktarutan: `title` och `text`, till exempel "Om år 0" |
| `image` | Bild i faktarutan, se nedan |
| `tags` | Valfritt (#555, Rikards beslut 2026-11-03): lista med taggar tvärs över kategorierna. Den enda tillåtna taggen är än så länge `framsteg` (enum i `schemas/event.schema.json`), till exempel `"tags": ["framsteg"]`. Faktarutan visar då märkningen "Framsteg" med en kort förklaring, och vyn Framsteg i Lager visar bara händelser med taggen. Taggen sätts **bara** när källan på händelsen själv beskriver den som en förbättring (en sjukdom förklarad utrotad, slaveri avskaffat, en rättighet införd). Inget omstritt: ett framsteg för en grupp som var en förlust för en annan får ingen tagg, eller en öppen `note` ("Källorna skiljer sig"). Inga händelser skrivs bara för att få ihop vyn. Taggen sätts av Claude Code med källa, inte av Codex. Händelser utan `tags` fungerar som förut. |

### `image`: bild i faktarutan

```json
"image": { "file": "images/events/columbus.webp", "kind": "illustration", "style": "renassans", "variant": "portolan",
  "caption": { "sv": "Illustration i stil med en portolankarta, inte en historisk bild" },
  "credit": "AI-genererad med <verktyg>, 2026-10-29", "license": "CC BY 4.0", "prompt": "<den exakta prompten>" }
```

| Fält | Betydelse |
|---|---|
| `file` | `images/events/<händelse-id>.webp`, 800 × 600 |
| `kind` | `historisk` (riktig bild) eller `illustration` |
| `source` | Filsidans id i `sources.json`, krävs för historiska bilder |
| `style`, `variant` | Bildstil och variant ur `styles.json` |
| `caption`, `credit`, `license` | Bildtext, upphov och licens, som visas under bilden |
| `prompt` | Exakt prompt för illustrationer |
| `placeholder` | `true` för platshållare, som märks "Platshållare" |

Reglerna för bilder står i [CLAUDE.md](../CLAUDE.md#bilder-129).

## `utkast/`: utkast från massimport

Filerna i `data/utkast/` har samma format som `events.json` (`schema`, `notes`, `events`), men alla händelser har `review: "draft"` och appen läser inte filerna. Ett utkast flyttas till rätt periodfil i `data/handelser/` när det är källkontrollerat (se [kallor.md](kallor.md#utkast-från-massimport)).

`utkast/hced.json` byggs med `tools/hced.py` ur Historical Conflict Event Dataset (#24). Titel och plats är på engelska, som i datasetet, och sammanfattningen är byggd ur fälten. Extra fält:

| Fält | Betydelse |
|---|---|
| `generated` | När och hur filen byggdes: urval eller allt, antal platser, utkast, överhoppade och fördelning per världsdel och tidsålder |
| `duplicates` | Utkast (eller platser utanför urvalet, `utkast: null`) som troligen redan finns i `events.json`: `finns` är händelsens id och `skäl` avståndet och/eller att namnet stämmer |
| `hced` (per utkast) | Spårbarhet: `whg` (platsens id i World Historical Gazetteer), `srcId` (id i datasetet), `conflict` och `year` som det står i datasetet (historiskt år, `-1184` = 1184 f.Kr.), och `check` när punkten verkar fel. Tas bort när utkastet flyttas till `events.json`. |

## `funfacts.json`: fun facts

```json
{ "id": "mammut-pyramid", "events": ["mammutar-wrangel", "cheopspyramiden"], "show": [-2650, -2450],
  "review": "source-checked", "text": { "sv": "Medan Cheopspyramiden byggs lever det fortfarande ullhårsmammutar …" } }
```

`events` pekar på händelserna som jämförs, och fun facten ärver deras källor. `show` är spannet då kortet visas. Siffror i texten ska gå att räkna fram ur händelsernas årtal.

Korten "När ett krig bröt ut" lagras inte här. De byggs i koden ur händelserna, inom 5 år från krigets start.

## `sources.json`: källregister

Laddas vid första faktarutan, klickrutan för en väg, upptäcktsvyn eller Om källorna (#337), inte vid start.

```json
{ "id": "wp-crucifixion", "title": "Crucifixion of Jesus – Wikipedia", "url": "https://en.wikipedia.org/wiki/Crucifixion_of_Jesus",
  "license": "CC BY-SA 4.0", "checked": "2026-10-29" }
```

`checked` är datumet då källan senast öppnades och kontrollerades. Id:t `wikidata` är reserverat och länkar till händelsens egen Wikidata-post.

## `empires/`: riken

`empires/index.json` listar varje rike (grupp). Sidan läser den uppdelad (#337): registret utan faktarutor vid start och faktarutorna (`facts`) när de behövs, se [`genererat/`](#genererat-uppdelade-filer-337).

```json
{ "id": "hanriket", "name": { "sv": "Hanriket", "en": "Han dynasty" }, "color": "#d0703a", "from": -202, "to": 237,
  "file": "data/empires/hanriket.json", "polities": [{ "id": "hanriket", "name": { … }, "sources": ["cliopatria"], "review": "source-checked" }] }
```

`empires/<rike>.json` innehåller gränserna och laddas när riket behövs:

```json
{ "schema": "historia-globen/areas@1", "group": "hanriket",
  "polities": [{ "id": "hanriket", "group": "hanriket", "name": { … }, "wikidata": "Q1068371", "color": "#d0703a",
    "sources": ["cliopatria"], "review": "source-checked",
    "periods": [{ "start": -202, "end": -127, "areaKm2": 2042615, "label": [111.5, 33.4], "geometry": { "type": "MultiPolygon", … } }] }] }
```

Ett rike kan bestå av flera delar, till exempel Romarriket med kungadömet, republiken, kejsardömet och Bysans. Varje period har en egen gräns. `label` är platsen där namnet skrivs ut. Filerna byggs med `tools/riken.py` ur Cliopatria. Faktarutorna (`facts`, se nedan), symbolerna (`symbol`) och de egna faktarutorna för enskilda riken (`polityFacts`) skrivs för hand; skriptet läser den befintliga `index.json` och behåller de fälten i varje rike när filen skrivs om (#68, #301).

Medeltidens riken (R3, #69): Umayyad- och abbasidkalifaten, Frankerriket (merovinger och karoliner, Cliopatrias sammanslagna `(Merovingian Empire)` och `(Carolingian Empire)`), Tysk-romerska riket (`(Holy Roman Empire)`), Tang- och Songdynastierna, Khmerriket, Ghanariket, Maliriket, Kievriket och Timuridriket, var och en en egen grupp med faktaruta. Källor: Wikipedia och World History Encyclopedia (NC, bara länkad). Kartdatans avvikelser står i varje rikes `mapNote`, till exempel att Cliopatria saknar abbasidkalifatet 970–1201 och från 1459 bara räknar Tysk-romerska rikets småstater till riket.

Tysk-romerska riket efter 1458 (#336, Rikards val A i #69): Cliopatria räknar från 1459 bara småstaterna till `(Holy Roman Empire)`. Därför bygger `tools/riken.py` ihop riket efter 1458 enligt tabellen `EXTEND` (en post per rike som ska byggas ihop): `polity` (rikets namn i Cliopatria), `after` (sista året med Cliopatrias egen gräns), `border` (rikets gräns ett visst år, här 1458), `outside` (länder som ligger i den gränsen men inte hörde till riket, här Ungern och Tyska ordens Preussen), `add` (Cliopatria-riken med första och sista år som räknas in, till exempel Habsburgarnas länder, Böhmen, Brandenburg och Preussen, Sachsen, Bayern och Hannover) och `remove` (riken som klipps bort från ett visst år, här Schweiz och Förenade Nederländerna från 1648). För varje år där något av rikena ändras läggs rikets egen post och de angivna rikena ihop och klipps mot gränsen; resten (förenkling och sammanslagning av perioder) är som för andra riken. `areaKm2` räknas då ur den byggda gränsen (ytriktig projektion på en sfär). Områden som ett rike utanför listan tar över, till exempel Frankrike, faller bort. Hur kartan är byggd står i rikets `mapNote`.

Tidigmoderna riken (R4, #70): Aztekriket (staden Tenochtitlan och trippelalliansen), Inkariket, Songhairiket, Mogulriket, Safavidriket, Mingdynastin (med Södra Ming), Qingdynastin, Spanska och Portugisiska imperiet (Cliopatrias sammanslagna `(Spanish Empire)` och `(Portuguese Empire)`, moderland och kolonier), Ryssland (tsardömet och kejsardömet), Svenska stormaktsväldet (`Swedish Empire`), Habsburgska riket (`(Habsburg Monarchy)`) och Tokugawa-Japan, var och en en egen grupp med faktaruta. Spanska och portugisiska imperiet och Ryssland förenklas hårdare (`OVERRIDES` i `tools/riken.py`). Källor: Wikipedia, World History Encyclopedia (NC, bara länkad) och Wikidata (start- och slutår). Kartdatans avvikelser står i varje rikes `mapNote`, till exempel att Cliopatria räknar Portugal och dess kolonier till Spanska imperiet 1582–1639 och visar `Swedish Empire` ända till 1814, fast stormaktstiden slutade 1721. Därför är Sveriges post delad i två delar i `GROUPS` med samma Cliopatria-namn och olika `years` (Rikards val A i #70): Svenska stormaktsväldet (`svenska-stormaktsvaldet`) till och med 1721 och Sverige (`sverige-1722`, Wikidata Q34) 1722–1814. Från #556 fortsätter gruppen med unionen Sverige-Norge (`sverige-norge`, `United Kingdoms of Sweden and Norway`) 1815–1904 och Sverige (`sverige-1905`, `Kingdom of Sweden` klippt till 1905–2024), så att den faktiskt går "och efter". Gruppen heter "Sverige: stormaktsväldet och efter" och har kvar id:t `svenska-stormaktsvaldet`, så krigens `empires` pekar rätt. Delarna har olika engelska namn, eftersom religionslagrets teckenförklaring slår upp rikena på det engelska namnet. Har flera delar samma Cliopatria-namn gäller den första delens namn när riket nämns som lydrike i ett annat rikes inflytande (#75).

Kolonialvälden och moderna imperier (R5, #71): franska kolonialväldet (Cliopatrias sammanslagna Frankrike med kolonier i sex skeden, `(Bourbon Kingdom of France)` 1815–1847 till `(French Fourth Republic)` 1945–1957), nederländska kolonialväldet (`(Dutch Republic)`, `(Batavian Republic)` och `(Netherlands)` till 1949), Tyska riket (`German Empire` och `German Africa`), Österrike-Ungern, Japanska imperiet (`Empire of Japan`), Etiopiska kejsardömet (`Ethiopian Empire` och `Ethiopia` till 1974) och Sovjetunionen, var och en en egen grupp med faktaruta. Två valfria inställningar per del i `GROUPS` (ett femte element, en ordbok): `years` (från, till) klipper delens spann, och en lista med Cliopatria-namn i stället för ett namn slår ihop posterna år för år till en del (`parts` i rikesfilen; `areaKm2` är då summan av posternas ytor). Kartdatans avvikelser står i varje rikes `mapNote`, till exempel att Cliopatria saknar Frankrike och Nederländerna med kolonier 1943–1944.

**Försvunna länder (R6, #72).** Länder som inte finns längre har fältet `vanished` på gruppen i `empires/index.json`. Det är fältet som gör gruppen till ett försvunnet land: den listas under fliken Försvunna länder i Fokus (alla länder, i tidsordning, oavsett året man står på) i stället för under Riken, och faktarutan får en ram med årtal, föregångare och vad landet blev. Grupperna är Kalmarunionen (`(Kalmar Union)`), Preussen (`Duchy of Prussia`, `Brandenburg-Prussia` 1619–1701 och `Kingdom of Prussia` 1702–1806), Österrike-Ungern och Sovjetunionen (från R5), Jugoslavien (`Yugoslavia` och `Socialist Federal Republic of Yugoslavia`), Tjeckoslovakien, Storcolombia (`Gran Colombia`), Republiken Texas, Kungariket Hawaii (`Kingdom of Hawaï'i`) och Neutrala Moresnet, som saknas i Cliopatria.

```json
"vanished": { "wikidata": "Q36704", "founded": 1918, "dissolved": 1992, "edtf": "1918-12-01/1992-04-27",
  "predecessors": [{ "name": { "sv": "Österrike-Ungern" }, "group": "osterrike-ungern", "wikidata": "Q28513" }],
  "successors": [{ "name": { "sv": "Kroatien" }, "wikidata": "Q224" }],
  "note": { "sv": "Källorna skiljer sig …" }, "sources": ["wp-yugoslavia", "wd-yugoslavia"], "review": "two-sources" }
```

- `founded` och `dissolved` är landets årtal enligt källorna (astronomiska år), `edtf` med datum där källorna har det. De kan skilja sig från kartdatans `from`/`to`. Ett land följs i Fokus från det tidigaste till det senaste av de två spannen.
- `predecessors` och `successors` hämtas från Wikidata (P1365 "ersätter", P1366 "ersattes av", P571 bildande, P576 upplösning; CC0) och jämförs med Wikipedia. `name` är landets namn, `group` (valfritt) en grupp i `index.json` (då blir namnet en knapp som börjar följa det riket), `wikidata` (valfritt) ett Q-id som har kontrollerats mot Wikidatas etikett.
- `note` säger öppet var källorna skiljer sig. `sources` och `review` gäller årtalen och efterträdarna; `two-sources` bara när Wikipedia och Wikidata anger samma år för bildande och upplösning.
- `point` (valfritt): ett land utan gräns i Cliopatria (Neutrala Moresnet) har ingen fil, och `polities` är tom. Det ritas som en ring med prick och namn på `point` (GeoJSON `Point`) under åren `founded`–`dissolved`, och `from`/`to` är då källornas årtal. `tools/riken.py` skapar posten ur en grupp utan delar i `GROUPS` och hämtar `vanished` ur den befintliga `index.json`.

`tools/riken.py` behåller `vanished`, som `facts`, när filen skrivs om. En ny inställning per del i `GROUPS`, `wikidata`, ersätter Cliopatrias Q-id när det är fel (Cliopatria anger den socialistiska förbundsrepubliken, Q83286, också för kungariket Jugoslavien). Kartdatans avvikelser står i varje lands `mapNote`, till exempel att Cliopatria saknar Preussen efter 1806 och räknar Tjeckoslovakien till Sovjetunionen 1969–1990.

**Stater i Amerika (R7, #407).** Första omgången stater som krigen och resorna behöver: USA (`United States of America`), Amerikas konfedererade stater (försvunnet land, `vanished`, 1861–1865), Mexiko (Cliopatrias fem poster efter styrelseskick: `First Mexican Empire`, `Federated Republic of Mexico`, `Centralist Mexico`, `Second Mexican Empire` och `Mexico`, som får Wikidata Q96 i stället för Cliopatrias Q5062192), Brasilien (`Empire of Brazil` och republikens fyra poster ihopslagna till en del), Argentina (`Argentine Confederation` och `Argentine Republic` ihopslagna; Cliopatria kallar landet konfederation ända till 1929), Paraguay och Uruguay (`Oriental Republic of Uruguay`). USA förenklas hårdare (`OVERRIDES`). Krigen kopplas med `empires`: inbördeskriget, Paraguaykriget, mexikanska revolutionen, frihetskriget, de spanskamerikanska självständighetskrigen (Mexiko) och de krig där USA står bland parterna (världskrigen, Korea, Vietnam, Gulfkriget, Irak och Afghanistan). Källor: Wikipedia och Wikidata. Kartdatans avvikelser står i varje lands `mapNote`, till exempel att Cliopatria saknar Mexiko 1913–1919 och Paraguay 1870–1876. Fler stater i Afrika, Asien och Oceanien kommer i nästa omgång.

**Stater i Mellanöstern (R7, #407, andra omgången).** Israel (`State of Israel`), Egypten från 1922 (gruppen `moderna-egypten`, eftersom `egypten` är det forntida Egypten: `Kingdom of Egypt`, `Republic of Egypt`, `United Arab Republic` och `Arab Republic of Egypt`), Syrien (Cliopatrias fem poster efter styrelseskick ihopslagna till en del med Wikidata Q858), Jordanien (`Kingdom of Jordan`), Irak (`Kingdom of Iraq`, och `Iraqi Republic` och `Republic of Iraq` ihopslagna), Iran (`Qajar Dynasty`, `Pahlavi Dynasty` och `Islamic Republic of Iran`) och Kuwait (`Kuwait` och `State of Kuwait` ihopslagna). Krigen kopplas med `empires`: kriget 1948 mellan Israel och arabstaterna, sexdagarskriget, jom kippurkriget, Iran–Irak-kriget, Gulfkriget och Irakkriget. Källor: Wikipedia och Wikidata. Kartdatans avvikelser står i varje lands `mapNote`, till exempel att Cliopatria räknar ockuperade områden till Israel, räknar Syrien till Förenade arabrepubliken till 1966 och saknar Irak 1958–1959 och 2006–2013.

**Nutida stater, första omgången (#644).** De tio största luckorna år 2024 enligt `tools/tackning_riken.py`: Kina (`Republic of China` 1912–1949 som Republiken Kina och `People's Republic of China`), Taiwan (Cliopatrias `Republic of China` 1950–2024 under namnet Taiwan, Rikards beslut), Kazakstan, Algeriet (`People's Democratic Republic of Algeria`, från 1963 i Cliopatria), Danmark (`Denmark`, med Grönland från 1946), Indonesien (`Republic of Indonesia`), Saudiarabien (`Kingdom of Hejaz and Nejd` 1926–1935 och `Kingdom of Saudi Arabia`), Sudan (`Republic of Sudan`), Libyen (`Kingdom of Libya`, och `Libyan Arab Republic` och `State of Libya` ihopslagna), Mongoliet (`Mongolian People's Republic` och `Mongolia`) och Tchad (`Republic of Chad`). Kartan går före fakta: grupperna har bara gräns och namn, svenska namn ur Wikidata och engelska där svenskt namn saknas (Kingdom of Nejd and Hejaz). Bara Kina och Taiwan har en faktaruta, med noterna om Taiwan och Kashmir (docs/omstridda-granser.md). Cliopatrias Wikidata-id är fel för Danmark (Q350186, Kristofer II), Libyska arabrepubliken (Q17435890, en historieartikel) och Mongoliet 1912–1925 (Q7313, Yuandynastin), så delarna har `wikidata` i `GROUPS`; Mongoliet 1912–1925 är inte med. Cliopatria saknar Republiken Kina 1916–1929.

**Nutida stater, andra omgången (#644).** Nästa elva luckor år 2024: Angola (`People's Republic of Angola`), Mali (Cliopatrias `Mali Federation` 1960–2024; Wikidata Q912 i stället för Cliopatrias Q216632, Malifederationen, och år 1960 med Senegal, som i Cliopatria), Sydafrika (`South Africa`, som i Cliopatria räknar Namibia till Sydafrika 1932–1989), Niger, Mauretanien, Tanzania, Namibia, Moçambique, Turkiet (`Republic of Turkey`), Zambia och Frankrike (`French Fifth Republic` från 1958, på kartan med namnet Frankrike; Frankrike före 1958 ingår i franska kolonialväldet). Cliopatria räknar Algeriet och Djibouti till Femte republiken till och med 2023, också de år då de är egna stater i Cliopatria. En ny inställning per del i `GROUPS`, `minus` (lista med Cliopatria-namn), klipper bort de staterna de år de finns, så att länderna inte överlappar. Kartan före fakta, som i första omgången: inga faktarutor.

**Nutida stater, tredje omgången (#644).** Myanmar (Cliopatrias `Burma` från 1948 och `Union of Myanmar` ihopslagna, Wikidata Q836; Burma före 1885 är inte med), Somalia, Centralafrikanska republiken, Madagaskar, Sydsudan (från 2014, som i Cliopatria), Kenya, Botswana, Thailand (`Kingdom of Thailand` från 1932), Turkmenistan och Kamerun. Cliopatria räknar Botswana till Brittiska imperiet till och med 1968, fast Botswana är eget land från 1967 i Cliopatria; imperiet har därför `minus` med Botswana, som Frankrike i andra omgången. Spanien, Norge, Japan och Marocko hör till de största luckorna men väntar: de överlappar riken vi redan har (Spanska imperiet, Sverige-Norge och Japanska imperiet), och Marocko behöver noten om Västsahara.

**Nutida stater, fjärde omgången (#644).** Spanien (`Second Spanish Republic` 1932–1938, `Francoist Spain` 1939–1975 och `Kingdom of Spain` från 1976; Spanska imperiet slutar 1931), Jemen (Wikidata Q805 i stället för Cliopatrias Q199841, Sydjemen), Norge (`Kingdom of Norway` från 1905, efter unionen med Sverige; 1941–1944 har Norge nästan ingen yta i Cliopatria), Uzbekistan, Japan (`Japan` från 1953, Wikidata Q17 i stället för Q188712, Kejsardömet Japan; Cliopatria saknar Japan 1946–1952), Marocko (1670–1911 och från 1956, med noten om Västsahara), Zimbabwe (från 1983), Tyskland (`Federated Republic of Germany` från 1991), Malaysia och Kongo-Brazzaville (Wikidata Q971 i stället för Q974, Kongo-Kinshasa). Cliopatria räknar Japan till USA 1947–1966 och Okinawa till USA till och med 2005, också de år då Japan är eget land i Cliopatria; USA har därför `minus` med Japan. Okinawa låg först kvar i USA till och med 2005, eftersom ön är för liten för att perioderna ska skiljas åt vid förenklingen; det rättas i femte omgången med `splits`.

**Nutida stater, femte omgången (#644).** Filippinerna (från 1947), Finland (från 1918), Elfenbenskusten, Polen (`Second Polish Republic` 1919–1939 och `Republic of Poland` från 1953; Cliopatria saknar Polen 1940–1952), Oman (`Sultanate of Oman` 1744–1899 och från 1973, `Sultanate of Muscat and Oman` 1900–1946; Cliopatria saknar 1947–1972), Italien (Cliopatrias `Kingdom of Italy` klippt till 1862–1945, eftersom posten också har det medeltida kungariket 936–969, och `Republic of Italy` från 1946), Burkina Faso, Gabon, Guinea (Wikidata Q1006 i stället för Cliopatrias Q983, Ekvatorialguinea) och Ghana. Storbritannien väntar, eftersom det är moderlandet i Brittiska imperiet. `minus` kan nu också ta `(namn, från år)`, så att en stat bara klipps bort från ett visst år: Brittiska imperiet har `minus` med Ghana och med Oman från 1973, och USA med Filippinerna. En ny inställning per del, `splits` (år), anger år där perioderna aldrig slås ihop, så att en liten men viktig ändring inte försvinner i sammanslagningen. USA har `splits` 1947, 1953 och 1973, så att Filippinerna inte ligger kvar i USA efter 1946, Japan inte efter 1952 och Okinawa inte efter 1972.

**Nutida stater, sjätte omgången (#644).** Rumänien (`Kingdom of Romania` 1919–1947, `Socialist Republic of Romania` 1948–1989 och `Romania` från 1990 med Wikidata Q218 i stället för Cliopatrias Q203493, kungariket; Cliopatria saknar 1945–1946), Laos (`Kingdom of Laos` 1956–1975 och `Communist Laos`), Guyana, Belarus, Senegal (från 1961; år 1960 ingår Senegal i Mali, som i Cliopatria), Kirgizistan, Kambodja (`Kingdom of Cambodia` 1956–1975 och från 1996, `Khmer Rouge` 1976–1978 under namnet Röda khmererna, som Wikidata kallar Cliopatrias Q191764, och `People's Republic of Kampuchea` 1979–1995), Tunisien, Nepal (från 1775) och Surinam. Cliopatria räknar Guyana till Brittiska imperiet till och med 1968, fast landet är eget från 1967; imperiets `minus` har därför också Guyana.

**Nutida stater, sjunde omgången (#644).** Tadzjikistan, Nicaragua (från 1840), Eritrea, Kuba (`Republic of Cuba` och `Communist Cuba` ihopslagna; Cliopatria saknar 1908–1910), Grekland, Benin, Honduras (från 1840), Island (`Kingdom of Iceland` 1918–1939 och `Republic of Iceland` från 1946), Bulgarien och Guatemala (från 1840). Cliopatria kallar Grekland 1822–1940 `First Hellenic Republic`, fast Wikidata bara använder det namnet för 1822–1833, och Bulgarien 1880–1944 `Principality of Bulgaria`, fast furstendömet enligt Wikidata fanns till 1908. Greklands fyra poster och Bulgariens fyra är därför ihopslagna till en del vardera, Grekland (Q41) och Bulgarien (Q219), så att kartan inte visar missvisande namn.

**Rikenas namn på fler språk (#676, #675).** `tools/riken.py` skriver namnen med svenska och engelska. Övriga språk (tyska, spanska och franska) står i datan och bevaras när filerna byggs om, så länge det svenska namnet är oförändrat; ändras svenskan tas de bort, eftersom de då är inaktuella. `tools/riken_namn.py <grupp> …` fyller i de namn som saknas ur Wikidatas etiketter (CC0) för delens Wikidata-id, i både `index.json` och rikesfilen, och gruppens namn från den del som heter som gruppen. Nya riken får namnen i samma pull request (spärren mot oöversatt innehåll); de tio staterna i sjunde omgången var de första.

**Huvudlandet i utspridda välden (#74).** Ett kolonialvälde har samma färg i alla delar. Moderlandet ritas med tätare fyllning, en kraftig kant med mörk kontur och en mässingsstjärna, och rikets namn står strax ovanför stjärnan i stället för mitt i den största kolonin. Det styrs av datan:

- `homeland` på gruppen i `empires/index.json`: `{ "name": { "sv": "Storbritannien", "en": "Great Britain" } }`, moderlandets namn.
- `homeland` på delen (polity) i rikesfilen: de Cliopatria-poster som är moderlandet, till exempel `["Kingdom of Great Britain"]`. En tom lista betyder att moderlandet tas ur rikets eget område (Japan, där Cliopatria inte skiljer på Japan och kolonierna).
- `homeland` på perioden: moderlandets gräns det året (GeoJSON, förenklad som riket). `label` står då i moderlandet. Perioder slås bara ihop om moderlandet också är nästan detsamma.

`tools/riken.py` räknar fram moderlandet ur tabellen `HOMELANDS` (namn och ett fönster, bbox eller polygon, runt moderlandet, eftersom moderlandets post i Cliopatria ibland också innehåller handelsstationer långt bort) och `homeland` i delens inställningar i `GROUPS`. Moderland finns för Brittiska imperiet, Spanska och Portugisiska imperiet (#70), franska och nederländska kolonialväldet, Tyska riket och Japanska imperiet. Perioder där Cliopatria saknar moderlandet (till exempel Nederländerna 1811–1814 och Portugal under den iberiska unionen) ritas som vanligt, utan stjärna.

**Omstridda gränser i nutid (#644, beslut 2026-11-03).** Där Cliopatria ritar en nutida gräns som strider mot Sveriges officiella hållning flyttar `tools/riken.py` området enligt tabellen `DISPUTED`: `area` är området som skillnaden mellan två Cliopatria-gränser (namn och år), `from` året då ändringen börjar, och `remove` och `add` grupperna som området tas bort ur eller läggs till. Perioder som börjar före `from` delas, och `areaKm2` räknas ur den nya gränsen. Området kan också vara `('ne', [id, …])`: områden ur `tools/ne-omstridda-omraden.geojson`, som `tools/ne_omstridda.py` tar ut ur Natural Earths omstridda områden (public domain) där Cliopatria saknar gränsen. Fallen hittills: Krim och Sevastopol (Ukraina 2013 minus Ukraina 2024 i Cliopatria) räknas till Ukraina och inte till Ryska federationen från 2014; Västbanken med Östra Jerusalem, Gaza och Golanhöjderna räknas inte till Israel från 1967; och Staten Palestina (Västbanken med Östra Jerusalem och Gaza) visas från Sveriges erkännande 2014. Palestina finns inte i Cliopatria efter 1948, så delen har Cliopatria-namnet `None` och hela gränsen kommer ur `DISPUTED`; gruppen får då `borderSource: "Natural Earth"`, som rutan Om kartan nämner i stället för Cliopatria. Israel och Palestina förenklas finare än andra länder (`OVERRIDES`, 0,03 grader) och avrundas till 0,01 grad (`DECIMALS`), eftersom Gaza bara är cirka 10 km bred. Noten "Gränsen är omstridd … Kartan följer Sveriges officiella hållning enligt UD (kontrollerad <datum>)" står i rikets `mapNote`, och UD-källan i `facts.sources`, så att den syns i Om kartan och under Riken i Om källorna. Fallen, källorna och Rikards beslut står i [omstridda-granser.md](omstridda-granser.md).

**Osäkra gränser (#73).** Ett rike vars gräns källan uttryckligen kallar osäker, vag eller flytande får fältet `uncertainBorder` på gruppen i `empires/index.json`. Det skrivs för hand, som `facts`, och `tools/riken.py` behåller det när filen skrivs om:

```json
"uncertainBorder": { "note": { "sv": "Kanten är mjuk eftersom …" }, "sources": ["wp-ghana-empire"], "review": "source-checked" }
```

- `note`: varför kanten är mjuk, med källan i texten. Den läggs till i rutan Om kartan.
- `sources` och `review`: källan som säger att gränsen var osäker. Den räknas under Riken i Om källorna.

Skriptet sätter då `"uncertainBorder": true` på varje del (polity) i rikets fil, och riket ritas med mjuk, utsuddad kant i stället för skarp linje. Markera bara när källan säger det om just det riket. Hittills har bara Ghanariket fältet (Wikipedia: de skriftliga källorna är vaga om rikets största utbredning, och riket kan ha varit ett förbund med olika band till kärnan). Cliopatrias artikel säger att gränser utan fördrag är ungefärliga och att datan inte anger osäkerhet, men det gäller alla riken och räcker inte för att markera ett visst.

**Kärnområde och inflytande (#75).** Cliopatria har relationsposter (`Type` = `RELATION`) med namn som `(Allegiance of Ayyubid Sultanate to Abbasid Caliphate)` och `(Vassalage of Kingdom of Georgia to Timurid Empire)`, där geometrin är båda rikenas områden tillsammans. `tools/riken.py` gör om dem till fältet `influence` på den del (polity) som det andra riket lydde under:

```json
"influence": [{ "start": 1202, "end": 1235, "relation": "allegiance", "name": { "sv": "Ayyubidernas sultanat", "en": "Ayyubid Sultanate" },
               "geometry": { "type": "MultiPolygon", … } }]
```

- Området är relationens område minus delens eget område samma år (ur Cliopatria, före förenklingen), förenklat som riket. Ytor under cirka 3 000 km² tas bort, och perioder som knappt ändras slås ihop.
- `relation`: `allegiance` (lojalitet) eller `vassalage` (vasall). Allianser och personalunioner räknas inte.
- `name`: lydrikets namn. Är lydriket ett eget rike på kartan används det namnet, annars `INFLUENCE_NAMES` i skriptet (engelska = Cliopatrias namn).
- Lydriken som själva är delar av samma grupp hoppas över, eftersom de redan ritas: Gyllene horden, Ilkhanatet och Chagatai-khanatet under Yuandynastin 1294–1374.
- Inflytandet ritas bara när delen själv syns det året.
- `index.json` sammanfattar det per grupp i `influence` (`polity`, `name`, `relation`, `from`, `to`), så att rutan Om kartan kan räkna upp det.

Relationer som källorna motsäger står i `INFLUENCE_SKIP` i skriptet, med motivering och källa, och visas inte. Hittills gäller det bara Seleukidriket under Romerska republiken 204–190 f.Kr.: enligt källorna (`wp-roman-seleucid-war`) krigade de 192–188 f.Kr. och slöt fred i Apameia 188 f.Kr. Det står i Romarrikets `mapNote`.

Inflytande finns för Östromerska riket (östgoterna 500–554), Bysantinska riket (Kyrkostaten 757–869), Sasanidriket (kidariterna 390–450), Karolingiska riket (Östfrankiska riket 911–921), Abbasidkalifatet (ziyadiderna, ayyubiderna, Rumsultanatet och Delhisultanatet), Timuridriket (jalayiriderna, Georgien och Qara Qoyunlu), Mingdynastin (Joseon 1395–1571) och Brittiska imperiet (Hawaii 1811–1819). Cliopatrias vasaller under Tysk-romerska riket (Böhmen, Brandenburg, Schweiz, Tyska orden) ligger redan inom rikets område och ger inget inflytande. Andra riken har inga sådana relationer i Cliopatria och ritas som förut.

```json
{ "start": 1919, "end": 1939, "areaKm2": 12702704, "label": [2.3, 47.0],
  "geometry": { "type": "MultiPolygon", … }, "homeland": { "type": "Polygon", … } }
```

`facts` (valfritt, #170) i `empires/index.json` är faktarutan om riket (gruppen). Formatet är detsamma som för religionernas `facts` (se nedan): `summary`, `items` (när och var det uppstod, hur det slutade, huvudstäder, kända härskare, största utbredning med år, språk och religion), `milestones` (nyckelår med `year`, `label`, `text` på en till tre meningar och egna `sources`; för riken även `title`, `events` och `mapNote`, se nedan), `sources` och `review`. Dessutom `mapNote`, som säger hur källornas årtal skiljer sig från kartdatans spann (`from`/`to` kommer från Cliopatria, #138). `origin` används inte för riken. Rutan visas när man följer riket i Fokus. Alla riken har en, också antikens tio riken från R2 (#68) och medeltidens elva från R3 (#69).

```json
"facts": { "summary": { "sv": "Osmanska riket hade sitt centrum i dagens Turkiet …" },
  "items": [{ "label": { "sv": "Huvudstäder" }, "text": { "sv": "Söğüt (från cirka 1299) … Konstantinopel/Istanbul (1453–1922)." } }],
  "milestones": [{ "year": 1453, "label": { "sv": "1453" }, "text": { "sv": "Mehmed II erövrar Konstantinopel …" }, "sources": ["wp-ottoman"] }],
  "mapNote": { "sv": "Källan anger cirka 1299 som start. …" }, "sources": ["wp-ottoman"], "review": "source-checked" }
```

Rikets nyckelår är också rikets berättelse (#171): när man följer riket i Fokus visas varje nyckelår som ett kort under uppspelningen, och uppspelningen pausar där. Därför har nyckelåren för riken tre fält till:

- `title`: kort rubrik på kortet och i rutan ("Freden i Karlowitz").
- `events` (valfritt): id för händelser i `events.json` som hör till nyckelåret, till exempel ett krig. De visas som knappar i kortet och berättas inte om i texten.
- `mapNote` (valfritt): hur kartan (Cliopatria) skiljer sig från källans årtal vid just det nyckelåret, till exempel att förändringen syns först några år senare.

`text` säger vad som hände och varför det påverkade utbredningen. Nyckelåren läggs helst där kartan visar en stor förändring av ytan. Osmanska riket, Mongolriket, Hanriket och Brittiska imperiet har 9–10 nyckelår var (#171), Rom 16 och Persiska riket, Makedoniska riket och Mauryariket 7–9 var (#180). Antikens riken (R2, #68) har 5–7 nyckelår var, och kolonialvälden och moderna imperier (R5, #71) 5–8.

```json
{ "year": 1699, "label": { "sv": "1699" }, "title": { "sv": "Freden i Karlowitz" },
  "text": { "sv": "Kriget som började vid Wien slutar med förlust. …" }, "sources": ["wp-ottoman", "wp-karlowitz"],
  "mapNote": { "sv": "Kartan visar bara en liten minskning 1687–1705, några procent." } }
```

`symbol` (valfritt, #301) i en grupp i `empires/index.json` är namnet på rikets symbol, en egen teckning i `img/icons/<symbol>.svg`, som för religionerna (#271). Symbolen ska vara ett emblem som rikets egen tid använde eller som forskningen förknippar med riket, och valet förklaras med källa i faktarutan: en rad `items` med rubriken "Symbolen på kartan", och källan i `facts.sources`. Symbolen står i en mässingsmedalj på rikets `label`-punkt det år man tittar på (ett rike i gruppen i taget, så att till exempel Mongolrikets fyra khanat får var sin), som klickbar 3D-markör ovanpå klotet (`js/layers/empiremarks.js`) och på lagerbilden. Utzoomat på globen syns bara medaljen; vid nära zoom och i Platt vy står rikets namn under den. Pekar man på medaljen visas namnet, och klick öppnar rikets faktaruta. Symbolen står också bredvid färgen i Fokus → Riken och i faktarutans rubrik. Riken utan symbol visas som förut, med namnet på `label`-punkten. `scripts/validate-site.py` kontrollerar att filen finns. Valen: Rom `aquila` (legionsörnen), Akemenidiska riket `eagle-standard` (kungens fältstandar, en gyllene örn med utbredda vingar), Makedoniska riket `vergina-sun` (Verginasolen), Mauryariket `lion-capital` (Ashokas lejonkapitäl, utan hjulet), Mongolriket `sulde` (tug, stången med hästtagel), Osmanska riket `tughra` (sultanens namnteckning), Brittiska imperiet `imperial-crown` (den heraldiska kronan) och Bysantinska riket `double-eagle` (dubbelörnen, i `polityFacts`). Hanriket har ingen symbol, eftersom källorna inte nämner något statsemblem. Rikena från R2–R5 (#345): Egypten `pschent` (dubbla kronan, utan kobran och gamen), Kartago `palm` (dadelpalmen på mynten), Seleukidriket `anchor`, Partherriket `archer` (bågskytten på mynten), Sasanidriket `derafsh` (Derafsh Kaviani), Guptariket `garuda` (rikets sigill), Umayyadkalifatet `white-banner` och Abbasidkalifatet `black-banner` (dynastins färg, utan text), Tysk-romerska riket och Tyska riket `heraldic-eagle` (riksörnen med ett huvud), Kievriket `tryzub`, Timuridriket `three-rings`, Aztekriket `eagle-cactus` (Tenochtitlans tecken), Inkariket `mascapaicha`, Mogulriket och Safavidriket `lion-sun`, Qingdynastin `dragon-flag` (från 1862), Spanska imperiet `pillars` (Herkules stoder), Portugisiska imperiet `armillary`, Ryska imperiet, Habsburgska riket och Österrike-Ungern `double-eagle`, Svenska stormaktsväldet `three-crowns`, Tokugawa-Japan `aoi`, Franska kolonialväldet `tricolour` (från 1830), Nederländska kolonialväldet `arrow-bundle` (pilknippet ur vapnet), Japanska imperiet `chrysanthemum`, Etiopiska kejsardömet `judah-lion` (utan korsstaven) och Sovjetunionen `hammer-sickle`. Ingen symbol, eftersom källorna inte visar något statsemblem eller bara religiösa tecken: Assyrien (lamassu är en skyddsgud), Nybabyloniska riket (lejonen och drakarna på Ishtarporten är gudarnas tecken), Frankerriket (monogrammet var Karl den stores eget), Qin, Tang, Song, Ming, Aksum, Ghana, Mali, Songhai och Khmerriket. De försvunna länderna från R6 (#353): Preussen `heraldic-eagle` (den preussiska örnen), Jugoslavien `torches` (socialistiska Jugoslaviens sex facklor) med kungariket 1918–1941 som `double-eagle` i `polityFacts` (bara symbol, ingen egen ruta), Tjeckoslovakien `bohemian-lion` (det böhmiska lejonet med dubbel svans), Storcolombia `cornucopia-fasces` (vapnet från 1821: ymnighetshorn kring ett knippe spjut och pilar), Republiken Texas `lone-star` och Kungariket Hawaii `puloulou` (kapu-staven ur vapnet). Ingen symbol, eftersom källorna inte anger något vapen: Kalmarunionen och Neutrala Moresnet. Amerikas konfedererade stater (Rikards beslut 2026-11-05) `battle-flag`: stridsflaggan, den mest kända symbolen. Den var aldrig nationsflagga och har efter kriget använts mitt i politiska, kulturella och rasmässiga kontroverser; faktarutan säger båda delarna öppet. Har ett välde ett moderland (`homeland`, #74) står medaljen där i stället för mässingsstjärnan.

`capitals` (valfritt, #474) i en grupp är rikets huvudstäder med årsspann. De visas som en liten fyrkant i pergament med stadens namn när man följer riket i Fokus, för de år de gällde:

```json
"capitals": [{ "name": { "sv": "Bursa", "en": "Bursa" }, "wikidata": "Q40738", "at": [29.081, 40.191], "from": 1335, "to": 1365,
  "note": { "sv": "Källorna skiljer sig: …" }, "sources": ["wp-ottoman", "wikidata"], "review": "source-checked" }]
```

- `from`/`to` (astronomiska år) saknas när huvudstaden gällde hela rikets tid; då gäller gruppens `from`/`to`. Vid ett byte får båda städerna stå samma år.
- `polity` (valfritt) begränsar huvudstaden till en del av riket, till exempel Yuandynastins Dadu i Mongolriket. Den visas bara när den delen syns.
- `at` och `wikidata` kommer från Wikidata (CC0): stadens Q-id och koordinater. Årtalen kommer från rikets faktaruta (källan står först i `sources`). `two-sources` när Wikidatas huvudstad (P36) för riket är samma stad och ingen not finns; annars `source-checked`. Riken utan faktarutetext om huvudstaden har bara Wikidata som källa.
- `note` säger öppet var källorna skiljer sig, till exempel om årtalen bara kommer från Wikidata.
- Ingen markering där källorna säger att huvudstaden är omstridd eller saknas: Maliriket (platsen omtvistad), Kalmarunionen (ingen enligt lag), Tysk-romerska riket (ingen fast huvudstad), Ghanariket (troligen Koumbi Saleh) och Israel (Jerusalems ställning är omstridd, se beslutet om omstridda gränser i #556). Andra omgången (2026-11-06) gav 15 riken till huvudstäder, bland annat Hanriket, Songdynastin, Safavidriket, Timuridriket, Pakistan och Bolivia. Årtalen kommer där ur Wikipedia-artikelns faktaruta (infobox), som också står i rikets `facts.sources`. Ingen markering heller där källorna nämner flera huvudstäder samtidigt utan årtal eller där staden saknar koordinater: Persiska riket (fem kungliga residens), Partherriket (sju), staten Qin före Qindynastin (åtta), Frankerriket (Klodvigs söner hade var sin huvudstad), Shakas kwaBulawayo i Zuluriket och Aksums sista huvudstad Kubar (platsen är okänd). Neutrala Moresnet visas som en punkt utan gräns och får därför ingen huvudstad.
- `tools/riken.py` behåller fältet när filen skrivs om, och `scripts/validate-site.py` kontrollerar att källorna finns.

`polityFacts` (valfritt, #301) i en grupp är egna faktarutor och symboler för enskilda riken i gruppen, med rikets id (polity) som nyckel: `{ "<polity-id>": { "symbol": "…", "facts": { … } } }`. `facts` har samma format som gruppens. När kartan visar det riket står dess egen symbol i medaljen, och klick öppnar dess egen faktaruta, med kartdata och ytkurva för just det riket. I dag har bara Bysantinska riket (`bysantinska-riket` i gruppen `romarriket`) en egen ruta; åren 395–632 heter riket Östromerska riket i kartdatan och visas med Roms symbol och ruta.

```json
"symbol": "aquila",
"polityFacts": { "bysantinska-riket": { "symbol": "double-eagle",
  "facts": { "summary": { "sv": "…" }, "items": [ … ], "sources": ["wp-byzantine-empire", "whe-byzantine-empire"], "review": "two-sources" } } }
```

## `routes/`: vägar och resor (#38)

Lagertypen linje (beslut 2). `routes/index.json` listar filerna:

```json
{ "schema": "historia-globen/routes@1", "notes": "…", "files": ["data/routes/zheng-he.json", "data/routes/columbus.json"] }
```

En post i `files` är en sökväg från repots rot eller ett filnamn i `data/routes/`. Varje fil har `{ "routes": [ … ] }`:

```json
{ "id": "zheng-he-resa-1", "kind": "voyage", "category": "upptackter",
  "title": { "sv": "Zheng Hes första resa" }, "summary": { "sv": "…" },
  "start": 1405, "end": 1407, "edtf": "1405/1407", "precision": 9,
  "event": "zheng-he", "sources": ["…"], "review": "source-checked",
  "note": { "title": { "sv": "Källorna skiljer sig" }, "text": { "sv": "…" } },
  "legs": [{ "from": 1405.7, "to": 1405.95, "edtf": "1405-09/1405-12", "uncertain": true,
    "path": [[118.8, 32.1], [119.3, 26.1], [108.2, 16.1]],
    "places": [{ "at": [108.2, 16.1], "name": { "sv": "Champa" }, "date": "1405-12", "edtf": "1405-12" }],
    "sources": ["…"] }] }
```

| Fält | Betydelse |
|---|---|
| `id` | Läsbart och unikt |
| `kind` | `voyage` (resa, ritas fram över tiden) eller `trade` (handelsväg, syns som en dämpad linje medan den användes) |
| `category` | `upptackter` eller `ekonomi`; linjen får kategorins färg och följer kategorifiltret |
| `title`, `summary` | Text per språk, som för händelser |
| `start`, `end`, `edtf`, `precision` | Hela vägens tid, som för händelser (astronomiska år) |
| `event` (valfritt) | Id för en händelse i `events.json`; klickrutan får "Läs mer" dit |
| `sources`, `review` | Som för händelser. Bara `source-checked` och `two-sources` visas |
| `note` (valfritt) | En extra ruta i klickrutan (`title`, `text`), till exempel "Källorna skiljer sig", samma format som på händelser |
| `legs` | Etapperna. `from` och `to` är år och får ha decimaler för delar av år (1405,7 ≈ september 1405). `path` är vägen i `[longitud, latitud]` (WGS 84); långa sträckor ritas som storcirklar. `edtf` (valfritt) är etappens tid som text i klickrutan. `uncertain: true` ritas streckat. `places` (valfritt) är platser längs etappen med `at`, `name` och valfria `date` och `edtf` (text, till exempel `"1431-01-19"`, inte ett tal). `stop: true` väljer en sådan redan källbelagd plats som paus i Fokus; pausrutan bygger sin text av platsens namn och datum. `dateLabel` kan ange en källbelagd precisering av ett grovt datum, till exempel `"1407, på hemresan"`; `text` används bara när platsnamnet och datumet annars skulle säga fel sak. `sources` är etappens källor |

Etapper får överlappa i tid (till exempel när en flotta delas); varje pågående etapp får då ett skepp. `scripts/validate-site.py` kontrollerar att filerna i `files` finns och går att läsa, att vägarnas och etappernas källor finns i `sources.json` och att `event` finns i `events.json`.

## `upptackt.json`: upptäcktsvyn (#101)

Upptäcktsvyn slås på i Lager. Filen styr allt den visar (ritas av `js/layers/discovery.js`):

```json
{ "schema": "historia-globen/upptackt@1", "notes": "…",
  "perspective": { "sv": "Vyn ser världen från Europa. Dimman är lyft över de europeiska rikena i datan …" },
  "credit": { "sv": "Kartbilder: havsmonster ur Olaus Magnus Carta marina (1539) …" },
  "paper": { "grain": 0.22, "stains": 18, "stainStrength": 0.16, "seed": 1539,
    "waterLines": { "count": 3, "widthDeg": 1.3, "opacity": 0.14 }, "coastPx": 2.4,
    "vignette": 0.45, "vignetteSides": 0.5,
    "rhumb": { "directions": 32, "lengthDeg": 70, "opacity": 0.42, "widthPx": 1.6 } },
  "home": { "empires": ["romarriket", "alexanders-rike", "…"], "neighborDeg": 3.5 },
  "fog": { "opacity": 0.97, "corridorDeg": 7, "soften": 0.7, "grain": 0.2,
    "hatch": 0.45, "hatchDeg": 1.2, "hatchSpacingDeg": 0.6,
    "labels": [{ "text": { "sv": "Terra incognita" }, "at": [-100, 47], "size": 4.2 }] },
  "decorations": [{ "id": "sjoorm-stilla-havet", "file": "images/karta/sjoorm.webp", "at": [-152, 32],
    "width": 26, "fade": true, "title": { "sv": "Sjöorm" }, "source": "commons-karta-carta-marina-sjoorm" }] }
```

| Fält | Betydelse |
|---|---|
| `perspective` | Raden i teckenförklaringen: vad dimman och ordet "upptäckt" betyder här. Text per språk |
| `credit` | Krediten för kartbilderna i teckenförklaringen. Länkar till filsidorna läggs till ur `source` |
| `paper` | Den åldrade papperskartan som täcker grundkartan medan vyn är på (grundkartan själv ändras inte). Den ritas en gång. Färgerna är CSS-variablerna `--discovery-sea` (haven), `--discovery-land` (landet), `--discovery-ink` (bläcket), `--discovery-stain` (fläckarna) och `--discovery-edge` (kanterna) |
| `paper.grain` | Papperskornens styrka, 0–1 |
| `paper.stains`, `paper.stainStrength` | Antal fläckar i pappret och hur starka de är (0–1) |
| `paper.seed` | Fröet som bestämmer var korn och fläckar hamnar, så att kartan ser likadan ut varje gång |
| `paper.waterLines` | Vattenlinjer längs kusten: `count` band, `widthDeg` = det bredaste bandets bredd i grader och `opacity` |
| `paper.coastPx` | Bläckkustens bredd i bildpunkter på lagerbilden (4096 × 2048) |
| `paper.vignette`, `paper.vignetteSides` | Mörkare kanter mot polerna (0–1), och hur stor del av det som gäller mot datumlinjen |
| `paper.rhumb` | Portolanlinjer ut från varje dekoration med `rhumb: true`, ovanpå dimman: `directions` = antal riktningar (avrundas till en multipel av 8; huvudvindar i bläck, halvvindar i grönt `--discovery-rhumb-half`, kvartsvindar i rött `--discovery-rhumb-quarter`), `lengthDeg` = längd i grader, `opacity` och `widthPx` |
| `home.empires` | Vyns utgångspunkt i Europa: grupp-id i `data/empires/index.json` för de europeiska rikena. Dimman är lyft över dem för varje period som har börjat |
| `home.neighborDeg` | Hur nära, i grader, ett annat rikes område ska ha legat ett hemrikes område under samma år för att räknas som granne. Då lyfts dimman över grannen från det året (grannarnas grannar räknas inte) |
| `fog.opacity` | Dimmans täckning, 0–1. Nära 1 döljer allt som inte har nåtts; händelsernas markörer syns ändå, eftersom de ligger ovanpå klotet. Färgerna är CSS-variablerna `--discovery-fog` och `--discovery-ink` |
| `fog.corridorDeg` | Bredden i grader på korridoren som lyfts längs varje etapp i `data/routes` som har börjat |
| `fog.soften` | Hur mycket bredare korridorens mjuka kant är (0,7 = 70 % bredare) |
| `fog.grain` | Papperskornen i dimman, 0–1 |
| `fog.hatch`, `fog.hatchDeg`, `fog.hatchSpacingDeg` | Bläckskraffering längs dimmans kant: styrka (0 = ingen), bandets bredd i grader och avståndet mellan strecken i grader |
| `fog.labels` | Texter i dimman: `text`, `at` = `[longitud, latitud]` för mitten och `size` = höjd i grader |
| `decorations` | Bilder ur gamla kartor: `file`, `at` = `[longitud, latitud]` för bildens mitt (mitt i öppna hav), `width` = bredd i grader, `fade` = tonas bort när en lyft korridor kommer nära, `rhumb` = portolanlinjer ut från bildens mitt (kompassrosor), `title` och `source` (id i `sources.json`, filsidan på Wikimedia Commons) |

## `religions.json`: religioner

```json
{ "schema": "historia-globen/religions@3",
  "religions": [{ "id": "kristendom", "name": { "sv": "Kristendom" }, "color": "#6f3fb8", "symbol": "cross",
    "snapshots": [{ "start": 200, "end": 249, "sure": true, "polities": ["Kingdom of Osroene"], "geometry": { … } },
      { "start": 1450, "end": 1499, "sure": false, "inherited": { "until": 1449, "from": ["Kingdom of Sweden"] },
        "polities": ["(Kalmar Union)", "Kalmar Union"], "geometry": { … } }] }],
  "polities": [{ "name": "(Anglo-Saxon England)", "wikipedia": "…", "text": "Christianity (from 6th century)",
    "religion": "kristendom", "rule": "enda", "since": 501 }] }
```

- Filen byggs med `python3 tools/religioner.py <cliopatria.geojson>` (#269). Skriptet läser registret `polities` i den befintliga filen, räknar fram ögonblicksbilderna och skriver filen igen. `facts`, `symbol`, religionernas namn och färger och texterna i registret ändras inte. Därefter byggs `religions-polities.json` med `tools/religioner_riken.py`.
- `symbol` (valfritt, #271) är namnet på religionens symbol, en egen teckning i `img/icons/<symbol>.svg`. Den står bredvid färgen i undermenyn i Lager, i Fokus, i teckenförklaringen, i klickrutan och i faktarutans rubrik, mitt i varje sammanhängande område som är stort nog, och i medaljen där religionen uppstod (`facts.origin`). Religioner utan vedertagen symbol (manikeism, traditionell afrikansk religion och annan traditionell religion) har ingen; de visas bara med färgen. `scripts/validate-site.py` kontrollerar att filen finns. Valen: kristendom `cross` (kors), islam `mosque` (moské med minaret, ingen halvmåne), judendom `star-of-david`, zoroastrism `fire-altar` (eldaltare), buddhism `dharma-wheel` (dharmahjul), hinduism `om`, jainism `jain-hand` (handen med hjulet), sikhism `khanda`, kinesisk religion `yin-yang`, shinto `torii`, tengrism `shanyrak` (jurtans takkrona), fornegyptisk `ankh`, mesopotamisk `eight-star` (åttauddig stjärna), grekisk och romersk `temple` (tempel), fenicisk och punisk `tanit` (Tanits tecken), germansk och nordisk `world-tree` (världsträdet), slavisk `hexafoil` (sexbladig rosett, åsktecken), mesoamerikansk `temple-pyramid` (tempelpyramid) och andinsk `chakana` (andinskt trappkors).
- `snapshots` är religionens utbredning som statsreligion eller huvudreligion, sammanslagen per tidsperiod. Ögonblicksbilder som är likadana i följd är sammanslagna. `sure: false` betyder att flera religioner nämns och att den först nämnda valts. Den visas ljusare med streckad kant.
- `inherited` (#269) betyder ett ärvt område: rikena på platsen (`polities`) anger ingen religion som gäller det året, så området visas med religionen det hade tidigare. `until` är sista året religionen stod i en faktaruta där (slutet av den ögonblicksbilden) och `from` de riken som angav den. Arvet gäller alla religioner och varar tills ett rike med en annan angiven religion täcker platsen. Det kräver att ett rike i Cliopatria täcker platsen; utan rike glöms religionen efter 100 år. Ärvda områden har `sure: false`, ritas ljusast med prickad kant och förenklas lite mer (0,3 grader, ytor under 0,3 kvadratgrader borttagna).
- `polities` listar varje rike i Cliopatria med faktarutans text (hämtad 2026-10-28), vald religion och regeln som användes (`officiell`, `majoritet`, `enda`, `först nämnd`, `okänd` eller `saknas`). Det är registret som skriptet bygger från.
  - `since` är ett årtal ur faktarutan för den valda religionen ("c. 200 AD", "from 6th century", #118), och religionen visas först därifrån.
  - `christianSince` och `source` är ett kontrollerat år för när riket blev kristet, med källa i `sources.json` (från den första versionen av lagret, 36 riken). Riket visas som kristet från det året. Källan listas under Religioner i Om källorna.
  - `modern` (`country`, `religion`, `majority`) är den största religionen i Wikipedias tabell Religion by country för länder vars faktaruta saknar religion. Den används från 1900 och räknas som säker över 50 procent.
  - `variants` finns för de få riken vars perioder i Cliopatria pekar på olika Wikipedia-sidor: faktarutans text (och `modern`) per sida, nyckel = sidans namn i Cliopatria.
  - Procentsiffror i faktarutan kommer ofta från en nutida folkräkning och används bara från 1900, utom när religionen anges som officiell utan årtal (till exempel Ryska imperiet).
- `facts` (valfritt, #90) är faktarutan om religionen. Den visas på begäran (#308): med knappen "Läs om religionerna" i Lager-menyns undermeny och i teckenförklaringen, med knappen Fakta i undermenyn, med knappen "Läs mer om <religion>" i klickrutan för ett religionsområde (#270) och när man börjar följa religionen i Fokus. Kristendom, islam, buddhism, hinduism, judendom och sikhism har en (#90, #270); övriga religioner saknar ännu faktaruta och får då ingen Läs mer-knapp.

```json
"facts": { "origin": "korsfastelsen",
  "summary": { "sv": "Kristendomen är en monoteistisk religion …" },
  "items": [{ "label": { "sv": "När och var" }, "text": { "sv": "Under första århundradet e.Kr. …" } }],
  "milestones": [{ "year": 301, "label": { "sv": "301 eller 314" }, "text": { "sv": "Armenien blir först …" }, "sources": ["wp-christianization-armenia"] }],
  "sources": ["wp-christianity", "wp-crucifixion"], "review": "source-checked" }
```

  - `origin` är id för händelsen i `events.json` där religionen uppstod (kristendom `korsfastelsen`, islam `muhammeds-forsta-uppenbarelse`, buddhism `buddha`, sikhism `guru-nanak`). Religioner som växte fram gradvis (judendom, hinduism) har ingen `origin`. Där står religionens symbol i en mässingsmedalj (#271, tidigare en stjärna): en klickbar markör ovanpå klotet som öppnar religionens faktaruta, och samma medalj på lagerbilden (Platt vy). Den syns från händelsens startår och står kvar så länge religionen syns i lagret. Platsen står bara i händelsen, inte en gång till här.
  - `items` är rader med rubrik och text (till exempel när och var, grundare, helig skrift, antal troende med årtal). Osäkerhet skrivs ut i texten.
  - `milestonesTitle` (valfritt, #270) är rubriken över nyckelåren. Utan den heter rubriken "Statsreligion i riken"; religioner vars nyckelår handlar om annat (till exempel heliga skrifter eller tempel) har "Nyckelår" (islam, buddhism, hinduism, judendom och sikhism).
  - `milestones` är nyckelår, till exempel när ett rike gjorde religionen till statsreligion. `year` är astronomiskt år och knappen hoppar dit i tiden; `label` är det som står på knappen och kan visa osäkerhet ("301 eller 314"). Varje nyckelår har egna `sources`.
  - `sources` och `review` fungerar som för händelser. Rutan listar både rutans och nyckelårens källor.

## `religions-polities.json`: rikenas gränser i religionslagret (#194)

```json
{ "schema": "historia-globen/religions-polities@1", "sources": ["cliopatria"],
  "polities": { "Ottoman Empire": [{ "start": 1492, "end": 1501, "geometry": { "type": "MultiPolygon", "coordinates": [ … ] } }] } }
```

- Gränsen för varje enskilt rike som ingår i en ögonblicksbild i `religions.json`, så att klickrutan kan säga vilket rike som låg på platsen. Nyckeln är rikets namn i Cliopatria, samma som i `snapshots[].polities` och `polities[].name` i `religions.json`. Religionen står bara i `religions.json`.
- Varje period är en period i Cliopatria (astronomiska år). Bara perioder som gällde det år någon ögonblicksbild med riket börjar finns med, det vill säga samma urval som de sammanslagna områdena byggdes av. I ärvda områden är det rikena utan religion. Perioder av samma rike där gränsen ändras mindre än 5 procent av ytan är sammanslagna och har den första periodens gräns (#269).
- Geometrin är förenklad som i `religions.json` (0,25 grader, avrundad till 0,1 grad, öar under 0,05 kvadratgrader borttagna). Filen är cirka 2,0 MB och laddas först vid det första klicket på ett religionsområde, inte vid start.
- Byggs med `python3 tools/religioner_riken.py <cliopatria.geojson>` efter att `religions.json` är byggd.

## `styles.json`: bildstilar

Tio grundstilar efter tid (`regions` tom) och regionala varianter (`regions` med rutor i grader). Varje stil har `from`, `to`, `frame` (faktarutans ram) och `prompt` (engelsk stilbeskrivning). `variants` väljs efter händelsens kategori, till exempel portolankarta för resor under renässansen. Se `notes` i filen.

## `genererat/`: uppdelade filer (#337)

Sidan laddar inte `events.json` och `empires/index.json` direkt, utan mindre filer som `tools/dela_data.py` skriver till `data/genererat/`. Det man redigerar är `data/handelser/` (#394) och `empires/index.json`. **Kör `python3 tools/dela_data.py` efter varje ändring i `data/handelser/` eller `empires/index.json`** och checka in `data/events.json` och filerna i `data/genererat/` i samma commit. `scripts/validate-site.py` (och `python3 tools/dela_data.py --check`) säger till om någon fil inte stämmer med källan, saknas eller inte längre genereras. Filerna redigeras aldrig för hand.

| Fil | Innehåll | Laddas |
|---|---|---|
| `handelser.json` | `periods` (periodernas id, första år `from` och fil), `translations` (språkfilerna, #675) och `events`: alla händelser utan de långa fälten. `note` står kvar med bara sin rubrik (`note.title`), eftersom markören visar osäkerhet när rubriken är "Källorna skiljer sig" | vid start |
| `handelser-<period>.json` | `events`: { händelse-id: de långa fälten } för händelserna som **börjar** i perioden. De långa fälten är `summary`, `note`, `story`, `image`, `sources`, `wikidata` och valfria `evidence` (listan `DETAIL` i skriptet och `detail` i `handelser.json`) | när händelserna syns, en faktaruta öppnas eller man följer ett krig |
| `riken.json` | `groups` som i `empires/index.json`, utan `facts`. Grupper med faktaruta har `hasFacts: true`. `polityFacts` (#301) står kvar, eftersom den är liten och kartans symboler behöver den | vid start |
| `riken-fakta.json` | `facts`: { grupp-id: rikets `facts` } | vid första faktarutan om ett rike eller när man följer ett rike |
| `<fil>.<språk>.json` | texterna på ett annat språk än svenska för filen ovan (#675), se [Texter per språk](#texter-per-språk-675) | tillsammans med grundfilen, bara på det språket och engelska |

Perioderna efter startår: `fkr` (år 0 och tidigare), `1-1499`, `1500-1799`, `1800-1899`, `1900-1945`, `1946-1979` och `1980-`. Gränserna är valda så att filerna blir ungefär lika stora (40–120 kB) och ändras bara medvetet, eftersom filnamnen följer dem. En händelse hör till den sista perioden vars `from` är högst händelsens `start` (`period_of` i skriptet, `periodOf` i `js/model.js`). Ett krig och dess slag ligger oftast i samma period, men det spelar ingen roll: `loadEventDetails()` laddar alla perioder som händelserna behöver.

Varje post skrivs på en egen rad, så att en ändring i källan syns som ändrade rader i git. `events.json` (byggd ur `data/handelser/`) publiceras ändå, eftersom formuläret för förslag (`functions/api/feedback.js`) slår upp händelser i den.

### Gränssnittets texter: `ui/` (#63)

Gränssnittets texter, skilda från datans texter (beslut 2026-11-05, docs/beslut/2026-11-05-sprak-63.md).

- `ui/sprak.json`: språken i språkväljaren, i ordning. Varje språk har `id` (`sv`, `en` …), `name` (som språket skriver sitt namn), `auto` (väljs efter webbläsarens språk; bara färdiga språk), `complete` (hela gränssnittet är översatt, också de texter som modulerna i `js/` fortfarande har på svenska, #670–#673), valfritt `beta` (ordet efter namnet när språket inte är färdigt), och för översatta språk `translatedBy`, `translatedAt`, `reviewedBy` och `review` (`unreviewed` eller `reviewed`, AI-korsgranskning).
- `ui/<språk>.json`: ett platt objekt med nyckel och text. Nycklarna i `index.html` (`data-i18n="help.title"`) och de som JavaScript hämtar med `ui('time.bce')`. `{namn}` i en text byts mot ett värde (`"time.since": "sedan {start}"`). En text kan vara en lista (månaderna). Fältet `_om` är en kommentar.
- Språk i dag: `sv` (grundspråk), `en`, `fr`, `de` och `es`. De fyra senare är "beta" och ogranskade.
- `ui/sv.json` har svenskan för de nycklar som JavaScript hämtar. Sidans fasta texter står på svenska i `index.html` och finns bara i de andra språkens filer.
- Kategoriernas namn på andra språk: `cat.<id>` och `cat.<id>.count` (ental och flertal); svenskan står i `CATEGORIES` i `js/model.js`.
- Saknas en nyckel visas engelska, sedan svenska, som för datans texter.
- Från 2026-11-06 läggs en ny nyckel i alla fem språkfilerna i samma pull request, och nytt innehåll översätts när det skapas (docs/beslut/2026-11-06-oversatt-samtidigt.md). `tests/i18n.test.mjs` kräver att varje språk har varje nyckel i `sv.json` och `index.html`, också ett språk som är beta, och samma `{platshållare}` (#669).

### Texter per språk (#675)

Texter lagras per språk i samma post, `{ "sv": "…", "en": "…", "de": "…", "es": "…", "fr": "…" }`, så att en uppgift och dess översättningar redigeras och källkontrolleras på ett ställe. Svenska är grundspråket och finns alltid. Nytt innehåll översätts i samma pull request som det skapas (beslut 2026-11-06, docs/beslut/2026-11-06-oversatt-samtidigt.md).

**Språkfiler i `genererat/`.** För att en besökare inte ska ladda alla språk skriver `tools/dela_data.py` grundfilerna med bara svenskan och varje annat språk i en egen fil ovanpå: `handelser.<språk>.json`, `handelser-<period>.<språk>.json`, `riken.<språk>.json` och `riken-fakta.<språk>.json`. En språkfil har samma nyckel som grundfilen (`events`, `groups`, `facts`) men som { id: bara språkets texter }, och en lista skrivs som ett objekt med platsen i listan som nyckel (`{ "items": { "6": { "label": { "en": "…" } } } }`). Filen skrivs bara när språket har minst en text där, och `translations` i `handelser.json` listar dem (`{ "en": ["handelser", "riken-fakta"] }`).

- En text är ett objekt där alla nycklar är språk i `ui/sprak.json` och där svenskan finns. Andra objekt delas inte.
- **Rikenas namn** (`name` i `riken.json`) står kvar på alla språk i grundfilen, eftersom de engelska namnen är Cliopatrias namn och sidan använder dem som nyckel (religionernas teckenförklaring).
- Sidan (`js/model.js`) laddar på svenska inga språkfiler. På ett annat språk laddas det språkets filer och engelskans (reservspråket i `t()`), samtidigt som grundfilen, och `mergeTexts()` lägger texterna på posterna. Kan en språkfil inte laddas visas svenskan.
- Övriga filer som sidan laddar direkt (fun facts, religioner, vägar, turer, introduktionen, upptäcktsvyn, vyer) har alla språk i samma fil; de är små.

**Spärren och inaktuella översättningar: `oversattning.json`.** `tools/oversattning.py` läser alla datafiler med innehåll (utom poster med `review: "draft"`) och räknar per fil och språk hur många texter som saknar översättning. Filen har tre fält, och skrivs bara av skriptet:

- `languages`: språken som baslinjen gäller. Ett nytt språk i `ui/sprak.json` börjar med det som finns.
- `baseline`: { fil: { språk: antal oöversatta } }. Antalet får aldrig öka; en text utan översättning stoppar pull requesten.
- `register`: { språk: ["svenska:översättning", …] }, korta kontrollsummor (SHA-1, åtta tecken) av den svenska texten och översättningen. Ändras svenskan men inte översättningen hittas översättningen i registret med en annan svensk text, och då är den **inaktuell** och stoppar pull requesten tills den är uppdaterad.

Kör `python3 tools/oversattning.py` efter varje ändring i innehållet och checka in `data/oversattning.json`. `--check` kontrollerar utan att skriva (GitHub Actions kör det), och `--lista` visar varje oöversatt text. Undantagen `--tillat-okning` och `--godta-inaktuella` används bara med Rikards ok. Filen publiceras inte.

## `land.json` och `borders.json`: kartor

Färdigprojicerade SVG-banor i 4096 × 2048 (`path`, `width`, `height`) från Natural Earth: grundkartan (1:50m) och dagens landsgränser. Grundkartan laddas vid start; dagens gränser först när lagret slås på (#337).

## `bildlager.json`: tidsstyrda rasterbilder (#54)

`layers` är en lista av ekvirektangulära bilder. Varje post har `id`, översatt `name` och `title`, `file`, `from`, valfritt `to`, `opacity`, `source` (id i `sources.json`) och `license`. Bilden väljs när året ligger inom perioden och ritas på lagerbilden; den syns därför lika på klotet och i Platt vy. Första posten är NASA Black Marble 2016, från 2016 och framåt.

## `turer/`: guidade turer (#47)

En guidad tur är data, inte kod (Rikards beslut 2026-11-01, docs/beslut/2026-11-01-turformat-47.md). `turer/index.json` (`schema: historia-globen/turer@1`) listar turernas id i menyns ordning (`tours`) och knapparnas texter (`labels`). Varje tur ligger i `turer/<id>.json` (`schema: historia-globen/tur@1`, `schemas/tour.schema.json`):

- `version` (1), `id` (samma som filnamnet), `title` och valfri `summary` per språk, `review` (`draft` visas aldrig).
- `steps`: stegen i ordning. Varje steg har `id`, `at` (år med astronomisk årsräkning; decimaltal är tillåtet för delar av år, men utanför fokusläget för korta krig visar tidslinjen hela år), `camera` (`lat`, `lon`, `zoom` som globen, 0.8–3.2; Platt vy använder samma mitt), valfri `title`, `text` per språk, `layers` (lagren som är på i steget, id i lagerregistret; de andra lagren som vyerna styr slås av), valfri `open` (en befintlig händelse vars faktaruta öppnas) och `sources` (id i `sources.json`).
- **Källpolicyn gäller varje steg:** texten får bara säga det som stegets källor stöder, och siffror och årtal ska stämma med händelserna. Den första turen (`tre-platser-1325`) säger bara det som redan står i de tre händelserna och deras källor; osäkerhet (`1325~` för Tenochtitlan) skrivs ut ("omkring 1325").
- **Andra världskriget (`andra-varldskriget`, #13):** 14 steg med Europa, Nordafrika och Stilla havet om vartannat, från anfallet på Polen till Japans kapitulation. Varje steg öppnar en befintlig händelse i kriget och har dess källor, och texten säger bara det som står i händelsen. Där källorna skiljer sig om datum (Stalingrad, El Alamein, D-dagen, Tysklands kapitulation; se händelsernas `note`) nämner steget bara det datum som källorna är överens om.
- **Första världskriget (`forsta-varldskriget`, #48):** 14 steg på fyra kontinenter, från skotten i Sarajevo till vapenstilleståndet vid Compiègne. Steget om krigsutbrottet öppnar kriget självt och bygger på krigets `story`. Där källorna skiljer sig om första eller sista dagen (Tannenberg, Marne, Gallipoli, Somme) nämner steget bara det som källorna är överens om.
- **Berättelseläget (#247, Rikards val A 2026-11-05):** en tur kan ha `war` (krigets händelse-id), och då får krigets första kort knappen "Följ berättelsen". Ett steg kan ha `chapter` (kapitlets namn per språk, visas ovanför rubriken) och `question` (en fråga att fundera på, per språk). Kapitelnamnen beskriver bara vad stegen handlar om. Frågan påstår inget som stegets källor inte säger, och siffror eller datum i den ska stå i stegets eller händelsens källor. Första och andra världskriget har kapitel och frågor.
- **Rikens fall (#499, pilot):** en tur kan ha `empire` (grupp-id i `data/empires/index.json`), och då får rikets faktaruta knappen "Följ fallet". Ett steg kan ha `status` med samma ord som slutkortet (#500): `belagt` ("Det här vet vi från källorna"), `omtvistat` ("Här är forskare inte överens") eller `okant` ("Det här vet vi inte säkert"). Piloten har tre turer: Västromerska riket (`vastroms-fall`), Hanriket (`hanrikets-fall`) och Songhairiket (`songhairikets-fall`). Mayastäderna sparas till uppföljningen #531. Inga röster eller citat hittas på. Där källan bara berättar om eliten säger steget det (Hanriket: ämbetsmännen i Luoyang), och där källan saknar en uppgift får turen ingen rad om den (Hanriket har ingen rad om att forskare är oense, eftersom källan inte säger något sådant). Där källorna anger olika siffror säger steget det öppet (Songhai: arméernas storlek).
- **Jämförelser mellan steg** ("samtidigt", "en vecka senare", "medan … pågår") behöver källor för båda leden (källpolicyn punkt 5): steget får då också den andra händelsens källa i `sources`.
- Kontrolleras av `js/tour-format.js` (i webbläsaren och i `tests/tour.test.mjs`), `scripts/validate-site.py` (filer, händelser, källor, schema) och webbläsartestet.

## `vyer.json`: grupper och förinställda vyer i Lager (#357)

Ingen fakta, bara hur Lager är ordnat. Namnen står per språk som andra texter (`t()`).

- `title`: rubriken över vyerna ("Vy"). `custom`: märket när valen inte stämmer med någon vy ("Anpassad").
- `eventWindow`: orden efter en händelse i tidsfönstret som redan är slut eller inte har börjat (`past`, `future`). Årtalet kommer alltid från händelsen och formateras av `model.js` (#434).
- `groups`: grupperna i Lager i menyns ordning, `{ id, name }`. Varje lager anger sin grupp med fältet `group` i sin post i lagerregistret. En grupp med `"settings": true` (Inställningar) innehåller val som vyerna inte rör, till exempel "Behåll mina lager i fokus".
- `views`: de förinställda vyerna i knapparnas ordning, `{ id, name, layers }`. `layers` är id:n (`data-layer`) för lagren som är på i vyn; alla andra lager utanför Inställningar slås av. `standard` är de lager som är på när sidan öppnas och ska ändras samtidigt med lagrens `menu.on` om standardläget ändras. En vy kan också ha `tag` (#555): då visar händelselagret, Samtidigt och tidslinjens prickar bara händelser med den taggen (fältet `tags`). Ett eget val av lager i Anpassa själv lämnar vyn och visar alla händelser igen.
- `tags`: texterna för varje tagg (#555), `{ framsteg: { label, markLabel, about, empty, none } }`. `label` är märkningen i faktarutan, `markLabel` dess namn för skärmläsare (börjar med `label`), `about` förklaringen, `empty` beskedet när ingen händelse har taggen ännu och `none` när det inte finns någon nära året (`{within}` och `{at}` fylls i).
- Laddas av `loadViews()` i `js/ui/layers.js`. Saknas filen visas Lager som en lista utan grupper och vyer.
