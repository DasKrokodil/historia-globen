# Firefox och WebKit i webbläsartestet: läsbara fel, väntan på tillstånd och exakta undantag (#888)

**Datum:** 2026-11-08

## Beslut
Webbläsartestet (`tests/webblasare.mjs`) ändras på sex punkter, så att det går grönt i Chromium, Firefox och WebKit utan att någon kontroll stängs av eller hoppas över:

1. **Läsbara konsolfel.** `Error`-argument i `console.error` och `console.warn` görs om till text i sidan (`context.addInitScript`), och konsolfel i huvudkontrollen visar vilken kontroll som pågick (`[under: …]`). Skäl: Firefox ger `JSHandle@object` som text, och handtaget går inte att läsa efter att sidan navigerat.
2. **Exakta undantag för avbruten hämtning.** `ABORTED_FETCH` (`TypeError: Load failed`, `TypeError: NetworkError when attempting to fetch resource.`, `AbortError: The operation was aborted.`) och `cancelled()` räknas bara bort medan sidan navigerar eller laddar om (`reloading`, `navigating`). Ett annat konsolfel fäller kontrollen som förut.
3. **Väntan på tillstånd i stället för fasta tider.** Fokusraden mot pausraden (ersätter 100 ms), året efter en okänd turlänk, och `addressReady()` (adressen har skrivit startläget) innan en hash sätts medan ett fokus laddas.
4. **Motorskillnader i hur saker skrivs.** Typsnittsnamn jämförs utan citattecken (Firefox och WebKit skriver dem olika).
5. **Diagnostik som visar läget** när en tur eller ett lektionsband inte syns (`waitDiag`): adress, kortets och bandets tillstånd och konsolfelen.
6. **Utskriften:** lärarbladets listor får 2,5 pt mellanrum (eget beslut, [2026-11-08-lararblad-a4-marginal](2026-11-08-lararblad-a4-marginal.md)), eftersom det tyska bladet i reservtypsnitt låg på A4:s gräns.

## Varför
Firefox hade sju fel och WebKit sex i CI (körning 42450013701 och 42470069967). Ingen av motorerna går att köra i molnmiljön (nedladdningen blockeras), så varje rättning prövades i CI med etiketten `alla-webbläsare`. Orsakerna står per fel i `docs/DEPLOYMENT.md` (avsnittet "Firefox och WebKit i testet"). Nästan alla var motorskillnader i testet och inte i appen. Undantagen är smala med flit: en ny, annan feltext ska fortfarande synas.

## Appen
Ett fynd är ett riktigt (litet) fönster i appen och inte i testet: `popstate` registreras först efter `await apply(s)` i `start()`, medan laddningsrutan döljs tidigare. Det ligger hos #893 (lägeskontraktet) som kommentar, och ingen appkod är ändrad här.

## Alternativ som övervägdes
- **Stänga av Firefox- och WebKit-kontrollerna som är röda:** avvisades; det är förbjudet i projektets regler och skulle dölja riktiga fel.
- **Längre tidsgränser överallt:** avvisades. 90 s räckte inte för lektionsbandet i WebKit, och orsaken var inte tid (se punkt 3); en väntan på rätt tillstånd löste det.
- **Köra Firefox och WebKit i de tre jobben:** avvisades här (beslut 2026-11-08, #864).

## Berör
`tests/webblasare.mjs`, `css/style.css` (utskrift), `docs/DEPLOYMENT.md`. Hör ihop med #864, #865, #888, #893, #757.
