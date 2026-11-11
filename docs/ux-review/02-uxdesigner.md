# 02. Granskning: senior UI/UX-designer

**Datum:** 2026-11-09. **Granskare:** Claude Code i rollen som senior UI/UX-designer (lins 1 och lins 7 i [06-granskningsperspektiv.md](../produkt/06-granskningsperspektiv.md), med en blick från lins 10 "Spelaren"). Granskningen är gjord oberoende av pedagogens granskning (03) och syntesen (04), som jag inte har läst.
**App:** `main` som i [01-inventering.md](01-inventering.md), körd lokalt med `python3 -m http.server`.

**Vad jag provade**

- Inventeringens skärmbilder (dator 1400 × 900, mobil 400 × 800, iPad stående 820 × 1180), alla genomgångna.
- Egna körningar i Chromium (Playwright) i **dator 1400 × 900**, **mobil 400 × 800 med pekskärm** och **iPad liggande 1180 × 820 med pekskärm** (inte provat i inventeringen).
- Åren 1325 (start), 1400, 1612 (under uppspelning), 1916, 1944, 501 f.Kr. och 2901 f.Kr.; klick och drag i tidslinjen; uppspelning tills den pausar; "Visste du?"; Sök och följ när året byts; mobilarkets tre lägen; tryck på en etikett i mobil.
- Tangentbord: de första 120 tabbstoppen i både dator och mobil, antal fokuserbara element och deras storlek.
- Mätning av kontrast och textstorlekar i första vyn, och läsning av koden för etiketternas urval (`js/controllers/labels.js`), toppraden (`index.html`) och lagerlistan (`js/layers/index.js`, `data/vyer.json`).

**Begränsningar**

- Programvarurendering (SwiftShader). Bildfrekvens och kamerans mjukhet går inte att bedöma; den mörka rektangeln över klotet i mobil räknas inte som fynd.
- Ingen riktig telefon eller iPad, ingen skärmläsare, inget lektionsläge, inget språkbyte, inget tidsintervall.
- Inga användarobservationer. Allt jag skriver om hur en besökare *upplever* något är **antaganden**, härledda ur det som syns och ur personorna i [02-anvandare-och-intressenter.md](../produkt/02-anvandare-och-intressenter.md). Det som är mätt eller observerat står som mätt eller observerat.

---

## Sammanfattning

Sidan känns plottrig av tre huvudskäl. **För det första konkurrerar tre "huvudsaker" om första blicken**: globen, Samtidigt-kortet (bilder, text, chips och tre länkar) och tidslinjen med sina 616 markeringar, under en rad med tio knappar. Ingen av dem säger "börja här", och första vyn har 655 fokuserbara element (E, L). **För det andra betyder de bärande orden flera saker**: "Samtidigt" används för minst sex olika saker, "Vy" och "Utforska" för två vardera. Själva samtidigheten är ett tidsfönster på ±1 till ±480 år som byter storlek utan förklaring, och därför visar globen etiketter som "slut 1912" och "börjar 1945" i stället för det som pågår (B). **För det tredje saknas en gemensam modell för lägen**: fokus, tur, uppspelning och introduktion har var sin rad, var sitt sätt att gå vidare (fem varianter av "spela/nästa") och var sitt sätt att gå ut (sex olika ord), och flera knappar hoppar i år och kamera utan att säga det (L, B). Av de tio fynden nedan är fyra främst **E**, tre främst **B** och tre främst **L**, men de tyngsta fynden blandar typerna: det är inte antalet element i sig som gör sidan svår, utan att många element säger nästan samma sak med olika ord. Det som redan fungerar bra ska behållas: stilen, faktarutans källrad, mobilmenyns stora knappar och den stängda mobilvyn, där globen faktiskt får vara huvudsaken (egen skärmbild, se fynd 1). Det mesta går att rätta med text, ordning och vilka ytor som får vara öppna samtidigt, inom dagens arkitektur och stil.

---

## Fynd

### 1. Första vyn har ingen huvudsak och ingen första handling

