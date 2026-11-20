# Platskortet: liten flagga bredvid namnet och kartknappen före inledningen i smal skärm (#1977)

**Datum:** 2026-11-20 (del 1 av #1789; DasKrokodil svarade "Gör enligt rekommendationer" 2026-11-19)

## Läget på main före ändringen
Ordningen knapp, händelselista, riken, hopfälld rad Om kartan och källor och sist länken Sluta följa platsen, fokusknappen Om platsen och att knappen göms i platsens karta fanns redan (#1790, #1791, #1948, #1956). Det som återstod är detta beslut.

## Beslut
1. **Flaggan och vapnet är små (24 px) på namnets rad**, i en rubrikrad (`.place-head`) bredvid `h3`, inte i ett eget block med bildtext under inledningen. Bilden är ingen del av rubriken: `h3` har bara namnet, så rubrikens namn för skärmläsare och rubriken som läses upp (`main.js`) är oförändrade. Bildens `alt` är bildtexten, som förut.
2. **Krediter efter licens, läst ur varje emblem i `data/platser.json`:** en bild vars licens kräver namnuppgift (CC BY, CC BY-SA, i dag Skånes landskapsvapen, CC BY-SA 2.5) får en kort kreditrad direkt under namnet (`.place-emblem-credit`). Övriga (public domain) har ingen rad vid bilden; bildtext, upphovsperson och licens ligger i den hopfällda raden Om kartan och källor, som förut. Inget har tagits bort ur sidan.
3. **Kartknappen före inledningen i smal skärm (högst 760 px)**, med samma CSS-`order` som redan gällde i låg yta (#1693): markupen och tangentbordsordningen är oförändrade, bara bilden byter plats. Skälet är UX-genomgången #1853, fynd 2.2: i det halva arket låg knappen efter inledningen och nådde man inte utan att dra upp arket, och en längre text på tyska eller franska hade skjutit den under arkets nederkant. På bred skärm ligger knappen efter inledningen som förut.
4. **Inga nya gränssnittstexter**, så `data/ui/` är oförändrad på alla fem språk.

## Prov
Kontrollen "platskortet: listan före anteckningarna … (#1790, #1791); liten flagga bredvid namnet och knappen i halva arket (#1977)" och kontrollen "platskortets flagga och vapen laddas med bildtext" i `tests/webblasare.mjs` (dator och mobil): flaggan 20–28 px på namnets rad, kreditraden under namnet för vapnet och inte i Om kartan och källor, knappen före inledningen i smal skärm och inom arkets synliga yta, fällraderna som `details` med minst 44 px hög `summary` i mobil.
