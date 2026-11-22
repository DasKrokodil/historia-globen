# Bildpipelinen blir standard, med större omgångar och färre fasta kostnader

**Datum:** 2026-11-22 (DasKrokodil i chatten: "gör enligt rekommendationerna", efter rekommendationen i #2195)

**Underlag:**
- pilotrapporten [docs/granskningar/2026-11-22-bildpipeline-pilot.md](../granskningar/2026-11-22-bildpipeline-pilot.md), med avsnitten "Efterhandsmätning" och "Steg B";
- beslutet om piloten, [2026-11-22-bildpipeline-pilot.md](2026-11-22-bildpipeline-pilot.md).

## Beslut

1. **Pipelinen är standard för bildissues.** Varje omgång börjar med granskningslistan ur `tools/bildbatch.py` och hämtar med `tools/bild_hamta.py`, enligt [docs/bilder-riktiga.md](../bilder-riktiga.md).
   - **Rättningar efter granskningen görs av en ny, liten arbetare** med en kort order: punkterna, grenen och kontrollerna. Byggaren rättar inte. Dess långa sammanhang gör varje anrop dyrt.
2. **Måttet för andel med bild sätts per världsdel**, i stället för de 65 % som kom från en omgång i Europa (#2170). Golvet är den nivå som omgångarna på det gamla sättet nådde i samma världsdel, i Afrika 44 % (#2110).
   - Licensfel som når `main` ska vara 0.
   - Fakta, licenser och källor granskas fullt av en Claude Code som inte byggde ändringen, som förut.
3. **Färre fasta kostnader per omgång:**
   - **Större omgångar:** 30–40 händelser per pull request, till exempel två bildissues om högst 20 vardera. Taket för bild-pull requests (sex per person, beslut 2026-11-21) gäller som förut.
   - **Skärmbilder i var tredje omgång.** En bild-pull request tar skärmbilder före och efter, i 1280 och 400 px, när numret på det första issuet den tar är delbart med 3. Övriga skriver "Skärmbilder: nej (tas i var tredje bildomgång, beslut 2026-11-22)". Det ersätter punkt 6 i bildissuesens text för de omgångarna. Beslutet om skärmbilder i issues (2026-11-14) gäller som förut för buggar, visuella ändringar och förslag.
   - **Ej hämtade bilder hämtas om i Actions utan agent.** Arbetsflödet `.github/workflows/bild-ej-hamtade.yml` läser `data/utkast/bildbatch/<namn>-ej-hamtade.txt` och väntar så länge Wikimedia ber om, vilket en agent inte ska göra. Resultatet hamnar under `data/utkast/bildbatch/<namn>/` på en ny gren `bildbatch/<namn>-<körning>`, utan pull request. Nästa omgång flyttar in bilderna och skriver bildtexterna.
4. **Testsviten och bygget körs en gång per omgång**, och en gång till bara om något föll.
5. **Ramstilen för känsliga foton** (till exempel affischramen runt herero-fotot) ändras inte nu. `ux-tillganglighet` tittar på den vid nästa releasegranskning.

## Varför

Steg B kostade 28 % mindre än det gamla sättet att bygga, och 17 % mindre räknat med rättningarna. Det var också snabbare och gav inte fler licensfel.

Det mesta av den kostnad som är kvar kommer av att varje anrop läser om allt som har hänt i omgången. Därför avgör antalet anrop kostnaden. Större omgångar, färre skärmbilder och inga väntetider minskar just antalet anrop. Andelen bilder beror på hur många fria bilder som finns i en världsdel, och då blir ett gemensamt krav fel.

## Berör

- [docs/bilder-riktiga.md](../bilder-riktiga.md)
- `.github/workflows/bild-ej-hamtade.yml`
- `tools/bild_hamta.py` (`--tidstak`)
- [CLAUDE.md](../../CLAUDE.md), avsnittet Bilder: rutinen pekar på docs/bilder-riktiga.md som förut
