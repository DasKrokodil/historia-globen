# Programstyrd bildpipeline med pilot, och grindar för program

**Datum:** 2026-11-22 (DasKrokodil i chatten: "gör enligt rekommendationerna med en pilot")

**Underlag:** förstudien [docs/granskningar/2026-11-22-pipeline-forstudie.md](../granskningar/2026-11-22-pipeline-forstudie.md) och rekommendationen i #2183.

## Beslut

1. **Bygg bildpipelinen i tre små steg:**
   - en gemensam licensklassning (`tools/licens_commons.py`) som både `tools/bildkandidater.py` och `tools/bild_hamta.py` använder;
   - en granskningslista per bildomgång (`tools/bildbatch.py`, filerna i `data/utkast/bildbatch/`);
   - kandidatlistan delad i en fil per världsdel och period (`data/utkast/bildkandidater/<världsdel>-<period>.json`).
2. **Pilot:** #2107, #2108 och #2109 (Afrika 1000–1905) görs med pipelinen. #2110 görs på det gamla sättet som kontroll.
   - **Mått:** licensfel som når `main` ska vara 0. Andelen med bild ska vara minst 65 %. Tiden ska vara under 87 minuter per issue. Token ska vara minst 30 % färre än i kontrollen.
   - **Om piloten håller:** den utvidgas till resten av Afrika och sedan till alla bildissues. Det avgör DasKrokodil vid utvärderingen.
3. **Grindar för program:**
   - Program skriver bara förslag till `data/utkast/`. Skripten stoppar en utdataväg utanför mappen, och `tests/utkast-grans-test.py` underkänner en pull request från grenarna `bildkandidater/*`, `bildbatch/*` och `fakta/*` som ändrar något annat.
   - **Program väljer aldrig bild och skriver aldrig bildtext.** Motivflaggorna (karta, nutida foto, smal, ur sökning) sorterar och varnar, men avvisar aldrig. Bara en otillåten licens avvisas automatiskt.
   - **Licenser:** en licens som programmet inte känner igen, till exempel Commons-etiketten "No restrictions", "Attribution" eller nationella licenser, flaggas till en människa och godkänns aldrig av ett program. Library of Congress-märkningen "No known restrictions on publication" är tillåten som förut.
   - **Program sätter aldrig `two-sources`** (inte heller `source-checked`). Ett program får föreslå nivån och visa källans referens. Agenten sätter nivån efter öppnad källa. En Wikidata-uppgift utan referens, eller med bara "imported from Wikipedia", räknas inte som en oberoende andra källa.
   - **Inget betalt API för översättning.** Om det blir aktuellt senare krävs ett nytt beslut, och nyckeln får aldrig ligga i repot.
4. **Bildtexten följer ett obligatoriskt mönster för nutida foton och kartor:**
   - Nutida foto: "Nutida foto (år) av …, inte från händelsens tid."
   - Föremål: "Föremål från …, fotograferat på …"
   - Karta: säg om kartan är samtida eller ritad senare, till exempel "Karta ritad år …" eller "Modern karta".
   - Mönstret står i [docs/bilder-riktiga.md](../bilder-riktiga.md).
5. **Faktapipelinen väntar.** Kandidater ur Wikidata till täckningsluckorna, med högst 25 % krig per batch som #61, byggs först efter att bildpiloten har utvärderats och kräver då en egen beslutsfil.

## Varför

- Licensen kunde avgöras mekaniskt för 56 av 59 slumpade kandidater.
- Kandidatlistan hittar redan lika stor andel som en agent gör för hand (65 %).
- Motivet kunde bara bedömas utan varning för 214 av 776 händelser.
- Därför tar programmet det mekaniska och agenten bedömningen. Uppskattad besparing är 35–55 % token per bildissue; piloten mäter den verkliga siffran.
- Grindarna håller källpolicyn, licenserna och bildreglerna oförändrade.

## Berör

- `tools/licens_commons.py`, `tools/bildkandidater.py`, `tools/bild_hamta.py` (där också #2182 rättas), `tools/bildbatch.py`
- `data/utkast/bildkandidater/`, `data/utkast/bildbatch/`
- `tests/utkast-grans-test.py`, `tests/bildbatch-test.py`
- `.github/workflows/bildkandidater.yml`, `.github/workflows/validate-site.yml`
- [docs/bilder-riktiga.md](../bilder-riktiga.md), [docs/arkitektur.md](../arkitektur.md)
