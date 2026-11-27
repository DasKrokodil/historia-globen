# Codex och Copilot tar översättningar och riktiga bilder (2026-11-27)

**Beslut (DasKrokodil, 2026-11-27).** Andreas har lediga Codex-resurser. Därför får Codex och Copilot, på Andreas konto och på DasKrokodils, ta alla `redo`-issues i milstolparna **"Löpande: Språk: översättning"** och **"Löpande: Bilder: riktiga bilder"**, även när issuet har etiketten `data` och oavsett om det har etiketten `översättning`.

## Villkor

**Översättning**
- Uppgiften är att översätta eller granska en översättning. Ingen fakta skrivs eller ändras (årtal, siffror, namn, platser och påståenden är desamma som i svenskan). Ett sakfel agenten hittar blir ett eget issue med `faktafel` och `källkontroll` för Claude Code, inte en rättning.
- Gäller också rikesindexet och ord-för-ord-granskningen av engelskan. Tilltal, ordlista och typografi enligt CLAUDE.md "Språk" och docs/ordlista-oversattning.md. Omgångar om ungefär 100–150 texter per PR.
- Modellnivå: standardmodellen med medelstor resonering (AGENTS.md).

**Riktiga bilder**
- Bara riktiga bilder (agenter genererar aldrig bilder), med öppnad filsida och licens kontrollerad per fil enligt docs/bilder-riktiga.md. Okända eller motsägande licenser avstås och flaggas till en människa. `.webp`-filer måste kunna läggas in i en gren med git, annars tas inte issuet.
- Bildpipelinen är standard (beslutet 2026-11-22): omgångar om två bildissues per PR, `tools/bildbatch.py` och `tools/bild_hamta.py`, ej hämtade bilder hämtas om i Actions.
- Modellnivå: starkaste modellen med hög resonering (licens och källor).
- Kravet från beslutet 2026-11-20 att en Claude Code som inte byggde ändringen granskar fakta, licenser och källor före ihopslagning **ersätts** av beslutet 2026-11-23: granskningen görs i batch före release av `historiker`, med stickprov på licenser. Licensfel som når `main` ska vara noll.

## Tak
Översättnings-PR har eget tak på 8 öppna per person och bild-PR eget tak på 6 öppna per person, och ingen av dem räknas mot de fyra (besluten 2026-11-23 och 2026-11-21). Alla andra regler om `redo`, `pågår`, tilldelning och krockar är oförändrade.

## Oförändrat
Codex och Copilot tar fortfarande inte `faktafel`, `källkontroll` och rikesarbete (inklusive religionslagret) och inga issues utanför de två milstolparna med `data`. Länder (landskort, `data/platser.json`) och täckning kräver öppnade källor för varje händelse och väntar på ett eget beslut (se nedan).

## Kandidater till fler spår (inte beslutade)
- **Länder** (6.6.2–6.6.4, ett land per PR): kan prövas som pilot med ett land, med källor listade per händelse i PR:en, aldrig `two-sources`, och fakta granskade i batch före release. Utvärderas enligt beslutet om piloter (2026-11-12).
- **Täckningsluckor** med öppnade källor, och **dokumentation och analys** (tillåtet redan, räknas inte mot taket).
- **Tester och gränssnitt** (tillåtet redan för Codex enligt AGENTS.md).
