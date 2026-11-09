# 13. Projektordlista

**Status:** utkast 2026-11-08 (#919, DasKrokodil: "ja enligt rekommendationerna"). Ordlistan förklarar **projektets egna begrepp**, så att människor och agenter menar samma sak. Den är inte översättningsordlistan, som gäller språk, tidsangivelser och typografi ([docs/ordlista-oversattning.md](../ordlista-oversattning.md), #896). Definitionerna är hämtade ur CLAUDE.md, [arkitektur.md](../arkitektur.md), [datamodell.md](../datamodell.md) och `index.html`; stämmer något inte med koden gäller koden. Ett nytt begrepp läggs till här i samma pull request som det införs.

## För besökaren (så det står i gränssnittet)

| Begrepp | Betyder |
|---|---|
| **Glob / Platt karta / Upptäcktsresor** | De tre **vyerna** (knapparna under Vy): klotet, samma bild som en platt karta, och upptäcktsvyn med gammal kartstil och dimma. Bara en åt gången. |
| **Samtidigt** | Knappen och panelen **"Samtidigt i världen"**: händelserna vid det valda året, per världsdel. |
| **Samtidigt-kortet** | Kortet som lyfter fram ett oväntat samband (fun facts m.m.). Kan pausa uppspelningen. |
| **Fun fact** | Ett samband mellan två eller flera händelser, till exempel att pyramiderna byggdes medan de sista mammutarna levde. Varje led har källa. |
| **Sök och följ** | Knappen där man söker och väljer något att **följa**: krig, rike, land, religion eller resa. Läget kallas **fokusläge** (kallades förut Fokus). |
| **Tidsintervall** | Året plus ett slutår (`y2`): man väljer från och till i årshoppet eller en epok med ett klick. Riken och religioner visas för slutåret. Utesluter Fokus och uppspelning. |
| **Epok** | Ett namngivet tidsspann ur `data/perioder.json` (Lgr22, Nordens forntid, antiken, industrialiseringen); blir ett tidsintervall. Listar aldrig händelser. |
| **Tema** | Ett namngivet urval av befintliga händelser (`data/teman.json`) med en introduktion; följs som ett Fokus av typen `theme`. Motorn finns, inget tema än. |
| **Plats (fliken)** | "Vad hände här?" i Sök och följ: händelser inom 300 km från en plats ur datan, äldst först. |
| **Fokusläge** | Läget där ett krig, rike eller en religion följs. Övriga lager dämpas, och uppspelningen pausar vid viktiga händelser. |
| **Lager** | Menyn där man väljer vad som syns (händelser, riken, religioner, vägar m.m.), kategorier och inställningar. |
| **Faktaruta** | Rutan som visar en händelse, ett rike eller en religion med text, bild, källor, osäkerhet och granskningsnivå. |
| **Tur** | En guidad berättelse som spelas steg för steg ur `data/turer/`. |
| **Berättelseläge** | Turens kapitel och frågor "Att fundera på", som läses upp med steget. |
| **Slutkort** | Kortet i slutet av en tur eller ett fokus med det viktigaste att ta med sig. |
| **Lektion / lektionsläge** | En tur med lärarfält. Länken med `m=lektion` döljer menyerna, låser år och lager och visar bandet med "Visa hela globen". |
| **Elevblad / lärarblad** | Utskriften ur en lektions data: eleven får frågor med skrivrader, läraren får årskurs, tid och förkunskaper. |
| **Samtidighetsjakten** | Elevuppdraget under Mer: hitta händelser på olika kontinenter samma år. Du-form. |
| **Quiz** | "Vad hände samtidigt?" ur befintliga fun facts. |
| **Introduktion** | De tre stilla stegen för nya besökare. |
| **Missuppfattning** | Ett vanligt felaktigt påstående, vad källorna säger och ursprunget; visas i faktarutan. |
| **Mer / Meny** | **Mer** (dator) samlar Källor, Hjälp, Quiz, Jakten, Dela och Språk. **Meny** (mobil) är panelen bakom knappen i raden överst. |
| **Dela** | Kopierar en länk som bär år, kamera, fokus, lager och kategorier. |
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
