# Liggande telefon: årtalet ovanför fokusraden, kort och lista som rymmer något, och ett prov som provtrycker (#1932)

Datum: 2026-11-17

## Beslut

1. **Medan man följer något ligger årtalet ovanför fokusraden, inte bakom den** (bred layout, 761–1100 px bredd och högst 480 px höjd, alltså liggande telefon och liten platta). `.masthead` förankras då med nedkanten 6 px ovanför fokusradens ovankant (`bottom: calc(var(--focus-top) + 6px)`). `--focus-top` mäts redan i `js/main.js` (#183) och följer fokusradens höjd, så en högre rad (pausraden, "Tiden flyttades") lyfter årtalet med sig i stället för att täcka det. Utan fokus ligger årtalet som förut, under knapparna överst (#992). Lektionsläget och turer berörs inte.
2. **Samtidigt-kortet (Visste du?) och Samtidigt-listan får en höjd som rymmer något** på låga ytor:
   - Bred och låg (761 px och uppåt, högst 480 px höjd): kortets tak går upp till knapparnas underkant (118 px reserveras i stället för 150), och bildremsan (132 px, med samma händelser som chipsen under) döljs, så att texten syns i stället för en klippt bild. 70 px blev 102 px vid 800 × 360 och 132 px vid 844 × 390.
   - Samtidigt-listan (`Panel.setOpen`, `js/ui/panel.js`) går som i smal skärm ned till kanten och ligger över tidsreglaget när höjden är under 500 px, oavsett bredd. Förut reserverades 150 px för tidsreglaget, så att listan blev 93 px hög och raderna fick 18 px. Världsdelsflikarna ligger på en rad som rullar i sidled (som i smal skärm), och i en så låg ruta rullar hela listan, rubrik och filter först, så att raderna nås med ett drag.
   - Smal och låg (667 × 375): Visste du?-arket i läget halvt reserverar 64 px uppåt i stället för 176 och får högst 46 procent av höjden. Förut blev det 97 px högt och bildernas Läs mer-knappar och chipsen låg under den fasta knappraden.
3. **"Pågår sedan länge" sist i Samtidigt-listan får 10 px luft över sig** på pekskärm och i smal layout, så att dess 44 px höga träffyta inte tar den sista radens nedre kant.
4. **Träffytor provas med ett tryck, inte bara med storleken.** `tests/traffytor.mjs` (`provaTraffytor`) går i sidan igenom varje synlig knapp, länk och sammanfattning och provtrycker med `document.elementFromPoint`: mitten, fyra hörn (30 procent av kortaste sidan innanför, så att de ligger inom en rundad knapp) och kanternas mitt 10 px innanför. Träffen ska vara knappen själv. Webbläsarkontrollen "träffytor: varje synlig knapp tar själv emot trycket … (#1932)" kör provet i liggande telefon (800 × 360 och 844 × 390 eller 667 × 375, med pekning), mobil 400 px och dator 1280 px, i startläget, med Samtidigt-listan öppen (också rullad till slutet) och med Visste du?-kortet, i ett rike i fokus (Khmerriket) och i ett kort krig i fokus (Anglo-zuluiska kriget). Dessutom: årtalet slutar inte under fokusradens ovankant, kortet är minst 96 px och listan minst 180 px i liggande telefon.

## Regler för provet

- **Avsiktliga skikt räknas inte som fel.** Samtidigt-listan är en ruta som med flit ligger över tidsreglaget och fokusraden. En knapp vars ruta ligger helt inuti den provade knappens (krysset i ett arks handtag) har sin utökade yta över dess kant med flit. De yttersta 10 px av en kant provas inte: handtaget i Samtidigt-arket tar med flit 8 px över bildernas överkant, och bilderna behåller 44 px (#1309). En knapps mitt och hörn får aldrig tas.
- **Knappar i rullande rutor** (kort och ark) som täcks i vila av ett fast fält (handtag, knapprad) provas också rullade till mitten, överkanten och nederkanten av rutan; ger något läge fria tryck är knappen felfri, annars är den ett fel. Rullningen återställs.
- **Teckenförklaringarna provas inte** (religioner, riken, "Tecken" under tidsskalan): de hör till #1307, som någon annan tar. Teckenförklaringens knapp (`.rl-toggle`, "Riken") ligger i liggande telefon under fokusraden: förut under tidsreglagets knappar, nu under fokusraden, eftersom `js/ui/legend.js` lägger den 8 px under årtalsplattan. Den var otillgänglig före och är det efter; läget ska lösas i #1307.
- **Kartans markörer och etiketter på globen** (`#labels`) och tidsskalans markörer provas inte; de ligger med flit under menyer och kort.

## Mätt före (main efter #1927, Playwright, Chromium, pekskärm för liggande och mobil)

| Punkt | Före | Läge |
|---|---|---|
| 1. Fokusraden över årtalet | årtalet y 154–211, fokusraden y 180–242 vid 800 × 360: mitten av datumknappen träffade fokusraden; 844 × 390: 4 px överlapp, nederkanten träffade fokusraden | gäller 800 × 360 och 844 × 390 |
| 2. Fokusraden 84 → 97 px | 62 px vid 800 × 360 för Khmerriket och Anglo-zuluiska kriget, 49 px vid 1280 × 800, 100 px vid 400 × 800 | gäller inte som beskrivet; årtalet följer nu fokusradens höjd oavsett hur hög den blir |
| 3. Kortet 70 px | 70 px vid 800 × 360 | gäller |
| 4. Listans rader mot stegknapparna | 0 träffar tagna av `.timebar .step`/`.play` vid 800 × 360, 844 × 390, 667 × 375, 400 × 800 och 1280 × 800, men listan var 93 px och raderna 18 px | gäller inte som beskrivet; listan var oanvändbar av annat skäl (se beslut 2) |
| 5. Prov av överlapp | saknades | tillkommer |

## Motivering

Den gamla mätningen (storlek på pseudoelementen) såg varken att ett fält låg över årtalet eller att en lista bara hade plats för sin rubrik. Att provtrycka är det enda som visar vad en besökare faktiskt träffar. Layouten ändras bara där telefonen ligger ned; utseendet i övrigt är oförändrat, och inga tidsord eller teckenförklaringar rörs.
