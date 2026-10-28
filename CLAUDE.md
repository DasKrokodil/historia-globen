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
js/ui/panel.js        "Samtidigt i världen", filter, detaljvy
js/ui/funfact.js      fun facts-kort och bågar
js/ui/sources.js      sidan Om källorna
data/events.json      händelser
data/funfacts.json    fun facts (kopplade till händelse-id)
data/sources.json     källregister
data/land.json        grundkarta: Natural Earth 1:50m, färdigprojicerad SVG-path i 4096×2048
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
- **Händelse**, obligatoriska fält: `id` (läsbart, unikt), `category`, `start`, `end`, `precision`, `edtf`, `location`, `place`, `title`, `summary`, `sources` (lista med id från sources.json), `review`. Valfritt: `wikidata` (Q-id, bara om du har verifierat det eller om det kommer från en datakälla vi litar på, se Beslutslogg).

## Källpolicy – viktigast av allt

Rikard är mycket mån om att inget påhittat hamnar på globen. Följ detta strikt:

1. **Ingen uppgift utan källa.** Varje händelse och fun fact pekar på minst en post i `data/sources.json` (id, titel, url, licens, datum då den kontrollerades).
2. **Granskningsstatus** i fältet `review`: `draft` → `source-checked` → `human-reviewed`. Bara de två sista visas på globen.
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
| D: bredd och användare | 11–14 | 11 Hela världen, 12 Språk och sök, 13 Skolläge, 14 Vetenskap och medicin |

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
