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
| `robots.txt`, `sitemap.xml` | indexeringsregler och sitemap för startsidan | sökmotorer; `index.html` hänvisar inte till dem |
| `css/style.css` | stilmallen (inga `url()` till lokala filer) | `index.html` |
| `_headers` | Cloudflare Pages cache-regler: `Cache-Control: no-cache` för sidan, `js/`, `css/` och `data/`, så att webbläsaren alltid kontrollerar om en fil har ändrats. Utan den kunde en ny `index.html` blandas med gamla JS-moduler efter release v4.1.0 ("Globen kunde inte starta"). Har zonen i Cloudflare en egen Browser Cache TTL ska den stå på "Respect Existing Headers". | Cloudflare Pages läser den ur `dist/` |
| `js/**/*.js` (20 moduler) | ES-modulerna | `index.html` → `js/main.js` → `import` |
| `img/favicon.svg`, `img/favicon-32.png`, `img/apple-touch-icon.png` | sidans ikoner | `index.html` |
| `img/icons/*.svg` | markörernas och korten symboler, hämtas med `fetch` efter namn | `icon` i `data/events.json`, `symbol` i `data/religions.json` (#271), `CAT_ICON` och standardikonen `star` i `js/ui/funfact.js`, `index.html` |
| `data/events.json`, `funfacts.json`, `sources.json`, `land.json`, `borders.json`, `styles.json`, `empires/index.json` | laddas vid start | `loadAll()` i `js/model.js` |
| `data/licenses.json` | maskinläsbar sammanställning av källregistrets licensuppgifter | `tools/license_manifests.py`, genererad från `data/sources.json` (#393) |
| `data/version.json` | aktuell versionsetikett, releasedatum och länk till releaserna | versionsraden i Om källorna (#552) |
| `data/religions.json`, `data/religions-polities.json` | laddas när religionslagret slås på eller vid klick | `loadReligions()`, `loadReligionPolities()` i `js/model.js` |
| `data/empires/<rike>.json` | laddas när riket behövs | fältet `file` i `data/empires/index.json` |
| `images/events/*.webp` | händelsernas bilder | `image.file` i `data/events.json` |
| `images/licenses.json` | licens, kredit och eventuell källpost för händelsebilder | `tools/license_manifests.py`, genererad från `data/events.json` och `data/sources.json` (#393) |
| `LICENSE`, `data/LICENSE` | licenserna för kod (GPL-3.0) och data (CC BY 4.0) | Inte läst av sidan; följer med eftersom licenserna gäller de publicerade filerna. |

Alla ikoner i `img/icons/` publiceras, eftersom namnen kommer ur data och JS. I dag används alla 38. Bilderna i `images/events/` publiceras bara om en händelse pekar på dem.

**Publiceras aldrig via `dist/`:** `.claude/`, `.orchestra/`, `.github/`, `docs/`, `tools/`, `scripts/`, `functions/`, `tests/`, `data/utkast/`, `images/incoming/`, `CLAUDE.md`, `README.md`, Python- och skalskript, Markdown-filer och cachefiler. (`functions/` publiceras i stället av Cloudflare Pages direkt från repots rot, se [Besökarnas förslag](#besökarnas-förslag-pages-function).)

**Externa resurser** som sidan hämtar vid körning och som inte finns i `dist/`:
- three.js 0.160.0 från `cdn.jsdelivr.net` (`js/globe.js`)
- typsnitten från Google Fonts, `fonts.googleapis.com` och `fonts.gstatic.com` (`index.html`)

De måste vara nåbara från båda miljöerna. De står därför i Content-Security-Policy i `_headers`, och de måste också tillåtas om en Cloudflare-regel läggs till.

### Säkerhetsheaders

`_headers` skickar en skarp **Content-Security-Policy** för alla sidor (#707, [beslut 2026-11-06](beslut/2026-11-06-ingen-tredjepartsstatistik-skarp-csp.md); Report-Only från #392 till v5.0.0). Den begränsar resurser till den egna webbplatsen, jsDelivr (three.js), Google Fonts och Cloudflare Turnstile när förslagsformuläret används. `frame-ancestors 'none'` hindrar att sidan bäddas in i andra webbplatser, och `Permissions-Policy` stänger av kamera, mikrofon, plats och betalningar som sidan inte använder.

Regeln är skarp: webbläsaren blockerar allt som inte står i den och skriver felet i konsolen. Det gäller också skript som Cloudflare lägger in i sidan, till exempel Cloudflare Web Analytics (`static.cloudflareinsights.com`). Den ska vara avstängd i Cloudflares inställningar, eftersom sidan inte har något statistikskript (beslutet ovan, #466). Kontrollera konsolen på development efter varje ändring som lägger till en resurs eller ändrar formuläret, och på produktionen efter varje release. Ett CSP-fel betyder att något blockeras för besökaren. En ny extern källa kräver ett beslut (CLAUDE.md, arkitektur punkt 6) och läggs till i regeln i samma pull request. Turnstile (`challenges.cloudflare.com`) är tillåtet för förslagsformuläret.

## Bygga och kontrollera lokalt

```bash
scripts/build-site.sh
```

Licensmanifesten uppdateras vid behov med `python3 tools/license_manifests.py`. Ändra inte manifestfilerna för hand.

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
  9. Varje rike som ett krig anger i `empires` (#76) finns i `data/empires/index.json`, och bara krig har fältet.
  10. Filerna i `data/genererat/` stämmer med källfilerna.
  11. `data/licenses.json` och `images/licenses.json` stämmer med källregistret och händelsernas bilduppgifter.
  12. `data/version.json` finns och versionsnumret följer `X.Y.Z` eller `X.Y.Z-dev`.

Provkör den byggda sidan:

```bash
python3 -m http.server 8000 --directory dist
```

`dist/` committas inte (`.gitignore`).

### Webbläsartestet lokalt (#339)

Samma test som GitHub kör (se [Webbläsartest](#webbläsartest-339)) går att köra mot en egen server. Det behöver Node 22 och Playwright 1.63.0 med Chromium, installerat utanför repot:

```bash
npm install --prefix /tmp/pw --no-save playwright@1.63.0
/tmp/pw/node_modules/.bin/playwright install chromium
bash scripts/build-site.sh
python3 -m http.server 8000 --directory dist &
NODE_PATH=/tmp/pw/node_modules node tests/webblasare.mjs 8000
```

- Argumentet är porten (standard 8000). Orkesterns arbetare använder sin egen port (8001–8003).
- `SKARMBILDER=<mapp>` väljer var skärmbilderna sparas (standard: en mapp i systemets tillfälliga katalog). Skriptet skriver ut var de hamnade.
- `THREE_LOCAL=<sökväg till three.module.js>` ersätter three.js från jsdelivr med en lokal kopia (`three@0.160.0`) och avbryter Google Fonts. Det behövs i molnmiljön, som inte når jsdelivr. I GitHub används alltid den riktiga adressen.
- Skriptet avslutas med kod 1 om någon kontroll misslyckas, och tar då en skärmbild som börjar på `FEL-`.

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

**Förhandsadresserna på pages.dev är skyddade med Cloudflare Access** (Rikard slog på det 2026-10-30: Workers & Pages → historia-globen → Settings → General → Preview access, "Restrict previews"). Cloudflare visar nu "Preview deployments are restricted by a Cloudflare Access policy". Det gäller grenadressen `main.historia-globen.pages.dev` och de unika adresserna `<id>.historia-globen.pages.dev`. Produktionens pages.dev-adress och de egna domänerna hanteras separat i Zero Trust, så historiagloben.se förblir publik. Vem som får logga in ställs in under Manage (Zero Trust).

### Besökarnas förslag (Pages Function)

Formulärets serverfunktion `functions/api/feedback.js` (beslut 2026-10-30, [feedback.md](feedback.md)) publiceras av Cloudflare Pages **från mappen `functions/` i repots rot**, inte via `dist/`. Cloudflare letar efter `functions/` i projektets rotkatalog (Root directory i bygginställningarna, som ska vara repots rot) och packar ihop funktionen och de filer i `js/` som den importerar. `scripts/build-site.sh` kopierar den inte, och `scripts/validate-site.py` underkänner bygget om `functions/` eller `tests/` hamnar i `dist/`.

- Funktionen svarar bara på `/api/feedback`. Alla andra adresser serveras som förut från `dist/`.
- **Hemligheter och inställningar per miljö** (Settings → Variables and secrets): `GITHUB_TOKEN` och `TURNSTILE_SECRET` som Secret, `GITHUB_REPO` och `FEEDBACK_ENABLED` som Text. Preview (`main`, dev) och Production (`production`, historiagloben.se) har var sin uppsättning, så funktionen kan vara påslagen på dev och avstängd i produktionen. Utan dem svarar funktionen 503 och skapar inget.
- I dag finns inga variabler, så funktionen är avstängd i båda miljöerna. Checklistan för att slå på den står i [feedback.md](feedback.md#slå-på-formuläret-checklista).
- Riktiga hemligheter läggs aldrig i repot.

## Automatiska kontroller (GitHub Actions)

`.github/workflows/validate-site.yml` kör bygget och valideringen:
- vid varje **push till `main`**
- vid varje **pull request mot `main`**
- vid varje **pull request mot `production`**

Jobbet **"Bygg och validera dist/"** kör också testerna för förslagens serverfunktion (`node --test 'tests/*.test.mjs'`, Node 22, inga beroenden).

Jobbet **"Starta formulärets Pages Function som Cloudflare"** (#663) kör `scripts/pages-function-check.sh`. Skriptet startar `functions/api/feedback.js` med `wrangler pages dev dist` (Cloudflares egen körmiljö, workerd) och skickar ett anrop till `/api/feedback`. Utan nycklar ska svaret vara 503 `disabled`; startar funktionen inte är kontrollen röd. Skälet: Cloudflare stoppar **hela** publiceringen om funktionen inte startar, och koden som funktionen importerar (`js/model.js`, `js/i18n.js`) körs annars bara i node och i webbläsaren. Efter #634 misslyckades publiceringen av `main` 21 gånger i rad medan alla andra kontroller var gröna (#662). wrangler installeras i en tillfällig mapp med exakt version, som Playwright, och används bara här. Lokalt: `bash scripts/pages-function-check.sh` (kräver Node och nätet för npm första gången).

Kontrollen **"Cloudflare Pages"** kommer från Cloudflare, inte från Actions. Är den röd på `main` publiceras dev inte, även om allt annat är grönt; titta då på den först.

Bara pull requests mot `production` får dessutom kontrollen **"Release kommer från main"**. Den underkänner pull requesten om
- den inte kommer från grenen `main` i samma repo, eller
- `production` har ändringar som saknas i `main`, till exempel efter ett nödläge (se [Rollback](#rollback-till-en-tidigare-release)). Merge-commitarna som varje release ger i `production` är tillåtna, så länge de bara för in det som finns i `main` (`scripts/production-i-main.sh`). Kontrollen skriver också ut vilka ändringar som släpps.

`.github/workflows/release.yml`, **Skapa release**, körs för hand från grenen `production` (Actions → Skapa release → Run workflow, "Use workflow from: production", versionsnummer `vX.Y.Z`). Den bygger och validerar `production`, kontrollerar att numret har rätt form och inte redan finns, kontrollerar med `scripts/production-i-main.sh` att `production` bara innehåller det som finns i `main`, och skapar sedan taggen och en GitHub Release med automatiska anteckningar. Den ändrar inget innehåll i `production` och publicerar inget; publiceringen har redan skett när release-PR:en slogs ihop.

### Kontroll efter publicering (#400)

`.github/workflows/production-check.yml`, **Kontrollera produktionen**, anropas automatiskt när **Skapa release** är klar och kan även köras för hand under Actions. Jobbet läser bara `https://historiagloben.se` och ändrar ingenting. Det

1. väntar i högst fem minuter på att `js/main.js` på webbplatsen är exakt samma fil som på grenen `production`
2. kontrollerar att HTML, CSS, JavaScript och JSON svarar med `Cache-Control: no-cache`
3. kör samma grundfunktioner i `tests/webblasare.mjs` mot den skarpa adressen, i dator- och mobilbredd
4. sparar skärmbilderna som artefakten `skarmbilder-produktion` i 14 dagar.

Webbläsartestet väljer den publicerade sidan med `BASE_URL=https://historiagloben.se/`; utan den variabeln fungerar det som förut mot en lokal port. Om cachekontrollen misslyckas trots `_headers` ska Cloudflares **Browser Cache TTL** stå på **Respect Existing Headers**.

### Webbläsartest (#339)

`.github/workflows/browser-test.yml`, **Webbläsartest**, körs vid samma tillfällen som valideringen (push till `main`, pull requests mot `main` och `production`). Vid push till `main` och pull requests mot `main` körs bara jobbet **"Öppna sidan i Chromium"**. En release-PR mot `production` kör samma test parallellt i **Chromium, Firefox och WebKit** (#401), så att även Firefox och Safaris webbläsarmotor provas före release. Varje jobb:

1. bygger `dist/` med `scripts/build-site.sh`
2. installerar Playwright 1.63.0 (exakt version) och den aktuella webbläsarmotorn i en tillfällig mapp utanför repot, så att repot inte får någon `package.json` och `dist/` inte påverkas
3. startar `python3 -m http.server` i `dist/`
4. kör `tests/webblasare.mjs`, som öppnar sidan i datorbredd (1400 × 900) och mobilbredd (400 × 800)

Kontrollerna, i båda bredderna:
- inga fel i konsolen och inga filer som inte går att ladda (bara avbrutna typsnitt från Google Fonts är tillåtna)
- three.js laddas från jsdelivr (version 0.160.0, som på sidan) och globen startar: rutan "Laddar globen…" försvinner
- tidslinjen går att flytta: ett klick på tidslinjen ändrar årtalet
- Lager, Fokus, Platt vy och Källor öppnas; i Fokus följer testet ett rike och går sedan tillbaka
- ett rike och en väg syns: i Platt vy år 1420 slår testet av och på Riken och Resor och handelsvägar och kontrollerar att kartan ändras
- ingen horisontell scroll, före och efter att menyerna har öppnats

Testet väntar på att sidan når ett visst läge (en meny syns, årtalet ändras, kartan står still), inte på fasta tider, så att det inte ska bli rött av en slump. Hela sviten tar 6–10 minuter. Jobbet avbryts efter 20 minuter, och steget som installerar Playwright avbryts efter 5 (#617).

Apt-paketen som Playwright installerar med `--with-deps` (mest typsnitt) sparas i en egen cache (`apt-debs-…`) och läggs tillbaka i apt:s arkiv före installationen, så att de inte laddas ner från Ubuntus spegel varje gång (#684). Cachen fylls stegvis: varje körning sparar de paket den hann hämta, även när installationen stoppades av tidsgränsen, så en långsam spegel kan ge några röda körningar i följd efter en ny Playwright- eller Ubuntu-version, men varje omkörning kommer längre tills alla paket finns i cachen.

#### Avbruten eller röd: tre olika fall (#617)

En körning som inte blir grön kan ha tre helt olika orsaker. Titta på statusen och på hur länge körningen höll på innan du ändrar något:

| Fall | Så ser det ut | Vad du gör |
| --- | --- | --- |
| **En nyare push till samma gren** | `cancelled` efter 0–10 minuter, och en nyare körning finns för samma gren (`concurrency: cancel-in-progress`) | Inget. Det är avsikten; titta på den nyaste körningen. |
| **Tidsgränsen** | `cancelled` efter cirka 20 minuter för hela jobbet, eller steget "Installera Playwright …" stoppat efter cirka 5 minuter | Ingen kontroll har fallerat. Har installationen stoppats (oftast `apt` som hämtar typsnittspaket långsamt, vilket numera bara kan hända när apt-cachen saknas, #684): **kör om körningen en gång** ("Re-run jobs"). Stoppas den igen, eller tar själva testet mer än 20 minuter, är det ett eget fel som ska bli ett issue. |
| **Ett riktigt fel** | `failure`, och loggen visar `FEL` vid en kontroll | Följ regeln om röd kontroll i [AGENTS.md](../AGENTS.md#röd-kontroll-eller-slut-på-tid-samma-regel-för-alla-agenter-beslut-2026-11-05-skärpt-samma-dag): hitta den första felande kontrollen. |

Blir sviten för långsam igen kan den delas i två parallella jobb med `ENDAST` (#587); det är inte gjort ännu.

**Skärmbilderna** sparas i 14 dagar som `skarmbilder-chromium`, `skarmbilder-firefox` och `skarmbilder-webkit` (bara Chromium finns i vanliga körningar): öppna körningen under Actions (eller "Details" vid kontrollen i pull requesten) och ladda ner artefakten längst ned på sidan. Bilderna heter `dator-…` och `mobil-…`, i den ordning testet tar dem; en kontroll som misslyckas ger en bild som börjar på `dator-FEL-` eller `mobil-FEL-`. Loggen visar varje kontroll som `OK` eller `FEL` med ett kort mått (till exempel hur många pixlar som ändras när rikena slås på).

Mallen `.github/PULL_REQUEST_TEMPLATE/release.md` är releasechecklistan. Den används när release-PR:en öppnas med `?template=release.md` (se nedan).

Workflowen underkänns om något steg misslyckas.

### Inställningar i GitHub

Det här går inte att lägga i repot. Rikard gjorde det under Settings → Rules den 30 oktober 2026, med två rulesets:

| Ruleset | Gäller | Regler | Får gå förbi |
|---|---|---|---|
| `main` | standardgrenen (`main`) | ingen radering, ingen force-push, pull request krävs (0 godkännanden), **"Bygg och validera dist/"** måste vara grön | ingen |
| `production` | `refs/heads/production` | ingen radering, ingen force-push, pull request krävs (0 godkännanden, bara merge commit), **"Bygg och validera dist/"** och **"Release kommer från main"** måste vara gröna | Repository admin (alltid), för nödläget i [Rollback](#rollback-till-en-tidigare-release) |

Godkännanden är satta till 0 eftersom projektet har en ägare, och GitHub låter ingen godkänna sin egen pull request. "Release kommer från main" går bara att lägga till som krävd kontroll när den har körts en gång mot `production`; det gjordes med pull request #277.

**Webbläsartestet (#339) är ännu inte en krävd kontroll.** När jobbet **"Öppna sidan i Chromium"** har körts grönt några gånger kan Rikard lägga till det bland de krävda kontrollerna i båda rulesets (Settings → Rules → regeln "Require status checks to pass"). Tills dess visas det i varje pull request men stoppar inte sammanslagningen.

## Release: från main till production

1. Kontrollera att `main` är grön i Actions och att förhandsversionen (dev.historiagloben.se) ser rätt ut i dator och mobil.
2. Välj versionsnummer (se nedan).
3. Öppna release-PR:en med checklistan:
   `https://github.com/DasKrokodil/historia-globen/compare/production...main?expand=1&template=release.md`
   Sätt rubriken till `Release vX.Y.Z` och fyll i "Nytt sedan förra releasen".
4. Vänta tills **"Bygg och validera dist/"** och **"Release kommer från main"** är gröna, och bocka av checklistan.
5. Slå ihop med **Create a merge commit** (det enda sättet som är tillåtet mot `production`). Då bygger Cloudflare Pages `production` och publicerar historiagloben.se, oftast inom någon minut.
6. Kontrollera i Cloudflare → Deployments att produktionsbygget blev klart, och öppna historiagloben.se.
7. Kör Actions → **Skapa release** från grenen `production` med versionsnumret. Det skapar taggen `vX.Y.Z` och en GitHub Release och kör därefter **Kontrollera produktionen** automatiskt.

Inget annat än en sammanslagen release-PR uppdaterar historiagloben.se: `production` går inte att pusha till direkt, och sammanslagningar till `main` bygger bara förhandsversionen.

### Versionsnummer vX.Y.Z

`data/version.json` visar versionen i Om källorna. På `main` används en utvecklingsversion med suffixet `-dev` och tomt `released`-datum. När en release förbereds uppdateras filen till `X.Y.Z` och datumet då den publiceras; efteråt får `main` nästa `X.Y.Z-dev`. Release-PR:ens checklista påminner om båda ändringarna.

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

GitHub Pages har varit påslaget för repot sedan 28 oktober 2026. GitHub har gjort en Pages-publicering (miljön `github-pages`) vid varje push till `main`, senast för `3345871` kl. 13:03 den 30 oktober 2026, med kontrollerna `build`, `deploy` och `report-build-status` från jobbet pages-build-deployment. **Rikard avpublicerade sidan 2026-10-30** ("GitHub Pages unpublished"), men källan stod då kvar på *Deploy from a branch → main / (root)*.

Så länge källan är `main` kan `main` publiceras **publikt och utan Cloudflare Access**, troligen på daskrokodil.github.io/historia-globen, med hela repot inklusive interna filer. Det kringgår skyddet av dev.historiagloben.se.

**Stäng av helt:** Settings → Pages → Build and deployment → Branch → välj **None** och tryck Save (utöver "Unpublish site"). Kontrollera efteråt att nästa push till `main` inte ger någon ny publicering i miljön `github-pages` (fliken Deployments i repot) och att kontrollerna `build`, `deploy` och `report-build-status` inte dyker upp.

## Öppna frågor

- **dev.historiagloben.se och Cloudflare Access:** inte verifierat härifrån om domänen pekar på `main.historia-globen.pages.dev` och om Access skyddar den (förhandsadresserna på pages.dev är skyddade). Det ställs in i Cloudflare, inte i repot.
- **DNS:** historiagloben.se och dev.historiagloben.se går inte att slå upp eller nå från arbetsmiljön, så DNS-posterna är inte kontrollerade härifrån.
- **Bygginställningar i Cloudflare:** byggkommando och utdatakatalog står inte i repot; se [Cloudflare Pages](#cloudflare-pages).
- **Externa resurser:** jsDelivr, Google Fonts och Turnstile är tillåtna i den skarpa CSP:n i `_headers` (#707).
