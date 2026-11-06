# Undantag i spärren för de tio staterna i #686 (#675)

**Datum:** 2026-11-06 (Rikard valde undantaget samma dag)

## Beslut
Spärrens baslinje i `data/oversattning.json` höjs en gång, med `python3 tools/oversattning.py --tillat-okning`, för de tio stater som kom med [#686](https://github.com/DasKrokodil/historia-globen/pull/686) (sjätte omgången av #644): Rumänien, Laos, Guyana, Belarus, Senegal, Kirgizistan, Kambodja, Tunisien, Nepal och Surinam. Deras 15 namn finns på svenska och engelska men inte på tyska, spanska och franska. De översätts tillsammans med övriga riken i #677–#679.

## Varför
Staterna byggdes innan regeln "översätt samtidigt" fanns, och slogs ihop efter spärren (#682), så kontrollen blev röd på `main` och stoppade alla pull requests. Namnen skrivs av `tools/riken.py` ur koden, och en översättning direkt i datafilerna skulle försvinna vid nästa körning. Hur verktyget bevarar översättningar löses en gång för alla riken i #676.

## Berör
`data/oversattning.json`, #644, #675, #676–#679. Gäller bara de här staterna; nya riken översätts i samma pull request som de skapas.
