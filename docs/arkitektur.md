# Arkitektur

Hur Historia-globen är uppbyggd och varför. Den här filen uppdateras i samma pull request som koden när något av det här ändras. De bindande principerna står också i [CLAUDE.md](../CLAUDE.md#arkitektur-beslutad-ändra-inte-utan-att-fråga), och besluten bakom dem i [beslut.md](beslut.md).

## Principer

1. **Inget byggsteg.** Vanliga ES-moduler som webbläsaren läser direkt. Inga ramverk, ingen bundler och ingen server. Det räcker med `python3 -m http.server`.
2. **Data skild från kod.** Allt innehåll (händelser, fun facts, källor, riken, religioner, bildstilar) ligger i `data/`. Koden innehåller inga händelser, texter eller årtal.
3. **Ett år styr allt.** Tidslinjen äger det nuvarande året och skickar `change`. Allt annat lyssnar och ritar om.
4. **Allt ritas på en platt bild först.** Grundkartan och lagren ritas på ekvirektangulära bilder (4096 × 2048) som läggs på klotet. Samma platta bild kan skickas till en fysisk globskärm, och "Platt vy" visar den.
5. **Lager som moduler.** Varje lager har samma gränssnitt: `update(state)` väljer vad som syns, och `drawOverlay(ctx, W, H)` ritar det på den platta bilden.
6. **Ett enda externt beroende:** three.js 0.160.0 från jsDelivr.

## Hur delarna hänger ihop

```mermaid
flowchart LR
  T[Tidslinjen<br/>js/timeline.js] -- change: år --> M[main.js<br/>refresh]
  M --> L1[Händelser<br/>layers/events.js]
  M --> L2[Riken<br/>layers/areas.js]
  M --> L3[Religioner<br/>layers/religions.js]
  M --> L4[Krigsområden<br/>layers/wars.js]
  M --> L5[Dagens gränser<br/>layers/borders.js]
  L1 & L2 & L3 & L4 & L5 -- drawOverlay --> O[overlayCanvas<br/>4096 × 2048]
  B[land.json] --> BC[baseCanvas<br/>4096 × 2048]
  BC & O --> G[Klotet<br/>js/globe.js]
  BC & O --> F[Platt vy]
  M --> P[Samtidigt i världen<br/>ui/panel.js]
  M --> S[Samtidigt-kortet<br/>ui/funfact.js]
  M --> D[Faktarutan<br/>ui/panel.js]
```

Varje gång året ändras körs `refresh()` i `main.js`:

1. Samtidigt-kortet väljer vilka fun facts och krigskort som gäller. Kort som jämför flera händelser visas först, sedan det som började senast.
2. Händelselagret väljer synliga händelser, och listan Samtidigt i världen ritas om.
3. Riken, religioner, dagens gränser och krigsområden väljer vad som finns det året.
4. Lagren ritas i ordning nedifrån och upp på den platta lagerbilden: riken, religioner, dagens gränser, krigsområden och händelsernas sken.
5. Lagerbilden läggs på klotet, och på platta vyn om den är öppen.
   Rikesnamnen ritas mindre i bilden vid kraftig zoom (`areas.labelScale`, storlek ≈ förstoring^-0,7 men högst ned till 0,25, och `labelAlpha` tonar ut dem mot max zoom; omritning 150 ms efter att zoomandet stannat) så att de inte dominerar skärmen eller täcker markörer; platta vyn visar dem i grundstorlek (#154).
6. Pauser kontrolleras: fun facts, när ett krig bryter ut, krigets stora händelser och religionens grundande.

Klickbara markörer, etiketter och bågar ligger ovanpå klotet som 3D-objekt och HTML, inte på den platta bilden. Etiketter som ligger nära varandra slås ihop till kluster (`ui/clusters.js`). Etiketterna hålls inom skärmen och läggs aldrig ovanpå andra markörer eller klusterbrickor (#142).

## Moduler

| Fil | Ansvar |
|---|---|
| `js/main.js` | Startar allt, kopplar ihop delarna, fokusläget, pauser och etiketter |
| `js/model.js` | Språk (`t()`), kategorier, granskningsnivåer, tidsformat, världsdelar, bildstilar (`styleFor()`), laddning av data |
| `js/globe.js` | Klotet (three.js), kamera, styrning, de platta bilderna, bågar |
| `js/timeline.js` | Tidsreglaget med segmenterad skala, fokusspann, uppspelning, hastighet och "Hoppa till år" |
| `js/layers/events.js` | Punktlager: händelser med ikon och sken |
| `js/layers/areas.js` | Områdeslager: riken som ändras över tid |
| `js/layers/religions.js` | Områdeslager: rikenas religion, och en stjärna där religionen uppstod (`facts.origin`) |
| `js/layers/wars.js` | Krigsområden runt krigets och slagens platser |
| `js/layers/borders.js` | Dagens landsgränser (av som standard) |
| `js/ui/panel.js` | Samtidigt i världen per världsdel, kategorifilter, faktarutan med bild och ram, krigets berättelse, faktarutan om en religion |
| `js/ui/funfact.js` | Samtidigt-kortet: fun facts och "När ett krig bröt ut", kan fällas ihop. Tryck på en händelseknapp visar händelsens bild, ram, bildtext och sammanfattning överst i kortet (#169), med bilden från `figure()` i `panel.js` och ramen från `styleFor()`. Globen flyger dit via `ff.onPick`, men faktarutan öppnas bara via "Mer om händelsen" (`ff.onSelect`). Kortet rullar inuti och går aldrig utanför skärmen |
| `js/ui/legend.js` | Teckenförklaring och klickruta för religionslagret (#166): HTML över globen, inte i kartbilden. Teckenförklaringen listar religionerna som syns året (`ReligionsLayer.legendItems()`); ett klick på ett område (`Globe.pickLatLon` + `ReligionsLayer.hitTest`, punkt-i-polygon i lon/lat) visar religion och rike. Händelsemarkörer har företräde |
| `js/ui/layers.js` | Lagermenyn och valen för pauser |
| `js/ui/focusmenu.js` | Fokusmenyn: följ ett krig, ett rike eller en religion |
| `js/ui/sources.js` | Sidan Om källorna: källregistret grupperat efter användning, granskningsläge per grupp och sökning |
| `js/ui/clusters.js` | Klustring av etiketter |

## Laddning av data

Vid start laddas det som behövs direkt: händelser, fun facts, källor, grundkartan, dagens gränser, bildstilar och rikenas register (`data/empires/index.json`).

Stora filer laddas först när de behövs:

- **Ett rike** (`data/empires/<rike>.json`) laddas när året närmar sig rikets tid (inom 100 år) eller när man väljer det i Fokus.
- **Religionerna** (`data/religions.json`) laddas när religionslagret slås på eller när Fokus-menyn öppnas.
- **Bilder** i faktarutan laddas när kortet öppnas.

## Hoppa i tiden (#140)

Stegknapparna −100, −10, −1, +1, +10 och +100 syns på alla skärmbredder (i mobil är de smalare). Årtalet uppe till vänster är en knapp: den öppnar en ruta där man skriver ett år, med knapparna f.Kr./e.Kr. eller direkt i texten ("2600 f.Kr.", "44 fkr", "1969"), eller väljer en tidsålder (skalans fyra segment och "Idag"). Utan angiven tideräkning räknas året som e.Kr. Tolkningen görs av `parseYear()` i `model.js`; rutan hör till `setupYearJump()` i `timeline.js`. I fokusläge hålls året inom spannet och rutan säger till om man hamnar utanför.

## Tangentbord och skärmläsare (#139)

Etiketterna och klustren på globen är `<button>` och nås med Tab; Enter öppnar händelsen (kluster zoomar in). Globens canvas har `tabindex="0"` och tar emot tangenter i `_initControls()` i `globe.js`: piltangenter snurrar (Skift = större steg), `+` och `−` zoomar. Tangenterna fångas bara när canvasen själv har fokus, så de stör inte inputfält. Fokus visas med mässingsring (`:focus-visible`). Play-knappen har ett konstant namn ("Spela upp tiden") och `aria-pressed` som visar om tiden spelar. De två kryssrutorna Samtidigt-kortet har egna namn ("Visa …", "Pausa vid …"). Listan Samtidigt i världen är det tangentbordsvänliga alternativet till globen.

## Fokusläget

Fokus-knappen följer ett krig, ett rike eller en religion. Tidslinjen visar bara det spannet, globen riktas mot platsen och uppspelningen går långsamt.

- **Krig:** ett kort med orsak och parter före start, paus vid krigets stora händelser (valbart) och ett kort med utgång och döda i slutet.
- **Rike:** bara rikets områden syns, och globen riktas mot riket när det var som störst.
- **Religion:** börjar vid religionens grundande, stannar vid grundhändelserna och visar sedan religionens spridning som statsreligion. Har religionen en faktaruta (`facts`) visas den först.

## Faktarutan om en religion (#90)

När religionslagret slås på visas faktarutan för den första synliga religionen som har `facts` i `religions.json`, i samma kort som händelsernas faktaruta, och menyn stängs så att kortet och punkten syns. Rutan visas också när en sådan religion bockas i igen, med knappen Fakta i undermenyn och när man följer religionen i Fokus. Kortets ram följer tidsåldern för händelsen där religionen uppstod. Nyckelåren i rutan hoppar i tiden. Punkten där religionen uppstod ritas som en stjärna på lagerbilden (beslut 1), så att den också syns i Platt vy.

Menyn visar det som pågår nära året man står på. Resten finns bakom "Visa alla".

## Hjälpskript

Skripten i `tools/` körs för hand, inte av sidan, så principen om inget byggsteg gäller fortfarande.

| Skript | Gör |
|---|---|
| `tools/riken.py` | Bygger rikesfilerna ur Cliopatria |
| `tools/bildpromptar.py` | Skriver promptar för illustrationer till `docs/bildpromptar.md` |
| `tools/bilder_in.py` | Konverterar bilder från `images/incoming/` till `images/events/` och fyller i `image` i `events.json` från bildloggen `images/incoming/bildlogg.json`. Undermappar, till exempel `images/incoming/vantar/` för bilder som ska göras om, hoppas över |

## Testa

Se [CLAUDE.md](../CLAUDE.md#testa-innan-du-är-klar): starta `python3 -m http.server 8000`, kontrollera att konsolen är fri från fel, testa dator- och mobilbredd och kontrollera all JSON.
