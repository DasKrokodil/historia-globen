# Helganalys, körning B: arkitekturen mot backloggen

**Klart:** arkitekturen prövad mot milstolparna 6.4.0, 7.0–7.2, 8 och 9, mot körning A:s fynd och mot besluten i `docs/beslut/`; agenten `arkitekt` läste koden och dirigenten stickprovade de bärande påståendena. **Stod still:** inget är kört i webbläsare (minne, texturstorlek och fokusskalans trängsel är räknade ur koden, inte mätta), och licenser och upplösning hos de externa källorna (GPlates, Paleobiology Database, NASA) är inte öppnade. **Inget är byggt eller ändrat**, inga etiketter är satta och inga issues är skapade.

**Datum:** 2026-11-13 (körd direkt på DasKrokodils begäran, inte 2026-11-14 kl. 02:05 som först schemalagt). **Kod:** `main` vid `364f299`. **Konto:** DasKrokodil. **Modellnivå:** Opus (arkitektur, datamodell och beslut som påverkar flera issues). **Delagenter:** en (`arkitekt`).

## Läget när körningen började

- **Öppna pull requests:** 3, alla från DasKrokodils konto (#1284 bilder, #1285 fall-turerna, #1286 riken). Einzbeng har 0. Alla rör bara `data/`.
- **`docs/granskningar/handoff.json`** står kvar på `ready_for_triage` (`2026-11-10-version-6-3-0.md`). Inte triagerad här.
- **6.2.0 och 6.3.0 har inga öppna issues.** Lägeskontraktet (#893), temamotorn (#398, #950, #962) och epokerna (#845, #965) är stängda och byggda. Frågan om "två format" är därför besvarad mot koden som finns, inte mot en plan.
- **CLAUDE.md är efter på tre punkter** (se beslut 11 nedan): `data/teman.json` är inte tom, ett tema är ett fokus och inget eget läge (`js/state.js:83`), och filstrukturen saknar bland annat `js/layers/images.js`, `data/bildlager.json`, `data/platser.json` och `data/quiz.json`.

Märkning nedan: **[kod]** = belagt i fil och rad, **[beslut]** = står i beslutsfil eller issue, **[bedömning]** = slutsats som inte är mätt.

## Sammanfattning

### Svar på frågorna i korthet

| Fråga | Svar |
|---|---|
| Klarar "ett år styr allt" och heltalsåren jämförelsen av två tider (#248)? | **Ja**, som ett nytt läge med en andra lagerbild. Två hinder i koden: det skarpa utsnittet ritar om 220 ms senare med det senast uppdaterade året, och rikenas övergångar minns ett enda "förra året". |
| Djup tid (#12, #51–#53, #397)? | **Talen håller, resten inte.** Det är redan förutsett: version 8 är den enda delen som ändrar arkitekturens punkt 3 [beslut 2026-11-10-version-7-riktning]. Riken, religioner, platser och världsdelar har ingen mening på forntida kontinenter, och inget i tillståndet kan stänga av dem per tidsdomän. |
| Tidslinje i nivåer (#49)? | **Ja, men reglaget saknar ett begrepp: upplösning.** Året är alltid ett heltal, och steg, fart, avrundning och tidsfönster löses var för sig. Det som brister först är redan trasigt (nästa avsnitt). |
| Räcker 4096×2048? | **Ja för världstäckande lager** (9,8 km per pixel vid ekvatorn), även forntida kust. **Nej för en källkarta man ska läsa** (#249), men ett fält `bounds` i bildlagret löser det utan tiles och utan byggsteg. |
| Lägen, teman och epoker utan två format? | Det finns redan **tre urvalsformat med gemensam kärna** (tema = händelselista, epok = tidsspann, plats = geometri). Det är en rimlig uppdelning. Risken för ett fjärde och femte ligger i koden, inte i datat: `focus.js` har en gren per typ. |
| Vad i A kräver arkitekturändring? | **Fyra fynd:** reglaget olåst i tur (A2), uppspelning bakom dialog (B1), falsk exakthet i förhistorien (B6) och Escape per yta. Trasig länk (B2) är halvbyggd. "Samtidigt" och händelse mot tillstånd är en fråga om datamodellen. |

### De tre viktigaste fynden

**1. Tidsfönstret i förhistorien visar nästan allt som "nära".** Fönstret är 1,2 % av reglaget räknat om till år med segmentets lutning [kod: `js/timeline.js:55–58, 147`]. Första segmentet (100 000–3000 f.Kr.) ligger på 10 % av reglaget, så vid 5000 f.Kr. blir fönstret ±11 640 år. Mätt: 923 av 929 händelser räknas som nära och 0 pågår. Det är orsaken till A:s "Samtidigt 615" (B6). Hoppet vid 3000 f.Kr. är känt och föreslaget som eget issue, men inte byggt [beslut 2026-11-12-reglaget-forhistoria, rad 12]. Version 7.1 (människoarter) byggs annars på ett fönster som inte urskiljer något.

**2. `js/timeline.js` är flaskhalsen.** Tio issues över fyra milstolpar rör filen (#1089, #1090, #1101, #1091, #1107, #397, #248 och A:s förslag 2, 14 och 17) och måste gå i följd. Fem av dem lagar samma brist (ingen upplösning per segment) på var sitt ställe. En liten gemensam grund först gör resten mindre.

**3. Bildlagrets kontrakt är för smalt för 7.1, 8 och 9.** I dag: ett aktivt lager åt gången, en rad i Lager-menyn, ritas alltid över hela världen på lagerbilden och aldrig på grundkartan, och inlästa bilder rensas aldrig ur minnet [kod: `js/layers/images.js:20–40`]. Sex issues i tre versioner bygger på det (#1096, #51, #249, #8, #9, #55). Dessutom ritas grundkartan "en gång" [kod: `js/globe.js:3`], och det skarpa utsnittet väljer alltid dagens 1:10m-kust [kod: `js/globe-detail.js:203`], så en forntida kust skulle bytas mot dagens när man zoomar in.

### Minsta säkra ordning

0. **Följdfelen ur A först** (A:s förslag 1, 3, 5, 8): små, rör inte reglagets kärna.
1. **Reglagets grund** (ny, före 7.0): fönstret räknat i reglagets läge (P1), upplösning per segment (P2), fokusskalans årtal (P3), tidslås i lägeskontraktet (P4) och länkarkiv som test (P8). Därefter #1089 → #1090 → #1101.
2. **6.4.0 parallellt**, eftersom det inte rör `timeline.js`: #1162 och #1159 → #1161 → #1163 → #1164. #1163 väntar på P4.
3. **7.1:** arterna som data (#1093), besluten #1095 och #1096, bildlager v2 (P7), sedan #1094 och #1106.
4. **7.2** när arterna finns.
5. **8:** beslut om tidsdomän (ändrar arkitekturens punkt 3), sedan #397 → #51 → #52, #53.
6. **9:** #9, #8 och #55 direkt på bildlager v2, #249 med `bounds`, och #248 sist (kräver fönstret och en andra lagerbild).

### Rekommendation till DasKrokodil

Säg ja till **reglagets grund** (beslut 1–3 nedan) innan 7.0 fortsätter, och till **bildlager v2** (beslut 7) innan 7.1 ritar något. Det är de två ställen där det är billigt nu och dyrt senare. Allt annat kan tas i den ordning milstolparna redan har. Inget av förslagen bryter besluten i CLAUDE.md; bara tidsdomänen i version 8 rör punkt 3, och den är redan beslutad i riktning.

## Detaljer

### 1. Ett år styr allt och heltalsåren

**(a) Jämför två tider (#248).** Lagren bär sitt eget tillstånd: `update(state)` sparar urvalet och `drawOverlay(ctx, W, H)` tar inget år [kod: `js/layers/registry.js:137–141, 181–190`]. Två år kan alltså ritas i följd på var sin canvas. Hinder: utsnittet vid inzoomning ritar om med fördröjning och får då det senast uppdaterade året [kod: `js/globe-detail.js:19, 210–227`], och rikenas övergångar följer ett `lastYear` [kod: `js/layers/areas.js:78–81`]. Kostnad: en andra lagerbild, cirka 32 MB på dator och 8 MB i mobil, och ett nytt läge i `MODE_RULES` [bedömning]. Blandningen på klotet går att göra i shadern utan nytt beroende [bedömning].

**(b) Djup tid.**
- JavaScripts tal räcker (4,5 miljarder ligger långt under 2^53), och `Y-66000000` läses [kod: `js/model.js:357`].
- `formatYear(-66000000)` ger "66 000 001 f.Kr." [kod: `js/model.js:138`]. En funktion för stora tal finns (`formatYearCount`, rad 147) men anropas inte.
- `parseYear` tar högst nio siffror [kod: `js/model.js:230`].
- Fältet `precision` 0–5 tillåts i schemat men styr ingen visning; koden frågar bara om värdet är under 9 [kod: `js/ui/panel.js:109, 117`].
- Året klampas mot `MIN_YEAR` på sex ställen [kod: `js/timeline.js:30`, `js/url-state.js:36`, `js/controllers/range.js:85, 269–270`, `js/controllers/focus.js:108, 121`].
- Det finns inget index per år; `data/genererat/` delas per period [kod: `js/model.js:495`]. Det är bra: inget i laddningen hindrar långa tider.

**(c) Tidslinje i nivåer (#49).** Första delen är byggd: `MIN_YEAR = -99999` och fem segment [kod: `js/state.js:12`, `js/timeline.js:14–20`]. Datat i dag: 929 händelser, minsta start −99 999, 11 före 3000 f.Kr., 6 före 10 000 f.Kr. Kvar, i den ordning det brister:

1. **Fönstret** (se fynd 1).
2. **Falsk exakthet:** läget räknas om till ett helår trots att en pixel motsvarar cirka 970 år i ett 1000 px brett reglage [kod: `js/timeline.js:50–54`]. Därav "99 001 f.Kr." och "1001 år senare" (B6).
3. **Fokusskalans årtal:** steglistan slutar vid 1000 år och faller sedan till 2000 [kod: `js/timeline.js:196`]. Ett tema eller en plats som spänner över 60 000 år ger ett trettiotal årtal där 4 (mobil) till 11 får plats. Räknat ur koden, inte kört.
4. **Steg och fart:** stegen är ±1 och ±100 år och farten högst 100 år per sekund [kod: `js/timeline.js:60`]. Att spela 97 000 år tar cirka 16 minuter.

### 2. Canvasarna

| Bild | Pixlar per grad | Km per pixel (ekvatorn) | Minne (okomprimerat) |
|---|---|---|---|
| 4096×2048 | 11,4 | 9,8 | 32 MB |
| Mobilglob 2048×1024 | 5,7 | 19,6 | 8 MB |
| Nattljusbilden 3600×1800 | 10,0 | 11,1 | cirka 25 MB |

- **Det skarpa utsnittet** (2048² på dator, 1536² i mobil) når cirka 75 pixlar per grad (1,5 km per pixel) på dator. Det gäller bara vektorer, som ritas om. Ett bildlager skalas bara upp: `drawImage(image, 0, 0, W, H)` [kod: `js/layers/images.js:38`].
- **Canvasminne i dag:** cirka 144 MB på dator och cirka 51 MB i mobil, plus grafikkortets kopior [bedömning; ska mätas, hör till #919].
- **Globen frågar inte efter största texturstorlek** för 4096 [kod: `js/globe.js:12, 422`]; utsnittet gör det. Antagandet att alla enheter klarar 4096 ska mätas.
- **Forntida kust och landbryggor (#1096, #51):** 4096 räcker. Kusten bör vara vektor i samma format som `data/land.json`, eftersom `paintBase(ctx, W, H, land)` redan tar kartan som parameter [kod: `js/globe.js:35`]. Platt vy och affischen följer `baseCanvas` av sig själva [kod: `js/main.js:90, 466`]. Det stämmer med den ekvirektangulära principen.
- **#397 säger "bildlager på `baseCanvas`"**, men bildlagret ritas på lagerbilden [kod: `js/layers/registry.js:32`]. Det behöver bestämmas (beslut 7).
- **Källkarta (#249):** lägg ett fält `bounds` på bildlagret. En bild på 4096 px över 60 längdgrader ger 68 pixlar per grad. Tiles går att bygga utan beroende men kräver asynkron ritning i lagerregistret; vänta tills en mätning visar att det behövs.
- **Fynd i djup tid (#52):** behöver forntida koordinater som eget fält, förräknade i `tools/`. Dagens `location` i WGS 84 räcker inte, och rikena får inte ritas i den domänen.

### 3. Lägen, teman, epoker, vyer, turer och platser

| Format | Väljer genom | Blir | Adress |
|---|---|---|---|
| `data/teman.json` (1 tema, 14 händelser) | händelselista | fokus `theme` | `f=theme:id` |
| `data/platser.json` (2 platser) | geometri | fokus `place` | `f=place:id` |
| `data/perioder.json` (4 indelningar, 10 epoker) | start, slut, öppen | läget intervall | `y`, `y2`, `p` |
| `data/vyer.json` | lager och tagg | `state.tag` | `g` |
| Turer, uppdrag, fun facts | år, lås, fönster | egna lägen | `t`, `s`, `u`, `m` |

- Kärnan (`id`, `name`, `intro`, `sources`, `review`) är redan gemensam [beslut 2026-11-08-temaformat-398]. Teman och epoker blev alltså inte två format för samma sak; de väljer på olika grund.
- **Överlappet ligger i koden:** `focus.js` har en gren per typ, och den sista `else` behandlar allt okänt som religion [kod: `js/controllers/focus.js:76–147`]. Listan för tema och plats är dubblerad [kod: `js/ui/panel.js:567, 599`]. Fokustyperna är en vitlista [kod: `js/state.js:83`].
- **Minsta gemensamma kontrakt [bedömning]:** ett namngivet urval väljer med exakt en av händelselista, tidsspann eller geometri, blir fokus eller intervall och delas med `f=` eller `y2`/`p`. Då behöver människoarter inget eget format (de är händelser, #1093, plus ett lager), länder är platser [beslut 2026-11-12-landerna-fore-regionerna] och jämförelse är ett läge.
- **Luckan:** högkulturer (#971) är region plus tidsspann, och #1163 punkt 3 vill ha plats plus intervall, men fokus och intervall utesluter varandra [kod: `js/state.js:114, 136`]. Det är ett beslut, inte ett fel (beslut 6).
- **#971 fråga 1 är inaktuell:** tidslinjen börjar nu 100 000 f.Kr., inte 3000 f.Kr.

### 4. Beroenden och filkrockar

| Fil | Träffas av |
|---|---|
| `js/timeline.js` | #1089, #1090, #1101, #1091, #1107, #397, #248; A:s förslag 2, 14, 17 |
| `js/state.js` | #1163, #248, #397; A:s förslag 2 |
| `js/url-state.js` | #1162, #248, #397; A:s förslag 6 |
| `js/ui/panel.js` | #1161, #1104, #1106; A:s förslag 5, 7, 9, 11, 16 |
| `js/model.js` | #1089, version 8; A:s förslag 11, 14 |
| `js/globe.js`, `js/globe-detail.js` | #1161, #1096, #51, #248 |
| `js/layers/images.js` | #1096, #51, #249, #8, #9, #55 |
| `js/ui/tour.js`, `js/ui/lesson.js` | #1163, #1098; A:s förslag 2, 19 |
| `css/style.css` | #1161; A:s förslag 1, 10, 12, 13, 17 (1, 12, 13 i följd) |

`data/ui/*.json` och `tests/webblasare.mjs` räknas inte som krock [beslut 2026-11-09].

```
A:s förslag 1, 3, 5, 8 (små, först)
A:s förslag 2 = P4 (tidslås) ─► #1163
A:s förslag 4 (B1) ─► 7 (Escape) = P5        [samma filer]
A:s förslag 6 (B2) = P6 ─► #1162
P1 fönster ─► P2 upplösning ─► #1089 ─► #1090 ─► #1101 ─► (#1091)
                    └─► A:s förslag 14, #1104, #1107
#1162, #1159 ─► #1161 ─► #1163 ─► #1164
#1093 ─► #1095, #1096 (beslut) ─► P7 bildlager v2 ─► #1094 ─► #1106
#1093, #1094 ─► #1098, #1102, #1103 ─► #1109
P7 + tidsdomän ─► #397 ─► #51 ─► #52, #53
P7 ─► #9, #8, #55, #249;   P1 + andra lagerbild ─► #248
A:s förslag 15 ─► 16, 18
```

### 5. Billigt nu, dyrt senare

| Vad | Var | Storlek | Vad det kostar att vänta |
|---|---|---|---|
| Fönstret räknat i reglagets läge (olika långt före och efter vid en skarv) | `js/timeline.js:147`; fönstret läses i `events.js`, `lines.js`, `panel.js`, `render.js` | M | Fler som läser fönstret för varje version; 7.1 byggs på ett fönster som visar allt |
| Ett `step` per segment för avrundning, tangentsteg, fart och uppläst värde | `js/timeline.js:14–20, 50–54`; `js/model.js` | M | #1089, #1090 och A:s förslag 14 löser samma sak tre gånger |
| Fokusskalans steglista | `js/timeline.js:196` | S | Syns när 7.1 lägger arter i Fokus |
| Lås för tidsinmatning i `MODE_RULES` | `js/state.js:112`; `js/timeline.js:89`; `js/ui/tour.js:302` | M | Varje nytt läge får ett eget lås |
| Dialoggrupp och en central Escape i stängregistret | `js/surfaces.js` (åtta ytor anmälda; ett tjugotal egna Escape-lyssnare) | M | Varje ny yta ökar det |
| Bildlager v2: flera lager, `kind`, `bounds`, utrensning, schema | `js/layers/images.js`, `data/bildlager.json`, `schemas/` | M | Tre versioner bygger var sin lösning |
| Fokustyper som poster i stället för grenar | `js/controllers/focus.js:76–147`; `js/ui/panel.js:567, 599` | M | En gren och en kopia per ny typ |
| Länkarkiv som test (äldre verkliga länkar öppnas lika) | `tests/url-state.test.mjs` | S | En gammal lektionslänk bryts utan att någon märker det |
| Reservera adressnamn för tidsdomän och jämförelse | `js/url-state.js:1–36` (`r` är redan lärarrollen) | S | Namnkrock |
| Prestandabudget med mätning | `docs/arkitektur.md`, #919 | S | Bildlager och andra lagerbild läggs till blint |

Adressen har ingen version, bara regeln att okända fält hoppas över. Det räcker tills vidare [bedömning].

### 6. Körning A:s fynd mot koden

| Fynd i A | Bedömning | Bevis |
|---|---|---|
| A2 Reglaget olåst i tur och lektion | **Arkitektur.** Lägeskontraktet har `when`, `restore` och `takes` men inget om inmatning | `lockTimeControls` låser bara stegknapparna och spelknappen [kod: `js/ui/tour.js:302–307`]; spårets `pointerdown`, `keydown` och årshoppet frågar inget lås [kod: `js/timeline.js:103–109`] |
| B1 Uppspelning bakom dialog | **Arkitektur.** Stängregistret känner inte uppspelningen, och Källor, quiz, hjälp och förslag är inte anmälda | Nedräkningen är ett eget `setInterval` [kod: `js/controllers/playback.js:309–320`] |
| B2 Trasig länk säger inget | **Halvbyggt.** Rättning plus ett gemensamt felfält | `focusError` sätts [kod: `js/url-state.js:115`] men läses bara av testet |
| B6 Falsk exakthet i förhistorien | **Arkitektur.** Formatfunktionerna saknar upplösning; siffran i märket kommer av fönsterfelet | `js/model.js:138, 213` |
| Syntesens A och B ("samtidigt", händelse mot tillstånd) | **Datamodell.** Inget fält skiljer händelse från tillstånd | "Pågår länge" är en tumregel på öppet slut och 100 år [kod: `js/model.js:329`] |
| Escape olika per yta | **Arkitektur** (rest av #894) | Ett tjugotal lyssnare, flera med `stopPropagation` |
| Övriga (A1, A3–A6, B3–B5) | Rättningar, ingen arkitektur | |

## Beslut-krävs-förslag (inget är beslutat)

| # | Förslag | Rekommendation | Förslag på svar | Filer | Om man väntar |
|---|---|---|---|---|---|
| 1 | Fönstret räknas i reglagets läge, och kan då bli olika långt före och efter vid en skarv | Ja, före 7.1. Håller sig inom beslut 2026-11-12 ("fönstret förblir en andel av tidslinjen") men ändrar hur "±N" skrivs vid skarven | "Ja, 1,2 % av reglaget åt varje håll; skriv spannet i klartext när det är ojämnt" | `timeline.js`, `state.js`, `events.js`, `lines.js`, `panel.js`, beslutsfil | Förhistorien visar allt som "nära" |
| 2 | Avrundade år i hela gränssnittet före 10 000 f.Kr. (A:s förslag 14) | Ja, genom ett `step` per segment | "Ja, tusental före 10 000 f.Kr., hundratal till 3000 f.Kr." | `timeline.js`, `model.js`, beslutsfil | Bryter källpolicyns punkt 6 |
| 3 | Tidslås i lägeskontraktet (A2) | Lås reglaget i tur; i lektion inom lektionens år | "Lås. Ett drag byter inte steg" | `state.js`, `timeline.js`, `tour.js`, `lesson.js` | År och kort säger olika saker i klassrummet |
| 4 | #1162: behåll `f=place:id` i stället för ett eget adressfält | Behåll `f=` | "Ja, ersätter 'eget adressfält'" | beslutsfil, `docs/arkitektur.md` | Två adressformer för samma sak |
| 5 | Regel: ett nytt urval är händelselista, tidsspann eller geometri | Ja; människoarter får inget eget format | "Ja" | `docs/datamodell.md`, beslutsfil | Ett nytt format i 7.1 |
| 6 | Plats och tidsspann samtidigt (#971, #1163 punkt 3) | Nej nu; högkulturer som epok med text | "Nej, pröva efter #1164" | `state.js` | Byggs som specialfall |
| 7 | Bildlager v2 och växlande grundkarta (#1096, #397) | Ja: `kind` (grund eller lager), `bounds`, flera rader i Lager; kusten som vektor | "Ja, grundkartan får växla i människans läge, alltid märkt" | `images.js`, `globe.js`, `globe-detail.js`, `schemas/`, `docs/datamodell.md` | 7.1, 8 och 9 bygger var sin lösning |
| 8 | Tidsdomän i tillståndet (version 8) | Reservera namnen nu, bygg i version 8 | "Ja: `domain` och ett eget adressfält" | `state.js`, `url-state.js`, CLAUDE.md punkt 3 | Liten |
| 9 | #248 som eget läge med en andra lagerbild | Ja, efter mätning av minnet | "Ja, bara dator först om mobilens minne inte räcker" | `state.js`, `globe.js`, `registry.js` | Ingen |
| 10 | Händelse eller tillstånd som datafält (A:s förslag 15, 16) | Ja, en liten typning | "Ja, källkontrollerat i omgångar" | `docs/datamodell.md`, schema, `panel.js` | Quiz och jakt fortsätter kalla 50 år "samtidigt" |
| 11 | Rätta CLAUDE.md (teman, fokus mot läge, filstrukturen) | Ja | "Ja" | CLAUDE.md, README.md | Agenter läser fel |

## Förslag på issues (inga är skapade)

Öppna pull requests rör bara `data/`, så ingen av dem krockar.

| # | Titel | Etikett | Modellnivå | Filer | Krockar |
|---|---|---|---|---|---|
| P1 | Tidsfönstret i reglagets läge, med test vid segmentgränserna | `teknik`, `beslut-krävs` | Sonnet high | `timeline.js`, `state.js`, `events.js`, `lines.js`, `render.js`, `panel.js`, nytt test | #1089, #1090, A:s förslag 10 |
| P2 | Segmentens upplösning: en källa för avrundning, steg och fart | `teknik`, `beslut-krävs` | Sonnet high | `timeline.js`, `model.js` | Före #1089, #1090 och A:s förslag 14 (som den ersätter) |
| P3 | Fokusskalan klarar spann över 12 000 år | `bug`, `redo` | Sonnet medium | `timeline.js` | I följd med P2 |
| P4 | Tidslås i lägeskontraktet | `bug`, `teknik`, `beslut-krävs` | Sonnet high | `state.js`, `timeline.js`, `tour.js`, `lesson.js`, test | #1163; ersätter A:s förslag 2 |
| P5 | Stängregistret: dialoggrupp, central Escape, uppspelningen pausar | `accessibility`, `teknik`, `redo` | Sonnet high | `surfaces.js`, `main.js`, `playback.js`, `js/ui/*` | Ersätter A:s förslag 4 och 7 |
| P6 | Adressens felkanal: ett fält, en rad till besökaren | `teknik`, `beslut-krävs` (ny text) | Sonnet medium | `url-state.js`, `controllers/address.js`, `data/ui/*.json` | #1162; ersätter A:s förslag 6 |
| P7 | Bildlager v2: format och schema först, sedan bygge | `teknik`, `beslut-krävs` | Opus (format), Sonnet high (bygge) | `images.js`, `layers/index.js`, `globe.js`, `globe-detail.js`, `schemas/`, `docs/datamodell.md` | #1096, #1094 |
| P8 | Länkarkiv: äldre länkar öppnas lika | `teknik`, `redo` | Sonnet medium | `tests/url-state.test.mjs`, ny fixturfil | Ingen |
| P9 | Prestandabudget: canvasminne, texturstorlek och omritningstid, mobil och dator | `documentation`, `redo` | Sonnet medium | `docs/arkitektur.md` | Del av #919; kan bli en kommentar där |
| P10 | Fokustyper som poster | `teknik`, `beslut-krävs` | Opus (kontrakt), Sonnet high (bygge) | `focus.js`, `panel.js`, `state.js` | #1161, #1163; före 7.1 |

P4, P5 och P6 är samma arbete som A:s förslag 2, 4, 6 och 7, men gjort i kontraktet i stället för på varje ställe. De ska inte bli dubbla issues.

## Inte kontrollerat

- Inget är kört i webbläsare. Canvasminnet, grafikkortets kopior, fokusskalans trängsel och uppspelningstiden är räknade ur koden.
- Största texturstorlek och minnesgräns i mobiler: antaganden som ska mätas (P9).
- Licenser och upplösning för GPlates, Paleobiology Database, NASA Black Marble och havsnivådata. Inga källor är öppnade, och inget skrivs om dem ur minnet.
- Hur långt `Date` räcker i JavaScript är teknisk kunskap, inte provat här; det nås bara i Fokus på korta krig.
- `js/ui/flatmap.js`, `js/controllers/playback.js` och `js/layers/areas.js` är lästa i delar. Förstudierna 2026-11-07 (tidsmodell) och 2026-11-10 (planering av version 7) är inte lästa i sin helhet; analysen går på beslutsfilerna.
- Projektvyn och CI-status är inte avstämda.
- Dirigenten stickprovade segmenten, fönsterformeln, turens lås, `focusError`, bildlagrets ritning, `formatYear`, fokustyperna, utsnittets kustval och händelsernas antal och startår. Övriga radhänvisningar är agentens och inte kontrollerade en gång till.
