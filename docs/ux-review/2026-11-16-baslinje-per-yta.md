# Baslinjegenomgång per yta (2026-11-16, #1799)

Första genomgången enligt [beslutet 2026-11-16](../beslut/2026-11-16-ux-genomgang-per-yta-1799.md): agenten `ux-tillganglighet` gick igenom varje yta som en besökares uppgift med de fem frågorna (1 Förväntan, 2 Först, 3 Ointressant, 4 Tillstånd, 5 Läsbarhet och mobil). Gren `claude/dreamy-edison-q4zf20` (commit 70bc635), Chromium via Playwright, dator 1280×800 och mobil 400×800 (touch). Två körningar:

- **Del 1:** platskort, regionvy (glob och Platt vy), händelsekort, rikeskort, religionskort, krigets berättelse- och slutkort.
- **Del 2:** Samtidigt-listan och -kortet, turkort (tio turer), lektionsläget, Lager, Sök och följ, Källor, Hjälp, introduktionen.

Inget horisontellt rullningsfel och inga konsolfel i någon yta. Skärmbilderna ligger i sessionens arbetsmapp, inte i repot; de tas om för de issues som kräver ett beslut. Inga repofiler ändrades av agenten. Det som kräver DasKrokodils ja är markerat **Beslut**; resten är fel som rättas enligt vanliga regler. Issuenumren står sist i varje fynd när de finns.

## Del 1: kort och regionvy

