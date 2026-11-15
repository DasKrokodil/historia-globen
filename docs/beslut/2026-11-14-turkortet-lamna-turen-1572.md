# Turkortet: en tydlig utgång, "Lämna turen" (#1572, alternativ A)

**Datum:** 2026-11-14 (DasKrokodil valde det rekommenderade alternativet A i #1572)

## Beslut
- Turkortet stannar nere till vänster (där Samtidigt-kortet brukar stå, så att mitten och markören är fria och faktarutan äger högersidan).
- Kortet får en **fot** med en benämnd länk **"Lämna turen"** (minst 44 px hög; fast längst ned när kortet rullar). Kryssknappen och pillerknappen "Avsluta turen" bredvid Nästa tas bort, så att Nästa står ensam och på samma plats i varje steg och det inte finns tre knappar som gör samma sak. Escape med fokus i kortet lämnar fortfarande turen i en vanlig tur.
- **Efter utgången** visas en rad på samma plats som beskedet om en trasig länk (`link-notice`): "Turen är slut. Du står kvar på år …" med knappen "Starta om turen". Raden visas inte när ett annat läge tog över (till exempel Fokus) eller efter en lektion, och försvinner efter 20 s, vid Stäng eller vid nästa handling.
- I lektionsläget heter bandets knapp **"Lämna lektionen"** (var "Visa hela globen"), eftersom den gör att lektionen tar slut. Etiketten för turens utgång (`end` i `data/turer/index.json`) är "Lämna turen".

## Inte gjort här (kvar i #1572)
- Eleven i en lektion ska få ett bekräftelsesteg ("Lämna lektionen? Du kommer till hela globen.") medan läraren lämnar direkt. Det kräver ändringar i många av lektionskontrollerna och görs i en egen omgång.
- Lektionsläget skalas för projektor (text 15–22 px och kort 480 px från 1600 px).
- Turraden under kortet ("Turen: … · Turen styr tiden") är kvar; den slogs inte ihop med kortets fot.
- Mobil: faktarutan täcker turkortet inklusive Nästa när man trycker "Läs om händelsen" (#1582).

## Berör
`index.html` (kortets fot, kryssknappen dold, åtgärdsknapp i `link-notice`), `js/ui/tour.js` (`end`), `js/controllers/link-notice.js` (`showText` tar en åtgärd), `js/main.js` (turspelaren når `linkNotice`), `css/style.css` (`.tour-foot`, `.tour-end`), `data/turer/index.json` (`labels.end`), `data/ui/*.json` (`tour.left`, `tour.restart`, `lesson.exit`), `tests/webblasare.mjs`.
