# Ny kategori: katastrofer (#554)

**Datum:** 2026-11-03 (beslutat av Rikard), byggt 2026-11-05

## Beslut
Kategorin `katastrofer` ("Katastrofer") införs. Den rymmer vulkanutbrott, jordbävningar, tsunamier och översvämningar, kärnkraftsolyckor, förlisningar och dammbrott, och svält och missväxt som har drabbat många. Epidemier stannar i `halsa` och krig i `krig`. Färgen är violett `#c256f5`. Tjernobylkatastrofen flyttas från `vetenskap` till `katastrofer`. Den tomma kategorin `klimat` hette "Klimat och naturkatastrofer" och heter nu bara "Klimat", så att två kategorier inte lovar samma sak.

## Varför
Sidan saknade natur- och teknikkatastrofer helt, och av 490 händelser var 429 krig. En egen kategori gör dem lätta att filtrera och skiljer dem från krig.

Färgen valdes genom att jämföra alla kandidater med de tretton befintliga kategorifärgerna, både med normalt färgseende och med simulerad protanopi, deuteranopi och tritanopi (Machado 2009). `#c256f5` har kontrasten 4,9:1 mot panelerna (`--night-2`) och 5,3:1 mot bakgrunden (`--night`). Färgskillnaden mot alla andra kategorier är minst ΔE 20 i alla fyra lägena, och mot krig minst ΔE 48. Det svagaste befintliga paret, religion och vetenskap vid deuteranopi, ligger under ΔE 2.

## Berör
`CATEGORIES` i `js/model.js`, `schemas/event.schema.json`, `data/events.json` (bara Tjernobyl) och `data/genererat/`, kategorilistan i `CLAUDE.md`, `docs/datamodell.md`, `docs/arkitektur.md` och webbläsartestet. Innehållet i kategorin tillkommer i en egen batch med källkontroll.
