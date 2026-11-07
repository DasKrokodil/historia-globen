# Små stater ur Natural Earth, visade som punkter (#722)

**Datum:** 2026-11-07

## Beslut
Tolv nutida stater som Cliopatria saknar eller har fel gräns för får gränsen ur Natural Earth (`ne_10m_admin_0_countries` 5.1.1, public domain) och visas på kartan som en punkt med namn: Saint Kitts och Nevis, Mikronesiska federationen, Kiribati, Komorerna, Liechtenstein, Maldiverna, Marshallöarna, Nauru, Samoa, San Marino, Tonga och Tuvalu. Gränsen är dagens land. Den visas från självständigheten enligt Wikidata och Wikipedia, och punkten står på huvudstaden enligt Wikidata. Där källorna anger olika årtal (Saint Kitts och Nevis, San Marino) står det i rutan Om kartan.

## Varför
Länderna är för små för kartans förenklade gränser, och utan dem saknades tolv av FN:s 193 länder. Natural Earth används redan för grundkartan och de omstridda områdena (#644).

## Berör
`tools/ne_omstridda.py`, `tools/riken.py` (`ne`, `point`, `label`), `js/layers/areas.js`, `data/empires/`, #722, #556. Andorra och Monaco tas i #719.
