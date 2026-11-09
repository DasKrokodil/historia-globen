# 04. Syntes: varför Historia-globen känns plottrig, och vad vi gör åt det

**Datum:** 2026-11-09. **Underlag:** [01-inventering.md](01-inventering.md) (beskrivning och skärmbilder), [02-uxdesigner.md](02-uxdesigner.md) och [03-pedagog.md](03-pedagog.md) (två oberoende granskningar som inte såg varandras resultat).
**Ingen kod är ändrad.** Inga issues är skapade. Förslagen nedan väntar på DasKrokodils beslut.

## Kort svar till DasKrokodil

Sidan känns plottrig av **tre** skäl. De är nästan lika viktiga, men de kräver olika slags åtgärder:

1. **Kärnordet "samtidigt" har ingen fast betydelse (otydligt begrepp).** Hur många år som räknas som "samtidigt" bestäms av hur bred tidslinjen är på skärmen (1,2 % av bredden, `js/timeline.js:132`), inte av något historiskt val. Därför blir fönstret ±1 till ±120 år, och i sökningen upp till ±480 år. Följden syns överallt. År 1916 visar globen etiketterna "Titanic sjunker · slut 1912" och "Kongofristaten · slut 1908", men ingen etikett för första världskriget. Vart fjärde Samtidigt-kort jämför saker som ligger mer än 20 år isär, och ändå kallas alla "SAMTIDIGT". Det är löftet i hela produkten som blir suddigt.
2. **Allt är öppet på en gång, och ingenting säger var man ska börja (för många element och dålig ledning).** Första vyn har tio knappar, ett kort med tre bilder, tre chips och tre länkar, en glob med etiketter och symboler, och en tidslinje med 616 klickbara prickar. Det blir 655 tabbstopp och ingen första uppgift. När man följer ett krig är fem ytor öppna samtidigt. Varje läge (fokus, tur, uppspelning, introduktion) har dessutom en egen rad, egna ord för "nästa" (fem varianter) och egna ord för "gå ut" (sex varianter).
3. **Ord, epoker och tecken säger olika saker på olika ställen (otydliga begrepp).**
   - "Vy", "Utforska" och "Upptäckt" betyder två saker var.
   - Hjälp hänvisar till "Fokus", som inte finns som knapp.
   - Introduktionen heter "Ett år, en plats".
   - Era-raden säger "Antiken och tidig medeltid" mitt i vikingalektionen och "Bronsålder" år 2901 f.Kr. Det strider mot sidans egna källbelagda epoker i `data/perioder.json`.
   - Krigets ruta säger "Innan kriget börjar" år 1916.
   - Kartans tecken kräver en manual med sju punkter som ligger gömd i Hjälp.

**Så fördelar sig orsakerna.** Det mesta som *känns* som "för många element" visar sig vid närmare granskning vara **samma sak sagd på flera sätt**: tre läsytor, flera framåtknappar och sex betydelser av "Samtidigt". Pedagogen drar slutsatsen att plottrigheten "mest är en begreppsfråga". UX-designern räknar fler E-fynd, men skriver samma sak: *"det är inte antalet element i sig som gör sidan svår, utan att många element säger nästan samma sak med olika ord"*. Min slutsats är att det inte räcker att ta bort knappar. Först måste orden och tiden få en betydelse var. Sedan kan antalet ytor minskas.

