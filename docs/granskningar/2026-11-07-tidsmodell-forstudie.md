# Förstudie: tidsmodell för ungefärliga datum och intervall (#775, underlag för #396)

**Datum:** 2026-11-07. **Av:** Claude Code (DasKrokodil). **Ingen kod ändras.** Inga nya historiska fakta: antal och exempel är tagna ur `data/events.json` och koden som den ser ut på `main` i dag.

## Kort sammanfattning

- Dagens modell (astronomiska heltalsår, `edtf`, `precision`) räcker för att **lagra** förhistoriska händelser ner till 10 000 f.Kr. Datamodellen och schemat behöver inga nya fält för version 7.
- Det som inte räcker är **tidsreglaget**: det börjar vid 3000 f.Kr. Två av de sex händelser vi redan har före 3000 f.Kr. syns aldrig på globen (Göbekli Tepe och jordbrukets början), och kilskriften (3300 f.Kr.) syns inte heller. Prövat i webbläsaren, se nedan.
- Rekommendation: **behåll beslutet från 2026-11-01** (två lägen: människans historia med dagens år, jordens historia med en egen tidstyp senare) och bygg det i tre delar. Del 1 och 2 räcker för version 7 och ändrar inte arkitekturens punkt 3. Del 3 är version 8.
- Rikard behöver bestämma tre saker: hur långt bak människans läge ska gå, hur stor del av reglaget förhistorien får, och om förhistorien i täckningen (#767) väntar på del 2.

## Vad som redan är beslutat

I #396 beslutade Rikard 2026-11-01 att följa Codex riktning: dagens astronomiska år och delar av år behålls oförändrade för människans historia, djup tid får senare en egen tidstyp i läget Jordens historia (till exempel `{ mode: 'earth', beforePresent: { earliest, latest, unit: 'years' } }`), och `Y-66000000` används bara som utbytesformat. Beslutet finns som kommentar i #396 men inte som fil i `docs/beslut/`. Den här förstudien prövar beslutet mot koden och delar upp det i steg; den föreslår inte en ny riktning.

## 1. Vad dagens modell redan klarar

**Data (763 händelser, räknat ur `data/events.json`):**

| Fält | Hur det används i dag |
|---|---|
| `start`, `end` | Heltal, astronomisk årsräkning. Tidigaste `start` är −9999 (`jordbrukets-borjan`, 10 000 f.Kr.), senaste `end` 2026. |
| `edtf` | 359 med spann (`/`), 128 med `~`, 20 med `?`, 2 med öppet slut (`/..`), 1 med öppen start (`../`). **Inga** med `Y`-prefix (år med fler än fyra siffror). |
| `precision` | 6 (årtusende): 2, 7 (århundrade): 71, 8 (decennium): 40, 9 (år): 120, 10 (månad): 69, 11 (dag): 461. Inget under 6. |

Exempel på förhistoria som redan fungerar som data: `gobekli-tepe` med `start` −9499, `end` −7999, `edtf` `-9499~/-7999~`, `precision` 6; `jordbrukets-borjan` med `-9999~/-7999~`, `precision` 6 och `locationPrecision: region`.

**Schema (#391):** `schemas/event.schema.json` kräver bara att `start` och `end` är heltal, att `precision` ligger mellan 0 och 11 och att `edtf` inte är tom. Schemat tillåter alltså redan `start: -65999999` och `edtf: "Y-66000000"`.

**Kod:**
- `js/model.js`: `formatYear` och `formatTime` visar f.Kr. och "cirka" (`~`) och spann. `edtfSpan` läser datum med dag och månad till decimalår (krigens fokusläge, #204).
- `js/state.js`: `year` är ett tal (decimaltal i fokusläget för korta krig) och avrundas till fyra decimaler i JSON. Inget tak eller golv.
- `js/url-state.js`: `y=` läses med `Number()`; inget tak eller golv.
- `tools/dela_data.py`: perioden `fkr` tar alla år till och med 0, utan undre gräns. `tools/hced.py` skriver `edtf` som `-%04d`, vilket fungerar för fyra siffror.
- Riken (`data/empires/index.json`): tidigaste `from` är −2500, alltså inom reglaget.

## 2. Vad som inte räcker

### Prövat i webbläsaren

`python3 -m http.server` och Playwright, sidan öppnad med `#y=-2999`, `#y=-9499` och `#y=-66000000`, inga konsolfel:

- Alla tre länkarna visar **3000 f.Kr.** Länkar till år före tidslinjens början klämms tyst till början.
- Vid 3000 f.Kr. syns Stonehenge (pågår då) men **inte** Göbekli Tepe, jordbrukets början eller kilskriften. De två första går bara att nå genom att välja dem (till exempel i sökningen).

Förklaringen i koden: `MIN_YEAR = -2999` i `js/timeline.js`, och fönstret för "samtidigt" vid reglagets början är `yearsAcross(-2999, 0.012)` ≈ 120 år. Kilskriften (−3299) ligger 300 år före, Göbekli Tepe (slut −7999) 5 000 år före.

### Per fil

| Fil | Vad som går sönder för förhistoria (version 7) | … och för miljoner år (version 8) |
|---|---|---|
| `js/timeline.js` | `MIN_YEAR = -2999`, `SEGMENTS` och `TICKS` börjar där, `clampY` klämmer allt tidigare. Snabbhoppen och årsfältet säger "Välj ett år mellan 3000 f.Kr. och …". | Ett linjärt segment för 66 miljoner år ger ingen upplösning. Uppspelningens snabbaste fart är 100 år/s (`SPEEDS`), alltså cirka 7,6 dygn för 66 miljoner år. Behöver en egen skala, inte fler segment. |
| `js/model.js` | `parseYear` tar högst fyra siffror (`\d{1,4}`), så man kan inte skriva "12000 f.Kr.". `formatYear` saknar tusentalsavgränsare ("9500 f.Kr." går, "12000 f.Kr." blir svårläst). `edtfSpan` läser bara fyrsiffriga år (`-?\d{4}`) och ger `null` för `Y-…`. | `formatYear(-65999999)` blir "66000000 f.Kr.", inte "66 miljoner år sedan". Ingen visning av "år sedan" eller "miljoner år". `precision` under 6 hanteras inte i visningen. |
| `js/state.js` | Inget. Talen är exakta långt bortom miljoner år. | Saknar fältet för läge (`human` eller `earth`). `STATE_VERSION` måste höjas om fältet blir obligatoriskt; valfritt fält räcker. |
| `js/url-state.js` | Inget i formatet. Länkarna klämms av tidslinjen, inte av adressen. | Saknar parameter för läge. En gammal länk utan läge ska fortsätta betyda människans historia. |
| `js/layers/*` | Fönstret för "samtidigt" följer segmentet. Ett nytt, glest segment ger ett brett fönster (bra för förhistoria). | Riken, religioner, vägar, krig och nattljus har ingen betydelse i jordens historia. Lagerregistret (#338) behöver veta vilka lager som hör till vilket läge. |
| Data | `edtf` med fyra siffror räcker till 10 000 f.Kr.; tidigare kräver `Y`-prefix, som `edtfSpan` inte läser (men `start` och `end` fungerar). | Osäkerhet som ± i miljoner år (`earliest`, `latest`) passar inte i `start`/`end` som år med `precision`; det är därför beslutet 2026-11-01 ger djup tid en egen typ. |

### Osäkerhet

För människans historia räcker dagens sätt: `start` och `end` är de yttre gränserna, `~` och `?` i `edtf` säger att de är ungefärliga, och oense källor skrivs i `note`. Ett eget fält `certainty` behövs inte i version 7. För jordens historia beskriver källorna ofta ett värde med felmarginal; där ger `beforePresent: { earliest, latest }` samma sak utan att blandas ihop med kalenderår. Vilken referenspunkt "nutid" har (källorna brukar räkna år före nutid från ett fast år) bestäms när tidstypen skrivs, med källa.

## 3. Alternativ

| | (A) År som enda nyckel, utöka visning och `edtf` | (B) Två lägen med varsin tidsaxel | (C) En gemensam axel i år före nutid |
|---|---|---|---|
| Kort | Sänk `MIN_YEAR`, lägg till ett glest segment, läs `Y-…` och visa stora tal snyggt. | Människans historia som i dag (med A inuti), jordens historia som ett eget läge med egen tidstyp, skala och lager. | Allt räknas om till år före nutid, även 1325 och krigens dagar. |
| För | Minst kod. Inga nya fält. Länkar, Fokus, krigens dagar och intervalläget (#569) fungerar som förut. | Följer beslutet 2026-11-01. Varje läge får en skala som passar. Inget i människans läge ändras förrän del 3. Jordens historia kan ha egna lager (forntida kartor, #51–#53). | En enda modell i teorin. |
| Emot | Räcker inte för miljoner år: ett reglage kan inte ge plats åt både en dag i 1944 och 66 miljoner år. | Två kodvägar och ett lägesfält i tillståndet och adressen. Lagren måste säga vilket läge de hör till. | Bryter alla länkar (`y=1325`), alla 763 händelser, krigens delår (#204), `edtfSpan`, sökningen och schemat. Ändrar arkitekturens punkt 3 i grunden. Ingen vinst för version 7. |
| Storlek | Liten till medel | A + stor del för version 8 | Mycket stor |
| Räcker för | Version 7 | Version 7 och 8 | Version 7 och 8 |

## 4. Samspel med intervalläget (#569)

Beslutet om tidsintervall (`docs/beslut/2026-11-07-tidsintervall-569.md`) bygger intervallet på dagens tidsmodell: året plus ett valfritt slutår, och urvalet i en enda funktion i `js/date-events.js`.

- **Alternativ A och del 1–2 nedan krockar inte med intervallet.** Året är fortfarande ett tal; ett slutår i förhistorien fungerar likadant som i medeltiden.
- **Jordens historia (del 3) behöver inget intervalläge i början.** Ett läge i taget, och intervall, Fokus och uppspelning utesluter redan varandra.
- **De behöver alltså inte byggas ihop.** Den enda gemensamma punkten är adressen: när läget får en parameter ska slutårets parameter betyda samma sak som året i det läget. Det räcker att skriva det i beslutet för del 3.

## 5. Konsekvenser

- **Schema (#391):** inga ändringar för version 7. Valfritt: ett mönster för `edtf` som också godtar `Y`-prefix. Jordens historia får en egen schemafil när datatypen finns.
- **Länkar:** alla befintliga länkar fungerar. I dag klämmer tidslinjen länkar till förhistorien till 3000 f.Kr.; efter del 2 hamnar de rätt. En länk utan läge betyder alltid människans historia.
- **Tidsreglaget (#49):** del 2 är i praktiken #49 ("tidslinje i nivåer"). Ett nytt segment längst till vänster, med egna årtal i skalan, snabbhopp och text i årsfältet. Mobilbredden måste prövas, eftersom de fyra segmenten redan delar 400 px.
- **Människoarter (#11):** spann på tiotusentals år eller mer, ofta som områden. Kräver del 2 och troligen ett områdeslager med ungefärliga gränser; tidsmodellen räcker om `start` och `end` är yttre gränser och `edtf` säger `~`.
- **Förhistorien i täckningen (#767, C7):** kan läggas in **med dagens fält** redan nu, men händelser som slutar mer än cirka 120 år före 3000 f.Kr. syns inte på globen förrän del 2 är byggd, bara i sökningen. Händelser före 10 000 f.Kr. behöver dessutom `Y`-prefix, som `edtfSpan` först läser efter del 1.
- **Andra lager:** riken börjar vid 2500 f.Kr. och påverkas inte. Upptäcktsvyn, krig och nattljus påverkas inte av del 1–2.

## 6. Rekommendation

**Alternativ B, byggt som A först.** Det är beslutet 2026-11-01 i tre delar, där bara del 3 ändrar arkitekturen:

| Del | Innehåll | Storlek | Agent | Kräver |
|---|---|---|---|---|
| 1 | `edtfSpan` och `parseYear` läser `Y-…` och fler än fyra siffror; `formatYear` med tusentalsavgränsare och "cirka"; test i `tests/` för stora år. Inget syns annorlunda för besökaren. | Liten, 1 PR | Codex eller Claude Code (Sonnet) | inget beslut utöver detta |
| 2 | Tidsreglaget går längre bak: nytt första segment, årtal i skalan, snabbhopp, årsfältet och uppspelningens fart i det glesa segmentet (#49). Mobilbredd prövas. | Medel, 1–2 PR | Claude Code (Sonnet high, rendering och tidslinje) | beslut a–c nedan |
| 3 | Läget Jordens historia: `mode` i tillståndet och adressen, egen tidstyp `beforePresent`, egen skala, lager som anger sitt läge, beslut i `docs/beslut/` och uppdaterad punkt 3 i CLAUDE.md. | Stor, 3–5 PR | Claude Code (Opus för modellen, sedan Sonnet) | version 8 börjar (#12) |

**Beslut som Rikard behöver ta:**

- **a. Bekräfta riktningen:** B enligt beslutet 2026-11-01, med del 1 och 2 i version 7 och del 3 först i version 8. Beslutet skrivs då som fil i `docs/beslut/` (det saknas i dag).
- **b. Hur långt bak människans läge ska gå.** Gränsen bör väljas efter de äldsta händelser vi har källor för i #760 och #11, inte efter ett runt tal. Möjliga nivåer: 10 000 f.Kr. (ryms i dagens `edtf` med fyra siffror), cirka 100 000 år eller längre. Ju längre bak, desto glesare blir det nya segmentet.
- **c. Hur stor del av reglaget förhistorien får**, till exempel en tiondel. Resten av reglaget krymper lika mycket, och det märks mest i mobilen.
- **d. Förhistorien i täckningen (#767):** vänta tills del 2 är byggd (rekommenderas, annars ligger händelserna osynliga), eller lägg in dem nu och acceptera att de bara syns i sökningen tills reglaget går längre bak.

Del 1 kan få `redo` direkt efter beslut a. Del 2 kan få `redo` efter beslut b och c.
