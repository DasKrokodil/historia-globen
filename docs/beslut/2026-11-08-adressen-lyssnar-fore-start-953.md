# Adressen lyssnar före start: provet utan väntan på adressen (#953)

**Datum:** 2026-11-08

## Beslut
Fönstret som #953 beskriver (en vy som byts medan ett fokus i en delad länk laddas går förlorad) är redan rättat i appen av #893: `popstate` registreras först i `start()` i `js/controllers/address.js`, före `await apply(s)`, och en nyare vy äger adressen när startens fokus blir klart (versionsräknaren). Det som återstod var provet, och det ändras så här:

1. `addressReady()` tas bort ur `tests/webblasare.mjs`. Det väntade på att adressen skrev startläget innan en hash sattes, och dolde därmed just det fönster som besökaren kan träffa (#888, beslut [2026-11-08-firefox-webkit-testet-888](2026-11-08-firefox-webkit-testet-888.md), punkt 3). Kontrollerna för #865 och lektionen sätter nu hashen direkt efter att laddningsrutan försvunnit.
2. Kontrollen för lägeskontraktet (#893) får en tredje del: en delad länk med ett långsamt fokus (`#y=1474&f=empire:romarriket`, rikesfiler som svarar efter 2,5 s) och en vanlig hashändring (`#y=1500`) i samma flik. Adressen ska stå kvar som `y=1500` utan `f=`, fokusraden ska vara dold och året ska vara 1500 när startens fokus blivit klart.

## Skäl
Ett prov som väntar in rätt tillstånd före varje steg döljer kapplöpningar (metodpunkt 3 i #891). Utan `addressReady()` är provet detsamma som en besökares: laddningsrutan försvinner och vyn byts direkt.

## Bevis
- Med appen som den är: de tre kontrollerna (lektion, #865, lägeskontraktet) är gröna i Chromium i dator- och mobilbredd.
- Med `popstate`-lyssnaren flyttad till efter `await apply(s)` (läget före #893): lägeskontrollen är röd, och del 3 är röd också när den körs för sig ("adressen skrevs över med startens fokus"). De två äldre kontrollerna var gröna även då i Chromium: kapplöpningen syntes i CI bara i WebKit i mobil, så Firefox och WebKit bekräftas av körningen med etiketten `alla-webbläsare`.

## Berör
`tests/webblasare.mjs`, `docs/DEPLOYMENT.md`. Ingen appkod ändrad. Hör ihop med #865, #888, #891, #893.