| Orsak | Typ | Exempel (bevis) | Var det rättas |
|---|---|---|---|
| Samtidighetsfönstret följer skärmen, inte historien | B | ±1…±480 år; "slut 1912" vid 1916; fun fact 4 568 år isär under "SAMTIDIGT" (02 f2, 03 f1) | Definition + text + etiketter |
| Händelser och långa tillstånd blandas | B/E | 20 av 24 "pågår" år 1325 är fenomen över 100 år; Digerdöden (1346) i listan för 1325 (03 f2) | Listans grupper; ev. datamodell |
| Etiketter väljs efter ledig plats, inte efter vikt | E/L | `js/controllers/labels.js`: världskriget utan etikett, glesa områden får "börjar/slut" (02 f3) | Etikettprioritet |
| Tre till fem läsytor öppna samtidigt | E | `dator-03`, `dator-08`, lektion åk 4–6 (02 f5, 03 f6) | En läsplats per bredd |
| Ingen första uppgift; introduktionen gömd | L | "Ett år, en plats"; Hjälp säger "Fokus" (02 f1, 03 f4) | Namn, engångstips, fråga på kortet |
| Lägen utan gemensam modell | L | Fem "framåt", sex "ut", ▶ flyttar i fokus, tre framåtknappar i tur (02 f4) | Lägesrad i lägeskontraktet #893 |
| Samma ord, flera betydelser | B | Vy, Utforska, Upptäckt, Fokus/Sök och följ (01 avsn. 7, 02 f6, 03 f10) | Ordlistan som grind |
| Epoker och år motsäger egna källor | B | Hårdkodade `SEGMENTS` i `js/timeline.js`; "0" på tidslinjen; "Innan kriget börjar" 1916 (03 f3) | Små textändringar |
| Kartans tecken och områden ser ut som fakta | B | Rödrandig kil över Europa 1916; sju markörregler i Hjälp (02 f9, 03 f7) | Legend vid kartan, färre tecken |
| Tidslinjen: 616 knappar, hoptryckt skala utan förklaring | E/B | 6 × 6 px, tabbordning i dataordning; 2 500 år = 226 år i bredd (02 f8, 03 f8) | Ur tabbordningen; synliga skarvar |

## Hur jag har kontrollerat granskningarna

Jag har själv kört appen och gjort inventeringen. Jag har också kontrollerat de påståenden som bär slutsatserna, direkt mot repot:

- Fönstret är 1,2 % av bredden (`js/timeline.js:132`).
- Epoknamnen är hårdkodade i `SEGMENTS` (`js/timeline.js:11–14`) och visas via `segmentName` (`js/controllers/render.js:140`) **utan översättning**. Era-raden står alltså på svenska även i de andra fyra språken, vilket strider mot CLAUDE.md (punkt 2: "Hårdkoda aldrig … texter … i JS" och "Ny gränssnittstext läggs i alla fem språkfilerna"). Det är ett nytt fynd i syntesen.
- Tidslinjen skriver "0" för år 1 (`js/timeline.js:205`).
- "Innan kriget börjar" kommer från `story.labelIntro` (`js/ui/panel.js:465`).
- Källorna: 827 händelser, varav 420 med "två källor stämmer". Av dem bygger 397 bara på Wikipedia och Wikidata. Registret har 1 373 länkar till engelska Wikipedia och 1 till svenska.
- "Visste du?" hoppar från 1325 till 491 f.Kr. (eget prov).
- I fokus försvinner ▶ ur stegraden (eget prov).
- iPad stående: toppraden täcker era-raden (`ipad-01`).

Det jag **inte** har kunnat bekräfta:

- Hur riktiga besökare upplever sidan. Allt om upplevelse är antaganden, och båda granskarna märker det så.
- Riktiga enheter och skärmläsare.
- Den mörka rektangeln över klotet i mobilbredd. Den kan bero på programvarurenderingen och ska provas på en riktig telefon.
- Att listan i Sök och följ står kvar på gammalt år. Den är bara provad via adressen.

## Där granskarna är överens

Båda kom oberoende fram till samma sak i sex fall. Det gör de fynden starkast:

1. **"Samtidigt" måste få en betydelse**, och tidsfönstret måste skrivas i vardagsspråk ("Visar också det som hände 38 år före och efter") i stället för "VISAR ±38 ÅR".
2. **Etiketter och listor ska säga riktning i tid** i stället för "slut 1912" och "börjar 1942". Det som pågår ska gå före.
3. **En läsyta åt gången**: när faktarutan öppnas fälls Samtidigt-kortet ihop.
4. **Introduktionen ska heta "Kom igång"**, och Hjälp ska sluta säga "Fokus".
5. **"Visste du?" ska säga vart den tar en.**
6. **Ett ord per sak**: Lagers "VY" byter namn, och "Utforska", "Upptäckt" och "Fokus" får en betydelse var. Kartan behöver en förklaring där kartan är, inte bara i Hjälp eller Lager.

## Där granskarna är oense eller drar åt olika håll

