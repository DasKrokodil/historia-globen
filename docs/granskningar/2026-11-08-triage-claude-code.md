# Triage och djupanalys: plan, backlog, UI/UX och arkitektur (2026-11-08)

Från Claude Code (dirigent, DasKrokodils konto). **Förslag, inte beslut.** Inget issue är skapat, ingen etikett ändrad och ingen appkod ändrad. `handoff.json` är inte satt till `triaged`; det görs i en pull request efter Rikards godkännande (docs/granskningar/README.md).

Triagerar: Codex helhetsanalys och fördjupning i PR #875 ([komplett analys](2026-11-08-komplett-analys.md), [plan, backlog, UI/UX](2026-11-08-plan-backlog-uiux.md)), #871 (blind spots), språkkommentaren i #870 och tyskagranskningen [2026-11-07-tyska-828.md](2026-11-07-tyska-828.md). Nivå som passar: Opus för punkt 2 (arkitektur) och releasebedömningen, Sonnet high för UI-delen.

## 0. Slutsats i fyra rader

1. **Releasen är inte klar, och #876 löser bara en del.** #876 rättar F7 (faktarutan bakom lektionskortet), DE-1, SV-1 och tilltalet. Firefox och WebKit är fortfarande röda på release-PR:en och ingen PR rör dem. Det är den största kvarvarande risken.
2. **#865 och tre av de tio blind-spots-fynden (F6, F9, F10) är samma felklass: lägesövergångar utan ett gemensamt kontrakt.** Och två fynd på en vecka (F7 och U1) är samma felklass i lagerordningen. Att laga dem en och en kostar troligen mer än en liten, avgränsad strukturåtgärd (punkt 2).
3. **Webbläsartestet är på väg att bli flaskhalsen.** Chromium tog 23 min 43 s av 30 tillåtna (79 %) på `main`, och varje rättning ovan lägger till kontroller. #864 bör före övriga tekniska issues, inte efter #865 (Codex ordning).
4. **Översättningsflödet har en regelkonflikt som låser kön** (punkt 4): 43 issues, men bara Claude Code får ta dem enligt etikettregeln.

## 1. Vad jag har verifierat själv, och vad jag inte har

| Påstående i Codex-rapporten | Min kontroll | Utfall |
|---|---|---|
| **U1**: Samtidigt-panelen täcker Mer/Meny | `css/style.css:257` (`.top-actions`) och `:440` (`.panel`) har båda `z-index: 15`; `index.html:109` (menyn) ligger före `:357` (panelen), så panelen vinner. `.extra-menu` (z 17) ligger inne i menyns egen staplingskontext. | **Orsaken stämmer i koden.** Klicket i webbläsaren har jag inte kört själv; Codex logg och orsak är samstämmiga. |
| **U2**: tomma filter ger texten "Inget i datan inom ±N år" | `js/ui/panel.js:310` och `:322` använder `panel.empty`/`panel.emptyHelp` för all tomhet, utan att se på `filters`. | **Stämmer i koden.** Bara taggvyn (`:312–319`) skiljer på orsaker. |
| `timeline.js` har kvar svensk feltext | `js/timeline.js:567` | **Stämmer**, hör till #672 (ingen dubblett). |
| Fem händelser före `MIN_YEAR = -2999` klampas | `js/timeline.js:6, 23, 100` | **Stämmer.** Datakontrakt, inte faktafel. |
| #876 täcker bara F7, DE-1, SV-1, tilltal | PR-texten | **Stämmer.** F1–F6 och F8–F10 skulle bli issues. |
| Issues för resten finns | Öppna issues #877–#884 | **F1 saknas.** #877=F2, #878=F3, #879=F4, #880=F5, #881=F6, #882=F9, #883=F10, #884=F8. F1 (lektionslänken gömmer utskriften) har inget issue och är Codex P1 för lärarens väg. **Kontrollera om det är glömt eller medvetet.** |
| Firefox/WebKit röda | Run 42445261787 återges i rapporten | **Ej omkört.** Jag har inte läst jobbloggarna. |

**Inte kontrollerat av mig:** GitHub Project-vyn (ingen läsbar kanal i den här sessionen, så jämförelsen mot vyn återstår för Rikard eller en lokal session), Firefox/WebKit-loggarna, live- och dev-sidan, egen webbläsarkörning, skärmläsare.

## 2. Arkitekturen: det som faktiskt behöver bestämmas

