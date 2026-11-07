# Benchmark: historieatlaser, kunskapsspel, skolmaterial och dataportaler (#759)

Datum: 2026-11-07. Syftet är idéer att inspireras av för skolpiloten (version 6), inte kopiering. Inget är kopierat. Varje sida har öppnats 2026-11-07 från molnsessionen (renderad i Chromium eller läst som text), och det som står under "Såg" är det jag faktiskt såg på sidan. Det som inte gick att se står under "Kunde inte kontrollera". Idéerna är mina egna förslag och är märkta som det.

**Så är det gjort:** 12 sidor i fyra grupper. Licens, konton och pris anges bara när de stod på sidan. Villkorssidor har lästs där de gick att öppna. Licensregeln i CLAUDE.md gäller: kod och data som vi kopierar ska vara CC0, CC BY, public domain eller liknande. CC BY-NC och CC BY-SA är bara länkade källor.

## Översikt

| # | Sida | Grupp | Licens eller villkor (som det stod) | Konto eller pris |
| --- | --- | --- | --- | --- |
| 1 | [Chronas](https://chronas.org/) | Atlas | Ej angiven på landningssidan | Inget synligt |
| 2 | [GeaCron](https://geacron.com/) | Atlas | "All Rights Reserved" | Inget synligt |
| 3 | [Histography](https://histography.io/) | Tidslinje | Ej angiven | Inget synligt |
| 4 | [TimeMaps](https://timemaps.com/) | Atlas och skolmaterial | Ej angiven | Konto (Login), några kartor "currently free" |
| 5 | [Seterra](https://www.seterra.com/) | Spel | Ej angiven | Gratis ("Play now free"), Log in finns |
| 6 | [GeoGuessr](https://www.geoguessr.com/) | Spel | Ej angiven | Registrering krävs för att spela, Pro kostar |
| 7 | [Gapminder](https://www.gapminder.org/) | Data och kunskapsquiz | CC BY 4.0 för "free material" | Gratis, Log in finns |
| 8 | [Our World in Data](https://ourworldindata.org/) | Data | CC BY på egna diagram, tredje part kan ha andra villkor | Gratis |
| 9 | [Seshat](https://seshat-db.com/) | Data | CC BY-SA 4.0 | Gratis konto krävs för nedladdning |
| 10 | [OpenHistoricalMap](https://www.openhistoricalmap.org/) | Data | CC0 (med undantag) | Gratis, konto för att redigera |
| 11 | [TeachingHistory.org](https://teachinghistory.org/) | Skolmaterial | CC BY-NC-SA 3.0 | Gratis |
| 12 | [Skolverket](https://www.skolverket.se/) | Skolmaterial | Ej undersökt | Gratis |

**Direkta länkar till det som verifierades** (öppnade 2026-11-07), så att licens- och skolpåståendena går att kontrollera:

| Påstående | Sida |
| --- | --- |
| Skolverkets nya läro- och kursplaner, remiss 9 november 2026–20 januari 2027 | https://www.skolverket.se/om-skolverket/nyheter-och-pressmeddelanden/nyheter/nyheter/2026-11-04-manga-forandringar-i-de-nya-laro--och-kursplanerna |
| Gapminder: CC BY 4.0 för "free material" | https://www.gapminder.org/free-material/ |
| Our World in Data: CC BY på egna diagram, tredje part kan ha andra villkor | https://ourworldindata.org/faqs |
| Seshat: CC BY-SA 4.0, konto för nedladdning | https://seshat-db.com/terms/current/ |
| OpenHistoricalMap: CC0 med undantag | https://www.openhistoricalmap.org/copyright |
| TeachingHistory.org: CC BY-NC-SA 3.0 | https://teachinghistory.org/about/ |
| GeoGuessr Pro: pris, annonsfritt | https://www.geoguessr.com/pro |
| TimeMaps: lärarnoter och "currently free" | https://timemaps.com/timemaps-for-education/ |

## Historieatlaser och tidslinjer

### 1. Chronas (chronas.org)
- **Såg:** "Interactive Historical Map", metabeskrivning: "Explore world history through an interactive map spanning 5000 years". Vänsterspalt med ikoner (bland annat lager och sök), en tidslinje längst ned med årtal och epokband (Ancient, Classical, Early Medieval, High Medieval …), en länk "Let us know on GitHub" och en länk till "Classic version". Kartans underlag anges som "Relief: Natural Earth".
- **Kunde inte kontrollera:** själva kartinnehållet. Sidan visade "Error Loading Data. Unable to connect to the server" i vår session (dataservern ligger troligen på en värd som inte är tillåten här). Licens och koddetaljer syns inte på landningssidan.
- **Passar:** epokbanden som rubriker i tidslinjen, och att sidan har en synlig väg till felrapport.
- **Passar inte (hypotes, inte kontrollerat):** att sidan visade ett laddningsfel här kan bero på att den hämtar data från en server, men det är inte belagt; felet kan lika gärna bero på vår sessions nätverk. Jag drar därför ingen slutsats om arkitekturen.

### 2. GeaCron (geacron.com)
- **Såg:** "World History Maps & Timelines", "Interactive World History Atlas since 3000 BC", "Kingdoms, Battles, Expeditions. Comparative History, Political, Military, Art, Science, Literature, Religion, Philosophy. Maps based on vector database". Längst ned: "Copyright © 2011 – geacron.com – All Rights Reserved", länkar till villkor och integritet, samt en cookiebanner.
- **Kunde inte kontrollera:** själva atlasen (bara öppningssidan öppnades) och villkorssidan (gick inte att nå).
- **Passar:** begreppet "comparative history" ligger nära vår idé om samtidighet; en jämförelsevy mellan platser.
- **Passar inte:** all rights reserved, så inget går att återanvända. Bara som inspiration.

### 3. Histography (histography.io)
- **Såg:** "Interactive timeline that spans across 14 billion years of history, from the Big Bang to 2015". Introtexten: "every dot is a historic event from Wikipedia", "Resize the bottom bar to view any time period or era". Epoknamn som genvägar (The Beginning, Earth Formation, … Stone Age, Bronze Age, Iron Age, Middle Ages, Renaissance, Industrial Age, Information Age), en knapp "Feeling lucky" och en meny för "Editorial stories". Sidan är märkt [BETA] och skapad av Matan Stauber. I vår session hann sidan inte visa tidslinjen (laddningsskärm).
- **Kunde inte kontrollera:** licens och hur händelserna rent praktiskt visas när man rullar.
- **Passar:** epoker som snabbknappar bredvid tidslinjen, och en slumpknapp. Vi har redan "Visste du?", som väljer en balanserad fun fact (inte ren slump, `pickBalancedFunFact` i `js/ui/funfact.js`); samma idé kan väljas för en tidsperiod.
- **Passar inte:** bygger på stora mängder Wikipedia-händelser utan vår källkontroll.

### 4. TimeMaps (timemaps.com)
- **Såg:** "The Timemaps Atlas of World History contains over 1,000 maps". Menyn har Atlas, Encyclopedia, Teachers och "My Account Login / Logout". Sidan "TimeMaps for Education" beskriver nivåer ("Level 2: Big Regions of the World"), kartserier med årtal (3500 BCE … 2005) där två är märkta "(currently free)", och material med "+ Teachers Notes" och "multi-resource unit": en bildspelsdel, en kartserie och vägledning för lärare och elever.
- **Kunde inte kontrollera:** vad som gäller för de kartor som inte är märkta gratis, priser och licens.
- **Passar:** lärarnoter som hör ihop med varje karta, och uppdelningen i nivåer (värld, stora regioner). Det stämmer med lärarfälten i turerna (#737).
- **Passar inte:** konto och troligen betalda delar (ej verifierat).

## Geografi- och kunskapsspel

### 5. Seterra (seterra.com)
- **Såg:** "Master Geography with +400 Map Quizzes. Made for those who teach, those who learn, and those who wonder", "Play now free", flera språk inklusive svenska, kategorier som Europa, Asien, Afrika, Världen, Flaggor och Anatomi och vetenskap, och en egen länk **Printables** ("Educator? Download printouts"). Pricing-länken leder till geoguessr.com/pro.
- **Kunde inte kontrollera:** poängsystem, tidsgränser och exakt vad som är gratis jämfört med betalt.
- **Passar:** utskrivbara blad för lärare, snabba rundor med en karta, och att samma övning finns på många språk. Det stämmer med utskriften i #738 och quizet i #65.
- **Passar inte:** annonser eller konto kan förekomma (ej verifierat); inget att kopiera.

### 6. GeoGuessr (geoguessr.com)
- **Såg:** startsidan kräver registrering ("Sign up to play", Google, Apple, Facebook eller e-post). "Get dropped anywhere from the busy streets of New York to the beautiful beaches of Bali", "Play with Friends" (privat parti), tävlingar, och "GeoGuessr for organizations" med Pro-prenumeration. Prissidan visar "Limited FREE TO TRY", USD 3,99 respektive 5,99 per månad vid årsbetalning, och "Ad-free". Där finns också "Creator mode: Create custom maps & quizzes".
- **Kunde inte kontrollera:** hur skolkonton fungerar och vad gratisläget tillåter.
- **Passar:** privata parter där flera spelar samma runda, och att läraren kan skapa egna uppdrag. Vi har redan elevuppdraget Samtidighetsjakten (#741).
- **Passar inte:** konton och betalning, vilket går emot ett öppet projekt utan konton.

## Dataportaler

### 7. Gapminder (gapminder.org)
- **Såg:** "an independent educational non-profit fighting global misconceptions". Startsidan har en 18-frågors quiz om FN:s mål och påståendet "You are probably wrong about …" med teman som fattigdom, migration och elektricitet, samt "We have tested thousands of people and they were systematically wrong about all this". Sidan "Free material" säger: "freely available under the Creative Commons Attribution 4.0 International license", med en färdig citeringstext ("FREE TO USE! CC-BY GAPMINDER.ORG") och exempel.
- **Kunde inte kontrollera:** själva visualiseringsverktyget (tid, bubblor), så jag beskriver inte dess kontroller.
- **Passar:** quiz som utgår från vanliga missuppfattningar och visar facit, samt en färdig citeringsmening. CC BY 4.0 är förenlig med våra regler.
- **Passar inte:** inget hinder; materialet handlar om nutida data, inte historia.

### 8. Our World in Data (ourworldindata.org)
- **Såg:** "Research and data to make progress against the world's largest problems", "14 037 charts, 126 topic pages, 26 data explorers", "All free: open access and openly licensed". FAQ: "Unless otherwise stated, you can use, reproduce, and distribute any chart we made (those with our logo and CC BY copyright stamp), provided that you cite us", "You do not need permission from us", med en färdig källhänvisning ("Retrieved from: …") och nedladdning av diagram. Samma FAQ säger att många diagram bygger på tredje part (WHO, FN, Världsbanken) vars licens gäller.
- **Kunde inte kontrollera:** tidsreglagets beteende och inbäddning i detalj.
- **Passar:** tydlig källhänvisning direkt vid varje diagram, och en nedladdningsknapp. Vi har en affischfunktion och en Källor-sida; en kopierbar "Så här citerar du" per händelse vore ett nästa steg.
- **Passar inte:** licensen är blandad, så ingen data får kopieras utan att den enskilda källan kontrolleras.

### 9. Seshat: Global History Databank (seshat-db.com)
- **Såg:** "the most current and comprehensive body of knowledge about human history", flikar för Variables, Objects, World Map och Connect, siffror som "coded for 264 Polities". Användarvillkoren: gratis konto krävs för att ladda ned CSV/JSON, och data ligger under "Creative Commons Attribution–ShareAlike 4.0 International (CC BY-SA 4.0)".
- **Kunde inte kontrollera:** hur världskartan fungerar och vilka riken som ingår.
- **Passar:** som kontrollkälla för riken och tidsperioder (länkad källa).
- **Passar inte:** CC BY-SA är inte förenlig med vår datalicens (CC BY 4.0), så inget får kopieras in i `data/`. Konto krävs för nedladdning.

### 10. OpenHistoricalMap (openhistoricalmap.org)
- **Såg:** "interactive map of the world over time", copyright-sidan: "Except where otherwise noted, OpenHistoricalMap data is dedicated to the public domain under a Creative Commons CC0 dedication", med undantag för enskilda objekt under CC BY eller CC BY-SA (anges i `license`-taggar), och kartstilarna är CC0. Menyn har Edit, History, Export, Log In och Sign Up.
- **Kunde inte kontrollera:** hur täckningen ser ut per period och världsdel, och hur kartans tidsreglage fungerar.
- **Passar:** CC0 är förenligt med våra regler. Värt en liten test för gränser eller platser, men bara om täckningen är god (ej undersökt).
- **Passar inte:** bidragen kan innehålla enskilda objekt med CC BY-SA och måste filtreras per objekt.

## Skolmaterial

### 11. TeachingHistory.org (teachinghistory.org)
- **Såg:** "a comprehensive resource for history educators, providing lesson plans, primary sources, and teaching strategies". Menyn: Teaching Materials, History Content, Best Practices, Digital Classroom. Startsidan nämner "Historical Thinking Matters" med uppsättningar primärkällor. "Except where otherwise noted, the content on this site is licensed under a Creative Commons Attribution Non-Commercial Share Alike 3.0 License."
- **Kunde inte kontrollera:** de enskilda lektionernas uppbyggnad.
- **Passar:** primärkällor kopplade till en historisk fråga, som en modell för våra lärarfält.
- **Passar inte:** CC BY-NC-SA, så bara länkar och idéer, ingen text.

### 12. Skolverket (skolverket.se)
- **Såg:** nyheten **2026-11-04 "Många förändringar i de nya läro- och kursplanerna"**: nya läro- och kursplaner för grundskolan föreslås, "kursplanerna är mer ämnesspecifika och konkreta", och förslagen skickas på remiss. **Remissperioden börjar den 9 november 2026** (två dagar efter rapportdatumet) **och pågår till den 20 januari 2027**, enligt nyheten. Startsidan har kategorier som Undervisning, Prov och bedömning och Statistik.
- **Kunde inte kontrollera:** exakt vad förslaget säger om historia, och när de nya planerna börjar gälla.
- **Passar:** bevakning. Lgr22-hänvisningarna ligger i turdatan (`data/turer/vikingatiden-och-varlden.json` och `data/turer/andra-varldskriget.json`, 10 träffar vardera) och utskriften (#738) läser dem därifrån; om kursplanen för historia ändras kan de bli inaktuella.
- **Passar inte:** inget att återanvända; det är källan till kraven.

## Sidor som inte gick att öppna
- **Library of Congress (loc.gov/programs/teachers):** bot-kontroll ("Just a moment …") i vår session.
- **Khan Academy:** "Client Challenge", kräver en riktig webbläsare med JavaScript.
- **National Archives (Storbritannien, utbildning):** bara cookiebanner syntes; innehållet lästes inte.
- **Pleiades (pleiades.stoa.org):** öppnades och licensen läst (CC BY 3.0, "Using, sharing, and remixing … is permitted"), men ingen närmare undersökning gjordes, så den ingår inte bland de 12.

## Förslag till issues (triageras av Claude Code, skapas inte här)
1. **Bevaka Skolverkets nya kursplaner** före skolpiloten (#743, #744): kontrollera vad som ändras i historia när remissen är avslutad (20 januari 2027) och om Lgr22-hänvisningarna i de två turerna (och därmed utskriften, #738) behöver uppdateras. Konkret, ingen ny funktion.
2. **"Så här citerar du"** vid händelse eller affisch (idén från Gapminder och Our World in Data): en kopierbar källhänvisning. Kräver beslut av Rikard, eftersom det ändrar hur sidan fungerar för besökaren.
3. **Epoker som snabbknappar** vid tidslinjen (idén från Histography och Chronas): till exempel Stenåldern, Bronsåldern, Medeltiden. Kräver beslut. Hör ihop med #298 (läsbar tidslinje) och eventuell tidsmodell (#396).
4. **Missuppfattningsquiz i quizet** ("Vad tror du kom först?" med facit, idén från Gapminder): kräver beslut, ligger nära #65.
5. **Testa OpenHistoricalMap som kontrollkälla för platser** (CC0): liten undersökning, ingen ändring av data. Bara om någon vill pröva täckningen.

Inga andra filer ändras i den här pull requesten.
