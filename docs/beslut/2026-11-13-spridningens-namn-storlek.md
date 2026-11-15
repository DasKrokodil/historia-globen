# Människans spridning: namnen följer rikenas storleksregel, och "tolkning" syns alltid

**Datum:** 2026-11-13 (DasKrokodil i #1416, efter UX-granskningen av #1094 i #1412)

## Beslut
1. Namnen på lagret Människans spridning ("Neandertalare", "Homo sapiens i Afrika" och så vidare) följer samma storleksregel som rikenas namn: `labels.scale` från `nameStyle()` i `js/controllers/render.js`, med samma grundstorlek som rikenas namn i `js/layers/areas.js` (16 vid 2048 px bredd).
2. Ordet under namnet, "tolkning" eller "hypotes", ritas alltid, även när namnet inte får plats. Det har samma storlek som namnet, i kursiv, eftersom det är det som skiljer en tolkad yta från en gräns.

## Varför
Namnen ritades med 13 px och ordet med 10,5 px vid 2048 px bredd och gick inte att läsa i Platt vy och på klotet i 400 px bredd. Samma regel som rikenas namn är minst arbete, ger ett enhetligt utseende och kräver ingen ny teknik (rekommendationen på #1416, som DasKrokodil sa ja till).

## Följd
Rikenas regel håller namnens storlek på skärmen ungefär stilla när man zoomar: namnen krymper på lagerbilden när man zoomar in. I Platt vy och på klotet i utzoomat läge blir namnen därför större än förut, men på klotet inzoomat i mobil blir de något mindre än förut, lika stora som rikenas namn. Räcker det inte är nästa steg en minsta storlek i skärmpixlar för alla namn på lagerbilden, inte bara för spridningen.

## Berör
`js/layers/spread.js` (`drawLabels`, `labelScale`), #1416, #1094, #1412.
