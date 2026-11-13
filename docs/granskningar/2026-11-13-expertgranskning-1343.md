# Expertgranskning av #1343: förhistoriens epoker (2026-11-13)

Granskning av förslaget i [#1343](https://github.com/DasKrokodil/historia-globen/issues/1343) ("Förhistoriens epoker: egen indelning, och hur nordisk stenålder inleds utan att förvirra elever"), ett beslutsissue utan kod. Granskare: `larare`, `ux-tillganglighet`, `arkitekt`, `sprak-de` och `sprak-fr`. **`forhistoriker` hade inte svarat när rapporten skrevs**; hens del (källa och årtal för den egna indelningen) läggs till som daterat tillägg nedan. Experterna ändrade inga filer. Rapporten är underlag till DasKrokodil, inget beslut. Ingen webbläsare kördes; det som bygger på kod, ordlista eller bedömning är märkt så.

## Slutsats

Fyra experter (lärare, UX, arkitekt och i praktiken även de två språkexperterna) pekar åt samma håll, och det avviker från rekommendationen i issuet:

1. **Samma ordning på epokknapparna i alla språk.** Språkberoende ordning flyttar hela grupper vid språkbyte (tabb- och skärmläsarordning, muskelminne), gör att lärare och elever ser olika listor ("den första knappen") och kräver en ny mekanism och ett nytt test. Förvirringen löses bättre av märkning än av placering. Språkordning kan läggas till senare om lärargranskningen (#1109) visar att svenska elever letar efter fel knapp.
2. **Märk omfånget i själva knappen**, inte bara i rubriken: "nordisk" i knappnamnet, omfång i årsraden och ett tydligt ord ("Hela världen" eller motsvarande) för den egna indelningen.
3. **Premissen "det är vad Lgr22 och skolböcker använder" är inte belagd.** `data/perioder.json` säger själv att epoknamn utan årtal i läroplanen inte ligger i `lgr22`, och källan till Nordens forntid är Historiska museet.
4. **Den egna indelningens källa är inte öppnad**, och inga årtal får skrivas före den är det.

## Fynd per expert

### Lärare (åk 4–6, 7–9, nyfiken vuxen)

- **Skolverket:** "svenska elever möter den i skolan" är ett antagande. Kontrollera kursplanen (`skolverket-lgr22-historia`) innan det används som skäl för ordningen.
- **Språkberoende ordning är riskabel i klassrummet:** adressen verkar inte bära språk, så en svensk lärare och en engelsk elev ser olika epoklistor. Läraren lutar åt samma ordning i alla språk. Epokknapparna är dessutom inaktiva i tur och lektionsläge, så frågan gäller fritt läge.
- **Tom glob:** knappen "Nordisk stenålder" leder till en glob utan något i Norden (stenålder 2 händelser, båda Grönland; bronsålder 0; järnålder 1, #1339). Bygg inte om texten före #1339 eller en text om varför det är tomt.
- **Tidsbilden:** ingen knapp täcker 100 000–12 000 f.Kr. En jämförelse som går att räkna fram (12 000 av cirka 100 000 år) hjälper.
- **Begrepp:** samma "stenålder" kan finnas i två indelningar med olika årtal; "forntid" är svenskt skolord, "förhistoria" det vedertagna; latinska ord som "paleolitikum" behöver vardagsförklaring för åk 4–6.
- **Missförstånd att möta:** "alla blev jordbrukare samtidigt" (jordbrukets början cirka 10 000 f.Kr. mot Nordens stenålder till cirka 1700 f.Kr., som öppet exempel med källa); "stenålder = grottmänniskor".
- **Luckor:** bara 11 händelser före 3000 f.Kr., inget i Amerika eller Oceanien utom Madjedebe; ingen tur eller lektion om förhistoria; ordlistan saknar förhistoria, forntid, stenålder, bronsålder och järnålder; anteckningen i `perioder.json` om tidslinjens start är föråldrad.

### UX och tillgänglighet (läst i koden)

- **Behåll samma ordning över språk;** skilj grupperna åt med märkning.
- **Märk omfånget i knappen:** "nordisk" i namnet och "Norden · cirka 12 000–1700 f.Kr." i årsraden; rubriken är 12 px och sitter flera knappar ovanför.
- **Inledande mening:** ersätt eller korta den befintliga `simplification`-noten i stället för att lägga till en andra, högst cirka 120 tecken, utan att upprepa årtal. Överväg hopfällbara grupper (`details/summary`); fyra indelningar med not ger flera skärmhöjder på mobil (ej mätt).
- **Tomma epoker (#1339):** visa antal och befintliga `range.empty`; dämpa knappen men gör den inte `disabled`; överväg en knapp för hela världen under spannet; ge den inte som väg för skolan före #1339.
- **Tidslinjens start:** nordisk stenålder klipps inte längre (`MIN_YEAR` −99999). En ny indelning som börjar före dess visar "börjar före tidslinjens början" utan förklaring.
- **Ett ord per sak:** "indelning", "epok", "period" och "forntid"/"förhistoria" om delvis samma sak; välj en användarterm.
- **Tillgänglighet:** markera vald epok med `aria-pressed`; `role=group` på `section` är redundant; kontrast på 11–12 px-text ej mätt.

### Arkitekt (läst i koden, inga tester körda)

- **Ordning som UI-nyckel, inte data:** om språkordning behövs ska den vara en nyckel i `data/ui/<språk>.json` (cirka 5 rader i `buildPresets`), inte ett fält i `perioder.json`; schemat och översättningsspärren har ingen plats för det. Enklare alternativ att börja med: samma ordning överallt.
- **Dokumentationen är föråldrad:** `MIN_YEAR` är −99999, men `docs/arkitektur.md` (rad 294) och beslutet 2026-11-08-epokknappar säger −2999 och klippning av stenåldern, och att adressen inte har något epokfält, medan `js/url-state.js` har `p=<epok-id>` (#980). Rättas i samma pull request.
- **Stabila id:** period-id ska prefixas (till exempel `forhistoria-…`), aldrig `stenalder`, och aldrig byta namn efter publicering, eftersom `p=` ligger i delade länkar. Försvinner ett id visas bara intervallet.
- **Teman:** ingen konflikt. Epok är ett tidsspann (`perioder.json`), tema en händelselista (`teman.json`, beslut 2026-11-08-temaformat-398). En period med egen berättelse bör bli ett tema.
- **Tester:** `tests/period-range.test.mjs` hårdkodar "tio perioder"; `tests/webblasare.mjs` jämför knappgrupperna med filens ordning, så en språkberoende ordning gör testet rött.
- **Källa och översättning:** källan in i `data/sources.json` före årtalen; fem språk i samma pull request (schemat kräver det); "nordisk" skrivs in i varje språks term.
- **Inledningen** kan lösas med en första mening i befintlig `simplification`, utan schemaändring.
- **Filkrockar:** `data/perioder.json` är en fil, så gör #1343 som en enda pull request. #1102 och #1098 kunde inte läsas och ska kontrolleras före bygget.
- **Beslutsfil krävs** för femte indelningen och dess källa, med id-prefix och gränsen mot teman. Ny beslutsfil för språkordning bara om den byggs. Modellnivå: Opus, bara Claude Code.

### Tyska (`sprak-de`)

- **Belagt i repot:** ordlistan har Steinzeit, Alt-, Mittel- och Jungsteinzeit, Bronzezeit och Eisenzeit; `perioder.json` har redan "Nordische Steinzeit", "Nordische Bronzezeit" och "Nordische Eisenzeit" och divisionsnamnet "Vorgeschichte der nordischen Länder". "Nordisk" är alltså redan utskrivet på tyska.
- **Möjligt sakfel (till historikern):** på tyska avser Stein-, Bronze- och Eisenzeit oftast Mitteleuropa. Förenklingstexten ("nordische Forschungsbegriffe") kan läsas som att begreppen bara finns i Norden. Säg i stället att Nordens indelning och årtal skiljer sig från Mitteleuropas.
- **Årtal som tyska läsare möter:** "Steinzeit bis 1700 v. Chr." strider troligen mot tysk skolbok; siffror för Mitteleuropa är inte belagda och ska hämtas ur öppen källa.
- **Termer (antaganden):** "Nordische Bronzezeit" är enligt experten etablerat (Montelius), men inte belagt i repot; "Nordische Steinzeit" är sannolikt inte vedertaget.
- **"Vorgeschichte" bara på ett ställe:** divisionsnamnet har det redan, så den globala indelningen bör få ett annat ord.
- **Mobil:** divisionsnamnet är långt för en knapp; kortare knapptext med längre förklaring.
- **Luckor:** ordlistan saknar Urgeschichte, Vorgeschichte, Frühgeschichte, Prähistorie och Nordischer Kreis; den nordiska indelningen har bara en stenålder medan tysk läsare förväntar sig tre steg.

### Franska (`sprak-fr`)

- **Belagt i repot:** `perioder.json` fr har "Âge de la pierre nordique", "Âge du bronze nordique", "Âge du fer nordique" och divisionsrubriken "Préhistoire des pays nordiques (selon le Musée historique de Stockholm)". Ordlistan har âge de la pierre/du bronze/du fer.
- **Sakfel att flagga (till historikern):** i fransk indelning är bronsålder och järnålder Protohistoire, inte Préhistoire, så rubriken "Préhistoire des pays nordiques" är missvisande. Förslag: "Les âges de la pierre, du bronze et du fer dans le Nord" utan "Préhistoire".
- **"Âge de la pierre nordique"** är ordagrant och ovanligt. Förslag: knappen "Âge de la pierre" med "Dans les pays nordiques" som underrubrik. "Pays nordiques" är bättre än "Scandinavie", eftersom Grönland ingår.
- **Den egna indelningen** bör på franska använda Paléolithique (inférieur/moyen/supérieur), Mésolithique och Néolithique, med årtal i datan.
- **Typografi:** ordlistan säger att år skrivs utan avgränsare, men fransk norm har tunt mellanrum i fem- och sexsiffriga tal ("12 000", "100 000"); hur `model.js` formaterar dem är inte kontrollerat.
- **Luckor:** ordlistan saknar Préhistoire, Protohistoire, Paléolithique, Mésolithique, Néolithique och Antiquité; texten "selon Lgr22" är obegriplig utan svensk förförståelse; fransk förhistoria (Lascaux, Chauvet) saknas som exempel (ej mätt).

## Konflikter och öppna punkter

- **Språkordning:** issuets rekommendation (svenska först) mot lärarens, UX-expertens och arkitektens (samma ordning). Avgörs av DasKrokodil; experterna är samstämmiga.
- **Skolverket:** orden i rekommendationen ("det är vad svenska elever möter") är inte belagda och bör kontrolleras eller strykas.
- **Vilken källa den egna indelningen följer** är inte avgjort, och inga årtal får skrivas före den är öppnad (forhistorikerns del).

## Förslag till justerad rekommendation i #1343

1. Fråga 1 (inledning till nordisk stenålder): ja, som en kort mening i den befintliga `simplification`-noten, utan att upprepa årtal.
2. Fråga 2 (annorlunda på svenska): nej till språkberoende ordning. Samma ordning i alla språk, med den egna indelningen först och Nordens forntid märkt. Språkordning kan läggas till om #1109 visar behov.
3. Fråga 3 (olika ord): ja. "Nordisk" i knappnamnet, omfång i årsraden, ordet "Hela världen" eller motsvarande för den egna indelningen, och en gemensam användarterm. Per språk gäller etablerade termer, inte ordagranna översättningar (tyska: "Vorgeschichte" bara på ett ställe; franska: ingen "Préhistoire" över bronsålder och järnålder).
4. Fråga 4 (vem avgör): #1109, och tills dess inga hänvisningar till åk 4–6. Dessutom: tomma epoker (#1339) ska hanteras innan knappen ges som väg för skolan.

## Att göra före bygget

- Öppna en källa för den egna indelningens gränser och lägg den i `data/sources.json`.
- Kontrollera Skolverkets kursplan.
- Rätta `docs/arkitektur.md` (rad 294) och beslutet 2026-11-08-epokknappar (−99999, `p=`).
- Kontrollera #1102 och #1098 för filkrockar.
- Lägg till termer i `docs/ordlista-oversattning.md` (Urgeschichte, Vorgeschichte, Préhistoire, Protohistoire, Paléolithique m.fl.).
- Beslutsfil i `docs/beslut/` för femte indelningen, med id-prefix och gränsen mot teman.
- Mät formulärets höjd på 400 px med en femte grupp.

## Förbehåll

Ingen kod är byggd, och ingen webbläsare kördes. Språkexperternas termer är bedömningar, inte belagda mot externa källor. Experterna kunde inte läsa issuet via GraphQL och använde REST.

## Tillägg: forhistoriker (väntar)

Forhistorikerns rapport (öppen källa och årtal för en global indelning, kontroll av årtalen i `perioder.json`, regionala skillnader) var inte klar när rapporten skrevs och läggs till här.
