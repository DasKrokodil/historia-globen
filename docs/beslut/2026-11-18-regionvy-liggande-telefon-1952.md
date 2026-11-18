# Regionvyn på en liggande telefon lämnar kartan fri (#1952)

Datum: 2026-11-18. DasKrokodil sa ja till rekommendationerna i UX-genomgången #1853 (kommentar i #1945); punkt 5.3 i `docs/ux-review/2026-11-18-lander-och-regioner-1853.md` blev det här issuet.

Ersätter delvis [knappens text i #1692](2026-11-16-regionvyknappens-text-1692.md): regeln (texten följer om regionvyn ryms) och skyddsnätet gäller kvar, men i en låg liggande yta räknas ytan i den hopfällda formen (punkt 7), så att 800 × 360 och 640 × 360 nu ger regionvy i stället för Platt karta. Bygger också på #1900: rutan och "Lämna regionvyn" på globen ligger kvar som där, men fokusraden och kortet runt dem är nu hopfällda.

## Problem (uppmätt)

Playwright Chromium, pekskärm, 800 × 360 och 640 × 360, Aotearoa på globen och Skåne i Platt karta: rutan, kortet, fokusraden (två rader), årtalet och knapparna överst täckte 79–87 % av bilden. Platsens enda synliga markör låg utanför skärmen (y = −11), och i Platt karta erbjöds regionvyn inte alls, eftersom kartan bara var 120 px hög (den börjar under knapparna överst) och kortet och fokusraden täckte resten. Tidsreglaget tar ensamt cirka 33 % av en 360 px hög skärm, så mer än cirka 50 % fri går inte att nå.

## Beslut

Bara medan regionvyn är öppen (`.region-view`) och bara i en låg liggande yta (`(max-height: 480px) and (orientation: landscape)`) fälls det som inte behövs just då ihop. Stående telefon, dator och surfplatta rörs inte.

1. **Platskortet stängs när regionvyn öppnas** (`foldCard()` i `js/controllers/region.js`). Om platsen i fokusraden öppnar det igen med regionvyn kvar, och en markör öppnar händelsens kort som förut. Tangentbordsfokus går till Lämna regionvyn (kortets knapp finns inte längre; förut hamnade fokus på sidan). Faller regionvyn ändå tillbaka till Platt karta (ryms inte) kommer kortet tillbaka. När regionvyn lämnas öppnas kortet inte automatiskt: Om platsen finns kvar i fokusraden.
2. **Knapparna överst göms** (`visibility: hidden`, som när kortet är öppet, #1667), och Platt vys karta börjar då vid sidans överkant (`FlatMap.layoutSpan()` och nya `relayout()`) i stället för 125 px ned. `rect()` i `region.js` räknar inte med dolda element.
3. **Årtalet är bara årtalet** (30 px, som under en tur, #1694). Rubriken (`h1`) och raden under årtalet döljs bara för ögat och finns kvar för skärmläsare.
4. **Rutan är kompakt** i Platt vy som på globen sedan #1900 (rubrik och knapp, utan den långa texten) och högst 280 px bred.
5. **Fokusraden är en rad**: rubriken kortas med tre punkter i stället för att "Tillbaka till hela tiden" bryts till en andra rad (103 → 62 px).
6. **Träffytor på minst 44 × 44 px** (också den osynliga ytan i `::before` och `::after`): Lämna regionvyn i Platt vy (var 32 px hög) och zoomknapparna i bred layout (var 40 px). Zoomknapparna ligger i bred layout i två kolumner med Affisch över båda, och 4 px från kanten, så att den nedersta inte hamnar under fokusraden. Markörerna (24, 30 och 30 px, med 44 px osynlig yta) var redan klara.
7. **Knappen i platskortet räknas i den hopfällda formen** (`freeBeforeEnter()` sätter klassen `region-view` medan måtten läses): Skåne får därför "Visa i regionvyn" också vid 800 × 360, 640 × 360, 667 × 375 och 844 × 390. Ryms vyn ändå inte (till exempel 600 × 375) heter knappen "Visa på Platt karta" som förut (#1692, skyddsnätet `tooSmall` gäller kvar).

Mått efter (samma lägen): 61–68 % täckt av hela skärmen (tidsreglaget ingår), alltså 48–57 % fri av kartan ovanför tidsreglaget (förut 19–37 %), och platsens markörer syns.

## Avvisade alternativ

- **Dölj fokusraden i regionvyn:** Spela finns bara i den (`#btn-play` döljs medan man följer något), så uppspelningen skulle försvinna ur regionvyn.
- **Behåll kortet men gör det lägre:** kortet har knappar och en lång lista; ett kort som är avskuret i höjd döljer fokuserbart innehåll under kanten (WCAG 2.4.11). Stängt kort har ett tydligt sätt tillbaka (Om platsen).
- **Dölj tidsreglagets teckenförklaring (14 px):** ger lite och tar bort en förklaring av tidslinjens märken.

## Prövat

`tests/webblasare.mjs`: "regionvyn på en liggande telefon: kartan är fri, kortet fälls ihop och knappar och markörer går att trycka på, i glob och Platt karta (#1952)" (800 × 360, 640 × 360, 844 × 390 och 667 × 375 med pekskärm: fri andel av kartan, provtryck i mitten och de fyra hörnen av varje synlig knapp och markör med `elementFromPoint`, träffyta minst 44 × 44 px, platsen ryms utan att rutan eller fokusraden täcker den, Om platsen, kryss och Lämna regionvyn) och "regionvyn: 1280 × 800 och 400 × 800 stående är oförändrade av reglerna för den låga liggande ytan (#1952)". Provet för knappens text (#1692) och provet för kortets kryss och knapp (#1667) har ändrats öppet, eftersom de provade att regionvyn *inte* ryms vid 800 × 360 och 640 × 360: de prövar nu att den ryms där och att den inte gör det vid 600 × 375.

## Berör

`css/style.css` (blocket sist i filen), `js/controllers/region.js`, `js/ui/flatmap.js`, `tests/webblasare.mjs`, `docs/arkitektur.md`.
