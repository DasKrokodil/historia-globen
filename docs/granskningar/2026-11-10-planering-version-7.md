# Planering före milstolpe: Version 7, Människans långa historia (7.0.0)

**Datum:** 2026-11-10. **Av:** Claude Code (DasKrokodil), med nio agenter (`/milstolpe`, första provkörningen, beslut 2026-11-10). **Ingen kod eller data ändras och inga issues skapas.** Agenterna öppnade inga externa källor, så allt som sägs om forskningsläget (dateringar, arter, havsnivåer) är **antaganden** som ska källkontrolleras före bygget. Siffror om koden är räknade ur repot av arkitekten.

## 1. Bemanning (steg 1)

Milstolpens öppna issues: **#396** tidsmodell, **#49** tidsreglage för hundratusentals år, **#11** människoarter och vandringen från Afrika. #50 (ROAD-licens) är stängt.

| Agent | Behövdes | Varför |
|---|---|---|
| `historiker` | ja | #11 är nytt innehåll: dateringar, artbegrepp, osäkerhet |
| `geograf` | ja | områden och vandringslinjer, forntida kust, 180°-meridianen |
| `sprak-en`, `-de`, `-es`, `-fr` | ja | nya termer, stora årtal, "år sedan", talformat |
| UX och tillgänglighet (lins 1 och 7) | ja | #49 ändrar tidsreglaget; mobil 400 px |
| Arkitekt (lins 2) | ja | #396 och delad kod (`MIN_YEAR`) |
| Lärare och intresserad (lins 3 och 6) | ja | stenåldern i läroplanen; risker med evolution och vandring |
| Produktchef, elev, utvecklare | nej | produktbedömningen görs i den här rapporten |

### Saknas en expertroll? Ja: paleoantropolog eller arkeolog

**Alla nio agenter** föreslog den, oberoende av varandra. Skälet: historikern (lins 8) är en källkritisk kontroll av innehåll, inte en specialist på dateringsmetoder, artindelning och DNA-fynd. #11 gäller just omstridda dateringar och artbegrepp.

- **Förslag:** ny agent `forhistoriker` (paleoantropolog och arkeolog), lins 15 i `docs/produkt/06-granskningsperspektiv.md`. Granskar artlistan, dateringsspann och dateringsmetoder, fyndglesheten, om vandringen beskrivs som tolkning och om formuleringar om evolution, arter och befolkningar är sakliga. Gör det historikern inte gör: bedömer forskningsläget, inte bara om källan stöder påståendet.
- **Behövs bara i 7.0.0 eller återkommer?** Återkommer i version 8 (jordens historia) och i allt innehåll om förhistoria. Rekommendation: skapa den.
- **Skapas inte förrän du har sagt ja.** Ett utkast till agentfil ligger i bilaga A.
- Två roller som föreslogs av en eller två agenter: **kartograf för osäkerhetssymbolik** (geografen, historikern) och **informationsdesigner för osäkerhetsvisning** (UX). Rekommendation: ingen egen agent nu. Geografen (lins 13) och UX-linsen täcker dem, och frågan blir ett eget designissue (se 3).

## 2. Viktigaste fynden

### Blockerar (bör lösas före bygget)

1. **Falsk exakthet i skalan (historiker, UX).** Före cirka 50 000 år sedan har dateringar spann på tusentals år eller mer (antagande). Ett reglage som kan stanna på "−45 213" ser exakt ut. Krav: avrundade spann i reglaget och kortet, `precision` styr visningen, och "samtidigt"-fönstret ska vara brett.
2. **Områden och vandring utan gränser (historiker, geograf, UX, lärare).** Skarpa polygoner som riken ur Cliopatria vore falsk precision, och en pil från Afrika antyder en enda färd. Behövs en egen osäkerhetsstil (mjuk eller streckad kant, "tolkning", fyndplats skild från antaget område), och ett andra tecken än färg (färgblindhet).
3. **Nutida kust under forntida vandring (geograf).** `data/land.json` är nutida kust (Natural Earth). Vid 20 000 år sedan och äldre var havsnivån lägre (antagande), så Beringia, Sunda, Sahul och Nordsjön ritas över nutida hav. Behövs ett lager för forntida kust eller en synlig förklaring.
4. **Reglagets form på mobil (UX).** Ett femte segment tar plats från de fyra befintliga. Modern tid (1800–2026 har 25 % i dag) får inte försämras, vilket är kravet i #49. Piltangent ±1 år och PageUp ±100 år är värdelösa i ett segment på 100 000 år; steget måste följa segmentet.
5. **`MIN_YEAR` är en delad gräns (arkitekt).** Den importeras av `range.js`, `focus.js`, `panel.js`, `url-state.js`, `period-range.js` och `tests/webblasare.mjs`. Ändras den i en enda pull request, med test av varje användare.
6. **Beslutet a–d i förstudien är obesvarat** och beslutsfil för a (alternativ B) och b–c saknas (arkitekt).

