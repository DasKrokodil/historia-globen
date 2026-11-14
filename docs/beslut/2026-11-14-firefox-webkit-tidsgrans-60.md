# Firefox och WebKit får 60 minuters tidsgräns

**Datum:** 2026-11-14 (DasKrokodil sa ja samma dag: "du får ändra tiden")

## Beslut
1. Firefox- och WebKit-jobben i webbläsartestet (`.github/workflows/browser-test.yml`, bara på release-PR:er och pull requests med etiketten `alla-webbläsare`) får tidsgränsen **60 minuter** i stället för 45.
2. Chromium-jobbens 25 minuter ändras inte.
3. Gränsen prövas igen när Firefox- och WebKit-jobben har delats eller blivit snabbare (se beslutet 2026-11-13 om WebKit, som omprövar delning vid cirka 38 minuter).

## Varför
Firefox-jobbet tar nu 42–45 minuter på CI och avbröts av 45-minutersgränsen på PR #1601 (körning 43630509485, jobb 132556090314, 2026-11-14). WebKit har också avbrutits vid 45 minuter, på PR #1600. Ett avbrutet jobb ger inget svar, eftersom resultaten skrivs ut först när jobbet är klart, och då kan en release-PR inte avgöras. Med 60 minuter finns utrymme tills jobben delas.

Ersätter "Firefox och WebKit behåller 45 minuter" i [2026-11-08-webblasartestet-tre-jobb-864](2026-11-08-webblasartestet-tre-jobb-864.md).
