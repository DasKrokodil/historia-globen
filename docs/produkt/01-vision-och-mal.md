# 01. Vision och mål

**Status:** utkast 2026-11-08, att godkännas av DasKrokodil. Visionen och avgränsningarna är hämtade ur [CLAUDE.md](../../CLAUDE.md) och beslutsfilerna; målen och måtten är **förslag** som inte har beslutats.

## Syftet i en mening

Historia-globen låter vem som helst dra i tiden på en jordglob och se vad som hände **samtidigt** på olika håll i världen, med varje uppgift belagd i en öppen källa.

## Problemet vi löser

Historia lärs oftast ut per land eller per epok, så sambanden går förlorade: att pyramiderna byggdes medan de sista mammutarna levde, eller att Oxford undervisade när Tenochtitlan grundades. Atlaser och tidslinjer visar antingen *var* eller *när*, sällan båda tillsammans, och källorna bakom påståendena är ofta osynliga. Benchmarken ([2026-11-07-benchmark-skola-atlaser-spel.md](../granskningar/2026-11-07-benchmark-skola-atlaser-spel.md)) visar att flera atlaser har stängd licens eller saknar synlig källa.

## Det vi erbjuder som andra inte gör (kärnan)

1. **Samtidighet som första fråga.** "Vad pågår på andra håll just nu?" är ingången, inte en bieffekt.
2. **Källan syns.** Varje händelse och fun fact har en källa och en granskningsnivå, och när källorna är oense står det öppet.
3. **Öppet.** Kod under GPL-3.0, data under CC BY 4.0, ingen inloggning, ingen spårning.
4. **Samma innehåll i flera former.** Glob, platt karta, guidade turer, quiz och utskrift bygger på samma data, och på sikt kan samma bild visas på en fysisk glob.

## Mål

Förslag på mål med tecken att leta efter. Vi har ingen besöksstatistik (beslut 2026-11-06, ingen tredjepartsstatistik), så tecknen är kontrollerbara i data, test och granskningar, inte i mätpaneler.

| # | Mål | Tecken på att vi lyckas | Hur vi ser det |
|---|---|---|---|
| M1 | **Förstå samtidighet på under en minut.** En förstagångsbesökare ser ett samband och förstår vad globen gör. | Ingången (introduktion, Samtidigt-kort) fungerar på dator och mobil utan förklaring. | UX-genomgång med nybörjarlinsen; webbläsartestet |
| M2 | **Pålitligt innehåll.** Inget påhittat. | Alla synliga uppgifter har källa; oenighet visas; ingen fakta ur minnet. | Källkontroll, `tools/`-kontroller, faktagranskning |
| M3 | **Användbart i klassrummet.** En lärare kan ta en tur eller en lektion och använda den utan förberedelse utöver bladen. | Lektion 1 (åk 7–9) och 2 (åk 4–6) fungerar från delad länk till utskrivet blad. | Lärarlinsen; blind-spots-runda för lektionsläget |
| M4 | **Global bredd.** Innehållet har inte slagsida mot Europa. | Täckning per världsdel, period och kategori är synlig och glapp åtgärdas. | `python3 tools/tackning.py`, täckningsrapporten |
| M5 | **Tillgängligt för alla.** Tangentbord, skärmläsare, zoom och lugn rörelse fungerar. | Inga kända blockerande tillgänglighetsfel öppna vid release. | Tillgänglighetslinsen; test av tangentbord och zoom |
| M6 | **Hållbart att underhålla.** Två personer och flera agenter kan bygga vidare utan att krocka. | Inget byggsteg, data skild från kod, få centrala filer som alla ärenden berör. | Arkitekturlinsen; kökontroller |
| M7 | **På flera språk.** Svenska, engelska, tyska, spanska och franska utan att fakta ändras i översättningen. | Antalet oöversatta texter ökar aldrig. | Översättningsspärren (`tools/oversattning.py`) |

## Avgränsningar: det här är sidan inte

- Inget lärplattformssystem (LMS), inga konton, ingen elevdata eller betygsättning.
- Ingen egen backend (enda undantaget är formuläret för förslag, beslut 2026-10-30).
- Inget spel i första hand: quizet och jakten är lärverktyg, inte en tävling.
- Ingen tredjepartsstatistik eller spårning.
- Ingen uppgift utan källa, och ingen avbildning av profeten Muhammed.
- Ingen heltäckande historieskrivning: globen visar urval, och urvalet ska vara tydligt (se fråga 2 under [Öppna frågor](#öppna-frågor)).

## Principer vi väger mot varandra

Ordnade efter vad som vinner vid konflikt. Ordningen är en **tolkning** av besluten och bör bekräftas.

1. Källbelagt före fullständigt. 2. Begripligt före avancerat. 3. Tillgängligt före effektfullt. 4. Enkelt att underhålla före smart. 5. Öppet före bekvämt (licenser, inga låsta tjänster).

## Öppna frågor

Sådant som visionen inte svarar på än och som DasKrokodil behöver avgöra (de kan bli egna issues med `beslut-krävs` och rekommendation):

1. **Primär målgrupp.** Skolan (årskurs 4–9) har fått mest byggtid, men visionen börjar hos den nyfikna allmänheten. Vilken ska vinna vid konflikt? (Se [02](02-anvandare-och-intressenter.md).)
2. **Urval mot full lista.** Hur tydligt ska det vara att globen visar ett urval, och vem avgör vad som ingår?
3. **Gymnasiet.** Ska äldre elever (16–19) vara en målgrupp eller räcker "äldre elever" i lektion 1?
4. **Fysisk glob.** Hur mycket ska webbversionens beslut styras av den, och när?
5. **Namn och domän** (listas redan i CLAUDE.md under öppna frågor).

## Att kontrollera vid uppdatering

- [ ] Stämmer målen fortfarande med versionsplanen i CLAUDE.md?
- [ ] Har ett beslut ändrat en avgränsning, och står det i beslutsfilerna?
- [ ] Har något "antagande" bekräftats eller motsagts?
