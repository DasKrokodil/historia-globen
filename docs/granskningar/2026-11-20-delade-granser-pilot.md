# Delade gränser, pilot för Brittiska öarna (#1765, steg 1)

**Datum:** 2026-11-20. **Av:** Claude Code (DasKrokodil). **Beslut:** DasKrokodils ja i #1765 till en pilot bakom en flagga och till shapely 2.1 ([beslutsfil](../beslut/2026-11-20-delade-granser-pilot-1765.md)). Utredningen före: [2026-11-15-delade-granser-forenkling.md](2026-11-15-delade-granser-forenkling.md).

## Vad som byggdes
`python3 tools/riken.py <cliopatria.geojson> --delade-granser` förenklar grupperna i `SHARED_GROUPS` (Wessex, Mercia, Northumbria, Dalriada, Strathclyde, Kungariket Skottland med Alba, Kungariket Man, Kungariket England och Nordsjöväldet) tillsammans. Utan flaggan blir alla 377 filer i `data/empires/` byte för byte som i repot (provat med hela verktyget). `--ut=<mapp>` skriver filerna någon annanstans. Ingen datafil i repot är ombyggd med flaggan.

Så går det till, punkt för punkt mot utredningens sex punkter:

1. **Täckningen byggs av verktygets egna råa gränser** (`raw_periods`: EXTEND, join, fill, prepend, minus, clip och DISPUTED, samma funktion som main använder). Ingen av pilotens grupper har `homeland`, `SAME_AS_TOL` eller DISPUTED.
2. **Vilka år:** varje år 500–1700 där någon del i regionen börjar en period (120 år). Alla gränser det året skärs mot varandra (`polygonize`), så att grannar har samma hörnpunkter, och förenklas med `coverage_simplify` (tolerans `SHARED_TOL` = 0,1).
3. **Överlapp i underlaget:** två delar som överlappar mer än `SHARED_SLIVER` (0,01 kvadratgrader, cirka 70 km²) ett år hålls utanför täckningen det året och förenklas för sig som förut. Det händer tre gånger, och alla tre gäller Isle of Man: Northumbria och Dalriada 626–632, Alba och Kungariket Man 1099–1168, England och Skottland 1326–1332 och 1402–1474 (0,10–0,11 kvadratgrader). Mindre överlapp (0,0007–0,008) är remsor där samma gräns är något olika ritad. De går till den del som står först i `SHARED_GROUPS`.
4. **Avrundning:** pilotens grupper avrundas alla till två decimaler (England, Man och Nordsjöväldet hade en).
5. **MIN_AREA och MERGE:** en ö under `MIN_AREA` tas bort efter förenklingen, men bara om den inte rör en granne. Ingen del försvinner alltså på bara ena sidan av en gemensam gräns. Sammanslagningen av perioder fungerar som förut: en del som ändras mindre än `MERGE` behåller sin förra gräns. En sådan behållen gräns får ändå årets nya gräns om den annars skulle överlappa en granne mer än `SHARED_FIX` (0,001 kvadratgrader). Då delas perioden (`split_at`). Detta ger 11 fler perioder (154 mot 143).
6. **Omkörning ger tom diff:** ja, utan flaggan. Verktyget skrev förut `index.json` utan radslut sist, medan filen i repot har ett. Nu skrivs radslutet, så omkörningen ger en helt tom diff. Med flaggan blir omkörningen också densamma varje gång, eftersom samma indata ger samma utdata.

## Mätning i de riktiga filerna
Underlag: Cliopatria v0.2.1 (`cliopatria_polities_only_v021.geojson`, Zenodo 23128623). Varje år 500–1700 räknades ur de byggda rikesfilerna, efter avrundningen. Överlapp är summan av alla grannpars gemensamma yta i kvadratgrader. "Utöver underlaget" räknar bara överlapp utanför de ytor som redan överlappar i verktygets råa gränser. Avvikelsen är den symmetriska skillnaden mot de råa gränserna, delad med deras yta, för perioder som börjar 500–1700.

