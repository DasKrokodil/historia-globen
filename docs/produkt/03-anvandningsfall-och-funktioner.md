# 03. Användningsfall och funktioner

**Status:** utkast 2026-11-08, genomgånget inför v6.1.0 2026-11-09 (UC18–UC20 och temamotorn uppdaterade mot `main` `c5935f5`), bygger på funktionerna i `index.html`, [arkitektur.md](../arkitektur.md) och versionsplanen i CLAUDE.md. Användningsfallens steg är **antaganden om hur användare går tillväga**, inte observationer.

## Användningsfall

Aktörerna (A–I) står i [02](02-anvandare-och-intressenter.md). Status: **finns** (släppt), **delvis** (finns med känd brist), **planerad** (med version eller issue).

| ID | Aktör | Mål | Kort flöde | Funktioner | Status |
|---|---|---|---|---|---|
| UC1 | F, A | Förstå vad globen gör | Öppna sidan, se globen och Samtidigt-kortet, kanske introduktionen, dra i tiden | Glob, tidslinje, Samtidigt-kort, introduktion, Hjälp | finns; hur väl ingången fungerar utan förklaring är obelagt |
| UC2 | A, F | Se vad som hände samtidigt vid ett år | Dra eller skriv ett år, läs Samtidigt i världen per världsdel | Tidslinje, Hoppa i tiden, Samtidigt-listan | finns |
| UC3 | A | Läsa om en händelse och se källan | Klicka en markör eller lista, läs faktarutan, öppna källan | Faktaruta, bild med licens, källor, granskningsnivå | finns |
| UC4 | A, D | Följa ett krig, ett rike eller en religion | Sök och följ → välj → uppspelning pausar vid viktiga händelser → slutkort | Fokusläge, krigsområden, riken, religioner | finns |
| UC5 | A, B, D | Följa en guidad berättelse | Turer → välj tur → steg för steg med frågor och slutkort | Turer (7 st), berättelseläge, rikens fall | finns |
| UC6 | A | Hitta något särskilt | Sök efter namn, plats eller år | Sök (#570), Hoppa i tiden (år och datum) | finns |
| UC7 | A, B | Dela exakt vad jag ser | Dela → kopiera länk → mottagaren ser samma år, kamera, fokus, lager | Adressen (#501), Dela | finns; kapplöpning vid långsam Fokus-laddning kvarstår (#865) |
| UC8 | A | Se världen som karta eller som européernas bild | Vy: Platt karta eller Upptäcktsresor | Platt vy, upptäcktsvyn | finns |
| UC9 | A | Välja vad som visas | Lager: grupper och förinställda vyer, kategorier, lugn rörelse | Lagerregistret, Lager-menyn | finns |
| UC10 | A, F | Skriva ut en affisch av kartan | Platt vy → affisch | A4-affisch som PNG | finns |
| UC11 | B | Köra en lektion med en klass | Dela turlänk (`m=lektion`) → projicera → eleverna svarar → skriva ut elev- och lärarblad | Lektionsläge, lärarfält, utskrift (#738), lektion 1 (åk 7–9), lektion 2 (åk 4–6) | finns; flödet från länk till användbart blad är en känd riskyta (analys 2026-11-08) |
| UC12 | C | Göra ett elevuppdrag | Mer → Samtidighetsjakten → hitta händelser på olika kontinenter samma år | Samtidighetsjakten (#741) | finns |
| UC13 | D, C | Testa vad jag lärt mig | Mer → Quiz: "Vad hände samtidigt som …?" | Quiz (#65) | finns |
| UC14 | G | Rapportera ett faktafel eller föreslå innehåll | Faktarutan → Rapportera faktafel; formuläret | Rapportera faktafel, `functions/api/feedback.js` | delvis: formuläret är avstängt i production |
| UC15 | A, D | Korrigera en vanlig missuppfattning | Faktarutan visar vad källorna säger | Missuppfattningar (#838) | finns |
| UC16 | A, E | Byta språk | Mer → Språk | Fem språk, översättningsspärr | delvis: svenska fullständig, övriga språk i omgångar, engelska först |
| UC17 | H | Använda sidan utan mus och med skärmläsare | Tab och piltangenter, annonserade etiketter, lugn rörelse | Tangentbord, ARIA, `prefers-reduced-motion` | delvis: ingen skärmläsarattest |
| UC18 | A, B | Välja ett tidsintervall i stället för ett år | Formuläret "Välj ett tidsintervall" (från och till) i årshoppet; länk med `y2` | Tidsintervall (#569, #754–#756) | finns (6.1.0). Bandet på reglaget och intervall i Fokus finns inte; intervallet utesluter Fokus och uppspelning |
| UC19 | A, B | Se vad som hände här | Sök och följ → fliken Plats → skriv en plats ur datan → händelser inom 300 km, äldst först | "Vad hände här?" (#15, beslut 2026-11-08) | finns (6.1.0). Klick direkt på globen och plats i intervallet finns inte; bara platser som finns i datan går att hitta |
| UC20 | A, B | Välja en epok enligt läroplanen | Epokknappar i intervallformuläret: Lgr22, Nordens forntid, antiken, industrialiseringen | Epoker (#845, #476, `data/perioder.json`) | finns (6.1.0). Inget epokband på tidslinjen; högkulturer saknas (tidslinjen börjar 3000 f.Kr.) |
| UC20b | A, B | Följa ett tema, ett urval händelser som hör ihop | Sök och följ → fliken Teman (syns först när det finns ett tema) → introduktionskort och bara temats händelser | Temamotorn (#398, #984, `data/teman.json`) | **motorn finns, inget tema än** (teknik, #105, kommer i 6.2.0) |
| UC21 | A | Läsa ett kurerat regionkort | Region → kort med gränskälla och källor | Regionkort (#579) | planerad: 6.3.0 |
| UC22 | A | Se människans och jordens långa historia | Tidslinje i nivåer, forntida kartor | Version 7 och 8 | planerad, senare |
| UC23 | A, B | Jämföra två tider eller se historiska kartor | Jämför två tider (#248), historiska kartor (#249) | Version 9 | planerad, senare |
| UC24 | I | Se globen på en fysisk glob | Den platta bilden skickas till en globskärm | Beslut 1, hårdvaruspår H1–H3 | **parkerad** (beslut 2026-11-08) |
| UC25 | J, A | Barn utforskar tillsammans med en vuxen | Vuxen och barn tittar på globen och bilder tillsammans | (ingen egen funktion) | **beslutat**: räcker att vuxna visar barn (2026-11-08) |
| UC26 | C, D, E | Lära sig källkritik | Läsa var uppgiften kommer ifrån, se oenighet och osäkerhet, öva i Källdetektiven | Källor, granskningsnivåer, missuppfattningar, Källdetektiven (#742, att verifiera), faktarutans förklaring (#786, planerad) | delvis; **uttalat mål (M9)**, hur avgörs i #926 |

### Användningsfall vi **inte** stöder (avgränsning)

- Elever loggar in, sparar framsteg eller får betyg (inga konton, se [01](01-vision-och-mal.md#avgränsningar-det-här-är-sidan-inte)).
- Läraren följer elevernas svar i realtid.
- Användare bidrar med innehåll direkt på sidan utan granskning.

## Funktionsinventering

Per område: vad som finns och var det ligger i koden. Detaljer i [arkitektur.md](../arkitektur.md#moduler).

| Område | Funktion | Modul | Användningsfall |
|---|---|---|---|
| **Tid** | Tidslinje (segmenterad skala), uppspelning med hastigheter och pauser, hopp till år/datum, delar av år i fokusläge | `js/timeline.js` | UC1, UC2 |
| **Rum** | 3D-glob, kamera, zoom, skarpt utsnitt vid inzoomning; Platt vy | `js/globe.js`, `js/globe-detail.js`, `js/ui/flatmap.js` | UC1, UC8 |
| **Innehållslager** | Händelser, riken, religioner, krigsområden, dagens gränser, vägar och resor, upptäcktsvyn | `js/layers/*` | UC2–UC4, UC8 |
| **Läsning** | Samtidigt i världen, Samtidigt-kortet, faktarutor (händelse, rike, religion, krig) | `js/ui/panel.js`, `js/ui/funfact.js` | UC2, UC3 |
| **Utforska** | Sök och följ (Fokus, Sök), Lager, Vy, Meny/Mer | `js/ui/focusmenu.js`, `layers.js`, `viewmode.js`, `viewmenu.js` | UC4, UC6, UC9 |
| **Berättelser** | Guidade turer, berättelseläge, slutkort, rikens fall | `js/ui/tour.js`, `js/tour-format.js` | UC5 |
| **Lärande** | Introduktion, Quiz, Samtidighetsjakten, lektionsläge, utskrift, lärarfält | `js/ui/intro.js`, `quiz.js`, `uppdrag.js`, `lesson.js`, `print-sheet.js` | UC1, UC11–UC13 |
| **Delning och utskrift** | Delbara länkar, Bakåt/Framåt, affisch | `js/url-state.js`, `js/ui/poster.js` | UC7, UC10 |
| **Tillit** | Källor, granskningsnivåer, licenser, missuppfattningar, öppen oenighet | `js/ui/sources.js`, `data/sources.json`, `data/missuppfattningar.json` | UC3, UC15 |
| **Språk** | Fem språk, `ui('nyckel')`, översättningsspärr | `js/i18n.js`, `data/ui/`, `tools/oversattning.py` | UC16 |
| **Återkoppling** | Rapportera faktafel, förslagsformulär | `js/ui/feedback.js`, `functions/api/feedback.js` | UC14 |
| **Tillgänglighet** | Tangentbord, ARIA, kontrast, träffytor, lugn rörelse | `js/globe.js`, `css/style.css` | UC17 |

## Följer funktionerna målen?

En enkel kontroll att göra vid varje ny funktion: vilket mål i [01](01-vision-och-mal.md) (M1–M7) tjänar den, och vilket användningsfall? En funktion som inte tjänar något mål eller användningsfall är en kandidat för att vänta. Rutan kan fyllas i på issuet.

## Att kontrollera vid uppdatering

- [ ] Har en funktion tillkommit eller tagits bort sedan förra kontrollen? Uppdatera tabellerna.
- [ ] Är statusen "planerad" fortfarande rätt mot versionsplanen i CLAUDE.md?
- [ ] Har ett användningsfall bytt status efter en release?
- [ ] Finns ett användningsfall som inget stöder, eller en funktion som inget användningsfall motiverar?
