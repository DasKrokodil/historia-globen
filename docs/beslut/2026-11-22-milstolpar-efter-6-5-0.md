# Milstolpar efter v6.5.0

**Datum:** 2026-11-22

## Beslut
Backloggen delades efter releasen v6.5.0 (DasKrokodil, 2026-11-22). Innehållet i de fem 6.5.0-milstolparna är släppt och de är stängda. Nya och ändrade milstolpar:

| Milstolpe | Innehåll |
|---|---|
| **6.5.1 Rättningar efter 6.5.0** (ny) | Faktafel, tillgänglighetsfel och röda kontroller ur expertgranskningen av v6.5.0. Faktafel först. |
| **6.6.0 Länder: Sök och följ, Norden och Baltikum** (omdöpt, delad) | #1261, #1260, #1807 och #1808–#1813. |
| **6.6.1 Regioner: Sveriges landskap** (ny) | #1847–#1852, #1115, #1568, #1274. |
| **6.6.2 Länder: Västeuropa och Mellaneuropa** (ny) | #1814–#1826. |
| **6.6.3 Länder: Södra Europa och Balkan** (ny) | #1827–#1842. |
| **6.6.4 Länder: Östeuropa, mikrostater och pilotländer omgång 2** (ny) | #1843–#1846, #1270–#1273, #1267, #1954, #2053. |
| **6.7.0 Täckning och riken, omgång 2** (ny) | De rikes- och täckningsissues som flyttades ur 6.5.0, plus #2032, #2159, #1962 och #1757. |
| **6.8.0 Skolan och samtidigt** (var 6.7.0) | Oförändrat innehåll, nytt nummer. |

Dessutom: sexton idéer flyttades från "Senare" till "Idébank", utvärderingarna #1206, #1207 och #531 flyttades till "Att följa upp", och #1875 flyttades till den löpande bildmilstolpen. Issues stängdes inte av den här flytten.

## Skäl
- 6.6.0 hade 65 öppna issues, 44 av dem landskort för Europa. Det är för mycket för en release. Europa delas i omgångar om högst cirka 16 länder, med landskortets UI (#1261, #1260) först.
- Sveriges landskap kräver ett eget beslut om gränskälla (#1847) och är därför en egen milstolpe.
- Täckning och riken, omgång 2 är fakta- och källtungt och körs separat från länderna, med utrymme för en programstödd pipeline (förstudie efter 6.5.1).
- Faktafel och tillgänglighetsfel ur expertgranskningen rättas först, i 6.5.1, innan nya funktioner.

## Berör
CLAUDE.md (Versionsplan). Ändrar inga etiketter och ingen arbetsfördelning. Milstolparna döptes om enligt [2026-11-16-milstolpar-med-releasenummer.md](2026-11-16-milstolpar-med-releasenummer.md).
