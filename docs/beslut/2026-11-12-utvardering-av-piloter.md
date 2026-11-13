# Piloter och utvärderingar: så att inget tappas bort

**Datum:** 2026-11-12

**Beslut:** DasKrokodil godkände en rutin för att inte glömma att utvärdera piloter och gå vidare (till exempel fler regioner och landskap efter platspiloten):
1. Varje pilot får ett utvärderingsissue med etiketten `utvärdering`, placerat sist i sin milstolpe, med "Utvärderas när", "Frågor" och "Beslut som följer". Mönstret är #1164. Issuet skapas när piloten beslutas.
2. Samlingsissuet "Piloter och utvärderingar: samlad översikt" (#1209) har en tabell över alla piloter, läge, tidpunkt och beslut som följer. Det uppdateras när en utvärdering görs eller en ny pilot startar.
3. Releasechecklistan (`.github/PULL_REQUEST_TEMPLATE/release.md`) har en punkt som går igenom öppna `utvärdering`-issues och nämner de mogna i release-PR:en.
4. Påminnelser på fasta datum (till exempel 2026-11-25 för arbetssättet, #1208) som schemalagda uppgifter **skjuts upp** på DasKrokodils begäran.

**Motivering:** Piloter, "efter piloten"-villkor och datum låg utspridda i enskilda issues och beslutsfiler, och ingenting påminde om dem. En gemensam etikett, en översikt och en kontroll vid varje release gör att utvärderingarna syns utan att någon behöver minnas dem. Skapade issues: #1206, #1207, #1208, #1209.
