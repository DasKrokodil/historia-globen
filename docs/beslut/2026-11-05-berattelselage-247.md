# Berättelseläget: kapitel och frågor i turerna (#247)

**Datum:** 2026-11-05

## Beslut
Rikard valde alternativ A i #247: ett krigs berättelseläge är en tur i `data/turer/`. Stegen får de valfria fälten `chapter` (kapitlets namn) och `question` (en fråga att fundera på), och turen får `war` (krigets id). Krigets första kort får då knappen "Följ berättelsen". Första och andra världskriget är de första.

## Varför
Turspelaren (#47) sköter redan år, kamera, lager och pauser, så berättelseläget behöver ingen ny uppspelningskod. Samma format kan användas för lektionsturer (#66) och kolonierna (#330). Nackdelen är att kapitlen inte ritas som band på tidslinjen; det kan läggas till senare.

## Berör
`data/turer/`, `js/tour-format.js`, `js/ui/tour.js`, `js/ui/panel.js`, `js/main.js`, `index.html`, `css/style.css`, `schemas/tour.schema.json`, `tests/tour.test.mjs`, docs/datamodell.md, docs/arkitektur.md. Källregel: frågan påstår inget som stegets källor inte säger.
