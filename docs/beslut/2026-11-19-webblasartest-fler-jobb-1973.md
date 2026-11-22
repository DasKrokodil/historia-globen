# Webbläsartestet: två jobb till och rättade kontroller (#1973)

**Datum:** 2026-11-19

## Beslut
1. **Jobben "dator, övrigt" och "mobil" delas.** Kontroller som har egna sidor (`newPage`, `touchPage`, `placeTapPage` och liknande, alltså inte bygger på läget från kontrollerna före sig) flyttas till två nya jobb i `tests/jobb.json`: `dator2` ("dator, kort och turer", 43 kontroller: turkort, Samtidigt-/Visste du?-kortet, Mer, tillgänglighetskontrollerna för korten) och `mobil2` ("mobil, kort, turer och regionvy", 58 kontroller: samma kort och turer samt regionvyn). De hamnar i `utan` för `dator` respektive `mobil`, och `node scripts/kontrolltackning.mjs` visar att varje kontroll fortfarande ligger i exakt ett jobb per bredd. Tidsgränsen är oförändrad (25 minuter).
2. **Sex tunga regionvykontroller flyttas från `plats` till `sprak`** ("dator, fem språk och regionvy"): #1864, #1949, #1900, #865/#1162 (platsens adress mitt i en laddning), uppspelningen vid platsens händelser (#1255) och #1952. `plats` tog lokalt 1 585 s (CI 18 min 38 s på `main`, utan felande kontroller), och `sprak` hade cirka 5 minuter. Lokalt efter flytten: `sprak` 802 s, och `plats` har sex kontroller färre.
3. **Kontrollerna följer gränssnittet där gränssnittet är rätt, och gränssnittet rättas inte i den här ändringen.** Per kontroll:
   - #994/#995 och #1319: raden under årtalet skrivs i ord ("även 40 år före och efter", #1307, `time.windowYearsWords`). DasKrokodil bestämde 2026-11-19 att kontrollen följer texten.
   - #1311: kortets rubrik heter "Visste du?" sedan #1306 (`ff.kind.funfact`).
   - #1575: "Hur vi kontrollerar källor" är ihopfälld från början sedan "Visa aktuella källor först"; raden om projektet ligger i den och fälls ut före kontrollen.
   - #1695: sedan #1951 rullar hela sökmenyn i liggande telefon, inte listan.
   - #706 och #1713 (uppföljning): kortet täcker ingen text eller knapp. Kontrollerna mäter datumknappen, raden under årtalet och knapparna i stället för rutor som blivit bredare eller högre (reglaget är 121 px högt vid 360 px när teckenförklaringen radbryts, och kortets ram går 7 px in under det).
   - #1454: med pekning (fokusradens knappar 44 px) rör beskedraden fokusradens ram i 4 px. Kontrollen räknar innehållet, inte ram och luft.
   - #1866: statusraden fylls en stund efter att kortet öppnats; kontrollen väntar in den.
   - #1952: rutnätsmätningen (8 px steg) ligger på cirka 45 % och gav 44 % eller 45 %; golvet är 44 %.
   - #1863: kontrollen fäller ut högen före trycket (markören ligger numera i en hög vid år 1827). Då syntes ett riktigt fel: brickan "Hela Skåne" hamnade under zoomknapparna i mobil. **DasKrokodil valde alternativ A (2026-11-19): brickan döljs medan faktarutan visar en händelse utanför brickan** och kommer tillbaka när kortet stängs (`brickHidden` i `js/ui/region-marks.js`). En bara markerad markör döljer den inte. Skälet: ytan ovanför arket är för trång, och kortet säger redan var händelsen ligger.

## Varför
Mobilsviten i en körning gav inget svar efter 25 minuter (resultaten skrivs först när allt är klart), och i CI avbröts "mobil" och "dator, övrigt" vid tidsgränsen (mätt: dator, övrigt 23 min 49 s och mobil över 24 min 30 s på `main` 6bf2b26). Lokalt tog jobbet `dator2` 654 s och `mobil2` 674 s. Gränsen höjdes inte: tidigare beslut (docs/beslut/2026-11-14-webblasartest-fler-jobb-1649.md) delar hellre än att höja.
