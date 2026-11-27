# Blind-spots: Sök och följ och landkortet efter att länderna Norge till Litauen slogs ihop (2026-11-27)

**Datum:** 2026-11-27. **Mot:** `main` `343b5c8` (alla länder i `data/platser.json`: 17 länder och landskapet Skåne, inklusive Norge till Litauen från #1260 och #1261 och Tyskland från #1820). **Hur:** Playwright (Chromium, `python3 -m http.server`), `docs/produkt/05-ux-oversikt.md` ("Lägen att alltid prova") som lista. Bara docs; ingen kod, data eller text är ändrad, och `data/platser.json` är inte rörd. Skriven av Claude Code på DasKrokodils konto.

## Vad som kördes

| Kontroll | Hur | Skärmar |
|---|---|---|
| Alla 18 platskort öppnas via länk (`#y=1600&f=place:<id>`), kortets rubrik, antal händelser, inledningens längd, knappens plats, konsolfel, misslyckade förfrågningar, horisontell scroll | `loop.js` | dator 1280×800, mobil 400×800, liggande 800×360 |
| "Visa på kartan" i alla 18, markörer i regionvyn, horisontell scroll i regionvyn | samma | samma |
| Sök och följ: flikar, urvalsraden, sökning på ett land som saknas, en stad och strunt | `probe4.js` | dator |
| Följa Norge utanför landets period (år −90 000 och 2025) | samma | dator |
| `data/platser.json` blockerad respektive fördröjd 6 s | samma | dator |
| Landkortet på en, de, es och fr för Danmark, Grönland och Skåne (landsnamnsformen `nameIn` saknas i datan för dem) | samma | dator |

Skripten ligger inte i repot. Skärmbilder togs för Norge, Luxemburg, Sverige, Skåne, Litauen och Grönland; de är inte incheckade.

## Det som fungerar (inga fynd)

- **Inga konsolfel, inga misslyckade förfrågningar och ingen horisontell scroll** för något av de 18 platskorten i de tre storlekarna, varken före eller efter "Visa på kartan".
- **Urvalsraden** "Ett urval: 17 länder. Fler kommer." stämmer med datan (17 länder utom landskapet; 18 rader i listan).
- **Land som saknas** ("spanien"): besked och väg till Nära en plats.
- **Följa ett land utanför dess period:** vid −90 000 flyttas tiden till 4200 f.Kr., då Norge börjar, med en rad "Tillbaka till 90 000 f.Kr."; vid 2025 står tiden kvar vid 2008 och knappen heter "Spela igen". Inga fel.
- **Språk:** Danmark, Grönland och Skåne på en, de, es och fr visar inga svenska ord i kortet (tyska "Land" är också ett tyskt ord). Att `nameIn` saknas för Danmark, Grönland, Aotearoa och Skåne syns inte i kortet.
- **Reservlösning för stora länder:** Sverige, Finland, Frankrike, Storbritannien och Tyskland får ingen regionvy med numrerade markörer. Sverige öppnar Platt karta med platsen följd (bekräftat med skärmbild); i koden (`buttonKey` i `js/controllers/region.js`, `region-frame.js`) hänvisas länder som är för stora till Platt karta. Platt karta är inte kontrollerad för Finland, Frankrike, Storbritannien och Tyskland.

## Fynd

| # | Fynd | Läge | Issue |
|---|---|---|---|
| 1 | I dator ligger "Visa på kartan" utanför kortets första skärm för Frankrike, Belgien, Nederländerna, Luxemburg och Tyskland (knappens topp 734–1 028 px, kortet slutar vid cirka 623 px; Luxemburg 4 248 px innehåll i ett kort på 476 px). Orsak troligen de långa inledningarna (Tyskland 21 003 tecken). Mobil och liggande opåverkade | Tomt/Delvis | [#2353](https://github.com/DasKrokodil/historia-globen/issues/2353) (beslut om utseende) |
| 2 | Går `data/platser.json` inte att ladda försvinner fliken "Länder och landskap" tyst, utan besked; en länk till ett land visar bara globen under en långsam laddning (ingen fokusrad, inget kort, ingen laddningsmarkering på 2,5 s, kortet kommer efter cirka 9,5 s) | Laddning och fel | [#2354](https://github.com/DasKrokodil/historia-globen/issues/2354) |
| 3 | Sökning på en stad ("stockholm") eller strunt ("zzz") ger "Landet ”…” finns inte bland korten ännu", som om allt vore ett land | Delvis | [#2355](https://github.com/DasKrokodil/historia-globen/issues/2355) |

Dubbletter söktes först (platskort, Visa på kartan, tyst laddningsreserv, platser.json, "Landet finns inte bland korten"); inget öppet issue fanns. Issuesen har inte `redo`; #2353 har `beslut-krävs` eftersom det ändrar utseendet.

## Iakttagelser utan issue

- Knappen heter "Visa på kartan" både när den öppnar regionvyn (Norge) och när den öppnar Platt karta (Sverige). Issuet #1864 (stängt) gällde knapptexten; om skillnaden ska synas är en fråga för DasKrokodil.
- Antalet markörer i regionvyn skiljer sig mellan skärmar (till exempel Norge 5 på dator och 2 i mobil, Danmark 11 på dator och 5 i mobil) eftersom markörer slås ihop till högar; jag har inte kontrollerat att varje händelse i listan går att nå från kartan.
- "Samtidigt 0" visas medan man följer ett land (till exempel Sverige 1600). Det är känt (knappen räknar pågående händelser) och inget nytt fynd.

## Det som inte kördes

Tangentbord och skärmläsare i trädet och kortet (täcks delvis av `tests/webblasare.mjs`), 200 % zoom, Firefox och WebKit, andra år än 1600 för alla länder, regionvyns markörer mot händelselistan, landskapen under Sverige (bara Skåne finns), delning av länk med `f=place:` mellan språk, uppspelning med ett land följt, och bildladdning för flaggor och vapen. Ingen riktig användare har observerats; allt ovan är automatisk mätning.

## Att kontrollera
- [ ] Efter #2353: kör `loop.js`-mätningen om för de fem länderna.
- [ ] Efter ett nytt land: öppna kortet i de tre storlekarna och mät knappens plats.
