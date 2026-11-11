# Releaseanalys v6.2.0 (UI/UX-uppdatering)

**Datum:** 2026-11-11
**Omfattning:** allt som ändrats sedan v6.1.0 (`origin/production` mot `origin/main` `32ec13d`): 84 commits utan sammanslagningar, 38 ihopslagna pull requests. Enligt beslutet [2026-11-10-expertgranskning-fore-release.md](../beslut/2026-11-10-expertgranskning-fore-release.md) har experterna granskat ändringarna samlat före releasen. Experterna har inte ändrat några filer.
**Körd av:** Claude Code. Experter: `sprak-en`, `sprak-de`, `sprak-es`, `sprak-fr`, `historiker`, `geograf`, `larare`, `ux-tillganglighet` och `arkitekt`. `forhistoriker` kördes inte (inga förhistoriska ändringar).
**Mätning:** `python3 tools/tackning.py` ([tackning-2026-11-11.md](tackning-2026-11-11.md)): 879 händelser (Europa 174, Asien 236, Afrika 146, Amerika 185, Oceanien 138).

## Kort slutsats
Ingen expert hittade något som blockerar releasen. Målet för 6.2.0 ("ett tydligt samtidigt, färre ytor, ett ord per sak") är till största delen nått. Fynden är språk- och ordvalsfrågor, några mindre kodrisker och flera redaktionella förbehåll. Det som skulle kunna räknas som kvarstående krav står under "Beslut före publicering".

