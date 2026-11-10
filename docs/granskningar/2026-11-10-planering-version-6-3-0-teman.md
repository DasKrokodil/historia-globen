# Planering: Version 6.3.0 Teman

**Datum:** 2026-11-10
**Underlag:** `/milstolpe` (beslut [2026-11-10-planering-med-agenter-fore-milstolpe.md](../beslut/2026-11-10-planering-med-agenter-fore-milstolpe.md)). Fem agentrapporter, stickprovskontrollerade mot repot. Ingen kod, data eller issues är ändrade. Inga etiketter är satta. Inget är beslutat.

## 1. Bemanning

Milstolpen "Version 6.3.0: Teman" (GitHub-milstolpe 21) har **fyra öppna issues**: #398 (samlingsissue), #557 (landsvyer), #385 (släktträd) och #384 (perspektiv som linser). #950 (format) och #962 (motor) är klara och stängda. `data/teman.json` är tom (`themes: []`), så ingen besökare ser något tema än. Inga öppna pull requests fanns vid starten.

| Agent | Behövs? | Varför |
|---|---|---|
| `historiker` | **Ja** | Det första temat (teknik, #105) är ett urval med en introduktion. Urval, balans och källor är historikerns område. |
| `geograf` | **Ja** | Kravet "minst 3 världsdelar", kamera och platsprecision, och gränskälla för landsvyer (#557). |
| `ux-tillganglighet` | **Ja** | Temat nås via Fokus, har ett introduktionskort och en utgång, och måste klara mobil och tangentbord. |
| `arkitekt` | **Ja** | Temaformatet (teman@1), samspel med `tag`, `MIN_YEAR` och filkrockar med Version 7. |
| Produktchef (lins 12, `general-purpose`) | **Ja** | Milstolpens scope är oklart och "klar när" saknas. |
| `forhistoriker` | Behövs inte | Första temat rör inte förhistoria eller djup tid. |
| `larare` | Behövs inte | Skolan är en bonus (beslut 2026-11-08) och ingen issue i milstolpen byggs för skolan. Tas om ett tema görs för elever. |
| `sprak-en`, `-de`, `-es`, `-fr` | Behövs inte nu | Inga texter finns att granska än. De körs i granskningen när temats namn och introduktion finns på fem språk. |

**Saknad expertroll:** Ingen ny expert behövs för 6.3.0. En roll **kan** behövas senare om #384 byggs: en **urfolks- och minoritetshistoriker** (samisk, judisk, romsk, sverigefinsk, tornedalsk och kvänsk historia; också #873 och #463). Den skulle bedöma benämningar, vem som får tala om vem och vilka grupper som saknas, vilket varken `historiker` eller `geograf` gör. Den återkommer i flera issues utanför milstolpen, men behövs inte förrän #384 får ett ja. Förslag på utkast till beskrivning, om DasKrokodil vill: *"Urfolks- och minoritetshistoriker. Granskar benämningar, perspektiv och urval för urfolk och nationella minoriteter, och att källor är grupperna själva eller forskning som följer deras egna benämningar. Använd när en milstolpe rör #384, religioner eller mytologi."* Agentfilen skapas inte förrän DasKrokodil har sagt ja.

## 2. Viktigaste fynden per agent

### Produktchef
- **Viktigt:** milstolpens scope är inte avgränsat. #398 har klar-när "ett tema går att välja och ett första tema finns". Motorn finns men leveransen, ett tema, saknas som eget issue i milstolpen. #105 (teknik) ligger i milstolpen "Paket: Vetenskap och medicin" och är skrivet som en vy med lager och faktaruta per uppfinning, vilket är det formatet som beslutades 2026-11-01 inte längre säger.
- **Viktigt:** #557, #385 och #384 är inte tema-instanser av samma slag (se avsnitt 3).
- Underhåll (M6): ett tema är billigt i format men dyrt i innehåll (urval med källkontroll, introduktion på fem språk, eventuella nya händelser). Antagande: 2–3 teman räcker för att utvärdera formatet.
- Rekommenderar: 6.3.0 är bara teknik. Inga nya teman börjar innan 6.3.0 är utvärderat. Samla dubbletter bland de 26 idéerna i "Paket: Temavyer och innehåll" (#102, #104, #106, #459, #471, #477 m.fl.).

### Historiker
- **Viktigt, balans:** teknikunderlaget är tunt: 30 `vetenskap`-händelser av 879 (kontrollerat: stämmer). Kategorin `vetenskap` räcker inte som teknikurval. Urvalet måste handplockas, och introduktionen ska tala om att det är ett urval och inte en heltäckande lista.
- **Viktigt, påståenden:** "samtidig uppfinning" och prioritet är omstridda. Introduktionen ska vara en ren beskrivning av urvalet (högst cirka 400 tecken) utan påståenden om spridning eller samtidighet, så att den inte behöver egna källor. Påstås något historiskt krävs källa i `sources`.
- **Viktigt, namn:** "Teknik" är inte samma sak som kategorin `vetenskap` (som också rymmer naturvetenskap och medicin). Namnet kräver ett skrivet urvalskriterium.
- Spridningslinjer (papper, krut) och en faktaruta per uppfinning ryms inte i temaformatet; de ska vara egna issues, inte 6.3.0.
- Ingen händelse har `tags` (kontrollerat: stämmer), så ett tema kan inte byggas på `framsteg`.
- Historikern öppnade inga externa källor; allt historiskt i dess rapport är antagande.

### Geograf
- **Viktigt, slagsida:** med `region()` (`js/model.js`) fördelar sig platshållarens 12 händelser så här (egen körning, stämmer): **Asien 4, Europa 3, Amerika 3, Afrika 1, Oceanien 1**. Afrika söder om Sahara, Sydasien och Norden saknas. Valideringsvarningen kräver bara 3 världsdelar och slår därför inte till, men temat är skevt. `region()` ger **fem** världsdelar, medan `docs/datamodell.md` säger sex, så dokumentet bör rättas.
- **Viktigt, platsprecision:** fem av de tolv har `locationPrecision: "region"`. En uppfinnings koordinat är en vald stad; det räcker för världsdelsräkningen men inte för "Vad hände här?" inom 300 km.
- **Viktigt, två kopior av världsdelsregeln:** `js/model.js` och `scripts/validate-site.py:458` (och `eventRegion` i `js/uppdrag-rules.js`). Förslag: ett test som jämför dem.
- **Önskvärt:** kameran i temafokus centreras på den tidigaste händelsen (`js/controllers/focus.js:92–93`), vilket för ett utspritt tema blir en slumpmässig mittpunkt.
- **#557:** gränskällor med förenlig licens är ännu inte kontrollerade. SCB:s förenklade gränser och Lantmäteriets öppna data uppges vara CC0, men produktbladet för län och kommun är inte öppnat; Natural Earth admin-1 är inte bekräftat; OpenHistoricalMap har licens per objekt. Landskapens gränser: ingen öppen källa hittad (antagande).
- #556 är fortfarande öppet, men "Sverige efter 1814" (#600) och USA (#407) är stängda. #557:s text är därför gammal på den punkten.

### UX och tillgänglighet (kod läst, inget körts i webbläsare eller skärmläsare)
- **Viktigt, upptäckbarhet:** temat nås bara via Sök och följ, fliken Teman, som döljs när listan är tom (kontrollerat: `js/ui/focusmenu.js:121–123`). Antagande: en nybörjare söker inte efter "tema". Förslag: ett temakort eller en grupp högst upp under "Alla".
- **Viktigt, ordval:** tema, vy, epok, tur och lager. Temat slår dessutom på ett lager via en "vy". Det krockar med 6.2.0 ("ett ord per sak").
- **Viktigt, kategorifilter:** notisen "Kategorierna i panelen ändras inte" är tvetydig; kortet bör säga att temat visar alla sina händelser oavsett kategorival.
- **Viktigt, introduktionskortet på 400 px:** intro, rubrik och en lista med 12 eller fler knappar i samma kort som faktarutor. Måste mätas (andel av 400×800, om globen och tidsreglaget syns). Förslag: lista hopfälld.
- **Viktigt, utgång:** UX misstänker att kortets × bara stänger kortet och inte avslutar temat. **Obevisat antagande; måste provas i webbläsare före bygget.**
- **Viktigt, länk:** `#f=theme:<id>` till ett saknat eller `draft`-tema bör ge ett lugnt meddelande. Arkitekten säger att okänt id ger startläge (test finns); om meddelandet behövs är en produktfråga.
- Tomt år med noll temahändelser behöver mikrotext. Fokusflytt, `aria-live` och en Avsluta-knapp ska finnas.

### Arkitekt (kod läst, inget körts)
- **Blockerar #557 som tema:** `teman@1` är bara en lista händelse-id (`schemas/teman.schema.json`), och `js/layers/areas.js:58–66` reagerar bara på `focus.type === 'empire'`. "Delstater och provinser som tänds över tid" är områdesdata som formatet saknar. Kräver en beslutsfil om `teman@2` och DasKrokodils ok. (Kontrollerat mot koden.)
- **Viktigt, Version 7:** `scripts/validate-site.py:455` har en hårdkodad kopia `EARLIEST_YEAR = -2999` av `MIN_YEAR` (`js/timeline.js:7`). Den blir fel när #1088 flyttar `MIN_YEAR`. Förslag: validatorn läser värdet ur koden eller ett test jämför dem.
- **Viktigt, `tag` och teman:** skyddet mot att en vy med `tag` används finns bara i validatorn. I koden hoppar `js/layers/events.js:275` och `:305` över `tag` när ett tema är valt (kontrollerat för :275). Teman ersätter alltså taggen. #384 ska därför inte få ett nytt tag-värde.
- **Viktigt (otestat):** temat kringgår krigsfiltret `partOf`/`top`, så alla delhändelser i ett krig blir prickar. Troligen avsett men inget test visar det.
- **Önskvärt:** `themeOf` kräver att händelselagret är på (`events.js:227`).
- **#385:** renderas som DOM eller SVG i panelen, inte på klotet. Bryter inte arkitekturpunkt 4, men kan inte skickas till en fysisk glob. Inte ett tema.
- Filkrockar: `js/timeline.js`, `js/ui/panel.js` och `tests/webblasare.mjs` rörs av Version 7 (#1085–#1101); `events.js` rörs troligen av 6.2.0 (#894, #1065). `data/ui/*.json` och `tests/webblasare.mjs` är undantagna från krockregeln; `data/teman.json` är en ren datafil.

### Motstridiga eller felaktiga uppgifter (ej sammanslagna i tysthet)
- **Fördelning per världsdel:** historikern angav Asien 3 och summerade till 11 av 12; geografen Asien 4 (summan blir 12). Egen körning av `region()` ger **Asien 4**, alltså geografen. Historikern skrev också att "alla utom två börjar före 1500" men räknade 7 av 12 före 1500; kontroll: 7 stämmer, "alla utom två" gör det inte.
- **Smalt eller brett första tema:** historikern föreslår ett smalt tema (till exempel "Skrift och tryck") med lägre risk för slagsida. Geografen föreslår att teknik har minst fem världsdelar och minst en händelse från Afrika söder om Sahara. De två kan inte båda uppfyllas med dagens data (Afrika har 1 händelse i urvalet). Det är en fråga för DasKrokodil, se avsnitt 4.
- **#385:** issuet säger att sambanden finns i rikesdatan. Geografen: bara Sovjetunionen har föregångare och efterföljare; Tysk-romerska riket och Osmanska riket har det inte (obevisat i denna rapport, geografen läste `data/empires/index.json`).
- Historikerns påstående att Oceanien har 30 av 73 `upptackter`+`vetenskap`-händelser är inte kontrollerat av mig.

## 3. Förslag till ordning, beroenden och vem som tar vad

**Förslag: 6.3.0 blir "första temat, och att temat går att hitta och lämna".** De tre andra issues flyttas ut ur milstolpen (efter DasKrokodils ja).

| Steg | Innehåll | Agent och nivå | Krockar och beroenden |
|---|---|---|---|
| 0 | **Beslut** (avsnitt 4): scope, tema-namn och urval, ingång, ordval | DasKrokodil | Ordval hör ihop med 6.2.0 |
| 1 | **Teknik som tema** (#105, delat): urval ur befintliga händelser, introduktion på fem språk, `source-checked`; ny teknikdata som egna data-issues | Claude Code, **Opus** (fakta och källor) | `data/teman.json`, `data/ui/*.json`; ingen kodkrock |
| 2 | **Temakort och ingång**: utgång, tomma år, kategorimikrotext, mobilkort (mätt före och efter), temakort under Alla | Claude Code eller Codex, **Sonnet high** | `js/controllers/focus.js`, `js/ui/panel.js`, `js/ui/focusmenu.js`; panel.js rörs av Version 7 |
| 3 | **Validatorn och världsdelsregeln**: `EARLIEST_YEAR` läser `MIN_YEAR`; test som jämför `region()` i JS och Python; kameran för tema | Codex eller Claude Code, Sonnet medium | Efter eller tillsammans med #1088 |
| 4 | **Dokumentation**: `docs/produkt/05-ux-oversikt.md`, rätta "sex världsdelar" i datamodellen | Claude Code | Samma pull request som steg 2 |
| 5 | **Utvärdering av DasKrokodil** på dator och mobil | DasKrokodil | Före varje version |

Arbetsfördelning enligt CLAUDE.md: Codex och Copilot tar inte issues med `data` (steg 1). Steg 2–3 är gränssnitt och tester utan fakta och kan tas av Codex, och Claude Code granskar det som kräver bedömning. Språkagenterna körs efter steg 1.

**Förslag på ändringar i issues (inget görs förrän DasKrokodil har sagt ja):**
- **#398:** uppdatera status till "motorn byggd (#962), kvar: första temat". Sätt klar-när enligt avsnitt 4. Ta bort `user question` om den finns kvar (frågorna är besvarade 2026-11-08).
- **#105:** flytta till 6.3.0 och dela i (a) första temat som urval av befintliga händelser och (b) ny teknikdata, spridningslinjer och faktaruta per uppfinning, som stannar i "Paket: Vetenskap och medicin".
- **#557:** flytta ut (egen milstolpe eller Senare), dela i (a) beslut om fördjupningsnivå och gränskälla med licensbevis, (b) fakta (anslutningsdatum och sätt) och (c) bygge. Rätta texten: #407 och #600 är stängda. Områdesdelen kräver `teman@2`.
- **#385:** flytta till riken-spåret (milstolpe 28). Dela i en datadel (föregångare och efterföljare för Tysk-romerska riket och Osmanska riket) och en gränssnittsdel med textalternativ.
- **#384:** dela i ett issue per perspektiv eller flytta till "Paket: Temavyer och innehåll". Inga nya kategorier och inget nytt tag-värde.
- **Milstolpe 15:** samla dubbletter och sätt en prioritetsordning. Inga nya teman börjar innan 6.3.0 är utvärderat.
- **Nya issues** (Claude Code, utan beslut): `region()` som enda källa; kamerans mittpunkt för tema; och en enkel täckningstabell per tema i `tools/tackning.py`.

## 4. Öppna frågor till DasKrokodil (med rekommendation)

1. **Scope: ska 6.3.0 bara vara teknik-temat och att temat går att hitta och lämna?** Det är en liten, avslutningsbar version, och motorn är redan byggd. #557, #385 och #384 flyttas ut.
   - **Rekommendation: ja.** Utan det har milstolpen ingen leverans (tom `teman.json`) och tre issues som egentligen är egna spår.
2. **Hur brett ska det första temat vara?**
   - A: "Teknik", handplockat, med en ärlig rad i introduktionen om att det är ett urval. Kräver nya källkontrollerade händelser för att nå minst fem världsdelar (Afrika söder om Sahara, Sydasien); de görs som egna data-issues.
   - B: ett smalare tema (till exempel "Skrift och tryck") som går att källkontrollera fullt med dagens data.
   - **Rekommendation: A** med en spärr: publiceras inte förrän minst fem världsdelar nås (annars övergår vi till B). Det följer regeln att varje paket ska ha innehåll från flera världsdelar, och namnet "Teknik" är det som beslutades 2026-11-01.
3. **Var ska temat bo?** Idag bara under Sök och följ → Teman.
   - **Rekommendation:** ett temakort eller en grupp högst upp under Alla, men ingen ny meny. Besluta ordval ("tema", "vy", "epok", "tur") tillsammans med 6.2.0 så att det blir ett ord per sak.
4. **Ska #105 flyttas till 6.3.0 och delas?**
   - **Rekommendation: ja.** (a) i 6.3.0, (b) kvar där det är.
5. **Hur många teman innan en utvärdering?**
   - **Rekommendation:** ett i 6.3.0. Ett andra först efter utvärderingen. Ett tredje bara om det är billigt.
6. **Landsvyer (#557):** ska formatet utökas till `teman@2` (områden som tänds), eller ska Sverige-piloten först vara ett vanligt tema med händelser?
   - **Rekommendation:** först ett vanligt tema, efter 6.3.0. Områdesdelen beslutas separat när en gränskälla med förenlig licens (CC0, CC BY eller public domain) är bekräftad. Landskapens gränser saknar troligen öppen källa.
7. **Tilltal i temats texter?** Beslut finns för elevtexter, inte för teman.
   - **Rekommendation:** artigt tilltal (`Sie`, `usted`, `vous`) i teman, eftersom de är vuxentexter. Elevteman beslutas separat.
8. **Ny expertroll (urfolks- och minoritetshistoriker):** vill du ha den nu?
   - **Rekommendation: nej,** vänta tills #384 får ett ja.

## 5. Uppskattad kostnad (intervall, planeringsram, inte uppmätt)

Enligt tokenbudgetreglerna i `.orchestra/project.md`, med cirka 25 % reserv. Faktisk förbrukning noteras efteråt.

| Del | Uppskattning |
|---|---|
| Steg 1: teknikurval, introduktion och fem språk, Claude Code Opus | 40–90k |
| Steg 1: nya teknikhändelser (varje data-issue, ca 3–5 händelser) | 25–50k per issue; antal beror på beslut 2 |
| Steg 2: temakort, ingång, mikrotext på fem språk, mobilmätning (Sonnet high) | 30–60k |
| Steg 3: validator, test av `region()`, kamera | 15–30k |
| Granskning (Codex-granskning, Claude Code, språkagenter) | 30–60k |
| **Summa 6.3.0 utan nya händelser** | cirka **115–240k**, plus 25 % reserv |

**Förbrukat för den här planeringen:** de fem agenterna rapporterade cirka 57–99k tokens var (sammanlagt cirka 360k, arkitekten har dessutom en omsändning). Det är mer än vad en liten milstolpe motiverar, så nästa planering av en liten milstolpe bör köras med färre agenter (till exempel utan produktchef om scopet redan är klart).

## 6. Vad som uttryckligen inte ingår i den här planeringen
Version 7 (förhistorien), 6.2.0 UI/UX, Regionkort (6.4.0), och bygget av temamotorn (klart i #962). Inga webbläsartester, validatorer eller skärmläsare har körts av agenterna; allt om upplevelsen är antaganden tills det provas.
