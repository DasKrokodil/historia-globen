# Plan: arbetskö för de närmaste milstolparna (2026-11-07)

Från Claude Code (dirigent, Rikards konto). **Förslag, inte beslut.** Inga issues skapas och inga etiketter sätts förrän Rikard har godkänt planen (CLAUDE.md, "Granskningar från Codex"). Alla antal är räknade ur `data/events.json` (761 händelser) och `python3 tools/tackning.py`; inga nya historiska fakta förekommer.

## Syfte

Agenterna ska aldrig stå utan ett avgränsat, krockfritt issue att ta. I dag finns bara två `redo`-issues (#65, #736) och Version 6 har fyra öppna pull requests i sikte. Planen delar upp de närmaste milstolparna i uppgifter som en enskild agent kan ta på en pull request, med agent, storlek, beroende och filkrockar angivna.

## Utgångsläge

| Spår | Läge |
|---|---|
| Version 6, skolpilot | 11 öppna issues. #739 och #740 byggs i PR #750, #65 och #736 är `redo`, resten väntar på #736/#737/#738. |
| Riken: global täckning | PR #748 (#645, andra omgången) öppen; #646 (antiken) står i kö. |
| Språk | Engelska är klara för alla 761 händelser. Tyska, spanska och franska saknar **8 573 texter vardera** (`data/oversattning.json`). #672–#674 (gränssnittet) och #677–#679 (innehållet) är öppna. |
| Bilder | 24 % av händelserna har bild (Oceanien 10 %, Afrika 17 %, Asien 27 %). #299 (437 saknar bild) är `pågår`. |
| Version 5.2 | #15, #569, #579 väntar till efter piloten (beslut 2026-11-07). |

## Vad datan säger (styr innehållsuppgifterna)

- **Förhistorien är nästan tom:** 5 händelser, 0 i Amerika och Oceanien. Hör ihop med Version 7.
- **Antiken Amerika 19 mot väntat 65, Afrika 19 mot 46, Asien 38 mot 67.** Saknade kategorier: natur, upptäckter, vetenskap, hälsa, klimat.
- **Medeltid:** 1000-talet har 2 händelser i Asien, 1300-talet 1 i Europa, Asien och Amerika. Medeltiden Amerika 20 mot väntat 34.
- **Skev balans:** 58 % av alla händelser är krig (Asien 81 %, 1900-talet Afrika 86 %). Taggen `framsteg` används 0 gånger. Kategorierna klimat, sport, rymden och natur är nästan tomma.
- **Fun facts:** 21 stycken. Täckningen är 0 % för 2000-talet, 0 % för Oceanien och 3 % för Asien.
- **Exakta datum:** 460 händelser har `precision` 11, vilket räcker för "Idag i historien" (#489). Att dagen faktiskt står i `edtf` ska kontrolleras (uppgift T4).

## Milstolpar att planera mot

1. **Version 6: skolpilot** (pågår, inga nya issues behövs).
2. **Efter piloten: Version 5.2 och rättningar** (#15, #569 i tre delar, #579, #553, #571 och det piloten visar).
3. **Täckning: händelser och balans** (**ny milstolpe, kräver Rikards ok**). Samlar de datauppgifter som täckningsrapporten pekar ut, tillsammans med de befintliga paketen Vetenskap och medicin, Riken och Bilder.
4. **Förberedelse för Version 7** (#396, #49, #50, #11) så att människans långa historia kan starta direkt efter utvärderingen.
5. **Parallellt hela tiden:** Språk (#672–#679) och Riken (#645, #646).

## Uppgifterna

Storlek: liten, medel, stor. "Fakta" betyder att Codex och Copilot inte får ta uppgiften (CLAUDE.md). "Krock" anger filer som är gemensamma med andra uppgifter. **Alla datauppgifter delar de genererade filerna** (`data/events.json`, `data/genererat/`); den som ombaseras kör om `python3 tools/dela_data.py`. Håll därför datapull requests till högst en per tidsperiodfil i taget.

### A. Teknik och gränssnitt (Codex, Copilot eller Andreas agenter)

| # | Uppgift | Issue | Storlek | Agent | Beror på | Krock |
|---|---|---|---|---|---|---|
| T1 | Webbläsartest: 200 % zoom och fokusåterkomst i Sök och följ | #708 (ej `redo` än) | liten | Copilot/Codex | – | bara `tests/webblasare.mjs` |
| T2 | Gränssnittets texter i JS, del 3 och 4, och korsgranskning | #672, #673, #674 | medel ×3 | Codex | en i taget, enligt issuet | `data/ui/*.json`, `data/oversattning.json` |
| T3 | **Prestandamätning med en syntetisk, större datamängd** (3× och 10× händelser): rapport med tröskel för markörer och laddning. Förutsättning för #569 och för mer import | nytt | medel | Codex Luna | – | inga (bara rapport) |
| T4 | **Underlag för "Idag i historien"**: hur många händelser har dag i `edtf`, hur jämnt fördelade över året och världsdelar. Rapport, därefter bygget | nytt, sedan #489 | liten + medel | Codex | bygget efter Version 6 | `data/ui/*.json` |
| T5 | **#569 del 1:** `selectEventsForRange` i `js/date-events.js` med node-test, intern parameter. Ingen UI-ändring | nytt (delissue till #569) | liten–medel | Codex | efter piloten | `js/date-events.js` |
| T6 | **#569 del 2:** val av från och till (två årsfält med stegknappar i mobil), aktivt intervall, "Tillbaka till ett år", `y2` i länken, utesluter Fokus och uppspelning | nytt | stor | Codex | T5, #736 | `js/state.js`, `js/url-state.js`, `js/timeline.js` |
| T7 | **#569 del 3:** rikes- och religionslagren visar läget vid intervallets slut med etikett; markörgräns som inställning | nytt | medel | Codex | T3, T6 | `js/layers/areas.js` |
| T8 | **#15 "Vad hände här?":** först en spec som kommentar (Luna), sedan bygget | #15 | medel | Codex | efter piloten | `js/ui/panel.js` |
| T9 | **"Nytt på sidan"** (`data/nytt.json`, ruta i Om källorna). Texterna skrivs av Claude Code vid release | #553 | liten | Codex/Copilot | efter första releasen i Version 6 | `data/ui/*.json` |
| T10 | **Skärmläsare och kontrast i utskriften** (efter #738): granskning och rättning | nytt | liten | Copilot | #738 | `css/style.css` |
| T11 | **Blind-spots-runda på Version 6** (tomma lägen, pilotens stigar, laddning): daterad rapport i `docs/granskningar/` | nytt | medel | Codex | före release | inga |
| T12 | **Benchmark mot skolmaterial och historieatlaser:** idéer, inte kopiering. Listan bygger på öppnade sidor | nytt | liten | Codex Luna | – | inga |
| T13 | Användartest av förenklade kartkontroller: testprotokoll och 3–5 testpersoner, med pilotens iakttagelser som underlag | #571 | medel | Claude Code (protokoll), Rikard (personer) | piloten | – |

### B. Innehåll och fakta (Claude Code, Opus; Codex och Copilot tar inte dessa)

**Först en uppgift som styr resten:** C0 bygger listan över vad som borde finnas per tom cell **ur öppnade källor**, inte ur minnet. Alla C-uppgifter plockar därifrån.

| # | Uppgift | Issue | Storlek | Mål (ur täckningen) |
|---|---|---|---|---|
| C0 | **Källdriven lista** över kandidater för de tio största luckorna (Wikidata, Cliopatria, etablerade referenslistor), som rapport | nytt | medel | styr C1–C7 |
| C1 | Antiken, Amerika: omgång om högst 20 | nytt | medel | 19 mot väntat 65; natur, upptäckter, vetenskap |
| C2 | Antiken, Afrika: omgång om högst 20 | nytt | medel | 19 mot väntat 46 |
| C3 | Antiken, Asien: upptäckter, vetenskap, religion | nytt | medel | 38 mot väntat 67 |
| C4 | Medeltid, Asien 1000–1400 | nytt | medel | 1000-talet 2, 1300-talet 1 |
| C5 | Medeltid, Europa 1100–1400 och Amerika 1200–1400 | nytt | medel | 1* i flera celler |
| C6 | Tidigmodern tid, Afrika och Asien, **utan krig** (vetenskap, kultur, ekonomi) | nytt | medel | tomma kategorier |
| C7 | Förhistoria: Amerika, Oceanien, Afrika (först efter beslut om #396, eftersom datumen är ungefärliga) | nytt | medel | 0, 0 och 1 händelser |
| C8 | **Rymdfärdens milstolpar** (flera länder), 10 händelser | #84 | medel | rymden är tom |
| C9 | **Medicinska framsteg**, 10 händelser, flera världsdelar | #85 | medel | hälsa 0 i flera perioder |
| C10 | **Vetenskapliga genombrott**, 10 händelser, flera världsdelar | #86 | medel | vetenskap 0 i Asien och Afrika |
| C11 | Taggen `framsteg` (#555): mät först hur många befintliga händelser där **källan själv** beskriver en förbättring | #555 | liten | 0 taggade |
| C12 | **Fun facts**, 3 omgångar om 10–15, bara på befintliga händelser, med siffror som går att räkna fram | nytt | medel ×3 | 21 finns; Asien, Oceanien, 2000-talet |
| C13 | **Bilder**, omgångar per världsdel, riktig bild först | #299 (delas) | medel ×4 | Oceanien 10 %, Afrika 17 %, Asien 27 % |
| C14 | Riken: fortsätt medeltiden (#645) och antiken (#646), omgångar om tio stater | #645, #646 | medel ×n | enligt `tools/tackning_riken.py` |
| C15 | Teknikhistoria (#105) och "I perspektiv" (#128) | #105, #128 | medel | efter C8–C10 |

**Översättning av innehållet** (#677–#679) får enligt beslutet 2026-11-06 göras av Codex för tyska, spanska och franska när engelskan är klar (den är det för händelserna). Uppgifterna delas per period och språk, en pull request vardera, så att `data/oversattning.json` ombaseras i tur och ordning. Claude Code granskar mot svenskan: fakta ändras aldrig.

### C. Förberedelse för Version 7 (inget byggs före Rikards beslut)

| # | Uppgift | Issue | Storlek | Agent |
|---|---|---|---|---|
| V1 | **Förstudie: tidsmodell för ungefärliga datum och intervall.** Vad klarar `edtf` redan (`Y-66000000`), vad kräver ändring, hur hänger det ihop med intervalläget (#569)? Beslutsunderlag | #396 | medel | Claude Code (Opus) |
| V2 | Licenskoll ROAD (människoarter, fynd) | #50 | liten | Claude Code |
| V3 | Tidsreglage med zoom för hundratusentals år | #49 | stor | Codex, efter V1 |
| V4 | Människoarter som händelser och lager | #11 | medel | Claude Code, efter V1 |

### D. Utanför kod (Rikard)

- #744 hitta en lärare och en klass.
- Hårdvara H1–H3 (#79–#81) planeras i Rikards Claude-projekt.
- Beslut i listan sist.

## Vad varje agent kan ta, i ordning

| Agent | Nu | Efter piloten | Efter beslut |
|---|---|---|---|
| **Codex (Rikard)** | #65, #736, T3, T12, T1 | T4, T5, T8, T9, översättning (#672–#679) | T6, T7, V3 |
| **Codex/Copilot (Andreas)** | T1, T2, T10 | T9, översättning per period och språk | – |
| **Claude Code (Rikard)** | C0, V1, #739/#740-granskning | C1–C7, C11, C12 | C7 efter #396 |
| **Claude Code (Andreas)** | C8, C9, C10 (en världsdel eller ett ämne var) | C1–C6 enligt fördelningen under "Beslut" | – |

Med högst fyra öppna pull requests per person ryms detta. **När det är fullt** gäller stegen i CLAUDE.md: gör klart de egna, granska den andras, förbered nästa issue (källarbete som kommentar), skriv analyser.

## Risker

- **Filkrockar i data:** alla datapull requests ändrar de genererade filerna. Mildras av en per periodfil i taget och av att den som ombaseras kör `tools/dela_data.py`.
- **Faktafel:** den största risken i hela planen. C0 finns för att kandidaterna ska komma ur källor. Allt förblir `draft` tills källsidan är öppnad.
- **Europaslagsida i öppna data.** Varje omgång ska ha minst tre världsdelar, enligt versionsplanens regel.
- **Översättningsflödet** kan svämma över `data/oversattning.json`: 8 573 texter per språk. Håll en pull request per period och språk.
- **Tokenkostnad:** det finns ingen uppmätt förbrukning att räkna på (effektiviseringsrapporten 2026-11-04). Storlekarna är relativa. Förslag: mät faktisk förbrukning för de tre första innehållsomgångarna (C1, C8, C12) och sätt intervall därefter.
- **Gamla milstolpetexter:** #15, #84, #85 och #86 slutar med "Milstolpe: Version 10/12/14" som inte stämmer med GitHub-milstolparna. Rättas när issuena rörs.

## Beslut som behövs från Rikard

1. **Ny milstolpe "Täckning: händelser och balans"** för C0–C13? Alternativ: lägga dem i befintliga "Paket: Vetenskap och medicin", "Bilder: batchar" och "Riken: global täckning". Rekommendation: ny milstolpe, för att täckningsrapporten ska kunna följas som en sak.
2. **Prioritet:** luckorna (antiken Amerika och Afrika, medeltid Asien) och balansen (icke-krig) före fler krig och fler europeiska händelser? Rekommendation: ja.
3. **Fördelning mellan Rikards och Andreas Claude Code:** förslag att Andreas tar de tre avgränsade paketen C8–C10 (rymd, medicin, vetenskap) och Rikards tar C1–C7, så att de inte ändrar samma periodfiler.
4. **Förhistorien (C7):** vänta på #396 (rekommenderas) eller börja med ungefärliga datum i dagens modell?
5. **Godkänner du att jag skapar issuena** (ungefär 40 stycken) med byggorder, delissues till rätt förälder och `redo` bara på de som saknar beroenden och krockar?

## Om du säger ja

Jag skapar issuena i omgångar efter spåren ovan, sätter `redo` på T1, T3, T12, C0 och V1 direkt (inga krockar), och resten när deras villkor är uppfyllda. Byggorderna skrivs i issuena, inte som separata kommentarer.
