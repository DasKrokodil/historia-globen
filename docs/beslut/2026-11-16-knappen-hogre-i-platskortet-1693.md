# Knappen i platskortet ligger högre upp på låg yta (#1693)

Datum: 2026-11-16. Beslut av DasKrokodil i #1693 ("Följ rekommendationerna": C tills beslutet om knappen var taget, därefter A). Knappens beslut (#1692, alternativ A) är taget och knappen blir kvar, så A byggs.

## Beslut

1. **Knappen flyttas upp med CSS `order`, inte med ändrad markup.** På en låg yta (högst 480 px höjd, samma tröskel som reglerna för liggande telefon i #1667) ligger knappen i platskortet ("Visa i Platt karta" eller "Visa händelserna på kartan") direkt under rubriken och typraden, före flaggor och inledning. `.story` är då en flex-kolumn och knappen har `order: -1` (typraden `-2`). DOM-ordningen är oförändrad: knappen står kvar efter inledningen i markupen (`Panel.showSelection`).
2. **Tangentbordsordning och skärmläsarordning.** Det som byter plats är bara text utan fokus (typraden, flaggorna och inledningen). Det som går att tabba till har samma ordning i markupen och i bilden: krysset, knappen, händelserna, rikena, Om kartan och Sluta följa platsen (WCAG 2.4.3 fokusordning, ingen konflikt). Skärmläsaren läser rubrik, text, knapp medan ögat ser rubrik, knapp, text; knappens namn säger vad den gör ("Visa i Platt karta: Skåne"), så förståelsen beror inte på ordningen (WCAG 1.3.2). Hade CSS-ordningen skapat en tydlig konflikt mellan synlig ordning och tabbordning hade markupen inte byggts om.
3. **Kortet blir högre i bred, låg layout.** Vid 800 × 360 var kortet bara cirka 70 px högt och rymde ingenting under rubriken, eftersom taket i Fokus (`.app.focusing.focus-var .detail-card`, #183) reserverar 150 px för knapparna överst. De knapparna är dolda medan kortet är öppet (#1667), så reservationen behövs inte där: vid 761 px bredd och högst 480 px höjd får kortet gå upp mot skärmens överkant (cirka 8 px luft; höjden räknas utan kortets 30 px padding och kant). Kortet ligger i högerkanten och årtalet i vänsterkanten, så de möts inte. Utan den ändringen hade ordningen ensam inte gjort knappen synlig.
4. **Tryckyta.** På pekskärm och låg yta är knappen minst 44 px hög också i bred layout (i smal layout gällde det redan, #1161).
5. **Smal layout (640 × 360, 667 × 375).** I läget helt syns knappen utan rullning. I läget halvt, som arket öppnas i, är arket 90 px högt (handtaget är 44 px, rubriken tar resten) och rymmer bara rubriken: det får plats ovanför fokusraden men inte under knapparna överst. Att öppna halvt arket högre eller helt som standard på liggande telefon skulle täcka fokusraden och tidsreglaget (#1667) och är ett eget beslut; det ingår inte här. Knappen ligger ändå före inledningen i halvt läge, så den nås med ett drag eller tryck i handtaget utan att rulla i texten.
6. **Hög skärm oförändrad.** Vid 1280 × 800 och 400 × 800 gäller reglerna inte (över 480 px höjd): knappen ligger efter inledningen som förut.

## Prövat

Uppmätt i Playwright (Chromium) före och efter, Skåne 1827, utan rullning: 800 × 360 knappen 405–436 px före (under skärmens kant på 360 px) och 99–143 px efter, inom kortet (8–185 px); 640 × 360 i läget helt knappen 179–223 px efter; 1280 × 800 och 400 × 800 oförändrade. Provet "platskortets knapp ligger direkt under rubriken på låg yta och syns utan rullning" i `tests/webblasare.mjs` mäter detta utan att rulla, att knappen ligger före inledningen men efter den i markupen, att krysset och knappen är de två första som går att tabba till, att knappen är minst 44 px på pekskärm och att ordningen är oförändrad vid 1280 × 800 och 400 × 800. Provet fallerar utan CSS-ändringen.

## Avvisade alternativ

- **B (kortet täcker fokusraden på låg yta):** döljer tidskontrollerna medan kortet är öppet.
- **C (låt det vara):** rullningslisten syns inte på pekskärm, så att det finns mer att nå är svårt att se.
- **Ändrad markup (knappen före inledningen i DOM):** skulle ändra ordningen för skärmläsare på alla storlekar; CSS `order` ger samma bild bara där den behövs.

## Berör

`css/style.css`, `tests/webblasare.mjs`, `tests/jobb.json`, `docs/arkitektur.md`, `docs/produkt/05-ux-oversikt.md`.
