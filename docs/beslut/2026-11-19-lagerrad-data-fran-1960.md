# Lager-menyn: en rad som säger när ett påslaget lager saknar data i året

**Datum:** 2026-11-19 (#1960, ur förstudien #1878; DasKrokodil sa ja till rekommendationerna 2026-11-18; byggt ovanpå de två reglagen i #1958)

## Beslut
1. **Raden visas bara när den hjälper:** under ett lager som är **påslaget i Lager** och vars täckning **inte omfattar året** lagret ritas för. Lager som har data i året, lager som är avslagna och lager vars data inte har laddats än får ingen rad. Texten är "Ingen data för året · data från 2501 f.Kr." (året ligger före datan) eller "Ingen data för året · data till cirka 10 000 f.Kr." (efter datan), på fem språk (`layers.coverageBefore`, `layers.coverageAfter` och varianterna `…Approx`).
2. **Täckningen räknas ur lagrets egen data**, aldrig inskriven per reglage eller lager: tidigaste `from` till senaste `to`, som `sliceAt` i `js/layers/images.js` läser skivornas `from`/`to`. Lagret anmäler den i sin registerpost med ett valfritt fält `coverage(state)` (`{ year, span }`, `span = spanOf(poster)` ur `js/layer-coverage.js`). Ett nytt lager får raden genom att lägga till fältet; ingenting ändras i menyn. Kontraktet är dokumenterat i `docs/arkitektur.md` (Lagerregistret).
3. **Osäkerhet visas öppet:** en gräns är "cirka" när datan själv är ungefärlig, alltså spridningsposternas `edtf` med `~` eller `?` och bildskivor med `caveat` (modellsteg, Istidens kust). En gräns är ungefärlig bara om alla poster som sätter den är det.
4. **Ingen ny dämpning och inget automatiskt avslag.** Lagret ritas som förut och dämpas som förut bara av #235 (fokusläget). Raden är en förklaring, inte en ändring av lagret.
5. **Tillgänglighet:** raden är vanlig text under lagrets rad, utanför `<label>` (annars blir den en del av rutans namn) och kopplad till rutan med `aria-describedby`, som tas bort när raden försvinner. Den är ingen live-region och sätts bara om när texten ändras, så skärmläsaren läser inte upp den varje gång året flyttas; texten finns i menyn för den som läser rutan. Samma färg och storlek som lagrens förklaringar (`--parchment-dim`, 11 px, 12 px i mobil), och den bryter rad i 400 px utan sidled.

## Valet: visa raden vid brist, inte täckningen på alla lager med begränsad täckning
Det andra alternativet, att alltid visa "data från …" på varje lager med begränsad täckning, hade lagt en rad till under nästan alla lager (riken, religioner, vägar, krigsområden, nattljus, spridning, Istidens kust) hela tiden, också när lagret har data. Det är brus i en meny som ska vara lugn ("färre samtidiga ytor, ett ord per sak"). Problemet i issuet är att ett påslaget lager är **tomt utan att man ser varför**; det löser en rad som bara finns då. Täckningen visas därför bara när året ligger utanför den, och försvinner när man byter till ett år med data.

## Gränser
- **Hål inuti täckningen** (år utan krig mellan två krig, tiden mellan två skivor) räknas inte som saknad data; raden gäller bara före första och efter sista posten. Vilka år som saknar poster i mitten beror på urvalet, inte på att datan inte finns, och skulle ge en rad som blinkar under uppspelning.
- **Händelser** (urvalet följer ett tidsfönster), **Dagens gränser** (gäller alla år) och **Upptäcktsvyn** (följer vägarna) har ingen `coverage`. Krigsområden får raden bara när Händelser är på, eftersom lagret annars inte syns.
- **Raden syns i menyn**, alltså under "Fler val" bakom lagrets grupp (de är hopfällda, #1574). På första nivån, bland vyerna, finns ingen sådan rad. Om besökare missar den kan en rad vid gruppens räknare ("2 av 4 på · 1 saknar data här") vara nästa steg; det ändrar menyns första nivå och är en fråga för DasKrokodil.
- **Gräns i dag:** riken (till 2024), religioner (2024), vägar (1873) och krigen (2026) slutar där datan slutar, så raden visas också för år efter det, till exempel "Resor och handelsvägar: data till 1873" år 1900. Det är vad datan säger.
- **Årtalen visas som appen visar år:** riken börjar -2500 i datan, vilket appen skriver 2501 f.Kr. (astronomisk årsräkning, CLAUDE.md). Ingen omräkning görs i raden.

## Mätning (2026-11-19, ur datan, inte ur minnet)
Täckningen enligt `spanOf` över datafilerna: riken -2500 till 2024 (`data/empires/index.json`), religioner -3000 till 2024, vägar -129 till 1873, krigsområden -1274 till 2026, nattljus från 2016 (öppet slut), Istidens kust -79300 till -5550 (cirka), Människans spridning -297999 till -9999 (cirka). Samma siffror prövas i `tests/layer-coverage.test.mjs`.

## Prov
- `tests/layer-coverage.test.mjs`: täckning ur `from`/`to`, öppna gränser, tomma data, "cirka", EDTF, registret (bara påslagna lager, ingen dämpning eller avslag) och varje lagertyp mot sin riktiga data.
- `tests/webblasare.mjs`: "Lager: raden om data som saknas i året (#1960)" i dator- och mobilbredd: raden för Människans spridning år 1500 och för Riken år 20 000 f.Kr., `aria-describedby`, ingen live-region, ingen tonad rad, ryms i menyn, försvinner vid år med data och när lagret slås av, och texten skrivs inte om utan att läget ändras.