| Fråga | UX-designern (02) | Pedagogen (03) | Min bedömning |
|---|---|---|---|
| **Vad är huvudorsaken?** | Fyra fynd E, tre B, tre L: "första vyn har ingen huvudsak" är fynd 1 | Fem fynd B, tre L, två E: "plottrigheten är mest en begreppsfråga" | Ingen verklig konflikt (se ovan). Börja med begreppen, eftersom de styr vad som ska visas. Att minska ytorna utan att först definiera "samtidigt" flyttar bara problemet. |
| **Samtidigt-kortet i första vyn** | Gör det mindre: mobilkortet startar stängt, och på dator visas det utan bildremsa så att globen blir huvudsaken | Gör det till ingången: kortet slutar med en fråga ("Hände något mer 1325? Leta på globen") | **Oense i sak.** Det kan prövas utan att välja: kortet visas kompakt (en mening och en fråga, ingen bildremsa) och fälls ut på begäran. Bilderna är det som tar plats, inte frågan. Det är DasKrokodils beslut, för det ändrar första intrycket. |
| **Era-raden** | Behålls, men fönstret skrivs i klartext | Ta bort epoknamnen och visa bara århundrade ("1300-talet"); epokerna hör hemma i intervallformuläret | Jag stöder pedagogen. Epoknamnen är i dag fel på flera ställen, hårdkodade och oöversatta. Århundradet gäller hela världen. Epokerna finns redan källbelagda i `data/perioder.json` för den som väljer dem. |
| **Namnet på kortet** | Kortet får ett eget namn, till exempel "Visste du?" eller "Oväntat samtidigt", och "Samtidigt" reserveras för panelen | Kortet behåller namnet, men fun facts typas i datan (`samtidigt` / `nära` / `avstånd`) och etiketten följer typen | **Komplement, med en krock:** "Visste du?" är redan namnet på knappen som hoppar till en slumpad fun fact. Pedagogens typning löser det verkliga problemet, eftersom vissa kort inte handlar om samtidighet. UX-förslaget löser bara ordet. Jag rekommenderar typningen, och att knappen "Visste du?" behåller sitt namn. |
| **Händelse mot tillstånd** | Nämns inte; föreslår etikettprioritet | Dela listan och kartan i "Hände år X", "Pågick då" och "Strax före / efter"; eventuellt ett datafält `"kind": "period"` | Pedagogens förslag är det viktigaste strukturella förslaget i hela granskningen. Ett nytt datafält är ett beslut om datamodellen (CLAUDE.md: fråga först). Grupperingen kan göras först med befintliga fält (start/slut mot året). |
| **Källkritik (M9)** | Fyra säkerhetssignaler i faktarutan är för många (mindre iakttagelse) | Statusen svarar på "har sidan kontrollerat?", inte på "hur vet vi?"; ifrågasätter att Wikipedia + Wikidata räknas som två oberoende källor | Pedagogens fråga rör **källpolicyn**, inte gränssnittet. CLAUDE.md nämner uttryckligen Wikidata som exempel på en andra, oberoende källa. Ändras det, ändras 397 händelsers status. Det är ett beslut för DasKrokodil och hör till #926, inte till en UX-rättning. |
| **Quiz** | Inte granskat | Felsvaren ligger minst 200 år bort och går att gissa på namnet | Bara pedagogen har underlag. Det är rimligt men har inte så hög prioritet. |

## Lista 1: Åtgärder nu, små och tydliga

Varje punkt är avgränsad och reversibel och kräver inga nya beslut om arkitektur eller data. Där gränssnittstext ändras ska alla fem språkfilerna uppdateras i samma pull request. Ordningen följer nytta per insats.

