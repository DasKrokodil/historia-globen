<!-- Releasemall (docs/DEPLOYMENT.md). Öppnas med base: production, compare: main och ?template=release.md. -->
## Release vX.Y.Z

**Från:** `main` · **Till:** `production` · **Publiceras på:** historiagloben.se när PR:en slås ihop

### Nytt sedan förra releasen
<!-- De sammanslagna pull requesterna och issuena. GitHub listar commits under fliken Commits. -->
-

### Checklista före sammanslagning
- [ ] `main` är grön i Actions (senaste push-körningen av "Validera webbplatsen").
- [ ] Förhandsversionen av `main` (dev.historiagloben.se) är kontrollerad i dator och mobil: globen snurrar, tidslinjen går att dra, uppspelning, Samtidigt, Platt vy och Källor fungerar, inga synliga fel.
- [ ] Inga utkast (`review: draft`) eller platshållarbilder som inte ska ut.
- [ ] Kontrollerna "Bygg och validera dist/" och "Release kommer från main" är gröna på den här PR:en.
- [ ] Versionsnumret är valt (vX.Y.Z, se docs/DEPLOYMENT.md) och skrivet i rubriken.

### Efter sammanslagning
- [ ] Slå ihop med **Create a merge commit** (det enda tillåtna sättet mot production).
- [ ] Kontrollera i Cloudflare → Workers & Pages → historia-globen → Deployments att produktionsbygget av production blev klart, och öppna historiagloben.se.
- [ ] Kör Actions → **Skapa release** från grenen `production` med versionsnumret. Det skapar taggen och GitHub Release.