## Vad som släpps
- **Översikt som startvy** (#868, #1055, #1021): fältet `significance` på 123 godkända händelser och vyn Översikt i Lager.
- **UX-rättningarna ur `docs/ux-review/`** (#991–#1004): en läsyta åt gången på dator (#998), "Kom igång" och engångstips (#996), tidsfönstret i vardagsspråk (#994, #995), tidslinjens markeringar ur tabbordningen och teckenförklaring (#1000, #1003), "Hur vet vi det här?" (#937), "Visste du?" med "Tillbaka" (#997), en knapp framåt i turer (#999), turlistan (#1002), etiketter på klotet (#1022), iPad stående (#992), skärmläsarstöd i intervallformuläret (#977), epoknamn (#979, #980).
- **Lagerordning och stängregister** (#894, #1064, #1065, #1131): namngivna lager i CSS, kontroll mot nya handskrivna z-index-siffror, `js/surfaces.js` för menyer och sidopanel.
- **Innehåll:** 56 nya händelser (Grönland, Skåne, Nya Zeeland, två i Kiel och Washington), 11 Oceanien-bilder (#1033), tyska översättningar av vägarna, `significance`.
- **Det första temat, Teknik** (#105, del a): hör egentligen till 6.3.0, men ligger på `main` och följer med (se beslut 1).

## Beslut före publicering (DasKrokodil)
1. **Teknik följer med i v6.2.0.** Beslutet 2026-11-09 placerar teman i 6.3.0, och UX-granskaren (B8) bad om bekräftelse. Konsekvens: fliken Teman visas med ett tema, medan #1113 (hitta och lämna temat) inte är klar. Alternativ: släpp ändå, eller vänta med releasen, eller ta bort `data/teman.json` ur releasen (då är temat tomt som i v6.1.0). Min rekommendation: släpp ändå, eftersom temat är testat i webbläsartestet och valideringen är grön, och skriv det i release-PR:en.
2. **Täthetsbandet på tidslinjen (#1000, del 3)** är byggt (`js/timeline.js`, `DENSITY_LIMIT`), men beslutet i docs/beslut/2026-11-09-ui-ux-efter-6-1-0.md om #1000 är enligt UX-granskaren öppet. Bandet är `aria-hidden` och teckenförklaringen förklarar det inte. Bekräfta att det ska släppas, eller låt teckenförklaringen förklara det.
3. **Ordval (#1140)** och **Översikt (#1139)** är beslutsissues som inte blockerar. De ändrar text, så de bör beslutas före nästa release.

## Fynd per expert (sammandrag)

### Arkitekt (risk låg till medel)
Beslut 1–6 följs: three.js 0.160.0, inga nya beroenden, ES-moduler utan bundler, rendering via ekvirektangulär canvas. `node --test` (217 av 217), `scripts/build-site.sh` och `scripts/kontrolltackning.mjs` gick igenom. Fynd: `js/url-state.js` importerar `MIN_YEAR`/`MAX_YEAR` ur `js/timeline.js`, och `MAX_YEAR` följer kalenderåret; Översiktsvillkoret finns på två ställen; stängregistret är bara delvis genomfört; kameralänksflaggan nollställs aldrig. Alla fyra ligger i **#1141**. En gammal länk `f=theme:<okänt id>` saknar tydlig reservväg: det ingår i **#1113**. Gamla länkar med `y` utanför tidslinjen flyttas (avsiktligt, #892).

### UX och tillgänglighet
Löst enligt koden och mätt på 400, 820 och 1280 px (sv och de, ingen horisontell scroll, inga konsolfel): tidsfönstret i klartext, 38 tabbstopp i mobil i stället för cirka 655, faktarutan som egen läsyta, iPad stående, intervallformulärets aria. Viktigt: fönstertexten klipps på 400 px (**#1134**); stängregistret har bara tre ytor (**#1141**); täthetsbandet är byggt innan beslutet (se beslut 2). Tillgänglighetsfynden (f.Kr.-knappens namn, `aria-live` på `#detail`, fokus vid faktarutan, träffytor, `aria-invalid`) ligger i **#1138**. UX-fynd i `docs/ux-review/` som fortfarande är öppna: definitionen av "samtidigt" och typade fun facts, grupperna Hände/Pågick/Strax före, en bakgrund och högst två överlägg, synlig tidsskala, färre kartecken.

### Historiker
Öppnade 16 källsidor och kontrollerade 13 av de 14 händelserna i Teknik och sju av de 52 nya händelserna: allt som öppnades stämmer. Möjliga fel och osäkerheter (Muskötkrigens spann, Watts första användning, Landskrona i Skånska kriget) ligger i **#1136**. Temat fick `wp-sintashta-culture` som källa efter historikerns förslag. Oöppnat: telefonen, Wright, Sputnik och webben i Teknik, 45 av de 52 nya händelserna, licenserna för Lex och Store norske leksikon (ska bara länkas), bildlicenser mot Commons-filsidor, rikena och perioderna. **Obs:** historikern fann ingen ändrad `start`/`end`/`edtf` i befintliga händelser; kalenderrättningarna ligger i så fall i texter.

### Geograf
Inga viktiga fynd. Teknik når fem världsdelar (Asien 5, Europa 4, Amerika 3, Afrika 1, Oceanien 1) men ingen händelse ligger i Afrika söder om Sahara (hör till #1111). `ostgronlandsmalet` räknas som Europa (**#1135**). Många nya händelser delar punkt (Wellington, Skåne, Nuuk, Luoyang) och ritas ovanpå varandra; det är redaktionellt och inte provat visuellt. Ej granskat: kamera- och adresslänkar (#1058), rutterna (bara översättningar ändrade), koordinaterna för de 56 nya händelserna (bara Telegraflinjen mot Wikidata).

### Lärare
Inget blockerar. Starkaste förbättringarna: synlig startknapp på varje tur, "Hur vet vi det här?", en framåtknapp, "Tillbaka" efter Visste du?. Viktigt: Översikts förklaringstext säger emot sidans idé och överdriver stödet från Lgr22, urvalet markeras inte i Samtidigt, och lektionsläget fungerar med Översikt bara som bieffekt: alla tre i **#1139**. Bör rättas: "samband" för fun facts och "Fokus"/"Sök och följ" (**#1140**), "Tillbaka" i 8 sekunder (#1138). Luckor (skolan): bara två lektioner (andra världskriget, vikingatiden), ingen tur för 1500–1800, 1800–1900 eller demokratiseringen enligt Lgr22, inget lärarstöd för Översikt, ingen källtyp i "Hur vet vi det här?", inget kort om tidsbegrepp, ett enda tema. Luckorna blockerar inte releasen.

### Språk (en, de, es, fr)
Inga blockerare och inga sakfel. Genomgående gott språk, rätt tilltal. Gemensamma fynd (`discovery.coverageNote` med "empires"/"reworked", procenttecknet, `theme.huntImpossible`, informellt tilltal på es, BCE/BC, "License", m.fl.) ligger i **#1137**; ordfrågorna (Fokus, upptäcktsvyn, samband, produktnamnet på affischen) i **#1140**. Temat Teknik rättades i den här pull requesten (es, fr, de) efter experternas förslag. Ej granskat: cirka 80 av 191 engelska händelsetexter, `note`-texter och `place`-fält, passform i mobilbredd, turtexterna. Spärren för oöversatta texter (`tools/oversattning.py`) gick igenom; cirka 130 ändrade händelser saknar fortfarande tyska titlar (äldre skuld, enligt spärren inte ökad).

## Luckor (saknas)
Hör till `historiker`, `geograf` och `larare` (beslut 2026-11-10, "Luckor") och blockerar inte releasen. Alla är mått ur `tools/tackning.py`, inte listor över vad som saknas; saknade händelser avgörs med öppnad källa.
- **Förhistoria (före 3000 f.Kr.):** 5 händelser, 0 i Amerika och Oceanien.
- **Teknik i Afrika söder om Sahara:** ingen. Teknik mellan år 500 och 1440: inget i temat (kan ge intrycket att medeltiden saknade teknik); `diamantsutran-trycks` ingår inte.
- **Sekelglapp med färre än 3 händelser:** 1000-talet Asien, 1100-talet Afrika, 1200-talet Amerika, 1300-talet Europa/Asien/Amerika, 1400-talet Europa, 1500-talet Oceanien, 1600-talet Amerika.
- **Kategorier:** sport 9, natur 6, `manniskan` 0 i tidigmodern tid; Översikt saknar natur, sport och katastrofer.
- **Översikt:** Oceanien 7 av 123 (cirka 5,7 % mot 15 % av alla), 2000-talet 4 händelser. Godkänt av DasKrokodil 2026-11-09.
- **Skolan:** se Lärare ovan; Lgr22-täckning och turer är de tydligaste luckorna (#1012).

## Nya issues
#1134 (mobil: klippt fönstertext), #1135 (Östgrönlandsmålet), #1136 (källgranskning), #1137 (språkrättningar), #1138 (tillgänglighet), #1139 (beslut: Översikt), #1140 (beslut: ordval), #1141 (kodstädning).

## Vad analysen inte har gjort
Ingen webbläsare har körts av experterna för de flesta fynd (UX-granskaren mätte med Playwright på tre bredder), ingen skärmläsare, ingen riktig pekskärm, ingen Firefox eller WebKit utöver CI-körningen för release-PR:en. Personor och upplevelser är antaganden tills en riktig observation finns.
