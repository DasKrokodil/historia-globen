# Tryck på platsen i Fokus och i regionvyn (#1978, del av #1789)

**Datum:** 2026-11-20 (DasKrokodil svarade 2026-11-19 "Gör enligt rekommendationer", ja på fråga 3 i [#1789](https://github.com/DasKrokodil/historia-globen/issues/1789))

## Beslut
Ett tryck på landet (platsens yta) när man följer platsen, på globen, i regionvyn på globen och i Platt vys regionvy, öppnar platskortet utan att starta något nytt Fokus. Det gäller med mus och med finger. Regeln utanför Fokus är oförändrad (`allowed()` i `js/controllers/places.js`: ett tryck följer platsen, med finger efter 380 ms, dubbeltryck zoomar), och reglerna för krig, rike, religion, resa och tema rörs inte.

- **Det fanns redan** (#1791): trycket på platsen man följer öppnar kortet igen på globen och i regionvyn på globen, pekaren blir en hand, Enter öppnar kortet, statusraden läser upp rubriken och fokus går till Stäng.
- **Det som saknades och gjordes här:**
  1. I Platt vys regionvy nådde trycket aldrig platsen: det fällde bara ihop markörerna (`regionMarks.background()`). Nu går trycket vidare till `onMapClick` (som på globen). Hittat med ett riktigt fingertryck i Skåne (21 handpunkter, inget öppnade kortet).
  2. Med finger i Platt vy öppnades kortet före webbläsarens klick, som då träffade kortet och tog fokus från Stäng (fokus hamnade på body). Trycket med finger väntar nu som på globen (`pointerType` skickas till `onMapClick`). Att börja följa en plats med finger i Platt vy är direkt som förut.
  3. Regionvyn startar inget nytt Fokus: ett tryck på ett grannland eller på havet gör ingenting.
  4. Rutan i regionvyn säger hur man får fakta: på bred yta i den långa raden (som förut) och i Platt vys ruta i stående mobil som en egen rad. Förut gömdes den längre raden med meningen i smal skärm (#1956) och ersattes av den korta raden om dagens gräns. Globens ruta i stående mobil får inte raden: en rad till flyttade den fria ytan så att provet #1687 (högens namn ryms i bilden, Grönland) föll, ett fel i placeringen av högens namn som ligger i vänteläge och inte hör till det här issuet.
- **Ordval:** raden säger "Tryck på en markör eller på **platsen** för fakta" (`regionView.tap`, oförändrad i alla fem språk), inte "landet" som issuet föreslog, eftersom regionvyn också visar landskap (Skåne) och "landet" då är fel.
- **Låg liggande yta:** raden visas inte där. Med en extra rad föll kartans fria yta i provet #1952 från 47,4 % till 41,5 % i Platt karta 800 × 360 (golvet är 44 %) och rutan täckte årtalets platta. Provet är inte försvagat. Där öppnar knappen Om platsen i fokusraden kortet, och trycket på platsen fungerar som annars. Prövas om rutan får ett annat mått.

## Varför
DasKrokodil förväntar sig att kunna trycka på landet för att få fakta; det var inte klart att man ska trycka på knappen "Om platsen", och i Platt vys regionvy fungerade det inte alls.

## Berör
`js/controllers/places.js`, `js/ui/flatmap.js`, `js/main.js`, `js/controllers/region.js`, `index.html`, `css/style.css`, `tests/webblasare.mjs` (kontrollen med #1978), `tests/jobb.json`, `docs/arkitektur.md`, `docs/produkt/05-ux-oversikt.md`.