| | I dag (flaggan av) | Pilot, tolerans 0,1 (vald) | Tolerans 0,15 | Tolerans 0,2 |
|---|---|---|---|---|
| Överlapp, summa över åren (kv.grad-år) | 45,98 | 20,88 | 20,19 | 17,36 |
| … utöver underlaget | 36,58 | 8,82 | 8,98 | 8,84 |
| År med överlapp utöver underlaget > 0,001 | 941 av 1 201 | 157 (bara åren med Isle of Man ovan) | 157 | 157 |
| Största överlapp ett år utöver underlaget | 0,261 | 0,059 | 0,059 | 0,059 |
| Grannar utan något överlapp i underlaget: största överlapp ett år | – | 0,0004 | – | – |
| Filstorlek, nio grupper | 130,4 kB | 194,3 kB (+49 %) | 165,0 kB | 134,1 kB |
| Hörnpunkter | 8 515 | 12 495 | 10 328 | 8 052 |
| Avvikelse mot de råa gränserna | 6,7 % | 2,5 % | 3,5 % | 5,5 % |
| Överlapp mot grannar utanför piloten (Norgesväldet, Frankrike m.fl.), summa | 51,90 | 57,22 | 58,08 | 58,36 |

Överlapp ett visst år (kvadratgrader; inom parentes utöver underlaget):

| År | Underlaget | I dag | Pilot 0,1 |
|---|---|---|---|
| 650 | 0,002 | 0,039 (0,038) | 0,000 |
| 800 | 0,001 | 0,009 (0,008) | 0,000 |
| 1000 | 0,000 | 0,075 (0,075) | 0,000 |
| 1050 | 0,004 | 0,101 (0,100) | 0,000 |
| 1100 | 0,098 | 0,135 (0,061) | 0,151 (0,059) |
| 1300 | 0,000 | 0,047 (0,047) | 0,000 |
| 1600 | 0,000 | 0,060 (0,060) | 0,000 |

