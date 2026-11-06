# Automatisk etikettkontroll: ett issue, en ägare (#588)

**Datum:** 2026-11-05

## Beslut
Ett GitHub Actions-flöde (`.github/workflows/etikettkontroll.yml`, logik i `.github/scripts/etikettkontroll.cjs`) håller regeln "ett issue, en ägare" med en maskin: (1) varnar med etiketten `etikettfel` och en kommentar när ett öppet issue har flera av `orkester/codex/copilot: pågår`, både `codex: redo` och `copilot: redo`, eller `redo` och `pågår` samtidigt, och tar bort varningen när det är rättat; (2) tar bort `pågår`-, `redo`-, `behöver hjälp`- och `etikettfel`-etiketter på issuen som en sammanslagen pull request stänger med `Closes #N` (inte `Del av`); (3) påminner dagligen med en kommentar om ett `pågår` som ingen har rört på 7 dagar och som saknar en aktiv pull request. Flödet tar bort inga etiketter från öppna issues utan att varna, ändrar ingen kod eller data och behöver bara `GITHUB_TOKEN` med `issues: write`.

## Varför
Etiketterna sköttes för hand och gled: en kvarglömd `codex: redo` på ett stängt issue (#539), fel ägare på #551 och en agent som inte tittade på `copilot: redo`. Rikard godkände flödet 2026-11-05. En väntetid på 45 sekunder och en körning per issue (senaste vinner) förhindrar falska varningar när en agent tar ett issue i två steg.

## Berör
`.github/workflows/etikettkontroll.yml`, `.github/scripts/etikettkontroll.cjs`, `tests/etikettkontroll.test.mjs`, etiketten `etikettfel`, README.md, CLAUDE.md. Bygger på besluten om Copilot och röd kontroll 2026-11-05.
