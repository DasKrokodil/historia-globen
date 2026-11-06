# Täckningsrunda i granskningarna

**Datum:** 2026-11-03

## Beslut
Varje större granskning och analys ska också kontrollera **vad som saknas**: glapp i fakta, länder och riken som saknas efter ett visst årtal, tomma celler per tidsperiod, världsdel och kategori, och skev balans (krig mot övrigt, negativt mot positivt). Codex gör rundan och skriver en daterad täckningsrapport i `docs/granskningar/`; Claude Code triagerar och fyller faktaluckor med källor. Det som "borde finnas" bygger på källor, aldrig på minnet.

## Varför
Granskningarna hade bara letat efter fel i det som finns, inte efter det som saknas. Sverige, Norge, Danmark och Italien saknades som riken efter 1814 utan att någon analys hade märkt det, och 429 av 490 händelser är krig.

## Berör
CLAUDE.md (UX-genomgången), AGENTS.md, `docs/granskningar/README.md`, #556 (täckning av riken), #555 (framsteg), #394 (täckningsrapport i 5.1a).