- **Observation:** I `dator-01-forsta-besok.jpg` drar fyra saker i blicken samtidigt: det stora årtalet, Samtidigt-kortet (tre bildkort med "Läs mer ›", en mening, tre chips, statusraden och länkarna Källor · Nästa · Visste du?), globen med åtta etiketter, en klunga och rikessymboler, och tidslinjen med prickar, romber och staplar. Ovanför ligger tio knappar i tre grupper. Mätt: **655 fokuserbara element** i dator och 644 i mobil, varav 616 är tidslinjens markeringar; Samtidigt-kortet ensamt har **10 tabbstopp**. I första vyn förekommer **13 kombinationer av textstorlek och typsnitt** (9,5 px till 76 px). Jämför med år 1400, där kortet inte visas (egen skärmbild): scenen blir genast lugn och läsbar. I mobil (`mobil-01`) startar kortet i halvläge och täcker nedre halvan av globen; när jag fällde ihop det (eget prov, läget `ff-s-closed`) blev globen huvudsaken och kortets rubrikrad ("Samtidigt · Fun fact · 1 av 4") låg kvar som en tydlig flik. Ingenting i första vyn säger "dra här" eller "tryck här"; introduktionen startar inte av sig själv och heter "Ett år, en plats".
- **Orsakstyp:** E (sekundär L)
- **Varför det är ett problem, och för vem:** M1 ("förstå samtidighet på under en minut") hänger på att besökaren gör *en* sak och ser *ett* samband. Persona F (förstagångsbesökaren) och A (Maria, ofta på mobil) möts av flera lika starka ytor. Antagande: man läser kortets text eller tittar på bilderna, men upptäcker inte att det är tiden man ska dra i, som är själva idén. Persona A "frustreras av överlastad karta".
- **Allvar:** hög
- **Förslag:** Bestäm en rangordning och låt layouten följa den: (1) år och tid, (2) globen, (3) ett samband. Konkret: starta mobilkortet i **stängt läge** (fliken), inte halvt. På dator, visa kortet utan bildremsa från start (bilderna fälls ut med kortet eller visas som en enda liten bild), och flytta Källor/Nästa/Visste du? till kortets utfällda läge. Lägg en engångstips vid tidslinjen första besöket ("Dra här för att byta år", försvinner efter första draget, sparas i `localStorage`). Samla textstorlekarna till högst sex steg i `:root`.
- **Insats:** medel

### 2. "Samtidigt" betyder sex saker, och samtidighetsfönstret byter storlek utan förklaring

- **Observation:** Ordet används för knappen **Samtidigt 35**, panelen **Samtidigt i världen**, **Samtidigt-kortet**, kortets typetikett **SAMTIDIGT · FUN FACT**, raden "Samtidigt i världen:" i krigskortet, romben "Samtidigt" på tidslinjen och i pausraden, **Samtidighetsjakten** och quizet "Vad hände samtidigt?" (inventeringen avsnitt 7). Siffran i knappen (35) och kortets "1 av 4" räknar olika saker. Fönstret bakom ordet varierar: era-raden säger **±38 år** (1325), **±11 år** (1916), **±72 år** (201 f.Kr.), **±120 år** (501 f.Kr.) och **±1 år** i fokus, medan Sök och följ samtidigt säger **±40 år** (1916), **±150 år** (1325) och **±480 år** (501 f.Kr.). Följderna syns på kartan och i korten: vid 1612 pausar uppspelningen på ett kort som börjar "Under några veckor 1616 …" (egen skärmbild), och vid 1916 är kortets rubrik "Första världskriget bryter ut 1914" (`dator-07`). Ingenstans förklaras vad "visar ±38 år" betyder.
- **Orsakstyp:** B
- **Varför det är ett problem, och för vem:** Samtidighet är produktens löfte (vision: "Samtidighet som första fråga"). När ordet betyder både en knapp, ett kort, en panel och ett tidsfönster på upp till 480 år blir löftet otydligt. Elever (C, D) och barn med vuxen (J) har begränsad tidsuppfattning enligt personorna; antagande: "samtidigt" läses som "samma år", och då ser "1616" i ett kort vid 1612 ut som ett fel. Det rör M1 och, för källkritiken, M9.
- **Allvar:** hög
- **Förslag:** (a) Låt **Samtidigt** bara betyda listan "Samtidigt i världen" och dess knapp. Ge kortet ett eget namn som säger vad det är, till exempel "Visste du?" eller "Oväntat samtidigt", och ta bort "SAMTIDIGT ·" ur typetiketten. (b) Skriv fönstret i klartext i era-raden: "Visar det som pågår 1325, och det som hände 38 år före eller efter". (c) Rita fönstret som ett ljust band runt tummen på tidslinjen, så att man ser det i stället för att läsa det. (d) Använd samma fönster i Sök och följ som på globen, eller säg tydligt att listan är bredare. Lägg orden i ordlistan ([13-ordlista.md](../produkt/13-ordlista.md)) och i alla fem språkfilerna.
- **Insats:** medel

