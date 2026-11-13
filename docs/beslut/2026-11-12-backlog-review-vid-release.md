# Backlog review vid varje release

**Datum:** 2026-11-12

**Beslut:** DasKrokodil vill ha en backlog review i samband med varje release. Claude Code gör den när release-PR:en förbereds och redovisar den i PR:en (punkt i `.github/PULL_REQUEST_TEMPLATE/release.md`, regel i CLAUDE.md under Arbetssätt).

**Innehåll:** milstolpar (version och namn stämmer, stängda är tomma, överfulla delas, nya behövs), issues utan milstolpe, `redo`, `pågår` och `beslut-krävs` (avgjorda beslut, saknad rekommendation), dubbletter och föråldrade issues, öppna `utvärdering`-issues (#1209) och översättningsläget (`tools/oversattning.py`).

**Gränser:** flytt av issues mellan milstolpar och namnbyte på milstolpar görs direkt och redovisas. Stängning, sammanslagning och ändring av etiketterna `beslut-krävs` och `redo` föreslås och görs först efter DasKrokodils ok (samma ordning som genomgången efter v6.2.0, [2026-11-12-backlog-efter-6-2-0.md](2026-11-12-backlog-efter-6-2-0.md)).

**Motivering:** Efter v6.2.0 hade backloggen vuxit till 216 öppna issues med överfulla milstolpar, 18 issues utan milstolpe och beslut som redan var tagna men låg kvar som öppna. Att göra genomgången vid varje release, när allt ändå kontrolleras, hindrar att det händer igen och kopplas till utvärderingarna av piloter (2026-11-12-utvardering-av-piloter.md).
