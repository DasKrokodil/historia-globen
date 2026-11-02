# Fullständig analys av dev.historiagloben.se

**Datum:** 2026-11-02  
**URL:** https://dev.historiagloben.se/  
**Senast verifierad kod:** `main` `8862b01` (release v4.1.1)  
**Syfte:** användartest, produkt- och skolperspektiv, teknisk översikt och roadmap-underlag.

## Kort slutsats

Historia-globen har en stark kärna: tidslinjen, globen, samtidighetskortet, fokuslägena och den öppna källredovisningen hänger ihop och fungerar i både dator- och mobilbredd. Den viktigaste bristen är introduktionen **Ett år, en plats**: den startar automatiskt som en modal första gången, samtidigt som sidan visar ett annat aktuellt år. Det skapar både ett oväntat avbrott och en begriplighetskrock.

Rekommenderad produktbeslutning är att göra introduktionen helt frivillig och synlig som en egen funktion under **Utforska**, med namnet **Ett år, en plats**. Den ska inte krävas för att snurra, dra i tidslinjen eller prova globen. Detta stämmer med det beslut som redan har kommenterats på issue #363.

## Testomfattning

Testet genomfördes i verklig inloggad webbläsarsession mot dev:

- dator: 1400 × 900
- mobil: 400 × 800
- nya URL-parametrar användes för att skilja testladdningar åt
- testade: första besök/introduktion, markör och händelsekort, årshopp, Samtidigt, kategori-filter, Lager, Fokus för krig/rike/religion, Platt vy, Om källorna, hjälp och mobilmenyn
- konsolloggen efter flödena: inga fel eller varningar
- mobilkontroll: ingen horisontell scroll; Platt vy fick plats i 400 px

Begränsningar: svarstatusar från nätverket och 200 procents webbläsarzoom kunde inte verifieras med den tillgängliga webbläsarytan. Tangentbordsfokus kunde inte avgöras säkert eftersom automatiseringen inte flyttade fokus från årsfältet; det bör få ett separat manuellt eller Playwright-test.

## Prioriterade fynd

### 1. Hög prioritet – den automatiska introduktionen bryter första mötet

**Observerat:** vid en ny session öppnas dialogen `Ett år, en plats` automatiskt. Den säger `Börja med en händelse på globen` och visar Eiffeltornet 1889 i Paris. Bakom dialogen står globen på år 1325 med Tenochtitlan och Ibn Battuta.

**Varför det spelar roll:** besökaren möts av en popup innan hen valt att lära sig funktionen. Dessutom beskriver dialogen ett exempelår som inte är sidans aktuella år. En yngre användare kan tro att sidan bytt läge eller att globen inte svarar.

**Minsta säkra lösning:** ta bort automatisk öppning och gör funktionen frivillig. Lägg en egen knapp under `Utforska`, döpt till `Ett år, en plats`. Behåll möjligheten att starta samma flöde därifrån. Lägg inte funktionen under `Hjälp` som primär placering.

**Berör:** issue #363 och den öppna PR:n #512, som behöver följa det nya produktbeslutet innan den kan betraktas som färdig.

### 2. Medel – introduktionsfunktionen är svår att hitta på rätt sätt

I `Hjälp` finns `Visa introduktionen igen`, medan funktionen enligt produktbeslutet är en frivillig upptäckaraktivitet, inte hjälp eller felsökning. Den bör ha en egen plats bland utforskarfunktionerna. Hjälp bör i stället förklara befintliga kontroller och begrepp.

### 3. Medel – flera samtidiga ingångar belastar första minuten

På datorn finns globen, årskontroll, tre tydliga funktionsknappar, `Visa`, Samtidigt-kortet, tidslinjen och markörer samtidigt. Alla fungerar, men första användningen kräver att besökaren förstår flera nivåer av gränssnittet. Gör inte den automatiska introduktionen till ytterligare ett krav. En frivillig knapp och en kort, statisk förklaring räcker som nästa steg.

### 4. Medel – räknaren i Samtidigt behöver förklaras bättre

Knappen visar exempelvis `Samtidigt 7`, medan panelen skiljer mellan händelser som pågår exakt på valt år och händelser inom ett toleransintervall, till exempel `5 händelser pågår år 1500, 11 till inom ±38 år`. Det är datamässigt informativt men inte omedelbart självförklarande. Rekommendation: visa en kort förklaring nära räknaren eller kalla den exempelvis `Samtidigt – 7 träffar` och särskilj `pågår nu` från `nära i tid` i panelens rubrik.

### 5. Låg/medel – år 1500 ger ett mycket stort upptäckarflöde

I `Samtidigt` fungerar världsdelar, kategorier och `Visa alla`, men ett år med mycket innehåll ger snabbt en lång lista. Det är bra för avancerad användning och lärare, men standardläget bör fortsätta prioritera en kort, begriplig första vy. Sökning eller en tydligare sortering kan komma efter den tekniska grunden, inte före den frivilliga introduktionen.

