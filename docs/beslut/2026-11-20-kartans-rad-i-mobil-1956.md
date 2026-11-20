# Platsens karta: raden om dagens gräns syns också i låg liggande yta (#1956)

**Datum:** 2026-11-20 (resten av #1956 efter utkast-PR #1965; punkt 3, andra riken, hör till #1789 och ingår inte)

## Läget på main före ändringen
DasKrokodil sa ja 2026-11-18: listraden säger "händelser inom dagens gräns" och kortet och Platsens karta får en kort, synlig rad "Dagens gräns, kust och ortnamn" (`place.mapContext`, redan översatt på alla fem språk). Listraden och kortets rad fanns i #1965. Kartans ruta visade raden i bred yta (den långa `regionView.note`) och i stående mobil (den korta `.flat-region-context`, 400 × 800, i Platt karta och på globen). I den låga liggande ytan (högst 480 px hög, till exempel 800 × 360) var båda raderna dolda med avsikt och kortet är hopfällt där (#1952), så ingenting på skärmen sa att gräns och kust är dagens. I 400 × 360 öppnas ingen regionvy (kortets knapp säger Visa på Platt karta, #1692), så där finns ingen ruta.

## Beslut
1. **Den korta raden visas också i den låga liggande ytan**, i Platt karta och på globen. Texten är `place.mapContext` på samma sätt som i stående mobil; den längre kartanteckningen ligger kvar hopfälld i "Om kartan och källor" i kortet och återställs inte.
2. **Rutan blir ett rutnät i den låga liggande ytan** (`display: grid; justify-items: start`) i stället för en flexrad med radbrytning. En flexrad som bryter rad får alltid sin högsta bredd (280 px), eftersom summan av delarna är bredare än så, och rutan täckte en yta som var onödigt stor. Ett rutnät med en kolumn blir lika bred som sin bredaste rad (cirka 200 px på svenska, 240 px på tyska). Resultatet är att den extra raden ryms utan att kartans fria yta minskar: i Platt karta 800 × 360 gick den fria andelen från 44,4 % till 46,5 % (golvet i provet #1952 är 44 %), och på globen 800 × 360 från 51,1 % till 49,9 %.
3. **Ingen ny text, ingen ändring av historiska uppgifter, kartgränser eller urval.** Bara CSS (två regler i `css/style.css`) och provet.

## Varför inte något annat
- *Bara göra den korta raden synlig i flexrutan:* kostade cirka 2 procentenheter fri yta och föll under golvet 44 % i Platt karta 800 × 360 (så föll också första försöket i #1965).
- *Lägga texten bredvid knappen:* utrymmet till höger om Lämna platsens karta rymmer inte engelska, spanska eller franska texten i högst tre rader.
- *Sänka golvet i #1952:* provet får inte försvagas.
- *Låta rutan släppa igenom tryck (`pointer-events: none`) för att mätningen ska bli grön:* skulle ändra hur kartan känns utan att ge besökaren något.

## Prov
Kontrollen "regionvyn: dagens gräns, kust och ortnamn sägs synligt … (#1956)" i `tests/webblasare.mjs` (ligger kvar i samma CI-jobb som förut). Den läser texten ur språkfilerna och mäter i Platt karta 400 × 800 och 800 × 360 på alla fem språk och 1280 × 800, och på globen 1280 × 800, 400 × 800 och 800 × 360 (svenska och franska): att kortets rad och kartans rad syns och ryms, att inget annat element ligger över kartans rad (fem punkter), att raden inte överlappar någon knapp och att rutan inte trycker mot knapparna. Utan CSS-ändringen faller kontrollen i Platt karta 800 × 360 ("kartans rad om dagens gräns syns inte"). `geograf` har inte granskat ordvalet i den här omgången eftersom ingen ny text tillkommit; texten är den som #1965 införde.
