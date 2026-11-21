# Utseende: startbild med kortets händelser i bild och en sorts ruta för läsning (#1317)

Datum: 2026-11-17. Beslut av DasKrokodil i #1317 (2026-11-14): "1. Behåll som det är idag 2. ja 3. ja".

## Beslut

1. **Del 1, årtalets siffror: behålls som de är.** Typsnitt och siffror ändras inte (IM Fell English).
2. **Del 2, startbilden: byggs.** På bred skärm börjar globen på appens lägsta zoom, 0,8, så att kortets händelser (Kairo, Tanger och Tenochtitlan) ligger fria från Visste du?-kortet och syns. Appens lägsta zoom är oförändrad.
3. **Del 3, rutorna: byggs.** Samtidigt-panelen blir en läsyta i faktarutans stil: pergament med guldram och en tunn innerlinje i rubrikrött, som ramen "medeltid" i faktarutan. Visste du?-kortet behåller sitt ljusa pergament. Faktarutan är orörd.

## Regeln för startzoomen

Zoomen är 0,8 när **båda** gäller: skärmen är bred och inte låg (`(min-width: 761px) and (min-height: 500px)`, samma gräns som kortets ark nedtill och liggande telefon), och sidan öppnas **utan delad adress** (ingen hash, inget äldre `?c=`, ingen `?tur=`). Annars är den 1 som förut. Den ligger i `js/start-view.js` (`startView`) och anropas bredvid `globe.flyTo(34, -50)` i `js/main.js`. Startåret styr inte regeln: utan adress är året 1325.

Varför just så:

- **Bara dator.** I mobil (400 × 800) fyller globen redan bredden (marginal cirka 5 procent), och Visste du?-kortet är ett ark nedtill som inte täcker de tre platserna (Tenochtitlan ligger vid y 401 px, arket börjar vid 426 px när det är halvt öppet och 630 px när det är stängt). 0,8 gör globen 304 px bred i en 400 px bred skärm och ger bara mer tomrum. Mätt med samma kameramatematik som `js/globe.js` (ritas inte, räknas) och på riktiga skärmbilder.
- **Bara utan adress.** Adressen skriver alltid kameran (`c=lat,lon,zoom`), så en länk med kamera behåller sin zoom och Bakåt/Framåt rör inte kameran. En hash utan kamera (till exempel `#y=1325`) ger zoom 1, som förut: ingen länk byter utseende i tysthet. Den första inladdningen skriver sedan `c=34,-50,0.8` i adressen, så att en omladdning (till exempel vid språkbyte) behåller den.
- **Varför 0,8 och inget annat.** Det är den enda zoom som flyttar Tenochtitlan ut ur kortets yta: kortet i dator är 380 px brett från x = 16, och Tenochtitlan ligger vid x = 381 px (zoom 1), 411 (0,9) och 441 (0,8) i en 1280 px bred skärm. Vid 0,8 ligger markören 45 px utanför kortet och namnet läggs åt höger om markören av de vanliga namnreglerna. Kairo ligger nära klotets kant vid alla zoomar (cirka 67° från bildens mitt, 95 procent av klotets radie från mitten vid både zoom 1 och 0,8): det är geometri och inte zoom, så Kairo blir inte mer central av att globen blir mindre. Vridningen av kameran ändras inte (förslaget i #1317: "att bara vrida klotet räcker inte").
- **Bakgrund.** Sedan #1867 (2026-11-17) startar Visste du?-kortet litet (en flik i dator) och öppnas av Spela. Täckningen av Tenochtitlan sker alltså när kortet öppnas, inte vid första bilden; startzoomen gör att kortet aldrig täcker platsen när det öppnas, också vid Spela.
- **Bieffekt som är avsedd av zoomnivåerna (#358):** vid 0,8 hamnar globen på nivån "Hela världen" (0,46 skärmpixlar per bildpunkt, tröskeln är 0,55), där högst 14 riken får namn och medalj i stället för 40. Mobilen står redan på den nivån. Besökaren får en lugnare startbild och fler namn när hen zoomar in.

## Panelen i faktarutans stil

- Panelen får samma pergament (`--vellum`), guldram (`--gold`, 2 px) och innerlinje (`--rubric`) som faktarutans ram "medeltid". Färgerna är egna variabler (`--pn-*`) i `.panel`; reglerna för layout, höjd och mobil är oförändrade. Förhandsbilden i #1317 (illustration med färgöverlägg) var inte färdig och visade pergament med guldram; det är det som byggts.
- **Chips och knappar sågs över, som förhandsbilden sa att de behövde.** Kategorifärgerna är avstämda mot natthimlen (#1318) och når bara 1,1–2,8:1 mot pergament. Varje prick får därför samma mörka botten som markörerna på globen (`--medal`, 2 px kontur). Chipsens av-läge hade `opacity: .42`, som på pergament ger för svag text; det visas nu med streckad ram, dämpad text och ihålig prick. Kategorichipsen var 11 px och cirka 21 px höga; de är nu 12 px och minst 24 px (44 px tryckyta på pekskärm och i smal skärm, #1309). Fokusringen är rubrikröd (6,0:1; mässing når 1,9:1 mot pergament). Den valda fliken har mörk text på guld (6,3:1). Text 11,9:1, dämpad text 5,4:1, kontrollramar 4,1:1.
- Kortet (`.funfact`) är orört. Faktarutan (`.detail-card`) är orörd.

## Hur det prövas

- `tests/start-view.test.mjs` och `tests/panelens-farger.test.mjs` (kontrasten ur CSS-variablerna).
- Webbläsarkontrollerna "startbilden: globen börjar på lägsta zoom på dator och som förut i mobil, och en delad adress rör inte kameran (#1317)" och "Samtidigt-panelen har faktarutans pergament och guldram med läsbara färger, kortet behåller pergamentet (#1317)" i `tests/webblasare.mjs`, dator och mobil. Ingen befintlig kontroll är ändrad eller försvagad.

## Vad som återstår

- Del 1 byggs inte (beslut). Mobil prövades inte för förhandsbilden av panelen; den är nu mätt och ser ut som i dator.
- Regeln "bara start eller alla år" avgjordes så: bara start utan adress. Att anpassa zoomen efter en annan händelse eller ett annat år (till exempel när kortet visar en annan trio) är inte gjort.
- Firefox och WebKit är inte körda lokalt (saknas); CI avgör.
