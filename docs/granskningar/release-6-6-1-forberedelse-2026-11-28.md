# Förberedelse inför releasen av 6.6.1 Sveriges landskap (2026-11-28)

**Inget är släppt.** Rapporten förbereder releasen; den publiceras först efter DasKrokodils godkännande. Modellnivå: Opus. Skriven av Claude Code på DasKrokodils konto.

## 1. Vad som ingår

- **25 svenska landskap** som platser av typen `landskap` i `data/platser.json`, alla med `partOf: sverige`. Gränserna kommer ur Lantmäteriets distriktsindelning via perliedman/svenska-landskap (CC0), klippta mot Natural Earth 1:10m (beslut 2026-11-27, #1847).
- Landskapens händelser: 175 händelser ligger inom landskapens gränser (mätt med `placeEvents()` för alla 25 landskap). I landskapens pull requests (`Sveriges landskap: …`) ändrades 133 händelserader, 84 `source-checked` och 49 `two-sources`.
- Gränssnitt: landskapen når man via platskortet (spåret #1853). Jag har inte kontrollerat gränssnittet i webbläsare i den här rapporten, se punkt 4.
- Beslutet om att Skåne behåller Natural Earths länskontur tills vidare (beslutet 2026-11-27, punkt 3) gäller fortfarande.

## 2. Expertgranskning i batch (beslut 2026-11-23)

| Expert | Gjort | Resultat |
|---|---|---|
| `historiker` | Stickprov om 28 händelser över alla sju periodfiler, källor öppnade med WebFetch | 1 Fel, 3 Förbättring, 3 Notering. Under beslutets tröskel (fler än ett fel per tio). Underlag: [underlag/2026-11-28-stickprov-historiker-6-6-1.md](underlag/2026-11-28-stickprov-historiker-6-6-1.md) |
| `geograf` | Alla 25 landskap, ytor och grannar, koordinater för 83 händelser mot Wikidata, fem Wikipedia-sidor öppnade | 0 Fel, 4 Förbättring, 6 Notering. Underlag: [underlag/2026-11-28-stickprov-geograf-6-6-1.md](underlag/2026-11-28-stickprov-geograf-6-6-1.md) |
| `ux-tillganglighet` | **Inte körd.** Behövs först när gränssnittet som ändrats sedan förra releasen är känt; körs i release-pull requesten. | – |
| Översättningspass | Historikern kontrollerade maskinellt siffror och språk i alla 133 ändrade händelser (inga avvikelser mellan sv och en/de/es/fr, inga saknade språk) och läste cirka 12 översättningar helt, utan anmärkning. **Ett fullständigt pass av `sprak-de/en/es/fr` är inte gjort.** | Delvis |

## 3. Fynd (fil | id | problem | förslag | nivå)

Rättat i den här pull requesten: **ingenting** i data. Det enda Felet (Ölandsbron) kräver ändring av fem språk, genererade filer och en källnot; det blir ett eget issue enligt vanliga regler.

| fil | id | problem | förslag | nivå |
|---|---|---|---|---|
| data/handelser/1946-1979.json | olandsbron-invigs | "Färjorna slutar gå" och "turismen växer kraftigt" står inte i någon öppnad källa; källnoten för `wp-sv-olandsbron` påstår att färjetrafiken upphörde, vilket artikeln inte säger | Stryk de två meningarna (fem språk) och rätta noten, eller hitta en öppnad källa | **Fel** |
| data/handelser/1900-1945.json | skansen-hultet | "inga befästningar fått finnas sedan 1905" överdriver källan, som säger att man 1905 "förutsatte" att gränsfästningar inte behövdes; "öppen för besökare" saknas i källan | Skriv om efter källan | Förbättring |
| data/handelser/1980-.json | hoga-kusten-blir-varldsarv | "nästan 300 meter" mot 285 och 286 m i Lex och SNL | "omkring 285 meter" eller "nästan 300 meter enligt Wikipedia" | Förbättring |
| data/handelser/1946-1979.json | forsta-hennes-butiken | Wikipedia anger 1968 för köpet av Mauritz, Lex mitten av 1960-talet; ingen `note` | Lägg en `note` om avvikelsen | Förbättring |
| data/handelser/fkr.json | sagaholmshogen | Spannet 1475–1215 f.Kr. bygger på en enda C14-datering; oklart om det är kalibrerat | Skriv det öppet i `note` | Förbättring |
| data/handelser/1980-.json | falu-gruva-blir-varldsarv, halsingegardar-blir-varldsarv | `two-sources` vilar på svensk och engelsk Wikipedia (inte oberoende) och Wikidata; Unescos sida är inte öppnad | Öppna Unesco-sidan eller sänk till `source-checked` | Förbättring |
| data/handelser/1500-1799.json | bohuslan-blir-svenskt | Wikipedia 1524, SNL 1523–1532; avvikelsen redovisas redan i `note` | Ingen ändring | Notering |
| data/handelser/1800-1899.json, 1900-1945.json, 1980-.json | regeringsformen-1809, allman-rostratt-for-man-1911, kvinnor-rostar-1921, sverige-gar-med-i-eu | Riksomfattande händelser (`locationPrecision: country`) visas i Upplands kort bara för att Stockholms punkt ligger där | `scope: "wide"` efter beslut | Förbättring |
| data/handelser/1800-1899.json | nodaren-1867-1869 | Uppfunnen punkt [18.5, 64.8] i Lappland, medan texten nämner flera län och Västerbotten | Flytta till en källbelagd punkt eller `scope: "wide"` | Förbättring |
| data/platser.json | skane (landskap) | Konturen är Natural Earth Skåne län, inte Lantmäteriets landskap: 237 km² utanför landskapet, överlapp med Halland, Småland och Blekinge (94, 122, 42 km²) | Känt och uppskjutet i beslutet 2026-11-27, punkt 3 | Notering |
| data/platser.json | landskapen Blekinge och Norrbotten | Händelserna i Karlskrona och Luleå hamn ligger utanför de klippta polygonerna och räknas dit bara via kustmarginalen | Skört om polygonerna förenklas om | Notering |
| data/platser.json | uppland och sodermanland | Gränsen går genom Stockholm (Södermalm, Slussen och Nacka i Södermanland, Gamla stan i Uppland), enligt källfilen | Förklara i landskortets text | Notering |
| data/platser.json | lappland, jamtland, harjedalen, vastergotland | Bara tre händelser vardera; samiska händelser från granskningen 2026-11-27 (Ájtte 1989, landsmötet i Östersund 1918) är inte inlagda | Fyll i en omgång | Notering |
| data/handelser/1800-1899.json | kristinebergs-havsstation (punkt) | Punkten är inte oberoende kontrollerad (Wikipedia gav bara en tvetydighetssida) | Öppna en annan källa | Notering |

## 4. Vad stickproven inte kunde kontrollera

- Wikidata öppnades inte av historikern och gav 429 för ungefär hälften av geografens uppslag; geografens stickprov av koordinater är därför delvis cirkulärt (händelsernas punkter kommer till stor del ur Wikidata).
- Unescos sidor och Lantmäteriets original (Geotorget, kräver inloggning) öppnades inte.
- Sex av historikens utvalda händelser hann inte kontrolleras (`halland-blir-svenskt`, `guldmalmen-i-boliden`, `kapitulationen-i-kalix`, `bessemerstal-i-edsken`, `ringhals-forsta-strom`, `halsingegardar-blir-varldsarv`).
- `tools/tackning.py` kördes inte för landskapen, och hållbarhetsvarningarna (`tests/hallbarhet-test.py`) kördes inte. De körs i release-pull requesten.
- Hela webbläsartestet och UX-genomgången i dator och 400 px är inte gjorda här.

## 5. Backlog review (enligt beslutet 2026-11-12)

**Delvis gjord.** Jag har inte kunnat lista milstolparnas innehåll via de verktyg som finns i den här sessionen (ingen filtrering på milstolpe), så följande är bara det jag såg:

- **Milstolpe 6.6.4** (Östeuropa, mikrostater, pilotländer) står i versionsplanen som "startar efter utvärderingen". Beslutet 2026-11-28 (pull request 2476, ännu inte ihopslagen) ändrar det; versionsplanen behöver följa med när den slås ihop.
- **`redo`:** 50 öppna issues har `redo` (landkortets förbättringar #2469–#2475, bildserien #2462–#2467, Östeuropa #1843–#1846, södra Europa och Balkan #1828–#1842, pilotländerna #1273, #1270–#1272 är nu tagna, översättningsgranskningar #806–#901 från början av november). De äldsta översättningsissuena (#806–#835, sju till nio veckor gamla) bör ses över: är de fortfarande aktuella efter alla senare översättningspass? Förslag, inget ändrat.
- **`pågår`:** #2178, #2022, #1962, #1827 (Codex) och de jag tagit i dag (#1270–#1272, #2392).
- **Stängda issues:** #2390 är stängd (PR 2436 slogs ihop), men milstolpens text för 6.7.0 nämner fortfarande rikesarbetet; kontrollera den vid releasen.
- **`utvärdering`:** #1274 har fått en förhandsutvärdering (rapport 2026-11-28); den riktiga görs när Etiopien, Peru och Australien har kort.
- **Dubbletter och föråldrade issues, issues utan milstolpe, `beslut-krävs`:** ej genomgångna. Det görs i release-pull requesten med full åtkomst till milstolparna.
- **Översättningsläget:** ej omräknat här; `python3 tools/oversattning.py` körs i release-pull requesten.

## 6. Frågor till DasKrokodil

1. **Ska de fyra riksomfattande händelserna** (regeringsformen 1809, allmän rösträtt för män 1911, kvinnor röstar 1921, EU 1995) få `scope: "wide"` så att de inte visas i Upplands kort? Ändringen ändrar vad kortet visar.
2. **Ska Skåne få Lantmäteriets landskapskontur nu** (237 km² avvikelse mot Natural Earths länskontur) eller vänta enligt beslutet 2026-11-27?
3. **Får de svagaste landskapen** (Lappland, Jämtland, Härjedalen, Västergötland, tre händelser vardera) en egen fyllnadsomgång före releasen, inklusive de samiska händelserna från granskningen 2026-11-27, eller släpps 6.6.1 som den är?
4. **Hur ska Ölandsbron-felet hanteras:** stryka de två meningarna (förslag) eller vänta på en källa? Jag skapar ett issue.
5. **Ska UX-granskningen** (`ux-tillganglighet`) och ett fullständigt översättningspass köras före releasen, eller räcker stickprovet?
6. **Släpper vi 6.6.1 före landkortens förbättringar** (#2469–#2475) eller efter?