### Viktigt

- **Datumlinjen vid 180° för områden (geograf).** `lines.js` har `unwrap()`, men `areas.js` verkar sakna motsvarande (antagande). Prövas med en testpolygon.
- **Europa-slagsida (historiker, geograf).** Ett tomt Sydostasien, Australien eller Amerika betyder "okänt", inte "ingen". Mät med `tools/tackning.py`, och skriv luckor öppet.
- **Terminologi per språk (alla fyra språkexperterna):** nya artnamn och tidsangivelser till `docs/ordlista-oversattning.md` före bygget; se 4.
- **Känsligt innehåll (lärare, språk):** evolution som rak stege, vandring som en pil, "ras"-språk, neandertalare som "primitiva", Amerikas befolkning (dateringarna går isär), Afrika som innehåll och inte bara startpunkt.
- **Lärarstöd saknas (lärare):** tur, begreppslista, tidsmetafor för åk 4–6, sidan "Vad är säkert och vad är tolkning", koppling till Nordens forntid i `data/perioder.json`.
- **Uppspelning och återgång (UX):** fart per segment och lugn rörelse; återgången (#997) och "samtidigt"-fönstret måste fungera från det nya segmentet.
- **Skärmläsare (UX):** `aria-valuetext` med "cirka 70 000 f.Kr.", annars läser den ett råtal.
- **Länkar (UX, arkitekt):** `y=-9499` klämms tyst i dag (uppmätt i förstudien). Efter bygget hamnar länken rätt, och en delad länk ger då olika resultat före och efter. Skriv det i beslutet.
- **Nytt lager för människoarter (arkitekt):** `areas.js` är byggt för riken; `area-style.js` har redan `softEdge`. Antagande: ett nytt lager. Prestanda på `overlayCanvas` ska mätas på mobil (#635).
- **ROAD (historiker):** `data/` kan inte använda ROAD (CC BY-SA 4.0). Det är redan beslutat 2026-11-09 (`docs/beslut/2026-11-09-road-avstar.md`) och frågan ska prövas på nytt "när Version 7 behöver förhistoriska platser". Det är nu: se fråga 5 i 5.

### Önskvärt

Zoom i reglaget (senare), schemamönster för `Y-…`, illustrationer av arter märkta enligt bildreglerna, istäcken som bildlager.

## 3. Förslag till issues (inget skapas före ditt ok)

Alla tre issues ligger rätt i milstolpen. Det som är gammalt är bara raden "Milstolpe: Version 6: Människoarter" i texten i #11 och #49; den bör rättas. Flera agenter tolkade det som att issuesen låg fel.

| Issue | Förslag | Ändringar |
|---|---|---|
| #396 | Dela i del 1 (läsa `Y-…`, visa stora år, tusentalsavgränsare per språk), del 2 (se #49) och del 3 (läget Jordens historia, **version 8**) | Del 1 kan få `redo` direkt efter beslut a |
| #49 | Dela: (a) skala och segment med mobilmått, (b) tangentbord, årsfält och aria, (c) uppspelning och snabbhopp, (d) zoom i reglaget (senare) | "Klar när" mäter inget på mobil; lägg till ett mått. "Hundratusentals år" bör stå kvar först efter beslut b |
| #11 | Dela: (i) datamodell och källtabell per art, (ii) arterna som tidsdata, (iii) vandring och områden som lager med osäkerhetsstil | Beroendet av #50 ska skrivas om (se ROAD ovan); beror på #49 och beslut b |
| Nytt (förslag) | "Osäkerhetens visuella språk": karta, kort, intervall; skiss före #11 | Hör ihop med #976, #977 |
| Nytt (förslag) | Forntida kustlinje och landbryggor (`beslut-krävs`, med rekommendation) | Gäller även version 8 |
| Nytt (förslag) | Områden över 180° i `areas.js`: kontrollera med testpolygon | Liten bugg eller bekräftelse |
| Befintligt | #767 (förhistorien i täckningen) kopplas till beslut d | Historikern och förstudien: vänta på #49 |

## 4. Före bygget: vad som ska förberedas

- **Källtabell per art** (spann, referens, om källorna är oense, två oberoende källor, annars `source-checked`), bara källor som är CC0, CC BY eller public domain (historiker). **Kontrolleras ur öppna källor, inte minnet.**
- **Ordlista** (alla fyra språken): Neanderthals/Neandertaler/neandertal/Néandertal, Denisovans m.fl., `Homo sapiens` i kursiv, "out of Africa", artnamn, "hominin", och skolbegrepp som skiljer sig (Paléolithique/Néolithique i Frankrike, Alt-/Mittel-/Jungsteinzeit i Tyskland mot svensk stenålder). Förslag till regler som språkexperterna är överens om:
  - Tidsangivelser: f.Kr. fram till en gräns (antagande: cirka 10 000 år sedan), därefter "för … år sedan" och "miljoner år sedan". Gränsen avgörs i beslut b.
  - "BP" och "ka/Ma" används inte i löpande text.
  - **Talformat är språkberoende** (en: 300,000; de: 300.000; fr: 300 000 med tunt mellanrum och decimalkomma; es: se nedan) och byggs med platshållare i språkfilerna, inte hårdkodat. Singular och plural behövs ("1 år sedan", "1,8 millioner år").
  - Spanska: RAE skriver mellanrum först från fem siffror, och "miljard" är "mil millones" (inte "billón"). Svensk ordlista kräver i dag mellanrum redan från fyra siffror, så det kräver ett val.
  - Franska: fast tunt mellanrum före ; : ? ! och « »; tidsetiketter som får plats i reglaget på 400 px (gäller även tyska och spanska).
- **Skiss och mätning av reglaget** i 360, 400 och 768 px med fyra respektive fem segment och 8, 10 och 15 % för förhistorien: pixlar per år och träffyta (UX).
- **Testpolygon över 180°** för områden (geograf).
- **Täckningsmätning** per världsdel för förhistorien med `tools/tackning.py` (historiker, geograf).
- **Nationella förväntningar** att kontrollera mot källor: Atapuerca (Spanien), Neandertal, Schöningen och Hohle Fels (Tyskland), Lascaux och Cro-Magnon (Frankrike). Flaggas till historikern; språkexperterna rättar inte fakta.

## 5. Frågor till DasKrokodil

**Besvarade 2026-11-10: ja enligt rekommendationerna på alla åtta.** Beslutet står i [docs/beslut/2026-11-10-version-7-riktning.md](../beslut/2026-11-10-version-7-riktning.md); agenten `forhistoriker` är skapad.

Alla med rekommendation (ett förslag, inget beslut).

1. **a. Bekräfta alternativ B** (två lägen: människans historia med dagens år, jordens historia med egen tidstyp senare; byggt i tre delar, där bara del 3 ändrar arkitekturen). *Rekommendation: ja.* Beslutet skrivs då som fil i `docs/beslut/` (saknas).
2. **b. Hur långt bak går människans läge?** Alternativ: 10 000 f.Kr. (ryms i dagens fält), cirka 100 000 år sedan, eller längre. *Rekommendation: cirka 100 000 år sedan som första steg.* Geografen: det är det minsta som täcker Afrika och ut ur Afrika (antagande). Artindelning och dateringar måste källkontrolleras före beslutet.
3. **c. Hur stor del av reglaget får förhistorien?** *Rekommendation: mät först* (se 4). Förslag: högst 10 %, med kravet att modern tid inte får färre pixlar än i dag, men siffran avgörs av mätningen.
4. **d. #767 (förhistorien i täckningen):** vänta tills #49 är byggt eller lägg in nu och acceptera att de bara syns i sökningen. *Rekommendation: vänta* (historiker och förstudien är överens).
5. **ROAD:** frågan ska prövas på nytt nu. Alternativ: (1) fortsätta avstå och använda andra öppna källor (Wikidata och peer-reviewade översikter med CC BY), (2) fråga ROCEEH om rätt att använda utdrag under CC BY, (3) tillåta CC BY-SA i en egen fil. *Rekommendation: 1 först; 2 om källorna räcker inte för kartan.*
6. **Är människoarterna en egen vy eller ett lager?** Påverkar Lager-menyn (UX). *Rekommendation: lager med egen förinställd vy i `data/vyer.json`.* Behöver bekräftas.
7. **Ska osäkerheten alltid synas eller bara på begäran?** *Rekommendation: alltid synlig på kartan och i kortet* (källpolicyn punkt 6).
8. **Ny agent `forhistoriker`?** *Rekommendation: ja* (se 1).

## 6. Föreslagen ordning och bemanning

Beroenden: beslutsfil (a–d) → del 1 av #396 → #49 → #11. Filkrocken är liten (`timeline.js` mot nya lagerfiler), men `layers/index.js`, `data/vyer.json` och `tests/webblasare.mjs` delas, och #49 ska vara klart före #11 (arkitekt).

| Steg | Vad | Vem och modellnivå |
|---|---|---|
| 1 | Beslutsfil a–d, och källtabell per art | Claude Code, Opus (fakta, källpolicy, arkitektur) |
| 2 | #396 del 1: stora år och språkberoende talformat, test | Codex eller Claude Code, Sonnet medium |
| 3 | Skiss och mätning av reglaget, sedan #49 (a–c) | Claude Code, Sonnet high (rendering, tidslinje) |
| 4 | Data för #11 och #767 | Claude Code, Opus. Codex och Copilot tar aldrig `data`-issues |
| 5 | #11 lagerbygget med osäkerhetsstil | Claude Code, Sonnet high |
| 6 | Översättningar till en, de, es, fr, i samma pull request som innehållet | Språkexperterna granskar, historikern kontrollerar fakta |
| Efter bygget | Granskning med bevis: gamla länkar, tangentbord och skärmläsare, mobil 400 px, prestanda, källor och spann per art, översättningar mot svenskan, täckning per världsdel | Alla berörda agenter |

Version 8 (jordens historia) tar del 3 av #396.

## 7. Kostnad (intervall, grov uppskattning)

Uppskattningen är ett antagande, inte mätt; faktisk förbrukning ska noteras efteråt.

- Analys i den här planeringen: nio agenter, cirka 34 000–106 000 tokens per agent (mätt, summa cirka 520 000).
- Bygget: Claude Code Opus och Sonnet high för beslut, data och lager, Codex för del 1 och översättningar. Antal pull requests: 6–10 beroende på delningen. Intervall och osäkerhet bör sättas när beslut b och c är tagna, eftersom de styr omfattningen.

## 8. Om provkörningen (lärdomar för `/milstolpe`)

- **Tre av fyra språkexperter läste inte issuesen** och märkte det själva som antaganden. Uppdraget bör kräva att de läser issuet eller ge dem texten. Lärdomen är införd i `/milstolpe` (se nedan).
- **Fyra agenter tolkade den föråldrade raden "Milstolpe: Version 6" i issuetexten som fel milstolpe.** Kontrollera milstolpen med API:et innan agenterna startar.
- **Historikern påstod att ROAD-beskedet inte hade landat i ett beslut.** Det stämmer inte (beslutsfilen finns). Dirigentens stickprov mot repot fångade det. Agenternas fynd om repots innehåll ska stickprovskontrolleras.
- **Rollen "produktchef" gjordes av dirigenten**, inte av en agent. Det räckte här.
- Alla agenter märkte antaganden och ändrade inga filer.

## Uppföljning: andra analysen med de nya agenterna (2026-11-10)

Efter att `ux-tillganglighet`, `arkitekt`, `larare` och `forhistoriker` skapats körde jag om analysen av milstolpen oberoende (de fick issuesen #396, #49, #11 och #1085–#1098 och beslutet, men inte den här rapporten). Alla fyra är rapporterade som antaganden där de inte provat något; `forhistoriker` kunde inte öppna nature.com, Crossref eller Europe PMC från sessionen, och Wikidata gav 429, så inga dateringar eller Q-id är verifierade. Dirigentens stickprov mot koden bekräftade att `-2999` är hårdkodat i tester (nio ställen i `tests/webblasare.mjs`, ett i `tests/period-range.test.mjs`), att "Välj ett år mellan" och "år/s" är hårdkodad svenska i `js/timeline.js` och att `SEGMENTS` har fyra segment om 25 %.

**Vad som blev annorlunda**
- Fingret når inte förhistorien: ett segment på cirka 10 % är cirka 35 px på 400 px (antagande, mäts i #1087). Snabbhoppen blir primär väg, och zoomen (#1091) kan behövas.
- 100 000 år gäller reglaget, inte vilka arter som tas med; arter som börjar före gränsen behöver öppen start (`../`).
- Artnivån är omstridd; dateringsmetoden ska stå i kortet; `two-sources` är orealistiskt som mål.
- Skolan får inget förrän sist: lärarstödet delades så att begrepp och "säkert eller tolkning" kan skrivas tidigt.
- Epokknapparna (till exempel `nordisk-stenalder`, −11999) ändrar beteende när skalan flyttas.
- Textalternativ till kartan saknades för skärmläsare.

**Ändringar i issuesen**
- #1088 delades (nu del 2a med `MIN_YEAR` och segment), etiketterna blev #1101. Krav om fönstertext, delade länkar, epokknappar och mätning av alla segment lades i #1088.
- #1098 delades (nu del c: turer och Lgr22); begrepp och "säkert/tolkning" blev #1102, tidsmetaforen #1103.
- Nya issues: #1100 (tester importerar `MIN_YEAR`, `redo`), #1104 (Samtidigt och fokus), #1105 (illustrationer av arter), #1106 (textalternativ till kartan), #1107 (elevens ingång), #1108 (produktdokumenten), #1109 (lärargranskning i stället för pilot). #1104–#1107 och #1109 är `beslut-krävs` med rekommendation.
- #1085: `redo` borttagen tills ordlistan #1086 är kvitterad; `parseYearInput` tillagd.
- #1092 och #1093: artnivå som egen leverans, lucklista före data, Afrika som egna händelser. #1094: grenande visning, flera vågor och förutsättningar #1095–#1097. #1089 och #1090: tas i följd.

**Inte ändrat (avgörs av DasKrokodil efter mätningen i #1087):** gränsen på cirka 100 000 år och om zoomen (#1091) flyttas in i 7.0.0.

**Ingen ny agent:** läraren föreslog en rådgivande barnpedagog och arkitekten en mätspecialist för reglaget; bedömningen är att `larare`, `ux-tillganglighet` och `arkitekt` räcker, och en lärargranskning (#1109) täcker barnpedagogiken.

## Bilaga A: utkast till agentfil `forhistoriker` (skapas först efter ditt ok)

```
---
name: forhistoriker
description: Paleoantropolog och arkeolog. Granskar forskningsläget för förhistoria: människoarter, dateringar och dateringsmetoder, vandringsvägar, fyndglesheten och osäkerhet. Använd när en milstolpe rör förhistoria eller människans ursprung.
tools: Read, Grep, Glob, Bash, WebFetch, WebSearch
---
```

Texten följer `historiker.md`: aldrig fakta ur minnet, öppna källsidan, skriv källornas oenighet öppet, ändra inga filer, och rapportera på svenska med allvar och bevis. Dessutom: bedöm artindelningens osäkerhet, dateringsspann och metod, om en vandring beskrivs som tolkning, och om formuleringar om evolution, arter och befolkningar är sakliga (ingen "ras", ingen "primitiv").