| Nr | Allvar | Yta | Fynd |
|---|---|---|---|
| 1.1 | Viktigt | Regionvyn | Året styr inte regionvyn: alla 21 händelser i Skåne syns som markörer och i listan även år 7010 f.Kr. och 2000, trots raden "visar 270 år före och efter". Aotearoa vid 33 000 f.Kr. visar ingen markör men ingen förklaring. **Beslut** (vad en regionvy är). Hör ihop med #1786. |
| 1.2 | Viktigt | Platskort, regionvy | "Visa händelserna på kartan" för Skåne byter från Glob till Platt karta utan att säga det, och "Lämna regionvyn" går inte tillbaka till globen. Aotearoa och Grönland flyger in på globen, så samma knapp ger två sorters resultat. **Beslut** (knapptext och återgång). |
| 1.3 | Viktigt | Regionvyn, mobil | Enskilda markörer är 24×24 px, högar 30×30 och brickan 30 px hög (krav 44 px). Tas upp i #1713 (träffytor). |
| 1.4 | Viktigt | Regionvyn, mobil | När händelsekortet öppnas hamnar markören under zoomknapparna (hög ×16 vid (342,153), under "−"), och brickan "Hela Skåne" under "+". Man ser inte vilken markör kortet hör till. |
| 1.5 | Viktigt | Samtidigt-panelen | Panelen öppnas bakom platskortet och regionvyn: på dator syns bara en kant, på mobil ligger den över arkets knopp. **Beslut** om kortet ska stängas (stängregistret, #894). |
| 1.6 | Viktigt | Krigets slutkort, dator | Kortet ligger under knapparna överst (top 79 mot knapprad y 25–112) och rubriken skyms, när raden "Tiden flyttades" syns: höjdtaket räknar inte med pausraden. Mobil är ok. Ej provat med riktig uppspelning till slutet. |
| 1.7 | Viktigt | Rike och krig | Raden "Tiden flyttades till …" kan säga fel år: `#y=1950&f=empire:khmerriket` säger "flyttades till 800" medan året står på 1867 och knappen är "Spela igen". Samma gamla rad finns kvar efter krigets slutkort. |
| 1.8 | Viktigt | Platskort, långt spann | Aotearoa vid 33 000 f.Kr.: ingen markör, ingen "Tiden flyttades"-rad (spannet börjar 62 050 f.Kr.), Samtidigt 0, och inget säger när nästa händelse är. Skåne vid 30 000 f.Kr. fungerar. **Beslut** (hoppa i glapp?). Hör ihop med #1786. |
| 1.9 | Viktigt | Alla kort, mobil | Stäng-knappen är 30×30 px, "i" 24×24, "Rapportera faktafel" 32 px, kategorinoterna 24 px. Tas upp i #1713. |
| 1.10 | Önskvärt | Platskort, mobil | Första skärmen fylls av typ, namn, vapen, kredit och fyra rader text; "Visa händelserna på kartan" är avskuren och listan ligger bortom skärmen. Kreditraden för CC BY-SA måste stå kvar men kan vara en rad. |
| 1.11 | Önskvärt | Händelsekort | "Källorna skiljer sig" är en egen rutten fällbar rad ovanför "Källor och osäkerhet". **Beslut:** lägg konflikten inuti den raden. |
| 1.12 | Önskvärt | Rikes- och religionskort | Kortet är tidlöst medan året styr allt: ingen rad om rikets eller religionens läge det år man står på (yta 398 000 km² år 1113 ligger i en hopfälld rad). **Beslut:** en rad "År 1113: …" överst. |
| 1.13 | Önskvärt | Teckenförklaringen | Rutan för Riken, Religioner och Krigsområden står uppfälld med fyra till sex rader över västra delen av globen (dator) och tipset "Klicka på ett färgat område" står öppet över Asien (mobil). |
| 1.14 | Önskvärt | Krigets slutkort | "▶ Fortsätt" i fokusraden och "↻ Spela igen" i pausraden står samtidigt (nåddes via adress, ej provat i naturlig uppspelning). |
| 1.15 | Önskvärt | Fokusraden, mobil | Namnet på det man följer klipps ("Khmerrike…", "Nya Zeeland (Aotear…"). Händelsekortets bild syns inte i halvt ark (troligen avsiktligt, #1582). Knappen "Affisch" är delvis täckt av arket. |
| 1.16 | Önskvärt | Text | Under 12 px: rubriker 10,5–11, kredit 11–11,5, markörernas årsspann 10,5, ytkurvans axlar 9, "Rapportera faktafel" 11,5. Tas upp i #1713. |
| 1.17 | Ej bekräftat | Platt vy | Kusten är suddig i minst 8 s efter "Lämna regionvyn" vid zoom 3,2; kan vara testmiljöns programvaru-WebGL. |

**Fungerade bra:** Skåne vid 30 000 f.Kr. hoppar till 7000 f.Kr. med "Tillbaka till 30 000 f.Kr."; Escape-kedjan i regionvyn (kort, sedan vy); markörens första tryck ger etikett och statusrad, nästa tryck öppnar kortet; krigets bakgrunds- och slutkort i mobil; händelsekort med och utan bild och med osäker datering fungerar som i #1789.

Inte provat: skärmläsare och Tab-ordning utöver Escape, andra språk än svenska, Firefox och WebKit, liggande telefon, 200 % zoom, surfplatta, rikes- och religionskort i Platt vy, Lager mot öppen regionvy, pågående krig ("Läget i dag").

## Del 2: Samtidigt, turer, lektion, övrigt

| Nr | Allvar | Yta | Fynd |
|---|---|---|---|
| 2.1 | Viktigt | Turkort | Kortets rullning nollställs inte vid stegbyte: efter Nästa ligger kortet 183 px (dator) och 198 px (mobil) nedrullat, efter Föregående 229 och 258 px, så rubrik och bild hamnar ovanför synfältet. |
| 2.2 | Viktigt | Turkort | Svaret ligger under vecket och inget visar att kortet rullar. Kinesiska muren: kortet 462 px (dator) och 426 px (mobil), fast fot 104 px, bilden cirka 190 px (cirka 135 px mobil), kvar för text 1–2 rader. "Det sägs" syns avklippt, "Vad källorna säger" och svaret ligger under. Washington och Pompeji skär av svaret mitt i en mening bakom Nästa; `moai` skär av länkraden. Ingen tonad kant eller rullningssignal. **Beslut** (bild före text eller kollapsande bild, utseende). |
| 2.3 | Viktigt | Källor | Källor-länken leder till reglerna ("Så läser du statusen", källpolicy), inte till källorna: registret börjar 1365 px ner (sidan 4307 px i mobil). Överst står "Källor för den här fun facten", även från ett turkort. Texten är ett fel. **Beslut** om ordningen (jfr #1789). |
| 2.4 | Viktigt | Samtidigt-kortet, mobil | "Fun facten: källkontrollerad" flödar över länken "Källor"; "Källor", "Nästa" och "Visste du?" är 34×24 px; metaraden har radhöjd 11 px på 11 px text och "1 AV 4" delas till "1 AV / 4"; chipsen är 34 px höga. |
| 2.5 | Viktigt | Samtidigt under tur | Panelen öppnas ovanpå turkortet (mobil y 52–301 över kortet y 176–604) med "Händelselagret är avstängt. Slå på Händelser", vars åtgärd slår på lager mitt i en tur där #1784 släckt dem. **Beslut** (ska Samtidigt finnas under en tur?). |
| 2.6 | Viktigt | Lektionsläget, mobil | Sista steget har ingen Klar-knapp; länken "Samtidighetsjakten: omkring år 1000" är halvt dold under den fasta foten; enda utgången är "Lämna lektionen" överst; efter den återställs kameran utan förklaring. |
| 2.7 | Viktigt | Samtidigt-listan, tom | Samma mening står två gånger ("Inget ur Översikt inom ±12 000 år från 95 000 f.Kr.. …"), med dubbel punkt; vid kategorifilter skuldbeläggs Översikt i stället för filtret och det finns ingen knapp som rensar det. |
| 2.8 | Viktigt | Samtidigt | Två saker heter "Samtidigt" men räknar olika: knappen visar 6 (pågående), kortet "1 av 4" och fliken "Samtidigt 4" (år 1325); år 491 f.Kr. visar knappen 4 och kortet ett faktum. **Beslut** (namn och räkning). |
| 2.9 | Viktigt | Första synfältet, mobil och dator | Samtidigt-kortet täcker cirka 270 px av 800 vid start i mobil (globen i en remsa) och hela västra halvan av klotet på dator. **Beslut** (startläge stängt eller litet). |
| 2.10 | Önskvärt | Lager | Mobilmenyn ligger på x=2 (övriga x=14–16) och fyller höjden; "Fler val" täcker tidslinjens högra halva på dator; "Vilket rike?" är ett outtalat namn; titeln "Vad vill du se på kartan?" skiljer sig från knappen "Lager"; checkrutor 16×16. |
| 2.11 | Önskvärt | Samtidigt-listan | Flikar 36 px och sidledes rullning utan signal (Oceanien halvt utanför); listan får cirka 230 px av 800 i mobil; "Visa alla" 49×24. |
| 2.12 | Önskvärt | Samtidigt-kortet, mobil | Det stängda kortets status tittar fram under kanten; ingen "–" i mobil, stängt läge nås via handtaget och piltangenter (ej provat med dragning). |
| 2.13 | Önskvärt | Turkort | "Klar" ligger cirka 100 px under "Nästa" och "Lämna turen" försvinner på sista steget; turnamnet står både i kortet och i raden under på dator; fotokrediten 11,5 px och bildlänken öppnar `.webp`-filen, inte Commons-sidan; tyst slut ("Turen är slut …") utan sammanfattning och med Samtidigt-kortet direkt igen (**Beslut**); att följa ett krig under en tur avslutar turen utan besked. |
| 2.14 | Önskvärt | Teckenförklaringen (tidslinjen) | Ligger 4 px under skärmkanten i mobil i tur och lektion; på dator krockar fokustexten "Här är en tiondel av tidslinjen" med "Dra här för att byta år". Se även #1713 punkt 6. |
| 2.15 | Önskvärt | Introduktionen | Steg 1 ber om "en händelse på globen" men globen är nedtonad; tiden flyttas till 1889 utan förvarning (först steg 3 säger det); Stäng 30×30, Tillbaka 45×24. |
| 2.16 | Önskvärt | Hjälp | Kortet saknar `role="dialog"` (samma som #1713 punkt 3); länkarna 24 px, stäng 30×30; fjärde steget är en lång mening. |
| 2.17 | Önskvärt | Källor | Sidan säger "Uppgifter som Claude föreslår är utkast …", alltså ett verktygsnamn i en publik text; 3 555 länkar i dialogen och 4 300 px sida i mobil. |
| 2.18 | Önskvärt | Sök och följ, mobil | Kontrollerna tar cirka 340 px före första resultatet; "Fönstret är bredare än det globen visar" är intern jargong. Tomt resultat och träff är tydliga. |
| 2.19 | Önskvärt | Språkbyte i tur | Fungerar (Sie, vous). Raden "Die Übersetzung ist in Arbeit" täcker en stund toppen av tur- och årsrutan. |
| 2.20 | Ej bekräftat | Första mobilfönstret | En mörk rektangel över globen (y 75–370) syns i första mobilfönstret men inte när kortet dras upp eller är stängt; kan vara ett renderingsfel i headless-läge. Bör kontrolleras på en riktig enhet. |

Inte provat: dragning av kortens ark med riktig touch, Samtidigt-kortet för krig, rike och religion, Platt vy med kortet, lugn rörelse, riktig skärmläsare, lektionsläge med `r=lararen` och utskriftsknappen, surfplatta, quiz, jakt och Inställningar, språkbyte på Samtidigt-kortet, Lager och Källor, laddning och felreserver.

## Vad genomgången lärde oss (till loggen och frågorna)

- **Kort som rullar** missades av alla tidigare granskningar. Fråga 2 ska också fråga *vilken text som syns utan rullning och om något visar att det finns mer*, och fråga 4 *om rullningen nollställs när innehållet byts* (2.1, 2.2).
- **Tillstånd mellan lägen** (ett kort eller en panel öppnas medan ett annat läge pågår) gav sex fynd: 1.2, 1.5, 2.5, 2.13 (följa krig i tur), 1.14 och 2.12. Fråga 4 ska alltid prova "öppna en annan yta medan den här är öppen".
- **Siffror med samma namn** (2.8) hittas bara genom att jämföra vad två ytor säger om samma sak; fråga 3 ska också fråga *om två ytor använder samma ord för olika saker*.
- **Träffytor och text under 12 px** är redan känt (#1713) men mättes nu på fler ytor; bäst att rätta i ett samlat pass.

## Hur fynden blev issues

Se de nya issues som nämns i kommentaren på #1799. Fynd som rör träffytor och text under 12 px (1.3, 1.9, 1.16, 2.4, 2.11, 2.15, 2.16) läggs som kommentar på #1713 i stället för egna issues.
