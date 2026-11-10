---
description: Kör dirigenten och orkestern på Historia-globen (avgränsat pass, PR-läge)
argument-hint: "[issuenummer eller område]"
---

Begärt område: $ARGUMENTS

Läs och följ projektets orkesterpolicy i [.orchestra/project.md](../../.orchestra/project.md) och därefter
kärnan i [.orchestra/shared/ORCHESTRA.md](../../.orchestra/shared/ORCHESTRA.md),
[.orchestra/shared/ISSUE-WORKFLOW.md](../../.orchestra/shared/ISSUE-WORKFLOW.md) och
[.orchestra/shared/COORDINATION.md](../../.orchestra/shared/COORDINATION.md). Använd
[.orchestra/shared/WORKER.md](../../.orchestra/shared/WORKER.md) vid delegering.

Med eller utan område körs ett avgränsat pass utan timer eller bevakning. Ett angivet område avgränsar arbetet.
Leverera varje issue som en pull request, aldrig direkt till main. Ställ inga frågor i chatten: en fråga som bara
Rikard kan besvara postas på issuet med etiketten `user question`.

**Ett pass följer en kontextgrupp (beslut 2026-11-10, #1119, provregel).** Utan angivet område väljer dirigenten en
grupp issues som delar kontext (samma filer eller subsystem, samma källor eller region, samma översättningsarbete) och
byter inte domän mitt i passet; finns en planeringsrapport med kontextgrupper i `docs/granskningar/` följs den. Blanda
inte fakta/data med gränssnitt i samma pass. När tråden stängs, till exempel för att passet är klart eller en pull request är
öppnad och kökontrollen gjord, lämnar dirigenten en **överlämningsrad** i issuet eller pull requesten: beslut,
avvikelser och vad som inte gjordes. Starta inte om tråden mitt i en granskningsomgång av samma pull request.