Avvikelse och storlek per grupp, i dag → pilot 0,1: Wessex 1,2 → 1,3 % (15,5 → 15,1 kB), Mercia 1,0 → 1,1 %, Northumbria 1,2 → 1,0 %, Dalriada 1,5 → 1,7 %, Strathclyde 1,2 → 2,9 % (1,6 → 1,8 kB; 16–22 hörnpunkter per period, ingen fyrhörning som i #1721), Skottland 0,9 → 1,3 % (19,4 → 23,2 kB), Kungariket Man 42,5 → 4,4 %, England 8,5 → 3,2 % (48,9 → 101,5 kB), Nordsjöväldet 5,5 → 0,8 % (12,8 → 18,9 kB).

**Tid:** hela verktyget tar 57–61 sekunder med och utan flaggan. Den delade förenklingen själv tar 0,3 sekunder för alla 120 år.

**Toleransen:** 0,1 valdes, eftersom de grupper som redan var finare för att inte överlappa (#1721, #1744: 0,05 grader) då behåller ungefär sin noggrannhet. England, Man och Nordsjöväldet blir mycket närmare Cliopatria, men England blir dubbelt så stor (cirka 100 kB, som laddas först när riket visas). Med 0,2 blir storleken densamma som i dag, men de små rikena avviker 4–9 % i stället för 1–1,5 %. Valet går att ändra med en konstant och kan avgöras i steg 2.

## Kontroller
- `python3 tests/riken-delade-granser-test.py` (nytt): enhetsprov med påhittade polygoner. Det prövar att grannar inte överlappar, att överlapp i underlaget hålls utanför, att remsor ger en giltig täckning, att en ö bara tas bort när den inte rör en granne, att en liten ändring behåller sin gräns och att en granne som annars skulle överlappa får en ny gräns. Det prövar också `split_at` och att `simplify_alone` är exakt som förut. Med `CLIOPATRIA=<fil>` körs hela verktyget: utan flaggan ska alla filer vara som i `data/empires/`, och med flaggan ska grannar som inte överlappar i underlaget överlappa högst 0,005 kvadratgrader ett år (uppmätt 0,0004). Provet kräver shapely och hoppas därför över i CI.
- `python3 -I tests/riken-bevara-test.py`, `tests/cliopatria-ar-test.py`, `tests/riken-kontrollpunkter-test.py` (också med pilotens filer inkopierade: alla 1 260 kontrollpunkter stämmer), `tests/riken-namn-test.py` och `tests/riken-oversatta-namn-test.py` gick igenom. `node --test 'tests/*.test.mjs'`: 682 godkända, 0 fel.
- Inga datafiler ändrades, så `tools/dela_data.py` och `tools/oversattning.py` behövdes inte.

## Skärmbilder
Globen med dagens filer (före) och pilotens filer (efter), laddade lokalt. Inga konsolfel. På grenen `skarmbilder`, mappen `issue-1765/`:

- Dator 1280 px: [650 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-650-fore.webp), [650 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-650-efter.webp), [800 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-800-fore.webp), [800 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-800-efter.webp), [1300 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-1300-fore.webp), [1300 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-1300-efter.webp)
- Utsnitt av datorbilderna, förstorade två gånger: [650 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-650-utsnitt-fore.webp), [650 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-650-utsnitt-efter.webp) (gränsen mellan Wessex och Mercia), [1300 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-1300-utsnitt-fore.webp), [1300 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/dator-1300-utsnitt-efter.webp) (England mot Skottland, Englands kust)
- Mobil 400 px: [650 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/mobil-650-fore.webp), [650 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/mobil-650-efter.webp), [800 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/mobil-800-fore.webp), [800 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/mobil-800-efter.webp), [1300 före](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/mobil-1300-fore.webp), [1300 efter](https://raw.githubusercontent.com/DasKrokodil/historia-globen/skarmbilder/issue-1765/mobil-1300-efter.webp)

År 800 är skillnaden knappt synlig, eftersom överlappet redan var litet (0,009). I mobilen är globen redan inzoomad så långt det går (zoom 3,2), så skillnaderna syns där bara som tunnare dubbla kanter.

## Expertgranskning
Underagenterna `geograf` och `arkitekt` gick inte att starta i den här körningen, eftersom verktyget för underagenter saknades. I stället gick jag själv igenom ändringen med deras checklistor (`.claude/agents/geograf.md` och `arkitekt.md`). Det ersätter inte expertgranskningen. **Den ska göras när pull requesten granskas.**

- **Arkitekt (min egen genomgång):** sidan och dess principer berörs inte, och inget nytt beroende tillkommer på sidan. Utan flaggan är utdatan provad byte för byte. Kontrollen av shapely-versionen körs också utan flaggan, enligt beslutet; den som har shapely 2.0 får nu ett fel. `ne_omstridda.py` krävde redan 2.1. Provet med shapely körs inte i CI. Det skulle kräva `pip install shapely` i arbetsflödet, och det är DasKrokodils beslut.
- **Geograf (min egen genomgång):** Strathclyde blir ingen fyrhörning. Isle of Man, som var nästan bortförenklad (42 % avvikelse), behåller nu sin form. Kontrollpunkterna för Brittiska öarna stämmer med pilotens filer. Överlappen mot grannar utanför piloten blir något större (51,9 → 57,2), eftersom de fortfarande förenklas för sig.

## Slutsats
Piloten håller. Mellan grannar som inte överlappar i underlaget försvinner överlappen i de riktiga filerna: högst 0,0004 kvadratgrader ett år, mot upp till 0,26 i dag. Avvikelsen mot Cliopatria minskar från 6,7 till 2,5 %. Det som återstår:

- **Isle of Man:** de år Cliopatria räknar ön till två riken förenklas båda för sig, och överlappet runt ön blir som förut (högst 0,06 kvadratgrader utöver underlaget).
- **Filstorleken** växer med 49 % med den valda toleransen, nästan bara för England.
- **Grannarna utanför piloten** (Norgesväldet, Frankrike, Angevinska riket) har kvar sina överlapp.

## Förslag på steg 2 (kräver DasKrokodils ja)
1. **Hela kartan i omgångar per region**, inte allt på en gång. En täckning per år för alla grupper är möjlig (0,3 sekunder per region), men varje rikesfil ändras en gång och behöver granskas av `geograf`. Börja med de regioner som har kända överlapp: Ryssland och Sibirien (#1743) och Tyskland med grannar.
2. **Överlapp i underlaget:** i stället för att hålla båda rikena utanför kan den gemensamma ytan bli en egen bit i täckningen, som sedan läggs till båda rikena. Då ritas den i båda, som i Cliopatria, men gränserna mot övriga grannar blir ändå gemensamma. Det skulle ta bort de 157 åren med överlapp utöver underlaget.
3. **Tolerans per region** (konstant), vald så att filstorleken stannar inom en gräns, till exempel högst +20 %. För Brittiska öarna motsvarar det 0,15.
4. **Prov i CI:** lägg till `pip install 'shapely>=2.1'` i arbetsflödet, så att enhetsprovet körs för varje pull request.
5. `OVERRIDES` och `DECIMALS` för de grupper som har gjorts finare bara för att undvika överlapp (#1721, #1743, #1744) kan tas bort i samma steg, eftersom täckningen ersätter dem.
