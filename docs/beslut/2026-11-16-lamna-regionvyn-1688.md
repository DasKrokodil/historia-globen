# Knappen i platskortet lämnar regionvyn medan den är öppen (#1688)

Datum: 2026-11-16. Beslut av DasKrokodil i #1688 ("Följ rekommendationerna").

## Beslut

1. **Knappen byter text.** Medan regionvyn är öppen för platsen heter knappen i platskortet **"Lämna regionvyn"** (`regionView.leave`, finns på alla fem språk; ingen ny text). Det gäller Platt vys regionvy (Skåne, Danmark) och globens (Aotearoa, Grönland). När vyn är stängd har knappen sin vanliga text: "Visa händelserna på kartan" eller, när regionvyn inte ryms och för Sverige, "Visa i Platt karta" (#1692). Namnet för skärmläsare (`aria-label`) följer med: "Lämna regionvyn: Skåne".
2. **Trycket lämnar vyn.** Ett tryck på knappen i det läget går samma väg ut som övriga utgångar (`leave()` i `js/controllers/region.js`): Platt vy som förut med platsen inramad, eller kameran tillbaka till den vanliga globen. Förut stängde ett nytt tryck vyn tyst och öppnade den igen, så att kameran flög en gång till och statusraden läste upp samma besked.
3. **Fokus och statusrad.** Fokus står kvar på knappen (till skillnad från Escape och knappen i rutan, som lägger fokus på kartan), eftersom det är knappen man just tryckt på och den byter bara innebörd. Statusraden säger det som hände: "Regionvyn är stängd. Platt karta visar Skåne." eller "… Globen visar Grönland." Arket i mobil rörs inte.
4. **Knappen göms inte längre i regionvyn.** Beslutet i [2026-11-15-korten-1789.md](2026-11-15-korten-1789.md) (#1790) gömde knappen medan vyn var öppen eftersom rutan har Lämna regionvyn. En knapp som byter till Lämna regionvyn kan inte vara dold, så regeln `.region-view #detail [data-selection-action] { display: none }` är borttagen. Följden är att Lämna regionvyn finns två gånger medan vyn är öppen: i rutan i kartan och i platskortet. Det är avsiktligt (en väg ut nära där man gick in). Vill DasKrokodil hellre ha den gömd igen är det en rad CSS, men då återkommer problemet i #1688.
5. **Räkningen av ytan.** Knappen syns nu också i kortet under regionvyn, så kortets höjd och därmed den fria ytan är densamma före och efter att vyn öppnats. Den förhandsmätning som #1692 gör (`freeBeforeEnter`) stämmer därmed bättre med den riktiga.

## Prövat

Provet "platskortets knapp heter Lämna medan regionvy är öppen och lämnar den (#1688)" i `tests/webblasare.mjs` tar Skåne, Danmark, Grönland och Aotearoa i dator (1280 × 800) och mobil (400 × 800) med tangentbordet: texten före, texten och namnet medan vyn är öppen, att knappen syns och är minst 24 px (44 px i mobil) och 12 px text, att Enter lämnar vyn, att vyn inte öppnas igen och att högst en flygning görs (tillbaka till globen), att fokus står kvar på knappen, att statusraden säger att vyn är stängd och att knappen får sin vanliga text igen. Provet "Aotearoa i Fokus" som tidigare krävde att knappen var dold kräver nu texten Lämna regionvyn och exakt en knapp med den texten i rutan.

## Berör inte

#1864 (Lämna regionvyn återställer vyn man kom från, och knapptexter som säger vart man kommer) är ett senare, eget ärende. Det här beslutet ändrar bara att knappen byter text och lämnar.

## Berör

`js/controllers/region.js`, `js/main.js`, `css/style.css`, `tests/webblasare.mjs`, `tests/jobb.json`, `docs/arkitektur.md`, `docs/ordlista-oversattning.md`.
