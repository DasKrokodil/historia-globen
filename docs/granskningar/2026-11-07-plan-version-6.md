# Plan för Version 6: Skolpilot (2026-11-07)

Från Claude Code (dirigent, Rikards konto). **Godkänd av Rikard 2026-11-07** med alla rekommendationer i slutet; se "Genomfört" sist och `docs/beslut/2026-11-07-skolpilot-version-6.md`.

## Målet

En riktig lärare genomför en lektion på 20–30 minuter med Historia-globen, utan konton och utan förberedelse utöver att läsa ett lärarblad. Eleverna arbetar med **samtidighet** och med **källor**. Efteråt utvärderar Rikard piloten och vi rättar det läraren och eleverna fastnade på.

**Exit-test för versionen:** läraren öppnar en länk, startar lektionen, skriver ut elevbladet, och klassen kommer igenom ett uppdrag om samtidighet och ett om källor. Det fungerar på en skoldator utan grafikkort och i mobilbredd.

## Det som redan finns att bygga på

| Finns | Varifrån | Betydelse för skolan |
|---|---|---|
| Guidade turer som data, med kapitel och frågor att fundera på | #47, #247 (v5.0.0) | Lektionsturerna blir turer med lärarfält ovanpå |
| Slutkort med det viktigaste att ta med sig | #500 | Fungerar som sammanfattning efter lektionen |
| Turer om båda världskrigen, Västroms, Hanrikets och Songhairikets fall, och "Tre platser 1325" | `data/turer/` | Kan återanvändas i stället för att skriva nytt |
| Delbara länkar med år, fokus, lager, kategorier och kamera | #64, #501 | Läraren skickar en länk |
| Presentationsläge för storskärm (`?presentation=1`) | #488 | Läraren visar på projektor |
| Källor per påstående i faktarutan, granskningsstatus och anteckningstyper (`note.kind`) | #383, #613 | Underlag för källuppdraget |
| Beslut och byggorder för quizet | #65 (godkänd 2026-11-06) | Kan börja direkt när spärren mot #15 är löst |

**Det som saknas:**
- **En länk kan inte starta en tur.** Adressen bär år och vy, men inte en tur (`js/url-state.js`).
- **Det finns ingen utskrift.** `css/style.css` saknar `@media print`, så det går inte att skriva ut ett elevblad.
- **Turformatet saknar lärarfält:** årskurs, tid, koppling till Lgr22, förkunskaper, lärarinstruktion och exit ticket.
- **Det finns inga elevuppdrag.** #250 är en idésamling med sju spellägen.

## Avgränsning: vad som ingår och vad som väntar

