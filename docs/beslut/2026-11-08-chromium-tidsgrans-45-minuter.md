# Webbläsartestet i Chromium får 45 minuter (#864)

**Datum:** 2026-11-08

**Beslut:** `timeout-minutes` i `.github/workflows/browser-test.yml` är 45 för alla webbläsare. Chromium hade 30 (beslut 2026-11-07).

**Motivering:** Sviten tar nu 25–28 minuter i Chromium och körningar avbröts av tidsgränsen utan att någon kontroll hade felat: pull request #907 avbröts i sista avsnittet (presentationsläge) efter 30 minuter, och en ren dokument-PR (#658) avbröts också. Höjningen är en tillfällig lösning; den riktiga är att dela sviten i parallella jobb (#864), och då kan gränsen sänkas igen.