### 6. Låg – källsidan är stark men kan sammanfattas för nya besökare

`Om källorna` visar granskningsstatus, grupper, sökning och ett stort totalt källantal. Det är ett starkt förtroendebyggande inslag. För ovana besökare är skillnaden mellan kontrollerad källa, två källor och historisk osäkerhet dock ganska tät. En kort sammanfattning med tre nivåer och ett filter för status skulle göra sidan lättare att använda utan att ta bort detaljerna.

## Det som fungerade väl

- Händelsekortet visar sammanfattning, datum, plats, osäkerhet, källor och granskningsstatus på ett spårbart sätt.
- `Samtidigt` grupperar globalt och visar både exakta och närliggande träffar.
- Lagerpanelen har begriplig struktur, förklaringar och legend.
- Fokus fungerar för ett krig, ett rike och en religion, inklusive berättelse, tidsförflyttning och källor.
- Platt vy är tillgänglig och användbar även på 400 px bredd.
- Mobilens sammanfattade toppmeny och `Visa`-meny håller sidan inom bredden utan påvisad horisontell scroll.
- Konsolen var ren i den genomförda testomgången.
- Tenochtitlan-kortets ungefärliga datering är rimligt presenterad. Den historiska källan beskriver grundandet som 1325 men anger att exakt datum är omdiskuterat; det stöder att sidan inte visar falsk precision. Se [Wikipedia: Tenochtitlan](https://en.wikipedia.org/wiki/Tenochtitlan).

## Produkt- och skolperspektiv

Den mest värdefulla skolnyttan är inte fler funktioner i första hand, utan att eleven kan jämföra samma år på flera platser och sedan följa en fördjupning. Den ordningen finns redan i produkten. Prioritera därför:

1. tydlig frivillig start för `Ett år, en plats`;
2. lättare begrepp kring `Samtidigt` och källstatus;
3. stabilitet, tangentbord och zoom;
4. därefter guidningar och skoluppdrag.

Behåll den globala bredden som ett kvalitetskrav. Den här testomgången visade träffar i Europa, Asien, Afrika och Amerika, men är inte en fullständig täckningsmätning och ska inte användas som bevis på jämn global representation.

## Teknisk bedömning

Kärnarkitekturen uppförde sig stabilt i användartestet: centralt år, lager, paneler och fokuslägen reagerade korrekt, och inga konsolfel syntes. Den automatiska introduktionen bör lösas som ett avgränsat UI-/flödesarbete och inte genom att göra introduktionen till ett nytt globalt tillstånd som alla andra lager måste känna till. Om PR #512 redan har kopplat popupen till första besöket bör den kopplingen tas bort eller göras explicit användarstyrd.

Öppen PR vid granskningen: [PR #513](https://github.com/DasKrokodil/historia-globen/pull/513), med fokus på hopfällbara grupper och tidsåldrar. Den bör inte blockera rapporten, men ändringar i fokusmenyn ska provköras tillsammans med denna analys innan en sådan PR slås ihop.

## Roadmap och rekommenderad arbetsordning

### Milstolpe 4.2 – gör nu

1. Anpassa #363/PR #512 till beslutet: ingen automatisk popup; egen frivillig knapp `Ett år, en plats` under `Utforska`.
2. Förtydliga Samtidigt-räknaren och behåll den korta standardvyn.
3. Slutför tillgänglighetskontrollen för tangentbord och zoom (#362) med ett reproducerbart test, inte bara visuell kontroll.
4. Kör om full webbläsarsvit i dator- och mobilbredd efter ändringarna, särskilt första besök, Samtidigt, Fokus, Platt vy och Källor.

### Därefter 4.3

Fortsätt med central state-/modulgrund, lättare mobilrendering, schema och bildlager enligt befintlig plan. Undvik att lägga sök, delning eller skoluppdrag före denna stabilisering.

### Senare

Guidade berättelser och skolpilot är rimliga när den frivilliga introduktionen och tillgänglighetsgrunden är stabil. SEO, sök och delning bör planeras mot samma event- och källmodell, inte som separata speciallösningar.

## Föreslagen kön

- **Kan börja nu:** ändringen av introduktionens start- och placering enligt #363; liten förtydligandejustering av Samtidigt om den hålls avgränsad.
- **Efter PR #513:** om fokusmenyn eller dess grupper ändras i den öppna PR:n, kör integrationskontroll efter att den är granskad eller stängd.
- **Efter Claude Code-granskning:** alla ändringar som påverkar central UI, fokus, tidslinje, mobil layout eller tillgänglighet.

## Nya issues

Inga nya issues skapades i denna analys. De viktigaste observationerna överlappar #363 och befintliga 4.2-planer. Nya issues bör först skapas efter triage så att de inte duplicerar #362, #363 eller #513.