### 3. Etiketterna visar det som slutat eller inte börjat, men inte det som pågår där det händer mest

- **Observation:** Utan fokus valde globen dessa etiketter (egna prov): **1916**: "Titanic sjunker · slut 1912", "Oktoberrevolutionen i Ryssland · börjar 1917", "Spanska sjukan · börjar 1918"; första världskriget har krigsområde men ingen etikett. **1944**: bara "FN-stadgan skrivs under och FN grundas · börjar 1945", halvgenomskinlig, och kameran står kvar över Atlanten så att Europa ligger vid klotets kant (egen skärmbild). **1612**: "Harvard grundas · börjar 1636" och "Cocoliztli slår till igen · slut 1580". **1400**: "Pachacuti gör Cusco till Inkariket · börjar 1438". I koden (`js/controllers/labels.js`, rad 79–82 och 136–137) sorteras etiketterna efter vald, hovrad, markerad av kortet och sedan aktivitet, men placeringen stoppas av rikesnamn och medaljer (`globeEmpireBlocks`) och av klungor. I täta områden, som Europa under ett krig, får därför ingen etikett plats, medan glesa områden får etiketter för händelser decennier före eller efter året.
- **Orsakstyp:** E (sekundär L)
- **Varför det är ett problem, och för vem:** Etiketterna är det första man läser på klotet. När de mest visar "slut …" och "börjar …" ser globen ut att handla om något annat än året, och det viktigaste som pågår syns bara som en färgad yta. Antagande: persona A och D ("vad hände före och efter?") får en felaktig bild av vad som är viktigt just då; spelaren (lins 10) förväntar sig att kartan "lever" där det händer. Det rör M1 och M4 (tydligt urval).
- **Allvar:** hög
- **Förslag:** Ge etiketterna en tydlig prioritet: (1) pågår vid året, (2) markerad av kortet, (3) nära i tid. Visa "slut/börjar"-etiketter bara när inget som pågår syns i samma vy, och högst två av dem. Låt ett krigs viktigaste händelse (`"top": true`) få etikett före rikesnamn som krockar, eller lägg krigets namn i krigsområdet på samma sätt som rikesnamn. Begränsa antalet etiketter till cirka fem i dator och tre i mobil, så att varje etikett väger något.
- **Insats:** medel

### 4. Fem sätt att gå vidare och sex sätt att gå ut

