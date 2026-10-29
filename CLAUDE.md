# CLAUDE.md – Historia-globen

Instruktioner för Claude Code i det här repot. Läs hela filen innan du ändrar något.

## Projektet

Historia-globen är en snurrbar jordglob i webbläsaren. Man drar i tiden och ser vad som hände **samtidigt** på olika håll i världen. Fun facts lyfter fram oväntad samtidighet, till exempel att pyramiderna byggdes medan de sista mammutarna levde. Det är ett hobbyprojekt med öppen källkod. På sikt kan samma innehåll visas på en fysisk glob.

- Ägare: Rikard. Skriv till honom på **svenska**, kort och tydligt. Han är projektledare, inte utvecklare, så förklara vad som ändrats och varför, inte bara hur.
- Live-prototyp (version 1, ursprunglig): https://claude.ai/artifact/SrLqWzKfXNE9RUiKUd99Lg
- Planeringsdokument (vision, benchmark, hårdvara, beslut): finns i Rikards Claude-projekt "Historia-globen". Du kommer inte åt det, så de viktiga besluten är upprepade här.

## Arkitektur (beslutad, ändra inte utan att fråga)

1. **Inget byggsteg.** Vanliga ES-moduler som webbläsaren läser direkt. Inga ramverk (React m.fl.), ingen bundler, ingen server-backend. Det ska gå att köra med `python3 -m http.server`.
2. **Data skild från kod.** All innehållsdata ligger i `data/*.json`. Hårdkoda aldrig händelser, texter eller årtal i JS.
3. **Ett år styr allt.** `Timeline` äger nuvarande år och skickar `change`. Lager och paneler lyssnar och ritar om.
4. **Ekvirektangulär rendering (beslut 1).** Allt som ritas på klotet ritas först på en ekvirektangulär canvas (`baseCanvas` 4096×2048 för grundkartan, `overlayCanvas` 4096×2048 för lager) som läggs på sfären. Klickbara markörer och bågar ligger som 3D-objekt ovanpå. Skälet: samma platta bild ska kunna skickas till en fysisk globskärm ("Platt vy" visar den). Bryt inte detta.
5. **Lager som moduler (beslut 2).** Fem lagertyper: punkt (händelser), linje (handelsvägar, migration, fronter), område (riken, utbredning), bildlager (nattljus, klimat) och tur (guidade fördjupningar som data). Varje lager har samma gränssnitt: `update(state)` som returnerar det som syns, och `drawOverlay(ctx, W, H)`.
6. **three.js** laddas som ES-modul från `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js`. Exakt version, ändra bara medvetet. Inga andra externa beroenden utan att fråga.

### Filstruktur

```
index.html
css/style.css
js/main.js            startar allt och kopplar ihop delarna
js/model.js           språk, kategorier, granskningsstatus, tidsformat, laddning
js/globe.js           3D-globen, kamera, styrning, ekvirektangulära canvasar, bågar
js/timeline.js        tidsreglage, segmenterad skala, uppspelning
js/layers/events.js   punktlager: händelser
js/ui/panel.js        "Samtidigt i världen" per världsdel, filter, detaljvy
js/ui/funfact.js      Samtidigt-kortet (fun facts m.m.) och bågar
js/ui/sources.js      sidan Om källorna
data/events.json      händelser
data/funfacts.json    fun facts (kopplade till händelse-id)
data/sources.json     källregister
data/land.json        grundkarta: Natural Earth 1:50m, färdigprojicerad SVG-path i 4096×2048
data/empires/         riken: index.json och en fil per rike, byggs med tools/riken.py ur Cliopatria
data/styles.json      bildstilar efter tidsålder och plats (ramar och promptar)
images/events/        bilder till händelser, <händelse-id>.webp, 800 × 600
images/incoming/      Rikards nya bilder, innan de konverteras
tools/                hjälpskript som körs för hand (riken, bildpromptar, bildkonvertering)
docs/bildpromptar.md  färdiga promptar för illustrationer
```

