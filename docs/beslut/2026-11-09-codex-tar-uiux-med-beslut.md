# Avsteg: Codex får ta UI/UX-issues som annars väntar på beslut (#575, #844, #872, #868, #579)

**Datum:** 2026-11-09

## Beslut
DasKrokodil har sagt ja till att Codex (och Copilot) får ta de UI/UX-issues som annars hade väntat på ett beslut, utan att de ändrar historiska fakta:

- **#575** (andel upptäckt i upptäcktsvyn), **#844** (kopiera källhänvisning) och **#872** (Europa som känd hemregion): `redo` sätts direkt. `beslut-krävs` tas bort från #844 och #872, eftersom DasKrokodil har beslutat. Rekommendationerna i issuena gäller som beslut.
- **#868** (Översikt som standard) och **#579** (regionkort): avsteget gäller, men `redo` sätts först när blockaden är borta. #868 väntar på fältet `significance` i #1021 (data, bara Claude Code). #579 väntar på godkänd gränskälla och godkänt innehåll.

Vad avsteget **inte** ändrar: Codex och Copilot tar fortfarande aldrig issues där fakta, data eller källor skrivs (`data`, `faktafel`, `källkontroll`, riken, bilder). Gränsen på högst 4 öppna pull requests per person gäller, liksom regeln om filkrockar. Nya gränssnittstexter översätts till alla fem språken i samma pull request.

## Varför
UI/UX-arbetet är det som begränsar sidan just nu, medan det som kräver fakta redan ligger hos Claude Code. De fem issuena är gränssnitt, och de som blockeras av data väntar på rätt förutsättning i stället för att byggas för tidigt.

## Berör
CLAUDE.md, avsnittet "Etiketterna `redo` och `pågår`" (punkt 1). Texten där ändras inte; det här beslutet är ett avsteg för de fem issuena ovan.
