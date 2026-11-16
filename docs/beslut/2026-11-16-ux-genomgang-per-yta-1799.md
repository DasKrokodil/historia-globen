# UX-genomgång per yta och UX-agenten i releasegranskningen

2026-11-16

**Beslut (DasKrokodil i #1799, "ja enligt rekommendationerna"):**

1. `ux-tillganglighet` ingår i expertgranskningen före varje release: allt som ändrats i gränssnittet sedan förra releasen, i
   dator- och mobilbredd, med en daterad rapport i `docs/ux-review/` och en kommentar i release-PR:en. Agenten ändrar inga filer.
2. Ytorna går igenom som en besökares uppgift med fem frågor (förväntan, först, ointressant, tillstånd, läsbarhet och mobil),
   en skärmbild per svar: en baslinje för alla ytor nu, därefter vid varje release för de ytor som har ändrats.
3. Min dagliga UX-genomgång (CLAUDE.md) utökas med ytlistan.
4. Fynd som genomgången missade loggas, högst en rad per fynd, i `docs/ux-review/fynd-som-missades.md`.
5. Produktbeslut av typen "ska källor synas först?" flaggas av agenten som "kräver DasKrokodils ja" och avgörs av honom;
   beslutet skrivs som en beslutsfil.

**Motivering:** UX-agenten var avsedd för milstolpar och enskilda ändringar och ingick varken i releasegranskningen eller i
den dagliga genomgångens ytlista. Platskortet, regionvyn och turkorten byggdes i flera milstolpar och granskades aldrig som
en helhet, och förväntningar ("jag trodde jag redan var i regionvyn") hittas bara när man går igenom en uppgift som en
förstagångsbesökare. Enligt CLAUDE.md ska ett användarfynd som testet missade leda till en ändring av metoden.
