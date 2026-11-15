# Rikesperioder delas efter storlek från 1800 (#1732)

**Datum:** 2026-11-15 (DasKrokodil i #1732, och valet av gräns i chatten samma dag)

## Beslut
1. `tools/riken.py` slår inte ihop två perioder från **1800** och framåt när gränsändringen har en sammanhängande del som är större än **2 000 km²** och större än **0,5 procent** av riket. Det gäller även när ändringen är mindre än `MERGE` i procent av hela riket.
2. Ändringen räknas på Cliopatrias ogenomskurna gränser, inte på de förenklade. Smala remsor, cirka 4 km breda eller smalare, räknas inte, eftersom samma gräns är något olika ritad olika år.
3. Perioder före 1800 slås ihop som förut.

## Varför
Bygget slår ihop perioder där formen ändras mindre än 2 procent av ytan, 5–8 procent för de stora imperierna. Den första periodens form gäller då för hela spannet. Därför syntes inte verkliga gränsändringar, till exempel Hatay i Turkiet från 1939 eller Saarland i Västtyskland från 1958 (#1706).

Med bara gränsen på 2 000 km² blev det 255 nya perioder, och `data/empires/` växte med 15,5 procent. Brittiska imperiet gick från 533 till 841 kB och Ryssland från 98 till 299 kB. Med 0,5 procent av riket som extra villkor blir det 178 delningar och 156 fler perioder. Hela mappen växer då med 10,3 procent; rikesfilerna utan `index.json` växer med 14,1 procent. Hatay kommer fortfarande med, eftersom det är 0,6 procent av Turkiet.

Med 1 procent blev tillväxten 6,4 procent, men då försvann Hatay. DasKrokodil valde 0,5 procent av de fyra alternativen den 2026-11-15.

## Berör
- `tools/riken.py`: `SPLIT_FROM`, `SPLIT_KM2`, `SPLIT_SHARE`, `SLIVER`, `big_change()` och texten i `notes`.
- `data/empires/`.
- `tests/riken-kontrollpunkter-test.py`: Antakya och Stralsund.
- #1706, #1728, `docs/beslut/2026-11-13-ockupation-och-inbordeskrig.md`.
