# Vad "samtidigt" betyder: pågår samma år, annars nära i tid (#1311)

**Datum:** 2026-11-13 (DasKrokodil sa ja till regeln och till typningen i #1311; ur helganalysen #1289, syntesens punkt A och B i `docs/ux-review/04-syntes.md`)

## Beslut
1. **Samtidigt** betyder att händelserna pågår minst ett gemensamt år, räknat på `start` och `end` (astronomiska år). Gäller en jämförelse fler än två händelser räknas det över alla. Det är samma regel i fun facts, quizet och Samtidighetsjakten, och den står på ett ställe: `js/samtidighet.js` (delas med testerna, `tests/samtidighet.test.mjs`).
2. **Nära i tid** betyder att händelserna inte har något gemensamt år men ligger högst ett visst antal år isär. Avståndet är senaste start minus tidigaste slut, räknat rakt av på astronomiska år som i panelen (beslutet 2026-11-09). Antalet år står alltid med. Gränsen står i datan, inte i koden:
   - fun facts: tabellen `near` i `data/funfacts.json`, **100 år** när avståndet börjar före vår tideräkning (år 0 och tidigare) och **50 år** därefter. Dateringarna före vår tideräkning är ofta osäkra på decennier eller mer, så en snävare gräns där skulle påstå en skärpa som källorna inte har;
   - jakten: uppdragets `window` i `data/uppdrag.json` (25 år för år 1500);
   - globen: tidsfönstret som följer reglaget (besluten 2026-11-12 och 2026-11-13), oförändrat.
3. **Jämför avstånd i tid** (`apart`) är fun facts med längre avstånd. De jämför ofta avstånd ("Kleopatra levde närmare månlandningen än pyramidbygget") och kallas aldrig samtidiga.
4. **Fun facts typas** med fältet `relation`: `together`, `near` eller `apart`. Värdet räknas fram ur händelsernas årtal och tabellen `near`, och testet stoppar en fun fact vars värde inte stämmer, till exempel om ett årtal i en händelse ändras. Av de 56 fun facts är 27 samtidiga, 22 nära i tid och 7 jämför avstånd.
5. **Samtidigt-kortet** visar relationen bredvid "Fun fact": "Samtidigt", "Ungefär samtidigt" (när något årtal är ungefärligt: `~` eller `?` i `edtf`, eller precision grövre än år), "Nära i tid: 33 år isär" (med "cirka" och avrundat till tiotal när något årtal är ungefärligt och avståndet är minst 10 år) och "Jämför avstånd i tid". Texterna finns i alla fem språken (`ff.relation.*`).
6. **Quizet** frågar "Vilken av de här händelserna hände samtidigt?" bara om par som pågår samma år. Gränsen på 50 år (`MAX_PAIR_GAP`) är borttagen. Antalet fun facts som kan bli frågor går från 47 till 28. Marginalen för felsvar (minst 200 år) är kvar, eftersom den skyddar mot osäkra årtal och inte är en definition av samtidigt.
7. **Samtidighetsjakten** använder samma funktion (`relationToYear`): en händelse räknas om den pågår uppdragets år eller ligger högst `window` år därifrån. Det är samma utfall som förut. Långa tillstånd räknas fortfarande, eftersom de pågår år 1500.
8. **Händelse eller långt tillstånd:** fältet `lasting` (`true`) föreslås för händelser som är ett långt tillstånd, något som pågick (ett rike, en kultur), och inte något som hände. Det står i `schemas/event.schema.json` och `docs/datamodell.md`, men inga händelser har det än. Typningen görs med källor i omgångar, i ett eget issue, och inte med en längdgräns: ett krig som varade i 30 år är fortfarande något som hände. Hur jakten och panelen ska visa tillstånden ("pågick då") bestäms där.
9. **En text ändras:** fun facten alltinget-hawaii sade "Ungefär samtidigt" fast Alltinget (930) och Hawaiis bosättning (omkring 940–1130) ligger 10 år isär. Den säger nu "Någon gång omkring 940–1130, enligt den senaste dateringen". Inga årtal eller påståenden är ändrade, och alla fem språken följer med.

## Varför
Ordet användes för flera olika saker: quizet kallade upp till 50 år "samtidigt" (Solpyramiden omkring år 200 och Taupō omkring 232), kortet skilde inte på samtidighet och tidsavstånd, och jakten och globen hade egna fönster. En definition som går att räkna fram gör att siffrorna alltid går att kontrollera ur årtalen (källpolicyn punkt 5) och att ordet betyder samma sak för eleven i quiz, jakt och kort. Gränsen för "nära i tid" efter tidsålder följer historikerns granskning. Lärarens förslag var 50 år överallt. Att jakten räknar långa tillstånd följer lärarens råd: så länge bara en del av händelserna är typade blir ett nej godtyckligt.

## Öppet
- Typningen av långa tillstånd (`lasting`), omgång 1, och hur jakten och panelen visar dem: eget issue.
- En fun fact om något långt (Oxford 1096–i dag) handlar ofta om början. Historikern föreslår ett fält som säger vilken tidpunkt texten gäller (`anchor`). Det tas upp vid behov.
- Quizet: om par där en lång händelse omsluter en kort, och fun facts som är nära i tid, ska bli frågor av sorten "Vad låg närmast i tid?". Det hör till issuet om svårare felsvar.

## Berör
`js/samtidighet.js`, `js/quiz-rules.js`, `js/uppdrag-rules.js`, `js/ui/funfact.js`, `data/funfacts.json`, `data/ui/*.json`, `schemas/funfact.schema.json`, `schemas/event.schema.json`, `tests/samtidighet.test.mjs`, `tests/quiz.test.mjs`, `tests/uppdrag.test.mjs`, `docs/datamodell.md`, `docs/arkitektur.md`, `docs/produkt/13-ordlista.md`, #1311.
