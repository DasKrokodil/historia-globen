# Platskortet: landsnamn med preposition och artikel (#1479)

**Datum:** 2026-11-14

## Beslut
DasKrokodil svarade "ja till rekommendationerna" på #1479. Byggt enligt det:

1. **`partOf` är hela frasen per språk.** Fältet behåller namnet och formen (text på fem språk), men innehållet är nu frasen med preposition och artikel: Skåne har `"i Sverige"`, `"in Sweden"`, `"in Schweden"`, `"en Suecia"`, `"en Suède"`. En kanton skulle få `"in der Schweiz"` och en amerikansk delstat `"aux États-Unis"`. `partOf` används bara av platskortet (`js/focus/place.js`), så ingen annan kod eller data läste det som bart landsnamn och inget eget fält behövdes.
2. **Mallen är `{type} {of}`.** `place.typeOf` är samma text på alla fem språk i `data/ui/`; ingen fast preposition (`i`, `in`, `en`) finns kvar i gränssnittstexterna och koden lägger aldrig till någon. Raden byggs av `placeLead()` i `js/focus/place.js`.
3. **Schemat kräver en inledande preposition.** `partOf` har en egen definition (`phrase` i `schemas/platser.schema.json`): alla fem språk, och frasen måste börja med en preposition: `i`/`på` (sv), `in`/`on`/`at` (en), `in`/`im`/`auf`/`an` (de), `en` (es) och `en`/`au`/`aux`/`à`/`dans`/`sur` (fr), följd av minst ett ord. Ett bart landsnamn ("Sverige", "New Zealand", "Sri Lanka", "Czech Republic") avvisas därför vid bygget. Kontrollen är bara ett nät: den avgör inte om artikel, kön eller kasus är rätt (det gör skribenten mot målspråkets Wikipedia, `docs/ordlista-oversattning.md` 17.2). Listan är medvetet snäv; behövs en preposition som saknas (en framtida fras utan dem) utökas listan i schemat och i provet i samma pull request som platsen. `scripts/validate-site.py` kör schemat och behövde ingen ändring.
4. **Skånes kort är oförändrat:** *Landskap i Sverige*, *Province in Sweden*, *Landschaft in Schweden*, *Provincia histórica en Suecia*, *Province historique en Suède*. Frasen för Skåne kommer ur de landsnamn som redan fanns i datan plus prepositionen som mallen använde per språk; inga andra landsfraser finns i datan. Exemplen "in der Schweiz", "aux États-Unis" och "in the United States" (kontrollerade mot målspråkets Wikipedia 2026-11-14, `docs/ordlista-oversattning.md` 17.2) finns bara som provdata i `tests/platskort-landsnamn.test.mjs`.

## Varför
Det gör att varje språk skriver den form som är rätt för just det landet utan grammatikregler i koden, och översättningsspärren kontrollerar redan texter per språk. Bygget gjordes när den första platsen med `partOf` fanns (Skåne), enligt beslutet på issuet.

## Inte gjort
- Ingen ny plats och inga nya landsfraser i `data/platser.json`. Varje ny fras kontrolleras mot en öppnad källa när platsen byggs.
