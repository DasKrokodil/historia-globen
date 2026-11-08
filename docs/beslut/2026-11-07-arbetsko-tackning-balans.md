# Arbetskö för de närmaste milstolparna: täckning och balans

**Datum:** 2026-11-07

## Beslut
Rikard godkände planen i `docs/granskningar/2026-11-07-plan-milstolpar-framat.md` med alla fem rekommendationer:
1. Det finns en ny milstolpe, **"Täckning: händelser och balans"**, för datauppgifterna ur täckningsrapporten (`python3 tools/tackning.py`). Rymd, medicin och vetenskap (#84–#86), riken och bilder ligger kvar i sina befintliga milstolpar.
2. **Luckorna och balansen går före fler krig och fler europeiska händelser:** förhistorien, antiken i Amerika och Afrika, medeltiden i Asien och händelser som inte är krig (vetenskap, hälsa, klimat, natur, rymden) prioriteras.
3. **Fördelning mellan kontona:** Andreas Claude Code tar rymd, medicin och vetenskap (#84–#86); Rikards Claude Code tar täckningsomgångarna per period, så att de inte ändrar samma periodfiler. Det är ett tips, ingen spärr.
4. **Förhistorien väntar på beslutet om #396** (ungefärliga datum), så att den inte byggs på en modell som ska ändras.
5. Issuena skapas enligt planen, med byggorder i issuet och `redo` bara där inget krockar eller väntar på något.

## Varför
Täckningsmätningen visar stora tomma celler och skev balans (58 % krig, 21 fun facts, 24 % med bild). Listan över vad som saknas byggs ur öppnade källor först (#760), så att inget läggs in ur minnet. Att dela efter period och konto minskar filkrockarna, eftersom alla datapull requests delar de genererade filerna.

## Berör
Milstolpe 31, #760–#782, #84–#86, #299, #396, #555, #677, CLAUDE.md (arbetssättet för etiketter och två personer), `docs/granskningar/2026-11-07-plan-milstolpar-framat.md`.