**Ingår i Version 6:**
1. Quizet "Vad hände samtidigt som …?" (#65, enligt den godkända byggordern).
2. Tre tekniska förutsättningar: turlänk, lärarfält i turformatet och utskrift.
3. **Två** lektionsturer (#66), varav den ena bygger på en befintlig tur.
4. **Två** elevuppdrag ur #250: *Samtidighetsjakten* och *Källdetektiven*.
5. Ett lärarblad per lektion, som skrivs ut ur samma data som turen (en källa, inte ett separat dokument).
6. Själva piloten: en lärare, en klass, ett observationsprotokoll och en utvärdering.

**Väntar till efter piloten** (flyttas ur milstolpen eller står kvar som "efter piloten"):
- **#365 Källkritisk karta:** stor ändring i renderingen. Källdetektiven prövar idén i liten skala först.
- **#469 Allmänbildningsläge:** svårighetsgrader, diplom, framsteg och dagens fråga. Quizet (#65) är det första steget.
- **#476 Historiska perioder:** kräver Rikards beslut om indelningen och en egen källgenomgång. Bra för skolan men inte nödvändigt för piloten.
- **Kompetensmärken, poäng som sparas, QR-kod, Gy25 och fler lektionspaket.** Det avgörs efter vad läraren säger.

Det gäller fortfarande: inga konton, inga topplistor, inga streaks, ingen tidspress, inga poäng för krig och död och inga frågor som inte bygger på källkontrollerade händelser (#250, #469).

## Arbetspaket

Storlek: L = liten, M = medel, S = stor. "Agent" är förslaget enligt reglerna i CLAUDE.md. Codex och Copilot tar aldrig data, fakta eller källor.

| # | Paket | Issue | Storlek | Agent | Beror på |
|---|---|---|---|---|---|
| A1 | **Quiz:** "Vad hände samtidigt som …?" enligt byggordern | #65 | M | Codex | Spärren mot #15 (se beslut 2) |
| A2 | **Turlänk:** `t=<tur-id>` (och valfritt steg) i adressen startar turen; Dela-länken tar med turen när en tur pågår; okänt tur-id hoppas över | nytt | L | Codex | – |
| A3 | **Lärarfält i turformatet:** valfritt `lesson` med årskurs, minuter, läroplanskoppling (källa krävs), förkunskaper, lärarinstruktion och exit ticket. Kontroll i `js/tour-format.js`, schema, `docs/datamodell.md` och en beslutsfil | nytt | M | Claude Code (Opus: datamodell) | – |
| A4 | **Utskrift:** knappen "Skriv ut" i en tur med lärarfält ger ett elevblad (frågorna, platser för svar, exit ticket och källorna) och ett lärarblad (instruktion, tid, Lgr22, länk och facit där det finns). `@media print` i CSS, inget nytt beroende | nytt | M | Codex eller Claude Code (Sonnet high) | A3 |
| B1 | **Lektion 1, åk 7–9: "Världskrigen som globala händelser".** Den befintliga turen om andra världskriget får lärarfält och 3–4 frågor. Inga nya fakta, bara frågor som stegens källor täcker | nytt | M | Claude Code (Opus) | A3 |
| B2 | **Lektion 2, åk 4–6: "Vikingatiden och världen samtidigt"** (cirka 800–1100): vikingarnas resor och samtidiga händelser i Afrika, Asien och Amerika ur befintliga, källkontrollerade händelser. Saknas en händelse skrivs den enligt källpolicyn | nytt | S | Claude Code (Opus) | A3; täckningskontroll först |
| C1 | **Samtidighetsjakten:** "Hitta tre händelser på tre kontinenter omkring år X." Eleven klickar i händelser och sidan bekräftar världsdel och år ur datan. Inga nya fakta. Startas med en länk (`u=jakt&y=…`) och från en lektion | nytt | M | Codex | A2 |
| C2 | **Källdetektiven:** ett uppdrag på elevbladet som utgår från en händelse vars källor skiljer sig eller där dateringen är osäker (`note.kind`). Eleven läser faktarutan och svarar på vad källorna säger och vad som är osäkert. Bygger på A4, ingen ny kod utöver urvalet | nytt | L | Claude Code (Opus: urval av händelser) | A4, B1 |
| D1 | **Lgr22-referenser:** öppna Skolverkets kursplan i historia och lägg in den i `sources.json`; varje lektion pekar på det centrala innehåll den kopplas till. Skriv "kopplad till Lgr22", aldrig "godkänd av Skolverket" | ingår i B1/B2 | L | Claude Code (Opus) | – |
| E1 | **Pilotpaket:** en kort sida för läraren (vad sidan är, inga personuppgifter, länkar, så skriver man ut, kontakt), ett observationsprotokoll och tre frågor till läraren och eleverna efteråt | nytt | L | Claude Code | A4, B1, C1 |
| E2 | **Pilotlektionen:** Rikard hittar en lärare och en klass och bokar en tid. Planeras i Rikards Claude-projekt | nytt, `utanför-kod` | – | Rikard | E1 |
| E3 | **Release:** release-PR med UX-genomgång på dev, test utan grafikkort och i mobilbredd, och den korta rapporten (#150, del C). Version 6.0.0-pilot eller 6.0.0, Rikard bestämmer | – | M | Claude Code | allt ovan |
| E4 | **Utvärdering:** fynden från piloten blir issues; sedan avgör Rikard vad som går vidare (märken, fler lektioner, Gy25, #365, #469, #476) | – | – | Rikard och Claude Code | E2 |

**Språk (beslut 2026-11-06):** ny gränssnittstext läggs i alla fem språkfilerna, och lektionsturerna översätts till `en`, `de`, `es` och `fr` i samma pull request. Piloten är svensk, men regeln gäller ändå. Det ökar B1 och B2 med ungefär en tredjedel.

## Ordning och parallellism

```
Steg 1 (parallellt)   A1 quiz (Codex)   A2 turlänk (Codex)   A3 lärarfält + beslut (Claude Code)
Steg 2                A4 utskrift (efter A3)   C1 Samtidighetsjakten (efter A2)   B1 lektion 1 (efter A3)
Steg 3                B2 lektion 2   C2 Källdetektiven   E1 pilotpaket
Steg 4                E3 release → E2 pilotlektion → E4 utvärdering
```

**Filkrockar att hålla isär:**
- `data/ui/*.json`: A1, A2, A4 och C1 lägger alla till texter. De byggs en i taget eller ombaseras i tur och ordning (A1 → A2 → C1 → A4).
- `js/url-state.js`: A2 och C1. C1 startar efter A2.
- `js/tour-format.js` och `data/turer/`: A3 före B1 och B2.
- `js/ui/tour.js`: A2 och A4. A4 startar efter A2.

Med högst fyra öppna pull requests per person ryms steg 1 och 2 utan väntan. **Under tiden** fortsätter de parallella spåren: rikenas täckning (#645, #646) och översättningen (#676–#679). De rör inte samma filer, utom att `data/oversattning.json` ombaseras.

## Risker

- **Skoldatorer utan grafikkort.** #692 gjorde de långa hoppen lättare, men vi bör testa piloten på en riktig skoldator eller med mjukvarurendering innan lektionen.
- **Skolans nätverk** kan blockera jsdelivr (three.js) eller Cloudflare. Rikard ber läraren öppna länken på en skoldator i förväg. Att fungera utan nät (#486) ligger utanför piloten.
- **Lgr22-kopplingen** får inte låta som ett godkännande. Formuleringen bestäms i A3:s beslutsfil.
- **För mycket på en gång för eleverna** (helhetsanalysen 2026-11-06, Fynd 3). Lektionerna startar i ett avskalat läge: bara de lager turen behöver, satt i turens steg.

## Beslut som behövs från Rikard

1. **5.2 före eller efter?** Gör klart 5.2 (#15, #569, #579) före Version 6, eller flytta dem till efter piloten. Rekommendation: **flytta dem till efter piloten.** Ingen av dem behövs i en lektion, och #569 väntar ändå på ett beslut.
2. **Spärren för quizet:** #65 skulle starta efter #15 bara för att båda ändrar `data/ui/`. Om 5.2 flyttas släpps spärren och #65 kan få `redo` direkt (ingen öppen pull request krockar i dag).
3. **Vilken årskurs först?** Rekommendation: den årskurs Rikard har en lärare till. Har du ingen ännu: börja med **åk 7–9 (lektion 1)**, eftersom den bygger på en färdig tur och blir klar först.
4. **Lärarbladet i sidan eller som separat dokument?** Rekommendation: **utskrift ur sidan**, så att lärarbladet och turen aldrig säger olika saker.
5. **Flytta #365, #469 och #476** ur milstolpen Version 6 till "efter piloten" (Senare)?

När planen är godkänd skapar Claude Code issuena (A2, A3, A4, B1, B2, C1, C2, E1 och E2 med `utanför-kod`), delar #66 och #250 i de nya issuena, skriver byggordrar och sätter `redo` på dem som saknar beroenden.

## Genomfört (2026-11-07)

Rikard sa ja till planen och till alla fem rekommendationerna: resten av 5.2 väntar, spärren för quizet är borttagen, piloten börjar med åk 7–9, lärarbladet skrivs ut ur sidan, och #365, #469 och #476 är flyttade ur milstolpen.

| Paket | Issue | Status |
|---|---|---|
| A1 quiz | #65 | `redo` (Codex) |
| A2 turlänk | #736 | `redo` (Codex) |
| A3 lärarfält i turformatet | #737 | `redo` (Claude Code) |
| A4 utskrift | #738 | efter #736 och #737 |
| B1 lektion 1, åk 7–9 | #739 | efter #737 |
| B2 lektion 2, åk 4–6 | #740 | flyttad till efter piloten (2026-11-07) |
| C1 Samtidighetsjakten | #741 | efter #736 |
| C2 Källdetektiven | #742 | efter #738 och #739 |
| E1 pilotpaket | #743 | efter #738, #739 och #741 |
| E2 pilotlektionen | #744 | Rikard, `utanför-kod` |

#737–#740, #743 och #744 är delissues till #66; #741 och #742 till #250. #365 ligger i "Senare: teknik", #469 i "Experiment: Lekar och tankeexperiment" och #476 i "Senare: beslut krävs".

## Uppföljning 2026-11-07

Rikard flyttade lektion 2 för åk 4–6 (#740, paket B2) till efter piloten. Piloten görs bara med lektion 1 (#739). Inget annat paket berodde på B2. #740 ligger nu i "Senare: innehåll och media". Beslut: `docs/beslut/2026-11-07-lektion-2-efter-piloten.md`.
