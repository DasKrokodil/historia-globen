# Rikenas flaggposter får en typ: flagga, symbol eller modern återgivning

**Datum:** 2026-11-11 (byggorder från DasKrokodil i #1148, del av #1145)

## Beslut
En post i ett rikes `flags` (`data/empires/index.json`) får det valfria fältet `kind` med ett av värdena `flag`, `symbol` och `reconstruction`. Saknas fältet är posten en flagga, så befintliga data är oförändrade. Faktarutan skriver på en rad under rubriken vad tecknet är, och markörens skärmläsartext säger samma sak. Ett rike som bara har sin medalj (`symbol`) får raden för symbol.

## Varför
När Rom får sitt vexillum (#1146) och fler riken får tecken ska ingen tro att Rom hade en flagga i modern mening. Att skilja en belagd flagga, ett tecken som riket använde och en nutida teckning av något belagt är källkritik som syns för besökaren.

## Berör
`schemas/empire-index.schema.json`, `docs/datamodell.md` (`flags`), `js/layers/areas.js`, `js/layers/empiremarks.js`, `js/controllers/facts.js`, `js/ui/panel.js`, `data/ui/*.json`, #1145–#1148.
