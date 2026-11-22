# Bild-pull requests utanför taket på fyra

2026-11-21

**Beslut (DasKrokodil):** Pull requests i milstolpen "Löpande: Bilder: riktiga bilder" (beslut 2026-11-20) räknas inte mot gränsen på högst 4 öppna pull requests per person (beslutet 2026-11-06). De har i stället ett eget tak: **högst 6 öppna bild-pull requests per person**. En bild-PR som också ändrar kod (`js/`, `functions/`, `tools/`) eller gränssnittstext räknas som vanligt. Krockreglerna gäller som förut: de genererade filerna och `data/ui/*.json` är inte krock, och den som slås ihop sist ombaserar och bygger om med `tools/dela_data.py`, `tools/oversattning.py` och `tools/license_manifests.py`.

**Villkor (rutinen i docs/bilder-riktiga.md, efter pilotgranskningen av #2170):**
1. Tre omförsök med `Retry-After` före "ej hämtad", och minst två sökningar med olika sökord (och Commons-kategorin) innan en händelse skrivs i `docs/bilder-saknas.md`. "Ej hämtad" skrivs också i `docs/bilder-saknas.md` som "prövas igen".
2. Bildtexten märker senare avbildning, karta eller plan, schematisk bild och retuscherad bild, och återger filsidans reservationer.
3. Krediten nämner arkivet eller museet när filsidan har en institutionsmall.
4. En Claude Code (Opus) som inte byggde ändringen granskar licens, kredit och bildtext i varje bild-PR.
5. Codex kör på GPT-6.2 Astra med hög resonering för licenser och källor.

**Motivering:** Granskningen av #2170 visade att licensläsningen var korrekt (12 av 12), så bildarbetet kan gå i större takt. Granskningen är flaskhalsen, därför ett eget tak och inte obegränsat: en lång kö ger gamla PR:er och ombaseringar. Taket prövas efter en vecka: höjs om bild-PR:erna slås ihop inom ett dygn, sänks om granskningen ligger efter.
