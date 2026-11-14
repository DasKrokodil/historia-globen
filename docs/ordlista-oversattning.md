# Ordlista och stilregler för översättning

Skapad 2026-11-07 (#808), utökad med engelska och tyska 2026-11-09 (#896). Regeln i [CLAUDE.md](../CLAUDE.md#språk-översätt-samtidigt-beslut-2026-11-06) gäller som förut: en översättning ändrar aldrig fakta (årtal, siffror, namn, platser, påståenden), och svenskan gäller om språken skiljer sig. Reglerna nedan bygger på former som redan används i gränssnittet och innehållet.

Beslutet om tilltal står i [docs/beslut/2026-11-07-artigt-tilltal.md](beslut/2026-11-07-artigt-tilltal.md).

## 1. Tilltal (beslut Rikard 2026-11-07, preciserat 2026-11-08)

**Undantag sedan 2026-11-08:** texter för elever upp till 13 år (Samtidighetsjakten, lektion 2 åk 4–6, uppdragstexterna och källkritikturen "Hur vet vi det här?" för cirka 12–13 år, [beslut 938](beslut/2026-11-08-tur-kallkritik-938.md) punkt 2) har du-form i alla språk (`du`, `tú`, `tu`). Texter för äldre elever (lektion 1 åk 7–9) och för vuxna läsare har artigt tilltal enligt tabellen. Se [beslutet](beslut/2026-11-08-tilltal-efter-alder.md).

Artigt tilltal i alla språk, så att tyska, spanska och franska är lika:

| Språk | Tilltal | Exempel |
|---|---|---|
| Engelska | ingen särskild artighetsform | "Did you know?", "Drag the globe" |
| Tyska | `Sie` (stor bokstav) | "Wussten Sie?", "Ziehen Sie …" |
| Spanska | `usted` (verben i tredje person singular, `su`/`sus` för "din") | "¿Sabía que…?", "Arrastre el globo", "Pulse ▶" |
| Franska | `vous` | "Le saviez-vous ?", "Glissez vers le haut" |

- Gäller gränssnittet och alla texter som riktar sig till läsaren (turer, frågor, quiz, uppdrag, lärarfält, hjälptexter).
- Pluralformen (`ustedes`) behövs bara när texten riktar sig till flera, till exempel en klass.
- Uppmaningar skrivs i imperativ för `usted` (spanska: `arrastre`, `elija`, `toque`, `pulse`) och `vous` (franska: `faites glisser`, `choisissez`, `cliquez`).
- Texter som inte tilltalar läsaren (händelser, fakta) skrivs opersonligt, som svenskan.

**Rättat (#839, 2026-11-13):** de sista spanska gränssnittstexterna med `tú` (bland annat `meta.title`, `help.s1`, `ff.dragHint` och `search.hint`) har `usted`. Tyskan rättades i #857, och franskan har inget informellt tilltal utanför Samtidighetsjakten. Kvar med du-form i gränssnittet är bara texter för Samtidighetsjakten (`hunt.*`, `theme.huntImpossible`), enligt undantaget ovan. I innehållet har lektion 2, uppdragen och turen `hur-vet-vi-det-har` du-form; turen fick av misstag artigt tilltal i #839 och återställdes 2026-11-13 efter expertgranskningen och DasKrokodils beslut.

## 2. Tidsangivelser

| | Engelska | Tyska | Spanska | Franska |
|---|---|---|
| f.Kr. | `BC` | `v. Chr.` | `a. C.` (med mellanrum, "2000 a. C.") | `av. J.-C.` ("2000 av. J.-C.") |
| e.Kr. | `AD` | `n. Chr.` | `d. C.` (skrivs bara när det behövs för att undvika missförstånd) | `apr. J.-C.` (samma) |
| Århundrade | `18th century` | `18. Jahrhundert` | `siglo XVIII` (romerska versaler) | `XVIIIe siècle` (romerska siffror, `e` upphöjt eller vanlig `e`; `1er` för första) |
| Årtusende | `millennium` | `Jahrtausend` | `milenio` | `millénaire` |
| Årtionde | `the 1960s` | `die 1960er Jahre` | `década de 1960` | `années 1960` |

**Fälla: svenskt "-tal".** "1700-talet" är det 18:e århundradet, "1800-talet" det 19:e. Räkna om, översätt aldrig ordagrant. "1920-talet" är `los años veinte` / `les années 1920`. Kontrolleras särskilt i release-granskningen (beslut 2026-11-07).

- År är alltid utan avgränsare: `1066`, `2999 a. C.`.
- Året 0 finns inte i källorna för oss: använd samma visning som svenskan (se `model.js`).
- Månader skrivs med liten bokstav på båda språken: `14 de julio de 1789`, `14 juillet 1789`.
- **Datum i gränssnittet (#983):** `formatDate` och datum med dagprecision i `formatEventTime` följer språkets datumformat. Tyska har punkt efter dagen (`4. Juli 1776`), spanska har `de` före månad och år. Svenska och engelska behåller dag–månad–år (`4 juli 1776`, `4 July 1776`); franska följer exemplet ovan. `Intl.DateTimeFormat` ger ordningen och skiljetecknen (engelska med `en-GB`); månadsnamnen hämtas fortfarande ur språkfilen och årtalet följer modellens tideräkning. Inga datum i innehållet ändras.

- **Årstider i stoppens datum (#1473):** `stopDate` i `model.js` skriver en årstid ur edtf (`1405-21` till `1405-24`) med nycklarna `time.season.spring|summer|autumn|winter` och `{year}`. Svenska bestämd form (`hösten 1405`), engelska `autumn 1405` (brittiskt), tyska `Herbst 1405` (`Frühjahr` för våren), spanska `otoño de 1405` (alltid med `de`) och franska `automne 1405` (utan artikel). Samma former som i resornas egna etiketter (`dateLabel`) i `data/routes/`.

## 3. Siffror och tecken

- **Tusental** (mängd, inte år): **franska** har hårt mellanrum från fyra siffror, "4 000 ans". **Spanska** har mellanrum först från fem siffror, "4000 años" men "40 000 años" (hårt mellanrum U+00A0, så att talet inte bryts över två rader, #1385), enligt RAE (Diccionario panhispánico de dudas, "números", § 2a; beslut 2026-11-12, [docs/beslut/2026-11-12-spanska-tusental.md](beslut/2026-11-12-spanska-tusental.md)). Som år alltid utan mellanrum.
- **Decimaler** med komma: `3,5 millones`, `3,5 millions`.
- **Citattecken:** spanska `«…»`, franska `« … »` med hårda mellanrum innanför tecknen.
- **Fransk typografi:** hårt mellanrum före `:`, `;`, `?`, `!` och `»`, och efter `«`. Apostrof `’` eller `'` som i gränssnittet; var konsekvent i samma fil.
- **Spanska frågor och utrop:** inledande `¿` och `¡`.
- **Kolon i rubriker:** liten bokstav efter kolon, om inte egennamn.
- **Versaler:** i rubriker och namn följer spanska och franska den inhemska regeln, bara första ordet och egennamn med versal. Alltså `Imperio romano` och `Empire romain`, inte `Imperio Romano` som på tyska och engelska.
- **Enheter:** `km`, `m`, `kg`, `%` som i svenskan; mellanrum före enheten (`12 km`, franska med hårt mellanrum).

## 4. Namn: regler

1. **Använd det etablerade namnet på målspråket** (RAE:s Diccionario panhispánico de dudas, Académie française, eller språkets Wikipedia-titel). Finns inget etablerat namn används originalnamnet. **Hitta aldrig på ett namn.**
2. Namn på riken och dynastier ges med språkets egen versalregel (avsnitt 3).
3. Ortnamn som saknar etablerat namn behåller originalstavningen (inte translittererat på nytt).
4. En term som redan är översatt i en annan fil översätts likadant överallt. Slå upp den här först; saknas den, lägg till den i samma pull request.
5. **Kontrollera ett namn som inte står här** mot Wikipedias artikel på målspråket (länken "språk" från den engelska artikeln) innan det används, och skriv "namn kontrollerat mot Wikipedia" i pull requesten om valet inte är självklart. Wikidata-API:et ger 429 vid många anrop: hämta färre och vänta.
6. **Tabellen i avsnitt 9 är preliminär.** Namnen är förslag som ännu inte är kontrollerade mot en öppnad källa på målspråket, och de får inte kopieras vidare som facit. Den som översätter ett rike kontrollerar namnet mot Wikipedia-artikeln på spanska eller franska (språklänken från den engelska artikeln, eller en källa som Wikipedia hänvisar till), skriver kontrollen i pull requesten och sätter datum och källa i kolumnen "Kontrollerad" i samma pull request. Stämmer inte förslaget rättas raden.

**Kontrollerade namn (#982, 2026-11-12, mot öppnade artiklar på målspråkets Wikipedia):**

| Svenska | Tyska | Franska | Anmärkning |
|---|---|---|---|
| Historiska museet (Statens historiska museum) | Staatliches historisches Museum in Stockholm | Musée historique de Stockholm | de.wikipedia "Staatliches historisches Museum (Schweden)", fr.wikipedia "Musée historique de Stockholm" |
| Norden (de nordiska länderna) | nordische Länder | – | de.wikipedia "Nordische Länder": "Nordische Länder bzw. der Norden". *Norden* betyder oftast "norr" på tyska, och *Nordeuropa* är inte samma sak (kan omfatta Baltikum och Storbritannien) |

## 5. Gränssnittets begrepp (finns redan i `data/ui/`, ändras inte)

| Svenska | Engelska | Spanska | Franska |
|---|---|---|---|
| Samtidigt (kortet) | Meanwhile | Al mismo tiempo | Au même moment |
| Sök och följ (menyn) / följer (läget) | Search and follow / following | Buscar y seguir / siguiendo | Chercher et suivre / vous suivez |
| Fakta | Facts | Datos | Faits |
| Läs mer | Read more | Leer más | Lire la suite |
| Visa / Dölj | Show / Hide | Mostrar / Ocultar | Afficher / Masquer |
| Ordna | Sort | Ordenar | Trier |
| Rensa allt | Clear all | Borrar todo | Tout effacer |
| Bildkort | Picture card | Tarjeta de imagen | Carte illustrée |
| Grafisk symbol | Graphic symbol | Símbolo gráfico | Symbole graphique |
| Visste du att …? | Did you know? | ¿Sabía que…? (artigt) | Le saviez-vous ? |
| Översikt (vy) | Overview | Resumen | Aperçu |
| Upptäcktsresor (vy och lager; inte kategorin) | Voyages of discovery | Viajes de descubrimiento | Grandes découvertes |
| Föregående stopp / Nästa stopp (resa, #1380) | Previous stop / Next stop (de: *Vorherige Station* / *Nächste Station*) | Parada anterior / Parada siguiente | Étape précédente / Étape suivante |
| Historia-globen (produktnamnet) | Historia-globen | Historia-globen | Historia-globen |

**Ordval enligt #1140 (beslut 2026-11-11, [2026-11-11-ordval-1140](beslut/2026-11-11-ordval-1140.md)).** Tyska kolumnen står här eftersom tabellen saknar den: menyn *Suchen und folgen*, läget *folgen* (etikett *Sie folgen*), *Überblick* (vy), *Entdeckungsreisen* (vy och lager), *Wussten Sie?* (kortet och teckenförklaringen). Reglerna:

- **"Fokus" finns inte i gränssnittet.** Menyn heter Sök och följ, läget heter "följer" (verbet från knappen), och texterna säger "när du följer en händelse". Engelska "Focus"/"focus mode", tyska "Fokus"/"Fokusmodus", spanska "Enfoque"/"modo Enfoque" och franska "Focus"/"mode Focus" används inte längre. Filnamn, funktionsnamn, `f=` i adressen och data-attribut får behålla `focus`.
- **Ett namn för upptäcktsvyn:** Upptäcktsresor (se tabellen). Kategorin `upptackter` (avsnitt 6: "Upptäcktsresor", *Viajes de exploración*, *Voyages d'exploration*) är en kategori och ändras inte. "Upptäcktsvyn", "discovery view", "Entdeckungsansicht", "vista de exploración" och "vue d'exploration" används inte.
- **Teckenförklaringens tecken för fun facts** har samma ord som kortet: *Visste du?*, *Did you know?*, *Wussten Sie?*, *¿Sabía que…?*, *Le saviez-vous ?* (inte "samband", *connection*, *Zusammenhang*, *conexión*, *lien*: det som visas är samtidighet, inte orsak och verkan).
- **Produktnamnet "Historia-globen" översätts aldrig**, inte heller på affischen eller i källhänvisningar (`poster.title`, `citation.*`): en källhänvisning ska vara lik det som står på sidan.

## 6. Kategorier (`CATEGORIES`, ur `data/ui/`; ändras inte)

| Id | Svenska | Spanska | Franska |
|---|---|---|---|
| natur | Natur och djur | Naturaleza y animales | Nature et animaux |
| manniskan | Människans ursprung | Orígenes del ser humano | Origines de l'humanité |
| civilisationer | Civilisationer och riken | Civilizaciones e imperios | Civilisations et empires |
| religion | Religion | Religión | Religion |
| vetenskap | Vetenskap och uppfinningar | Ciencia e inventos | Sciences et inventions |
| upptackter | Upptäcktsresor | Viajes de exploración | Voyages d'exploration |
| krig | Krig och konflikter | Guerras y conflictos | Guerres et conflits |
| kultur | Kultur och arkitektur | Cultura y arquitectura | Culture et architecture |
| sport | Sport | Deporte | Sport |
| ekonomi | Ekonomi och handel | Economía y comercio | Économie et commerce |
| halsa | Hälsa och epidemier | Salud y epidemias | Santé et épidémies |
| klimat | Klimat | Clima | Climat |
| katastrofer | Katastrofer | Catástrofes | Catastrophes |
| rymden | Rymden | Espacio | Espace |

## 7. Epoker och begrepp

| Svenska | Spanska | Franska |
|---|---|---|
| stenåldern | Edad de Piedra (Paleolítico, Neolítico) | âge de la pierre (Paléolithique, Néolithique) |
| bronsåldern | Edad del Bronce | âge du bronze |
| järnåldern | Edad del Hierro | âge du fer |
| antiken | Antigüedad | Antiquité |
| medeltiden | Edad Media | Moyen Âge |
| renässansen | Renacimiento | Renaissance |
| upplysningstiden | Ilustración | siècle des Lumières |
| industriella revolutionen | Revolución Industrial | révolution industrielle |
| kalla kriget | Guerra Fría | guerre froide |
| första världskriget | Primera Guerra Mundial | Première Guerre mondiale |
| andra världskriget | Segunda Guerra Mundial | Seconde Guerre mondiale |
| istiden | Edad de Hielo / era glacial | ère glaciaire |
| handelsväg | ruta comercial | route commerciale |
| Sidenvägen | Ruta de la Seda | route de la soie |
| pyramiderna | las pirámides | les pyramides |
| mammutar | mamuts | mammouths |
| rike, imperium | imperio, reino | empire, royaume |
| kejsardöme | imperio | empire |
| kungadöme | reino | royaume |
| dynasti | dinastía | dynastie |
| kalifat | califato | califat |
| republik | república | république |
| union | unión | union |
| förbund, konfederation | confederación | confédération |

Bildstilarnas namn (`data/styles.json`), vyernas namn (`data/vyer.json`) och religionernas namn (`data/religions.json`) översätts i de första omgångarna (#809 och #822) och förs in här i samma pull request.

## 8. Titlar

| Svenska | Spanska | Franska |
|---|---|---|
| kejsare / kejsarinna | emperador / emperatriz | empereur / impératrice |
| kung / drottning | rey / reina | roi / reine |
| tsar | zar | tsar |
| sultan | sultán | sultan |
| kalif | califa | calife |
| farao | faraón | pharaon |
| påve | papa | pape |
| shogun | shogun | shogun |
| president / premiärminister | presidente / primer ministro | président / Premier ministre |

Titel och epitet skrivs med liten bokstav i löpande text (`el rey Luis XIV`, `le roi Louis XIV`), men `Papa` och `Pape` med versal när det står i stället för namnet. Härskarnamn: etablerat namn där det finns (`Luis XIV`, `Louis XIV`, `Carlomagno`, `Charlemagne`, `Alejandro Magno`, `Alexandre le Grand`).

## 9. Riken och stater (preliminära förslag, ännu inte kontrollerade)

| Engelska (ur `data/empires/index.json`) | Spanska | Franska | Kontrollerad |
|---|---|---|---|
| Roman Kingdom | Reino de Roma | Royaume de Rome | – |
| Roman Republic | República romana | République romaine | – |
| Roman Empire | Imperio romano | Empire romain | – |
| Western Roman Empire | Imperio romano de Occidente | Empire romain d'Occident | – |
| Eastern Roman Empire | Imperio romano de Oriente | Empire romain d'Orient | – |
| Byzantine Empire | Imperio bizantino | Empire byzantin | – |
| Ottoman Empire | Imperio otomano | Empire ottoman | – |
| Mongol Empire | Imperio mongol | Empire mongol | – |
| Holy Roman Empire | Sacro Imperio Romano Germánico | Saint-Empire romain germanique | – |
| Abbasid Caliphate | Califato abasí | Califat abbasside | – |
| Kingdom of Aksum | Reino de Aksum | Royaume d'Aksoum | – |
| Empire of Alexander the Great | Imperio de Alejandro Magno | Empire d'Alexandre le Grand | – |
| Confederate States of America | Estados Confederados de América | États confédérés d'Amérique | – |
| Kingdom of Prussia / Prussia | Reino de Prusia / Prusia | Royaume de Prusse / Prusse | – |
| Russian Federation | Federación de Rusia | Fédération de Russie | – |
| Soviet Union | Unión Soviética | Union soviétique | – |
| Kalmar Union | Unión de Kalmar | Union de Kalmar | – |
| Austria-Hungary | Austria-Hungría | Autriche-Hongrie | – |
| British Empire | Imperio británico | Empire britannique | – |
| Spanish Empire | Imperio español | Empire espagnol | – |
| Mughal Empire | Imperio mogol | Empire moghol | – |
| Inca Empire | Imperio inca | Empire inca | – |
| Aztec Empire | Imperio azteca | Empire aztèque | – |
| Mali Empire | Imperio de Malí | Empire du Mali | – |
| Han dynasty | dinastía Han | dynastie Han | – |
| Ming dynasty | dinastía Ming | dynastie Ming | – |
| Qing dynasty | dinastía Qing | dynastie Qing | – |
| Carthage | Cartago | Carthage | – |

Kolumnen "Kontrollerad" är `–` tills någon har öppnat en källa på målspråket och jämfört. Då skrivs datum och källa där (till exempel `2026-11-12, es.wikipedia`). Riken som inte står här: följ regel 1–5 i avsnitt 4. Lägg till det i tabellen i samma pull request så att nästa omgång använder samma namn.


## 10. Kontrollera innan en pull request öppnas

1. Tilltalet är artigt överallt (avsnitt 1).
2. Alla årtal, siffror och namn är desamma som i svenskan: kör skriptet som jämför siffror och årtal och skriv resultatet i pull requesten.
3. Århundraden är omräknade rätt (avsnitt 2).
4. Namn följer avsnitt 4 och 9; nya termer är tillagda i den här filen.
5. `python3 tools/dela_data.py` och `python3 tools/oversattning.py` är körda, och `node --test 'tests/*.test.mjs'` är grönt.

## 11. Engelska och tyska: återkommande termer och typografi (#896)

Formerna nedan är hämtade från `data/ui/en.json`, `data/ui/de.json` och de befintliga innehållsfilerna. De ändras inte här; avvikelser rättas i egna översättningsärenden.

| Svenska | Engelska | Tyska | Exempel i data |
|---|---|---|---|
| rike | empire | Reich | `review.subject.Riket` i `data/ui/en.json` och `de.json` |
| kejsardöme / imperium | empire | Kaiserreich / Imperium | rikesnamn i `data/empires/index.json` |
| kungadöme | kingdom | Königreich | rikesnamn i `data/empires/index.json` |
| krig | war | Krieg | `cat.krig` i `data/ui/en.json` och `de.json` |
| slag | battle | Schlacht | händelse- och rikesfält i `data/handelser/` och `data/empires/` |
| dynasti | dynasty | Dynastie | rikesfält i `data/empires/index.json` |
| kalifat | caliphate | Kalifat | rikesfält i `data/empires/index.json` |

- **Engelska:** använd brittisk datumordning i gränssnittet, som `4 July 1776` (`en-GB` i `formatDate`). Årtal och mängder skrivs utan tusentalsavgränsare när de är år; övriga tal följer den form som redan finns i texten. Använd dubbla engelska citattecken (`“…”`) när nya citat behövs.
- **Tyska:** datum skrivs `4. Juli 1776`; punkt efter dag och tusentalspunkt i mängder (`4.000`), men aldrig i årtal. Använd tyska citattecken (`„…“`) i nya löpande citat. Substantiv skrivs med versal; sammansättningar följer etablerad form i måltexten, inte en ordagrann svensk sammansättning.
- **Namn:** använd etablerat engelskt respektive tyskt namn när ett sådant redan används i datan; annars originalnamnet. Kontrollera ett nytt eller tveksamt namn mot målspråkets etablerade uppslagsverk innan det används och anteckna kontrollen i pull requesten.
- **Tilltal:** engelskan saknar `du`/`Ni`-motsvarighet. I tyska elevtexter till och med 13 år används `du`; i övriga läsartexter `Sie`, enligt avsnitt 1.

### Att kontrollera i kommande översättningsgranskningar

- `data/ui/de.json` innehåller äldre informellt tilltal; det är den kända avvikelsen i avsnitt 1 och ska inte rättas i denna dokumentationsändring.
- Kontrollera "empire" mot "kingdom" och `Reich` mot `Königreich` utifrån objektets etablerade namn; den svenska kategorin *Civilisationer och riken* är inte i sig ett namnval för varje enskilt rike.
- Århundraden får inte översättas som svenska `-tal`: exempelvis blir "1700-talet" `18th century` respektive `18. Jahrhundert`.

## 12. Epokknapparna (#965)

Nya termer i gränssnittet för epokknapparna i intervallformuläret. Tidslinjen heter redan `frise chronologique` i franskan; spanskan och tyskan följer gränssnittet.

| Svenska | Tyska | Spanska | Franska |
|---|---|---|---|
| börjar före tidslinjens början | beginnt vor dem Beginn der Zeitleiste | comienza antes del inicio de la línea de tiempo | commence avant le début de la frise chronologique |
| till i dag | bis heute | hasta hoy | jusqu’à aujourd’hui |

## Gränssnittsenheter (#672)

Tidslinjens kompakta hastighetsenheter följer språkfilen; samma numeriska hastighet och uppspelningslogik används i alla språk.

| Enhet | Svenska | Engelska | Tyska | Spanska | Franska |
|---|---|---|---|---|---|
| År per sekund | år/s | yr/s | J./s | años/s | ans/s |
| Dag, singular/plural | dag/dagar | day/days | Tag/Tage | día/días | jour/jours |
| Kort dagförkortning i mobil | d | d | T | d | j |

## Teckenförklaringen (#1197)

Gränssnittets förklaringar, statusmärken och reservtexter finns i `data/ui/*.json` under `legend.*`.
Religionsnamn behåller datans skrivsätt i översatta meningar, särskilt tyskans versaler.
Förklaringen till ärvda områden använder hela meningar per orsak, så att språkens ordföljd inte styrs av svenska fragment.

| Svenska | Engelska | Tyska | Spanska | Franska |
|---|---|---|---|---|
| teckenförklaring | map key | Zeichenerklärung | leyenda | légende |
| ärvt område | inherited area | übernommenes Gebiet | zona heredada | zone héritée |
| krigsskådeplats | theatre of war | Kriegsschauplatz | teatro de operaciones | théâtre de guerre |

## 13. Förhistoria och tidsangivelser (#1086, underlag för #396 och #11)

Skrivet 2026-11-12. Termerna är kontrollerade mot målspråkets Wikipedia-titel (regel 4.1), via språklänkarna i Wikidata (CC0), som också ger Q-id:t. Det som saknar öppen källa står som **förslag** och ska kvitteras av språkexperterna (`sprak-en`, `sprak-de`, `sprak-es`, `sprak-fr`) innan det används.

### 13.1 Termer

| Svenska | Engelska | Tyska | Spanska | Franska | Wikidata |
|---|---|---|---|---|---|
| stenålder | Stone Age | Steinzeit | Edad de Piedra | âge de la pierre | Q11759 |
| paleolitikum (äldre stenålder) | Palaeolithic (brittisk stavning; Wikipedia-titeln är *Paleolithic*) | Altsteinzeit | Paleolítico | Paléolithique | Q40203 |
| mesolitikum (mellersta stenålder) | Mesolithic | Mittelsteinzeit | Mesolítico | Mésolithique | Q44155 |
| neolitikum (yngre stenålder) | Neolithic | Jungsteinzeit | Neolítico | Néolithique | Q36422 |
| bronsålder | Bronze Age | Bronzezeit | Edad del Bronce | âge du bronze | Q11761 |
| järnålder | Iron Age | Eisenzeit | Edad del Hierro | âge du fer | Q11764 |
| neandertalare | Neanderthals | Neandertaler (samma i singular och plural) | neandertales (artikeltitel: *Homo neanderthalensis*) | Néandertaliens, adjektiv *néandertalien* (artikeltitel: *Homme de Néandertal*) | Q40171 |
| denisovamänniskan, denisovaner | Denisovans | Denisova-Menschen i löptext (artikeltitel: *Denisova-Mensch*) | hombre de Denísova; i löptext förslag *denisovanos* (inte kontrollerat) | Dénisoviens i löptext (artikeltitel: *Homme de Denisova*) | Q151055 |
| *Homo sapiens* | *Homo sapiens* | *Homo sapiens* | *Homo sapiens* | *Homo sapiens* | Q15978631 |
| *Homo floresiensis* | *Homo floresiensis* | *Homo floresiensis* | *Homo floresiensis* | *Homo floresiensis* (artikeltitel: *Homme de Florès*) | Q186266 |
| hominini | hominins | Homininen i löptext (taxon: *Hominini*) | homininos | hominines i löptext (taxon: *Hominini*); **inte** *hominidés*, som är Hominidae och omfattar människoaporna | Q107588 |
| ut ur Afrika (hypotesen) | the Out of Africa model (recent African origin of modern humans) | Out-of-Africa-Theorie | hipótesis del origen africano reciente | origine africaine de l’Homme moderne | Q7478419 |

- **Vetenskapliga artnamn** skrivs i kursiv på alla språk, med versal i släktnamnet och gemen i artnamnet: *Homo sapiens*.
- **Artikeltitel kontra löptext:** spanska och franska Wikipedia har artnamnet eller "l’Homme de …" som titel. I löptext används pluralformen för gruppen (*neandertales*, *Néandertaliens*). Det är ett förslag som `sprak-es` och `sprak-fr` ska kvittera.
- **Svenska stenålder, bronsålder och järnålder** motsvarar *Steinzeit/Bronzezeit/Eisenzeit* och *âge de la pierre/du bronze/du fer* direkt (samma Wikidata-poster). Den tyska skolans *Alt-/Mittel-/Jungsteinzeit* motsvarar paleolitikum, mesolitikum och neolitikum. I Frankrike används oftast *Paléolithique/Mésolithique/Néolithique*. Årtalen skiljer sig mellan regioner, så de anges i datan (`data/perioder.json`), aldrig i ordlistan.
- **"Before Present"** (Q503142) heter *B.P.* på svenska, *Before Present (BP)* på engelska och tyska, *antes del presente* (AP) på spanska och *avant le présent* (AP) på franska. Förkortningen används inte i löptext (nästa avsnitt).
- **Versaler:** spanska skriver tidsåldrarna med versal även i löptext (*la Edad del Bronce*, *el Paleolítico*; ej kontrollerat mot RAE). Franska har versal i substantivet och gemen i adjektivet (*le Paléolithique*, *outils paléolithiques*, *Paléolithique supérieur*). Franska *Néandertal* skrivs med é och utan h.
- **Tyska:** den lärda formen får stå inom parentes första gången, till exempel *Jungsteinzeit (Neolithikum)*.

### 13.2 Tidsangivelser (förslag)

- **Fram till gränsen** (antagande: cirka 10 000 år sedan, avgörs i #1088) används f.Kr. som i avsnitt 2.
- **Efter gränsen**, bakåt i tiden, används "för … år sedan": sv *för 40 000 år sedan*, en *40,000 years ago*, de *vor 40.000 Jahren*, es *hace 40 000 años*, fr *il y a 40 000 ans*. För miljoner: sv *för 2 miljoner år sedan*, en *2 million years ago*, de *vor 2 Millionen Jahren*, es *hace 2 millones de años*, fr *il y a 2 millions d’années*. Under två skriver franskan singular: *il y a 1,8 million d’années*. Decimalkomma på tyska, spanska och franska (*vor 2,5 Millionen Jahren*), decimalpunkt på engelska (*2.5 million years ago*).
- **Inte i löptext:** "BP", "ka", "kyr" eller "Ma". De kan stå i källhänvisningar och i datafält.
- **Spann:** det äldre talet står först, som i källorna. Tankstreck i korta etiketter (*för 48 000–32 000 år sedan*, en *48,000–32,000 years ago*, de *vor 48.000–32.000 Jahren*). I löptext är spanska *hace entre 48 000 y 32 000 años* och franska *il y a 48 000 à 32 000 ans* naturligare.
- **Osäkerhetsord med fast betydelse** (förslag): *cirka* (en *about*, de *etwa*, utskrivet och inte *ca.*, es *unos/unas* böjt efter genus, fr *environ* framför mängder och *vers* framför årtal med f.Kr.) för ett ungefärligt tal; *troligen* (*probably*, *wahrscheinlich*, *probablemente*, *probablement*) när källan bedömer det sannolikt; *kanske* eller *möjligen* (*possibly*, *möglicherweise* och inte *vielleicht*, *posiblemente*, *peut-être*) när källan bara håller det för möjligt. Orden används inte omväxlande; de följer källans grad av säkerhet.

### 13.3 Siffror i stora tal (spanska)

- **Dagens regel** (avsnitt 3) ger mellanrum från fyra siffror i spanska och franska mängder ("4 000 años").
- **RAE (kontrollerat 2026-11-12, i andra hand):** Diccionario panhispánico de dudas, "números", § 2a, citerat ordagrant i spanska Wikipedia ("Separador decimal", med länk till DPD): *"Al escribir números de más de cuatro cifras, se agruparán estas de tres en tres, empezando por la derecha, y separando los grupos por espacios en blanco y no por puntos o comas"*. Mellanrum alltså **från fem siffror**: *4000 años*, *40 000 años*. Ortografía de la lengua española (samma artikel) säger att bara ett litet mellanrum är tillåtet, varken punkt eller komma. RAE:s egen webbplats stoppar automatiska besök (403), så sidan är inte läst direkt.
- **Innehållet blandar i dag formerna** (2 fall med mellanrum och 3 utan, i `data/handelser/` och `data/funfacts.json`, mätt av `sprak-es`); `data/ui/es.json` har inga sådana tal.
- **Beslut 2026-11-12 (DasKrokodil i #1245):** regeln i avsnitt 3 är ändrad för spanska till mellanrum från fem siffror, och de två fallen i innehållet är rättade. Franskan behåller sin regel.
- *mil millones* gäller oavsett (inte *billón*), och *2000 millones* hellre än *2 mil millones*.
- **Franska:** tusentalsavgränsaren är hårt mellanrum U+00A0, som i `data/ui/fr.json` (inte tunt U+202F).
- **Tyska i Schweiz:** den gemensamma formen *40.000* används medvetet, inte schweiziska *40'000* (antagande: ingen egen variant behövs).

### 13.4 Känsliga formuleringar

- **Inget "ras"** om människogrupper: sv *befolkningar* eller *grupper*, en *populations*, de *Populationen* eller *Gruppen* (inte *Bevölkerungen*, som låter som folkmängd), es *poblaciones* eller *grupos*, fr *populations*.
- **Inget "primitiv"** om neandertalare eller andra arter (en *primitive*, de *primitiv*, *Urmensch*, *Höhlenmensch*, es *primitivo*, fr *primitif*). Skriv vad källan säger att de gjorde. Spanska skriver *seres humanos* hellre än generiskt *el hombre*.
- **Ingen stege:** arterna beskrivs inte som steg mot *Homo sapiens* (inte en *ladder*, *more evolved*, de *Vorstufe des Menschen*, *Bindeglied*). Flera arter levde samtidigt.
- **Osäkerhet visas öppet**, med orden i 13.2 och med "Källorna skiljer sig" där de gör det (källpolicyn, punkt 4 och 6). Franska: *Les sources divergent* överallt (i dag finns också *Les sources diffèrent* i `data/ui/fr.json`).

**Granskat 2026-11-12** av `sprak-en`, `sprak-de`, `sprak-es` och `sprak-fr` (synpunkterna är införda). RAE-regeln i 13.3 är kontrollerad i andra hand (DPD citerad i spanska Wikipedia); spanskans *denisovanos* är inte kontrollerad.

## 14. Religioner på franska (#822)

Namnen i `data/religions.json` följer den franska regeln med liten bokstav i adjektiv och versal bara i första ordet och egennamn. Profeten skrivs med det etablerade franska namnet *Mahomet* och flykten till Medina *l’hégire* (som i franska Wikipedia).

| Svenska | Franska |
|---|---|
| kristendom | christianisme |
| islam | islam |
| judendom | judaïsme |
| zoroastrism | zoroastrisme |
| manikeism | manichéisme |
| buddhism | bouddhisme |
| hinduism | hindouisme |
| jainism | jaïnisme |
| sikhism | sikhisme |
| kinesisk religion (konfucianism, daoism) | religion chinoise (confucianisme, taoïsme) |
| tengrism | tengrisme |
| fornegyptisk religion | religion de l’Égypte antique |
| traditionell afrikansk religion | religion traditionnelle africaine |
| Nyckelår (rubrik i faktarutan) | Années clés |

## 15. Religioner på spanska (#809)

Profeten skrivs *Mahoma* och flykten till Medina *la hégira* (etablerade spanska former). Sikhernas gurur skrivs *Guru Nanak*, *Guru Arjan* och *Guru Gobind Singh* utan accent, som i händelsedatan, men substantivet är *gurú*. Svenskans "miljarder" skrivs som *millones* (2,3 miljarder = *2300 millones*), eftersom *millardo* sällan används.

| Svenska | Spanska |
|---|---|
| kristendom | cristianismo |
| judendom | judaísmo |
| buddhism | budismo |
| hinduism | hinduismo |
| sikhism | sijismo |
| shinto | sintoísmo |
| kinesisk religion (konfucianism, daoism) | religión china (confucianismo, taoísmo) |
| Nyckelår (rubrik i faktarutan) | Años clave |

## 16. Språkfynd ur expertgranskningen v6.3.0 (#1385)

Rättat 2026-11-14 efter [expertgranskningen före v6.3.0](granskningar/2026-11-13-expertgranskning-v6-3-0.md). Formerna gäller från nu i nya och ändrade texter.

| Svenska | Engelska | Tyska | Spanska | Franska |
|---|---|---|---|---|
| söva (före en operation) | *anaesthetise* (inte *put to sleep*, som också betyder avliva) | – | – | – |
| Källorna skiljer sig | The sources differ | – | *Las fuentes difieren* (inte *Las fuentes no coinciden*) | *Les sources divergent* (13.4) |
| Om tiden (rubrik i en anteckning om datering) | About the time | *Zur Datierung* (inte *Zur Zeit*, som betyder "för närvarande") | – | – |
| folkvandringstiden, folkvandringen | – | *Völkerwanderung* | – | – |
| lager (i Lager-menyn och teckenförklaringen) | layer | Ebene | capa | *calque* överallt (inte *couche*; *couche* får stå om jordlager i händelsetexter) |
| inom {tid} från {år} | within {time} of {year} | – | – | *à moins de {within} de {at}* (inte *dans un rayon de*, som är ett avstånd) |
| flaggetikett | – | *Flagge von Niger*, *Flagge von Mali*, *Flagge von Benin* (som *Flagge von Sierra Leone*) | – | – |
| Licens: public domain (bildtext) | – | – | *Licencia: dominio público* | – |
| Lgr22, årskurs 7–9 | Lgr22 (the Swedish compulsory school curriculum), years 7–9 | – | – | *Lgr22 (le programme suédois de l'école obligatoire)*, *classes 7 à 9 (numérotation suédoise)* första gången i en text |

**Rikesnamn (kontrollerade 2026-11-14 mot öppnade artiklar på målspråkets Wikipedia):**

| Svenska | Tyska | Spanska | Franska | Anmärkning |
|---|---|---|---|---|
| Xixia (Västra Xia) | *Westliche Xia* (inte *Tanguten*, som är folket, eller *Westlich-Xia*); i löptext *die Westliche Xia*, *der Westlichen Xia* | – | – | de.wikipedia "Westliche Xia-Dynastie": "Das Reich der Westlichen Xia-Dynastie", "Geschichte der Westlichen Xia" |
| Heftaliter | – | *Heftalitas* | *Hephtalites* | es.wikipedia "Heftalita" (omdirigering från *Heftalitas*); fr.wikipedia "Shvetahûna" (omdirigering från *Hephtalites*, i texten "Ephthalites ou Hephthalites") |
| Aghlabider | – | *Aglabíes* | – | es.wikipedia "Aglabí" (omdirigering från *Aglabíes*, i texten "Los aglabíes") |
| Egyptens gamla rike | *Altes Reich* | – | *Ancien Empire* | utan "von Ägypten" och "de l'Égypte": riket står redan i gruppen Egypten |
| Norra Yuan | *Nördliche Yuan-Dynastie* (bindestreck) | – | – | |

- **Versal i spanska och franska rikesnamn:** första ordet får versal även när det är ett vanligt substantiv (*Reino visigodo*, *Dinastía Sui*, *Royaume de France*, *Dynastie Liao*), övriga ord följer avsnitt 3 (*Royaume ouïghour de Qocho*). Årtal hör inte till namnet (*Royaume de Norvège*, inte *royaume de Norvège (872-1397)*).

## 17. Land, rike, stat, nation, plats och tema (#1266)

Definitionerna står i [docs/produkt/13-ordlista.md](produkt/13-ordlista.md) ("Land, rike, stat, nation, plats och tema"). Tabellen ger ordet på varje språk. Där gränssnittet redan har ett ord står nyckeln, och ordet ändras inte här; ändringar görs i egna ärenden. Tilltalet följer avsnitt 1 (artigt, utom i texter för elever till och med 13 år).

| Svenska | Engelska | Tyska | Spanska | Franska | I `data/ui/` |
|---|---|---|---|---|---|
| plats (samlingsordet, gruppen) | place, Places | Ort, Orte (i dag; se fråga 1 nedan) | lugar, Lugares | lieu, Lieux | `place.label`, `focus.tab.places` |
| land | country | Land | país | pays | `place.type.country`, `review.subject.Landet` |
| försvunnet land | former country (fliken: Vanished countries) | ehemaliges Land (fliken: Verschwundene Länder) | país desaparecido | pays disparu | `facts.kind.vanished`, `focus.tab.vanished` |
| självstyrt område | autonomous territory | autonomes Gebiet | territorio autónomo | territoire autonome | `place.type.autonomous` |
| rike | empire | Reich | imperio | empire | `facts.kind.empire`, `layer.areas` (se avsnitt 7, 9 och 11) |
| stat | state | Staat | Estado | État | inget eget ord i gränssnittet |
| nation | nation | Nation | nación | nation | inget eget ord i gränssnittet |
| region (= världsdel) | continent | Kontinent | continente | continent | `region.<id>`, `hunt.progress`, `legend.continentNote` |
| tema | theme | Thema | tema | thème | `theme.label`, `focus.tab.themes` |

- **Land är inte rike på något språk.** *Country/Land/país/pays* är dagens land med dagens gräns; *empire/Reich/imperio/empire* är rikets historiska gräns. Översätt aldrig "landet" med *empire* eller *Reich*, eller "riket" med *country*.
- **Stat och nation används inte som synonymer till land.** *Nation*, *nación* och franska *nation* betyder folket, inte området. Delstaterna i USA heter *estados* respektive *États* (avsnitt 17.1).
- **Region** översätts inte med *region*, *Region*, *región* eller *région*, eftersom det på målspråken oftast betyder en del av ett land. Gränssnittet säger redan *continent*, *Kontinent*, *continente* och *continent*.

### 17.1 Platstyper (för kommande platser; läggs i `place.type.<typ>` när typen byggs)

Förslag till typer som ännu inte finns i datan. Kolumnen "Kontrollerad" anger öppnad källa; rader med `–` kontrolleras mot målspråkets Wikipedia när typen byggs (avsnitt 4, regel 5).

| Svenska | Engelska | Tyska | Spanska | Franska | Kontrollerad |
|---|---|---|---|---|---|
| landskap (Sverige) | province (på kortet: Province) | Landschaft (historische Provinz) | provincia histórica | province historique | de: 2026-11-14, de.wikipedia "Landskap (Schweden)": "Landskap ist die schwedische Bezeichnung für eine historische Provinz"; aldrig *Provinz* ensamt, eftersom de.wikipedia "Provinz (Schweden)" leder till *Län*. en: 2026-11-14, en.wikipedia "Provinces of Sweden" ("The 25 provinces of Sweden are historical, geographical and cultural regions"); es: 2026-11-14, es.wikipedia "Escania" ("la provincia histórica o comarca (landskap) más meridional de Suecia"); fr: 2026-11-14, fr.wikipedia "Scanie" ("une province historique en Suède"). Byggd i `place.type.landskap` (#1159) |
| län (Sverige; Skåne län) | county (Skåne County) | Län (Skåne län) | provincia (*provincia de Escania*) | comté (*comté de Scanie*) | es: 2026-11-14, es.wikipedia "Provincia de Escania" ("una de las 21 provincias administrativas que conforman Suecia"); fr: 2026-11-14, fr.wikipedia "Comté de Scanie" ("Skåne län en suédois"); samma namn som i händelsen `skane-lan-bildas` (#1159). På spanska skiljs länet (*provincia de Escania*) från landskapet (*provincia histórica*, `place.type.landskap`); skriv aldrig *condado de Skåne* eller *comté de Skåne*. en och de: Natural Earth och de.wikipedia, inte kontrollerade här |
| Bundesland (Tyskland, Österrike) | – | Land / Bundesland | – | – | de: 2026-11-14, de.wikipedia "Land (Deutschland)": *Land* är den officiella termen, "im allgemeinen Sprachgebrauch oft auch Bundesland genannt"; Österrike är inte kontrollerat. På kortet *Bundesland*, inte *Land*, eftersom *Land* redan är typen för ett land (`place.type.country`) |
| kanton (Schweiz) | – | Kanton | – | – | de: 2026-11-14, de.wikipedia "Schweiz": "26 teilsouveränen Kantonen" |
| delstat (USA) | state | Bundesstaat (på kortet: US-Bundesstaat, förslag från `sprak-de`) | estado | État | de: 2026-11-14, de.wikipedia "Vereinigte Staaten" ("50 Bundesstaaten"); es: es.wikipedia "Estados Unidos" ("cincuenta estados"); fr: fr.wikipedia "États-Unis" ("cinquante États"); en: – |

### 17.2 Landsnamn med artikel och preposition

Mallen `place.typeOf` ("{type} i {of}") sätter landets namn efter en fast preposition: *in* (en, de) och *en* (es, fr). Det fungerar för namn utan artikel, men inte för alla länder:

| Språk | Fungerar | Fungerar inte (exempel, kontrollerade 2026-11-14) |
|---|---|---|
| Tyska | *in Schweden*, *in Dänemark*, *in Neuseeland* | *in der Schweiz* (de.wikipedia "Schweiz": "Die Schweiz …"), *in den USA* / *in den Vereinigten Staaten* (de.wikipedia "Vereinigte Staaten": "Die Vereinigten Staaten von Amerika", förkortat USA) |
| Franska | *en Suède* (femininum) | *au Danemark* (fr.wikipedia "Danemark": "Le Danemark …"), *aux États-Unis* (fr.wikipedia "États-Unis": "Les États-Unis …") |
| Engelska | *in Sweden*, *in Denmark* | *in the United States* (artikeln *the* behövs) |
| Spanska | *en Suecia*, *en Estados Unidos* (es.wikipedia "Estados Unidos" skriver namnet utan *los*) | – |

Skåne (#1159) är den första platsen med `partOf` (Sverige), och där fungerar mallen på alla fem språk (*Landskap i Sverige*, *Province in Sweden*, *Landschaft in Schweden*, *Provincia histórica en Suecia*, *Province historique en Suède*), så felet syns inte ännu. Det blir synligt när en plats inom ett land med artikel byggs (en kanton, en amerikansk delstat, eller Grönland "i Danmarks rike" på franska). Då behöver landsnamnet kunna lagras **med preposition och artikel per språk**; bygget är ett eget issue (#1479, väntar på beslut). Tills dess: skriv aldrig ihop en sådan fras i en översättning för hand.

### 17.3 Öppna frågor (ändras inte i #1266)

1. **Tyska samlingsordet: *Orte* eller *Gebiete*?** `sprak-de` föreslog *Gebiete* (planeringen i `docs/granskningar/2026-11-12-planering-regionhistoria.md`, punkt 11). Att tänka på före beslutet: *Gebiet* används redan i `data/ui/de.json` för andra områden (krigsområdet i `legend.warNote`, religionens område i `pop.religion`, Människans spridning i `layer.spreadNote` och typen *Autonomes Gebiet*), så ett kort om Grönland skulle få rubriken *Gebiet* och typen *Autonomes Gebiet*. Ändras det berörs `focus.tab.places` (*Orte*), `place.label` (*Ort*) och de övriga `place.*`-texterna med *Ort* i `data/ui/de.json`. Avgörs av DasKrokodil efter granskning av `sprak-de`.
2. **Neuseeland/Aotearoa:** datan skriver *Neuseeland (Aotearoa)*, och de.wikipedia "Neuseeland" ger *Aotearoa* som maoriskt namn i inledningen. Ingen ändring behövs; samma mönster gäller de andra språken i `data/platser.json`.
