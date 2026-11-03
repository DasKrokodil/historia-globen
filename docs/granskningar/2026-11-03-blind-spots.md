# Fullständig UX- och blind-spots-granskning

**Datum:** 2026-11-03  
**Produkt:** `https://dev.historiagloben.se/?codex_review=2026-11-03-539`  
**Verifierad kod:** `main` `70c2924` (efter PR #537, 2026-11-03)  
**Webbläsare:** Codex in-app Browser  
**Viewport:** 1400 × 900 och 400 × 800  
**Omfattning:** ny användare, lärare, källgranskare, regression och separat blind-spots-runda enligt issue #539.

## Sammanfattning

Kärnflödet fungerar: globen, årshoppet, Samtidigt-kortet, Lager, Fokus, Platt vy, Hjälp och den frivilliga introduktionen går att nå. Inga konsolvarningar eller fel syntes efter de testade flödena, och ingen horisontell scroll uppstod vid 400 px.

Två tidigare missar återkommer och ska inte betraktas som nya fynd: mobilens huvudknappar bryter layouten (#530), och Samtidigt-kortet visar bild och bildlösa händelser med olika visuell tyngd (#508). Den viktigaste nya frågan är att Fokus-panelens filterrubrik och resultatlista kan uppfattas som olika mängder när `Religioner` är valt.

## Testade flöden

- Första besöket i 1400 × 900 och 400 × 800: ingen hjälp- eller introduktionsdialog öppnades automatiskt.
- Globen och markörer: etiketter, kluster och händelsekort syntes; år 1325 och 1879 testades.
- Årshopp till 1879 med textbox och `Gå`.
- Samtidigt vid 1325 och 1879, inklusive blandning av bilder och bildlösa händelser.
- Lager, Fokus med religioner, Platt vy, Hjälp och `Ett år, en plats`.
- Escape från Hjälp återförde fokus till Hjälp-knappen.
- Visad text söktes efter råa nycklar som `longRunning` och `showMore`; inga hittades.
- DOM-kontroll av 400 px: `scrollWidth` och viewportbredd var båda 400 px.
- Konsol: inga `warn` eller `error` efter flödena.

200 % och 400 % webbläsarzoom kunde inte verifieras i detta pass. Det ska kvarstå som en explicit kontroll inför release.

## Kontroll av tidigare fynd

- **#527 Hjälpen öppnas automatiskt:** fungerar. Vid första laddning var ingen hjälp synlig; Hjälp öppnade panelen frivilligt och Escape stängde den.
- **#516 Ett år, en plats öppnas automatiskt:** fungerar. Vid första laddning var ingen introduktion synlig; knappen öppnade en enda dialog.
- **#508 Samtidigt blandar bild och bildlösa händelser:** fungerar inte. År 1879 visar Bell med bild medan Anglo-zuluiska kriget och Fälttåget mot Bắc Ninh får tommare kortytor.
- **#530 Mobil huvudmeny:** fungerar inte ännu. Vid 400 px ligger `Samtidigt`, `Lager`, `Fokus`, `Visa` och `Ett år, en plats` på två rader i sidhuvudet.

## Fynd

### Fynd 1: Mobilens huvudkontroller bryter sidhuvudet

- **Typ:** svårt att använda / visuellt krockande
- **Allvar:** medel
- **Bredd:** mobil
- **Persona:** 12-åring, lärare
- **Dubblett:** #530
- **Steg:** 1. Öppna sidan vid 400 × 800. 2. Läs sidhuvudet och försök hitta huvudfunktionerna.
- **Förväntat:** kontrollerna är samlade och årtal, glob och kort får en stabil yta.
- **Faktiskt:** knapparna bryter raden; `Ett år, en plats` hamnar under de andra och konkurrerar med årtalet och globens innehåll.
- **Rekommendation:** prioritera #530 före fler nya toppnivåknappar. Samla sekundärfunktionerna i en frivillig mobilmeny.

### Fynd 2: Bildlösa händelser ser ut som trasiga bildkort

- **Typ:** reservpresentation som ser ut som fel
- **Allvar:** medel
- **Bredd:** båda, tydligast mobil
- **Persona:** 12-åring, lärare
- **Dubblett:** #508
- **Steg:** 1. Hoppa till 1879. 2. Läs de tre korten högst upp i Samtidigt-kortet.
- **Förväntat:** alla tre kort har en tydlig och likvärdig presentation även utan bild.
- **Faktiskt:** Bell har en bild, medan Anglo-zuluiska kriget och Fälttåget mot Bắc Ninh får betydligt tommare kort. Text finns, men skillnaden kan tolkas som saknade eller trasiga bilder.
- **Rekommendation:** ge bildlösa kort en uttrycklig text-/illustrationsreserv och kontrollera blandade bildlägen i #508.

### Fynd 3: Fokusfilter och resultatlista kan uppfattas som motsägelsefulla

- **Typ:** svårbegripligt tillstånd
- **Allvar:** medel
- **Bredd:** mobil, även relevant på dator
- **Persona:** lärare, källgranskare
- **Steg:** 1. Öppna sidan vid 400 × 800. 2. Tryck `Fokus`. 3. Läs att `Religioner` är valt och att rubriken säger `22 resultat · Filter: Religioner`. 4. Skrolla i panelen.
- **Förväntat:** resultatmängden och listans innehåll visar tydligt vad filtret räknar.
- **Faktiskt:** panelen visar religionsresultat men längre ned även händelser som `Perserkrigen`, vilket kan se ut som att filtret läcker eller att `22 resultat` räknar något annat än listan.
- **Rekommendation:** verifiera i koden om detta är avsiktlig uppdelning mellan fokusobjekt och relaterade händelser. Om ja, ge sektionerna egna rubriker och antal; om nej, filtrera listan konsekvent.

### Fynd 4: Årshoppet är tydligt men tar över nästan hela mobilvyn

- **Typ:** proportion och lägesväxling att bevaka
- **Allvar:** låg
- **Bredd:** mobil
- **Persona:** 12-åring
- **Steg:** 1. Tryck på årtalet. 2. Skriv `1879`. 3. Läs panelen före du trycker `Gå`.
- **Förväntat:** årskontrollen hjälper till utan att dölja orienteringen helt.
- **Faktiskt:** årshoppets panel täcker nästan hela globen på 400 px. Den är begriplig och fungerar, men tillsammans med Samtidigt-kortet blir det många samtidiga lager.
- **Rekommendation:** ingen omedelbar ändring; kontrollera panelens stängning, fokus och 200/400 % zoom i nästa fulla releasekontroll.

## Det som fungerade

- Hjälp och `Ett år, en plats` är frivilliga och öppnas inte längre av sig själva.
- Hjälp stängdes med Escape och fokus gick tillbaka till Hjälp-knappen.
- `Visa` grupperar Platt vy, Källor och Hjälp på mobil.
- Platt vy har egen textalternativbeskrivning och zoomkontroller.
- Årshoppet har textbox, era-knappar och tydliga snabbval.
- Inga råa tekniska nycklar syntes i den testade texten.
- Ingen horisontell scroll syntes vid 400 px och inga konsolvarningar/fel kom från de testade flödena.

## Rekommenderad triage och arbetsordning

1. **#530 nu:** besluta och bygg mobilmenyn, eftersom sidhuvudet påverkar alla andra mobila flöden.
2. **#508 därefter:** lös den blandade bildpresentationen och testa år med flera bildlösa händelser.
3. **Ny bedömning av Fokus:** jämför Fynd 3 med `js/ui/focus.js` och befintliga issues innan ett nytt issue skapas; detta kan vara avsiktlig relaterad information men behöver tydligare rubriker eller antal.
4. **Inför release:** kör om 200/400 % zoom, tangentbordsfokus i alla panelkombinationer och första besök med både introduktion och Hjälp.

## Slutsats

Det roligaste och mest begripligt fungerande är fortfarande kombinationen av glob, år och Samtidigt-kort: besökaren får omedelbart en konkret historisk jämförelse. Det visuella uttrycket är starkt på dator och fungerar tekniskt på mobil. Det mest förvirrande är att mobilens huvudkontroller saknar en gemensam navigationsyta och att bildlösa kort ser mindre färdiga ut än kort med bild. Nästa fulla granskning bör lägga mer vikt vid lägeskombinationer och vid skillnaden mellan en filtrerad mängd och relaterad information.
