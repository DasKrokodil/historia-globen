# Arkitektur

Hur Historia-globen är uppbyggd och varför. Den här filen uppdateras i samma pull request som koden när något av det här ändras. De bindande principerna står också i [CLAUDE.md](../CLAUDE.md#arkitektur-beslutad-ändra-inte-utan-att-fråga), och besluten bakom dem i [beslut.md](beslut.md).

## Principer

1. **Inget byggsteg.** Vanliga ES-moduler som webbläsaren läser direkt. Inga ramverk, ingen bundler och ingen server. Det räcker med `python3 -m http.server`.
2. **Data skild från kod.** Allt innehåll (händelser, fun facts, källor, riken, religioner, bildstilar) ligger i `data/`. Koden innehåller inga händelser, texter eller årtal.
3. **Ett år styr allt.** Tidslinjen äger det nuvarande året och skickar `change`. Allt annat lyssnar och ritar om.
4. **Allt ritas på en platt bild först.** Grundkartan och lagren ritas på ekvirektangulära bilder (4096 × 2048) som läggs på klotet. Samma platta bild kan skickas till en fysisk globskärm, och "Platt vy" visar den.
5. **Lager som moduler.** Varje lager har samma gränssnitt: `update(state)` väljer vad som syns, och `drawOverlay(ctx, W, H)` ritar det på den platta bilden.
6. **Ett enda externt beroende:** three.js 0.160.0 från jsDelivr.

## Hur delarna hänger ihop

```mermaid
flowchart LR
  T[Tidslinjen<br/>js/timeline.js] -- change: år --> M[main.js<br/>refresh]
  M --> L1[Händelser<br/>layers/events.js]
  M --> L2[Riken<br/>layers/areas.js]
  M --> L3[Religioner<br/>layers/religions.js]
  M --> L4[Krigsområden<br/>layers/wars.js]
  M --> L5[Dagens gränser<br/>layers/borders.js]
  L1 & L2 & L3 & L4 & L5 -- drawOverlay --> O[overlayCanvas<br/>4096 × 2048]
  B[land.json] --> BC[baseCanvas<br/>4096 × 2048]
  BC & O --> G[Klotet<br/>js/globe.js]
  BC & O --> F[Platt vy]
  M --> P[Samtidigt i världen<br/>ui/panel.js]
  M --> S[Samtidigt-kortet<br/>ui/funfact.js]
  M --> D[Faktarutan<br/>ui/panel.js]
```

Varje gång året ändras körs `refresh()` i `main.js`:

1. Samtidigt-kortet väljer vilka fun facts och krigskort som gäller. Kort som jämför flera händelser visas först, sedan det som började senast.
2. Händelselagret väljer synliga händelser, och listan Samtidigt i världen ritas om.
3. Riken, religioner, dagens gränser och krigsområden väljer vad som finns det året.
4. Lagren ritas i ordning nedifrån och upp på den platta lagerbilden: riken, religioner, dagens gränser, krigsområden och händelsernas sken.
5. Lagerbilden läggs på klotet, och på platta vyn om den är öppen.
   Rikesnamnen ritas mindre i bilden vid kraftig zoom (`areas.labelScale`, storlek ≈ förstoring^-0,7 men högst ned till 0,25, och `labelAlpha` tonar ut dem mot max zoom; omritning 150 ms efter att zoomandet stannat) så att de inte dominerar skärmen eller täcker markörer; platta vyn visar dem i grundstorlek (#154).
6. Pauser kontrolleras: fun facts, när ett krig bryter ut, krigets stora händelser och religionens grundande. I fokusläget pausar Samtidigt-kortet bara med valet "även i fokusläget", och efter slutkortet heter spelknappen "Spela igen".

Klickbara markörer, etiketter och bågar ligger ovanpå klotet som 3D-objekt och HTML, inte på den platta bilden. Etiketter som ligger nära varandra slås ihop till kluster (`ui/clusters.js`). Etiketterna hålls inom skärmen och läggs aldrig ovanpå andra markörer eller klusterbrickor (#142).

## Moduler

| Fil | Ansvar |
|---|---|
| `js/main.js` | Startar allt, kopplar ihop delarna, fokusläget, pauser och etiketter |
| `js/model.js` | Språk (`t()`), kategorier, granskningsnivåer, tidsformat, världsdelar, bildstilar (`styleFor()`), laddning av data |
| `js/globe.js` | Klotet (three.js), kamera, styrning, de platta bilderna, bågar |
| `js/timeline.js` | Tidsreglaget med segmenterad skala, fokusspann, uppspelning, hastighet och "Hoppa till år" |
| `js/layers/events.js` | Punktlager: händelser med ikon och sken |
| `js/layers/areas.js` | Områdeslager: riken som ändras över tid |
| `js/layers/religions.js` | Områdeslager: rikenas religion, och en stjärna där religionen uppstod (`facts.origin`) |
| `js/layers/wars.js` | Krigsområden runt krigets och slagens platser, ett område per krigsskådeplats (platser inom cirka 2 000 km från varandra, #211), med världsdelen som etikett när man följer kriget (#236) |
| `js/layers/borders.js` | Dagens landsgränser (av som standard) |
| `js/ui/panel.js` | Samtidigt i världen per världsdel, kategorifilter (raderna är `<button class="event-btn">` med `aria-label` av år, titel, världsdel och granskningsstatus, #238), faktarutan med bild och ram, krigets berättelse, faktarutan om en religion eller ett rike (`showFacts`) |
| `js/ui/funfact.js` | Samtidigt-kortet: fun facts, "När ett krig bröt ut" och rikets berättelse i fokus (`empireStory`, #171), kan fällas ihop. Händelsernas bilder visas alltid överst i kortet (#190), högst tre sida vid sida (`_renderPics`), med bilden från händelsens `image`, ramen från `styleFor()` och en knapp "Läs mer" som öppnar faktarutan (`ff.onSelect`) med full bildtext, kredit och licens. Under bilden står ingen text utom händelsens namn när det är flera; illustrationer får etiketten "Illustration" i hörnet. Har ingen händelse i kortet bild visas ingen bildrad, utom för krigskort (#237): de får en egenritad grafisk symbol (händelsens `icon`, annars kategorins ikon ur `CAT_ICON`, i stor storlek ur `img/icons/` på tidsålderns ram) märkt "Grafisk symbol" (`_renderSymbol`), aldrig "Illustration". Händelseknapparna under texten öppnar också faktarutan (och flyger globen dit). Kortet rullar inuti och går aldrig utanför skärmen. I smal skärm (≤760 px, #168) är bildraden låg (se Mobilpanel nedan), texten klipps efter två rader med bild (tre utan, tryck för hela), händelseknapparna döljs när bildrutorna finns och radbryts annars (ingen sidscroll, inget namn klipps), och alla kontroller har minst 44 × 44 px tryckyta. **Mobilpanel (#239):** i smal skärm är kortet en panel underifrån, med gutter på båda sidor, och ett handtag överst (`#ff-handle`, en knapp med `aria-expanded`). Panelen har tre lägen, klasserna `ff-s-closed` (handtaget och rubrikraden), `ff-s-half` (kompakt, bildraden 52 px) och `ff-s-full` (allt syns, upp till cirka 100 px från överkanten, rullar inuti). Ett tryck på handtaget stegar stängd → halv → hel → stängd, pil upp och ner byter läge, och man kan dra: höjden följer fingret, och när man släpper väljs det läge vars höjd ligger närmast (`_measureSheet()` mäter de tre höjderna utan att något ritas). Att stänga med handtaget är samma sparade val som att fälla ihop kortet i datorn (`hg-ff-min`): ingen paus vid nya kort, och fliken `#ff-tab` och knappen − används inte i smal skärm. När man drar i globen (mer än 12 px, lyssnaren ligger i `main.js`) anropas `ff.autoClose()`: panelen stängs utan att valet sparas, och nästa nya kort öppnar den halvt igen och pausar som vanligt. Panelens underkant står i `--ff-b` (ovanför tidslinjen, pausraden och fokusraden, i fokus `--focus-top` från #183). Datorn är oförändrad |
| `js/ui/legend.js` | Teckenförklaring och klickruta för religionslagret (#166), i fokusläget också för krigsområden och dämpade lager (#235, #236): HTML över globen, inte i kartbilden. Teckenförklaringen listar religionerna som syns året (`ReligionsLayer.legendItems()`); ett klick på ett område (`Globe.pickLatLon` + `ReligionsLayer.hitTest`, punkt-i-polygon i lon/lat) visar religion och rike. Händelsemarkörer har företräde. Teckenförklaringen ligger uppe till vänster under rubriken (inte nere till vänster där Samtidigt-kortet är): en hopfällbar ruta, öppen i dator och en knapp i mobil, vars lista `fit()` kortar av så att den slutar ovanför Samtidigt-kortet, faktarutan, panelen och fokusraden (#193). Rikets namn på just den platsen (#194) tas fram med `ReligionsLayer.polityAt` mot rikenas egna gränser i `data/religions-polities.json`: bara rikena i det träffade området prövas, enskilda skeden före Cliopatrias sammanslagningar inom parentes, och svenska namn hämtas ur `data/empires/index.json` där de finns |
| `js/ui/layers.js` | Lagermenyn och valen för pauser |
| `js/ui/focusmenu.js` | Fokusmenyn: följ ett krig, ett rike eller en religion. Sökfält (filtrerar på namn bland alla poster, inte bara de nära året) och flikarna Alla, Krig, Riken och Religioner; senaste fliken sparas i localStorage (`hg-focus-tab`, #240) |
| `js/ui/help.js` | Kort hjälp för nya besökare (#245): tre steg ("Dra globen", "Byt år", "Följ en berättelse"; texterna står i `index.html`). Visas första gången (`hg-help-seen` i localStorage, med try/catch; utan lagring vid varje besök) under knapparna uppe till höger, försvinner vid första interaktionen någon annanstans (tryck, klick, hjul eller tangent utom Tab), med Stäng eller Escape, och öppnas igen med knappen Hjälp (`aria-expanded`, fokus till Stäng) |
| `js/ui/sources.js` | Sidan Om källorna (knappen Källor, #245): källregistret grupperat efter användning, granskningsläge per grupp och sökning |
| `js/ui/clusters.js` | Klustring av etiketter |

## Laddning av data

Vid start laddas det som behövs direkt: händelser, fun facts, källor, grundkartan, dagens gränser, bildstilar och rikenas register (`data/empires/index.json`).

Stora filer laddas först när de behövs:

- **Ett rike** (`data/empires/<rike>.json`) laddas när året närmar sig rikets tid (inom 100 år) eller när man väljer det i Fokus.
- **Religionerna** (`data/religions.json`) laddas när religionslagret slås på eller när Fokus-menyn öppnas.
- **Rikenas gränser i religionslagret** (`data/religions-polities.json`, #194) laddas vid det första klicket på ett religionsområde. Rutan visar "Söker riket på platsen…" tills filen är laddad. Ritningen av lagret använder den inte.
- **Bilder** i faktarutan laddas när kortet öppnas.

## Hoppa i tiden (#140)

Stegknapparna −100, −10, −1, +1, +10 och +100 syns på alla skärmbredder (i mobil är de smalare). Årtalet uppe till vänster är en knapp: den öppnar en ruta där man skriver ett år, med knapparna f.Kr./e.Kr. eller direkt i texten ("2600 f.Kr.", "44 fkr", "1969"), eller väljer en tidsålder (skalans fyra segment och "Idag"). Utan angiven tideräkning räknas året som e.Kr. Tolkningen görs av `parseYear()` i `model.js`; rutan hör till `setupYearJump()` i `timeline.js`. I fokusläge hålls året inom spannet och rutan säger till om man hamnar utanför. Efter ett hopp (inte vid uppspelning eller stegknappar) flyger globen till årets viktigaste händelse (#165): händelsen i det första Samtidigt-kortet som ligger närmast i tid, annars i listan; vid lika vinner den med kortast spann (ett datum före ett spann som Oxford 1096–2026). `setupYearJump()` anropar `onJump`, och `flyToYearHighlight()` i `main.js` sköter flygningen. Den hoppas över i fokusläge och om användaren vridit globen de senaste tre sekunderna (`globe.lastUserInput`).

## Tangentbord och skärmläsare (#139)

Etiketterna och klustren på globen är `<button>` och nås med Tab; Enter öppnar händelsen (kluster zoomar in). Globens canvas har `tabindex="0"` och tar emot tangenter i `_initControls()` i `globe.js`: piltangenter snurrar (Skift = större steg), `+` och `−` zoomar. Tangenterna fångas bara när canvasen själv har fokus, så de stör inte inputfält. Fokus visas med mässingsring (`:focus-visible`). Play-knappen har `aria-pressed` och ett namn som växlar: "Spela upp tiden", "Pausa", "Fortsätt" (efter automatisk paus, #163) och "Spela igen" (i slutet, #232). De två kryssrutorna Samtidigt-kortet har egna namn ("Visa …", "Pausa vid …"). Listan Samtidigt i världen är det tangentbordsvänliga alternativet till globen: varje rad är en riktig knapp (Tab, Enter och mellanslag) med mässingsring vid fokus och ett namn som läser upp år, titel, världsdel och granskningsstatus (#238).

Knapparna uppe till höger ligger i två grupper (#245), var och en en `div.action-group` med `role="group"` och gruppens namn som `aria-labelledby`: **Utforska** (Samtidigt, Lager, Fokus) och **Visa** (Platt vy, Källor, Hjälp). Grupperna har en tunn mässingsram med namnet i ramens överkant. I smal skärm ligger de under varandra till höger: Utforska i en rad ovanför rubrikens undertext och Visa i två smala rader under den, så att inget sidscrollas. Menyerna Lager och Fokus, listan och hjälpen läggs under hela knappytan (`closest('.top-actions')`).

Dubbeltryck (#233): med finger eller penna zoomar två tryck inom 350 ms och 30 px globen ett steg (×1,6, samma `setZoom()` som hjul, nyp och `+`) mot den tryckta punkten (`pickLatLon` + `flyTo`) i `_initControls()`. Sidan zoomas inte: `touch-action` och `gesturestart`-skyddet (#191) är kvar.

Lugn rörelse (#246): en kryssruta i Lager (`data-calm`, sparas som `hg-calm` i localStorage med try/catch) som är på från början om webbläsaren har `prefers-reduced-motion: reduce`, och som ett sparat val övertrumfar. `LayerMenu.calm` sätter klassen `calm` på `html` (CSS stänger av animationer och övergångar, samma regel finns i `@media (prefers-reduced-motion)`) och `globe.calm`: ingen automatisk snurr, ingen utrullning efter drag, och `flyTo` hoppar direkt i stället för att flyga. Fokus flyttas in i Lager, Fokus, Samtidigt-listan och Källor (sidan Om källorna) när de öppnas och tillbaka till knappen när de stängs.

## Pekskärmar och zoom (#191)

Webbläsarens egen zoom av hela sidan är avstängd: `touch-action: manipulation` på sidan, `maximum-scale=1` i viewport och ett stopp för Safaris nypgest (`gesturestart`). Globen har en egen zoom med nyp, scroll och +/−. Utan stoppet kunde en iPad zooma in hela sidan av misstag, och då gick den inte att zooma ut, eftersom globen fångar fingrarna.

## Fokusläget

Fokus-knappen följer ett krig, ett rike eller en religion. Tidslinjen visar bara det spannet, globen riktas mot platsen och uppspelningen går långsamt.

- **Krig:** ett kort med orsak och parter före start, paus vid krigets stora händelser (valbart) och ett kort med utgång och döda i slutet.
- **Pågående krig (#223):** ett krig med `ongoing: true` får `end` = innevarande år när datan laddas (`loadAll()` i `model.js`), så resten av koden behandlar det som ett krig som slutar i dag. `formatEventTime()` skriver "2022–pågår" i Fokus-menyn, fokusraden och faktarutan. Fokusspannet och slutkortet hålls inom tidslinjens sista år (`MAX_YEAR` i `timeline.js`). I slutet visas kortet "Läget i dag (kontrollerat <datum>)" med `story.outcome` som läget i dag och dödssiffrorna hittills, och pausraden säger "Pausad: läget i dag".
- **Korta krig (#204):** ett krig som ryms inom två år (`end − start ≤ 2`) och har datum med dag i `edtf` följs dag för dag. Fokusspannet går från krigets första dag till slutet av dess sista dag, och året är då ett decimaltal som avrundas till hela dagar (`Timeline` med `focus.fine`). `edtfSpan()` i `model.js` gör om `edtf` till [början, slut] i decimalår (en dag täcker hela dygnet, `~` och `?` ignoreras, och går `edtf` inte att läsa blir det hela år). Huvudet visar datumet stort ("22 jan") och året bredvid, skalan visar månader (året vid den första och vid januari), prickarna hamnar på slagens datum, stegknapparna och piltangenterna går i dagar och farten anges i dagar per sekund (hela kriget på cirka en minut vid standardnivån). Händelser och krigsområdet använder datumen (`span` i `EventsLayer.update` och `WarsLayer.update`), medan riken, religioner och Samtidigt-korten får det hela året som förut. Uppspelningen pausar vid händelser med `major`, också den som inleder kriget på första dagen, och tiden stannar på händelsens dag. Slagens etiketter har datum framför namnet. Utanför fokusläget, och för längre krig, är året ett heltal som förut.
- **Rike:** bara rikets områden syns, och globen riktas mot riket när det var som störst. Har riket en faktaruta (`facts`) visas den när man börjar följa det. Rikets nyckelår visas som kort och pausar uppspelningen (valbart), se Rikets berättelse nedan.
- **Religion:** börjar vid religionens grundande, stannar vid grundhändelserna och visar sedan religionens spridning som statsreligion. Har religionen en faktaruta (`facts`) visas den först.

Året styr: ligger nuvarande år inom det man följer stannar tiden där (`startFocus` i `main.js`). Annars flyttas den till starten, och en rad i fokusraden säger "Tiden flyttades till …" med knappen "Tillbaka till <året>", som lämnar fokus och går till det året (det ligger ju utanför spannet). Krigets berättelse och faktarutorna visas som förut.

Har det man följer en faktaruta (riken och religioner med `facts`) finns knappen Fakta i fokusraden, som öppnar rutan igen.

**Andra lager dämpas (#235).** I fokusläget ritas påslagna lager som inte hör till det man följer dämpat: riken och religioner när man följer ett krig, religioner när man följer ett rike och riken när man följer en religion (tidigare gömdes riken och religioner för varandra, #113). `fadableLayers()` i `main.js` väljer lagren, och `Globe.drawFaded()` ritar dem först på en egen bild som sedan läggs på lagerbilden med genomskinligheten `FADE` (0,35, så att religionernas fyllning blir cirka 18 procent och rikenas cirka 11). Det sker på den platta bilden, så Platt vy visar samma sak. Ett dämpat religionslager har ingen teckenförklaring och ingen klickruta. Valet "Behåll mina lager i fokus" i Lager (`data-layer="keep"`) visar lagren som vanligt; teckenförklaringen säger vilka lager som är dämpade och har knapparna "Visa som vanligt" och "Dämpa", som ändrar samma val (`LayerMenu.set`). Utanför fokus ritas allt som förut.

**Krigsskådeplatsernas namn och teckenförklaring (#236).** När man följer ett krig får varje krigsskådeplats en kort etikett i versaler ovanför området, ritad på lagerbilden (`WarsLayer`, `focusId`). Namnet räknas fram ur platserna och hittas inte på: världsdelen eller världsdelarna där krigets och slagens platser ligger enligt `region()` i `model.js`, den med flest platser först (till exempel "EUROPA och ASIEN" för första världskrigets västfront, östfront och Gallipoli). Flera skådeplatser kan få samma namn, till exempel tre "OCEANIEN" i Stilla havet under andra världskriget. Etiketterna krymper med zoomen som rikenas namn. Teckenförklaringen (`legend.js`, samma ruta som religionernas) får då avsnittet Krigsområden: skraffering med hel kantlinje = krigsskådeplats, område runt kriget och slagen hittills, och att namnet är världsdelen.

## Faktarutan om en religion (#90)

När religionslagret slås på visas faktarutan för den första synliga religionen som har `facts` i `religions.json`, i samma kort som händelsernas faktaruta, och menyn stängs så att kortet och punkten syns. Rutan visas också när en sådan religion bockas i igen, med knappen Fakta i undermenyn och när man följer religionen i Fokus. Kortets ram följer tidsåldern för händelsen där religionen uppstod. Nyckelåren i rutan hoppar i tiden. Punkten där religionen uppstod ritas som en stjärna på lagerbilden (beslut 1), så att den också syns i Platt vy.

## Faktarutan om ett rike (#170)

Riken och religioner använder samma ruta (`Panel.showFacts` i `js/ui/panel.js`) och samma format för `facts`. Rikets ruta visas när man börjar följa riket i Fokus och med knappen Fakta i fokusraden. Kortets ram följer rikets tidsålder och platsen globen riktas mot. Rutan har alltid rutan "Om kartan": gränserna kommer från Cliopatria (med kartdatans spann), fakta kommer från rutans källor, och `facts.mapNote` säger hur källornas årtal skiljer sig från kartdatan (#138). Rutans källor räknas in under Riken i Om källorna.

## Rikets berättelse (#171)

När man följer ett rike i Fokus blir rikets nyckelår (`facts.milestones`) kort i Samtidigt-kortet med typen "Rikets berättelse". `empireStory()` i `js/ui/funfact.js` bygger korten: varje kort visas från nyckelåret till året före nästa nyckelår (högst 25 år), med rubrik, text, raden "Om kartan" när kartdatan avviker från källan och knappar för länkade händelser (`events`). Korten visas först i kortet och även när Samtidigt-lagret är avslaget, eftersom de hör till fokusläget. När uppspelningen passerar ett nyckelår pausar `refresh()` i `main.js` med `timeline.pause('Pausad vid <år>: <rubrik>')`, om valet "Nyckelår när man följer ett rike" är på i Lager (på som standard, sparas som de andra pausvalen). Korten själva pausar inte via `onNew`, så Samtidigt-valet och rikets val styr var för sig. När pausraden syns flyttas fokusraden upp ovanför den, och korten ligger ovanför fokusraden.

Menyn visar det som pågår nära året man står på. Resten finns bakom "Visa alla".

## Hjälpskript

Skripten i `tools/` körs för hand, inte av sidan, så principen om inget byggsteg gäller fortfarande.

| Skript | Gör |
|---|---|
| `tools/riken.py` | Bygger rikesfilerna ur Cliopatria |
| `tools/bildpromptar.py` | Skriver promptar för illustrationer till `docs/bildpromptar.md` |
| `tools/bilder_in.py` | Konverterar bilder från `images/incoming/` till `images/events/` och fyller i `image` i `events.json` från bildloggen `images/incoming/bildlogg.json`. Undermappar, till exempel `images/incoming/vantar/` för bilder som ska göras om, hoppas över |

## Testa

Se [CLAUDE.md](../CLAUDE.md#testa-innan-du-är-klar): starta `python3 -m http.server 8000`, kontrollera att konsolen är fri från fel, testa dator- och mobilbredd och kontrollera all JSON.

## Uppspelning (#163, #164)

Hastigheten är i år per sekund: 1, 5, 25 (standard) och 100, så att den långsammaste går att följa år för år. `Timeline.yearsPerSecond` ger farten; i fokusläge är den en tiondel av nivån (och skalas upp för spann längre än 90 år), och knappens text visar den faktiska farten. För korta krig (#204) går hela kriget på cirka 60 sekunder vid nivån 25, och knappen visar dagar per sekund ("2,9 dagar/s", i smal skärm "2,9 d/s"). När den som lyssnar på `change` pausar (till exempel vid krigets slut) behåller pausen sin text. Sparat värde ligger under `hg-speed-ars`; den gamla nyckeln `hg-speed` (×-faktor) ignoreras. När man följer ett krig stannar uppspelningen vid varje stor händelse (`major`) i tur och ordning och visar slutkortet sist, också när flera av dem ligger samma år som kriget slutar (#217). Det som inte hinns med i ett steg ligger i en kö (`warStops` i `main.js`), och "Fortsätt" visar nästa stopp via händelsen `beforeplay` från `Timeline` i stället för att börja om. Stoppen räknas också när ett nytt Samtidigt-kort pausade i samma steg, och händelser under fokusets första år räknas när uppspelningen startar där; tiden stannar då på händelsens år (#224). `timeline.pause(orsak)` med en text är en automatisk paus: knappen heter "Fortsätt" och raden `#pause-note` vid knappen visar varför, tills man spelar igen eller flyttar tiden (`pause()` utan orsak döljer raden).

**Krigets slut och "Spela igen" (#232):** kön `warStops` töms bara när tiden flyttas för hand, alltså i lyssnaren på `change` när året ändras utan uppspelning och inte av ett stopp (dra, stegknappar, hoppa, Spela igen). Omritningar när man klickar i faktarutan, på globen eller i listan rör inte kön. Stopp som redan visats i genomspelningen (`shownStops`) visas inte igen, och `endShown` säger om slutkortet har visats. Står tiden i krigets slut utan att slutkortet har visats, visar Fortsätt slutkortet i stället för att börja om (`queuedStop()` i `main.js`, via `timeline.hasMore`). `Timeline.atEnd` är sant när tiden står i slutet (fokusets slut eller sista året) och inget mer finns att visa; då heter spelknappen "Spela igen" (ikon med en pil runt, även `aria-label`), knappen i pausraden "↻ Spela igen", och först ett klick på den börjar om från början. **Nästa paus (#244):** när man följer ett krig visar `showNextPause()` nästa stopp (köat stopp, nästa stora händelse om pausen är vald, eller slutkortet) som "Nästa paus: …" till höger om knapparna (`#next-pause`, från 1100 px), och i smalare skärm som "Nästa: …" på andra raden i pausraden (`#pause-next`), så att tidsraden inte blir högre. **Samtidigt-pauser i fokus (#234):** i fokusläget pausar uppspelningen som standard bara vid det man följer (krigets stora händelser och slut, rikets nyckelår, religionens grundande). Samtidigt-kortet pausar där bara om valet "Samtidigt-kortet även i fokusläget" (`data-pause="focusFunfacts"`, av som standard, sparas i `hg-pause` som de andra pausvalen) är på. Utanför fokus gäller valet "Samtidigt-kortet" som förut.
