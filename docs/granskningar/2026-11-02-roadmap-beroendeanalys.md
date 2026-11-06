# Roadmap- och beroendeanalys: 4.2, 4.3, R7, 5.1 och 5.2

**Datum:** 2026-11-02  
**Omfattning:** öppna issues, öppna pull requests och befintliga beslut i de fem prioriterade spåren.  
**Aktuell kodbas:** `main` `80b2125` efter sammanslagna rapport- och granskningsändringar.  
**Öppen PR vid analysen:** #519.

## Sammanfattning

Projektet behöver två kompletterande planeringslager:

1. Den här texten är den läsbara planen för Claude Code: varför ordningen ser ut som den gör, vad som blockerar vad och vilken agent som bör äga varje spår.
2. GitHub Project #2 ska vara den visuella arbetskartan: aktuella issues, milstolpar, ansvarig agent, status och riktiga `blocked by`/`blocking`-relationer.

Projektvyn som fanns vid analysen var en roadmap utan datum- eller iterationsfält och visade i praktiken äldre issues, bland annat #8–#60. Den var därför inte tillräcklig som aktuell plan. Den bör uppdateras först med den här analysens urval och relationer.

## Agentprincip

**Codex tar:** avgränsade, källfria UI-, tillgänglighets-, test- och mekaniska dokumentationsändringar som har etiketten `codex: redo`. En PR i taget när centrala filer eller webbläsartestet överlappar.

**Claude Code tar:** arkitektur, centralt tillstånd, data, historiska fakta, källor, licenser, rikesdata, bilder och slutlig integration. Claude skriver också byggordern och sätter `codex: redo` när ett issue är tillräckligt avgränsat.

**Rikard behöver fatta beslut om:** ändrad produktlogik, datamodell, nya källor/licenser, större visuella principer och när en milstolpe får avslutas.

## Rekommenderad huvudordning

```text
#519
  → 4.2: #506 → #508 → #516 → #378 → #362/#405 → exit-test
  → R7: #407 → #377 → tekniska delar av #378; därefter #353 → #474
  → 4.3: #402-delarna → #403 → #393 → #412
  → 5.1: #394 → #452/#453 i batcher → #61
  → 5.2: #501 → #64 → #15
```

Pilarna betyder beroende eller rekommenderad konfliktfri ordning, inte att varje steg måste vänta på en release. Parallellisering är bara säker när issuesen inte delar centrala filer, datafiler, beslutslogg eller webbläsarsvit.

## Milstolpe 4.2 – stabilitet och tillgänglighet

### 1. PR #519 / issue #515 – rotation efter årshopp

Redan påbörjad. Claude Code granskar och Rikard slår ihop. Nya årshopp- eller globändringar väntar tills denna PR är integrerad.

### 2. #506 – skärmläsarstatus

**Agent:** Codex. **Test:** full webbläsarsvit plus manuell VoiceOver/NVDA efteråt.  
Tar bort överuppläsning av årtal under uppspelning och gör paus- och Samtidigt-text tillgänglig. Bör gå före #378 eftersom den rör tidslinje/status och har byggorder i issuet.

### 3. #508 – Samtidigt-listan och räknaren

**Agent:** Codex. **Test:** komponent + 400/200/400 procent och sedan full svit.  
Gör A/B-beslutet: separera gammalt öppet pågående innehåll och visa högst fem per världsdel med `Visa fler`, samt räknaren `N träffar: X pågår, Y nära`. Ska göras efter #506 och efter att Fokusmeny-ändringen i #513 är integrerad.

### 4. #516 / uppföljning av #363 – frivillig introduktion

**Agent:** Codex. **Test:** full svit, första besök, mobil och reducerad rörelse.  
Ingen automatisk popup; egen knapp `Ett år, en plats` under Utforska; start på 1889 så glob och introduktion visar samma år. Väntar på #519 eftersom båda ändrar huvudflödet och årshopp.

### 5. #378 – tidslinjens prickar

**Agent:** Codex för den redan beslutade tekniska avgränsningen. **Test:** full svit.  
Gör `marks(state)` i lagerregistret, former och förklaring, men bygger inte upptäcktsprickar förrän #377 är klar. Rör tidslinje, lager, fokus, mobil och arkitekturdokumentation; därför inte parallellt med #506.

### 6. #362/#405 – exit-test

**Ägare:** Claude Code samordnar; Rikard gör det manuella skärmläsartestet.  
4.2 är inte färdig förrän #506 är verifierad, #405:s kvarvarande manuella test är genomfört och hela exit-sviten är grön i 1400 × 900 och 400 × 800.

**4.2 kan därför inte parallelliseras fritt.** Den bör köras som en följd av små PR:er med en gemensam integrationskontroll.

## R7 och restarbete

### #407 – saknade stater

**Agent:** Claude Code. **Test:** källkontroll, JSON-/genereringsvalidering och komponenttest.  
USA och andra nödvändiga stater läggs till ur Cliopatria med källor. Arbetet blockerar den datadrivna regeln i #377. Gör en prioriterad lista först så att R7 inte blir en obegränsad massimport.

### #377 – upptäcktsdimma över riken

**Agent:** Claude Code. **Test:** komponent och full mobilkontroll.  
Implementerar den beslutade regeln A: när en resa når ett rike lyfts hela rikets område. Kräver #407 för de stater som saknas och en uppdatering av beslutsloggen i samma PR.

### #378:s upptäcktsprickar

Den delen väntar på #377. Övriga delar av #378 kan göras i 4.2, men prickar som härleds från när en resa når ett område ska inte byggas före dimregeln.

