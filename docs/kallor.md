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
| `human-reviewed` (granskad av människa) | Rikard har granskat uppgiften. Bara Rikard sätter den nivån. | Ja |

Nivån syns i faktarutan och under Om källorna, inte som eget märke på globen.

## Källor vi använder

| Källa | Till vad | Licens | Hur |
|---|---|---|---|
| Wikipedia | Händelser, krigens berättelse, religioner | CC BY-SA (vi skriver egna texter och länkar) | Sekundärkälla. Den duger för prototypen, men källan Wikipedia själv hänvisar till är bättre. |
| Wikidata | Andra källa för årtal och plats | CC0 | Används för nivån `two-sources` |
| Cliopatria (Seshat) | Rikenas gränser | CC BY 4.0 | Används som den är, utan egen granskning (se [beslut.md](beslut.md)) |
| Natural Earth | Grundkarta och dagens gränser | Public domain | |
| Wikimedia Commons | Historiska bilder | Public domain, CC0, CC BY eller CC BY-SA | Licensen kontrolleras på filsidan, och filsidan läggs i källregistret |

## Licenser

- Data får bara komma från källor med licensen CC0, CC BY, public domain eller GPL (för gränsdata). Inte CC BY-NC, inte "alla rättigheter förbehållna" och inte data med oklara villkor.
- Undantag: historiska bildfiler får vara CC BY-SA och behåller sin egen licens.
- Nya datakällor läggs i `data/sources.json` och i README:ns licensavsnitt när de används.

Licenskontroller som redan är gjorda står i respektive issue, till exempel GPlates (#51), ROAD (#50), OWTRAD och CLIWOC (#39) och Black Marble (#9).

## Så kontrollerar du en uppgift

1. Öppna källsidan. Läs det som faktiskt står, inte det du minns.
2. Jämför årtal, plats och varje påstående i texten med källan.
3. Skriv årtalet i astronomisk form (`1 - N` för N f.Kr.), med `edtf` och `precision` som visar osäkerheten.
4. Lägg källan i `sources.json` med dagens datum i `checked`.
5. Sätt `review` till `source-checked`. Har du jämfört med en andra, oberoende källa sätter du `two-sources` och lägger båda källorna i `sources`.

## Bidra

Hittar du ett fel, öppna ett issue med mallen "Faktafel" och ange vilken uppgift det gäller och en källa som visar det rätta. Nya händelser tas emot på samma sätt: med källa, plats och årtal.
