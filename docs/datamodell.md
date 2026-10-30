# Datamodell

Alla datafiler i `data/` och deras fält. Standarderna (årtal, osäkerhet, precision, plats och språk) står också i [CLAUDE.md](../CLAUDE.md#datamodell-och-standarder-beslut-3-6-8). Den här filen uppdateras när ett fält läggs till eller ändras.

## Gemensamma standarder

| Vad | Standard | Exempel |
|---|---|---|
| År | Heltal, astronomisk årsräkning (ISO 8601): `0` = 1 f.Kr., `-1` = 2 f.Kr. *N f.Kr.* blir `1 - N`. | 2600 f.Kr. = `-2599` |
| Osäkerhet | EDTF-sträng i `edtf`: `~` ungefär, `?` osäker, `/` spann, `../` öppen start, `/..` pågår | `"-0005~/-0003~"` |
| Precision | Wikidatas skala i `precision`: 6 årtusende, 7 århundrade, 8 decennium, 9 år, 10 månad, 11 dag | `9` |
| Plats | GeoJSON i WGS 84, `[longitud, latitud]` | `{ "type": "Point", "coordinates": [35.226, 31.779] }` |
| Text | Per språk, svenska först. Saknas ett språk visas engelska, sedan svenska. | `{ "sv": "Jerusalem" }` |
| Källor | Lista med id ur `sources.json` | `["wp-crucifixion"]` |
| Granskning | `review`: `draft`, `source-checked`, `two-sources` eller `human-reviewed`. Se [kallor.md](kallor.md). | `"source-checked"` |

## `events.json`: händelser

```json
{ "id": "korsfastelsen", "category": "religion", "icon": "star", "religion": "kristendom", "founding": true,
  "start": 30, "end": 33, "precision": 9, "edtf": "0030/0033",
  "location": { "type": "Point", "coordinates": [35.226, 31.779] }, "place": { "sv": "Jerusalem" },
  "title": { "sv": "Jesus korsfästs" },
  "summary": { "sv": "Jesus korsfästs i Jerusalem, troligen år 30 eller 33. …" },
  "sources": ["wp-crucifixion", "wp-jerusalem"], "review": "source-checked" }
```

**Obligatoriska fält:** `id` (läsbart och unikt), `category` (en av de tretton kategorierna i `model.js`), `start`, `end`, `precision`, `edtf`, `location`, `place`, `title`, `summary`, `sources` och `review`.

**Valfria fält:**

| Fält | Betydelse |
|---|---|
| `locationPrecision` | `region` eller `country` när platsen är ungefärlig |
| `wikidata` | Q-id, bara om det är kontrollerat eller kommer från en källa vi litar på |
| `icon` | Ikonens namn i `img/icons/`, till exempel `swords`, `crown`, `star` |
| `kind` | `"war"` för ett krig, med start och slut som spann |
| `partOf` | Krigets id, för slag och andra händelser i ett krig |
| `top` | `true` för krigets enda viktigaste händelse, som syns utzoomat |
| `major` | `true` för krigets stora händelser, där uppspelningen pausar i fokusläget |
| `story` | Krigets berättelse i fokusläget: `intro`, `parties` (lista med `name` och `members`), `outcome`, `casualties` och `sources` |
| `ongoing` | `true` för ett krig som pågår (#223). `edtf` har öppet slut (`"2022-02-24/.."`), och `end` är året då läget senast kontrollerades. Vid laddning flyttar `model.js` fram `end` till innevarande år enligt datorns klocka, så kriget räcker till i dag utan att något årtal står i koden. Tiden visas "2022–pågår". |
| `story.asOf` | För ett pågående krig: datumet (`"2026-10-30"`) då läget i dag och dödssiffrorna senast kontrollerades. `outcome` är då läget i dag, inte hur kriget slutade, och `casualties` skrivs som "hittills, enligt uppskattningar" med datum och vem som har uppskattat. |
| `religion` och `founding` | Religionens id i `religions.json` och `true` för händelser där religionen grundades. Fokus på religionen börjar där. |
| `note` | Extra ruta i faktarutan: `title` och `text`, till exempel "Om år 0" |
| `image` | Bild i faktarutan, se nedan |

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

Filerna i `data/utkast/` har samma format som `events.json` (`schema`, `notes`, `events`), men alla händelser har `review: "draft"` och appen läser inte filerna. Ett utkast flyttas till `events.json` när det är källkontrollerat (se [kallor.md](kallor.md#utkast-från-massimport)).

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

```json
{ "id": "wp-crucifixion", "title": "Crucifixion of Jesus – Wikipedia", "url": "https://en.wikipedia.org/wiki/Crucifixion_of_Jesus",
  "license": "CC BY-SA 4.0", "checked": "2026-10-29" }
```

`checked` är datumet då källan senast öppnades och kontrollerades. Id:t `wikidata` är reserverat och länkar till händelsens egen Wikidata-post.

## `empires/`: riken

`empires/index.json` laddas vid start och listar varje rike (grupp):

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

Ett rike kan bestå av flera delar, till exempel Romarriket med kungadömet, republiken, kejsardömet och Bysans. Varje period har en egen gräns. `label` är platsen där namnet skrivs ut. Filerna byggs med `tools/riken.py` ur Cliopatria.

`facts` (valfritt, #170) i `empires/index.json` är faktarutan om riket (gruppen). Formatet är detsamma som för religionernas `facts` (se nedan): `summary`, `items` (när och var det uppstod, hur det slutade, huvudstäder, kända härskare, största utbredning med år, språk och religion), `milestones` (nyckelår med `year`, `label`, `text` på en till tre meningar och egna `sources`; för riken även `title`, `events` och `mapNote`, se nedan), `sources` och `review`. Dessutom `mapNote`, som säger hur källornas årtal skiljer sig från kartdatans spann (`from`/`to` kommer från Cliopatria, #138). `origin` används inte för riken. Rutan visas när man följer riket i Fokus. Alla åtta riken har en.

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

`text` säger vad som hände och varför det påverkade utbredningen. Nyckelåren läggs helst där kartan visar en stor förändring av ytan. Osmanska riket, Mongolriket, Hanriket och Brittiska imperiet har 9–10 nyckelår var (#171), Rom 16 och Persiska riket, Makedoniska riket och Mauryariket 7–9 var (#180).

```json
{ "year": 1699, "label": { "sv": "1699" }, "title": { "sv": "Freden i Karlowitz" },
  "text": { "sv": "Kriget som började vid Wien slutar med förlust. …" }, "sources": ["wp-ottoman", "wp-karlowitz"],
  "mapNote": { "sv": "Kartan visar bara en liten minskning 1687–1705, några procent." } }
```

## `religions.json`: religioner

```json
{ "religions": [{ "id": "kristendom", "name": { "sv": "Kristendom" }, "color": "#6f3fb8",
    "snapshots": [{ "start": 200, "end": 249, "sure": true, "polities": ["Kingdom of Osroene"], "geometry": { … } }] }],
  "polities": [{ "name": "(Anglo-Saxon England)", "wikipedia": "…", "text": "Christianity (from 6th century)",
    "religion": "kristendom", "rule": "enda", "since": 501 }] }
```

- `snapshots` är religionens utbredning som statsreligion eller huvudreligion, sammanslagen per tidsperiod. `sure: false` betyder att flera religioner nämns och att den först nämnda valts. Den visas ljusare med streckad kant.
- `polities` listar varje rike i Cliopatria med faktarutans text, vald religion och regeln som användes. `since` är ett årtal ur faktarutan, och religionen visas först därifrån.
- `facts` (valfritt, #90) är faktarutan om religionen. Den visas när religionslagret slås på, när religionen bockas i igen i undermenyn, med knappen Fakta i undermenyn och när man börjar följa religionen i Fokus. Än så länge har bara kristendomen en.

```json
"facts": { "origin": "korsfastelsen",
  "summary": { "sv": "Kristendomen är en monoteistisk religion …" },
  "items": [{ "label": { "sv": "När och var" }, "text": { "sv": "Under första århundradet e.Kr. …" } }],
  "milestones": [{ "year": 301, "label": { "sv": "301 eller 314" }, "text": { "sv": "Armenien blir först …" }, "sources": ["wp-christianization-armenia"] }],
  "sources": ["wp-christianity", "wp-crucifixion"], "review": "source-checked" }
```

  - `origin` är id för händelsen i `events.json` där religionen uppstod. Där ritas en stjärna i religionens färg på lagerbilden, från händelsens startår, så länge religionen syns i lagret. Platsen står bara i händelsen, inte en gång till här.
  - `items` är rader med rubrik och text (till exempel när och var, grundare, helig skrift, antal troende med årtal). Osäkerhet skrivs ut i texten.
  - `milestones` är nyckelår, till exempel när ett rike gjorde religionen till statsreligion. `year` är astronomiskt år och knappen hoppar dit i tiden; `label` är det som står på knappen och kan visa osäkerhet ("301 eller 314"). Varje nyckelår har egna `sources`.
  - `sources` och `review` fungerar som för händelser. Rutan listar både rutans och nyckelårens källor.

## `religions-polities.json`: rikenas gränser i religionslagret (#194)

```json
{ "schema": "historia-globen/religions-polities@1", "sources": ["cliopatria"],
  "polities": { "Ottoman Empire": [{ "start": 1492, "end": 1501, "geometry": { "type": "MultiPolygon", "coordinates": [ … ] } }] } }
```

- Gränsen för varje enskilt rike som ingår i en ögonblicksbild i `religions.json`, så att klickrutan kan säga vilket rike som låg på platsen. Nyckeln är rikets namn i Cliopatria, samma som i `snapshots[].polities` och `polities[].name` i `religions.json`. Religionen står bara i `religions.json`.
- Varje period är en period i Cliopatria (`start`/`end` oförändrade, astronomiska år). Bara perioder som gällde det år någon ögonblicksbild med riket börjar finns med, det vill säga samma urval som de sammanslagna områdena byggdes av.
- Geometrin är förenklad som i `religions.json` (0,25 grader, avrundad till 0,1 grad, öar under 0,05 kvadratgrader borttagna). Filen är cirka 1,9 MB och laddas först vid det första klicket på ett religionsområde, inte vid start.
- Byggs med `python3 tools/religioner_riken.py <cliopatria.geojson>` efter att `religions.json` är byggd.

## `styles.json`: bildstilar

Tio grundstilar efter tid (`regions` tom) och regionala varianter (`regions` med rutor i grader). Varje stil har `from`, `to`, `frame` (faktarutans ram) och `prompt` (engelsk stilbeskrivning). `variants` väljs efter händelsens kategori, till exempel portolankarta för resor under renässansen. Se `notes` i filen.

## `land.json` och `borders.json`: kartor

Färdigprojicerade SVG-banor i 4096 × 2048 (`path`, `width`, `height`) från Natural Earth: grundkartan (1:50m) och dagens landsgränser.
