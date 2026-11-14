# Kortare faktatexter: sammanfattningar om cirka 300 tecken (#1599)

**Datum:** 2026-11-14 (DasKrokodil sa ja till rekommendationen i #1599 samma dag)

## Beslut
1. **Mål:** en sammanfattning (`summary`) på en händelse, en resa eller en väg är som huvudregel **högst cirka 300 tecken** på svenska, ungefär två till tre korta meningar. Fördjupningen står i det som redan finns hopfällt (noten "Källorna skiljer sig", "Hur vet vi det här?", "Kortfattat"). En text som behöver vara längre får vara det, och visas då i korta stycken (#1595).
2. **Äldre texter kortas i omgångar** om cirka 40 texter per pull request, längst först: resorna och vägarna först (30 texter), sedan händelser över 500 tecken, sedan 400–500.
3. **En förkortning tar bara bort.** Inga nya påståenden, och årtal, siffror, namn och platser som står kvar är oförändrade. Översättningarna (`en`, `de`, `es`, `fr`) kortas på samma sätt i samma pull request (beslut 2026-11-06). Där källorna är oense står nyansen kvar i noten, och en mening om osäkerhet ("källorna skiljer sig", "omstritt") tas inte bort ur sammanfattningen. En granskare jämför mot källan som vanligt.
4. **Spärr:** `tools/textlangd.py` räknar per fil hur många svenska sammanfattningar som är längre än 300 tecken, med baslinjen i `data/textlangd.json`. Antalet får bara minska, på samma sätt som antalet oöversatta texter. GitHub Actions kör `--check`, och `--lista` visar de längsta texterna för nästa omgång. `--tillat-okning` används bara med DasKrokodils ok.
5. **Ingen separat kortversion** (`blurb`) bredvid den långa texten: det skulle ge två texter per post och en stor mängd nya översättningar.

## Varför
DasKrokodil tycker att faktatexterna är stora stycken som är jobbiga att läsa, och att kortare och lättare text är bättre än mycket fakta (kommentar i #1571). Uppmätt 2026-11-14 hade händelserna median 337 tecken och 172 texter över 500; resorna median 605 och längst 1 234. Att bara ta bort och aldrig skriva nytt gör att källkontrollen står kvar: allt som finns kvar har redan kontrollerats mot källan.

## Berör
`data/routes/*.json` (första omgången), senare `data/handelser/*.json`, `tools/textlangd.py` (ny), `data/textlangd.json` (ny, publiceras inte), `tests/textlangd-test.py` (ny), `.github/workflows/validate-site.yml`, `docs/datamodell.md`, `docs/arkitektur.md`, `README.md`, `CLAUDE.md`, `AGENTS.md`.