Grunden är rätt och ska behållas: ES-moduler utan bygge, lagerregistret, en tid som styr allt, ekvirektangulär ritning. Inget talar för ramverk eller bundler. Datamängden är inget hinder (1,7 MB för 827 händelser, uppdelad per period och språk, 5 MB kust som laddas först vid inzoomning). Det som slits är **sömmarna mellan delarna**.

### A1. Ytorna (paneler, menyer, kort, ark) saknar en gemensam ordning

- `z-index` sätts med handskrivna siffror på ett trettiotal ställen i `style.css` (värdena 1–20, ofta 12–18 tätt intill varandra), och flera lägger sig i varandras staplingskontexter. U1 (panel mot meny, båda 15) och F7 (faktaruta 14 mot lektionskort 14, rättad till 15 i #876) är samma defekt två gånger på en vecka.
- Ömsesidig uteslutning görs för hand på minst sex ställen: `main.js:242, 438, 439, 551, 557`, `controllers/facts.js:58, 103`, `controllers/focus.js:206`. Varje ny yta (jakten, lektionsbandet, Källdetektiven, snart intervallet) måste läggas in i alla.
- **Förslag (liten–medel, inget nytt beroende):** namngivna lager i `:root` (`--z-karta`, `--z-kort`, `--z-panel`, `--z-meny`, `--z-ark`, `--z-dialog`) i stället för siffror, och ett litet register i `main.js` där varje yta anmäler sig i en grupp (sidopanel, meny, ark, dialog) och en öppnad yta stänger sin grupp. Rätta U1 med detta, inte med ännu en siffra.
- **Test:** en kombinationsmatris (varje huvudmeny med varje redan öppen panel, mät vad som tar emot klicket med `elementFromPoint`) i stället för fler isolerade prov. Det är metodändringen U1 kräver.

### A2. Lägesövergångar saknar kontrakt

Besökaren kan vara i Utforska, Fokus, Tur, Lektion, Jakt och snart Intervall. Varje läge sparar och återställer sitt tillstånd på sitt eget sätt, och `address.js` skyddar sig med ett booleskt `applying` (rad 26, 48, 72, 98) i stället för en versionsräknare.

| Fynd | Övergång som brister |
|---|---|
| #865 | gammal länk skriver över år/kamera efter att en tur startat (kapplöpning i `apply()`) |
| F6 / #881 | "Visa hela globen" återställer ett gammalt Fokus |
| F9 / #882 | språkbyte vid stegbyte tappar steget |
| F10 / #883 | reglagets ARIA-gränser följer inte lektionslåset |

- **Risk framåt:** #755 lägger till intervallet (`y2`) som ännu ett läge ovanpå samma mönster. Bygger vi det först får vi en femte variant av samma fel.
- **Förslag (medel, kräver Rikards ok eftersom det rör arkitekturen):** ett enda `läge` i `state.js` (`utforska | fokus | tur | lektion | jakt | intervall`) med `enter(läge)` och `leave(läge)` som sparar och återställer en ögonblicksbild, och en versionsräknare i adressen (en `await` får bara skriva om versionen fortfarande är aktuell). Gör **före #755**, och låt #865 vara första leveransen av den.
- Alternativ om Rikard vill hålla nere ändringarna: laga #865, F6, F9 var för sig och dokumentera kontraktet först när intervallet byggs. Billigare nu, dyrare efter #755. Jag rekommenderar kontraktet.

### A3. Webbläsartestet (#864 är högre prioriterat än Codex ordning)

- `tests/webblasare.mjs` är 3 339 rader och körs i en följd. Chromium: 23 min 43 s mot gränsen 30 (workflowfilens egen kommentar säger "växer med varje ny kontroll"). F7-testet, U1-matrisen och alla 6.0.1-fynd lägger till mer.
- Firefox och WebKit körs bara på release-PR:en. Därför syns deras fel först när allt annat är klart. De första felen är olika slags fel (typsnitt som inte laddas utan nät, ett turlänksfall som ger 1325 i stället för 1500, `JSHandle@object` i konsolen), så **ingen av dem ska avfärdas som "bara nät" innan loggarna är lästa**.
- **Förslag:** (1) #864 först, med full kontrolltäckning bevisad (samma antal kontroller före och efter). (2) Firefox/WebKit-utredningen som ett eget, avgränsat issue med första felande kontroll per motor. (3) Kombinationsmatrisen från A1 som eget jobb, så att den inte får gamla öppna paneler från föregående kontroll.

### A4. Texter och data

- Översättningsskulden är 8 345 (de) och 8 568 (es, fr) texter och får inte öka; spärren fungerar. JS har kvar enstaka svenska strängar (`timeline.js:567`) som #672–#673 redan täcker.
- Dokumentation: `docs/arkitektur.md` upprepar utskriftsavsnittet med olika uppgift (två respektive två–tre blad). Litet dokumentationsissue efter releasen.
- Lågt: 240 `addEventListener` mot 1 `removeEventListener`. Okej så länge ytorna lever hela sessionen; relevant först om dialoger skapas och släpps flera gånger (utskrift, jakt). Inget issue nu.

## 3. UI/UX

**Bekräftat och prioriterat (ordning efter vad som blockerar en besökare):**

| Prio | Fynd | Åtgärd | Agent och nivå |
|---|---|---|---|
| P0 | U1 Samtidigt täcker Mer/Meny (jakten kan inte startas med pekning) | A1: lagerordning + stänggrupp, inte `force` i testet | Codex bygger, Claude Code Sonnet high bedömer flödet |
| P0 | Firefox/WebKit röda | A3 punkt 2 | Claude Code Sonnet high (läser loggen, kör `ENDAST=`) |
| P1 | F1 lektionslänken gömmer utskriften (saknar issue) | Skapa issue efter ok; lärarens väg från länk till blad | Codex bygger, Claude Code granskar |
| P1 | U2 tomma filter beskrivs som "saknas i datan" | Tre skilda texter: alla kategorier av, lagret av, tomt år; "Återställ kategorier"-knapp. Alla fem språk | Codex, liten |
| P1 | #865, F6, F9, F10 | A2 | se A2 |
| P2 | F2, F3, F4, F8 | enligt respektive issue (#877, #878, #879, #884) | Codex |
| P2 | F5 / #880 underlaget på två språk | Claude Code (innehåll och språk) | Claude Code |

**Det Codex pekar på som hypoteser och jag behåller som hypoteser** (ska inte byggas före användarbevis): att nya besökare inte hittar sin väg i menyn (#571), och att rikesfokusets faktaruta kan läsas som "läget exakt det här året". Det andra hänger ihop med #786 och intervallets etiketter; ett riktat test med tre uppgifter (hitta något samtidigt, följ en berättelse, välj lärarmaterial) är billigare än omritning.

**Metodändring som ska in i testet (enligt granskningsmallen):** (1) kombinationsmatris med redan öppen yta, (2) mät vad som tar emot klicket och inte bara `isVisible()`, (3) felinjektion efter att sidan fungerat (bildfel, källregister, turfil), (4) omedelbara användarbyten före adressens fördröjda skrivning, (5) ett skolflöde ska bevisas som *fråga → underlag → svar → återgång* i samma mobilvy.

## 4. Backloggen

- **Storlek:** 168 öppna issues enligt GitHub (160 enligt Codex ögonblicksbild; olika tidpunkt). Av dem hör ungefär 43 till översättning och 26 till "Paket: Temavyer" (Codex mätning), alltså omkring 40 % av kön, och inget av det är nästa arbete.
- **Regelkonflikt som låser översättningarna:** CLAUDE.md säger att Codex och Copilot aldrig tar issues med `data`, och AGENTS.md rad 101 säger att innehåll med historiska fakta bara tas "om Rikard ber om det". Översättningsissuena (#776–#835) har `data`. Beslutet 2026-11-06 vill att översättningar ändrar ingen fakta, vilket är en annan sak än att skriva fakta. Resultatet i dag: bara tre `redo` (#776, #803, #839), alla för Claude Code, och 40 väntande. Claude Code på Opus är den dyraste vägen för ren textöversättning. **Beslut behövs** (punkt 7, fråga 2).
- **Statusglapp, mina bedömningar (ändras inte utan Rikards ok):**

| Issue | Läge | Förslag |
|---|---|---|
| #764, #765 | `behöver hjälp`, väntade på #852 som är ihopslagen | Ta bort spärren på #764 efter filkrockskontroll; #765 väntar på #764 |
| #864 | förutsättningen #855 är ihopslagen, saknar `redo` | Sätt `redo` efter att grenskydd och kontrollnamn är kontrollerade (Rikard, API:et gav 403 för Codex) |
| #838 | `beslut-krävs`, men första nivån är byggd | Skilj byggt (18 poster) från framtida flik/quiz; Rikard avgör etiketten |
| #489 / #753 | gammal order med föråldrad spärr | En aktuell order som pekar på #753 |
| #299 | titel "437" men 625 saknar bild | Uppdatera titeln |
| #85, #86 | `redo`, men tidigare anspråk i kommentarer | Läs den första anspråkskommentaren före start |
| #843 | extern remissgrind | Ingen arbetarplats; bevaka datum |
| F1 | inget issue | Skapa (punkt 1) |

- **Inga dubbletter bland Codex fynd** förutom det de själva anger. #846 och #850 är skilda (tid ur fun facts respektive myter ur missuppfattningar); samordna först när besluten finns. #866 och #873 (asatro, tro utan stat) bör beslutas tillsammans, eftersom de gäller samma lucka i religionslagret med olika lösning.
- **Föreslagen rensning (kräver ok):** låt översättningsissuena ligga som delissues men håll `redo` bara på nästa i varje språkkö, och flytta samlingsrubrikerna (#66, #250, #556, #63) till "nästa konkreta leverans" i sin första rad. Då syns den riktiga kön.

## 5. Rekommenderad arbetsordning (minst växling och ombasering)

| Steg | Vad | Agent / nivå | Grind |
|---|---|---|---|
| 0 | Slå ihop #876 (om kontrollerna blir gröna). #874, #871, #875 beslutas som dokument | Rikard | Rapportgodkännande är inte releasegodkännande |
| 1 | **#864** delad svit, med bevisad kontrolltäckning | Codex bygger, annan körning granskar; Sonnet high bedömer testdesign | Eget testfönster: inga andra UI-ändringar i `webblasare.mjs` samtidigt |
| 2 | **Firefox/WebKit-utredning** (första felet per motor) | Claude Code Sonnet high | Måste vara klar före releasebeslut |
| 3 | **U1 + A1** (lagerordning, stänggrupp, kombinationsmatris) | Codex, Sonnet high bedömer | Full kontroll dator och mobil |
| 4 | **A2 + #865** (lägeskontrakt och adressens versionsräknare), därefter F6, F9, F10 på samma grund | Codex; Opus bedömer kontraktet; Rikards ok först | Full kontroll av centrala flöden |
| 5 | U2, F2–F4, F8, F1 (när de har issues) | Codex, små | Riktad kontroll |
| 6 | Release 6.0.0 efter tre motorer på slutlig commit och språkgrind | Rikard beslutar | Releasekontroll |
| 7 | #754 → #755 → #756 (intervallet) | Codex; Sonnet high | #754 kan förberedas parallellt (egen fil, `date-events.js`) om det finns en plats |
| 8 | #15, #786, #845/#476 (källlista först), #579 | enligt Codex plan | efter intervallet |

**Parallellt, utan filkrock:** dataspåret hos Claude Code (#764 efter kontroll, #766, #85/#86, en batch om högst 20 poster i taget, minst tre världsdelar) och den ägarlösa förberedelsen av #754. Alla datapull requests delar `sources.json`, `data/genererat/` och `oversattning.json`; en period i taget.

**Skillnad mot Codex ordning:** #864 tidigare (steg 1 mot steg 3), Firefox/WebKit uttryckligen före release, lägeskontraktet före #755 i stället för bara #865, och F1 som saknat issue.

## 6. Samarbete, kostnad och granskningsgrindar

**Arbetsregler för den här kön:**

1. **Codex bygger, en annan körning granskar, Claude Code bedömer** det som kräver dirigent: besökarflöde (Sonnet high), arkitektur och fakta (Opus). Bygg aldrig och granska i samma körning.
2. **Handoff ska bära bevis:** exakt commit, berörda filer, första felande kontroll, reproduktionssteg, synligt före/efter (år, kamera, öppen yta), testresultat och vad som inte kontrollerats. Nästa agent ska inte läsa hela kön igen.
3. **Grindar:** full kontroll för steg 3, 4 och 6 (central yta, tillstånd, release). Riktad kontroll för steg 5. Ingen full svit flera gånger på oförändrad kod; efter #864 räcker det jobb som berörs plus kombinationsjobbet.
4. **En UI-arbetare i taget** på `style.css`, `panel.js`, `main.js` och `webblasare.mjs`. Dataspåret går parallellt.
5. **Max fyra öppna PR per konto:** i dag är det fem öppna PR:er på samma konto (#870, #871, #874, #875, #876). Reglerna säger att arbetet då ska gå till egna PR:er, granskning och förberedelse, inte nya PR:er. Detta är skälet till att ingen byggstart föreslås före steg 0.

**Tokenbudget (planeringsintervall i tusen modelltoken, inte uppmätt förbrukning):** jag återanvänder Codex intervall för #754–#756, #864 och #865 (tabellen i helhetsanalysen) och lägger till det som är nytt:

| Nytt | Codex förberedelse | Codex bygge + separat granskning | Claude Code | Osäkerhet |
|---|---:|---:|---:|---|
| A1 (U1 + lagerregister + matris) | 3–6 | 18–36 | 6–12 (Sonnet high) | Medel–hög; staplingssamspel |
| A2 (läge + versionsräknare, med #865) | 4–8 | 25–50 | 10–20 (Opus) | Hög; rör centralt tillstånd |
| Firefox/WebKit-utredning | 0 | 0 | 10–25 (Sonnet high) | Hög; okänd rotorsak |
| U2 | 1–2 | 5–10 | 2–4 | Låg |
| F1 + F2–F4, F8 (fem små) | 2–4 | 20–40 | 6–12 | Medel |

Reserv 25 %. Faktisk förbrukning exponeras inte här och kan inte jämföras med intervallen; den ska noteras per avslutat issue där den går att läsa. Om kapaciteten är knapp skjuts regionkort (#579), nya quizvarianter och epokknappar först; kedjan 1→2→3→4 bryts inte.

## 7. Täckning och benchmark (triage)

- **Täckning:** jag instämmer i Codex prioritering: förhistorien och tidsmodellen (fem händelser före `MIN_YEAR`, noll i Amerika och Oceanien; väntar på #396/#767), icke-krig i modern tid och tidigmodern Asien (#766 delvis), 1100–1300-talen (#764/#765). Min tillägg: **fun facts är 56 mot 827 händelser (11,9 % kopplade)**; samtidighetsidén, som är produktens kärna, har alltså minst täckning. Det borde vägas tyngre än fler bilder. Siffran "90 % med två käll-id:n" får inte läsas som "tvåkällsgranskat" (det är 50,8 %).
- **Benchmark:** Codex fem idéer är rimliga. De jag skulle triagera vidare är (1) intervallets tydliga urval och antal (redan #754–#756), (2) lärarvägen från en lektionslänk till elev- och lärarblad (täcks av F1), (3) "gissa, läs facit, öppna källan" ur missuppfattningarna (#846/#850, väntar på beslut). Inget kopierat; NC-SA-innehåll har inte använts.

## 8. Beslut jag behöver från Rikard

Rekommendation står först i varje fråga (regeln i #874).

1. **Lägeskontrakt och lagerordning (A1, A2) före intervallet?** *Rekommendation: ja.* Alternativ: laga fynden var för sig; billigare nu, dyrare efter #755.
2. **Får Codex ta översättningsissuena (`data`, ändrar ingen fakta), med Claude Code som stickprovsgranskare?** *Rekommendation: ja, med en ny etikett `översättning` så att regeln om `data` ligger kvar för fakta.* Alternativ: kvar hos Claude Code (Opus, dyrt, ger en kö på 40).
3. **#864 före #865 och före release?** *Rekommendation: ja.* Alternativ: efter releasen; då riskerar Chromium att passera 30 minuter mitt i rättningarna.
4. **Får jag skapa issue för F1 och U2, samt uppdatera etiketter och titlar enligt tabellen i punkt 4?** *Rekommendation: ja.*
5. **Release 6.0.0 först efter att Firefox/WebKit är utredda?** *Rekommendation: ja.* Alternativ: släpp med dokumenterad begränsning ("endast Chromium provat"); jag avråder, eftersom skolor ofta kör Safari.

## 9. Begränsningar

Ingen webbläsarkörning, inga Firefox/WebKit-loggar, ingen projektvy, ingen live- eller dev-sida och ingen skärmläsare har kontrollerats av mig i den här sessionen. Orsakerna till U1 och U2 är verifierade i koden, inte i webbläsaren. Inga historiska uppgifter har lagts till eller ändrats, och inga källnivåer är höjda.
