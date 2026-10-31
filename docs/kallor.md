# Källor och granskning

Inget påhittat ska hamna på globen. Den här sidan beskriver hur uppgifter kontrolleras, vilka källor som får användas och hur du kan bidra. De bindande reglerna står i [CLAUDE.md](../CLAUDE.md#källpolicy--viktigast-av-allt).

## Grundregler

1. **Ingen uppgift utan källa.** Varje händelse, fun fact, rike och bild pekar på minst en post i `data/sources.json`, med titel, länk, licens och datum då källan kontrollerades.
2. **Inget ur minnet.** En ny uppgift är ett utkast tills någon har öppnat källsidan och sett att årtal, plats och påståenden stämmer.
3. **Osäkerhet visas öppet.** Skriv "cirka", "troligen" eller ett spann i stället för en falskt exakt siffra. Om källorna är oense skrivs det ut.
4. **Egna ord.** Texterna är egna korta sammanfattningar. Text kopieras aldrig från källan.
5. **Jämförelser kan räknas fram.** En siffra i en fun fact, till exempel "229 år", ska gå att räkna fram ur händelsernas årtal.

## Granskningsnivåer

| Nivå (`review`) | Betydelse | Syns på globen |
|---|---|---|
| `draft` (utkast) | Inlagd men inte kontrollerad | Nej |
| `source-checked` (källa kontrollerad) | Källsidan är öppnad, och årtal, plats och påståenden stämmer | Ja |
| `two-sources` (två källor stämmer) | Årtal och plats stämmer också med en andra, oberoende källa, till exempel Wikidata. Båda står i `sources`. | Ja |

Det är källkontrollen som gäller. Ingen människa granskar uppgifterna i efterhand; vi litar på det källorna säger (beslut 2026-10-30, #252). Är källorna oense skrivs det öppet, till exempel i händelsens `note` ("Källorna skiljer sig"), och nivån höjs inte till `two-sources`.

Nivån syns i faktarutan och under Om källorna, inte som eget märke på globen. Statusraden säger bara källnivån, till exempel "Händelsen: två källor stämmer" eller "Fun facten: källkontrollerad".

## Källor vi använder

| Källa | Till vad | Licens | Hur |
|---|---|---|---|
| Wikipedia | Händelser, krigens berättelse, religioner | CC BY-SA (vi skriver egna texter och länkar) | Sekundärkälla. Den duger för prototypen, men källan Wikipedia själv hänvisar till är bättre. |
| Wikidata | Andra källa för årtal och plats | CC0 | Används för nivån `two-sources` |
| Cliopatria (Seshat) | Rikenas gränser | CC BY 4.0 | Används som den är, utan egen granskning (se [beslut.md](beslut.md)) |
| Natural Earth | Grundkarta och dagens gränser | Public domain | |
| Wikimedia Commons | Historiska bilder | Public domain, CC0, CC BY eller CC BY-SA | Licensen kontrolleras på filsidan, och filsidan läggs i källregistret |
| Library of Congress, Prints & Photographs (loc.gov/pictures) | Historiska bilder, till exempel fotografier och fotokromer från 1800-talet och tidigt 1900-tal | "No known restrictions on publication" | Bara poster med den rättighetstexten i fältet Rights Advisory, inte "Rights status not evaluated". Arkivposten läggs i källregistret. |
| Wikisource: Encyclopædia Britannica 1911, Dictionary of National Biography (1885–1900) och andra äldre verk | Andra källa för årtal och plats | Public domain | Äldre uppslagsverk kan vara föråldrade, så de används som jämförelse, inte ensamma |
| World History Encyclopedia (worldhistory.org) | Andra källa för årtal och plats | CC BY-NC-SA (artikeltexten) | Bara länkad källa för fakta som årtal och plats. Text kopieras aldrig. |
| Historical Conflict Event Dataset (HCED, Charles Miller 2022) via World Historical Gazetteer | Utkast om slag och andra stridshändelser (#24) | CC0 1.0 (WHG:s tillägg CC BY 4.0) | Massimport till `data/utkast/hced.json`, alltid `draft`. Varje utkast källkontrolleras mot en annan källa innan det flyttas till `events.json` (se nedan). |
| UNESCO:s världsarvslista (whc.unesco.org) | Andra källa för världsarv, till exempel L'Anse aux Meadows (#42) | © UNESCO | Bara länkad källa för årtal och plats. Text kopieras aldrig. |
| FN:s digitala bibliotek (digitallibrary.un.org) | FN-resolutioner och rapporter, till exempel generalförsamlingens resolution ES-11/1 (#223) | FN-dokument | Primärkälla som länkas. Text kopieras inte. |
| Uppsala Conflict Data Program (UCDP, ucdp.uu.se) | Dödssiffror i krigens berättelse för krig från 1989, till exempel Gulfkriget och Rysslands invasion av Ukraina (#222, #223) | CC BY 4.0 (alla dataset, enligt nedladdningssidan) | Citera datasetets publikation och version. Siffrorna gäller stridsrelaterade dödsfall, inte våld mot civila utanför strid eller indirekta dödsfall, så det skrivs ut i texten. |
| UCDP/PRIO Armed Conflict Dataset (ucdp.uu.se) | Start, slut och intensitet för krig från 1946, när dödssiffror per år saknas, till exempel Algeriet och Biafra (#257) | CC BY 4.0 (alla dataset, enligt nedladdningssidan) | Datasetet anger bara om konflikten ett år hade 25–999 eller minst 1 000 stridsrelaterade dödsfall, inga exakta siffror, så det skrivs ut i texten. |
| Forskningsartiklar i PubMed Central (PMC) | Andra källa, till exempel för förhistoriska dateringar | Oftast CC BY (kontrolleras per artikel) | Licensen står i artikeln |

### Källor som går att nå från molnmiljön

Molnmiljöns nätverk släpper bara fram vissa sajter. Läget 2026-10-29 (#143):

- **Går att nå:** Wikipedia, Wikidata, Wikimedia Commons, en.wikisource.org, www.worldhistory.org, pmc.ncbi.nlm.nih.gov (ibland en robotkontroll; då fungerar PMC:s OAI-gränssnitt `pmc.ncbi.nlm.nih.gov/api/oai/v1/mh/`), www.bl.uk, www.nasa.gov, home.cern, www.nobelprize.org, www.raa.se, www.pewresearch.org och seshat-db.com. whc.unesco.org svarade 403 tidigare men gick att läsa med projektets User-Agent 2026-10-31 (#42).
- **Library of Congress i JSON:** arkivposter går att läsa som `https://www.loc.gov/pictures/item/<id>/?fo=json` (fältet `item.rights_information` är rättighetstexten), och bilderna hämtas från länkarna i `resources` (cdn.loc.gov och tile.loc.gov) (#127).
- **Svarar men stoppar oss:** www.loc.gov:s vanliga sidor (robotkontroll, 403), Britannica och Smithsonian (403), Met Museum (429). Wikisources API och sökning kan svara 429 om man frågar för ofta; vänta då en stund.
- **World Historical Gazetteer:** whgazetteer.org svarar. Platslistan (`/mapdata/datasets/<id>/`) och enskilda platser (`/api/db/?id=<plats>`) går att läsa utan inloggning; den fullständiga nedladdningen kräver inloggning (#24).
- **Går att nå sedan 2026-10-30:** ucdp.uu.se (nedladdningar) och digitallibrary.un.org (#223). FN:s digitala bibliotek visar en robotkontroll på vanliga sidor, men sökningen går att läsa som MARCXML (`https://digitallibrary.un.org/search?p=<dokumentnummer>&of=xm`) och PDF:erna via länken `nanna/record/…` som filsidan skickar vidare till.
- **Spärrade:** bland annat www.un.org, press.un.org, news.un.org och www.ohchr.org (#223), acleddata.com, dataverse.harvard.edu (#24), mathshistory.st-andrews.ac.uk, cudl.lib.cam.ac.uk, english-heritage.org.uk, riksarkivet.se, kungahuset.se, regeringen.se, runeberg.org, gutenberg.org, journals.plos.org, ebi.ac.uk (Europe PMC) och patents.google.com.

## Utkast från massimport

Stora öppna dataset kan ge tusentals händelser på en gång. De läggs inte direkt i `events.json`, eftersom ingen har kontrollerat dem och appen läser filen vid start. I stället sparas de som utkast i `data/utkast/`, i samma format som `events.json` och alltid med `review: "draft"`. Appen läser inte katalogen (beslut 2026-10-29).

Första källan är Historical Conflict Event Dataset (#24). `python3 tools/hced.py` hämtar platserna från World Historical Gazetteer och skriver ett urval på cirka 150 utkast, spridda över världsdelar och tidsåldrar, till `data/utkast/hced.json` (`--alla` gör om hela datasetet, `--lpf` läser en nedladdad fil). Datasetet har en post per plats, och varje beskrivning av platsen ("Trojan War (-1184)") blir ett utkast. Negativa år i datasetet är år f.Kr. utan år 0 (`-0605` är slaget vid Karkemish 605 f.Kr.), så de räknas om till `1 - N`. Skriptet listar också utkast som troligen redan finns i `events.json` (samma år ±1 och inom 25 km eller samma namn) i fältet `duplicates`, och varnar i `hced.check` när datasetets punkt verkar fel.

Så lyfts ett utkast till `events.json`:

1. Kontrollera i `duplicates` att slaget inte redan finns.
2. Öppna en källa om slaget (till exempel Wikipedia eller Wikidata) och jämför år, plats och konflikt. Datasetet har fel ibland, till exempel en plats som fått fel koordinat eller fel konflikt.
3. Skriv svensk titel (till exempel "Slaget vid …") och en egen sammanfattning ur källan, med `precision` och `edtf` som visar osäkerheten. Koppla slaget till sitt krig med `partOf` om kriget finns.
4. Lägg källan i `sources.json`, behåll `whg-hced` i `sources` och sätt `review` till `source-checked` (eller `two-sources`). Ta bort fältet `hced` och flytta posten till `events.json`. Ta bort utkastet ur `data/utkast/hced.json` så att det inte finns två gånger.

## Pågående krig: hålla uppgifterna aktuella (#223)

Ett pågående krig (`ongoing: true`) har uppgifter som åldras: läget i dag (`story.outcome`), dödssiffrorna (`story.casualties`) och nya händelser. Därför står kontrolldatumet i `story.asOf` och syns i kortet "Läget i dag (kontrollerat …)".

1. Gå igenom kriget ungefär en gång i kvartalet, och när något stort händer (till exempel vapenvila eller fred).
2. Öppna källorna igen. För civila offer är FN:s människorättskontor (OHCHR och dess övervakningsmission i Ukraina, HRMMU) bäst; siffran skrivs med datum och "enligt FN". Soldatförluster skrivs som spann med vem som uppskattat dem, eftersom parterna överdriver motpartens förluster.
3. Uppdatera texten, `story.asOf`, `end` (året för kontrollen) och `checked` i `sources.json`.
4. Är kriget slut: ta bort `ongoing`, sätt slutdatum i `edtf` och `end`, skriv `outcome` som hur kriget slutade och ta bort `asOf`.

## Sidan Om källorna

Under Om källorna (knappen Källor uppe till höger, i gruppen Visa) finns källpolicyn, läget för hela granskningen och källregistret. Källregistret är grupperat efter vad källorna används till: händelser och fun facts, riken, religioner, kartdata och bilder. Grupperna räknas fram ur datan (vilka uppgifter i `events.json`, `funfacts.json`, `empires/index.json`, `religions.json`, `land.json`, `borders.json` och fältet `image.source` som pekar på varje källa), så en ny källa hamnar rätt av sig själv. En källa kan höra till flera grupper, till exempel Cliopatria (riken och religioner). En källa som ingen uppgift pekar på visas under Övriga källor.

Varje grupp visar hur många källor och uppgifter den har och hur många uppgifter som har nivån källkontrollerad och två källor (och utkast, om det finns). Kartdata och bilder har ingen granskningsnivå per uppgift.

Gruppen Bilder (#195) listar varje bild på globen, inte bara de med `image.source`: en rad per bild med händelse, sort (illustration eller historisk bild), kredit, licens och märket Platshållare, och en hopfälld Prompt för illustrationer. Gruppkortet visar antal per sort, till exempel "26 illustrationer". Illustrationer har ingen extern källa och finns därför inte i källtabellen. Historiska bilder får dessutom sin filsida som källa där. Sökrutan hittar bilder på händelse, kredit, licens och stil. Tryck på en grupp för att bara visa den. Sökrutan filtrerar på källans namn, licens och vad den används till (till exempel en händelses titel eller "kartdata"), och visar vilka uppgifter som matchar.

## Licenser

- Data får bara komma från källor med licensen CC0, CC BY, public domain eller GPL (för gränsdata). Inte CC BY-NC, inte "alla rättigheter förbehållna" och inte data med oklara villkor. Källor med NC-licens får däremot användas som länkade källor för fakta (årtal och plats), utan att text eller data kopieras (beslut 2026-10-29).
- Undantag: historiska bildfiler får vara CC BY-SA och behåller sin egen licens.
- Nya datakällor läggs i `data/sources.json` och i README:ns licensavsnitt när de används.

Licenskontroller som redan är gjorda står i respektive issue, till exempel GPlates (#51), ROAD (#50), OWTRAD och CLIWOC (#39) och Black Marble (#9).

### OWTRAD och CLIWOC (#39, kontrollerat 2026-10-30)

| Källa | Vad | Resultat | Får användas? |
|---|---|---|---|
| OWTRAD (Old World Trade Routes, ciolek.com) | Handelsvägar i Asien och Europa | Webbplatsen går inte att nå från molnmiljön (anslutningen bryts), så villkoren kunde inte läsas. Inga villkor hittades på Zenodo. | **Nej, inte nu:** villkoren är oklara. Används inte förrän en öppen licens (CC0, CC BY, public domain) har setts på källsidan. |
| CLIWOC (Climatological Database for the World's Oceans 1750–1850) | Positioner och väder ur skeppsloggar | Officiella sidor (KNMI) visar inga villkor, och NOAA:s ICOADS, där CLIWOC-datan ingår, går inte att nå från molnmiljön. På Zenodo finns bara härledd data med CC BY-SA 4.0, som inte är tillåtet för data här (bara för bildfiler). | **Nej, inte nu:** villkoren är oklara, och den tillgängliga kopian är CC BY-SA. |

Vägarna och resorna i version 4 bygger i stället på uppslagsverk och artiklar med källa per etapp (`data/routes/`, #38). För att pröva OWTRAD och CLIWOC igen behöver molnmiljön släppa på `www.ciolek.com`, `icoads.noaa.gov` och `www.ncei.noaa.gov`.

### Slave Voyages (#330, kontrollerat 2026-10-31)

| Källa | Vad | Resultat | Får användas? |
|---|---|---|---|
| Slave Voyages (slavevoyages.org), Trans-Atlantic Slave Trade Database | Resor, hamnar och antal förslavade i den transatlantiska slavhandeln | Webbplatsen går inte att nå från molnmiljön (både `www.slavevoyages.org` och `slavevoyages.org` stoppas), så villkoren kunde inte läsas. | **Nej, inte nu:** villkoren är okända. Används inte förrän en öppen licens (CC0, CC BY, public domain) har setts på källsidan. Siffror som Wikipedia citerar ur databasen används bara med Wikipedia som källa, och det står i texten. |

Slavhandelns vägar i `data/routes/slavhandeln.json` bygger därför på Wikipedia, med typiska vägar i stället för enskilda resor. För att pröva databasen behöver molnmiljön släppa på `www.slavevoyages.org`.

## Så kontrollerar du en uppgift

1. Öppna källsidan. Läs det som faktiskt står, inte det du minns.
2. Jämför årtal, plats och varje påstående i texten med källan.
3. Skriv årtalet i astronomisk form (`1 - N` för N f.Kr.), med `edtf` och `precision` som visar osäkerheten.
4. Lägg källan i `sources.json` med dagens datum i `checked`.
5. Sätt `review` till `source-checked`. Har du jämfört med en andra, oberoende källa sätter du `two-sources` och lägger båda källorna i `sources`.

## Bidra

Hittar du ett fel, öppna ett issue med mallen "Faktafel" och ange vilken uppgift det gäller och en källa som visar det rätta. Nya händelser tas emot på samma sätt: med källa, plats och årtal.
