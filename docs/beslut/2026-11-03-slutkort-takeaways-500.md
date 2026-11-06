# Slutkortet: det viktigaste att ta med sig (#500)

**Datum:** 2026-11-03 (Rikards beslut i #500; byggt 2026-11-05)

## Beslut
Krigets slutkort får ett valfritt fält `story.takeaways` med punkter `{ status, text, sources }`. Punkterna visas under tre rubriker i vanlig svenska efter vad källorna säger: "Det här vet vi från källorna" (`belagt`), "Här är forskare inte överens" (`omtvistat`) och "Det här vet vi inte säkert" (`okant`). Varje punkt har sin egen källa, och osäkerhet förklaras i ord, aldrig bara med en symbol. Slutkortet är oförändrat för krig utan fältet. Första krigen: första och andra världskriget och Haitiska revolutionen.

## Varför
Källkritik ska vara en naturlig del av upplevelsen, särskilt för barn: kortet ska visa skillnaden mellan det källorna visar, det forskare tolkar olika och det vi inte vet, inte ge ett facit. Ett fält med små poster (Codex förslag) låser inte formen innan materialet är granskat.

## Berör
`data/handelser/` (krigens `story`), `schemas/event.schema.json`, `js/ui/panel.js`, `css/style.css`, `scripts/validate-site.py`, docs/datamodell.md, docs/arkitektur.md. Rikens kollaps (#499) kan använda samma format.
