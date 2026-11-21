# Lektionens slut: uppdragslänken syns helt, sista steget får Klar och frågan förklarar vyn (#1861)

**Datum:** 2026-11-17

Fynd 2.6 i [baslinjegenomgången](../ux-review/2026-11-16-baslinje-per-yta.md) (#1799). Ett fel utan beslutsfråga: rättningen står i issuet. Följer på [turkortet (#1866)](2026-11-16-turkortet-1866.md), vars rullning och slutkort för turer är oförändrade.

## Beslut

1. **Uppdragslänken syns helt.** Blocket "Fortsätt med ett uppdrag" (`#tour-lesson-end`) flyttas i lektionens sista steg in i kortets fasta rad (`#tour-bar`), ovanför Föregående och Klar. Där kan varken foten eller raden "Fortsätt läsa" ligga över länken, och den rullar inte bort. Kortets rullning är som förut: ett nytt steg börjar överst (#1856). I låg skärm (högst 600 px hög, till exempel liggande telefon, 800 × 360) tar en fast rad för mycket av det som går att läsa, så där står blocket kvar i det som rullar (flytten görs av `LessonMode.placeEnd()` efter skärmens höjd). Etiketten är 12 px (var 11) och länken har träffyta på 44 px i mobil.
2. **Sista steget får Klar.** Knappen Nästa göms inte längre i lektionens sista steg utan heter Klar, som i turer (samma text ur `data/turer/index.json`, ingen ny översättning). Klar gör samma sak som "Lämna lektionen" i bandet: läraren lämnar direkt och eleven får frågan (#1572). Tangentbordet når den (Tab från Föregående), och Stanna kvar ger fokus tillbaka till Klar. Lektionens slutkort är oförändrat i innehåll: uppdragslänkarna står kvar och "Lämna lektionen" finns kvar i bandet. Skärmläsarens besked i sista steget nämner båda knapparna (`lesson.endAnnounce`).
3. **Frågan förklarar vyn.** Frågan "Lämna lektionen? Då visas hela globen." får en andra mening (`lesson.confirmView`): "Året står kvar, men globens vy och lagren går tillbaka till hur de stod innan lektionen." Det är vad lägeskontraktet redan gör (`MODE_RULES.lektion.restore`: lager, kamera och vyns urval, inte fokus). Meningen har inget tilltal, så den är densamma för elever i alla åldrar. Frågans text är 12 px i mobil (var 11) och menyraden under frågan följer dess verkliga höjd (`--lesson-confirm-h`), eftersom tyska och andra språk tar fler rader.

## Varför

På 400 px låg länken till uppdraget halvt under den fasta foten och raden Fortsätt läsa, och eleven hade ingen tydlig knapp för att säga att lektionen var slut: enda utgången var "Lämna lektionen" högst upp, som lät som att avbryta. Efter utgången hoppade globen tillbaka utan förklaring.

## Följer av beslutet

- Webbläsartestet hade ett prov som krävde att Klar saknades i lektionens sista steg ("det finns ingen Klar-knapp som tömmer läget"). Det är ersatt: Klar finns, men den tömmer inte läget på egen hand (eleven får frågan), och det provas i den nya kontrollen (#1861).
- Uppdrag utan lektion (jakten från För lärare) rörs inte.
