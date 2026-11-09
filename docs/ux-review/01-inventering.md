# 01. Inventering av gränssnittet

**Datum:** 2026-11-09. **App:** `main` vid commit `b58e47f` (efter PR #972), körd lokalt med `python3 -m http.server`.
**Syfte:** beskriva vad en besökare möts av, utan värdering. Bedömningarna kommer i [02](02-uxdesigner.md), [03](03-pedagog.md) och [04](04-syntes.md).

## Metod och begränsningar

- Chromium (Playwright) med programvarurendering (SwiftShader), webbtypsnitt från Google Fonts laddade. three.js från jsDelivr.
- Tre fönsterstorlekar: **dator 1400 × 900**, **mobil 400 × 800** (pekskärm), **iPad stående 820 × 1180** (pekskärm, samma layout som dator).
- Ny webbläsarprofil (första besök, tom `localStorage`), sedan interaktioner: Samtidigt, en händelse, Lager, Sök och följ, Mer/Meny, år 1916, följa första världskriget, en tur, Hjälp, introduktionen, årsrutan, Källor, Quiz, Platt karta.
- **Inte provat:** riktig mobil eller iPad, skärmläsare, lektionsläget, Samtidighetsjakten hela vägen, Dela, språkbyte, Upptäcktsresor i detalj, tidsintervall. Bildfrekvens under uppspelning gick inte att mäta meningsfullt med programvarurendering (2,5 bilder/s, inte representativt).
- **Renderingsavvikelse, ej bekräftad:** i mobilbredd syns en mörk rektangel över klotets övre del i flera skärmbilder (`mobil-01`, `mobil-04`, `mobil-07`). Den finns i själva WebGL-canvasen, inte i HTML. Den försvinner när faktarutan lyfter klotet. Kan vara en effekt av programvarurenderingen; behöver provas på en riktig telefon innan den räknas som fel.

## Skärmbilder

Alla i [skarmbilder/](skarmbilder/). Namnet säger bredd och läge.

| Läge | Dator | Mobil | iPad |
|---|---|---|---|
| Första besök (år 1325) | `dator-01-forsta-besok.jpg` | `mobil-01-forsta-besok.jpg` | `ipad-01-forsta-besok.jpg` |
| Samtidigt i världen öppen | `dator-02-samtidigt.jpg` | `mobil-02-samtidigt.jpg` | `ipad-02-samtidigt.jpg` |
| Faktaruta (Osmanska riket) | `dator-03-faktaruta.jpg` | `mobil-03-faktaruta.jpg` | `ipad-03-faktaruta.jpg` |
| Lager | `dator-04-lager.jpg`, `dator-14-lager-anpassa.jpg` | `mobil-04-lager.jpg`, `mobil-14-lager-anpassa.jpg` | |
| Sök och följ | `dator-05-sok-och-folj.jpg` | `mobil-05-sok-och-folj.jpg` | |
| Mer / Meny | `dator-06-mer.jpg` | `mobil-06-meny.jpg` | |
| År 1916 | `dator-07-ar-1916.jpg` | `mobil-07-ar-1916.jpg` | `ipad-07-ar-1916.jpg` |
| Följer första världskriget | `dator-08-folj-krig.jpg` | `mobil-08-folj-krig.jpg` | |
| År 501 f.Kr. | `dator-09-ar-500fkr.jpg` | | |
| Platt karta | `dator-10-platt.jpg` | `mobil-10-platt.jpg` | |
| Hjälp | `dator-11-hjalp.jpg` | | |
| Introduktion ("Ett år, en plats") | `dator-12-intro.jpg` | | |
| Turlistan och ett tursteg | `dator-15-turer.jpg`, `dator-16-tur-steg.jpg` | `mobil-15-turer.jpg`, `mobil-16-tur-steg.jpg` | |
| Tidigt år (2901 f.Kr.) med panel | `dator-18-tidigt-ar.jpg` | | |
| Årsrutan | `dator-19-arsruta.jpg` | `mobil-19-arsruta.jpg` | |
| Om källorna, Quiz | `dator-20-kallor.jpg`, `dator-21-quiz.jpg` | | |

## 1. Första vyn

Sidan öppnar på **år 1325** (fast startår i `js/main.js:503`). Ingen introduktion öppnas automatiskt. Adressen skrivs om till `#y=1325&c=34,-50,1&l=areas,events,funfacts,routes,wars`. Laddning till klar glob: cirka 4 s (dator) och 2,5 s (mobil) lokalt.

**Dator (1400 × 900), uppifrån och ned:**

| Område | Innehåll |
|---|---|
| Övre vänstra hörnet | "Historia-globen", stort årtal **1325**, raden **MEDELTID OCH TIDIGMODERN TID · VISAR ±38 ÅR** |
| Övre raden, mitten | Gruppen **VY**: Glob · Platt karta · Upptäcktsresor |
| Övre raden, höger | Gruppen **UTFORSKA**: Samtidigt **35** · Sök och följ · Turer · Ett år, en plats · Lager. Längst till höger **⋯ Mer** |
| Scen | Klotet med Nord- och Sydamerika, Europa och Afrika i bild; markörer, etiketter, rikesområden, symboler och en båge (se avsnitt 3) |
| Vänster mitt | **Samtidigt-kortet**: tre bildkort (Mansa Musa i Kairo, Ibn Battuta ger sig av, Tenochtitlan, var och en med "Läs mer ›"), raden **SAMTIDIGT · FUN FACT · 1 AV 4 · –**, texten "1324 når Mansa Musa Kairo på väg till Mecka. 1325 ger sig Ibn Battuta av från Tanger åt samma håll. Samma år grundas Tenochtitlan.", tre händelsechips, raden "Fun facten: källkontrollerad", länkarna **Källor · Nästa · Visste du?** |
| Nederst | Stegknappar **−100 −10 −1 ▶ +1 +10 +100** och **25 år/s**; tidslinjen 3000 f.Kr.–2000 med prickar, romber och streck |

**Mobil (400 × 800):** årtalet och era-raden överst till vänster (ingen sidtitel), till höger **Samtidigt 35** och **Meny**. Klotet syns i övre halvan. Samtidigt-kortet är ett ark med greppet "Dra upp för mer", bildremsa, texten avkortad med "…", chips och samma tre länkar. Stegknapparna (sju plus hastighet) fyller hela bredden. Tidslinjen har etiketterna 3000 f.Kr., 0, 1000, 1800, 2000.

**iPad stående (820 × 1180):** datorns layout. Knappgruppen **UTFORSKA** bryts till en andra rad och ligger över era-raden ("VISAR ±38 ÅR" skyms delvis). Klotet tar mitten, Samtidigt-kortet ligger nedtill vänster.

**Antal kontroller i första vyn:** 655 synliga, fokuserbara element på dator (644 på mobil). Av dem är de flesta tidslinjens markeringar (en knapp per händelse, rom­ber "Samtidigt", start och slut för varje resa) och etiketterna på klotet. Tabbordningen på dator börjar med klotet, sedan etiketterna på klotet, därefter årtalet, Vy-knapparna, Utforska-knapparna, Mer, Samtidigt-kortet, stegknapparna och sist tidslinjens markeringar.

## 2. Kontroller och menyer

### Övre raden

| Kontroll | Dator | Mobil | Vad den öppnar |
|---|---|---|---|
| Årtalet | klickbart | klickbart | **Årsrutan**: fält "År eller datum", knapp **f.Kr.**, **Gå**, rubriken "Välj ett tidsintervall" och fem epokknappar (Bronsålder och tidig järnålder 3000 f.Kr., Antiken och tidig medeltid 500 f.Kr., Medeltid och tidigmodern tid 1001 e.Kr., Modern tid 1801 e.Kr., Idag 2026 e.Kr.) |
| Glob / Platt karta / Upptäcktsresor | synliga | i Meny | Byter vy |
| Samtidigt (siffra) | synlig | synlig | Panelen **Samtidigt i världen** |
| Sök och följ | synlig | i Meny | Sökmeny och listor att följa |
| Turer | synlig | i Meny | Turlistan |
| Ett år, en plats | synlig | i Meny | Introduktionen i tre steg |
| Lager | synlig | i Meny | Lagermenyn |
| Mer | synlig | (Meny) | Källor, Hjälp, Samtidighetsjakten, Quiz, Dela, språkväljare |

Mobilens **Meny** innehåller rubrikerna VY (Glob, Platt karta, Upptäcktsresor), UTFORSKA (Sök och följ, Turer, Ett år, en plats, Lager) och sedan Källor, Hjälp, Samtidighetsjakten, Quiz, Dela och språkväljaren (Svenska, English, Français (bêta), Deutsch (Beta), Español (beta)).

### Lager

Överst rubriken **VY** med sex förval: **Standard · Bara kartan · Utforska · Makt och gränser · Resor och handel · Framsteg**, länken **Vilket rike?** och knappen **Anpassa själv ▾**. Utfällt (42 kontroller):

- **Stäng av alla**, **Återställ**
- MÄNNISKOR OCH HÄNDELSER: Händelser ("cirkel på tidslinjen"), Samtidigt-kortet ("romb på tidslinjen · fun facts och annat som hände samtidigt")
- MAKT, TRO OCH GRÄNSER: Riken, Religioner ("rikenas officiella religion · streckad kant = osäker uppgift · prickad = ärvd, rikets faktaruta saknar religion"), Dagens gränser ("stämmer inte historiskt"), Krigsområden ("området där ett krig pågår · syns när Händelser är på")
- RÖRELSER OCH HANDEL: Resor och handelsvägar ("lodrätt streck på tidslinjen · streckad = osäker väg")
- HISTORISKT PERSPEKTIV: Nattljus (NASA, 2016), Upptäcktsvy ("gammal kartstil med segelskepp, havsmonster och dimma som resorna lyfter")
- KATEGORIER: 14 knappar (Natur och djur, Människans ursprung, Civilisationer och riken, Religion, Vetenskap och uppfinningar, Upptäcktsresor, Krig och konflikter, Kultur och arkitektur, Sport, Ekonomi och handel, Hälsa och epidemier, Klimat, Katastrofer, Rymden)
- INSTÄLLNINGAR: Behåll mina lager i fokus
- RÖRELSE: Lugn rörelse (med förklaring)
- PAUSA UPPSPELNINGEN VID: Samtidigt-kortet; Samtidigt-kortet även i fokusläget; Fortsätt själv efter Samtidigt-kortet; När ett krig bryter ut; Stora händelser när man följer ett krig; Nyckelår när man följer ett rike; Stopp när man följer en resa

På dator täcker den utfällda menyn större delen av klotet. På mobil är förvalen synliga direkt under Samtidigt-knappen.

### Sök och följ

Sökfält ("Händelse, krig, rike, land, religion eller resa"), flikarna **Alla · Händelser · Krig · Riken · Försvunna länder · Religioner · Resor · Plats**, raden **ORDNA: Relevans · Kronologiskt · Alfabetiskt · Gruppera efter: Tidsålder**, texten "Det som pågår inom ±150 år från 1325, närmast först." och hopfällbara grupper: KRIG (53), RIKEN (273), FÖRSVUNNA LÄNDER (11), RELIGIONER (22), RESOR (18). En sökning ("första världskriget") ger raden "1 resultat · Sök: "första världskriget" · Rensa allt".

### Turer

Rubriken GUIDADE TURER och åtta turer med titel och en mening: Andra världskriget i Europa och Stilla havet (märkt "Lektion · årskurs 7–9 · 30 min", knappen "Starta som lektion"), Första världskriget på fyra kontinenter, Hur föll Västromerska riket?, Hur föll Hanriket?, Hur föll Songhairiket?, Tre platser 1324–1325, Vikingatiden och världen samtidigt (märkt "Lektion · årskurs 4–6 · 30 min"), Hur vet vi det här? Sex saker många tror.

### Mer

Källor · Hjälp · Samtidighetsjakten · Quiz · Dela · språkväljare.

## 3. Scenen: vad som ritas på klotet och kartan

| Element | Utseende | Beteende |
|---|---|---|
| Händelsemarkör | Ring med prick i kategorins färg, ibland med mjuk gloria i samma färg | Klick öppnar faktaruta |
| Etikett | Mörk ruta med färgad prick och titel; ibland med tillägg **"· slut 1912"**, **"· slut 1908"**, **"· börjar 1942"**, **"· börjar 500 f.Kr."** | Visar ett urval; vissa etiketter är halvgenomskinliga (bakom klotets kant) |
| Klunga | Mörk cirkel med siffra (2, 3, 4, 6), ram i en eller flera kategorifärger | Flera händelser nära varandra |
| Rikessymbol | Rund mässingsram med vit symbol (örn, krona, hammare och skära, flagga, korsade svärd, palm, m.fl.) | "Rikets symbol. Öppnar faktarutan" |
| Rikesområde | Färgade områden med tunn kant och namn i kalligrafisk kursiv ("Kungariket Frankrike", "Mamluksultanatet", "Makuria") | Syns i Standard-förvalet |
| Krigsområde | Rödrandig yta med tjock röd kant | Ritas runt krigets plats och slag |
| Krigsmarkör | Korsade svärd i röd ring, rött "×" på tidigare slag | I fokusläget |
| Båge | Tunn ljus linje mellan två platser | Visar sambandet i Samtidigt-kortet |
| Resa / handelsväg | Streckad grön linje (till exempel genom Asien) | Ritas fram över tiden |
| Klotets gloria och nät | Ljusblå atmosfär, longitud- och latitudlinjer | |

Exempel, år 1916 utan fokus: de etiketter som syns är "Titanic sjunker · slut 1912", "Kongofristaten, Leopold II:s privata koloni · slut 1908" och "Folkmordet på herero och nama · slut 1908". Första världskriget har krigsområde och symbol men ingen etikett.
Exempel, tursteg år 1939: etiketten "1942 · Slaget vid Stalingrad · börjar 1942" syns.

**Platt karta:** samma innehåll på en platt världskarta, med knapparna **+**, **−**, **⛶** (återställ) och **Affisch**.

## 4. Tidslinjen och årsvisningen

- **Stort årtal** i IM Fell English. Före vår tideräkning med kursivt "f.Kr." efter (501 *f.Kr.*).
- **Era-raden** under årtalet, i versaler och monospace: "MEDELTID OCH TIDIGMODERN TID · VISAR ±38 ÅR". Fönstret varierar: **±38 år** (1325), **±11 år** (1916, 1939), **±120 år** (501 f.Kr.), **±1 år** (i fokus på första världskriget). I fokus står "FOKUS: FÖRSTA VÄRLDSKRIGET · VISAR ±1 ÅR".
- **Stegknappar:** −100, −10, −1, ▶ (spela), +1, +10, +100, och hastigheten (25 år/s; 2,5 år/s i fokus).
- **Tidslinjen:** skalan är segmenterad (3000 f.Kr., 2000 f.Kr., 1000 f.Kr., 500 f.Kr., 0, 500, 1000, 1200, 1400, 1600, 1800, 1900, 1950, 2000 på dator; på mobil 3000 f.Kr., 0, 1000, 1800, 2000). På linjen: färgade prickar (händelser), vita romber ovanför (fun facts, "Samtidigt"), turkosa staplar (resor), tunna spann. Ingen förklaring på själva tidslinjen; förklaringen finns som undertext i Lager ("cirkel", "romb", "lodrätt streck").
- **I fokusläget** byter tidslinjen skala till krigets år (1914–1918) med etiketter som "Fram till Slaget vid Verdun", "Fram till USA går in i kriget". Spela-knappen försvinner ur stegraden och finns i stället i fokusraden.

## 5. Kort, paneler och rutor

### Samtidigt-kortet

Typetiketter som förekommer: **SAMTIDIGT · FUN FACT**, **SAMTIDIGT · NÄR ETT KRIG BRÖT UT** (även "Rikets berättelse" och "Landets berättelse" i språkfilen). Sidräknare "1 av 4", minimera (–), bildremsa med "Läs mer ›", markerade bilder ("ILLUSTRATION", "GRAFISK SYMBOL"), händelsechips, statusraden ("Fun facten: källkontrollerad", "Kriget: källkontrollerad") och länkarna Källor, Nästa, Visste du?.
Kortet syns inte alla år: vid **1400** fanns varken kort eller flik.
**Visste du?** flyttade år och kamera från 1325 till 491 f.Kr. (Konfucius och Sokrates).
I mobil är kortet ett ark med tre lägen (stängt, halvt, helt).

### Samtidigt i världen (panel)

Rubrik, raden "35 träffar: 24 pågår, 11 nära. 24 händelser pågår år 1325, 11 till inom ±38 år.", 14 kategorichips, sedan grupper per världsdel (Europa 4, Asien 2 …) med titel, årtal och plats per händelse. På mobil är kategorichipsen en vågrät rad som rullar. Vid 2901 f.Kr.: "3 träffar: 3 pågår, 0 nära. 3 händelser pågår år 2901 f.Kr.." (två punkter).

### Faktaruta

Anfang (stor initial), titel, årtal, länken **osäkert**, plats, kategori, bild med bildtext och kredit ("Illustration i stil med osmansk miniatyrmålning … inte en historisk bild. AI-genererad med ChatGPT, 2026-10-29 · CC BY 4.0"), sammanfattning, "Historisk osäkerhet: dateringen är ungefärlig", "Källa: Ottoman Empire – Wikipedia, Wikidata Q12560", statusraden "Händelsen: två källor stämmer (i)", "Kontrollen gäller källorna, inte om historien är säker.", **Rapportera faktafel**. Mobil: ark med "Visa på globen".
På dator ligger faktarutan mitt på skärmen när Samtidigt-panelen är öppen (tre läsytor samtidigt: kortet, faktarutan, panelen). Bilden kommer före texten.
Krigets faktaruta i fokus: etiketten **INNAN KRIGET BÖRJAR** (visades vid år 1916), "Varför kriget började", "Parterna", "Tryck på ▶ för att följa kriget.", "Följ berättelsen: Första världskriget på fyra kontinenter (14 steg)".

### Fokusläget (följa ett krig)

Samtidigt synligt på dator vid 1916: legenden **Krigsområden** (med "Riken är dämpade medan du följer det här" och "Visa som vanligt"), Samtidigt-kortet, krigets faktaruta, fokusraden **FOKUS · Första världskriget 1914–1918 · 1916 · Står still · ▶ Spela · Tillbaka till hela tiden**, pausraden **Pauser: ● Krigets händelser ○ Samtidigt (av) · Spela klart ▶**, texten "Nästa paus: USA går in i kriget (1917)", stegknappar och omskalad tidslinje. Kartan zoomar in på Europa.
Mobil: legend (hopfälld), faktaruta som ark över större delen av skärmen, fokusrad och tidslinje.

### Tursteg

Turkort ("STEG 1 AV 14", turens namn, kapitel "1939–1940: KRIGET I EUROPA BÖRJAR", rubrik, text, länkarna Läs om händelsen · Källor · Skriv ut elev- och lärarblad · Kopiera lärarlänk, knapparna Avsluta turen och Nästa →), händelsens faktaruta till höger, och en rad ovanför stegknapparna: "Turen: Andra världskriget i Europa och Stilla havet · Avsluta turen · ▶ Fortsätt".

### Hjälp

"Så använder du globen": 1 Dra globen, 2 Byt år, 3 Följ en berättelse ("Välj ett krig, ett rike eller en religion under **Fokus**."), hopfällt avsnitt "Markörer, klungor och religioner", stödtext med länken "Stöd Historia Globen ↗", "Lämna förslag".

### Introduktion ("Ett år, en plats")

Tre steg. Steg 1: "Ett år, en plats. Börja med en händelse på globen. PÅ DEN HÄR PLATSEN: Eiffeltornet står klart 1889 · Paris, Frankrike", knapparna Hoppa över och Nästa. Året hoppar till 1889.

### Om källorna, Quiz

Om källorna: "Så läser du statusen" (Källkontrollerad, Två källor stämmer, Historien kan ändå vara osäker), källpolicy, register.
Quiz "Vad hände samtidigt?": en händelse (Mingdynastin 1368–1644 · Nanjing, Kina), frågan och tre svar (Brasília blir Brasiliens huvudstad, Tenochtitlan, Kokodafälttåget).

## 6. Lägen användaren kan befinna sig i

Vy (Glob, Platt karta, Upptäcktsresor) × fritt utforskande, fokus (krig, rike, land, religion, resa), tur, lektion (`m=lektion`), Samtidighetsjakten, quiz, introduktion, tidsintervall, presentationsläge, uppspelning eller stillastående. Lägen som kan vara öppna samtidigt i det som provades: Samtidigt-kort + Samtidigt-panel + faktaruta; fokus + legend + kort + faktaruta + pausrad; tur + turkort + faktaruta + turrad.

## 7. Begrepp som användaren möter

Ordagrant från gränssnittet, grupperat. Antal förekomster av samma ord i olika betydelser står inom parentes.

| Grupp | Begrepp |
|---|---|
| **"Samtidigt"** (minst 6 användningar) | Samtidigt (knapp med siffra), Samtidigt i världen (panel), Samtidigt-kortet, SAMTIDIGT · FUN FACT (typetikett), "Samtidigt i världen:" (i krigskortet), "Samtidigt" (romb på tidslinjen och i pausraden), Samtidighetsjakten, "Vad hände samtidigt?" (quiz) |
| **"Vy"** (2 betydelser) | VY i övre raden (Glob, Platt karta, Upptäcktsresor); VY i Lager (Standard, Bara kartan, Utforska, Makt och gränser, Resor och handel, Framsteg) |
| **"Utforska"** (2) | UTFORSKA som knappgrupp; Utforska som förval i Lager |
| **Upptäckt** (2) | Upptäcktsresor (vy); Upptäcktsvy (kryssruta i Lager) |
| **Följa / fokus** | Sök och följ, Fokus (fokusraden, era-raden, Hjälp), fokusläge, Följ berättelsen, Tillbaka till hela tiden, Behåll mina lager i fokus |
| **Berättelse / tur** | Turer, Guidade turer, Följ en berättelse (Hjälp), Följ berättelsen (krigskort), Rikets berättelse, Landets berättelse, Lektion, Starta som lektion, Kopiera lärarlänk |
| **Tid** | f.Kr., e.Kr., cirka, ±N år, Visar ±38 år, pågår, nära, slut 1912, börjar 1942, Relevans, Tidsålder, epoker, Välj ett tidsintervall, år/s, Spela klart |
| **Kvalitet och källor** | Källor, Om källorna, källkontrollerad, två källor stämmer, osäkert, Historisk osäkerhet, Illustration, Grafisk symbol, AI-genererad, Rapportera faktafel, Lämna förslag |
| **Kartans tecken** | markör, klunga, rikets symbol, krigsområde, krigsskådeplats, streckad kant, prickad (ärvd), cirkel/romb/lodrätt streck på tidslinjen, Dagens gränser, Nattljus, Försvunna länder |
| **Innehållstyper** | händelse, fun fact, krig, slag, rike, religion, resa, handelsväg, land, missuppfattning, kategori (14 st.) |

## 8. Där dokumentationen och appen inte stämmer överens

| Dokument säger | Appen visar |
|---|---|
| Uppdraget till granskningen nämner "lagertypen område i version 2 (ett rike från Cliopatria, dagens gränser som filter, en religions spridning)" som kommande | Version 2 är släppt sedan länge (CLAUDE.md: version 2–5.0 och R1–R7 klara). Riken ur Cliopatria, Dagens gränser, Religioner och Krigsområden finns redan som områdeslager. Kommande tillägg enligt versionsplanen är tidsintervall och epoker (6.1), teman (6.2), regionkort (6.3), människans långa historia (7), jordens historia (8) och atlas/jämförelse (9) |
| Hjälp: "Välj ett krig, ett rike eller en religion under **Fokus**" | Knappen heter **Sök och följ** (projektordlistan säger att Fokus bytte namn), men fokusraden och era-raden säger fortfarande "FOKUS" |
| Projektordlistan och 05-ux-oversikt kallar det **Introduktion** | Knappen heter **Ett år, en plats** och ligger bland Utforska-knapparna |
| 05-ux-oversikt, flöde 1: "öppna → se globen och Samtidigt-kortet → (introduktion)" | Introduktionen startar inte av sig själv (webbläsartestet kräver det); Samtidigt-kortet syns vid startåret 1325 men inte alla år |
| Projektordlistan: "Vy" = Glob / Platt karta / Upptäcktsresor | Lager-menyn har också en rubrik **VY** med sex andra val |
| 05-ux-oversikt: "Surfplatta … ej provat särskilt" | Bekräftat att iPad stående får datorlayouten; Utforska-raden bryts och täcker delvis era-raden |
| CLAUDE.md (Utseende): färger som CSS-variabler, mörkt observatorietema | Stämmer i stort. Samtidigt-kortet och händelsens faktaruta är ljusa pergamentytor; krigets faktaruta, turkortet, menyerna och panelerna är mörka |
