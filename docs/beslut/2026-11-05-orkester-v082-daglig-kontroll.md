# Orkestern uppdateras till v0.8.2 och kontrolleras dagligen

**Datum:** 2026-11-05

## Beslut
1. `.orchestra/shared` uppdateras från upstream v0.7.0 till v0.8.2 (`5a67f02`) med git subtree, som Rikard godkände 2026-11-05.
2. Upstreams nya "integration-ready"-överlämning (v0.8.0) motsvaras här av en öppen pull request med `Closes #N`. Ingen ny etikett införs.
3. Ett GitHub-flöde, "Orkesterns version" (`.github/workflows/orkesterversion.yml`), jämför varje dag den installerade taggen med upstreams stabila taggar och skapar eller uppdaterar ett issue när en nyare version finns. Flödet importerar ingenting.

## Varför
Rikard ville att vi märker nya versioner utan att någon behöver komma ihåg att kontrollera dem. Tidigare gjordes kontrollen bara när dirigenten startade. Ett litet flöde kostar inga tokens och ger ett issue i stället för en chattnotis. Själva uppdateringen ska fortfarande granskas och godkännas, enligt `shared/INSTALL.md`.

## Berör
`.orchestra/shared/`, `.orchestra/project.md`, `.github/workflows/orkesterversion.yml`, `.github/scripts/orkesterversion.cjs`, `tests/orkesterversion.test.mjs`.
