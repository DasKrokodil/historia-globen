# Fokus återställs direkt när faktarutan stängs (#1436)

**Datum:** 2026-11-14 (DasKrokodil beslutade att felet rättas i koden och inte genom att luckra upp kontrollen)

## Beslut
1. **Fokus flyttas i en mikrotask, inte i nästa bildruta.** Logiken lyfts ur `onDetailChange` i `js/main.js` till `js/controllers/detail-focus.js`. `select()` stänger rutan och ritar sedan om listan (`app.refresh()`) i samma synkrona anrop; mikrotasken går efter det, så raden hittas i den nya listan. Ett andra försök i nästa bildruta finns kvar som säkerhetsnät om fokus fortfarande ligger i rutan eller på body.
2. **Utan öppnare går fokus till knappen Samtidigt.** Öppnas rutan från en markör, en etikett, turens steg, en menyhändelse eller ett datumresultat finns ingen rad eller knapp att gå tillbaka till. Låg fokus då på ett element i rutan (till exempel Stäng) går det till `#btn-panel`. Fokus som besökaren redan har flyttat, fokus på body och fokus utanför rutan (till exempel turens Nästa) rörs aldrig.
3. **Rörs inte:** Escape-hanteringen (Escape stänger Samtidigt-panelen före faktarutan, ett eget beteende), dialogernas fokus i `js/surfaces.js` och `central`-flaggan.
4. **Kontrollen försvagas inte.** Den befintliga kontrollen "stängregistret: dialog pausar uppspelningen …" behåller sin väntan och sin diagnostik. En ny kontroll stänger `requestAnimationFrame` före klicket och kräver att fokus ligger rätt 100 ms efteråt, så den faller om rättningen bara ligger i en bildruta, i vilken webbläsare som helst.

## Varför
I Firefox behöll det dolda Stäng-elementet (`button.detail-close`) fokus i cirka 1,7 s tills `requestAnimationFrame` kördes (diagnostiken i #1501). Det är ett tillgänglighetsfel för tangentbordsanvändare, inte ett testfel. Dessutom återställdes fokus bara när rutan öppnades från ett kort eller en rad; från övriga ingångar hamnade en tangentbordsanvändare som tryckte Enter på Stäng på body (WCAG 2.4.3).

## Berör
`js/controllers/detail-focus.js` (ny), `js/main.js`, `tests/detail-focus.test.mjs` (ny), `tests/webblasare.mjs`, `docs/arkitektur.md`, `README.md`.
