# Knappen i platskortet säger vad som händer: regionvy eller Platt karta (#1692)

Datum: 2026-11-16. Beslut av DasKrokodil i #1692 ("A").

## Beslut

1. **Texten följer om regionvyn ryms.** Knappen i platskortet för en liten plats (Skåne, Danmark) heter "Visa händelserna på kartan" (`place.regionMap`) när regionvyn ryms och **"Visa i Platt karta"** (`place.flatMap`) när den inte gör det. Samma regel som `roomy()` i `js/controllers/region.js` redan tillämpar när vyn öppnas (fria ytan minst `MIN_FREE`, 230 × 150 px), nu också på texten. Knappen lovar därmed aldrig något den inte ger. Inga nya texter: båda finns redan på alla fem språk (`data/ui/*.json`), så ordlistan behöver inga nya termer.
2. **Samma mått som regionvyn.** Ytan är inte känd förrän Platt vy är öppen, så den räknas i förväg med samma `freeArea()` och samma ordning som `free()`: kartans ruta (`flatMap.layoutSpan()`, som också `_layout()` använder) minus kortet, fokusraden och pausraden. I mobil räknas arket i litet läge (det fälls ihop när knappen trycks) och zoomknapparna uppe till höger; på dator zoomknapparna till vänster om kortet. Regionvyns ruta mäts på en osynlig kopia med samma texter och samma CSS, eftersom raderna i den bryts olika efter språk och bredd. Beslutet och texten delar `MIN_FREE`, `hasRoom()` och `regionButtonKey()` i `js/region-frame.js`.
3. **Platser.** En stor plats (Aotearoa, Grönland) får regionvyn på globen, som inte har någon gräns för ytan: knappen heter alltid "Visa händelserna på kartan". Sverige får aldrig regionvyn: knappen heter alltid "Visa i Platt karta".
4. **Texten följer fönstret.** Den uppdateras när kortet ritas och när fönstret ändrar storlek eller vänds, när arket, kortet eller fokusraden ändrar höjd eller knapparna överst och tidsreglaget ändrar höjd (ResizeObserver, en gång per bildruta, och bara när kortet har en knapp). Namnet för skärmläsare (`aria-label`) följer med. Ingen ny uppläsning: texten byts tyst.
5. **Skyddsnät.** Faller öppnandet ändå tillbaka till Platt vy i en storlek där förhandsmätningen sa att ytan räckte (rutan blev till exempel högre än i kopian), kommer knappen ihåg det för platsen och storleken, och byter text direkt. Mätningen är därför aldrig ensam ansvarig för att knappen talar sanning.

## Prövat

Uppmätt i Playwright (Chromium): texten stämmer med det som händer vid 800 × 360 och 640 × 360 (Platt karta), 400 × 800 och 1280 × 800 (regionvy) och vid ytterligare cirka 50 storlekar, bland annat 360 × 640 (Skåne: 292 × 146 px, strax under gränsen, vilket en tidigare modell med fast höjd på rutan missade och som ledde till mätningen av rutan på en kopia), 375 × 667, 390 × 844, 844 × 390, 667 × 375, 1024 × 600, 1280 × 540 (Platt karta) och 1280 × 550 (Danmark: regionvy). Provet i `tests/webblasare.mjs` ("platskortets knapp säger Platt karta när regionvy inte ryms") trycker på knappen vid de fyra storlekarna och kontrollerar att rutan Regionvy visas eller inte efter trycket, och att texten byts när fönstret ändrar storlek; `tests/regionvy-knapp.test.mjs` prövar regeln utan webbläsare.

## Avvisade alternativ

- **B (dölj knappen när den inte ryms):** vägen till Platt karta för platsen försvinner i liggande läge, där knapparna Vy är dolda medan kortet är öppet.
- **C (behåll texten och lägg en rad om att skärmen är för liten):** mest text och en ny text i fem språk.

## Följder att känna till

- Mätningen gör en synkron mätning av layouten (en osynlig kopia av regionrutan och, i mobil, arkets höjd i litet läge) varje gång kortet ritas eller storleken ändras. Det syns inte; kortets rullning läggs tillbaka efter mätningen av arket, och under ett drag i handtaget mäts arket som det står.
- Raden "Inga händelser har börjat här än" (#1786) gör regionrutan en rad högre än kopian; ligger ytan precis på gränsen kan knappen därför säga regionvy fast vyn faller tillbaka. Skyddsnätet i punkt 5 rättar texten efter första trycket.

## Berör

`js/region-frame.js`, `js/controllers/region.js`, `js/focus/place.js`, `js/ui/flatmap.js` (`layoutSpan()`), `tests/regionvy-knapp.test.mjs`, `tests/webblasare.mjs`, `tests/jobb.json`, `docs/arkitektur.md`, `docs/ordlista-oversattning.md`, `docs/beslut/2026-11-14-regionvy-steg-1a-1641.md`.
