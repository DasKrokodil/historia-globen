# Kontextgrupper: issues som delar kontext görs i samma tråd (#1119)

**Datum:** 2026-11-10

## Beslut
Issues sorteras i kontextgrupper efter delad kontext (samma filer eller subsystem, samma källor eller region, samma översättningsarbete), inte efter antal. `/milstolpe` får steget kontextgrupper, och ett `/orkester`-pass följer en grupp. Tokenbudgeten räknas per grupp, helst som procent av veckoanvändningen. När en tråd stängs lämnas en överlämningsrad. Reglerna gäller som provregler tills ett mätförsök med 2–3 pass är gjort och rapporterat i `docs/granskningar/`.

## Varför
Startkostnaden (CLAUDE.md är cirka 50 kB) betalas en gång per tråd, och hela kontexten läses om vid varje tur. Korta trådar sparar tillväxtkostnad men betalar start flera gånger; det som avgör är därför hur mycket issuen delar. DasKrokodil svarade ja på alla fem frågor i #1119.

## Berör
`.claude/commands/milstolpe.md`, `.claude/commands/orkester.md`, `.orchestra/project.md` (Kontextgrupper, Tokenbudget), #1119 och #1120 (underlag för upstream), docs/granskningar/2026-10-31-orkester-tokenanalys.md, beslut 2026-11-03 (tokenbudget).