Nya lager läggs i `js/layers/`, ny UI i `js/ui/`, ny data i `data/`. Uppdatera filstrukturen i README.md när den ändras.

## Datamodell och standarder (beslut 3, 6, 8)

- **År** = heltal med astronomisk årsräkning (ISO 8601): `0` = 1 f.Kr., `-1` = 2 f.Kr., `-2599` = 2600 f.Kr. Konvertering: *N f.Kr.* → `1 - N`. Visningen ("f.Kr.") görs i `model.js`.
- **Osäkerhet** = EDTF-sträng i fältet `edtf`: `~` ungefär, `?` osäker, `/` spann, `../` öppen start, `/..` pågår. År med fler än fyra siffror skrivs `Y-66000000`.
- **Precision** = Wikidatas skala i fältet `precision`: 0 miljard år, 6 årtusende, 7 århundrade, 8 decennium, 9 år, 10 månad, 11 dag.
- **Fälla:** Wikidatas JSON saknar år 0 (1 f.Kr. kommer som -1). Lägg till 1 på alla år före vår tideräkning vid import.
- **Plats** = GeoJSON i WGS 84, `[longitud, latitud]`. Områden blir `Polygon`/`MultiPolygon`. Valfritt `locationPrecision`: `region` eller `country` när platsen är ungefärlig.
- **Texter** lagras per språk: `{ "sv": "...", "en": "...", "fr", "de", "es" }`. Svenska först. Saknas ett språk visas engelska, sedan svenska (`t()` i `model.js`).
- **Kategorier** (fast lista, `CATEGORIES` i `model.js`): natur, manniskan, civilisationer, religion, vetenskap, upptackter, krig, kultur, sport, ekonomi, halsa, klimat, rymden. Nya kategorier kräver Rikards ok.
- **Händelse**, obligatoriska fält: `id` (läsbart, unikt), `category`, `start`, `end`, `precision`, `edtf`, `location`, `place`, `title`, `summary`, `sources` (lista med id från sources.json), `review`. Valfritt: `wikidata` (Q-id, bara om du har verifierat det eller om det kommer från en datakälla vi litar på, se Beslutslogg). Valfritt `note` (`title`, `text`): en extra ruta i faktarutan, till exempel "Om år 0".
- **Religioners grundande:** en händelse med `"founding": true` och `"religion": "<religionens id i religions.json>"`. Fokus på religionen börjar vid den första sådana händelsen och stannar vid de följande. Ikonen är `star`. Religioner som växte fram gradvis (judendom, hinduism, shinto, kinesisk religion) får ingen grundhändelse.
- **Krig och slag:** ett krig är en händelse med `"kind": "war"` och start och slut (spann). Slag och andra händelser i kriget pekar på kriget med `partOf` (krigets id). Krigets `location` är platsen där det började, med `locationPrecision: "region"`. Krigsområdet ritas runt krigets plats och de slag som har utkämpats. Utzoomat syns bara krigets enda viktigaste händelse (`"top": true`) och krigsområdet. I fokusläget syns krigets alla händelser med årtal, och uppspelningen pausar vid dem som har `"major": true` (går att stänga av i Lager). Valfritt fält `story` på kriget: `intro` (varför kriget började), `parties` (sidor med namn och deltagare), `outcome` (hur det slutade), `casualties` (döda, som spann) och `sources`. Det visas som ett kort när man börjar följa kriget och när uppspelningen når krigets slut.

## Källpolicy – viktigast av allt

Rikard är mycket mån om att inget påhittat hamnar på globen. Följ detta strikt:

