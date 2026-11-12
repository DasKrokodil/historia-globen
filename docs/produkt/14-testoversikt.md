# 14. Testöversikt: vad bevisar kontrollerna, och vad bevisar de inte?

**Status:** utkast 2026-11-08, genomgånget inför v6.1.0 2026-11-09 (en kontroll tillkom för teman, "ett tema väljs i Fokus…", med ett testtema via `route` och prov av att fliken Teman är dold utan teman) (#919, DasKrokodil: "ja enligt rekommendationerna"). Uppdaterat 2026-11-12 efter v6.2.0: sex jobb i Chromium, iPad- och datorbredder på fem språk i toppradens kontroll (#992, #1190), ostabila kontroller i ett samlingsissue (#1174) och mätskriptet för markörer (#1192). Underlaget är arbetsflödena i `.github/workflows/`, `scripts/`, `tests/` och [DEPLOYMENT.md](../DEPLOYMENT.md). Jag har läst konfigurationen och kodens egna kommentarer, men inte kört varje kontroll på nytt; "Bevisar" är det kontrollen är gjord för att visa. En **grön** kontroll är bevis för det den testar, aldrig mer: en grön Chromium bevisar inte Safari, och ingen kontroll bevisar att fakta stämmer.

## Automatiska kontroller (GitHub Actions)

| Kontroll | När den körs | Bevisar | Bevisar **inte** |
|---|---|---|---|
| **Bygg och validera dist/** (`scripts/validate-site.py`, via `build-site.sh`) | Varje pull request och push till `main` | Att byggda filer finns, all JSON går att läsa, importer och datafiler hittas, varje källa och händelse som något pekar på finns, genererade filer stämmer med redigeringsfilerna, JSON Schema och licensmanifest stämmer, inga interna filer publiceras | Att uppgifterna är **sanna**; att sidan fungerar i en webbläsare |
| **Python-testerna** (`tests/validate-schema-test.py`, `dela-data-test.py`, `tackning-test.py`, `oversattning-test.py`) | Samma körning | Att schemakontrollen, uppdelningen av data, täckningsrapporten och översättningsspärren själva fungerar och stoppar avsiktliga fel | Att innehållet är rätt |
| **Översättningsspärren** (`tools/oversattning.py --check`) | Samma körning | Att antalet oöversatta texter inte ökar och att översättningar inte är inaktuella | Att en översättning är **rätt** eller bevarar fakta |
| **Node-testerna** (`node --test 'tests/*.test.mjs'`) | Samma körning | Reglerna i quiz, jakten, tur-formatet, sökningen, adressformatet, tillståndet, språknycklar, urval av datum, världsdelar, affisch, formulärets funktion, etikettkontrollen m.m. | Att det ser rätt ut eller fungerar i en riktig webbläsare |
| **Formulärets Pages Function** (`scripts/pages-function-check.sh`) | Samma körning | Att `functions/api/feedback.js` startar i Cloudflares egen körmiljö | Att Cloudflares inställningar (hemligheter, Turnstile) är rätt i produktionen |
| **Webbläsartest, Chromium** (`tests/webblasare.mjs`, sex parallella jobb enligt `tests/jobb.json`: tung (lektion och utskrift), dator övrigt, dator länkar och intervall, dator fem språk, mobil och kombinationsmatris) | Varje pull request och push | Grundfunktionerna i en riktig webbläsare i dator- (1400 × 900) och mobilbredd (400 × 800): inga konsolfel, globen laddas, tidslinje, Lager, Fokus, Platt vy, Källor, lektion och utskrift m.m. Toppradens kontroll (#992, #1190) mäter också tre iPad-format och 1101–1500 px på fem språk, så att knapparna inte täcker årskortet. Några kontroller provar skärmläsarnamn och tangentbord (#977, #1138, Sök och följ) | Riktiga enheter och Safari, en riktig skärmläsare, prestanda på svag enhet, innehållets riktighet |
| **Kontrolltäckning** (`scripts/kontrolltackning.mjs`) | Samma körning | Att varje webbläsarkontroll ligger i exakt ett jobb, så att ingen faller bort | – |
| **Webbläsartest, Firefox och WebKit** | **Release-PR** mot `production`, eller pull request med etiketten `alla-webbläsare` | Samma kontroller i två motorer till | **WebKit är inte Safari**: ett grönt WebKit-prov är en bra indikation, inte ett bevis för Safari på iPad eller iPhone |
| **Etikettkontroll** | Vid etikettändring | Att regeln "ett issue, en ägare" hålls | – |
| **Orkesterns versionskontroll** | Dagligen | Att installerad orkesterversion jämförs med upstream | – |
| **Kontrollera produktionen** (`production-check.yml`) | Efter release, och för hand | Att publicerad `js/main.js` är densamma som i `production`, att `Cache-Control: no-cache` gäller, och att ett rökprov av grundfunktionerna (datorbredd) fungerar på **historiagloben.se** | Att allt innehåll är rätt; att alla webbläsare fungerar |
| **Cloudflare Pages** (Cloudflares egen kontroll) | Varje commit till `main` och `production` | Att Cloudflare kan bygga och publicera | – |

## Kontroller för hand och med agenter

| Kontroll | Vem och när | Bevisar | Bevisar **inte** |
|---|---|---|---|
| **UX-genomgång** | Claude Code, en gång om dagen när något nytt slagits ihop, och inför varje release | Att flödena fungerar och går att läsa i dator- och mobilbredd, och att inget krockar | Att riktiga användare förstår; är agentens bedömning, alltså en hypotes |
| **Blind-spots-runda** | Codex, enligt behov | Tomma, delvis tomma och blandade lägen, reservlösningar, övergångar | Samma som ovan |
| **Täckningsrunda** (`python3 tools/tackning.py`) | Vid analys | Var det är tomt eller skevt per period, världsdel och kategori | Vad som *borde* finnas (det kräver källor) |
| **Markörer samtidigt** (`node tools/markortak.mjs`) | När nya händelser läggs till i större omgångar (beslut 2026-11-12, #1192) | Hur många markörer som syns samtidigt i vanligt läge, år för år, med händelselagrets regler; avslutas med kod 1 över taket 60 | Hur det upplevs; filter, teman och valda händelser räknas inte |
| **Språkgranskning vid release** | Inför release (beslut 2026-11-07) | Att de granskade översättningarna inte ändrar betydelse | Att *alla* översättningar är kontrollerade; omfattningen står i varje release-PR |
| **Källkontroll av nytt innehåll** | Vid varje innehållsändring | Att uppgifterna stämmer med öppnade källor | – |
| **Release-kontroll** (checklistan i releasemallen) | Före varje release | Att main är grön, dev är kontrollerad och inga utkast följer med | – |

## Vad som saknas (kända luckor)

Det här är luckor i **bevisen**, inte nödvändigtvis fel på sidan:

- **iPad och Safari:** stödmatrisen kräver iPad liggande och stående och Safari (beslut 2026-11-08). iPad-bredderna provas i Chromium för toppradens layout (#992), men inte hela flödet, och WebKit är inte Safari; en riktig iPad är inte provad (krav K-PLA-03).
- **Skärmläsare och full tangentbordssekvens** är inte attesterade (K-TIL-05). Webbläsartestet provar namn, fokus och tangentbord på enskilda ställen (#977, #1138), men ingen riktig skärmläsare.
- **Prestanda på svag enhet** mäts inte (K-PRE-01–02).
- **Riktiga användare:** inga observationer; allt om upplevelsen är hypoteser ([07](07-valideringsplan.md)).
- **Fakta** kan inte provas av test; det bevisas av källkontrollen, och oenighet visas öppet.
- **Röda kontroller:** läs loggen och hitta den **första** felande kontrollen (CLAUDE.md, röd kontroll); följdfel är vanliga. Faller samma kontroll i flera pull requests utan koppling till ändringen samlas uppgifterna i ett issue (beslut 2026-11-11); för ostabila kontroller är det #1174 (pulsen i mobil rättad 2026-11-12, etiketter för fel år kvar).
- **Kontroller som körs ensamma:** några kontroller bygger på läget från kontrollerna före sig (till exempel "ett rike syns" och i mobil "Fokus öppnas och följer ett rike") och blir röda med `ENDAST`. Det är inte ett appfel; kör hela jobbet innan slutsatsen dras.

## Att kontrollera vid uppdatering (varje release)

- [ ] Har ett arbetsflöde, en kontroll eller ett jobb tillkommit eller tagits bort?
- [ ] Har en lucka stängts (till exempel iPad-bredder i webbläsartestet)? Ta bort den och uppdatera [09](09-kravspecifikation.md).
- [ ] Var en kontroll röd utan att vara ett appfel? Skriv orsaken här så att den inte tolkas fel nästa gång.
