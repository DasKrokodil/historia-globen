# Backlogg, roadmap och tokenbudget

**Datum:** 2026-11-03  
**Verifierad `main`:** `70c2924`  
**Öppna issues:** 111  
**Öppna issues i närmaste roadmapkedjan:** 25  
**Codex redo:** 6  
**Syfte:** ge Claude Code och Rikard ett budgetunderlag för veckoplanering och kontrollera om ordningen 4.2 → 4.3 → R7/restarbete → 5.1 → 5.2 håller.

## Sammanfattning

Roadmapens ordning är i huvudsak rätt, men 4.2 och 5.1 behöver avgränsas. 4.2 innehåller fortfarande både mobil/UI, tillgänglighet, upptäcktsvy och äldre planeringsrester. 5.1 innehåller den största kostnaden: kärnhändelser, licensierad bildomgång, redigeringsformat och massimport bör inte behandlas som en enda arbetsperiod.

Claude Code är den begränsande resursen, eftersom källor, data, arkitektur och rikesarbete kräver dess bedömning. Codex kan ta flera avgränsade UI- och testärenden, men kan inte ersätta Claude Code i fakta- och datakedjan.

## Backloggen i stora drag

| Område | Öppna issues | Bedömning |
|---|---:|---|
| 4.2 Stabilitet och tillgänglighet | 8 | Närmast release, men kräver städning och avgränsning |
| 4.3 Teknisk grund | 7 | Förutsättning för senare sök, delning och större funktioner |
| R7 och restarbete | 3 | Käll- och datatungt; bör gå efter stabil teknisk grund |
| 5.1 Global täckning | 4 | Största arbetsblocket; måste delas i batchar |
| 5.2 Sök, delning och introduktion | 3 | Rätt placerad efter centralt tillstånd i 4.3 |
| Senare milstolpar och experiment | 86 | Ska inte blandas in i nästa arbetsperiod |

Totalt finns 111 öppna issues och inga öppna issues utan milstolpe. Sex är märkta `codex: redo`. Tre pull requests är öppna just nu, varav #544 är implementation, #541 är blind-spots-rapport och #545 är processdokumentation.

## Tokenmodell

Intervallen nedan är första uppskattningar i tusentals tokens (`k`). De är inte löften. De inkluderar normal implementation, relevant granskning och en mindre mängd rättningar, men inte en helt ny omprojektering.

| Milstolpe | Codex | Claude Code | Total | Kommentar |
|---|---:|---:|---:|---|
| 4.2, rekommenderad kärna | 110–230k | 130–265k | 240–495k | #530, #542, #543, #362 och #405 |
| 4.3 | 45–85k | 185–370k | 230–455k | #538 före #402/#403; #389 räknas inte separat |
| R7/restarbete | 0–20k | 240–480k | 240–500k | #407, #474 och #353; källor/data |
| 5.1 | 100–220k | 560–1 100k | 660–1 320k | #452, #453, #394 och #61 |
| 5.2 | 35–70k | 170–340k | 205–410k | #501 → #64; #15 därefter |

För veckoplanering bör man lägga på cirka 20 procent reserv. Budgeten ska hållas separat per agent: en stor Codex-budget kan inte kompensera för att Claude Code saknar tokens för källkontroll eller arkitekturbeslut.

## Issuebedömning och ordning

### Version 4.2

| Issue | Codex | Claude Code | Bedömning |
|---|---:|---:|---|
| #530 Mobilmeny | 30–60k | 20–45k | Beslut om meny först; central mobil-UI |
| #542 Bildlös reservruta | 25–50k | 15–30k | Bra avgränsat Codex-ärende |
| #543 Fokusfilter | 25–55k | 20–40k | Codex kan undersöka; beslut/dokumentation granskas av Claude |
| #362 Tillgänglighetsgenomgång | 10–25k | 40–80k | Bör vara granskningsram för #405 |
| #405 Skärmläsare/textalternativ | 20–40k | 35–70k | Central tillgänglighet; inte parallellt med #530 |
| #377 Upptäcktsdimma | 0–10k | 50–100k | Bör flyttas till R7 eller vänta på #407 |
| #363 Introduktion | 0 | 0 | Ser ut som kvarvarande dubblett till stängda #516 |
| #539 Blind spots | klart | triage | Rapportarbete, inte ny implementation |

