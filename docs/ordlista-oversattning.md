# Ordlista och stilregler för översättning

Skapad 2026-11-07 (#808), utökad med engelska och tyska 2026-11-09 (#896). Regeln i [CLAUDE.md](../CLAUDE.md#språk-översätt-samtidigt-beslut-2026-11-06) gäller som förut: en översättning ändrar aldrig fakta (årtal, siffror, namn, platser, påståenden), och svenskan gäller om språken skiljer sig. Reglerna nedan bygger på former som redan används i gränssnittet och innehållet.

Beslutet om tilltal står i [docs/beslut/2026-11-07-artigt-tilltal.md](beslut/2026-11-07-artigt-tilltal.md).

## 1. Tilltal (beslut Rikard 2026-11-07, preciserat 2026-11-08)

**Undantag sedan 2026-11-08:** texter för elever upp till 13 år (Samtidighetsjakten, lektion 2 åk 4–6 och uppdragstexterna) har du-form i alla språk (`du`, `tú`, `tu`). Texter för äldre elever (lektion 1 åk 7–9) och för vuxna läsare har artigt tilltal enligt tabellen. Se [beslutet](beslut/2026-11-08-tilltal-efter-alder.md).

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

**Känd avvikelse i dag (rättas i ett eget issue):** gränssnittet använder informellt tilltal i `data/ui/de.json` (`du`), `data/ui/es.json` (`tú`: `arrastra`, `toca`, `elige`, `pulsa`, `puedes`) och i en nyckel i `data/ui/fr.json` (`hunt.region`, `tu`). De ändras till artigt tilltal enligt beslutet.

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

## 3. Siffror och tecken

- **Tusental** (4 siffror eller fler som mängd, inte som år): spanska och franska har hårt mellanrum eller tunt mellanrum, "4 000 años", "4 000 ans" (som i gränssnittet i dag). Som år utan mellanrum.
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

## 5. Gränssnittets begrepp (finns redan i `data/ui/`, ändras inte)

| Svenska | Engelska | Spanska | Franska |
|---|---|---|---|
| Samtidigt (kortet) | Meanwhile | Al mismo tiempo | Au même moment |
| Fokus | Focus | Enfoque | Focus |
| Fakta | Facts | Datos | Faits |
| Läs mer | Read more | Leer más | Lire la suite |
| Visa / Dölj | Show / Hide | Mostrar / Ocultar | Afficher / Masquer |
| Ordna | Sort | Ordenar | Trier |
| Rensa allt | Clear all | Borrar todo | Tout effacer |
| Bildkort | Picture card | Tarjeta de imagen | Carte illustrée |
| Grafisk symbol | Graphic symbol | Símbolo gráfico | Symbole graphique |
| Visste du att …? | Did you know? | ¿Sabía que…? (artigt) | Le saviez-vous ? |

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
