# Webbläsartestet delas i tre parallella jobb (#864)

**Datum:** 2026-11-08

## Beslut
1. Webbläsartestet i Chromium (`.github/workflows/browser-test.yml`) delas i **tre parallella jobb**, som står i `tests/jobb.json` (en enda källa för workflowen och kontrollerna):
   - **tung:** datorbredd, bara kontroller vars namn innehåller `lektion`, `skriver ut` eller `ryms på en A4`
   - **dator, övrigt:** datorbredd, allt utom det tunga, och de tre avsnitten med egna fönsterstorlekar (zoom och omflödning, reducerad rörelse, presentationsläge)
   - **mobil:** mobilbredd (400 × 800), alla kontroller
2. Varje Chromium-jobb får **25 minuters** tidsgräns (mål: cirka 15 minuter i CI). Det ersätter tidsgränsen i [2026-11-07-chromium-tidsgrans-30-minuter](2026-11-07-chromium-tidsgrans-30-minuter.md) och nödlösningen på 45 minuter i [2026-11-08-chromium-tidsgrans-45-minuter](2026-11-08-chromium-tidsgrans-45-minuter.md), som uttryckligen gällde tills sviten delats; resten av de besluten (skäl, avvisade alternativ) står kvar som historia. Firefox och WebKit behåller 45 minuter.
3. **Firefox och WebKit delas inte.** De körs bara på release-PR:er och med etiketten `alla-webbläsare`, är under utredning (#888) och har inte mätts per bredd; en delning tredubblar antalet jobb som ska startas, installeras och cachas för något som inte är flaskhalsen. Ompröva när #888 är klart.
4. `tests/webblasare.mjs` får två nya miljövariabler, och urvalet ligger i `tests/urval.mjs` så att testet och beviset använder samma regler:
   - **`BREDD=dator|mobil`** (flera med `|`): kör bara de bredderna. Utan `BREDD` körs båda. Okänt värde avslutar testet med fel. Avsnitten med egna fönsterstorlekar körs när `BREDD` saknas eller innehåller `dator`.
   - **`UTAN=<text>`** (flera med `|`, versaler spelar ingen roll): kör allt utom kontroller vars namn innehåller texten.
   - **Samspel med `ENDAST` (#587):** anges båda körs det som matchar `ENDAST` men inte `UTAN` (först väljs in, sedan tas bort). Matchar de tillsammans ingenting avslutas testet med fel, som förut för `ENDAST`. `sidan svarar` och `globen laddas` körs alltid (de öppnar sidan), och `inga fel i konsolen` skrivs alltid; ingen av variablerna kan ta bort dem. Utan variablerna är beteendet oförändrat.
5. **Ingen kontroll får tappas bort.** `scripts/kontrolltackning.mjs` läser kontrollnamnen ur testfilen och kontrollerar per bredd att varje kontroll körs i exakt ett jobb (och varje avsnitt i exakt ett). Det körs först i workflowet (jobbet "Planera webbläsartestets jobb"), så en ny kontroll som skulle hamna i noll eller flera jobb gör körningen röd innan någon webbläsare startar. Ändras `tests/jobb.json` räknas urvalet om automatiskt; en ny kontroll behöver inte läggas in någonstans.
6. Varje jobb sparar en egen skärmbildsartefakt: `skarmbilder-chromium-tung`, `-dator` och `-mobil` (Firefox och WebKit: `skarmbilder-firefox-allt`, `skarmbilder-webkit-allt`).
7. **Kontrollnamnen i GitHub ändras:** "Öppna sidan i Chromium" blir "Öppna sidan i Chromium, tung (lektion och utskrift)" m.fl. Enligt `docs/DEPLOYMENT.md` (inställningarna 2026-10-30) är webbläsartestet inte en krävd kontroll i något ruleset (bara "Bygg och validera dist/" och "Release kommer från main"), så PR:er ska inte hänga som "pending". Det är inte kontrollerat mot GitHubs inställningar härifrån; DasKrokodil behöver titta under Settings → Rules om webbläsartestet har lagts till sedan dess.

## Varför
Före delningen tog allt i ett jobb 24 minuter på main (23 min 43 s före #876), och körningen för #855 avbröts vid 30 minuter. Varje rättning i version 6.0.1 lägger till kontroller. De två tyngsta kontrollerna (lektionsläget och elevbladet/lärarbladet) tog 526 s och 391 s i CI och gör att en delning bara på bredd inte räcker. De nya variablerna behövs eftersom `ENDAST` bara kan välja in. Delningen tar inte bort någon kontroll, och beviset ovan gör det möjligt att lita på det även när sviten växer.

## Berör
`.github/workflows/browser-test.yml`, `tests/webblasare.mjs`, `tests/urval.mjs`, `tests/jobb.json`, `scripts/kontrolltackning.mjs`, `docs/DEPLOYMENT.md`. Hör ihop med #863, #587, #888 (Firefox och WebKit) och #891 (kombinationsmatris), som bygger på delningen.
