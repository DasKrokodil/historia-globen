# Visste du?-kortet öppnas när besökaren trycker på Spela (#1867)

Datum: 2026-11-17. Beslut av DasKrokodil i #1867 ("Ja till rekommendationerna" och "följ rekommendationerna" på kommentaren "Rekommendation till DasKrokodil: de fem följdfrågorna"). Fortsätter [2026-11-16-visste-du-kortet-1867.md](2026-11-16-visste-du-kortet-1867.md), avsnittet "Vad som återstår".

## Beslut

1. **Spela öppnar kortet.** Kortet startar litet (flik i dator, en rad i mobil). När besökaren startar uppspelningen med Spela öppnas det, så att nya kort syns och pausen vid dem fungerar. Drag i reglaget, +1/−1, tangentbordet på reglaget, årshopp, länkar, turer och Fokus öppnar inte kortet.
2. **Öppningen är inte ett val.** Den sparas inte i `hg-ff-min`; bara när besökaren själv trycker för att öppna eller fälla ihop kortet sparas något. Nästa besök startar litet igen. Stänger besökaren kortet, under uppspelningen eller förut, står det stängt.
3. **Pausen vid nya kort är oförändrad** (`!ff.minimized` i `js/controllers/playback.js`): ett medvetet ihopfällt kort ger ingen paus, ett redan öppet kort förblir öppet, och ett kort som kommer ihåg att det var öppet (sparat `0`) är oförändrat.
4. **Fliken, raden och krigskortet.** Den befintliga fliken (dator) och raden (mobil) behålls. Krigskortet får inget eget namn ("Visste du? · När ett krig bröt ut").

## Hur det byggdes

- **Besökarens Spela mot programmatiska starter.** `Timeline.play({ byUser: true })` anropas bara av spelknappen, Fortsätt i pausraden (`#pause-go`) och huvudknappen i Fokus (`#focus-action`). När uppspelningen har startat skickar tidslinjen händelsen `userplay` med `detail.resumed` (sant när den fortsätter efter en automatisk paus). Nedräkningen som fortsätter själv och Spela klart anropar `play()` utan `byUser` och skickar ingen `userplay`. Turer, lektion, presentationsläge och länkar startar ingen uppspelning med `timeline.play`, så de kan inte öppna kortet.
- **`FunFacts.openForPlay()`** (`js/ui/funfact.js`) öppnar ett litet kort utan att skriva `hg-ff-min` och utan att flytta fokus. `chosen` är sant när besökaren har valt: ett sparat `0` eller `1` vid start, eller ett tryck på kortet sedan dess (`setMinimized`). Är `chosen` sant öppnas inget.
- **Lyssnaren i `js/controllers/playback.js`** öppnar inte kortet vid Fortsätt efter en automatisk paus (`resumed`), under en tur eller lektion (klassen `touring` och lägena `tur` och `lektion`), när platskortet är öppet (stängregistret, `surfaces.anyOpen('kort')`, #1865 och #1908) eller när faktarutan täcker kortet (`ff.detailOpen`).
- **Prov.** Kontrollen "Visste du?-kortet öppnas när Spela trycks, inte av andra tidsbyten, och öppningen sparas inte (#1867)" i `tests/webblasare.mjs` (dator och mobil) prövar: startar litet, +1/−1, tangentbord, drag och tryck på reglaget och årshopp via adressen öppnar inte, Spela öppnar utan att spara `hg-ff-min`, pausen vid nästa kort fungerar, ett kort som stängs under uppspelningen står stängt (ingen paus, ingen ny öppning, inte heller vid nästa Spela), ett sparat ihopfällt kort ger ingen öppning och ingen paus, och ett sparat öppet kort förblir öppet. Ingen befintlig kontroll är ändrad eller försvagad.

## Avvikelser och öppna frågor

- **Stängt kort och nästa Spela.** Rekommendationen sa att ett kort som besökaren stänger under uppspelningen står stängt "tills nästa Spela efter att uppspelningen har stannat", alltså att nästa Spela öppnar det igen. Det är byggt strängare: stänger besökaren kortet sparas valet som förut (`hg-ff-min = 1`), och då öppnar Spela det aldrig mer. Skälet är att ett kort som någon medvetet har stängt inte ska hoppa upp vid varje Spela, och att samma regel då gäller i samma besök och vid nästa. Vill DasKrokodil hellre att nästa Spela öppnar det igen är det en liten ändring (en flagga som nollställs när uppspelningen stannar, i stället för `chosen`).
- **Fortsätt öppnar inget.** Spela efter en automatisk paus (knappen heter då Fortsätt) räknas som en fortsättning på samma körning och öppnar inte kortet; det följer att ett kort som stängdes under en paus inte öppnas av Fortsätt.
- **Fokus.** Spela i Fokus (huvudknappen i fokusraden) öppnar kortet på samma sätt som på globen, eftersom rekommendationen inte gör undantag. Fokus pausar som standard inte vid Visste du?-kort (`focusFunfacts`), så där öppnar Spela kortet utan att pausa.
