# Förväntade svar, ordförklaringar och enklare missuppfattningar i lektionerna (2026-11-27)

**Beslut (DasKrokodil, 2026-11-14, i #1316: "Följ rekommendationerna").** Issuet föreslog tre saker, och alla tre gäller:

1. **Lärarbladet får förväntade svar**, korta och med hänvisning till det de bygger på. Varje svar ska gå att belägga i stegets egna källor; går det inte, skrivs inget svar.
2. **Åk 4–6 får egna, enklare texter för missuppfattningar**, som ett valfritt fält per missuppfattning, i du-form enligt beslutet 2026-11-08 om tilltal efter ålder.
3. **"Världsdel" överallt** på svenska, som i panelen, i stället för "kontinent".

## Så blev det i data (fält som issuet bad om)

- **`step.answer`** (valfritt, bara i ett steg med `question`): `{ text, sources }`. `sources` är några av stegets egna källor, och `js/tour-format.js` stoppar en källa som steget inte anger.
- **`lesson.exitAnswer`** (valfritt): svaret på exit ticket, med källor som turens steg anger.
- **`lesson.glossary`** (valfritt, 1–8 poster): ordförklaringar `{ term, text, sources }` på elevbladet, med källor ur turens steg.
- **`young`** i `data/missuppfattningar.json` (valfritt): `{ claim?, truth, origin? }` i du-form. Faktarutan väljer dem i en lektion för åk 4–6 eller F–3 (`YOUNG_GRADES` i `js/tour-format.js`); en del som saknas visas med vuxentexten. Samma källor som posten.

Svaren skrivs ut på ett eget blad, **Svar**, efter lärarbladet, eftersom lärarbladet för andra världskriget redan nästan fyller ett A4. Där en fråga saknar facit i källorna står det på svarsbladet. I åk 4–6 heter exit ticket på elevbladet **Sista frågan** (lärarbladet skriver "Sista frågan (exit ticket)").

Inget nytt beroende, ingen ny kategori och inget byggsteg. Schema: `schemas/tour.schema.json` och `schemas/missuppfattning.schema.json`. Beskrivning: `docs/datamodell.md`.

## Varför

Lärarbladet ska kunna läsas ensamt (skolpiloten, #737), och en lärare som förbereder sig behöver veta vad källorna faktiskt säger om varje fråga. Att svaret bara får bygga på stegets källor håller källpolicyn: lärarbladet säger aldrig mer än globen. Yngre elever behöver kortare meningar och du-form, men samma fakta, så de enklare texterna är ett tillägg och inte en ny post.

## Berör

#1316. `data/turer/vikingatiden-och-varlden.json`, `data/turer/andra-varldskriget.json`, `data/missuppfattningar.json`, `data/ui/*.json`, `js/ui/print-sheet.js`, `js/ui/panel.js`, `js/ui/lesson.js`, `js/tour-format.js`. `data/uppdrag.json` (Samtidighetsjaktens uppdragstext säger fortfarande "kontinenter" på svenska) byggdes samtidigt i #1451 och ändras där eller i en uppföljning.
