# Tidsdomänen: namnen reserveras nu, läget byggs i version 8 (#397)

**Datum:** 2026-11-13 (DasKrokodils ja till beslut 8 i helganalysen, #1289; kommentar på #397)

## Beslut
1. Tillståndet får fältet `domain` för tidsdomänen, alltså om globen visar människans historia eller jordens historia. Adressen får ett eget fält för den, `d`.
2. **Bara namnen reserveras nu.** `RESERVED_STATE_KEYS` i `js/state.js` och `RESERVED_HASH_FIELDS` i `js/url-state.js` säger vilka namn som är upptagna, och `tests/url-state.test.mjs` stoppar en ändring som skriver dem. I dag skrivs varken `domain` eller `d`, och en länk med `d` öppnas som om fältet saknades.
3. Läget, värdena för `d`, vad som stängs av per domän (riken, religioner, platser, världsdelar) och ändringen av arkitekturens punkt 3 byggs i version 8, efter tidsmodellen (#396, #49) och bildlager v2 (#1325).

Bokstaven `d` valdes i pull requesten, eftersom beslutet bara sa "ett eget adressfält". Den kan bytas fram till version 8, eftersom ingen länk ännu skriver den.

## Varför
Version 8 är den enda delen som ändrar arkitekturens punkt 3 (beslut 2026-11-10 om version 7:s riktning). Att reservera namnen kostar nästan inget nu, medan en namnkrock i adressen är dyr att rätta när länkar redan har delats: adressen har ingen version, bara regeln att okända fält hoppas över.

## Berör
`js/state.js`, `js/url-state.js`, `tests/url-state.test.mjs`, `docs/arkitektur.md`. Issues #397, #396, #49, #1325, #51, #1289. Beslut [2026-11-10-version-7-riktning.md](2026-11-10-version-7-riktning.md) och [2026-11-13-bildlager-v2-format.md](2026-11-13-bildlager-v2-format.md); granskningen `docs/granskningar/2026-11-13-helganalys-b-arkitektur-mot-backloggen.md`.
