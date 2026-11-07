# Lektionsläge via länk (#795)

**Datum:** 2026-11-07

## Beslut
En länk `#t=<tur-id>&m=lektion` startar en lektionstur (en tur med `lesson`, #737) i lektionsläge: Lager, vyväljaren, kategorifilter, Sök och följ, Turer och Introduktion är dolda, Fokus är stoppat, och ett smalt band överst säger "Lektionsläge: <turens titel>" med knappen "Visa hela globen". Knappen avslutar läget och turen, behåller året och ger den vanliga sidan. Det som låses ligger som data i turen, i det valfria `lesson.lock` (`years`, `layers`, `escape`), så att en lärares önskemål oftast går att möta genom att ändra en JSON-fil.

- **Läget är lärarens val via länk.** Besökare utan länk ser den vanliga sidan. Ingen årskursväljare, inga konton och inget sparas om eleverna. `m=lektion` utan en lektionstur gör ingenting, så att läget aldrig står tomt.
- **Utgången är alltid nåbar** med tangentbord och skärmläsare (bandet är en märkt landmärke) om inte `lock.escape` är `false`. Avsluta i turens kort och pausraden döljs och Escape avslutar inte turen, så att en elev inte hamnar utanför lektionen av misstag.
- **Inga tomma lägen:** alla stegens år ligger inom `lock.years`, och intervallet har synliga händelser från minst två världsdelar (kontrolleras i `tests/tour.test.mjs`). Efter sista steget står slutkortet kvar, och länkar till uppdrag visas bara för uppdrag vars år ligger i intervallet.
- **Låset håller överallt (rättat efter granskning):** `lock.years` är hela år (heltal). Tidslåset lagras som `timeline.focusLocked`, som lektionsläget sätter; ett datum i årshoppet (till exempel `1066-10-14`) utanför intervallet avvisas med samma meddelande som ett år ("Året ligger utanför det du följer nu"), och ett datum inom intervallet släpper inte låset. Om ett Fokus var på när lektionslänken öppnades läggs låset igen efter att fokuset släppts (`LessonMode.applyLock`, anropas av `TourPlayer.start`). Samtidighetsjakten döljs i lektionsläget (`#btn-hunt`), och `Hunt.start` avvisar ett uppdrag utanför lektionens år, så ett `u=` utanför intervallet ignoreras; quizet flyttar inte året och står kvar. Kontrollen av två världsdelar finns bara i `tests/tour.test.mjs`, inte i `scripts/validate-site.py`, eftersom världsdelen räknas med `region()` i `js/model.js` och en kopia i Python skulle glida isär.
- **Samma adressformat som övrigt (#501):** `m` skrivs medan läget pågår, och omladdning, Dela och Bakåt/Framåt ger samma läge. Läraren får länken på lärarbladet (#738).
- Läroplanskopplingen skrivs som förut "kopplad till Lgr22", aldrig "godkänd av Skolverket" (2026-11-07-lararfalt-i-turer.md).

## Varför
Rikard frågade 2026-11-07 hur skolan får fokus på en sak så att eleverna inte klickar på alla lager. Första versionen är enkel, och ändras efter vad lärarna säger i piloten (#744). Sidans grundidé, att utforska fritt, bevaras av nödutgången.

## Utanför första versionen
Lektionslista med årskursfilter, teman som samlingar av turer, enklare texter för yngre elever, fler lås (till exempel kameran), och länkar från slutkortet till quiz (#65) och Källdetektiven (#742) när de kan hämta frågor ur intervallet. Quizet väljer i dag bland alla fun facts och Samtidighetsjakten gäller 1500, så de ligger utanför båda lektionernas år och länkas inte än.

## Berör
`js/url-state.js`, `js/controllers/address.js`, `js/ui/lesson.js`, `js/ui/tour.js`, `js/main.js`, `js/tour-format.js`, `schemas/tour.schema.json`, `data/turer/`, `data/ui/*.json`, `docs/arkitektur.md`, `docs/datamodell.md`, #66, #737, #738, #741, #744, #757.
