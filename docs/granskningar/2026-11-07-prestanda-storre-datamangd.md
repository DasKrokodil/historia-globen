# Prestanda med större datamängd (3× och 10× händelser)

Datum: 2026-11-07 · Issue: #752 · Skriven av Claude Code (rapport, appen och datan är oförändrade)

## Frågan

Datamängden växer (massimport #61, kärnhändelser #452) och intervalläget (#569) kan ge fler än 500 markörer. Var blir sidan trög, behövs en gräns, och räcker dagens klustring (`js/layers/events.js`, `js/ui/clusters.js`)?

## Metod

- Verktyget `tools/matning_datamangd.mjs` gör av `data/genererat/handelser.json` en syntetisk kopia med 3× och 10× så många händelser. De extra händelserna är klonade med id `<id>~<n>`, år förskjutna högst ±40 år och plats högst ±4° längd och ±3° bredd. Filerna skrivs till en temporär mapp och tas bort efteråt; inget hamnar i `data/`. Playwright byter ut svaret på förfrågan efter `handelser.json`.
- Klonerna tappar `partOf`, `kind`, `top`, `major`, `ongoing`, `founding`, `religion`, `wikidata`, `story` och `tags`, så de ger inga extra krigsområden eller religioner. Mätningen gäller alltså markörer, etiketter och listor.
- Chromium med mjukvarurendering (SwiftShader), alltså som en skoldator utan grafikkort. Dator 1400 × 900 och mobil 400 × 800. Median av 3 mätningar per cell, ingen CPU-strypning.
- Mått: första ritning (sidladdning till laddningsruta borta plus två bildrutor), årshopp 1969 → 1500 (till året visas plus två bildrutor), längsta glapp i en timer som körs var 50:e ms under hoppet, bildrutor per sekund under 3 s dragning i globen, etiketter på globen, rader i Samtidigt-listan och JS-heap.

Kör om: `python3 -m http.server 8000 &` och sedan `NODE_PATH=<mapp med playwright> node tools/matning_datamangd.mjs 8000`.

## Resultat

| Bredd | Händelser | Första ritning (ms) | Årshopp (ms) | Längsta glapp (ms) | Bilder/s vid snurr | Etiketter | Rader i listan | JS-heap (MB) |
|---|---|---|---|---|---|---|---|---|
| dator | 763 (1×) | 5234 | 556 | 616 | 8 | 12 | 25 | 34 |
| dator | 2289 (3×) | 5436 | 569 | 607 | 8,9 | 19 | 25 | 34 |
| dator | 7630 (10×) | 5849 | 635 | 633 | 8,3 | 26 | 25 | 56 |
| mobil | 763 (1×) | 1325 | 209 | 401 | 16,2 | 8 | 25 | 32 |
| mobil | 2289 (3×) | 1465 | 244 | 404 | 15,7 | 13 | 25 | 41 |
| mobil | 7630 (10×) | 1948 | 287 | 311 | 12,4 | 16 | 25 | 83 |

Hur många markörer som ligger på samma år, ur datan (utan slag i krig som inte är `top`):

| Händelser | Pågår 1969 | Pågår 1500 | Tätaste året (antal) |
|---|---|---|---|
| 763 (1×) | 8 | 13 | 1258 (25) |
| 2289 (3×) | 21 | 42 | 1258 (69) |
| 7630 (10×) | 48 | 134 | 1252 (236) |

## Slutsatser

1. **Datamängden är inte flaskhalsen i dag.** Från 1× till 10× ökar första ritningen med cirka 12 % (dator) och 47 % (mobil), årshoppet med cirka 14 % och 37 %, och bildfrekvensen sjunker på mobil från 16 till 12 bilder/s. Med mjukvarurendering domineras bildfrekvensen av själva klotet (cirka 8 bilder/s på dator oavsett antal), inte av markörerna.
2. **Minnet växer jämnt:** cirka +22 MB (dator) och +50 MB (mobil) vid 10×. Det är inget problem vid 7 600 händelser; det växer med antalet sprites och texturer.
3. **Klustring och etikettplacering håller antalet synliga etiketter nere** (26 av 134 pågående på dator, 16 på mobil). Det är ritningen av sprites, inte etiketterna, som skulle växa först.
4. **Rekommendation:** ingen gräns behövs upp till cirka 8 000 händelser (10×) och cirka 250 markörer på samma år. En gräns eller starkare gruppering bör övervägas först om datan går över cirka 10 000 händelser, eller om intervalläget (#569) kan visa mer än cirka 300 markörer samtidigt. Då är det första att mäta ritningen av sprites i `EventsLayer.update`, som går igenom alla händelser vid varje förändring.

## Begränsningar (läs innan siffrorna används)

- **Intervalläget är inte mätt.** Det finns ingen adressparameter eller åtgärd i `js/state.js` som sätter ett stort tidsfönster (`window` är 0), så mätningen visar ett enda år. Mät om när #569 finns; då ger ett stort fönster betydligt fler markörer än "pågår" i tabellen.
- Klonerna saknar detaljfiler, krig, riken och religioner, och klustras på en jämn spridning kring originalen, vilket är mer glest än verklig skevhet mot Europa.
- Bildfrekvensen mättes under dragning med Playwrights mus (en ny position var 16:e ms), så den innehåller verktygets egen kostnad. Jämför celler med varandra, inte med verkliga värden.
- Mätt i en delad molnmaskin med en körning à tre varv; absoluta tider varierar. Ingen CPU-strypning och inget riktigt grafikkort. Mjukvarurendering är medvetet det svåra fallet.
- Listan i Samtidigt visar högst 25 rader (kolumnen visar taket, inte antalet), så den säger inget om listans kostnad.
