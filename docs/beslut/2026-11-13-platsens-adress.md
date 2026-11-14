# Platsens adress: behåll `f=place:<id>` (#1162)

**Datum:** 2026-11-13 (DasKrokodil sa ja i #1162)

## Beslut
En plats står i adressen som `f=place:<id>`, i samma fokusfält som krig, riken, religioner, resor och teman. Det ersätter det som sades 2026-11-10 om ett eget adressfält för platsen (beslutet var `r=<id>`). Ingen ny adresssyntax införs och `js/url-state.js` ändras inte.

Målet från 2026-11-10 gäller oförändrat: Dela ger en länk som startar rätt plats, och Bakåt/Framåt går mellan vyer och platser.

## Varför
En plats är ett fokus som alla andra (`place` i `FOCUS_TYPES`, posten `js/focus/place.js`, #579). Ett eget fält skulle ge två adressformer för samma sak: länkar, historik och länkarkivet (#1326) skulle behöva kunna båda, och ett fokus som byter från en plats till ett krig skulle behöva två fält att skriva och ta bort. Med `f=` följer platsen allt som redan gäller för fokus: en länk med ett okänt id ger ett lugnt besked, en nyare länk går före en plats som laddas (biljetten, #865), och `y2` och `f` i samma länk betyder fokus (adressen stänger intervallet före Fokus).

## Kontrollen som gjordes
Dela, Bakåt/Framåt och en delad länk kontrollerades i dator och mobil (400 px), med och utan tidsintervall (#755) och med en plats som saknas eller är utkast, och kontrollerna är nu med i `tests/webblasare.mjs` ("platsens adress"). Det gav två rättningar i `js/controllers/focus.js` och `js/controllers/address.js`:
- Beskedet "Platsen är inte tillgänglig" visades även när en nyare länk redan hade tagit över medan platsen laddades (biljetten kontrollerades först efter beskedet). Nu visas det bara om biljetten gäller.
- Beskedet låg kvar när besökaren öppnade en annan länk eller gick Bakåt eller Framåt. Nu hör det till länken som gav det: varje ny adress tar bort det, och `startFocus` visar det igen om den nya länken också pekar på något som saknas.

## Berör
`docs/arkitektur.md` (adressformatet och ordningen i `startFocus`), `js/controllers/focus.js`, `js/controllers/address.js`, `js/main.js`, `tests/webblasare.mjs`. Issues #1162, #579, #501, #865, #755, #1324 (adressens felkanal, samma fil). Beslut [2026-11-05-adress-501.md](2026-11-05-adress-501.md) och [2026-11-10-platser-och-typ-i-data.md](2026-11-10-platser-och-typ-i-data.md).
