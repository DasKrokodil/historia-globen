# Oberoende granskning inför release v6.1.0 (2026-11-08)

Granskare: Claude Code (DasKrokodil), i stället för Codex den här gången. Jag har inte byggt något av det som granskas. Underlaget [2026-11-08-release-6-1-0.md](https://github.com/DasKrokodil/historia-globen/blob/claude/lucid-mccarthy-vk1oyj/docs/granskningar/2026-11-08-release-6-1-0.md) (skrivet av agenten som byggde epokerna, finns bara på grenen `claude/lucid-mccarthy-vk1oyj`) har lästs men inte tagits för givet: allt nedan är prövat på nytt.

Granskat: `main` på `cf96922` (PR #970 inräknad), jämfört med taggen `v6.0.0`. Rapporten ändrar inga filer i `data/`, `js/`, `css/` eller annan dokumentation. Fynden rättas av någon annan.

## Sammanfattning

**Inte redo att släppas än.** Skäl, i ordning:

1. **Webbläsartestet är rött på `main`.** Körningen efter #970 ([Actions 42511930701](https://github.com/DasKrokodil/historia-globen/actions/runs/42511930701)) misslyckades. Testet väntar sig tre epokgrupper i intervallformuläret (`tests/webblasare.mjs`, rad 3369: `[[5],[3],[1]]`), men sidan har fyra sedan industrialiseringen kom till i #970. Underlaget säger att main är "grön" i sina kontroller, men det gäller bara `node --test` och bygget, inte webbläsartestet. Reglerna säger att main ska vara grön före release-PR:en.
2. **Knappen "Visa intervallet" går inte att nå med musen på datorn** (fel UX-1 nedan). Formuläret börjar 150 px ner och är `100vh − 100px` högt, så nederkanten ligger 50 px under skärmen. Det gäller både 1280 × 800 och 1280 × 650. Med tangentbordet (Enter) fungerar det.
3. **Samtidigt-märket och intervallraden visar olika antal** (fel UX-2). Det beror på en händelse som pågått länge och som i intervalläget räknas som "1 till inom ±0 år".

Del 1 (språket): **inga Fel** i översättningarna av epokerna, gränssnittet, Om urvalet, Källdetektivens anteckningar eller turerna. Det finns fem Noteringar. Stickproven mot källorna (14 texter) stämde, och epokernas årtal stämmer med Skolverket, Historiska museet, Wikipedia och Wikidata.
Del 2 (UX): 3 fel och 9 fynd (rangordnade nedan), 9 förslag på issues och 5 förslag på teständringar.

Före release: rätta punkt 1 och 2 (helst 3), kör webbläsartestet grönt i Chromium, Firefox och WebKit och gör UX-genomgången på dev.historiagloben.se, som jag inte kunde nå.

## Del 1: Språkgranskning

Omfång: `git diff v6.0.0..origin/main -- data/ui data/perioder.json data/turer data/oversattning.json data/genererat`. Det är 57 ändrade gränssnittsnycklar i fem språk, `data/perioder.json` (4 indelningar, 10 perioder, 3 noter), turen `hur-vet-vi-det-har` (ny), två steg i `andra-varldskriget` och Källdetektivens anteckningar på slaget om Storbritannien och slaget vid Stalingrad (`data/genererat/handelser.{de,es,fr}.json`, PR #910). Alla nycklar lästes sida vid sida i sv, en, de, es och fr.

### Fel

Inga verifierbara fel hittades i tidsangivelser, namn, siffror eller tilltal i de nya eller ändrade översättningarna.

- **(a) Tidsangivelser:** Wikidatas "8th century BC – 3rd century" är rätt omräknat i alla språk: sv "700-talet f.Kr.–200-talet e.Kr.", de "8. Jahrhundert v. Chr. … 3. Jahrhundert n. Chr.", es "siglo VIII a. C. … siglo III d. C.", fr "VIIIe siècle av. J.-C. … IIIe siècle apr. J.-C." (`data/perioder.json` rad 224–228). f.Kr./e.Kr. följer ordlistan (`a. C.`/`d. C.`, `av. J.-C.`/`apr. J.-C.`). Inga "-tal" är översatta ordagrant.
- **(b) Namn:** Epoknamnen följer ordlistans avsnitt 7 (`Edad del Bronce`, `âge du fer`, `Antigüedad`, `Antiquité`). Stalingrad, Volga/Wolga, Guadalcanal och Blitz har etablerade former.
- **(c) Siffror och tilltal:** Alla årtal och siffror är desamma som i svenskan (kontrollerat för perioder, noter, turstegen och `range.*`/`place.*`). Gränssnittet har artigt tilltal (`Sie`, `usted`, `vous`). Turen "Hur vet vi det här?" har du-form i de, es och fr. Det stämmer med beslutet, eftersom turen riktar sig till elever kring 12–13 år (`docs/beslut/2026-11-08-tur-kallkritik-938.md`, `docs/datamodell.md` rad 658).

### Noteringar

| # | Fil och rad | Original | Översättning | Förslag |
|---|---|---|---|---|
| N1 | `data/perioder.json` 119–121 | "Historiska museet" | de "Historisches Museum Schwedens", fr "Musée d’histoire de Suède" | Ordlistan, avsnitt 4.1, säger "etablerat namn (språkets Wikipedia-titel)". Språklänkarna från sv.wikipedia "Statens historiska museum" ger de **"Staatliches historisches Museum (Schweden)"** och fr **"Musée historique de Stockholm"**; en och es stämmer ("Swedish History Museum", "Museo de Historia de Suecia"). De nuvarande formerna är begripliga beskrivningar, men de är inte de etablerade namnen. Rätta, eller för in valet i ordlistan. |
| N2 | `data/perioder.json` 29–67 | "Norden, cirka 800–1500" | de "Norden, um 800–1500" | På tyska betyder "Norden" oftast "norr". Jag kunde inte kontrollera den tyska Wikipedia-titeln för sv "Norden" (Wikipedias API svarade 429). Pröva "Nordeuropa" eller "die nordischen Länder" mot de.wikipedia innan något ändras. |
| N3 | `data/perioder.json` 3 | "Filen läses inte av appen än; snabbknapparna byggs efter intervallet (#755)." | (bara sv, visas inte) | Inaktuellt: appen läser filen sedan #968. Bara dokumentation. |
| N4 | `js/model.js` 186–199 (kod, inte ny text) | datum "4 juli 1776" | de "4 Juli 1776", es "4 julio 1776" | `formatEventTime`/`formatDate` sätter ihop dag, månad och år på svenskt vis för alla språk. Det syns i de nya platsresultaten ("Vad hände här?"). Ordlistan säger "14 de julio de 1789", och tyskan skrivs "4. Juli 1776". Felet fanns redan före 6.0.0, så det är en kodfråga och inte en översättningsfråga. |
| N5 | `data/ui/es.json` `help.feedback` (inte ändrad sedan 6.0.0) | "Saknar du något …" | "¿Echas algo en falta o has encontrado un error?" (tú) | `sources.urval.p5` säger samma sak med usted ("¿Echa algo en falta …?"). Det är samma fråga med två tilltal. Det är en känd avvikelse (ordlistan, avsnitt 1). Den hör till #839. |

Utanför omfånget (bara som upplysning): `js/ui/feedback.js` rad 172, 230, 231 och 246 har statusmeddelanden på svenska som är hårdkodade i koden och syns på alla språk.

### Stickprov mot källan (14 texter, alla öppnade 2026-11-08)

| Text | Källa (öppnad) | Vad källan säger | Resultat |
|---|---|---|---|
| Lgr22: Norden 800–1500, 1500–1800, 1800–1900 (åk 4–6) | Skolverket GRGRHIS01 (`skolverket-lgr22-historia`) | Rubrikerna "… i Norden, cirka 800–1500", "… cirka 1500–1800", "… cirka 1800–1900" under "I årskurs 4–6" | Stämmer |
| Lgr22: 1850–1950 och 1900–i dag (åk 7–9) | Samma | "Imperialism och världskrig, cirka 1850–1950" och "Demokratisering och ökad globalisering, cirka 1900 till nutid" under "I årskurs 7–9" | Stämmer |
| Nordisk stenålder 12 000–1700 f.Kr. | historiska.se, intro-to-the-nordic-stone-age och historical-periods | "Stone Age 12,000 BC – 1700 BC" och "Nordic Stone Age (12,000–1700 BC)" | Stämmer |
| Nordisk bronsålder 1700–500 f.Kr. | historiska.se, nordic-bronze-age | "lasted from around 1700–500 BC" | Stämmer |
| Nordisk järnålder 500 f.Kr.–550 och noten | historiska.se, historical-periods och nordic-iron-age | Översikten: "Nordic Iron Age (500 BC–550 AD)", "Viking Age (AD 793–1050)". Järnålderssidan: "between 500 BC and AD 1100" | Stämmer, och oenigheten står öppet i noten |
| Antiken 800 f.Kr.–500 och noten (NE via sv.wp) | sv.wikipedia "Antiken" | "från cirka 800 f.Kr. till cirka 500 e.Kr." (ref. NE). "Slutet … ofta … Västroms fall år 476". "omkring 300 e.Kr. eller 600 e.Kr." | Stämmer |
| Noten: en.wikipedia | en.wikipedia "Classical antiquity" | Infoboxen: `end={{Circa|300 AD}}`. Ingressen: "between the 8th century BC and the 5th century AD" | Stämmer |
| Noten: Wikidata | Q486761 (EntityData) | P580 `-0799`, precision 7 (århundrade). P582 `+0300`, precision 7. Inga referenser | Stämmer ("8:e årh. f.Kr.–3:e årh.") |
| Industrialiseringen 1760–1840 och noten | en.wikipedia "Industrial Revolution" | Infoboxen: `start = c. 1760`, `end = c. 1840`. "Beginning in Great Britain around 1760 … spread to continental Europe and the United States by about 1840". "The precise start and end … is debated" | Stämmer (se dock UX-fynd 6) |
| Källdetektiven: slaget om Storbritannien (de, es, fr) | en.wikipedia "Battle of Britain" | "British date the battle from 10 July to 31 October 1940 … German historians … regard the battle as a single campaign lasting from July 1940 to May 1941, including the Blitz" | Stämmer i alla tre språk |
| Källdetektiven: Stalingrad (de, es, fr) | Jämfört med svenskan och engelskan; datumen 17 juli 1942, 23 augusti 1942 och 2 februari 1943 | Samma datum i alla språk | Översättningen stämmer. Källan öppnades inte, eftersom Wikipedias API gav 429 |
| Tur: Napoleon 1,67 m, Gillray 1803, "Little Boney" | history.com "napoleon-complex-short" (`history-napoleon-short`) | "equals around 1.67 meters … a little above average". "Maniac-raving's-or-Little Boney in a strong fit (1803)" | Stämmer ("nära genomsnittet" är försiktigare än källan, men inte fel) |
| Tur: moai är hela kroppar | snopes.com "head-case" (`snopes-moai`) | "Claim: The 'giant head' moai statues … actually have bodies as well. Rating: True". "heads … disproportionately large" | Stämmer. "Tre åttondelar" kunde inte kontrolleras: en.wikipedia "Moai" svarade 429 |
| Tur: Machu Picchu, Lizárraga 1902, Arteaga, bönderna | en.wikipedia "Machu Picchu", history.com "machu-picchu" | Wikipedia: "discovered = Agustín Lizárraga (1902)", inskriften "A. Lizárraga 1902". history.com: "a local farmer told them of some ruins" (utan namn) | Lizárraga och 1902 stämmer. **Namnet Melchor Arteaga och att bönder odlade på terrasserna kunde inte kontrolleras**: Smithsonian (`smithsonian-machu-picchu`) svarade 403. Ska kontrolleras av någon som når källan |

Inga sakfel hittades i svenskan bland stickproven, så inga issues med `faktafel` föreslås från Del 1.

## Del 2: UX-genomgång och blind spots

### Vad jag provade

Lokalt med `python3 -m http.server 8000` och Playwright (Chromium), i dator (1280 × 800 och 1280 × 650) och mobil (400 × 800, `isMobile`), på sv, en och de. Egna skript körde:

- **Tidsintervall:** formuläret med mus och tangentbord (Tab, Enter, Escape, pil upp), Från och Till med f.Kr., samma år, ogiltig text, år utanför gränserna, Tillbaka till ett år, Bakåt och Framåt, riken för slutåret.
- **Delade länkar:** `y2` tillsammans med tur, lektion, jakt och Fokus (`f=war:`), omvänd ordning (`y2 < y`), år utanför tidslinjen, ett nästan tomt intervall och intervall över år 0.
- **Lägesbyten:** uppspelning under intervall, Fokus på ett krig under intervall, tur startad under intervall, språkbyte (sv till en) mitt i ett intervall, och intervallformuläret under tur och lektion.
- **Epokknapparna:** alla tio, stenåldern (klippt), "Från cirka 1900 till i dag" (öppen), knapparnas namn i skärmläsarträdet (aria-snapshot) och de tyska texterna.
- **"Vad hände här?":** fliken Plats på sv och de, med förslag, val, tomt resultat och "Välj en annan plats".
- **Faktarutan:** Stonehenge (börjar före tidslinjen) på sv och en: raden om källkontroll och märkningen före tidslinjen.
- **Lektionsläget:** `#t=vikingatiden-och-varlden&m=lektion&r=lararen`. Bandet, utskriften (print stubbad, bladen byggs, 4 172 tecken), Visa hela globen, och att elevlänken saknar utskriftsknapp.
- **Platt vy och Källor** i intervalläget.
- **Projektets eget webbläsartest:** se Verifiering.

### Fynd, rangordnade

**Fel (bör rättas före release)**

1. **UX-1: "Visa intervallet" och "Avbryt" ligger utanför skärmen på datorn.** `css/style.css` rad 260: `.range-pop { max-height: calc(100vh - 100px) }`, men formuläret börjar på `top: 150px`. Uppmätt med formuläret rullat längst ner: knappen ligger på y = 799–837 i 1280 × 800 och på 649–687 i 1280 × 650, och `elementFromPoint` i knappens mitt ger ingenting. Formuläret täcker också tidslinjen. I mobil (400 px) syns knappen. Musanvändare på dator kan bara välja epokknappar, inte egna år. *Lins: senior UX, tillgänglighet.* Varför testet missade det: kontrollen "Rymmer sig" (rad 3371–3376) mäter bara bredden, och den 13-tums laptop som skolan ofta har är inte med.
2. **UX-2: Samtidigt-märket och intervallraden visar olika antal, och raden säger "inom ±0 år".** Exempel: `#y=1914&y2=1918` ger raden "1914–1918 · 9 händelser", märket "10" och panelen "9 händelser pågår under 1914–1918, **1 till inom ±0 år**, 4 pågår också …". Samma sak gäller 1760–1840 (40 och 41) och 1900–2026 (143 och 144). Orsaken är "Undervisning i Oxford" (pågår sedan 1096). Den hamnar i "Pågår sedan länge" och räknas som "nära" fast intervallet inte har något fönster (`js/ui/panel.js` rad 339–350 och `js/controllers/render.js` rad 91 och 108). Kommentaren i koden säger själv att "I intervallet finns inget 'nära'". *Lins: elev, lärare ("varför står det 10 här och 9 där?").* Underlaget såg "40 händelser" men inte märket "41".
3. **UX-3: En länk med år utanför tidslinjen ger ett intervall som inte finns.** `#y=-20000&y2=3000` ger raden "20001 f.Kr.–3000 · 522 händelser", medan adressen skrivs om till `y=-2999&y2=3000`. Slutåret klipps inte vid 2026, och raden visar ett startår som tidslinjen inte har. Formuläret säger däremot rätt "Välj år mellan 3000 f.Kr. och 2026". Det är lätt att råka ut för det med en handskriven eller gammal länk.

**Fynd (förbättringar, kräver ofta beslut)**

4. **Två epokindelningar i samma ruta med olika årtal.** Årshoppet visar tidslinjens egna segment, som är hårdkodade på svenska i `js/timeline.js` rad 11–14: "Bronsålder och tidig järnålder, 3000 f.Kr.", "Antiken och tidig medeltid, 500 f.Kr." Länken under öppnar epokknapparna: "Nordisk bronsålder 1700–500 f.Kr." och "Antiken 800 f.Kr.–500". Antiken börjar alltså 500 f.Kr. på ett ställe och 800 f.Kr. på ett annat, och bronsåldern 3000 respektive 1700 f.Kr. Segmenten har ingen källa och ingen förenklingstext. *Lins: historiker, lärare (en elev frågar vilket som är rätt).* Det är tidslinjens skala, inte en epok, och det bör synas.
5. **Efter ett klick på en epok syns inte vilken epok som valdes.** Raden visar bara "3000–1700 f.Kr. · 21 händelser". Epokens namn, att stenåldern egentligen börjar 12 000 f.Kr. och förenklingstexten försvinner när formuläret stängs. Skillnaden mellan en epok och ett vanligt intervall finns bara i formuläret. Kort sagt: en elev som delar länken `#y=-2999&y2=-1699` ser inget om stenålder.
6. **"Industrialiseringen, cirka 1760–1840" är den brittiska industriella revolutionen, inte Sveriges industrialisering.** Källan, en.wikipedia "Industrial Revolution", har själv en hänvisning högst upp: "This article is about the 1760–1840 … shift. For a more general overview, see Industrialisation". Lgr22 lägger "den tidiga industrialiseringen i Sverige" i perioden cirka 1800–1900 (åk 4–6) och "Industrialiseringen i Europa och Sverige" i åk 7–9 utan årtal (Skolverket GRGRHIS01). Förenklingstexten "Lgr22 behandlar den för Europa och Sverige" kan få läsaren att tro att 1760–1840 täcker Sverige. Det är ett sakligt men vilseledande urval, inte ett årtalsfel. Förslag: byt namn till "Den industriella revolutionen (Storbritannien), cirka 1760–1840", eller lägg till en svensk period med källa. *Lins: historiker, lärare.*
7. **Samma årtal två gånger i varje epokknapp.** Skärmläsaren läser "Norden, cirka 800–1500 800–1500" och "Antiken, cirka 800 f.Kr.–500 e.Kr. 800 f.Kr.–500". Rubrikerna för indelningarna är `<p>`, inte rubriker, så det går inte att hoppa mellan grupperna med rubriknavigering. Länken "Välj ett tidsintervall" har `aria-controls` men saknar `aria-expanded`. *Lins: tillgänglighet.*
8. **Inget besked till skärmläsaren när intervallet väljs.** Efter Enter hamnar fokus på "Tillbaka till ett år", men "1914–1918 · 9 händelser" läses inte upp: raden har ingen `aria-live`, och `#screen-reader-status` säger i stället fun factens text. *Lins: tillgänglighet.*
9. **Platsfältet har fel namn för skärmläsare.** I fliken Plats är platshållaren "Skriv en plats", men fältets `aria-label` är fortfarande "Sök händelser, krig, riken, länder, religioner och resor" (sv), och på tyska motsvarande. När ingen plats hittas står beskedet dessutom två gånger ("Ingen plats i datan innehåller …" i listan och i statusraden).
10. **"Välj ett tidsintervall" erbjuds i lektionsläget och i turer, där det inte går att använda.** Formuläret öppnas med tio gråa knappar och beskedet "går inte att välja under en tur, en lektion …". Det fungerar enligt lägeskontraktet, men det ser ut som ett fel för en elev. Dölj länken i lägen som stoppar intervallet.
11. **Sök och följ talar om "±40 år från 1914" medan ett intervall är valt.** Listan över krig, riken och annat följer året, inte intervallet. Antingen bör listan följa intervallet eller säga att den inte gör det.
12. **Delade länkar med `y2` i en tur, lektion, jakt eller i Fokus tappar `y2` utan att säga det** (till exempel `#t=forsta-varldskriget&y=1914&y2=1918`). Lägeskontraktet säger att läget vinner, och det fungerar så. Noteras bara, eftersom en lärare som klistrar ihop en länk inte får veta varför intervallet försvann.

Det som fungerade utan anmärkning: alla tio epokknappar ger rätt adress och rad. Stenåldern märks "börjar före tidslinjens början" och 1900 "till i dag". Riken visas för slutåret ("Områden visas för år 1918"). Uppspelning, Fokus och en tur avslutar intervallet. Intervallet går inte att välja under tur, lektion eller jakt. Bakåt och Framåt växlar mellan intervall. Språkbyte behåller `y2`. Ogiltig text, samma år och år utanför gränserna ger tydliga besked. Det blir ingen horisontell scroll i 400 px, varken med formuläret, Plats eller lektionsbandet. Faktarutans rad "Kontrollen gäller källorna, inte om historien är säker" och märkningen före tidslinjen syns på sv och en. Lektionens utskrift bygger båda bladen, elevlänken saknar utskriftsknapp och Visa hela globen återställer lagren. Inga konsolfel i någon körning; det enda som kom var WebGL-varningar från grafikdrivrutinen i den huvudlösa webbläsaren.

### Förslag på issues (skapas av dirigenten, inte av mig)

| Förslag | Etiketter | Rekommendation |
|---|---|---|
| Webbläsartestet rött på main: epokgrupperna är fyra (fynd i Sammanfattning p. 1) | `redo` (bugg, inga fakta) | Rätta testet till `[[5],[3],[1],[1]]` och kontrollera övriga följdfel i samma körning. Måste vara klart före release |
| UX-1 Intervallformulärets knappar utanför skärmen på dator | `utseende`, `redo` | `max-height: calc(100dvh - <formulärets top> - marginal)`, eller placera Från/Till och knapparna före epokerna. Före release |
| UX-2 Märket och raden räknar olika; "±0 år" i intervalläget | `redo` | Räkna inte "nära" i intervalläget och låt märket och raden räkna samma sak. Före release |
| UX-3 Länk med år utanför tidslinjen ger "20001 f.Kr.–3000" | `redo` | Klipp `y` och `y2` till MIN_YEAR och MAX_YEAR i `fromJSON`/intervallet |
| Fynd 4: tidslinjens segmentnamn krockar med epokerna | `beslut-krävs`, `utseende` | Rekommendation till DasKrokodil: döp om segmenten till neutrala skalnamn (till exempel "3000–500 f.Kr.") eller koppla dem till `data/perioder.json`. Efter release |
| Fynd 5: visa vald epok i intervallraden och i länken | `beslut-krävs` | Visa epokens namn och en länk till förenklingstexten i raden. Kräver ett fält i adressen (`p=`), alltså ett beslut |
| Fynd 6: "Industrialiseringen 1760–1840" är den brittiska revolutionen | `faktafel`, `källkontroll`, `beslut-krävs` | Byt namn eller lägg till en svensk period med källa (Lgr22 1800–1900 nämner den tidiga industrialiseringen i Sverige). Kan släppas som det är om DasKrokodil accepterar det, men helst namnbytet före release |
| Fynd 7–9: skärmläsarnamn (dubbla årtal, rubriker, aria-expanded, aria-live, platsfältets namn) | `redo` | Samla i ett tillgänglighetsissue |
| Fynd 10–11: dölj intervallänken i lägen som stoppar den, och Sök och följ i intervall | `beslut-krävs` | Låg prioritet |
| N1, N4: museets namn på de och fr, och datumformat per språk | `översättning` (N4 också kod) | N4 påverkar alla datum på de, es och fr; ett eget issue |

### Förslag på teständringar

1. **Höjd, inte bara bredd:** kontrollen "Rymmer sig" i `tests/webblasare.mjs` ska också kräva att `#range-pop` slutar inom `innerHeight`, och att `elementFromPoint` i mitten av `.jump-go` träffar knappen efter att formuläret rullats längst ner. Kör den i 1280 × 800 och 1280 × 650 (laptop), inte bara i den bredd testet använder i dag.
2. **Samma antal överallt:** i intervalläget ska `#panel-count`, talet i `#range-bar-text` och talet i `#panel-sub` vara lika, och `#panel-sub` får inte innehålla "±0". Pröva med ett intervall där en "pågår sedan länge"-händelse finns (1914–1918).
3. **Antalet grupper ur data:** jämför epokgrupperna med `data/perioder.json` (antal indelningar och perioder) i stället för en hårdkodad lista, så att ny data inte gör testet rött.
4. **Adressens gränser:** testa `#y=-20000&y2=3000` och kräv att raden och adressen visar samma, klippta intervall.
5. **Tillgänglighetsnamn:** en aria-snapshot av intervallformuläret och platsfältet. Fältet i Plats ska heta något med "plats", och ingen knapp ska ha samma årtal två gånger.

## Inte provat

- **dev.historiagloben.se** (bakom Cloudflare Access). Allt är prövat lokalt mot `main`, inte mot det publicerade bygget.
- **Firefox och WebKit.** Bara Chromium. Release-körningen (#888) måste göra det.
- **Riktig skärmläsare** (NVDA, VoiceOver). Jag läste bara tillgänglighetsträdet med Playwrights `ariaSnapshot`.
- **Riktig pekskärm och verklig mobil.** Mobil är emulerad i 400 px.
- **Fokus på ett rike och ett krig till slutkortet, bildlagret och uppspelningens pauser** gick jag inte igenom för hand. De täcks av projektets webbläsartest, men det är rött (se Verifiering).
- **Spanska och franska i webbläsaren** (bara läst i filerna). Gränssnittet provades på sv, en och de.
- **Källor som inte gick att öppna:** smithsonianmag.com (403), en.wikipedia "Moai", "Napoleon complex" och "Battle of Stalingrad" via API (429), och tyska Wikipedias titel för "Norden".
- **Utskrift på papper.** `window.print` var ersatt. Jag kontrollerade bara att bladen byggs.

## Verifiering

| Kommando | Resultat |
|---|---|
| `node --test 'tests/*.test.mjs'` | 177 av 177 gröna |
| `bash scripts/build-site.sh` | "726 filer i dist/", "validate-site: ok (726 filer, 62 JS-moduler, 76 ikoner)" |
| `python3 -m json.tool data/*.json` | alla giltiga |
| `python3 tools/oversattning.py` | grön; oöversatta: de 8337, es 8560, fr 8560 |
| `node tests/webblasare.mjs 8000` (Chromium, lokalt) | **Första felande kontroll:** "epokknapparna i intervallformuläret väljer ett intervall med ett klick (#965): grupperna ser ut så här: [[true,true,5],[true,true,3],[true,true,1],[true,true,1]]" (rad 3369). De följande tio felen i datorbredd ("Target page, context or browser has been closed") är följdfel i den lokala körningen. Den avbröts av min egen tidsgräns (1500 s) under mobilbredden. Kontrollen av konsolfel var OK |
| GitHub Actions "Webbläsartest" på `main` `cf96922` | **failure** ([körning 42511930701](https://github.com/DasKrokodil/historia-globen/actions/runs/42511930701)): jobben "Chromium, dator, övrigt" och "Chromium, mobil" har 1 felande kontroll var; de andra tre jobben är gröna |
| Egna Playwright-skript (dator 1280 × 800 och 1280 × 650, mobil 400 × 800; sv, en, de) | fynden ovan; inga konsolfel utöver WebGL-drivrutinsvarningar |
| Källor | Skolverket GRGRHIS01, historiska.se (fyra sidor), sv.wikipedia "Antiken", en.wikipedia "Classical antiquity", "Industrial Revolution", "Battle of Britain" och "Machu Picchu", Wikidata Q486761, history.com (två sidor) och snopes.com, alla hämtade 2026-11-08 |

Webbläsartestet krävde en lokal omväg: `playwright-core/lib/utilsBundle` går inte att `require` med den förinstallerade Playwright, så testet kördes med en `--require`-shim som pekar på filen. Det ändrar inget i repot.
