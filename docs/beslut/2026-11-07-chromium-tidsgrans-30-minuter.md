# Webbläsartestet i Chromium får 30 minuter i stället för 20

**Datum:** 2026-11-07

## Beslut
Tidsgränsen (`timeout-minutes`) för Chromium-jobbet i `.github/workflows/browser-test.yml` höjs från 20 till 30 minuter. Firefox och WebKit behåller 45. Höjningen är en nödlösning tills webbläsartestet delats i parallella jobb (uppföljning, eget issue).

## Varför
Sviten tar redan cirka 18 minuter på main (mätt 2026-11-07), och varje ny kontroll gör den längre: lektionskontrollen (#795) tar 4–5 minuter i datorbredd, och utskriftskontrollen (#757) gör 13 sidladdningar. Körningarna för #855 och #856 avbröts efter 20 minuter (`cancelled`) utan att någon kontroll hade fallerat, och en omkörning hjälper inte eftersom testet tar för lång tid, inte tillfälligt för lång tid. Dokumentationen (`docs/DEPLOYMENT.md`) sa "6–10 minuter", vilket inte längre stämmer.

## Alternativ som övervägdes
- **Hoppa över webbläsartestet för PR:er som bara rör data och dokument:** avvisades tills vidare. Data kan ge fel i sidan, och en obligatorisk kontroll som hoppas över via sökvägsfilter kan hänga en PR som "pending". Prövas efter att grenskyddet kontrollerats.
- **Köra den tunga delen bara på main och vid release:** avvisades. Ett rött test efter ihopslagning kostar mer än ett test som tar 25 minuter före.
- **Dela sviten i parallella jobb** (till exempel datorbredd och mobilbredd var för sig): görs som uppföljning, eftersom det halverar väntetiden utan att ta bort någon kontroll.

## Berör
`.github/workflows/browser-test.yml`, `docs/DEPLOYMENT.md`. Hör ihop med #617 (den förra höjningen), #339 och #587.
