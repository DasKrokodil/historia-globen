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
- `missuppfattningar.json` (#838) – vanliga historiska missuppfattningar.
- `quiz.json` (#846) – quizets tidsfrågor, som bara pekar på händelser.
- `perioder.json` (#845, #476) – epoker och perioder, som indelningar med årtal och källa; indelningarna `lgr22`, `norden-forntid`, `antiken` och `industrialiseringen`.
- `teman.json` (#398) – teman som namngivna urval av befintliga händelser; filen finns sedan bygget (#962), innehåller första temat, teknik (#105, 2026-11-11).
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
| Osäkerhet | EDTF-sträng i `edtf`: `~` ungefär, `?` osäker, `/` spann, `../` öppen start, `/..` pågår. År med fler än fyra siffror skrivs med prefixet `Y` (`Y-60000`), och `model.js` läser dem (`edtfSpan`, #1085). Sådana år visas med språkets tusentalsavgränsare från fem siffror (`formatYear`: "300 000 f.Kr.", "300,000 BC", "300.000 v. Chr."; tecknet står i `time.groupSep` i `data/ui/`), och miljoner år med `formatYearCount` ("1,8 miljoner år", "1,8 million d’années") | `"-0005~/-0003~"`, `"Y-60000~"` |
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
| `locationPrecision` | `region` eller `country` när platsen är ungefärlig. Förhistorien (#1384): platsen är alltid en fyndplats, aldrig ett antaget område. `region` sätts när punkten är ett fynd som får stå för en art eller grupp med större utbredning (neandertalare, denisovaner, *Homo floresiensis*) eller när koordinaten gäller ett större område än fyndplatsen (en formation, en nationalpark); en enskild grotta med egen koordinat har inget `locationPrecision` |
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
| `note` | Extra ruta i faktarutan: `kind`, `title` och `text`, till exempel "Om år 0". **`kind` (#613, beslut 2026-11-06) är obligatoriskt** och ett av `disagreement` (källorna skiljer sig), `single-source` (bara en källa), `calendar` (om kalendern), `date` (om datumet eller dateringen), `place` (om platsen), `sources` (om källorna) och `other`. Det är `kind`, inte rubrikens ordval, som avgör om anteckningen räknas som historisk osäkerhet: bara `disagreement` ger raden *Historisk osäkerhet*, markeringen *osäkert* och den streckade bågen. Ungefärligt eller osäkert årtal läses som förut ur `edtf` och `precision`, och ungefärlig plats ur `locationPrecision`. Välj typ efter vad anteckningen handlar om; är du osäker, välj `other`. Datum före 1753 skrivs som de nordiska uppslagsverken skriver dem, och anger en källa ett annat datum eller en annan kalender får händelsen en anteckning med `kind: "calendar"` (beslut 2026-11-10, #1061). Indexet `data/genererat/handelser.json` behåller `kind` och `title` (resten ligger i periodfilen) |
| `image` | Bild i faktarutan, se nedan |
| `tags` | Valfritt (#555, Rikards beslut 2026-11-03): lista med taggar tvärs över kategorierna. Den enda tillåtna taggen är än så länge `framsteg` (enum i `schemas/event.schema.json`), till exempel `"tags": ["framsteg"]`. Faktarutan visar då märkningen "Framsteg" med en kort förklaring, och vyn Framsteg i Lager visar bara händelser med taggen. Taggen sätts **bara** när källan på händelsen själv beskriver den som en förbättring (en sjukdom förklarad utrotad, slaveri avskaffat, en rättighet införd). Inget omstritt: ett framsteg för en grupp som var en förlust för en annan får ingen tagg, eller en öppen `note` ("Källorna skiljer sig"). Inga händelser skrivs bara för att få ihop vyn. Taggen sätts av Claude Code med källa, inte av Codex. Händelser utan `tags` fungerar som förut. |
| `lasting` | Valfritt (#1311, förslag): `true` när händelsen är ett **långt tillstånd**, något som pågick (ett rike, en kultur, en handel), och inte något som hände. Sätts med källa, i omgångar, aldrig efter en längdgräns: ett krig som varade i 30 år är fortfarande något som hände. Inga händelser har fältet än; hur jakten och panelen visar tillstånden ("pågick då") bestäms när den första omgången görs. Tillåtet i `schemas/event.schema.json`. |
| `significance` | Valfritt (#1021, del av #868 "Översikt"): heltal, bara värdet `1` tills vidare (enum i `schemas/event.schema.json`). Märker de händelser som ingår i den korta översikten över världshistorien. Urvalet bygger på de listor DasKrokodil godkände 2026-11-09 i #1010 (Skolverkets kursplan i historia, Lgr22, och Wikipedias *Vital articles* nivå 3 och nivå 4 History); just nu 123 händelser. Listan står i `docs/granskningar/2026-11-09-oversikt-urval.md` och `…-oversikt-urval.csv` (de med `lista = forslag`), beslutet i `docs/beslut/2026-11-09-oversikt-urval.md`. Ändras listan skrivs ett nytt beslut, och fältet följer listan. Fältet ändrar ingen text, inget årtal och ingen källa, och behöver ingen översättning. Händelser utan `significance` fungerar som förut. |

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
  "review": "source-checked", "relation": "together", "text": { "sv": "Medan Cheopspyramiden byggs lever det fortfarande ullhårsmammutar …" } }
```

`events` pekar på händelserna som jämförs, och fun facten ärver deras källor. `show` är spannet då kortet visas. Siffror i texten ska gå att räkna fram ur händelsernas årtal.

**`relation` (obligatoriskt, #1311, beslut `docs/beslut/2026-11-13-definition-av-samtidigt.md`):** hur händelserna ligger i tid, enligt definitionen av "samtidigt" i `js/samtidighet.js`:

- `together`: alla händelserna pågår minst ett gemensamt år (samtidigt);
- `near`: inget gemensamt år, men högst så många år isär som tabellen `near` säger (nära i tid). Avståndet är senaste start minus tidigaste slut;
- `apart`: längre isär; fun facten jämför avstånd i tid.

Tabellen `near` står överst i filen: `[{ "until": 0, "years": 100 }, { "years": 50 }]`. Raden väljs efter året där avståndet börjar (det tidigaste slutet): den första raden vars `until` (astronomiskt år) är minst det året, annars den sista raden. Värdet räknas fram ur årtalen och skrivs inte för hand utan att kontrolleras: `tests/samtidighet.test.mjs` stoppar en fun fact vars `relation` inte stämmer, och en fun fact som inte är `together` får bara säga "samtidigt" eller "samma år" om ett par av dess händelser pågår samma år. Samtidigt-kortet visar relationen ("Samtidigt", "Nära i tid: 33 år isär", "Jämför avstånd i tid"), med "ungefär" eller "cirka" när ett årtal är ungefärligt.

Korten "När ett krig bröt ut" lagras inte här. De byggs i koden ur händelserna, inom 5 år från krigets start.

## `perioder.json`: epoker och perioder (#845, #476)

Namngivna epoker som data, så att tidsålderstext, bildstilar och snabbknappar vid tidslinjen kan läsa samma uppgifter (beslut 2026-11-02 på #476, listan godkänd 2026-11-08, `docs/beslut/2026-11-08-epoker-lgr22.md`). En fil kan ha flera **indelningar** (`divisions`); regionala indelningar läggs till som egna indelningar senare. Än så länge finns bara `lgr22`: epoker enligt den svenska kursplanen i historia. Appen läser filen första gången intervallformuläret öppnas (`loadPerioder()` i `js/model.js`) och visar epokerna som snabbknappar (#965, se `docs/arkitektur.md`, Tidsintervallet); den publiceras med bygget (`scripts/build-site.sh`). Schema: `schemas/perioder.schema.json`; `scripts/validate-site.py` kontrollerar den, och översättningsspärren (`tools/oversattning.py`) räknar texterna.

```json
{ "id": "lgr22", "name": { "sv": "Skolans epoker (enligt Lgr22)", "en": "…" }, "simplification": { "sv": "Indelningen … är en förenkling …" },
  "periods": [{ "id": "norden-800-1500", "start": 800, "end": 1500, "edtf": "0800~/1500~", "grades": "4–6",
    "name": { "sv": "Norden, cirka 800–1500", "en": "…" }, "sources": ["skolverket-lgr22-historia"], "review": "source-checked" }] }
```

| Fält | Betydelse |
|---|---|
| `divisions[].id`, `name` | Indelningens id och namn på fem språk |
| `divisions[].simplification` | Obligatorisk text på fem språk som säger öppet att indelningen är en förenkling (svensk, europacentrerad, överlappande perioder, ungefärliga årtal). Ska visas bredvid knapparna |
| `periods[].id` | Läsbart id, unikt i indelningen |
| `start`, `end` | Astronomiskt år (som `events`). En period som pågår till nutid har `open: true` i stället för `end` |
| `edtf` | Osäkerhet som i `events`: `0800~/1500~` (ungefärliga gränser) och `1900~/..` för en öppen period |
| `grades` | Valfritt: årskurser i läroplanen (`4–6`, `7–9`) |
| `name` | Namn på fem språk. I `lgr22` är det våra egna korta formuleringar (inte Skolverkets rubriker, `docs/beslut/2026-11-08-epoknamn-egna-formuleringar.md`) med årtalen i namnet; en översättning ändrar aldrig årtalen |
| `note` | Valfritt: text på fem språk när källorna är oense (till exempel järnålderns slut), visas bredvid epoken |
| `sources`, `review` | Som för händelser. Gränserna står i läroplanstexten eller på museets sidor; ingen text är kopierad |

**`lgr22` (Del 1):** fem epoker, med de ungefärliga årtal som Skolverkets kursplan i historia (Lgr22, gäller från 2022-07-01) anger i centralt innehåll: cirka 800–1500, 1500–1800 och 1800–1900 (åk 4–6, Norden) och cirka 1850–1950 och 1900 till nutid (åk 7–9). De överlappar eftersom de hör till olika stadier, och det finns ingen epok före år 800. Läroplanen nämner stenålder, bronsålder, järnålder, antiken m.fl. utan årtal, så de ligger inte i `lgr22`.

**`norden-forntid` (Del 2a):** de tre nordiska åldrarna med Historiska museets årtal (öppnade 2026-11-08): stenålder 12 000–1700 f.Kr., bronsålder 1700–500 f.Kr. och järnålder 500 f.Kr.–550 e.Kr. (`-11999`/`-1699`, `-1699`/`-499`, `-499`/`550`). Årtal med fler än fyra siffror skrivs `Y-11999~` i `edtf`. Järnålderns egen sida på museet anger 1100 e.Kr. som slut, och oenigheten står i periodens `note`; nivån är `source-checked`. Indelningen är nordisk och märks så. **Del 2b** (jordbrukets början, högkulturer, industrialisering m.fl.) läggs inte in förrän fler källor har öppnats.

**`antiken` (Del 2b, första delen):** antiken som egen indelning med en period, cirka 800 f.Kr.–500 e.Kr. (`-799`/`500`, `-0799~/0500~`). Källor: svenska Wikipedia (som hänvisar till Nationalencyklopedin), engelska Wikipedia och Wikidata (CC0), öppnade 2026-11-08. Källorna är oense om slutet (cirka 300, 476, 500 eller 600), och det står i periodens `note`; nivån är `source-checked`, inte `two-sources`. Indelningen märks som ett europeiskt begrepp om Medelhavsvärlden.

**`industrialiseringen` (Del 2b, andra delen):** den brittiska industriella revolutionen (id `industrialiseringen`; döpt om 2026-11-09, #978) som egen indelning med en period, cirka 1760–1840 (`1760`/`1840`, `1760~/1840~`). Källa: engelska Wikipedia (Industrial Revolution, CC BY-SA 4.0), öppnad 2026-11-08, som anger cirka 1760–cirka 1840 och säger att början och slutet är omdiskuterade; det står i periodens `note`, och nivån är `source-checked`. Indelningen märks som den brittiska revolutionen och inte Sveriges industrialisering, som Lgr22 tar upp senare (granskningen 2026-11-08, #978). **Högkulturer** läggs inte in än: tidslinjen börjar 3000 f.Kr., så Uruk-perioden (4000–3100 f.Kr.) ligger helt utanför och Egypten har bara ett startår (enandet cirka 3150 f.Kr.); bara Indusdalen (cirka 3300–1700 f.Kr.) skulle få en knapp. Revolutioner och kolonisation blir teman eller turer (#398), inte epoker.

## `platser.json`: platser (#579)

Filen `data/platser.json` (schema `schemas/platser.schema.json`, kontroll i `scripts/validate-site.py`) har en lista `places`. En plats är ett **kort om platsens historia** i Fokus (`f=place:<id>`): namn, typ, en kort inledning och de händelser som ligger inom platsens **dagens gräns**, i tidsordning. Platsen lägger inte till några fakta utöver typen; allt historiskt står i händelserna och deras källor. Beslutet om ordet Platser och typen: [2026-11-10-platser-och-typ-i-data.md](beslut/2026-11-10-platser-och-typ-i-data.md).

| Fält | Betydelse |
|---|---|
| `id` | läsbart, unikt (`gronland`, `aotearoa`) |
| `type` | `autonomous` (självstyrt område) eller `country` (land); visas på kortet och i listan som `place.type.<typ>` i `data/ui/`, så att varje språk och land kan använda sitt eget ord. Nya typer (landskap, delstat) läggs till i schemat och i alla fem språkfilerna |
| `name`, `intro` | text på alla fem språk. Inledningen beskriver urvalet och påstår inget historiskt |
| `partOf` | valfri text: vad platsen ingår i; kortet skriver då "Typ i …" |
| `view` | `center` ([lat, lon]) och `zoom` för kameran; ingen mittpunkt räknas ur gränsen, eftersom Nya Zeeland ligger på båda sidor om datumgränsen |
| `boundary` | `source` (id i `sources.json`), `ne` (Natural Earth, ISO 3166-1 numeriskt id), valfri `exclude` (rutor [väst, syd, öst, nord] vars polygoner tas bort; Tokelau ur Nya Zeeland) och `geometry` (GeoJSON MultiPolygon i WGS 84). `geometry` skrivs av `python3 tools/platser_gransar.py` ur Natural Earth 1:50m via world-atlas, public domain |
| `emblems` | valfritt (#1160): flagga och vapen på kortet, en lista med `kind` (`flag` eller `arms`), `file` (egen SVG i `img/flags/`, samma mapp som rikenas flaggor), `caption` (vad bilden visar, alla fem språk), `credit`, `license` och `source` (filsidan på Commons i `sources.json`). Bara licenser som CLAUDE.md tillåter, kontrollerade per fil. Flaggan får samma mässingsram som på kartan. Filsidorna står också bland kortets källor |
| `sources`, `review` | som för händelser; `draft` visas inte |

**Händelserna inom gränsen** räknas vid körning av `placeEvents()` i `js/place-geo.js`: händelsens punkt ligger i polygonen, eller inom **20 km** från dess kant (`COAST_MARGIN_KM`), eftersom 1:50m-kusten är grov och Nuuk, Auckland och Golden Bay annars hamnar i havet. `validate-site.py` räknar med samma marginal och kräver minst 5 synliga händelser inom gränsen. Gränsen är **dagens**, inte den som gällde då; kortet säger det på en fast rad (`place.borderNote`).

## `teman.json`: teman (#398)

**Fastställt format (#950, beslut [2026-11-08-temaformat-398.md](beslut/2026-11-08-temaformat-398.md), frågorna 1–4 på #398 besvarade av DasKrokodil 2026-11-08), byggt i #962:** filen `data/teman.json` (tom lista), schemat `schemas/teman.schema.json`, kontrollen i `scripts/validate-site.py` och temat i Fokus. Ett tema är ett **namngivet urval av befintliga händelser** med en introduktion, till exempel teknik (#105). Temat lägger inte till några fakta: allt historiskt innehåll ligger kvar i händelserna och deras källor.

Världsdelsräkningen använder `region()` i `js/model.js`: **Europa, Asien, Afrika, Amerika och Oceanien**. Det är en grov koordinatregel, inte landstillhörighet eller en exakt geografisk gräns. `eventRegion()` i `js/uppdrag-rules.js` anropar redan samma funktion. `tests/region.test.mjs` jämför den med Python-validerarens verkliga `region_of()` i `scripts/validate-site.py`, både på kodens gränser och i ett koordinatnät, så att temakontrollen och gränssnittet inte glider isär (#1114). Samma test verifierar elevuppdragets båda koordinatformat.

### Exempel

Exemplet nedan är en **platshållare**: introduktionen är inte skriven och temat är `draft`, så det skulle inte visas. Händelserna är befintliga id i `data/events.json`, från flera av regelns fem världsdelar. Det riktiga teknikurvalet och introduktionen står i `data/teman.json` (#105, del a, 2026-11-11): 14 befintliga, källkontrollerade händelser, `review` `source-checked`. Urvalet nås fem världsdelar enligt `region()` (Asien 5, Europa 4, Amerika 3, Afrika 1, Oceanien 1), men ingen händelse ligger i Afrika söder om Sahara (Faros ligger i Egypten); en sådan teknikhändelse hör till #1111. Introduktionen beskriver bara urvalet och påstår inget historiskt, så `sources` är tom.

```json
{
  "schema": "historia-globen/teman@1",
  "themes": [
    {
      "id": "teknik",
      "name": { "sv": "Teknik", "en": "Technology", "de": "Technik", "es": "Tecnología", "fr": "Technologie" },
      "intro": {
        "sv": "PLATSHÅLLARE: introduktionen skrivs i #105.",
        "en": "PLACEHOLDER: the introduction is written in #105.",
        "de": "PLATZHALTER: Die Einleitung wird in #105 geschrieben.",
        "es": "MARCADOR: la introducción se escribe en #105.",
        "fr": "ESPACE RÉSERVÉ : l’introduction est rédigée dans #105."
      },
      "events": [
        "sintashta-stridsvagnar", "fyren-pa-faros", "dujiangyan", "cai-lun-papper", "zhang-hengs-seismoskop",
        "nazcas-puquios", "gutenberg", "watt-separat-kondensor", "telegraflinjen-genom-australien", "telefonen",
        "wright", "www"
      ],
      "view": "utforska",
      "sources": [],
      "review": "draft",
      "placeholder": true
    }
  ]
}
```

### Fält

| Fält | Krävs | Betydelse |
|---|---|---|
| `schema` | ja | `historia-globen/teman@1` |
| `themes[].id` | ja | Läsbart id, små bokstäver och bindestreck, unikt i filen. Står i länken (`f=theme:<id>`) och ändras inte efter att temat har publicerats |
| `name` | ja | Temats namn på alla fem språk (`sv`, `en`, `de`, `es`, `fr`) |
| `intro` | ja | Introduktionen på alla fem språk, högst cirka 400 tecken. Den säger vad temat samlar och varför. Påstår den något historiskt som inte står i temats händelser, ska det ha källa i `sources` |
| `events` | ja | Händelse-id, minst 5 och utan dubbletter. Ordningen i filen spelar ingen roll: Fokus visar händelserna i tidsordning |
| `view` | nej | Id på en vy i `data/vyer.json` som slås på när temat börjar. En vy med `tag` (#555) är inte tillåten, eftersom taggen och temat båda väljer händelser och tillsammans kan visa ingenting. Saknas `view` behålls besökarens lager |
| `sources` | ja | Källor för påståenden i `intro` (id i `sources.json`), som för händelser. Tom lista när introduktionen bara beskriver urvalet |
| `review` | ja | `draft`, `source-checked` eller `two-sources`, som för händelser. Ett tema med `draft` visas inte. Översättningarna följer reglerna i CLAUDE.md (översätt samtidigt) och räknas av `tools/oversattning.py` |
| `placeholder` | nej | `true` för ett tema vars texter inte är skrivna. Ett sådant tema måste vara `draft`, och `scripts/validate-site.py` stoppar det i den publicerade filen |

### Regler (kontrolleras av `scripts/validate-site.py`, schemat i `schemas/teman.schema.json`)

- Varje id i `events` finns i `data/events.json`. En händelse som är `draft` räknas inte: temat visar bara händelser som syns, och minst 5 av dem ska synas.
- Varje id i `view` finns i `data/vyer.json` och saknar `tag`.
- `name` och `intro` har alla fem språk; en översättning ändrar aldrig fakta.
- **Varning, inte fel:** färre än tre världsdelar bland de synliga händelserna (`region()` i `js/model.js`), eftersom varje paket ska ha innehåll från flera världsdelar (CLAUDE.md, Versionsplan); och händelser som börjar före tidslinjens början (se nedan).

### Hur ett tema väljs i Fokus

1. **Fokusmenyn** får fliken **Teman** bredvid Krig, Riken, Försvunna länder, Religioner och Resor (#543), och temana syns i fliken Alla och i sökningen (#311), som söker i `name` på alla språk. Raden visar namnet, antalet synliga händelser och spannet ("12 händelser · 2200 f.Kr.–1989").
2. **Temat börjar** som andra fokus (`startFocus('theme:<id>')` i `js/controllers/focus.js`): fokusets spann går från den tidigaste till den senaste synliga händelsen, inom tidslinjens gränser (`MIN_YEAR`, `MAX_YEAR`). Året stannar om det ligger inom spannet; annars flyttas det till starten och fokusraden säger "Tiden flyttades till …" (#167). Globen zoomar ut till hela jorden och vrids mot den tidigaste händelsen.
3. **Introduktionen** visas som ett kort när temat börjar, med temats händelser i tidsordning som knappar som öppnar faktarutan (som rikets berättelse, #171). Knappen Fakta i fokusraden öppnar kortet igen.
4. **Temats vy** slås på om temat har `view`.
5. **Bara temats händelser syns:** händelselagret, Samtidigt och tidslinjens prickar visar bara temats synliga händelser, på samma sätt som en vys `tag` (#555). Temat visar alla sina händelser även om en kategori är avstängd; kategorivalet ändras inte och gäller igen när temat slutar (beslut 2026-11-08, fråga 3 på #398). Uppspelningen går genom temats spann.
6. **Avsluta och "Tillbaka till <året>"** fungerar som för andra fokus. När temat slutar syns alla händelser igen.

### Temat och lägeskontraktet (#893)

Ett tema är fokus av typen `theme`, så läget är `fokus` och raden Fokus i uteslutningstabellen gäller: en tur, ett intervall eller ett nytt fokus avslutar temat, och i en lektion börjar inget tema. En jakt pågår samtidigt med ett tema; eftersom temat begränsar vilka händelser som syns, prövar del 2 att uppdraget går att klara eller att sidan säger att det inte går. Temat sparar ingen egen ögonblicksbild utöver Fokus: utgången återställer inget, och året står kvar (`exitRestore`). Lagren som temats vy slog på står kvar efter temat, som när man lämnar ett krig eller ett rike (beslut 2026-11-08, fråga 1 på #398). I adressen står temat som `f=theme:<id>`; en okänd id ger det vanliga startläget, som för andra fokus. I `js/state.js` behövs bara `theme` i `FOCUS_TYPES`; `MODE_RULES` ändras inte.

### Lektionen och vyns urval (#1139)

`MODE_RULES` i `js/state.js` ändrades 2026-11-11 (beslut [2026-11-11-oversikt-urval-och-lektion-1139](beslut/2026-11-11-oversikt-urval-och-lektion-1139.md)): fältlistan `restore` för `lektion` och `tur` har fått ett nytt fält, `tag` (vyns urval, till exempel Översikt, #868), och fältet finns också i ögonblicksbilden (`app.modeSnapshot`). Betydelsen: **lektionen visar alltid alla händelser i lektionens år**. När lektionen börjar släpps urvalet, och "Visa hela globen" återställer det som det var före lektionen, på samma sätt som lagren. Båda lägena måste ha `tag` i `restore`, eftersom en utgång bara återställer fält som alla lägen som slutar tillåter (det strängaste bestämmer). `takes` och uteslutningstabellen (`when`) är oförändrade. En äldre bild utan `tag` återställer inget urval.

### Teman och epoker (`perioder.json`)

Båda är ett namngivet urval med text på fem språk och källor, och de delar fältnamnen `id`, `name`, `sources` och `review`. De är ändå två filer: en epok väljer ett **tidsspann** och blir ett tidsintervall (läget `intervall`), ett tema väljer en **lista med händelser** och blir ett fokus. Lägena utesluter varandra enligt kontraktet, så en besökare kan inte råka ha båda på. Ett tema om en period är ett tema vars händelser ligger i perioden; en epok listar aldrig händelser. Får en epok en introduktion heter fältet `intro`, som här.

### Regeln för nya urval (#1327)

**Ett nytt namngivet urval är en händelselista, ett tidsspann eller en geometri** (beslut [2026-11-13-fokustyper-som-poster](beslut/2026-11-13-fokustyper-som-poster.md)). Det finns tre format och det kommer inget fjärde:

| Väljer med | Fil | Blir | Adress |
|---|---|---|---|
| en händelselista | `data/teman.json` | fokus av typen `theme` | `f=theme:<id>` |
| en geometri | `data/platser.json` | fokus av typen `place` | `f=place:<id>` |
| ett tidsspann | `data/perioder.json` | läget intervall | `y`, `y2`, `p` |

Kärnan är gemensam: `id`, `name`, `intro`, `sources` och `review`. **Människoarter får inget eget format:** de är händelser, och visas med ett lager. Länder är platser. I koden är de två fokusformaten poster i `js/focus/` med `selectsBy: 'events'` och `'geometry'` (docs/arkitektur.md, "Fokustyper som poster"), och båda ger samma fält i `state.focus`: `themeEvents` (händelserna i tidsordning) och `eventIds`.

### Händelser före tidslinjens början (#892, #942)

Ett tema får innehålla händelser som börjar före 3000 f.Kr. (`MIN_YEAR = -2999`). Fokusets spann börjar då vid −2999; händelsen nås från temats lista i introduktionskortet, och faktarutan märker den med "Händelsen börjar före tidslinjens början" (#942). Validatorn varnar men stoppar inte. Att tidslinjen går längre bak hör till #396 (Version 7).

### Ingår inte i version 1

Ett fält `themes` på händelserna (en lista per tema räcker tills listorna blir för långa), turer eller berättelser i ett tema, egen kamera eller zoom per tema, egna fun facts, teman i teman, ett tema som ändrar besökarens kategorival eller året, och bilder för temat.

## `missuppfattningar.json`: vanliga missuppfattningar (#838)

Vad många tror, vad källorna säger och var missuppfattningen kom ifrån (beslut 2026-11-07, `docs/beslut/2026-11-07-missuppfattningar-838.md`). Faktarutan för en händelse visar de missuppfattningar som pekar på den i `events` (rubrik "Vanlig missuppfattning": vad många tror, vad källorna säger, en hopfälld rad om var den kom ifrån, källor och granskningsnivå). Poster utan `events` visas inte än, och poster med `review: "draft"` visas aldrig. Filen laddas första gången en faktaruta visas (`loadMisconceptions()` i `js/model.js`). Schema: `schemas/missuppfattning.schema.json`.

```json
{ "id": "napoleon-var-kort", "events": ["napoleonkrigen"],
  "claim": { "sv": "Napoleon var ovanligt kort." }, "truth": { "sv": "Napoleon var ungefär 167–168 cm …" },
  "origin": { "sv": "Brittiska karikatyrtecknare … " }, "originKinds": ["satire"],
  "sources": ["wp-napoleon", "wp-napoleon-complex"], "review": "source-checked" }
```

| Fält | Betydelse |
|---|---|
| `id` | Läsbart, unikt id |
| `events` | Valfritt: händelser i `events.json` som missuppfattningen hör till. Saknas händelse är `year` obligatoriskt |
| `year`, `location`, `locationPrecision` | Valfritt: för missuppfattningar utan händelse på globen. `year` (astronomiskt) är året som bäst placerar den i tiden: händelsen den gäller, eller när den första gången är belagd (kinesiska muren: 1754, brevet där myten först nämns). `location` är en GeoJSON-punkt och `locationPrecision` (`region` eller `country`) anges när platsen är ungefärlig |
| `claim`, `truth`, `origin` | Texter per språk: vad många tror, vad källorna säger och var det kom ifrån. Är källorna oense skrivs det öppet i `truth` |
| `originKinds` | Hur den uppstod, minst ett av `satire`, `propaganda`, `misreading`, `media`, `folk`, `other`. Eget fält, ingen ny kategori |
| `sources`, `review` | Som för händelser. Bara sådant historiker är överens om; helst forskning eller referenslitteratur som källa |

`scripts/validate-site.py` kontrollerar schemat och att `events` och `sources` finns. Texterna ingår i `tools/oversattning.py`.


## `quiz.json`: quizets tidsfrågor (#846)

Frågor av sorten "Vad kom först?" och "Vad låg närmast i tid?" (beslut 2026-11-12, `docs/beslut/2026-11-12-quiz-sant-eller-myt.md`). En fråga är `{ "id", "kind", "events" }`:

- `kind: "first"`: två händelser; den som **startar** först är rätt svar. Starterna måste ligga minst 50 år isär (`MIN_ORDER_GAP`).
- `kind: "closer"`: tre händelser; rätt svar är den av den andra och tredje som ligger närmast den första i tid, räknat som avstånd mellan spannen (`gapBetween`). Avstånden måste skilja minst 100 år (`MIN_CLOSER_DIFF`).

Inga årtal, svar eller texter står i filen. Svaret och avståndet räknas fram ur händelsernas årtal i `js/quiz-rules.js` (`timeQuestion`), så att siffrorna alltid går att räkna fram ur källkontrollerade händelser (Källpolicy punkt 5). Är något av årtalen ungefärligt (`edtf` med `~` eller `?`, eller `precision` grövre än år) skrivs avståndet med "cirka" och avrundas till tiotal. Facit visar händelsernas källor, och en fun fact om någon fun fact handlar om just frågans händelser. `scripts/validate-site.py` kontrollerar att händelserna finns och att antalet stämmer med sorten, och `tests/quiz.test.mjs` att varje fråga ger ett tydligt svar.
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

Ett rike kan bestå av flera delar, till exempel Romarriket med kungadömet, republiken, kejsardömet och Bysans. Varje period har en egen gräns. `label` är platsen där namnet skrivs ut. Filerna byggs med `tools/riken.py` ur Cliopatria. Faktarutorna (`facts`, se nedan), symbolerna (`symbol`) och de egna faktarutorna för enskilda riken (`polityFacts`) skrivs för hand; skriptet läser den befintliga `index.json` och behåller de fälten i varje rike när filen skrivs om (#68, #301). Det gäller också flaggorna (`flags`), huvudstäderna (`capitals`) och `labelAt`. Översättningarna (`de`, `es`, `fr` …) av namn som skriptet själv skriver på svenska och engelska, alltså rikenas och delarnas namn, inflytandenamnen och moderlandets namn, behålls så länge det svenska namnet är detsamma. Varje grupp får samma fältordning som förut, så att en ombyggnad utan andra ändringar ger en tom diff (#1220). Reglerna står i `tools/riken_bevara.py` och provas i CI av `tests/riken-bevara-test.py` på den riktiga `index.json`.

Medeltidens riken (R3, #69): Umayyad- och abbasidkalifaten, Frankerriket (merovinger och karoliner, Cliopatrias sammanslagna `(Merovingian Empire)` och `(Carolingian Empire)`), Tysk-romerska riket (`(Holy Roman Empire)`), Tang- och Songdynastierna, Khmerriket, Ghanariket, Maliriket, Kievriket och Timuridriket, var och en en egen grupp med faktaruta. Källor: Wikipedia och World History Encyclopedia (NC, bara länkad). Kartdatans avvikelser står i varje rikes `mapNote`, till exempel att Cliopatria saknar abbasidkalifatet 970–1201 och från 1459 bara räknar Tysk-romerska rikets småstater till riket.

Tysk-romerska riket efter 1458 (#336, Rikards val A i #69): Cliopatria räknar från 1459 bara småstaterna till `(Holy Roman Empire)`. Därför bygger `tools/riken.py` ihop riket efter 1458 enligt tabellen `EXTEND` (en post per rike som ska byggas ihop): `polity` (rikets namn i Cliopatria), `after` (sista året med Cliopatrias egen gräns), `border` (rikets gräns ett visst år, här 1458), `outside` (länder som ligger i den gränsen men inte hörde till riket, här Ungern och Tyska ordens Preussen), `add` (Cliopatria-riken med första och sista år som räknas in, till exempel Habsburgarnas länder, Böhmen, Brandenburg och Preussen, Sachsen, Bayern och Hannover) och `remove` (riken som klipps bort från ett visst år, här Schweiz och Förenade Nederländerna från 1648). För varje år där något av rikena ändras läggs rikets egen post och de angivna rikena ihop och klipps mot gränsen; resten (förenkling och sammanslagning av perioder) är som för andra riken. `areaKm2` räknas då ur den byggda gränsen (ytriktig projektion på en sfär). Områden som ett rike utanför listan tar över, till exempel Frankrike, faller bort. Hur kartan är byggd står i rikets `mapNote`.

Tidigmoderna riken (R4, #70): Aztekriket (staden Tenochtitlan och trippelalliansen), Inkariket, Songhairiket, Mogulriket, Safavidriket, Mingdynastin (med Södra Ming), Qingdynastin, Spanska och Portugisiska imperiet (Cliopatrias sammanslagna `(Spanish Empire)` och `(Portuguese Empire)`, moderland och kolonier), Ryssland (tsardömet och kejsardömet), Svenska stormaktsväldet (`Swedish Empire`), Habsburgska riket (`(Habsburg Monarchy)`) och Tokugawa-Japan, var och en en egen grupp med faktaruta. Spanska och portugisiska imperiet och Ryssland förenklas hårdare (`OVERRIDES` i `tools/riken.py`). Källor: Wikipedia, World History Encyclopedia (NC, bara länkad) och Wikidata (start- och slutår). Kartdatans avvikelser står i varje rikes `mapNote`, till exempel att Cliopatria räknar Portugal och dess kolonier till Spanska imperiet 1582–1639 och visar `Swedish Empire` ända till 1814, fast stormaktstiden slutade 1721. Därför är Sveriges post delad i två delar i `GROUPS` med samma Cliopatria-namn och olika `years` (Rikards val A i #70): Svenska stormaktsväldet (`svenska-stormaktsvaldet`) till och med 1721 och Sverige (`sverige-1722`, Wikidata Q34) 1722–1814. Från #556 fortsätter gruppen med unionen Sverige-Norge (`sverige-norge`, `United Kingdoms of Sweden and Norway`) 1815–1904 och Sverige (`sverige-1905`, `Kingdom of Sweden` klippt till 1905–2024), så att den faktiskt går "och efter". Från #645 (Rikards beslut 2026-11-07) börjar gruppen med det medeltida Sverige (`sverige-medeltiden`, `Kingdom of Sweden` 980–1611, Q34; Cliopatria har Kalmarunionen 1402–1501) och heter **Sverige**; förut hette den "Sverige: stormaktsväldet och efter". Id:t `svenska-stormaktsvaldet` står kvar, så krigens `empires` pekar rätt. Delarna har olika engelska namn, eftersom religionslagrets teckenförklaring slår upp rikena på det engelska namnet. Har flera delar samma Cliopatria-namn gäller den första delens namn när riket nämns som lydrike i ett annat rikes inflytande (#75).

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

**Nutida stater, åttonde omgången (#644).** Liberia (från 1848), Portugal (från 1976; Cliopatrias `Portuguese Republic` 1911–1925 omfattar också kolonierna och är inte med), Malawi, Ungern (`Hungarian Republic` 1919–1943, `Hungary` och `Hungarian People's Republic` ihopslagna, Wikidata Q28 i stället för Cliopatrias Q28513, Österrike-Ungern), Österrike (första och andra republiken ihopslagna, Wikidata Q40 i stället för Q187830, Österrikes historia), Panama, Tjeckien, Förenade arabemiraten, Serbien (bara från 2006: Cliopatria kallar 1992–2005 `Serbia-Montenegro`, men staten fick det namnet först 2003 enligt Wikidata; Kosovo ingår inte i Serbien efter 1999 i Cliopatria) och Irland (`Irish Free State` och `Éire` ihopslagna, Q27). Brittiska imperiets `minus` har också Malawi, Förenade arabemiraten och Österrike (Cliopatria räknar en del av Österrike till imperiet efter 1945), och USA:s `minus` Liberia (som Cliopatria räknar till USA ända till 1946), med `splits` 1848. Namnen på tyska, spanska och franska kommer ur Wikidata (`tools/riken_namn.py`).

**Namnen för de tidigare omgångarna (#644, #676).** Staterna i omgång 1–6 och Palestina fick namn på tyska, spanska och franska ur Wikidata med `tools/riken_namn.py`, som nu använder Wikidatas frågetjänst (SPARQL), eftersom `wbgetentities` ofta svarar 429. Där Wikidatas etikett inte motsvarar det svenska namnet är namnet rättat för hand: Kina (etiketten gäller folkrepubliken, gruppen omfattar också Republiken Kina), Taiwan (den spanska etiketten är "República de China"; kartan använder namnet Taiwan, docs/omstridda-granser.md), Frankrike (etiketten gäller femte republiken) och Palestina på franska. De engelska namnen för Kina och Frankrike är "China" och "France", som de svenska. De äldre rikena (R1–R7) har Cliopatrias Wikidata-id, som ofta har visat sig fel, och översätts i #677–#679.

**Nutida stater, nionde omgången (#644).** Sierra Leone, Sri Lanka, Lettland (1920–1939 och från 1992), Litauen (`Kingdom of Lithuania` 1919–1939 och `Republic of Lithuania` ihopslagna, Q37: Cliopatria anger det medeltida kungarikets id för posten 1919–1939), Togo, Costa Rica (från 1840), Dominikanska republiken (från 1846), Kroatien (bara från 1992; `Independent State of Croatia` 1941–1944 är inte med), Bosnien och Hercegovina och Estland (1919–1939 och från 1992). Sovjetunionen har `minus` med Litauen och `splits` 1990 (Cliopatria räknar Litauen till Sovjetunionen till och med 1991, fast Litauen är eget land från 1990), och Spanska imperiet `minus` med Dominikanska republiken från 1865 (Cliopatria räknar den till imperiet ända till 1931). Azerbajdzjan väntar och tas med Armenien, eftersom Nagorno-Karabach ska visas som omstritt till 2022 och som Azerbajdzjan från 2023.

**Nutida stater, tionde omgången (#644).** Azerbajdzjan, Armenien, Georgien (bara 1918–1921 och från 1992; Cliopatrias `Georgia` har också ett medeltida rike 947–1009, och Cliopatria anger en förgreningssida, Q4962, i stället för Q230), Slovakien (Q214 i stället för Cliopatrias Q33946, Tjeckoslovakien), Bhutan (från 1636), Schweiz (från 1648, eftersom Cliopatria före dess också räknar Edsförbundet till Tysk-romerska riket), Nederländerna (från 1950, efter nederländska kolonialväldet), Salomonöarna, Guinea-Bissau och Lesotho. `DISPUTED` har en ny sorts område, `('ne-snitt', <land i Natural Earth>, (<Cliopatria-namn>, <år>))`: snittet mellan ett lands gräns i Natural Earth och en Cliopatria-post. Nagorno-Karabach och omkringliggande områden (Cliopatrias Armenien inom Azerbajdzjans gräns i Natural Earth) tas bort ur Armenien från 1992 och läggs till Azerbajdzjan från 2023 (Rikards beslut), och Abchazien och Sydossetien läggs till Georgien från 1992; `tools/ne_omstridda.py` tar nu också ut dem, Transnistrien och Azerbajdzjans gräns. Noterna i rutan Om kartan finns på alla fem språken. Brittiska imperiets `minus` har också Lesotho. Bhutan och Salomonöarna överlappar imperiet något på kartan, men det är förenklingen (imperiet förenklas till 0,3 grader), inte Cliopatria.

**Nutida stater, elfte omgången (#644).** Storbritannien (Cliopatrias `Kingdom of Great Britain`, moderlandet i Brittiska imperiet, som eget land från 2000, när imperiet slutar hos oss; Wikidata Q145, Förenade kungariket, i stället för Q23666, ön Storbritannien; Cliopatria räknar Oman, Qatar och Förenade arabemiraten till posten 2000–2023, och de klipps bort med `minus`), Belgien (från 1830), Ekvatorialguinea (Francos Spanien har `minus` med Ekvatorialguinea), Albanien (Q222 i stället för Cliopatrias Q467864, den socialistiska folkrepubliken), Moldavien (med Transnistrien ur Natural Earth från 1992, Rikards beslut, och noten på alla fem språken), Nordmakedonien, Burundi, Belize, Djibouti och El Salvador (från 1840).

**Nutida stater, tolfte omgången (#644).** Fiji, Slovenien, Bahamas, Eswatini (Wikidatas svenska etikett är Swaziland; Eswatini är dess svenska alias och Cliopatrias namn, och på spanska Esuatini, Wikidatas spanska alias, i stället för etiketten Suazilandia), Vanuatu, Jamaica, Qatar, Gambia, Libanon (från 1944; Q822 i stället för Cliopatrias Q139708, Franska mandatet för Syrien och Libanon) och Kap Verde. Cliopatria räknar Fiji, Bahamas, Qatar och Gambia till Brittiska imperiet och Kap Verde till Femte franska republiken också de år de är egna länder; de klipps bort med `minus`, och Frankrikes perioder delas 1976 (`splits`) så att Kap Verde inte slås ihop med åren före. Gambia och Libanon är smala länder och förenklas finare, och det gör även grannarna Senegal och Syrien, annars täcker grannarnas förenklade gräns en stor del av dem. Syriens perioder slås ihop först vid 0,5 procents ändring, så att Golanhöjderna fortfarande är tomma från 1967. Östtimor väntar: Cliopatria räknar landet till Indonesien till och med 2005, fast det blev självständigt tidigare, och det behöver jämföras med en andra källa först.

**Nutida stater, trettonde omgången (#644).** Kosovo (från 2008, Rikards beslut; Cliopatria har Kosovo från 2000, och 2000–2007 visas området utan stat), Cypern (hela ön från 1976 med Norra Cypern ur `DISPUTED`, Rikards beslut), Montenegro (från 2006; Cliopatrias post har också furstendömet och kungariket 1853–1915), Brunei (från 1987, Cliopatrias nutida post; Q921 i stället för Cliopatrias Q887803, det historiska sultanatet), Trinidad och Tobago, Mauritius, Luxemburg (från 1890; Q32 i stället för Cliopatrias Q2719360, det medeltida hertigdömet), São Tomé och Príncipe, Bahrain och Singapore. Noterna i rutan Om kartan för Cypern, Kosovo och Serbien finns på alla fem språken. Cliopatria räknar Brunei, Bahrain och Cypern till Brittiska imperiet, Bahrain till Storbritannien och Luxemburg till Nederländerna (till och med 1914) också de år de är egna länder; de klipps bort med `minus`, och perioderna delas (`splits`) 1987 i imperiet och 1890 i Nederländerna. Malaysias perioder delas 1967, eftersom Cliopatria har Singapore i Malaysia till och med 1966, och Malaysia, Luxemburg och Singapore förenklas finare. Luxemburg överlappar ändå grannarna något, eftersom Frankrike, Belgien och Tyskland förenklas grövre.

**Nutida stater, fjortonde omgången (#644).** Malta, Barbados, Dominica, Saint Lucia, Antigua och Barbuda, Saint Vincent och Grenadinerna (Cliopatrias `Saint Vincent`), Grenada, Seychellerna och Palau. Cliopatria räknar öarna till Brittiska imperiet och Palau till USA också de år de är egna länder; de klipps bort med `minus`, och perioderna delas (`splits`) när länderna blir självständiga i Cliopatria. Öländerna förenklas finare (0,02 grader) och små öar behålls, annars blir de trianglar eller försvinner. Tre väntar: Saint Kitts och Nevis (Cliopatrias `Saint Kitts` ligger på ön Saint Croix i Amerikanska Jungfruöarna), Mikronesiska federationen (Cliopatria har bara ön Pohnpei, och anger Q3359409, regionen Mikronesien) och Andorra (Spaniens och Frankrikes förenklade gränser täcker nästan hela landet, så mikrostater behöver en egen lösning).

**Nutida stater, femtonde omgången (#644).** Etiopien (Cliopatrias `Ethiopia` från 1975, Q115; Etiopiska kejsardömet tar samma post till och med 1974, och Eritrea ingår till och med 1991 som i Cliopatria), Östtimor (från 2002, se fall 14 i docs/omstridda-granser.md: Cliopatria har landet från 2006, och en ny inställning per del, `prepend` (från, till), lägger till år före Cliopatrias första år, med gränsen ur `DISPUTED`) och Portugisiska imperiet 1911–1975 (Cliopatrias `Portuguese Republic` och `Estado Novo`, som omfattar Portugal och kolonierna; imperiet slutade förut 1910, så Portugal och kolonierna saknades på kartan 1911–1975). Estado Novo 1979–2024 i Cliopatria är bara Cabinda, som också ligger i Angola, och tas inte med. Imperiet har `minus` med Guinea-Bissau och med Indien från 1961 (Goa), och perioderna delas 1961 och 1973; Brittiska imperiets perioder delas 1919, eftersom Cliopatria räknar norra Moçambique till det brittiska imperiet bara 1918. `tools/tackning_riken.py` räknar nu bara de år en Cliopatria-post används (`years` i `GROUPS`); förut räknades Etiopien efter 1974 som täckt. Kvar av de 193 FN-länderna var då Andorra och Monaco (#719) och tolv små stater, som har lagts in ur Natural Earth (stycket nedan).

**Små stater som punkter (#722, Rikards beslut 2026-11-07).** Saint Kitts och Nevis och Mikronesiska federationen har fel gräns i Cliopatria, och Kiribati, Komorerna, Liechtenstein, Maldiverna, Marshallöarna, Nauru, Samoa, San Marino, Tonga och Tuvalu finns inte där i nutid. De har Cliopatria-namnet `None` och `ne` (ett id i `tools/ne-omstridda-omraden.geojson`, där `tools/ne_omstridda.py` lägger dagens land ur `ne_10m_admin_0_countries` 5.1.1, förenklat till 0,002 grader och avrundat till 0,001 grad), med `years` från självständigheten till 2024, `point: true` och `label` på huvudstaden. I rikets fil får delen `point: true` och källan `natural-earth-lander`; gruppen får `borderSource: "Natural Earth"`. `AreasLayer` ritar området som vanligt och dessutom en fylld punkt i landets färg med pergamentring på `label`, och namnet till höger (eller till vänster vid kanten 180° och när höger är upptaget) från zoomnivån världsdel när det finns plats, alltid i Fokus. Årtalen: självständigheten enligt Wikidata (startdatum, P571) och faktarutan i engelska Wikipedia, `two-sources` där de stämmer. Saint Kitts och Nevis visas från 1983 (Wikipedia: självständigheten; Wikidata: 1967, associerad stat) och San Marino från 1291 (Wikipedia: självständigt från Kyrkostaten; Wikidata: det traditionella grundandet 301), med `source-checked` och källornas skillnad i rutan Om kartan. Liechtenstein visas från 1806 (Cliopatria har det 1721–1814, men den posten används inte), och för Tonga nämner rutan att landet enades omkring 1845 och var brittiskt protektorat från 1900.

**Medeltidens luckor, första omgången (#645).** De tio största luckorna 1000–1200 enligt `tools/tackning_riken.py`, byggda med `tools/riken.py` ur Cliopatria v0.2.1 (`source-checked`, källan Cliopatria): Kimek-Kipchak confederation, Ghaznaviderna, Seldjukiska riket (Cliopatrias `Great Seljuk Empire`), Liaodynastin, Shrivijaya, Republiken Novgorod, Kungariket Ungern, Kungariket Frankrike, Kungariket England och Norgesväldet (Cliopatrias `Old Kingdom of Norway`). Svenska namn är Wikidatas svenska etiketter, och tyska, spanska och franska hämtades med `tools/riken_namn.py`. Kimek-Kipchak saknar svenskt namn på Wikidata och har Cliopatrias engelska namn, och saknar också tyskt namn, så det tyska är det engelska. Cliopatria anger fel Wikidata-id för Kungariket Frankrike (Q207162, Bourbonska restaurationen; rätt är Q70972) och Norgesväldet (Q202266, Margareta I; rätt är Q2196956); de är rättade med `wikidata` i `GROUPS` och kontrollerade mot Wikidata 2026-11-07. Tibetans väntar: Cliopatrias post pekar på folkgruppen Tibetaner (Q187985), inte på en stat. Täckningen av Cliopatrias land stiger från 21 till 44 % år 1000, från 19 till 51 % år 1100 och från 17 till 34 % år 1200. Kartan före fakta: grupperna har bara gräns och namn, utan faktarutor.

**Medeltidens luckor, andra omgången (#645).** Fatimider, Almoravider, Ayyubiderna, Almohader, Kalifatet Córdoba, Första bulgariska riket, Kungariket Polen, Makuria, Kara-Khitan (Cliopatrias `Kara-Khitans`) och Mamluksultanatet, byggda som första omgången (Cliopatria v0.2.1, `source-checked`, svenska namn ur Wikidata, övriga språk med `tools/riken_namn.py`). Kungariket Polen har Cliopatrias Wikidata-id Q577867, som Wikidata daterar 1025–1385 medan Cliopatrias post sträcker sig 962–1449; det spanska namnet "Reino de Polonia (1025-1385)" är kortat till "Reino de Polonia". Danmark väntar: Cliopatrias `Kingdom of Denmark` har Q756617, dagens Danmark. Täckningen av Cliopatrias land stiger från 44 till 55 % år 1000, från 51 till 60 % år 1100 och från 34 till 51 % år 1200.

**Medeltidens luckor, tredje omgången (#645, beslut i docs/beslut/2026-11-07-riken-namn-645.md).** Konungariket Danmark (Cliopatrias `Kingdom of Denmark` 936–1406, Q756617, eget rike bredvid nutidens Danmark), medeltida Sverige som ny första del i gruppen Sverige (stycket om R4 ovan), Tibetanska imperiet, Moskvariket, Storfurstendömet Litauen, Kastilianska kronan och Uiguriska khaganatet, som saknar svenskt namn på Wikidata och har det engelska (Uyghur Khaganate). Svenska namn är Wikidatas svenska etiketter, och tyska, spanska och franska är Wikidatas etiketter för samma id. Väntar: `Tibetans` och `Avar Khaganate`, där Cliopatrias Wikidata-id är en folkgrupp och inte ett rike, och `Yenisei Kyrgyz`, som saknar namn på tre språk.

**Medeltidens luckor, fjärde omgången (#645, DasKrokodils beslut 2026-11-12).** Era of Fragmentation (Cliopatrias `Tibetans`, med Wikidatas Q2065143 i stället för folkgruppen Q187985), Yenisei Kyrgyz (med staten Kyrgyz Khaganate, Q2047076, i stället för folkgruppen Q83142), Rouran Khaganate, Västturkiska och Östturkiska khaganatet (Cliopatrias `Western Göktürks` och `Eastern Göktürks`, som båda pekar på gökturkarna Q205466; här Q874357 och Q2607292), Türgesh, Samanider (`Samanid Empire`), Visigotiska riket, Norra Yuandynastin, Kungariket Alodia och Córdobaemiratet. Saknas svensk etikett på Wikidata används den engelska (Era of Fragmentation, Yenisei Kyrgyz, Rouran Khaganate, Türgesh), och saknas tysk etikett är det tyska namnet det engelska (Era of Fragmentation, Västturkiska och Östturkiska khaganatet). Väntar: `Avar Khaganate`, där Cliopatrias id fortfarande är folkgruppen Avarer. Täckningen av Cliopatrias land stiger från 24 till 44 % år 500, från 28 till 56 % år 600 och från 42 till 60 % år 900.

**Medeltidens luckor, femte omgången (#645).** Suidynastin, Heftaliter (Cliopatrias `White Huns`, som pekar på förgreningssidan Q41761342; här Q26576), Södra Qidynastin, Khazar Khaganate (Cliopatrias `Khazaria`, som pekar på folket khazarer Q173282; här staten Q2090473), Ghuriderna, Jindynastin (jurchenernas, Cliopatrias `Great Jin`, Q5066, grupp-id `jindynastin-jurchen` för att skilja den från den äldre Jindynastin), Qocho, Tulunider, Rustamid dynasty, Hafsiderna och Aghlabider. Khazar Khaganate och Rustamid dynasty saknar svensk etikett på Wikidata och har det engelska namnet. Delen Södra Song (i Songdynastin och som vasall till Jindynastin) har fått tyska, spanska och franska namn ur Wikidata Q1147043; tysk etikett saknas där, så det tyska är det engelska. Täckningen av Cliopatrias land stiger från 44 till 68 % år 500, från 60 till 71 % år 900 och från 59 till 72 % år 1200.

**Medeltidens luckor, sjätte omgången (#645).** Sibirkhanatet (Cliopatrias `Khanate of Sibir`), Rashtrakutariket, Tuyuhun, Vakatakariket, Norra Wei, Kanem-Bornu (`Bornu Empire`), Furstendömet Galizien-Volynien (`Halych-Volhynia occupation`, Q239502), Kungariket Nobatia, Det angevinska riket, Kazakkhanatet och Furstendömet Moldavien (eget id `furstendomet-moldavien`, eftersom `moldavien` är nutidens Moldavien). Tuyuhun saknar svensk och spansk etikett på Wikidata och har det engelska namnet. Cliopatrias spann skiljer sig från Wikidatas på flera håll (till exempel Galizien-Volynien 1056–1240 mot 1199–1349); kartan följer Cliopatria. Väntar: `Tibet` (Cliopatrias Q521263 är "Tibets historia"), `Mongol Khanate` (Q19927420 är en förgreningssida), `Avar Khaganate` (folkgruppen) och `Ostrogothic Kingdom`, där Wikidatas "Ostrogoternas rike" och `INFLUENCE_NAMES` "Östgoternas rike" först behöver samma namn. Täckningen av Cliopatrias land stiger från 68 till 79 % år 500, från 44 till 55 % år 1500 och från 69 till 76 % år 1600.

**Medeltidens luckor, sjunde omgången (#645, DasKrokodils ja 2026-11-13).** Valda med `tools/tackning_riken.py` och provår var 50:e år 500–1500, bland de poster där Cliopatrias Wikidata-id är en stat och har svensk etikett: Rashidunkalifatet, Majapahitriket, Chalukyadynastin, Gurjara-Pratihara, Khanatet Kara-Khanid (Cliopatrias `Kara-Khanids`), Dali (`Kingdom of Dali`), Tughlaqdynastin, Palariket, Xixia (`Western Xia`), Aq Qoyunlu, Nanzhaoriket och Mariniderna (`Marinid Sultanate`). Rashidunkalifatet saknar tysk etikett och har det engelska namnet. Jindynastins vasall Västra Xia får nu namnet Xixia från den nya gruppen, på alla fem språken. Östgoternas rike (Cliopatrias `Ostrogothic Kingdom`, Q583038) har samma svenska namn som i `INFLUENCE_NAMES`, inte Wikidatas "Ostrogoternas rike" (DasKrokodils beslut 2026-11-13). Täckningen av Cliopatrias land stiger från 79 till 84 % år 800, från 74 till 80 % år 900 och från 65 till 71 % år 1000.

**Danmark 1526–1939 (#1084, DasKrokodils ja 2026-11-13).** Cliopatrias `Denmark-Norway` heter så ända till 1939, fast Norge gick till Sverige-Norge 1814. Posten är därför delad i gruppen `konungariket-danmark`: "Danmark-Norge" 1526–1814 (Q62651) och "Danmark" 1815–1939 (Q35). Källorna skiljer sig om början: Cliopatria 1526, Wikidata 1536; kartan följer Cliopatria. 1407–1525 täcks av Kalmarunionen. 1940–1944 räknar Cliopatria området till Tyskland, och eftersom gruppen Tyskland bara visar kärnområdet är Danmark utan rike på kartan de åren (som Norge 1944). Från 1945 gäller gruppen `danmark`.

**Antikens luckor, första omgången (#646, DasKrokodils ja 2026-11-13).** Valda med `tools/tackning_riken.py` bland Cliopatrias poster före 600 där Wikidata-id:t är en stat: Xiongnu, Jindynastin (266–420) (Cliopatrias `Western Jin`, 265–425, med Wikidatas hela Jindynasti Q7352), Kushan (`Kushan Empire`), Satavahana (`Satavahana Dynasty`), Kush (`Kingdom of Kush`), Ptolemaiska riket, Mitanni och De västra regionernas protektorat. Namnen är Wikidatas etiketter, kontrollerade med SPARQL 2026-11-13, med tre undantag: den tidiga Jindynastin har årtalen i namnet på alla språk, eftersom jurchenernas Jindynasti (Q5066, gruppen `jindynastin-jurchen`) har samma namn (årtalen är Wikidatas och Wikipedias, 266–420); protektoratet saknar tysk etikett och har det engelska namnet; och Ptolemaiska riket har Wikidatas spanska alias "Egipto tolemaico", eftersom etiketten "período tolemaico de Egipto" är namnet på en period. Cliopatrias spann skiljer sig från Wikidatas på flera håll (Ptolemaiska riket från 331 f.Kr. mot 305 f.Kr., Mitanni 1500–1241 f.Kr. mot 1650–1260 f.Kr.); kartan följer Cliopatria. **Mellersta riket** (Cliopatrias `Middle Kingdom of Egypt`, 2000–1601 f.Kr., Q191324) ligger i gruppen `egypten` som delen `egyptens-mellersta-rike`, och gruppen heter nu "Egypten: gamla, mellersta och nya riket" (id:t står kvar). Faktarutan har två nya händelser om mellersta rikets början och slut ur Wikipedia; källorna skiljer sig om slutet (cirka 1782, 1700 eller 1650 f.Kr.), och det står öppet. Folkgrupper och civilisationer (tabell B i #646) väntar på ett statsid eller på beslutet i #1300. Täckningen av Cliopatrias land stiger från 8 till 50 % år 1800 f.Kr., från 23 till 45 % år 1000 f.Kr., från 41 till 77 % år 200 f.Kr., från 59 till 81 % år 100 och från 46 till 72 % år 300.

**Medeltidens luckor, åttonde omgången (#645, DasKrokodils ja 2026-11-13).** Fem poster där Cliopatrias Wikidata-id är en stat men saknar svensk etikett (SPARQL 2026-11-13), så det svenska namnet är det engelska enligt beslutet 2026-11-12: Four Oirats (Q4332415), Western Chalukya Empire (Q14624218), Pagan kingdom (Q888574), Rasulid dynasty (Q2132267) och Chola Empire (Q6806806). Western Chalukya Empire och Chola Empire saknar också tysk etikett och har det engelska namnet på tyska. Cliopatrias spann skiljer sig något från Wikidatas (till exempel Chola 850–1259 mot 848–1279 och Rasulid 1236–1458 mot 1229–1454); kartan följer Cliopatria. Cliopatrias `Oirat Confederation` (1619–1676) har samma Wikidata-id som Four Oirats men ligger utanför Wikidatas spann (1399–1628) och väntar. Täckningen av Cliopatrias land stiger från 71 till 75 % år 1000 och från 74 till 78 % år 1100.

**Tyskland 1920–1990 (#1329, DasKrokodils ja 2026-11-13).** Fyra grupper ur Cliopatria: `weimarrepubliken` (`Weimar Republic`, Q41304), `nazityskland` (`Nazi Germany`, Q7318), `vasttyskland` (`Federal Republic of Germany`, Q713750) och `osttyskland` (`German Democratic Republic`, Q16957), med faktarutor på fem språk ur Wikipedia och årtalen jämförda med Wikidata 2026-11-13. Cliopatria har Weimarrepubliken till och med 1935 och Nazityskland från 1936, men Wikipedia och Wikidata låter Nazityskland börja 1933. Delen `nazityskland` är därför Cliopatrias `Nazi Germany` och `Weimar Republic` ihopslagna år för år och klippta till 1933–1944, och `weimarrepubliken` är klippt till 1920–1932 (`years`). Cliopatria saknar Nazityskland 1945 och Förbundsrepubliken 1949; åren 1945–1949 visar ockupationszonerna som delar av USA, Brittiska imperiet, Frankrike och Sovjetunionen. Tre rättningar i grannarna: USA klipper bort Väst- och Östtyskland (`minus`; Cliopatria räknar västra Tyskland till USA 1947–1966), Sovjetunionen delas 1949 och Frankrike (tredje republiken) 1932, annars låg den sovjetiska zonen kvar över DDR till 1952 och Saar i Frankrike till 1939. Avvikelserna står i varje grupps `mapNote`, och nivån är `source-checked` eftersom spannen skiljer sig mellan källorna. Tyska namnet på Västtyskland är "Bundesrepublik Deutschland" i stället för Wikidatas etikett "Bundesrepublik Deutschland bis 1990".

**Amerika före 1429 (#556, luckan ur #1388, 2026-11-13).** Två nya grupper och en ny del ur Cliopatria: `chimor` (Cliopatrias `Chimor` 911–1187 och `Chimu Empire` 1188–1481 ihopslagna till en del, eftersom båda är Q581741 och källorna inte nämner någon brytpunkt), `purepecha` (Cliopatrias `Michoacán` 1305–1533, med Wikidata Q2605410 i stället för Cliopatrias Q79861, som är dagens delstat) och delen `kungariket-cusco` i gruppen `inkariket` (Cliopatrias `Cuzco` 1294–1439, med Q2314963 i stället för staden Q5582862), med egen faktaruta i `polityFacts`. Namnen är Wikidatas etiketter, lästa 2026-11-13. Svensk etikett saknas för alla tre, så det svenska namnet är det engelska: Chimor, Kingdom of Cusco och Purépecha Empire (Wikipedias artikelnamn; Wikidatas engelska etikett är "Tarascan State", ett namn som enligt Wikipedia är impopulärt i de flesta purépechasamhällen). Tysk etikett saknas för Chimor och Purépecha. Faktarutorna finns på fem språk med nivån `source-checked` (Wikipedia och Wikidata; World History Encyclopedia och Britannica gick inte att öppna). Cliopatrias år skiljer sig från källornas (Chimor 911–1481 mot cirka 900–1470, Cusco 1294–1439 mot cirka 1200–1438, Purépecha 1305–1533 mot cirka 1300–1530), och två ytor ligger fel mot källorna: Purépechas yta före 1440 ligger söder om Pátzcuarosjön (huvudstaden Tzintzuntzan 84 km utanför 1305–1428) och staden Cusco ligger 7 km utanför kungarikets yta. Det står öppet i varje `mapNote`; kartan följer Cliopatria. De nya grupperna och `inkariket` förenklas finare (`OVERRIDES`, `DECIMALS`), annars blir de små ytorna fyrhörningar (Cusco avvek 16 % från Cliopatrias yta). **Väntar:** `Olmec Civilization`, `Zapotec Civilization`, `Mayan City-States`, `Later Mayan City-States`, `Classic Veracruz Culture`, `Puebloans`, `Teotihuacan` (Q172613 är en forntida stad, och Wikipedia kallar det omdiskuterat om den styrde en stat) och `Toltec` (Q187897 är ett folk; rikets status är omstridd) är områden som inte är en stat och väntar på formatet i #1300. `Texcoco` väntar eftersom Cliopatrias ytor för Texcoco och Tenochtitlan ser förväxlade ut.

**Andorra och Monaco (#719, Rikards beslut 2026-11-07).** Visas som de små staterna ovan, med `point` och `label` på huvudstaden (Wikidata), men med Cliopatrias årtal: delen har Cliopatria-namnet och dessutom `ne`, som ersätter gränsen med dagens land ur Natural Earth, från året `ne_from` om det finns. Andorra (`Principality of Andorra`, från 1815) har Natural Earths gräns alla år; grannarnas förenklade gränser täckte annars nästan hela landet. Monaco (`Principality of Monaco` och `Kingdom of Monaco` ihopslagna, Q235; 1642–1793, 1814–1939 och från 1945 som i Cliopatria) har Cliopatrias gräns till och med 1847 (164 km²) och Natural Earths från 1848, eftersom Cliopatrias gräns från 1848 ligger väster om Monaco (7,15–7,23° öst, Natural Earth 7,37–7,44° öst). Delen har källorna `cliopatria` och `natural-earth-lander`, och gruppen `borderSource` (`Natural Earth` eller `Cliopatria / Natural Earth`). Därmed finns alla FN:s 193 länder på kartan år 2024.

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

`flags` (valfritt, #462) är en lista med belagda, tidsstyrda flaggor: `file` är en egen, förenklad SVG i `img/flags/`, `from`/`to` är astronomiska år och `sources` samt `review` följer källpolicyn. När en post gäller för året ersätter flaggan medaljen på kartan och visas även i faktarutan; annars används gruppens eller rikets `symbol`. Flaggan får en tunn mässingsram mot den mörka kartan. Ett rike kan ha flera på varandra följande flaggor och kan ha luckor där bara symbolen är belagd. Valfritt `kind` (#1148) säger vad posten är: `flag` (en belagd flagga, standard när fältet saknas), `symbol` (ett emblem, en fältstandar eller ett vapen som riket använde, till exempel Roms vexillum) eller `reconstruction` (en modern återgivning av något belagt). Faktarutan skriver det på en rad under rubriken, och markörens skärmläsartext säger samma sak; ett rike som bara har `symbol` (medaljen) får raden för symbol.

`modernState` (valfritt, #1193) på gruppen märker en nutida stat, alltså en grupp som fortsätter till i dag (`to` 2024). En nutida stats flaggor, också äldre som Kinas femfärgade flagga 1912–1928, syns på kartan bara vid nära zoom (globen från förstoringen där rikesnamnen visas, Platt vy från nivån Inzoomat) och då med namnet under. Utzoomat visas landet som ett rike utan symbol, med namnet. Faktarutan och Fokus visar alltid flaggan, och när man följer landet syns den även utzoomat. Märkningen beskriver vad gruppen är, inte hur den ritas; utan fältet beter sig allt som tidigare. `svenska-stormaktsvaldet` (Sverige 980–2024 med tre kronor) räknas inte som nutida stat. Beslutet: [docs/beslut/2026-11-12-nutida-flaggor-vid-zoom.md](beslut/2026-11-12-nutida-flaggor-vid-zoom.md). `tools/riken.py` behåller `flags` och `modernState`.

```json
"flags": [{ "file": "france-royal-white", "from": 1815, "to": 1829,
  "sources": ["wp-flag-of-france"], "review": "source-checked" }]
```

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

`labelAt` (valfritt, #1189) i en grupp ersätter etikettpunkten (`label`) för de perioder som ligger helt inom `from`–`to`, när den största delen av ytan ger fel bild, till exempel Danmark på Grönland. `at` är en punkt inne i källans yta för riket i landet självt; `null` betyder ingen medalj och inget namn de åren, bara området, när källans yta inte innehåller landet (Norge 1941–1944 är bara Jan Mayen). Beslutet: [docs/beslut/2026-11-12-medaljplats-i-landet.md](beslut/2026-11-12-medaljplats-i-landet.md). `js/model.js` (`loadEmpire`) lägger in platsen när rikesfilen laddas, och `tools/riken.py` behåller fältet.

```json
"labelAt": [{ "polity": "danmark", "from": 1946, "to": 2024, "at": [9.0, 56.3], "sources": ["cliopatria"], "review": "source-checked" }]
```

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

## `spridning.json`: människans spridning (#1094)

Antagna områden och vågor i förhistorien, som lagret Människans spridning (`js/layers/spread.js`) ritar. Allt är **tolkningar av källorna**, aldrig gränser eller vägar (beslutet på #1095, `docs/beslut/2026-11-13-osakerhetens-sprak-forhistoria.md`). Fyndplatserna är vanliga händelser i `handelser/fkr.json`; den här filen innehåller bara det som ligger mellan dem.

- `colors`: färg per grupp (`sapiens`, `neandertalare`, `denisovaner`). Färgen skiljer grupperna åt; formen visar säkerheten.
- `items[]`, en post per område eller våg:
  - `id`, `kind` (`area` eller `wave`), `group`, `certainty`: `tolkning` (antaget område), `hypotes`, `huvudvag`, `mojlig` eller `omstridd`.
  - `start`, `end`, `edtf`: år med astronomisk årsräkning. *X tusen år sedan* skrivs `2001 − 1000 · X`, som för händelserna i förhistorien (till exempel 45 000 år sedan = `-42999`).
  - `places` (område) eller `paths` (våg, en lista per gren). En plats är `{ "event": "<händelse-id>" }` (samma koordinat som händelsens markör) eller `{ "coord": [lon, lat], "wikidata": "Q…", "name": "…" }` med koordinaten ur Wikidata. En plats som saknar Wikidata-id kan i stället ha `coordSource`: id:t för den källa i `sources.json` som anger koordinaten (till exempel Dhaba i Clarkson m.fl. 2020). Platsen ska vara kontrollerad: id:t öppnat och namnet jämfört.
  - `radiusKm` (område): hur långt ut höljet ritas runt varje plats. Ytan blir ett mjukt, konvext hölje och ska aldrig läsas som en gräns.
  - `parts` (område, i stället för `places`): flera listor med platser. Varje del blir ett eget hölje, och delarna ritas som en yta med gemensam ytterkant. Så kan en yta följa en båge (Iberien–Kaukasus–Altaj) utan att täcka det som ligger innanför, till exempel Nordafrika.
  - `clipLand` (område): ytan klipps mot dagens land (`land.json`). Används bara där havet inte har ändrats mycket, eftersom landbryggorna under istiden (#1096) annars skulle klippas bort.
  - Vågornas sträckor ritas längs storcirkeln mellan platserna.
  - `title`, `label` (valfri, kort namn på kartan), `summary`, `note` (valfri, till exempel "Källorna skiljer sig"): texter per språk.
  - `sources` (id i `sources.json`) och `review` som för händelser (`draft` visas inte).
- `scripts/validate-site.py` kontrollerar att källorna och händelserna finns och att varje plats har `event` eller `coord`. `tools/oversattning.py` räknar texterna.

## `upptackt.json`: upptäcktsvyn (#101)

Upptäcktsvyn slås på i Lager. Filen styr allt den visar (ritas av `js/layers/discovery.js`):

```json
{ "schema": "historia-globen/upptackt@2", "notes": "…",
  "perspective": { "sv": "Vyn ser världen från Europa. Dimman är lyft över de europeiska rikena i datan …" },
  "credit": { "sv": "Kartbilder: havsmonster ur Olaus Magnus Carta marina (1539) …" },
  "paper": { "grain": 0.22, "stains": 18, "stainStrength": 0.16, "seed": 1539,
    "waterLines": { "count": 3, "widthDeg": 1.3, "opacity": 0.14 }, "coastPx": 2.4,
    "vignette": 0.45, "vignetteSides": 0.5,
    "rhumb": { "directions": 32, "lengthDeg": 70, "opacity": 0.42, "widthPx": 1.6 } },
  "home": { "regions": [{ "id": "europa", "file": "data/upptackt-europa.json" }], "empires": ["romarriket", "alexanders-rike", "…"], "neighborDeg": 3.5 },
  "knowledge": [{ "id": "nordamerika-1755", "from": 1755,
    "geometry": { "type": "MultiPolygon", "coordinates": ["…"] },
    "sources": ["loc-mitchell-map-1755"], "note": { "sv": "Ungefärlig yta …" } }],
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
| `home.regions` | Regioner som är kända från vyns början och aldrig ligger under dimman (#872): `id` och `file`, en fil med `geometry` (GeoJSON `MultiPolygon`) som laddas första gången vyn slås på. `europa` kommer ur Natural Earth 1:50m (public domain) via `python3 tools/europa_dimma.py <ne_50m_admin_0_countries.geojson> data/upptackt-europa.json`: länder med `CONTINENT = Europe`, utan områden över haven, med Ryssland klippt vid 60° ö.l. (Uralbergen) och utan Turkiet och Kaukasus, som Rom och Alexanders rike lyfter. Filen ligger i listan i `scripts/build-site.sh` |
| `home.empires` | Vyns utgångspunkt i Europa: grupp-id i `data/empires/index.json` för de europeiska rikena. Dimman är lyft över dem för varje period som har börjat |
| `home.neighborDeg` | Hur nära, i grader, ett annat rikes område ska ha legat ett hemrikes område under samma år för att räknas som granne. Då lyfts dimman över grannen från det året (grannarnas grannar räknas inte) |
| `knowledge` | Källbelagda områden av kartografisk kunskap (#1072). Varje post har ett stabilt `id`, `from` och valfritt `to`, en GeoJSON-`geometry` (`Polygon` eller `MultiPolygon`), `sources` med id:n i `sources.json` samt en flerspråkig `note`. Geometrin är en försiktig tolkning av vad den samtida kartkällan återger: den får inte användas som nutida gräns, som ägandeyta eller som ett påstående om vad lokalbefolkningen kände till. Dimman lyfts över området under postens tidsintervall. |
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
- Från 2026-11-06 läggs en ny nyckel i alla fem språkfilerna i samma pull request, och nytt innehåll översätts när det skapas (docs/beslut/2026-11-06-oversatt-samtidigt.md). `tests/i18n.test.mjs` kräver att varje språk har varje nyckel i `sv.json` och `index.html`, också ett språk som är beta, och samma `{platshållare}` (#669). Det kräver också att varje `ui('nyckel')` i `js/` finns i `sv.json` (#1303): en nyckel som bara finns på engelska gav engelska på den svenska sidan, eftersom reserven är engelska och sedan svenska. Nycklar som byggs (`ui(`cat.${id}`)`) och `meta.title` och `meta.description` (bara för andra språk än svenska) kontrolleras inte.
- Sök och följ, fokusraden, uppspelningens fokusknappar och raderna i Lager hämtar sina texter med `ui()` (#671). Flikarna i Sök och följ och gruppernas `title` i `js/controllers/focus.js` har svenska id (`Krig`, `Försvunna länder` …), eftersom fliken sparas i `localStorage`; namnet som visas kommer från `focus.tab.*`. En text med singular och plural är en lista `[en, flera]`, till exempel `time.withinYears`.
- Faktarutan, Samtidigt-listan och Samtidigt-kortet hämtar sina texter med `ui()` (#670): `detail.*`, `story.*` (krigets kort), `facts.*` (rikes- och religionsrutorna), `ff.*` och `panel.*`. Världsdelarna har svenska id i `REGIONS` (`js/model.js`); namnet som visas står i `region.<id>`. `showFacts()` tar `kind` som id (`empire`, `vanished`, `religion`) och visar `facts.kind.<id>`. Rutan "Källorna skiljer sig" känns igen på händelsens svenska `note.title`, så att den syns också när rubriken är översatt.

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

Färdigprojicerade SVG-banor i 4096 × 2048 (`path`, `width`, `height`) från Natural Earth: grundkartan (1:50m) och dagens landsgränser. Grundkartan laddas vid start; dagens gränser först när lagret slås på (#337). `land-10m.json` är samma kustkarta i 1:10m (cirka 5 MB, en decimal): den används bara av det skarpa utsnittet vid inzoomning och laddas första gången det behövs; saknas den används `land.json`. Byggs med `tools/land_10m.mjs`.

## `bildlager.json`: bildlager som rader i Lager med tidsskivor (#54, format 2 i #1325)

`bildlager.json` (`schema: historia-globen/bildlager@2`, `schemas/bildlager.schema.json`) beskriver bilder och vektorer som läggs på kartan efter år. Formatet bestämdes 2026-11-13 ([docs/beslut/2026-11-13-bildlager-v2-format.md](beslut/2026-11-13-bildlager-v2-format.md)) och är bredare än det som är byggt: se "Vad som är byggt" sist i avsnittet.

**En post i `layers` är en rad i Lager.**

| Fält | Krav | Betydelse |
|---|---|---|
| `id` | ja | Små bokstäver, siffror och bindestreck. Blir lagrets id i lagerregistret (`data-layer`, `state.layers`, `l=` i adressen) när raderna är byggda. Får inte vara ett annat lagers id (`LAYERS` i `js/layers/index.js`) eller en annan rads id eller alias. |
| `kind` | ja | `lager`: ritas på lagerbilden ovanpå grundkartan (`Z.images`). `grund`: ersätter grundkartans land under skivans period. `grund` är reserverat för version 8 och läses inte av sidan ännu. |
| `aliases` | nej | Äldre id som ska fortsätta fungera i delade länkar. Nattljuset har `images`, som var lagrets id före formatet. |
| `group` | nej | Gruppen i Lager, ett id ur `groups` i `data/vyer.json`. Saknas fältet används `perspective`. |
| `name` | ja | Radens namn, på alla fem språken. |
| `note` | nej | Förklaringen efter namnet i Lager, på alla fem språken. |
| `label` | ja när `kind` är `grund` | Den synliga märkningen av en växlande grundkarta, på alla fem språken. En grundkarta som inte är dagens ska alltid vara märkt. |
| `slices` | ja, minst en | Tidsskivorna. Inom en rad får perioderna inte överlappa, så högst en skiva gäller ett visst år. |

**En post i `slices` är en bild eller en vektor för en period.**

| Fält | Krav | Betydelse |
|---|---|---|
| `id` | ja | Unikt i hela filen. |
| `title` | nej | Längre namn på skivan, på alla fem språken. |
| `format` | ja | `raster`: en bildfil (jpg, png eller webp). `vektor`: en JSON-fil i samma form som `data/land.json` (`width`, `height` och `path`, färdigprojicerad till 4096 × 2048). Kust och landbryggor ritas som vektor, så att de blir skarpa vid inzoomning. |
| `file` | ja | Sökvägen under `images/` eller `data/`. `scripts/build-site.sh` kopierar filen. |
| `width`, `height` | ja för `raster` | Bildens storlek i bildpunkter. Högst 4096 per sida och högst 4096 × 2048 bildpunkter totalt, eftersom en avkodad bild i den storleken tar cirka 32 MB i minnet. |
| `from`, `to` | `from` ja | Hela år med astronomisk årsräkning. `to` utelämnas när skivan gäller tills vidare (inte `null`). |
| `bounds` | nej, bara `raster` | `[väst, syd, öst, nord]` i grader (WGS 84, samma ordning som en GeoJSON-bbox). Bilden täcker den rutan och ska vara ekvirektangulär inom den; en källkarta i annan projektion projiceras om med ett skript i `tools/` först. Väst är mindre än öst, så en ruta kan inte gå över datumlinjen. Saknas fältet täcker bilden hela världen. |
| `opacity` | nej | 0–1. Saknas fältet ritas skivan helt täckande. |
| `caveat` | nej | En kort text om osäkerheten ("cirka", "tolkning"), på alla fem språken. Osäkerhet visas alltid med text och aldrig bara med färg (#1095). |
| `sources` | ja, minst en | Id i `sources.json`. |
| `review` | ja | `draft`, `source-checked` eller `two-sources`, som för händelser. `draft` visas inte. En forntida kust är ett påstående om hur världen såg ut, så källpolicyn gäller varje skiva. |
| `license` | ja | Licensen som text. Den visas inte på sidan; källans licens står i `sources.json`. |

**Regler som formatet bygger på**

- Allt ritas ekvirektangulärt (arkitekturens punkt 4). Ett `lager` syns därför lika på klotet, i Platt vy och på affischen.
- Ett `lager` kan bara lägga till något ovanpå dagens karta. Där havet stod högre än i dag kan land inte tas bort med ett lager; det kräver `grund`.
- Ritstil för vektorer och en finare fil för det skarpa utsnittet finns inte i formatet. De läggs till när det första vektorlagret byggs (#1096), om de behövs.

**Vad som är byggt (#1325).** Varje rad med `kind: lager` som har minst en rasterskiva som inte är utkast blir en egen rad i Lager, med radens `id` som lager-id (`js/layers/images.js`). Flera rader får vara på samtidigt och ritas i filens ordning ([beslut 2026-11-13](beslut/2026-11-13-flera-bildlager-samtidigt.md)). En skiva med `bounds` ritas i sin ruta, annars över hela världen. Bilden laddas först när raden är på och året ligger i skivans period, och släpps ur minnet när raden stängs av eller året lämnar perioden. I ett tidsintervall visas skivan för slutåret, som för riken. Äldre id i `aliases` översätts när en delad länk läses (`js/controllers/address.js`), och adressen skrivs sedan med det nya id:t. **Inte byggt:** `format: vektor` hoppas över tills ritstilen är bestämd (#1096), och `kind: grund` byggs i version 8 (#397, #51). `caveat` och skivornas källor visas ännu inte på sidan.

**Kontroller.** `scripts/validate-site.py` kör schemat och det schemat inte kan uttrycka: okända fält, upptagna id och alias, gruppen, `label` för `grund`, bildens storlek, `bounds`, perioder som överlappar, och att filer och källor finns. `tests/validate-schema-test.py` godkänner exempelfilen `tests/fixtures/bildlager-exempel.json`, som övar hela formatet, och underkänner avsiktliga fel. `tests/images.test.mjs` kontrollerar urvalet av rader och skivor, rutan för `bounds`, rensningen av bilder och att varje lager i länkarkivet finns kvar, direkt eller som alias.

Första raden är NASA Black Marble 2016 (`nattljus`), från 2016 och framåt.

## `turer/`: guidade turer (#47)

En guidad tur är data, inte kod (Rikards beslut 2026-11-01, docs/beslut/2026-11-01-turformat-47.md). `turer/index.json` (`schema: historia-globen/turer@1`) listar turernas id i menyns ordning (`tours`) och knapparnas texter (`labels`). Turer med `empire` (rikens fall) visas dock sist i menyn, under rubriken `labels.group-fall` (#1280); `labels.locked` är förklaringen att turen styr tiden. Varje tur ligger i `turer/<id>.json` (`schema: historia-globen/tur@1`, `schemas/tour.schema.json`):

- `version` (1), `id` (samma som filnamnet), `title` och valfri `summary` per språk, `review` (`draft` visas aldrig).
- `steps`: stegen i ordning. Varje steg har `id`, `at` (år med astronomisk årsräkning; decimaltal är tillåtet för delar av år, men utanför fokusläget för korta krig visar tidslinjen hela år), `camera` (`lat`, `lon`, `zoom` som globen, 0.8–3.2; Platt vy använder samma mitt), valfri `title`, `text` per språk, `layers` (lagren som är på i steget, id i lagerregistret; de andra lagren som vyerna styr slås av), valfri `open` (en befintlig händelse vars faktaruta öppnas) och `sources` (id i `sources.json`).
- **Källpolicyn gäller varje steg:** texten får bara säga det som stegets källor stöder, och siffror och årtal ska stämma med händelserna. Den första turen (`tre-platser-1325`) säger bara det som redan står i de tre händelserna och deras källor; osäkerhet (`1325~` för Tenochtitlan) skrivs ut ("omkring 1325").
- **Andra världskriget (`andra-varldskriget`, #13):** 14 steg med Europa, Nordafrika och Stilla havet om vartannat, från anfallet på Polen till Japans kapitulation. Varje steg öppnar en befintlig händelse i kriget och har dess källor, och texten säger bara det som står i händelsen. Där källorna skiljer sig om datum (Stalingrad, El Alamein, D-dagen, Tysklands kapitulation; se händelsernas `note`) nämner steget bara det datum som källorna är överens om.
- **Första världskriget (`forsta-varldskriget`, #48):** 14 steg på fyra kontinenter, från skotten i Sarajevo till vapenstilleståndet vid Compiègne. Steget om krigsutbrottet öppnar kriget självt och bygger på krigets `story`. Där källorna skiljer sig om första eller sista dagen (Tannenberg, Marne, Gallipoli, Somme) nämner steget bara det som källorna är överens om.
- **Hur vet vi det här? (`hur-vet-vi-det-har`, #938):** en källkritisk tur på sex steg för elever som har gått ut mellanstadiet, med du-form i alla språk (beslut 2026-11-08). Varje steg öppnar en händelse och tar upp en vanlig missuppfattning ur `data/missuppfattningar.json` (#838): Påskölns moai, vikingarnas hjälmar, Cheopspyramiden, Napoleons längd, Machu Picchu och Marco Polos pasta. Kapitlet är frågan som steget lär ut ("Vem sa det, och när?", "Vem ritade bilden, och varför?") och `question` ställer den till eleven. Texten säger bara det som stegets källor säger; steget om Marco Polo nämner öppet att källorna inte är helt överens om var myten började. Turen har ingen `lesson`.
- **Det här har du hört. Stämmer det? (`det-har-har-du-hort`, #947):** en källkritisk tur på sex steg för gymnasiet, med artigt tilltal i tyska, spanska och franska (beslut 2026-11-08; svenskan skriver "du"). Stegen tar upp sex vanliga missuppfattningar ur `data/missuppfattningar.json`: Washingtons trätänder, Kinesiska muren från rymden, Sfinxens näsa, "Låt dem äta kakor", den platta jorden och El Dorado. Lärdomen är en nivå över `hur-vet-vi-det-har`: hur ett påstående sprids och blir "sanning" (skolböcker, ingen har provat, en känd person får skulden, fel avsändare, en myt i sin tid, en berättelse som växer). Bara steget om den platta jorden öppnar en händelse (`columbus`). De andra visar kartan utan faktaruta, och kameran står på en plats med källa (Federal Hall, muren, Sfinxen, sjön Guatavita; Frankrike i stort för Rousseau). Där källorna skiljer sig säger steget det (året för Rousseaus Bekännelser, 1765 eller 1766), och där en uppgift är okänd säger steget det (om tänderna som Washington köpte av förslavade satt i hans egna proteser). Turen har ingen `lesson`.
- **Berättelseläget (#247, Rikards val A 2026-11-05):** en tur kan ha `war` (krigets händelse-id), och då får krigets första kort knappen "Följ berättelsen". Ett steg kan ha `chapter` (kapitlets namn per språk, visas ovanför rubriken) och `question` (en fråga att fundera på, per språk). Kapitelnamnen beskriver bara vad stegen handlar om. Frågan påstår inget som stegets källor inte säger, och siffror eller datum i den ska stå i stegets eller händelsens källor. Första och andra världskriget har kapitel och frågor.
- **Rikens fall (#499, pilot):** en tur kan ha `empire` (grupp-id i `data/empires/index.json`), och då får rikets faktaruta knappen "Följ fallet". Ett steg kan ha `status` med samma ord som slutkortet (#500): `belagt` ("Det här vet vi från källorna"), `omtvistat` ("Här är forskare inte överens") eller `okant` ("Det här vet vi inte säkert"). Piloten har tre turer: Västromerska riket (`vastroms-fall`), Hanriket (`hanrikets-fall`) och Songhairiket (`songhairikets-fall`). Mayastäderna sparas till uppföljningen #531. Inga röster eller citat hittas på. Där källan bara berättar om eliten säger steget det (Hanriket: ämbetsmännen i Luoyang), och där källan saknar en uppgift får turen ingen rad om den (Hanriket har ingen rad om att forskare är oense, eftersom källan inte säger något sådant). Där källorna anger olika siffror säger steget det öppet (Songhai: arméernas storlek).
  - **Regel för `status` (#1278):** `belagt` betyder att stegets huvudpåstående stöds av de källor som steget anger (de står under Källor i steget) och att de säger samma sak. `omtvistat` betyder att forskare är oense eller att de angivna källorna skiljer sig i det steget handlar om (Västrom: arméns slagkraft före 376; Hanriket: Gula turbanernas förlopp och arméerna vid Röda klipporna; Songhai: arméernas storlek). `okant` betyder att källorna tiger eller att uppgiften saknas (Hanriket och Songhai: hur vanliga människor hade det). Skiljer sig källorna bara i en detalj som steget själv redovisar, till exempel ett datum, står steget kvar som `belagt`. Märkningen säger alltså vad de angivna källorna stöder, inte att alla forskare är eniga.
  - **Kapitelrubriker (#1278):** `chapter` beskriver vad steget handlar om ("Folkvandringen", "Tronföljden") och antyder ingen orsak och ingen fast dramaturgi; rubriker som "Tidiga tecken", "Kris" och "Slutet" används inte (beslutet om #499, 2026-11-06).
  - **Lärarfält (#1279):** de tre turerna har `lesson` för årskurs 7–9 (Lgr22, historia: högkulturer i olika delar av världen, antiken och källkritik; årskurs 4–6 handlar bara om Norden). Lärarnyckeln står i `teacher` som en svarsriktning per fråga, utan facit där källorna inget säger, och avslutas med samma jämförande fråga för alla tre turerna (vad fanns kvar eller kom efter, och vad är källorna oense om). Formatet är oförändrat. Sakuppgifterna i `teacher` kommer ur stegen eller ur källor som stegen anger. Songhai har Källdetektiven om slaget vid Tondibi. Turerna har inget `lock`; lektionsläget döljer bara menyerna.
- **Lektionsturer (#737, skolpiloten):** en tur kan ha `lesson` med lärarfält. `grades` är årskursen (`F-3`, `4-6`, `7-9` eller `gy`), `minutes` lektionens längd (heltal 10–120), `curriculum` en lista med kopplingar till läroplanen (`text` per språk och `sources`, minst en källa, i praktiken Skolverkets kursplan), `teacher` lärarinstruktionen, `exitTicket` frågan eleverna svarar på i slutet och valfri `prerequisites` (förkunskaper). Kopplingen skrivs "kopplad till Lgr22", aldrig "godkänd av Skolverket" (docs/beslut/2026-11-07-lararfalt-i-turer.md). Den första lektionen (#739) är turen om andra världskriget för årskurs 7–9, med kopplingar till Skolverkets kursplan i historia (`skolverket-lgr22-historia`) och turens befintliga frågor. Den andra lektionen (#740) är en ny tur, `vikingatiden-och-varlden`, för årskurs 4–6: nio steg 793–1068 på fem kontinenter, byggda av befintliga händelser och vägar och två nya händelser i Asien (`borobudur-byggs` och `diamantsutran-trycks`). Frågorna handlar om hur vi vet saker (tryck, arkeologi och berättelser som skrevs ner senare). Lärarfälten visas inte i själva turen; de skrivs ut på lärarbladet och elevbladet (#738). **Lektionsläget (#795):** valfritt `lesson.lock` styr länken `#t=<tur-id>&m=lektion`: `years` (`[från, till]`, hela år i astronomisk årsräkning) begränsar tidslinjen och alla stegens `at` ska ligga inom intervallet, `layers` (lista med lager-id) är på hela lektionen och ersätter stegens lager (saknas fältet används stegens lager), och `escape: false` döljer "Visa hela globen" (standard: visas). Intervallet i `years` ska ha synliga händelser från minst två världsdelar, så att låset aldrig ger ett tomt läge (kontrolleras i `tests/tour.test.mjs`). Saknas `lock` döljs bara menyerna och bandet visas. De två lektionerna har `years` (1939–1945 och 793–1068), och andra världskriget låser också lagren (Händelser, Krig, Områden). Frågorna till eleverna är stegens `question`, och samma källpolicy gäller dem. Valfritt `sourceDetective` (#742) är elevuppdraget Källdetektiven: en lista med 1–2 poster `{ event, questions }`, där `event` är en händelse som ett steg i turen öppnar (`open`) och som har en anteckning om källorna (`note.kind`), och `questions` 1–4 frågor per språk. Frågorna frågar bara efter det som anteckningen säger. Lektion 1 använder slaget om Storbritannien (två sätt att räkna slagets längd) och slaget vid Stalingrad (två startdatum).
- **Jämförelser mellan steg** ("samtidigt", "en vecka senare", "medan … pågår") behöver källor för båda leden (källpolicyn punkt 5): steget får då också den andra händelsens källa i `sources`.
- Kontrolleras av `js/tour-format.js` (i webbläsaren och i `tests/tour.test.mjs`), `scripts/validate-site.py` (filer, händelser, källor, schema) och webbläsartestet.

## `uppdrag.json`: elevuppdrag (#741)

`uppdrag.json` (`schema: historia-globen/uppdrag@1`) listar elevuppdragen i `missions`. Ett uppdrag har `id`, `kind` (än så länge bara `hunt`, Samtidighetsjakten), `year`, `window` (år åt varje håll för "nära i tid", 0–100; samma regel som i fun facts, `relationToYear` i `js/samtidighet.js`, #1311), `count` (antal världsdelar, 2–5) och texterna `title`, `task` och `reflection` på alla fem språk. Texterna påstår inga historiska fakta: de beskriver uppgiften och ställer en fråga, och sidan kontrollerar ur händelserna att år och världsdel stämmer. Kontrolleras av `missionProblems()` i `js/uppdrag-rules.js` och `tests/uppdrag.test.mjs`, som också kontrollerar att varje uppdrag går att klara med datan: minst `count` världsdelar har händelser inom åren som syns på globen utan Fokus (`huntCandidates()`; slag och andra händelser i ett krig, `partOf`, räknas inte, eftersom de bara syns i Fokus på kriget).

**Uppdrag knutna till lektion (#1340, beslut 2026-11-13):** valfritt `lesson` är id:t på en lektionstur i `data/turer/` (en tur med `lesson.lock.years`). Uppdraget visas då på den lektionens slutkort och kan bara startas i den lektionen (`fitsLesson()` och `missionsForLesson()` i `js/uppdrag-rules.js`). Testet kräver att hela uppdragets spann (`year ± window`) ligger inom lektionens låsta år, att varje lektion med låsta år har ett uppdrag och att ingen lektion har fler än ett. Ett uppdrag utan `lesson` är det allmänna uppdraget: Samtidighetsjakten under Mer startar det första sådana, och i en lektion utan eget uppdrag visas det på slutkortet när dess år ligger i lektionens år (reserven från #795). Lektion 2 (`vikingatiden-och-varlden`, åk 4–6) har `samtidighetsjakten-ar-1000` (år 1000 ± 50, tre världsdelar, du-form i alla språk) och lektion 1 (`andra-varldskriget`, åk 7–9) `samtidighetsjakten-1945` (år 1945, krigets sista år, med `window` 0: händelsen ska pågå just det året; tre världsdelar, artigt tilltal på tyska, spanska och franska enligt beslutet 2026-11-08 om tilltal). Reglaget är låst i en lektion (tidslåset, #1322), så eleven når bara det som syns på uppdragets år: testet kräver därför också att minst `count` världsdelar har en händelse som pågår uppdragets år. Ett uppdrag med `window` 0 visar ett år ("År 1945", `hunt.year`) och ett eget besked för fel år (`hunt.timeYear`). Lärarfälten i turerna nämner inte uppdraget: kopplingen står bara i `uppdrag.json`, så att den finns på ett ställe.

## `vyer.json`: grupper och förinställda vyer i Lager (#357)

Ingen fakta, bara hur Lager är ordnat. Namnen står per språk som andra texter (`t()`).

- `title`: rubriken över vyerna ("Vy"). `custom`: märket när valen inte stämmer med någon vy ("Anpassad").
- `groups`: grupperna i Lager i menyns ordning, `{ id, name }`. Varje lager anger sin grupp med fältet `group` i sin post i lagerregistret. En grupp med `"settings": true` (Inställningar) innehåller val som vyerna inte rör, till exempel "Behåll mina lager i fokus".
- `views`: de förinställda vyerna i knapparnas ordning, `{ id, name, layers }`. `layers` är id:n (`data-layer`) för lagren som är på i vyn; alla andra lager utanför Inställningar slås av. `defaultView` är id:t på vyn som visas vid ett första besök (nu `oversikt`); en delad länk har alltid företräde. `standard` är den fulla vyn som Återställ använder. `oversikt` har samma lager som `standard` och skiljer sig bara genom urvalet (`tag`): Översikt som startvy får inte stänga av Riken, Samtidigt, vägar eller krig. En vy kan också ha `tag` (#555): då visar händelselagret, Samtidigt och tidslinjens prickar bara händelser med den taggen (fältet `tags`). Ett eget val av lager i Anpassa själv lämnar vyn och visar alla händelser igen.
- `tags`: texterna för varje tagg (#555), `{ framsteg: { label, markLabel, about, empty, none } }`. `label` är märkningen i faktarutan, `markLabel` dess namn för skärmläsare (börjar med `label`), `about` förklaringen, `empty` beskedet när ingen händelse har taggen ännu och `none` när det inte finns någon nära året (`{within}` och `{at}` fylls i).
- Laddas av `loadViews()` i `js/ui/layers.js`. Saknas filen visas Lager som en lista utan grupper och vyer.
