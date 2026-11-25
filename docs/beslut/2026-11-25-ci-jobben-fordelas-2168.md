# Webbläsartestets jobb fördelas om och får två nya jobb (#2168)

**Datum:** 2026-11-25

## Beslut

Fördela om 28 kontroller (14 i datorbredd, 14 i mobilbredd) mellan Chromium-jobben och lägg till två jobb, `dator3` och `mobil3`, så att Chromium körs i tretton jobb i stället för elva. Ändringen görs bara i `tests/jobb.json` (`endast` och `utan` samt två nya poster). Kontroller, kontrollnamn, tidsgränser (25 minuter i Chromium, 45 i Firefox och WebKit) och resten av CI är oförändrade. Ingen kontroll tas bort eller hoppas över: `node scripts/kontrolltackning.mjs` ger OK, varje kontroll i exakt ett jobb per bredd.

## Varför

`dator` (övrigt) tog hela jobbet 24 min 16 s i den schemalagda körningen 2026-11-24, alltså inom 45 sekunder från gränsen på 25 minuter, och `mobilplats` 21 min 39 s. Mätt över sex körningar låg mediantiden för teststeget på 20 min 51 s för `dator`, 17 min 42 s för `tung`, 17 min 4 s för `mobilplats` och 16 min 46 s för `mobil`, medan målet i [publiceringsdokumentet](../DEPLOYMENT.md) är cirka 15 minuter. Samma jobb varierar upp till cirka 25 % mellan körningar, så en fördelning behöver marginal för cirka 30 %.

Kontrollernas mediantider summerar till 6 237 s i datorbredd (sju jobb, 14 min 51 s i snitt) och 2 577 s i mobilbredd (tre jobb, 14 min 19 s i snitt). Även en helt jämn fördelning på de elva jobben hade legat över målet på cirka 13–14 minuter, och de datorjobb som hade utrymme (`fokus`, `sprak`, `lang`, `plats`) låg redan på 12–13 minuter. Bara `mobil2` hade ett par minuter kvar och tar emot en kontroll. Två nya jobb ger beräknat 10–14 minuter teststeg per jobb i medianen, högst cirka 18 minuter med 30 % marginal.

## Mätunderlag

Sex körningar med oförändrad jobbfördelning: de schemalagda main-körningarna 45407447582 och 45619561592 och pull request-körningarna 45574942745, 45575126971, 45662585810 och 45662754040. Tid per kontroll kommer ur raderna `✓ <namn> (N s)` i jobbloggarna och teststeget ur Actions stegtider. Tabellerna (före, flyttade kontroller, beräknat efter) står i [publiceringsdokumentet](../DEPLOYMENT.md#mätning-och-omfördelning-2026-11-25-2168).

## Beräkning, inte mätning

Tiderna efter ändringen är **beräknade** ur de uppmätta kontrolltiderna och inte uppmätta i CI. Modellen återger de gamla jobbens uppmätta medianer väl (till exempel `tung` 17 min 41 s mot 17 min 42 s), men den första CI-körningen efter ihopslagningen avgör. Mät då alla tretton jobb och jämför med tabellen; överstiger något jobb cirka 16 minuter i teststeget, flytta fler kontroller eller lägg till ett åttonde datorjobb.

## Så mäter man nästa gång

Hämta jobben och loggarna för en avslutad körning med `gh api` (kommandona står i publiceringsdokumentet), summera raderna `✓ … (N s)` per jobb, ta medianen över minst tre körningar (helst de schemalagda main-körningarna) och flytta kontroller med ett token i mottagarens `endast` och avsändarens `utan`. Kontrollera med `node scripts/kontrolltackning.mjs`.

## Berör

`tests/jobb.json`, [publiceringsdokumentet](../DEPLOYMENT.md), [beslutet 2026-11-21 (#1996, #2166)](2026-11-21-plats-jobbet-fordelas-1996.md), [beslutet 2026-11-22 (#2171)](2026-11-22-firefox-webkit-delas-2171.md) och #2168. Veckokörningen med Firefox och WebKit får tretton jobb per motor i stället för elva. Kommentarerna i `.github/workflows/browser-test.yml` säger fortfarande "elva jobb" och uppdateras vid nästa ändring av den filen.