| # | Åtgärd | Typ | Varför | Insats |
|---|---|---|---|---|
| 1 | **Skriv tidsfönstret i vardagsspråk** i era-raden, till exempel "1300-talet · visar också det som hände 38 år före och efter" i stället för "MEDELTID OCH TIDIGMODERN TID · VISAR ±38 ÅR". Byt epoknamnen mot århundrade, så försvinner den hårdkodade, oöversatta texten (`js/timeline.js` `SEGMENTS`) och felen "Bronsålder 2901 f.Kr." och "Antiken" om vikingatiden. | B | Kärnbegreppet blir läsbart, och tre faktafel och ett regelbrott försvinner | liten |
| 2 | **Etiketter med riktning i tid:** "· slut 1912" blir "· 4 år före (1912)" och "· börjar 1942" blir "· om 3 år (1942)". Samma ord i panelen för poster som är "nära". | B | Före och efter syns direkt i stället för att se ut som pågående | liten |
| 3 | **Rätta tre motsägande texter:** "Innan kriget börjar" blir "Bakgrund: varför kriget började"; tidslinjens "0" blir "1 e.Kr."; Hjälp säger "Sök och följ" i stället för "Fokus" (och "Historia-globen" med bindestreck). | B | Sidan ska inte motsäga sig själv eller sina egna källor | liten |
| 4 | **"Ett år, en plats" blir "Kom igång"** och flyttas sist i Utforska eller till Mer. Visa en stängbar rad vid tidslinjen vid första besöket: "Dra här för att byta år". | L | Det finns en första handling, och introduktionen går att hitta | liten |
| 5 | **"Visste du?" visar målet** ("Visste du? → 491 f.Kr.") och lämnar efter hoppet en kort rad "Från 1325 · Tillbaka", samma mönster som fokusets "flyttades"-rad. | L | Inga oväntade hopp i tid och rum | liten |
| 6 | **En läsyta åt gången på dator:** när en faktaruta öppnas fälls Samtidigt-kortet ihop. Faktarutan dockar på samma plats som panelen, inte mitt på klotet. | E | Tre parallella texter blir en, och globen syns | medel |
| 7 | **Ett framåt och ett ut i turer och lektioner:** turkortets "Nästa →" är huvudknappen; turraden ovanför tidslinjen visar inte "Avsluta turen" och "▶ Fortsätt" en gång till, och stegradens ▶ tonas ned under turen. | L | Tre framåtknappar och två "Avsluta" i samma vy blir en av varje | medel |
| 8 | **Tidslinjens 616 markeringar tas ur tabbordningen** (`tabindex="-1"`). Reglaget är ett stopp med piltangenter, och panelen Samtidigt i världen är textalternativet. Lägg en rad teckenförklaring under tidslinjen (prick = händelse, romb = samband, streck = resa). | E | Tangentbord blir användbart, och tidslinjen får en förklaring där den syns | liten–medel |
| 9 | **Byt namn i Lager:** rubriken "VY" blir "Förval", förvalet "Utforska" får ett namn som säger vad det visar, och "Upptäcktsvy" heter samma sak som vyknappen. | B | Ett ord, en betydelse, utan att något flyttas | liten |
| 10 | **iPad stående:** toppraden får inte täcka era-raden (`ipad-01`). Det löses enklast med punkt 4, eftersom en knapp färre får raden att rymmas. | E | iPad är en huvudplattform enligt visionen | liten |
| 11 | **Turen "Hur vet vi det här?" först i turlistan**, och alla turer får en synlig startknapp (i dag syns bara "Starta som lektion"). | L | Det bästa källkritiska materialet blir synligt (M9) | liten |
| 12 | **Småfel:** "f.Kr.." (två punkter) i panelen. Sök och följ uppdaterar inte sin text när året byts medan menyn är öppen; prova det först med tidslinjen. | – | Slarvfel sänker förtroendet | liten |

