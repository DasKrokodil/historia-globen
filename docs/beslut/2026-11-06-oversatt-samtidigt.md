# Nytt material översätts i samma pull request som det skapas (#63)

**Datum:** 2026-11-06 (Rikard godkände regeln och ordningen samma dag)

## Beslut
1. **Ny gränssnittstext** läggs in på alla fem språken (`sv`, `en`, `de`, `es`, `fr`) i samma pull request som texten. Ett test stoppar pull requesten om en nyckel saknas i något språk.
2. **Nytt innehåll** (händelse, fun fact, tur, rike, religion, väg) skrivs på svenska och källkontrolleras först, som förut. Översättningarna till engelska, tyska, spanska och franska görs i **samma pull request**. Granskaren kontrollerar källorna och översättningarna i samma steg: inga årtal, siffror, namn, platser eller påståenden får ändras, läggas till eller tas bort (beslut 2026-11-05, punkt 4).
3. **Rättelser:** ändras den svenska texten ska översättningarna uppdateras i samma pull request. Ett verktyg visar översättningar som har blivit inaktuella.
4. **Spärr:** så länge äldre innehåll saknar översättning får antalet oöversatta texter aldrig öka. Nytt innehåll måste alltså vara översatt, utan att det äldre blockerar.
5. **Det äldre innehållet** översätts i omgångar per tidsperiod, i den här ordningen: **engelska först**, sedan tyska, spanska och franska. Ett språk görs färdigt innan nästa börjar.

## Varför
Stora översättningar i efterhand blir aldrig klara och glider isär från svenskan; redan i dag saknar de franska, tyska och spanska gränssnittsfilerna nycklar som har tillkommit efter 2026-11-05. Att översätta samtidigt gör att varje språk förblir komplett när det väl är ikapp. Kostnaden är fler tokens per ny händelse, inte mer tid för Rikard.

## Berör
CLAUDE.md, AGENTS.md, docs/datamodell.md, `data/ui/`, `tests/i18n.test.mjs`, `tools/`, `data/handelser/`, `data/funfacts.json`, `data/empires/`, `data/turer/`. Bygger vidare på [2026-11-05-sprak-63.md](2026-11-05-sprak-63.md).
