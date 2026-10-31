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
| Granskning | `review`: `draft`, `source-checked` eller `two-sources`. Se [kallor.md](kallor.md). | `"source-checked"` |

## `events.json`: händelser

```json
{ "id": "korsfastelsen", "category": "religion", "icon": "cross", "religion": "kristendom", "founding": true,
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
| `icon` | Ikonens namn i `img/icons/`, till exempel `swords`, `crown`, `star`, `treaty` (fredsavtal, vapenstillestånd och kapitulationer: dokument med sigill, #242) |
| `kind` | `"war"` för ett krig, med start och slut som spann |
| `partOf` | Krigets id, för slag och andra händelser i ett krig |
| `top` | `true` för krigets enda viktigaste händelse, som syns utzoomat |
| `major` | `true` för krigets stora händelser, där uppspelningen pausar i fokusläget |
| `story` | Krigets berättelse i fokusläget: `intro`, `parties` (lista med `name` och `members`), `outcome`, `casualties` och `sources` |
| `ongoing` | `true` för ett krig som pågår (#223). `edtf` har öppet slut (`"2022-02-24/.."`), och `end` är året då läget senast kontrollerades. Vid laddning flyttar `model.js` fram `end` till innevarande år enligt datorns klocka, så kriget räcker till i dag utan att något årtal står i koden. Tiden visas "2022–pågår". |
| `story.asOf` | För ett pågående krig: datumet (`"2026-10-30"`) då läget i dag och dödssiffrorna senast kontrollerades. `outcome` är då läget i dag, inte hur kriget slutade, och `casualties` skrivs som "hittills, enligt uppskattningar" med datum och vem som har uppskattat. |
| `story.chapters` | Valfritt (#244): krigets kapitel som band över tidslinjen i fokusläget. Lista med `title` (per språk), `from` och `to` (år, som `start` och `end` i händelserna), valfritt `edtf` med datum för korta krig (`"1967-06-05/1967-06-06"`) och `sources` (minst ett id i sources.json). Kapitlen och deras namn ska komma ur källorna, till exempel en indelning i faser som källan själv gör; hitta aldrig på namn. Saknas fältet visas neutrala band mellan krigets stora händelser i stället. Inga krig har fältet än. |
| `religion` och `founding` | Religionens id i `religions.json` och `true` för händelser där religionen grundades. Fokus på religionen börjar där. Ikonen (`icon`) är religionens symbol (`symbol` i `religions.json`, #271), till exempel `cross` för kristendomen. |
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

Ett rike kan bestå av flera delar, till exempel Romarriket med kungadömet, republiken, kejsardömet och Bysans. Varje period har en egen gräns. `label` är platsen där namnet skrivs ut. Filerna byggs med `tools/riken.py` ur Cliopatria. Faktarutorna (`facts`, se nedan), symbolerna (`symbol`) och de egna faktarutorna för enskilda riken (`polityFacts`) skrivs för hand; skriptet läser den befintliga `index.json` och behåller de fälten i varje rike när filen skrivs om (#68, #301).

Medeltidens riken (R3, #69): Umayyad- och abbasidkalifaten, Frankerriket (merovinger och karoliner, Cliopatrias sammanslagna `(Merovingian Empire)` och `(Carolingian Empire)`), Tysk-romerska riket (`(Holy Roman Empire)`), Tang- och Songdynastierna, Khmerriket, Ghanariket, Maliriket, Kievriket och Timuridriket, var och en en egen grupp med faktaruta. Källor: Wikipedia och World History Encyclopedia (NC, bara länkad). Kartdatans avvikelser står i varje rikes `mapNote`, till exempel att Cliopatria saknar abbasidkalifatet 970–1201 och från 1459 bara räknar Tysk-romerska rikets småstater till riket.

Tysk-romerska riket efter 1458 (#336, Rikards val A i #69): Cliopatria räknar från 1459 bara småstaterna till `(Holy Roman Empire)`. Därför bygger `tools/riken.py` ihop riket efter 1458 enligt tabellen `EXTEND` (en post per rike som ska byggas ihop): `polity` (rikets namn i Cliopatria), `after` (sista året med Cliopatrias egen gräns), `border` (rikets gräns ett visst år, här 1458), `outside` (länder som ligger i den gränsen men inte hörde till riket, här Ungern och Tyska ordens Preussen), `add` (Cliopatria-riken med första och sista år som räknas in, till exempel Habsburgarnas länder, Böhmen, Brandenburg och Preussen, Sachsen, Bayern och Hannover) och `remove` (riken som klipps bort från ett visst år, här Schweiz och Förenade Nederländerna från 1648). För varje år där något av rikena ändras läggs rikets egen post och de angivna rikena ihop och klipps mot gränsen; resten (förenkling och sammanslagning av perioder) är som för andra riken. `areaKm2` räknas då ur den byggda gränsen (ytriktig projektion på en sfär). Områden som ett rike utanför listan tar över, till exempel Frankrike, faller bort. Hur kartan är byggd står i rikets `mapNote`.

Tidigmoderna riken (R4, #70): Aztekriket (staden Tenochtitlan och trippelalliansen), Inkariket, Songhairiket, Mogulriket, Safavidriket, Mingdynastin (med Södra Ming), Qingdynastin, Spanska och Portugisiska imperiet (Cliopatrias sammanslagna `(Spanish Empire)` och `(Portuguese Empire)`, moderland och kolonier), Ryssland (tsardömet och kejsardömet), Svenska stormaktsväldet (`Swedish Empire`), Habsburgska riket (`(Habsburg Monarchy)`) och Tokugawa-Japan, var och en en egen grupp med faktaruta. Spanska och portugisiska imperiet och Ryssland förenklas hårdare (`OVERRIDES` i `tools/riken.py`). Källor: Wikipedia, World History Encyclopedia (NC, bara länkad) och Wikidata (start- och slutår). Kartdatans avvikelser står i varje rikes `mapNote`, till exempel att Cliopatria räknar Portugal och dess kolonier till Spanska imperiet 1582–1639 och visar `Swedish Empire` ända till 1814, fast stormaktstiden slutade 1721.

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

`text` säger vad som hände och varför det påverkade utbredningen. Nyckelåren läggs helst där kartan visar en stor förändring av ytan. Osmanska riket, Mongolriket, Hanriket och Brittiska imperiet har 9–10 nyckelår var (#171), Rom 16 och Persiska riket, Makedoniska riket och Mauryariket 7–9 var (#180). Antikens riken (R2, #68) har 5–7 nyckelår var.

```json
{ "year": 1699, "label": { "sv": "1699" }, "title": { "sv": "Freden i Karlowitz" },
  "text": { "sv": "Kriget som började vid Wien slutar med förlust. …" }, "sources": ["wp-ottoman", "wp-karlowitz"],
  "mapNote": { "sv": "Kartan visar bara en liten minskning 1687–1705, några procent." } }
