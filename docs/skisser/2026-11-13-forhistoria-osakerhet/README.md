# Skiss: osäkerhet på kartan för förhistorien (#1094, #1095)

2026-11-13, Claude Code (DasKrokodil). Underlag inför bygget av lagret för människoarter och vandring (#1094), enligt punkt 5 i beslutet på #1095: skiss före bygge, i 400 px bredd och med simulerad färgblindhet. Bilderna är skisser, inte gränssnittet.

**Innehåll:** en platt karta i sidans färger med de förhistoriska posterna i kategorin `manniskan` ur `data/events.json`. Fyndplatserna är riktiga. **Ytan över Afrika och de två vågorna är exempelformer utan data**, märkta "EXEMPEL". Under kartan finns teckenförklaringen, ett kort och textlistan (#1106).

| Fil | Färgsyn |
|---|---|
| `normal.jpg` | normal |
| `deut.jpg` | simulerad deuteranopi (grönsvag) |
| `prot.jpg` | simulerad protanopi (rödsvag) |
| `trit.jpg` | simulerad tritanopi (blåsvag) |
| `gray.jpg` | gråskala |

Simuleringen görs med färgmatriser (`feColorMatrix`), inte med riktiga användare.

**Tecknen:**
- **Fyndplats med egen koordinat:** fylld punkt med mörk ring.
- **Ungefärlig fyndplats** (`locationPrecision`): streckad ring med en punkt i mitten.
- **Antaget område:** randning, streckad kant och ordet "tolkning".
- **Möjlig våg:** prickad linje, "?" och flera grenar.

**Fynd** (också på #1094):
1. **Formen bär betydelsen även utan färg:** tecknen går att skilja åt i alla fem varianterna.
2. **Den streckade ringen syns dåligt mot land.** Den behöver en mörk kontur.
3. **Etiketter på kartan trängs i 400 px.** Vågornas namn hör hemma i teckenförklaringen och faktarutan.
4. **6 av 18 poster slutar före tidslinjen** och syns bara i listan.
5. **Afrika har en enda punkt inom tidslinjen.** Kartan får inte visa "inga fynd" som "ingen var där".

**Göra om:** kör `python3 docs/skisser/2026-11-13-forhistoria-osakerhet/skiss.py` från repots rot. Skriptet skriver HTML-filerna till `html/`. Ta bilderna med Playwright i 400 px bredd. Siffrorna i listan följer datan när skriptet körs.
