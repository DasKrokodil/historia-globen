# Publicering: development och production

Historia-globen ska publiceras i två miljöer. Det här dokumentet beskriver grenarna, vad som publiceras, kontrollerna och hur en release och en rollback går till.

> **Läget i dag (2026-10-30):** grenen `production` finns (skapad från `main` på commit `e2774dd`), och båda grenarna är skyddade med rulesets (se [Inställningar i GitHub](#inställningar-i-github)). Ingen publicering till dev.historiagloben.se eller historiagloben.se är uppsatt ännu, men GitHub Pages publicerar `main` (se [GitHub Pages](#github-pages-stängs-av-när-cloudflare-pages-är-uppsatt)). Webbhotell och publiceringssteg är inte valda; se [Öppna frågor](#öppna-frågor).

## Miljöer och grenar

| Miljö | Gren | Adress (senare) | Innehåll |
|---|---|---|---|
| Development | `main` | dev.historiagloben.se, skyddad med Cloudflare Access | Allt som har slagits ihop. Här testas nästa release. |
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
| `js/**/*.js` (17 moduler) | ES-modulerna | `index.html` → `js/main.js` → `import` |
| `img/favicon.svg`, `img/favicon-32.png`, `img/apple-touch-icon.png` | sidans ikoner | `index.html` |
| `img/icons/*.svg` | markörernas och korten symboler, hämtas med `fetch` efter namn | `icon` i `data/events.json`, `CAT_ICON` och standardikonen `star` i `js/ui/funfact.js`, `index.html` |
| `data/events.json`, `funfacts.json`, `sources.json`, `land.json`, `borders.json`, `styles.json`, `empires/index.json` | laddas vid start | `loadAll()` i `js/model.js` |
| `data/religions.json`, `data/religions-polities.json` | laddas när religionslagret slås på eller vid klick | `loadReligions()`, `loadReligionPolities()` i `js/model.js` |
| `data/empires/<rike>.json` | laddas när riket behövs | fältet `file` i `data/empires/index.json` |
| `images/events/*.webp` | händelsernas bilder | `image.file` i `data/events.json` |
| `LICENSE`, `data/LICENSE` | licenserna för kod (GPL-3.0) och data (CC BY 4.0) | Inte läst av sidan; följer med eftersom licenserna gäller de publicerade filerna. |

Alla ikoner i `img/icons/` publiceras, eftersom namnen kommer ur data och JS. I dag används alla 19. Bilderna i `images/events/` publiceras bara om en händelse pekar på dem.

**Publiceras aldrig:** `.claude/`, `.orchestra/`, `.github/`, `docs/`, `tools/`, `scripts/`, `data/utkast/`, `images/incoming/`, `CLAUDE.md`, `README.md`, Python- och skalskript, Markdown-filer och cachefiler.

**Externa resurser** som sidan hämtar vid körning och som inte finns i `dist/`:
- three.js 0.160.0 från `cdn.jsdelivr.net` (`js/globe.js`)
- typsnitten från Google Fonts, `fonts.googleapis.com` och `fonts.gstatic.com` (`index.html`)

De måste vara nåbara från båda miljöerna. Det gäller också om en Content-Security-Policy eller Cloudflare-regel läggs till.

## Bygga och kontrollera lokalt

```bash
scripts/build-site.sh
```

Skriptet gör så här:
- Tar bort gamla `dist/` och skapar en ny.
- Kopierar filerna enligt listan ovan.
- Avbryter med fel om en obligatorisk fil saknas.
- Kör sedan `scripts/validate-site.py`, som kontrollerar följande:
  1. `dist/index.html` finns.
  2. Inga interna filer eller mappar finns i `dist/`.
  3. All JSON i `dist/` går att läsa.
  4. Alla lokala `src` och `href` i `index.html` finns.
  5. Alla relativa importer i JS finns, och varje JS-fil nås från `js/main.js`.
  6. Alla filer som laddas med `getJSON('…')` finns.
  7. Filer som data pekar på finns: rikesfiler (`file`), bilder (`image.file`) och ikoner (`icon` och `CAT_ICON`).
  8. Varje `sources`-id i händelserna finns i `sources.json`, och varje händelse som en fun fact pekar på finns i `events.json`.

Provkör den byggda sidan:

```bash
python3 -m http.server 8000 --directory dist
```

`dist/` committas inte (`.gitignore`).

## Automatiska kontroller (GitHub Actions)

`.github/workflows/validate-site.yml` kör bygget och valideringen:
- vid varje **push till `main`**
- vid varje **pull request mot `main`**
- vid varje **pull request mot `production`**

Bara pull requests mot `production` får dessutom kontrollen **"Release kommer från main"**. Den underkänner pull requesten om den inte kommer från grenen `main` i samma repo.

Workflowen underkänns om något steg misslyckas.

### Inställningar i GitHub

Det här går inte att lägga i repot. Rikard gjorde det under Settings → Rules den 30 oktober 2026, med två rulesets:

| Ruleset | Gäller | Regler | Får gå förbi |
|---|---|---|---|
| `main` | standardgrenen (`main`) | ingen radering, ingen force-push, pull request krävs (0 godkännanden), **"Bygg och validera dist/"** måste vara grön | ingen |
| `production` | `refs/heads/production` | ingen radering, ingen force-push, pull request krävs (0 godkännanden, bara merge commit), **"Bygg och validera dist/"** och **"Release kommer från main"** måste vara gröna | Repository admin (alltid), för nödläget i [Rollback](#rollback-till-en-tidigare-release) |

Godkännanden är satta till 0 eftersom projektet har en ägare, och GitHub låter ingen godkänna sin egen pull request. "Release kommer från main" går bara att lägga till som krävd kontroll när den har körts en gång mot `production`; det gjordes med pull request #277.

## Release: från main till production

1. Kontrollera att `main` är grön i Actions och att development-miljön ser rätt ut.
2. Välj versionsnummer (se nedan).
3. Öppna en pull request **från `main` till `production`**, med rubriken till exempel `Release v3.0.0`. Beskriv vad som är nytt sedan förra releasen; de sammanslagna PR:erna och issuena räcker.
4. Vänta tills kontrollerna är gröna. Slå ihop med en **merge commit**, inte squash eller rebase, så att `production` och `main` delar historik och nästa release inte får konflikter.
5. Sätt en tagg på merge-commiten i `production` och skapa en GitHub Release:
   ```bash
   git fetch origin production
   git tag -a v3.0.0 origin/production -m "Release v3.0.0"
   git push origin v3.0.0
   ```
   Det går också att göra i GitHub under Releases → Draft a new release: välj grenen `production` och skriv taggen `v3.0.0`.
6. Publiceringen till historiagloben.se sker från `production`. Det steget är inte uppsatt ännu.

### Versionsnummer vX.Y.Z

Taggarna skrivs `vX.Y.Z` med gemener och tre tal (semantisk versionering):
- **X (huvudversion):** versionen i versionsplanen, till exempel `v3.0.0` när version 3 (Krig och slag) släpps.
- **Y (delversion):** nytt innehåll eller nya funktioner inom samma version, till exempel fler krig: `v3.1.0`.
- **Z (rättning):** bara rättningar, till exempel ett faktafel eller en bugg: `v3.1.1`.

Tidigare releaser har taggarna `V2` och `V2.1`. De ligger kvar som de är. Från och med första releasen till `production` används `vX.Y.Z`. Vilket nummer den första får (till exempel `v3.0.0`) bestämmer Rikard.

## Rollback till en tidigare release

Visar historiagloben.se något trasigt finns tre sätt att gå tillbaka, i den här ordningen:

1. **Rulla tillbaka i webbhotellet.**
   - **När:** det snabbaste sättet, när webbhotellet sparar tidigare publiceringar. Cloudflare Pages har till exempel en knapp för det.
   - **Hur:** välj publiceringen från den förra taggen.
   - **Efteråt:** ändrar ingen kod, så rätta sedan enligt punkt 2.
   - **Förbehåll:** gäller först när ett webbhotell är valt.
2. **Ångra ändringen via main** (det normala sättet, följer regeln om pull request från `main`):
   ```bash
   git checkout -b rollback-v3.1.0 origin/main
   git revert -m 1 <merge-commit för PR:en som orsakade felet>
   git push -u origin rollback-v3.1.0
   ```
   - Öppna en pull request till `main` och slå ihop den.
   - Gör sedan en ny release från `main` till `production`, med nästa rättningsnummer, till exempel `v3.1.1`.
3. **Nödläge:** återställ `production` till en tidigare tagg direkt.
   - **Krav:** bryter mot regeln om pull request från `main`. Görs bara av en administratör, när punkt 1 inte finns och felet är allvarligt.
   - **Hur:**
     ```bash
     git checkout -b nodlage origin/production
     git revert -m 1 <merge-commit för releasen>
     git push origin nodlage
     ```
     Öppna en pull request `nodlage` → `production`. Kontrollen "Release kommer från main" underkänner den, så en administratör slår ihop med undantag.
   - **Efteråt:** gör samma revert på `main` (punkt 2), så att grenarna inte glider isär.

Taggarna ändras eller flyttas aldrig. En rollback ger en ny version.

## GitHub Pages (stängs av när Cloudflare Pages är uppsatt)

GitHub Pages är påslaget för repot sedan 28 oktober 2026. Vid varje push till `main` kör GitHub sitt eget jobb **pages-build-deployment** (det syns som kontrollerna `build`, `deploy` och `report-build-status`) och publicerar **hela repot** från `main`, troligen på daskrokodil.github.io/historia-globen.

Det betyder att:
- även interna filer som `CLAUDE.md`, `docs/`, `tools/` och `data/utkast/` publiceras där, eftersom GitHub Pages inte använder `scripts/build-site.sh`. Repot är öppet, så inget hemligt läcker, men det är inte den publicering som beskrivs här;
- det finns en tredje adress bredvid dev och production, som visar `main` utan Cloudflare Access.

**När Cloudflare Pages publicerar dev och production:** stäng av GitHub Pages under Settings → Pages → Build and deployment → Source → **None** (eller "Unpublish site"). Kontrollera efteråt att `pages-build-deployment` inte körs vid nästa push till `main`. Fram till dess kan GitHub Pages vara kvar, så att det finns en fungerande adress att visa.

## Öppna frågor

- **Webbhotell och publicering** är inte valda. Det kan till exempel bli Cloudflare Pages, som publicerar `dist/` från `main` och `production`. Ett publiceringsjobb läggs till i workflowen när valet är gjort.
- **Cloudflare Access** för dev.historiagloben.se ställs in i Cloudflare, inte i repot.
- **Externa resurser:** jsDelivr och Google Fonts måste vara tillåtna om en Content-Security-Policy införs.
