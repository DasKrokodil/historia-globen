# Tak för markörer i vanligt läge byggs först när datan kräver det

**Datum:** 2026-11-12 (DasKrokodil i #1192: "Ja" på rekommendationen)

## Beslut
1. Inget tak för antalet markörer byggs i vanligt läge nu. Taket på 300 i tidsintervallet (`DEFAULT_RANGE_MARKER_LIMIT`, `markersToHide`) gäller som förut bara intervallet.
2. Taket byggs när mätningen visar mer än cirka 60 samtidiga markörer något år. Mätningen görs med `node tools/markortak.mjs`, som räknar som händelselagret och avslutas med kod 1 när något år går över taket. Den körs när nya händelser läggs till i större omgångar (till exempel #452 och #61).
3. När taket byggs blir det cirka 60, med `top` och `major` som rangordning (samma mekanism som `markersToHide`), ett meddelande i gränssnittet på fem språk när markörer döljs, och en kontroll av att Samtidigt-kortets bågar inte beror på vilka markörer som syns.
4. Tidsfönstret görs inte tätthetsberoende: en dold andra regel ovanpå skalan skulle ändra fönstret varje gång data tillkommer.

## Varför
I dagens data syns högst 49 markörer samtidigt (1967) och medianen är 12–35 per segment, eftersom ett långt fönster i glesa tider och ett kort i täta tider jämnar ut antalet. Ett tak nu skulle dölja händelser utan att det behövs. Fönstret är en andel av reglaget och växer inte med datan, så tätheten ökar när fler händelser läggs till; därför behövs mätningen.

## Berör
`tools/markortak.mjs`, `docs/arkitektur.md` (Tidsfönstret), #1192, #1191, #756.