1. **Ingen uppgift utan källa.** Varje händelse och fun fact pekar på minst en post i `data/sources.json` (id, titel, url, licens, datum då den kontrollerades).
2. **Granskningsstatus** i fältet `review`: `draft` → `source-checked` → `two-sources` → `human-reviewed`. Alla utom `draft` visas på globen. `two-sources` betyder att årtal och plats har jämförts med en andra, oberoende källa (till exempel Wikidata) och stämmer; båda källorna står i `sources`. Statusen syns i detaljvyn och under Om källorna, inte som eget märke på globen.
3. **Du får aldrig skriva fakta ur minnet.** Allt du lägger till är `draft` tills du har öppnat källsidan och sett att årtal, plats och påståenden stämmer. Då får du sätta `source-checked`.
4. **Du får aldrig sätta `human-reviewed`.** Det gör bara Rikard.
5. **Fun facts** som jämför saker behöver källa för alla led. Siffror i texten (till exempel "229 år") ska gå att räkna fram ur händelsernas årtal.
6. **Visa osäkerhet öppet** ("cirka", spann) i stället för falsk exakthet. Om källor är oense, skriv det.
7. Wikipedia räknas som sekundärkälla. Den duger för prototypen, men hellre den källa Wikipedia själv hänvisar till, eller forskningsdata.

## Licenser (beslut 10)

- Kod: **GPL-3.0** (`LICENSE`). Data i `data/`: **CC BY 4.0** (`data/LICENSE`). Namnet "Historia-globen" omfattas inte.
- Använd bara data vars licens är förenlig med detta: CC0, CC BY, public domain, eller GPL för gränsdata. **Inte** CC BY-NC, inte "all rights reserved", inte data med oklara villkor.
- Kopiera aldrig text från Wikipedia eller andra källor. Skriv egna korta sammanfattningar och länka källan.
- Ange varje ny datakälla i `data/sources.json` och i README:ns licensavsnitt.

## Bilder (#129)

Varje händelse kan få en bild i fältet `image` (fil, `kind`, stil, bildtext, kredit, licens, och för illustrationer prompten). Stilen följer tidsåldern och platsen enligt `data/styles.json`, och faktarutans ram följer stilen även när bild saknas.

1. **Riktig bild först.** Sök på Wikimedia Commons efter en historisk bild innan en illustration görs. Kontrollera licensen på filsidan och lägg filsidan som källa i `sources.json`. Tillåtet för historiska bilder: public domain, CC0, CC BY och CC BY-SA. Bilden behåller sin egen licens, som står i bildtexten.
2. **Illustrationer märks alltid** med en synlig bildtext, till exempel "Illustration i stil med …, inte en historisk bild". De får aldrig se ut som fotografier eller äkta dokument.
3. **Bilden förmedlar stämning, inte fakta.** Lägg inte in detaljer i bilden som inte stöds av händelsens källa.
4. **Respekt.** Profeten Muhammed avbildas aldrig; Hijra visas med landskap, karavan och arkitektur. Inga karikatyrer av folk, inga blodiga krigsbilder och inga riktiga personers ansikten i närbild.
5. **Spårbarhet.** Spara stil, verktyg, datum och exakt prompt för varje illustration i `image`.
6. **Filer.** `images/events/<händelse-id>.webp`, 800 × 600 pixlar, helst under 150 kB. `python3 tools/bilder_in.py` konverterar bilder från `images/incoming/`. `python3 tools/bildpromptar.py` skriver promptar till `docs/bildpromptar.md`. Lägg aldrig API-nycklar för bildverktyg i repot.
7. **Platshållare** har `"placeholder": true` och märks "Platshållare" i kortet tills den riktiga bilden finns.

## Utseende

Rikard gillar stilen. Behåll den:

- Mörkt observatorietema (avsiktligt bara mörkt), pergamentfärgat land på djupblått hav, mässing som accent.
- Typsnitt: IM Fell English (rubriker och årtal), Instrument Sans (brödtext), IBM Plex Mono (årtal och metadata).
- Alla färger som CSS-variabler i `:root`. Kategorifärgerna finns i `model.js`.
- Sidan ska fungera i mobilbredd (cirka 400 px) utan horisontell scroll.

