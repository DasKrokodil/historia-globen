# Läsbart turkort i låga fönster (#2147)

Datum: 2026-11-21. Beställt av DasKrokodil i #2147 inför v6.5.0.

## Beslut

- Vid högst 600 CSS-pixlars fönsterhöjd rullar knapparna och foten med texten. Knappen ”Fortsätt läsa” döljs. Gränsen omfattar också 1024×600 och följer lektionens befintliga regel för uppdragslänken.
- Vid högst 480 px höjd visas stegnumret till höger om kapitlet, med kompaktare marginaler och rubrik. Den grafiska stegindikatorn döljs; det utskrivna stegnumret står kvar. Därmed ryms rubriken och de första textraderna också i lärarlägets kort. I smalt lärarläge under 480 px höjd minskas reservationen ovanför kortet från 170 till 144 px; årtalet slutar vid cirka 138 px, och den tomma luckan behövs för texten i 667×375.
- I breda fönster mellan 761 och 1100 px och högst 480 px höjd används det befintliga kompakta årtalet även med mus. Annars lämnade den reserverade toppraden ingen läsyta.
- I låga fönster står stegets bild med bildtext efter texten. Bilden kan fortfarande öppnas i full storlek. När fönstret blir högre återställs bildens vanliga placering och läsknappens beteende.
- Stående mobil 400×800 och dator 1280×800 behåller den fasta foten, bilden och läsknappen. Stegbyten börjar fortfarande överst.

## Motivering och kontroll

Efter #1866 tog den fasta foten och den överlagrade läsknappen hela läsytan i liggande telefon och vid 200 % zoom. I lärarläget 800×360 var kortet bara 92 px högt. Det räcker inte att en knapp finns i bild: stegets text måste ha fri träffyta.

Webbläsarkontrollen `låg fönsterhöjd: stegets text har fri träffyta och foten rullar (#2147)` mäter rubriken och två verkliga textrader med `Range.getClientRects()` och `elementFromPoint`. Den provar 800×360, 844×390, 667×375, 640×400, 1024×600 samt de två oförändrade höga fönstren, i tur, elev- och lärarläge. Den provar även Nästa, nollställningen av rullningen, turens slutkort och lektionens uppdragslänk och Klar. Kontrollen hör enbart till jobbet `matris`; mobilpasset i samma jobb lämnar över till datorpasset som provar alla storlekar.

Utan rättningen: noll fria textrader i samtliga fem låga storlekar och alla tre lägen, läsknappen synlig och foten `sticky`. Ingen kontroll har tagits bort. Äldre kontroller av fasta knappar i låg höjd provar nu att knapparna nås efter rullning; höga fönster har kvar sina ursprungliga krav.

En separat kontroll av första steget i samtliga tio turer gav minst två fria textrader i 800×360, 640×400 och 1024×600 (30 kontroller). Ett bildsteg provades också från lågt till högt fönster: bilden flyttades tillbaka före texten och läsknappen återkom när det fanns mer att läsa.

Skärmbilder före och efter finns på grenen `skarmbilder`, under `issue-2147/`, som WebP. Länkar och slutliga testresultat finns i pull requesten.

## Kända begränsningar (Claude Codes granskning av PR #2164, 2026-11-21)

- **Fönster mellan 601 och cirka 700 px höjd omfattas inte.** Gränsen 600 px följer lektionens befintliga regel. I bred layout syns där fortfarande bara en textrad bredvid Fortsätt läsa, precis som före ändringen: mätt på `main` och på den här grenen (Playwright, Songhairikets fall steg 1, fria textrader av de tre första) är det 1 rad i 1366×650, mot 3 i 1280×800 och 1366×768, och 3 rader på grenen i 1280×600, 1366×600, 1280×560, 1536×540, 1024×600 och 800×360 (före: 0–1). Om gränsen ska höjas är ett eget beslut: [#2169](https://github.com/DasKrokodil/historia-globen/issues/2169).
- **Nästa och Lämna turen ligger under vecket i låga fönster.** Foten rullar med texten, som beställt, så knapparna syns inte utan rullning eller Tab (mätt: Nästa utanför bild i alla provade storlekar högst 600 px, till exempel överkant 467 px i ett 600 px högt fönster). Webbläsarkontrollen provar att de nås efter rullning. En synlig signal om att mer finns (en tonad nederkant utan knappen Fortsätt läsa) är inte gjord och ligger i #2169.
