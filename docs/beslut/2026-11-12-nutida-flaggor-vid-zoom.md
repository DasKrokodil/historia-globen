# Nutida staters flaggor syns på kartan bara med namnet vid nära zoom

**Datum:** 2026-11-12 (DasKrokodil i #1193, efter arkitektens bedömning)

## Beslut
1. En grupp i `data/empires/index.json` kan märkas `"modernState": true` (nutida stat). Standardvärdet är falskt, och utan fältet beter sig allt som tidigare.
2. En nutida stats flaggor visas på kartan bara med namnet vid nära zoom: på globen från samma förstoring som rikesnamnen, i Platt vy från nivån Inzoomat. Utzoomat står namnet, som för riken utan symbol. Faktarutan och Fokus visar alltid flaggan.
3. Äldre flaggor i nutida stater, till exempel Kina 1912–1928 och Sydafrika 1928–1993, följer samma regel.
4. `svenska-stormaktsvaldet` räknas inte som nutida stat och visas som förut.
5. Historiska rikens flaggor och tecken (Osmanska riket, Brittiska imperiet, Rom och andra) visas som förut.

Märkningen beskriver vad gruppen är, inte hur den ritas. Alla grupper som fortsätter till 2024 är märkta, utom Sverige (195 grupper 2026-11-12).

## Motivering
172 av de 217 rikena utan symbol är nutida stater. Med flagga och utan namn blir de största länderna namnlösa sköldar utzoomat, och många flaggor skiljs bara åt på färgen, vilket bryter mot WCAG 1.4.1. Regeln `kind` på flaggposten valdes bort: ingen post har `kind` i dag, och den skulle också dölja historiska flaggor.
