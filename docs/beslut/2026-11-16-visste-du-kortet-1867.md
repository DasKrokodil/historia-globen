# Kortet heter Visste du? och startar litet (#1867)

Datum: 2026-11-16. Beslut av DasKrokodil i #1867 ("Ja, enligt rekommendationerna"). Fynd 2.8 och 2.9 i [baslinjegenomgången](../ux-review/2026-11-16-baslinje-per-yta.md) (#1799). Byggt ovanpå #1865 (PR #1908), eftersom båda ändrar `js/ui/panel.js`; #1782 (panelens meny, alternativ A, B, C) är inte rört.

## Läget före

- Knappen "Samtidigt" i verktygsfältet visar antalet pågående händelser (6 år 1325), medan kortet med fun facts hette Samtidigt-kortet och visade "1 av 4", och dess hopfällda flik "Samtidigt 4". Samma ord, två siffror, ingen förklaring.
- Vid start täckte kortet cirka 270 av 800 px i mobil och västra halvan av jordklotet i dator (380×410).

## Beslut

1. **Två namn.** Knappen och listan heter "Samtidigt" och räknar pågående händelser. Kortet med fun facts, krigskort och rikets berättelse heter **"Visste du?"** (samma ord som knappen i kortet och teckenförklaringens romb, som redan hette så). Namnet byts överallt där det är kortets: rubrikraden, fliken, handtagets och kortets namn för skärmläsare, raden i Lager och Pausa vid, pausraden ("Pausad vid ett nytt Visste du?-kort"), statusraden ("Inget Visste du?-kort för det här året."), granskningsförklaringen och romben på tidslinjen. Svenska och översättningarna (en, de, es, fr) ändras i samma pull request; ordlistan har namnet på alla språk.
2. **Kortet startar litet.** I dator är det lilla kortet den befintliga fliken ("Visste du? 4"); i mobil är det den befintliga stängda panelen, nu som en enda rad ("Visste du? 4", i stället för rubrikrad med typ, relation och sidräknare). Kortet öppnas när besökaren trycker på fliken eller handtaget (och med Enter eller mellanslag, eftersom båda är knappar).
3. **Siffran byter namn med kortet.** Siffran i fliken och i den stängda raden är antalet kort (samma tal som "1 av 4" när kortet är öppet), och knappen Samtidigt behåller sitt eget tal. Ingen siffra och ingen fakta ändras.

## Hur det byggdes

- Det fanns redan: fliken (dator), den stängda panelen (mobil), valet att fälla ihop och öppna, och flikens siffra. Byggt nytt: startläget, raden i stängd panel (`#ff-peek-count`), namnet, flikens dynamiska namn för skärmläsare (`ff.show` med `{n}`) och nyckeln `ff.title`.
- **Sparat val.** `hg-ff-min` läses som förut men med ny standard: utan sparat val startar kortet litet, `0` (besökaren har själv öppnat kortet) startar öppet och `1` startar litet. En besökare som en gång har tryckt för att öppna kortet får alltså det öppet nästa gång. Det följer valet "öppna eller fäll ihop" som redan sparades; se frågan nedan.
- **Prov.** Webbläsartestets kontexter börjar som en besökare som har öppnat kortet (`hg-ff-min` = `0`), eftersom nästan alla kontroller prövar kortets innehåll; den nya kontrollen "Visste du?-kortet startar litet, öppnas vid tryck och heter likadant överallt (#1867)" prövar startläget som en ny besökare, dator och mobil, och namnet på fem språk. Två befintliga kontroller bytte text (pausraden och statusraden).

## Vad som återstår och vilka frågor som behövs

- **Vad räknas som "rör tiden"?** Beslutet säger att kortet öppnas "när besökaren trycker eller rör tiden". Det entydiga är byggt: tryck på kortet. Att kortet öppnar sig av sig självt när tiden flyttas (drag i reglaget, +1/−1, årshopp, uppspelning) är inte byggt, eftersom det skulle täcka globen så fort man utforskar och reglagets händelse inte skiljer ett handgrepp från ett programmatiskt årsbyte (turer, länkar, fokus). Fråga: ska kortet öppnas vid (a) varje flytt av tiden, (b) bara första gången, (c) bara när uppspelningen startas, eller (d) inte alls? Förslag: (c), så att pausen vid nya kort fortsätter att fungera.
- **Uppspelningen pausar inte vid nya kort medan kortet är litet.** Ett ihopfällt kort har aldrig pausat uppspelningen (`!ff.minimized` i `js/controllers/playback.js`), så med ett litet kort som standard pausar uppspelningen vid "Pausa vid Visste du?-kortet" först när besökaren har öppnat kortet. Det hänger ihop med frågan ovan; ändras inte här.
- **Ska ett öppnat kort komma ihåg att det var öppet?** Nu startar det öppet för den som en gång har öppnat det. Alternativ: starta alltid litet och spara bara att det fälldes ihop. Förslag: behåll, eftersom det är besökarens eget val.
- **Hur ska ett litet kort se ut i dator?** Den befintliga fliken är byggd; ett smalare kort med en rad och en pil är ett nytt utseende och väntar på ett ja.
- Kortet för krigets utbrott och rikets berättelse ligger i samma kort. Krigskortet säger nu "Visste du? · När ett krig bröt ut"; rikets berättelse har ingen namnrad som förut. Om krigskortet ska ha ett eget namn är en separat fråga.

## Uppföljning 2026-11-17

Frågorna ovan är avgjorda av DasKrokodil och byggda i [2026-11-17-visste-du-oppnas-vid-spela-1867.md](2026-11-17-visste-du-oppnas-vid-spela-1867.md): Spela öppnar kortet, ett litet kort pausar inte (oförändrat), ett öppnat kort kommer ihåg att det var öppet, den befintliga fliken behålls och krigskortet får inget eget namn.
