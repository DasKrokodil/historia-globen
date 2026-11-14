# 13. Projektordlista

**Status:** utkast 2026-11-08 (#919, DasKrokodil: "ja enligt rekommendationerna"). Ordlistan förklarar **projektets egna begrepp**, så att människor och agenter menar samma sak. Den är inte översättningsordlistan, som gäller språk, tidsangivelser och typografi ([docs/ordlista-oversattning.md](../ordlista-oversattning.md), #896). Definitionerna är hämtade ur CLAUDE.md, [arkitektur.md](../arkitektur.md), [datamodell.md](../datamodell.md) och `index.html`; stämmer något inte med koden gäller koden. Ett nytt begrepp läggs till här i samma pull request som det införs.

## För besökaren (så det står i gränssnittet)

| Begrepp | Betyder |
|---|---|
| **Glob / Platt karta / Upptäcktsresor** | De tre **vyerna** (knapparna under Vy): klotet, samma bild som en platt karta, och Upptäcktsresor med gammal kartstil och dimma. Bara en åt gången. Ett namn överallt i gränssnittet: "Upptäcktsresor" (inte "upptäcktsvyn"); kategorin Upptäckter är något annat. |
| **Samtidigt** | Knappen och panelen **"Samtidigt i världen"**: händelserna vid det valda året, per världsdel. |
| **Samtidigt (definitionen)** | Händelserna **pågår minst ett gemensamt år**, räknat på start och slut (#1311, beslut 2026-11-13-definition-av-samtidigt). Samma regel i fun facts, quizet och Samtidighetsjakten (`js/samtidighet.js`). När ett årtal är ungefärligt står det "ungefär samtidigt". |
| **Nära i tid** | Inget gemensamt år, men högst ett visst antal år isär; antalet år står alltid med ("33 år isär"). Gränsen står i datan och beror på sammanhanget: fun facts 100 år före vår tideräkning och 50 år efter (`near` i `data/funfacts.json`), jakten uppdragets fönster (25 år för år 1500), och på globen händelserna inom tidsfönstret runt året, som visas **tonade**. De är inte samtida, bara nära i tid. Raden under årtalet visar fönstret avrundat, "1300-talet · ±40 år" (i ord för yngre läsare: "även 40 år före och efter"), och förklaringen står i radens hovringstext (#1191). |
| **Samtidigt-kortet** | Kortet som lyfter fram en oväntad samtidighet (fun facts m.m.). Kan pausa uppspelningen. Heter "Visste du?", och samma ord står på teckenförklaringen under tidslinjen. |
| **Fun fact** | En samtidighet mellan två eller flera händelser, till exempel att pyramiderna byggdes medan de sista mammutarna levde. Varje led har källa. Varje fun fact har en relation i tid (`relation`), som kortet visar: **Samtidigt**, **Nära i tid: N år isär** eller **Jämför avstånd i tid** (till exempel att Kleopatra levde närmare månlandningen än pyramidbygget). |
| **Långt tillstånd** | Något som **pågick** (ett rike, en kultur), till skillnad från något som **hände**. Föreslaget fält `lasting` på händelsen; typas med källor i omgångar (#1311). |
| **Sök och följ** | Knappen där man söker och väljer något att **följa**: krig, rike, land, religion eller resa. Medan man följer något kallas läget **"följer"** ("när du följer en händelse"); ordet "Fokus" och "fokusläge" används inte i gränssnittet (#1140). I kod, filnamn och adress (`f=`) heter det fortfarande `focus`. |
| **Tidsfönstret** | Raden under årtalet: århundradet och hur många år före och efter året som globen också visar ("1300-talet · visar också det som hände 38 år före och efter"). Bredden följer tidslinjens skala, så antalet år byter med var man står. Etiketter och rader i listan säger riktningen i tid: "4 år före (1912)", "om 2 år (1918)", "21 år senare" (#994, #995). Sök och följ använder ett bredare fönster (fyra gånger så brett) och säger det. |
| **Tidsintervall** | Året plus ett slutår (`y2`): man väljer från och till i årshoppet eller en epok med ett klick. Riken och religioner visas för slutåret. Utesluter att följa något och uppspelning. |
| **Epok** | Ett namngivet tidsspann ur `data/perioder.json` (Lgr22, Nordens forntid, antiken, industrialiseringen); blir ett tidsintervall. Listar aldrig händelser. |
| **Plats** | Ett kort om en platss historia (`data/platser.json`, #579) med dagens gräns som kontur; följs i Sök och följ (`place` i koden) eller genom ett tryck på platsens prickade kontur när man har zoomat in (#1161); knappen i kortet heter Visa i Platt karta. Gruppen i Sök och följ heter Platser, på kortet står typen (till exempel Självstyrt område, Land). Ordet **region** betyder fortsatt världsdel. Skilt från fliken **Vad hände här?** (#15, hette tidigare Plats), som söker händelser nära en punkt; flikens id i koden är fortfarande `Plats`. |
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
| **Samtidighetsjakten** | Elevuppdraget under Mer: hitta händelser på olika kontinenter som pågår uppdragets år eller ligger nära i tid (inom uppdragets fönster). Du-form. |
| **Quiz** | "Vad hände samtidigt?" ur befintliga fun facts, bara med par som pågår samma år, och frågorna **Sant eller myt?** ur missuppfattningarna, som inte räknas i poängen, och **Vad kom först?** och **Vad låg närmast i tid?** ur `data/quiz.json`, där svaret räknas fram ur händelsernas årtal (#846). |
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
| **Rike** (polity) | Ett område över tid ur `data/empires/`, byggt ur Cliopatria. Se avsnittet "Land, rike, stat, nation, plats och tema" nedan. |
| **Väg / resa** | Linje som ritas fram över tiden (`data/routes/`). |
| **Urval** | Det som kommit med på globen. Gjort av en ensam redaktör; kriterier i [08](08-urvalsriktlinje.md). |
| **Kärnhändelser** | Den godkända listan av händelser som ska finnas ([karnhandelser.md](../karnhandelser.md)). |
| **EDTF / precision** | Hur osäkerhet och noggrannhet i datum skrivs (`~`, `?`, spann) och Wikidatas skala 0–11. |
| **Omstridd gräns** | En nutida gräns- eller statusfråga som ritas enligt **Sveriges hållning (UD)**, med källa. |

## Land, rike, stat, nation, plats och tema (#1266)

Eleven ska inte tro att land och rike är samma sak. Orden nedan beskriver **hur projektet använder dem** i data, kod och gränssnitt; de är inte uppslagsverkens fullständiga definitioner. Översättningarna står i [ordlista-oversattning.md](../ordlista-oversattning.md), avsnitt 17.

| Begrepp | Betyder i Historia-globen | I data och kod |
|---|---|---|
| **Plats** (samlingsordet) | Ett kort om ett områdes historia med en **dagens gräns** som kontur: händelserna inom gränsen i tidsordning. Samlingsordet för alla platstyper (land, självstyrt område, senare landskap, delstat, Bundesland, kanton). Kortet säger vilken typ platsen är; samlingsordet står bara i gruppen **Platser** och i rubriken **Plats** på kortet. Platsen lägger inte till några fakta själv; allt historiskt står i händelserna och deras källor. | `data/platser.json`, fokus av typen `place` (`js/focus/place.js`), `place.*` och `focus.tab.places` i `data/ui/` |
| **Land** | **Dagens land, med dagens gräns, under hela tidsspannet.** Ett land är en plats av typen `country` (beslut 2026-11-12, [länderna före regionerna](../beslut/2026-11-12-landerna-fore-regionerna.md)), inte ett eget fokus. Kortet visar allt som hänt inom dagens gräns, också när området hörde till andra riken eller inte var en stat alls. Därför står den fasta raden "Linjen på kartan visar dagens gräns, inte den gräns som gällde då" (`place.borderNote`). Skriv gärna "området som i dag är Sverige" när det gäller tiden före dagens land. | `type: "country"`, `place.type.country` |
| **Försvunnet land** | Undantaget från "dagens land": ett land som **inte finns längre** (till exempel Tjeckoslovakien), med årtal då det bildades och upplöstes och vilka länder det blev. Det är ett **rike** i datan, inte en plats, och listas under fliken Försvunna länder i Sök och följ. Ordet "land" används där för att gränssnittet säger så; inget försvunnet land har ett platskort med dagens gräns. | grupp med `vanished` i `data/empires/index.json`, `facts.kind.vanished`, `focus.tab.vanished` |
| **Självstyrt område** | En plats som har eget styre men inte är ett självständigt land (Grönland). Typen sätts bara när den finns i redan källkontrollerade händelser. | `type: "autonomous"`, `place.type.autonomous` |
| **Rike** | **En statsbildning som fanns under en viss tid, med gränser som ändras** år för år. Samlingsordet i gränssnittet för alla statsbildningar ur Cliopatria: kejsardömen och kungadömen, men också kalifat, kolonialvälden och republiker som USA och Mexiko under deras historia. Rikets kontur är den gräns som gällde det valda året, inte dagens. Ett rike och ett land kan ha samma namn (riket Sverige och landet Sverige) men är olika saker: riket har en historisk gräns som ändras, landet har dagens gräns. Områden som inte var en stat (stadsstater, kulturer) kallas inte rike ([beslut 2026-11-13](../beslut/2026-11-13-omraden-som-inte-ar-stat-1300.md)). | `data/empires/`, lagret Riken (`layer.areas`), `facts.kind.empire`, fokus av typen `empire` |
| **Stat** | En politisk organisation med makt över ett område och dess folk. Ordet är **inget eget begrepp i gränssnittet** och ingen datatyp; det används i förklaringar (till exempel "statsreligion" och "områden som inte är en stat") och i namn som källorna själva använder (Amerikas konfedererade stater). Både riken och dagens länder är stater, men en plats behöver inte vara det (Grönland). | inget fält; `facts.stateReligion` |
| **Nation** | En **grupp människor** som delar identitet, ofta språk och historia, eller medborgarskap i en stat; alltså människorna, inte området. En stat kan rymma flera nationer, och en nation kan bo i flera stater. Ordet är **inget begrepp i gränssnittet** och ingen datatyp, och det används inte som synonym till land. Används det i en text ska det betyda folket. | inget fält |
| **Region** | **Världsdel** (Europa, Asien, Afrika, Amerika, Oceanien), som förut. Används inte om landskap, delstater eller andra delar av ett land; de är platser med en egen typ. | `REGIONS` i `js/model.js`, `region.<id>` i `data/ui/` |
| **Tema** | Ett namngivet **urval av befintliga händelser** med en introduktion, till exempel teknik. Har ingen gräns och inget område; händelserna kan ligga var som helst i världen. Skilt från en plats (urval efter gräns) och från en epok (ett tidsspann). | `data/teman.json`, fokus av typen `theme` (`js/focus/theme.js`), `theme.*` i `data/ui/` |

**Varför orden hålls isär:** dagens gräns läst som en gammal gräns ger fel bild ("Sverige har alltid sett ut så"), och ett rike läst som ett land ger samma fel åt andra hållet. Rikets kontur och landets kontur ser olika ut på kartan av samma skäl.

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