### #353 – symboler för R6-länder

**Agent:** Claude Code. **Test:** käll- och licenskontroll samt komponenttest.  
Varje emblem måste ha öppnad källa, korrekt licens eller dokumenterad frånvaro. Kör efter #407 om samma rikesfiler berörs.

### #474 – huvudstäder över tid

**Agent:** Claude Code. **Test:** data-/schema- och komponenttest.  
Gör sist i R7-spåret, efter att rikesdataformatet stabiliserats. Det kan annars krocka med #407 och #353 och kräver tidsintervall, källor och presentation.

## Version 4.3 – teknisk grund

### #402 / #389 – dela upp `main.js`

**Agent:** Codex utför mekaniska del-PR:er enligt Claude Code:s godkända arkitekturplan; Claude Code granskar varje PR.  
Ordningen är:

1. `controllers/story.js`
2. `controllers/selection.js`
3. `controllers/focus.js`
4. `controllers/render.js`
5. `controllers/playback.js` och krigsberättelsernas återstående kopplingar

Ingen beteendeförändring och ingen URL-serialisering i dessa PR:er. Varje del behöver före/efter-skärmbilder och full webbläsarsvit. Playback görs sist eftersom den delar köer, pauser och tidslinjelyssnare med nästan allt annat.

### #403 – centralt state

**Agent:** Claude Code.  
Definiera state-kontraktet efter controlleruppdelningen. Det är beroende för #501 och ska inte utvecklas parallellt med URL-formatet.

### #393 – licenssammanställning

**Agent:** Codex när Claude Code har satt `codex: redo`. **Test:** riktad.  
Låg risk och kan användas som Codex-arbete medan Claude arbetar med centralt state, under förutsättning att den inte delar filer med en annan PR.

### #412 – upstream/resurspolicy

**Agent:** Claude Code eller separat lågprioriterat Codex-dokumentationsarbete.  
Påverkar inte webbsidan och bör göras sist i 4.3, inte blockera tekniska ändringar.

## Version 5.1 – global täckning

### #394 – redigeringsformatpilot

**Agent:** Claude Code. **Beroende:** schema-/validatorgrund.  
Pilot med period- eller regionfiler, generator och CI-kontroll som jämför genererad data med incheckat resultat. Detta måste vara stabilt före massimport.

### #452 – kärnhändelser

**Agent:** Claude Code. **Test:** källkontroll och komponenttest per batch.  
Gör cirka 20 händelser per PR, flera världsdelar per batch och Rikards godkända lista före import. Ingen uppgift skrivs ur minnet.

### #453 – bilder

**Agent:** Claude Code tills uppladdningsflödet är säkert för Codex.  
Gör bildbatch efter motsvarande innehållsbatch så att källor, licenser och bildtexter granskas tillsammans. Bilderna ska inte blandas in i en stor massimport-PR.

### #61 – massimport per världsdel

**Agent:** Claude Code. **Beroende:** #394 och fungerande pilot.  
Gör sist i 5.1 och i små region-/periodbatcher. Definitionen “ungefär lika många” behöver en mätbar täckningsrapport innan importen börjar.

## Version 5.2 – sök, delning och introduktion

### #501 – state i adressen

**Agent:** Claude Code. **Beroende:** #403.  
Fastställ stabilt adressformat, serialisering, återställning och webbläsarhistorik.

### #64 – delbara länkar

**Agent:** Claude Code. **Beroende:** #501.  
Utökar samma format till kopierbara länkar för år, kamera, lager och fokus. Ska inte skapa ett andra stateformat.

### #15 – sök på plats

**Agent:** Claude Code först; kan senare brytas ut till Codex när state- och sökkontraktet är färdigt och issuet märks `codex: redo`.  
Sök bygger på befintliga lager och bör inte börja innan platsval och URL/state är stabila.

## Projektvy #2 – föreslagen konfiguration

Behåll issues och PR:er som källobjekt. Lägg till eller visa följande fält:

- `Milestone` – befintligt GitHub-fält
- `Status` – befintligt statusfält
- `Agent` – `Codex`, `Claude Code`, `Rikard`, `Gemensam`
- `Arbetstyp` – `UI/test`, `Arkitektur`, `Data/fakta`, `Källor/licens`, `Granskning`
- `Testnivå` – `Riktad`, `Komponent`, `Full`
- `Startläge` – `Kan börja`, `Efter #…`, `Efter Claude-granskning`, `Beslut krävs`

Använd GitHubs riktiga issue-relationer `blocked by` och `blocking` för beroenden. Skriv inte samma beroende manuellt i flera fält.

Rekommenderade vyer:

1. **Hela planen:** filtrera till de fem milstolparna, gruppera efter milestone och sortera efter status.
2. **Beroenden:** tabell med `blocked by`, `blocking`, Agent och Startläge.
3. **Codex-kö:** `label:"codex: redo"` och endast ärenden utan blockerande PR.
4. **Claude Code-kö:** arkitektur, data, fakta, källor och granskning.
5. **Nästa steg:** endast `Startläge = Kan börja`.

Roadmap-layouten bör användas först när datum eller iterationer faktiskt är beslutade. Milstolparna ska inte få påhittade datum bara för att fylla tidslinjen.

## Rekommenderad operativ regel

Codex håller högst fyra öppna PR:er totalt och bygger inte på en central fil som en annan öppen PR ändrar. Claude Code gör triage och arkitekturgranskning före nya `codex: redo`. Rikard slår ihop PR:er och stänger issues genom merge.

Detta minimerar ställtid och ombasering bättre än att fylla alla agentköer samtidigt.

