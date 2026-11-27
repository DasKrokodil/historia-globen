# 05. UX-översikt

**Status:** utkast 2026-11-08, genomgånget inför v6.1.0 2026-11-09 (rum, känd UX-skuld), förhistorien genomgången 2026-11-27 mot `main` `cefd6f7` (#1108: flöde 9, lägen att prova, tre rader känd UX-skuld), bygger på `index.html`, [arkitektur.md](../arkitektur.md) (Mobilen, Tangentbord, Fokusläget) och granskningarna i [docs/granskningar/](../granskningar/README.md). Hur sidan **upplevs** är antaganden tills vi har användarobservationer. Utseendet (observatorietema, typsnitt, färger) är bindande enligt [CLAUDE.md](../../CLAUDE.md#utseende).

## Designidé i tre meningar

Inspirationen är strategispel som Age of Empires, Civilization och Europa Universalis, där man lär sig passivt genom att utforska. Ett mörkt observatorium: pergamentfärgat land på djupblått hav, mässing som accent. Globen är scenen och tiden är det enda man *måste* röra; allt annat är fördjupning man väljer. Källan syns alltid när man läser.

## Informationsarkitektur

Det finns sex "rum" att vara i, och man ska alltid kunna komma tillbaka till huvudbilden (globen och tidslinjen).

```
                ┌──────────────────────────────────────────────┐
  Rad överst    │ År (stort) · tidsålder          Samtidigt  Meny │   mobil: bara dessa två
                │   Dator: Vy · Utforska · Mer                    │
                ├──────────────────────────────────────────────┤
  Scen          │                                                │
                │          GLOB  /  PLATT KARTA  /  UPPTÄCKT     │
                │      markörer, riken, krigsområden, vägar      │
                │                                                │
                ├───────────────┬────────────────────────────────┤
  Läsning       │ Visste du?-kort│ Faktaruta (dator: sida; mobil: ark)│
                ├───────────────┴────────────────────────────────┤
  Tid           │ Fokusrad · ◀ ▶ ⏵ hastighet · tidslinjebanden    │
                └──────────────────────────────────────────────┘
```

| Rum | Ingång | Vad man gör | Stängs med |
|---|---|---|---|
| **Huvudbild** | Alltid | Dra i tiden och i globen, spela | – |
| **Samtidigt i världen** | Knappen Samtidigt (inaktiv under en tur: "Samtidigt väntar tills turen är slut") | Läsa per världsdel, välja händelse. En läsyta i faktarutans stil: pergament med guldram (#1317). Ligger i samma yta som platskortet: en öppnad panel stänger kortet och tvärtom, den som öppnas sist vinner (#1865) | Kryss, Escape |
| **Visste du?-kortet** (#1867) | Startar litet: fliken "Visste du? 4" i dator, en stängd panel med en rad i mobil. Tryck på fliken eller handtaget öppnar det, och Spela öppnar det av sig självt (utan att spara valet). I dator börjar globen på lägsta zoom (0,8), så att kortets händelser ligger fria från kortet när det är öppet (#1317) | Läsa en fun fact eller ett krigskort, Nästa, Källor, "Visste du? → år". Siffran räknar kort, inte händelser: knappen Samtidigt räknar pågående händelser, och de två ska inte förväxlas | Fliken (dator: knappen –), handtaget (mobil), eller att man drar i globen (mobil) |
| **Faktaruta** | Markör, lista eller sökresultat | Läsa, öppna källa, rapportera fel, följa | Kryss, Escape |
| **Sök och följ** | Knappen Sök och följ | Söka; följa krig, rike, religion, land, resa och tema. Teman ligger som första grupp under Alla och har en egen flik när minst ett publicerat tema finns; fliken Plats visar vad som hände nära en plats | Val eller Escape |
| **Intervallformulär** | Årshoppet → "Välj ett tidsintervall" | Välja från och till, eller en epok med ett klick | Avsluta intervallet, Escape |
| **Lager och Vy** | Lager, Vy | Välja vad som syns; glob / platt / upptäckt. Förhistoria: vyn Människans spridning (händelser och lagret) och, i Lager under Historiskt perspektiv, Istidens kust (modell), av som standard | Utanför-tryck, Escape |
| **Tur / lektion / quiz / jakt** | Turer, Mer, delad länk | Följa ett förlopp steg för steg | Avsluta, Klar, Escape |

Mer-menyn (Källor, Hjälp, För lärare, Quiz, Samtidighetsjakten, Dela) samlar det som inte är kärnflödet. **För lärare** (#1315) är ingången för den som undervisar: ett kort med lektionerna (Starta som lektion), en förklaring av utskriften av elev- och lärarblad, Quiz, Samtidighetsjakten och en knapp för presentationsläget, och det säger att ingen inloggning och inga elevkonton behövs. Hjälp har en rad "Undervisar du?" som öppnar det, och en fjärde rad, "Läs om en plats", som förklarar att de prickade konturerna runt platser med kort går att trycka på när man har zoomat in, och vad Enter gör (#1454). Språket väljs med en egen knapp i raden överst (jordglob och kod, ofärdiga språk märkta beta), så att den som inte läser svenska hittar den utan att öppna en meny (#1167).

## Huvudflöden

Antagna "lyckade vägar". Varje flöde är också en testplan: den som granskar bör faktiskt gå flödet på dator och mobil.

1. **Första besöket:** öppna → se globen och det lilla Visste du?-kortet (fliken "Visste du? 4", en rad i mobil; ett tryck öppnar det, och Spela gör det också, #1867) → (Kom igång, under Mer, och ett engångstips vid tidslinjen) → dra i tiden → klicka en händelse → läs → Källor.
2. **Utforska ett år:** skriv ett år → Samtidigt i världen per världsdel → välj → faktaruta.
3. **Följ ett krig:** Sök och följ → välj krig → uppspelning pausar vid viktiga händelser → slutkort → avsluta och komma tillbaka dit man var.
4. **Tur:** Turer → välj → steg med fråga att fundera på → Klar → slutkort (#1866). Är stegets text lång dras bilden ihop (en tumnagel bredvid rubriken på mobil, en lägre bild på dator) och bildtexten står under texten; har kortet mer att rulla (över 600 px höjd) visar en tonad nederkant och raden "Fortsätt läsa ↓" det; i lägre fönster rullar foten med texten och raden finns inte (#2147). Slutkortet säger var man står och visar det viktigaste att ta med sig: krigets punkter med källor i krigsturerna, annars stegens rubriker (egna sammanfattningar per tur väntar på ett beslut om text). Visste du?-kortet väntar medan slutkortet står, och knappen Samtidigt är nedtonad med hovertexten "Samtidigt väntar tills turen är slut" så länge turen pågår (#1865); Stäng lämnar turen och Starta om turen börjar om. Lektionen har sitt eget slut (#795).
5. **Lektion:** läraren öppnar För lärare under Mer (eller Hjälp → "Undervisar du?") och väljer Starta som lektion, eller delar länken (`m=lektion`) → menyerna är dolda, år och lager låsta → band med "Lämna lektionen" → elevblad och lärarblad skrivs ut. Lektionen visar alltid alla händelser i lektionens år, aldrig Översikts urval (#1139). **Slutet (#1861):** sista steget har Klar bredvid Föregående, och uppdragslänken ("Fortsätt med ett uppdrag") ligger i kortets fasta rad ovanför knapparna så att den syns helt, också på mobil. Klar gör detsamma som Lämna lektionen i bandet: läraren lämnar direkt, eleven får frågan, som förklarar att året står kvar men globens vy och lagren går tillbaka till hur de stod innan lektionen. Stanna kvar ger fokus tillbaka till Klar.
   - **Lärarstödet (#1139):** en gammal länk utan `g=` visar alla händelser, medan en bar länk (`historiagloben.se` utan hash) börjar i Översikt, ett urval om cirka 120 händelser. Två elever som öppnar "samma" sida kan alltså se olika saker. Be eleverna öppna länken du delar (en lektionslänk visar alltid alla händelser), eller säg att de ska välja Standard i Lager. Raden "Översikt: ett urval, cirka 120 händelser. Visa alla" överst i Samtidigt säger när det är ett urval.
   - **Vyn Framsteg (#1379):** den visar bara händelser som källan själv beskriver som framsteg, och det är få än så länge, så globen kan se nästan tom ut (till exempel år 1325). Lager (under vyvalet) och Samtidigt (överst, med "Visa alla") säger det: "Den här vyn visar bara händelser som källan själv beskriver som framsteg. Än så länge är det 2 händelser." Antalet räknas ur datan. Att dölja vyn tills det finns fler taggade händelser kräver DasKrokodils ja och är inte gjort.
6. **Dela:** Dela → länk → mottagaren ser samma vy (adressen bär år, kamera, fokus, lager).
7. **Rapportera fel:** faktaruta → Rapportera faktafel.
8. **Följ ett tema:** Sök och följ → första gruppen Teman → introduktionskort → välj händelser eller spela genom urvalet → Avsluta temat. På mobil är händelselistan hopfälld; Escape stänger först kortet och därefter temat.
9. **Utforska förhistorien (#1108):** tryck dörren "← Före 3000 f.Kr." eller hoppa till ett förhistoriskt år (växlaren ovanför reglaget byter reglage; ett drag byter aldrig reglage, och Home och End går till ändarna av det reglage som syns; beslut 2026-11-19) → Samtidigt visar händelser inom ett stort fönster, med "≈ N år sedan" och osäkerhet i ord → för att se vandringarna: Vy-menyn ("Vad vill du se på kartan?") → Människans spridning (teckenförklaringen är kartans textalternativ) → vill man se kusten: Lager → Istidens kust (modell). Slår man på ett lager och byter reglage kan det stå tomt; raden "Ingen data för året · data från …" under lagrets rad säger det (#1960). Det är ett **antaget** flöde; ingen elev eller lärare har observerats (utvärdering #1961 tidigast 2026-11-27).

**Trasig länk (#1324):** en delad länk med ett skrivfel (en tur, ett krig eller ett år som inte finns) öppnas som förut, men en rad (över tidsreglaget i bred skärm, under årtalet på mobil) säger vad som saknades och vad sidan visar i stället (”Turen ’…’ finns inte. Länken kan vara felskriven eller gammal. Globen visas utan turen.”). Raden är en status för skärmläsare, tar inte fokus, har Stäng och försvinner vid nästa handling, ett nytt år, Escape eller efter 30 sekunder. En lektionslänk till en lektion som saknas förklaras som förut av lektionsbandet, utan en andra rad. Läraren som delar en länk bör öppna den själv först. Skärmbilder: `docs/ux-review/trasig-lank-1324/`.

**Visste du?-kortet startar litet (#1867, beslut 2026-11-16):** kortet hette Samtidigt-kortet och täckte cirka 270 av 800 px i mobil och västra halvan av globen i dator vid start; det startar nu litet så att globen och tiden syns först. Valet att öppna eller fälla ihop sparas (`hg-ff-min`) och kommer tillbaka vid nästa besök; en besökare utan val startar litet. **Spela öppnar kortet (#1867, beslut 2026-11-17):** när besökaren startar uppspelningen med Spela öppnas det lilla kortet, så att pausen vid nya kort fungerar; drag i reglaget, +1/−1, årshopp, länkar, turer och Fokus öppnar det inte. Öppningen sparas inte som besökarens val (nästa besök startar litet igen), ett kort som besökaren har stängt står stängt och ger ingen paus, ett redan öppet kort förblir öppet, och under en tur eller när platskortet är öppet öppnas inget. Namnet "Samtidigt" hör bara till knappen och listan (pågående händelser).

**Visste du? (#997):** knappen visar nästa målår före hoppet. Efter hoppet finns raden ”Från … · Tillbaka” under årtalet; ett tryck återställer året, globens riktning och zoom. Raden försvinner efter tjugo sekunder eller nästa handling, medan webbläsarens Bakåt/Framåt också fungerar. Lugn rörelse följer besökarens inställning.

## Sekundär information på korten: tre nivåer (#1571)

Korten (händelsens faktaruta, resans ruta, Upptäcktsvyns panel) bär mer än läsaren behöver samtidigt: noteringar, källor, kredit och status. Mönstret, valt av DasKrokodil 2026-11-14 ([beslut](../beslut/2026-11-17-hopfallt-monster-1571.md)):

| Nivå | Vad | Var |
|---|---|---|
| Alltid synligt | Bildens märkning "Illustration …, inte en historisk bild"; kredit för historiska bilder (andras verk); (i) för det osäkra och "≈ N år sedan" i datumraden; notens rubrik som en rad med vinkel ("Källorna skiljer sig" syns utan att texten läses); Upptäcktsvyns täckningsrad | Vid bilden, i datumraden och som rad före sammanfattningens slut |
| Hopfällt per notering | Själva noten | `details` direkt under raden, fälls ut med Enter eller Mellanslag, 44 px hög träffyta |
| En sektion längst ned | "Källor och osäkerhet · N källor · status": osäkerhet, källor, Hur vet vi det här?, status, citera, rapportera, kredit och licens för egna illustrationer. Resans ruta: "Källor (N) · status". Upptäcktsvyn: "Kartbilder · N filsidor" | Sist i kortet |

Osäkerhet och oenighet göms alltså aldrig (källpolicyn): bara texten bakom raden är hopfälld. Utfällda avsnitt står kvar när kortet ritas om. **Korta stycken:** långa texter delas i stycken om högst två meningar (`js/paragraphs.js`) i stället för ett enda block; orden är desamma. Kvar att besluta: om kredit för historiska bilder (andras verk) också får flyttas in i sektionen längst ned. Den juridiska bedömningen av CC BY och CC BY-SA är inte gjord, så krediten står kvar vid bilden tills DasKrokodil har avgjort det.

## Skärmstorlekar och lägen

| Läge | Bredd | Särdrag |
|---|---|---|
| Surfplatta (iPad) | 768–1024 px | Toppraden är provad automatiskt i 768×1024, 820×1180 och 1024×768 (#992). Årtalet och förklaringsraden ligger under knapparna i bredder 761–1100 px, även när knappraden bryts. Övriga flöden och verklig iPad är inte fullständigt provade |
| Dator | ≥ 761 px (testat 1400×900, och låg höjd 1280×800 och 1366×768, #1310) | Faktaruta vid sidan, tre knappgrupper, menyer fälls ned. Under 880 px höjd är faktarutans bild lägre så att texten syns under den |
| Mobil | ≤ 760 px (testat 400×800) | Bara Samtidigt och Meny i raden överst; faktaruta och Visste du?-kort som ark med tre lägen (Visste du?-kortet startar stängt, som en rad "Visste du? 4"); globen lyfts när arket är halvt; 44 px träffytor |
| Låg höjd (#1310) | båda, under 600 px höjd | 200 % zoom av 1280×800 (640×400 CSS-px) och liggande telefon: turkortet rullar i sig självt, turens namn döljs i kortet (det står i turraden), faktarutans ark och bild är lägre. **Sedan #2147** (högst 600 px höjd) rullar foten med Nästa och Lämna turen tillsammans med texten i stället för att ligga fast, knappen Fortsätt läsa döljs, stegets bild med kredit står efter texten, och vid högst 480 px visas stegnumret till höger om kapitlet i stället för den grafiska mätaren; Nästa ligger alltså under vecket och nås genom rullning eller tangentbord. Intervallet 601–700 px i bred layout omfattas inte (vid 1366×650 syns fortfarande bara en textrad, #2169; [beslut 2026-11-21](../beslut/2026-11-21-turkortet-lag-hojd-2147.md)). Provas med fönsterstorlek, inte med webbläsarens zoom. Skärmbilder före och efter: `docs/ux-review/lag-hojd-1310/`. Liggande telefon (#1667): vid 800×360 och 844×390 lämnar knapparna överst plats åt faktarutan medan den är öppen, och vid 640×360 och 667×375 på pekskärm täcker det fullt utfällda arket fokusraden och tidsreglaget (som då inte går att fokusera) tills det fälls ihop med handtaget; drag i handtaget når läget helt (provas i `tests/webblasare.mjs`). Platskortets knapp ligger på låg yta (högst 480 px) direkt under rubriken och syns utan rullning vid 800×360 (och vid 640×360 i läget helt; i läget halvt är arket 90 px högt och rymmer bara rubriken), #1693 Liggande telefon (#1932): medan man följer något ligger årtalet ovanför fokusraden (inte bakom), Samtidigt-kortet och -listan är höga nog att läsa (102 och 229 px vid 800×360) och varje knapp provtrycks med `elementFromPoint` (`tests/traffytor.mjs`). |
| Platt vy | båda | Karta med zoom och panorering; samma bild som kan skickas till en fysisk glob |
| Regionvy (#1641) | båda | "Visa på kartan" för en liten plats (Skåne, Danmark): skarp, inzoomad karta där platsen fyller cirka 65 % av ytan som kortet (dator) eller arket (mobil) inte täcker, med en sluten kantlinje och omgivningen nedtonad. Riken och religioner ritas inte där (rutan och statusraden säger det). Rutan "Regionvy: Skåne" uppe till vänster har "Lämna regionvyn"; Escape lämnar vyn när kortet är stängt. Båda ställer tillbaka vyn man kom från, med kameran (glob eller Platt karta, #1864); ryms regionvyn inte heter knappen "Visa på Platt karta". **Markörer (#1642):** varje händelse har en numrerad markör med samma nummer som raden i listan "Händelser på platsen"; det som gäller hela platsen står i brickan "Hela Skåne · 4", markörer på samma ställe i en hög ("×8" med ortnamn och årsspann) som fälls ut som en solfjäder, och ungefärliga platser har en streckad ring, som rutan förklarar. Statusraden säger när något fälls ut, fälls ihop eller markeras. Första trycket på en markör ger raden en ram, nästa (eller etiketten) öppnar faktarutan; en rad i fokus markerar markören. Orter, grannländer och hav står på kartan för orientering. Antagande tills det har provats med besökare: att en ruta med en rad om vad som saknas räcker för att ingen letar efter rikena, och att två tryck (markera, sedan öppna) inte förvirrar **Tryck på platsen (#1978):** ett tryck på själva platsen (landet eller landskapet) öppnar kortet igen utan nytt Fokus, med mus och med finger, och rutan säger "Tryck på en markör eller på platsen för fakta" (i stående mobil som egen rad i Platt vys ruta; i globens ruta i stående mobil och på en låg liggande yta ryms den inte, #1687, #1952). Ett tryck bredvid platsen gör ingenting. |
| Regionvy på globen (#1644) | båda | "Visa på kartan" för en stor plats (Aotearoa, Grönland) i platskortet: globen flyger in med ett smalt synfält och lägger platsen mitt i ytan som kortet eller arket, knapparna överst och tidslinjen inte täcker, i rätt form (ingen platt förvrängning, Chathamöarna över datumgränsen och Grönlands norra spets syns). Samma ruta, markörer, bricka, högar, ortnamn och lista som i Platt vys regionvy; medaljerna, bågarna och världslagren visas inte. Escape (efter kortet) eller "Lämna regionvyn" ställer tillbaka vyn man kom från med kameran (globen där den stod, eller Platt karta om man kom därifrån, #1864), och vyn lämnas också när man slutar följa platsen eller väljer Platt karta. Sverige har "Visa på Platt karta" och ingen regionvy tills DasKrokodil har bedömt det. Antagande: att flygningen (cirka 1 s, ingen i Lugn rörelse) känns som en zoom och inte som ett vybyte **Tryck på platsen (#1978):** ett tryck på själva platsen (landet eller landskapet) öppnar kortet igen utan nytt Fokus, med mus och med finger, och rutan säger "Tryck på en markör eller på platsen för fakta" (i stående mobil som egen rad i Platt vys ruta; i globens ruta i stående mobil och på en låg liggande yta ryms den inte, #1687, #1952). Ett tryck bredvid platsen gör ingenting. |
| Lektionsläge | båda | Menyerna dolda, år och lager låsta; Vy- och Stil-grupperna (Glob, Platt karta, Upptäcktsresor) är dolda och går inte att nå med tangentbord (#795, #1917) |
| Presentationsläge (#488) | dator (≥ 761 px) | Större text och knappar för projektor och storskärm. Slås på med knappen i För lärare (utan omladdning; adressen får `?presentation=1`) eller med en äldre länk med parametern; Avsluta uppe i raden stänger det på stället (utan omladdning) och behåller vyn och lärarens roll i en lektion. Knappen visas inte i mobilbredd, där Avsluta täcker årtalet (känt fel i läget, #1457) |
| Utskrift | A4 | Elev- och lärarblad, svart på vitt |

## Lägen att alltid prova (blind-spots-listan)

Fel hittas sällan i "lyckat flöde". Granskare ska prova dessa lägen, och ett fynd som testet missade ska leda till en ändrad testmetod (CLAUDE.md, UX-genomgång):

- **Tomt:** år utan händelser, filter som ger inga träffar, kategori utan innehåll.
- **Delvis:** händelse utan bild, text bara på svenska i ett annat språk, rike utan alla perioder.
- **Blandat:** händelser med och utan bild i samma lista.
- **Laddning och fel:** långsam laddning, misslyckad bildhämtning, ingen grafikaccelerering (WebGL), blockerat CDN.
- **Övergångar:** byta språk mitt i en tur, avsluta lektionsläget, öppna en delad länk med Fokus, bakåt-knappen, paus och byte under uppspelning.
- **Inmatning:** bara tangentbord, bara touch, 200 % zoom, lugn rörelse på.
- **Förhistorien:** år före 10 000 f.Kr. med en tom Samtidigt-lista; lager påslagna utanför sin täckning (Människans spridning efter 3000 f.Kr., riken före sin start); gränsåret mellan reglagen (3001 och 3000 f.Kr.); spridningslagret i 400 px med utfällda poster; "år sedan" och osäkerhet bredvid varandra.
- **Skillnad urval mot full lista:** är det tydligt vad som visas och vad som inte gör det?

## Tillgänglighet i korthet

Det som finns: tangentbord (Tab, Enter, piltangenter på globen), globen som region med `aria-roledescription`, minst 24 px träffyta på dator och 44 px på mobil, kontrastvariabel för kontrollramar, lugn rörelse som respekterar `prefers-reduced-motion`, webbläsarens egen zoom tillåten. **Inte bevisat:** skärmläsarupplevelse, full tangentbordssekvens, färgblindhet för kategorifärger. Se [06](06-granskningsperspektiv.md#7-tillgänglighet).

## Språk och ton

Tidslinjens uppspelning, hastighet och dagsteg, årshoppets meddelanden, Platt vys klungnamn, affischens etiketter och Om källornas gränssnitt hämtar sina texter ur `data/ui/` på alla fem språk (#672). Källors egna titlar, krediter och licensnamn behålls som innehåll.

Fem språk (sv, en, de, es, fr); svenska först, saknas ett språk visas engelska och sedan svenska. **Artigt tilltal** (`Sie`, `usted`, `vous`) i gränssnittet och för vuxna, **du-form** för elever till och med 13 år (beslut 2026-11-08). Fakta skrivs opersonligt. Illustrationer märks alltid; respekt-reglerna för bilder står i CLAUDE.md.

## Känd UX-skuld

Det här är pekare, inte en backlog. Källan är den daterade rapporten; fynden hanteras som issues.

| Område | Kort | Källa |
|---|---|---|
| Mobil faktaruta bakom lektionskortet | Läsning och Stäng blockeras i 400×800 | blind-spots-rapport (PR #871, F7), komplett analys 2026-11-08 |
| Lektionslänk döljer utskriften | Lärarens väg från länk till blad | blind-spots-rapport F1 |
| Tyst laddningsreserv, slutsteg utan uppläsningssignal | Skärmläsare och laddning | blind-spots-rapport F2, F3 |
| Mobilkortet täcker tidslinjen i startläget | Kortet och kontrollerna konkurrerar | helhetsanalys 2026-11-06 (kontrollera om åtgärdat) |
| Reservpresentation vid bildfel | Bildyta och kredit finns kvar utan bild | blind-spots-rapport F8 |
| Surfplatta: övriga flöden återstår | Toppradens överlapp är åtgärdat och provat i tre iPad-format (#992); övrig trängsel och träffytor behöver fortfarande prövas | beslut 2026-11-08; R9 i [04](04-arkitekturoversikt.md), #992 |
| Intervallformuläret för skärmläsare | Dubbla årtal i epokknappar, rubriker som `<p>`, ingen uppläsning när intervallet väljs, platsfältets `aria-label` | #977, granskningen inför 6.1.0 (PR #972); väntar till nästa release |
| Länk med år utanför tidslinjen | `#y=-20000&y2=3000` ger ett intervall som inte finns | #976, samma granskning; väntar till nästa release |
| Datumformat på de, es och fr | "4 Juli 1776" skrivs på svenskt vis | #983; väntar till nästa release |
| Översättningsluckor i gränssnittet | Svensk feltext i annat språk | översättningsspärren; #672 |
| Förhistorien: "strax före eller efter" och dubbla (i) | Rubriken "Strax före eller efter" betyder tusentals år före 10 000 f.Kr.; osäkerhetsmärket och förklaringen av "år sedan" har samma (i) | #2158 (beslut väntar), release 2026-11-21 |
| Förhistorien: reglagets bredd | Lika breda reglage för 97 000 och 5 000 år; på 400 px är förhistorien cirka 37 px bred (beslut 2026-11-12, före delningen i två reglage) | utvärdering #1961, beslut 2026-11-19 |
| Förhistorien: glesa områden | Amerika 21 och Afrika 32 händelser före 3000 f.Kr. mot väntade 181 och 129; Penghu 1 och Harbin finns bara i noter | granskningen 2026-11-26 (`docs/granskningar/release-2026-11-21.md`, `release-2026-11-26.md`) |

## Att kontrollera vid uppdatering

- [ ] Har en ny vy, meny eller ett nytt läge tillkommit? Uppdatera rum-tabellen, flödena och lägena.
- [ ] Har ett fynd i tabellen åtgärdats? Ta bort det och skriv i [06](06-granskningsperspektiv.md) vad det lärde oss.
- [ ] Är skärmbilderna eller ASCII-skissen fortfarande rättvisande?
- [ ] Gå minst flöde 1, 3 och 5 på dator och mobil innan release.