## Testa innan du är klar

1. `python3 -m http.server 8000` och öppna http://localhost:8000.
2. Inga fel i konsolen. Globen snurrar, tidslinjen går att dra, uppspelning fungerar, fun facts dyker upp, "Platt vy" och "Om källorna" öppnas.
3. Kontrollera all JSON (`python3 -m json.tool data/*.json`) och att varje `sources`-id finns i `sources.json` och varje händelse-id i `funfacts.json` finns i `events.json`.
4. Testa både desktop och mobilbredd.

## Arbetssätt för idéer, beslut och ändringar

- **GitHub Issues är projektets idélista och backlog.** Varje idé, önskemål eller fel blir ett eget issue. Använd mallarna i `.github/ISSUE_TEMPLATE/` och etiketterna (version-2, idé, data, faktafel, källkontroll, utseende, utanför-kod).
- **Ny idé i chatten:** föreslå att skapa ett issue för den i stället för att bygga direkt, om det inte är en liten ändring. Ber Rikard om det, skapa issuet direkt.
- **"Ta issue #N":** läs issuet, ställ frågor om något är oklart, bygg på en egen gren och öppna en pull request som skriver `Closes #N`.
- **Pull requests** beskrivs på svenska: vad som ändrats, varför, och hur Rikard testar det. Små, avgränsade PR:er hellre än en stor.
- **Beslut:** när vi bestämmer något som påverkar arkitektur, datamodell, källor, licenser, kategorier eller utseende, lägg till det i "Beslutslogg" längst ner i den här filen (datum, beslut, kort motivering) i samma pull request.
- **Fråga först** innan du ändrar arkitekturen, lägger till beroenden, kategorier eller datakällor med ny licens.
- **Sådant som inte är kod** (namn, domän, fysisk glob, hårdvara, affärsfrågor) planeras i Rikards Claude-projekt "Historia-globen", inte här. Om sådant kommer upp: påminn Rikard om det och skapa högst ett issue med etiketten `utanför-kod` som anteckning.

## Nästa steg: version 2

Mål: visa att lagertypen **område** fungerar, med utbredning som förändras över tid.

1. **Ett rike som växer och krymper**, till exempel Romarriket eller Osmanska riket (fråga Rikard vilket). Datakälla: **Cliopatria** (Seshat), polity-gränser 3400 f.Kr.–2024 e.Kr., CC BY 4.0: https://zenodo.org/records/13363121 (artikel: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11822181/). Extrahera bara det rike som behövs, förenkla geometrin och spara i `data/` (håll filen liten). Rita områdena på `overlayCanvas` (beslut 1).
2. **Dagens landsgränser** som ett filter att slå av och på (Natural Earth, public domain). De ska vara av som standard, eftersom de inte stämmer historiskt.
3. **En religion som spreds**, som provexempel. Det finns ingen färdig global databas, så det blir några nyckelår med områden, var och en med källa.
4. **Lagerväljare** i UI:t, så att man kan slå av och på lager (händelser, riken, gränser, religioner).

Stanna efter version 2 och låt Rikard utvärdera innan mer data läggs in.

## Versionsplan

Hela planen finns som milstolpar och issues i GitHub. Efter version 2 kommer fyra faser och två parallella spår:

| Fas | Versioner | Innehåll |
|---|---|---|
| A: fler lagertyper | 3–5 | 3 Krig och slag, 4 Handelsvägar och upptäcktsresor, 5 Guidade turer |
| B: tidens djup | 6–7 | 6 Människoarter, 7 Djup tid |
| C: världen som karta | 8–10 | 8 Skolatlasen, 9 Flöden i nutid, 10 Rymden |
| D: bredd och användare | 11–15 | 11 Hela världen, 12 Språk och sök, 13 Skolläge, 14 Vetenskap och medicin, 15 Temavyer (musik, litteratur, filosofi, ekonomi, Sverige) |

