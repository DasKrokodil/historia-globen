# Publicering: development och production


Historia-globen ska publiceras i två miljöer. Det här dokumentet beskriver grenarna, vad som publiceras, kontrollerna och hur en release och en rollback går till.


> **Läget i dag (2026-10-30):** grenen `production` finns (skapad från `main` på commit `e2774dd`), och båda grenarna är skyddade med rulesets (se [Inställningar i GitHub](#inställningar-i-github)). Webbplatsen publiceras med Cloudflare Pages: historiagloben.se visar `production`, och `main` är den enda grenen som får förhandsversioner (se [Cloudflare Pages](#cloudflare-pages)). Förhandsversionerna på pages.dev är skyddade med Cloudflare Access. GitHub Pages är avpublicerad, men källan står kvar på `main` och bör sättas till None (se [GitHub Pages](#github-pages-stängs-av)).


## Miljöer och grenar


| Miljö | Gren | Adress (senare) | Innehåll |
|---|---|---|---|
| Development | `main` | dev.historiagloben.se, skyddad med Cloudflare Access (Cloudflare-adress: main.historia-globen.pages.dev) | Allt som har slagits ihop. Här testas nästa release. |
| Production | `production` | historiagloben.se | Bara färdiga releaser. |


Regler:
- **`main` = development.** Pull requests från arbetsgrenar slås ihop till `main` som i dag.
- **`production` = publik release.** Den uppdateras **bara** med en pull request från `main`. Ingen pushar direkt till `production`, och inga andra grenar slås ihop dit.
- Rättningar (hotfixar) går också via `main`: rätta på en arbetsgren, slå ihop till `main` och gör en ny release.


## Vad som publiceras


Webbplatsen har inget byggsteg i arkitekturens mening (CLAUDE.md, punkt 1): sidan körs som den är, och `python3 -m http.server` i repots rot fungerar som förut. `scripts/build-site.sh` ändrar ingen kod. Det **kopierar** bara de filer som sidan läser när den körs till `dist/`, så att interna filer aldrig hamnar på webben.


Listan bygger på referenserna i koden:


| I `dist/` | Varför | Var referensen finns |
|---|---|---|
| `index.html` | startsidan | – |
| `css/style.css` | stilmallen (inga `url()` till lokala filer) | `index.html` |
| `_headers` | Cloudflare Pages cache-regler: `Cache-Control: no-cache` för sidan, `js/`, `css/` och `data/`, så att webbläsaren alltid kontrollerar om en fil har ändrats. Den innehåller också en `Content-Security-Policy-Report-Only` och en `Permissions-Policy`. Utan `no-cache` kunde en ny `index.html` blandas med gamla JS-moduler efter release v4.1.0 ("Globen kunde inte starta"). Har zonen i Cloudflare en egen Browser Cache TTL ska den stå på "Respect Existing Headers". | Cloudflare Pages läser den ur `dist/` |
| `js/**/*.js` (20 moduler) | ES-modulerna | `index.html` → `js/main.js` → `import` |
| `img/favicon.svg`, `img/favicon-32.png`, `img/apple-touch-icon.png` | sidans ikoner | `index.html` |
| `img/icons/*.svg` | markörernas och korten symboler, hämtas med `fetch` efter namn | `icon` i `data/events.json`, `symbol` i `data/religions.json` (#271), `CAT_ICON` och standardikonen `star` i `js/ui/funfact.js`, `index.html` |
| `data/events.json`, `funfacts.json`, `sources.json`, `land.json`, `borders.json`, `styles.json`, `empires/index.json` | laddas vid start | `loadAll()` i `js/model.js` |
| `data/religions.json`, `data/religions-polities.json` | laddas när religionslagret slås på eller vid klick | `loadReligions()`, `loadReligionPolities()` i `js/model.js` |
