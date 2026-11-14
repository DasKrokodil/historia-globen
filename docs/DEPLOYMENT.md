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
| `data/land-10m.json` | laddas första gången det skarpa utsnittet vid inzoomning används | `js/globe-detail.js` |
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

Regeln är skarp: webbläsaren blockerar allt som inte står i den och skriver felet i konsolen. Det gäller också skript som Cloudflare lägger in i sidan, till exempel Cloudflare Web Analytics (`static.cloudflareinsights.com`). Den ska vara avstängd i Cloudflares inställningar, eftersom sidan inte har något statistikskript (beslutet ovan, #466). Inställningen finns på domännivå, inte i Pages-projektets Settings: välj domänen `historiagloben.se` → Analytics & Logs → Web Analytics och stäng av eller ta bort sajten. Står den på igen (2026-11-09 föll rökprovet efter release på `static.cloudflareinsights.com/beacon.min.js` i kontrollen "inga fel i konsolen") är det samma ställe. Kontrollera konsolen på development efter varje ändring som lägger till en resurs eller ändrar formuläret, och på produktionen efter varje release. Ett CSP-fel betyder att något blockeras för besökaren. En ny extern källa kräver ett beslut (CLAUDE.md, arkitektur punkt 6) och läggs till i regeln i samma pull request. Turnstile (`challenges.cloudflare.com`) är tillåtet för förslagsformuläret.

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
3. kör ett rökprov ur `tests/webblasare.mjs` mot den skarpa adressen, i datorbredd (`BREDD=dator` och `ENDAST` med listan `ROKPROV` i arbetsflödet: sidan och globen, tidslinje, Samtidigt, Lager, Fokus på rike och krig, Platt vy, Källor och delad länk). Hela sviten tog över 20 minuter och stoppades av tidsgränsen vid v5.0.0, v6.0.0 och v6.1.0; den körs i stället för varje PR. Gränsen är 10 minuter
4. sparar skärmbilderna som artefakten `skarmbilder-produktion` i 14 dagar.

Webbläsartestet väljer den publicerade sidan med `BASE_URL=https://historiagloben.se/`; utan den variabeln fungerar det som förut mot en lokal port. Om cachekontrollen misslyckas trots `_headers` ska Cloudflares **Browser Cache TTL** stå på **Respect Existing Headers**.

### Webbläsartest (#339)

`.github/workflows/browser-test.yml`, **Webbläsartest**, körs vid samma tillfällen som valideringen (push till `main`, pull requests mot `main` och `production`). Vid push till `main` och pull requests mot `main` körs Chromium i **sex parallella jobb**: **"Öppna sidan i Chromium, tung (lektion och utskrift)"**, **"… dator, övrigt"**, **"… dator, länkar och intervall"**, **"… dator, fem språk"**, **"… mobil"** och **"… kombinationsmatris"**. Uppdelningen har utökats från de tre ursprungliga jobben (#864), senast genom omfördelningen i #1184. Jobben och deras urval står i `tests/jobb.json`, och ett första jobb, **"Planera webbläsartestets jobb"**, kör `scripts/kontrolltackning.mjs` som stoppar körningen om någon kontroll skulle ligga i noll eller flera jobb. En release-PR mot `production` kör dessutom **Firefox och WebKit** (#401), ett jobb vardera med hela sviten, så att även Firefox och Safaris webbläsarmotor provas före release. En pull request mot `main` med etiketten **`alla-webbläsare`** kör också alla tre från nästa push (#702), så att en rättning för Firefox eller WebKit kan provas utan en release-PR. Actions saknar grafikkort, och Firefox hittar ingen GL-drivrutin i huvudlöst läge, så Firefox körs med fönster i en virtuell skärm (Xvfb) och ritar WebGL med Mesas mjukvarudrivrutin. Varje jobb:

1. bygger `dist/` med `scripts/build-site.sh`
2. installerar Playwright 1.63.0 (exakt version) och den aktuella webbläsarmotorn i en tillfällig mapp utanför repot, så att repot inte får någon `package.json` och `dist/` inte påverkas
3. startar `python3 -m http.server` i `dist/`
4. kör `tests/webblasare.mjs`, som öppnar sidan i datorbredd (1400 × 900) och mobilbredd (400 × 800). I Chromium-jobben styr `BREDD`, `ENDAST` och `UTAN` (se nedan) vilka kontroller jobbet kör; Firefox och WebKit kör allt

Kontrollerna, i båda bredderna:
- inga fel i konsolen och inga filer som inte går att ladda (bara avbrutna typsnitt från Google Fonts är tillåtna)
- three.js laddas från jsdelivr (version 0.160.0, som på sidan) och globen startar: rutan "Laddar globen…" försvinner
- tidslinjen går att flytta: ett klick på tidslinjen ändrar årtalet
- Lager, Fokus, Platt vy och Källor öppnas; i Fokus följer testet ett rike och går sedan tillbaka
- ett rike och en väg syns: i Platt vy år 1420 slår testet av och på Riken och Resor och handelsvägar och kontrollerar att kartan ändras
- ingen horisontell scroll, före och efter att menyerna har öppnats

Testet väntar på att sidan når ett visst läge (en meny syns, årtalet ändras, kartan står still), inte på fasta tider, så att det inte ska bli rött av en slump. Hela sviten tog cirka 24 minuter i ett jobb (mätt 2026-11-07 och 2026-11-08 på main) och växer med varje ny kontroll, så den delades i tre jobb (#864, [beslut 2026-11-08](beslut/2026-11-08-webblasartestet-tre-jobb-864.md)): mål cirka 15 minuter per jobb, och varje Chromium-jobb avbryts efter 25 minuter. Firefox och WebKit (bara på release-PR:en och med etiketten `alla-webbläsare`) körs i ett jobb vardera och avbryts efter 45. Steget som installerar Playwright avbryts efter 5 (#617). **Mätt i Actions (2026-11-08, pull request #920, [körning 679](https://github.com/DasKrokodil/historia-globen/actions/runs/42462140643)):** hela körningen tog 11 min 2 s och blev grön. Tiderna för jobben (hela jobbet, varav själva testet): **tung** 7 min 18 s (6 min 50 s), **dator, övrigt** 10 min 46 s (10 min 14 s), **mobil** 3 min 39 s (3 min 16 s) och planeringsjobbet 14 s. Alla ligger under målet på cirka 15 minuter och långt under gränsen på 25. Före delningen tog allt i ett jobb cirka 24 minuter, så väntetiden på en PR är ungefär hälften. **Ny mätning 2026-11-09 (#1005):** efter ett dygns nya kontroller tog **dator, övrigt** cirka 24 minuter i CI (körning 42609384131; avbröts i avsnittet presentationsläge vid 25-minutersgränsen), och i en annan körning 21 minuter. Det längsta var nio kontroller för länkar, lägen och tidsintervall (112, 95, 86, 82, 77, 73, 66, 46 och 44 sekunder, tillsammans cirka 11 minuter). De ligger nu i ett eget jobb, **dator, länkar och intervall** (`lang` i `tests/jobb.json`), och då gick hela körningen grönt (pull request #1029, körning 2026-11-09, hela jobben): **dator, övrigt** 9 min 39 s, **dator, länkar och intervall** 5 min 6 s, **tung** 9 min 1 s, **mobil** 7 min 41 s och **kombinationsmatris** 8 min 8 s. Det längsta jobbet ligger alltså under målet på cirka 15 minuter. Tiderna i loggen före delningen var längre än tiderna efter den, så sekundsiffrorna ovan summerar inte till jobbets tid. Tidsgränsen på 25 minuter är oförändrad. Det längsta jobbet är **dator, övrigt**; blir det över cirka 15 minuter, flytta kontroller från det till det tunga jobbet i `tests/jobb.json`. Mobiljobbet har gott om utrymme. Med tre jobb samtidigt på fyra kärnor lokalt tog tung 636 s, dator övrigt 900 s och mobil 422 s mot 1 525 s för hela sviten i en körning; CI var alltså inte långsammare än lokalt, och lokala tider ska inte skalas upp.

#### Mätning och omfördelning 2026-11-12 (#1184)

Underlag: [den gröna main-körningen 43156419432](https://github.com/DasKrokodil/historia-globen/actions/runs/43156419432), commit `4389128`. Det var den senaste avslutade gröna main-körningen när mätningen började. Testkoden och den gamla jobbfördelningen är samma som i `55cbc6d`, som ändringen utgår från. Tiderna nedan kommer från Actions jobb- och stegtider, inte från en lokal körning.

| Jobb | Hela jobbet före omfördelning | Själva webbläsartestet |
|---|---:|---:|
| `dator` – övrigt | 17 min 46 s | 17 min 5 s |
| `lang` – länkar och intervall | 4 min 14 s | 3 min 42 s |
| `tung` – lektion och utskrift | 9 min 35 s | 8 min 53 s |
| `sprak` – fem språk | 5 min 6 s | 4 min 32 s |
| `mobil` | 11 min 32 s | 11 min 3 s |
| `matris` – kombinationsmatris | 7 min 2 s | 6 min 22 s |

I [körning 43043088048, försök 1](https://github.com/DasKrokodil/historia-globen/actions/runs/43043088048/attempts/1) avbröts `dator` däremot vid 25-minutersgränsen: loggen slutar med `The operation was canceled.` efter reducerad rörelse, precis när presentationsläget skulle börja. Ingen `FEL`-kontroll finns före avbrottet. Försök 2 blev senare grönt; det ändrar inte att det första försöket saknade bevis för presentationsläget.

Sex kontroller flyttas därför från `dator` till `lang`. De startar egna testsidor och avslutar dem i `finally`; kontroller som bygger vidare på den gemensamma sidans tillstånd stannar kvar i sin ordning. Kontrollnamn, testkod, testkrav och mobilens urval ändras inte.

| Flyttad kontroll | Tid i den gröna körningen |
|---|---:|
| Skärmläsare: intervallformuläret och platsfältet på fem språk (#977) | 97,0 s |
| Visste du?: mål och Tillbaka på fem språk (#997) | 64,2 s |
| Tema: växling, tomlägen och mobil (#1113) | 46,8 s |
| Delad länk återskapar år och fokus | 30,6 s |
| Kort kameradress stannar på begärd plats | 24,3 s |
| Bild som inte laddas ersätts i faktarutan (#884) | 20,9 s |
| **Summa** | **283,8 s** |

Om samma kontrolltider används ger omfördelningen **cirka 12 min 21 s** testtid i `dator` och **8 min 26 s** i `lang`, före respektive jobbs övriga steg. Detta är beräknade riktvärden, inte uppmätta eftertider: belastning och uppvärmning kan ändra tiderna när grupperna körs på andra runners. Kontrollera den nya PR-körningens faktiska tider och att presentationsläget når sitt slut. Målet är fortsatt cirka 15 minuter per jobb; gränsen är fortfarande **25 minuter**, och inga nya jobb eller beroenden införs.

`node scripts/kontrolltackning.mjs` verifierar att alla **114 kontrollnamn och 3 avsnitt** ligger i exakt ett jobb per relevant bredd. De tre avsnitten för zoom/omflöde, reducerad rörelse och presentationsläge stannar i `dator`. Inga kontroller hoppas över för att spara tid.

**Urvalet i jobben** (`tests/webblasare.mjs`, `tests/urval.mjs`): `ENDAST=<text>` kör bara kontroller vars namn innehåller texten (#587), `UTAN=<text>` kör allt utom dem, och `BREDD=dator|mobil` kör bara den bredden; flera alternativ skiljs med `|`. Anges både `ENDAST` och `UTAN` körs det som matchar `ENDAST` men inte `UTAN`. `sidan svarar`, `globen laddas` och `inga fel i konsolen` körs i alla jobb, och avsnitten zoom och omflödning, reducerad rörelse och presentationsläge ligger i datorjobbet. **Lokalt** ger körningen utan variabler hela sviten som förut. **Kontrolltäckningen** kan prövas utan webbläsare: `node scripts/kontrolltackning.mjs` visar hur många kontroller varje jobb kör och avslutas med fel om en kontroll ligger i noll eller flera jobb. Lägger du till en kontroll behöver du inte ändra något: den hamnar i datorjobbet eller mobiljobbet efter namnet, och den tunga gruppen väljs med ord i namnet (`lektion`, `skriver ut`, `ryms på en A4`; se `tests/jobb.json`).

Apt-paketen som Playwright installerar med `--with-deps` (mest typsnitt) sparas i en egen cache (`apt-debs-…`) och läggs tillbaka i apt:s arkiv före installationen, så att de inte laddas ner från Ubuntus spegel varje gång (#684). Cachen fylls stegvis: varje körning sparar de paket den hann hämta, även när installationen stoppades av tidsgränsen, så en långsam spegel kan ge några röda körningar i följd efter en ny Playwright- eller Ubuntu-version, men varje omkörning kommer längre tills alla paket finns i cachen.

#### Avbruten eller röd: tre olika fall (#617)

En körning som inte blir grön kan ha tre helt olika orsaker. Titta på statusen och på hur länge körningen höll på innan du ändrar något:

| Fall | Så ser det ut | Vad du gör |
| --- | --- | --- |
| **En nyare push till samma gren** | `cancelled` efter 0–10 minuter, och en nyare körning finns för samma gren (`concurrency: cancel-in-progress`) | Inget. Det är avsikten; titta på den nyaste körningen. |
| **Tidsgränsen** | `cancelled` efter cirka 25 minuter för ett Chromium-jobb (45 för Firefox och WebKit), eller steget "Installera Playwright …" stoppat efter cirka 5 minuter | Ingen kontroll har fallerat. Har installationen stoppats (oftast `apt` som hämtar typsnittspaket långsamt, vilket numera bara kan hända när apt-cachen saknas, #684): **kör om körningen en gång** ("Re-run jobs"). Stoppas den igen, eller tar själva testet mer än 25 minuter i ett jobb, är det ett eget fel som ska bli ett issue. |
| **Ett riktigt fel** | `failure`, och loggen visar `FEL` vid en kontroll | Följ regeln om röd kontroll i [AGENTS.md](../AGENTS.md#röd-kontroll-eller-slut-på-tid-samma-regel-för-alla-agenter-beslut-2026-11-05-skärpt-samma-dag): hitta den första felande kontrollen. |

Blir ett av de sex jobben för långsamt igen: flytta kontroller mellan jobben i `tests/jobb.json` (ändra `endast` och `utan`) och kör `node scripts/kontrolltackning.mjs`. Har ett jobb en röd kontroll kör du bara det jobbet lokalt, till exempel `BREDD=mobil node tests/webblasare.mjs 8000`.

**Skärmbilderna** sparas i 14 dagar som `skarmbilder-chromium-tung`, `skarmbilder-chromium-dator`, `skarmbilder-chromium-lang`, `skarmbilder-chromium-sprak`, `skarmbilder-chromium-mobil` och `skarmbilder-chromium-matris`, samt `skarmbilder-firefox-allt` och `skarmbilder-webkit-allt` när de motorerna körs: öppna körningen under Actions (eller "Details" vid kontrollen i pull requesten) och ladda ner artefakten längst ned på sidan. Bilderna heter `dator-…` och `mobil-…`, i den ordning testet tar dem; en kontroll som misslyckas ger en bild som börjar på `dator-FEL-` eller `mobil-FEL-`. Loggen visar varje kontroll som `OK` eller `FEL` med ett kort mått (till exempel hur många pixlar som ändras när rikena slås på).

Mallen `.github/PULL_REQUEST_TEMPLATE/release.md` är releasechecklistan. Den används när release-PR:en öppnas med `?template=release.md` (se nedan).

Workflowen underkänns om något steg misslyckas.

#### Firefox och WebKit i testet (#888)

Firefox och WebKit går inte att ladda ner i molnmiljön där agenterna arbetar, så de provas bara i CI: sätt etiketten **`alla-webbläsare`** på en pull request mot `main` (gäller från nästa push) eller kör en release-PR. Lokalt kör du Chromium. Körningen 2026-11-08 (PR #923) gick från sju fel i Firefox och sex i WebKit till grönt i alla tre motorerna; varje fel hade en egen orsak, och ingen kontroll är avstängd eller överhoppad:

| Motor | Första felet | Orsak | Rättning |
|---|---|---|---|
| Firefox | `inga fel i konsolen`, texten `JSHandle@object` | `console.error(err)` ger ett handtag som text, och handtaget går inte att läsa efter att sidan navigerat | `Error`-argument görs om till text i sidan (`addInitScript` i `tests/webblasare.mjs`) |
| Firefox | samma, efter läsbar text: `NetworkError when attempting to fetch resource.` och `AbortError: The operation was aborted.` | en hämtning som avbröts av omladdning eller navigering; konsolfelen kom under språkbytets omladdning (markerade `[under: …]`) | `ABORTED_FETCH` räknas bort, bara de exakta meddelandena och bara medan sidan navigerar |
| Firefox | A4-kontrollen: "webbtypsnitten laddades inte" | `document.fonts` skriver familjenamnet med citattecken i Firefox | jämförelsen tar bort citattecken |
| Firefox | A4-kontrollen: det tyska lärarbladet i reservtypsnitt 1040 px mot A4:s 1039 px | ett riktigt mått (1037 px i Chromium, alltså 1 px marginal) | lärarbladets listor 2,5 pt i stället för 4 pt ([beslut](beslut/2026-11-08-lararblad-a4-marginal.md), #934) |
| Firefox | fokusraden mot pausraden | fast väntan på 100 ms på `ResizeObserver` | väntan på tillståndet |
| WebKit | turlänk: året 1325 i stället för 1500 | testet läste året direkt efter att laddningsrutan försvunnit, innan adressen ställts in | väntan på året |
| WebKit | A4: "reservmätningen använder fel typsnitt" | WebKit skriver `DejaVu Sans, sans-serif` utan citattecken | jämförelsen tar bort citattecken |
| WebKit | `TypeError: Load failed` och `Fetch API cannot load … due to access control checks` | hämtningar som avbryts av navigering skrivs som konsol- eller sidfel | `ABORTED_FETCH` och `cancelled()`, bara medan sidan navigerar |
| Firefox | #865-kontrollen: `[JavaScript Error: "downloadable font: download failed … status=2152398850 source: https://fonts.gstatic.com/…"]` (Instrument Sans 600, IM Fell kursiv) | turkortets typsnitt hämtas först när kortet visas, och nästa `goto` avbryter dem; Firefox skriver det som konsolfel utan adress, så `isFont(url)` räknar inte bort det (2152398850 är `NS_BINDING_ABORTED`) | `ABORTED_FONT`: exakt det meddelandet, bara från Googles typsnittsvärdar och bara medan sidan navigerar (#959); en annan status fäller kontrollen som förut |
| WebKit (mobil) | tur och lektion startade inte medan ett fokus laddades | laddningsrutan döljs före `address.start()` (`js/main.js`), och `popstate` registreras först efter `await apply(s)`: testet satte hashen innan lyssnaren fanns | `addressReady()` väntade på att adressen var redo. Appfönstret rättades i #893 (`popstate` lyssnas på före startens `apply()`), och #953 tog bort `addressReady()`: kontrollerna sätter nu hashen direkt efter laddningsrutan, som en besökare kan |
| WebKit | release-PR:en för v6.3.0 (#1391, körning 43395097932): `… /data/genererat/handelser-1500-1799.json due to access control checks` och samma för `img/icons/sulde.svg` i #994/#995, #1134 och #884 | kontrollerna laddar om sin egen sida, och WebKit skriver hämtningar som avbryts av sidbytet som sidfel; 31 av 39 ställen saknade filter och sex filtrerade för brett med `cancelled()` | `abortWatch()` (#1393, [beslut](beslut/2026-11-13-webkit-avbrutna-hamtningar-och-releasekrav.md)): ett sidfel räknas bort bara om det kom under sidans eget `goto` eller `reload`, har WebKits exakta text, gäller den egna webbplatsen och också syns som en avbruten begäran. Antalet bortfiltrerade fel står i kontrollens OK-rad. Steg 1 gäller de kontroller som föll och de som filtrerade brett; övriga kontroller följer i ett steg 2 |

**Att tänka på när en kontroll är röd i bara en motor:** läs först texten (konsolfel görs läsbara i testet, och en väntan som tar slut visar adress, kortets tillstånd och konsolfelen), och sök efter en motorskillnad i hur något *skrivs* (typsnittsnamn, felmeddelanden) innan du misstänker appen. Räkna bara bort de exakta meddelandena för avbruten hämtning, och bara medan testet navigerar; ett annat konsolfel ska fortfarande fälla kontrollen. Det enda riktiga appfyndet i den här omgången, ett litet fönster vid start där en vybyte kunde gå förlorad, är rättat i #893, och testet döljer det inte längre (#953 tog bort `addressReady()`).

**Firefox och fokus efter Stäng (#1436, 2026-11-14), orsaken bekräftad:** kontrollen "stängregistret: dialog pausar uppspelningen, Escape stänger årshoppet och fokus följer faktarutan (#1323)" föll i Firefox med att fokus låg på ett element utan id och utan `data-id`. Spåret från en Firefox-körning på CI (körning 43575814402) visade att Firefox behöll det dolda Stäng-elementet (`button.detail-close`) som `document.activeElement` i 1,7 s, tills sidans `requestAnimationFrame` flyttade fokus till radens knapp (`focusout: body` och `focusin: button.event-btn` med en millisekund emellan). Kontrollens väntan (`activeElement !== body`) läste det mellanläget. Felet låg alltså i kontrollen och inte i sidan. Kontrollen väntar nu på det element fokus ska hamna på (raden eller `btn-panel`, upp till 15 s), och påståendet är detsamma som förut. Kommer fokus aldrig dit faller kontrollen som förut, och det tidsatta spåret skrivs fortfarande ut.

### Inställningar i GitHub

Det här går inte att lägga i repot. Rikard gjorde det under Settings → Rules den 30 oktober 2026, med två rulesets:

| Ruleset | Gäller | Regler | Får gå förbi |
|---|---|---|---|
| `main` | standardgrenen (`main`) | ingen radering, ingen force-push, pull request krävs (0 godkännanden), **"Bygg och validera dist/"** måste vara grön | ingen |
| `production` | `refs/heads/production` | ingen radering, ingen force-push, pull request krävs (0 godkännanden, bara merge commit), **"Bygg och validera dist/"** och **"Release kommer från main"** måste vara gröna | Repository admin (alltid), för nödläget i [Rollback](#rollback-till-en-tidigare-release) |

Godkännanden är satta till 0 eftersom projektet har en ägare, och GitHub låter ingen godkänna sin egen pull request. "Release kommer från main" går bara att lägga till som krävd kontroll när den har körts en gång mot `production`; det gjordes med pull request #277.

**Webbläsartestet (#339) är ännu inte en krävd kontroll.** Sedan #864 heter jobben "Öppna sidan i Chromium, …" (tre stycken); namnet ändrades då. När jobben har körts grönt några gånger kan Rikard lägga till dem bland de krävda kontrollerna i båda rulesets (Settings → Rules → regeln "Require status checks to pass"). Tills dess visas det i varje pull request men stoppar inte sammanslagningen.

## Release: från main till production

1. Kontrollera att `main` är grön i Actions och att förhandsversionen (dev.historiagloben.se) ser rätt ut i dator och mobil.
2. Välj versionsnummer (se nedan).
   Innehåller releasen nya eller omgjorda översättningar: låt Codex göra den större språkgranskningen med en starkare modell och skriv rapporten i release-PR:en (beslut 2026-11-07, [oversattningsgranskning-vid-release](beslut/2026-11-07-oversattningsgranskning-vid-release.md)).
3. Öppna release-PR:en med checklistan:
   `https://github.com/DasKrokodil/historia-globen/compare/production...main?expand=1&template=release.md`
   Sätt rubriken till `Release vX.Y.Z` och fyll i "Nytt sedan förra releasen".
4. Vänta tills **"Bygg och validera dist/"** och **"Release kommer från main"** är gröna, och bocka av checklistan.
   **Webbläsartestet (#1393, [beslut](beslut/2026-11-13-webkit-avbrutna-hamtningar-och-releasekrav.md)):** Chromium måste vara grönt. Firefox och WebKit är också krav, men DasKrokodil får godta ett rött jobb när det finns ett issue med felraden och det är visat att felet sitter i testet. `continue-on-error` används inte.
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
