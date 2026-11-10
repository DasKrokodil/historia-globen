# Plan: lagerordning och stänggrupper för alla ytor (#894)

Datum: 2026-11-10. Underlag: beslutet i `docs/beslut/2026-11-09-lagerordning.md` ("Ja enligt rekommendation") och punkt A1 i `2026-11-08-triage-claude-code.md`.

## Läget

- Klart: 13 namngivna lager i `:root` (steg 1 i `61b099c`, steg 2 menyer och dialoger).
- Kvar i `css/style.css`: 17 handskrivna `z-index`. De flesta är **lokala** (1–5, ligger inuti en yta och styr bara ordningen mellan dess egna delar, till exempel `.detail-close`, `.ff-handle`, klibbiga rubriker). Dem ska man inte namnge: de är inget lager mellan ytor.
- Det som är kvar att namnge som verkliga ytor (värdena kvar som de är): `.ff-tab` 12, `.timebar` 13, `.focus-bar` 14, `.religion-pop` 12, `.religion-tip` 11, `.religion-legend` 5.
- Ömsesidig uteslutning görs för hand i `js/main.js` (stäng Lager, flat, rikesruta m.fl.), `js/controllers/facts.js` och `js/controllers/focus.js`.

## Steg (en liten pull request vardera, UI-arbetare en i taget)

1. **Klar:** namn för meny, panel, faktaruta, turkort, band (steg 1) och menyer och dialoger (steg 2).
2. **Kartans egna ytor:** namnge tidsreglaget, fokusfältet, `.ff-tab`, riksymbolernas ruta, ledtext och teckenförklaring (`--z-tidslinje`, `--z-fokus`, `--z-tipp`). Först en mätning av vilka som delar staplingskontext, så att namnen inte ändrar ordningen. Bara CSS, jämför skärmbilder dator och mobil.
3. **Regel mot nya siffror:** lägg en kontroll (en rad i `tests/`, eller `grep` i CI) som varnar när ett `z-index` över 5 skrivs som siffra i `css/style.css`. Då växer inte skulden igen medan resten flyttas.
4. **Kombinationsmatrisen (#891):** en kontroll i `tests/webblasare.mjs` som öppnar varje par av ytor (meny, panel, faktaruta, tur, lektionsband, jakt, ark, dialog) från rent läge och bevisar vem som ligger överst och att inget täcker en knapp som man ska nå. Delas som eget jobb med ren sida mellan varje par (A1 i triagen). Görs före steg 5, annars saknas bevis.
5. **Stängregistret i `js/main.js`:** ett litet register där varje yta anmäler sig i en grupp (sidopanel, meny, ark, dialog) och en öppnad yta stänger sin grupp. Införs **en grupp i taget**, börja med menyerna (Lager, Mer, hopp, hjälp), sedan sidopanelerna, sist arken och dialogerna. Varje grupp tar bort sina handskrivna `close()`-anrop, och matrisen från steg 4 ska vara grön före och efter.
6. **Nya ytor** (intervallet #755, Källdetektiven) anmäler sig i registret från början och får lagernamn; ingen ny yta får egna `close()`-anrop.
7. **Avslut:** när inga handskrivna anrop och inga globala siffror finns kvar, uppdatera `docs/arkitektur.md` (Moduler, Mindre trängsel på kartan), skriv ett avslutande beslut och föreslå att issuet stängs.

## Numrering mot beslutsfilen

Planens steg och avsnitten i `docs/beslut/2026-11-09-lagerordning.md` räknas olika, eftersom beslutsfilen bara får ett avsnitt när något är gjort: plan 2 (kartans ytor, #1064) = beslutsfilens Steg 3, plan 3 (kontroll mot nya siffror, #1065) = Steg 4, plan 4 (kombinationsmatrisen, #891) = Steg 5, plan 5 (stängregistret) = Steg 6 och följande. Beslutsfilens Steg 2 är menyer och dialoger (#1063), som i planen ligger under steg 1.

## Färdigvillkor för varje steg

Ingen visuell ändring (skärmbilder dator och mobil), webbläsartestet grönt med oförändrat antal kontroller (#864), inget annat läge sämre.

## Agent och kostnad

Steg 2–3: Codex bygger, annan körning granskar. Steg 4–5: Codex bygger, Claude Code (Sonnet high) bedömer besökarflödet. Ungefärlig planeringsram i tusen modelltoken, inte uppmätt: steg 2–3 10–20, steg 4 15–30, steg 5 20–40 per grupp, plus 25 % reserv. Krockar: `css/style.css`, `js/main.js`, `js/controllers/*.js`, `tests/webblasare.mjs`.
