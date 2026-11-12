# 13. Projektordlista

**Status:** utkast 2026-11-08 (#919, DasKrokodil: "ja enligt rekommendationerna"). Ordlistan förklarar **projektets egna begrepp**, så att människor och agenter menar samma sak. Den är inte översättningsordlistan, som gäller språk, tidsangivelser och typografi ([docs/ordlista-oversattning.md](../ordlista-oversattning.md), #896). Definitionerna är hämtade ur CLAUDE.md, [arkitektur.md](../arkitektur.md), [datamodell.md](../datamodell.md) och `index.html`; stämmer något inte med koden gäller koden. Ett nytt begrepp läggs till här i samma pull request som det införs.

## För besökaren (så det står i gränssnittet)

| Begrepp | Betyder |
|---|---|
| **Glob / Platt karta / Upptäcktsresor** | De tre **vyerna** (knapparna under Vy): klotet, samma bild som en platt karta, och Upptäcktsresor med gammal kartstil och dimma. Bara en åt gången. Ett namn överallt i gränssnittet: "Upptäcktsresor" (inte "upptäcktsvyn"); kategorin Upptäckter är något annat. |
| **Samtidigt** | Knappen och panelen **"Samtidigt i världen"**: händelserna vid det valda året, per världsdel. |
| **Nära i tid** | Händelser inom tidsfönstret runt året, som visas **tonade**. De är inte samtida, bara nära i tid. Raden under årtalet visar fönstret avrundat, "1300-talet · ±40 år" (i ord för yngre läsare: "även 40 år före och efter"), och förklaringen står i radens hovringstext (#1191). |
| **Samtidigt-kortet** | Kortet som lyfter fram en oväntad samtidighet (fun facts m.m.). Kan pausa uppspelningen. Heter "Visste du?", och samma ord står på teckenförklaringen under tidslinjen. |
| **Fun fact** | En samtidighet mellan två eller flera händelser, till exempel att pyramiderna byggdes medan de sista mammutarna levde. Varje led har källa. |
| **Sök och följ** | Knappen där man söker och väljer något att **följa**: krig, rike, land, religion eller resa. Medan man följer något kallas läget **"följer"** ("när du följer en händelse"); ordet "Fokus" och "fokusläge" används inte i gränssnittet (#1140). I kod, filnamn och adress (`f=`) heter det fortfarande `focus`. |
| **Tidsfönstret** | Raden under årtalet: århundradet och hur många år före och efter året som globen också visar ("1300-talet · visar också det som hände 38 år före och efter"). Bredden följer tidslinjens skala, så antalet år byter med var man står. Etiketter och rader i listan säger riktningen i tid: "4 år före (1912)", "om 2 år (1918)", "21 år senare" (#994, #995). Sök och följ använder ett bredare fönster (fyra gånger så brett) och säger det. |
| **Tidsintervall** | Året plus ett slutår (`y2`): man väljer från och till i årshoppet eller en epok med ett klick. Riken och religioner visas för slutåret. Utesluter att följa något och uppspelning. |
| **Epok** | Ett namngivet tidsspann ur `data/perioder.json` (Lgr22, Nordens forntid, antiken, industrialiseringen); blir ett tidsintervall. Listar aldrig händelser. |
| **Plats** | Ett kort om en platss historia (`data/platser.json`, #579) med dagens gräns som kontur; följs i Sök och följ (`place` i koden). Gruppen i Sök och följ heter Platser, på kortet står typen (till exempel Självstyrt område, Land). Ordet **region** betyder fortsatt världsdel. Skilt från fliken **Plats** ("Vad hände här?", #15), som söker händelser nära en punkt. |
| **Tema** | Ett namngivet urval av befintliga händelser (`data/teman.json`) med en introduktion; följs i Sök och följ (`focus` av typen `theme` i koden). |
| **Översikt** | Den förinställda vyn i Lager som är startvy vid ett första besök: ett **urval** av händelser som ofta tas upp i skolan och i uppslagsverk (fältet `significance`, cirka 120), med samma lager som Standard. Inte "de viktigaste" och inte Lgr22. Raden överst i Samtidigt säger "Översikt: ett urval" med knappen Visa alla. Standard visar alla händelser; en lektion visar alltid alla (#1139). |
| **Plats (fliken)** | "Vad hände här?" i Sök och följ: händelser inom 300 km från en plats ur datan, äldst först. |
| **Följer (läge)** | Läget där ett krig, rike, en religion, resa eller ett tema följs (kallades förut Fokus och fokusläge). Övriga lager dämpas, och uppspelningen pausar vid viktiga händelser. Bandet överst heter "Följer". |
| **Förval** | En namngiven kombination av lager, överst i Lager-menyn. Förvalet **Händelser och riken** visar Händelser, Samtidigt-kortet och Riken; inga resor. De synliga namnen är översatta, men förvalens interna id:n och lagerval är oförändrade (#1001). |
| **Lager** | Menyn där man väljer vad som syns (händelser, riken, religioner, vägar m.m.), kategorier och inställningar. |
| **Faktaruta** | Rutan som visar en händelse, ett rike eller en religion med text, bild, källor, osäkerhet och granskningsnivå. |
| **Tur** | En guidad berättelse som spelas steg för steg ur `data/turer/`. |
| **Berättelseläge** | Turens kapitel och frågor "Att fundera på", som läses upp med steget. |
| **Slutkort** | Kortet i slutet av en tur eller när man har följt något, med det viktigaste att ta med sig. |
| **Lektion / lektionsläge** | En tur med lärarfält. Länken med `m=lektion` döljer menyerna, låser år och lager och visar bandet med "Visa hela globen". |
| **Elevblad / lärarblad** | Utskriften ur en lektions data: eleven får frågor med skrivrader, läraren får årskurs, tid och förkunskaper. |
| **Samtidighetsjakten** | Elevuppdraget under Mer: hitta händelser på olika kontinenter samma år. Du-form. |
| **Quiz** | "Vad hände samtidigt?" ur befintliga fun facts, och varannan fråga **Sant eller myt?** ur missuppfattningarna (#846), som inte räknas i poängen. |
| **Introduktion** | De tre stilla stegen för nya besökare. Knappen heter "Kom igång" och ligger under Mer (#996). |
| **Missuppfattning** | Ett vanligt felaktigt påstående, vad källorna säger och ursprunget; visas i faktarutan. |
| **Mer / Meny** | **Mer** (dator) samlar Källor, Hjälp, Quiz, Jakten och Dela. **Språk** är knappen med jordglob och språkkod (till exempel SV) i raden överst (#1167). **Meny** (mobil) är panelen bakom knappen i raden överst. |
| **Dela** | Kopierar en länk som bär år, kamera, det man följer, lager och kategorier. |
| **Källor / Om källorna** | Sidan med källpolicy, granskningsnivåer och källregister. |
| **Granskningsnivå** | `draft` (visas inte), `source-checked` (källan öppnad och kontrollerad), `two-sources` (jämförd med en andra, oberoende källa). |

## Innehållet

| Begrepp | Betyder |
|---|---|
| **Händelse** | En post i `data/handelser/` med id, kategori, start/slut, plats, titel, sammanfattning, källor och granskningsnivå. |
| **Krig** | En händelse med `kind: "war"` och spann; slag pekar på kriget med `partOf`. Har ett **krigsområde** som ritas runt platserna. |
| **Rike** (polity) | Ett område över tid ur `data/empires/`, byggt ur Cliopatria. |
| **Väg / resa** | Linje som ritas fram över tiden (`data/routes/`). |
| **Urval** | Det som kommit med på globen. Gjort av en ensam redaktör; kriterier i [08](08-urvalsriktlinje.md). |
| **Kärnhändelser** | Den godkända listan av händelser som ska finnas ([karnhandelser.md](../karnhandelser.md)). |
| **EDTF / precision** | Hur osäkerhet och noggrannhet i datum skrivs (`~`, `?`, spann) och Wikidatas skala 0–11. |
| **Omstridd gräns** | En nutida gräns- eller statusfråga som ritas enligt **Sveriges hållning (UD)**, med källa. |

## Teknik

| Begrepp | Betyder |
|---|---|
| **Ett år styr allt** | `Timeline` äger året och skickar `change`; allt annat lyssnar. |
| **Lager (modul)** | Kod i `js/layers/` med `update(state)` och `drawOverlay(ctx, W, H)`, anmäld i **lagerregistret**. |
| **baseCanvas / overlayCanvas** | De ekvirektangulära bilderna (4096 × 2048) som läggs på klotet och visas i Platt vy. |
| **Ekvirektangulär** | Den platta kartprojektionen som beslut 1 bygger på. |
| **State** | Det gemensamma tillståndet i `js/state.js` (år, fokus, lager, filter). |
| **Genererade filer** | `data/events.json` och `data/genererat/`; byggs av `tools/dela_data.py` och redigeras aldrig för hand. |
| **Översättningsspärren** | `tools/oversattning.py`: stoppar ny text utan översättning och inaktuella översättningar. |

## Arbetssätt och projekt

| Begrepp | Betyder |
|---|---|
| **Ensam redaktör** | DasKrokodil bestämmer ensam vad som tas med och vad som görs. Input är välkommen. |
| **Dirigent** | Claude Code på DasKrokodils konto: triagerar, sätter `redo` och granskar. |
| **Arbetare** | En agent (Claude Code, Codex, Copilot) som tar ett `redo`-issue. |
| **Orkestern** | `/orkester`: ett avgränsat pass med högst fyra pull requests (`.orchestra/project.md`). |
| **`redo` / `pågår`** | Etiketterna för "kan tas" och "någon arbetar på det". Bara dirigenten eller DasKrokodil sätter `redo`. |
| **`beslut-krävs`** | Issuet väntar på DasKrokodils ja; har en "Rekommendation till DasKrokodil". |
| **`main` / `production` / dev** | `main` = development (dev.historiagloben.se), `production` = historiagloben.se. Bara release-PR går till `production`. |
| **Release-PR** | Pull requesten `main` → `production` med releasemallen. |
| **Kökontroll** | Lätt kontroll av status, krockar och nästa issue efter varje pull request. |
| **Blind-spots-runda** | Codex självkritiska analys av tomma, delvis tomma och blandade lägen (rapport i `docs/granskningar/`). |
| **Täckningsrunda** | Mätning av vad som saknas per period, världsdel och kategori (`python3 tools/tackning.py`). |
| **Linser** | Granskningsperspektiven i [06](06-granskningsperspektiv.md). |
| **PRS** | Produktkravsspecifikationen, [09](09-kravspecifikation.md). |

## Att kontrollera vid uppdatering (varje release)

- [ ] Har ett begrepp tillkommit eller bytt namn i gränssnittet (se `index.html`, `data/ui/sv.json`)?
- [ ] Står något här som inte längre stämmer med koden?
