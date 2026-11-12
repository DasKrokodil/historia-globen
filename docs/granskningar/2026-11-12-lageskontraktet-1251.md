# Året klämdes innan ett färdigt fokus lämnades (#1251)

2026-11-12. Codex (Einzbeng). Utgångspunkt: `main` på `3d6e33380a52293af22a8bfef06cec14bfaaa8a8`.

## Orsak och rättning

Det finns ett appfel i `js/controllers/address.js`, inte bara en för kort väntan i webbläsartestet.
`apply()` satte `timeline.year` innan ett aktivt fokus avslutades. Årssettern i `js/timeline.js`
begränsar året till `timeline.focus.from…to`. När fokuset i provets adress redan hade hunnit bli
färdigt klämdes därför det begärda året 1500 till reglagets gamla fokusgräns 1474. Därefter lämnades
fokuset, men det begärda året sattes inte igen. Adressen kunde stå på `y=1500` medan både årsrutan
och reglagets `aria-valuenow` stod på 1474.

Rättningen lämnar ett aktivt fokus med `app.endFocus(false)` före årsvalet när den nya adressen
saknar fokus. Den vanliga omritningen sker sedan i `apply()`. En adress som fortfarande begär ett
fokus behåller den befintliga fokusbegränsningen. Ingen väntetid eller kontroll i `tests/webblasare.mjs`
har ändrats.

## Händelseordningen före rättningen

Loggningen gjordes lokalt i Chromium genom tillfälliga, synkrona logganrop i de serverade modulerna:
`address.start()`, `apply()`, fokusets retur, årssettern och `endFocus()`. `popstate` och `hashchange`
loggades också. Instrumenteringen finns inte i appen eller i det incheckade webbläsartestet.
Tiderna nedan är millisekunder från respektive sidöppning, inte jämförbara prestandamått mellan körningar.

Den ursprungliga lägeskontrollen kördes först ensam i datorbredd och **passerade**. Del 3 gav:

| Tid | Händelse | Tillstånd |
|---:|---|---|
| 2021 | laddningsrutan dold | inget fokus, år 1325 |
| 6421 | `address.start()` | läser startens fokusadress |
| 6452 | årsval klart | år 1474, fokuset hämtas fortfarande |
| 7400 | `popstate`, vanlig adress `y=1500` | inget aktivt fokus ännu |
| 7417 | årsval klart | år 1500 |
| 8656 | startens fokus returnerar | `started=false`, begäran 1 överspelad av 2 |

Det redan befintliga skyddet mot en gammal fokusbegäran fungerade i denna körning.

För att skilja väntetid från tillståndsordning öppnades samma startadress igen, men adressbytet
gjordes först när fokusraden var synlig. Då reproducerades felet utan att vara beroende av att
träffa ett smalt laddningsfönster:

| Tid | Händelse | Önskat år | Faktiskt år / fokus |
|---:|---|---:|---|
| 6786 | startens fokus färdigt | 1474 | 1474, aktivt fokus |
| 11810 | `popstate`, `apply()` | 1500 | 1474, aktivt fokus |
| 11810 | före och efter årssettern | 1500 | kvar på 1474, aktivt fokus |
| 11810–11829 | `endFocus()` | — | 1474, sedan inget fokus |

Slutresultat: `hash=#y=1500`, synligt år `1474`, `aria-valuenow=1474`.
Denna reproduktion är den första felande kontrollen i arbetet och visar en tydlig orsak.
En liten rättning gjordes därefter, enligt stoppregeln i `AGENTS.md`.

## Samma färdiga fokus efter rättningen

| Tid | Händelse | Önskat år | Faktiskt år / fokus |
|---:|---|---:|---|
| 12131 | `popstate` | 1500 | 1474, aktivt fokus |
| 12132–12139 | `endFocus()` | — | 1474, sedan inget fokus |
| 12139 | före årssettern | 1500 | 1474, inget fokusspann |
| 12157 | efter årssettern | 1500 | 1500, inget fokusspann |

Slutresultat: `hash=#y=1500`, synligt år `1500`, `aria-valuenow=1500`.

## Regression och kontroll

`tests/address.test.mjs` driver adresshanteringens riktiga `popstate`-lyssnare tillsammans med
`Timeline`-klassens riktiga årssetter. Omritning och övriga gränssnittskopplingar är små testdubblar.
Syntetiskt fokusspann 10–20 används, med år före, inom och efter spannet; inga historiska uppgifter
byggs in i enhetstesterna. Fall utan aktivt fokus och med samma fokus kvar skyddar de tidigare fungerande vägarna.

- De fem nya testerna mot den oförändrade adressmodulen från utgångscommitten gav exakt två
  förväntade fel: år före respektive efter det färdiga fokuset. De övriga tre var gröna.
- Med rättningen är alla fem gröna och hela Node-sviten har 248 gröna tester.
- Den deterministiska Chromium-reproduktionen med ett färdigt fokus är grön efter rättningen.
- Den ursprungliga lägeskontrollen är grön i både dator- och mobilbredd med diagnostik.
- Samma kontroll är dessutom grön i båda bredderna utan adressinstrumentering.
- Hela den befintliga webbläsarsviten har startats lokalt. Slutligt utfall för fullkörningen och
  Actions redovisas i pull requesten.

## Manuell kontroll

1. Öppna sidan med `#y=1474&f=empire:romarriket&c=-30,-120,3` och vänta tills fokusraden syns.
2. Ändra samma fliks adress till `#y=1500` utan omladdning av sidans övriga adress.
3. Fokus ska avslutas och det stora årtalet ska visa 1500. Prova också en vanlig adress med ett
   år före fokusspannet. De tidiga adressbytena under laddning finns kvar i webbläsartestets del 3.

Kodreferenser: `createAddress().start()` och `apply()` i `js/controllers/address.js`, årssettern i
`js/timeline.js`, `endFocus()` i `js/controllers/focus.js` samt
[beslutet om provet utan adressväntan](../beslut/2026-11-08-adressen-lyssnar-fore-start-953.md).
Inga historiska data, versionsfiler eller arkitekturprinciper ändras.
