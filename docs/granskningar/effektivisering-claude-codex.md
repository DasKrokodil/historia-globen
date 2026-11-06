# Effektivisering av samarbetet mellan Claude Code och Codex

**Datum:** 2026-11-04 · **Underlag:** `CLAUDE.md`, `AGENTS.md`, `.orchestra/project.md`, `.orchestra/context-map.md`, `docs/granskningar/README.md` och `docs/granskningar/2026-10-31-orkester-tokenanalys.md` på `main`.

## Redan infört – föreslås inte igen

Kontextrouting, en arbetare som norm, riskbaserade kontroller, gemensamt bevisblock, separat Codex-förgranskning, avgränsad Claude-slutgranskning, händelsedriven kökontroll, omedelbar handoff, tokenbudget och Codex-ägd blind-spots-runda finns redan i reglerna. Inga verifierade mätvärden för faktisk tokenbesparing finns i det granskade underlaget.

## Kvarvarande förbättringar (förslag, inte beslut)

| Prio | Konkret kvarstående problem och förslag | Nytta/besparing | Risk |
| --- | --- | --- | --- |
| **1** | **Motstridig läs- och köregel:** `CLAUDE.md` inleder med ”Läs hela filen”, medan `.orchestra/context-map.md` uttryckligen ersätter helinläsning. `CLAUDE.md` säger dessutom ”full kontroll” av `codex: redo` efter varje PR, trots senare lättviktsregel i samma fil och `.orchestra/project.md`. Samordna formuleringarna till kontextkartan respektive *lätt kökontroll* och behåll full granskning vid angivna triggers. | **Hög**: undviker motstridiga instruktioner och återkommande onödig läsning. | **Låg** om säkerhets- och källregler fortsatt är obligatoriska. |
| **2** | **UX-ansvaret dubbleras i text:** `CLAUDE.md` avsnittet ”UX-genomgång” föreskriver fortfarande att Claude själv gör separat blind-spots-analys, medan avsnittet ”Codex kör löpande”, `AGENTS.md` och `.orchestra/project.md` ger just den rundan till Codex. Förtydliga att Claude gör ordinarie UX-bedömning och triage, **inte** samma blind-spots-runda igen; full releasekontroll kvarstår. | **Hög**: en mindre dubbel analys per större UX-genomgång. | **Låg–medel**: kräver tydligt ägarskap och spårbar rapport. |
| **3** | **Oklar reviewgrind för Codex-PR:** `.orchestra/project.md` kräver dirigentgranskning *innan PR öppnas*, medan `AGENTS.md` och `CLAUDE.md` kräver separat Codex-granskning *efter PR* och Claude först efter ”Klar för Claude Code-granskning”. Ange uttryckligen att för Codex-PR gäller Codex-förgranskning efter öppning, sedan Claude-beslut; dirigentens förhandsgranskning avser egna orkesterarbetares leveranser. Återanvänd PR-diff och samma verifieringsbevis. | **Hög**: minskar tolkningsarbete och risk för dubbelgranskning. | **Medel**: kontrollera att inget PR går förbi Claude eller Rikards mergebeslut. |
| **4** | **Testbevisens tidpunkt är tvetydig:** `.orchestra/project.md` kräver egna skärmbilder före PR men hänvisar också till CI-artefakten `skarmbilder`, som uppstår först efter PR. Definiera två olika bevis: lokalt riktat UI-bevis före PR, CI-status/artefakt efter PR; återtest endast vid ändrad kod, fel eller hög risk enligt befintlig riskpolicy. | **Medel**: färre vänteslingor och onödiga omkörningar. | **Låg–medel**: centrala flöden och release behåller full testning. |
| **5** | **Rapportöverlämning är onödigt tung för enstaka beställda analyser:** `AGENTS.md` och `docs/granskningar/README.md` kräver normalt både Markdown och ändrad `handoff.json`. Överväg ett uttryckligt undantag för beställda, enskilda rapporter: PR-länk som överlämning, medan `handoff.json` reserveras för rapporter som ska triageras automatiskt vid nästa start. | **Medel**: färre filkrockar, commits och handoff-steg. | **Medel**: kräver beslut så att inga rapporter missas. |

**Oförändrade skydd:** Ingen ändring i `data/sources.json`, faktastatus, källpolicy, arkitekturgrindar, CI-skydd, releasekontroll eller regeln att endast Rikard mergar. Förslagen kräver separat godkännande innan arbetsregler ändras.

**Avgränsning:** Detta är en dokumentgranskning, inte uppmätt tids-/tokenprofilering eller utförd ändring av arbetsrutiner. Denna beställda leverans innehåller endast rapportfilen; `handoff.json` lämnas orörd enligt uppdraget.
