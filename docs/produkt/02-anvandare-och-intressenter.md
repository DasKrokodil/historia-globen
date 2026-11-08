# 02. Användare och intressenter

**Status:** utkast 2026-11-08. **Personorna är antaganden**, byggda på det vi har byggt för (lektion 1 åk 7–9, lektion 2 åk 4–6, Samtidighetsjakten, quiz, introduktion) och på analyserna i [docs/granskningar/](../granskningar/README.md). Ingen användarstudie eller klasspilot har gjorts. Det som är observerat är märkt så.

## Användare

Prioritetsordningen är **förslag**. Fråga 1 i [01-vision-och-mal.md](01-vision-och-mal.md#öppna-frågor) avgör den.

| ID | Användare | Roll | Idag byggt för? |
|---|---|---|---|
| A | Historieintresserad vuxen | Primär (visionen) | Ja: glob, Samtidigt, Fokus, Sök, Källor |
| B | Historielärare | Primär (skolan) | Ja: turer, lektionsläge, utskrift, lärarfält |
| C | Elev 10–13 år (åk 4–6) | Primär (skolan) | Ja: lektion 2, Samtidighetsjakten (du-form) |
| D | Elev 13–16 år (åk 7–9) | Primär (skolan) | Ja: lektion 1, quiz |
| E | Äldre elev / student 16+ | Sekundär | Delvis: samma innehåll, ingen egen väg |
| F | Nyfiken förstagångsbesökare | Sekundär, men ingången för alla | Ja: introduktion, Samtidigt-kort |
| G | Bidragsgivare och granskare (faktafel, förslag) | Sekundär | Ja: Rapportera faktafel, förslagsformulär |
| H | Besökare med funktionsnedsättning | Tvärgående | Delvis: tangentbord, lugn rörelse, kontrast; ingen skärmläsarattest |
| I | Besökare vid fysisk glob (framtid) | Framtida | Förberett i arkitekturen, ej byggt |

### Persona-mall

Varje persona beskrivs med samma frågor, så att de går att jämföra och granska mot.

#### A. Historieintresserad vuxen ("Maria, 45")

- **Mål:** få nya samband och bli överraskad; fördjupa sig i en period eller ett krig; kunna lita på det som står.
- **Förkunskap:** vet årtal och stora händelser per land, men sällan vad som hände samtidigt i andra världsdelar.
- **Enhet:** dator på kvällen, mobil i korta stunder.
- **Frågar sidan:** "Vad hände samtidigt som X?", "Hur stort var Y?", "Hur vet ni det?"
- **Frustreras av:** påståenden utan källa, överlastad karta, tvingande konton, reklam.
- **Behöver:** Samtidigt, Sök och följ, källor synliga, Dela länk, djup (turer, riken, krig).
- **Antagande att pröva:** hon hittar ingången själv utan guide, och går vidare efter första "wow".

#### B. Historielärare ("Johan, 38, SO-lärare åk 7–9")

- **Mål:** en lektion som fungerar utan lång förberedelse; material som går att skriva ut; innehåll som går att försvara inför elever och föräldrar.
- **Förkunskap:** ämnet och läroplanen (Lgr22); pedagogisk utbildning; blandad teknisk vana.
- **Enhet:** klassrumsdator med projektor, ibland elevdatorer eller surfplattor, skolnätets begränsningar.
- **Frågar sidan:** "Kan jag skicka en länk och vet att alla ser samma sak?", "Matchar det kursplanen?", "Kan jag skriva ut?", "Vem har skrivit detta?"
- **Frustreras av:** inloggning, tid som går åt till att lära sig verktyget, innehåll som inte är källbelagt, att menyer ligger i vägen på projektorn.
- **Behöver:** turlänk, lektionsläge som döljer menyerna, lärarblad och elevblad, tydlig källhantering, lugn rörelse, att funktionen fungerar offline-nära (inga konton).
- **Antagande att pröva:** en lärare hittar lektionen utan att fråga oss, och lärarbladet räcker som förberedelse.

#### C. Elev 10–13 år (åk 4–6)

- **Mål:** klara uppgiften ("hitta tre händelser på olika kontinenter år X"), ha roligt, få veta något häftigt.
- **Förkunskap:** begränsad tidsuppfattning; lär sig årtal och kontinenter; läsförmåga varierar.
- **Enhet:** surfplatta eller skoldator, ibland mobil hemma.
- **Frågar sidan:** "Vad ska jag göra?", "Var är det här?"
- **Frustreras av:** långa texter, svåra ord, "döda ändar", små träffytor.
- **Behöver:** du-form (beslut 2026-11-08), korta texter, tydlig nästa-knapp, stora träffytor, inga artiga formuleringar i fel ton.
- **Antagande att pröva:** eleven klarar jakten utan lärarens hjälp efter instruktionen.

#### D. Elev 13–16 år (åk 7–9)

- **Mål:** få veta vad som behövs till provet; förstå orsaker, inte bara årtal; helst att det inte känns barnsligt.
- **Förkunskap:** kronologi, begrepp som imperium och revolution; känner till världskrigen i grunden.
- **Frågar sidan:** "Vad hände före och efter?", "Varför hände det?"
- **Frustreras av:** att barnsliga formuleringar eller tvingande frågor förminskar dem; att inte hitta tillbaka.
- **Behöver:** berättelseläget med kapitel, frågor att fundera på, källorna synliga (källkritik), kontext (andra världskriget i hela världen, inte bara Europa).

#### E. Äldre elev / student 16+

- **Mål:** underlag till uppsats eller redovisning; jämföra och källhänvisa.
- **Behöver:** källregister och citerbara uppgifter, exakta spann och osäkerhet. Inget i dag är skrivet specifikt för dem; det är ett **medvetet glapp** att pröva mot mål M3 och fråga 3 i vision.

#### F. Nyfiken förstagångsbesökare

Ingången för alla ovan. Kommer från en delad länk eller sökning, har inget sammanhang. Måste i första skärmen förstå *vad* det är, *vad man kan göra* och *hur man tar sig vidare*. Introduktionen i tre steg (#363) och Hjälp finns, men om ingången fungerar utan dem är inte belagt.

#### G. Bidragsgivare och granskare

Rapporterar faktafel eller föreslår innehåll via faktarutans länk eller förslagsformuläret (avstängt som standard i production). Behöver en väg som inte kräver GitHub-konto och en rimlig förväntan på svar.

#### H. Besökare med funktionsnedsättning

Tvärgående krav, inte en egen grupp: tangentbord, skärmläsare, kontrast, zoom, lugn rörelse, färgblindhet (kategorifärger!). Se [06, tillgänglighet](06-granskningsperspektiv.md#7-tillgänglighet).

#### I. Besökare vid fysisk glob

Framtida: tittar utan mus, utan text de hinner läsa, ofta i grupp. Styr krav på läsbarhet på avstånd och att den platta bilden kan exporteras (beslut 1, ekvirektangulär rendering).

## Intressenter

Vem påverkas av, eller kan påverka, projektet. "Vad de bryr sig om" är det vi ska ta hänsyn till vid beslut.

| Intressent | Roll | Bryr sig om | Vad vi behöver från dem / till dem |
|---|---|---|---|
| **DasKrokodil** (Rikard) | Ägare, projektledare, beslutar, slår ihop och publicerar | Sanning, utseende, att det blir klart och begripligt; inte själv utvecklare | Beslut, godkännande, prioritet; vi ger korta svenska förklaringar |
| **Einzbeng** (Andreas) | Medarbetare med egna agenter | Att kunna bidra utan att krocka | Tydliga regler i CLAUDE.md/AGENTS.md; han slår inte ihop |
| **Agenter** (Claude Code, Codex, Copilot) | Arbetare och granskare | Tydliga issues, filgränser, testbara krav | Kontextkarta, kökontroll, granskning med kommentar |
| **Lärare och skolor** | Användare och förmedlare | Tid, läroplan, tillgänglighet på skoldatorer och nät | Lärarpaket, stabil länk, kunna lita på innehållet |
| **Elever och vårdnadshavare** | Användare; integritet | Att det är säkert, begripligt och inte spårar | Ingen elevdata, ingen tredjepartsstatistik |
| **Skolverket / läroplanen** | Extern ram | Ämnesinnehåll och begrepp (nya läro- och kursplaner på remiss 2026-11-09 till 2027-01-20 enligt benchmarken) | Epokerna (#845, #476) följer öppnad text, godkänns av DasKrokodil |
| **Datakällor** (Natural Earth, Cliopatria, Wikidata, Wikimedia Commons, Library of Congress) | Leverantörer av öppna data | Rätt attribution och licensvillkor | Licensregeln i CLAUDE.md; källregister och licensmanifest |
| **Historiker och källgranskare** | Faktagranskare, ibland kritiker | Att osäkerhet och oenighet visas, att urvalet inte vilseleder | Faktafel-vägen, granskningsnivåer, öppen oenighet |
| **Översättare och språkgranskare** | Kvalitet i fyra språk | Rätt betydelse, termer, tilltal | Ordlistan, översättningsregeln, granskning vid release |
| **Plattformar** (GitHub, Cloudflare Pages, jsDelivr/three.js) | Drift och leverans | Villkor, tillgänglighet, kostnad | Ett enda externt beroende; no-cache-regler; rollback |
| **Framtida hårdvarupartner** | Fysisk glob | Bildformat, upplösning, läsbarhet | Den platta bilden; planeras utanför repot |
| **Kommande bidragsgivare / öppen källkod-communityt** | Potentiella medhjälpare | Begriplig dokumentation, licens | README, CONTENT-LICENSE, dessa dokument |

## Konflikter mellan intressenter (att hålla koll på)

- **Djup mot enkelhet:** vuxna vill ha djup och exakthet, yngre elever vill ha färre ord. Lösning hittills: lager och turer, du-form efter ålder. Risk: ett gränssnitt som är för tungt för C och för barnsligt för D.
- **Urval mot full lista:** historiker vill ha heltäckande, lärare vill ha överblick. Se öppen fråga 2 i vision.
- **Hastighet mot källkontroll:** snabb täckning (massimport) mot manuell källkontroll. Källpolicyn vinner.
- **Skolans krav mot det öppna:** lärare vill ha stabilitet; vi släpper ofta. Release-rutinen och no-cache-regeln är motvikten.

## Att kontrollera vid uppdatering

- [ ] Har en granskning eller användarkontakt gett en observation som ersätter ett antagande ovan? Skriv datum och källa.
- [ ] Finns det en användare eller intressent som inte står här (till exempel en förälder, ett bibliotek, ett museum)?
- [ ] Stämmer "idag byggt för?" med funktionerna i [03](03-anvandningsfall-och-funktioner.md)?