```

`symbol` (valfritt, #301) i en grupp i `empires/index.json` är namnet på rikets symbol, en egen teckning i `img/icons/<symbol>.svg`, som för religionerna (#271). Symbolen ska vara ett emblem som rikets egen tid använde eller som forskningen förknippar med riket, och valet förklaras med källa i faktarutan: en rad `items` med rubriken "Symbolen på kartan", och källan i `facts.sources`. Symbolen står i en mässingsmedalj på rikets `label`-punkt det år man tittar på (ett rike i gruppen i taget, så att till exempel Mongolrikets fyra khanat får var sin), som klickbar 3D-markör ovanpå klotet (`js/layers/empiremarks.js`) och på lagerbilden. Utzoomat på globen syns bara medaljen; vid nära zoom och i Platt vy står rikets namn under den. Pekar man på medaljen visas namnet, och klick öppnar rikets faktaruta. Symbolen står också bredvid färgen i Fokus → Riken och i faktarutans rubrik. Riken utan symbol visas som förut, med namnet på `label`-punkten. `scripts/validate-site.py` kontrollerar att filen finns. Valen: Rom `aquila` (legionsörnen), Akemenidiska riket `eagle-standard` (kungens fältstandar, en gyllene örn med utbredda vingar), Makedoniska riket `vergina-sun` (Verginasolen), Mauryariket `lion-capital` (Ashokas lejonkapitäl, utan hjulet), Mongolriket `sulde` (tug, stången med hästtagel), Osmanska riket `tughra` (sultanens namnteckning), Brittiska imperiet `imperial-crown` (den heraldiska kronan) och Bysantinska riket `double-eagle` (dubbelörnen, i `polityFacts`). Hanriket har ingen symbol, eftersom källorna inte nämner något statsemblem.

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
| `legs` | Etapperna. `from` och `to` är år och får ha decimaler för delar av år (1405,7 ≈ september 1405). `path` är vägen i `[longitud, latitud]` (WGS 84); långa sträckor ritas som storcirklar. `edtf` (valfritt) är etappens tid som text i klickrutan. `uncertain: true` ritas streckat. `places` (valfritt) är platser längs etappen med `at`, `name` och valfria `date` och `edtf` (text, till exempel `"1431-01-19"`, inte ett tal); de ritas inte ännu. `sources` är etappens källor |

Etapper får överlappa i tid (till exempel när en flotta delas); varje pågående etapp får då ett skepp. `scripts/validate-site.py` kontrollerar att filerna i `files` finns och går att läsa, att vägarnas och etappernas källor finns i `sources.json` och att `event` finns i `events.json`.

## `upptackt.json`: upptäcktsvyn (#101)

Upptäcktsvyn slås på i Lager. Filen styr allt den visar (ritas av `js/layers/discovery.js`):

```json
{ "schema": "historia-globen/upptackt@1", "notes": "…",
  "perspective": { "sv": "Dimman döljer det som resorna och vägarna i datan ännu inte har nått …" },
  "credit": { "sv": "Kartbilder: havsmonster ur Olaus Magnus Carta marina (1539) …" },
  "paper": { "grain": 0.22, "stains": 18, "stainStrength": 0.16, "seed": 1539,
    "waterLines": { "count": 3, "widthDeg": 1.3, "opacity": 0.14 }, "coastPx": 2.4,
    "vignette": 0.45, "vignetteSides": 0.5,
    "rhumb": { "directions": 32, "lengthDeg": 70, "opacity": 0.42, "widthPx": 1.6 } },
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

## `land.json` och `borders.json`: kartor

Färdigprojicerade SVG-banor i 4096 × 2048 (`path`, `width`, `height`) från Natural Earth: grundkartan (1:50m) och dagens landsgränser.
