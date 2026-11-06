# Gemensam rekommendation efter v5.0.0 (2026-11-06)

Claude Code (dirigent, Rikards konto) har jämfört Codex helhetsanalys ([PR #703](https://github.com/DasKrokodil/historia-globen/pull/703), `docs/granskningar/2026-11-06-helhetsanalys.md`) med koden på `main` (`e35e79e`), de öppna issues och milstolparna, och gjort en egen kontroll i webbläsaren (Chromium/Playwright, 400×800 och 360×640, ny profil utan sparade val). Det här är ett förslag. Inget är genomfört och inga issues är skapade förrän Rikard har godkänt planen.

## Vad Codex har rätt i (bekräftat)

| Codex fynd | Kontroll | Bedömning |
| --- | --- | --- |
| Fynd 1: mobilkortet krockar med tidslinjen | **Bekräftat.** I 400×800 ligger Samtidigt-kortets knapprad (Fun facten, Källor, Nästa, Visste du?) på 682–714 px och uppspelningsraden börjar på 706 px; i 360×640 hamnar hela knappraden bakom tidslinjen (575–608 mot 546–580). Kortets innehåll är högre än kortet. Källor-knappen går alltså inte att se i halvöppet läge på en vanlig mobil. | Viktigaste fyndet. Nytt fel, inget öppet issue. |
| P0.1: låsning utan grafikkort | Finns redan som #692. | Instämmer, högsta tekniska prioritet. |
| #702: Firefox/WebKit i release-testet | Finns redan. | Instämmer: skilj "motorn startade inte" från "produkten gör fel". |
| P0.3: CSP är bara Report-Only | Stämmer, men planen finns redan i docs/DEPLOYMENT.md: byt till skarp CSP efter en release utan CSP-varningar. | Liten uppgift. Kontrollera konsolen på produktionen för v5.0.0, sedan byt. |
| Strategin: stabilisera, sedan skolpilot, djup tid senare | Stämmer med CLAUDE.md:s versionsplan. | Instämmer. |
| 5.2 har blivit en säck | 13 öppna i 5.2, varav 10 är översättning (#63, #670–#679). | Instämmer. Se förslag nedan. |

## Var Codex behöver justeras

1. **Fynd 2 (sökningen öppnas med "Försvunna länder") gäller inte en ny besökare.** I en ny webbläsare öppnas Sök och följ med "Alla" och utan aktiv filterrad. Fliken sparas i `localStorage` (`js/ui/focusmenu.js`), så Codex webbläsare mindes ett tidigare val. Det finns ett litet verkligt problem kvar: ett sparat filter följer med till nästa besök. Raden "Filter: …" och knappen för att återställa visas, så det är inte dolt. Låg prioritet; kan lösas genom att bara minnas sorteringen, inte fliken.
2. **Krigsdominansen är mindre än siffran säger.** 438 av 761 händelser har kategorin krig, men 355 av dem är slag inne i ett krig (`partOf`) som bara syns i fokusläget. Av de 406 händelser som syns utzoomat är 83 krig (cirka 20 %), och civilisationer är störst (133). Balansfrågan är ändå verklig: `manniskan` har 1, `natur` 4, `rymden` 3 och `klimat` 5. Den mäts redan med `tools/tackning.py` (täckningsrapporterna 2026-11-05 och 2026-11-06), och perspektivlinserna finns som #384.
3. **Tillgänglighetsflödet i CI (P1.2) finns till stor del redan.** `tests/webblasare.mjs` testar Enter, mellanslag, Escape, fokusåterkomst och reducerad rörelse för Meny, Lager, hjälpen, introduktionen och faktarutan. Det som saknas är 200 % zoom och Sök och följ-panelens fokusåterkomst. Det är ett litet tillägg, inte ett nytt spår.
4. **Delbara länkar (P1.1) är redan byggda** (#64, #501, släppta i v5.0.0): adressen bär år, fokus, lager, filter och kamera, och språket går med `?lang=`. Kvar är att kontrollera att en lärares delade länk öppnar i samma språk, och att skriva lärarbladet (hör till Version 6, #250/#66).
5. **Fynd 3 och 4 har redan issues:** #571 (förenkla kartkontrollerna för nya besökare, `beslut-krävs`), #365 (källkritisk karta) och #613 (fält för historisk osäkerhet, `beslut-krävs`). Fynd 4:s förslag att skilja "källorna är jämförda" från "dateringen är ungefärlig" hänger direkt på beslutet i #613.

## Det Codex inte tog upp

- **Översättningen är den största pågående arbetsmängden** (#63, #670–#679) och bör få en egen milstolpe, så att 5.2 blir bara sök, delning och introduktion (#15, #569, #579).
- **Två beslut blockerar** och bör tas före nya data: #613 (osäkerhet som eget fält) och #630 (världsindelningen för Mikronesien och Rapa Nui).
- **Riken: global täckning** (#644, PR #705 öppen) pågår och är oberoende av stabiliseringen; den kan fortsätta parallellt.
- **Möjligt renderingsfel i mobil:** i den lokala kontrollen syntes en svart rektangel över globen i båda mobilbredderna. Det kan vara headless-webbläsarens mjukvaru-WebGL och inte ett fel på riktiga telefoner. Kontrolleras på riktig mobil vid nästa UX-genomgång innan något issue skapas.

## Gemensam prioritering

### Nu (stabilisering, före nya funktioner)

1. **Nytt issue: Samtidigt-kortets knapprad döljs av tidslinjen i mobil** (bugg, `utseende`, kan få `redo`). Kortets innehåll ska rymmas i halvöppet läge eller kortet ska skjuta upp, och webbläsartestet ska kontrollera att Källor, Nästa och uppspelningsraden inte överlappar i 360×640 och 400×800. Liten–medel. Passar Claude Code eller Codex.
2. **#692 låsning utan grafikkort.** Stor. Claude Code (rendering, Sonnet high).
3. **#702 webbläsartestet i Firefox/WebKit.** Medel. Codex.
4. **Skarp CSP** när produktionens konsol är fri från CSP-varningar för v5.0.0. Liten. Kan bli ett issue med `redo`.

### Nästa

5. **Beslut av Rikard:** #613 och #571 (påverkar Fynd 3 och 4), och #630.
6. **Dela upp 5.2:** flytta översättningsissues till en egen milstolpe "Språk".
7. **Tillägg i webbläsartestet:** 200 % zoom och fokusåterkomst för Sök och följ. Liten. Codex.
8. **Fortsatt översättning** enligt beslutet 2026-11-06 (engelska först) och rikenas täckning (#644–#646), parallellt.

### Sedan

9. **Skolpilot (Version 6):** lärarblad och två elevuppdrag utan konto (#250, #66), testat av en riktig lärare.
10. **Innehållsbalans:** mål per perspektiv och världsdel med `tools/tackning.py` innan fler krig importeras; #384 som grund.

### Bygg inte ännu

Vi instämmer med Codex: inget LMS, inga konton, inga topplistor, ingen djup tid eller temamotor innan stabiliseringen och skolpiloten är klara.

## Efter godkännande

- Skapa issuet om mobilkortet (och CSP-issuet) och sätt `redo` på dem som saknar beslut.
- Sätt `status: triaged` och `triagedAt` i `docs/granskningar/handoff.json` (i PR #703 eller en egen PR).
