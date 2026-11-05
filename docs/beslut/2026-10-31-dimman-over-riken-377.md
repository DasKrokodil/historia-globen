# Dimman lyfts över hela riket när en resa når det (#377)

**Datum:** 2026-10-31 (beslut), genomfört 2026-11-05

## Beslut
Regel A: när en resas korridor i upptäcktsvyn har nått ett rikes område i rikesdatan (`data/empires/`) lyfts dimman över hela riket, det året och framåt. Kontakten räknas när som helst före eller under rikets tid; kom resan fram innan riket fanns lyfts dimman när riket uppstår. Det som har lyfts förblir lyft. Perspektivraden i `data/upptackt.json` säger det.

## Varför
Hela länder låg kvar under dimman fast de fanns, till exempel USA under inbördeskriget. Regel A följer vyns perspektiv (upptäckt = resor från Europa och Kina kom fram) och behöver ingen ny datakälla. Länder som ingen resa i datan når förblir dolda tills fler resor finns.

## Berör
`js/layers/discovery.js`, `data/upptackt.json`, `docs/arkitektur.md`. Bygger på att staterna finns i rikesdatan (#407).
