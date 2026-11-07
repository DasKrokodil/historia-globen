# Ordlista och stilregler för översättning till spanska och franska

Skapad 2026-11-07 (#808). Gäller `es` och `fr`; tyskan har egna regler i issuen #776–#806. Regeln i [CLAUDE.md](../CLAUDE.md#språk-översätt-samtidigt-beslut-2026-11-06) gäller som förut: en översättning ändrar aldrig fakta (årtal, siffror, namn, platser, påståenden), och svenskan gäller om språken skiljer sig.

Beslutet om tilltal står i [docs/beslut/2026-11-07-artigt-tilltal.md](beslut/2026-11-07-artigt-tilltal.md).

## 1. Tilltal (beslut Rikard 2026-11-07)

Artigt tilltal i alla språk, så att tyska, spanska och franska är lika:

| Språk | Tilltal | Exempel |
|---|---|---|
| Tyska | `Sie` (stor bokstav) | "Wussten Sie?", "Ziehen Sie …" |
| Spanska | `usted` (verben i tredje person singular, `su`/`sus` för "din") | "¿Sabía que…?", "Arrastre el globo", "Pulse ▶" |
| Franska | `vous` | "Le saviez-vous ?", "Glissez vers le haut" |

- Gäller gränssnittet och alla texter som riktar sig till läsaren (turer, frågor, quiz, uppdrag, lärarfält, hjälptexter).
- Pluralformen (`ustedes`) behövs bara när texten riktar sig till flera, till exempel en klass.
- Uppmaningar skrivs i imperativ för `usted` (spanska: `arrastre`, `elija`, `toque`, `pulse`) och `vous` (franska: `faites glisser`, `choisissez`, `cliquez`).
- Texter som inte tilltalar läsaren (händelser, fakta) skrivs opersonligt, som svenskan.

**Känd avvikelse i dag (rättas i ett eget issue):** gränssnittet använder informellt tilltal i `data/ui/de.json` (`du`), `data/ui/es.json` (`tú`: `arrastra`, `toca`, `elige`, `pulsa`, `puedes`) och i en nyckel i `data/ui/fr.json` (`hunt.region`, `tu`). De ändras till artigt tilltal enligt beslutet.

## 2. Tidsangivelser

| | Spanska | Franska |
|---|---|---|
| f.Kr. | `a. C.` (med mellanrum, "2000 a. C.") | `av. J.-C.` ("2000 av. J.-C.") |
| e.Kr. | `d. C.` (skrivs bara när det behövs för att undvika missförstånd) | `apr. J.-C.` (samma) |
| Århundrade | `siglo XVIII` (romerska versaler) | `XVIIIe siècle` (romerska siffror, `e` upphöjt eller vanlig `e`; `1er` för första) |
| Årtusende | `milenio` | `millénaire` |
| Årtionde | `década de 1960` | `années 1960` |

**Fälla: svenskt "-tal".** "1700-talet" är det 18:e århundradet, "1800-talet" det 19:e. Räkna om, översätt aldrig ordagrant. "1920-talet" är `los años veinte` / `les années 1920`. Kontrolleras särskilt i release-granskningen (beslut 2026-11-07).

- År är alltid utan avgränsare: `1066`, `2999 a. C.`.
- Året 0 finns inte i källorna för oss: använd samma visning som svenskan (se `model.js`).
- Månader skrivs med liten bokstav på båda språken: `14 de julio de 1789`, `14 juillet 1789`.

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
6. Namnen nedan är etablerade former som ska användas direkt, men **granskaren kontrollerar dem mot Wikipedia** när de används första gången i en pull request.

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

## 9. Riken och stater (etablerade former, kontrolleras mot Wikipedia vid första användning)

| Engelska (ur `data/empires/index.json`) | Spanska | Franska |
|---|---|---|
| Roman Kingdom | Reino de Roma | Royaume de Rome |
| Roman Republic | República romana | République romaine |
| Roman Empire | Imperio romano | Empire romain |
| Western Roman Empire | Imperio romano de Occidente | Empire romain d'Occident |
| Eastern Roman Empire | Imperio romano de Oriente | Empire romain d'Orient |
| Byzantine Empire | Imperio bizantino | Empire byzantin |
| Ottoman Empire | Imperio otomano | Empire ottoman |
| Mongol Empire | Imperio mongol | Empire mongol |
| Holy Roman Empire | Sacro Imperio Romano Germánico | Saint-Empire romain germanique |
| Abbasid Caliphate | Califato abasí | Califat abbasside |
| Kingdom of Aksum | Reino de Aksum | Royaume d'Aksoum |
| Empire of Alexander the Great | Imperio de Alejandro Magno | Empire d'Alexandre le Grand |
| Confederate States of America | Estados Confederados de América | États confédérés d'Amérique |
| Kingdom of Prussia / Prussia | Reino de Prusia / Prusia | Royaume de Prusse / Prusse |
| Russian Federation | Federación de Rusia | Fédération de Russie |
| Soviet Union | Unión Soviética | Union soviétique |
| Kalmar Union | Unión de Kalmar | Union de Kalmar |
| Austria-Hungary | Austria-Hungría | Autriche-Hongrie |
| British Empire | Imperio británico | Empire britannique |
| Spanish Empire | Imperio español | Empire espagnol |
| Mughal Empire | Imperio mogol | Empire moghol |
| Inca Empire | Imperio inca | Empire inca |
| Aztec Empire | Imperio azteca | Empire aztèque |
| Mali Empire | Imperio de Malí | Empire du Mali |
| Han dynasty | dinastía Han | dynastie Han |
| Ming dynasty | dinastía Ming | dynastie Ming |
| Qing dynasty | dinastía Qing | dynastie Qing |
| Carthage | Cartago | Carthage |

Riken som inte står här: följ regel 1–5 i avsnitt 4. Lägg till det i tabellen i samma pull request så att nästa omgång använder samma namn.

## 10. Kontrollera innan en pull request öppnas

1. Tilltalet är artigt överallt (avsnitt 1).
2. Alla årtal, siffror och namn är desamma som i svenskan: kör skriptet som jämför siffror och årtal och skriv resultatet i pull requesten.
3. Århundraden är omräknade rätt (avsnitt 2).
4. Namn följer avsnitt 4 och 9; nya termer är tillagda i den här filen.
5. `python3 tools/dela_data.py` och `python3 tools/oversattning.py` är körda, och `node --test 'tests/*.test.mjs'` är grönt.
