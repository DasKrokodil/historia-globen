# Texter per språk i egna filer, spärr och register över översättningar (#675)

**Datum:** 2026-11-06 (Rikard bad Claude Code ta #675, som bygger beslutet [2026-11-06-oversatt-samtidigt.md](2026-11-06-oversatt-samtidigt.md))

## Beslut
1. Redigeringsfilerna behåller alla språk i samma post. `tools/dela_data.py` skriver grundfilerna i `data/genererat/` med bara svenskan och en fil per språk ovanpå (`<fil>.<språk>.json`), listade i `translations` i `handelser.json`. Sidan laddar på svenska inga språkfiler, och på ett annat språk det språkets och engelskans. Rikenas namn står kvar på alla språk, eftersom de engelska namnen är Cliopatrias och används som nyckel.
2. De små filer som sidan laddar direkt (fun facts, religioner, vägar, turer m.fl.) delas inte.
3. `tools/oversattning.py` och `data/oversattning.json`: en baslinje för oöversatta texter per fil och språk som bara får minska, och ett register med kontrollsummor av svenskan och översättningen som visar inaktuella översättningar. GitHub Actions kör `--check`. Utkast (`review: "draft"`) räknas inte. Undantagen `--tillat-okning` och `--godta-inaktuella` kräver Rikards ok.

## Varför
Så att besökaren inte laddar fyra språk i onödan, och så att regeln "översätt samtidigt" kontrolleras av en maskin i stället för att bero på att någon kommer ihåg den. Kontrollsummorna i en egen fil gör att innehållets poster inte får några nya fält.

## Berör
`tools/dela_data.py`, `tools/oversattning.py`, `js/model.js`, `data/genererat/`, `data/oversattning.json`, `tests/oversattning-test.py`, `.github/workflows/validate-site.yml`, docs/datamodell.md och docs/arkitektur.md.