Rekommenderad 4.2-ordning: #542 → #543 → beslut/implementation av #530 → #362/#405 → releasekontroll. #377 bör inte få blockera 4.2.

### Version 4.3

- **#538 först:** skyddsnät för uppspelning, pauser, fokus och resor.
- **#402 och #403 därefter:** uppdelning av `main.js` och centralt tillstånd. De delar centrala filer och bör inte byggas parallellt.
- **#393 och #517 efter refaktorn:** licenssammanställning respektive förbättring av källsidan.
- **#389 är samlingsissue** och ska inte budgeteras utöver #402 och #403.
- **#412** är administrativt och ska vänta tills orkesterförsöket med 10–20 issues är utvärderat.

### R7 och restarbete

Ordningen bör vara #407 → #377, medan #353 och #474 planeras som separata källbatchar. #474 är särskilt dyrt eftersom huvudstäder kräver historiska årsspann, schema, källor och dataändringar. R7 bör inte parallelliseras fritt eftersom flera arbeten berör `data/empires/`, genererade filer och källregister.

### Version 5.1

Detta är den tydligaste roadmaprisken.

1. #394: besluta och bygg redigeringsformatet innan massimport.
2. #452: godkänn kärnhändelselistan och lägg in källkontrollerade batchar, högst 20 per PR.
3. #453: bilder efter respektive kärnhändelsebatch, med separat licenskontroll.
4. #61: massimport först när format, schema, källflöde och täckningsmått är stabila.

5.1 bör alltså delas i minst tre arbetsperioder: grundformat, kärnhändelser/bilder och massimport.

### Version 5.2

Ordningen är rimlig: #403 → #501 → #64 → #15. #501 ska definiera det stabila tillståndsformatet; #64 ska återanvända det och #15 bör vänta tills år, kamera, fokus och lager kan delas på ett stabilt sätt.

## Påverkan på veckoplaner

En veckoplan bör inte fyllas med issues enbart efter antal. Den bör innehålla:

- Codex-intervall och Claude Code-intervall separat,
- 20 procent reserv,
- en tydlig granskningsnivå,
- vilka filer och beroenden som låser parallellism,
- vad som händer om Claude Code-budgeten tar slut,
- faktisk förbrukning när issuet är klart.

Exempel: om veckobudgeten är 300k för Codex och 200k för Claude Code kan 4.2:s kärna inte läggas i en enda vecka, eftersom Claude Code-delen ensam uppskattas till 130–265k före reserv. Då bör veckan innehålla #542, #543 och beslutet om #530, medan #362/#405 läggs i nästa block.

## Rekommenderad roadmap

1. Slutför och triagera #541 samt avsluta den pågående #544.
2. Gör 4.2 smal: #542, #543, #530 och tillgänglighetsgrinden.
3. Flytta #377 ur releasekritiska 4.2 och koppla den till #407/R7.
4. Kör #538 före #402/#403 i 4.3.
5. Gör R7 som källkontrollerade batchar, inte parallell massproduktion.
6. Dela 5.1 i format, kärnhändelser/bilder och massimport.
7. Börja 5.2 först när centralt tillstånd och URL-format är stabila.

Rapporten ska kalibreras efter varje avslutad vecka genom att jämföra intervallen med faktisk förbrukning. Den befintliga `docs/granskningar/handoff.json` lämnas orörd eftersom `2026-11-02-roadmap-beroendeanalys.md` fortfarande väntar på Claude Code-triage.
