# Publicering: development och production

Historia-globen ska publiceras i två miljöer. Det här dokumentet beskriver grenarna, vad som publiceras, kontrollerna och hur en release och en rollback går till.

> **Läget i dag (2026-10-30):** grenen `production` finns (skapad från `main` på commit `e2774dd`), och båda grenarna är skyddade med rulesets (se [Inställningar i GitHub](#inställningar-i-github)). Webbplatsen publiceras med Cloudflare Pages: historiagloben.se visar `production`, och `main` är den enda grenen som får förhandsversioner (se [Cloudflare Pages](#cloudflare-pages)). **GitHub Pages publicerar fortfarande `main`** och behöver stängas av (se [GitHub Pages](#github-pages-stängs-av)).

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
| `js/**/*.js` (17 moduler) | ES-modulerna | `index.html` → `js/main.js` → `import` |
| `img/favicon.svg`, `img/favicon-32.png`, `img/apple-touch-icon.png` | sidans ikoner | `index.html` |
| `img/icons/*.svg` | markörernas och korten symboler, hämtas med `fetch` efter namn | `icon` i `data/events.json`, `symbol` i `data/religions.json` (#271), `CAT_ICON` och standardikonen `star` i `js/ui/funfact.js`, `index.html` |
| `data/events.json`, `funfacts.json`, `sources.json`, `land.json`, `borders.json`, `styles.json`, `empires/index.json` | laddas vid start | `loadAll()` i `js/model.js` |
| `data/religions.json`, `data/religions-polities.json` | laddas när religionslagret slås på eller vid klick | `loadReligions()`, `loadReligionPolities()` i `js/model.js` |
| `data/empires/<rike>.json` | laddas när riket behövs | fältet `file` i `data/empires/index.json` |
| `images/events/*.webp` | händelsernas bilder | `image.file` i `data/events.json` |
| `LICENSE`, `data/LICENSE` | licenserna för kod (GPL-3.0) och data (CC BY 4.0) | Inte läst av sidan; följer med eftersom licenserna gäller de publicerade filerna. |

Alla ikoner i `img/icons/` publiceras, eftersom namnen kommer ur data och JS. I dag används alla 38. Bilderna i `images/events/` publiceras bara om en händelse pekar på dem.

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

## Cloudflare Pages

Läget enligt Rikard 2026-10-30. Inställningarna görs i Cloudflares kontrollpanel, inte i repot, och har inte kunnat kontrolleras härifrån.

| Inställning | Värde |
|---|---|
| Projekt | `historia-globen` |
| Produktionsgren | `production` |
| Egen domän för produktionen | historiagloben.se, kopplad och aktiv med SSL |
| Förhandsversioner (preview) | bara grenen `main` |
| Andra grenar | automatiska förhandsversioner avstängda för framtida pushar |

- En sammanslagning till `production` publicerar historiagloben.se. En sammanslagning till `main` ger en ny förhandsversion av `main`.
- Arbetsgrenar (`claude/...` m.fl.) får inga egna förhandsversioner längre. Förhandsversioner som redan har skapats ligger kvar i Cloudflare tills de tas bort där.
- Rekommenderat byggkommando är `bash scripts/build-site.sh` och utdatakatalog `dist` (se [Bygga och kontrollera lokalt](#bygga-och-kontrollera-lokalt)). Vilka värden projektet faktiskt har står inte i repot.
- Ännu inte dokumenterat: om dev.historiagloben.se är kopplad till förhandsversionen av `main`, och om Cloudflare Access skyddar den (se [Öppna frågor](#öppna-frågor)).

**Det som går att se från GitHub** (Cloudflares egen kontroll "Cloudflare Pages" på varje commit, kontrollerat 2026-10-30):
- `production` (`e2774dd`) byggdes som produktion: kontrollen har bara en unik adress (`cccd8713.historia-globen.pages.dev`) och ingen grenadress.
- `main` byggs som förhandsversion: varje bygge får en unik adress (till exempel `3102776a.historia-globen.pages.dev`) och grenadressen **main.historia-globen.pages.dev**. En sammanslagning till `main` ändrar alltså inte produktionen.
- Arbetsgrenar får ingen Cloudflare-kontroll längre (till exempel #285 och #286), så automatiska förhandsversioner för andra grenar är avstängda. En gren som byggdes innan dess (#282, 12:15) fick ett misslyckat bygge.

**Förhandsadresserna på pages.dev är inte skyddade av sig själva.** Cloudflare Access på dev.historiagloben.se skyddar bara den domänen. Grenadressen `main.historia-globen.pages.dev` och de unika adresserna `<id>.historia-globen.pages.dev` når man också direkt, om inte Access är påslaget för projektets förhandsversioner (Workers & Pages → historia-globen → Settings → General → Access policy, "Enable access policy", som skapar en Access-applikation för `*.historia-globen.pages.dev`). Om det är påslaget går inte att se härifrån.

## Automatiska kontroller (GitHub Actions)

`.github/workflows/validate-site.yml` kör bygget och valideringen:
- vid varje **push till `main`**
- vid varje **pull request mot `main`**
- vid varje **pull request mot `production`**

Bara pull requests mot `production` får dessutom kontrollen **"Release kommer från main"**. Den underkänner pull requesten om
- den inte kommer från grenen `main` i samma repo, eller
- `production` har commits som saknas i `main`, till exempel efter ett nödläge (se [Rollback](#rollback-till-en-tidigare-release)). Kontrollen skriver också ut vilka ändringar som släpps.

`.github/workflows/release.yml`, **Skapa release**, körs för hand från grenen `production` (Actions → Skapa release → Run workflow, "Use workflow from: production", versionsnummer `vX.Y.Z`). Den bygger och validerar `production`, kontrollerar att numret har rätt form och inte redan finns, och skapar sedan taggen och en GitHub Release med automatiska anteckningar. Den ändrar inget innehåll i `production` och publicerar inget; publiceringen har redan skett när release-PR:en slogs ihop.

Mallen `.github/PULL_REQUEST_TEMPLATE/release.md` är releasechecklistan. Den används när release-PR:en öppnas med `?template=release.md` (se nedan).

Workflowen underkänns om något steg misslyckas.

### Inställningar i GitHub

Det här går inte att lägga i repot. Rikard gjorde det under Settings → Rules den 30 oktober 2026, med två rulesets:

| Ruleset | Gäller | Regler | Får gå förbi |
|---|---|---|---|
| `main` | standardgrenen (`main`) | ingen radering, ingen force-push, pull request krävs (0 godkännanden), **"Bygg och validera dist/"** måste vara grön | ingen |
| `production` | `refs/heads/production` | ingen radering, ingen force-push, pull request krävs (0 godkännanden, bara merge commit), **"Bygg och validera dist/"** och **"Release kommer från main"** måste vara gröna | Repository admin (alltid), för nödläget i [Rollback](#rollback-till-en-tidigare-release) |

Godkännanden är satta till 0 eftersom projektet har en ägare, och GitHub låter ingen godkänna sin egen pull request. "Release kommer från main" går bara att lägga till som krävd kontroll när den har körts en gång mot `production`; det gjordes med pull request #277.

## Release: från main till production

1. Kontrollera att `main` är grön i Actions och att förhandsversionen (dev.historiagloben.se) ser rätt ut i dator och mobil.
2. Välj versionsnummer (se nedan).
3. Öppna release-PR:en med checklistan:
   `https://github.com/DasKrokodil/historia-globen/compare/production...main?expand=1&template=release.md`
   Sätt rubriken till `Release vX.Y.Z` och fyll i "Nytt sedan förra releasen".
4. Vänta tills **"Bygg och validera dist/"** och **"Release kommer från main"** är gröna, och bocka av checklistan.
5. Slå ihop med **Create a merge commit** (det enda sättet som är tillåtet mot `production`). Då bygger Cloudflare Pages `production` och publicerar historiagloben.se, oftast inom någon minut.
6. Kontrollera i Cloudflare → Deployments att produktionsbygget blev klart, och öppna historiagloben.se.
7. Kör Actions → **Skapa release** från grenen `production` med versionsnumret. Det skapar taggen `vX.Y.Z` och en GitHub Release.

Inget annat än en sammanslagen release-PR uppdaterar historiagloben.se: `production` går inte att pusha till direkt, och sammanslagningar till `main` bygger bara förhandsversionen.

### Versionsnummer vX.Y.Z

Taggarna skrivs `vX.Y.Z` med gemener och tre tal (semantisk versionering):
- **X (huvudversion):** versionen i versionsplanen, till exempel `v3.0.0` när version 3 (Krig och slag) släpps.
- **Y (delversion):** nytt innehåll eller nya funktioner inom samma version, till exempel fler krig: `v3.1.0`.
- **Z (rättning):** bara rättningar, till exempel ett faktafel eller en bugg: `v3.1.1`.

Tidigare releaser har taggarna `V2` och `V2.1`. De ligger kvar som de är. Från och med första releasen till `production` används `vX.Y.Z`. Vilket nummer den första får (till exempel `v3.0.0`) bestämmer Rikard.

## Rollback till en tidigare release

Visar historiagloben.se något trasigt finns tre sätt att gå tillbaka, i den här ordningen:

1. **Rulla tillbaka i Cloudflare Pages.**
   - **När:** det snabbaste sättet, eftersom Cloudflare Pages sparar tidigare publiceringar.
   - **Hur:** välj publiceringen från den förra taggen.
   - **Efteråt:** ändrar ingen kod, så rätta sedan enligt punkt 2.
   - **Var:** Cloudflare → Workers & Pages → `historia-globen` → Deployments, välj en tidigare produktionspublicering och "Rollback to this deployment".
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
   - **Efteråt:** för in nödrättningen i `main` genom att öppna en pull request **`production` → `main`** och slå ihop den med en merge commit. Annars stoppar kontrollen "Release kommer från main" nästa release, eftersom `production` då har en commit som saknas i `main`.

Taggarna ändras eller flyttas aldrig. En rollback ger en ny version.

## GitHub Pages (stängs av)

GitHub Pages har varit påslaget för repot sedan 28 oktober 2026. **Det är fortfarande påslaget:** GitHub har gjort en Pages-publicering (miljön `github-pages`) vid varje push till `main`, senast för `3345871` kl. 13:03 den 30 oktober 2026, med kontrollerna `build`, `deploy` och `report-build-status` från jobbet pages-build-deployment.

Det betyder att `main` publiceras **publikt och utan Cloudflare Access**, troligen på daskrokodil.github.io/historia-globen, med hela repot inklusive interna filer. Det kringgår skyddet av dev.historiagloben.se.

**Stäng av:** Settings → Pages → Build and deployment → Source → **None**, eller "Unpublish site" högst upp på sidan. Kontrollera efteråt att nästa push till `main` inte ger någon ny publicering i miljön `github-pages` (fliken Deployments i repot) och att kontrollerna `build`, `deploy` och `report-build-status` inte dyker upp.

## Öppna frågor

- **dev.historiagloben.se och Cloudflare Access:** inte verifierat härifrån om domänen pekar på `main.historia-globen.pages.dev` och om Access skyddar både den och förhandsadresserna på pages.dev. Det ställs in i Cloudflare, inte i repot.
- **DNS:** historiagloben.se och dev.historiagloben.se går inte att slå upp eller nå från arbetsmiljön, så DNS-posterna är inte kontrollerade härifrån.
- **Bygginställningar i Cloudflare:** byggkommando och utdatakatalog står inte i repot; se [Cloudflare Pages](#cloudflare-pages).
- **Externa resurser:** jsDelivr och Google Fonts måste vara tillåtna om en Content-Security-Policy införs.
