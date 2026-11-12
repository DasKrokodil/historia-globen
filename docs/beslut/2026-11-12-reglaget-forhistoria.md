# Tidsreglaget: förhistorien som femte segment, MIN_YEAR = 100 000 f.Kr.

**Datum:** 2026-11-12 (DasKrokodil gav i uppdrag att bygga #1088 efter #1085; inom riktningen 2026-11-10, punkt 2 och 3)

## Beslut
1. `MIN_YEAR` är **−99999**, alltså 100 000 f.Kr., ett runt årtal för "cirka 100 000 år bakåt" (beslutet 2026-11-10). Mätningens räknevärde `MAX_YEAR − 100000` (−97974) används inte, eftersom det flyttar sig varje år.
2. Reglaget har **fem segment**: 100 000–3000 f.Kr. på **10 %**, 3000–500 f.Kr., 500 f.Kr.–1000 och 1000–1800 på 21⅔ % var, och 1800– på **25 %** som förut. Det är rekommendationen i `docs/granskningar/2026-11-12-tidsreglagets-plats-1087.md`: modern tid får exakt samma pixlar per år som förut.
3. I förhistorien (före 10 000 f.Kr.) visar raden under årtalet året avrundat till tusental ("50 000 f.Kr.") i stället för århundradet, och fönstret avrundas till tusental med språkets tusentalsavgränsare ("±12 000 år").
4. Länkar till år före 3000 f.Kr. hamnar nu på rätt år i stället för att klämmas; år före 100 000 f.Kr. kläms till gränsen.

## Öppet
- Fönstret hoppar vid gränsen 3000 f.Kr. (cirka ±12 000 år i det första segmentet, cirka ±140 år direkt efter). Mätningen bad om en bedömning av en övergång; den är inte byggd och föreslås som eget issue.
- På 400 px är förhistorien cirka 37 px bred: grov navigering. Snabbhopp (#1090), tangentbord (#1089) och zoom i reglaget (#1091) ger de finare vägarna dit.

## Motivering
Mätningen i #1087 och riktningen 2026-11-10: förhistorien högst cirka 10 % av reglaget, och modern tid får inte bli trängre.