Parallella spår:
- **Riken** (paket R1–R6) börjar efter version 2.
- **Hårdvara** (H1–H3) börjar efter version 3. Det är anteckningar, och planeringen sker i Rikards Claude-projekt.

Regler:
- **Varje version slutar med att Rikard utvärderar** innan nästa börjar.
- **Stora datamängder fylls på först när tekniken för dem fungerar.**
- **Varje paket och varje version ska ha innehåll från flera världsdelar**, eftersom öppna data har slagsida mot Europa.
- Nya datakällor läggs in i README:ns licensavsnitt när de faktiskt används, inte innan.

## Öppna frågor (Rikard bestämmer)

- Ska projektet få en egen .se-domän, och behålls namnet Historia-globen eller blir det ett internationellt namn?
- Hur granskningen ska gå till framåt. Förslag: Rikard granskar fun facts, och händelser kontrolleras mot en andra oberoende källa.
- Vilket fördjupningsläge kommer först (till exempel andra världskriget)?

## Beslutslogg

Nya beslut läggs till sist, med datum, beslut och kort motivering.

| Datum | Beslut | Motivering |
|---|---|---|
| 2026-10-28 | GitHub Issues används som idélista och backlog, med issue-mallar och etiketter. Varje ändring görs i en pull request som stänger sitt issue. | Ett fast arbetssätt gör att idéer inte tappas bort och att det syns vad som är gjort och varför. |
| 2026-10-28 | Cliopatria används som den är: årtal, gränser, namn och Wikidata-id räknas som korrekta och får status `source-checked` utan egen granskning. Östromerska riket slutar 632 där Cliopatria går över till Bysantinska riket. Årtal före vår tideräkning tas oförändrade från Cliopatria. | Rikard vill inte granska källor i dagsläget. Cliopatria är en forskningsdatabas (Seshat) som räknas som tillförlitlig. |
| 2026-10-28 | Lagerbilden (`overlayCanvas`) och den platta bilden höjs från 2048×1024 till 4096×2048, samma som grundkartan. Lager ritar linjer, text och sken i storlek relativt bildens bredd. | Lagren blev suddiga vid inzoomning (#21). Beslut 1 behålls: allt ritas fortfarande på en platt bild. |
| 2026-10-28 | Versionsplan med fyra faser (A–D, version 3–13) och två parallella spår (Riken, Hårdvara) läggs in som milstolpar och issues. Varje version avslutas med Rikards utvärdering, och varje version ska ha innehåll från flera världsdelar. | Ger en överblick över hela projektet och motverkar slagsidan mot Europa i öppna data. |
| 2026-10-28 | Ny Version 14: Vetenskap och medicin (vetenskapliga genombrott och medicinska framsteg), sist i fas D. | Rikard vill ha med stora framsteg inom vetenskap och medicin som egen version. |
| 2026-10-28 | Fun facts blir ett eget lager i lagerväljaren, inte en kategori. När lagret är av visas inga fun facts och uppspelningen pausar inte vid dem. | Att visa fun facts samtidigt som riken och andra lager blir lätt rörigt. En fun fact kopplar ihop olika kategorier, så den passar inte som en kategori bland de andra. |
| 2026-10-28 | Religioner visas som de riken där religionen var statsreligion eller officiell religion (variant A), med gränser från Cliopatria och årtal för kristnandet från en källa per rike. Första exemplet är kristendomen 301–1500, ett urval av 36 riken. | Det finns ingen öppen data över var de troende bodde. Statsreligion går att belägga, och gränserna kommer från en källa vi redan litar på. |
| 2026-10-28 | Religionslagret visar alla religioner över hela tidslinjen: varje rike i Cliopatria får sin officiella religion eller huvudreligion ur faktarutan på rikets Wikipedia-sida. Där flera religioner nämns utan markerad officiell visas den först nämnda ljusare med streckad kant. Saknas uppgift visas inget. Från 1900 används Wikipedias tabell Religion by country för länder vars faktaruta saknar religion. Religionsdatan laddas först när lagret slås på. | Rikard vill se religionerna spridas och finnas kvar fram till i dag, inte bara ett urval kristna riken fram till 1500 (#92). |
| 2026-10-28 | Krig modelleras som händelser med `kind: "war"` och spann, och slag pekar på sitt krig med `partOf`. Krigsområdet räknas fram ur krigets och slagens platser (konvext hölje) i stället för att lagras som egen geometri. Första kriget är trettioåriga kriget. | Gör det möjligt att klicka på ett krig och se dess slag (#27), utan att hitta på gränser för krigsområden som saknar källa. |
| 2026-10-28 | Bara de absolut viktigaste händelserna i ett krig (`major: true`) visas som punkter på kartan och i listan Samtidigt i världen. Övriga slag finns i krigets lista i detaljvyn och används för krigsområdet. | Det blev för rörigt med alla slag på kartan (Rikards utvärdering). |
| 2026-10-28 | Ny granskningsnivå `two-sources` ("Två källor stämmer") mellan `source-checked` och `human-reviewed`. Den syns i detaljvyn och under Om källorna, inte på globen. Wikidata används som andra källa. | Ett steg mot säkrare uppgifter utan att Rikard behöver granska allt själv (#16). |
| 2026-10-29 | Krigsområdet ritas som i en historisk kartbok: avrundat område med hel kantlinje och diagonal skraffering. Utzoomat syns bara krigets viktigaste händelse (`top`); i fokusläget syns krigets alla händelser med årtal. Ny svärdsikon. | Det röda fältet var för genomskinligt och kartan för rörig utzoomat (Rikards feedback, #111). |
| 2026-10-29 | Ny layout: globen får hela skärmen. "Samtidigt i världen" är en utfällbar meny bakom en knapp uppe till höger, och faktarutan om en händelse är ett eget kort som stängs med ett kryss. I lagermenyn väljer man vad uppspelningen ska pausa vid (fun facts, när ett krig bryter ut), och valet sparas. | Panelen tog för mycket av skärmen, och olika användare vill pausa vid olika saker (Rikards feedback, #112 och #114). |
| 2026-10-29 | Fokusläget blir en egen funktion bakom knappen Fokus, där man väljer vad man följer: ett krig, ett rike eller en religion (senare även epidemier). Riken som hör ihop (Romarriket i flera skeden) grupperas med `groups` i `empires.json`. I fokus visas det man följer även om lagret är avslaget, och riken och religioner göms för varandra så att områdena inte täcker varandra. | Fokusläget ska inte bara gälla krig (Rikards feedback, #113). |
| 2026-10-29 | Religionslagret: anger rikets faktaruta ett årtal för religionen ("c. 200 AD", "from 6th century") visas religionen först från det året. Ord som "Pre-Islamic" räknas inte som islam, och "Arian" måste vara ett eget ord (inte "variant", "Hungarian"). | Kristendomen visades 401 f.Kr. och islam 301 f.Kr. på grund av feltolkad text (#118). |
| 2026-10-29 | "Samtidigt" i tre nivåer: kategorifiltren ligger i Lager-menyn, listan "Samtidigt i världen" är en bredare låda grupperad per världsdel (grov indelning efter koordinater i `model.js`), och fun fact-kortet blir Samtidigt-kortet med typ (Fun fact, När ett krig bröt ut). Kortet kan fällas ihop till en flik, och då pausar uppspelningen inte vid det. Korten om krig byggs ur händelserna (inom 5 år från krigets start), inte som egen data. | Listan var för kompakt att läsa och kortet syntes alltid (Rikards feedback, #120). |
| 2026-10-29 | Fokusmenyn visar bara det som överlappar tidsepoken man står i (tidslinjens fyra avsnitt), närmast först. Resten finns bakom "Visa alla". | Med många krig, riken och senare djup tid blir menyn annars lång och full av sådant som inte hör till tiden (Rikards feedback, #121). |
| 2026-10-29 | Bysantinska riket (633–1474 i Cliopatria) läggs till i Romarrikets grupp, som fortsättningen på Östromerska riket. Romarriket i fokus går därmed 751 f.Kr.–1474. Fokusmenyn visar det som pågår inom fyra gånger tidslinjens fönster runt året (vid 1325 cirka ±150 år), i stället för hela tidsepoken. | Romarriket slutade för tidigt, och trettioåriga kriget syntes i menyn 1325 (Rikards feedback). |
| 2026-10-29 | Ny Version 15: Temavyer (musik, litteratur, filosofi, ekonomi och företag, Sverigevyn), så att Version 13 bara blir skolläget. | Temavyerna byggs likadant och hör ihop (Rikards beslut). |
| 2026-10-29 | Riken ligger i en fil per rike, `data/empires/<rike>.json`, med `data/empires/index.json` (namn, färg, tidsspann) som laddas vid start. Ett rike laddas när året närmar sig dess tid eller när man väljer det i Fokus. Filerna byggs med `tools/riken.py` ur Cliopatria. Första paketet R1: Persiska riket, Makedoniska riket, Hanriket, Mauryariket, Osmanska riket, Mongolriket med khanat och Brittiska imperiet. | Med fler riken blir en enda fil för stor att ladda vid start (#67). |
| 2026-10-29 | Bilder med stil efter tidsålder (#129): riktig historisk bild först (public domain, CC0, CC BY eller CC BY-SA, med filsidan som källa), annars en illustration i tidens bildtradition som alltid märks "inte en historisk bild" och sparas med verktyg, datum och prompt. Faktarutans ram följer tidsåldern (`data/styles.json`, tio grundstilar och regionala varianter). Undantag från beslut 10: bildfiler får vara CC BY-SA och behåller sin egen licens. Ersätter vinjetterna i #127. | Rikards instruktion: bilderna gör kortet levande, och stilen visar tiden. Märkning och respektregler skyddar mot att illustrationer tas för fakta. |
| 2026-10-29 | Krigsfokus med berättelse (#122): när man följer ett krig visas först ett kort med orsak och parter, och när uppspelningen når krigets slut ett kort med utgång och antal döda. Uppgifterna ligger i krigets fält `story`, med källa. Pausen vid krigets stora händelser är ett val i Lager (på som standard). | Rikard vill förstå varför kriget började och vad det ledde till, inte bara se slagen. |
| 2026-10-29 | Religioners grundande som händelser (#123): Jesu födelse (cirka 6–4 f.Kr.) och korsfästelsen (år 30 eller 33), Muhammeds första uppenbarelse (610), Buddha (500- eller 400-talet f.Kr.) och Guru Nanak (1469–1539). Jesu födelse har rutan "Om år 0" (Dionysius Exiguus, inget år 0, osäkert födelseår). Fokus på en religion börjar vid grundandet och stannar vid grundhändelserna; religionslagret visar fortfarande statsreligion. | Rikard vill lyfta fram när en religion grundas, inte bara när den blev statsreligion. |
| 2026-10-29 | Årtal i Fokus som inte vilseleder (#138): riken visar "kartdata" med Cliopatrias spann, religioner visar grundandet där det går att belägga och annars "statsreligion på kartan", med en fast förklaring under rubrikerna. Romarrikets grupp heter "Rom: kungadöme, republik, kejsardöme och Bysans", och Alexander tas bort ur Makedoniska rikets namn. | Ett användartest visade att spannen lästes som rikens och religioners livslängd, och att Osmanska riket fick två olika årtal. |
