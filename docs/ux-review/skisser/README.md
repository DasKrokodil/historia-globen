# Skisser till UX-granskningen

**Datum:** 2026-11-09. Skisserna visar hur sidan *kan* se ut enligt förslagen i [02-uxdesigner.md](../02-uxdesigner.md) (filer som börjar på D) och [03-pedagog.md](../03-pedagog.md) (filer som börjar på L). De ligger också på en Miro-tavla tillsammans med skärmbilder av hur sidan ser ut i dag.

**Det här är inte byggt.** Varje skiss är en riktig skärmbild av appen där texter har ändrats och delar har dolts direkt i webbläsaren. Ingen kod i repot är ändrad. Skriptet som gjorde skisserna finns i `skisser.mjs` (Playwright, kör mot `python3 -m http.server 8765`).

| Fil | Förslag |
|---|---|
| `D1-dator-forsta-vy.jpg` | Färre knappar, fönstret i klartext, kompakt kort, engångstips och fönstret som band på tidslinjen |
| `D2-dator-folj-krig.jpg` | En lägesrad i fokusläget, kortet ihopfällt, faktaruta på fast plats |
| `D3-mobil-forsta-vy.jpg` | Mobilkortet startar stängt |
| `L1-dator-samtidigt-grupperat.jpg` | Listan delad i Hände, Strax före och efter, Pågick då; århundrade; fråga på kortet; synlig tidsskala |
| `L2-dator-1916-riktning.jpg` | Etiketter med riktning i tid och en etikett för det pågående kriget |
| `L3-dator-faktaruta-hur-vet-vi.jpg` | Källan i frågeform och länk till turen Hur vet vi det här? |
| `L4-mobil-fraga-pa-kortet.jpg` | En fråga på kortet i stället för bildremsan |

Den mörka rutan över klotet i några mobilbilder är ett renderingsfel i testmiljön (programvarurendering), inte en del av förslagen.