- **Observation:** Framåt: **▶** i stegraden, **▶ Spela** i fokusraden, **Spela klart ▶** i pausraden, **▶ Fortsätt** i pausraden och turraden, **Nästa →** i turkortet, och dessutom **Nästa** i Samtidigt-kortet (nästa fun fact) och **Nästa fråga** i quizet. I en tur på dator (`dator-16-tur-steg.jpg`) syns tre framåtknappar samtidigt: Nästa →, ▶ Fortsätt och ▶. Ut: **Tillbaka till hela tiden** (fokus), **Avsluta turen** (två gånger i samma vy, plus ×), **Visa hela globen** (lektion), **Avsluta jakten** (plus ×), **Hoppa över** (introduktion), **Visa som vanligt** (krigets teckenförklaring) och **Stäng**. Varje läge har sin egen rad på sin egen plats: fokusraden ovanför stegknapparna, pausraden ovanför den, turraden, krigets "Pauser: ● Krigets händelser ○ Samtidigt (av)" till vänster och "Nästa paus: …" till höger (`dator-08-folj-krig.jpg`).
- **Orsakstyp:** L (sekundär B)
- **Varför det är ett problem, och för vem:** Den som inte vet vilket läge hen är i vet inte vilken knapp som gäller, och inte hur man kommer ut. Persona D "frustreras av att inte hitta tillbaka"; persona C behöver "tydlig nästa-knapp". Antagande: i en tur väljer en elev mellan tre framåtknappar som gör olika saker (nästa steg, fortsätt uppspelningen, spela tiden) och tappar turen. Rör M1, M3 och M5.
- **Allvar:** hög
- **Förslag:** En **lägesrad** på en fast plats ovanför tidslinjen, samma för alla lägen: *[lägets namn] [◀] [huvudknapp] [Avsluta]*. Huvudknappen heter "Nästa" i turer och "Spela" när tiden går, aldrig båda. Stegraden döljs eller tonas ned när ett läge äger uppspelningen. "Avsluta" (eller "Tillbaka till hela globen") används i alla lägen, och × gör samma sak. Detta passar med lägeskontraktet (#893) och bör skrivas in där innan intervall (#755) och teman (6.2) får egna rader.
- **Insats:** medel till stor

### 5. Läsytorna staplas på scenen och har tre olika utseenden

- **Observation:** I `dator-03-faktaruta.jpg` är tre läsytor öppna samtidigt: Samtidigt-kortet till vänster, panelen till höger och faktarutan mitt på globen, där den täcker klotet. Faktarutans bild tar större delen av den synliga ytan och texten börjar under kanten; rubriken delas av anfangen till "O / smanska riket". I `ipad-03` täcker faktarutan dessutom Samtidigt-kortet. I fokus (`dator-08`) är fem ytor öppna: teckenförklaring, kort, faktaruta, fokusrad och pausrad. Ytorna växlar mellan ljust pergament (Samtidigt-kortet, händelsens faktaruta), mörkt (krigets faktaruta, turkortet, panelen, menyerna) och tidsålderns ramar (sten, papyrus, kakel, pergament, gravyr, tidning, art deco, rymd i `:root`). I mobil täcker arken 60–75 % av höjden (`mobil-03`, `mobil-08`, `mobil-16`).
- **Orsakstyp:** E
- **Varför det är ett problem, och för vem:** Ögat vet inte vilken yta som är "den man läser nu", och globen, som ska vara scenen, försvinner. Antagande: persona A upplever det som plottrigt just här, eftersom tre rutor med olika färg och ram konkurrerar. För lins 7 betyder växlande ljus och mörk bakgrund att ögat hela tiden ställer om. Rör M1 och M5.
- **Allvar:** medel
- **Förslag:** En regel: **en läsplats per bredd**. På dator dockar faktarutan alltid på samma ställe (höger sida, i panelens plats eller ovanpå den) och aldrig mitt på klotet. Samtidigt-kortet fälls ihop automatiskt när en faktaruta öppnas. Texten kommer före den stora bilden; bilden visas mindre och kan förstoras. Ta bort anfangen i rubriken eller låt den bara gälla brödtexten. Behåll tidsålderns ram som en tunn kant eller rubrikdekor, men använd en bakgrund för läsning (pergament) och en för kontroller (mörk), konsekvent.
- **Insats:** medel

### 6. Toppraden: tio knappar, dubbla ord och introduktionen förklädd till funktion

- **Observation:** Raden har grupperna **VY** (Glob, Platt karta, Upptäcktsresor) och **UTFORSKA** (Samtidigt, Sök och följ, Turer, Ett år en plats, Lager) samt **Mer**. Gruppetiketterna är 9,5 px versaler (mätt). Samma ord betyder annat i Lager: Lager har också rubriken **VY** (Standard, Bara kartan, **Utforska**, Makt och gränser …). "Upptäcktsresor" (vy) och "Upptäcktsvy" (kryssruta i Lager) är samma lager (`index.html`, kommentaren vid `btn-discovery`). "Platt karta" och "Bara kartan" låter som samma sak men är en vy respektive ett förval som släcker allt. "Ett år, en plats" är introduktionen, men står bland funktionerna. "Sök och följ" leder till ett läge som i fokusraden, era-raden och Hjälp heter **Fokus**. I iPad stående bryts raden och täcker era-raden (`ipad-01`).
- **Orsakstyp:** B (sekundär E)
- **Varför det är ett problem, och för vem:** Toppraden är kartan över sidan. När ord upprepas med olika betydelse kan besökaren inte bygga en bild av hur sidan hänger ihop. Persona F måste "i första skärmen förstå vad man kan göra". iPad är en huvudplattform enligt visionen. Rör M1 och M5.
- **Allvar:** medel
- **Förslag:** (a) Gör Vy till en liten tvåvalskontroll (glob/karta) med ikoner, gärna i hörnet nära kartans egna knappar, och flytta Upptäcktsresor till Lager som en kartstil. (b) Döp om Lagers "VY" till "Förval" och förvalet "Utforska" till något som säger vad det visar. (c) Flytta "Ett år, en plats" till Mer som "Kom igång", och låt engångstipset i fynd 1 ta dess plats. (d) Använd ett ord för fokusläget överallt ("Följer: Första världskriget" passar knappen Sök och följ). (e) Ta bort gruppetiketterna VY/UTFORSKA när raden har färre knappar. Kvar blir till exempel *Samtidigt · Sök och följ · Turer · Lager · Mer*, som får plats i iPad stående.
- **Insats:** liten till medel

### 7. Lager blandar vad som syns, filter, uppspelningsregler och tillgänglighet

- **Observation:** Utfällt har Lager **42 kontroller** (inventeringen): sex förval, Stäng av alla och Återställ, tio lager i fyra grupper, 14 kategorier (samma filter som chipsen i panelen), "Behåll mina lager i fokus", "Lugn rörelse" och **sju** kryssrutor under "Pausa uppspelningen vid". Undertexterna är 11 px monospace och tekniska: "rikenas officiella religion · streckad kant = osäker uppgift · prickad = ärvd, rikets faktaruta saknar religion". Tidslinjens teckenförklaring står här ("cirkel på tidslinjen", "romb på tidslinjen", "lodrätt streck"), inte vid tidslinjen. Förvalen skiljer sig lite: Standard och Utforska skiljer sig bara i resor och krigsområden (`data/vyer.json`). På dator täcker menyn större delen av klotet (`dator-14`), så man ser inte vad ändringen gör.
- **Orsakstyp:** E (sekundär B)
- **Varför det är ett problem, och för vem:** Lager är där nästa lagertyper ska få plats (se Skalning). Redan i dag är den en lång lista där val av olika slag ser likadana ut. "Lugn rörelse" är en tillgänglighetsinställning (lins 7) som är svår att hitta bland pausregler. Antagande: persona A använder förvalen, men inte resten; spelaren (lins 10) vill se effekten direkt på kartan.
- **Allvar:** medel
- **Förslag:** Dela Lager i tre: **Kartlager** (det som ritas, varje rad med en liten färg- eller symbolprov i stället för textförklaring), **Kategorier** (bara på ett ställe, i panelen Samtidigt, eller bara i Lager, inte båda) och **Inställningar** (uppspelningens pauser, Lugn rörelse, Behåll mina lager) under Mer. Behåll tre eller fyra förval med en rad som säger vad de visar. Placera menyn så att klotet syns bredvid (i dator som en smal sidopanel). Flytta tidslinjens teckenförklaring till tidslinjen (fynd 8).
- **Insats:** medel

### 8. Tidslinjen: 616 knappar på några pixlar, utan förklaring och i fel ordning för tangentbordet

- **Observation:** Mätt i dator: efter stegknapparna kommer tidslinjen (`role="slider"`, ett tabbstopp) och därefter **616 knappar**, prickar på **6 × 6 px** och spann **4 px höga**. Tabbordningen följer data, inte tid: Cheopspyramiden 2600 f.Kr., De sista ullhårsmammutarna 3000 f.Kr., De antika olympiska spelen 776 f.Kr. … Jordbruket börjar i Bördiga halvmånen (10000 f.Kr.) och Göbekli Tepe (9500 f.Kr.), som ligger före tidslinjens början 3000 f.Kr. Spann ligger över prickar så att prickar inte går att peka på (Playwright: "tspan … intercepts pointer events" när jag försökte hovra en prick). Före årtalet och menyerna kommer klotet och 11–12 etiketter och symboler på klotet; det tar 40 tabbsteg att nå tidslinjen. Skalan är segmenterad (3000 f.Kr., 2000 f.Kr., 1000 f.Kr., 500 f.Kr., 0, 500 … 1950, 2000) utan att det syns att avstånden betyder olika mycket. Ingen förklaring av prick, romb och streck finns vid tidslinjen. Stegknapparna och kortets länkar är synligt små i mobil (41 × 34 px respektive 34 × 24 px, mätt) men har en osynlig utökad tryckyta i `::after` (`css/style.css`), så de klarar 44 px; tidslinjens markeringar har ingen sådan utökning.
- **Orsakstyp:** E (sekundär B; tillgänglighet)
- **Varför det är ett problem, och för vem:** Tidslinjen är "det enda man måste röra" enligt UX-översikten, men ser ut som en färgglad streckkod. Persona H (tangentbord) fastnar i hundratals stopp utan tidsordning. Persona C behöver stora träffytor. Rör M1 och M5.
- **Allvar:** medel
- **Förslag:** Ta markeringarna ur tabbordningen (`tabindex="-1"`) och låt reglaget vara ett stopp med piltangenter, Page Up/Down och en tangent för "nästa händelse"; listan Samtidigt i världen är det fullvärdiga textalternativet. Lägg en "Hoppa till tidslinjen"-länk först i sidan. Visa i översikten bara romberna och krigens spann, och fler markeringar när man zoomar eller fokuserar. Rita segmentgränserna synligt (ett glapp eller ett annat streck). Lägg en rad teckenförklaring under tidslinjen första besöket. Ge tidslinjens markeringar samma osynliga utökade tryckyta som stegknapparna redan har (pseudo-element), och låt spann ligga under prickar, utan att ändra hur de ser ut.
- **Insats:** medel

### 9. Kartans tecken kräver en manual

- **Observation:** Hjälpens avsnitt "Markörer, klungor och religioner" har sju förklaringar (`index.html`, `help.m1`–`help.m7`): samma mässingsmedalj för alla händelser med kategorins symbol och inre färg; en båge under medaljen som är "en liten tidslinje" (vänster del: har hänt, höger: kommer senare, syns när man zoomar in); streckad båge för osäker uppgift; en guldprick för viktig händelse; klungor med ring i kategorifärger; religionssymboler; och rikessymboler som också är runda mässingsmedaljer. Till det kommer 14 kategorifärger, streckade gröna linjer (resor, "streckad = osäker väg"), rödrandiga krigsområden, rött × på tidigare slag och rikesområden i pastellfärger. Händelsemedalj och rikessymbol är svåra att skilja åt på klotet (`dator-04`).
- **Orsakstyp:** B
- **Varför det är ett problem, och för vem:** Ju fler visuella variabler som bär betydelse, desto mer måste man lära sig innan kartan säger något. Lins 10 frågar "förstår jag symbolerna utan manual?"; svaret är nej för bågen och prickarna. 14 färger går inte att skilja säkert för färgblinda (persona H), även om symbolerna hjälper. Rör M1 och M5.
- **Allvar:** medel
- **Förslag:** Skär ned till högst fem tecken som bär betydelse: kategori (symbol + färg), viktig (storlek i stället för prick), osäker (streckad kant), klunga, och rike (en annan form, till exempel sköld eller fana i stället för rund medalj). Låt etikettens text bära tidsläget ("pågår", "slut 1912") i stället för bågen under medaljen. Visa förklaringen där tecknet är: vid hovring eller långt tryck på ett tecken, och som en liten teckenförklaring som kan fällas ut i hörnet av kartan, inte bara i Hjälp.
- **Insats:** medel

### 10. Knappar hoppar i år och kamera utan att säga det

- **Observation:** **Visste du?** flyttade året från 1325 till 491 f.Kr. och kameran till en annan plats (eget prov; adressen blev `#y=-490`). **Ett år, en plats** hoppar till 1889. Tursteg och fokus flyttar år och zoomar (`dator-08`: kartan zoomar in på Europa). Knapparnas namn säger inget om att de byter år; bara fokusläget har en "flyttades"-rad med väg tillbaka (`focus-moved` i `index.html`). Klick i tidslinjen hoppar direkt (1325 → 201 f.Kr. → 1160 → 1845 i mina prov) och Samtidigt-kortet byts eller försvinner, vilket är väntat, men vid hopp från ett kort är det inte väntat.
- **Orsakstyp:** L
- **Varför det är ett problem, och för vem:** "Förutsägbarhet: inga överraskande hopp av år eller kamera" är en av lins 1:s frågor. Antagande: den som läser kortet och trycker "Visste du?" tror att hen får veta mer om det hen läser, och tappar plats och år. Persona D "frustreras av att inte hitta tillbaka".
- **Allvar:** medel
- **Förslag:** Säg vart knappen går: "Visste du? (491 f.Kr.)" eller en pil med årtalet. Gör fokusets "flyttades"-rad allmän: efter varje hopp som inte kom från tidslinjen visas en kort rad "Du gick från 1325 till 491 f.Kr. · Tillbaka", som försvinner efter några sekunder. Bakåt i webbläsaren fungerar redan med adressen (#501) och kan nämnas i Hjälp.
- **Insats:** liten till medel

### Mindre iakttagelser

- **Sök och följ uppdateras inte när året byts medan den är öppen** (eget prov via adressen: listan säger "±480 år från 501 f.Kr." när året är 1700; samma i `dator-09`). Bör provas med tidslinjen innan det blir ett issue.
- Årtalet är klickbart, men pennan syns bara vid hovring eller fokus (`dator-19`); i mobil finns ingen synlig ledtråd. Platshållaren i årsrutan klipps: "till exempel 1986 eller".
- Era-raden och gruppetiketterna är 11 px och 9,5 px versaler i monospace; kontrasten är god (8:1 och 9:1, mätt), men storleken är liten för den rad som förklarar tidsfönstret.
- Bågarna mellan kortets platser ritas ibland ut över klotets kant så att de ser ut att komma från knappraden (`dator-07`, egen skärmbild vid 1612).
- Statusraden "Fun facten: källkontrollerad" i monospace tar en egen rad i kortet; i faktarutan står både "osäkert", "Historisk osäkerhet", "två källor stämmer" och "Kontrollen gäller källorna, inte om historien är säker". Det är fyra signaler om säkerhet i samma ruta (jfr #613 och #786).
- I turlistan har bara lektionsturerna en synlig knapp ("Starta som lektion"); övriga turer startas genom att klicka på rubriken, vilket inte syns (`dator-15`).
- Hjälpen skriver "Historia Globen" (utan bindestreck) medan sidan heter "Historia-globen".
- Adressen följde inte med direkt när jag klickade i tidslinjen (stod kvar på `#y=1325` vid år 201 f.Kr. efter 1,5 s, uppdaterades senare). Om Dela trycks i det ögonblicket kan fel år delas. Att kontrollera.
- Krigskortets chips listar händelser från 1912–1914 vid år 1916 (`dator-07`), vilket förstärker fynd 2.

---

## Skalning för kommande lager och lägen

### Vad som går sönder först

1. **Toppraden.** Tio knappar får redan inte plats i iPad stående. Tidsintervall och epoker (6.1), teman (6.2), regionkort (6.3) och jämförelse (9) är alla tänkbara nya knappar. Utan en regel om vad som får stå i raden bryts den i fler rader eller hamnar i Mer, som redan blandar Källor, Hjälp, spel, Dela och språk.
2. **Lager och områdeslagren.** Riken, Religioner, Dagens gränser och Krigsområden fyller alla ytor med färg, och de kan vara på samtidigt. Nästa områdes- och bildlager (historiska kartor och skolatlasens bildlager i 9, forntida kartor i 8, regionernas gränser i 6.3) konkurrerar om samma yta och samma färger. Med dagens kryssrutor går det att slå på fyra ytlager samtidigt och få en oläslig karta, och listan växer förbi de 42 kontroller den har i dag.
3. **Tidslinjen.** En enda segmenterad skala från 3000 f.Kr. till i dag med 616 markeringar klarar inte människans långa historia (7) eller jordens historia (8). "Visar ±38 år" blir meningslöst när steget är tusentals eller miljontals år, och markeringarna blir ännu tätare. Händelser före 3000 f.Kr. finns redan i data och i tabbordningen men inte på skalan.
4. **Lägena.** Fokus, tur, lektion, jakt, quiz, introduktion och uppspelning har var sin rad, var sitt ord för "nästa" och "ut". Intervall (som utesluter Fokus och uppspelning), tema som grupp i Fokus och jämförelse av två tider lägger till fler. Utan en gemensam lägesrad blir det fler rader ovanför tidslinjen och fler sätt att fastna.
5. **Ordet "Samtidigt".** "Jämför två tider" (9) handlar om två år *på en gång*, och ett tidsintervall (6.1) gör "samtidigt" till ett spann. Om ordet inte får en enda betydelse nu blir det ännu svårare då.

### Designprinciper som skulle hålla

1. **Ett läge i taget, en lägesrad.** Varje läge (fokus, tur, tema, epok, intervall, jämförelse, lektion) visas i samma rad på samma plats, med lägets namn, en huvudknapp och "Avsluta". Det här är UI-delen av lägeskontraktet (#893) och bör skrivas in där innan #755.
2. **En bakgrund och högst två överlägg.** Ytlagren (Riken, Religioner, Dagens gränser, historiska kartor, klimat, nattljus) är alternativ i en grupp "Bakgrund", där man väljer ett (radioknappar). Punkter och linjer (händelser, resor, krigsområden) är överlägg som kan slås på. Ett nytt bildlager blir ett nytt alternativ i listan, inte en ny kryssruta som kan krocka.
3. **Ett ord, en betydelse.** Ordlistan (13) blir en grind: ett nytt läge eller lager får inte återanvända "Vy", "Samtidigt", "Utforska", "Fokus" eller "Upptäckt" i en ny betydelse. Nya ord läggs i ordlistan och i alla fem språk i samma pull request.
4. **Tid i nivåer, inte fler knappar.** Tidslinjen får zoomnivåer (djup tid, historisk tid, år, månad och dag) där fönstret ritas som ett band runt tummen. Versionerna 7 och 8 blir nya nivåer på samma reglage, inte nya reglage.
5. **Visa mer när man ber om det.** Första besöket visar år, tid, globen och ett samband. Fördjupningar visas där de hör hemma: ett krigsområde erbjuder "Följ kriget", ett rike "Följ riket", en region "Regionkort". Toppraden växer inte för varje ny funktion.
6. **En läsplats per bredd.** Faktaruta, kort och listor delar en plats (dator: höger sida; mobil: arket). Att öppna en ny läsyta stänger eller fäller ihop den förra, så att klotet alltid syns.

---

## Där dokumentationen och appen inte stämmer

Utöver inventeringens avsnitt 8:

| Dokument säger | Appen visar |
|---|---|
| 05, Tillgänglighet: "minst 24 px träffyta på dator" | 616 knappar på tidslinjen är 6 × 6 px eller 4 px höga, och spann ligger över prickar så att de inte går att peka på. |
| 05, Informationsarkitekturen: "Faktaruta (dator: sida; mobil: ark)" | På dator öppnas händelsens faktaruta mitt på skärmen över globen när panelen är öppen (`dator-03`), inte vid sidan. |
| 05, skissen: tidsraden "◀ ▶ ⏵ hastighet" | Raden har sju knappar −100, −10, −1, ▶, +1, +10, +100 och hastigheten; i fokus försvinner ▶ och flyttar till fokusraden. |
| [13-ordlista.md](../produkt/13-ordlista.md): "Samtidigt: knappen och panelen" | Ordet är också kortets typetikett, en romb på tidslinjen och en pausregel (fynd 2). Ordlistan beskriver inte tidsfönstret (±N år) alls, fast det styr vad "samtidigt" betyder i appen. |
| 13: "Fokusläge: läget där ett krig, rike eller en religion följs" | Sök och följ erbjuder också länder och resor att följa (flikarna Försvunna länder, Resor). |
| 05, Tillgänglighet: tangentbord nämns som befintligt stöd | Det tar 40 tabbsteg från sidans början till tidslinjen, och därefter 616 stopp i dataordning (fynd 8). Stödet finns men är inte användbart i praktiken för en hel genomgång. |
