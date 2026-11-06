# Kontroll som startar formulärets Pages Function som Cloudflare (#663)

**Datum:** 2026-11-06

## Beslut
GitHub Actions får ett jobb, "Starta formulärets Pages Function som Cloudflare", som kör `scripts/pages-function-check.sh`. Skriptet startar `functions/api/feedback.js` med Cloudflares verktyg wrangler (exakt version 3.114.0) och kräver svaret 503 `disabled` på `/api/feedback`. wrangler installeras i en tillfällig mapp utanför repot och används bara i kontrollen, på samma sätt som Playwright i webbläsartestet. Sidan får inga nya beroenden. Rikard sa ja 2026-11-06 ("Gör #663 nu också").

## Varför
Cloudflare stoppar hela publiceringen om funktionen inte startar. Efter #634 kraschade koden som funktionen importerar (`js/model.js` → `js/i18n.js`) i Workers-miljön, och publiceringen av `main` misslyckades 21 gånger i rad. Alla andra kontroller var gröna, eftersom de bara kör koden i node och i webbläsaren (#662).

## Berör
`scripts/pages-function-check.sh` (ny), `.github/workflows/validate-site.yml`, `.gitignore`, docs/DEPLOYMENT.md, README.md, CLAUDE.md, #662, #663.