Punkterna 1–5 och 9–12 kan göras som ett eller två små paket med text och CSS. Punkterna 6–8 rör panel och tidslinje och bör göras var för sig. De kan krocka med tidsintervallet (#755), så ordningen behöver stämmas av vid kökontrollen.

## Lista 2: Designprinciper och strukturella beslut före nästa större version

DasKrokodil skrev "innan version 2". **Det stämmer inte med repot.** Version 2 och områdeslagren finns redan: riken ur Cliopatria, Dagens gränser, Religioner och Krigsområden (se [01, avsnitt 8](01-inventering.md#8-där-dokumentationen-och-appen-inte-stämmer-överens)). Den närmaste punkt där de här besluten behövs är **innan tidsintervallet (#755) byggs**, och sedan före teman (6.2), regionkort (6.3) och versionerna 7–9. Där tillkommer fler lägen, fler områdes- och bildlager och längre tidslinjer.

| # | Princip eller beslut | Vad det betyder i praktiken | Varför före nästa version | Insats |
|---|---|---|---|---|
| A | **En definition av "samtidigt"** i projektordlistan ([13](../produkt/13-ordlista.md)): *samtidigt = pågår samma år*; allt annat är *nära i tid* med riktning. Fönstret sätts i år efter tidsålder (en tabell i data), inte som en andel av skärmbredden. Fun facts får en typ: `samtidigt`, `nära`, `avstånd`. | Kortets etikett, panelens grupper, sökningens fönster, jakten och quizet använder samma regel | Tidsintervallet (6.1) och "jämför två tider" (9) bygger på ordet. Utan definition betyder det snart "inom 1 200 år". | medel |
| B | **Händelse eller tillstånd.** Listan och kartan skiljer "Hände år X", "Pågick då" och "Strax före / efter". Det görs först med start och slut; ett eventuellt datafält (`kind: "period"`) är ett beslut om datamodellen. | "Osmanska riket" och "Digerdöden" hamnar inte i samma grupp | Teman och regionkort fyller annars listan med ännu fler långa "pågår"-poster | medel (stor med datafält) |
| C | **Ett läge i taget, en lägesrad.** Fokus, tur, lektion, jakt, intervall, tema och jämförelse visas i samma rad på samma plats: *[läge] [huvudknapp] [Avsluta]*. Stegraden tonas ned när ett läge styr tiden. | Ett ord för "framåt" och ett för "ut" i hela sidan | Skrivs in i **lägeskontraktet (#893)**, som enligt versionsplanen ska vara avgjort före #755 | medel–stor |
| D | **En läsplats per bredd.** Dator: höger sida; mobil: arket. En ny läsyta ersätter eller fäller ihop den förra, så att klotet alltid syns. | Inga faktarutor mitt på klotet, inte tre texter samtidigt | Regionkort (6.3) och temakort (6.2) är nya läsytor | medel |
| E | **En bakgrund och högst två överlägg.** Ytlagren (Riken, Religioner, Dagens gränser, Nattljus, framtida historiska kartor och klimat) är alternativ där man väljer ett. Punkter och linjer (händelser, resor, krigsområden) är överlägg. Varje bakgrund har en synlig rad "Vad visar kartan?" med källa och säkerhet; religionslagrets egen förbehållstext är förebilden. | Lager blir tre delar: Kartlager, Kategorier (ett ställe) och Inställningar (pauser, Lugn rörelse) under Mer | Detta är svaret på frågan om **nästa områdeslager**. Med dagens kryssrutor kan fyra färgade ytor ligga på varandra, och Lager har redan 42 kontroller. | medel |
| F | **Etikettprioritet:** pågår vid året → markerad av kortet → nära i tid. Högst cirka fem etiketter på dator och tre i mobil. Ett krigs viktigaste händelse går före krockande rikesnamn. | Det som händer syns där det händer | Fler lager betyder fler krockar om samma utrymme | medel |
| G | **Ett ord, en betydelse, och ordlistan som grind.** Ett nytt läge eller lager får inte återanvända "Samtidigt", "Vy", "Utforska", "Fokus" eller "Upptäckt". Nya ord läggs i ordlistan och i alla fem språkfilerna i samma pull request. | En rad i granskningen av varje pull request | Kostar nästan inget nu, men mycket senare | liten |
| H | **Ingen gränssnittstext eller epok i JS.** Era-namnen och liknande hämtas ur data eller språkfiler. CLAUDE.md kräver det redan, men `SEGMENTS` bryter mot regeln. | Kontrollen läggs i granskningen | Epokerna i 6.1 och sidhuvudet får inte säga olika saker | liten |
| I | **Synlig tidsskala, i nivåer.** Skarvarna i den hoptryckta skalan syns ("1 cm ≈ 250 år"). Versionerna 7 och 8 blir nya nivåer på samma reglage, och fönstret ritas som ett band runt tummen. | Eleven ser att forntiden är hoptryckt | Tidslinjen ska klara tiotusentals och miljontals år | stor |
| J | **Färre kartecken, förklarade på plats.** Högst fem tecken bär betydelse; rike får en annan form än händelse. Förklaringen syns vid hovring eller långt tryck och i en liten fällbar legend vid kartan. | Hjälpens sju markörregler blir onödiga | Varje nytt lager lägger till tecken | medel |
| K | **"Hur vet vi?" som mönster.** Faktarutans källrad i frågeform ("Var kommer det här ifrån? Engelska Wikipedia och Wikidata"), med "Här är forskare inte överens" när källorna är oense. | Lär ut frågorna (M9), inte bara statusen | Versionerna 7 och 8 vilar på metoder (datering, fynd) som behöver ett enkelt språk från början | medel |

## Beslut som bara DasKrokodil kan ta

1. **Ska "samtidigt" betyda "pågår samma år"** (A), och ska fun facts typas i datan? *Rekommendation: ja.*
2. **Samtidigt-kortet vid start:** kompakt med en fråga, eller stängt (granskarna är oense)? *Rekommendation: kompakt med en fråga och utan bildremsa; prova i mobil.*
3. **Era-raden:** århundrade i stället för epoknamn? *Rekommendation: ja. Epokerna finns redan i intervallformuläret.*
4. **Datafält för långa fenomen** (B), som är en ändring av datamodellen? *Rekommendation: börja utan datafältet och avgör efter att grupperingen har provats.*
5. **Ska Wikipedia + Wikidata räknas som "två källor stämmer"?** Det rör källpolicyn och 397 händelser, och hör till #926. *Rekommendation: ta upp frågan i #926, utan att ändra statusen nu.*
6. **Lägesraden (C) och "en bakgrund" (E)** skrivs in i lägeskontraktet (#893) före #755? *Rekommendation: ja.*

## Där dokumentationen och appen inte stämmer (samlat)

Detaljerna finns i [01, avsnitt 8](01-inventering.md#8-där-dokumentationen-och-appen-inte-stämmer-överens) och i 02 (sista avsnittet). De viktigaste:

- **Uppdraget** talar om områdeslager "i version 2" som kommande. De finns redan, och version 2 är släppt.
- **CLAUDE.md**, punkt 2 och språkregeln: era-namnen är hårdkodad svensk text i `js/timeline.js` och oöversatta.
- **Hjälp** säger "Fokus", knappen heter "Sök och följ", och fokusraden säger "FOKUS".
- **Projektordlistan** säger "Introduktion", appen säger "Ett år, en plats". Ordlistan beskriver inte tidsfönstret, som styr vad "samtidigt" betyder.
- **05-ux-oversikt** säger att faktarutan ligger vid sidan på dator; med panelen öppen hamnar den mitt på klotet. Där står också "minst 24 px träffyta", men tidslinjens 616 markeringar är 6 × 6 px.
- **05-ux-oversikt**, flöde 1, räknar med att introduktionen och Samtidigt-kortet möter förstagångsbesökaren. Introduktionen startar inte av sig själv, och kortet saknas vissa år (till exempel 1400).

## Nästa steg

- **Frågor till en riktig lärare:** åtta stycken finns sist i [03](03-pedagog.md#frågor-att-ta-med-till-en-riktig-lärare). Frågorna 1, 2 och 8 avgör mest av prioriteringen ovan.
- **Issues (uppdaterat 2026-11-09):** Lista 1 blev #991–#1003 i milstolpen "UI/UX uppdatering", som enligt beslut 2026-11-09 kommer direkt efter 6.1.0 ([docs/beslut/2026-11-09-ui-ux-efter-6-1-0.md](../beslut/2026-11-09-ui-ux-efter-6-1-0.md)). Punkt 1 om epoknamnen kommenterades på #979. Del 3 av #1000 (färre markeringar) väntar på beslut. Lista 2 är inte gjord till issues än.
- **Produktdokumenten** ([05](../produkt/05-ux-oversikt.md), [06](../produkt/06-granskningsperspektiv.md) "Vad linsen har sagt hittills", [13](../produkt/13-ordlista.md)) bör uppdateras i samma pull request som besluten, inte nu.
- **Rapporten ligger i `docs/ux-review/`**, som uppdraget bad om. Projektets vanliga plats för granskningar är `docs/granskningar/`. Om rapporten ska ligga kvar här kan en rad i [docs/granskningar/README.md](../granskningar/README.md) peka hit.
