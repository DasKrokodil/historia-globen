# Upptäcktsvyn ser världen från Europa

**Datum:** 2026-11-06

## Beslut
Dimman i upptäcktsvyn följer det europeiska perspektivet, inte bara resorna i datan. Dimman är lyft över de europeiska rikena i rikesdatan (`home.empires` i `data/upptackt.json`: Rom, Makedonien med Alexanders erövringar och senare de europeiska staterna och kolonialväldena) för varje period som har börjat. Ett rike som under samma år gränsade till ett hemrike (områdena låg högst `home.neighborDeg` = 3,5 grader från varandra) lyfts som granne från det året. Grannarnas grannar räknas inte, så att dimman inte sprider sig av sig själv. Resorna och regel A (#377) gäller som förut för resten av världen. Perspektivraden säger det.

## Varför
Rikard såg att Alexander den stores fälttåg låg under dimman år 257 f.Kr., fast området var välkänt från Europa. Dimman lyftes bara längs resor, och de första resorna i datan börjar 130 f.Kr., så till och med Grekland och Rom var dolda. Regeln bygger på rikesdatan ur Cliopatria, som redan är källkontrollerad, och behöver ingen ny datakälla eller några ritade gränser för "den kända världen".

## Följder
Exempel ur datan: 257 f.Kr. syns Rom, Makedonien (från Grekland till Indus och Egypten), Persiska riket, Kartago, Seleukidriket och Mauryariket. Parterna lyfts 66 f.Kr. (granne till Rom), Mongolriket 1236 och Mingdynastin 1632. Ett område som inte ligger i något av dessa riken i datan, till exempel Skandinavien före Kalmarunionen, lyfts inte av regeln utan bara av resor.

## Berör
`js/layers/discovery.js`, `data/upptackt.json`, `docs/arkitektur.md`, `docs/datamodell.md`, `tests/webblasare.mjs`. Ändrar beslutet om upptäcktsvyn (#101, 2026-10-31) där dimman bara lyftes av resor.
