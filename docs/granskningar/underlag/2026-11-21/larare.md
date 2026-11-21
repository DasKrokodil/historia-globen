# larare: granskning före v6.5.0

## Omfattning och stickprov
- Jämförelse 1a981da0..HEAD (HEAD 1bd96bae). Läste hela diffen för `data/turer/` (9 filer och den nya `linjer/muren-ming.json`), `data/uppdrag.json`, `js/ui/lesson.js`. Läste nuvarande kod för tidsreglagen (`js/time-scale.js`, `js/ui/level-switch.js`, `scaleText`/`valueText` i `js/timeline.js`), händelsekortets datumrad och panelens tidsgrupper (`js/ui/panel.js` 60–140, 285–293, 575–610, 980–1012), turkortet (`js/ui/tour.js` 395–500), utskriften (`js/ui/print-sheet.js`, commit 56e8ba5a).
- Texter: alla nya/ändrade nycklar i `data/ui/sv.json` för tid, reglage, panel, kort, plats, lektion och tur (cirka 60 st, ur underlaget `andrade-texter-sv.md`). Alla fem lektionernas lärarfält (`lesson.*`) och alla tre jakterna, med tilltal på de/es/fr.
- Beslut: 2026-11-19-tva-reglage-1958, 2026-11-19-vaxlaren-a2-1959, 2026-11-18-panelens-tre-tidsgrupper-1312, 2026-11-08-tilltal-efter-alder. UX-rapporten 2026-11-18-lander-och-regioner-1853 (avsnittet om läraren).
- Lgr22: öppnade Skolverkets kursplan i historia (https://www.skolverket.se/undervisning/grundskolan/laroplan-lgr22-for-grundskolan-samt-for-forskoleklassen-och-fritidshemmet/curriculums/LGR22/GRGRHIS01, 2026-11-21). De fem perioderna i `data/perioder.json` (lgr22) har samma årtal och årskurser som sidan: 800–1500, 1500–1800, 1800–1900 (åk 4–6), 1850–1950 och 1900–nutid (åk 7–9). Lektionernas läroplanskopplingar (5 av 5) stämmer med rubrikerna på sidan.
- Bilder per turssteg: alla 10 turer räknade (steg med `open`-händelse eller egen `image`).
- Mått: `python3 tools/tackning.py`. OBS: verktyget skrev av misstag `docs/granskningar/tackning-2026-11-21.md` i repot. Jag flyttade filen direkt till scratchpad (`.../scratchpad/tackning-larare.md`), och `git status` är ren igen.
- Bra för klassrummet (kort): "Det sägs" och "Vad källorna säger" i turen om myter, linjen för Mingmuren med "handritad av en privatperson och sträckningen är ungefärlig" (källkritik direkt i texten), "Följ området som i dag är Sverige" i platskorten och "Riket kan ha haft andra gränser än landet har i dag" (`facts.placesNote`). Lärartexten för andra världskriget varnar nu för fotografierna från Auschwitz och atombomberna. "≈ N år sedan" med en förklaring av f.Kr. Raden "Inga fynd i vår data …" säger att det är vår data som är tom, inte historien.

## Blockerande
Inga.

## Bör rättas
1. **"Strax före eller efter" i förhistorien betyder tusentals år.** Panelens grupp `panel.groupNear` ("Strax före eller efter", beslut 1312, 2026-11-18) kombineras med Samtidigt-fönstrets golv på ±10 000 år före 10 000 f.Kr. (beslut 1958, punkt 11). Raderna i gruppen får då avståndet i klartext, till exempel "8 000 år före" (`offset`, panel.js 580–584), under rubriken "Strax". Det förstärker just det missförstånd som linsen ska bevaka: att det som ligger nära på reglaget hände nästan samtidigt. `time.windowNote` säger rätt ("inte samtida, bara nära i tid"), men rubriken säger emot den. Förslag: i reglaget Före 3000 f.Kr. (eller när fönstret är större än cirka 100 år) bör rubriken vara neutral, till exempel "Före eller efter, inom ±{n} år". Det gäller fem språk. Rubriken är beslutad, så **det här är DasKrokodils beslut**. Claude Code bygger efter hans ja. Inget öppet issue hittades med sökningen "Strax före".
2. **Två likadana (i) i samma datumrad för alla 76 händelser före 10 000 f.Kr.** Det ena (i) är osäkerhetsmärket (`unc-mark`). Det andra förklarar "år sedan" (`ago-info`). Båda har klassen `review-info` och bokstaven "i" (panel.js 131–137 och 1010). Mätt: alla 76 synliga händelser med `start < -9999` har ett osäkert datum (`~`, `?` eller precision under 9), så alla visar båda. En elev kan inte se vilket (i) som förklarar vad. Förslag: slå ihop förklaringarna bakom ett enda (i), eller ge (i) för "år sedan" ett annat utseende. Den som bör ta det är `ux-tillganglighet` plus DasKrokodil, eftersom #1979 beslutade om formen.
3. **Produktdokumentationen är inaktuell på flera punkter** (06-granskningsperspektiv, "Att kontrollera vid uppdatering"):
   - `docs/produkt/05-ux-oversikt.md:50` och `docs/produkt/13-ordlista.md:31` säger att bandet har "Visa hela globen". Bandet har "Lämna lektionen" (`lesson.exit`, index.html:105).
   - `05-ux-oversikt.md:84–85` säger "Visa i regionvyn". Knappen heter nu "Visa på kartan" (`place.regionMap`, `place.flatMap`).
   - `13-ordlista.md:17` citerar tidsfönstret som "visar också det som hände 38 år före och efter". Texten är nu "{where} · även {n} år före och efter" (`time.windowYearsWords`).
   - Ordlistan saknar posterna Tidsreglage, "Före 3000 f.Kr." och "3000 f.Kr.–i dag", dörren, "år sedan" och de tre tidsgrupperna i Samtidigt.
   - `03-anvandningsfall-och-funktioner.md` beskriver tiden som "Tidslinje (segmenterad skala)" (rad 51). Det finns inget användningsfall för att byta reglage och utforska förhistorien, och inget för att följa ett land, Länder och landskap eller regionvyn. UC13 säger "Mer → Quiz", men quizet nås bara från För lärare (index.html:201).
   - `06-granskningsperspektiv.md:116` ("Vad linsen har sagt hittills") nämner inte lärarens fynd i release-granskningarna v6.4.0 och v6.5.0.
   - Den som bör ta det är Claude Code, i en dokumentations-PR som inte räknas mot taket.
4. **Lärarens väg från länk till blad: uppdraget syns inte på papper.** #1940 (56e8ba5a) tog bort lektionsuppdraget från elev- och lärarbladet eftersom det inte rymdes på A4. Läraren får därför inte veta på bladet att lektion 2 och andra världskriget slutar med en Samtidighetsjakt. Redan känt: #1710, punkt 2. Punkt 1 är byggd i #1943. Punkterna 2–4 är öppna, bland annat Songhais lärarfält, som fortfarande saknar antal steg och "Begrepp" (jämför Västrom och Han i `lesson.teacher`).

## Smått
- `panel.later` och `time.afterLabel` heter nu "om {n} år". Om valt år är 1500 kan "om 21 år" läsas som framtid räknat från i dag av en elev i åk 4–6, medan "21 år före" är entydigt. Förslag: "{n} år efter". Kräver ett ja (#1938 valde orden).
- Platskortets flagga har bildtexten "Sveriges flagga" (`data/platser.json`, sverige.emblems) oavsett vilket år som visas. Bildtexten kan förstärka bilden av nationen som något som alltid funnits. Förslag: "Sveriges flagga i dag", eller årtalet då flaggan infördes, med källa.
- Förhistoriens reglage har två halvor med samma bredd: 90 000 år och 7 000 år (time-scale.js:23–24). Räknat med `yearsPerTenth` blir en tiondel av reglaget cirka 18 000 år i första halvan och cirka 1 400 år i andra, mot cirka 81 år efter 1800. Det står bara i skalraden medan man drar. Lärarstödet för ett reglage som inte är linjärt är redan känt: #1103 och #1107. Hur nordisk stenålder delas vid skarven -3000/-2999 är redan känt: #1343.
- Exemplet "Före 3000 f.Kr.: en tiondel ≈ 490 år" i `js/timeline.js:47` och i beslutet 2026-11-19-vaxlaren-a2-1959 (punkt 7) stämmer inte med koden. 490 är år per pixel på 400 px, inte en tiondel. Bara dokumentationen är fel; UI räknar rätt. Den som bör ta det är arkitekten eller utvecklaren.
- "≈ N år sedan" räknas ur `e.start` (panel.js:1003). För ett spann som "cirka 53 000–50 000 f.Kr." visas bara den äldsta änden. Förklaringen i (i) säger inte det.
- #1875 (bilder till övriga turer): alla 8 händelser som issuet listar har nu bild. Issuet kan föreslås stängt. Steg utan `open`-händelse har däremot ingen bild alls: Han 6 av 6, Songhai 7 av 8, Västrom 6 av 7, Vikingatiden `island`, och "Det här har du hört" 4 av 6. Det blir ett eget önskemål, inte en del av #1875.
- #1708 och #1709 är rättade: index.html:105 har "Lämna lektionen", och `teacher.shareText` och `place.enterBusy.tur` har nya namn. #1715 är bara rättat i del 1 (hårt mellanrum på fr och es, #1880). "years 4–6/7–9" utan förklaring på engelska, "Answer direction" (Han, Songhai, Västrom), "Faktenkasten" (`uppdrag.json`, två ställen) och "At the same time in the world" (`turer/index.json`) står kvar. Redan känt: #1715.

## Möjliga sakfel till andra experter
- `historiker`: illustrationen `images/events/lindisfarne.webp` används i lektion 2 (åk 4–6) och i turen om vikingahjälmar. Den visar ett stort klosterkomplex i sten med torn. Prompten ber att undvika arkitekturdetaljer som källan inte stöder. Detta är ett antagande att kontrollera, inget belagt fel. Bilden är inte ändrad sedan v6.4.0.
- `sprak-de/es/fr`: jakten för 1945 har artigt tilltal i `task` och `reflection` (lektion för åk 7–9), och de två andra jakterna har du. Det följer beslutet efter ålder. Kontrollera bara att det är avsiktligt (#1710, punkt 1).

## Luckor (saknas)
Det här bygger på Skolverkets sida (öppnad 2026-11-21), på sökning i svensk titel och sammanfattning i `data/handelser/` (bara synliga händelser) och på `tools/tackning.py`. Inget är ur minnet.
- **Åk 7–9, "Demokratisering och ökad globalisering, cirka 1900 till nutid":** ingen tur och ingen lektion. Det finns händelser att bygga på: `koreakriget`, `kubakrisen`, `berlinmuren-byggs`, `berlinmurens-fall`, `sovjetunionens-upplosning`, `allman-rostratt-for-man-1911`, `kvinnlig-rostratt-danmark-1915` och `kvinnor-rostar-1921`. Sökningen gav inga träffar på folkhem, välfärd eller kvinnorörelse, som kursplanen nämner.
- **Åk 7–9, "Europeisk kolonisation och slavhandel":** händelser finns, till exempel `atlantiska-slavhandeln`, `afonso-i-kung-av-kongo`, `dahomey-erovrar-ouidah` och `slavhandeln-forbjuds-1807`, men ingen tur och ingen lektion.
- **Åk 7–9, "Förintelsen och Gulag" (står uttryckligen i kursplanen):** sökningen ger bara `auschwitz-befrias` (1945), `raddningen-av-de-danska-judarna` (1943) och `gulag` (1930). Förintelsen som förlopp har ingen egen händelse. Det bör bekräftas av `historiker`.
- **Åk 7–9, "Industrialiseringen i Europa och Sverige":** fyra träffar, bland annat `watt-separat-kondensor` och `jarnvagen-malmo-lund`. Epoken i `perioder.json` gäller bara Storbritannien.
- **Åk 7–9, första världskriget som lektion:** redan känt: #2022.
- **Åk 4–6, 1500–1800 och 1800–1900:** inga lektioner, och sökningen på Dackefejden gav 0 träffar. Redan känt: #1714, punkt 6.
- **Åk 1–3 (SO): "Människans uppkomst, vandringar …", "Norden befolkas" och "Tidslinjer och tidsbegreppen dåtid, nutid och framtid":** ingen tur och inget lärarstöd. Det har blivit mer aktuellt nu när förhistorien har ett eget reglage. Redan känt: #1098, #1102, #1103 och #1107. Täckningen är svagast just där (`tackning.py`): förhistoria i Amerika har 21 händelser mot väntade 181, och i Afrika 32 mot 129.
- **Länder i lektioner:** ingen tur använder platssteget (UX-rapporten 1853), och "För lärare" nämner inte länderna. Redan känt: #1714, punkt 6.

## Ej kontrollerat
- Webbläsaren: jag körde den inte. Därför har jag inte sett hur dörren, skalraden, de två (i) eller tidsgrupperna faktiskt ser ut, inte heller utskriften på A4 i verkligheten eller lektionsläget i 400 och 1280 px.
- Läsbarhetsmått (LIX) på nya texter. Lektionstexterna för åk 4–6 är oförändrade sedan v6.4.0.
- Bildlicenserna i turerna (`commons-muren-mutianyu` och `adl3rai-muren` med MIT). De hör till `historiker`.
- Ingen riktig lärare eller elev har provat något (det är fortfarande ett antagande, beslut 2026-11-07).
