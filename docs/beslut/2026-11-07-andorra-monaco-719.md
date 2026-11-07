# Andorra och Monaco som punkter (#719)

**Datum:** 2026-11-07

## Beslut
Andorra och Monaco visas som de små staterna i #722: en punkt med namn på huvudstaden och gränsen ur Natural Earth (`ne_10m_admin_0_countries` 5.1.1). Årtalen kommer från Cliopatria, som har båda länderna (Andorra från 1815, Monaco 1642–1793, 1814–1939 och från 1945). Monaco har Cliopatrias gräns till och med 1847 och Natural Earths från 1848, eftersom Cliopatrias gräns från 1848 ligger väster om Monaco.

## Varför
Grannarnas förenklade gränser täckte Andorra, och Monaco var för litet för att synas. Med dem finns alla FN:s 193 länder på kartan.

## Berör
`tools/riken.py` (`ne` och `ne_from` på en del med Cliopatria-namn), `tools/ne_omstridda.py`, `data/empires/andorra.json`, `data/empires/monaco.json`, #719, #722, #556.
